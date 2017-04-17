# 2. 变量的解构赋值


## 目录

 1. [数组的解构赋值](#part1)
 2. 对象的解构赋值(略)
 3. [字符串的解构赋值](#part2)
 4. [数值和布尔值的解构赋值](#part3)
 5. [字符串、数值和布尔值在数组解构和对象解构的比较](#part4)

---

<a name="part1"></a>
## 1.数组的解构赋值

本质上，这种写法属于“模式匹配”，只要等号两边的模式相同，左边的变量就会被赋予对应的值。下面是一些使用嵌套数组进行解构的例子。  

```javascript
let [foo, [[bar], baz]] = [1, [[2], 3]];
foo // 1
bar // 2
baz // 3

let [ , , third] = ["foo", "bar", "baz"];
third // "baz"

let [x, , y] = [1, 2, 3];
x // 1
y // 3

let [head, ...tail] = [1, 2, 3, 4];
head // 1
tail // [2, 3, 4]         这个比较特殊

let [x, y, ...z] = ['a'];
x // "a"
y // undefined
z // []                 这个也比较特殊
```  

解构不成功的状况，即左边的变量在右边无对应的值，变量的值即为`undefined`.   

解构赋值不仅适用于var命令，也适用于let和const命令。    

事实上，只要某种数据结构具有Iterator接口，都可以采用数组形式的解构赋值。  


### 默认值

```javascript
var [foo = true] = [];
foo // true

[x, y = 'b'] = ['a'] // x='a', y='b'
[x, y = 'b'] = ['a', undefined] // x='a', y='b'

var [x = 1] = [null];
x // null
```  

注意，ES6内部使用严格相等运算符（===），判断一个位置是否有值。所以，如果一个数组成员不严格等于undefined，默认值是不会生效的。上面代码中，如果一个数组成员是null，默认值就不会生效，因为null不严格等于undefined。  
如果默认值是一个表达式，那么这个表达式是惰性求值的，即只有在用到的时候，才会求值。  

```javascript
	function foo(){
	cosole.log('aaa');
	}

	var [x=f()] = [1];   // 1 !== undefined  所以foo不会执行
```  

**重复声明的问题**  

```javascript
	let foo;
	let {foo} = {foo: 'hello'};    //SyntaxError: Duplicate declaration "foo"    //这个好理解

	let foo;
	({foo} = {foo:1});           //注意这里没有用任何声明，必须要加上外边的括号， 因为JavaScript引擎会将{x}理解成一个代码块，从而发生语法错误。只有不将大括号写在行首，避免JavaScript将其解释为代码块，才能解决这个问题。这里foo可能是一个全局变量，但是在全局对象window上没这个属性 window.foo == undefined
```  

<a name="part2"></a>
## 3.字符串的解构赋值

字符串在解构赋值时被转换成了一个类似数组的对象。  

```javascript
const [a, b, c, d, e] = 'hello';
a // "h"
b // "e"
c // "l"
d // "l"
e // "o"
```  

类似数组的对象都有一个length属性，因此还可以对这个属性解构赋值。  


```javascript
    let {length : len} = 'hello';
    len // 5
```  


<a name="part3"></a>
## 4. 数值和布尔值的解构赋值

解构赋值时，如果等号右边是数值和布尔值，则会先转为对象。   

解构赋值的规则是，只要等号右边的值不是对象，就先将其转为对象。由于undefined和null无法转为对象，所以对它们进行解构赋值，都会报错。    


　　　　　
<a name="part4"></a>　　　　　
## 5. 字符串、数值和布尔值在数组解构和对象解构的比较
在将数值、字符串和布尔值分别进行数组解构和对象解构时会有不同的表现。  

首先，上面谈过了，无论是数组解构还是对象解构，都会把等号右边的值转为对象。  

而数组解构要求右边的对象具有Iterator接口。  

+ *数值* ： 数值转为包装对象后没有Iterator接口，所以数组解构会报错，而针对转为包装对象后存在的属性进行对象解构时可以成功的，即使是不存在的属性，也只会返回undefined，不会报错。  

```javascript
    var [s] = 123;
    s; //报错

    var {toString: x} = 123;
    x;     //function x === Number.prototype.toString
```  
+ *布尔值*  布尔值和数值的情况类似。  
+ *字符串*  由于字符串会转成类数组对象，具有length属性，所以无论是数组解构还是对象解构都会成功，不会报错。
