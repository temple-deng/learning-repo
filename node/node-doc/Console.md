# Console 模块

### 目录

+ [Console](#console)
  + [Class: Console](#classConsole)
    + [new Console(stdout[, stderr])](#newConsole)
    + [console.assert(value[,message][,..args])](#assert)
    + [console.dir(obj[,options])](#dir)
    + [console.error([data][, ...args])](#error)
    + [console.info([data][, ...args])](#info)
    + [console.log([data][, ...args])](#log)
    + [console.time(label)](#time)
    + [console.timeEnd(label)](#timeEnd)
    + [console.trace([message][, ...args])](#trace)
    + [console.warn([data][, ...args])](#warn)

# Console

<a name="console"></a>

这个模块暴露了两个特殊的组件：   

+ 一个包含例如 `console.log()`, `console.error()` 等方法的 `Console` 类，可以用来写入
到任何的 Node.js 流中。
+ 一个已经配置好的全局的 `console` 实例，用来写入到 `process.stdout` 和 `process.stderr`。
全局的 `console` 可以在不调用 `require('console')` 的情况下直接使用。     


使用全局 `console` 的例子：   

```javascript
console.log('hello world');
// Prints: hello world, to stdout
console.log('hello %s', 'world');
// Prints: hello world, to stdout
console.error(new Error('Whoops, something bad happened'));
// Prints: [Error: Whoops, something bad happened], to stderr

const name = 'Will Robinson';
console.warn(`Danger ${name}! Danger!`);
// Prints: Danger Will Robinson! Danger!, to stderr
```   

使用 `Console` 类的实例：   

```javascript
const out = getStreamSomehow();
const err = getStreamSomehow();
const myConsole = new console.Console(out, err);

myConsole.log('hello world');
// Prints: hello world, to out
myConsole.log('hello %s', 'world');
// Prints: hello world, to out
myConsole.error(new Error('Whoops, something bad happened'));
// Prints: [Error: Whoops, something bad happened], to err

const name = 'Will Robinson';
myConsole.warn(`Danger ${name}! Danger!`);
// Prints: Danger Will Robinson! Danger!, to err
```   

# Class: Console

<a name="classConsole"></a>   

`Console` 类可以通过使用 `require('console').Console` 或者 `console.Console` 获得：   

```javascript
const { Console } = require('console');
const { Console } = console;
```   

## new Console(stdout[, stderr])

+ `stdout` &lt;Writable&gt;(可写流的意思吧)
+ `stderr` &lt;Writable&gt;    

传入一个或两个可写流实例来创建一个新的 `Console` 对象。如果 `stderr` 没有传入，警告及错误信息
也会发送到 `stdout`。    

```javascript
const output = fs.createWriteStream('./stdout.log');
const errorOutput = fs.createWriteStream('./stderr.log');
// custom simple logger
const logger = new Console(output, errorOutput);
// use it like console
const count = 5;
logger.log('count: %d', count);
// in stdout.log: count 5
```  

全局的 `console` 其实是一个特殊的 `Console` 实例，其输出发送到了 `process.stdout` 及 `process.stderr`。
等价于如下调用:   

`new Console(process.stdout, process.stderr);`    

## console.assert(value[, message][,args])

+ `value` &lt;any&gt;
+ `message` &lt;any&gt;
+ `...args` &lt;any&gt;   

一个简单的断言测试，验证 `value` 是否为“真”。如果不是，会抛出 `AssertionError` 错误。如果提供了 `message`
参数，那么这个参数会用 `util.format()` 格式化并作为错误信息。   

```javascript
console.assert('hello', 'does nothing');
// OK
console.assert('', 'this is an %s', 'empty string')
// AssertionError: this is an empty string
```    

注意这个方法在 Node.js 中的实现与浏览器中的不同，当假值时，浏览器中的 `console.assert()`
会输出 `message` 但是不会中断后续代码的执行，Node 中抛出 `AssertionError`。   

## console.dir(obj[,options])

<a name="assert"></a>  


+ `obj` &lt;any&gt;
+ `options` &lt;Object&gt;
  - `showHidden` &lt;boolean&gt;
  - `depth` &lt;number&gt;
  - `colors` &lt;boolean&gt;   

在对象 `obj` 上调用 `util.inspect()` （这个方法主要是用于 debug，返回一个字符串）并且将结果字符
串打印到 `stdout`。这个函数会绕过定义在 `obj` 上的 `inspect()` 函数。  

+ `showHidden` - 如果为 `true`，那么对象非枚举及 symbol 属性也会展示出来。默认为 `false`。
+ `depth` - 感觉是控制递归深度的。默认是2。   
+ `colors` - 如果为 `true`，输出会上色。默认为 `false`。   

```javascript
let obj  = {
  a: 1,
  b: {
    c: 2,
    d: {
      f: 3
    }
  }
}

console.dir(obj, {depth: 1});
// { a:1, b:{c:2, d:[Object]}}
```    

## console.error([data][,..args])

+ `data` &lt;any&gt;
+ `...args` &lt;any&gt;   

在 `stderr` 的新行中打印。第一个参数作为主要信息（上面例子中明明是Error实例），额外的参数与 `printf()` 类似。      

```javascript
const code = 5;
console.error('error #%d', code);
// Prints: error #5, to stderr
console.error('error', code);
// Prints: error 5, to stderr
```    

如果格式化元素（例如 `%d`）在第一个参数中不存在，那么就会对每个参数调用 `util.inspect()`，然后
把返回的字符串串起来。    

## console.info([data][,...args])

<a name="info"></a>   

+ `data` &lt;any&gt;
+ `...args` &lt;any&gt;   

是 `console.log()` 的同名函数。   

## console.log([data][,...args])

<a name="log"></a>   

参数就不说了，向 `stdout` 的新行中打印。打印方式同 `error`。   

## console.time(label)

<a name="time"></a>   

+ `label` &lt;any&gt;   

开始一个计时器，用来计算一段操作的持续时间。参数是计算器的标识符。当使用相同的 `label` 调用
`console.timeEnd()` 时停止计时器并用毫秒形式输出经过的时间。   

## console.timeEnd(label)

<a name="timeEnd"></a>   

将结果打印到 `stdout` 中。   

```javascript
console.time('100-elements');
for (let i = 0; i < 100; i++) {}
console.timeEnd('100-elements');
// prints 100-elements: 225.438ms
```   

## console.trace([message][,...args])   

<a name="trace"></a>
+ `message` &lt;any&gt;
+ `...args` &lt;any&gt;   

使用字符串 `Trace :` 打印至 `stderr`。并且会包含堆栈信息。   

```javascript
console.trace('Show me');
// Prints: (stack trace will vary based on where trace is called)
//  Trace: Show me
//    at repl:2:9
//    at REPLServer.defaultEval (repl.js:248:27)
//    at bound (domain.js:287:14)
//    at REPLServer.runBound [as eval] (domain.js:300:12)
//    at REPLServer.<anonymous> (repl.js:412:12)
//    at emitOne (events.js:82:20)
//    at REPLServer.emit (events.js:169:7)
//    at REPLServer.Interface._onLine (readline.js:210:10)
//    at REPLServer.Interface._line (readline.js:549:8)
//    at REPLServer.Interface._ttyWrite (readline.js:826:14)
```   

## console.warn([data][,...args])

`console.error()` 的别名。<a name="warn"></a>
