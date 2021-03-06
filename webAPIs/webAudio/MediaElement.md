# HTMLMediaElement

## 1. 题外话

媒体元素加载的时候可能都是范围请求，服务器可能用206 Partial Content 响应，之后这个HTTP响应可能会一直
持续到文件下载完成，不过如果我们播放时进行跳的播放，可能之前的链接会被关闭吧，然后发送新的范围请求，
请求的位置就不一样了。   

## 2. HTMLMediaElement

HTMLVideoElement 及 HTMLAudioElement 继承了 HTMLMediaElement 接口。    

## 3. 属性

### 3.1 audioTracks   

只读属性。返回一个 `AudioTrackList` 对象。   

返回的结果是实时的 *live*，意味着其内容是动态变化的。    

音轨，好像就是左声道右声道这种东西。    

AudioTrackList 的属性，`length, onaddtrack, onchange, onremovetrack`。     

方法 `getTrackById(id)`。   

对 `AudioTrack` 对象最常见的用法是切换其 `enabled` 属性来静音或者播放这条音轨。   

属性：   

- enabled
- id(Read Only)
- kind(Read Only)
  + alternative
  + descriptions
  + main
  + main-desc
  + translation
  + commentary
- label(Read Only)
- language(Read Only)
- sourceBuffer(Read Only)

### 3.2 autoplay   

对应于 autoplay HTML 属性。布尔值属性。    

### 3.3 buffered

只读属性。返回一个新的 TimeRanges 对象表明浏览器此刻缓存的媒体资源的时间范围。    

### 3.4 controller

安排给元素的一个 MediaController 对象。没有安排的话就为 null。默认为null。   

### 3.5 controls

对应于 controls HTML 属性。布尔值属性。   

### 3.6 controlsList

只读属性。返回一个 DOMTokenList 对象，可以获取到哪些控制组件没被显示，列表中的值可以包含
`nodownload`, `nofullscreen`, `noremoteplayback`。    

### 3.7 crossOrigin

没什么好说的吧，应该是个枚举属性值，字符串。    

### 3.8 currentSrc   

只读属性。一个绝对的 URL 地址，代表当前选中的资源的位置。不过当 `networkState` 属性为 EMPTY 时
为空串。    

### 3.9 currentTime   

以秒为单位。当前的播放时间。    

### 3.10 defaultMuted   

对应于 muted 属性，表明默认情况下是否静音。不过这个属性没有动态效果，也就是说只代表默认的效果，
但是修改它并没什么效果吧，貌似可能只有在视频播放前的阶段修改有效果，如果想要修改还是使用 `muted` 属性。    

### 3.11 defaultPlaybackRate

默认的播放速率吧，1就是正常速度，小于1就慢了呗，MDN上说0.0是无效值会抛出异常，但测验时没什么问题，不过
修改这个速率也没什么效果。想要修改速率应该是使用下面的 `playbackRate`。    

### 3.12 disableRemotePlayback  

布尔值属性，决定是否媒体元素允许有一个远程播放的UI。暂不清楚这个UI是什么意思。   

### 3.13 duration

只读。以秒为单位的媒体的长度。如果媒体数据可用但是长度未知，值就是NaN，如果媒体是流，没有预定义的长度，
只是 Inf(Infinity?)。   

### 3.14 ended

只读。是否结束播放。如果媒体是 MediaStream，如果流的 active 属性为 false，值就为 true。如果循环播放完了，又开始播放，属性就为 false了。   

### 3.15 error   

只读。MediaError 对象，或者在没错时为 null。   

### 3.16 loop

布尔值属性。   

### 3.17 mediaGroup

对应于 mediagroup HTML 属性，元素所属 group 的名字，一组媒体元素共享 controller。不用说，不知道什么东西。   

### 3.18 mediaKeys  

只读。返回一个 MediaKeys 对象或 null。待补充。   

### 3.19 muted

布尔值属性。

### 3.20 networkState

只读。表示通过网络获取媒体资源的当前状态。数值型。可能的值有：   

+ 0-NETWORK_EMPTY: 还没有数据。
+ 1-NETWORK_IDLE: 元素是active的，并且已经选择了一个资源，不过还没有使用网络。
+ 2-NETWORK_LOADING: 浏览器在下载元素数据。
+ 3-NETWORK_NO_SOURCE: 没有正确的 src 被找到

### 3.21 paused

只读。

### 3.22 playbackRate

播放速率吧，这里MDN上说负值可能倒退播放，但是测验时没有效果。

### 3.23 played   

只读。返回一个 TimeRanges 对象，包含浏览器已经播放的范围。  

### 3.24 preload

对应于 preload HTML 属性，枚举属性吧，'auto', 'metadata', 'none', ''。none 表示元素不应该预加载，auto 表示整个元素文件应该被下载，空字符串等同于 auto。

### 3.25 readyState

只读：  

+ 0-HAVE_NOTHING
+ 1-HAVE_METADATA
+ 2-HAVE_CURRENT_DATA
+ 3-HAVE_FUTURE_DATA
+ 4-HAVE_ENOUGH_DATA

### 3.26 seekable

只读。返回一个 TimeRanges 对象，包含用户可以跳播的部分吧。   

### 3.27 seeking

只读。返回一个布尔值，表示是否媒体正在跳到新的位置。  

### 3.28 sinkId

只读。待补充

### 3.29 src

对应于 src HTML 属性。注意使用的媒体资源的 URL 地址。

### 3.30 srcObject

返回一个对象，通常是与元素相关的媒体源，通常是个 MediaStream 对象，但也可以是 MediaSource, Blob, File 对象。     

### 3.31 textTracks

只读。返回元素包含的 TextTrack 对象组成的列表。    

### 3.32 videoTracks

只读。返回元素包含的 VideoTrack 对象组成的列表。   

### 3.33 volume   

从0.0到1.0。    

## 4. 方法

### 4.1 addTextTrack()   

给元素添加一个 text track。   

### 4.2 captureStream()

返回一个 MediaStream 对象，捕获了媒体内容的流。   

### 4.3 canPlayType(mediaType)   

是否支持播放指定的类型。

+ mediaType: 一个指定MIME类型的字符串。
+ 返回一个字符串，可能的值有：   
  - 'probably': 似乎可播放。。。什么鬼
  - 'maybe': 在播放前无法确定是否能播放
  - '': 不能播放

### 4.4 fastSeek(time)   

直接跳转到指定的位置时间吧。    

### 4.5 load()

待补充。    

### 4.6 pause()

暂停播放。

### 4.7 play()

尝试开始播放。返回一个 Promise。如果成功开始播放就是 fulfilled，如果由于一些问题播放失败，就是 rejected。

### 4.8 seekToNextFrame()

### 4.9 setMediaKeys()

### 4.10 setSinkId()


## 5. HTMLVideoElement

## 6. 属性

## 6.1 height

MDN上说返回的是字符串。测验时是 number 类型。以 number 为准。

### 6.2 poster

对应于 poster 属性。一个绝对的 URL 字符串地址。   

### 6.3 videoHeight

只读。返回元素文件本身的高度吧。   

### 6.4 videoWidth

同上，宽度。    

### 6.5 width

同 height，宽度。    

## 7. 方法

### 7.1 getVideoPlaybackQuality()

创建并返回一个 VideoPlaybackQuality 对象。

## 8. HTMLAudioElement

这个的话可能没什么独立的属性与方法。    

## Media Events

| 事件名 | 描述 |
| :------------- | :------------- |
| abort  | Sent when playback is aborted; for example, if the media is playing and is restarted from the beginning, this event is sent. |
| canplay | 当可以播放的媒体获取足够的数据时触发，最少包含一部分帧。这个事件对应于 HAVE_ENOUGN_DATA readyState |
| canplaythrough | 当 ready state 变为 CAN_PLAY_THROUGH 时触发（然而 readyState 属性里面没有这个值啊），表明假设下载速率都维持在当前水平的话，可以在不中断的情况下完整播放媒体文件。MDN上说当播放当暂停与播放状态切换时也会触发，不过实验时并没有。|
| durationchange | 当元数据加载完成或者改变时触发，表示媒体的时间发生了变化。|
| emptied | 媒体变为空时触发，例如，当媒体已经加载，然后调用 load() 方法重新加载时。|
| encrypted | 用户代理在媒体数据中遇到了初始化数据？|
| ended | 播放完成时 |
| error | |
| interruptbegin | 在 Fifefox OS 设备上当音频播放中断时触发，可能是因为应用进入后台，或者是因为另一个更高优先级的音频开始播放。|
| interruptend | 同上，当上面中断的音频重新播放时触发 |
| loadeddata | 当媒体的第一帧加载完成时触发 |
| loadedmetadata | 当元数据加载时触发 |
| loadstart | 当开始加载媒体时 |
| pause | 暂停时 |
| play | 当媒体从暂停后恢复播放时触发 |
| playing | 开始播放时，不管是第一次播放，还是暂停后恢复播放，还是循环播放 |
| progress | 下载媒体时周期触发 |
| ratechange | 速率变化时触发 |
| seeked | 跳转操作完成时 |
| seeking | 跳转开始时 |
| stalled | 用户代理尝试获取媒体数据时，确未能获取到时 |
| suspend | 当加载媒体暂停时触发，可能由于下载完成或者其他原因暂停 |
| timeupdate | 元素的 currentTime 改变时触发 |
| volumechange | 注意当修改 muted 属性时也会触发 |
| waiting | 当所请求的操作（诸如播放）被延迟时触发，等待另一操作的完成（诸如寻找）。 |
