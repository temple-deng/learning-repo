# CSS 和网络性能

<!-- TOC -->

- [CSS 和网络性能](#css-和网络性能)
  - [问题](#问题)
  - [内联重要 CSS](#内联重要-css)
  - [区分不同的媒体类型](#区分不同的媒体类型)
  - [避免 @import 的使用](#避免-import-的使用)
  - [HTML 中使用 @import 的问题](#html-中使用-import-的问题)
    - [FF 和 IE/Edge：将 @import 放到 CSS 和 JS 前面](#ff-和-ieedge将-import-放到-css-和-js-前面)
    - [Blink 和 WebKit: 使用引号将 @import 中的 URL 裹起来](#blink-和-webkit-使用引号将-import-中的-url-裹起来)
  - [不要将 `<link rel="stylesheet" />` 放在任何异步代码前](#不要将-link-relstylesheet--放在任何异步代码前)
    - [将任意不依赖 CSSOM 的脚本放在 CSS 前](#将任意不依赖-cssom-的脚本放在-css-前)
  - [将 `<link rel="stylesheet" />` 放在 `<body>` 中](#将-link-relstylesheet--放在-body-中)

<!-- /TOC -->

浏览器在下载并解析完所有的 CSS 前是不会开始渲染页面的。    

## 问题

广泛地讲，下面是 CSS 为何对性能如此重要的原因：   

1. 浏览器在构建完渲染树前无法渲染页面
2. 渲染树是 DOM 和 CSSOM 结合的结果
3. 因此页面的渲染开始时间通常是由最慢的样式表决定的    

## 内联重要 CSS

如果可能的话，尽量将初始渲染需要的样式内联到 head 中的 style 标签中，然后将非重要的样式表
通过异步加载。    

## 区分不同的媒体类型

将主要的 CSS 文件划分到不同的媒体查询中：   

+ 浏览器会用一个高优先级下载所有满足当前查询条件的 CSS
+ 用低优先级下载不满足当前查询条件的 CSS

## 避免 @import 的使用

略。    

## HTML 中使用 @import 的问题

这一节主要讲述 WebKit 和 Blink 中预加载扫描器中的 bugs 以及 FF 和 IE/Edge 预加载扫描器
的低效。    

### FF 和 IE/Edge：将 @import 放到 CSS 和 JS 前面

在 FF 和 IE/Edge 中，预加载扫描器似乎不会找到那些在 `<script src"">` 或者
`<link rel="styleshee" />` 后面的 `@import`。    

这意味着：   

```html
<script src="app.js"></script>

<style>
  @import url(app.css);
</style>
```   

app.css 会在 JS 下载并执行完才能开始下载。下面的代码会出现同样的问题：   

```html
<link rel="stylesheet" href="style.css" />

<style>
  @import url(app.css);
</style>
```   

解决办法就是不用 @import 改用 link 咯。   

### Blink 和 WebKit: 使用引号将 @import 中的 URL 裹起来

如果我们在 Blink 和 WebKit 中使用 @import 时没有用引号将 url 裹起来，那它们会出现和
FF 一样的问题。   

## 不要将 `<link rel="stylesheet" />` 放在任何异步代码前

```html
<link rel="stylesheet" href="slow-loading-stylesheet.css" />
<script>
  console.log("I will not run until slow-loading-stylesheet.css is downloaded.");
</script>
```   

浏览器在下载完成 CSS 前是不会 **执行** 后面的 `<script>`。   

这个设计是符合常理的，如果当前有正在下载的 CSS，那么HTML 中所有同步的 `<script>` 都不会
执行。因为如果我们脚本里有获取样式信息的内容，那么它可能获取到不正确的信息。   

这也就意味着：   

```html
<link rel="stylesheet" href="app.css" />

<script>
  var script = document.createElement('script');
  script.src = "analytics.js";
  document.getElementsByTagName('head')[0].appendChild(script);
</script>
```    

异步加载的 JS 在 CSS 下载并解析完成前是不会开始下载。   

### 将任意不依赖 CSSOM 的脚本放在 CSS 前

因为 JS 的执行并不会影响预加载 CSS。    

## 将 `<link rel="stylesheet" />` 放在 `<body>` 中

在最新版的浏览器中，`<link rel="stylesheet" />` 只会阻塞后续内容的渲染，而不是整个页面
内容的渲染。   

Last Update: 2018.11.24
