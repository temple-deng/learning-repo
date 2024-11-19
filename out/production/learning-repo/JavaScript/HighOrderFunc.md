# 高阶函数

## 1. 柯里化

currying 又称部分求值。一个 currying 的函数首先会接受一些参数，接受了这些参数之后，该函数不会
立即求值，而是继续返回另外一个函数，刚才传入的参数在函数形成的闭包中保存起来。待到函数被真正需要求值
的时候，之前传入的所有参数都会被一次性用于求值。  

典型的连续求和的例子，实现连续调用： `sum(1)(2)(3)`。  

不过这样的函数必须要有一个终止条件来终止函数的连续执行，这里用的是不穿参数：  

```JavaScript
var sum = (function() {
  var args = [];
  return function() {
    var summary = 0;
    if(arguments.length === 0) {
      for(var i = 0, l = args.length; i < l; i++) {
        summary += args[i];
      }
      return summary;
    } else {
      [].push.apply(args, arguments);
      return arguments.callee;
    }
  }
})();
```  

下面的是一个通用的 function currying() {}, 接受一个参数，即将要被 currying 的函数。  

```JavaScript
function currying( fn ){
  var args = [];

  return function() {
    if(arguments.length === 0) {
      return fn.apply(this, args);
    } else {
      [].push.apply(args, arguments);
      return arguments.callee;
    }
  }
};
```  

改装一下 sum 函数：  

```JavaScript
var sum = (function() {
  var summary = 0;

  return function() {
    for(var i = 0; i < arguments.length; i++) {
      summary += arguments[i];
    }
    return summary;
  }
})();
```


## 2. 泛化 this, uncurrying

```javascript
Function.prototype.uncurrying = function() {
  var self = this;
  return function() {
    var obj = Array.prototype.shift.call(arguments);
    return self.apply(obj, arguments);
  }
}

var push = Array.prototype.push.uncurrying();

(function() {
  push(arguments, 4);
  console.log( arguments );   
  // [1,2,3,4] 注意这种写法其实不准确，因为 arguments 对象其实是类数组对象
})(1,2,3);

```  

这个函数其实貌似主要是将函数调用时的内部的 `this` 指向绑定在真正调用时传入的第一个参数上，
这样就可以实现不管对象有没有实现这个方法，但是都可以使用。  

还有一种写法，但是看不太懂

```javascript
Function.prototype.uncurrying = function() {
  var self = this;
  return function() {
    return Function.prototype.call.apply( self, arguments);
    // Function.prototype.call.apply( self, arguments) 执行完第一步应该是得到
    // 类似 self.call(arguments[0], arguments[1], ...) 等效果
  }
}
```    

## 3. 函数节流

将被执行的函数用 setTimeout 延迟一段时间执行。如果该次延迟执行还没有完成，则忽略接下来
调用该函数的请求。  

```javascript
var throttle = function( fn, interval) {
  var _self = fn,
      timer,
      firstTime;

  return function() {
    var args = arguments;
    var _me = this;
    if(firstTime) {
      _self.apply(_me, args);
      return firstTime = false;
    }

    if( timer ) {   // 如果timer 还在，说明上一次延迟还没有执行。
      return ;
    }

    timer = setTimeout( function () {
      clearTimeout( timer );
      timer = null;         // 只有在延迟中才会清除定时器
      _self.apply( _me, args);
    }, interval || 500)
  }
}

var throttle = function (fn, interval) {
    let last = 0;

    return function (...args) {
        const now = Date.now();
        if (now - last > interval) {
            fn.apply(this, args);
            last = now;
        }
    }
}
```  
