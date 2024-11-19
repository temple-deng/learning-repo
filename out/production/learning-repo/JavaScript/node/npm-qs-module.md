# qs 模块的用法

## 用法

```javascript
var qs = require('qs');
var assert = require('assert');

var obj = qs.parse('a=c');
assert.deepEqual(obj, { a: 'c' });

var str = qs.stringify(obj);
assert.equal(str, 'a=c');
```     

### 解析对象 `qs.parse(string, [options])`   

我们可以在传入的字符串中通过将子键名用 `[]` 括起来创建嵌套的对象：   

```javascript
assert.deepEqual(qs.parse('foo[bar]=baz'), {
  foo: {
    bar: 'baz'
  }
});
```     

当使用 `plainObjects` 选项时，解析后返回的对象是通过 `Object.create(null)` 创建
的 null object。所以原型上的方法就不存在了，所有我们可以随意设置对象的属性名：   

```javascript
var nullObject = qs.parse('a[hasOwnProperty]=b', { plainObjects: true });
assert.deepEqual(nullObject, { a: { hasOwnProperty: 'b' } });
```    

但是这里感觉好奇怪，你只是返回的对象是 null object，但是例子里是嵌套的属性名是原型方法。
这样的话，应该在创建嵌套对象的时候也是使用 `Object.create(null)` 创建的吧。    

默认情况下，哪些会覆盖对象原型属性的参数会被忽视，例如上面的例子如果不加`plainObjects` 设置，
最终返回的对象是空对象 `{}`，所以如果想要保存下来这些覆盖的参数，可以使用上面的 `plainObjects`，
或者设置 `allowPrototypes` 为 `true`，这也可以让覆盖原型的属性。    


```javascript
var protoObject = qs.parse('a[hasOwnProperty]=b', { allowPrototypes: true });
assert.deepEqual(protoObject, { a: { hasOwnProperty: 'b' } });
```    

URI 编码的字符串也可以正常工作：   

```javascript
assert.deepEqual(qs.parse('a%5Bb%5D=c'), {
  a: { b: 'c' }
});
```     

默认情况下，qs 最多只会解析嵌套的对象知道第5层，所以如果想解析一个字符串例如：`a[b][c][d][e][f][g][h][i]=j`:   

```javascript
var expected = {
  a: {
    b: {
      c: {
        d: {
          e: {
            f: {
              '[g][h][i]': 'j'
            }
          }
        }
      }
    }
  }
};
var string = 'a[b][c][d][e][f][g][h][i]=j';
assert.deepEqual(qs.parse(string), expected);
```    

可以传递 `depth` 参数覆盖这个默认的深度：   

```javascript
var deep = qs.parse('a[b][c][d][e][f][g][h][i]=j', { depth: 1 });
assert.deepEqual(deep, { a: { b: { '[c][d][e][f][g][h][i]': 'j' } } });
```    

并且默认下 qs 最多只解析1000个参数，可以使用`parameterLimit` 参数覆盖默认设置：   

```javascript
var limited = qs.parse('a=b&c=d', { parameterLimit: 1 });
assert.deepEqual(limited, { a: 'b' });
```     

可选传入一个分隔符：   

```javascript
var delimited = qs.parse('a=b;c=d', { delimiter: ';' });
assert.deepEqual(delimited, { a: 'b', c: 'd' });
```    

分隔符可以是正则表达式：   

```javascript
var regexed = qs.parse('a=b;c=d,e=f', { delimiter: /[;,]/ });
assert.deepEqual(regexed, { a: 'b', c: 'd', e: 'f' });
```     

可选启用点属性访问符,`allowDots`：   

```javascript
var withDots = qs.parse('a.b=c', { allowDots: true });
assert.deepEqual(withDots, { a: { b: 'c' } });
```    


### 解析数组

也可以使用相似的 `[]` 解析数组：    

```javascript
var withArray = qs.parse('a[]=b&a[]=c');
assert.deepEqual(withArray, { a: ['b', 'c'] });
```    

可以指定索引：   

```javascript
var withIndexes = qs.parse('a[1]=c&a[0]=b');
assert.deepEqual(withIndexes, { a: ['b', 'c'] });
```    

注意如果是稀疏数组，qs会压缩稀疏数组的现有值，按其本身的顺序排列：   

```javascript
var noSparse = qs.parse('a[1]=b&a[15]=c');
assert.deepEqual(noSparse, { a: ['b', 'c'] });   
```    

注意空字符串也是值，也会被保留下来（解析对象也是一样）：   

```javascript
var withEmptyString = qs.parse('a[]=&a[]=b');
assert.deepEqual(withEmptyString, { a: ['', 'b'] });

var withIndexedEmptyString = qs.parse('a[0]=b&a[1]=&a[2]=c');
assert.deepEqual(withIndexedEmptyString, { a: ['b', '', 'c'] });
```   


qs 限制数组指定的数组索引最大为20。如果数组成员的索引值大于20会转换为对象的键值：   

```javascript
var withMaxIndex = qs.parse('a[100]=b&a[1]=c');
assert.deepEqual(withMaxIndex, { a: { '100': 'b', '1': 'c' } });
```    

可以传递 `arrayLimit` 选项覆盖这个设置：   

```javascript
var withArrayLimit = qs.parse('a[1]=b', { arrayLimit: 0 });
assert.deepEqual(withArrayLimit, { a: { '1': 'b' } });
```    

如果想要直接禁用数组解析，设置 `parseArrays` 为 `false`。    

```javascript
var noParsingArrays = qs.parse('a[]=b', { parseArrays: false });
assert.deepEqual(noParsingArrays, { a: { '0': 'b' } });
```    

还可以创建对象数组：   

```javascript
var arraysOfObjects = qs.parse('a[][b]=c');
assert.deepEqual(arraysOfObjects, { a: [{ b: 'c' }] });
```     


### 字符串话 stringifying

`qs.stringify(object, [options])`    

字符串化时，默认使用 URI 编码输出：   

```javascript
assert.equal(qs.stringify({ a: 'b' }), 'a=b');
assert.equal(qs.stringify({ a: { b: 'c' } }), 'a%5Bb%5D=c');
```    

如果将`encode` 设为 `false` 会禁止这种编码方式：   

```javascript
var unencoded = qs.stringify({ a: { b: 'c' } }, { encode: false });
assert.equal(unencoded, 'a[b]=c');
```    

可以将 `encodeValuesOnly` 为 `true` 只编码属性值，不编码键名：   

```javascript
var encodedValues  = qs.stringify(
  { a: 'b', c: ['d', 'e=f'], f: [['g'], ['h']] },
  { encodeValuesOnly: true }
)
assert.equal(encodedValues,'a=b&c[0]=d&c[1]=e%3Df&f[0][0]=g&f[1][0]=h');
```    


可以传入自定义的编码函数，设置为 `encoder` 的值：   

```javascript
var encoded = qs.stringify({ a: { b: 'c' } }, { encoder: function (str) {
  // Passed in values `a`, `b`, `c`
  return // Return encoded string
}})
```    

与编码器类似，也可以设置 `decoder` 来实现定制的解码器：   

```javascript
var decoded = qs.parse('x=z', { decoder: function (str) {
  // Passed in values `x`, `z`
  return // Return decoded string
}})
```   

当字符串化数组时，默认会提供明确的索引：   

```javascript
qs.stringify({ a: ['b', 'c', 'd'] });
// 'a[0]=b&a[1]=c&a[2]=d'
```    

可以将`indices` 设为 `false` 禁止这种行为：   

```javascript
qs.stringify({ a: ['b', 'c', 'd'] }, { indices: false });
// 'a=b&a=c&a=d'
```     

可以使用 `arrayFormat` 参数指定输出数组的格式：    

```javascript
qs.stringify({ a: ['b', 'c'] }, { arrayFormat: 'indices' })
// 'a[0]=b&a[1]=c'
qs.stringify({ a: ['b', 'c'] }, { arrayFormat: 'brackets' })
// 'a[]=b&a[]=c'
qs.stringify({ a: ['b', 'c'] }, { arrayFormat: 'repeat' })
// 'a=b&a=c'
```    

字符串化对象时，默认使用方括号的形式：   

```javascript
qs.stringify({ a: { b: { c: 'd', e: 'f' } } });
// 'a[b][c]=d&a[b][e]=f'
```   

可以设置 `allowDots` 为 `true` 改为点号：   

```javascript
qs.stringify({ a: { b: { c: 'd', e: 'f' } } }, { allowDots: true });
// 'a.b.c=d&a.b.e=f'
```     

空的字符串及空值会忽略值，但是还是有等号在原位上：   

`assert.equal(qs.stringify({ a: '' }), 'a=');`   

没有值（例如空对象或数组）的键名什么都不返回（注意和上面的区别）：   

```javascript
assert.equal(qs.stringify({ a: [] }), '');
assert.equal(qs.stringify({ a: {} }), '');
assert.equal(qs.stringify({ a: [{}] }), '');
assert.equal(qs.stringify({ a: { b: []} }), '');
assert.equal(qs.stringify({ a: { b: {}} }), '');
```    

`undefined` 会整个省略：   

`assert.equal(qs.stringify({ a: null, b: undefined }), 'a=');`   

可以指定分隔符：   

`assert.equal(qs.stringify({ a: 'b', c: 'd' }, { delimiter: ';' }), 'a=b;c=d');`  

甚至可以指定 `filter` 选项来限制哪些键会被输出到最终的字符串中，如果传递一个
函数，每个键都会调用来获取其替换的值。如果是数组，用来过滤属性：   

```javascript
function filterFunc(prefix, value) {
  if (prefix == 'b') {
    // Return an `undefined` value to omit a property.
    return;
  }
  if (prefix == 'e[f]') {
    return value.getTime();
  }
  if (prefix == 'e[g][0]') {
    return value * 2;
  }
  return value;
}
qs.stringify({ a: 'b', c: 'd', e: { f: new Date(123), g: [2] } }, { filter: filterFunc });
// 'a=b&c=d&e[f]=123&e[g][0]=4'
qs.stringify({ a: 'b', c: 'd', e: 'f' }, { filter: ['a', 'e'] });
// 'a=b&e=f'
qs.stringify({ a: ['b', 'c', 'd'], e: 'f' }, { filter: ['a', 0, 2] });
// 'a[0]=b&a[2]=d'
```   
