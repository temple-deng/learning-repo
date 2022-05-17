## context 

<!-- TOC -->

- [context](#context)
  - [HostRoot Context](#hostroot-context)
    - [updateHostRoot](#updatehostroot)
  - [context 对象](#context-对象)
    - [pushProvider](#pushprovider)
    - [updateContextConsumer](#updatecontextconsumer)
  - [scheduleContextWorkOnParentPath](#schedulecontextworkonparentpath)
  - [class 如何读取 context](#class-如何读取-context)

<!-- /TOC -->

这一节我们看看 context 的内容。    

首先看下 HostRoot 上的那个 context，和我们这里的普通 context 到底有没有关系。   

### HostRoot Context   

首先首次渲染的时候在 `updateContainer` 中有：   

```ts
export function updateContainer(
  element: ReactNodeList,
  container: OpaqueRoot,
  parentComponent: ?React$Component<any, any>,
  callback: ?Function,
): Lane {
  const current = container.current;
  const eventTime = requestEventTime();
  const lane = requestUpdateLane(current);

  // 这里 parentComponent 第一次传的是 null
  const context = getContextForSubtree(parentComponent);
  if (container.context === null) {
    // true
    container.context = context;
  } else {
    container.pendingContext = context;
  }
  // 所以相当于这里给 fiberRoot.context 赋值了这个全局的空对象   

  const update = createUpdate(eventTime, lane);
  update.payload = {element};

  callback = callback === undefined ? null : callback;
  if (callback !== null) {
    update.callback = callback;
  }

  enqueueUpdate(current, update, lane);
  const root = scheduleUpdateOnFiber(current, lane, eventTime);
  return lane;
}

function getContextForSubtree(
  parentComponent: ?React$Component<any, any>,
): Object {
  if (!parentComponent) {
    // 空对象
    return emptyContextObject;
  }

  const fiber = getInstance(parentComponent);
  const parentContext = findCurrentUnmaskedContext(fiber);

  if (fiber.tag === ClassComponent) {
    const Component = fiber.type;
    if (isLegacyContextProvider(Component)) {
      return processChildContext(fiber, Component, parentContext);
    }
  }

  return parentContext;
}
``` 

我们注意这里的 context 还是 pendingContext 都是 FiberRoot 上的属性。   


然后后面就很少见了，可能得到 work 中了，我们先从 beginWork 开始，直接到了 `updateHostRoot` 中了。    

#### updateHostRoot

```ts
function updateHostRoot(current, workInProgress, renderLanes) {
  pushHostRootContext(workInProgress);

  if (current === null) {
    throw new Error('Should have a current fiber. This is a bug in React.');
  }

  const nextProps = workInProgress.pendingProps;
  const prevState = workInProgress.memoizedState;
  const prevChildren = prevState.element;
  cloneUpdateQueue(current, workInProgress);
  processUpdateQueue(workInProgress, nextProps, null, renderLanes);

  const nextState: RootState = workInProgress.memoizedState;
  const root: FiberRoot = workInProgress.stateNode;
  const nextChildren = nextState.element;
    if (nextChildren === prevChildren) {
      return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
    }
    reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}
```      

这里有一个 `pushHostRootContext`，看下干嘛的。    

```ts
function pushHostRootContext(workInProgress) {
  const root = (workInProgress.stateNode as FiberRoot);
  if (root.pendingContext) {
    pushTopLevelContextObject(
      workInProgress,
      root.pendingContext,
      root.pendingContext !== root.context,
    );
  } else if (root.context) {
    // 走了这里
    pushTopLevelContextObject(workInProgress, root.context, false);
  }
  pushHostContainer(workInProgress, root.containerInfo);
}
```   

`pushTopLevelContextObject` 相关内容在 ReactFiberContext 中，之前的 `emptyContextObject` 也是。   

```ts
function pushTopLevelContextObject(
  fiber: Fiber,
  context: Object,
  didChange: boolean,
): void {
    if (contextStackCursor.current !== emptyContextObject) {
      throw new Error(
        'Unexpected context found on stack. ' +
          'This error is likely caused by a bug in React. Please file an issue.',
      );
    }

    push(contextStackCursor, context, fiber);
    push(didPerformWorkStackCursor, didChange, fiber);
}
```    

这里有个 stackCursor 的概念，其实就是一个包含一个 `current` 属性的对象，美其名曰指针，而这里 `contextStackCursor` 也是这样的一个对象。一开始他的 current 就是 `emptyContextObject`。   

那这里就会之后后面的 push。push 其实相当于将第一个参数的 current 推到一个栈里，然后将第一个参数的 current 设置为 
第二个参数，不过相当于第二个参数是不在栈里的。   

`didPerformWorkStackCursor` 是一个布尔值的指针。    

那这里为什么感觉为什么推入栈里的都是 `emptyContextObject` 这一个对象呢，而且大家好像保持的是同一个引用啊。   

所以相当于在 `updateHostRoot` 将一个指针推入了栈中。   

然后后面 pushHostContainer 真的看不懂了，又出来好几个指针，头疼。    

不看了不看了，看不动。   

还是看普通的吧。     

### context 对象   

```ts
function createContext<T>(defaultValue: T): ReactContext<T> {
  const context: ReactContext<T> = {
    $$typeof: REACT_CONTEXT_TYPE,
    _currentValue: defaultValue,
    _currentValue2: defaultValue,

    _threadCount: 0,
    // These are circular
    Provider: (null as any),
    Consumer: (null as any),

    _defaultValue: (null as any),
    _globalName: (null as any),
  };

  context.Provider = {
    $$typeof: REACT_PROVIDER_TYPE,
    _context: context,
  };

  context.Consumer = context;
  return context;
}
```    

所以就是一个普通对象，包含了 `Provider, Consumer` 属性。`Consumer` 属性指向了自己，这样的话，其实 `Consumer` 可以很方面的拿到 value 值。Consumer 的类型就是 `REACT_CONTEXT_TYPE`.        

分了4种对象，看样子有两种是 element 的对象。    

```ts
export type ReactProvider<T> = {
  $$typeof: Symbol | number,
  type: ReactProviderType<T>,
  key: null | string,
  ref: null,
  props: {
    value: T,
    children?: ReactNodeList,
  },
};

export type ReactProviderType<T> = {
  $$typeof: Symbol | number,
  _context: ReactContext<T>,
};

export type ReactConsumer<T> = {
  $$typeof: Symbol | number,
  type: ReactContext<T>,
  key: null | string,
  ref: null,
  props: {
    children: (value: T) => ReactNodeList,
  },
};

export type ReactContext<T> = {
  $$typeof: Symbol | number,
  Consumer: ReactContext<T>,
  Provider: ReactProviderType<T>,
  _currentValue: T,
  _currentValue2: T,
  _threadCount: number,
  // DEV only
  _currentRenderer?: Object | null,
  _currentRenderer2?: Object | null,
  displayName?: string,

  _defaultValue: T,
  _globalName: string,
};
```  

这里 Provider 对应的 element 的 type 属性就是上面的 `context.Provider` 对象，即 `ReactProviderType` 类型。   

而 Consumer 对应的 element 的 type 就是整个 Context 对象。   

OK，那我们以这个为主，进入work流程。   

```tsx
const ThemeContext = createContext('light');

class App extends PureComponent {
  constructor(props) {
    super(props);
    this.ref = createRef();
    this.state = {
      ctxValue: 'light'
    }
  }

  handleClick = () => {
    console.log('clicked');
    console.log(this.ref);
    this.setState({
      count: 1
    });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header" ref={this.ref}>
          <img src={logo} className="App-logo" alt="logo" />
          <p onClick={this.handleClick}>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <ThemeContext.Provider value={this.state.ctxValue}>
            <ThemeContext.Consumer>
              {value => (<div>{value}</div>)}
            </ThemeContext.Consumer>
          </ThemeContext.Provider>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }
}
```    

在 beginWork(header) 的时候会新建下一层的 fiber 节点。由于是数组，所以走了 `reconcileChildrenArray`。然后主要看下创建 Provider 节点的时候走了哪些。    

最后是在 `createFiberFromTypeAndProps` 这里会检查节点的 type 属性：   

```ts
if (typeof type === 'object' && type !== null) {
    switch (type.$$typeof) {
    // 这个是 provider
    case REACT_PROVIDER_TYPE:
        fiberTag = ContextProvider;
        break getTag;
    // 这个就是 consumer
    case REACT_CONTEXT_TYPE:
        // This is a consumer
        fiberTag = ContextConsumer;
        break getTag;
    // ....
    }
}
```    

所以他们的 fiber tag 是不同的。    

然后我们看下 Provider 的 beginWork 流程。走了 `updateContextProvider` 函数。    

```ts
function updateContextProvider(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
) {
  const providerType: ReactProviderType<any> = workInProgress.type;
  const context: ReactContext<any> = providerType._context;

  const newProps = workInProgress.pendingProps;
  const oldProps = workInProgress.memoizedProps;

  const newValue = newProps.value;

  pushProvider(workInProgress, context, newValue);

    if (oldProps !== null) {
      const oldValue = oldProps.value;
      if (is(oldValue, newValue)) {
        // No change. Bailout early if children are the same.
        if (
          oldProps.children === newProps.children &&
          !hasLegacyContextChanged()
        ) {
          // 这里可以直接 bailout
          return bailoutOnAlreadyFinishedWork(
            current,
            workInProgress,
            renderLanes,
          );
        }
      } else {
        // The context value changed. Search for matching consumers and schedule
        // them to update.
        propagateContextChange(workInProgress, context, renderLanes);
      }
    }

  const newChildren = newProps.children;
  reconcileChildren(current, workInProgress, newChildren, renderLanes);
  return workInProgress.child;
}
```    

我们这里分情况讨论吧，首先最初的渲染的时候

- 最初渲染：`pushProvider` 将 cursor 当前值推入栈中，然后设置当前 cursor 为新值，然后 reoncile，那就创建了 consumer 的 fiber

#### pushProvider    

```ts
const valueCursor: StackCursor<mixed> = createCursor(null);

export function pushProvider<T>(
  providerFiber: Fiber,
  context: ReactContext<T>,
  nextValue: T,
): void {
    push(valueCursor, context._currentValue, providerFiber);

    context._currentValue = nextValue;
}
```   

相当于将当前值推入栈中，然后把目前值赋到 context 中。那这样看所有的 context 大家在一根绳子上啊。    

#### updateContextConsumer   


```ts
function updateContextConsumer(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
) {
  let context: ReactContext<any> = workInProgress.type;

  const newProps = workInProgress.pendingProps;
  const render = newProps.children;

  prepareToReadContext(workInProgress, renderLanes);
  const newValue = readContext(context);

  let newChildren = render(newValue);

  // React DevTools reads this flag.
  workInProgress.flags |= PerformedWork;
  reconcileChildren(current, workInProgress, newChildren, renderLanes);
  return workInProgress.child;
}

// 这个函数也就重置了些变量和改了 dependencies 属性
export function prepareToReadContext(
  workInProgress: Fiber,
  renderLanes: Lanes,
): void {
  // 指针
  currentlyRenderingFiber = workInProgress;
  lastContextDependency = null;
  lastFullyObservedContext = null;

  const dependencies = workInProgress.dependencies;
  if (dependencies !== null) {
    if (enableLazyContextPropagation) {
      // Reset the work-in-progress list
      dependencies.firstContext = null;
    } else {
      const firstContext = dependencies.firstContext;
      if (firstContext !== null) {
        if (includesSomeLane(dependencies.lanes, renderLanes)) {
          // Context list has a pending update. Mark that this fiber performed work.
          markWorkInProgressReceivedUpdate();
        }
        // Reset the work-in-progress list
        dependencies.firstContext = null;
      }
    }
  }
}

export function readContext<T>(context: ReactContext<T>): T {
  const value = context._currentValue

  // 奇怪的一点是  lastFullyObservedContext 这个变量始终没有进行过
  // 赋值，那永远走 else
  if (lastFullyObservedContext === context) {
    // Nothing to do. We already observe everything in this context.
  } else {
    // 第一次走了这里
    const contextItem = {
      context: ((context as any) as ReactContext<mixed>),
      memoizedValue: value,
      next: null,
    };

    if (lastContextDependency === null) {
      // 注意这里的报错信息，我们只能在 class 的部分方法和函数组件函数体中调用
      if (currentlyRenderingFiber === null) {
        throw new Error(
          'Context can only be read while React is rendering. ' +
            'In classes, you can read it in the render method or getDerivedStateFromProps. ' +
            'In function components, you can read it directly in the function body, but not ' +
            'inside Hooks like useReducer() or useMemo().',
        );
      }

      // This is the first dependency for this component. Create a new list.
      lastContextDependency = contextItem;
      currentlyRenderingFiber.dependencies = {
        lanes: NoLanes,
        firstContext: contextItem,
      };
    } else {
      // Append a new context item.
      lastContextDependency = lastContextDependency.next = contextItem;
    }
  }
  return value;
}

```   

首先看 `prepareToReadContext`。这里第一次 `dependencies` 为 null，啥都不干。   

而且同时注意到 Function, Class 也都有 `prepareToReadContext` 的操作，因为这些东西都有使用 context 的可能吧。    

我们仔细想想 context 是怎么影响我们的更新的，主要还是在 Class 中影响 this 上的值，在 Function 中影响 hook 的返回值。而这些都是要在 beginWork 中处理的。    

我们看下 `readContext` 干了什么，首先是修改了 `lastContextDependency`  变量值，这是个链表的头节点，同时修改了 wip 的 `dependencies`属性。然后将 `_currentValue` 返回了出去。   

然后在 beginWork 中就是调用了子节点的函数，传入了 `_currentValue` 作为参数。那这里其实基本上就完了。我们看下 `completeWork`。     

然后是 completeWork，至少到 `Consumer` 这一层都没发生什么，主要看下 Provider 吧

```ts
case ContextProvider:
    // Pop provider fiber
    const context: ReactContext<any> = workInProgress.type._context;
    popProvider(context, workInProgress);
    bubbleProperties(workInProgress);
    return null;
```   

看也很容易理解，就是把在 beginWork 中推入的之前的值 pop 出来，并修改到 `context._currentValue` 上。    

相当于假设原本栈顶的是 `null`，然后默认是 `defaultValue`，我们在 beginWork 时会把 `defaultValue` 推入栈中，现在的话就是把 `defaultValue` pop 出来并修改到 context 中。   

但是此时我们想一下，context 具体作用是什么，是把高层的某个 state 透传，这个功能如何体现。我们以 class 为例吧，改改之前的例子。    

```tsx
class Sub extends PureComponent {
  render() {
    console.log('sub render')
    return (
      <div>
        <ThemeContext.Consumer>
          {value => {
            console.log('o-------', value);
            return <div>{value}</div>
          }}
        </ThemeContext.Consumer>
      </div>
    )
  }
}

class App extends PureComponent {
  constructor(props) {
    super(props);
    this.ref = createRef();
    this.state = {
      ctxValue: 'light'
    }
  }

  handleClick = () => {
    console.log('clicked');
    console.log(this.ref);
    this.setState({
      count: 1,
      ctxValue: 'dark'
    });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header" ref={this.ref}>
          <img src={logo} className="App-logo" alt="logo" />
          <p onClick={this.handleClick}>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <ThemeContext.Provider value={this.state.ctxValue}>
            <Sub />
          </ThemeContext.Provider>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
        <Sub></Sub>
      </div>
    );
  }
}
```    

测试的时候确实 Sub 没render，但是consumer 确实render了。    

那我们看下具体流程，走到了 Provider 的 beginWork，在 `updateContextProvider` 中由于有 oldProps 且 newValue !== oldValue，所以会走 `propagateContextChange`。看下这个干了什么。    

```ts
export function propagateContextChange<T>(
  workInProgress: Fiber,
  context: ReactContext<T>,
  renderLanes: Lanes,
): void {
    propagateContextChange_eager(workInProgress, context, renderLanes);
}

function propagateContextChange_eager<T>(
  workInProgress: Fiber,
  context: ReactContext<T>,
  renderLanes: Lanes,
): void {

  let fiber = workInProgress.child;
  if (fiber !== null) {
    // Set the return pointer of the child to the work-in-progress fiber.
    fiber.return = workInProgress;
  }
  // 如果有 fiber 的话，那意味着下层 fiber 已经构建了，那这是什么场景呢
  // 但是我们的例子确实走了这个分支 fiber 是 Sub 节点的 fiber
  while (fiber !== null) {
    let nextFiber;

    // Visit this fiber.
    const list = fiber.dependencies;
    // 我们的例子一开始没走这，但看意思最终会走这
    if (list !== null) {
      nextFiber = fiber.child;

      let dependency = list.firstContext;
      while (dependency !== null) {
        // Check if the context matches.
        if (dependency.context === context) {
          // Match! Schedule an update on this fiber.
          if (fiber.tag === ClassComponent) {
            // Schedule a force update on the work-in-progress.
            const lane = pickArbitraryLane(renderLanes);
            const update = createUpdate(NoTimestamp, lane);
            update.tag = ForceUpdate;
            // TODO: Because we don't have a work-in-progress, this will add the
            // update to the current fiber, too, which means it will persist even if
            // this render is thrown away. Since it's a race condition, not sure it's
            // worth fixing.

            // Inlined `enqueueUpdate` to remove interleaved update check
            const updateQueue = fiber.updateQueue;
            if (updateQueue === null) {
              // Only occurs if the fiber has been unmounted.
            } else {
              const sharedQueue: SharedQueue<any> = (updateQueue: any).shared;
              const pending = sharedQueue.pending;
              if (pending === null) {
                // This is the first update. Create a circular list.
                update.next = update;
              } else {
                update.next = pending.next;
                pending.next = update;
              }
              sharedQueue.pending = update;
            }
          }

          fiber.lanes = mergeLanes(fiber.lanes, renderLanes);
          const alternate = fiber.alternate;
          if (alternate !== null) {
            alternate.lanes = mergeLanes(alternate.lanes, renderLanes);
          }

          // 这里，可能会安排更新
          scheduleContextWorkOnParentPath(
            fiber.return,
            renderLanes,
            workInProgress,
          );

          // Mark the updated lanes on the list, too.
          list.lanes = mergeLanes(list.lanes, renderLanes);

          // Since we already found a match, we can stop traversing the
          // dependency list.
          break;
        }
        dependency = dependency.next;
      }
    } else if (fiber.tag === ContextProvider) {
      // Don't scan deeper if this is a matching provider
      nextFiber = fiber.type === workInProgress.type ? null : fiber.child;
    } else {
      // Traverse down.
      nextFiber = fiber.child;
    }

    if (nextFiber !== null) {
      // Set the return pointer of the child to the work-in-progress fiber.
      nextFiber.return = fiber;
    } else {
      // No child. Traverse to next sibling.
      nextFiber = fiber;
      while (nextFiber !== null) {
        if (nextFiber === workInProgress) {
          // We're back to the root of this subtree. Exit.
          nextFiber = null;
          break;
        }
        const sibling = nextFiber.sibling;
        if (sibling !== null) {
          // Set the return pointer of the sibling to the work-in-progress fiber.
          sibling.return = nextFiber.return;
          nextFiber = sibling;
          break;
        }
        // No more siblings. Traverse up.
        nextFiber = nextFiber.return;
      }
    }
    fiber = nextFiber;
  }
}
```   

看这个函数的意思是会从当前 Provider 向下搜索到一个 Consumer，然后会调用 `scheduleContextWorkOnParentPath`。     

### scheduleContextWorkOnParentPath    

```ts
export function scheduleContextWorkOnParentPath(
  parent: Fiber | null,
  renderLanes: Lanes,
  propagationRoot: Fiber,
) {
  // Update the child lanes of all the ancestors, including the alternates.
  let node = parent;
  while (node !== null) {
    const alternate = node.alternate;
    if (!isSubsetOfLanes(node.childLanes, renderLanes)) {
      node.childLanes = mergeLanes(node.childLanes, renderLanes);
      if (alternate !== null) {
        alternate.childLanes = mergeLanes(alternate.childLanes, renderLanes);
      }
    } else if (
      alternate !== null &&
      !isSubsetOfLanes(alternate.childLanes, renderLanes)
    ) {
      alternate.childLanes = mergeLanes(alternate.childLanes, renderLanes);
    }
    if (node === propagationRoot) {
      break;
    }
    node = node.return;
  }
}
```   

没有仔细看，但是感觉意思是从 Consumer 到 Provider 这一条路径上的节点的 childLanes 都会添加新的更新 lane。从而无法完全直接复用。一致是 clone。    

然后我想大概的意思就是，触发了更新以后，在 Provider 的时候会调用这个添加 lane，然后在 beginWork(Sub) 的时候，可以 clone 处理，然后 beginWork(div)，这个也是直接 clone 处理，然后就是 Consumer 了，看下有特殊的吗，没看懂几个意思，但是感觉是更新就完事了？    

而如果我们 update context 的时候用的是同一个值，很可能会直接 bailout。然而事实上并没有，因为 children 不等，那这种就是常规的更新。    


### class 如何读取 context    

在 beginWork `updateClassComponent` 中，假设是组件初次挂载，调用 `constructClassInstance` 的时候，会像 Consumer 一样调用 `readContext`，读取 context 内容，然后在调用构造函数的时候会传入，但我们好像一般不这样用。     

```ts
let instance = new ctor(props, context);
```      

同时在 `mountClassInstance` 中会再次读取 context，话说这不会弄错吗，读了两次啊。   

```ts
if (typeof contextType === 'object' && contextType !== null) {
    instance.context = readContext(contextType);
  }
```   

哦，确实不会，在 `readContext` 中只记录了 dep 和读值，pop 操作是在 `completeWork` 中。    

