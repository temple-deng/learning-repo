# 10 Visual formatting model details

标签（空格分隔）： 未分类

---

## Definition of "containing block"

一个元素的盒子的位置和尺寸有时计算时是相对于一个已经确定的矩形计算的，这个矩形叫做元素的包含块。  

包含块的定义：  

1. 根元素所在的包含块叫做初始包含块。
2. 如果元素的定位属性是 `relative` 或者 `static`， 包含块就是最近的生成格式化上下文的块容器盒的 content edge。
3. 如果是 `fixed` 元素，包含块是视口。
4. 如果是 `absolute` 元素，包含块就是最近的 `relative`, `absolute`, `fixed` 祖先元素按照下列规则建立的：
  + 如果祖先是行内元素，包含块就是这个祖先行内盒子的 padding box。
  + 否则的话，包含块是祖先的 padding edge。

## Content width: the 'width' property

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


这个属性指定了盒子的内容区域的宽度。  

这个属性不能应用到非置换的行内元素。非置换行内元素盒子的内容区域的宽度是其内部渲染内容的宽度。回忆一下行框中的行内盒。行框的宽度是由它们包含块控制的，但可能由于浮动元素的存在而缩短。  

百分比值的意义： 百分比的计算值考虑了生成盒的包含块的宽度。 如果其包含块的宽度取决于这个元素的宽度，那么最终的结果是未定义的在CSS2.2中。 **注意：对于那些包含块是一个块容器元素的绝对定位元素， 百分比值是关于元素的padding box的宽度。（也就是说这样的绝对定位元素的百分比值要按包含块的width+padding left+padding right计算）**  

width属性不接受负值。

## Calculating widths and margins

元素布局使用的`width`, `margin-left` `margin-right` `left` `right`的属性值取决于生成盒子和彼此之间盒子的类型。原则上，使用的值和计算值是一样的，`auto`值被一些自适应的值取代，百分比值根据包含块计算，但是也有例外。需要分辨以下几种情况。  

1. 行内非置换元素
2. 行内置换元素
3. 常规流中非置换的块级元素
4. 常规流中块级置换元素
5. 浮动的非置换元素
6. 浮动的置换元素
7. 绝对定位的非置换元素
8. 绝对定位的置换元素
9. 常规流中的 `inline-block`非置换元素
10. 常规流中的 `inline-block`非置换元素




###  行内非置换元素

`width`属性无效果，`margin-left`和`margin-right`的auto计算值会使用0.  


### 行内置换元素

`margin-left`和`margin-right`的auto计算值使用值0.  

如果`height`和`width`属性都是计算值`auto`，并且元素有一个本身固有的width,那么`width`使用的值就是这个固有的宽度。  

如果`height`和`width`属性都有计算值`auto`并且元素没有固有宽度，但是有一个固有的高度和固有的比例；或者`width`属性是计算值`auto`，`height`有其他的计算值，元素有固有的比例，那么就这样计算`width`值  

 > (used height) * (intrinsic ratio)

如果`height`和`width`都是计算值`auto`，并且元素既没有固有宽高，也没有固有比例，那么`width`的使用值在CSS2.2中是未定义的。然而，这表明，如果包含块的宽度不取决置换元素的宽度，那么`width`使用值是根据常规流中块级非置换元素的等式计算的。  

否则，如果`width`有计算值`auto`，并且元素有固有宽度，那就使用固有宽度。  

否则，如果`width`有计算值`auto`，但是都不满足上述的情况，那么就使用`300px`。  


### Block-level, non-placed elements in normal flow 常规流中的块级非置换元素

The following constraints must hold among the used values of the other properties:  

以下约束必须在其他属性的使用值之间保持：

> 'margin-left' + 'border-left-width' + 'padding-left' + 'width' + 'padding-right' + 'border-right-width' + 'margin-right' = width of containing block  

如果 `width` 不为 `auto`， 并且`'border-left-width' + 'padding-left' + 'width' + 'padding-right' + 'border-right-width'`大于包含块的宽度，并且任意的 `margin-left` 或 `margin-right` 不为 `auto`, 那么`margin-left` 或 `margin-right` 的 `auto` 使用值最终为0.  


如果上述所有都有除 `auto` 以外的计算值，那么这个值就说是过度约束了，所以总会有一个使用值最终会和其计算值不同。如果包含块的 `direction` 是 `ltr`，那么 `margin-right`的值会被忽略以便使上面的等式成立。  


如果其中只有一个值声明为 `auto`, 最终的使用值会用来满足等式。  

如果 `width` 为 `auto`， 其他的 `auto` 值变为0， `width`的计算会满足等式。  

如果`margin-left, margin-right` 都为 `auto`, 它们的使用值最终是相等的。这会将元素水平居中。  




### Block-level, replaced elements in normal flow 常规流中的块级置换元素

`width` 的使用值与行内替换元素计算方式相同，margin的计算方式与块级非替换元素的方式相同。  



### Floating, non-replaced elements 浮动非置换元素

`auto` 的 `margin-left, margin-right` 计算值使用为0.  

如果 `width` 是 `auto`，使用值会收缩去适应宽度。  

计算收缩适应宽度同计算使用自动表格布局算法的表格单元格的宽度相似。大致上：以除明确换行以外的地方以外都不断行的方式格式化内容来计算首选宽度，同时也计算首选最小宽度，比如说，通过尝试所有断行来计算。接着，找到可用宽度：在这种情况下，该宽度是包含块的宽度减去 margin-left，border-left-width，padding-left，padding-right，border-right-width，margin-right，以及所有相关滚动条的宽度。  


那么该收缩适应宽度即：min(max(首选最小宽度,可用宽度),首选宽度)。  



###  Floating, replaced elements 浮动置换元素


如果 margin-left 或 margin-right 计算值为 auto，则其使用值为 0。width 的使用值同行内置换元素。  
