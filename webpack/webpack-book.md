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

### 内联的 Source Map

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

### 分离的 Source Map

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

### SourceMapDevToolPlugin, EvalSourceMapDevToolPlugin