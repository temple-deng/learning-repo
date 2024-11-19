# 20. Class 的继承

<!-- TOC -->

- [20. Class 的继承](#20-class-的继承)
  - [20.1 简介](#201-简介)
  - [20.2 Object.getPrototypeOf()](#202-objectgetprototypeof)
  - [20.3 super 关键字](#203-super-关键字)
  - [20.4 类的 prototype 属性和 `__proto__` 属性](#204-类的-prototype-属性和-__proto__-属性)

<!-- /TOC -->

## 20.1 简介

```js
class ColorPoint extends Point {
  constructor(x, y, color) {
    super(x, y);
    this.color = color;
  }

  toString() {
    return this.color + ' ' + super.toString();
  }
}
```     

子类必须在 `constructor` 方法中调用 `super` 方法，否则新建实例时会报错。这是因为子类自己的
`this` 对象，必须先通过父类的构造函数完成塑造，得到与父类同样的实例属性和方法，然后再对其进行
加工，加上子类自己的实例属性和方法。如果不调用 `super` 对象，子类就得不到 `this` 对象。   

如果子类没有定义 `constructor` 方法，这个方法会被默认添加，也就说，不管有没有显示定义，任何一个
子类都有 `constructor` 方法。    

## 20.2 Object.getPrototypeOf()

`Object.getPrototypeOf()` 方法可以用来从子类上获取父类：    

```js
Object.getProtoytypeOf(ColorPoint) === Point;
// true
```      

## 20.3 super 关键字

`super` 关键字，既可以当作函数使用，也可以当作对象使用。在这两种情况下，它的用法完全不同。    

第一种情况，`super` 作为函数调用时，代表父类的构造函数。ES6 要求，子类的构造函数必须执行一次
`super` 函数。作为函数时，`super` 只能用在子类的构造函数中，用在其他地方会报错。    

第二种情况，`super` 作为对象时，在普通方法中，指向父类的原型对象；在静态方法中，指向父类。   

## 20.4 类的 prototype 属性和 `__proto__` 属性

Class 作为构造函数的语法糖，同时有 `prototype` 属性和 `__proto__` 属性，因此同时存在两条
继承链。    

1. 子类的 `__proto__` 属性，表示构造函数的继承，总是指向父类
2. 子类的 `prototype` 属性的 `__proto__` 属性，表示方法的继承，总是指向父类的 `prototype`
属性。     




