## 1. 介绍

形状模块定义可以当做 CSS 值使用的任意的集合形状。这份说明定义了用来控制一个元素的浮动区域几何形状的属性。 'shape-outside' 属性用来对一个浮动元素使用形状值来定义其浮动区域。

### 1.4 术语

*Wrap*  

术语包裹 'wrap' 表示浮动区域周边的排列的内容的引用。内容‘包裹’在左浮动盒子的右边，或者内容‘包裹’在右浮动盒子的左边。这种包裹性的一个结果就是紧挨着浮动盒子的行盒可能会有必要缩短宽度来
避免和浮动区域重叠。  

*Float area*  

浮动元素周围包裹内容占据的区域。默认情况下，浮动区域是浮动元素的 margin box。这份声明中的 'shape-outside' 属性就是用来定义一个任意形状的，非矩形的浮动区域。  


## 2. 盒模型和浮动行为之间的关系

虽然可以用形状来定义浮动元素外部内联内容的边界，但是盒模型是不会变化的。如果元素定义了 margins,borders 或者 padding，它们就会根据盒模型来计算和渲染。同时，浮动
的定位和层叠是不会受定义的浮动区域影响的。  

当将浮动区域定义成一个形状，这个形状是根据浮动元素的 margin box 剪裁的。换句话说，形状只能缩小浮动区域，而不能增加。一个缩小了的浮动区域也可能对一些只能浮动影响的行盒没有效果。
一个空的浮动区域对行盒没有任何效果。  

一个形状定义的浮动区域可能在各个面上缩减浮动区域的大小，但是不会允许包裹的文本出现在浮动元素的两端。  


## 3. 基础的形状

`<basic-shape>` 类型可以使用基础的形状函数声明。当使用这种语法定义形状时，引用的盒子由 `<basic-shape>`的每个属性值定义。
形状使用的坐标系统是其自身的左上角为原点，向右x轴增加，向下y轴增加。所有用百分比表示的长度都是根据引用盒子的尺寸计算的。  

### 3.1 支持的形状

支持下列的形状。  

*inset() = inset(&lt;shape-arg&gt;{1,4} [round &lt;'border-radius'&gt;]?)*  

  定义一个内嵌的矩形。  

  + 提供的前4个参数代表了内部矩形的边缘部分与引用盒子 **top,right,bottom,left** 的偏移。这些参数遵从与 'margin' 缩写一样的语法。  
  + 可选的 &lt;'border-radius'&gt;参数定义了内部矩形区域的圆角部分，使用的是 'border-radius' 缩写的语法定义。  


*circle() = circle( [&lt;shape-radius&gt;]? [at &lt;position&gt;]?)*  

  + shape-radius参数代表了圆形的半径r。不支持负值。
  + position 参数定义了圆心的位置。省略的话默认就是中心。  

*ellipse() = ellipse([&lt;shape-radius&gt;{2}]? [at &lt;position&gt;]?)*  

  + shape-radius 参数指定了椭圆x和y轴的半径 rx,ry。不支持负值。rx的百分比值根据引用盒的宽度计算，ry的百分比根据高度计算。  
  + position 参数定义了圆心的位置。省略的话默认就是中心。

*polygon() = polygon([&lt;fill-rule&gt;,]? [&lt;shape-arg&gt;&lt;shape-arg&gt;])*  

  + &lt;fill-rule&gt; 用于确定多边形内部的填充规则


## 5. Shapes from Box Values

可以通过参考CSS盒模型中的边缘来定义形状。这些边缘包括使用圆角值来定义的圆角弯曲。&lt;shape-box&gt;值扩展了 &lt;box&gt;值，包含 'margin-box'。
其语法是：  

&lt;shape-box&gt; = &lt;box&gt; | 'margin-box'  

**margin-box** 定义由 margin 边缘包围的形状。形状的圆角是由对应的 border-radius 和 margin 值决定的。如果 border-radius/margin 值大于等于1，margin-box 的圆角为 border-radius + margin
。如果比例小于1，margin-box 的圆角是 border-radius + (margin * (1 + (ratio-1)^3))。  

**border-box** 定义由 border 边缘包围的形状。  

**padding-box** 定义由 padding 边缘包围的形状。  

**content-box** 定义由 content 边缘包围的形状。  



## 6. 定义形状

形状是通过 'shape-outside' 属性定义的，可能通过 'shape-margin' 属性修饰。这两个属性改变了浮动元素的浮动区域。  

### 6.1 浮动区域形状： 'shape-outside'

<table>
  <tr>
    <td>属性名</td>
    <td>shape-outside</td>
  </tr>
  <tr>
    <td>属性值</td>
    <td>none | [ &lt;basic-shape&gt; || &lt;shape-box&gt;] | &lt;image&gt;</td>
  </tr>
  <tr>
    <td>初始值</td>
    <td>none</td>
  </tr>
  <tr>
    <td>适用元素</td>
    <td>浮动元素</td>
  </tr>
  <tr>
    <td>是否可继承</td>
    <td>否</td>
  </tr>
</table>

如果定义 `<basic-shape>` 的同时也指定了 `<shape-box>`，那么这个属性就定义了基础形状函数的引用盒。如果没提供默认是 'margin-box'。  

### 6.3 'shape-margin'

这个属性为 'shape-outside' 添加了 margin。
