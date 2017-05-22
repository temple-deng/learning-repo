# Compoment

## 1. Modal

Modal 组件是用来在一个封闭视图之上展现内容的简单方法。   

#### 属性

+ **animationType** *enum('none', 'slide', 'fade')*  

控制模态框的动画样式：  
  - `slide` 从底部划入
  - `fade` fade 进视图中
  - `none` 不使用动画显现  
默认是none。

+ **onshow** *function*

定义一个在 modal 出现时调用一次的函数。

+ **transparent** *bool*

是否 modal 要充满整个视图。设置为 true 则有一个半透明的效果。  

+ **visible** *bool*

+ android **hardwareAccelerated** *bool*

+ android **onRequestClose** *Platform.OS === 'android'*

当用户点击设备的返回按钮时调用

+ ios **onOrientationChange** *function*

注意这个方法也会在初次渲染时调用。  

+ ios **supportedOrientations** *[enum('portrait', 'portrait-upside-down',
'landscape', 'landscape-left', 'landscape-right')]*

## 2. Picker

渲染原生的选择器组件：  

```javascript
<Picker
  selectedValue={this.state.language}
  onValueChange={(lang) => this.setState({language: lang})}>
  <Picker.Item label="Java" value="java" />
  <Picker.Item label="JavaScript" value="js" />
</Picker>
```  

#### 属性

##### ViewPropTypes props

+ **onValueChange** *function*

当某个选项被选中时调用。参数如下：`itemValue`- 选中的项目的 `value` 属性值，`itemPosition`-
所选item在Picker中的索引。  

+ **selectedValue** *any*

可以是字符串或整数。  

+ **style**

+ **testID** *string*

+ android **enabled** *boolean*

+ android **mode** *literal | literal*

指定当用户点击 picker 时如何展示所选item:

  - 'dialog': 展示一个 modal。默认行为
  - 'dropdown'  

+ android **prompt** *string*

提示信息，当用户在 dialog 模式下的dialog的标题  

+ ios **itemStyle**

## 3. PickerIOS

#### 属性

##### ViewPropTypes props

+ **itemStyle**

+ **onValueChange**

+ **selectedValue**

## 4. ProgressBarAndroid

注意这个组件貌似得单独从包中导入：  

`import ProgressBar from 'ProgressBarAndroid';`  

#### 属性

##### ViewPropTypes props

+ **color**

+ **indeterminate**: 决定进度条是否要显示一个不确定的进度。注意这个在styleAttr是Horizontal的时候必须是false。  

+ **progress** *number*: 0到1之间

+ **styleAttr**  
*enum('Horizontal', 'Normal', 'Small', 'Large', 'Inverse', 'SmallInverse', 'LargeInverse')*  

+ **testID**

## 5. ProgressViewIOS

使用ProgressViewIOS来在iOS上渲染一个UIProgressView。  

#### 属性

##### ViewPropTypes props

+ **progress** *number*

+ **progressImage** *Image.propTypes.source*

一个可以拉伸的图片，用于显示进度条。  

+ **progressTintColor** *string*

进度条本身染上的颜色。  

+ **progressViewStyle** *enum('default', bar)*
进度条的样式。

+ **trackImage**  ：一个可拉伸的图片，用于显示进度条后面的轨道。

+ **trackTintColor**: 进度条轨道染上的颜色。


## 6. RefreshControl

组件用来为 ScrollView or ListView 添加下拉刷新功能。当 ScrollView 在 `scrollY:0` 时，
下拉会触发 `onRefresh` 事件。  

```JavaScript
class RefreshableList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
    };
  }

  _onRefresh() {
    this.setState({refreshing: true});
    fetchData().then(() => {
      this.setState({refreshing: false});
    });
  }

  render() {
    return (
      <ListView
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh.bind(this)}
          />
        }
        ...
      >
      ...
      </ListView>
    );
  }
  ...
}
```  

注意 `refreshing` 是受控属性，所以必须在函数中设置为 true。  

#### 属性

##### ViewPropTypes props

+ **onRefresh** *function*: view 开始刷新时调用

+ **refreshing** *bool* 是否 view 要显示加载中的动画

+ android **color** *[color]* : 加载指示器的颜色（至少一种颜色）。  

+ android **enabled** *bool* 是否开启下拉刷新功能

+ android **progressBackgroundColor** *color* : 加载指示器的背景色

+ android **progressViewOffset** *number*:  指定刷新指示器的垂直起始位置(top offset)。

+ android **size** *enum(RefreshLayoutConsts.SIZE.DEFAULT, RefreshLayoutConsts.SIZE.LARGE)*: 指定刷新指示器的大小.  

+ ios **tintColor** *color*: 指示器的颜色

+ ios **title** *string*： 指示器下面的文字

+ ios **titleColor** *color*
