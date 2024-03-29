## context 

<!-- TOC -->

- [context](#context)
  - [HostRoot Context](#hostroot-context)
    - [updateHostRoot](#updatehostroot)
  - [context 对象](#context-对象)
    - [pushProvider](#pushprovider)
    - [updateContextConsumer](#updatecontextconsumer)
  - [总结](#总结)
  - [复杂的例子](#复杂的例子)
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

从名称上来看，感觉这个 context 是整个 fiber 树的一种 context，具体内容是什么我们还不知道，然后值是保存
在 fiberRoot.context 和 fiberRoot.pendingContext，这感觉就是一个双变量的数据保存，context 保存当前的，
pendingContext 保存新的 context。    


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

然后呢在 hostRoot 的更新中，调用 `pushHostRootContext` 看样子是把当前 fiberRoot 的 context 内容推到一个栈上了，
而 `pushHostRootContext` 进行了两步操作，一个是 `pushTopLevelContextObject` 另一个是 `pushHostContainer`。   

奇怪的是 fiberRoot 上的两个 context 好像并不是直接影响 work，而是通过将数据推入到栈中影响的，因为搜代码的话，这两个
context 基本上啥都没干，所以可能需要从栈入手。   


```ts
function pushHostRootContext(workInProgress) {
  const root = (workInProgress.stateNode as FiberRoot);
  // 优先推入新的 context
  if (root.pendingContext) {
    pushTopLevelContextObject(
      workInProgress,
      root.pendingContext,
      // contextDidChange
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

这里 contextStackCursor 和 didPerformWorkStackCursor 都是在这个 ReactFiberContext 中，context 是个对象的，didPerform 是个布尔的。相当于一个指向当前的 context，一个指向 context 是否变化了。   

beginWork 中的 `hasLegacyContextChanged` 就是用的的 didPerform 这个变量值。但是这个root 上的 context 到底
是什么，我们现在还真是不清楚。   

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

`push` 和 `pop` 的操作都是在 ReactFiberStack 中，相当于在 FiberContext 文件保存当前 context 的情况，
在 FiberStack 中保存 context 的栈。在 stack 有这两个核心的变量：   

```ts
const valueStack: Array<any> = [];
let index = -1;
```    

相当于一个是栈，一个是栈顶元素的索引。   

```ts
function pop<T>(cursor: StackCursor<T>, fiber: Fiber): void {
  if (index < 0) {
    return;
  }
  cursor.current = valueStack[index];

  valueStack[index] = null;
  index--;
}

function push<T>(cursor: StackCursor<T>, value: T, fiber: Fiber): void {
  index++;

  valueStack[index] = cursor.current;

  cursor.current = value;
}
```   

那这里就会之后后面的 push。push 其实相当于将第一个参数的 current 推到一个栈里，然后将第一个参数的 current 设置为 
第二个参数，不过相当于第二个参数是不在栈里的。   

那这里为什么感觉为什么推入栈里的都是 `emptyContextObject` 这一个对象呢，而且大家好像保持的是同一个引用啊。   


所以 `pushTopLevelContextObject` 相当于把旧的 contextCursor 和 didPerformCursor 推入栈中，然后将新的值设置了。那栈中目前相当于一个空对象，一个布尔值。   

然后后面 pushHostContainer 的话类似 fiberContext 的内容，但是又在一个新的文件中 ReactFiberHostContext 了，这里又有很多新的指针。      

```ts
// fiber 是 hostRoot, nextRootInstance 是 react dom 容器
function pushHostContainer(fiber: Fiber, nextRootInstance: Container) {
  // Push current root instance onto the stack;
  // This allows us to reset root when portals are popped.
  push(rootInstanceStackCursor, nextRootInstance, fiber);
  // Track the context and the Fiber that provided it.
  // This enables us to pop only Fibers that provide unique contexts.
  push(contextFiberStackCursor, fiber, fiber);

  // Finally, we need to push the host context to the stack.
  // However, we can't just call getRootHostContext() and push it because
  // we'd have a different number of entries on the stack depending on
  // whether getRootHostContext() throws somewhere in renderer code or not.
  // So we push an empty value first. This lets us safely unwind on errors.
  push(contextStackCursor, NO_CONTEXT, fiber);
  // http://www.w3.org/1999/xhtml 是个这样的字符串
  const nextRootContext = getRootHostContext(nextRootInstance);
  // Now that we know this function doesn't throw, replace it.
  pop(contextStackCursor, fiber);
  push(contextStackCursor, nextRootContext, fiber);
}
```   

`rootInstanceStackCursor, contextFiberStackCursor, contextStackCursor` 是这个文件单独的3个指针，`contextStackCursor` 和之前页面的不是一个，看起来3个指针可能分别指向 dom 根元素，一个 fiber，一个普通 context，
但是奇怪的是，这3个指针初始值都是同一个对象。    

也就是这个流程又推了3个值到栈中。   

那做完这些，栈里面应该是5个值。    

目前还不知道干了什么。。。。   

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

所以就是一个普通对象，包含了 `Provider, Consumer` 属性。`Consumer` 属性指向了自己，这样的话，其实 `Consumer` 可以很方便的拿到 value 值。Consumer 的类型就是 `REACT_CONTEXT_TYPE`.        

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

感觉代码有很有多东西是为什么兼容以前版本的 context 做的，所以混杂一起很乱。   

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

我们考虑一下什么时候会触发 bailout 的机制，首先第一次渲染肯定不会，然后假设我们当前 Provider 所在的组件的更新了。
同时 value 没变化。抛开 `pushProvider` 不看，一般很少会 children 相等吧，因为一般都是新的对象。   

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

这里 pushProvider 的内容又在 ReactFiberNewContext 中，那看来之前的 reactFiberContext 可能就是 legacy 的
context 了，相当于将当前值推入栈中，然后把目前值赋到 context 中。那这样看所有的 context 大家在一根绳子上啊。    

那也就是在 work 过程每遇到一个 Provider 就会在栈中推一个 provider value。   

#### updateContextConsumer   

然后看 consumer 的 work。   

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
  // 为读取 context 做准备，首先设置必要指针
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
  // _currentValue 为最近的 context provider 在 pushProvider 中设置的新值
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
      // 这是单链表的形式，不是循环链表
      lastContextDependency = lastContextDependency.next = contextItem;
    }
  }
  return value;
}
```   

一般在可能会读取 context 值，即充当 consumer 的地方都会调用 `prepareToReadContext` 做准备，比如类组件，
函数组件，interminate 组件，consumer 组件。   

首先看 `prepareToReadContext`。这里第一次 `dependencies` 为 null，啥都不干。   

而且同时注意到 Function, Class 也都有 `prepareToReadContext` 的操作，因为这些东西都有使用 context 的可能吧。    

我们仔细想想 context 是怎么影响我们的更新的，主要还是在 Class 中影响 this 上的值，在 Function 中影响 hook 的返回值。而这些都是要在 beginWork 中处理的。    

我们看下 `readContext` 干了什么，首先是修改了 `lastContextDependency`  变量值，这是个链表的头节点，同时修改了 wip 的 `dependencies`属性。然后将 `_currentValue` 返回了出去。   

相当于在读取 context 的时候，在当前 consumer 的 dependenies 上建立了一个依赖链表。   

所以目前第一次的流程就是 provider 进行 `pushProvider`，更新 context 对象上面的值，然后在 consumer
中呢，首先 prepare 一下，然后从 context 对象上读出来值，并构建依赖。   

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

### 总结

那这里至少首次 render 的流程是比较清晰的了，就是 provider 修改 context 值，consumer 从 context 上取值。   

那么更新呢，假设 provider 所在组件更新，这种要分情况讨论，即 value 是否变动，如果 value 没变动，一般就直接
reconcileChildren 就完事了，因为不需要联动更新 consumer，但是如果 value 有更新，就需要多出一步即
`propagateContextChange`，然后再 `reconcileChildren`。   

如果按照个人想法的话，这个 `propagateContextChange` 应该是要在 context 上找到 dependenies 上找到所有依赖节点，
安排一个更新。   

### 复杂的例子

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
  // 感觉是要从当前的后代开始向下遍历，那这种效率感觉不高啊
  while (fiber !== null) {
    let nextFiber;

    // Visit this fiber.
    const list = fiber.dependencies;
    // 我们的例子一开始没走这，但看意思最终会走这
    if (list !== null) {
      // 如果节点有 dependencies，就检查是否有依赖当前的这个 context
      // 如果有 scheduleContextWorkOnParentPath 安排更新
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

简单看一下的话，感觉这也是一个深度优先搜索的过程，向下搜索，搜索子树中所有节点 dependenies 中有当前 context 的节点，调用 `scheduleContextWorkOnParentPath` 安排一个更新，不过如果遇到同一个 Context Provider 节点，那以这个
节点为根的子树就可以跳过，因为它的后代是从他上面读取 value。   

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

那这种情况下读取 context 又是怎样呢。首先是 prepareToReadContext。   

```ts
export function prepareToReadContext(
  workInProgress: Fiber,
  renderLanes: Lanes,
): void {
  // 指针
  // 为读取 context 做准备，首先设置必要指针
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
        // 当前 consumer 依赖的 provider 更新了
        // 因为虽然有 dep，但是可能它的 provider 没更新，那就没必要处理
        if (includesSomeLane(dependencies.lanes, renderLanes)) {
          // Context list has a pending update. Mark that this fiber performed work.
          markWorkInProgressReceivedUpdate();
        }
        // Reset the work-in-progress list
        // 这里不管怎么样，都会清空，应该是在 readContext 中重新设置
        dependencies.firstContext = null;
      }
    }
  }
}
```    


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

