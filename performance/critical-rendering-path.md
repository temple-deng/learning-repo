# Critical Rendering Path

优化关键渲染路径是指对与当前用户操作相关的内容的显示进行优先级排序。在接收 HTML，CSS
和JavaScript字节与将其转换为渲染像素的所需处理 - 这是关键的渲染路径。   

通过优化关键的渲染路径，可以显著地改进我们页面的第一次渲染的时间。    

## 构建对象模型 Constructing the Object Model  

在浏览器开始渲染页面前，它会先构建 DOM 和 CSSOM 树。因此，我们需要确保尽可能快地将
HTML 和 CSS 提供给浏览器。    

#### TL;DR

+ Bytes -> characters -> token -> nodes -> object model
+ HTML 标记转换为 DOM；CSS 标记转换为 CSS Object Model(CSSOM)
+ DOM 和 CSSOM 是相互独立的数据结构。

### Document Object Model

```html
<html>
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link href="style.css" rel="stylesheet">
    <title>Critical Path</title>
  </head>
  <body>
    <p>Hello <span>web performance</span> students!</p>
    <div><img src="awesome-photo.jpg"></div>
  </body>
</html>
```   

我们先从一个简单的例子开始，浏览器会这样处理上面的页面：   

![DOM process](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/images/full-process.png)    

1. **转换 Conversion:** 浏览器从硬盘或网络中读取 HTML 原始的字节内容，并基于文件声明的
编码方式将其字节内容转换为独立的字符。
2. **标记化 Tokenizing:** 浏览器将字符串转换为 HTML5 标准规定的各种标记。每个标记都有其特殊的含义和一系列规则。
3. **词法分析 Lexing:** 生成的标记转换为“对象”，它们定义了自身的属性和规则。
4. **构建DOM:** 最后，因为HTML标记定义了不同标签之间的关系（一些标签包含在其他标签中），
所创建的对象将以树形数据结构的形式进行链接，该结构还捕获原始标记中定义的父子关系。    

这整个过程的输出结果就是我们页面的 DOM，浏览器就是使用 DOM 来对页面进行进一步的处理。   

DOM 树捕获了文档标记的属性和标记之间的关系，但是没有告诉我们元素渲染时是什么样子的。
这就是 CSSOM 的责任。   

### CSS Object Model(CSSOM)   

当浏览器构建页面的 DOM 时，它会在 head 部分遇到引用一个外部 CSS 样式表的 link 标签：style.css。
浏览器预计需要此资源来渲染页面，它会立刻分配一个对该资源的请求，该请求会返回下面的内容：    

```css
body { font-size: 16px }
p { font-weight: bold }
span { color: red }
p span { display: none }
img { float: right }
```    

与 HTML 类似，我们需要将收到的 CSS 规则转换为浏览器可以理解并处理的东西：   

![cssom](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/images/cssom-construction.png)   

最终转换为如下的 CSSOM 结构：   

![](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/images/cssom-tree.png)   

CSSOM 也是一个树结构。这是因为，浏览器都会先从适用于该节点的最通用规则开始（例如，如果该
节点是 body 元素的子项，则应用所有 body 样式），然后通过应用更具体的规则（即规则“向下级联”）以递归方式优化计算的样式。    

以上面的 CSSOM 树为例进行更具体的阐述。`span` 标记内包含的任何置于 `body` 元素内的文本都
将具有 16 像素字号，并且颜色为红色 — `font-size` 指令从 `body` 向下级联至 `span`。不过，
如果某个 `span` 标记是某个段落 (`p`) 标记的子项，则其内容将不会显示。    

还请注意，以上树并非完整的 CSSOM 树，它只显示了我们决定在样式表中替换的样式。每个
浏览器都提供一组默认样式（也称为“User Agent 样式”），即我们不提供任何自定义样式时所
看到的样式，我们的样式只是替换这些默认样式。     

## 渲染树构建、布局及绘制

CSSOM 树和 DOM 树合并成渲染树，然后用于计算每个可见元素的布局，并输出给绘制流程，将像素渲染到屏幕上。优化上述每一个步骤对实现最佳渲染性能至关重要。    

#### TL;DR

+ DOM 树与 CSSOM 树合并后形成渲染树。
+ 渲染树只包含渲染网页所需的节点。
+ 布局计算每个对象的精确位置和大小。
+ 最后一步是绘制，使用最终渲染树将像素渲染到屏幕上   

第一步是让浏览器将 DOM 和 CSSOM 合并成一个“渲染树”，网罗网页上所有可见的 DOM 内容，以及每个节点的所有 CSSOM 样式信息。   

![render-tree-construction](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/images/render-tree-construction.png)    

为构建渲染树，浏览器大体上完成了下列工作：  
  1. 从 DOM 树的根节点开始遍历每个可见节点。
    - 某些节点不可见（例如脚本标记、元标记等），因为它们不会体现在渲染输出中，所以会被忽略。
    - 某些节点通过 CSS 隐藏，因此在渲染树中也会被忽略，例如，上例中的 span 节点不会出现
    在渲染树中，因为有一个显式规则在该节点上设置了 `display: none` 属性。
  2. 对于每个可见节点，为其找到适配的 CSSOM 规则并应用它们。
  3. 发射可见节点，连同其内容和计算的样式。   

最终输出的渲染同时包含了屏幕上的所有可见内容及其样式信息。有了渲染树，我们就可以进入“布局”阶段。    

到目前为止，我们计算了哪些节点应该是可见的以及它们的计算样式，但我们尚未计算它们在设备视口
内的确切位置和大小---这就是“布局”阶段，也称为“重排”。      

布局流程的输出是一个“盒模型”，它会精确地捕获每个元素在视口内的确切位置和尺寸：所有相对测量值都转换为屏幕上的绝对像素。   

最后，既然我们知道了哪些节点可见、它们的计算样式以及几何信息，我们终于可以将这些信息传递给最后一个阶段：将渲染树中的每个节点转换成屏幕上的实际像素。这一步通常称为“绘制”或“栅格化”。     

下面简要概述了浏览器完成的步骤：  

1. 处理 HTML 标记并构建 DOM 树。
2. 处理 CSS 标记并构建 CSSOM 树。
3. 将 DOM 与 CSSOM 合并成一个渲染树。
4. 根据渲染树来布局，以计算每个节点的几何信息。
5. 将各个节点绘制到屏幕上    

优化关键渲染路径就是指最大限度缩短执行上述第 1 步至第 5 步耗费的总时间。    

## 评估关键渲染路径

### 使用 Navigation Timing API 设置您的代码   

![dom-navtiming](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/images/dom-navtiming.png)   

上图中的每一个标签都对应着浏览器为其加载的每个网页追踪的细粒度时间戳。实际上，在这个具体例子中，我们展示的只是各种不同时间戳的一部分。我们暂且跳过所有与网络有关的时间戳。    

+ `domLoading`: 这是整个过程的起始时间戳，浏览器即将开始解析第一批收到的 HTML 文档字节。
+ `domInteractive`: 表示浏览器完成对所有 HTML 的解析并且 DOM 构建完成的时间点。
+ `domContentLoaded`: 表示 DOM 准备就绪并且没有样式表阻止 JavaScript 执行的时间点，这意味着现在我们可以构建渲染树了。
+ `domComplete`: 顾名思义，所有处理完成，并且网页上的所有资源（图像等）都已下载完毕，也就是说，加载转环已停止旋转。
+ `loadEvent`: 作为每个网页加载的最后一步，浏览器会触发 `onload` 事件，以便触发额外的应用逻辑。    

```html
<html>
  <head>
    <title>Critical Path: Measure</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link href="style.css" rel="stylesheet">
    <script>
      function measureCRP() {
        var t = window.performance.timing,
          interactive = t.domInteractive - t.domLoading,
          dcl = t.domContentLoadedEventStart - t.domLoading,
          complete = t.domComplete - t.domLoading;
        var stats = document.createElement('p');
        stats.textContent = 'interactive: ' + interactive + 'ms, ' +
            'dcl: ' + dcl + 'ms, complete: ' + complete + 'ms';
        document.body.appendChild(stats);
      }
    </script>
  </head>
  <body onload="measureCRP()">
    <p>Hello <span>web performance</span> students!</p>
    <div><img src="awesome-photo.jpg"></div>
  </body>
</html>
```    
