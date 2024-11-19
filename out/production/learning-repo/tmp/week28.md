# week28 7.5-7.11

<!-- TOC -->

- [week28 7.5-7.11](#week28-75-711)
- [css mask](#css-mask)
  - [mask-image](#mask-image)
  - [mask-mode](#mask-mode)
  - [剩下的](#剩下的)
  - [mask-type](#mask-type)
  - [mask-composite](#mask-composite)

<!-- /TOC -->

# css mask

mask 是一个缩写属性，包括：   

- `mask-image`
- `mask-mode`
- `mask-repeat`
- `mask-position`
- `mask-clip`
- `mask-origin`
- `mask-size`
- `mask-type`
- `mask-composite`

对标 background 啊。    


## mask-image

`mask-image` 支持的图片类型很广泛，包括各种 jpg, png, svg 图，也可以是各种渐变。    

```css
.mask-image {
  -webkit-mask-image: url(./mask.png);
  mask-image: url(./mask.png);
}
```    

所谓遮罩，就是原始图片只显示遮罩图片非透明的部分。例如本案例中，loading圆环有颜色部分就是外面一
圈圆环，于是最终我们看到效果是原始图片，只露出了一个一个的圈圈环。并且半透明区域也准确遮罩显示了。    

如果遮罩图片加载失败，则整个原始图都显示不出来。    

## mask-mode

`mask-mode` 默认值是 `match-source`，意思是根据资源的类型自动采用合适的遮罩模式。    

支持以下3个属性值：   

- `alpha` 透明度
- `luminance` 亮度
- `match-source`    

## 剩下的

`mask-repeat, mask-position, mask-clip, mask-origin, mask-size` 类比 background 的
同类属性

## mask-type

mask-type属性功能上和mask-mode类似，都是设置不同的遮罩模式。但还是有个很大的区别，那就是mask-type只能作用在SVG元素上，本质上是由SVG属性演变而来，因此，Chrome等浏览器都是支持的。但是mask-mode是一个针对所有元素的CSS3属性，Chrome等浏览器并不支持，目前仅Firefox浏览器支持。

由于只能作用在SVG元素上，因此默认值表现为SVG元素默认遮罩模式，也就是默认值是luminance，亮度遮罩模式。如果需要支持透明度遮罩模式，可以这么设置：    

```css
mask-type: alpha;
```    

## mask-composite

mask-composite表示当同时使用多个图片进行遮罩时候的混合方式。支持属性值包括：    

暂略。    

