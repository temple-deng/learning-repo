# Canvas 性能优化

## 避免使用浮点数坐标值，只使用整数

当在 canvas 渲染非整数值的对象时会发生子像素渲染的情况。      

`ctx.drawImage(myImage, 0.3, 0.5);`    

这会造成浏览器为了实现抗锯齿效果而去做一些额外的工作。所以尽可能在 `drawImage()` 函数中使用
取整了的坐标值。   

## 不要在 drawImage 中缩放图片

在加载图片时先在离屏 canvas 上缓存各种尺寸的图片，而不是在 `drawImage()` 中不断缩放。   

## 对于复杂的内容来说使用多层 canvas

## 对于较大的背景图片使用 CSS 背景

如果我们的 canvas 一直是一个静态的背景图，那么可以使用一个 `<div>` 元素，然后设置其背景并定位
到 canvas 下。

## 使用 CSS transforms 缩放 canvas

CSS transform 由于使用 GPU 的原因是更快的。

## 其他

+ 批量调用 canvas 函数
+ 避免不必要的 canvas 状态改变
+ 只在屏幕上渲染不同的部分，而不是整个状态
+ 避免使用 `shadowBlur`
+ 避免渲染文本
+ 在动画时使用 `window.requestAnimationFrame()`
