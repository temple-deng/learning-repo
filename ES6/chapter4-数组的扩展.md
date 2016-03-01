# 4. 数组的扩展

标签： 

---

```
 1. Array.from()
 2. Array.of()
 3. 数组实例的copyWithin()方法
 4. 数值和布尔值的解构赋值
```
 ---

###　     1.Array.from()
　　　　　这个方法用于将类数组对象和具有迭代器接口的数据结构转换为数组。类数组对象本质特点只有一个，即具有length属性。
```javascript
Array.from({ length: 3 });
// [ undefined, undefined, undefinded ]
```
　　　　　 Array.from还可以接受第二个参数，作用类似于数组的map方法，用来对每个元素进行处理，将处理后的值放入返回的数组。

<br>
<br>
###　     2. Array.of()
　　    这个方法用于将一组参数转换为数组
```javascript
    Array.of() // []
    Array.of(undefined) // [undefined]
    Array.of(1) // [1]
    Array.of(1, 2) // [1, 2]
```

<br>
<br>
###　     3. 数组实例的copyWithin()方法
　　    该方法是将数组指定位置的元素复制到其他位置（会覆盖原位置的元素），然后返回当前数组，即修改的是当前数组。接受三个参数:
```javascript
    Array.prototype.copyWithin(target, start=0, end=this,length)
    // target(必须)  从该位置开始替换元素
    // start(可选)   从该位置开始读取数据，默认为0。如果为负值，表示倒数。
    // end(可选)     到该位置前停止读取数据，默认等于数组长度。如果为负值，表示倒数。
    // -2相当于3号位，-1相当于4号位
    [1, 2, 3, 4, 5].copyWithin(0, -2, -1)
    // [4, 2, 3, 4, 5]
```

<br>
<br>
###　     4. 数组实例的find()和findIndex()和includes()方法
　　    find方法，用于找出第一个符合条件的数组成员。参数是一个回调函数，会针对每一个数组成员调用这个函数，直到找出第一个返回值为true的成员，然后返回该成员，如果没找到返回undefined。
　　    回调函数接受三个参数，依次是值value，索引index，和原数组arr.
　　    findIndex方法类似于find方法，不同的是返回索引，没找到就返回-1.
　　    includes()方法返回布尔值，表示数组是否包含某个值。接受第二个参数用于表示搜索的起始位置。
　　    可以用来搜索出NaN,传统的 indexOf使用严格相等符，因此会出错。
<br>
<br>

###　     5. 数组实例的fill()方法
　　    fill方法接受指定值填充数组，接受第二个参数和第三个参数，指定填充的起始位置和结束位置。
　　    
　　    
　　    