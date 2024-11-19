# sec-6

<!-- TOC -->

- [sec-6](#sec-6)
- [API Reference](#api-reference)
  - [React](#react)
    - [React.PureComponent](#reactpurecomponent)
    - [React.memo](#reactmemo)
    - [createElement()](#createelement)
    - [cloneElement()](#cloneelement)
    - [createFactory()](#createfactory)
    - [isValidElement()](#isvalidelement)
    - [React.Children](#reactchildren)
    - [React.Fragment](#reactfragment)
    - [React.createRef()](#reactcreateref)
    - [React.forwardRef](#reactforwardref)
    - [React.lazy](#reactlazy)
    - [React.Suspense](#reactsuspense)
  - [React.Component](#reactcomponent)
  - [ReactDOM](#reactdom)
  - [ReactDOMServer](#reactdomserver)

<!-- /TOC -->

# API Reference

## React

- 组件：
  + React.Component
  + React.PureComponent
  + React.memo
- 创建 react elements
  + React.createElement()
  + React.createFactory()
- elements 操作
  + React.cloneElement()
  + React.isValidElement()
  + React.Children
- Fragments
  + React.Fragment
- Refs
  + React.createRef
  + React.forwardRef
- Suspense
  + React.lazy
  + React.Suspense
  - Hooks
    + `useState`
    + `useEffect`
    + `useContext`
    + `useReducer`
    + `useCallback`
    + `useMemo`
    + `useRef`
    + `useImperativeHandle`
    + `useLayoutEffect`
    + `useDebugValue`

### React.PureComponent

类似 `React.Component`，唯一不同是，`React.Component` 没有实现 `shouldComponentUpdate()`
方法，`PureComponent` 实现了这个方法，其中进行了 prop 和 state 的浅比较。    

### React.memo

```js
const MyComponent = React.memo(function MyComponent(props) {
  // ...
});
```    

`React.memo` 是一个 HOC，类似于 `React.PureComponent`，但是是为函数式组件准备的。    

如果函数式组件对于同样的 props 应该渲染同样的内容，那就可以用 `React.memo` 包一下通过记忆结果
来提升性能。意味着 React 会使用上次渲染的结果，跳过本次的渲染。    

`React.memo` 进检查 prop 的修改，如果函数组件有 `useState` 或 `useContext` hook，那么
在 state 和 context 变动的时候还是会重新渲染。    

默认情况下进行的是浅比较，如果想要控制比较过程，可以提供一个定制的比较函数作为第二个参数：    

```js
function MyComponent(props) {
  // ...
}

function areEqual(prevProps, nextProps) {
  /*
    return true if passing nextProps to render would return
    the same result as passing prevProps to render,
    otherwise return false
  */
}

export default React.memo(MyComponent, areEqual);
```     

### createElement()

```js
React.createElement(
  type,
  [props],
  [...children]
);
``` 

### cloneElement()

```js
React.cloneElement(
  element,
  [props],
  [...children]
);
```    

克隆并返回新的 element，新属性和旧属性会进行浅merge，新的子节点会直接替换旧的，`key` 和 `ref`
会保留。   

### createFactory()

```js
React.createFactory(type)
```    

返回一个用来生成指定类型元素的函数。类似 `React.createElement()`。这个 API 基本被弃用。   

### isValidElement()

```js
React.isValidElement(object);
```    

### React.Children

```js
React.Children.map(children, function[(thisArg)]);
```     

如果 `children` 是 `null` 或 `undefined`，返回 `null` 或 `undefined`。    

```js
React.Children.forEach(children, function[(thisArg)]);

React.Children.only(children);
```     

如果 `children` 是一个单一节点就返回，否则抛出异常。     

```js
React.Children.toArray(children);
```     

### React.Fragment

```js
render() {
  return (
    <React.Fragment>
      Some text.
      <h2>A heading</h2>
    </React.Fragment>
  );
}
```    

### React.createRef()

```js
class MyComponent extends React.Component {
  constructor(props) {
    super(props);

    this.inputRef = React.createRef();
  }

  render() {
    return <input type="text" ref={this.inputRef} />
  }

  componentDidMount() {
    this.inputRef.current.focus();
  }
}
```    

### React.forwardRef

创建一个组件用来转发它收到的 ref 属性给其组件树中的另一个组件。    

### React.lazy

略。    

### React.Suspense

略。   

## React.Component

挂载阶段：    

- `constructor()`
- `static getDerivedStateFromProps()`
- `render()`
- `componentDidMount()`

还有不建议使用的 `UNSAFE_componentWillMount()`    

更新阶段：    

- `static getDerivedStateFromProps()`
- `shouldComponentUpdate()`
- `render()`
- `getSnapshotBeforeUpdate()`
- `componentDidUpdate()`

不建议使用的 `UNSAFE_componentWillUpdate()`, `UNSAFE_componentWillReceiveProps()`   


卸载阶段：    

- `componentWillUnmount()`     

错误处理阶段：    

- `static getDerivedStateFromError()`
- `componentDidCatch()`    

其他API：   

- `setState()`
- `forceUpdate()`

类属性：   

- `defaultProps`
- `displayName`    

实例属性：   

- `props`
- `state`    

render 方法应该返回一下类型之一：    

- react elements
- 数组和 fragments
- portals
- 字符串或数字
- 布尔值或 null。什么都不渲染。    

```js
componentDidUpdate(prevProps, prevState, snapshot)
```    

如果我们的组件实现了 `getSnapshotBeforeUpdate()`，那么这个函数返回的值会作为第三个参数传入。   

```js
shouldComponentUpdate(nextProps, nextState);
```     

当调用 `forceUpdate()` 的时候不会调用这个方法。   

```js
static getDerivedStateFromProps(props, state)
```    

在 `render` 方法前执行，初始挂载和后续更新前都会执行。返回 `null` 什么都不更新，否则返回更新
后的对象作为新的 state。    

注意这是个静态方法，是不能访问组件实例的。    

```js
getSnapshotBeforeUpdate(prevProps, prevState)
```    

在 render 结果提交前执行。    

```js
static getDerivedStateFromError(error)
```     

```js
class ErrorBoundary extends Component {
    constructor(props) {
      super(props);
      this.state = {
        hasError: false
      };
    }

    static getDerivedStateFromError(error) {
      return {
        hasError: true
      };
    }

    render() {
      if (this.state.hasError) {
        return <h1>Something went wrong.</h1>;
      }

      return this.props.children;
    }
}
```     

```js
componentDidCatch(error, info)
```     

`info` 是一个对象，其中包括一个 `componentStack` 属性包含了堆栈信息。    

`getDerivedStateFromError` 是在 render 阶段调用的，因此不能包含副作用。而 `componentDidCatch()`
是在 commit 阶段执行的，因此可以包含副作用。    

剩下废弃的 api 就不讲了。    

```js
setState(updater, [callback])
```    

```js
component.forceUpdate(callback)
```    

## ReactDOM

- `render()`
- `hydrate()`
- `unmountComponentAtNode()`
- `findDOMNode()`
- `createPortal()`


```js
ReactDOM.render(element, container[, callback])
```    

返回组件的引用，如果是 stateless 组件就返回 null。    

如果 `container` 之前就渲染了 react element，就执行更新操作。   

回调函数会在组件渲染完或更新完后的调用。    

```js
ReactDOM.hydrate(element, container[, callback])
```     

类似于 `render`，不过视为了用 ReactDOMServer 渲染的 html 内容节点准备的。    

```js
ReactDOM.unmountComponentAtNode(container)
```     

如果成功卸载了组件返回 `true`，如果没有可卸载的组件返回 `false`。    


```js
ReactDOM.createPortal(child, container)
```     

## ReactDOMServer

```js
import ReactDOMServer from 'react-dom/server';
```    

这两个模块在服务端和浏览器端均可执行：   

- `renderToString`
- `renderToStaticMarkup`    

下面的方法依赖 `stream` 模块，因此只能在服务端执行：   

- `renderToNodeStream`
- `renderToStaticNodeStream`

```js
ReactDOMServer.renderToString(element)
```    

把一个 react element 渲染成最初的 html。返回 html 字符串。    

如果我们在一个已经有这种服务端渲染的标签的节点上调用 `ReactDOM.hydrate()`，React 会保持标签
的结构，只进行事件的绑定。    

```js
ReactDOMServer.renderToStaticMarkup(element);
```     

类似于 `renderToString`，除了这个方法不会生成 React 内部使用的额外的 DOM 属性。    

```js
ReactDOMServer.renderToNodeStream(element)
```    

把一个 react element 渲染成最初的 html。返回一个输出 html 的 readable stream。     

