React elememts 是不可变的，一旦创建了一个 element，就不能再改变它的孩子及属性了。    

当组件第一次在DOM中被渲染后，就叫做挂载。     

由于 `this.props` 和 `this.state` 可能是异步更新的，不应该在计算下一状态值时依赖这些值。      

```js
// Correct
this.setState((prevState, props) => ({
  counter: prevState.counter + props.increment
}));
```      

在 HTML 中，表达元素都是自己维持着状态并基于用户输入更新。不过在 React 中，通常
是可变的 state 来负责这份工作，并只使用 `setState()` 来更新组件。这样子看，
受控组件主要是为了防止表单元素自己维持状态更新的话造成的组件 UI 与数据不一致的情况。     

当一个列表元素有 key 的时候，React 就会依据 key 值来与之前列表树进行匹配。    

属性代理与反转继承。     

https://zhuanlan.zhihu.com/p/24776678