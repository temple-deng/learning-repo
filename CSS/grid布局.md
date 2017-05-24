# Grid

## 布局基本

一个网格容器为其 content 建立一个新的 grid formatting context，与BFC类似，不过其子元素
的浮动不会侵入网格容器，并且容器的 margin 也不和其内容的 margin 折叠。  

网格布局有以下的规则：  

+ column-* 属性在容器上无效果。

+ float 和 clear 在网格项目 item 上无效果，但是 float 属性仍会影响项目的 display 属性的
计算，就好像是在成为 item 前就计算好的一样。  

+ vertical-align 对 item 无效

+ 容器盒 ::first-line 和 ::first-letter 伪元素不适用。

## 网格轨道最小和最大尺寸

可以通过 `minmax()` 函数来创建网格轨道的最小或最大尺寸。  

```css
grid-template-rows: minmax(100px, atuo);
grid-template-columns: minmax(auto, 50%) 1fr 3em;
```  

`minmax()`函数接受两个参数：第一个参数定义网格轨道的最小值，第二个参数定义网格轨道的最大值。可以接受任何长度值，也接受auto值。auto值允许网格轨道基于内容的尺寸拉伸或挤压。  

## 重复网格轨道

使用`repeat()``可以创建重复的网格轨道。这个适用于创建相等尺寸的网格项目和多个网格项目。  

```css
grid-template-rows: repeat(4, 100px);
grid-template-columns: repeat(3, 1fr);    
```  

`repeat()`也接受两个参数：第一个参数定义网格轨道应该重复的次数，第二个参数定义每个轨道的尺寸。  

##　间距

`grid-column-gap`和`grid-row-gap`属性用来创建列与列，行与行之间的间距。只能创建列与列或行与行之间的间距，但不能创建列和行与网格容器边缘的间距。     

`grid-gap` 是 `grid-row-gap` 和 `grid-column-gap` 的缩写，如果指定一个值，那么表示两个值相等。  

```css
grid-row-gap: 20px;
grid-column-gap: 5rem;
```    
