# 1. Grid  

<!-- TOC -->

- [1. Grid](#1-grid)
- [2. 网格的基础概念](#2-网格的基础概念)
  - [2.1. 什么是网格](#21-什么是网格)
      - [2.1.0.1. 固定的和灵活的轨道尺寸](#2101-固定的和灵活的轨道尺寸)
      - [2.1.0.2. 项目的放置](#2102-项目的放置)
      - [2.1.0.3. 创建额外的轨道来放置内容](#2103-创建额外的轨道来放置内容)
      - [2.1.0.4. 对齐的控制](#2104-对齐的控制)
      - [2.1.0.5. 控制重叠的内容](#2105-控制重叠的内容)
  - [2.2. 网格容器](#22-网格容器)
  - [2.3. 网格轨道](#23-网格轨道)
      - [2.3.0.6. fr 单位](#2306-fr-单位)
      - [2.3.0.7. 用 repeat() 表示轨道列表](#2307-用-repeat-表示轨道列表)
      - [2.3.0.8. 隐式的网格与明确的网格](#2308-隐式的网格与明确的网格)
      - [2.3.0.9. 轨道尺寸与 minmax()](#2309-轨道尺寸与-minmax)
  - [2.4. 网格线](#24-网格线)
  - [2.5. 网格单元](#25-网格单元)
  - [2.6. 网格区域](#26-网格区域)
  - [2.7. 槽](#27-槽)
  - [2.8. 嵌套网格](#28-嵌套网格)
      - [2.8.0.10. 子网格 subgrid](#28010-子网格-subgrid)
- [3. 网格布局与其他布局方法的关系](#3-网格布局与其他布局方法的关系)
  - [3.1. Grid and flexbox](#31-grid-and-flexbox)
    - [3.1.1. fr 单位与 flex-basis](#311-fr-单位与-flex-basis)
    - [3.1.2. A flexible number of tracks](#312-a-flexible-number-of-tracks)
  - [3.2. 网格和绝对定位元素](#32-网格和绝对定位元素)
    - [3.2.1. 网格容器做包含块](#321-网格容器做包含块)
    - [3.2.2. 网格容器作为父元素](#322-网格容器作为父元素)
  - [3.3. Grid and display: contents](#33-grid-and-display-contents)
- [4. Line-based placement with CSS Grid](#4-line-based-placement-with-css-grid)
  - [4.1. 一个基本的例子](#41-一个基本的例子)
  - [4.2. 通过线的编号来定位 items](#42-通过线的编号来定位-items)
  - [4.3. The grid-column and grid-row shorthands](#43-the-grid-column-and-grid-row-shorthands)
    - [4.3.1. Default spans](#431-default-spans)
  - [4.4. The grid-area property](#44-the-grid-area-property)
  - [4.5. Counting backwards](#45-counting-backwards)
  - [4.6. Gutters or Alleys](#46-gutters-or-alleys)
    - [4.6.1. 间隙的简写](#461-间隙的简写)
  - [4.7. 使用 span 关键字](#47-使用-span-关键字)
- [5. Grid template areas](#5-grid-template-areas)
  - [5.1. 为一个网格区域命名](#51-为一个网格区域命名)
  - [5.2. Leaving a grid cell empty](#52-leaving-a-grid-cell-empty)
  - [5.3. Redefining the grid using media queries](#53-redefining-the-grid-using-media-queries)
  - [5.4. Grid definition shorthands](#54-grid-definition-shorthands)
    - [5.4.1. grid-template](#541-grid-template)
    - [5.4.2. grid](#542-grid)
- [6. Layout using named grid lines](#6-layout-using-named-grid-lines)
  - [6.1. Naming lines when defining a grid](#61-naming-lines-when-defining-a-grid)
    - [6.1.1. Giving lines multiple names](#611-giving-lines-multiple-names)
  - [6.2. Implicit grid areas from named lines](#62-implicit-grid-areas-from-named-lines)
  - [6.3. Implicit Grid lines from named areas](#63-implicit-grid-lines-from-named-areas)
  - [6.4. Multiple lines with the same name with repeat()](#64-multiple-lines-with-the-same-name-with-repeat)
- [7. Auto-placement in CSS Grid Layout](#7-auto-placement-in-css-grid-layout)
  - [7.1. Default rules for auto-placement](#71-default-rules-for-auto-placement)
    - [7.1.1. Sizing rows in the implicit grid](#711-sizing-rows-in-the-implicit-grid)
    - [7.1.2. Auto-placement by column](#712-auto-placement-by-column)
  - [7.2. The order of auto placed items](#72-the-order-of-auto-placed-items)
    - [7.2.1. Items with placement properties](#721-items-with-placement-properties)
    - [7.2.2. Deal with items that span tracks](#722-deal-with-items-that-span-tracks)
    - [7.2.3. Filling in the gaps](#723-filling-in-the-gaps)
    - [7.2.4. Anonymous grid items](#724-anonymous-grid-items)
- [8. Box alignment in CSS Grid Layout](#8-box-alignment-in-css-grid-layout)
  - [8.1. The two axis of a grid layout](#81-the-two-axis-of-a-grid-layout)
  - [8.2. Aligning items on the block, or column, Axis](#82-aligning-items-on-the-block-or-column-axis)
    - [8.2.1. Items with an intrinsic aspect ratio](#821-items-with-an-intrinsic-aspect-ratio)
  - [8.3. Justifying Items on the Inline or Row Axis](#83-justifying-items-on-the-inline-or-row-axis)
  - [8.4. Aligning the grid tracks on the block, or column, axis](#84-aligning-the-grid-tracks-on-the-block-or-column-axis)

<!-- /TOC -->

# 2. 网格的基础概念

## 2.1. 什么是网格

网格是一个水平线与垂直线相交的结合。CSS 网格布局有以下的特征：   

#### 2.1.0.1. 固定的和灵活的轨道尺寸

我们可以使用例如像素等单位创建给定轨道大小的网格，也可以使用例如百分比或者 `fr` 单位来创建
灵活的尺寸。`fr` 单位也是特意为这个目的设计的。    

#### 2.1.0.2. 项目的放置

我们可以使用线段的编号，线段的名字甚至是网格的区域来将项目准确的放置在网格中。
网格还包含一个算法来控制未在网格上给出明确位置的项目的位置。    

#### 2.1.0.3. 创建额外的轨道来放置内容

我们可以使用网格布局来定义明确的网格，但是规范还设计了在已声明的网格之外添加的内容，必要
时添加额外的行和列。     

#### 2.1.0.4. 对齐的控制

网格包含了对齐功能，以便可以让我们在网格中放置项目后还能控制项目的对齐方式，以及整个网格的对齐
方式。     

#### 2.1.0.5. 控制重叠的内容

一个网格单元中可以放置一个以上的项目。 这种分层可以用 z-index 控制。   

## 2.2. 网格容器

通过在一个元素上声明 `display: grid` or `display: inline-grid` 来创建一个网格容器。
一旦我们这样做，这个元素的所有直接的子元素将成为网格项目。    

## 2.3. 网格轨道

我们通过使用 `grid-template-columns` and `grid-template-rows` 来在网格中定义行和列。
这些行和列定义了网格轨道。网格轨道是网格上任意两条线之间的空间。    

#### 2.3.0.6. fr 单位

轨道可以使用任意的长度单位定义。网格还特意引入了一种额外的长度单位来帮我们创建灵活的网格轨道。
新的 fr 单位代表了网格容器可用空间的一部分。    

#### 2.3.0.7. 用 repeat() 表示轨道列表

在包含许多轨道的网格中可以使用 `repeat()` 来表示所有或者一部分轨道列表的重复。例如下面的
例子：   

```css
.wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}
```   

也可以写为：   

```CSS
.wrapper {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
```    

repeat 表示法可以用来表示一部分轨道列表的重复，例如：    

```CSS
.wrapper {
  display: grid;
  grid-template-columns: 20px repeat(6, 1fr) 20px;
}
```    

repeat 表示法可以接受一个轨道列表，因此我们可以用来创建重复的轨道模式。下面的例子中，
网格包含10个轨道，1个 1fr 轨道后跟着一个 2fr 轨道，重复5次。   

```CSS
.wrapper {
  display: grid;
  grid-template-columns: repeat(5, 1fr 2fr);
}
```    

#### 2.3.0.8. 隐式的网格与明确的网格   

上面的例子中我们使用 `grid-template-columns` 来定义列的轨道，但是让网格自己按需为内容创建行
轨道。这些行就是在隐式网格中创建的。明确的网格包含我们用 `grid-template-columns` and `grid-template-rows`
定义的行和列。如果我们将一些东西放置在定义的网格外，或者由于内容的数量超出了所需网格轨道的
数量，那么网格就会在隐式的网格中创建行和列。这些轨道的尺寸默认是自动调整大小的，以便其大小
是基于其内部的内容的。    

我们可以使用 `grid-auto-columns` and `grid-auto-rows` 来为隐式网格中创建的轨道定义尺寸大小。   

#### 2.3.0.9. 轨道尺寸与 minmax()

当设置明确的网格尺寸或者定义自动创建的行或列的尺寸时，可以给予轨道一个最小尺寸，但确保轨道
可以扩展以适应所添加的任何内容。例如，我们可能希望行永远不会小于100像素高，但是如果其内容
拉伸到300像素高时，这个行应该可以拉伸到这个高度。    

网格针对这个问题有 `minmax()` 函数。在下面例子中，我们在 `grid-auto-rows` 属性中使用了
`minmax()` 函数。所有自动创建的行最小高度为100像素，最大高度是 `auto`。使用 `auto` 意味
这高度会随着内容高度的拉伸而拉伸，最终保持与行中最高的单元格的高度相同。    

```CSS
.wrapper {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(100px, auto);
}
```    

## 2.4. 网格线

在上面的例子中，我们定义网格时是定义的网格轨道，不是网格线。不过在我们放置项目时，网格提供
了编号后的网格线使用。网格线的编号是根据文档的书写模式编号的。在从左到右的语言中，网格线 1
是在网格的左手边。在从右到左的语言中，它是在网格的右手边。网格线也可以命名。    

## 2.5. 网格单元

网格单元是网格中最小的单位，类似于表单元格。

## 2.6. 网格区域

项目可以跨越一个或多个行或列的单元格，这就创建了网格区域。网格区域必须是矩形。   

## 2.7. 槽

通过使用 `grid-column-gap` and `grid-row-gap` 或者简写的 `grid-gap` 来创建单元格之间的
槽。   

任何槽使用的空间会在将空间安排给 fr 轨道前计算出来，这些间隙就像网格轨道一样，不过我们不能
在间隙中放置任何东西。用基于线定位的术语来说，间隙就像一条 fat 线。    

## 2.8. 嵌套网格

一个网格项目也可以变成一个网格容器。   

#### 2.8.0.10. 子网格 subgrid

略。目前还没有浏览器实现了子网格。    

# 3. 网格布局与其他布局方法的关系

CSS 网格布局是设计为与CSS部分协同工作的，网格布局会作为整个布局系统的一部分。这部分解释了
网格布局如何与其他技术一起工作。    

## 3.1. Grid and flexbox  

网格布局与 flexbox 布局一个基本的不同是 flexbox 布局是为单一维度布局设计的，即行的布局或列的
布局。网格布局则是两个维度的布局，同时对行与列布局。    

### 3.1.1. fr 单位与 flex-basis   

在下面的例子中，我们在 `repeat()` 函数中原本放置整数的位置换成了 `auto-fill` 关键字，并且
设置轨道列表为 200 像素。这意味着网格会尽可能多的创建 200 像素宽的列来适应容器。    

```html
<div class="wrapper">
   <div>One</div>
   <div>Two</div>
   <div>Three</div>
</div>
```   

```css
.wrapper {
   display: grid;
   grid-template-columns: repeat(auto-fill, 200px);
}
```    

### 3.1.2. A flexible number of tracks  

上面的例子与 flexbox 还是有些不同的，flexbox 中的项目在换行前可以设置一个基础的尺寸。在网格
中如果想实现这样的效果的话，需要结合 `auto-fill` 和 `minmax()` 函数。下面的例子中我们使用
`minmax` 创建了自动填充的轨道。这些轨道最小的宽度为200像素，最大为 1fr。当浏览器确定了当前容器
可以放置多少个200像素的项目后，那么就会开始使用 1fr 来扩展可用的空间。比如说现在容器是300像素，
那么就只能放1个项目，所有项目为300像素，如果现在容器是400像素，那么容器就可以放两个项目，项目的
宽度又成了200像素，以此类推。    

```html
<div class="wrapper">
   <div>One</div>
   <div>Two</div>
   <div>Three</div>
</div>
```   

```css
.wrapper {
   display: grid;
   grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}
```    

## 3.2. 网格和绝对定位元素

### 3.2.1. 网格容器做包含块

如果想让网格容器成为包含块（这里应该特指是绝对定位元素的包含块），需要将容器定位属性设置为
`relative`。一旦这样设置了，那么`position:absolute` 定位的网格 item 就会将容器作为其包含块。   
或者当这个 item 已经被安排了网格位置的话，那么包含块就是其放置到的网格。    

下面的例子中，第3个 item 是绝对定位的，同时基于网格线进行了放置。由于网格设置了 `position:relative`
属性因此其变成了这个 item 的定位上下文。    

```html
<div class="wrapper">
   <div class="box1">One</div>
   <div class="box2">Two</div>
   <div class="box3">
    This block is absolutely positioned. In this example the grid container is the containing block and so the absolute positioning offset values are calculated in from the outer edges of the area it has been placed into.
   </div>
   <div class="box4">Four</div>
</div>
```   

```css
.wrapper {
   display: grid;
   grid-template-columns: repeat(4,1fr);
   grid-auto-rows: 200px;
   grid-gap: 20px;
   position: relative;
}
.box3 {
   grid-column-start: 2;
   grid-column-end: 4;
   grid-row-start: 1;
   grid-row-end: 3;
   position: absolute;
   top: 40px;
   left: 40px;
}
```   

![](https://github.com/temple-deng/learning-repo/blob/master/pics/gridAndAbsolute.md.png)

### 3.2.2. 网格容器作为父元素

如果网格容器中有一个绝对定位的子节点，但是容器没有创建新的定位上下文，那么与之前的例子相同。
子节点的定位上下文与其他布局中创建的定位上下文相同。举例来说，如果容器没有建立新的定位上下文，那么
绝对定位子节点的定位上下文可能就是视口。    

## 3.3. Grid and display: contents

略。    

# 4. Line-based placement with CSS Grid

## 4.1. 一个基本的例子

下面的例子中我们创建了一个 3*3 的网格。所有每个维度上就有4根线。   

在容器内部有4个子元素。如果我们没有用任何方式放置这些元素到网格中，那么他们会根据自动放置的
规则进行布局，即每个item 占据一个单元格。    

![](https://mdn.mozillademos.org/files/14663/3_hilighted_grid.png)   

```css
.wrapper {
   display: grid;
   grid-template-columns: repeat(3, 1fr);
   grid-template-rows: repeat(3, 100px);
}
```   

```html
<div class="wrapper">
   <div class="box1">One</div>
   <div class="box2">Two</div>
   <div class="box3">Three</div>
   <div class="box4">Four</div>
</div>
```     

## 4.2. 通过线的编号来定位 items

我们可以通过基于线的放置方式来控制 item 所处的网格位置。例如：   

```css
.box1 {
   grid-column-start: 1;
   grid-column-end: 2;
   grid-row-start: 1;
   grid-row-end: 4;
}
```    

当我们定位一些 items 的位置时，其他的 items 还会继续使用自动放置的规则进行布局。   

## 4.3. The grid-column and grid-row shorthands

`grid-column-start` and `grid-column-end` 属性可以结合为 `grid-column`，`grid-row-start`
和 `grid-row-end` 结合成 `grid-row`。   

```html
<div class="wrapper">
   <div class="box1">One</div>
   <div class="box2">Two</div>
   <div class="box3">Three</div>
   <div class="box4">Four</div>
</div>
```   

```CSS
.box1 {
   grid-column: 1 / 2;
   grid-row: 1 / 4;
}
.box2 {
   grid-column: 3 / 4;
   grid-row: 1 / 3;
}
.box3 {
   grid-column: 2 / 3;
   grid-row: 1 /  2;
}
.box4 {
   grid-column: 2 / 4;
   grid-row: 3 / 4;
}
```   

### 4.3.1. Default spans

当一个 item 只横跨一个轨道时，我们可以省略 `grid-column-end` or `grid-row-end`。网格
默认是横跨一个轨道的。    

## 4.4. The grid-area property

我们还可以更进一步使用一个单一的属性 `grid-area` 来定义每个区域。这个属性的值的顺序如下：   

+ `grid-row-start`
+ `grid-column-start`
+ `grid-row-end`
+ `grid-column-end`   

```html
<div class="wrapper">
   <div class="box1">One</div>
   <div class="box2">Two</div>
   <div class="box3">Three</div>
   <div class="box4">Four</div>
</div>
```   

```css
.box1 {
   grid-area: 1 / 1 / 4 / 2;
}
.box2 {
   grid-area: 1 / 3 / 3 / 4;
}
.box3 {
   grid-area: 1 / 2 / 2 / 3;
}
.box4 {
   grid-area: 3 / 2 / 4 / 4;
}
```   

![](https://github.com/temple-deng/learning-repo/blob/master/pics/grid-area.md.png)   

这个属性值的顺序可能有些奇怪。但是可以帮助我们意识到网格使用了在 CSS Writing Modes 规范中
定义的 flow-relative 方向。这里我们需要对4个 flow-relative 方向有所了解：    

+ block-start
+ block-end
+ inline-start
+ inline-end    

英语是从左向右读的语言，所以当我们文档为英语时，block-start 就是网格容器的顶部的行的线，
block-end 就是容器最后一行的线。inline-start 时左手边的列的线，因为 inline-start 总是与
当前书写模式开始写入文字的地方一致的。inline-end 就是网格最后一列的线。    

当面指定 `grid-area` 属性时，首先定义起始线 block-start 和 inline-start，之后是结束的线
block-end 和 inline-end。      


## 4.5. Counting backwards

我们也可以从网格 block 和 inline 的结尾处倒着计数，对于英语来说就是右手边的列线和最后的行线。
这些线可以定位为 -1，然后就倒着向前数，例如倒数第2根线就是 -2。值得注意的是最后的线指的是
显示网格的最后的线。    

## 4.6. Gutters or Alleys   

CSS Grid 规范包含了使用 `grid-column-gap` 和 `grid-row-gap` 属性为轨道之间添加间隙的内容。    

间隙只会出现在网格的轨道之间，不会在容器的上下左右添加空隙。    

### 4.6.1. 间隙的简写

`grid-row-gap` 和 `grid-column-gap` 也可以简写为 `grid-gap`。如果只指定一个值的话那么
`grid-row-gap` 和 `grid-column-gap` 都会使用这个值指定间隙。如果指定两个值，那么第一个值
是 `grid-row-gap` 第二个值是 `grid-column-gap`。    

```css
.wrapper {
     display: grid;
     grid-template-columns: repeat(3, 1fr);
     grid-template-rows: repeat(3, 100px);
     grid-gap: 1em 20px;
}
```    

## 4.7. 使用 span 关键字

除了指定起始线和结尾线的序号，还可以指定一个起始线，然后指定一个区域响应横跨的轨道的数量。   

```css
.box1 {
   grid-column: 1;
   grid-row: 1 / span 3;
}
.box2 {
   grid-column: 3;
   grid-row: 1 / span 2;
}
.box3 {
   grid-column: 2;
   grid-row: 1;
}
.box4 {
   grid-column: 2 / span 2;
   grid-row: 3;
}
```   

`span` 关键字也使用作为 `grid-row-start` 和 `grid-column-start` 的值，在分开写的属性中
也可以使用。    

```css
.box1 {
    grid-column: 1;
    grid-row: span 3 / 4;
}
```   

# 5. Grid template areas

在上一部分我们介绍了如何根据网格线来定位 items。当我们使用网格布局的时候，网格线总是存在的，
所以使用网格线定位是一种很直接的方法。然而，其实还有一种定位 items 的方法，我们可以独立使用这种
方法也可以和基于网格线的定位结合起来使用。这个方法是使用命名的模板区域来定位 items。    

## 5.1. 为一个网格区域命名  

我们之前介绍了 `grid-area`属性，这个属性接收4个网格线来定位一个区域。当我们定义这4根线的时候，
其实是定义了用来将区域封闭住的线。    

与此同时我们还可以使用 `grid-template-areas` 属性来定义一个命名的网格区域。例如，我们想创建一个
如下布局的内容，那么可以分为4个主要区域：   

![](https://github.com/temple-deng/learning-repo/blob/master/pics/4_Layout.png)

```css
.wrapper {
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    grid-auto-rows: minmax(100px, auto);
    grid-template-areas:
      "hd hd hd hd   hd   hd   hd   hd   hd"
      "sd sd sd main main main main main main"
      "ft ft ft ft   ft   ft   ft   ft   ft";
}

.header {
    grid-area: hd;
}
.footer {
    grid-area: ft;
}
.content {
    grid-area: main;
}
.sidebar {
    grid-area: sd;
}
```    

## 5.2. Leaving a grid cell empty

上面的例子中我们填满了整个网格区域，没有任何的空白。不过有时我们可能想要
留下一些空的单元格。那么就需要使用 `.` 字符。    

```css
.wrapper {
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    grid-auto-rows: minmax(100px, auto);
    grid-template-areas:
      "hd hd hd hd   hd   hd   hd   hd   hd"
      "sd sd sd main main main main main main"
      ".  .  .  ft   ft   ft   ft   ft   ft";
}
```   

## 5.3. Redefining the grid using media queries

```css
@media (min-width: 500px) {
    .wrapper {
        grid-template-columns: repeat(9, 1fr);
        grid-template-areas:
          "hd hd hd hd   hd   hd   hd   hd   hd"
          "sd sd sd main main main main main main"
          "sd sd sd  ft  ft   ft   ft   ft   ft";
    }
}
@media (min-width: 700px) {
    .wrapper {
        grid-template-areas:
          "hd hd hd   hd   hd   hd   hd   hd hd"
          "sd sd main main main main main ft ft";
    }
}
```    

## 5.4. Grid definition shorthands

在使用缩写时需要注意的时我们可能会重置其他属性设置的值。   

### 5.4.1. grid-template

`grid-template` 属性设置了如下的属性：   

+ `grid-template-rows`
+ `grid-template-columns`
+ `grid-template-areas`   

```css
.wrapper {
    display: grid;
    grid-template:
      "hd hd hd hd   hd   hd   hd   hd   hd" minmax(100px, auto)
      "sd sd sd main main main main main main" minmax(100px, auto)
      "ft ft ft ft   ft   ft   ft   ft   ft" minmax(100px, auto)
             / 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr ;           
}
```    

貌似首先是声明了每一行的 `grid-template-areas`，之后在每行的结尾设置了每行的尺寸，完成后就是
一个斜杠，然后跟着 `grid-template-columns`。   

### 5.4.2. grid  

上面的 `grid-template` 只是设置了显示网格，而 `grid` 同时还设置了隐式网格，包含如下的属性：   

+ `grid-template-rows`
+ `grid-template-columns`
+ `grid-template-areas`
+ `grid-auto-rows`
+ `grid-auto-columns`
+ `grid-auto-flow`   

这个属性会重置 `grid-gap` 属性为 0。     

语法的形式与 `grid-template` 相同。    

```css
.wrapper {
    display: grid;
    grid: "hd hd hd hd   hd   hd   hd   hd   hd" minmax(100px, auto)
    "sd sd sd main main main main main main" minmax(100px, auto)
    "ft ft ft ft   ft   ft   ft   ft   ft" minmax(100px, auto)
    / 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr ;           
}
```    

我们会在了解了自动放置原则后再看这个属性如何设置隐式网格。    

# 6. Layout using named grid lines

## 6.1. Naming lines when defining a grid

当我们使用 `grid-template-rows` 和 `grid-template-columns` 定义网格时，可以为某些
或者全部的网格线设置一个名字。    

当定义网格时，需要将网格线的名字写到方括号中。    

```css
.wrapper {
 display: grid;
 grid-template-columns: [main-start] 1fr [content-start] 1fr [content-end] 1fr [main-end];
  grid-template-rows: [main-start] 100px [content-start] 100px [content-end] 100px [main-end];
}
```    

一旦为网格线安排了名字，就可以通过这些名字按定位 item 而不是网格线的序号。    

```css
.box1 {
  grid-column-start: main-start;
  grid-row-start: main-start;
  grid-row-end: main-end;
}
.box2 {
  grid-column-start: content-end;
  grid-row-start: main-start;
  grid-row-end: content-end;
}
.box3 {
  grid-column-start: content-start;
  grid-row-start: main-start;
}
.box4 {
  grid-column-start: content-start;
  grid-column-end: main-end;
  grid-row-start: content-end;
}
```    

### 6.1.1. Giving lines multiple names

网格线可以安排一个以上的名字，在设置时只要在不同名字间用空格隔开就行 `[sidebar-end main-start]`。    

## 6.2. Implicit grid areas from named lines   

当我们为网格线设置名字时，如果我们为一个网格区域的网格线名字添加 -start 和 -end 后缀，那么网格
会为我们自动创建一个命名的区域。    

```css
.wrapper {
   display: grid;
   grid-template-columns: [main-start] 1fr [content-start] 1fr [content-end] 1fr [main-end];
   grid-template-rows: [main-start] 100px [content-start] 100px [content-end] 100px [main-end];
}
.thing {
  grid-area: content;
}
```   

```html
<div class="wrapper">
  <div class="thing">I am placed in an area named content.</div>
</div>
```   

![](https://github.com/temple-deng/learning-repo/blob/master/pics/grid-named-line.md.png)

## 6.3. Implicit Grid lines from named areas   

上面以及提到命名的线会创建命名的区域，反过来的话也是可以的。命名的模板区域也会创建命名的网格线。

例如之前的例子中我们命名了4个区域 `hd,ft,main,sd`，则网格会替我们命名如下的网格线：   

+ hd-start, hd-end
+ sd-start, sd-end
+ ft-start, ft-end
+ main-start, main-end

## 6.4. Multiple lines with the same name with repeat()

使用 `repeat()` 函数可以为多个线设置相同的名字。注意下面的例子中，创建一个12列的网格，前
12条列线的名字都是 col-start，最后一条貌似没有名字。    

```css
.wrapper {
      display: grid;
      grid-template-columns: repeat(12, [col-start] 1fr);
}
```   

由于现在我们有多条相同名字的网格线，所以如果我们想将一个 item 放置到起始线为 col-start 的区域
中时，网格会使用第一条col-start 命名的线，即最左边的那条。如果想要指定使用哪条，需要在线的
名字后加具体的数据。例如：   

```css
.item1 {
  grid-column: col-start / col-start 5
}
```    

`repeat()` 函数接收的是一个轨道列表，所以可以设置一个以上的轨道。例如：    

```css
.wrapper {
  grid-template-columns: repeat(4, [col1-start] 1fr [col2-start] 3fr);
}
```   

同时，如果 `repeat()` 函数中按照如下的语法定义了两个线名，则他们会合并到一起：   

```css
.wrapper {
  grid-template-columns: repeat(4, [col-start] 1fr [col-end] );
}
```   

如果不用 `repeat()` 函数就是下面这样：   

```css
.wrapper {
  grid-template-columns: [col-start] 1fr [col-end col-start] 1fr [col-end col-start] 1fr  [col-end col-start] 1fr [col-end];
}
```    

同时我们在使用 `span` 关键字时不仅可以指定横跨的线段的数量，还可以指定横跨指定名字的线段的数量。   

```css
.item2 {
  grid-row: 2;
  grid-column: col1-start 2 / span 2 col1-start;
}
```    

# 7. Auto-placement in CSS Grid Layout

除了将 items 准确的放置到已创建的网格中，CSS Grid 规范还包含了当我们创建网格后却没有将一些
items 放置到网格中时如何控制这些 items 摆放的规则。

## 7.1. Default rules for auto-placement

当我们创建一个网格时，所有的 items 默认会每个 item 占据一个单元格。默认的流向是逐行排列。
如果网格中显示的网格行是不足以放下所有 items 时，则会创建新的隐式的行来放置。   

### 7.1.1. Sizing rows in the implicit grid

默认情况下自动创建的隐式网格时 auto-sized。这意味着他们会将内容包裹住，而不会溢出。    

不过我们也可以使用 `grid-auto-rows` 来设置这些行的尺寸。甚至可以使用 `minmax()`。  

```css
.wrapper {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 10px;
  grid-auto-rows: minmax(100px, auto);
}
```    

也可以将这个属性设置为一个轨道列表，那么额外的隐式网格的行会重复。下面的例子中隐式创建的第一行为
100像素，第二行就是200px，一直重复下去，直到没有额外的内容放置到隐式网格中。   

```css
.wrapper {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 10px;
  grid-auto-rows: 100px 200px;
}
```   

### 7.1.2. Auto-placement by column

将 `grid-auto-flow` 属性设置为 `column`，则 item 就会放置到额外的列中。这种情况下，网格中
的 items 会先放置到一行中，如果所有的行放置完后还有 items 剩余，则会创建新的隐式的列。   

## 7.2. The order of auto placed items

在网格中，有的 items 可能会设置了放置的位置，有的可能就没有，那么这些没有设置位置的 items
就会自动放置。    

### 7.2.1. Items with placement properties

网格布局时第一件事就时先将设置了位置的 items 放置到所属位置中。例如下面的例子中先放置 item 2 和 5。
之后所有没有设置位置的 items 就是自动放置到空置的位置中。需要注意的是自动放置的 items 的
位置会按照 DOM 顺序放置在安排了位置的 items 位置之前，也就是说 item3 可能放在已定位的 item 2
的位置之前。    

```css
.wrapper {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 100px;
  grid-gap: 10px;
}
 .wrapper div:nth-child(2) {
   grid-column: 3;
   grid-row: 2 / 4;
 }
 .wrapper div:nth-child(5) {
   grid-column: 1 / 3;
   grid-row: 1 / 3;
}
```   

![](https://github.com/temple-deng/learning-repo/blob/master/pics/auto-place1.md.png)

### 7.2.2. Deal with items that span tracks

我们可以充分利用自动放置时的特性。例如下面的例子中，item 1 和 9 的 `grid-column-end` 和
`grid-row-end` 设置为横跨2个网格线。这时网格会根据其自动放置时位置的起始线来确定跨越的网格，
不过需要注意的是空置网格的处理，下面的 item1 理论上该和 item5 同一行，但是 item2 占据了一部分
内容，item1就放不下了，只能往下一行移。不过这个放置的顺序到底是怎么决定的，item1 虽然定义
放置属性，但是没有指定放置的位置，那么难道是按照自动放置 item 处理的吗？   

```css
.wrapper {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 100px;
  grid-gap: 10px;
}
.wrapper div:nth-child(4n+1) {
  grid-column-end: span 2;
  grid-row-end: span 2;
  background-color: #ffa94d;
}
 .wrapper div:nth-child(2) {
   grid-column: 3;
   grid-row: 2 / 4;
 }
 .wrapper div:nth-child(5) {
   grid-column: 1 / 3;
   grid-row: 1 / 3;
}
```   

![](https://github.com/temple-deng/learning-repo/blob/master/pics/auto-place2.png)   

### 7.2.3. Filling in the gaps

需要注意上面的例子中出现了一些控制的网格，目前只能解释为那些 item1 在处理时是属于未定义位置的
项目的，如果我们希望自动放置的项目填满前边出现的空置的网格，可以使用 `grid-auto-flow` 属性
设置为 `dense`。如果同时设置流方向为 column 的话，可以这样设置 `grid-auto-flow: column dense`。   

设置了这个属性后，如果网格之前移动时留下了一些空的网格，那么网格会进行回填。    

### 7.2.4. Anonymous grid items

匿名的 item 总是使用自动放置进行处理的。

# 8. Box alignment in CSS Grid Layout

## 8.1. The two axis of a grid layout

网格布局中我们有两条轴可以用来对齐，block或者叫 column 轴，及inline及row 轴。
block 轴是块级布局中块的布局轴。    

![](https://github.com/temple-deng/learning-repo/blob/master/pics/7_Block_Axis.png)

inline 轴是与 block 轴垂直的值，通常是内联流中文本的方向。   

![](https://github.com/temple-deng/learning-repo/blob/master/pics/7_Inline_Axis.png)

## 8.2. Aligning items on the block, or column, Axis

`align-self` 和 `align-items` 属性控制 block 轴上的对齐。`align-items` 是设置在网格容器上的，
可以选择下面的值：    

+ auto
+ normal
+ start
+ end
+ center
+ stretch
+ baseline
+ first baseline
+ last baseline   

```css
.wrapper {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-gap: 10px;
  grid-auto-rows: 100px;
  grid-template-areas:
    "a a a a b b b b"
    "a a a a b b b b"
    "c c c c d d d d"
    "c c c c d d d d";
  align-items: start;
}
.item1 {
  grid-area: a;
}
.item2 {
  grid-area: b;
}
.item3 {
  grid-area: c;
}
.item4 {
  grid-area: d;
}
```   

```html
<div class="wrapper">
  <div class="item1">Item 1</div>
  <div class="item2">Item 2</div>
  <div class="item3">Item 3</div>
  <div class="item4">Item 4</div>
</div>
```    

![](https://github.com/temple-deng/learning-repo/blob/master/pics/align-items.png)      


`align-items` 属性为所有的 items 设置了 `align-self` 属性。这意味着我们可以在 item 上
单独设置 `align-self` 属性。    

```css
.wrapper {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-gap: 10px;
  grid-auto-rows: 100px;
  grid-template-areas:
    "a a a a b b b b"
    "a a a a b b b b"
    "c c c c d d d d"
    "c c c c d d d d";
}
.item1 {
  grid-area: a;
}
.item2 {
  grid-area: b;
  align-self: start;
}
.item3 {
  grid-area: c;
  align-self: end;
}
.item4 {
  grid-area: d;
  align-self: center;
}
```    

### 8.2.1. Items with an intrinsic aspect ratio

`align-self` 默认是 `stretch`，除非 item 有内在的长宽比，这时默认就是 `start`。    

## 8.3. Justifying Items on the Inline or Row Axis

`justify-items` 和 `justify-self` 控制了 inline 轴的对齐。可选值与 `align-self` 是一样的。    

默认值也是 `stretch`。除非item有内部的长宽比。也就是说默认情况下，item 是会完整覆盖所占据的
网格区域的。    

同理 `justify-items` 是定义在容器上，`justify-self` 定义在 items 上。

## 8.4. Aligning the grid tracks on the block, or column, axis

当出现这样的一种情况：用作网格区域的网格轨道是小于网格容器的（意思应该是比如我们定义的网格容器是
900\*900，但是我们定义的网格区域只占了300\*300），那么我们就可以对齐这些网格轨道。    

`align-content` 是控制 block 轴的轨道对齐，`justify-content` 是控制 inline 轴轨道对齐。
可选值如下：   

+ normal
+ start
+ end
+ center
+ stretch
+ space-around
+ space-between
+ space-evenly
+ baseline
+ first baseline
+ last baseline    

`align-content` 默认是 `start`。值的注意的是使用 `space-*` 相关的值会造成 items 变大。
如果一个 item 是横跨了一个以上的网格轨道，由于额外的空白是添加到轨道之间的，所以 items
需要变得更大来吸收这些空白。`justify-content` 应该默认也是 `start`，表现应该也一样。    
