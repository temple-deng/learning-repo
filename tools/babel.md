# Babel

> 摘自 https://zhuanlan.zhihu.com/p/43249121

<!-- TOC -->

- [Babel](#babel)
  - [ES6 和提案](#es6-和提案)
  - [Babel 7](#babel-7)
  - [官方的用户指南](#官方的用户指南)
  - [配置](#配置)
  - [配置文件](#配置文件)
    - [项目范围的配置](#项目范围的配置)
    - [相对文件位置的配置](#相对文件位置的配置)
  - [执行顺序](#执行顺序)
  - [插件和 preset 的配置项](#插件和-preset-的配置项)
  - [env](#env)
  - [babel-node](#babel-node)
  - [babel-register](#babel-register)
  - [Polyfill](#polyfill)
  - [core-js](#core-js)
  - [Plugins](#plugins)
  - [transform-plugin](#transform-plugin)
    - [作用](#作用)
    - [细节](#细节)

<!-- /TOC -->

## ES6 和提案

首先需要注意的一点是稳定的 ES6+ 功能和 ECMA 的提案，稳定的 ES6+ 功能是指那些已经被发布为标准
的功能，通常来说 @babel/preset-env 会包含当前所有已经被写入标准的功能，但是那些还处于提案
阶段的功能并不会包含在 env 中，这些提案在 Babel 7 中均需要我们独立的导入单独的 plugin 来
使用。   

关于一些提案的部分，在 @babel/polyfill 中也移除了对提案的支持，但是其实 core-js v3 中
是包含提案的转换，因此如果我们想要使用一些处于提案中的功能，语法的转换可能需要安装独立的 plugin，
而环境的转换可能需要手动从 core-js 中引入。    

## Babel 7

Babel 7 将包全部升级成了范围包 scoped packages，名字都类似于 @babel/preset-env。
什么是范围包呢，通常可以将范围包的 scope 理解为一个命名空间，这样就可以避免一些命名冲突。
scoped package 命名也是普通的包遵循一致的规范，不过是包含了一个额外的 scope，这个 scope
是用一个 @ + scoped name + / 组成的。    

每个 npm 的用户和组织都可以有它们自己的 scope，并且只有它们自己可以在它们的 scope 中
添加包。这就意味着别人无法占用我们的包名了。    

scoped package 的安装位置是在 `node_modules/@myorg/packagename`，同时在引用 scoped
package 的时候也要加 scope `require('@myorg/mypackage')`   

同时 Babel 7 移除了所有的基于年的 preset，只留下了 @babel/preset-env。同时所有的 stage
preset 也被删除，改用单独的提案 package。   

引入 babel.config.js 配置文件，但并不强制要求这个文件，它也不是 .babelrc 的替代品。这个
文件也有着完全不同的配置定位方案，在过去中，Babel 会一直往上找 .babelrc 文件，直到找到了
一个这样的配置文件。而 babel.config.js 则始终根据这个文件定位。这一段解释的有问题，
等以后了解了再修改。   

## 官方的用户指南

1. 安装包：   

```bash
$ npm install --save-dev @babel/core @babel/cli @babel/preset-env
$ npm install --save-dev @babel/polyfill
```   

2. 在项目根目录创建 `babel.config.js` 配置文件：   

```js
const presets = [
  [
    "@babel/env",
    {
      targets: {
        edge: "17",
        firefox: "60",
        chrome: "67",
        safari: "11.1"
      },
      useBuiltIns: "usage"
    }
  ]
];

module.exports {
  presets
};
```   

注意上面的 preset 写的是 @babel/env 而不是 @babel/preset-env，把 preset 去掉了。
插件好像也是可以省去 plugin 部分的。   

3. 执行编译指令：   

```shell
$ ./node_modules/.bin/babel src --out-dir lib
```   

Babel 的核心功能位于 @babel/core 包。不过一般我们不会直接使用这个包，而是使用一些其他
使用了这个包提供的接口的工具。    

## 配置

支持的配置方案：   

+ babel.config.js
+ .babelrc
+ package.json babel 字段
+ .babelrc.js 这个等同于 .babelrc，但也提供了 JS 语言功能
+ 直接 CLI 参数传入
+ 直接使用 babel/core 提供的 API 时提供

由于 babel.config.js 是一个普通的 JS 文件，而 .babelrc 只是一个 JSON 对象，因此推荐
使用 babel.config.js 文件，因为这提供了更多的编程的功能。   

## 配置文件

Babel 有两种并行的配置文件的格式，这两种可以结合着使用，也可以单独的使用：   

+ 项目范围级别的配置
+ 相对文件位置的配置
  - `.babelrc, .babelrc.js`
  - `package.json` 的 babel 字段

### 项目范围的配置

在 Babel 7 中有了一个根目录的概念，即当前的工作目录，对于项目级别的配置来说，Babel 会自动
在根目录中搜索 babel.config.js 文件。当然也可以通过指定 `configFile` 命令行参数来指定这个
文件的位置。    

不过看文档的意思，其实这种搜索不是一直向上不停的，好像是如果找到了一个 package.json 出现的
目录还没有找到 babel.config.js 文件的话，就不再向上搜索了，认为 package.json 出现的目录
就是根目录。    

### 相对文件位置的配置

Babel 会从要被编译的文件所在的目录开始向上搜索 .babelrc, .babelrc.js, package.json#babel
配置。相对文件的配置最终会和项目范围的配置进行合并。    

这个搜索也是会停止在一个包含 package.json 的目录。   

## 执行顺序

+ Plugin 会运行在 Preset 之前
+ Plugin 会从前到后顺序执行
+ Preset 的顺序则是从后向前的    

preset 的逆向顺序主要是为了保证向后兼容，因为大多数用户的编写顺序是 `['es2015', 'stage-0']`。
这样必须先执行 stage-0 才能确保 babel 不报错。因此我们编排 preset 的时候，也要注意顺序，
其实只要按照规范的时间顺序列出即可。     

## 插件和 preset 的配置项

简略情况下，插件和 preset 只要列出字符串格式的名字即可。但如果某个 preset 或者插件需要一些
配置项(或者说参数)，就需要把自己先变成数组。第一个元素依然是字符串，表示自己的名字；第二个
元素是一个对象，即配置对象。     

```json
"presets": [
    // 带了配置项，自己变成数组
    [
        // 第一个元素依然是名字
        "env",
        // 第二个元素是对象，列出配置项
        {
          "module": false
        }
    ],

    // 不带配置项，直接列出名字
    "stage-2"
]
```    

## env

env 的核心目的是通过配置得知目标环境的特点，然后只做必要的转换。例如目标浏览器支持 es2015，
那么 es2015 这个 preset 其实是不需要的，于是代码就可以小一点(一般转化后的代码总是更长)，
构建时间也可以缩短一些。    

如果不写任何配置项，env 等价于 latest，也等价于 es2015 + es2016 + es2017 三个相加(不包含 stage-x 中的插件)。    

## babel-node

babel-node 是 babel-cli 的一部分，不需要单独安装。不过这是 Babel 6 中的情况了，在
Babel 7 中两者已经分离，如果需要使用 babel-node，需要安装 @babel/node 包。      

它的作用是在 node 环境中，直接运行 es2015 的代码，而不需要额外进行转码。例如我们有一个
js 文件以 es2015 的语法进行编写(如使用了箭头函数)。我们可以直接使用 `babel-node es2015.js`
进行执行，而不用再进行转码了。   

可以说：babel-node = babel-polyfill + babel-register。    

## babel-register

babel-register 模块改写 require 命令，为它加上一个钩子。此后，每当使用 require 加载
.js、.jsx、.es 和 .es6 后缀名的文件，就会先用 babel 进行转码。    

使用时，必须首先加载 `require('babel-register')`。    

需要注意的是，babel-register 只会对 require 命令加载的文件转码，而 不会对当前文件转码。  

另外，由于它是实时转码，所以只适合在开发环境使用。    

## Polyfill

@babel/polyfill 模块包含了 core-js 和一个 regenerator runtime 来模拟完整的 ES6+
环境。其实 polyfill 也只做了这些，这个包自己其实并不提供功能，它只是把 core-js 和
regeneratro runtime 两个包导入，下面是代码：   

```js
// Cover all standardized ES6 APIs.
import "core-js/es6";

// Standard now
import "core-js/fn/array/includes";
import "core-js/fn/string/pad-start";
import "core-js/fn/string/pad-end";
import "core-js/fn/symbol/async-iterator";
import "core-js/fn/object/get-own-property-descriptors";
import "core-js/fn/object/values";
import "core-js/fn/object/entries";
import "core-js/fn/promise/finally";

// Ensure that we polyfill ES6 compat for anything web-related, if it exists.
import "core-js/web";

import "regenerator-runtime/runtime";

if (global._babelPolyfill && typeof console !== "undefined" && console.warn) {
  console.warn(
    "@babel/polyfill is loaded more than once on this page. This is probably not desirable/intended " +
      "and may have consequences if different versions of the polyfills are applied sequentially. " +
      "If you do need to load the polyfill more than once, use @babel/polyfill/noConflict " +
      "instead to bypass the warning.",
  );
}

global._babelPolyfill = true;
```

由于 polyfill 会污染全局作用域以及一个原生对象的原型。就像上面提到的我们可能需要使用
transform runtime plugin。    

更进一步，如果我们明确地知道我们需要哪些垫片 polyfill 功能，可以直接从 core-js 中require。    

在 Babel 7 中，如果我们 env preset 中的 `useBuiltIns` 配置设置为了 `"usage"`，那么
Babel 会自动替我们进行上述的优化。Babel 会检测我们目标环境中缺失的功能，然后只 require
那些缺失的功能模块。   

`Promise.resolve().finally()` 可能会转换成：    

```js
require("core-js/modules/es.promise.finally");

Promise.resolve().finally();
```   

regenerator-runtime 其实只提供了 generator 函数和 async 函数以及异步迭代器的功能，大部分
功能都是 core-js 提供的。    

## core-js

core-js 好像可以分成两个部分，core-js 和 core-js-pure，后者不会污染全局命名空间以及原生
对象的原型，但是代价就是我们需要的每个部分功能都要手动导入，而且都是作为普通的函数使用。   

```js
import from from 'core-js-pure/features/array/from';
import flat from 'core-js-pure/features/array/flat';
import Set from 'core-js-pure/features/set';
import Promise from 'core-js-pure/features/promise';

from(new Set([1, 2, 3, 2, 1]));                // => [1, 2, 3]
flat([1, [2, 3], [4, [5]]], 2);                // => [1, 2, 3, 4, 5]
Promise.resolve(32).then(x => console.log(x)); // => 32
```    

@babel/runtime 可以简化我们与 core-js-pure 的工作方式，可以让我们正常的使用 ES6+ 功能，但是
这个库只能添加一些全局对象和原生对象上的静态方法，实例方法无法使用。    


接着说上面针对 env preset 的 `useBuiltIns` 选项，这个选项有两个可选值：   

+ `entry`，这个的话好像也是根据我们的模板环境按需加载 core-js 模块，但是是统一在我们入口点
文件的开头把所有的模块导入（注意这种是使用 polyfill 的方式，所以会污染命名空间）
+ `usage`，和 `entry` 类似，但是并不会统一在入口点加载模块，而是在每个使用了模板环境没有的
功能的模块的头部加载必要的模块。

## Plugins

Plugins 分为语法 Plugins 和转换 Plugins，语法 Plugins 只提供了语法解析的功能，转换 Plugins
提供语法转换的功能，同时如果我们使用了转换 Plugins 它会自动启用对应的语法 Plugin，因此我们没
必要在使用转换 Plugin 的同时还声明要使用语法 Plugin。    

配置文件中的如果 plugin 的名称有 `babel-plugin-` 前缀，那这个前缀在配置时是可以省略的，在
Babel 7 的 scoped package 中也是一样：   

```json
{
  "plugins": [
    "@org/babel-plugin-name",
    "@org/name" // equivalent
  ]
}
```    

同样的道理也适用于 preset。   

## transform-plugin

需要将 plugin-transform-runtime 声明成开发依赖：   

`$ npm install --save-dev @babel/plugin-transform-runtime`    

@babel/runtime 声明成生产依赖：   

`$ npm install --save @babel/runtime`    

### 作用

Babel 通常会定义一些非常小的通用函数，例如 `_extend`。默认情况下，这些函数会添加到每个加载的
模块中，这种重复是没有必要的，会明显增大打包后的文件体积。    

因此 @babel/plugin-transform-time 就做了这样一件事：将所有的 helpers 函数移到 @babel/runtime
模块中，然后每个需要的文件引用这个模块即可。   

另一个作用就是避免在使用 @babel/polyfill 时对全局环境的污染。    

默认的配置：   

```js
{
  "plugins": [
    [
      "@babel/plugin-transform-runtime",
      {
        "corejs": false,
        "helpers": true,
        "regenerator": true,
        "useESModules": false
      }
    ]
  ]
}
```   

注意这种配置下，Babel 是认为所有的 polyfill 功能是由用户自己提供的，因此如果我们需要让
这个插件提供的话，需要设置 corejs 配置项。   

`corejs` 配置项可以是布尔值或者数值，看意思布尔值的话就决定了 corejs 包的内容是否由这个
插件提供。    

而且看情况，如果要使用 corejs 的功能，我们需要的是 @babel/runtime-corejs2，而不是
@babel/runtime。   

### 细节

`transform-runtime` 转换器插件做了三件事：   

+ 在使用 generator/async 函数时自动加载 `@babel/runtime/regenerator`（使用 `regenerator`
选项配置）
+ 在必要的时候可以使用 core-js 特定的 helpers，而不是用户手动指定 polyfill（使用 `corejs`
配置）
+ 自动移除内联的 Babel helpers，并改成使用 `@babel/runtime/helpers` 模块（使用 `helpers`
配置）

根据源代码来看，corejs 的功能是 @babel/runtime-corejs2 包提供的。    