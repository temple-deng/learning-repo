# webpack-dev-server

### 启动server
首先明确一点， 启动webpack-dev-server应该有两种方式， 一种是直接用命令行`webpack-dev-server`启动服务器， 第二种就是编写脚本， 使用WebpackDevServer API来启动服务器。

webpack_dev_server应该是要和publicPath配置搭配起来用，server会在这个配置的相对路径处在内存中生成对应的文件，如果不加任何配置，server在文件修改后会重新编译，但是不会自动刷新。  

### 针对于命令行启动方式的自动刷新
Server自动刷新有两种模式 ： iframe mode 和 inline mode。 每种同样也支持HMR热模块替换。

#### iframe mode
使用这种模式自动刷新页面无需额外的配置，只要打开浏览器到http://<path>:<port>/webpack-dev-server/<path>即可。使用这种模式有下面的几个特点：  
+ 无需更改配置  
+ 会有一个信息导航栏在app上面  
+ url变化不会反应到浏览器上的url部分  

#### inline mode
命令行启动情况下开启inline模式有以下几种方式
1. 使用命令行选项 --inline参数（这种模式可能是在bundle文件中添加了socket连接，当服务器文件有改动的时候通过socket连接通知客户端刷新页面）。  

2. 在页面中嵌入js脚本文件
`<script src="http://localhost:8080/webpack-dev-server.js"></script>`

3. 在配置文件里的所有入口配置数组里添加一个入口文件`webpack-dev-server/client?http://<path>:<port>/`。 

4. 可以单独在配置里添加devServer的配置。
```javascript
devServer: {
        historyApiFallback: true,
		hot:true
        inline: true,
        progress: true
    }
```


#### 针对于命令行启动方式的HMR
命令行启动情况下开启Hot Module Replacement的方式

1. 最简单的方式是启动server时候添加 --hot参数， 这会在webpack的配置中添加`HotModuleReplacementPlugin`插件， 具体来说应该同时在入口点文件前添加了特殊的`webpack/hot/dev-server`， 这样看的话是不是 --inline参数也是同样的道理，在入口点前添加了`webpack-dev-server/client?http://<path>:<port>/`。

2. 基于配置文件的修改： 需要修改3处， 首先就是上面的那样， 在入口点前添加`webpack/hot/dev-server`， 之后在配置中添加new webpack.HotModuleReplacementPlugin()， 再然后就是针对server的配置部分devServer字段设置hot为true. (注， 本人实验时这种方式失败了， 不知道是不是必须使用脚本编写的server才可以)


### 编写脚本启动服务器
官网的例子
```javascript
var WebpackDevServer = require("webpack-dev-server");
var webpack = require("webpack");
var config = require('./webpack.config');
config.entry.app.unshift("webpack-dev-server/client?http://localhost:8080/", "webpack/hot/dev-server");
var compiler = webpack(config);

var server = new WebpackDevServer(compiler, {
  // webpack-dev-server options

  contentBase: "/path/to/directory",
  // or: contentBase: "http://localhost/",

  hot: true,
  // Enable special support for Hot Module Replacement
  // Page is no longer updated, but a "webpackHotUpdate" message is send to the content
  // Use "webpack/hot/dev-server" as additional module in your entry point
  // Note: this does _not_ add the `HotModuleReplacementPlugin` like the CLI option does. 

  // Set this as true if you want to access dev server from arbitrary url.
  // This is handy if you are using a html5 router.
  historyApiFallback: false,

  // Set this if you want to enable gzip compression for assets
  compress: true,

  // Set this if you want webpack-dev-server to delegate a single path to an arbitrary server.
  // Use "*" to proxy all paths to the specified server.
  // This is useful if you want to get rid of 'http://localhost:8080/' in script[src],
  // and has many other use cases (see https://github.com/webpack/webpack-dev-server/pull/127 ).
  proxy: {
    "*": "http://localhost:9090"
  },

  // pass [static options](http://expressjs.com/en/4x/api.html#express.static) to inner express server
  staticOptions: {
  },

  // webpack-dev-middleware options
  quiet: false,
  noInfo: false,
  lazy: true,
  filename: "bundle.js",
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  },
  publicPath: "/assets/",
  headers: { "X-Custom-Header": "yes" },
  stats: { colors: true }
});
server.listen(8080, "localhost", function() {});
// server.close();
```
注意这种方式webpack的配置并没有传递给WebpackDevServer API， 是直接生产了compiler， 所以webpack配置中针对server的配置项devServer， 并没有什么卵用， 而且这种方式也没有开启inline模式的配置项， 可以手动将文件插入到页面中， 或者像上面那样在入口点前添加东西。

所以这种方式如果想要开启inline模式和 HMR， 可以在webpack的配置文件中在入口点处添加两个元素`"webpack-dev-server/client?http://localhost:8080/`,`'webpack/hot/only-dev-server'`, 又或者在脚本文件中加载入的config中unshift这两个元素， 不过这样必须确保入口点是数组， 否则unshift会报错。
  
补充一个全栈刷新的文章链接：http://acgtofe.com/posts/2016/02/full-live-reload-for-express-with-webpack					