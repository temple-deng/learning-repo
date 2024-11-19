# week41 10.4-10.10

<!-- TOC -->

- [week41 10.4-10.10](#week41-104-1010)
- [Web Animation](#web-animation)
  - [简介](#简介)
  - [概念](#概念)
  - [keyframe 的结构](#keyframe-的结构)

<!-- /TOC -->

# Web Animation

## 简介

首先第一步，创建 CSS @keyframes 对应的 Keyframe Object：   

```js
var aliceTumbling = [
  { transform: 'rotate(0) translate3D(-50%, -50%, 0)', color: '#000' },
  { color: '#431236', offset: 0.3 },
  { transform: 'rotate(360deg) translate3d(-50%, -50%, 0)', color: '#000' }
];
```    

默认情况下，各个关键帧是均匀分布的，除非我们明确设置了某个帧的 offset，在上面的例子中，我们将
动画的颜色变化设置为 30% 分位处，通过设置 `offset: 0.3`。   

目前至少需要设置两个关键帧，一个开始帧，一个结束帧，如果只有一个帧，`Element.animate()` 会
抛出异常。   

之后，我们还需要创建代表时序属性的对象。   

```js
var aliceTiming = {
  duration: 3000,
  iterations: Infinity
};
```    

这里需要注意 CSS Animation 和 Web Animation 在使用部分术语上的不同，例如，Web Animation
使用 `Infinity` 代替字符串 `'infinite'`。动效函数默认是 `linear` 而不是 CSS Animation 的
`ease`。    

最后一步，把他们组合起来：   

```js
document.getElementById('alice').animate(
  aliceTumbling,
  aliceTiming
);
```     

**播放控制**   

Web Animation 的动画播放是可以进行控制的，提供了以下的方法：    

- `Animation.pause()`
- `Animation.play()`
- `Animation.finish()`：直接跳到动画结束，显然对于无限循环的动画来说是无效的
- `Animation.cancel()`：终止动画并取消效果
- `Animation.reverse()`

`ani.playbackRate = -1` 将 `playbackRate` 设置为复制，会使动画反向运行，注意对于无限循环的
动画，反向运行会将已运行的动画反向运行一次然后停止。    

还有个 `Animation.uodatePlaybackRate()` 函数，这个还不清楚和直接设置值有什么区别。   

**获取动画的信息**    

```js
document.getAnimations().forEach(
  function (animation) {
    animation.updatePlaybackRate(animation.playbackRate * 5);
  }
);
```    

可以通过 `document.getAnimations()` 轻松获取到页面所有的动画。   

**事件回调**     

- `onfinish`
- `oncancel`    

## 概念

Web Animation API 基于两种模型，一种模型处理时间，即 Timing 模型，另一种处理随时间变化而产生
的视觉变化，即 Animation 模型。Timing 模型跟踪我们在设置的时间轴上已经走了多远。Animation
模型决定在给定的时间，动画的对象应该是什么样子。    

每个文档都有一个主时间轴 master timeline: `Document.timeline`，一个从页面加载成功延伸到
无限的时间轴。每个动画通过 `startTime` 在时间轴上锚定了一个点，标志着动画在文档时间轴上开始
播放的时间。    

Animation 模型可以看做是动画在每个时间点样子的快照组成的数组。    

web animation 将 Timeline 对象，Animation 对象，Animation Effect 对象组合了起来。   

Timeline 对象提供了一个 `currentTime` 属性，表示页面打开了的时间，目前只有一种 Timeline
对象，即文档的 `Document.timeline`。    

可以将 Animation 对象看做是一台 DVD 播放器，用来控制媒体的播放，而这里的媒体就是一个个 Animation
Effects 对象。   

目前我们只有一种 Animation Effect 对象，即 KeyframeEffect 对象。   

## keyframe 的结构

`Element.animate()`, `KeyframeEffect.KeyframeEffect()`, `KeyframeEffect.setKeyframes()`
都接受一系列关键帧格式的对象。    

目前关键帧的格式有两种，一种是关键帧组成的数组，这也是 `getKeyframes()` 返回的标准格式：  

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

每个帧都可以添加 `offset` 和 `easing` 属性。    

另一种是对象结构：   

```js
element.animate({
  opacity: [ 0, 1 ],          // [ from, to ]
  color:   [ "#fff", "#000" ] // [ from, to ]
}, 2000);
```    

注意 keyframe 中的 css 属性用驼峰式命名。有两个 css 属性比较特殊：   

- `float` 属性需要写成 `cssFloat`。
- `offset` 属性需要携程 `cssOffset`。    

然后就是 css 属性之外的三个属性：   

- offset
- easing
- composite