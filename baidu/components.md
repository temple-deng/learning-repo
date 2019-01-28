# 组件

<!-- TOC -->

- [组件](#组件)
- [原生组件说明](#原生组件说明)
- [视图容器](#视图容器)
  - [view](#view)
  - [scroll-view](#scroll-view)
  - [swiper](#swiper)
  - [movable-area](#movable-area)
  - [cover-view](#cover-view)
  - [cover-image](#cover-image)
- [基础内容](#基础内容)
  - [icon](#icon)
  - [text](#text)
  - [rich-text](#rich-text)
  - [progress](#progress)
  - [animation-view](#animation-view)
- [表单组件](#表单组件)
  - [button](#button)
  - [checkbox](#checkbox)
  - [form](#form)
  - [input](#input)
  - [label](#label)
  - [picker](#picker)
  - [picker-view](#picker-view)
  - [radio](#radio)
  - [slider](#slider)
  - [switch](#switch)
  - [textarea](#textarea)
- [导航](#导航)
- [媒体组件](#媒体组件)
  - [audio](#audio)
  - [image](#image)
  - [video](#video)
  - [camera](#camera)
  - [live-player](#live-player)
- [开放能力](#开放能力)
  - [open-data](#open-data)
  - [web-view](#web-view)

<!-- /TOC -->

# 原生组件说明

原生组件是由客户端创建的原生组件，包括：canvas, map, animation-view, textarea, cover-view,
cover-image, camera, web-view, video, live-player。   

由于原生组件脱离在 web-view 渲染流程外，因此在使用时有以下限制：   

- 原生组件的层级是最高的，所以页面中的其他组件无论 z-index 为多少，都无法盖在原生组件上
- 原生组件无法在 scroll-view, swiper, picker-view, movable-view 中使用
- 部分 CSS 样式无法应用于原生组件
- 在 IOS 下，video 组件暂时不支持触摸相关事件

# 视图容器

## view


属性名 | 类型 | 默认值 | 说明
---------|----------|---------|---------
 hover-class | String | none | 指定按下去的样式类
 hover-stop-propagation | Boolean | false | 指定是否阻止本节点的祖先节点出现点击态
 hover-start-time | Number | 50 | 按住后多久出现点击态，单位毫秒
 hover-stay-time | Number | 400 | 手指松开后点击态保留时间，单位毫秒

## scroll-view

可滚动视图区域。   

很奇怪，html 自己的滚动机制也还是可以正常工作的啊，那这个组件的意义何在。   

属性名 | 类型 | 默认值 | 说明
---------|----------|---------|---------
 scroll-x | Boolean | false | 允许横向滚动
 scroll-y | Boolean | false | 允许纵向滚动
 upper-threshold | Number | 50 | 距顶部/左边多远时（单位 px），触发 scrolltoupper 事件
 lower-threshold | Number | 50 | 同上，scrolltolower 事件
 scroll-top | Number | - | 设置竖向滚动条位置
 scroll-left | Number | - | 设置横向滚动条位置
 scroll-into-view | String | - | 值为某子元素 id，设置滚动方向后，按方向滚动到该元素
 scroll-with-animation | Boolean | false | 在设置滚动条位置时使用动画过渡
 bindscrolltoupper | EventHandle | - | 滚动到顶部/左边，会触发 scrolltoupper 事件
 bindscrolltolower | EventHandle | - | 滚动到底部/右边，会触发 scrolltolower 事件
 bindscroll | EventHandle | - | 滚动时触发，event.detail = {scrollLeft, scrollTop,scrollHeight, scrollWidth, deltaX, deltaY}


## swiper

滑块视图容器，其实就是跑马灯。   


属性名 | 类型 | 默认值 | 说明
---------|----------|---------|---------
 indicator-dots | Boolean | false | 是否显示面板指示点
 indicator-color | Color | rgba(0,0,0,.3) | 指示点颜色
 indicator-active-color | Color | #333 | 当前选中的指示点颜色
 autoplay | Boolean | false | 是否自动播放
 current | Number | 0 | 当前所在页面的 index
 current-item-id | String | "" | 当前所在滑块的 item-id，不能与 current 被同时指定
 interval | Number | 5000 | 自动切换时间间隔
 duration | Number | 500 | 滑动动画时长
 circular | Boolean | false | 是否采用衔接滑动
 vertical | Boolean | false | 滑动方向是否为纵向
 previous-margin | String | '0px' | 前边距，可用于露出前一项的一小部分
 next-margin | String | '0px' | 后边距，可用于露出后一项的一小部分
 display-multiple-items | Number | 1 | 同时显示的滑块数量
 bindchange | EventHandle | - | current 改变时会触发 change 事件，detail={current:current, source:source}
 bindanimationfinish | EventHandle | - | 动画结束时会触发 animationfinish 事件，detail同上

其中只可放置 `<swiper-item/>` 组件。item 的宽高自动设置为 100%。   

item 有一个 item-id 属性，即标识符。   

## movable-area

movable-view 的可移动区域。   

movable-area 必须设置 width 和 height 属性，不设置默认为 10px。   

属性名 | 类型 | 说明
---------|----------|---------
 scale-area | Boolean | 当里面的 movable-view 设置为支持双指缩放时，设置此值可将缩放手势生效区域修改为整个 movable-area

movable-view 是可移动的视图容器，在页面中可以拖拽滑动。   


属性名 | 类型 | 默认值 | 说明
---------|----------|---------|---------
 direction | String | none | movable-view 的移动方向，属性值有 all, vertical, horizontal, none
 inertia | Boolean | false | movable-view 是否带有惯性
 out-of-bounds | Boolean | false | 超过可移动区域后，movable-view 是否还可以移动
 x | Number | - | 定义 x 轴方向的偏移，如果 x 的值不在可移动范围内，会自动移动到可移动范围
 y | Number | - | 定义 y 轴方向偏移，同上
 damping | Number | 20 | 阻尼系数，控制回弹动画
 friction | Number | 2 | 摩擦系数
 disabled | Boolean | false| 是否禁用
 scale | Boolean | false | 是否支持双指缩放
 scale-min | Number | 0.5 | 定义缩放倍数的最小值
 scale-max | Number | 10 | 定义缩放倍数的最大值
 scale-value | Number | 1 | 定义缩放倍数
 animation | Boolean | true | 是否使用动画
 bindchange | EventHandle | - | 拖动过程触发的事件 detail = {x:x, y:y, source:source}，其中 source 表示产生移动的原因，值可为 touch(拖动)、out-of-bounds（超出移动范围后的回弹）、inertia（惯性）和空字符串（setData）
 bindscale | EventHandle | - | 缩放过程触发的事件，detail = {x:x,y:y,scale:scale}

```html
<view class="movable-view">
    <movable-area style="height: 300px;width: 300px;background: green;">
        <movable-view style="height: 40px; width: 40px; background: black;" x="30" y="30" direction="all">
        </movable-view>
    </movable-area>
</view>
```    

- movable-view 必须设置 width 和 height 属性，不设置默认为 10px；
- movable-view 默认为绝对定位，top 和 left 属性为 0px；
- 当movable-view小于movable-area时，movable-view的移动范围是在movable-area内；
- 当movable-view大于movable-area时，movable-view的移动范围必须包含movable-area（x 轴方向和 y 轴方向分开考虑）；
- movable-view必须在组件中，并且必须是直接子节点，否则不能移动。

## cover-view

覆盖在原生组件之上的文本视图，可覆盖的原生组件包括 video、canvas、camera，只支持嵌套 cover-view、cover-image。   


## cover-image

覆盖在原生组件之上的图片视图，可覆盖的原生组件同 cover-view,支持嵌套在 cover-view 里。   

- src: 图片路径，支持临时路径、网络地址，不支持base64
- bindload: 图片加载成功时触发
- binderror: 图片加载失败时触发   

1. 支持 css transition 动画，transition-property 只支持 transform (translateX, translateY) 与 opacity；
2. 文本建议都套上 cover-view 标签，避免排版错误；
3. 只支持基本的定位、布局、文本样式。不支持设置单边的 border、background-image、shadow、overflow: visible 等；
4. 建议子节点不要溢出父节点；
5. 默认设置的样式有：white-space: nowrap; line-height: 1.2; display: block ；
6. 建议不要频繁改变 s-if 表达式的值控制显隐，否则会导致 cover-view 显示异常；
7. IOS端暂不支持一个页面有多个video时嵌套cover-view；
8. cover-view 和 cover-image 从基础库版本1.12.0开始支持事件捕获、冒泡。

# 基础内容

## icon

属性名 | 类型 | 默认值 | 说明
---------|----------|---------|---------
 type | String | - | 生效的值：success, info, warn, waiting, success_no_circle, clear, search, personal, setting, top, close, cancel, download, checkboxSelected, radioSelected, radioUnselect
 size | Number | 23 | icon 的大小，单位 px
 color | Color | - | 颜色

## text

放文本的元素。   

属性名 | 类型 | 默认值 | 说明
---------|----------|---------|---------
 space | String | false | 显示连续空格
 selectable | Boolean | false | 文本是否可选

space 有效值：   

- ensp: 中文字符空格一半大小
- emsp: 中文字符空格大小
- nbsp: 根据字体设置的空格大小

text 组件内只支持 text 嵌套。   

## rich-text

- nodes(Array/String): 默认 `[]`，节点列表/HTML String    

现支持两种节点，通过 `type` 来区分，分别是元素节点和文本节点，默认是元素节点，在富文本
区域里显示的 HTML 节点。   

完全没看懂这里文档的意思。。。。

## progress

进度条。   


属性名 | 类型 | 默认值 | 说明
---------|----------|---------|---------
 percent | Float | 无 | 百分比 0-100
 show-info | Boolean | false | 在进度条右侧显示百分比
 stroke-width | Number | 2 | 进度条线的宽度，单位 px
 color | Color | #09BB07 | 进度条颜色（请使用 activeColor）
 activeColor | Color | - | 已选择的进度条颜色（什么叫已选择）
 backgroundColor | Color | - | 未选择的进度条颜色
 active | Boolean | false | 进度条从左到右的动画
 active-mode | String | backwards | backwards: 动画从头播，forwards: 动画从上次结束点接着播

## animation-view

Lottie 动画组件

属性名 | 类型 | 必填 | 默认值 | 说明
---------|----------|---------|---------|---------
 path | String | 是 | - | 动画资源地址，目前只支持绝对路径
 loop | Boolean | 否 | false | 动画是否循环播放
 autoplay | Boolean | 否 | true | 动画是否自动播放
 action | String | 否 | play | 动画操作，可取值 play, pause, stop
 hidden | Boolean | 否 | true | 是否隐藏动画
 bindended | EventHandle | 否 | - | 当播放到末尾时触发 ended 事件（自然播放结束会触发回调，循环播放结束及手动停止动画不会触发）   

# 表单组件

## button


属性名 | 类型 | 默认值 | 说明
---------|----------|---------|---------
 size | String | default | 大小，可选值 default, mini
 type | String | default | 类型，可选值 primary, default, warn
 plain | Boolean | false | 按钮是否镂空，背景色透明
 form-type | String | - | 用于 `<form/>`组件，点击分别会触发 `<form/>` 组件的 submit/reset 事件
 open-type | String | - | 手百开放能力，比如分享、获取用户信息等
 hover-class | String | button-hover | 点击态的样式类
 hover-stop-propagation | Boolean | false | 指定是否阻止本节点的祖先节点出现点击态
 hover-start-time | Number | 20 | 略
 hover-stay-time | Number | 70 | 略
 bindgetuserinfo | Handler | - | 用户点击该按钮时，会返回获取到的用户信息，从返回参数的 detail 中获取到的值，和 swan.getUserInfo 一样的。和 open-type 搭配使用，使用时机，open-type="getUserInfo"
 disabled | Boolean | false | 是否禁用
 loading | Boolean | false | 名称前是否带有 loading 图标
 bindgetphonenumber | Handler | - | 获取用户手机号的回调，和 open-type 搭配使用，使用时机：open-type="getPhoneNumber"
 bindopensetting | Handler | - | 打开授权设置页后回调，使用时机 open-type="openSetting"

open-type 有效值：   

- contact: 打开客服会话
- share: 触发用户分享
- getUserInfo: 获取用户信息，可以从 bindgetuserinfo 回调中获取到用户信息
- getPhoneNumber: 获取用户手机号，可以从 bindgetphonenumber
- openSetting: 打开授权设置页

## checkbox


属性名 | 类型 | 默认值 | 说明
---------|----------|---------|---------
 value | String | - | `<checkbox/>` 标识，选中时触发 `<checkbox-group/>` 的 change 事件，并携带 checkbox 的 value
 disabled | Boolean | false | 禁用
 checked | Boolean | false | 勾选
 color | Color | - | 颜色

```html
<checkbox-group bindchange="checkboxChange" name="citylist">
  <view class="checkbox" s-for="item in items">
    <checkbox value="{{item.value}}" checked="{{item.checked}}">
      {{item.text}}
    </checkbox>
  </view>
</checkbox-group>
```    

checkbox-group:   

- bindchange: 选中项改变时触发 change 事件，detail = {value: \[选中的checkbox的value\]}   

## form

将组件内的用户输入的 `<switch/>, <input/>, <checkbox/>, <slider/>, <radio/>, <picker/>`
提交。   

当点击 `<form/>` 表单中的 form-type 为 submit 的 `button` 组件时，会将表单组件中的 value
值进行提交，需要在表单组件中加上 name 来作为 key。   

- bindsubmit: detail={value:{name: value}}
- bindreset: reset 事件
- report-submit: 是否返回 formId,默认为 false

## input


属性名 | 类型 | 默认值 | 说明
---------|----------|---------|---------
 value | String | - | 输入框的初始内容
 type | String | text | 类型，可选值 text, number, digit
 password | Boolean | false | 是否为密码类型
 placeholder | String | - | 输入框为空时占位符
 placeholder-style | String | - | placeholder 的样式
 placeholder-class | String | input-placeholder | placeholder 的样式类
 disabled | Boolean | false | 禁用
 maxlength | Number | 140 | 最大输入长度，设置为 -1 不限长度
 cursor-spacing | Number | 0 | 指定光标与键盘的距离，单位 px
 focus | Boolean | false | 获取焦点
 confirm-type | String | done | 设置键盘右下角按钮的文字
 confirm-hold | Boolean | false | 点击键盘右下角按钮时是否保持键盘不收起
 cursor | Number | - | 指定 focus 时的光标位置
 selection-start | Number | -1 | 光标起始位置，自动聚焦时有效，需与 selection-end 搭配使用
 selection-end | Number | -1 | 光标结束位置
 adjust-position | Boolean | true | 键盘弹起时，是否自动上推页面
 bindinput | EventHandle | - | detail={value, cursor}，函数可以返回一个字符串，替换输入框内容
 bindfocus | EventHandle | - | 聚焦时触发 detail = {value}
 bindblur | EventHandle | - | detail = {value}
 bindconfirm | EventHandle | - | detail = {value}

confirm-type 有效值：  

- send: 发送
- search: 搜索
- next: 下一个
- go: 前往
- done: 完成   

- confirm-type 的最终表现与手机输入法本身的实现有关，部分安卓系统输入法和第三方输入法可能不支持或不完全支持；
- input 组件是一个原生组件，字体是系统字体，所以无法设置 font-family；
- 在 input 聚焦期间，避免使用 css 动画；
- placeholder 的样式暂时只支持设置 font-size、font-weight、color 。   

## label

使用 for 属性找到对应的 id（必须写for），当点击时，就会触发对应的控件。   

目前可以绑定的控件有：button, checkbox, radio, switch。   

## picker

现支持五种选择器，通过 mode 来区分，分别是时间选择器、日期选择器、普通选择器、多列选择器
以及省市区选择器，默认是普通选择器。   

**time**   

属性名 | 类型 | 说明
---------|----------|---------
 value | String | 表示选中的时间，格式为 "hh:mm"
 start | String | 表示有效时间范围的开始，格式为 "hh:mm"
 end | String | 表示有效时间范围的结束，格式为 "hh:mm"
 bindchange | EventHandle | value 改变时触发 change 事件，detail = {value}
 disabled | Boolean | 禁用
 bindcancel | EventHandle | 取消选择或点遮罩层收起 picker 时触发

**date**   

属性名 | 类型 | 说明
---------|----------|---------
 value | String | 表示选中的日期，格式为 "YYYY-MM-DD"
 start | String | 表示有效日期范围的开始，格式为 "YYYY-MM-DD"
 end | String | 表示有效日期范围的结束，格式为 "YYYY-MM-DD"
 fields | String | 选择器的粒度，有效值 year, month, day
 bindchange | EventHandle | value 改变时触发 change 事件，detail = {value}
 disabled | Boolean | 禁用
 bindcancel | EventHandle | 取消选择或点遮罩层收起 picker 时触发

**selector**   

属性名 | 类型 | 说明
---------|----------|---------
 range | Array/Object Array | -
 range-key | String | 当 range 是一个 Object Array 时，通过 range-key 来指定 Object 中 key 的值作为选择器显示内容
 value | Number | value 的值表示选择了 range 中的第几个（下标从 0 开始）
 title | String | 选择器标题（仅安卓有效）默认值为“设置”
 bindchange | EventHandle | value 改变时触发 change 事件，detail = {value}
 disabled | Boolean | 禁用
 bindcancel | EventHandle | 取消选择或点遮罩层收起 picker 时触发

**multiSelector**   

属性名 | 类型 | 说明
---------|----------|---------
 range | 二维 Array/Object Array | -
 range-key | String | 当 range 是一个二维 Object Array 时，通过 range-key 来指定 Object 中 key 的值作为选择器显示内容
 value | Array | value 的值表示选择了 range 中的第几个（下标从 0 开始）
 bindcolumnchange | EventHandle | 某一列的值改变时触发 columnchange 事件，detail={column,value}
 title | String | 选择器标题（仅安卓有效）默认值为“设置”
 bindchange | EventHandle | value 改变时触发 change 事件，detail = {value}
 disabled | Boolean | 禁用
 bindcancel | EventHandle | 取消选择或点遮罩层收起 picker 时触发

**region** 省市区选择器   

属性名 | 类型 | 说明
---------|----------|---------
 value | Array | 表示选中的省市区
 custom-item | String | 可为每一列的顶部添加一个自定义项
 title | String | 选择器标题（仅安卓有效）默认值为“设置”
 bindchange | EventHandle | value 改变时触发 change 事件，detail = {value}
 disabled | Boolean | 禁用
 bindcancel | EventHandle | 取消选择或点遮罩层收起 picker 时触发   

## picker-view

嵌入页面的滚动选择器。    

属性名 | 类型 | 说明
---------|----------|---------
 value | NumberArray | 数组中的数字依次表示 picker-view 内的 picker-view-column 选择的第几项
 indicator-style | String | 设置选择器中间选中框的样式
 indicator-class | String | 设置选择器中间选中框的类名
 mask-style | String | 设置蒙层的样式
 mask-class | String | 设置蒙层的类名
 bindchange | EventHandle | value 改变时触发 change 事件，detail = {value}，value 为数组，表示 picker-view 内的 picker-view-column 当前选择的是第几项    

 其中只可放置 `<picker-view-column/>` 组件，其他节点不会显示。   

## radio

+ value
+ checked
+ disabled
+ color   

radio-group:   

- bindchange: detail={value}

## slider

属性名 | 类型 | 默认值 | 说明
---------|----------|---------|---------
 min | Number | 0 | -
 max | - | 100 | -
 step | - | 1 | -
 disabled | - | - | -
 value | - | - | -
 backgroundColor | - | #cccccc | 背景条的颜色
 block-size | Number | 24 | 滑块的大小，取值范围为 12-28
 block-color | Color | #ffffff | 滑块的颜色
 activeColor（这尼玛怎么一会驼峰一会连字符） | Color | #3c76ff | 已选择的颜色
 show-value | Boolean | false | 是否显示当前 value 
 bindchange | EventHandle | - | 完成一次拖动后触发的事件，detail={value}
 bindchanging | EventHandle | - | 拖动过程中触发的事件，detail={value}   

## switch

属性名 | 类型 | 默认值 | 说明
---------|----------|---------|---------
 checked | Boolean | false | 是否选中
 type | String | switch | 样式，有效值，switch,checkbox
 color | Color | #09bb07 | 颜色
 disabled | - | - | -
 bindchange | EventHandle | - | checked 改变时触发 change 事件，detail={checked}

## textarea

属性名 | 类型 | 默认值 | 说明
---------|----------|---------|---------
 value | String | - | -
 placeholder | String | - | -
 placeholder-style | - | - | -
 placeholder-class | - | textarea-placeholder | 指定 placeholder 的样式类
 disabled | Boolean | false | - 
 maxlength | - | 140 | -
 auto-height | Boolean | false | 是否自动增高，设置 auto-height 时，style.height 不生效
 bindfocus | - | - | detail={value, height}
 bindblur | - | - | detail={value,cursor}
 bindlinechange | - | - | 输入框行数变化，detail = {height:0,heightRpx:0, lineCount:0}
 bindinput | - | - | detail={value,cursor}，函数的返回值不会反映到 textarea 上
 bindconfirm | - | - | detail={value}
 cursor | Number | -1 | 指定 focus 光标位置
 auto-focus | - | - | -
 focus | - | - | -
 fixed | Boolean | false | 如果 textarea 是在一个 position:fixed 的区域，需要显示指定属性 fixed 为 true
 cursor-spacing | Number | 0 | 指定光标与键盘的距离，单位 px 
 show-confirm-bar | Boolean | true | 是否显示键盘上方带有完成按钮那一栏
 selection-start | Number | -1 | -
 selection-end | Number | -1 | -
 adjust-position | - | - | -

# 导航

navigator   

属性名 | 类型 | 默认值 | 说明
---------|----------|---------|---------
 target | String | self | 在哪个目标上发生跳转，默认当前小程序，可选值self/miniProgram
 url | String | - | 应用内的跳转链接
 open-type | String | navigate | 跳转方式
 delta | Number | - | 当 open-type 为 'navigateBack' 时有效，表示回退的层数
 app-id | String | - | 当 target='miniProgram' 时有效，要打开的小程序 App Key
 path | String | - | miniProgram 有效，打开的页面路径，如果为空则打开首页
 extra-data | Object | - | miniProgram 有效，需要传递给目标小程序的数据，目标小程序可在 App.onLaunch(), App.onShow()中获取到这份数据
 version | version | release | miniProgram 有效，打开的小程序版本，develop,trial,release
 hover-class | - | navigator-hover | - 
 hover-stop-propagation | - | - | -
 hover-start-time, hover-stay-time | - | - | - 
 bindsucess | String | - | miniProgram 有效，跳转小程序成功
 bindfail | String | - | miniProgram 有效，跳转小程序失败
 bindcomplete | String | - | miniProgram 有效，跳转完成   

open-type:   

- navigate: `swan.navigateTo`
- redirect: `swan.redirectTo`
- switchTab: `swan.switchTab`
- reLaunch: `swan.reLaunch`
- navigateBack: `swan.navigateBack`
- exit: 退出小程序，miniProgram 有效    

# 媒体组件

## audio

- id: audio 的唯一标识符
- src: 资源地址
- loop: 是否循环
- controls: 是否显示默认控件
- poster: 默认控件上的音频封面的图片地址
- name: 默认控件上的音频名字
- author: 默认控件上的作者名字
- binderror: detail={errMsg: MediaError.code}
- bindplay: 开始/继续播放
- bindpause
- bindtimeupdate: 当播放进度改变时触发 timeupdate 事件，detail={currentTime,duration}
- bindended: 播放到末尾

MediaError.code:   

- 1: 获取资源过程被用户终止
- 2: 当下载时发生错误
- 3: 当解码时发生错误
- 4: 不支持音频   

## image

- src
- mode: 默认 scaleToFill,图片裁剪、缩放的模式
- lazy-load: 图片懒加载，只针对 scroll-view 下的 image 有效
- binderror: detail={errMsg:'something wrong'}（这有个锤子用）
- bindload: detail={height: '图片的高', width: '图片的宽'}

image 组件默认 300*225.   

mode 有 13 种模式，其中 4 种是缩放模式，9种是裁剪模式：  

- 缩放 scaleToFill: 不保持纵横比缩放图片，使图片的宽高完全拉伸至填满 image 元素
- 缩放 aspectFit: 保持纵横比缩放图片，使图片的长边能完全显示出来。也就是说，可以完整地将图片显示出来。
- 缩放 aspectFill: 保持纵横比缩放图片，只保证图片的短边能完全显示出来。也就是说，图片
通常只在水平或垂直方向是完整的，另一个方向将会发生截取
- 缩放 widthFix: 宽度不变，高度自动变化，保持原图宽高比不变
- top: 不缩放图片，只显示图片的顶部区域
- bottom: 不缩放图片，只显示图片的底部区域
- center: 只显示图片的中间区域
- left
- right
- top left
- top right
- bottom left
- bottom right   

## video

- src
- initial-time: 指定视频初始播放位置
- duration: 指定视频时长
- controls: 是否显示默认控件
- autoplay
- loop
- muted
- objectFit: 当视频大小与 video 容器大小不一致时，视频的表现形式,contain, fill, cover
- poster
- page-gesture: 在非全屏模式下，是否开启使用手势调节亮度与音量
- show-progress: 如果不设置，宽度大于 240 才会显示
- show-fullscreen-btn
- enable-progress-gesture: 是否开启使用手势控制进度
- danmu-list(Object Array): 弹幕列表
- danmu-btn: 是否显示弹幕按钮，只在初始化时有效，不能动态变更
- enable-danmu: 是否展示弹幕，只在初始化时有效，不能动态变更
- show-play-btn
- show-center-play-btn
- bindpause
- bindended
- bindtimeupdate: detail={currentTime, duration}
- bindfullscreenchange: 进入和退出全屏,detail={fullscreen, direction}
- bindwaiting: 视频出现缓冲时触发
- binderror

video 默认 300*225.   

## camera

- device-position: 前置或后置，值为 front, back
- flash: 闪光灯，auto, on, off
- bindstop: 摄像头在非正常终止时触发，如退出后台等情况
- binderror: 用户不允许使用摄像头时触发

## live-player

- id:
- src: 仅支持 m3u8 格式
- autoplay
- muted
- orientation
- object-fit: contain, fillCrop
- background-mute: 进入后台时是否静音
- min-cache: 最小缓冲区，单位s
- max-cache
- bindstatechange: 播放状态变化事件，detail={code}
- bindnetstatus: 网络状态通知, detail={info}
- bindfullscreenchange: 全屏变化事件，detail={direction,fullScreen}

# 开放能力

## open-data

用于展示手百开放的数据

- type: 开放数据类型，有效值：userNickName, userAvatarUrl, userGender

## web-view

web-view 组件时一个可以用来承载网页的容器，会自动铺满整个小程序页面。   

- src
- bindmessage: 网页向小程序 postMessage 时，会在特定时机（小程序后退、组件销毁、分享）
触发并收到消息，detail={data}   

web-view 中可使用 SDK 提供的接口返回小程序页面：   

- swan.webView.navigateTo
- swan.webView.navigateBack
- swan.webView.switchTab
- swan.webView.reLaunch
- swan.webView.redirectTo
- swan.webView.getEnv
- swan.webView.postMessage
- swan.makePhoneCall: 打电话
- swan.navigateToSmartProgram
- swan.login: 登录
- swan.setClipboardData: 设置剪贴板
- swan.getNetworkType: 获取网络类型
- swan.previewImage
- swan.openShare
- swan.openLocation
- swan.getLocation
- swan.chooseImage