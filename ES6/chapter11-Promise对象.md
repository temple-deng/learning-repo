# 11. Promise对象

```
 1. 基本用法
 2. Promise.all()
 3. Promise.race()
 4. Promise.resolve()
 5. Promise.catch()
```

## 1.基本用法
Promise对象是构造函数，用来生成Promise实例。接受一个函数作为参数，该函数有两个参数，分别是resolve和reject,这是两个函数。  

resolve函数的作用是，将Promise对象的状态从“未完成”变为“成功”（即从Pending变为Resolved），在异步操作成功时调用，并将异步操作的结果，作为参数传递出去；reject函数的作用是，将Promise对象的状态从“未完成”变为“失败”（即从Pending变为Rejected），在异步操作失败时调用，并将异步操作报出的错误，作为参数传递出去。  

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
then方法可以接受两个回调函数作为参数。第一个回调函数是Promise对象的状态变为Resolved时调用，第二个回调函数是Promise对象的状态变为Reject时调用。其中，第二个函数是可选的，不一定要提供。这两个函数都接受Promise对象传出的值作为参数(明明reject传出的是error，为什么这里使用了传出的值？)。  

如果调用resolve函数和reject函数时带有参数，那么它们的参数会被传递给回调函数。

then和catch中接受的回调函数return 的值不仅只局限于字符串或者数值类型，也可以是对象或者promise对象等复杂类型。因为return的值会由 Promise.resolve(return的返回值); 进行相应的包装处理，因此不管回调函数中会返回一个什么样的值，最终 then 的结果都是返回一个新创建的promise对象。所以只要不出错就可以链式调用下去。即使没有 return 语句也是，这是就是一个立即 resolved 的 Promise,后面的`then` 中的函数可能会立即执行。也就是说， Promise#then 不仅仅是注册一个回调函数那么简单，它还会将回调函数的返回值进行变换，创建并返回一个promise对象。    


关于顺序方面，在 node 环境中测验时，`process.nextTick()` 是先于 `resolved` 的 Promise的，
所以可能 `process.nextTick` 与 resolved 的 Promise 都是在当前的 event loop 的阶段中的末尾执行，在进入下个阶段前执行。    

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


## 2.Promise.all
Promise.all方法用于将多个Promise实例，包装成一个新的Promise实例。

Promise.all方法接受一个数组作为参数，p1、p2、p3都是Promise对象的实例，如果不是，就会先调用下面讲到的Promise.resolve方法，将参数转为Promise实例，再进一步处理。（Promise.all方法的参数可以不是数组，但必须具有Iterator接口，且返回的每个成员都是Promise实例。）

p的状态由p1、p2、p3决定，分成两种情况。

（1）只有p1、p2、p3的状态都变成fulfilled，p的状态才会变成fulfilled，此时p1、p2、p3的返回值组成一个数组，传递给p的回调函数。

（2）只要p1、p2、p3之中有一个被rejected，p的状态就变成rejected，此时第一个被reject的实例的返回值，会传递给p的回调函数。


## 3.Promise.race
Promise.race方法同样是将多个Promise实例，包装成一个新的Promise实例。  

```javascript
var p = Promise.race([p1,p2,p3]);
```  

上面代码中，只要p1、p2、p3之中有一个实例率先改变状态，p的状态就跟着改变。那个率先改变的Promise实例的返回值，就传递给p的回调函数。  

需要注意的是p1,p2,p3中有一个完成后，其余的两个并不会停止执行，但是不会再触发then回调。  

Promise.race方法的参数与Promise.all方法一样，如果不是Promise实例，就会先调用下面讲到的Promise.resolve方法，将参数转为Promise实例，再进一步处理。


## 4.Promise.resolve()
Promise.resolve()用于将现有对象转为Promise对象。  

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



## 5.Promise.catch  

Promise.prototype.catch方法是.then(null, rejection)的别名，用于指定发生错误时的回调函数。另外，then方法指定的回调函数，如果运行中抛出错误，也会被catch方法捕获。

## 6. Promise.reject()  

`Promise.reject(reason)` 方法也会返回一个新的 Promise 实例，该实例的状态为 `rejected`。

注意，`Promise.reject()` 方法的参数，会原封不动地作为reject的理由，变成后续方法的参数。这一点与 `Promise.resolve` 方法不一致。
