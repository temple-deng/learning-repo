# Event Loop

虽然 js 是单线程的，Node.js 可以将一些操作交给系统内核处理。而由于大部分的内核都是多线程的，
所以他们可以在后台处理多个操作。一旦有一个操作完成了，内核会通知 Node.js 将合适的回调添加
到 **轮询** 队列中。   


## Event Loop 解释

当 Node.js 启动的时候，会初始化 event loop，然后处理提供的输入的脚本，之后就开始处理 event loop。   

下面的图展示了 event loop 操作的顺序的简化后样子：  

```
┌───────────────────────┐
┌─>│        timers         │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │     I/O callbacks     │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │     idle, prepare     │
│  └──────────┬────────────┘      ┌───────────────┐
│  ┌──────────┴────────────┐      │   incoming:   │
│  │         poll          │<─────┤  connections, │
│  └──────────┬────────────┘      │   data, etc.  │
│  ┌──────────┴────────────┐      └───────────────┘
│  │        check          │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
└──┤    close callbacks    │
└───────────────────────┘

// 每个盒子称作event loop 的一个 “阶段”。
```   

每个阶段都有一个要执行的FIFO先进先出的回调函数的队列。虽然每个阶段都有其特殊的地方，一般来讲，当 event loop 进入到给定的阶段后，就会执行这个阶段特定的任何操作，之后就会一直执行这个阶段队列中的回调函数，直到队列中的函数都执行完毕或者执行了最大数量的回调函数。当队列“耗尽”或者到达回调函数的最大限制，event loop 就会移动到下一阶段。   

由于这些操作都可能再添加更多的定期任务，并且内核还可以添加新的事件处理到轮询阶段的队列中，轮询事件处理时还可以将轮询事件添加到队列中。所以长时间的回调会允许轮询阶段比定时器的阈值运行的事件更长。  

## 每个阶段概览

+ **timers**: 这一阶段会执行 `setTimeout()` 和 `setInterval()` 的安排的回调
+ **I/O callbacks**: 这一阶段会执行几乎所有的回调，除了关闭 close 回调，以及定时器和 `setImmediate()`的回调。
+ **idle, prepare**: 内部使用
+ **poll**: 检索新的 I/O 事件；node 可能会在合适的时候在这里阻塞
+ **check**: 调用 `setImmediate()` 设置的回调
+ **close callbacks**: 例如 `socket.on('close', ...)`  

在每次 event loop 运行过程之间，Node.js 都会检查是否有异步 I/O或者定时器在等待，如果没有就关闭。这里应该指的就是当前的 Node
进程，毕竟如果没有定时器，也没有异步任务，程序就该退出了。       

## 阶段细节

#### timers

一个定时器指定了当提供回调函数之后执行回调的时间的阈值，而不是一个人们想要执行的精确的时间。定时器回调会在其指定的时间过去之后尽可能早的执行回调；然而，操作系统运行其他的回调时可能会推迟其调用的时间。  

注意：技术上来说，轮询阶段控制了何时执行定时器。  

例如，当我们指定了100ms 后执行某个任务，之后脚本开始执行一个会花费 95ms 的异步的文件读取任务：  

```javascript
var fs = require('fs');

function someAsyncOperation (callback) {
  // Assume this takes 95ms to complete
  fs.readFile('/path/to/file', callback);
}

var timeoutScheduled = Date.now();

setTimeout(function () {

  var delay = Date.now() - timeoutScheduled;

  console.log(delay + "ms have passed since I was scheduled");
}, 100);


// do someAsyncOperation which takes 95 ms to complete
someAsyncOperation(function () {

  var startCallback = Date.now();

  // do something that will take 10ms...
  while (Date.now() - startCallback < 10) {
    ; // do nothing
  }

});
```   

当 event loop 进入轮询阶段，它当前的队列是空的（`fs.readFile()` 还没有完成），所以他会
等待剩下的毫秒数，直到到达最早的定时器的阈值。当等待95ms后，`fs.readFile()` 完成并且其回调会添加到轮询队列中并执行（话说这不应该是I/O回调么。。。）。当回调完成后，此时队列中没有其他回调了，所以 event loop 会看看是否到达了最早的定时器的阈值，之后就绕回到定时器阶段去执行定时器回调。   

Note: To prevent the poll phase from starving the event loop, libuv (the C library that implements the Node.js event loop and all of the asynchronous behaviors of the platform) also has a hard maximum (system dependent) before it stops polling for more events.  

个人觉得是为了防止轮询阶段不断地添加事件回调执行回调，libuv 也设置了强制的最大值，防止不断的轮询事件一直占用 event loop。   

#### I/O callbacks

这个阶段会执行一些例如 TCP 类型的错误等一些系统操作的回调。例如，一个 TCP socket 在尝试连接时受到 `ECONNREFUSED`，一些 \*nix 系统会想要等待报告错误。这就会在 I/O callbacks 的队列中执行。  

#### poll

轮询阶段有两个主要的功能：  

1. 当定时器的阈值到达了以后执行其脚本
2. 处理轮询队列中的事件

当 event loop 进入到轮询阶段后，并且这时没有定时器任务，就会发生下面之一的事情：  

+ 如果轮询队列不为空， event loop 会同步地循环迭代执行队列中的回调，直到队列耗尽，或者到达与系统相关的强行设置值。  

+ 如果轮询队列为空，就会发生下面之一的事情：  
  - 如果有 `setImmediate()` 安排的脚本， event loop 会结束轮询阶段，进入 `check` 阶段执行这些安排好的脚本
  - 如果没有 `setImmediate()` 安排的脚本，event loop 会一直等待回调加入到队列中，然后立即执行它们

一旦轮询队列为空， event loop 就会检查定时器，看看哪些定时器的阈值到了，如果有一个或多个定时器阈值到了，event loop 就会绕回到定时器阶段执行定时器回调。  

#### check

这个阶段允许我们在轮询阶段结束后立即执行回调。如果轮询阶段变动空闲并且 `setImmediate()` 将脚本安排进队列中， event loop 就会进入 `check` 阶段而不是继续等待。  

#### close callbacks

如果一个 socket 或者 handle 突然地关闭了（例如 `socket.destory()`），`close` 会见会在这个阶段触发，否则其会通过 `process.nextTick()` 触发。  

## `setImmediate()` vs `setTimeout()`  

这两个定时器执行的顺序会由于其被调用的上下的不同而不同。如果两者都是在主模块中被调用的，那么定时将受到进程性能的限制（这可能会受到在机器上运行的其他应用程序的影响）。  

例如，如果我们不在I/O 循环中执行下面的脚本，两个定时器哪个先执行是不确定的，受到进程性能的限制：  

```javascript
// timeout_vs_immediate.js
setTimeout(function timeout () {
  console.log('timeout');
},0);

setImmediate(function immediate () {
  console.log('immediate');
});
```  

```  
$ node timeout_vs_immediate.js
timeout
immediate

$ node timeout_vs_immediate.js
immediate
timeout
```  

然而，当我们把这两个调用移动到 I/O 循环中时，immediate 回调总是先执行：  

```javascript
// timeout_vs_immediate.js
var fs = require('fs')

fs.readFile(__filename, () => {
  setTimeout(() => {
    console.log('timeout')
  }, 0)
  setImmediate(() => {
    console.log('immediate')
  })
})
```  

```
$ node timeout_vs_immediate.js
immediate
timeout

$ node timeout_vs_immediate.js
immediate
timeout
```   

## `process.nextTick()`

`process.nextTick()` 从技术上来说不是 event loop 的一部分。相反， `nextTickQueue` 会在当前操作完成后处理，不管当前是处于 event loop 的哪个阶段。  

我们可以在任意阶段调用 `process.nextTick()`, 所有传递给 `process.nextTick()`的回调会在 event loop 进入下个阶段前完成。   

`process.nextTick()` 的第一个参数也是回调函数，后面的参数都是传入回调的参数。    

由于 `process.nextTick()` 总会在进入下个阶段前执行，所以 `process.nextTick()` 应该总是比
定时任务执行的早。其次，与其他定时器任务相比，`process.nextTick()`　设置的任务时无法取消的，
其他的定时任务都还可以取消 `clearTimeout`, `clearInterval` `clearImmediate`。


## Leaving Timeouts Behind  

`setTimeout` 和 `setInterval` 返回了 `Timeout` 对象。这个对象上提供了两个方法用来
增加 `Timeout` 的表现`unref()`，`ref()`。例如说现在有一个定时器对象使用`set` 函数设置好了，`unref()` 就可以在返回的 `Timeout` 对象上调用，这会增加一种效果就是，如果`Timeout` 是导致进程没有退出的最后需要执行的代码。`Timeout` 对象就不会再让进程持续等下去了，允许进程在不执行定时任务的情况下退出。   

相似的，如果我们使用 `unref()` 让进程不再等待 `Timeout`，就可以再使用 `ref()` 来确保进程不会退出，必须执行定时代码。   

```javascript
let timerObj = setTimeout(() => {
  console.log('will i run?');
});

// if left alone, this statement will keep the above
// timeout from running, since the timeout will be the only
// thing keeping the program from exiting
timerObj.unref();

// we can bring it back to life by calling ref() inside
// an immediate
setImmediate(() => {
  timerObj.ref();
});
```  
