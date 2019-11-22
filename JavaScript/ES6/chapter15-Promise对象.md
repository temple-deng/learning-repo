# 15. Promise对象

<!-- TOC -->

- [15. Promise对象](#15-promise对象)
  - [15.1 基本用法](#151-基本用法)
  - [15.2 Promise.prototype.then()](#152-promiseprototypethen)
  - [15.3 Promise.prototype.catch()](#153-promiseprototypecatch)
  - [15.4 Promise.prototype.finally()](#154-promiseprototypefinally)
  - [15.5 Promise.all](#155-promiseall)
  - [15.5 Promise.race](#155-promiserace)
  - [15.6 Promise.allSettled()](#156-promiseallsettled)
  - [15.7 Promise.any()](#157-promiseany)
  - [15.8 Promise.resolve()](#158-promiseresolve)
  - [15.9 Promise.reject()](#159-promisereject)

<!-- /TOC -->

## 15.1 基本用法

Promise对象是构造函数，用来生成Promise实例。接受一个函数作为参数，该函数有两个参数，分别是
resolve和reject,这是两个函数。  

resolve函数的作用是，将Promise对象的状态从“未完成”变为“成功”（即从Pending变为Resolved），
在异步操作成功时调用，并将异步操作的结果，作为参数传递出去；reject函数的作用是，将Promise对象
的状态从“未完成”变为“失败”（即从Pending变为Rejected），在异步操作失败时调用，并将异步操作报出
的错误，作为参数传递出去。  

Promise实例生成以后，可以用then方法分别指定Resolved状态和Reject状态的回调函数。    

```javascript
 var promise = new Promise(function(resolve, reject){
    //some code
    if( /*异步操作成功*/ ){
        resolve(value)
    }else {
        reject(error)
    }
});

promise.then(function(value){}, function(value){});
```  

注意，调用resolve或reject并不会终结 Promise 的参数函数的执行：    

```js
new Promise((resolve, reject) => {
  resolve(1);
  console.log(2);
}).then(r => {
  console.log(r);
});
// 2
// 1
```

## 15.2 Promise.prototype.then()

then 方法返回的是一个新的 `Promise` 实例。   


关于顺序方面，在 node 环境中测验时，`process.nextTick()` 是先于 `resolved` 的 Promise的，
所以可能 `process.nextTick` 与 resolved 的 Promise 都是在当前的 event loop 的阶段中的
末尾执行，在进入下个阶段前执行。    

```javascript
var promise = new Promise(function(resolve, reject) {
  resolve('hahahha');
});

process.nextTick(function() {
  console.log('xixixi');
});

promise.then(function(str) {
  console.log(str);
}).then(function() {
  console.log('lulo')
});

setImmediate(function() {
  console.log('hehehhe');
});

/**  xixixi
*    hahahha
*    lulo
*    hehehhe
*/
```     

## 15.3 Promise.prototype.catch()

略。    

## 15.4 Promise.prototype.finally()

`finally()` 方法的回调函数不接受任何参数，这意味着没有办法知道，前面的 Promise 状态到底是
resolved 还是 rejected。    

## 15.5 Promise.all

Promise.all方法用于将多个Promise实例，包装成一个新的Promise实例。

Promise.all方法接受一个数组作为参数，p1、p2、p3都是Promise对象的实例，如果不是，就会先调用下面讲到的Promise.resolve方法，将参数转为Promise实例，再进一步处理。（Promise.all方法的参数可以不是数组，
但必须具有Iterator接口，且返回的每个成员都是Promise实例。）

p的状态由p1、p2、p3决定，分成两种情况。

（1）只有p1、p2、p3的状态都变成fulfilled，p的状态才会变成fulfilled，此时p1、p2、p3的返回值组成一个数组，传递给p的回调函数。

（2）只要p1、p2、p3之中有一个被rejected，p的状态就变成rejected，此时第一个被reject的实例的返回值，会传递给p的回调函数。    

注意，如果作为参数的 Promise 实例，自己定义了`catch`方法，那么它一旦被rejected，并不会触发`Promise.all()` 的 `catch` 方法。    

```js
const p1 = new Promise((resolve, reject) => {
  resolve('hello');
})
.then(result => result)
.catch(e => e);

const p2 = new Promise((resolve, reject) => {
  throw new Error('报错了');
})
.then(result => result)
.catch(e => e);

Promise.all([p1, p2])
.then(result => console.log(result))
.catch(e => console.log(e));
// ["hello", Error: 报错了]
```    

上面代码中，`p1`会resolved，`p2`首先会rejected，但是p2有自己的`catch`方法，该方法返回的是一个新的 Promise 实例，p2指向的实际上是这个实例。   

该实例执行完`catch`方法后，也会变成resolved，导致`Promise.all()`方法参数里面的两个实例都会
resolved，因此会调用`then`方法指定的回调函数，而不会调用`catch`方法指定的回调函数。


## 15.5 Promise.race

`Promise.race` 方法同样是将多个Promise实例，包装成一个新的Promise实例。  

```javascript
var p = Promise.race([p1,p2,p3]);
```  

上面代码中，只要p1、p2、p3之中有一个实例率先改变状态，p的状态就跟着改变。那个率先改变的Promise实例的返回值，就传递给p的回调函数。  

需要注意的是p1,p2,p3中有一个完成后，其余的两个并不会停止执行，但是不会再触发then回调。  

Promise.race方法的参数与Promise.all方法一样，如果不是Promise实例，就会先调用下面讲到的Promise.resolve方法，将参数转为Promise实例，再进一步处理。

## 15.6 Promise.allSettled()

`Promise.allSetteld()` 方法接受一组 Promise 实例作为参数，包装成一个新的 Promise 实例，
只有等这些参数实例都返回结果，不管是 resolved 还是 rejected，包装实例才会结束。     

该方法返回新的 Promise 实例，一旦结束，状态总是 resolved，不会变成 reject。状态变成 resolved
后，Promise 的监听函数接收到的参数是一个数组，每个成员对应一个传入 `Promise.allSettled()`
的 Promise 实例。   

```js
const resolved = Promise.resolve(42);
const rejected = Promise.reject(-1);

const allSettledPromise = Promise.allSettled([resolved, rejected]);

allSettledPromise.then(function (results) {
  console.log(results);
});
// [
//    { status: 'fulfilled', value: 42 },
//    { status: 'rejected', reason: -1 }
// ]
``` 

该数组的每个成员都是一个对象，对应传入 `Promise.allSettled()` 的两个 Promise 实例。每个
对象都有 `status` 属性，该属性的值只可能是字符串 `fulfilled` 或字符串 `rejected`。
fulfilled时，对象有 `value` 属性，rejected时有 `reason` 属性，对应两种状态的返回值。    

## 15.7 Promise.any()

`Promise.any()` 方法接受一组 Promise 实例作为参数，包装成一个新的 Promise 实例。只要参数
实例有一个变成 `fulfilled` 状态，包装实例就变成了 `fulfilled` 状态；如果所有参数实例都
变成了 `rejected` 状态，包装实例就会变成 rejected 状态。    



## 15.8 Promise.resolve()

`Promise.resolve()` 用于将现有对象转为Promise对象。  

```javascript
Promise.resolve('foo')
// 等价于
new Promise(resolve => resolve('foo'))
```  

参数分为四种情况:  

（1）参数是一个Promise实例

如果参数是Promise实例，那么Promise.resolve将不做任何修改、原封不动地返回这个实例。

（2）参数是一个thenable对象

thenable对象指的是具有then方法的对象，比如下面这个对象。

```javascript
let thenable = {
  then: function(resolve, reject) {
    resolve(42);
  }
};
```

Promise.resolve方法会将这个对象转为Promise对象，然后就立即执行thenable对象的then方法。  

（3）参数不是具有then方法的对象，或根本就不是对象

如果参数是一个原始值，或者是一个不具有then方法的对象，则Promise.resolve方法返回一个新的Promise对象，状态为Resolved。  

```javascript
var p = Promise.resolve('Hello');

p.then(function (s){
  console.log(s)
});
// Hello
```  

上面代码生成一个新的Promise对象的实例p。由于字符串Hello不属于异步操作（判断方法是它不是具有then方法的对象），返回Promise实例的状态从一生成就是Resolved，所以回调函数会立即执行。Promise.resolve方法的参数，会同时传给回调函数。  

（4）不带有任何参数

Promise.resolve方法允许调用时不带参数，直接返回一个Resolved状态的Promise对象。  

Promise.reject(reason)方法也会返回一个新的Promise实例，该实例的状态为rejected。它的参数用法与Promise.resolve方法完全一致。


## 15.9 Promise.reject()  

`Promise.reject(reason)` 方法也会返回一个新的 Promise 实例，该实例的状态为 `rejected`。

注意，`Promise.reject()` 方法的参数，会原封不动地作为reject的理由，变成后续方法的参数。这一点与 `Promise.resolve` 方法不一致。
