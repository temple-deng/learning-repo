# Events

<!-- TOC -->

- [Events](#events)
  - [传递参数及 this 给监听器](#传递参数及-this-给监听器)
  - [Class: EventEmitter](#class-eventemitter)
    - [Event: 'newListener'](#event-newlistener)
    - [Event: 'removeListener'](#event-removelistener)
    - [EventEmitter.defaultMaxListeners](#eventemitterdefaultmaxlisteners)
    - [emitter.addListener(eventName, listener)](#emitteraddlistenereventname-listener)
    - [emitter.emit(eventName[,...args])](#emitteremiteventnameargs)
    - [emitter.eventNames()](#emittereventnames)
    - [emitter.getMaxListeners()](#emittergetmaxlisteners)
    - [emitter.listenerCount(eventName)](#emitterlistenercounteventname)
    - [emitter.listeners(eventName)](#emitterlistenerseventname)
    - [emitter.off(eventName, listener)](#emitteroffeventname-listener)
    - [emitter.on(eventName, listener)](#emitteroneventname-listener)
    - [emitter.once(eventName, listener)](#emitteronceeventname-listener)
    - [emitter.prependListener(eventName, listener)](#emitterprependlistenereventname-listener)
    - [emitter.prependOnceListener(eventName, listener)](#emitterprependoncelistenereventname-listener)
    - [emitter.removeAllListeners([eventName])](#emitterremovealllistenerseventname)
    - [emitter.removeListener(eventName, listener)](#emitterremovelistenereventname-listener)
    - [emitter.setMaxListeners(n)](#emittersetmaxlistenersn)
    - [emitter.rawListeners(eventName)](#emitterrawlistenerseventname)

<!-- /TOC -->

## 传递参数及 this 给监听器

使用 `eventEmitter.emit()` 方法可以传递任意的参数给监听函数。监听函数内部的 `this` 指向
了 `EventEmitter` 对象实例。   

不过如果使用箭头函数的话，`this` 就不再指向对象实例了。   

## Class: EventEmitter

```js
const EventEmitter = require('events');
```   

### Event: 'newListener'

+ `eventName` string | symbol. 被监听的事件的名称
+ `listener` Function

在一个监听器添加到监听器数组前触发 `newListener` 事件。    

回调函数的参数分别为事件名称及对添加的监听器函数的引用。   

### Event: 'removeListener'

在监听器被移除后调用。参数同上。   

### EventEmitter.defaultMaxListeners

默认情况下，同一事件最多添加 10 个回调。这个限制可以通过调用每个实例上的 `emitter.setMaxListeners(n)`
方法修改。或者通过 `EventEmitter.defaultMaxListeners` 为所有实例修改默认的数值。    

不过 `emitter.setMaxListeners(n)` 的优先级要更高。   

注意这个限制并不是一个死限制。实例仍然能够添加更多的监听器，但是会输出一条警告信息到 stderr
中 "possible EventEmitter memory leak"。     

### emitter.addListener(eventName, listener)

+ `eventName` string | symbol
+ `listener` Function

`emitter.on(eventName, listener)` 的别名。    

### emitter.emit(eventName[,...args])

+ Returns: boolean

如果 `eventName` 已经有监听器了返回 `true`。    

### emitter.eventNames()

+ Returns: Array

### emitter.getMaxListeners()

略。    

### emitter.listenerCount(eventName)

略。   

### emitter.listeners(eventName)

+ Returns: Function\[\]

### emitter.off(eventName, listener)

`emitter.removeListener()` 的别名。   

### emitter.on(eventName, listener)

略。   

### emitter.once(eventName, listener)

略。   

### emitter.prependListener(eventName, listener)

将监听器添加到 `eventName` 监听回调队列的队首。    

### emitter.prependOnceListener(eventName, listener)

略。   

### emitter.removeAllListeners([eventName])

略。   

### emitter.removeListener(eventName, listener)

`removeListener` 每次最多从监听器队列中移除一个监听器。如果一个函数被多次添加到队列中，
那也必须多次调用才能全部移除掉。   

### emitter.setMaxListeners(n)

略。    

### emitter.rawListeners(eventName)

这个好像意思是包含了通过 `.once` 绑定的监听器。   