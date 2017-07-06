# Canvas

目录：  

1. [绘制文本](#part1)
2. [使用图片](#part2)
3. [变形](#part3)
4. [组合和剪裁](#part4)

<a name="part1"></a>

## 绘制文本

### 绘制文本

canvas 渲染上下文提供了两种方式渲染文本：  

`fillText(text, x, y [, naxWidth])`  

在(x,y) 处绘制给定的文本，可选传入绘制的最大的宽度。这里的宽度指的是将文字压缩到这么宽，不是剪裁。  

`strokeText(text, x, y [, maxWidth])`   

### 给文本添加样式

`font = value` : 使用和 CSS font 一样的语法。默认是 `10px sans-serif`。  

`textAlign = value` 可选的值有: start, end, left, right, center。默认是 start。这个指的是文字与起始点的对齐方式，比如说end就是文字左移，最后的部分与起始点对齐。  

`textBaseline = value` 可选的值有：top, handing,alphabetic,ideographic, bottom。默认是alphabetic  

`direction = value` 可选的值有：ltr, rtl, inherit。默认是 inherit。  


### 高级文本测量

`measureText()` 将返回一个 TextMetrics对象的宽度、所在像素，这些体现文本特性的属性。  

```javascript
function draw() {
  var ctx = document.getElementById('canvas').getContext('2d');
  var text = ctx.measureText('foo'); // TextMetrics object
  text.width; // 16;
}
```   

## 使用图片

<a name="part2"></a>

引入图像到canvas里需要以下两步基本操作：  

1. 获得一个 HTMLImageElement 对象或者另一个canvas元素的引用。也可以通过提供一个 URL 来使用图片。  

2. 使用 `drawImage()` 函数在画布上绘制图片。  

### 获取要绘制的图片

canvas API 可以使用下面的几种数据类型作为图像源：  

+ HTMLImageElement：可以是通过 Image() 构造函数新建的，也可以是一个 `<img>` 元素。  
+ HTMLVideoElement: 使用一个 `video`源的当前帧作为图片。
+ HTMLCanvasElement: 使用另一个 `<canvas>` 元素。  

这些类型统称为 CanvasImageSource。

### 绘制图片

一旦获得了源图对象，我们就可以使用 `drawImage` 方法将它渲染到 canvas 里。`drawImage` 方法有三种形态，下面是最基础的一种。  

`drawImage(image, x, y)`: 在(x,y) 绘制图片。  

### 缩放

第二种使用方式多了两个参数，允许我们将图片缩放后再绘制。  

`drawImage(image, x, y, width, height)`

### 切片

最后一种有8个参数，允许我们剪裁一部分的图片，之后缩放后绘制。   

`drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)`:  (sx, sy) 指定了要切割的部分的左上角在原图上的位置，sWidth,sHeight指定了切的大小，(dx,dy) 表示在 canvas 上放置的位置， dWidth, dHeight 指定了缩放后的大小。  



### 控制图像的缩放行为  

缩放图像可能由于缩放过程而导致模糊或块状伪影。可以设置 `imageSmoothingEnabled` 属性来控制缩放图像时使用的平滑算法，默认为 true，以为着图片会被平滑的缩放。  

```javascript
ctx.mozImageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
ctx.msImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;
```   

<a name="part3"></a>
## 变行 Transformations

### 存储和恢复状态

`save()`： 保存整个 canvas 的状态。  

`restore()`: 恢复最近保存的 canvas 的状态。  

canvas 的状态保存在一个栈上。每次调用 `save()` 方法都会将当前的绘制状态推进栈里。一个绘制状态包括：  

+ 当前应用的变形
+ 下列属性的当前值：strokeStyle, fillStyle, globalAlpha, lineWidth, lineCap, lineJoin, miterLimit, lineDashOffset, shadowOffsetX, shadowOffsetY, shadowBlur, shadowColor, globalCompositeOperation, font, textAlign, textBaseline, direction, imageSmoothingEnabled.  
+ 当前的裁剪路径 clipping path。  


### 平移

用来移动 canvas 和它的原点到一个不同的位置。  

`translate(x, y)`: 当画布及其原点移动到 (x,y) 位置。  



### 旋转

以原点为中心旋转 canvas。  

![rotate origin](https://mdn.mozillademos.org/files/233/Canvas_grid_rotate.png)  

`rotate(angle)`: 顺时针旋转当前原点。角度也是弧度值。  

### 缩放

增减图形在 canvas 中的像素数目，对形状，位图进行缩小或者放大。  

`scale(x, y)` 大于1.0代表放大，小于1.0就是缩小。  

如果是负数可以以轴为中心创建镜像。例如说 `translate(0, canvas.height); scale(1, -1)`，那么现在坐标系的起点在左下角。  

### 变形  

`transform(a, b, c, d, e, f)`  

这个方法是将当前的变形矩阵乘上一个基于自身参数的矩阵，在这里我们用下面的矩阵：  

```
  a  c  e
[ b  d  f ]
  0  0  1  
```  

如果任意一个参数是无限大，变形矩阵也必须被标记为无限大，否则会抛出异常。  

参数的意义如下：  

+ **a(m11)** 水平缩放

+ **b(m12)** 水平倾斜

+ **c(m21)** 垂直倾斜

+ **d(m22)** 垂直缩放

+ **e(dx)** 水平移动

+ **f(dy)** 垂直移动


`setTransform(a, b, c, d, e, f)`  

这个方法会将当前的变形矩阵重置为单位矩阵，然后用相同的参数调用 transform 方法。如果任意一个参数是无限大，那么变形矩阵也必须被标记为无限大，否则会抛出异常。从根本上来说，该方法是取消了当前变形,然后设置为指定的变形,一步完成。  

`resetTransform()`  

重置当前变形为单位矩阵。   


## 4. Compositing and clipping

<a name="part4"></a>  

### 全局组合操作

我们不仅可以在已有图形后面再画新图形，还可以用来遮盖指定区域，清除画布中的某些部分，等等。  

`globalCompositeOperation = type`  

设置了在绘制新图形的使用的组合操作的类型。`type` 是下面字符串之一。  


+ **source-over**: 这个是默认的行为。新图形绘制在已有的 canvas 内容之上。

+ **source-in**: 结果是最终图形只有新图形与原有内容重叠的部分。其它区域都变成透明的。也就是只有重叠的地方出现。两者不重叠的地方都没了。

+ **source-out**: 最终图形是只有新图形中与原有内容不重叠的部分会被绘制出来。  

+ **source-atop**: 新图形中与原有内容重叠的部分会被绘制，并覆盖于原有内容之上。  

+ **destination-over**: 新图形绘制在原内容之下。

+ **destination-in**: 原有内容中与新图形重叠的部分会被保留，其它区域都变成透明的。  

+ **destination-out**： 原有内容中与新图形不重叠的部分会被保留。  

+ **destination-atop**: 原有内容中与新内容重叠的部分会被保留，并会在原有内容之下绘制新图形

+ **lighter**:两图形中重叠部分作加色处理。

+ **copy**：只有新图形会被保留，其它都被清除掉。

+ **xor**: 重叠的部分会变成透明。  

+ **multiply**

+ **screen**, **overlay**, **darken**, **lighten**, **color-dodge**, **color-burn**, **hard-light**, **soft-light**,  **difference**, **exclusion**, **hue**, **saturation**, **color**, **luminosity**。  



### 剪裁路径

绘制路径的第三种方法就是 `clip()`  

`clip()`: 我们使用 clip() 方法来创建一个新的裁切路径。默认情况下，canvas 有一个与它自身一样大的裁切路径（也就是没有裁切效果）。  

也可以使用 `clip()` 方法来关闭路径。   
