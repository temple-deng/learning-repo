# 8. 数组的扩展

<!-- TOC -->

- [8. 数组的扩展](#8-数组的扩展)
  - [8.1 扩展运算符](#81-扩展运算符)
  - [8.2 扩展运算符的应用](#82-扩展运算符的应用)
  - [8.3 Array.from()](#83-arrayfrom)
  - [8.4 Array.of()](#84-arrayof)
  - [8.5 数组实例的copyWithin()方法](#85-数组实例的copywithin方法)
  - [8.6 数组实例的find()和findIndex()和includes()方法](#86-数组实例的find和findindex和includes方法)
  - [8.7 数组实例的fill()方法](#87-数组实例的fill方法)
  - [8.8 数组实例的entries()，keys()和values()](#88-数组实例的entrieskeys和values)
  - [8.9 flat() 和 flatMap()](#89-flat-和-flatmap)

<!-- /TOC -->

## 8.1 扩展运算符

扩展运算符就是三个点 ... ，好比rest参数的逆运算，将一个数组转换为逗号分隔的参数序列。主要用于
函数调用。  

```js
console.log(...[1,2,3]);
// 1 2 3

console.log(1, ...[2,3,4], 5);
// 1 2 3 4 5
```    

然后这个运算符究竟是在什么环境下使用呢，`...[1, 2, 3]` 是一个表达式，异或是语句。   

可以情况来看，多是用于函数调用时的传参，将数组转换成参数序列。   

然后，只有在函数调用时，扩展运算符才可以放在圆括号中，否则会报错：   

```js
(...[1,2,3])  // 报错
```    

那看这个意思一般是出现在两个场合，一个是调用时的参数，另一个就是数组大括号中了。   

## 8.2 扩展运算符的应用

+ *合并数组*  

```javascript
var arr1 = ['a', 'b'];
var arr2 = ['c'];
var arr3 = ['d', 'e'];
[...arr1, ...arr2, ...arr3];
```  

+ *扩展运算符可以与解构赋值结合起来，用于生成数组。*  

```javascript
var [a, ...rest] = [1,2,3,4];
//rest == [2,3,4]
```  

+ *扩展运算符还可以将字符串转为真正的数组。*  

```javascript
[...'hello']
// [ "h", "e", "l", "l", "o" ]
```  

上面的写法，有一个重要的好处，那就是能够正确识别32位的Unicode字符。   

+ *任何Iterator接口的对象，都可以用扩展运算符转为真正的数组。*  

```javascript
var nodeList = document.querySelectorAll('div');
var array = [...nodeList];
```  

对于那些没有部署Iterator接口的类似数组的对象，扩展运算符就无法将其转为真正的数组。但是可以用
Array.from()呀。  

## 8.3 Array.from()

这个方法用于将类数组对象和具有迭代器接口的数据结构转换为数组。类数组对象本质特点只有一个，即具有
length属性。  

```javascript
Array.from({ length: 3 });
// [ undefined, undefined, undefinded ]
```    

Array.from还可以接受第二个参数，作用类似于数组的map方法，用来对每个元素进行处理，将处理后的值
放入返回的数组。  

Array.from()的另一个应用是，将字符串转为数组，然后返回字符串的长度。因为它能正确处理各种
Unicode字符，可以避免JavaScript将大于\uFFFF的Unicode字符，算作两个字符的bug。  

底层应该是会将原始值转换为对象，因此`null` 和 `undeifined`会报错，布尔值和数字最终为空数组。

## 8.4 Array.of()

这个方法用于将一组参数转换为数组  

用Array构造函数创建数组的时候，加不加 new好像没区别。  

```javascript
Array.of() // []
Array.of(undefined) // [undefined]
Array.of(1) // [1]
Array.of(1, 2) // [1, 2]
```

## 8.5 数组实例的copyWithin()方法

该方法是将数组指定位置的元素复制到其他位置（会覆盖原位置的元素），然后返回当前数组，即修改的是
当前数组。接受三个参数:  

```javascript
Array.prototype.copyWithin(target, start=0, end=this.length)
// target(必须)  从该位置开始替换元素
// start(可选)   从该位置开始读取数据，默认为0。如果为负值，表示倒数。
// end(可选)     到该位置前停止读取数据，默认等于数组长度。如果为负值，表示倒数。
// -2相当于3号位，-1相当于4号位
[1, 2, 3, 4, 5].copyWithin(0, -2, -1)
// [4, 2, 3, 4, 5]
```  

## 8.6 数组实例的find()和findIndex()和includes()方法

find方法，用于找出第一个符合条件的数组成员。参数是一个回调函数，会针对每一个数组成员调用这个函数，
直到找出第一个返回值为true的成员，然后返回该成员，如果没找到返回undefined。    

回调函数接受三个参数，依次是值value，索引index，和原数组arr。   

findIndex方法类似于find方法，不同的是返回索引，没找到就返回-1.   

includes()方法返回布尔值，表示数组是否包含某个值。接受第二个参数用于表示搜索的起始位置，默认为0。
如果第二个参数为负数，则表示倒数的位置，如果这时它大于数组长度（比如第二个参数为-4，但数组长度为3），
则会重置为从0开始。  

可以用来搜索出NaN, 然而 +0和 -0 还是不行，认为 `0=== +0 === -0`, 传统的 indexOf使用严格
相等符，因此会出错。  


## 8.7 数组实例的fill()方法

fill方法接受指定值填充数组，接受第二个参数和第三个参数，指定填充的起始位置和结束位置。  

## 8.8 数组实例的entries()，keys()和values()

ES6提供三个新的方法——entries()，keys()和values()——用于遍历数组。它们都返回一个遍历器对象（详见《Iterator》一章），可以用for...of循环进行遍历，唯一的区别是keys()是对键名的遍历、values()是对键值的遍历，entries()是对键值对的遍历。  

```javascript
for (let index of ['a', 'b'].keys()) {
  console.log(index);
}
// 0
// 1

for (let elem of ['a', 'b'].values()) {
  console.log(elem);
}
// 'a'
// 'b'

for (let [index, elem] of ['a', 'b'].entries()) {
  console.log(index, elem);
}
// 0 "a"
// 1 "b"
```    

## 8.9 flat() 和 flatMap()

数组的成员有时还是数组，`Array.prototype.flat()` 用于将嵌套的数组“拉平”，变成一维的数组。
该方法返回一个新数组，对原数据没有影响。    

```js
[1, 2, [3, 4]].flat()
// [1, 2, 3, 4]
```     

`flat()` 默认只会“拉平”一层，如果想要“拉平”多层的嵌套数组，可以将 `flat()` 方法的参数写成
一个整数，表示想要拉平的层数，默认为1。    

```js
[1, 2, [3, [4, 5]]].flat();
// [1, 2, 3, [4, 5]]

[1, 2, [3, [4, 5]]].flat(2);
// [1, 2, 3, 4, 5]
```     

如果不管有多少层嵌套，都要转成一维数组，可以用 `Infinity` 关键字作为参数。    

```js
[1, [2, [3]]].flat(Infinity);
// [1, 2, 3]
```     

如果原数组有空位，`flat()` 方法会跳过空位。    

```js
[1, 2, , 4, 5].flat();
// [1, 2, 4, 5]
```    

`flat()` 方法对原数组的每个成员执行一个函数（相当于执行 `Array.prototype.map()`），然后对
返回值组成的数组执行 `flat()` 方法。该方法返回一个新数组，不改变原数组：    

```js
[2, 3, 4].flatMap((x) => [x, x * 2]);
// 相当于 [[2, 4], [3, 6], [4, 8]].flat()
// [2, 4, 3, 6, 4, 8]
```     

`flatMap()` 只能展开一层数组。    