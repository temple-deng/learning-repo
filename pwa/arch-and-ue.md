# Arch and UE

<!-- TOC -->

- [Arch and UE](#arch-and-ue)
  - [google 对一个 web 应用的要求](#google-对一个-web-应用的要求)
  - [App Shell](#app-shell)
  - [UE](#ue)
    - [动画](#动画)
    - [CSS 动画 vs JS 动画](#css-动画-vs-js-动画)
    - [Easing](#easing)
    - [响应式图片](#响应式图片)

<!-- /TOC -->

## google 对一个 web 应用的要求

+ Fast: 页面应该有平滑的动画及滚动。
  - 关键渲染路径
  - 渲染性能
+ Integrated: 应用应该像用户设备的一部分一样，而不是必须通过浏览器去访问
  - 安装到用户主屏
  - 使用 Payment Request 简化支付流程
+ Reliable: 即便在糟糕的网络环境下，仍然能提供可靠的功能
  - 使用离线技术改善可靠性
+ Engaging
  - 使用 Web Push & Notifications

## App Shell

app shell 可以理解为我们页面 UI 的一个骨架部分，但是一般不包含任何有效的数据，而只是提供给
用户一个页面的展示效果。因此应用的内容就可以分成两部分：静态的 UI 骨架部分，以及动态的数据部分。
静态的 UI 部分可以长缓存到用户设备。当然一些动态的数据也是可以被缓存的。    

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>App Shell</title>
  <link rel="manifest" href="/manifest.json">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" type="text/css" href="styles/inline.css">
</head>

<body>
  <header class="header">
    <h1 class="header__title">App Shell</h1>
  </header>

  <nav class="nav">
  ...
  </nav>

  <main class="main">
  ...
  </main>

  <div class="dialog-container">
  ...
  </div>

  <div class="loader">
    <!-- Show a spinner or placeholders for content -->
  </div>

  <script src="app.js" async></script>
  <script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }).catch(function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  }
  </script>
</body>
</html>
```    

app shell 缓存可以通过手动编写 sw，或者使用一个静态资源预缓存工具例如 [sw-precache](https://github.com/googlechrome/sw-precache)。    

手动编写 sw:   

```js
var cacheName = 'shell-content';
var filesToCache = [
  '/css/styles.css',
  '/js/scripts.js',
  '/images/logo.svg',

  '/offline.html',

  '/',
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});
```    

使用 sw-precache:   

```js
gulp.task('generate-service-worker', function(callback) {
  var path = require('path');
  var swPrecache = require('sw-precache');
  var rootDir = 'app';

  swPrecache.write(path.join(rootDir, 'service-worker.js'), {
    staticFileGlobs: [rootDir + '/**/*.{js,html,css,png,jpg,gif}'],
    stripPrefix: rootDir
  }, callback);
});
```    

## UE

### 动画

动画应该尽量是可交互的，避免那些可能会打断或者阻碍用户活动的动画。   

一些动画属性的代价是要比另一些更高昂的。   

### CSS 动画 vs JS 动画

+ 在简单的“一次性”转换中使用 CSS 动画，例如切换 UI 元素的状态
+ 在需要一些高级的效果例如抖动，中止，暂停，倒放或者降速时使用 JS 动画

```js
var box = document.querySelector('.box');
box.addEventListener('transitionend', onTransitionEnd, false);

function onTransitionEnd() {
  // Handle the transition finishing.
}
```    

### Easing

开始比较慢并逐渐加速的动画叫做 "ease in"，相反开始速度就很快，然后慢慢减速的动画叫做 "ease out"。
两者结合就是 "ease in out"。   

+ 线性动画会给人一种很不自然的感觉。应该尽量避免使用线性动画。
+ ease out 动画适合出现在那些和用户交互的地方，因为其快启动给人一种响应很快的感觉。
+ ease in 动画就像一个石头下落的过程。   

贝塞尔曲线接受 4 个值，或者说两对数字，每个指定了一个控制点的 X, Y 坐标。X 的值是从 0~1 的，
但是 Y 的值是可以超出 \[0,1] 的限制的。   

### 响应式图片

+ 图片使用相对尺寸以避免不经意间的溢出容器
+ 如果想要根据不同设备特性提供不同的图片使用 `picture` 元素
+ 使用 `srcset` 和 `x` 描述符来提示浏览器去选择最佳的图片    

`srcset` 可以让浏览器根据设备的特性选择最佳的图片，例如，在 2x 屏显示 2x 图片，也可能由于网络
环境受限仍然在 2x 设备上显示 1x 图片： `<img src="photo.png" srcset="photo@2x.png 2x" ...>`   

`srcset` 是一个逗号分隔的 image/condition 列表。虽然 condition 支持像素密度、宽度和高度。
但是目前只有像素密度是良好支持的。    

```html
<picture>
  <source media="(min-width: 800px)" srcset="head.jpg, head-2x.jpg 2x">
  <source media="(min-width: 450px)" srcset="head-small.jpg, head-small-2x.jpg 2x">
  <img src="head-fb.jpg" srcset="head-fb-2x.jpg 2x" alt="a head carved out of wood">
</picture>
```    

在上面的例子中，如果浏览器最少 800px 宽，那么 `head.jpg` 或者 `head-2x.jpg` 可能会被使用。
如果浏览器在 450px 到 800px 中间，那么 `head-small.jpg` 或者 `head-small-2x.jpg` 可能
会被使用，对于那些小于 450px 以及不支持 picture 的浏览器，使用 `img` 元素。    

由于图片最终的尺寸不知道（这里应该是指最终在屏幕上渲染出来的尺寸吧），有时很难去对图片资源指定
像素密度。    

因此这里就出现了第二种声明方式：    

```html
<img src="lighthouse-200.jpg" sizes="50vw"
     srcset="lighthouse-100.jpg 100w, lighthouse-200.jpg 200w,
             lighthouse-400.jpg 400w, lighthouse-800.jpg 800w,
             lighthouse-1000.jpg 1000w, lighthouse-1400.jpg 1400w,
             lighthouse-1800.jpg 1800w" alt="a lighthouse">
```     

假设图片的渲染大小是视口一半宽：    


浏览器宽度 | DPR | 使用的图片 | 有效分辨率
---------|----------|---------|---------
 400px | 1 | 200.png | 1x
 400px | 2 | 400.png | 2x
 320px | 2 | 400.png | 2.5x
 600px | 2 | 800.png | 2.67x
 640px | 3 | 1000.png | 3.125x
 1100px | 1 | 1400.png | 1.27x    

在很多情况下，可能图片的渲染尺寸根据不同的媒体查询尺寸是不一样的：   

```html
<img src="400.png" 
     sizes="(min-width: 600px) 25vw, (min-width: 500px) 50vw, 100vw"
     srcset="100.png 100w, 200.png 200w, 400.png 400w,
             800.png 800w, 1600.png 1600w, 2000.png 2000w" alt="an example image">
```    

`image-set()` 函数增强了 `background` 属性的能力：   

```css
background-image: image-set(
  url(icon1x.jpg) 1x,
  url(icon2x.jpg) 2x
);
```    

Last Update: 2018.10.24   