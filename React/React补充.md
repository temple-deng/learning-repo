#  React的补充
<!-- TOC -->

- [React的补充](#react的补充)
  - [1. tutorial 部分的补充](#1-tutorial-部分的补充)
  - [2. JSX](#2-jsx)
    - [2.1 JSX中声明属性](#21-jsx中声明属性)
  - [State and Lifecycle](#state-and-lifecycle)
  - [ref](#ref)
      - [什么时候使用 Refs](#什么时候使用-refs)
  - [生命周期](#生命周期)
  - [补充](#补充)
  - [Key](#key)
  - [Children in JSX](#children-in-jsx)
    - [字符串字面量](#字符串字面量)
    - [Functions as Children](#functions-as-children)
    - [Booleans, Null, and Undefined Are Ignored](#booleans-null-and-undefined-are-ignored)
  - [Reconciliation](#reconciliation)
    - [Motivation](#motivation)
    - [diffing 算法](#diffing-算法)
      - [Elements Of Different Types](#elements-of-different-types)
      - [DOM Elements Of The Same Type](#dom-elements-of-the-same-type)
      - [Component Elements Of The Same Type](#component-elements-of-the-same-type)
  - [React API](#react-api)
      - [React.PureComponent](#reactpurecomponent)
      - [createElement()](#createelement)
      - [cloneElement()](#cloneelement)
      - [createFactory()](#createfactory)
      - [isValidElement()](#isvalidelement)
    - [React.Children](#reactchildren)
      - [React.Children.map](#reactchildrenmap)
      - [React.Children.forEach](#reactchildrenforeach)
      - [React.Children.count(children)](#reactchildrencountchildren)
      - [React.Children.only(children)](#reactchildrenonlychildren)
      - [React.Children.toArray(children)](#reactchildrentoarraychildren)
  - [React.Component API](#reactcomponent-api)
      - [componentWillReceiveProps(nextProps)](#componentwillreceivepropsnextprops)
  - [ReactDOM API](#reactdom-api)
    - [render()](#render)
    - [unmountComponentAtNode()](#unmountcomponentatnode)
    - [findDOMNode()](#finddomnode)

<!-- /TOC -->


## 1. tutorial 部分的补充


render方法需要返回React的组件树。然而并不需要必须返回HTML标签，可以返回我们自己新建的React组件，
这就是React可组合的关键所在。   

this.props.children 的值有三种可能：如果当前组件没有子节点，它就是 undefined ;如果有一个
子节点，数据类型是 object ；如果有多个子节点，数据类型就是 array 。所以，处理 this.props.children 的时候要小心。  

React 提供一个工具方法 React.Children 来处理 this.props.children。我们可以用 React.Children.map 来遍历子节点，而不用担心 this.props.children 的数据类型是 undefined 还是 object。  

## 2. JSX

### 2.1 JSX中声明属性

```javascript
// 字符串用引号包起来
const element = <div tabIndex="0"></div>;

// 表达式用大括号包起来
const element = <img src={user.avatarUrl} />;
```  

## State and Lifecycle


State 于 props 相似，但是是私有的并且完全受组件的控制。  

state 是指在 class 定义组件模式中可用的功能。  

一个栗子：  

1. 当 `<Clock />` 传递给 `ReactDOM.render()`， React 调用 `Clock` 组件的构造函数。由于 `Clock` 需要展示当前时间，将 `this.state` 初始化为一个包含当前时间的对象。  
2. React 之后调用组件的 `render()` 方法。从这个方法 React 可以得知在屏幕上展示什么内容。之后 React 更新 DOM 来匹配 `Clock` 的渲染的输出结果。  
3. 当`Clock` 输出已经插入到 DOM 中， React 调用 `componentDidMount()` 生命周期钩子。在这个函数里面， `Clock` 组件要求浏览器生成一个计时器每秒调用 `tick()` 。  
4. 每秒浏览器会调用 `tick()` 方法。在这个方法里面， `Clock` 组件调用 `setState()` 方法来更新 UI，传入一个包含当前时间的对象。由于有 `setState()` 方法调用， React 知道 state 变化了，然后再一次调用 `render()` 方法。  
5. 如果 `Clock` 组件从 DOM 中移除了， React 调用 `componentWillUnmount()` 钩子清除定时器。   


使用 state 时需要注意的地方：   

+ 不要直接修改 state 对象，而是使用 setState 方法，因为直接修改不会触发UI的重新渲染。  

```javascript
this.state.comment = 'Hello';    // wrong

this.setState({ comment: 'Hello'});  // correct
```  

+ 出于性能的考虑，React 可能会将多次的 setState 操作放在一次UI更新中，`this.props` 和 `this.state`可能是异步更新的，所以不应该依赖于它们的值来计算下一 state. 如果需要这样做，则是应该传入一个函数而不是对象给 `setState()` 方法，函数接受两个参数，第一个是之前的 `state`，一个是更新操作时的 `props`  

```javascript
this.setState((prevState, props) => ({
  counter: prevState.counter + props.increment
}));
```

+ `state` 更新操作时合并(merge)操作，而不是赋值操作。


如果需要把一个组件隐藏，可以在`render`方法中返回 `null`. 这并不影响生命周期钩子。


## ref


####  什么时候使用 Refs

+ 处理 `focus`， `text selection`,  `media playback`
+ 触发必要的动画
+ 和其他第三方 DOM 库集成  

`ref`属性可以绑定在任意的组件上。这个属性接受一个回调函数作为属性值，当组件在 mounted 或 unmounted 后立即调用。  

当绑定在 HTML 元素上时，当挂载组件时这个回调函数接收底层的 DOM 元素作为其参数，当卸载组件
时使用 `null` 作为其参数。   

通常会在 `ref` 回调函数内将 DOM elements 赋值给 class 的一个属性，来访问原生的 DOM 节点。

当在使用类定义的组件上使用这个属性时，函数接受挂载了的组件实例作为参数。注意只能用来使用类
定义的组件上，使用函数定义的不行。注意这个意思是这个 `ref` 属性不能加载函数定义的组件上，
例如 `<MyFunctionalComponent ref={(input) => { this.textInput = input; }} />`，这里
`MyFunctionalComponent` 是一个使用函数定义的组件，这样的做法就是错的，但是是可以在函数定义
组件内部使用 `ref` 的：    

```javascript
function CustomTextInput(props) {
  // textInput must be declared here so the ref callback can refer to it
  let textInput = null;

  function handleClick() {
    textInput.focus();
  }

  return (
    <div>
      <input
        type="text"
        ref={(input) => { textInput = input; }} />
      <input
        type="button"
        value="Focus the text input"
        onClick={handleClick}
      />
    </div>
  );  
}
```    

## 生命周期


+ `constructor(props)`
+ `componentWillMount()`
+ `render()`
+ `componentDidMount()`
+ `componentWillReceiveProps(nextProps)`
+ `shouldComponentUpdate(nextProps, nextState)`
+ `componentWillUpdate(nextProps, nextState)`
+ `render()`
+ `componentDidUpdate(prevProps, prevState)`
+ `componentWillUnmount()`

注意不一定只有在 `props` 改变的时候才会调用 `componentWillReceiveProps()` 方法，有时可能由于父组件触发了自身组件的重新渲染也会调用这个方法。   

当使用 `forceUpdate()` 时不会调用 `shouldComponentUpdate()`。 `shouldComponentUpdate()` 返回 `false` 不会阻止子组件由于自身 state 改变时触发的重渲染。并且后续 `componentWillUpdate()` `render()` `componentDidUpdate()` 都不会再调用。  

`componentWillUpdate()` 中不可以调用 `this.setState()`。  


**ReactDOM.render(element, container, [callback])**  

在 DOM 中的 `container` 内渲染一个 React element。返回这个组件的引用（或者对于无状态的组件返回 `null`）。  

如果 React element 之前已经在 `container` 渲染了， 就会执行更新操作。如果提供可选的回调函数，会在组件渲染或者更新后执行。

## 补充

组件可以看成是接受 props 和 state做参数，产出 React Elements 的工厂函数。  

如何判断数据是否是state:  

+ 是否通过 props 由父级传递下来的，如果是，不是state。
+ 是否不随时间变化而变化，如果是，不是state。
+ 是否可以基于组件其他的 props 或 state计算出来，如果是，不是state。  

false, null, undefined, true 都是合法的子节点（props.children），但是都通通不渲染。  

```javascrip
Greeting.propTypes = {
  'propName': PropTypes.string
};

Greeting.defaultProps = {
  'propName': value
}
```  

defaultProps 会在类型检查前应用。       

## Key

我们可以在 JSX 中用 `{}` 将集合引入其中。  


当我们创建elements列表时，'key' 是一个字符串属性。这个属性可以让 React 来识别出哪些元素是修改过的，哪些是新增的，哪些被移除了。这个属性只有在数组上下文中才有意义。     

"key" 是一个字符串字面量，当创建列表元素时需要将其包含进去。    

Keys 只在被包裹的数组中才有意义。例如，我们新建了一个 `ListItem` 组件，那么 key 应该
绑定在数组中的 `<ListItem />` 元素上而不是其中的 `<li>` 元素上。其实就是说必须绑定在数组元素
那一层吧。    

## Children in JSX  

### 字符串字面量

将字符串直接放置在组件的开闭标签之间，则 `props.children` 就是这个字符串了。    

`<MyComponent>Hello world!</MyComponent>`    

JSX 会将一行开头和结尾的空白移除。同样还会移除空白行。与标签相邻的空行会移除。字符串中间的新行认为是一个空格。     

题外话：一个组件不能返回多个 React 元素，这就是为什么组件只能有一个根节点的原因吧。    

### Functions as Children  

`props.children` 和其他 `prop` 一样可以是任何类型的数据，所以也可以是函数：   

```javascript
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

### Booleans, Null, and Undefined Are Ignored

`false`, `null`, `undefined`, `true` 都是有效的子节点，但是都不会渲染，所以下面的表达式
最终渲染的结果是一样的：    

```javascript
<div />

<div></div>

<div>{false}</div>

<div>{null}</div>

<div>{undefined}</div>

<div>{true}</div>
```    

## Reconciliation

### Motivation

在使用 React 时，在单个的时间点上，我们可以认为 `render()` 函数创建了一个 React 元素树。
在下一次 state or props 更新时，`render()` 函数会返回一个不同的元素树。React 需要找出
怎样将 UI 更新为最近的树是最有效的。     

对于生成最小数量的操作以将一棵树变换为另一棵树的算法问题，有一些通用的解决方案。但是复杂度太高。    

所以在 React 中，React 基于两种假设实现了复杂度为 O(n) 的算法：   
  1. 两个不同类型的元素会生成不同的树
  2. 开发者可以通过 `key` prop 来提示在不同的渲染之间哪些子元素是稳定的   

### diffing 算法

当比较两颗树时，首先会比较两个根元素。不同的根元素类型会有不同的行为。  

#### Elements Of Different Types

当两个根元素类型不同时，会直接销毁旧树，从头开始构建新树。

当销毁组件树时，之前的DOM节点被销毁。组件实例接收 `componentWillUnmount()`. 当构建完成新的组件树后，新的DOM节点插入到DOM中。组件实例接收到`componentWillMount()`，然后`componentDidMount()`。之前组件树中的state丢失。

#### DOM Elements Of The Same Type

当比较相同类型的 React DOM Elements 时，React会保持底层的DOM节点不变，比较两者的属性，然后更新变化了的属性。  

#### Component Elements Of The Same Type

当比较相同类型的组件元素时，组件实例保持不变，所以两次渲染之间的 state 是会被维持住的，React会更新底层组件实例的`props`以匹配新的element, 然后在底层实例上调用`componentWillReceiveProps()`和`componentWillUpdate()`，之后`render()`方法。  

## React API

#### React.PureComponent

`React.PureComponent` 与 `React.Component` 类似，但是 `shouldComponentUpdate()`
实现对 prop 和 state 只进行浅比较。    

#### createElement()

```javascript
React.createElement(
  type,
  [props],
  [...children]
)
```    

`React.DOM.` 对 DOM 组件提供了更方便的包装，例如 `React.DOM.a(...)` 是对于 `React.createElement('a',...)` 的简单包装。      

#### cloneElement()

```javascript
React.cloneElement(
  element,
  [props],
  [...children]
)
```   

返回的元素的属性是原生元素 props 和新的 props 浅合并的结果。新的子节点会替换已存在的子节点。    

这个函数等价于： `<element.type {...element.props} {...props}>{children}</element.type>`

#### createFactory()   

`React.createFactory(type)`     

返回一个生产给定类型 React elements 的函数，与 `createElement()` 类似，`type` 可以是
标签名，也可以组件名。     

#### isValidElement()

`React.isValidElement(object)`    

### React.Children

#### React.Children.map

`React.Children.map(children, function[(thisArg)])`   

如果子节点为 `null` or `undefined`,也返回 `null` or `undefined`，而不是数组。    

#### React.Children.forEach

略

#### React.Children.count(children)

返回子节点中组件的数量，等于调用 `map` or `forEach` 函数的次数。   

#### React.Children.only(children)

返回唯一的子节点。否则的话抛出错误。   

#### React.Children.toArray(children)

略

## React.Component API

#### componentWillReceiveProps(nextProps)

在挂载的组件接收到新的 props 前调用。但是需要注意的是不是说只有 props 变化了才调用
这个函数，比如说当父级组件重新渲染的时候，可能 props 没变化但是也调用了这个方法。    

一般来说，调用 `this.setState()` 不会触发 `componentWillReceiveProps`。    

## ReactDOM API

`import ReactDOM from 'react-dom'`   

### render()

```javascript
ReactDOM.render(
  element,
  container,
  [callback]
)
```   

将一个 React element 渲染到 `container` 里，返回组件的引用（如果是 statelss 的组件
就返回 `null`，注意 statelss 组件没有实例）。    

如果这个元素之前就已经渲染到 `container`里，那么就执行更新操作。    

回调会在组件渲染或更新后执行。    

### unmountComponentAtNode()

`ReactDOM.unmountComponentAtNode(container)`    

从 DOM 中移除挂载的组件。如果组件成功移除返回 `true`，如果没有组件要移除返回 `false`。

### findDOMNode()

`ReactDOM.findDOMNode(component)`    

如果组件已经挂载到 DOM 中，这个方法会返回对应的浏览器 DOM 元素。    
