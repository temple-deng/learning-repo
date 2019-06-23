# CSS Table Module Level 3(2017.3.7)

# 1. Content Model

## 1.1 Table Structure

总结一下，一个表格模型实例包含：    

- 一个 table 根元素，其包含：
  + 零或多个表格行，这些行可以选择性的组成一个行组 row groups
    - 每行可以包含一或多个单元格
  + 可选：一或多列，选择性的组成一个列组 column groups
  + 可选：一或多个表格标题

![表格模型结构](https://www.w3.org/TR/css-tables-3/images/table-structure.png)

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

