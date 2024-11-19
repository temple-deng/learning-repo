# CommonJS

## 1. 概述

CommonJS规范规定，每个模块内部，`module` 变量代表当前模块。这个变量是一个对象，它的 `exports` 属性（即 `module.exports`）是对外的接口。加载某个模块，其实是加载该模块的 `module.exports` 属性。  

## 2. module 对象

Node内部提供一个Module构建函数。所有模块都是Module的实例。


```javascript
function Module(id, parent) {
  this.id = id;
  this.exports = {};
  this.parent = parent;
  // ...
}
```

每个模块内部，都有一个module对象，代表当前模块。它有以下属性。  

+ `module.id` 模块的识别符，通常是带有绝对路径的模块文件名。
+ `module.filename` 模块的文件名，带有绝对路径。
+ `module.loaded` 返回一个布尔值，表示模块是否已经完成加载。
+ `module.parent` 返回一个对象，表示调用该模块的模块。
+ `module.children` 返回一个数组，表示该模块要用到的其他模块。
+ `module.exports` 表示模块对外输出的值。

如果在命令行下调用某个模块，比如 `node something.js`，那么 `module.parent`就是 `undefined`。  

### 2.1 exports 变量

为了方便，Node为每个模块提供一个exports变量，指向module.exports。这等同在每个模块头部，有一行这样的命令。  

`var exports = module.exports;`  

这意味着，如果一个模块的对外接口，就是一个单一的值，不能使用 `exports` 输出，只能使用`module.exports`输出。  


## 3. AMD 兼容写法

AMD规范允许输出的模块兼容CommonJS规范，这时define方法需要写成下面这样：  

```javascript
define(function (require, exports, module){
  var someModule = require("someModule");
  var anotherModule = require("anotherModule");

  someModule.doTehAwesome();
  anotherModule.doMoarAwesome();

  exports.asplode = function (){
    someModule.doTehAwesome();
    anotherModule.doMoarAwesome();
  };
});
```  


## 4. require 命令

### 4.1 require函数的加载规则

`require` 命令用于加载文件，后缀名默认为`.js`。  

根据参数的不同格式，`require` 命令去不同路径寻找模块文件。

  1. 如果参数字符串以“/”开头，则表示加载的是一个位于绝对路径的模块文件。比如，`require('/home/marco/foo.js')` 将加载 `/home/marco/foo.js`。

  2. 如果参数字符串以“./”开头，则表示加载的是一个位于相对路径（跟当前执行脚本的位置相比）的模块文件。比如，`require('./circle')`将加载当前脚本同一目录的circle.js。

  3. 如果参数字符串不以“./“或”/“开头，则表示加载的是一个默认提供的核心模块（位于Node的系统安装目录中），或者一个位于各级`node_modules` 目录的已安装模块（全局安装或局部安装）。  

  4. 如果参数字符串不以“./“或”/“开头，而且是一个路径，比如`require('example-module/path/to/file')`，则将先找到`example-module`的位置，然后再以它为参数，找到后续路径。

  5. 如果指定的模块文件没有发现，Node会尝试为文件名添加`.js、.json、.node`后，再去搜索。`.js`件会以文本格式的JavaScript脚本文件解析，`.json`文件会以JSON格式的文本文件解析，`.node`文件会以编译后的二进制文件解析。

  6. 如果想得到`require`命令加载的确切文件名，使用`require.resolve()`方法。   


### 4.2 require的内部处理流程

`require`命令是CommonJS规范之中，用来加载其他模块的命令。它其实不是一个全局命令，而是指向当前模块的`module.require`命令，而后者又调用Node的内部命令`Module._load`。  

```javascript
Module._load = function(request, parent, isMain) {
  // 1. 检查 Module._cache，是否缓存之中有指定模块
  // 2. 如果缓存之中没有，就创建一个新的Module实例
  // 3. 将它保存到缓存
  // 4. 使用 module.load() 加载指定的模块文件，
  //    读取文件内容之后，使用 module.compile() 执行文件代码
  // 5. 如果加载/解析过程报错，就从缓存删除该模块
  // 6. 返回该模块的 module.exports
};
```
