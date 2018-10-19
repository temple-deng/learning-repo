
<!-- TOC -->

- [概念](#概念)
  - [核心理念](#核心理念)
  - [Entrys](#entrys)
  - [Output](#output)
  - [Mode](#mode)
  - [Loaders](#loaders)
  - [Plugins](#plugins)
  - [模块](#模块)
  - [模块的定位](#模块的定位)
  - [Manifest](#manifest)
  - [HMR](#hmr)
  - [PublicPath](#publicpath)
- [配置](#配置)
  - [Entry, Context, Output](#entry-context-output)
  - [Module](#module)
  - [Resolve](#resolve)

<!-- /TOC -->

# 概念

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
3. mode 其实就是控制了 webpack 的一些配置项的默认配置如何设置。   


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
  - 样式表中的 img url，例如 (`url(...)`) 或 `<img src=...>`，这两个很容易被忽略

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

## Manifest

1. 使用 webpack 构建的应用中，通常包含三种类型的代码：
  - 应用源代码
  - 第三方库代码
  - webpack 用来管理所有模块的 runtime 和 manifest
2. runtime 代码以及一些 manifest 数据是我们应用在浏览器中运行时用来连接我们所有模块代码的东西。
包括一些加载逻辑代码和一些定位模块位置的逻辑代码
3. manifest 看意思其实就是一些 runtime 用来定位模块的一些数据，比如说 pubilcPath 啦，各个
模块的标识符啦。   

## HMR

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

## PublicPath

1. 本质上，每个在 `output.path` 中生成的文件都是相对于 `output.publicPath` 定位的，包括
由代码分割产生的子 chunks，以及其他的静态资源，例如图片，字体文件等。

# 配置

## Entry, Context, Output

1. `context` 绝对路径
2. `output.chunkFilename` 非入口点 chunk 文件的名字
3. `output.chunkLoadTimeout` 毫秒
4. `output.crossOriginLoading`, bool, string, 只有在 `target: web` 才有用，默认
`false` 禁止跨域加载，`anonymous` 不带身份信息的跨域加载，`use-credentials` 带身份信息
的跨域加载
5. `output.jsonpScriptType` `text/javascript`, `module`
6. `output.devtoolModuleFilenameTemplate`, `string | function(info)`,只有当使用了
`devtool` 配置项，并且该配置项要求模块名时才有用。用来定义每个 source map 的 `sources` 数组
中使用的名字。可用的模板有：
  - \[absolute-resource-path]: 绝对文件名
  - \[all-loaders]: 自动和显式的 loader，并且参数取决于第一个 loader 名称
  - \[hash]: 模块 id 的 hash
  - \[id]: 模块 id
  - \[loaders]: 显式的 loader，并且参数取决于第一个 loader 名称
  - \[resource]: 用于解析文件的路径和用于第一个 loader 的任意查询参数
  - \[resource-path]: 不带任何查询参数，用于解析文件的路径
  - \[namespace]: 模块命名空间。在构建成为一个 library 之后，通常也是 library 名称，否则为空    

```js
module.exports = {
  //...
  output: {
    devtoolModuleFilenameTemplate: 'webpack://[namespace]/[resource-path]?[loaders]'
  }
};
```    

7. `output.devtoolNamespace`
8. `output.filename` 这个选项不影响按需加载的 chunks 和被 loaders 创建的文件的名称，
loaders 创建的名称需要我们去配置 loaders 的 option。
  - \[hash]: 模块 id 的 hash
  - \[chunkhash]: chunk content 的 hash
  - \[name]
  - \[id]
  - \[query]: 跟在文件名后面 `?` 后面的字符串
  - 如果使用了 `ExtractTextWebpackPlugin` 插件，使用 \[contenthash] 而不是 \[hash]或
  \[chunkhash]
9. `output.hashDigest`，hash 的编码方式
10. `output.hashDigestLength`，默认 20
11. `output.hashFunction`，使用的 hash 算法，默认 'md4'
12. `output.hashSalt`
13. `output.hotUpdateChunkFilename` 定制热更新的 chunks 的文件名，支持模块 `[id], [hash]`
14. `output.hotUpdateMainFilename` 定制主热更新文件名称，仅支持 `[hash]` 模板
15. `output.jsonpFunction`，jsonp 函数名
16. `output.library`
17. `output.libraryExport` 配置通过 `libraryTarget` 要暴露出哪些模块，默认是 `undefined`，
即导出整个对象。    

假设当前 `libraryTarget: 'var'`，而 `libraryExport: 'default`，则整个入口点的 default
export 会被赋值给 target `var MyDefaultModule = _entry_return_.default`。   

如果设置为一个普通的值例如 `MyModule`，则特定的模块会被赋值给 target,
`var MyModule = _entry_return_.MyModule`。   

如果是个数组的话，例如 `['MyModule', 'MySubModule']`，就解释成这样：
`var MySubModule = _entry_return_.MyModule.MySubModule`    

18. `output.libraryTarget`，默认是 'var'，
  - 'var'
  - 'assign'
  - 'this' `this['MyLibrary'] = _entry_return_`
  - 'window' `window['MyLibrary'] = _entry_return_`
  - 'global' `global['MyLibrary'] = _entry_return_`
  - 'commonjs' `exports['MyLibrary'] = _entry_return_`
  - 'commonjs2' `module.exports = _entry_return_`
  - 'amd'
  - 'umd'
19. `output.path`
20. `output.pathinfo`，告诉 webpack 在打包后的文件中包含关于打包文件包含哪些模块的那些
注释语句，默认 development 模式为 true, production 为 false。
21. `output.publicPath` 默认 ''，大部分情况这这个配置最后必须是一个 `/`，因为要加在每个
按需加载和静态资源的路径前面。
22. `output.sourceMapFilename`，只要在 devtool 设置为一个会将 sourcemap 写到一个输出
文件中的选项时有用。默认是 `[file].map`，大部分的模板都能用。
23. `output.sourcePrefix`

## Module

1. `noParse`: `RegExp | [RegExp] | fn | string | [string]`。禁止 webpack 解析任意
匹配的文件。
2. `rules`: `[Rule]`。
3. `Rule`, `test, include, exclude, resource` 是针对 resource 的，`issuer` 是针对
issuer 的。注意不管是针对 resource 还是 issuer，模块的地址均已被 resolve 解析成绝对路径
4. 针对 loaders 的 `loader, options, use, enforce`，针对 parsers 的 `parser`
5. `Rule.enforce`: `'pre' | 'post'`。空值代表常规的 loader，所有 loaders 在执行的时候分为
两个阶段：   
  - pitching 阶段：loader 上的 pitch 方法按照 post, inline, normal, pre 的顺序一个
  接一个调用
  - normal 阶段：loader 上的 normal 方法按照 pre, normal, inline, post 顺序一个接一个
  执行，转换代码发生在这个阶段。
6. `Rule.exclude`: `Rule.resource.exclude` 快捷方式
7. `Rule.include`: `Rule.resource.include` 快捷方式
8. `Rule.issuer` 一个 `Condition` 对象，看来一个通用的 `Condition` 对象才是用来匹配
resource 和 issuer 的。
9. `Rule.loader`: `Rule.use: [ { loader }]` 的快捷方式
10. `Rule.options`: `Rule.use: [ { options }]` 的快捷方式
11. `Rule.resource` 一个用来匹配 resource 的 `Condition` 对象，注意其实一个 `Condition`
就是一个匹配条件，和 test, include, exclude 等都是等价的。
12. `Rule.resourceQuery` 用来匹配 resource 查询参数的 `Condition` 对象
13. `Rule.sideEffects` 布尔值，指明模块的哪一个部分包含副作用
14. `Rule.test`
15. `Rule.use`: 一个 `UseEntry` 的列表
16. `Condition`: 一个 Condition 可以是以下的类型：
  - 一个字符串：路径的开头必须和这个字符串匹配
  - 正则
  - 函数
  - Conditions 的数组：至少一个 Condition 要匹配
  - 对象：所有的属性都要匹配
  - `{ test: Condition }`: 条件必须匹配
  - `{ include: Condition }`: 条件也是必须匹配
  - `{ exclude: Condition }`: 条件必须不匹配
  - `{ and: [Condition] }`: 所有的条件必须匹配
  - `{ or: [Condition] }`: 任意的条件匹配即可
  - `{ not: [Condition] }`: 所有的条件都不能匹配

## Resolve

1. `alias`: object   

```js
module.exports = {
  // ...
  resolve: {
    alias: {
      Utilities: path.resolve(__dirname, 'src/utilities/'),
      Templates: path.resolve(__dirname, 'src/templates/')
    }
  }
}
```    

现在就可以这样加载模块：`import Utility from 'Utilities/utility'`