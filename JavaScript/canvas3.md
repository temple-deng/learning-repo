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

`canvas.toBlob(callback, type, encodeOptions)`  

### Data URIs

`data:[<mediatype>][;base64],<data>`  

MIME类型默认是 `text/plain;charset=US-ASCII`, 如果是文本内容可以直接写文本内容，或者指定 base64编码的二进制数据。  


## API 接口

### HTMLCanvasElement

**属性**  

`width, height`  

**方法**   

+ `canvas.captureStream()`
+ `canvas.getContext(contextType, contextAttributes);`   
+ `canvas.toDataURL(type, encoderOptions);`：第二个质量参数只有 `image/jpeg, image/webp` 才有用，默认是0.92。返回一个 data URI 的字符串。  
+ `void canvas.toBlob(callback, mimeType, qualityArgument);` : 回调函数的参数是生成的 Blob 对象。  

### CanvasRenderingContext2D

列举一些没说过的属性和方法。  

+ `void ctx.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);`  画椭圆线咯。  
+ `void ctx.scrollPathIntoView([path]);` path 是一个 Path2D对象，类似于元素上的`scrollIntoView()`。      
+ `ctx.isPointInPath`: 是否这一点在当前路径或者给定的路径中。  

```javascript
boolean ctx.isPointInPath(x, y);
boolean ctx.isPointInPath(x, y, fillRule);

boolean ctx.isPointInPath(path, x, y);
boolean ctx.isPointInPath(path, x, y, fillRule);
```

+ `ctx.isPointInStroke()`: 是否这一点在绘制的线的包裹的区域内，其实上面的一样吧，无非可以一个路径时 fill 的一个是 stroke 的。  

```javascript
boolean ctx.isPointInStroke(x, y);
boolean ctx.isPointInStroke(path, x, y);
```   
