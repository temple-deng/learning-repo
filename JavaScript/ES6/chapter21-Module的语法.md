# 21. Module 的语法

<!-- TOC -->

- [21. Module 的语法](#21-module-的语法)
  - [21.1 export 命令](#211-export-命令)
  - [21.2 import 命令](#212-import-命令)
  - [21.3 模块的整体加载](#213-模块的整体加载)
  - [21.4 import()](#214-import)

<!-- /TOC -->

## 21.1 export 命令

通常情况下，`export` 输出的变量就是本来的名字，但是可以使用 `as` 关键字重命名：    

```js
function v1() { /*...*/ }
function v2() { /*...*/ }

export {
  v1 as streamV1,
  v2 as streamV2,
  v2 as streamLatestVersion
}
```      

需要特别注意的是，`export` 命令规定的是对外的接口，必须与模块内部的变量建立一一对应关系：   

```js
// 报错
export 1;

// 报错
var m = 1;
export m;
```    

上面两种写法都会报错，因为没有提供对外的接口。第一种写法直接输出1，第二种写法通过变量 `m`，还是
直接输出 1。1 只是一个值，不是接口。正确的写法是下面这样：    

```js
export var m = 1;

var m = 1;
export { m };

var n = 1;
export { n as m };
```     

## 21.2 import 命令

如果想为输入的变量重新取一个名字，`import` 命令要使用 `as` 关键字，将输入的变量重命名：   

```js
import { lastName as surname } from './profile.js';
```     

`import` 命令输入的变量都是只读的，因为它的本质是输入接口。也就是说，不允许在加载模块的脚本里面，
改写接口。     

`import` 后面的 `form` 指定模块文件的位置，可以是相对路径，也可以是绝对路径，`.js` 后缀可以
省略。如果只是模块名，不带有路径，那么必须有配置文件，告诉 JS 引擎该模块的位置。    

`import` 命令具有提升效果。   

`import` 预计会执行所加载的模块，如果多次重复执行同一句 `import` 语句，那么只会执行一次，而
不会执行多次。    

```js
import 'lodash';
import 'lodash';
```     

## 21.3 模块的整体加载

```js
import * as circle from './circle';
```    

## 21.4 import()

`import()` 返回一个 Promise 对象。    

