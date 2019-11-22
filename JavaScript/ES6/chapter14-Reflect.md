# 14. Reflect

<!-- TOC -->

- [14. Reflect](#14-reflect)
  - [14.1 概述](#141-概述)
  - [14.2 静态方法](#142-静态方法)

<!-- /TOC -->

## 14.1 概述

`Reflect` 对象与 `Proxy` 对象一样，也是 ES6 为了操作对象而提供的新 API。Reflect对象的设计
目的有这样几个。    

1. 将 `Object` 对象的一些明显属于语言内部的方法，放到 `Reflect` 对象上。
2. 修改某些 `Object` 方法的返回结果，让其变得更合理。比如，`Object.defineProperty(obj, name, desc)`
在无法定义属性时，会抛出一个错误，而 `Reflect.defineProperty(obj, name, desc)` 则会返回
`false`
3. 让 `Object` 操作都变成函数行为。某些 `Object` 操作是命令式，比如 `name in obj` 和
`delete obj[name]`，而 `Reflect.has(obj, name)` 和 `Reflect.deleteProperty(obj, name)`
让它们变成了函数行为。
4. `Reflect` 对象的方法与 `Proxy` 对象的方法一一对应，只要是 `Proxy` 对象的方法，就能在
`Reflect` 对象上找到对应的方法。这就让 `Proxy` 对象可以方便地调用对应的 `Reflect`方法，
完成默认行为，作为修改行为的基础。也就是说，不管Proxy怎么修改默认行为，你总可以在Reflect上获取默认行为。   

## 14.2 静态方法

1. `Reflect.get(target, name, receiver)`    

查找并返回 `target` 对象的 `name` 属性，如果没有改属性，则返回 `undefined`。    

如果 `name` 属性部署了 getter，则 getter 中的 `this` 绑定 `receiver`。   

```js
var myObject = {
  foo: 1,
  bar: 2,
  get baz() {
    return this.foo + this.bar;
  }
};

var myReceiverObj = {
  foo: 4,
  bar: 4
};

Reflect.get(myObject, 'baz', myReceiverObj);   // 8
```     

如果第一个参数不是对象，`Reflect.get` 方法会报错。     

2. `Reflect.set(target, name, value, receiver)`    

如果 `name` 属性设置了 setter，则 setter 中的 `this` 绑定 receiver。    

```js
var myObj = {
  foo: 4,
  set bar(val) {
    return this.foo = val;
  }
};

var myReceiverObj = {
  foo: 0
};

Reflect.set(myObj, 'bar', 1, myReceiverObj);
myObj.foo;   // 4
myReceiverObj.foo;    // 1
```    

如果第一个参数不是对象，`Reflect.set` 会报错。     

3. `Reflect.has(obj, name)`     

`Reflect.has` 方法对应 `name in obj` 里面的 `in` 运算符。    

如果 `Reflect.has()` 方法的第一个参数不是对象，会报错。    

4. `Reflect.deleteProperty(obj, name)`

该方法返回一个布尔值，如果删除成功，或者被删除的属性不存在，返回 `true`；删除失败，被删除的属性
依然存在，返回 `false`。    

如果第一个参数不是对象，报错。    

5. `Reflect.construct(target, args)`     

`Reflect.construct` 方法等同于 `new target(...args)`，这提供了一种不使用 `new` 
来调用构造函数的方法。    

```js
function Greeting(name) {
  this.name = name;
}

// new 的写法
const instance = new Greeting('张三');

// Reflect.construct 的写法
const instance = Reflect.construct(Greeting, ['张三']);
```    

如果 `Reflect.construct` 方法的第一个参数不是函数，会报错。    

6. `Reflect.getPrototypeOf(obj)`    

`Reflect.getPrototypeOf` 和 `Object.getPrototypeOf` 的一个区别是，如果参数不是对象，
`Object.getPrototypeOf` 会将这个参数转为对象，然后再运行，而 `Reflect.getPrototypeOf`
会报错。    

7. `Reflect.setPrototypeOf(obj, newProto)`     

返回一个布尔值，表示是否设置成功。如果无法设置目标对象的原型（比如，目标对象禁止扩展），返回 `false`。    

如果第一个参数不是对象，`Object.setPrototypeOf` 会返回第一个参数本身，而
`Reflect.setPrototypeOf` 会报错。    

如果第一个参数是 `undefined` 或 `null`，`Object.setPrototypeOf` 和 `Reflect.setPrototypeOf`
都会报错。      

8. `Reflect.apply(func, thisArg, args)`

`Reflect.apply` 方法等同于 `Function.prototype.apply.call(func, thisArg, args)`，
用于绑定 `this` 对象后执行给定函数。    

9. `Reflect.defineProperty(target, propKey, attributes)`    

如果第一个参数不是对象，就会抛出错误。   

10. `Reflect.getOwnPropertyDescriptor(target, propKey)`    

如果第一个参数不是对象，就会抛出错误。   

11. `Reflect.isExtensible(target)`

返回一个布尔值，表示当前对象是否可扩展。如果参数不是对象，会报错。    

12. `Reflect.preventExtensions(target)`    

用于让对象变为不可扩展，返回一个布尔值，表示是否操作成功。参数不是对象报错。    

13. `Reflect.ownKeys(target)`

参数不是对象报错。    
