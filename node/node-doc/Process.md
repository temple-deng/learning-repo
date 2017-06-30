# Process  

目录：   

+ [Process Events](#events)
  - [Event: 'beforeExit'](#eBeforeExit)
  - [Event: 'disconnect'](#eDisconnect)
  - [Event: 'exit'](#eExit)
  - [Event: 'message'](#eMessage)
  - [Event: 'rejectionHandled'](#eRejectionHandled)
  - [Event: 'uncaughtException'](#eUncatughtException)
    + Warning: Using 'uncaughtException' correctly
  - [Event: 'unhandledRejection'](#eUnhandleRejection)
  - [Event: 'warning'](#eWarning)
      Emitting custom warnings
  - [Signal Events](#eSignal)
process.abort()
process.arch
process.argv
process.argv0
process.channel
process.chdir(directory)
process.config
process.connected
process.cpuUsage([previousValue])
process.cwd()
process.disconnect()
process.emitWarning(warning[, options])
process.emitWarning(warning[, type[, code]][, ctor])
Avoiding duplicate warnings
process.env
process.execArgv
process.execPath
process.exit([code])
process.exitCode
process.getegid()
process.geteuid()
process.getgid()
process.getgroups()
process.getuid()
process.hrtime([time])
process.initgroups(user, extra_group)
process.kill(pid[, signal])
process.mainModule
process.memoryUsage()
process.nextTick(callback[, ...args])
process.pid
process.platform
process.release
process.send(message[, sendHandle[, options]][, callback])
process.setegid(id)
process.seteuid(id)
process.setgid(id)
process.setgroups(groups)
process.setuid(id)
process.stderr
process.stdin
process.stdout
A note on process I/O
process.title
process.umask([mask])
process.uptime()
process.version
process.versions
Exit Codes   

# Process  

`process` 对象是一个全局对象，可以为我们听当前 Node.js 进程的相关信息，以及控制当前进程。    

## Process Events  

<a  name="events"></a>

`process` 对象是一个 EventEmitter 实例。   

### Event: 'beforeExit'

<a  name="eBeforeExit"></a>   

`'beforeExit'` 事件会在 Node.js 清空其 event loop 且没有额外的工作安排时触发。一般情况下，
进程会在没有其他工作安排时退出，但是注册在 `'beforeExit'` 事件上的监听函数可以执行异步调用，
从而可能造成进程继续执行下去。    

监听回调函数只有一个 `process.exitCode` 值作为参数。   

`'beforeExit'` 事件不会在明确的进程结束时触发，例如调用 `process.exit()` 或者产生了未捕获的异常。     

`'beforeExit'` 事件不应该作为 `'exit'` 事件的替代品（应该是因为上面说到不是
一定会触发到），除非我们准备去安排额外的工作。    

### Event: 'disconnect'

<a name="eDisconnect"></a>     

如果Node.js进程是用 IPC channel 产生的（see child process and cluster），那么在关闭
IPC channel 时，将会发出 `'disconnect'` 事件。  

### Event: 'exit'

<a  name="eExit"></a>     

当 Node.js 的进程是由于下面的原因之一将要退出时触发 `'exit'` 事件：   

+ 明确的调用 `process.exit()` 方法。
+ Node.js 的 event loop 没有额外的工作需要执行了。    

在这个时间点上已经没有方法能阻止 event loop 不结束了，一旦所有 `'exit'` 的监听回调执行完成，
Node.js 进程就会终止。    

监听函数会使用退出码作为唯一参数调用，这个退出码可能是`process.exitCode` 指定的，也可能是调用`process.exit()` 方法时传入的 `exitCode` 参数。    

例如：    

```javascript
process.on('exit', (code) => {
  console.log(`About to exit with code: ${code}`);
});
```    

监听函数必须只执行同步操作。进程会在调用完 `'event'` 监听函数后立即退出，如果这时有异步任务
加入到 event loop 会被直接抛弃。例如下面的例子中，定时器永远不会执行：   

```javascript
process.on('exit', (code) => {
  setTimeout(() => {
    console.log('This will not run');
  }, 0);
});
```   

### Event: 'message'

<a name="eMessage"></a>    

如果Node.js进程是用 IPC channel 产生的，`'message'` 事件会在子进程收到父进程使用 `childprocess.send()` 给子进程发送的信息时触发。注意应该是在子进程上触发。   

监听回调使用如下的参数调用：   

+ `message` &lt;Object&gt; 一个解析完的 JSON 对象或者一个原始值
+ `sendHandle` &lt;Handle Object&gt; 一个 `net.Socket` or `net.Server` 对象，或者 `undefined`。    

### Event: 'rejectionHandled'  

<a name="eRejectionHandled"></a>    

无论何时有 `Promise` 变为了 rejected 状态，并且其错误捕获代码是要在 event loop 执行一圈后
才绑定的，那么就会触发 `'rejectionHandled'` 事件。    

监听回调使用 rejected 的 `Promise` 作为唯一参数调用的。    

这些 `Promise` 对象之前已经触发了 `'unhandledRejection'` 事件，但在处理过程过获取到了
错误捕获代码。其实看事件名差不多就能理解了，很可能 `Promise` 之前是没有捕获 rejected 的，
然后触发 `'unhandledRejection'` 事件，然后可能在这个事件处理程序中，又添加了事件处理程序。    

剩下的先略了。解释不来。    

### Event: 'uncaughtException'

<a name="eUncatughtException"></a>     

当一个未捕获的 JavaScript 异常一直冒泡到 event loop 时触发 `'uncaughtException'` 事件。
默认情况下，Node.js 会简单的将异常的堆栈信息打印到 `stderr` 然后退出。如果为这个事件
添加监听函数的话，就会覆盖这种默认行为。     

监听函数使用 `Error` 对象作为唯一的参数调用。     

```javascript
process.on('uncaughtException', (err) => {
  fs.writeSync(1, `Caught exception: ${err}\n`);
});

setTimeout(() => {
  console.log('This will still run.');
}, 500);

// Intentionally cause an exception, but don't catch it.
nonexistentFunc();
console.log('This will not run.');
```     

#### Warning: Using 'uncaughtException' correctly

注意这个事件不应当等价于 `On Error Resume Next`。未正常处理的异常会让应用处于一个未定义的
状态，可能会操作无法预料的问题。    

这个事件处理函数中抛出的异常将不会再能被捕获到。进程会直接退出并使用一个非0的退出码，且会
打印堆栈信息。这是为了避免无限循环。   

使用这个事件正确的方式是在进程关闭前执行对已分配资源的同步清理工作。    

### Event: 'unhandledRejection'

<a name="eUnhandleRejection"></a>    

当有 `Promise` 变为了 rejected，并且当前的 event loop 中没有绑定的错误处理程序，就触发
`'unhandledRejection'` 事件（这一下弄的 event loop 又复杂了）。    

监听函数会使用下面参数调用：   

+ `reason` &lt;Error&gt; | &lt;any&gt; promise rejected 的对象
+ `p` `Promise` 对象    

```javascript
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at:', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

somePromise.then((res) => {
  return reportToUser(JSON.pasre(res)); // note the typo (`pasre`)
}); // no `.catch` or `.then`
```    

### Event: 'warning'

<a name="eWarning"></a>    

无论何时进程发出一条警告时触发 `'warning'` 事件。    

进程警告类似于错误，因为它描述了引起用户注意的异常情况。不过，警告不是常规 Node.js 及 javascript
错误处理流中的一部分。Node.js 会在发现一些可能降低进程性能，引发 bug 等问题时的代码时
发出警告。     

监听函数调用时只有一个 `Error` 对象参数。包含了3个关键的描述警告的属性：   

+ `name` &lt;string&gt; 警告的名字（当前默认为 `Warning`）
+ `message` &lt;string&gt; 一个系统提供的警告信息
+ `stack` &lt;string&gt; 定位引起警告的代码位置的堆栈信息   

默认情况下，Node.js 会将警告打印到 `stderr`，`--no-warnings` 命令行选项可以用来禁止这种默认的
输入行为。    

### Signal Events

<a  name="eSignal"></a>

当进程收到信号时触发信号事件。每个事件的名字都是大写的信号名。   

```javascript
// Begin reading from stdin so the process does not exit.
process.stdin.resume();

process.on('SIGINT', () => {
  console.log('Received SIGINT.  Press Control-D to exit.');
});
```    

下面是一些需要注意的点：   

+ `SIGUSR1` 被 Node.js 保留用来开始 debugger。可以会在这个上监听事件但会终止 debugger 的启动。
+ `SIGTERM` and `SIGINT` 在非 Windows 平台上有默认的处理器。   

算了先不说了，用到时候再说。    

## process.abort()

<a name="abort"></a>

`process.abort()` 方法会使进程立即退出并生成一个核心文件（这个文件在哪我也不知道。。。。）。     

## process.arch  

<a name="arch"></a>    

+ &lt;string&gt;    

这个属性返回一个字符串，这个字符串指明了运行当前进程电脑的处理器架构。例如 `'arm'`,`'ia32'` or `'x64'`。    

## process.argv  

<a  name="argv"></a>   

+ &lt;Array&gt;   

返回一个数组，包含启动 Node.js 进程时传入的命令行参数。第一个元素是 `process.execPath`。
如果想要访问 `process.argv[0]` 的原始值查询 `process.argv0` 属性。第一个参数是被执行的
JavaScript 文件的路径。剩下的元素就是额外的命令行参数。   

例如，下面是 `process-args.js` 文件的内容：   

```JavaScript
// print process.argv
process.argv.forEach((val, index) => {
  console.log(`${index}: ${val}`);
});
```   

按如下方式启动进程：   

`$ node process-args.js one two=three four`    

则输出结果为：   

```JavaScript
0: /usr/local/bin/node
1: /Users/mjr/work/node/process-args.js
2: one
3: two=three
4: four
```    

## process.argv0  

<a  name="argv0"></a>   

+ &lt;string&gt;   

`process.argv0` 属性是只读属性，保存着 Node.js 开始时的 `argv[0]` 的原始值。   

```
$ bash -c 'exec -a customArgv0 ./node'
> process.argv[0]
'/Volumes/code/external/node/out/Release/node'
> process.argv0
'customArgv0'
```    

## process.channel   

<a name="channel"></a>    

如果Node.js 进程是由 IPC channel 生成的，`process.channel` 属性引用了这个 IPC channel。
如果没有 IPC channel 存在，返回 `undefined`。   

## process.chdir(directory)

+ `directory` &lt;string&gt;    

<a name="chdir"></a>   

这个方法会改变进程的当前工作目录，或者在这个操作失败时抛出异常（例如指定的目录不存在）。    

```javascript
console.log(`Starting directory: ${process.cwd()}`);
try {
  process.chdir('/tmp');
  console.log(`New directory: ${process.cwd()}`);
} catch (err) {
  console.error(`chdir: ${err}`);
}
```     

## process.config   

<a name="config"></a>    

+ &lt;Object&gt;    

返回一个对象，包含了用来编译当前 Node.js 可执行文件时的配置选项的 JavaScript 表示。这
与运行 `./configure` 脚本时生成的 `config.gypi` 文件内容一样。    

```JavaScript
{
  target_defaults:
   { cflags: [],
     default_configuration: 'Release',
     defines: [],
     include_dirs: [],
     libraries: [] },
  variables:
   {
     host_arch: 'x64',
     node_install_npm: 'true',
     node_prefix: '',
     node_shared_cares: 'false',
     node_shared_http_parser: 'false',
     node_shared_libuv: 'false',
     node_shared_zlib: 'false',
     node_use_dtrace: 'false',
     node_use_openssl: 'true',
     node_shared_openssl: 'false',
     strict_aliasing: 'true',
     target_arch: 'x64',
     v8_use_snapshot: 'true'
   }
}
```    

## process.connected

<a name="connected"></a>    

+ &lt;boolean&gt;   

如果进程是用 IPC channel 生成的，如果 IPC channel 还与进程相连就返回 `true`，在调用
`process.disconnect()` 后返回 `false`。   

如果这个属性为 `false`，就无法使用 `process.send()` 通过 channel 发送消息了。   

## process.cpuUsage([previousValue])

<a name="cpuUsage"></a>     

+ `previousValue` &lt;Objectgt; 一个之前调用 `process.cpuUsage()` 的返回值
+ Returns: &lt;Object&gt;
  - `uesr` &lt;integer&gt;
  - `system` &lt;integer&gt;

返回当前进程的用户和系统CPU时间使用情况，值是微秒为单位的。这些值分别测量了用户及系统代码的
耗费时间，如果是多核 CPU 执行进程的话，这个值可能比实际上耗费的时间还要多。   

如果将之前调用 `process.cpuUsage()` 返回值作为参数传入，可以获取一个比较值：   

```javascript
const startUsage = process.cpuUsage();
// { user: 38579, system: 6986 }

// spin the CPU for 500 milliseconds
const now = Date.now();
while (Date.now() - now < 500);

console.log(process.cpuUsage(startUsage));
// { user: 514883, system: 11226 }
```    

## process.cwd()  

<a name="cwd"></a>    

+ Returns: &lt;string&gt;

返回进程的当前工作目录：    

`console.log(`Current directory: ${process.cwd()}`);`    

## process.disconnect()

<a name="disconnect"></a>   

关闭与父进程的 IPC channel，从而可以让子进程在没有连接活动的时候可以优雅的退出。   

在子进程上调用 `process.disconnect()` 与在父进程上调用 `ChildProcess.disconnect()`
效果相同。    

## process.emitWarning(warning[,options])

<a name="emitWarning"></a>    

+ `warning` &lt;string&gt; | &lt;Error&gt; 要发出的警告
+ `options` &lt;Object&gt;
  - `type` &lt;string&gt; 当 `warning` 是字符串时，`type` 用来表示发出的警告类型。默认 `Warning`
  - `code` &lt;string&gt; 发出的警告实例的唯一的标识符
  - `ctor` &lt;Function&gt; 当 `warning` 为字符串时，可选的用来限制生成堆栈的函数，默认 `process.emitWarning`。   
  - `detail` &lt;string&gt; 错误中包含的额外的文本。    

用来触发定制的或者应用规定的进程的警告。    

```javascript
// Emit a warning with a code and additional detail.
process.emitWarning('Something happened!', {
  code: 'MY_WARNING',
  detail: 'This is some additional information'
});
// Emits:
// (node:56338) [MY_WARNING] Warning: Something happened!
// This is some additional information
```      

如果 `warning` 是个 `Error` 对象的话，那么 `options` 参数被忽略。   

## process.emitWarning(warning[,type[,code]][,ctor])

<a name="emitWarning1"></a>   

参数的说明同上。      

### Avoiding duplicate warnings

通常来说，每个进程应该只发出一次警告，推荐通过一个布尔值变量按如下的方式触发警告：   

```javascript
function emitMyWarning() {
  if (!emitMyWarning.warned) {
    emitMyWarning.warned = true;
    process.emitWarning('Only warn once!');
  }
}
emitMyWarning();
// Emits: (node: 56339) Warning: Only warn once!
emitMyWarning();
// Emits nothing
```      

## process.env  

<a name="env"></a>    

+ &lt;Object&gt;   

返回包含用户环境变量的对象，类似下面的样子：   

```javascript
{
  TERM: 'xterm-256color',
  SHELL: '/usr/local/bin/bash',
  USER: 'maciej',
  PATH: '~/.bin/:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin',
  PWD: '/Users/maciej',
  EDITOR: 'vim',
  SHLVL: '1',
  HOME: '/Users/maciej',
  LOGNAME: 'maciej',
  _: '/usr/local/bin/node'
}
```    

## process.execArgv   

+ &lt;Object&gt;   

返回启动 Node.js 进程时传入的 Node 特定的命令行选项集合。这些选项不会出现在 `process.argv`
返回的数组中，也不包含 Node.js 可执行文件，脚本的名字，及任何跟在脚本名后面的选项。
这些选项通常在生成子进程时有作用。    

例如 `$ node --harmony script.js --version`   

`process.execArgv` 为 `['--harmony']`, `process.argv` 为 `['/usr/local/bin/node', 'script.js', '--version']`。    

## process.execPath  

<a name="execPath"></a>   

+ &lt;string&gt;   

返回启动 Node.js 进程的可执行文件的路径。 `'/usr/local/bin/node'`。     

## process.exit([code])

<a name="exit"></a>   

+ `code` &lt;integer&gt; 退出码，默认为 0。    

命令 Node.js 使用退出码 `code` 同步地终止进程。如果省略了 `code`，则退出可能使用成功 `0`
或者使用设置好的 `process.exitCode` 值。   

需要注意的是调用 `process.exit()` 会强制进程尽可能快的退出，即使现在还有待处理的异步任务，
包括对 `process.stdout` and `process.stderr` 的 I/O 操作。    

例如下面的例子中可能会导致打印到标准输出的数据被截断丢失：   

```javascript
// This is an example of what *not* to do:
if (someConditionNotMet()) {
  printUsageToStdout();
  process.exit(1);
}
```   

之所以有这样的原因是 `process.stdout` 有时可能是异步的，并可能发生在Node.js even loop
的多个 ticks 上。       

## process.exitCode  

<a name="exitCode"></a>   

+ &lt;integer&gt;   

一个用作进程退出码的数字，无论进程是优雅的退出，还是调用 `process.exit()` 且没有指定退出码。     

在 `process.exit(code)` 是指定退出码或覆盖之前设置的 `process.exitCode`。    

## process.getegid()    

<a name="getegid"></a>   

返回 Node.js 进程有效的数字组标识符。     

```javascript
if (process.getegid) {
  console.log(`Current gid: ${process.getegid()}`);
}
```    

*Note*: 这个函数只在 POSIX 平台有效。   

## process.geteuid()

<a name="geteuid"></a>    

+ Returns: &lt;Object&gt;   

返回进程有效的数字用户标识符。    

```javascript
if (process.geteuid) {
  console.log(`Current uid: ${process.geteuid()}`);
}
```   

*Note*: 这个函数只在 POSIX 平台有效。   

## process.getgid()

<a name="getgid"></a>   

+ Returns: &lt;Object&gt;    

返回继承数字组标识符。    

*Note*: 这个函数只在 POSIX 平台有效。   

## process.getgroups()

<a name="getgroups"></a>    

+ Returns: &lt;Array&gt;    

返回补充的组 IDs 的数组。   

*Note*: 这个函数只在 POSIX 平台有效。   

## process.getuid()

<a name="getuid"></a>   

+ Returns: &lt;integer&gt;   

返回进程的数字用户标识符。   

*Note*: 这个函数只在 POSIX 平台有效。   

## process.hrtime([time])

<a name="hrtime"></a>   

+ `time` &lt;Array&gt; 上次调用 `process.hrtime()` 的结果
+ Returns: &lt;Array&gt;     

返回一个高分辨率的实际时间二元数组 `[seconds, nanoseconds]`，`nanoseconds` 是实际时间用秒
无法精确的部分。    

```javascript
const NS_PER_SEC = 1e9;
const time = process.hrtime();
// [ 1800216, 25 ]

setTimeout(() => {
  const diff = process.hrtime(time);
  // [ 1, 552 ]

  console.log(`Benchmark took ${diff[0] * NS_PER_SEC + diff[1]} nanoseconds`);
  // benchmark took 1000000552 nanoseconds
}, 1000);
```     


## process.initgroups(user,extra_group)

<a name="initgroups"></a>   

+ `user` &lt;string&gt;|&lt;number&gt; 用户名或数字标识符
+ `extra_group` &lt;string&gt;| &lt;number&gt; 用户组名字或数字标识符   

读取 `/etc/group` 文件并使用所有用户为组成员的组初始化组访问权限列表。这个操作要求进程
有 `root` 访问权限或者 `CAP_SETGID` 能力。   

## process.kill(pid[,signal])

<a name="kill"></a>     

+ `pid` &lt;number&gt; 进程ID
+ `signal` &lt;string&gt;|&lt;number&gt; 发送的信息，默认是 `'SIGTERM'`   

如果 `pid` 进程不存在的话会抛出错误，为了这种情况，信号 `0` 可以用来测试进程是否存在。Windows
会在 `pid` 用来 kill 一个进程组时抛出错误。    

*Note*: 虽然这个函数名字是 `kill`，但实际上只是一个信号发送者。    

```javascript
process.on('SIGHUP', () => {
  console.log('Got SIGHUP signal.');
});

setTimeout(() => {
  console.log('Exiting.');
  process.exit(0);
}, 100);

process.kill(process.pid, 'SIGHUP');
```    

## process.mainModule  

<a name="mainModule"></a>   

提供一种可替代的获取 `require.main` 方式。不同之处在如果主模块在运行时发生变化，`require.main`
在变化发生前可能还引用原始的主模块。一般来说，假设这两种方式引用同一模块是安全的。    

与 `require.main` 相同，如果没有入口脚本的话，`process.mainModule` 返回 `undefined`。  

## process.memoryUsage

<a name="memoryUsage"></a>     

+ Returns: &lt;Object&gt;
  - `rss` &lt;integer&gt;
  - `heapTotal` &lt;integer&gt;
  - `heapUsed` &lt;integer&gt;
  - `external` &lt;integer&gt;    

返回进程使用的内存的字节数量的对象。    

```javascript
{
  rss: 4935680,
  heapTotal: 1826816,
  heapUsed: 650472,
  external: 49879
}
```   

## process.nextTick(callback[,...args])

<a name="nextTick"></a>    

*Note*: next tick 队列会在 event loop 开始处理额外的 I/O 前完全清空。可能导致的结果是，递归
设置 nextTick 回调会阻塞 I/O，就像 `while(true)` 循环一样。   

## process.pid

<a name="pid"></a>   

+ &lt;integer&gt;   

进程的 PID。   

## process.platform

<a name="platform"></a>   

+ &lt;string&gt;   

返回进程运行在的操作系统平台。例如 `'darwin'`,`freebsd`,`'linux'`,`'sunos'` or `'win32'`。   

## process.release   

<a name="release"></a>   

返回一个包含当前发行版元信息的对象，包括源代码 tarball 的 URLs 等。   

包含以下属性：  

+ `name` &lt;string&gt; 对Node.js来说永远是 `'node'`，对以前的 io.js 来说是 `'io.js'`
+ `sourceUrl` &lt;string&gt; 指向当前发行版的源代码文件的 `.tar.gz` 文件的绝对 URL 地址
+ `headersUrl` &lt;string&gt; 指向当前发行版的源代码头部文件的 `.tar.gz` 文件的绝对 URL 地址
+ `libUrl` &lt;string&gt; 指向匹配当前架构与发行版本的 `node.lib` 文件的绝对 URL 地址
+ `lts` &lt;string&gt; 一个当前发行版的 LTS 标记字符串。如果 Node.js 不是 LTS，则为 `undefined`。

```javascript
{ name: 'node',
  lts: 'Boron',
  sourceUrl: 'https://nodejs.org/download/release/v6.10.0/node-v6.10.0.tar.gz',
  headersUrl: 'https://nodejs.org/download/release/v6.10.0/node-v6.10.0-headers.tar.gz',
  libUrl: 'https://nodejs.org/download/release/v6.10.0/win-x64/node.lib' }
```    

## process.send(message[,sendHandle[,options]][,callback])

<a name="send"></a>   

+ `message` &lt;Object&gt;
+ `sendHandle` &lt;Handle object&gt;
+ `options` &lt;Object&gt;
+ Returns: &lt;boolean&gt;

如果Node.js 是用 IPC channel 生成的，`process.send()` 用来给父进程发送信息。    

*Note*：这个方法内部会用 `JSON.stringify()` 序列化 `message`。   

## process.setegid(id)

<a name="setegid"></a>   

+ `id` &lt;string&gt; | &lt;number&gt; 用户组名或 ID

设置进程有效的组标识符。`id` 可以是一个数字 ID 或一个组名的字符串。如果指定的是组名，则
方法会一直阻塞到解析出对应的数字ID。   

```javascript
if (process.getegid && process.setegid) {
  console.log(`Current gid: ${process.getegid()}`);
  try {
    process.setegid(501);
    console.log(`New gid: ${process.getegid()}`);
  } catch (err) {
    console.log(`Failed to set gid: ${err}`);
  }
}
```   

*Note*: 函数只在 POSIX 平台生效。   

## process.seteuid(id)

<a name="seteuid"></a>   

+ `id` &lt;string&gt; | &lt;number&gt; 用户名或 ID   

设置进程有效的用户标识符。`id` 可以是一个数字 ID 或一个用户名的字符串。如果指定的是用户名，则
方法会一直阻塞到解析出对应的数字ID。   

*Note*: 函数只在 POSIX 平台生效。   

## process.setgid(id)

<a name="setgid"></a>   

+ `id` &lt;string&gt; | &lt;number&gt; 用户组名或 ID

设置进程组标识符。`id` 可以是一个数字 ID 或一个组名的字符串。如果指定的是组名，则
方法会一直阻塞到解析出对应的数字ID。   

*Note*: 函数只在 POSIX 平台生效。   

## process.setgroups(groups)

+ `groups` &lt;Array&gt;   

设置进程补充的组 IDs。这个操作要求进程有 `root` 或者 `CAP_SETGID` 能力。   

`groups` 可以包含数字组 IDs，组名或者两者都有。   

*Note*: 函数只在 POSIX 平台生效。   

## process.setuid(id)

<a name="setuid"></a>   

+ `id` &lt;string&gt; | &lt;number&gt; 用户名或 ID   

设置进程用户标识符。`id` 可以是一个数字 ID 或一个用户名的字符串。如果指定的是用户名，则
方法会一直阻塞到解析出对应的数字ID。   

*Note*: 函数只在 POSIX 平台生效。   

## process.stderr

<a name="stderr"></a>   

+ &lt;Stream&gt;

返回一个连接到 `stderr` (`fd`2)的流。这是一个 `net.Socket`，除非 `fd` 2 引用一个文件，这是
它会一个可写流。    

## process.stdin

<a name="stdin"></a>   

+ &lt;Stream&gt;   

返回一个连接到 `stdin`(fd `0`) 的流，这是一个 `net.Socket`，除非 `fd` 0 引用一个文件，这是
它会一个可读流。  

## process.stdout  

<a name="stdout"></a>   

+ &lt;Stream&gt;     

返回一个连接到 `stdin`(fd `1`) 的流，这是一个 `net.Socket`，除非 `fd` 1 引用一个文件，这是
它会一个可写流。  

### A note on process I/O

`process.stdout` and `process.stderr` 与其他 Node.js 流有许多不同：   

1. 他们是分别被 `console.log()` and `console.error()` 内部使用的。   
2. 他们不能被关闭
3. 用于不会触发 `'finish'` 事件
4. 取决于流连接到何处以及当前系统是 Windows 还是 Unix，写入可能是同步的：   
  + 文件：在 Windowa 及 Linux 上是同步的
  + TTYs(终端)：在 Windows 上异步，在 Unix 上同步
  + 管道（及套接字）：在 Windows 上同步，在 Unix 上异步

## process.title

<a name="title"></a>   

+ &lt;string&gt;   

返回当前进程的标题（例如返回当前 `ps`的值）。给属性设置新值会修改当前 `ps` 的值。   

*Note*: 当赋新值时，不同的平台对标题的最大长度有限制。   

## process.umask([mask])

<a name="umask"></a>   

+ `mask` &lt;number&gt;   

设置或者返回 Node.js 进程文件 mode creation mask。子进程会从父进程继承 mask。   

```javascript
const newmask = 0o022;
const oldmask = process.umask(newmask);
console.log(
  `Changed umask from ${oldmask.toString(8)} to ${newmask.toString(8)}`
);
```    

## process.uptime()

<a name="uptime"></a>   

+ Returns: &lt;number&gt;

返回当前进程已经运行的时间，秒为单位。

## process.version  

<a name="version"></a>   

+ &lt;string&gt;  

Node.js 版本字符串。   

## process.versions  

<a name="versions"></a>   

+ &lt;Object&gt;    

返回当前 Node.js 及其依赖的版本。

## Exit Codes

Node.js 通常会在没有其他待处理的异步任务时退出，状态码为 `0`。下面的状态码用于其他的情形：

+ `1` **Uncaught Fatal Exception** - 有未捕获的异常，并且没有被一个 domain 或 `'uncaughtException'` 事件处理程序处理。
+ `2` - Unused
+ `3` **Internal JavaScript Parse Error** - Node.js 内部启动进程的源代码造成了解析错误。很少见。
+ `4` **Internal JavaScript Evaluation Failure** - Node.js 内部启动进程的源代码启动失败并且
返回一个计算时生成的函数值。很少见
+ `5` **Fatal Error** - V8 出现不可修复的错误。通常会在 stderr 打印一个前缀为 `FATAL_ERROR` 的信息
+ `6` **Non-function Internal Exception Handler** - 有未捕获的异常，但是内部异常处理函数
莫名其妙的设置为非函数，且无法调用
+ `7` **Internal Exception Handler Run-Time Failure** - 有未捕获的异常，内部致命异常处理
函数自身在处理异常的时候抛出错误，通常会在 `'uncaughtException'` 处理中抛出异常
+ `8` Unused
+ `9` **Invalid Argument** - 要么是指定了为止的选项，要么是选项要求有值但没提供值。  
