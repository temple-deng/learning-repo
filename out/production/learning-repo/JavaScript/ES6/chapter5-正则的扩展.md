# 5. 正则的扩展

<!-- TOC -->

- [5. 正则的扩展](#5-正则的扩展)
  - [5.1 RegExp 构造函数](#51-regexp-构造函数)
  - [5.2 u修饰符](#52-u修饰符)
  - [5.3 RegExp.prototype.unicdoe 属性](#53-regexpprototypeunicdoe-属性)
  - [5.4 y修饰符](#54-y修饰符)
  - [5.5 RegExp.prototype.sticky 属性](#55-regexpprototypesticky-属性)
  - [5.6 RegExp.prototype.flags 属性](#56-regexpprototypeflags-属性)
  - [5.7 s 修饰符：dotAll 模式](#57-s-修饰符dotall-模式)
  - [5.8 后行断言](#58-后行断言)
  - [5.9 Unicode 属性类](#59-unicode-属性类)
  - [5.10 具名组匹配](#510-具名组匹配)
  - [5.11 matchAll](#511-matchall)

<!-- /TOC -->

## 5.1 RegExp 构造函数

在 ES5 中，`RegExp` 的构造函数的参数有两种情况，一种情况是第一个参数是字符串，第二个参数表示正则表达式的修饰符：   

```js
var regex = new RegExp('xyz', 'i');
// 等价于
var regex = /xyz/i;
```    

第二种情况是，参数是一个正则表达式，这时候如果有第二个参数就会报错：    

```js
var regex = new RegExp(/xyz/, 'i');
// Uncaught TypeError: Cannot supply flags when constructing one RegExp from another
```     

ES6 改变了这种行为。如果RegExp构造函数第一个参数是一个正则对象，那么可以使用第二个参数指定修饰
符。而且，返回的正则表达式会忽略原有的正则表达式的修饰符，只使用新指定的修饰符。    

```js
new RegExp(/abc/ig, 'i').flags
// "i"
```      

## 5.2 u修饰符

ES6 对正则表达式添加了u修饰符，含义为“Unicode 模式”，用来正确处理大于\uFFFF的 Unicode 字符。
也就是说，会正确处理四个字节的 UTF-16 编码。    

```js
/^\uD83D/u.test('\uD83D\uDC2A') // false
/^\uD83D/.test('\uD83D\uDC2A') // true
```     

一旦加上u修饰符号，就会修改下面这些正则表达式的行为。     

1. 点字符    

点在正则表达式中，含义是除了换行符以外的任意单个字符。对于码点大于 `0xFFFF` 的 Unicode 字符，
点字符不能识别，必须加上`u`修饰符。    

```js
var s = '𠮷';

/^.$/.test(s) // false
/^.$/u.test(s) // true
```    

上面代码表示，如果不添加u修饰符，正则表达式就会认为字符串为两个字符，从而匹配失败。

2. Unicode 字符表示法   

ES6 新增了使用大括号表示 Unicode 字符，这种表示法在正则表达式中必须加上u修饰符，才能识别当中的
大括号，否则会被解读为量词。    

```js
/\u{61}/.test('a') // false
/\u{61}/u.test('a') // true
/\u{20BB7}/u.test('𠮷') // true
```

3. 预定义模式   

u 修饰符也影响到预定义模式，能否正确识别码点大于 `0xFFFF` 的 Unicode。    

```js
/^\S$/.test('𠮷') // false
/^\S$/u.test('𠮷') // true
```     

上面代码的 `\S` 是预定义模式，匹配所有非空白字符。只有加了u修饰符，它才能正确匹配码点大于
`0xFFFF` 的 Unicode 字符。    

4. 转义     

没有u修饰符的情况下，正则中没有定义的转义（如逗号的转义\,）无效，而在u模式会报错。    

```js
/\,/ // /\,/
/\,/u // 报错
```     

## 5.3 RegExp.prototype.unicdoe 属性

正则实例对象新增 `unicode` 属性，表示是否设置了u修饰符。    

```js
const r1 = /hello/;
const r2 = /hello/u;

r1.unicode // false
r2.unicode // true
```     

## 5.4 y修饰符

y 修饰符，叫做“粘连”(sticky)修饰符。    

y修饰符的作用与g修饰符类似，也是全局匹配，后一次匹配都从上一次匹配成功的下一个位置开始。不同之处
在于，g修饰符只要剩余位置中存在匹配就可，而y修饰符确保匹配必须从剩余的第一个位置开始，这也就是
“粘连”的涵义。     

```js
var s = 'aaa_aa_a';
var r1 = /a+/g;
var r2 = /a+/y;

r1.exec(s)    // ["aaa"]
r2.exec(s)    // ["aaa"]

r1.exec(s)    // ["aa"]
r2.exec(s)    // null
```    

## 5.5 RegExp.prototype.sticky 属性

与y修饰符相匹配，ES6 的正则实例对象多了sticky属性，表示是否设置了y修饰符。    

## 5.6 RegExp.prototype.flags 属性

ES6 为正则表达式新增了 `flags` 属性，会返回正则表达式的修饰符。    

## 5.7 s 修饰符：dotAll 模式

正则表达式中，点（`.`）是一个特殊字符，代表任意的单个字符，但是有两个例外。一个是四个字节的
UTF-16 字符，这个可以用 `u` 修饰符解决；另一个是行终止符（line terminator character）。    

所谓行终止符，就是该字符表示一行的终结。以下四个字符属于“行终止符”。    

- U+000A 换行符
- U+000D 回车符
- U+2028 行分隔符
- U+2029 段分隔符

很多时候我们希望匹配的是任意单个字符，这时有一种变通的写法。    

```js
/foo[^]bar/.test('foo\nbar');
// true
```     

ES2018 引入s修饰符，使得.可以匹配任意单个字符。

这被称为dotAll模式，即点（dot）代表一切字符。所以，正则表达式还引入了一个dotAll属性，返回一个
布尔值，表示该正则表达式是否处在dotAll模式。    

## 5.8 后行断言

“先行断言”指的是，`x` 只有在 `y` 前面才匹配，必须写成 `/x(?=y)/`。比如，只匹配百分号之前的数字，
要写成 `/\d+(?=%)/`。“先行否定断言”指的是，`x` 只有不在 `y` 前面才匹配，必须写成 `/x(?!y)/`。
比如，只匹配不在百分号之前的数字，要写成 `/\d+(?!%)/`。    

“后行断言”正好与“先行断言”相反，`x` 只有在 `y` 后面才匹配，必须写成 `/(?<=y)x/`。比如，只
匹配美元符号之后的数字，要写成 `/(?<=\$)\d+/`。“后行否定断言”则与“先行否定断言”相反，`x`只有
不在 `y` 后面才匹配，必须写成 `/(?<!y)x/`。比如，只匹配不在美元符号后面的数字，要写成
`/(?<!\$)\d+/`。    

“后行断言”的实现，需要先匹配 `/(?<=y)x/` 的 `x`，然后再回到左边，匹配 `y` 的部分。这种
“先右后左”的执行顺序，与所有其他正则操作相反，导致了一些不符合预期的行为。    

```js
/(?<=(\d+)(\d+))$/.exec('1053') // ["", "1", "053"]
/^(\d+)(\d+)$/.exec('1053') // ["1053", "105", "3"]
```     

其次，“后行断言”的反斜杠引用，也与通常的顺序相反，必须放在对应的那个括号之前。

```js
/(?<=(o)d\1)r/.exec('hodor')  // null
/(?<=\1d(o))r/.exec('hodor')  // ["r", "o"]
```     

上面代码中，如果后行断言的反斜杠引用（\1）放在括号的后面，就不会得到匹配结果，必须放在前面才可以。
因为后行断言是先从左到右扫描，发现匹配以后再回过头，从右到左完成反斜杠引用。     

## 5.9 Unicode 属性类

ES2018 引入了一种新的类的写法 `\p{...}` 和 `\P{...}`，允许正则表达式匹配符合 Unicode 某种
属性的所有字符。     

```js
const regexGreekSymbol = /\p{Script=Greek}/u;
regexGreekSymbol.test('π') // true
```    

上面代码中，`\p{Script=Greek}` 指定匹配一个希腊文字母，所以匹配 `π` 成功。   

Unicode 属性类要指定属性名和属性值。     

```js
\p{UnicodePropertyName=UnicodePropertyValue}
```     

对于某些属性，可以只写属性名，或者只写属性值。    

```js
\p{UnicodePropertyName}
\p{UnicodePropertyValue}
```     

`\P{…}` 是 `\p{…}` 的反向匹配，即匹配不满足条件的字符。

注意，这两种类只对 Unicode 有效，所以使用的时候一定要加上 `u` 修饰符。如果不加 `u` 修饰符，
正则表达式使用 `\p` 和 `\P` 会报错，ECMAScript 预留了这两个类。    

由于 Unicode 的各种属性非常多，所以这种新的类的表达能力非常强。     

例如 `\p{Number}` 甚至能匹配罗马数字：    

```js
// 匹配所有数字
const regex = /^\p{Number}+$/u;
regex.test('²³¹¼½¾') // true
regex.test('㉛㉜㉝') // true
regex.test('ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩⅪⅫ') // true
```     

## 5.10 具名组匹配

```js
const RE_DATE = /(\d{4})-(\d{2})-(\d{2})/;
```     

上面代码中，正则表达式里面有三组圆括号。使用 `exec` 方法，就可以将这三组匹配结果提取出来。    

```js
const RE_DATE = /(\d{4})-(\d{2})-(\d{2})/;

const matchObj = RE_DATE.exec('1999-12-31');
const year = matchObj[1]; // 1999
const month = matchObj[2]; // 12
const day = matchObj[3]; // 31
```     

组匹配的一个问题是，每一组的匹配含义不容易看出来。ES2018 引入了具名组匹配，允许为每一个组匹配指定
一个名字，既便于阅读代码，又便于引用。      

```js
const RE_DATE = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;

const matchObj = RE_DATE.exec('1999-12-31');
const year = matchObj.groups.year;   // 1999
const month = matchObj.groups.month; // 12
const day = matchObj.groups.day; // 31
```    

字符串替换时，使用 `$<组名>` 引用具名组。    

```js
let re = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/u;

'2015-01-02'.replace(re, '$<day>/$<month>/$<year>')
// '02/01/2015'
```     

replace方法的第二个参数也可以是函数，该函数的参数序列如下。    

```js
'2015-01-02'.replace(re, (
   matched, // 整个匹配结果 2015-01-02
   capture1, // 第一个组匹配 2015
   capture2, // 第二个组匹配 01
   capture3, // 第三个组匹配 02
   position, // 匹配开始的位置 0
   S, // 原字符串 2015-01-02
   groups // 具名组构成的一个对象 {year, month, day}
 ) => {
 let {day, month, year} = groups;
 return `${day}/${month}/${year}`;
});
```    

如果要在正则表达式内部引用某个“具名组匹配”，可以使用 `\k<组名>` 的写法。    

## 5.11 matchAll

如果一个正则表达式在字符串里面有多个匹配，现在一般使用g修饰符或y修饰符，在循环里面逐一取出。    

```js
var regex = /t(e)(st(\d?))/g;
var string = 'test1test2test3';

var matches = [];
var match;
while (match = regex.exec(string)) {
  matches.push(match);
}

matches
// [
//   ["test1", "e", "st1", "1", index: 0, input: "test1test2test3"],
//   ["test2", "e", "st2", "2", index: 5, input: "test1test2test3"],
//   ["test3", "e", "st3", "3", index: 10, input: "test1test2test3"]
// ]
```     

目前有一个提案，增加了 `String.prototype.matchAll` 方法，可以一次性取出所有匹配。不过，
它返回的是一个遍历器（Iterator），而不是数组。    

```js
const string = 'test1test2test3';

// g 修饰符加不加都可以
const regex = /t(e)(st(\d?))/g;

for (const match of string.matchAll(regex)) {
  console.log(match);
}
// ["test1", "e", "st1", "1", index: 0, input: "test1test2test3"]
// ["test2", "e", "st2", "2", index: 5, input: "test1test2test3"]
// ["test3", "e", "st3", "3", index: 10, input: "test1test2test3"]
```