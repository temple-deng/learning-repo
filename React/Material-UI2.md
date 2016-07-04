# Material-UI2



---

### Icon Button
---
Icon Button生成一个button元素包裹着一个icon。 同时， focus样式会在tab时触发而不是click.有3种方式添加一个icon：

1. 使用icon font 样式表： 设置你想要icon的类名给 `iconClassName`属性。Certain icon fonts support ligatures, allowing the icon to be specified as a string.
2. 对于SVG icons: 插入SVG组件作为button的子节点。
3. 可选的： 也可以插入一个FontIcon组件作为button子节点。这和第一种方法说的添加iconClassName属性类似。

注：从属性上看Icon Button不能设置为链接Button.

```javascript
import React from 'react';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import ActionHome from 'material-ui/svg-icons/action/home';

const IconButtonExampleComplex = () => (
  <div>
    <IconButton tooltip="Font Icon">
      <FontIcon className="muidocs-icon-action-home" />
    </IconButton>

    <IconButton tooltip="SVG Icon">
      <ActionHome />
    </IconButton>

    <IconButton
      iconClassName="material-icons"
      tooltip="Ligature"
    >
      home
    </IconButton>
  </div>
);

export default IconButtonExampleComplex;
```

上面例子中第三个icon是怎么实现的还不清楚。

![Icon Button][1]

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
      <td>children</td>
      <td>node</td>
      <td>
        可以传入一个FontIcon元素(然而也可以是Svg Icon啊，为什么文档不说)
      </td>
    </tr>
    <tr>
      <td>className</td>
      <td>node</td>
      <td>懒得说</td>
    </tr>
    <tr>
      <td>disableTouchRipple</td>
      <td>bool(default: false)</td>
      <td>如果设为true, 元素的涟漪效果就会取消</td>
    </tr>
    <tr>
      <td>disabled</td>
      <td>bool(default: false)</td>
      <td>如果为true禁用button</td>
    </tr>
    <tr>
      <td>iconClassName</td>
      <td>string</td>
      <td>icon的CSS类名</td>
    </tr>
    <tr>
      <td>iconStyle</td>
      <td>object</td>
      <td>覆盖icon元素的内联样式</td>
    </tr>
    <tr>
      <td>onBlur</td>
      <td>function</td>
      <td>当元素失去焦点时的回调函数
        <h6>Signature:</h6>
        <div>function(event: object) => void</div>
        <div>event: blur event targeting the element.</div>
      </td>
    </tr>
    <tr>
      <td>onFocus</td>
      <td>function</td>
      <td>当元素获取焦点时的回调函数
        <h6>Signature:</h6>
        <div>function(event: object) => void</div>
        <div>event: focus event targeting the element.</div>
      </td>
    </tr>
    <tr>
      <td>onKeyBoardFocus</td>
      <td>function</td>
      <td>当元素通过键盘获取焦点或失去焦点时的回调函数
        <h6>Signature:</h6>
        <div>function(event: object, keyBoardFocused: boolean) => void</div>
        <div>event: focus or blur event targeting the element.</div>
        <div>keyboardFocused: indicates whether the element is focused</div>
      </td>
    </tr>
    <tr>
      <td>onMouseEnter</td>
      <td>function</td>
      <td>鼠标移入时的回调函数
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
      <td>onMouseOut</td>
      <td>function</td>
      <td>当鼠标移出元素时的回调函数，不像onMouseLeave, 这个函数会在被禁用了的按钮上触发
        <h6>Signature:</h6>
        <div>function(event: object) => void</div>
        <div>event: mouseout event targeting the element.</div>
      </td>
    </tr>
    <tr>
      <td>style</td>
      <td>object</td>
      <td>也懒得说了</td>
    </tr>
    <tr>
      <td>tooltip</td>
      <td>node</td>
      <td>元素起泡内的文字</td>
    </tr>
    <tr>
      <td>tooltipPosition</td>
      <td>propTypes.cornerAndCenter</td>
      <td>元素起泡的位置</td>
    </tr>
    <tr>
      <td>tooltipStyles</td>
      <td>object</td>
      <td>覆盖元素起泡的样式</td>
    </tr>
    <tr>
      <td>touch</td>
      <td>bool(default: false)</td>
      <td>如果设置为true, 会增加元素起泡的大小，防止被手指挡住</td>
    </tr>
  </tbody>
</table>

<br>
<br>

## Chip
---
Chip代表了一些复杂的实体在小的块中，例如联系人。

尽管这里包含这些组件作为独立的组件， 最常用的的情况时在一些表单的输入中， 所以一些情况可能在下面的示例中没有展示出来。

```javascript
import React from 'react';
import Avatar from 'material-ui/Avatar';
import Chip from 'material-ui/Chip';
import FontIcon from 'material-ui/FontIcon';
import SvgIconFace from 'material-ui/svg-icons/action/face';
import {blue300, indigo900} from 'material-ui/styles/colors';

const styles = {
  chip: {
    margin: 4,
  },
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
  },
};

function handleRequestDelete() {
  alert('You clicked the delete button.');
}

function handleTouchTap() {
  alert('You clicked the Chip.');
}

/**
 * Examples of Chips, using an image [Avatar](/#/components/font-icon), [Font Icon](/#/components/font-icon) Avatar,
 * [SVG Icon](/#/components/svg-icon) Avatar, "Letter" (string) Avatar, and with custom colors.
 *
 * Chips with the `onRequestDelete` property defined will display a delete icon.
 */
export default class ChipExampleSimple extends React.Component {

  render() {
    return (
      <div style={styles.wrapper}>

        <Chip
          style={styles.chip}
        >
          Text Chip
        </Chip>

        <Chip
          onRequestDelete={handleRequestDelete}
          onTouchTap={handleTouchTap}
          style={styles.chip}
        >
          Deletable Text Chip
        </Chip>

        <Chip
          onTouchTap={handleTouchTap}
          style={styles.chip}
        >
          <Avatar src="images/uxceo-128.jpg" />
          Image Avatar Chip
        </Chip>

        <Chip
          onRequestDelete={handleRequestDelete}
          onTouchTap={handleTouchTap}
          style={styles.chip}
        >
          <Avatar src="images/ok-128.jpg" />
          Deletable Avatar Chip
        </Chip>

        <Chip
          onTouchTap={handleTouchTap}
          style={styles.chip}
        >
          <Avatar icon={<FontIcon className="material-icons">perm_identity</FontIcon>} />
          FontIcon Avatar Chip
        </Chip>

        <Chip
          onRequestDelete={handleRequestDelete}
          onTouchTap={handleTouchTap}
          style={styles.chip}
        >
          <Avatar color="#444" icon={<SvgIconFace />} />
          SvgIcon Avatar Chip
        </Chip>

        <Chip onTouchTap={handleTouchTap} style={styles.chip}>
          <Avatar size={32}>A</Avatar>
          Text Avatar Chip
        </Chip>

        <Chip
          backgroundColor={blue300}
          onRequestDelete={handleRequestDelete}
          onTouchTap={handleTouchTap}
          style={styles.chip}
        >
          <Avatar size={32} color={blue300} backgroundColor={indigo900}>
            MB
          </Avatar>
          Colored Chip
        </Chip>
      </div>
    );
  }
}
```

![Chip][2]

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
      <td>覆盖背景颜色</td>
    </tr>
    <tr>
      <td>children</td>
      <td>node</td>
      <td>chip内部的渲染的元素</td>
    </tr>
    <tr>
      <td>className</td>
      <td>node</td>
      <td>懒得说</td>
    </tr>
    <tr>
      <td>labelColor</td>
      <td>string</td>
      <td>覆盖label颜色</td>
    </tr>
    <tr>
      <td>labelStyle</td>
      <td>object</td>
      <td>覆盖label的内联样式</td>
    </tr>
    <tr>
      <td>onRequestDelete</td>
      <td>function</td>
      <td>当点击delete icon时的回调函数， 如果设置了这个属性， 就会显示delete icon
        <h6>Signature:</h6>
        <div>function(event: object) => void</div>
        <div>event: touchTap event targeting the element.</div>
      </td>
    </tr>
    <tr>
      <td>onTouchTap</td>
      <td>function</td>
      <td>当元素被touch-tapped时的回调函数
        <h6>Signature:</h6>
        <div>function(event: object) => void</div>
        <div>event: TouchTap event targeting the element.</div>
      </td>
    </tr>
    <tr>
      <td>style</td>
      <td>object</td>
      <td>也懒得说了</td>
    </tr>
  </tbody>
</table>

<br>
<br>

## Date Picker
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
      <td>DateTimeFormat</td>
      <td>function</td>
      <td>已声明locale属性的格式化时间的构造函数。</td>
    </tr>
    <tr>
      <td>autoOk</td>
      <td>bool(default: false)</td>
      <td>如果为true， 当选中日期时会自动接收到参数并关闭picker</td>
    </tr>
    <tr>
      <td>cancelLabel</td>
      <td>node</td>
      <td>覆盖默认的'Cancel'按钮文本</td>
    </tr>
    <tr>
      <td>className</td>
      <td>string</td>
      <td>懒得说</td>
    </tr>
    <tr>
      <td>container</td>
      <td>enum: 'dialog', 'inline'(default: 'dialog')</td>
      <td>控制当输入域取得焦点时Picker该如何展示。</td>
    </tr>
    <tr>
      <td>defaultDate</td>
      <td>object</td>
      <td>组件的初始日期值。如果有value或者valueLink，那么它们会覆盖这个属性
      </td>
    </tr>
    <tr>
      <td>disableYearSelection</td>
      <td>bool(default: false)</td>
      <td>是否禁用年的选择
      </td>
    </tr>
    <tr>
      <td>disabled</td>
      <td>bool(default: false)</td>
      <td>禁用日期选择器</td>
    </tr>
    <tr>
      <td>firstDayOfWeek</td>
      <td>number(default:1)</td>
      <td>改变每周的第一天。从Saturday到Monday。允许范围是0(Sunday)到6(Saturday)</td>
    </tr>
    <tr>
      <td>formatDate</td>
      <td>function</td>
      <td>这个函数用来格式化展示在输入框中的日期显示的， 返回一个字符串。默认如果没有locale和DateTimeFormat属性
      那么就会格式化为ISO 8601 YYYY-MM-DD
        <h6>Signature:</h6>
        <div>function(date:object) => any</div>
        <div>date: Date object to be formatted</div>
        <div>returns(any) 格式化的日期</div>
      </td>
    </tr>
    <tr>
      <td>locale</td>
      <td>string</td>
      <td>这个看文档吧</td>
    </tr>
    <tr>
      <td>maxDate</td>
      <td>object</td>
      <td>最后的有效日期。包括最后的那天。默认是当前日期加100年</td>
    </tr>
    <tr>
      <td>minDate</td>
      <td>object</td>
      <td>最开始的有效日期，包含开始的那天，默认是当前日期减100年</td>
    </tr>
    <tr>
      <td>mode</td>
      <td>enum: 'portrait' 'landscape'</td>
      <td>展示组件的模式</td>
    </tr>
    <tr>
      <td>okLabel</td>
      <td>node</td>
      <td>覆盖'OK' button的文本</td>
    </tr>
    <tr>
      <td>onChange</td>
      <td>function</td>
      <td>当日期值改变时的回调函数
        <h6>Signature:</h6>
        <div>function(null: undefined, date:object) => void</div>
        <div>null: 由于没有特别的事件与change相关， 第一个参数总是null</div>
        <div>date: 新的日期</div>
      </td>
    </tr>
    <tr>
      <td>onDismiss</td>
      <td>function</td>
      <td>当picker dialog dismiss时的回调函数</td>
    </tr>
    <tr>
      <td>onFocus</td>
      <td>function</td>
      <td>当picker的 TextField获取焦点时的回调函数
        <h6>Signature:</h6>
        <div>function(event:object) => void</div>
        <div>event: focus event targeting the TextField</div>
      </td>
    </tr>
    <tr>
      <td>onShow</td>
      <td>function</td>
      <td>当dialog出现时的回调函数</td>
    </tr>
    <tr>
      <td>onTouchTao</td>
      <td>function</td>
      <td>当TouchTap事件发生在文本输入框时的回调函数
        <h6>Signature:</h6>
        <div>function(event:object) => void</div>
        <div>event: TouchTap event targeting the TextField</div>
      </td>
    </tr>
    <tr>
      <td>shouldDisableDate</td>
      <td>function</td>
      <td>用来决定是否禁选某些日期的函数
        <h6>Signature:</h6>
        <div>function(day:object) => boolean</div>
        <div>day: 日期对象day</div>
        <div>returns(boolean): 指明这一天是否该禁选</div>
      </td>
    </tr>
    <tr>
      <td>textFieldStyle</td>
      <td>object</td>
      <td>覆盖文本框内联样式</td>
    </tr>
    <tr>
      <td>style</td>
      <td>object</td>
      <td></td>
    </tr>
    <tr>
      <td>value</td>
      <td>object</td>
      <td>手动设置日期</td>
    </tr>
  </tbody>
</table>


  [1]: http://o8qr19y3a.bkt.clouddn.com/material-ui/Icon%20Button%20-%20Material-UI.png
  [2]: http://o8qr19y3a.bkt.clouddn.com/material-ui/Chip%20-%20Material-UI.png