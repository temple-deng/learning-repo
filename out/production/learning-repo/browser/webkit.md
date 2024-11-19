# WebKit 技术内幕
<!-- TOC -->

- [WebKit 技术内幕](#webkit-技术内幕)
- [第 1 章 浏览器和浏览器内核](#第-1-章-浏览器和浏览器内核)
  - [1.1 浏览器](#11-浏览器)
    - [1.1.1 浏览器简介](#111-浏览器简介)
    - [1.1.2 浏览器特性](#112-浏览器特性)
    - [1.1.3 HTML](#113-html)
  - [1.2 浏览器内核及特性](#12-浏览器内核及特性)
    - [1.2.1 内核和主流内核](#121-内核和主流内核)
    - [1.2.2 内核特征](#122-内核特征)
- [第 2 章 HTML 网页和结构](#第-2-章-html-网页和结构)
  - [2.1 网页构成](#21-网页构成)
    - [2.1.1 基本元素和树状结构](#211-基本元素和树状结构)
  - [2.2 网页结构](#22-网页结构)
    - [2.2.1 框结构](#221-框结构)
    - [2.2.2 层次结构](#222-层次结构)
  - [2.3 WebKit 的网页渲染过程](#23-webkit-的网页渲染过程)
- [第 3 章 WebKit 架构和模块](#第-3-章-webkit-架构和模块)
  - [3.1 WebKit 架构及模块](#31-webkit-架构及模块)
    - [3.1.2 WebKit 架构](#312-webkit-架构)
    - [3.1.3 WebKit 源代码结构](#313-webkit-源代码结构)
  - [3.2 基于Blink的Chromium浏览器结构](#32-基于blink的chromium浏览器结构)
    - [3.2.1 Chromium浏览器的架构及模块](#321-chromium浏览器的架构及模块)
- [第 4 章 资源加载和网络栈](#第-4-章-资源加载和网络栈)
  - [4.1 WebKit 资源加载机制](#41-webkit-资源加载机制)
    - [4.1.1 资源](#411-资源)
    - [4.1.2 资源缓存](#412-资源缓存)
    - [4.1.3 资源加载器](#413-资源加载器)
    - [4.1.4 过程](#414-过程)
  - [4.2 Chromium 多进程资源加载](#42-chromium-多进程资源加载)
    - [4.2.1 多进程](#421-多进程)
  - [4.3 网络栈](#43-网络栈)
    - [4.3.1 WebKit 的网络设施](#431-webkit-的网络设施)
    - [4.3.2 Chromium 网络栈](#432-chromium-网络栈)
    - [4.3.3 磁盘本地缓存](#433-磁盘本地缓存)
    - [4.3.6 高性能网络栈](#436-高性能网络栈)
- [第 5 章 HTML 解释器和 DOM 模型](#第-5-章-html-解释器和-dom-模型)
  - [5.1 DOM 树](#51-dom-树)
  - [5.2 HTML 解释器](#52-html-解释器)
    - [5.2.1 解释过程](#521-解释过程)
    - [5.2.2 词法分析](#522-词法分析)
    - [5.2.3　XSSAuditor验证词语](#523　xssauditor验证词语)
    - [5.2.4 词语到节点](#524-词语到节点)
    - [5.2.5 节点到 DOM 树](#525-节点到-dom-树)
    - [5.2.8 JavaScript 的执行](#528-javascript-的执行)
  - [5.4 影子（Shadow）DOM](#54-影子shadowdom)
    - [5.4.1 什么是 Shadow DOM](#541-什么是-shadow-dom)
- [第 6 章 CSS 解释器和样式布局](#第-6-章-css-解释器和样式布局)
  - [6.2 CSS解释器和规则匹配](#62-css解释器和规则匹配)
    - [6.2.1 样式的 WebKit 表示类](#621-样式的-webkit-表示类)
    - [6.2.2 解释过程](#622-解释过程)
    - [6.2.3 样式规则匹配](#623-样式规则匹配)
  - [6.3 WebKit 布局](#63-webkit-布局)
    - [6.3.2 布局计算](#632-布局计算)
- [第 7 章 渲染基础](#第-7-章-渲染基础)
  - [7.1 RenderObject 树](#71-renderobject-树)
    - [7.1.1 RenderObject 基础类](#711-renderobject-基础类)
    - [7.1.2 RenderObject 树](#712-renderobject-树)
  - [7.2 网页层次和 RenderLayer 树](#72-网页层次和-renderlayer-树)
    - [7.2.1 层次和 RenderLayer 对象](#721-层次和-renderlayer-对象)
  - [7.3 渲染方式](#73-渲染方式)
  - [7.4 软件渲染过程](#74-软件渲染过程)
- [第 8 章 硬件加速机制](#第-8-章-硬件加速机制)
  - [8.1 硬件加速基础](#81-硬件加速基础)
    - [8.1.1 概念](#811-概念)
- [第 9 章 JavaScript 引擎](#第-9-章-javascript-引擎)
  - [9.1 JavaScript 引擎](#91-javascript-引擎)
    - [9.1.3　JavaScript引擎和渲染引擎](#913　javascript引擎和渲染引擎)
  - [9.2 V8 引擎](#92-v8-引擎)
    - [9.2.2 工作原理](#922-工作原理)

<!-- /TOC -->

# 第 1 章 浏览器和浏览器内核

## 1.1 浏览器

### 1.1.1 浏览器简介

在 FF 发布 1.0 版本的前一年，2003 年，苹果发布了 Safari 浏览器，并在2005 年释放了
浏览器中一种非常重要部件的源代码，发起了一个新的开源项目WebKit，它是Safari浏览器的内核。    

2008年，Google 公司以苹果开源项目 WebKit 作为内核，创建了一个新的项目Chromium，该项目
的目标是创建一个快速的、支持众多操作系统的浏览器，包括对桌面操作系统和移动操作系统的支持。    

在 Chromium 项目的基础上，Google 发布了自己的浏览器产品 Chrome。不同于 WebKit 之于
Safari 浏览器，Chromium 本身就是一个浏览器，而不是 Chrome 浏览器的内核，Chrome 浏览器
一般选择 Chromium 的稳定版本作为它的基础。Chromium 是开源试验场，它会尝试很多创新并且大
胆的技术，当这些技术稳定之后，Chrome 才会把它们集成进来，也就是说 Chrome 的版本会落后于
Chromium；其次，Chrome 还会加入一些私有的编码解码器以支持音视频等；再次，Chrome 还会整合
Google众多的网络服务；最后，Chrome还有自动更新的功能（虽然只是Windows平台），这也是
Chromium 所没有的。    

### 1.1.2 浏览器特性

大体上来讲，浏览器的这些功能包括网络、资源管理、网页浏览、多页面管理、插件和扩展、
书签管理、历史记录管理、设置管理、下载管理、账户和同步、安全机制、隐私管理、外观主题、开发
者工具等。    

+ 网络：它是第一步，浏览器通过网络模块来下载各种各样的资源。
+ 资源管理：从网络下载或者本地获取资源，并将它们管理起来，这需要高效的管理机制。例如如何
避免重复下载资源、缓存资源等，都是它们需要解决的问题。    
+ 多页面管理：很多浏览器支持多页面浏览，所以需要支持多个网页同时加载，这让浏览器变得更为复杂。
+ 插件和扩展：这是现代浏览器的一个重要特征，它们不仅能显示网页，而且能支持各种形式的插件和扩展。
+ 其他的略。   

### 1.1.3 HTML

HTML5包含了一系列的标准，一共包含了10个大的类别，它们分别是离线（offline）、存储（storage）、
连接（connectivity）、文件访问（file  access）、语义（semantics）、音频和视频
（audio/video）、3D和图形（3D/graphics）、展示（presentation）、性能（performance）
和其他（Nuts and bolts）。其中每个大的类别都是由众多技术或者是规范组成。   


类别 | 具体规范
----------|---------
 离线 | Application cache, Local storage, Indexed DB, 在线/离线事件
 存储 | Application cache, Local storage, Indexed DB 等
 连接 | Web Sockets, Server-sent 事件
 文件访问 | File API, File System, FileWriter, ProgressEvents
 语义 | 各种新的元素，包括 Media, structural, 国际化, Link relation 等
 音频和视频 | HTML5 Video, Web Audio, WebRTC, Vider track 等
 3D 和图形 | Canvas 2D, 3D CSS 变换, WebGL, SVG 等
 展示 | CSS 2D/3D 变换，过渡 transition, WebFonts 等
 性能 | Web Worker, HTTP caching 等
 其他 | 触控和鼠标, Shadow DOM, CSS masking 等     

## 1.2 浏览器内核及特性

### 1.2.1 内核和主流内核

在浏览器中，有一个最重要的模块，它主要的作用是将页面转变成可视化（准确讲还要加上可听化）
的图像结果，这就是浏览器内核。通常，它也被称为渲染引擎。所谓的渲染，就是根据描述或者定
义构建数学模型，通过模型生成图像的过程。    

目前，主流的渲染引擎包括 Trident、Gecko 和 WebKit，它们分别是IE、火狐和 Chrome 的内核，
2013年，Google宣布了 Blink 内核，它其实是从 WebKit 复制出去的。   

### 1.2.2 内核特征

根据渲染引擎所提供的渲染网页的功能，一般而言，它需要包含图中所描述的众多功能模块。图中
主要分成三层，最上层使用虚线框住的是渲染引擎所提供的功能。    

![kernel](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/kernel.jpg)   

从图中大致可以看出，一个渲染引擎主要包括HTML解释器、CSS解释器、布局和JavaScript引擎等:   

+ HTML 解释器：解释HTML文本的解释器，主要作用是将HTML文本解释成DOM（文档对象模型）树
+ CSS 解释器：级联样式表的解释器，它的作用是为 DOM 中的各个元素对象计算出样式信息，从而
为计算最后网页的布局提供基础设施
+ 布局：在 DOM 创建之后，Webkit 需要将其中的元素对象同样式信息结合起来，计算它们的大小
位置等布局信息，形成一个能够表示这所有信息的内部表示模型
+ JavaScript 引擎：使用 JavaScript 代码可以修改网页的内容，也能修改 CSS 的信息，
JavaScript引擎能够解释 JavaScript 代码并通过 DOM 接口和 CSSOM 接口来修改网页内容和样式信息，
从而改变渲染的结果
+ 绘图：使用图形库将布局计算后的各个网页的节点绘制成图像结果    

这些模块依赖很多其他的基础模块，这其中包括网络、存储、2D/3D图形、音频视频和图片解码器等。   

在了解了这些主要模块之后，下面介绍这些模块是如何一起工作以完成网页的渲染过程。一般的，
一个典型的渲染过程如图所示，这是渲染引擎的核心过程，一切都是围绕着它来的。    

![kernel-2](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/kernel-2.jpg)   

# 第 2 章 HTML 网页和结构

HTML 网页是利用 HTML 语言编写的文档，它是一种半结构化的数据表现方式。它的结构特征可以
归纳为三种：树状结构、层次结构和框结构。    

## 2.1 网页构成

### 2.1.1 基本元素和树状结构

整个网页可以看成一种树状结构，其树根是“html”，这是网页的根元素（或称节点）。   

## 2.2 网页结构

### 2.2.1 框结构

框结构很早就被引入网页中，它可以用来对网页的布局进行分割，将网页分成几个框。同时，网页
开发者也可以让网页嵌入其他的网页。在HTML的语法中，“frameset”、“frame”和“iframe”可以用来在
当前网页中嵌入新的框结构。   

注意这里框结构指的是嵌套的网页都是在一个独自的框中。    

### 2.2.2 层次结构

网页的层次结构是指网页中的元素可能分布在不同的层次中，就是说某些元素可能不同于它的父元素
所在的层次，因为某些原因，WebKit 需要为该元素和它的子女建立一个新层。    

```html
<!-- 示例代码，不确定能运行 -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
  <style>
    video, div, canvas {
      transform: rotateY(30deg) rotateX(-45deg);
    }
  </style>
</head>
<body>
  <video src="avideo.mp4"></video>
  <div>
    <canvas id="a2d"></canvas>
    <canvas id="a3d"></canvas>
  </div>
  <script>
    var size = 300;

    var a2dCtx = document.getElementById('a2d').getContext('2d');
    a2dCtx.canvas.width = size;
    a2dCtx.canvas.height = size;
    a2dCtx.fillStyle = "rgba(0, 192, 192, 80)";
    a2dCtx.fillRect(0, 0, 200, 200);

    var a3dCtx = document.getElementById('a3d').getContext('webgl');
    a3dCtx.canvas.width = size;
    a3dCtx.canvas.height = size;
    a3dCtx.clearColor(0.0, 192/255, 192/255, 80);
    a3dCtx.clear(a3dCtx.COLOR_BUFFER_BIT);
  </script>
</body>
</html>
```     

下图就是上面代码对应的网页层次结构：    

![html-layer](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/html-layer.png)   

当一个网页构建层次结构的时候，首先是根节点，此时自然地为它创建一个层，这就是“根层”。    

其次是“层1”，它是为元素“video”所创建的层。那为什么“video”元素需要新创建一个层，而不是
使用它的父亲所在的层呢？这是因为“video”元素用来播放视频，为它创建一个新的层可
以更有效地处理视频解码器和浏览器之间的交互和渲染问题。    

“层2” 对应着 div 元素。div 元素要进行 3D 变换，所以也有独自的层。   

“层3” 和 “层4” 对应着两个 canvas 元素，对应着复杂的 2D 和 3D 绘图操作。   

## 2.3 WebKit 的网页渲染过程

根据数据的流向，这里将渲染过程分成三个阶段，第一个阶段是从网页的 URL 到构建完 DOM 树，
第二个阶段是从 DOM 树到构建完 WebKit 的绘图上下文，第三个阶段是从绘图上下文到生成最终的图
像。    

![render-process](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/render-process.png)    

数字表示的是基本顺序，当然也不是严格一致，因为这个过程可能重复并且可能交叉。具体的过程如下：   

1. 当用户输入网页 URL 的时候，WebKit 调用其资源加载器加载该 URL 对应的网页。
2. 加载器依赖网络模块建立连接，发送请求并接收答复。
3. WebKit 接收到各种网页或者资源的数据，其中某些资源可能是同步或异步获取的。
4. 网页被交给 HTML 解释器转变成一系列的词语（Token）。
5. 解释器根据词语构建节点（Node），形成DOM树。
6. 如果节点是 JavaScript 代码的话，调用 JavaScript 引擎解释并执行。
7. JavaScript 代码可能会修改 DOM 树的结构。
8. 如果节点需要依赖其他资源，例如图片、CSS、视频等，调用资源加载器来加载它们，但是它们
是异步的，不会阻碍当前 DOM 树的继续创建；如果是 JavaScript 资源 URL（没有标记异步方
式），则需要停止当前 DOM 树的创建，直到 JavaScript 的资源加载并被 JavaScript 引擎执行
后才继续 DOM 树的创建。    

接下来就是 WebKit 利用 CSS 和 DOM 树构建 RenderObject 树直到绘图上下文，如图所示的过程。    

![render-process-2](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/render-process-2.png)    

这一阶段的具体过程如下：   

1. CSS 文件被 CSS 解释器解释成内部表示结构。
2. CSS 解释器工作完之后，在 DOM 树上附加解释后的样式信息，这就是 RenderObject 树。
3. RenderObject 节点在创建的同时，WebKit 会根据网页的层次结构创建 RenderLayer 树，
同时构建一个虚拟的绘图上下文。其实这中间还有复杂的内部过程，具体在后面专门的章节做详细介绍    

RenderObject 树的建立并不表示 DOM树 会被销毁，事实上，上述图中的四个内部表示结构一直存在，
直到网页被销毁，因为它们对于网页的渲染起了非常大的作用。    

最后就是根据绘图上下文来生成最终的图像，这一过程主要依赖 2D 和 3D 图形库：   

![render-process-3](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/render-process-3.png)    

这一阶段对应的具体过程如下：   

1. 绘图上下文是一个与平台无关的抽象类，它将每个绘图操作桥接到不同的具体实现类，也就是
绘图具体实现类。
2. 绘图实现类也可能有简单的实现，也可能有复杂的实现。在 Chromium 中，它的实现相当复杂，
需要 Chromium 的合成器来完成复杂的多进程和GPU加速机制，这在后面会涉及。
3. 绘图实现类将 2D 图形库或者 3D 图形库绘制的结果保存下来，交给浏览器来同浏览器界面一起显示。    

# 第 3 章 WebKit 架构和模块

## 3.1 WebKit 架构及模块

### 3.1.2 WebKit 架构

WebKit 的一个显著特征就是它支持不同的浏览器，因为不同浏览器的需求不同，所以在 WebKit 中，
一些代码可以共享，但是另外一部分是不同的，这些不同的部分称为 WebKit 的移植（Ports）。今
后笔者也用WebKit的移植指代该移植和依赖的WebKit的共享部分。     

![webkit-arc](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/webkit-arc.png)    

图中的WebKit架构，虚线框表示该部分模块在不同浏览器使用的WebKit内核中的实现是不一样的，
也就是它们不是普遍共享的。用实线框标记的模块表示它们基本上是共享的。    

JavaScriptCore 引擎是 WebKit 中的默认 JavaScript 引擎，也就是说一些 WebKit 的移植
使用该引擎。刚开始，它的性能不是很好，但是随着越来越多的优化被加入，现在的性能已变得非常
不错。之所以说它只是默认的，是因为它不是唯一并且是可替换的。事实上， WebKit 中对
JavaScript 引擎的调用是独立于引擎的。在 Google 的 Chromium 开源项目中，它被替换为 V8 引擎。    

在 WebCore 和 WebKit Ports 之上的层主要是提供嵌入式编程接口，这些嵌入式接口是提供给
浏览器调用的（当然也可以有其他使用者）。图中有左右两个部分分别是狭义 WebKit 的接口和
WebKit2 的接口。因为接口与具体的移植有关，所以有一个与浏览器相关的绑定层。绑定层上面
就是 WebKit 项目对外暴露的接口层。实际上接口层的定义也是与移植密切相关的，而不是 WebKit
有什么统一接口。    

### 3.1.3 WebKit 源代码结构

图显示的是主要的目录结构，包括一级目录和主要的二级目录，其中省去了一些次要目录。   

![source-code-dir](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/source-code-dir.png)    

![source-code-dir-2](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/source-code-dir-2.png)    

## 3.2 基于Blink的Chromium浏览器结构

### 3.2.1 Chromium浏览器的架构及模块

首先要熟悉的是 Chromium 的架构及其包含的模块。图中描述了 Chromium 的架构和主要的模块。
从图中可以看到，Blink 只是其中的一块，和它并列的还有众多的 Chromium 模块，包括
GPU/CommandBuffer（硬件加速架构）、V8 JavaScript引擎、沙箱模型、CC（Chromium Compositor）、
IPC、UI等（还有很多并没有在图中显示出来）。    

![chromium](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/chromium.png)    

在上面这些模块之上的就是著名的“Content模块”和“Content API（接口）”，它们是 Chromium
对渲染网页功能的抽象。“Content”的本意是指网页的内容，这里是指用来渲染网页内容的
模块。说到这里，读者可能有疑问了，WebKit不就是渲染网页内容的吗？是的，说的没错，没有Content
模块，浏览器的开发者也可以在 WebKit 的 Chromium 移植上渲染网页内容，但是却没有办法获得沙
箱模型、跨进程的GPU硬件加速机制、众多的HTML5功能，因为这些功能很多是在 Content 层里实现的。    

“Content模块”和“Content API”将下面的渲染机制、安全机制和插件机制等隐藏起来，提供一个
接口层。该接口目前被上层模块或者其他项目使用，内部调用者包括 Chromium 浏览器、Content
Shell等，外部包括CEF（Chromium Embedded Framework）、Opera浏览器等。    

多进程模型在不可避免地带来一些问题和复杂性的同时，也带来了更多的优势，而且这些优势非常的重要。
该模型至少带来三点好处：   

+ 一是避免因单个页面的不响应或者崩溃而影响整个浏览器的稳定性，特别是对用户界面的影响；
+ 二是，当第三方插件崩溃时不会影响页面或者浏览器的稳定性，这是因为第三方插件也被使用单独的
进程来运行；
+ 三是，它方便了安全模型的实施，也就是说沙箱模型是基于多进程架构的。    

![chromium-multi-process](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/chromium-multi-process.png)    

图中方框代表进程，连接线代表IPC进程间通信。这些连接线其实是很讲究的，它表示进程存在
进程间通信，如果没有，表明两种不同类型的进程之间没有通信。    

Chromium浏览器主要包括以下进程类型：   

+ **Browser 进程**：浏览器的主进程，负责浏览器界面的显示、各个页面的管理，是所有其他
类型进程的祖先，负责它们的创建和销毁等工作，它有且仅有一个
+ **Renderer 进程**：网页的渲染进程，负责页面的渲染工作，Blink/WebKit的渲染工作主要在
这个进程中完成，可能有多个，但是 Renderer 进程的数量是否同用户打开的网页数量一致呢？
答案是不一定。Chromium设计了灵活的机制，允许用户配置
+ **NPAPI 插件进程**：该进程是为 NPAPI 类型的插件而创建的。其创建的基本原则是每种类型的
插件只会被创建一次，而且仅当使用时才被创建。当有多个网页需要使用同一种类型的插件的时候，
例如很多网页需要使用Flash插件，Flash插件的进程会为每个使用者创建一个实例，所以插件进程是被共享的
+ **GPU 进程**：最多只有一个，当且仅当GPU硬件加速打开的时候才会被创建，主要用于对3D
图形加速调用的实现。
+ **Pepper 插件进程**：同NPAPI插件进程，不同的是为Pepper插件而创建的进程。
+ **其他类型的进程**。     

通过上面的讨论，对于桌面系统（Windows、Linux、Mac OS）中的Chromium浏览器，它们的进程
模型总结后包括以下一些特征：   

1. Browser 进程和页面的渲染是分开的，这保证了页面的渲染导致的崩溃不会导致浏览器主界面的崩溃。
2. 每个网页是独立的进程，这保证了页面之间相互不影响。
3. 插件进程也是独立的，插件本身的问题不会影响浏览器主界面和网页。
4. GPU硬件加速进程也是独立的。    

上面说到Chromium允许用户配置Renderer进程被创建的方式，下面简单地介绍一下模型的类型：    

+ Process-per-site-instance：该类型的含义是为每一个页面都创建一个独立的Render进程，
不管这些页面是否来自于同一域。举个例子来讲，例如，用户访问了 milado_nju 的CSDN博客（我的博客），
然后从个人主页打开多篇文章时，每篇文章的页面都是该域的一个实例，因而它们都有各自不同的渲染进程。
如果新打开CSDN博客的主页，那么就是另一个实例，会重新创建进程来渲染它。这带来的好处是每个
页面互不影响，坏处自然是资源的巨大浪费。
+ Process-per-site：该类型的含义是属于同一个域的页面共享同一个进程，而不同属一个域的页面
则分属不同的进程。好处是对于相同的域，进程可以共享，内存消耗相对较小，坏处是可能会有特别
大的Renderer进程。读者可以在命令行加入参数--process-per-site进行尝试。
+ Process-per-tab：该类型的含义是，Chromium为每个标签页都创建一个独立的进程，而不管
它们是否是不同域不同实例，这也是Chromium的默认行为，虽然会浪费资源。
+ Single process：该类型的含义是，Chromium不为页面创建任何独立的进程，所有渲染工作都在
Browser进程中进行，它们是Browser进程中的多个线程。但是这个类型在桌面系统上只是实验性质并且不是很稳定。    

因为 Browser 进程和 Renderer 进程都是在 WebKit 的接口之外由 Chromium 引入的，所以这里
有必要介绍一下它们是如何利用 WebKit 渲染网页的，这其中的代码层次由下图给出。    

![browser-renderer-webkit](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/browser-renderer-webkit.png)    

图3-7展示了主要进程中的重要线程信息及它们之间是如何工作的。事实上，进程中的线程远远不止
这些，这里只是列举了其中两个重要的线程。    

![chromium-multi-thread](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/chromium-multi-thread.png)    

那么，网页的加载和渲染过程在图中模型下的基本工作方式如以下步骤:   

1. Browser 进程收到用户的请求，首先由UI线程处理，而且将相应的任务转给 IO 线程，它随即
将该任务传递给 Renderer 进程。
2. Renderer 进程的 IO 线程经过简单解释后交给渲染线程。渲染线程接受请求，加载网页并渲染网页，
这其中可能需要 Browser 进程获取资源和需要 GPU 进程来帮助渲染。最后 Renderer 进程将结果
由IO线程传递给 Browser 进程。
3. 最后，Browser 进程接收到结果并将结果绘制出来。    

# 第 4 章 资源加载和网络栈

## 4.1 WebKit 资源加载机制

### 4.1.1 资源

HTML支持的资源主要包括以下类型：    

+ **HTML**
+ **JavaScript**
+ **CSS 样式表**
+ **图片**
+ **SVG**
+ **CSS Shader**：支持CSS Shader文件，目前WebKit支持该功能
+ **视频、音频和字幕**：多媒体资源及支持音视频的字幕文件（TextTrack）
+ **字体文件**：CSS 支持自定义字体，CSS3 引入的自定义字体文件
+ **XSL 样式表**：使用 XSLT 语言编写的 XSLT 代码文件     

上面这些资源在 WebKit 中均有不同的类来表示它们，它们的公共基类是 CachedResource。

### 4.1.2 资源缓存

资源的缓存机制是提高资源使用效率的有效方法。它的基本思想是建立一个资源的缓存池，当WebKit
需要请求资源的时候，先从资源池中查找是否存在相应的资源。如果有，WebKit 则取出以便使用；
如果没有，WebKit 创建一个新的 CachedResource 子类的对象，并发送真正的请求给服务器，
WebKit 收到资源后将其设置到该资源类的对象中去，以便于缓存后下次使用。这里的缓存指的是内存缓存，
而不同于后面在网络栈部分的磁盘缓存。    

### 4.1.3 资源加载器

按照加载器的类型来分，WebKit总共有三种类型的加载器：   

+ 第一种，针对每种资源类型的特定加载器，其特点是仅加载某一种资源。例如对于“image”这个
HTML 元素，该元素需要图片资源，对应的特定资源加载器是 ImageLoader 类。对于CSS自定义字体，
它的特定资源加载器是 FontLoader 类。这些资源加载器没有公共基类，其作用就是当需要请求资源时，
由资源加载器负责加载并隐藏背后复杂的逻辑。加载器属于它的调用者
+ 第二种，资源缓存机制的资源加载器的特点是所有特定加载器都共享它来查找并插入缓存资源——
CachedResourceLoader 类。特定加载器先是通过缓存机制的资源加载器来查找是否有缓存资源，
它属于HTML的文档对象     

![cache-resource-loader](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/cache-resource-loader.png)    

+ 第三种，通用的资源加载器——ResourceLoader 类，是在 WebKit 需要从网络或者文件系统获取
资源的时候使用该类只负责获得资源的数据，因此被所有特定资源加载器所共享。它属于 CachedResource 类，
但它同 CachedResourceLoader 类没有继承关系（这点容易混淆），如图所示    

![cache-resource](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/cache-resource.png)    


### 4.1.4 过程

假设现有一个“img”元素，其属性“src”的值是一个有效的URL地址，那么当HTML解析器解析到该元素
的该属性时，WebKit 会创建一个 ImageLoader 对象来加载该资源，ImageLoader 对象通过图所示
的过程创建一个加载资源的请求。     

![resource-loader](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/resource-loader.png)    

鉴于从网络获取资源是一个非常耗时的过程，通常一些资源的加载是异步执行的，也就是说资源的
获取和加载不会阻碍当前 WebKit 的渲染过程，例如图片、CSS文件。当然，网页也存在某些特别的
资源会阻碍主线程的渲染过程，例如JavaScript代码文件。这会严重影响WebKit下载资源的效率，
因为后面可能还有许多需要下载的资源，WebKit怎么做呢？    

因为主线程被阻碍了，后面的解析工作没有办法继续往下进行，所以对于HTML网页中后面使用的资源
也没有办法知道并发送下载请求。当遇到这种情况的时候，WebKit的做法是这样的：当前的主线程
被阻碍时，WebKit 会启动另外一个线程去遍历后面的 HTML 网页，收集需要的资源URL，然后发送请求，
这样就可以避免被阻碍。与此同时，WebKit能够并发下载这些资源，甚至并发下载JavaScript
代码资源。这种机制对于网页的加载提速很是明显。    

## 4.2 Chromium 多进程资源加载

### 4.2.1 多进程

资源的实际加载在各个WebKit移植中有不同的实现。Chromium采用的是多进程的资源加载机制。    

![chromium-multi-process-load](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/chromium-multi-process-load.png)    

Renderer 进程在网页的加载过程中需要获取资源，但是由于安全性（实际上，当沙箱模型打开的时候，
Renderer进程是没有权限去获取资源的）和效率上（资源共享等问题）的考虑，Renderer 进程的
资源获取实际上是通过进程间通信将任务交给 Browser 进程来完成，Browser 进程有权限从网络
或者本地获取资源。     

在 Chromium 架构的 Renderer 进程中，ResourceHandleInternal 类通过 IPCResourceLoaderBridge
类同 Browser 进程通信。IPCResourceLoaderBridge 类继承自 ResourceLoaderBridge 类，
其作用是负责发起请求的对象和回复结果的解释工作，实际消息的接收和派发交给
ResourceDispatcher 类来处理。    

在 Browser 进程中，首先由 ResourceMessageFilter 类来过滤 Renderer 进程的消息，如果
与资源请求相关，则该过滤类转发请求给 ResourceDispatcherHostImpl 类，随即ResourceDispatcherHostImpl
类创建 Browser 进程中的 ResourceLoader 对象来处理。ResourceLoader 类是 Chromium
浏览器实际的资源加载类，它负责管理向网络发起的请求、从网络接收过来的认证请求、请求的回复
管理等工作。因为这其中每项都有专门的类来负责，但都是由 ResourceLoader 类统一管理。从网络
或者本地文件读取信息的是 URLRequest 类，实际上它承担了建立网络连接、发送请求数据和接受
回复数据的任务，URLRequest之后的工作将在“网络栈”章节中来解读。    

也就是说整个图从下往上看。    

## 4.3 网络栈

### 4.3.1 WebKit 的网络设施

WebKit的资源加载其实是交由各个移植来实现的，所以WebCore其实并没有什么特别的基础设施，
每个移植的网络实现是非常不一样的。    

### 4.3.2 Chromium 网络栈

前面讲到资源加载，描述到URLRequest类的时候戛然而止，这是因为URLRequest类之下的部分是
网络栈的内容。    

![chromium-network-stack](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/chromium-network-stack.png)    

下面进行Chromium的网络栈调用过程剖析。读者可以先查看一下“net”目录下的子目录，大致了解
主要的子模块。图4-14描述了从 URLRequest 类到 Socket 类之间的调用过程。以HTTP协议为例，
图中列出建立TCP的socket连接过程中涉及的类。     

![url-request](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/url-request.png)    

### 4.3.3 磁盘本地缓存

在理解内部结构之前，首先来看一看这一机制对外的接口设计，主要有两个类：Backend 和 Entry。
Backend 类表示整个磁盘缓存，是所有针对磁盘缓存操作的主入口，表示的是一个缓存表。Entry
类指的是表中的表项。缓存通常是一个表，对于整个表的操作作用在 Backend 类上，包括创建表中
的一个个项，每个项由关键字来唯一确定，这个关键字就是资源的 URL。而对项目内的操作，包括
读写等都是由 Entry 类来处理。    

下面介绍表和表项是如何被组织和存储在磁盘上的。在磁盘上，Chromium 至少需要一个索引文件和
四个数据文件。索引文件用来检索存放在数据文件中的众多索引项，用来索引表项。数据文件又称
块文件，里面包含很多特定大小（例如256字节或者1k字节）的块，用于快速检索，这些数据块的内容
是表项，包括HTTP文件头、请求数据和资源数据等，数据文件名形如“data_1”、“data_2”等。    

### 4.3.6 高性能网络栈

**DNS 预取和 TCP 预连接**    

DNS预取技术。它的主要思想是利用现有的DNS机制，提前解析网页中可能的网络连接。具体来讲，
当用户正在浏览当前网页的时候，Chromium 提取网页中的超链接，将域名抽取出来，利用比较少的
CPU和网络带宽来解析这些域名或IP地址，这样一来，用户根本感觉不到这一过程。当用户单击这些
链接的时候，可以节省不少时间，特别在域名解析比较慢的时候，效果特别明显。    

网页的开发者可以显示指定预取哪些域名来让Chromium解析，这非常直截了当，特别对于那些需要
重定向的域名，具体做法如下所示：&lt;link rel="dns-prefetch"href="http://this-is-a-dns-prefetch-example.com"&gt;    

# 第 5 章 HTML 解释器和 DOM 模型

## 5.1 DOM 树

**结构模型**    

DOM结构构成的基本要素是“节点”，而文档的DOM结构就是由层次化的节点组成。在DOM模型中，节点
的概念很宽泛，整个文档（Document）就是一个节点，称为文档节点。HTML中的标记（Tag）也是
一种节点，称为元素（Element）节点。还有一些其他类型的节点，例如属性节点（标记的属性）、
Entity节点、ProcessingIntruction节点、CDataSection节点、注释（Comment）节点等。    

因为我们重点关注的是HTML文档，所以图5-3描述了HTML文档的接口定义。它继承自“文档”接口，
同时又有些自己的扩展，包括新的属性和接口，这些都跟HTML文档的具体应用相关。    

![html-document-idl](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/html-document-idl.png)    

## 5.2 HTML 解释器

### 5.2.1 解释过程

HTML解释器的工作就是将网络或者本地磁盘获取的HTML网页和资源从字节流解释成 DOM 树结构。
这一过程大致可以理解成图5-5所述的步骤:   

![bytes-stream-to-dom-tree](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/bytes-stream-to-dom-tree.png)    

首先是字节流，经过解码之后是字符流，然后通过词法分析器会被解释成词语（Tokens），之后经过
语法分析器构建成节点，最后这些节点被组建成一棵DOM树。    

![construct-dom-base-class](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/construct-dom-base-class.png)    

先看 FrameLoader 类，它是框中内容的加载器，类似于资源和资源的加载器。因为 Frame 对象中
包含 Document 对象，所以 WebKit 同样需要 DocumentLoader 类帮助加载 HTML 文档并从字节
流到构建的 DOM 树。DocumentWriter 类是一个辅助类，它会创建 DOM 树的根节点HTMLDocument
对象，同时该类包括两个成员变量，一个是用于文档的字符解码的类，另外一个就是HTML解释器
HTMLDocumentParser 类。     

HTMLDocumentParser 类是一个管理类，包括了用于各种工作的其他类，例如字符串到词语需要用到
词法分析器HTMLTokenizer类。该管理类读入字符串，输出一个个词语。这些词语经过XSSAuditor 
做完安全检查之后，就会输出到 HTMLTreeBuilder 类。     

HTMLTreeBuilder 类负责DOM树的建立，它本身能够通过词语创建一个个的节点对象。然后，借由
HTMLConstructionSite 类来将这些节点对象构建成一棵DOM树。     

![construct-dom-process](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/construct-dom-process.png)       

DocumentWriter 类会先创建一个根节点 HTMLDocument 对象，然后将数据“append”输送到
HTMLDocumentParser 对象。后面就是如之前所描述的将其解释成词语，创建节点对象然后建立以
HTMLDocument 为根的DOM树。    

### 5.2.2 词法分析

词法分析的工作都是由 HTMLTokenizer 类来完成，简单来说，它就是一个状态机——输入的是字符串，
输出的是一个个的词语。因为字节流可能是分段的，所以输入的字符串可能也是分段的，但是这对
词法分析器来说没有什么特别之处，它会自己维护内部的状态信息。    

词法分析器的主要接口是“nextToken”函数，调用者只需要将字符串传入，然后就会得到一个词语，
并对传入的字符串设置相应的信息，表示当前处理完的位置，如此循环。如果词法分析器遇到错误，
则报告状态错误码。    

对于词语的类别，WebKit只定义了很少，HTMLToken类定义了6种词语类别，包括DOCTYPE、StartTag、
EndTag、Comment、Character和EndOfFile。     

### 5.2.3　XSSAuditor验证词语

当词语生成之后，WebKit需要使用XSSAuditor来验证词语流（Token Stream）。XSS指的是
Cross Site Security。根据XSS的安全机制，对于解析出来的这些词语，可能会阻碍某些内容的
进一步执行，所以 XSSAuditor 类主要负责过滤这些被阻止的内容，只有通过的词语才会作后面的处理。     

### 5.2.4 词语到节点

下面的任务就是如何完成从词语到构建节点这一步骤。这一步骤是由HTMLDocumentParser类调用
HTMLTreeBuilder类的“constructTree”函数来实现的。该函数实际上是利用图5-9中的
“processToken”函数来处理6种词语类型。     

![construct-tree-func](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/construct-tree-func.png)        

### 5.2.5 节点到 DOM 树

从节点到构建DOM树，包括为树中的元素节点创建属性节点等工作由 HTMLConstructionSite 类来
完成。正如前面介绍的，该类包含一个DOM树的根节点—— HTMLDocument 对象，其他的元素节点都是
它的后代。    

同DOM标准一样，一切的基础都是 Node 类。在WebKit中，DOM中的接口 Interface 对应于C++的类，
Node 类是其他类的基类，图5-10显示了DOM的主要相关节点类。图中的 Node 类实际上继承自
EventTarget 类，它表明 Node 类能够接受事件，这个会在DOM事件处理中介绍。Node 类还继承自
另外一个基类——ScriptWrappable，这个跟JavaScript引擎相关。     

![node-class](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/node-class.png)     

### 5.2.8 JavaScript 的执行

在HTML解释器的工作过程中，可能会有 JavaScript 代码（全局作用域的代码）需要执行，它发生
在将字符串解释成词语之后、创建各种节点的时候。这也是为什么全局执行的 JavaScript 代码不能
访问DOM树的原因——因为DOM树还没有被创建完呢。这里说的不严谨吧，应该是可以访问已构建的部分
的吧。    

WebKit将DOM树创建过程中需要执行的 JavaScript 代码交由 HTMLScriptRunner 类来负责。
工作方式很简单，就是利用 JavaScript 引擎来执行Node节点中包含的代码。    

因为JavaScript代码可能会调用例如“document.write()”来修改文档结构，所以 JavaScript
代码的执行会阻碍后面节点的创建，同时当然也会阻碍后面的资源下载，这时候 WebKit 对需要什么
资源一无所知，这导致了资源不能够并发地下载这一严重影响性能的问题。WebKit 有什么办法能够
处理这样的情况呢？WebKit 使用预扫描和预加载机制来实现资源的并发下载而不被JavaScript
的执行所阻碍。    

具体的做法是，当遇到需要执行 JavaScript 代码的时候，WebKit先暂停当前JavaScript代码的
执行，使用预先扫描器 HTMLPreloadScanner 类来扫描后面的词语。如果 WebKit 发现它们需要
使用其他资源，那么使用预资源加载器 HTMLResourcePreloader 类来发送请求，在这之后，才执行
JavaScript的代码。预先扫描器本身并不创建节点对象，也不会构建DOM树，所以速度比较快。    

## 5.4 影子（Shadow）DOM

影子DOM是一个新东西，它主要解决了一个文档中可能需要大量交互的多个DOM树建立和维护各自的
功能边界的问题。    

### 5.4.1 什么是 Shadow DOM

想象一下网页的基础库开发者希望开发这样一个用户界面的控件——这个控件可能由一些HTML的标签
元素组成，这些元素可以组成一颗DOM树的子树。这样一个HTML控件可以被到处使用，但是问题随之而来，
那就是每个使用控件的地方都会知道这个子树的结构。当网页的开发者需要访问网页DOM树的时候，
这些控件内部的DOM子树都会暴露出来，这些暴露的节点不仅可能给DOM树的遍历带来很多麻烦，而且
也可能给CSS的样式选择带来问题，因为选择器无意中可能会改变这些内部节点的样式，从而导致
很奇怪的控件界面。    

影子DOM的规范草案能够使得一些DOM节点在特定范围内可见，而在网页的DOM树中却不可见，但是
网页渲染的结果中包含了这些节点，这就使得封装变得容易很多。    

图5-21描述了HTML文档对应的 DOM 树和“div”元素包含的一个影子DOM子树。当使用 JavaScript
代码访问HTML文档的 DOM 树的时候，通常的接口是不能直接访问到影子 DOM 子树中的节点的，
JavaScript代码只能通过特殊的接口方式。     

![shadow-dom](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/shadow-dom.png)     

# 第 6 章 CSS 解释器和样式布局

从整个网页的加载和渲染过程来看，CSS解释器和规则匹配处于DOM树建立之后，RenderObject树
建立之前，CSS 解释器解释后的结果会保存起来，然后 RenderObject 树基于该结果来进行规范
匹配和布局计算。当网页有用户交互或者动画等动作的时候，通过 CSSOM 等技术，JavaScript
代码同样可以非常方便地修改CSS代码，WebKit此时需要重新解释样式并重复以上这一过程。    

## 6.2 CSS解释器和规则匹配

### 6.2.1 样式的 WebKit 表示类

DOM树中，CSS样式可以包含在“style”元素中或者使用“link”来引用一个CSS文档。对于CSS样式表，
不管是内嵌还是外部文档，WebKit 都使用 CSSStyleSheet 类来表示。图6-5描述了WebKit内部是
如何表示CSS文档的。    

![css-class-relationship](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/css-class-relationship.png)     

一切的起源都是从DOM中的 Document 类开始。先看 Document 类之外的左上部分：包括一个
DocumentStyleSheetCollection 类，该类包含了所有 CSS 样式表；还包括 WebKit 的内部表示类
CSSStyleSheet，它包含CSS的href、类型、内容等信息。CSS的内容就是样式信息StyleSheetContents，
包含了一个样式规则（StyleRuleBase）列表。样式规则被用在CSS的解释器的工作过程中。    

下面的部分 WebKit 主要是将解释之后的规则组织起来，用于为DOM中的元素匹配相应的规则，从而
应用规则中的属性值序列。这一过程的主要负责者是 StyleSheetResolver 类，它属于Document类，
并包含了一个 DocumentRuleSets 类用来表示多个规则集合（RuleSet）。每个规则集合都是将之前
解释之后的结果合并起来，并进行分类，例如id类规则、标签类规则等。至于为什么是多个规则集合，
是因为这些规则集合可能源自于默认的规则集合（前面提到过WebKit使用默认的CSS样式信息），
或者网页自定义的规则集合等。    

### 6.2.2 解释过程

CSS解释过程是指从CSS字符串经过CSS解释器处理后变成渲染引擎的内部规则表示的过程。在WebKit
中，这一过程如图6-8所示.    

![css-parser](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/css-parser.png)     

### 6.2.3 样式规则匹配

样式规则建立完成之后，WebKit保存规则结果在 DocumentRuleSets 对象类中。当DOM的节点建立
之后，WebKit会为其中的一些节点选择合适的样式信息。根据前面的描述，这些工作都是由
StyleResolver来负责的。当然，实际的匹配工作还是在 DocumentRuleSets 类中完成的。    

图6-9描述了参与样式规则匹配的WebKit主要相关类。基本的思路是使用 StyleResolver 类来为
DOM的元素节点匹配样式。StyleResolver 类根据元素的信息，例如标签名、类别等，从样式规则中
查找最匹配的规则，然后将样式信息保存到新建的 RenderStyle 对象中。最后，这些RenderStyle
对象被 RenderObject 类所管理和使用。    

+ 首先，当 WebKit 需要为 HTML 元素创建 RenderObject 类的时候，首先 StyleResolver 类负
责获取样式信息，并返回 RenderStyle 对象，RenderStyle 对象包含了匹配完的结果样式信息。    
+ 其次，根据实际需求，每个元素可能需要匹配不同来源的规则，依次是用户代理（浏览器）规则集合、
用户规则集合和 HTML 网页中包含的自定义规则集合。
+ 再次，对于自定义规则集合，它先查找ID规则，检查有无匹配的规则，之后依次检查类型规则、
标签规则等。如果某个规则匹配上该元素，WebKit把这些规则保存到匹配结果中。
+ 最后，WebKit对这些规则进行排序。对于该元素需要的样式属性，WebKit选择从高优先级规则中
选取，并将样式属性值返回。    

## 6.3 WebKit 布局

当 WebKit 创建 RenderObject 对象之后，每个对象是不知道自己的位置、大小等信息的，WebKit
根据框模型来计算它们的位置、大小等信息的过程称为布局计算（或者称为排版）。    

![layout-class](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/layout-class.png)     

FrameView 类主要负责视图方面的任务，例如网页视图大小、滚动、布局计算、绘图等，它是一个
总入口类。图中标注了两个跟布局计算密切相关的函数——“layout”和“needsLayout”，它们用来布
局计算和决定是否需要布局计算，实际的布局计算则是在 RenderObject 类中。   

布局计算根据其计算的范围大致可以分为两类：第一类是对整个RenderObject树进行的计算；第二
类是对RenderObject树中某个子树的计算，常见于文本元素或者是overflow:auto块的计算，这
种情况一般是其子树布局的改变不会影响其周围元素的布局，因而不需要重新计算更大范围内的布局。    

### 6.3.2 布局计算

布局计算是一个递归的过程，这是因为一个节点的大小通常需要先计算它的子女节点的位置、大小等
信息。    

# 第 7 章 渲染基础

## 7.1 RenderObject 树

### 7.1.1 RenderObject 基础类

在 DOM 树中，某些节点是用户不可见的，也就是说这些只是起一些其他方面而不是显示内容的作用。
例如表示HTML文件头的“meta”节点，在最终的显示结果中，用户是看不到它的存在的，称之为“非可视化节点”。
该类型其实还包含很多元素，例如“head”、“script”等。而另外的节点就是用来展示网页内容的，
例如“body”、“div”、“span”、“canvas”、“img”等，这些节点可以显示一块区域，如文字、图片、
2D图形等，被称为“可视节点”。     

对于这些“可视节点”，因为 WebKit 需要将它们的内容绘制到最终的网页结果中，所以 WebKit 会
为它们建立相应的 RenderObject 对象。一个 RenderObject 对象保存了为绘制 DOM 节点所需要
的各种信息，例如样式布局信息，经过WebKit的处理之后，RenderObject对象知道如何绘制自己。
这些 RenderObject 对象同 DOM 的节点对象类似，它们也构成一棵树，在这里我们称之为RenderObject
树。RenderObject 树是基于DOM树建立起来的一棵新树，是为了布局计算和渲染等机制而构建的一
种新的内部表示。RenderObject 树节点和 DOM 树节点不是一一对应关系，那么哪些情况下为一个
DOM节点建立新的 RenderObject 对象呢？以下是三条规则，从这些规则出发会为DOM树节点创建
一个RenderObject对象:    

+ DOM树的 document 节点。
+ DOM树中的可视节点，例如html、body、div等。而 WebKit 不会为非可视化节点创建RenderObject节点
+ 某些情况下 WebKit 需要建立匿名的 RenderObject 节点，该节点不对应于 DOM 树中的任何节点，
而是 WebKit 处理上的需要，典型的例子就是匿名的 RenderBlock 节点.     

DOM树中，元素节点包含很多类型。同DOM树一样，RenderObject树中的节点也有很多类型。    

![render-class](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/render-class.png)    

### 7.1.2 RenderObject 树

![dom-compare-to-render-object-tree](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/dom-compare-to-render-object-tree.png)    

## 7.2 网页层次和 RenderLayer 树

### 7.2.1 层次和 RenderLayer 对象

WebKit 会为网页的层次创建相应的 RenderLayer 对象。当某些类型 RenderObject 的节点或者
具有某些CSS样式的 RenderObject 节点出现的时候，WebKit 就会为这些节点创建 RenderLayer
对象。一般来说，某个 RenderObject 节点的后代都属于该节点，除非WebKit根据规则为某个后代
RenderObject 节点创建了一个新的 RenderLayer 对象。   

RenderLayer 树是基于 RenderObject 树建立起来的一棵新树。根据上面所述笔者可以得出这样的结论：
RenderLayer 节点和 RenderObject 节点不是一一对应关系，而是一对多的关系。那么哪些情况下
的 RenderObject 节点需要建立新的 RenderLayer 节点呢？以下是基本规则。    

+ DOM 树的 Dcoument 节点对应的 RenderView 节点
+ DOM 树中的 Document 的子女节点，也就是 HTML 节点对应的 RenderBlock 节点
+ 显示的指定 CSS 位置的 RenderObject 节点（这里所谓的位置是指哪种位置）
+ 有透明效果的 RenderObject 节点
+ 节点有溢出（Overflow）、alpha 或者反射等效果的 RenderObject 节点
+ 使用 Canvas 2D 和 3D 技术的 RenderObject 节点
+ Video 节点对应的 RenderObject 节点    

除了根节点也就是 RenderLayer 节点，一个 RenderLayer 节点的父亲就是该 RenderLayer 节点
对应的 RenderObject 节点的祖先链中最近的祖先，并且祖先所在的 RenderLayer 节点同该节点
的 RenderLayer 节点不同。基于这一原理，这些 RenderLayer 节点也构成了一棵RenderLayer树。    

## 7.3 渲染方式

在完成构建DOM树之后，WebKit所要做的事情就是构建渲染的内部表示并使用图形库将这些模型绘制
出来。提到网页的渲染方式，目前主要有两种方式，第一种是软件渲染，第二种是硬件加速渲染。
其实这种描述并不精确，因为还有一种混合模式。  

每个 RenderLayer 对象可以被想象成图像中的一个层，各个层一同构成了一个图像。在渲染的过程
中，浏览器也可以作同样的理解。每个层对应网页中的一个或者一些可视元素，这些元素都绘制内容
到该层上，在本书中，一律把这一过程称为绘图操作。如果绘图操作使用CPU来完成，那么称之为软件
绘图。如果绘图操作由GPU来完成，称之为GPU硬件加速绘图。理想情况下，每个层都有个绘制的存储
区域，这个存储区域用来保存绘图的结果。最后，需要将这些层的内容合并到同一个图像之中，
本书中称之为合成（Compositing），使用了合成技术的渲染称之为合成化渲染。    

所以在 RenderObject 树和 RenderLayer 树之后，WebKit 的机制操作将内部模型转换成可视的
结果分为两个阶段：每层的内容进行绘图工作及之后将这些绘图的结果合成为一个图像。对于软件
渲染机制，WebKit 需要使用 CPU 来绘制每层的内容，按照上面的介绍，读者可能觉得需要合成这些层，
其实软件渲染机制是没有合成阶段的，为什么？原因很简单，没有必要。在软件渲染中，通常渲染的
结果就是一个位图（Bitmap），绘制每一层的时候都使用该位图，区别在于绘制的位置可能不一样，
当然每一层都按照从后到前的顺序。当然，你也可以为每层分配一个位图，问题是，一个位图就已经
能够解决所有问题。    

合成化的渲染技术，也就是使用 GPU 硬件来加速合成这些网页层，合成的工作都是由 GPU 来做，
这里称为硬件加速合成（Accelerated Compositing）。但是，对于每个层，有不同的选择。其中
某些层，一种方式使用 CPU 来绘图，另外一些层使用 GPU 来绘图。对于使用 CPU 来绘图的层，
该层的结果首先当然保存在CPU内存中，之后被传输到GPU的内存中，这主要是为了后面的合成工作。
另一种渲染方式使用 GPU 来绘制所有合成层。这两种方式其实都属于硬件加速渲染方式。前面的
这些描述，是把RenderLayer对象和实际的存储空间对应，现实中不是这样的，这只是理想的情况。    

这三种不同的渲染方式各有各自的优缺点和适用场景：   

+ 软件渲染是目前很常见的技术，也是浏览器最早使用的渲染方式这一技术比较节省内存，特别是更
宝贵的GPU内存，但是软件渲染只能处理2D方面的操作。简单的网页没有复杂绘图或者多媒体方面的需求，
软件渲染方式就比较合适来渲染该类型的网页。问题是，一旦遇上了HTML5的很多新技术，软件渲染
显然无能为力，一是因为能力不足，典型的例子是CSS3D、WebGL等；二是因为性能不好，例如视频、
Canvas 2D等。所以，软件渲染技术被使用得越来越少，特别是在移动领域。软件渲染同硬件加速
渲染另外一个很不同的地方就是对更新区域的处理。当网页中有一个更新小型区域的请求（如动画）时，
软件渲染可能只需要计算一个极小的区域，而硬件渲染可能需要重新绘制其中的一层或者多层，
然后再合成这些层。硬件渲染的代价可能会大得多。
+ 对于硬件加速的合成化渲染方式来说，每个层的绘制和所有层的合成均使用GPU硬件来完成，这对
需要使用3D绘图的操作来说特别适合。这种方式下，在 RenderLayer 树之后，WebKit和Chromium
还需要建立更多的内部表示，例如 GraphicsLayer 树、合成器中的层（如Chromium的CCLayer）等，
目的是支持硬件加速机制，这显然会消耗更多的内存资源。但是，一方面，硬件加速机制能够支持
现在所有的HTML5定义的2D或者3D绘图标准；另一方面，关于更新区域的讨论，如果需要更新某个层
的一个区域，因为软件渲染没有为每一层提供后端存储，因而它需要将和这个区域有重叠部分的所有
层次的相关区域依次从后向前重新绘制一遍，而硬件加速渲染只需要重新绘制更新发生的层次。因而
在某些情况下，软件渲染的代价更大。当然，这取决于网页的结构和渲染策略。
+ 软件绘图的合成化渲染方式结合了前面两种方式的优点，这是因为很多网页可能既包含基本的HTML
元素，也包含一些 HTML5 新功能，使用 CPU 绘图方式来绘制某些层，使用GPU来绘制其他一些层。    

## 7.4 软件渲染过程

要分析软件渲染过程，需要关注两个方面，其一是 RenderLayer 树，其二是每个 RenderLayer
所包含的 RenderObject 子树。首先来看 WebKit 如何遍历 RenderLayer 树来绘制各个层。    

对于每个 RenderObject 对象，需要三个阶段绘制自己，第一阶段是绘制该层中所有块的背景和边框，
第二阶段是绘制浮动内容，第三阶段是前景（Foreground），也就是内容部分、轮廓等部分。当然，
每个阶段还可能会有一些子阶段。值得指出的是，内嵌元素的背景、边框、前景等都是在第三阶段中
被绘制的，这是不同之处。    

具体的绘制过程：   

1. 对于当前的 RenderLayer 对象而言，WebKit 首先绘制反射层(Reflectionlayer)，这是由 CSS
定义的
2. 然后 WebKit 开始绘制 RenderLayer 对象对应的 RenderObject 节点的背景层。
3. 绘制 z-index 为负数的子女层。这是一个递归过程
4. WebKit 绘制 RenderLayer 节点对应的 RenderObject 节点的所有后代节点的背景
5. 绘制浮动元素
6. 绘制 RenderObject 节点的内容和后代节点的内容，然后绘制所有后代节点的轮廓
7. 绘制 RenderLayer 对象对应的 RenderObject 节点的轮廓
8. 绘制 RenderLayer 对象的子女步骤，首先绘制 overflow 的 RenderLayer 节点，之后依次
绘制 z-index 为正数的 RenderLayer 节点
9. 绘制 RenderObject 节点的滤镜    

# 第 8 章 硬件加速机制

## 8.1 硬件加速基础

### 8.1.1 概念

对于 GPU 绘图而言，通常不像软件渲染那样只是计算其中更新的区域，一旦有更新请求，如果没有
分层，引擎可能需要重新绘制所有的区域，因为计算更新部分对GPU来说可能耗费更多的时间。当网页
分层之后，部分区域的更新可能只在网页的一层或者几层，而不需要将整个网页都重新绘制。通过
重新绘制网页的一个或者几个层，并将它们和其他之前绘制完的层合成起来，既能使用GPU的能力，
又能够减少重绘的开销。    

之前，笔者总是将 RenderLayer 对象和最终显示出来的图形层次一一对应起来，也就是每个
RenderLayer 对象都有一个后端存储与其对应，这样有很多好处，那就是当每一层更新的时候，
WebKit只需要更新 RenderLayer 对象包含的节点即可。所以当某一层有任何更新时候，WebKit
重绘该层的所有内容。这是理想情况，在现实中不一定会这样，主要原因是实际中的硬件能力和资源有限。
为了节省GPU的内存资源，硬件加速机制在RenderLayer树建立之后需要做三件事情来完成网页的渲染:   
 
+ WebKit 决定将哪些 RenderLayer 对象组合在一起，形成一个有后端存储的新层，这一新层不久
后会用于之后的合成（Compositing），这里称之为合成层（Compositing Layer）。每个新层都有
一个或者多个后端存储，这里的后端存储可能是GPU的内存。对于一个RenderLayer对象，如果它没有
后端存储的新层，那么就使用它的父亲所使用的合成层。
+ 将每个合成层包含的这些 RenderLayer 内容绘制在合成层的后端存储中，这里的绘制可以是
软件绘制也可以是硬件绘制。
+ 由合成器（Compositor）将多个合成层合成起来，形成网页的最终可视化结果，实际就是一张图片。
合成器是一种能够将多个合成层按照这些层的前后顺序、合成层的3D变形等设置而合成一个图像结果
的设施。   

哪些RenderLayer对象可以是合成层呢？如果一个RenderLayer对象具有以下的特征之一，那么它
就是合成层：    

+ RenderLayer 具有 CSS 3D 属性或者 CSS 透视效果
+ RenderLayer 包含的 RenderObject 节点表示的是使用硬件加速的视频解码技术的 HTML5 video 元素
+ RenderLayer 包含的 RenderObject 节点表示的是使用硬件加速的 Canvas 2D 元素或者 WebGL
元素
+ RenderLayer 使用了 CSS 透明效果的动画或者 CSS 变换的动画
+ RenderLayer 使用了硬件加速的 CSS Filters 技术
+ RenderLayer 使用 Clip 或者 Reflection 技术，并且它的后代中包括一个合成层
+ RenderLayer 有一个 z-index 比自己小的兄弟节点，且该节点是一个合成层     

# 第 9 章 JavaScript 引擎

## 9.1 JavaScript 引擎

Java语言其做法是明显的两个阶段，首先是像C++语言一样的编译阶段，但是，同C++编译器生成的
本地代码结果不同，Java代码经过编译器编译之后生成的是字节码，字节码是跨平台的一种中间表示，
不同于本地代码。该字节码与平台无关，能够在不同操作系统上运行。在运行字节码阶段，Java的
运行环境是Java虚拟机加载字节码，使用解释器执行这些字节码。如果仅是这样，那Java的性能就
比C++差太多了。现代Java虚拟机一般都引入了JIT技术，也就是前面说的将字节码转变成本地代码
来提高执行效率。图9-6描述这两个阶段，第一阶段对时间要求不严格，第二阶段则对每个步骤所
花费的时间非常敏感，时间越短越好。    

![java-compile](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/java-compile.png)    

最后回到 JavaScript 语言上来。前面已经说了它是一种解释性脚本语言。早期也是由解释器来解
释即可，就是将源代码转变成抽象语法树，然后在抽象语法树上解释执行。随着将Java虚拟机的JIT
技术引入，现在的做法是将抽象语法树转成中间表示（也就是字节码），然后通过JIT技术转成本地
代码，这能够大大地提高执行效率。当然也有些直接从抽象语法树生成本地代码的JIT技术，例如V8。    

图9-7描述了 JavaScript 代码执行的过程，这一过程中因为不同技术的引入，导致其步骤非常复杂，
而且因为都是在代码运行过程中来处理这些步骤，所以每个阶段的时间越少越好，而且每引入一个
阶段都是额外的时间开销，可能最后的本地代码执行效率很高，但是如果之前的步骤耗费太多时间，
最后的执行结果可能并不会好。所以不同的JavaScript引擎选择了不同的路径:   

![javascript-compile](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/javascript-compile.png)    

所以一个JavaScript引擎不外乎包括以下几个部分:   

+ **编译器**：主要工作是将源代码编译成抽象语法树，在某些引擎中还包含将抽象语法树转换成
字节码
+ **解释器**：在某些引擎中，解释器主要是接收字节码。解释执行这个字节码
+ **JIT 工具**：一个能进行 JIT 的工具，将字节码或者抽象语法树转换成本地代码，
+ **垃圾回收器和分析工具（Profiler）**     

### 9.1.3　JavaScript引擎和渲染引擎

前面介绍了网页的工作过程需要使用两个引擎，也就是渲染引擎和 JavaScript 引擎。从模块上看，
它们是两个独立的模块，分别负责不同的事情：JavaScript 引擎负责执行 JavaScript 代码，
而渲染引擎负责渲染网页。JavaScript 引擎提供调用接口给渲染引擎，以便让渲染引擎使用 JavaScript
引擎来处理 JavaScript 代码并获取结果。这当然不是全部，事情也不是这么简单，JavaScript
引擎需要能够访问渲染引擎构建的DOM树，所以JavaScript引擎通常需要提供桥接的接口，而渲染
引擎则根据桥接接口来提供让JavaScript访问DOM的能力。    

![two-engine](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/two-engine.png)   

在 WebKit 中，两种引擎通过桥接接口来访问 DOM 结构，这对性能来说是一个重大的损失因为每次
JavaScript 代码访问 DOM 都需要通过复杂和低效的桥接接口来完成。鉴于访问DOM树的普遍性，
这是一个常见的问题。    

## 9.2 V8 引擎

要了解V8的内部工作机制或者说原理，有必要先了解V8所提供的应用编程接口，它们在V8代码目录的
include/V8.h中，通过接口中的某些类可以一窥V8的工作方式，其中一些主要的类如下：   

+ **各种各样的基础类**：这里面包含对象引用类（如WeakReferenceCallbacks）、基本数据类型类
（如Int32、Integer、Number、String、StringObject）和JavaScript对象（Object）。这些
都是基础抽象类，没有包含实际的实现，真正的实现在“src”目录中的“objects.h/cc”中。
+ **VaIue**：所有JavaScript数据和对象的基类，如上面的Integer、Number、String等。
+ **V8数据的句柄类**：以上数据类型的对象在V8中有不同的生命周期，需要使用句柄来描述它们
的生命周期，以及垃圾回收器如何使用句柄来管理这些数据，句柄类包括Local、Persistent和Handle。
+ **Isolate**：这个类表示的是一个V8引擎实例，包括相关状态信息、堆等，总之这是一个能够
执行JavaScript代码的类，它不能被多个线程同时访问，所以，如果非要这么做的话，需要使用锁。
V8使用者可以使用创建多个该类的实例，但是每个实例之间就像这个类的名字一样，都是孤立的。
+ **Context**：执行上下文，包含内置的对象和方法，如print方法等，还包括JavaScript内置
的库，如math等。
+ **Extension**：V8的扩展类。用于扩展JavaScript接口，V8使用者基于该类来实现相应接口，
被V8引擎调用。
+ **Handle**：句柄类，主要用来管理基础数据和对象，以便被垃圾回收器操作。主要有两个类型，
一个是Local（就是Local类，继承自Handle类），另一个是Persistent（Persistent类，继承自Handle类）。
前者表示本地栈上的数据，所以量级比较轻，后者表示函数间的数据和对象访问。
+ **Script**：用于表示被编译过的JavaScript源代码，V8的内部表示。
+ **HandleScope**：包含一组Handle的容器类，帮助一次性删除这些Handle，避免重复调用。
+ **FunctionTemplate**：绑定C++函数到JavaScript，函数模板的一个例子就是将JavaScript
接口的C++实现绑定到JavaScript引擎。
+ **ObjectTemplate**：绑定C++对象到JavaScript，对象模板的典型应用是Chromium中将DOM
节点通过该模板包装成JavaScript对象     

使用V8的基本流程和这些接口对应的内存管理方式如下：   

+ 通过 Isolate::GetCurrent() 获取一个 V8 引擎实例，后面的操作都是在它提供的环境中来进行
的。
+ 建立一个域，用于包含一组 Handle 对象，便于释放它们
+ 根据 Isolate 对象来获取一个 Context 对象，使用 Handle 来管理。Handle 对象本身存放在
栈上，而实际的 Context 对象保存在堆中
+ 为 Context 对象创建一个基于栈的域，下面的执行步骤都是在该域中对应的上下文中来进行的
+ 从命令行参数读入 JS 代码，也就是一段字符串
+ 将代码字符串编译成 V8 的内部表示，并保存成一个 Script 对象
+ 执行编译，然后获得生成的结果    

### 9.2.2 工作原理

大家知道在JavaScript语言中，只有基本数据类型Boolean、Number、String、Null和Undefined，
其他数据都是对象，V8使用一种特殊的方式来表示它们。    

在V8中，数据的表示分成两个部分，第一部分是数据的实际内容，它们是变长的，而且内容的类型也
不一样，如String、对象等。第二个部分是数据的句柄，句柄的大小是固定的，句柄中包含指向数据
的指针。为什么会是这种设计呢？主要是因为V8需要进行垃圾回收，并需要移动这些数据内容，如果
直接使用指针的话就会出问题或者需要比较大的开销，使用句柄的话就不存在这些问题，只需要将
句柄中的指针修改即可，使用者使用的还是句柄，它本身没有发生变化。    

除了极少数的数据例如整形数据，其他的内容都是从堆中申请内存来存储它们，这是因为Handle本身
能够存储整形，同时也为了快速访问。而对于其他类型，受限于Handle的大小和变长等原因，都存储
在堆中。    

因为堆中存放的对象都是4字节对齐的，所以指向它们的指针的最后两位都是00，所以这两位其实是
不需要的。在V8中，它们被用来表示句柄中包含数据的类型。    

JavaScript对象的实现在V8中包含3个成员，正如图9-12中所描述的那样，第一个是隐藏类的指针，
这是V8为 JavaScript 对象创建的隐藏类。第二个指向这个对象包含的属性值。第三个指向这个
对象包含的元素。     

![js-object](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/js-object.png)   