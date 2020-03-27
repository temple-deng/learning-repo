# 设计模式

<!-- TOC -->

- [设计模式](#设计模式)
- [第一部分 基础知识](#第一部分-基础知识)
- [第 1 章 面向对象的 JS](#第-1-章-面向对象的-js)
  - [1.1 多态](#11-多态)
    - [1.1.1 JS 的多态](#111-js-的多态)
    - [1.1.2 多态在面向对象程序设计中的作用](#112-多态在面向对象程序设计中的作用)
  - [1.2 封装](#12-封装)
  - [1.3 原型模式和基于原型继承的 JS 对象系统](#13-原型模式和基于原型继承的-js-对象系统)
    - [1.3.1 使用克隆的原型模式](#131-使用克隆的原型模式)
    - [1.3.2 体验 Io 语言](#132-体验-io-语言)
- [第 3 章 闭包和高阶函数](#第-3-章-闭包和高阶函数)
  - [3.1 高阶函数](#31-高阶函数)
    - [3.1.1 高阶函数实现 AOP](#311-高阶函数实现-aop)
    - [3.1.2 高阶函数的其他应用](#312-高阶函数的其他应用)
- [第二部分 设计模式](#第二部分-设计模式)
- [第 4 章 单例模式](#第-4-章-单例模式)
  - [4.1 实现单例模式](#41-实现单例模式)
  - [4.2 透明的单例模式](#42-透明的单例模式)
  - [4.3 JS 中的单例模式](#43-js-中的单例模式)
- [第 5 章 策略模式](#第-5-章-策略模式)
  - [5.2 JS 版本的策略模式](#52-js-版本的策略模式)
- [第 6 章 代理模式](#第-6-章-代理模式)
  - [6.1 代理和本体接口的一致性](#61-代理和本体接口的一致性)
- [第 7 章 迭代器模式](#第-7-章-迭代器模式)
  - [7.1 内部迭代器和外部迭代器](#71-内部迭代器和外部迭代器)
- [第 8 章 发布-订阅模式](#第-8-章-发布-订阅模式)
  - [8.1 发布——订阅模式的通用实现](#81-发布订阅模式的通用实现)
- [第 9 章 命令模式](#第-9-章-命令模式)
  - [9.3 JS 中的命令模式](#93-js-中的命令模式)
  - [9.4 撤销命令](#94-撤销命令)
  - [9.5 撤销和重做](#95-撤销和重做)
- [第 10 章 组合模式](#第-10-章-组合模式)
- [第 11 章 模板方法模式](#第-11-章-模板方法模式)
  - [11.1 第一个例子：Coffee or Tea](#111-第一个例子coffee-or-tea)
    - [11.1.1 创建 Coffee 子类和 Tea 子类](#1111-创建-coffee-子类和-tea-子类)
  - [11.2 抽象类](#112-抽象类)
- [第 12 章 享元模式](#第-12-章-享元模式)
- [第 13 章 职责链模式](#第-13-章-职责链模式)
- [第 14 章 中介者模式](#第-14-章-中介者模式)
- [第 15 章 装饰者模式](#第-15-章-装饰者模式)
  - [15.1 装饰者模式和代理模式](#151-装饰者模式和代理模式)
- [第 16 章 状态模式](#第-16-章-状态模式)
- [第 17 章 适配器模式](#第-17-章-适配器模式)

<!-- /TOC -->

# 第一部分 基础知识

# 第 1 章 面向对象的 JS

## 1.1 多态

多态的实际含义是：同一操作作用于不同的对象上时，可以产生不同的解释和不同的执行结果。换句话
说，给不同的对象发送同一个消息的时候，这些对象会根据这个消息分别给出不同的反馈。  

多态背后的思想是将“做什么”和“谁去做以及怎样去做”分离开来，也就是将“不变的事物”和“可能改变
的事物”分离开来。把不变的部分隔离出来，把可变的部分封装起来，这给予了我们扩展程序的能力，程序
看起来是可生长的，也是符合开发-封闭原则的，相对于修改代码来说，仅仅增加代码就能完成同样的功能，
这显然要优雅和安全的多。  

```js
const makeSound = function (animal) {
    animal.sound();
};

const Duck = function() {};
Duck.prototype.sound = function () { console.log('嘎嘎嘎'); };

const Chicken = function () {};
Chicken.prototype.sound = function () { console.log('咯咯咯'); };

makeSound(new Duck());
makeSound(new Chicken());
```    

多态性实际上指的是对象的多态性。    

### 1.1.1 JS 的多态

多态的思想实际上是把“做什么”和“谁去做”分离开来，要实现这一点，归根结底先要消除类型之间的耦合关系。
如果类型之间的耦合关系没有被消除，那么我们在 makeSound 方法中指定了发出叫声的对象是某个类型，
它就不能再被替换为另外一个类型。    

而 JS 的变量类型在运行期是可变的。一个 JS 对象，既可以表示 Duck 类型的对象，又可以表示 Chicken
类型的对象，这意味着 JS 对象的多态性是与生俱来的。   

### 1.1.2 多态在面向对象程序设计中的作用

多态最根本的好处在于，你不必再向对象询问“你是什么类型”而后根据得到的答案调用对象的某个行为——你只管
调用该行为就是了，其他的一切多态机制都会为你安排妥当。    

多态最根本的作用就是通过把过程化的条件分支语句转化为对象的多态性，从而消除这些条件分支语句。  

```JavaScript
var googleMap = {
  show: function() {
    console.log('show googleMap');
  }
};

var baiduMap = {
  show: function() {
    console.log('show baiduMap');
  }
};

var renderMap = function(map) {
  map.show();
}
```  

## 1.2 封装

封装的目的是将信息隐藏。一般而言，我们讨论的封装是封装数据和封装实现。这一节将讨论更广义的封装，
不仅包括封装数据和封装实现，还包括封装类型和封装变化。     

## 1.3 原型模式和基于原型继承的 JS 对象系统

### 1.3.1 使用克隆的原型模式

从设计模式的角度讲，原型模式是用于创建对象的一种模式，如果我们想要创建一个对象，一种方法是先指定
它的类型，然后通过类来创建这个对象。原型模式选择了另外一种方式，我们不再关心对象的具体类型，而是
找到一个对象，然后通过克隆来创建一个一模一样的对象。    

原型模式的实现关键，是语言本身是否提供了 clone 方法，ES5 提供了 `Object.create()` 方法，可以
用来克隆对象。在不支持 `Object.create()` 方法的浏览器中，则可以使用以下代码：    

```js
Object.create = Object.create || function (obj) {
    var F = function () {};
    F.prototype = obj;
    return new F();
};
```     

### 1.3.2 体验 Io 语言

原型模式不仅仅是一种设计模式，也是一种编程范型。 JS 就是使用原型模式来搭建整个面向对象系统的。在
JS 语言中不存在类的概念，对象也并非从类中创建出来的，所有的 JS 对象都是从某个对象上克隆而来的。    

如果 A 对象是从 B 对象克隆而来的，那么 B 对象就是 A 对象的原型。   

最后整理一下本节的描述，我们可以发现原型编程范型至少包括以下基本原则：   

- 所有的数据都是对象
- 要得到一个对象，不是通过实例化类，而是找一个对象作为原型并克隆它
- 对象会记住它的原型
- 如果对象无法响应某个请求，它会把这个请求委托给它自己的原型    

JS 中的根对象是 `Object.prototype` 对象，我们在 JS 中遇到的每个对象，实际上都是从 `Object.prototype`
对象克隆而来的，`Object.prototype` 就是它们的原型。   

# 第 3 章 闭包和高阶函数

## 3.1 高阶函数

### 3.1.1 高阶函数实现 AOP

AOP（面向切面编程）的主要作用是把一些跟核心业务逻辑模块无关的功能抽离出来，这些跟业务逻辑无关的
功能通常包括日志统计、安全控制、异常处理等。把这些功能抽离出来之后，再通过“动态织入”的方式掺入
业务逻辑模块中。这样做的好处首先是可以保持业务逻辑模块的纯净和高内聚性，其次是可以很方便地复用
日志统计等功能模块。    

在 JAVA 中，可以通过反射和动态代理机制来实现 AOP 技术。而在 JS 中，AOP 的实现更加简单，这是
JS 与生俱来的能力。   

通常，在 JS 中实现 AOP，都是指把一个函数“动态织入”到另一个函数之中，具体的实现技术有很多，本节
我们通过扩展 Function.prototype 来做到这一点。代码如下：    

```js
Function.prototype.before = function (beforefn) {
    var __self = this;
    return function () {
        beforefn.apply(this, arguments);
        return __self.apply(this, arguments);
    }
};

Function.prototype.after = function (afterfn) {
    var __self = this;
    return function () {
        var ret = __self.apply(this, arguments);
        afterfn.apply(this, arguments);
        return ret;
    }
};

var func = function () {
    console.log(2);
};

func = func.before(function () {
  console.log(1);
}).after(function () {
  console.log(3);
});

func();
```   

### 3.1.2 高阶函数的其他应用

柯里化又称部分求值，一个柯里化的函数首先会接受一些参数，1接受了这些函数之后，该函数并不会立即求值，
而是继续返回另一个函数，刚才传入的参数在函数形成的闭包中被保存起来，待到函数被真正需要求值的时候，
之前传入的所有参数会被一次性用于求值。    

# 第二部分 设计模式

# 第 4 章 单例模式

单例模式的定义是：保证一个类仅有一个实例，并提供一个访问它的全局访问点。  

## 4.1 实现单例模式

要实现一个标准的单例模式无非是用一个变量来标志当前是否已经为某个类创建过对象，如果是，则在
下一次获取该类的实例时，直接返回之前创建的对象。典型的可以用闭包来保存这个变量。  

```js
var Singleton = function (name) {
  this.name;
};

Singleton.prototype.getName = function () {
  console.log(this.name);
};

Singleton.getInstance = function (name) {
  if (!this.instance) {
    this.instance = new Singleton(name);
  }
  return this.instance;
}
```     

我们可以通过 Singleton.getInstance 来获取 Singleton 类的唯一对象，这种方式相对简单，但有一个
问题，就是增加了这个类的“不透明性”，Single 类的使用者必须知道这是一个单例类，跟以往通过 new XXX
的方式来获取对象不同，这里偏要使用 `Singleton.getInstance` 来获取对象。   

## 4.2 透明的单例模式

我们现在的目标是实现一个“透明”的单例类，用户从这个类中创建对象的时候，可以像使用其他任何普通类
一样：    

```javascript
var CreateDiv = (function() {
  var instance;

  var CreateDiv = function( html ) {
    if(instance) {
      return instance;
    }

    this.html = html;
    this.init();

    return instance = this;
  }

  return CreateDiv;
})();
```  

上面的代码中， createDiv 的构造函数实际上负责了两件事情：创建对象并执行初始化，保证只有
一个对象。不符合“单一职责原则”。下面是用代理实现单例模式：  

```javascript
var createDiv = function( html ) {
  this.html = html;
  this.init();
}

// 引入代理类

var ProxySingletonCreateDiv = (function(){
  var instance;

  return function( html ) {
    if(!instance) {
      instance = new CreateDiv( html );
    }

    return instance;
  }
})();
```  

## 4.3 JS 中的单例模式

前面提到的几种单例模式的实现，更多的是接近传统面向对象语言中的实现，单例对象从“类”中创建而来。在
以类为中心的语言中，这是很自然的做法，比如在 Java 中，如果需要某个对象，就必须先定义一个类，对象
总是从类中创建而来的。    

但 JS 其实是一门无类语言，也正因为如此，生搬单例模式的概念并无意义。在 JS 中创建对象的方法非常
简单，既然我只需要一个“唯一”的对象，为什么要为它先创建一个“类”呢？这无异于穿棉衣洗澡，传统的
单例模式实现在 JS 中并不适用。      

单例模式的核心是**确保只有一个实例，并提供全局访问**。    

# 第 5 章 策略模式

策略模式的定义是：**定义一系列算法，把它们一个个封装起来，并且使它们可以相互替换**。   

一个基于策略模式的程序至少由两部分组成。第一个部分是一组策略类，策略类封装了具体的算法，并负责具体
的计算过程，并负责具体的计算过程。第二个部分是环境类 Context，Context 接受客户的请求，随后把
请求委托给某一个策略类。要做到这点，说明 Context 中要维持对某个策略对象的引用。   

## 5.2 JS 版本的策略模式

```js
var strategies = {
  S: function (salary) {
    return salary * 4;
  },
  A: function (salary) {
    return salary * 3;
  },
  B: function (salary) {
    return salary * 2;
  }
};

var calculateBonus = function (level, salary) {
  return strategies[level](salary);
};
```    

# 第 6 章 代理模式

## 6.1 代理和本体接口的一致性

上一节说到，如果有一天我们不再需要预加载，那么久不再需要代理对象，可以选择直接请求本体。其中关键
是代理对象和本体都对外提供了 setSrc 方法，在客户看来，代理对象和本体是一致的，代理接手请求的过程
对于用户来说是透明的，用户并不清楚代理和本体的区别。    


# 第 7 章 迭代器模式

迭代器模式是指提供一种方法顺序访问一个聚合对象中的各个元素，而又不需要暴露改对象的内部表示。迭代器
模式可以把迭代的过程从业务逻辑中分离出来，在使用迭代器模式之后，即使不关系对象的的内部构造，也可以
按顺序访问其中的每个元素。    

## 7.1 内部迭代器和外部迭代器

```js
function each(arr, callback) {
  for (let i = 0; i < arr[i]; i++) {
    callback.call(arr[i], arr[i], i, arr);
  }
}
```    

我们刚刚编写的 `each` 函数属于内部迭代器，each 函数内部已经定义好了迭代规则，它完全接手整个迭代
过程，外部只需要一次初始调用。    

内部迭代器在调用的时候非常方便，外界不用关系迭代器内部的实现，跟迭代器的交互也仅仅是一次初始调用，
但这也刚好是内部迭代器的缺点。    

外部迭代器必须显示地请求迭代下一个元素。    

外部迭代器增加了一些调用的复杂度，但相对也增强了迭代器的灵活性，我们可以手工控制迭代的过程或者
顺序。    

```js
var Iterator = function (obj) {
  var current = 0;

  var next = function () {
    current++;
  }

  var isDone = function () {
    return current >= obj.length;
  }

  var getCurrentItem = function () {
    if (isDone()) {
      return;
    } else {
      return obj[current];
    }
  }
};
```     

# 第 8 章 发布-订阅模式

## 8.1 发布——订阅模式的通用实现

```js
var publisher = {
    subscribers: {},
    subscribe: function (key, fn) {
      if (!this.subscribers[key]) {
        this.subscribers[key] = [];
      }
      this.subscribers[key].push(fn);
      return this;
    },
    publish: function(key, msg) {
      const subscribers = this.subscribers[key];
      if (!subscribers || subscribers.length === 0) {
        return this;
      }

      for (let i = 0; i < subscribers.length; i++) {
        subscribers[i].call(this, msg);
      }
      return this;
    },
    unsubscribe(key, fn) {
      if (key && key in this.subscribers) {
        if (fn) {
          for (let i = 0; i < this.subscribers[key].length; i++) {
            if (this.subscribers[key][i] === fn) {
              this.subscribers[key].splice(i, 1);
            }
          }
        } else {
          this.subscribers[key] = [];
        }
      } else {
        this.subscribers = {};
      }
    }
};
```     
# 第 9 章 命令模式

## 9.3 JS 中的命令模式

命令模式的由来，其实是回调函数的一个面向对象的替代品。   

JS 作为将函数作为一等对象的语言，跟策略模式一样，命令模式也早已融入到了 JS 语言之中。运算块不一定
要封装在 `command.execute` 方法中，也可以封装在普通函数中。函数作为一等对象，本身就可以四处
传递。即使我们依然需要请求“接收者”，那也未必适用面向对象的方式，闭包可以完成同样的功能。    

## 9.4 撤销命令

撤销操作的实现一般是给命令对象增加一个名为 unexecute 或者 undo 的方法，在该方法里执行 execute
的反向操作。在 command.execute 方法让小球开始真正运动之前，我们需要先记录下小球的当前位置，在
unexecute 或者 undo 操作中，再让小球回到刚刚记录下的位置。    

## 9.5 撤销和重做

然而，在某些情况下无法顺利地利用 undo 操作让对象回到 exectue 之前的状态，比如在一个 Canvas
画图程序中，画布上有一些点，我们在这些点之间画了 N 条曲线把这些点相互连接起来，当然这是用命令模式
来实现的。但是我们却很难为这里的命令对象定义一个擦除某条曲线的undo操作。    

这时最好的办法是先清除画布，然后把刚才执行过的命令全部重新执行一遍，这一点同样可以利用一个历史列表
栈办到。记录命令日志，然后重复执行它们，这是逆转不可逆命令的一个好办法。     

# 第 10 章 组合模式

略。    

# 第 11 章 模板方法模式

模板方法模式是一种只需使用继承就可以实现的非常简单的模式。    

模板方法模式由两部分结构组成，第一部分是抽象父类，第二部分是具体的实现子类。通常在抽象父类封装了
子类的算法框架，包括实现一些公共方法以及封装子类中所有方法的执行顺序。子类通过继承这个抽象类，也
继承了整个算法结构，并且可以选择重写父类的方法。    

## 11.1 第一个例子：Coffee or Tea

让我们忘记最开始创建的 Coffee 类和 Tea 类。现在可以创建一个抽象父类来表示泡一杯饮料的整个过程。
不论是 Coffee，还是 Tea，都被我们用 Beverage 来表示：    

```js
var Beverage = function () {};

Beverage.prototype.boilWater = function () {
  console.log('把水煮沸');
};

Beverage.prototype.brew = function () {};  // 空方法，应该由子类重写

Beverage.prototype.pourInCup = function () {};     // 空方法，应该由子类重写

Beverage.prototype.addCondiments = function() {};    // 空方法，应该由子类重写

Beverage.prototype.init = function () {
  this.boilWater();
  this.brew();
  this.pourInCup();
  this.addCondiments();
};
```    

### 11.1.1 创建 Coffee 子类和 Tea 子类

```js
var Coffee = function () {};

Coffee.prototype = new Beverage();

Coffee.prototype.brew = function () {
  console.log('用沸水冲泡咖啡');
};

Coffee.prototype.pourInCup = function () {
  console.log('把咖啡倒进杯子');
};

Coffee.prototype.addCondiments = function () {
  console.log('加糖和牛奶');
};

var coffee = new Coffee();
coffee = new Coffee();
```    

本章一直讨论的是模板方法模式，那么在上面的例子中，到底谁才是所谓的模板方法呢？答案是
`Beverage.prototype.init`。    

`Beverage.prototype.init` 被称为模板方法的原因是，该方法中封装了子类的算法框架，它作为一个算法
的模板，指导子类以何种顺序去执行哪些方法。在 `Beverage.prototype.init` 方法中，算法内的每一个
步骤都清楚地展示在我们眼前。    

## 11.2 抽象类

模板方法模式是一种严重依赖抽象类的设计模式。     

# 第 12 章 享元模式

略。   

# 第 13 章 职责链模式

略。   

# 第 14 章 中介者模式    

略。    

# 第 15 章 装饰者模式

装饰者模式可以动态地给某个对象添加一些额外的职责，而不会影响从这个类中派生的其他对象。    

在传统的面向对象语言中，给对象添加功能常常使用继承的方式，但是继承的方式并不灵活，还会带来许多问题：
一方面会导致超类和子类之间存在强耦合性，当超类改变时，子类也会随之改变；另一方面，继承这种功能
复用方式通常称为“白箱复用”，“白箱”是相对可见性而言的，在继承方式中，超类的内部细节是对子类可见的，
继承常常被认为破坏了封装性。    

装饰者模式能够在不改变对象自身的基础上，在程序运行期间给对象更轻便灵活的做法。    

首先要提出来的是，作为一门解释执行的语言，给 JS 中的对象动态添加或者改变职责是一件再简单不过的
事情。    

## 15.1 装饰者模式和代理模式

这两种模式都描述了怎样为对象提供一定程度上的简介引用，它们的实现部分都保留了对另外一个对象的引用，
并且向那个对象发送请求。    

代理模式和装饰者模式最重要的区别在于它们的意图和设计目的。代理模式的目的是，当直接访问本体不方便
或者不符合需要时，为这个本体提供一个替代者。本体定义了关键功能，而代理提供或拒绝对它的访问，或者
在访问本体之前做一些额外的事情。装饰者模式的作用就是为对象动态加入行为。换句话说，代理模式强调
一种关系，这种关系可以静态的表达，也就是说，这种关系在一开始就可以被确定。而装饰者模式用于一开始
不能确定对象的全部功能。代理模式通常只有一层代理-本体的引用，而装饰者模式经常会形成一条长长的
装饰链。    

# 第 16 章 状态模式

略。   

# 第 17 章 适配器模式

略。   

