# Process

<!-- TOC -->

- [Process](#process)
  - [Process Events](#process-events)
    - [Event: 'beforeExit'](#event-beforeexit)
    - [Event: 'disconnect'](#event-disconnect)
    - [Event: 'exit'](#event-exit)
    - [Event: 'message'](#event-message)
    - [Event: 'multipleResolves'](#event-multipleresolves)
    - [Event: 'rejectionHandled'](#event-rejectionhandled)
    - [Event: 'uncaughtException'](#event-uncaughtexception)
    - [Event: 'unhandledRejection'](#event-unhandledrejection)
    - [Event: 'warning'](#event-warning)
  - [process.abort()](#processabort)
  - [process.allowedNodeEnvironmentFlags](#processallowednodeenvironmentflags)
  - [process.arch](#processarch)
  - [process.argv](#processargv)
  - [process.argv0](#processargv0)
  - [process.channel](#processchannel)
  - [process.chdir(directory)](#processchdirdirectory)
  - [process.config](#processconfig)
  - [process.connected](#processconnected)
  - [process.cpuUsage([previousValue])](#processcpuusagepreviousvalue)
  - [process.cwd()](#processcwd)
  - [process.debugPort](#processdebugport)
  - [process.disconnect()](#processdisconnect)
  - [process.dlopen(module, filename[, flags])](#processdlopenmodule-filename-flags)
  - [process.emitWarning(warning[, options]), process.emitWarning(warning[, type[,code]][,ctor])](#processemitwarningwarning-options-processemitwarningwarning-typecodector)
  - [process.env](#processenv)
  - [process.execArgv](#processexecargv)
  - [process.execPath](#processexecpath)
  - [process.exit([code])](#processexitcode)
  - [process.exitCode](#processexitcode)
  - [process.getegid()](#processgetegid)
  - [process.geteuid()](#processgeteuid)
  - [process.getgid()](#processgetgid)
  - [process.getgroups()](#processgetgroups)
  - [process.getuid()](#processgetuid)
  - [process.hasUncaughtExceptionCaptureCallback()](#processhasuncaughtexceptioncapturecallback)
  - [process.hrtime([time])](#processhrtimetime)
  - [process.initgroups(user, extraGroup)](#processinitgroupsuser-extragroup)
  - [process.kill(pid[, signal])](#processkillpid-signal)
  - [process.mainModule](#processmainmodule)
  - [require.memoryUsage()](#requirememoryusage)
  - [process.nextTick(callback[, ...args])](#processnexttickcallback-args)
  - [process.noDeprecation](#processnodeprecation)
  - [process.pid, process.platform, process.ppid](#processpid-processplatform-processppid)
  - [process.send(message[, sendHandle[,options]][,callback])](#processsendmessage-sendhandleoptionscallback)
  - [process.setegid(id), process.seteuid(id), process.setgid(id), process.setuid(id)](#processsetegidid-processseteuidid-processsetgidid-processsetuidid)
  - [process.setGroups(groups)](#processsetgroupsgroups)
  - [process.setUncaughtExceptionCaptureCallback(fn)](#processsetuncaughtexceptioncapturecallbackfn)
  - [process.stdin, process.stdout, process.stderr](#processstdin-processstdout-processstderr)

<!-- /TOC -->

## Process Events

`process` 对象是一个 EventEmitter 的实例。   

### Event: 'beforeExit'

当 Node 清空了 event loop 并且也不存在其他的定期任务时触发。   

监听回调函数会收到一个参数，这个参数是 `process.exitCode`。    

这个事件不会在显示要求中止时触发，例如调用 `process.exit()` 或者是未捕获的异常。   

也就是说自然退出才会触发咯。   

### Event: 'disconnect'

如果 Node.js 是通过一个 IPC 通道派生出来的，那么当 IPC 通道关闭时触发 `disconnect` 事件。   

### Event: 'exit'

+ `code` integer

'exit' 事件在 Node.js 由于以下原因退出时触发：   

+ 调用 `process.exit()`
+ Node.js event loop 不再有异步任务要执行    

这时候已经无法取消进程的退出流程了，不像 beforeExit 还可以添加定时任务来取消退出。这时候
一旦所有的 exit 事件的监听器执行完，进程就中止了。   

监听函数必须是同步代码。其中如果有添加的异步逻辑会被丢弃。也就说 event loop 的循环取消了。   

### Event: 'message'

+ `message` Object | boolean | number | string | null, 一个解析过的 JSON 对象或者一个
可序列化的原始值
+ `sendHandle` net.Server | net.Socket

如果 Node 是由一个 IPC 通道派生的，那么当父进程使用 `childprocess.send()` 发送信息，子进程
收到信息时，子进程会触发 message 事件。   

### Event: 'multipleResolves'

+ `type` string, 错误类型，`resolve` or `reject`
+ `promise` Promise, The promise that resolved or rejected more than once.
+ `value` any, The value with which the promise was either resolved or rejected
after the original resolve.    

'multipleResolves' 事件会在一个 Promise:   

+ resolved 超过一次
+ rejected 超过一次
+ rejected after resolve
+ resolved after rejected     

这个事件可以用来追踪我们错误使用 promise 构造函数的代码。    

### Event: 'rejectionHandled'

+ promise

貌似是这个意思，当一个 Promise rejected 了，但是直到下一轮的 event loop 才给其添加
错误处理函数时，就会触发这个事件。     

这种情况下，Promise 会首先触发一个 'unhandledRejection' 事件，然后在这个事件处理中，
为 Promise 添加了 rejection handler。    

### Event: 'uncaughtException'

接收某一个 Error 实例作为监听器函数的参数：   

```js
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

### Event: 'unhandledRejection'

Promise rejected 但是在本轮 event loop 中没有添加错误处理函数时触发。    

+ `reason` Error | any
+ `p` the Promise that was rejected

### Event: 'warning'

+ `warning` Error:
  - `name` 警告的名称，默认 `Warning`
  - `message`
  - `stack`    

当 Node 收到一个进程告警时触发。    

一个进程告警类似于一个描述了异常状态的错误，需要引起用户的注意。但是，警告不是 Node 和
JS 错误处理流中的一部分。Node.js 会在其检测到不好的代码实践或者安全问题时发出警告。   

即使使用 --no-warnings 命令行参数，这个事件还是会触发。    

## process.abort()

进程立刻退出，并生成一个核心文件。    

Worker 线程中不可用。  

## process.allowedNodeEnvironmentFlags

+ Set

没看懂，略。   

## process.arch

略。   

## process.argv

+ string\[\]

启动 Node 进程时的命令行参数。第一个元素是 `process.execPath`，第二个元素是执行的 JS 
文件的路径。剩下的参数就是额外的命令行参数。   

```js
// process-args.js
process.argv.forEach((val, index) => {
  console.log(`${index}: ${val}`);
});
```   

```
node process-args.js one two=three four
```    

```
0: /usr/local/bin/node
1: /Users/mjr/work/node/process-args.js
2: one
3: two=three
4: four
```    

## process.argv0

+ string

存储 `argv[0]` 原始值的只读副本。     

```js
$ bash -c 'exec -a customArgv0 ./node'
> process.argv[0]
'/Volumes/code/external/node/out/Release/node'
> process.argv0
'customArgv0'
```   

## process.channel

+ Object

如果进程由 IPC 通道派生出来的，`process.channel` 是对通道的引用。    

## process.chdir(directory)

+ `directory` string

改变 CWD，如果操作失败抛出异常。    

Worker 中不可用。   

## process.config

+ Object

编译 Node 可执行文件时的配置选项。    

## process.connected

+ boolean

Node 由 IPC 生成，如果通道还连接时返回 `true`，如果调用了 `process.disconnect()` 返回
`false`。    

## process.cpuUsage([previousValue])

+ `previousValue` Object 前一次调用 `process.cpuUsage()` 的返回值
+ Returns: Object
  - `user` integer
  - `system` integer

返回当前进程的用户和系统 CPU 事件的用量。单位是 **微秒**。    

## process.cwd()

略。   

## process.debugPort

略。   

## process.disconnect()

由 IPC 生成的进程，`process.disconnect()` 会关闭到父进程的通道，运行子进程在没有其他活动
连接的时候可以优雅地退出。    

## process.dlopen(module, filename[, flags])

+ `module` Object
+ `filename` string
+ `flags` os.constants.dlopen    

动态加载共享对象(DLL?)。`require()` 用它来加载 C++ 插件，通常不会直接使用。    

## process.emitWarning(warning[, options]), process.emitWarning(warning[, type[,code]][,ctor])

+ `warning` string | Error
+ `options`:
  - `type` string, 当 `warning` 是字符串时，type 指警告的类型，默认 `Warning`
  - `code` string, 警告实例的 ID
  - `ctor` Function, 如果 warning 是字符串，ctor 是可选的参数用来限制生成的堆栈
  - `detail` string 额外的文本

## process.env

+ Object

## process.execArgv

+ string\[\]   

启动 Node 进程时的 Node.js 特定的命令行参数的集合。这些参数不会出现在 `process.argv`
的数组中，也不包含 Node 可执行文件和脚本文件的路径，以及任何跟在脚本文件名后面的参数。
这些选项在父进程想要派生一个有相同执行环境的子进程时有用。   

```
node --harmony script.js --version
```   

process.execArgv: `['--harmony']`。   

process.argv: `['/usr/local/bin/node', 'script.js', '--version']`    

## process.execPath

启动 Node 进程可执行文件的绝对路径。   

## process.exit([code])

如果 `code` 省略了，那么就使用 0 或者设置了 `process.exitCode` 的话就用这个属性的值。    

`process.exit()` 会强制进程尽快地退出。    

## process.exitCode

略。   

## process.getegid()

有效用户组 ID。   

## process.geteuid()

略。   

## process.getgid()

进程的用户组 ID。   

## process.getgroups()

+ integer\[\]    

## process.getuid()

略。   

## process.hasUncaughtExceptionCaptureCallback()   

+ Returns: boolean

表明是否使用 `process.setUncaughtExceptionCaptureCallback()` 设置了回调。   

## process.hrtime([time])

+ `time` integer\[\], 前一次调用 `process.hrtime()` 的结果
+ Returns: integer\[\]

貌似以一个二元组 `[seconds, nanoseconds]` 返回当前高精度的时间。    

## process.initgroups(user, extraGroup)

+ `user` string | number 用户名或用户 ID
+ `exitGroup` string | number 组名或者组 ID

操作 `/etc/group` 文件。    

## process.kill(pid[, signal])

+ `signal` string | number，默认 `SIGTERM`    

## process.mainModule

+ Object

与 `require.main` 的区别就是，main module 是可以在运行时改变的，但是 `require.main`
会一直引用原始的 main module。    

## require.memoryUsage()

+ Returns: Object
  - `rss`: integer
  - `heapTotal`
  - `heapUsed`
  - `external`

字节为单位。    

`heapTotal` 和 `heapUsed` 是 V8 内存，`external` 是 V8 管理的绑定到 JS 对象上的 C++
对象用的内存，rss 是进程的主内存，即堆栈段，代码段。    

## process.nextTick(callback[, ...args])

略。   

## process.noDeprecation

+ boolean

表明是否设置 `--no-deprecation` 标志。    

## process.pid, process.platform, process.ppid

略。   

## process.send(message[, sendHandle[,options]][,callback])

如果 Node 由 IPC 生成，这个方法就发送消息给父进程。   

## process.setegid(id), process.seteuid(id), process.setgid(id), process.setuid(id)

略。   

## process.setGroups(groups)

略。   

## process.setUncaughtExceptionCaptureCallback(fn)

略。   

## process.stdin, process.stdout, process.stderr

略。   