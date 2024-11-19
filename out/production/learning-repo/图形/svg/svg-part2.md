# SVG part2

<!-- TOC -->

- [SVG part2](#svg-part2)
- [Chapter 7. 路径](#chapter-7-路径)
  - [moveto, lineto 和 closepath](#moveto-lineto-和-closepath)
  - [相对 moveto 和 lineto](#相对-moveto-和-lineto)
  - [路径简写](#路径简写)
    - [水平 lineto 和垂直 lineto](#水平-lineto-和垂直-lineto)
    - [其他的一些简写](#其他的一些简写)
  - [圆弧](#圆弧)
  - [贝塞尔曲线](#贝塞尔曲线)
  - [&lg;marker&gt; 元素](#lgmarkergt-元素)
  - [marker 杂记](#marker-杂记)
- [Chapter 8. Patterns 和 Gradients](#chapter-8-patterns-和-gradients)
  - [Patterns](#patterns)
    - [patternUnits](#patternunits)
    - [patternContentUnits](#patterncontentunits)
    - [嵌套 pattern](#嵌套-pattern)
  - [渐变](#渐变)
    - [线性渐变](#线性渐变)
  - [径向渐变](#径向渐变)
  - [变换模式和渐变](#变换模式和渐变)
- [Chapter 9. Text](#chapter-9-text)
  - [文本的术语](#文本的术语)
  - [&lt;text&gt; 元素的简单的属性](#lttextgt-元素的简单的属性)
  - [文本对齐](#文本对齐)
  - [&lt;tspan&gt;元素](#lttspangt元素)
  - [设置 textLength](#设置-textlength)
  - [垂直文本](#垂直文本)
  - [Internationalization](#internationalization)
    - [&lt;switch&gt; 元素](#ltswitchgt-元素)
    - [使用定制字体](#使用定制字体)
  - [路径上文本](#路径上文本)
  - [文本中的空白](#文本中的空白)
- [Chapter 10. 裁切和遮罩](#chapter-10-裁切和遮罩)
  - [Clipping to a Path](#clipping-to-a-path)
  - [遮罩 Masking](#遮罩-masking)
- [第 11 章 滤镜](#第-11-章-滤镜)
  - [滤镜的工作原理](#滤镜的工作原理)
  - [创建一个 drop shadow](#创建一个-drop-shadow)
    - [建立滤镜的边界](#建立滤镜的边界)
    - [为 drop shadow 使用 &lt;feGaussianBlur&gt;](#为-drop-shadow-使用-ltfegaussianblurgt)
    - [storing, chaining, 和 merging 滤镜结果](#storing-chaining-和-merging-滤镜结果)
  - [创建一个 glowing shadow](#创建一个-glowing-shadow)
    - [&lt;feColorMatrix&gt; 元素](#ltfecolormatrixgt-元素)
  - [&lt;feImage&gt; 滤镜](#ltfeimagegt-滤镜)
  - [&lt;feComponentTransfer&gt; 元素](#ltfecomponenttransfergt-元素)
- [Chapter 12. SVG 动画](#chapter-12-svg-动画)
  - [动画基础](#动画基础)
  - [时间如何测量](#时间如何测量)
  - [动画同步](#动画同步)
  - [重复](#重复)
  - [复杂的动画属性](#复杂的动画属性)
  - [指定多个值](#指定多个值)
  - [多级动画的时间安排](#多级动画的时间安排)
  - [&lt;set&gt; 元素](#ltsetgt-元素)
  - [&lt;animateTransform&gt; 元素](#ltanimatetransformgt-元素)
  - [&lt;animateMotion&gt; 元素](#ltanimatemotiongt-元素)
  - [使用 CSS 动画](#使用-css-动画)
- [Chapter 13. 添加交互](#chapter-13-添加交互)
  - [在 SVG 中使用链接](#在-svg-中使用链接)
  - [用户触发的 SMIL 动画](#用户触发的-smil-动画)
  - [脚本化 SVG](#脚本化-svg)
    - [时间概览](#时间概览)
- [Chapter 14. 使用 SVG DOM](#chapter-14-使用-svg-dom)
  - [确定元素的属性值](#确定元素的属性值)
  - [SVG 接口方法](#svg-接口方法)
- [XML 介绍](#xml-介绍)

<!-- /TOC -->

# Chapter 7. 路径

事实上第 4 章中所有的基础图形都是 `<path>` 元素的一种简写。它通过指定一系列的线、弧线和曲线来
绘制任意形状的轮廓。这些路径（以及基础图形）可以用来定义剪裁区域或者遮罩区域的轮廓。    

所有的路径数据都包括一个单字符的指令，例如 M 代表 moveto，后面跟着各个命令的坐标信息。    

## moveto, lineto 和 closepath

每条路径都是 moveto 命令开始的。    

命令字符是 M，后面跟着 x,y 坐标。    

lineto 命令字符为 L, 后面跟着 x,y 坐标。

闭合路径 closepath 命令字符 Z。    

注意使用 closepath 路径闭合图形，以及手动将结尾点引回到起始点闭合路径有一点小小的不同，就是在
闭合的那个点上，closepath 是完全封闭住的，而手动封闭可能会有缺口。    

```xml
<g style="stroke: gray; stroke-width: 8; fill: none;">
  <path d="M 10 10 L 40 10 L 40 30 L 10 30 L 10 10" />
  <path d="M 60 10 L 90 10 L 90 30 L 60 30 Z" />
</g>
```     

![result-of-stroke-and-closepath](https://raw.githubusercontent.com/temple-deng/markdown-images/master/svg/result-of-stroke-and-closepath.png)   


## 相对 moveto 和 lineto

之前的例子中，命令都是大写字符，坐标都是被解释为绝对坐标。如果使用小写命令字符的话，那么坐标就
被解释为相对于当前笔头位置的。不过如果路径的第一个字符是 m，它还是被解释为绝对路径。    

## 路径简写

### 水平 lineto 和垂直 lineto

`H` 或 `h` 后面跟一个 x 坐标，`V` 或 `v` 命令后面跟一个 y 坐标。     

### 其他的一些简写

可以在 `L` 或 `l` 后面跟多个坐标对，就像 `<polyline>` 元素。     

## 圆弧

画一条圆弧首先我们需要知道椭圆的 x,y 半径。这样我们就可以把椭圆的位置定下来，一共可能有两个椭圆。
而这两个椭圆能形成的连接指定弧线两点的弧线有 4 条:2 条顺时针，2条逆时针。两条弧度大于180度，
两条弧度小于 180 度。    

然而光有这些信息还不够，因为坐标系统是可能旋转的。如果坐标系统旋转了，那么椭圆的位置就不是这样的了。    

![elliptical-arc-commands](https://raw.githubusercontent.com/temple-deng/markdown-images/master/svg/elliptical-arc-commands.png)     

圆弧命令为 `A` 或 `a`，参数有以下 7 个：   

+ 椭圆的 x, y 半径
+ 椭圆的 x 轴方向旋转角度 x-axis-rotation
+ large-arc-flag, 0 指小于 180 度那条弧，1 指大于 180 度那条弧
+ sweep-flag，0 代表逆时针的弧，1代表顺指针的弧
+ 弧线结束点的 x,y 坐标     

## 贝塞尔曲线

二次贝塞尔曲线的命令是 `Q` 或 `q`，后面跟两个点的坐标，控制点和终点。    

平滑贝塞尔曲线命令 `T` 或 `t`，后面跟着下一条取消的终点，控制点会自动计算出来。    

`<path d="M 30 100 Q 80 30, 100 100 T 200 80" />`     

三次贝塞尔曲线命令 `C` 或 `c`，后面跟三个点坐标，一个起始点的控制点，一个终点的控制点，和终点。    

三次平滑贝塞尔曲线命令 `S` 或 `s` 后面跟两个点坐标，第二条曲线终点的控制点和终点。    

## &lg;marker&gt; 元素

首先我们使用如下方式画一个圆角：    

```xml
<path d="M 10 20 100 20 A 20 30 0 0 1 120 50 L 120 110"
  style="fill: none; stroke: black;" />
```   

假设你想通过在开头放一个圆圈，在末端放一个实心三角形，在其他顶点放置箭头来标记路径的方向，我们需要
构造三个 `<marker>` 元素，并让 `<path>` 来引用它们。     

一个 marker 是一个自包含的图形，意味着它有它自己的坐标系统，所以我们必须声明 `markerWidth` 
和 `markerHeight` 来规定其坐标系大小。其子元素均绘制在 marker 的坐标系统中。marker 元素不会
展示。      

```xml
<defs>
  <marker id="mCircle" markerWidth="10" markerHeight="10">
    <circle cx="5" cy="5" r="4" style="fill: none; stroke: black;" />
  </marker>
</defs>

<path d="M 10 20 100 20, A 20 30 0 0 1 120 50, L 120 110"
  style="marker-start: url(#mCircle); fill: none; stroke: black;" />
```    

![misplaced-circular-marker](https://raw.githubusercontent.com/temple-deng/markdown-images/master/svg/misplaced-circular-marker.png)          

出现上图的原因是，默认情况下，marker 起始点和路径的起始坐标对齐的。使用 `refX` 和 `refY` 属性
来声明 marker 中的哪个坐标与路径的起始坐标对齐。     

有了这些信息之后，我们就可以使用 `marker-end` 在路径末端在三角形，使用 `marker-mid` 在除了
开头和终点以外的其他定点上绘制箭头。    

```xml
  <defs>
    <marker id="mCircle" markerWidth="10" markerHeight="10" refX="5" refY="5">
      <circle cx="5" cy="5" r="4" style="fill: none; stroke: black;" />
    </marker>

    <marker id="mArrow" markerWidth="4" markerHeight="8" refX="0" refY="4">
      <path d="M 0 0 4 4 0 8" style="fill: none; stroke: black;" />
    </marker>

    <marker id="mTriangle" markerWidth="5" markerHeight="10" refX="5" refY="5">
      <path d="M 0 0 5 5 0 10 Z" style="fill: black;" />
    </marker>
  </defs>

  <path d="M 10 20 100 20 A 20 30 0 0 1 120 50, L 120 110"
    style="marker-start: url(#mCircle);
      marker-mid: url(#mArrow); marker-end: url(#mTriangle); fill: none; stroke: black;" />
```     

到此为止，想要得到我们想要的效果，还需要将 marker 的 `orient` 属性设为 `auto`，这样 marker 会
自动旋转来匹配路径的方向。    

## marker 杂记

如果我们想要在路径开头，中部，结尾都使用同一个 marker，可以直接使用 `marker` 属性。     

同时 marker 也支持设置 viewBox 和 preserveAspectRatio 属性来获得更精细的展示控制。    

# Chapter 8. Patterns 和 Gradients

## Patterns

如果想要使用 pattern，需要定义一个图形对象，其会在水平方向和垂直方向上重复来填满另一个对象（或者
是描边）。这个图形对象叫做砖瓦 tile。     

### patternUnits

为了创建一个 tile，需要将描述我们 tile 的路径元素放入到一个 `<pattern>` 元素中。     

```xml
<svg width="400px" height="400px" viewBox="0 0 400 400"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <pattern id="tile" x="0" y="0" width="20%" height="20%"
      patternUnits="objectBoundingBox">
      <path d="M 0 0 Q 5 20 10 10 T 20 20"
        style="stroke: black; fill: none;" />
      <path d="M 0 0 h20 v 20 h -20 z"
        style="stroke: gray; fill: none;" />
    </pattern>
  </defs>

  <rect x="20" y="20" width="100" height="100"
    style="fill: url(#tile); stroke: black;" />
  <rect x="135" y="20" width="70" height="80"
    style="fill: url(#tile); stroke: black;" />
  <rect x="220" y="20" width="150" height="130"
    style="fill: url(#tile); stroke: black;" />
</svg>
```   

![objectBoudingBox-tiles](https://raw.githubusercontent.com/temple-deng/markdown-images/master/svg/objectBoudingBox-tiles.png)          

除了 objectBoundingBox 外，`patternUnits` 还有另一个可选值 `userSpaceOnUse` 这个其实和
我们常见的平铺行为类似，`width` 和 `height` 是用用户单位表示的 tile 大小。     

```xml
<svg width="400px" height="400px" viewBox="0 0 400 400"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <pattern id="tile" x="0" y="0" width="20" height="20"
      patternUnits="userSpaceOnUse">
      <path d="M 0 0 Q 5 20 10 10 T 20 20"
        style="stroke: black; fill: none;" />
      <path d="M 0 0 h20 v 20 h -20 z"
        style="stroke: gray; fill: none;" />
    </pattern>
  </defs>

  <rect x="20" y="20" width="100" height="100"
    style="fill: url(#tile); stroke: black;" />
  <rect x="135" y="20" width="70" height="80"
    style="fill: url(#tile); stroke: black;" />
  <rect x="220" y="20" width="150" height="130"
    style="fill: url(#tile); stroke: black;" />
</svg>
```    

![userSpaceOnUse-tiles](https://raw.githubusercontent.com/temple-deng/markdown-images/master/svg/userSpaceOnUse-tiles.png)        

中间的那个没对齐是因为它 x 坐标不是 20 的倍数。     

我觉得可以这么理解吧，objectBoundingBox 情况下，首先根据 width 和 height 可以算出 tile 在
两个方向上分别要平铺几次，然后根据使用 tile 的元素尺寸，算出每个绘制 tile 的矩形有多大，比如说
上面第二个，宽 70 高 80，那每个放 tile 的盒子就是 70/5=14 的宽,80/5=16 的高，但是这时候 tile
实际自身的大小并没有声明，我觉得可以认为是无线大，但是这里由于盒子是 14 * 16 的，所以就只展示
出这么大的内容，也不经过任何的缩放来 fit。     

而 userSpaceOnUse 其实相对于用使用 tile 的元素的单位来规定 tile 的大小，比如说如果我们在上面
的例子中将 width 和 height 都设为 30，那么每个 tile 其实就是 30*30 的，不过这里还有个不同点
就是 userSpaceOnUse 中的 x 和 y 其实是在 SVG 整个画布上的位置。    

patternUnits 其实是指定了 tile 在填充或描边时在元素中所占的大小，objectBoundingBox 即指定
每个 tile box 所占的百分比，这个百分比乘以对应元素 x,y 方向上的大小，就得到了每个放置 tile
的盒子的大小，而 userSpaceOnUser 则指定了一个固定的尺寸，这个尺寸的单位应该是与使用 tile 的元素
一致的。但是 patternUnits 并没有指定 tile 自身的大小，以及没有对 tile 进行任何的缩放，它只是
简单的把 tile 的图形放进盒子里，具体 tile 自己的尺寸和缩放是由下面的 patternContentUnits 指定的。   

### patternContentUnits

patternContentUnits也有两个属性：objectBoundingBox和userSpaceOnUse（默认属性值）。     

在userSpaceOnUse模式下，pattern内部元素的大小不会因为pattern的缩放而改变。userSpaceOnUse是patternContentUnits的默认属性值。也就说，pattern 自己是多大，那就是多大，不进行任何的缩放操作。     

而 objectBoundingBox 则会将 pattern 缩放到使用 tile 的元素给 pattern 设置的盒子的尺寸大小。    

也可以指定 `viewBox` 和 `preserveAspectRatio`，`viewBox` 会覆盖掉任何的 `patternContentUnits` 设置。      

### 嵌套 pattern

略。     

## 渐变

### 线性渐变

```xml
<defs>
  <linearGradient id="two_hues">
    <stop offset="0%" style="stop-color: #ffcc00;" />
    <stop offset="100%" style="stop-color: #0099cc;" />
  </linearGradient>
</defs>

<rect x="20" y="20" width="200" height="100"
  style="fill: url(#two_hues); stroke: black;" />
```    

`<stop>` 元素有两个必需的元素：`offset` 和 `stop-color`。offset 可以是一个百分比或者是一个
0-1.0的数。`stop-color` 可以在单独的属性中声明，或者在 style 里声明也行。    

```xml
  <defs>
    <linearGradient id="two_hues">
      <stop offset="33.3%" style="stop-color: #ffcc00;" />
      <stop offset="0%" style="stop-color: #cc6699;" />
      <stop offset="66.6%" style="stop-color: #cc6699;" />
      <stop offset="0%" style="stop-color: #66cc99;" />
    </linearGradient>
  </defs>

  <rect x="20" y="20" width="200" height="100"
    style="fill: url(#two_hues); stroke: black;" />
```    

![gradient-1](https://raw.githubusercontent.com/temple-deng/markdown-images/master/svg/gradient-1.png)        

注意这里我们使用了 CSS 渐变中支持的 0 的写法。而且实现了突变效果。     

还可以声明 `stop-opacity`。注意这个也是渐变的，不过好像只是从上个 stop 点到当前的 stop 这一段
渐变。

默认的渐变方向是从左到右，也就是 0deg 的方向。如果想要指定其他方向，只要指定一对点 x1,y1 和 x2,y2。

```xml
<svg width="400px" height="400px" viewBox="0 0 400 400"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="three_stops">
      <stop offset="0%" style="stop-color: #ffcc00;" />
      <stop offset="33.3%" style="stop-color: #cc6699;" />
      <stop offset="100%" style="stop-color: #66cc99;" />
    </linearGradient>

    <linearGradient id="right_to_left"
      xlink:href="#three_stops"
      x1="100%" y1="0%" x2="0%" y2="0%" />

    <linearGradient id="down"
      xlink:href="#three_stops"
      x1="0%" y1="0%" x2="0%" y2="100%" />
      
    <linearGradient id="up"
      xlink:href="#three_stops"
      x1="0%" y1="100%" x2="0%" y2="0%" />
    
    <linearGradient id="diagonal"
      xlink:href="#three_stops"
      x1="0%" y1="0%" x2="100%" y2="100%" />
  </defs>

  <rect x="40" y="20" width="200" height="40"
    style="fill: url(#three_stops); stroke: black;" />
  <rect x="40" y="70" width="200" height="40" 
    style="fill: url(#right_to_left); stroke: black;" />
  <rect x="250" y="20" width="40" height="200"
    style="fill: url(#down); stroke: black;" />
  <rect x="300" y="20" width="40" height="200"
    style="fill: url(#up); stroke: black;" />
  <rect x="40" y="120" width="200" height="100"
    style="fill: url(#diagonal); stroke: black;" />
</svg>
```    

如果我们不想要当前基于百分比的过渡，其实还是可以设置 `gradientUnits` 为 `userSpaceOnUse` 
来改变这种情况，这时渐变的起终点是 SVG 画布上的坐标。默认是 objectBoundingBox。    

我们有时可能只希望指出渐变位于元素中的一部分区域内，而不是铺满整个元素，这时空白的地方的表现
由 `spreadMethod` 属性指定：   

+ pad。开始颜色和终止颜色会扩展到空白的区域内。
+ repeat。渐变会重复填满空白区域。    
+ reflect。     

```xml
<svg width="400px" height="400px" viewBox="0 0 400 400"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="partial" x1="20%" y1="30%" x2="40%" y2="80%">
      <stop offset="0%" style="stop-color: #ffcc00;" />
      <stop offset="33.3%" style="stop-color: #cc6699;" />
      <stop offset="100%" style="stop-color: #66cc99;" />
    </linearGradient>
    
    <linearGradient id="padded" xlink:href="#partial" spreadMethod="pad" />
    <linearGradient id="repeated" xlink:href="#partial" spreadMethod="repeat" />
    <linearGradient id="reflected" xlink:href="#partial" spreadMethod="reflect" />

    <line id="show-line" x1="20" y1="30" x2="40" y2="80" style="stroke: white;" />
  </defs>

  <rect x="20" y="20" width="100" height="100"
    style="fill: url(#padded); stroke: black;" />
  <use xlink:href="#show-line" transform="translate (20,20)"/>

  <rect x="130" y="20" width="100" height="100" 
    style="fill: url(#repeated); stroke: black;" />
  <use xlink:href="#show-line" transform="translate(130, 20)" />

  <rect x="240" y="20" width="100" height="100"
    style="fill: url(#reflected); stroke: black;" />
  <use xlink:href="#show-line" transform="translate(240, 20)" />
</svg>
```   

![gradient-2](https://raw.githubusercontent.com/temple-deng/markdown-images/master/svg/gradient-2.png)     


## 径向渐变

径向渐变中每个 stop 代表一个圆形路径，从焦点向外辐射。      

外层圆心 cx, cy 半径 r，这几个属性都是关于 objectBoundingBox 的百分比。默认值都是 50%.
fx, fy 是内圆圆心.默认值与 cx, cy 相同。同理也能使用 gradientUnits。    

## 变换模式和渐变

使用 `gradientTransform` 和 `patternTransform` 属性让我们来对 pattern 和 gradient 做
变换。     

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"
  xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <pattern id="tile" x="0" y="0" width="20%" height="20%">
      <path d="M 0 0 Q 5 20 10 10 T 20 20"
        style="stroke: black; fill:none;" />
      <path d="M 0 0 h 20 v 20 h -20 z"
        style="stroke: gray; fill: none;" />
    </pattern>

    <pattern id="skewed-tile"
      patternTransform="skewY(15)"
      xlink:href="#tile" />

    <linearGradient id="plain">
      <stop offset="0%" style="stop-color: #ffcc00;" />
      <stop offset="33.3%" style="stop-color: #cc6699;" />
      <stop offset="100%" style="stop-color: #66cc99;" />
    </linearGradient>

    <linearGradient id="skewed-gradient"
      gradientTransform="skewX(10)"
      xlink:href="#plain" />
  </defs>

  <rect x="20" y="10" width="100" height="100"
    style="fill: url(#tile); stroke: black;" />
  <rect x="135" y="10" width="100" height="100"
    style="fill: url(#skewed-tile); stroke: black;" />

  <rect x="20" y="120" width="200" height="50"
    style="fill: url(#plain); stroke: black;" />
  <rect x="20" y="190" width="200" height="50"
    style="fill: url(#skewed-gradient); stroke: black;" />
</svg>
```    

# Chapter 9. Text

## 文本的术语

**Glyph**     

一个字形是一个字符的一种视觉表现形式。一个字符可能有不同的字形可以显示。     

![glyphs](https://raw.githubusercontent.com/temple-deng/markdown-images/master/svg/glyphs.png)         

**Font**     

一个字体是一个确定字符集的字形表现的集合。     

一个字体中的所有字形通常在以下字体特征上是相同的：    

**Baseline, ascent, and descent**    

应该可以理解为基线、上半部和下半部吧。ascent 是指字体中最高的字符的顶部到基线的距离，同理 descent
是最深的字符的基线到底部的距离。这两个加一起就是 em-height。em-box 就是一个宽高皆为 em-height
的一个小方格。    

**cap-height, ex-height**     

cap-height 是指一个大写字母在基线之上的高度，ex-height 是从基线到小写字母 x 的顶端的距离。    

## &lt;text&gt; 元素的简单的属性

最简单形式的 `<text>` 元素只要求两个属性 `x, y`，定义了元素文本的第一个字符的基线的位置的那点。
默认样式下所有的文本是黑色填充，没有描边。    

许多文本的样式和在 CSS 中的一致：    

+ font-family。值是一系列用空格分隔的字体族名称或者通用族名称的列表。通用的名字必须是列表中的
最后几项。通用名字有 `serif, sans-serif, monospace, fantasy, cursive`。
+ font-size。
+ font-weight。
+ font-style。
+ test-decoration。
+ word-spacing。
+ letter-spacing。     

## 文本对齐

使用 `text-anchor` 属性来对齐文本，值可以是 `start, middle, end`。对于从左向右绘制的字体
来说，等价于向左，居中和向右对齐。不过对于其他方法绘制的字体来说，这可能会有不同的效果。    

```xml
<svg width="400" height="400"
  xmlns="http://www.w3.org/2000/svg">
  <line x1="100" y1="20" x2="100" y2="180" style="fill: none; stroke: black;
    stroke-dasharray: 4 5 4 5;" />
  <text x="100" y="50" text-anchor="start">
    Start
  </text>
  <text x="100" y="100" text-anchor="middle">
    Middle
  </text>
  <text x="100" y="150" text-anchor="end">
    End
  </text>
</svg>
```    

![text-anchor](https://raw.githubusercontent.com/temple-deng/markdown-images/master/svg/text-anchor.png)            

## &lt;tspan&gt;元素    

```xml
<svg width="300" height="300" 
  xmlns="http://www.w3.org/2000/svg">
  <text x="20" y="20" style="font-size: 16px;">
    Switch among
    <tspan style="font-style: italic">italic</tspan>,
    normal, and
    <tspan font-weight="bold">bold</tspan> text.
  </text>
</svg>
```    

我们甚至可以在 `<tspan>` 元素来修改单个字符或者某些字符的位置。`dy` 用来修改字符的垂直方向上的
偏移，`dx` 是水平位移。     

```xml
  <text x="30" y="70" style="font-size: 16px;">
      F <tspan dy="4">a</tspan>l<tspan dy="4">l</tspan>
  </text>
    <text x="30" y="100" style="font-size: 16px;">
      W<tspan dx="4">i</tspan>d<tspan dx="8">er</tspan>
  </text>
```    

注意到这种偏移是会影响整个后面的字符的，而且像上面垂直方向上的偏移还有累加的效应。   

除了 `dy, dx` 之外，还有 `x,y` 属性，这两个是绝对单位，由于 svg 的文本默认都在一行内显示，
所以我们可能需要将每行文本包在 tspan 元素里面，然后定位来分行。    

```xml
  <text x="30" y="150">
    They dined on mince, and slices of quince,
    <tspan x="20" y="170">Which they ate with a runcible spoon;</tspan>
    <tspan x="10" y="190">And hand in hand, on the edge of the sand</tspan>
  </text>
```    

**注意：**这里 tspan 上的 `x,y` 是相对于坐标系原点的，而不是text 的那个起始点，这有点不合理啊。   

如果我们有一串字符每个都要偏移和旋转不同的位置和角度，那么 `x,y, dx, dy, rotate` 接收一串数字。
唯一需要的是，这种形式，tspan 后面的字符不受影响。    

虽然我们可以使用 dy 来实现上标或下标，但是用 `baseline-shift` 更容易一点。这个属性值可以是
`super, sub` 还可以是一个长度值，一个百分比，百分比是依据 font-size 算的。     

## 设置 textLength

使用 `textLength` 来明确指定文本的长度，SVG 会将文本 fit 进指定的空间中。有两种方案来实现这
样的效果，一种是只增加字形间的距离，另一种是即修改字形间的距离也修改字形的大小。`lengthAdjust`
设为 `spacing` 则只调整字形间的距离，这也是默认值。如果设为 `spacingAndGlyphs` 就是后一种
效果。     

```xml
<rect x="0" y="0" width="300" height="300" fill="white" />
<g style="font-size: 14pt;">
  <path d="M 20 10 20 70 M 220 10 220 70" style="stroke: gray;" />
  <text x="20" y="30" textLength="200" lengthAdjust="spacing">
    Two words
  </text>
  <text x="20" y="60" textLength="200" lengthAdjust="spacingAndGlyphs">
    Two words
  </text>

  <text x="20" y="90">
    Two words <tspan style="font-size: 10pt;">(normal length)</tspan>
  </text>
  
  <path d="M 20 100 20 170 M 100 100 100 170" style="stroke: gray;" />
  <text x="20" y="120" textLength="80" lengthAdjust="spacing">
    Two words
  </text>
  <text x="20" y="160" textLength="80" lengthAdjust="spacingAndGlyphs">
    Two words
  </text>
</g>
```    

![textLength](https://raw.githubusercontent.com/temple-deng/markdown-images/master/svg/textLength.png)          

## 垂直文本

实现垂直文本的一种方式是将文案旋转 90 度。另一种就是将 `writing-mode` 属性设为 `tb` 即 top
to bottom。    

另一种情况是我们只是想让文本竖着排列，但是字符并没有旋转，这种情况下将 `glyph-orientation-vertical`
属性设置为 `0`，默认是 90 度。但是实测这个玩意没效果啊，怎么回事。   

```xml
<text x="10" y="20" transform="rotate(90, 10, 20)">
  Rotated 90
</text>
<text x="50" y="20" style="writing-mode: tb;">
  Writing Mode tb
</text>
<text x="90" y="20" style="writing-mode: tb;
  glyph-orientation-vertical: 0;">
  Vertical zero
</text>
```    

注意这里关于文本的很多属性可能浏览器的支持性都不怎么好。    

## Internationalization

### &lt;switch&gt; 元素

switch 元素会搜索其所有子元素，直到找到一个 `systemLanguage` 属性与当前用户软件设置的语言
一致的元素。这个属性值可以是单一值，或者是一个逗号分隔的语言的名字列表。     

一旦找到了一个匹配的子元素，所有这个子元素的子孙都会被展示，而其他的会被跳过。    

```xml
<g font-size="12pt">
  <switch>
    <g systemLanguage="en-UK">
      <text x="10" y="30">
        A circle
      </text>
      <text x="10" y="100">
        without colour.
      </text>
    </g>
    <g systemLanguage="en">
      <text x="10" y="30">
        A circle
      </text>
      <text x="10" y="100">
        without color.
      </text>
    </g>
  </switch>
</g>
```   

### 使用定制字体

有时候我们可能想要使用一些非 Unicode 字符串，或者只是想要一个 Unicode 字符的子集而不安装整个
字体。这时候我们需要使用定制的字体。    

首先创建一个字体文件：   

```xml
<font id="kfont-defn" horiz-adv-x="989" vert-adv-y="1200"
  vert-origin-y="0">
  <font-face font-family="bakbatn"
    units-per-em="1000"
    panose-1="2 3 6 0 0 1 1 1 1 1"
    accent="800" descent="-200" baseline="0">
    <missing-glyph horiz-adv-x="500" />
    <!-- glyph definitions go here -->
  </font-face>
</font>
```    

然后在我们的 svg 中引入外部字体：   

```xml
<defs>
  <font-face font-family="bakbatn">
    <font-face-src>
      <font-face-uri xlink:href="kfont.svg#kfont-defn">
        <font-face-format string="svg" />
      </font-face-uri>
    </font-face-src>
  </font-face>
</defs>

<text font-size="28" x="20" y="40"
  style="font-family: bakbatn, serif;">
  서울 - 대한민국
</text>
```   

## 路径上文本

文本不是必须水平或垂直排列，其可以沿着任意的路径排列。其方式就是将文本放入一个 `<textPath>` 元素
中，并用 `xlink:href` 引用一个 `<path>` 元素。字符将会被选择以与路径垂直（即，字符的基线
将与曲线相切）。     

```xml
<defs>
  <path id="curvepath"
    d="M30 40 C 50 10, 70 10, 120 40 S 150 0, 200 40"
    style="stroke: gray; fill: none;" />
  <path id="round-corner"
    d="M250 30 L 300 30 A 30 30 0 0 1 330 60 L 330 110"
    style="stroke: gray; fill: none;" />
  <path id="sharp-corner"
    d="M 30 100 100 110 100 160"
    style="stroke: gray; fill: none;" />
  <path id="discontinuous"
    d="M 150 110 A 40 30 0 1 0 230 110 M 250 110 270 140"
    style="stroke: gray; fill: none;" />
</defs>

<g style="font-famliy: 'Liberation Sans';">
  <use xlink:href="#curvepath" />
  <text>
    <textPath xlink:href="#curvepath">
      Following a cubic Bezier curve.
    </textPath>
  </text>

  <use xlink:href="#round-corner" />
  <text>
    <textPath xlink:href="#round-corner">
      Going 'round the bend
    </textPath>
  </text>

  <use xlink:href="#sharp-corner" />
  <text>
    <textPath xlink:href="#sharp-corner">
      Making a quick turn
    </textPath>
  </text>

  <use xlink:href="#discontinuous" />
  <text>
    <textPath xlink:href="#discontinuous">
      Text along a broken path
    </textPath>
  </text>
</g>
```   

![text-on-path](https://raw.githubusercontent.com/temple-deng/markdown-images/master/svg/text-on-path.png)         

我们还可以通过使用 `startOffset` 属性来调整文本的起始位置，值可以是一个百分比或一个长度值。
溢出路径的文本会被剪裁掉。   

## 文本中的空白

通过设置 `xml:space` 属性可以设置 SVG 对文本中空白的处理方式。默认值是 `default`，SVG 会这样
处理空白：    

+ 移除所有的换行符
+ 将所有的 tab 改为空格符
+ 移除所有的行首和追尾空白
+ 将中部的空白都改为单个空白    

这个属性的另一取值是 `preserve`，这种取值下，SVG 会简单地将所有的换行和制表符转为空白符，除此
之外不做任何处理：    

`\n\n___abc_\t\t_def_\n\n__ghi`    

会变为：`_____abc____def_____ghi`     

# Chapter 10. 裁切和遮罩

## Clipping to a Path

使用 `<clipPath>` 元素创建剪裁区域。    

假设我们现在建立一个矩形剪裁区域，首先将矩形 `<rect>` 元素放置到 `<clipPath>` 元素中，然后在
要被剪裁的对象上，设置 `clip-path` 属性，引用我们的 `<clipPath>` 元素。    

```xml
  <defs>
    <clipPath id="rectClip">
      <rect id="rect1" x="15" y="15" width="40" height="45"
        style="stroke: gray; fill: none;" />
    </clipPath>
  </defs>

  <use xlink:href="cat.svg#cat"
    style="clip-path: url(#rectClip);" />

  <g transform="translate(100,0)">
    <use xlink:href="#rect1"/>
    <!-- show clip rectangle -->
    <use xlink:href="cat.svg#cat"/>
  </g>
```   

![clip](https://raw.githubusercontent.com/temple-deng/markdown-images/master/svg/clip.png)          

默认情况下，剪裁路径使用的是用户坐标系。如果我们希望使用 object bounding box，需要将
`clipPathUnits` 设为 `objectBoundingBox`。    

## 遮罩 Masking

在 SVG mask 中，mask 的透明度会传递给其遮罩的对象。在 mask 是不透明的情况下，被遮罩的对象
的像素也是不透明的。在 mask 是半透明的情况下，遮罩的对象部分也是半透明的。在 mask 是全透明的
部分，则被遮罩对象的部分是不可见的。    

也就说，如果 mask 不透明，则底下的对象反而是可见的，如果 mask 是半透明，则底下的对象也是半透明的，
如果 mask 是透明的，则对象反而是不可见的。     

使用 `<mask>` 元素来创建一个 mask，使用 `x,y,width,height` 来指定 mask 的尺寸，与裁切不同，
这里的尺寸是相对于 objectBoundingBox 的。如果想要改为用户坐标系，将 `maskUnits` 设为 `userSpaceOnUse`。     

在 mask 元素的开闭标签之间，可以放置任意的基础图形，文本，图片，或者路径。这些元素的坐标系是用户
坐标系。如果想要使用 mask 的 object bounding box，将 `maskContentUnits` 设置为
`objectBoundingBox`。     

svg 是如何确定一个像素的透明度的呢？在这里 svg 并不是简单的使用一个 opacity 或者 alpha 通道
来当做透明度，其反而会将所有的像素信息利用起来决定透明度，具体来说使用下面的公式计算：   

`(0.2125 * red value + 0.7154 * green value + 0.0721 blue value) * opacity value`   

所有的值都是一个位于 0 到 1 之间的浮点值。在这种公司计算下，绿色会更亮，红色会稍暗，而蓝色是最暗的。
颜色越暗，mask 的透明度就越高，被遮罩的对象可见度就越低。    

```xml
  <defs>
    <mask id="redmask" x="0" y="0" width="1" height="1"
      maskContentUnits="objectBoundingBox">
      <rect x="0" y="0" width="1" height="1" style="fill: #f00;" />
    </mask>

    <mask id="greenmask" x="0" y="0" width="1" height="1"
      maskContentUnits="objectBoundingBox">
      <rect x="0" y="0" width="1" height="1" style="fill: #0f0" />
    </mask>

    <mask id="bluemask" x="0" y="0" width="1" height="1"
      maskContentUnits="objectBoundingBox">
      <rect x="0" y="0" width="1" height="1" style="fill: #00f" />
    </mask>

    <mask id="whitemask" x="0" y="0" width="1" height="1"
      maskContentUnits="objectBoundingBox">
      <rect x="0" y="0" width="1" height="1" style="fill: #fff" />
    </mask>
  </defs>

  <rect x="10" y="10" width="50" height="50" fill="#f00" />
  <rect x="70" y="10" width="50" height="50" fill="#0f0" />
  <rect x="130" y="10" width="50" height="50" fill="#00f" />
  <rect x="190" y="10" width="50" height="50"
    style="fill: #fff; stroke:black;" />

  <rect x="10" y="72" width="250" height="5" style="fill: yellow;" />
  <rect x="10" y="112" width="250" height="5" style="fill: yellow;" />

  <g style="mask: url(#redmask); font-size: 14pt; text-anchor: middle;">
    <circle cx="35" cy="115" r="25" style="fill: black;" />
    <text x="35" y="80">Red</text>
  </g>

  <g style="mask: url(#greenmask); font-size: 14pt; text-anchor: middle;">
    <circle cx="95" cy="115" r="25" style="fill: black;" />
    <text x="95" y="80">Green</text>
  </g>

  <g style="mask: url(#bluemask); font-size: 14pt; text-anchor: middle;">
    <circle cx="155" cy="115" r="25" style="fill: black;" />
    <text x="155" y="80">Blue</text>
  </g>

  <g style="mask: url(#whitemask); font-size: 14pt; text-anchor: middle;">
    <circle cx="215" cy="115" r="25" style="fill: black;" />
    <text x="215" y="80">White</text>
  </g>
```    

![mask](https://raw.githubusercontent.com/temple-deng/markdown-images/master/svg/mask.png)        


# 第 11 章 滤镜

## 滤镜的工作原理

```xml
<filter id="drop-shadow">
  <!-- filter operations go here -->
</filter>
<g id="spring-flower" style="filter: url(#drop-shadow);"/>
  <!-- drawing of flower goes here -->
</g>
```    

由于上面的花在其表现样式中使用了一个滤镜，SVG 不会直接将花渲染成最终的图形。它会首先将花
的像素渲染到一个临时的位图中。然后 SVG 将滤镜指定的操作应用到这个临时的位图中，然后产生
的结果会渲染到最后的图形中。   

默认情况下，临时位图的尺寸取决于屏幕的分辨率和尺寸。    

滤镜 `<filter>` 中的每一个操作叫做 primitives。   

## 创建一个 drop shadow

### 建立滤镜的边界

`<filter>` 上的 `x, y, width, height` 指定了滤镜的裁剪区域，值可以是长度或百分比值，
这些尺寸是相对于使用滤镜对象的 object bounding box 的，这个属性是由 `filterUnits` 控制的。
位于这些边界外部的输出都会被裁切掉。x, y 默认值是 -10%，width, height 默认值是 120%。   

还有一个 `primitiveUnits` 属性，这个是 primitives 上的是属性，默认是 `userSpaceOnUse`。    

### 为 drop shadow 使用 &lt;feGaussianBlur&gt;    

`<filter>` 开闭标签中间的东西就是滤镜的 primitives，这些就是我们想要执行的操作。每个
primitives 都有一到多个输入，但是只有一个输出。输入可以是原始图形，使用 `SourceGraphic`
声明的，或者是图形的 alpha 通道值，使用 `SourceAlpha` 声明的，或者先前 primitives 的输出。   

使用 `<feGaussianBlur>` 操作来使用高斯模糊，使用 `in` 属性指定 primitives 的输入，
模糊的量使用 `stdDeviation` 属性。数值越大，模糊程度越重。如果指定两个值，第一个值是 x
方向模糊，第二个是 y 方向模糊。   

```xml
  <defs>
    <filter id="drop-shadow">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
    </filter>
  </defs>

  <g id="flower" filter="url(#drop-shadow)">
    <!-- drawing here -->
  </g>
```     

然而这并不是我们想要的效果。之所以会出现这样的情况是因为滤镜的最后的输出就是最终结果，在这里
就是一个模糊过的原始图形的 alpha 通道结果，而不是最终的源图形。    

### storing, chaining, 和 merging 滤镜结果

下面是改进后的滤镜：   

```xml
  <defs>
    <filter id="drop-shadow">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
      <feOffset in="blur" dx="4" dy="4" result="offsetBlur" />
      <feMerge>
        <feMergeNode in="offsetBlur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
```    

1. 首先 `result` 属性的值可以让后面的滤镜引用该滤镜的输出。
2. `<feMergeNode>` 每一个都指定了一个输入，这些输入就像一个堆栈一样堆叠起来，第一个出现
的就是堆栈的底。    

## 创建一个 glowing shadow

### &lt;feColorMatrix&gt; 元素

```xml
<filter id="glow">
  <feColorMatrix type="matrix"
    values=
      "0 0 0 0   0
       0 0 0 0.9 0
       0 0 0 0.9 0
       0 0 0 1   0" />
  <feGaussianBlur stdDeviation="2.5" reslut="coloredBlur" />
  <feMerge>
    <feMergeNode in="coloredBlur" />
    <feMergeNode in="SourceGraphic" />
  </feMerge>
</filter>
```    

使用 `<feColorMatrix>` 元素修改一个像素的任意颜色或 alpha 值。当 `type` 为 `matrix` 时，
必须将 `values` 设置为 20 个指定了变换的数字。每一行分别代表如何计算出 R, G, B 和 Alpha
的代数方程。行中的数字乘以像素的 R, G, B 和 Alpha 的值以及常数 1，然后相加得到输出值。
要设置将所有不透明区域绘制为相同颜色的转换，可以忽略输入颜色和常量，只需在alpha列中设置值即可。
这种矩阵的模型如下所示：   

```
values = 
  "0 0 0 red 0
   0 0 0 green 0
   0 0 0 blue 0
   0 0 0 1 0"
```    

red, green 和 blue 通常是 0 到 1 的值。    

注意到这个滤镜没有 `in` 指明输入，那默认就是 `SourceGraphic`。同时也没有 `result`。这
意味着仅有该滤镜后面跟着的下个滤镜可以使用其作为输入，如果想这样使用，那么后面的那个滤镜
就不能指定 `in` 属性。    

`type` 属性除了 `matrix` 值，还有其他 3 个值，这 3 个值都内置了颜色矩阵，来让完美方便地
完成一些特定的视觉效果：   

+ hueRotate。`values` 是一个单一数值，指定了颜色要旋转的度数。
+ saturate。`values` 是一个 0 到 1 的数值。
+ luminanceToAlpha。基于颜色的亮度创建 alpha 通道。没有 `values` 属性。   

## &lt;feImage&gt; 滤镜

使用 `<feImage>` 元素我们可以指定任意的图片或者一个带有 id 属性的 svg 元素作为滤镜的
输入。    

```xml
<defs>
  <filter id="sky-shadow" filterUnits="objectBoundingBox">
    <feImage xlink:href="sky.jpg" result="sky"
      x="0" y="0" width="100%" height="100%"
      perserveAspectRatio="none" />
    <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
    <feOffset in="blur" dx="4" dy="4" result="offsetBlur" />
    <feMerge>
      <feMergeNode in="sky" />
      <feMergeNode in="offsetBlur" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
</defs>
```    

默认情况下，图片会被拉伸到 `<filter>` 元素定义的滤镜区域大小。当然也可以在 `<feImage>`
上定义 `x, y, width, height` 等值，默认情况下这些属性单位是 userSpaceOnUse，不过如果
是百分比值就是相对于滤镜区域的单位。    

## &lt;feComponentTransfer&gt; 元素

使用 `<feComponentTransfer>` 可以以一种更简单和灵活的方式来分别操纵每个颜色通道。通过
将 `<feFuncR>, <feFuncG>, <feFuncB>, <feFuncA>` 放入 `<feComponentTransfer>` 来
分别调整 red, green, blue 和 alpha通道。这些子元素都可以声明一个 `type` 属性来指定修改
通道的方式。    

```xml
<filter id="brightness-shadow" filterUnits="objectBoundingBox">
  <feImage xlink:href="sky.jpg" result="sky"/>
  <feComponentTransfer in="sky" result="sky">
    <feFuncB type="linear" slope="3" intercept="0"/>
    <feFuncR type="linear" slope="1.5" intercept="0.2"/>
    <feFuncG type="linear" slope="1.5" intercept="0.2"/>
  </feComponentTransfer>
  <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
  <feOffset in="blur" dx="4" dy="4" result="offsetBlur"/>
  <feMerge>
    <feMergeNode in="sky"/>
    <feMergeNode in="offsetBlur"/>
    <feMergeNode in="SourceGraphic"/>
  </feMerge>
</filter>
```    

# Chapter 12. SVG 动画

本章将介绍 SVG 动画。第一种是基于 SMIL 的动画，应该用来制作那些属于图形基础部分的移动
动画，并且可以提前定义好的动画。第二种 CSS 动画，应该用来提供样式的效果动画。第三种
脚本动画应该是在比较复杂的交互情况下使用。    

## 动画基础

在基于 SMIL 动画中，我们通过指定我们想要变动的属性、颜色、移动、变换的开始值和结束值，动画
开始的时间，以及动画的持续时间来定义一个动画。     

```xml
<rect x="10" y="10" width="200" height="20" stroke="black" fill="none">
  <animate
    attributeName="width"
    attributeType="XML"
    from="200" to="20"
    begin="0s" dur="5s"
    fill="freeze" />
</rect>
```   

+ 由于 `width` 是一个 XML 属性，所以 `attributeType` 值为 XML，除此之外，还有 CSS，
表明我们要变动的属性是一个 CSS 属性。如果省略这个属性，则默认是 `auto`，这种情况下首先搜索
CSS 属性之后搜索 XML 属性
+ `from` 是可选的。还有一个 `by` 属性，我们可以用这个来替代 `to`，`by` 的值其实应该是我们变动
了多少。
+ `freeze` 指定了当动画结束时应该做什么。`fill` 属性告诉动画引擎如何处理剩余的时间。默认值
是 `remove`，这种情况下，动画完后 `width` 会回到其原始值。     

```xml
<rect x="10" y="10" width="20" height="20"
  style="stroke: black; fill: green; fill-opacity: 0.25;">
  <animate attributeName="width" attributeType="XML"
    from="20" to="200" begin="0s" dur="8s" fill="freeze" />
  <animate attributeName="height" attributeType="XML"
    from="20" to="150" begin="0s" dur="8s" fill="freeze" />
  <animate attributeName="fill-opacity" attributeType="CSS"
    from="0.25" to="1" begin="0s" dur="3s" fill="freeze" />
  <animate attributeName="fill-opacity" attributeType="CSS"
    from="1" to="0.25" begin="3s" dur="3s" fill="freeze" />
</rect>
```     

## 时间如何测量

SVG 的动画时钟在 SVG 加载完成后就开始计时，当用户离开页面时停止。`begin` 和 `dur` 有以下
几种声明时间的方法：    

+ 一个完整的时分秒值(1:20:23)
+ 一个只包含分和秒的值(02:15)
+ 一个时间值后面跟一个单位 h, min, s, ms，如果没提供单位，默认是秒    

## 动画同步

除了根据 SVG 加载完成后的时间设置动画的开始时间，我们还可以将动画的开始时间与另一个动画的开始
时间或结束时间绑定。    

```xml
<circle cx="60" cy="60" r="30" style="fill: #f9f; stroke: gray;">
  <animate id="c1" attributeName="r" attributeType="XML"
    begin="0s" dur="4s" from="30" to="10" fill="freeze" />
</circle>

<circle cx="120" cy="60" r="10" style="fill: #9f9; stroke: gray;">
  <animate id="c1" attributeName="r" attributeType="XML"
    begin="c1.end" dur="4s" from="10" to="30" fill="freeze" />
</circle>
```    

也可以在这种同步机制下加一些延迟时间，例如 `begin="otherAni.end + 2s"`      

`end` 也可以作为一个单独的属性，下面的动画在页面加载后 6s 开始执行，其会执行 12s 或者当另一个
动画 `otherAni` 结束时结束。    

```xml
<animate attributeName="width" attributeType="XML"
  begin="6s" dur="12s" end="otherAni.end"
  from="10" to="100" fill="freeze" />
```   

`end` 值也可以是一个时间值。    

## 重复

有两个属性用来控制动画的重复，`repeatCount` 和 `repeatDur`，`repeatDur` 用来设置重复应该
持续多少时间。这两个均可以设置为 `indefinite`，一般情况下我们设置这两个中的一个就够了，如果
同时设置了，哪一个先完就用哪个。    

```xml
  <circle cx="60" cy="60" r="30" style="fill: none; stroke: red;">
    <animate attributeName="cx" attributeType="XML"
      begin="0s" dur="5s" repeatCount="2"
      from="60" to="260" fill="freeze" />
  </circle>

  <circle cx="260" cy="90" r="30" style="fill: #ccf; stroke: red;">
    <animate attributeName="cx" attributeType="XML"
      begin="0s" dur="5s" repeatDur="8s"
      from="260" to="60" fill="freeze" />
  </circle>
```    

需要注意的一点是，不管是 `repeatCount` 还是 `repeatDur` 都已经把原始的第一次动画播放算进去了，
所有如果 `repeatCount="2"`，那么动画只播放两次。    

有了重复以后，`begin` 的同步机制就可以加入新的功能，`id.repeat(count)`。不过这里就不能
指定 `end` 之类的关键字了，最多可以加个额外的延迟时间。    

## 复杂的动画属性

当动画一个颜色时，颜色值首先被当做一个 3 个数值的向量，然后 R，G，B 的值分别向终止值过渡。    

除了颜色外，还可以动画一个数值的列表，只要其中数值的个数不变，例如像路径以及多边形中的点。    

## 指定多个值

目前为止我们所有的动画都只是提供了一个初始值，一个终止值。其实我们还是可以设置多个动画的中间值的。    

```xml
  <circle cx="50" cy="50" r="30" style="fill: #ff9; stroke: black;">
    <animate attributeName="fill" begin="2s" dur="4s"
      values="#ff9;#99f;#f99;#9f9" fill="freeze" />
  </circle>
```    

## 多级动画的时间安排

使用 `keyTimes` 可以让我们指定多级动画中划分时间的方式，而不是默认的等分。这个属性的值也是一个
分号分隔的列表，并且值的数量必须与 `values` 中的相等。列表中的第一个值必须是 0，最后一个值
必须是 1，其他的值均是一个 0 到 1 的值。     

另一种控制多级动画中时间的属性是 `calcMode`，有以下的可选值：   

+ `paced`。根据两个值之间的差距来划分时间比率。
+ `linear`。默认值。时间等分。
+ `discrete`。动画将从一个值之间调到另一个值，没有过渡。适合那些不支持过渡的属性。
+ `spline`。根据 `keySplines` 属性来加速和减速。这个书上没有多介绍。    

## &lt;set&gt; 元素

```xml
  <circle cx="60" cy="60" r="30" style="fill: #ff9; stroke: gray;">
    <animate id="c1" attributeName="r" attributeType="XML"
      begin="0s" dur="4s" from="30" to="0" fill="freeze" />
  </circle>

  <text text-anchor="middle" x="60" y="60" style="visibility: hidden;">
    <set attributeName="visibility" attributeType="CSS"
      to="visible" begin="4.5s" dur="1s" fill="freeze" />
      All gone!
  </text>
```    

根据书上所说，`<set>` 元素其实只是一种动画的简写形式。    

## &lt;animateTransform&gt; 元素

由于 `rotate, scale, translate, skew` 变化都是在 `transform` 属性中的，所以无法用 `<animate>`
直接对这样的属性进行动画。这种情况下可以使用 `<animateTransform>` 元素。将 `attributeName`
设置为 `transform`，`type` 属性指定变换的种类。    

```xml
<g transform="translate(100, 60)">
  <rect x="-10" y="-10" width="20" height="20"
    style="fill: #ff9; stroke: black;">
    <animateTransform attributeName="transform"
      attributeType="XML" type="scale"
      from="1" to="4 2"
      begin="0s" dur="4s" fill="freeze" />
  </rect>
</g>
```    

如果我们不止要进行一种变换的动画，就要使用 `additive` 属性，默认值是 `replace`，这种情况下，
后面的变换动画会替换掉前面的，而如果想要多个变换都使用，需要设置为 `sum`。    

```xml
<rect x="-10" y="-10" width="20" height="20"
  style="fill: #ff9; stroke: black;">
  <animateTransform attributeName="transform" attributeType="XML"
    type="scale" from="1" to="4 2"
    additive="sum" begin="0s" dur="4s" fill="freeze"/>
  <animateTransform attributeName="transform" attributeType="XML"
    type="rotate" from="0" to="45"
    additive="sum" begin="0s" dur="4s" fill="freeze"/>
</rect>
```    

## &lt;animateMotion&gt; 元素

使用 `<animateMotion>` 属性可以让对象沿着任意的路径进行 translate 动画。    

如果我们只是想要一个简单的直线 translate，指定 `from` 和 `to` 属性即可，每个属性的值是一个
(x,y) 坐标。指定了 0,0 点要移动到哪里。    

```xml
<g>
  <rect x="0" y="0" width="30" height="30" style="fill: #ccc;"/>
  <circle cx="30" cy="30" r="15" style="fill: #cfc; stroke: green;"/>
  <animateMotion from="0,0" to="60,30" dur="4s" fill="freeze"/>
</g>
```   

也可以使用 `values` 指定多个点，但每次移动还是直线，必须使用 `path` 属性来实现更复杂的路径。   

```xml
<path d="M50,125 C 100,25 150,225, 200, 125"
  style="fill: none; stroke: blue;"/>

<path d="M-10,-3 L10,-3 L0,-25z" style="fill: yellow; stroke: red;">
  <animateMotion
    path="M50,125 C 100,25 150,225, 200, 125"
    dur="6s" fill="freeze"/>
</path>
```    

如果希望我们移动的图形的 x 方向与路径平行，可以将 `rotate` 属性设置为 `auto`。当然除了 auto
也可以设置其他的数值。     

## 使用 CSS 动画

等同于我们使用的普通的 CSS 帧动画。    

# Chapter 13. 添加交互

## 在 SVG 中使用链接

最简单的交互就是提供一个链接，由 `<a>` 元素完成。链接可以链接到另一个 SVG 文件，又或者是一个
web 页面。    

```xml
<a xlink:href="cat.svg">
  <text x="100" y="30" style="font-size: 12pt;">
    Cat
  </text>
</a>

<a xlink:href="http://www.w3.org/SVG/">
  <circle cx="50" cy="70" r="20" style="fill: red;" />
  <rect x="75" y="50" width="40" height="40" style="fill: green;" />
  <path d="M120 90, 140 50, 160 90 Z" style="fill: blue;" />
</a>
```   

SVG 里的链接不像 HTML 里面那样可能有颜色或者下滑线的提示来告诉我们这是个链接。所以我们需要使用
一些 CSS 伪类来提供一些反馈。例如 `:hover` 伪类和 `:focus` 伪类。    


## 用户触发的 SMIL 动画

我们可以将 SMIL 动画的 `begin` 和 `end` 的属性值定义为 `elementID.eventName` 的形式，来让
动画在相应的元素发生了指定的事件时进行动画。例如，之前使用 `:hover` 伪类的动画，如果使用这里
定义的形式，那就可以将 `begin, end` 写为：`begin="myElement.mouseover"` 和 `end="myElement.mouseout"。     

为了更好地控制动画，我们还可以添加一个可选的时延，`elementID.eventName + offset`。这个
offset 甚至可以是负值，这种情况下，在指定的事件发生时，动画会直接从 offset 位置开始播放，而不是
说在事件发生前从 -offset 的时间开始播放。因为我们根本无法预知事件的发生。    

```xml
<g id="button">
  <rect x="10" y="10" width="40" height="20" rx="4" ry="4"
    style="fill: #ddd;" />
  <text x="30" y="25" style="text-anchor: middle; font-size: 8pt;">
    Start
  </text>
</g>

<g transform="translate(100, 60)">
  <path d="M-25 -15, 0 -15, 25 15, -25 15 Z"
    style="stroke: gray; fill: #699;">
    <animateTransform id="trapezoid" attributeName="transform"
      type="rotate" from="0" to="360"
      begin="button.click" dur="6s" />
  </path>
</g>
```    

## 脚本化 SVG

一旦我们获取了一个节点后，我们可以：   

+ 调用 `ele.getAttribute(attributeName)` 获取元素的属性，返回一个字符串类型的属性值
+ 调用 `ele.setAttribute(name, newValue)` 设置元素的属性值
+ 调用 `ele.removeAttribute(name)` 移除元素的属性     

我们还可以使用 `ele.setAttribute("style", newStyleValue)` 修改内联的样式，不过这样会
覆盖之前所有内联的样式，相比之下，我们可以使用下面较优雅地方式来进行修改：   

+ 使用 `ele.style.getPropertyValue(propertyName)` 访问一个特定的样式
+ 使用 `ele.style.setPropertyValue(propertyName, newValue, priority)`来修改样式，
priority 通常是 null，也可以设置为 "important"
+ 使用 `ele.style.removeProperty(propertyName)` 删除     

如果要访问任意节点的文本内容，使用 `ele.textContent` 属性。     

```xml
<rect id="rectangle" x="10" y="20" width="30" height="40"
  style="stroke: gray; fill: #ff9; stroke-width: 3" />
<text id="output" x="10" y="80" style="font-size: 9pt"></text>

<script type="application/ecmascript">
  <![CDATA[
    var txt = document.getElementById("output");
    var r = document.getElementById("rectangle");
    var msg = r.getAttribute("x") + ", " +
      r.getAttribute("y") + " " +
      r.style.getPropertyValue("stroke") + " " +
      r.style.getPropertyValue("fill");
    r.setAttribute("height", "30");
    txt.textContent = msg;
  ]]>
</script>
```   

### 时间概览

+ `focusIn` 和 `focusOut` 发生在元素获得或失去焦点的时候，`activate` 发生在元素被鼠标点击
或按下键盘激活的时候。
+ `mousedown, mouseup, click`, `mouseover, mouseover, mouseout`。
+ `DOMNodeInserted` 发生在节点插入到另一个节点中时，`DOMAttrModified` 发生在节点属性被修改
时。
+ `SVGLoad` 发生在整个 SVG 被解析可用的时候。`SVGUnload` 是移除的时候。`SVGAbort` 发生在
加载完 SVG 前页面停止加载的时候，`SVGError` 发生在节点加载出错或脚本执行出错的时候。还有
`SVGResize, SVGScroll, SVGZoom`     
+ 在一个动画元素开始、结束或者重复动画时，会生成 `beginEvent, endEvent, repeatEvent`事件，
`repeatEvent` 时间不会在第一次执行生成      

事件监听上还是 `addEventListener`。    

# Chapter 14. 使用 SVG DOM

我们在上一章的例子中使用属性和方法都是 DOM 规范的一部分。SVG 1.1 规范定义了几个额外的方法来让
我们更方便地操作 SVG 图形。这个方法可以让我们找到文本或路径元素准确的绘制位置、控制动画的时间、
以及坐标系统之间的变换。    

## 确定元素的属性值

每个 SVG 元素类型都有其特定的一些关键属性，例如 SVGCircleElement 对象有 `cx, cy, r` 属性。    
这些属性不是存储为简单地数字，通常情况下，这个属性包含两个子属性：`baseVal` 和 `animVal`。
`animVal` 是只读的。   

同时需要注意的是 `baseVal` 和 `animVal` 本身就是复杂的对象，这样设计的目的是为了处理不同单位
之间的属性。对于长度和角度单位来说，`baseVal.value` 和 `animVal.value` 总是以用户单位为
单位的属性值，而不是在设置属性时采用的值。      


## SVG 接口方法

略。   




# XML 介绍

`<?xml version="1.0" encoding="us-ascii"?>` 这样的内容叫做 XML 声明，这个声明是告诉处理
XML 的程序当前 XML 文档的版本以及文档的编码方式，注意版本是必需的。这个声明是可以省略的，这种
情况下就由应用程序来猜了，通常认为编码方式是 UTF-8.     

XML 文档必须有且只有一个根元素。    

元素属性值的引号可以是单引号也可以是双引号。    

不管是在元素名还是属性名上，以 `xml` 开头的名称是 XML1.O 规范保留的，这个不区分大小写。   

元素名或属性名，以字母或下划线开头，后面跟字母、数字、下划线、点。    

注释和 HTML 里面的一样。   

DTD 是用来限制在特定文档类型可以使用的元素及属性，以及元素使用的顺序。DTD 包含了定义的元素
类型和属性列表。    

如何将文档类型和 DTD 链接起来呢？使用文档类型声明 `<!DOCTYPE>`，这个声明位于 XML 声明之后。   

```xml
<?xml version="1.0" encoding="us-ascii"?>
<!DOCTYPE authors SYSTEM "https://example.com/authors.dtd">
```   

上面的文档类型声明中，我们指定了文档的根元素 authors。     

