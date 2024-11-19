# API

<!-- TOC -->

- [API](#api)
- [1. 命令行接口](#1-命令行接口)
  - [1.1 使用配置文件](#11-使用配置文件)
  - [1.2 不使用配置文件](#12-不使用配置文件)
  - [1.3 环境配置](#13-环境配置)
- [2. Stats Data](#2-stats-data)
  - [2.1 结构](#21-结构)
  - [2.2 Asset Objects](#22-asset-objects)
  - [2.3 Chunk Objects](#23-chunk-objects)
  - [2.4 Module Objects](#24-module-objects)
- [3. Loader API](#3-loader-api)
  - [3.1 同步 loaders](#31-同步-loaders)
  - [3.2 异步 loader](#32-异步-loader)
  - [3.3 Pitching Loader](#33-pitching-loader)
  - [3.4 The Loader Context](#34-the-loader-context)
      - [this.version](#thisversion)
      - [this.context](#thiscontext)
      - [this.rootContext](#thisrootcontext)
      - [this.request](#thisrequest)
      - [this.query](#thisquery)
      - [this.callback](#thiscallback)
      - [this.async](#thisasync)
      - [this.data](#thisdata)
      - [this.cacheable](#thiscacheable)
      - [this.loaders](#thisloaders)
      - [this.loaderIndex](#thisloaderindex)
      - [this.resource](#thisresource)
      - [this.resourcePath](#thisresourcepath)
      - [this.resourceQuery](#thisresourcequery)
      - [this.target](#thistarget)
      - [this.sourceMap](#thissourcemap)
      - [this.emitWarning, this.emitError](#thisemitwarning-thisemiterror)
      - [this.emitFile](#thisemitfile)
- [4. 模块方法](#4-模块方法)
  - [4.1 ES6](#41-es6)
  - [4.2 CommonJS](#42-commonjs)
  - [4.3 AMD](#43-amd)
- [5. 模块变量](#5-模块变量)
- [6. 插件 API](#6-插件-api)
  - [6.1 Tapable](#61-tapable)
    - [6.1.1 钩子类型](#611-钩子类型)
    - [6.1.2 拦截](#612-拦截)
  - [6.2 插件类型](#62-插件类型)
- [7. 编译器钩子](#7-编译器钩子)

<!-- /TOC -->

# 1. 命令行接口

CLI 中的参数和 webpack.config.js 中的配置都是一一对应的。    

**Note:** 命令行的优先级要高于配置文件中的配置。   

## 1.1 使用配置文件

```bash
webpack [--config webpack.config.js]
```    

## 1.2 不使用配置文件

```bash
webpack <entry> [<entry>] -o <output>
```    

数组形式的话如果成员都是单一文件名，那就还是单一入口点的形式，除非元素是 `<name>=<request>`
参数对的形式才是多入口点。    

## 1.3 环境配置

如果 webpack 配置导出的是一个函数的话，这个函数会传入一个环境变量做参数调用：   

```bash
webpack --env.production   # sets env.production == true
webpack --env.platform=web # sets env.platform == "web"
```    

`--env` 接受以下的语法：    


Invocation | Resulting environment
---------|---------
 `webpack --env prod` | `"prod"`
 `webpack --env.prod` | `{ prod: true }`
 `webpack --env.prod=1` | `{ prod: 1 }`
 `webpack --env.prod=foo` | `{ prod: "foo" }`
 `webpack --env.prod --env.min` | `{ prod: true, min: true }`
 `webpack --env.prod --env min` | `[{ prod: true }, "min"]`
 `webpack --env.prod=foo --env.prod=bar` | `{ prod: ["foo", "bar"] }`

剩下的就不说了。    

# 2. Stats Data

当使用 webpack 编译源代码时，用户可以生成一个包含模块统计数据的 JSON 文件。这些数据可以用来
分析应用的依赖图以及优化编译速度。通常这个文件是这样生成的：   

```bash
webpack --profile --json > compilation-stats.json
```    

`--json` 是包含依赖图和其他构建信息，`--profile` 是添加每个模块特定的编译数据到下面的模块对象
中。   

## 2.1 结构

```json
{
  "version": "1.4.13",       // webpack 版本
  "hash": "11593e3b3ac85436984a",     // 编译 hash
  "time": 2469,              // 毫秒为单位的编译时间
  "filteredModules": 0,     // 被排除的模块的数量，这个模块是通过将 `exclude` 传给 `toJson`方法排除的
  "outputPath": "/",        // webpack 输出目录的路径
  "assetsByChunkName": {
    // Chunk name to emitted assets mapping
    "main": "web.js?h=11593e3b3ac85436984a",
    "named-chunk": "named-chunk.web.js",
    "other-chunk": [
      "other-chunk.js",
      "other-chunk.css"
    ]
  },
  "assets": [
    // A list of asset objects
  ],
  "chunks": [
    // A list of chunk objects
  ],
  "modules": [
    // A list of module objects
  ],
  "errors": [
    // A list of error strings
  ],
  "warnings": [
    // A list of warning strings
  ]
}
```    

本地测试的时候生成的最简单的 json 文件是这样：   

```json
{
  "errors": [],
  "warnings": [],
  "version": "4.25.1",
  "hash": "22a92c5b79d8e2150ba6",
  "time": 94,
  "builtAt": 1541664109006,
  "filteredAssets": 0,
  "filteredModules": 0,
  "children": []
  "publicPath": "",
  "outputPath": "/home/dengbo/project/ownProject/webpack-demos/demo14/dist",
  "assetsByChunkName": {
    "app": "app.bundle.js"
  },
  "assets" : [
    // ...
  ],
  "modules": [
    // ...
  ],
  "chunks": [
    // ...
  ],
  "entrypoints": {
    // ...
  },
  "namedChunkGroups": {
    // ...
  }
}
```

## 2.2 Asset Objects

每一个 `assets` 对象都代表一个编译生成的 `output` 文件。结构类似下面这样：    

```json
{
  "name": "app.bundle.js",    // output 文件名
  "size": 3976,           // 文件大小，字节
  "chunks": [             
    // asset 包含的 chunk ID，这里如果是 production 就是 id
    // development 就是 chunk name
    "app"
  ],
  "chunkNames": [
    // asset 包含的 chunk
    "app"
  ],
  "emiited": true    // 表明 asset 是否会输出的 output 目录
}
```    
## 2.3 Chunk Objects

每个 chunk 对象表示一组模块。每个对象类似下面的结构：   

```json
{
  "entry": true,     // chunk 是否包含 webpack runtime
  "id": "app",      // chunk ID，development 就是 name
  "rendered": true,   // 是否 chunk 经历过 Code Generation
  "initial": true,     // chunk 在页面初始加载还是会按需加载
  "size": 111,
  "names": [
    // A list of chunk names contained within this chunk
    "app"
  ],,
  "files": [
    // An array of filename strings that contain this chunk
    "app.bundle.js"
  ],
  "hash": "2e7826bb72ab8898417b",
  "parents": [],    // 父 chunk IDs
  "children": [],
  "modules": [
    // A list of module objects
  ],
  "filteredModules": 0,
  "origins": [
    // ....
  ]
}
```    

每个 chunk 对象会包含一个 `origins`，描述了给定 chunk 是如何生成的。    

```json
{
  "loc": "app",    // 生成这个 chunk 的代码的行？？这里是由于是 entry chunk 所有直接给名字把
  "module": "",    // 模块的路径
  "moduleIdentifier": "",    // 模块的 ID
  "moduleName": "",    // 模块的相对路径
  "reasons": []
}
```    

## 2.4 Module Objects

```json
{
  "id": 0,    // 模块 ID
  "identifier": "/home/dengbo/project/ownProject/webpack-demos/demo14/src/index.js",
  // 内部使用的唯一 ID
  "name": "./src/index.js",    // 文件的路径
  "size": 111,
  "cacheable": true,    // 模块是否可缓存
  "built": true,    // 模块是否经过了 loaders, 解析和 Code Generation
  "prefetched": false,   // 模块是否是 prefetched
  "chunks": [
    0             // 包含这个模块的 chunk IDs
  ]
}
```    

# 3. Loader API

一个 loader 就是一个暴露出一个函数的 JS 模块。loader runner 会调用这个函数然后将前一个 loader
的结果或者资源文件传给它。函数中的 `this` 由 webpack 和 loader runner 处理过，添加了一些
功能，从而可以让 loader 可以变成异步函数或者获取查询参数。    

第一个 loader 的参数就是资源的内容。编译器希望最后一个loader 会返回一个结果，这个结果可以是
一个字符串，或者是一个 `Buffer`，这个字符串或 buf 代码了模块的 JS 源代码，同时还可以传递一个
可选的 SourceMap，这里没说清楚 SourceMap 是 loader 的参数，还是返回值啊。    

单一结果在 sync 模式可以直接返回，如果是多个结果，`this.callback()` 必须调用多次。async
模式下，必须调用 `this.async()` 来告诉 loader ruuner 去等待异步操作的结果。`this.async()`
返回一个 `callback`，loader 必须返回 `undefined` 并调用这个 `callback`。       

## 3.1 同步 loaders

```js
module.exports = function(content, map, meta) {
  return someSyncOperations(content);
}
```    

可以用 `return` 或者 this.callback()` 同步返回转换过的 `content`。   

```js
module.exports = function(content, map, meta) {
  this.callback(null, someSyncOperation(content), map, meta);
  return;   // always return undefined when calling callback()
}
```    

## 3.2 异步 loader

使用 `this.async` 来获取 `callback` 函数。   

```js
module.exports = function(content, map, meta) {
  var callback = this.async();
  someAsyncOperation(content, function(err, result, sourceMaps, meta) {
    if (err) return callback(err);
    callback(null, result, sourceMaps, meta);
  });
};
```    

## 3.3 Pitching Loader

loader 都是从右向左调用的。有一些请求下，loader 只关注请求背后的 metadata 而可以忽略掉
前一个 loader 的结果，`pitch` 方法是在 loader 真正执行前从左到右调用的。    

```js
module.exports = {
  //...
  module: {
    rules: [
      {
        //...
        use: [
          'a-loader',
          'b-loader',
          'c-loader'
        ]
      }
    ]
  }
};
```    

真正调用的步骤是：   

```js
|- a-loader `pitch`
  |- b-loader `pitch`
    |- c-loader `pitch`
      |- requested module is picked up as a dependency
    |- c-loader normal execution
  |- b-loader normal execution
|- a-loader normal execution
```    

pitching 阶段的好处：   

首先，传递给 `pitch` 方法的 `data` 会在执行阶段暴露出来，通过 `this.data` 可以访问。这就可以
共享一些信息。     

```js
module.exports = function(content) {
  return someSyncOperation(content, this.data.value);
};

module.exports.pitch = function(remainingRequest, precedingRequest, data) {
  data.value = 42;
};
```    

其次，如果一个 loader 在 `pitch` 方法中分发了一个结果，那么进程会跳过剩下的 loader，例如，
如果 `b-loader` 的 `pitch` 方法返回了一些东西：    

```js
module.exports = function(content) {
  return someSyncOperation(content);
};

module.exports.pitch = function(remainingRequest, precedingRequest, data) {
  if (someCondition()) {
    return 'module.exports = require(' + JSON.stringify('-!' + remainingRequest) + ');';
  }
};
```    

那么流程就变成了：   

```js
|- a-loader `pitch`
  |- b-loader `pitch` returns a module
|- a-loader normal execution
```    

## 3.4 The Loader Context

`/abc/file.js`    

```js
require('./loader1?xyz!loader2!./resource?rrr');
```    

#### this.version

Loader API 版本，当前是 `2`。   

#### this.context

模块的目录。上例就是 `/abc`。   

#### this.rootContext

不懂。    

#### this.request

The resolved request string.    

应该就是经过路径解析后的完整的加载字符串吧。   

上例就是:   

```
/abc/loader1.js?xyz!/abc/node_modules/loader2/index.js!/abc/resource.js?rrr
```   

#### this.query

1. 如果 loader 是使用一个 `options` 对象配置的，那这个属性就是这个对象
2. 否则，如果是用一个查询字符串配置的，这个属性就是一个字符串，以字符 `?` 开头

#### this.callback

一个用来返回多个结果的函数，可以同步或异步调用。    

```js
this.callback(
  err: Error | null,
  content: string | Buffer,
  sourceMap?: SourceMap,
  meta?: any
)
```    

#### this.async

告诉 loader-runner 这个 loader 会异步返回。返回 `this.callback()`。    

#### this.data

一个在 pitch 和执行阶段可以共享的数据对象。    

#### this.cacheable

一个用来设置可缓存标志的函数：   

```js
cacheable(flag = true: boolean)
```    

默认情况下，loader 结果是可缓存的，如果使用 `false` 作为参数调用这个函数，结果就是不可缓存的。    

#### this.loaders

一个所有 loaders 的数组，在 pitch 阶段这个字段是可写的。    

```js
loaders = [{
  request: string,
  path: string,
  query: string,
  module: function
}]
```    

#### this.loaderIndex

当前 loader 在 loaders 数组中的索引。    

#### this.resource

请求的资源的路径，包含查询字符串部分。    

```
/abc/resource.js?rrr
```    

#### this.resourcePath

```
/abc/resource.js
```    

#### this.resourceQuery

```
?rrr
```   

#### this.target

编译的目标，由配置选项传入。    

#### this.sourceMap

是否应该生成 SourceMap。   

#### this.emitWarning, this.emitError

```js
emitWarning(warning: Error)
emitError(error: Error)
```     

#### this.emitFile

```js
emitFile(name: string, content: Buffer|string, sourceMap: {...})
```    

# 4. 模块方法

这一部分覆盖了使用 webpack 编译的代码中可以使用的所有方法。    

## 4.1 ES6

+ `import`
+ `export`
+ `import()`    

调用 `import()` 意味着一个代码分割点，即被请求的模块和其依赖会分割到一个另外的 chunk 中。    

```js
// Single target
import(
  /* webpackChunkName: "my-chunk-name" */
  /* webpackMode: "lazy" */
  'module'
);

// Multiple possible targets
import(
  /* webpackInclude: /\.json$/ */
  /* webpackExclude: /\.noimport\.json */
  /* webpackChunkName: "my-chunk-name" */
  /* webpackMode: "lazy" */
  `/locale/${language}`
);
```    

```js
import(/* webpackIgnore: true */ 'ignored-module.js')
```    

+ `webpackIgnore`: 设置为 `true` 时禁用动态加载解析
+ `webpackChunkName`: 新 chunk 的名字
+ `webpackMode`:
  - `lazy`: 每个 `import()` 模块都生成可以懒加载的 chunk
  - `lazy-once`: 对所有 `import()` 只生成一个懒加载的 chunk。chunk 会在第一次调用 `import()`
  时加载。
  - `eager`: 不生成额外的 chunk。所有模块都包含在当前 chunk 中。
  - `weak`
+ `webpackInclude`: 在 import 地址定位时匹配的正则。只有匹配的模块会被打包
+ `webpackExclude`

## 4.2 CommonJS

+ `require()`
+ `require.resolve(dependency: String)`：获取一个模块的 id。
+ `require.cache`
+ `require.ensure()`

```js
require.ensure(
  dependencies: String[],
  callback: function(require),
  errorCallback: function(error),
  chunkName: String
)
```    

## 4.3 AMD

略。   

# 5. 模块变量

代码中所有可使用的变量。    

+ `module.loaded`: 如果模块就是当前执行的模块，就是 `false`，如果模块已经被执行完就是 `true`
+ `module.hot`: 是否启用了 HMR，并提供了对 HMR 的接口
+ `module.id`: 当前模块 id
+ `module.exports`
+ `exports`
+ `global`
+ `process`
+ `__dirname`, `__filename`
+ `__resourceQuery`: `?` 开头
+ `__webpack_public_path__`: 即 `output.publicPath`
+ `__webpack_require__`: webpack require 函数
+ `__webpack_chunk_load__`: 内部 chunk 加载函数，两个参数：
  - `chunkId`
  - `callback(require)`
+ `__webpack_modules__`: 访问所有模块
+ `__webpack_hash__`: 只在一些插件中使用

# 6. 插件 API

## 6.1 Tapable

这个库是 webpack 核心的一部分，不过也可以在别处使用用来提供一个类似的插件接口。webpack 中的
许多对象扩展了 `Tapable` 类。这个类暴露出了 `tap`, `tapAsync` 和 `tapPromise` 方法，
插件可以用这些方法在编译过程中注入自定义的构建步骤。    

```js
const {
  SyncHook,
  SyncBailHook,
  SyncWaterfallHook,
  SyncLoopHook,
  AsyncParallelHook,
  AsyncParallelBailHook,
  AsyncSeriesHook,
  AsyncSeriesBailHook,
  AsyncSeriesWaterfallHook
} = require('tapable');
```    

所有的钩子构造函数都接收一个可选的参数：一个字符串数组：    

```js
const hook = new SyncHook(["arg1", "arg2", "arg3"]);
```    

对于同步钩子来说，`tap` 是唯一可以添加一个插件的方法，异步钩子支持异步插件：   

```js
// 假设 hook 是异步钩子
hook.tapPromise("GoogleMapsPlugin", (source, target, routesList) => {
  // return a promise
  return google.maps.findRoute(source, target).then(route) => {
    routesList.add(route);
  };
});

hook.tapAsync("BingMapsPlugin", (source, target, routesList, callback) => {
  bing.findRoute(source, target, (err, route) => {
    if (err) return callback(err);
    routesList.add(route);
    callback();
  });
});
```    

### 6.1.1 钩子类型

+ 基础钩子。这类钩子就只是简单地调用每个 tapped 函数
+ Waterfall。同上也是会调用每个 tapped 函数，但是会将每个函数的返回值传递给下一个函数
+ Bail。bail 钩子允许提前退出。如果任意的 tapped 函数返回了东西，那 bail 钩子不会执行后面的函数
+ Loop。TODO     

另外，钩子还可以是异步或同步的：   

+ 同步。同步钩子只能使用 `tap()` 方法绑定
+ AsyncSeries。可以使用 `tap`, `tapAsync`, `tapPromise` 绑定。按序执行
+ AsyncParallel。同上，并行执行。    

### 6.1.2 拦截

所有钩子还提供了额外的拦截 API：    

```js
hook.intercept({
  call: (source, target, routesList) => {
    console.log("Starting to calculate routes");
  },
  register: (tapInfo) => {
    // tapInfo = { type: "promise", name: "GoogleMapsPlugin", fn: ... }
    console.log(`${tapInfo.name} is doing it's job`);
    return tapInfo;
  }
})
```    
+ `call: (...args) => void`: 当钩子触发时调用
+ `tap: (tap: Tap) => void`: 当插件 tap into 一个钩子时调用
+ `loop: (...args) => void`
+ `register: (tap: Tap) => Tap | undefined` 每次添加 `Tap` 时调用？    

## 6.2 插件类型

如果是要在 `compile` 阶段添加钩子回调，只能使用同步钩子：    

```js
compiler.hooks.compile.tap('MyPlugin', params => {
  console.log('Synchronously tapping the compile hook.!');
});
```   

# 7. 编译器钩子

+ `entryOption`(`SyncBailHook`): 在 webpack 处理了 entry 配置项后执行插件
+ `afterPlugins`(`SyncHook`): 设置完初始的插件后执行插件，参数 `compiler`
+ `afterResolvers`(`SyncHook`): 完成地址解析后执行，参数 `compiler`
+ `environment`(`SyncHook`): 在准备好环境前执行
+ `afterEnvironment`(`SyncHook`)
+ `beforeRun`(`AsyncSeriesHook`): 在 `compiler.run()` 前执行
+ `run`(`AsyncSeriesHook`): 开始读记录前执行
+ `watchRun`
+ `beforeCompile`(`AsyncSeriesHook`): 创建完编译参数后
+ `compile`(`SyncHook`): 新的编译创建前
+ `thisCompilation`(`SyncHook`)

算了放弃       

Last Update: 2018-11-09
