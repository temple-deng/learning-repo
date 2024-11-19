# HTTP2

<!-- TOC -->

- [HTTP2](#http2)
- [chapter 3. How and Why We Hack the Web](#chapter-3-how-and-why-we-hack-the-web)
  - [3.1 Performance Challenges Today](#31-performance-challenges-today)
    - [3.1.1 The Problems with HTTP/1.1](#311-the-problems-with-http11)
  - [3.2 Web Performance Techniques](#32-web-performance-techniques)
    - [3.2.1 Best Practices for Web Performance](#321-best-practices-for-web-performance)
    - [3.2.2 Anti-Patterns](#322-anti-patterns)
- [Chapter 4. Transition to HTTP/2](#chapter-4-transition-to-http2)
  - [4.1 Browser Support](#41-browser-support)
  - [4.2 Moving to TLS](#42-moving-to-tls)
  - [4.3 Undoing HTTP1.1 "Optimizations"](#43-undoing-http11-optimizations)
- [Chapter 5. The HTTP/2 Protocol](#chapter-5-the-http2-protocol)
  - [5.1 Layers of HTTP2](#51-layers-of-http2)
  - [5.2 The Connection](#52-the-connection)
  - [5.3 Frames](#53-frames)
  - [5.4 Streams](#54-streams)
    - [5.4.1 Messages](#541-messages)
    - [5.4.2 Flow Control](#542-flow-control)
    - [5.4.3 Priority](#543-priority)
  - [5.5 Server Push](#55-server-push)
    - [5.5.1 Pushing an Object](#551-pushing-an-object)
    - [5.5.2 Choosing What to Push](#552-choosing-what-to-push)
  - [5.6 Header Compression (HPACK)](#56-header-compression-hpack)
  - [5.7 On the Wire](#57-on-the-wire)
- [Appendix A. HTTP/2 Frames](#appendix-a-http2-frames)
  - [DATA](#data)
  - [HEADERS](#headers)
  - [PRIORITY](#priority)
  - [RST_STREAM](#rst_stream)
  - [SETTINGS](#settings)
  - [PUSH_PROMISE](#push_promise)
  - [PING](#ping)
  - [GOAWAY](#goaway)
  - [WINDOW_UPDATE](#window_update)
  - [CONTINUATION](#continuation)

<!-- /TOC -->

# chapter 3. How and Why We Hack the Web

## 3.1 Performance Challenges Today

下图展示了当我们在浏览器地址栏中输入一个 URL 地址后，浏览器对资源的获取流程：    

![object-request](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/object-request.png)   

下图展示了当浏览器收到对资源的响应后如何渲染页面：   

![page-rendering](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/page-rendering.png)

### 3.1.1 The Problems with HTTP/1.1

+ **队首阻塞**    

很多情况下，我们会对一台主机在一条 TCP 连接上请求多个资源，但是 HTTP 的设计上我们每次只能发送一个请求，并且只有在这个请求的响应返回后，才能在同一条连接上发送第二个请求。    

如果在某一时刻这些请求或者响应出现了一些问题，那么之后的请求和响应就不得不被阻塞在这里。
这种情况就叫做队首阻塞。它可能会造成页面的传输和渲染的挂起。为了解决这个问题，现在的浏览器通常会对一台主机同时打开最多 6 条连接。这是并行机制的一种实现，但是每条连接仍然会遇到
队首阻塞的问题，另外，它也没能好好利用有限的硬件资源。    

+ **TCP 的低效使用**    

注意 TCP 连接有一个慢启动的阶段，由于 HTTP1.1 不支持复用，那么如果浏览器打开了 6 条TCP
连接，则慢启动过程会出现 6 次。    

+ **过于臃肿的报文首部**     

HTTP1.1 只提供了压缩报文的机制，却没有提供压缩首部的机制。在使用 cookies 的网站中，每个
请求首部占据几千字节也不足为奇。     

根据调查，在 2016 年，报文首部的平均长度是 460 字节。对于一个有 140 个对象的页面来说，
这将占据大约 63KB 左右的请求大小。也就说，大约有 3 到 4 轮的 TCP 传送只是为了传输这些
首部。    

+ **缺乏资源的优先级机制**     

略。    

+ **第三方的对象**     

## 3.2 Web Performance Techniques

对于大部分 web 页面来说，浏览器的大部分时间不是花费在从服务器获取初始内容（通常是 HTML），
而是获取所有的静态资源和渲染页面。    

![timeline-frontend-and-backend](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/timeline-frontend-and-backend.png)

### 3.2.1 Best Practices for Web Performance

+ **优化 DNS 查询**：   
  - 限制主机和域的数量，如果在 HTTP/2 中仍然不限制主机名的数量的话，该问题可能仍然不会得到解决
  - 降低查询的时间延迟。
  - 在初始 HTML 或者响应中利用 DNS prefetch 功能。这个功能会在初始的 HTML 被下载和处理后，
  开始对指定域名的 DNS 查询。例如 `<link rel="dns-prefetch" href="//ajax.googleapis.com">`    
+ **优化 TCP 连接**：   
  - 利用 preconnect 功能。`<link rel="preconnect" href="//fonts.example.com" crossorigin>`
  - 使用 CDN
  - 为优化 HTTPS 实现最新的 TLS 最佳实践
+ **避免重定向**：重定向通常会导致对额外的主机名的建立连接，这就意味着可能又要进行 DNS 查询以及
发送额外的请求。如果我们无法简单的移除重定向，那么可以有如下的两个选项来优化性能：
  - 利用 CDN 进行重定向，意思应该是尽量把重定向的内容放到 CDN 上把
  - 如果是同一个主机名的重定向，利用 web 服务的 rewrite 规则来避免重定向。
+ **在客户端缓存**：可以使用以下经过测试过的指导原则，来为不同的资源来设定资源的缓存时间：
  - 所谓的真正的静态内容，例如图片或者带有版本的内容，可以永久的缓存在客户端上。
  - 对于 CSS/JS 以及一些个性化的资源，缓存大约平均会话时间的两倍时间。
+ **条件请求**
+ **压缩和最小化**：所有的文本内容（HTML, JS, CSS, SVG, XML, JSON, fonts 等）都可以从
压缩和最小化中获益。
+ **避免 CSS/JS 阻塞**：通常来说，客户端会确保在屏幕上绘制第一个像素前下载所有的 CSS。所以
尽量把 CSS 资源请求放到 HTML 的首部，位于所有的 JS 和图片请求之前。JS 的下载、解析和执行会阻塞
任何 JS 之后资源的下载和渲染。
+ **优化图片**     

### 3.2.2 Anti-Patterns

由于 HTTP/2 每个主机名只会打开一个连接，所以很多 HTTP1.1 的最佳实践在 HTTP2 中成为了一种
反模式。     

+ **雪碧图和资源拼接/内联**     

由于在 HTTP2 中，请求不再会被别的请求阻塞，而且可以并行处理多个请求。所以像是雪碧图和 CSS/JS 的
打包有点没必要，而且不利用单个资源的缓存。    

+ **拆分域名**    
+ **Cookie-less domains**     

在 HTTP1.1 时代，请求和响应的首部是不会被压缩的。这时候一些 cookie 的内容可能会带来明显的时延。
因此，为不依赖cookie的资源（例如图像）设置无cookie域是合理的建议。     

不过在 HTTP2 中，首部是被压缩的，并且在客户端和服务器端双方都会保存一个“首部历史记录”来避免传输
一些双方都已经知道的内容。   

# Chapter 4. Transition to HTTP/2    

在启用 HTTP2 之前，我们应该考虑以下的内容，来避免升级带来的次优性能：    

+ 浏览器对 HTTP2 的支持
+ 可能要启用 TLS
+ 为 HTTP2 调整我们的服务器
+ 网站上的第三方内容
+ 保留对 HTTP1.1 客户端的支持      

## 4.1 Browser Support

在本书出版时，大约 80% 的浏览器在某种程度上提供了对 HTTP2 的支持。     

## 4.2 Moving to TLS

由于所有的主流浏览器仅仅支持通过 TLS 访问 HTTP2，这就意味着你的网站如果想要支持 HTTP2 必须要
同时启用 TLS。    

## 4.3 Undoing HTTP1.1 "Optimizations"    

下面列出了一些在 HTTP1.1 中的优化措施，以及需要在 HTTP2 注意的点：     


名称 | 注意点
---------|----------
 整合/拼接 | 这个操作在 HTTP2 中没有必要，因为字节和时间的开销会少的很
 最小化 | 在 HTTP2 仍有必要使用
 域名拆分 | 一定程度上可以不必要进行拆分
 无 cookie 域 | 没必要
 雪碧图 | 与整合类似，没必要使用    

# Chapter 5. The HTTP/2 Protocol

## 5.1 Layers of HTTP2

HTTP2 可以概括为两部分：分帧层，这是 h2 复用能力的核心，以及数据或 http 层，其中包括传统上被
认为是 HTTP 及其相关数据的部分。    

## 5.2 The Connection

连接是每个 HTTP2 会话的基础元素。连接被定义为一个被客户端初始化的 TCP/IP 套接字，这个套接字是
用来发送 HTTP 请求的实体。HTTP2 的连接与 HTTP1.1 中的连接没有什么不同。唯一不同的是，h1 中的
连接是 **无状态的**，h2 捆绑了一些连接层面上的元素，所有在 h2 上运行的帧和流都遵循这些元素。这些
元素包括连接层的设置以及首部表。这也就意味着每个 h2 连接都增加了一定量之前的 HTTP 版本中不存在的
开销。但是从这些开销的收益来看，这些开销是值得的。    

为了向服务器双重确认客户端可以使用 h2，客户端会发送一个称为连接 preface 的魔术八进制流作为连接上
的第一个数据。这主要适用于客户端通过明文从 HTTP1.1 升级的情况。这个字节流的十六进制表示是:    

`0x505249202a20485454502f322e300d0a0d0a534d0d0a0d0a`    

解码成 ASCII 就是：   

`PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n`      

这个字符串的目的是在那些无法使用 h2 的服务器或中间设备上引发一个错误。一个工作良好的 h1 服务器在
收到这样收到这样一套字符串后，它无法识别请求方法 PRI 或者版本 HTTP/2.0，因此会返回一个错误，
这样客户款就能明确地知道发生了错误。     

这个魔术字符串后面通常会立刻跟着一个 SETTINGS 帧。服务器收到这个客户端的 SETTINGS 帧后，会
用自己的 SETTINGS 帧进行回复，之后就可以进行正常的 HTTP 会话的。客户端可以在假设服务器 SETTINGS
帧即将到达的情况下立刻开始发送帧。不过如果客户端在 SETTINGS 帧之前收到了别的东西，那么这次升级
协商就会失败，双方可能会回退到 h1。    

**问题**：话说，这里并没有说魔术字符串是在什么时候发的，是在服务器用 101 Switching Protocols 响应客户端
的协议升级请求后发的嘛，其次，可以使用 h2 的服务器在收到这个魔术字符串后响应了什么啊？    

## 5.3 Frames

分帧是一种用某个方式将所有内容封装起来的方法，以便协议的消费者可以轻松地读取、解析和创建（类似 TCP/IP
模型里面的封装）。    

下图是 HTTP2 中帧的大致样子：   

![http2-frame-header](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/http2-frame-header.png)

每个帧中的前九个字节是一致的。消费者通过读这些字节就可以知道整个帧的精确的字节数。下表描述了帧
首部中每个字段的含义：    


字段名 | 长度 | 描述
---------|----------|---------
 Length | 3B | 指明帧负载的长度（大小在 2<sup>14</sup> - 2<sup>24-1</sup>字节之间）。注意 2<sup>14</sup> 字节是默认的最大的帧的尺寸，如果需要更大的尺寸需要在 SETTINGS 帧中声明
 Type | 1B | 帧的类型
 Flags | 1B | 每个类型的帧的特定的标志位
 R | 1 bit | 保留位，不要设置这一位。
 Stream Identifier | 31 bit | 每个流的唯一的标识符
 Frame Payload | - | 帧的实际内容。其长度由 Length 指定     

分帧的一个优点是，请求和响应可以交错地发送，并且可以复用同一条连接。但是在 h1 中就必须发送完一个
请求或响应后才能发送另一个。复用可以帮助我们解决队首阻塞的问题。    

HTTP2 协议定义了 10 种不同的帧类型。下表提供了一个简单的介绍：    


名称 | ID | 描述
---------|----------|---------
 DATA | 0x0 | 携带流的核心内容
 HEADERS | 0x1 | 包含 HTTP 首部，以及可选的优先级信息
 PRIORITY | 0x2 | 指定或者更改流的优先级和依赖
 RST_STREAM | 0x3 | 允许某一方终止一个流
 SETTINGS | 0x4 | 交流连接层参数
 PUSH_PROMISE | 0x5 | 告诉客户端服务器可能要发送某些东西
 PING | 0x6 | 测试连接性和测量 round-trip time RTT
 GOAWAY | 0x7 | 告诉某一方自己已经准备好接收新流（纳尼，怎么是这个意思）
 WINDOW_UPDATE | 0x8 | 交流双方愿意接收多少字节，用来进行流量控制
 CONTINUATION | 0x9 | 用来扩展 HEADER 块    

HTTP2 内置了使用叫做 extension 帧的帧来处理新的帧类型的能力。这就给了服务器和浏览器实现者在不
创造新协议的情况下测试一些新的帧类型的功能。     

## 5.4 Streams

HTTP2 是这样定义一个流的：“一个独立的、双向的帧序列，用来在 HTTP2 连接中在客户端和服务器之间
交换数据”。当客户端想要发送一个请求时，它会初始化一个新流。服务器会在同一个流上进行响应。     

在客户端和服务器建立了一条 h2 连接后，它会通过发送一个 HEADERS 帧来新建一个流，如果 headers
需要分拆成多个帧的话可能还需要使用 CONTINUATION 帧。后续的流可以通过发送一个新的 HEADERS 帧
来初始化，这个帧中包含一个增长的流标识符。    

**关于 CONTINUATION 帧**    

HEADERS 帧可以将其 Flags 标志位中的 END_HEADERS 标志置位来表明没有其他的首部了。不过如果
一个帧装不下所有的首部，那么就需要把这一标志位清除，之后跟着一个或多个 CONTINUATION 帧。    

需要注意的是，CONTINUATION 帧和 HEADERS 帧必须是连续的，意味着需要暂时中断复用能力。     

### 5.4.1 Messages

一个 HTTP 消息是对一个 HTTP 请求或者响应的通用表示。一个最小的消息至少要包括一个 HEADERS 帧（
初始化流），另外可能会包括 CONTINUATION 和 DATA 帧。     

![get-request-response-message](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/get-request-response-message.png)    

![post-request-response-message](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/post-request-response-message.png)

这里有一些主要注意的点关于 HTTP1.1 消息和 HTTP2 消息：    

+ 所有东西都是首部：h1 将消息划分成请求/状态行和首部。h2 取消了这些区别，并将这些内容转换为魔术
伪首部。例如，一个 HTTP/1.1 请求可能是这个样子：    

```
GET / HTTP/1.1
Host: www.example.com
User-Agent: Next-Great-h2-browser-1.0.0
Accept-Encoding: compress, gzip

HTTP/1.1 200 OK
Content-Type: text/plain
Content-Length: 2
...
```    

等价的 HTTP/2 是这样的：    

```
:scheme: https
:method: GET
:path: /
:authority: www.example.com
User-Agent: Next-Great-h2-browser-1.0.0
Accept-Encoding: compress, gzip

:status: 200
Content-Type: text/plain
Content-Length: 2
```    

+ 不再使用分块传输编码。
+ 不再需要 101 响应。     

### 5.4.2 Flow Control

流的流量控制是 h2 新增的一个功能。流量控制的相关信息是在 WINDOW_UPDATE 帧中指明的。    

**一个流量控制的例子**：每个流最开始的时候，默认的窗口大小是 65535 字节，假设现在服务器 B 向
客户端 A 发送了 10000 字节。B 现在追踪的窗口大小就变为 55535.假设之后 A 消费掉了 5000 字节
并向 B 发送了一个 WINDOW_UPDATE 帧表明现在的窗口大小是 60535 字节。这时候 B 要发送一个
4GB 的文件，B 只能先发送一个当前窗口大小的 60535 字节，直到其收到 A 发送的另一个 WINDOW_UPDATE
帧，才能发送之后的字节。     

### 5.4.3 Priority

在 h1 时代，现代的浏览器通常会尽可能的将页面上的对象划分一个优先级，然后按照优先级来向服务器请求
这些数据。但在 h2 时候，浏览器可能同时发出所有的请求，这时候，服务器并不知道资源的优先级，所以
它可能同时处理所有的请求，这就避免不了发生可能一些重要的资源会在很久之后才得到处理，发送给客户端。     

HTTP2 中为了解决这个问题，使用了流的依赖关系的策略。使用 HEADERS 和 PRIORITY 帧，客户端可以告知
服务器其需要什么内容，这些内容需要的顺序的是什么。其通过声明一颗依赖树以及资源在树中的相对权重
来实现这种策略：     

+ 依赖关系为客户端提供了一种方法，通过指示其他对象依赖与它来告诉服务器特定对象（或多个对象）的传送
应该优先。
+ 权重让客户端告诉服务器如何确定具有共同依赖关系的对象的优先级。     

## 5.5 Server Push

### 5.5.1 Pushing an Object

当服务器想要推送一个对象，其会首先构造一个 PUSH_PROMIST 帧。这个帧中有许多重要的属性：   

+ PUSH_PROMISE 帧中流的 ID 是与响应相关联的请求的流 ID。一个推送响应总是与一个客户端已经发送
过的请求相关。例如，如果浏览器请求一个 HTML 页面，服务器可能会在这个请求流上构造一个 PUSH_PROMISE
帧用来推送这个页面上的 JS 对象。
+ PUSH_PROMISE 帧中有一个首部块，类似与客户端发送请求对象本身所发送的首部块。这可以让客户端可以
检查服务器即将推送的数据。   
+ 被推送的对象必须是被认为是可以缓存的
+ `:method` 首部必须被认为是安全的。安全的方法是那些幂等的方法，即那些不会改变的状态的方法。
+ 理想情况下，PUSH_PROMISE 帧应该在客户端收到可能引用推送对象的 DATA 帧之前，就已经发送给客户端。
例如，如果服务器在发送 PUSH_PROMISE 帧之前发送了完整的 HTML，则客户端可能在收到 PUSH_PROMISE
之前已经发送了对该资源的请求。这就浪费了资源。
+ PUSH_PROMISE 帧会指出将来要发送的响应所在的流的流标识符。    

**关于流标识符**：当客户端选择流标识符时，从 1 开始，之后每个流递增 2，因此都是奇数。当服务器
初始化一个被 PUSH_PROMISE 帧指定的新流时，从 2 开始，因此都是偶数。流 0 是保留的，用来传送
整体的连接层的控制信息。    

如果一个客户端对 PUSH_PROMISE 任何的前述因素不满意，它可能重置那个新流（使用 RST_STREAM）或者
发送一个 PROTOCOL_ERROR（在 GOAWAY 帧中），取决于拒绝的原因。常见的例子可能是因为对象已经
在缓存中了。不过需要注意的是，服务器可以在发送了 PUSH_PROMISE 之后立即启动流，所以取消正在
推送的流仍可能导致大量的资源被发送。    

### 5.5.2 Choosing What to Push

服务器收到一个对页面的请求，服务器需要去决定是要把页面上的对象推送过去，还是等待客户端主动去请求
这些对象。决策过程应该考虑以下因素：    

+ 对象已经存在于浏览器缓存中的几率
+ 从客户端的角度来看，对象的假定优先级
+ 可用带宽以及类似的资源可能会影响客户端接收推送的能力     

## 5.6 Header Compression (HPACK)

HPACK 是一种表查找压缩方案，它利用霍夫曼编码来获得接近 GZIP 的压缩率。     

假设现在客户端按序发送了下列的首部：    

```
Header1: foo
Header2: bar
Header3: bat
```      

当客户端发送这些请求时，其会为每个首部及其值创建一个索引，创建一个类似这样的表：    

![hpack-table](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/hpack-table.png)

在服务器端，服务器收到这些首部后会创建一个相同的表。在客户端发送下一次请求时，如果它发送同样
的首部，那么客户端可能简单地发送一个这样的首部块：    

`62 63 64`     

服务器会查询首部表，然后用这些索引来扩展成完整的首部。    

这只是一种简化的版本，实际上的 HPACK 是要远比这个复杂的，下面是部分细节说明：    

+ 事实上在每一端都维护了两个表。一个是之前例子那样创建的一个动态的表格。另一个是静态表，由最常见
的 61 个首部及其值组成。例如, `:method: GET` 在静态表中索引为 2 的地方。
+ 使用整数压缩和打包方案，来实现极高的空间效率。话说什么是整数压缩
+ 利用霍夫曼编码表进一步压缩字符串文字     

等等这里有点不确定啊，接收方和发送方会不会每方都维护四个表啊，两个表用来记录对方发送给自己的首部，
另一方记录自己发送给对方的首部，但是看这里的话，好像并不是这样子，因为所用的首部都用一个索引编号了，
但是这样如果双方同时向对方发送时，不小心给不同的首部赋予了相同的索引怎么办？？？

## 5.7 On the Wire

让我们来看一个 HTTP2 请求和响应的例子来接收本章。     

```
// HTTP/2.0 GET request

:authority: www.akamai.com
:method: GET
:path: /
:scheme: https
accpet: text/html,application/xhtml+xml
accpet-language: en-US,en;q=0.8
cookie: siderbar_collapsed=0;_mkto_trk=...
upgrage-insecure-requests: 1
user-agent: Mozilla/5.0
```    

```
// HTTP/2.0 GET response(headers only)
:status: 200
cache-control: max-age=600
content-encoding: gzip
content-type: text/html;charset=UTF-8
date: Tue, 31 May 2016 23:38:47 GMT
etag: "08c024491eb772547850bf157abb6c430-gzip"
expires: Tue, 31 May 2016 23:48:47 GMT
link : <https://c.go-mpulse.net>;rel=preconnect
set-cookie: ak_bmsc=8DEA673F92AC...
vary: Accept-Encoding, User-Agent
x-akamai-transformed: 9c 237807 0 pmb=mRUM,1
x-frame-options: SAMEORIGIN

<DATA Frames follow here>
```     

# Appendix A. HTTP/2 Frames

## DATA

DATA 帧包含任意的字节序列。取决于帧的最大长度，对象数据可以会分割到多个帧中传输。为了安全起见，
有条件地包含填充长度字段以及填充内容来隐藏消息的长度：    

![data-frame](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/data-frame.png)  

**DATA 帧的字段**     


字段名 | 长度 | 描述
---------|----------|---------
 Pad Length | 1B | 指定填充内容的长度，只有设置 PADDED 标志位后才可以有这个字段
 Data | - | 帧的内容
 Padding | - | 填充，所有位都是 0 


**DATA 帧的标志位**


名称 | 位 | 描述
---------|----------|---------
 END_STREAM | 0x1 | 指明帧是该流中的（纳尼，是不是书上写错了）
 PADDED | 0x8 | 指明是否使用填充

## HEADERS

HEADERS 帧用来开始一个流以及发送消息首部给一个端点：    

![headers-frame](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/headers-frame.png)

**HEADERS 帧的字段**     


字段名 | 长度 | 描述
---------|----------|---------
 Pad Length | 1B | 指定填充内容的长度，只有设置 PADDED 标志位后才可以有这个字段
 E | 1bit | 指明是否流的依赖是否为独占，只有设置了 PRIORITY 标志位才有这个字段
 Stream Dependency | 31 bit | 指明这个流依赖于哪个流，只有设置了 PRIORITY 才有效，长度正好和流标识符一样
 Weight | 1B | 指明流的相对权重。只有设置了 PRIORITY 才有
 Header Block Fragment | - | 消息的首部     


**HEADERS 帧的标志位**


名称 | 位 | 描述
---------|----------|---------
 END_STREAM | 0x1 | 指明帧是该流中的（纳尼，是不是书上写错了）
 END_HEADERS | 0x4 | 指明是否是流中的最后一个 HEADERS 帧。如果没有设置这一标志位，则表明会有接下来的 CONTINUATION 帧
 PADDED | 0x8 | 指明是否使用填充
 PRIORITY | 0x20 | 是否存在 E、流依赖及权重信息

## PRIORITY

PRIORITY 帧用来表明一个流的优先级，可以发送多次用来改变之前设置的优先级：    

![priority-frame](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/priority-frame.png)   

**PRIORITY 帧的字段**     


字段名 | 长度 | 描述
---------|----------|---------
 E | 1bit | 指明是否流的依赖是否为独占
 Stream Dependency | 31 bit | 指明这个流依赖于哪个流
 Weight | 1B | 指明流的相对权重    


PRIORITY 没有任何的帧标志位。     

## RST_STREAM

任何一端可以使用 RST_STREAM 来终止流，通常用来作为对发生错误状况的响应。    

Error Code 字段用来交流重置流的原因

![rst_stream-frame](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/rst_stream-frame.png)   

## SETTINGS

SETTING 帧是一个键值对的序列。键值对的数量是由帧的长度除以各个独立的配置的长度得出的：  

![settings-frame](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/settings-frame.png)   

**SETTINGS 参数**    

名称 | ID | 默认值 | 描述
---------|----------|---------|---------
 SETTINGS_HEADER_TABLE_SIZE | 0x1 | 4096 | 指明 HPACK 使用的首部表的最大尺寸
 SETTINGS_ENABLE_PUSH | 0x2 | 1 | 清除这一位用来通知对方不要发送 PUSH_PROMISE 帧
 SETTINGS_MAX_CONCURRENT_STREAMS | 0x3 | 无限制 | 指明发送者允许的流的最大的数量
 SETTINGS_INITIAL_WINDOW_SIZE | 0x4 | 65535 | 指明发送者的初始窗口大小
 SETTINGS_MAX_FRAME_SIZE | 0x5 | 16384| 指明发送者愿意接收的最大的帧的尺寸
 SETTINGS_MAX_HEADER_LIST_SIZE | 0x6 | 无限制 | 用来告诉对方自己愿意接收的最大的首部的尺寸    

当一方收到并处理一个 SETTINGS 帧后，其必须返回一个 SETTINGS 帧，并设置其 ACK 标志位。这也是
SETTINGS 帧定义的唯一一个标志位。     

## PUSH_PROMISE

PUSH_PROMISE 帧是由服务器发送的。     

![push_promise-frame](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/push_promise-frame.png)   

**PUSH_PROMISE 帧的字段**     


字段名 | 长度 | 描述
---------|----------|---------
 Pad Length | 1B | 指定填充内容的长度，只有设置 PADDED 标志位后才可以有这个字段
 R | 1bit | 保留位，不要使用这一位
 Promised Stream ID | 31 bit | 指明发送者将要使用的流的 ID
 Header Block Fragment | - | 要被推送的消息的首部
 Padding | - | 填充    


**PUSH_PROMISE 帧的标志位**


名称 | 位 | 描述
---------|----------|---------
 END_HEADERS | 0x4 | 指明是否是流中的最后一个 HEADERS 帧。如果没有设置这一标志位，则表明会有接下来的 CONTINUATION 帧
 PADDED | 0x8 | 指明是否使用填充


## PING

PING 帧用来测量两端之间的 RTT 时间。帧只有一个 ACK 标志位。当端点收到一个没有设置 ACK 的 PING
帧后，必须发送一个设置了 ACK 以及包含相同的不透明数据的 PING 帧。    

PING 帧不和任何特定的流相关，因此其流标识符为 0x0

![ping-frame](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/ping-frame.png)   


## GOAWAY

GOAWAY 用来优雅地关闭一条连接。使用 0x0 流发送。通过发送 GOAWAY 帧，端点能够清楚地定义它
具有的和未收到的内容，以及对 GOAWAY 有任何的问题。     

如果有错误，错误码是规范中定义好的某个错误码，Last Stream ID 是最大的流的 ID。如果没出错的
话，就发送 NO_ERROR(0x0) 错误码，并将 Last Stream ID 设为 2<sup>31-1</sup>。    

![goaway-frame](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/goaway-frame.png)   

**GOAWAY 帧字段**


名称 | 长度 | 描述
---------|----------|---------
 R | 1 bit | 保留位
 Last Stream ID | 31 bit | 发送者接收到的最大的流的 ID。这样接收者就能知道发送者收到了什么以及没有收到什么
 Error Code | 4B | 错误码
 Additional Debug Data | - | 发送者可能附加的任意的消息

## WINDOW_UPDATE

WINDOW_UPDATE 用来做流量控制。流量控制可以是关于某个特定的流，又或者是关于连接中的所有流。   

![window_update-frame](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/window_update-frame.png)   

**WINDOW_UPDATE 帧字段**     

名称 | 长度 | 描述
---------|----------|---------
 R | 1 bit | 保留位
 Window Size Increment | 31 bit | 当前窗口增加的字节的数量

## CONTINUATION

CONTINUATION 帧包含一个之前的 HEADERS，PUSH_PROMISE 或者 CONTINUTAION 帧的额外的首部：   

![continuation-frame](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/continuation-frame.png)   

**CONTINUATION 帧的字段**     


字段名 | 长度 | 描述
---------|----------|---------
 Header Block Fragment | - | 消息的首部


**CONTINUATION 帧的标志位**


名称 | 位 | 描述
---------|----------|---------
 END_HEADERS | 0x4 | 指明是否是流中的最后一个 HEADERS 帧。如果没有设置这一标志位，则表明会有接下来的 CONTINUATION 帧