# 6. 对象的扩展


```
 1. Object.is()方法
 2. Object.assign()
 3. Object.getOwnPropertyDescriptor()
 4. Object.setPrototypeOf()   Object.getPrototypeOf()
```
---

##  1.Object.is()方法

用来比较两个值是否严格相等，与严格相等符表现基本相同，只有两点不同。  

```javascript
    Object.is(0,-0);            
    //false;
    Object.is(NaN,NaN);
    //true
    var a = {c:1,d:2};
    var b = {c:1,d:2};
    Object.is(a,b);
    //false


    //Object.is 的ES5实现
    Object.defineProperty(Object, is, {
    	value: function(x,y){
    		if(x===y){
    			//针对-0和+0的情况
    			return x!==0 || 1 / x === 1 / y;
    		}
    		//针对NaN的情况
    		return x!==x && y!==y;
    	},
    	configurable: true,
 	 	enumerable: false,
  		writable: true
    });
```  



## 2.Object.assign()方法

这个方法用于对象属性的合并，将源对象的所有可枚举属性，复制到目标对象。如果目标对象与源对象有同名属性，或多个源对象有同名属性，则后面的属性会覆盖前面的属性。  

参数这里比较复杂，第一个参数叫目标对象，后面的都是源对象。不是对象的参数会尝试转换为对象，这里第一个参数比较麻烦，当只有一个参数时，通常会将该参数转换为对象后直接返回，因此null和undefined会报错。但是处理源对象参数位置的null和undefined时，这些参数会被跳过，不会报错.  

其他类型的值（即数值、字符串和布尔值）不在首参数，也不会报错。但是，除了字符串会以数组形式，拷贝入目标对象，其他值都不会产生效果。  

```javascript
var v1 = 'abc';
var v2 = true;
var v3 = 10;

var obj = Object.assign({}, v1, v2, v3);
console.log(obj); // { "0": "a", "1": "b", "2": "c" }
```  

上面代码中，v1、v2、v3分别是字符串、布尔值和数值，结果只有字符串合入目标对象（以字符数组的形式），数值和布尔值都会被忽略。这是因为只有字符串的包装对象，会产生可枚举属性。  

```javascript
Object(true) // {[[PrimitiveValue]]: true}
Object(10)  //  {[[PrimitiveValue]]: 10}
Object('abc') // {0: "a", 1: "b", 2: "c", length: 3, [[PrimitiveValue]]: "abc"}
```  

Object.assign只拷贝自身属性，不可枚举的属性（enumerable为false）和继承的属性不会被拷贝。  

Object.assign方法实行的是浅拷贝，而不是深拷贝。也就是说，如果源对象某个属性的值是对象，那么目标对象拷贝得到的是这个对象的引用。   

```javascript
var target = { a: 1, b: 1 };

var source1 = { b: 2, c: 2 };
var source2 = { c: 3 };

Object.assign(target, source1, source2);
target // {a:1, b:2, c:3}
```  

注意，Object.assign可以用来处理数组，但是会把数组视为对象。  

```javascript
Object.assign([1, 2, 3], [4, 5])
// [4, 5, 3]
```  

上面代码中，Object.assign把数组视为属性名为0、1、2的对象，因此目标数组的0号属性4覆盖了原数组的0号属性1。  

<br>
<br>
## 3.Object.getOwnPropertyDescriptor()
Object.getOwnPropertyDescriptor(obj, prop_name) 只能得到自有属性描述符  

要想设置属性特性， Object.defineProperty(obj, prop_name, descriptor_obj)


## 4.Object.setPrototypeOf()   Object.getPrototypeOf()
Object.setPrototypeOf(object, prototype);   设置原型对象  

Object.getPrototypeOf(object);              获取原型对象
