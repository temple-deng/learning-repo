# 8. Set和Map

标签： 

---

```
 1. Set
 2. Map
```
 ---

###　     1.Set
Set是一种数据结构，类似于数组，但成员都是唯一的，可以接受一个数组（或类数组对象）用来初始化。向Set加入值的时候，不会发生类型转换，所以5和"5"是两个不同的值。  

Set实例的size属性返回成员总数。  

操作方法：  
+ add(value)：添加某个值，返回Set结构本身。  
+ delete(value)：删除某个值，返回一个布尔值，表示删除是否成功。  
+ has(value)：返回一个布尔值，表示该值是否为Set的成员。  
+ clear()：清除所有成员，没有返回值。  

遍历方法：  
+ keys()：返回一个键名的遍历器  
+ values()：返回一个键值的遍历器  
+ entries()：返回一个键值对的遍历器  
+ forEach()：使用回调函数遍历每个成员  

```javascript 
let set = new Set(['red', 'green', 'blue']);

for ( let item of set.keys() ){
  console.log(item);
}
// red
// green
// blue

for ( let item of set.values() ){
  console.log(item);
}
// red
// green
// blue

for ( let item of set.entries() ){
  console.log(item);
}
// ["red", "red"]
// ["green", "green"]
// ["blue", "blue"]
```
Set结构的实例的forEach方法，用于对每个成员执行某种操作，没有返回值。 

上面代码说明，forEach方法的参数就是一个处理函数。该函数的参数依次为键值、键名、集合本身（上例省略了该参数）。另外，forEach方法还可以有第二个参数，表示绑定的this对象。  
  
需要特别指出的是，Set的遍历顺序就是插入顺序。这个特性有时非常有用，比如使用Set保存一个回调函数列表，调用时就能保证按照添加顺序调用。  

<br>
<br>

###　     2.Map

ES6提供了Map数据结构。它类似于对象，也是键值对的集合，但是“键”的范围不限于字符串，各种类型的值（包括对象）都可以当作键。也就是说，Object结构提供了“字符串—值”的对应，Map结构提供了“值—值”的对应，是一种更完善的Hash结构实现。如果你需要“键值对”的数据结构，Map比Object更合适。  

作为构造函数，Map也可以接受一个数组作为参数。该数组的成员是一个个表示键值对的数组。  

```javascript
var obj = {a:1};
var m = new Map([
  [obj, 'hello'],
  [null,true]
  ]);

m.size // 2
m.get(obj);  // 'hello'
m.get(null);  // true
```  

如果读取一个未知的键，则返回undefined。

```javascript
new Map().get('asfddfsasadf')
// undefined
```

从这个也能看出运算顺序

注意，只有对同一个对象的引用，Map结构才将其视为同一个键。这一点要非常小心。Map的键实际上是跟内存地址绑定的，只要内存地址不一样，就视为两个键。这就解决了同名属性碰撞（clash）的问题，我们扩展别人的库的时候，如果使用对象作为键名，就不用担心自己的属性与原作者的属性同名。  

如果Map的键是一个简单类型的值（数字、字符串、布尔值），则只要两个值严格相等，Map将其视为一个键，包括0和-0。另外，虽然NaN不严格相等于自身，但Map将其视为同一个键。  

