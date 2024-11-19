# 9. 对象的扩展

<!-- TOC -->

- [9. 对象的扩展](#9-对象的扩展)
  - [9.1 属性的简介表示法](#91-属性的简介表示法)
  - [9.2 属性的遍历和可枚举性](#92-属性的遍历和可枚举性)
  - [9.3 super 关键字](#93-super-关键字)
  - [9.3 对象的扩展运算符](#93-对象的扩展运算符)

<!-- /TOC -->

## 9.1 属性的简介表示法

ES6 允许直接写入变量和函数，作为对象的属性和方法：   

```js
const foo = 'bar';
const baz = { foo };
baz;   // { foo: 'bar' }
```    

如果某个方法的值是一个 Generator 函数，前面需要加上星号：    

```js
const obj = {
    * m() {
        yield 'hello world';
    }
}
```    

## 9.2 属性的遍历和可枚举性

ES6 中一共有 5 种方法可以遍历对象的属性：    

1. `for...in`: 遍历对象的可枚举属性（包括继承的属性）
2. `Object.keys()`: 遍历对象自有可枚举属性
3. `Object.getOwnPropertyNames(obj)`: 遍历对象自有属性
4. `Object.getOwnPropertySymbols(obj)`: 遍历对象自有 Symbol 属性
5. `Reflect.ownKeys(obj)`: 包含对自身所有键名，包含 Symbol。     

以上的 5 种方法变量对象的键名，都遵守同样的属性遍历和次序规则：    

1. 首先遍历所有数值键，按照数值升序排列
2. 其次遍历所有字符串键，按照加入时间升序排列
3. 最后遍历所有 Symbol 键，按照加入时间升序排列

## 9.3 super 关键字

ES6 新增了一个关键字 `super`，指向当前对象的原型对象。    

```js
const proto = {
    foo: 'hello'
};

const obj = {
    foo: 'world',
    find() {
        return super.foo;
    }
};

Object.setPrototypeOf(obj, proto);
obj.find();  // "hello"
```     

注意，`super` 关键字表示原型对象时，只能用在对象的方法之中，用在其他地方都会报错。    

```js
// 报错
const obj = {
    foo: super.foo
};

// 报错
const obj = {
    foo: () => super.foo
};

// 报错
const obj = {
    foo: function () {
        return super.foo;
    }
};
```     

上面三种 `super` 用法都会报错，因为对于 JS 引擎来说，这里的 `super` 都没有用在对象的方法之中。
第一种写法是 `super` 用在属性里面，第二种和第三种写法是 `super` 用在一个函数里面，然后赋值给
`foo` 属性。目前，只有对象方法的简写法可以让 JS 引擎确认，定义的是对象的方法。    

## 9.3 对象的扩展运算符

如果扩展运算符后面是一个空对象，则没有任何效果：    

```js
// 竟然不报错
{...{}, a: 1}
// { a: 1}
```     

如果扩展运算符后面不是对象，则会自动将其转为对象：    

```js
// 等同于 {...Object{1}}
{...1}  // {}
```     

下面的例子都是类似的道理：    

```js
{...true} // {}
// 等同于 {...Object(true)}

{...undefined}  // {}
// 等同于 {...Object(undefined)}   这个竟然也没报错

{...null}   // {}
// 等同于 {...Object(null)}
```     