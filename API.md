# API

---
数组解构要求右边是可迭代解构，也就是有iterator接口
Array.from()要求是类数组对象和可遍历对象
但是要注意有的类数组对象实现了iterator接口。。。这他妈就尴尬了
```javascript
    String.fromCharCode(charCode)           //根据给定的编码返回对应的字符咯
    String.fromCodePoint(codePoint)          //根据给定的码点返回对应的字符咯
	String.prototype.charAt(index)       //返回字符串指定索引的字符咯
    String.prototype.charCodeAt(index)   //返回字符串指定索引的字符的编码咯
    String.prototype.codePointAt(index)  //返回字符串指定索引的字符的码点咯
    String.prototype.includes(str)     //返回布尔值，表示是否找到了参数字符串。
    String.prototype.startWith(str,[location])    //返回布尔值，表示参数字符串是否在源字符串头部。
    String.prototype.endWith(str, [location])    //返回布尔值，表示参数字符串是否在源字符串尾部。
    String.prototype.repeat(num)       //重复字符串咯
    String.prototype.padStart(length, str)  String.prototype.padEnd(length, str)   //补全字符串咯  
```
```javascript
	Number.isFinite(num)   //返回布尔值，表示一个值是否是无限
	Number.isNaN(num)		//返回布尔值，表示一个值是否是NaN，注意这两个函数不会进行类型转换
	Number.parseInt(), Number.parseFloat()
	Number.isInteger()   //布尔值，是否是整数，3和3.0是一样的
```

```javascript
	Array.from()          
	Array.of()
	Array.prototype.copyWithin(target, start = 0, end = this.length)
	Array.prototype.find()
	Array.prototype.findIndex()
	Array.prototype.entries()
	Array.prototype.keys()
	Array.prototype.values()
```
数组的entries、keys、values都返回遍历器对象
```javascript
	Object.is()
	Object.assign()
	Object.keys()   自有可枚举
	Object.getOwnPropertyNames()    自有
	Object.getOwnPropertySymbols()  自有
	Reflect.ownKeys()               自有
	Reflect.enumerate()
```
Object的keys、values、entries都返回数组。。。。。这又有点尴尬。