# 10 Visual formatting model details

标签（空格分隔）： 未分类

---

## 10.1 Definition of "containing block"

The position and size of an element's box(es) are sometimes calculated relative to a certain rectangle, called the containing block of the element. The containing block of an element is defined as follows:

一个元素的盒子的位置和尺寸有时计算时是相对于一个已经确定的矩形计算的，这个矩形叫做元素的包含块。一个元素的包含块是按如下规则定义的：

1. The containing block in which the root element lives is a rectangle called the initial containing block. 

1. 根元素的包含块叫做初始包含块。  

2. For other elements, if the element's position is 'relative' or 'static', the containing block is formed by the content edge of the nearest ancestor box that is a block container or which establishes a formatting context.

2. 对于其他元素， 如果元素的定位属性是 `relative` 或者 `static`， 它的包含块是由其最接近的祖先的块容器盒或者建立了新的格式化上下文的盒子的内容边缘`content edge`形成的。

3. If the element has 'position: fixed', the containing block is established by the viewport in the case of continuous media or the page area in the case of paged media.

3. 如果元素的定位属性值是`fixed`， 元素的包含块由媒体的视口建立的。

4. If the element has 'position: absolute', the containing block is established by the nearest ancestor with a 'position' of 'absolute', 'relative' or 'fixed', in the following way:
   1. In the case that the ancestor is an inline element, the containing block is the bounding box around the padding boxes of the first and the last inline boxes generated for that element. In CSS 2.2, if the inline element is split across multiple lines, the containing block is undefined.
   2. Otherwise, the containing block is formed by the padding edge of the ancestor.

4. 如果元素的定位属性是`absolute`，其包含块是由其最近的定位属性为`absolute`,`relative`或者`fixed`的祖先元素按照如下方式建立的。
   1. 如果祖先是一个行内元素(display:inline？)，包含块就是该祖先元素为该元素生成的第一个和最后一个行内盒`padding box`的边界盒`bounding box`，在CSS2.2中，如果行内元素分成了多行，其包含块是未定义的。（纳尼？）
   2. 否则，元素的包含块是由其祖先的`padding edge`形成的。

If there is no such ancestor, the containing block is the initial containing block.

如果没有这样的祖先元素，包含块就是初始包含块。

## 10.2 Content width: the 'width' property

<table>
	<tbody>
		<tr>
			<td>属性名</td>
			<td>width</td>
		</tr>
		<tr>
			<td>属性值</td>
			<td>&lt;length&gt; | &lt;percentage&gt; | auto | inherit</td>
		</tr>
		<tr>
			<td>初始值</td>
			<td>auto</td>
		</tr>
		<tr>
			<td>可应用的元素</td>
			<td>
				除非置换的内联元素，table rows和 row groups元素外的所有元素
			</td>
		</tr>
		<tr>
			<td>是否可继承</td>
			<td>否</td>
		</tr>
		<tr>
			<td>百分比</td>
			<td>参考包含块的百分比</td>
		</tr>
		<tr>
			<td>计算值</td>
			<td>百分比值或者说明的auto或者绝对长度</td>
		</tr>
	</tbody>
</table>

This property specifies the content width of boxes.

这个属性指定了盒子的内容区域的宽度。

This property does not apply to non-replaced inline elements. The content width of a non-replaced inline element's boxes is that of the rendered content within them (before any relative offset of children). Recall that inline boxes flow into line boxes. The width of line boxes is given by the their containing block, but may be shorted by the presence of floats.

这个属性不能应用到非置换的行内元素。非置换行内元素盒子的内容区域的宽度是其内部渲染内容的宽度。回忆一下行框中的行内盒。行框的宽度是由它们包含块控制的，但可能由于浮动元素的存在而缩短。  

百分比值的意义： 百分比的计算值考虑了生成盒的包含块的宽度。 如果其包含块的宽度取决于这个元素的宽度，那么最终的结果是未定义的在CSS2.2中。 **注意：对于那些包含块是一个块容器元素的绝对定位元素， 百分比值是关于元素的padding box的宽度。（也就是说这样的绝对定位元素的百分比值要按包含块的width+padding left+padding right计算）**  

width属性不接受负值。

## 10.3 Calculating widths and margins

The values of an element's 'width', 'margin-left', 'margin-right', 'left' and 'right' properties as used for layout depend on the type of box generated and on each other. (The value used for layout is sometimes referred to as the used value.) In principle, the values used are the same as the computed values, with 'auto' replaced by some suitable value, and percentages calculated based on the containing block, but there are exceptions. The following situations need to be distinguished:


元素布局使用的`width`, `margin-left` `margin-right` `left` `right`的属性值取决于生成盒子和彼此之间盒子的类型。原则上，使用的值和计算值是一样的，`auto`值被一些自适应的值取代，百分比值根据包含块计算，但是也有例外。需要分辨以下几种情况。

1. inline, non-replaced elements

1. 行内非置换元素

2. inline, replaced elements

2. 行内置换元素

3. block-level, non-replaced elements in normal flow

3. 常规流中非置换的块级元素

4. block-level, replaced elements in normal flow

4. 常规流中块级置换元素

5. floating, non-replaced elements

5. 浮动的非置换元素

6. floating, replaced elements

6. 浮动的置换元素

7. absolutely positioned, non-replaced elements

7. 绝对定位的非置换元素

8. absolutely positioned, replaced elements

8. 绝对定位的置换元素

9. 'inline-block', non-replaced elements in normal flow

9. 常规流中的 `inline-block`非置换元素

10. 'inline-block', replaced elements in normal flow

10. 常规流中的 `inline-block`非置换元素

### 10.3.1 行内非置换元素
The 'width' property does not apply. A computed value of 'auto' for 'margin-left' or 'margin-right' becomes a used value of '0'.

`width`属性无效果，`margin-left`和`margin-right`的auto计算值会使用0.

<br>
<br>

### 10.3.2 行内置换元素
A computed value of 'auto' for 'margin-left' or 'margin-right' becomes a used value of '0'.

`margin-left`和`margin-right`的auto计算值使用值0.

If 'height' and 'width' both have computed values of 'auto' and the element also has an intrinsic width, then that intrinsic width is the used value of 'width'.

如果`height`和`width`属性都是计算值`auto`，并且元素有一个本身固有的width,那么`width`使用的值就是这个固有的宽度。
   
 If 'height' and 'width' both have computed values of 'auto' and the element has no intrinsic width, but does have an intrinsic height and intrinsic ratio; or if 'width' has a computed value of 'auto', 'height' has some other computed value, and the element does have an intrinsic ratio; then the used value of 'width' is:
 
 如果`height`和`width`属性都有计算值`auto`并且元素没有固有宽度，但是有一个固有的高度和固有的比例；或者`width`属性是计算值`auto`，`height`有其他的计算值，元素有固有的比例，那么就这样计算`width`值  
 
 > (used height) * (intrinsic ratio)
 
 If 'height' and 'width' both have computed values of 'auto' and the element has an intrinsic ratio but no intrinsic height or width, then the used value of 'width' is undefined in CSS 2.2. However, it is suggested that, if the containing block's width does not itself depend on the replaced element's width, then the used value of 'width' is calculated from the constraint equation used for block-level, non-replaced elements in normal flow.
 
 如果`height`和`width`都是计算值`auto`，并且元素既没有固有宽高，也没有固有比例，那么`width`的使用值在CSS2.2中是未定义的。然而，这表明，如果包含块的宽度不取决置换元素的宽度，那么`width`使用值是根据常规流中块级非置换元素的等式计算的。
 
 Otherwise, if 'width' has a computed value of 'auto', and the element has an intrinsic width, then that intrinsic width is the used value of 'width'.
 
 否则，如果`width`有计算值`auto`，并且元素有固有宽度，那就使用固有宽度。
 
 Otherwise, if 'width' has a computed value of 'auto', but none of the conditions above are met, then the used value of 'width' becomes 300px. If 300px is too wide to fit the device, UAs should use the width of the largest rectangle that has a 2:1 ratio and fits the device instead.
 
 否则，如果`width`有计算值`auto`，但是都不满足上述的情况，那么就使用`300px`。  
 
 <br>
 <br>

### 10.3.3  Block-level, non-placed elements in normal flow 常规流中的块级非置换元素

The following constraints must hold among the used values of the other properties:  

其他属性的使用值必须满足下列的约束条件：  

> 'margin-left' + 'border-left-width' + 'padding-left' + 'width' + 'padding-right' + 'border-right-width' + 'margin-right' = width of containing block  

感觉这样说并不严谨啊， 左边值的和大于右边不就是溢出了么。  

If 'width' is not 'auto' and 'border-left-width' + 'padding-left' + 'width' + 'padding-right' + 'border-right-width' (plus any of 'margin-left' or 'margin-right' that are not 'auto') is larger than the width of the containing block, then any 'auto' values for 'margin-left' or 'margin-right' are, for the following rules, treated as zero.  

如果'width'值不是auto并且左右外边距 + 左右边框宽度 + width(并且左右外边距中任意一值不是auto)的和是大于包含块的宽度， 那么左右外边距中的任意一个值是auto的话， 根据下列的规则， 会被当做0看待。  

If all of the above have a computed value other than 'auto', the values are said to be "over-constrained" and one of the used values will have to be different from its computed value. If the 'direction' property of the containing block has the value 'ltr', the specified value of 'margin-right' is ignored and the value is calculated so as to make the equality true. If the value of 'direction' is 'rtl', this happens to 'margin-left' instead.  

如果上面的所有值(应该是等式)最终的和是除auto以外的计算值， 那这个值(应该指的是和)就说是'over-constrained'， 其中一个的使用值将不同于其计算值。如果包含块的'direction'属性是'ltr'，那么'margin-right'的指定值将会被忽视，计算出的值将满足等式。反之则是'margin-left'。(个人理解是假如除外边距之外的宽度和已经固定，那么根据书写方向的不同，左右外边距中有一个会失效)。  

If there is exactly one value specified as 'auto', its used value follows from the equality.  

如果其中刚好只有一个值是auto, 那么最终的使用值将会由等式推断出。  

If 'width' is set to 'auto', any other 'auto' values become '0' and 'width' follows from the resulting equality.

如果width是auto,  那么其他任何 auto 值变为 0 并且 width 由等式计算得出。  

If both 'margin-left' and 'margin-right' are 'auto', their used values are equal. This horizontally centers the element with respect to the edges of the containing block.

如果左右外边距都是auto, 它们最终使用的值是相等的。 在水平方向上会让元素在包含块中居中。  

<br>
<br>

### 10.3.4 Block-level, replaced elements in normal flow 常规流中的块级置换元素
The used value of 'width' is determined as for inline replaced elements. Then the rules for non-replaced block-level elements are applied to determine the margins.  

width的使用值和行内置换元素计算方法相同的。margin的计算方式是按照块级非置换元素的规则。  

<br>
<br>


### 10.3.5 Floating, non-replaced elements 浮动非置换元素

If 'margin-left', or 'margin-right' are computed as 'auto', their used value is '0'.  

如果左外边距或者右外边距是计算为auto, 那使用值就是0.

If 'width' is computed as 'auto', the used value is the "shrink-to-fit" width.  

如果width计算为auto， 那使用值就是‘收缩至自适应’宽度。

Calculation of the shrink-to-fit width is similar to calculating the width of a table cell using the automatic table layout algorithm. Roughly: calculate the preferred width by formatting the content without breaking lines other than where explicit line breaks occur, and also calculate the preferred minimum width, e.g., by trying all possible line breaks. CSS 2.2 does not define the exact algorithm. Thirdly, find the available width: in this case, this is the width of the containing block minus the used values of 'margin-left', 'border-left-width', 'padding-left', 'padding-right', 'border-right-width', 'margin-right', and the widths of any relevant scroll bars.  

计算收缩适应宽度同计算使用自动表格布局算法的表格单元格的宽度相似。大致上：以除明确换行以外的地方以外都不断行的方式格式化内容来计算首选宽度，同时也计算首选最小宽度，比如说，通过尝试所有断行来计算。接着，找到可用宽度：在这种情况下，该宽度是包含块的宽度减去 margin-left，border-left-width，padding-left，padding-right，border-right-width，margin-right，以及所有相关滚动条的宽度。  

Then the shrink-to-fit width is: min(max(preferred minimum width, available width), preferred width).  

那么该收缩适应宽度即：min(max(首选最小宽度,可用宽度),首选宽度)。  

<br>
<br>

###  10.3.6  Floating, replaced elements 浮动置换元素

If 'margin-left' or 'margin-right' are computed as 'auto', their used value is '0'. The used value of 'width' is determined as for inline replaced elements.  

如果 margin-left 或 margin-right 计算值为 auto，则其使用值为 0。width 的使用值同行内置换元素。  

<br>
<br>

###  10.3.7  Absolutely positioned, non-replaced elements 绝对定位非置换元素  

For the purposes of this section and the next, the term "static position" (of an element) refers, roughly, to the position an element would have had in the normal flow. More precisely:  

在这一节和下一节， 术语"静态位置"(一个元素的)粗略来讲指的是元素处于常规流内的位置(应该就是定位元素在文档流中未偏移时的位置)。精确的说：  

+ The static-position containing block is the containing block of a hypothetical box that would have been the first box of the element if its specified 'position' value had been 'static' and its specified 'float' had been 'none'. (Note that due to the rules in section 9.7 this hypothetical calculation might require also assuming a different computed value for 'display'.)  

+ 静态位置的包含块指的是假设一个元素的'position'属性是'static', 'float'属性是'none'，元素的第一个盒子的包含块。  

+ The static position for 'left' is the distance from the left edge of the containing block to the left margin edge of a hypothetical box that would have been the first box of the element if its 'position' property had been 'static' and 'float' had been 'none'. The value is negative if the hypothetical box is to the left of the containing block.  

+ left 的静态位置是从包含块的左边缘到假定元素 position 值为 static 且 float 值为 none 时，成为其第一个盒的假定盒的左外边距边缘的距离。如果假定盒在包含块左边，该值为负。  

+ The static position for 'right' is the distance from the right edge of the containing block to the right margin edge of the same hypothetical box as above. The value is positive if the hypothetical box is to the left of the containing block's edge.  

+ right 的静态位置是从包含块的右边缘到上述假定盒的右外边距边缘的距离。如果假定盒在包含块左侧，该值为正。

But rather than actually calculating the dimensions of that hypothetical box, user agents are free to make a guess at its probable position.  

用户代理可以自由的假定假想盒子的位置，而不是真正的计算其位置。  

For the purposes of calculating the static position, the containing block of fixed positioned elements is the initial containing block instead of the viewport, and all scrollable boxes should be assumed to be scrolled to their origin.

为了计算静态位置， fixed定位的元素的包含块是初始包含块而不是视口， 并且所有可滚动各自假设滚动到起始位置。

The constraint that determines the used values for these elements is:  

决定这些元素的使用值的是下列约束：  

> 'left' + 'margin-left' + 'border-left-width' + 'padding-left' + 'width' + 'padding-right' + 'border-right-width' + 'margin-right' + 'right' = width of containing block  

If all three of 'left', 'width', and 'right' are 'auto': First set any 'auto' values for 'margin-left' and 'margin-right' to 0. Then, if the 'direction' property of the element establishing the static-position containing block is 'ltr' set 'left' to the static position and apply rule number three below; otherwise, set 'right' to the static position and apply rule number one below.  

如果'left','right','width'3个值都是auto, 首先左右外边距中任意的auto值设置为0，之后如果元素建立的静态位置的包含块的'direction'属性是'ltr'， 使用下面第3条原则设置'left'静态位置；否则使用下面的第1条原则元素设置'right'静态位置。

