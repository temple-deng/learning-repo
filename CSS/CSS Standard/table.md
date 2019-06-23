# CSS2.2 Table  

## 1. 介绍

table 布局的话有两种算法；一种是固定布局 fixed，一种是自动布局的算法。   

table 中 rows, columns, row groups, column groups 以及单元格 cells 都可以绘制包裹他们的
边框。在对齐数据方面，即可以单独指定 cell 的对齐方式，也可以指定一列或者一行的所有 cells 的
对齐方式。   

## 2. CSS table model

CSS 中的 table model 中包括 tables, captions, rows, row groups, columns, column groups,
cells。   

下面的内容展示了在 HTML4 中可以使用的 table 格式化规则：   

```css
table    { display: table }
tr       { display: table-row }
thead    { display: table-header-group }
tbody    { display: table-row-group }
tfoot    { display: table-footer-group }
col      { display: table-column }
colgroup { display: table-column-group }
td, th   { display: table-cell }
caption  { display: table-caption }
```    

先插一点布局的内容：首先 table 中的元素在布局时，width 及height 会将左边及上边的边框计算在内，
而且仿佛右侧及下侧的边框不属于元素一样，例如一个 table 的 `width:300px; border-width: 3px`，
最终 table 元素的宽度还是 300，但内容区域为 297。   

demo1:    

```css
table {
  width: 400px;
  height: 300px;
  border: 3px solid red;
}
```     

整个表格外围会有一层边框，然后表格的宽为400，高为300，然而其中的内容区域基本上就是 394*294 的了，
有点类似 table 自带 `box-sizing: border-box` 的效果。    

经测试，当 `border-collapse: separate` 时，tbody 上的边框不显示，只有 collapse 才显示，
而且这时候如果设置了 table 的 border，则这两种border重合的地方，tbody 的 border 会盖住 table
的，但是这样说也不准确，只有在 tbody 的 border width 大于等于 table border width 的时候，
才会盖住，如果 table border width 大，则反而 table 的会盖住 tbody 的。   

## 3. Columns

单元格可能属于两种上下文中：行 rows 或者列 columns。然而，在文档中，单元格从来都是行 rows
的后代，不可能是列 columns 的后代。然而，在一些层面上设置列的属性时会影响单元格的表现。   

下面的属性可以应用在 column 及 column-group 元素上：   

+ **border**: 只有当 table 元素上设置了 `border-collapse: collapse` 时 column 上的边框
才会生效。在这种情况下，设置在 columns 和 columns group 上的边框会成为 conflict resolution
algorithm 的输入，这个算法是用来挑选每个单元格边缘的边框的。
+ **background**: 为 column 中的 cells 设置背景，不过只会在 cell 及 row 都是透明的背景时才设置。  
+ **width**: width 属性设置列的最小宽度，注意是最小
+ **visibility**: 如果 column 的 visibility 属性设置为了 collapse，则列中的单元格都不会
被渲染，并且跨越其他列的单元格会被剪切掉，另外，表格的宽会减去该列占据的宽度。   

## 4. Tables in the visual formatting model

就视觉格式化模型而言，表格可能表现成一个块级元素（display: table），也可能表现成一个行内级元素（display: inline-block）。   

在两种情况下，table 都会生成一个叫做 table wrapper box 主要的块容器盒来包含 table box 自身
及 caption boxs。table box 是一个包含 table 内部盒子的块级盒子。caption box 是放在 table
box 的上方还是下方由 'caption-side' 属性决定。   

table wrapper box 具体是块级盒子还是行内级盒子取决于 display: table 或 display: inline-table。
table wrapper box 建立了新的 BFC，table box 建立了 TFC(table formatting context)。
table box(inline-table)会用来做基线对齐等操作。table wrapper box 的宽是其中的 table box
的边框的边缘决定的。   

这里需要分清一些属性到底是使用在 table wrapper box 上还是 table box 上：table 元素上的
'position', 'float', 'margin-\*', 'top', 'right', 'bottom', 'left' 的计算值属性是使用在
table wrapper box 上，其他非继承属性是使用在 table box 上。   

### 4.1 Caption position and alignment

<table>
  <tr>
    <td>名字</td>
    <td>caption-side</td>
  </tr>
  <tr>
    <td>值</td>
    <td>top | bottom | inherit</td>
  </tr>
  <tr>
    <td>初始值</td>
    <td>top</td>
  </tr>
  <tr>
    <td>应用元素</td>
    <td>table-caption 元素</td>
  </tr>
  <tr>
    <td>继承性</td>
    <td>可继承</td>
  </tr>
  <tr>
    <td>百分比</td>
    <td>N/A</td>
  </tr>
</table>  

## 5. Visual layout of table contents  

表格内部元素生成的矩形框会参加 table box 建立的 TFC。这些盒子有内容和边框，单元格的盒子还有
padding，不过这些盒子都不支持 margin。    

内部的 table 元素会生成矩形框参加 TFC。这些盒子有 content, border, 并且 cells 可以有 padding。
但是都没 margin。  

这些盒子的视觉布局受行row和column的不规则的网格生成的矩形控制的。每个盒子会包含1到多个网格单元格，
具体占据 cells 的情况由下面的规则决定：   

1. 每个 row box 占据一个 row of grid cells（占据一行的网格？）
2. 一个 row group 会占据和其包含 row 相等数量的 grid cells
3. 一个 column box 会占据一或多个 columns of grid cells，那这里就和行不一样，row box 只能
占据一行的 cells，但是 column box 可以占据多列的 cells
4. 一个 column group box 同样会占据其包含 column 相等的 grid cells
5. cells 可能会延伸到多行或多列。     

那这个其实可以和 grid 布局进行一下比对，相对就好理解了。   

collapsing borders model 中的 rows, columns, row groups, columns groups 的边缘会与
居中的单元格的边框中假想的网格线重合。（这种模型中，所有的行或者列会完全覆盖表格，不留
任何空隙）。在 separate borders model 中，边缘是与单元格的的边缘重合。（因此在这种模型中，
rows, columns, row groups, column groups 中间可能会有空隙，对应于 border-spacing 属性。    

### 5.1 Table layers and transparency

为了去确定每个 cell 的背景，不同的表格中元素可以被认为是在六个叠加的层上。如果我们在某一层的元素
上设置了背景色，只有该元素上面的层的背景色都是透明的时才能显示出来。   

![cell background](https://www.w3.org/TR/CSS22/images/tbl-layers.png)    


### 5.2 Table width algorithms: table-layout 属性

CSS 并没有为表格定义一个“最佳”的布局方式，因为每个人都“最佳”都有不同的看法。不过CSS确实为表格
布局定义了一些限制，浏览器理应遵守这些限制。理论上在遵守这些限制的情况下，浏览器可以使用任意的算法
来进行表格布局，除非用户选择了 fixed layout 算法。    

- 属性：table-layout
- 可选值：auto, fixed, inherit
- 初始值：auto
- 应用元素：table 或 inline-table 元素
- 继承性：否
- 百分比：不支持

#### 5.2.1 Fixed table layout

使用这种算法时，table 的水平布局不依赖于 cell 的内容宽度，而依赖于 table 的 width，columns 的
width, borders or cell spacing。   

在 fixed 表格布局算法中，每列的宽度由下决定：   

1. 一个 width 属性不为 auto 的列元素设置了整列的宽度（就是说设置一个单元格的宽度，一整列都有效果）
2. 否则的话，第一个 width 设置了非 auto 属性的行中的单元格决定了整列的宽度。如果单元格横跨
多列，则宽度会被各列分割。
3. 剩下的列会等分剩下水平方向的区域   

最终表格的宽度取决于 table 设置的 width 属性以及各列宽度之和两者中的较大者。如果表格比各列之和
更宽，则多出来的空间应该分配给各列。   

### 5.3 Table height algorithms

表格的高度由 table 或 inline-table 元素的 height 属性决定。如果是 auto，则高度为各行的高度
外加单元格及边框之间的空隙。非 auto 的值会认为设置了表格的最小高度。CSS 2.2 并没有定义当表格
设置的高度多于各行高度之和时，额外的空间应该如何分配。    

当一行中所有的单元格都可用时，table-row 元素盒子的高度会立刻被浏览器计算出来，这个高度是以下几个
值中的最大值：行的计算高度，行中每个单元格的计算高度，每个单元格要求的最小高度。如果table-row
设置了一个非 auto 的 height 值，意味着使用每个单元格要求的最小高度设置行的高度。CSS 2.2 并
没有定义 row groups 上对 height 的使用方法。    

在 CSS 2.2 中，一个单元盒子的高度是其内容决定的最小的高度。单元格设置的 height 会影响 row
的高度，但是并不会增加单元盒子的高度。也就说单元格的高度设置对单元格没有直接影响。   


单元格上的 vertical-align 定义了其在每一行的对齐方式。每个单元格的内容包含有 baseline, top,
middle, bottom，同时每一行也有这些。在表格上下文中，vertical-align 有以下的含义：    

- baseline: 单元格的 baseline 与该行的 baseline 对齐
- top: 单元盒子的顶部与该行的顶部对齐
- bottom: 单元盒子的底部与该行的底部对齐
- middle: 单元格的中心与该行的中心对齐
- sub, super, text-top, text-bottom, &lt;length&gt;, &lt;percentage&gt;:这些值
在单元格上没有影响

单元格的基线是其在流内 in-flow 的第一个行盒 line box 的基线，或者是第一个流内的 table-row，
后一种这个没弄懂。如果不存在这个 line box 或者 table-row，baseline 就是单元盒子的 content
底边缘。    

剩下还有一些对齐的细节部分先跳过。    

## 6. 边框

在对单元格进行边框设置时，有两种不同的模型。即 separate 和 collapse 模型。   

- 属性：border-collapse
- 可选值：collapse, separate, inherit
- 初始值：separate
- 应用元素：table 和 inline-table
- 继承性：是

### 6.1 The separated borders model

- 属性：border-spacing
- 可选值：&lt;length&gt; &lt;length&gt;?, inherit
- 初始值：0
- 应用元素：table, inline-table

该长度指定了两个相邻单元格边框的距离。     

表格的边框与那些和表格边缘相接的单元格的边框之间的距离是表格的 padding 和边框之间空隙距离的和。
表格的宽度是从左边的内 padding 边缘到右边的内 padding 边缘，包括 border spacing，但不包括
padding 和 border。    

然而，在 HTML 中，表格的宽度是从左边框边缘到右边框边缘。在CSS3 中，这种差别可以 box-sizing
定义。    

在这种模型中，每个单元格都有独立的边框。在两个相邻边框的 border-spacing 中，行，列，row group，
column group 的背景都是不可见的，因此会显示表格的背景色。row, column, row groups, column
group 不允许有边框，这就解释了上面 separate 的时候，tbody 边框无效的情况。   

#### 6.1.1 空单元格的边框和背景色 empty-cells 属性

- 属性：empty-cells
- 可选值：show, hide, inherit
- 初始值：show
- 应用元素：table-cell 元素

在 separate 模型下，该属性控制了没有任何可见 content 的单元格的边框及背景的渲染规则。空的单元格
及 visibility: hidden 的单元格被认为是不包含任何可见内容。    

当属性值为 show 时，这些单元格的边框和背景会被正常绘制。    

### 6.2 The collapsing border model

在 collapsing 模型中，可以指定单元格，row, row group, column, column group 中每一个的
任意方向上的边框。   

边框以两个单元格之间的网格线为中心。    

下面的图表展示了表格的宽度，边框的宽度，padding，单元格的宽度是如何相互作用的。他们之间的关系
由下列的等式定义：   

```
row-width = (0.5 * border-width0) + padding-left1 + width1 + padding-right1 +
border-width1 + padding-left2 + .... + padding-rightn + (0.5 * border-widthn);
```     

n 为一行中单元格的数目。   

UA 必须为表格计算初始的左右边框的宽度，计算方式是通过检查表格第一行中的第一个及最后一个单元格。
表格的左边框宽度是第一个单元格 collapsed left border 的一半，同理右边框的宽度是最后一个单元格
右边框的一半。如果后续的行有更大的左右边框，则超出来的部分会划分到 table 的 margin 区域中，也
就说表格的宽度是由第一行决定的，后续的行如果由于边框增大溢出了，也不会增加表格的宽度。    

表格上边框的宽度是通过计算所有上边框和表格上边框有重合的单元格的上边框得出的。上边框的宽度是最大
折叠上边框宽度的一半。表格下边框类似，是最大折叠下边框宽度的一半。   

这种模型下，表格的宽度包含表格边框宽度的一半。    

#### 6.2.1 边框冲突算法

在 collapsing border model 中，每个单元格在每个方向上的边框可能是由许多在这个方向上重合的元素
定义的边框属性指定的，例如 cells, rows, row groups, columns, column groups, table。
经验法则是，在每个边缘选择最“引人注目”的边框样式。   

下面的规则决定了最终采用的边框样式：    

1. border-style:hidden 属性的边框优先于所有其他冲突的边框，这种情况下，这种类型的边框会压制
其他的边框
2. border-style: none 的边框优先级最低。
3. 如果所有边框都不是 hidden，且至少有一个是非 none，则窄的边框会被丢弃以支持宽的边框。如果
边框宽度都相同的话，则样式的顺序是: double, solid, dashed, dotted, ridge, outset,
groove, inset