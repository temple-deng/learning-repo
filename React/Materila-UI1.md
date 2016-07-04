# Materila-UI

标签（空格分隔）： 未分类

---

## 定制 Customization

###  主题 Theme
---
####  预定义的主题
Material-UI包含了两款定义好的主题： light 和 dark. 放在 `material-ui/style/baseThemes`目录下。 `lightBaseTheme` 是默认的主题， 所以我们除了使用`MuiThemeProvider`组件之外不需要做任何事就可以使用这个主题。

`lightBaseTheme`

```javascript
 // lightBaseTheme
import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';


const App = () => (
  <MuiThemeProvider>
    <RaisedButton label='default' />
  </MuiThemeProvider>
);

ReactDOM.render(
  <App />,
  document.getElementById('app')
);
```

`darkBaseTheme`

```javascript
// darkBaseTheme
import React from 'react';
import ReactDOM from 'react-dom';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme'
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import AppBar from 'material-ui/AppBar';


const App = () => (
  <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
    <div>
      <RaisedButton label='default' />
      <AppBar title="My AppBar" />
    </div>
  </MuiThemeProvider>
);

ReactDOM.render(
  <App />,
  document.getElementById('app')
);

```

#### 工作原理
Matrial-UI使用了一个叫做`muiTheme`的JS对象来完成这些设置。 默认情况下，这个对象是基于`lightBaseTheme`的(父类？)。 这个对象可以包含一下键名：

+ `spacing`: 用来改变组件的间距(spacing)。
+ `fontFamily`: 用来改变默认的字体。
+ `palette`: 用来改变组件的颜色。
+ `zIndex`: 用来改变组件的层叠水平。
+ `isRtl`: 用来开启从右向左的模式。
+ 每个组件也会有一个键名以便我们能单独定制一个组件：
  + appBar
  + avatar
  + ...
 
#### 定制主题
定制`muiTheme`必须使用`getMuiTheme()`方法去计算一个有效的`muiTheme`对象， 提供一个包含你希望定制内容的键值的对象。 之后就可以使用`<MuiThemeProvider />`组件将定制化的内容通过组件树传递下去。

```javascript
// ... 部分内容省略
 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import {cyan500} from 'material-ui/styles/colors';

const muiTheme = getMuiTheme({
  palette: {
    textColor: cyan500
  },
  appBar: {
    height: 50
  }
});


const App = () => (
  <div>
    <MuiThemeProvider muiTheme={muiTheme}>
      <div>
        <div>定制化主题内容， 修改了字体的颜色和AppBar组件的高度</div>
        <AppBar title="My AppBar" />
      </div>
    </MuiThemeProvider>
  </div>
);

ReactDOM.render(
  <App />,
  document.getElementById('app')
);
```

Material-UI使用的React的context特性来使用主题。

#### API
`getMuiTheme(muiTheme) => muiTheme`

任何想要修改主题对象的操作都必须调用这个函数。 不要直接修改主题， 这样的话效果不会正确的反应到任何组件上去除非触发了渲染。

## 内联样式
所有的组件都有他们定义好的内联样式。

如果你想要覆盖已经定义好的内联样式， 直接定义style属性就可以。 这些被覆盖的样式会优先于主题样式来渲染组件。 style属性是定义在组件的根元素/最外层元素上的。 一些组件提供了额外的style属性来提供更精细的样式控制。

如果想要通过CSS来定义额外的样式， 使用类名属性就可以。 但是要注意定义为内联的样式优先级要高于CSS中的样式， 所以可能只能定义一些非内联的样式。通过组件的`getStyles`方法获取定义了的内联样式。

# 组件
---
## AppBar
---
通常来说AppBar组件右侧是一个icon， 左侧默认是一个导航菜单的icon.

![此处输入图片的描述][1]

![此处输入图片的描述][2]

属性

<table>
  <thead>
  <tr>
    <td>属性名</td>
    <td>类型</td>
    <td>描述</td>
  </tr>
  </thead>
  <tbdoy>
    <tr>
      <td>children</td>
      <td>node</td>
      <td>比如可以在组件中放一个tab</td>
    </tr>
    <tr>
      <td>className</td>
      <td>string</td>
      <td>组件根元素的类名</td>
    </tr>
    <tr>
      <td>iconClassNameLeft</td>
      <td>string</td>
      <td>组件左侧icon的类名。如果你为icons使用了样式表(stylesheet)， 输入要使用的icon类名</td>
    </tr>
    <tr>
      <td>iconClassNameRight</td>
      <td>string</td>
      <td>组件右侧的icon类名</td>
    </tr>
    <tr>
      <td>iconElementLeft</td>
      <td>element</td>
      <td>展示在组件左侧的定制的元素，比如SvgIcon(这是什么鬼)</td>
    </tr>
    <tr>
      <td>iconElementRight</td>
      <td>element</td>
      <td>展示在组件右侧的定制的元素</td>
    </tr>
    <tr>
      <td>iconStyleLeft</td>
      <td>object</td>
      <td>覆盖组件左侧元素的内联样式</td>
    </tr>
    <tr>
      <td>iconStyleRight</td>
      <td>object</td>
      <td>覆盖组件右侧元素的内联样式</td>
    </tr>
    <tr>
      <td>onLeftIconButtonTouchTap</td>
      <td>function</td>
      <td>左侧icon通过touch tap选中时的回调函数。
        <h6>Signature:</h6>
        <div>function(event: object) => void</div>
        <div>event: TouchTap event targeting the left IconButton.</div>
      </td>
    </tr>
    <tr>
      <td>onRightIconButtonTouchTap</td>
      <td>function</td>
      <td>右侧icon通过touch tap选中时的回调函数。
        <h6>Signature:</h6>
        <div>function(event: object) => void</div>
        <div>event: TouchTap event targeting the left IconButton.</div>
      </td>
    </tr>
    <tr>
      <td>onTitleTouchTag</td>
      <td>function</td>
      <td>当title文本通过touch tap选中时的回调函数。
        <h6>Signature:</h6>
        <div>function(event: object) => void</div>
        <div>event: TouchTap event targeting the title node.</div>
      </td>
    </tr>
    <tr>
      <td>showMenuIconButton</td>
      <td>bool(default:true)</td>
      <td>决定是否展示title旁的Menu icon， 设置为false会隐藏这个icon</td>
    </tr>
    <tr>
      <td>style</td>
      <td>object</td>
      <td>覆盖根元素的内联样式</td>
    </tr>
    <tr>
      <td>title</td>
      <td>node(default: '')</td>
      <td>组件的title内容</td>
    </tr>
    <tr>
      <td>titleStyle</td>
      <td>object</td>
      <td>覆盖title的内联样式</td>
    </tr>
    <tr>
      <td>zDepth</td>
      <td>propTypes.zDepth(default: 1)</td>
      <td>组件的zDepth属性， 组件的阴影(shadow)也由这个属性决定</td>
    </tr>
  </tbdoy>
</table>

<br>
<br>

## Avatar(小头像吧)
---
Avatar组件可以使用图片image, Font Icon, SVG Icon和字母， 可以定制颜色和尺寸，默认是40dp(注意在实际单位好像是Px)， 可选值为30dp(可以设置为别的值
)

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import Avatar from 'material-ui/Avatar';
import FileFolder from 'material-ui/svg-icons/file/folder';
import FontIcon from 'material-ui/FontIcon';
import List from 'material-ui/List/List';
import ListItem from 'material-ui/List/ListItem';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import {
  blue300,
  indigo900,
  orange200,
  deepOrange300,
  pink400,
  purple500,
  } from 'material-ui/styles/colors';

const style = {margin: 5};

/**
 * Examples of `Avatar` using an image, [Font Icon](/#/components/font-icon), [SVG Icon](/#/components/svg-icon)
 * and "Letter" (string), with and without custom colors at the default size (`40dp`) and an alternate size (`30dp`).
 */
const AvatarExampleSimple = () => (
  <List>
      <ListItem
        disabled={true}
        leftAvatar={
          <Avatar src="images/uxceo-128.jpg" />
        }
      >
        Image Avatar
      </ListItem>
      <ListItem
        disabled={true}
        leftAvatar={
          <Avatar
            src="images/uxceo-128.jpg"
            size={30}
            style={style}
          />
        }
       >
        Image Avatar with custom size
       </ListItem>
    <ListItem
      disabled={true}
      leftAvatar={
        <Avatar icon={<FontIcon className="muidocs-icon-communication-voicemail" />} />
        }
    >
      FontIcon Avatar
    </ListItem>
    <ListItem
      disabled={true}
      leftAvatar={
        <Avatar
          icon={<FontIcon className="muidocs-icon-communication-voicemail" />}
          color={blue300}
          backgroundColor={indigo900}
          size={30}
          style={style}
        />
        }
    >
      FontIcon Avatar with custom colors and size
    </ListItem>
    <ListItem
      disabled={true}
      leftAvatar={
        <Avatar icon={<FileFolder />} />
        }
    >
      SvgIcon Avatar
    </ListItem>
    <ListItem
      disabled={true}
      leftAvatar={
        <Avatar
          icon={<FileFolder />}
          color={orange200}
          backgroundColor={pink400}
          size={30}
          style={style}
        />
        }
    >
      SvgIcon Avatar with custom colors and size
    </ListItem>
    <ListItem
      disabled={true}
      leftAvatar={<Avatar>A</Avatar>}
    >
      Letter Avatar
    </ListItem>
    <ListItem
      disabled={true}
      leftAvatar={
        <Avatar
          color={deepOrange300}
          backgroundColor={purple500}
          size={20}
          style={style}
        >
          A
        </Avatar>
        }
    >
      Letter Avatar with custom colors and size
    </ListItem>
  </List>
);

ReactDOM.render(
  <MuiThemeProvider><AvatarExampleSimple /></MuiThemeProvider>,
  document.getElementById('app')
);
```

![Avatar][3]

<table>
    <thead>
      <tr>
        <td>属性名</td>
        <td>类型</td>
        <td>描述</td>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>backgroundColor</td>
        <td>string</td>
        <td>背景色， 不要使用图片avatars</td>
      </tr>
      <tr>
        <td>children</td>
        <td>node</td>
        <td>可以用来使用字母做avatar</td>
      </tr>
      <tr>
        <td>className</td>
        <td>string</td>
        <td>根div或者img元素类名</td>
      </tr>
      <tr>
        <td>color</td>
        <td>string</td>
        <td>字母的颜色(注意font icon 和 svg icon也是字体)</td>
      </tr>
      <tr>
        <td>icon</td>
        <td>element</td>
        <td>SvgIcon或者FontIcon</td>
      </tr>
      <tr>
        <td>size</td>
        <td>number</td>
        <td>组件的尺寸</td>
      </tr>
      <tr>
        <td>src</td>
        <td>string</td>
        <td>如果传递这个属性， 组件就会渲染为img元素， 否则就是div元素</td>
      </tr>
      <tr>
        <td>style</td>
        <td>object</td>
        <td>覆盖根元素的内联样式</td>
      </tr>
    </tbody>
</table>

<br>
<br>

## Badge(徽章)
---
在子元素的右上角生成一个小徽章

```javascript
import React from 'react';
import Badge from 'material-ui/Badge';
import IconButton from 'material-ui/IconButton';
import UploadIcon from 'material-ui/svg-icons/file/cloud-upload';
import FolderIcon from 'material-ui/svg-icons/file/folder-open';

const BadgeExampleContent = () => (
  <div>
    <Badge
      badgeContent={<IconButton tooltip="Backup"><UploadIcon /></IconButton>}
    >
      <FolderIcon />
    </Badge>
    <Badge
      badgeContent="&copy;"
      badgeStyle={{fontSize: 20}}
    >
      Company Name
    </Badge>
  </div>
);

export default BadgeExampleContent;
```

![Badge][4]

<table>
  <thead>
    <tr>
      <td>属性名</td>
      <td>类型</td>
      <td>描述</td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>badgeContent(必须)</td>
      <td>node</td>
      <td>组件内渲染的具体内容</td>
    </tr>
    <tr>
      <td>badgeStyle</td>
      <td>object</td>
      <td>覆盖元素的内联样式</td>
    </tr>
    <tr>
      <td>children</td>
      <td>node</td>
      <td>组件相对定位的元素</td>
    </tr>
    <tr>
      <td>className</td>
      <td>string</td>
      <td>根元素的类名</td>
    </tr>
    <tr>
      <td>primary</td>
      <td>bool(default: false)</td>
      <td>如果为true, 组件会使用primary颜色</td>
    </tr>
    <tr>
      <td>secondary</td>
      <td>bool(default: false)</td>
      <td>如果为true, 组件会使用secondary颜色</td>
    </tr>
    <tr>
      <td>style</td>
      <td>object</td>
      <td>覆盖根元素的内联样式</td>
    </tr>
  </tbody>
</table>

<br>
<br>

## Buttons
---
### Flat Button
Flat Buttons一般用来表示一些通用的功能， 减少屏幕的层次感， 增加可读性。

```javascript
import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import ActionAndroid from 'material-ui/svg-icons/action/android';

const styles = {
  exampleImageInput: {
    cursor: 'pointer',
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    width: '100%',
    opacity: 0,
  },
};

const FlatButtonExampleComplex = () => (
  <div>
    <FlatButton label="Choose an Image" labelPosition="before">
      <input type="file" style={styles.exampleImageInput} />
    </FlatButton>

    <FlatButton
      label="Label before"
      labelPosition="before"
      primary={true}
      style={styles.button}
      icon={<ActionAndroid />}
    />

    <FlatButton
      label="GitHub Link"
      linkButton={true}
      href="https://github.com/callemall/material-ui"
      secondary={true}
      icon={<FontIcon className="muidocs-icon-custom-github" />}
    />

  </div>
);

export default FlatButtonExampleComplex;
```

![Flat Buttons][5]

<table>
  <thead>
    <tr>
      <td>属性名</td>
      <td>类型</td>
      <td>描述</td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>backgroundColor</td>
      <td>string</td>
      <td>当鼠标没有悬停在button上时的颜色</td>
    </tr>
    <tr>
      <td>children</td>
      <td>node</td>
      <td>
        button内部展示的内容。如果label属性声明了，那么label属性的文本就会被展示。否则， 组件就会
        期待子节点的内容展示。在我们的例子中，我们嵌入了一个&lt;input type="file" /&gt;和一个span作为label的展示内容。
        只有flat和raised button可以这样使用
      </td>
    </tr>
    <tr>
      <td>disabled</td>
      <td>bool(default: false)</td>
      <td>如果为true禁用button</td>
    </tr>
    <tr>
      <td>hoverColor</td>
      <td>string</td>
      <td>当鼠标悬停时button的颜色</td>
    </tr>
    <tr>
      <td>href</td>
      <td>string</td>
      <td>如果linkButton属性设置为true时链接的URL地址</td>
    </tr>
    <tr>
      <td>icon</td>
      <td>node</td>
      <td>展示一个icon</td>
    </tr>
    <tr>
      <td>label</td>
      <td>validateLabel</td>
      <td>button的label</td>
    </tr>
    <tr>
      <td>labelPosition</td>
      <td>enum:'before' 'after'(default: after)</td>
      <td>指明了将子元素放置到label前面还是后面(好像icon也是一样)</td>
    </tr>
    <tr>
      <td>labelStyle</td>
      <td>object</td>
      <td>覆盖button label的内联样式</td>
    </tr>
    <tr>
      <td>linkButton</td>
      <td>bool</td>
      <td>设置为true就可以使用href属性提供一个链接的URL， 其实渲染时就是渲染为a标签</td>
    </tr>
    <tr>
      <td>onKeyboardFocus</td>
      <td>function</td>
      <td>当元素由键盘获得焦点或者移入的时候的回调函数
        <h6>Signature:</h6>
        <div>function(event: object, isKeyboardFocused: boolean) => void</div>
        <div>event: focus or blur event targeting the element.
          isKeyboardFocused: Indicates whether the element is focused.</div>
      </td>
    </tr>
    <tr>
      <td>onMouseEnter</td>
      <td>function</td>
      <td>当鼠标移入时的回调函数
        <h6>Signature:</h6>
        <div>function(event: object) => void</div>
        <div>event: mouseenter event targeting the element.</div>
      </td>
    </tr>
    <tr>
      <td>onMouseLeave</td>
      <td>function</td>
      <td>鼠标移出时的回调函数
        <h6>Signature:</h6>
        <div>function(event: object) => void</div>
        <div>event: mouseleave event targeting the element.</div>
      </td>
    </tr>
    <tr>
      <td>onTouchStart</td>
      <td>function</td>
      <td>当元素被触碰时的回调函数
        <h6>Signature:</h6>
        <div>function(event: object) => void</div>
        <div>event: touchstart event targeting the element.</div>
      </td>
    </tr>
    <tr>
      <td>primary</td>
      <td>bool(default: false)</td>
      <td>如果为true， 就使用primaryTextColor颜色</td>
    </tr>
    <tr>
      <td>rippleColor</td>
      <td>string</td>
      <td>button点击后涟漪的颜色</td>
    </tr>
    <tr>
      <td>secondary</td>
      <td>bool(default: false)</td>
      <td>设置颜色懒得说了</td>
    </tr>
    <tr>
      <td>style</td>
      <td>object</td>
      <td>也懒得说了</td>
    </tr>
  </tbody>
</table>

### Raised Button
用法和Flat Butto类似.

<table>
  <thead>
    <tr>
      <td>属性名</td>
      <td>类型</td>
      <td>描述</td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>backgroundColor</td>
      <td>string</td>
      <td>覆盖button默认的背景色， 但不是默认的禁用按钮的背景色</td>
    </tr>
    <tr>
      <td>children</td>
      <td>node</td>
      <td>
        button的文本内容。如果有label属性，那么就用label的文本内容而不是children的文本(然而好像是同时都会展示的啊)
      </td>
    </tr>
    <tr>
      <td>className</td>
      <td>node</td>
      <td>懒得说</td>
    </tr>
    <tr>
      <td>disabled</td>
      <td>bool(default: false)</td>
      <td>如果为true禁用button</td>
    </tr>
    <tr>
      <td>disabledBackgroundColor</td>
      <td>string</td>
      <td>覆盖禁用时的默认背景色</td>
    </tr>
    <tr>
      <td>disabledLabelColor</td>
      <td>string</td>
      <td>禁用时label的颜色</td>
    </tr>
    <tr>
      <td>fullWidth</td>
      <td>bool(default: false)</td>
      <td>如果为true， 就填满包裹容器</td>
    </tr>
    <tr>
      <td>href</td>
      <td>string</td>
      <td>如果linkButton属性设置为true时链接的URL地址</td>
    </tr>
    <tr>
      <td>icon</td>
      <td>node</td>
      <td>展示一个icon</td>
    </tr>
    <tr>
      <td>label</td>
      <td>validateLabel</td>
      <td>button的label</td>
    </tr>
    <tr>
      <td>labelColor</td>
      <td>string</td>
      <td>button的label颜色</td>
    </tr>
    <tr>
      <td>labelPosition</td>
      <td>enum:'before' 'after'(default: after)</td>
      <td>指明了将子元素放置到label前面还是后面(好像icon也是一样)</td>
    </tr>
    <tr>
      <td>labelStyle</td>
      <td>object</td>
      <td>覆盖button label的内联样式</td>
    </tr>
    <tr>
      <td>linkButton</td>
      <td>bool</td>
      <td>设置为true就可以使用href属性提供一个链接的URL， 其实渲染时就是渲染为a标签</td>
    </tr>
    <tr>
      <td>onMouseDown</td>
      <td>function</td>
      <td>当元素被鼠标按下时的回调函数
        <h6>Signature:</h6>
        <div>function(event: object) => void</div>
        <div>event: mousedown event targeting the element.</div>
      </td>
    </tr>
    <tr>
      <td>onMouseEnter</td>
      <td>function</td>
      <td>当鼠标移入时的回调函数
        <h6>Signature:</h6>
        <div>function(event: object) => void</div>
        <div>event: mouseenter event targeting the element.</div>
      </td>
    </tr>
    <tr>
      <td>onMouseLeave</td>
      <td>function</td>
      <td>鼠标移出时的回调函数
        <h6>Signature:</h6>
        <div>function(event: object) => void</div>
        <div>event: mouseleave event targeting the element.</div>
      </td>
    </tr>
    <tr>
      <td>onMouseUp</td>
      <td>function</td>
      <td>当鼠标在button上松开时
        <h6>Signature:</h6>
        <div>function(event: object) => void</div>
        <div>event: mouseup event targeting the element.</div>
      </td>
    </tr>
    <tr>
      <td>onTouchStart</td>
      <td>function</td>
      <td>当元素被触碰时的回调函数
        <h6>Signature:</h6>
        <div>function(event: object) => void</div>
        <div>event: touchstart event targeting the element.</div>
      </td>
    </tr>
    <tr>
      <td>onTouchEnd</td>
      <td>function</td>
      <td>当触碰点在button上移出时的回调函数
        <h6>Signature:</h6>
        <div>function(event: object) => void</div>
        <div>event: touchend event targeting the element.</div>
      </td>
    </tr>
    <tr>
      <td>primary</td>
      <td>bool(default: false)</td>
      <td>如果为true， 就使用primaryTextColor颜色</td>
    </tr>
    <tr>
      <td>rippleColor</td>
      <td>string</td>
      <td>button点击后涟漪的颜色</td>
    </tr>
    <tr>
      <td>secondary</td>
      <td>bool(default: false)</td>
      <td>设置颜色懒得说了</td>
    </tr>
    <tr>
      <td>style</td>
      <td>object</td>
      <td>也懒得说了</td>
    </tr>
  </tbody>
</table>

### Floating Action Button
---

```javascript
import React from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

const style = {
  marginRight: 20,
};

const FloatingActionButtonExampleSimple = () => (
  <div>
    <FloatingActionButton style={style}>
      <ContentAdd />
    </FloatingActionButton>

    <FloatingActionButton mini={true} style={style}>
      <ContentAdd />
    </FloatingActionButton>

    <FloatingActionButton secondary={true} style={style}>
      <ContentAdd />
    </FloatingActionButton>

    <FloatingActionButton mini={true} secondary={true} style={style}>
      <ContentAdd />
    </FloatingActionButton>

    <FloatingActionButton disabled={true} style={style}>
      <ContentAdd />
    </FloatingActionButton>

    <FloatingActionButton mini={true} disabled={true} style={style}>
      <ContentAdd />
    </FloatingActionButton>
  </div>
);

export default FloatingActionButtonExampleSimple;
```

![Floating Button][6]

<table>
  <thead>
    <tr>
      <td>属性名</td>
      <td>类型</td>
      <td>描述</td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>backgroundColor</td>
      <td>string</td>
      <td>覆盖button默认的背景色， 但不是默认的禁用按钮的背景色</td>
    </tr>
    <tr>
      <td>children</td>
      <td>node</td>
      <td>
        button的文本内容。
      </td>
    </tr>
    <tr>
      <td>className</td>
      <td>node</td>
      <td>懒得说</td>
    </tr>
    <tr>
      <td>disabled</td>
      <td>bool(default: false)</td>
      <td>如果为true禁用button</td>
    </tr>
    <tr>
      <td>disabledColor</td>
      <td>string</td>
      <td>覆盖禁用时的默认背景色</td>
    </tr>
    <tr>
      <td>href</td>
      <td>string</td>
      <td>如果linkButton属性设置为true时链接的URL地址</td>
    </tr>
    <tr>
      <td>iconClassName</td>
      <td>string</td>
      <td>
        button内部的icon是一个FontIcon组件(什么鬼)。这个属性是展示在button内部的icon的类名。
      可选的去添加这个属性会手动插入一个FontIcon或者定制的SvgIcon组件作为button的一个子节点
      </td>
    </tr>
    <tr>
      <td>iconStyle</td>
      <td>object</td>
      <td>这个属性和上面的那个是等价的，除了这个属性是用来覆盖FontIcon组件的内联样式</td>
    </tr>
    <tr>
      <td>linkButton</td>
      <td>bool</td>
      <td>设置为true就可以使用href属性提供一个链接的URL， 其实渲染时就是渲染为a标签</td>
    </tr>
    <tr>
      <td>mini</td>
      <td>bool(default: false)</td>
      <td>如果设置为true， 就是一个小点的按钮</td>
    </tr>
    <tr>
      <td>onMouseDown</td>
      <td>function</td>
      <td>当元素被鼠标按下时的回调函数
        <h6>Signature:</h6>
        <div>function(event: object) => void</div>
        <div>event: mousedown event targeting the element.</div>
      </td>
    </tr>
    <tr>
      <td>onMouseEnter</td>
      <td>function</td>
      <td>当鼠标移入时的回调函数
        <h6>Signature:</h6>
        <div>function(event: object) => void</div>
        <div>event: mouseenter event targeting the element.</div>
      </td>
    </tr>
    <tr>
      <td>onMouseLeave</td>
      <td>function</td>
      <td>鼠标移出时的回调函数
        <h6>Signature:</h6>
        <div>function(event: object) => void</div>
        <div>event: mouseleave event targeting the element.</div>
      </td>
    </tr>
    <tr>
      <td>onMouseUp</td>
      <td>function</td>
      <td>当鼠标在button上松开时
        <h6>Signature:</h6>
        <div>function(event: object) => void</div>
        <div>event: mouseup event targeting the element.</div>
      </td>
    </tr>
    <tr>
      <td>onTouchStart</td>
      <td>function</td>
      <td>当元素被触碰时的回调函数
        <h6>Signature:</h6>
        <div>function(event: object) => void</div>
        <div>event: touchstart event targeting the element.</div>
      </td>
    </tr>
    <tr>
      <td>onTouchEnd</td>
      <td>function</td>
      <td>当触碰点在button上移出时的回调函数
        <h6>Signature:</h6>
        <div>function(event: object) => void</div>
        <div>event: touchend event targeting the element.</div>
      </td>
    </tr>
    <tr>
      <td>secondary</td>
      <td>bool(default: false)</td>
      <td>设置颜色懒得说了</td>
    </tr>
    <tr>
      <td>style</td>
      <td>object</td>
      <td>也懒得说了</td>
    </tr>
    <tr>
      <td>zDepth</td>
      <td>propTypes.zDepth(default:2)</td>
      <td>下层Paper组件的zDepth属性</td>
    </tr>
  </tbody>
</table>


  [1]: http://o8qr19y3a.bkt.clouddn.com/material/appBar/App%20Bar%20-%20Material-UI.png
  [2]: http://o8qr19y3a.bkt.clouddn.com/material/appBar/App%20Bar%20-%20Material-UI%20%281%29.png
  [3]: http://o8qr19y3a.bkt.clouddn.com/material-ui/Avatar%20-%20Material-UI.png
  [4]: http://o8qr19y3a.bkt.clouddn.com/material-ui/Badge%20-%20Material-UI.png
  [5]: http://o8qr19y3a.bkt.clouddn.com/material-ui/Flat%20Button%20-%20Material-UI%20%281%29.png
  [6]: http://o8qr19y3a.bkt.clouddn.com/material-ui/Floating%20Action%20Button%20-%20Material-UI.png