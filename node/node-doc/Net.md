# Net

目录：   

+ [socket.bufferSize](#so_bufferSize)
+ [socket.bytesRead](#so_bytesRead)
+ [socket.bytesWritten](#so_bytesWritten)
+ [socket.connect()](#so_connect)
+ [socket.connect(options[, connectListener])](#so_connect1)
+ [socket.connect(path[, connectListener])](#so_connect2)
+ [socket.connect(port[, host][, connectListener])](#so_connect3)
+ [socket.connecting](#so_connecting)
+ [socket.destroy([exception])](#so_destroy)
+ [socket.destroyed](#so_destroyed)
+ [socket.end([data][, encoding])](#so_end)
+ [socket.localAddress](#so_localAddress)
+ [socket.localPort](#so_localPort)
+ [socket.pause()](#so_pause)
+ [socket.ref()](#so_ref)
+ [socket.remoteAddress](#so_remoteAddress)
+ [socket.remoteFamily](#so_remotePort)
+ [socket.remotePort](#so_remotePort)
+ [socket.resume()](#so_resume)
+ [socket.setEncoding([encoding])](#so_setEncoding)
+ [socket.setKeepAlive([enable][, initialDelay])](#so_setKeepAlive)
+ [socket.setTimeout(timeout[, callback])](#so_setTimeout)
+ [socket.unref()](#so_unref)
+ [socket.write(data[, encoding][, callback])](#so_write)
+ [net.connect()](#netConnect)
+ [net.connect(options[, connectListener])](#netConnect1)
+ [net.connect(path[, connectListener])](#netConnect2)
+ [net.connect(port[, host][, connectListener])](#netConnect3)
+ [net.createConnection()](#createConnection)
+ [net.createConnection(options[, connectListener])](#createConnection1)
+ net.createConnection(path[, connectListener])
+ net.createConnection(port[, host][, connectListener])
+ [net.createServer([options][, connectionListener])](#createServer)
+ [net.isIP(input)](#isIP)
+ [net.isIPv4(input)](#isIPv4)
+ [net.isIPv6(input)](#isIPv6)

# Net

`net` 模块为创建基于流的 TCP or IPC 服务器（`net.createServer()`）和客户端（`net.createConnection()`）提供了异步的 API。    

`const net = require('net');`    

## IPC Support   

`net` 模块在 Windows 上使用命名管道支持 IPC，在其他系统使用 UNIX domain sockets。    

### Identifying paths for IPC connections

`net.connect()`, `net.createConnection()`, `server.listen()` and `socket.connect()`
接受一个 `path` 参数来识别 IPC 终端。     

在 UNIX 上，本地域也称为 UNIX 域。路径是一个文件系统的路径名。它被截断为`sizeof(sockaddr_un.sun_path)-1`，其在不同的操作系统上在91和107字节之间变化。在 Linux 的
典型值为107，在maxOS 上为103。该路径遵守与创建文件时相同的命名约定和权限检查。其会在文件系统中可见，
并且将 *persist until unlinked* 保持在待链接状态？。     

在 Windows 上，本地域是通过使用命名管道实现的。路径必须引用 `\\?\pipe\` or `\\.\pipe\`。
任何字符都是运行的，但是随后可能对管道名做一些处理，例如解决 `..` 序列。由于这种行为，管道名字空间
是扁平化的。管道不能维持，当对其最后一个引用关闭时其会被移除。注意由于 JavaScript 字符串的转义，
所以要求路径使用双斜线：    

```javascript
net.createServer().listen(
    path.join('\\\\?\\pipe', process.cwd(), 'myctl'));
```    

## Class: net.Server   

这个类用来创建一个 TCP or IPC 服务器。    

## new net.Server([options][, connectionListener])

参照 `net.createServer([options][, connectionListener])`。    

`net.Server` 是一个包含下列事件的 `EventEmitter`:   

### Event:'close'

当服务器关闭时触发。注意只要有连接存在，事件就必须等所有连接关闭后触发。     

### Event: 'connection'

+ &lt;net.Socket&gt; 连接对象    

当新连接建立时触发。 `socket` 是一个 `net.Socket` 实例。    

### Event: 'error'

+ &lt;Error&gt;    

不同于 `net.Socket`，除非手动调用 `server.close()`，否则 `'close'` 事件不会在 `'error'` 发生
后自动触发。    

### Event: 'listening'

当服务器在调用 `server.listen()`  绑定后触发。    

### server.address()

如果服务器监听在一个 IP socket上，那么返回操作系统汇报的绑定的地址，地址族名字（address family name），以及服务器的端口。在查找获取 OS 安排的地址中的端口时很有用。返回一个带有 `port`,`family`,`address` 属性的对象：`{ port: 12346, family: 'IPv4', address: '127.0.0.1' }`。     

对于一个监听管道或者 UNIX domain socket 的服务器，会返回名字字符串。    

```javascript
const server = net.createServer((socket) => {
  socket.end('goodbye\n');
}).on('error', (err) => {
  // handle errors here
  throw err;
});

// grab an arbitrary unused port.
server.listen(() => {
  console.log('opened server on', server.address());
});
```   

在 `listening` 事件触发前不要调用 `server.address()`。    

### server.close([callback])

停止服务器，不再接受新的连接，但会保持现有的连接。函数是异步的，服务器会在所有连接都结束，服务器
触发 `'close'` 事件后才完全关闭。    

### server.getConnections(callback)

异步获取当前服务器并发的连接数。当 sockets 发送给 forks 时生效。    

回调应该有两个参数 `err` and `count`。     

### server.listen()

开始服务器监听连接的功能。取决于服务器监听的类型，`net.Server` 可以是 TCP or IPC 服务器。    

可能的签名有：   

+ `server.listen(handle[, backlog][, callback])`
+ `server.listen(options[, callback])`
+ `server.listen(path[,backlog][, callback])` for IPC servers
+ `server.listen([port][, host][, backlog][, callback])` for TCP servers   

这个函数是异步的。当服务器开始监听时，`listening` 事件触发。最后的参数 `callback` 会被添加
为 `listening` 事件的监听函数。    

所有的 `listen()` 方法可以接收一个 `backlog` 参数来指定待处理队列的最大长度。准确的长度由
系统决定。默认值为511。

*Note*:   

+ 所有的 `net.Socket` 设为 `SO_REUSEADDR`
+ `server.listen()` 方法可以调用多次。每次后面的调用都会使用提供的 options re-open 服务器。    

一个常见的错误是监听时是 `EADDRINUSE`。这会在当另一个服务器已经在要求的 `port/path/handle` 上
监听了（相当于被占用了）。一种常见的解决办法是等一段时间后重试：   

```javascript
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log('Address in use, retrying...');
    setTimeout(() => {
      // 奇怪，既然监听时出了错误，那么应该就没有连接建立，为何要
      server.close();
      server.listen(PORT, HOST);
    }, 1000);
  }
});
```    

#### server.listen(handle[, backlog][,callback])

+ `handle` &lt;Object&gt;
+ `backlog` &lt;number&gt;
+ `callback` &lt;Function&gt;    

服务器开始在给定的，之前已经与一个端口，一个 UNIX domain socket，
或者一个 Windows 命名管道绑定了的 `handle` 上监听连接。       

`handle` 对象可以是一个服务器，一个 socket(任何底层包括 `_handle` 成员的东西)，或者一个包含
`fd` 成员是一个有效文件描述符的对象。    

*Note*: Windows 系统不支持监听一个文件描述符。     

#### server.listen(options[,callback])

+ `options` &lt;Object&gt; 支持下面的属性
  - `port`
  - `host` &lt;string&gt;
  - `path` &lt;string&gt; 如果指定 `port` 的话会被忽略
  - `backlog` &lt;number&gt;
  - `exclusive` &lt;boolean&gt; 默认 `false`
+ `callback`    

如果指定了 `port`，那么这个函数的行为与 `server.listen([port][, host][, backlog][, callback])`
相同。否则的话，如果声明了 `path`，行为与 `server.listen(path[, backlog][, callback])`
相同。如果都没声明，抛出错误。   

如果 `exclusive` 是 `false`，那么 cluster workers 也可以使用底层的 handle，来进行
连接处理工作的共享（其实不懂）。当为 `true` 时，handle 是不可以共享的。     

#### server.listen(path[,backlog][,callback])

+ `path` &lt;String&gt; 服务器应该监听的路径
+ `backlog`
+ `callback`    

在 `path` 上开始 IPC 服务器的监听连接任务。    


#### server.listen([port][, host][, backlog][, callback])   

在给定的 `host` and `port` 上开始 TCP 服务器的监听连接任务。    

如果 `port` 被省略或者为0，操作系统会安排一个任意的未使用的端口，在 `'listening'` 事件
触发后可以通过 `server.address().port` 获取到。   

如果 `host` 省略了，服务器会在 IPv6 可用时在 (`::`) 上监听连接，否则就是 (`0.0.0.0`)。    

*Note*:在大部分操作系统中，监听 `::` 的同时也会监听 `0.0.0.0`。    

### server.listening   

布尔值属性，表明服务器是否在监听连接。   

### server.maxConnections

当服务器的连接总量变得很高时，可以通过设置这个属性来拒绝一些连接。   

### server.ref()

与 `unref` 相反的操作，与 `timeout.ref()` 类似。如果进程中只剩一个服务器的任务，且服务器
之前调用过 `unref`，那么这个方法可以让进程不要退出。    

返回 `server`。    

### server.unref()

略。   

## Class: net.Socket

这个类是对一个 TCP socket or 一个 streaming IPC endpoint 的抽象。一个 `net.Socket` 也是
一个双向流。    

用户可以创建一个 `net.Socket` 并且用它来直接与服务器交互。例如，`net.createConnection()`
会返回一个 `net.Socket`，我们可以用它来与服务器交互    

它可以被 Node.js 创建，然后当用户收到连接时传递给我们。例如，它会传递给 `net.Server` 上
触发的 `connection` 的监听回调函数中，所以用户可以直接与客户端交互。    

注意上面其实分别介绍了两种场景，当我们是处在客户端时，可以手动建立 socket，连接服务器，
但我们处在服务器端时，可以在客户端连接时拿到使用的 socket。    

### new net.Socket([options])

创建一个新的 socket对象。　　　

+ `options` &lt;Object&gt; 可用的选项有：
  - `fd` &lt;number&gt; 如果指定了这个选项，就使用给定的文件描述符包裹一个存在的 socket，否则
  就新建一个 socket。
  - `allowHalfOpen` &lt;boolean&gt; 指定是否允许半打开的 TCP 连接，默认为 `false`
  - `readable` &lt;boolean&gt; 当 `fd` 传递时允许在 socket 上读，否则被忽视。默认为 `false`
  - `writable` &lt;boolean&gt; 当 `fd` 传递时允许在 socket 上写，否则被忽视。默认为 `false`   
+ Returns: &lt;net.Socket&gt;   

新建的 socket 可能是一个 TCP socket 也可能是一个 streaming IPC endpoint，取决于其 `connect()` 什么。    

### Event: 'close'   

+ `had_error` &lt;boolean&gt; 如果 socket 有传输错误的话为 `true`    

一旦 socket 关闭后立刻触发。`had_error` 表明 socket 是否因为传输错误关闭的。    

### Event: 'data'

+ &lt;Buffer&gt;    

收到数据时触发。 参数`data` 可能是 `Buffer` 或者 `String`。数据的编码方式是由 `socket.setEncoding()`设置的。     

注意如果 socket 触发 `data` 事件时没有监听函数，那么数据会丢失。  

### Event: 'drain'

当写入缓冲区清空时触发。    


### Event: 'end'

当 socket 的另一端发送了一个 FIN 包时触发，此时结束 socket 的读取一端。   

默认情况下（`allowHalfOpen` 为 `false`），socket 在写入队列中的数据完全写入后也会发送
一个 FIN 包回去，然后破坏其文件描述符。然而如果 `allowHalfOpen` 为 `true`，socket 不会
自动调用 `end()` 来结束写入操作，仍然可以用户继续写入数据。用户必须手动的调用 `end()` 来
关闭连接。    

### Event: 'error'

+ &lt;Error&gt;    

`close` 事件会紧随这个事件触发后直接触发。     

### Event: 'lookup'

在解析出主机名但还没有建立连接前触发。不适用于 UNIX sockets。     

+ `err` &lt;Error&gt; | &lt;null&gt; 参见 `dns.lookup()`
+ `address` &lt;string&gt; IP 地址
+ `family` &lt;string&gt; | &lt;null&gt; 地址类型
+ `host` &lt;string&gt; 主机名     

### Event:'timeout'

当 socket 不活动的时间超时后触发。这个事件只是通知 socket 是闲置状态的，用户必须手动关闭连接。    


### socket.address()

返回操作系统报告的 socket 绑定的地址，地址族名及端口。返回一个带有3个属性的对象。例如：
`{ port: 12346, family: 'IPv4', address: '127.0.0.1' }`。     

### socket.bufferSize    

<a name="so_bufferSize"></a>    

`net.Socket` 有 `socket.write()` 始终有效的特性。Node.js 会将要写入 `socket` 的数据
在内部排队，并且在可能的时候将其发送出去。     

这种内部缓冲的结果就是内存的使用量会变高。这个特性展示了当前缓冲的待写入的字符的数量。（字符数大约等于要写入的字节数，但是缓冲区可能包含字符串，并且这些字符串是懒惰编码的，所以确切的字节量是不知道的。）

### socket.bytesRead   

<a name="so_bytesRead"></a>    

接受到的字节数。    

### socket.bytesWritten

<a name="so_bytesWritten"></a>     

发送的字节量。    

### socket.connect()

<a name="so_connect"></a>    

在给定的 socket 上初始化一个连接。   

可能的签名有：   

+ `socket.connect(options[,connectListener])`
+ `socket.connect(path[,connectListener])` for IPC connections
+ `socket.connect(port[,host][,connectListener])` for TCP connections   

这个函数是异步的。当建立连接后，`connect` 事件触发。如果连接过程中出了错，那么就是触发 `error`
事件。如果提供了 `connectListener`，那么会被添加到 `connect` 事件（然而上面没有提到有 `connect` 事件啊）监听函数中去（注意这里强调了一个
once，应该是类似于执行 once 然后就取消绑定）。     

#### socket.connect（options[,connectListener]

<a  name="so_connect1"></a>   

+ `options` &lt;Object&gt;
+ `connectListener`
+ Returns: &lt;net.Socket&gt; socket 本身      

通常来说没必要使用这个方法，应该使用 `net.createConnection()` 新建并打开 socket。只有
在实现定制的 Sokcet 时使用这个方法。      

对于 TCP 连接来说，可选的 `options`如下：　　

+ `port` &lt;number&gt; 必需。socket 连接的端口
+ `host` &lt;string&gt; socket 连接的主机。默认 `'localhost'`
+ `localAddress` &lt;string&gt; socket 连接时在本地的地址
+ `localPort` &lt;number&gt; socket 连接时在本地的端口
+ `family` &lt;number&gt; IP 版本。默认是 4
+ `hints` &lt;number&gt; 可选的 `dns.lookup()` hints
+ `lookup` &lt;Function&gt; 定制的 lookup 函数。默认是 `dns.lookup`    


对于 IPC 连接来说，可选的 `options` 如下：   

+ `path` &lt;string&gt; 必需。应该连接到的客户端的路径。    

#### socket.connect(path[,connectListener])

<a name="so_connect2"></a>   

等同于 `socket.connect({ path: path }[,connectListener])`。   

#### socket.connect(port[,host][,connectListener])

<a name="so_connect3"></a>    

等同于 `socket.connect({ port: port, host: host}[,connectListener])`。    

### socket.connecting  

<a name="so_connecting"></a>    

当调用 `socket.connect()` 后但是还没有完成连接时返回 `true`，其余时间就是 `false`。   

### socket.destroy([exception])

<a name="so_destroy"></a>    

确保在 socket 上不会再有 I/O 活动。只有在出错的情况才需要调用这个方法。    

如果指定了 `exception` 的话， `error` 事件会触发，`exception` 会作为事件回调的参数传入。    

### socket.destroyed   

<a name="so_destroyed"></a>   

是否连接已经被摧毁。   

### socket.end([data][,encoding])

<a name="so_end"></a>   

半关闭 socket。例如：发送一个 FIN 包。但是服务器仍然可能会发送数据。    

如果指定了 `data`，等价于调用 `socket.write(data,encoding)` 后调用 `socket.end()`。    

返回 `socket`。    

### socket.localAddress   

<a  name="so_localAddress"></a>    

这个字符串代表了远程客户端连接本地的 IP 的地址。例如在一个监听在 `0.0.0.0` 的服务器上，
一个客户端连接到了 `192.168.1.1`，那么这个值就是 `192.168.1.1`。（就是对外的地址）       

### socket.localPort   

<a  name="so_localPort"></a>    

略。    

### socket.pause()

<a  name="so_pause"></a>    

暂停读取数据。意味着 `'data'` 事件不再触发。   

### socket.ref()

<a name="so_ref"></a>    

略。   

### socket.remoteAddress   

<a  name="so_remoteAddress"></a>   

远程 IP 地址的代表字符串。就是连接到何处的地址吧。   

### socket.remoteFamily   

<a  name="so_remoteFamily"></a>  
例如 `IPv4` or `IPv6`。

### socket.remotePort  

<a  name="so_remotePort"></a>    

略。   

### socket.resume()

<a  name="so_resume"></a>     

恢复读取。    

### socket.setEncoding([encoding])

<a name="so_setEncoding"></a>     

为 socket 的可读流设置编码。    

### socket.setKeepAlive([enable][,initialDelay])    

<a name="so_setKeepAlive"></a>    

启用 / 禁用 keep-alive 功能，并且可选的设置在第一个 keepalive 探针发送给一个闲置 socket
前的延迟时间。    

注意这个keep-alive 功能其实是检测闲置的套接字连接上很长时间没有数据传递了，可以发送 keepalive
探针给对方看看连接是否被关闭了。    

`initialDelay` 指的就是最后收到的数据包与发送第一个探针之间的间隔。如果是0会保持 `initialDelay`
为未修改状态，也就是说维持上次设置的值。     

返回 `socket`。    

### socket.setNoDelay([noDelay])

<a name="so_setNoDelay"></a>    

禁止 Nagel 算法。默认情况下 TCP 连接会使用 Nagle 算法，在发送数据前先缓冲一段时间。设置
为 `true` 的话会让数据立即发送不缓冲，注意这个缓冲和可写流的缓冲应该是不一样的，这个缓冲
好像是为了看看一段时间内有没有可以顺手捎上的数据。默认 `true`。    

返回 `socket`。    

### socket.setTimeout(timeout[,callback])

<a name="so_setTimeout"></a>  

设置不活动的 socket 在 `timeout` 时间后超时。默认情况下 `net.Socket` 没有超时一说。    

当一个闲置的 socket 触发了超时，socket 会收到 `timeout` 事件，但是连接不会提供服务了。
（干嘛这里要用 but...）。用户应该手动调用 `socket.end()` or `socket.destroy()` 结束连接。    

设为0的话会将当前的超时机制废除。应该意思是禁止超时了吧。    

`callback` 会添加到 `timeout` 的监听函数中去，也是一次性的。   

返回 `socket`。    

### socket.unref()

<a  name="so_unref"></a>   
略。

### socket.write(data[,encoding][,callback])

<a  name="so_write"></a>     

如果整个数据成功的刷新到内核的缓冲区中就返回 `true`。如果有数据在用户的内存中排队就返回 `false`。
当缓冲清空后会触发 `'drain'`事件（这个缓冲应该指的是可写流的缓冲区）。　　　　　

## net.connect()   

<a name="netConnect"></a>   

`net.createConnection()` 的别名。    

可选的签名有：   

+ `net.connect(options[, connectListenenr])`
+ `net.connect(path[, connectListenenr])` for IPC connections
+ `net.connect(port[,host][, connectListenenr])` for TCP connections   

### net.connect(options[, connectListenenr])

<a name="netConnect1"></a>    

`net.createConnection(options[, connectListenenr])` 的别名。   

### net.connect(path[, connectListenenr])

<a  name="netConnect2"></a>    

`net.createConnection(path[, connectListenenr])` 的别名。   

### net.connect(port[,host][,connectListenenr])

<a name="netConnect3"></a>    

`net.createConnection(port[,host][,connectListenenr])`的别名。　　　　

## net.createConnection()

<a name="createConnection"></a>   

一个工厂函数，用来创建新的 `net.Socket`，并使用 `socket.connect()` 立即初始化连接，
返回启动了连接的 `net.Socket`。    

当连接建立之后，在返回的 socket 上触发 `connect`事件。同理，最后的回调也是作为
一次性的　`connect` 事件监听函数。    

可能的签名有：   

+ `net.createConnection(options[, connectListener])`
+ `net.createConnection(path[, connectListener])` for IPC connections.
+ `net.createConnection(port[, host][, connectListener])` for TCP connections.   

### net.createConnection(options[,connectListener])

<a  name="createConnection1"></a>    

+ `options` 必需。会传递给 `new net.Socket([options])` and `new socket.connect(options[, connections])`
+ Returns: &lt;net.Socket&gt; 用来开始连接的新建的 socket。    

额外的 `options`:   

+ `timeout` &lt;number&gt; 如果设置了这个选项，会调用 `socket.setTimeout(timeout)`    

剩下的两种就不说了，略。   

## net.createServer([options][,connectionListener])

<a name="createServer"></a>    

创建一个 TCP or IPC 服务器    

+ `options` &lt;Object&gt;
  - `allowHalfOpen`
  - `pauseOnConnect` &lt;boolean&gt; 默认为 `false`。表明 socket 对新来的连接是否是暂停的状态

如果 `pauseOnConnect` 为 `true`，那么与 socket 相关联的每个新来的连接都是暂停状态，不会从其
handle 中读取任何数据。这可以让我们在原始进程没有读取数据的情况下将连接在进程之间传递。如果想
要从暂停的 socket 上读取数据，调用 `socket.resume()`。    

## net.isIP(input)

<a name="isIP"></a>    

测试输入是否为一个 IP 地址，对于不合法的字符串返回 0，IPv4 的地址返回4，IPv6的地址返回6。    

## net.isIPv4(input)

<a  name="isIPv4"></a>     

如果是 IPv4 的地址返回 true。   

## net.isIPv6(input)

<a  name="isIPv6"></a>   

略。   
