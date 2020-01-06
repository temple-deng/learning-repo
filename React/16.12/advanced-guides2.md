# Advanced Guides

## Error Boundaries

Error boundaries 也是 React 组件，这些组件会捕获其后代组件树中抛出的 JS 报错，记录这些报错，
并展示一个回退的 UI，而不是直接让组件树崩溃。Error boundaries 会捕获渲染，生命周期，以及构造
函数中的错误。    

Error boundaries 不会捕获以下情况中的错误：   

- event handlers
- 异步代码
- 服务端渲染
- error boundaries 自身抛出的错误     

一个类式的组件如果定义了 `static getDerivedStateFromError()` 或者 `componentDidCatch`
方法，就会成为一个 Error Boundaries 组件，`static getDerivedStateFromError()` 用来
展示回退的 UI，`componentDidCatch()` 用来记录错误信息。    

```js
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError(error) {
    return {hasError: true};
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

## Refs 转发

refs 转发是一种自动将组件的一个引用传递给其后代的技术。    

### DOM 组件的转发

在下面的例子中，`FancyButton` 使用 `React.forwardRef` 获取传递给它的一个 ref，然后将其
转发给它渲染的 `button` DOM 节点：   

```js
const FancyButton = React.forwardRef((props, ref) => {
  return (
    <button ref={ref} className="FancyButton">
      {props.children}
    </button>
  );
});

const ref = React.createRef();
<FancyButton ref={ref}>Click me!</FancyButton>;
```    

这个时候，使用 `FancyButton` 的组件就可以访问到内部的 `button` DOM 元素。通过 `ref.current`
访问。    

我们捋一下上面发生了什么事情：   

1. 首先，通过 `React.createRef` 创建一个 `ref` 变量。
2. 之后，将这个 ref 通过组件传递下去
3. 这里 FancyButton 应该是必须用 `React.forwardRef` 创建的，否则他是接收不到 ref 参数的，
ref 是不在 props 中出现的
4. 然后 FancyButton 再将 ref 绑定给 dom 节点。   
5. 进而使用 ref 传递给 FancyButton 的组件可以通过 ref.current 访问到 DOM 节点

然而测试的时候可以通过这样貌似也可以绑定 ref:   

```js
const FancyButton = function (props) {
    return (
        <button className="fancy-button" ref={props.refProp}>Click me</button>
    )
}

const ref = React.createRef();
class ButtonWrapper extends Component {
    componentDidMount() {
        this.ref = ref;
        console.log(this.ref.current);
    }

    render() {
        return (
            <div>
                <FancyButton refProp={ref} />
            </div>
        );
    }
}
```    

甚至其实查看 `createRef` 的返回值时发现返回对象也只是一个包含有 `current` 属性的普通对象。
所以我们甚至可以这样，完全不用 createRef:   

```js
const FancyButton = function (props) {
    return (
        <button className="fancy-button" ref={props.refProp}>Click me</button>
    )
}

class ButtonWrapper extends Component {
    state = {
        ref: {
            current: null
        }
    };
    componentDidMount() {
        console.log(this.state.ref.current);
    }

    render() {
        return (
            <div>
                <FancyButton refProp={this.state.ref} />
            </div>
        );
    }
}
```     

也就是说关键点是一个元素或组件上挂接的 `ref` 属性会绑定到对应的元素和组件。   

### 在高阶组件中使用

```js
function logProps(WrappedComponent) {
  class LogProps extends Component {
    componentDidUpdate(prevProps) {
      console.log('old props:', prevProps);
      console.log('new props:', this.props);
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  }
  return LogProps;
}
```    

```js
class FancyButton extends React.Component {
  focus() {
    // ...
  }

  // ...
}

// Rather than exporting FancyButton, we export LogProps.
// It will render a FancyButton though.
export default logProps(FancyButton);
```    

上面这个例子需要注意的是 ref 并不会传递下去，因为 `ref` 和 `key` 一样是特殊的属性，不同于普通
的 props 的处理。   

在这种情况下 ref 其实是指向了 LogProps 组件。   

```js
function logProps(Component) {
  class LogProps extends React.Component {
    componentDidUpdate(prevProps) {
      console.log('old props:', prevProps);
      console.log('new props:', this.props);
    }

    render() {
      const {forwardedRef, ...rest} = this.props;

      // 将自定义的 prop 属性 “forwardedRef” 定义为 ref
      return <Component ref={forwardedRef} {...rest} />;
    }
  }

  // 注意 React.forwardRef 回调的第二个参数 “ref”。
  // 我们可以将其作为常规 prop 属性传递给 LogProps，例如 “forwardedRef”
  // 然后它就可以被挂载到被 LogProps 包裹的子组件上。
  return React.forwardRef((props, ref) => {
    return <LogProps {...props} forwardedRef={ref} />;
  });
}
```    

## Fragments

```js
render() {
  return (
    <React.Fragment>
      <ChildA />
      <ChildB />
      <ChildC />
    </React.Fragment>
  );
}
```    

短语法：    

```js
class Columns extends React.Component {
  render() {
    return (
      <>
        <td>Hello</td>
        <td>World</td>
      </>
    );
  }
}
```    

使用普通语法定义的 `<React.Fragment>` 可以包含 key 属性。    

```js
function Glossary(props) {
  return (
    <dl>
      {props.items.map(item => (
        // Without the `key`, React will fire a key warning
        <React.Fragment key={item.id}>
          <dt>{item.term}</dt>
          <dd>{item.description}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}
```   

key 也是 Fragment 唯一支持的属性。   

## Higher-Order Components

具体而言，高阶组件是参数为组件，返回值为新组件的函数。    

