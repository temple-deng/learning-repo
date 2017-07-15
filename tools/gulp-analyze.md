# Gulp 分析

## gulp module

综合来看，整个模块通过 src 方法创建对象流，然后根据 glob 获取到文件的信息及内容，然后数据一直在转换流中不断传递，
推测插件应该是对流中对象上的 contents 进行变化，再将流传递出去，最终在 dest 方法中写入到文件中。   

file.contents 类型为 Buffer 或 Stream 的区别就是获取文件内容的时候是 `fs.readFile()` 还是 `fs.createReadStream()`。   
### index.js

```js
var Orchestrator = require('orchestrator');
var vfs = require('vinyl-fs');
var util = require('util');

// 看样子是 Gulp 构造函数，原型继承 Orchestrator
// 但是不是很理解下面绑定 this 的含义
function Gulp() {
  Orchestrator.call(this);
}
util.inherits(Gulp, Orchestrator);


// task 方法等同于 Orchestrator 上的 add 方法
// 这个模块注意就是任务管理的，以便可以最大化的并行执行任务
// 这个方法的话其实就是定义任务
// 但是具体执行任务是 Orchestrator 上的 start 方法，估计是命令行工具调用的这个方法
// signature: Orchestrator.prototype.add = function (name, dep, fn) { ... }
Gulp.prototype.task = Gulp.prototype.add;


// src 和 dest 都等同于 vfs 上对应的方法
Gulp.prototype.src = vfs.src;
Gulp.prototype.dest = vfs.dest;


Gulp.prototype.watch = function(glob, opt, fn) {
  if (typeof opt === 'function' || Array.isArray(opt)) {
    fn = opt;
    opt = null;
  }

  // Array of tasks given
  if (Array.isArray(fn)) {
    // 看样子 vfs.watch 的 signature: watch(glob, opt, fn)
    return vfs.watch(glob, opt, function() {
      this.start.apply(this, fn);
    }.bind(this));
  }

  return vfs.watch(glob, opt, fn);
};

// Let people use this class from our instance
Gulp.prototype.Gulp = Gulp;

// 最后构造一个实例并暴露出去
var inst = new Gulp();
module.exports = inst;
``` 

## vinyl-fs module

```js
// src 方法的实现

// through2 应该是一个方便生成转换流的模块
var through = require('through2');
var gs = require('glob-stream');

function src(glob, opt) {
  opt = opt || {};

  // 产生一个对象模式的转换流
  var pass = through.obj();

  // 应该就是验证 glob 参数是不是有效的 glob
  if (!isValidGlob(glob)) {
    throw new Error('Invalid glob argument: ' + glob);
  }

  // 应该是 glob 是个空数组，那么返回一个结束了的转换流吧
  if (Array.isArray(glob) && glob.length === 0) {
    process.nextTick(pass.end.bind(pass));
    return pass;
  }

  // 这一步应该是产生一个都有默认值的选项参数
  var options = default(opt, {
    read: true,
    buffer: true
  });

  // 充分判断这个可能是一个包含了匹配文件信息的对象流
  // 应该是一个转换流的可读一侧，目前还没有提供消费数据的方法
  var globStream = gs.create(glob, options)

    // when people write to use just pass it through
  var outputStream = globStream
    // 根据文件信息的对象，获取文件吧，推入到流中的缓存区
    .pipe(through.obj(createFile))
    // 获取文件的 stats 信息
    .pipe(getStats(options));


  // read == true 就获取文件的内容，否则就可能只有文件的信息
  if (options.read !== false) {
    outputStream = outputStream
      .pipe(getContents(options));
  }

  return outputStream.pipe(pass);
}

function createFile (globFile, enc, cb) {
  cb(null, new File(globFile));
}
```    

## through2 module

这个模块的话应该就是提供一个方便的转换流。

`through2([options, ] [transformFunction ] [, flushFunction])`     

`options` 直接传给 `stream.Transform` （应该是其构造函数吧），
所以如果想使用对象模式的流，可以设置 `objectMode: true`，或者直接
使用 `through2.obj()`。   

后面 `transformFunction` 和 `flushFunction` 应该就是对转换流
`_transform` 和 `_flush` 方法的实现。   

注意如果不提供 `transformFunction` 那么生成的流 应该是一个 PassThrough 流，这个流只是简单把输入传递给输出。   

## glob-stream module

单说 create 方法：   

```js
  function create(globs, opt) {
    if (!opt) opt = {};

    // only one glob no need to aggregate
    if (!Array.isArray(globs)) return gs.createStream(globs, null, opt);

    var positives = globs.filter(isPositive);
    var negatives = globs.filter(isNegative);

    if (positives.length === 0) throw new Error("Missing positive glob");

    // only one positive glob no need to aggregate
    if (positives.length === 1) return gs.createStream(positives[0], negatives, opt);

    // create all individual streams
    // 每个stream 都是一个through2.obj() 产生的流，对应于一个 glob
    // 每个流中都写入了其对应的 glob 匹配的文件的信息
    var streams = positives.map(function(glob){
      return gs.createStream(glob, negatives, opt);
    });

    // then just pipe them to a single unique stream and return it

    // aggregate 其实是一个 Combie 实例对象
    // 现在的 aggregate 是一个可读流，然后所有 stream 写入的文件信息对象都使用
    // Readable.push() 方法读到了这个流的内部缓存区中
    var aggregate = new Combine(streams);

    // 这个应该是根据文件的 `path` 来唯一标记一个文件，以免重复读入吧
    var uniqueStream = unique('path');

    return aggregate.pipe(uniqueStream);
  }
```
