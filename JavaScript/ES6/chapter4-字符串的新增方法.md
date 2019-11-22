# 4. 字符串的新增方法

<!-- TOC -->

- [4. 字符串的新增方法](#4-字符串的新增方法)
  - [4.1 String.fromCodePoint()](#41-stringfromcodepoint)
  - [4.2 String.raw()](#42-stringraw)
  - [4.3 codePointAt()](#43-codepointat)
  - [4.4 includes(), startsWith(), endsWith()](#44-includes-startswith-endswith)
  - [4.5 repeat()](#45-repeat)
  - [4.6 padStart()和padEnd()](#46-padstart和padend)
  - [4.7 trimStart(), trimEnd()](#47-trimstart-trimend)

<!-- /TOC -->

## 4.1 String.fromCodePoint()

ES5 提供 `String.fromCharCode()` 方法，用于从 Unicode 码点返回对应字符，但是这个方法不能
识别码点大于 `0xFFFF` 的字符。    

```js
String.fromCharCode(0x20BB7)
// "ஷ"
```      

上面代码中，`String.fromCharCode()` 不能识别大于 `0xFFFF` 的码点，所以 `0x20BB7` 就发生
了溢出，最高位2被舍弃了，最后返回码点 `U+0BB7` 对应的字符，而不是码点 `U+20BB7` 对应的字符。    

ES6 提供了 `String.fromCodePoint()` 方法，可以识别大于 `0xFFFF` 的字符，弥补了
`String.fromCharCode()` 方法的不足。    

```js
String.fromCodePoint(0x20BB7)
// "𠮷"
String.fromCodePoint(0x78, 0x1f680, 0x79) === 'x\uD83D\uDE80y'
// true
```     

## 4.2 String.raw()

ES6 还为原生的 `String` 对象，提供了一个 `raw()` 方法。该方法返回一个斜杠都被转义（即斜杠
前面再加一个斜杠）的字符串，往往用于模板字符串的处理方法。    

```js
String.raw`Hi\n${2+3}!`;
// 返回 "Hi\\n5!"

String.raw`Hi\u000A!`;
// 返回 "Hi\\u000A!"
```

`String.raw()` 方法也可以作为正常的函数使用。这时，它的第一个参数，应该是一个具有 `raw` 属性
的对象，且 `raw` 属性的值应该是一个数组。   

```js
String.raw({ raw: 'test' }, 0, 1, 2);
// 't0e1s2t'

// 等同于
String.raw({ raw: ['t','e','s','t'] }, 0, 1, 2);
```    

## 4.3 codePointAt()

ES6 提供了 `codePointAt()` 方法，能够正确处理 4 个字节储存的字符，返回一个字符的码点。    

```js
let s = '𠮷a';

s.codePointAt(0) // 134071
s.codePointAt(1) // 57271

s.codePointAt(2) // 97
```      

codePointAt()方法是测试一个字符由两个字节还是由四个字节组成的最简单方法。   

```js
function is32Bit(c) {
  return c.codePointAt(0) > 0xFFFF;
}

is32Bit("𠮷") // true
is32Bit("a") // false
```     

## 4.4 includes(), startsWith(), endsWith()

includes()：返回布尔值，表示是否找到了参数字符串。(既然有了indexOf为什么还要这个方法，注意：indexOf方法可以寻找子串，而不是仅仅单个字符)    

startsWith()：返回布尔值，表示参数字符串是否在源字符串的头部。  

endsWith()：返回布尔值，表示参数字符串是否在源字符串的尾部。  

```javascript
var s = 'Hello world!';

s.startsWith('Hello') // true
s.endsWith('!') // true
s.includes('o') // true
```  

这三个方法都支持第二个参数，表示开始搜索的位置。  

下面代码表示，使用第二个参数n时，endsWith的行为与其他两个方法有所不同。它针对前n个字符，而其他
两个方法针对从第n个位置直到字符串结束。  

```javascript
var s = 'Hello world!';

s.startsWith('world', 6) // true
s.endsWith('Hello', 5) // true
s.includes('Hello', 6) // false
```

## 4.5 repeat()

repeat()返回新字符串，表示将原串重复n次。  

参数是小数会被取整，负数或Infinity会报错， 但0~ -1之间的数会按0处理，NaN按0处理，字符串先
转换成数字。    


## 4.6 padStart()和padEnd()

接受两个参数，用于补全字符串到指定长度。如果省略第二个参数，则用空格补全。  

```javascript
'x'.padStart(5, 'ab') // 'ababx'
'x'.padStart(4, 'ab') // 'abax'

'x'.padEnd(5, 'ab') // 'xabab'
'x'.padEnd(4, 'ab') // 'xaba'
```

## 4.7 trimStart(), trimEnd()

它们返回的都是新字符串，不会修改原始字符串。   

