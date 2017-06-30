# Util  

+ [Util](#util)
  - [util.debuglog(section)](#debuglog)
  - [util.deprecate(function, string)](#deprecate)
  - [util.format(format[, ...args])](#format)
  - [util.inherits(constructor, superConstructor)](#inherits)
  - [util.inspect(object[, options])](#inspect)
    + Customizing util.inspect colors
    + Custom inspection functions on Objects
    + util.inspect.custom
    + util.inspect.defaultOptions
  - [util.promisify(original)](promisify)
    + Custom promisified functions
    + util.promisify.custom   

# Util
<a name="util"></a>    

`util` 模块主要是用来支持 Node.js 内部 APIs 的支持。   

`const util = require('util'); `   

## util.debuglog(section)

<a name="debuglog"></a>   

+ `section` &lt;string&gt; 一个用来标记应用的哪一部分创建这个函数的字符串
+ Returns: &lt;Function&gt; 日志函数   

这个方法用来创建一个函数，可以条件性的将 debug 信息写入到 `stderr` 中，基于 `NODE_DEBUG` 环境
变量的存在。如果 `section` 名字是包含在这个环境变量值中，那么返回的函数的操作类似于 `console.error()`，
如果没有的话，返回的返回什么都不做。   

例子：   

```javascript
const util = require('util');
const debuglog = util.debuglog('foo');

debuglog('hello from foo [%d]', 123);
```  

如果程序运行在 `NODE_DEBUG=foo` 的环境中，就会输出类似下面的东西：   

`FOO 3245: hello from foo [123]`   

3245 是进程的 id。如果进程没有运行在这样的环境中，就不会打印任何东西。   

`NODE_DEBUG` 是用逗号分隔各个 `section` 名字的：`NODE_DEBUG=fs,net,tls`。    

## util.deprecate(function, string)

<a name="deprecate"></a>   

将给定的函数或者类包裹起来，标记为 deprecated。   

```javascript
const util = require('util');

exports.puts = util.deprecate(function() {
  for (let i = 0, len = arguments.length; i < len; ++i) {
    process.stdout.write(arguments[i] + '\n');
  }
}, 'util.puts: Use console.log instead');
```   

`util.deprecate()` 会返回一个函数，这个函数会使用 `process.on(warning)` 触发一个 `DeprecationWarning`事件。
默认情况下，这个警告会在调用这个函数时在 `stderr` 中打印一次。在触发警告后，调用被包裹的函数。   

貌似要结合一些命令行选项才有用，具体查文档吧。    

## util.format(format[, ...args])  

<a name="format"></a>   

+ `format` &lt;string&gt; 一个类似 `printf` 的格式字符串   

返回一个格式化的字符串。   

第一个参数可以包含0或多个 placeholder 标记。每个标记会被对应的参数替代。支持的 placeholder 如下：  

+ `%s` - 字符串
+ `%d` - 数组（整数或浮点值）
+ `%i` - 整数
+ `%f` - 浮点值
+ `%j` - JSON. 如果参数包含循环引用，用字符串 `[Circular]` 代替。
+ `%%` - 单个的百分号   

如果占位符没有对应的参数，占位符就不会被替换：  

```javascript
util.format('%s:%s', 'foo');
// Returns: 'foo:%s'
```   

如果传入的参数要多于 placeholder 的数量，额外的参数会强制转换为字符串（对象及 symbol 值，使用
`util.inspect()`），然后将整个字符串连接起来，使用空格做分隔：   

`util.format('%s:%s', 'foo', 'bar', 'baz'); // 'foo:bar baz'`    

如果第一个参数不是一个格式字符串，那么就直接将所有参数转换为字符串连接起来，使用空格做分隔符。每个
参数都使用 `util.inspect()` 转换为字符串。   

`util.format(1, 2, 3); // '1 2 3'`   

## util.inherits(constructor, superConstructor)   

<a name="inherits"></a>   

已经不鼓励使用这个函数了。     

## util.inspect(object[, options])   

<a name="inspect"></a>   

+ `object` &lt;any&gt; 任何 js 原始值或对象
+ `options` &lt;any&gt;
  - `showHidden` &lt;boolean&gt; 如果为 `true`，`object` 的不可枚举 及 symbol 属性都会包含在最终的
  结果中，默认为 `false`
  - `depth` &lt;any&gt; 格式化对象时递归的深度。默认为2。如果想要设为无限的递归，设置为 `null`
  - `colors` &lt;boolean&gt;
  - `customInspect` &lt;boolean&gt; 如果为 `false`，暴露在`object` 上的定制的 `inspect(depth, opts)` 函数
  就不会被调用。默认为 `true`。   
  - `showProxy` &lt;boolean&gt; 如果为 `true`，对象及被代理的对象会展示其 `target` 和 `handler`，默认为 `false`
  - `maxArrayLength` &lt;number&gt; 默认为 100。设为 `null` 则展示所有的数组元素。
  - `breakLength` &lt;number&gt;  The length at which an object's keys are split across multiple lines. Set to Infinity to format an object as a single line. Defaults to 60 for legacy compatibility.   

返回一个代表对象的字符串，主要用来 debug。   

```javascript
const util = require('util');

console.log(util.inspect(util, { showHidden: true, depth: null }));
```    

## 定制 `util.inspect` 颜色

通过 `util.inspect.styles` 和 `util.inspect.colors` 属性设置输出的颜色。   

具体就不介绍了，估计也用不到。   

## 定制对象上的 inspection 函数

对象也可以定义自身的 `[util.inspect.custom](depth, opts)` 或者等价的 `inspect(depth, opts)` 函数，
则 `util.inspect` 会在检测对象上调用这个函数并使用其返回的结果：   

```javascript
const util = require('util');

class Box {
  constructor(value) {
    this.value = value;
  }

  inspect(depth, options) {
    if (depth < 0) {
      return options.stylize('[Box]', 'special');
    }

    const newOptions = Object.assign({}, options, {
      depth: options.depth === null ? null : options.depth - 1
    });

    // Five space padding because that's the size of "Box< ".
    const padding = ' '.repeat(5);
    const inner = util.inspect(this.value, newOptions)
                      .replace(/\n/g, `\n${padding}`);
    return `${options.stylize('Box', 'special')}< ${inner} >`;
  }
}

const box = new Box(true);

util.inspect(box);
// Returns: "Box< true >"
```  

`[util.inspect.custom](depth, opts)` 函数可以返回字符串，也可以返回任意类型的值，最终会
使用 `util.inspect()` 格式化。   

## util.inspect.custom

一个 Symbol 值   

## util.inspect.defaultOptions  

`util.inspect` 默认的 options。   

```javascript
const util = require('util');
const arr = Array(101).fill(0);

console.log(arr); // logs the truncated array
util.inspect.defaultOptions.maxArrayLength = null;
console.log(arr); // logs the full array
```   

## util.promisify(original)  

<a name="promisify"></a>   

+ `original` &lt;Function&gt;   

接受一个遵从 Node.js 常用回调格式的函数，例如，接收 `(err, value) => ...` 回调作为最后一个
参数的函数，返回一个返回 promise 的版本。其实就是将回调处理改成了 promise 处理。       

```javascript
const util = require('util');
const fs = require('fs');

const stat = util.promisify(fs.stat);
stat('.').then((stats) => {
  // Do something with `stats`
}).catch((error) => {
  // Handle the error.
});
```   

或者使用等价的 `async function`:   

```javascript
const util = require('util');
const fs = require('fs');

const stat = util.promisify(fs.stat);

async function callStat() {
  const stats = await stat('.');
  console.log(`This directory is owned by ${stats.uid}`);
}
```   

如果有 `original[util.promisify.custom]` 属性存在，就返回这个值。   

`promisify()` 假设 `original` 是一个接收一个回调函数作为其最后一个参数的函数，如果不是的话
可能会出现未定义的行为。   

## 定制 promisified 函数

使用 `util.promisify.custom` symbol 属性会覆盖 `util.promisify()` 的返回值：   

```javascript
const util = require('util');

function doSomething(foo, callback) {
  // ...
}

doSomething[util.promisify.custom] = function(foo) {
  return getPromiseSomehow();
};

const promisified = util.promisify(doSomething);
console.log(promisified === doSomething[util.promisify.custom]);
  // prints 'true'
```   
