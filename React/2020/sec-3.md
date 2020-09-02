# Sec-3

<!-- TOC -->

- [Sec-3](#sec-3)
- [Main Concepts](#main-concepts)
  - [JSX](#jsx)
  - [Components and Props](#components-and-props)
  - [Conditional Rendering](#conditional-rendering)
  - [List and Keys](#list-and-keys)
  - [Forms](#forms)
- [Advanced Guides](#advanced-guides)
  - [Code-Spliting](#code-spliting)
  - [Context](#context)
    - [React.createContext](#reactcreatecontext)
    - [Context.Provider](#contextprovider)
    - [Class.contextType](#classcontexttype)
    - [Context.Consumer](#contextconsumer)
    - [Context.displayName](#contextdisplayname)
  - [Error Boundaries](#error-boundaries)
  - [Forwarding Refs](#forwarding-refs)

<!-- /TOC -->

# Main Concepts

## JSX

JSX 会生成 React elements。   

```js
const element = (
  <h1 className="greeting">
    Hello, world!
  </h1>
);

const element = React.createElement(
  'h1',
  { className: 'greeting' },
  'Hello world!'
);
```     

最终生成的 element 类似这样的结构：    

```js
const element = (
  type: 'h1',
  props: {
    className: 'greeting',
    children: 'Hello, world!'
  }
);
```      

## Components and Props

从概念上说，components 是 JS 函数，接收 props 作为输入，然后返回 elements。     

```js
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
```     

```js
class Welcome extends React.Components {
  render() {
    return <h1>Hello, {this.props.name}</h1>
  }
}
```     

注意这里 state 和小程序的 data 不一样，react 的 `setState` 是真的异步的，也就是调用完立刻
访问的话，用的是旧值。     

如果要保证使用最新值的话：     

```js
this.setState((state, props) => {
  return {
    counter: state.counter + props.increment
  }
});
```     

## Conditional Rendering

```js
class App extends Component {
  // ...
  render() {
    const {isLoggedIn} = this.state;
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
    )
  }
}
```    

如果有时候我们想隐藏某个组件，就在 `render` 方法中返回 `null` 就行。    

## List and Keys

渲染 elements 集合：    

```js
const numbers = [1, 2, 3, 4, 5];
const listItems = numbers.map((number) => 
  <li>{number * 2}</li>
);

ReactDOM.render(
  <ul>{listItems}</ul>,
  document.getElementById('root')
);
```    

key 属性帮助 react 识别哪些项目是修改的，哪些是新增的，哪些是被移除了。     

使用索引做 key 属性并不是一个好选择，因为如果列表的顺序变化了，索引可能跟着变，结果渲染就可能有
问题。    

key 仅在数组元素那一层有意义。     

## Forms

受控组件 controlled component。    

对于 select，react 使用的是在 select 添加 value 属性而不是 selected 属性。多选就传个数组。   

由于 file 类型的值是只读的，所以这是一个非受控组件。    

# Advanced Guides

## Code-Spliting

第一种方案 `import()` 函数。    

第二种方案 `React.lazy` 和 `Suspense`。    

`React.lazy` 可以让我们像普通组件一样渲染一个使用 `import()` 加载的组件。（话说光靠 `import()`
函数不行吗，为什么要搭配 `React.lazy` 呢）  

~~感觉 `import()` 函数不是用来加载组件的，好像走不通。~~   

实验证明是可以的哈：     

```js
// App.js
class App extends Component {
  // ...
  onClick = () => {
      import('./async')
      .then((Comp) => {
        this.AsyncComp = <Comp.default name="xixi" />;
        this.setState({
          loaded: 1
        });
      });
  }

  render() {
    return (
        <p onClick={this.onClick}>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        {this.state.loaded && this.AsyncComp}
    )
  }
}
```   

```js
// async.js
import React from 'react';

function AsyncComp(props) {
    return (
        <div>This is an asynchrous loaded components, {props.name}</div>
    );
}

export default AsyncComp;
```

```js
const OtherComponent = React.lazy(() => import ('./OtherComponent'));
```     

`React.lazy()` 函数接受一个函数做参数，这个参数必须调用 `import()` 函数。并且需要返回一个
Promise，promise 需要 resolve 为一个 `default` export 一个 React 组件的模块。    

延迟加载的组件之后应该渲染到一个 `Suspence` 组件中，这个组件可以让我们在等待组件加载的过程中，
显示一些回退内容。     

```js
import React, { Suspense } from 'react';

const OtherComponent = React.lazy(() => import('./OtherComponent'));

function MyComponent() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
          <OtherComponent />
      </Suspense>
    </div>
  )
}
```    

`fallback` 属性是一个 react element，Suspense 组件可以出现在延迟组件之上的任意一层，甚至可以
在一个 Suspense 组件中嵌套多个延迟组件（那这种情况下时候时候fallback会消失呢）。    

```js
import React, { Suspense } from 'react';

const OtherComponent = React.lazy(() => import('./OtherComponent'));
const AnotherComponent = React.lazy(() => import('./AnotherComponent'));

function MyComponent() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <section>
          <OtherComponent />
          <AnotherComponent />
        </section>
      </Suspense>
    </div>
  );
}
```


## Context

```js
// Context lets us pass a value deep into the component tree
// without explicitly threading it through every component.
// Create a context for the current theme (with "light" as the default).
const ThemeContext = React.createContext('light');

class App extends React.Component {
  render() {
    // Use a Provider to pass the current theme to the tree below.
    // Any component can read it, no matter how deep it is.
    // In this example, we're passing "dark" as the current value.
    return (
      <ThemeContext.Provider value="dark">
        <Toolbar />
      </ThemeContext.Provider>
    );
  }
}

// A component in the middle doesn't have to
// pass the theme down explicitly anymore.
function Toolbar() {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

class ThemedButton extends React.Component {
  // Assign a contextType to read the current theme context.
  // React will find the closest theme Provider above and use its value.
  // In this example, the current theme is "dark".
  static contextType = ThemeContext;
  render() {
    return <Button theme={this.context} />;
  }
}
```    

这要是多个 context 怎么办呢。    

context 适用于不同嵌套层级的多个组件都需要读取某些数据。如果仅仅是某个嵌套比较深的组件想要用
某个数据，而懒的把数据一层一层传递下去，可以将这个组件直接提出来，然后把组件作为 props 一层一层
传下去，虽然仍然避免不了需要一层一层传递。   

这叫做控制反转。这种方案也有弊端就是高层组件会变复杂，必须要处理一些底层组件的逻辑了。    

context 有点像是把数据“广播”出去。    

### React.createContext

```js
const MyContext = React.createContext(defaultValue);
```     

`defaultValue` 仅在底层订阅组件在组件树中未找到一个匹配的 Provider 时使用。    

### Context.Provider

```js
<MyContext.Provider value={/* some value */} />
```    

每个 context 都伴随着一个 Provider 组件，从而让底层组件订阅 context 的变化。    

当 value 属性变化时，所有的订阅者都会重渲染。从 Provider 到订阅组件重新渲染的冒泡过程不受
`shouldComponentUpdate` 方法的约束，所以即使订阅组件的祖先组件跳过了更新，订阅组件也会得到
更新。    

### Class.contextType

```js
class MyClass extends Component {}
MyClass.contextType = MyContext;
```     

### Context.Consumer

```js
<MyContext.Consumer>
  {value => /* render something based on the context value */}
</MyContext.Consumer>
```    

一个订阅了 context 的组件，主要是为了函数式组件订阅 context。     

要求 child 是一个函数。    

### Context.displayName

给 React 开发工具使用。    

如果要使用多个 context，就必须建立多个 Context 对象，然后嵌套起来。    

```js
function Content() {
  return (
    <ThemeContext.Consumer>
      {theme => (
        <UserContext.Consumer>
          {user => (
            <ProfilePage user={user} theme={theme} />
          )}
        </UserContext.Consumer>
      )}
    </ThemeContext.Consumer>
  );
}
```    

## Error Boundaries

Error Boundaries 是一个组件，这个组件可以捕获子组件树中抛出的异常，并展示一个回退的 UI。
组件可以捕获构造函数、render 函数，生命周期方法中抛出的异常。不能捕获以下情况抛出的异常：   

- 事件handler
- 异步代码
- 服务端渲染
- error boundary 组件自身抛出的异常     

一个类式组件只要定义了 `static getDerivedStateFromError()` 或 `componentDidCatch()`
方法，那这个组件就成了一个 error boundary 组件。`static getDerivedStateFromError()` 方法
用来在出错后渲染回退UI，`componentDidCatch()` 记录错误信息。    

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


  componentDidCatch(error, errorInfo) {
    logErrorToMyService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```     

## Forwarding Refs

ref forwarding 是一种功能，可以让一些组件接收一个他们收到的 ref，然后把它转发到后代节点中。    

在下面的例子中，`FancyButton` 使用 `React.forwardRef` 获取一个传递给它的 `ref`，然后将
起转发到它渲染的 button 元素上。    

```js
const FancyButton = React.forwardRef((props, ref) => {
  <button ref={ref} className="fancyButton">
    {props.children}
  </button>
});

const ref = React.createRef();
<FancyButton ref={ref}>Click me!</FancyButton>
```    

这样，使用 `FancyButton` 的组件就可以获取到对底层 button 的 ref 引用。    

那么其实 ref forwarding 是指我们想创建一个 ref 对象，然后依赖 forwardRef 函数把这个 ref
绑到下层组件或 dom 节点上，从而能跨层级操作组件或节点。    


注意绑定后 `ref.current` 就指向了 button 节点。   

和 key 一样，严格来说 `ref` 也不属于一个 prop，所以传递的时候要注意。    

```js
function logProps(Component) {
  class LogProps extends React.Component {
    componentDidUpdate(prevProps) {
      console.log('old props:', prevProps);
      console.log('new props:', this.props);
    }

    render() {
      const {forwardedRef, ...rest} = this.props;

      // Assign the custom prop "forwardedRef" as a ref
      return <Component ref={forwardedRef} {...rest} />;
    }
  }

  // Note the second param "ref" provided by React.forwardRef.
  // We can pass it along to LogProps as a regular prop, e.g. "forwardedRef"
  // And it can then be attached to the Component.
  return React.forwardRef((props, ref) => {
    return <LogProps {...props} forwardedRef={ref} />;
  });
}
```     

