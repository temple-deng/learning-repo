# Sec 7

<!-- TOC -->

- [Sec 7](#sec-7)
- [Hooks](#hooks)
  - [Introducing Hooks](#introducing-hooks)
  - [Hooks at a Glance](#hooks-at-a-glance)
    - [State Hook](#state-hook)
    - [Effect Hook](#effect-hook)
    - [Rules of Hooks](#rules-of-hooks)
    - [Building Your Own Hooks](#building-your-own-hooks)
    - [Other Hooks](#other-hooks)
  - [Using the Effect Hook](#using-the-effect-hook)
    - [如何跳过 effects](#如何跳过-effects)
  - [Rules of Hooks](#rules-of-hooks-1)
  - [Building Your Own Hooks](#building-your-own-hooks-1)
  - [Hooks API Reference](#hooks-api-reference)
    - [useState](#usestate)
    - [useEffect](#useeffect)
    - [useContext](#usecontext)
    - [useReducer](#usereducer)
    - [useCallback](#usecallback)
    - [useMemo](#usememo)
    - [useRef](#useref)
    - [useImperativeHandle](#useimperativehandle)
    - [useLayoutEffect](#uselayouteffect)

<!-- /TOC -->

# Hooks

## Introducing Hooks

```js
import React, { useState } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  )
}
```    

## Hooks at a Glance

### State Hook

还是上节的例子，`useState` 返回一对值：当前的 state 值以及一个用来更新 state 值的函数。
这个函数类似于 `this.setState`，除了它不会将新旧的 state 进行 merge 操作。   

`useState` 唯一的参数是初始的 state 值。    

可以在一个组件中使用多个 hook：     

```js
function ExampleWithManyStates() {
  const [age, setAge] = useState(42);
  const [fruit, setFruit] = useState('banana');
  const [todos, setTodos] = useState([{ text: 'Learn Hooks' }]);
}
```    

Hooks 是将 react state 和生命周期功能 hook 进函数组件的函数。    

### Effect Hook

我们可能会在之前的组件中执行数据获取、订阅、手动修改 DOM 等副作用。    

`useEffect` 扮演了类似 `componentDidMount`, `componentDidUpdate`, `componentWillUnmount`
的角色。    

```js
import React, { useState, useEffect } from 'react';

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

当我们调用 `useEffect` 的时候，我们是在告诉 react，在刷新了 dom 变动后（那也就是 commit 后
吧）执行我们的 effect 函数。默认情况下，react 会在每次渲染后执行 effect 函数，包括首次渲染。   

effect 还可以通过返回一个函数描述如何执行清理工作。    

```js
import React, { useState, useEffect } from 'react';

function FrientStatus(props) {
  const [isOnline, setIsOnline] = useState(null);

  function handleStatusChange(status) {
    setIsOnline(status.isOnline);
  }

  useEffect(() => {
    ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
    }
  });

  if (isOnline === null) {
    return 'Loading...';
  }

  return isOnline ? 'Online' : 'Offline';
}
```     

这里需要注意的是除了首次渲染完，之后的每次更新其实都会先执行返回的清理函数，然后在执行 useEffect
绑定的函数。    

### Rules of Hooks

- 仅在顶层代码中调用 hooks，不要在循环、条件和内嵌函数中调用
- 仅在函数式组件中调用 hooks    

### Building Your Own Hooks

```js
import React, { useState, useEffect } from 'react';

function useFriendStatus(friendId) {
  const [isOnline, setIsOnline] = useState(null);

  function handleStatusChange(status) {
    setIsOnline(status.inOnline);
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

```js
function FriendStatus(props) {
  const isOnline = useFriendStatus(props.friend.id);

  if (isOnline === null) {
    return 'Loading...';
  }
  return isOnline ? 'Online' : 'Offline';
}
```    

```js
function FrientListItem(props) {
  const isOnline = useFriendStatus(props.friend.id);

  return (
    <li style={{ color: isOnline ? 'green' : 'black'}}>
      {props.friend.name}
    </li>
  );
}
```     

hooks 是一种重用 state 逻辑的方案，并不是重用 state。    

如果一个函数名以 `use` 开头，并且函数中调用了其他的 hooks，我们就可以认为这是一个自定义 hook。   

话说这种 hook 还真是挺奇怪，与其说是 hook 不如说更像是个组件。    

### Other Hooks


```js
function Example() {
  const locale = useContext(LocaleContext);
  const theme = useContext(ThemeContext);
}
```     

```js
function Todos() {
  const [todos, dispatch] = useReducer(todosReducer);
}
```    

## Using the Effect Hook

### 如何跳过 effects

我们可以传一个数组作为 `useEffect` 的第二个参数，如果两次渲染的数组中的变量值都是一样的，就
跳过本次 effect。    

```js
useEffect(() => {
  document.title = `You clicked ${count} times`;
}, [count]);
```     

这种功能在 cleanup 阶段同样生效。    

如果我们希望 effect 和 cleanup 只调用一次，即在挂载时调用和卸载时cleanup。可以传一个空数组。   

## Rules of Hooks

使用 hooks 需要遵守的两条规则：    

- 必须在函数顶层中调用
- 必须在 react 函数中调用，即函数式组件或者自定义 hooks 函数中     

## Building Your Own Hooks

严格来说自定义 Hooks 和组件还是有区别的，组件接受 props 参数，而 hooks 作为普通的函数，参数
的形式是比较宽泛的，其次组件函数要返回渲染的组件，而 hooks 不一定有返回值。    

## Hooks API Reference

### useState

```js
const [state, setState] = useState(initialState);
```    

如果新的 state 是使用之前的 state 计算的，可以传递一个函数给 `setState`，这个函数接收之前的
值作为参数，用返回值作为更新后的值：    

```js
function Counter({initialCount}) {
  const [count, setCount] = useState(initialCount);
  return (
    <>
      Count:{count}
      <button onClick={() => setCount(initialCount)}>Reset</button>
      <button onClick={() => setCount(prevCount => prevCount - 1)}>-</button>
      <button onClick={() => setCount(prevCount => prevCount + 1)}>+</button>
    </>
  )
}
```     

如果更新函数返回的值和当前的值完全一样，则后续的渲染会被完整跳过。    

### useEffect

```js
useEffect(didUpdate);
```    

默认情况下，effects 会在每次 render 后执行，不过可以选择仅在部分值有变化的时候更新。    

不同于 `componentDidMount` 和 `componentDidUpdate`，effect 函数在 layout 和 paint 后
执行。然后，不是所有的 effect 都适合在这个时间点进行执行，一些 effect 可能希望在下一次 paint
前就对 DOM 做出变动，对于这种 effect，React 提供了另外一种 hook `useLayoutEffect`，这个
函数的签名与 `useEffect` 相同，仅在执行时间上游区别。    

虽然 effect 会延迟到浏览器重绘后执行，但是 react 可以保证它会在下一次 render 前执行。   

注意点：如果我们使用了第二个参数作为优化措施，请确保数组中包含了所有effect用到的可能会随着时间
变动的组件变量。否则，effect 代码会引用上一次 render 使用的 state 值。    

如果我们传递了一个空数组作为第二个参数，则 effect 中的 props 和 state 会一直引用其初始值。    

### useContext

```js
const value = useContext(MyContext);
```     

接收一个 context 对象，并返回当前的 context 值。     

当最近的 `<MyContext.Provider>` 更新后，hook 会用最新的 context 值触发一次更新。   

`useContext` 基本上等价于 `static contextType = MyContext` 和 `<MyContext.Consumer>`。    

### useReducer

```js
const [state, dispatch] = useReducer(reducer, initialArg, init);
```     

`useState` 的一种替代形式。    

```js
const initialState = {count: 0};

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return {count: state.count + 1};
    case 'decrement':
      return {count: state.count - 1};
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({type: 'decrement'})}>-</button>
      <button onClick={() => dispatch({type: 'increment'})}>+</button>
    </>
  );
}
```     

第三个参数是用来 lazily 创建初始 state 的，一般如果我们初始 state 是经过大量计算得出来的，
那么可以用函数来把逻辑提出来，初始的 state 会用 `init(initialArg)` 进行计算。    

```js
function init(initialCount) {
  return {count: initialCount};
}

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return {count: state.count + 1};
    case 'decrement':
      return {count: state.count - 1};
    case 'reset':
      return init(action.payload);
    default:
      throw new Error();
  }
}

function Counter({initialCount}) {
  const [state, dispatch] = useReducer(reducer, initialCount, init);
  return (
    <>
      Count: {state.count}
      <button
        onClick={() => dispatch({type: 'reset', payload: initialCount})}>
        Reset
      </button>
      <button onClick={() => dispatch({type: 'decrement'})}>-</button>
      <button onClick={() => dispatch({type: 'increment'})}>+</button>
    </>
  );
}
```     

### useCallback

```js
const memoizedCallback = useCallback(
  () => {
    doSomething(a, b);
  },
  [a, b],
);
```     

### useMemo

```js
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```     

`useMemo` 仅在依赖变化的视乎才会重新计算 memoized value。避免每次渲染进行昂贵的计算。    

传给 `useMemo` 的函数是在 render 阶段执行的，所以不要在这里进行带有副作用的操作。   

如果传的数组为空，则每次渲染都会重新计算值。    

### useRef

```js
const refContainer = useRef(initialValue);
```     

返回一个可修改的 ref 对象，其 current 属性被初始化为参数 `initialValue`。    

```js
function TextInputWithFocusButton() {
  const inputEl = useRef(null);
  const onButtonClick = () => {
    inputEl.current.focus();
  }
  return (
    <>
      <input ref={inputEl} type="text" />
      <button onClick={onButtonClick}>Focus the input</button>
    </>
  );
}
```      

### useImperativeHandle

```js
useImperativeHandle(ref, createHandle, [deps]);
```     

```js
function FancyInput(props, ref) {
  const inputRef = useRef();
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current.focus();
    }
  }));
  return <input ref={inputRef} ... />
}
FancyInput = forwardRef(FancyInput);
```     

### useLayoutEffect

这个函数签名等同于 `useEffect`，但是是在 DOM 变动后同步执行的，在这一步可以读取到 DOM 布局，
然后同步重新渲染。     


