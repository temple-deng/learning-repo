# Babel

> 摘自 https://zhuanlan.zhihu.com/p/43249121

## 运行方式和和插件

babel 总共分为三个阶段：解析，转换，生成。    

babel 本身不具有任何转化功能，它把转化的功能都分解到一个个 plugin 里面。因此当我们不配置
任何插件时，经过 babel 的代码和输入是相同的。    

插件总共分为两种：   

+ 当我们添加 **语法插件** 之后，在解析这一步就使得 babel 能够解析更多的语法。(顺带一提，
babel 内部使用的解析类库叫做 babylon，并非 babel 自行开发)
+ 当我们添加 **转译插件** 之后，在转换这一步把源码转换并输出。这也是我们使用 babel 最本质的需求。    

同一类语法可能同时存在语法插件版本和转译插件版本。如果我们使用了转译插件，就不用再使用语法插件了。    

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

## 其他配套工具

### babel-node

babel-node 是 babel-cli 的一部分，不需要单独安装。    

它的作用是在 node 环境中，直接运行 es2015 的代码，而不需要额外进行转码。例如我们有一个
js 文件以 es2015 的语法进行编写(如使用了箭头函数)。我们可以直接使用 `babel-node es2015.js`
进行执行，而不用再进行转码了。   

可以说：babel-node = babel-polyfill + babel-register。    

### babel-register

babel-register 模块改写 require 命令，为它加上一个钩子。此后，每当使用 require 加载
.js、.jsx、.es 和 .es6 后缀名的文件，就会先用 babel 进行转码。    

使用时，必须首先加载 `require('babel-register')`。    

需要注意的是，babel-register 只会对 require 命令加载的文件转码，而 不会对当前文件转码。  

另外，由于它是实时转码，所以只适合在开发环境使用。    

### babel-polyfill

babel 默认只转换 js 语法，而不转换新的 API，比如 Iterator、Generator、Set、Maps
Proxy、Reflect、Symbol、Promise 等全局对象，以及一些定义在全局对象上的方法
(比如 `Object.assign`)都不会转码。   

举例来说，es2015 在 Array 对象上新增了 `Array.from` 方法。babel 就不会转码这个方法。
如果想让这个方法运行，必须使用 babel-polyfill。(内部集成了 core-js 和 regenerator)    

使用时，在所有代码运行之前增加 `require('babel-polyfill')`。或者更常规的操作是在 webpack.config.js 中将 babel-polyfill 作为第一个 entry。因此必须把 babel-polyfill
作为 `dependencies` 而不是 `devDependencies`。    

babel-polyfill 主要有两个缺点：   

+ 使用 babel-polyfill 会导致打出来的包非常大，因为 babel-polyfill 是一个整体，把所有
方法都加到原型链上。比如我们只使用了 `Array.from`，但它把 `Object.defineProperty`
也给加上了，这就是一种浪费了。这个问题可以通过单独使用 core-js 的某个类库来解决，core-js
都是分开的。
+ babel-polyfill 会污染全局变量，给很多类的原型链上都作了修改，如果我们开发的也是一个类库
供其他开发者使用，这种情况就会变得非常不可控。     

因此在实际使用中，如果我们无法忍受这两个缺点(尤其是第二个)，通常我们会倾向于使用 
babel-plugin-transform-runtime。    

### babel-runtime 和 babel-plugin-transform-runtime 

以 async/await 举例，如果不使用这个 plugin (即默认情况)，转换后的代码大概是：   

```js
// babel 添加一个方法，把 async 转化为 generator
function _asyncToGenerator(fn) { return function () {....}} // 很长很长一段

// 具体使用处
var _ref = _asyncToGenerator(function* (arg1, arg2) {
  yield (0, something)(arg1, arg2);
});
```    

这个 `_asyncToGenerator` 在当前文件被定义，然后被使用了，以替换源代码的 `await`。
但每个被转化的文件都会插入一段 `_asyncToGenerator` 这就导致重复和浪费了。    

在使用了 babel-plugin-transform-runtime 了之后，转化后的代码会变成：   

```js
// 从直接定义改为引用，这样就不会重复定义了。
var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');
var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

// 具体使用处是一样的
var _ref = _asyncToGenerator3(function* (arg1, arg2) {
  yield (0, something)(arg1, arg2);
});
```    

在使用 babel-plugin-transform-runtime 的时候必须把 babel-runtime 当做依赖。    

再说 babel-runtime，它内部集成了：    

1. core-js: 转换一些内置类(Promise, Symbols等等)和静态方法(`Array.from` 等)。绝大
部分转换是这里做的。自动引入。
2. regenerator: 作为 core-js 的拾遗补漏，主要是 `generator/yield` 和 `async/await`
两组的支持。当代码中有使用 `generators/async` 时自动引入。
3. helpers, 如上面的 asyncToGenerator 就是其中之一，其他还有如 jsx, classCallCheck
等等，可以查看 babel-helpers。在代码中有内置的 helpers 使用时(如上面的第一段代码)移除定义，
并插入引用(于是就变成了第二段代码)。    

babel-plugin-transform-runtime 不支持 实例方法 (例如 `[1,2,3].includes(1)`)，只能
用 babel-polyfill。    





