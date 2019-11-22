# 16. Iterator和 for...of循环

<!-- TOC -->

- [16. Iterator和 for...of循环](#16-iterator和-forof循环)
  - [16.1 Iterator（遍历器）的概念](#161-iterator遍历器的概念)
  - [16.2 默认的 Iterator 接口](#162-默认的-iterator-接口)
  - [16.3 Iterator的应用场合](#163-iterator的应用场合)
  - [16.4 return() 和 throw() 方法](#164-return-和-throw-方法)

<!-- /TOC -->

## 16.1 Iterator（遍历器）的概念

Iterator的遍历过程是这样的：

1. 创建一个指针对象，指向当前数据结构的起始位置。也就是说，遍历器对象本质上，就是一个指针对象。  

2. 第一次调用指针对象的next方法，可以将指针指向数据结构的第一个成员。  

3. 第二次调用指针对象的next方法，指针就指向数据结构的第二个成员。  

4. 不断调用指针对象的next方法，直到它指向数据结构的结束位置。  

每一次调用next方法，都会返回数据结构的当前成员的信息。具体来说，就是返回一个包含value和done两个属性的对象。其中，value属性是当前成员的值，done属性是一个布尔值，表示遍历是否结束。  

默认的Iterator接口部署在数据结构的Symbol.iterator属性，或者说，一个数据结构只要具有Symbol.iterator属性，就可以认为是“可遍历的”（iterable）。调用Symbol.iterator方法，就会得到当前数据结构默认的遍历器生成函数。Symbol.iterator本身是一个表达式，返回Symbol对象的iterator属性，这是一个预定义好的、类型为Symbol的特殊值，所以要放在方括号内（请参考Symbol一章）。  

在ES6中，有三类数据结构原生具备Iterator接口：数组、某些类似数组的对象、Set和Map结构。  

```javascript
var s = "hello";
var iter = s[Symbol.iterator]();
iter.next();
//Object {value:'h', done:false}
function foo(a,b,c) {
    var iter = arguments[Symbol.iterator]();
    console.log(iter.next());
    }
foo(1,2,3);
//Object {value: 1, done:false};
```

## 16.2 默认的 Iterator 接口

Iterator 接口的目的，就是为所有数据结构，提供了一种统一的访问机制，即 `for...of` 循环。当所有
`for...of` 循环遍历某种数据结构时，该循环会自动去寻找 Iterator 接口。   

ES6 规定，默认的 Iterator 接口部署在数据结构的 `Symbol.iterator` 属性，或者说，一个数据结构
只要具有 `Symbol.iterator` 属性，就可以认为是“可遍历的”。`Symbol.iterator` 属性本身是一个
函数，就是当前数据结构默认的遍历器生成函数。执行这个函数，就会返回一个遍历器。    

原生具备 Iterator 接口的数据结构如下：    

- Array
- Map
- Set
- String
- TypedArray
- arguments 对象
- NodeList 对象

一个对象如果要具备可被 `for...of` 循环调用的 Iterator 接口，就必须在 `Symbol.iterator`
属性上部署遍历器生成方法。     

对于类数组对象，部署 Iterator 接口，有一个简便方法，就是 `Symbol.iterator` 方法直接引用
数组的 Iterator 接口。    

```js
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
// 或者
NodeList.prototype[Symbol.iterator] = [][Symbol.iterator];

[...document.querySelectorAll('div')] // 可以执行了
```    


## 16.3 Iterator的应用场合

+ 解构赋值：对数组和Set结构进行解构赋值时，会默认调用Symbol.iterator方法。
+ 扩展运算符
+ yield*：yield*后面跟的是一个可遍历的结构，它会调用该结构的遍历器接口。
+ 其他场合：for...of, Array.from(), Promise.all(), Promise.race()


## 16.4 return() 和 throw() 方法

return() 方法的一种使用场合是，如果 `for...of` 循环提前退出，就会调用 return 方法，且这个
方法必须返回一个对象。

throw() 方法主要是 Generator 函数返回的迭代器用来在函数外抛出异常。  

