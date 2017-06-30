# CSS2.2 Table  

## 介绍

table 布局的话有两种算法；一种是固定布局 fixed，一种是自动布局的算法。   

table 中 rows, columns, row groups, column groups 以及单元格 cells 都可以绘制包裹他们的
边框。在对齐数据方面，即可以单独指定 cell 的对齐方式，也可以指定一列或者一行的所有 cells 的
对齐方式。   

## CSS table model

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

## Columns

下面的属性可以应用在 column 及 column-group 元素上：   

+ **border**: 只有当 table 元素上设置了 `border-collapse: collapse` 时 column 上的边框
才会生效。  
+ **background**: 为 column 中的 cells 设置背景，不过只会在 cell 及 row 都是透明的背景时才设置。  
+ **width**: 列的最小宽度
+ **visibility**: 如果这个属性设为 'collapse'，列中的 cells 不会渲染


## Tables in the visual formatting model

table 会生成一个叫做 table wrapper box 主要的块容器盒来包含 table box 自身及 caption boxs。
table box 是一个包含 table 内部盒子（应该是内部各种 cell, row）的块级盒子。caption box 是放在 table
box 的上方还是下方由 'caption-side' 属性决定。   

table wrapper box 建立了新的 BFC，table box 建立了 TFC(table formatting context)。table box(inline-table)
会用来做基线对齐等操作。   

这里需要分清一些属性到底是使用在 table wrapper box 上还是 table box 上：table 元素上的
'position', 'float', 'margin-\*', 'top', 'right', 'bottom', 'left' 的计算值属性是使用在
table wrapper box 上，其他非继承属性是使用在 table box 上。   

### Caption position and alignment

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

## Visual layout of table contents  

内部的 table 元素会生成矩形框参加 TFC。这些盒子有 content, border, 并且 cells 可以有 padding。但是都没 margin。  

这些盒子的布局受一个 row 和 column 的矩形不规则网格控制。每个盒子占据的网格 cells 由下面的规则决定：   

1. 每个 row box 占据一个 row of grid cells（占据一行的网格？）
2. 一个 row group 会占据和其包含 row 相等数量的 grid cells
3. 一个 column box 会占据一或多个 columns of grid cells（哈？怎么可以占据多个）
4. 一个 column group box 同样会占据其包含 column 相等的 grid cells
5. cells 可能会延伸到多行或多列。

### Table layers and transparency

为了去确定每个 cell 的背景，不同的表格元素可以被认为是在六个叠加层上。   

![cell background](https://www.w3.org/TR/CSS22/images/tbl-layers.png)    

### Fixed table layout

使用这种算法时，table 的水平布局不依赖于 cell 的内容，只依赖于 table 的 width，columns 的
width, borders or cell spacing。   

在 fixed 表格布局算法中，每列的宽度由下决定：   

1. 一个 width 属性不为 auto 的列元素设置了整列的宽度（就是说设置一个单元格的宽度，一整列都有效果）
2. 否则的话，第一行中 width 不为 auto 单元格决定了整列的宽度，如果这个单元格跨了多列，the width is divided over the columns
3. 剩下的列会等分剩下水平方向的区域   
