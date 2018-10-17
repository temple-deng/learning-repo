
<!-- TOC -->

- [核心理念](#核心理念)
- [Entrys](#entrys)
- [Output](#output)
- [Mode](#mode)
- [Loaders](#loaders)
- [Plugins](#plugins)
- [模块](#模块)
- [模块的定位](#模块的定位)

<!-- /TOC -->

## 核心理念

1. entry 默认值 `./src/index.js`
2. output 在哪放置打包文件，以及如何命名这些文件。默认目录是 `./dist`，默认主打包文件路径
是 `./dist/main.js`
3. loader `test` 属性指定哪些文件要被转换，`use` 指定哪个 loader 要用来执行转换。    

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

4. 大部分插件都是一个 npm 模块，因此需要使用 `require()` 加载进来，并将一个使用 new 创建
的实例添加到 `plugins` 数组中。
5. `mode` 参数可选值 `development, production, none` 默认是 `production`，主要是用来
对不同环境进行不同的优化。   

## Entrys

1. Webpack4 不再建议手动将 vendor 代码文件配置成额外的入口点
2. W4 会自动使用 `optimization.splitChunks` 将多页共享代码提取成 chunk。

## Output

1. 最少也要设置一个 `filename`
2. 使用 CDN 和 hash 的例子：   

```js
module.exports = {
  // ...
  output: {
    // 这个 path 的 hash 是怎么生成的
    path: '/home/proj/cdn/assets/[hash]',
    pubilcPath: 'http://cdn.exampl.com/assets/[hash]/'
  }
};
```   

要是在编译的时候不知道最终的 `publicPath`，我们就必须手动在入口点文件里指定 `__webpack_pubilc_path__`
变量：    

`__webpack_public_path__ = myRuntimePublicPath;`     

## Mode

1. `development`，将 `DefinePlugin` 上的 `process.env.NODE_DEV` 设置为 `development`，
启用 `NamedChunksPlugin` 和 `NamesModulesPlugin`
2. `production`，将 `DefinePlugin` 上的 `process.env.NODE_DEV` 设置为 `production`，
启用 `FlagDependencyUsagePlugin`, `FlagIncludeChunksPlugin`, `ModuleConcatenationPlugin`
`NoEmitOnErrorsPlugin`, `OccurenceOrderPlguin`, `SideEffectsFlagPlugin` `UglifyJsPlugin`。   

## Loaders

1. 三种使用 Loaders 的方式
  - 配置
  - 内联，在每个 `import` 或 `require` 以及其他等价与导入功能的语句中明确指定 loaders
  - 命令行指定。
2. 配置中是从右向左执行
3. 内联的方式中，loader 和 loader 之间，loader 和模块路径之间使用 ! 分隔。这种方式下，如果
前缀一个 !，可以覆盖配置中的配置。
4. 内联方式的 loader 配置参数两种方式传入
  - url 查询参数 `?key=value&foo=bar`
  - JSON 对象 `?{"key": "value", "foo", "bar"}`
5. CLI 方式 `webpack --module-bind jade-loader --module-bind "css=style-loader!css-loader"`
对 .jade 文件使用 jade-loade，对 .css 使用 style-loader 和 css-loader.
6. 很明显三种方式其实 loader 都是从右向左执行。
7. loader 链的第一个 loader 理论上应该返回 JS，loader 可以生成任意的文件。

## Plugins

1. 插件就是一个带有 `apply` 方法的对象   

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

2. 注意 webpack 自身也是构建在插件系统之上。所以可以就能看到引入的 webpack 模块上挂了
很多内置的插件。   

## 模块

1. webpack 模块可以使用多种不同的方式来引入它们的依赖：
  - ES6 的 `import` 声明
  - CJS 的 `require()` 声明
  - AMD 的 `define` 和 `require` 声明
  - css/sass/less 文件中的 `@import` 声明
  - 样式表中的 img url，例如 (`url(...)`) 或 `<img src=...>`

## 模块的定位

1. webpack 可以解决的文件路径的声明方式包括：
  - 绝对路径 `/home/me/file`，既然已经是绝对路径了，就不需要 webpack 再做其他的解析
  - 相对路径 `import '../src/file1'`，包含 import 声明的这个文件所在目录作为目录上下文
  来根据相对路径求解出绝对路径
  - 模块路径 `import 'module/lib/file'` 这个模块会在 `resolve.modules` 中声明的所有目录
  中寻找
2. 一旦根据上述方式找到了绝对路径，就要检查这个路径是指向了一个文件还是一个目录，如果是文件：
  - 如果路径包含扩展名，就直接打包这个文件
  - 否则，使用 `resolve.extensions` 添加后缀进行文件搜索
3. 如果是目录：
  - 目录包含 `package.json` 文件，使用 `resolve.mainFields` 中指定的字段按序在 `package.json`
  中查找，第一个找到的字段指明了文件的路径
  - 如果不包含 `package.json` 文件或者所有的字段都没能找到一个有效的文件路径，就根据 `resolve.mainFiles`
  中指定的文件名按序在这个目录中搜索
  - 文件后缀的规则同上
4. loader 的定位规则同上，不过可以使用 `resolveLoader` 定义一个不同的搜索规则，这里应该是
指内联的 loader 把。