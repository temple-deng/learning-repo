# Video and Audio

## Audio and Video Delivery

### The Audio and Video Elements

 无论我们是正在处理预编码的音频文件还是实时的流，使其可用的机制都是通过浏览器的 `<audio>`
 和`<video>` 元素。当前来说，为了支持所有的浏览器，我们需要指定两种格式，尽管 Firefox 和
 Opera 采用 MP3 及 MP4，但是这种格式正在快速变化。可以在下面的地方找到相关的适配信息：   

 + [Audio Codec Compatibility Table](https://developer.mozilla.org/en-US/Apps/Fundamentals/Audio_and_video_delivery/Cross-browser_audio_basics#Basic_Audio_example)
 + [Audio/Video Codec Compatibility Table](https://developer.mozilla.org/en-US/docs/Web/HTML/Supported_media_formats#Browser_compatibility)    

 ```javascript
 var myAudio = document.createElement('audio');

if (myAudio.canPlayType('audio/mpeg')) {
  myAudio.setAttribute('src','audiofile.mp3');
} else if (myAudio.canPlayType('audio/ogg')) {
  myAudio.setAttribute('src','audiofile.ogg');
}

myAudio.currentTime = 5;
myAudio.play();
```   

上面的代码中我们根据浏览器支持的音频格式来设置文件源，然后将播放头设置5秒钟并尝试播放。   

还可以为&lt;audio&gt;元素提供一个base64编码的WAV文件，从而即时生成音频。     

`<audio id="player" src="data:audio/x-wav;base64,UklGRvC..."></audio>`    

### Web Audio API

```javascript
var context;
  var request;
  var source;

  try {
    context = new AudioContext();
    request = new XMLHttpRequest();
    request.open("GET","http://jplayer.org/audio/mp3/RioMez-01-Sleep_together.mp3",true);
    request.responseType = "arraybuffer";

    request.onload = function() {
      context.decodeAudioData(request.response, function(buffer) {
        source = context.createBufferSource();  
        source.buffer = buffer;
        source.connect(context.destination);
        // auto play
        source.start(0); // start was previously noteOn
      });
    };

    request.send();

  } catch(e) {
    alert('web audio api not supported');
  }
```    

### getUserMedia / Stream API

我们也可以使用 getUserMedia 和 Stream API 从网络摄像头或者麦克风中获取实时流。这是WebRTC技术的
一部分，最新版本的 Chorme, FF, Opera 都已支持。     

为了从摄像头获取流，首先设置&lt;video&gt;元素：   

`<video id="webcam" width="480" height="360"></video>`   

之后，如果支持的话将摄像头连接到video元素：   

```javascript
if (navigator.mediaDevices) {
  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
  .then(function onSuccess(stream) {
    var video = document.getElementById('webcam');
    video.autoplay = true;
    video.srcObject = stream;
  })
  .catch(function onError() {
    alert('There has been a problem retreiving the streams - are you running on file:/// or did you disallow access?');
  });
} else {
  alert('getUserMedia is not supported in this browser.');
}
```    

### 定制媒体播放器

通常来说想要定制播放器的外观的话，会省略 `controls` 属性以便隐藏默认的控制条，然后使用HTML和CSS制定
样式，使用JS连接控制操作到API。    

我们甚至可以添加一些在默认播放控制中不存在的特征，例如播放速率调整，视频质量的切换。    

## video 和 audio 元素

子元素的限制：如果元素本身有 src 属性的话，那么其只能包含零或多个 &lt;track&gt; 子元素，这些
子元素的后面可以跟一些非媒体元素的内容来做回退的显示。如果其本身没有 src 属性，就可以包含零或多个
&lt;source&gt; 元素，后面还可以跟零或多个&lt;track&gt;元素，以及非媒体元素的回退内容。    

属性：   

+ autoplay: 布尔值属性；元素会自动开始播放，而不用等待数据的加载完成。    

+ buffered: 决定缓存媒体的时间范围的属性。这个属性包含一个 TimeRanges 对象。   

+ controls: 应该也是布尔值属性，如果存在，浏览器会提供控制条，包括声音，查找，暂停和恢复播放功能。   

+ crossOrigin(video only): 枚举属性，表明是否使用CORS来获取相关的图片（貌似主要和canvas有关）。可选的值有：   
  - anonymous: 发送不带验证内容的跨域请求。
  - use-credentials: 发送带有验证内容的跨域请求。    
当这个属性不存在的时候，就不是用CORS请求来获取资源。    


+ height(video only)  

+ loop: 布尔值属性，循环播放呗。   

+ muted: 布尔值属性，是否静音呗。   

+ played: 一个 TimeRanges 对象，指定元素已经播放的所有范围。    

+ preload: 枚举属性。可能有下列值：   
  - none: 表明元素不应该预加载。
  - metadata: 表明只获取元素的元数据（例如length）
  - auto: 表明元素整个文件都应该下载，即使用户不希望这样做
  - 空字符串：和 auto 值等价   

如果没有设置这个属性，默认值是由浏览器指定的。autoplay的优先级要高于这个属性。    

+ poster(video only): 一个URL地址，用来在用户播放或者查找视频时展示给用户看的图片。如果没有
设置这个属性，在第一帧可用前不会显示任何东西，之后第一帧会用来当做这个图片。   

+ src   

+ width(video only)   

+ volume(audio only): 声音大小吧，从0.0到1.0。    

## 创建一个跨浏览器的视频播放器

![](https://mdn.mozillademos.org/files/7319/video-player-example.png)   

### HTML 部分

```HTML
<figure id="videoContainer">
   <video id="video" controls preload="metadata" poster="img/poster.jpg">
      <source src="video/tears-of-steel-battle-clip-medium.mp4" type="video/mp4">
      <source src="video/tears-of-steel-battle-clip-medium.webm" type="video/webm">
      <source src="video/tears-of-steel-battle-clip-medium.ogg" type="video/ogg">
      <!-- Flash fallback -->
      <object type="application/x-shockwave-flash" data="flash-player.swf?videoUrl=video/tears-of-steel-battle-clip-medium.mp4" width="1024" height="576">
         <param name="movie" value="flash-player.swf?videoUrl=video/tears-of-steel-battle-clip-medium.mp4" />
         <param name="allowfullscreen" value="true" />
         <param name="wmode" value="transparent" />
         <param name="flashvars" value="controlbar=over&amp;image=img/poster.jpg&amp;file=flash-player.swf?videoUrl=video/tears-of-steel-battle-clip-medium.mp4" />
         <img alt="Tears of Steel poster image" src="img/poster.jpg" width="1024" height="428" title="No video playback possible, please download the video from the link below" />
      </object>
      <!-- Offer download -->
      <a href="video/tears-of-steel-battle-clip-medium.mp4">Download MP4</a>
   </video>
   <figcaption>&copy; Blender Foundation | <a href="http://mango.blender.org">mango.blender.org</a></figcaption>
</figure>
```   

这里我们仍然使用了 controls 属性，之后我们会在JS中关闭这个属性，这里之所以这么做是让
那么关闭了JS功能的用户可以使用默认的播放控制。    


大部分默认的控制条会有下面的功能：   

+ 播放/暂停
+ 静音
+ 音量控制
+ 进程条
+ 前进
+ 全屏    

将下面的内容插入到 video 元素之后，figcaption 元素之前：    

```html
<ul id="video-controls" class="controls">
   <li><button id="playpause" type="button">Play/Pause</button></li>
   <li><button id="stop" type="button">Stop</button></li>
   <li class="progress">
      <progress id="progress" value="0" min="0">
         <span id="progress-bar"></span>
      </progress>
   </li>
   <li><button id="mute" type="button">Mute/Unmute</button></li>
   <li><button id="volinc" type="button">Vol+</button></li>
   <li><button id="voldec" type="button">Vol-</button></li>
   <li><button id="fs" type="button">Fullscreen</button></li>
</ul>
```    

&lt;progress&gt;中的 span 元素是不支持progress元素浏览器的回退方案。    

### 使用 Media API 进行交互

在处理按钮的交互前，首先需要进行一系列的初始化操作。    

首先，最好检查一下浏览器是否支持&lt;video&gt;元素，并且只有在支持的情况下显示定制的控制条。
可以检查元素是否支持 `canPlayType()` 方法来查看是否支持video元素：    

```javascript
var supportsVideo = !!document.createElement('video').canPlayType;
if (supportsVideo) {
   // set up custom controls
   // ...
}
```   

如果支持的话应该隐藏默认的控制条:   

`video.controls = false;`   

注意在HTML元素上设置属性 `controls="false"` 并没有效果。   

之后获取所有的按钮元素：    

```javascript
var playpause = document.getElementById('playpause');
var stop = document.getElementById('stop');
var mute = document.getElementById('mute');
var volinc = document.getElementById('volinc');
var voldec = document.getElementById('voldec');
var progress = document.getElementById('progress');
var progressBar = document.getElementById('progress-bar');
var fullscreen = document.getElementById('fs');
```   

**恢复播放与暂停**    

```javascript
playpause.addEventListener('click', function(e) {
   if (video.paused || video.ended) video.play();
   else video.pause();
});
```   

**停止**   

```javascript
stop.addEventListener('click', function(e) {
   video.pause();
   video.currentTime = 0;
   progress.value = 0;
});
```   

Media API 并没有 stop 方法，这里我们通过将播放暂停，并且将播放位置 `currentTime` 设置为0来模拟
这个操作。    

**静音**    

```javascript
mute.addEventListener('click', function(e) {
   video.muted = !video.muted;
});
```   

同样这个属性在HTML的元素上设置属性为 false 时没有效果。    

**音量调整**    

```javascript
volinc.addEventListener('click', function(e) {
   alterVolume('+');
});
voldec.addEventListener('click', function(e) {
   alterVolume('-');
});

var alterVolume = function(dir) {
   var currentVolume = Math.floor(video.volume * 10) / 10;
   if (dir === '+') {
      if (currentVolume < 1) video.volume += 0.1;
   }
   else if (dir === '-') {
      if (currentVolume > 0) video.volume -= 0.1;
   }
}
```    

**进度操作**   

在页面初始的&lt;progress&gt;元素中，我们只设置了两个属性：min 和 value，且都为0。而最大值 max
则需要根据视频元素的长度来设置，具体来说是根据 `duration` 属性来获取。理想情况下，当 `loadedmetadata` 事件触发时可以得到正确的 `duration` 属性值，这个事件会在video元素的元数据加载完成后触发：    

```javascript
video.addEventListener('loadedmetadata', function() {
   progress.setAttribute('max', video.duration);
});
```    

不过在一些移动浏览器上当这个事件触发时，`duration` 的值可能还是不正确的。    

随着视频的播放，另一个事件 `timeupdate` 会定期的触发。此事件是更新进度条值的理想选择，将其设置为视频的currentTime属性的值，该值表示当前播放视频的距离。   

```javascript
video.addEventListener('timeupdate', function() {
   progress.value = video.currentTime;
   progressBar.style.width = Math.floor((video.currentTime / video.duration) * 100) + '%';
});
```    

**全屏**    

目前全屏API的实现情况比较复杂。需要手动检查浏览器是否指出 FullScreen API, 如果支持就启用：   

`var fullScreenEnabled = !!(document.fullScreenEnabled  || document.mozFullScreenEnabled || document.msFullscreenEnabled || document.webkitSupportsFullscreen || document.webkitFullscreenEnabled || document.createElement('video').webkitRequestFullScreen);`    

实现方面太过复杂，不说了。    
