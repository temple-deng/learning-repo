# 19. Class 的基本语法

<!-- TOC -->

- [19. Class 的基本语法](#19-class-的基本语法)
  - [19.1 基本用法](#191-基本用法)
  - [19.2 静态方法](#192-静态方法)
  - [19.3 实例属性的新写法](#193-实例属性的新写法)
  - [19.4 静态属性](#194-静态属性)
  - [19.5 `new.target`](#195-newtarget)

<!-- /TOC -->

## 19.1 基本用法

```javascript
class Point {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    toString(){
        return '(' + this.x + ',' + this.y + ')';
    }
}
```  

上面代码定义了一个“类”，可以看到里面有一个constructor方法，这就是构造方法，而this关键字则代表
实例对象。也就是说，ES5的构造函数Point，对应ES6的Point类的构造方法。  

类的内部所有定义的方法，都是不可枚举的.这一点与ES5的行为不一致。  

一个类必须有constructor方法，如果没有显式定义，一个空的constructor方法会被默认添加。   

constructor方法默认返回实例对象（即this），完全可以指定返回另外一个对象。  

类的构造函数，不使用new是没法调用的，会报错。这是它跟普通构造函数的一个主要区别，后者不用new也可以执行。   

与ES5一样，实例的属性除非显式定义在其本身（即定义在this对象上），否则都是定义在原型上（即定义在class上）。  


Class不存在变量提升（hoist），这一点与ES5完全不同。  

```javascript
//大多数浏览器的ES5实现之中，每一个对象都有__proto__属性，指向对应的构造函数的prototype属性。
function Foo(){};
var foo = new Foo();
Foo.prototype.constructor === foo.__proto__.constructor //true
```  

与函数一样，类也可以使用表达式的形式定义：   

```js
const MyClass = class Me {
  getClassName() {
    return Me.name;
  }
}
```    

如果类的内部没有用的话，可以省略 `Me`，也就是可以写成下面的形式：    

```js
const MyClass = class { /*....*/ };
```     

采用 Class 表达式，可以写出立即执行的 Class:    

```js
let person = new class {
  constructor(name) {
    this.name = name;
  }

  sayName() {
    console.log(this.name);
  }
}('张三');
```    

## 19.2 静态方法

如果在一个方法前，加上 `static` 关键字，就表示该方法不会被实例继承，而是直接通过类来调用，这就
被称为静态方法：    

```js
class Foo {
  static classMethod() {
    return 'hello';
  }
}

Foo.classMethod();   // 'hello'

var foo = new Foo();
foo.classMethod();    // TypeError: foo.classMethod is not a function
```     

注意，如果静态方法包含 `this` 关键字，这个 `this` 指的是类，而不是实例：    

```js
class Foo {
  static bar() {
    this.baz();
  }

  static baz() {
    console.log('hello');
  }

  baz() {
    console.log('world')
  }
}

Foo.bar();   // hello
```     

父类的静态方法，可以被子类继承：    


```js
class Foo {
  static classMethod() {
    return 'hello';
  }
}

class Bar extends Foo {
}

Bar.classMethod();   // hello
```     

## 19.3 实例属性的新写法

实例属性除了定义在 `constructor()` 方法里面的 `this` 上面，也可以定义在类的最顶层：    

```js
class Foo {
  bar = 'hello';
  baz = 'world';

  constructor() {

  }
}
```     

这种新写法的好处是，所有实例对象自身的属性都定义在类的头部，看上去比较整齐，一眼就能看出这个类有
哪些实例属性。    

## 19.4 静态属性

```js
class MyClass {
  static myStaticProp = 42;

  constructor() {
    console.log(MyClass.myStaticProp);
  }
}
```    

## 19.5 `new.target`

`new` 是从构造函数生成实例的命令。ES6为`new` 命令引入了一个`new.target`属性，（在构造函数中）返回 `new` 命令作用于的那个构造函数。如果构造函数不是通过`new` 命令或 `Reflect.construct()` 调用的，
`new.target` 会返回`undefined`，因此这个属性可以用来确定构造函数是怎么调用的。  
