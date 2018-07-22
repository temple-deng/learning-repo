# JS 之美的笔记

## minix

两种形式可以实现 minix，一种是基于类形式和 extend 方法的，另一种是函数形式的。     

+ **类形式**      

```js
var circleFns = {
  area: function() {
    return Math.PI * this.radius * this.radius;
  },
  grow: function() {
    this.radius++;
  },
  shrink: function() {
    this.radius--;
  }
};

// 然后将这个对象 extend 到对象原型上即可
extend(RoundButton.prototype, circleFns);
```    

+ **函数形式**     

```js
var withCircle = function() {
  this.area = function() {
    return Math.PI * this.radius * this.radius;
  };
  this.grow = function() {
    this.radius++;
  };
  this.shrink = function() {
    this.radius--;
  }
}

withCircle.call(RoundButton.prototype)
```   

## 错误处理

ECMA-262 确定了7种类型的错误对象。当错误条件出现时，JS 引擎使用这些对象：    

+ Error：所有错误的基础类型。实际上从不会被引擎抛出。
+ EvalError：用 `eval()` 执行代码、出现错误时抛出。
+ RangeError：当数字超出取值范围时抛出
+ ReferenceError：期望的是一个对象，但是没有可用的对象时抛出。
+ SyntaxError：传入`eval()` 的代码存在句法错误时抛出。
+ TypeError：变量类型与预期不符时抛出。
+ URIError：当格式不正确的 URI 字符串传入 encodeURI, encodeURIComponent, decodeURI, decodeURICompoent 时
抛出     

通过调用与以上错误类型同名的构造器，可在 JS 代码任意位置创建和抛出每种错误，例如：    

```js
throw new TypeError("Unexpected Error")
throw new ReferenceError("Bad Reference")
```      

开发者最常抛出的错误类型有 `Error, RangeError, ReferenceError, TypeError`。其他类型错误专用于
JS引擎内部。     

finally 语句无论如何都会执行，甚至 try 或 catch 语句包含 return 语句，亦是如此。     

```js
function doSomething() {
  try {
    functionThatMightThrowError();
    return "success"
  } catch(e) {
    return "failure"
  } finally {
    return "finally"
  }
}
```   

这个函数总是会返回 `finally`。     

Web 浏览器，所有未捕获的错误向上冒泡，最终由 `window.onerror` 这一最高层级的事件处理函数处理。该函数接收 4 个参数：错误信息，
导致错误发生的 URL，行号和列号。作为一项附加功能，`window.onerror` 处理完毕后，返回 `true`，告诉  浏览器
错误已被处理，没必要展示给用户。       

HTML5 规范给 `window.onerror` 定义了第5个参数，即实际的错误对象。      

在 Node 中，类型的函数就是 process 对象上的 `unCaughtExcepetion` 事件。     