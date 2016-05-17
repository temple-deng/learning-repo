# 10. Generator函数

标签： Generator

---

```
 1. 简介
 2. next()的参数
 3. Generator.prototype.return()
 4. yield*语句
```
 ---

###　     1.简介
　　　　　执行Generator函数会返回一个遍历器对象，也就是说，Generator函数除了状态机，还是一个遍历器对象生成函数。返回的遍历器对象，可以依次遍历Generator函数内部的每一个状态。

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

（1）遇到yield语句，就暂停执行后面的操作，并将紧跟在yield后面的那个表达式的值，作为返回的对象的value属性值。

（2）下一次调用next方法时，再继续往下执行，直到遇到下一个yield语句。

（3）如果没有再遇到新的yield语句，就一直运行到函数结束，直到return语句为止，并将return语句后面的表达式的值，作为返回的对象的value属性值。

（4）如果该函数没有return语句，则返回的对象的value属性值为undefined。

yield语句不能用在普通函数中，否则会报错。

要注意Generator函数有没有return语句的区别，当有return语句时，返回的对象value值就是return语句后面的表达式，而done值为true，表示遍历结束，而如果最后的语句没有用return而是普通的yield，那么此时的done仍然为false.

<br>
<br>

###       2.next()的参数
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
<br>
###　     3. Generator.prototype.return()
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
　  
　  
###　     4.yield*语句
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
上面代码说明，yield*不过是for...of的一种简写形式，完全可以用后者替代前者。如果yield*后面跟着一个数组，由于数组原生支持遍历器，因此就会遍历数组成员。实际上，任何数据结构只要有Iterator接口，就可以被yield*遍历。


<br>
<br>
###　6. for..of循环
for...of循环、扩展运算符（...）、解构赋值和Array.from方法内部调用的，都是遍历器接口。这意味着，它们可以将Generator函数返回的Iterator对象，作为参数。
```javascript
  function* numbers () {
    yield 1
    yield 2
    return 3
    yield 4
  }

  [...numbers()] // [1, 2]

  Array.from(numbers()) // [1, 2]

  let [x, y] = numbers();
  x // 1
  y // 2

  for (let n of numbers()) {
    console.log(n)
  }
  // 1
  // 2

  //都是执行到2就没了，  应该是遇到返回对象done:true;就提前跳出循环
```

