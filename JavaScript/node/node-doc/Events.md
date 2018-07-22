# Events

+ [Passing arguments and this to listeners](#part1)
+ [Asynchronous vs. Synchronous](#part2)
+ [Handling events only once](#part3)
+ [Error events](#error)
+ [Class: EventEmitter](#class)
  - [Event: 'newListener'](#newlistener)
  - [Event: 'removeListener'](#remove)
  - [EventEmitter.defaultMaxListeners](#defalut)
  - [emitter.addListener(eventName,listener)](#add)
  - [emitter.emit(eventName[,...args])](#emit)
  - [emitter.eventNames()](#names)
  - [emitter.getMaxListeners()](#getMax)
  - [emitter.listenerCount(eventName)](#count)
  - [emitter.listeners(eventName)](#listeners)
  - [emitter.on(eventName, listener)](#on)
  - [emitter.once(eventName, listener)](#once)
  - [emitter.prependListener(eventName, listener)](#pre)
  - [emitter.prependOnceListener(eventName, listener)](#preonce)
  - [emitter.removeAllListeners([eventName])](#removeall)
  - [emitter.removeListener(eventName, listener)](#removel)
  - [emitter.setMaxListeners(n)](#setmax)


# Events

所有可以触发事件的对象都是 `EventEmitter` 类的实例。这些对象暴露了 `eventEmitter.on()` 方法
来将一个或多个函数绑定在对应名字的事件上。   

当 `EventEmitter` 对象触发一个事件时，所有绑定在这个事件上的函数都会同步地调用。监听函数的返回值都会被忽略。   

## Passing arguments and `this` to listeners

<a name="part1"></a>   

`eventEmitter.emit()` 运行将任意数量的参数传递给监听函数。并且将 `this` 设置为监听器
绑定的 `EventEmitter` 对象的引用。   

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

## Asynchronous vs. Synchronous

<a name="part2"></a>   

`EventListener` 会按照监听函数注册的顺序同步地调用。   

## Handling events only once

<a name="part3"></a>   

使用 `eventEmitter.once()` 方法，可以注册一个对特定事件只调用一次的监听器，一旦触发了这个
事件，这个监听器就会取消注册并调用。   

```javascript
const myEmitter = new MyEmitter();
let m = 0;
myEmitter.once('event', () => {
  console.log(++m);
});
myEmitter.emit('event');
// Prints: 1
myEmitter.emit('event');
// Ignored
```   

## Error events

<a name="error"></a>   

如果一个 `EventEmitter` 没有一个 `'error'` 事件的监听器，那么一旦触发了 `'error'` 事件，
就会抛出错误，打印堆栈信息，进程退出。   

```javascript
const myEmitter = new MyEmitter();
myEmitter.emit('error', new Error('whoops!'));
// Throws and crashes Node.js
```   

为了防止 Node.js 进程崩溃，可以在 `process` 对象的 `uncaughtException` 事件上绑定监听器。   

```javascript
const myEmitter = new MyEmitter();

process.on('uncaughtException', (err) => {
  console.error('whoops! there was an error');
});

myEmitter.emit('error', new Error('whoops!'));
// Prints: whoops! there was an error
```   

## Class: EventEmitter

<a name="class"></a>   

`events` 模块定义并暴露了 `EventEmitter`类：　　　

`const EventEmitter = require('events');`   

所有的 EventEmitter 实例会在添加新的监听函数时触发 `newListener` 事件，以及在移除已存在的
监听器时触发 `removeListener` 事件。   

### Event: 'newListener'

<a name="newlistener"></a>   

+ `eventName` &lt;any&gt; 新的监听器监听的事件的名字
+ `listener` &lt;Function&gt; 事件监听函数   

EventEmitter 实例会在将一个新的监听函数添加到其内部的监听器数组之前触发 `'newListener'` 事件。   

`'newListener'` 事件的监听函数会将事件名及添加的监听函数的引用作为参数。   

这个事件在添加监听函数之前触发的事实有一个微妙但很重要的副作用：如果在 `'newListener'` 回调
中为相同名字的事件再添加新的监听器，那么这个新的监听器会插入到监听函数之前。    

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

### Event: 'removeListener'

<a name="remove"></a>   

+ `eventName` &lt;any&gt;
+ `listener` &lt;Function&gt;   

在`listener`移除之后触发。　　　

### EventEmitter.defaultMaxListeners   

<a name="default"></a>   

默认情况下，对于任意的单一事件，可以注册的监听函数的最大值为 `10`。这个限制可以通过实例的
`emitter.setMaxListeners(n)` 修改。但是如果想要修改所有实例的默认值，就需要使用 `defaultMaxListeners`
属性。    

注意修改这个默认值甚至会影响那些在修改发生之前创建的实例。   

不过需要注意的是这不是一个硬性限制，修改后的实例还可以添加更多个监听函数，不过会向 stderr
中输入警告信息 "possible EventEmitter memory leak"。   

### emitter.addListener(eventName, listener)

<a name="add"></a>   

`emitter.on(eventName, listener)` 的别名。   

### emitter.emit(eventName[,...args])

<a name="emit"></a>   

+ `eventName` &lt;any&gt;
+ `...args` &lt;any&gt;   

同步调用所有注册在 `eventName` 事件上的监听器，按照注册的顺序执行。    

如果事件有监听函数的话返回 `true`,否则 `false`。   

### emitter.eventNames()   

<a name="names"></a>   

返回一个数组，列出所有实例注册了监听器的事件名。数组值可以是字符串或者 Symbols。（那就奇怪了，很多
方法中写的事件名可以是任意类型，到这就限制了,根据测试的话，应该是调用 `toString()` 方法转化为字符串）    

```javascript
const EventEmitter = require('events');
const myEE = new EventEmitter();
myEE.on('foo', () => {});
myEE.on('bar', () => {});

const sym = Symbol('symbol');
myEE.on(sym, () => {});

console.log(myEE.eventNames());
// Prints: [ 'foo', 'bar', Symbol(symbol) ]
```   

### emitter.getMaxListeners()

<a  name="getMax"></a>   

返回当前可以注册监听函数的最大值呗。   

### emitter.listenerCount(eventName)

<a  name="count"></a>   

返回特定事件的监听函数的数量。   

### emitter.listeners(eventName)   

<a name="listeners"></a>

返回特定事件的监听函数数组的一份拷贝。    

```javascript
server.on('connection', (stream) => {
  console.log('someone connected!');
});
console.log(util.inspect(server.listeners('connection')));
// Prints: [ [Function] ]
```    

### emitter.on(eventName, listener)   

<a name="on"></a>   

添加时不会检查是否 `listener` 以及被添加过。使用相同的事件名及监听函数多次调用这个函数的话，
也会导致 `listener` 添加并执行多次。    

返回实例的引用，所以可以链式调用。   

默认情况下，事件监听函数时按照添加顺序执行的。不过可以使用 `emitter.prependListener()`
方法将监听函数添加到监听数组的开头。   

```javascript
const myEE = new EventEmitter();
myEE.on('foo', () => console.log('a'));
myEE.prependListener('foo', () => console.log('b'));
myEE.emit('foo');
// Prints:
//   b
//   a
```   

### emitter.once(eventName, listener)  

<a name="once"></a>   

同样的返回实例的引用可以链式调用。也可以使用 `emitter.prependOnceListener()` 将函数添加到数组
的开头。    

### emitter.prependListener(eventName,listener)

<a name="pre"></a>

没啥好说的，将函数添加到数组头部，也不检查是否已添加，所以调用多次添加多次。   

返回实例的引用。   

### emitter.prependOnceListener(eventName, listener)

<a name="preonce"></a>   

略。   

### emitter.removeAllListeners([eventName])

<a name="removeall"></a>   

移除所有的监听函数，或者只移除特定事件的监听函数。   

返回实例引用。   

### emitter.removeListener(eventName, listener)

<a name="removel"></a>   

这个函数只会最多从数组中移除一个 `listener`。所有如果某个 `listener` 添加了多次，必须移除
多次才能移除干净。   

注意一旦触发了事件，那么所有的监听器会按序调用，这意味着在事件触发之后到最后一个监听函数
执行完成这段时间内，调用 `removeListener`, `removeAllListeners` 不会对本次事件产生影响。   

### emitter.setMaxListeners(n)

<a name="setmax"></a>   

略。   
