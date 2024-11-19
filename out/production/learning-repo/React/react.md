# React

<!-- TOC -->

- [React](#react)
  - [Concepts](#concepts)
  - [Code-Spliting](#code-spliting)
    - [React.lazy](#reactlazy)
    - [Suspense](#suspense)
  - [Context](#context)
    - [API](#api)
      - [React.createContext](#reactcreatecontext)
      - [Context.Provider](#contextprovider)
      - [Class.contextType](#classcontexttype)
      - [Context.Consumer](#contextconsumer)
    - [Updating Context from a Nested Component](#updating-context-from-a-nested-component)
  - [Error boundaries](#error-boundaries)
  - [Forwarding Refs](#forwarding-refs)
  - [Fragments](#fragments)
  - [Portals](#portals)
  - [Reconciliation](#reconciliation)
  - [Refs](#refs)
  - [Render props](#render-props)
  - [API](#api-1)
    - [React](#react-1)
    - [React.Component](#reactcomponent)
    - [ReactDOM](#reactdom)
    - [SyntheticEvent](#syntheticevent)
  - [Hooks](#hooks)
    - [Hooks at a Glance](#hooks-at-a-glance)
    - [Rules of Hooks](#rules-of-hooks)
    - [Custom Hooks](#custom-hooks)

<!-- /TOC -->

## Concepts

1. JSX produce React "elements"
2. After compilation, JSX expressions become regular JS function calls and
evaluate to JS objects
3.    

```js
const element = (
  <h1 className="greeting">
    Hello, world!
  </h1>
);
const element = React.createElement(
  'h1',
  { className: 'greeting' },
  'Hello, world!'
);
const element = {
  type: 'h1',
  props: {
    className: 'greeting',
    children: 'Hello, world!'
  }
};
```   

4. These objects are called 'React elements', React elements are immutable
5. Components are like JS functions, return React elements
6. React treats components starting with lowercase letters as DOM tags
7. React may batch multiple `setState()` calls into a single update for performance
8.    

```js
this.setState((state, props) => {
  return {
    counter: state.counter + props.increment
  };
});
```    

9. React events are named using camelCase, not lower case
10. You cannot return `false` to prevent default behavior in React, You must
call `preventDefault()` explitcitly
11. Return `null` from a components render method does not affect the firing
of the component's lifecycle methods
12. Keys serve as a hint to React but they don't get passed to your components
13. You can pass an array into the 'value' attribute, allowing you to select
multiple options in a select tag    

```js
<select multiple={true} value={['B', 'C']}>
```   

## Code-Spliting

### React.lazy

`React.lazy` takes a function that must call a dynamic `import()`, This must
return a `Promise` which resolve to a module with a default export containing
a React component.    

     
### Suspense

```js
import React, { Suspense } from 'react';

<Suspense fallback={<div>...loading</div>}>
  <OtherComponent />
</Suspense>
```    

## Context

Context provides a way to pass data through the component tree without having
to pass props down manually at every level.         

```js
// Context lets us pass a value deep into the component tree
// without explicitly threading it through every component.
// Create a context for the current theme (with 'light' as the default)
const ThemeContext = React.createContext('light');

class App extends React.Component {
  render() {
    // User a Provider to pass the current theme to the tree below
    // Any component can read it, no matter how deep it is.
    // In this example, we're passing 'dark' as the current value.
    return (
      <ThemeContext.Provider value="dark">
        <Toolbar />
      </ThemeContext.Provider>
    );
  }
}

// A component in the middle doesn't have to pass the theme
// down explicitly anymore.
function Toolbar(props) {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

class ThemeButton extends React.Component {
  // Assign a contextType to read the current theme context.
  // React will find the closest theme Provider above and use its value.
  // In this example, the current theme is 'dark'
  static contextType = ThemeContext;
  render() {
    return <Button theme={this.context} />;
  }
}
```    

### API

#### React.createContext

```js
const MyContext = React.createContext(defaultValue);
```   

Create an Context object. When React renders a component that subscribes to this
Context object it will read the current context value from the closest matching
`Provider` above it in the tree.    

The `defaultValue` argument is only used when a component does not have a
matching Provider above it in the tree.     

#### Context.Provider

All consumers that are descendants of a Provider will re-render whenever the
Provider's `value` props changes。The propagation from Provider to its descendant
consumers is not subject(受约束) to the `shouldComponentUpdate` method, so the
consumer is updated even when an ancestor component bails out of the update.      

Changes are determined by comparing the new and old values using the same
algorithm as `Object.is`.    

#### Class.contextType

The `contextType` property on a class can be assigned a Context object created
by `React.createContext()`. This lets you consume the nearest current value of
that Context type using `this.context`.     


#### Context.Consumer

```js
<MyContext.Consumer>
  { value => /* render something based on the context value */ }
</MyContext.Consumer>
```    

A React component that subscribes to context chanage. This lets you subscribes
to a context within a function component.    

### Updating Context from a Nested Component

You can pass a function down through the context to allow consumers to update
the context:    

```js
// Make sure the shape of the default value passed ot
// createContext matches the shaped that the consumers expect!
const ThemeContext = React.createContext({
  theme: themes.dark,
  toggleTheme: () => {}
});

function ThemeTogglerButton() {
  return (
    <ThemeContext.Consumer>
      {({theme, toggleTheme}) => (
        <button
          onClick={toggleTheme}
          style={{backgroundColor: theme.background}}>
          Toggle Theme
        </button>
      )}
    </ThemeContext.Consumer>
  )
}
```     

## Error boundaries

Error bounaries are **React components** that **catch JS errors anywhere in their**
**child component tree, log those errors, and display a fallback UI** instead of
the component tree that crashed.     

Error boundaries catch errors for:    

+ rendering
+ lifecycle methods
+ constructors    

not catch errors for:    

+ Event handlers
+ Asynchronous code
+ Server side rendering
+ Errors thrown in the error boundary itself     

A class component becomes an error boundary if it defined either (or both) of
the lifecycle methods `static getDerivedStateFrom Error()` or `componendDidCatch()`.
Use `static getDerivedStateFromError()` to render a fallback UI after an error
has been thrown. Use `componentDidCatch()` to log error information.    

```js
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return {
      hasError: true
    };
  }

  componentDidCatch(error, info) {
    // You can also log the error to an error reporting service
    logErrorToMyService(error, info);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custome fallback UI
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```    

## Forwarding Refs

Ref forwarding is a technique for automatically passing a ref through a component
to one of its children.     

```js
const FancyButton = React.forwardRef((props, ref) => {
  return (
    <button ref={ref} className="FancyButton">
      {props.children}
    </button>
  );
});

// You can now get a ref directly to the DOM button:
const ref = React.createRef();
<FancyButton ref={ref}>Click me!</FancyButton>;
```    

1. 我们使用 `React.createRef()` 创建了一个 React ref, 然后把它赋值给变量 `ref`
2. 将 `ref` 传递下去给 `FancyButton` 组件实例
3. React passes the `ref` to the `(props, ref) => ...` function inside `forwardRef`
as a second argument
4. 把 `ref` 转发给 `button` 元素
5. When the ref is attached, `ref.current` will point to the `<button>` DOM node.    

所以这其实并不是说将一个 `ref` 转发给下层的子孙使用，而是将一个变量传递下去，然后下层用这个
`ref` 绑定元素或组件，然后上层就可以直接引用到元素或组件了。    

## Fragments

A common pattern in React is for a component to return multiple elements.
Fragments let you group a list of children without adding extra nodes to the DOM.

```js
render() {
  return (
    <React.Fragment>
      <ChildA />
      <ChildB />
      <ChildC />
  );
}
```   

缩写语法：    

```js
class Columns extends React.Component {
  render() {
    return (
      <>
        <td>Hello</td>
        <td>World</td>
      <>
    );
  }
}
```    

`key` 是唯一一个可以传递给 `React.Fragment` 的属性，短语法不支持。    

## Portals

```js
ReactDOM.createPortal(child, container)
```    

```js
render() {
  // React renders the children into 'domNode'.
  // 'domNode' is any valid DOM node, regardless of its location in the DOM
  return ReactDOM.createPortal(
    this.props.children,
    domNode
  );
}
```    

完整的一个例子：   

```js
// These two containers are siblings in the DOM
const appRoot = document.getElementById('app-root');
const modalRoot = document.getElementById('modal-root');


class Modal extends React.Component {
  constructor(props) {
    super(props);
    this.el = document.createElement('div');
  }

  componentDidMount() {
    modalRoot.appendChild(this.el);
  }

  componentWillUnmount() {
    modalRoot.removeChild(this.el);
  }
  
  render() {
    return ReactDOM.createPortal(
      this.props.children,
      this.el,
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {showModal: false};
    
    this.handleShow = this.handleShow.bind(this);
    this.handleHide = this.handleHide.bind(this);
  }

  handleShow() {
    this.setState({showModal: true});
  }
  
  handleHide() {
    this.setState({showModal: false});
  }

  render() {
    const modal = this.state.showModal ? (
      <Modal>
        <div className="modal">
          <div>
            With a portal, we can render content into a different
            part of the DOM, as if it were any other React child.
          </div>
          This is being rendered inside the #modal-container div.
          <button onClick={this.handleHide}>Hide modal</button>
        </div>
      </Modal>
    ) : null;

    return (
      <div className="app">
        This div has overflow: hidden.
        <button onClick={this.handleShow}>Show modal</button>
        {modal}
      </div>
    );
  }
}

ReactDOM.render(<App />, appRoot);
```

Portal 组件虽然可能不在 React tree 的 DOM tree 中，但是其仍然表现的像一个 React tree 中的
一个普通的子节点。像 context 和事件冒泡依然会接收。    

## Reconciliation

Diff 算法基于两点：   

1. 两个不同类型的元素生成不同的树
2. 开发者可以使用 `key` 来作为一个提示，表示出两次 render 之间的哪些子元素是稳定的

首先，不同的根元素产生不同的树，因此这时候，React 会摧毁旧树并从零构建一颗新树。旧树和新树
的对应的生命周期方法会调用。    

当比较两个相同类型的 DOM 元素的时候，保持底层 DOM 节点不变，按需更新变更了的属性。    

```html
<ul>
  <li>Duke</li>
  <li>Villanova</li>
</ul>

<ul>
  <li>Connecticut</li>
  <li>Duke</li>
  <li>Villanova</li>
</ul>
```    

默认情况下，React 会修改每一个 `<li>` 元素。   

## Refs

Refs provide a way to access DOM nodes or React elements created in the render
method.    

说白了就是对一个 DOM 元素或者组件实例的引用，方便我们绕出常规的 top-down 数据流，在上层直接
修改 DOM 元素或组件实例。    

Refs are created using `React.createRef()` and attached to React elements via
the `ref` attribute.     

```js
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }

  render() {
    return <div ref={this.myRef} />;
  }
}
```    

通过 `ref.current` 属性访问节点或组件实例的引用 `const node = this.myRef.current`。    

`ref` 的值取决与节点的类型：   

+ 如果是与 HTML 元素绑定，`ref.current` 保存着底层 DOM 节点的引用
+ 如果是与自定义的组件绑定，`ref.current` 保存着挂载的组件实例

## Render props

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
      <div style={{ height: '100%' }} onMouseMove={this.handleMouseMove}>

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

## API

### React

+ `React.Component`
+ `React.PureComponent`, `React.PureComponent` implements `shouldComponentUpdate()`
with a shallow prop and state comparison.
+ `React.memo`    

```js
const MyComponent = React.memo(function MyComponent(props) {
  /* render using props */
});
```    

`React.memo` 是一个 HOC，类似于 `React.PureComponent`，但是是为函数组件准备的。   

If your function component renders the same result given the same props, you can
wrap it in a call to `React.memo` for a performance boost in some cases by
memoizing the result. This means that React will skip rendering the component,
and reuse the last rendered result.     

+ `React.createElement()`    

```js
React.createElement(
  type,
  [props],
  [...children]
)
```     

+ `React.cloneElement()`    

```js
React.cloneElement(
  element,
  [props],
  [...children]
)
```    

返回的元素会将原始元素的 props 和新的 props 进行一次浅合并。新的子孙会替换旧的子孙。`key`和
`ref` 会保留。    

基本上等价于：    

```js
<element.type {...element.props.} {...props}>{children}</element.type>
```    

+ `React.isValidElement(object)`，验证对象是否是一个 React 元素
+ `React.Children.map(children, function[(thisArg)])`
+ `React.Children.forEach(children, function[(thisArg)])`
+ `React.Children.count(children)`
+ `Reach.Children.only(children)` 如果只有一个孩子的话就返回这个孩子，否则抛出一个错误
+ `React.Children.toArray(children)`
+ `React.Fragment`
+ `React.createRef()`
+ `React.forwardRef()` 创建一个 React 组件，将其接收的 ref 属性转发给组件树中的下方的另一个
组件

### React.Component

子类中唯一必须定义的方法是 `render()`，其他的都是可选的。    

![react-lifecycle](https://raw.githubusercontent.com/temple-deng/markdown-images/master/uncategorized/react-lifecycle.png)  

+ `render()` 方法应该返回以下的类型之一：   
  - **React elements**.
  - **Arrays and fragments**
  - **Portals**
  - **String and numbers**. DOM 中的文本节点
  - **Booleans or null**. 什么都不渲染
+ `componentDidUpdate(prevProps, prevState, snapshot)` 这个方法和 `componentDidMount`
其实是一个操作 DOM 节点的好时机，因为这时候 DOM 节点都已经挂载或更新了，ref 也是。
+ `shouldComponentUpdate(nextProps, nextState)`
+ `static getDerivedStateFromProps(props, state)` 返回一个对象更新 state，或者返回
null 什么都不更新。
+ `getSnapshotBeforeUpdate(prevProps, prevState)` 这个方法的返回值会作为一个参数传递给
`componentDidUpdate()`
+ `static getDerivedStateFromError(error)` 其返回值会用来更新 state.
+ `componentDidCatch(error, info)`
+ `component.forceUpdate(callback)`

### ReactDOM

+ `ReactDOM.render(element, container[, callback])` 返回组件的引用，如果是函数组件就
返回 `null`。    

如果这个 React element 之前已经在 `container` 中渲染了，那么就执行的是普通的更新操作。    

+ `ReactDOM.hydrate(element, container[, callback])`    

Same as `render()`, but is used to hydrate a container whose HTML contents were
rendered by ReactDOMServer。    

+ `ReactDOM.unmountComponentAtNode(container)` 如果有组件可以被移除就返回 `true`，否则
返回 `false`
+ `ReactDOM.createPortal(child, container)`    

### SyntheticEvent

每个 `SyntheticEvent` 对象都有以下的属性：   

```js
boolean bubbles      // 事件是否是可以冒泡的
boolean cancalable    // 是否是可以取消的
DOMEventTarget currentTarget
boolean defaultPrevented      // 是否 event.preventDefault() 已经被调用过
number eventPhase     // 1, 2, 3
boolean isTrusted     // 事件是由用户交互生成的，还是有脚本或者 dispatchEvent 生成的
DOMEvent nativeEvent
void preventDefault()
boolean isDefaultPrevented()
void stopPropagation()
boolean isPropagationStopped()
DOMEventTarget target
number timeStamp
string type
```


## Hooks

Hooks are a new feature proposal that lets you use state and other React
features without writing a class.    

```js
import { useState } from 'react';

function Example() {
  // Declare a new staste variable, which we'll call 'count'
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => {setCount(count+1)}}>
        Click me
      </button>
    </div>
  );
}
```    

使用 Hooks 的动机：   

+ It's hard to reuse stateful logic between components。render props 和 HOC 太过
复杂。With Hooks, you can extract stateful logic from a component so it can be
tested independently and reused.
+ Complex components become hard to understand.
+ Claaes confuse both people and machines

### Hooks at a Glance

```js
import { useState } from 'react';

function Example() {
  // Declare a new state variable, which we'll call "count"
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```    

`useState` 就是一个 Hook，我们在一个函数组件中调用这个函数来为函数组件添加一些局部的 state。
React 会在 re-render 之间保持这个 state。`useState` 返回一对值：当前的 state 值和一个
用来更新 state 的函数。有点像类中的 `this.setState()`，但是它不回将旧的 state 和新的 state
进行合并。     

Hooks 就是一些函数，可以让我们 "hook into" React state 和生命周期的功能到函数组件中。    

React 提供了一些内置的 Hooks 例如 `useState`，但是我们也可以创建自己的 Hooks。    

`useEffect` 为函数组件添加了一些执行副作用的能力。它和类中的 `componentDidMount`,
`componentDidUpdate`, `componentWillUnmount` 有同样的目的。     

```js
import { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```    

默认情况下，React 会在每次渲染后执行 effect 函数。    

`useEffect` 的参数可以返回一个函数，用来执行清理工作。    

这个清洁工作会在组件卸载时调用。但是同时它也会在每次重新调用 effect 函数前执行一次。    

在 `useEffect` 中也可以指定在某些情况下，跳过 effect 的执行，即传递一个数组作为第二个参数：   

```js
useEffect(() => {
  document.title = `You clicked ${count} times`;
}, [count]);    // only re-run the effect if count changes
```    

清理阶段同样有效。     

### Rules of Hooks

+ Only call hooks at the function top level
+ Only call hooks from React function component, or from custom hooks.

### Custom Hooks

一个自定义 hook 是一个以名字 `use` 开头的函数，这个函数可以调用其他的 hooks。    

```js
import { useState, useEffect } from 'react';

function useFriendStatus(friendID) {
  const [isOnline, setIsOnline] = useState(null);

  function handleStatusChange(status) {
    setIsOnline(status.isOnline);
  }

  useEffect(() => {
    ChatAPI.subscribeToFriendStatus(friendID, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(friendID, handleStatusChange);
    };
  });

  return isOnline;
}
```    

Last Update: 2018-11-06