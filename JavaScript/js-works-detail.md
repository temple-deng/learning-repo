# How JavaScript works

<!-- TOC -->

- [How JavaScript works](#how-javascript-works)
  - [1. Inside the V8 engine + 5 tips on how to write optimized code](#1-inside-the-v8-engine--5-tips-on-how-to-write-optimized-code)
    - [1.1 V8 之前包含两个编译器](#11-v8-之前包含两个编译器)
    - [1.2 Inlining](#12-inlining)
    - [1.3 编译成机器码](#13-编译成机器码)
    - [1.4 垃圾回收](#14-垃圾回收)
    - [1.5 Ignition and TurboFan](#15-ignition-and-turbofan)
    - [1.6 代码优化建议](#16-代码优化建议)
  - [2. 内存管理及内存泄露](#2-内存管理及内存泄露)
    - [2.1 内存生命周期](#21-内存生命周期)
    - [2.2 当不再使用内存时释放内存](#22-当不再使用内存时释放内存)
    - [2.3 内存引用](#23-内存引用)
    - [2.4 垃圾回收的引用计数](#24-垃圾回收的引用计数)
    - [2.5 环形引用会导致问题](#25-环形引用会导致问题)
    - [2.6 标记-清除算法](#26-标记-清除算法)
    - [2.7 垃圾收集器的反直觉行为](#27-垃圾收集器的反直觉行为)
    - [2.8 4 种 JS 中常见的内存泄露](#28-4-种-js-中常见的内存泄露)
  - [3. Deep dive into WebSockets and HTTP/2 with SSE](#3-deep-dive-into-websockets-and-http2-with-sse)
    - [3.1 WebSockets](#31-websockets)
    - [3.2 Framing protocol](#32-framing-protocol)
    - [3.3 帧中的数据](#33-帧中的数据)
    - [3.4 Fragmentation](#34-fragmentation)
    - [3.5 心跳检测](#35-心跳检测)
  - [4. The building blocks of Web Workers](#4-the-building-blocks-of-web-workers)
    - [4.1 Dedicated Workers](#41-dedicated-workers)
    - [4.2 Shared Workers](#42-shared-workers)
    - [4.3 Service Workers](#43-service-workers)
    - [4.4 Worker 工作原理](#44-worker-工作原理)
    - [4.5 postMessage](#45-postmessage)
    - [4.6 Broadcast Channel](#46-broadcast-channel)
    - [4.7 Web Workers 中可用的功能](#47-web-workers-中可用的功能)
  - [5. Parsing, Abstract Syntax Trees](#5-parsing-abstract-syntax-trees)
    - [5.1 AST applications](#51-ast-applications)
    - [5.2 JS 解析](#52-js-解析)

<!-- /TOC -->

## 1. Inside the V8 engine + 5 tips on how to write optimized code

### 1.1 V8 之前包含两个编译器

在 V8 5.9 之前，V8 引擎包含两个编译器：   

+ full-codegen: 一个简单的但是运行速度很快的编译器，用来生成简化过的但是相对运行比较慢的
机器代码
+ Crankshaft: 一个更复杂的（Just-In-Time）优化编译器，生成优化程度更高的机器码   

V8 引擎内部有以下的几个线程：   

+ 主线程就如我们希望的那样：获取我们的代码，编译并执行它
+ 另外还有一个额外的线程专门用来做编译工作，以便这个线程在优化代码的同时主线程可以执行其他
的代码
+ 一个 Profiler 线程会通知 runtime 代码中的哪些方法花费了很多的时间，以便 Crankshaft
去优化这些代码
+ 还有一些线程用来执行垃圾回收工作    

也就说过去的 V8 至少 4 个线程：主线程、编译线程、Profiler 线程和 GC 线程。    

当第一次执行 JS 代码时，V8 利用 **full-codegen** 将解析过的 JS 直接翻译为机器码，但是
不加任何的转换。这种行为可以让我们快速开始执行机器码（也就是代码可以尽快地得到执行吧）。
注意这种情况下，V8 不需要中间的字节码表示，因此也不需要解释器的帮助。   

那也就是说大致的流程可能是这样吧：首先肯定要解析成一个 AST，之后就看情况了，可以用编译器
直接生产 JIT 机器代码，也可能使用解释器翻译成字节码，再经过编译器翻译成机器码。   

之后，Crankshaft 在另一个线程上开始执行优化。它将 JS AST 翻译为一个 high-level static
single-assingment(SSA)，称为 **Hydrogen**，并且尝试优化这个 Hydrogen 图。大部分优化
是在这一层做的。    

### 1.2 Inlining

第一项优化措施是提前尽可能多的 inlining 代码。inlining 是这样的一个过程：使用被调用
函数的函数体替换掉调用点（即函数被调用的那一行代码）。这一个简单的步骤可以让后续的优化
更有意义。    

![inlining](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/inlining.png)    

### 1.3 编译成机器码

一旦优化过了 hydrgen 图，Crankshaft lowers it to a lower-level representation called
Lithium。大部分 Lithium 实现都是平台架构相关的。这一层会进行寄存器的分配。   

最后，Lithium 编译为机器码。之后会发生一些称为 OSR 的事情：on-stack replacement。在我们
开始编译并优化一个会长时间运行的方法前，我们可能会执行它。V8 会记住那些运行缓存的地方并
再一次进行优化。。。。后面的看不懂。   

### 1.4 垃圾回收

V8 使用了传统的标记-清除方式来执行垃圾回收。标记阶段通常会暂停 JS 的执行。为了控制 GC
的花费以及让执行更稳定，V8 使用了增量标记的方式：不遍历整个堆去尝试标记每个可能的对象，
只是遍历堆的一部分，然后就恢复正常的代码执行。下一次 GC 运行时会从上次在堆中停止的位置继续
向下遍历。    

清除阶段由额外的线程的负责处理。   

### 1.5 Ignition and TurboFan

在 V8 5.9 发布后，引入了新的执行管道流。新的管道流实现了更大的性能提升以及内存节省。   

那这个就和我们在 JS 引擎中介绍的那些一致了，而 full-codegen 和 crankshaft 好像就不再使用了。   

### 1.6 代码优化建议

1. 对象属性的顺序：总是以相同的属性顺序实例化对象，以便后续的代码可以共享 hidden class，
以及后续的 inline caching 优化
2. 动态属性：在实例化对象后再添加属性会强制生成新的 hidden class，进而降低性能
3. 方法：由于 IC 的存在，那些重复执行多次的方法显然要比那些大量只执行一次的方法运行的更快


## 2. 内存管理及内存泄露

### 2.1 内存生命周期

不管使用什么编程语言，内存的生命周期都是大致一样的：分配内存-使用内存-释放内存。   

### 2.2 当不再使用内存时释放内存

大部分内存管理问题都出现在这个阶段。    

这个任务中最困难的部分是找到那些已分配的内存何时不再被需要了。通常来说，高级语言都会在
软件中嵌入一个叫做垃圾回收器的东西，其工作就是追踪已分配的内存，然后找到那些内存在什么时候
就不再被需要了，这时它就会将这片内存释放掉。   

### 2.3 内存引用

垃圾回收算法依赖的一个主要概念是 **引用**。    

在内存管理上下文中，我们说一个对象引用了另一个对象，如果前者可以访问后者。例如，一个 JS
对象有其对其原型对象（隐式引用）引用，以及对其属性值的（显示引用）引用。    

在这个上下文中，“对象” 的概念不再局限于常规的 JS 对象，其他的东西也可以算对象。    

### 2.4 垃圾回收的引用计数

这是一种最简单的垃圾回收算法。一个对象被认为是 “可被垃圾回收的”，如果现在没有任何引用指向
它（即引用计数为0）。    

```js
var o1 = {
  o2: {
    x: 1
  }
}

// 2 objects are create
// o2 is referenced by 'o1' object as one of its properties
// None can be garbage-collected

var o3 = o1;   // the o3 variable is the second thing that
              // has reference to the object pointed by o1

o1 = 1;    // now, the object that was originally in o1 has a single reference
            // embodied by the o3 variable

var o4 = o3.o2; 
// reference to o2 property of the object
// This object has now 2 references: one as a property
// The other as the o4 variable

o3 = '374';
// The object that was originally in 'o1' has now zero references to it.
// It can be garbage-collected.
// However, what was its o2 property is still referenced by the o4 variable
// so it cannot be freed

o4 = null;
// what was the o2 property of the object originally in o1 has zero references to it
// o1 has zero references to it
// It can be garbage collected
```    

### 2.5 环形引用会导致问题

这种引用计数的方式会在遇到环形引用时遇到问题。    

```js
function f() {
  var o1 = {};
  var o2 = {};
  o1.p = o2; // o1 references o2
  o2.p = o1; // o2 references o1. This creates a cycle.
}

f();
```   

这种情况下，引用计数算法认为两个对象都至少还有一个引用，因此无法被垃圾回收。   

### 2.6 标记-清除算法

为了去决定是否一个对象还被需要，这种算法会去检查一个对象是否还可以被 reachable。   

标记-清除算法包含以下 3 步：   

1. Roots: 通常来说，roots 是指那些代码中被引用的全局变量（感觉其实是指一片内存区域）。
例如，window 对象就是一个可以扮演 root 角色的全局变量。在 Node.js 中等价的对象称为 global
对象。垃圾收集器会建立一个所有 roots 的完整列表。
2. 算法会检查所有的 roots 以及他们的子孙，然后用将其标记为 active（即他们不是垃圾）。
其他所有由一个 root 不能抵达的东西都被标记为垃圾。
3. 最后，垃圾收集器释放掉所有没被标记为 active 的内存片段，将其返回给 OS。   

![mark-and-sweep](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/mark-and-sweep.gif)    
截止到 2012 年，所有的现代浏览器都提供了标记-清除垃圾回收器。   

### 2.7 垃圾收集器的反直觉行为

虽然垃圾收集器是很方便的，但他们也有自己的权衡取舍。其中之一是非决定论 _non-determinism_。
换句话说，GC 是不可预测的。我们无法真正地说出什么时候会执行垃圾回收。这意味着，在一些情况
下程序可能会使用比其需要的更多的内存。在另外一些情况下，在一些特别敏感的应用中可能会出现很
明显的短暂的停顿。虽然非决定论可能意味着我们无法确定执行回收操作的准确时间，大部分 GC 的
实现都有一些共同的模式：在分配期间进行收集传递（这里没看懂，什么是收集传递）。如果没有
要执行分配操作，那 GC 就保持闲置状态。考虑以下的场景：   

1. 执行一个可伸缩的集合的分配操作
2. 集合中的大部分元素都被标记为不可达的
3. 之后没有其他的分配操作要执行    

在这种场景下，大部分 GC 之后不会再执行回收传递。换句话说，即使现在有不可达的引用，回收器
也不会标记它们。    

### 2.8 4 种 JS 中常见的内存泄露

1. **全局变量**    

JS 使用一种有趣的方式处理未声明的变量：当引用一个未声明变量时，会在全局对象上创建一个
新的变量。在浏览器中，全局对象就是 window，意味着：   

```js
function foo(arg) {
  bar = 'some text';
}
```    

等价于：   

```js
function foo(arg) {
  window.bar = 'some text';
}
```    

通常来说，我们使用 `bar` 的目的就只是在 foo 函数中使用这个变量。但是现在创建了一个冗余的
全局变量。    

因此，尽量只在必须的情况下使用全局变量存储数据，并且尽量在不需要之后给其赋值 `null`。   

2. **被遗忘的定时器或者回调**    

```js
var serverData = loadData();
setInterval(function() {
    var renderer = document.getElementById('renderer');
    if(renderer) {
        renderer.innerHTML = JSON.stringify(serverData);
    }
}, 5000); //This will be executed every ~5 seconds.
```    

这段代码中展示了当我们使用定时器时，对不再需要的节点或者数据引用。    

首先是 `renderer` 节点，如果我们在未来某一刻替换或者移除掉了这个节点，那其实这整个回调
都是冗余的了，但此时无论是回调函数，还是 `serverData` 都无法被标记为可回收的。    

因此，建议我们在 observers 要处理的节点已经处理完成后，及时清除掉回调。   

3. **闭包**    

略。   

4. **Out of DOM references**    

在一些情况下，我们经常会在某些数据结构中存储 DOM 节点。假设我们需要快速地更新表格中很多行
的内容。我们可能会将每一行的 DOM 引用保存到字典或者数组中，那这时对相同的 DOM 元素就有两个
引用了：一个在 DOM 树中，一个在字典中。如果我们决定要清除这些 DOM 元素，记得要将两个引用
都标记为不可达。   

```js
var elements = {
    button: document.getElementById('button'),
    image: document.getElementById('image')
};
function doStuff() {
    elements.image.src = 'http://example.com/image_name.png';
}
function removeImage() {
    // The image is a direct child of the body element.
    document.body.removeChild(document.getElementById('image'));
    // At this point, we still have a reference to #button in the
    //global elements object. In other words, the button element is
    //still in memory and cannot be collected by the GC.
}
```    

## 3. Deep dive into WebSockets and HTTP/2 with SSE

### 3.1 WebSockets

客户端通过一个称为 WebSocket **握手** 的过程建立一个 WebSocket 连接。这个过程以一个客户
端向服务器发送的一个常规的 HTTP 请求开始。这个请求中包含一个 `Upgrade` 首部，通知服务器
客户端想要建立一个 WebSocket 连接。    

```js
const socket = new WebSocket('ws://websocket.example.com');
```    

```
GET ws://websocket.example.com/ HTTP/1.1
Origin: http://example.com
Connection: Upgrade
Host: websocket.example.com
Upgrade: Websocket
```    

如果服务器支持 WebSocket 协议，它会在其对这个请求的响应中也附带 `Upgrade` 首部。   

```js
var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
  // Process HTTP 请求
});

server.listen(1337, function() { });

var wsServer = new WebSocketServer({
  httpServer: server
});

wsServer.on('request', function(request) {
  var connection = request.accept(null, request.origin);

    connection.on('message', function(message) {
      // Process WebSocket message
  });

  connection.on('close', function(connection) {
    // Connection closes
  });
});
```   

```
HTTP/1.1 101 Switching Protocols
Date: Wed, 25 Oct 2017 10:07:34 GMT
Connection: Upgrade
Upgrade: WebSocket
```   

现在，握手已经完成。初始的 HTTP 连接会直接被 WebSocket 连接替换，使用相同的底层的 TCP/IP
连接。这时，双方都可以开始发送数据了。   

使用 WS 传输的数据称为 **messages**，每条消息可能会包含一个到多个帧。    

### 3.2 Framing protocol

```
      0                   1                   2                   3
      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
     +-+-+-+-+-------+-+-------------+-------------------------------+
     |F|R|R|R| opcode|M| Payload len |    Extended payload length    |
     |I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
     |N|V|V|V|       |S|             |   (if payload len==126/127)   |
     | |1|2|3|       |K|             |                               |
     +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
     |     Extended payload length continued, if payload len == 127  |
     + - - - - - - - - - - - - - - - +-------------------------------+
     |                               |Masking-key, if MASK set to 1  |
     +-------------------------------+-------------------------------+
     | Masking-key (continued)       |          Payload Data         |
     +-------------------------------- - - - - - - - - - - - - - - - +
     :                     Payload Data continued ...                :
     + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
     |                     Payload Data continued ...                |
     +---------------------------------------------------------------+
```        

+ `fin`(1 bit): 指明这一帧是否是一条消息的最后一帧。大多数情况下，一条消息都可以放在一
帧中，因此通常这个帧是置位的。
+ `rsv1, rsv2, rsv3`: 如果没有进行过扩展协商的话，这几个位都是 0，如果是非 0 值，可能
需要自己协商非 0 值的解释方式。如果说一方收到了非 0 值，但是却没有协商过扩展，那接收
方就需要使连接失败。
+ `opcode`(4 bits): 帧代表什么意思。可以使用以下值：
  - `0x00`: 这一帧是上一个负载帧的后续帧
  - `0x01`: 这一帧只包含文本数据
  - `0x02`: 这一帧包含二进制数据
  - `0x08`: 这一帧用来终止连接
  - `0x09`: ping 帧
  - `0x0a`: pong 帧    
+ `mask`(1 bit): indicates if the connection is masked。就目前来看，从客户端发送的
每条消息必须是 masked，如果是 unmasked 规范规定终止连接。
+ `payload_len`(7 bits): 负载的长度，0-125 表明负载的长度。126 意味着后续的两个字节
指明了负载的长度，127 意味着接下来 8 个字节指明了长度。
+ `masking-key`(32 bits): 前面说了客户端发送给服务器的每个帧都要 mask，这 4 个字节就是
掩码
+ `payload`     

### 3.3 帧中的数据

每条消息的第一帧中的 opcode 会表明数据的类型。`0x01` 表示 utf8 编码的文本数据，`0x02`
是二进制数据。    

### 3.4 Fragmentation

拼接帧的大致逻辑如下：   

+ 收到第一帧
+ 记住 opcode
+ 在收到一个 `fin` 置位的帧后将所有帧的负载拼接起来
+ 假设每个包的 opcode 都是 0    

话说这些帧里没有序号，那一次性在连接上只能发一个帧咯？    

### 3.5 心跳检测

在握手完成后的任意时刻，客户端或者服务器都可以选择发送一个 ping 帧给另一方。当收到一个
ping 帧时，接收方必须回发一个 pong 帧。这就是心跳检测。    

ping 和 pong 帧也是常规的帧，只不过它们属于 **控制帧**。    

## 4. The building blocks of Web Workers

### 4.1 Dedicated Workers

Dedicated Web Workers 由主线程实例化，并且只能和主线程通信。    

### 4.2 Shared Workers

Shared Workers 可以被同域中的所有进程访问到（不同的 tabs, iframes 以及其他的 shared workers）。   

### 4.3 Service Workers

Service Worker 是一个注册在一个源和一个路径上的事件驱动的 Worker。    

### 4.4 Worker 工作原理

很奇怪，这里也说要是一个刚刚创建的 worker 启动工作，需要调用 `postMessage` 方法，但是
我记得之前测试的时候是不需要的，下载完就开始自动执行了：   

```js
worker.postMessage()
```    

为了在 Web Worker 以及创建它的页面之间进行通信，可以使用 `postMessage` 方法或者
Broadcast Channel。    

### 4.5 postMessage

较新的浏览器执行传递一个 `JSON` 对象作为第一个参数，旧的浏览器只支持字符串。    

```html
<button onclick="startComputation()">Start computation</button>

<script>
  function startComputation() {
    worker.postMessage({'cmd': 'average', 'data': [1,2,3,4]});
  }

  var worker = new Worker('doWork.js');

  worker.addEventListener('message', function(e) {
    console.log(e.data);
  }, false);
</script>
```   

```js
self.addEventListener('message', function(e) {
  var data = e.data;
  switch (data.cmd) {
    case 'average':
      var result = calculateAverage(data);
      self.postMessage(result);
      break;
    default:
      self.postMessage('Unknown command');
  }
}, false);
```    

### 4.6 Broadcast Channel

Broadcast Channel 是一个用来进行通信的更通用的 API。它允许我们去对同域中的所有上下文
广播消息。同域所有的 tabs, iframes 或者 workers 都可以发送或者接收消息：   

```js
// Connection to a broadcast channel
var bc = new BroadcastChannel('test_channel');

bc.postMessage('This is a test message.')

bc.onmessage = function(e) {
  console.log(e.data);
}

// Disconnect the channel
bc.close();
```   

![broadcast](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/broadcast.png)    

### 4.7 Web Workers 中可用的功能

Web Worker 由于其多线程的特性，只能访问 JS 功能的一个子集：   

+ `navigator` 对象
+ `location` 对象（只读）
+ `XMLHttpRequest`
+ `setTimeout()/clearTimeout()` 和 `setInterval()/clearInterval()`
+ Application cache
+ 使用 `importScripts()` 导入外部脚本
+ 创建其他的 workers

## 5. Parsing, Abstract Syntax Trees

### 5.1 AST applications

AST 并不仅仅是在语言解释器或者编译器中使用。在计算机的世界中，AST 还有其他的多种应用。
最常见的是用来做静态代码分析。静态分析器不执行代码，但是它们需要理解代码的结构。    

### 5.2 JS 解析

```js
function foo(x) {
  if (x > 10) {
    var a = 2;
    return a * x;
  }

  return x + 10;
}
```    

解析器会产生如下的 AST。   

![ast](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/ast.png)    

注意为了可视化的目的，这是一个最终生成的 AST 的简化版本。真正的 AST 要比这个复杂的多。