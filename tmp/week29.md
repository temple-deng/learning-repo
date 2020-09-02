# week29 7.18-7.29

> 摘自 https://www.zhangxinxu.com/wordpress/

<!-- TOC -->

- [week29 7.18-7.29](#week29-718-729)
  - [touch](#touch)
  - [overscroll-behavior](#overscroll-behavior)
  - [favicon](#favicon)
  - [Media Source Extensions API](#media-source-extensions-api)
    - [MediaSource 对象](#mediasource-对象)
  - [SourceBuffer](#sourcebuffer)
  - [其他视频的一些知识](#其他视频的一些知识)
  - [视频编码格式](#视频编码格式)

<!-- /TOC -->

## touch

只有当两个指头同时触摸屏幕的时候，才能在touchstart事件中被识别为双指操作。     

因此，双指事件的判断需要在touchmove事件中才行。    

```css
html {
    touch-action: none;
}
```    

支持的关键字有：    

```css
touch-action: auto | none | pan-x | pan-left | pan-right | pan-y | pan-up | pan-down | pinch-zoom | manipulation;
```    

- `auto` 表示手势操作完全由浏览器自己决定
- `manipulation`: 表示浏览器只允许滚动和持续缩放操作，类似双击缩放这种非标准操作就不可以。想当初，click事件在移动端有个300ms延时，就是因为避免和手机双击行为发生冲突。然而，当我们设置了`touch-action:manipulation`干掉了双击行为，则显然，300ms延时就不复存在，因此，下面的CSS声明可以用来避免浏览器300ms延时问题。    

上面2个关键字属性值（auto和manipulation）是Safari唯一支持的两个touch-action属性值。    

- `none` 表示不进行任何 touch 相关默认行为，例如你想用手指滚动网页就不行，双击放大缩小页面也不可以，所有这些行为要自定义。
- `pan-x` 表示手指头可以水平移来移去
- `pan-left` 可以左移，移动开始后还是可以往右恢复
- `pan-right`
- `pan-y`
- `pan-up`
- `pan-down`
- `pan-zoom` 表示可以用手指缩放页面    

部分关键字可以组合使用：   

```css
.example {
  touch-action: pan-left pan-up pan-zoom;
}
```     

## overscroll-behavior

在默认情况下，里面的滚动条滚到到底部边缘然后再继续滚动的时候，父滚动条会继续跟着滚动。这种行为叫做滚动链。    

`overscroll-behavior` 用来设置浏览器滚动到一个滚动区域的边缘时的行为。这是个缩写属性，`overscroll-behavior-x`, `overscroll-behavior-y`。    

值有 `auto`, `none`, `contain` 以及其他的全局可用值。    

- `auto` 目前的行为，滚动到边缘后滚动外面的元素
- `contain`: 不会滚动外面的元素，默认的滚动溢出行为只会表现在当前元素的内部（例如 bounce 或者拖动刷新）
- `none`: 外面的元素不会滚动，里面的默认行为也会阻止。    

## favicon

ICO格式的图片和PNG格式图片是不一样的，PNG图片就是一张单独的图片，但是作为Favicon的ICO格式图片应该是一组16×16、32×32和48×48图像集合。所以，一张PNG图标格式转换成ICO格式后尺寸会大很多，是因为这个ICO图标包含了多个尺寸。    

## Media Source Extensions API

MSE 提供了播放流媒体的能力，使用 MSE，可以使用 JS 创建媒体流，然后交给 audio 或 video 元素
播放。    

MSE 可以让我们将目前单一的媒体轨 `src` 属性替换成一个 `MediaSource` 对象的引用。`MediaSource`
对象是一个保存待播放媒体信息的容器，并且保存了组成整个媒体流的多个分块`SourceBuffer`对象的引用。   

### MediaSource 对象

属性：    

- `sourceBuffers`: 只读，返回一个 `SourceBufferList` 对象，包含了与 `MediaSource` 对象
关联的 `SourceBuffer` 对象组成的列表
- `activeSourceBuffers`: 只读，还是返回一个 `SourceBufferList`，是上面那个属性对象的子集组成
的列表，包含了当前使用的视频轨、音轨、字幕轨。
- `readyState`: 只读，当前 MediaSource 的状态，有三种可能的状态
  + `closed`: source 当前并没有绑定到媒体元素上
  + `open`: source 绑定到了媒体元素上，并且准备接收 `SourceBuffer` 对象
  + `ended`: source 绑定到了媒体元素上，但是流已经被 `MediaSource.endOfStream()` 方法终止了
- `duration`: 获取或设置时长

事件handler:   

- `onsourceclose`
- `onsourceended`
- `onsourceopen`

方法：    

- `addSourceBuffer()`: 创建一个给定 MIME 类型的 `SourceBuffer` 对象，并添加到 `sourceBuffers`
列表中。      

```js
var sourceBuffer = mediaSource.addSourceBuffer(mimeType)
```     

- `clearLiveSeekableRange()`: 清除之前使用 `setLiveSeekableRange()` 设置的播放区域
- `endOfStream()`: 表示流的关闭
- `removeSourceBuffer(sourceBuffed)`
- `setLiveSeekableRange(start, end)`    

静态方法：    

- `isTypeSupported(mimeType)` 返回一个布尔值，表示当前浏览器是否支持编码

例子：    

```js
var video = document.querySelector('video');

var assetURL = 'frag_bunny.mp4';
// Need to be specific for Blink regarding codecs
// ./mp4info frag_bunny.mp4 | grep Codec
var mimeCodec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';

if ('MediaSource' in window && MediaSource.isTypeSupported(mimeCodec)) {
  var mediaSource = new MediaSource();
  //console.log(mediaSource.readyState); // closed
  video.src = URL.createObjectURL(mediaSource);
  mediaSource.addEventListener('sourceopen', sourceOpen);
} else {
  console.error('Unsupported MIME type or codec: ', mimeCodec);
}

function sourceOpen (_) {
  //console.log(this.readyState); // open
  var mediaSource = this;
  var sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
  fetchAB(assetURL, function (buf) {
    sourceBuffer.addEventListener('updateend', function (_) {
      mediaSource.endOfStream();
      video.play();
      //console.log(mediaSource.readyState); // ended
    });
    sourceBuffer.appendBuffer(buf);
  });
};

function fetchAB (url, cb) {
  console.log(url);
  var xhr = new XMLHttpRequest;
  xhr.open('get', url);
  xhr.responseType = 'arraybuffer';
  xhr.onload = function () {
    cb(xhr.response);
  };
  xhr.send();
};
```    

## SourceBuffer

SourceBuffer 接口代表一个媒体块。     

属性：    

- `appendWindowEnd`

略。    

## 其他视频的一些知识

1. 文件格式/封装格式/容器格式：一种承载视频的格式，比如flv、avi、mpg、vob、mov、mp4等。
而视频是用什么方式进行编解码的，则与Codec相关。举个栗子，MP4格式根据编解码的不同，又分为nMP4、
fMP4。nMP4是由嵌套的Boxes 组成，fMP4格式则是由一系列的片段组成，因此只有后者不需要加载整个
文件进行播放。
2. Codec：多媒体数字信号编码解码器，能够对音视频进行压缩（CO）与解压缩( DEC ) 。
CODEC技术能有效减少数字存储占用的空间，在计算机系统中，使用硬件完成CODEC可以节省CPU的资源，
提高系统的运行效率。
3. 常用视频编码：MPEG、H264、RealVideo、WMV、QuickTime。。。
4. 常用音频编码：PCM、WAV、OGG、APE、AAC、MP3、Vorbis、Opus。。。

HLS 协议必须是H264+AAC编码，因为传输的是切割后的音视频片段，导致内容延时较大。     

flv.js Bilibli开源，解析flv数据，通过MSE封装成fMP4喂给video标签，编码为H264+AAC，
使用HTTP的流式IO(fetch或stream)或WebSocket协议流式的传输媒体内容，2~5秒的延迟，首帧比RTMP更快。   

## 视频编码格式

目前视频流传输中最为重要的编解码标准有国际电联的H.264，运动静止图像专家组的M-JPEG和国际标准化
组织运动图像专家组的MPEG系列标准，此外在互联网上被广泛应用的还有Real-Networks的RealVideo、
微软公司的WMV以及Apple公司的 QuickTime等，到目前google力推的WebM格式都收到了我们的关注。    

国际标准化组织（ISO）制定的标准主要集中在MPEG系列。也就是由动态的图像专家组制定的一系列的标准。

由ISO下属的MPEG运动图象专家组开发视频编码方面主要是Mpeg1（vcd用的就是它）、Mpeg2（DVD使用）、
Mpeg4（现在的DVDRIP使用的都是它的变种，如：divx，xvid等）、Mpeg4 AVC（现在正热门也就是H.264）。    

H.264 是由ITU-T 的VCEG（视频编码专家组）和ISO/IEC 的MPEG（活动图像编码专家组）联合组建的
联合视频组提出的一个新的数字视频编码标准，它既是ITU-T 的H.264，又是ISO/IEC 的MPEG-4 的第10
部分。而国内业界通常所说的MPEG-4 是MPEG-4 的第2 部分。即：    

H.264=MPEG-4（第十部分，也叫ISO/IEC 14496-10）=MPEG-4 AVC    

因此，不论是MPEG-4 AVC、MPEG-4 Part 10，还是ISO/IEC 14496-10，都是指H.264。H.264也是
MPEG-4的一部分。    