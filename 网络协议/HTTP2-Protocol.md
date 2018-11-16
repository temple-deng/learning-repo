# HTTP2.0

## 1. HTTP/2 协议概览

HTTP2 通过将每个 HTTP 请求/响应的数据交换与其自身的流相关联，来实现请求的多路复用。流都是相互
独立的，因此一个阻塞或者缓慢的请求或者响应不会影响其他流中的处理。    

## 2. HTTP/2 启动

### 2.1 HTTP/2 版本标识

这份文档定义的 HTTP/2 协议有两种标识：   

- 字符串 'h2' 表示使用了 TLS 的 HTTP/2。在 TLS-ALPN 中，会使用这个标识符。换成八进制序列
就是 0x68 0x32
- 'h2c' 表示跑在了 TCP 明文上的 HTTP/2。通常在 HTTP/1.1 Upgrade 首部中使用这个。     

### 2.2 通过 http URIs 启动 HTTP/2

在不知道下一跳是否支持 HTTP/2 的情况下，客户端会在一个 http URI 请求中使用 HTTP Upgrage
机制。这样的一个 HTTP/1.1 请求，必须包含一个准确的 HTTP2-Settings 首部：   

```
GET / HTTP/1.1
Host: server.example.com
Connection: Upgrade, HTTP2-Settings
Upgrage: h2c
HTTP2-Settings: <base64url encoding of HTTP/2 SETTINGS payload>
```    

如果服务器不支持 HTTP/2 的话，就直接丢弃掉 Upgrade 首部进行响应：    

```
HTTP/1.1 200 OK
Content-Length: 243
Content-Type: text/html
```    

服务器必须忽略 Upgrade 首部中的 'h2' 符号。     

如果服务器支持 HTTP/2 就使用 101 进行响应。在发送完 101 响应后，服务器就可以开始发送 HTTP/2
帧了。    

```
HTTP/1.1 101 Switching Protocols
Connection: Upgrade
Upgrade: h2c

[ HTTP/2 connection ...]
```    

服务器发送的第一个 HTTP/2 帧必须是一个 connection preface，由一个 SETTINGS 帧组成。在收到 101 
响应后，客户端也必须发送一个 SETTINGS 包含 connection preface。    

先前用来升级协议的 HTTP/1.1 请求被赋予了流 ID 为 1。    

#### 2.2.1 HTTP2-Settings 首部

如果在协议升级的请求中没有出现这个首部，或者说出现了不止一个，那服务器就不能将协议升级为 HTTP/2。    

### 2.3 从 http URIs 启动 HTTP/2

要说的内容上面都说了，在 TLS 协商完成后，客户端和服务器必须发送 connection preface。    

### 2.4 在预先知道的前提下启动 HTTP/2

客户端可能从某些渠道了解到某个特定的服务器是支持 HTTP/2 的。    

客户端首先必须发送 connection preface，并且可能会立刻发送一个 HTTP/2 帧给这样的一个服务器。服务器可以通过
连接配置的存在识别出这些连接。这种情况只影响通过明文 TCP 建立的 HTTP/2 连接。使用 TLS 支持的
HTTP/2 必须使用 ALPN。     

同理，服务器必须发送 connection preface。    

### 2.4 HTTP/2 Connection Preface

在 HTTP/2 中，每一端都被要求发送一个 connection preface 作为对使用协议的最终确认，并且需要
对 HTTP/2 连接进行初始的配置。客户端和服务器每一方发送一个不同的 connection preface。    

客户端 connection preface 由一个 24 的八进制流序列开头，16进制表示为：   

```
0x505249202a20485454502f322e300d0a0d0a534d0d0a0d0a
```    

换成字符串就是 `PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n`。这个序列后面必须紧跟一个 SETTINGS 帧，
不过这个帧可能是空的。客户端在接收到 101 响应，或者作为 TLS 连接的第一个应用层数据发送这个 preface。
如果是在知道支持 HTTP/2 的前提下启动的连接，在连接建立后就发送 preface。    

服务器 connection preface 必须是 HTTP/2 连接的的第一个帧，可能也会包含一个空的 SETTINGS 帧。   

任何一方在收到 connection preface 一部分的 SETTINGS 帧后，必须进行 ACK 确认。    

## 3. HTTP 帧

### 3.1 帧的格式

所有的帧都包含一个固定的 9 个字节的首部，后面跟着的是变长的负载。    

```
 +-----------------------------------------------+
 |                 Length (24)                   |
 +---------------+---------------+---------------+
 |   Type (8)    |   Flags (8)   |
 +-+-------------+---------------+-------------------------------+
 |R|                 Stream Identifier (31)                      |
 +=+=============================================================+
 |                   Frame Payload (0...)                      ...
 +---------------------------------------------------------------+
```     

帧首部的各字段定义如下：   

+ **Length:** 帧负载的长度，24 位无符号整数表示。大于 2<sup>14</sup>(16384) 的负载必须要
事先通知接收者进行配置，帧首部的 9 个字节不包含在其中
+ **Type:** 帧的类型，帧的类型决定了帧的格式与语义。
+ **Flags:** 一个标志位只在某些帧类型情况下生效。
+ **R**
+ **Stream Identifier:** 31 位无符号流标识符。0x0 是为了沟通连接参数而保留的流。    

### 3.2 帧的大小

SETTINGS_MAX_FRAME_SIZE 配置表明了发送方愿意接收的最大的帧的负载的大小。    

如果接收方收到了一个大于 SETTINGS_MAX_FRAME_SIZE 的帧，或者说帧的尺寸大于了该帧类型的长度
限制，那必须发送一个 FRAME_SIZE_ERROR错误码。    

### 3.3 首部压缩和解压

首部列表是零或多个首部字段的集合。当通过连接传输时，首部列表使用 HTTP 首部压缩机制序列化为一个
首部块。序列化后的首部块之后被分为一到多个字节序列，叫做 header block fragments，然后作为
HEADERS, PUSH_PROMISE, CONTINUATION 帧的负载进行传输。    

Cookie 首部是会进行特殊的处理的。    

接收方会通过拼接这些 fragments 重组首部块，然后将其解压，重建出首部列表。    

完整的首部块包括：    

+ 一个单一的 HEADERS 或者 PUSH_PROMISE 帧，帧的 END_HEADERS flag 置位，或者
+ 一个 HEADERS 或者 PUSH_PROMISE 帧，帧的 END_HEADERS1 flag 清零，并且还有一到多个
CONTINUATION 帧，最后一个 CONTINUATION 帧的 END_HEADERS flag 置位。     

首部压缩是有状态的。如果出现了解码的错误，那么必须将其视为一个 COMPRESSION_ERROR 类型的连接
错误。    

## 4. 流和多路复用

一个流是一个在客户端与服务器之间一个 HTTP/2 连接中的一个双向的独立的交换帧的序列。流有以下的几个
重要特征：   

+ 一个 HTTP/2 连接可以包含多个并发的打开的流
+ 流可以是单方面地被建立和使用，也可以被服务器和客户端共享
+ 流可以被任意一端关闭
+ 流中发送帧的顺序是重要的。接收方按照其收到的顺序处理帧。特别是，HEADERS 和 DATA 帧的顺序是
语义相关的。
+ 流由一个整数标志。初始化一个流的那一端负责给予流一个 ID。    

### 4.1 流的状态

流的生命周期：   

```
            
                             +--------+
                     send PP |        | recv PP
                    ,--------|  idle  |--------.
                   /         |        |         \
                  v          +--------+          v
           +----------+          |           +----------+
           |          |          | send H /  |          |
    ,------| reserved |          | recv H    | reserved |------.
    |      | (local)  |          |           | (remote) |      |
    |      +----------+          v           +----------+      |
    |          |             +--------+             |          |
    |          |     recv ES |        | send ES     |          |
    |   send H |     ,-------|  open  |-------.     | recv H   |
    |          |    /        |        |        \    |          |
    |          v   v         +--------+         v   v          |
    |      +----------+          |           +----------+      |
    |      |   half   |          |           |   half   |      |
    |      |  closed  |          | send R /  |  closed  |      |
    |      | (remote) |          | recv R    | (local)  |      |
    |      +----------+          |           +----------+      |
    |           |                |                 |           |
    |           | send ES /      |       recv ES / |           |
    |           | send R /       v        send R / |           |
    |           | recv R     +--------+   recv R   |           |
    | send R /  `----------->|        |<-----------'  send R / |
    | recv R                 | closed |               recv R   |
    `----------------------->|        |<----------------------'
                             +--------+

       send:   endpoint sends this frame
       recv:   endpoint receives this frame

       H:  HEADERS frame (with implied CONTINUATIONs)
       PP: PUSH_PROMISE frame (with implied CONTINUATIONs)
       ES: END_STREAM flag
       R:  RST_STREAM frame

```    

啥玩意啊这是。。。     

看样子，连接双方都拥有一个流状态的主观视图，这份视图在传输过程中可能双方是不同的。    

流包括以下的状态：   

**idle:**    

所有流开始时都处于 idle 状态，从这个状态开始可能有以下的状态过渡：   

- 发送或者接收到一个 HEADERS 帧会使流变为 "open" 状态。The same HEADERS frame can
also cause a stream to immediately become "half-closed".后面这句什么意思没弄懂
- 在其他流中发送的一个 PUSH_PROMISE 帧可能就标志出这个空闲的流，以便其能在以后使用前得到保留。
被保留的流的状态会变为 "reserved(local)"
- 同理，收到一个 PUSH_PROMISE 帧也会这样，被保留的流的状态变为 "reserved(remote)"    

处于这个状态的流如果收到除了 HEADERS or PRIORITY 以外的任何帧，都必须将其视为一个 PROTOCOL_ERROR
的连接错误。     

**reserved(local):**    

一个处于 "reserved(local)" 的流是为一个已经发送出去的 PUSH_PROMISE 帧预约而保留的。在这种
状态，只有以下的状态转变是可能的：    

- 端点可以发送一个 HEADERS 帧。这会造成流变为 "half-closed(local)" 状态
- 任意一端可以发送一个 RST_STREAM 帧造成流变为 "closed" 状态。这会解除流的预约。    

这个状态下的流不能发送除 HEADERS, RST_STREAM, PRIORITY 帧以外的其他类型的帧。    

但是这个状态可能会收到 PRIORITY or WINDOW_UPDATE 帧。收到除了 RST_STREAM, PRIORITY,
WINDOW_UPDATE 以外的帧，流必须将其视为一个 PROTOCOL_ERROR 类型的连接错误。   

**reserved(remote):**    

处于 reserved(remote) 状态的流是被远端预定了的。    

在这种状态下，只有下面的状态转变是可能的：   

- 收到一个 HEADERS 帧，变为 "half-closed(local)" 状态
- 任意一方可以发送一个 RST_STREAM 帧，变为 "closed" 状态，释放对流的预定     

处于这个状态的流可能会发送一个 PRIORITY 帧来重新安排这个被预定的流。但是不能发送除 RST_STREAM,
PRIORITY, WINDOW_UPDATE 以外的帧。    

收到除 HEADER, RST_STREAM, PRIORITY 以外的帧，流就必须将其视为一个 PROTOCOL_ERROR 类型
的连接错误。     

**open:**     

一个处于 open 状态的帧可以被连接双方用来发送任意类型的帧。    

在这种状态下，任意一方都可能发送一个将 END_STREAM 置位的帧，从而造成流变为 "half-closed"
状态。发送方会变为 "half-closed(local)"，而接收方会变为 "half-closed(remote)" 状态。   

任意一方也可以发送一个 RST_STREAM 帧从而使流变为 "closed" 状态。   

**half-closed(local):**    

