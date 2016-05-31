# CSS

Tags： CSS 优先级

---

###  1. 优先级
计算选择器的优先级按照下面的顺序：
+ !important 声明的样式优先级最高
+ 内联样式
+ ID选择器
+ 类选择器，属性选择器，伪类选择器
+ 类型选择器和伪元素选择器
+ 通用选择器和层级关系的选择器如子选择器、兄弟选择器不参与计算
+ 注意:not()伪类选择器也不参与运算，但伪类中的选择器会参与运算。

### 2. 外边距重叠
产生折叠的必备条件：margin必须是邻接的。
+ 必须是出于常规文档流的块级盒子，并且出于同一个BFC中。
+ 没有线盒，没有空隙，没有padding和border将它们分开。
+ 都属于垂直方向上相邻的外边距，可以是下面一种情况。
  + 元素的margin-top与其第一个常规文档流的子元素的margin-top
  + 元素的margin-bottom与其下一个常规文档流的兄弟元素的margin-top
  + height为auto的元素的margin-bottom与其最后一个常规文档流的子元素的margin-bottom
  + 高度为0且最小高度也为0，不包含常规文档流的子元素，并且自身没有建立新的BFC的元素的margin-top和margin-bottom。


### 3. 如何创建一个块级格式化上下文BFC
+ 根元素或其它包含它的元素
+ 浮动 (元素的 float 不为 none)
+ 绝对定位元素 (元素的 position 为 absolute 或 fixed)
+ 行内块 inline-blocks (元素的 display: inline-block)
+ 表格单元格 (元素的 display: table-cell，HTML表格单元格默认属性)
+ 表格标题 (元素的 display: table-caption, HTML表格标题默认属性)
+ overflow 的值不为 visible的元素
弹性盒子 flex boxes (元素的 display: flex 或 inline-flex)


### 4. BFC的布局的原则
+ 内部的盒子在垂直方向，一个挨一个的放置。
+ Box垂直方向的距离由margin决定。属于同一BFC的两个相邻box的margin会发生重叠
+ 每个元素的margin box的左边，与包含块border box的左边相接触。即使存在浮动也是如此。
+ BFC的区域不会与float box重叠。
+ BFC就是页面上的一个隔离的独立容器，容器里面的子元素不会影响到外面的元素。反之也如此。
+ 计算BFC的高度时，浮动元素也参与计算。

因为BFC内部的元素和外部的元素绝对不会相互影响。因此，当BFC外部存在浮动时，它不应该影响BFC内部的box的布局，BFC会通过变窄，而不与浮动有重叠。同样的，当BFC内部有浮动时，为了不影响外部元素的布局，BFC计算高度时会包括浮动的高度。避免margin重叠也是这样的道理。


### 4. 视觉格式化上下文
#### 包含块(containing block?)
每个元素都是相对于其包含块摆放的，可以这么说，包含块就是一个元素的“布局上下文”。

对于正常的西方语言文本流中的一个元素，包含块由最近的块级祖先框、表单元格或行内块祖先框的内容边界(content edge)，考虑下面元素：
```
<body>
	<div>
		<p>This is a paragraph</p>
	</div>
</body>
```
p元素的包含块是div元素，因此p的布局依赖于div的布局。

行内元素的摆放方式并不直接依赖于包含块。

### 5. line-height的继承问题
当一个块级元素从另一个元素继承line-height时，需要注意不同值得区别，当设置为em，或者百分数时，此时行高计算的基数是按照父元素的font-size。如果想要设置成按照子元素的font-size，需要指定成一个数，这个数将作为缩放因子参与计算。


### 6. margin和padding的百分比的问题
margin box和padding box的四个属性，`margin-top,margin-bottom,margin-left,margin-right,padding-top,padding-bottom,padding-left,padding-right`，如果是百分比的值，那么都是相对于其包含块的width计算的，即使是top和bottom也不例外
