常见的几个包

chokidar  好像是 watch 的作用

opn 使用对应的应用打开文件


## 过程

依赖的包可能有：browser-sync（实时重载）, sass（这里是用的是使用 ruby 的 sass），
clean-css-cli（css文件压缩）, webpack, eslint, babel, chokidar-cli。  

实现实时重载比较麻烦啊，因为 sass:watch, browser-sync, chokidar-cli 都要占用一个shell。  

js 打包和lint 目前先暂时用 webpack 的。   

## Babel

看样子的话 babel-core 是核心包，这个模块提供了转换方法，可以手动转换。   

babel-ployfill 包含了所有 ES2015+ 的垫片，但是用 babel-node 的时候这个模块会自动加载。   

babel 是一个编译器。完成解析->转换->生成代码的工作。看样子，编译的具体依据的话就需要 plugin 来提供。
平时使用 preset 也是插件的一种。


## Browser-sync

### API  

简单示例：    

```javascript
// 使用 create() 获取一个单一示例，也可以创建多个服务器或代理
var bs = require('browser-sync').create();

// .init 启动服务器
bs.init({
  server: './app'
});

// 之后就可以调用其他的方法了
bs.reload('*.html');
```    

##### .create( name )  

创建一个 bs 实例。   

**name**: String     

可以用于稍后检索的标识符。    

```javascript
// 创建一个没名字的实例
var bs = require('browser-sync').create();

// 创建一个带有名字的实例
var bs = require('browser-sync').create("My server");

// create multiple
var bs1 = require("browser-sync").create('Server 1');
var bs2 = require("browser-sync").create('Server 2');
```   

##### .get( name )  

通过名字获取单一实例。    

**name**: String。    

```javascript
// Create an named instance in one file...
var bs = require("browser-sync").create('My Server');

// Start the Browsersync server
bs.init({
    server: true
});

// now, retrieve the instance in another file...
var bs = require("browser-sync").get('My server');

// and call any methods on it.
bs.watch('*.html').on('change', bs.reload);
```    

##### .has( name )   

检查是否存在创建好的实例。   

**name**: String    

##### .init( config, cb )  

启动 Browsersync 服务。这会启动一个服务器，代理或者根据具体情况开始 snippet 模式。
光启动服务的话，和普通的静态文件服务器没什么不同吧，关键要添加重载的自动刷新功能。     

**config**: Object(optional)   

实例的主要配置，如果没传入任何的配置的话，Browsersync 会在 snippet 模式下运行。    

**cb**: Function(optional)   

就会常规的回调函数，在启动完成后调用。    

```javascript
var bs = require("browser-sync").create();

// Start a Browsersync static file server
bs.init({
    server: "./app"
});

// Start a Browsersync proxy
bs.init({
    proxy: "http://www.bbc.co.uk"
});
```    

##### .reload( arg )

reload 方法会在文件变动时通知所有的浏览器，并且会刷新浏览器，或者在有可能的情况下注入文件（这个应该是
个 gulp 等构建工具用的时候吧）。   

这个方法是在手动调用的时候才通知浏览器进行一次刷新吧，还是没有自动重载功能。   

**arg**: String | Array | Object(optional)   

重新加载的文件。   

```javascript
// browser reload
bs.reload();

// single file
bs.reload("styles.css");

// multiple files
bs.reload(["styles.css", "ie.css"]);

// Since 2.6.0 - wildcards to reload ALL css files
bs.reload("*.css");
```    

##### .stream( opts )   

The stream method returns a transform stream and can act once or on many files.    

**opts**: Object(optional)    

```javascript
// Compile SASS & auto-inject into browsers
gulp.task('sass', function () {
    return gulp.src('scss/styles.scss')
        .pipe(sass({includePaths: ['scss']}))
        .pipe(gulp.dest('css'))
        .pipe(bs.stream());
});

// Provide `once: true` to restrict reloading to once per stream
gulp.task('templates', function () {
    return gulp.src('*.jade')
        .pipe(jade())
        .pipe(gulp.dest('app'))
        .pipe(bs.stream({once: true}));
});

// Provide a filter to stop unwanted files from being reloaded
gulp.task('less', function () {
    return gulp.src('*.less')
        .pipe(less())
        .pipe(gulp.dest('css'))
        .pipe(bs.stream({match: "**/*.css"}));
});
```    

##### .notify( msg, timeout )   

通知浏览器的助手方法。就是在浏览器右上角的那些提示信息啦。         

**msg**: String | HTML    

可以是普通的文本信息，或者HTML内容。   

**timeout**: Number(optional)    

信息会在浏览器中保存多久。    

```javascript
var bs = require("browser-sync").create();

// Text message
bs.notify("Compiling, please wait!");

// HTML message
bs.notify("HTML <span color='green'>is supported</span> too!");

// Since 1.3.0, specify a timeout
bs.notify("This message will only last a second", 1000);
```   

##### .exit()   

关闭所有运行的服务器，停止文件监听并且退出当前进程。    

```javascript
var bs = require("browser-sync").create();

// Start the server
bs.init({server: "./app"});

// Quit the server after 5 seconds
setTimeout(function () {
    bs.exit();
}, 5000);
```     

##### .watch( patterns, opts, fn )   

独立的 file-watcher。    

**patterns**: String   

监听文件的 glob patterns。    

**opts**: Object(optional)    

传递给 Chokidar 的配置，具体内容查找其文档。    

**fn**: Function(optional)   

每次事件的回调函数。    

```javascript
var bs = require("browser-sync").create();

// 监听所有的 html 文件变动并且重载
bs.watch("*.html").on("change", bs.reload);

// 为 css 文件的所有事件提供一个回调函数
// 可以过滤指定的 change 事件并重载页面上的所有css文件
bs.watch("css/*.css", function (event, file) {
    if (event === "change") {
        bs.reload("*.css");
    }
});

// Now init the Browsersync server
bs.init({
    server: "./app"
});
```    

所以现在的话就比较明确了，使用watch方法来监听文件，然后绑定事件或者回调在文件变动时可以主动
调用 `reload` 方法通知浏览器刷新，另外一点就是，如果 `reload()` 带有参数，就只更新参数指定的
文件，否则就重新刷新浏览器。    

##### .pause()   

暂停文件变动事件。    

##### .resume()

恢复暂停的 watcher。   

##### .emitter

用来运行 bs 实例的内部的 Event Emitter。可以使用这个来触发自己的事件，例如文件
变动，记录日志等。   

```javascript
var bs = require("browser-sync").create();

// Listen for the `init` event
bs.emitter.on("init", function () {
    console.log("Browsersync is running!");
});

bs.init(config);
```    

##### .active   

一个 true/false 标志，可以用这个标志来确定是否当前有在运行的 bs 实例。    

```javascript
var bs = require("browser-sync").create();

// -> false as .init has not yet been called
console.log(bs.active);

bs.init(config, function (err, bs) {

    // -> now true since BS is running now
    console.log(bs.active);
});
```    

##### .paused   

true/false 标志来确定当前实例是否暂停。    

##### .sockets

访问客户端一侧的 socket 来触发事件。    


### 命令行

主要就是下面4个命令：   

```shell
$ browser-sync start [options]     Start Browsersync
$ browser-sync init                Create a configuration file
$ browser-sync reload              Send a reload event over HTTP protocol
$ browser-sync recipe [name]       Generate the files for a recipe
```    

##### browser-sync start   

```shell
# Examples

# Start a server from the `app` directory, watching all files
$ browser-sync start --server 'app' --files 'app'

# Start a server from the `app` & `.tmp` directories (short hand)
# (requires 2.12.1)
$ browser-sync start -s 'app' '.tmp' -f 'app' '.tmp'

# Proxy a PHP app + serve static files & watch them
$ browser-sync start --proxy 'mylocal.dev' --serveStatic 'public' --files 'public'

# Start Browsersync from a config file
$ browser-sync start --config 'conf/browser-sync.js'

# Start Browsersync from a config file with overriding flags
$ browser-sync start --config 'conf/browser-sync.js' --port 4000
```   

参数：   

+ **--server, -s**: 运行本地服务器（默认使用当前工作目录作为根目录）
+ **--browser, -b**: 选择自动打开的浏览器
+ **--config, -c**: 指定配置文件
+ **--files, -f**: 监听的文件目录
+ **--serverStatic, --ss**: 提供静态文件的目录（这是干嘛，什么不是已经有服务器了，这个难道是为了再添加额外的目录，看下面的意思
是跟代理搭配时使用）
+ **--port**: 指定使用的端口
+ **--proxy, -p**: 代理一个已存在的服务器
+ **--ws**: 代理模式只运行 websocket 代理（不知道什么鬼，再议）
+ **--index**:  指定使用的索引页面的文件，就是平时 web 服务器在目录中默认使用的那个 index 页面吧
+ **--plugins**: 加载插件
+ **--extensions**: 指定回退的文件扩展名
+ **--startPath**: 指定浏览器的开始路径（这个也不清楚）
+ **--https**: 启用 SSL
+ **--directory**: 貌似是比如说我们路径是个目录的时候是否列出目录内的结构的意思吧，但是启用了
这个那上面的索引就没什么用了吧
+ **--xip**: 使用 xip.io 域名路由（不懂）
+ **--tunnel**: 使用 public URL
+ **--open**: 选择自动打开时的URL（local, external or tunnel），或者提供一个 URL
+ **--cors**: 为每个请求添加 CORS 首部
+ **--host**: 指定使用的主机名
+ **--logLevel**: 指定日志输出等级（silent, info, debug）
+ **--reload-delay**: 毫秒单位
+ **--reload-debounce**: 限制 reload 事件的频率
+ **--ui-port**
+ **--watchEvents**: 指定响应的文件事件
+ **--no-notify**
+ **--no-open**
+ **--no-online**
+ **--no-ui**
+ **--no-ghost-mode**
+ **--no-inject-changes**
+ **--no-reload-on-restart**

### options

只列出主要的几个，其余的查文档吧。   

##### files

类型：Array | String   
默认：false   

就是监听的文件吧，针对 css&image 修改可能会采用注入的形式，其余的可能重新刷新页面。   

```javascript
// single file
browserSync({
    files: "app/css/style.css"
});

// multiple files
browserSync({
    files: ["app/css/style.css", "app/js/*.js"]
});

// patterns + 1 with custom callback
// since 2.6.0
browserSync({
    files: [
        "wp-content/themes/**/*.css",
        {
            match: ["wp-content/themes/**/*.php"],
            fn:    function (event, file) {
                /** Custom event handler **/
            }
        }
    ]
});
```    

##### watchEvents

类型： Array  
默认：["change"]   

可用的事件有: add, change, unlink, addDir, unlinkDir。    

##### watchOptions

类型：Object   
Default: undefined   

传递给  Chokidar 的监听参数。    

##### server

类型：Object | Boolean   
默认： false    

```javascript
// Serve files from the app directory
server: "app"

// Serve files from the current directory
server: true

// Serve files from the app directory with directory listing
server: {
    baseDir: "app",
    directory: true
}

// Multiple base directories
server: ["app", "dist"]

// Serve files from the app directory, with a specific index filename
server: {
    baseDir: "app",
    index: "index.htm"
}

// The static file server is based on expressjs/serve-static,
// so we inherit all of their options, like trying a default extension
// when one isn't specified
// https://github.com/expressjs/serve-static
server: {
    baseDir: "app",
    serveStaticOptions: {
        extensions: ["html"]
    }
}

// Since version 1.2.1
// The key is the url to match
// The value is which folder to serve (relative to your current working directory)
server: {
    baseDir: "app",
    routes: {
        "/bower_components": "bower_components"
    }
}
```    

## clean-css(4.1.4)

css 压缩工具，那么问题就来了，有没有必要使用这个工具，sass 本来就可以输出压缩过格式的东西。   

简单用法：   

```javascript
var CleanCSS = require('clean-css');
var input = 'a{font-weight:bold;}';
var options = { /* options */ };
var output = new CleanCSS(options).minify(input);
```    

### 构造函数选项

+ `compatibility` - 控制使用的兼容模式，默认 `ie10+`
+ `fetch` - 处理远程请求的函数
+ `format` - 输出 CSS 的格式；默认是 `false`
+ `inline` - 控制 `@import` 内联规则；默认是 `'local'`
+ `inlineRequest` - 内联远程 `@import` 规则的额外选项
+ `inlineTimeout` - 内联远程 `@import` 规则失败的时间，单位是毫秒，默认是 5000
+ `level` - 使用的优化级别；默认是 1
+ `rebase` - URL 变基，默认为 true
+ `rebaseTo` - 所有 URL 变基的目录，一般是输出文件的目录，默认是当前目录
+ `returnPromise` - 是否 `minify` 返回 Promise 对象，默认是 false
+ `sourceMap` - 默认是 false
+ `sourceMapInlineSources`

### 命令行工具 clean-css-cli

```shell
-h, --help                     输出用法的信息
-v, --version                  output the version number
-c, --compatibility [ie7|ie8]  Force compatibility mode (see Readme for advanced examples)
-d, --debug                    Shows debug information (minification time & compression efficiency)
-f, --format <options>         Controls output formatting, see examples below
-o, --output [output-file]     Use [output-file] as output instead of STDOUT
-O <n> [optimizations]         Turn on level <n> optimizations; optionally accepts a list of fine-grained options, defaults to `1`, see examples below
--inline [rules]               Enables inlining for listed sources (defaults to `local`)
--inline-timeout [seconds]     Per connection timeout when fetching remote stylesheets (defaults to 5 seconds)
--remove-inlined-files         Remove files inlined in <source-file ...> or via `@import` statements
--skip-rebase                  Disable URLs rebasing
--source-map                   Enables building input's source map
--source-map-inline-sources    Enables inlining sources inside source maps
```  

优化多个文件：   

`cleancss -o merged.min.css one.css two.css three.css`   

或者使用 glob 模式匹配：   

`cleancss -o merged.min.css *.css`   

所以，其实这个工具也可以提供打包咯？

## chokidar-cli(1.2.0)

监听文件系统变动的命令行工具。底层库就是 Chokidar。   

安装：    

```shell
npm  install chokidar-cli
npm install -g chokidar-cli
```    

用法：   

默认情况下 chokidar 会将所有变动输出到标准输出：   

```shell
$ chokidar '**/.js' '**/*.less'
change:test/dir/a.js
change:test/dir/a.less
add:test/b.js
unlink:test/b.js
```   

当当前目录树变动时运行 `npm run build-js`   

`chokidar '**/*.js' -c 'npm run build-js'`    

```s
Usage: chokidar <pattern> [<pattern>...] [options]

<pattern>:
Glob pattern to specify files to be watched.
Multiple patterns can be watched by separating patterns with spaces.
To prevent shell globbing, write pattern inside quotes.
Guide to globs: https://github.com/isaacs/node-glob#glob-primer


Options:
  -c, --command           Command to run after each change. Needs to be
                          surrounded with quotes when command contains spaces.
                          Instances of `{path}` or `{event}` within the command
                          will be replaced by the corresponding values from the
                          chokidar event.
  -d, --debounce          Debounce timeout in ms for executing command
                                                                  [default: 400]
  -t, --throttle          Throttle timeout in ms for executing command
                                                                  [default: 0]
  -s, --follow-symlinks   When not set, only the symlinks themselves will be
                          watched for changes instead of following the link
                          references and bubbling events through the links path
                                                      [boolean] [default: false]
  -i, --ignore            Pattern for files which should be ignored. Needs to be
                          surrounded with quotes to prevent shell globbing. The
                          whole relative or absolute path is tested, not just
                          filename. Supports glob patters or regexes using
                          format: /yourmatch/i
  --initial               When set, command is initially run once
                                                      [boolean] [default: false]
  -p, --polling           Whether to use fs.watchFile(backed by polling) instead
                          of fs.watch. This might lead to high CPU utilization.
                          It is typically necessary to set this to true to
                          successfully watch files over a network, and it may be
                          necessary to successfully watch files in other non-
                          standard situations         [boolean] [default: false]
  --poll-interval         Interval of file system polling. Effective when --
                          polling is set                          [default: 100]
  --poll-interval-binary  Interval of file system polling for binary files.
                          Effective when --polling is set         [default: 300]
  --verbose               When set, output is more verbose and human readable.
                                                      [boolean] [default: false]
  --silent                When set, internal messages of chokidar-cli won't be
                          written.                    [boolean] [default: false]
  -h, --help              Show help                                    [boolean]
  -v, --version           Show version number                          [boolean]

Examples:
  chokidar "**/*.js" -c "npm run build-js"  build when any .js file changes
  chokidar "**/*.js" "**/*.less"            output changes of .js and .less
                                            files
```   

注意目前使用 npm scripts 构建时有问题，将后面的命令当成了监听目录。所有目前要监听的话只能
直接调用命令行。   

## autoprefixer

目前来看，如果不使用构建工具的话，只能使用 postcss-cli 来使用命令行执行 autoprefixer：  

```shell
npm install --global postcss-cli autoprefixer
postcss *.css --use autoprefixer -d build/
```   

--use 是指使用的插件，这里就是 autoprefixer，-d 是输出目录，具体可以查询postcss -h。    

## Browserlist

autoprefixer 使用 browserlist 来指定项目想要兼容的浏览器，所以这里介绍一些这个。   

注意这个工具其实 babel-preset-env 及其他的一些库也用。   

所以的这些工具都会在 package.json 文件中寻找配置：    

```json
{
  "browserslist": [
    "> 1%",
    "last 2 versions"
  ]
}
```   

或者使用独立的配置文件 .browserslistrc:   

```
# Browsers that we support

> 1%
Last 2 versions
IE 10 # sorry
```    

准确来说，Browserlist 会从下面的东西中寻找浏览器的查询条件：   

1. 工具的配置。例如 Autoprefixer 的 `browsers` 选项
2. `BROWSERSLIST` 环境变量
3. 当前目录或父级目录的 `browserslist` 配置文件
4. 当前目录或父级目录的 `.browserslistrc` 配置文件
5. 当前目录或父级目录 package.json 文件的 `browserslist` 字段
6. 如果上面的没提供一个有效的列表，就使用默认的 `> 1%, last 2 versions, Firefox ESR`    

可以指定版本（大小写不敏感）：    

+ `last 2 versions`: 每个浏览器的最新两个版本
+ `last 2 Chrome versions`: Chrome 的最新两个版本
+ `> 5%` or `>= 5%`: 根据使用率来选择版本
+ `> 5% in  US`
+ `> 5% in my stats`
+ `ie 6-8`: 指定版本的范围
+ `Firefox > 20`
+ `Firefox >= 20`
+ `Firefox < 20`
+ `Firefox <= 20`
+ `Firefox ESR`: 最新版
+ `iOS 7`:
+ `not ie <= 8`

## Yeoman

按照命令行工具： `npm install -g yo`   

之后就是安装特定的 generator 了。     

题外话：Windows 命令行工具 [cmder](http://cmder.net/)    
