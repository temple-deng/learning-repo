# 3. 字符串的扩展

<!-- TOC -->

- [3. 字符串的扩展](#3-字符串的扩展)
  - [3.1 字符串的Unicode表示法](#31-字符串的unicode表示法)
  - [3.2 字符串的遍历器接口](#32-字符串的遍历器接口)
  - [3.3 模板字符串](#33-模板字符串)
  - [3.4 标签模板](#34-标签模板)

<!-- /TOC -->


## 3.1 字符串的Unicode表示法

JavaScript允许采用 `\uxxxx` 形式表示一个字符，其中“xxxx”表示字符的码点。但是当码点超出
`\uFFFF` 的范围后，根据正常的UTF-16表示法的话，应该用两个双字节的形式表达。   

ES6 对这一点做出了改进，只要将码点放入大括号，就能正确解读超出 `\uFFFF` 的字符：    

```js
"\u{20BB7}"
// "𠮷"
```    

有了这种表示法之后，JavaScript 共有 6 种方法可以表示一个字符。   

```js
'\z' === 'z'  // true
'\172' === 'z' // true
'\x7A' === 'z' // true
'\u007A' === 'z' // true
'\u{7A}' === 'z' // true
```

## 3.2 字符串的遍历器接口

字符串可以被for...of循环遍历。  

```javascript
for (let codePoint of 'foo') {
  console.log(codePoint)
}
// "f"
// "o"
// "o"
```  

## 3.3 模板字符串

如果大括号中的值不是字符串，将按照一般的规则转为字符串。比如，大括号中是一个对象，将默认调用对象
的 `toString` 方法。    

如果模板字符串中的变量没有声明，将报错。    

模板字符串甚至还能嵌套。   

## 3.4 标签模板

模板字符串的功能，不仅仅是上面这些。它可以紧跟在一个函数名后面，该函数将被调用来处理这个模板字符串。    

```javascript
alert`123`
// 等同于
alert(123)
```     

标签模板其实不是模板，而是函数调用的一种特殊形式。“标签”指的就是函数，紧跟在后面的模板字符串就是它的参数。     

但是，如果模板字符里面有变量（不能单单的叫变量吧，应该是有插值出现），就不是简单的调用了，而是会
将模板字符串先处理成多个参数，再调用函数。    

```javascript
var a = 5;
var b = 10;

tag`Hello ${ a + b } world ${ a * b }`;
// 等同于
tag(['Hello ', ' world ', ''], 15, 50);
```   

也就是说如果有插值的话，会在插值前后断开，两边的内容会组成一个字符串数组，作为第一个参数，
而插值分别作为后面的2,3...等等参数。   

