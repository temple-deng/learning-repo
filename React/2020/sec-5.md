# Sec-5

<!-- TOC -->

- [Sec-5](#sec-5)
  - [Render Props](#render-props)
  - [Strict Mode](#strict-mode)
  - [Typechecking With PropTypes](#typechecking-with-proptypes)

<!-- /TOC -->

## Render Props

render props 是一种用来在组件间共享代码的技术，这些组件有一个值为函数的属性。    

```js
<DateProvider render={data => (
  <h1>Hello {data.target}</h1>
)} />
```     

```js
class Cat extends React.Component {
  render() {
    const mouse = this.props.mouse;
    return (
      <img src="/cat.jpg" style={{ position: 'absolute', left: mouse.x, top: mouse.y }} />
    );
  }
}

class Mouse extends React.Component {
  constructor(props) {
    super(props);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.state = { x: 0, y: 0 };
  }

  handleMouseMove(event) {
    this.setState({
      x: event.clientX,
      y: event.clientY
    });
  }

  render() {
    return (
      <div style={{ height: '100vh' }} onMouseMove={this.handleMouseMove}>

        {/*
          Instead of providing a static representation of what <Mouse> renders,
          use the `render` prop to dynamically determine what to render.
        */}
        {this.props.render(this.state)}
      </div>
    );
  }
}

class MouseTracker extends React.Component {
  render() {
    return (
      <div>
        <h1>Move the mouse around!</h1>
        <Mouse render={mouse => (
          <Cat mouse={mouse} />
        )}/>
      </div>
    );
  }
}
```    

大部分能用 HOC 实现的功能都可以用 render props 试一下。    

## Strict Mode

仅对开发模式生效。    

```js
import React from 'react';

function ExampleApplication() {
  return (
    <div>
      <Header />
      <React.StrictMode>
        <div>
          <ComponentOne />
          <ComponentTwo />
        </div>
      </React.StrictMode>
      <Footer />
    </div>
  );
}
```    

strict mode 检查了：   

- 使用不安全生命周期的组件
- 对废弃字符串类型 ref 的使用
- 对废弃 findDOMNode 的使用
- 检测意料之外的副作用
- 检测废弃 context API 的使用

从概念上来说，react 的工作分为两个阶段：    

- render 阶段决定 DOM 结构要做哪些修改，在这个阶段，react 调用 `render` 然后和上次 `render`
结果进行比较
- commit 阶段就是 react 应用这些修改的阶段，比如和插入、删除、修改 DOM 节点。同时会在这个阶段
调用 `componentDidMount` 和 `componentDidUpdate`     

通常 commit 阶段是非常快的，render 阶段比较慢。因此，在即将到来的 concurrent 模式中，react
会将 render 工作进行分片，暂停和恢复 render 流程来避免阻塞浏览器。这意味着 react 在 commit
前可能会调用 render 阶段生命周期多次，或者可能根本不 commit。（这段话没理解）    

render 阶段生命周期包含下面的类方法：   

- `constructor`
- `componentWillMount` (or `UNSAFE_componentWillMount`)
- `componentWillReceiveProps` (or `UNSAFE_componentWillReceiveProps`)
- `componentWillUpdate` (or `UNSAFE_componentWillUpdate`)
- `getDerivedStateFromProps`
- `shouldComponentUpdate`
- `render`
- `setState` 更新器函数    

由于上述方法可能会调用多次，因此它们应该是无副作用的side-effects。    

strict mode 并不能自动检测这些副作用，但它确实可以给我们提供一些帮助。做法是在内部双重调用这些
函数：    

- 类组件的 `constructor`, `render`, `shouldComponentUpdate`
- 类组件的静态 `getDerivedStateFromProps`
- 函数组件的函数体
- state 的更新器函数
- `useState`, `useMemo`, `useReducer` 传入的函数

应该它只是帮我们调用两次，但是不会去替我们检查bug，需要我们自己去看看调用两次是不是有问题。   

## Typechecking With PropTypes

```js
import PropTypes from 'prop-types';

MyComponent.propTypes = {
  // You can declare that a prop is a specific JS type. By default, these
  // are all optional.
  optionalArray: PropTypes.array,
  optionalBool: PropTypes.bool,
  optionalFunc: PropTypes.func,
  optionalNumber: PropTypes.number,
  optionalObject: PropTypes.object,
  optionalString: PropTypes.string,
  optionalSymbol: PropTypes.symbol,

  // Anything that can be rendered: numbers, strings, elements or an array
  // (or fragment) containing these types.
  optionalNode: PropTypes.node,

  // A React element.
  optionalElement: PropTypes.element,

  // A React element type (ie. MyComponent).
  optionalElementType: PropTypes.elementType,
  
  // You can also declare that a prop is an instance of a class. This uses
  // JS's instanceof operator.
  optionalMessage: PropTypes.instanceOf(Message),

  // You can ensure that your prop is limited to specific values by treating
  // it as an enum.
  optionalEnum: PropTypes.oneOf(['News', 'Photos']),

  // An object that could be one of many types
  optionalUnion: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(Message)
  ]),

  // An array of a certain type
  optionalArrayOf: PropTypes.arrayOf(PropTypes.number),

  // An object with property values of a certain type
  optionalObjectOf: PropTypes.objectOf(PropTypes.number),

  // An object taking on a particular shape
  optionalObjectWithShape: PropTypes.shape({
    color: PropTypes.string,
    fontSize: PropTypes.number
  }),
  
  // An object with warnings on extra properties
  optionalObjectWithStrictShape: PropTypes.exact({
    name: PropTypes.string,
    quantity: PropTypes.number
  }),   

  // You can chain any of the above with `isRequired` to make sure a warning
  // is shown if the prop isn't provided.
  requiredFunc: PropTypes.func.isRequired,

  // A value of any data type
  requiredAny: PropTypes.any.isRequired,

  // You can also specify a custom validator. It should return an Error
  // object if the validation fails. Don't `console.warn` or throw, as this
  // won't work inside `oneOfType`.
  customProp: function(props, propName, componentName) {
    if (!/matchme/.test(props[propName])) {
      return new Error(
        'Invalid prop `' + propName + '` supplied to' +
        ' `' + componentName + '`. Validation failed.'
      );
    }
  },

  // You can also supply a custom validator to `arrayOf` and `objectOf`.
  // It should return an Error object if the validation fails. The validator
  // will be called for each key in the array or object. The first two
  // arguments of the validator are the array or object itself, and the
  // current item's key.
  customArrayProp: PropTypes.arrayOf(function(propValue, key, componentName, location, propFullName) {
    if (!/matchme/.test(propValue[key])) {
      return new Error(
        'Invalid prop `' + propFullName + '` supplied to' +
        ' `' + componentName + '`. Validation failed.'
      );
    }
  })
};
```    

默认属性值：    

```js
class Greeting extends React.Component {
  render() {
    return (
      <h1>Hello, {this.props.name}</h1>
    );
  }
}

// Specifies the default values for props:
Greeting.defaultProps = {
  name: 'Stranger'
};

// Renders "Hello, Stranger":
ReactDOM.render(
  <Greeting />,
  document.getElementById('example')
);
```    

```js
class Greeting extends React.Component {
  static defaultProps = {
    name: 'stranger'
  }

  render() {
    return (
      <div>Hello, {this.props.name}</div>
    )
  }
}
```     

