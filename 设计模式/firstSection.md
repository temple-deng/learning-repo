# 基础知识

Tags: 原型，单例

## 1. 面向对象的 JavaScript

### 1.1 多态

多态的实际含义是：同一操作作用于不同的对象上时，可以产生不同的解释和不同的执行结果。换句话
说，给不同的对象发送同一个消息的时候，这些对象会根据这个消息分别给出不同的反馈。  

多态背后的思想是将“做什么”和“谁去做以及怎样去做”分离开来，也就是将“不变的事物”和“可能改变
的事物”分离开来。把不变的部分隔离出来，把可变的部分封装起来。  

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

# 设计模式

## 1. 原型模式，单例模式

原型模式没什么好说的，就是用克隆对象的方向创建一个对象，JS本来也是基于原型继承的。  

单例模式的定义是：保证一个类仅有一个实例，并提供一个访问它的全局访问点。  

当然这里可以不仅仅限于在类的实例的控制上，还可以用来比如说窗口弹窗等在页面上只存在一个。  

要实现一个标准的单例模式无非是用一个变量来标志当前是否已经为某个类创建过对象，如果是，则在
下一次获取该类的实例时，直接返回之前创建的对象。典型的可以用闭包来保存这个变量。  

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

## 2. 策略模式
