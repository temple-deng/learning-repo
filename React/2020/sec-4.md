# Sec-4

<!-- TOC -->

- [Sec-4](#sec-4)
- [Advanced Guides](#advanced-guides)
  - [Fragments](#fragments)
  - [Higher-Order Components](#higher-order-components)
  - [JSX In Depth](#jsx-in-depth)
  - [Optimizing Performance](#optimizing-performance)
  - [Portals](#portals)
  - [Profiler API](#profiler-api)
  - [Reconciliation](#reconciliation)
  - [Refs and the DOM](#refs-and-the-dom)

<!-- /TOC -->

# Advanced Guides

## Fragments

```js
class Columns extends Component {
  render() {
    return (
      <React.Fragment>
        <td>Hello</td>
        <td>World</td>
      </React.Fragment>
    );
  }
}
```     

还有种缩写语法：    

```js
class Columns extends Component {
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

key 是 `Fragment` 组件唯一支持的属性，不过缩写语法不支持。    

## Higher-Order Components

hoc 是一个函数，接收一个组件做参数，然后返回一个新的组件。    

A HOC is a pure function with zero side-effects.     

## JSX In Depth

react element type 不能是一个普通的表达式（对象的属性表示法可以），如果我们真的需要在执行时
才决定组件的类型，需要将类型先赋值给一个变量：    

```js
import React from 'react';
import { PhotoStory, VideoStory } from './stories';

const components = {
  photo: PhotoStory,
  video: VideoStory
};

function Story(props) {
  // Wrong! JSX type can't be an expression.
  return <components[props.storyType] story={props.story} />;
}
```    

```js
import React from 'react';
import { PhotoStory, VideoStory } from './stories';

const components = {
  photo: PhotoStory,
  video: VideoStory
};

function Story(props) {
  // Correct! JSX type can be a capitalized variable.
  const SpecificStory = components[props.storyType];
  return <SpecificStory story={props.story} />;
}
```    

属性扩展语法：   

```js
const Button = props => {
  const { kind, ...other } = props;
  const className = kind === "primary" ? "PrimaryButton" : "SecondaryButton";
  return <button className={className} {...other} />;
};

const App = () => {
  return (
    <div>
      <Button kind="primary" onClick={() => console.log("clicked!")}>
        Hello World!
      </Button>
    </div>
  );
};
```    

JSX 会删除每行开头和结尾的空白，也会移除空白行。和标签同行的新行会移除。字符串中间的新行会压缩
成一个空白。所以下面的东西是等价的，       

```js
<div>Hello World</div>

<div>
  Hello World
</div>

<div>
  Hello
  World
</div>

<div>

  Hello World
</div>
```      

貌似现在能直接返回数组：   

```js
render() {
  // No need to wrap list items in an extra element!
  return [
    // Don't forget the keys :)
    <li key="A">First item</li>,
    <li key="B">Second item</li>,
    <li key="C">Third item</li>,
  ];
}
```    

那其实加上 fragment 是有两种办法返回数组不加嵌套元素。    

children 甚至可以是函数：    

```js
// Calls the children callback numTimes to produce a repeated component
function Repeat(props) {
  let items = [];
  for (let i = 0; i < props.numTimes; i++) {
    items.push(props.children(i));
  }
  return <div>{items}</div>;
}

function ListOfTenThings() {
  return (
    <Repeat numTimes={10}>
      {(index) => <div key={index}>This is item {index} in the list</div>}
    </Repeat>
  );
}
```     

布尔值、`null`, `undefined` 会被忽视，什么都不渲染。    


## Optimizing Performance

`shouldComponentUpdate` 会在每次重新渲染前执行，这个函数默认的实现会返回 `true`，即允许 react
进行更新渲染，如果我们知道在某些情况下没必要更新，可以返回 `false`，跳过本次更新渲染过程。    

在大部分情况下，我们可以简单的继承`React.PureComponent`而不是手写 `shouldComponentUpdate`
方法。这个组件的 `shouldComponentUpdate` 使用浅比较判断了当前的 props 和 state 和之前的。    

## Portals

protals 用来在组件树dom层级之外的 dom 节点中渲染子组件。    

```js
ReactDOM.createPortal(child, container);
```    

`child` 是任意可渲染的 react 子节点，比如元素、字符串、fragment。`container` 是一个 dom 元素。    

```js
render() {
  // React does *not* create a new div. It renders the children into `domNode`.
  // `domNode` is any valid DOM node, regardless of its location in the DOM.
  return ReactDOM.createPortal(
    this.props.children,
    domNode
  );
}
```      

典型的用法是当父组件有 `overflow: hidden` 或 `z-index` 样式时，仍然希望后代元素能够“溢出”
容器。     

即便 portal 可能在dom树中的任意地方，其行为表现仍然和普通的 react 子组件一样。context 仍然
生效，portal 仍然在 react 树中正确的位置。    

```html
<html>
  <body>
    <div id="app-root"></div>
    <div id="modal-root"></div>
  </body>
</html>
```    

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
    // The portal element is inserted in the DOM tree after
    // the Modal's children are mounted, meaning that children
    // will be mounted on a detached DOM node. If a child
    // component requires to be attached to the DOM tree
    // immediately when mounted, for example to measure a
    // DOM node, or uses 'autoFocus' in a descendant, add
    // state to Modal and only render the children when Modal
    // is inserted in the DOM tree.
    modalRoot.appendChild(this.el);
  }

  componentWillUnmount() {
    modalRoot.removeChild(this.el);
  }

  render() {
    return ReactDOM.createPortal(
      this.props.children,
      this.el
    );
  }
}

class Parent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {clicks: 0};
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    // This will fire when the button in Child is clicked,
    // updating Parent's state, even though button
    // is not direct descendant in the DOM.
    this.setState(state => ({
      clicks: state.clicks + 1
    }));
  }

  render() {
    return (
      <div onClick={this.handleClick}>
        <p>Number of clicks: {this.state.clicks}</p>
        <p>
          Open up the browser DevTools
          to observe that the button
          is not a child of the div
          with the onClick handler.
        </p>
        <Modal>
          <Child />
        </Modal>
      </div>
    );
  }
}

function Child() {
  // The click event on this button will bubble up to parent,
  // because there is no 'onClick' attribute defined
  return (
    <div className="modal">
      <button>Click</button>
    </div>
  );
}

ReactDOM.render(<Parent />, appRoot);
```    

注意上面的例子里，modal-root 元素也会收到 click 事件，也就说在插入的 dom 树种也会正常冒泡。    

## Profiler API

`Profiler` 也是一个组件，可以加上组件树中的任意地方用来测量这部分节点的渲染性能。需要两个属性：
`id` 字符串类型，和 `onRender` 回调，函数类型。当节点子树中任意组件“提交”了一次更新时调用。    

```js
render(
  <App>
    <Profiler id="Navigation" onRender={callback}>
      <Navigation {...props} />
    </Profiler>
    <Main {...props} />
  </App>
)
```    

`Profiler` 可以嵌套。    

```js
function onRenderCallback(
  id,  // the 'id' prop of the Profiler tree that has just commited
  phase,  // either 'mount' (if the tree just mounted) or "update" (if it re-rendered)
  actualDuration, // time spent rendering the commited update
  baseDuration, // estimated time to render the entire subtree without memoization
  startTime, // when React began rendering this update
  commitTime, // when React committed this update
  interactions // the Set of interactions belonging to this update
) {
  // ....
}
```     

使用 `Profiler` 的时候，貌似如果包着类式的组件的话，类的 render 方法会调用两次，但是函数式的
不会。   

- `actualDuration`: number, 本次更新渲染 `Profiler` 及其后代花费的时间
- `baseDuration`: number, 每个组件最新一次渲染花费的时间
- `startTime`: number, 当 react 开始本次更新渲染的时候戳
- `commitTime`: number, react 提交本次更新的时间戳，startTime 比 commitTime 小，应该是
先渲染，然后才提交上去
- `interactions`: Set

## Reconciliation

Diff 算法。    

当两个树的根元素类型不同时，直接卸掉旧树然后从零构建新树。当卸载旧树时，旧的 dom 节点会删掉。
组件实例会收到 `componentWillUnmount()`。    

如果两个根元素是相同的 dom 节点类型。react 只更新修改了的属性。    

当相同类型的组件更新时，实例会保持不动，以便在渲染前后的 state 是可以维持的。react会更新组件实例的
props 以便匹配新的元素，然后调用 `componentWillReceiveProps()` 和 `componentWillUpdate()`。   

## Refs and the DOM

ref 可以理解为一个对象，然后可以通过 `ref` 属性绑定到 dom 节点或组件上，然后如果这个组件是用
`React.forwardRef` 生成的，那就不直接进行绑定，而是进行保存以便后续转发。    

转发这个操作是可选的操作。实际上完全可以用别的属性名进行 prop 传递然后绑定转发。    

`ref.current` 的值取决于绑定节点的类型：   

- 如果是 html 元素，那就是 dom 节点
- 如果是类式组件，就是挂载的组件实例
- 函数式组件不能绑定 ref，因为函数式组件没有实例对象。     

还要一种 ref 的形式是回调 ref。    

```js
class CustomTextInput extends React.Component {
  constructor(props) {
    super(props);

    this.textInput = null;

    this.setTextInputRef = element => {
      this.textInput = element;
    };

    this.focusTextInput = () => {
      // Focus the text input using the raw DOM API
      if (this.textInput) this.textInput.focus();
    };
  }

  componentDidMount() {
    // autofocus the input on mount
    this.focusTextInput();
  }

  render() {
    // Use the `ref` callback to store a reference to the text input DOM
    // element in an instance field (for example, this.textInput).
    return (
      <div>
        <input
          type="text"
          ref={this.setTextInputRef}
        />
        <input
          type="button"
          value="Focus the text input"
          onClick={this.focusTextInput}
        />
      </div>
    );
  }
}
```   