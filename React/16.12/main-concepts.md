# Main Concepts

<!-- TOC -->

- [Main Concepts](#main-concepts)
  - [Introducing JSX](#introducing-jsx)
  - [Rendering Elements](#rendering-elements)
  - [Components and Props](#components-and-props)
  - [State and Lifecycle](#state-and-lifecycle)
  - [Handling Events](#handling-events)
  - [Conditional Rendering](#conditional-rendering)
  - [Lists and Keys](#lists-and-keys)
  - [Forms](#forms)
  - [Composition and Inheritance](#composition-and-inheritance)
    - [Containment](#containment)

<!-- /TOC -->

## Introducing JSX

JSX 产生 React "elements"。   

```jsx
function formatName(user) {
  return user.firstName + ' ' + user.lastName;
}

const user = {
  firstName: 'Harper',
  lastName: 'Perez'
};

const element = (
  <h1>
    Hello, {formatName(user)}!
  </h1>
);

ReactDOM.render(
  element,
  document.getElementById('root')
);
```    

babel 转译：    

```js
const element = (
  <h1 className="greeting">
    Hello, world!
  </h1>
);
```    

```js
const element = React.createElement(
  'h1',
  { className: 'greeting' },
  'Hello, world!'
);
```   

`createElement` 基本上会返回一个类似这样的对象：   

```js
const element = {
  type: 'h1',
  props: {
    className: 'greeting',
    children: 'Hello, world!'
  }
};
```    

这些对象就叫做 "React elements"。    


## Rendering Elements

React elements 是不可变的，一旦创建后，就无法再修改其属性和后代。    

## Components and Props

从概念上来说，组件是 JS 函数（之前说的 elements 是对象），这个函数接受输入（即 props），然后
返回应该渲染的 elements。    

函数式组件：   

```js
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
```    

类式组件：    

```js
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```    

## State and Lifecycle

第二种形式的 `setState`:   

```js
this.setState((state, props) => ({
  counter: state.counter + props.increment
}));
```    

## Handling Events

合成事件与 DOM 原生事件的不同：   

- React 事件使用驼峰命名法，而不是全小写
- 在 JSX 中传递一个函数，而不是函数名字符串     

还有一点不同是在 React 中不能通过返回 `false` 来阻止默认行为。   

this 的绑定。三种方式：   

```js
constructor(props) {
  super(props);

  this.handleClick = this.handleClick.bind(this);
}
```    

```js
handleClick = () => {
  // ...
}
```    

```js
render() {
  return (
    <button onClick={(e) => this.handleClick(e)}>
      Click me
    </button>
  )
}
```     

给 handler 传递参数：    

```jsx
<button onClick={(e) => this.handleClick(id, e)}>Delete Row</button>
<button onClick={this.handleClick.bind(this, id)}>Delete Row</button>
```     

## Conditional Rendering

我们可以使用变量来存储 elements。    

```js
  render() {
    const isLoggedIn = this.state.isLoggedIn;
    let button;

    if (isLoggedIn) {
      button = <LogoutButton onClick={this.handleLogoutClick} />;
    } else {
      button = <LoginButton onClick={this.handleLoginClick} />;
    }

    return (
      <div>
        <Greeting isLoggedIn={isLoggedIn} />
        {button}
      </div>
    );
  }
```     

返回 `null` 组件什么都不渲染。    

## Lists and Keys

渲染数组元素：   

```js
const numbers = [1, 2, 3, 4, 5];
const listItems = numbers.map((number) =>
  <li>{number}</li>
);
ReactDOM.render(
  <ul>{listItems}</ul>,
  document.getElementById('root')
);
```    

key:   

```js
function NumberList(props) {
  const numbers = props.numbers;
  const listItems = numbers.map((number) =>
    <li key={number.toString()}>
      {number}
    </li>
  );
  return (
    <ul>{listItems}</ul>
  );
}

const numbers = [1, 2, 3, 4, 5];
ReactDOM.render(
  <NumberList numbers={numbers} />,
  document.getElementById('root')
);
```    

React 用 key 来识别哪些子元素被修改，被添加，被删除。    

```jsx
const number = [1, 2, 3, 4, 5];
const listItems = numbers.map((number) => 
  <li key={number.toString()}>
    {number}
  </li>
);
```    

key 仅在数组的的上下文中才有意义。   

通常来说 key 是作为给 React 的一种提示，并且这个属性不会传递给你的组件。    

## Forms

一个值由 React 控制渲染的表单输入元素称为一个受控组件。    

textarea 和 select 的问题。  

由于 `<input type="file">` 的值是只读的，因此它是一个非受控组件。    

## Composition and Inheritance

### Containment

一些组件通常预先不知道他们的后代是什么，比如说在 Sidebar 或 Dialog 这种 “通用盒子” 组件。
这种情况下推荐直接使用特殊的 props 属性 `children` 将后代渲染出来：    

```js
function FancyBorder(props) {
  return (
    <div className={'FancyBorder FancyBorder-' + props.color}>
      {props.children}
    </div>
  );
}

function WelcomeDialog() {
  return (
    <FancyBorder color="blue">
      <h1 className="Dialog-title">
        Welcome
      </h1>
      <p className="Dialog-message">
        Thank you for visiting our spacecraft!
      </p>
    </FancyBorder>
  );
}
```      

如果有时候我们需要提供多个 slot 或者说叫 hole，那么可以这样做：    

```js
function SplitPane(props) {
  return (
    <div className="SplitPane">
      <div className="SplitPane-left">
        {props.left}
      </div>
      <div className="SplitPane-right">
        {props.right}
      </div>
    </div>
  );
}

function App() {
  return (
    <SplitPane
      left={
        <Contacts />
      }
      right={
        <Chat />
      } />
  );
}
```    




