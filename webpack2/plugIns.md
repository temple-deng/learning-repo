# Plugins  
<!-- TOC -->

- [clean-webpack-plugin(0.1.16)](#clean-webpack-plugin0116)
- [CommonsChunkPlugin](#commonschunkplugin)
  - [配置](#配置)
- [DefinePlugin](#defineplugin)
  - [用法](#用法)
- [DllPlugin](#dllplugin)
  - [`DllPlugin`](#dllplugin)
  - [`DllReferencePlugin`](#dllreferenceplugin)
  - [两种模式](#两种模式)
- [ProvidePlugin](#provideplugin)
- [webpack-manifest-plugin](#webpack-manifest-plugin)
  - [配置](#配置-1)
- [webpack-bundle-analyzer](#webpack-bundle-analyzer)
  - [Definitions](#definitions)

<!-- /TOC -->

## clean-webpack-plugin(0.1.16)

在构建前清理构建文件夹。    

例子：    

```js
var CleanWebpackPlugin = require('clean-webpack-plugin');
 
module.exports = {
  plugins: [
    new CleanWebpackPlugin(['dist', 'build'], {
      root: '/full/project/path',
      verbose: true,
      dry: false,
      exclude: ['shared.js']
    })
  ]
}
```   

**用法**   

`new CleanWebpackPlugin(paths [, options])`    

+ `path` 一个清理路径的数组。   
+ `options` 默认值如下   

```js
{
  "root": "[location of webpack.config]", // 根路径的绝对路径地址
  "verbose": true, // 向标准输出写入记录
  "dry": false, // 设为 false 就删除文件，true 不删除，搞不清楚不删除是几个意思
  "exclude": ["files", "to", "ignore"] // 指定一些不会被删除的文件吧
  "watch": false // 如果为 true，应该是 watch 模式下重新编译时也会删除文件
}
```    

## CommonsChunkPlugin

`CommonsChunkPlugin` 插件，是一个可选的用于建立一个独立文件(又称作 chunk)的功能，这个文件包括多个入口 `chunk` 的公共模块。通过将公共模块拆出来，最终合成的文件能够在最开始的时候加载一次，便存起来到缓存中供后续使用。这个带来速度上的提升，因为浏览器会迅速将公共的代码从缓存中取出来，而不是每次访问一个新页面时，再去加载一个更大的文件。    

`new webpack.optimize.CommonsChunkPlugin(options)`   

### 配置

```js
{
  name: string, // or
  names: string[],
  // 这是 common chunk 的名称。已经存在的 chunk 可以通过传入一个已存在的 chunk 名称而被选择。
  // 如果一个字符串数组被传入，这相当于插件针对每个 chunk 名被多次调用
  // 如果该选项被忽略，同时 `options.async` 或者 `options.children` 被设置，所有的 chunk 都会被使用，否则 `options.filename` 会用于作为 chunk 名。
  // 数组情况下测试的时候情况是，数组的第一个元素会成为公共模块所在的 chunk，最后一个元素会成为 bootstrap 代码所在的 chunk。

  filename: string,
  // common chunk 的文件名模板。可以包含与 `output.filename` 相同的占位符。
  // 如果被忽略，原本的文件名不会被修改(通常是 `output.filename` 或者 `output.chunkFilename`)
  // 这里 name 和 filename 与入口点文件的 name 与 filename类似

  minChunks: number|Infinity|function(module, count) -> boolean,
  // 在传入  公共chunk(commons chunk) 之前所需要包含的最少数量的 chunks 。
  // 数量必须大于等于2，或者少于等于 chunks的数量
  // 传入 `Infinity` 会马上生成 公共chunk，但里面没有模块。
  // 你可以传入一个 `function` ，以添加定制的逻辑（默认是 chunk 的数量）
  // 这个参数是这个意思，比如我们设置为3，那么只有在不同模块中被引用3次及以上的模块才会被提取到公共的 chunk中
  // 那么小于3次可以说是不被认为是公共模块

  chunks: string[],
  // 通过 chunk name 去选择 chunks 的来源。chunk 必须是公共chunk 的子模块。
  // 如果被忽略，所有的，所有的 入口chunk (entry chunk) 都会被选择。
  // 感觉这个选项就是决定我们在使用这个插件提取公共 chunk 时，是根据哪几个入口点提取的，比如说这里有一个入口点没有
  // 包含在这个数组中，那么这个入口点相同与进行了普通的打包，不参与任何的提取过程


  children: boolean,
  // 如果设置为 `true`，所有公共chunk 的子模块都会被选择

  async: boolean|string,
  // 如果设置为 `true`，一个异步的  公共chunk 会作为 `options.name` 的子模块，和 `options.chunks` 的兄弟模块被创建。
  // 它会与 `options.chunks` 并行被加载。可以通过提供想要的字符串，
  // 而不是 `true` 来对输出的文件进行更换名称。

  minSize: number,
  // 在 公共chunk 被创建立之前，所有 公共模块 (common module) 的最少大小。
}
```    

## DefinePlugin

`DefinePlugin` 允许我们创建一些在编译时可以配置的全局常量。貌似主要是这个样子，
这个插件的参数是一个对象，对象的键名就是我们定义的一系列代码中可能使用的全局变量，
键值应该就是我们希望的全局变量的值，然后在编译的时候这个插件会将所有的全局变量名用
变量值替换掉。        

```js
new webpack.DefinePlugin({
  // 常量定义...
});
```   

### 用法

传给 `DefinePlugin` 对象参数的每个键名都是一个标识符，或者多个用 `.` 连接起来的标识符。    

+ 如果键值是一个字符串，那么这个值就会当做一个代码片段。
+ 如果不是字符串，就转换为字符串。
+ 如果值是对象，那么对象的所有键名按照同样的方式处理。
+ 如果在键名前缀 `typeof`，那么这个替换应该是只发生在 typeof 调用时。    

这个值最终会内联进代码中，从而可以让一些代码压缩工具移除那些多余的条件。   

```js
new webpack.DefinePlugin({
  PRODUCTION: JSON.stringify(true),
  VERSION: JSON.stringify("5fa3b9"),
  BROWSER_SUPPORTS_HTML5: true,
  TWO: "1+1",
  "typeof window": JSON.stringify("object")
})
```    

_Note:_ 注意，因为这个插件直接执行文本替换，给定的值必须包含字符串本身内的实际引号。通常，有两种方式来达到这个效果，使用 `'"production"'`, 或者使用 `JSON.stringify('production')`。     

## DllPlugin

`DllPlugin` 和 `DllReferencePlugin` 提供了一种分隔打包代码的方式，这种方式可以
大幅度提高构建性能。貌似是这个样子，通常一些我们不会修改的第三方代码在每次打包时
都会重新解析打包，这就降低了构建性能。这两个插件呢就是可以让我们比如说提前将一些第三方
代码打包好，貌似成打包成一个库的样子，所以必须结合 `library` 配置，然后之后在我们
真正打包应该代码的时候可能就不会再去编译那些打包好的第三方代码。        

### `DllPlugin` 

这个插件专门用于单独的 webpack 配置来创建一个dll-only-bundle。也就是我们事先创建一份
配置文件来专门编译一些打包在一起的第三方代码。它会创建一个
`manifest.json` 文件，`DllReferencePlugin` 用来映射依赖。    

+ `context`(optional): manifest 文件中要求的上下文（默认是 webpack 上下文）貌似这个也是个路径，默认应该是 webpack 的 cwd 地址。可能是在打包时用来寻找打包模块位置的上下文目录。
+ `name`: 暴露的 dll 函数的名字（模板路径 `[hash]` & `[name]`）注意这个应该是和 `output.library` 保持一致。
+ `path`: manifest 文件的绝对路径。   

`new webpack.DllPlugin(options)`    

创建一个 `manifest.json` 文件，这个文件包含了 `require` 和 `import` 请求模块到
模块 ID 的映射。最终会被 `DllReferencePlugin` 使用。     

也就说这个插件主要是生成第三方代码打包文件的。     

### `DllReferencePlugin`   

这个插件的话就是在我们打包应用代码的配置中使用了，这个插件会引用已经预打包了 dll-only-bundle。     

+ `context`: （绝对路径）manifest  中的请求上下文。
+ `manifest` (object): 一个包含 `content` 和 `name` 的对象
+ `content`(optional): 从请求到模块 ID 的映射
+ `name`(optional): dll 暴露的名字
+ `scope`(optional): 用来访问 dll 内容的前缀
+ `sourceType`(optional): dll 是怎样暴露的   

`new webpack.DllReferencePlugin(options)`     

### 两种模式

这个插件可以使用两种不同模式使用，`scoped` 和 `mapped`。   

`scoped` 模式的话，dll 的内容是通过添加一个模块前缀使用的。例如 `scope = "xyz"`，那么dll中 `abc` 文件必须使用 `require('xyz/abc')` 访问。    

`mapped` 模式的话，dll 中的内容是对应于当前目录的。    

## ProvidePlugin

自动加载模块，而不用我们 `import` 和 `require`。    

```js
new webpack.ProvidePlugin({
  identifier: 'module1',
  // ...
})
```    

## webpack-manifest-plugin 

```js
var ManifestPlugin = require('webpack-manifest-plugin');
 
module.exports = {
    // ... 
    plugins: [
      new ManifestPlugin()
    ]
};
```   

这个模块会在输出目录中生成一个 `manifest.json` 文件，这个反应了所有源文件文件名
到其对应的输出文件的映射。例如：    

```json
{
  "mods/alpha.js": "mods/alpha.1234567890.js",
  "mods/omega.js": "mods/omega.0987654321.js"
}
```   

### 配置

+ `filename`: manifest 文件的名字咯。
+ `basePath`: 一个路径前缀，会添加到所有引用文件中。注意这个前缀会同时出现在键名和键值中，不过需要注意的是并不会修改文件本身的名字，只是在 `manifest.json` 文件中为
所有文件生成一个提示性的前缀，注意是直接前缀到字符串中，不会自动添加 `/`。
+ `publicPath`: 一个只会添加到输出文件中的路径前缀。如果同时提供了 `basePath`，则`publicPath` 会被忽略。
+ `stripSrc`: 从源文件名中移除不想要的字符串（字符串或者正则）
+ `writeToFileEmit`: 如果设为 `true` 会和 `webpack-dev-server` 一起结合使用。
+ `seed`: 一个用来 seed manifest 的缓存键值对。   

## webpack-bundle-analyzer

有两种方式来使用这个模块：   

第一种是作为插件:   

`npm install --save-dev webpack-bundle-analyzer`  

```js
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
 
// ... 
plugins: [new BundleAnalyzerPlugin()]
// ... 
```    

`BundleAnalyzerPlugin` 构造函数接受一个可选的选项配置对象参数，默认值如下：    

```js
new BundleAnalyzerPlugin({
  // 值可以是 server, static, disabled
  // 在 sever 模式下，分析器会启动一个 HTTP 服务器来展示打包报告
  // 在 static 模式下，会生成一个但一个打包报告的 HTML 文件
  // 在 disabled 模式下，可以通过设置 generateStatsFiles 为 true 来使用这个插件生成 Webpack Stats JSON file
  analyzerMode: 'server',
  // 在 server 模式下使用的 Host 
  analyzerHost: '127.0.0.1',
  // 在 server 模式下使用的端口
  analyzerPort: 8888,
  // 在 static 模式下生成报告文件的路径
  // 相对于打包输出目录
  reportFilename: 'report.html',
  // 默认情况下会在报告中展示模块的尺寸
  // 值可以是 stat, parsed, gzip
  // 查看 Definitions 部分获取更多信息
  defaultSizes: 'parsed',
  // 在浏览器中自动打开报告
  openAnalyzer: true,
  // 如果设为 true，会在输出目录生成 Webpack Stats JSON file
  generateStatsFile: false,
  // Webpack Stats JSON 文件的名字
  statsFilename: 'stats.json',
  // For example you can exclude sources of your modules from stats file with `source: false` option. 
  // See more options here: https://github.com/webpack/webpack/blob/webpack-1/lib/Stats.js#L21 
  // stats.toJson() 方法的选项
  statsOptions: null,
  // Log level. Can be 'info', 'warn', 'error' or 'silent'. 
  logLevel: 'info'
})
```  

第二种方式是作为 CLI 工具：   

我们可以利用这个工具分析已经存在的 Webpack Stats JSON 文件。   

或者使用下面的命令生成 Webpack Stats JSON 文件：    

`webpack --profile --json > stats.json`    

### Definitions

webpack-bundle-analyzer 报告了3种值：   

+ Stat size: 这个我们文件的输入尺寸，这个输入是指在例如最小化压缩的转换前。    
+ Parsed size: 这个是我们文件的输出尺寸，如果我们使用 Uglify 压缩过，那么这个值
就是压缩后的尺寸。
+ Gzip size：通过 gzip 压缩后的尺寸咯。

