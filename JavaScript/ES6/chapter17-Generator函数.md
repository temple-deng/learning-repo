# 17. Generator函数

<!-- TOC -->

- [17. Generator函数](#17-generator函数)
  - [17.1 简介](#171-简介)
  - [17.2 next()的参数](#172-next的参数)
  - [17.3 for...of 循环](#173-forof-循环)
  - [17.4 throw() 方法](#174-throw-方法)
  - [17.5 Generator.prototype.return()](#175-generatorprototypereturn)
  - [17.6 yield*语句](#176-yield语句)
  - [17.7 Generator 函数的 this](#177-generator-函数的-this)

<!-- /TOC -->

## 17.1 简介

执行Generator函数会返回一个遍历器对象，也就是说，Generator函数除了状态机，还是一个遍历器对象
生成函数。返回的遍历器对象，可以依次遍历Generator函数内部的每一个状态。

形式上，Generator函数是一个普通函数，但是有两个特征。一是，function命令与函数名之间有一个星号；二是，函数体内部使用yield语句，定义不同的内部状态。  

```javascript
function* helloWorldGenerator() {
  yield 'hello';
  yield 'world';
  return 'ending';
}

var hw = helloWorldGenerator();
```  

调用Generator函数后，该函数并不执行，返回的也不是函数运行结果，而是一个指向内部状态的指针对象，也就是遍历器对象。必须调用遍历器对象的next方法，使得指针移向下一个状态。也就是说，每次调用next方法，内部指针就从函数头部或上一次停下来的地方开始执行，直到遇到下一个yield语句（或return语句）为止。换言之，Generator函数是分段执行的，yield语句是暂停执行的标记，而next方法可以恢复执行。  


遍历器对象的next方法的运行逻辑如下。  

1. 遇到yield语句，就暂停执行后面的操作，并将紧跟在yield后面的那个表达式的值，作为返回的对象的value属性值。
2. 下一次调用next方法时，再继续往下执行，直到遇到下一个yield语句。
3. 如果没有再遇到新的yield语句，就一直运行到函数结束，直到return语句为止，并将return语句后面的表达式的值，作为返回的对象的value属性值。
4. 如果该函数没有return语句，则返回的对象的value属性值为undefined。

yield语句不能用在普通函数中，否则会报错。  

另外，`yield` 表达式如果用在另一个表达式之中，必须放在圆括号里面。   

`yield` 表达式用作函数参数或放在赋值表达式的右边，可以不加括号。    

```js
function* demo() {
  foo(yield 'a', yield 'b');
  let input = yield;
}
```    


要注意Generator函数有没有return语句的区别，当有return语句时，返回的对象value值就是return
语句后面的表达式，而done值为true，表示遍历结束，而如果最后的语句没有用return而是普通的yield，
那么此时的done仍然为false.    

由于 Generator 函数就是遍历器生成函数，因此可以把 Generator 赋值给对象的 `Symbol.iterator`
属性，从而使得该对象具有 Iterator 接口。   

Genartor 函数执行后，返回一个遍历器对象。该对象本身也具有 `Symbol.iterator` 属性，执行后
返回自身。   

```js
function* gen(){
  // some code
}

var g = gen();

g[Symbol.iterator]() === g
// true
```

## 17.2 next()的参数

yield句本身没有返回值，或者说总是返回undefined。next方法可以带一个参数，该参数就会被当作上一个yield语句的返回值。  

```javascript
function* foo(x) {
  var y = 2 * (yield (x + 1));
  var z = yield (y / 3);
  return (x + y + z);
}

var a = foo(5);
a.next() // Object{value:6, done:false}
a.next() // Object{value:NaN, done:false}
a.next() // Object{value:NaN, done:true}

var b = foo(5);
b.next() // { value:6, done:false }
b.next(12) // { value:8, done:false }
b.next(13) // { value:42, done:true }
```

注意，在上例中，第一次调用next()不会执行y的赋值操作，在第二次next()调用时才首先完成该赋值语句。  

## 17.3 for...of 循环

`for...of` 循环可以自动遍历 Generator 函数运行时生成的 `Iterator` 对象：    

```js
function* foo() {
  yield 1;
  yield 2;
  yield 3;
  yield 4;
  yield 5;
  return 6;
}

for (let v of foo()) {
  console.log(v);
}
// 1 2 3 4 5
```   

这里需要注意，一旦 `next` 方法的返回对象的 `done` 属性为 `true`，`for...of`循环就会中止，
且不包含该返回对象，所以上面代码的return语句返回的6，不包括在for...of循环之中。    

除了for...of循环以外，扩展运算符（...）、解构赋值和Array.from方法内部调用的，都是遍历器接口。
这意味着，它们都可以将 Generator 函数返回的 Iterator 对象，作为参数。    

尤其可以这样理解，所有需要遍历的地方，都会调用要操作对象的 `Symbol.iterator` 方法生成遍历器
对象，然后进行迭代，而 Generator 函数执行后返回的对象的 `Symbol.iterator` 还会返回自身，所以
可以直接遍历没问题。   


## 17.4 throw() 方法

Generator函数返回的遍历器对象，都有一个 `throw` 方法，可以在函数体外抛出错误，然后在Generator函数体内捕获。  

throw方法可以接受一个参数，该参数会被catch语句接收，建议抛出Error对象的实例。  

throw方法被捕获以后，会附带执行下一条yield语句。也就是说，会附带执行一次next方法。

```javascript
var gen = function* gen(){
  try {
    yield console.log('a');
  } catch (e) {
    // ...
  }
  yield console.log('b');
  yield console.log('c');
}

var g = gen();
g.next() // a
g.throw() // b
g.next() // c
```  

如果 Generator 函数内部没有部署try...catch代码块，那么throw方法抛出的错误，将被外部try...catch
代码块捕获。    

```js
var g = function* () {
  while (true) {
    yield;
    console.log('内部捕获', e);
  }
};

var i = g();
i.next();

try {
  i.throw('a');
  i.throw('b');
} catch (e) {
  console.log('外部捕获', e);
}
// 外部捕获 a
```    

`throw` 方法抛出的错误要被内部捕获，前提是必须至少执行过一次 `next` 方法。   

一旦 Generator 执行过程中抛出错误，且没有被内部捕获，就不会再执行下去了。如果此后还调用next方法，
将返回一个value属性等于undefined、done属性等于true的对象，即 JavaScript 引擎认为这个
Generator 已经运行结束了。   

## 17.5 Generator.prototype.return()

可以返回给定的值，并且终结遍历Generator函数。  

```javascript
    function* gen() {
      yield 1;
      yield 2;
      yield 3;
    }

    var g = gen();

    g.next()        // { value: 1, done: false }
    g.return("foo") // { value: "foo", done: true }
    g.next()        // { value: undefined, done: true }
```  

如果return方法调用时，不提供参数，则返回值的vaule属性为undefined。　　

如果Generator函数内部有try...finally代码块，那么return方法会推迟到finally代码块执行完再执行。  

```javascript
function* numbers () {
  yield 1;
  try {
    yield 2;
    yield 3;
  } finally {
    yield 4;
    yield 5;
  }
  yield 6;
}
var g = numbers();
g.next() // { value: 1, done: false }
g.next() // { value: 2, done: false }
g.return(7) // { value: 4, done: false }
g.next() // { value: 5, done: false }
g.next() // { value: 7, done: true }
```  
　  
　  
## 17.6 yield*语句

在Generator()函数调用另一个Generator()函数时，需要使用yield*。  

```javascript
function* inner() {
  yield 'hello!';
}

function* outer1() {
  yield 'open';
  yield inner();
  yield 'close';
}

var gen = outer1()
gen.next().value // "open"
gen.next().value // 返回一个遍历器对象；value:function* inner() {  yield 'hello!';}
gen.next().value // "close"

function* outer2() {
  yield 'open'
  yield* inner()
  yield 'close'
}

var gen = outer2()
gen.next().value // "open"
gen.next().value // "hello!"
gen.next().value // "close"
```

yield*语句等同于在Generator函数内部，部署一个for...of循环。  

```javascript
function* concat(iter1, iter2) {
  yield* iter1;
  yield* iter2;
}

// 等同于

function* concat(iter1, iter2) {
  for (var value of iter1) {
    yield value;
  }
  for (var value of iter2) {
    yield value;
  }
}
```  

上面代码说明，`yield*` 后面的Generator函数（没有`return`语句时），不过是`for...of`的一种简写形式，完全可以用后者替代前者。反之，则需要用`var value = yield* iterator`的形式获取return语句的值。由于 return 语句返回的对象 `done` 为 `true`，所以 `return` 的值不会被迭代出来，只是会被接收。  

如果yield\*后面跟着一个数组，由于数组原生支持遍历器，因此就会遍历数组成员。实际上，任何数据结构只要有Iterator接口，就可以被yield*遍历。  


## 17.7 Generator 函数的 this   

Generator 函数总是返回一个遍历器，ES6 规定这个遍历器是 Generator 函数的实例，也继承了 Generator 函数的`prototype`对象上的方法。      

```javascript
function* g() {}

g.prototype.hello = function () {
  return 'hi!';
};

let obj = g();

obj instanceof g // true
obj.hello() // 'hi!'
```    

上面代码表明，Generator 函数`g`返回的遍历器`obj`，是`g`的实例，而且继承了`g.prototype`。但是，如果把`g`当作普通的构造函数，并不会生效，因为`g`返回的总是遍历器对象，而不是`this`对象。    

```javascript
function* g() {
  this.a = 11;
}

let obj = g();
obj.a // undefined
```     

Generator函数也不能跟`new`命令一起用，会报错。
