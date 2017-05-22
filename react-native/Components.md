# Components

## 1. ActivityIndicator

展示一个圆形的加载指示器

#### 属性

#####  ViewPropTypes props

+ **animating** *bool*: 是否应该显示指示器，默认为 true 显示，false就隐藏。

+ **color** *color*: 滚轮的前景色，默认是灰色。

+ **size** *enum('small', 'large'),  number*: 指示器的大小，默认 small，如果是数值的
话只在 Android 支持。

+ <mark>ios</mark> **hideWhebStopped** *bool*: 是否指示器在动画停止该隐藏，默认为 true。

貌似即使在隐藏状态也会占据空间。


## 2. Button

#### 属性

+ **accessibilityLabel** *string* : 用于给残障人士显示的文本（比如读屏器软件可能会读取这一内容）

+ **color** *color*: 在IOS下是文字的颜色，在Android下是背景的颜色。

+ **disabled** *boolean*: 如果为 true，就禁用组件的所有交互。

+ **onPress** (required) () => any: 用户点击按钮时的处理函数。

+ **testID** *string*: 用来在端到端测试中定位 View

+ **title** (required) *string*: button 内的文本内容


## 3.DatePickerIOS

使用`DatePickerIOS`来在iOS平台上渲染一个日期/时间选择器。这是一个受约束的(Controlled)组件，所以你必须监听`onDateChange`回调函数并且及时更新`date`属性来使得组件更新，否则用户的修改会立刻被撤销来确保当前显示值和`props.date`一致。  

#### 属性

##### ViewPropTypes props

+ **date** (required) *Date*: 当前选中的日期

+ **maximumDate** *Date*: 最大的日期，限制可能的日期值的范围

+ **minimumDate** *Date*

+ **minuteInterval** *enum(1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30)*: 可以选择分钟的间隔。

+ **mode** *enum('date', 'time', 'datetime')*

+ **onDateChange** (required) *function*: 日期改动时的处理函数。函数只接受一个 Date 对象做参数，代表了新的日期和时间。

+ **timeZoneOffsetInMinutes** *number*：时区差，单位是分钟。

默认情况下，选择器会选择设备的默认时区。通过此参数，可以指定一个时区。举个例子，要使用北京时间（东八区），可以传递8 * 60。  

## 4. DrawerLayoutAndroid

封装了平台DrawerLayout（仅限安卓平台）的React组件。抽屉（通常用于导航切换）是通过`renderNavigationView`方法渲染的，并且`DrawerLayoutAndroid`的直接子视图会成为主视图（用于放置你的内容）。导航视图一开始在屏幕上并不可见，不过可以从`drawerPosition`指定的窗口侧面拖拽出来，并且抽屉的宽度可以使用`drawerWidth`属性来指定。

```javascript
render: function() {
  var navigationView = (
    <View style={{flex: 1, backgroundColor: '#fff'}}>
      <Text style={{margin: 10, fontSize: 15, textAlign: 'left'}}>I am in the Drawer!</Text>
    </View>
  );
  return (
    <DrawerLayoutAndroid
      drawerWidth={300}
      drawerPosition={DrawerLayoutAndroid.positions.Left}
      renderNavigationView={() => navigationView}>
      <View style={{flex: 1, alignItems: 'center'}}>
        <Text style={{margin: 10, fontSize: 15, textAlign: 'right'}}>Hello</Text>
        <Text style={{margin: 10, fontSize: 15, textAlign: 'right'}}>World!</Text>
      </View>
    </DrawerLayoutAndroid>
  );
},
```

#### 属性

##### ViewPropTypes props

+ **drawerBackgroundColor** *color*: 指定背景色，默认是白色。然而试的时候没效果啊

+ **drawerLockMode** *enum('unlocked', 'locked-closed', 'locked-open')*: 指定锁定模式。
drawer可以在3中模式下锁定。
  - unlocked(default): 意味着 drawer 会响应手势开关
  - locked-closed: 意味着一直保持关闭状态，不会响应手势
  - locked-open: 保持开启状态，不会响应手势（试验时无效果，出不来）
但是仍可以通过 `openDrawer/closeDrawer`主动开关。  

+ **drawerPosition** *enum(DrawerConsts.DrawerPosition.Left,DrawerConsts.DrawerPosition.Right)*:  声明 drawer 会滑动到屏幕的哪一侧。试验时使用的是 `DrawerLayoutAndroid.positions.Left/DrawerLayoutAndroid.positions.Right`。  

+ **drawerWidth** *number*: 指定 drawer 的宽度。

+ **keyboardDismissMode** *enum('none', 'on-drag')*: 指定在拖拽的过程中是否要隐藏软键盘。'none'（默认）,不会隐藏键盘，'on-drag' 键盘会在拖拽开始时隐藏。

+ **onDrawerClose** *function*: 当 navigation view 关闭时调用的函数。

+ **onDrawerOpen** *function*: 当 navigation view 打开时调用的函数。

+ **onDrawerSlide** *function*: 当 navigation view 交互时调用的函数。貌似就是来回拉出来拖回去的时候，而且在拖拽过程中可能调用多次。

+ **onDrawerStateChanged** *function*: 当 drawer 的状态变化时调用的函数。drawer 有3种
状态：
  - idle: 此时没有与 navigation view 交互。
  - dragging: 此时正在交互过程中。
  - setting：刚刚交互完成，正在完成开启或者关闭的动画。

+ **renderNavigationView** (required) *function* 将要在 drawer 渲染的视图 navigation view

+ **statusBarBackgroundColor** *color*: 让 drawer 占满全屏, 然后好像再添加一个 状态栏，允许从状态栏打开。但是实验时效果明显有问题。。。

#### 方法

+ **openDrawer()**

+ **closeDrawer()**

## 5. FlatList

高性能的简单列表组件，支持下面这些常用的功能：

+ 完全跨平台。
+ 支持水平布局模式。
+ 行组件显示或隐藏时可配置回调事件。
+ 支持单独的头部组件。
+ 支持单独的尾部组件。
+ 支持自定义行间分隔线。
+ 支持下拉刷新。
+ 支持上拉加载。
+ 支持跳转到指定行（ScrollToIndex）。  

如果需要分组/类/区（section），请使用`<SectionList>`。  

最简单的例子：  

```javascript
<FlatList
  data={[{key: 'a'}, {key: 'b'}]}
  renderItem={({item}) => <Text>{item.key}</Text>}
/>
```  

#### 属性

+ **ItemSeparatorComponent** *ReactClass &lt;any&gt;*: 在每个 item 之间渲染，但不在顶部和底部渲染。

+ **ListFooterComponent** *ReactClass &lt;any&gt;*: 在所有 items 的底部渲染

+ **ListHeaderComponent** *ReactClass &lt;any&gt;*: 在所有 items 顶部渲染

+ **columnWrapperStyle** *StyleObj*: 当 numColumns>1时为多行item设置样式

+ **data** (required) *Array&lt;ItemT&gt;*: 为了简化起见，data属性目前只支持普通数组。

+ **extraData** *any*: 如果有除`data`以外的数据用在列表中（不论是用在`renderItem`还是Header或者Footer中），请在此属性中指定。同时此数据在修改时也需要先修改其引用地址（比如先复制到一个新的Object或者数组中），然后再修改其值，否则界面很可能不会刷新。

+ **getItem**

+ **getItemCount**

+ **getItemLayout** *(data: Array&lt;ItemT&gt;, index: number) => {length: number, offset: number, index: number}*: 是一个可选的优化，用于避免动态测量内容尺寸的开销，不过前提是你可以提前知道内容的高度。如果你的item 高度是固定的，`getItemLayout`用起来就既高效又简单，类似下面这样：  

```javascript
getItemLayout={(data, index) => (
  {length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index}
)}
```

注意如果你指定了`SeparatorComponent`，请把分隔线的尺寸也考虑到offset的计算之中。  

+ **horizontal** *boolean*: 水平布局。

+ **initialNumToRender** (required) *number*:  指定一开始渲染的元素数量，最好刚刚够填满一个屏幕，这样保证了用最短的时间给用户呈现可见的内容。注意这第一批次渲染的元素不会在滑动过程中被卸载，这样是为了保证用户执行返回顶部的操作时，不需要重新渲染首批元素。

+ **keyExtractor** (required) *(item: ItemT, index: number) => string*: 此函数用于为给定的item生成一个不重复的key。Key的作用是使React能够区分同类元素的不同个体，以便在刷新时能够确定其变化的位置，减少重新渲染的开销。若不指定此函数，则默认抽取item.key作为key值。若item.key也不存在，则使用数组下标。  

+ **legacyImplementation** *boolean*

+ **numColumns** *number*: 多列布局只能在非水平模式下使用，即必须是horizontal={false}。此时组件内元素会从左到右从上到下按Z字形排列，类似启用了flexWrap的布局。组件内元素必须是等高的——暂时还无法支持瀑布流布局。  

+ **onEndReached** *(info: {distanceFromEnd: number}) => void*: 当所有的数据都已经渲染过，并且列表被滚动到距离最底部不足`onEndReachedThreshold`个像素的距离时调用。  

+ **onEndReachedThreshold** *number*: 注意是以可见长度的列表为单位。所以如果是0.5，当内容的结尾处于列表的可见长度的一半之内时，就触发回调。  

+ **onRefresh** *() => void* : 如果设置了此选项，则会在列表头部添加一个标准的RefreshControl控件，以便实现“下拉刷新”的功能。同时你需要正确设置refreshing属性。  

+ **onViewableItemsChanged** *(info: { viewableItems: Array&lt;ViewToken&gt;, changed: Array&lt;ViewToken&gt;}) => void*: 在可见行元素变化时调用。可见范围和变化频率等参数的配置请设置viewabilityconfig属性.  

+ **refreshing** *boolean*: 在等待加载新数据时将此属性设为true，列表就会显示出一个正在加载的符号。  

+ **renderItem** (required) *(info: {item: ItemT, index: number}) => ?React.Element&lt;any&gt;*: 根据行数据data渲染每一行的组件。典型用法：  

```javascript
_renderItem = ({item}) => (
  <TouchableOpacity onPress={() => this._onPress(item)}>
    <Text>{item.title}}</Text>
  </TouchableOpacity>
);
...
<FlatList data={[{title: 'Title Text', key: 'item1'}]} renderItem={this._renderItem} />
```  

除data外还有第二个参数index可供使用。  

+ **viewabilityConfig**

#### 方法

+ **scrollToEnd(params: object)**: 滚动到底部。如果不设置getItemLayout属性的话，可能会比较卡。  

+ **scrollToIndex(params: object)**: 滚动在指定索引的项目处，定位在 viewable area 时 `viewPosition` 0在顶部，1在底部，0.5在中部。

+ **scrollToItem(params: object)**: 线性扫描数据，可能的话尽量用 `scrollToIndex`。  

+ **scrollToOffset(params: object)**

+ **recordInteraction()**: 告诉列表发生了一次交互。  
