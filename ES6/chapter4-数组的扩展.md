# 4. 变量的解构赋值

标签： 

---

```
 1. Array.from()
 2. 对象的解构赋值(略)
 3. 字符串的解构赋值
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


