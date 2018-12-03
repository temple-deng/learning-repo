# Timers

<!-- TOC -->

- [Timers](#timers)
  - [Class: Immediate](#class-immediate)
    - [immediate.hasRef()](#immediatehasref)
    - [immediate.ref()](#immediateref)
    - [immediate.unref()](#immediateunref)
  - [Class: Timeout](#class-timeout)

<!-- /TOC -->

## Class: Immediate

由 `setImmeditate()` 返回。    

### immediate.hasRef()

+ Returns: boolean

如果为 `true`，`Immediate` 对象会维持 event loop 为激活状态。   

### immediate.ref()

+ Returns: Immediate 对 `immediate` 对象的引用

调用时，event loop 在 `Immediate` 激活时不会退出。    

### immediate.unref()

+ Returns: Immediate

## Class: Timeout

由 `setTimeout()` 和 `setInterval()` 返回。    

API:   

+ `timeout.hasRef()`
+ `timeout.ref()`
+ `timeout.refresh()` - 将定时器的开始时间设置为当前时间，如果在一个以及执行的定时器上
调用，会重新激活那个定时器
  - Returns: Timeout
+ `timeout.unref()`