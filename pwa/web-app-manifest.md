# The Web App Manifest

<!-- TOC -->

- [The Web App Manifest](#the-web-app-manifest)
  - [创建一个 manifest](#创建一个-manifest)
  - [告诉浏览器 manifest 文件](#告诉浏览器-manifest-文件)
  - [关键的 manifest 属性](#关键的-manifest-属性)
    - [short_name/name](#short_namename)
    - [icons](#icons)
  - [设置启动 URL](#设置启动-url)
  - [添加启动画面](#添加启动画面)
    - [设置一个标题和图片](#设置一个标题和图片)
    - [设置背景色](#设置背景色)
    - [设置主题颜色](#设置主题颜色)
  - [设置启动风格](#设置启动风格)
    - [定制展示类型](#定制展示类型)
    - [指定页面初始的方向](#指定页面初始的方向)
  - [提供全站主题颜色](#提供全站主题颜色)
  - [MDN 上的内容](#mdn-上的内容)
    - [各个属性值的介绍](#各个属性值的介绍)
      - [background_color](#background_color)
      - [description](#description)
      - [dir](#dir)
      - [display](#display)
      - [icons](#icons-1)
      - [lang](#lang)
      - [name](#name)
      - [orientation](#orientation)
      - [prefer\_related_applications](#prefer\_related_applications)
      - [related_applications](#related_applications)
      - [scope](#scope)
      - [short_name](#short_name)
      - [start_url](#start_url)
      - [theme_color](#theme_color)

<!-- /TOC -->

Web app manifest 只是一个简单的 JSON 文件来告诉浏览器关于我们 web app 的一些信息，以及
在 “安装” 这个 app 到用户设备时的一些行为。   

## 创建一个 manifest

一个 PWA 的 `manifest.json` 文件大致如下：  

```json
{
  "short_name": "Maps",
  "name": "Google Maps",
  "icons": [
    {
      "src": "/images/icons-192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "/images/icons-512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": "/maps/?source=pwa",
  "background_color": "#3367D6",
  "display": "standalone",
  "scope": "/maps/",
  "theme_color": "#3367D6"
}
```   

## 告诉浏览器 manifest 文件

当我们已经创建好 manifest 文件后，为我们 app 包含的所有页面添加一个 `link` 标签：    

`<link rel="manifest" href="/manifest.json">`    

## 关键的 manifest 属性

### short_name/name

至少要提供 `short_name` 或者 `name` 属性，如果两者都提供了，`short_name` 会用在用户
主屏，app launcher，以及其他空间受限的地方。`name` 通常用来 app 安装时候的对话框中。    

### icons

当用户将站点添加到主屏时，我们可以定义一个浏览器使用的 icons 的集合。   

```json
"icons": [{
    "src": "images/touch/icon-128x128.png",
    "type": "image/png",
    "sizes": "128x128"
  }, {
    "src": "images/touch/apple-touch-icon.png",
    "type": "image/png",
    "sizes": "152x152"
  }, {
    "src": "images/touch/ms-touch-icon-144x144-precomposed.png",
    "type": "image/png",
    "sizes": "144x144"
  }, {
    "src": "images/touch/chrome-touch-icon-192x192.png",
    "type": "image/png",
    "sizes": "192x192"
  }],
```    

注：将图标保存到主屏幕时，Chrome 首先寻找与显示密度匹配并且尺寸调整到 48dp 屏幕密度的图标。如果未找到任何图标，则会查找与设备特性匹配度最高的图标。无论出于任何原因，如果您想把目标明确锁定在具有特定像素密度的图标，可以使用带数字参数的可选 density 成员。如果您不声明密度，其默认值为 1.0。这意味着“可将该图标用于等于和大于 1.0 的屏幕密度”，而这通常就是您所需要的。     

## 设置启动 URL

如果我们没有提供 `start_url`，那么会使用当前页面。由于我们现在可以定义应用的启动方式，因此可向 `start_url` 添加一个查询字符串参数来说明其启动方式。    

`"start_url": "/utm_source=homescreen"`    

这个查询参数可以是任意值。    



## 添加启动画面

当我们从主屏上启动 app 的时候会在屏幕后发现下面的事情：   

1. 启动 Chrome
2. 显示页面的渲染器启动。
3. 从网络加载站点（或者有 service worker 的话从缓存中加载）    

执行以上操作时，屏幕显示为白色并且看似已经停滞。如果您从网络加载网页时页面需要花费不止一两秒的时间才能让首页显现任何内容，这种情况将变得尤为明显。     

为了提供更加的用户体验，可以使用一个标题，颜色和图片来替换这个白屏。    

### 设置一个标题和图片

如果您从未落下课程进度，您已应完成了图像和标题的设置。Chrome 会根据清单的特定成员推断图像和标题。    

启动画面图像提取自 icons 数组。Chrome 为设备选择最接近 128dp 的图像。标题是直接从 name 成员获取的。    

### 设置背景色

使用 `background_color` 属性来设置背景色。 Chrome 在网络应用启动后会立即使用此颜色，这一颜色将保留在屏幕上，直至网络应用首次呈现为止。    

### 设置主题颜色

使用 `theme_color` 声明主题颜色。这个属性会设置工具栏的颜色。    

## 设置启动风格

使用 manifest 可以控制显示的类型与页面的方向。    

### 定制展示类型

可以设置 `display` 属性为 `standalone` 来隐藏浏览器的 UI。    

![display](https://github.com/temple-deng/learning-repo/blob/master/pics/manifest-display-options.png)   

如果我们认为用户可能更喜欢在一个浏览器的界面中使用页面，则设置为 `browser`。    

### 指定页面初始的方向

您可以强制一个特定方向，这对于某些应用很有用，例如只能在一个方向上运行的游戏。 请有选择地使用。 用户更愿意能够自行选择方向。   

`"orientation": "landscape"`   

## 提供全站主题颜色

主题颜色是来自您的网页的提示，用于告知浏览器使用什么颜色来为地址栏等 UI 元素着色。    

## MDN 上的内容

一个例子：   

```json
{
  "name": "HackerWeb",
  "short_name": "HackerWeb",
  "start_url": ".",
  "display": "standalone",
  "background_color": "#fff",
  "description": "A simply readable Hacker News app.",
  "icons": [{
    "src": "images/touch/homescreen48.png",
    "sizes": "48x48",
    "type": "image/png"
  }, {
    "src": "images/touch/homescreen72.png",
    "sizes": "72x72",
    "type": "image/png"
  }, {
    "src": "images/touch/homescreen96.png",
    "sizes": "96x96",
    "type": "image/png"
  }, {
    "src": "images/touch/homescreen144.png",
    "sizes": "144x144",
    "type": "image/png"
  }, {
    "src": "images/touch/homescreen168.png",
    "sizes": "168x168",
    "type": "image/png"
  }, {
    "src": "images/touch/homescreen192.png",
    "sizes": "192x192",
    "type": "image/png"
  }],
  "related_applications": [{
    "platform": "web"
  }, {
    "platform": "play",
    "url": "https://play.google.com/store/apps/details?id=cheeaun.hackerweb"
  }]
}
```   

### 各个属性值的介绍

#### background_color

略。    

#### description

为应用的功能提供一个通用的解释。   

#### dir

指定 `name`, `short_name`, `description` 属性文本的方向。与 `lang` 属性一起搭配，可以正确的展示从右到左的语言。   

```json
"dir": "rtl",
"lang": "ar",
"short_name": "أنا من التطبيق!"
```   

可选值有 `ltr`, `rtl`, `auto`。   

#### display

定义开发者希望的应用的展示模式。   

可选值有：  

+ `fullscreen`
+ `standalone` 可能没有浏览器的 UI元素，但是有状态栏等元素
+ `minimal-ui`
+ `browser`     

#### icons

指定一个图片的数组。   

每个图片对象包含的属性如下：   

+ `sizes` 一个包含空格分隔的图片尺寸的字符串
+ `src` 图片的路径，如果是相对 URL，那么基础路径是 manifest 的路径
+ `type`   

#### lang

指定 `name` 和 `short_name` 的语种。    

#### name 

略。   

#### orientation

设置应用默认的方向。   

可选值如下：   

+ any
+ natual
+ landscape
+ landscape-primary
+ landscape-secondary
+ portrait
+ portrait-primary
+ portrait-secondary   

#### prefer\_related_applications  

一个布尔值。    

#### related_applications

指定一个 "application objects" 的数组，表示原生应用程序，这些应用程序可由底层平台安装或访问。相当于指定一些可以替换我们 web app 功能的一些原生应用的信息吧。   

```json
"related_applications": [
  {
    "platform": "play",
    "url": "https://play.google.com/store/apps/details?id=com.example.app1",
    "id": "com.example.app1"
  }, {
    "platform": "itunes",
    "url": "https://itunes.apple.com/app/example-app1/id123456789"
  }]
```    

#### scope

定义我们应用可以导航的范围。貌似如果导航到一个范围外的页面，就会返回一个常规的页面。    

如果是相对 URL，基础 URL 是 manifest 的路径。    

#### short_name  

略。    

#### start_url

指定当用户启动应用时加载的 URL。同理也可以是相对 manifest 的地址。   

#### theme_color  

略。       


