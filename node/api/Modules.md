# Modules

<!-- TOC -->

- [Modules](#modules)
  - [访问主模块](#访问主模块)
  - [Addenda：包管理技巧](#addenda包管理技巧)
  - [综合到一起](#综合到一起)
  - [缓存](#缓存)
    - [模块缓存的陷阱](#模块缓存的陷阱)
  - [核心模块](#核心模块)
  - [从全局文件夹中加载](#从全局文件夹中加载)
  - [The module wrapper](#the-module-wrapper)
  - [The module scope](#the-module-scope)
    - [__dirname](#__dirname)
    - [__filename](#__filename)
    - [exports](#exports)
    - [module](#module)
    - [require()](#require)
    - [require.cache](#requirecache)
    - [require.main](#requiremain)
    - [require.resolve(request\[, options\])](#requireresolverequest\-options\)
    - [require.resolve.paths(request)](#requireresolvepathsrequest)
  - [module Object](#module-object)
    - [module.children](#modulechildren)
    - [module.exports](#moduleexports)
    - [module.filename](#modulefilename)
    - [module.id](#moduleid)
    - [module.loaded](#moduleloaded)
    - [module.parent](#moduleparent)
    - [module.paths](#modulepaths)
    - [module.require(id)](#modulerequireid)

<!-- /TOC -->

## 访问主模块

当一个文件是直接从 Node.js 中执行时，`require.main` 被设置为 `module`。这就意味着我们
可以通过测试 `require.main === module` 来判断文件是否是直接运行的。    

`module` 包含一个 `filename` 属性，因此可以通过 `require.main.filename` 获取当前应用
的入口点。   

## Addenda：包管理技巧

`require()` 函数的语义被设计得足够通用，以支持一系列合理的目录结构。   

假设我们现在有这样一个目录结构：`/usr/lib/node/<some-package>/<some-version>`。    

Node.js 会查找其加载模块的 `realpath`（即解决了符号链接问题），并且在被依赖模块中的
`node_modules` 文件夹中搜索它们自己的依赖。    

## 综合到一起

为了获取到调用 `require()` 函数所获取的准确的文件名，使用 `require.resolve()` 函数。   

下面是对 `require.resolve()` 算法的简单描述：   

在路径 Y 中一个模块中有 `require(X)`    

1. 如果 X 是一个核心模块，
  - 返回这个核心模块
  - 搜索终止
2. 如果 X 是以 '/' 开头的
  - 将文件系统根设置为 Y
3. 如果 X 以 './' 或者 '/' 或者 '../' 开头
  - LOAD_AS_FILE(Y + X)
  - LOAD_AS_DIRECTORY(Y + X)
4. LOAD_NODE_MODULES(X, dirname(Y))
5. THROW "not found"

LOAD_AS_FILE(X)    

1. 如果 X 是一个文件，将 X 作为 JS 文本加载。搜索终止
2. 如果 X.js 是一个文件，将 X.js 作为 JS 文本加载。搜索终止
3. 如果 X.json 是一个文件，将 X.json 解析为一个对象。搜索终止
4. 如果 X.node 是一个文件，将 X.node 作为一个二进制插件加载。搜索终止    

LOAD_INDEX(X)    

1. 如果 X/index.js 是一个文件，将 X/index.js 作为 JS 文本加载。搜索终止
2. 如果 X/index.json 是一个文件，将 X/index.json 解析为一个对象。搜索终止
3. 如果 X/index.node 是一个文件，将 X/index.node 作为一个二进制插件加载。搜索终止    

LOAD_AS_DIRECTORY(X)   

1. 如果 X/package.json 是一个文件
  - 解析 X/package.json，查找 "main" 字段
  - 令 M = X + (json main field)
  - LOAD_AS_FILE(M)
  - LOAD_INDEX(M)
2. LOAD_INDEX(X)    

LOAD_NODE_MODULES(X, START)    

1. 令 DIRS = NODE_MODULES_PATH(START)
2. 对于 DIRS 中的每一个 DIR
  - LOAD_AS_FILE(DIR/X)
  - LOAD_AS_DIRECTORY(DIR/Y)


NODE_MODULES_PATH(START)     

1. 令 PARTS = path split(START)
2. 令 I = PARTS.length - 1
3. 令 DIRS = \[GLOBAL_FOLDERS\]
4. while I &gt;= 0,
  - 如果 PARTS\[I\] = "node_modules" CONTINUE（也就说跳出本次循环咯）
  - DIR = path join(PARTS\[0 .. I\] + "node_modules")
  - DIRS = DIRS + DIR
  - 令 I = I - 1
5. 返回 DIRS    

## 缓存

模块在第一次加载后可以被缓存。     

### 模块缓存的陷阱

模块是基于其最终解析后的文件名来缓存的。由于不同位置对模块的加载可能会解析出不同的文件名。
因此无法担保 `require('foo')` 总是会返回一个相同的对象。    

另外，在大小写不敏感的文件系统或操作系统上，解析后不同的文件名可能会指向相同的文件，但是
缓存仍会将其视为不同的模块。    

## 核心模块

Node.js 有一些模块已经编译到可执行文件中。这些核心模块的代码在 Node.js 源码中的 `lib/`
文件夹中。    

## 从全局文件夹中加载

如果 `NODE_PATH` 环境变量被设置为一个冒号（Linux）或分号（Wins）的绝对路径的列表，那么
这些路径会用来被加载的模块。    

除了我们在环境变量中定义的路径，Node.js 还会在以下全局文件夹中搜索模块：   

1. `$HOME/.node_modules`
2. `$HOME/.node_libraries`
3. `$PREFIX/lib/node`     

`$PREFIX` 是由 Node.js 配置的 `node_prefix`。     

这些东西通常是由于历史原因保留了下来。    

## The module wrapper

在一个模块代码执行前，Node.js 会像下面这样将代码包裹起来：   

```js
(function(exports, require, module, __filename, __dirname) {
  // 模块代码
});
```    

Node.js 这样做是为了实现以下的目标：   

+ 将模块中的顶层变量变为模块范围内的变量而不是全局对象
+ 提供一些模块特定的全局变量，例如：
  - `module` 和 `exports` 对象用来从模块中导出值
  - `__dirname` 和 `__filename`，包含模块的绝对路径和文件名

## The module scope

### __dirname

+ string

当前模块的目录名。    

### __filename

+ string   

当前模块的文件名。包含绝对路径。    

### exports

对 `module.exports` 的一个引用。    

### module

+ Object    

对当前模块的引用。`module.exports` 用来定义模块的导出值。    

### require()

+ Function    

### require.cache   

+ Object    

当一个模块被加载时，它会被缓存到这个对象中。通过删除这个对象上的一个键值对，下一次调用
`require()` 就会重新加载那个模块。    

### require.main

+ Object    

Node.js 启动加载的入口脚本的 `Module` 对象。    

### require.resolve(request\[, options\])

+ `request` &lt;string&gt; 用来解析的模块路径
+ `options` &lt;Object&gt;
  - `paths` &lt;string\[\]&gt; 用来解析模块位置的路径。如果定义了这个参数，就用这些路径
  来替换掉默认的解析路径，除了 `$HOME/.node_modules`。
+ Returns &lt;string&gt;     

使用内部的 `require()` 机制来搜索模块的位置，只不过是返回解析后的文件名而不是加载模块。    

### require.resolve.paths(request)

+ `request` &lt;string&gt;
+ Returns: &lt;string\[\]&gt; | &lt;null&gt;    

返回在解析 `request` 时使用的搜索的路径的数组，如果 `request` 是一个核心模块的话，就返回
`null`     

## module Object

+ &lt;Object&gt;    

在每个模块中，`module` 变量引用了当前的模块。     

### module.children

+ &lt;module\[\]&gt;    

被本模块第一次加载的模块列表。   

### module.exports

略。    

### module.filename

+ &lt;string&gt;    

模块完整的文件名。    

### module.id

+ &lt;string&gt;    

模块的 ID。通常来说就是模块完整的文件名。    

### module.loaded

+ boolean    

是否模块已经完成加载，还是在加载过程中。   

### module.parent

+ &lt;module&gt;    

第一个请求这个模块的模块。    

### module.paths

+ &lt;string\[\]&gt;    

用来查看这个模块的路径数组。    

### module.require(id)

+ `id` string
+ Returns: Object 被解析模块的 `module.exports`    

看不懂。    