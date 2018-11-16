# Device 

<!-- TOC -->

- [Device](#device)
  - [User Location](#user-location)
    - [一种关于要求地理位置的可选替代方案](#一种关于要求地理位置的可选替代方案)
    - [在用户交互时请求权限](#在用户交互时请求权限)
  - [Fullscreen Experiences](#fullscreen-experiences)
    - [请求浏览器全屏](#请求浏览器全屏)
    - [Tips](#tips)
    - [从主屏启动全屏页面](#从主屏启动全屏页面)

<!-- /TOC -->

## User Location

Geolocation API 在 Chrome 50 以上的版本中，只有在 HTTPS 协议下可用。    

介于很多用户不愿意共享其位置，因此我们需要采取一种防御式的开发模式：   

1. 处理所有 geo API 可能抛出的错误
2. 明确我们对地理位置的要求
3. 提供一种回退方案    

### 一种关于要求地理位置的可选替代方案

使用第三方的提供的解决方案：去猜测用户当前的可能位置。这些解决方案通常会搜索用户的 IP 然后基于
RIPE 数据库返回其匹配的物理地址。这些地址通常不会很精确，甚至在使用 VPN 时还带有欺骗性质。    

### 在用户交互时请求权限

永远在用户交互时去请求权限，而不是在主页加载完成后立即请求。    

## Fullscreen Experiences

有很多方案可以实现 web app 的全屏：   

1. 作为对用户操作的响应，请求浏览器进入全屏
2. 安装 app 到设备主屏
3. 伪造一个：自动隐藏地址栏

### 请求浏览器全屏

iOS Safari 没有全屏 API，但是其他的大部分平台的浏览器支持。主要可能涉及到的 API 有：

+ `element.requestFullscreen()`: 当前在 Chrome, FF, IE 中需要添加前缀（然而测试时，在
Chrome 好像叫 `webkitRequestFullScreen()`
+ `document.exitFullscreen()`: 同样，也要前缀，FF 使用 `cancelFullScreen()`
+ `document.fullscreenElement`: 同样，前缀，返回处于全屏模式的元素，否则返回 null   

Mozilla 提供了一个脚本来切换全屏：   

```js
function toggleFullScreen() {
  var doc = window.document;
  var docEl = doc.documentElement;

  var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
  var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

  if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
    requestFullScreen.call(docEl);
  }
  else {
    cancelFullScreen.call(doc);
  }
}
```    

### Tips

通常来说，我们可能会让 body 元素进入全屏，但是如果在基于 Webkit 或 Blink 渲染引擎的浏览器中，
这样做会出现一种怪异的效果：body 会收缩至能包含所有内容的最小尺寸，为了修复这个问题，我们在
html 元素上进入全屏：   


`document.documentElement.requestFullscreen()`    

### 从主屏启动全屏页面

这里从主屏启动更像是系统提供的那种添加页面到桌面，而不是我们上一部分提到的安装的 web app。也就说
我们只有通过系统提供的功能将页面添加到主屏，而不是通过浏览器提供 install 功能，将 web app 安装
到设备。      

**iOS**     

`<meta name="apple-mobile-web-app-capable" content="yes">`    

上面提到了使用 `window.navigator.standalone` 只读属性可以检测我们现在 web 页面处在全屏
模式下。    

**Chrome for Android**     

`<meta name="mobile-web-app-capable" content="yes">`    

但是一种更好的方式是使用 web app manifest。    

```html
<link rel="manifest" href="/manifest.json">
```    

关于 manifest 的内容以后再说。   

Last Update: 2018.10.24   