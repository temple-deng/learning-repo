# Chrome DevTools

<!-- TOC -->

- [Chrome DevTools](#chrome-devtools)
  - [检查动画](#检查动画)
    - [检查动画](#检查动画-1)
      - [查看动画的细节](#查看动画的细节)
    - [修改动画](#修改动画)
- [运行时性能分析](#运行时性能分析)
  - [开始](#开始)
    - [开始](#开始-1)
      - [模拟移动设备的 CPU](#模拟移动设备的-cpu)
      - [记录运行时的性能](#记录运行时的性能)
  - [Overview](#overview)
    - [JavaScript](#javascript)
  - [Performance Analysis Reference](#performance-analysis-reference)
    - [记录性能](#记录性能)
      - [禁用 JS samples](#禁用-js-samples)
    - [分析性能](#分析性能)
      - [在一个表格中查看活动](#在一个表格中查看活动)
        - [Root activities](#root-activities)
        - [The Call Tree tab](#the-call-tree-tab)
- [The Anatomy of a Frame](#the-anatomy-of-a-frame)
  - [Procss](#procss)
  - [Renderer Process Threads](#renderer-process-threads)
  - [The Flow Of Things](#the-flow-of-things)
  - [Layers And Layers](#layers-and-layers)

<!-- /TOC -->

## 检查动画

动画检测器可以分为4个部分：    

1. **Controls** 在这里，可以清除所有当前捕捉的动画组，或者更改当前选定动画组的速度。貌似还可以暂停动画。
2. **Overview** 在这里我们可以选择一个动画组来检查，并在 **Details** 面板中修改它。
3. **Timeline** 在这里暂停和开始一个动画的播放，或者跳到动画中的某一点。
4. **Details** 检查和修改当前选择的动画组。

![Animation pane](https://github.com/temple-deng/learning-repo/blob/master/pics/annotated-animation-inspector.png)    

要捕捉动画，只需在动画检查器打开时执行可以触发动画的交互。 如果动画在页面加载时触发，您可以重新加载页面，帮助动画检查器检测动画。    

### 检查动画

当我们捕捉到动画后，这里有几种方式来重播动画：   

+ 在 **Overview** 窗格中将鼠标悬停在动画的缩略图上方，查看它的预览。
+ 从 **Overview** 窗格中选择动画组（这样，动画组就会显示在 **Details** 窗格中）然后按 replay 按钮。动画就会在视口中重播。
+ 点击并拖动红色的垂直条以拖拽视口动画。    

#### 查看动画的细节

一旦我们捕获到一个动画组，在 **Overview** 面板中点击它就可以在 **Details** 查看动画的细节。每个动画都有独立的一行。    

动画最左侧的深色部分是其定义。右侧的浅色部分表示重复。 例如，在下方的屏幕截图中，第二和第三部分表示第一部分的重复。   

![animation-iterations](https://github.com/temple-deng/learning-repo/blob/master/pics/animation-iterations.png)   


如果两个元素应用了同一个动画，动画检查器会给它们分配相同的颜色。   

### 修改动画

可以通过以下的三种方式修改动画：  

+ 动画持续时间
+ 关键帧时间
+ 开始时间延迟   

拖动实心圆圈表示改变动画的持续时间。白色内圈表示关键帧规则。    


# 运行时性能分析

## 开始

### 开始

测试页面的地址 [demo](https://googlechrome.github.io/devtools-samples/jank/)    

#### 模拟移动设备的 CPU

移动设备的 CPU 一般来说要比桌面的性能差一些。所以当我们分析页面的性能的时候，可以使用 CPU 节流来模拟页面运行在移动设备上的状况。    

1. 在 DevTools 中打开 **Performance** 面板
2. 确保 **Screenshots** 勾选了。
3. 点击 **Capture Settings**（右上角那个）。DevTools 会显示一些捕获性能的一些配置。
4. 对于 **CPU** 一项来说，选择 **2x slowdown**。DevTools 会替我们降低一倍的 CPU 性能。    

#### 记录运行时的性能

1. 在 DevTools 中点击 **Records**。DevTools 会在页面运行时捕获一些性能的指标。
2. 等几秒钟的时间
3. 点击 **Stop**。DevTools 会停止记录过程，开始处理数据，然后展示最后的结果。    

  
## Overview   

### JavaScript

下表对一些常见 JavaScript 问题和潜在解决方案进行了说明：   


问题 | 示例 | 解决方案
---------|----------|---------
大开销输入处理程序影响响应或动画 | 触摸、视差滚动 | 让浏览器尽可能晚地处理触摸和滚动
时机不当的 JS 影响响应、动画、加载 | 页面加载后用户向右滚动、setTimeout/setInterval | 优化 JS 的执行；使用 `requestAnimationFrame`、使DOM操作遍布各个帧、使用 worker
长时间允许的JS影响响应 | DOMContentLoaded 事件由于 JS 过多而停止 | 将纯粹的计算工作移到 worker 中
会产生垃圾的脚本影响响应或动画 | 任何地方都可能发生垃圾回收 | 减少编写会产生垃圾的脚本

## Performance Analysis Reference

这一部分是与Chrome分析工具分析性能相关的功能的综合参考。    

### 记录性能

#### 禁用 JS samples

默认情况下，**Main** 部分会展示记录期间调用的 JS 函数栈的细节。如果要禁用这些调用栈：   

1. 打开捕获配置部分
2. 勾选禁用 JS Samples 框     

### 分析性能

#### 在一个表格中查看活动

DevTools 提供了3种表格化的视图来分析活动。每个视图都是从一个不同观点来分析活动：    
+ 如果我们想要查看引发大部分工作的根活动，使用 **Call Tree** 标签栏
+ 如果要看占用了大量时间的活动，使用 **Bottom-Up**
+ 如果要看按序触发的活动，使用**Event Log**    

##### Root activities

根活动是指那些引发浏览器去做一些任务的活动。例如，当我们点击页面时，浏览器触发一个`Event` 活动作为根活动。`Event` 可能会造成监听函数去执行。    

在 **Main** 部分的火焰图中，根活动在图表的顶部。在 **Call Tree** 和 **Event Log** 中，根活动是顶层的项目。    

##### The Call Tree tab

**Self Time** 表示这个活动直接花费的时间。**Total Time** 表示这个活动及其后代花费的时间。    


# The Anatomy of a Frame

![frame](https://github.com/temple-deng/learning-repo/blob/master/pics/anatomy-of-a-frame.svg)    

## Procss

+ **Renderer Process.** 标签页所处的那个容器（也就是每个标签页所在的那个进程吧）。它包含多个线程，它们一起负责在屏幕上获取页面的各个方面。这些线程就是 _Compositor_, _Tile Worker_, _Main_ 线程。   
+ **GPU Process.** 这是一个为所有标签页和浏览器进程提供服务的单一进程。帧会提交到 GPU 进程，并上传任意的 tiles 和其他的数据（例如四边形和矩阵）到 GPU，并最终造成推送像素到屏幕上。GPU 进程包含一个单一线程，实际上是这个线程做了这份工作。    

## Renderer Process Threads

+ **Compositor Thread.** 这是第一个被通知vsync事件（这是操作系统如何告诉浏览器创建一个新的帧）的线程。它还会接收任意的输入事件。如果这个线程可以的话，它会避免进入主线程，并尝试将输入（例如滚动转换）转换为屏幕上的移动。它会通过更新层的位置并将帧通过 GPU 线程提供给 GPU 来完成这个任务。如果它由于输入事件处理器或者其他视觉任务而不能完成这个工作，那么就需要主线程来处理。
+ **Main Thread.** 这个线程就是浏览器执行我们所知的任务所在的线程，例如JS，样式，布局和绘制。
+ **Compositor Tile Worker(s).** Compositon 线程会派生出一个或多个 worker 来处理光栅化任务。     

在很多方面我们可以把 Compositor 线程认为是 "big boss"。它并不会运行JS,布局，绘制及其他的任务。它只是一个负责初始化主线程，并将帧推送到屏幕上的线程。     

## The Flow Of Things

![main-thread](https://github.com/temple-deng/learning-repo/blob/master/pics/main-thread.svg)    

1. **Frame Start.** Vsync 触发，新的一帧开始
2. **Input event handlers.** 输入数据会从 compositor 线程传递给主线程上任意的输入事件监听函数。所有的输入事件处理函数（touchmove, scroll, click）应该首先触发。
3. **requestAnimationFrame.** 这是处理屏幕上视觉更新逻辑理想的位置，因为这时候我们刷新了输入数据，它和我们获取到的 vsync 一样的接近。其他的视觉任务，例如样式的计算，都是在这个任务之后，所以这是个理想的位置让我们来修改元素。如果我们修改了100类，那么它不会导致100次的样式计算，他们会被打包起来处理。不过我们在这里不应该查询或者计算样式或者布局属性，因为会导致样式的重新计算。
4. **Parse HTML.** 任何新加的 HTML 在这里被处理，DOM 元素被创建。
5. **Recalc Styles.**任何东西新加或者修改了样式会在这里重新计算。
6. **Layout.** 为每个视觉元素计算几何位置信息。
7. **Update Layer Tree.** 创建层叠上下文并深度排序元素的过程。
8. **Paint.** 这个一个两部过程中第一部分：绘制过程事实上记录了任何新增或者发生了视觉变化的元素上的绘制函数的调用（例如说在某个位置填充一个矩形，写入一些文字等）。第二部分叫做 Rasterization (栅格化？)，这一部分才是绘制函数真正执行，纹理被填充的地方。绘制过程通常来说只是记录调用的函数，而且要远快于栅格化的过程，不过这两部分经常被合到一起叫做“绘制”。
9. **Composite.** 这一部分会计算 layer 和 tile 的信息，并将其传回给 compositor
线程来处理。通常可能包括 `will-change`，元素的重叠及任何硬件加速的 canvas等。
10. **Raster Schedules** and **Rasterize:** 绘制任务中记录的绘制调用在这里执行。这个工作是由 `Compositor Tile Workers`完成的，其数量取决于平台及设备的能力。例如在安卓上可以只有一个 worker，在桌面上可能有4个。栅格化是根据 layer 进行的，每个 layer 则是由 tile 组成。    

+ **requestIdleCallback:** 如果此时主线程距离帧的结尾还有一些时间，那么 `requestIdleCallback` 触发。   

## Layers And Layers

在工作流程中会有两个版本的深度排序的方式。    

第一种就是层叠上下文，比如说有两个绝对定位的 divs 重叠了。**Update Layer Tree**
就是这个过程的一部分用来确保 `z-index` 的顺序。    

第二种是 Compositor Layers，在流程中靠后一些，并在绘制元素的过程中应用的更多一点。 An element can be promoted to a Compositor Layer with the null transform hack, or will-change: transform, which can then be transformed around the place cheaply (good for animation!). But the browser may also have to create additional Compositor Layers to preserve the depth order specified by z-index and the like if there are overlapping elements. Fun stuff!    

Compositing: the use of multiple backing stores to cache and group chunks of the render tree。   

组合优点：  

+ 避免没有必要的重绘
+ 让一些功能更搞笑，例如滚动，3D CSS，透明度，filter，WebGL。   

3个主要的 compositing 任务：    

1. 决定如何将内容分组到 backing store （例如 composited layers）中。
2. 绘制每一个 composited layer 的内容。
3. Draw 出 composited layer 来形成最终的图片。    

composite when the render subtree could benifit from being cached and grouped










