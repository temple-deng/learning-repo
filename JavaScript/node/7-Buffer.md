# Buffer

## 1. 概述

Buffer对象就是为了解决这个问题而设计的。它是一个构造函数，生成的实例代表了V8引擎分配的一段内存，是一个类似数组的对象，成员都为0到255的整数值，即一个8位的字节。  

`Buffer` 的 size 是创建 `Buffer` 是指定好的，并且不能被重新修改长度。  

```javascript
// 创建1个长度为10个字节的Buffer，成员均为0
const buf1 = Buffer.alloc(10);

// 创建1个长度为10个字节的Buffer,成员为 0x1
const buf2 = Buffer.alloc(10, 1);

// 创建一个未初始化成员值的10个字节长的buffer
// This is faster than calling Buffer.alloc() but the returned
// Buffer instance might contain old data that needs to be
// overwritten using either fill() or write().
const buf3 = Buffer.allocUnsafe(10);

// Creates a Buffer containing [0x1, 0x2, 0x3].
const buf4 = Buffer.from([1, 2, 3]);

// Creates a Buffer containing UTF-8 bytes [0x74, 0xc3, 0xa9, 0x73, 0x74].
const buf5 = Buffer.from('tést');

// Creates a Buffer containing Latin-1 bytes [0x74, 0xe9, 0x73, 0x74].
const buf6 = Buffer.from('tést', 'latin-1');
```  


### 1.1 `Buffer.from(), Buffer.alloc(), and Buffer.allocUnsafe()`  

+ `Buffer.from(array)` 返回一个包含所提供八位字节副本的新`Buffer`。
+ `Buffer.from(arrayBuffer[, byteOffset [,length]])` 返回一个与给定的ArrayBuffer共享相同的分配内存的新`Buffer`
+ `Buffer.from(buffer)` 返回一个包含给定`Buffer`内容副本的新`Buffer`。
+ `Buffer.from(string[, encoding])` 返回一个包含给定字符串副本的新`Buffer`。  
+ `Buffer.alloc(size[, fill[, encoding]])` 返回一个指定长度了的 `Buffer` 实例。这个方法可能会比 `Buffer.allocUnsafe(size)` 慢但是会确保新创建的`Buffer`实例不包含内存上的旧数据。  
+ `Buffer.allocUnsafe(size)` `Buffer.allocUnsafeSlow(size)` 返回一个给定长度的 `Buffer`，内容可以用 `buf.fill(0)` 初始化或者被之前的数据占据了。  

`Buffer.allocUnsafe()` 返回的 `Buffer` 实例如果大小小于或等于一半`Buffer.poolSize`，则可以从共享内部存储池中分配。  


### 1.2 buffer和字符编码

`Buffer`实例通常用于表示编码字符的序列，例如UTF-8，UCS2，Base64或甚至hex编码数据。可以使用显式字符编码在`Buffer`实例和普通JavaScript字符串之间来回转换。  

当前支持的字符编码有：  

`ascii, utf8, utf16le, ucs2, base64, latin1, binary, hex`。  


### 1.3 Buffer 和类型化数组

`Buffer` 实例同时也是 `Uint8Array` 实例。然而，这里还是与 ES6 中对类型化数组的定义有些许不兼容。例如， `ArrayBuffer#slice()` 创建一份剪切部分的副本，而`Buffer#slice()` 是对以存在的 `Buffer` 创建了一个视图。  

我们也可以从一个 `Buffer` 上创建一个类型化数组实例，但是有下面两点需要注意：  

  1. `Buffer` 对象的内存是复制给了类型化数组，而不是共享。
  2. `Buffer` 对象的内存区是被解释为一系列不同的元素，而且也不是作为目标类型的字节数组。这意味着， `new Unit32Array(Buffer.from([1,2,3,4]))` 创建了一个包含4个元素的 `Uint32Array`，值分别是 `[1,2,3,4]`,而不是一个单一元素如 `[0x1020304]` 或者 `[0x4030201]`。  



## 2. 类方法

### 2.1 Buffer.byteLength(string[, encoding])

+ `string` : `<string>` | `<Buffer>` | `<TypedArray>` | `<DataView>` | `<ArrayBuffer>` 用来计算长度的值。
+ `encoding` : `<string>` 如果 `string` 参数是字符串，这个参数就是其编码，默认为 `'utf8'`。
+ Returns : `<integer>` `string` 参数的字节长度。  

这个与 `String.prototype.length` 不同在 `String.prototype.length` 返回的是字符串的字符的数量（其实是16位值的数量），这个方法返回字符串的字节长度。  


### 2.1 Buffer.compare(buf1, buf2)  

+ Returns : `<integer>`

通常将buf1与buf2进行比较，以排序Buffer实例的数组。等价于调用 `buf1.compare(buf2)`。  

```javascript
const buf1 = Buffer.from('1234');
const buf2 = Buffer.from('0123');
const arr = [buf1, buf2];

// Prints: [ <Buffer 30 31 32 33>, <Buffer 31 32 33 34> ]
// (This result is equal to: [buf2, buf1])
console.log(arr.sort(Buffer.compare));
```  
