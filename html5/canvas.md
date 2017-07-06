# Canvas1

目录：  

1. [canvas元素](#part1)
2. [绘制形状](#part2)
3. [应用样式及颜色](#part3)

<a name="part1"></a>
## &lt;canvas&gt; 元素

### 回退内容

`<canvas>` 与 `<video>,<audio>,<picture>` 元素类似，可以定义一些回退的内容。直接
将内容插入到 `<canvas>` 元素中就可以。比如说，我们可以插入一些描述性的文字或者提供一张图片。  

```html
<canvas id="stockGraph" width="150" height="150">
  current stock price: $3.15 + 0.15
</canvas>

<canvas id="clock" width="150" height="150">
  <img src="images/clock.png" width="150" height="150" alt=""/>
</canvas>
```   

注意 `<canvas>` 必须有一个结束标签`</canvas>`，否则很可能后面的内容都被当做回退的内容。  

### 渲染上下文 the rendering context

&lt;canvas&gt; 元素会创建一个固定尺寸的绘画平面，可以暴露出一个或者多个渲染上下文，
这些渲染上下文会用来创建和修改要展示的内容。一般来说都是 2D的上下文，但是 WebGL 可以提供一个 3D 的上下文。  

我们通过 `getContext()` 方法来取得渲染上下文及其绘制函数，参数就是上下文的类型，这里是 `'2d'`。   

```javascript
var canvas = document.getElementById('tutorial');
var ctx = canvas.getContext('2d');
```   

<a name="part2"></a>
## 绘制形状

### 绘制矩形

不像 SVG， canvas 支持一种原始形状，就是矩形。有3种绘制矩形的函数：  

`fillRect(x, y, width, height)`  

绘制一个填充好的矩形。  

`strokeRect(x, y, width, height)`   

绘制矩形轮廓。  

`clearRect(x, y, width, height)`  

清除指定的矩形区域，使其完全透明。  

不同与路径函数，矩形函数会在调用会立即绘制在画布上。  

### 绘制路径

另一个原始形状就是 paths。路径是一系列点，通过不同宽度、不同颜色及不同形状，不同曲度的线段连接起来。  

使用路径来制作不同的形状需要一些额外的步骤：  

1. 首先，创建路径
2. 之后使用绘制命令在路径内绘制
3. 之后闭合路径
4. 一旦创建了路径，就可以描边或者填充路径。  

第一步创建路径就是调用 `beginPath()`。在内部，路径被存储为一系列的子路径，这些子路径一起组合成一个形状。第二步就是调用那些实际上用来绘制路径的方法。第三步调用 `closePath` 是可选的，这一步会尝试从当前点绘制一条执行到起始点。

注意：当当前路径是空路径时，例如在立即调用 `beginPath` 之后或者在一个新建的 canvas 上时，第一个路径构造命令总会被当做是 `moveTo()`，不管其本身到底是哪个命令。基于这个元素，我们最好在每次重设完路径后先设定路径的起始位置。  

注意：当调用 `fill()` 时，任何打开的形状都是自动闭合。不过调用 `stroke` 没有这种效果。  

```javascript
function draw() {
  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.moveTo(75, 50);
    ctx.lineTo(100, 75);
    ctx.lineTo(100, 25);
    ctx.fill();
  }
}
```  

#### 弧线

`arc(x, y, radius, startAngle, endAngle, anticlockwise)`  

`arcTo(x1, y1, x2, y2, radius)`  

通过给定的控制点与半径绘制一条弧线，通过直线连接到前一点。   

注意，这两个函数中的角度是用弧度表示，而不是角度，通过这个公式将角度转为弧度： `弧度 = (Math.PI/180) * 角度`。  


#### 贝塞尔曲线和二次曲线

`quadraticCurveTo(cp1x, cp1y, x, y)`  

从当前笔的位置绘制一条二次贝塞尔曲线到 x和y 声明的终点的位置， cp1x, cp1y 声明了控制点的位置。  

`bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y)`  

同理，三次贝塞尔曲线，两个控制点。  


#### 矩形

除了用上面提到的三个方法来绘制矩形，还有一个 `rect()` 方法，会在当前路径中添加一个矩形的路径。  

`rect(x, y, width, height)`。  

### Path2D objects

`Path2D()`  

返回一个新的 Path2D 对象实例，有一个可选的参数，可以是另一条路径，或者只是一个 SVG 路径的字符串。  

```javascript
new Path2D();     // empty path object
new Path2D(path); // copy from another Path2D object
new Path2D(d);    // path from SVG path data
```   

所有的路径方法在 Path2D 对象上都是可用的。  

`Path2D.addPath(path, [, transform])`  

在当前路径中添加一个路径，可以附带一个可选的转换矩阵。   

```javascript
function draw() {
  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');

    var rectangle = new Path2D();
    rectangle.rect(10, 10, 50, 50);

    var circle = new Path2D();
    circle.moveTo(125, 35);
    circle.arc(100, 35, 25, 0, 2 * Math.PI);

    ctx.stroke(rectangle);
    ctx.fill(circle);
  }
}
```   

![Path2D 对象](https://mdn.mozillademos.org/files/9851/path2d.png)  

<a name="part3 "></a>
## 应用样式和颜色

### 颜色

`fillStyle = color`  填充形状  

`strokeStyle = color` 形状的轮廓线  

color 可以是一个代表CSS颜色的字符串（只要CSS颜色能用的格式都可以），一个渐变对象，或者一个 pattern 对象。默认情况，填充色和轮廓线的颜色都是黑色。  



### 透明度 Transparency

`globalAlpha = TransparencyValue`  

将指定的透明度应用到将来在画布上绘制的所有形状上。值从0.0（完全透明）到1.0（完全不透明），默认是1.0。  


### 直线样式

`lineWidth = value`  

`lineCap = type` 直线末端的样式  

`lineJoin = type` 线相交出尾端的样式  

`miterLimit = value` 限制当两条线相交时交接处最大长度；所谓交接处长度（斜接长度）是指线条交接处内角顶点到外角顶点的长度。

`getLineDash()` 返回一个包含当前虚线样式，长度为非负偶数的数组。  

`setLineDash(segments)`  设置当前虚线样式。   

`lineDashOffset = Value`  设置虚线样式的起始偏移量。  

属性 `lineCap` 的值决定了线段端点显示的样子。它可以为下面的三种的其中之一：`butt`，`round` 和 `square`。默认是 `butt`。  

左边的线用了默认的 `butt` 。可以注意到它是与辅助线齐平的。中间的是 `round` 的效果，端点处加上了半径为一半线宽的半圆。右边的是 `square` 的效果，端点处加上了等宽且高度为一半线宽的方块。  

![lineCap](https://developer.mozilla.org/@api/deki/files/88/=Canvas_linecap.png)  


`lineJoin` 的属性值决定了图形中两线段连接处所显示的样子。它可以是这三种之一：`round`, `bevel` 和 `miter`。默认是 `miter`。  

这里我同样用三条折线来做例子，分别设置不同的 `lineJoin` 值。最上面一条是 `round` 的效果，边角处被磨圆了，圆的半径等于线宽。中间和最下面一条分别是 `bevel` 和 `miter` 的效果。当值是 miter 的时候，线段会在连接处外侧延伸直至交于一点，延伸效果受到下面将要介绍的 `miterLimit` 属性的制约。  

![lineJoin](https://mdn.mozillademos.org/files/237/Canvas_linejoin.png)  

用 `setLineDash` 方法和 `lineDashOffset` 属性来制定虚线样式. `setLineDash` 方法接受一个数组，来指定线段与间隙的交替；`lineDashOffset` 属性设置起始偏移量.  


### 渐变

我们可以用线性或者径向的渐变来填充或描边。我们用下面的方法新建一个 canvasGradient 对象，并且赋给图形的 fillStyle 或 strokeStyle 属性。  

`createLinearGradient(x1, y1, x2, y2)`  

createLinearGradient 方法接受 4 个参数，表示渐变的起点 (x1,y1) 与终点 (x2,y2)。   

`createRadialGradient(x1, y1, r1, x2, y2, r2)`  

createRadialGradient 方法接受 6 个参数，前三个定义一个以 (x1,y1) 为原点，半径为 r1 的圆，后三个参数则定义另一个以 (x2,y2) 为原点，半径为 r2 的圆。  

创建出 canvasGradient 对象后，我们就可以用 `addColorStop` 方法给它上色了。  

`gradient.addColorStop(position, color)`  
addColorStop 方法接受 2 个参数，position 参数必须是一个 0.0 与 1.0 之间的数值，表示渐变中颜色所在的相对位置。例如，0.5 表示颜色会出现在正中间。color 参数必须是一个有效的 CSS 颜色值（如 #FFF， rgba(0,0,0,1)，等等）。  



### 模式 Patterns

上一节的一个例子里面，我用了循环来实现图案的效果。其实，有一个更加简单的方法：createPattern。  

`createPattern(image, type)`  

新建并返回一个 canvas pattern 对象。`image` 是一个 CanvasImageSource（一个HTML 图片元素，或者另一个 canvas,或者一个 video 元素等等）。`type` 是一个指定如果使用这张图片的字符串。  

`type` 必须是下面值之一：repeat, repeat-x, repeat-y, no-repeat。  

图案的应用跟渐变很类似的，创建出一个 pattern 之后，赋给 fillStyle 或 strokeStyle 属性即可。  


### 阴影 shadows

使用阴影只涉及四个属性：  

`shadowOffsetX = float`, `shadowOffsetY = float`  

shadowOffsetX 和 shadowOffsetY 用来设定阴影在 X 和 Y 轴的延伸距离，它们是不受变换矩阵所影响的。负值表示阴影会往上或左延伸，正值则表示会往下或右延伸，它们默认都为 0。  

`shadowBlur = float`  

shadowBlur 用于设定阴影的模糊程度，其数值并不跟像素数量挂钩，也不受变换矩阵的影响，默认为 0。  

`shadowColor = color`  shadowColor 是标准的 CSS 颜色值，用于设定阴影颜色效果，默认是全透明的黑色。  



### canvas fill rules

当我们用到 fill（或者 clip和isPointinPath ）你可以选择一个填充规则，该填充规则根据某处在路径的外面或者里面来决定该处是否被填充，这对于自己与自己路径相交或者路径被嵌套的时候是有用的。   

两个可能的值：

 + "nonzero": 默认值.
 + "evenodd": 
