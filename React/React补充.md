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
