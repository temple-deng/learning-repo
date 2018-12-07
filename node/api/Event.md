# Events

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
方法修改。或者通过 `EventEmitter.defaultMax

