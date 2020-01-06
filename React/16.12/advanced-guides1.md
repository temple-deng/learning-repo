# Advanced Guides

<!-- TOC -->

- [Advanced Guides](#advanced-guides)
  - [Code Splitting](#code-splitting)
    - [import()](#import)
    - [React.lazy](#reactlazy)
  - [Context](#context)
    - [什么时候用 Context](#什么时候用-context)
    - [API](#api)
    - [动态 Context](#动态-context)
    - [在嵌套组件中更新 Context](#在嵌套组件中更新-context)

<!-- /TOC -->

## Code Splitting

### import()

```js
// math.js
export function add(a, b) {
  return a + b;
}
```    

```js
// add.js
import("./math.js").then((math) => {
  console.log(math.add(16, 26));
});
```     

### React.lazy

`Reacy.lazy` 函数能让你像渲染常规组件一样处理动态引入（的组件）.    

```js
const OtherComponent = React.lazy(() => import('./OtherComponent'));
```    

此代码将会在组件首次渲染时，自动导入包含 OtherComponent 组件的包。   

`React.lazy` 接受一个函数，这个函数需要动态调用 `import()`。它必须返回一个 Promise，该
Promise 需要 resolve 一个 `defalut export` 为 React 组件。   

然后应在 `Suspense` 组件中渲染 lazy 组件，如此使得我们可以使用在等待加载 lazy 组件时做优雅
降级（如 loading 指示器等）。    

```js
const OtherComponent = React.lazy(() => import('./OtherComponent'));

function MyComponent() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <OtherComponent />
      </Suspense>
    </div>
  );
}
```     

`fallback` 属性接受任何在组件加载过程中你想展示的 React 元素。你可以将 `Suspense` 组件置于
懒加载组件之上的任何位置。你甚至可以用一个 Suspense 组件包裹多个懒加载组件。    

## Context

Context 提供了一种将数据直接通过组件树向下传递，而不用手动在每次传递的方案。   

### 什么时候用 Context

一般用在许多组件需要共享某些类全局数据的情况。    

```js
// 首先创建一个 theme context，默认是 light
const ThemeContext = React.createContext('light');

class App extends React.Component {
  render() {
  // 然后，使用一个 Provider 将 theme 传递到组件树中，当前使用的值是 dark
    return (
      <ThemeContext.Provider value="dark">
        <Toolbar />
      </ThemeContext.Provider>
    );
  }
}

function Toolbar() {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

class ThemedButton extends React.Comonent {
  // 指定 contextType 读取当前的 theme context
  // React 会往上找到最近的 theme Provider，然后使用它的值
  static contextType = ThemeContext;
  render() {
    return <Button theme={this.context} />;
  }
}
```    

### API

`React.createContext()`    

```js
const MyContext = React.createContext(defaultValue);
```    

创建一个 Context 对象，当 React 渲染一个订阅了该 Context 对象的组件时，组件将会从最近的 `Provider`
读取到当前的 context 值。    

`defaultValue` 仅在组件没有找到匹配的 `Provider` 的时候才会使用。   

`Context.Provider`     

每个 Context 对象都包含有一个 Provider 组件，允许订阅了该 Context 对象的组件消费当前 context 值。   


Provider 的所有后代消费者节点都会在 Provider `value` 属性变化时重新渲染。Provider 及其内部
consumer 组件都不受制于 `shouldComponentUpdate` 函数，因此当 consumer 组件在其祖先组件
退出更新的情况下也能更新。    

是否发生变动是用的 `Object.is()` 函数。这里用 `Object.is` 意味着如果传对象和数组等非基础数据
的话可能会有坑。        

`Class.contextType`    

```js
class MyClass extends React.Component {
  componentDidMount() {
    let value = this.context;
    // 可以使用 value 执行一些带有副作用的行为
  }

  componentDidUpdate() {
    let value = this.context;
    // ...
  }

  componentWillUnmount() {
    let value = this.context;
    // ...
  }

  render() {
    let value = this.context;
    // ...
  }
}

MyClass.contextType = MyContext;
```    

挂载在 class 上的 `contextType` 属性会被重赋值为一个由 `React.createContext()` 创建的
Context 对象。这能让你使用 `this.context` 来消费最近 Context 上的那个值。你可以在任何生命
周期中访问到它，包括 render 函数中。   

使用这个方案只能订阅 1 个context。   

`Context.Consumer`     

```js
<MyContext.Consumer>
  {value => /* render something base on the context value */}
</MyContext.Consumer>
```    

一个订阅了 context 变化的组件。使用这个就可以让我们在函数式组件中也可以订阅 context。   

注意其子节点必须是一个返回 React 节点的函数。   

`Context.displayName`    

Context 对象接受一个 `displayName` 字符串属性，React 开发者工具使用这个字符串来决定展示 contenxt。   

### 动态 Context

theme-context.js   

```js
export const themes = {
  light: {
    foreground: '#000000',
    background: '#eeeeee',
  },
  dark: {
    foreground: '#ffffff',
    background: '#222222',
  },
};

export const ThemeContext = React.createContext(
  themes.dark // default value
);
```    

themed-button.js   

```js
import {ThemeContext} from './theme-context';

class ThemedButton extends React.Component {
  render() {
    let props = this.props;
    let theme = this.context;
    return (
      <button
        {...props}   // 注意这里 children 可以正常渲染出来，但是如果自定义了子孙节点就会把 props 中的覆盖
        style={{backgroundColor: theme.background}}
      />
    );
  }
}
ThemedButton.contextType = ThemeContext;

export default ThemedButton;
```     

app.js    

```js
import {ThemeContext, themes} from './theme-context';
import ThemedButton from './themed-button';

// An intermediate component that uses the ThemedButton
function Toolbar(props) {
  return (
    <ThemedButton onClick={props.changeTheme}>
      Change Theme
    </ThemedButton>
  );
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      theme: themes.light,
    };

    this.toggleTheme = () => {
      this.setState(state => ({
        theme:
          state.theme === themes.dark
            ? themes.light
            : themes.dark,
      }));
    };
  }

  render() {
    // The ThemedButton button inside the ThemeProvider
    // uses the theme from state while the one outside uses
    // the default dark theme
    return (
      <Page>
        <ThemeContext.Provider value={this.state.theme}>
          <Toolbar changeTheme={this.toggleTheme} />
        </ThemeContext.Provider>
        <Section>
          <ThemedButton />
        </Section>
      </Page>
    );
  }
}

ReactDOM.render(<App />, document.root);
```     

### 在嵌套组件中更新 Context

经常可能会产生这样的需求：要从组件树的很深处更新 context。这个情况下可以通过 context 传递一个
函数，使得 consumers 组件更新 context：    

theme-context.js:   

```js
export const ThemeContext = React.createContext({
  theme: themes.dark,
  toggleTheme: () => {}
});
```    

theme-toggler-button.js:   

```js
import {ThemeContext} from './theme-content';

function ThemeTogglerButton() {
  return (
    <ThemeContext.Consumer>
      {({theme, toggleTheme}) => {
        <button onClick={toggleTheme} style={{backgroundColor: theme.background}}>
          Toggle Theme
        </button>
      }}
    </ThemeContext.Consumer>
  );
}
```    

app.js:   

```js
import {ThemeContext, themes} from './theme-context';
import ThemeTogglerButton from './theme-toggler-button';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.toggleTheme = () => {
      this.setState(state => ({
        theme:
          state.theme === themes.dark
            ? themes.light
            : themes.dark,
      }));
    };

    // State also contains the updater function so it will
    // be passed down into the context provider
    this.state = {
      theme: themes.light,
      toggleTheme: this.toggleTheme,
    };
  }

  render() {
    // The entire state is passed to the provider
    return (
      <ThemeContext.Provider value={this.state}>
        <Content />
      </ThemeContext.Provider>
    );
  }
}

function Content() {
  return (
    <div>
      <ThemeTogglerButton />
    </div>
  );
}

ReactDOM.render(<App />, document.root);
```     

因为 context 会使用参考标识（reference identity）来决定何时进行渲染，这里可能会有一些陷阱，
当 provider 的父组件进行重渲染时，可能会在 consumers 组件中触发意外的渲染。    

