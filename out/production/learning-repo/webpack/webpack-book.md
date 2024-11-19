## 介绍

![webpack-execution-process](https://raw.githubusercontent.com/temple-deng/markdown-images/master/other/webpack-execution-process.png)    

通常来说，loader 处理的结果就是将 loader 返回的内容注入到最终的打包文件中。而插件呢，
则可以在打包处理的不同阶段拦截到 webpack 发出的 runtime events。    

## 开发

```bash
Hash: aafe36ba210b0fbb7073
Version: webpack 4.1.1
Time: 338ms
Built at: 3/16/2018 3:40:14 PM
     Asset       Size  Chunks             Chunk Names
   main.js  679 bytes       0  [emitted]  main
index.html  181 bytes          [emitted]
Entrypoint main = main.js
   [0] ./src/index.js + 1 modules 219 bytes {0} [built]
       | ./src/index.js 77 bytes [built]
       | ./src/component.js 142 bytes [built]
Child html-webpack-plugin for "index.html":
     1 asset
    Entrypoint undefined = index.html
       [0] (webpack)/buildin/module.js 519 bytes {0} [built]
       [1] (webpack)/buildin/global.js 509 bytes {0} [built]
        + 2 hidden modules
```    

+ `main.js 679 bytes 0 [emitted] main` - 生成的资源的名称，尺寸，与其相关的 chunks
的 IDs，状态信息告诉我们它是怎样生成的，以及 chunk 的名字。
+ `[0] ./src/index.js + 1 modules 219 bytes   {0}  [built]` - 入口点的 ID，名称，
尺寸，入口 chunk Id，生成的方式。
+ `Child html-webpack-plugin for "index.html":` - 这是一个相关插件的输出。    

使用 nodemon 在更新 webpack 配置文件后自动重启 webpack-dev-server，首先安装：
`npm install nodemon --save-dev`。   

```json
{
  "scripts": {
    "start": "nodemon --watch webpack.config.js --exec 'webpack-dev-server'"
  }
}
```    

`webpack-merge` 做了两件事：拼接数组和合并对象。同时，我们还可以针对每个字段自定义一些
策略来更精确地控制其行为：向后添加，向前添加，还是直接替换。   

`--env` 选项好像必须是通过返回函数的配置才能获取到。   

## 样式

### 加载样式

css-loader 会遍历 css 文件，寻找出现的 `@import` 和 `url()` 并将它们看作是普通的
ES6 `import`。如果 `@import` 指向外部资源，css-loader 会跳过，因为 webpack 目前只处理
内部资源。例如像 `url("/static/img/demo.png")` 这样的绝对路径是不会进行处理的。    

style-loader 通过 `style` 元素注入样式。同时其也实现了 HMR。    

设置 css-loader 的 `sourceMap` 选项，以及 webpack 的 `output.publicPath` 选项启用
CSS 的 source map。如果我们还使用了其他的 loaders，可能每个 loader 都要配置对应的
source map。    

完整示例见 demo01。    

### 分离样式

使用 `mini-css-extract-plugin` 生成分离的打包文件。其可以将多个 CSS 文件聚合成一个。
出于这个原因，它还需要一个 loader 来处理这个导出过程。这个插件最后会挑选出由 loader
生成的聚合结果，然后生成一个分离的文件。    

需要注意的是这个插件不支持 HMR。    

安装 `npm i mini-css-extract-plugin --save-dev`，`MinCssExtractPlugin` 包含了一个
loader `MinCssExtractPlugin.loader`。   

```js
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css'
    })
  ]
};
```   

注意用了这个应该就不用 style-loader 了，但是好像同时 sourceMap 也没生效，不知道哪有问题。    

### CSS Tree Shaking

以一个不相关的 pure.css 样式框架作为示例。安装：`npm i purecss --save`。    

项目中导入 `import "purecss"` 这个其实最后解析完引入的是 `build/pure-min.css` 文件。    

安装 purifycss-wepback 和 glob: `npm i glob purifycss-webpack purify-css --save-dev`   

PurifyCSS 可能不会总能找到我们所使用的所有类，因此我们可能有时候需要配置一个白名单
`purifyOptions.whitelist` 数组，定义我们想要保留的选择器。   

同时，使用 Purify 也会干掉 source map 功能。   

注意 purifycss-webpack 插件必须在有生成 CSS 文件的情况下使用，例如 extract-text-webpack-plugin
和上一节的 mini-css-extract-plugin，而且插件顺序必须在它们后边。   

```js
const path = require('path');
const glob = require('glob');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PurifyCSSPlugin = require('purifycss-webpack');
 
module.exports = {
  entry: {...},
  output: {...},
  module: {
    rules: [
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          fallbackLoader: 'style-loader',
          loader: 'css-loader'
        })
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('[name].[contenthash].css'),
    // Make sure this is after ExtractTextPlugin!
    new PurifyCSSPlugin({
      // Give paths to parse for rules. These should be absolute!
      paths: glob.sync(path.join(__dirname, 'app/*.html')),
    })
  ]
}
```    

注意文档上说如果要遍历多个路径的话好像需要时 `glob-all` 包而不是 `glob`:   

```js
paths: globAll.sync([
  path.join(__dirname, '.php'),
  path.join(__dirname, 'partials/.php')
])
```    

但是很奇怪，如果用了 purifycss-webpack，好像 css 内容并没有 minify。必须手动配置 `minimize`
选项。不过也对，purifycss 只对 tree shaking，并没有说要 minimize。    

这一小节和上一小节完整代码参看 demo02。    

## 加载静态资源

使用 url-loader 内嵌静态资源，它可以将图片进行 base64 编码，然后把结果字符串打包到最终的
bundles 中。    

file-loader 可以输出图片文件并返回其路径而不是将图片内联。这项技术可以在其他静态资源上
使用，例如字体。   

url-loader 有一个 `limit` 配置项，可以在图片的大小到达阈值时，将图片的生成推给 file-loader。
也就是说小图片就内联，大图片不管。    

如果使用 `limit` 选项，就必须同时使用 url-loader 和 file-loader。    

如果想要压缩图片，使用 image-webpack-loader, svgo-loader, imagemin-webpack-plugin。
这种类型的 loader 应该第一个使用。    

resize-image-loader 和 reponsive-loader 可以让我们生成 `srcset`。   

字体：   

```js
{
  test: /\.(ttf|eot|woff|woff2)$/,
  use: {
    loader: "file-loader",
    options: {
      name: "fonts/[name].[ext]",
    },
  },
}
```   

## 构建

### Source Map

内联的 source map 由于有更好的性能因此在开发时更受用，而分离的 source map 文件可以减少
打包文件的尺寸，因此更适合在生产环境使用。    

隐藏的 source map 只提供堆栈信息。   

webpack 提供了两种使用 source map 的方式，一种是使用 `devtool` 配置字段，或者还有两种
插件可供使用。   

#### 内联的 Source Map

以代码 `console.log('Hello world')` 并使用 `NamedModulesPlugin` 为例，各个内联的
Source Map 生成代码如下：   

**`devtool: "eval"`**   

`eval` 将每个模块代码用一个 `eval` 函数包裹起来：   

```js
webpackJsonp([1, 2], {
  "./src/index.js": function(module, exports) {
    eval("console.log('Hello world');\n\n//////////////////\n// WEBPACK FOOTER\n// ./src/index.js\n// module id = ./src/index.js\n// module chunks = 1\n\n//# sourceURL=webpack:///./src/index.js?")
  }
}, ["./src/index.js"]);
```    

话说这里面包含了 source map 的内容吗？好像没有啊。。。    

**`devtool: "cheap-eval-source-map"`**    

`cheap-eval-source-map` 更进一步，使用了 base64 编码。结果只包含行数据，丢失列数据。   

```js
webpackJsonp([1, 2], {
  "./src/index.js": function(module, exports) {
    eval("console.log('Hello world');//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9hcHAvaW5kZXguanMuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9hcHAvaW5kZXguanM/MGUwNCJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zb2xlLmxvZygnSGVsbG8gd29ybGQnKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2FwcC9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gLi9hcHAvaW5kZXguanNcbi8vIG1vZHVsZSBjaHVua3MgPSAxIl0sIm1hcHBpbmdzIjoiQUFBQSIsInNvdXJjZVJvb3QiOiIifQ==")
  }
}, ["./src/index.js"]);
```    

**`devtool: "cheap-module-eval-source-map"`**    

同上，但是提供了更高的质量和低性能。   

```js
webpackJsonp([1, 2], {
  "./src/index.js": function(module, exports) {
    eval("console.log('Hello world');//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9hcHAvaW5kZXguanMuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vYXBwL2luZGV4LmpzPzIwMTgiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc29sZS5sb2coJ0hlbGxvIHdvcmxkJyk7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIGFwcC9pbmRleC5qcyJdLCJtYXBwaW5ncyI6IkFBQUEiLCJzb3VyY2VSb290IjoiIn0=")
  }
}, ["./src/index.js"]);
```    

**`devtool: "eval-source-map"`**   

这个是内联 source map 中质量最高的了，不过也是最慢的：   

```js
webpackJsonp([1, 2], {
  "./src/index.js": function(module, exports) {
    eval("console.log('Hello world');//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9hcHAvaW5kZXguanM/ZGFkYyJdLCJuYW1lcyI6WyJjb25zb2xlIiwibG9nIl0sIm1hcHBpbmdzIjoiQUFBQUEsUUFBUUMsR0FBUixDQUFZLGFBQVoiLCJmaWxlIjoiLi9hcHAvaW5kZXguanMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zb2xlLmxvZygnSGVsbG8gd29ybGQnKTtcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9hcHAvaW5kZXguanMiXSwic291cmNlUm9vdCI6IiJ9")
  }
}, ["./src/index.js"]);
```    

#### 分离的 Source Map

**`devtool: "cheap-source-map"`**    

与上面带有 cheap 的类型类似，丢失了列的信息。loader 提供的 source map 是不会被使用的。（啥意思）    

```json
{
  "file": "main.9aff3b1eced1f089ef18.js",
  "mappings": "AAAA",
  "sourceRoot": "",
  "sources": [
    "webpack:///main.9aff3b1eced1f089ef18.js"
  ],
  "sourcesContent": [
    "webpackJsonp([1,2],{\"./src/index.js\":function(o,n){console.log(\"Hello world\")}},[\"./src/index.js\"]);\n\n\n// WEBPACK FOOTER //\n// main.9aff3b1eced1f089ef18.js"
  ],
  "version": 3
}
```    

源代码文件末尾处会包含一个 `//# sourceMappingURL=main.9a...18.js.map` 注释。    

**`devtool: "cheap-module-source-map"`**    

```json
{
  "file": "main.9aff3b1eced1f089ef18.js",
  "mappings": "AAAA",
  "sourceRoot": "",
  "sources": [
    "webpack:///main.9aff3b1eced1f089ef18.js"
  ],
  "version": 3
}
```   

这个选项目前在启用 minify 功能的时候好像有问题，因此建议暂时不要使用这个选项。    

**`devtool: "hidden-source-map"`**    

等同于 `source-map`，除了不会在源代码文件中添加对 source map 文件的引用。    

**`devtool: "nosources-source-map"`**    

创建一个没有 `sourceContent` 的 source map。    

**`devtool: "source-map"`**   

质量最高，速度最慢：    

```json
{
  "file": "main.9aff3b1eced1f089ef18.js",
  "mappings": "AAAAA,cAAc,EAAE,IAEVC,iBACA,SAAUC,EAAQC,GCHxBC,QAAQC,IAAI,kBDST",
  "names": [
    "webpackJsonp",
    "./src/index.js",
    "module",
    "exports",
    "console",
    "log"
  ],
  "sourceRoot": "",
  "sources": [
    "webpack:///main.9aff3b1eced1f089ef18.js",
    "webpack:///./src/index.js"
  ],
  "sourcesContent": [
    "webpackJsonp([1,2],{\n\n/***/ \"./src/index.js\":\n/***/ (function(module, exports) {\n\nconsole.log('Hello world');\n\n/***/ })\n\n},[\"./src/index.js\"]);\n\n\n// WEBPACK FOOTER //\n// main.9aff3b1eced1f089ef18.js",
    "console.log('Hello world');\n\n\n// WEBPACK FOOTER //\n// ./src/index.js"
  ],
  "version": 3
}
```    

如果使用了 `UglifyJsPlugin`，记得配置插件的 `sourceMap: true`。     

#### SourceMapDevToolPlugin, EvalSourceMapDevToolPlugin

略。    

### 打包分割

#### Webpack4 production mode 下开箱即用的优化

webpack4 移除了 CommonsChunkPlugin，并用两个新的选项来替代它 `optimization.splitChunks`
和 `optimization.runtimeChunk`。    

默认情况下，这些优化只针对按需加载的 chunks。    

除了按需加载的 chunks 外，webpack 基于以下的情况会自动分割 chunks:   

+ 新的 chunk 可以被共享或者是在 `node_modules` 文件夹中的模块
+ 新的 chunk 大于 30kb（压缩前）
+ 当加载按需加载 chunks 时的并行请求数量小于等于 5
+ 初始页面加载的并行请求的数量小于等于 5

**例 1**    

```js
// entry.js
import("./a");
```    

```js
import "react"
// ...
```    

这种情况下会创建一个分离的 chunk，这里感觉应该 a.js 也会在一个单独的 chunk 中，在调用
`import()` 时，这个 chunk 会和原始的包含 `./` 的 chunk 并行加载。    

为什么呢？   

+ 条件1：chunk 是 `node_modules` 中的模块
+ 条件2：react 大于 30kb
+ 条件3：在 `import()` 调用时的并行请求数量是 2
+ 条件4：不影响初始页面请求的加载     

**例 2**    

```js
// entry.js
import('./a');
import('./b');
```    

```js
// a.js
import './helpers';  // helpers is 40kb in size
// ...
```    

```js
// b.js
import './helpers';
import './more-helpers'; // 40kb
// ...
```    

会为 helpers 创建一个额外的 chunk。     

#### 配置项

**Cache Groups**     

webpack 会将模块分配到不同的 cache groups。默认情况下，所有 `node_modules` 中的模块
会分配到一个叫做 `vendors` 的 cache group 中。所有至少出现了 2 次的模块分配到一个叫做
`default` 的 cache group 中。     

一个模块可以分配到多个 cache groups 中。webpack 通常是分配到一个高优先级 `priorty` 或者
一个大的 chunk 中的。    

**Conditions**    

当所有的条件满足时属于同一 chunk 和 cache group 的模块会形成一个新的 chunk。（不懂）    

有 4 个条件配置项：    

+ `minSize`（默认 30000），chunk 的最小尺寸
+ `minChunks`（默认 1），在分割前共享这个模块的最小的 chunk 数量
+ `maxInitialRequests`（默认 3）入口点的最大并行请求数量
+ `maxAsyncRequests`（默认 5）按需加载的最大并行请求数量

**Naming**     

配置项 `name` 定义分割的 chunk 的名字。     

注意：当给两个不同的 chunks 分配一个相同的名字时，这两个 chunk 会合并。    

如果设置为 `true` 会基于 chunk 和 cache group key 自动选择一个名字。    

如果名字与入口点名字相同，入口点会被移除。？？？？    

**Select chunks**    

`chunks` 配置项配置要被挑选的 chunks。可选值有 3 个 `initial, async, all`。分别对应
只选择初始 chunks，按需加载 chunks 和所有的 chunks。    

**Select modules**    

`test` 配置项控制 cache group 选择哪个模块。如果省略就选择所有模块。可以是正则、字符串
或函数。     

默认的配置如下：    

```js
splitChunks: {
  chunks: "async",
  minSize: 30000,
  minChunks: 1,
  maxAsyncRequests: 5,
  maxInitialRequests: 3,
  name: true,
  cacheGroups: {
    default: {
      minChunks: 2,
      priority: -20,
      reuseExisingChunk: true
    },
    venderos: {
      test: /[\\/]node_modules[\\/]/,
      priority
    }
  }
}
```    

`test`, `priority`, `reuseExisingChunk` 只能在 cache group 级别配置。    

### 样例

假如项目使用了 react, react-dom:    

```bash
$ npm install react react-dom --save
```   

如果想将 `node_modules` 中的分割到额外的 bundle 中，如下配置：   

```js
  optimization: {
    splitChunks: {
      chunks: 'initial'
    }
  }
```    

这时候会生成一个叫做 `vendors~app.bundle.js` 的文件（这个名字默认依赖于入口点的名字）。
而且这个文件会包括启动代码。    

如果将上述配置补充完整就是：    

```js
optimization: {
  splitChunks: {
    cacheGroups: {
      commons: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendor',
        chunks: 'initial'
      }
    }
  }
}
```    

Webpack 中三种不同类型的 chunk:   

+ **Entry chunks** - 包含 webpack 启动代码和要加载的模块
+ **Normal chunks** - 不包含启动代码。可以在应用运行时动态加载。
+ **Initial chunks** - 也是 normal chunks 但是可能是数量到达并发请求的数量上限时，其他
的 initial chunks 就作为了 normal chunks。    

### 代码分割

首先其实我们可以明确的一点是，分块打包和懒加载是两个不同的功能，如果只分块打包的话，我们
仍然要将所有的 chunks 写到 html 中的 script 中，而且页面初始加载时，所有的 chunks 都
要加载，光做这点优化，只方便了多个不同的应用间共享一些公共代码。但是懒加载其实是依托于
分块打包技术的，不然如果我们所有代码都打到一个包中，如何做懒加载。    

在 webpack 中主要使用两种方式来实现代码分割：动态 `import()` 函数和 `require.ensure`。
那其实分块打包只是 webpack 针对满足一些要求的模块额外打包出来，而代码分割其实是我们在
代码中明确暗示一个模块应该额外打个包，前者通过配置以及整个应用对模块的应用来推断出哪些
模块要分开打包，而后者则是在应用代码中明确提出要额外打包。    

```js
import(/* webpackChunkName: "optional-name" */ "./module").then(
  module => {...}
).catch(
  error => {...}
);
```    

可选的名字可以让我们将多个分割点打包到一个文件中，不然的话每个分割点都生成一个分离的文件。    

## 优化

### 最小化

在 webpack4 中，最小化过程通过两个配置项 `optimization.minimize` 和 `optimization.minimizer`
来控制。    

除了最小化以外，还有一些其他的方案可以预处理我们的代码，以便可以让代码运行的更快。这些
方案可以作为最小化的一种补充，这些技术包括 **scope hoisting**, **pre-evaluation**,
**improving parsing**。    

**Scope Hoisting**    

webpack4 中生产模式下默认使用了 scope hoisting。它会将所有模块提升至一个单一的作用域
中，而不是每个模块写到一个分离的闭包中。    

**Pre-evaluation**    

prepack-webpack-plugin 使用了 Prepack，一个局部的 JS 执行器。可以在编译阶段重写一些
计算结果，因此可以加速代码的执行。   

**Improving Parsing**    

optimize-js-plugin。    

### 环境变量

首先 JS minifier 可以移除一些死代码(`if (false)`)，那么如果我们使用 `DefinePlugin`
替换一些变量，那么 `if (process.env.NODE_ENV === 'development')` 就可以转换为
`if (true)` 或者 `if (false)`，进而代码可以被 minifier 处理。    