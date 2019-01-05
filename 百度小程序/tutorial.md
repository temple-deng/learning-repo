# 简易教程

<!-- TOC -->

- [简易教程](#简易教程)
- [全局配置](#全局配置)
  - [配置界面、路径](#配置界面路径)
    - [pages](#pages)
    - [window](#window)
  - [tabBar](#tabbar)
  - [配置全局数据](#配置全局数据)
  - [SWAN 生命周期](#swan-生命周期)
- [页面开发](#页面开发)
  - [SWAN 视图](#swan-视图)
    - [基础数据绑定](#基础数据绑定)
    - [事件](#事件)
  - [CSS 与 JS](#css-与-js)
  - [页面配置](#页面配置)
  - [页面路由](#页面路由)
    - [页面栈](#页面栈)
    - [getCurrentPages()](#getcurrentpages)
    - [路由方式](#路由方式)
  - [Page](#page)
  - [API](#api)

<!-- /TOC -->

# 全局配置

## 配置界面、路径

可以通过配置 app.json 文件，设置 SWAN 的界面、路径、多 TAB 等。   

app.json 配置项如下：   


属性 | 类型 | 必填 | 描述
---------|----------|---------|---------
 pages | String Array | 是 | 设置页面路径
 window | Object | 否 | 设置页面展现
 preloadRule | Object | 否 | 分包预下载规则
 tabBar | Object | 否 | 底部 tab 栏的表现
 subpackages | Object Array | 否 | 分包结构配置

```json
{
	"pages": [
		"pages/index/index",
		"pages/detail/detail"
	],
	"window": {
		"navigationBarTitleText": "Demo"
	},
	 "tabBar": {
		"list": [{
		"pagePath": "pages/index/index",
		"text": "首页"
	}, {
		"pagePath": "pages/detail/detail",
		"text": "详情"
		}]
  }
}
```   

### pages

pages 接受一个数组，每一项都是一个字符串，指定 SWAN App 都有哪些页面。每一项代表页面的
\[路径 + 文件名\]，数组第一项代表 SWAN 初始页面。    

SWAN 中新增或减少页面的话，需要在 pages 中进行配置。配置项中不需要加文件后缀名，
SWAN 会自动解析。     

### window

用于设置 SWAN 的状态栏、导航条、标题、窗口背景色。    

首先看下页面结构的定义，上面叫导航栏、下面是标签栏。需要注意的是，自定义导航栏时，
页面布局的起点是手机的最上方，也就是包含手机自身的状态栏。刘海屏也是这样。   

通过系统信息接口 `getSystemInfoSync` 获得系统状态栏的高度（`statusBarHeight`），
并在布局全面屏手机的页面时，增加这一高度。   

在布局上，全面屏iPhone需要格外关注底部横条（Home Indicator）的配置，其高度为34pt。    

全面屏iPhone的底部横条默认透明，如开发者使用小程序底部标签栏，底部横条会自动适配底部标
签栏的背景颜色。    

![layout-bottom](https://smartprogram.baidu.com/docs/img/design/foundation/layout/14-1.png)


属性 | 类型 | 必填 | 描述
---------|----------|---------|---------
 navigationBarBackgroundColor | HexColor | #000000 | 导航栏背景颜色
 navigationBarTextStyle | String | white | 导航栏标题颜色，目前仅支持 black/white
 navigationBarTitleText | String | - | 标题文字
 navigationStyle | String | default | 导航栏样式，仅支持以下值：default(默认样式)、custome（自定义导航栏）
 backgroundColor | HexColor | #ffffff | 背景颜色
 backgroundTextStyle | String | dark | 下拉背景字体、loading 图的样式，仅支持 dark/light
 enablePullDownRefresh | Boolean | false | 是否开启下拉刷新
 onReachBottomDistance | Number | 50 | 页面上拉触底事件触发时距页面底部距离，单位为 px    

原生顶bar高度=状态栏高度（通过 `swan.getSystemInfo` 或者 `swan.getSystemInfoSync` 获取
+action高度（iOS为44px，Android为38px）。    

## tabBar

用于设置客户端底部的 tab 栏：可通过 tabBar 设置 tab 的颜色、个数、位置、背景色等内容。   

属性 | 类型 | 必填 | 描述
---------|----------|---------|---------
 backgroundColor | HexColor | 是 | tab 的背景色
 borderStyle | String | 否 | tabBar 边框颜色，仅支持 black/white 两种边框颜色，默认值为 black
 color | HexColor | 是 | 文字颜色
 selectedColor | HexColor | 是 | 选中时的文字颜色
 list | Array 是 | tab 的列表，列表个数2-5个。   

list 的属性如下：  

- pagePath: 已在 pages 中定义的页面路径，必填
- text: 文字，必填
- iconPath: 图片路径，大小限制为 40kb，建议 78px*78px，不支持网络图片，非必填
- selectedIconPath: 规格同上
- 当 position 为top 时，不显式 icon

## 配置全局数据

app.js 存放全局的 JS 逻辑。   

```js
App({
    onLaunch(evt) {
        console.log('SWAN launch');
    },
    onShow(evt) {
        console.log('SWAN show');
    },
    onHide(evt) {
        console.log('SWAN hide');
    },
    onLoad(evt) {
        console.log('SWAN load')
    },
    onError(evt) {
        console.log('SWAN error');
    },
    onUnload(evt) {
        console.log('SWAN unload');
    },
    onReady(evt) {
        console.log('SWAN ready');
    }
});
```    

## SWAN 生命周期

下面是全局 App 的生命周期

属性 | 描述 | 触发时机
---------|----------|---------
 onLaunch | SWAN 初始化的生命周期函数 | 当 SWAN App 初始化完成时触发
 onShow | SWAN App 展示时调用的生命周期函数 | 当 SWAN App 从后台进入前台或者首次初始化完成时触发
 onHide | SWAN App 隐藏时调用的生命周期函数 | 从前台进入后台
 onError | 错误监听函数 | 出错触发

下面是页面的生命周期   

属性 | 描述 | 触发时机
---------|----------|---------
 onLoad | 监听页面加载的生命周期函数 | 当 App 页面加载完成触发
 onReady | 监听页面初次渲染完成的生命周期函数 | 当 App 页面渲染完成触发
 onUnload | 页面卸载 | 页面卸载触发

从测试的结果来看，顺序大致是这样：   

- SWAN launch
- Page load
- SWAN show
- Page show
- Page ready

当切换页面时，会触发 Page hide 和另一个页面的 Page show。   

进入后台先是 Page hide 然后 SWAN hide。   

话说小程序好像有 bug，比如说在某个 tab 页然后继续点击 tab 栏里面的当前页面，当前页面会
先 hide 再 show。   

# 页面开发

## SWAN 视图

```html
<view s-for="item in items" class="single-item" bind:tap="oneItemClick" bind:touchstart="oneItemTouchStart" bind:touchmove="oneItemTouchmove" bind:touchcancel="oneItemTouchcancel" bind:touchend="oneItemTouchEnd">
	<image src="{{item.imgsrc}}" class="single-img"></image>
	<view class="single-text-area">
		<text class="single-title">
			{{item.title}}
		</text>
		<view s-if="{{item.tags}}" class="tag-area">
		<text s-for="tag in item.tags" class="{{tag.className}}">
			{{tag.content}}
		</text>
		</view>
	</view>
</view>
<view class="view-more" bind:tap="loadMore">
	<text>点击加载更多</text>
</view>
```   

这样看 view 有点像 div 元素。而且也确实和 div 元素一样有 block 的效果。    

### 基础数据绑定

```html
<!-- xxx.swan -->
<view>
	Hello My {{ name }}
</view>
```   

```js
// xxx.js
Page({
	data: {
		name: 'SWAN'
	}
});
```   

**循环**   

开发者可以通过在元素上添加 `s-for 指令，来渲染一个列表:   

```html
<view>
	<view s-for="p in persons">
		{{p.name}}
	</view>
</view>
```   

```js
Page({
	data: {
		persons: [
			{ name: 'superman' },
			{ name: 'spiderman' }
		]
	}
});
```  

**条件**   

开发者可以通过在元素上添加s-if指令，来在视图层进行逻辑判断：   

```html
<view s-if="is4G">4G</view>
<view s-elif="isWifi">Wifi</view>
<view s-else>Other</view>
```  


### 事件

开发者可以使用 `bind:` + 事件名 来进行事件绑定。   

```html
<view bind:tap="onTap">Tap me</view>
```   

当开发者绑定方法到事件，事件触发时，SWAN 会给触发的方法传递事件对象，事件对象因事件不同
而不同，目前基础的事件对象结构为：   

- type(String): 事件类型
- currentTarget(Object): 事件触发的属性集合

**dataset**   

开发者可以在组件中自定义数据，并在事件发生时，由 SWAN 所在事件对象中，传递给绑定函数。   

```html
<view data-swan="1" bind:tap="viewtap">dataset-test</view>
```   

```js
Page({
	viewtap: function(evt) {
		console.log('value is: ', evt.currentTarget.dataset.swan)
	}
});
```   

**touches**   

开发者在接收到触摸类事件后，在事件对象上，可以接收到当前停留在屏幕上的触摸点。   

Touch 对象：   

- pageX, pageY: 距离文档左上角的距离
- clientX, clientY: 距离屏幕视口左上角的距离   

## CSS 与 JS

+ 逻辑层将数据进行更新后，会触发视图更新
+ 在 app.js 中使用 App 方法、在页面 JS 中使用 Page 方法，来进行页面的逻辑管理
+ 框架中不可使用 window, document, location, navigator, localStorage, history 等 API

## 页面配置

小程序页面可以使用.json文件来对本页面的窗口表现进行配置。    

页面的配置只能设置 app.json 中部分 window 配置项的内容，页面中配置项会覆盖 app.json
的 window 中相同的配置项。（但是文档中并没有说明哪些配置项不能用啊）   

页面的.json只能设置 window 相关的配置项，以决定本页面的窗口表现，所以无需写 window
这个键。    

## 页面路由

### 页面栈


路由方式 | 页面栈表现
----------|---------
 初始化 | 新页面入栈
 打开新页面 | 新页面入栈
 页面重定向 | 当前页面出栈，新页面入栈
 页面返回 |  页面不断出栈，直到目标返回页，新页面入栈
 Tab 切换 | 页面全部出栈，只留下新的 Tab 页面

### getCurrentPages()

`getCurrentPages()` 函数用于获取当前页面栈的实例，以数组形式按栈的顺序给出，第一个
元素为首页，最后一个元素为当前页面。    

### 路由方式

对于路由的触发方式以及页面生命周期函数如下：   


路由方式 | 触发时机 | 路由前页面 | 路由后页面
---------|----------|---------|---------
 初始化 | 智能小程序的第一个页面 | - | onLoad, onShow
 打开新页面 | 调用 API `swan.navigateTo` 或使用组件 | onHide | onLoad, onShow
 页面重定向 | 调用 API `swan.redirectTo` 或使用组件 | onUnload | onLoad, onShow
 页面返回 | 调用 API `swan.navigateBack` 或使用组件或用户按左上角返回按钮 | onUnload | onShow
 Tab 切换 | 调用 API `swan.switchTab` 或使用组件或用户切换 Tab | - | 各种情况请参考下表
 重启动 | 调用 API `swan.reLaunch` 或使用组件 | onUnload | onLoad, onShow

Tab 切换对应的生命周期（以 A、B 页面为 Tabbar 页面，C 是从 A 页面打开的页面，D 页面
是从 C 页面打开的页面为例）：   


当前页面 | 路由后页面 | 触发的生命周期
---------|----------|---------
 A | B | A.onHide(), B.onLoad(), B.onShow()
 A | B（再次打开） | A.onHide(), B.onShow()
 C | A | C.onUnload(), A.onShow()
 C | B | C.onUnload(), B.onLoad(), B.onShow()
 D | B | D.onUnload(), C.onLoad(), B.onLoad(), B.onShow()
 D(从转发进入) | A | D.onUnload(), A.onLoad(), A.onShow()
 D(从转发进入) | B | D.onUnload(), B.onLoad(), B.onShow()    

- navigateTo, redirectTo 只能打开非 tabBar 页面。
- switchTab 只能打开 tabBar 页面。
- reLaunch 可以打开任意页面。

## Page

参数说明：   

- data: 页面的初始数据
- onLoad
- onReady
- onShow
- onHide
- onUnload
- onPullDownRefresh
- onReachBottom
- onShareAppMessage
- onError
- 其他：开发者可以添加任意的函数或数据到 object 参数中，在页面的函数中用 this 可以访问    

## API

智能小程序为开发者提供了百度 App 提供的丰富的端能力。使用方式比较简单，直接调用 SWAN
对象上的端能力方法，或者 Page 对象中 this 上挂载的方法。    

```js
swan.showToast({
	title: '我是标题'
});
Page({
	data: {},
	onLoad: function () {
		this.createCanvasContext();
	}
});
```    

Last Update: 2018-12-31