# SVG part1

<!-- TOC -->

- [SVG part1](#svg-part1)
- [Chapter 1. Getting Started](#chapter-1-getting-started)
  - [图像系统](#图像系统)
    - [光栅图像](#光栅图像)
    - [矢量图](#矢量图)
  - [创建一个 SVG 图](#创建一个-svg-图)
    - [文档结构](#文档结构)
    - [基础形状](#基础形状)
    - [将样式声明为属性](#将样式声明为属性)
    - [将图形对象分组](#将图形对象分组)
    - [转换坐标系统](#转换坐标系统)
    - [其他基础图形](#其他基础图形)
    - [路径](#路径)
    - [文本](#文本)
- [Chapter 2. Using SVG in Web Pages](#chapter-2-using-svg-in-web-pages)
  - [将 SVG 作为一张图片](#将-svg-作为一张图片)
    - [将 SVG 内联到 &lt;img&gt; 元素中](#将-svg-内联到-ltimggt-元素中)
    - [将 SVG 内联到 CSS 中](#将-svg-内联到-css-中)
  - [SVG 作为一个应用](#svg-作为一个应用)
  - [在混合文档中使用 SVG 标签](#在混合文档中使用-svg-标签)
    - [SVG 中的外部对象](#svg-中的外部对象)
    - [在 XHTML 或 HTML5 中内联 SVG](#在-xhtml-或-html5-中内联-svg)
- [Chapter 3. Coordinates](#chapter-3-coordinates)
  - [视口 Viewport](#视口-viewport)
  - [使用默认的用户坐标系](#使用默认的用户坐标系)
  - [为一个视口指定用户坐标系](#为一个视口指定用户坐标系)
  - [保持宽高比](#保持宽高比)
    - [为 preserveAspectRatio 指定对齐方式](#为-preserveaspectratio-指定对齐方式)
    - [使用 meet 声明符](#使用-meet-声明符)
    - [使用 slice 声明符](#使用-slice-声明符)
    - [使用 none 声明符](#使用-none-声明符)
  - [内嵌的坐标系统](#内嵌的坐标系统)
- [Chapter 4. 基础图形](#chapter-4-基础图形)
  - [直线](#直线)
  - [描边特性](#描边特性)
    - [stroke-width](#stroke-width)
    - [stroke-color](#stroke-color)
    - [stroke-opacity](#stroke-opacity)
    - [stroke-dasharray 属性](#stroke-dasharray-属性)
  - [矩形](#矩形)
    - [圆角矩形](#圆角矩形)
  - [圆形和椭圆](#圆形和椭圆)
  - [多边形 &lt;polygon&gt; 元素](#多边形-ltpolygongt-元素)
    - [决定点属于多边形内部还是外部](#决定点属于多边形内部还是外部)
  - [&lt;polyline&gt; 元素](#ltpolylinegt-元素)
  - [Line Caps 和 Line Joins](#line-caps-和-line-joins)
- [Chapter 5. 文档结构](#chapter-5-文档结构)
  - [结构与表现](#结构与表现)
  - [在 SVG 中使用样式](#在-svg-中使用样式)
    - [内联样式](#内联样式)
    - [内部样式表](#内部样式表)
    - [外部样式表](#外部样式表)
    - [表现属性](#表现属性)
  - [分组及引用对象](#分组及引用对象)
    - [&lt;g&gt; 元素](#ltggt-元素)
    - [&lt;use&gt; 元素](#ltusegt-元素)
    - [&lt;defs&gt; 元素](#ltdefsgt-元素)
    - [&lt;symbol&gt; 元素](#ltsymbolgt-元素)
    - [&lt;image&gt; 元素](#ltimagegt-元素)
- [Chapter 6. 坐标系变换](#chapter-6-坐标系变换)
  - [translate 变换](#translate-变换)
  - [scale 变换](#scale-变换)
  - [变换序列](#变换序列)
  - [rotate 变换](#rotate-变换)
  - [根据中心点进行缩放](#根据中心点进行缩放)
  - [skewX 和 skewY 变换](#skewx-和-skewy-变换)

<!-- /TOC -->



# Chapter 1. Getting Started

## 图像系统

在计算机上有两种主要的展示图像信息的系统，分别是光栅图像和矢量图像。    

### 光栅图像

在光栅图像中，一张图片是用一个图像元素或像素的矩形阵列表示的。每个像素可以用其 RGB 颜色值表示，
或者用其颜色在一个颜色列表中的索引表示。这一系列的像素，也叫做 **位图**，通常是用压缩过的格式
存储的。由于现在大多数的显示设备也都是光栅设备，所以显示图像的程序只要解压缩位图然后将其传送
给屏幕即可实现光栅图像。    

### 矢量图

在矢量图系统中，一张图像是被描述为一系列的几何图形。不同于显示光栅图像的程序接收一系列像素作为
输入，矢量图显示程序接收一系列的命令，然后根据这些命令在指定的坐标集中绘制形状。     


想象一下在一张方格纸上绘制图像，光栅图像通过描述每个小方格应该用什么颜色填充来绘制，矢量图通过
要将直线或曲线绘制到哪些网格点中来工作。    

矢量图像都”清楚“自己是什么东西——一个小方格知道它是一个小方格，一段文本知道它是一段文本。因为它们
都是一个个的对象，而不是一系列像素点，矢量对象可以改变它们的形状和颜色，但是位图不行。矢量图中的
所有的文本都是可以搜索的，因为它们就是实际的文本。      

## 创建一个 SVG 图

### 文档结构

下面的代码中，从标准的 XML 处理指令和 DOCTYPE 声明开始。根`<svg>` 元素以像素为单位定义了最终
图像的宽高。它同时通过 `xmlns` 属性定义了 SVG 命名空间。`<title>` 元素的内容通常是提供给
展示程序在标题栏中显示，`<desc>` 元素让我们能给图像提供一个完整的描述。    

```xml
<?xml version="1.0"?>
<?DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
  "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">

<svg width="140" height="170"
  xmlns="http://www.w3.org/2000/svg">
<title>Cat</title>
<desc>Stick Figure of a Cat</desc>>
</svg>
```    

### 基础形状

我们首先使用 `<circle>` 元素画小猫的脸，其属性声明了圆心的坐标及半径的大小。(0,0)点是图片的
左上角。x 坐标水平向右增加，y 坐标垂直向下增加。     

圆的位置及大小是绘制结构的一部分。而颜色是其表现的一部分。按照 XML 应用程序的惯例，应该将结构
和表现分离，来获得最大的灵活性。表现信息包含在 `style` 属性中。    

```xml
<?xml version="1.0"?>
<?DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
  "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">

<svg width="140" height="170"
  xmlns="http://www.w3.org/2000/svg">
<title>Cat</title>
<desc>Stick Figure of a Cat</desc>>

<circle cx="70" cy="95" r="50" style="stroke: black; fill: none" />

</svg>
```     

### 将样式声明为属性

现在画两个眼睛。虽然其填充和描边颜色都是表现的一部分，但是 SVG 也允许我们把它们声明成独立的属性。    

```xml
<circle cx="70" cy="95" r="50" style="stroke: black; fill: none" />
<circle cx="55" cy="80" r="5" stroke="black" fill="#339933" />
<circle cx="85" cy="80" r="5" stroke="black" fill="#339933" />
```    

### 将图形对象分组

用 `<line>` 元素给猫画两条胡子。我们可以将这两个元素当成一个单元处理，即将这两个元素封装到一个
`<g>` 元素中，然后给它们一个 `id`。    

```xml
<circle cx="70" cy="95" r="50" style="stroke: black; fill: none" />
<circle cx="55" cy="80" r="5" stroke="black" fill="#339933" />
<circle cx="85" cy="80" r="5" stroke="black" fill="#339933" />
<g id="whiskers">
  <line x1="75" y1="95" x2="135" y2="85" style="stroke: black;"/>
  <line x1="75" y1="95" x2="135" y2="105" style="stroke: black;"/>
</g>
```    

### 转换坐标系统

现在我们来使用 `<use>` 元素来将右边的两条胡子转换到左边。在伸缩变换中将 x 坐标乘以 -1 来反转
坐标系。    

```xml
<svg width="140" height="170"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink">
<title>Cat</title>
<desc>Stick Figure of a Cat</desc>>

<circle cx="70" cy="95" r="50" style="stroke: black; fill: none" />
<circle cx="55" cy="80" r="5" stroke="black" fill="#339933" />
<circle cx="85" cy="80" r="5" stroke="black" fill="#339933" />
<g id="whiskers">
  <line x1="75" y1="95" x2="135" y2="85" style="stroke: black;"/>
  <line x1="75" y1="95" x2="135" y2="105" style="stroke: black;"/>
</g>

<use xlink:href="#whiskers" transform="scale(-1,1) translate(-140, 0)" />

</svg>
```    

`xlink:href` 属性是处于一个不同的命名空间中。为了让我们的 SVG 能在所有 SVG 查看器上能正常
工作，需要在 `<svg>` 标签上添加 `xmlns:xlink` 属性。    

### 其他基础图形

使用 `<polyline>` 元素来绘制耳朵和嘴巴。    

```xml
<circle cx="70" cy="95" r="50" style="stroke: black; fill: none" />
<circle cx="55" cy="80" r="5" stroke="black" fill="#339933" />
<circle cx="85" cy="80" r="5" stroke="black" fill="#339933" />
<g id="whiskers">
  <line x1="75" y1="95" x2="135" y2="85" style="stroke: black;"/>
  <line x1="75" y1="95" x2="135" y2="105" style="stroke: black;"/>
</g>

<use xlink:href="#whiskers" transform="scale(-1,1) translate(-140, 0)" />

<!-- ears -->
<polyline points="108 62, 90 10, 70 45, 50, 10, 32, 62"
  style="stroke: black; fill: none;" />

<!-- mouth -->
<polyline points="35 110, 45 120, 95 120, 105,110"
  style="stroke: black; fill: none;" />
```    

注意 points 中的每个 x,y 对 x 和 y 坐标之间可以用逗号分隔，也可以用空格分隔。    

### 路径

事实上所有的基础图形都是更通用的 `<path>` 元素的简写形式。这个元素用来指定一条路径、或者是直线
或曲线的序列。    

```xml
<!-- ears -->
<polyline points="108 62, 90 10, 70 45, 50, 10, 32, 62"
  style="stroke: black; fill: none" />

<!-- mouth -->
<polyline points="35 110, 45 120, 95 120, 105,110"
  style="stroke: black; fill: none" />

<!-- nose -->
<path d="M 75 90 L 65 90 A 5 10 0 0 0 75 90" style="stroke: black; fill: #ffcccc" />
```     

这条路径可以这么解释：首先移动到 (75,90) 点，然后向 (65,90) 点画一条线，然后画一个椭圆弧，x
方向半径为 5，y 方向半径为 10，最后在 (75,90) 点结束。那中间的 3 个 0 是干嘛的。    

### 文本

`<text>` 元素中，x,y 属性指定了文本的位置，作为结构的一部分。字体族和字体大小是表现的一部分。
不同于其他元素，`<text>` 是一个容器元素。     

```xml
<!-- ears -->
<polyline points="108 62, 90 10, 70 45, 50, 10, 32, 62"
  style="stroke: black; fill: none" />

<!-- mouth -->
<polyline points="35 110, 45 120, 95 120, 105,110"
  style="stroke: black; fill: none" />

<!-- nose -->
<path d="M 75 90 L 65 90 A 5 10 0 0 0 75 90" style="stroke: black; fill: #ffcccc" />

<text x="60" y="165" style="font-family: sans-serif; font-size: 14pt; stroke:none; fill: black;">
Cat
</text>
```     

# Chapter 2. Using SVG in Web Pages

## 将 SVG 作为一张图片

SVG 是一种图像格式，因此它可以像其他图片那样用相同的方式插入到 HTML 页面中。这里提供两种方式：
使用 `<img>` 元素（当图片是页面基础内容的一部分时推荐这样做）；或者可以将图片插入到另一个元素
的CSS 样式属性中（当图片只是起装饰作用时推荐这样做）。     

这两种方法都有相同的限制，即图像会与页面分开渲染，两者之间是无法通信的，图像只是作为一个普通图片存在。
页面上的样式无法对 SVG 产生影响，脚本也无法修改 SVG 内部的任何结构。    

### 将 SVG 内联到 &lt;img&gt; 元素中

`<img src="cat.svg" title="cat image" alt="stick figure of a cat" />`    

对于光栅图片来说，图片内在尺寸是以像素为单位的。对于 SVG 来说就比较复杂了：    

+ 如果 SVG 文件中的根 `<svg>` 元素有明确的宽高属性，那么就用这个属性作为图片的内在尺寸。
+ 如果只指定了宽或高中的一个，同时 `<svg>` 有一个 `viewBox` 属性，那么`viewBox` 会用来计算
宽高比，图片可能会缩放到对应的尺寸。
+ 如果 `<svg>` 有 `viewBox` 属性，但是没设置任何尺寸，那么 `viewBox` 的宽高部分会用作像素的
长度使用。
+ 如果最后 `<img>` 和 `<svg>` 都没有提供任何尺寸信息，那就按浏览器默认的 300 * 150 显示    

### 将 SVG 内联到 CSS 中

很多 CSS 样式属性接收一个图片的 URL 作为样式值。最常用的是 `background-image`。    

这里处理尺寸的问题与上一节是一致的，除了当 `<svg>` 没有提供任何尺寸信息的时候，图片会被缩放
到于元素一样大。当然也可以使用 `background-size` 属性来明确设置。    

## SVG 作为一个应用

`<object>`元素是一种通用的内嵌外部文件到 HTML 文档中的方式。`<object>` 的 `type` 属性指明了
我们想要内嵌文件的类型。必须是一个有效的 MIME 类型，对于 SVG 来说就是 `type="image/svg+xml"`。     

浏览器根据文件的类型来决定如何展示文件，文件的位置由 `data` 属性说明。   

`object` 元素必须有一个开标签和一个闭合标签，也就说不能是自闭合的标签。两个标签中间的内容会在对象
无法展示的情况下显示出来。    

```html
<object data="cat.svg" type="image/svg+xml">
  <p>No SVG support!Here's a substitute</p>
  <img src="cat.png" />
</object>
```    

> 关于 `<embed>`
在引入 `<object>` 元素之前，浏览器使用的是非标准的 `<embed>` 元素来做相同的用途，最后这个
元素也被引入到了标准中。在大多数情况下，两者的使用方式上差别不大。  
需要注意的两点就是，首先 `<embed>` 使用 `src` 指明文件的位置，其次，`<embed>` 是自闭合标签，
没有提供回退机制。    

使用 `<embed>` 或 `<object>` 内嵌 SVG 的渲染方式与上一节使用图片渲染的方式类似，使用同样的
计算尺寸的方法。然而，使用这两个元素内嵌的方式，页面的脚本是可以和 SVG 对象交互的。    

## 在混合文档中使用 SVG 标签

如果我们将 SVG 内嵌到 HTML 文档内部的话，那么不管是样式还是脚本都可以与 SVG 进行交互了。    

### SVG 中的外部对象

一种把 SVG 内嵌到 HTML 文档中的方式是使用 `<foreignObject>` 元素，这个元素定义了一个矩形
区域，浏览器应该在这个区域中绘制子 XML 内容。子内容通常是 XHTML 代码，但其实可以是任意 SVG 查看
器可以展示 XML 内容。    

这个矩形绘制区域是由 x, y, width 和 height 属性定义的。    

这个矩形是在本地 SVG 坐标系统中计算的，因此需要进行坐标系转换或者其他的 SVG 效果。    

这个先暂时跳过。    

### 在 XHTML 或 HTML5 中内联 SVG

另一种在 XHTML 中混合 SVG 的方式是在页面内包含 SVG 标签，当然在 HTML5 文档中也可以这样做。    

如果是在 XHTML 中，我们可能必须要在根 `<svg>` 上设置 SVG 的命名空间，不过在 HTML5 中可以
跳过这一步。      

默认情况下 SVG 是使用 inline 的摆放模式的，就是 `display: inline`，尺寸是基于 `<svg>` 元素
上的宽高属性。当然我们可以使用 CSS 修改，其他的 display,margin 等等也都可以通过 CSS 修改。    

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <title>SVG in HTML</title>
  <style>
    svg {
      display: block;
      width: 500px;
      height: 500px;
      margin: auto;
      border: thick double navy;
      background: lightblue;
    }

    body {
      font-family: cursive;
    }

    circle {
      fill: lavender;
      stroke: navy;
      stroke-width: 5;
    }
  </style>
</head>
<body>
  <h1>Inline SVG in HTML Demo Page</h1>
  <svg viewBox="0 0 250 250" xmlns="http://www.w3.org/2000/svg">
    <title>An SVG circle</title>
    <circle cx="125" cy="125" r="100" />
    <text x="125" y="125" dy="0.5em" text-anchor="middle">
      Look Ma, Same Font!
    </text>
  </svg>
  <p>And here is regular HTML again...</p>
</body>
</html>
```     

# Chapter 3. Coordinates

SVG 的世界其实是一块无限大的画布。本章将介绍如何告诉 SVG 查看器我们对这块画布的哪一部分感兴趣，
其尺寸是多少，如果定位这个区域中的点。    

## 视口 Viewport

我们文档想要使用的那部分画布区域称为 **视口**。通过 `<svg>` 元素的 width 和 height 尺寸设置
视口的尺寸。如果这两个属性值是数字，那么默认单位是像素。如果想要设置别的单位，就必须提供单位，支持
的单位如下：    

+ em.默认字体的字体大小尺寸
+ ex.字符 x 的高度
+ px
+ pt.(1/72 inch)
+ pc.(1/6 inch)
+ cm.厘米
+ mm.毫米
+ in.inches      

同时这两个属性也可能是一个百分比值。当这个 `<svg>` 元素是嵌入到另一个 `<svg>` 元素里时。百分比
就是根据元素计算的。如果 `<svg>` 自身是根元素，百分比就是相对于窗口。     

## 使用默认的用户坐标系

查看器会默认建立一个坐标系统，左上角是原点。这个坐标系统是一个纯几何系统；点既没有宽度也没有高度，
网格线被认为是无线窄的。     

下面的例子建立了一个宽高各 200px 的视口:    

```xml
<svg width="200" height="200">
  <rect x="10" y="10" width="50" height="30" style="stroke: black; fill: none;" />
</svg>
```    

## 为一个视口指定用户坐标系

目前h为止，所有我们未声明单位的数值的单位都默认是像素，但有时这可能不是我们想要的。例如，我们
想要设置一个坐标系统，里面每个单位长度是 1/16 cm。在这样的系统中，一个 40 * 40 的小方块，
每条边长 2.5 cm。     

为了实现这样的效果，需要设置 `<svg>` 的 `viewBox` 属性。这个属性值包含 4 个数值，分别代表
我们想要视口上叠加的用户坐标系的最小 x 坐标，最小 y 坐标，宽度和高度。   

所以要在一个 4cm * 5cm 的图纸上建立一个以 1/16cm 为单位大小的坐标系统，应该这样设置 svg 元素：   

`<svg width="4cm" height="5cm" viewBox="0 0 64 80">`     

`viewBox` 属性中的数值可以用逗号或者空格分隔。如果宽或高是 0，那么不会展示任何图形。如果指定了
负值的宽高会引发错误。     

## 保持宽高比

之前的例子总，视口和 viewBox 的宽高比是相同的 (4/5 = 64/80)。但是例如下面的例子中视口的宽高
比和 viewBox 的宽高比不一致会出现什么情况？    

`<svg width="45px" height="135px" viewBox="0 0 90 90">`    

这时 SVG 有三种方式来处理这种情况：   

+ 根据较小的尺寸均匀地缩放图形，使图形完全适合视口。在上面的例子，一张图片宽高会缩放一半。话说看不懂
这里啊，缩放什么了，图形是什么，是坐标系统还是 SVG 的图形，图片为什么又是同时缩放一半。
+ 根据较大的尺寸均匀地缩放图形，并切掉位于视口外的部分。在上面的例子中，图片会原始宽高的 1.5 倍。
+ 拉伸并压缩画布，使其精确地适合新视口。      

在第一种情况中，因为图形在一个方向上要小于视口，我们必须指出在哪里放置图形。在这个例子中，图形会
均匀地缩放到 45px 的宽高。缩小后的图形完全契合视口的宽度，但是现在必须确定图形是与 135px 高的视口
的顶部、中部还是底部对齐。    

在第二种情况中，因为图形在一个方向上要大于视口，我们必须指明要将哪一部分切割掉。在这个例子
中，图形会均匀地缩放到 135px 的宽高。现在图形的高度完美契合视口，但这时必须决定是要把右边、
左边、还是两边的边缘切掉来契合 45px 的视口宽。    

### 为 preserveAspectRatio 指定对齐方式

`preserveAspectRatio` 属性让我们可以指定被缩放的图形关于视口的对齐方式，以及是希望它
meet 边缘还是切掉。     

`preserveAspectRatio = "alignment [meet | slice]"`     

`alignment` 声明了轴及其位置，其取值是下表中的某一项。对齐声明符通过将 x 和 y 轴的对齐
方式连接起来形成最终结果，对齐方式包含 `min, mid, max`。默认值是 `xMidYMid meet`.    

> y 对齐方式是用大写字符开头。    

![preserveAspectRatio](https://raw.githubusercontent.com/temple-deng/markdown-images/master/svg/preserveAspectRatio.png)    

### 使用 meet 声明符

```xml
<svg preserveAspectRatio="xMinYMin meet" viewBox="0 0 90 90"
  width="45" height="135">
</svg>

<svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 90 90"
  width="45" height="135">
</svg>

<svg preserveAspectRatio="xMaxYMax meet" viewBox="0 0 90 90"
  width="45" height="135">
</svg>

<svg preserveAspectRatio="xMinYMin meet" viewBox="0 0 90 90"
  width="135" height="45">
</svg>

<svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 90 90"
  width="135" height="45">
</svg>

<svg preserveAspectRatio="xMaxYMax meet" viewBox="0 0 90 90"
  width="135" height="45">
</svg>
```   

![meet](https://raw.githubusercontent.com/temple-deng/markdown-images/master/svg/meet.png)   

看意思就是，在宽高比不一致的情况，有 3 种方案，第一种是把 viewBox 缩小，来让整体都放入
视口中，但是很明显由于宽高不一致，如果一个方向上正好与视口边契合的话，另一个方向肯定会有
留白，这是 meet 的处理方式。    

另一种就是把 viewBox 放大，来让整体都覆盖住视口，那这样的话，肯定要有一个方向上的内容在
视口中放不下，那就必须决定如何剪裁，这是 slice 的处理方式。    

### 使用 slice 声明符

```xml
<svg preserveAspectRatio="xMinYMin slice" viewBox="0 0 90 90"
  width="45" height="135">
</svg>

<svg preserveAspectRatio="xMidYMid slice" viewBox="0 0 90 90"
  width="45" height="135">
</svg>

<svg preserveAspectRatio="xMaxYMax slice" viewBox="0 0 90 90"
  width="45" height="135">
</svg>

<svg preserveAspectRatio="xMinYMin slice" viewBox="0 0 90 90"
  width="135" height="45">
</svg>

<svg preserveAspectRatio="xMidYMid slice" viewBox="0 0 90 90"
  width="135" height="45">
</svg>

<svg preserveAspectRatio="xMaxYMax slice" viewBox="0 0 90 90"
  width="135" height="45">
</svg>
```   

![slice](https://raw.githubusercontent.com/temple-deng/markdown-images/master/svg/slice.png)   

### 使用 none 声明符

none 情况下，viewBox 被不均匀的缩放，来让整个 viewBox 正好契合视口。    

```xml
<svg preserveAspectRatio="none" viewBox="0 0 90 90"
  width="45" height="135">
</svg>

<svg preserveAspectRatio="none" viewBox="0 0 90 90"
  width="135" height="45">
</svg>
```   

![none](https://raw.githubusercontent.com/temple-deng/markdown-images/master/svg/none.png)   

## 内嵌的坐标系统

我们可以在任何时刻把另一个 `<svg>` 元素放置到文档中来建立一个新的视口和坐标系统。    


# Chapter 4. 基础图形

本章介绍我们绘制过程中常用的几种基础图形：直线、矩形、多边形、圆和椭圆。    

## 直线

在 SVG 中使用 `<line>` 元素绘制一条直线。只要指定线段的两个端点坐标即可。   

`<line x1="start-x" y1="start-y" x2="end-x" y2="end-y" />`    

## 描边特性

线宽、线的颜色、线的样式都是线的表现。因此这些特性都可以在 `style` 属性中声明。    

### stroke-width

```xml
<line x1="10" y1="30" x2="80" y2="10"
  style="stroke-width: 10; stroke:black;" />
```    

### stroke-color

可以使用多种方式来声明线的颜色：   

+ 使用关键字：`black, blue, white` 等
+ 6 位的十六进制数字形式：`#rrggbb`
+ 3 位的十六进制数字形式：`rgb`
+ `rgb(red, green, blue)` 函数，每个值可以是 0-255 的整数，或者是百分比
+ 关键字 `currentColor`，使用元素的CSS color 属性的计算值   

```xml
<line x1="10" y1="20" x2="50" y2="20"
  style="stroke: red; stroke-width: 5;" />
<line x1="10" y1="30" x2="50" y2="30"
  style="stroke: #9f9; stroke-width: 5;" />
<line x1="10" y1="40" x2="50" y2="40"
  style="stroke: #9999ff; stroke-width: 5;" />
<line x1="10" y1="50" x2="50" y2="50"
  style="stroke: rgb(255, 127, 64); stroke-width: 5;" />
```    


### stroke-opacity

```xml
<line x1="10" y1="20" x2="50" y2="20"
  style="stroke-opacity: 0.4; stroke: red; stroke-width: 5;" />
```    

### stroke-dasharray 属性

如果我们需要虚线的时候，可以使用 `stroke-dasharray` 属性，这个属性的值是一个数字列表，
数字之间用逗号或空格分隔，这些数字指定了虚线的长度和间隙的长度。这个列表应该是有偶数个数字，
如果我们写了奇数个，那么 SVG 会将列表重复一遍，以形成偶数个数值。    

```xml
<!-- 9px 的线，5px 的间距 -->
<line x1="10" y1="10" x2="100" y2="10"
  style="stroke-dasharray: 9, 5;" />
<!-- 5px 的线，3px 的间距，9px 的线，2px 的间距 -->
<line x1="10" y1="20" x2="100" y2="20"
  style="stroke-dasharray: 9, 5;" />
```    

## 矩形

如果不指定矩形的填充颜色则默认是黑色，这和描边颜色不一样，如果不指定描边颜色，默认是 none。填充
颜色的声明方式和上节描边颜色的声明方式一致，注意设置为 `none` 的话会不填充任何颜色，也就是透明的。
`fill-opacity` 和上节的 `stroke-opacity` 也一致。    


```xml
<!-- 黑色填充，无描边 -->
<rect x="10" y="10" width="30" height="30" />
<!-- 无填充，黑色描边 -->
<rect x="50" y="50" width="30" height="30"
  style="fill: none; stroke: black;" />

<rect x="100" y="100" width="30" height="30"
  style="fill: yellow; fill-opacity: 0.5;
    stroke: green; stroke-width: 2; stroke-dasharray: 5 2;" />
```     

注意描边线其实是一半在图形内部，一半在图形外部，内部的描边线可能和填充重合。    

如果省略了 x 或 y 的值，默认是 0.如果 width 或 height 的值声明为 0，则矩形不会展示，提供负值
会导致错误。    

### 圆角矩形

可以指定圆角的 x 半径和 y 半径来形成圆角矩形，这两个半径的最大值分别是一半的宽或高。如果我们只
声明了 rx 或 ry 中的一个，就假设两个是相等的。    

```xml
<rect x="10" y="60" width="20" height="40" rx="10" ry="5"
  style="stroke: black; fill: none;" />
```   

**Note:** rx 和 ry 也可以使用百分比，但是这里百分比的基数是视口的宽或高，而不是矩形本身的宽或
高，这与在矩形 width 和 height 中使用百分比是一致的。    

## 圆形和椭圆

与矩形类型，没指明 fill 和 stroke 的情况下，一个是 black 一个是 none。    

不管是圆还是椭圆，如果省略了 cx, cy，默认就都是 0，如果半径是 0，那么图形就不展示了，负值会出错。    

```xml
<circle cx="30" cy="30" r="20" />
<ellipse cx="30" cy="80" rx="10" ry="20" />
```    

## 多边形 &lt;polygon&gt; 元素

`<polygon>` 可以用来绘制任意的封闭图形。我们通过声明一系列点来围成要被填充的图形。`points`
属性包括一系列 x,y 坐标对，用逗号或空格分隔。没必要必须返回到起始点，图形会自己封闭。    

```xml
<polygon points="15, 10 55, 10, 45, 20, 5, 20" />
<polygon points="60 60, 65 72, 80 60, 90 90, 72 80, 72 85, 50 95" />
```    

### 决定点属于多边形内部还是外部

有时候当多边形比较复杂的时候，很难区别出一个点到底是在图形的外部还是内部，这会影响到这一块区域究竟
要不要填充。其实这个问题在 canvas 中也有。   

SVG 有两种不同的规则来决定一个点是处于多边形内还是外。`fill-rule` 有两个可选值 `nonzero` 或
`evenodd`，默认是 `nonzero`。取决与我们设定的规则，我们会得到不同的效果。   

```xml
<polygon style="fill-rule: nonzero; fill: yellow; stroke: black;"
  points="48 16, 16 96, 96 48, 0 48, 80 96" />
<polygon style="fill-rule: evenodd; fill: #0f0; stroke: black;"
  points="148 16, 116 96, 196 48, 100 48, 180 96" />
```    

![effect-of-fillrules](https://raw.githubusercontent.com/temple-deng/markdown-images/master/svg/effect-of-fillrules.png)   

## &lt;polyline&gt; 元素

`<polyline>` 与 `<polygon>` 类似，但是不闭合。    

## Line Caps 和 Line Joins

`stroke-linecap` 可选值 `butt, round, square`。默认是 butt。round 和 square 都会超出
端点，好像在 canvas 里面，round 的半径是线宽的一半，square也是多出线宽的一半，估计这里也一样。    

`stroke-linejoin` 可选值 `miter, round, bevel`。    

还有一个 `stroke-miterlimit` 属性用来控制 miter。     

# Chapter 5. 文档结构

## 结构与表现

XML 目标是提供一种方式来我们结构化一组数据并将其与其视觉表现分离出来。结构，最终会告诉我们图形
是什么。    

## 在 SVG 中使用样式

SVG 允许使用 4 种方式来指定图形的表现层面内容：内联样式、内部样式表、外部样式表以及表现属性。    

### 内联样式

没错，就是使用 style 属性。    

### 内部样式表

样式表在一个 `<defs>` 元素内，内联样式可以覆盖样式表的内容，与 HTML 一致。    

```xml
<defs>
  <style type="text/css"><![CDATA[
    circle {
      fill: #ffc;
      stroke: blue;
      stroke-width: 2;
      stroke-dasharray: 5 3
    }
  ]]>
  </style>
</defs>
```    

注意测试的时候即便把 CDATA 这些内容移除，也还是能正常显示，尚不清楚是查看器做的防错兼容，还是本来
就没必要。   

### 外部样式表

外部样式表的例子：   

```css
* {
  fill: none;
  stroke: black;
}

rect {
  stroke-dasharray: 7 3;
}

circle.yellow {
  fill: yellow;
}

.thick {
  stroke-width: 5;
}

.semiblue {
  fill: blue;
  fill-opacity: 0.5;
}
```     

```xml
<?xml version="1.0"?>
<?xml-stylesheet href="ext_style.css" type="text/css"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg"
width="200px" height="200px" viewBox="0 0 200 200">
  <line x1="10" y1="10" x2="40" y2="10"/>
  <rect x="10" y="20" width="40" height="30"/>
  <circle class="yellow" cx="70" cy="20" r="10"/>
  <polygon class="thick" points="60 50, 60 80, 90 80"/>
  <polygon class="thick semiblue"
  points="100 30, 150 30, 150 50, 130 50"/>
</svg>
```    

### 表现属性

SVG 允许我们把表现信息写在表现属性中：   

```xml
<circle cx="10" cy="10" r="5" fill="red" stroke="black" stroke-width="2" />
```    

表现属性的优先级是最低的，意味着任何内联、内部样式表、外部样式表都可能把表现属性的样式覆盖掉。    

## 分组及引用对象

### &lt;g&gt; 元素

`<g>` 将其所有子元素分到一个组里，然后通过一个 `id` 熟悉来给这个分组一个独一无二的名字。每个分组
都可以有其自己的 `<title>` 和 `<desc>` 来提供补充说明。许多 SVG 的查看器都会在我们 hover 或者
tap 一个分组的时候，弹出一个 tooltip 来显示 title 元素的内容。其实主要是无障碍的辅助。    

`<g>` 的一个优点是，我们写在 `<g>` 元素上的 style 样式是应用到其所有子元素上：   

```xml
<g id="house" style="fill: none; stroke: black;">
  <desc>House with door</desc>
  <rect x="6" y="50" width="60" height="60" />
  <polyine points="6 50, 36 9, 66 50" />
</g>
```      

### &lt;use&gt; 元素

一些复杂的图形通常会包括一些元素的重复。`<use>` 让我们有了一种类似复制——粘贴的能力，可以针对
分组对象以及任意的独立图形元素使用。     

如果想要复用一个分组对象，在 `<use>` 元素的 `xlink:href` 属性中声明分组对象的 URI，以及
指定分组对象的原点要移动到哪里的 x,y 坐标。    

```xml
<use xlink:xhref="#house" x="70" y="100" />
```    

### &lt;defs&gt; 元素

总结一下之前的例子中出现的一些缺点：   

+ 当我们想要重用一个分组时，我们可能需要首先计算一下其在本身分组中的位置，才能计算出我们现在想要
如何摆放它。
+ `fill` 和 `stroke` 是在原始分组上声明的，而我们的 `<use>` 元素无法覆盖这个样式。     

`<defs>` 元素就是用来解决这些问题的。如果把分组对象放置到 `<defs>` 标签中，其实就是告诉 SVG
我们定义这些对象，但是在这里不要显示对象。   

```xml
<svg width="240px" height="240px" viewBox="0 0 240 240" 
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <g id="house" style="stroke: black;">
      <desc>House with door</desc>>
      <rect x="0" y="41" width="60" height="60" />
      <polyline points="0 41, 30 0, 60 41" />
      <polyline points="30 101, 30 71, 44 71, 44 101" />
    </g>

    <g id="man" style="fill: none; stroke: black;">
      <desc>Male stick figure</desc>>
      <circle cx="10" cy="10" r="10" />
      <line x1="10" y1="20" x2="10" y2="44" />
      <polyline points="1 58, 10 44, 19 58" />
      <polyline points="1 24, 10 30, 19 24" />
    </g>

    <g id="woman" style="fill: none; stroke: black;">
      <desc>Female stick figure</desc>>
      <circle cx="10" cy="10" r="10" />
      <polyline points="10 20, 10 34, 0 44, 20 44, 10 34" />
      <line x1="4" y1="58" x2="8" y2="44" />
      <line x1="12" y1="44" x2="16" y2="58" />
      <polyline points="1 24, 10 30, 19 24" />
    </g>

    <g id="couple">
      <desc>Male and female stick figures</desc>
      <use xlink:href="#man" x="0" y="0" />
      <use xlink:href="#woman" x="25" y="0" />
    </g>
  </defs>

  <use xlink:href="#house" x="0" y="0" style="fill: #cfc;" />
  <use xlink:href="#couple" x="70" y="40" />

  <use xlink:href="#house" x="120" y="0" style="fill: #99f;" />
  <use xlink:href="#couple" x="190" y="40" />

  <use xlink:href="#woman" x="0" y="145" />
  <use xlink:href="#man" x="25" y="145" />
  <use xlink:href="#house" x="65" y="105" style="fill: #c00;" />
</svg>
```    

### &lt;symbol&gt; 元素

`<symbol>` 元素提供了另一种分组元素的方式，但是不同于 `<g>` 元素，`<symbol>` 从来不是展示。
symbol 还可以指定 `viewBox`和 `preserveAspectRatio` 属性，允许我们在有 width, height
的 `<use>` 元素建立的视口中进行调整。    

```xml
<svg width="200px" height="200px" viewBox="0 0 200 200"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink">
  <title>
    Symbol vs. groups
  </title>
  <desc>Use</desc>>

  <defs>
    <g id="octagon" style="stroke: black;">
     <desc>Octagon as group</desc>>
      <polygon points="
        36 25, 25 36, 11 36, 0 25, 0 11, 11 0, 25 0, 36 11" />
    </g>

    <symbol id="sym-octagon" style="stroke: black;"
      preserveAspectRatio="xMidYMid slice" viewBox="0 0 40 40">
      <desc>Octagon as symbol</desc>>
      <polygon points="
        36 25, 25 36, 11 36, 0 25,
        0 11, 11 0, 25 0, 36 11" />
    </symbol>
  </defs>

  <g style="fill: none; stroke: gray">
    <rect x="40" y="40" width="30" height="30" />
    <rect x="80" y="40" width="40" height="60" />
    <rect x="40" y="110" width="30" height="30" />
    <rect x="80" y="110" width="40" height="60" />
  </g>
  <use xlink:href="#octagon" x="40" y="40" width="30" height="30" 
    style="fill: #c00;" />
  <use xlink:href="#octagon" x="80" y="40" width="40" height="60"
    style="fill: #cc0;" />
  <use xlink:href="#sym-octagon" x="40" y="110" width="30" height="30"
    style="fill: #cfc;" />
  <use xlink:href="#sym-octagon" x="80" y="110" width="40" height="60"
    style="fill: #699;" />
</svg>
```   

注意如果 `<use>` 使用的是 `<g>` 声明的分组，那么其实 width 和 height 属性被忽略掉了。   

### &lt;image&gt; 元素

我们可以在 `<image>` 中引入一个 SVG 或者一个光栅图片。如果是一个 SVG 图片，则 x, y, width,
height 会绘制被引用文件的视口，如果是光栅图片，则图片会进行缩放到这个矩形所指定的区域中。    

`<image>` 元素也有 `preserveAspectRatio` 属性来指明图形如何契合这个元素。默认是 `xMidYMid meet`。
如果我们引用的是一个 SVG 文件，那么还可以在最前方加一个 `defer` 关键字 `defer xMidYMid meet`，
这样的话，如果这个 SVG 自身有 `preserveAspectRatio` 属性，那就用它自己的。        

# Chapter 6. 坐标系变换

## translate 变换

```xml
<g id="square">
  <rect x="0" y="0" width="20" height="20"
    style="fill: none; stroke: black;" />
</g>
<use xlink:href="#square" transform="translate(50, 50)" />
```    

`translate` 事实上并不是移动了矩形元素，其实它是把画布上的整个网格移动到了新位置（其实就是整个
坐标系统移动了吧）。其实此时，矩形还是绘制在网格新位置的左上角。    

**Note:** `transform` 变换从不会改变一个图形对象的网格坐标，相反，它改变的是整个画布上的网格。    

## scale 变换

```
transform="scale(value)"   // x, y 都缩放 value 倍
transform="scale(x-value, y-value)"
```    

```xml
<g id="square">
  <rect x="10" y="10" width="20" height="20"
    style="fill: none; stroke: black;" />
</g>
<use xlink:href="#square" transform="scale(2)" />
```    

除了给 `<use>` 元素设置 `transform` 属性，分组 `<g>` 以及其他的基本图形元素也都可以使用
`transform` 元素。     

## 变换序列

各个变换之间可以用空格或逗号分隔。    

## rotate 变换

旋转中心默认是 (0,0) 点。在第二种形式的 rotate 中，我们可以声明旋转的基准点：   

`rotate(angle, centerX, centerY)`    

## 根据中心点进行缩放

虽然有办法修改旋转的基准点，但是没有办法修改缩放的基准点。不过如果想要围绕中心进行缩放，可以这样
做：   

```
translate(-centerX*(factor-1), -centerY*(factor-1))
scale(factor)
```    

## skewX 和 skewY 变换

`skewX(angle)` 变换会将 x 轴”推动“指定的角度，但 y 轴不变，`skewY(angle)` 会把 y 轴转
指定的角度，x 轴不动。     

