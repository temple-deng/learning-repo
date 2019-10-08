# Audio 元素

<!-- TOC -->

- [Audio 元素](#audio-元素)
  - [1. 属性](#1-属性)
  - [2. 事件](#2-事件)
  - [3. 检测 track 的添加和移除](#3-检测-track-的添加和移除)

<!-- /TOC -->

## 1. 属性

- autoplay
- controls
- crossorigin: 枚举属性，表明是否使用 CORS 的方式获取相关音频文件，允许的值有：
  + anonymous: 发送一个跨域请求但不携带 cookie 证书等。
  + use-credentials: 发送一个带有证书的跨域请求。
  + 如果没设置这个属性，默认不使用跨域请求请求资源
- currentTime: 读取 currentTime 会返回一个双进度浮点数，以秒为单位。
- disableRemotePlayback: 布尔属性，用于禁用使用有线（HDMI，DVI等）和无线技术（Miracast，Chromecast，DLNA，AirPlay等）连接的设备中的远程播放功能。
- duration(Read Only): 双精度浮点数，以秒为单位，如果媒体不可用，返回 NaN。如果媒体没有明确的
结尾，则是 +Infinity。
- loop
- muted
- preload: 枚举属性
  + none: 资源不应该预加载
  + metadata: 仅预加载元数据
  + auto: 整个音频文件可以预加载
  + 空字符串：等同于 auto
- src

## 2. 事件

- canplay: 浏览器可以播放媒体，但是估计加载的数据不够，无法在不暂停的缓冲更多数据的情况下播到最后
- canplaythrough: 浏览器估计可以在不暂停的情况下播到最后
- complete: OfflineAudioContext 接口在 offline audio context 渲染完成时触发 complete
- durationchange: duration 属性更新
- emptied: 当媒体为空时调用，例如，当媒体已经加载，但是调用 `load()` 方法重载了媒体就会触发这个事件
- ended:
- loadeddata: 当前播放位置的帧数据已经加载完成，通常是第一帧
- loadedmetadata
- pause
- play
- playing
- ratechange
- seeked: 当一个 seek 操作完成，当前播放进度已经改变，seeking 属性已经被修改为 false 时触发
- seeking: seek 操作开始
- stalled: 浏览器尝试获取数据，但数据不可用的时候
- suspend: 媒体数据加载已停止
- timeupdate
- volumechange
- waiting

## 3. 检测 track 的添加和移除

使用 `addtrack` 和 `removetrack` 事件可以检测 audio 元素中 track 的添加和删除。不过这些事件
不是直接发送给 audio 元素本身，而是发送给 audio 元素中的 track list 对象。    

- HTMLMediaElement.audioTracks: 一个 AudioTrackList 对象，包含所有媒体元素的 audio tracka
- HTMLMediaElement.videoTracks
- HTMLMediaElement.textTracks

