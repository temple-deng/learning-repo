## Hooks   

<!-- TOC -->

- [Hooks](#hooks)
  - [Dispatcher](#dispatcher)
  - [常见的 Hooks](#常见的-hooks)
    - [useContext](#usecontext)
    - [useState](#usestate)
    - [useReducer](#usereducer)
    - [useRef](#useref)
    - [useEffect](#useeffect)
    - [workLoop](#workloop)
  - [mount](#mount)
  - [renderWithHooks](#renderwithhooks)
  - [HooksDispatcherOnMount](#hooksdispatcheronmount)
    - [useState](#usestate-1)
    - [useRef](#useref-1)
    - [useEffect](#useeffect-1)
    - [flushPassiveEffects](#flushpassiveeffects)
    - [useLayoutEffect](#uselayouteffect)
  - [effect 对变量的访问](#effect-对变量的访问)
  - [更新](#更新)
    - [useState](#usestate-2)
    - [dispatchSetState](#dispatchsetstate)
    - [updateState](#updatestate)
    - [bailoutHooks](#bailouthooks)
    - [第3次](#第3次)
  - [lanes 和 alternate 的变动](#lanes-和-alternate-的变动)
  - [更新 effect](#更新-effect)

<!-- /TOC -->

这一章来看看 Hooks，貌似也是比较麻烦的东西。     

### Dispatcher   

首先看看 Dispatcher 的定义，这个东西虽然暂时不知道是什么，但是经常能见到。    

```ts
type BasicStateAction<S> = (S => S) | S;
type Dispatch<A> = A => void;

export type Dispatcher = {
  getCacheSignal?: () => AbortSignal,
  getCacheForType?: <T>(resourceType: () => T) => T,
  readContext<T>(context: ReactContext<T>): T,
  useState<S>(initialState: (() => S) | S): [S,
        Dispatch<BasicStateAction<S>>],
  useReducer<S, I, A>(
        reducer: (S, A) => S,
        initialArg: I,
        init?: (I) => S,
    ): [S, Dispatch<A>],
  useContext<T>(context: ReactContext<T>): T,
  useRef<T>(initialValue: T): {current: T},
  useEffect(
    create: () => (() => void) | void,
    deps: Array<mixed> | void | null,
  ): void,
  useInsertionEffect(
    create: () => (() => void) | void,
    deps: Array<mixed> | void | null,
  ): void,
  useLayoutEffect(
    create: () => (() => void) | void,
    deps: Array<mixed> | void | null,
  ): void,
  useCallback<T>(callback: T, deps: Array<mixed> | void | null): T,
  useMemo<T>(nextCreate: () => T, deps: Array<mixed> | void | null): T,
  useImperativeHandle<T>(
    ref: {current: T | null} | ((inst: T | null) => mixed) | null | void,
    create: () => T,
    deps: Array<mixed> | void | null,
  ): void,
  useDebugValue<T>(value: T, formatterFn: ?(value: T) => mixed): void,
  useDeferredValue<T>(value: T): T,
  useTransition(): [
    boolean,
    (callback: () => void, options?: StartTransitionOptions) => void,
  ],
  useMutableSource<Source, Snapshot>(
    source: MutableSource<Source>,
    getSnapshot: MutableSourceGetSnapshotFn<Source, Snapshot>,
    subscribe: MutableSourceSubscribeFn<Source, Snapshot>,
  ): Snapshot,
  useSyncExternalStore<T>(
    subscribe: (() => void) => () => void,
    getSnapshot: () => T,
    getServerSnapshot?: () => T,
  ): T,
  useId(): string,
  useCacheRefresh?: () => <T>(?() => T, ?T) => void,
  unstable_isNewReconciler?: boolean,
};

function resolveDispatcher() {
  // 所以就是返回了一个全局变量的属性，什么时候赋值的我们并不清楚
  const dispatcher = ReactCurrentDispatcher.current;
  return ((dispatcher as any) as Dispatcher);
}
```   

### 常见的 Hooks    

由于目前 dispatcher 具体的定义还没出现，所以这些 Hook 具体干了什么，现在还不能确定。   

#### useContext

```ts
export function useContext<T>(Context: ReactContext<T>): T {
  const dispatcher = resolveDispatcher();
  return dispatcher.useContext(Context);
}
```   

#### useState   

```ts
export function useState<S>(
  initialState: (() => S) | S,
): [S, Dispatch<BasicStateAction<S>>] {
  const dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
}
```   

#### useReducer

```ts
export function useReducer<S, I, A>(
  reducer: (S, A) => S,
  initialArg: I,
  init?: I => S,
): [S, Dispatch<A>] {
  const dispatcher = resolveDispatcher();
  return dispatcher.useReducer(reducer, initialArg, init);
}
```    

#### useRef

```ts
export function useRef<T>(initialValue: T): {|current: T|} {
  const dispatcher = resolveDispatcher();
  return dispatcher.useRef(initialValue);
}
```    

#### useEffect   

```ts
export function useEffect(
  create: () => (() => void) | void,
  deps: Array<mixed> | void | null,
): void {
  const dispatcher = resolveDispatcher();
  return dispatcher.useEffect(create, deps);
}

export function useLayoutEffect(
  create: () => (() => void) | void,
  deps: Array<mixed> | void | null,
): void {
  const dispatcher = resolveDispatcher();
  return dispatcher.useLayoutEffect(create, deps);
}

```    

其他的也类型，全部是委托到了 dispatcher 身上。    

#### workLoop   

对 dispatcher 的使用集中在 ReactFiberWorkLoop 和 ReactFiberHooks 中，我们先看 workLoop，因为一般 work 都是从这开始，这是起始的地方。    

首先是两个操作 dispatcher 栈的方法：   

```ts
function pushDispatcher() {
  const prevDispatcher = ReactCurrentDispatcher.current;
  ReactCurrentDispatcher.current = ContextOnlyDispatcher;
  if (prevDispatcher === null) {
    return ContextOnlyDispatcher;
  } else {
    return prevDispatcher;
  }
}

function popDispatcher(prevDispatcher) {
  ReactCurrentDispatcher.current = prevDispatcher;
}
```   

那这种方式除非我们不断的保存返回值，否则一般其实也就两个值之间来回切换。    

然后是在 `renderRootSync` 中一开始就有 `pushDispatcher` 的调用。然后在执行完 `workLoopSync` 后又会调用 `popDispatcher` 进行恢复。同理也出现在 `renderRootConcurrent`。    

根据我们的测试在第一次 `renderRootSync` 的时候 `ReactCurrentDispatcher.current` 是 `null`。   

那就是在进行 work 的时候，dispatcher 就是 `ContextOnlyDispatcher` 咯？    

此时这里对象是这样的。   

```ts
export const ContextOnlyDispatcher: Dispatcher = {
  readContext,

  useCallback: throwInvalidHookError,
  useContext: throwInvalidHookError,
  useEffect: throwInvalidHookError,
  useImperativeHandle: throwInvalidHookError,
  useInsertionEffect: throwInvalidHookError,
  useLayoutEffect: throwInvalidHookError,
  useMemo: throwInvalidHookError,
  useReducer: throwInvalidHookError,
  useRef: throwInvalidHookError,
  useState: throwInvalidHookError,
  useDebugValue: throwInvalidHookError,
  useDeferredValue: throwInvalidHookError,
  useTransition: throwInvalidHookError,
  useMutableSource: throwInvalidHookError,
  useSyncExternalStore: throwInvalidHookError,
  useId: throwInvalidHookError,

  unstable_isNewReconciler: enableNewReconciler,
};


function throwInvalidHookError() {
  throw new Error(
    'Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for' +
      ' one of the following reasons:\n' +
      '1. You might have mismatching versions of React and the renderer (such as React DOM)\n' +
      '2. You might be breaking the Rules of Hooks\n' +
      '3. You might have more than one copy of React in the same app\n' +
      'See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.',
  );
}
```   

所以显然这个是不太对，这里的 Context 个人感觉是 work 中的 EC。推断啊。    

然后改下我们直接的例子:   

```tsx
function App() {
  const [count, setCount] = useState(0);
  const handleClick = () => {
    setCount(count + 1);
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p onClick={handleClick}>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <div>{count}</div>
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
```    

然后就是 App 的 beginWork 了。    

### mount

```ts
function mountIndeterminateComponent(
  _current,
  workInProgress,
  Component,
  renderLanes,
) {
  const props = workInProgress.pendingProps;
  let context;
  const unmaskedContext = getUnmaskedContext(
      workInProgress,
      Component,
      false,
    );
  // 当前例子就空对象
  context = getMaskedContext(workInProgress, unmaskedContext);

  prepareToReadContext(workInProgress, renderLanes);
  let value;
  let hasId;

    value = renderWithHooks(
      null,
      workInProgress,
      Component,
      props,
      context,
      renderLanes,
    );
    hasId = checkDidRenderIdHook();

  // React DevTools reads this flag.
  workInProgress.flags |= PerformedWork;

  workInProgress.tag = FunctionComponent;
    reconcileChildren(null, workInProgress, value, renderLanes);
    return workInProgress.child;
}
```     

把没用的代码删了还是比较简单的。   

### renderWithHooks       

```ts
export function renderWithHooks<Props, SecondArg>(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: (p: Props, arg: SecondArg) => any,
  props: Props,
  secondArg: SecondArg,
  nextRenderLanes: Lanes,
): any {
  renderLanes = nextRenderLanes;
  currentlyRenderingFiber = workInProgress;

  // 这里这么大胆的吗，要注意这里对 state 和 queue 的重置
  workInProgress.memoizedState = null;
  workInProgress.updateQueue = null;
  workInProgress.lanes = NoLanes;

    // 这里直接修改了 dispatcher
    ReactCurrentDispatcher.current =
      current === null || current.memoizedState === null
        ? HooksDispatcherOnMount
        : HooksDispatcherOnUpdate;

  let children = Component(props, secondArg);

  // Check if there was a render phase update
  // 注意这个变量在 Component() 过程中可能会修改，如果在调用过程中有安排更新
  if (didScheduleRenderPhaseUpdateDuringThisPass) {
    // 测试的时候没走这个分支
    let numberOfReRenders: number = 0;
    do {
      didScheduleRenderPhaseUpdateDuringThisPass = false;
      localIdCounter = 0;

      if (numberOfReRenders >= RE_RENDER_LIMIT) {
        throw new Error(
          'Too many re-renders. React limits the number of renders to prevent ' +
            'an infinite loop.',
        );
      }
      numberOfReRenders += 1;
      currentHook = null;
      workInProgressHook = null;

      workInProgress.updateQueue = null;

      ReactCurrentDispatcher.current = __DEV__
        ? HooksDispatcherOnRerenderInDEV
        : HooksDispatcherOnRerender;

      children = Component(props, secondArg);
    } while (didScheduleRenderPhaseUpdateDuringThisPass);
  }

  // We can assume the previous dispatcher is always this one, since we set it
  // at the beginning of the render phase and there's no re-entrance.
  // 这里相当于又恢复了 dispatcher
  ReactCurrentDispatcher.current = ContextOnlyDispatcher;

  const didRenderTooFewHooks =
    currentHook !== null && currentHook.next !== null;

  renderLanes = NoLanes;
  currentlyRenderingFiber = (null as any);

  currentHook = null;
  workInProgressHook = null;

  didScheduleRenderPhaseUpdate = false;

  if (didRenderTooFewHooks) {
    throw new Error(
      'Rendered fewer hooks than expected. This may be caused by an accidental ' +
        'early return statement.',
    );
  }
  return children;
}
```    

核心基本上就这个：    

```ts
ReactCurrentDispatcher.current =
    current === null || current.memoizedState === null
    ? HooksDispatcherOnMount
    : HooksDispatcherOnUpdate;

let children = Component(props, secondArg);
```    

所以 renderWithHooks 首先是设置了一些本地的全局变量，然后重置了 wip 上的一些相关变量，然后最关键的是设置 dispatcher，
然后就是调用函数体生成后代，之后的话好像是一些全局变量的重置。   

那我们先看下 Hook 的基本数据结构和 `HooksDispatcherOnMount`。    

### HooksDispatcherOnMount   

```ts
const HooksDispatcherOnMount: Dispatcher = {
  readContext,

  useCallback: mountCallback,
  useContext: readContext,
  useEffect: mountEffect,
  useImperativeHandle: mountImperativeHandle,
  useLayoutEffect: mountLayoutEffect,
  useInsertionEffect: mountInsertionEffect,
  useMemo: mountMemo,
  useReducer: mountReducer,
  useRef: mountRef,
  useState: mountState,
  useDebugValue: mountDebugValue,
  useDeferredValue: mountDeferredValue,
  useTransition: mountTransition,
  useMutableSource: mountMutableSource,
  useSyncExternalStore: mountSyncExternalStore,
  useId: mountId,

  unstable_isNewReconciler: enableNewReconciler,
};
```    

dispatcher 对应的方法都是有规律的，这里 onMount 的都是 mount 开头，一会 onUpdate 就都是 update 开头。    

首先看下 Hook 相关的结构：    

```ts
// 这里和普通的 Update 对象还是有点区别的
type Update<S, A> = {
  lane: Lane,
  action: A,
  hasEagerState: boolean,
  eagerState: S | null,
  next: Update<S, A>,
};

export type UpdateQueue<S, A> = {
  pending: Update<S, A> | null,
  interleaved: Update<S, A> | null,
  lanes: Lanes,
  dispatch: (A => mixed) | null,
  lastRenderedReducer: ((S, A) => S) | null,
  lastRenderedState: S | null,
};

export type Hook = {
  memoizedState: any,
  baseState: any,
  baseQueue: Update<any, any> | null,
  queue: any,
  next: Hook | null,
};
```   

#### useState

先看一个简单的，`useState`。    

```ts
function mountState<S>(
  initialState: (() => S) | S,
): [S, Dispatch<BasicStateAction<S>>] {
  const hook = mountWorkInProgressHook();
  if (typeof initialState === 'function') {
    initialState = initialState();
  }
  hook.memoizedState = hook.baseState = initialState;
  const queue: UpdateQueue<S, BasicStateAction<S>> = {
    pending: null,
    interleaved: null,
    lanes: NoLanes,
    dispatch: null,
    // 这是个函数，暂时不用管
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: (initialState as any),
  };
  hook.queue = queue;
  // 这也返回了对象
  const dispatch: Dispatch<
    BasicStateAction<S>,
  > = (queue.dispatch = (dispatchSetState.bind(
    null,
    currentlyRenderingFiber,
    queue,
  ) as any));
  return [hook.memoizedState, dispatch];
}

// 所以这个函数就只有建立一个 hook 对象，挂载全局变量上，不过同时也改了 fiber 对象需要注意
// 所以函数的 memorizedState 是一个 Hook 的链表
function mountWorkInProgressHook(): Hook {
  const hook: Hook = {
    memoizedState: null,

    baseState: null,
    baseQueue: null,
    queue: null,

    next: null,
  };

  if (workInProgressHook === null) {
    // This is the first hook in the list
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
  } else {
    // Append to the end of the list
    // 单链表
    workInProgressHook = workInProgressHook.next = hook;
  }
  return workInProgressHook;
}
```     

所以 mountState 的功能大致如下：   

- 创建一个 Hook 对象，绑定到 memorizedState 链表中
- 然后在这个 Hook 对象上存储当前的 state 值
- 然后生成一个 updateQueue，并绑定到 hook.queue 属性上
- 最后计算一个 dispatch 方法   

这里如果我们有两个 state，调用两次 useState。之后的话，fiber 的 memorizedState 上会有一个包含两个 Hook
对象的链表，每个 Hook 分别记录了自己的 state 值，同时绑定了 queue，但注意这里 Hook 的 baseQueue 有什么用，我们还没接触到，最后绑定一个 dispatch 方法。   

那简单来说，useState 在第一次渲染的时候，基本上就是在 fiber 上建立对应的 hook 及 queue，并保存对应的 state.    

#### useRef

```ts
function mountRef<T>(initialValue: T): {current: T} {
  const hook = mountWorkInProgressHook();
   const ref = {current: initialValue};
    hook.memoizedState = ref;
    return ref;
}
```    

这个就简单了，连 queue 和 dispatch 什么的都没有。   

#### useEffect

```ts
function mountEffect(
  create: () => (() => void) | void,
  deps: Array<mixed> | void | null,
): void {
    return mountEffectImpl(
        PassiveEffect | PassiveStaticEffect,
        HookPassive,
        create,
        deps,
    );
}

function mountEffectImpl(fiberFlags, hookFlags, create, deps): void {
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  // 这里添加了 flags 
  currentlyRenderingFiber.flags |= fiberFlags;
  hook.memoizedState = pushEffect(
    HookHasEffect | hookFlags,
    create,
    undefined,
    nextDeps,
  );
}

function pushEffect(tag, create, destroy, deps) {
  const effect: Effect = {
    tag,
    create,
    destroy,
    deps,
    // Circular
    next: (null as any),
  };
  let componentUpdateQueue: null | FunctionComponentUpdateQueue = (currentlyRenderingFiber.updateQueue as any);
  // 这个 updateQueue 和别的地方的一样
  // lastEffect 指向的是最新插入的，而lastEffect.next 是最老的
  // 那一个，即队首
  if (componentUpdateQueue === null) {
    componentUpdateQueue = createFunctionComponentUpdateQueue();
    currentlyRenderingFiber.updateQueue = (componentUpdateQueue as any);
    componentUpdateQueue.lastEffect = effect.next = effect;
  } else {
    const lastEffect = componentUpdateQueue.lastEffect;
    if (lastEffect === null) {
      componentUpdateQueue.lastEffect = effect.next = effect;
    } else {
      const firstEffect = lastEffect.next;
      lastEffect.next = effect;
      effect.next = firstEffect;
      componentUpdateQueue.lastEffect = effect;
    }
  }
  return effect;
}

function createFunctionComponentUpdateQueue(): FunctionComponentUpdateQueue {
  return {
    lastEffect: null,
    stores: null,
  };
}
```   

所以 effect 的功能是：   

1. 创建 hook 对象，绑到 fiber 上
2. 创建 effect 对象，绑定到 hook.memorizedState 上，并绑定到 fiber.updateQueue 上
3. 修改 fiber.flags    

目前 beginWork 阶段只做了这些。那我们看下 commitRoot 这里，因为 completeWork 这什么都没做。   

在 commitRoot 中我们的工作开始前会有这么一段：   

```ts
  if (
    (finishedWork.subtreeFlags & PassiveMask) !== NoFlags ||
    (finishedWork.flags & PassiveMask) !== NoFlags
  ) {
    if (!rootDoesHavePassiveEffects) {
      rootDoesHavePassiveEffects = true;
      pendingPassiveEffectsRemainingLanes = remainingLanes;
      scheduleCallback(NormalSchedulerPriority, () => {
        flushPassiveEffects();
        // This render triggered passive effects: release the root cache pool
        // *after* passive effects fire to avoid freeing a cache pool that may
        // be referenced by a node in the tree (HostRoot, Cache boundary etc)
        return null;
      });
    }
  }
```    

这个我们暂时放着。因为是异步执行的，先看后面的。   

首先在 `commitBeforeMutationEffects` 中没有我们的任务。而 `commitMutationEffects` 中也没有。
更尴尬的是 `commitLayoutEffects` 中好像也没有。   

事实上貌似确实是异步执行了 `flushPassiveEffects`，并且看堆栈，调用链还挺长的，我们慢慢来。   

#### flushPassiveEffects

```ts
export function flushPassiveEffects(): boolean {
  // Returns whether passive effects were flushed.
  if (rootWithPendingPassiveEffects !== null) {
    // Cache the root since rootWithPendingPassiveEffects is cleared in
    // flushPassiveEffectsImpl
    // 这好像是 fiberRoot 啊
    const root = rootWithPendingPassiveEffects;
    // Cache and clear the remaining lanes flag; it must be reset since this
    // method can be called from various places, not always from commitRoot
    // where the remaining lanes are known
    const remainingLanes = pendingPassiveEffectsRemainingLanes;
    pendingPassiveEffectsRemainingLanes = NoLanes;

    const renderPriority = lanesToEventPriority(pendingPassiveEffectsLanes);
    const priority = lowerEventPriority(DefaultEventPriority, renderPriority);
    const prevTransition = ReactCurrentBatchConfig.transition;
    const previousPriority = getCurrentUpdatePriority();

    try {
      ReactCurrentBatchConfig.transition = null;
      setCurrentUpdatePriority(priority);
      return flushPassiveEffectsImpl();
    } finally {
      setCurrentUpdatePriority(previousPriority);
      ReactCurrentBatchConfig.transition = prevTransition;

      // Once passive effects have run for the tree - giving components a
      // chance to retain cache instances they use - release the pooled
      // cache at the root (if there is one)
      releaseRootPooledCache(root, remainingLanes);
    }
  }
  return false;
}
```   

核心应该是 `flushPassiveEffectsImpl`。   

```ts
function flushPassiveEffectsImpl() {
  if (rootWithPendingPassiveEffects === null) {
    return false;
  }

  const root = rootWithPendingPassiveEffects;
  const lanes = pendingPassiveEffectsLanes;
  rootWithPendingPassiveEffects = null;
  pendingPassiveEffectsLanes = NoLanes;

  const prevExecutionContext = executionContext;

  // 这里又陷入的了 CommitContext
  executionContext |= CommitContext;

  commitPassiveUnmountEffects(root.current);
  commitPassiveMountEffects(root, root.current);
  executionContext = prevExecutionContext;

  flushSyncCallbacks();

  // If additional passive effects were scheduled, increment a counter. If this
  // exceeds the limit, we'll fire a warning.
  nestedPassiveUpdateCount =
    rootWithPendingPassiveEffects === null ? 0 : nestedPassiveUpdateCount + 1;

  return true;
}
```   

又转换到了两个函数上 `commitPassiveUnmountEffects, commitPassiveMountEffects`。   

在第一个函数上，最终走到了:   

```ts
commitHookEffectListUnmount(
    HookPassive | HookHasEffect,
    finishedWork,
    finishedWork.return,
);
function commitHookEffectListUnmount(
  flags: HookFlags,
  finishedWork: Fiber,
  nearestMountedAncestor: Fiber | null,
) {
  const updateQueue: FunctionComponentUpdateQueue | null = (finishedWork.updateQueue as any);
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
  if (lastEffect !== null) {
    const firstEffect = lastEffect.next;
    let effect = firstEffect;
    do {
      if ((effect.tag & flags) === flags) {
        // Unmount
        const destroy = effect.destroy;
        effect.destroy = undefined;
        if (destroy !== undefined) {
          safelyCallDestroy(finishedWork, nearestMountedAncestor, destroy);
        }
      }
      effect = effect.next;
    } while (effect !== firstEffect);
  }
}
```   

看起来是卸载的 effect，但是有个问题啊，这个卸载不是每次更新前执行的吗。   

经过测试确实是 commit 后执行的 unmount 的回调，那我记错了？    

类似创建的：   

```ts
commitHookEffectListMount(HookPassive | HookHasEffect, finishedWork);

function commitHookEffectListMount(flags: HookFlags, finishedWork: Fiber) {
  const updateQueue: FunctionComponentUpdateQueue | null = (finishedWork.updateQueue as any);
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
  if (lastEffect !== null) {
    const firstEffect = lastEffect.next;
    let effect = firstEffect;
    do {
      if ((effect.tag & flags) === flags) {
        // Mount
        const create = effect.create;
        effect.destroy = create();
      }
      effect = effect.next;
    } while (effect !== firstEffect);
  }
}
```    

我们这里完整捋下流程。首先 renderWithHooks 时 `mountEffect`，在 fiber 上打上了 `Passive | PassiveStatic` flags，同时创建了 hook 和 effect，hook 的 memorizedState 设置的就是 effect，而
effect 上有 `HookHasEffect | HookPassive` 的 tag 同时保存了
create 和 deps 字段，同时在 fiber.updateQueue 上建立了一个循环列表。然后在 commitRoot 时，会记录到有 passive flag，从而调度了一个 `flushPassiveEffects` 的 task，然后在 commit 完了以后，进入这个函数流程，而这个函数主要就是干了两个事 `commitPassiveUnmountEffects` 和 `commitPassiveMountEffect`。   

而 `commitPassiveMounteffect` 会找到我们带有 Passive 的节点，执行 `commitHookEffectListMount`，这时候会遍历 fiber.updateQueue，然后从队首的 effect 开始调用。至少从这个流程来看，还没涉及到 deps 的内容。    

#### useLayoutEffect

```ts
function mountLayoutEffect(
  create: () => (() => void) | void,
  deps: Array<mixed> | void | null,
): void {
  let fiberFlags: Flags = UpdateEffect;
  return mountEffectImpl(fiberFlags, HookLayout, create, deps);
}
```   

目前看来 layoutEffect 和 effect 主要是 flags 上的不同：   

- fiber.flags
    + layoutEffect: `Update`
    + effect: `Passive`
- hook.tag:
    + layoutEffect: `HookLayout | HookHasEffect`
    + effect: `HookPassive | HookHasEffect`    

那这样很可能就会引发触发时机的不同了，因为变成了 Update 那就可能在
`commitMutationEffects` 和 `commitLayoutEffects` 中。   

首先是在 `commitMutationEffects` 中对有 Update 的组件有：   

```ts
switch (finishedWork.tag) {
    case FunctionComponent:
    case ForwardRef:
    case MemoComponent:
    case SimpleMemoComponent: {
      commitHookEffectListUnmount(
        HookInsertion | HookHasEffect,
        finishedWork,
        finishedWork.return,
      );
      commitHookEffectListMount(HookInsertion | HookHasEffect, finishedWork);
      // Layout effects are destroyed during the mutation phase so that all
      // destroy functions for all fibers are called before any create functions.
      // This prevents sibling component effects from interfering with each other,
      // e.g. a destroy function in one component should never override a ref set
      // by a create function in another component during the same commit.
      commitHookEffectListUnmount(
          HookLayout | HookHasEffect,
          finishedWork,
          finishedWork.return,
        );
      return;
    }
```    

背后执行的是同样的函数，但是为什么 `commitHookEffectListUnmount` 执行了两次。   

那首先 Layout 执行的时间要比 effect 早，在 commit 过程中就执行。   

另外就是需要注意的是执行的 hook 的 tag 是不同的，像我们的 layout effect 只在最后一次 unmount 中执行了。那就还有后半场。继续向下看。  

至于另一个 `HookInsertion | HookHasEffect` 是另一个 Hook 的 tag，与我们 layout 无关。   

然后在 `commitLayoutEffects` 中有   

```ts
commitHookEffectListMount(
    HookLayout | HookHasEffect,
    finishedWork,
);
```    

### effect 对变量的访问   

目前来看，effect 中对 state, props 的访问，都是在作用域链上，所以可以访问到，至于更新 state，我们后面再看。   


### 更新

接下来我们看看更新，还是分状态和 effct hook 分开看。   

#### useState

假设我们在事件回调中调用了 hook 的 `setState` 功能的东西。最后会调用绑定的 dispatch 方法，即 `dispatchSetState`。

#### dispatchSetState   

```ts
function dispatchSetState<S, A>(
  fiber: Fiber,
  queue: UpdateQueue<S, A>,
  action: A,  // 这第三个参数就是我们 setState 时的参数，那就可能是值或者一个函数
) {
  const lane = requestUpdateLane(fiber);

  const update: Update<S, A> = {
    lane,
    action,
    hasEagerState: false,
    eagerState: null,
    next: (null as any),
  };

  // 在我们这个例子是 false，要达成这个条件还是挺严格的，等同于在调用 Component 过程中触发 dispatch 方法 
  // 那感觉是不是只有 concurrent mode 才可  
  if (isRenderPhaseUpdate(fiber)) {
    enqueueRenderPhaseUpdate(queue, update);
  } else {
    // 相当于在当前 hook.queue 里面加个一个 update 对象
    // 和普通 class 的类似，也是通过 update 对象，但是这个对象
    // 不是推入到 fiber.updateQueue 了，而是 hook.queue.pending 了，那这时候还有 fiber.alternate 吗
    enqueueUpdate(fiber, queue, update, lane);

    // 经调试发现没有 alternate，符合猜测
    const alternate = fiber.alternate;
    // 这个条件很奇怪，感觉只有组件初次渲染后，第一次调用setstate 的时候会满足
    // 以及 alternate.lanes === NoLanes 的条件，反正就是要么之前是白板，要么之前就没更新
    if (
      fiber.lanes === NoLanes &&
      (alternate === null || alternate.lanes === NoLanes)
    ) {
      // The queue is currently empty, which means we can eagerly compute the
      // next state before entering the render phase. If the new state is the
      // same as the current state, we may be able to bail out entirely.
      // 虽然没看懂为什么，但很明显这里讲的是 bailOut 的故事
      // basicStateReducer
      const lastRenderedReducer = queue.lastRenderedReducer;
      if (lastRenderedReducer !== null) {
        let prevDispatcher;
        try {
          const currentState: S = (queue.lastRenderedState as any);
          // 这应该是计算了新的 state
          const eagerState = lastRenderedReducer(currentState, action);
          // Stash the eagerly computed state, and the reducer used to compute
          // it, on the update object. If the reducer hasn't changed by the
          // time we enter the render phase, then the eager state can be used
          // without calling the reducer again.

          // 这里 eagar 的意思应该是，我们普通的状态更新，状态的计算都是在 render 阶段里面
          // 而我们这里相当于在 render 前就计算一下，所以叫 eagerState
          update.hasEagerState = true;
          update.eagerState = eagerState;
          if (is(eagerState, currentState)) {
            // 如果状态没变，直接返回，但是需要注意的一点是
            // 虽然没有进行新的更新，但是 update 对象确实已经
            // 推入了 hook.queue，就像下面所说，后面可能
            // 别的更新仍然可能合入这个更新
            // Fast path. We can bail out without scheduling React to re-render.
            // It's still possible that we'll need to rebase this update later,
            // if the component re-renders for a different reason and by that
            // time the reducer has changed.
            return;
          }
        } catch (error) {
          // Suppress the error. It will throw again in the render phase.
        }
      }
    }

    // 如果不能直接 bailout，那就安排更新
    const eventTime = requestEventTime();
    const root = scheduleUpdateOnFiber(fiber, lane, eventTime);
  }
}

function isRenderPhaseUpdate(fiber: Fiber) {
  const alternate = fiber.alternate;
  return (
    fiber === currentlyRenderingFiber ||
    (alternate !== null && alternate === currentlyRenderingFiber)
  );
}

function basicStateReducer<S>(state: S, action: BasicStateAction<S>): S {
  return typeof action === 'function' ? action(state) : action;
}
```    

这里我们看下它干了什么：   

1. 新建一个 update 对象
2. 推入 hook.queue.pending 中
3. 提前计算新的 state，如果新的 state 和当前 state 一致，直接退出不更新
4. 否则 `scheduleUpdateOnFiber`     

那假设我们一个 count = 1，然后点击了以后连续3次 setCount(2)，这时候就走了正常更新，开始 beginWork。进入 App 的 beginWork 流程。走 updateFunctionComponent。    

```ts
function updateFunctionComponent(
  current,
  workInProgress,
  Component,
  nextProps: any,
  renderLanes,
) {
  let context;
    const unmaskedContext = getUnmaskedContext(workInProgress, Component, true);
    context = getMaskedContext(workInProgress, unmaskedContext);

  let nextChildren;
  let hasId;
  prepareToReadContext(workInProgress, renderLanes);
    nextChildren = renderWithHooks(
      current,
      workInProgress,
      Component,
      nextProps,
      context,
      renderLanes,
    );
    hasId = checkDidRenderIdHook();


  if (current !== null && !didReceiveUpdate) {
    bailoutHooks(current, workInProgress, renderLanes);
    return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
  }
  // React DevTools reads this flag.
  workInProgress.flags |= PerformedWork;
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}
```    

还是走 `renderWithHooks`，但是首先这次的 diapatcher 换了。   

```ts
const HooksDispatcherOnUpdate: Dispatcher = {
  readContext,

  useCallback: updateCallback,
  useContext: readContext,
  useEffect: updateEffect,
  useImperativeHandle: updateImperativeHandle,
  useInsertionEffect: updateInsertionEffect,
  useLayoutEffect: updateLayoutEffect,
  useMemo: updateMemo,
  useReducer: updateReducer,
  useRef: updateRef,
  useState: updateState,
  useDebugValue: updateDebugValue,
  useDeferredValue: updateDeferredValue,
  useTransition: updateTransition,
  useMutableSource: updateMutableSource,
  useSyncExternalStore: updateSyncExternalStore,
  useId: updateId,

  unstable_isNewReconciler: enableNewReconciler,
};
```       

然后执行函数。这时候会调用 `useState` 函数继续。进而触发 diapatcher 的 `updateState`，让我们先提前想一下，这个函数可能干什么，我们先看下我们现在有什么，首先 `fiber.memorizedState` 有一个 hook 列表，假设我们这个例子就 1 个 hook，那么这个列表就 1 个 hook，然后呢这个 hook.queue.pending 中有一个 update 对象，`update.action` 应该保存了我们新的 state 值。   

这仿佛就是我们所知道的一切，那我们如果要更新会做什么，首先我觉得是根据 `hook.memorizedState`，然后依次遍历 pending 队列，更新 state，最后将值保存到 hook 上，并返回。然后其中可能会像 `processUpdateQueue` 一样，穿插一些优先级 update 的东西。    

后面有时间可以比较一下和 `processUpdateQueue` 的代码。   

#### updateState    

```ts
function updateState<S>(
  initialState: (() => S) | S,
): [S, Dispatch<BasicStateAction<S>>] {
  return updateReducer(basicStateReducer, (initialState as any));
}

function updateWorkInProgressHook(): Hook {
  // This function is used both for updates and for re-renders triggered by a
  // render phase update. It assumes there is either a current hook we can
  // clone, or a work-in-progress hook from a previous render pass that we can
  // use as a base. When we reach the end of the base list, we must switch to
  // the dispatcher used for mounts.
  // nextCurrentHook 应该是当前要处理的这个 hook，这里就是找一下是那个
  // nextCurrentHook 即 current 上要处理的这个 hook，不停的靠 next 指针向后
  let nextCurrentHook: null | Hook;
  if (currentHook === null) {
    const current = currentlyRenderingFiber.alternate;
    if (current !== null) {
      nextCurrentHook = current.memoizedState;
    } else {
      nextCurrentHook = null;
    }
  } else {
    nextCurrentHook = currentHook.next;
  }

  // 但是这个又是干嘛，两个变量分别位于两个 fiber 上？
  // nextWorkInProgressHook 貌似是下个 hook，不是本次要处理的 hook
  // 因为 renderWithHooks 一开始清空了 wip.memorizedState，所以一般第一次走这个函数的话 next 是 null
  // 并且后面再调用一般也是 null
  let nextWorkInProgressHook: null | Hook;
  if (workInProgressHook === null) {
    nextWorkInProgressHook = currentlyRenderingFiber.memoizedState;
  } else {
    nextWorkInProgressHook = workInProgressHook.next;
  }

  // 所以上面这些，在第一次 setstate 的时候就是设置了两个指向
  // memorizedState 的变量
  if (nextWorkInProgressHook !== null) {
    // There's already a work-in-progress. Reuse it.
    workInProgressHook = nextWorkInProgressHook;
    nextWorkInProgressHook = workInProgressHook.next;

    currentHook = nextCurrentHook;
  } else {
    // Clone from the current hook.
    if (nextCurrentHook === null) {
      throw new Error('Rendered more hooks than during the previous render.');
    }

    // 从当前 hook 克隆一个 hook 到 wip 上
    currentHook = nextCurrentHook;

    const newHook: Hook = {
      memoizedState: currentHook.memoizedState,

      baseState: currentHook.baseState,
      baseQueue: currentHook.baseQueue,
      queue: currentHook.queue,

      next: null,
    };

    if (workInProgressHook === null) {
      // This is the first hook in the list.
      currentlyRenderingFiber.memoizedState = workInProgressHook = newHook;
    } else {
      // Append to the end of the list.
      workInProgressHook = workInProgressHook.next = newHook;
    }
  }

  // 综上来看，这个函数就是更新了一些全局的变量
  // workInProgressHook 和 currentHook
  return workInProgressHook;
}

function updateReducer<S, I, A>(
  reducer: (S, A) => S,
  initialArg: I,
  init?: I => S,
): [S, Dispatch<A>] {
  const hook = updateWorkInProgressHook();
  const queue = hook.queue;

  queue.lastRenderedReducer = reducer;

  const current: Hook = (currentHook as any);

  let baseQueue = current.baseQueue;

  // The last pending update that hasn't been processed yet.
  const pendingQueue = queue.pending;
  // 把 pending 合并到 base 中
  if (pendingQueue !== null) {
    // We have new updates that haven't been processed yet.
    // We'll add them to the base queue.
    if (baseQueue !== null) {
      // Merge the pending queue and the base queue.
      const baseFirst = baseQueue.next;
      const pendingFirst = pendingQueue.next;
      baseQueue.next = pendingFirst;
      pendingQueue.next = baseFirst;
    }
    current.baseQueue = baseQueue = pendingQueue;
    queue.pending = null;
  }

  // 这个应该类似 processUpdateQueue，比对了一下，大部分一致
  if (baseQueue !== null) {
    // We have a queue to process.
    const first = baseQueue.next;
    let newState = current.baseState;

    let newBaseState = null;
    let newBaseQueueFirst = null;
    let newBaseQueueLast = null;
    let update = first;
    do {
      const updateLane = update.lane;
      if (!isSubsetOfLanes(renderLanes, updateLane)) {
        // Priority is insufficient. Skip this update. If this is the first
        // skipped update, the previous update/state is the new base
        // update/state.
        const clone: Update<S, A> = {
          lane: updateLane,
          action: update.action,
          hasEagerState: update.hasEagerState,
          eagerState: update.eagerState,
          next: (null as any),
        };
        if (newBaseQueueLast === null) {
          newBaseQueueFirst = newBaseQueueLast = clone;
          newBaseState = newState;
        } else {
          newBaseQueueLast = newBaseQueueLast.next = clone;
        }
        // Update the remaining priority in the queue.
        // TODO: Don't need to accumulate this. Instead, we can remove
        // renderLanes from the original lanes.
        currentlyRenderingFiber.lanes = mergeLanes(
          currentlyRenderingFiber.lanes,
          updateLane,
        );
        markSkippedUpdateLanes(updateLane);
      } else {
        // This update does have sufficient priority.

        if (newBaseQueueLast !== null) {
          const clone: Update<S, A> = {
            lane: NoLane,
            action: update.action,
            hasEagerState: update.hasEagerState,
            eagerState: update.eagerState,
            next: (null as any),
          };
          newBaseQueueLast = newBaseQueueLast.next = clone;
        }

        // Process this update.
        if (update.hasEagerState) {
          // If this update is a state update (not a reducer) and was processed eagerly,
          // we can use the eagerly computed state
          newState = ((update.eagerState as any) as S);
        } else {
          const action = update.action;
          newState = reducer(newState, action);
        }
      }
      update = update.next;
    } while (update !== null && update !== first);

    if (newBaseQueueLast === null) {
      newBaseState = newState;
    } else {
      newBaseQueueLast.next = (newBaseQueueFirst as any);
    }

    // Mark that the fiber performed work, but only if the new state is
    // different from the current state.
    if (!is(newState, hook.memoizedState)) {
      // 状态不一致，标记 beginWork 中的 didReceiveUpdate变量
      markWorkInProgressReceivedUpdate();
    }

    hook.memoizedState = newState;
    hook.baseState = newBaseState;
    hook.baseQueue = newBaseQueueLast;

    queue.lastRenderedState = newState;
  }
  if (baseQueue === null) {
    // `queue.lanes` is used for entangling transitions. We can set it back to
    // zero once the queue is empty.
    queue.lanes = NoLanes;
  }

  const dispatch: Dispatch<A> = (queue.dispatch as any);
  // 返回新的 state
  return [hook.memoizedState, dispatch];
}
```    

差不多和我们想的一样，然后我们继续看 `updateFunctionComponent` 的后续部分：   

```ts
if (current !== null && !didReceiveUpdate) {
    bailoutHooks(current, workInProgress, renderLanes);
    return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
}
workInProgress.flags |= PerformedWork;
reconcileChildren(current, workInProgress, nextChildren, renderLanes);
return workInProgress.child;
```   

针对我们第一次设置 setCount(2) 的时候，是直接 reconcile 了。   

那我们看看第二次第三次会发生什么。   

```tsx
function Sub() {
  console.log('sub render');
  return <div>Sub</div>
}

function App() {
  const [count, setCount] = useState(0);
  const handleClick = () => {
    setCount(2);
  }
  console.log('App render');

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p onClick={handleClick}>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <Sub />
        <div>{count}</div>
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
```    

正常第一次渲染的时候打印了 App render, sub render，然后第一次点击后还是打印了 App render, sub render。   

然后我们第二次再点击，这里 eagerState 和 currentState 一致。这时候理论都不渲染了。但事实上还是打印出了 App render。    

我们看下问题出在了哪。

debugger 的时候发现这个条件并不满足 `if (fiber.lanes === NoLanes && (alternate === null || alternate.lanes === NoLanes))`，lanes 为 1，且 alternate 不为 null。从而还是
`scheduleUpdateOnFiber`。然后开始 work，我们先看下 App 的 beginWork，走了 `updateFunctionComponent`。而在这里有这样的一条：   

```ts
  if (current !== null && !didReceiveUpdate) {
    bailoutHooks(current, workInProgress, renderLanes);
    return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
  }
```   

即我们上面看过的，由于这时候 state 未变动，所以条件是成立的。那就看下具体看了什么。   

#### bailoutHooks    

```ts
export function bailoutHooks(
  current: Fiber,
  workInProgress: Fiber,
  lanes: Lanes,
) {
  workInProgress.updateQueue = current.updateQueue;
  // 状态没变，把 flags 移出，lanes 也移出
  workInProgress.flags &= ~(PassiveEffect | UpdateEffect);
  current.lanes = removeLanes(current.lanes, lanes);
}
```    

这时候直接 bailout，由于 childLanes 为空，直接返回 null 了。因此 Sub 不执行。   

#### 第3次

第3次点的时候 if 条件又符合，所以在 dispatch 中直接返回了。那么现在的问题就在于，fiber.lanes 和 fiber.alternate 如何变动的。以 App 为例，我们仔细看一下。    

### lanes 和 alternate 的变动     

首先初始 render，app fiber 是在 HostRoot 的 beginWork 中形成的。应该是 `reconcileSingleElement` 中但是创建的时候传入的 lanes 是 1。那这个 lanes 是来自 beginWork 的，再向上追溯。   

这里个人感觉应该是在 `renderRootSync` 时有 `prepareFreshStack` 处理的，我们看一下，因为这个 lane 是从 getNextLanes 得出的，进而在 requestUpdateLane 弄的，所以最终应该是个 SyncLane，即 1：    

```ts
function prepareFreshStack(root: FiberRoot, lanes: Lanes): Fiber {
  root.finishedWork = null;
  root.finishedLanes = NoLanes;

  const timeoutHandle = root.timeoutHandle;

  if (workInProgress !== null) {
    let interruptedWork = workInProgress.return;
    while (interruptedWork !== null) {
      const current = interruptedWork.alternate;
      unwindInterruptedWork(
        current,
        interruptedWork,
        workInProgressRootRenderLanes,
      );
      interruptedWork = interruptedWork.return;
    }
  }
  workInProgressRoot = root;
  const rootWorkInProgress = createWorkInProgress(root.current, null);
  workInProgress = rootWorkInProgress;
  // 这里很重要，这个 subtreeRenderLanes 就是传入本次 work 所有 beginWork 的 lanes。
  workInProgressRootRenderLanes = subtreeRenderLanes = workInProgressRootIncludedLanes = lanes;
  workInProgressRootExitStatus = RootInProgress;
  workInProgressRootFatalError = null;
  workInProgressRootSkippedLanes = NoLanes;
  workInProgressRootInterleavedUpdatedLanes = NoLanes;
  workInProgressRootRenderPhaseUpdatedLanes = NoLanes;
  workInProgressRootPingedLanes = NoLanes;
  workInProgressRootConcurrentErrors = null;
  workInProgressRootRecoverableErrors = null;

  return rootWorkInProgress;
}
```    

那首先想一下这是什么意思，本次 work 所有 beginWork 创建的新 fiber 节点的 lanes 都是 renderLanes？表明本次更新需要 work？倒是可以说的通。然后在 beginWork 中没见到有重置 lanes 的地方，那看下 completeWork。好像也没有，那看看 commitRoot。貌似也没有啊，那这里的 lanes 是不重要了吗。    

可是问题是打印出来的时候，lanes 都重置了，那哪里出了问题。    

打印看，初次渲染的 fiber 树上都都是 0，那上面的结论就是有问题的。    

首先看在 beginWork(app) 的时候，`workInProgress.lanes` 是为 1 的，但是记得在 switch 语句开始前有一句 `workInProgress.lanes = NoLanes;`。 应该就是这里重置了，OK，那就是这样，那渲染完，所以的 lanes 都重置了。   

那这时候我们触发一次 setCount 呢。   

这时候的 renderLanes 还是1。这一次 fiber.lanes 和 alternate 都为空。    

但是由于 state 前后不一致，走了 `scheduleUpdateOnFiber`。    

然后开始 work，首先是 HostRoot 的，可以 bailout，这时候 clonet fiber 了应该，然后 App 的 beginWork，然后又被上面的那句 `workInProgress.lanes = NoLanes;` 重置了应该。    

这时候看渲染完的东西，也是 lanes 等于0，但是这时候有了 alternate 属性都。    

那为什么会在第二次 setCount 的时候有 lanes 呢。    

我知道了，注意我们在 `mountState` 的时候，return dispatch 方法的时候，用了 bind，绑定了当时的 fiber 树，所以在 `dispatchSetState` 中的 fiber 都是第一次渲染时候的 fiber，你想啊，第一次渲染的时候，首先创建的 fiber 节点的 lanes 是 1，那感觉也不对啊，在第一次 app work 的时候，应该 beginWork 也重置了啊，debug 一下。   

debug 完第一次 mountState 绑定的 fiber.lanes 确实重置了，那再看下第一次 setCount，这时候 `dispatchSetState` 中的 fiber 和页面上使用的 fiber 是同一个，因此 lanes 也为 0。这时候触发
update。   

假设这时候的 app fiber 为 A，在 `scheduleUpdateOnFiber` 中会将 A 的 lanes 设置 1，然后开始 work，HostRoot 直接 bailout clone fibers，这时候会复制出一个 B，B 的 lanes 也是 1，然后不能 bailout，
这时候 B 的 lanes 会被重置就正常进行后面的 work，完成后，B 成为 current，A 是 alternate。   

然后第二次 setcount。在 `dispatchSetState` 中，这时候绑定的还是A，alternate 是B，A 的lanes 是 1，B的 lanes 是0，所以不走 if，还是
`scheduleUpdateOnFiber`。    

这时候就的看下 `cloneChildFibers` 了。    

假设最初渲染时，fiber(HostRoot) 是 A，初次渲染会创建一个 B，等渲染完成后，B 会成为 current，而 A 是 alternate，然后第一次更新的时候，在 prepareFreshWork 中会调用 `createWorkInProgress` 而这是 B 的 alternate 有值，所以会直接复用这个对象，这个时候，current 是 B，workInProgress 就是 A，渲染完成后，A 变成了 current，B 是 alternate。

```ts
export function cloneChildFibers(
  current: Fiber | null,
  workInProgress: Fiber,
): void {
  if (current !== null && workInProgress.child !== current.child) {
    throw new Error('Resuming work not yet implemented.');
  }

  if (workInProgress.child === null) {
    return;
  }

  // 这个 currentChild 应该是 B，但第二次 setcount的时候 B
  // 也被置为 1，然后本次重用 A
  let currentChild = workInProgress.child;
  let newChild = createWorkInProgress(currentChild, currentChild.pendingProps);
  workInProgress.child = newChild;

  newChild.return = workInProgress;
  while (currentChild.sibling !== null) {
    currentChild = currentChild.sibling;
    newChild = newChild.sibling = createWorkInProgress(
      currentChild,
      currentChild.pendingProps,
    );
    newChild.return = workInProgress;
  }
  newChild.sibling = null;
}
```    

有点头疼，绕晕了。   

现在 wip.child 应该是 A，这时候 A 在 beginWork 中又重置为 0，但 alternate 是 1。    

但是看结果的话 B 在渲染完也是 0，但是确实没找到哪里重置了。   

所以看到最后还是没明白，到底是怎么变化的 lanes。   


### 更新 effect

当更新 effect 的时候。   

```tsx
function App() {
  const [count, setCount] = useState(0);
  const handleClick = () => {
    setCount(2);
  }

  useEffect(() => {
    console.log('app use effect');
    return () => {
      console.log('app use effect destory')
    }
  })
  console.log('App render');

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p onClick={handleClick}>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <Sub />
        <div>{count}</div>
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
```    

第一次 setcount 的时候，就走到了 `updateEffect`。    

```ts
function updateEffect(
  create: () => (() => void) | void,
  deps: Array<mixed> | void | null,
): void {
  return updateEffectImpl(PassiveEffect, HookPassive, create, deps);
}

function updateEffectImpl(fiberFlags, hookFlags, create, deps): void {
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  let destroy = undefined;

  if (currentHook !== null) {
    const prevEffect = currentHook.memoizedState;
    destroy = prevEffect.destroy;
    if (nextDeps !== null) {
      const prevDeps = prevEffect.deps;
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        // 如果依赖没变，这个的 hook tag 会有变化，只有 Passive 了
        // 没有 HookHasEffect
        hook.memoizedState = pushEffect(hookFlags, create, destroy, nextDeps);
        return;
      }
    }
  }

  currentlyRenderingFiber.flags |= fiberFlags;

  hook.memoizedState = pushEffect(
    HookHasEffect | hookFlags,
    create,
    destroy,
    nextDeps,
  );
}

function areHookInputsEqual(
  nextDeps: Array<mixed>,
  prevDeps: Array<mixed> | null,
) {
  if (prevDeps === null) {
    return false;
  }
  for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    if (is(nextDeps[i], prevDeps[i])) {
      continue;
    }
    return false;
  }
  return true;
}
```   

这里就涉及到链表的操作了，因为我们这里相当于是第二个 Hook。   

那么首先 fiber.memorizedState 上有两个 hook。然后 updateQueue 上有一个 effect。    

这时候更新，首先是 state 调用了 `updateWorkInProgressHook`。然后是 effect，这里看看 effect 调用这个函数做了什么。   

基本上就是取到了当前 wip 的memorizedState 上的第二个 hook 对象。   

首先我们看没有依赖的情况下，没有依赖就不比较 deps，就有 HookHasEffect 的 tag。    

但是这里我们要注意的是，在 `renderWithHooks` 有这样一句 `workInProgress.updateQueue = null;` 所以会将 updateQueue 清空，
所以这里执行完 `pushEffect`，我们这里仍然只有一个 effect。   

然后就是 commit 阶段的 flush 了。没什么好说的。   

这里看下有依赖，同时依赖是相同的。这时候 hook 没有 `HookPassive` 的 tag 了。那就匹配不到，就不会执行。    
