# 7. Symbol


```
 1. 概述
 2. 用作对象属性名
 3. Symbol.for()和Symbol.keyFor()
 4. 内置的Symbol值
```

---

## 1.概述

Symbol函数前不能加 new ，否则会报错，因为生成的Symbol是一种原始类型，而不是对象。但是类似于字符串，可以添加属性，但只是通过包装对象实现，无法具体使用属性。  

有了Symbol类型， 意味着对象的属性名可以有两种类型， 一种是字符串， 一种是Symbol。  

接受一个字符串参数，仅作描述作用。相同参数的Symbol的返回值也不等。  

```javascript
    var s1 = Symbol();
    var s2 = Symbol();
    s1 === s2;
    //false
    var s3 = Symbol('hehe');
    var s4 = Symbol('hehe');
    s3 === s4;
    //false
```   

Symbol值不能与其他类型的值进行运算，会报错。但是可以显示转化为字符串。也可以转化为布尔值，但是不能转化为数值。   

```
    var s = Symbol();
    s.toString(); //"Symbol()"
    String(s);       //"Symbol()"
```   
<br>
<br>

## 2.用作对象属性名

Symbol用作对象属性名时，不能用点运算符。因为点运算符后面总是字符串。 因此会将Symbol的变量名转换为字符串。所以应该用以下的方式定义。  

```javascript
var mySymbol = Symbol();

// 第一种写法
var a = {};
a[mySymbol] = 'Hello!';

// 第二种写法
var a = {
  [mySymbol]: 'Hello!'
};

// 第三种写法
var a = {};
Object.defineProperty(a, mySymbol, { value: 'Hello!' });

// 以上写法都得到同样结果
a[mySymbol] // "Hello!"
```   

同理，在对象的内部，使用Symbol值定义属性时，Symbol值必须放在方括号之中。   

Symbol作为属性名，该属性不会出现在for...in、for...of循环中，也不会被Object.keys()、Object.getOwnPropertyNames()返回。但是，它也不是私有属性，有一个Object.getOwnPropertySymbols方法，可以获取指定对象的所有Symbol属性名。

Object.getOwnPropertySymbols方法返回一个数组，成员是当前对象的所有用作属性名的Symbol值。
<br>
<br>

## 3.Symbol.for()和Symbol.keyFor()

Symbol.for()接受一个字符串作为参数，然后搜索有没有以该参数作为名称的Symbol值。如果有，就返回这个Symbol值，否则就新建并返回一个以该字符串为名称的Symbol值。  

Symbol.keyFor方法返回一个已登记的Symbol类型值的key。登记操作即调用Symbol.for()方法。  


<br>
<br>

## 4. 内置的Symbol值
### Symbol.hasInstance