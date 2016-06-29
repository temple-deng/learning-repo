# SVG

标签（空格分隔）： 未分类

---

## 如何在浏览器中显示SVG
---
SVG文件是纯粹的XML，或许大家更为关心的是如何在Web浏览器中让SVG显示。要在浏览器中显示（前提是浏览器支持），可以通过几种方法来实现：

+ 指向SVG文件地址
+ 将SVG直接嵌套在HTML中

而将SVG图像嵌入到HTML文件有多种方法：

+ 使用&lt;iframe&gt;元素来嵌入SVG图像
+ 使用&lt;img&gt;元素来嵌入SVG图像
+ 将SVG图像作为背景图像嵌入
+ 直接使用&lt;svg&gt;元素
+ 使用&lt;mbed&gt;元素来嵌入SVG图像
+ 使用&lt;object&gt;元素来嵌入SVG图像

##  SVG文件结构
---
一个独立的SVG文件，也就是平时看到的以扩展名.svg结尾的文件，他主要包括：
+ XML声明
+ `<svg>`根元素包括一个用来描述SVG的XML声明空间。

SVG文件使用的是XML声明方式：
`<?xml version="1.0"?>`

SVG文件中<svg>的声明空间是:
`<svg xmlns="http://www.w3.org/2000/svg">`

## 基本形状
---
**矩形rect**
属性：
+ x : 矩形左上角x位置
+ y : 矩形左上角y位置 
+ rx : 圆角x方向的半径
+ ry : 圆角y方向的半径
+ width : 宽度
+ height : 高度

**圆形circle**
属性：
+ r : 半径
+ cx : 圆心的x位置
+ cy : 圆心的y位置

**椭圆形ellipse**
属性 :
+ rx : 椭圆的x半径
+ ry : 椭圆的y半径
+ cx : 椭圆圆心的x位置
+ cy : 椭圆圆心的y位置

**线条line** 它取两个点的位置作为属性，指定这条线的起点和终点位置。
属性 :
+ x1 : 起点的x位置
+ y1 : 起点的y位置
+ x2 : 终点的x位置
+ y2 : 终点的y位置

**折线polyline** 一组连接在一起的直线。因为它可以有很多的点，折线的的所有点位置都放在一个points属性中：

> &lt;polyline points="60 110, 65 120, 70 115, 75 130, 80 125, 85 140, 90 135, 95 150, 100 145"/&gt;

属性 :
+ points : 点集数列。每个数字用空白、逗号、终止命令符或者换行符分隔开。每个点必须包含2个数字，一个是x坐标，一个是y坐标。所以点列表 (0,0), (1,1) 和(2,2)可以写成这样：“0 0, 1 1, 2 2”。

**多边形polygon**

polygon和折线很像，它们都是由连接一组点集的直线构成。不同的是，polygon的路径在最后一个点处自动回到第一个点。需要注意的是，矩形也是一种多边形，如果需要更多灵活性的话，你也可以用多边形创建一个矩形。

> &lt;polygon points="50 160, 55 180, 70 180, 60 190, 65 205, 50 195, 35 205, 40 190, 30 180, 45 180"/&gt;

属性：
+ points : 点集数列。每个数字用空白符、逗号、终止命令或者换行符分隔开。每个点必须包含2个数字，一个是x坐标，一个是y坐标。所以点列表 (0,0), (1,1) 和(2,2)可以写成这样：“0 0, 1 1, 2 2”。路径绘制完后闭合图形，所以最终的直线将从位置(2,2)连接到位置(0,0)。

##  路径
---
path元素的形状是通过属性d定义的，属性d的值是一个“命令+参数”的序列.

每一个命令都用一个关键字母来表示，比如，字母“M”表示的是“Move to”命令，当解析器读到这个命令时，它就知道你是打算移动到某个点。跟在命令字母后面的，是你需要移动到的那个点的x和y轴坐标。比如移动到(10,10)这个点的命令，应该写成“M 10 10”。这一段字符结束后，解析器就会去读下一段命令。每一个命令都有两种表示方式，一种是用大写字母，表示采用绝对定位。另一种是用小写字母，表示采用相对定位（例如：从上一个点开始，向上移动10px，向左移动7px）。

因为属性d采用的是用户坐标系统，所以不需标明单位。在后面的教程中，我们会学到如何让变换路径，以满足更多需求。


### 直线命令
`<path>`元素里有5个画直线的命令，顾名思义，直线命令就是在两个点之间画直线。首先是“Move to”命令，M，前面已经提到过，它需要两个参数，分别是需要移动到的点的x轴和y轴的坐标。假设，你的画笔当前位于一个点，在使用M命令移动画笔后，只会移动画笔，但不会在两点之间画线。因为M命令仅仅是移动画笔，但不画线。所以M命令经常出现在路径的开始处，用来指明从何处开始画。

能够真正画出线的命令有三个（M命令是移动画笔位置，但是不画线），最常用的是“Line to”命令，L，L需要两个参数，分别是一个点的x轴和y轴坐标，L命令将会在当前位置和新位置（L前面画笔所在的点）之间画一条线段。

另外还有两个简写命令，用来绘制平行线和垂直线。H，绘制平行线。V，绘制垂直线。这两个命令都只带一个参数，标明在x轴或y轴移动到的位置，因为它们都只在坐标轴的一个方向上移动。

```html
<svg width="100px" height="100px" version="1.1" xmlns="http://www.w3.org/2000/svg">
  
  <path d="M10 10 H 90 V 90 H 10 L 10 10"/>

  <!-- Points -->
  <circle cx="10" cy="10" r="2" fill="red"/>
  <circle cx="90" cy="90" r="2" fill="red"/>
  <circle cx="90" cy="10" r="2" fill="red"/>
  <circle cx="10" cy="90" r="2" fill="red"/>

</svg>
```

最后，我们可以通过一个“闭合路径命令”Z来简化上面的path，Z命令会从当前点画一条直线到路径的起点，尽管我们不总是需要闭合路径，但是它还是经常被放到路径的最后。另外，Z命令不用区分大小写。

所以上面例子里用到的路径，可以简化成这样：

`<path d="M 10 10 H 90 V 90 H 10 Z" fill="transparent" stroke="black">`

### 曲线命令
绘制平滑曲线的命令有三个，其中两个用来绘制贝塞尔曲线，另外一个用来绘制弧形或者说是圆的一部分。贝塞尔曲线的类型有很多，但是在path元素里，只存在两种贝塞尔曲线：三次贝塞尔曲线C，和二次贝塞尔曲线Q。

三次贝塞尔曲线需要定义一个点和两个控制点，所以用C命令创建三次贝塞尔曲线，需要设置三组坐标参数：

`C x1 y1, x2 y2, x y (or c dx1 dy1, dx2 dy2, dx dy)`

这里的最后一个坐标(x,y)表示的是曲线的终点，另外两个坐标是控制点，(x1,y1)是起点的控制点，(x2,y2)是终点的控制点。

你可以将若干个贝塞尔曲线连起来，从而创建出一条很长的平滑曲线。通常情况下，一个点某一侧的控制点是它另一侧的控制点的对称（以保持斜率不变）。这样，你可以使用一个简写的贝塞尔曲线命令S，如下所示：

`S x2 y2, x y (or s dx2 dy2, dx dy)`

S命令可以用来创建与之前那些曲线一样的贝塞尔曲线，但是，如果S命令跟在一个C命令或者另一个S命令的后面，它的第一个控制点，就会被假设成前一个控制点的对称点。如果S命令单独使用，前面没有C命令或者另一个S命令，那么它的两个控制点就会被假设为同一个点。下面是S命令的语法示例，右图中的某个控制点用红色标示，与它对称的控制点用蓝色标示。

另一种可用的贝塞尔曲线是二次贝塞尔曲线Q，它比三次贝塞尔曲线简单，只需要一个控制点，用来确定起点和终点的曲线斜率。因此它需要两组参数，控制点和终点坐标。

`Q x1 y1, x y (or q dx1 dy1, dx dy)`

就像三次贝塞尔曲线有一个S命令，二次贝塞尔曲线有一个差不多的T命令，可以通过更简短的参数，延长二次贝塞尔曲线

`T x y (or t dx dy)`

和之前一样，快捷命令T会通过前一个控制点，推断出一个新的控制点。这意味着，在你的第一个控制点后面，可以只定义终点，就创建出一个相当复杂的曲线。需要注意的是，T命令前面必须是一个Q命令，或者是另一个T命令，才能达到这种效果。如果T单独使用，那么控制点就会被认为和终点是同一个点，所以画出来的将是一条直线。

弧形命令A是另一个创建SVG曲线的命令。

`A rx ry x-axis-rotation large-arc-flag sweep-flag x y`

rx 是x轴半径， ry是y轴半径， x-axis-rotation 是旋转角度， large-arc-flag是选择较长还是较短的弧线， 0表示选择较短的弧线， 1表示选择较长的弧线。 sweep-flag是选择顺时针的线还是逆时针的线， 0表示逆时针方向的线， 1表示顺时针方向的线， x y 是终点的坐标。

## 填充和边框
---
大多数基本的涂色可以通过在元素上设置两个属性来搞定：fill属性和stroke属性。fill属性设置对象内部的颜色，stroke属性设置绘制对象的线条的颜色。你可以使用在HTML中的CSS颜色命名方案定义它们的颜色，比如说颜色名（像red这种）、rgb值（像rgb(255,0,0)这种）、十六进制值、rgba值，等等。

```html
<rect x="10" y="10" width="100" height="100" stroke="blue" fill="purple"
       fill-opacity="0.5" stroke-opacity="0.8"/>
```

### 描边
stroke-width属性定义了描边的宽度。注意，描边是以路径为中心线绘制的，在上面的例子里，路径是粉红色的，描边是黑色的。如你所见，路径的每一侧都有均匀分布的描边。

第二个影响描边的属性是stroke-linecap属性，如上所示。它控制边框终点的形状。

stroke-linecap属性的值有三种可能值：
+ butt用直边结束线段，它是常规做法，线段边界90度垂直于描边的方向、贯穿它的终点。
+ square的效果差不多，但是会稍微超出实际路径的范围，超出的大小由stroke-width控制。
+ round表示边框的终点是圆角，圆角的半径也是由stroke-width控制的。

![linecap][1]

还有一个stroke-linejoin属性，用来控制两条描边线段之间，用什么方式连接。

![linejoin][2]

stroke-dasharray属性的参数，是一组用逗号分割的数字组成的数列。注意，和path不一样，这里的数字必须用逗号分割，虽然也可以插入空格，但是数字之间必须用逗号分开。每一组数字，第一个用来表示实线，第二个用来表示空白。所以在上面的例子里，第二个路径会先画5px实线，紧接着是5px空白，然后又是5px实线，从而形成虚线。如果你想要更复杂的虚线模式，你可以定义更多的数字。上面例子里的第一个，就定义了3个数字，这种情况下，数字会循环两次，形成一个偶数的虚线模式。所以该路径首先是5px实线，然后是10px空白，然后是5px实线，接下来循环这组数字，形成5px空白、10px实线、5px空白。然后这种模式会继续循环。

另外还有一些关于填充和边框的属性，包括fill-rule，用于定义如何给图形重叠的区域上色；stroke-miterlimit，定义什么情况下绘制或不绘制边框连接的miter效果；还有stroke-dashoffset，定义虚线开始的位置。

### 使用CSS
除了定义对象的属性外，你也可以通过CSS来样式化填充和描边。语法和在html里使用CSS一样，只不过你要把background-color、border改成fill和stroke。注意，不是所有的属性都能用CSS来设置。上色和填充的部分一般是可以用CSS来设置的，比如fill，stroke，stroke-dasharray等，但是不包括下面会提到的渐变和图案等功能。另外，width、height，以及路径的命令等等，都不能用css设置。判断它们能不能用CSS设置还是比较容易的。

CSS可以利用style属性插入到元素的行间：
`<rect x="10" height="180" y="10" width="180" style="stroke: black; fill: red;"/>`

或者利用&lt;style&gt;设置一段样式段落。就像在html里这样的&lt;style&gt;一般放在&lt;head&gt;里，在svg里&lt;style&gt;则放在&lt;defs&gt;标签里。&lt;defs&gt;表示定义，这里面可以定义一些不会在SVG图形中出现、但是可以被其他元素使用的元素。

```xml
<?xml version="1.0" standalone="no"?>
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg" version="1.1">
  <defs>
    <style type="text/css"><![CDATA[
       #MyRect {
         stroke: black;
         fill: red;
       }
    ]]></style>
  </defs>
  <rect x="10" height="180" y="10" width="180" id="MyRect"/>
</svg>
```

##  渐变
---
有两种类型的渐变：线性渐变和径向渐变。你必须给渐变内容指定一个id属性，否则文档内的其他元素就不能引用它。为了让渐变能被重复使用，渐变内容需要定义在&lt;defs&gt;标签内部，而不是定义在形状上面。

###  线性渐变
线性渐变沿着直线改变颜色，要插入一个线性渐变，你需要在SVG文件的defs元素内部，创建一个&lt;linearGradient&gt; 节点。

```html
<svg width="120" height="360" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="Gradient1">
            <stop class="stop1" offset="0%"/>
            <stop class="stop2" offset="50%"/>
            <stop class="stop3" offset="100%"/>
        </linearGradient>
        <linearGradient id="Gradient2" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="red"/>
            <stop offset="50%" stop-color="black" stop-opacity="0"/>
            <stop offset="100%" stop-color="blue"/>
        </linearGradient>
        <linearGradient id="Gradient3" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="deeppink" stop-opacity="0.5" />
            <stop offset="50%" stop-color="black" stop-opacity="0"/>
            <stop offset="100%" stop-color="yellowgreen" />
        </linearGradient>
        <style type="text/css"><![CDATA[
        #rect1 { fill: url(#Gradient1); }
        .stop1 { stop-color: red; }
        .stop2 { stop-color: black; stop-opacity: 0; }
        .stop3 { stop-color: blue; }
        ]]></style>
    </defs>

    <rect id="rect1" x="10" y="10" rx="15" ry="15" width="100" height="100"/>
    <rect x="10" y="120" rx="15" ry="15" width="100" height="100" fill="url(#Gradient2)"/>

    <rect x="10" y="230" rx="15" ry="15" width="100" height="100" fill="url(#Gradient3)" />
</svg>
```

   ![线性渐变][3]

以上是一个应用了线性渐变的&lt;rect&gt;元素的示例。线性渐变内部有几个&lt;stop&gt; 结点，这些结点通过指定位置的offset（偏移）属性和stop-color（颜色中值）属性来说明在渐变的特定位置上应该是什么颜色；可以直接指定这两个属性值，也可以通过CSS来指定他们的值，该例子中混合使用了这两种方法。例如：该示例中指明了渐变开始颜色为红色，到中间位置时变成半透明的黑色，最后变成蓝色。虽然你可以根据需求按照自己的喜好插入很多中间颜色，但是偏移量应该始终从0%开始（或者0也可以，百分号可以扔掉），到100%（或1）结束。如果stop设置的位置有重合，将使用XML树中较晚设置的值。而且，类似于填充和描边，你也可以指定属性stop-opacity来设置某个位置的半透明度（同样，对于FF3你也可以设置rgba值）。

使用渐变时，我们需要在一个对象的属性fill或属性stroke中引用它，这跟你在CSS中使用url引用元素的方法一样。在本例中，url只是一个渐变的引用，我们已经给这个渐变一个ID——“Gradient”。要想附加它，将属性fill设置为url(#Gradient)即可。现在对象就变成多色的了，也可以用同样的方式处理stroke。

&lt;linearGradient&gt;元素还需要一些其他的属性值，它们指定了渐变的大小和出现范围。渐变的方向可以通过两个点来控制，它们分别是属性x1、x2、y1和y2，这些属性定义了渐变路线走向。渐变色默认是水平方向的，但是通过修改这些属性，就可以旋转该方向。(怎么指定大小和出现范围还未知)


###  径向渐变
创建径向渐变需要在文档的defs中添加一个&lt;radialGradient&gt;元素。

```html
<svg width="120" height="240" version="1.1" xmlns="http://www.w3.org/2000/svg">
  <defs>
      <radialGradient id="RadialGradient1">
        <stop offset="0%" stop-color="red"/>
        <stop offset="100%" stop-color="blue"/>
      </radialGradient>
      <radialGradient id="RadialGradient2" cx="0.25" cy="0.25" r="0.25">
        <stop offset="0%" stop-color="red"/>
        <stop offset="100%" stop-color="blue"/>
      </radialGradient>
  </defs>
 
  <rect x="10" y="10" rx="15" ry="15" width="100" height="100" fill="url(#RadialGradient1)"/> 
  <rect x="10" y="120" rx="15" ry="15" width="100" height="100" fill="url(#RadialGradient2)"/> 
  
</svg>
```

![径向渐变][4]

中值（stops）的使用方法与之前一致，但是现在这个对象的颜色是中间是红色的，且向着边缘的方向渐渐的变成蓝色。跟线性渐变一样，&lt;radialGradient&gt; 节点可以有多个属性来描述其位置和方向，但是它更加复杂。径向渐变也是通过两个点来定义其边缘位置，两点中的第一个点定义了渐变结束所围绕的圆环，它需要一个中心点，由cx和cy属性及半径r来定义，通过设置这些点我们可以移动渐变范围并改变它的大小，如上例的第二个&lt;rect&gt;所展示的。

第二个点被称为焦点，由fx和fy属性定义。第一个点描述了渐变边缘位置，焦点则描述了渐变的中心，如下例:

```html
<svg width="120" height="120" version="1.1"
  xmlns="http://www.w3.org/2000/svg">
  <defs>
      <radialGradient id="Gradient"
            cx="0.5" cy="0.5" r="0.5" fx="0.25" fy="0.25">
        <stop offset="0%" stop-color="red"/>
        <stop offset="100%" stop-color="blue"/>
      </radialGradient>
  </defs>
 
  <rect x="10" y="10" rx="15" ry="15" width="100" height="100"
        fill="url(#Gradient)" stroke="black" stroke-width="2"/>

  <circle cx="60" cy="60" r="50" fill="transparent" stroke="white" stroke-width="2"/>
  <circle cx="35" cy="35" r="2" fill="white" stroke="white"/>
  <circle cx="60" cy="60" r="2" fill="white" stroke="white"/>
  <text x="38" y="40" fill="white" font-family="sans-serif" font-size="10pt">(fx,fy)</text>
  <text x="63" y="63" fill="white" font-family="sans-serif" font-size="10pt">(cx,cy)</text>
  
</svg>
```

![焦点][5]

线性渐变和径向渐变都需要一些额外的属性用于描述渐变过程，这里我希望额外提及一个spreadMethod属性，该属性控制了当渐变到达终点的行为，但是此时该对象尚未被填充颜色。这个属性可以有三个值：pad、reflect或repeat。Pad就是目前我们见到的效果，即当渐变到达终点时，最终的偏移颜色被用于填充对象剩下的空间。reflect会让渐变一直持续下去，不过它的效果是与渐变本身是相反的，以100%偏移位置的颜色开始，逐渐偏移到0%位置的颜色，然后再回到100%偏移位置的颜色。repeat也会让渐变继续，但是它不会像reflect那样反向渐变，而是跳回到最初的颜色然后继续渐变。

```html
<svg width="220" height="220" version="1.1" xmlns="http://www.w3.org/2000/svg">
  <defs>
      <radialGradient id="GradientPad"
            cx="0.5" cy="0.5" r="0.4" fx="0.75" fy="0.75"
            spreadMethod="pad">
        <stop offset="0%" stop-color="red"/>
        <stop offset="100%" stop-color="blue"/>
      </radialGradient>
      <radialGradient id="GradientRepeat"
            cx="0.5" cy="0.5" r="0.4" fx="0.75" fy="0.75"
            spreadMethod="repeat">
        <stop offset="0%" stop-color="red"/>
        <stop offset="100%" stop-color="blue"/>
      </radialGradient>
      <radialGradient id="GradientReflect"
            cx="0.5" cy="0.5" r="0.4" fx="0.75" fy="0.75"
            spreadMethod="reflect">
        <stop offset="0%" stop-color="red"/>
        <stop offset="100%" stop-color="blue"/>
      </radialGradient>
  </defs>

  <rect x="10" y="10" rx="15" ry="15" width="100" height="100" fill="url(#GradientPad)"/>
  <rect x="10" y="120" rx="15" ry="15" width="100" height="100" fill="url(#GradientRepeat)"/>
  <rect x="120" y="120" rx="15" ry="15" width="100" height="100" fill="url(#GradientReflect)"/>

  <text x="15" y="30" fill="white" font-family="sans-serif" font-size="12pt">Pad</text>
  <text x="15" y="140" fill="white" font-family="sans-serif" font-size="12pt">Repeat</text>
  <text x="125" y="140" fill="white" font-family="sans-serif" font-size="12pt">Reflect</text>

</svg>
```

![spreadMethod][6]

两种渐变都有一个叫做 gradientUnits（渐变单元）的属性，它描述了用来描述渐变的大小和方向的单元系统。该属性有两个值：userSpaceOnUse 、objectBoundingBox。默认值为objectBoundingBox，我们目前看到的效果都是在这种系统下的，它大体上定义了对象的渐变大小范围，所以你只要指定从0到1的坐标值，渐变就会自动的缩放到对象相同大小。userSpaceOnUse使用绝对单元，所以你必须知道对象的位置，并将渐变放在同样地位置上。上例中的radialGradient需要被重写成：

`<radialGradient id="Gradient" cx="60" cy="60" r="50" fx="35" fy="35" gradientUnits="userSpaceOnUse">`

## 文字
---
在SVG中有两种截然不同的文本模式. 一种是写在图像中的文本，另一种是SVG字体。关于后者我们将在教程的后面进行讲解，现在我们主要集中前者：写在图像中的文本。

在一个SVG文档中，`<text>`元素内部可以放任何的文字。

`<text x="10" y="10">Hello World!</text>`

属性x和属性y性决定了文本在视口中显示的位置。属性text-anchor，可以有这些值：start、middle、end或inherit，允许决定从这一点开始的文本流的方向。

和形状元素类似，属性fill可以给文本填充颜色，属性stroke可以给文本描边，形状元素和文本元素都可以引用渐变或图案, 相比较CSS2.1只能绘制简单的彩色文字，SVG显得更具有优势。

### 设置字体属性
文本的一个至关重要的部分是它显示的字体。SVG提供了一些属性，类似于它们的CSS同行，用来激活文本选区。下列每个属性可以被设置为一个SVG属性或者成为一个CSS声明：font-family、font-style、font-weight、font-variant、font-stretch、font-size、font-size-adjust、kerning、letter-spacing、word-spacing和text-decoration。

`<tspan>`元素用来标记大块文本的子部分，它必须是一个text元素或别的tspan元素的子元素。一个典型的用法是把句子中的一个词变成粗体红色。

```html
<text>
  <tspan font-weight="bold" fill="red">This is bold and red</tspan>
</text>
```

tspan的属性：

+ x : 为容器设置一个新绝对x坐标。它覆盖了默认的当前的文本位置。这个属性可以包含一个数列，它们将一个一个地应用到tspan元素内的每一个字符上。
+ dx : 从当前位置，用一个水平偏移开始绘制文本。这里，你可以提供一个值数列，可以应用到连续的字体，因此每次累积一个偏移。此外还有属性y和属性dy作垂直转换。
+ rotate : 把所有的字符旋转一个角度。如果是一个数列，则使每个字符旋转分别旋转到那个值，剩下的字符根据最后一个值旋转。
+ textLength: 这是一个很模糊的属性，给出字符串的计算长度。它意味着如果它自己的度量文字和长度不满足这个提供的值，则允许渲染引擎精细调整字型的位置。
+ tref : tref元素允许引用已经定义的文本，高效地把它复制到当前位置。你可以使用xlink:href属性，把它指向一个元素，取得其文本内容。你可以独立于源样式化它、修改它的外观。
+ textPath : 该元素利用它的xlink:href属性取得一个任意路径，把字符对齐到路径，于是字体会环绕路径、顺着路径走.


## transform
---
### 移动translate
`translate(<tx> [<ty>])`

tx是x轴移动距离， ty是y轴移动距离， ty是可选的， 如果省略， 默认值是0. tx和ty可以通过空格或者逗号分隔。

`<circle cx="0" cy="0" r="100" transform="translate(100 300)" />`

### 缩放scale
`scale(<sx> [<sy>])`

sx代表x轴缩放值， sy代表y轴缩放值， sy值是可选的， 如果省略默认值等于sx， 它们是无单位值。

`<rect width="150" height="100" transform="scale(2, 0.5)" x="0" y="0" />`

### 倾斜skew
`skewX(<skew-angle>)   skewY(<skew-angle>)`

倾斜角度声明时无单位角度的，默认是度。

### 旋转rotate
`rotate(<rotate-angle> [<cx> <cy>])`

rotate()函数对于给定的点和旋转角度值进行旋转。

可选的cx和cy值代表无单位的旋转中心点。 如果没有设置cx和cy， 旋转点是当前用户坐标系的原点。

在函数rotate()中声明旋转中心点一个快捷方式类似于CSS中设置`transform: rotate()` 和 `transform-origin`. SVG中默认的旋转中心是当前使用的用户坐标系的左上角， 这样也许你无法创建想要的旋转效果， 你可以在rotate()中声明一个新的中心点。




  [1]: http://o8qr19y3a.bkt.clouddn.com/svg/png/SVG_Stroke_Linecap_Example.png
  [2]: http://o8qr19y3a.bkt.clouddn.com/svg/png/SVG_Stroke_Linejoin_Example.png
  [3]: http://o8qr19y3a.bkt.clouddn.com/svg/png/linear-gradient1.png
  [4]: http://o8qr19y3a.bkt.clouddn.com/svg/png/radialGradient1.png
  [5]: http://o8qr19y3a.bkt.clouddn.com/svg/png/SVG_Radial_Grandient_Focus_Example.png
  [6]: http://o8qr19y3a.bkt.clouddn.com/svg/png/SVG_SpreadMethod_Example.png