# Redux
---

## 1.Redux的三个基本原则
1. 单一数据源：整个应用的state被存储在一棵 object tree 中，并且这个 object tree只存在于唯一一个store中。  
2. State是只读的：唯一改变 state 的方法就是触发action，action是一个用于描述已发生事件的普通对象。这样确保了视图和网络请求都不能直接修改state，相反它们只能表达想要修改的意图。  
3. 使用纯函数来执行修改：为了描述 action 如何改变 state tree， 需要编写 reducers. Reducer只是一些纯函数，它接收先前的state和action, 并返回新的state。  

## 2. Action
Action是把数据从应用传到store的有效载荷，它是store数据的唯一来源。  

## 3.Reducer
永远不要在reducer里做以下操作：  
+ 修改传入参数  
+ 执行有副作用的操作，如API请求和路由跳转  
+ 调用非纯函数，如Date.now() 或 Math.random()

只要传入参数一样，返回必须一样。  

## 4.Store
Store的职责：
+ 维持应用的state
+ 提供 getState() 方法获取state;
+ 提供 dispatch(action) 方法更新state;
+ 通过 subscribe(listener) 注册监听器；

## 5. react-redux
### 顶层组件Provider
Provider源码
```javascript
import { Component, PropTypes, Children } from 'react'
import storeShape from '../utils/storeShape'
import warning from '../utils/warning'

let didWarnAboutReceivingStore = false
function warnAboutReceivingStore() {
  if (didWarnAboutReceivingStore) {
    return
  }
  didWarnAboutReceivingStore = true

  warning(
    '<Provider> does not support changing `store` on the fly. ' +
    'It is most likely that you see this error because you updated to ' +
    'Redux 2.x and React Redux 2.x which no longer hot reload reducers ' +
    'automatically. See https://github.com/reactjs/react-redux/releases/' +
    'tag/v2.0.0 for the migration instructions.'
  )
}

// 上面的内容不清楚有什么用
// 下面是组件的定义

export default class Provider extends Component {
// 这个方法式关键， 这是react0.14之后版本提供的方式， 如果子组件定义了contextTypes属性，便可以使用这个方法返回值里的数据，而不用层层嵌套

// 存储保存全局state的store
  getChildContext() {
    return { store: this.store }
  }

  constructor(props, context) {
    super(props, context)
    this.store = props.store
  }

//	React.Children.only方法返回组件唯一的子组件，否则会抛出错误
  render() {
    const { children } = this.props
    return Children.only(children)
  }
}

if (process.env.NODE_ENV !== 'production') {
  Provider.prototype.componentWillReceiveProps = function (nextProps) {
    const { store } = this
    const { store: nextStore } = nextProps

    if (store !== nextStore) {
      warnAboutReceivingStore()
    }
  }
}

Provider.propTypes = {
  store: storeShape.isRequired,
  children: PropTypes.element.isRequired
}
Provider.childContextTypes = {
  store: storeShape.isRequired
}

```
Provider主要定义了getChildContext，使用这个方法子组件可以直接得到store中的state，而不用层层嵌套。


##  6. thunkmiddleware
```javascript
export default function thunkMiddleware({ dispatch, getState }) {
  return next => action => {
    if (typeof action === 'function') {
      return action(dispatch, getState);
    }

    return next(action);
  };
}
```
可以看出这个中间件会判断action是否是函数，如果是函数就调用这个函数，否则继续将dispatch的返回值传递下去。


