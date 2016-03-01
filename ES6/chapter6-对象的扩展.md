# 6. 对象的扩展

标签： 

---

```
 1. Object.is()方法
 2. Array.of()
 3. 数组实例的copyWithin()方法
 4. 数值和布尔值的解构赋值
```
 ---

###　     1.Object.is()方法
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
```
<br>
<br>
###　     2.Object.assign()方法
　　　　    这个方法用于对象属性的合并，将源对象的所有可枚举属性，复制到目标对象。
　　　　    至少需要两个对象参数，如果目标对象与源对象有同名属性，或多个源对象有同名属性，则后面的属性会覆盖前面的属性。
　　　　    Object.assign只拷贝自身属性，不可枚举的属性（enumerable为false）和继承的属性不会被拷贝。
　　　　    Object.assign方法实行的是浅拷贝，而不是深拷贝。也就是说，如果源对象某个属性的值是对象，那么目标对象拷贝得到的是这个对象的引用。
```javascript
var target = { a: 1, b: 1 };

var source1 = { b: 2, c: 2 };
var source2 = { c: 3 };

Object.assign(target, source1, source2);
target // {a:1, b:2, c:3}
```



