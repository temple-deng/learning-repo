# App Install Prompt

<!-- TOC -->

- [App Install Prompt](#app-install-prompt)
  - [Add to Home Screen](#add-to-home-screen)
    - [可安装的标准](#可安装的标准)
    - [展示安装到主屏的对话框](#展示安装到主屏的对话框)
    - [mini-infobar](#mini-infobar)
    - [检测是否成功安装](#检测是否成功安装)
    - [检测 app 是否是从用户主屏启动的](#检测-app-是否是从用户主屏启动的)
    - [测试](#测试)
  - [安装原生 app banner](#安装原生-app-banner)
  - [Icons & Browser Colors](#icons--browser-colors)
    - [提供更好的 icon](#提供更好的-icon)
    - [给浏览器元素上色](#给浏览器元素上色)

<!-- /TOC -->

## Add to Home Screen

Chrome 可以帮我们处理安装到主屏的大部分工作：   

+ 在移动设备上，Chrome 会生成一个 WebAPK，创建一份更加优秀的集成体验
+ 在桌面设备上，安装 app，并在一个 app window 中运行

这些技术看看后面会不会具体介绍。    

### 可安装的标准

为了让用户安装我们的 PWA，至少要满足下面条件：   

+ app 还没有被安装
+ 用户至少在页面交互时间超过 30s
+ 包含一份 web app manifest 文件，包含以下内容：
  - `short_name` 或者 `name`
  - `icons` 必须包含一个 192px 以及一个 512px 的 icon
  - `start_url`
  - `display` 必须是这几个值之一 `fullscreen, standalone, minimal-ui`
+ 使用 HTTPS 提供服务
+ 注册了一个 sw，并且提供了 `fetch` 的回调函数    

注意这是 Chrome 浏览器的标准，不同的浏览器有不同的要求，需要查询各自的文档。    

如果都满足这些条件，Chrome 会触发一个 `beforeinstallprompt` 事件用来通知用户安装 pwa。   

**Note:** 如果 app manifest 文件包含一个`related_applications`，并且 `prefer_related_applications`
为 `true`，那么会使用原生的 app 安装提示，这样的话应该是提示我们去安装原生的 app 而不是 web app 了。    


### 展示安装到主屏的对话框

为了展示添加到主屏的对话框，需要：   

1. 监听 `beforeinstallprompt` 事件
2. 使用一个按钮或者一个其他可以生成用户手势事件的元素通知用户将要安装 app
3. 在 `beforeinstallprompt` 事件中保存的事件 event 上调用 `prompt()` 展示提示框     

```js
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI notify the user they can add to home screen
  btnAdd.style.display = 'block';
});
```    

所以其实这个事件只是通知了我们，当前 app 可以在用户设备上，具体弹出对话框是在 `e.prompt` 方法上。
而上面的 btnAdd 按钮更可能只是页面上的一个普通按钮，如果可安装，按钮显示，然后用户可以在任何
他想要点击这个按钮的时候去操作。    

而且根据上面的意思，这个提示用户安装操作的元素必须能响应用户手势事件，推测下面的 `deferredPrompt.prompt()`
方法很可能只有在这些事件的回调中才会生效。抽时间可以实验一下。    

在调用了 `deferredPrompt.prompt()` 方法后，需要监听 `deferredPropmpt.userChoice` 属性
返回的 promise，这个 promise 返回一个带有 `outcome` 属性的对象。   

```js
btnAdd.addEventListener('click', (e) => {
  // 隐藏我们添加到主屏的交互按钮
  btnAdd.style.display = 'none';

  // 展示对话框
  deferredPrompt.prompt();

  // 等待用户对对话框的响应
  deferredPrompt.userChoice
    .then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accpeted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      deferredPrompt = null;
    })
});
```    

我们只能调用 `prompt()` 方法一次，一旦用户拒绝了，就必须等到下次页面导航时触发的另一个 `beforeinstallprompt`
事件。    


### mini-infobar

Chrome on Android 还提供了另外一个工具 mini-infobar，用来在不同的平台创建一致的体验，反正
应该就是下图的这个东西。    

![mini-infobar](https://raw.githubusercontent.com/temple-deng/markdown-images/master/pwa/mini-infobar.png)    

这个玩意是一个 Chrome UI 组件，因此其实是站点不可控的。一旦用户拒绝了，一般必须过去足够的时间
才会再次显示（目前是 3 个月）。这个东西会在满足 A2HS 标准时出现，无论我们是否在 `beforeinstallprompt`
事件中调用了 `e.preventDefault()` 方法。    

这个东西在桌面设备上不展示。    

### 检测是否成功安装

如果想要测试用户接受安装后 app 是否成功添加到用户主屏，监听 `appinstalled` 事件：   

```js
window.addEventListener('appinstalled', (evt) => {
  app.logEvent('a2hs', 'installed');
});
```    

这个 `app.logEvent` 是什么鬼？？？？     

### 检测 app 是否是从用户主屏启动的

`display-mode` 媒体查询可以让我们根据 app 启动的方式施加不同的样式。    

```css
@media all and (display-mode: standalone) {
  body {
    background-color: yellow;
  }
}
```    

也可以在 JS 中检测：   

```js
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('display-mode is standalone);
}
```    

如果是在 Safari 中，这样检测：   

```js
if (window.navigator.standalone === true) {
  console.log('display-mode is standalone');
}
```    

### 测试

在 Chrome 开发工具中可以手动触发 `beforeinstallprompt` 事件，如果不满足要求的话，会抛出
异常。    

**Caution:** Chrome 在移动设备和桌面设备上的安装流程是不同的，因此如果想要在移动设备上调试，
需要开启 remote debugging。    

1. 进入 **Application** 面板
2. 进入 **Manifest** tab 栏
3. 点击 **Add to home screen**    

## 安装原生 app banner

当满足以下条件时，Chrome 会自动弹出原生 app 安装对话框：   

+ web app 和 native app 都没有被安装
+ 满足用户交互要求（至少 30s）
+ web app manifest 包含以下内容：
  - `short_name`
  - `name`
  - `icons` 包含一个 192px 和一个 512 px 的icon
  - `prefer_related_applications` 为 `true`
  - `related_applications` 对象包含关于 app 的信息
+ 通过 HTTPS 提供服务

为了提示用户去安装 native app，需要在 app manifest 中添加以下的内容：   

```json
{
  "prefer_related_applications": true,
  "related_applications": [
    {
      "platform": "play",
      "id": "com.google.samples.apps.iosched"
    }
  ]
}
```   

`prefer_related_applications` 属性告诉浏览器去提示用户安装 native app 而不是 web app。   

`related_applcations` 是一个对象的数组，用来告诉浏览器 native app 的信息，每个对象至少要
包含 `platform` 和 `id` 属性。    

## Icons & Browser Colors

### 提供更好的 icon

当用户访问站点时，浏览器尝试从 HTML 中获取一个 icon。这个 icon 可能出现在很多地方，包括 tab 栏等。   

```html
<!-- 最高分辨率的 icon -->
<link rel="icon" sizes="192*192" href="icon.png">

<!-- 为 Safari 重用 icon -->
<link rel="apple-touch-icon" href="ios-icon.png">

<!-- 为 IE 提供的多个 icons -->
<meta name="msapplication-square310*310logo" content="icon_largetile.png">
```    

Chrome 和 Opera 会采用上面的第一个 link，在必要的时候会缩放 icon，如果不想让缩放的话，就在
`sizes` 属性中提供额外的尺寸，尽量是 48px 的倍数。   

Safari 采用的是第二个，为了阻止缩放要这样写：   

```html
<link rel="apple-touch-icon" href="touch-icon-iphone.png">
<link rel="apple-touch-icon" sizes="76x76" href="touch-icon-ipad.png">
<link rel="apple-touch-icon" sizes="120x120" href="touch-icon-iphone-retina.png">
<link rel="apple-touch-icon" sizes="152x152" href="touch-icon-ipad-retina.png">
```    

### 给浏览器元素上色

不同平台的不同浏览器几乎都支持让我们定义浏览器一些元素的颜色（这里的元素是指像浏览器地址栏这种
组件，不是 html 元素）。    

给 Chrome on Android 添加主题颜色：   

```html
<!-- Chrome, Firefox OS and Opera -->
<meta name="theme-color" content="#4285f4">
```    

Safari 允许我们定制状态栏和指定启动图片：   

默认情况下，Safari 在加载时显示白屏，以及一些 app 先前状态的快照。可以通过指定一张起始图片
明确禁止这种行为：   

```html
<link rel="apple-touch-startup-image" href="icon.png">
```    

可以通过设置状态栏的显示方式 `black`, `black-translucent`。在 `black-translucent` 设置
下，状态栏浮动在屏幕的上方，这就可以增加我们布局区域的高度：   

```html
<meta name="apple-mobile-web-app-status-bar-style" content="black">
```   

black-translucent:   

![black-translucent](https://raw.githubusercontent.com/temple-deng/markdown-images/master/pwa/black-translucent.png)   

black:   

![black](https://raw.githubusercontent.com/temple-deng/markdown-images/master/pwa/black.png)   

Last Update: 2018.10.24   