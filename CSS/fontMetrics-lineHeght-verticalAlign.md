# font metrics, line-height and vertical-algn

> 摘自 http://zcfy.baomitu.com/article/deep-dive-css-font-metrics-line-height-and-vertical-align-vincent-de-oliveira-2616.html

![不同的font-family，相同的font-size，高度不同](http://p0.qhimg.com/t017bdcf68c3c370c59.png)
不同的font-family，相同的font-size，高度不同。  

### 字体的机制

+ 一个字体定义了它的它的 em-square。也就是一个容器，每个字符将被绘制在容器里。这个方形使用
相对单位，通常设置为1000单位，但也可以是1024,2048或其他任何值。  
+ 根据字体的相对单位，设置字体的其他度量值（升部，降部，大写高度，x字高等等。）请注意，某些值可能
会超出这个方形容器。  
+ 浏览器为了适应所需的字体大小，会缩放相对单位。  

以Catamaran字体为例：  

+ em-square是1000个单位的。
+ 升部是1100，降部是540。  

这意味着Catamaran在1000个单位的容器中就用了1100 + 540个单位，因此使用这个字体时，如果
设置 `font-size: 100px`，那么实际高度就是164px。这个计算出的高度定义了一个元素的 *content-area*
，*内容区域*。可以将content-area理解为 `background`属性应用的区域。  


### line-height延伸出的问题

一个内联元素有两个不同的高度： *content-area* 的高度和 *virtual-area* 高度（自己发明的词，规范中没有）。  

+ content-area的高度由字体度量值来定义。  
+ virtual-area高度就是 `line-height`，它即是用来计算line-box的高度。  

![内联元素的两种高度](http://p0.qhimg.com/t01fc43d5ecb8112050.png)  


![line-height实际的内容](http://p0.qhimg.com/t01ee6d5a5116632743.png)  

*virtual-area* 和 *content-area* 之间的计算高度差异称为行间距。这个行间距一半在 *content-area*
的顶部，另一半在底部。 **因此content-area始终位于virtual-area的中间**。  

还有其他的内联元素：  

+ 替换内联元素（`<img>`,`<input>`等）。
+ `inline-block`和所有 `inline-*`的元素。
+ 参与特定格式化内容的内联元素（例如flexbox中，所有flex元素都是blocksified）。

对于这些特定的内联元素，高度是根据 `height,margin,border`这些属性计算出的。如果`height`是
`auto`，那么就是用 `line-height`，content-area严格等于`line-height`。  


### vertical-align

```html
<p>
    <span>Ba</span>
    <span>Ba</span>
</p>
```

```css
p {
    font-family: Catamaran;
    font-size: 100px;
    line-height: 200px;
}

span:last-child {
    font-size: 50px;
}
```

![line-box高度增加](http://p0.qhimg.com/t01239608a1c15fe038.png)


第二个例子

```html
<p>
    <span>Ba</span>
</p>
```

```css
p {
    line-height: 200px;
}
span {
    font-family: Catamaran;
    font-size: 100px;
}
```

line-box有多高？我们的期望值应该是200px；但事实并非如此。其中的问题是`<p>`有自己的字体，不同于
`font-family`(默认为`serif`)。`<p>` 和 `<span>` 之间的基线可能会有不同，因此line-box的
高度比我们预期的高。这是因为浏览器进行计算时，会以每行 line-box 的一个零宽度字符开始，这一规范
称为 strut。  

> 一个看不见的字符，带来看的见的效果。  

![](http://p0.qhimg.com/t01bbe914c5ed19e869.png)


+ `vertical-align:top/bottom` 对齐到 line-box的顶部或者底部。
+ `vertical-align: text-top/text-bottom` 对齐到content-area的顶部或底部。

![对应值](http://p0.qhimg.com/t01376feadd326aecff.png)

注意，在所有的情况下，都会对齐 *virtual-area*，也就是那个看不见的高度。  


## 规范中行高的计算

### 行高部分

一个 line box 的高度是按照下面的内容决定的：  

1. 首先会计算line box中每个行内级盒子的高度。对于替换元素、inline-block元素以及 inline-table
元素，这个高度就是其 margin box 的高度；对于 inline box(应该是inline的非替换元素),这个高度指的
就是他们的 line-height 行高。  

2. 行内级盒子 inline-level boxes 会根据他们的 'vertical-align' 属性在垂直方向上对齐。如果
这个属性值设置的是 'top' or 'bottom'，他们必须通过对齐的方式来最小化 line box 的高度。如果这样的盒子足够高，则有多种解决方案，不过CSS 2.2没有定义 line box 的基线位置（即 strut 的位置）。  

3. line box的高度就是最上面的盒子 top 到 最下面的盒子 bottom 直接的距离。（也包括 strut）。  

空的行内元素会生成空的 inline box，不过这些盒子仍然有 margin, padding, border 以及一个 line-height，因此会以其好像包含内容的形式影响上面的计算。  

也就是说先计算所有 inline-level box的高度，然后对齐后再计算line box 的高度。  

CSS假定每个字体都有字体指标，指定高于基线的特征高度以及其下方的深度。  

关键点来了。如果一个 inline box 不包含任何的字符（或者叫字形？），规范中规定其内部会包含
一个 strut(一个零宽的不可见字符)，这个 strut 的升部和降部（参考字符部分的内容）会使用元素内第一个可用的字体的升部和降部。    

虽然非替换元素（应该特指行内级）的 margin, border, padding 不会影响行内盒的计算，但是仍然会在 inline box 中渲染出来。这就意味着，如果 line-height 声明的高度小于内容区的高度， padding 和 border区域的背景图及颜色可能会和相邻的 line box 重叠。  

在一个内部由行内级元素 inline-level 组成的块容器元素中， 'line-height' 规定了包含元素的 line boxes 的最小高度。并且每个 line box 由一个零宽的 inline box 开始，这个 box 的的字体和 line-height 属性和元素一致（元素应该是块容器元素吧）。这个假想的盒子叫 'strut'。  

所以这个 'strut' 一方面可以指一个盒子，也可以指一个 inline box 的一个不可见字符么？  

注意一下 'line-height' 在不同元素上的含义，在 inline 元素上指其 inline box 的高度，在上面说的块容器盒上又是不同的含义。  

### vertical-align 部分

'vertical-align' 适用于行内级元素和 'table-cell' 元素。  

下面的这些值只对一个父级行内元素 inline，或者一个父级块容器元素的 strut （这应该是指
`vertical-align` 定义在块容器元素上吧）有意义：  

并且注意，下面定义使用的盒子，对于非替换 inline 元素来说就是 inline box，对于其他元素（如 inline-block元素）使用的是 margin box。   

+ **baseline**  

将盒子的基线与父盒子的基线对齐。如果盒子没有基线，就将 margin 的下边缘与父级的baseline对齐。  

+ **middle**  

将盒子垂直方向上的中点与父盒子基线上方x一半高的地方对齐。  

+ **sub**  

将盒子的基线降低到父级盒子下标的位置。  

+ **super**  

将盒子的基线上提到父级盒子上标的位置。  

+ **text-top**  

将盒子上边与父级盒子的 content-area 的上部对齐。  

+ **text-bottom**  

将盒子的下边与父级盒子的 content area的下边对齐。  

+ **百分比，长度**  

将盒子的基线上提或者降低指定的值。  

下面的值会将元素相对于 line box 对齐。

top, bottom。  

inline-block 的基线是其常规流内最后的 line box的基线，除非其不包含 in-flow 的 line box，
或者其 overflow 属性不是 'visible'，这两种情况下其基线是margin下边缘。  
