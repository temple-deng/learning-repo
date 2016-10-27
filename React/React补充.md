#  React的补充
---

###  1. 新建react component的三种方式
---
**传统的createClass语法**
```javascript
var CommentBox = React.createClass({
  render: function() {
    return (
      <div className="commentBox">
        Hello, world! I am a CommentBox.
      </div>
    );
  }
});
ReactDOM.render(
  <CommentBox />,
  document.getElementById('content')
);
```

**ES6 的 Class语法**
```javascript
export class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {count: props.initialCount};
    this.tick = this.tick.bind(this);
  }
  tick() {
    this.setState({count: this.state.count + 1});
  }
  render() {
    return (
      <div onClick={this.tick}>
        Clicks: {this.state.count}
      </div>
    );
  }
}
Counter.propTypes = { initialCount: React.PropTypes.number };
Counter.defaultProps = { initialCount: 0 };
```

**针对于无状态(Stateless)的组件**
```javascript
function HelloMessage(props) {
  return <div>Hello {props.name}</div>;
}
ReactDOM.render(<HelloMessage name="Sebastian" />, mountNode);

// 或者写作
function HelloMessage(props) {
  return <div>Hello {props.name}</div>;
}
ReactDOM.render(<HelloMessage name="Sebastian" />, mountNode);
```


###  2. tutorial 部分的补充
render方法需要返回React的组件树。然而并不需要必须返回HTML标签， 可以返回我们自己新建的React组件， 这就是React可组合的关键所在。

this.props.children 的值有三种可能：如果当前组件没有子节点，它就是 undefined ;如果有一个子节点，数据类型是 object ；如果有多个子节点，数据类型就是 array 。所以，处理 this.props.children 的时候要小心。

React 提供一个工具方法 React.Children 来处理 this.props.children 。我们可以用 React.Children.map 来遍历子节点，而不用担心 this.props.children 的数据类型是 undefined 还是 object。


###  3. ReactElement/ReactComponent/ReactComponent Class
ReactElement应该就是DOM Element在Virtual DOM中的表示，可以使用React.createElement创建一个ReactElement：  

```javascript
ReactElement createElement(
  string/ReactClass type,
  [object props],
  [children ...]
)
var root = React.createElement('div');
```  

或者使用JSX语法的话会自动调用创建ReactElement.  

React Nodes可以是下面4种类型之一：
+ ReactElement
+ string(as known as ReactText)
+ number(as known as ReactText)
+ Array of ReactNodes (aka ReactFragment)

通常代表着ReactElement的子节点

通过React.createClass()创建一个ReactComponent Class.  

将一个ReactComponent Class传入React.createElement()会得到一个ReactElement.注意这个过程好像并没有创建一个ReactComponent的实例。  

当将这个ReactElement传入ReactDOM.render()方法时才会调用构造函数构建新的实例，并将这个ReactComponent返回。  

## JSX
```javascript
const str = 'world';
const element = (
  <h1>
    Hello, {str}!
  </h1>
);
```

注意上面的圆括号不是 JSX 语法必须的，由于我们将代码写到多行，为了防止自动补全分号才用括号括起来。  

JSX 只是普通的表达式，在经过编译后，JSX表达式就成了普通的JS对象。  

JSX语法中声明HTML属性:
```javascript
// 字符串用引号包起来
const element = <div tabIndex="0"></div>;

// 表达式用大括号包起来
const element = <img src={user.avatarUrl} />;
```

### React Elements
Babel通过调用`React.createElement()`来编译JSX, 所以下面的两种写法是等价的  

```javqascript
const element = (
  <h1 className="greeting">
    Hello, world!
  </h1>
);

const element = React.createElement(
  'h1',
  {className: 'greeting'},
  'Hello, world!'
);
``` 

最终返回的对象是类似下面的结构，称作"React Elements":
```
// Note: this structure is simplified
const element = {
  type: 'h1',
  props: {
    className: 'greeting',
    children: 'Hello, world'
  }
};
```

React Elements 是不可修改的(immutable)，一旦创建了一个Element以后就不能再修改它的子节点或者属性了，唯一的方法是新建一个新Element来替换它。(目前为止)  

### Component

Conceptually, components are like JavaScript functions. They accept arbitrary inputs (called "props") and return React elements describing what should appear on the screen.  

从概念上来说，组件是与JS函数类似的。它们接受任意的输入(叫做"props")，然后返回React Elements，描述屏幕上该显示的内容。  

函数式(functional)定义的组件类只能定义无状态(stateless)的组件。  

```javascript
function Welcome(props) {
  return (
    <h1>Hello, {props.name}!</h1>
  );
}
```

### State

使用 state 时需要注意的地方：  
+  不要直接修改 state 对象，而是使用 setState 方法，因为直接修改不会触发UI的重新渲染。
```javascript
this.state.comment = 'Hello';    // wrong

this.setState({ comment: 'Hello'});  // correct
```  

+  出于性能的考虑，React 可能会将多次的 setState 操作放在一次UI更新中，`this.props` 和 `this.state`可能是异步更新的，所以不应该依赖于它们的值来计算下一 state. 如果需要这样做，则是应该传入一个函数而不是对象给 `setState()` 方法，函数接受两个参数，第一个是之前的 `state`，一个是更新操作时的 `props`  
```javascript
this.setState((prevState, props) => ({
  counter: prevState.counter + props.increment
}));
```

+ `state` 更新操作时合并(merge)操作，而不是赋值操作。


如果需要把一个组件隐藏，可以在`render`方法中返回 `null`.  

### key

当我们创建elements列表时，'key' 是一个字符串属性。这个属性可以让 React 来识别出哪些元素是修改过的，哪些是新增的，哪些被移除了。这个属性只有在数组上下文中才有意义。 


### ref
`ref`属性可以绑定在任意的组件上。这个属性接受一个回调函数作为属性值，当组件在 mounted 或 unmounted 后立即调用。  

当绑定在 HTML 元素上时，在 mount 时函数接受底层的 HTML 元素作为参数，在 unmount 时接受 `null`为参数。  

当在组件上使用这个属性时，函数接受挂载了的组件实例作为参数。 

### Reconciliation

When tearing down a tree, old DOM nodes are destroyed. Component instances receive componentWillUnmount(). When building up a new tree, new DOM nodes are inserted into the DOM. Component instances receive componentWillMount() and then componentDidMount(). Any state associated with the old tree is lost.  

当销毁之前的组件树时，之前的DOM节点被销毁。组件实例接收 `componentWillUnmount()`. 当构建完成新的组件树后，新的DOM节点插入到DOM中。组件实例接收到`componentWillMount()`，然后`componentDidMount()`。之前组件树中的state丢失。 

当比较相同类型的 React DOM Elements 时，React会保持底层的DOM节点不变，比较两者的属性，然后更新变化了的属性。  

当比较相同类型的组件元素时，组件实例保持不变，React会更新底层组件实例的`props`以匹配新的element, 然后在底层实例上调用`componentWillReceiveProps()`和`componentWillUpdate()`，之后`render()`方法。  

### Context
通过定义`getChildContext()`方法和`childContextTypes`静态属性，context的提供者可以将信息传递给下面的子孙组件。  

而context的接收者则通过定义`contextTypes`静态属性得到这个对象，通过组件实例的context属性获取这个对象。`this.context.propName`。如果不定义静态属性，则这个属性为空对象。  

当组件定义了`contextTypes`属性后，下列的生命周期方法都会有额外的一个参数，context对象。

+ `constructor(props, context)`
+ `componentWillReceiveProps(nextProps, nextContext)`
+ `shouldComponentUpdate(nextProps, nextState, nextContext)`
+ `componentWillUpdate(nextProps, nextState, nextContext)`
+ `componentDidUpdate(prevProps, prevState, prevContext)` 

使用函数定义的组件定义`contextTypes`:  

```javascript
const Button = ({children}, context) =>
  <button style={{background: context.color}}>
    {children}
  </button>;

Button.contextTypes = {color: React.PropTypes.string};
```
