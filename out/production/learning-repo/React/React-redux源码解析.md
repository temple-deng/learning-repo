# React-redux 源码


### 1. Provider组件
Provider是作为整个APP的容器组件， 接受redux的store作为prop， 然后通过react的 context 特性， 可以让子组件啊访问到store。 要想让子组件访问到store， 首先要在Provider中声明getChildContext方法， 其次子组件要设置ContextTypes属性。

```javascript
export default class Provider extends Component {
  getChildContext() {
    return { store: this.store }
  }

  constructor(props, context) {
    super(props, context)
    this.store = props.store
  }

  render() {
    const { children } = this.props
    return Children.only(children)
  }
}

// 生产环境多一步检测， 不可以直接替换store
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


###  2. Connect
connect([mapStateToProps], [mapDispatchToProps], [mergeProps], [options])

连接 React 组件与 Redux store。

连接操作不会改变原来的组件类，反而返回一个新的已与 Redux store 连接的组件类。

**参数**
+ [mapStateToProps(state, [ownProps]): stateProps] (Function): 如果定义该参数，组件将会监听 Redux store 的变化。任何时候，只要 Redux store 发生改变，mapStateToProps 函数就会被调用。该回调函数必须返回一个纯对象，这个对象会与组件的 props 合并。如果你省略了这个参数，你的组件将不会监听 Redux store。如果指定了该回调函数中的第二个参数 ownProps，则该参数的值为传递到组件的 props，而且只要组件接收到新的 props，mapStateToProps 也会被调用。
+ [mapDispatchToProps(dispatch, [ownProps]): dispatchProps] (Object or Function): 如果传递的是一个对象，它的每个键名也是对应 UI 组件的同名参数，键值应该是一个函数，会被当作 Action creator ，返回的 Action 会由 Redux 自动发出。如果传递的是一个函数，该函数将接收一个 dispatch 函数，然后由你来决定如何返回一个对象，这个对象通过 dispatch 函数与 action creator 以某种方式绑定在一起（提示：你也许会用到 Redux 的辅助函数 bindActionCreators()）。如果你省略这个 mapDispatchToProps 参数，默认情况下，dispatch 会注入到你的组件 props 中。如果指定了该回调函数中第二个参数 ownProps，该参数的值为传递到组件的 props，而且只要组件接收到新 props，mapDispatchToProps 也会被调用。
+ [mergeProps(stateProps, dispatchProps, ownProps): props] (Function): 如果指定了这个参数，mapStateToProps() 与 mapDispatchToProps() 的执行结果和组件自身的 props 将传入到这个回调函数中。该回调函数返回的对象将作为 props 传递到被包装的组件中。你也许可以用这个回调函数，根据组件的 props 来筛选部分的 state 数据，或者把 props 中的某个特定变量与 action creator 绑定在一起。如果你省略这个参数，默认情况下返回 Object.assign({}, ownProps, stateProps, dispatchProps) 的结果。
+ [options] (Object) 如果指定这个参数，可以定制 connector 的行为。
  + [pure = true] (Boolean): 如果为 true，connector 将执行 shouldComponentUpdate 并且浅对比 mergeProps 的结果，避免不必要的更新，前提是当前组件是一个“纯”组件，它不依赖于任何的输入或 state 而只依赖于 props 和 Redux store 的 state。默认值为 true。
  + [withRef = false] (Boolean): 如果为 true，connector 会保存一个对被包装组件实例的引用，该引用通过 getWrappedInstance() 方法获得。默认值为 false.






```javascript
// 设置默认参数
const defaultMapStateToProps = state => ({}) // eslint-disable-line no-unused-vars
const defaultMapDispatchToProps = dispatch => ({ dispatch })
const defaultMergeProps = (stateProps, dispatchProps, parentProps) => ({
  ...parentProps,
  ...stateProps,
  ...dispatchProps
})
```
设置connect参数的默认值

connect函数
```javascript
export default function connect(mapStateToProps, mapDispatchToProps, mergeProps, options = {}) {
 // 是否监听store的变化，
  const shouldSubscribe = Boolean(mapStateToProps)
  const mapState = mapStateToProps || defaultMapStateToProps

  let mapDispatch
  if (typeof mapDispatchToProps === 'function') {
    mapDispatch = mapDispatchToProps
  } else if (!mapDispatchToProps) {
    mapDispatch = defaultMapDispatchToProps
  } else {
      // 如果是对象类型， 手动绑定一下
    mapDispatch = wrapActionCreators(mapDispatchToProps)
  }

  const finalMergeProps = mergeProps || defaultMergeProps
  const { pure = true, withRef = false } = options
  const checkMergedEquals = pure && finalMergeProps !== defaultMergeProps

  // ....
 }
```

返回的包装组件的函数
```javascript
return function wrapWithConnect(WrappedComponent) {
    const connectDisplayName = `Connect(${getDisplayName(WrappedComponent)})`

    function checkStateShape(props, methodName) {
      if (!isPlainObject(props)) {
        warning(
          `${methodName}() in ${connectDisplayName} must return a plain object. ` +
          `Instead received ${props}.`
        )
      }
    }

    function computeMergedProps(stateProps, dispatchProps, parentProps) {
      const mergedProps = finalMergeProps(stateProps, dispatchProps, parentProps)
      if (process.env.NODE_ENV !== 'production') {
        checkStateShape(mergedProps, 'mergeProps')
      }
      return mergedProps
    }

    // component define
}
```

真正的组件
```javascript
    class Connect extends Component {

      // 组件是否需要重新渲染更新， 如果pure选项传入了false， 则每次变更都需要渲染
      // 否则还要根据检查props和state的变化。
      shouldComponentUpdate() {
        return !pure || this.haveOwnPropsChanged || this.hasStoreStateChanged
      }

      constructor(props, context) {
        super(props, context)
        this.version = version
        this.store = props.store || context.store

        invariant(this.store,
          `Could not find "store" in either the context or ` +
          `props of "${connectDisplayName}". ` +
          `Either wrap the root component in a <Provider>, ` +
          `or explicitly pass "store" as a prop to "${connectDisplayName}".`
        )

        const storeState = this.store.getState()
        this.state = { storeState }
        this.clearCache()
      }
}
```

组件挂载后监听store的变化， 注册监听器函数
```javascript
componentDidMount() {
  this.trySubscribe()
}

trySubscribe() {
  if (shouldSubscribe && !this.unsubscribe) {
    this.unsubscribe = this.store.subscribe(this.handleChange.bind(this))
    this.handleChange()
  }
}
```

store上注册的监听器函数， 这个应该就是主要的根据store变化来主动渲染组件的函数

```javascript
handleChange() {
  if (!this.unsubscribe) {
    return
  }

  const storeState = this.store.getState()
  const prevStoreState = this.state.storeState
  if (pure && prevStoreState === storeState) {
    return
  }

  // 根据名字判断的话， 应该是合并上去的props并不取决于ownProps
  if (pure && !this.doStatePropsDependOnOwnProps) {
    // 判断合并
    const haveStatePropsChanged = tryCatch(this.updateStatePropsIfNeeded, this)
    if (!haveStatePropsChanged) {
      return
    }
    if (haveStatePropsChanged === errorObject) {
      this.statePropsPrecalculationError = errorObject.value
    }
    this.haveStatePropsBeenPrecalculated = true
  }

  this.hasStoreStateChanged = true
  this.setState({ storeState })
}

updateStatePropsIfNeeded() {
  const nextStateProps = this.computeStateProps(this.store, this.props)
  if (this.stateProps && shallowEqual(nextStateProps, this.stateProps)) {
    return false
  }

  this.stateProps = nextStateProps
  return true
}
```
