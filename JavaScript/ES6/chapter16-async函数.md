# async函数

## 目录

1. [含义](#part1)
2. [语法](#part2)

<a name="part1"></a>
## 含义

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


<a name="part2"></a>
## 2. 语法

`async` 返回一个 Promise 对象。函数内部 `return` 语句的返回值，会成为 `then` 方法回调函数的参数。  

```javascript
async function f() {
  return 'hello world';
}

f().then(v => console.log(v))
// "hello world"
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
