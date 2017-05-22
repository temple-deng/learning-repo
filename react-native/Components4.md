# Compoment

## 1. ScrollView

包装了平台 ScrollView 的组件，集成了触碰锁定响应系统。  

ScrollList 必须有固定的高度才能工作，因为它只是将高度不定的子组件包裹在一个固定的容器中。
为了去设置固定的高度，可以直接设置视图的高度（不推荐），或者确保所有父级视图有固定的高度。
在视图栈的任意一个位置忘记使用{flex:1}都会导致错误。  

ScrollView内部的其他响应者尚无法阻止ScrollView本身成为响应者。  

#### 属性

+ **ViewPropTypes props**

+ **contentContainerStyle**: 这些样式会应用到一个内层的内容容器上，所有的子视图都会包裹在内容容器内。  

+ **horizontal** *bool*

+ **keyboardDismissMode** *enum('none', 'interactive', 'on-drag')*  

用户拖拽滚动视图的时候，是否要隐藏软键盘。`none`（默认值），拖拽时不隐藏软键盘。`on-drag` 当拖拽开始的时候隐藏软键盘。`interactive` 软键盘伴随拖拽操作同步地消失，并且如果往上滑动会恢复键盘。安卓设备上不支持这个选项，会表现的和none一样。  

+ **keyboardShouldPersistTaps** *enum('always', 'never', 'handled')*  
