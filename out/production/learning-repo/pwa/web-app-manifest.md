# The Web App Manifest

<!-- TOC -->

- [The Web App Manifest](#the-web-app-manifest)
  - [创建一个 manifest](#创建一个-manifest)
  - [告诉浏览器 manifest 文件](#告诉浏览器-manifest-文件)
  - [关键的 manifest 属性](#关键的-manifest-属性)
    - [short_name/name](#short_namename)
    - [icons](#icons)
    - [start_url](#start_url)
    - [background_color](#background_color)
    - [display](#display)
  - [添加启动画面](#添加启动画面)
    - [设置一个标题和图片](#设置一个标题和图片)
    - [orientation](#orientation)
    - [scope](#scope)
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

首先尽量包括 192px 和 512px 大小的 icon，其他大小也尽量是 48dp 的倍数。    

### start_url

`start_url` 告诉浏览器 app 启动时候从哪个页面开始。   

`"start_url": "/utm_source=homescreen"`    

这个查询参数可以是任意值。    

### background_color

使用 `background_color` 属性来设置背景色。 Chrome 在网络应用启动后会立即使用此颜色，这一
颜色将保留在屏幕上，直至网络应用首次呈现为止。    

### display

可以设置 `display` 属性为 `standalone` 来隐藏浏览器的 UI。    


值 | 描述
----------|---------
 `fullscreen` | 全屏
 `standalone` | 像一个独立 app 一样打开。app 在自己的窗口中，与浏览器分类，隐藏了浏览器的 UI
 `minimal-ui` | 类似 `fullscreen` 但多了一些用来导航的 UI，Chrome 不支持
 `browser` | 浏览器体验打开

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

### orientation

`"orientation": "landscape"`   

### scope

`scope` 定义了 URLs 的集合，浏览器使用这个集合来决定当用户点击链接时，是在当前 app 打开还是
到浏览器中打开。    

`"scope": "/maps/"`   

+ 如果不指定 `scope`，默认就是 manifest 所在的目录，这里其实应该是 web 地址路径，而不是文件
系统的目录，毕竟浏览器怎么可能知道服务器的文件系统内容
+ `scope` 可以是相对路径
+ `start_url` 必须在范围内
+ `scope` 就是相对于 `start_url` 的

### theme_color

使用 `theme_color` 声明主题颜色。这个属性会设置工具栏的颜色。    

Last Update: 2018.10.24
