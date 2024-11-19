# MediaStream Recording API

MediaStream Recording API 可以让我们捕获由 MediaStream 或 HTMLMediaElement 元素
生成的数据，进行分析、处理、或存储到磁盘上。    

## 1. 基础的概念

这个 API 主要由一个接口组成 `MediaRecorder`，这个接口做了所有的工作，包括从 `MediaStream`
中获取数据，然后传递给我们进行处理。数据是通过一系列的 `dataavailable` 事件传递的。    

### 1.1 记录的流程

记录一个流的整个流程是非常简单的：    

1. 设置一个 MediaStream 或 HTMLMediaElement 元素作为媒体数据的来源
2. 绑定 `MediaRecorder.ondataavailable` 事件，当有数据可用时会触发这个事件
3. 创建一个 `MediaRecorder` 对象，指定流的源及配置项
4. 当媒体源进行播放，并播放到我们想要开始记录的点时，调用 `MediaRerder.start()` 开始记录
5. 当有数据可用时，`dataavailable` 事件会不停的调用，事件有一个 `data` 属性，是 Blob 类型，
包含了媒体数据。
6. 当媒体源停止播放时记录行为会自动停止。
7. 也可以随时调用 `MediaRecorder.stop()` 方法停止记录。     

### 1.2 检查并控制记录状态

同时，还可以通过 `MediaRecorder` 对象的属性来判断记录过程的状态，并使用 `pause()` 和 `resume()`
方法来暂停和恢复记录。     

如果想要检查指定的 MIME 类型是否支持，调用 `MediaRecorder.isTypeSupported()`。    

### 1.3 检查潜在的输入源

如果我们的目标是记录相机和/或麦克风输入，我们可能需要在构建 `MediaRecorder` 前先检查输入设备
是否可用。调用 `navigator.mediaDevices.enumerateDevices()` 获取可用媒体设备列表。