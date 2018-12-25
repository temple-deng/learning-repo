# CSS

## 1. 优先级

计算选择器的优先级按照下面的顺序：  
+ !important 声明的样式优先级最高
+ 内联样式
+ ID选择器
+ 类选择器，属性选择器，伪类选择器
+ 类型选择器和伪元素选择器
+ 通用选择器和层级关系的选择器如子选择器、兄弟选择器不参与计算  
+ 注意:not()伪类选择器也不参与运算，但伪类中的选择器会参与运算。

## 2. 外边距重叠

产生折叠的必备条件：margin必须是邻接的。  

+ 必须是出于常规文档流的块级盒子，并且出于同一个BFC中。
+ 没有线盒，没有空隙，没有padding和border将它们分开。
+ 都属于垂直方向上相邻的外边距，可以是下面一种情况。
  + 元素的margin-top与其第一个常规文档流的子元素的margin-top
  + 元素的margin-bottom与其下一个常规文档流的兄弟元素的margin-top
  + height为auto的元素的margin-bottom与其最后一个常规文档流的子元素的margin-bottom
  + 高度为0且最小高度也为0，不包含常规文档流的子元素，并且自身没有建立新的BFC的元素的margin-top和margin-bottom。


## 3. 如何创建一个块级格式化上下文BFC
+ 根元素或其它包含它的元素
+ 浮动 (元素的 float 不为 none)
+ 绝对定位元素 (元素的 position 为 absolute 或 fixed)
+ 行内块 inline-blocks (元素的 display: inline-block)
+ 表格单元格 (元素的 display: table-cell，HTML表格单元格默认属性)
+ 表格标题 (元素的 display: table-caption, HTML表格标题默认属性)
+ overflow 的值不为 visible的块级元素
+ 弹性盒子 flex boxes (元素的 display: flex 或 inline-flex)


## 4. BFC的布局的原则
+ 内部的盒子在垂直方向，一个挨一个的放置。
+ Box垂直方向的距离由margin决定。属于同一BFC的两个相邻box的margin会发生重叠
+ 每个元素的margin box的左边，与包含块border box的左边相接触。即使存在浮动也是如此。
+ BFC的区域不会与float box重叠。
+ BFC就是页面上的一个隔离的独立容器，容器里面的子元素不会影响到外面的元素。反之也如此。
+ 计算BFC的高度时，浮动元素也参与计算。

因为BFC内部的元素和外部的元素绝对不会相互影响。因此，当BFC外部存在浮动时，它不应该影响BFC内部的box的布局，BFC会通过变窄，而不与浮动有重叠。同样的，当BFC内部有浮动时，为了不影响外部元素的布局，BFC计算高度时会包括浮动的高度。避免margin重叠也是这样的道理。  


## 5. 视觉格式化上下文

### 5.1 包含块(containing block)

每个元素都是相对于其包含块摆放的，可以这么说，包含块就是一个元素的“布局上下文”。    

对于正常的西方语言文本流中的一个元素，包含块由最近的块级祖先框、表单元格或行内块祖先框的
内容边界(content edge)，考虑下面元素：   

```html
<body>
	<div>
		<p>This is a paragraph</p>
	</div>
</body>
```
p元素的包含块是div元素，因此p的布局依赖于div的布局。  

行内元素的摆放方式并不直接依赖于包含块。   

## 6. line-height的继承问题

当一个块级元素从另一个元素继承line-height时，需要注意不同值得区别，当设置为em，或者百
分数时，此时行高计算的基数是按照父元素的font-size。如果想要设置成按照子元素的font-size，
需要指定成一个数，这个数将作为缩放因子参与计算。

## 7. margin和padding的百分比的问题

margin box和padding box的四个属性，`margin-top,margin-bottom,margin-left,margin-right,padding-top,padding-bottom,padding-left,padding-right`，如果是百分比的值，那么都是相对于其包含块的width计算的，即使是top和bottom也不例外


## 8. 值

继承性：一些值是可能被元素的子元素所继承的。  

当继承发生时，元素会继承计算值。父元素的计算值会变成子元素的声明值和计算值。  

一个给定元素或者盒子的一个CSS属性的最终值是多步计算的结果   

+ 首先，为每个元素上的每个属性收集应用于元素的所有声明(declared values)的值。 可能有零个或许多声明的值应用于元素。
+ 级联过程产生级联值(cascaded value)。 每个元素每个属性最多有一个级联值。
+ 默认过程产生指定值(specified value)。 每个元素每个属性只有一个指定的值。
+ 解析值依赖关系产生计算值(computed value)。 每个元素每个属性只有一个计算值。
+ 格式化文档产生使用值(used value), 每个元素的每个属性只能有一个使用值，如果该属性适用于该元素。
+ 最后，根据展示环境使用值最终转换成实际值(actual value).


## 9. @import

`@import` 规则可以让我们从其他样式表中导入样式规则。如果 `@import` 引用了一个有效的
样式表，用户代理必须将样式表的内容类似于插入的样子写到 `@import` 规则使用的地方。   

任何的 `@import` 规则在样式表中的位置必须先于所有其他的 at-rules 及样式规则（除了 `@charset`，这个必须是样式表中第一
个规则），语法如下：   

```css
@import [ <url> | <string> ]
        [ supports( [ <supports-condition> | <declaration> ] ) ]?
        <media-query-list>? ;
```    

注意官方文档的语法表示中， `[]` 是用来分组的，如果是可选的话应该是 `?`，`|` 表示只能有一个存在。  

`@import url("narrow.css") supports(display: flex) handheld and (max-width: 400px);`   

# A


### `:active`
匹配被用户激活的元素。当用鼠标交互时，它代表的是用户按下按键和松开按键之间的时间。  

### `::after`
用来匹配已选中元素的一个虚拟的最后子元素，这个虚拟元素默认是行内元素。

### `align-content`
**align-content** 属性定义弹性容器的侧轴方向上有额外空间时，如何排布每一行。当弹性容器只有一行时无作用。

default: `stretch`.  

可选值：`flex-start`, `flex-end`, `center`, `space-between`, `space-around`, `stretch`, `space-evenly` 其他的支持度不高不列出

### `align-items`
定义伸缩项目在侧轴方向上的对齐方式。  

default: `stretch`.  

可选值：`flex-start`, `flex-end`, `center`, `stretch`, `baseline(侧轴起点到元素基线距离最大的元素将会于侧轴起点对齐以确定基线。)`

### `align-self`
伸缩项目定义自己在侧轴方向上的对齐方式，定义在伸缩项目上以覆盖伸缩容器上的`align-items`。如果任何 flex 元素侧轴方向的 margin 为 `auto`，则会忽略 `align-self`。

default: `auto`  

可选值：`flex-start`, `flex-end`, `center`, `auto`, `baseline`, `stretch`(元素将会基于容器的宽和高，按照自身 margin box 的 cross-size 拉伸。)`

### `animation`

### `animation-delay`
定义一个负值会让动画立即开始。但是动画会从它的动画序列中某位置开始。例如，如果设定值为-1s，动画会从它的动画序列的第1秒位置处立即开始。

### `animation-direction`
注意反转时时间函数也会反转。  

可选值：`normal`, `alternate`, `reverse`, `alternate-reverse`

### `animation-duration`
单位为秒(s)或者毫秒(ms)，无单位值无效，负值无效。

### `animation-fill-mode`
用来指定在动画执行之前和之后如何给动画的目标应用样式。

可选值：
+ `none`: 执行前后无任何样式。
+ `forwards`: 保持最后一帧的样式，最后一帧取决于 `direction` 和 `iteration-count`.
+ `backwards`: 保持第一帧的样式，第一帧取决于`direction`.
+ `both`

###  `animation-iteration-count`
可选值：`infinite`, `<number>` 不可用负值，可以是小数。

### `animation-name` `animation-play-state` `animation-timing-function`

### `attr()`
 attr() 用来获取选择到的元素的某一HTML属性值，并用于其样式。它也可以用于伪元素，属性值采用伪元素所依附的元素。  

 语法： `attr( attribute-name <type or unit>? [, <fallback>]?)`

 `<type or unit>`: 表示所引用的属性值的单位。如果该单位相对于所引用的属性值不合法，那么 attr()表达式也不合法。若省略，则默认值是 string.

 `fallback`: 如果HTML元素缺少所规定的属性值或属性值不合法，则使用fallback值。该值必须合法，且不能包含另一个 attr() 表达式。




# B
---

### `background-attachment`
决定背景在视口中固定的还是随着包含它的区块滚动的。

default: `scroll`。

可选值:
+ `fixed`: 背景相对于视口固定。不随元素的内容滚动
+ `local`: 背景相对于元素的内容固定。背景会随着元素的内容滚动，并且背景的绘制区域和定位区域是相对于可滚动区域而不是包含他们的边框。
+ `scroll`: 背景相对于元素本身固定，而不是随着内容滚动。

### `background-blend-mode`

### `background-clip`
default: `border-box`

可选值：
+ `border-box`: 背景延伸到边框外沿。
+ `padding-box`: 背景延伸到内边距外沿。
+ `content-box`: 内容外沿。

### `background-color`

### `background-image`
先指定的图像会在之后指定的图像上绘制。因此指定的第一个图像最接近用户。

### `background-origin`

### `background-position`
注意百分比的参照尺寸为背景定位区域的大小减去背景图片的大小。 背景定位区域与 `background-origin` 有关。

允许负值。

### `background-repeat`
可选值：`repeat`, `no-repeat`, `repeat-x`, `repeat-y`, `space`, `round`

### `background-size`
百分比值是背景图片相对于背景定位区域的百分比.

如果`attachment` 为 fixed, 背景区为浏览器可视区（即视口）。

`cover` 缩放背景图片以完全覆盖背景区，可能背景图片部分看不见。

`contain` 缩放背景图片以完全装入背景区，可能背景区部分空白。

### `<basic-shape>`

### `::before`

### `blur()`

### `border-collapse`
决定表格的边框是分开的还是合并的。

`separate` 是默认样式，边框之间的距离通过 `border-spacing`来确定。

`collapsed`：合并相邻单元格边框。

### `border-color`

### `border-image-outset`

### `border-image-repeat`

### `border-image-slice`

### `border-image-source`

### `border-image-width`

### `border-radius`
`border-top-left-radius`, `border-top-right-radius`, `border-bottom-right-radius`, `border-bottom-left-radius`的简写。

百分比相对于盒模型计算（border-box），水平半轴相对于宽度，垂直半轴相对于高度。

### `border-spacing`
指定相邻单元格边框之间的距离。

也适用于表格的外层边框上。

### `border-style`, `border-width`

### `bottom`

### `box-shadow`

### `box-sizing`
可选值：`content-box`, `border-box`(`width`包括内填充和边框)




# C
---

### `calc()`

表达式可以使用 `+, -, *, /`

用0做除数会让HTML解析器抛出异常。

`+` 和 `-`的两边必须有空白符。  

### `:checked`

### `clear`
适用于块级元素。

### `clip-path`
用于替代已废弃的`clip`属性。

可选值：
+ `url()`: 代表剪切元素的路径。
+ `inset(), circle(), ellipse(), polygon()`： 一个 `<basic-shape>`方法，这种形状会利用指定的 `<geometry-box>`来定位和固定基本形状。如果没有几何盒模型特别指出的话， border-box是默认的盒模型。
+ `<geometry-box>`: 如果同`<basic-shape>`一起声明，它将为基本形状提供相应的参考盒子。
  + `fill-box`
  + `stroke-box`
  + `view-box`
  + `margin-box`
  + `border-box`
  + `padding-box`
  + `content-box`

### `<color>`

### `color`

### `column-count`

### `content`
语法：`normal | none | [ <string> | <uri> | <counter> | attr() | open-quote | close-quote | no-open-quote | no-close-quote ]+`

### `<counter>`

### `counter-increment`

### `counter-reset`

### `cursor`



# D
---

### `:default`
表示在一组相似元素中所有默认的用户交互元素。在一组按钮中的默认按钮可以用这个伪类选择器选取。

### `direction`
`ltr`, `rtl`

### `:disabled`

### `display`




# E
---
### `:empty`
没有子元素的元素。

### `empty-cells`
用来指明空表格单元格如何渲染边框和背景。

语法： `show | hide`

### `:enabled`




# F
---

### `filter`
CSS滤镜（filter）属提供的图形特效，像模糊，锐化或元素变色。过滤器通常被用于调整图片，背景和边界的渲染。

CSS标准里包含了一些已实现预定义效果的函数。你也可以参考一个SVG滤镜，通过一个URL链接到SVG滤镜元素.

可选函数：
+ `url()` 接受一个XML文件，该文件设置了一个SVG滤镜。
+ `blur()`：给图像设置高斯模糊，“radius” 一值设定高斯函数的标准差，或者屏幕上以多少像素融在一起，所以值越大越模糊；如果没有设定值，默认是0，可以设置css长度值，但不能为百分比。
+ `brightness()`: 给图片应用线性乘法，使其更亮或更暗，如果是0%，图像会全黑，如果是100%，则图像无变化，值超过100%也是可以的，图像比原来更亮。
+ `contrast()`: 调整图像的对比度，值是0%的话，图像全黑，值是100%，图像不变，值可以超过100%。
+ `drop-shadow()`
+ `grayscale()`: 将图像转为灰度图像，值定义转换的比例。值是100%则完全转为灰度图像，值为0%图像无变化。值在0%在100%之间。
+ `hue-rotate()`： 给图像应用色相旋转，“angle”一值设定图像会被调整的色环角度值，值为0deg，图像无变化。
+ `invert()`: 反转输入图像，值定义转换的比例， 100%是完全反转。
+ `opacity`
+ `saturate()`: 转换图像饱和度，值定义转换的比例，值0%是完全不饱和。超过100%是允许的。
+ `sepia()` 将图像转为深褐色，定义转换比例，值100%是完全深褐色，
