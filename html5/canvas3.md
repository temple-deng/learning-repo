# Canvas

目录：  

1. [基础的动画](#part1)
2. [像素操作](#part2)


## Basic animations

<a name="part1"></a>  

### Basic animation steps

当我们绘制一帧动画时需要按下面的步骤做：  

1. 清空画布：最简单的方法就是调用 `clearRect()`

2. 保存画布状态

3. 绘制动画图形

4. 恢复画布状态

<a name="part2"></a>  

## Pixel manipulation with Canvas

`ImageData` 对象代表了canvas对象底层的像素的数组。包括下面3个只读属性：  

**width**  
以像素为单位 image 的宽度。  

**height**  
以像素为单位 image 的高度。  

**data**  
一个 `Uint8ClampedArray` 一维数组， 以RGBA的顺序包含了数组，值均为0-255的整数。  

`data` 属性可以用来访问原生的像素数据；每个像素由4个1字节的值组成，按照 red,green,blud, alpha的顺序排列。每种颜色的部分由0-255数字表示。每个像素都被分配了连续的索引，从canvas的左上角开始排列，之后从左到右，之后再向下。  

所以整个 `Uint8ClampedArray` 数组包含了 height * width * 4 个字节的数据，所以索引的范围是从0 到 (height * width * 4)-1。  

### 创建 ImageData 对象

使用 `createImageData()` 方法可以创建一个新的空白的 ImageData 对象。  

`var myImageData = ctx.createImageData(width, height); `  

默认情况下所有像素都是透明的黑色。就是全是0呗。   

也可以创建一个另外的 ImageData 对象来新建一个通用尺寸大小的 ImageData 对象。不过新对象的所有像素仍然都是透明黑色。并不会拷贝具体的数据。  

`var myImageData = ctx.createImageData(anotherImageData);`  

### 从context 中获取像素的数据

可以从 context 中获得一个拷贝了像素数据的 ImageData 对象，使用 `getImageData()`。  

`var myImageData = ctx.getImageData(left, top, width, height);`   

### 将像素数据绘制到 context 中

使用 `putImageData()` 方法将像素数据绘制到 context中：  

`ctx.putImageData(myImageData, dx, dy)`  

### 保存图片

HTMLCanvasElement提供了 `toDataURL()` 方法允许我们将其保存为图片。会返回一个指定
格式的图片的 data URI。默认是PNG。  

`canvas.toDataURL('image/png')`  

`canvas.toDataURL('image/jpeg', quality)`  

质量参数从0到1,1表示最高质量。  

也可以创建一个 Blob:  

`canvas.toBlob(callback, mimeType, qualityArgument)`  

### Data URIs

`data:[<mediatype>][;base64],<data>`  

MIME类型默认是 `text/plain;charset=US-ASCII`, 如果是文本内容可以直接写文本内容，或者指定 base64编码的二进制数据。   

## 补充内容

### Gradients   

img    

```javascript
var grad = ctx.createLinearGradient(0,0,200,0);
grad.addColorStop(0, "white");
grad.addColorStop(0.5, "red");
grad.addColorStop(1, "black");

ctx.fillStyle = grad;
ctx.fillRect(0,0,400,200);
```     

需要注意的是，渐变是绘制在要绘制的图形所在的坐标系统中的，而不是形状内部自身的坐标系统。以上面
的例子为例，形状所在的坐标系统的起始坐标是 0,0 处。如果我们改变绘制形状的起始位置为 100,100 处，
渐变的起始位置还是在 0,0 处，所以最终绘制出来的渐变可能会少一部分，例如下面的例子：   

img    

```javascript
var grad = ctx.createLinearGradient(0,0,200,0);
grad.addColorStop(0, "white");
grad.addColorStop(0.5, "red");
grad.addColorStop(1, "black");

ctx.fillStyle = grad;
ctx.fillRect(100,100,400,200);
```    

### Image Fills

我们可以通过定义 pattern 来用图片填充形状。但是要注意的是，与渐变相同，pattern 在绘制时也是
相对于绘制形状所在的坐标系统的。    

还有，创建 pattern 时候使用的好像是图片本身的宽高，而且也不能用 JavaScript 调整宽高。    

注意只有在图片加载完成后，才可以使用图片来创建 pattern。    

### Clipping

`clip` 函数会使用当前的路径为之后的绘制创建一层 mask。这意味着之后的任何绘制之后出现在剪裁
路径的内部。任何在路径外部的绘制都不会出现在屏幕上。   

### Events

`isPointInPath()` 函数会判断一个给定的坐标是否在当前的路径中：   

```javascript
c.beginPath();
c.arc(
    100,100, 40,  //40 pix radius circle at 100,100
    0,Math.PI*2,  //0 to 360 degrees for a full circle
);
c.closePath();
var a = c.isPointInPath(80,0);     // returns true
var b = c.isPointInPath(200,100);  // returns false
```    

### 线宽

线宽是以给定路径的中心的位置开始延伸宽度的。 换句话说，绘制的区域延伸到路径两边的线宽的一半。
因为画布坐标不直接引用像素，所以必须特别小心，以获得清晰的水平和垂直线条。   

![](https://mdn.mozillademos.org/files/201/Canvas-grid.png)    

上图中，网格代表了 canvas 坐标网格。两条网格线之前的正方形就是实际上屏幕中的像素。假如我们
要画一条从 (3,1) 到 (3,5) 线宽为1.0 的路径，则最终结果如第二幅图。实际填充的区域在路径中间
两侧的像素中延伸。这种情况下必须近似渲染，意味着这些像素只有一半是被遮蔽了的，之后导致整个区域被填充
的颜色仅为直接颜色的一半。    

为了修复这种情况，必须在创建路径时使用精确一点的值。比如说由于线宽为1会导致路径两边各一半，那么
可以创建一条从 (3.5,1) 到 (3.5,5) 的路径，这时就是第三幅图的样子。
