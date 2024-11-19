## react-dom

<!-- TOC -->

- [react-dom](#react-dom)
  - [暴露接口](#暴露接口)
  - [render](#render)
  - [`createContainer`](#createcontainer)
  - [flushSync, updateContainer](#flushsync-updatecontainer)
  - [createRoot](#createroot)

<!-- /TOC -->

这一页先简单看下 react-dom 包内容。   

![dom](https://cdn.jsdelivr.net/gh/temple-deng/learning-repo/imgs/react-dom.png)

### 暴露接口   

先看下暴露的接口：   

```ts
export {
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  createPortal,
  createRoot,
  hydrateRoot,
  findDOMNode,
  flushSync,
  hydrate,
  render,
  unmountComponentAtNode,
  unstable_batchedUpdates,
  unstable_createEventHandle,
  unstable_flushControlled,
  unstable_isNewReconciler,
  unstable_renderSubtreeIntoContainer,
  unstable_runWithPriority,
  version,
} from './src/client/ReactDOM';
```   

分析一下：   

- `__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED`: 一个内部用对象，和 React 包的那个不是一个
- `createPortal`: 创建一个 ReactElement 对象，$$typeof 是 `REACT_PORTAL_TYPE` 类型，这里就给我们提了一个醒，不是所有的 ReactElement 都是 `REACT_ELEMENT_TYPE` 类型，同时还有一个 containerInfo 属性，保存 dom 元素，且没有 type 属性
- `createRoot`：新版的创建根的方法
- `findDOMNode`：估计是返回组件对应的 dom 元素，基本上就是对应 fiber.stateNode 属性
- `flushSync`: react-reconciler 包中的 flushSync 函数    

上线的先不看。   

先从旧版本的入口开始。   

### render   

`render, findDOMNode, unstable_renderSubtreeIntoContainer, unmountComponentAtNode` 都是 ReactDOMLegacy 文件中的内容。   

```ts
export function render(
  element: React$Element<any>,
  container: Container,
  callback: ?Function,
) {
  return legacyRenderSubtreeIntoContainer(
    null,
    element,
    container,
    false,
    callback,
  );
}
```    

仅直接调用了 `legacyRenderSubtreeIntoContainer`。而这个函数同时也暴露给了外部，从提示信息能看出，
这个 API 可能之前可以用来实现类似 portal 的功能。   

```ts
function legacyRenderSubtreeIntoContainer(
  parentComponent: ?React$Component<any, any>,   // 挂载的父组件
  children: ReactNodeList,  // 要渲染的 react 内容
  container: Container,     // DOM 元素容器
  forceHydrate: boolean,
  callback: ?Function,
) {
  const maybeRoot = container._reactRootContainer;  // 用来挂载 fiberRoot 的属性
  let root: FiberRoot;
  if (!maybeRoot) {
    // Initial mount
    root = legacyCreateRootFromDOMContainer(
      container,
      children,
      parentComponent,
      callback,
      forceHydrate,
    );
  } else {
    root = maybeRoot;
    if (typeof callback === 'function') {
      const originalCallback = callback;
      callback = function() {
        // instance 大概率是根组件实例
        const instance = getPublicRootInstance(root);
        originalCallback.call(instance);
      };
    }
    // Update
    updateContainer(children, root, parentComponent, callback);
  }
  return getPublicRootInstance(root);
}
```     

`unmountComponentAtNode` 也是调用了 `legacyRenderSubtreeIntoContainer` 只不过把 children 参数设为了 null。     

```ts
function legacyCreateRootFromDOMContainer(
  container: Container,
  initialChildren: ReactNodeList,
  parentComponent: ?React$Component<any, any>,
  callback: ?Function,
  isHydrationContainer: boolean,
): FiberRoot {
    // First clear any existing content.
    // 清空 dom 元素内容
    let rootSibling;
    while ((rootSibling = container.lastChild)) {
      container.removeChild(rootSibling);
    }

    const root = createContainer(
      container,
      LegacyRoot,
      null, // hydrationCallbacks
      false, // isStrictMode
      false, // concurrentUpdatesByDefaultOverride,
      '', // identifierPrefix
      noopOnRecoverableError, // onRecoverableError
      null, // transitionCallbacks
    );
    container._reactRootContainer = root;
    markContainerAsRoot(root.current, container);

    // 注册事件
    const rootContainerElement =
      container.nodeType === COMMENT_NODE ? container.parentNode : container;
    listenToAllSupportedEvents(rootContainerElement);

    // Initial mount should not be batched.
    flushSync(() => {
      updateContainer(initialChildren, root, parentComponent, callback);
    });

    return root;
}
```    

注意几个对象的来会引用。    

```ts
container._reactRootContainer = fiberRoot;
container.__reactContainer$ + randomKey = hostRootFiber;
// 在下面的 FiberRootNode 函数中还有
fiberRoot.containerInfo = container;
fiberRoot.current = hostRootFiber;
hostRootFiber.stateNode = fiberRoot;
```    

然后是关于 RootTag 的，目前只剩两种 RootTag 了：   

```ts
export type RootTag = 0 | 1;

export const LegacyRoot = 0;
export const ConcurrentRoot = 1;
```    

### `createContainer`    

话说为什么叫 `createContainer` 呢，明明是 createRoot 的功能吧，最终代码在 ReactFiberRoot 中。    

```ts
export function createContainer(
  containerInfo: Container,
  tag: RootTag,
  hydrationCallbacks: null | SuspenseHydrationCallbacks,
  isStrictMode: boolean,
  concurrentUpdatesByDefaultOverride: null | boolean,
  identifierPrefix: string,
  onRecoverableError: (error: mixed) => void,
  transitionCallbacks: null | TransitionTracingCallbacks,
): OpaqueRoot {
  const hydrate = false;
  const initialChildren = null;
  return createFiberRoot(
    containerInfo,
    tag,
    hydrate,
    initialChildren,
    hydrationCallbacks,
    isStrictMode,
    concurrentUpdatesByDefaultOverride,
    identifierPrefix,
    onRecoverableError,
    transitionCallbacks,
  );
}

export function createFiberRoot(
  containerInfo: any,
  tag: RootTag,
  hydrate: boolean,
  initialChildren: ReactNodeList,
  hydrationCallbacks: null | SuspenseHydrationCallbacks,
  isStrictMode: boolean,
  concurrentUpdatesByDefaultOverride: null | boolean,
  identifierPrefix: string,
  onRecoverableError: null | ((error: mixed) => void),
  transitionCallbacks: null | TransitionTracingCallbacks,
): FiberRoot {
  const root: FiberRoot = (new FiberRootNode(
    containerInfo,
    tag,
    hydrate,
    identifierPrefix,
    onRecoverableError,
  ) as any);

  // Cyclic construction. This cheats the type system right now because
  // stateNode is any.
  // 创建 hostRootfiber 节点
  const uninitializedFiber = createHostRootFiber(
    tag,
    isStrictMode,
    concurrentUpdatesByDefaultOverride,
  );
  root.current = uninitializedFiber;
  uninitializedFiber.stateNode = root;

  const initialState: RootState = {
    element: initialChildren,
    isDehydrated: hydrate,
    cache: (null as any), // not enabled yet
    transitions: null,
  };
  uninitializedFiber.memoizedState = initialState;

  // 在 hostRootFiber 上初始化一个 updateQueue
  initializeUpdateQueue(uninitializedFiber);

  return root;
}
```    

关于 fiber.mode 的，目前常用就基本这两种：   

```ts
export type TypeOfMode = number;

export const NoMode = /*                         */ 0b000000;
// TODO: Remove ConcurrentMode by reading from the root tag instead
export const ConcurrentMode = /*                 */ 0b000001;
```    

如果 fiberRoot.tag 是 ConcurrentRoot 就是 ConcurrentMode 否则就是 NoMode。    

进而最终走到了这一步：   

```ts
flushSync(() => {
  updateContainer(initialChildren, root, parentComponent, callback);
});
```     

所以到目前的流程是：`render() -> legacyRenderSubtreeIntoContainer -> legacyCreateRootFromDOMContainer -> createContainer -> createFiberRoot -> new FiberRootNode && createHostRootFiber`。   

创建完 root 后，在 `legacyCreateRootFromDOMContainer` 中 `updateContainer` 更新。     


### flushSync, updateContainer   

```ts
export function flushSync(fn) {
  // In legacy mode, we flush pending passive effects at the beginning of the
  // next event, not at the end of the previous one.
  if (
    rootWithPendingPassiveEffects !== null &&
    rootWithPendingPassiveEffects.tag === LegacyRoot &&
    (executionContext & (RenderContext | CommitContext)) === NoContext
  ) {
    flushPassiveEffects();
  }

  const prevExecutionContext = executionContext;
  executionContext |= BatchedContext;

  const prevTransition = ReactCurrentBatchConfig.transition;
  const previousPriority = getCurrentUpdatePriority();

  try {
    ReactCurrentBatchConfig.transition = null;
    setCurrentUpdatePriority(DiscreteEventPriority);
    if (fn) {
      return fn();
    } else {
      return undefined;
    }
  } finally {
    setCurrentUpdatePriority(previousPriority);
    ReactCurrentBatchConfig.transition = prevTransition;

    executionContext = prevExecutionContext;
    // Flush the immediate callbacks that were scheduled during this batch.
    // Note that this will happen even if batchedUpdates is higher up
    // the stack.
    // 这里应该是同步刷新的核心吧，在执行完回调后，立刻刷新，虽然还不清楚是刷新什么
    if ((executionContext & (RenderContext | CommitContext)) === NoContext) {
      flushSyncCallbacks();
    }
  }
}
```    

所以这个函数就是以 `BatchedContext` 和 `DiscreteEventPriority` 开始一个更新任务吧。    

首先因为我们要执行更新，目前就 4 种 Context，能用的就只有 `BatchedContext`，所以这里设置了
Context，其次，我们从优先级内容那里知道，所有的更新都来源与某个事件的触发，而由于这个函数是手动触发的，不是
来自与交互事件，因此这里手动设置了一个 event priority。然后开始执行回调。  

然后就是具体 `updateContainer` 的执行了。   

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

  // context = {}
  const context = getContextForSubtree(parentComponent);
  if (container.context === null) {
    container.context = context;
  } else {
    container.pendingContext = context;
  }

  // tag = UpdateState
  const update = createUpdate(eventTime, lane);
  update.payload = {element};

  callback = callback === undefined ? null : callback;
  if (callback !== null) {
    update.callback = callback;
  }

  enqueueUpdate(current, update, lane);
  const root = scheduleUpdateOnFiber(current, lane, eventTime);
  if (root !== null) {
    entangleTransitions(root, current, lane);
  }

  return lane;
}
```  

所以 `updateContainer` 其实就是获取更新的优先级，而更新的优先级依赖于触发更新的事件，然后有了更新优先级后，创建 update 对象，设置新的 state，推入 updateQueue.shared.pending 待处理更新队列中。然后调用 `scheduleUpdateOnFiber` 告诉 reconciler，我这个 fiber 节点有新的更新，你帮我调度处理一下。     

到底为止，基本上旧的应用初始化流程就到这了，我们看下新的。   

### createRoot

```tsx
function createRoot(
  container: Element | DocumentFragment,
  options?: CreateRootOptions,
): RootType {
  return createRootImpl(container, options);
}

// createRootImpl
export function createRoot(
  container: Element | DocumentFragment,
  options?: CreateRootOptions,
): RootType {
  if (!isValidContainer(container)) {
    throw new Error('createRoot(...): Target container is not a DOM element.');
  }

  let isStrictMode = false;
  let concurrentUpdatesByDefaultOverride = false;
  let identifierPrefix = '';
  let onRecoverableError = defaultOnRecoverableError;
  let transitionCallbacks = null;

  if (options !== null && options !== undefined) {
    if (options.unstable_strictMode === true) {
      isStrictMode = true;
    }
    if (
      allowConcurrentByDefault &&
      options.unstable_concurrentUpdatesByDefault === true
    ) {
      concurrentUpdatesByDefaultOverride = true;
    }
    if (options.identifierPrefix !== undefined) {
      identifierPrefix = options.identifierPrefix;
    }
    if (options.onRecoverableError !== undefined) {
      onRecoverableError = options.onRecoverableError;
    }
    if (options.transitionCallbacks !== undefined) {
      transitionCallbacks = options.transitionCallbacks;
    }
  }

  // 这个和旧版的是一样的
  const root = createContainer(
    container,
    ConcurrentRoot,
    null,
    isStrictMode,
    concurrentUpdatesByDefaultOverride,
    identifierPrefix,
    onRecoverableError,
    transitionCallbacks,
  );
  markContainerAsRoot(root.current, container);

  const rootContainerElement: Document | Element | DocumentFragment =
    container.nodeType === COMMENT_NODE
      ? (container.parentNode: any)
      : container;
  listenToAllSupportedEvents(rootContainerElement);

  return new ReactDOMRoot(root);
}

function ReactDOMRoot(internalRoot: FiberRoot) {
  this._internalRoot = internalRoot;
}

ReactDOMHydrationRoot.prototype.render = ReactDOMRoot.prototype.render = function(
  children: ReactNodeList,
): void {
  const root = this._internalRoot;
  if (root === null) {
    throw new Error('Cannot update an unmounted root.');
  }
  updateContainer(children, root, null, null);
};

ReactDOMHydrationRoot.prototype.unmount = ReactDOMRoot.prototype.unmount = function(): void {
  const root = this._internalRoot;
  if (root !== null) {
    this._internalRoot = null;
    const container = root.containerInfo;
    flushSync(() => {
      updateContainer(null, root, null, null);
    });
    unmarkContainerAsRoot(container);
  }
};
```    

所以和旧版不同的是，目前的流程是 `createRoot -> createRootImpl -> createContainer && new ReactDOMRoot` 然后 `ReactDOMRoot.render`。    

多了一个中间对象，`ReactDOMRoot` 对象。然后就是在 `createContainer` 时候传入的 RootTag 是 `ConcurrentRoot`，这会导致 FiberRootNode 的tag 变为 `ConcurrentRoot`，同时 hostRootFiber 的 mode 会变为 `ConcurrentMode`。    

然后另外一点要注意的是 `updateContainer` 时，没用 `flushSync` 包裹。   

也就是使用 `NoContext` 和 `NoLane` 的默认值开始了第一个更新。    