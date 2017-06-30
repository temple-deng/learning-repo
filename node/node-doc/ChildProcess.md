# ChildProcess   

目录：    

+ [Asynchronous Process Creation]
  - [Spawning .bat and .cmd files on Windows]
  - [child_process.exec(command[, options][, callback])]
  - [child_process.execFile(file[, args][, options][, callback])]
  - [child_process.fork(modulePath[, args][, options])]
  - [child_process.spawn(command[, args][, options])]
    + options.detached
    + options.stdio
+ [Synchronous Process Creation]
  - [child_process.execFileSync(file[, args][, options])]
  - [child_process.execSync(command[, options])]
  - [child_process.spawnSync(command[, args][, options])]
+ [Class: ChildProcess]
  - [Event: 'close']
  - [Event: 'disconnect']
  - [Event: 'error']
  - [Event: 'exit']
  - [Event: 'message']
  - [child.channel]
  - [child.connected]
  - [child.disconnect()]
child.kill([signal])
child.pid
child.send(message[, sendHandle[, options]][, callback])
Example: sending a server object
Example: sending a socket object
child.stderr
child.stdin
child.stdio
child.stdout
maxBuffer and Unicode

# Child Process  

`child_process` 模块提供了与 `popen` 命令类似的但不完全相同生成子进程的能力。这个功能主要是
`child_process.spawn()` 函数提供的：    

```javascript
const { spawn } = require('child_process');
const ls = spawn('ls', ['-lh', '/usr']);

ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

ls.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});

ls.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
```    

默认情况下，这个函数会在父进程及生成的子进程之间建立 `stdin`, `stdout`, `stderr` 的管道。
我们可以用非阻塞的方式将流式数据通过管道在父子进程间传递。    

`child_process.spawn()` 方法会异步生成子进程，不会阻塞 Node.js event loop。`child_process.spawnSync()` 函数提供了相同的功能，不过使用的是同步的方法，会在生成的子进程
退出或者终止前一直阻塞 event loop。    

为方便起见，`child_process` 模块为`child_process.spawn()` 和 `child_process.spawnSync()` 提供了一些同步和异步的替代方法。请注意，这些替代方案都是在 `child_process.spawn()`或`child_process.spawnSync()`之上实现的。    

+ `child_process.exec()` 生成一个 shell 然后在这个 shell 中执行一个命令，在完成后将 `stdout`
, `stderr` 传递给回调函数。
+ `child_process.execFile()` 类似于 `exec()`，不过是直接生成命令而不会先生成一个 shell。
+ `child_process.fork()` 生成一个新的 Node.js 进程，调用指定的模块，建立IPC通信通道，允许在父子进程之间发送消息。
+ `child_process.execSync()` `child_process.exec()` 的同步版本，会阻塞 event loop。
+ `child_process.execFileSync()` `child_process.execFile()` 的同步版本，会阻塞 event loop。    

## Asynchronous Process Creation

<a name="part1"></a>   

`spawn()`, `fork()`, `exec()`, `execFile()` 等方法都遵从 Node.js 中典型的异步编程模式。    

这些方法都会返回一个 `ChildProcess` 实例。这些对象实现了 EventEmitter 接口，允许父进程注册
监听函数，然后在子进程生命周期中发生指定的事件时调用回调。    

### Spawning `.bat` and `.cmd` files on Windows

<a name="part11"></a>   

在类 Unix 的操作系统（Unix,Linux,macOS）中，`child_process.execFile()` 是更有效率的，
因为不用生成 shell。然而在 Windows 上，`.bat` 和 `.cmd` 文件在没有终端的时候是不能自执行的，
所有无法使用 `child_process.execFile()` 启动。所以在 Windows 上执行时，`.bat` 和 `.cmd` 文件
可以通过设置 `child_process.spawn()` 的 `shell` 选项调用，或者 `child_process.exec()`，或者
生成一个 `cmd.exe` 并将 `.bat` 或 `.cmd` 文件作为参数传入。在任何例子中，如果脚本文件名包含空格的
话，需要用引号引起来。   

### child_process.exec(command[,options][,callback])

<a name="exec"></a>   

+ `command` &lt;string&gt; 要运行的命令，及空格分隔的参数
+ `options` &lt;Object&gt;
  - `cwd` &lt;string&gt; 子进程的当前工作目录
  - `env` &lt;Object&gt; 环境的键值对
  - `encoding` &lt;string&gt; 默认 `'utf8'`
  - `shell` &lt;string&gt; 要执行命令的 shell（在 UNIX 上默认是 `'/bin/sh'`，在 Windows 上
  默认是 `'cmd.exe'`）
  - `timeout` &lt;number&gt; 默认 `0`
  - `maxBuffer` &lt;number&gt; stdout or stderr 允许的最大字节量（默认 `200*1024`），
  如果超出的话，子进程会终止
  - `killSignal` &lt;string&gt;|&lt;integer&gt; 默认 `'SIGTERM'`
  - `uid` &lt;number&gt; 设置进程的用户 ID
  - `gid` &lt;number&gt; 设置进程的组 ID
+ `callback` &lt;Function&gt; 当进程终止时使用输入调用
  - `error` &lt;Error&gt;
  - `stdout` &lt;string&gt; | &lt;Buffer&gt;
  - `stderr` &lt;string&gt; | &lt;Buffer&gt;
+ Returns: &lt;ChildProcess&gt;    

生成一个 shell，然后在 shell 中执行 `command`，缓冲任何生成的输出。`command` 是直接被 shell
处理，如果有特殊字符的话需要进行处理：    

```javascript
exec('"/path/to/test file/test.sh" arg1 arg2');
//Double quotes are used so that the space in the path is not interpreted as
//multiple arguments

exec('echo "The \\$HOME variable is $HOME"');
//The $HOME variable is escaped in the first instance, but not in the second
```    

如果提供了回调函数 `callback`，调用时有3个参数 `(error, stdout, stderr)`。在成功时，
`error` 为 `null`，如果出错的话， `error` 是 `Error` 实例。`error.code` 是子进程的
退出码，`error.signal` 是终止进程的信号。任何非 `0` 的退出码都认为是出了错。   

`stdout` and `stderr` 是子进程的标准输出和错误。默认情况下，Node.js 认为输出是解码为 UTF-8
的字符串，并将字符串传给回调。`encoding` 可以用来指定解码输出及错误时使用的字符编码。如果 `encoding`
是 `buffer`，或者是一个无法识别的字符编码，会将 `Buffer` 对象传给回调。   

默认的 `options` 参数如下：    

```javascript
const defaults = {
  encoding: 'utf8',
  timeout: 0,
  maxBuffer: 200 * 1024,
  killSignal: 'SIGTERM',
  cwd: null,
  env: null
};
```   

如果 `timeout` 是大于 `0`，如果子进程的运行时间超过 `timeout` 毫秒的话，父进程会将 `killSignal`
设置的信号发送给子进程。    

如果这个方法时使用 `util.promisify()` 版本调用的话，返回一个 Promise 对象，有 `stdout` 和 `stderr`
属性。如果出错的话，会返回一个 rejected 的 Promise，以及传递给回调时相同的 `error`，不过还有
两个额外的属性 `stdout` and `stderr`。    

```javascript
const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function lsExample() {
  const { stdout, stderr } = await exec('ls');
  console.log('stdout:', stdout);
  console.log('stderr:', stderr);
}
lsExample();
```   

### child_process.execFile(file[,args][,options][,callback])

<a name="execFile"></a>   

+ `file` &lt;string&gt; 要运行的可执行文件的名字或路径
+ `args` &lt;Array&gt; 字符串参数列表
+ `options` &lt;Object&gt;
  - `cwd` &lt;string&gt; 子进程的当前工作目录
  - `env` &lt;Object&gt; 环境键值对
  - `encoding` &lt;string&gt; 默认 `'utf8'`
  - `timeout` &lt;number&gt; 默认 `0`
  - `maxBuffer` &lt;number&gt; stdout or stderr 允许的最大字节量。默认(`200*1024`)如果
  超出的话，子进程会被终止。
  - `killSignal` &lt;string&gt;|&lt;number&gt; 默认 `SIGTERM`
  - `uid` &lt;number&gt; 设置进程的用户 ID
  - `gid` &lt;number&gt; 设置进程的组 ID
+ `callback` &lt;Function&gt;  当进程终止时用输出调用
  - `error` &lt;Error&gt;
  - `stdout` &lt;string&gt;|&lt;Buffer&gt;
  - `stderr` &lt;string&gt;|&lt;Buffer&gt;
+ Returns: &lt;ChildProcess&gt;    

类似于 `child_process.exec()`，但是不会生成 shell。指定的可执行文件 `file` 会直接作为
新进程生成。     

与 `child_process.exec()` 支持相同的选项。然而需要注意的是，由于不生成 shell，所有例如
I/O 重定向及文件 globbing 匹配等行为是不支持的。    

```javascript
const { execFile } = require('child_process');
const child = execFile('node', ['--version'], (error, stdout, stderr) => {
  if (error) {
    throw error;
  }
  console.log(stdout);
});
```    

传给回调的 `stdout` and `stderr` 参数会包含子进程输出的标准输出及错误。默认情况下，Node.js
会将输出解码为 UTF-8 字符串传递给回调。如果 `encoding` 是 `'buffer'`，或者无法识别的
字符编码，会传递 `Buffer` 对象给回调。    

如果方法是使用 `util.promisify()` 版本调用的，返回一个带有 `stdout` and `stderr` 属性的 Promise
对象。在出错的时候，返回一个带有 `stdout` and `stderr` 属性的 rejected 的 Promise 对象，
rejected 的回调参数是 `error`。     

### child_process.fork(modulePath[,args][,options])

<a name="fork"></a>   

+ `modulePath` &lt;string&gt; 在进程中要运行的模块
+ `args` &lt;Array&gt; 字符串参数列表
+ `options` &lt;Object&gt;
  - `cwd` &lt;string&gt; 子进程的当前工作目录
  - `env` &lt;Object&gt; 环境键值对
  - `execPath` 用来创建子进程的可执行文件
  - `execArgv` &lt;Array&gt; 传递给可执行文件的字符串参数列表，默认 `process.execArgv`
  - `silent` &lt;boolean&gt; 如果设为 `true`，子进程的标准输入，输出，错误会 piped 到父进程，
  否则，他们会从父进程继承。默认 `false`。
  - `stdio` &lt;Array&gt;| &lt;string&gt; 当提供这个选项的时候，会覆盖 `silent`。如果提供的是
  数组，那么必须包含一个元素值为 `'ipc'`，或者一个会抛出的错误。例如 `[1,2,3,'ipc']`。
  - `uid` &lt;number&gt; 设置进程的用户 ID
  - `gid` &lt;number&gt; 设置进程的组 ID
+ Returns: &lt;ChildProcess&gt;    

`child_process.fork()` 是 `child_process.spawn()` 的一种特殊的形式，专门用来生成新的 Node.js
进程。返回的 `ChildProcess` 实例内置有额外的通信通道用来在父子进程之间来回发送信息。    

需要注意的是生成的 Node.js 子进程与父进程是相互独立的，除了两者之间建立的 IPC 通信信道。
每个进程有其自身的内存，及其自身的 V8 实例。由于需要分配所需的额外的资源，不建议生成大量的
子进程。   

默认情况下，`child_process.fork()` 使用父进程的 `process.execPath` 生成新的 Node.js
实例。`options` 中 `execPath` 可以让我们使用一个替换的执行路径。    

使用定制的 `execPath` 启动的 Node.js 进程使用子进程中的环境变量 `NODE_CHANNEL_FG` 指定的
文件描述符来和父进程通信。    

*Note*: 不同于 `fork` POSIX 系统调用，`child_process.fork()` 不会克隆当前进程。     

### child_process.spawn(command[,args][,options])

<a name="spawn"></a>   

+ `command` &lt;string&gt; 要运行的命令
+ `args` &lt;Array&gt; 字符串参数列表
+ `options` &lt;Object&gt;
  - `cwd`
