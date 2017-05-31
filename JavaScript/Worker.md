# Worker

> 摘自 http://javascript.ruanyifeng.com/htmlapi/webworker.html  

## 1. 概述

Worker 线程的种类：  

+ 普通的 Worker: 只能与创造他们的主线程通信。
+ Shared Worker: 能被所有同源的进程获取（比如来自不同的浏览器窗口、iframe窗口和其他的Shared Worker），它们必须通过一个端口通信。  
+ ServiceWorker: 实际上是一个在网络应用与浏览器或网络层之间的代理层。它可以拦截网络请求，使得离线访问成为可能。  

Web Worker有以下几个特点：  

+ **同域限制**。子线程加载的脚本文件，必须与主线程的脚本文件在一个域。
+ **DOM限制**。子线程所在的全局对象，与主线程不一样。它无法读取网页的DOM对象，即 `document, window, parent` 这些对象，子线程都无法得到。（但是，`navigator`和 `location` 对象可以）
+ **脚本限制**。子线程无法读取网页的全局变量和函数，也不能执行alert和confirm方法，不过可以执行setInterval和setTimeout，以及使用XMLHttpRequest对象发出AJAX请求。  
+ **文件限制**。子线程无法读取本地文件，即子线程无法打开本机的文件系统（file://），它所加载的脚本，必须来自网络。  

## 2. 新建和启动子线程

`var worker = new Worker('work.js');`  

子线程新建之后，并没有启动，必需等待主线程调用`postMessage`方法，即发出信号之后才会启动。`postMessage`方法的参数，就是主线程传给子线程的信号。它可以是一个字符串，也可以是一个对象。  

`worker.postMessage("Hello World");`  

只要符合父线程的同源政策，Worker线程自己也能新建Worker线程。Worker线程可以使用XMLHttpRequest进行网络I/O，但是XMLHttpRequest对象的`responseXML`和`channel`属性总是返回`null`。   

## 3. 子线程的事件监听

在子线程内，必须有一个回调函数，监听message事件。  

```javascript
self.addEventListener('message', function(e) {
  self.postMessage('You said: ' + e.data);
}, false);  
```  

self代表子线程自身，self.addEventListener表示对子线程的message事件指定回调函数（直接指定onmessage属性的值也可）。回调函数的参数是一个事件对象，它的data属性包含主线程发来的信号。self.postMessage则表示，子线程向主线程发送一个信号。  

## 4. 主线程的事件监听

主线程也必须指定message事件的回调函数，监听子线程发来的信号。  

```javascript
worker.addEventListener('message', function(e) {
	console.log(e.data);
}, false);
```  

## 5. 错误处理

主线程可以监听子线程是否发生错误。如果发生错误，会触发主线程的error事件。  

```javascript
worker.onerror(function(event) {
  console.log(event);
});

// or

worker.addEventListener('error', function(event) {
  console.log(event);
});
```   

event 对象有下面几个属性：  

+ message: 人类可读的错误信息
+ filename: 错误发生的脚本的名字
+ lineno: 错误发生的行号呗

## 6. 关闭子线程

使用完毕之后，为了节省系统资源，我们必须在主线程调用terminate方法，手动关闭子线程。  

`worker.terminate();`  

也可以子线程内部关闭自身。  

`self.close(); `  

## 7. 主线程与子线程的数据通信

前面说过，主线程与子线程之间的通信内容，可以是文本，也可以是对象。需要注意的是，这种通信是拷贝关系，即是传值而不是传址，子线程对通信内容的修改，不会影响到主线程。事实上，浏览器内部的运行机制是，先将通信内容串行化，然后把串行化后的字符串发给子线程，后者再将它还原。  

主线程与子线程之间也可以交换二进制数据，比如File、Blob、ArrayBuffer等对象，也可以在线程之间发送。  

但是，用拷贝方式发送二进制数据，会造成性能问题。比如，主线程向子线程发送一个500MB文件，默认情况下浏览器会生成一个原文件的拷贝。为了解决这个问题，JavaScript允许主线程把二进制数据直接转移给子线程，但是一旦转移，主线程就无法再使用这些二进制数据了，这是为了防止出现多个线程同时修改数据的麻烦局面。这种转移数据的方法，叫做Transferable Objects。  

如果要使用该方法，postMessage方法的最后一个参数必须是一个数组，用来指定前面发送的哪些值可以被转移给子线程。  

```JavaScript
worker.postMessage(arrayBuffer, [arrayBuffer]);
window.postMessage(arrayBuffer, targetOrigin, [arrayBuffer]);
```  

注意这里 Window 和 Worker 的区别。  


## 插入一点结构克隆算法

该算法本质上遍历原始对象的所有字段，将每个字段的值复制到新对象中。如果一个字段本身是一个带有字段的对象，那么这些字段将被递归地遍历，直到每个字段和子字段被复制到新对象中。  

相对于 JSON 的优点：  

+ 可以复制 RegExp 对象。  
+ 可以复制 Blob, File, FlieList 对象。  
+ 可以复制 ImageData 对象。
+ 可以正确复制循环引用的对象。  

无法复制的东西有：  

+ Error 和 Function不行，会抛出异常。  
+ DOM 节点不行，抛出异常。  
+ 一些对象上的数据无法保留：  
  - RegExp 对象的 `lastIndex` 属性
  - 属性描述符，getter,setter 不行。
  - 不会遍历和复制原型链。
+ symbols也不行

支持的属性有：所有原始值，布尔对象，字符串对象，日期类，正则类，Blob, File, FileList, ArrayBuffer, ArrayBufferView, ImageData, Object, Array, Map, Set。  


## 可用的 API

通常来说专用的 worker(就是普通的只为一个单一脚本服务的)上下文是一个 DedicatedWorkerGlobalScope 对象，共享worker 是 SharedWorkerGlobalScope 对象。   

## 专用 Worker

### subworkers

worker 也可以再生成更多的 workers。这就是所谓的subworker，它们必须托管在同源的父页面内。而且，subworker 解析 URI 时会相对于父 worker 的地址而不是自身页面的地址。     

### 导入脚本和库

worker 线程中有一个全局函数 `importScripts()`，可以让我们导入脚本。接受0或多个脚本的 URLs做参数：  

```javascript
importScripts();                         /* imports nothing */
importScripts('foo.js');                 /* imports just "foo.js" */
importScripts('foo.js', 'bar.js');       /* imports two scripts */
importScripts('//example.com/hello.js'); /* You can import scripts from other origins */
```   

每个脚本的种全局对象之后都可以被 worker 使用。如果脚本无法加载，将抛出 NETWORK_ERROR 异常，接下来的代码也无法执行（这里接下来的代码应该是的worker里面的代码吧)。而之前执行的代码(包括使用 `window.setTimeout()` 异步执行的代码)依然能够运行。`importScripts()` 之后的函数声明依然会被保留，因为它们始终会在其他代码之前运行。  

脚本的下载顺序不固定，但执行时会按照传入 importScripts() 中的文件名顺序进行。`importScripts()` 函数是同步执行的；直到所有脚本都下载并运行完毕， `importScripts()` 才会返回。  

## Shared Workers

一个共享worker可以被多个脚本使用——即使这些脚本正在被不同的window、iframe或者worker访问。如果共享worker可以被多个浏览上下文调用，所有这些浏览上下文必须属于同源（相同的协议，主机和端口号）。    

### 新建共享 worker

`var myWorker = new SharedWorker('worker.js')`  

一个非常大的区别在于，与一个共享worker通信必须通过端口对象——一个确切的打开的端口供脚本与worker通信（在专用worker中这一部分是隐式进行的）。    

在传递消息之前，端口连接必须被显式的打开，打开方式是使用`onmessage`事件处理函数或者`start()`方法。`start()`方法的调用只在一种情况下需要，那就是消息事件被`addEventListener()`方法使用。  

在使用`start()`方法打开端口连接时，如果父级线程和worker线程需要双向通信，那么它们都需要调用`start()`方法。   

`myWorker.port.start();    // 在父线程中调用`  

`port.start();   // 在 worker 线程中调用，假设port变量代表一个端口`  

### 与共享 worker 通信

现在，消息可以像之前那样发送到worker了，但是`postMessage()` 方法必须被端口对象调用。  

```javascript
squareNumber.onchange = function() {
  myWorker.port.postMessage([squareNumber.value,squareNumber.value]);
  console.log('Message posted to worker');
}
```   

在 worker 中代码如下：  

```javascript
onconnect = function(e) {
  var port = e.ports[0];

  port.onmessage = function(e) {
    var workerResult = 'Result: ' + (e.data[0] * e.data[1]);
    port.postMessage(workerResult);
  }
}
```  

首先，当一个端口连接被创建时（例如：在父级线程中，设置`onmessage`事件处理函数，或者显式调用`start()`方法时），使用`onconnect`事件处理函数来执行代码。  

使用事件的ports属性来获取端口并存储在变量中。

然后，为端口添加一个消息处理函数用来做运算并回传结果给主线程。在worker线程中设置此消息处理函数也会隐式的打开与主线程的端口连接，因此这里跟前文一样，对`port.start()`的调用也是不必要的。
