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
+ virtual-area高度就是 `line-height`，它既是用来计算line-box的高度。  

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


### vertical-algn

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


+ `vertical-algn:top/bottom` 对齐到 line-box的顶部或者底部。
+ `vertical-algn: text-top/text-bottom` 对齐到content-area的顶部或底部。

![对应值](http://p0.qhimg.com/t01376feadd326aecff.png)

注意，在所有的情况下，都会对齐 *virtual-area*，也就是那个看不见的高度。
