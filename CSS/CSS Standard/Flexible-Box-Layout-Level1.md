# CSS Flexible Box Layout Module Level 1  (2016-5-26 CR)

## 1. Introcduction  

CSS 2.1 定义了4种布局模式——根据与其兄弟及组合盒子的关系来确定盒子位置和尺寸的算法：   

+ 块级布局，为文档布局设计的
+ 内联布局，为文本布局设计的
+ 表格布局，为表格格式的 2D 数据布局设计
+ 绝对定位的布局，为明确定义位置，不关心文档中其他元素的位置的布局设计的   

这个模块介绍了一种新的布局模式，flex layout，为更负责的的布局设计的。    

### 1.2 Module interactions   

这个模块扩展了 `display` 属性的定义，添加了新的块级和内联级 display 类型，并且定义了一种
新的格式化上下文类型。这个模块中定义的所有属性都不能应用在 `::first-letter` or `::first-line`
伪元素上。    


## 2. Flex Layout Box Model and Tecminology   

一个 **flex 容器** 是一个 `display` 计算属性为 `flex` or `inline-flex` 的元素生成的盒子。
flex 容器的流内(in-flow)的子元素被叫做 flex items，并且使用 flex 布局模型进行布局。    

不同于块及内联布局的布局是基于 block and inline flow directions，flex 布局是基于 flex
directions。这一部分定义了一系列 flex 与流相关的术语。`flex-flow` 值和书写模式决定了这些术语
是如何与物理方向(top/right/bottom/left)，轴的方向(vertical/horizontal)和尺寸(width/height)
对应的。   

![](https://github.com/temple-deng/learning-repo/blob/master/pics/flex-direction-terms.svg)    

**main axis, main dimension**   
主轴是 flex 容器布局 items 主要的轴。它会在主方向上延伸。    

**main-start, main-end**    
items 从容器的 main-start 开始朝着 main-end 方向放置。   

**main size, main size property**   
一个 item 在主方向上的宽或高就是项目的 main size。item 的 main size property 就是指在
主方向的 `width` or `height` 属性。   

**cross axix, cross dimension**   
与主轴垂直的轴就是侧轴。它会侧轴方向延伸。   

**cross-start, cross-end**    
Flex lines are filled with items and placed into the container starting on the cross-start side of the flex container and going toward the cross-end side.    

**cross size, cross size property**   
项目在侧轴方向上的宽或高就是项目的 cross size。cross size property 指的是侧轴方向上
`width` or `height` 属性。    

## 3. Flex Containers: the 'flex' and 'inline-flex' display values   

**'flex'**：这个值会让一个元素生成一个块级 flex 容器盒。   

**'inline-flex'**：这个值会让一个元素生成一个内联级 flex 容器盒。   

一个 flex 容器为其内容建立了新的 flex formatting context。类似于建立 BFC，不过其使用的是 flex
布局而不是块级布局。例如，容器内部不包含浮动，并且容器的 margin 不会和其内容 margin 重叠。
容器会像普通的块容器一样为其内容形成包含块。    

flex 容器不会块容器，所以一些针对块布局设计的属性可能不会在 flex 布局中适用。特别是：   

+ flex 容器的 'column-\*' 属性不会生效
+ flex item 的 'float' and 'clear' 会创建浮动挥着清除浮动，也不会在流外（这里和上面的流都是指
之前文档中定义的流）    
+ flex item 的 'vertical-align' 没有效果
+ 容器的 '::first-line' and '::first-letter' 不能应用，并且 flex 容器应该也不能作为
其祖先元素的这样的伪元素。     

## 4. Flex Items  

每个 flex 容器内的流中的子节点会变成一个 flex item，容器内每段连续的文本会直接包裹在一个
匿名的 flex item 中。然后，如果一个匿名的 item 只包含空白的话，这个 item 不会被渲染。   

一个 flex item 会为其内容建立新的格式化上下文。上下文的类型是由其 `display` 属性决定的，和
往常一样。然而，flex items 自身都是 flex-level 盒子，而不是块级盒子。   

### 4.1 Absolutely-Positioned Flex Children

由于绝对定位的子节点是在流外的，所有这样的子节点是不参与 flex 布局的。      

flex 容器的绝对定位子元素的静态位置是这样得出的：首先假设这个定位的子节点是容器中唯一的 flex
item，之后假设子节点和 flex 容器都是其使用的固定大小的盒子尺寸。出于这种目的，`align-self: auto`
与值为 `start` 的效果相同。     

换句话说，flex 容器的一个绝对定位子节点的静态位置的矩形就是容器的内容盒子，其中静态位置矩形
是用于确定绝对定位盒子的静态位置偏移的对齐容器。    

其实这部分内容不是很懂。     

### 4.2 Flex Item Margins and Paddings

相邻的 flex items 的 margin 不会重叠。   

flex item 上的百分比 margin 和 padding 是根据下面的方式之一解析：   

+ 其自身的轴方向（left/right 百分比根据宽度解析，top/bottom 根据高度）或者
+ 内联轴方向（left/right/top/bottom 都根据宽度解析）   

一个用户代理必须从这两种行为中选一个。chrome 下好像是根据内联轴方向计算，即4个方向都根据
容器的宽度计算，FF 好像是根据自身轴方向。    

基于这种浏览器间的不一致，开发者应该避免在 item 上使用百分比的 margin 或 padding。    

margin 为 auto 的时候会延伸对应方向上可用的额外空间。可以用来对齐。（而且 `margin:auto` 可以
实现水平垂直居中呢）     

### 4.3 Flex Item Z-Ordering

flex item 在层叠顺序上与行内块元素一致，除了 `order` 会修改元素在原文档中的属性，以及 `z-index`
除了 `auto` 以外的值都会创建一个层叠上下文，即使其位置属性 `position` 为 `static`。    

*Note*: 定位到 flex item 之外的后代定位元素仍会参与这个 flex item 建立的层叠上下文。   

### 4.4 Collapsed Items  

在一个 flex item 上声明 `visibility:collapse` 会让这个 item 成为一个 **collapsed flex item**，
具体的效果就是：折叠的 item 会从渲染中整个移除，但会留下一个 "strut" 来保持 flex line 的
侧轴尺寸稳定。因此，如果一个 flex 容器只有一个 flex line，动态折叠或者不折叠 items 会改变容器
的主轴尺寸，但会确保在侧轴尺寸上没影响。flex line wrapping 会在折叠后重新实现，然而，容器
盒带有多条线的侧轴尺寸可能会变也可能不会变。    

虽然折叠的 item 不会被渲染，但还是会出现在格式化结构中。（其实和 `visibility:hidden` 效果
类似吧，虽然不渲染，但还是在原位置占据着地方）    

### 4.5 Implied Minimum Size of Flex Items

为了为 flex items 提供更合理的默认最小尺寸，这份规范为 `min-width` 和 `min-height` 引入
了新的初始值 `auto`。    

| 属性名 | `min-width`, `min-height` |
| :------------- | :------------- |
| 新的值 | auto |
| 新的初始值 | auto |

**auto**    
在一个主轴方向 `overflow` 为 `visible` 的 flex item 上，指定 item 在主轴方向上的最小尺寸
为自动最小尺寸。否则就是 `0`。      

通常来说，自动的最小尺寸是比其 content 尺寸及其 specified 尺寸更小的。不过，如果盒子有长宽比
但是没有 specified 尺寸，那么自动的最小尺寸就是比其 cotent 尺寸及 transferred 尺寸更小。   

这里计算所用的 content 尺寸，specified 尺寸及 transferred 尺寸是用来解释相关的 min/max/preferred
尺寸属性，以便自动的最小尺寸不会和开发者提供的约束条件冲突，他们是按照如下定义的：    

**specified size**   
如果 item 的主轴尺寸计算值是一个准确值，那么这个尺寸就是 specified size。否则就是未定义的。     

**transferred size**   
如果 item 有内部的长宽比，并且其侧轴尺寸计算值为一个准确值，那么这个尺寸通过长宽比转换后得出
的尺寸就是 transferred size。否则就是未定义的。   

**content size**   
content size 是主轴方向的 min-content size（这个应该是 `width` 属性的新的值，以后有时间再说）    

## 5. Ordering and Orientation

flex 容器中的内容可以以任意的方向和任意的顺序来布局。这个功能是通过 `flex-direction`,
`flex-wrap` 和 `order` 属性实现的。    

### 5.1 Flex Flow Direction: the 'flex-direction' property

| 属性名 | `flex-direction` |
| :------------- | :------------- |
| 值 | row &#124; row-reverse &#124; column &#124; column-reverse |
| 初始值 | row |
| 应用 | flex 容器 |
| 继承性 | 否 |

`flex-direction` 属性通过设置容器的主轴，规定了 items 是如何在容器中放置的。   

**'row'**    
flex 容器的主轴方向与当前写作模式的内联轴方向相同（应该就是与写作方向相同）    

**'column'**    
容器的主轴与当前写作的块轴方向相同。     

### 5.2 Flex Line Wrapping: the flex-wrap property

| 属性名 | `flex-wrap` |
| :------------- | :------------- |
| 值 | nowrap &#124; wrap &#124; wrap-reverse |
| 初始值 | nowrap |
| 应用 | flex 容器 |
| 继承性 | 否 |   

`flex-wrap` 属性控制了 flex 容器是单线 single-line 的还是多线 multi-line 的，以及会决定
新的线堆叠方向的侧轴的方向。    

**'nowrap'** 容器是单线的。   

**'wrap'** 容器时多线的。   

**'wrap-reverse'** 与 'wrap' 相同，不过 cross-start 与 cross-end 是相反的。   

### 5.3 Flex Direction and Wrap: the 'flex-flow' shorthand  

| 属性名 | `flex-flow` |
| :------------- | :------------- |
| 值 | &lt;flex-direction&gt;&#124;&#124;&lt;flex-wrap&gt; |
| 初始值 | row nowrap |
| 应用 | flex 容器 |
| 继承性 | 否|   

### 5.4 Display Order: the 'order' property

默认情况下，flex items 时按照其在原文档中出现的顺序展示和布局的。`order` 属性用来修改这个顺序。   

| 属性名 | `order` |
| :------------- | :------------- |
| 值 | &lt;integer&gt; |
| 初始值 | 0 |
| 应用 | flex items及 flex 容器绝对定位的子节点 |
| 继承性 | 否|  

`order` 属性通过将 flex 容器中的子节点安排到有序的分组中，控制其在容器中出现的顺序。   

flex 容器按照修改过的顺序来布局其内容，从序号最小的分组开始排列。相同分组序号的 item 按照
其在原文档中的顺序排列。   

## 6. Flex Lines   

flex 容器中的 items 都是相对于 flex lines 进行布局和对齐的，即在布局算法中用来分组和对齐的
假想的容器。一个 flex 容器可以是单行的，也可以是多行的，这取决于 `flex-wrap` 属性：   

+ 一个单行的 flex 容器会将所有子节点在一条线上布局，即使可能出现溢出的现象。
+ 一个多行的 flex 容器可能会将所有的 items 分在多行中。当产生了额外的行时，items 会根据
`flex-wrap` 属性来在侧轴方向上堆叠。每行至少包含一个 item。    

一旦内容分布在多行中的话，每行在布局时就是相互独立的了。     

在一个多行的 flex 容器中，每行的侧轴尺寸都是足够包含行内的 items （在使用 `align-self` 对齐后）
的最小尺寸，这些行在容器内是通过 `align-content` 属性对齐的。在单行的容器中，行的侧轴尺寸就是
容器的侧轴尺寸，`align-content` 也会没有效果。    

## 7. Flexibility   

### 7.1 The 'flex' Shorthand

| 属性名 | `flex` |
| :------------- | :------------- |
| 值 | none &#124; [&lt;'flex-grow'&gt; &lt;'flex-shrink'&gt;?|| &lt;'flex-basis'&gt;] |
| 初始值 | 0 1 auto |
| 应用 | flex items |
| 继承性 | 否 |

`flex` 属性指定了一个 flexible length 弹性长度的组件：扩展因子、收缩因子及基础尺寸。当一个
盒子是 item 时，会根据 `flex` 属性而不是主轴尺寸属性来确定盒子在主轴的尺寸。     

**&lt;'flex-grow'&gt;**   
这个组件指定了弹性扩展因子，这个因子会决定当容器中存在正数的可用空间时，item 相对于其他 items
扩展多少。当省略时为 `1`。    

**&lt;'flex-shrink'&gt;**   
这个组件指定了弹性收缩因子，这个因子会决定当容器中有负数的可用空间时，item 相对于其他 items
是要收缩多少。省略时设为 `1`。   

**&lt;'flex-basis'&gt;**   
这个组件指定了弹性基础尺寸，即item 在根据弹性因子分配可用空间前的初始主轴尺寸。   

&lt;'flex-basis'&gt; 接受与 `width` 和 `height` 相同的属性值（除了 `auto` 值处理时有区别），
并且还加了 `content` 关键字：   

+ `auto`：这个关键字表示 item 的主轴尺寸属性值会用来做 `flex-basis` 的值。如果这个主轴尺寸属性值
本身就是 `auto`，那么这个 `flex-basis` 最终的使用值是 `content`。  
+ `content`：这个关键字 item 根据内容大小自动确定尺寸。
+ `<'width'>`：对于所有其他的值，`flex-basis` 的最终值的处理方式与 `width` 和 `height` 相同。   

当在 `flex` 缩写中省略这个值时，指定值为0。     

**'none'** 这个关键字会扩展为 `0 0 auto`。     

`flex` 组件的初始值等价于 `flex: 0 1 auto`。    

#### 7.1.1 Basic Values of 'flex'   

下面的列表中列举了4种常见的通用效果的 `flex` 属性值：    

+ `flex:initial`：等价于 `flex:0 1 auto`。item 的尺寸是基于其 `width/height` 属性的。
+ `flex:auto`：等价于`flex:1 1 auto`。item 的尺寸基于其 `width/height` 属性，但是完全弹性的。
+ `flex:none` 等价于 `flex:0 0 auto`。   
+ `flex:<positive-number>`：等价于 `flex: <positive-number> 1 0`。    

### 7.2 Components of Flexibility   

#### 7.2.1 The 'flex-grow' 属性

| 属性名 | `flex-grow` |
| :------------- | :------------- |
| 值 | &lt;number&gt; |
| 初始值 | 0 |
| 应用| flex items |   

负值是无效的。   

#### 7.2.2 The 'flex-shrink' 属性

| 属性名 | `flex-grow` |
| :------------- | :------------- |
| 值 | &lt;number&gt; |
| 初始值 | 1 |
| 应用| flex items |   

负值无效。   

#### 7.2.3 The 'flex-basis' 属性

| 属性名 | `flex-basis` |
| :------------- | :------------- |
| 值 | content &#124; &lt;width&gt; |
| 初始值 | auto |
| 应用| flex items |   
| 百分比 | 相对于容器的内部的主轴尺寸（应该是 content edge） |

## 8. Alignment
