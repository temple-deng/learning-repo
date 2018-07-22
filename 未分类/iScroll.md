# iScroll

## 开始

可以传递一个选择器字符串或者一个 DOM 元素给 `IScroll` 构造函数，字符串的话应该是传递给 `querySelector()` 来获取DOM 元素，因此如果是类选择器及标签选择器等注意只能选到第一个。     

iScroll 需要在 DOM 准备好后进行初始化，貌似是因为其必须知道滚动区域的宽高。    

## 配置

在初始化的构造函数中，可以传入第二个配置对象参数配置 iScroll。     

```js
const myScroll = new IScroll('#wrapper', {
  mouseWheel: true,
  scrollbars: true
});
```     

在初始化完成后，可以通过 `options` 对象访问这些常规配置值。     

`console.dir(myScorll.options)`    

之所以叫常规值是因为比如说我们设置了 `useTransform: true` 但是浏览器不支持 CSS transform，`useTransform` 就会为 `false`。     

## 理解核心

通常来说我们不需要配置引擎，iScroll 会为我们挑选最合适的。     

+ `options.useTransform`：默认情况下引擎使用 `transform` 属性。如果设为 `false` 的话，我们就像回到2007年一样，使用绝对定位的 `left/top` 进行滚动。
+ `options.useTransition`：iScroll 使用CSS transition 执行动画，将这个设置为 `false` 的话，就使用 `requestAnimationFrame`。    
+ `options.HWComposition`：这个设置尝试通过添加 `translateZ(0)` 来将滚动器放置到硬件层上。    

## 基本功能

+ `options.bounce`：当滚动器到达边界时，其会执行一小段反弹动画。默认 `true`
+ `options.click`：为了区覆盖原生的滚动，iScroll 必须去禁止一些默认的浏览器行为，例如鼠标的点击。如果我们希望应用可以对点击事件做出响应，必须明确的将这个选项设置为 `true`。
+ `options.disableMouse`, `options.disablePointer`, `options.disableTouch`：默认情况下 iScroll 会监听所有的 pointer 事件并对第一个发生的事件做出响应。
+ `options.eventPassthrough`：有时我们可能希望在垂直方向上使用原生的滚动，但是水平方向上使用 iScroll 滚动。那将这个选项设为 `true`，iScroll 就只会响应水平的滚动。需要注意的是可以将这个值设置为 `'horizontal'` 来反转这种行为。
+ `options.freeScroll`：这个主要是2D 滚动器需要的配置。一般来说，当我们在一个方向上滚动时另一个方向会被锁住。但有时候我们希望不受限制的自由滚动。这时候可以把这个选项设为 `true`。
+ `options.keyBinding`：略，默认 `false`
+ `options.invertWheelDirection`：默认 `false`
+ `options.momentum`：默认 `true`
+ `options.mouseWheel`：监听滚轮事件，默认 `false`
+ `options.preventDefault`
+ `options.scrollbars`：是否展示默认的滚动条
+ `options.scrollX`, `options.scrollY`：默认情况下只启用了垂直方向上的滚动，如果需要设置水平方向的，将 `scrollX` 设为 `true`。
+ `options.startX, options.startY`：默认情况下 iScroll 在 0,0 位置开始，我们可以设置这两个值让滚动器从一个不同的位置开始
+ `options.tap`：将这个选项设为 `true`可以让iScroll 在滚动区域被点击/触碰而不是滚动时触发一个定制的 `tap` 事件。这是用来处理用户与可点击元素进行交换的推荐的方式。可以传入一个字符串来自定义这个事件名。


## 滚动条

在内部其实滚动条被叫做指示器。指示器会监听滚动器的位置。     

+ `options.scrollbars`：略。
+ `options.fadeScrollbars`：略
+ `options.interactiveScrollbars`：滚动条会变成可拖动的
+ `options.resizeScrollbars`：略。
+ `options.shrinkScrollbars`：当滚动到边界外部时滚动条会收缩一点。有效的值有`'clip'`和`'scale'`。`'clip'` 只是简单的把指示器移动到容器的外部。`'scale'` 会会关闭 `useTransition` 因此所有的动画都是通过 `requestAnimationFrame` 完成的。    

我们可以定制滚动条的外观，首先把 `scrollbars` 设为 `'custom'`。然后使用下面的类名为滚动条添加样式：    

+ .iScrollHorizontalScrollbar,这个类定义在水平容器上，注意这个容器不是滚动的容器，而是滚动条的容器，简单来说就是实际上滚动条的父元素
+ .iScrollVerticalScrollbar，定义在垂直容器上
+ .iScrollIndicator,真正的滚动条指示器
+ .iScrollBothScrollbars,这个类应该是在两个方向上的滚动条都展示时添加到容器上

## 指示器

所有的滚动条实际上只是对底层 `indicators` 选项的一层包裹。类似于下面的这个样子：   

```js
var myScroll = new IScroll('#wrapper', {
    indicators: {
        el: [element|element selector]
        fade: false,
        ignoreBoundaries: false,
        interactive: false,
        listenX: true,
        listenY: true,
        resize: true,
        shrink: false,
        speedRatioX: 0,
        speedRatioY: 0,
    }
});
```    

+ `options.indicators.el`：这个参数是滚动条容器元素的引用。这个容器的第一个子元素就是指示器。注意滚动条事实上可以在文档中的任何位置，而不是必须在滚动器的包裹元素中。参数可以是一个元素或者是选择器字符串
+ `options.ignoreBoundaries`：告诉指示器忽略其容器的边界。默认 `false`
+ `options.indicators.listenX`, `options.indicators.listenY`：指示器监听哪个轴。
+ `options.indicators.speedRatioX`, `options.indicators.speedRatioY`：指示器相对于主滚动器尺寸的移动速度。默认会自动设置
+ `options.indicators.fade`, `options.indicators.interactive`, `options.indicators.resize`, `options.indicators,shrink`：略。    

**程序式地滚动**     

+ `scrollTo(x, y, time, easing)`：time 和 easing 参数是可选的。渐动函数是定义在 `IScroll.utils.ease` 上的。
+ `scrollBy(x, y, time, easing)`：相对滚动
+ `scrollToElement(el, time, offsetX, offsetY, easing)`：唯一必填的参数是 `el`。可以是一个元素或者一个选择器字符串

## 吸附

iScroll 可以吸附到任意固定的位置和元素上。    

+ `options.snap`：可以是布尔值或者一个选择器，这个选择器就是吸附的元素。
+ `goToPage(x, y, time, easing)`：x和y代表了水平和垂直方向上的滚动页码
+ `next(), prev()`：下一页或者上一页


## 缩放

为了启用缩放功能，最后使用 `iscroll-zoom.js` 脚本。     

+ `options.zoom`：是否启用缩放
+ `options.zoomMax`：默认 4
+ `options.zoomMin`：默认1
+ `options.zoomStart`：默认1
+ `options.whileAction`：设置为 `'zoom'` 来启用滚轮的缩放功能，不然是滚动功能
+ `zoom(scale, x, y, time)`：编程式缩放方法，x和y是缩放点，默认应该是指针所在点


## 无限滚动

略。。。。     

## 高级选项

+ `options.bindToWrapper`：`move` 事件通常绑定在 document 元素而不是滚动容器上。这样的话，当我们手指或者指针移出容器时还可以继续滚动。如果启用这个选项的话，就将move事件绑定到容器上。
+ `options.bounceEasing`：略。
+ `options.bounceTime`：毫秒
+ `options.deceleration`：默认 `0.0006`
+ `options.mouseWheelSpeed`：默认20
+ `options.preventDefaultException`：应该是指定一些不会被阻止默认事件的元素
+ `options.resizePolling`：当我们修改窗口的大小时，iScroll会去重新计算元素的位置和尺寸。默认60


## 管理刷新方法

iScroll 需要知道容器和滚动器准确的尺寸，这些尺寸会在一开始就计算好，如果元素的尺寸改变了，我们需要通知 iScroll。     

这个操作需要在正确的时间调用 `refresh` 方法。     

略。     

## 定制事件

iScroll 也可以让我们触发一些定制的事件。     

为了注册这些事件需要使用 `on(type, fn)` 方法。    

可用的事件类型有：     

+ `beforeScrollStart`，当用户触碰屏幕后但在滚动开始前触发
+ `scrollCancel`：滚动初始化了但没有发生
+ `scrollStart`：开始滚动
+ `scroll`：正在滚动
+ `scrollEnd`：停止滚动
+ `flick`：用户 flick 左右
+ `zoomStart`：开始缩放
+ `zoomEnd`：停止缩放      


