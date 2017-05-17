# CSS Mulit-Column Layout Module

> https://www.w3.org/TR/css3-multicol/    

## 1. 多列模型(The Mulit-Column Model)  

一个多列元素其 'column-width' 或者 'column-count' 属性是非 'auto' 值，并且因此作为多列布局中的容器元素。  

在传统的CSS盒模型中，元素的内容是排列在对应元素的 content box中的。多列布局引入了一种存在于content box
于 content之间的新的容器类型，叫做列盒(column box)。多列元素的内容是排列在列盒中的。  

多列元素中的列盒是按行排列的。就像单元格一样，一行中的列盒按照内联方向按序排列。 *column width* 是列盒的
宽度。一行中所有的列盒都有同样的列宽与列高。相邻列盒被 *column gap* 分开，并且可能存在 *column rule*。
一行中所有的列间距都是相等的，所有的 column rules 也是相同的。不过 column rules 只出现在相邻两列都有内容
的列间。  

不能对列盒设置属性。例如每个列盒的背景不能单独设置并且列盒也没有padding, margin, borders的概念。  

列盒充当了其内容的包含块。也就是说，列盒的行为与CSS中的块级，单元格，以及行内块盒子的行为类似。不过，列盒
不会为绝对定位元素('fixed' 或者 'absolute')建立包含块。  

多列元素会建立新的块级格式化上下文(BFC)。并且多列元素的第一个子元素的 top margin 不会和多列元素的margin 折叠。  


## 2. 每列的宽度计算

### 2.1 'column-width'

| 属性名     | column-width     |
| :------------- | :------------- |
| 值       | &lt;length&gt; &Iota; auto  |
| 初始值 | auto |
| 应用元素  | 非置换块级元素（除table 元素），单元格，行内快元素  |
| 继承性 | 否 |
| 百分比 | N/A |

**auto** : 表示列宽由其他属性决定（例如 'column-count'，如果其值不是 auto）。  

**&lt;length&gt;** : 设置了列的最佳宽度。实际上的列宽可能会更宽（填充剩余可用空间），或者
更短（只有当剩余可用空间比声明的列宽更小时）。

### 2.2 'column-count'

| 属性名 | column-count |
| :------------- | :------------- |
| 值 | &lt;integer&gt; &Iota; auto  |
| 初始值 | auto
| 应用元素 | 非置换块级元素（除table 元素），单元格，行内快元素
| 继承性 | 否
| 百分比 | N/A

**auto**  

**&lt;integer&gt;** : 设置了最佳数量的列数。如果 'column-width' 和 'column-count' 都是
非auto值，这个值就制定了最大的列的数量。  

### 2.3 'columns'

columns : &lt; 'column-width' &gt; || &lt; 'column-count' &gt;

### 2.4 层叠上下文

所有的列盒都处于同一层叠上下文中。  

## 3. Column gaps and rules

### 3.1 'column-gap'

| 属性名 | column-gap |
| :------------- | :------------- |
| 值 | &lt;length&gt; &Iota; normal  |
| 初始值 | normal
| 应用元素 | 多列元素
| 继承性 | 否
| 百分比 | N/A

'normal' 值取决于浏览器的设置，通常是 '1em'。不能为负值。  

### 3.2 'column-rule'

| 属性名 | column-rule |
| :------------- | :------------- |
| 值 | &lt; 'column-rule-width' &gt; &Iota;&Iota; &lt; 'column-rule-style' &gt; &Iota;&Iota; &lt; 'column-rule-color' &gt; |
| 初始值 | 分别为 medium, none, color
| 应用元素 | 多列元素
| 继承性 | 否
| 百分比 | N/A


## 4. 断列

当内容在多列元素中布局时，用户代理必须设置在何处将内容断开放置在另一列中。  

| 属性名 | break-before &Iota; break-after |
| :------------- | :------------- |
| 值 | auto &Iota; avoid &Iota; column &Iota; avoid-column  |
| 初始值 | auto
| 应用元素 | 块级元素
| 继承性 | 否
| 百分比 | N/A

| 属性名 | break-inside |
| :------------- | :------------- |
| 值 | auto &Iota; avoid &Iota; avoid-column  |
| 初始值 | auto
| 应用元素 | 块级元素
| 继承性 | 否
| 百分比 | N/A

**auto** : 不会强制也不会禁止断列。  

**avoid** : 避免断列。  

**column** :  强制断列。  

**avoid-column** : 避免断列。  

## 5. 跨列 (spanning columns)  

| 属性名 | column-span |
| :------------- | :------------- |
| 值 | none &Iota; all |
| 初始值 | none
| 应用元素 | 块级元素, 除了浮动和绝对定位元素
| 继承性 | 否
| 百分比 | N/A


## 6. Filling columns

有两种策略来填充： 每列可以是平衡的，或者不是。如果是平衡的，用户代理应尽量减少列长度的变化。
否则，列按序填充，一些列可能最终部分填充，或完全没有内容。  

| 属性名 | column-fill |
| :------------- | :------------- |
| 值 | auto &Iota; balance |
| 初始值 | none
| 应用元素 | 多列元素
| 继承性 | 否
| 百分比 | N/A
