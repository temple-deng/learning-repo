# week40 9.27-10.3

# webpack

## Dependency Management

context 模块会在我们 require 一个表达式的时候生成，假设我们有以下的结构：   

```
example_directory
|
|--------template
|           |   table.ejs
|           |   table-row.ejs
|           |
|           |-----directory
|           |   another.ejs
```     

当我们使用如下的 require 时：   

```js
require('./template/' + name + '.ejs');
```     

webpack 会解析这个调用并生成如下的信息：   

```
Directory:  ./template
Regular expression:  /^.*\.ejs$/
```    

这时候会生成一个 context 模块，他会包含所有这个目录下所有能和上面的正则表达式匹配的文件的模块信息。
context 模块会包含一个 request 到模块 id 的映射表：   

```js
{
    "./table.ejs": 42,
    "./table-row.ejs": 43,
    "./directory/another.ejs": 44
}
```    

这就意味着，动态 require 是可行的，但是会造成所有匹配的模块都会包含在打包文件中。   

另一方面我们可以使用 `require.context()` 函数创建自己要用的 context 模块。    

这个函数可以让我们传入一个目录进行搜索，一个标志位指定是否搜索子目录，以及一个用来匹配文件的正则
表达式。     

```js
require.context('./test', false, /\.test\.js$/);
```      

context 模块会导出一个 require 函数，这个函数接受一个参数：即请求的模块。    

这个函数有三个属性：`resolve`, `keys`, `id`   

- `resolve` 是一个函数，会返回解析后请求模块的模块id
- `keys` 是一个函数，会返回所有该 context 模块可以处理的所有请求    

```js
function importAll (r) {
    r.keys().forEach(r);
}

importAll(require.context('../components/', true, /\.js$/));
```    

```js
const cache = {};

function importAll (r) {
  r.keys().forEach(key => cache[key] = r(key));
}

importAll(require.context('../components/', true, /\.js$/));
// At build-time cache will be populated with all required modules.
// 

