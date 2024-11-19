#  6. 数值的扩展

## 1. 基本内容  

Number.isFinite Number.isNaN 它们与传统的全局方法 `isFinite()` 和 `isNaN()`的区别在于，
传统方法先调用 `Number()` 将非数值的值转为数值，再进行判断，而这两个新方法只对数值有效，非数值
一律返回false。    

ES6将全局方法 `parseInt()` 和 `parseFloat()` ，移植到Number对象上面，行为完全保持不变。  

`Number.isInteger()` 用来判断一个值是否为整数。需要注意的是，在JavaScript内部，整数和浮点数
是同样的储存方法，所以3和3.0被视为同一个值。  

`Number.isSafeInteger()` 大于等于 `-2^53 + 1` 小于等于 `2^53 - 1` 的数。  

Number.EPSILON, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER。

指数运算符 `**`。    
