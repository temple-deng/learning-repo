# JSON 相关探讨

## JSON 与 普通JS对象相比的差别：
  + 键名必须加双引号。
  + 属性值中的字符串也必须加双引号。
  + 最后一个属性后面不能有逗号。
  + 数字形式不能有前导0，小数点后必须有数字。


## JSON.stringify(value [replacer [, space]])

如果第二个参数可以是数组或函数，如果是函数，接受两个参数，一个键名，一个键值，函数必须针对每一项都要有新属性值返回，也就是说必须有一个 `return` 语句，而且对返回值好像也严格要求。    

```js
 var obj = {
    'prop1': 'value1',
    'prop2': 'value2',
    'prop3': 'value3'
};

var selectedProperties = ['prop1', 'prop2'];

JSON.stringify(obj, selectedProperties)
// "{"prop1":"value1","prop2":"value2"}"

function f(key, value) {
  if (typeof value === "number") {
    value = 2 * value;
  }
  return value;
}

JSON.stringify({ a: 1, b: 2 }, f)
// '{"a": 2,"b": 4}'
```   

第三个参数，用于增加返回的JSON字符串的可读性。如果是数字，表示每个属性前面添加的空格（最多不超过10个）；如果是字符串（不超过10个字符），则该字符串会添加在每行前面。

## 其他

`undefined`，函数以及 symbol 和其他不能序列化话的值出现在非数组的对象的属性值中，该属性值会被忽略，如果出现在数组中，会被转换成 null。
