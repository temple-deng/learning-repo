# 18. async函数

<!-- TOC -->

- [18. async函数](#18-async函数)
  - [18.1 含义](#181-含义)
  - [18.2 语法](#182-语法)
  - [18.3 顶层 await](#183-顶层-await)

<!-- /TOC -->

## 18.1 含义

```javascript
var asyncReadFile = async function () {
  var f1 = await readFile('/etc/fstab');
  var f2 = await readFile('/etc/shells');
  console.log(f1.toString());
  console.log(f2.toString());
};
```

一比较就会发现，`async` 函数就是将 Generator 函数的星号（`*`）替换成 `async`，将 `yield` 替换成 `await`，仅此而已。  

`async` 函数对 Generator 函数的改进，体现在以下四点:  

1. 内置执行器。
2. 更好的语义。
3. 更广的适用性。`await` 命令后面，可以是Promise 对象和原始类型的值（数值、字符串和布尔值，但这时等同于同步操作）。
4. 返回值是 Promise。  

## 18.2 语法

`async` 返回一个 Promise 对象。函数内部 `return` 语句的返回值，会成为 `then` 方法回调函数的参数。  

```javascript
async function f() {
  return 'hello world';
}

f().then(v => console.log(v))
// "hello world"
```    

`async` 函数有多种使用形式：   

```js
// 函数声明
async function foo() {}

// 函数表达式
const foo = async function () {}

// 对象的方法
let obj = { async foo() {} };

// Class 的方法
class Storage {
  constructor() {
    this.cachePromise = caches.open('avatars');
  }

  async getAvatar(name) {
    const cache = await this.cachePromise;
    return cache.match(`/avatars/${name}.jpg`);
  }
}

// 箭头函数
const foo = async () => {};
```

`async` 函数内部抛出错误，会导致返回的 Promise 对象变为 `reject` 状态。抛出的错误对象会被 `catch` 方法回调函数接收到。  

`async` 函数返回的 Promise 对象，必须等到内部所有的 `await` 命令后面的 Promise 对象执行完，才会发生状态改变，除非遇到 `return` 语句或者抛出错误。  

正常情况下，`await` 命令后面是一个 Promise 对象。如果不是，会被转成一个立即 `resolve` 的 Promise 对象。  

`await` 命令后面的 Promise 对象如果变为`reject` 状态，则 `reject` 的参数会被 `catch` 方法的回调函数接收到。  

只要一个 `await` 语句后面的 Promise 变为 `reject`，那么整个 `async` 函数都会中断执行。  

有时，我们希望即使前一个异步操作失败，也不要中断后面的异步操作。这时可以将第一个 `await`放在 `try...catch` 结构里面，这样不管这个异步操作是否成功，第二个 `await` 都会执行。  

另一种方法是 `await` 后面的 Promise 对象再跟一个 `catch` 方法，处理前面可能出现的错误。  

多个 `await` 命令后面的异步操作，如果不存在继发关系，最好让它们同时触发。  

```javascript
// 写法一
let [foo, bar] = await Promise.all([getFoo(), getBar()]);

// 写法二
let fooPromise = getFoo();
let barPromise = getBar();
let foo = await fooPromise;
let bar = await barPromise;
```

## 18.3 顶层 await

根据语法规格，`await` 命令只能出现在 async 函数内部，否则都会报错。   

目前，有一个语法提案，允许在模块的顶层独立使用 `await` 命令，这个提案的目的，是借用 `await`
解决模块异步加载的问题：    

```js
// awaiting.js
let output;

async function main() {
  const dynamic = await import(someMission);
  const data = await fetch(url);
  output = somePromcess(dynamic.default, data);
}

main();
export { output };
```     

下面是加载这个模块的写法：    


```js

// usage.js
import { output } from "./awaiting.js";

function outputPlusValue(value) { return output + value; }

console.log(outputPlusValue(100));
```    

上面代码中，outputPlusValue()的执行结果，完全取决于执行的时间。如果awaiting.js里面的异步操作没执行完，加载进来的output的值就是undefined。     

目前的解决方案，就是让原始模块输出一个 Promise 对象，从这个 Promise 对象判断异步操作有没有结束。    

```js
// awaiting.js
let output;

export default { async function main() {
    const dynamic = await import(someMission);
  const data = await fetch(url);
  output = somePromcess(dynamic.default, data);
}}

export { output };
```     

下面是加载这个模块的新的写法：    

```js
// usage.js
import promise, { output } from "./awaiting.js";

function outputPlusValue(value) { return output + value }

promise.then(() => {
  console.log(outputPlusValue(100));
  setTimeout(() => console.log(outputPlusValue(100), 1000);
});
```     

这种写法比较麻烦，等于要求模块的使用者遵守一个额外的使用协议，按照特殊的方法使用这个模块。一旦
你忘了要用 Promise 加载，只使用正常的加载方法，依赖这个模块的代码就可能出错。而且，如果上面的
usage.js又有对外的输出，等于这个依赖链的所有模块都要使用 Promise 加载。     

顶层的 `await` 命令就是为了解决这个问题，它保证只有异步操作完成，模块才会输出值。    

```js
// awaiting.js
const dynamic = import(someMission);
const data = fetch(url);

export const output = someProcess((await dynamic).default, await data)
```      

加载这个模块的写法如下。    

```js
// usage.js
import { output } from "./awaiting.js";
function outputPlusValue(value) { return output + value }

console.log(outputPlusValue(100));
setTimeout(() => console.log(outputPlusValue(100), 1000);
```

