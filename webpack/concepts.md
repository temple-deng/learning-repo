# Concepts

<!-- TOC -->

- [Concepts](#concepts)
  - [1. 概览](#1-概览)
    - [1.1 Entry](#11-entry)
    - [1.2 Ouput](#12-ouput)
    - [1.3 Loaders](#13-loaders)
    - [1.4 Plugins](#14-plugins)
    - [1.5 Mode](#15-mode)
  - [2. Entry Points](#2-entry-points)
    - [2.1 单一入口点](#21-单一入口点)
    - [2.2 对象语法](#22-对象语法)
  - [3. Output](#3-output)
    - [3.1 CDN 的例子](#31-cdn-的例子)
  - [4. Mode](#4-mode)
  - [5. Loaders](#5-loaders)
    - [5.1 使用 Loaders](#51-使用-loaders)
  - [6. Plugins](#6-plugins)
  - [7. 模块](#7-模块)
    - [7.1 webpack 模块](#71-webpack-模块)
  - [8. 模块的定位](#8-模块的定位)
    - [8.1 绝对路径](#81-绝对路径)
    - [8.2 相对路径](#82-相对路径)
    - [8.3 模块路径](#83-模块路径)
  - [9. Manifest](#9-manifest)
  - [10. HMR](#10-hmr)
  - [11. PublicPath](#11-publicpath)

<!-- /TOC -->

## 1. 概览

核心的几个理念：   

+ Entry
+ Output
+ Loaders
+ Plugins
+ mode

### 1.1 Entry

入口点是 webpack 用来从零构建依赖图的那个模块。默认值 `./src/index.js`

### 1.2 Ouput

output 告诉 webacpk 将生成的打包文件放在哪里，以及这些文件要如何命名。默认目录是 `./dist`，
默认主打包文件路径是 `./dist/main.js`。    


### 1.3 Loaders

loader `test` 属性指定哪些文件要被转换，`use` 指定哪个 loader 要用来执行转换。    

```js
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'my-first-webpack.bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.txt$/,
        use: 'raw-loader'
      }
    ]
  }
};
```    

### 1.4 Plugins

Plugins 用来执行一些功能更广的任务，例如打包文件的优化，静态资源的管理以及环境变量的注入。   

大部分插件都是一个 npm 模块，因此需要使用 `require()` 加载进来，并将一个使用 new 创建
的实例添加到 `plugins` 数组中。   

### 1.5 Mode

`mode` 参数可选值 `development, production, none` 默认是 `production`，主要是用来
对不同环境进行不同的优化。   

## 2. Entry Points

### 2.1 单一入口点

`entry: string | Array<string>`    

### 2.2 对象语法

```js
entry: {
  [entryChunkName: string]: string | Array<string>
}
```    

webpack4 不再建议手动将 vendor 代码文件配置成额外的入口点。webpack4 的
`optimization.splitChunks` 会注意到第三方 vendor 代码并创建出额外的分离文件打包。   

## 3. Output

最低要求至少要设置一个 `filename`。    

### 3.1 CDN 的例子

```js
module.exports = {
  // ...
  output: {
    path: '/home/proj/cdn/assets/[hash]',
    pubilcPath: 'http://cdn.exampl.com/assets/[hash]/'
  }
};
```   

要是在编译的时候不知道最终的 `publicPath`，我们就必须手动在入口点文件里指定
`__webpack_pubilc_path__` 变量：    

```js
__webpack_public_path__ = myRuntimePublicPath;
```     

## 4. Mode

`mode` 配置项是用来告诉 webpack 如何使用内置的优化。   

1. `development`，将 `DefinePlugin` 上的 `process.env.NODE_DEV` 设置为 `development`，
启用 `NamedChunksPlugin` 和 `NamesModulesPlugin`
2. `production`，将 `DefinePlugin` 上的 `process.env.NODE_DEV` 设置为 `production`，
启用 `FlagDependencyUsagePlugin`, `FlagIncludeChunksPlugin`, `ModuleConcatenationPlugin`
`NoEmitOnErrorsPlugin`, `OccurenceOrderPlguin`, `SideEffectsFlagPlugin` `UglifyJsPlugin`。   
3. `none` 就是使用各配置项的默认值。   


## 5. Loaders

### 5.1 使用 Loaders

三种使用 Loaders 的方式:   

- 配置
- 内联，在每个 `import` 或 `require` 以及其他等价与导入功能的语句中明确指定 loaders
- 命令行指定。

配置中是从右向左执行。   

内联的方式中，loader 和 loader 之间，loader 和模块路径之间使用 ! 分隔。这种方式下，如果
前缀一个 !，可以覆盖配置中的配置。    

内联方式的 loader 配置参数两种方式传入：   

- url 查询参数 `?key=value&foo=bar`
- JSON 对象 `?{"key": "value", "foo", "bar"}`    


CLI 方式：    

```bash
$ webpack --module-bind jade-loader --module-bind "css=style-loader!css-loader"
```    

对 .jade 文件使用 jade-loade，对 .css 使用 style-loader 和 css-loader.    

很明显三种方式其实 loader 都是从右向左执行。     

## 6. Plugins

插件就是一个带有 `apply` 方法的对象，这个方法会被 webpack 编译器调用，对整个编译周期都有访问
权限：       

```js
const pluginName = 'ConsoleLogOnBuildWebpackPlugin';

class ConsoleLogOnBuildWebpackPlugin {
  apply(compiler) {
    compiler.hooks.run.tap(pluginName, compilation => {
      console.log('The webpack build process is starting!!!');
    });
  }
}
```    

注意 webpack 自身也是构建在插件系统之上。所以可以就能看到引入的 webpack 模块上挂了
很多内置的插件。   

## 7. 模块

### 7.1 webpack 模块

不同于 Node.js 模块，webpack modules 可以通过多种方式来声明它们的依赖：   

- ES6 的 `import` 声明
- CJS 的 `require()` 声明
- AMD 的 `define` 和 `require` 声明
- css/sass/less 文件中的 `@import` 声明
- 样式表中的 img url，例如 (`url(...)`) 或 `<img src=...>`，这两个很容易被忽略

## 8. 模块的定位

### 8.1 绝对路径

`/home/me/file`，既然已经是绝对路径了，就不需要 webpack 再做其他的解析。   

### 8.2 相对路径

`import '../src/file1'`，包含 import 声明的这个文件所在目录作为目录上下文，来根据相对路径
求解出绝对路径。    

### 8.3 模块路径

```js
import 'module';
import 'module/lib/file';
``` 

这个模块会在 `resolve.modules` 中声明的所有目录中寻找。    

一旦根据上述方式找到了绝对路径，就要检查这个路径是指向了一个文件还是一个目录，如果是文件：  

- 如果路径包含扩展名，就直接打包这个文件
- 否则，使用 `resolve.extensions` 添加后缀进行文件搜索    

如果是目录：   

- 目录包含 `package.json` 文件，使用 `resolve.mainFields` 中指定的字段按序在 `package.json`
中查找，第一个找到的字段指明了文件的路径
- 如果不包含 `package.json` 文件或者所有的字段都没能找到一个有效的文件路径，就根据 `resolve.mainFiles`
中指定的文件名按序在这个目录中搜索
- 文件后缀的规则同上     


loader 的定位规则同上，不过可以使用 `resolveLoader` 定义一个不同的搜索规则，这里应该是
指内联的 loader 把。   

## 9. Manifest

1. 使用 webpack 构建的应用中，通常包含三种类型的代码：
  - 应用源代码
  - 第三方库代码
  - webpack 用来管理所有模块的 runtime 和 manifest
2. runtime 代码以及一些 manifest 数据是我们应用在浏览器中运行时用来连接我们所有模块代码的东西。
包括一些加载逻辑代码和一些定位模块位置的逻辑代码
3. manifest 看意思其实就是一些 runtime 用来定位模块的一些数据，比如说 pubilcPath 啦，各个
模块的标识符与位置的映射   
4. 无论我们使用的是哪种模块系统 `import` 亦或是 `require()`，最终这些导入函数都会被转换
成 `__webpack_require__` 方法来执行模块 id。使用 manifest 里的数据，runtime 代码就
知道如何根据这些 id 去获取真正的打包代码。

## 10. HMR

1. 下面四步就是应用使用 HMR 交换模块的步骤：
  - app 请求 HMR runtime 检查是否有模块更新
  - runtime 异步下载更新的模块并通知 app
  - app 请求 runtime 应用模块更新
  - runtime 同步应用模块更新
2. 通常来说，一个模块更新了，包含两部分的数据更新：
  - manifest 数据更新
  - 一个或多个的 chunks 更新
3. 不是说所有模块都实现了 HMR，如果我们的模块没有定义发生 HMR 时要做什么，更新会向上冒泡，最终
可能引发页面重载。   

## 11. PublicPath

本质上，每个在 `output.path` 中生成的文件都是相对于 `output.publicPath` 定位的，包括
由代码分割产生的子 chunks，以及其他的静态资源，例如图片，字体文件等。    

Last Update: 2018-11-07
