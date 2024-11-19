# Media Queries

> https://www.w3.org/TR/css3-mediaqueries/

## Media Queries

一个媒体查询规则包含一个媒体类型以及零或多个表达式，这些表达式用来检查特定的媒体的特征是否
满足条件。     

当媒体查询的媒体类型是所有媒体的话，即可省略关键字 'all'（以及后面跟着的 'and'）。    

```css
I.e. these are identical:

@media all and (min-width:500px) { … }
@media (min-width:500px) { … }
As are these:

@media (orientation: portrait) { … }
@media all and (orientation: portrait) { … }
```    

几个媒体查询可以组合成一个媒体查询的列表。用逗号分隔开。   

`@media screen and (color), projection and (color) { … }`  

如果媒体查询为空，最终结果就是 true。      

'only' 关键字是用来为旧的浏览器隐藏样式表的。现在的浏览在遇到'only' 开头的媒体查询时应该当 'only' 不存在。   

媒体查询语法可以用在HTML, XML, @import 和 @media 规则中：   

```css  
<link rel="stylesheet" media="screen and (color), projection and (color)" rel="stylesheet" href="example.css">
<link rel="stylesheet" media="screen and (color), projection and (color)" rel="stylesheet" href="example.css" />
<?xml-stylesheet media="screen and (color), projection and (color)" rel="stylesheet" href="example.css" ?>
@import url(example.css) screen and (color), projection and (color);
@media screen and (color), projection and (color) { … }
```

## 媒体特征

### width

*值*： `<length>`  
*应用类型*：视觉及触摸设备  
*是否接受 min/max前缀*：接受  

输出设备的目标展示区域的宽度，应该就是布局视口的宽度。    

### height

*值*： `<length>`  
*应用类型*：视觉及触摸设备  
*是否接受 min/max前缀*：接受    

同上吧，布局视口的高度。   

### device-width

*值*： `<length>`  
*应用类型*：视觉及触摸设备  
*是否接受 min/max前缀*：接受  

输出设置渲染界面的宽度。对于连续的媒体，就是屏幕的宽度，应该是理想视口的。   

### device-height

*值*： `<length>`  
*应用类型*：视觉及触摸设备  
*是否接受 min/max前缀*：接受  

输出设置渲染界面的高度。对于连续的媒体，就是屏幕的高度，应该是理想视口的。   

### orientation

*值*： portrait | landscape  
*应用类型*： 位图媒体类型   
*是否接受 min/max 前缀*： 不接受    

当媒体 'height' 大于等于 'width' 时就是 'portrait' 方向，就是平时的状态呗，反之就是 'landscape'。   

### aspect-ratio   

*值*：`<ratio>`   
*应用类型*：位图类型   
*是否接受 min/max 前缀*： 接受    

'width' 和 'height' 的比。   

### device-aspect-ratio

*值*：`<ratio>`   
*应用类型*：位图类型   
*是否接受 min/max 前缀*： 接受    

'device-width' 和 'device-height' 的比。   

```css
For example, if a screen device with square pixels has 1280 horizontal pixels and 720 vertical pixels (commonly referred to as "16:9"), the following Media Queries will all match the device:

@media screen and (device-aspect-ratio: 16/9) { … }
@media screen and (device-aspect-ratio: 32/18) { … }
@media screen and (device-aspect-ratio: 1280/720) { … }
@media screen and (device-aspect-ratio: 2560/1440) { … }
```    

### color

*值*：`<integer>`   
*应用类型*：视觉媒体  
*是否接受 min/max 前缀*： 接受   

输出设置每个颜色组件的bits数量。就是每个颜色用多少位表示呗。     

### color-index

*值*：`<integer>`   
*应用类型*：视觉媒体   
*是否接受 min/max 前缀*： 接受     

输出设备的颜色查找表中的条目数。是不是值支持多少种颜色啊。    

### monochrome

*值*：`<integer>`   
*应用类型*：视觉媒体   
*是否接受 min/max 前缀*： 接受      

单色帧缓冲器中每像素的位数。   

### resolution

*值*：`<resolution>`   
*应用类型*：位图媒体   
*是否接受 min/max 前缀*： 接受    

设置的分辨率咯。单位是 "dpi" 或者 "dpcm"。      


### scan

*值*： progressive | interlace   
*应用类型*： "tv" 类型    
*是否接受前缀*： 不接受    

应该就是"tv"的扫描方式。    

### grid

*值*：`<interger>`    
*应用类型*：视觉和触摸设备    
*是否接受前缀*：不接受     

用来查询设备是否是 grid 或位图。如果设备是基于网格的（例如"tty" 终端），值是1.否则是0。    

```css
@media handheld and (grid) and (max-width: 15em) { … }
@media handheld and (grid) and (device-max-height: 7em) { … }
```    
