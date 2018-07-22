# HTTP

目录：   

- [HTTP](#http-1)
  - [Class: http.Agent](#class-httpagent)
    - [new Agent([options])](#new-agentoptions)
    - [agent.createConnection(options[, callback])](#agentcreateconnectionoptions-callback)
    - [agent.keepSocketAlive(socket)](#agentkeepsocketalivesocket)
    - [agent.reuseSocket(socket,request)](#agentreusesocketsocketrequest)
    - [agent.destroy()](#agentdestroy)
    - [agent.freeSockets](#agentfreesockets)
    - [agent.getName(options)](#agentgetnameoptions)
    - [agent.maxFreeSockets](#agentmaxfreesockets)
    - [agent.maxSockets](#agentmaxsockets)
    - [agent.requests](#agentrequests)
    - [agent.sockets](#agentsockets)
  - [Class: http.ClientRequest](#class-httpclientrequest)
    - [Event: 'abort'](#event-abort)
    - [Event: 'aborted'](#event-aborted)
    - [Event: 'connect'](#event-connect)
    - [Event: 'continue'](#event-continue)
    - [Event: 'response'](#event-response)
    - [Event: 'socket'](#event-socket)
    - [Event: 'upgrade'](#event-upgrade)
    - [request.abort()](#requestabort)
    - [request.aborted](#requestaborted)
    - [request.end([data][,encoding][,callback])](#requestenddataencodingcallback)
    - [request.flushHeaders()](#requestflushheaders)
    - [request.setNoDelay([noDelay])](#requestsetnodelaynodelay)
    - [request.setSocketKeepAlive([enable][,initialDelay])](#requestsetsocketkeepaliveenableinitialdelay)
    - [request.setTimeout(timeout[,callback])](#requestsettimeouttimeoutcallback)
    - [request.write(chunk[,encoding][,callback])](#requestwritechunkencodingcallback)
  - [Class: http.Server](#class-httpserver)
    - [Event: 'checkContinue'](#event-checkcontinue)
    - [Event:'checkExpection'](#eventcheckexpection)
    - [Event: 'clientError'](#event-clienterror)
    - [Event: 'close'](#event-close)
    - [Event:'connect'](#eventconnect)
    - [Event:'connection'](#eventconnection)
    - [Event:'request'](#eventrequest)
    - [Event: 'upgrade'](#event-upgrade-1)
    - [server.close([callback])](#serverclosecallback)
    - [server.listen(handle[,callback])](#serverlistenhandlecallback)
    - [server.listen(path[, callback])](#serverlistenpath-callback)
    - [server.listen([port][, hostname][, backlog][, callback])](#serverlistenport-hostname-backlog-callback)
    - [server.listening](#serverlistening)
    - [server.maxHeadersCount](#servermaxheaderscount)
    - [server.setTimeout([msecs][,callback])](#serversettimeoutmsecscallback)
    - [server.timeout](#servertimeout)
    - [server.keepAliveTimeout](#serverkeepalivetimeout)
  - [Class: http.ServerResponse](#class-httpserverresponse)
    - [Event: 'close'](#event-close-1)
    - [Event: 'finish'](#event-finish)
    - [response.addTrailers(header)](#responseaddtrailersheader)
    - [response.end([data][,encoding][,callback])](#responseenddataencodingcallback)
    - [response.finished](#responsefinished)
    - [response.getHeader(name)](#responsegetheadername)
    - [response.getHeaderNames()](#responsegetheadernames)
    - [response.getHeaders()](#responsegetheaders)
    - [response.hasHeader(name)](#responsehasheadername)
    - [response.headersSent](#responseheaderssent)
    - [response.removeHeader(name)](#responseremoveheadername)
    - [response.sendDate](#responsesenddate)
    - [response.setHeader(name, value)](#responsesetheadername-value)
    - [response.setTimeout(msecs[,callback])](#responsesettimeoutmsecscallback)
    - [response.statusCode](#responsestatuscode)
    - [response.statusMessage](#responsestatusmessage)
    - [response.write(chunk[, encoding][, callback])](#responsewritechunk-encoding-callback)
    - [response.writeContinue()](#responsewritecontinue)
    - [response.writeHead(statusCode[,statusMessage][,header])](#responsewriteheadstatuscodestatusmessageheader)
  - [Class: http.IncomingMessage](#class-httpincomingmessage)
    - [Event: 'aborted'](#event-aborted-1)
    - [Event: 'close'](#event-close-2)
    - [message.destroy([error])](#messagedestroyerror)
    - [message.headers](#messageheaders)
    - [message.httpVersion](#messagehttpversion)
    - [message.method](#messagemethod)
    - [message.rawHeaders](#messagerawheaders)
    - [message.rawTrailers](#messagerawtrailers)
    - [message.setTimeout(msecs,callback)](#messagesettimeoutmsecscallback)
    - [message.socket](#messagesocket)
    - [message.statusCode](#messagestatuscode)
    - [message.statusMessage](#messagestatusmessage)
    - [message.trailers](#messagetrailers)
    - [message.url](#messageurl)
  - [http.METHODS](#httpmethods)
  - [http.STATUS_CODES](#httpstatus_codes)
  - [http.createServer([requestListener])](#httpcreateserverrequestlistener)
  - [http.get(options[,callback])](#httpgetoptionscallback)
  - [http.globalAgent](#httpglobalagent)
  - [http.request(options[,callback])](#httprequestoptionscallback)

<!-- /TOC -->

# HTTP

HTTP 消息首部通常用类似这样的对象表示：   

```javascript
{ 'content-length': '123',
  'content-type': 'text/plain',
  'connection': 'keep-alive',
  'host': 'mysite.com',
  'accept': '*/*'
}
```    

键名是小写的。键值是未修改过的。     

HTTP API 是非常低层的。它仅实现了流处理和消息解析。它会将消息分别解析成首部和主体，但是不会
真正的解析实际的首部及主体。    

接收到的原始的首部是保存在 `rawHeaders` 属性中，类似 `[key, value, key2, value2, ...]` 这样的一个
数组。例如，先前的消息首部对象可能是如下样子的 `rawHeaders` :   

```javascript
[ 'ConTent-Length', '123456',
  'content-LENGTH', '123',
  'content-type', 'text/plain',
  'CONNECTION', 'keep-alive',
  'Host', 'mysite.com',
  'accepT', '*/*' ]
```    

## Class: http.Agent

代理 Agent 负责管理HTTP客户端的连接持久性和重用。它为每个给定的主机及端口维护了一个待处理请求的
队列，重用一个套接字 socket 直到队列清空了，这时 socket 可能直接被摧毁，也可能放置在 socket pool 中以便为
之后相同主机端口的请求重用。具体是被摧毁还是放置在 pool 中取决于 `keepAlive` 选项。    

pool 中的连接启用了 TCP Keep-Alive，但是服务器可能会关闭闲置的连接，这种情况下，连接会从 pool
中移除，所以之后对相同的主机端口的 HTTP 请求只能新建连接。服务器也可能会拒绝在同一个连接上
发送的多个请求，这样的话，每个请求不得不重新连接，连接也不能再放置到 pool 中。`Agent`
此时只能每个请求新建一个新连接。     

当一个连接被客户端或者服务器关闭时，就会从 pool 中移除。pool 中未使用的 sockets 会变成未引用的
unrefed，以便防止出现进程中没有请求了但是还不能退出的情况。    

当 socket 发出 `'close'` or `'agentRemove'` 事件时，socket 就会从 pool 中移除。如果希望将
一个HTTP 请求打开较长的一段时间，但是又不想将其保存在 pool 中，可以这样做：    

```javascript
http.get(options, (res) => {
  // Do stuff
}).on('socket', (socket) => {
  socket.emit('agentRemove');
});
 // 这个的话较长时间指的应该是 do stuff 那耗时较多吧
```    

一个 agent 也可能被一个独立的请求使用。将 `{agent: false}` 的选项传递给 `http.get()` or
`http.request()` 函数，那么这次连接可能使用一个一次性的 `agent`。     

```javascript
http.get({
  hostname: 'localhost',
  port: 80,
  path: '/',
  agent: false  // create a new agent just for this one request
}, (res) => {
  // Do stuff with response
});
```    

### new Agent([options])

+ `options` &lt;Object&gt; 可以包含下面的字段：
  - `keepAlive` &lt;boolean&gt; 即便当前没有其他请求时也保持 socket 连接，以便将来有请求
  时不用再去建立 TCP 连接。默认 `false`
  - `keepAliveMsecs` &lt;number&gt; 当使用了 `keepAlive` 时，指定 TCP Keep-Alive 包
  的延迟，默认为 `1000`
  - `maxSockets` &lt;number&gt; 每个主机允许的最大数量的 sockets。默认 `Infinity`
  - `maxFreeSockets` &lt;number&gt; 最大数量的空闲状态的打开的 sockets。只有在 `keepAlive` 设为
  `true` 有效，默认 `256`。   

`http.request()` 使用的默认 `http.globalAgent` 分别含有其对应的默认值。     

如果想要配置 `agent`，必须新建一个 `http.agent` 实例：   

```javascript
const http = require('http');
const keepAliveAgent = new http.Agent({ keepAlive: true });
options.agent = keepAliveAgent;
http.request(options, onResponseCallback);
```    

### agent.createConnection(options[, callback])

+ `options` &lt;Object&gt; 具体参数查看 `net.createConnection()`
+ `callback` &lt;Function&gt; 当 socket 创建完成时调用   
+ Returns: &lt;net.Socket&gt;    

为 HTTP 请求生成一个 socket/stream。    

默认情况下，这个函数与 `net.createConnection()` 相同。不过，定制的 agent 可能为了更灵活而覆盖这个方法。    

socket/stream 可以通过这两种方法之一提供：由这个函数返回，或者将 socket/stream 传递给 `callback`。也就是和 `net.createConnection()` 还有些
细微差别的吧。        

`callback` 的签名为 `(err, stream)`。  

### agent.keepSocketAlive(socket)  

+ `socket` `<net.Socket>`     

当 `socket` 时从请求中解绑后，但是想要由 Agent 维持住时调用。默认的行为如下：   

```javascript
socket.unref();
socket.setKeepAlive(agent.keepAliveMsecs);
```     

这个方法可能被特殊的 `Agent` 子类覆盖，如果这个方法返回一个“假”值，那么 socket 应该被摧毁而不是
维持住。     

### agent.reuseSocket(socket,request)

+ `socket` &lt;net.Socket&gt;
+ `request` &lt;http.ClientRequest&gt;    

将一个持久的 `socket` 绑定到 `request` 上。默认的行为如下：    

`socket.ref();`    

这个方法也可能被特殊的 `Agent` 子类覆盖。     

### agent.destroy()

摧毁当前 agent 使用的所有 sockets。    

通常没必要这么做，不过如果启用了 `keepAlive` 选项，最好还是在不使用时手动关闭。     

### agent.freeSockets   

+ &lt;Object&gt;    

当 `keepAlive` 启用时，一个包含了当前 `agent` 使用等待状态的 sockets 组成的数组的对象（话说那为什么
不直接返回数组，而且也没说这个数组在哪个属性上，还是说指类数组对象）    

### agent.getName(options)    

+ `options` &lt;Object&gt;
  - `host` &lt;string&gt; 请求发送给的服务器的域名或者 IP 地址
  - `port`
  - `localAddress` &lt;string&gt; 当发出请求时绑定在网络连接上的本地接口    
+ Returns: &lt;string&gt;    

为一系列请求选项获取一个单独的名字，这个名字用来决定连接能否被重用。对于 HTTP agent 来说，
返回 `host:port:localAddress`。对于 HTTPS agent，名字包含 CA, cert, ciphers, 以及其他 HTTPS
选项，来决定 socket 是否能重用。    

### agent.maxFreeSockets

+ &lt;number&gt;    

默认是 256。    

### agent.maxSockets

+ &lt;number&gt;    

默认是 `Infinity`。     

### agent.requests

+ &lt;Object&gt;     

一个包含还没有安排到 sockets 中的请求的队列的对象。   

### agent.sockets

+ &lt;Object&gt;    

包含 agent 当前使用的 sockets 的数组的对象。     

## Class: http.ClientRequest

这个对象由内部创建并由 `http.request()` 返回。它代表了一个首部已经进入队列中的 *处理中* 的
请求。但是首部仍然可以使用 `setHeader(name, value)`, `getHeader(name)`, `removeHeader(name)`
修改。实际上最终的首部会与第一个数据块一起发送，或者当关闭连接时发送。    

为了获取响应，需要为 request 对象添加 `'response'` 事件监听函数。`'response'` 会在收到
响应首部时触发。`'response'` 事件会使用一个 `http.IncomingMessage` 实例作为回调函数的参数。   

在处理 `'response'` 事件时，可以在响应对象上绑定事件监听函数，尤其是 `'data'` 事件。    

如果没有添加 `response` 处理程序，那么响应会整个被丢弃。然而，一旦绑定了处理函数，响应对象的数据必须
通过这几种方式消费：当有 `'readable'` 事件时调用 `response.read()`, or 添加 `'data'` 处理函数，
or 调用 `.resume()` 方法。直到数据被消费前，`'end'` 事件不会触发。同时，在数据被读取前，它会保存
在内存中。      

我觉得吧，request 对象其实是负责应用层通话的管理的，下面的 TCP 连接等应该是由 Agent 对象处理，
Agent 对象来建立 socket 连接服务器，并将数据交付。    

request 实现了可写流接口，同时也是一个包含下列事件的 EventEmitter。    

### Event: 'abort'

当请求被客户端废弃时触发。    

### Event: 'aborted'

当请求被服务器废弃，并且 socket 关闭后触发。   

### Event: 'connect'

+ `response` &lt;http.IncomingMessage&gt;
+ `socket` &lt;net.Socket&gt;
+ `head` &lt;Buffer&gt;    

使用 `CONNECT`（指定是 HTTP 的 CONNECT 方法吧） 方法在每次服务器响应一个请求时触发。如果没有监听这个事件，客户端在接收到 `CONNECT` 方法时会关闭连接。     

### Event: 'continue'   

当服务器发送 '100 Continue' 响应时触发。    

### Event: 'response' 

+ `response` &lt;http.IncomingMessage&gt;   

当收到请求的响应时触发。只触发一次。    

### Event: 'socket'

+ `socket` &lt;net.Socket&gt;    

当将请求安排给一个 socket 发送时触发。这个的话应该是由 Agent 对象管理安排的，  

### Event: 'upgrade' 

+ `response` &lt;http.IncomingMessage&gt;
+ `socket` &lt;net.Socket&gt;
+ `head` &lt;Buffer&gt;    

每次当接收到服务器 upgrade 的响应时触发。如果没有监听这个事件，收到 upgrade 首部的客户端会
关闭连接。      

```javascript
const http = require('http');

// Create an HTTP server
const srv = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('okay');
});
srv.on('upgrade', (req, socket, head) => {
  socket.write('HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
               'Upgrade: WebSocket\r\n' +
               'Connection: Upgrade\r\n' +
               '\r\n');

  socket.pipe(socket); // echo back
});

// now that server is running
srv.listen(1337, '127.0.0.1', () => {

  // make a request
  const options = {
    port: 1337,
    hostname: '127.0.0.1',
    headers: {
      'Connection': 'Upgrade',
      'Upgrade': 'websocket'
    }
  };

  const req = http.request(options);
  req.end();

  req.on('upgrade', (res, socket, upgradeHead) => {
    console.log('got upgraded!');
    socket.end();
    process.exit(0);
  });
});
```    


### request.abort()

废除请求。调用这个函数会造成仍在响应中的数据被丢掉，sokcet 被摧毁。   

### request.aborted  

如果请求已经被废弃的话，这个值是请求废弃的时间，毫秒为单位，自 1970 00:00:00 起。     

### request.end([data][,encoding][,callback])

+ `data` &lt;string&gt; | &lt;Buffer&gt;
+ `encoding`
+ `callback`    

完成发送请求的操作。如果请求时分块编码传输的，应该发送 `0\r\n\r\n` 结尾。    

回调会在请求流结束后调用。    

### request.flushHeaders()

刷新请求首部，出于效率的原因，Node.js 一般会缓冲请求首部，直到调用 `request.end()` 或者
写入的第一个请求数据块。之后这个方法会尝试将请求首部及数据打包到一个 TCP 包中。看样子，这个可能是
直接将首部交给 socket 处理，等待发送给网络。        

### request.setNoDelay([noDelay])

+ `noDelay` &lt;boolean&gt;   

一旦 socket 绑定到请求上并且将调用连接函数 `socket.setNoDelay()`。   

### request.setSocketKeepAlive([enable][,initialDelay])

+ `enable` &lt;boolean&gt;
+ `initialDelay` &lt;number&gt;    

一旦 socket 绑定到请求上并且将调用连接函数 `socket.setSocketKeepAlive()`。

### request.setTimeout(timeout[,callback])   

+ `timeout` &lt;number&gt; 在请求被认为是超时前的毫秒数
+ `callback` 当超时发生时的回调函数。与绑定 `timeout` 事件相同    

一旦 socket 绑定到请求上并且将调用连接函数 `socket.setTimeout()`。    

当时这个超时又是怎么理解呢，是发送了请求后，迟迟没有响应，但是这个又好像与 `socket.setTimeout()` 的意思相左。   

返回 `request`。     

### request.write(chunk[,encoding][,callback])

+ `chunk` &lt;string&gt; | &lt;Buffer&gt;
+ `encoding` 默认 `utf8`
+ `callback`    

发送主体的一个数据块。    

当数据块刷新后调用回调。   

返回 `request`。     

## Class: http.Server    

这个类是从 `net.Server` 继承的，并且有下面额外的事件：    

### Event: 'checkContinue'

+ `request` &lt;http.IncomingMessage&gt;
+ `response` &lt;http.ServerResponse&gt;     

每次收到 `Expect: 100-continue` 请求时触发。如果没有监听这个事件，服务器会自动响应 `100 Continue`。    

如果希望客户端继续发送请求主体的话，可以在处理这个事件时调用 `response.writeContinue()`，
如果不希望的话就生成合适的响应例如 400 Bad Request。     

注意如果这个事件触发并被处理， `request` 事件就不会再触发。   

### Event:'checkExpection'

+ `request` &lt;http.IncomingMessage&gt;
+ `response` &lt;http.ServerResponse&gt;     

当收到 `Expect` 首部时触发，但其值不是 `100-continue`。如果没有监听这个事件，服务器会自动用
`417 Expection Failed` 响应。     

注意如果这个事件触发并被处理， `request` 事件就不会再触发。     

### Event: 'clientError'

+ `exception` &lt;Error&gt;
+ `socket` &lt;net.Socket&gt;    

如果客户端连接触发了 `'error'` 事件，它将在这里转发。监听这个事件负责关闭 / 破坏底层的 socket。例如我们
可以希望通过 socket 发送一个 400 Bad Request 后再关闭 sokcet:   

```js
const http = require('http');

const server = http.createServer((req, res) => {
  res.end();
});
server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
server.listen(8000);
```        

默认的行为是立刻破坏相连的 socket。     

由于在 `'clientError'` 事件发生时，没有 `request` or `response` 对象，所以要发送任意的
HTTP 响应内容，包括首部和载荷，都必须直接写入到 `socket` 对象中。      

### Event: 'close'   

当服务器关闭时触发。    

### Event:'connect'  

+ `request` &lt;http.IncomingMessage&gt;
+ `socket` &lt;net.Socket&gt;
+ `head` &lt;Buffer&gt; 隧道流中的第一个包     

当请求使用 `CONNECT` 方法时触发。如果没有监听这个事件，那么这个连接会关闭。     

发出此事件后，请求的套接字将不会有“data”事件侦听器，这意味着需要绑定才能处理发送到该套接字上的服务器的数据。     

### Event:'connection'

+ `socket` &lt;net.Socket&gt;     

当新的 TCP 流建立时，`socket` 就是 `net.Socket` 类型的对象。略。    

### Event:'request'    

+ `request` &lt;http.IncomingMessage&gt;
+ `response` &lt;http.ServerResponse&gt;    

当有请求时触发。注意在一个连接上可能有多个请求。    

### Event: 'upgrade'   

+ `request` &lt;http.IncomingMessage&gt;
+ `socket` &lt;net.Socket&gt;
+ `head` &lt;Buffer&gt;    

当请求要求 HTTP upgrade 时触发，如果没有监听转让给事件，那么这个连接会被关闭。    

发出此事件后，请求的套接字将不会有“data”事件侦听器，这意味着需要绑定才能处理发送到该套接字上的服务器的数据。       


### server.close([callback])

停止服务器接收新的连接。

### server.listen(handle[,callback])

+ `handle` &lt;Object&gt;

`handle` 对象可以发送给服务器或者 socket 或者一个 `{fd: <n>}` 对象。    

这将导致服务器接受指定 handle 的连接，但假定文件描述符或 handle 已经绑定到端口或域套接字。    

这个函数是异步的。回调会作为 `'listening'` 事件的监听函数。注意这个和下面的 `listening` 事件应该都是 `net.Server` 的。         

返回 `server`。      

### server.listen(path[, callback])   

+ `path` &lt;string&gt;

启动一个 UNIX socket 服务器在给定的 `path` 连接上监听。    

这个函数是异步的。回调会作为 `'listening'` 事件的监听函数。       

### server.listen([port][, hostname][, backlog][, callback])

+ `port` &lt;number&gt;
+ `hostname` &lt;string&gt;
+ `backlog` &lt;number&gt;
+ `callback`

在给定的 `hostname` 和 `port` 上接受连接。如果 `hostname` 省略了，如果 IPv6 可用的话就
在 (`::`) IPv6 地址接收连接，否则就在 (0.0.0.0) IPv4地址上接收连接。    

*注意*：在大部分的操作系统中，监听 `::` 也会造成 `net.Server` 监听 `0.0.0.0`。    

省略端口参数，或者端口设为 `0`，会让操作系统安排一个随机值，在 `listening` 事件触发后可以
通过 `server.address().port` 访问到。     

`backlog` 是待处理连接队列的最大值。默认值是 511。     

这个函数是异步的。回调会作为 `'listening'` 事件的监听函数。       

### server.listening   

+ &lt;boolean&gt;    

表明服务器是否在监听连接。    

### server.maxHeadersCount   

+ &lt;number&gt; 默认2000    

首部的最大数量。设置为0的话相当于不限制。       

### server.setTimeout([msecs][,callback])

+ `msecs` &lt;number&gt; 默认12000

当超时发生时，会用 socket 作为参数。注意好像 `server` 对象上是没有超时这个事件的，超时按理说是应该发生在
socket 对象上。不过这个可以在 server 上监听这个事件，如果监听了的话，监听函数会在超时时使用触发超时的
`socket` 作为参数   

默认情况下，sockets 会在超时后自动破坏。不过如果提供了 `callback`，就必须手动处理。    

返回 `server`。     


### server.timeout   

+ &lt;number&gt; 默认120000    

在 socket 被认为是超时前的时间数。如果是 0 的话就禁止超时行为。     

*注意*：超时逻辑是基于连接的，所有改动这个值只会影响服务器上的新连接，不会影响已存在的连接。   

### server.keepAliveTimeout     

+ &lt;number&gt; 默认 5000    

服务器在写入完成最后一个响应等待额外将要传入的数据时，这段不活动的时间，然后破坏套接字。如果
服务器在这个规定之间到之前收到了新的数据，就会重置这个计时器。    

0 会禁止新连接的 keep-alive 超时行为。      

个人理解是这样的，timeout 事件指的是 socket 闲置的时间，而 keepAliveTimeout 等同于 socket.setKeepAlive 吧，
相当于设定一个闲置的时间，到这个事件后会发出一个探针来看看连接是否正常。但是这里并没有说如果探针没有
响应应该怎么处理。    

*注意*：超时逻辑是基于连接的，所有改动这个值只会影响服务器上的新连接，不会影响已存在的连接。     


## Class: http.ServerResponse

这个对象是由 HTTP 服务内部创建的。它会作为 `request` 时间的第二个参数传入。    

响应实现了可写流，但不是从可写流继承的。包含下面的事件：   

### Event: 'close'

表明底层连接在调用 `response.end()` 之前或能够刷新之前被关闭了。    

### Event: 'finish'

当响应发送后触发。更准确的说是最后的响应首部和主体已经交付给操作系统来完成网络传输时触发。    

在这个事件后，响应对象上不会再触发事件。    

### response.addTrailers(header)

+ `headers` &lt;Object&gt;    

添加 HTTP 拖尾首部。    

拖尾只在分块传输编码时才会使用，如果没事，会被直接丢弃。    

注意 HTTP 要求添加拖尾的话必须还要指定 `Trailers` 首部：    

```javascript
response.writeHead(200, { 'Content-Type': 'text/plain',
                          'Trailer': 'Content-MD5' });
response.write(fileData);
response.addTrailers({ 'Content-MD5': '7895bf4b8828b55ceaf47747b4bca667' });
response.end();
```    


### response.end([data][,encoding][,callback])

+ `data` &lt;string&gt; | &lt;Buffer&gt;

这个方法通知服务器所有的响应首部与主体已经发送。这个方法必须在每个响应上调用。   

如果 `data` 指定，那么就等价于调用 `response.write(data,encoding)` 后再调用 `response.end(callback)`。    

回调会在响应流完成后触发。    

### response.finished

+ &lt;boolean&gt;    

在 `response.end()` 调用会变为 `true`。    

### response.getHeader(name)    

+ `name` &lt;string&gt;
+ Returns: &lt;string&gt;    

读取已经加入到队列中但还没发送的首部，名字是大小写不敏感的。    

### response.getHeaderNames()

+ Returns: &lt;Array&gt;    

返回一个包含即将发出的首部唯一的名字的数组。所有名字都是小写。    

### response.getHeaders()

+ Returns: &lt;Object&gt;

返回一份与当前将要发出首部的浅拷贝。由于是浅复制，数组值可能在没有调用相关方法的情况下被修改过。
返回对象的键名是首部名，键值是各自的首部值。所有首部是小写的。     

*注意*：返回的对象没有从 JavaScript `Object` 上原型继承。意味着一些 `Object` 上的方法可能在
这个对象上时未定义的。    

```JavaScript
response.setHeader('Foo', 'bar');
response.setHeader('Set-Cookie', ['foo=bar', 'bar=baz']);

const headers = response.getHeaders();
// headers === { foo: 'bar', 'set-cookie': ['foo=bar', 'bar=baz'] }
```   

### response.hasHeader(name)   

+ `name` &lt;string&gt;
+ Returns: &lt;boolean&gt;    

注意名字匹配时是大小写不敏感的。     

### response.headersSent   

+ &lt;boolean&gt;    

只读。   

### response.removeHeader(name)

删除队列中一个隐式发送的首部。    

`response.removeHeader('Content-Encoding');`

### response.sendDate   

+ &lt;boolean&gt;    

当为 `true` 时，Date 首部会自动生成，并且如果首部中当前没有这个首部的话，会将这个首部加入。
默认为 true。    

### response.setHeader(name, value)

+ `name` &lt;string&gt;
+ `value` &lt;string&gt; | &lt;string[]&gt;    

如果要设置的首部已经存在，值会被替换。使用数组的话，会发送多个同样名字的首部。    

当使用 `response.setHeader()` 设置首部时，这个首部会和传入 `response.writeHead()` 的首部
合并，不过后者的优先级高。    

```javascript
// returns content-type = text/plain
const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('X-Foo', 'bar');
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('ok');
});
```    

### response.setTimeout(msecs[,callback])

设置 sockets 超时值为 `msecs`，如果提供了回调，那么会作为响应对象上的 `'timeout'` 事件监听函数。    

如果没有 `timeout` 监听函数是添加到请求，响应，或者服务器上，那么 socket 会在超时后破坏。
但是如果为请求，响应，或服务器的 `timeout` 事件绑定了监听函数，那么就必须手动处理超时的 sockets。    

返回 `response`。    

### response.statusCode

+ &lt;number&gt;     

当使用隐式的首部时（例如没有调用 `response.writeHead`），这个属性控制刷新首部时发送给客户端的状态码。    

在发送完首部后，这个属性是返回发送的状态码。   

### response.statusMessage

+ &lt;string&gt;   

当使用隐式的首部时（例如没有调用 `response.writeHead`），这个属性控制刷新首部时发送给客户端的原因短语。如果这个值是 `undefined`，那么就使用标准的原因短语。    

在发送完首部后，这个属性是返回发送的原因短语。    

### response.write(chunk[, encoding][, callback])

+ Returns: &lt;boolean&gt;     

如果在调用这个方法时，`response.writeHead()` 还没有调用，那么响应就使用隐式的首部并且刷新隐式的
首部。     

这个方法会发送响应主体数据块，调用多次的话可以提供主体不同的部分。    

注意一些请求不应该有响应主体。    

*注意*：这个只是原始的 HTTP 主体，与可能使用的高级多部分主体编码无关。    

第一次调用 `response.write()` 方法后，会将所有缓冲的首部信息和第一块数据发送给客户端。   

如果整个数据都成功刷新到内核缓冲中返回 `true`。如果所有或部分的数据进入到用户内存的队列中
返回 false。当缓冲区清空后触发 `'drain'` 事件。    

### response.writeContinue()

发送 HTTP/1.1 100 Continue 信息给客户端。    

### response.writeHead(statusCode[,statusMessage][,header])

+ `statusCode` &lt;number&gt;
+ `statusMessage` &lt;string&gt;
+ `headers` &lt;Object&gt;    

```javascript
const body = 'hello world';
response.writeHead(200, {
  'Content-Length': Buffer.byteLength(body),
  'Content-Type': 'text/plain' });
```    

如果在调用这个函数之前调用了 `response.write()` or `response.end()`，会计算隐式 / 可修改的首部
，然后调用这个函数。    


## Class: http.IncomingMessage

`IncomingMessage` 对象是由 `http.Server` or `http.ClientRequest` 创建的，并分为
作为 `request` 和 `response` 事件的第一次参数。    

它实现了可读流接口，以及下面额外的事件，方法，属性。   

### Event: 'aborted'

当请求被放弃且 socket 关闭时触发。    

### Event: 'close'

表明底层连接已经关闭。    

### message.destroy([error])

应该是调用对应于请求的 socket 上的 `destroy()` 方法，如果提供了额 `error`，还会触发一个 `error` 事件。     

### message.headers   

+ &lt;Object&gt;   

请求 / 响应的首部对象。   

首部名值的键值对。首部名都是小写的：    

```javascript
// Prints something like:
//
// { 'user-agent': 'curl/7.22.0',
//   host: '127.0.0.1:8000',
//   accept: '*/*' }
console.log(request.headers);
```    

原始首部中重复的首部会按照如下方式处理，取决于首部的名字：    

+ `age, authorization, content-length, content-type, etag, expires, from, host, if-modified-since, if-unmodified-since, last-modified, location, max-forwards, proxy-authorization, referer, retry-after, or user-agen` 重复的会被丢弃
+ `set-cookie` 是一个数组。重复值添加到数组中。
+ 对于所有其他的首部，值是用 `,` 连接起来。     

### message.httpVersion   

+ &lt;string&gt;    

值可能是 `'1.1'` or `'1.0'`。   

`message.httpVersionMajor` 是第一个整数，`message.httpVersionMinor` 是第二个整数。   

### message.method   

+ &lt;string&gt;    

只有 `http.Server` 中的请求对象有效。    

只读属性。    

### message.rawHeaders

+ &lt;Array&gt;   

收到的原始首部的列表。    

注意键名与值是在同一个列表中。所以，偶数索引是键名，奇数是键值。     

首部名不是小写形式的：    

```javascript
// Prints something like:
//
// [ 'user-agent',
//   'this is invalid because there can be only one',
//   'User-Agent',
//   'curl/7.22.0',
//   'Host',
//   '127.0.0.1:8000',
//   'ACCEPT',
//   '*/*' ]
console.log(request.rawHeaders);
```    

### message.rawTrailers   

+ &lt;Array&gt;    

接受到的原始的拖尾首部的名值对。只在 `'end'` 事件发生时才被填充。    

### message.setTimeout(msecs,callback)

调用 `message.connection.setTimeout(msecs, callback)`    

### message.socket  

+ &lt;net.Socket&gt;    

与连接相关的 `net.Socket` 对象。如果支持 HTTPS 的话，使用 `request.socket.getPeerCertificate()`
来获取客户端验证的信息。    

### message.statusCode   

+ &lt;number&gt;

只有在 `http.ClientRequest` 中的响应有效。    

### message.statusMessage

只有在 `http.ClientRequest` 中的响应有效。    

### message.trailers  

+ &lt;Object&gt;    

拖尾首部对象。只在 `'end'` 事件有效。    

### message.url   

只在 `http.Server` 的请求中有效。    

只包含在请求起始行中的部分。例如请求如下：    

```
GET /status?name=ryan HTTP/1.1\r\n
Accept: text/plain\r\n
\r\n
```   

则 `request.url` 为 `'/status?name=ryan'`   

## http.METHODS

+ &lt;Array&gt;

## http.STATUS_CODES

+ &lt;Object&gt;    

HTTP 响应码和原因短语的结合。例如 `http.STATUS_CODES[404] === 'Not Found'`   

## http.createServer([requestListener])

+ `requestListener` &lt;Function&gt;
+ Returns: &lt;http.Server&gt;    

`requestListener` 是一个会自动添加为 `request` 事件处理函数的函数。    

## http.get(options[,callback])

+ `options` &lt;Object&gt; | &lt;string&gt; | &lt;URL&gt; 与 `http.request()` 相同的 `options`，不过方法总是 `GET`。
+ `callback` &lt;Function&gt;
+ Returns: &lt;http.ClientRequest&gt;    

与 `http.request()` 的不同处是这个方法总是 GET，且会自动调用 `req.end()`。注意响应数据必须
在回调中被消费。     

回调函数的参数是 `http.IncomingMessage` 实例。    

回调应该和 `request()` 方法一样，是一个 `response` 事件的监听函数。    

## http.globalAgent  

+ `http.Agent`   

为所有 HTTP 客户端请求准备的全局 `Agent` 实例。    

## http.request(options[,callback])

+ `options` &lt;Object&gt; | &lt;string&gt; | &lt;URL&gt;
  + `protocol` &lt;string&gt; 使用的协议。默认是 `http:`
  + `host` &lt;string&gt; 要发送请求到的服务器的域名或IP地址。默认 `localhost`
  + `hostname` &lt;string&gt; `host` 的别名
  + `family` &lt;number&gt; 在解析 `host` 和 `hostname` 时使用的 IP 地址版本。有效的值
  是 `4` or `6`。当未指定的时候， IPv4, IPv6 都会使用。
  + `port` &lt;number&gt; 默认时 80
  + `localAddress` &lt;string&gt; 为网络连接绑定的本地接口
  + `socketPath` &lt;string&gt; Unix Domain Socket
  + `method` &lt;string&gt;
  + `path` &lt;string&gt; 请求的路径，默认是 `/`。可以包含查询字符串例如 `'/index.html?page=12'`
  + `headers` &lt;Object&gt; 包含请求首部的对象
  + `auth` &lt;string&gt; 基础认证
  + `agent` &lt;http.Agent&gt; | &lt;boolean&gt; 控制 `Agent` 的行为，可选值：
    - `undefined`(default): 为该主机及端口使用 `http.globalAgent`
    - `Agent` 对象
    - `false` 使用默认值创建新的 `Agent`
  + `createConnection` &lt;Function&gt; 当 `agent` 选项未使用时用来产生请求所需的 socket/stream
  的函数。
  + `timeout`
+ `callback` &lt;Function&gt;
+ Returns: &lt;http.ClientRequest&gt;

可选的 `callback` 会作为 `'response'` 事件的处理函数。   

注意返回的 `http.ClientRequest` 对象必须明确的调用 `req.end()` 方法来表示请求的结束，但是 `http.get` 就不用，人家会自动调用。    

发送一个 `Connection: keep-alive` 首部会通知 Node.js 这个连接到服务器的连接
应该维持住，直到发送下个请求。推测的话，应该是连接不会关闭，但是请求的话应该还得重新调用 `request()` 或者 `get()` 方法发送出，这里应该主要是为了节省关闭连接，摧毁 socket 等步骤吧，提高性能。   
