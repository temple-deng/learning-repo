## 1. 定时器 Timers

定时器是一个应用中非常重要的部分。React Native实现了和浏览器一致的定时器Timer。  

### 1.1 定时器

+ setTimeout, clearTimeout
+ setInterval, clearInterval
+ setImmediate, clearImmediate
+ requestAnimationFrame, cancelAnimationFrame

`requestAnimationFrame(fn)`与 `setTimeout(fn, 0)` 是不同的——前者会在每帧刷新之后执行一次，
而后者则会尽可能快的执行。  

`setImmediate` 会在当前JS执行块结束时执行，就在将要发送批量响应数据到原生之前。注意如果你在`setImmediate`的回调函数中又执行了`setImmediate`，它会紧接着立刻执行，而不会在调用之前等待原生代码。  

Promise的实现就使用了`setImmediate`来执行异步调用。  

### 1.2 InteractionManager

原生应用感觉如此流畅的一个重要原因就是在互动和动画的过程中避免繁重的操作。在React Native里，我们目前受到限制，因为我们只有一个JavaScript执行线程。不过你可以用`InteractionManager`来确保在执行繁重工作之前所有的交互和动画都已经处理完毕。  

应用可以通过以下代码来安排一个任务，使其在交互结束之后执行：  

```javascript
InteractionManager.runAfterInteractions(() => {
   // ...需要长时间同步执行的任务...
});
```  

我们来把它和之前的几个任务安排方法对比一下：  

+ requestAnimationFrame(): 用来执行在一段时间内控制视图动画的代码
+ setImmediate/setTimeout/setInterval(): 在稍后执行代码。注意这有可能会延迟当前正在进行的动画。
+ runAfterInteractions(): 在稍后执行代码，不会延迟当前进行的动画。

触摸处理系统会把一个或多个进行中的触摸操作认定为'交互'，并且会将`runAfterInteractions()`的回调函数延迟执行，直到所有的触摸操作都结束或取消了。   

InteractionManager还允许应用注册动画，在动画开始时创建一个交互“句柄”，然后在结束的时候清除它。  


```javascript
var handle = InteractionManager.createInteractionHandle();
// 执行动画... (`runAfterInteractions`中的任务现在开始排队等候)
// 在动画完成之后
InteractionManager.clearInteractionHandle(handle);
// 在所有句柄都清除之后，现在开始依序执行队列中的任务
```  

### 1.3 TimerMixin

我们发现很多React Native应用发生致命错误（闪退）是与计时器有关。具体来说，是在某个组件被卸载（unmount）之后，计时器却仍然被激活。为了解决这个问题，我们引入了`TimerMixin`。如果你在组件中引入`TimerMixin`，就可以把你原本的`setTimeout(fn, 500)`改为`this.setTimeout(fn, 500)`(只需要在前面加上`this.`)，然后当你的组件卸载时，所有的计时器事件也会被正确的清除。   

不过这是ES5的写法了，在ES6中需要在`componentWillUnmount()`中手动清除定时器。   


## 2. 直接操作

有时需要在不使用 state/props的情况下直接对组件做出改动并触发整个子树的重新渲染。譬如在浏览器中使用React库，有时候会需要直接修改一个DOM节点，而在手机App中操作View时也会碰到同样的情况。`setNativeProps`等价于直接在DOM节点设置属性。  

`setNativeProps` 会直接在原生层面（DOM，UIView等）存储数据，而不是在 React 组件中。  

### 2.1 setNativeProps with TouchableOpacity

`TouchableOpacity`这个组件就在内部使用了`setNativeProps`方法来更新其子组件的透明度。所以
事实上 `setNativeProps` 方法应该是在子组件上调用的吧。    

由此我们可以写出下面这样的代码：子组件可以响应点击事件，更改自己的透明度。而子组件自身并不需要处理这件事情，也不需要在实现中做任何修改。  

```javascript
<TouchableOpacity onPress={this._handlePress}>
  <View style={styles.button}>
    <Text>Press me!</Text>
  </View>
</TouchableOpacity>
```  

### 2.2 复合组件与setNativeProps

复合组件并不是单纯的由一个原生视图构成，所以你不能对其直接使用`setNativeProps`。比如下面这个例子：  

```javascript
class MyButton extends React.Component {
  render() {
    return (
      <View>
        <Text>{this.props.label}</Text>
      </View>
    )
  }
}

class App extends React.Component {
  render() {
    return (
      <TouchableOpacity>
        <MyButton label="Press me!" />
      </TouchableOpacity>
    )
  }
}
```  

执行上面的代码会报错。因为 `MyButton` 并非直接由原生视图构成，而我们只能给原生视图设置透明值。上面说到 `TouchableOpacity` 是在子节点上调用 `setNativeProps`，现在 `MyButton` 作为子节点，但是它并不是原生视图啊。  

我们可以这样想：如果你通过`React.createClass`方法自定义了一个组件，直接给它设置样式prop是不会生效的，你得把样式props层层向下传递给子组件，直到子组件是一个能够直接定义样式的原生组件。同理，我们也需要把`setNativeProps`传递给由原生组件封装的子组件。  

#### 将setNativeProps传递给子组件

具体要做的就是在我们的自定义组件中再封装一个setNativeProps方法，其内容为对合适的子组件调用真正的setNativeProps方法，并传递要设置的参数。  

```javascript
class MyButton extends React.Component {
  setNativeProps(nativeProps) {
    this._root.setNativeProps(nativeProps);
  }

  render() {
    return (
      <View ref={component => this._root = component} {...this.props}>
        <Text>{this.props.label}</Text>
      </View>
    )
  }
}
```  

你可能还会注意到我们在向下传递props时使用了`{...this.props}`语法。这是因为`TouchableOpacity`本身其实也是个复合组件，它除了要求在子组件上执行`setNativeProps` 以外，还要求子组件对触摸事件进行处理。与之相对的是`TouchableHighlight`组件，它本身是由原生视图构成，因而只需要我们实现`setNativeProps`。  


### 2.3 setNativeProps to clear TextInput value

另一个常用的例子是用 `setNativeProps`来清空 TextInput 的值。TextInput 的`controlled` 属性
有时会在 `bufferDelay` 为 low 且用户打字很快的时候丢失字符。一些开发者更喜欢在必要的时候完全跳过这个属性而
直接使用 `setNativeProps` 去操作 TextInput 的值。  

```javascript
class App extends React.Component {
  constructor(props) {
    super(props);
    this.clearText = this.clearText.bind(this);
  }

  clearText() {
    this._textInput.setNativeProps({text: ''});
  }

  render() {
    return (
      <View style={styles.container}>
        <TextInput ref={component => this._textInput = component}
                   style={styles.textInput} />
        <TouchableOpacity onPress={this.clearText}>
          <Text>Clear text</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
```

###　2.4  避免与 render 函数冲突

如果要更新一个由render方法来维护的属性，则可能会碰到一些出人意料的bug。因为每一次组件重新渲染都可能引起属性变化，这样一来，之前通过`setNativeProps`所设定的值就被完全忽略和覆盖掉了。  


## 3. 性能

使用React Native替代基于WebView的框架来开发App的一个强有力的理由，就是为了使App可以达到每秒60帧（足够流畅），并且能有类似原生App的外观和手感。  

### 3.1 关于帧 frames

#### JS 帧率（JS线程）

对于大部分 React Native应用来说，我们的业务逻辑代码都是运行在 JS 线程上。更新数据到原生支持的视图是批量进行的，并且在事件循环每进行一次的时候被发送到原生端，这一步通常会在一帧时间结束之前处理完（如果一切顺利的话）。如果JavaScript线程有一帧没有及时响应，就被认为发生了一次丢帧。 例如，你在一个复杂应用的根组件上调用了this.setState，从而导致一次开销很大的子组件树的重绘，可想而知，这可能会花费200ms也就是整整12帧的丢失。此时，任何由JavaScript控制的动画都会卡住。只要卡顿超过100ms，用户就会明显的感觉到。  

这种情况经常发生在Navigator的切换过程中：当你push一个新的路由时，JavaScript需要绘制新场景所需的所有组件，以发送正确的命令给原生端去创建视图。由于切换是由JavaScript线程所控制，因此经常会占用若干帧的时间，引起一些卡顿。有的时候，组件会在componentDidMount函数中做一些额外的事情，这甚至可能会导致页面切换过程中多达一秒的卡顿。  

另一个例子是触摸事件的响应：如果你正在JavaScript线程处理一个跨越多个帧的工作，你可能会注意到`TouchableOpacity`的响应被延迟了。这是因为JavaScript线程太忙了，不能够处理主线程发送过来的原始触摸事件。结果`TouchableOpacity`就不能及时响应这些事件并命令主线程的页面去调整透明度了。  

#### UI 帧率(主线程)

很多人会注意到，NavigatorIOS的性能要比Navigator好的多。原因就是它的切换动画是完全在主线程上执行的，因此不会被JavaScript线程上的掉帧所影响。  

同样，当JavaScript线程卡住的时候，你仍然可以欢快的上下滚动`ScrollView`，因为`ScrollView`运行在主线程之上（尽管滚动事件会被分发到JS线程，但是接收这些事件对于滚动这个动作来说并不必要）。  

### 3.2 常见的性能问题来源

#### 在开发模式先运行（dev=true）

JavaScript线程的性能在开发模式下是很糟糕的。这是不可避免的，因为有许多工作需要在运行的时候去做，譬如使你获得良好的警告和错误信息，又比如验证属性类型（propTypes）以及产生各种其他的警告。  

#### 使用 `console.log`

在打包好的 app 上运行时，这样的声明会在JS线程中造成大的瓶颈。  

#### ListView初始化渲染太慢以及列表过长时滚动性能太差

这时可能需要使用新的 `FlatList` 或者 `SectionList` 组件。除了简化的API，
新的列表组件具有显着的性能增强，主要的是任何行数的内存使用量几乎不变。  

#### 在重绘一个几乎没有什么变化的页面时，JS帧率严重降低

如果是正在使用 ListView, 必须提供一个 `rowHasChanged` 函数来通过迅速确定一行是否需要
重新渲染来减少大量的工作。  

类似的，可以使用 `shouldComponentUpdate` 来指定一些场景下组件不需要重新渲染。  

#### 由于在JavaScript线程中同时做很多事情，导致JS线程掉帧

Animated的接口一般会在JavaScript线程中计算出所需要的每一个关键帧，而LayoutAnimation则利用了Core Animation，使动画不会被JS线程和主线程的掉帧所影响。  

#### 在屏幕上移动视图（滚动，切换，旋转）时，UI线程掉帧

当具有透明背景的文本位于一张图片上时，或者在每帧重绘视图时需要用到透明合成的任何其他情况下，这种现象尤为明显。设置shouldRasterizeIOS或者renderToHardwareTextureAndroid属性可以显著改善这一现象。 注意不要过度使用该特性，否则你的内存使用量将会飞涨。在使用时，要评估你的性能和内存使用情况。如果你没有需要移动这个视图的需求，请关闭这一属性。  


#### 使用动画改变图片的尺寸时，UI线程掉帧

在iOS上，每次调整Image组件的宽度或者高度，都需要重新裁剪和缩放原始图片。这个操作开销会非常大，尤其是大的图片。比起直接修改尺寸，更好的方案是使用transform: [{scale}]的样式属性来改变尺寸。比如当你点击一个图片，要将它放大到全屏的时候，就可以使用这个属性。  

#### Touchable系列组件不能很好的响应

有些时候，如果我们有一项操作与点击事件所带来的透明度改变或者高亮效果发生在同一帧中，那么有可能在onPress函数结束之前我们都看不到这些效果。比如在onPress执行了一个setState的操作，这个操作需要大量计算工作并且导致了掉帧。对此的一个解决方案是将onPress处理函数中的操作封装到requestAnimationFrame中.  
