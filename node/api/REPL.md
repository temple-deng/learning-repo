# REPL

<!-- TOC -->

- [REPL](#repl)
  - [设计及功能](#设计及功能)
    - [命令及特殊的键](#命令及特殊的键)
  - [默认的执行](#默认的执行)
    - [全局和局部作用域](#全局和局部作用域)
    - [访问核心模块](#访问核心模块)
    - [全局未捕获异常](#全局未捕获异常)
    - [对 `_` 变量的赋值](#对-_-变量的赋值)
    - [await 关键字](#await-关键字)
  - [自定义执行函数](#自定义执行函数)
  - [Class: REPLServer](#class-replserver)
    - [Event: 'exit'](#event-exit)
    - [Event: 'reset'](#event-reset)
    - [replServer.defineCommand(keyword, cmd)](#replserverdefinecommandkeyword-cmd)
    - [replServer.displayPrompt([preserveCursor])](#replserverdisplaypromptpreservecursor)
    - [replServer.clearBufferedCommand()](#replserverclearbufferedcommand)
    - [repl.start([options])](#replstartoptions)

<!-- /TOC -->

`repl` 模块提供了一种 Read-Eval-Print-Loop(REPL) 实现。这个实现既可以作为独立的程序
运行，也可以被包含在其他应用里：   

```js
const repl = require('repl');
```    

## 设计及功能

`repl` 模块暴露了 `repl.REPLServer` 类。当模块运行时，`repl.REPLServer` 的实例会接受
用户输入中的独立的每行，根据用户定义的执行函数执行这些输入，然后输出结果。输入和输出
可能分别来自 `stdin` 和 `stdout`，或者与任意的 Node.js 流连接。    

### 命令及特殊的键

在 REPL 实例中支持下列特殊的命令：    

+ `.break` - 在多行表达式输入中，.break 指令会终止对之后的输入的执行
+ `.clear` - 将 `context` 重置为一个空对象，清空当前输入的任意多行表达式
+ `.exit` - 关闭 IO 流，退出 REPL
+ `.help` - 展示特殊指令列表
+ `.save` - 将当前的 REPL 会话保存到文件中 `> .save ./file/to/save.js`
+ `.load` - 在当前 REPL 会话中加载一个文件
+ `.editor` - 进入编辑器模式     

在 REPL 中下列键的组合也有这些特殊的效果：   

+ `<ctrl> - C` - 按一次等同于 `.break`，两次等同于 `.exit`
+ `<ctrl> - D` - 等同于 `.exit`
+ `<tab>` - 在空白行按的时候，显示全局和局部变量，否则，展示相关的补全选项     

## 默认的执行

默认情况下，所有 `repl.REPLServer` 实例使用一个执行函数执行 JS 表达式并提供了对 Node.js
内置模块的访问。可以在创建实例的时候传入一个执行函数覆盖默认的行为。    

### 全局和局部作用域

可以给 `REPLServer` 实例关联一个 `context` 对象，这个对象上可以提供一些可全局访问的对象。   

```js
const repl = require('repl');
const msg = 'message';

repl.start('> ').context.m = msg;
```    

```bash
$ node repl_test.js
> m
'message'
```    

### 访问核心模块

执行器会自动加载核心模块。例如 `fs` 变量就是对核心 `fs` 模块的引用。    

### 全局未捕获异常

REPL 使用 domain 模块来捕获会话中所有未捕获的异常。   

不过这有以下的副作用：   

- 未捕获的异常不会触发 'uncaughtException' 事件
- 尝试使用 `process.setUncaughtExceptionCaptureCallback()` 去抛出错误

### 对 `_` 变量的赋值

执行器默认情况下就将最近执行完成的表达式的结果赋值给 `_` 变量。显示给这个变量赋值会禁止
这个行为。（是以后都禁止了）   

类似地， `_error` 引用最后一个出现的错误。显示设值也会禁用这种行为。   

### await 关键字

如果提供了 `--experimental-repl-awati` 命令行选项，则可以支持 `await` 关键字。    

```repl
> await Promise.resolve(123)
```    

## 自定义执行函数

```js
const repl = require('repl');
const { Translator } = require('translator');

const myTranslator = new Translator('en', 'fr');

function myEval(cmd, context, filename, callback) {
  callback(null, myTranslator.translate(cmd));
}

repl.start({ prompt: '> ', eval: myEval });
```   

这个就不看了，估计也用不到。   

## Class: REPLServer

使用 `repl.start()` 创建一个 `repl.REPLServer` 实例，注意不要用 `new` 关键字。   

### Event: 'exit'

收到 `.exit` 指令，按两次 `<ctrl>-C`，按一次 `<ctrl>-D` 都会收到事件，回调无参数。   

### Event: 'reset'

context 重置时触发。除非使用默认的执行器并且 `useGlobal: true`，否则在收到 `.clear`
指令时会发生 context 重置。回调接受 `context` 对象作为唯一的参数。   

### replServer.defineCommand(keyword, cmd)

+ `keyword` string 命令关键词，不带前缀的点
+ `cmd` Object | Function 当执行指令时调用的函数，如果是个对象，要有以下属性：
  - `help` string 当输入 `.help` 时的提示文本（可选参数）
  - `action` Function 执行的函数，可以接受一个字符串参数    

```js
const repl = require('repl');

const replServer = repl.start({ prompt: '> ' });
replServer.defineCommand('sayhello', {
  help: 'Say hello',
  action(name) {
    this.clearBufferedCommand();
    console.log(`Hello, ${name}!`);
    this.displayPrompt();
  }
});
replServer.defineCommand('saybye', function saybye() {
  console.log('Goodbye!');
  this.close();
});
```    

### replServer.displayPrompt([preserveCursor])

+ `preserveCursor` boolean

读入用户的输入，在输出中打印配置的 `prompt`，然后恢复对新输入的读取。主要是自定义命令
用来展示下一行的提示符。    

### replServer.clearBufferedCommand()

清空缓冲的还没执行的指令。    

### repl.start([options])

+ `options` Object | string
  - `prompt` string 展示的输入提示，默认是 `'> '`（带有追尾空格）
  - `input` stream.Readable
  - `output` stream.Writable
  - `terminal` boolean 如果为 `true`，输出应该被视为一个 TTY 终端
  - `eval` Function
  - `useColors` boolean
  - `useGlobal` boolean 如果为 `true`，使用 JS `global` 而不是使用 REPL 提供的 context
  作为全局对象。
  - `ignoreUndefined` boolean，如果为 `true`，那么在输出中就不再显示返回值为 `undefined`
  的结果了
  - `writer` Function 来格式化输出结果的函数，默认 `util.inspect()`
  - `completer` Function
  - `replMode` symbol 是否是在严格模式执行代码，可接受的值有：
    - `repl.REPL_MODE_SLOPPY`
    - `repl.REPL_MODE_STRICT`
  - `breakEvalOnSigint`
- Returns: repl.REPLServer

