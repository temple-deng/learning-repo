# Buffer

目录：   

+ [Buffer.from(), Buffer.alloc(), and Buffer.allocUnsafe()](#part1)
  - [The --zero-fill-buffers command line option](#part11)
  - [What makes Buffer.allocUnsafe() and Buffer.allocUnsafeSlow() "unsafe"?](#part12)
+ [Buffers and Character Encodings](#part2)
+ [Buffers and TypedArray](#part3)
+ [Buffers and ES6 iteration](#part4)
+ [Class: Buffer](#class)
  -

# Buffer

`Buffer` 类以一种更优化且更适合 Node.js 用例的方式实现了 `Uint8Array` API。    

`Buffer` 类的实例与整数数组类似，但是是固定的尺寸，在 V8 堆外分配的原始内存。`Buffer` 的
尺寸在其创建时就已经设置好，并且不能再修改的。    

`Buffer`是一个全局的变量，所有不需要去加载模块使用。　　　　

```javascript
// Creates a zero-filled Buffer of length 10.
const buf1 = Buffer.alloc(10);

// Creates a Buffer of length 10, filled with 0x1.
const buf2 = Buffer.alloc(10, 1);

// Creates an uninitialized buffer of length 10.
// This is faster than calling Buffer.alloc() but the returned
// Buffer instance might contain old data that needs to be
// overwritten using either fill() or write().
const buf3 = Buffer.allocUnsafe(10);

// Creates a Buffer containing [0x1, 0x2, 0x3].
const buf4 = Buffer.from([1, 2, 3]);

// Creates a Buffer containing UTF-8 bytes [0x74, 0xc3, 0xa9, 0x73, 0x74].
const buf5 = Buffer.from('tést');

// Creates a Buffer containing Latin-1 bytes [0x74, 0xe9, 0x73, 0x74].
const buf6 = Buffer.from('tést', 'latin1');
```   

## Buffer.from(), Buffer.alloc(), and Buffer.allocUnsafe()

<a name="part1"></a>    

在 Node.js v6 之前，`Buffer` 实例是通过使用 `Buffer` 构造函数创建的，基于提供的不同参数返回不同
的分配的 `Buffer`:    

+ 传递一个数值作为第一个参数（例如 `new Buffer(10)`），会分配一个规定尺寸的新的 `Buffer`
对象。在 8.0.0 之前，为这样的实例分配的内存是没有初始化的，所以可能包含敏感的数据。这样的
`Buffer` 实例必须随后使用 `buf.fill(0)` 或者直接向 `Buffer` 中完全写入数据来进行初始化。
虽然这种行为有意改善性能，但开发经验表明，在创建快速但未初始化的 `Buffer` 与创建缓慢但更安全的
`Buffer` 之间需要更明确的区别。从 8.0.0 开始 `Buffer(num)` 和 `new Buffer(num)` 会返回一个
初始化过内存的 `Buffer`。
+ 传递一个字符串，数组，或者 `Buffer` 作为第一个参数，会拷贝这些数据到 `Buffer` 中。
+ 传递一个 `ArrayBuffer` 返回一个与给定的 `ArrayBuffer` 共享所分配内存的 `Buffer`。    

由于这种根据第一个参数类型的不同导致的不同行为，对于那些不能正确验证传递给 `new Buffer()`
的输入参数的应用程序，或无法正确初始化新分配的 `Buffer` 内容的应用程序可能无意中将安全性和可靠性问题引入到其代码中。     

为了创建更值得依赖且错误更少的 `Buffer` 实例，各种使用 `new Buffer()` 构造函数创建实例
的方式已经被废弃，并且用几种分离的函数来代替 `Buffer.from()`, `Buffer.alloc()` 和 `Buffer.allocUnsafe()`。     

+ `Buffer.from(array)` 返回一个包含给定字节的副本的新的 `Buffer`。   
+ `Buffer.from(arrayBuffer[, byteOffset[, length]])` 返回一个与给定的 `ArrayBuffer`
共享所分配内存的新的 `Buffer`。
+ `Buffer.from(buffer)` 返回一个包含给定 `Buffer` 内容副本的新 `Buffer`。
+ `Buffer.alloc(size[, fill[, encoding]])` 返回一个规定大小的“填充了的” `Buffer` 实例。
这个方法可能明显比 `Buffer.allocUnsafe(size)` 慢但是可以确保新的实例不包含旧的敏感的数据。
+ `Buffer.allocUnsafe(size)`, `Buffer.allocUnsafeSlow(size)` 返回一个规定大小的新的 `Buffer`，
但是其内容必须使用 `buf.fill(0)` 或者完整写入来进行初始化。    

如果 `size` 是小于或者等于 `Buffer.poolSize` 的一半，那么 `Buffer.allocUnsafe()` 返回的
实例可能会被分配到一个共享的内部内存池中。`Buffer.allocUnsafeSlow` 返回的实例则拥有不会使用
共享内部内存池。     

### The --zero-fill-buffers command line option

<a  name="part11"></a>    

`--zero-fill-buffers` 可以强制所有新建的 `Buffer` 实例会自动的在创建时用0填充。    

### What makes Buffer.allocUnsafe() and Buffer.allocUnsafeSlow() "unsafe"?

<a name="part12"></a>    

当调用 `Buffer.allocUnsafe()` and `Buffer.allocUnsafeSlow()` 时，分配的内存段是没有初始化
过的。这个设计是为了可以快速分配内存，但是分配的内存上可能包含之前写入的数据。如果使用这样的
内存却没有初始化，那么读取 `Buffer` 时，之前的数据可能会“泄露”。     

## Buffers and Character Encodings

<a name="part2"></a>    

`Buffer` 实例通常用来代表一系列使用 UTF-8, UCS2, Base64 编码的字符或者十六进制编码的数据。   

```javascript
const buf = Buffer.from('hello world', 'ascii');

// Prints: 68656c6c6f20776f726c64
console.log(buf.toString('hex'));

// Prints: aGVsbG8gd29ybGQ=
console.log(buf.toString('base64'));
```   

当前在 Node.js 支持的编码包括：   

+ `'ascii'` - 只支持7 bit 的 ASCII 码。
+ `'utf8'`
+ `'utf16le'` - 2 or 4 字节。小端编码。
+ `'ucs2'` - `'utf16le'` 的同名
+ `'base64'`
+ `'latin1'`
+ `'binary'` - `'latin1'` 的别名
+ `'hex'` - 将每个字节编码为2个十六进制字符。    

## Buffers and TypedArray

<a name="part3"></a>     

`Buffer` 实例同时也是 `Uint8Array` 实例。不过这里与 ES6 中的类型数组有一些微小的区别。例如
`ArrayBuffer#slice()` 会创建一个切片的副本， `Buffer#slice()` 会在 `Buffer` 上创建一个
视图。     

也可以从 `Buffer` 实例上创建新的类型化数组实例，不过有下面需要的事项：   

1. `Buffer` 对象的内存是拷贝到数组中，而不是共享
2. `Buffer`对象的内存被解释为不同元素的数组，而不是目标类型的字节数组。换句话说，
`new Uint32Array(Buffer.from([1, 2, 3, 4]))` 创建一个包含4个元素的 `Uint32Array` ，
元素分别是 `[1,2,3,4]`，而不是一个单一元素的数组 `[0x10203040]` or `[0x40302010]`    

还可以使用类型化数据对象的 `.buffer` 属性来创建一个共享同一片内存的 `Buffer` 实例。    

## Buffers and ES6 iteration

可以使用 `for...of` 语法迭代 `Buffer` 实例：   

```javascript
const buf = Buffer.from([1, 2, 3]);

// Prints:
//   1
//   2
//   3
for (const b of buf) {
  console.log(b);
}
```    

另外，`buf.keys()`,`buf.values()`,`buf.entries()` 也可以用来创建迭代器。    

## Class:Buffer

<a name="class"></a>    

### Class Method: Buffer.alloc(size[,fill[,encoding]])     

+ `size` &lt;integer&gt; 新 `Buffer` 的长度
+ `fill` &lt;string&gt; | &lt;Buffer&gt; | &lt;integer&gt; `Buffer`中的预填充值。默认 `0`
+ `encoding` &lt;string&gt; 如果 `fill` 字符串，这个就是编码。默认 `utf8`    

如果 `fill` 是 `undefined`，那么 `Buffer` 会用0填充。   

```javascript
const buf = Buffer.alloc(5);

// Prints: <Buffer 00 00 00 00 00>
console.log(buf);
```    

如果 `size` 是比 `buffer.kMaxLength` 大或者是比0小，就抛出一个 `RangeError` 错误。    

如果指定了 `fill`，那么 `Buffer` 会调用 `buf.fill(fill)` 来初始化。    

如果 `size` 不为数字会抛出错误。    

### Class Method: Buffer.allocUnsafe(size)    

+ `size` &lt;integer&gt;    

在 `size` 方面的限制同上。    

```javascript
const buf = Buffer.allocUnsafe(10);

// Prints: (contents may vary): <Buffer a0 8b 28 3f 01 00 00 00 50 32>
console.log(buf);

buf.fill(0);

// Prints: <Buffer 00 00 00 00 00 00 00 00 00 00>
console.log(buf);
```     

注意 `Buffer` 模块预先分配了一个内部的 `Buffer` 实例，其大小为 `Buffer.poolSize`，用来
为使用 `Buffer.allocUnsafe()` 且 `size` 小于等于 `Buffer.poolSize` 快速创建的 `Buffer`
的池。     

使用这个预定义的内部内存池是 `Buffer.alloc(size, fill)` 与 `Buffer.allocUnsafe(size).fill(fill)`
两者之间一个关键的不同之处。    

### Class Method: Buffer.allocUnsafeSlow(size)

`size` 限制同上。   

当使用 `Buffer.allocUnsafe()` 分配新的实例时，默认情况下，4KB以下的大小会从一个预分配的
`Buffer` 上切割下来。这允许应用程序避免创建许多单独分配的 `Buffer` 实例的垃圾回收开销。    

然而，如果开发者想要将一小片池中的内存保持一段不定的时间长，就适合使用 `Buffer.allocUnsafeSlow()`
来将相关的 bits 拷贝并创建一个 un-pooled 的实例。这个意思是使用这个方法时，可能先从池
中拷贝 `size` 大小的数据，然后用这些数据去填充一个新分配的 `Buffer` 实例的意思么？   

只有在开发人员在其应用程序中观察到不当的内存保留之后，才应使用 `Buffer.allocUnsafeSlow()`作为最后的手段。    

### Class Method: Buffer.byteLength(string[, encoding])   

+ `string` &lt;string&gt; | &lt;Buffer&gt; | &lt;TypedArray&gt; | &lt;DataView&gt; | &lt;ArrayBuffer&gt; 一个用来计算长度的值
+ `encoding` &lt;string&gt; 如果 `string` 是字符串，编码。默认 `utf8`
+ Returns: &lt;integer&gt; `string` 包含的字节的数量    

返回 `string` 的字节的长度。    

### Class Method: Buffer.compare(buf1, buf2)

+ `buf1` &lt;Buffer&gt; | &lt;Uint8Array&gt;
+ `buf2` &lt;Buffer&gt; | &lt;Uint8Array&gt;    
+ Returns: &lt;integer&gt;    

将 `buf1` 与 `buf2` 进行比较，通常用于排序 `Buffer` 实例的数组。等价于调用 `buf1.compare(buf2)`。   

```javascript
const buf1 = Buffer.from('1234');
const buf2 = Buffer.from('0123');
const arr = [buf1, buf2];

// Prints: [ <Buffer 30 31 32 33>, <Buffer 31 32 33 34> ]
// (This result is equal to: [buf2, buf1])
console.log(arr.sort(Buffer.compare));
```    

### Class Method: Buffer.concat(list[, totalLength])   

+ `list` &lt;Array&gt; 用来拼接的 `Buffer` 或 `Uint8Array` 实例的列表
+ `totalLength` &lt;integer&gt; 拼接时 `list` 中 `Buffer` 实例的总长度
+ Returns: &lt;Buffer&gt;    

返回一个新的 `Buffer`，将 `list` 中所有的 `Buffer` 实例拼接起来的结果。   

如果列表没有元素，如果 `totalLength` 为0，返回一个0宽的 `Buffer`。    

如果 `totalLength` 没有提供，会从 `list` 中的 `Buffer` 实例计算出来，但是这会造成
为了得出长度额外的对数组进行循环，所以如果知道长度最好提供。    

如果最终`list` 中 `Buffer` 的长度超过了 `totalLength`,结果会被删减到 `totalLength` 长度。    

```javascript
const buf1 = Buffer.alloc(10);
const buf2 = Buffer.alloc(14);
const buf3 = Buffer.alloc(18);
const totalLength = buf1.length + buf2.length + buf3.length;

// Prints: 42
console.log(totalLength);

const bufA = Buffer.concat([buf1, buf2, buf3], totalLength);

// Prints: <Buffer 00 00 00 00 ...>
console.log(bufA);

// Prints: 42
console.log(bufA.length);
```   

### Class Method: Buffer.from(array)

+ `array` &lt;Array&gt;   

使用八位字节数组分配一个新的 `Buffer`。   

```javascript
// Creates a new Buffer containing UTF-8 bytes of the string 'buffer'
const buf = Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]);
```    

如果 `array` 不是数组的话会抛出错误。    

### Class Method: Buffer.from(arrayBuffer[, byteOffset[, length]])

+ `arrayBuffer` &lt;ArrayBuffer&gt; 一个 `ArrayBuffer` 或者一个 `TypedArray` 的 `.buffer` 属性
+ `byteOffset` &lt;integer&gt; 暴露的第一个字节的索引，默认为0
+ `length` &lt;integer&gt; 暴露字节的数量。默认 `arrayBuffer.length - byteOffset`    

从 `ArrayBuffer` 上直接创建一个视图，而不用去复制内存。   

如果 `arrayBuffer` 不是 ArrayBuffer 会抛出错误。   

### Class Method: Buffer.from(buffer)

+ `buffer` &lt;Buffer&gt; 一个用来复制数据的 `Buffer`.

从传入的 `buffer` 中拷贝数据到新的 `Buffer` 实例里。    

### Class Method: Buffer.from(string[, encoding])

+ `string` &lt;string&gt; 一个要编码的字符串（这是指将字符串编码为 `Buffer`）
+ `encoding` &lt;string&gt; 字符串的编码方式。默认 `utf8`    

同样类型不对会报错。      

### Class Method: Buffer.isBuffer(obj)

+ `obj` &lt;Object&gt;
+ Returns: &lt;boolean&gt;    

略。   

### Class Method: Buffer.isEncoding(encoding)

+ `encoding` &lt;string&gt; 用来检查的编码名
+ Returns: &lt;boolean&gt;   

注意这个是判断编码方式是否被 Node.js 支持。    

### Class Property: Buffer.poolSize

+ `integer` 默认 8192。    

预分配的内部 `Buffer` 实例的大小，用作池，所以上面提到的默认 4kb 以下用内部池是因为这里
默认是 8KB 吧。     

### buf[index]

这些索引值指定是单个字节，所以合法的范围是 `0x00` and `0xFF`(hex) 或者 `0` and `255`(decimal)。
不是很理解。。。。     

这个操作符是从 `Uint8Array` 中继承的，所以其越界的行为一样 —— 返回 `undefined'`。       

### buf.buffer   

如果 `Buffer` 对象是根据 `ArrayBuffer` 创建的话，那这个属性就引用了这个 `ArrayBuffer`。    

```javascript
const arrayBuffer = new ArrayBuffer(16);
const buffer = Buffer.from(arrayBuffer);

console.log(buffer.buffer === arrayBuffer);
// Prints: true
```   

### buf.compare(target[, targetStart[, targetEnd[, sourceStart[, sourceEnd]]]])

+ `target` &lt;Buffer&gt; | &lt;Uint8Array&gt;
+ `targetStart` &lt;integer&gt; 开始比较的 `target` 的偏移位置，默认 0
+ `targetEnd` &lt;integer&gt; 默认 `target.length`,当 `targetStart` 为 `undefined` 时被忽略。
+ `sourceStart` &lt;integer&gt; 当 `targetStart` 为 `undefined` 时被忽略。默认0
+ `sourceEnd` &lt;integer&gt; 当 `targetStart` 为 `undefined` 时被忽略。默认 `buf.length`   
+ Returns: &lt;integer&gt;   

如果相等返回0，如果 `target` 应该在前面返回1，否则返回 -1。    

### buf.copy(target[, targetStart[, sourceStart[, sourceEnd]]])

+ `target` &lt;Buffer&gt; | &lt;Uint8Array&gt;
+ `targetStart`
+ `sourceStart`
+ `sourceEnd` 当 `sourceStart` 为 `undefined` 时忽略。
+ Returns: &lt;number&gt; 拷贝的字节数     

注意啊，这个是从 `buf` 将数据拷贝到 `target`,即使两者内存有重叠。    

```javascript
const buf1 = Buffer.allocUnsafe(26);
const buf2 = Buffer.allocUnsafe(26).fill('!');

for (let i = 0; i < 26; i++) {
  // 97 is the decimal ASCII value for 'a'
  buf1[i] = i + 97;
}

buf1.copy(buf2, 8, 16, 20);

// Prints: !!!!!!!!qrst!!!!!!!!!!!!!
console.log(buf2.toString('ascii', 0, 25));
```    

### buf.entries()

迭代器是 `[index, byte]` 对。    

```javascript
const buf = Buffer.from('buffer');

// Prints:
//   [0, 98]
//   [1, 117]
//   [2, 102]
//   [3, 102]
//   [4, 101]
//   [5, 114]
for (const pair of buf.entries()) {
  console.log(pair);
}
```    

### buf.equals(otherBuffer)

+ `otherBuffer` &lt;Buffer&gt; | &lt;Uint8Array&gt;
+ Returns: &lt;boolean&gt;

略。    

### buf.fill(value[, offset[, end]][, encoding])

+ `value` &lt;string&gt; | &lt;Buffer&gt; | &lt;integer&gt;
+ `offset` &lt;integer&gt;
+ `end` &lt;integer&gt;
+ `encoding` 只有 `value` 是字符串才有用
+ Returns: &lt;Buffer&gt;    

### buf.includes(value[, byteOffset][, encoding])

+ `value` &lt;string&gt; | &lt;Buffer&gt; | &lt;integer&gt;
+ `byteOffset` &lt;integer&gt;
+ `encoding` &lt;string&gt; 如果 `string` 为字符串，默认 `'utf8'`
+ Returns: &lt;boolean&gt; 找到就返回 `true`    

等价于 `buf.indexOf() !== -1`     

### buf.indexOf(value[, byteOffset][, encoding])

+ Returns: 找到就返回第一次出现的索引，否则就返回 -1   

如果 `value` 是空字符串或者空的 `Buffer`，并且 `byteOffset` 小于 `buf.length`，那么就
返回 `byteOffset`。   

### buf.keys()  

略

### buf.lastIndexOf(value[, byteOffset][, encoding])

略

### buf.length

略

### buf.slice([start[,end]])

返回引用与原始内存相同的内存的新 `Buffer`。

### buf.toJSON()

+ Returns: &lt;Object&gt;   

```javascript
const buf = Buffer.from([0x1, 0x2, 0x3, 0x4, 0x5]);
const json = JSON.stringify(buf);

// Prints: {"type":"Buffer","data":[1,2,3,4,5]}
console.log(json);

const copy = JSON.parse(json, (key, value) => {
  return value && value.type === 'Buffer' ?
    Buffer.from(value.data) :
    value;
});

// Prints: <Buffer 01 02 03 04 05>
console.log(copy);
```    

### buf.toString([encoding[, start[, end]]])

略。   

### buf.values()

略。    

### buf.write(string[, offset[, length]][, encoding])

+ Returns: &lt;integer&gt; 写入的字节数量    

如果 `buf` 没有足够的空间去放 `string`，那么只有一部分的字符串会被写入。

## buffer.kMaxLength

单独的 `Buffer` 实例所允许的最大长度。   

在32位系统上，值是 `(2^30) -1`(~1GB),在64位上，值是 `(2^31)-1`(~2GB)。    

注意这个属性是 `buffer` 模块上的属性，不是实例或者类上的属性。    

## 剩下的都是一些与类型化数组相关的内容，先略了。
