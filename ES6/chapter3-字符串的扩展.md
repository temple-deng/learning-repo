# 3. 字符串的扩展



 1. [本章主要的API](#part1)
 2. [字符串的Unicode表示法](#part2)
 3. [字符串的遍历器接口](#part3)
 4. [includes(), startsWith(), endsWith()](#part4)
 5. [repeat()](#part5)
 6. [padStart(),padEnd()](#part6)

---

<a name="part1"></a>
## 1.本章主要的API

```javascript
    String.prototype.charAt()       //返回字符串指定索引的字符咯
    String.prototype.charCodeAt()   //返回字符串指定索引的字符的编码咯
    String.prototype.codePointAt()  //返回字符串指定索引的字符的码点咯
    String.fromCharCode()           //根据给定的编码返回对应的字符咯
    String.fromCodePoint()          //根据给定的码点返回对应的字符咯
    String.prototype.includes()     //返回布尔值，表示是否找到了参数字符串。
    String.prototype.startWith()    //返回布尔值，表示参数字符串是否在源字符串头部。
    String.prototype.endWith()    //返回布尔值，表示参数字符串是否在源字符串尾部。
    String.prototype.repeat()       //重复字符串咯
    String.prototype.padStart()  String.prototype.padEnd()   //补全字符串咯  
```  

<a name="part2"></a>
## 2. 字符串的Unicode表示法

JavaScript允许采用\uxxxx形式表示一个字符，其中“xxxx”表示字符的码点。 但是当码点超出\uFFFF的范围后，根据正常的UTF-16表示法的话，应该用两个双字节的形式表达，但是由于Javascript使用的是不完整的UCS-2编码方式，所以无法正常识别超出\uFFFF码点的字符。所以JavaScript会将其分成两个字符的表示。  

```javascript
var s = "𠮷";
s.length // 2
s.charAt(0) // ''
s.charAt(1) // ''
s.charCodeAt(0) // 55362
s.charCodeAt(1) // 57271
```  

上面代码中，汉字“𠮷”的码点是0x20BB7，UTF-16编码为0xD842 0xDFB7（十进制为55362 57271），需要4个字节储存。对于这种4个字节的字符，JavaScript不能正确处理，字符串长度会误判为2，而且charAt方法无法读取整个字符，charCodeAt方法只能分别返回前两个字节和后两个字节的值。  

ES6提供了codePointAt方法，能够正确处理4个字节储存的字符，返回一个字符的码点。  

```javascript
var s = '𠮷a';

s.codePointAt(0) // 134071
s.codePointAt(1) // 57271

s.charCodeAt(2) // 97
```  

codePointAt方法的参数，是字符在字符串中的位置（从0开始）。上面代码中，JavaScript将“𠮷a”视为三个字符，codePointAt方法在第一个字符上，正确地识别了“𠮷”，返回了它的十进制码点134071（即十六进制的20BB7）。在第二个字符（即“𠮷”的后两个字节）和第三个字符“a”上，codePointAt方法的结果与charCodeAt方法相同。  

但是这样还是有点尴尬啊。。。如果是两个𠮷，那只有在0,2位置才能返回正确的码点。  

ES5提供String.fromCharCode方法，用于从码点返回对应字符，但是这个方法不能识别32位的UTF-16字符（Unicode编号大于0xFFFF）。  

ES6提供了String.fromCodePoint方法，可以识别0xFFFF的字符，弥补了String.fromCharCode方法的不足。  

如果String.fromCodePoint()有多个参数，那么会合并成一个字符串返回。


<a name="part3"></a>
## 3. 字符串的遍历器接口

字符串可以被for...of循环遍历。  

```javascript
    for (let codePoint of 'foo') {
      console.log(codePoint)
    }
    // "f"
    // "o"
    // "o"
```  


<a name="part4"></a>
## 4. includes(), startsWith(), endsWith()

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

下面代码表示，使用第二个参数n时，endsWith的行为与其他两个方法有所不同。它针对前n个字符，而其他两个方法针对从第n个位置直到字符串结束。  

```javascript
    var s = 'Hello world!';

    s.startsWith('world', 6) // true
    s.endsWith('Hello', 5) // true
    s.includes('Hello', 6) // false
```


<a name="part5"></a>
## 5. repeat()

repeat()返回新字符串，表示将原串重复n次。  

参数是小数会被取整， 负数或Infinity会报错， 但0~ -1之间的数会按0处理，NaN按0处理，字符串先转换成数字。
　　　　　


<a name="part6"></a>
## 6. padStart()和padEnd()

接受两个参数，用于补全字符串到指定长度。如果省略第二个参数，则用空格补全。  

```javascript
    'x'.padStart(5, 'ab') // 'ababx'
    'x'.padStart(4, 'ab') // 'abax'

    'x'.padEnd(5, 'ab') // 'xabab'
    'x'.padEnd(4, 'ab') // 'xaba'
```
