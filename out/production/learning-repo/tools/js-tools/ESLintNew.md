# ESLint(基于4.0.0)

## Configuration

在运行完 `eslint --init`会在当前目录生成一个 `eslintrc` 文件。里面的配置类似这样：  

```javascript
{
  "rules": {
    "semi": ["error", "always"],
    "quotes": ["error", "double"]
  }
}
```  

`"semi"`, `"quotes"` 就是规则 rules 的名字。规则的值的数组中第一个值代表错误的等级，会是
下面之一的值：  

+ `"off"` or `0` - 关闭规则。
+ `"warn"` or `1` - 将规则定义为警告级别（不会影响退出码）-> 这退出码是什么鬼
+ `"error"` or `2` - 将规则定义为错误级别（退出码为1）  

`.eslintrc` 文件还可以包含下面的这行内容：  

`"extends": "eslint:recommended"`  

添加了这一行后，所有在 rules 页面中标记了对勾的规则都会被启用。当然，也可以在 npmjs.com 查找
别人写好的配置。  


## Configuration ESLint  

ESLint 是完全可配置的，意味着我们可以关闭所有规则而只进行基本的语法检查。有两种主要的方式
配置 ESLint：  

1. 通过注释配置 Configuration Comments - 直接在 JS 文件中嵌入注释来指定配置信息。  

2. 通过文件配置 Configuration Files - 可以使用文件来为整个目录及所有子目录规定配置信息。
这个文件可以是 JS，JSON 或者 YAML 文件。可以是单独的 `.eslintrc.*`的形式，也可以是 `package.json` 文件中的 `eslintConfig` 属性， ESLint 会自动的寻找这两种形式的文件，或者直接在
命令行中指定配置文件位置。所以哪个优先级高呢？  

配置中主要会包含3类的信息：  

+ Environments 环境 - 脚本是设计在哪种环境下运行的。每种环境都有一系列预定义的全局变量。
+ Globals - 脚本在执行期间想要访问的额外的全局变量。
+ Rules - 要启用哪些规则，规则是什么等级的。  


### 指定解析器选项

ESLint 可以指定支持的JS语言的选项。默认情况下，支持ES5语法。可以通过覆盖这个选项来支持想要的
JS版本及JSX语法。  

值的注意的是这里支持的JSX语法与React的JSX语法是不同的。React的JSX语法实现了一些 ESLint 无法
识别的语法含义。如果想要支持React和其特定的JSX语法，推荐使用 `eslint-plugin-react` 插件。  

在`.eslintrc.*` 文件中指定解析器选项时通过 `parserOptions` 属性。可用的选项有：  

+ `ecmaVersion` - 可以设置为3, 5(default), 6, 7, 8。也可以使用基于年份的命名方式如 2015(6),
2016(7)。  

+ `sourceType` - 可以设置为 `"script"`(default) or `"module"`，如果代码时在 ECMAScript 模块种使用 `"module"`。（指的是ES6的模块语法么？）  

+ `ecmaFeatures` =  一个指定想要使用哪些额外语法特征的对象，支持的有：  
  - `globalReturn` - 允许在全局范围内使用 `return` 声明。
  - `impliedStrict` - 启用严格模式
  - `jsx` - 启用JSX.
  - `experimentalObjectRestSpread` - 对象的结构与扩展语法，这个结构不是普通的对象结构，是用
  `...rest`参数来获取尚未结构的属性。  

还可以指定使用的解析器，通过 `parser` 属性。不过估计用不到，不解释了。  


### 指定环境

每个环境会预定义不同的全局变量。当前支持的环境如下：

+ `browser`
+ `node`
+ `commonjs` - 只有在使用Browserify/WebPack 构建浏览器端代码时使用这个环境
+ `shared-node-browser` - 浏览器和Node环境通用的那些全局变量
+ `es6` - 除了模块化以外的所有es6功能
+ `worker`
+ `amd` - 根据 amd 规范定义 `require()` 和 `define()` 作为全局变量
+ `mocha` - 添加所有的 Mocha 测试全局变量
+ `jasmine` - 添加1.3-2.0之间版本的所有 Jasmine 测试全局变量
+ `jest` - Jest 全局变量
+ `phantomjs`
+ `protractor` - Protractor 全局变量（什么玩意）
+ `qunit` - QUnit 全局变量
+ `jquery`
+ `prototypejs`
+ `shelljs`
+ `meteor`
+ `mongo` - MongoDB
+ `applescript` - AppleScript
+ `nashorn` - Java 8 Nashorn
+ `serviceworker`
+ `atomtest` - Atom test helper
+ `embertest` Ember test helper
+ `webextensions` - WebExtensions
+ `greasemonkey` - GreaseMonkey


环境配置可以声明在JS文件中，或者在配置文件中，或者使用 `--env` 得到命令行选项。  

当在JS文件中通过注释声明时，使用下面的格式：  

`/* eslint-env node, mocha */`  

如果是在配置文件中声明，使用 `env` 属性，并且将想要声明的环境的属性值设为 `true`。   

```javascript
{
    "env": {
        "browser": true,
        "node": true
    }
}
```  

or in `package.json`    

```javascript
{
    "name": "mypackage",
    "version": "0.0.1",
    "eslintConfig": {
        "env": {
            "browser": true,
            "node": true
        }
    }
}
```   

如果想要使用插件中定义的环境，需要在 `plugins` 属性的数组中添加插件名，并且在环境中声明，具体格式如下，一个无前缀的插件名，加一条斜杠，之后跟环境名：   

```javascript
{
  "plugins": ["example"],
  "env": {
    "example/custom": true
  }
}
```  

在 `package.json` 中一样。   

### 指定全局变量

`no-undef` 会在使用当前文件中未定义的变量时发出警告。可以通过使用ESLint 配置这些全局变量来
避免警告的出现。   

当使用注释的形式配置时，格式如下：  

`/* global var1, var2 */`  

如果想要将这些变量声明成只读的，不可写，可以设置一个 `false` 的标识：  

`/* global var1:false, var2:false */`  

如果要在配置文件中配置，使用 `global` 属性：  

```javascript
{
  "globals": {
    "var1": true,
    "var2": false
  }
}
```  


### 配置插件

配置插件使用 `plugins` 属性，包含一系列插件的名字，可以省略 `eslint-plugin-` 的前缀。  

```javascript
{
    "plugins": [
        "plugin1",
        "eslint-plugin-plugin2"
    ]
}
```  

### 配置规则

规则的等级上面说过了。使用注释的配置如下：  

`/* eslint eqeqeq: "off", curly: "error" */`  

也可以使用数字：  

`/* eslint eqeqeq: 0, curly: 2 */`  

如果规则还有额外的参数，可以使用数组直接量的语法，如下：  

`/* eslint quotes: ["error", "double"], curly: 2 */`    

在配置文件中配置时使用 `rules` 属性：  

```javascript
{
    "rules": {
        "eqeqeq": "off",
        "curly": "error",
        "quotes": ["error", "double"]
    }
}
```    

如果要配置插件中定义的规则，必须要在规则名前缀插件名及斜杠。例如：  

```javascript
{
    "plugins": [
        "plugin1"
    ],
    "rules": {
        "eqeqeq": "off",
        "curly": "error",
        "quotes": ["error", "double"],
        "plugin1/rule1": "error"
    }
}
```  

也可以在注释中这样配置：  

`/* eslint "plugin1/rule1": "error" */`  

### 使用内联的注释禁用规则

如果在文件中要暂时地禁用规则警告，按下面的格式使用块级注释：   

```javascript
/* eslint-disable */

alert('foo');

/* eslint-enable */
```   

还可以指定禁用的具体规则：   

```javascript
/* eslint-disable no-alert, no-console */

alert('foo');
console.log('bar');

/* eslint-enable no-alert, no-console */
```   

如果要对整个文件禁用规则的警告，将 `/* eslint-disable */` 放在文件的顶部。同理，指定具体规则也是一样。  

如果要对某一行的代码禁用所有规则，按下面的格式使用行级注释：  

```javascript
alert('foo'); // eslint-disable-line

// eslint-disable-next-line
alert('foo');
```  

也可以指定具体禁用的规则。  

```javascript
alert('foo'); // eslint-disable-line no-alert, quotes, semi

// eslint-disable-next-line no-alert, quotes, semi
alert('foo');
```   

### Adding Shared Settings

ESLint 支持在配置文件中添加共享的设置 Shared setting。通常在添加定制的规则时有用：   

```javascript
{
    "settings": {
        "sharedData": "Hello"
    }
}
```    

### 使用配置文件  

有两种使用配置文件的方式，第一种是使用命令行时使用 `-c` 选项指定配置文件的位置：  

`eslint -c myconfig.json myfiletotest.js`  

第二种是使用 `.eslintrc.*` and `package.json` 的配置文件。 ESLint 会在想要检测的文件
所在的目录中自动找寻这些文件，以及父级目录，直到文件系统的根目录。  


### 配置文件的格式

配置文件支持下面的格式：  

+ JavaScript - `.eslintrc.js`，需要和常规的CommonJS 模块一样导出配置对象。
+ YAML - `.eslintrc.yaml` or `.eslintrc.uml`
+ JSON -  `.eslintrc.json`
+ package.json - `eslintConfig` 属性

优先级如下：

`.eslintrc.js` > `.eslintrc.yaml` > `.eslintrc.yml` > `.eslintrc.json` > `.eslintrc` > `package.json`  

### 配置层叠与层级

例如当前有如下的目录结构：  

```
your-project
├── .eslintrc
├── lib
│ └── source.js
└─┬ tests
  ├── .eslintrc
  └── test.js
```  

配置的层叠规则是这样的：距离检测文件最近的 `.eslintrc.*` 有最高的优先级，之后是上级目录的，等等一致往上。当在当前目录运行 ESLint 时， `lib/` 下的所有文件会使用项目根目录中的 `.eslintrc`，
当时 `test/` 中的所有文件会使用 `project/tests/.eslintrc`。最终 `project/tests/test.js` 的
检测是基于两个配置文件的结合。（这里结合到底是什么意思）  

`package.json` 的情况类似。   

为了将 ESLint 限制到一个特定的项目，在你项目根目录下的 `package.json` 文件或者 `.eslintrc.*` 文件里的 `eslintConfig` 字段下设置 `"root": true`。ESLint 一旦发现配置文件中有 `"root": true`，它就会停止在父级目录中寻找。  

`{ "root": true } `  

配置的完整的层级如下，从最高到最低：  

1. 内联的配置
2. 命令行的配置
3. 具体的配置文件

### Extending Configuration Files  

`extends` 属性值可以是下面之一：  

+ 一个声明配置的字符串
+ 一个字符串的数组：每个附加的配置会继承前面的配置。

ESLint 递归地进行扩展配置，所以一个基础的配置也可以有一个 `extends` 属性。

`rules` 属性可以做下面的任何事情以扩展（或覆盖）规则：   

+ 启用额外的规则
+ 在不修改规则的选项的情况修改继承规则的严重级别：  
  - 基础配置： `"eqeqeq": ["error", "allow-null"]`
  - 派生的配置： `"eqeqeq": "warn"`
  - 最终的配置： `"eqeqeq": ["warn", "allow-null"]`  
+ 从基础配置中修改规则的选项：
  - 基础配置：`"quotes": ["error", "single", "avoid-escape"]`
  - 派生配置： `"quotes": ["error", "single"]`
  - 最终的配置： `"quotes": ["error", "single"]`  

#### Using a shareable configuration package

这些共享的配置包也是普通的 npm 包，不过名字通常是 `eslint-config-myconfig` 的形式。   

安装了这些包后，就可以在配置中使用 `extends` 属性继承了，在继承时可以省略 `eslint-config-` 前缀。   

除了可以从一些 npm 的配置包中继承配置，也可以从一些插件中继承：   

#### Using the configuration from a plugin

一般来说插件都是定义了一些新的规则，不过也可能暴露出一些配置。   

首先可能要在 `plugins` 中声明插件。   

之后 `extends` 属性会写成下面的形式（指的是针对这个插件的继承配置）：   

+ `plugin:`
+ 包名，省略前缀后的
+ `/`
+ 配置名（例如 `recommended`）   

```json
{
    "plugins": [
        "react"
    ],
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    "rules": {
       "no-set-state": "off"
    }
}
```   

`extends` 属性甚至还可以是一个基础的配置文件的绝对或者相对路径。  

### 设置忽略文件及目录

可以在项目根目录创建一个 `.eslintignore` 文件来规定忽略的文件和目录。使用 glob 模式匹配。  

Glob 使用 node-ignore 匹配，规则如下：  

+ 以 `#` 开始的行会被当做注释，不会进行处理
+ 路径时相对于 `.eslintignore` 文件的位置或者当前工作目录
+ 忽略规则与 `.gitignore` 规范类似
+ 以 `!` 开头的行是否定模式，它将会重新包含一个之前被忽略的模式。


除了 `.eslintignore` 文件中的模式，ESLint总是忽略 `/node_modules/*` 和 `/bower_components/*` 中的文件。
