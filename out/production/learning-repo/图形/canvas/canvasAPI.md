# Canvas API

## HTMLCanvasElement

**属性**  

`width, height`  

**方法**   

+ `canvas.captureStream()`
+ `canvas.getContext(contextType, contextAttributes);`   
+ `canvas.toDataURL(type, encoderOptions);`：第二个质量参数只有 `image/jpeg, image/webp` 才有用，默认是0.92。返回一个 data URI 的字符串。  
+ `void canvas.toBlob(callback, mimeType, qualityArgument);` : 回调函数的参数是生成的 Blob 对象。  

## CanvasRenderingContext2D

### 绘制矩形

立刻将矩形绘制到位图上。    

**CanvasRenderingContext2D.clearRect()**    

将矩形内的所有像素设置为透明黑色，擦除之前绘制的内容。   

语法：`void ctx.clearRect(x, y, width, height);`   

**CanvasRenderingContext2D.fillRect()**    

绘制一个填充的矩形。   

语法：`void ctx.fillRect(x, y, width, height);`   

**CanvasRenderingContext2D.strokeRect()**    

绘制一个矩形。    

语法：`void ctx.strokeRect(x, y, width, height);`   

### 绘制文本

**CanvasRenderingContext2D.fillText()**    

填充给定的文本，如果提供了最大的宽度，则文本会被缩放到合适的宽度。    

语法：`void ctx.fillText(text, x, y [, maxWidth]);`     

**CanvasRenderingContext2D.strokeText()**    

绘制给定的文本，如果提供了最大的宽度，则文本会被缩放到合适的宽度。    

语法：`void ctx.strokeText(text, x, y [, maxWidth]);`   

**CanvasRenderingContext2D.measureText()**    

返回一个 TextMetrics 对象，包含了关于待测量文本的一些信息。    

语法：`TextMetrics ctx.measureText(text);`   

### 线段的样式   

**CanvasRenderingContext2D.lineWidth**    

设置会返回当前线段的宽度。默认是1.0。当设置为0，负值，无限大或者 NaN 时被忽略。    

语法：`ctx.lineWidth = value;`    

**CanvasRenderingContext2D.lineCap**    

决定了如果绘制线段的端点，3个可能值: butt, round, square。默认为 butt。        

语法：    

```javascript
ctx.lineCap = "butt";
ctx.lineCap = "round";
ctx.lineCap = "square";
```    

**CanvasRenderingContext2D.lineJoin**   

决定了怎样连接两个线段或者曲线的片段。3个可选值：bevel, miter, round。默认是 miter。    

语法：    

```javascript
ctx.lineJoin = "bevel";
ctx.lineJoin = "round";
ctx.lineJoin = "miter";
```   

miter: 应该是以两个线段的中心线的交汇点为圆心，以 lineWidth 为半径绘制圆。   
bevel: 在连接的段的公共端点和每个段的单独的外部矩形角之间填充另外的三角形区域。   
miter: 连接的部分通过将其外边缘延伸以在单个点处连接而结合，并且具有填充另外的菱形区域的效果。 此设置受到miterLimit属性的影响。     


**CanvasRenderingContext2D.miterLimit**    

默认为1.0，设置为0，负值，Infinity，NaN 会被忽略。    

语法：`ctx.miterLimit = value;`   

**CanvasRenderingContext2D.getLineDash()**    

语法：`ctx.getLineDash();`   

返回一个数组，指定交替绘制线和间隙的长度的数字列表。如果在设置这个元素时，数字的个数是奇数个，
那么这个数组会先复制一份然后拼接起来。例如设置了 [5,15,25] 会导致返回 [5,15,25,5,15,25]。    

**CanvasRenderingContext2D.setLineDash()**    

指定绘制线段时线段及间隔的长度。     

语法：`ctx.setLineDash(segments);`   

拿[5,15,25,5,15,25] 为例，则第一段线长为5，然后间隔15，之后第二段线长25，之后间隔5这样子，就是一个
数字指定线段长，后面的一个数字指定间隔长。不过还有注意的是，具体哪个指线长哪个指间隔与下面的 lineDashOffset
有关。       

**CanvasRenderingContext2D.lineDashOffset**    

语法：`ctx.lineDashOffset = value;`   

### 
