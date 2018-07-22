# 媒体格式

## WebM

WebM格式是一种基于Matroska容器格式受限版本的一种格式。它始终使用VP8或VP9视频编解码器和Vorbis或Opus音频编解码器。Chorme，FF，Opera 原生支持WebM格式，IE及Safari(非IOS的) 需要安装插件。    

Gecko将下面的MIME格式看做是WebM文件：    

+ video/webm
+ audio/webm

## Ogg Theora Vorbis

使用 Theora 视频编解码器，Vorbis 音频编解码器的 Ogg 容器格式在 Chorme，FF，Opera原生支持
，Safari(非IOS的) 需要安装插件，IE不支持。    

Gecko将下面的MIME格式看做是 Ogg 文件：   

+ audio/ogg
+ video/ogg
+ application/ogg: 尽量使用上面两种   

## Ogg Opus

Ogg 容器也可以使用 Opus 音频编解码器。只在 Gecko15.0  上支持。    

## Ogg FLAC  

还可以使用 FLAC 音频编解码器。也是在 Gecko 51.0上支持。

## MP4 H.264(AAC or MP3)

使用 H.264 视频编解码器， AAC 音频编解码器的 MP4 容器格式在 IE，Safari，Chorme上原生支持。
当时 Chromium 和 Opera 不支持。 IE 和 Chorme 还支持 MP3 音频编解码器的 MP4 容器，不过 Safari 不支持。 FF在一些条件下支持。   

## MP4 FLAC

从 FF 51开始，可以使用 FLAC 编解码器的 MP4格式。   

## MP3   

MP3 音频格式被 FF 及提供了MP3解码器的操作系统上的移动端FF，IE，Chorme, Safari 支持。   

## WAVE PCM   

使用 PCM 音频编解码器的 WAVE 容器格式被 Gecko 和 Safari 支持。这些文件一般是 ".wav" 后缀。   

## FLAC  

FLAC 是 FF 51.0 支持。这些文件扩展名为 ".flac"。   
