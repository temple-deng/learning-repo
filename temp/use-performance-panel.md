# 利用 Chrome 的 Performance 面板进行运行时性能分析

## 分析 FPS

1. 查看 **FPS** 图表。无论何时我们在 FPS 图表部分上看到红条，都意味者这一部分帧率下降的很严重。通常来说，绿色的条越高，FPS 越高。
![FPS](https://github.com/temple-deng/learning-repo/blob/master/pics/fps-chart.svg)   
2. 在 **FPS** 图下方是 **CPU** 图。**CPU** 图中的颜色是与下面的 **Summary** 栏中对应的。**CPU** 图中颜色几乎被充满意味着在记录性能期间 CPU 性能接近饱和。所以无论何时我们发现 CPU 长期性能饱和，意味着我们需要调整一下性能了。   
![CPU](https://github.com/temple-deng/learning-repo/blob/master/pics/cpu-summary.svg)
3. 当我们把鼠标悬浮在 **FPS**, **CPU**, **NET** 图上时。DevTools 会展示页面在那个时间点的截屏。
这个好像必须在 recording 的时候勾选 screenshots 选项才有。
4. 在 **Frames** 部分，把鼠标悬浮到一个绿色小方块上。DevTools 会展示那个特定帧的 FPS。   

**Bonus: 打开 FPS meter**    

另一个方便的工具是 FPS meter，它会提供页面运行时对 FPS  实时的估计。   

1. Windows 和 Linux 上输入 <kbd>Control</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> 打开命令面板。
2. 输入 `Rendering` 并选择 **Show Rendering**
3. 在 **Rendering** 标签栏中启用 **FPS Meter**。则在视口右上角会出现一个遮罩层。   
![fps-meter](https://github.com/temple-deng/learning-repo/blob/master/pics/fps-meter.png)   


## 寻找瓶颈

1. 注意 **Summary** 栏。当没有选中任何事件时，这个 tab 会展示给我们活动分解的内容。注意到这个页面大部分时间花费到了 rendering 上。    
![summary](https://github.com/temple-deng/learning-repo/blob/master/pics/summary.svg)
2. 展开 **Main** 部分。DevTools 展示了主线程上活动的一个火焰图。x 轴是时间。每个 bar 都表示一个事件。一个比较宽的 bar 表示这个事件花费了更长的时间。y 轴表示调用栈。我们可以看到事件是从上堆到下的，意味着上面的事件造成了下面事件的触发。  
![main](https://github.com/temple-deng/learning-repo/blob/master/pics/main.svg)   
3. 点击一个 **Animation Frame Fired** 事件。注意到右上角有一个红色三角。无论何时我们看到红色三角，都是对当前时间可能存在问题的一个警告。**Summary** 栏展示了这个事件的信息。注意那个 **reveal** 链接。如果点击这个链接的话会高亮初始化了这个事件的事件。   
**Note**: **Animation Frame Fired** 事件是在 `requestAnimationFrame()` 回调执行时被调用的。
4. 在 **app.update** 事件下面，有一系列的紫色的事件。点击一个紫色的 **Layout** 事件。DevTools 会在 **Summary** 展示事件更多的信息。注意紫色事件好像分 Layout 和 Recalculate Style 两种  
5. 点击 **Summary** tab 栏，点击 **Layout Forced** 下面的的 **app.js:70** 的链接。DevTools
会将我们带到强制重新布局的那行代码。   


注：**Main** 部分意思是主线程。   