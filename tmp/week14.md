# 第 14 周 （3.30-4.3）

#### waitForTarget(predicate[, options])

- `predicate`: `function(target):bool` 每个target 会运行的函数
- options:
  + `timeout`
- return `Promise<Target>` 与 `predicate` 匹配的第一个找到的 target    

看起来这个东西有点像 Array 的 find 方法，找到一个回调返回 true 的 target。    

这个函数在所有 browser context 搜索指定的 target。    

```js
await page.evaluate(() => {
  window.open('https://www.example.com/');
});

const newWindowTarget = await browser.waitForTarget(target => target.url() === 'https://www.example.com/');
```     

从这个代码来看，target 有点像一个 window 对象。    

#### wsEndpoint()

- return `string`: 浏览器的 ws url    

应该是类似这样的一个字符串 `ws://127.0.0.1:53028/devtools/browser/8589639b-b88b-49a6-883a-56c85d55aa27`。     

格式是 `ws://${host}:${port}/devtools/browser/<id>`。     

## class: BrowserContext

继承自 EventEmitter。    

BS 提供了操作多个独立的浏览器会话的方式。当一个浏览器启动时，默认只有一个单一的 BS 可供使用。
`browser.newPage()` 就在这个默认的 BS 这种创建一个页面。    

pup 允许我们使用 `browser.createIncognitoBrowserContext()` 创建一个无痕模式的 BS。   

```js
const context = await browser.createIncognitoBrowserContext();

const page = await context.newPage();

await page.goto('https://www.example.com/');

await context.close();
```    

从这个代码感觉 Browser 实例也是一个 BrowserContext 实例，有种继承的效果，相当于内部保存了一个
默认的 BS。    

事件：    

- `targetchanged`
- `targetcreated`
- `targetdestroyed`    

方法：     

- `browser()`
- `clearPermissionOverrides()`
- `close()`
- `isIncognito()`
- `newPage()`
- `overridePermissions(origin, permissions)`
- `pages()`
- `targets()`
- `waitForTarget(predicate[, options])`    

#### browser()

- return `Browser`    

context 所属的 browser 对象。    

#### clearPermissionOverrides()

- return `Promise`

清除 BS 中所有的权限覆盖。    

```js
const context = await browser.createIncognitoBrowserContext();

context.overridePermissions('https://www.example.com', ['clipboard-read']);

context.clearPermissionOverrides();
```     

#### close()

- return `Promise`    

关闭 BS，BS 中的所有 targets 都会关闭。   

#### isIncognito()

- return `boolean`    

默认的 BS 是唯一的一个非无痕模式的 BS。只能用 `createIncognitoBrowserContext()` 创建
BS 石锤了。    

#### newPage()

- return `Promise<Page>`     

#### overridePermissions(origin, permissions)

- `origin`: `string`，授予权限的 origin
- `permissions`: `Array<string>` 要授予的权限：
  + `geolcation`
  + `midi`
  + `midi-sysex`
  + `notifications`
  + `push`
  + `camera`
  + `microphone`
  + `background-sync`
  + `ambient-light-sensor`
  + `accelerometer`
  + `gyroscope`
  + `accessibility-events`
  + `clipboard-read`
  + `clipboard-write`
  + `payment-handler` 
- return `Promise`    

#### pages()    

略。     

#### targets()

略。    

#### waitForTarget(predicate[,options])

略。   