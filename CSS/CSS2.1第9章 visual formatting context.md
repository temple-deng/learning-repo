# CSS2.1第9章 visual formatting context

标签（空格分隔）： 未分类

---

> 部分内容摘自 http://blog.doyoe.com/2015/03/09/css/%E8%A7%86%E8%A7%89%E6%A0%BC%E5%BC%8F%E5%8C%96%E6%A8%A1%E5%9E%8B%E4%B8%AD%E7%9A%84%E5%90%84%E7%A7%8D%E6%A1%86/

### 9.1 visual formatting model 简介
This chapter and the next describe the visual formatting model: how user agents process the document tree for visual media.

视觉上下文模型描述了用户代理（浏览器）为了视觉媒体如何处理文档树。

In the visual formatting model, each element in the document tree generates zero or more boxes according to the box model. The layout of these boxes is governed by:

在视觉上下文模型中，文档数中的每个元素都会根据盒模型生成0或多个盒子。这些盒子的布局受下面的几个元素控制：

+ box dimensions and type.
+ positioning scheme (normal flow, float, and absolute positioning).
+ relationships between elements in the document tree.
+ external information (e.g., viewport size, intrinsic dimensions of images, etc.).

+ 盒子的尺寸和类型
+ 定位模式（常规文档流，浮动，或者是绝对定位）
+ 元素之间的关系。
+ 外部信息（例如：视口大小，置换元素的固有尺寸等等）。


An element is called out of flow if it is floated, absolutely positioned, or is the root element.

An element is called in-flow if it is not out-of-flow. The flow of an element A is the set consisting of A and all in-flow elements whose nearest out-of-flow ancestor is A.

如果一个元素是浮动的，或者是绝对定位的，或者是根元素，那么这个元素就叫做在**流外**。

如果一个元素不在流外，那就说它是**流内的**。

<br>
#### 9.1.2 Containing blocks包含框
In CSS 2.1, many box positions and sizes are calculated with respect to the edges of a rectangular box called a containing block. In general, generated boxes act as containing blocks for descendant boxes; we say that a box "establishes" the containing block for its descendants. The phrase "a box's containing block" means "the containing block in which the box lives," not the one it generates.

在CSS 2.1中， 许多盒子的位置和尺寸是由一个叫做包含块的矩形盒子的边缘计算出来的。通常来说，一个元素生成的盒子通常会充当其子盒子的包含块；我们说一个盒子为它的子盒子“建立”了包含框。 短语“一个盒子的包含块”意味着“该盒子所处的包含块”， 而不是它生成的包含块。

Each box is given a position with respect to its containing block, but it is not confined by this containing block; it may overflow.

每个盒子都会由包含块给与一个位置，但是这个盒子并不受包含块的控制，它可能会溢出(overflow)
<br>
### 9.2 Controlling box generation
 A box's type affects, in part, its behavior in the visual formatting model. The 'display' property, described below, specifies a box's type.
 
 盒子的类型会部分影响它在视觉上下文模型中的行为。 ‘display’属性则会说明盒子的类型。

<br>
#### 9.2.1 Block-level elements and block boxes 块级元素和块盒子
Block-level elements are those elements of the source document that are formatted visually as blocks (e.g., paragraphs). The following values of the 'display' property make an element block-level: 'block', 'list-item', and 'table'.

块级元素就是那些在文档中视觉上格式化为块（比如 段落p）的元素。`display`属性为`block`,`list-item`,`table`,`flex`, `grid`的元素会成为块级元素。

Block-level boxes are boxes that participate in a block formatting context. Each block-level element generates a principal block-level box that contains descendant boxes and generated content and is also the box involved in any positioning scheme. Some block-level elements may generate additional boxes in addition to the principal box: 'list-item' elements. These additional boxes are placed with respect to the principal box.

块级元素生成的块级盒子参与了BFC。每个块级元素都会生成一个主要的块级盒子来包含它的子盒子和生成的内容，同时这个盒子参与了任何的定位方式。某些块级元素还会在主要的块级框之外产生额外的框：例如 list-item 元素，它需要生成一个额外的框用于包含 list-style-type。这些额外的框会相对于主要的块级框来进行排版。

Except for table boxes, which are described in a later chapter, and replaced elements, a block-level box is also a block container box. A block container box either contains only block-level boxes or establishes an inline formatting context and thus contains only inline-level boxes. An element whose principal box is a block container box is a block container element. Values of the 'display' property which make a non-replaced element generate a block container include 'block', 'list-item' and 'inline-block'.Not all block container boxes are block-level boxes: non-replaced inline blocks and non-replaced table cells are block containers but not block-level boxes. Block-level boxes that are also block containers are called block boxes.

除了表格元素`table`和替换元素生成的块级盒，一个块级盒子也是一个块容器盒。一个块容器盒要么只包含块级盒子，要么创建一个IFC而只包含行内级盒子，但不能同时包含块级盒子和行内级盒子。一个元素如果它生成的主要盒子是块容器盒，那么这个元素就是一个块容器元素。可以让一个非置换元素生成块容器盒的`display`属性值包括`block`,`list-item`和`inline-block`. 并不是所有的块容器盒子都是块级盒子：非替换行内块(display:inline-block)和非替换表单元格是块容器盒，但不是块级盒子。既是块级盒子(block-level boxes)也是块容器盒(block container boxes)的叫做块盒子(block boxes)。
![此处输入图片的描述][1]

**9.2.1.1 Anonymous block boxes**
考虑下面的文档结构

```html
<DIV>
  Some text
  <P>More text
</DIV>
```

the DIV appears to have both inline content and block content. To make it easier to define the formatting, we assume that there is an anonymous block box around "Some text".

div中既有行内的内容，也有块的内容。为了容易一点说明这种格式，我们假设在“Some text”周围有一个匿名的块盒子。

![此处输入图片的描述][2]

In other words: if a block container box (such as that generated for the DIV above) has a block-level box inside it (such as the P above), then we force it to have only block-level boxes inside it.

换句话说：如果一个块容器盒中有一个块级盒子， 那么我们将强制它仅仅包含块级盒子。

When an inline box contains an in-flow block-level box, the inline box (and its inline ancestors within the same line box) are broken around the block-level box (and any block-level siblings that are consecutive or separated only by collapsible whitespace and/or out-of-flow elements), splitting the inline box into two boxes (even if either side is empty), one on each side of the block-level box(es). The line boxes before the break and after the break are enclosed in anonymous block boxes, and the block-level box becomes a sibling of those anonymous boxes. When such an inline box is affected by relative positioning, any resulting translation also affects the block-level box contained in the inline box.

当一个行内盒子包含一个流内的块级盒子， 这个行内盒子(以及它同一行框内的内联祖先)会在块级盒子处断开， 将行内盒子分割为两个盒子(即便有一边是空的), 块级盒子一边放一个。 在断开处之前和之后的行内盒子被装入到匿名的块盒子中， 并且那个块级盒子变成这个匿名盒子的兄弟。当这样的一个行内盒子受相对定位影响时， 任何的结果都会影响其中的块级盒子。

<br>

##### 9.2.2 Inline-level elements and inline boxes
<br>
Inline-level elements are those elements of the source document that do not form new blocks of content; the content is distributed in lines (e.g., emphasized pieces of text within a paragraph, inline images, etc.). The following values of the 'display' property make an element inline-level: 'inline', 'inline-table', and 'inline-block'. Inline-level elements generate inline-level boxes, which are boxes that participate in an inline formatting context.

行内级元素是那些不会为生成新的内容块；而让内容分布在多行中的元素。 `display`属性值为`inline, inline-table, inline-block`的值会让元素成为行内级元素。行内级元素生成行内级盒子，参与IFC的布局。

An inline box is one that is both inline-level and whose contents participate in its containing inline formatting context. A non-replaced element with a 'display' value of 'inline' generates an inline box. Inline-level boxes that are not inline boxes (such as replaced inline-level elements, inline-block elements, and inline-table elements) are called atomic inline-level boxes because they participate in their inline formatting context as a single opaque box.

一个行内盒子是一个行内级盒子，并且它的内容参与了它包含的IFC。一个`display`属性为`inline`的非替换元素生成一个行内盒子。那些不是行内盒子的行内级盒子（例如行内级置换元素、`inline-block `元素、`inline-table`元素）被称为 原子行内级盒子，因为它们是以单一不透明盒子的形式来参与其 IFC 的, 其实就是不能拆分成多个盒，行内盒子的内容可以与其他内容共处同一行，因为可以行内盒子还可以拆分成小盒子，但是原子行内级盒子就只能以一个单一盒子参与IFC。

![此处输入图片的描述][3]


简单概括一下： 

+ 块级盒子(block-level boxes) : 块级元素生成的盒子。
+ 行内级盒子(inline-level boxes)： 行内级元素生成的盒子。
+ 块容器盒(block container boxes) ： 除了tabel元素和替换元素以外的块级盒子，也是块容器盒。但是并不是所有的块容器盒子都是块级盒子：非替换行内块(display:inline-block)和非替换表单元格是块容器盒， 但不是块级盒子（猜测它们应该是行内级盒子）。
+ 块盒子(block boxes) ： 既是块级盒子又是块容器盒的盒子就是块盒子。
+ 行内盒子(inline boxes) ： 当行内级盒子和它的内容一起参与包含它们的IFC的时候，这个盒子就是行内盒子，目前来看，仅仅包含`display` 为 `inline` 的非置换元素。
+ 原子行内级盒子(auomic inline-level boxes) ： 非行内盒子的行内级盒子就是这种了，包括 `display`为
`inline` 的替换元素，以及`inline-block`和`inline-table`元素。

块级元素生成主要的块级盒子，行内级元素生成主要的行内级盒子，这两种盒子分别参与BFC或者IFC，并且参与定位。

<br>
### 9.4 Normal flow 常规流
Boxes in the normal flow belong to a formatting context, which may be block or inline, but not both simultaneously. Block-level boxes participate in a block formatting context. Inline-level boxes participate in an inline formatting context.

常规流中的各种盒子属于一个格式化的上下文，这个上下文可能是块的也可能是行内的，但不会两者皆是。块级盒子参与BFC，行内级盒子参与IFC。

<br>
#### 9.4.1 Block formatting contexts
Floats, absolutely positioned elements, block containers (such as inline-blocks, table-cells, and table-captions) that are not block boxes, and block boxes with 'overflow' other than 'visible' (except when that value has been propagated to the viewport) establish new block formatting contexts for their contents.

非块盒子的浮动元素，绝对定位的元素，块容器盒（例如 行内块，table-cells和table-captions，这就是属于块容器盒但不属于块级盒的那部分），以及那些`overflow`属性值不为`visible`的块盒子为它们的内容建立了一个新的BFC。（要注意普通的块级盒子只是参与BFC，这些是建立了新的BFC）

In a block formatting context, boxes are laid out one after the other, vertically, beginning at the top of a containing block. The vertical distance between two sibling boxes is determined by the 'margin' properties. Vertical margins between adjacent block-level boxes in a block formatting context collapse.

在一个BFC中，盒子是从包含块的上边缘一个接一个的垂直排列的。 两个相邻兄弟盒子的垂直距离由`margin`属性决定。在一个BFC中两个相邻块级盒子的垂直`maring`会发生重叠。

In a block formatting context, each box's left outer edge touches the left edge of the containing block (for right-to-left formatting, right edges touch). This is true even in the presence of floats (although a box's line boxes may shrink due to the floats), unless the box establishes a new block formatting context (in which case the box itself may become narrower due to the floats).

在一个BFC中，每个盒子的左外边缘紧挨着包含块的左边缘。即便有浮动的影响也是这样的，除非这个盒子建立了一个新的BFC。

<br>
#### 9.4.2 Inline formatting contexts
In an inline formatting context, boxes are laid out horizontally, one after the other, beginning at the top of a containing block. Horizontal margins, borders, and padding are respected between these boxes. The boxes may be aligned vertically in different ways: their bottoms or tops may be aligned, or the baselines of text within them may be aligned. The rectangular area that contains the boxes that form a line is called a line box.

在一个IFC中， 盒子都是从包含块的顶部边缘一个接一个水平排列的。 这些盒子会遵守水平方向的`marings`, `borders` 和 `padding`。 这些盒子在垂直方向对齐时有不同的方式： 可能是底部对齐，也可能是顶部对齐，又或者是盒子内文本的基线对齐。 包含这些盒子的矩形区域形成了行框。

The width of a line box is determined by a containing block and the presence of floats. The height of a line box is determined by the rules given in the section on line height calculations.

一个行框的宽度是由包含块和浮动特性决定的。（必要时换行新建一个行框，以及出现浮动时，收缩行框宽度，形成包裹浮动元素的效果）行框的高度是由这一部分行高属性`line-height`的计算值的规则决定的。
内容区的高度可以认为是字体的大小，内容区加上行间距就是行内盒子的高度，而行框又是一系列行内盒子组成的。

A line box is always tall enough for all of the boxes it contains. However, it may be taller than the tallest box it contains (if, for example, boxes are aligned so that baselines line up). When the height of a box B is less than the height of the line box containing it, the vertical alignment of B within the line box is determined by the 'vertical-align' property. When several inline-level boxes cannot fit horizontally within a single line box, they are distributed among two or more vertically-stacked line boxes. Thus, a paragraph is a vertical stack of line boxes. Line boxes are stacked with no vertical separation (except as specified elsewhere) and they never overlap.

一个行框的高度是足够包裹住它所包含的所有元素的。 然而，它也可能比所包含盒子中最高的盒子还高。当一个盒子B的高度是低于包含它的行框的高度时，B在垂直方向的对齐方式是由`vertical-align`属性决定的。当某些行内级盒子水平方向上在一个行框中放不下的时候，它们就会垂直方向上堆起两个或多个行框。因此，一个P段落就是一系列行框垂直方向上堆叠起来的。

In general, the left edge of a line box touches the left edge of its containing block and the right edge touches the right edge of its containing block. However, floating boxes may come between the containing block edge and the line box edge. Thus, although line boxes in the same inline formatting context generally have the same width (that of the containing block), they may vary in width if available horizontal space is reduced due to floats. Line boxes in the same inline formatting context generally vary in height (e.g., one line might contain a tall image while the others contain only text).

一般来说，一个行框的左边缘是紧贴着其包含块的左边缘，右边缘贴着包含块的右边缘。然而，浮动盒子可能会出现在包含块边缘与行框边缘之间。因此，虽然在同一IFC中的行框一般来说有相同的宽度（就是包含块的宽度），它们仍可能由于浮动元素的影响来改变自己的宽度为水平方向上的剩余空间的宽度。同一IFC中的行框一般来说高度都是不同的（比如说一行有一个较高的图片，而其他行仅仅包含文本）

When the total width of the inline-level boxes on a line is less than the width of the line box containing them, their horizontal distribution within the line box is determined by the 'text-align' property. If that property has the value 'justify', the user agent may stretch spaces and words in inline boxes (but not inline-table and inline-block boxes) as well.

当一行中的全部行内级盒子的宽度的总和是小于包含它们行框的宽度时，它们在水平方向上的分配是取决去`text-align`属性，如果这个属性值是`justify`，那么浏览器会拉伸行内盒子的空白和单词（但在原子级行内级盒子中不会）

When an inline box exceeds the width of a line box, it is split into several boxes and these boxes are distributed across several line boxes. If an inline box cannot be split (e.g., if the inline box contains a single character, or language specific word breaking rules disallow a break within the inline box, or if the inline box is affected by a white-space value of nowrap or pre), then the inline box overflows the line box.

当一个行内盒子的宽度超过了行框的宽度， 它会分成几个跨行框的盒子。如果一个行内盒子不能分割（例如，如果一个行内盒子是一个单字符，或者我们声明了单词的截断规则是在一个行框中不允许截断，又或者行内盒子声明了`white-space`值为`nowrap`或者`pre`）,那么行内盒子可能会溢出行框。

When an inline box is split, margins, borders, and padding have no visual effect where the split occurs (or at any split, when there are several).

当一个行内盒被分割开， `margins`,`borders`和`padding`在分割出现的地方都会没有视觉效果。（这个分割的地方其实应该指的是换行的地方）

Line boxes are created as needed to hold inline-level content within an inline formatting context. Line boxes that contain no text, no preserved white space, no inline elements with non-zero margins, padding, or borders, and no other in-flow content (such as images, inline blocks or inline tables), and do not end with a preserved newline must be treated as zero-height line boxes for the purposes of determining the positions of any elements inside of them, and must be treated as not existing for any other purpose.

行框是为了维持行内级文本在一个IFC而建立的。后面的完全不理解。。。

<br>
### 9.5 Floats
A float is a box that is shifted to the left or right on the current line. The most interesting characteristic of a float (or "floated" or "floating" box) is that content may flow along its side (or be prohibited from doing so by the 'clear' property). Content flows down the right side of a left-floated box and down the left side of a right-floated box. The following is an introduction to float positioning and content flow; the exact rules governing float behavior are given in the description of the 'float' property.

浮动盒子是一个移动到当前行左边或右边的盒子。float盒子最有趣的特性是文本可能包裹在它的边上（如果设置了`clear`属性的话就没有这样的效果）。文本包裹在一个左浮动盒子的右边或者在一个右浮动盒子的左边。

A floated box is shifted to the left or right until its outer edge touches the containing block edge or the outer edge of another float. If there is a line box, the outer top of the floated box is aligned with the top of the current line box.

浮动盒子会向左右移动，直到它的外边缘触碰到包含块的外边缘或者其他浮动元素的外边缘为止。如果有行框，那么浮动盒子顶端的外部会和当前行框的顶端对齐。


If there is not enough horizontal room for the float, it is shifted downward until either it fits or there are no more floats present.

如果在水平方向上的空间不够放下浮动的元素，它就会往下移动，直到找到可以放下它的地方，或者找到没有其他浮动元素的地方。

Since a float is not in the flow, non-positioned block boxes created before and after the float box flow vertically as if the float did not exist. However, the current and subsequent line boxes created next to the float are shortened as necessary to make room for the margin box of the float.

由于浮动元素不在流中，非定位元素的块盒子在垂直方向上会出现在浮动元素的前边或后边，就好像浮动元素不存在一样。然而，紧挨着浮动元素的当前的和后面的行框(注意是行框，意味着行框内的内容与浮动元素之间有margin值)，有必要缩短自己的宽度来为浮动元素的margin box留下空间。

A line box is next to a float when there exists a vertical position that satisfies all of these four conditions: (a) at or below the top of the line box, (b) at or above the bottom of the line box, (c) below the top margin edge of the float, and (d) above the bottom margin edge of the float.

在垂直方向的位置上满足下面四种情况才能说一个行框紧挨着浮动盒子：
1. 在行框的top位置或位置之下  
2. 在行框的bottom位置或位置之上  
3. 在浮动元素的top margin边缘之下
4. 在浮动元素的bottom margin边缘之上

If a shortened line box is too small to contain any content, then the line box is shifted downward (and its width recomputed) until either some content fits or there are no more floats present. Any content in the current line before a floated box is reflowed in the same line on the other side of the float. In other words, if inline-level boxes are placed on the line before a left float is encountered that fits in the remaining line box space, the left float is placed on that line, aligned with the top of the line box, and then the inline-level boxes already on the line are moved accordingly to the right of the float (the right being the other side of the left float) and vice versa for rtl and right floats.

如果一个缩短了的行框宽度太小以至于放不小任何的文本，那么这个行框就会下移(宽度会重新计算)，直到一个可以放下文本或者没有浮动元素存在的位置。 当前行中任何在浮动元素前面的内容都会"流回"到当前行浮动元素的另一侧。 换句话说， 如果行内级盒子位于一个左浮动元素前面，并且行框剩余空间可以放下它的内容，那么左浮动就会放置在这一行，和行框的top对齐，并且那个行内级盒子移动到浮动盒子的右边。

The border box of a table, a block-level replaced element, or an element in the normal flow that establishes a new block formatting context (such as an element with 'overflow' other than 'visible') must not overlap the margin box of any floats in the same block formatting context as the element itself. If necessary, implementations should clear the said element by placing it below any preceding floats, but may place it adjacent to such floats if there is sufficient space. They may even make the border box of said element narrower than defined by section 10.3.3. CSS2 does not define when a UA may put said element next to the float or by how much said element may become narrower.

一个表格元素的border box， 一个块级置换元素，或者一个常规流中建立了一个新的BFC(例如一个元素overflow属性不为`visible`)的元素，
不能够和处于同一BFC中的浮动元素的margin box重叠。如果有必要的话， 浏览器的实现者应该将元素放置到位于其之前的任意浮动元素下方，当时如果有足够空间的话，也可以将这个元素放置到浮动元素的相邻位置。它们甚至可以缩短在10.3.3部分定义的上述元素的border box。CSS2没有定义浏览器什么时候应该将上述元素放置到紧挨着浮动元素的位置，或者上述元素应该缩短多少。

<br>
<br>

#### 9.5.1 Positioning the float: the 'float' property
Here are the precise rules that govern the behavior of floats:

下面是一些控制浮动元素行为的明确的规则： 

1. The left outer edge of a left-floating box may not be to the left of the left edge of its containing block. An analogous rule holds for right-floating elements.

2. If the current box is left-floating, and there are any left-floating boxes generated by elements earlier in the source document, then for each such earlier box, either the left outer edge of the current box must be to the right of the right outer edge of the earlier box, or its top must be lower than the bottom of the earlier box. Analogous rules hold for right-floating boxes.

3. The right outer edge of a left-floating box may not be to the right of the left outer edge of any right-floating box that is next to it. Analogous rules hold for right-floating elements.

4. A floating box's outer top may not be higher than the top of its containing block. When the float occurs between two collapsing margins, the float is positioned as if it had an otherwise empty anonymous block parent taking part in the flow. The position of such a parent is defined by the rules in the section on margin collapsing.

5. The outer top of a floating box may not be higher than the outer top of any block or floated box generated by an element earlier in the source document.

6. The outer top of an element's floating box may not be higher than the top of any line-box containing a box generated by an element earlier in the source document.

7. A left-floating box that has another left-floating box to its left may not have its right outer edge to the right of its containing block's right edge. (Loosely: a left float may not stick out at the right edge, unless it is already as far to the left as possible.) An analogous rule holds for right-floating elements.

8. A floating box must be placed as high as possible.

9. A left-floating box must be put as far to the left as possible, a right-floating box as far to the right as possible. A higher position is preferred over one that is further to the left/right.



1. 浮动元素的左外边缘不能位于其包含块的左边缘的左边。右浮动元素有相同的规则。
2. 如果当前盒子是左浮动的，并且存在任意的相同文档中之前元素生成的左浮动盒子，那么对于这些文档中靠前的盒子，要么当前盒子的左外边缘必须在这些盒子的右外边缘的右边，要么当前盒子的top要比这些盒子的bottom更低（也就是要么在右边，要么在下边）。
3. 左浮动盒子的右外边缘不能位于紧挨着它的右浮动盒子的左外边缘的右边。
4. 一个浮动盒子的top的外边不能比其包含块还高。当浮动元素出现在两个重叠的margin之间，浮动元素定位时仿佛它有一个空的匿名的父级block参与到流中，这个父级的位置通过margin合并章节中的规则来定义。
5. 浮动元素的top外边不可以比任何文档中位于其前部的块元素或者浮动元素高。
6. 一个元素的浮动盒的外top不能高于任何含有源文档中在此之前的元素生成的盒的行框的top 
7. 左边存在另一个左浮动盒的左浮动盒的right外边不能位于其包含块的right边的右边（不严谨的：一个左浮动盒不能超出right边，除非它已经尽量向左（紧挨着包含块的left边）了）。右浮动元素也有类似的规则 
8. 浮动盒必须尽量高往高放（A floating box must be placed as high as possible） 
9. 左浮动盒必须尽量往左放，右浮动盒尽量往右放。更高的位置要比更左/右的位置优先 。













  [1]: http://blog.doyoe.com/image/boxes/block-boxes.png
  [2]: https://www.w3.org/TR/CSS2/images/anon-block.png
  [3]: http://blog.doyoe.com/image/boxes/inline-boxes.png




