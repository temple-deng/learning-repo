# Plugins

<!-- TOC -->

- [Plugins](#plugins)
  - [1. HtmlWebpackPlugin](#1-htmlwebpackplugin)
    - [1.1 配置项](#11-配置项)
    - [1.2 模板](#12-模板)
    - [1.3 最小化](#13-最小化)
  - [2. webpack-manifest-plugin](#2-webpack-manifest-plugin)
    - [2.1 配置项](#21-配置项)
      - [filename](#filename)
      - [publicPath](#publicpath)
      - [basePath](#basepath)
      - [writeToFileEmit](#writetofileemit)
      - [seed](#seed)
      - [filter](#filter)
      - [map](#map)
      - [sort](#sort)
      - [generate](#generate)
      - [serialize](#serialize)
      - [FileDescriptor](#filedescriptor)
  - [3. clean-webpack-plugin](#3-clean-webpack-plugin)
    - [3.1 配置项](#31-配置项)
      - [path](#path)
      - [options](#options)
  - [4. SplitChunksPlugin](#4-splitchunksplugin)
    - [4.1 配置项](#41-配置项)
      - [automaticNameDelimiter](#automaticnamedelimiter)
      - [chunks](#chunks)
      - [maxAsyncRequests](#maxasyncrequests)
      - [maxInitialRequests](#maxinitialrequests)
      - [minChunks](#minchunks)
      - [minSize](#minsize)
      - [maxSize](#maxsize)
      - [name](#name)
      - [cacheGroups](#cachegroups)
      - [cacheGroups.priority](#cachegroupspriority)
      - [cacheGroups.{cacheGroup}.reuseExistingChunk](#cachegroupscachegroupreuseexistingchunk)
      - [cacheGroups.{cacheGroup}.test](#cachegroupscachegrouptest)
      - [cacheGroups.{cacheGroup}.filename](#cachegroupscachegroupfilename)
  - [5. HashedModuleIdsPlugin](#5-hashedmoduleidsplugin)

<!-- /TOC -->

## 1. HtmlWebpackPlugin

```shell
$ npm install --save-dev html-webpack-plugin
```    

插件会生成一个 H5 文件，并用 `script` 标签引入了所有的 webpack 打包文件。如果有 CSS 静态文件，
那也会使用 `link` 标签添加到 head 中。   

### 1.1 配置项

名称 | 类型 | 默认值 | 描述
---------|----------|---------|---------
 `title` | str | `Webpack App` | 文档标题
 `filename` | str | `index.html` | 文件名
 `template` | str | '' | 模板路径
 `templateParameters` | bool or obj or func | '' | 覆盖模板中的参数
 `inject` | bool or str | `true` | `true || 'head' || 'body' || false` 插入位置。
 `favicon` | str | '' | favicon 的路径
 `meta` | obj | `{}` | meta 标签
 `minify` | bool or obj | production 为 `true` 否则是 `false` | 是否压缩以及如何压缩
 `hash` | bool | `false` | `true` 的话会在所有的脚本和 css 文件中添加 webpack 的编译哈希
 `cache` | bool | `true` | 只在文件修改时生成文件
 `showErrors` | bool | `true` | 
 `chunks` | `{?}` | `?` | 只在页面中插入指定的 chunks?
 `chunksSortMode` | str or func | `auto` | `'none' | 'auto' | 'dependency' | 'manual' | func`
 `excludeChunks` | `Array<string>` | '' | 跳过一些 chunks
 `xhtml` | bool | `false` |

### 1.2 模板

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title><%= htmlWebpackPlugin.options.title %></title>
  </head>
  <body>
  </body>
</html>
```    

在模板中有以下可用的变量：   

- `htmlWebpackPlugin`: 插件特定的数据
  + `htmlWebpackPlugin.files`: 直接看代码吧
  + `htmlWebpackPlugin.options`: 传递给插件的配置项，我们是可以传递任意的数据的
- `webpack`
- `webpackConfig`
- `compliation`       

```json
"htmlWebpackPlugin": {
  "files": {
    "css": [ "main.css" ],
    "js": [ "assets/head_bundle.js", "assets/main_bundle.js"],
    "chunks": {
      "head": {
        "entry": "assets/head_bundle.js",
        "css": [ "main.css" ]
      },
      "main": {
        "entry": "assets/main_bundle.js",
        "css": []
      },
    }
  }
}
```   

### 1.3 最小化

默认使用 html-minifier 最小化，可以直接定义传递给 html-minifier 的配置项。   

## 2. webpack-manifest-plugin

```shell
$ npm install --save-dev webpack-manifest-plugin
```    


**webpack.config.js**    

```js
var ManifestPlugin = require('webpack-manifest-plugin');

module.exports = {
    // ...
    plugins: [
      new ManifestPlugin()
    ]
};
```    

会在输出目录生成一个 `manifest.json` 文件，文件包括了所有源文件名到对应输出文件。    

### 2.1 配置项

#### filename

`String`, `manifest.json`。     

生成的文件名。   

#### publicPath

`String`, `output.publicPath`。    

添加到 manifest 文件中值的路径前缀。    

#### basePath

`String`。    

所有键的路径前缀。    

#### writeToFileEmit

`Boolean`, `false`。    

如果为 `true`，那么在使用 `webpack-dev-server` 的时候也会生成文件？    

#### seed

`Object,` `{}`。    

一个缓存键值对。可以包括一系列自定义的键值对包含在 manifest 中。    

#### filter

`Function(FileeDescriptor): Boolean`    

过滤输出文件。    

#### map

`Function(FileDescriptor): FileDescriptor`    

在创建 manifest 前修改文件的细节。     

#### sort

`Function(FileDescriptor): number`。    

文件排序。    

#### generate

`Function(Object, FileDescriptor): Object`。   

`(seed, files) => files.reduce((manifest, {name, path}) => ({...manifest, [name]: path}), seed)`    

创建 manifest。    

#### serialize

`Function(Object): string`, `(manifest) => JSON.stringify(manifest, null, 2)`   

将 manifest 输出为不同的文件格式。    

#### FileDescriptor

```js
FileDescriptor {
  path: string;
  name: string | null;
  isInitial: boolean;
  isChunk: boolean;
  chunk?: Chunk;
  isAsset: boolean;
  isModuleAsset: boolean;
}
```   

## 3. clean-webpack-plugin

```bash
$ npm install --save-dev clean-webpack-plugin
```    

```js
const CleanWebpackPlugin = require('clean-webpack-plugin')

// webpack config
{
  plugins: [
    new CleanWebpackPlugin(paths [, {options}])
  ]
}
```    

### 3.1 配置项

#### path

一个要处理的路径的数组。    

```js
[
  'dist',   // 删除 dist 文件夹
  'build/*.*',    // 删除 build 文件夹中的所有文件
  'web/*.js',    // 删除 web 文件夹中的所有文件
]
```    

#### options

```js
{
  // 到 webpack 根目录的绝对路径（前缀到 webpack 根目录的路径）
  root: __dirname,

  // 在 console 中输出日志
  verbose: true,

  //  true 会模拟删除（但不会真的移除文件）
  dry: false,

  //  true 的话在重新编译的时候也会删除文件
  watch: false,

  exclude: ['files', 'to', 'ignore'],

  // 允许插件删除 webpack 根目录之外的文件夹
  allowExternal: false,

  // 只在有文件要输出到输出目录时删除文件
  beforeEmit: false
}
```    

## 4. SplitChunksPlugin

默认情况下，`SplitChunksPlugin` 只影响按需加载的 chunks，因为如果我们改变 initial chunks
的话，会影响 HTML 页面中的脚本标签。    

webpack 基于以下条件会自动划分出 chunks:    

+ 新的 chunk 是被共享的，或者是在 `node_modules` 文件夹
+ 新的 chunk 是大于 30kb (before min+gz)
+ 当加载按需加载 chunks 时，并行的请求数量小于等于 5
+ 初始页面的并行请求数量小于等于 3     

老实说并不理解最后一个条件，既然只影响按需加载的 chunks，那和初始页面的请求有什么关系呢？    

### 4.1 配置项

```js
module.exports = {
  //...
  optimization: {
    splitChunks: {
      chunks: 'async',
      minSize: 30000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  }
};
```   

话说 `minChunks` 不应该是 2 吗，1 的话怎么叫共享？？？？    

#### automaticNameDelimiter

`string`    

默认情况下，webpack 会使用源和 chunk 的名字生成名字，例如 `vendors~main.js`，这个选项可以
指定生成名字的分隔符。   

#### chunks

`function(chunk) | string`    

指定选择哪些 chunk 来进行优化，如果是字符串，有效的值有 `all`, `async` 和 `initial`。
如果是 `all`，意味着 chunks 可以被异步和非异步的 chunks 共享。    

#### maxAsyncRequests

`number`    

按需加载时最大的并行请求数量。    

#### maxInitialRequests

`number`    

入口点的最大的并行请求数量。    

#### minChunks

`number`    

在分割前共享一个模块的最少的 chunks 的数量。    

#### minSize

`number`    

要生成一个 chunk 的话最小的字节大小。    

#### maxSize

`number`     

用来告诉 webpack 将一些大于 `maxSize` 的 chunks 分成更小的部分。    

`maxSize` 的优先级要大于 `maxInitialRequests/maxAsyncRequests`。    

#### name

`boolean: true | function(module) | string`    

分割 chunk 的名字，`true`会基于 chunks 和 cache group key 自动生成名字。   

#### cacheGroups

cache groups 可以继承和/或覆盖 `splitChunks.*` 中的任意配置项，但是 `test, priority`,
`reuseExistingChunk` 只能在 cache grouo 级别配置。如果要禁用任意的默认 cache groups，设
为 `false` 即可。    

```js
module.exports = {
  //...
  optimization: {
    splitChunks: {
      cacheGroups: {
        default: false
      }
    }
  }
};
```    

#### cacheGroups.priority

`number`    

一个模块可能属于多个 cache groups。这里个人感觉应该是在划分时一个模块可以划分到多个 groups
中的任意一个。优化机制通常更喜欢放在有高优先级的 group 中。默认的 groups 都是负优先级，
从而可以让自定义的 group 有更高的优先级（自定义的 groups 默认是 0）。    

#### cacheGroups.{cacheGroup}.reuseExistingChunk

`boolean`    

如果当前 chunk 包含的模块已经从主打包文件中分割出来了，那么这个 chunk 就是可以重用的，而不是新
生成一个。    

#### cacheGroups.{cacheGroup}.test

`function (module, chunk) | RegExp | string`    

控制该 group 选择哪些模块。如果省略了就选择所有模块。可以匹配模块的绝对路径或者 chunk 的名字。
当一个 chunk name 匹配时，chunk 中所有的模块都被选中。    

#### cacheGroups.{cacheGroup}.filename

`string`    

仅当 chunk 是初始 chunk 时覆盖文件名。     

## 5. HashedModuleIdsPlugin

基于模块的相对路径创建 hash，生成一个长度为 4 的字符串作为模块 id。    


```js
new webpack.HashedModuleIdsPlugin({
  // Options...
});
```    

Last Update: 2019-11-09