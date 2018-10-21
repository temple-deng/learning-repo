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
          MinCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new MinCssExtractPlugin({
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
选项。    

这一小节和上一小节完整代码参看 demo02。    