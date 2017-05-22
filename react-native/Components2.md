# Components

> Image,


## 1. Image

#### 属性

+ **onError** *function*: 加载出错调用，参数 `{nativeEvent: {error}}`

+ **onLayout** *function* 当元素挂载或者布局改变的时候调用, 参数 `{nativeEvent: {layout: {x, y, width, height}}}`

+ **onLoad** *function*

+ **onLoadEnd** *function*: 加载成功或失败时调用

+ **onLoadStart** *function*: 加载开始时调用

+ **resizeMode** *enum('cover', 'contain', 'stretch', 'repeat', 'center')*: 决定当组件尺寸和图片尺寸不成比例的时候如何调整图片的大小。  
  - `cover`: 在保持图片宽高比的前提下缩放图片，直到宽度和高度都大于等于容器视图的尺寸（如果容器有padding内衬的话，则相应减去）。译注：这样图片完全覆盖甚至超出容器，容器中不留任何空白。  
  - `contain`: 在保持图片宽高比的前提下缩放图片，直到宽度和高度都小于等于容器视图的尺寸（如果容器有padding内衬的话，则相应减去）。译注：这样图片完全被包裹在容器中，容器中可能留有空白
  - `stretch`: 拉伸图片且不维持宽高比，直到宽高都刚好填满容器。
  - `repeat`: 重复平铺图片直到填满容器。图片会维持原始尺寸。仅iOS可用。
  - `center`: 居中不拉伸。  

+ **source** *{uri: string}, number*

+ <mark>android</mark> **resizeMethod** *enum('auto', 'resize', 'scale')*:当图片实际尺寸和容器样式尺寸不一致时，决定以怎样的策略来调整图片的尺寸。默认值为`auto`。  
  - auto：使用启发式算法来在resize和scale中自动决定。
  - resize： 在图片解码之前，使用软件算法对其在内存中的数据进行修改。当图片尺寸比容器尺寸大得多时，应该优先使用此选项。
  - scale：对图片进行缩放。和resize相比， scale速度更快（一般有硬件加速），而且图片质量更优。在图片尺寸比容器尺寸小或者只是稍大一点时，应该优先使用此选项。  

+ <mark>ios</mark> **accessibilityLabel** *node*

+ ios **accessible** *bool*

+ ios **blurRadius** *number* 为图片添加一个指定半径的模糊滤镜。

+ ios **capInsets** *{top: number, left: number, bottom: number, right: number}*:  当图片被缩放的时候，capInsets指定的角上的尺寸会被固定而不进行缩放，而中间和边上其他的部分则会被拉伸。  

+ ios **defaultSource**: *{uri: string, width: number, height: number, scale: number}, number*: 在读取图片时默认显示的加载提示图片.

+ ios **onPartialLoad** *function*

+ ios **onProgress** *function*: `{nativeEvent: {loaded, total}}`

#### 方法

+ static `getSize(uri:string, success:function, failure:function)`

在展示图片前获取图片的宽高。为了获取图片的宽高，图片还是会被加载或者下载，之后就可以缓存，
所有可以用这个方法预加载。无法在静态图片上工作。  

+ static `prefetch(url:string)`

## 2. KeyboardAvoidingView

本组件用于解决一个常见的尴尬问题：手机上弹出的键盘常常会挡住当前的视图。本组件可以自动根据键盘的位置，调整自身的position或底部的padding，以避免被遮挡。  

#### 属性

##### ViewPropTypes props

+ **behavior** *enum('height', 'position', 'padding')*

+ **contentContainerStyle** *ViewPropTypes.style*: 如果设定behavior值为'position'，则会生成一个View作为内容容器。此属性用于指定此内容容器的样式。

+ **keyboardVerticalOffset** *number*: 有时候应用离屏幕顶部还有一些距离（比如状态栏等等），利用此属性来补偿修正这段距离。

#### 方法

+ relativeKeyboardHeight(keyboardFrame: object):
+ onKeyboardChange(event: object)
+ onLayout(event: object)


## 3. ListView

一个核心组件，用于高效地显示一个可以垂直滚动的变化的数据列表。最基本的使用方式就是创建一个`ListView.DataSource`数据源，然后给它传递一个普通的数据数组，再使用数据源来实例化一个`ListView`组件，并且定义它的`renderRow`回调函数，这个函数会接受数组中的每个数据作为参数，返回一个可渲染的组件（作为`ListView`的每一行）。  

简单的例子：

```javascript
constructor(props) {
  super(props);
  var ds = new ListView.DataSource({
    rowHasChanged: (r1, r2) => r1 !== r2
  });
  this.state = {
    dataSource: ds.cloneWithRows(['row1', 'row2'])
  }
}

render() {
  return (
    <ListView
      dataSource = {this.state.dataSource}
      renderRow = {(rowData) => <Text>{rowData}</Text>}
  )
}
```  

`ListView`还支持一些高级特性，譬如给每段/组(section)数据添加一个带有粘性的头部（类似iPhone的通讯录，其首字母会在滑动过程中吸附在屏幕上方）；在列表头部和尾部增加单独的内容；在到达列表尾部的时候调用回调函数(`onEndReached`)，还有在视野内可见的数据变化时调用回调函数(`onChangeVisibleRows`)，以及一些性能方面的优化。  

有一些性能优化使得`ListView`可以滚动的更加平滑，尤其是在动态加载可能很大（或者概念上无限长的）数据集的时候：  

+ 只重新渲染有变化的行—— 提供给数据源的 `rowHasChanged` 函数会用来在由于某一行的数据变化了后，告诉 `ListView` 需要重新渲染这一行。

+ 受限的行渲染速度—— 默认情况下，每次 event-loop 只渲染一行。可以用`pageSize`属性配置。减少当渲染多行时的掉帧现象。  

#### 属性

##### ScrollView props

+ **dataSource**: 使用的 `ListView.DataSource` 实例。

+ **enableEmptySections**  *bool* : 一个用来表明空的 section 的头部是否该渲染的标识。  

+ **initialListSize** *number*: 在组件初始挂载时要渲染的行数。  

+ **onChangeVisibleRows** *function* (visibleRows, changedRows)=>void: 当可见的行的集合变化的时候调用此回调函数。当可见的行的集合变化的时候调用此回调函数。visibleRows 以 `{ sectionID: { rowID: true }}`的格式包含了所有可见行，而changedRows 以`{ sectionID: { rowID: true | false }}` 的格式包含了所有刚刚改变了可见性的行，其中如果值为true表示一个行变得可见，而为false表示行刚刚离开可视区域而变得不可见。  

+ **onEndReached** *function*: 当所有的数据都已经渲染过，并且列表被滚动到距离最底部不足onEndReachedThreshold个像素的距离时调用。原生的滚动事件会被作为参数传递。译注：当第一次渲染时，如果数据不足一屏（比如初始值是空的），这个事件也会被触发，请自行做标记过滤。  

+ **onEndReachedThreshold** *number*

+ **pageSize** *number*: 每次 event loop 渲染的行数。  

+ **removeClippedSubviews** *bool*: 用于提升大列表的滚动性能。需要给行容器添加样式overflow:'hidden'。（Android已默认添加此样式）。此属性默认开启。  

+ **renderFooter** *function* () => renderable:  页头与页脚会在每次渲染过程中都重新渲染（如果提供了这些属性）。如果它们重绘的性能开销很大，把他们包装到一个StaticContainer或者其它恰当的结构中。页脚会永远在列表的最底部，而页头会在最顶部。  

+ **renderHeader** *function*

+ **renderRow** *function* (rowData, sectionID, rowID, highlightRow) => renderable : 从数据源(Data source)中接受一条数据，以及它和它所在section的ID。默认情况下参数中的数据就是放进数据源中的数据本身，不过也可以提供一些转换器。当某一行通过调用 `highlightRow(sectionID, rowId)`变得高亮时。这会在 renderSeparator 中的 `adjacentRowHighlighted` 设置一个布尔值，允许我们去控制行上下的分隔符的高亮。也可以通过调用 highlightRow(null) 来重置某一行的高亮状态。  

+ **renderScrollComponent** *function* (props) => renderable : 一个返回可滚动组件的函数，列表的行会在这个组件中渲染。默认翻译一个接收给定 props 的 ScrollView。  

+ **renderSectionHeader** *function* (sectionData, sectionID) => renderable : 如果提供了
这个属性，就会在这个 section 上渲染一个头部。  

+ **renderSeparator** *function* (sectionID, rowID, adjacentRowHighlighted) => renderable : 如果提供了这个属性，就会在每行之下渲染这个组件作为分隔符，不过如果最后一行下面还有一个 section 头部，则最后一行不会渲染分隔符。  

+ **srollRenderAheadDistance** *number* :当一个行接近屏幕范围多少像素之内的时候，就开始渲染这一行。  

+ **stickyHeaderIndices** *[number]* : 一个子视图下标的数组，用于决定哪些成员会在滚动之后固定在屏幕顶端。举个例子，传递`stickyHeaderIndices={[0]}`会让第一个成员固定在滚动视图顶端。这个属性不能和`horizontal={true}`一起使用。  

+ **stickySectionHeadersEnabled** *boole* : 设置小节标题(section header)是否具有粘性。粘性是指当它刚出现时，会处在对应小节的内容顶部；继续下滑当它到达屏幕顶端的时候，它会停留在屏幕顶端，一直到对应的位置被下一个小节的标题占据为止。注意此设置在水平模式（`horizontal={true}`）下无效。由于不同平台的设计原则不同，此选项在iOS上默认开启，andriod上默认关闭。  

#### 方法

+ **getMetrics()** : 导出一些数据，例如用于性能分析。

+ **scrollTo(...args: Array)**: 滚动到指定的x, y偏移处，可以指定是否加上过渡动画。  

+ **scrollToEnd(options)**: 滚动到视图底部（水平方向的视图则滚动到最右边）。加上动画参数 `scrollToEnd({animated: true})`则启用平滑滚动动画，或是调用 `scrollToEnd({animated: false})`来立即跳转。如果不使用参数，则animated选项默认启用。  


## 4. ListViewDataSource

`ListViewDataSource`为`ListView`组件提供高性能的数据处理和访问。我们需要调用方法从原始输入数据中抽取数据来创建`ListViewDataSource`对象，并用其进行数据变更的比较。原始输入数据可以是简单的字符串数组，也可以是复杂嵌套的对象——分不同区(section)各自包含若干行(row)数据。  

要更新datasource中的数据，请（每次都重新）调用`cloneWithRows`方法（如果用到了section，则对应`cloneWithRowsAndSections`方法）。数据源中的数据不可变的，所以不能直接修改。clone方法会自动提取新数据并进行逐行对比（使用`rowHasChanged`方法中的策略），这样ListView就知道哪些行需要重新渲染了。  

在这个例子中，一个组件在分块接受数据，这些数据由`_onDataArrived`方法处理——将新数据拼接（concat）到旧数据尾部，同时使用clone方法更新DataSource。我们使用`concat`方法来修改`this._data`以创建新数组，注意不能使用push方法拼接数组,会报错，至于为啥我也不知道。实现`_rowHasChanged`方法需要透彻了解行数据的结构，以便提供高效的比对策略。    

```javascript
constructor(props) {
  super(props);
  var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
  this.state = {
    ds,
  };
  this._data = [];
}

_onDataArrived = (newData) => {
  this._data = this._data.concat(newData);
  this.setState({
    ds: this.state.ds.cloneWithRows(this._data)
  });
};
```

#### 方法

+ `constructor(params)`

你可以在构造函数中针对section标题和行数据提供自定义的提取方法和`hasChanged`比对方法。如果不提供，则会使用默认的`defaultGetRowData`和`defaultGetSectionHeaderData`方法来提取行数据和section标题。  

默认的导出器希望数据是下面的形式之一：  

`{ sectionID_1: { rowID_1: <rowData1>,...},....}`  

`{ sectionID_1: [rowData1, rowData2, ...],....}`  

`[ [ rowData1, rowData2, ...], ...]`   

构造函数的参数可以包含下面的内容：  

+ getRowData(dataBlob, sectionID, rowID)
+ getSectionHeaderData(dataBlob, sectionID)
+ rowHasChanged(prevRowData, nextRowData)
+ sectionHeaderHasChanged(prevSectionData, nextSectionData)


+ `cloneWithRows(dataBlob, rowIdentities)`  

根据指定的`dataBlob`和 `rowIdentities`为`ListViewDataSource`复制填充数据。`dataBlob`即原始数据。需要在初始化时定义抽取函数（否则使用默认的抽取函数）。   

+ `cloneWithRowsAndSections(dataBlob, sectionIdentities, rowIdentities)`

此方法作用基本等同`cloneWithRows`，区别在于可以额外指定`sectionIdentities` 。如果你不需要section，则直接使用`cloneWithRows`即可。  

`sectionIdentities`同理是包含了section标识符的数组。例如`['s1', 's2', ...]`。如果没有指定此数组，则默认取section的key。  

注：此方法会返回新的对象！  

+ `getRowCount()`

+ `getRowAndSectionCount()`

+ `rowShouldUpdate(sectionIndex, rowIndex)`: 返回值表明某行数据是否已变更，需要重新渲染。  

+ `getRowData(sectionIndex, rowIndex)`: 返回渲染行所需的数据（指定如何从原始dataBlob中提取数据）。  

+ `getRowIDForFlatIndex(index) `: 给定索引值，求其对应rowID。如果查找不到则返回null。

+ `getSectionIDForFlatIndex(index)`: 给定索引值，求其对应sectionID。如果查找不到则返回null。

+ `getSectionLengths() `: 返回一个数组，包含每个section的行数量。

+ `sectionHeaderShouldUpdate(sectionIndex) `: 返回值用于说明section标题是否需要重新渲染。

+ `getSectionHeaderData(sectionIndex) `： 获取section标题数据。  
