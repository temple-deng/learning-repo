#  webpack
---
		作者：张轩
		链接：http://zhuanlan.zhihu.com/p/20367175
		来源：知乎
---
---
    1.配置文件
---

####  配置文件
配置文件主要分三块：  
1.entry 入口文件，让webpack用哪个文件来作为项目的入口  
2.output 出口， 让webpack把处理完的文件放哪里  
3.module 模块，要用什么不同的模块来处理各种类型的文件  

```javascript
	//示例
	var path = require('path');
	var HtmlwebpackPlugin = require('html-webpack-plugin');     
	//定义了一些文件夹的路径
	var ROOT_PATH = path.resolve(__dirname);
	var APP_PATH = path.resolve(ROOT_PATH, 'app');
	var BUILD_PATH = path.resolve(ROOT_PATH, 'build');

	module.exports = {
	  //项目的文件夹 可以直接用文件夹名称 默认会找index.js 也可以确定是哪个文件名字
	  entry: APP_PATH,

	  //输出的文件名 合并以后的js会命名为bundle.js
	  output: {
	    path: BUILD_PATH,
	    filename: 'bundle.js'
	  },

	  //添加我们的插件 会自动生成一个html文件
	  plugins: [
	    new HtmlwebpackPlugin({
	      title: 'Hello World app'
	    })
	  ],


		//注意loaders的处理顺序是从右到左的，这里就是先运行css-loader然后是style-loader.
		loaders: [
		      {
		        test: /\.css$/,
		        loaders: ['style', 'css'],
		        include: APP_PATH
		      }
		    ],

	  //配置webpack-dev-server     执行命令webpack-dev-server --hot --inline
 
		devServer: {
		    historyApiFallback: true,
		    hot: true,
		    inline: true,
		    progress: true,
		  }
	};
```

webpack使用loader的方式来处理各种各样的资源，比如说样式文件，我们需要两种loader，css-loader 和 style-loader，css-loader会遍历css文件，找到所有的url(...)并且处理。style-loader会把所有的样式插入到你页面的一个style tag中。


你的项目有时候会要加载各种各样的第三方库，一些老的库不支持AMD或者CommonJS等一些先进的格式，比如一些jQuery的插件，它们都依赖jQuery，如果直接引用就会报错 jQuery is not undefined这类的错误  
1.webpack提供一个插件 把一个全局变量插入到所有的代码中，在config.js里面配置
```
...
  plugins: [
    new HtmlwebpackPlugin({
      title: 'Hello World app'
    }),
    //provide $, jQuery and window.jQuery to every script
    new webpack.ProvidePlugin({                  //为什么我感觉这里的jquery应该是jQuery呢？
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery"
    })
  ]
  ...
```
2.使用imports-loader `npm install imports-loader --save-dev`然后在入口js中
```
//注意这种写法 我们把jQuery这个变量直接插入到plugin.js里面了
//相当于在这个文件的开始添加了 var jQuery = require('jquery');
import 'imports?jQuery=jquery!./plugin.js';
```
<br>
<br>

###  1.motivation 动机
**transferring**
Modules should be executed on the client, so they must be transferred from the server to the browser.

There are two extremes on how to transfer modules:

    1 request per module
    all modules in one request
模块应该在客户端执行，所以必须从服务器传输到客户端。
现有两种极端的方式传输模块。  
1.每个模块发1次请求  
2.所有模块合并成1个请求

Both are used in the wild, but both are suboptimal:

    1 request per module
        Pro: only required modules are transferred
        Con: many requests means much overhead
        Con: slow application startup, because of request latency
    all modules in one request
        Pro: less request overhead, less latency
        Con: not (yet) required modules are transferred too
但是两种都太粗暴，而且都是次优的：  
Chunked transferring 分块传输
While compiling all modules: Split the set of modules into multiple smaller batches (chunks).
虽然编译所有的模块：但是会把一系列模块分散成多个小块。  
We get multiple smaller requests. Chunks with modules that are not required initially are only requested on demand. The initial request doesn’t contain your complete code base and is smaller.
The “split points” are up to the developer and optional.
会得到许多小的请求，这些模块只有在需要的时候才会传输，而不是在初始化时就必须的。

<br>
<br>

###　2.code Splitting 代码分割
To clarify a common misunderstanding: Code Splitting is not just about extracting common code into a shared chunk. The more notable feature is that Code Splitting can be used to split code into an on demand loaded chunk. This can keep the initial download small and downloads code on demand when requested by the application.
代码分割不仅仅把公用代码打包进一个块里，更值得关注的特征是代码分割可以将代码分割进一个按需加载的代码块里。这就可以保持初始的下载量小，并且在需要时再下载代码。

**Defining a split point**
CommonJs: require.ensure  
require.ensure(dependencies, callback)  
在dependencies里的依赖会单独打包文件（应该不需要配置），并且这个文件只有在调用的时候才会去加载  

AMD: require  
AMD的这个虽然也会单独打包，文件也会延迟加载，但是执行顺序上没有变化，仍然会先执行依赖的模块。

**Chunk content**
All dependencies at a split point go into a new chunk. Dependencies are also recursively added.

If you pass a function expression (or bound function expression) as callback to the split point, webpack automatically puts all dependencies required in this function expression into the chunk too.  
所有代码分割点的依赖会在一个新的分块里。并且会递归添加进去。   
后面的这段无法理解，因为代码分割点究竟是什么还不清楚  

**Chunk optimization**（这部分更是无法理解）  
If two chunks contain the same modules, they are merged into one. This can cause chunks to have multiple parents.  
如果两个代码块包含同样的模块，两个会合并为一个。这可能造成代码块有多个父块。  
If a module is available in all parents of a chunk, it’s removed from that chunk.  
If a chunk contains all modules of another chunk, this is stored. It fulfills multiple chunks.

**Chunk loading**
Depending on the configuration option target a runtime logic for chunk loading is added to the bundle. I. e. for the web target chunks are loaded via jsonp. A chunk is only loaded once and parallel requests are merged into one. The runtime checks for loaded chunks whether they fulfill multiple chunks.  
根据配置文件里的target选项，运行时所需要的块会被加载编译到bundle文件里。换言之，其他的web目标代码块会通过jsonp加载， 每个代码块加载一个并且并行请求会被合并成一个。  

**Chunk types**
Entry chunk ：An entry chunk contains the runtime plus a bunch of modules. If the chunk contains the module 0 the runtime executes it. If not, it waits for chunks that contains the module 0 and executes it (every time when there is a chunk with a module 0).  
入口代码块：入口代码块包括运行时需要的一系列模块。如果代码块包括模块0，运行时就会执行它。如果没有，会等到包含模块0的代码块并执行。  
Normal chunk：A normal chunk contains no runtime. It only contains a bunch of modules. The structure depends on the chunk loading algorithm. I. e. for jsonp the modules are wrapped in a jsonp callback function. The chunk also contains a list of chunk id that it fulfills.  
看不懂。。。。  
Initial chunk (non-entry)：An initial chunk is a normal chunk. The only difference is that optimization treats it as more important because it counts toward the initial loading time (like entry chunks). That chunk type can occur in combination with the CommonsChunkPlugin.  
初始块


<br>
<br>
###   multiple entry points
If you need multiple bundles for multiple HTML pages you can use the “multiple entry points” feature. It will build multiple bundles at once. Additional chunks can be shared between these entry chunks and modules are only built once.  
如果需要为多个HTML文件打包多个文件，可能会用到多重入口特征。 webpack会马上生成多个打包文件。 额外的代码块可以被多个入口块共用。  
示例：https://github.com/webpack/webpack/tree/master/examples/multiple-entry-points

<br>
<br>

###　配置选项
context：对于入口文件配置的基础目录（绝对路径）`Default: process.cwd()`  

entry:   打包文件的入口点。可以是数组或字符串或对象（数组这个还没试过效果），如果是对象就是多个入口点，多个打包文件，key是chunk名，value可以是字符串或数组。  

output:<br>
output.filename ：指明输出文件的名字，不可以使用绝对路径。 如果创建了不止一个chunk(比如多入口点或者CommonsChunkPlugin)，就应该使用 [name][hash][chunkhash]来替换名字来确保每个文件的名字是单一的。<br>
		[name] 用chunk名来代替 [hash]用hash  [chunkhash]。。。<br>
output.path : 输出目录的绝对路径 可以有[hash]   <br>
output.chunkFilename: 非入口chunk的文件名，相对于output.path目录。[id] chunk id[name] [hash][chunkhash] <br>

module.loaders : 对象数组，每项可以有以下属性<br>
						test: 符合的情况 exclude: 不符合的情况 include: 和test一样？ <br>
						loader: 用"!"分割的字符串加载器 loaders: 数组形式   <br>
IMPORTANT: The loaders here are resolved relative to the resource which they are applied to. This means they are not resolved relative to the configuration file. If you have loaders installed from npm and your node_modules folder is not in a parent folder of all source files, webpack cannot find the loader. You need to add the node_modules folder as absolute path to the resolveLoader.root option. (resolveLoader: { root: path.join(__dirname, "node_modules") })  

module.preLoaders, module.postLoaders ：Syntax like module.loaders.  <br>
module.noParse： RegExp或者RegExp数组， 不会解析符合的文件   <br>

resolve.alias ： 用其他的模块或者路径取代模块名。<br>
resolve.extensions ：An array of extensions that should be used to resolve modules. For example, in order to discover CoffeeScript files, your array should contain the string ".coffee".						
