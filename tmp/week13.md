# 第13周 3.23-3.27

# 设计模式-------------

# 第 9 章 命令模式

## 9.3 JS 中的命令模式

命令模式的由来，其实是回调函数的一个面向对象的替代品。   

JS 作为将函数作为一等对象的语言，跟策略模式一样，命令模式也早已融入到了 JS 语言之中。运算块不一定
要封装在 `command.execute` 方法中，也可以封装在普通函数中。函数作为一等对象，本身就可以四处
传递。即使我们依然需要请求“接收者”，那也未必适用面向对象的方式，闭包可以完成同样的功能。    

## 9.4 撤销命令

撤销操作的实现一般是给命令对象增加一个名为 unexecute 或者 undo 的方法，在该方法里执行 execute
的反向操作。在 command.execute 方法让小球开始真正运动之前，我们需要先记录下小球的当前位置，在
unexecute 或者 undo 操作中，再让小球回到刚刚记录下的位置。    

## 9.5 撤销和重做

然而，在某些情况下无法顺利地利用 undo 操作让对象回到 exectue 之前的状态，比如在一个 Canvas
画图程序中，画布上有一些点，我们在这些点之间画了 N 条曲线把这些点相互连接起来，当然这是用命令模式
来实现的。但是我们却很难为这里的命令对象定义一个擦除某条曲线的undo操作。    

这时最好的办法是先清除画布，然后把刚才执行过的命令全部重新执行一遍，这一点同样可以利用一个历史列表
栈办到。记录命令日志，然后重复执行它们，这是逆转不可逆命令的一个好办法。     

# 第 10 章 组合模式

略。    

# 第 11 章 模板方法模式

模板方法模式是一种只需使用继承就可以实现的非常简单的模式。    

模板方法模式由两部分结构组成，第一部分是抽象父类，第二部分是具体的实现子类。通常在抽象父类封装了
子类的算法框架，包括实现一些公共方法以及封装子类中所有方法的执行顺序。子类通过继承这个抽象类，也
继承了整个算法结构，并且可以选择重写父类的方法。    

## 11.1 第一个例子：Coffee or Tea

让我们忘记最开始创建的 Coffee 类和 Tea 类。现在可以创建一个抽象父类来表示泡一杯饮料的整个过程。
不论是 Coffee，还是 Tea，都被我们用 Beverage 来表示：    

```js
var Beverage = function () {};

Beverage.prototype.boilWater = function () {
  console.log('把水煮沸');
};

Beverage.prototype.brew = function () {};  // 空方法，应该由子类重写

Beverage.prototype.pourInCup = function () {};     // 空方法，应该由子类重写

Beverage.prototype.addCondiments = function() {};    // 空方法，应该由子类重写

Beverage.prototype.init = function () {
  this.boilWater();
  this.brew();
  this.pourInCup();
  this.addCondiments();
};
```    

### 11.1.1 创建 Coffee 子类和 Tea 子类

```js
var Coffee = function () {};

Coffee.prototype = new Beverage();

Coffee.prototype.brew = function () {
  console.log('用沸水冲泡咖啡');
};

Coffee.prototype.pourInCup = function () {
  console.log('把咖啡倒进杯子');
};

Coffee.prototype.addCondiments = function () {
  console.log('加糖和牛奶');
};

var coffee = new Coffee();
coffee = new Coffee();
```    

本章一直讨论的是模板方法模式，那么在上面的例子中，到底谁才是所谓的模板方法呢？答案是
`Beverage.prototype.init`。    

`Beverage.prototype.init` 被称为模板方法的原因是，该方法中封装了子类的算法框架，它作为一个算法
的模板，指导子类以何种顺序去执行哪些方法。在 `Beverage.prototype.init` 方法中，算法内的每一个
步骤都清楚地展示在我们眼前。    

## 11.2 抽象类

模板方法模式是一种严重依赖抽象类的设计模式。     

# 第 12 章 享元模式

略。   

# 第 13 章 职责链模式

略。   

# 第 14 章 中介者模式    

略。    

# 第 15 章 装饰者模式

装饰者模式可以动态地给某个对象添加一些额外的职责，而不会影响从这个类中派生的其他对象。    

在传统的面向对象语言中，给对象添加功能常常使用继承的方式，但是继承的方式并不灵活，还会带来许多问题：
一方面会导致超类和子类之间存在强耦合性，当超类改变时，子类也会随之改变；另一方面，继承这种功能
复用方式通常称为“白箱复用”，“白箱”是相对可见性而言的，在继承方式中，超类的内部细节是对子类可见的，
继承常常被认为破坏了封装性。    

装饰者模式能够在不改变对象自身的基础上，在程序运行期间给对象更轻便灵活的做法。    

首先要提出来的是，作为一门解释执行的语言，给 JS 中的对象动态添加或者改变职责是一件再简单不过的
事情。    

## 15.1 装饰者模式和代理模式

这两种模式都描述了怎样为对象提供一定程度上的简介引用，它们的实现部分都保留了对另外一个对象的引用，
并且向那个对象发送请求。    

代理模式和装饰者模式最重要的区别在于它们的意图和设计目的。代理模式的目的是，当直接访问本体不方便
或者不符合需要时，为这个本体提供一个替代者。本体定义了关键功能，而代理提供或拒绝对它的访问，或者
在访问本体之前做一些额外的事情。装饰者模式的作用就是为对象动态加入行为。换句话说，代理模式强调
一种关系，这种关系可以静态的表达，也就是说，这种关系在一开始就可以被确定。而装饰者模式用于一开始
不能确定对象的全部功能。代理模式通常只有一层代理-本体的引用，而装饰者模式经常会形成一条长长的
装饰链。    

# 第 16 章 状态模式

略。   

# 第 17 章 适配器模式

略。   


# Puppeteer

> 摘自 https://medium.com/swlh/an-introduction-to-web-scraping-with-puppeteer-3d35a51fdca0

Puppeteer 和爬虫能做什么：   

- 自动化测试
- 生成 PDF
- 截取快照
- 抓取数据并保存
- 自动化一些无聊的任务

## 准备工作

1. 安装 puppeteer `npm install puppeteer`    

安装过程中会安装 Chromium， 然后由于众所周知的原因，安装过程大概率会失败，一般会有以下的报错：   

```
ERROR: Failed to download Chromium r722234! Set "PUPPETEER_SKIP_CHROMIUM_DOWNLOAD" env variable to skip download.
```    

上面提示了设置 `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD` 变量来跳过 chromium 的安装，然后应该是
需要手动安装后再通过某种方式结合起来，但是这里我们使用第二种方法。    

还有一个变量是 `PUPPETEER_DOWNLOAD_HOST` 这个变量用来指定下载 Chromium 中的 URL 主机部分，
我们这里将它设置为 `https://npm.taobao.org/mirrors`，即    

```shell
export PUPPETEER_DOWNLOAD_HOST="https://npm.taobao.org/mirrors"
```    

然后再install 就可以了。    

2. 新建一个 index.js 文件，然后再建几个文件夹 `screenshots, pdfs, json`    

## 第一个例子

生成快照并生成一个PDF。    

```js
const puppeteer = require('puppeteer');

void (async () => {
    try {
        const browser = await puppeteer.launch();

        const page = await browser.newPage();

        await page.goto('https://baike.baidu.com');

        // 生成一个快照
        await page.screenshot({
            path: './screenshots/page1.png'
        });

        await page.pdf({
            path: './pdfs/page1.pdf'
        });

        await browser.close();
    } catch (error) {
        console.log(error);
    }
})();
```   

说实话没见过这种代码写法。   

void 是个运算符，计算后面表达式的值，然后返回 `undefined`。    

puppeteer 默认将页面的尺寸设置为了 800 * 600。   

然后，这节课就到此为止了。。。


# 2. 第二部分 官方文档

Puppeteer 是一个 Node 库，提供了一组 API 可以让我们通过 DevTool 协议控制 Chromium 或 Chrome。   

## 2.1 默认的运行时设置

1. 使用 Headless 模式

如果想要使用完整的 Chromium 启动，配置 `headless` 参数：   

```js
const browser = puppeteer.launch({headless: false});
```   

这个东西会弹出浏览器来打开页面，但是测试的时候生成pdf报了一个错误：   

```
Error: Protocol error (Page.printToPDF): PrintToPDF is not implemented
```    

然后看 issue 好像意思是只能在 headless 模式下生成 pdf。    

2. 运行一个特定版本的 Chromium    

默认情况下，puppeteer 会下载并使用一个特定版本的 Chromium，以便其 API 可以开箱即用。如果要
使用一个不同版本的 chrome 或 chromium 的话，将可执行文件路径传入创建 Browser 实例的函数：   

```js
const browser = await puppeteer.launch({
  executablePath: '/path/to/Chrome'
});
```     

同样可以配置 Puppeteer 使用 FF Nightly（实验性质的支持）。     

# API 文档

## Overview

![puppeteer-browser](https://raw.githubusercontent.com/temple-deng/markdown-images/master/puppeteer/puppeteer-browser.png)

+ `Puppeteer` 使用 DevTools Protocol 与 browser 进行通信
+ `Browser` 实例可以拥有多个 browser contexts
+ `BrowserContext` 实例定义了一次浏览会话，并且可以拥有多个 page
+ `Page` 至少包含一个 frame: main frame，当然页面中可能还有其他 iframe 或 frame 标签
创建的 frame。    
+ `Frame` 至少有一个执行上下文——默认的执行上下文，frame 的脚本会在这个上下文中执行
+ `Worker` 包含一个单独的上下文     

## Puppeteer vs puppeteer-core

从 1.7.0 开始每次发布都会发布两个包：   

- puppeteer
- puppeteer-core    

区别就是，puppeteer-core 不会下载 chromium，并且不会受 `PUPPETEER_*` 环境变量的影响。   

## 环境变量

Puppeteer 会使用一系列环境变量来辅助它的工作，如果在安装步骤中没有找到这些变量，那就会在 npm config
中搜索小写形式的变量。    

+ `HTTP_PROXY`, `HTTPS_PROXY`, `NO_PROXY` - 定义用来下载和运行 Chromium 的代理设置
+ `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD` - 安装步骤不要安装打包好的 Chromium
+ `PUPPETEER_DOWNLOAD_HOST` - 覆盖用来下载 Chromium 的 url 前缀
+ `PUPPETEER_CHROMIUM_REVISION` - 指定特定版本的 Chromium，这里并没有说明是下载这个版本，
还是说运行的时候用这个版本
+ `PUPPETEER_EXECUTABLE_PATH` - `puppeteer.launch` 使用的执行包路径
+ `PUPPETEER_PRODUCT` - 指定使用的浏览器，目前就支持 `chrome` 或 `firefox`    

## class: Puppeteer

命名空间：   

- `puppeteer.devices`
- `puppeteer.errors`
- `puppeteer.product`

方法：   

- `puppeteer.connect(options)`
- `puppeteer.createBrowserFetcher([options])`
- `puppeteer.defaultArgs([options])`
- `puppeteer.executablePath()`
- `puppeteer.launch([options])`    

#### devices

- return: `Object`    

```js
const puppeteer = require('puppeteer');
const iPhone = puppeteer.devices['iPhone 6'];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.emulate(iPhone);
  await page.goto('https://www.google.com');
  // other actions
  await browser.close();
});
```    

返回一个设备列表，供 `page.emulate(options)` 使用。    

#### errors

- return: `Object`

如果无法完成请求的话就会抛出错误。   

```js
try {
   await page.waitForSelector('.foo');
} catch (e) {
  if (e instanceof puppeteer.errors.TimeoutError) {
      // ...
  }
}
```    

#### product

- return: `string`    

由 `PUPPETEER_PRODUCT` 或 `puppeteer.launch([options])` 中的 `product` 选项设置的浏览器。   

#### connect(options)

将 puppeteer 与给定的 chromium 实例绑定。   

- options
  + `browserWSEndpoint`: `string` 要连接的浏览器 WS 终端
  + `browserURL`: `string` 要连接的浏览器 url, `http://${host}:${port}` 的形式
  + `ignoreHTTPSErrors`: `boolean` 导航过程中是否忽视 https 错误，默认 false
  + `defaultViewport`: `Object` 为每个页面设置一个一致的视口，默认 800*600，设置为 null
  会禁用掉默认设置
    - `width`
    - `height`
    - `deviceScaleFactor`: dpr
    - `isMobile`
    - `hasTouch` 是否支持 touch 事件，默认 false
    - `isLandscape` 是否横屏，默认 false
  + `slowMo`: 延迟 puppeteer 操作的时间
  + `transport` 实验性
- return `Promise<Browser>`     

#### createBrowserFetcher([options])

- `options`
  + `host` 用来下载的主机，默认 `https://storage.googleapis.com`
  + `path` 下载的路径，默认 `<root>/.local-chromium`, `<root>` 是 puppeteer 包目录
  + `platform` 可选的值有 `mac, win32, win64, linux`    
- return `<BroswerFetcher>`    

#### defaultArgs([options])

要启动的 Chromium 的默认 flags。   

- `options`
  + `headless`
  + `args`: `Array<string>` 传给 broswer 实例的额外的参数，具体就是一些 chromium 接受的命令行参数
  + `userDataDir`: User Data Directory
  + `devtools`: 每个 tab 是否自动打开 DevTools 面板，如果这个是 true，你们 headless 就是 false
- return `Array<string>`    

#### executablePath()

puppeteer 希望 chormium 被安装的位置

#### launch([options])

- `product`
- `ignoreHTTPSErrors`
- `headless`
- `executablePath`
- `slowMo`
- `defaultViewport`
- `args`
- `ignoreDefaultArgs`
- `handleSIGINT`: `bool` 收到信号时是否关闭浏览器进程
- `handleSIGTERM`
- `handleSIGHUP`
- `timeout`
- `dumpio` 是否将浏览器进程的标准输出和错误连接到 `process.stdout` 和 `process.stderr`
- `userDataDir`
- `env`: 浏览器可见的环境变量，默认是 `process.env`
- `devtools` 是否自动打开开发面板
- `pipe`: 通过管道而不是 ws 连接浏览器
- `extraPrefsFirefox`: 传递给 FF 的参数    
- return: `Promise<Browser>`     

## class: BrowserFetcher

下来和管理不同版本的 chromium。     

```js
const broswerFetcher = puppeteer.createBrowserFetcher();
const revisionInfo = await browserFetcher.download('533271');
const browser = await puppeteer.launch({executablePath: revisionInfo.executablePath});
```     

方法：   

- `canDownload(revision)`
- `download(revision[, progressCallback])`
- `localRevisions()`
- `platform()`
- `remove(revision)`
- `revisionInfo(revision)`

#### canDownload(revision)

- return `Promise<bool>`

发送一个 HEAD 请求看看版本能不能下载

#### download(revision[, progressCallback])

- `progressCallback(downloadedBytes, totalBytes)`
- return: `Promise<object>`

发送 get 请求下载

#### localRevisions()

- return `Promise<Array<string>>`

#### platform()

- return `string`

#### remove(revision)

- return `promise`   

如果没下载过会抛出异常。    

#### revisionInfo(revision)

- return `Object`
  + `revision`
  + `folderPath`: 文件夹的导出路径
  + `executablePath`: 可执行文件路径
  + `url`: 下载地址
  + `local`: 本地是否有对应可用的版本    

## class: Browser

继承自 `EventEmitter`。    

当 pup 连接到一个 Chromium 实例时会创建一个 Browser 实例，可以通过 `puppeteer.launch()`
或 `puppeteer.connect` 获取到。     

```js
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const browserWSEndpoint = browser.wsEndpoint();

  // 断开连接
  browser.disconnect();

  // 重连
  const browser2 = await puppeteer.connect({browserWSEndpoint});
  await browser2.close();
})();
```  

事件：   

- `disconnected`: 连接断开（chromium 关闭或崩溃，调用 `disconnect()` 方法）
- `targetchanged`: target url 变化时
- `targetcreated`: 创建 target 时，比如使用 `window.open`，`browser.newPage` 打开新页面
- `targetdestroyed`: 比如页面关闭时    

方法：   

- `browserContexts()`
- `close()`
- `createIncognitoBrowserContext()`
- `defaultBrowserContext()`
- `disconnect()`
- `isConnected()`
- `newPage()`
- `pages()`
- `process()`
- `target()`
- `targets()`
- `userAgent()`
- `version()`
- `waitForTarget(predicate[, options])`
- `wsEndpoint()`

看起来主要分了4种，上下文相关的，页面相关的，链接相关的，target 相关的。    

#### browserContexts()

- return `Array<BrowserContext>`    

返回所有打开的 context 组成的数组

#### close()

- return `<Promise>`     

关闭页面和浏览器。     

#### createIncognitoBrowserContext()

- return `Array<BrowserContext>`   

创建一个新的隐身模式的 context:   

```js
```