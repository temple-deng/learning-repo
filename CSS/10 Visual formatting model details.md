# 10 Visual formatting model details

标签（空格分隔）： 未分类

---

### 10.1 Definition of "containing block"
***
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

### 10.2 Content width: the 'width' property
***
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

### 10.3 Calculating widths and margins
***
The values of an element's 'width', 'margin-left', 'margin-right', 'left' and 'right' properties as used for layout depend on the type of box generated and on each other. (The value used for layout is sometimes referred to as the used value.) In principle, the values used are the same as the computed values, with 'auto' replaced by some suitable value, and percentages calculated based on the containing block, but there are exceptions. The following situations need to be distinguished:


元素布局使用的`width`, `margin-left` `margin-right` `left` `right`的属性值取决于生成盒子和彼此之间盒子的类型。原则上，使用的值和计算值是一样的，`auto`值被一些自适应的值取代，百分比值计算包含块计算，但是也有例外。需要分辨一下几种情况。

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

#### 10.3.1 行内非置换元素
The 'width' property does not apply. A computed value of 'auto' for 'margin-left' or 'margin-right' becomes a used value of '0'.

`width`属性无效果，`margin-left`和`margin-right`的auto计算值会使用0.

#### 10.3.2 行内置换元素
A computed value of 'auto' for 'margin-left' or 'margin-right' becomes a used value of '0'.

`margin-left`和`margin-right`的auto计算值使用值0.

If 'height' and 'width' both have computed values of 'auto' and the element also has an intrinsic width, then that intrinsic width is the used value of 'width'.

如果`height`和`width`属性都是计算值`auto`，并且元素有一个本身固有的width,那么`width`使用的值就是这个固有的宽度。
   
 If 'height' and 'width' both have computed values of 'auto' and the element has no intrinsic width, but does have an intrinsic height and intrinsic ratio; or if 'width' has a computed value of 'auto', 'height' has some other computed value, and the element does have an intrinsic ratio; then the used value of 'width' is:
 
 如果`height`和`width`属性都有计算值`auto`并且元素没有固有宽度，但是有一个固有的高度和固有的比例；或者`width`属性是计算值`auto`，`height`有其他的计算值，元素有固有的比例，那么就这样计算`width`值  
 
 > (used height) * (intrinsic ratio)
 
 If 'height' and 'width' both have computed values of 'auto' and the element has an intrinsic ratio but no intrinsic height or width, then the used value of 'width' is undefined in CSS 2.2. However, it is suggested that, if the containing block's width does not itself depend on the replaced element's width, then the used value of 'width' is calculated from the constraint equation used for block-level, non-replaced elements in normal flow.
 
 如果`height`和`width`都是计算值`auto`，并且元素既没有固有宽高，也没有固有比例，那么`width`的使用值在CSS2.2中是未定义的。然而，推荐这样做，如果包含块的宽度不取决置换元素的宽度，那么`width`使用值是根据常规流中块级非置换元素的等式计算的。
 
 Otherwise, if 'width' has a computed value of 'auto', and the element has an intrinsic width, then that intrinsic width is the used value of 'width'.
 
 否则，如果`width`有计算值`auto`，并且元素有固有宽度，那就使用固有宽度。
 
 Otherwise, if 'width' has a computed value of 'auto', but none of the conditions above are met, then the used value of 'width' becomes 300px. If 300px is too wide to fit the device, UAs should use the width of the largest rectangle that has a 2:1 ratio and fits the device instead.
 
 否则，如果`width`有计算值`auto`，但是都不满足上述的情况，那么就使用`300px`。



