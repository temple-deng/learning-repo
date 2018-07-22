# Web Animations API

目录：   

+ [Animation](#animation)   
+ [Element.animate()](#animate)

## Animation   

<a name="animation"></a>   

Animation 接口代表了一个独立的动画播放器，为一个动画资源提供了播放控制及时间线。    

### 构造函数

`var animation = new Animation([effect][, timeline]);`   

+ `effect`: 可选参数。设置动画的目标效果的 `AnimationEffectReadOnly` 对象。当前可用的
效果只有 `KeyframeEffect`，未来可能加入 SequenceEffects or GroupEffects 等效果。设置
为 `null` 表示动画不应用任何的效果。  
+ `timeline`: 可选参数。指定与动画相关联的时间线，是一个基于 `AnimationTimeline` 接口类型
的对象。当前可用的时间线类型只有 `DocumentTimeline`，不过未来可能加入例如与手势和滚动相关的
时间线。默认值是 `Document.timeline`。   

### 属性

#### Animation.currentTime

返回或者设置动画的当前时间值，以毫秒的形式。注意这个类似于动画从 `startTime` 开始已经播放
的时间，所以也会产生例如在 `startTime` 时间前访问这个属性的话会返回负值。        

如果动画缺少 timeline，或者是不活动的，或者还没开始播放，`currentTime` 返回 `null`。     

注意文档上说设置为 `null` 可以让动画变为不活动的，但是实验时并没有效果，与设置为 `0` 类似。    

还有啊，比如说动画已经执行完成了，那么再调用例如 `play()` 方法执行的话 `currentTime` 的事件是
不会变的了，定格在执行完成的那个时间点。    

#### Animation.effect

获取或者设置动画的目标效果。可以设置为 `null` 表示没效果。    

#### Animation.finished

只读属性。返回一个 Promise，一旦动画播放完成就 resolve。   

*Note*: 每次动画变为 `finished` 播放状态（也就是说，比如说一个已经播放完成的动画，调用
`play()` 由开始播放），这个属性都会创建一个新的 Promise。    

#### Animation.id

获取或者设置一个用来鉴别动画的字符串。默认可能是空串。   

#### Animation.playState

一个枚举值。获取或者设置动画的播放状态。貌似这个属性对于 CSS Animation 和 Transition 来说是一个只读属性。    

可选值有：   

+ **idle:** 动画的当前时间是未解析的，并且也没有即将发生的任务。（不是很懂）目前知道的是当动画被取消的时候，会变为这个状态。   
+ **pending:** 动画在等待一些即将发生任务的完成。这些即将发生的任务会不会为未来的动画类型预留的啊。
+ **running:** 动画在运行中。
+ **paused:** 动画被暂停了，并且`Animation.currentTime` 也不再更新。
+ **finished:** 动画已经到达其边界之一，`Animation.currentTime` 不再更新。   

#### Animation.playbackRate

获取或者设置动画的播放速率。    

这个播放速率也是一个缩放因子，从动画的时间线时间值到动画当前时间。也就说是一个10s，播放
速率为2的动画，播放一次完成后，虽然播放时间为5s，但是在结束时的 `currentTime` 还是 10s。    

值的话是一个数字，可以是0及负值。负值会反转动画。设置为0会有一种类似暂停状态的效果。    

#### Animation.ready

只读属性。返回一个 Promise。当动画准备好播放时 resolve。每次当动画进入 `pending` 播放状态
或者当动画被取消时就创建新的 Promise。在这两种场景下，动画时准备好再一次开始播放。   

注意这个还需要以后再研究。   

#### Animation.startTime

这个属性是一个双精度浮点值。用来表明动画开始播放前的定时时间。       

一个动画的开始时间指的是当效果类型 KeyframeEffect 是定时开始播放时的在 DocumentTimeline
的时间值。可以这样理解吧，当页面打开时就有了 DocumentTimeline 开始计时，把这个开始时间设置
为 10s 相当于动画是从 DocumentTimeline 到 10s 时开始播放。注意这个与 `delay` 还是有很大
区别的，`delay` 相当于我们希望动画在需要开始播放时延迟一定的时间开始播放。而 DocumentTimeline
可以说是一个绝对值吧，一直是向前走的，也就说我们在文档以及打开100s 时，设置一个动画的 `startTime`
为 10s，那么动画会产生类似于动画是从10s 开始播放到100s 时动画所处的样子。    

#### Animation.timeline

获取或者设置与动画相关联的 timeline。一个 timeline 是一个可以实现同步目的的资源，是一个
`AnimationTimeline` 对象。默认的情况下，动画的 timeline 和文档 Document 的 timeline 是相同的。   

#### 事件监听器

+ `Animation.oncancel`: `cancel` 事件的监听器。`cancel` 事件是在手动调用 `Animation.cancel()`，
动画从其他状态进入到了 `idle` 状态时触发。     
+ `Animation.onfinish`: 当动画播放完成触发 `finish` 事件。   

注意当动画同时有 `paused` 和 `finished` 状态时，最终 `playbackRate` 会报告 `paused`。   

### 方法

#### Animation.cancel()

清除所有的 `KeyframeEffect` 效果，并中止动画的播放。当动画被取消的时候，`startTime` 和 `currentTime`
都设置为 `null`。   

注意如果动画是从 `idle` 之外的状态被取消，那么 `finished` 属性返回的 Promise 会 rejected。   

#### Animation.finish()

将当前的播放时间设置到最终的时刻，注意应该就是修改的 `currentTime` 属性。如果如果动画是倒着
播放的话，相当于设置为0。   

#### Animation.pause()

略。   

#### Animation.play()

略。注意尚不清楚有没有动画队列。因为在动画播放的过程中调用 `play()` 是没有效果的。    

## Element.animate()

<a name="animate"></a>   

`animate()` 方法是创建新的 `Animation`，并将其应用到元素上，然后开始播放动画的一种简单方法。
返回创建的 `Animation` 对象实例。    

元素上可能会应用多个动画。可以调用 `Element.getAnimations()` 获取动画列表。   

`var animation = element.animate(keyframes, options); `   

+ `keyframes`: 一个可以用来代表关键帧集合的对象的格式。这个格式稍后再说。
+ `options`: 可以是一个代表动画持续时间的整数，或者是一个包含一个或多个时间属性的对象，注意所有属性都是可选的：   
  - `id`: 一个用来唯一标识动画的字符串。
  - `delay`: 延迟动画开始的时间。默认为0
  - `direction`: 动画是向前播放`normal`，还是向后播放`reverse`，或者是在每次迭代后转换
  方向 `alternate`，又或者每次迭代后倒着转换方向 `alternate-reverse`。默认 `normal`。
  - `easing`: 接受预定义的 `linear, ease, ease-in, ease-out, ease-in-out,` 或者自定义的
  `cubic-bezier()`。默认 `linear`。
  - `endDelay`: 在动画结束后的延迟时间。这主要是在基于另一动画的结束时间对动画进行排序时使用的。默认0
  - `fill`: 类似于 CSS 的 `fill-mode`，可选值 `forwards, backwards, both, none`。默认 `none`
  - `iterationStart`: 描述动画应该在迭代中的哪个时间点开始。   
  - `iterations`: 动画重复的次数。默认1。    

注意 `options` 还有3个`composite`, `iterationComposite`,`spacing` 选项没说，主要是当前还没实现。   

### Keyframe Formats

关键帧的集合有两种格式：   

+ 第一种是一个键值对的对象，键名就是需要动画的属性，键值则是动画迭代的值的数组：   

```js
element.animate({
  opacity: [ 0, 1 ],          // [ from, to ]
  color:   [ "#fff", "#000" ] // [ from, to ]
}, 2000);
```   

+ 第二种是一个对象数组，每个元素对象都是一个关键帧，包含动画的属性及属性的值，这个也是 `getKeyframes()`
方法返回的规范的格式：   

```js
element.animate([
  { // from
    opacity: 0,
    color: "#fff"
  },
  { // to
    opacity: 1,
 ​   color: "#000"
  }
], 2000);
```    

第二种方式还可以为每一帧指定一个偏移值。另外第二种方式还可以提供 `easing` 属性来指定两帧
之间的缓动函数：   

```js
element.animate([ { opacity: 1, easing: 'ease-out' },
                  { opacity: 0.1, easing: 'ease-in' },
                  { opacity: 0 } ],
                2000);
```   

## AnimationEffectReadOnly

<a name="animationeffectreadonly"></a>   

`AnimationEffectReadOnly` 接口定义了当前及未来的动画效果，例如 `KeyframeEffect`，可以传递
给 `Animation` 对象播放动画，以及 `KeyframeEffectReadOnly`，这个的话是被 CSS Animations 和
Transitions 使用。也就是说，这个接口应该是一个类似基类的存在吧。      

### 属性

#### AnimationEffectReadOnly.timing

只读属性。返回一个 `AnimationEffectTimingReadOnly` 对象，包含了动画效果的时间属性。

### 方法

#### AnimationEffectReadOnly.getComputedTiming()

返回了这个动画效果的计算后的时间属性。    

虽然这个方法返回的对象与 `AnimationEffectReadOnly.timing` 返回的 `AnimationEffectTimingReadOnly`
对象有需要相同的属性，但是这个返回返回的属性值是有下面这些不同的：   

+ `duration`: 返回迭代持续时间的计算值。如果 `AnimationEffectTimingReadOnly.duration`
设置为 `auto`，则这个属性返回 0。
+ `fill`: `auto` 值会被合适的 `AnimationEffectTimingReadOnly.fill` 值替换。   

返回一个 `ComputedTimingProperties` 对象，包含以下的属性：   

+ `endTime`: 从动画开始播放到结束的时间。
+ `activeDuration`: 动画效果运行的时间的长度。等价于迭代的持续时间乘以迭代次数。
+ `localTime`: 
