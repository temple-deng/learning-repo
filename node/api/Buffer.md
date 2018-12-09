# Buffer

<!-- TOC -->

- [Buffer](#buffer)
  - [Buffer.from(), Buffer.alloc(), Buffer.allocUnsafe()](#bufferfrom-bufferalloc-bufferallocunsafe)
    - [--zero-fill-buffers](#--zero-fill-buffers)
  - [Buffer 和字符编码](#buffer-和字符编码)
  - [Buffer 和 TypedArray](#buffer-和-typedarray)
  - [遍历 Buffer](#遍历-buffer)
  - [Class: Buffer](#class-buffer)
    - [Class Method: Buffer.alloc(size[, fill[, encoding]])](#class-method-bufferallocsize-fill-encoding)
    - [Class Method: Buffer.allocUnsafe(size)](#class-method-bufferallocunsafesize)
    - [Class Method: Buffer.allocUnsafeSlow(size)](#class-method-bufferallocunsafeslowsize)
    - [Class Method: Buffer.byteLength(string[, encoding])](#class-method-bufferbytelengthstring-encoding)
    - [Class Method: Buffer.compare(buf1, buf2)](#class-method-buffercomparebuf1-buf2)
    - [Class Method: Buffer.concat(list[, totalLength])](#class-method-bufferconcatlist-totallength)
    - [Class Method: Buffer.from(array)](#class-method-bufferfromarray)
    - [Class Method: Buffer.from(arrayBuffer[, byteOffset[, length]])](#class-method-bufferfromarraybuffer-byteoffset-length)
    - [Class Method: Buffer.from(buffer)](#class-method-bufferfrombuffer)
    - [Class Method: Buffer.from(string[, encoding])](#class-method-bufferfromstring-encoding)
    - [Class Method: Buffer.from(object[,offsetOrEncoding[,length]])](#class-method-bufferfromobjectoffsetorencodinglength)
    - [Class Method: Buffer.isBuffer(obj)](#class-method-bufferisbufferobj)
    - [Class Method: Buffer.isEncoding(encoding)](#class-method-bufferisencodingencoding)
    - [Class Property: Buffer.poolSize](#class-property-bufferpoolsize)
    - [buf[index]](#bufindex)
    - [buf.buffer](#bufbuffer)
    - [buf.byteOffset](#bufbyteoffset)
    - [buf.compare(target[, targetStart[, targetEnd[, sourceStart[, sourceEnd]]]])](#bufcomparetarget-targetstart-targetend-sourcestart-sourceend)
    - [buf.copy(target[, targetStart[, sourceStart[, sourceEnd]]])](#bufcopytarget-targetstart-sourcestart-sourceend)
    - [buf.entries(), buf.keys(), buf.values()](#bufentries-bufkeys-bufvalues)
    - [buf.equals(otherBuffer)](#bufequalsotherbuffer)
    - [buf.fill(value[, offset[, end]][, encoding])](#buffillvalue-offset-end-encoding)
    - [buf.includes(value[, byteOffset][, encoding])](#bufincludesvalue-byteoffset-encoding)
    - [buf.indexOf(value[, byteOffset][, encoding]), buf.lastIndexOf(value[, byteOffset][, encoding])](#bufindexofvalue-byteoffset-encoding-buflastindexofvalue-byteoffset-encoding)
    - [buf.length](#buflength)
    - [读的方法](#读的方法)
    - [buf.slice([start[, end]])](#bufslicestart-end)
    - [buf.swap16()](#bufswap16)
    - [buf.swap32(), buf.swap64()](#bufswap32-bufswap64)
    - [buf.toJSON()](#buftojson)
    - [buf.toString([encoding[,start[,end]]])](#buftostringencodingstartend)
    - [buf.write(string[,offset[,length]][,encoding])](#bufwritestringoffsetlengthencoding)
    - [写的方法](#写的方法)

<!-- /TOC -->

`Buffer` 类用一种优化更好的，并且更适合 Node 的方式实现了 Uint8Array API。   

`Buffer` 类的实例与整型数组类似，但是是一块在堆上分配的，固定大小的内存区。`Buffer` 的
大小是在创建时声明好的，并且不可再修改。   

```js
// 创建一个长度为 10 的用 0 填充的 Buffer
const buf1 = Buffer.alloc(10);

// 创建一个长度为 10 的用 1 填充的 Buffer
const buf2 = Buffer.alloc(10, 1);

// 创建一个长度为 10 的未初始化内容的 Buffer
// 这个方法的速度要比 Buffer.alloc() 要快
// 但是返回的实例可能包含旧的数据，需要用 fill() 或者 write() 方法覆盖内容
const buf3 = Buffer.allocUnsafe(10);

// 创建一个包含数据 [0x1, 0x2, 0x3] 的 Buffer
const buf4 = Buffer.from([1, 2, 3]);

// Creates a Buffer containing UTF-8 bytes [0x74, 0xc3, 0xa9, 0x73, 0x74].
const buf5 = Buffer.from('tést');

// Creates a Buffer containing Latin-1 bytes [0x74, 0xe9, 0x73, 0x74].
const buf6 = Buffer.from('tést', 'latin1');
```    

## Buffer.from(), Buffer.alloc(), Buffer.allocUnsafe()

+ `Buffer.from(array)` 返回一个包含八进制数据副本的 `Buffer` 实例
+ `Buffer.from(arrayBuffer[, byteOffset[, length]])` 返回一个与 ArrayBuffer 共享内存
的 `Buffer` 实例
+ `Buffer.from(buffer)` 返回一个包含数据副本的实例
+ `Buffer.from(string[, encoding])` 返回一个包含字符串副本的实例
+ `Buffer.alloc(size[, fill[, encoding]])`
+ `Buffer.allocUnsafe(size)`, `Buffer.allocUnsafeSlow(size)`    

使用 `Buffer.allocUnsafe()` 创建的实例，如果 `size` 小于等于 `Buffer.poolSize` 的一半，
则这片内存区是从共享内部内存池中分配的，`Buffer.allocUnsafeSlow()` 则从不会返回池中的
内存区。   

### --zero-fill-buffers

`--zero-fill-buffer` 会造成所有新分配的 `Buffer` 实例在默认创建时都用 0 填充，包括
`Buffer.allocUnsafe()`, `Buffer.allocUnsafeSlow()`。不过这样的话，性能就不好了。   

## Buffer 和字符编码

当将字符串数据存储到 Buffer 中，或者从 Buffer 中导出字符串数据时，可以指定字符编码。   

当前支持的字符编码包括：   

+ `ascii` - 7 位的 ASCII 数据，最高位是 0
+ `utf8` - 多字节编码的 Unicode 字符。
+ `utf16le`, `ucs2` - 2 或 4 字节小端编码字符
+ `base64`
+ `latin1`, `binary` - 单字节编码字符
+ `hex`   

## Buffer 和 TypedArray

`Buffer` 实例也是 `Uint8Array` 实例。然而，在实现上有些微小的不同。例如 `ArrayBuffer#slice()`
会创建一份切片的副本，`Buffer#slice()` 只是创建一份视图。    

可以从 `Buffer` 实例创建一个 `TypedArray` 实例，但是要注意以下的陷阱：   

1. `Buffer` 对象的内存是复制到 `TypedArray` 中，而不是共享
2. `Buffer` 对象内存是作为不同的数组元素解释的，而 `new Uint32Array(Buffer.from([1,2,3,4]))`
创建一个包含 4 个元素的 `Uint32Array`，分别是 `[1,2,3,4]`，而不是一个包含 `[0x10203040]`
或者 `[0x40302010]` 单个元素的数组。     

```js
const arr = new Uint16Array(2);

arr[0] = 5000;
arr[1] = 4000;

// Copies the contents of `arr`
const buf1 = Buffer.from(arr);
// Shares memory with `arr`
const buf2 = Buffer.from(arr.buffer);
```   

## 遍历 Buffer

`Buffer` 数量可以使用 `for...of` 遍历。    

另外 `buf.values()`, `buf.keys()`, `buf.entries()` 可以创建实例的迭代器。   

## Class: Buffer

### Class Method: Buffer.alloc(size[, fill[, encoding]])

+ `fill` stirng | Buffer | integer 默认 `0`
+ `encoding` string 默认 `utf8`    

如果指定了 `fill` 参数，分配的 `Buffer` 实例会用 `buf.fill(fill)` 初始化。    

### Class Method: Buffer.allocUnsafe(size)

Buffer 模块会预分配一个 `Buffer.poolSize` 大小的内部的 Buffer 实例，这个实例用来实现
`Buffer.allocUnsafe()` 的快速分配，当 size 小于等于 `Buffer.poolSize` 的一半时。    

### Class Method: Buffer.allocUnsafeSlow(size)

略。   

### Class Method: Buffer.byteLength(string[, encoding])

+ `string` string | Buffer | TypedArray | DataView | ArrayBuffer | SharedArrayBuffer
用来计算长度的值
+ `encoding` string 如果 `string` 是字符串，那这个就是字符串的编码
+ Returns: integer `string` 包含的字节数量    

### Class Method: Buffer.compare(buf1, buf2)

+ Returns: integer    

等价于 `buf1.compare(buf2)`    

```js
const buf1 = Buffer.from('1234');
const buf2 = Buffer.from('0123');
const arr = [buf1, buf2];

console.log(arr.sort(Buffer.compare));
// Prints: [ <Buffer 30 31 32 32>, <Buffer 31 32 33 34> ]
```    

### Class Method: Buffer.concat(list[, totalLength])

+ `list` Buffer\[\] | Uint8Array\[\], 用来拼接的实例的列表
+ Returns: Buffer

返回一个新的实例，结果是 list 中所有实例拼接起来的结果。   

如果 list 为空，或者 `totalLength` 为 0，那么就创建一个大小为 0 的实例。    

如果没有提供 `totalLength` 的话，函数会从 `list` 中计算长度，为了计算长度，会增加一次额外的循环。
所以如果已经知道长度的话，最好提供这个参数来加快速度。   

如果最终 `list` 中的实例的长度超过了 `totalLength`，那就裁切。    

### Class Method: Buffer.from(array)

+ `array` integer\[\]

### Class Method: Buffer.from(arrayBuffer[, byteOffset[, length]])

+ `arrayBuffer` ArrayBuffer | SharedArrayBuffer 一个对象实例，或者是 `TypedArray`
实例的 `.buffer` 属性     

### Class Method: Buffer.from(buffer)

+ `buffer` Buffer | Uint8Array

### Class Method: Buffer.from(string[, encoding])

略。   

### Class Method: Buffer.from(object[,offsetOrEncoding[,length]])

+ `object` Object 一个提供了 `Symbol.toPrimitive` 或者 `valueOf()` 的对象
+ `offsetOrEncoding` number | string 取决于 `object.valueOf()` 或 `object[Symbol.toPrimitive]()`
的返回值，字节的偏移量或者编码。    
+ `length`     

### Class Method: Buffer.isBuffer(obj)

略。   

### Class Method: Buffer.isEncoding(encoding)

如果 `encoding` 包含支持的字符编码，返回 `true`。    

### Class Property: Buffer.poolSize

默认 8192.     

### buf[index]

略。   

### buf.buffer

+ ArrayBuffer 基于创建 `Buffer` 对象的方式，可能是其底层的 `ArrayBuffer` 对象。    

### buf.byteOffset

略。    

### buf.compare(target[, targetStart[, targetEnd[, sourceStart[, sourceEnd]]]])

+ Returns: integer

+ 如果 `target` 在 `buf` 之前，返回 1
+ 如果 `target` 在 `buf` 之后，返回 -1    

### buf.copy(target[, targetStart[, sourceStart[, sourceEnd]]])

+ Returns: 拷贝的字节数量    

从 `buf` 中拷贝数据到 `target` 中。    

### buf.entries(), buf.keys(), buf.values()

略。   

### buf.equals(otherBuffer)

略。   

### buf.fill(value[, offset[, end]][, encoding])

+ `value` string | Buffer | integer

### buf.includes(value[, byteOffset][, encoding])

+ `value` string | Buffer | integer

等价于 `buf.indexOf() !== -1`    

### buf.indexOf(value[, byteOffset][, encoding]), buf.lastIndexOf(value[, byteOffset][, encoding])

略。    

### buf.length

略。   

### 读的方法

+ `buf.readDoubleBE(offset)`,`buf.readDoubleLE(offset)`
  - `offset` 在开始读之前跳过的字节数，必须满足 `0 <= offset <= buf.length - 8`
  - Returns: number
  - 返回一个 64 位的 double 数
+ `buf.readFloatBE(offset)`, `buf.readFloatLE(offset)` 32 位浮点数
+ `buf.readInt8(offset)`
+ `buf.readInt16BE(offset)`, `buf.readInt16LE(offset)`
+ `buf.readInt32BE(offset)`, `buf.readInt32LE(offset)`
+ `buf.readIntBE(offset, byteLength)`, `buf.readIntLE(offset, byteLength)` 以补码
方式读取
+ `buf.readUint8(offset)`
+ `buf.readUint16BE(offset)`, `buf.readUint16LE(offset)`
+ `buf.readUint32BE(offset)`, `buf.readUint32LE(offset)`
+ `buf.readUintBE(offset, byteLength)`, `buf.readUintLE(offset, byteLength)`

### buf.slice([start[, end]])

略。   

### buf.swap16()

+ Returns Buffer

将 `buf` 以 16 位无符号整型解释，并原地交换字节顺序。如果 `buf.length` 不会 2 的倍数的
话抛出异常：   

```js
const buf1 = Buffer.from([0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8]);

console.log(buf1);
// Prints: <Buffer 01 02 03 04 05 06 07 08>

buf1.swap16();

console.log(buf1);
// Prints: <Buffer 02 01 04 03 06 05 08 07>

const buf2 = Buffer.from([0x1, 0x2, 0x3]);

buf2.swap16();
// Throws ERR_INVALID_BUFFER_SIZE
```    

其实就是方便大小端转换。   

### buf.swap32(), buf.swap64()

略。    

### buf.toJSON()

+ Returns: Object

### buf.toString([encoding[,start[,end]]])

略。   

### buf.write(string[,offset[,length]][,encoding])

略。   

### 写的方法

+ `buf.writeDoubleBE(value, offset)` 剩下的和读的大致一样，就是多个 value 参数

