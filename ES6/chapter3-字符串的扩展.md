# 3. 字符串的扩展

标签： for..of

---

```
 1. 字符串的遍历器接口
 2. includes(), startsWith(), endsWith()
 3. repeat()
 4. padStart(),padEnd()
```
 ---

###　     1.字符串的遍历器接口
　　　　　字符串可以被for...of循环遍历。
```javascript
    for (let codePoint of 'foo') {
      console.log(codePoint)
    }
    // "f"
    // "o"
    // "o"
```

<br>
<br>
###　     2. includes(), startsWith(), endsWith()
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

<br>
<br>
###　     3. repeat()
　　　　　 repeat()返回新字符串，表示将原串重复n次。
　　　　　 参数是小数会被取整， 负数或Infinity会报错， 但0~ -1之间的数会按0处理，NaN按0处理，字符串先转换成数字。
　　　　　 
<br>
<br>
###　     4. padStart()和padEnd()
　　　　　 接受两个参数，用于补全字符串到指定长度。如果省略第二个参数，则用空格补全。
```javascript
    'x'.padStart(5, 'ab') // 'ababx'
    'x'.padStart(4, 'ab') // 'abax'
    
    'x'.padEnd(5, 'ab') // 'xabab'
    'x'.padEnd(4, 'ab') // 'xaba'
```