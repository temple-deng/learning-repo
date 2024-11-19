****# Redux源码分析
***

### 1. createStore
#### 参数：  
+ reducer  函数类型  
+ initialState 可选的初始状态
+ enhancer 函数类型的加强器，扩展store的功能，内部就是这样实现的：

```javascript
return enhancer(createStore)(reducer, initialState)
```

#### 返回值
store 对象，保存着当前的state 树，包含下面几个属性和方法：
+ dispatch
+ subscribe
+ getState
+ replaceReducer
+ `[$$observable]`: observable (这个不清楚，没研究过,貌似给其他库用到)


#### 源码分析

```javascript
// createStore 函数用来生成一个保存 state 树的store,
// 它是一个闭包，内部保存了下列的变量
  var currentReducer = reducer    // 当前的reducer
  var currentState = initialState   // 当前的状态
  var currentListeners = []         // 初始的监听器列表
  var nextListeners = currentListeners   // 执行时期的监听器列表
  var isDispatching = false
```

这个函数用闭包保存了上面的几个变量来供store的方法调用时处理。除了上面的几个变量，剩下的就是具体实现的方法。

**getState**

获取当前 state

```javascript
  function getState() {
    return currentState
  }
```

**ensureCanMutateNextListener**
将currentListeners拷贝一份放入nextListeners
```javascript
  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice()
    }
  }
```


**subscribe**

添加一个监听器，返回一个函数，可以通过调用这个返回值来取消注册的监听器。

```javascript
  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.')
    }

    var isSubscribed = true

	// 这里讲currListeners和nextListeners之间的引用关系斩断，
	// 用了两个变量来保存listeners主要考虑的问题就是， 如果在listener中
	// 也有subscribe或者unsubscribe操作就会影响本次dispatch操作引发的listener
	// 的执行列表， 因此使用一份副本， 保证本次的dispatch操作不会受影响， 然后
	// 在下面的dispatch有一个等式 var listeners = currentListeners = nextListeners
	// 又会在每次dispatch操作时重新拿到最新的listeners列表
    ensureCanMutateNextListeners()
    nextListeners.push(listener)

    return function unsubscribe() {
      if (!isSubscribed) {
        return
      }

      isSubscribed = false

      ensureCanMutateNextListeners()
      var index = nextListeners.indexOf(listener)
      nextListeners.splice(index, 1)
    }
  }
```

**dispatch**

触发action，接受action作为参数，正常情况下会将这个action作为返回值，但是如果使用了中间件，可能会修改这个返回值。函数主要触发了reducer函数来生成新的state 树，并且调用监听器绑定的函数。

```javascript
  function dispatch(action) {
    if (!isPlainObject(action)) {
      throw new Error(
        'Actions must be plain objects. ' +
        'Use custom middleware for async actions.'
      )
    }

    if (typeof action.type === 'undefined') {
      throw new Error(
        'Actions may not have an undefined "type" property. ' +
        'Have you misspelled a constant?'
      )
    }

   // 从提示信息应该可以看出， 这个标志变量是防止在一个reducer操作中 dispatch action，
   // 这时由于标志为 true 会抛出异常 。
    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.')
    }

    try {
      // 修改 isDispatching 标志， 并且调用reducer函数
      isDispatching = true
      currentState = currentReducer(currentState, action)
    } finally {
      isDispatching = false
    }

    var listeners = currentListeners = nextListeners
    for (var i = 0; i < listeners.length; i++) {
      listeners[i]()
    }

    return action
  }
```

### 2. combineReducer
reducer合成函数， 具体来说， 这个函数将一个键值为各个子reducer函数的对象， 转换为一个单一的reducer函数， 这个转换后的函数会调用各个子reducer， 然后将各个子reducer返回的state部分组合成完整的state对象， 返回的state的键名和传入的子reducer函数键值对应的键名是一致的。

**参数**
reducers object: {Object} 一个键值为reducer函数的对象， 键名则是该reducer对象处理的state对象部分的键名， 要注意这些子reducer也应该在出现不符合自己要处理action type时返回当前穿入的state.

**返回值**
返回一个root reducer， 这个reducer会调用各个子reducer处理state， 并将返回中组合成新的state.

```javascript
import { combineReducers } from 'redux';

const todoApp = combineReducers({
  visibilityFilter,
  todos
})

export default todoApp;
```

上面写法和下面的写法完全等价
```javqascript
export default function todoApp(state={}, action) {
  return {
    visibilityFilter: visibilityFilter(state.visibilityFilter, action),
    todos: todos(state.todos, action)
  }
}
```

仅仅是返回一个新的reducer函数， 这个新函数返回的state被几个子reducer拆分开， 但要注意子reducer的名字和传入子reducer函数的state部分名字是相同的。

个人认为核心代码类似于下面这样
```javascript
function combineReducer(reducerObj) {
  var keys = Object.keys(reducerObj);               
  var nextState = {};
  return function(state, action) {
    for(var i=0; i< keys.length; i++) {
      nextState.keys[i] = reducerObj.keys[i](state.keys[i], action);
    }
    return nextState;
  }
}
```

**源码解析**
```javascript
export default function combineReducers(reducers) {
  var reducerKeys = Object.keys(reducers)  // 保存键名， 这个键名也就是子reducer要处理的state键名
  var finalReducers = {}

  // 这个循环看起来只进行了过滤操作， 将不是function类型的reducer过滤掉
  for (var i = 0; i < reducerKeys.length; i++) {
    var key = reducerKeys[i]
    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key]
    }
  }
  var finalReducerKeys = Object.keys(finalReducers) // 过滤后的键名

  // 这一部分应该是对子reducer做限制， 确保如果初始化时传入的state是undefined，
  // 以及不能识别的action type， reducer仍能返回正确的state， 而不是undefined
  var sanityError
  try {
    assertReducerSanity(finalReducers)
  } catch (e) {
    sanityError = e
  }

  return function combination(state = {}, action) {
    if (sanityError) {
      throw sanityError
    }

    // 还是检查参数的正确性， 确保reducer正确， 传入的state是对象， 以及没有不能对上键名的reducer
    if (process.env.NODE_ENV !== 'production') {
      var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action)
      if (warningMessage) {
        warning(warningMessage)
      }
    }

    var hasChanged = false
    var nextState = {}
    for (var i = 0; i < finalReducerKeys.length; i++) {
      var key = finalReducerKeys[i]
      var reducer = finalReducers[key]
      var previousStateForKey = state[key]        // 当前的state状态
      var nextStateForKey = reducer(previousStateForKey, action)   // 经过reducer处理后的state状态
      if (typeof nextStateForKey === 'undefined') {
        var errorMessage = getUndefinedStateErrorMessage(key, action)
        throw new Error(errorMessage)
      }
      nextState[key] = nextStateForKey          // 拼接成完整的state对象
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
    }

    // 用了一个hasChanged标志而没有直接返回nextState应该是性能上的考虑吧
    return hasChanged ? nextState : state
  }
}
```


### 3. bindActionCreator 和 bindActionCreators
由于我们通常是使用 action creator 来批量生产 action object， 所以在dispatch时， 往往是下面这种样式；

```javascript
    store.dispatch(actionCreator(...args)
```
而 bindActionCreator 则是将action creator 和 dispatch 方法绑定到一起， 减少代码， 源码如下

```javascript
function bindActionCreator(actionCreator, dispatch) {
  return (...args) => dispatch(actionCreator(...args))
}
```

不过要注意的是源码中这个函数并没有被 export， 因此应该是作为bindActionCreators的一个类似内部函数的方法使用。

#### bindActionCreators
将一组actionCreators与dispatch绑定起来。

**参数**
actionCreators {Object | Function} 一个唯一的actionCreator或者一个保存一组actionCreators的对象， 对象的键名就是绑定后dispatch触发时调用的函数名， 键值就是一个个actionCreator。

dispatch {Function} store的dispatch方法。

**返回值**
boundActionCreators {Object | Function} 如果传入的参数是一个单一的actionCreator， 就返回绑定后的函数， 如果是一个对象的话， 那么返回的对象的键名就是dispatch时调用的函数名， 键值就是绑定后的函数。

```javascript
export default function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch)
  }

  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error(
      `bindActionCreators expected an object or a function, instead received ${actionCreators === null ? 'null' : typeof actionCreators}. ` +
      `Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?`
    )
  }
  // 上面的部分均为类型检查

  var keys = Object.keys(actionCreators)
  var boundActionCreators = {}
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i]
    var actionCreator = actionCreators[key]
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch)
    }
  }
  return boundActionCreators
}

```


### 4. compose
```javascript
export default function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  } else {
    const last = funcs[funcs.length - 1]
    const rest = funcs.slice(0, -1)
    return (...args) => rest.reduceRight((composed, f) => f(composed), last(...args))
  }
}
```
将一系列函数组合起来调用吧， 类似完成这样的功能`compose(f, g, h) is identical to doing (...args) => f(g(h(...args)))`

### 5. applyMiddleware
返回一个store enhancer， 加强store.dispatch方法， 比如执行异步action， 记录日志功能等。

**参数**
middlewares : 一组中间件

**返回值**
store enhancer : 使用中间件后的store enhancer

一个典型的中间件的代码
```javascript
const logger = store => next => action => {
  console.log('dispatching', action)
  let result = next(action)
  console.log('next state', store.getState())
  return result
}
```

源码

```javascript
export default function applyMiddleware(...middlewares) {
  // 注意这个函数是返回一个包装过的createStore函数
  return (createStore) => (reducer, initialState, enhancer) => {
    var store = createStore(reducer, initialState, enhancer)
    var dispatch = store.dispatch
    var chain = []

    var middlewareAPI = {
      getState: store.getState,
      dispatch: (action) => dispatch(action)
    }
    // chain数组应该是个每个元素参数为store.dispatch方法的函数数组
    chain = middlewares.map(middleware => middleware(middlewareAPI))

    // 返回包装过的dispatch方法， 注意包装的顺序， 先从middlewares的最后一个开始包装
    dispatch = compose(...chain)(store.dispatch)

    return {
      ...store,
      dispatch
    }
  }
}
```
