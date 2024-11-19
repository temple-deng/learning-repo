# Masking and Cliping

## 1. 介绍

这份规范定义了两种不同的图形操作用来完全或者部分隐藏对象。  

### 1.1 剪裁 Cliping

一个闭合的矢量路径、形状或者多边形定义了所谓的剪切路径。剪切路径定义了一个区域，这个区域内部的所有东西都被允许展示出来，但是区域外部的东西都被“剪裁出去”并且不会在画布上显示了。  

'clip-path' 属性可以用来指定一个基础的形状作为剪裁轮径或者应用一个包含图形元素的 `<clipPath>` 元素作为剪裁路径。  


### 1.2 遮罩 Masking

对一个图形对象应用遮罩的效果是好像图形对象将通过一个蒙版绘制在背景上，因此可以将图形对象完全或者部分地遮蔽住。  

使用 'mask-image' 或者 'mask-border-source' 属性来应用遮罩。  

'mask-image' 属性可以引用一个 `<mask>` 元素。这个元素的内容用来作遮罩。  

或者，对于大多数简单的使用， 'mask-image' 属性可以直接引用图片作为遮罩，放弃使用一个 `<mask>` 元素。这个蒙版可以通过使用 'mask-position', 'mask-size' 和其他属性来像使用CSS背景图一样定位和指定大小。  

'mask-border-source' 属性将蒙版分割成9部分。每一部分可以通过剪切，缩放或者拉伸等方式来适应 mask border image area 的尺寸。'mask-border'
属性是 'mask-border-source' 和其他属性的缩写形式。  

'mask' 属性是所有 'mask-border' 和 'mask-image' 等属性的缩写形式。  


## 4. 术语

这份规范中对于CSS属性和值的定义是与CSS背景与边框规范定义类似的。为了避免重复，这份规范依赖背景与边框规范中的定义与描述。这个规范中下面的术语与背景与边框中术语有类似的意义：

<table>
  <tr>
    <th>CSS 遮罩中的术语</th>
    <th>背景与边框中的术语</th>
  </tr>
  <tr>
    <td>mask layer image</td>
    <td>background images</td>
  </tr>
  <tr>
    <td>mask painting area</td>
    <td>background painting area</td>
  </tr>
  <tr>
    <td>mask-size</td>
    <td>background-size</td>
  </tr>
  <tr>
    <td>mask-position</td>
    <td>background-position</td>
  </tr>
  <tr>
    <td>mask position area</td>
    <td>background positioning area</td>
  </tr>
  <tr>
    <td>mask border image</td>
    <td>border-image</td>
  </tr>
  <tr>
    <td>mask border image area</td>
    <td>border image area</td>
  </tr>
</table>


## 5. Clipping paths

裁剪路径限制了可以应用绘制的区域，即裁剪区域(clipping region)。从概念上说，这个区域外的任何部分都不该再绘制出来。包括任何的内容，背景，边框，文本装饰，轮廓(outline)和元素可视的滚动机制，以及他们的子孙元素。  

一个元素的祖先元素也可能将他们自身的内容剪裁了部分（例如通过他们自身的 'clip' 或者 'clip-path' 属性或者他们的 'overflow' 属性不是 'visible'）。这会导致渲染是累积交叉的。  

如果一个裁剪区域超出了用户代理文档窗口的边界，其内容应该被窗口进行剪裁。  

剪裁路径影响了元素的渲染。但不会影响元素固有的几何形状。一个剪裁了的元素的几何形状应该保持其好像未剪裁过时的形状。  

默认情况下，'pointer events' 不会被剪裁区域外部分触发。  

### 5.1 'clip-path'

<table>
  <tr>
    <td>属性名</td>
    <td>clip-path</td>
  </tr>
  <tr>
    <td>属性值</td>
    <td>&lt;clip-source&gt; | [ &lt;basic-shape&gt; || &lt;geometry-box&gt; ] | none</td>
  </tr>
  <tr>
    <td>初始值</td>
    <td>none</td>
  </tr>
  <tr>
    <td>适用元素</td>
    <td>所有元素</td>
  </tr>
  <tr>
    <td>是否可继承</td>
    <td>否</td>
  </tr>
  <tr>
    <td>可否参与动画</td>
    <td>如果是声明的 &lt;basic-shape&gt; 可以动画，否则不可以</td>
  </tr>
</table>

指定一个基础形状或者引用一个 `<clip-path>` 元素来创建一个剪裁路径。  

  *&lt;clip-source&gt;* = &lt;url&gt;  
  *&lt;geometry-box&gt;* = &lt;shape-box&gt; | fill-box | stroke-box | view-box  

**&lt;basic-shape&gt;**  
  基础形状函数是在CSS 形状模块定义的。一个基础形状可以利用指定的引用盒子来定位并且限定基础形状的大小。如果没有规定引用盒子，就使用 'border-box' 作为引用盒子。  

**&lt;geometry-box&gt;**  

  如果与基础形状组合指定，就是为基础形状指定了引用盒子。  
  如果单独声明的，就使用声明的盒子的边缘，包括角落的形状作为剪裁路径。  

**fill-box**  
  使用 object bounding box 作为引用盒。  

**stroke-box**  

 使用 stroke bounding box 作为引用盒。  

**view-box**  

 使用最近的SVG 视口作为引用盒。  

除了 'none' 以外的计算值会创建一个层叠上下文，就像 'opacity' 不为1。  


## 7. Positioned Masks

### 7.1 'mask-image'

<table>
  <tr>
    <td>属性名</td>
    <td>mask-image</td>
  </tr>
  <tr>
    <td>属性值</td>
    <td>&lt;mask-reference&gt;</td>
  </tr>
  <tr>
    <td>初始值</td>
    <td>none</td>
  </tr>
  <tr>
    <td>适用元素</td>
    <td>所有元素</td>
  </tr>
  <tr>
    <td>是否可继承</td>
    <td>否</td>
  </tr>
</table>

这个属性设置了一个元素的遮罩层图片（mask layer image）:  

  *&lt;mask-reference&gt;* = none | &lt;image&gt; | &lt;mask-source&gt;  

  &lt;mask-source&gt; = &lt;url&gt;  

**&lt;url&gt;**  

  一个 `<mask>` 元素的引用或者是一个CSS图像。  

  除了 'none' 以外的计算值会创建一个层叠上下文，就像 'opacity' 不为1。   

  注意：一个 &lt;mask-reference&gt;s列表中的 'none' 值可能会影响遮罩操作，其取决于'mask-composite'属性声明的组合操作。  

  注意：一个&lt;mask-source&gt;可能会参数遮罩层的计数并且可以与一个平铺的 &lt;mask-reference&gt;列表结合（逗号分隔）。  


### 7.2 Mask Image Interpretation: the mask-mode property

<table>
  <tr>
    <td>属性名</td>
    <td>mask-mode</td>
  </tr>
  <tr>
    <td>属性值</td>
    <td>&lt;masking-mode&gt;</td>
  </tr>
  <tr>
    <td>初始值</td>
    <td>auto</td>
  </tr>
  <tr>
    <td>适用元素</td>
    <td>所有元素</td>
  </tr>
  <tr>
    <td>是否可继承</td>
    <td>否</td>
  </tr>
</table>

'mask-mode' 属性指定了 '&lt;mask-reference&gt;' 是该当做 luminance 遮罩还是 alpha 遮罩。  

  *&lt;masking-mode&gt;* = alpha | luminance | auto  

**alpha**  

  'alpha' 值表明遮罩层图像的alpha值应该用来当做遮罩值。  

**luminance**  

  'luminance' 值表明遮罩层图像的luminance值应该用来当做遮罩值。  

**auto**  

  如果 &lt;mask-reference&gt; 是 &lt;mask-source&gt;类型就相当于 luminance。  
  如果&lt;mask-reference&gt; 是 &lt;image&gt; 类型就相当于 alpha。
