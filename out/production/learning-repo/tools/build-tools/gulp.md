# gulp API

## 1. gulp.src

#### gulp.src(globs, [options])

输出（Emits）符合所提供的匹配模式（glob）或者匹配模式的数组（array of globs）的文件。 将返回一个 Vinyl files 的 stream 它可以被 piped 到别的插件中。  

```javascript
gulp.src('client/templates/*.jade')
  .pipe(jade())
  .pipe(minify())
  .pipe(gulp.dest('build/minified_templates'));
```  

#### globs

类型： `String` or `Array`  

Glob 或者 glob 数组。  

以 `!` 开头的 glob 会从结果排除匹配的文件。  

#### options

类型：`Object`  

用来通过 glob-stream 传递给 node-glob 的参数。gulp 支持所有 glob-stream 和 node-glob 的
参数，除了 `ignore`，并且还添加了下列参数。  

**options.buffer**  

类型： `Boolean` 默认 `true`。  

如果该项被设置为 `false`，那么将会以 stream 方式返回 `file.contents` 而不是文件 buffer 的形式。这在处理一些大文件的时候将会很有用。    

**options.read**  

类型：`Boolean` 默认 `true`。  

如果该项被设置为 `false`， 那么 `file.contents` 会返回空值（null），也就是并不会去读取文件。  

**options.base**  

类型：`String`。 在 glob 开始前的所有内容。  

base的例子：  

```javascript
var glob2base = require('glob2base');
var glob = require('glob');

// js/
glob2base(new glob.Glob('js/**/*.js'));

// css/test/
glob2base(new glob.Glob('css/test/{a,b}/*.css'));

// pages/whatever/
glob2base(new glob.Glob('pages/whatever/index.html'));
```  

其实就是在任何 globbing 或者匹配 matching 发生前的路径。   

```javascript
gulp.src('client/js/**/*.js') // Matches 'client/js/somedir/somefile.js' and resolves `base` to `client/js/`
  .pipe(minify())
  .pipe(gulp.dest('build'));  // Writes 'build/somedir/somefile.js'

gulp.src('client/js/**/*.js', { base: 'client' })
  .pipe(minify())
  .pipe(gulp.dest('build'));  // Writes 'build/js/somedir/somefile.js'
```  


## 2. gulp.dest

#### gulp.dest(path, [options])  

能被 pipe 进来，并且将会写文件。并且重新输出（emits）所有数据，因此你可以将它 pipe 到多个文件夹。如果某文件夹不存在，将会自动创建它。  

```javascript
gulp.src('./client/templates/*.jade')
  .pipe(jade())
  .pipe(gulp.dest('./build/templates'))
  .pipe(minify())
  .pipe(gulp.dest('./build/minified_templates'));
```   

写入路径时通过将文件相对路径附加到给定的目的地目录之后计算出来的。相对的，相对路径也可以根据所给的 `base` 来计算。   

#### path  

类型：`String` or `Function`  

写入文件的文件夹的路径。或者一个返回路径的函数，如果是函数，函数会提供给 vinyl File 实例。  

#### options

类型：`Object`  

**options.cwd**  

类型：`String` 默认 `process.cwd()`。  

输出文件夹的 `cwd`，只有在输入文件夹路径时相对路径时才有效果。   

貌似是这个样子，先根据 cwd 计算当前工作目录，然后再根据相对路径的 path 参数，计算出输出文件夹的
位置，然后再把上面的 `base` 后的路径添加到输出文件夹后。  

**options.mode**  

类型：`String` 默认 `0777`  

八进制权限字符，用以定义所有在输出目录中所创建的目录的权限。  

## 3. gulp.task

#### gulp.task(name, [deps], [fn])  

使用 Orchestrator 定义一项任务。  

#### name

类型： `String`  

任务名。  

#### deps

类型：`Array`  

在任务执行前先要执行完成的任务的数组。  

注意： 你的任务是否在这些前置依赖的任务完成之前运行了？请一定要确保你所依赖的任务列表中的任务都使用了正确的异步执行方式：使用一个 callback，或者返回一个 promise 或 event stream。  


如果只想运行一系列打包的任务，可以省略最后的函数参数。  

`gulp.task('build', ['array', 'of', 'task', 'names']);`  

注意所有任务都是并行运行的。  

#### fn  

一个执行任务主要操作的函数。一般是这样的形式：  

```javascript
gulp.task('buildStuff', function() {
  // Do something that "builds stuff"
  var stream = gulp.src(/*some source path*/)
  .pipe(somePlugin())
  .pipe(someOtherPlugin())
  .pipe(gulp.dest(/*some destination*/));

  return stream;
  });
```  

#### 异步任务

如果任务时下面的形式之一，就是一个异步任务：  

**接受回调函数**  

```javascript
// run a command in a shell
var exec = require('child_process').exec;
gulp.task('jekyll', function(cb) {
  // build Jekyll
  exec('jekyll build', function(err) {
    if (err) return cb(err); // return error
    cb(); // finished task
  });
});

// use an async result in a pipe
gulp.task('somename', function(cb) {
  getFilesAsync(function(err, res) {
    if (err) return cb(err);
    var stream = gulp.src(res)
      .pipe(minify())
      .pipe(gulp.dest('build'))
      .on('end', cb);
  });
});
```  

返回一个 stream  

```javascript
gulp.task('somename', function() {
  var stream = gulp.src('client/**/*.js')
    .pipe(minify())
    .pipe(gulp.dest('build'));
  return stream;
});
```  

返回一个 Promise:  

```javascript
var Q = require('q');

gulp.task('somename', function() {
  var deferred = Q.defer();

  // do async stuff
  setTimeout(function() {
    deferred.resolve();
  }, 1);

  return deferred.promise;
});
```  

注意：默认情况下，任务运行时会尽可能的并发执行，所有依赖的任务同时开始加载执行并且不会等待任何响应，所以想要任务按照特定的顺序执行，在所有依赖执行完成后执行，依赖就必须声明成异步的任务。异步任务的定义方式上面也说完了。  

## 4. gulp.watch

#### gulp.watch(glob, [opts], tasks) or gulp.watch(glob, [opts, cb])  

这个方法会返回一个 EventEmitter 实例，可以出发 `change` 事件。  


#### glob  

类型： `String` or `Array`  

#### opts

一个传递给 gaze 的选项参数。  

#### tasks

类型： 数组

任务数组。  

#### cb(event)

```javascript
gulp.watch('js/**/*.js', function(event) {
  console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
});
```  

**event.type**  

发生变动时的变动的类型，可能是 `added`, `changed`, `deleted`, `renamed`。  

**event.path**  

出发事件的文件的路径。  

注意即使手动绑定 `change` 事件，事件类型还是那4个。  
