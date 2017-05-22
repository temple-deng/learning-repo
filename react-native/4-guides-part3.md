# guides part3

## 1. 手势响应系统

#### 最佳实践

为了使 app 感觉更流畅，每个操作都应该有下面的属性：

+ 反馈/高亮——让用户看到他们到底按到了什么东西，以及松开手后会发生什么。

+ 取消功能 —— 当用户正在触摸操作时，应该是可以通过把手指移开来终止操作。  

响应系统用起来可能比较复杂。所以我们提供了一个抽象的Touchable实现，用来做“可触控”的组件。这一实现利用了响应系统，使得你可以简单地以声明的方式来配置触控处理。如果要做一个按钮或者网页链接，那么使用TouchableHighlight就可以。  

### 响应生命周期

一个View只要实现了正确的协商方法，就可以成为触摸事件的响应者。我们通过两个方法去“询问”一个View是否愿意成为响应者：  

+ `View.props.onStartShouldSetResponder: (evt) => true`——是否view在触摸开始的时候愿意成为
响应器。  

+ `View.props.onMoveShouldSetResponder: (evt) => true`—— 如果View不是响应者，那么在每一个触摸点开始移动（没有停下也没有离开屏幕）时再询问一次：是否愿意响应触摸交互呢？  

如果 View 返回 true并且尝试成为响应者，那么会触发下列事件之一:

+ `View.props.onResponderGrant: (evt) => {}` ——View 现在会响应触摸事件。这也是需要做高亮的时候，使用户知道他到底点到了哪里。  

+ `View.props.onResponderReject: (evt) => {}`——响应者现在“另有其人”而且暂时不会“放权”，请另作安排。

如果View已经开始响应触摸事件了，那么下列这些处理函数会被一一调用：

+ `View.props.onResponderMove: (evt) => {}` - 用户正在屏幕上移动手指时（没有停下也没有离开屏幕）。
+ `View.props.onResponderRelease: (evt) => {}` - 触摸操作结束时触发，比如"touchUp"（手指抬起离开屏幕）。
+ `View.props.onResponderTerminationRequest: (evt) => true` - 有其他组件请求接替响应者，当前的View是否“放权”？返回true的话则释放响应者权力。  
+ `View.props.onResponderTerminate: (evt) => {}` - 响应者权力已经交出。这可能是由于其他View通过`onResponderTerminationRequest`请求的，也可能是由操作系统强制夺权（比如iOS上的控制中心或是通知中心）。  

`evt`是一个合成事件，它包含以下结构：

+ `nativeEvent`
  - `changedTouches`- 在上一次事件之后，所有发生变化的触摸事件的数组集合（即上一次事件后，所有移动过的触摸点）
  - `identifier`- touch 的 ID
  - `locationX` - 触摸点的 X 偏移量，相对于元素
  - `locationY` - 触摸点的 Y 偏移量，相对于元素
  - `pageX` - 触摸点的 X 偏移量，相对于根元素
  - `pageY` - 触摸点的 Y 偏移量，相对于根元素
  - `target` - 接收 touch 事件的元素节点 ID
  - `timestamp` - 触摸的时间戳，可用于移动速度的计算
  - `touches` - 当前屏幕上的所有触摸点的集合

#### 捕获ShouldSet事件处理器

`onStartShouldSetResponder` and `onMoveShouldSetResponder` 是以冒泡的形式调用的，即嵌套最深的节点最先调用。这意味着当多个View同时在`*ShouldSetResponder`中返回true时，最底层的View将优先“夺权”。在多数情况下这并没有什么问题，因为这样可以确保所有控件和按钮是可用的。  

但是有些时候，某个父View会希望能先成为响应者。我们可以利用“捕获期”来解决这一需求。响应系统在从最底层的组件开始冒泡之前，会首先执行一个“捕获期”，在此期间会触发`on*ShouldSetResponderCapture`系列事件。因此，如果某个父View想要在触摸操作开始时阻止子组件成为响应者，那就应该处理`onStartShouldSetResponderCapture`事件并返回true值。  

+ `View.props.onStartShouldSetResponderCapture: (evt) => true`
+ `View.props.onMoveShouldSetResponderCapture: (evt) => true`  
