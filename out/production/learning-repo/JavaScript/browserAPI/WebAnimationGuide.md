# Web Animations Guides

## Using the Web Animations API

Web Animations API 可以让我们使用 JavaScript 来构建动画并控制它们的播放。    

### Meet the Web Animations API

这个 API 被设计为 CSS Animation 和 Transition 的基础实现，并且为将来可能实现的动画效果
预留了位置。这是在 Web 上实现动画最高效的方式之一，因为其可以让浏览器自己去实现动画间隔的优化。
使用 Web Animations API，我们可以把交互式的动画从样式表中移到 JavaScript 中，从而实现表现
与行为的分离。     

### Writing CSS Animations with the Web Animations API

#### The CSS version

完整版本：[code on Codepen](https://codepen.io/rachelnabors/pen/QyOqqW)   

![cssVersion](https://mdn.mozillademos.org/files/13843/tumbling-alice_optimized.gif)     

注意上面的例子中包含背景的移动，Alice 旋转，以及旋转时颜色的变化。我们目前只关注 Alice 的
选项，下面是简化版本的 CSS 动画：    

```css
#alice {
  animation: aliceTumbling infinite 3s linear;
}

@keyframes aliceTumbling {
  0% {
    color: #000;
    transform: rotate(0) translate3D(-50%, -50%, 0);    
  }
  30% {
    color: #431236;
  }
  100% {
    color: #000;
    transform: rotate(360deg) translate3D(-50%, -50%, 0);
  }
}
```    

#### Moving it to JavaScript

现在让我们试试用 Web Animations API 实现同样的效果。   

第一步我们需要创建一个与 CSS 中 \@keyframes 块对应的 `Keyframe` 对象：   

```js
var aliceTumbling = [
  { transform: 'rotate(0) translate3D(-50%, -50%, 0)', color: '#000' },
  { color: '#431236', offset: 0.3},
  { transform: 'rotate(360deg) translate3D(-50%, -50%, 0)', color: '#000' }
];
```   

这里我们使用的是一个包含多个对象的数组。每个对象代表 CSS 中的一个关键帧。然而与 CSS 不同的
是，Web Animations API 不需要明确指定动画中每个关键帧出现时的百分比时间。它会基于我们给定的
关键帧的数量自动将动画划分为相等的几部分。这意味着带有3个关键帧的 Keyframe 对象会在动画50%
的地方播放中间的那个帧。    

当我们想要明确的设置某个帧相对于其他帧的偏移时间的话，我们可以直接在对象中设置一个偏移量，使用逗号
与声明隔开。上面的例子中，为了确保 Alice 的颜色变化是在 30% 而不是 50% 处，我们设置了一个
`offset: 0.3`。   

必须至少设置了两个关键帧（分别代表动画队列的开始和结束状态）。如果关键帧列表只有一个入口点，
`Element.animate()` 会抛出错误。    

我们还需要创建一个与 CSS animation 对应的时间属性的对象（`AnimationsEffectTimingProperties`）   

```js
var aliceTiming = {
  duration: 3000,
  iterations: Infinity
}
```    

需要注意的是与 CSS 中的不同的两个点：   

+ 第一点是持续时间只接受毫秒形式的时间
+ 第二点是动画的次数是 `iterations`，而不是 `iteration-count`。注意值也从 infinite 变为
JS 的 Infinity。       


现在，我们就可以将上面的两个对象传入 `Element.animate()` 方法了：   

```js
document.getElementById("alice").animate(
  aliceTumbling,
  aliceTiming
)
```   

`animate()` 方法可以在任意可以使用 CSS 动画的DOM 元素上调用。除了上面的写法，还有其他的写法，
例如如果我们只想设置动画的持续时间，可以直接在第二个参数处传入：   

```js
document.getElementById("alice").animate(
  [
    { transform: 'rotate(0) translate3D(-50%, -50%, 0)', color: '#000' },
    { color: '#431236', offset: 0.3},
    { transform: 'rotate(360deg) translate3D(-50%, -50%, 0)', color: '#000' }
  ], 3000);
```    

### Controlling playback with play(), pause(), reverse() and playbackRate

当我们使用 Web Animations API 实现 CSS 动画的时候，操作动画的播放时非常方便的。这个 API
提供了几种非常有用的控制播放的方法。    

#### Pausing and playing animations

```js
var nommingCake = document.getElementById('eat-me_sprite').animate(
[
  { transform: 'translateY(0)' },
  { transform: 'translateY(-80%)' }   
], {
  fill: 'forwards',
  easing: 'steps(4, end)',
  duration: aliceChange.effect.timing.duration / 2
});
```   

`animate()` 方法会在调用后立刻开始执行动画。如果我们希望通过一些交互才开始执行动画的话，
可以在 `Animation` 对象定义后立刻调用 `Animation.pause()`：   

`nommingCake.pause();`   

现在我们就可以在我们想让动画开始的地方调用 `Animation.play()` 来启动动画：   

`nommingCake.play();`    

#### Other useful methods

除了暂停和播放，还有以下的动画方法：   

+ `Animation.finish()` 直接跳到动画的结尾
+ `Animation.cancel()` 取消动画并移除动画效果
+ `Animation.reverse()` 设置动画的播放速率 `Animation.playbackRate` 为一个负值，异步动画向
后播放。    

### Callbacks and promises

CSS Animation 和 Transition 有他们自己的事件监听器，Web Animations API 同样也有：   

+ `onfinish` 是 `finish` 事件的监听器，并且可以手动调用 `finish()` 触发
+ `oncancel` 是 `cancel` 事件的监听器，可以手动调用 `cancel()` 触发。    
