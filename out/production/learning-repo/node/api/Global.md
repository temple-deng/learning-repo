# Global

<!-- TOC -->

- [Global](#global)
  - [Class: Buffer](#class-buffer)
  - [clearImmediate, clearInterval, clearTimerout](#clearimmediate-clearinterval-cleartimerout)
  - [console](#console)
  - [global](#global)
  - [process](#process)
  - [queueMicrotask(callback)](#queuemicrotaskcallback)
  - [setImmediate, setInterval, setTimeout](#setimmediate-setinterval-settimeout)
  - [TextDecoder](#textdecoder)
  - [TextEncoder](#textencoder)
  - [URL](#url)
  - [URLSearchParams](#urlsearchparams)
  - [WebAssembly](#webassembly)

<!-- /TOC -->

这一部分介绍的全局对象在所有模块中都是可用的。下列对象虽然也可以当做全局对象使用，那其实
是由模块提供的，并且与模块相关的：    

+ __dirname
+ __filename
+ module
+ exports
+ require

## Class: Buffer

+ Function

用来处理二进制数据。    

## clearImmediate, clearInterval, clearTimerout

+ `clearImmediate(immediateObject)`
+ `clearInterval(intervalObject)`
+ `clearTimeout(timeoutObject)`    

## console

+ Object

## global

+ Object, 全局命名空间对象

## process

+ Object

进程对象。   

## queueMicrotask(callback)

+ Experimental
+ `callback` Function

该方法将 `callback` 添加到微任务队列中。    

微任务队列是由 V8 管理的，`process.nextTick()` 队列是由 Node.js 管理的。`process.nextTick()`
队列总是在微任务队列前执行。    

## setImmediate, setInterval, setTimeout

+ `setImmediate(callback[,...args])`
+ `setInterval(callback, delay[,...args])`
+ `setTimeout(callback, delay[,...args])`

## TextDecoder

WHATWG `TextDecoder` 类。参考 `TextDecoder` 部分。   

## TextEncoder

同上，参考 `TextEncoder` 部分。   

## URL

同上，查看 `URL` 部分。   

## URLSearchParams

同上，参考 `URLSearchParams` 部分。   

## WebAssembly

略。   

