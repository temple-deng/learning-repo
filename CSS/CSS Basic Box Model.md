# CSS Basic Box Model

---

### margin

<table>
  <tr>
    <td>名字</td>
    <td>*margin-top, margin-bottom, margin-left, margin-top*</td>
  </tr>
  <tr>
    <td>值</td>
    <td>`<margin-width>`| inherit</td>
  </tr>
  <tr>
    <td>初始值</td>
    <td>0</td>
  </tr>
  <tr>
    <td>应用的元素</td>
    <td>
      所有元素，除了display为table类型的元素，但不包括 table-caption, table, inline-table
    </td>
  </tr>
  <tr>
    <td>可继承否</td>
    <td>不能</td>
  </tr>
  <tr>
    <td>百分比</td>
    <td>参考包含块的宽度</td>
  </tr>
</table>

垂直的margin属性不是不能应用在非替换内联元素上，而是垂直方向无效。

只有在下面的情况下，两个margin才是相邻的：  

+ 同一BFC中的流内的块级盒子。
+ 没有 line boxes，没有 clearance, 没有内填充和边框来分离开margin（Note that certain zero-height line boxes (see 9.4.2) are ignored for this purpose.）
+ 都是属于垂直相邻的盒子边缘，例如满足下面的任一场景：
  + 盒子的top margin 和第一个流内子盒子的 top margin
  + 盒子的 bottom margin 和下一个流内的兄弟盒子的 top margin
  + 最后一个流内子盒子的 bottom margin 和其父盒子的 bottom margin, 并且父盒子有 'auto'的计算高度
  + 没有建立一个的的BFC的盒子的 top 和 bottom margin, 并且盒子的 'min-height' 计算值为0， 'height'的计算值为0或'auto'，并且没有流内子盒子。



### padding

<table>
    <tr>
      <td>名字</td>
      <td>*padding-top, padding-bottom, padding-left, padding-top*</td>
    </tr>
    <tr>
      <td>值</td>
      <td>`<padding-width>`| inherit</td>
    </tr>
    <tr>
      <td>初始值</td>
      <td>0</td>
    </tr>
    <tr>
      <td>应用的元素</td>
      <td>
        所有元素，除了 table-row-group, table-header-group, table-footer-group, table-row, tbale-column-group, table-column
      </td>
    </tr>
    <tr>
      <td>可继承否</td>
      <td>不能</td>
    </tr>
    <tr>
      <td>百分比</td>
      <td>参考包含块的宽度</td>
    </tr>
</table>


padding不能取 `auto`.

`margin-left, margin-right, width, left, right, padding-left, padding-right` 的百分比都是按照包含块的宽度计算的。

`margin, padding` 初始值都是0， `left, bottom, right, top, width, height` 初始值都是 auto.
