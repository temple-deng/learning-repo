# Yeoman Generator

## Getting Started

###  Organizing your generator   

generator 本质上还是一个 Node.js 模块。   

首先创建文件夹，名字必须为 `generator-name`，因为 Yeoman 依赖于文件系统来寻找可用的 generator。   

之后的过程就很明确了，首先要创建 `package.json` 文件。    

```json
{
  "name": "generator-name",
  "version": "0.1.0",
  "description": "",
  "files": [
    "generators"
  ],
  "keywords": ["yeoman-generator"],
  "dependencies": {
    "yeoman-generator": "^1.0.0"
  }
}
```   

`name` 属性值的前缀必须是 `generator-`。`keywords` 属性必须包含 `"yeoman-generator"`（我觉得
这个应该是方便 yeoman 网站索引吧）。    

必须将最新版的 `yeoman-generator` 声明成依赖。    

`files` 必须是一个目录及文件的数组，包含generator 使用的文件。    

Yeoman 是与文件系统及我们组织目录树的结构紧密相连的。    

当我们使用 `yo name` 时生成的默认的 generator 叫做 `app` generator。 其必须包含在 `app/` 目录下。    

当我们调用 `yo name:subcommand` 会生成子generator，其会存储在名字与子命令相同的目录内。    

```
├───package.json
└───generators/
    ├───app/
    │   └───index.js
    └───router/
        └───index.js
```    

上图的生成器会暴露出 `yo name` 和 `yo name:router` 两个命令。    

Yeoman 运行两种不同的目录结构来组织 generator 代码。分别是在当前目录 `./` 及 `generators/` 目录下
注册可用的 generators。    

所以前面的例子也可以写为：   

```
├───package.json
├───app/
│   └───index.js
└───router/
    └───index.js
```    

如果使用第二种结构，必须在 `package.json` 文件的 `files` 字段中指向 generator 文件夹所在
的位置。（仔细看第一种写法是在最开始的 `package.json` 文件中声明了 `generators` 的值）    

```json
{
  "files": [
    "app",
    "router"
  ]
}
```   

所以目前就比较明朗了，`files` 属性声明了默认的 generator 及子 generator 所需的代码的位置。    

### Extending generator

一旦我们组织好目录结构以后，就可以写实际的代码了。   

我们可以通过扩展 Yeoman 提供的一个基础的 generator 来实现 generator 的行为。这个基础的
generator 可以提供绝大部分我们需要的功能。    

在 generator 的 index.js 文件中，按照如下的写法继承 generator:   

```javascript
var Generator = require('yeoman-generator');

// 这个貌似是匿名 class 的写法
module.exports = class extends Generator {};
```   

如果需要支持 ES5 环境的话，需要使用静态方法 `Generator.extend()` 来继承基类，并提供新的原型。   

`var MyGenerator = Generator.extend()` 应该是这样的写法，这是我猜的。    

#### 重载构造函数

一些 generator 方法只能在构造函数 `constructor` 中调用。   

下面是一个可能的 constructor 的写法：   

```javascript
module.exports = class extends Generator {
  // The name `constructor` is important here
  constructor(args, opts) {
    // Calling the super constructor is important so our generator is correctly set up
    super(args, opts);

    // Next, add your custom code
    this.option('babel'); // This method adds support for a `--babel` flag
  }
};
```   

#### 添加自己的函数功能

每个添加在原型上的方法会在 generator 被调用时立即运行，通常来说是按照顺序执行的。不过，也有
一些特定名字的方法可能不按照默认的顺序。   

```javascript
module.exports = class extends Generator {
  method1() {
    this.log('method 1 just ran');
  }

  method2() {
    this.log('method 2 just ran');
  }
};
```    

### Running the generator

由于现在还是一个本地模块，所以现在需要使用 npm 来创建符号连接到这个模块：   

在 generator 项目的根目录（就是 `generator-name`/ 目录），执行：   

`npm link`    

这一步应该是让我们的模块连接成一个全局模块。之后我们就可以调用 `yo name`，按照上面的 generator，
这时就会运行 `method1(), method2()`，并在命令行输出内容。    

#### Finding the project root

在运行 generator 时，Yeoman 会尝试在其运行的文件夹的上下文中寻找一些东西。（这个文件夹应该是我们执行
`yo name` 时的 cwd 吧，这个与 generator 模块的文件夹没关系）    

最主要的是，Yeoman 会在目录树中寻找 `.yo-rc.json` 文件。如果找到了，就会将这个文件所在的目录
当做是项目的根目录。然后会将当前目录变为这个项目根目录来运行 generator。     

## Running Context

### Prototype methods as actions

每个直接绑定在 Generator 原型上的方法都被当做是一个任务 task。每个 task 会被 Yeoman
environment run loop 按序执行。    

换句话说，在 `Object.getPrototypeOf(Generator)` 返回对象上的每个函数都会自动执行。    

#### Helper and private methods  

那么现在问题就来了，我们之前的代码时绑定在自己 generator 的 prototype 属性上，并非绑定
在 Generator 的原型上啊，这里感觉文档说的有问题啊，但是只能按照文档的来理解了。    

由于直接绑定在原型上的方法被视作 task 且会自动运行，我们可能有时会想要定义一些不会自动运行的
私有或者助手方法。有下面3种方式可以实现这个目标：   

1. 在方法名前缀下划线`_private_method`  

```javascript
class extends Generator {
  method1() {
    console.log('hey 1');
  }

  _private_method() {
    console.log('private hey');
  }
}
```    

2. 使用实例方法：   

```javascript
class extends Generator {
  constructor(args, opts) {
    // Calling the super constructor is important so our generator is correctly set up
    super(args, opts)

    this.helperMethod = function () {
      console.log('won\'t be called automatically');
    };
  }
}
```   

3. 继承一个父级 generator:   

```javascript
class MyBase extends Generator {
  helper() {
    console.log('methods on the parent generator won\'t be called automatically');
  }
}

module.exports = class extends MyBase {
  exec() {
    this.helper();
  }
};
```   

所以从最后一个看出，应该是绑定在最终返回的 generator 类的原型上的方法才被当做 task 吧。   

### Run loop  

当只有一个 generator 时按序执行 tasks 是没有问题，但是如果将 generators 组合到一起，就可能
出现一些问题。    

所以 Yeoman 使用了 run loop。run loop 是一个支持优先级的队列系统。   

优先级是通过定义的特殊的方法名定义的。当一个方法名是与一个优先级名字一致时，run loop 就会将
这个方法推入到特殊的队列中。如果方法名不匹配特殊的优先级名，就推入 `default` 组中。    

```javascript
class extends Generator {
  priorityName() {}
}
```   

You can also group multiple methods to be run together in a queue by using a hash instead of a single method:  

```javascript
Generator.extend({
  priorityName: {
    method() {},
    method2() {}
  }
});
```   

可用的优先级有（按照执行顺序排列）：   

1. `initializing` - 初始化方法（检查当前项目状态，获取配置等）
2. `prompting` - 在这一步可以咨询用户提供一些配置选项(在这一步调用 `this.prompt()`)
3. `configuring` - 保存配置并且配置整个项目（创建 `.editorconfig` 文件及其他元数据文件）
4. `default` - 上面提到的 `default` 组，当方法名不匹配优先级时，就在这个组里
5. `writing` - 这一步用来写 generator 特定的文件（路由，controller 等）
6. `conflicts` - 这一步解决冲突(内部使用)
7. `install` - 运行安装步骤(npm ,bower)
8. `end` - 最后调用，完成清理工作等   

### Asynchronous tasks

有多种方式可以暂停 run loop ，直到一个执行异步任务的 task 完成工作。   

最简单的方式是返回 Promise。loop 会在 promise resolve 时继续，或者当 reject 时停止工作。   

或者使用遗留下来的 `this.async()`。这个方法会返回一个函数，在 task 完成时立即调用。   

```javascript
asyncTask() {
  var done = this.async();

  getUserEmail(function (err, name) {
    done(err);
  });
}
```   

老实说，其实没看懂这个。    

## User Interactions

#### Prompts

Prompt 是 generator 与用户交互的主要方式。prompt 模块由 inquires.js 提供。    

`prompt`方法是异步的，返回一个 promise。我们需要在 task 中返回这个 promise。以便后面的 task
可以按照正常的顺序执行：    

```javascript
module.exports = class extends Generator {
  prompting() {
    return this.prompt([{
      type    : 'input',
      name    : 'name',
      message : 'Your project name',
      default : this.appname // Default to current folder name
    }, {
      type    : 'confirm',
      name    : 'cool',
      message : 'Would you like to enable the Cool feature?'
    }]).then((answers) => {
      this.log('app name', answers.name);
      this.log('cool feature', answers.cool);
    });
  }
};
```    

#### Remembering user preferences

用户可能在每次运行 generator 时针对一系列问题给出同样的输入。针对这些问题，可以保存下面用户的
输入，并且在将来让这些答案作为新的 `default`。   

Yeoman 扩展了 inquirer.js 的API，添加了一个 `store` 属性在问题对象上。This property allows you to specify that the user provided answer should be used as the default answer in the future       

```javascript
this.prompt({
  type    : 'input',
  name    : 'username',
  message : 'What\'s your GitHub username',
  store   : true
});
```   


#### 参数

`yo webapp my-project`   

使用 `this.argument()` 方法提示系统我们需要参数，这个方法介绍一个 `name`(String)以及一个
可选的 options 的 hash 做参数。   

`name` 参数之后在 `this.options[name]` 上可用。   

options hash 接受下面的键值对（说白了hash就是对象呗）：   

+ `desc` - 参数的描述
+ `required` - 布尔值表明是否必须
+ `type` - String, Array, Number(也可能是定制的函数)
+ `default` - 这个参数的默认值   

这个方法必须在构造函数内调用。    

```javascript
module.exports = class extends Generator {
  // note: arguments and options should be defined in the constructor.
  constructor(args, opts) {
    super(args, opts);

    // This makes `appname` a required argument.
    this.argument('appname', { type: String, required: true });

    // And you can then access it later; e.g.
    this.log(this.options.appname);
  }
};
```   

#### Options

options 看起来和参数 arguments 类似，不过其写法如下：   

`yo webapp --coffee`   

为了提醒系统我们需要 option，需要使用 `generator.option()`方法（然而下面的例子中用的是 `this.option()`）
同上，也接受 name 及 options hash 做参数。   

`name` 可以之后在 `generator.options[name]` 上得到（然而下面还是在 `this.options[name]`）。注意
上面的 arguments 及这里的 options 都是从 `this.options[name]` 上检出的。   

这个方法应该也是只能在构造函数中调用，这点文档忘说了。   

options hash 接受下面的键值对：   

+ `desc` - option 的描述
+ `alias` - 简写名
+ `type` - Boolean, String or Number（或者是定制的函数）
+ `default` -  默认值
+ `hide` - 是否从 help 中隐藏   

```javascript
module.exports = class extends Generator {
  // note: arguments and options should be defined in the constructor.
  constructor(args, opts) {
    super(args, opts);

    // This method adds support for a `--coffee` flag
    this.option('coffee');

    // And you can then access it later; e.g.
    this.scriptSuffix = (this.options.coffee ? ".coffee": ".js");
  }
});
```   

### 输出信息

使用 `generator.log` 模块输出信息。文档里 `generator` 和 `this` 混用，不清楚有什么区别。   

```javascript
module.exports = class extends Generator {
  myAction() {
    this.log('Something has gone wrong!');
  }
};
```   

## Composability

### `generator.composeWith()`

`composeWith()` 方法可以让 generator 去运行另一个 generator（或者子 generator）。   

算了暂时不说了。。。。


## 管理依赖

在运行 generator 后，经常需要运行 npm or Yarn or Bower 来按照依赖。Yeoman 提供了按照的助手函数，
为了 `install` 队列中的一部分会自动按时执行一次。    

### npm  

调用 `generator.npmInstall()` 来执行 npm 按照，Yeoman 会确保 `npm install` 命令只执行一次，
即使其被多个 generators 调用多次。   

```javascript
class extends Generator {
  installingLodash() {
    this.npmInstall(['lodash'], { 'save-dev': true });
  }
}
```   

其他的工具也不说了。    

## Working with the file system  

### Location contexts and paths

Yeoman 文件实用工具是基于我们在硬盘上总有两个位置上下文的这个理念的。这两个上下文作为文件件控制了
generator 可能读取文件及写入文件的位置。   

#### Destination context

目的地是 Yeoman 生成新应用的文件夹的位置。   

目的地上下文是被定义为当前的工作目录或者最近的包含 `.yo-rc.json` 文件的父级文件夹。   

可以使用 `generator.destinationRoot()` 或者使用 `generator.destinationPath('sub/path')` 来连接
路径获取 destination path。    

```javascript
// Given destination root is ~/projects
class extends Generator {
  paths() {
    this.destinationRoot();
    // returns '~/projects'

    this.destinationPath('index.js');
    // returns '~/projects/index.js'
  }
}
```    

可以手动通过 `generator.destinationRoot('new/path')` 设置。`this.contextRoot` 是我们运行 `yo` 命令
的位置。    

### Template context  

template context 是我们存储模板文件的位置。   

默认情况下时 `./templates/`。可以使用 `generator.sourceRoot('new/template/path')` 来
覆盖这个默认属性。   

可以使用 `generator.sourceRoot()` 或者使用 `generator.templatePath('app/index.js')` 连接
路径来获取这个路径值。    

```javascript
class extends Generator {
  paths() {
    this.sourceRoot();
    // returns './templates'

    this.templatePath('index.js');
    // returns './templates/index.js'
  }
};
```     
