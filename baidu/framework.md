# 框架

# 逻辑层

## 方法说明

智能小程序的逻辑层使用 JS 编写。   

逻辑层将数据进行处理后发送给视图层，同时接受视图层的反馈。   

在 JS 的基础上，我们提供了一些框架方法：   

1. 提供了 `App` 和 `Page` 方法
2. 提供了 `getApp` 和 `getCurrentPages` 方法，分别用来获取 App 实例和当前页面栈
3. 提供了丰富的 API，如扫一扫、orcIdCard 等智能小程序能力
4. 每个页面有独立的作用域，并提供模块化
5. 框架并非运行在浏览器中，所以 JS 在 Web 中的一些能力都无法使用，如 document, window 等

## 注册程序

### App

`App()` 函数用来注册一个智能小程序。接受一个 Object 作为参数，用以指定智能小程序的生命
周期函数等。   

- `onLaunch`
- `onShow`
- `onHide`
- `onError`
- `onPageNotFound`
- 其他：开发者可以添加任意的函数或者数据到 Object 参数中，用 this 可以访问    

前台、后台定义：当用户点击右上角的关闭，或者按了设备的 Home 键离开智能小程序，智能小程序
没有直接销毁，而是进入到了后台。    

**onLaunch 参数**    


字段 | 类型 | 说明
---------|----------|---------
 scene | String | 打开智能小程序的场景值
 path | String | 打开小程序的路径
 query | Object | 打开小程序的 query
 shareTicket | String | 标记转发对象
 referrerInfo | Object | 当场景为由从另一个小程序打开时，返回此字段
 referrerInfo.appId | String | 来源小程序的 appKey
 referrerInfo.extraData | Object | 来源小程序传过来的数据，scene=1037 或 1038 时支持

**onShow 参数**   

字段 | 类型 | 说明
---------|----------|---------
 scene | String | 打开智能小程序的场景值
 path | String | 打开小程序的路径
 query | Object | 打开小程序的 query
 shareTicket | String | 标记转发对象
 referrerInfo | Object | 当场景为由从另一个小程序打开时，返回此字段
 referrerInfo.appId | String | 来源小程序的 appKey
 referrerInfo.extraData | Object | 来源小程序传过来的数据，scene=1037 或 1038 时支持
 extryType | String 展现的来源标识，取值为 user/schema/sys。user:表示通过 home 前后台切换或者解锁屏幕等方式调起；schema:表示通过协议调起；sys:其它
 appURL | String | 展现时的调起协议，仅当 entryType 值为 schema 时存在

## 注册页面

### Page

Page 函数用来注册一个页面，接受一个 object 参数，其指定页面的初始数据、生命周期函数、
事件处理函数等。   

- `data`: 页面的初始数据
- `onLoad`
- `onReady`
- `onShow`
- `onHide`
- `onUnload`
- `onForceReLaunch`: 监听页面重启，单击重启按钮时触发
- `onPullDownRefresh`: 监听用户下拉动作
- `onReachBottom`: 上拉触底事件
- `onShareAppMessage`: 用户点击右上角转发
- `onPageScroll`: 页面滚动触发事件的处理函数
- `onTabItemTap`: 当前是 tab 页时，点击 tab 时触发（这个事件没试出来什么时候触发）
- 其他：开发者可以添加任意的函数或数据到 object 参数中

### 初始化数据

初始化数据将在页面第一次渲染时使用。data 将会以 JSON 的形式由逻辑层传至渲染层，所以其数据
必须是可以转成 JSON 的格式：字符串、数字、布尔值、对象、数组。   

### 页面相关事件处理函数

**onPullDownRefresh**    

当处理完数据刷新后，`swan.stopPullDownRefresh` 可以停止当前页面的下拉刷新。   

**onPageScroll**   

参数为 Object，包含属性 `scrollTop`。   

**onShareAppMessage**   

此事件需要返回一个 Object，用于自定义转发内容。   

- `title`(String): 转发标题，默认值为当前的小程序的名称
- `path`(String): 转发路径，默认是当前页面 path，必须是以 `/` 开头的完整路径    

### Page.prototype.setData

用户将数据从逻辑层发送到视图层，当开发者调用 `setData` 后，数据的变化，会引起视图层的更新。

- `data`(Object, required): 变更的数据
- `callback`(optional): 页面更新渲染完毕后的回调函数

data 的 key 可以以数据路径的形式给出，支持改变数组中的某一项或对象的某个属性，如 `array[2].message`,
`a.b.c.d`，并且不需要再 `this.data` 中预先定义。   

```js
Page({
  data: {
    name: '',
    age: 0
  },
  tap: function() {
    this.setData({
      age: 1
    })
  }
});
```   

那这个意思是在事件回调中，this 是指向当前页面的实例的。   

## 页面路由

### 模块化

可以将一些公共的代码抽离成为一个单独的 js 文件，作为一个模块。模块只有通过 `module.exports`
或者 `exports` 才能对外暴露接口。   

可以在需要使用这些模块的文件中，对模块进行引用：   

```js
var utils = require('./utils');
Page({
  onLoad: function() {
    utils.logName()
  }
});
```   

编译工具提供依赖分析模式和普通编译模式两种编译模式：   

- **依赖分析模式**：无用文件不会被打包到产出中，支持 node_modules 的使用
- **普通编译模式**：不支持 node_modules 的使用

# 视图层

## 数据绑定

**基础数据绑定**    

数据绑定和许多模板引擎一样，数据包裹在双大括号里面。   

双向绑定的数据需包裹在 `{= =}` 中。   

**控制属性（不需要被双大括号包裹）**    

```html
<!-- condition-demo.swan -->
<view s-if="flag"></view>
```   

**运算**   

SWAN 模板提供了丰富的表达式类型支持：   

- 数据访问（普通变量、属性访问）
- 一元否定
- 二元运算
- 二元关系
- 三元条件
- 括号
- 字符串
- 数值
- 布尔

根据测试情况来看，好像暂不支持函数调用表达式。   

```html
<text>{{name}}</text>
<text>{{person.name}}</text>
<text>{{person[1]}}</text>

<!-- 一元否定 -->
<text>{{!isOk}}</text>
<text>{{!!isOk}}</text>

<!-- 二元运算 -->
<text>{{num1 + num2}}</text>
<text>{{num1 - num2}}</text>
<text>{{num1 + num2 * num3}}</text>

<!-- 二元关系 -->
<text>{{num1 > num2 ? num1 : num2}}</text>

<!-- 数组字面量 -->
<text>{{ ['john', 'tony', 'lbj'] }}</text>
```   

关系表达式的结果可能是 true 或 false，就直接显示这两个单词。数组字面量相当于使用 `join`
方法连接后的字符串。   

**对象字面量（对象字面量是三个大括号包裹）**    

对象字面量支持了在模板里重组对象以及使用扩展运算符 ... 来展开对象。   

```html
<template name="tag-card">
  <view>
    <text>标签：{{tag}}}</text>
    <text>昵称：{{nockname}}</text>
  </view>
</template>

<template name="person-card">
  <view>
    <text>位置：{{pos}}</text>
    <text>姓名：{{name}}</text>
  </view>
</template>

<template name="team-card">
  <view s-for="item, index in teams">
    <text>球队：{{index}} - {{item}}</text>
  </view>
</template>

<template name="age-card">
  <view>
    <text>年龄：{{age}}</text>
  </view>
</template>

<template is="person-card" data="{{person}}" />

<!-- 对象字面量 -->
<template is="team-card" data="{{ {teams} }}" />
<template is="tag-card" data="{{ {tag, nickname: 'king' }}}" />
<template is="age-card" data="{{ {...person} }}" />
```   

```js
Page({
  data: {
    person: {name: 'Lebron James', pos: 'SF', age: 33},
    teams: ['Cleveland Cavaliers', 'Miami Heat', 'Los Angeles Lakers'],
    tag: 'basketball'
  }
})
```   

## 循环

默认情况下，下标索引是 index，当前元素为 item:   

```html
<view>
  <view s-for="person">
    {{index}}: {{item.name}}
  </view>
</view>
```   

### 简写

通过简写的方式，指定下标索引和数组当前变量名。   

```html
<view>
  <view s-for="p, index in persons">
    {{index}}: {{p.name}}
  </view>
</view>
```   

也可以通过使用 `s-for-index` 来指定索引，`s-for-item` 来指定变量名：   

```html
<view>
  <view s-for="persons" s-for-index="idx" s-for-item="p">
    {{idx}}: {{p.name}}
  </view>
</view>
```   

## 条件

### block s-if

block 虚拟组件，在渲染时不会包含自身，只会渲染其内容。可以用来渲染一组组件或者标签。  

```html
<block s-if="flag">
  <view> name </view>
  <view> age </view>
</block>
```   

## 模板

SWAN 提供模板 template 的用法，旨在提供工程化和代码可维护性，可以在模板中定义代码片段，
并在外界注入值，然后在合适的时机调用。   

### 定义模板

`name` 属性，定义了模板的名字，`<template>` 内定义代码片段。   

### 使用模板

通过 `is` 属性，声明要使用的模板，`data` 是所需要传入到模板的值。   

## 事件处理

事件的分类，智能小程序的视图中事件分为冒泡事件和非冒泡事件。   

冒泡事件如下列表展示，不在列表展示的事件均为非冒泡事件。   

事件类型 | 触发时机
----------|---------
 tap | 触摸后马上离开
 longtap | 触摸后超过 350ms 再离开
 longpress | 触摸后超过 350ms 再离开，如果是指定了事件回调函数并触发了这个事件，tap 事件将不被触发
 touchstart | 触摸开始时
 touchmove | 触摸后移动时
 touchcancel | 触摸后被打断时，如来电等
 touchend | 触摸结束时
 touchforcechange | 支持 3D Touch 的 iPhone 设备，重按时会触发    

### 事件绑定和冒泡

事件绑定在组件上，与属性的写法相同（以 key, value 的形式）。   

key 以 `bind` 或 `catch` 开头，衔接事件类型，例如 `bindtap`, `catchtouchcancel`。
也可以在 `bind` 和 `catch` 后可以紧跟一个冒号，如 `bind:tap`, `catch:touchstart`，
其功能不变。   

bind 和 catch 的区别是 bind 事件绑定不会阻止冒泡事件向上冒泡，catch 事件绑定可以阻止
冒泡事件向上冒泡。   

### 事件的捕获

捕获监听采用 `capture-bind`, `capture-catch` 关键字。  

### 事件对象

默认当组件触发事件时，逻辑层绑定事件的处理函数会收到一个默认参数，即事件对象。   

属性 | 类型 | 说明
---------|----------|---------
 type | String | 事件的类型
 timeStamp | Integer | 事件触发的时间戳（毫秒）
 target | Object | 触发事件的组件的属性值集合
 currentTarget | Object | 当前组件的属性值集合
 detail | Object | 自定义事件对象属性列表
 touches | Array | -
 changedTouches | Array | -

**target**   


属性 | 类型 | 说明
---------|----------|---------
 id | String | 触发事件组件的 id
 tagName | String | 触发事件组件的类型
 dataset | Object | -

**currentTarget** 属性同 target。   

**dataset**   

书写方式： 以 data- 开头，多个单词由连字符-链接，不能有大写(大写会自动转成小写)，最终的
-在 dataset 中会将连字符转成驼峰式写法。   

**touch**    


属性 | 类型 | 说明
---------|----------|---------
 identifier | Number | 触摸点的标识符
 clientX, clientY | Number | 距离页面可现实区域（屏幕除去导航条）左上角的 X 轴与 Y 轴的距离
 pageX, pageY | Number | -

## 引用

SWAN 可以通过 `import` 和 `include` 来引用文件。   

### import

通过 `import` 和 `template` 配合使用，可以将代码分离以及复用。   

```html
<!-- personCard.swan -->
<template name="person-card">
  <view>
    <text>位置：{{pos}}</text>
    <text>姓名：{{name}}</text>
  </view>
</template>
```  

