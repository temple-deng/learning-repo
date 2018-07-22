# Stream

## 1. 流的类型

Node.js 中有4种基本的流类型：

  + `Readable`：可读流（例如 `fs.createReadStream()`）。  
  + `Writable`：可写流（例如 `fs.createWriteStream()`）。  
  + `Duplex`：双向可读可写数据流（如 `nex.Socket`）。
  + `Transform`：可以修改的双向数据流，或者在数据写入和读取时转换数据（例如 `zlib.createDeflate()`）。  

### 1.1 对象模式（`Object Mode`）

Node.js APIs 生成的所有流都只能在字符串和 Buffer 对象上操作。然而在其他js值的类型上操作流也还是可能的（但是 `null` 会引发异常）。这样的流操作通常被认为“对象模式”。  

Stream 实例可以通过在流创建时使用 `objectMode` 选项转换为对象模式。但是尝试将一个已存在的流转换为对象模式是不安全的。  


### 1.2 Buffering

可写流与可读流都可以将数据存储在一个可以分别使用 `writable._writableState.getBuffer()` 或者 `readable._readableState.buffer` 检索的内部缓存区上。  

可缓存的数据的总量取决于传入流构造函数的 `highWaterMark` 选项。对于正常的流来说，这个选项指明了字节的总量。对于对象模式的流来说，这个选项说明了对象的数量。  

当流的实现调用 `stream.push(chunk)` 时数据会缓存到可读流中。如果流的消费者没有调用 `stream.read()`，数据就会一直处于内部队列中直到其被消费。  

一旦内部可读缓存区数据量达到了 `highWaterMark` 指定的阈值，这个流就会暂时停止从地城资源读取数据直到当前缓存的数据被消费（即，流会停止调用内部的用来填充读缓存区的`readable._read()` 方法）。  

当重复的调用 `writable.write(chunk)` 方法时数据会缓存在可写流中。当内部写缓冲区的总大小低于`highWaterMark`设置的阈值时，调用 `writable.write()` 会返回 `true`。一旦等于或超出阈值，就返回`false`。  

`stream.pipe()` 方法是一个重要的流 API,用来限制缓存的数据在一个可接受的水平，从而使不同速度的数据源及目的地不会压垮可用的内存。  

双向流及转换流都是既可读又可写的，每一个都维护了两个分离的内部缓存区分别用来读写，允许每一方独立于另一方操作，同时保持适当和有效的数据流。例如，`net.Socket`实例就是双向流，可读的一边允许消费从套接字接收到
的数据，可写的一边允许将数据写入套接字。  


## 2. 可写流

可写流是对数据要写入的目的地的一种抽象。  

可写流的例子包括：  

  + 客户端的 HTTP 请求
  + 服务器端的 HTTP 响应
  + fs 可写流
  + zlib流
  + crypto 流
  + TCP 套接字
  + 子进程标准输入
  + `process.stdout, process.stderr`

所有可写流都实现了`stream.Writable`类中定义的接口。  

```javascript
const myStream = getWritableStreamSomehow();
myStream.write('some data');
myStream.write('some more data');
myStream.end('done writing data');
```  

### 2.1 class: stream.Writable

#### 'close' 事件

`'close'` 事件会在流以及其底层资源关闭后触发。这个事件表明不会再有其他的事件触发了。  

#### 'drain' 事件

`writable.write(chunk)`返回`false`以后，当缓存数据全部写入完成，可以继续写入时，会触发`'drain'`事件，表示缓存空了。  

#### 'error' 事件

当写入数据发生错误时触发。回调函数接受一个 `Error` 实例作为参数。  

#### 'finish'事件

`'finish'` 事件在调用 `stream.end()` 事件后，并且底层系统的所有缓存数据都已经释放时触发。  

#### 'pipe' 事件

+ `src` : `<stream.Readable>`  

`'pipe'` 事件会在一个可读流调用 `stream.pipe()` 方法，将数据流导向写入目的地时触发。  

#### 'unpipe' 事件

+ `src` : `<Readable Stream>`

当在可读流上调用 `stream.unpipe()` 方法，将可写数据流移出写入目的地时触发。  



### 2.2 方法

#### writable.cork()

这个方法强制将所有写入的数据缓存在内容中。被缓存的数据会在调用 `stream.uncork()` 或者 `stream.end()` 时释放。  

这个方法主要的意图是避免出现在将许多小数据块写入流中时不会在内部缓存中创建备份而降低性能的场景。在这种情况下，实现了`writable._writev()`方法的流的实现可以以更优化的方式执行缓冲写入。  

#### writable.end([chunk][,encoding][,callback])

+ `chunk` : `<string>` | `<Buffer>` | `<any>` 可选的要写入的数据。对于非对象模式的流，`chunk` 必须是字符串或者 `Buffer`。对于对象模式的流， `chunk`可以是除`null`以外的任意JS值。  
+ `encoding` : `<string>` 当 `chunk` 是字符串时的编码方式。  
+ `callback` : `<Function>`

调用这个方法就表明不会再有数据写入流中。回调函数是作为一个 `finish` 事件的监听器。  


#### writable.setDefaultEncoding(encoding)  

+ `encoding` : `<string>`
+ Returns：`this`

为可写流设定默认编码方式。  

#### writable.uncork()

这个方法会释放从 `stream.cork()` 后缓存的所有数据。  

当使用这个方法时推荐在 `process.nextTick()` 中延迟调用。  

如果 `cork()` 方法在一个流上多次调用，那么就必须调用同样次数的 `uncork()` 方法来刷新缓存数据。  

#### writable.write(chunk[, encoding][,callback])

+ `chunk` : `<string>` | `<Buffer>`
+ `encoding` : `<string>`
+ `callback` : `<Function>`
+ Returns：`<boolean>` `false`  

`write` 方法将数据写入到流中，并且一旦数据处理完后就调用回调函数。如果出现了错误，回调函数可能会也可能不会将错误作为第一个参数。  

如果在内部的缓存没有达到 `highWaterMark` 设定的阈值就返回 `true`。如果返回 `false`，之后的尝试写入数据的操作必须等待 `'drain'` 事件触发。  

当流不是在 `draining` 状态时，调用 `write()` 会缓存 `chunk`,并且会返回 `false`。一旦所有当前缓存的数据是 `drained`（被操作系统接受交付），`'drain'` 事件会触发。推荐一旦方法返回 `false`，就不要再写入数据了，直到
`'drain'` 事件触发。  

如果返回`true`，就表示可以写入新的数据了。如果等待写入的数据被缓存了，就返回`false`，表示此时不能立刻写入新的数据。不过，返回`false`的情况下，也可以继续传入新的数据等待写入。只是这时，新的数据不会真的写入，只会缓存在内存中。  



## 3. 可读流

可读流的例子有：  

+ 客户端的 HTTP 响应
+ 服务器端的 HTTP 请求
+ fs 可读流
+ zlib 可读流
+ crypto 可读流
+ TCP 套接字
+ 子进程标准输入和标准错误
+ `process.stdin`

所有的可读流都实现了定义在 `stream.Readable` 类中的接口。  

### 3.1 两种模式

可读流可以在两种模式下有效的执行操作：流动状态和暂停状态。  

当处于流动态时，数据会从底层系统自动读取并且通过事件的方式尽快的提供给应用。  

在暂停态时，`stream.read()` 方法必须显示调用来从流中读取数据块。  

所有可读流开始时都是暂停态，但是可以通过以下的方式转换为流动态：  

  + 添加 `'data'` 事件处理器。
  + 调用 `stream.resume()` 方法。
  + 调用 `stream.pipe()` 方法将数据发送给可写流。  

可读流也可以通过以下方式转换回暂停态：

  + 如果没有 pipe 的目的地时，调用 `stream.pause()` 方法。
  + 如果没有 pipe 的目的地时，移除任意的 `'data'` 事件处理器，或者通过调用 `'stream.unpipe()'` 方法移除所有的 pipe 目的地。  

需要记住可读流直到有消费或者忽视数据的机制前是不会生成数据的。如果消费机制不可用或者被移除，可读流就会尝试停止生成数据。  

注意：为了向后兼容，移除 `'data'` 事件处理器不会自动暂停流。同样的，如果有 pipe 的目的地，一旦这些目的地要求更多数据时，调用 `stream.pause()` 不能保证流会保持暂停态。  

注意：如果可读流转换为流动态，但是没有任何可用的消费者来处理数据，数据就会丢失。  


### 3.2 stream.Readable 类

#### 'close' 事件

当流及其底层资源关闭了后会触发 `'close'` 事件。

#### 'data'

+ `chunk`: `<Buffer>` | `<string>` | `<any>` 数据块。对于非对象模式的流来说，数据只能是字符串或者 `Buffer`。  

当流放弃数据的所有权将数据交给消费者时触发 `'data'` 事件。这可能在调用 `readable.pipe()` `readable.resume()`或者绑定 `'data'`事件监听后将流转换为流动态后随时发生。 也可以在调用 `readable.read()`
后随时发生。  

如果已经通过 `readable.setEncoding()` 设置了默认的编码方式的话，数据会作为字符串传递给监听函数，否则的话就是 `Buffer` 形式。  

#### 'end' 事件

当流中没有数据可供消费时触发 'end' 事件。  

#### 'error'

#### 'readable'

当流中还有数据可读取时触发 `'readable'` 事件。在一些情况下，绑定 `'readable'` 事件监听器会导致一些数据读入内部缓存。  

事件同时也会在流数据已经全部获取完成但是在 `'end'` 事件触发前触发。  


### 3.3 方法

#### isPaused()

#### pause()

这个方法会让一个流动态的流停止触发 `'data'` 事件，从流动态切换出来。任何可用的数据会保持在内部缓存区中。  

#### pipe(destination[, options])

+ `destination` : `<stream.Writable>`
+ `options` : `<Object>`
  + `end` : `<boolean>` 当读取结束时停止写入。默认为 `true`


可以将一个可读流绑定到多个输出流上。  

`pipe()` 方法返回目的地流的引用，因此可以链式 pipe 流：  

```javascript
const r = fs.createReadStream('file.txt');
const z = zlib.createGzip();
const w = fs.createWriteStream('file.txt.gz');
r.pipe(z).pipe(w);
```  

默认情况下，当可读流触发 `'end'` 事件时会调用所有目的地可写流的 `stream.end()` 方法。如果要禁用这个默认行为，可以将`option` 的 `end` 参数设为 `false`，会让可写流保持打开状态。  

注意如果可读流发生了错误，可写流不会自动关闭，需要手动关闭避免内存泄露。  


#### read([size])

+ `size` : `<number>` 声明要读取的数据量。
+ Returns : `<string>` | `<Buffer>` | `<null>`

这个方法会将内部缓存中的一些数据取出并返回。如果没有可用的数据需要读取就返回 `null`。默认返回`Buffer` 对象除非已经用 `setEncoding` 声明了编码或者流是对象模式。  

如果可用的数据不够 `size` 的大小就返回 `null`，除非流已经 ended，这种情况下将会把内部缓存区的所有数据返回。  

如果没有指定 `size` 参数，内部缓存区所有的数据都会被返回。  

`read` 方法只应该被暂停态可读流调用。在流动态，这个方法会自动调用知道内部缓存区清空。  


#### resume()

+ Returns : `this`

这个方法会将一个暂停态的可读流恢复成流动态，使其能触发`'data'`事件。  
