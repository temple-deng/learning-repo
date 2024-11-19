# week20 5.10-5.16

YXBS3-GPEGJ-R63XM-AUMEU

## class: Page

继承自 EventEmitter。    

### 属性

- `page.accessibility`: return `<Accessibility>` 
- `page.coverage`: return `<Coverage>`
- `page.keyboard`: return `<Keyboard>`
- `page.mouse`: return `<Mouse>`
- `page.touchscreen`: return `<TouchScreen>`
- `page.tracing`: return `<Tracing>`      

### 事件

- `close`: 页面关闭
- `console`: 页面内脚本调用 console API 或者页面抛出警告或异常
  + `<ConsoleMessage>`: 传给console的消息内容
- `dialog`: 出现 `alert, confirm, prompt, beforeunload` 弹窗时，pup 可以通过 dialog的
 `accept` 或 `dismiss` 方法进行响应
  + `<Dialog>`
- `domcontentloaded`
- `error`: 页面崩溃
  + `<Error>`
- `frameattached`: 当一个 frame 添加到页面中时
  + `<Frame>`
- `framedetached`: 
  + `<Frame>`
- `framenavigated`: frame 导航到一个新的 url
  + `<Frame>`
- `load`
- `metrics`: 当代码调用 `console.timeStamp`
  + `<Object>`
    - `title`: string, 传给 `console.timeStamp` 的标题
    - `metrics`: obj, 测量键值对
- `pageerror`: 页面出现未捕获的异常
  + `<Error>`
- `popup`: 页面打开一个新的 tab 或 window
  + `<Page>`
- `request`: 页面发出请求，注意跟绑定事件的事件很有关系，如果你在打开页面后再绑定事件，可能只能监听到
一小部分请求，如果在请求页面前绑定，则能监听到大部分响应，包括初始 html 文档的请求
  + `<Request>`
- `requestfailed`: 404, 503 之类的不算failed
  + `<Request>`
- `requestfinished`
  + `<Request>`
- `reponse`: 收到响应
  + `<Response>`
- `workercreated`
  + `<Worder>`
- `workerdestroyed`
  + `<Worker>`

### 方法

- `$(selector)`
- `$$(selector)`
- `$$eval(selector, pageFunction[, ...args])`
- `$eval(selector, pageFunction[, ...args])`
- `$x(expression)`
- `addScriptTag(options)`
- `addStyleTag(options)`
- `authenticate(credentials)`
- `bringToFront()`
- `browser()`
- `browserContext()`
- `click(selector[, opts])`
- `close([opts])`
- `content()`
- `cookies([...urls])`
- `deleteCookie(...cookies)`
- `emulate(opts)`
- `emulateMedia(type)`
- `emulateMediaFeatures(features)`
- `emulateMediaType(type)`
- `emulateTimezone(timezoneId)`
- `evaluate(pageFunction[, ...args])`
- `evaluateHandle(pageFunction[, ...args])`
- `evaluateOnNewDocument(pageFunction[, ...args])`
- `exposeFunction(name, puppeteerFunction)`
- `focus(selector)`
- `frames()`
- `goBack([opts])`
- `goForward([opts])`
- `goto(url[, opts])`
- `hover(selector)`
- `isClosed()`
- `mainFrame()`
- `metrics()`
- `pdf([opts])`
- `queryObjects(prototypeHandle)`
- `reload([opts])`
- `screenshot([opts])`
- `select(selector, ...values)`
- `setBypassCSP(enabled)`
- `setCacheEnabled([enabled])`
- `setContent(html[, opts])`
- `setCookie(...cookies)`
- `setDefaultNavigationTimeout(timeout)`
- `setDefaultTimeout(timeout)`
- `setExtraHTTPHeaders(header)`
- `setGeolocation(options)`
- `setJavaScriptEnabled(enabled)`
- `setOfflineMode(enabled)`
- `setRequestInterception(value)`
- `setUserAgent(userAgent)`
- `setViewport(viewport)`
- `tap(selector)`
- `target()`
- `title()`
- `type(selector, text[, opts])`
- `url()`
- `viewport()`
- `waitFor(selectorOrFunctionOrTimeout[, opts[, ...args]])`
- `waitForFileChooser([opts])`
- `waitForFunction(pageFunction[, opts[, ...args]])`
- `waitForNavigation([...options])`
- `waitForRequest(urlOrPredicate[, opts])`
- `waitForResponse(urlOrPredicate[, opts])`
- `waitForSelector(selector[, opts])`
- `waitForXPath(xpath[, opts])`
- `workers()`     

#### `$(selector)`

- return `<Promise<?ElementHandle>>`    

在页面中执行 `document.querySelector` 方法，如果没有匹配的元素，resolve null。    

`page.mainFrame().$(selector)` 的缩写     

#### `$$(selector)`

- return `<Promise<Array<ElementHandle>>>`    

在页面上执行 `document.querySelectorAll`，如果没有匹配的元素，resolve null。    

`page.mainFrame().$$(selector)` 的缩写。    

#### `$$eval(selector, pageFunction[, ...args])`

- `pageFunction`: `<function<Array<Element>>>` 在 BS 中执行的函数
- `...args`: `<...Serializable|JSHandle>` 传递给 `pageFunction` 的参数
- return: `<Promise<Serializable>>`: `pageFunction` 的返回值

在页面中执行 `Array.from(document.querySelectorAll(selector))`，并将其作为 `pageFunction`
的第1个参数传给 `pageFunction`。    

如果 `pageFunction` 返回 promise，`page.$$eval` 会等到 promise resolve。     

#### `$eval(selector, pageFunction[, ...args])`

略。    

#### `$x(expression)`

- `expression`: string 传给 evaluate 的表达式
- return: `<Promise<Array<ElementHandle>>>`     

执行 XPath 表达式。    

#### `addScriptTag(options)`

- `options`:
  + `url`: 脚本url
  + `path`: JS 的路径，如果是相对路径，就是相对于 CWD
  + `content`: JS 内容
  + `type` 脚本类型 module 代表 ES6 模块
- return: `<Promise<ElementHandle>>`

在页面中嵌入一个 script 标签，通过 url 或内容指定。    

#### `addStyleTag(options)`

- `options`:
  + `url`
  + `path`
  + `content`
- return: `<Promise<ElementHandle>>`

如果指定了 url 就添加一个 `<link rel="stylesheet">` 在页面中，否则添加一个 `<style type="text/css">`。    

#### `authenticate(credentials)`      

- `credentials`
  + `username`
  + `password`
- return `Promise`     

#### `bringToFront()`

- return `Promise`

相当于激活当前页面 tab。     

#### `browser()`    

- return `Browser`     

#### `browserContext()`     

- return `BrowserContext`    

#### `click(selector[, opts])`     

- `selector` 要触发 click 的元素选择器，如果有多个元素符合条件，在第一个元素上触发
- `opts`:
  + `button`: left|right|middle
  + `clickCount`: 默认 1
  + `delay`: mousedown 和 mouseup 之间等待的时间，默认0
- return `Promise` 如果有匹配的元素就 resolve, 否则 reject     

#### close([opts])

- `opts`:
  + `runBeforeUnload` bool, 默认 false，是否执行 before unload 事件 handler。
- return `Promise`     

默认情况下，`page.close()` 不会运行 beforeunload handlers。      

#### `content()`     

- return `Promise<string>`      

页面完整的 HTML 内容。

#### `cookies([...urls])`    

- `...urls`: ...strings
- return: `Promise<Array<Object>>`
  + `name`
  + `value`
  + `domain`
  + `path`
  + `expires` 以秒为单位的 Unix 时间
  + `size`
  + `httpOnly`
  + `secure`
  + `session`
  + `sameSite`: Strict|Lax|Extended|None     

如果没提供 url，就返回当前页面url使用的 cookies，如果提供了 url，就返回这些特定 url 的 cookies。    

#### `deleteCookie(...cookies)`    

- `...cookies`
  + `name`
  + `url`
  + `domain`
  + `path`
- return `Promise`     

#### `emulate(options)`

- `options`
  + `viewport`
    - width
    - height
    - deviceScaleFactor
    - isMobile
    - hasTouch
    - isLandscape
  + `userAgent`
- return `Promise`    

相当于调用这两个方法的简写 `page.setUserAgent()`, `page.setViewpot()`。    

#### `emulateMedia(type)`

- type: 修改 CSS 媒体类型，screen, print, null
- return Promise      

已废弃，用 `page.emulateMediaType(type)` 代替。    

#### `emluateMediaFeatures(features)`

- `features`: `Array<Object>`，每个 feature 都有以下两个属性
  + `name`: 支持的值有 prefers-colors-scheme, prefers-reduced-motion
  + `value`
- return Promise      

#### `emulateMediaType(type)`   

略。     

#### `emluateTimezone(timezoneId)`     

略。    

#### `evaluate(pageFunction[, ...args])`




# get 与 post 的区别

1. get 方法的参数可以存储在浏览器的会话历史中，post 的则不会，但是你返回的时候他会提示你要不要重新提交
2. 多数情况下浏览器会缓存 get 请求的响应而不缓存 post 的
3. 多数情况下 get 是更安全的方法，应为一般情况下它不会去修改资源
4. get 请求一般是幂等的
5. get 方法会被翻译成一个 url 存储在浏览器中，并且只允许使用 ASCII。一般来说一个 URL 的长度
限制在 2048 个字符
6. get 请求可以用作书签，post 不可以，即便加了书签，也是用 get 请求数据