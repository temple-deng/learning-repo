# Week36 8.30-9.5

# webpack

<!-- TOC -->

- [Week36 8.30-9.5](#week36-830-95)
- [webpack](#webpack)
- [Guides](#guides)
    - [Getting Started](#getting-started)
    - [Asset Management](#asset-management)
    - [Output Management](#output-management)
    - [Development](#development)
    - [Code Spliting](#code-spliting)
    - [Caching](#caching)
    - [编写库](#编写库)

<!-- /TOC -->

# Guides

## Getting Started

安装：   

```shell
npm i webpack webpack-cli -D
```   

## Asset Management

示例配置文件：    

```js
const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: [
                'style-loader',
                'css-loader'
            ]
        }]
    }
};
```     

module 即项目中的一个个模块，所以这个键名即对各种模块的配置。   

loader 链式反向执行，最后一个loader应该返回 js 代码。    

加了这两个 loader 后如果 js 中 `import './style.css'`，则会在 `<head>` 里面添加一个
`<style>` 标签。     

根据测试来看，css-loader 是用来解析 css 文件的，不然 webpack 不能识别 css 代码，然后应该
还有些额外的功能就是对 css 中引入的模块进行进一步解析的，而 style-loader 就是把 css 代码
生成一个 style 标签嵌入页面的，可以没有 style-loader，最多页面不加载 css，但是不能没有
css-loader，因为没有这个在引入 css 模块时 webpack 会报错。    

不过需要注意的是，如果我在 js 里引入了 css，然后 css 中又引入了图片，那么必须要再配置能处理
图片模块的 loader，比如 file-loader。    

## Output Management

多入口:    

```js
module.exports = {
    entry: {
        app: './src/index.js',
        print: './src/print.js'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    }
};
```      

html:  

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script src="print.bundle.js"></script>
</head>
<body>
    <script src="app.bundle.js"></script>
</body>
</html>
```      

index.js:   

```js
import './style.css';
import picSrc from './img/3333.jpeg';
import printMe from './print';

function component() {
    const elem = document.createElement('div');

    elem.innerHTML = ['Hello', 'webpack'].join(' ');
    elem.classList.add('hello');

    elem.addEventListener('click', () => {
        printMe();
    });

    return elem;
}

document.body.appendChild(component());

const img = new Image();
img.src = picSrc;

document.body.appendChild(img);
```     

从代码上看，app.bundle.js 中也打包了 print.js 的代码。     

htmlWebpackPlugin:   

```
npm install --save-dev html-webpack-plugin
```    

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');
//....
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Output Management'
        })
    ]
//...
```   

清理插件：    

```js
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
// ...
    plugin: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: 'Output Management'
        })
    ]
// ...
```    

## Development

使用 sourceMap:   

```js
// ...
devtool: 'inline-source-map'
```   

webpack 中自动编译代码的选项：   

1. watch mode
2. webpack-dev-server
3. webpack-dev-middleware

watch mode 的话编译的时候加 `--watch` 参数就行。    

下一步就是配置 `CleanWebpackPlugin` 不要在 watch 模式触发的增量编译时移除 index.html 文件：    

```js
// ...
plugins: [
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new HtmlWebpackPlugin({
        title: 'Output Management'
    })
]
// ...
```

dev-server: 

```js
devServer: {
    contentBase: './dist'
}
```    

## Code Spliting

目前有三种代码分割的方法：   

- 入口点：使用 `entry` 配置项手动分割
- Prevent Duplication: 使用 `SplitChunksPlugin` 去重 chunks
- Dynamic Imports: 模块内调用函数进行代码分割

单页面多入口点的问题在于重复的模块会在多个引入的入口点打包文件中重复出现。   

既然出现了重复，那就得去重，第一种方案是在入口点声明重复的依赖：  

```js
// ...
entry {
    index: { import: './src/index.js', dependOn: 'shared' },
    another: { import: './src/another-module.js', dependOn: 'shared' },
    shared: 'lodash'
}
```     

不知道这是不是5.0版本新加的功能，目前的话 4.x 版本报错了。   

第二种是使用 `optimization.runtimeChunk`，一般在一个页面上有多个入口点的时候使用。    

然后就是 `SplitChunksPlugin` 插件。这个插件可以将公用的依赖提取到一个已存在的入口块或到一个
全新的块中。    

```js
optimization: {
    splitChunks: {
        chunks: 'all'
    }
}
```    

用了之后生成了4个js文件，分别是 app.bundle.js, print.bundle.js, vendors~app.bundle.js, vendors~app~print.bundle.js。    

前两个分别包含了各自入口点文件本身代码，第三个包含了 style-loader 还是 css-loader 里面的那些
代码，第四个包含了 lodash 的代码，看起来就是把每个入口点的依赖分别提取到一个新的文件里，共用
的依赖也有一个单独的依赖。   

目前为止好像只学了这一种能生成非入口 chunk 的方式。  

dynamic imports 的话就是 `import()` 函数和 webpack 自带的 `require.ensure()` 函数。   

```js
function getComponent() {
    return import(/* webpackChunkName: "lodash" */ 'lodash')
        .then(({join}) => {
                const elem = document.createElement('div');

                elem.innerHTML = join(['Hello', 'webpack'], ' ');
                elem.classList.add('hello');

                return elem;
        })
        .catch((error) => {
            return 'An error occurred while loading the component'
        });
}

getComponent()
    .then((component) => {
        document.body.appendChild(component)
    });
```    

webpack 现在支持 prefetch 和 preload 语法，在使用这样的指令时候，webpack 会在输出的页面中
添加指示：   

- prefetch: 资源可能在之后的跳转中会用到
- proload: 资源可能在当前的跳转中用到     

```js
import(/* webpackPrefetch: true */ 'LoginModal');
```     

webpack 会在页面 head 标签中添加一个 `<link rel="prefetch" href="login-modal-chunk.js">`。    

preload 和 prefetch 指令有以下的不同：    

- preloaded 块会和父块并行加载，prefetched 块是在父块下载完才加载
- preloaded 块是中等的优先级，会立刻下载，prefetched 块是在浏览器空闲的时候下载    

这里其实只提了多入口下的公用代码分割，以及可以延迟请求的功能代码块分割。除了这两种场景外，其实
并不会出现其他要求代码分割的场景。    

不多，严格来说还有一种场景就是为了缓存的目的，将第三方代码和自有代码分割出来。   


## Caching

假设我们配置了输出文件名: `[name].[contenthash].js`，我们可能期望两次 build 出来的文件名
是相同的，但是结果其实文件名是不同的，因为 webpack 本身会在入口点中注入一些模板代码。   

webpack 提供了优化机制 `optimization.runtimeChunk` 配置项，设置为 `single` 就会为所有
块创建一个单独的启动代码块。话说，那设置成其他值呢。   

注意这种情况下，入口点反而成了普通的 chunk，命名规则走的是 `chunkFilename` 配置项。   

不过配置了这个以后，倒是各个入口点和 runtime 的 hash 都不再变化了。    

针对上面提到的，第三方代码提取的问题，需要使用 SplitChunksPlugin 的 `cacheGroups` 配置项，
注意这个插件看起来是内置的，而且不是在 plugins 配置项中配置，而是在 `optimization` 中配置。   

```js
optimization: {
    runtimeChunk: 'single',
    splitChunks: {
        cacheGroups: {
            vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all'
            }
        }
    }
}
```   

ok现在生成了一个 vendors 名的文件，具体来看一下，optimization 配置项即主要针对项目打包做的优化，
`runtimeChunk` 应该是如何优化 webpack 模板启动代码，`splitChunks` 配置如果分割代码达到优化
模板，`cacheGroups` 配置项应该是配置分割代码包的打包组，但是里面的这个 vendor 键名是否有特定的
意思还是随意取这个不是很清楚。    

假设我们现在在入口点文件中多加了一个 `print.js` 的本地依赖，编译后我们可能希望只看到 main 文件的
hash 会变化，可是结果是 runtime, main, verdor 三个文件的 hash 都修改了，因为每个模块的
`module.id` 会默认基于 resolve 顺序递增的，意味着如果 resolve 的顺序变了，id 也就变了，所以：   

- `main` bundle 因为其内容变化了，所以 hash 变了
- `verdor` bundle 因为其 `module.id` 变了，所以 hash 变了
- `runtime` bundle 因为其包含了一个新的模块引用，所以 hash 变了    

然而尴尬的是本地测试的时候就只有 main 的 hash 变了，太尴尬了

其中 vendor 的变化是我们不希望发生的，配置 `optimization.moduleIds` 为 `hashed`:   

```js
optimization: {
    runtimeChunk: 'single',
    moduleIds: 'hashed',
    splitChunks: {
        cacheGroups: {
            vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all'
            }
        }
    }
}
```

## 编写库

假设我们现在写了一个库，然后依赖了 lodash，，我们现在想要实现以下的目标：   

- 使用 `externals` 字段避免将 lodash 进行打包
- 通过一个变量名将库暴露给外界    

使用方理论可以通过以下方式访问这个库：   

- es6 module，例如 `import webpackNumbers from 'webpack-numbers'`
- CJS module，例如 `require('webpack-numbers')`
- 全局变量的引入

```js
const path = require('path');

module.exports = {
entry: './src/index.js',
output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'webpack-numbers.js',
},
externals: {
    lodash: {
        commonjs: 'lodash',
        commonjs2: 'lodash',
        amd: 'lodash',
        root: '_',
    },
},
};
```    

如果我们的库使用过了一个依赖中的几个文件：   

```js
import A from 'library/one';
import B from 'library/two';
```    

这个时候可以通过一个一个排除或者使用正则表达式：   

```js
module.exports = {
    externals: [
        'library/one',
        'library/two',
        // 或者用正则
        /^library\/.+$/,
    ]
}
```    

为了让我们的库能在 cjs，amd，全局变量等方式引入中使用，需要配置 `library` 项。    

```js
output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'webpack-numbers.js',
    library: 'webpackNumbers',
    libraryTarget: 'umd'
}
```