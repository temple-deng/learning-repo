# CSS Table Module Level

Working Draft 2017.03.07。    

这个 CSS 模块定义了一个二维的基于网格的布局系统。在表格布局模型中，每个展示的节点被分配
到一系列连续的行与一系列连续的列交叉形成的交集中，这些节点由表格结构生成并根据其内容生成
尺寸大小。   

# 1. Content Model

## 1.1 Table Structure

总结一下，一个表格模型实例包含：    

- 一个 table 根元素，其包含：
  + 零或多个表格行，这些行可以选择性的组成一个行组 row groups
    - 每行可以包含一或多个单元格
  + 可选：一或多列，选择性的组成一个列组 column groups
  + 可选：一或多个表格标题

![表格模型结构](https://www.w3.org/TR/css-tables-3/images/table-structure.png)    

下列的 display 属性值可以将表格的格式化规则应用到任意的元素上：    

- **table（等价于 HTML &lt;table&gt; 元素）**：将元素声明成一个块级的表格，生成一个
矩形的块并参与 BFC 布局
- **inline-table（等价于 HTML &lt;table&gt; 元素）**：将元素声明成一个行内级表格，
生成一个矩形框参加 IFC 布局
- **table-row（等价于 &lt;tr&gt;元素）**
- **table-row-group（&lt;tbody&gt;元素）**
- **table-header-group（&lt;thead&gt;元素）**：与 table-row-group 相同，但是出于布局
的目的，第一个 table-header-group 总是会摆放在所有其他的 row 与 row group 前，如果一个
表格有多个 `display: table-header-group` 的盒子，则只有第一个被当做 header，其他的都被
当做 `display: table-row-group`
- **table-footer-group（&lt;tfoot&gt;）**：类似上面
- **table-column（&lt;col&gt;）**
- **table-column-group（&lt;colgroup&gt;）**
- **table-cell（&lt;td&gt; or &lt;th&gt;）**
- **table-caption**    

### 1.1.1 术语

- **table-wrapper box**: 在 table-root 盒子外层生成的一个匿名盒子，用来计算每个表格标题所占据
的空间
- **table-root box or element**: table 或 inline-table box
- **table-non-root box or element**: 一个 proper table child，或者一个 table-cell box
- **table-row-grouping box or element**: A table-row-group, table-header-group, or
table-footer-group box
- **table-track box or element**: A table-row, or table-column box
- **table-track-grouping box or element**: A table-row-grouping, or table-column-group
box
- **proper table child box or element**: A table-track-grouping, table-track, or
table-caption box
- **proper table-row parent box or element**: A table-root or a table-row-grouping box
- **table-internal box or element**: A table-cell, table-track, or table-track-grouping
box，那这个相当于 table-non-root box 去掉了 table-caption box
- **tabular container**: A table-row or proper table-row parent box

# 2. Layout

## 2.1 核心布局原则

不同于其他块级盒子，table 默认不会填充其包含块。如果 table 的 width 设置为 auto，他们的表现
类似于声明了 `fit-content` 的效果。这与其他的块级盒子不同，他们是类似于声明了 `stretch` 的
效果。    

min-content width of a table 指能够满足其所有列 min-content 宽度及表格不可分割空间宽度的
宽度的和。   

max-content width of a table 指能够满足其所有列 max-content 宽度及表格不可分割空间宽度的
宽度的和。     

如果表格设置的宽度大于其 min-content width，则将使用 Available Width Distrbution 算法
来调整列宽。    

## 2.2 表格布局算法

对一个表格进行布局，浏览器必须使用下面的步骤：    

1. 决定表格所需的行和列的数量，具体步骤在 2.3 节中介绍
2. 如果 row/column 网格至少有一个 slot（这个slot貌似有点那种行与列相交的地方，其实应该就是生成的单元格）:
  - 确保每个单元格 slot 被至少一个 cell 占据，具体步骤在 2.4 节
  - 计算每一个列的最小宽度，具体步骤在 2.8 节
  - 计算表格的宽度，2.9.1 节
  - 将表格的宽度分配给各列，2.9.3
  - 计算表格的高度 2.10.1
  - 将表格的高度分配给各行，2.10.4
3. 否则，如果表格是空的
  - 计算表格宽度，这个值是 CAPMIN 与 table box（包括border和padding）的计算宽度（如果表格
  定义了宽度）中的较大值。
  - 计算表格高度，返回所有的 table-caption 高度与 table box 定义的高度的最终的计算值的和。
4. 为每个 table-caption 和 table-cell 分配位置和尺寸

![table-layout](https://www.w3.org/TR/css-tables-3/images/CSS-Tables-Layout-Merged.svg)    

## 2.3 Dimensioning the row/column grid

对行/列网格进行尺寸标注以及在网格中将单元格放置到这些网格插槽中需要运行网格的 HTML 算法。    

在应用此算法之前，需要将不等同于与其显示类型等效的HTML表格元素的CSS Box 转换为其HTML等效项。    

例如：    

```html
<ul class="table">
  <li><b>One</b><i>1</i></li>
  <li><b>Two</b><i>2</i></li>
  <li><b>Three</b><i>3</i></li>
</ul>
<style>
  ul.table { display: table; }
  ul.table > li { display: table-row; }
  ul.table > li > * { display: table-cell; }
</style>
```    

会生成这样的网格模型：   

```html
<table>
  <tbody>
    <tr>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
    </tr>
  </tbody>
</table>
```    

中间描述了一些轨道合并的算法，省略了。    

最后，为 table-root 元素分配正确的行数和列数，并为每个 table-cell 元素分配其正确的 table-row-start,
table-column-start, table-row-span, table-column-span。    


## 2.4 Missing cells fixup

一旦得出了表格的列数，所有的 table-row-group 就必须进行修改，以便其中的每一行中都能有足够个数
的单元格，以满足表格的列数需要。我们需要不断的将新的匿名的 table-cell 盒子 append 到行的末尾。   

除了这些匿名盒子的显示类型，这些盒子不包含任何指定的或者默认的样式（除了那些本文档中提及到的），
意味着这些盒子的背景色为 transparent, padding 为 0，没有边框。     

## 2.5 Table layout modes

就是那几个用来修改表格布局方式的属性，table-layout, border-collapse, caption-side,
border-collapse。     

当一个 table-root 元素的 table-layout 的计算值为 fixed，并且宽度的声明值为 &lt;length-percentage&gt;,
`min-content`, 或者 `fit-content` 时，我们说这个 table-root 元素使用 **fixed mode**
布局。否则，则称 table-root 为 **auto mode** 布局。    

当一个 table-root 使用了 fixed mode 布局时，table-cells 用来计算宽度的单元格内容会被
忽略，用来计算列尺寸的聚合算法仅考虑位于第一行的 table-cells，因此这种布局仅取决于 table-columns
或者第一行的 cells 显示声明的宽度值。那些具有不定宽度的列，需要在将所有具有指定宽度的列
宽度分配完成后，公平的分摊剩下的空间。   

`border-collapse: collapse` 的表格，相邻单元格的边框会合并，因此每个单元格绘制共享边框
的一半。    

## 2.6 Style overrides

一些 CSS 属性在表格的行为会与正常情况下有一些不同：   

- `position`, `float`, `margin-*`, `top`, `right`, `bottom`, `left` 的计算值最终
是在 table-wrapper box 上生效的。
- table-root, table-wrapper box 上的 `overflow` 属性，如果值既不是 `visible` 也不是
`hidden`，则这个值被忽略，且当做 `visible` 处理
- 除了那些本规范定义的属性，其他的CSS属性均会被 table-column 和 table-columnp-group
盒子忽略。
- table-track 和 table-track-grouping 上的 `position` 属性，如果值是 `relative` 就
忽略。
- table-track, table-track-grouping 上的 `margin`, `padding`, `overflow`, `z-index`
会被忽略
- table-cell 的 margin 被忽略

当表格处在collapsed-borders mode 中：   

- table-root 的 padding 忽略
- table-root 的 border-spacing 忽略
- table-root 和 table-non-root 的 border-radiut 忽略

## 2.7 Border-collaping

当表格处在 collapsed-borders mode 中，table-root 和 table-cell 共享同一个边框时，它们
会尝试统一这个边框，以便使用同样的宽度，颜色和类型。

### 2.7.1 Conflict Resolution Algorithm for Collapsed Borders

对于任意的 table-cell 元素 `elem` 来说：   

- 解决 `border-right` 的冲突：   
  + 首先令 `C` 是为一个 table-cell 元素边框的有序集合，按照其父 cell 的 Row/Column
  属性排序；初始时，令 `C` 仅包含的 `elem` 的 `border-right`
  + 然后将 `elem` 后面的，`border-left` 部分与 `elem` 的 `border-right` 共享的所有的
  cell 的 `border-left` 添加到 `C` 中
  + 重复下面的两个指令，直到没有新的 cell 添加到 `C` 中
    - 对于所有的新添加 cells 中的 rowspan 大于 1 的 cell `Ci`，将 `Ci` 前面的，`border-right`
    与 `Ci` 的 `border-left` 部分冲突的所有 cells 的 `border-right` 添加到 `C` 中
    - 对于所有新添加 cells 中的 rowspan 大于 1 的 cell `Ci`（这里新添加进来的 cells
    应该是专指上一步指令中添加的），将 `Ci` 后面的，`border-left` 与 `Ci` 的 `border-right`
    有部分冲突的 cell 添加到C中（那这样其实是相当于把一根竖线上的所有由交集的边框添加进来）
  + 协调 C 中的冲突边框
- 解决 `border-bottom` 的冲突：   
  + 首先令 `C` 是为一个 table-cell 元素边框的有序集合，按照其父 cell 的 Row/Column
  属性排序；初始时，令 `C` 仅包含的 `elem` 的 `border-bottom`
  + 然后将 `elem` 后面的，`border-top` 部分与 `elem` 的 `border-bottom` 共享的所有的
  cell 的 `border-top` 添加到 `C` 中
  + 重复下面的两个指令，直到没有新的 cell 添加到 `C` 中
    - 对于所有的新添加 cells 中的 colspan 大于 1 的 cell `Ci`，将 `Ci` 前面的，`border-bottom`
    与 `Ci` 的 `border-top` 部分冲突的所有 cells 的 `border-bottom` 添加到 `C` 中
    - 对于所有新添加 cells 中的 colspan 大于 1 的 cell `Ci`（这里新添加进来的 cells
    应该是专指上一步指令中添加的），将 `Ci` 后面的，`border-bottom` 与 `Ci` 的 `border-top`
    有部分冲突的 cell 添加到C中（那这样其实是相当于把一根竖线上的所有由交集的边框添加进来）
  + 协调 C 中的冲突边框
- 将所有边框的使用值除以2     

之后，对于 table-root 元素：    

- 协调 table-root 的 `border-{top,bottom,left,right}` 与对应的所有形成了该边的 cells
的边框。    

如果 table 和 cells 的 border-style 有一样的特异性，
保留 cell 的。一旦做完这一步，令 table-root的 `border-{...}` 宽度为这一边在协调过程中
找到的最大的宽度的一半，令 border-style为 solid，颜色为 transparent。    

### 2.7.2 Harmonization Algorithm for Collapsed Borders

对于本算法来说，consider 一个边框的属性意味着：如果其属性是比 `CurrentlyWinningBorderProperties`
更精确的，则令 `CurrentlyWinningBorderProperties` 为这个边框属性。   

给定一个边框的有序集合（`BC1, BC2, ...` 位于 `C1, C2, ...`），执行下面的算法来决定这些
冲突的边框的属性的使用值：    

- 令 `CurrentlyWinningBorderProperties` 为 `border: 0px none transparent`
- 对于每个边框 `BCi`，consider `BCi` 的边框属性
- 如果边框分隔了两个列：
  + 对于每个边框 `BCi`：Find the table-column element in which the Ci cell is located, if any. If the BCi border is such that there is a border of the table-column element that would be drawn contiguously to it, consider its border’s properties.
  + For each border BCi: Find the table-column-group element in which the Ci cell is located, if any. If the BCi border is such that there is a border of the table-column-group element that would be drawn contiguously to it, consider its border’s properties.
- 如果边框分隔了两个行：
  + For each border BCi: Find the table-row element in which the Ci cell is located, if any. If the BCi border is such that there is a border of the table-row element that would be drawn contiguously to it, consider its border’s properties.
  + For each border BCi: Find the table-row-group element in which the Ci cell is located, if any. If the BCi border is such that there is a border of the table-row-group element that would be drawn contiguously to it, consider its border’s properties.
- 返回 CurrentlyWinningBorderProperties    

### 2.7.3 Specificity of a border style

给定两个 border style，我们说 border style 具有最 specificity，如果 style 是：   

1. border-style 为 `hidden`
2. 有最大的 border-width
3. border-style 最先出现在这个列表中：double, solid, dashed, dotted, ridge, outset,
groove, inset, none

## 2.8 Computing table measures

### 2.8.1 Computing Undistributable Space

undistributable space 是指两个连续的 table-cell（或者 table-root 和 table-cell）边框
之间距离的和。   

如果设置 border-spacing 属性的话，两个边框之间的距离就是这个属性的值。    

table-root 和 table-cell 的边框之间的距离是表格的 padding 外加 border spacing 距离。   

### 2.8.2 Computing Cell Measures

下列的术语都有表格或者表格单元格的参数。这些参数封装了不同 border-collapse 表格之间的
不同之处，以便本规范剩余的部分没必要以不同的方式引用它们。   

**cell intrinsic（内在） offsets**     

单元格的内在偏移是一个用来捕获与表格单元格内在宽度计算相关的表格单元格的 padding 和 border
部分的术语。它是一个包含了 border-left-width, padding-left, padding-right, border-right-width
计算值的集合，这些值是这样定义：   

- 在 separate 模式中：padding 的水平计算值和边框
- 在 collapsed 模式中：padding 的水平计算值，对于边框来说，是单元格的 border-width 
使用值（获胜 border-width 的一半）    

**table intrinsic offsets**    

表格的内部偏移是用来捕获与表格内部宽度计算相关的表格的padding 与 border部分的术语。类似
上面：   

- 在 separate 模式中：table root 的水平 padding 计算值和边框
- 在 collapsed 模式中：是单元格 border-width 的使用值（获胜 border-width 的一半）

