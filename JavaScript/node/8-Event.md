# Event

## 1. 概述

Event Emitter 是一个接口，可以在任何对象上部署。这个接口由`events`模块提供。  

```javascript
var EventEmitter = require('events');
var emitter = new EventEmitter();
```

然后，事件发生器的实例方法`on`用来监听事件，实例方法`emit`用来发出事件。  

```javascript
emitter.on('someEvent', function () {
  console.log('event has occured');
});

function f() {
  console.log('start');
  emitter.emit('someEvent');
  console.log('end');
}

f()
// start
// event has occured
// end
```


上面代码还表明，`EventEmitter`对象的事件触发和监听是同步的，即只有事件的回调函数执行以后，函数`f`才会继续执行。  


### 1.1 监听函数的参数和 `this`  

`eventEmitter.emit()` 方法允许将任意的参数传递给监听函数。但要记住当一个普通的事件监听函数被 `EventEmitter` 调用时， `this` 关键字会设为监听器绑定的 `EventEmitter` 的引用。  

```javascript
const myEmitter = new MyEmitter();
myEmitter.on('event', function(a, b) {
  console.log(a, b, this);
  // Prints:
  //   a b MyEmitter {
  //     domain: null,
  //     _events: { event: [Function] },
  //     _eventsCount: 1,
  //     _maxListeners: undefined }
});
myEmitter.emit('event', 'a', 'b');
```  

也可以使用 ES6 箭头函数语法绑定监听函数，但是这样的话， `this` 关键字不再引用 `EventEmitter` 实例：  

```javascript
const myEmitter = new MyEmitter();
myEmitter.on('event', (a, b) => {
  console.log(a, b, this);
  // Prints: a b {}
});
myEmitter.emit('event', 'a', 'b');
```  

### 1.2 异步还是同步

`EventListener` 会按照注册顺序同步地调用所有的监听函数。在合适的时候，可以将监听函数通过使用 `setImmediate()` 或 `process.nextTick()` 将监听函数改为异步模式：  

```javascript
const myEmitter = new MyEmitter();
myEmitter.on('event', (a, b) => {
  setImmediate(() => {
    console.log('this happens asynchronously');
  });
});
myEmitter.emit('event', 'a', 'b');
```


## 2. 事件

### 2.1 'newListener'

+ `eventName`: `<any>` 监听是事件名。
+ `listener` : `<Function>` 事件处理函数

`EventEmitter` 实例会在有监听函数添加进监听器数组中之前触发自身的 `'newListener'` 事件。  

`'newListener'` 事件注册的监听器接受事件名字和添加的监听器的引用作为参数。  

但需要注意的是这个在添加监听器之前触发的事件有个微小但重要的副作用：任何在 `'newListener'` 回调中注册的同名的的监听器在触发处理时将被插入到正在添加的监听器之前。  

```javascript
const myEmitter = new MyEmitter();
// Only do this once so we don't loop forever
myEmitter.once('newListener', (event, listener) => {
  if (event === 'event') {
    // Insert a new listener in front
    myEmitter.on('event', () => {
      console.log('B');
    });
  }
});
myEmitter.on('event', () => {
  console.log('A');
});
myEmitter.emit('event');
// Prints:
//   B
//   A
```  

### 2.2 'removeListener'

+ `eventName` : `<any>` 事件名
+ `listener` : `<Function>` 事件处理函数

`'removeListener'` 事件在 `listener` 移除之后触发。  


## 3. 属性

### 3.1 静态属性 EventEmitter.defaultMaxListeners

默认情况下，任何单一事件最多可以注册10个监听器。这个限制可以通过调用每个 `EventEmitter` 实例的 `emitter.setMaxListeners(n)` 方法修改。如果想要为所有 `EventEmitter` 实例修改这个默认值，
就可以使用这个属性。  


### 3.2 emitter.addListener(eventName, listener)

+ `eventName` : `<any>`
+ `listener` : `<Function>`

`emitter.on(eventName, listener)` 的别名

### 3.3 emitter.emit(eventName[,...args])

+ `eventName` : `<any>`
+ `...args` : `<any>`

同步调用事件名为 `eventName` 事件的每个监听函数，按照注册的顺序调用。 如果事件有监听器返回 `true`，否则返回 `false`。  


### 3.3 emitter.eventNames()

返回一个数组包含了所有注册了监听器的事件名字。值可能是字符串或者 Symbols。  


### 3.4 emitter.getMaxListeners()

### 3.5 emitter.listenerCount(eventName)

`eventName` : `<any>` 监听的事件名。  

返回 `eventName` 的监听器数量。  

### 3.6 emitter.listeners(eventName)

返回包含事件名为 `eventName` 参数的监听器函数副本的数组。  


### 3.7 emitter.on(eventName, listener)

+ `eventName`: `<any>` 事件名
+ `listener` : `<Function>` 回调函数

多次传入同样的 `eventName` 和 `listener` 会导致 `listener` 添加多次并调用多次。但会一个 `EventEmitter` 的引用，所以可以链式调用。  

默认是按照添加顺序调用监听器函数的。但是 `emitter.prependListener()` 可以用来将监听器函数放在监听数组的第一位。  


### 3.8 emitter.once(eventName, listener)

添加一个只执行一次的监听器函数，在第二次事件触发时，这个监听器就已经被移除了。也是返回 `EventEmitter` 的引用，所有也可以链式调用。  

也可以通过 `emitter.prependOnceListener()` 改变监听函数的执行顺序。  


### 3.9 emitter.prependListener(eventName, listener)

同样有相同参数注册多次调用多次的情况。  

### 3.10 emitter.prependOnceListener(eventName,listener)

### 3.11 emitter.removeAllListeners([eventName])

### 3.12 emitter.removeListener(eventName,listener)

这个函数每次最多只能移除一个监听器实例，所以对于同一监听器注册了多次的话，必须多次调用移除。  

注意一旦触发了一个事件，此时所有绑定在事件上的监听器都会按序调用。这表明在事件触发之后并且在最后一个监听器执行完成之前调用 `removeListener` 或者 `removeAllListeners` 不会在此次触发进程中移除任何的监听器。  

### 3.13 emitter.setMaxListeners(n) 
