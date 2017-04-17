# 移动 Web


## 三个视口

视口即初始包含块。在桌面上，视口的宽度和浏览器窗口的宽度一致，移动端浏览器将视口的宽度设计得比屏幕宽度宽出很多。  

在手机上，视口与移动端浏览器屏幕宽度不再相关联，而是完全独立的了。我们称它为布局视口，CSS 布局会根据它来计算，并被它约束。  

视觉视口：它是用户看到的网站的区域，用户可以通过缩放来操作视觉视口，同时不影响布局视口。  

视觉视口与设备屏幕一样宽，并且它的 CSS 像素的数量会随着用户缩放而改变。  

定义理想视口是浏览器的工作，而不是设备或操作系统的工作。但是也取决于所处的设备，会随着设备转向而不同。  

## 其他

设备像素个数与理想视口的比，即设备像素比 DPR：
  - window.devicePixelRatio
  - device-pixel-ratio

都不需要单位，但是默认是 dppx。 96dpi == 1dppx。

`document.documentElement.clientWidth, document.documentElement.clientHeight` 指的是布局视口的尺寸。  

`window.innerWidth, window.innerHeight` 是视觉视口的尺寸。

vw, vh 也是相对于布局视口。

## 视口标签

`<meta name="viewport" content="name=value,name=value">`  

1. **width**: 设置布局视口的宽度为特定的值。
2. **init-scale**: 设置页面的初始缩放程度和布局视口的宽度。
3. **minimum-scale**: 设置了最小缩放程度。
4. **maximum-scale**: 设置了最大缩放程度。
5. **user-scalable**: 是否阻止用户进行缩放。

## HTTP

URL 转义表示法包含一个百分号，后面跟两个表示字符 ASCII 码的十六进制数。  

每个 IP 分组包括：
  + 一个 IP 分组首部（通常为20字节）
  + 一个 TCP 分组首部（通常为20字节）
  + 一个TCP 数据块。  

Via 首部字段列出了与报文途径的每个中间节点（代理或网关）有关的信息。  

每个Via路标中最多包含4个组件：一个可选的协议名（默认 HTTP），一个必须的协议版本，一个必选的节点名和一个可选的描述性注释。  

TE: trailers, chunked  如果TE 说明可以接受拖挂，就可以加拖挂。  

拖挂可以包含附带的首部字段，报文首部包含一个 Trailer 首部，列出了跟在报文之后的首部列表，在 Trailer 首部中列出的首部就紧接在最后一个分块之后。
