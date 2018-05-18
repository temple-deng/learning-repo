## 条件渲染

```js
const condition = true;

const App = () => (
  <div>
    <h1>This is always visible</h1>
    {
      condition && (
        <div>
          <h2>Show me</h2>
          <p>Description</p>
        </div>
      )
    }
  </div>
);
```    

看这个意思是尽量把条件判断就放到 `return` 中，这样具体渲染的内容就可以直观的看到，如果放在外面，
还要去别的地方查看到底什么情况下渲染什么内容。     

## Passing Props Down

有的时候我们必须把一些 props 传递给一个组件，可能这个组件自身并不需要这些 props，但是它们的
子孙结点需要。     

一个聪明的方法是在 JSX 中使用扩展运算符结构 `props`：    

```js
const Details = ( { name, language } ) => (
  <div>
    <p>{ name } works with { language }</p>
  </div>
);

const Layout = ( { title, ...props } ) => (
  <div>
    <h1>{ title }</h1>
    <Details { ...props } />
  </div>
);

const App = () => (
  <Layout 
    title="I'm here to stay"
    language="JavaScript"
    name="Alex"
  />
);
```      

## 理解生命周期钩子

在构造函数中 DO：

+ 设置初始 state
+ 绑定回调的 this 指向    

DON'T:    

+ 产生副作用（例如AJAX 调用）       

`componentWillMount` 其实与构造函数没多大的区别，看起来貌似是因为之前出过某些
BUG，为了解决这些问题而提供了这个方法。很多人尝试在这个方法中去发起请求获取数据，以便数据能在
第一次渲染前可用，然而事实上这是不可能的，请求无论如何也不能在渲染调用前结束。       

由于最新的 Fiber 架构，这个方法可能正在首次渲染前调用多次从而引发多重副作用，因此这个方法不再
建议出现任何可能造成副作用的操作。      

而且在这个方法中对 `setState()` 的调用不会造成重新渲染。      

在这个方法中 DO：

+ 通过 `this.setState()` 更新 state
+ 执行一些最后的优化
+ 只在服务端渲染时使用一些副作用

DON'T:    

+ 在客户端使用会引起副作用的操作      

`componentWillReceiveProps(nextProps)` 这个方法会在上次组件重新渲染引起的 props 改变
时被调用。     

如果我们组件的一部分 state 依赖与上层传入的 props，那么这个方法就是调用 `this.setState` 更新组件的理想的地方，这个方法中对 `setState()` 的调用不会造成额外的 render 调用。    

与`componentWillMount` 一样的原因，这个方法在新架构中不应该有产生副作用的操作。     

默认情况下，所有基于类的组件都会在 props 变化，自身的 state 或 context 变化时重新渲染。

在 `shouldComponentUpdate()` 中 DO：    

+ 为一些性能比较差的组件优化性能

DONT:    

+ 有任何副作用的操作
+ 调用 `this.setState()`      

`componetWillUpdate()` 与其他 `componentWill*` 函数一样，不建议有副作用。     

