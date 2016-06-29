# 编写自己的yeoman generator

标签（空格分隔）： 未分类

---
>  文章参考： https://leozdgao.me/write-yeoman-generator/

---

### 1. 开始
yeoman官方有一个`generator-generator`的模块用来帮助用户生成自己的generator. 使用方式如下:

```shell
install :  npm install -g generator-generator
run : yo generator
```

如果没有使用官方的生成器的话， 需要自己手动搭建目录结构。

**第一步： 新建一个npm 模块**
首先新建一个文件夹， 文件夹的名称必须是 generator-name， name就是自己的生成器的名字， 下面以 generator-temple为例。新建文件夹:

`mkdir generator-temple`  

然后进入文件夹中新建一个package.json文件， 复制粘贴下面的内容到文件中:

```json
// package.json
{
  "name": "generator-name", 
  "version": "0.1.0",
  "description": "",
  "files": [
    "app",
    "router"
  ],
  "keywords": ["yeoman-generator"],
  "dependencies": {
    "yeoman-generator": "^0.20.2"
  }
}
```

注意上面name字段应该改成自己的generator的名字， 且必须以generator-为前缀，本例即generator-temple.
keywords字段数组中必须包含`yeoman-generator`。 同时为了确保依赖的是最新版的yeoman-generator， 因此不推荐想上面一样写死。 而是直接从npm仓库安装:

`npm install --save yeoman-generator`

**继承generator模块**
```javascript
const generators = require('yeoman-generator');

module.exports = generators.Base.extend();
```

**重写constructor构造函数**
当我们想在构造函数中调用一些构造函数无法调用的函数中， 我们可能去重写构造函数:

```javascript
module.exports = generators.Base.extend({
  constructor: function() {
    generators.Base.apply(this, arguments);
    
    this.option('coffee');
  }
);
```

**添加自己的函数**
添加在原型上的每一个函数都会由generator按顺序依次调用， 但是一些特殊的函数名可能会按照不一样的顺序执行。

```javascript
module.exports = generators.Base.extend({
  method1: function () {
    console.log('method 1 just ran');
  },
  method2: function () {
    console.log('method 2 just ran');
  }
});
```

**运行我们的generator**
在根目录下新建一个app文件夹， 在其中新建一个index.js文件， 文件内容如下

```javascript
 // app/index.js
 
 const generators = require('yeoman-generator');

module.exports = generators.Base.extend({
  method1 : function () {
    console.log('method 1 just ran');
  },
  method2 : function () {
    console.log('method 2 just ran');
  }
});
```

在运行前还要执行下面的命令

`npm link` (具体干嘛我也不清楚， 可能是全局调用yo命令时， 需要链接到我们当前目录吧)

然后再根目录下执行下面的命令:

`yo temple`

会看到控制台输出如下

```
method 1 just ran
method 2 just ran
```

这个时候要将一下generator的目录结构， 因为yeoman是和文件系统以及目录结构紧紧相关的， 所以当我们执行 `yo name:subcommand`命令时， 会去package.json中files字段找到对应的subgenerator的位置， 默认`yo name`时， 执行的是`yo name:app`， 所以看到上面执行了app目录下的index.js文件.(只是自己的推测)

### 2. generator运行上下文 generator runtime context
---
**私有函数**
由于我们定义上原型上的每个方法都会被generator按序执行， 因此当我们想要定义一些不会被自动调用的助手函数或者私有函数时， 我们可以按下面方法定义:

1. 为方法名添加下划线前缀
2. 使用实例方法
```javascript
  generators.Base.extend({
    constructor: function () {
      this.helperMethod = function () {
        console.log('won\'t be called automatically');
      };
    }
  });
```
3. 继承一个父级generator
```javascript
var MyBase = generators.Base.extend({
    helper: function () {
      console.log('methods on the parent generator won\'t be called automatically');
    }
  });
  
  module.exports = MyBase.extend({
    exec: function () {
      this.helper();
    }
  });
```


**执行顺序**
前面提到一些特殊命名的方法名可能不会按照顺序依次执行， 这是因为yeoman执行函数的队列系统提供了优先级的支持， 所以如果是以优先级方法命名的函数， 这些函数执行时会进入一个特殊的执行队列， 而其他并非以优先级方法命名的函数， 会进入 defalut 部分。

可选的优先级方法命名有以下几个(按照执行顺序)：

1. initializing - Your initialization methods (checking current project state, getting configs, etc)
2. prompting - Where you prompt users for options (where you'd call this.prompt())
3. configuring - Saving configurations and configure the project (creating .editorconfig files and other metadata files)
4. default - If the method name doesn't match a priority, it will be pushed to this group.
5. writing - Where you write the generator specific files (routes, controllers, etc)
6. conflicts - Where conflicts are handled (used internally)
7. install - Where installation are run (npm, bower)
8. end - Called last, cleanup, say good bye, etc

1. initializing - 初始化方法(检查当前项目状态， 获取配置等等)
2. prompting - 提示用户输入选项(在这里调用 this.prompt())
3. configuring - 保存配置内容并且使用配置内容配置项目(创建 .editorconfig 文件和其他元数据文件等等)
4. defalut = 方法名和优先级方法名不匹配便放入这个部分
5. writing - 写一些特殊的文件
5. conflicts - 如何解决冲突
6. install 执行安装操作(npm , bower)
7. end - 最后调用


### 3. 用户交互
---
**Prompts**
Prompts提示信息是和用户交互的最主要的方式， prompt模块功能由Inquirer.js提供。

`prompt`方法是异步执行的，它返回一个Promise， 我们的任务必须是返回一个Promise， 以便在下一个任务开始前程序处于等待状态。

```javascript
module.exports = generators.Base.extend({
  prompting: function () {
    return this.prompt([{
      type    : 'input',
      name    : 'name',
      message : 'Your project name',
      default : this.appname // Default to current folder name
    }, {
      type    : 'confirm',
      name    : 'cool',
      message : 'Would you like to enable the Cool feature?'
    }]).then(function (answers) {
      this.log('app name', answers.name);
      this.log('cool feature', answers.cool);
    }.bind(this));
  }
})
```

**Arguments 参数**
参数是直接通过命令行传递的：

`yo webapp my-project`

这个例子中 `my-project` 就是第一个参数。

为了通知系统我们需要一个argument， 我们可以使用`generator.argument()`方法， 这个方法接受一个字符参数name， 和一个可选的配置参数对象。 

这个name参数会新建一个getter函数在generator实例上 `generator['name']`.

可选的配置对象有以下的几个键值对：

+ desc  -  参数的描述
+ required  - 是否是必须的， 布尔值
+ optional - 是否是可选的， 布尔值
+ type - 字符串，数字，数组或者是对象
+ defaults - 参数的默认值

这个方法必须在`constructor`方法中调用，  否则 Yeoman无法输出相关的帮助信息当用户调用你的generator时有help选项：eg `yo webapp --help`

栗子： 
```javascript
var _ = require('lodash');

module.exports = generators.Base.extend({
  // note: arguments and options should be defined in the constructor.
  constructor: function () {
    generators.Base.apply(this, arguments);

    // This makes `appname` a required argument.
    this.argument('appname', { type: String, required: true });
    // And you can then access it later on this way; e.g. CamelCased
    this.appname = _.camelCase(this.appname);
  }
});
```

以本例为例， 如果在命令行输入如下会直接报错：

`yo temple`

如果添加--help选项会在帮助说明的最下面看到如下的内容：

```
Arguments:
  appname   Type: String  Required: true
```

根据测验， 好像默认的配置选项就是`{type: Number, required: false}`

**Options 选项**
选项看起来和参数很类似， 但是写作命令行的标志.

`yo webapp --coffee`

使用`generator.option()`告诉系统需要选项。参数和argument方法保持一致。

获取值时使用`generator.options[name]`.

可选的选项参数接受下面的键值对：

+ desc - 描述
+ alias - 选项的缩写
+ type - 布尔，字符还是数字
+ defaults - 默认值
+ hide - 是否需要在help中隐藏， 布尔值

一个栗子：
```javascript
module.exports = generators.Base.extend({
  // note: arguments and options should be defined in the constructor.
  constructor: function () {
    generators.Base.apply(this, arguments);

    // This method adds support for a `--coffee` flag
    this.option('coffee');
    // And you can then access it later on this way; e.g.
    this.scriptSuffix = (this.options.coffee ? ".coffee": ".js");
  }
});
```

### 补充一下Inquirer的API
简单的示例

```javascript
var inquirer = require('inquirer');
inquirer.prompt([/* Pass your questions in here */]).then(function (answers) {
    // Use user feedback for... whatever!!
});
```

共有3个API，这里只说最基本的 inquirer.prompt(questions) 
+ questions 参数是一个question对象的数组，包含一组问题
+ 返回值是Promise

**Question object的介绍**

每个question对象可能包含以下的属性：

+ **type**: (String) 提示信息的类型。 默认值: `input` - 可能的值有: `input`, `confirm`, `list`, `rawlist`, `expand`, `checkbox`, `password`
+ **name**: (String) 在answers中存储answer时使用的名字。
+ **message**: (String|Function) 具体输出的问题， 如果是函数， 第一个参数是当前会话的答案数组，其实就是返回的promise中 resolve的参数， 根据推测如果是函数的话返回值就是输出的字符串了吧。
+ **default**: (String|Number|Array|Function), 当用户没有输入时的默认值， 或者一个返回默认值的函数， 如果是函数，第一个参数和上面的一样。
+ **choices**: (Array|Function) 可选值的数组或者一个返回可选值数组的函数。 如果是函数， balabala， 数组值可以是字符串， 或者包含一个name(在列表中展示), 一个value(在answer中保存的值)， 一个short(在选中后展示)属性的对象。可选值数组可以包含分隔符。
+ **validate**: (Function) 接收用户输入， 如果验证有效就返回`true`， 否则就返回一条错误信息， 如果返回`false`， 就提供一个默认的错误信息。(根据官方的例子， 如果返回false, 输入会被清除，没有任何提示信息)
+ **filter**: (Function): 接收用户输入，返回过滤掉的值方便程序使用， 返回值会填入到answers数组中。
+ **when**: (Function, Boolean) 接收用户的answers， 返回`true`还是`false`取决于这个问题是否被询问了， 值也可以是简单的布尔值。

`default`, `choices`, `validate`, `filter`, `when` 都可以异步调用。 可以返回一个promise或者使用this.async()获取回调函数，然后获取到最终值时调用。

**Answers**

每个提示问题都会有一个键值对的answer对象：
+ Key: question对象的`name`属性
+ Value(取决于提示的类型吧):
  + confirm: (Boolean)
  + input: 用户的输入(被filter过滤掉的值) (String)
  + rawlist, list: 选中的值(如果没有值说明就是名字) (String)

#### 提示问题的类型
**List - {type: 'list'}**
有`type`, `name`, `message`, `choices[`, `default`, `filter]`属性 (注意default必须是choices数组的索引值或者`value`属性)
![此处输入图片的描述][1]

**Raw List - {type: 'rawlist'}**
属性和上面一样，就是default只能是索引。
![此处输入图片的描述][2]

注意这种列表不是选择的， 是在Answer部分输入索引， 如果索引输出会有错误信息提示重输。

**Expand - {type: 'expand'}**
接收的属性有`type`,`name`, `message`, `choices[`, `default]` ,`default`必须是索引。

具体的样子下面这样：
```javascript
inquirer.prompt([
  {
    type: 'expand',
    message: 'Conflict on `file.js`: ',
    name: 'overwrite',
    choices: [
      {
        key: 'y',
        name: 'Overwrite',
        value: 'overwrite'
      },
      {
        key: 'a',
        name: 'Overwrite this one and all next',
        value: 'overwrite_all'
      },
      {
        key: 'd',
        name: 'Show diff',
        value: 'diff'
      },
      new inquirer.Separator(),
      {
        key: 'x',
        name: 'Abort',
        value: 'abort'
      }
    ]
  }
]).then(function (answers) {
  console.log(JSON.stringify(answers, null, '  '));
});
```

结合目前的东西来看， 一般的choices， 仅仅是字符串的数组， 最终在answer中的value值也就是这个字符串， 但是也可以写成对象， 用value属性来保存值， 如果expand列表， 还有额外的`key`属性， 且这个属性必须是小写的单个字符， 且不能为`h`, 因为`h`被系统默认使用， 用来展开各个选项的提示信息。另外还可能会有一个disabled的属性。

**Checkbox - {type: 'checkbox'}**
接收的属性有`type`,`name`, `message`, `choices[`, `filter`, `validate`, `default]` ,`default`期待是一个包含选中值的数组。

choices有 {checked: true} 将会被默认选中。

有disable属性的将不能被选择，如果`disabled`是个字符串， 那么这个字符串就会紧挨着被禁用的choice输出， 否则默认就是"Disabled"， 这个属性甚至可以是一个同步函数接受当前的answers作为参数。

![此处输入图片的描述][3]

**Confirm - {type: 'confirm'}**
接收的属性有`type`,`name`, `message[`,`default]` ,`default`期待是布尔值。


###  4. 管理依赖
我们只需要调用`generator.npmInstall()` 方法来运行npm installation。 Yeoman 会确保`npm install` 命令只运行一遍。

栗子：
```javascript
generators.Base.extend({
  installingLodash: function() {
    this.npmInstall(['lodash'], { 'saveDev': true });
  }
});
```

### 5. 操作文件系统
---
Yeoman文件实用工具是基于你在磁盘上有两个位置上下文的思想的。

##### 目标上下文( destination context )
第一个上下文环境是目标上下文。 目标上下文是Yeoman工具最终生成新的app的文件夹，也就是用户最终的项目文件夹。

目标上下文是定义为当前工作目录或者最近的包含`.yo-rc.json`文件的父级文件夹中的两者之一。`.yo-rc.json`定义了Yeoman项目的根目录。 这个文件允许用户在子目录中执行命令并且包含有它们在项目中自己的工作文件。

你可以获得目标路径通过使用`generator.destinationRoot()` 或者添加一个路径使用`generator.destinationPath('sub/path')`.

```javascript
// Given destination root is ~/projects
generators.Base.extend({
  paths: function () {
    this.destinationRoot();
    // returns '~/projects'

    this.destinationPath('index.js');
    // returns '~/projects/index.js'
  }
});
```
可以使用`generator.destinationRoot('new/path')`来手动设置。

##### 模板上下文( Template context )
模板上下文是存放模板文件的文件夹。

模板上下文默认是定义为`./templates/`。 可以通过调用`generator.sourceRoot('new/template/path')`.

我们可以通过`generator.sourceRoot()`方法来获取这个路径值， 或者添加一段路径通过使用`generator.templatePath('app/index.js')`.

```javascript
generators.Base.extend({
  paths: function () {
    this.sourceRoot();
    // returns './templates'

    this.templatePath('index.js');
    // returns './templates/index.js'
  }
});
```

#### An "in memory" file system
Yeoman在需要覆盖用户文件时是非常小心的。 基本上， 每次写入一个已存在的文件时都会通过冲突解决程序。 这个程序会要求用户去验证需要覆盖写入的每个文件。

#### 文件实用工具 File utilities
generator暴露了所有的文件方法在`this.fs`对象上， 这个对象是一个 `men-fs editor`的实例。

值得注意的是虽然`this.fs`暴露了`commit`， 你也不应该在生成器中调用它。Yeoman内部会在冲突阶段内部调用它。

栗子：
假设`./templates/index.html`内容是:

```html
<html>
  <head>
    <title><%= title %></title>
  </head>
</html>
```
我们会使用`copyTpl`方法去复制这个文件当将它按照模板处理时， `copyTpl`使用 [ejs template syntax][4]

```javascript
generators.Base.extend({
  writing: function () {
    this.fs.copyTpl(
      this.templatePath('index.html'),
      this.destinationPath('public/index.html'),
      { title: 'Templating with Yeoman' }
    );
  }
});
```


  [1]: https://camo.githubusercontent.com/47a08582b41bbd015e4db8b0245962302c4f254e/68747470733a2f2f646c2e64726f70626f7875736572636f6e74656e742e636f6d2f752f35393639363235342f696e7175697265722f6c6973742d70726f6d70742e706e67
  [2]: https://camo.githubusercontent.com/c60910b1ebcfd4448a986fa22d0d412b7f2d770c/68747470733a2f2f692e636c6f756475702e636f6d2f4c6352477058493043582d3330303078333030302e706e67
  [3]: https://camo.githubusercontent.com/d4a7bef9921a113746a49d4b0b45b995dd7ede7a/68747470733a2f2f646c2e64726f70626f7875736572636f6e74656e742e636f6d2f752f35393639363235342f696e7175697265722f636865636b626f782d70726f6d70742e706e67
  [4]: http://ejs.co/