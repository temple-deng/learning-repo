# Web性能

##  延迟与带宽

延迟： 消息(message)或分组(pakcet)从起点到终点经历的时间.  

传播延迟： 消息从发送端到接受端需要的时间，是信号传播距离和速度的函数。  

传输延迟： 把消息中的所有比特转移到链路中需要的时间，是消息长度和链路速率的函数。  

处理延迟： 处理分组首部、检查位错误及确定分组目标所需的时间。  

排队延迟： 到来的分组排队等待处理的时间。  

## TCP


### 流量控制

窗口缩放(TCP Window Scaling)，可以把接受窗口大小由65535字节提高到1G字节！缩放TCP窗口是在三次握手期间完成的。其中有一个值表示在将来的ACK中左移16位窗口字段的位数。  


### 慢启动

慢启动重启：这种机制会在连接空闲一定时间后重置连接的拥塞窗口。 建议在服务器禁用。  


### 针对TCP的优化建议

1. 服务器配置调优
	+ 增大TCP的初始拥塞窗口（10）
	+ 禁用慢启动重启
	+ 启用窗口缩放
	+ TCP快速打开
2. 应用程序行为调优
	+ 少发数据。。
	+ 减少传输距离（就是CDN呗）
	+ 重用TCP连接


##  UDP

### UDP 的服务模型

1. 不保证消息交付： 不确认，不重传，无超时
2. 不保证交付顺序： 不设置包序号，不重排，不会发生队首阻塞
3. 不跟踪连接状态： 不必建立连接或重启状态机
4. 不需要拥塞控制： 不内置客户端或网络反馈机制

## TLS

ALPN(Application Layer Protocol Negotation)应用层协议协商
- 客户端在ClientHello消息中追加一个新的ProtocolNameList字段，包含自己支持的应用协议。
- 服务器检查这个字段，并在ServerHello消息中已ProtocolName字段返回选中的协议。

### TLS会话恢复

- 会话标识符(session identifier)  

在内部，服务器会为每个客户端保存一个会话ID和协商后的会话参数。相应的，客户端也可以保存会话ID信息，并将该ID包含在后续会话的"ClientHello"消息中，从而告诉服务器自己还记着上次握手协商后的加密套件和密钥呢，这些都可以重用。如果客户端和服务器都可以在自己的缓存中找到共享的会话ID参数，就可以进行简短握手，节省一次往返，还可以省掉用于协商共享加密密钥的公钥加密计算。
存在的问题是：会加大服务器的负担，其次session ID 往往只保留在一台服务器上。所以，如果客户端的请求发到另一台服务器，就无法恢复对话。  

- 会话记录单(session ticket)  

服务器在完整的TLS握手的最后一次交换中添加一条“新会话记录单”(New Session Ticket)记录，包含只有服务器知道的安全密钥加密过的所有会话数据（应该就是用公钥把此次会话的加密算法和密钥加密）。之后客户端将这个会话记录单保存起来，在后续会话的ClientHello消息中，可以将其包含在SessionTicket扩展中。这样，所有会话数据只保存在客户端，而由于数据被加密过，且密钥只有服务器知道，所以仍然安全。  


### 信任链和证书颁发机构

- 手工指定证书：所有浏览器和操作系统都提供了一种手工导入信任证书的机制。
- 证书颁发机构(CA): 是被证书接受者（拥有者）和依赖证书的一方共同信任的第三方。
- 浏览器和操作系统：都会内置一个知名证书颁发机构的名单。

### 针对TLS的优化

1. 启用并配置会话缓存和无状态恢复
2. 配置TLS记录大小，使其恰好能封装在一个TCP段内（1400字节）
3. 从信任链中去掉不必要的证书，减少链条层次。
4. 禁用服务器TLS压缩(安全问题和计算的问题)

## 优化应用的交付

性能优化的两条核心：消除和减少不必要的网络延迟，将需要传输的数据压缩至最少。  

经典的性能优化实践:

1. 减少DNS查找
2. 重用TCP连接
3. 减少HTTP重定向
4. 使用CDN
5. 去掉不必要的资源

针对 HTTP 的优化技巧：

6. 在客户端缓存资源
7. 传输压缩过的内容
1. 并行处理请求和响应
8. 消除不必要的请求开销（减少HTTP的首部数据比如cookie）  

针对HTTP1.1的优化建议：

1. 利用HTTP管道（这个值得考虑，因为无法控制客户端）
2. 采用域名分区（可以增加TCP连接的数目）
3. 打包资源减少HTTP请求
4. 嵌入小资源

## XHR

针对 CORS 请求的选择同意认证机制由底层处理：请求发出后，浏览器自动追加受保护的 Origin HTTP 首部，包含着发出请求的来源。相应地，远程服务器可以检查 Origin 首部，决定是否接受该请求
，如果接受就返回 Access-Control-Allow-Origin 响应首部。  

要启用 cookie 和 HTTP 认证，客户端必须在发送请求时通过 XHR 对象发送额外的属性(withCredentials)，而服务器也必须以适当的首部(Access-Control-Allow-Credentials) 响应，表示它允许应用发送用户的隐私数据。
类似地，如果客户端需要写或者读自定义的 HTTP 首部，或者想要以“不简单的方法”发送请求，那么它必须首先获得第三方服务器的许可，即向第三方服务器发送一个预备请求。  

利用长时间保留的 HTTP 请求（“挂起的 GET”）来让服务器向浏览器推送数据的技术，经常被称作 Comet。通过将连接一直保持打开到有更新（长轮询），就可以把更新立即从服务器发送给客户端。    


## 服务器发送事件

EventSource API

```javascript  
    var source = new EventSource('/paht/to/stream-url');  (1)

	source.onopen = function(){...}                       (2)

	source.onerror = function(){...}                      (3)

	source.addEventListener("foo", function(event){       (4)
		processFoo(event.date);
	});

	source.onmessage = function(event){                   (5)
		log_message(event.id, event.date);

		if(event.id= "CLOSE"){
			source.close();                               (6)
		}
	}
```
1. 打开到流终点的SSE连接
2. 可选的回调，建立连接时调用
3. 可选的回调，建立连接失败时调用
4. 监听"foo"事件，调用自定义代码
5. 监听所有事件，不明确指定事件类型
6. 如果服务器发送"CLOSE"的消息ID，关闭SSE连接

EventStream protocol  

```http
    =>请求
    GET /stream HTTP/1.1                    (1)
    Host: example.com
    Accept: text/event-stream

    <=响应
    HTTP/1.1  200 OK                        (2)
    Connection: keep-alive
    Connection-Type: text/event-stream
    Transfer-Encoding: chunked

    retry: 15000                            (3)

    data: First message is a simple string      (4)

    data: {"message": "JSON payload"}       (5)

    event: foo                              (6)
    data: Message of type "foo"

    id: 42                                  (7)
    event: bar
    data: Multi-line message of
    data: type "bar" and id "42"

    id: 43                                  (8)
    data: last message, id "43"
```  

1. 客户端通过EventSoruce接口发起连接
2. 服务器以""text/event-stream"内容类型响应
3. 服务器以设置连接中断后重新连接的间隔事件(15s)
4.  不带消息类型的简单文本事件
5.  不带消息类型的JSON数据载荷
6.  类型为"foo"的简单文本事件
7.  带消息ID和类型的多行文本事件
8.  带可选ID的简单文本事件

所有事件源数据都是 UTF-8编码的。  

服务器可以给每条消息关联任意 ID 字符串。浏览器会自动记录最后一次收到的消息ID，并在发送重连请求时自动在 HTTP 首部追加 "Last-Event-ID" 值。  

