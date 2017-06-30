# Stream  

目录：   

+ [Organization of this Document](#part1)
+ [Types of Stream](#part2)
  - Object Mode
  - Buffering
+ [API for Stream Consumers](#consumer)
  - [Writable Streams](#writable)
    + [Class: stream.Writable](#writclass)
      - [Event: 'close'](#writclose)
      - [Event: 'drain'](#writdrain)
      - [Event: 'error'](#writerror)
      - [Event: 'finish'](#writfinish)
      - [Event: 'pipe'](#writpipe)
      - [Event: 'unpipe'](#writunpipe)
      - [writable.cork()](#cork)
      - [writable.end([chunk][, encoding][, callback])](#end)
      - [writable.setDefaultEncoding(encoding)](#writsetencoding)
      - [writable.uncork()](#uncork)
      - [writable.write(chunk[, encoding][, callback])](#write)
      - [writable.destroy([error])](#destroy)
  - [Readable Streams](#readable)
    + [Two Modes](#twomodes)
    + [Three States](#threestates)
    + [Choose One](#chooseone)
    + [Class: stream.Readable](#classread)
      - [Event: 'close'](#readclose)
      - [Event: 'data'](#readdata)
      - [Event: 'end'](#readend)
      - [Event: 'error'](#readerror)
      - [Event: 'readable'](#readread)

# Stream  

流是用于在 Node.js 处理流数据的抽象接口。`stream` 模块提供了一些基础的 API，可以让我们
方便的构建实现流接口的对象。    

Node.js 提供了很多的流对象。例如，HTTP 服务器的 request，process.stdout 都是流的实例。    

所有流都是 `EventEmitter` 的实例。   

所以首先Node.js 提供了四种基本的流类型，如果我们想要使用其他类型的流，需要使用第二部分所讲的
API 来构建，其次，流默认都是工作在字符串及 Buffer 类型上的，要是想实现其他类型的数据，需要
使用 object mode。    

## Organization of this Document

<a name="part1"></a>   

这份文档被划分成两个主要的章节，及一个包含额外注意点的第三章节。第一部分解释在应用程序中
使用流所需的流 API 元素。第二部分介绍了实现新类型的流所需的 API 元素。    

## Types of Streams

<a name="part2"></a>   

Node.js 中有四种基本的流的类型：

+ **Readable** - 可读流，可以用来读取数据的流
+ **Writable** - 可写流，用来将数据写入的流
+ **Duplex** - 双向流
+ **Transform** - 可以用来在读与写流之间转换的双向流    

### Object Mode   

所有由 Node.js APIs 创建的流都是专门操作字符串和 `Buffer`(or `Uint8Array`)对象的。不过
对于流的具体实现来说，它可能和其他 javascript 类型的值工作的（除了 `null`，这个类型在流中
有特殊目的）。这样的流通常被认为是在 "object mode" 工作。    

当新建流时使用 `objectMode` 选项可以将流的实例转换到对象模式。不过尝试将已存在流转换为对象
模式是不安全的。   

### Buffering

无论是可写流还是可读流都会将数据存储在内部的缓冲区 buffer 中，这些数据随后可以分别用
`writable._writableState.getBuffer()` or `readable._readableState.buffer` 从 buffer 中获取到。    

潜在的可以缓冲的数据量取决于传入流构造函数的 `highWaterMark` 选项。对于普通的流来说，`highWaterMark`
规定了全部数据的字节的数量。对于处在对象模式的流来说，`highWaterMark` 规定的对象的总量。   

当可读流的实现调用 `stream.push(chunk)` 时，数据就会缓冲在可读流中。如果流的消费者没有调用
`stream.read()`，那么数据就会一直待在内部队列中，直到其被消费。   

一旦内部读取缓冲区的总量达到了 `highWaterMark` 规定的阈值，流就会暂时停止从底层资源中读取数据，
直到当前缓冲的数据被消费掉（换句话说，流会停止调用用来填充其读取缓冲区的内部的 `readable._read()` 方法）。     

当重复调用可写流的 `writable.write(chunk)` 方法时数据会缓冲在可写流中。当内部的写入缓冲区的
数据流低于 `highWaterMark` 规定的阈值时，调用 `writable.write()` 会返回 `true`。一旦内部
缓冲区到达或者超出了阈值，就会返回 `false`。（根据下面的内容判断，`write()` 方法可能同时也会
将数据写入到目的地中，但是会在缓冲区中保持备份，一旦目的地的速度跟不上流的话，数据可能只缓冲在缓冲区中）    

流 API，特别是 `stream.pipe()` 方法的一个关键目标就是将数据缓冲限制在一个可接受的水平，
以便让不同速度的源与目的地不会压垮可用内存。    

由于双向流及转换流都是可读也可写的，那么他们每种流都维护了两个分离了的内部缓冲区用来读写，
允许每一方独立于另一方操作，同时保持适当和有效的数据流。    

## API for Stream Consumers

<a name="consumer"></a>    

### Writable Streams   

<a name="writable"></a>   

可写流是对数据写入目的地的一种抽象。    

可写流的例子包括：   

+ 客户端的 HTTP requests
+ 服务端的 HTTP responses
+ fs 可写流
+ zlib
+ crypto streams
+ TCP sockets
+ child process stdin
+ process.stdout, process.stderr   

所有可写流都实现了 `stream.Writable` 类定义的接口。    

虽然不同的可写流实例彼此之间可能存在许多不同，但是所有的可写流都遵守下面的基本的用法模式：   

```javascript
const myStream = getWritableStreamSomehow();
myStream.write('some data');
myStream.write('some more data');
myStream.end('done writing data');
```    

#### Class: stream.Writable   

<a name="writclass"></a>

##### Event: 'close'

<a name="writclose"></a>    

`'close'` 事件会在流以及其任意的底层资源（例如一个文件描述符）关闭后触发。这个事件表明将来
不会再有别的事件触发。    

不是所有的可写流都会触发`'close'` 事件。   

##### Event: 'drain'

<a name="writdrain"></a>    

如果调用 `stream.write(chunk)` 返回了 `false`，`'drain'`事件会在可以恢复向流中写入数据的
恰当时间触发。    

##### Event: 'error'

<a name="writerror"></a>   

当写入数据或者 piping 数据出错时触发 `'error'` 事件。监听回调会接受一个 `Error` 实例作参数。   

*注意*：当 `'error'` 事件触发时，流还没有关闭。    

##### Event: 'finish'

<a name="writfinish"></a>   

当调用 `stream.end()` 方法后，并且所有数据都被刷新到底层系统后触发 `'finish'` 事件。    

##### Event: 'pipe'

<a name="writpipe"></a>    

+ `src` &lt;stream.Readable&gt; piping to 这个写流的源流   

当在可读流上调用 `stream.pipe()` 方法后，将这个可写流设为其目的地时，触发 `'pipe'` 事件。    

```javascript
const writer = getWritableStreamSomehow();
const reader = getReadableStreamSomehow();
writer.on('pipe', (src) => {
  console.error('something is piping into the writer');
  assert.equal(src, reader);
});
reader.pipe(writer);
```    

##### Event: 'unpipe'

<a name="writunpipe"></a>    

+ `src` &lt;Readable Stream&gt; unpiped 这个写流的源流    

当在可读流上调用 `stream.unpipe()` 方法，将这个可写流从其目的地中移除后触发 `'unpipe'` 事件

##### writable.cork()   

<a name="cork"></a>    

`writable.cork()` 方法强制将所有写入的数据缓冲到内存中。缓冲的数据会在 `stream.uncork()`
or `stream.end()` 方法调用后被刷新。    

`writable.cork()` 的主要目的是为了避免这样的情况：当许多小数据块写入流中时不会在内部缓冲
区中做备份，这反而对性能会产生不利的影响。在这种情况下，实现了`writable._writev()`方法
的流可以以更优化的方式执行缓冲写入。　　　　

##### writable.end([chunk][,encoding][,callback])

<a name="end"></a>   

+ `chunk` &lt;string&gt; | &lt;Buffer&gt; | &lt;Uint8Array&gt; | &lt;any&gt;  可选的
需要写入的数据。对于不在对象模式下运行的流，`chunk` 必须是 `string`, `Buffer`, `Uint8Array` 类型。
对于对象模式的流，则可以是除 `null` 以外的任意值。   
+ `encoding` &lt;string&gt; 如果`chunk` 是字符串的话的编码方式
+ `callback` &lt;Function&gt; 当流完成后可选的回调函数   

调用 `end()`方法意味着不会再有数据写入到流中。`chunk` 可以作为在流关闭前最后写入的数据。
如果提供了 `callback` 的话，这个函数会作为一个 `'finish'` 事件的监听函数。     

##### writable.setDefaultEncoding(encoding)

<a name="writsetencoding"></a>    

+ `encoding` &lt;string&gt; 新的默认的编码方式
+ Returns: `this`    

为可写流设置默认的编码方式。    

##### writable.uncork()

<a name="uncork"></a>    

这个方法会将自 `stream.cork()` 方法调用后缓冲的所有数据刷新。    

当使用 `cork()` 及 `uncork()` 管理写入数据流的缓冲区时，推荐使用 `process.nextTick()`
来延迟执行 `uncork()`。这样的话可以将在一个 event loop phase 内所有调用 `write()` 的数据
打包批量刷新。     

```javascript
stream.cork();
stream.write('some ');
stream.write('data ');
process.nextTick(() => stream.uncork());
```    

如果 `cork()` 方法在一个流上调用了多次，那么必须调用同样次数的 `uncork()` 来刷新缓存数据。    

```javascript
stream.cork();
stream.write('some ');
stream.cork();
stream.write('data ');
process.nextTick(() => {
  stream.uncork();
  // The data will not be flushed until uncork() is called a second time.
  stream.uncork();
});
```    

##### writable.write(chunk[,encoding][,callback])   

<a name="write"></a>   

+ `chunk`,`encoding` 参数同 `end()` 方法
+ `callback` &lt;Function&gt; 当数据块刷新后调用的回调函数  
+ Returns: &lt;boolean&gt; 如果流希望调用代码在继续写入附加数据之前等待发送 `'drain'`事件
就为 `false`，否则为 `true`。      

`write()` 方法将数据写入流中，并在数据完成处理后调用 `callback`。当出错时，`callback` 可能会
也可能不会将错误作为第一个参数。如果想可靠的监听的错误的话，还是为 `'error'` 事件添加监听器。   

注意这里返回值的意思，如果在将这里新写入的数据添加到缓冲区中，内部缓冲区仍然低于阈值的话，就返回 `true`。这里如果返回 `false` 的话，之后的写入数据的尝试都应该停止，之后 `'drain'` 事件触发。    

当流没有在 draining 时，调用 `write()` 会缓冲数据，然后返回 `false`。（这里指的应该是我们
调用了 `cork()` 方法强制让数据都缓冲到内存中）。一旦当前所有缓冲的数据被排空，就触发 `'drain'` 事件。
当在一个没有 draining 的流上调用 `write()` 方法是允许的，Node.js 会将所有写入的数据缓冲，
直到最大的内存使用量，这时再写入数据会被无条件地丢弃。     

当在没有 draining 的转换流上写入数据时极容易产生问题。因为转换流默认会被暂停，直到数据被 piped
或者添加了一个 `'data'` or `'readable'` 事件处理程序。（不懂）    

如果要写入的数据可以按需生成或获取，推荐将这些逻辑（应该是生成数据的逻辑）封装到可读流中并且使用 `stream.pipe()`。   

一个在对象模式下的可写流会忽略 `encoding` 参数。    

##### writable.destroy([error])

<a name="destroy"></a>    

摧毁流，并发出传递的错误。在调用这个函数后，可写流就结束了。    

### Readable  Streams

<a name="readable"></a>     

可读流是对将要消费的数据的来源的一种抽象。    

可读流的例子包括：   

+ 客户端的 HTTP responses
+ 服务器端的 HTTP requests
+ fs 可读流
+ zlib
+ crypto streams
+ TCP sockets
+ child process stdout and stderr
+ process.stdin   

所有可读流都实现了 `stream.Readable` 类上定义的接口。    

#### Two Modes

<a name="twomodes"></a>   

可读流可以有效地在两种模式之一下操作：流动态 flowing 与暂停态 paused。    

当处于流动模式时，数据会自动此从底层系统读取，并通过事件来尽可能快地提供给应用。    

在暂停模式下，必须显式地调用 `stream.read()` 方法来从流中读取数据。   

所有可读流开始时都处于暂停模式，不过可以通过下面之一的方法来转换到流动模式：    

+ 为 `'data'` 事件添加监听函数
+ 调用 `stream.resume()` 方法
+ 调用 `stream.pipe()` 方法将数据发送到可写流   

可读流也可以通过下面方式之一转回暂停模式：   

+ 没有任何 pipe 的目的地，调用 `stream.pause()` 方法
+ 有 pipe的目的地，移除任何的 `'data'` 事件监听器，并且调用 `stream.unpipe()` 方法移除所有的
pipe 目的地。    

需要记住的一点是，可读流在提供消费数据或者忽视数据的机制之前，是不会生成数据的。一旦消费数据的机制
被禁止或者被移除，可读流会尝试停止生成数据。    

注意：为了向后兼容的原因，移除 'data' 事件监听函数不会自动暂停流。同样的，如果当前有 pipe
的目的地，调用 `stream.pause()` 也不能担保当目的地 drained 后请求更多数据时，流还能保持暂停。   

*注意*：如果可读流转换到了流动模式，但是却没有任何的消费者来处理数据，那么数据就会丢失。这会在
当调用 `readable.resume()` 方法时，'data' 事件却没有监听函数，或者当移除一个 'data' 事件监听函数
时发生。    

#### Three States

<a name="threestates"></a>   

上面的两种模式是对当实现可读流时复杂的内部状态管理的一种简化的抽象。   

具体来说，在任何给定的时间点，每个可读流会是三种可能的状态之一：   

+ `readable._readableState.flowing = null`
+ `readable._readableState.flowing = false`
+ `readable._readableState.flowing = true`    

当 `readable._readableState.flowing` 为 `null`，这时没有提供任何消费流中数据的机制，所以流不会生成数据。当在这种状态时，为 'data' 事件绑定监听函数，调用 `readable.pipe()` 方法，或者调用
`readable.resume()` 都会将 `readable._readableState.flowing` 转换为 `true`，这会
造成可读流开始生成数据并触发事件。    

调用 `readable.pause()`,`readable.unpipe()`，或者收到 "back pressure" 会造成 `flowing` 变为
`false`，暂时挂起事件的流动，但是不会挂起数据的生成。当处在这个状态时，为 'data' 事件绑定监听
函数不会操作 `flowing` 变为 `true`。     


当 `flowing` 为 `false` 时，数据可能会在流的内部缓冲区中叠加。    

####  Choose One  

<a name="chooseone"></a>   

可读流的 API 在多个Node.js版本间不断进化，提供了多种消费流中数据的方式。通常来说，开发者
应该从这些方式中选择一种，并且永远不要在一个流上使用多种方式来消费数据。    

#### Class: stream.Readable  

<a name="classread"></a>    

##### Event: 'close'   

<a name="readclose"></a>   

当流及其底层资源关闭后触发 'close' 事件。不是所有的可读流都会触发 `'close'` 事件。   

##### Event: 'data'

<a name="readdata"></a>   

+ `chunk` &lt;Buffer&gt; | &lt;string&gt; | &lt;any&gt; 数据块。对于不在对象模式的流来说，数据
必须是 `string` or `Buffer`。对于对象模式的流来说，可以是非 `null` 的任意值。   

无论何时流放弃了数据的所有权将其交给消费者，就会触发 `'data'` 事件。这可能在无论何时调用
`readable.pipe()`, `readable.resume()` 或者给 `'data'` 事件绑定回调将流转换为流动模式时
触发。`'data'` 事件也会在调用 `readable.read()` 方法并且返回可用的数据时触发。    

为一个没有明确暂停了的流绑定（这里的明确暂停应该是指上面通过各种方法让 `flowing` 为 `false`）
`'data'` 事件监听器会将流转换为流动模式。数据会在可用后尽快地传送。   

如果流使用 `readable.setEncoding()` 方法规定了默认的编码方式，则监听函数会将传入的数据当做
字符串处理，否则的话，数据会使用 `Buffer` 传递。   

##### Event: 'end'

<a name="readend"></a>    

`'end'` 事件会在流中没有更多的数据要消费时触发。   

*注意*：除非数据被完全消费掉了，否则不会触发 `'end'` 事件。可以通过将流转为流动模式，
或者在数据完全消费完前不断地调用 `stream.read()` 实现。    

##### Event: 'error'

<a  name="readerror"></a>   

+ &lt;Error&gt;    

##### Event: 'readable'

<a name="readread"></a>    

当流中还有数据可以读取时会触发 `'readable'` 事件。一些情况下，为 `'readable'` 事件绑定
监听器会造成一些数据读取到内部缓冲区中。   

`'readable'` 事件也会在流到达结尾但 `'end'` 事件触发前触发。    

实际上，`'readable'` 事件表明流中有新的信息：可用的新数据或者已经到达流的结尾。针对前者，
`stream.read()` 会返回可用的数据，针对后者，会返回 `null`。   

*注意*: 通常来说，`readable.pipe()` 或者 `'data'` 事件机制相比 `'readable'` 事件更容易
理解。     

##### readable.isPaused()

+ Returns: &lt;boolean&gt;   

返回当前可读流的状态。主要是为了底层的 `readable.pipe()` 方法使用。通常没必要直接使用这个
方法。    

```javascript
const readable = new stream.Readable();

readable.isPaused(); // === false  这点很奇怪，按理说流一开始是暂停态的，可能这个方法时
// 根据 readable._readableState.flowing 的状态判断的，只有 false 才行
readable.pause();
readable.isPaused(); // === true
readable.resume();
readable.isPaused(); // === false
```   

##### readable.pause()

+ Returns: `this`   

这个方法会让动模式的流停止触发 `'data'` 事件，跳出流动模式。任何可用的数据会仍然在
内部缓冲区中。    

##### readable.pipe(destination[,options])   

+ `destination` &lt;stream.Writable&gt; 数据写入的目的地
+ `options` &lt;Object&gt; Pipe 选项
  - `end` &lt;boolean&gt; 当读取结束时结束 writer。默认为 `true`。    

这个方法会将一个可写流绑定到 `readable` 上，会造成流自动转换为流动模式，并且将所有的数据推送到绑定
的可写流中。数据流是自动管理的，防止目的地不会由于过快的读取流而崩溃。    

可以将多个可写流绑定到一个可读流上。    

`readable.pipe()` 会返回目的地流的引用，所以可以链式 pipe 流：   

```javascript
const r = fs.createReadStream('file.txt');
const z = zlib.createGzip();
const w = fs.createWriteStream('file.txt.gz');
r.pipe(z).pipe(w);
```    

默认情况下，当源可读流触发 `'end'` 时会调用 `stream.end()`，以便让目的地不再可写入。如果
想禁止这种默认行为，需要将 `end` 选项设为 `false`。    

需要注意的一点是，当可读流发出了错误，可写流是不会自动关闭的，需要我们手动关闭。   

*注意*： `process.stderr` 和 `process.stdout` 在进程退出前是永远不会关闭的，不管 `end` 设为什么。     

##### readable.read([size])   

+ `size` &lt;number&gt; 可选的指定读取数据的数量
+ Returns: &lt;string&gt; | &lt;Buffer&gt; | &lt;null&gt;    

`read()` 方法会将所有内部缓冲区的数据取出并返回。如果没有可用的数据，返回 `null`。
默认情况下，会返回 `Buffer`，除非使用 `readable.setEncoding()` 指定了编码或者流是
在对象模式下操作。    

如果规定的 `size` 数量字节是超出了可读取的数据量时，会返回 `null`，除非流已经结束了，在这
种情况下内部缓冲区所有剩余的数据都会返回。    

如果没有指定 `size` 参数也是将缓冲区中所有的数据返回。     

`read()` 返回只应该在处于暂停模式下的可读流调用。在流动模式下，`read()` 会内部缓冲区完全
drained 前会自动调用。    

通常来说，建议开发者使用 `readable.pipe()` 或者 `'data'` 事件而避免使用 `'readable'` 事件
和 `readable.read()` 方法。    

处在对象模式下的可读流总会在调用 `readable.read(size)` 时返回一个项目，不管`size` 设为多少。    

*注意*：如果 `read()` 方法返回一个数据块，`'data'` 事件也会触发。    

*注意*： 在 `'end'` 事件触发之后调用 `read()` 会返回 `null`。不会报错。   

##### readable.resume()

+ Returns: `this`    

这个方法会让明确处于暂停模式的可读流恢复触发 `'data'` 事件，并将流转换为流动模式。   

##### readable.setEncoding(encoding)

+ `encoding` &lt;string&gt;
+ Returns: `this`    

##### readable.unpipe([destination])

+ `destination` &lt;stream.Writable&gt; 可选的规定 unpipe 的流。    

会将之前使用 `pipe()` 方法绑定的可写流解绑。如果没有指定 `destination` 参数，那么所有的可写流
都会解绑。     


##### readable.unshift(chunk)

+ `chunk` &lt;Buffer&gt; | &lt;Uint8Array&gt; | &lt;string&gt; | &lt;any&gt; 移入读取
队列的数据块。类型限制同之前说过的。    

`unshift()` 方法将一个数据块推回到内部缓冲区。这在某些场景下会有用：当流中的一些数据已经被
提取出来消费了，但是需要将这些数据 "un-consume" 以便可以再将这些数据传递到别地方。    

还有一些注意点就不说了，估计也不怎么用。    

##### readable.wrap(stream)

+ `stream` &lt;Stream&gt; 一个 “旧风格” 的可读流    

v0.10 版本之前的 Node.js 没有实现完整的流 API。    

略。   

##### readable.destroy([error])

摧毁流并触发 `'error'` 事件。

### Duplex and Transform Streams

#### Class: stream.Duplex  

#### Class: stream.Transform   

##### transform.destroy([error])

摧毁流并触发 `'error'` 事件。    

## API for Stream Implementers   

可以使用 js 的原型继承模型根据流模块的 API 实现流。    

首先，先声明一个从基本的四种流类型继承的子类：    

```javascript
const { Writable } = require('stream');

class MyWritable extends Writable {
  constructor(options) {
    super(options);
    // ...
  }
}
```    

新的流的类必须根据创建的流的类型实现一个或多个方法：   

| Use-case | Class | Method(s) to implement |
| :------------- | :------------- | :------------- |
| Reading only  | Readable | `_read` |
| Writing only | Writable | `_write`, `_writev`, `_final` |
| Reading and Writing | Duplex | `_read`, `_write`, `_writev`, `_final` |
| Operate on written data, then read the result | Transform | `_transform`, `_flush`, `_final` |  

*注意*：流的实现代码不应该调用那些用来向消费者提供功能的 "public" 方法。不这样做的话可能会
导致不利的副作用。    

### Simplified Construction

对于简单的例子来说，可以不依赖继承直接构造一个流。即直接创建 `stream.Writable`, `stream.Readable`,
`stream.Duplex`, `stream.Transform` 的实例。    

```javascript
const { Writable } = require('stream');

const myWritable = new Writable({
  write(chunk, encoding, callback) {
    // ...
  }
});
```    

### Implementing a Writable Stream

定制的可写流必须调用构造函数并实现 `writable._write()` 方法。`writable._writev()` 可以
选择性地实现。    

#### Constructor: new stream.Writable([options])   

+ `options` &lt;Object&gt;
  - `highWaterMark` &lt;number&gt; 默认是 `16384`(16kb)，或者对于对象模式的流就是 `16`
  - `decodeStrings` &lt;boolean&gt; 是否在将字符串传递给 `stream._write()` 之前解码为Buffers
  - `objectMode` &lt;boolean&gt; 是否 `stream.write(anyObj)` 是一个有效的操作。当设置这个
  选项为 `true`，可以将除了 `string`,`Buffer`,`Uint8Array` 以外的 js 值写入到支持的流的实现中。
  默认为 `false`
  - `write` &lt;Function&gt; 对于 `stream._write()` 的实现
  - `writev` &lt;Function&gt; 对 `stream._writev()` 的实现
  - `destroy` &lt;Function&gt; 对 `stream._destroy()` 的实现
  - `final` &lt;Function&gt; 对 `stream._final()` 的实现    

例子：   

```javascript
const { Writable } = require('stream');

class MyWritable extends Writable {
  constructor(options) {
    // Calls the stream.Writable() constructor
    super(options);
    // ...
  }
}
```   

或者使用简化的构造方式：   

```javascript
const { Writable } = require('stream');

const myWritable = new Writable({
  write(chunk, encoding, callback) {
    // ...
  },
  writev(chunks, callback) {
    // ...
  }
});
```    

#### writable.\_write(chunk, encoding, callback)

+ `chunk` &lt;Buffer&gt; | &lt;string&gt; | &lt;any&gt; 写入的数据块。除非将 `decodeStrings`
设为 `false` 或者流是处于对象模式，否则总是 buffer
+ `encoding` &lt;string&gt; 如果 chunk 是字符串，就是编码。如果是 `Buffer` 或者处于对象模式，这个参数被忽略
+ `callback` &lt;Function&gt; 当提供的chunk全部出来完成时调用的函数（可选的带有一个 error 参数）    

所有的可写流的实现都必须提供 `writable._write()` 方法将数据发送到底层资源上。   

*注意*：转换流可能提供其自己对 `writable._write()` 的实现     

*注意*：这个方法必须不能被应用代码直接调用。这个方法只应该被可写流内部方法使用。     

必须调用 `callback` 方法来通知写入操作成功完成或者由于错误失败了。回调函数的第一个参数
必须在失败时是 `Error`对象或者在成功时是 `null`。    

很重要的一点是当我们在调用 `writable._write()` 后到调用 `callback` 被调用前这段时间内
调用 `writable.write()` 会造成写入的数据被缓冲。一旦`callback` 被调用，流就会触发 `'drain'`
事件。如果流的实现想要增加一次性处理多个数据块的能力，就必须实现 `writeable._writec()` 方法。    

如果在构造函数中设置了 `decodeStrings` 属性（这里具体设置为什么并没有说清楚，不知道是都行，还是专指一种），`chunk` 应该是一个字符串而不是 `Buffer`。如果明确的将 `decodeStrings` 设为 `false`，
那么 `encoding` 参数可以安全地被忽视，`chunk` 会仍然作为对象传递给 `.write()`。     

#### writable.\_writev(chunks,callback)

+ `chunks` &lt;Array&gt; 每个数据块是这样的格式 `{ chunk: ..., encoding:....}`
+ `callback` &lt;Function&gt; 当提供的数据块处理完成后调用。    

*注意*：这个方法也不能直接被应用代码调用，只应该被内部方法使用。    

如果实现了这个方法，这个方法会使用所有当前写入队列中缓冲的数据传入。    

#### writable.\_destroy(err, callback)

略

#### writable.\_final(callback)

+ `callback` &lt;Function&gt; 当你完成剩余的数据的写入后调用     

同理，也不应该直接被应用代码直接调用，只被内部方法调用。     

可选的回调会在流关闭前调用，在 `callback` 被调用前就会推迟 `'finish'` 事件。这在流结束前
关闭资源或写入缓冲的数据很有用。    

### Implementing a Readable Stream

定制的可读流必须调用 `new stream.Readable([options])` 构造函数并且实现 `readable._read()`
方法。    

#### new stream.Readable([options])

+ `options` &lt;Object&gt;
  - `highWaterMark` &lt;number&gt; 在停止从底层资源读取之前可以存储在内部缓冲区中的最大字节数。默认
  时 `16384`(16kb)，对于对象模式流就是 `16`
  - `encoding` &lt;string&gt; 如果指定的话，那么 buffers 会根据这个编码方式解码为字符串，默认为 `null`
  - `objectMode` &lt;boolean&gt; 是否这个流该表现的像一个对象流。意味着 `stream.read(n)` 返回
  一个单一值而不是一个 size n 大小的 Buffer。默认是 `false`
  - `read` `stream._read()` 方法的实现
  - `destroy` `stream._destroy()` 方法的实现

#### readable.\_read(size)

+ `size` &lt;number&gt; 异步读取的字节数    

同上，只应该被内部方法使用。    

所有可读流的实现都必须提供 `readable._read()` 方法的实现，来从底层资源获取数据。    

当调用 `readable._read()` 时，如果资源中的数据是可用的，那么实现应该开始使用 `stream.push(chunk)`
方法将这些数据推入到读取队列中。`_read()` 应该不断地从资源中读取数据并将其推入，直到 `readable.push(chunk)` 返回 `false`。只有当 `_read()` 在停止后再次调用，才能继续将其他数据推送到队列中。     

*注意*：一旦`readable._read()` 被调用，直到 `readable.push()` 被调用它都不会再一次被调用。    

#### readable.push(chunk[,encoding])

+ `chunk` &lt;Buffer&gt; | &lt;Uint8Array&gt; | &lt;string&gt; | &lt;null&gt; | &lt;any&gt;
要推入读取队列。对于非对象模式的流，是 `string` `Buffer` or `Uint8Array`。对象模式就是任意值
+ `encoding` &lt;string&gt; 字符串的编码。
+ Returns &lt;boolean&gt; 如果额外的数据块可以继续推入就为 `true`否则为 `false`   

当 `chunk` 是 `Buffer`, `Uint8Array`, `string`，那么这个数据就会被添加到内部的队列中供
流的用户消费。传递 `null` 作为 `chunk` 意味着流的结尾。    

当流是处在暂停模式时，使用 `readable.push()` 添加的数据可以在 `readable` 事件触发时通过
调用 `readable.read()` 方法读出。    

当流在流动模式时，可以通过触发 `'data'` 事件来将使用 `readable.push()` 添加的数据分发出去。   

*注意*：这个流主要是提供给 `readable._read()` 方法使用的    

### Implementing a Duplex Stream   

双向流的实现必须调用 `new stream.Duplex([options])` 构造函数及 `readable._read()` 和
`writable._write()` 方法。     

#### new stream.Duplex(options)

+ `options` &lt;Object&gt; 会同时传递给可写流和可读流的构造函数，同时还有下面的字段：  
  - `allowHalfOpen` &lt;boolean&gt; 默认为 `true`。如果设为 `false`，那么流会在可写的
  一端结束时自动关闭可读的一端，反之亦然
  - `readableObjectMode` &lt;boolean&gt; 默认 `false`。
  - `writableObjectMode` &lt;boolean&gt; 默认 `false`。注意这个及上面的那个如果在 `objectMode`
  为 `true` 的时候会没有任何效果     


剩下的都略了。心情好再看。   
