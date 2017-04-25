# Introduction

## 1. Introduction

### 1.1 关于SVG

SVG 是 XML 中用来描述二维图像的语言。SVG支持3种类型的图形对象：矢量图形，图片以及文字。图形对象可以分组，添加样式，变形，以及与之前渲染的对象混合。  

SVG 图是可以交互的和动态的。可以通过声明或者脚本定义和触发动画。  

可以通过使用可访问SVG DOM的脚本语言来使用复杂的SVG应用，脚本语言应该提供了访问所有元素，属性的功能。
一个复杂事件处理程序如'onmouseover'和'onclick'可以绑定给任意的SVG图形对象。  

### 1.2 SVG MIME 类型和文件扩展名

SVG 的 MIME 类型为 "image/svg+xml"。文件扩展名为 ".svg"。gzip压缩过的SVG文件扩展名为".svgz"。  

### 1.3 SVG 命名空间

命名空间：http://www.w3.org/2000/svg 。  


### 1.6 定义

**animation element**  
  一个动画元素指的是一个可以用来使另一个元素的属性可动画的元素。'animateColor', 'animateMotion', 'animateTransform', 'animate', 'set'这些元素
  都是动画元素。  

**animation event attribute**  
  动画事件属性是一个事件属性，其为一个特定动画相关事件指定了执行的脚本。这个属性可以是 'onbegin', 'onend', 'onload', 'onrepeat'。  

**basic shape**  
  SVG中预定义的标准的形状，方便一些通用的图形操作。包括：'circle', 'rect', 'polygon', 'ellipse', 'line', 'polyline'。  

**canvas**  
  绘制图形元素的平面。  

**cliping path**  
  'path'，'text' 以及用一位遮罩绘制轮廓的基础形状的组合。所有在这个轮廓内部的东西都允许展示出来，但是轮廓外面的部分都被遮挡住了。  

**container element**
  一个可以包含图形元素及其他容器元素作为子元素的元素。'a', 'defs', 'glyph', 'g', 'marker', 'mask', 'missing-glyph', 'pattern', 'svg', 'switch', 'symbol'。  

**conditional processing attribute**  

**core attributes**  
  可以定义在所有SVG元素上的属性。'id', 'xml:base', 'xml:lang', 'xml:space'。  

**current innermost SVG document fragment**  
  给定SVG元素的最直接的祖先'svg'元素所在的 XML 文档子树。  

**current SVG document fragment**  
  The XML document sub-tree which starts with the outermost ancestor ‘svg’ element of a given SVG element, with the requirement that all container elements between the outermost ‘svg’ and this element are all elements in the SVG language.  

**descriptive element**  
  为其父级元素提供了补充性的描述信息的元素。'desc', 'metadata', 'title'。  

**document event attribute**  
  一个为特定的文档范围事件指定运行脚本的事件属性。 'onabort', 'onerror', 'onresize', 'onscroll', 'onunload', 'onzoom'。  

**event attribute**  
  事件属性是用来指定当一个特定类型的事件在元素上触发时的运行的脚本属性。  

**fill**  
  一个用来设置在图形内部或字符内部绘制操作的字符串。  

**filter primitive attributes**  
  对所有 filter primitive elements 通用的一系列属性。'height', 'result', 'width', 'x', 'y'。  

**filter primitive element**  
  ...  

**font**  **glyph**  
  ...  

**gradient element**  
  定义一个绘制效果的元素。 'linearGradient', 'radialGradient'。  

**graphical event attribute**  
  为特定用户交互行为事件指定运行脚本的事件属性。 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload',
   'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup'。  

**graphics element**  
  可以在目标画布上生成可以绘制图形的一种元素类型。'circle', 'ellipse', 'image', 'line', 'path', 'polygon', 'polyline',
   'rect', 'text', 'use'。  

**graphics referencing element**  
  一个引用了不同文档或者元素作为其图形内容源的元素类型。'image', 'use'。  

**mask**  
  一个容器元素其包含了图形元素或者其他定义了图形的容器元素。用来作一个半透明的遮罩为了将前景对象组合到当前背景中。  

**outermost svg element**  

**paint**
  绘制代表了将颜色值放到画布上的一种方式。绘制可以包含颜色值和相关的控制与画布上已存在的颜色混合的alpha值。SVG支持
  3种内置的绘制：颜色，渐变和 patterns。  

**shape**  
  通过组合一些直线和曲线得到的图形元素。'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon'。  
