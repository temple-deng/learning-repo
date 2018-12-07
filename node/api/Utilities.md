# Util

<!-- TOC -->

- [Util](#util)
  - [util.callbackify(original)](#utilcallbackifyoriginal)
  - [util.debuglog(section)](#utildebuglogsection)
  - [util.deprecate(fn, msg[,code])](#utildeprecatefn-msgcode)
  - [util.format(format[,...args])](#utilformatformatargs)
  - [util.formatWithOptions(inspectOptions, format[,...args])](#utilformatwithoptionsinspectoptions-formatargs)
  - [util.getSystemErrorName(err)](#utilgetsystemerrornameerr)
  - [util.inspect(object[,options]), util.inspect(object[,showHidden[,depth[,colors]]])](#utilinspectobjectoptions-utilinspectobjectshowhiddendepthcolors)
    - [自定义对象的 inspection 函数](#自定义对象的-inspection-函数)
    - [util.inspect.defaultOptions](#utilinspectdefaultoptions)
  - [util.isDeepStrictEqual(val1, val2)](#utilisdeepstrictequalval1-val2)
  - [util.promisify(original)](#utilpromisifyoriginal)
  - [Class: util.TextDecoder](#class-utiltextdecoder)
    - [new TextDecoder([encoding[,options]])](#new-textdecoderencodingoptions)
    - [textDecoder.decode([input[,options]])](#textdecoderdecodeinputoptions)
    - [textDecoder.encoding, textDecoder.fatal, textDecoder.ignoreBOM](#textdecoderencoding-textdecoderfatal-textdecoderignorebom)
  - [Class: util.TextEncoder](#class-utiltextencoder)
    - [textEncoder.encode([input])](#textencoderencodeinput)
    - [textEncoder.encodeing](#textencoderencodeing)
  - [util.types](#utiltypes)

<!-- /TOC -->

`util` 模块的设计目的主要是满足 Node.js 内部 APIs 的需要。不过其中很多方法对开发者
也是有用的。    

```js
const util = require('util');
```    

## util.callbackify(original)

+ `original` Function 一个 `async` 函数
+ Returns: Function, 回调风格的函数    

接受一个 `async` 函数（或者一个返回 Promise 的函数）做参数，并返回一个回调风格的函数，
该函数第一个参数为错误参数：    

```js
const util = require('util');

async function fn() {
  return 'hello world';
}

const callbackFunction = util.callbackify(fn);

callbackFunction((err, ret) => {
  if (err) throw err;
  console.log(ret);
});
```    

由于 `null` 在回调的第一个参数上有特殊的意义。因此如果被包装的函数使用一个假值作为 reject
的原因，那这个值会用 `Error` 包裹，原始值是在 Error 实例的 `reason` 属性上。   

```js
function fn() {
  // 这里其实是指我们就想 reject null
  // 按常规办法我们在回调中就无法判断出到底是 reject null 还是没错
  return Promise.reject(null);
}

const callbackFunction = util.callbackify(fn);

callbackFunction((err, ret) => {
  // 注意上面说假值才会包装，那如果 reject 是一个真值，那应该就不用这么复杂的判断
  err && err.hasOwnProperty('reason') && err.reason === null;
});
```     

## util.debuglog(section)

+ `section` string, 用来识别创建了 `debuglog` 函数的应用部分
+ Returns: Function, 日志函数    

这个方法用来创建一个函数，基于 `NODE_DEBUG` 条件性的将调试信息写入到 stderr。如果
`section` 出现在 NODE_DEBUG 中，那么返回函数的行为类似 `console.error()`，否则
这个函数什么都不做。    

```js
const util = require('util');
const debuglog = util.debuglog('foo');

debuglog('hello from foo [%d]', 123);
```    

如果目前 `NODE_DEBUG=foo`，则输出：   

```
FOO 3245: hello from foo [123]
```    

3245 是进程 ID。    

## util.deprecate(fn, msg[,code])

+ `fn` Function 被弃用的函数
+ `msg` string, 当调用弃用函数时的警告信息
+ `code` string, 一段弃用代码
+ Returns: Function 包装过的弃用函数，会发出警告

略。   

## util.format(format[,...args])

+ `%s` - string
+ `%d` - Number or BigInt
+ `%i` - Integer or BigInt
+ `%f` - 浮点
+ `%j` - JSON
+ `%o` - Object。结果类似于使用 `{ showHidden: true, showProxy: true }` 调用 `util.inspect()`
+ `%O` - Object。同上，但不带选项

多个参数之间用空格分隔。    

## util.formatWithOptions(inspectOptions, format[,...args])

等同于 `util.format()` 除了多了一个传给 `util.inspect()` 的参数。   

## util.getSystemErrorName(err)

+ `err`: number
+ Returns: string

返回 Node.js API 抛出的错误的数字代码的字符串名称。这些数字到名字的映射式平台相关的。   

```js
fs.access('file/that/does/not/exist', (err) => {
  const name = util.getSystemErrorName(err.errno);
  console.error(name);  // ENOENT
});
```    

## util.inspect(object[,options]), util.inspect(object[,showHidden[,depth[,colors]]])

+ `options`
  - `showHidden`
  - `depth` 默认 20
  - `colors`
  - `customInspect` boolean, 如果为 `false`，则不会调用 `[util.inspect.custom](depth, opts)`
  默认为 `true`
  - `showProxy`
  - `maxArrayLength` 设置为 `null` 或 `Infinity` 展示所有的元素，`0` 或负值不展示任何元素，
  默认 100
  - `breakLength` 断行文本的长度，默认 60
  - `compact`
  - `sorted`    

### 自定义对象的 inspection 函数

```js
const util = require('util');

class Box {
  constructor(value) {
    this.value = value;
  }

  [util.inspect.custom](depth, options) {
    if (depth < 0) {
      return options.stylize('[Box]', 'special');
    }

    const newOptions = Object.assign({}, options, {
      depth: options.depth === null ? null : options.depth - 1
    });

    // Five space padding because that's the size of "Box< ".
    const padding = ' '.repeat(5);
    const inner = util.inspect(this.value, newOptions)
                      .replace(/\n/g, `\n${padding}`);
    return `${options.stylize('Box', 'special')}< ${inner} >`;
  }
}

const box = new Box(true);

util.inspect(box);
// Returns: "Box< true >"
```    

### util.inspect.defaultOptions

```js
const util = require('util');
const arr = Array(101).fill(0);

console.log(arr); // logs the truncated array
util.inspect.defaultOptions.maxArrayLength = null;
console.log(arr); // logs the full array
```    

## util.isDeepStrictEqual(val1, val2)

略。   

## util.promisify(original)

```js
const util = require('util');
const fs = require('fs');

const stat = util.promisify(fs.stat);
stat('.').then((stats) => {
  // Do something with `stats`
}).catch((error) => {
  // Handle the error.
});
```    

如果有 `original[util.promisify.custom]` 属性存在，那就用这个属性的返回值。   

## Class: util.TextDecoder

对 WHATWG `TextDecoder` 标准的实现：   

```js
const decoder = new TextDecoder('shift_jis');

let string = '';
let buffer;
while(buffer = getNextChunkSomehow()) {
  string += decoder.decode(buffer, {stream: true});
}

string += decoder.decode();   // end-of-stream
```   

### new TextDecoder([encoding[,options]])

+ `encoding` string, 实例支持的编码，默认 `utf-8`
+ `options`
  - `fatal` boolean
  - `ignoreBOM`

创建一个新的 `TextDecoder` 实例。    

### textDecoder.decode([input[,options]])

+ `input` ArrayBuffer | DataView | TypedArray 包含编码数据的对象实例
+ `options`
  - `stream` 如果期望有额外的数据 chunks 设置为`true`，默认 `false`
+ Returns: string

将 `input` 解码成字符串并返回。    

### textDecoder.encoding, textDecoder.fatal, textDecoder.ignoreBOM

略。   

## Class: util.TextEncoder

### textEncoder.encode([input])

将 utf-8 编码的字符串数据保存到一个 `Uint8Array` 中。   

### textEncoder.encodeing

总是 `utf-8`，那岂不是只能编码 utf-8 数据。    

## util.types

+ `util.types.isAnyArrayBuffer(value)`
+ `util.types.isArgumentsObject(value)`
+ `util.types.isArrayBuffer(value)`
+ `util.types.isAsyncFunction(value)`
+ `util.types.isBigInt64Array(value)`
+ `util.types.isBigUint64Array(value)`
+ `util.types.isBooleanObject(value)`
+ `util.types.isBoxedPrimitive(value)`
+ `util.types.isDataView(value)`
+ `util.types.isDate(value)`
+ `util.types.isExternal(value)`: value 有原生的 `External` 值
+ `util.types.isFloat32Array(value)`
+ `util.types.isFloat64Array(value)`
+ `util.types.isGeneratorFunction(value)`
+ `util.types.isGeneratorObject(value)`
+ `util.types.isInt8Array(value)`
+ `util.types.isInt16Array(value)`
+ `util.types.isInt32Array(value)`
+ `util.types.isMap(value)`
+ `util.types.isMapIterator(value)`
+ `util.types.isModuleNamespaceObject(value)`
+ `util.types.isNativeError(value)`
+ `util.types.isNumberObject(value)`
+ `util.types.isPromise(value)`
+ `util.types.isProxy(value)`
+ `util.types.isRegExp(value)`
+ `util.types.isSet(value)`
+ `util.types.isSetIterator(value)`
+ `util.types.isSharedArrayBuffer(value)`
+ `util.types.isStringObject(value)`
+ `util.types.isSymbolObject(value)`
+ `util.types.isTypedArray(value)`
+ `util.types.isUint8Array(value)`
+ `util.types.isUint8ClampedArray(value)`
+ `util.types.isUnit16Array(value)`
+ `util.types.isUnit32Array(value)`
+ `util.types.isWeakMap(value)`
+ `util.types.isWeakSet(value)`


