# Redux

## 1. 核心理念

+ 单一数据源： 整个应用的 state 被储存在一棵 object tree 中，并且这个 object tree 只存在于唯一一个 store 中。

+ state 是只读的： 惟一改变 state 的方法就是触发 action，action 是一个用于描述已发生事件的普通对象。

+ 使用纯函数来执行修改： 为了描述 action 如何改变 state tree ，你需要编写 reducers。  

## 2. reducer

### reducer 是纯函数

永远不要在 reducer 里做这些操作：

+ 修改传入参数
+ 执行有副作用的操作，如 API 请求和路由跳转；
+ 调用非纯函数，如 `Date.now()` 或 `Math.random()`。    

开发复杂的应用时，不可避免会有一些数据相互引用。建议你尽可能地把 state 范式化，不存在嵌套。把所有数据放到一个对象里，每个数据以 ID 为主键，不同实体或列表间通过 ID 相互引用数据。把应用的 state 想像成数据库。   

### combineReducers

Redux 提供了一个 `combineReducers`方法，用于 Reducer 的拆分。你只要定义各个子 Reducer 函数，然后用这个方法，将它们合成一个大的 Reducer。  

```javascript
import { combineReducers } from 'redux';

const chatReducer = combineReducers({
  chatLog,
  statusMessage,
  userName
})

export default todoApp;
```  

上面的代码通过`combineReducers`方法将三个子 Reducer 合并成一个大的函数。  

这种写法有一个前提，就是 State 的属性名必须与子 Reducer 同名。如果不同名，就要采用下面的写法。  

```javascript
const reducer = combineReducers({
  a: doSomethingWithA,
  b: processB,
  c: c
})

// 等同于
function reducer(state = {}, action) {
  return {
    a: doSomethingWithA(state.a, action),
    b: processB(state.b, action),
    c: c(state.c, action)
  }
}
```    


## 3. store

Store 是吧 action, state, reducers联系到一起的对象。Store 有以下职责：  

+ 维持应用的 state；
+ 提供 `getState()` 方法获取 state；
+ 提供 `dispatch(action)` 方法更新 state；
+ 通过 `subscribe(listener)` 注册监听器;
+ 通过 `subscribe(listener)` 返回的函数注销监听器。  

`createStore()` 的第二个参数是可选的, 用于设置 state 初始状态。  

## 4. 数据流

Redux 应用中数据的生命周期遵循下面 4 个步骤：

1. 调用 `store.dispatch(action)`。  
2. Redux store 调用传入的 reducer 函数。  
3. 根 reducer 应该把多个子 reducer 输出合并成一个单一的 state 树。
4. Redux store 保存了根 reducer 返回的完整 state 树。所有订阅 `store.subscribe(listener)`的监听器都将被调用；监听器里可以调用 `store.getState()` 获得当前 state。  

## 5. Presentational component and Container component

展示性(presentational) 组件：

+ 关注于事物的样子。只负责 UI 的呈现，不带有任何业务逻辑。
+ 既可以包含展示性组件也可以包含容器组件，通常自身有一些 DOM 标记和样式。
+ 通常可以通过 ` this.props.children.` 控制。
+ 对应用的其他部分没有依赖，例如 Flux actions 或者 stores。
+ 不会规定数据时如何加载或者修改的。
+ 仅通过 props 接收数据和回调。
+ 自身几乎没有 state(即便有，一般也是 UI 数据)
+ 除非其有 state，生命周期钩子，性能优化操作，否则一般是用函数式组件定义。
+ 例如 *Page, SideBar, Story, UserInfo, List*。

容器(container)组件：

+ 关注于事物如何工作。
+ 既可以包含展示性组件也可以包含容器组件，但通常自身没有 DOM 标记，除非需要用 divs
包裹，永远也不会有任何样式。
+ 为展示性组件或其他容器组件提供数据和行为。
+ 可以调用 Flux actions， 并且会将这些作为展示性组件的回调。
+ 通常是有 state。
+ 通常是使用高阶组件生成的。
+ 例如 *UserPage, FollowerSidebar, StoryContainer, FollowedUserList*。

技术上讲，容器组件就是使用 `store.subscribe()` 从 Redux `state` 树中读取部分数据，并通过 props 来把这些数据提供给要渲染的组件。
我觉得吧，这个可能是在容器组件的 `componentDidMount` 中可能注册调用 `store.subscribe()` 方法，然后
在具体的监听函数中呢通过 `getState()` 获取到当前数据，之后将当前的 state 传递给 mapStateToProps 做参数得出最终需要注入的 props。目前还不确定setState 方法是在哪个阶段调用的   


## 6. Middleware

Redux 中间件在 dispatching an action 到 reach reducer 之间的时间点上提供了第三方的
扩展，中间件会包装 `dispatch()` 方法。  

Action 发出以后，Reducer 立即算出 State，这叫做同步；Action 发出以后，过一段时间再执行 Reducer，这就是异步。  

同步操作只要发出一种 Action 即可，异步操作的差别是它要发出三种 Action。  

+ 操作发起时的 Action
+ 操作成功时的 Action
+ 操作失败时的 Action   

说白了，middleware 会包装 `dispatch()` 方法，为其添加功能，这样就可以在真正的 `dispatch()`
触发前后做一些其他的事件，例如下面自定义的 thunk 中间件：   

```javascript
function thunk(store) {
  let next = store.dispatch;

  return function(action) {
    if(typeof action === 'function') {
      return action(store)
    }

    return next(action);
  }
}

store.dispatch = thunk(store);
```   

当使用这个 thunk 替换掉原生的 `dispatch` 方法后， 我们就可以 dispatch 一些函数类型的 action。而这些函数的 action 是否会调用最终的 `dispatch` 方法不得而知。    

其次，可以定义一个这样的函数：   

```javascript
function applyMiddlewareByMonkeypatching(store, middlewares) {
  middlewares = middlewares.slice()
  middlewares.reverse()

  // 在每一个 middleware 中变换 dispatch 方法。
  middlewares.forEach(middleware =>
    store.dispatch = middleware(store)
  )
}
```   

使用这个函数就可以用多个中间件包装 `dispatch` 方法，而且每一个 middleware 都可以操作（或者直接调用）前一个 middleware 包装过的 `store.dispatch`。   

但是，还有另一种方式来实现这种链式调用的效果。可以让 middleware 以方法参数的形式接收一个 `next()` 方法，而不是通过 `store` 的实例去获取。   

```javascript
function logger(store) {
  return function wrapDispatchToAddLogging(next) {
    return function dispatchAndLog(action) {
      console.log('dispatching', action)
      let result = next(action)
      console.log('next state', store.getState())
      return result
    }
  }
}
```    

使用箭头函数的话可以更简洁一点：   

```javascript
const logger = store => next => action => {
  console.log('dispatching', action)
  let result = next(action)
  console.log('next state', store.getState())
  return result
}

const crashReporter = store => next => action => {
  try {
    return next(action)
  } catch (err) {
    console.error('Caught an exception!', err)
    Raven.captureException(err, {
      extra: {
        action,
        state: store.getState()
      }
    })
    throw err
  }
}
```   

我觉得之所以又包了一层，是希望用闭包保存 store 对象，从而能在中间件中使用 store 上的其他 API。    

我们可以写一个 `applyMiddleware()` 方法替换掉原来的 `applyMiddlewareByMonkeypatching()`。在新的 `applyMiddleware()` 中，我们取得最终完整的被包装过的 `dispatch()` 函数，并返回一个 `store` 的副本：   

```javascript
// 警告：这只是一种“单纯”的实现方式！
// 这 *并不是* Redux 的 API.

function applyMiddleware(store, middlewares) {
  middlewares = middlewares.slice()
  middlewares.reverse()

  let dispatch = store.dispatch
  middlewares.forEach(middleware =>
    dispatch = middleware(store)(dispatch)
  )

  return Object.assign({}, store, { dispatch })
}
```   






## 7. API

#### createStore(reducer, [preloadedState], [enhancer])

参数  

1. `reducer` *(Function)*
2. `[ preloadedState ]` *(any)*
3. `[ enhancer ]` *(Function)*

返回值: **`Store`**

当 store 创建时， Redux 会自动触发一次 action。


#### Store

方法：

<dl>
  <dt>getState()</dt>
  <dd style="text-indent: 2em">返回当前的 state 树</dd>
  <dt>dispatch(action)</dt>
  <dd style="text-indent: 2em">返回传入的 action 对象</dd>
  <dt>subscribe(listener)</dt>
  <dd style="text-indent: 2em">每次 dispatch 时会保存当前监听器的快照，所以如果
  在监听器中添加新的监听器或者注销监听器不会对当次的 dispatch 产生影响。 </dd>
  <dd style="text-indent: 2em">返回一个函数，可以用来注销 listener 。</dd>
  <dt>replaceReducer(nextReducer)</dt>
</dl>

#### applyMiddleware(...middlewares)

`...middlewares`：每个 middleware 接受 Store 的 dispatch 和 getState 函数作为命名参数，并返回一个函数。   


#### bindActionCreators(actionCreators, dispatch)  

把 action creators 转成拥有同名 keys 的对象，但使用 dispatch 把每个 action creator 包围起来，这样可以直接调用它们。  

参数：  

1. `actionCreators` *(Function or Object)*: 一个 action creator，或者键值是 action creator的对象。

2. `dispatch`

返回值：  

*Function or Object* 如果传入的第一个参数是一个函数，就返回一个函数，如果是对象，则对象
键值 action creator 都被 dispatch 包裹了。  


## 8. react-redux

#### connect()

React-Redux 提供 `connect` 方法，用于从 UI 组件生成容器组件。connect的意思，就是将这两种组件连起来。  

```javascript
import { connect } from 'react-redux'
const VisibleTodoList = connect()(TodoList);
```  

上面代码中，TodoList是 UI 组件，VisibleTodoList就是由 React-Redux 通过connect方法自动生成的容器组件。  

但是，因为没有定义业务逻辑，上面这个容器组件毫无意义，只是 UI 组件的一个单纯的包装层。为了定义业务逻辑，需要给出下面两方面的信息。  

1. 输入逻辑：外部的数据（即state对象）如何转换为 UI 组件的参数
2. 输出逻辑：用户发出的动作如何变为 Action 对象，从 UI 组件传出去。

connect方法接受两个参数：mapStateToProps和mapDispatchToProps。它们定义了 UI 组件的业务逻辑。前者负责输入逻辑，即将state映射到 UI 组件的参数（props），后者负责输出逻辑，即将用户对 UI 组件的操作映射成 Action。

#### mapStateToProps

mapStateToProps会订阅 Store，每当state更新的时候，就会自动执行，重新计算 UI 组件的参数，从而触发 UI 组件的重新渲染。返回值必须是一个普通的对象。这个对象会合并到组件的 props 中去。

mapStateToProps的第一个参数总是state对象，还可以使用第二个参数，代表容器组件的props对象。  

使用ownProps作为参数后，如果容器组件的参数发生变化，也会引发 UI 组件重新渲染。  

connect方法可以省略mapStateToProps参数，那样的话，UI 组件就不会订阅Store，就是说 Store 的更新不会引起 UI 组件的更新。


#### mapDispatchToProps()

mapDispatchToProps是connect函数的第二个参数，用来建立 UI 组件的参数到store.dispatch方法的映射。也就是说，它定义了哪些用户的操作应该当作 Action，传给 Store。它可以是一个函数，也可以是一个对象。  

如果mapDispatchToProps是一个函数，会得到dispatch和ownProps（容器组件的props对象）两个参数。  

```javascript
const mapDispatchToProps = (
  dispatch,
  ownProps
) => {
  return {
    onClick: () => {
      dispatch({
        type: 'SET_VISIBILITY_FILTER',
        filter: ownProps.filter
      });
    }
  };
}
```  

从上面代码可以看到，mapDispatchToProps作为函数，应该返回一个对象，该对象的每个键值对都是一个映射，定义了 UI 组件的参数怎样发出 Action。  

如果mapDispatchToProps是一个对象，它的每个键名也是对应 UI 组件的同名参数，键值应该是一个函数，会被当作 Action creator ，返回的 Action 会由 Redux 自动发出。举例来说，上面的mapDispatchToProps写成对象就是下面这样。  

```javascript

const mapDispatchToProps = {
  onClick: (filter) => {
    type: 'SET_VISIBILITY_FILTER',
    filter: filter
  };
}
```


#### mergeProps(stateProps, dispatchProps, ownProps): props *Function*

如果定义了这个参数，会将 `mapStateToProps()`, `mapDispatchToProps()` 的结果以及自身 `props`
当参数传入。最终会返回一个普通的对象，这个对象会传递给被包裹的组件的 props。如果省略这个参数
`Object.assign({}, ownProps, stateProps, dispatchProps)` 会默认使用。  
