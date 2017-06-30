# Global Objects

目录：   

+ [Global Objects](#globalobj)
  + [Class:Buffer](#buffer)
  + [\__dirname](#dirname)
  + [\__filename](#filename)
  + clearImmediate(immediateObject)
  + clearInterval(intervalObject)
  + clearTimeout(timeoutObject)
  + console
  + [exports](#export)
  + [global](#global)
  + [module](#module)
  + process
  + [require](#require)
    - require.cache
    - require.resolve()
  + setImmediate(callback[,...args])
  + setInterval(callback,delay[,...args])
  + setTimeout(callback,delay[,...args])


# Global Objects

<a name="globalobj"></a>   

这些对象在所有模块中都可用。其中的一些对象其实是在模块作用域中而不是全局作用域 - 之后会提到。   

## Class: Buffer

<a name="buffer"></a>   

用来处理二进制数据。   

## \__dirname

<a name="dirname"></a>   

+ &lt;string&gt;    

当前模块的目录名。这和使用 `__filename` 调用 `path.dirname()` 结果相同。   

`__dirname` 事实上更像每个模块的局部变量。    

例子：在 `/User/mjr` 中运行 `node example.js`   

```javascript
console.log(__dirname);
// Prints: /Users/mjr
console.log(path.dirname(__filename));
// Prints: /Users/mjr
```    

## \__filename  

<a name="filename"></a>   

+ &lt;string&gt;   

当前模块的文件名。最终会解析成一个绝对路径。   

同理，`__filename` 事实上时每个模块的局部变量。   

例子同上。    

## clearImmediate(immediateObject)   

## clearInterval(intervalObject)

## clearTimeout(timeoutObject)

## console  

## exports

<a name="exports"></a>   

对 `module.exports` 的引用。事实上也是一个局部变量。   

## global

<a name="global"></a>    

+ &lt;Object&gt; 全局命名空间对象   

## module

<a name="module"></a>   

+ &lt;Object&gt;   

对当前模块的引用。特别是 `module.exports` 用来定义当前模块对外的接口。也是一个局部的变量。   

## process

## require()

<a name="require"></a>
局部变量。   

### require.cache

+ &lt;Object&gt;   

当模块被请求时会缓存在这个对象里面。当从这个对象上删除一个键时，则下次调用 `require` 会重新加载模块。   

例子：在 `E:\web-project\node-doc\` 运行 `node console.js`   

```javascript
const path = require('path');
const fs = require('fs');
const moment = require('moment');
console.log(require.cache)

/* { 'E:\web-project\node-doc\console.js':
   Module {
     id: '.',
     exports: {},
     parent: null,
     filename: 'E:\\web-project\\node-doc\\console.js',
     loaded: false,
     children: [ [Object] ],
     paths:
      [ 'E:\\web-project\\node-doc\\node_modules',
        'E:\\web-project\\node_modules',
        'E:\\node_modules' ] },
  'E:\web-project\node-doc\node_modules\moment\moment.js':
   Module {
     id: 'E:\\web-project\\node-doc\\node_modules\\moment\\moment.js',
     exports:
      { [...] },
     parent:
      Module {
        id: '.',
        exports: {},
        parent: null,
        filename: 'E:\\web-project\\node-doc\\console.js',
        loaded: false,
        children: [Object],
        paths: [Object] },
     filename: 'E:\\web-project\\node-doc\\node_modules\\moment\\moment.js',
     loaded: true,
     children: [],
     paths:
      [ 'E:\\web-project\\node-doc\\node_modules\\moment\\node_modules',
        'E:\\web-project\\node-doc\\node_modules',
        'E:\\web-project\\node_modules',
        'E:\\node_modules' ] } }

*/
```   

看样子，会包含当前模块，但是不会包含加载的核心模块。   

### require.resolve()

使用内部的 `require()` 机制来查找模块的位置。    

## setImmediate(callback[, ...args])

## setInterval(callback[, ...args])

## setTimeout(callback[, ...args])
