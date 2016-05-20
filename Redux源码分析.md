# Redux源码分析
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
+ [$$observable]: observable (这个不清楚，没研究过)


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

**subscribe**

添加一个监听器，返回一个函数，可以通过调用这个返回值来取消注册的监听器。

```javascript
  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.')
    }

    var isSubscribed = true

	// 不是很清楚下面这个函数的作用，这个函数仅仅将nextListeners的值作为currentListener 副本。
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