﻿# 函数

## 函数声明和函数表达式

ECMA规范规定：函数声明必须带有标识符(Identifier)(就是函数名)，而函数表达式可以省略。    

但是当声明了函数名称，如何判断是函数声明还是函数表达式呢？ECMAScript是通过上下文来区分的，如果function foo(){}是作为赋值表达式的一部分的话，那它就是一个函数表达式，如果function foo(){}被包含在一个函数体内，或者位于程序的最顶部的话，那它就是一个函数声明。还有一种函数表达式不太常见，就是被括号括住的(function foo(){})，他是表达式的原因是因为括号 ()是一个分组操作符，它的内部只能包含表达式。   


```javascript
function foo(){} // 声明，因为它是程序的一部分
  var bar = function foo(){}; // 表达式，因为它是赋值表达式的一部分

  new function bar(){}; // 表达式，因为它是new表达式  (说好的赋值表达式呢？)

  (function(){
    function bar(){} // 声明，因为它是函数体的一部分
  })();

   function foo(){} // 函数声明
  (function foo(){}); // 函数表达式：包含在分组操作符内

  try {
    (var x = 5); // 分组操作符，只能包含表达式而不能包含语句：这里的var就是语句
  } catch(err) {
    // SyntaxError
  }
```  


## 原型链

如果一个对象的prototype没有显示的声明过或定义过，那么`__proto__`的默认值就是Object.prototype, 而Object.prototype也会有一个`__proto__`, 这个就是原型链的终点了，被设置为null。   

```javascript
var a = {};
a.__proto__ === Object.prototype;   //true
```    

**构造函数**  

除了创建对象，构造函数(constructor) 还做了另一件有用的事情—自动为创建的新对象设置了原型对象(prototype object) 。原型对象存放于 ConstructorFunction.prototype 属性中。  

![原型链][1]


## 执行上下文栈(Execution Context Stack)    

每一种代码的执行都需要依赖自身的上下文。当然global的上下文可能涵盖了很多的function和eval的实例。函数的每一次调用，都会进入函数执行中的上下文,并且来计算函数中变量等的值。eval函数的每一次执行，也会进入eval执行中的上下文，判断应该从何处获取变量的值。    


当一段程序开始时，会先进入全局执行上下文环境[global execution context], 这个也是堆栈中最底部的元素。此全局程序会开始初始化，初始化生成必要的对象[objects]和函数[functions]. 在此全局上下文执行的过程中，它可能会激活一些方法（当然是已经初始化过的），然后进入他们的上下文环境，然后将新的元素压入堆栈。在这些初始化都结束之后，这个系统会等待一些事件（例如用户的鼠标点击等），会触发一些方法，然后进入一个新的上下文环境。  

见图5，有一个函数上下文“EC1″和一个全局上下文“Global EC”，下图展现了从“Global EC”进入和退出“EC1″时栈的变化:   
![ECT][2]


## 执行上下文(Execution Context)

一个执行的上下文可以抽象的理解为object。每一个执行的上下文都有一系列的属性（我们称为上下文状态），他们用来追踪关联代码的执行进度。这个图示就是一个context的结构。  

![EC][3]

在一个函数上下文中，变量对象(Variable object)被表示为活动对象(activation object)。  

当函数被调用者激活，这个特殊的活动对象(activation object) 就被创建了。它包含普通参数(formal parameters) 与特殊参数(arguments)对象(具有索引属性的参数映射表)。*活动对象在函数上下文中作为变量对*象使用*。  (明明在上面EC图中VO也有arguments对象)  

即：函数的变量对象保持不变，但除去存储变量与函数声明之外，还包含以及特殊对象arguments 。  

## 作用域链(Scope chain)

作用域链是一个 对象列表(list of objects) ，用以检索上下文代码中出现的 标识符(identifiers) 。  

`Scope = AO + [[scope]];`    

[[scope]]在函数创建时被存储－－静态（不变的），永远永远，直至函数销毁。即：函数可以永不调用，但[[scope]]属性已经写入，并存储在函数对象中。在标识符解析过程中，使用函数创建时定义的词法作用域.   


我们看到，在函数创建时获得函数的[[scope]]属性，通过该属性访问到所有父上下文的变量。但是，这个规则有一个重要的例外，它涉及到通过函数构造函数创建的函数。`Function('alert(x); alert(y);');`函数构造函数创建的函数的[[scope]]属性总是唯一的全局对象。（之前提到过这种方式创建的函数不能访问局部变量，就是这个问题）  

## 闭包

闭包是一系列代码块（在ECMAScript中是函数），并且静态保存所有父级的作用域。通过这些保存的作用域来搜寻到函数中的自由变量。  

请注意，因为每一个普通函数在创建时保存了[[Scope]]，理论上，ECMAScript中所有函数都是闭包。  



### 7.this
this与上下文中可执行代码的类型有直接关系，this值在进入上下文时确定，并且在上下文运行期间永久不变。  

影响了函数代码中this值的变化有几个因素：  

首先，在通常的函数调用中，this是由激活上下文代码的调用者来提供的，即调用函数的父上下文(parent context )。this取决于调用函数的方式。  

为了在任何情况下准确无误的确定this值，有必要理解和记住这重要的一点。正是调用函数的方式影响了调用的上下文中的this值，没有别的什么（我们可以在一些文章，甚至是在关于javascript的书籍中看到，它们声称：“this值取决于函数如何定义，如果它是全局函数，this设置为全局对象，如果函数是一个对象的方法，this将总是指向这个对象。–这绝对不正确”）。继续我们的话题，可以看到，即使是正常的全局函数也会被调用方式的不同形式激活，这些不同的调用方式导致了不同的this值。



### 8.一个例子
```
var x = 10;

function foo() {
  var y = 20;

  function bar() {
    var z = 30;
    alert(x +  y + z);
  }

  bar();
}

foo(); // 60
```
对此，我们有如下的变量/活动对象，函数的的[[scope]]属性以及上下文的作用域链：

全局上下文的变量对象是：
```
globalContext.VO === Global = {
  x: 10
  foo: <reference to function>
};
```
在“foo”创建时，“foo”的[[scope]]属性是：
```
foo.[[Scope]] = [
  globalContext.VO
];
```
在“foo”激活时（进入上下文），“foo”上下文的活动对象是：
```
fooContext.AO = {
  y: 20,
  bar: <reference to function>
};
```
“foo”上下文的作用域链为：
```
fooContext.Scope = fooContext.AO + foo.[[Scope]] // i.e.:

fooContext.Scope = [
  fooContext.AO,
  globalContext.VO
];
```
内部函数“bar”创建时，其[[scope]]为：
```
bar.[[Scope]] = [
  fooContext.AO,
  globalContext.VO
];
```
在“bar”激活时，“bar”上下文的活动对象为：
```
barContext.AO = {
  z: 30
};
```
“bar”上下文的作用域链为：
```
barContext.Scope = barContext.AO + bar.[[Scope]] // i.e.:

barContext.Scope = [
  barContext.AO,
  fooContext.AO,
  globalContext.VO
];
```
对“x”、“y”、“z”的标识符解析如下：

- "x"
-- barContext.AO // not found
-- fooContext.AO // not found
-- globalContext.VO // found - 10

- "y"
-- barContext.AO // not found
-- fooContext.AO // found - 20

- "z"
-- barContext.AO // found - 30











  [1]: http://pic002.cnblogs.com/images/2011/349491/2011123111482169.png
  [2]: http://pic002.cnblogs.com/images/2011/349491/2011123113175418.png
  [3]: http://pic002.cnblogs.com/images/2011/349491/2011123113224058.png
