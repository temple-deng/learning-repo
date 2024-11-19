# Command Line Options

<!-- TOC -->

- [Command Line Options](#command-line-options)
  - [概览](#概览)
  - [Options](#options)
    - [-](#-)
    - [--](#--)
    - [--abort-on-uncaught-exception](#--abort-on-uncaught-exception)
    - [--completion-bash](#--completion-bash)
    - [--enable-fips](#--enable-fips)
    - [--experimental-modules](#--experimental-modules)
    - [--experimental-repl-await](#--experimental-repl-await)
    - [--experimental-vm-modules](#--experimental-vm-modules)
    - [--experimental-worker](#--experimental-worker)
    - [--force-fips](#--force-fips)
    - [--inspect-brk[=[host:]port]](#--inspect-brkhostport)
    - [--inspect-port=[:host]:port](#--inspect-porthostport)
    - [--inspect[=[host:]port]](#--inspecthostport)
    - [--loader=file](#--loaderfile)
    - [--napi-modules](#--napi-modules)
    - [--no-deprecation](#--no-deprecation)
    - [--no-force-async-hooks-checks](#--no-force-async-hooks-checks)
    - [--no-warnings](#--no-warnings)
    - [--openssl-config=file](#--openssl-configfile)
    - [--pending-deprecation](#--pending-deprecation)
    - [--preserve-symlinks](#--preserve-symlinks)
    - [--preserve-symlinks-main](#--preserve-symlinks-main)
    - [--prof](#--prof)
    - [--prof-process](#--prof-process)
    - [--redirect-warnings=file](#--redirect-warningsfile)
    - [--throw-deprecation](#--throw-deprecation)
    - [--title=title](#--titletitle)
    - [--tls-cipher-list=list](#--tls-cipher-listlist)
    - [--trace-deprecation](#--trace-deprecation)
    - [--trace-event-categories](#--trace-event-categories)
    - [--trace-event-file-pattern](#--trace-event-file-pattern)
    - [--trace-events-enabled](#--trace-events-enabled)
    - [--trace-sync-io](#--trace-sync-io)
    - [--trace-warnings](#--trace-warnings)
    - [--track-heap-objects](#--track-heap-objects)
    - [--v8-options](#--v8-options)
    - [--v8-pool-size=num](#--v8-pool-sizenum)
    - [--zero-fill-buffers](#--zero-fill-buffers)
    - [-c, --check](#-c---check)
    - [-e, --eval "script"](#-e---eval-script)
  - [环境变量](#环境变量)
    - [NODE_DEBUG=module[,...]](#node_debugmodule)
    - [NODE_DISBABLE_COLORS=1](#node_disbable_colors1)
    - [NODE_EXTRA_CA_CERTS=file](#node_extra_ca_certsfile)
    - [NODE_NO_WARNINGS=1](#node_no_warnings1)
    - [NODE_OPTIONS=options...](#node_optionsoptions)
    - [NODE_PATH=path[:...]](#node_pathpath)
    - [NODE_PENDING_DEPRECATION=1](#node_pending_deprecation1)
    - [NODE_PRESERVE_SYMLINKS=1](#node_preserve_symlinks1)
    - [NODE_REDIRECT_WARNINGS=file](#node_redirect_warningsfile)
    - [NODE_REPL_HISTORY=file](#node_repl_historyfile)
    - [NODE_TLS_REJECT_UNAUTHORIZED=value](#node_tls_reject_unauthorizedvalue)
    - [NODE_V8_COVERAGE=dir](#node_v8_coveragedir)
    - [SSL_CERT_DIR=dir](#ssl_cert_dirdir)
    - [SSL_CERT_FILE=file](#ssl_cert_filefile)
    - [UV_THREADPOOL_SIZE=size](#uv_threadpool_sizesize)

<!-- /TOC -->

## 概览

```bash
$ node [options] [V8 options] [script.js | -e "script" | -] [--] [arguments]
```       

```bash
$ node inspect [script.js | -e "script" | <host>:<port>] ...
```    

```bash
$ node --v8-options
```    

如果不带参数执行的话就会进入 REPL 环境。    

关于 `node inspect` 的更多信息，查看 debugger 文档。    

## Options

所有的 options，包括 V8 options，单词之间可以使用中划线或者下滑线分隔。例如，`--pending-deprecation`
和 `--pending_deprecation` 是等价的。    

### -

stdin 的别名，即从标准输入读取内容，参数会传递给这个脚本。这个好像就是进入 REPL 了。这个
也是默认的选项，那其实就是进入 REPL。   

### --

node options 的结尾。后面的参数会传递给脚本。如果前面没有脚本文件名，那么后面的第一个参数
会当成第一个脚本文件名。    

### --abort-on-uncaught-exception

立刻中止而不是退出会使用调试器生成一个用于事后分析的核心文件。不过即使使用了这个标志位，
我们仍然可以使用 `process.setUncaughtExceptionCaptureCallback()` 来覆盖这种行为，使
其不会中止。    

### --completion-bash

没弄懂，跳过。    

### --enable-fips

在启动时启用兼容 FIPS 的加密。（要求在编译 Node.js 时使用 `./configure --openssl-fips`）    

### --experimental-modules

启用 ES 模块支持，支持模块缓存。   

### --experimental-repl-await

在 REPL 环境中支持顶层的 `await` 关键字。   

### --experimental-vm-modules

在 `vm` 模块提供对 ES 模块的支持。   

### --experimental-worker

使用 `worker_threads` 模块提供对 worker threads 的支持。   

### --force-fips

在启动时强制使用兼容 FIPS 加密。并且在代码中不可以禁止掉。（和 `--enable-fips` 同样的要求）    

### --inspect-brk[=[host:]port]

在 `host:port` 上激活 inspector，并且在用户脚本的开头处中断。默认是 `127.0.0.1:9229`。   

### --inspect-port=[:host]:port

设置激活 inspector 时的 `host:port`。在通过发送 `SIGUSR1` 信号激活 inspector 时有用。    

### --inspect[=[host:]port]

在 `host:port` 上激活 inspector。     

集成 V8 inspector 允许像 Chrome DevTools 和 IDEs 之类的工具对 Node.js 实例进行 debug
和 profile。    

工具通过 tcp 端口和 Node.js 实例进行绑定，使用 Chrome DevTools Protocol 通信。   

### --loader=file

使用特定的文件作为 ES 模块的加载器。    

### --napi-modules

这个选项没用。只是为了兼容而保留。   

### --no-deprecation

关闭 deprecation 告警。    

### --no-force-async-hooks-checks

禁用掉对 `async_hooks` 的运行时检查。    

### --no-warnings

禁止掉所有的进行告警（包括 deprecations）    

### --openssl-config=file

在启动时加载 OpenSSL 配置文件。    

### --pending-deprecation

发射 pending deprecation 告警。    

### --preserve-symlinks

通知模块加载器在定位和缓存模块时 prserve 符号链接。    

默认情况下，当 Node.js 加载一个符号链接时，它会自动找到真正的文件，并且使用其路径作为
模块标识符，并且用这个路径再去搜索其依赖的模块。在大多数情况下，这种默认行为都是可以
接受的。      

那我估计其实找模块还是会去找真正的模块，但是定位依赖的时候可能就是使用符号链接文件的路径了。    

这个标志位不会影响主模块（什么是主模块），如果想要在主模块上实现同样的行为，使用下面的那个
标志。   

### --preserve-symlinks-main

在主模块上实现和上面相同的行为。    

### --prof

生成 V8 profiler 输出。   

### --prof-process

处理使用 `--prof` 生成的输出。   

### --redirect-warnings=file

将进程告警写到额外的文件中，而不是直接在标准错误中打印。如果文件不存在，就创建一个，如果
存在，使用 append 模式追加。    

### --throw-deprecation

对于 deprecations 抛出错误。   

### --title=title

在启动时设置 `process.title`    

### --tls-cipher-list=list

指定一个额外的 TLS 加密列表。要求在构建 Node.js 时使用了加密支持。   

### --trace-deprecation

打印 deprecations 的堆栈。    

### --trace-event-categories

在使用 `--trace-events-enables` 启动了 trace events 时，追踪一个逗号分隔的目录列表。   

### --trace-event-file-pattern

存放 trace event 数据的文件路径的模板字符串。    

### --trace-events-enabled

启用对 trace event 事件消息的收集。   

### --trace-sync-io

在第一轮 event loop 中检测到同步 IO 的话，打印堆栈。    

### --trace-warnings

打印进程告警的堆栈（包括 deprecations）。    

### --track-heap-objects

跟踪堆快照上的对象分配情况。   

### --v8-options

打印 V8 命令行选项。   

### --v8-pool-size=num

设置 V8 线程池的大小。    

如果设置为 0，V8 会基于当前处理器的状态自动选择一个合适的尺寸。    

### --zero-fill-buffers

自动用 0 填充所有新建的 Buffer 和 SlowBuffer 实例。   

### -c, --check

在不执行脚本的情况下，进行语法检查。   

### -e, --eval "script"

将后面的参数当做是 JS 并执行。    

## 环境变量

### NODE_DEBUG=module[,...]

应该打印调试信息的逗号分隔的模块列表。   

### NODE_DISBABLE_COLORS=1

当设置为 1 时在 REPL 中不使用颜色。   

### NODE_EXTRA_CA_CERTS=file

没看懂。   

### NODE_NO_WARNINGS=1

设置为 1 时，禁用掉进程的告警。    

### NODE_OPTIONS=options...

一个空格分割的命令行参数的列表，这些参数会在真正的命令行参数前解释（因此它们是可以被覆盖的）。    

### NODE_PATH=path[:...]

在 Linux 上是冒号分隔的目录列表，用来搜索模块。在 Windows 上是分号分隔。    

### NODE_PENDING_DEPRECATION=1

设置为 1 时，发射 pending deprecation 告警。    

### NODE_PRESERVE_SYMLINKS=1

略。   

### NODE_REDIRECT_WARNINGS=file

略。   

### NODE_REPL_HISTORY=file

持久化存储 REPL 历史的文件路径。默认是 `~/.node_repl_history`。设置为空字符串会禁用
掉持久化存储历史的功能。    

### NODE_TLS_REJECT_UNAUTHORIZED=value

如果设置为 0，TLS 连接会禁用掉证书的验证功能（应该是对客户端证书的验证吧）。这会使 TLS
不安全。    

### NODE_V8_COVERAGE=dir

当设置了这个变量的话，Node.js 会开始输出 V8 代码的覆盖率到指定目录。     

### SSL_CERT_DIR=dir

如果启用了 `--use-openssl-ca`，这个变量会覆盖并设置一个目录包含受信任的证书。   

### SSL_CERT_FILE=file

同上，设置文件。    

### UV_THREADPOOL_SIZE=size

设置 libuv 线程池的尺寸。    

libuv 线程池会基于同步的系统 API 创建异步的 node API。下面的 Node.js API 使用了这个线程
池：   

+ 除了 file watcher 以及同步的 API 之外的所有 `fs` API
+ `crypto.pbkdf2()`
+ `crypto.randomBytes()` 除非其不带 callback 被调用
+ `crypto.randomFill()`
+ `dns.lookup()`
+ 所有的 `zlib` 异步 API

由于 libuv 线程池的尺寸是固定的，这也就意味着如果有一个 API 花费了很长的时间，那么其他
要使用线程池的 API 就不得不等待。为了除了这个问题，我们可以将这个变量设置为大于 4（默认值）
的值。    

Last Update: 2018.12.02
