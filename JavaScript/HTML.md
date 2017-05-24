# HTML元素


| 元素 |   描述   | 属性 |
| :------------- | :------------- | :------------- |
| `<base>`       | 一份文档最多只能有一个 `<base>` 元素。只能出现在 `<head>` 中     | href,target(_self, _top, _parent, _blank)
|  `<address>` | 通常使用 `<i>` 或 `<em>` 的默认样式渲染文本 | |
| `<figcaption>` | 与其相关联的图片的说明/标题，用与描述其父节点 `<figure>` 元素里的其他数据。并且必须是 `<figure>` 的第一个或最后一个子节点。| |
| `<figure>` | 代表一段独立的内容 | |
| `<pre>` | 表示预定义格式文本。在该元素中的文本通常按照原文件中的编排，以等宽字体的形式展现出来，文本中的空白符（比如空格和换行符）都会显示出来。| |
| `<b>` | 表示相对于普通文本字体上的区别，但不表示任何特殊的强调或者关联。| |
| `<cite>` |  表示一个作品的引用。它必须包含引用作品的符合简写格式的标题或者URL。| |
| `<code>` | 呈现一段计算机代码. 默认情况下, 它以浏览器的默认等宽字体显示.| |
| `<em>` | 标记出需要用户着重阅读的内容 | |
| `<i>` | 用于表现因某些原因需要区分普通文本的一系列文本。例如技术术语、外文短语或是小说中人物的思想活动等，它的内容通常以斜体显示。| |
| `<mark>` | 代表突出显示的文字 | |
| `<small>` | 将使文本的字体变小一号 | |
| `<strong>` | 表示文本十分重要，一般用粗体显示。| |
| `<sub> <sup>`| 上下角标 | |
| `<audio>` | 用于在文档中表示音频内容。 `<audio>` 元素可以包含多个音频资源， 这些音频资源可以使用 src 属性或者`<source>` 元素来进行描述； 浏览器将会选择最合适的一个来使用。| autoplay布尔属性, controls, loop布尔属性, muted是否静音的布尔值, preload, src, volume音量从0.0（无声）到1.0（最大声）,
| `<track>` | 被当作媒体元素—`<audio>` 和 `<video>`的子元素来使用。它允许指定计时字幕（或者基于事件的数据），例如自动处理字幕。| default定义了该track应该启用，kind定义track该如何使用，默认是 subtitles, 可选值有subtitles, captions, descriptions, chapters, metadata。src必须定义，srclang如果定义了subtitles, 必须定义srclang。
| `<video>` | | poster一个海报帧的URL，用于在用户播放或者跳帧之前展示。|
| `<embed>` | 用于表示一个外部应用或交互式内容的集合点，换句话说，就是一个插件。| `<embed type="video/quicktime" src="movie.mov" width="640" height="480">`|
| `<object>` | 表示引入一个外部资源，这个资源可能是一张图片，一个嵌入的浏览上下文，亦或是一个插件所使用的资源。| data一个合法的 URL 作为资源的地址,type:data 指定的资源的 MIME 类型，需要为 data 和 type 中至少一个设置值。
| `<source>` | 为 `<picture>`, `<audio>`, `<video>` 指定多个媒体资源 | src, type
| `<del> <ins>` | 删除，插入的文本 | |
| `<col> <colgroup>`| | |
| `<datalist>` |  包含了一组`<option>`元素,这些元素表示其它表单控件可选值. 通过其他控件的 list 属性关联。| |
| `<legend>` | 代表一个用于表示它的父元素`<fieldset>`的内容的标题。作为第一个子元素.| |
| `<meter>` | 显示已知范围的标量值或者分数值。| value, min(0), max(1), low, high|
| `<progress>` | 显示一项任务的完成进度.| max, value |
| `<details>`| |open|
| `<summary>`|     |   |  |
