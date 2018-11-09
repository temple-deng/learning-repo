# 配置

<!-- TOC -->

- [配置](#配置)
  - [Entry, Context, Output](#entry-context-output)
  - [Module](#module)
  - [Resolve](#resolve)
  - [optimization](#optimization)
- [webpack-merge](#webpack-merge)
  - [标准合并](#标准合并)
  - [添加额外的合并策略](#添加额外的合并策略)
  - [Smart 合并](#smart-合并)

<!-- /TOC -->

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

可以给对象的键名后缀一个 `$` 来表示精确匹配：   

```js
module.exports = {
  // ...
  resolve: {
    alias: {
      xyz$: path.resolve(__dirname, 'path/to/file.js')
    }
  }
}
```   

```js
import Test1 from 'xyz';   // 精确匹配，导入 path/to/file.js 文件
import Test2 from 'xyz/file.js';  // 非精确匹配，使用其他的定位方案
```   


alias | `import "xyz"` | `import "xyz/file.js"`
---------|----------|---------
 `{}` | `import "/abs/node_modules/xyz/index.js"` | `import "/abs/node_modules/xyz/file.js"`
 `{ xyz: "/abs/path/to/file.js"}` | `import "/abs/path/to/file.js"` | error
 `{ xyz$: "/abs/path/to/file.js" }` | `import "/abs/path/to/file.js"` | `import "/abs/node_modules/xyz/file.js"`
 `{ xyz: "./dir/file.js" }` | `import "/abc/dir/file.js"` | error
 `{ xyz$: "./dir/file.js" }` | `import "/abc/dir/file.js"` | `import "/abc/node_modules/xyz/file.js"`
 `{ xyz: "/some/dir" }` | `import "/some/dir/index.js"` | `import "/some/dir/file.js"`
 `{ xyz$: "/some/dir" }` | `import "/some/dir/index.js"` | `import "/abc/node_modules/xyz/file.js"`
 `{ xyz: "./dir" }` | `import "/abc/dir/index.js"` | `import "/abc/dir/file.js"`
 `{ xyz: "modu" }` | `import "/abc/node_modules/modu/index.js"` | `import "/abc/node_modules/modu/file.js"`
 `{ xyz$: "modu" }` | `import "/abc/node_modules/modu/index.js"` | `import "/abc/node_modules/xyz/file.js"`
 `{ xyz: "modu/some/file.js" }` | `import "/abc/node_modules/modu/some/file.js"` | error
 `{ xyz: "modu/dir" }` | `import "/abc/node_modules/modu/dir/index.js"` | `import "/abc/node_modules/modu/dir/file.js`
 `{ xyz: "xyz/dir" }` | `import "/abc/node_modules/xyz/dir/index.js"` | `import "/abc/node_modules/xyz/dir/file.js`
 `{ xyz$: "xyz/dir" }` | `import "/abc/node_modules/xyz/dir/index.js"` | `import "/abc/node_modules/xyz/file.js"`

2. `descriptionFiles`: array，描述用的 JSON 文件位置
3. `enforceExtension`: bool, 如果设为 true，就不会自动补全扩展名
4. `enforceModuleExtension`: 对模块例如 loaders 是否强制要求扩展名
5. `entensions`: array 默认 `['.wasm', '.mjs', '.js', '.json']`
6. `mainFields`: array 这个配置默认值跟着 target 配置走，如果是 webworker, web 或者
省略，就是 `['browser', 'module', 'main']`，其他的就都是 `['module', 'main']`
7. `mainFiles`： 默认 `['index']`
8. `modules`: 可以使用绝对路径和相对路径，相对路径的搜寻方式有点类似 Node 搜索 node_modules，
一层一层向上找。

## optimization

1. 从 webpack4 开始，webpack 会根据 mode 来进行优化的配置，但是我们也可以手工配置并覆盖
2. `minimize`: 是否使用 `UglifyjsWebpackPlugin`
3. `minimizer`: 默认 `[UglifyjsWebpackPlugin]` 主要是用来定制 Uglifyjs 的配置的。   

```js
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  //...
  optimization: {
    minimizer: [
      new UglifyJsPlugin({ /* your config */ })
    ]
  }
};
```   

4. `splitChunks`: 参考 `SplitChunksPlugin` 配置
5. `runtimeChunk`: object|string|boolean，设置为 true 或者 "mulitple"，会为每个入口点
生成仅包含 runtime 代码的 chunk。如果是 "single" 就所有生成的块共享一个 runtime 文件
6. `namedModules`: bool，使用可读性更好的模块标识符以便调试。
7. `namedChunks`: bool
8. `moduleIds`: bool | string，使用哪种算法来选择模块 id。
9. `nodeEnv`: 将 `process.env.NODE_ENV` 设置为指定的字符串。背后其实就是使用 `DefinePlugin`

# webpack-merge

`merge` 函数拼接数组和合并对象。如果遇到了函数，会执行这个函数，然后会使用一个函数包裹其
返回值。    

## 标准合并

**`merge(...configuration | [...configuration])`**    

```js
var output = merge(obj1, obj2, obj3, ...);
// or
var output = merge([obj1, obj2, obj3]);
```    

**`merge({ customizeArray, customizeObject })(...configuration | [...configuration])`**    

```js
var output = merge(
  {
    customizeArray(a, b, key) {
      if (key === 'extensions') {
        return _.uniq([...a, ...b]);
      }

      // 回退至默认的合并策略
      return undefined;
    },
    customizeObject(a, b, key) {
      if (key === 'module') {
        return _.merge({}, a, b);
      }

      return undefined;
    }
  }
)(obj1, obj2, obj3, ...);
```    

例如，obj1:   

```js
{
  foo1: ['object1'],
  foo2: ['object1'],
  bar1: { object1: {} },
  bar2: { object1: {} }
}
```   

obj2 为：   

```js
{
  foo1: ['object2'],
  foo2: ['object2'],
  bar1: { object2: {} },
  bar2: { object2: {} }
}
```    

`customizeArray` 会为每个数组类型的属性调用，例如：    

```js
customizeArray(['object1'], ['object2'], 'foo1');
customizeArray(['object1'], ['object2'], 'foo2');
```    

`customizeObject` 会为每个对象类型的属性调用，例如：   

```js
customizeObject({ object1: {} }, { object2: {} }, bar1);
customizeObject({ object1: {} }, { object2: {} }, bar2);
```    

**`merge.unique(<field>, <fields>, field => field)`** 不是太能理解这个函数：   

```js
const output = merge({
  customizeArray: merge.unique(
    'plugins',
    ['HotModuleReplacementPlugin'],
    plugin => plugin.constructor && plugin.constructor.name
  )
})({
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
}, {
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
});
 
// Output contains only single HotModuleReplacementPlugin now.
```    

## 添加额外的合并策略

**`merge.strategy({ <field>: '<prepend|append|replace>'})(...configuration | [...configuration])`**    

```js
var output = merge.strategy({
  entry: 'prepend',   // 默认 append
  'module.loaders': 'prepend'
})(object1, object2, object3, ...)
```   

**`merge.smartStrategy({ <key>: '<prepend|append|replace>'})(...configuration | [...configuration])`**
与上面的相同，但是使用 smart 合并策略。   

```js
var output = merge.smartStrategy(
  {
    entry: 'prepend', // or 'replace'
    'module.loaders': 'prepend'
  }
)(object1, object2, object3, ...);
```    

## Smart 合并

**`merge.smart(...configuration | [...configuration])`** 使用这个方法的话在合并
loaders 时会变得很智能。有着相同匹配 test 的 loaders 会合并到一个单一的 loader 值。   

```js
const merge = require('webpack-merge');
const common = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
}

console.log(JSON.stringify(merge.smart(common, {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader']
      },
      {
        test: /\.css$/,
        use: 'sass-loader'
      }
    ]
  }
})));

// rules: [
//  { test: {}, use: ["style-loader", "css-loader", "sass-loader"]}
//  { test: {}, use: ["babel-loader"] }
// ]
```    

注意如果两个 css 的匹配 rule 中任意一个 use 是一个字符串，还是可以正常拼接成数组，但是
js 的那个如果就是 `use: 'babel-loader'` 那最后那个 rule 的 use 就也只是单一字符串。   

Last Update: 2018-11-09
