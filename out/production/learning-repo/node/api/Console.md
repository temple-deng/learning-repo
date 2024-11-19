# Console

<!-- TOC -->

- [Console](#console)
  - [Class: Console](#class-console)
    - [new Console(stdout[,stderr][,ignoreErrors]), new Console(options)](#new-consolestdoutstderrignoreerrors-new-consoleoptions)
    - [console.assert(value[, ...message])](#consoleassertvalue-message)
    - [console.clear()](#consoleclear)
    - [console.count([label])](#consolecountlabel)
    - [console.countReset([label])](#consolecountresetlabel)
    - [console.debug(data[,...args])](#consoledebugdataargs)
    - [console.dir(obj[,options])](#consoledirobjoptions)
    - [console.dirxml(...data)](#consoledirxmldata)
    - [console.error([data][,...args])](#consoleerrordataargs)
    - [console.group([...label])](#consolegrouplabel)
    - [console.groupCollapsed()](#consolegroupcollapsed)
    - [console.groupEnd()](#consolegroupend)
    - [console.info([data][,...args])](#consoleinfodataargs)
    - [console.log([data][,...args])](#consolelogdataargs)
    - [console.table(tabularData[,properties])](#consoletabletabulardataproperties)
    - [console.time([label]), console.timeEnd([label])](#consoletimelabel-consoletimeendlabel)
    - [console.timeLog([label][,...data])](#consoletimeloglabeldata)
    - [console.trace([message][,...args])](#consoletracemessageargs)
    - [console.warn([data][,...args])](#consolewarndataargs)
  - [Inspector only methods](#inspector-only-methods)

<!-- /TOC -->

`console` 模块暴露了两个特定的组件：   

+ 一个带有 `console.log()`, `console.error()` 等方法的 `Class` 类，用来向任意流中写入
+ 一个全局的 `console` 实例，已经配置为写入 `process.stdout` 和 `process.stderr`     

**Note:** 这个全局的 console 对象，即不像浏览器里面那样同步，也不像其他 Node 流一样异步。    

## Class: Console

用以下方式获取这个类：   

```js
const { Console } = require('console');
const { Console } = console;
```    

### new Console(stdout[,stderr][,ignoreErrors]), new Console(options)

+ `options` Object
  - `stdout` stream.Writable
  - `stderr`
  - `ignoreErrors` 默认 true
  - `colorMode` boolean | string

### console.assert(value[, ...message])     

+ `value` any
+ ...message any    

使用 `util.format()` 格式化错误消息：   

```js
console.assert(true, 'does nothing');
console.assert(false, 'Whoops %s work', 'didn"t');
// Assertion failed: Whoops didn"t work
```    

### console.clear()

如果 `stdout` 是一个 TTY，这个函数会尝试清空 TTY。如果不是，就什么也不做。   

### console.count([label])

+ `label` string, 计数器的展示标记。默认 `'default'`     

```js
> console.count()
default: 1
undefined
> console.count('default')
default: 2
undefined
> console.count('abc')
abc: 1
undefined
> console.count('xyz')
xyz: 1
undefined
> console.count('abc')
abc: 2
undefined
> console.count()
default: 3
undefined
```    

### console.countReset([label])

略。   

### console.debug(data[,...args])

alias console.log   

### console.dir(obj[,options])

+ `obj` any
+ `options` Object
  - `showHidden` boolean, 如果为 `true` 则对象的非枚举和 symbol 属性也会展示
  - `depth` 默认 2，如果要无限，传 `null`
  - `colors`

使用 `util.inspect()` 输出 `obj`。    

### console.dirxml(...data)

将参数传递给 `console.log()`。和 XML 没什么关系。    


### console.error([data][,...args])

略。   

### console.group([...label])

后面的行增加两个空格缩进。如果提供了一个或多个 labels，那么在缩进前先打印这些。   

注意后面的所有行都是两个缩进，缩进不会递增。    

### console.groupCollapsed()

Alias console.group()    

### console.groupEnd()

后面的行减少两个空格缩进。    

### console.info([data][,...args])

Alias `console.log()`    

### console.log([data][,...args])

略。    

### console.table(tabularData[,properties])

略。   

### console.time([label]), console.timeEnd([label])

略。    

### console.timeLog([label][,...data])

```js
console.time('process');
const value = expensiveProcess1(); // Returns 42
console.timeLog('process', value);
// Prints "process: 365.227ms 42".
doExpensiveProcess2(value);
console.timeEnd('process');
```    

### console.trace([message][,...args])

向 stderr 中写数据。    

```js
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

### console.warn([data][,...args])

Alias `console.error()`    

## Inspector only methods

下面的 API 只在 inspector 中可用。    

+ `console.profile([label])`: 启动 JS CPU profile，数据会添加到 inspector 的 Profile
面板
+ `console.profileEnd([label])`
+ `console.timeStamp([label])` 在 Timeline 面板添加一个事件，使用 label 标记