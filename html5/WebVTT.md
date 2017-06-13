# Web Video Text Tracks Format (WebVTT)

Web Video Text Track Format 使用 &lt;track&gt; 元素展示基于时间的文字信息的一种格式。
WebVTT 文件主要的目的就是为 &lt;video&gt; 添加覆盖在上方的文字内容。这种格式必须使用 UTF-8
编码。  

## WebVTT 文件

WebVTT 文件的 MIME 类型为 text/vtt。文件扩展就是 .vtt。   

文件包含 cues，可能是单行或者多行，如下所示：   

```
WEBVTT

00:01.000 --> 00:04.000
Never drink liquid nitrogen.

00:05.000 --> 00:09.000
- It will perforate your stomach.
- You could die.
```

## WebVTT 主体

WebVTT 文件的结构如下，包含必须的两部分及可选四个组件：   

+ 一个可选的字节顺序标记 byte order mark(BOM)
+ 字符串 WEBVTT
+ WebVTT 右边的可选的头部。   
  - 至少与 WebVTT 中间有个空白
  - 可以在这部分添加一些文件描述
  - 可以在这部分添加任何东西，除了新行或字符串 "-->"
+ 一个空白行，相当于两个换行
+ 零或多个 cues or comments
+ 零或多个空白行   

```
WEBVTT - This file has cues.

14
00:01:14.815 --> 00:01:18.114
- What?
- Where are we now?

15
00:01:18.171 --> 00:01:20.991
- This is big bat country.

16
00:01:21.058 --> 00:01:23.868
- [ Bats Screeching ]
- They won't get in your hair. They're after the bugs.
```       

注意在 cue 内不要随便使用额外的空白行，例如说在时间行和负载之间，因为新的空白行会关闭 cue。  

## WebVTT comments

Comments 是为了那些读取文件的人提供的一些信息，不会展示给用户。Comments 可以包含新行，但不能包含空白行，同上，空白行会结束Comments。   

还有，Comments 也不能包含字符串 "-->"，"&"，"<" 。如果要使用这些字符，需要转义，就像html中那样转义。   

每条 Comment 包含3部分：   

+ 字符 Note
+ 一个空格或者新行
+ 零或多个字符（不包含上面提到的字符）

```
NOTE
Another comment that is spanning
more than one line.

NOTE You can also make a comment
across more than one line this way.
```   

## 用法

可以使用CSS来为 text cues 添加样式：   

```html
<!doctype html>
<html>
 <head>
  <title>Styling WebVTT cues</title>
  <style>
   video::cue {
     background-image: linear-gradient(to bottom, dimgray, lightgray);
     color: papayawhip;
   }

   video::cue(b) {
     color: peachpuff;
   }
  </style>
 </head>
 <body>
  <video controls autoplay src="video.webm">
   <track default src="track.vtt">
  </video>
 </body>
</html>
```   

也可以直接在 WebVTT 文件中添加样式，如下：   

```
WEBVTT

STYLE
::cue {
  background-image: linear-gradient(to bottom, dimgray, lightgray);
  color: papayawhip;
}
/* Style blocks cannot use blank lines nor "dash dash greater than" */

NOTE comment blocks can be used between style blocks.

STYLE
::cue(b) {
  color: peachpuff;
}

00:00:00.000 --> 00:00:10.000
- Hello <b>world</b>.

NOTE style blocks cannot appear after the first cue.
```    

还可以指定位置：   

```
WEBVTT

00:00:00.000 --> 00:00:04.000 position:10%,line-left align:left size:35%
Where did he go?

00:00:03.000 --> 00:00:06.500 position:90% align:right size:35%
I think he went down this lane.

00:00:04.000 --> 00:00:06.500 position:45%,line-right align:center size:35%
What are you waiting for?
```   

## cues

每个 cue 包含下面的组件：   

+ 一个可选的 cue 标识符，后面跟新行
+ Cue 时间
+ 可选的 cue 配置，不过再开头以及每个配置之间最少有一个空格
+ 一或多个新行
+ cue 载荷文本

### identifier

cue 标识符是用来标记 cue 的名字。可以在脚本中获取引用。不能包含新行及 "-->"。必须以新行结尾（准确说是换行符吧），没必要是唯一的，也就是说可能多个 cue 用一个标识符吧。   

```
WEBVTT

1
00:00:22.230 --> 00:00:24.606
This is the first subtitle.
```   

### timings

如果WebVTT文件是用作章节 chapters(&lt;track&gt; kind 为 chapters)，那么文件内的时间不能重叠，
其余的话可以重叠。   

每个时间段包含5个组件：   

+ 开始时间的时间戳
+ 至少一个空格
+ 字符 "-->"
+ 至少一个空格
+ 结束时间的时间戳，必须大于开始时间

时间戳必须是下面格式之一：  

+ mm:ss.ttt
+ hh:mm:ss.ttt

hh是小时，至少两位数字，可以比两位数字多（9999:00:00.000），mm是分钟，00-59，ss是秒，00-59，ttt是毫秒，000-999。    

### settings

settings 是用来定位文字的位置的。每个setting 的名字与值之后用冒号分隔，包含5种配置：   

+ vertical: 垂直展示文字，rl表示从右到左，lr从左到右，但是好像两个没什么效果。  

+ line: 指定文本垂直显示的位置。如果设置 vertical，则line指定文本水平的位置。
  - 值可以是line number:   
    + 行高就是 cue 第一行的高度（关行高什么事？）
    + 正值表示从上到下,0表示顶部
    + 负值从下到上，-1表示底部   
  - 或者可以是一个百分比：   
    + 必须是整数，0-100之间
    + 必须跟百分号  

+ position  
  - 指定文字出现的水平位置。如果设置了 vertical，就是垂直位置
  - 百分比值
  - 0-100之间整数，跟 %   

+ size  
  - 指定文字区域的宽度，如果是垂直显示，就是高度
  - 百分比，要求同上   

+ align: 对齐方式，是在上面 size 规定的空间内对齐，可选值有 start,end,middle   


```
00:00:5.000 --> 00:00:10.000
00:00:5.000 --> 00:00:10.000 line:63% position:72% align:start
00:00:5.000 --> 00:00:10.000 line:0 position:20% size:60% align:start
00:00:5.000 --> 00:00:10.000 vertical:rt line:-1 align:end
```   

### 载荷 payload

载荷不能包含 "-->", "&", "<"。想用就转义，如果 &lt;track&gt; 的kind 为 chapters 则不能使用标签，
否则可以使用。包含以下几种：   

+ 时间戳  

```
1
00:16.500 --> 00:18.500
When the moon <00:17.500>hits your eye

1
00:00:18.500 --> 00:00:20.500
Like a <00:19.000>big-a <00:19.500>pizza <00:20.000>pie

1
00:00:20.500 --> 00:00:21.500
That's <00:00:21.000>amore
```   

+ 类标签 (`<c></c>`): 可以使用CSS的类样式化文本：   

`<c.classname>text</c>`   

+ 斜体(`<i></i>`)   

+ 粗体(`<b></b>`)   

+ 下划线(`<u></u>`)   

+ ruby   

+ voice(`<v></v>`) 类似于类标签：   
`<v Bob>text</v>`   
