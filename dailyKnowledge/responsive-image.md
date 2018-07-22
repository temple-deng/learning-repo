# 响应式图片

## 不同尺寸的图片

```html
<img srcset="elva-fairy-320w.jpg 320w,
             elva-fairy-480w.jpg 480w,
             elva-fairy-800w.jpg 800w"
     sizes="(max-width: 320px) 280px,
            (max-width: 480px) 440px,
            800px"
     src="elva-fairy-800w.jpg" alt="Elva dressed as a fairy">
```   

`srcset` 属性定义了我们想要浏览器选择的图片，以及图片的尺寸。`320w` 指的是图片但是真实尺寸。   

`sizes` 属性定义了一系列媒体条件，以及当条件为true时指明了最佳的图片的尺寸。`280px` 指定是
图片摆放时的宽度吧。    

所有浏览器最终确定图片及尺寸的过程是：   

1. 检查设备的宽度
2. 查找 `sizes` 中满足的媒体条件
3. 查找给定媒体条件为true时，图片的尺寸
4. 查找 `srcset` 列表中最接近这个尺寸的图片，并加载   

拿上面的例子来说，例如现在浏览器的视口宽度是480px，满足 `(max-width: 480px)` 的条件，所以
图片最终的尺寸是440px，于是由于图片固有的尺寸是480w的最接近，所以加载elva-fairy-480w.jpg。   


## 不同分辨率同样的尺寸

如果我们希望图片在不同的分辨率下时同样的尺寸大小，可以使用 `srcset` 的 x-descriptors，并且不
用 `sizes` 属性。   

```html
<img srcset="elva-fairy-320w.jpg,
             elva-fairy-480w.jpg 1.5x,
             elva-fairy-640w.jpg 2x"
     src="elva-fairy-640w.jpg" alt="Elva dressed as a fairy">
```    

这种情况下的话图片所占尺寸的大小就得我们自己确定。   

```html
<picture>
  <source media="(max-width: 799px)" srcset="elva-480w-close-portrait.jpg">
  <source media="(min-width: 800px)" srcset="elva-800w.jpg">
  <img src="elva-800w.jpg" alt="Chris standing up holding his daughter Elva">
</picture>
```   
