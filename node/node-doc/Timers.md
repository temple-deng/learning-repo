# Timers

目录：  

+ [Timers](#timers)
  + [Class:Immediate](#im)
  + [Class: Timeout](#ti)
    - [timeout.ref()](#ref)
    - [timeout.unref()](#unref)
  + Scheduling Timers
    - [setImmediate(callback[,...args])](#setim)
    - [setInterval(callback,delay[,...args])](#setin)
    - [setTimeout(callback,delay[,...args])](#setti)
  + Cancelling Timers
    - [clearImmeditate(immediate)](#clearim)
    - [clearInterval(timeout)](#clearin)
    - [clearTimeout(timeout)](#clearti)

# Timers

<a name="timers"></a>   

## Class: Immediate

<a name="im"></a>   

这个对象是在内部创建的，由 `setImmediate()` 返回。   

## Class: Timeout  

<a name="ti"></a>   

同样的，也是在内部创建的，由 `setTimeout()` and `setInterval()` 函数返回。只要有定时器是
激活状态，Node.js Event Loop 就会一直运行下去，不过可以通过这个对象暴露出 `timeout.ref()`
及 `timeout.unref()` 函数来改变这种默认行为。   

### timeout.ref()

调用这个方法后，只要 timer 还在激活的状态，event loop 就不能退出。   

### timeout.unref()

调用后，激活的 `Timeout` 不再要求 event loop 也处于激活状态。    

## Scheduling Timers

## setImmediate(callback[,...args])

<a name="setim"></a>
+ `callback` &lt;Function&gt; 在这轮 event loop 结尾处调用的函数（严格来说是在 check 阶段）
+ `...args` &lt;any&gt;   

如果是在一个执行回调中将一个 immediate timer 添加到队列中，则定时器会在下次 event loop 迭代
中执行。    

## setInterval(callback,delay[,...args])

<a name="setin"></a>   

当 `delay` 大于 `2147483647` 或者小于 `1` 时，设为 `1`。   

## setTimeout(callback, delay[, ...args])  

`delay` 有同上的限制。   

## Cancelling Timers   

懒得说了。。。
