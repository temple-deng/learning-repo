## beginWork

<!-- TOC -->

- [beginWork](#beginwork)
  - [beginWork(hostRoot)](#beginworkhostroot)
    - [updateHostRoot](#updatehostroot)
    - [processUpdateQueue](#processupdatequeue)
    - [getStateFromUpdate](#getstatefromupdate)
    - [reconcileChildren](#reconcilechildren)
    - [reconcileSingleElement](#reconcilesingleelement)
    - [delete](#delete)
    - [placeSingleChild](#placesinglechild)
    - [beginWork(HostRoot) 总结](#beginworkhostroot-总结)
  - [beginWork(App)](#beginworkapp)
    - [mountIndeterminateComponent](#mountindeterminatecomponent)
    - [mountChildFibers](#mountchildfibers)
  - [beginWork(div)](#beginworkdiv)
    - [useFiber](#usefiber)
  - [flags 总结](#flags-总结)
  - [beginWork(header)](#beginworkheader)
    - [reconcileChildrenArray](#reconcilechildrenarray)
    - [updateSlot](#updateslot)
    - [placeChild](#placechild)
    - [createChild](#createchild)
    - [reconcileChildrenArray 总结](#reconcilechildrenarray-总结)
    - [demo](#demo)
  - [beginWork(img)](#beginworkimg)
  - [beginWork(p)](#beginworkp)
  - [beginWork(HostText)](#beginworkhosttext)
  - [beginWork(code)](#beginworkcode)
  - [beginWork(HostText(and save to reload))](#beginworkhosttextand-save-to-reload)
  - [beginWork(a)](#beginworka)
  - [FunctionComponent](#functioncomponent)
    - [updateFunctionComponent](#updatefunctioncomponent)
  - [ClassComponent](#classcomponent)
    - [updateClassComponent](#updateclasscomponent)
    - [constructClassInstance](#constructclassinstance)
    - [mountClassInstance](#mountclassinstance)
    - [updateClassInstance](#updateclassinstance)
    - [finishClassComponent](#finishclasscomponent)
  - [总结](#总结)
  - [提前退出](#提前退出)
    - [attemptEarlyBailoutIfNoSchduledUpdate](#attemptearlybailoutifnoschduledupdate)
    - [bailoutOnAlreadyFinishedWork](#bailoutonalreadyfinishedwork)

<!-- /TOC -->

![beginWork](https://cdn.jsdelivr.net/gh/temple-deng/learning-repo/imgs/react-beginWork.png)

这一部分，我们具体看一下整个 beginWork 的各个工作。

以当前这段代码为例：

```tsx
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
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

### beginWork(hostRoot)

```ts
function beginWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes // 这个lanes严格来说是 subtreeRenderLanes，大部分情况下等同于 workInProgressRootRenderLanes
): Fiber | null {
  // 上面的内容暂时省略掉了，可以在第一次渲染.md 中找到
  // 所以走到这的话，意味着或者 fiber 上层有更新，需要被动更新，否则 fiber 自身触发了更新，主动更新
  // 总之就是不能直接复用之前的树，需要重新生成
  workInProgress.lanes = NoLanes;

  switch (workInProgress.tag) {
    case IndeterminateComponent: {
      return mountIndeterminateComponent(
        current,
        workInProgress,
        workInProgress.type,
        renderLanes
      );
    }
    case LazyComponent: {
      const elementType = workInProgress.elementType;
      return mountLazyComponent(
        current,
        workInProgress,
        elementType,
        renderLanes
      );
    }
    case FunctionComponent: {
      const Component = workInProgress.type;
      const unresolvedProps = workInProgress.pendingProps;
      const resolvedProps =
        workInProgress.elementType === Component
          ? unresolvedProps
          : resolveDefaultProps(Component, unresolvedProps);
      return updateFunctionComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
        renderLanes
      );
    }
    case ClassComponent: {
      const Component = workInProgress.type;
      const unresolvedProps = workInProgress.pendingProps;
      const resolvedProps =
        workInProgress.elementType === Component
          ? unresolvedProps
          : resolveDefaultProps(Component, unresolvedProps);
      return updateClassComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
        renderLanes
      );
    }
    case HostRoot:
      return updateHostRoot(current, workInProgress, renderLanes);
    case HostComponent:
      return updateHostComponent(current, workInProgress, renderLanes);
    case HostText:
      return updateHostText(current, workInProgress);
    case SuspenseComponent:
      return updateSuspenseComponent(current, workInProgress, renderLanes);
    case HostPortal:
      return updatePortalComponent(current, workInProgress, renderLanes);
    case ForwardRef: {
      const type = workInProgress.type;
      const unresolvedProps = workInProgress.pendingProps;
      const resolvedProps =
        workInProgress.elementType === type
          ? unresolvedProps
          : resolveDefaultProps(type, unresolvedProps);
      return updateForwardRef(
        current,
        workInProgress,
        type,
        resolvedProps,
        renderLanes
      );
    }
    case Fragment:
      return updateFragment(current, workInProgress, renderLanes);
    case Mode:
      return updateMode(current, workInProgress, renderLanes);
    case Profiler:
      return updateProfiler(current, workInProgress, renderLanes);
    case ContextProvider:
      return updateContextProvider(current, workInProgress, renderLanes);
    case ContextConsumer:
      return updateContextConsumer(current, workInProgress, renderLanes);
    case MemoComponent: {
      const type = workInProgress.type;
      const unresolvedProps = workInProgress.pendingProps;
      // Resolve outer props first, then resolve inner props.
      let resolvedProps = resolveDefaultProps(type, unresolvedProps);
      resolvedProps = resolveDefaultProps(type.type, resolvedProps);
      return updateMemoComponent(
        current,
        workInProgress,
        type,
        resolvedProps,
        renderLanes
      );
    }
    case SimpleMemoComponent: {
      return updateSimpleMemoComponent(
        current,
        workInProgress,
        workInProgress.type,
        workInProgress.pendingProps,
        renderLanes
      );
    }
    case IncompleteClassComponent: {
      const Component = workInProgress.type;
      const unresolvedProps = workInProgress.pendingProps;
      const resolvedProps =
        workInProgress.elementType === Component
          ? unresolvedProps
          : resolveDefaultProps(Component, unresolvedProps);
      return mountIncompleteClassComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
        renderLanes
      );
    }
    case SuspenseListComponent: {
      return updateSuspenseListComponent(current, workInProgress, renderLanes);
    }
    case ScopeComponent: {
      if (enableScopeAPI) {
        return updateScopeComponent(current, workInProgress, renderLanes);
      }
      break;
    }
    case OffscreenComponent: {
      return updateOffscreenComponent(current, workInProgress, renderLanes);
    }
    case LegacyHiddenComponent: {
      if (enableLegacyHidden) {
        return updateLegacyHiddenComponent(
          current,
          workInProgress,
          renderLanes
        );
      }
      break;
    }
    case CacheComponent: {
      if (enableCache) {
        return updateCacheComponent(current, workInProgress, renderLanes);
      }
      break;
    }
    case TracingMarkerComponent: {
      if (enableTransitionTracing) {
        return updateTracingMarkerComponent(
          current,
          workInProgress,
          renderLanes
        );
      }
      break;
    }
  }

  throw new Error(
    `Unknown unit of work tag (${workInProgress.tag}). This error is likely caused by a bug in ` +
      "React. Please file an issue."
  );
}
```

ReactFiberBeginWork 文件中，大部分的内容都是 updateXXX 函数的定义，即具体的不同 tag 的 fiber 节点如何更新。beginWork 基本上就是对外界的唯一接口。

#### updateHostRoot

```ts
function updateHostRoot(current, workInProgress, renderLanes) {
  // context 相关，@TODO
  pushHostRootContext(workInProgress);

  // 第一次渲染 current 的 pendingProps 为 null，这里也为 null
  const nextProps = workInProgress.pendingProps;
  // {element: null} 类似这样的，具体的内容是在 createFiberRoot 时生成的
  const prevState = workInProgress.memoizedState;
  const prevChildren = prevState.element;

  // 顾名思义，在 wip 上拷贝一份 updateQueue
  cloneUpdateQueue(current, workInProgress);
  // 处理 updateQueue，生成新的 state，对于 hostRoot 来说
  // 就是新的 state.element.
  processUpdateQueue(workInProgress, nextProps, null, renderLanes);

  const nextState: RootState = workInProgress.memoizedState;
  const root: FiberRoot = workInProgress.stateNode;

  // Caution: React DevTools currently depends on this property
  // being called "element".
  const nextChildren = nextState.element;
  if (nextChildren === prevChildren) {
    // 元素是同一个，可以复用之前的 fiber 节点
    return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
  }
  // 元素不同，调和算法
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}
```

我们想一下 hostRoot 一般什么时候更新，一般也就是在 `updateContainer` 的时候，那一般
也就是初始化应用，或者直接调用 `ReactDOM.render` or `ReactDOMRoot.render` 方法的
时候，这种情况下，能更新的其实就只有根应用元素，也因此 hostRoot 中 memorizedState 基本
上只有一个 element 字段，而 update.payload 也只有一个 element 字段。

所以理论上，updateHostRoot 也就是从 update 中拿到新的 element，然后生成对应的新的 fiber 节点。

所以整个功能就是：

1. `processUpdateQueue` 生成新的 state
2. 根据新的 state 判断是否可以直接复用
3. 不同复用的情况下，调用调和算法，根据 element 生成的新的子 fiber 节点

针对第一次渲染就是走调和算法生成新的子 fiber 节点。

#### processUpdateQueue

这个函数之前在哪个部分好像写过的，这个函数大致的功能就是首先把 shared.pending 的队列，添加到 baseUpdate 链表的最后，shared 的含义估计是 current 和 wip 是共享的同一个队列，而 pending 意味着下一次 work 的更新，这样处理完后，所有的 update 就在 base 队列，然后遍历这个队列，
来生成新的 state，这也是我们 update 的含义，update 就是触发了 state 的更新，而处理 state
的过程，即生成新的 state 的过程，而我们新的 fiber 树也是根据新的 state 生成的。

这里需要注意的一点是，遍历的过程中，base 队列中优先级不够的 update 会被跳过，只有优先级够的 update 才会执行，优先级不够的 update 会留在 base 队列，等待以后的调度处理。

具体可以看 对象与流程.md

```ts
export type UpdateQueue<State> = {
  baseState: State;
  firstBaseUpdate: Update<State> | null;
  lastBaseUpdate: Update<State> | null;
  shared: SharedQueue<State>;
  effects: Array<Update<State>> | null;
};
```

```ts
export function processUpdateQueue<State>(
  workInProgress: Fiber,
  props: any,
  instance: any,
  renderLanes: Lanes,
): void {
  // This is always non-null on a ClassComponent or HostRoot
  const queue: UpdateQueue<State> = (workInProgress.updateQueue as any);

  hasForceUpdate = false;

  let firstBaseUpdate = queue.firstBaseUpdate;
  let lastBaseUpdate = queue.lastBaseUpdate;

  // Check if there are pending updates. If so, transfer them to the base queue.
  let pendingQueue = queue.shared.pending;
  if (pendingQueue !== null) {
    queue.shared.pending = null;

    // The pending queue is circular. Disconnect the pointer between first
    // and last so that it's non-circular.
    const lastPendingUpdate = pendingQueue;
    const firstPendingUpdate = lastPendingUpdate.next;
    lastPendingUpdate.next = null;
    // Append pending updates to base queue
    if (lastBaseUpdate === null) {
      firstBaseUpdate = firstPendingUpdate;
    } else {
      lastBaseUpdate.next = firstPendingUpdate;
    }
    lastBaseUpdate = lastPendingUpdate;

    // If there's a current queue, and it's different from the base queue, then
    // we need to transfer the updates to that queue, too. Because the base
    // queue is a singly-linked list with no cycles, we can append to both
    // lists and take advantage of structural sharing.
    // TODO: Pass `current` as argument
    const current = workInProgress.alternate;
    if (current !== null) {
      // This is always non-null on a ClassComponent or HostRoot
      const currentQueue: UpdateQueue<State> = (current.updateQueue as any);
      const currentLastBaseUpdate = currentQueue.lastBaseUpdate;
      if (currentLastBaseUpdate !== lastBaseUpdate) {
        if (currentLastBaseUpdate === null) {
          currentQueue.firstBaseUpdate = firstPendingUpdate;
        } else {
          currentLastBaseUpdate.next = firstPendingUpdate;
        }
        currentQueue.lastBaseUpdate = lastPendingUpdate;
      }
    }
  }
  // 上面部分就是把 pending 队列添加到 base 队列后面

  // These values may change as we process the queue.
  if (firstBaseUpdate !== null) {
    // Iterate through the list of updates to compute the result.
    let newState = queue.baseState;
    // TODO: Don't need to accumulate this. Instead, we can remove renderLanes
    // from the original lanes.
    let newLanes = NoLanes;

    let newBaseState = null;
    let newFirstBaseUpdate = null;
    let newLastBaseUpdate = null;

    let update = firstBaseUpdate;
    do {
      const updateLane = update.lane;
      const updateEventTime = update.eventTime;
      if (!isSubsetOfLanes(renderLanes, updateLane)) {
        // update 优先级不够的情况
        // Priority is insufficient. Skip this update. If this is the first
        // skipped update, the previous update/state is the new base
        // update/state.
        const clone: Update<State> = {
          eventTime: updateEventTime,
          lane: updateLane,

          tag: update.tag,
          payload: update.payload,
          callback: update.callback,

          next: null,
        };
        if (newLastBaseUpdate === null) {
          newFirstBaseUpdate = newLastBaseUpdate = clone;
          // 记录遇到第一次优先级不够的 update 时已经算出来的 state
          newBaseState = newState;
        } else {
          newLastBaseUpdate = newLastBaseUpdate.next = clone;
        }
        // Update the remaining priority in the queue.
        // 跳过的 update.lane 要记下来，作为下次的 wip.lanes
        newLanes = mergeLanes(newLanes, updateLane);
      } else {
        // This update does have sufficient priority.
        // 优先级不足后面所有的 update 都要保留
        if (newLastBaseUpdate !== null) {
          const clone: Update<State> = {
            eventTime: updateEventTime,
            // This update is going to be committed so we never want uncommit
            // it. Using NoLane works because 0 is a subset of all bitmasks, so
            // this will never be skipped by the check above.
            // 注意这里，update.lane 被重置了
            lane: NoLane,

            tag: update.tag,
            payload: update.payload,
            callback: update.callback,

            next: null,
          };
          newLastBaseUpdate = newLastBaseUpdate.next = clone;
        }

        // Process this update.
        newState = getStateFromUpdate(
          workInProgress,
          queue,
          update,
          newState,
          props,
          instance,
        );
        const callback = update.callback;
        if (
          callback !== null &&
          // If the update was already committed, we should not queue its
          // callback again.
          // 这个 update 是之前的 render 就处理过的
          // 但这里有个问题啊，意思是高优先级的回调会先执行
          // 但是 state 的更新可能放在后面的 render 中
          // 看最后会有解释
          update.lane !== NoLane
        ) {
          workInProgress.flags |= Callback;
          const effects = queue.effects;
          if (effects === null) {
            queue.effects = [update];
          } else {
            effects.push(update);
          }
        }
      }
      update = update.next;
      if (update === null) {
        pendingQueue = queue.shared.pending;
        if (pendingQueue === null) {
          // 都处理完了
          break;
        } else {
          // 处理 update 的过程中，生成了新的 update
          // An update was scheduled from inside a reducer. Add the new
          // pending updates to the end of the list and keep processing.
          const lastPendingUpdate = pendingQueue;
          // Intentionally unsound. Pending updates form a circular list, but we
          // unravel them when transferring them to the base queue.
          const firstPendingUpdate = ((lastPendingUpdate.next as any) as Update<State>);
          lastPendingUpdate.next = null;
          update = firstPendingUpdate;
          queue.lastBaseUpdate = lastPendingUpdate;
          queue.shared.pending = null;
        }
      }
    } while (true);

    if (newLastBaseUpdate === null) {
      newBaseState = newState;
    }

    queue.baseState = ((newBaseState as any)as State);
    queue.firstBaseUpdate = newFirstBaseUpdate;
    queue.lastBaseUpdate = newLastBaseUpdate;

    // Interleaved updates are stored on a separate queue. We aren't going to
    // process them during this render, but we do need to track which lanes
    // are remaining.
    const lastInterleaved = queue.shared.interleaved;
    if (lastInterleaved !== null) {
      let interleaved = lastInterleaved;
      do {
        newLanes = mergeLanes(newLanes, interleaved.lane);
        interleaved = ((interleaved as any).next: Update<State>);
      } while (interleaved !== lastInterleaved);
    } else if (firstBaseUpdate === null) {
      // `queue.lanes` is used for entangling transitions. We can set it back to
      // zero once the queue is empty.
      queue.shared.lanes = NoLanes;
    }

    // Set the remaining expiration time to be whatever is remaining in the queue.
    // This should be fine because the only two other things that contribute to
    // expiration time are props and context. We're already in the middle of the
    // begin phase by the time we start processing the queue, so we've already
    // dealt with the props. Context in components that specify
    // shouldComponentUpdate is tricky; but we'll have to account for
    // that regardless.
    // 把跳过的 lanes 放到 wipRootSkippedLanes 中
    markSkippedUpdateLanes(newLanes);
    workInProgress.lanes = newLanes;

    // 等一下，这里用了 newState，注意
    workInProgress.memoizedState = newState;
  }
}
```

需要格外注意的一点是最后的这里 `workInProgress.memoizedState = newState;`，所以 memorizedState 用了事实上生成的 state，也难怪 callback 不会放入 effects 中了，而 baseState 是为了新的低优先级的 state 的顺序没问题。

#### getStateFromUpdate

`updateHostRoot` 的 update.tag 是 updateState。

即根据不同 tag 的 update 计算新的 state

```ts
function getStateFromUpdate<State>(
  workInProgress: Fiber,
  queue: UpdateQueue<State>,
  update: Update<State>,
  prevState: State,
  nextProps: any,
  instance: any
): any {
  switch (update.tag) {
    case ReplaceState: {
      const payload = update.payload;
      if (typeof payload === "function") {
        // Updater function
        const nextState = payload.call(instance, prevState, nextProps);
        return nextState;
      }
      // State object
      return payload;
    }
    case CaptureUpdate: {
      workInProgress.flags =
        (workInProgress.flags & ~ShouldCapture) | DidCapture;
    }
    // Intentional fallthrough
    // 这里也是个关键，即 state 的更新过程
    case UpdateState: {
      const payload = update.payload;
      let partialState;
      if (typeof payload === "function") {
        // Updater function
        partialState = payload.call(instance, prevState, nextProps);
      } else {
        // Partial state object
        partialState = payload;
      }
      if (partialState === null || partialState === undefined) {
        // Null and undefined are treated as no-ops.
        return prevState;
      }
      // Merge the partial state and the previous state.
      return assign({}, prevState, partialState);
    }
    case ForceUpdate: {
      hasForceUpdate = true;
      return prevState;
    }
  }
  return prevState;
}
```

#### reconcileChildren

```ts
function reconcileChildren(
  current: Fiber | null,
  workInProgress: Fiber,
  nextChildren: any,
  renderLanes: Lanes
) {
  if (current === null) {
    // 当前的 fiber 节点是新创建的，没有对应的旧节点
    // 那它的所有子节点直接挂载就好，只记录根的副作用即可
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,
      renderLanes
    );
  } else {
    // 当前的 fiber 节点有对应的旧节点，需要仔细比较记录所有的
    // 子节点副作用
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren,
      renderLanes
    );
  }
}
```

`mountChildFibers` 与 `reconcileChildFibers` 的区别其实只在一个 `shouldTrackSideEffects` 变量，`mountChildFiber` 的 `shouldTrackSideEffects` 是 false，因为追踪他们的父 fiber 节点即可，因为他们的父 fiber 节点是新挂载的。

而背后实际的函数是这个：

```ts
// 首先我们要明白一点的是，调和算法的输入是旧的 fiber 节点和新的
// reactElement，两者相比较，得出节点间的变动
function reconcileChildFibers(
  returnFiber: Fiber, // parentFiber
  currentFirstChild: Fiber | null, // oldFiber
  newChild: any, // newReactElement
  lanes: Lanes
): Fiber | null {
  // Handle top level unkeyed fragments as if they were arrays.
  // This leads to an ambiguity between <>{[...]}</> and <>...</>.
  // We treat the ambiguous cases above the same.
  const isUnkeyedTopLevelFragment =
    typeof newChild === "object" &&
    newChild !== null &&
    newChild.type === REACT_FRAGMENT_TYPE &&
    newChild.key === null;
  if (isUnkeyedTopLevelFragment) {
    newChild = newChild.props.children;
  }

  // Handle object types
  if (typeof newChild === "object" && newChild !== null) {
    switch (newChild.$$typeof) {
      case REACT_ELEMENT_TYPE:
        return placeSingleChild(
          reconcileSingleElement(
            returnFiber,
            currentFirstChild,
            newChild,
            lanes
          )
        );
      case REACT_PORTAL_TYPE:
        return placeSingleChild(
          reconcileSinglePortal(returnFiber, currentFirstChild, newChild, lanes)
        );
      case REACT_LAZY_TYPE:
        if (enableLazyElements) {
          const payload = newChild._payload;
          const init = newChild._init;
          // TODO: This function is supposed to be non-recursive.
          return reconcileChildFibers(
            returnFiber,
            currentFirstChild,
            init(payload),
            lanes
          );
        }
    }

    if (isArray(newChild)) {
      return reconcileChildrenArray(
        returnFiber,
        currentFirstChild,
        newChild,
        lanes
      );
    }

    if (getIteratorFn(newChild)) {
      return reconcileChildrenIterator(
        returnFiber,
        currentFirstChild,
        newChild,
        lanes
      );
    }

    throwOnInvalidObjectType(returnFiber, newChild);
  }

  if (
    (typeof newChild === "string" && newChild !== "") ||
    typeof newChild === "number"
  ) {
    return placeSingleChild(
      reconcileSingleTextNode(
        returnFiber,
        currentFirstChild,
        "" + newChild,
        lanes
      )
    );
  }

  // Remaining cases are all treated as empty.
  return deleteRemainingChildren(returnFiber, currentFirstChild);
}
```

而这段代码，即根据不同的 element 类型，调用不同种类的调和算法，生成新的 fiber 节点。

#### reconcileSingleElement

```ts
function reconcileSingleElement(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  element: ReactElement,
  lanes: Lanes
): Fiber {
  const key = element.key;
  let child = currentFirstChild;

  // 有对应的旧节点
  while (child !== null) {
    if (child.key === key) {
      // key 相同
      const elementType = element.type;
      if (elementType === REACT_FRAGMENT_TYPE) {
        // 走到这个分支意思是 element 是有 key 的 REACT_FRAGMENT_TYPE 吧
        // 这个先略，后面再看 @TODO
        if (child.tag === Fragment) {
          deleteRemainingChildren(returnFiber, child.sibling);
          const existing = useFiber(child, element.props.children);
          existing.return = returnFiber;
          return existing;
        }
      } else {
        if (
          child.elementType === elementType ||
          // Lazy types should reconcile their resolved type.
          // We need to do this after the Hot Reloading check above,
          // because hot reloading has different semantics than prod because
          // it doesn't resuspend. So we can't let the call below suspend.
          (enableLazyElements &&
            typeof elementType === "object" &&
            elementType !== null &&
            elementType.$$typeof === REACT_LAZY_TYPE &&
            resolveLazy(elementType) === child.type)
        ) {
          // key 相同，前后类型也相同
          // 删除旧的兄弟 fiber 节点
          deleteRemainingChildren(returnFiber, child.sibling);
          const existing = useFiber(child, element.props);
          existing.ref = coerceRef(returnFiber, child, element);
          existing.return = returnFiber;
          return existing;
        }
      }
      // Didn't match.
      // 虽然 key 相同，但类型不匹配，删除旧的 fiber 节点
      deleteRemainingChildren(returnFiber, child);
      break;
    } else {
      deleteChild(returnFiber, child);
    }
    child = child.sibling;
  }

  // 未找到 key 相同且 type 相同的节点，即 element 是新的节点，此时旧的节点已删除
  if (element.type === REACT_FRAGMENT_TYPE) {
    const created = createFiberFromFragment(
      element.props.children,
      returnFiber.mode,
      lanes,
      element.key
    );
    created.return = returnFiber;
    return created;
  } else {
    const created = createFiberFromElement(element, returnFiber.mode, lanes);
    // 这个貌似是对 ref 属性进行检查，避免一些错误的用法，然后返回处理后的 ref
    created.ref = coerceRef(returnFiber, currentFirstChild, element);
    created.return = returnFiber;
    return created;
  }
}
```

由于当前新的 element 是个单节点，所以我们要做的就是，删除旧的多余的兄弟节点，添加/复用当前 element 对应的节点。

所以整个流程是：

1. 递归遍历所有旧 fiber 的同层节点，首先看有没有 key 和当前 element 相同的
   1. 如果 key 相同，比较 type 是否相同，如果相同就删除后续兄弟节点，返回当前 fiber 节点，跳出循环
   2. key 不同，删除当前的节点，处理下一个兄弟节点
2. 如果未找到对应的旧 fiber 节点，就根据 element 创建新的 fiber 节点并返回

#### delete

delete 的内容很简单。就是把删除节点放到父 fiber 的 deletions 里面，并打上对应的 tag。

```ts
function deleteChild(returnFiber: Fiber, childToDelete: Fiber): void {
  if (!shouldTrackSideEffects) {
    return;
  }
  const deletions = returnFiber.deletions;
  if (deletions === null) {
    returnFiber.deletions = [childToDelete];
    returnFiber.flags |= ChildDeletion;
  } else {
    deletions.push(childToDelete);
  }
}

function deleteRemainingChildren(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null
): null {
  if (!shouldTrackSideEffects) {
    return null;
  }
  let childToDelete = currentFirstChild;
  while (childToDelete !== null) {
    deleteChild(returnFiber, childToDelete);
    childToDelete = childToDelete.sibling;
  }
  return null;
}
```

#### placeSingleChild

```ts
function placeSingleChild(newFiber: Fiber): Fiber {
  // This is simpler for the single child case. We only need to do a
  // placement for inserting new children.
  if (shouldTrackSideEffects && newFiber.alternate === null) {
    newFiber.flags |= Placement;
  }
  return newFiber;
}
```

#### beginWork(HostRoot) 总结

简单看一下，beginWork(HostRoot) 都做了什么，首先 beginWork 即根据
当前的 fiber 节点，处理当前节点有的更新，然后更新当前 fiber 节点的状态，
同时会根据新的状态，生成新的后代 fiber 节点。

所以我们看到，在 beginWork 中，调用了 updateXXX 了，去进行几点的更新。

而对于 hostRoot 节点，能做的更新就是其根节点元素的更新，所以在 `updateHostRoot` 中就处理了 updateQueue 求出了最新的根 element。

然后进行 reconcile 处理后代节点，而由于 hostRoot fiber 是有对应的旧 fiber 的，所以对于其后代来说，需要记录副作用，所以调用了 `reconcileChildFibers` 而不是 `mountChildFibers`。

而由于根节点是个单节点，所以最后是由单节点调和算法 `reconcileSingleElement` 来求新的 fiber 节点，在 `reconcileSingleElement` 中，由于我们的目标是得出新的单 element 的 fiber 节点，所以需要取旧的父 fiber 节点的所有子 fiber 节点进行比对，如果有和新 element 匹配的节点，那就是 fiber 节点的更新，返回这个 fiber 节点，否则就删除所有旧的 fiber 节点，新建新的 fiber 节点。

整个的流程就是：

1. `beginWork(hostRoot)`
2. `updateHostRoot`
   1. `processUpdateQueue`
   2. `reconcileChildren`
      1. reconcileChildFibers
      2. reconcileSingleElement
      3. placeSingleChild

最后得到了根节点的 fiber 节点，此时的话 fiber(App) 上有 `Placement` 的 tag。

### beginWork(App)

此时对于 fiber(App) 来说，其 `tag === IndeterminateComponent`，因此在 beginWork 中，调用了

```ts
return mountIndeterminateComponent(
  current,
  workInProgress,
  workInProgress.type,
  renderLanes
);
```

这个很特殊哦，我奇怪的是，在创建对应 fiber 的时候为什么要先给他分配`IndeterminateComponent` 的 tag。而且这里就导致调用的不是 updateXXX 的函数。

#### mountIndeterminateComponent

这个函数还挺复杂的，按理论上来说，对于这样的组件，应该是先分辨出具体的类型，然后交由对应类型的 updateXXX 函数处理。但具体是不是这样做的，需要看一下代码

```ts
function mountIndeterminateComponent(
  _current,
  workInProgress,
  Component,
  renderLanes
) {
  if (_current !== null) {
    // An indeterminate component only mounts if it suspended inside a non-
    // concurrent tree, in an inconsistent state. We want to treat it like
    // a new mount, even though an empty version of it already committed.
    // Disconnect the alternate pointers.
    _current.alternate = null;
    workInProgress.alternate = null;
    // Since this is conceptually a new fiber, schedule a Placement effect
    workInProgress.flags |= Placement;
  }

  const props = workInProgress.pendingProps;
  let context;
  if (!disableLegacyContext) {
    const unmaskedContext = getUnmaskedContext(
      workInProgress,
      Component,
      false
    );
    context = getMaskedContext(workInProgress, unmaskedContext);
  }

  prepareToReadContext(workInProgress, renderLanes);

  // 前面应该都是一些 context 内容，先不管 @TODO
  let value;
  let hasId;

  // 这里直接调用好像和 hooks 相关的内容不是确定是 functional？
  // 这个函数的具体内容后面再看，大致内容好像就是调用 Component 生成后代 element，然后返回
  // 但是有个问题啊，首先如果是类组件，在 createFiberFromTypeAndProps 的时候就排除掉了
  // 这里就不可能是类组件
  // 同时如果是es6的类组件，是不能不带 new 的方式调用的啊
  value = renderWithHooks(
    null,
    workInProgress,
    Component,
    props,
    context,
    renderLanes
  );
  hasId = checkDidRenderIdHook();

  // React DevTools reads this flag.
  workInProgress.flags |= PerformedWork;

  if (
    typeof value === "object" &&
    value !== null &&
    typeof value.render === "function" &&
    value.$$typeof === undefined
  ) {
    // 看意思这里是如果是类的处理方式
    // Proceed under the assumption that this is a class instance
    workInProgress.tag = ClassComponent;

    // Throw out any hooks that were used.
    workInProgress.memoizedState = null;
    workInProgress.updateQueue = null;

    // Push context providers early to prevent context stack mismatches.
    // During mounting we don't know the child context yet as the instance doesn't exist.
    // We will invalidate the child context in finishClassComponent() right after rendering.
    let hasContext = false;
    if (isLegacyContextProvider(Component)) {
      hasContext = true;
      pushLegacyContextProvider(workInProgress);
    } else {
      hasContext = false;
    }

    workInProgress.memoizedState =
      value.state !== null && value.state !== undefined ? value.state : null;

    initializeUpdateQueue(workInProgress);

    adoptClassInstance(workInProgress, value);
    mountClassInstance(workInProgress, Component, props, renderLanes);
    return finishClassComponent(
      null,
      workInProgress,
      Component,
      true,
      hasContext,
      renderLanes
    );
  } else {
    // Proceed under the assumption that this is a function component
    workInProgress.tag = FunctionComponent;

    reconcileChildren(null, workInProgress, value, renderLanes);
    return workInProgress.child;
  }
}
```

这个代码有很多有疑问的点，首先从我们之前看过的内容来看，进入这里分支的就是函数组件，但这里表示无法确认，而如果无法确认，那为什么上来就 `renderWithHooks` 呢，这也不能理解。

倒是后半部分的代码比较清晰，就是之前说的，判断出类型后，类似与初次挂载类和函数组件时的处理方案，而这里叫 mountXXX 是强制了这种 tag 的 fiber 节点比较是新的节点，因此只叫 mount 不叫 update。

然后我们这里先跳过 renderWithHooks 的部分，这里先知道他就是调用函数生成了后代节点即可，所以函数时组件的更新本身就比较单纯，没什么更新的内容，在没有 hooks 之前，就是直接再调用一些函数即可，有了 hooks 之后呢，也就多了一些其他的步骤，最后又进入了 `reconcileChildren`。

而这里和之前 `updateHostRoot` 不一样了，因为 current 为 null，所以当前节点是挂载的，那么后代就不用追踪副作用了，都是新的副作用，在根节点上挂即可，不过有一些副作用可能需要在 commitWork 的时候处理，比如 Callback，Update。

#### mountChildFibers

和之前 hostRoot 的类似，也是走了 `placeSingleChild(reconcileSingleElement)`。

对于新的 element 来说，直接就是:

```ts
const created = createFiberFromElement(element, returnFiber.mode, lanes);
// 这个貌似是对 ref 属性进行检查，避免一些错误的用法，然后返回处理后的 ref
created.ref = coerceRef(returnFiber, currentFirstChild, element);
created.return = returnFiber;
return created;
```

这时的 element 是 div 元素，生成的 `fiber.tag = HostComponent`。

那到这就完事了，生成了 fiber(div)，我们回归下整个流程，就基本上事调用函数，生成后代节点，reconcile 就完事了，因为本身函数式组件就不存在什么更新的基础。

### beginWork(div)

因为 fiber(div).tag 是 HostComponent，所以在 beginWork 中执行 `updateHostComponent` 进行更新。

```ts
function updateHostComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes
) {
  pushHostContext(workInProgress);

  const type = workInProgress.type;
  const nextProps = workInProgress.pendingProps;
  const prevProps = current !== null ? current.memoizedProps : null;

  let nextChildren = nextProps.children;
  const isDirectTextChild = shouldSetTextContent(type, nextProps);

  if (isDirectTextChild) {
    // We special case a direct text child of a host node. This is a common
    // case. We won't handle it as a reified child. We will instead handle
    // this in the host environment that also has access to this prop. That
    // avoids allocating another HostText fiber and traversing it.
    nextChildren = null;
  } else if (prevProps !== null && shouldSetTextContent(type, prevProps)) {
    // If we're switching from a direct text child to a normal child, or to
    // empty, we need to schedule the text content to be reset.
    workInProgress.flags |= ContentReset;
  }

  markRef(current, workInProgress);
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}

function shouldSetTextContent(type: string, props: Props): boolean {
  return (
    type === "textarea" ||
    type === "noscript" ||
    typeof props.children === "string" ||
    typeof props.children === "number" ||
    (typeof props.dangerouslySetInnerHTML === "object" &&
      props.dangerouslySetInnerHTML !== null &&
      props.dangerouslySetInnerHTML.__html != null)
  );
}

function markRef(current: Fiber | null, workInProgress: Fiber) {
  const ref = workInProgress.ref;
  if (
    (current === null && ref !== null) ||
    (current !== null && current.ref !== ref)
  ) {
    // Schedule a Ref effect
    workInProgress.flags |= Ref;
  }
}
```

hostComponent 的更新其实很简单，因为它既不是函数，也不是类，无法通过调用某个函数的方式生成后代 element，就只有看它的 children 属性，这里唯独单独处置了一些 children 为单文本的情况。

如果是单文本，在 reconcileChildFibers 中，直接 `return deleteRemainingChildren(returnFiber, currentFirstChild);`。没有建立新的 HostText 节点。

#### useFiber

复用 fiber 节点的关键方法

```ts
function useFiber(fiber: Fiber, pendingProps: mixed): Fiber {
  // We currently set sibling to null and index to 0 here because it is easy
  // to forget to do before returning it. E.g. for the single child case.
  const clone = createWorkInProgress(fiber, pendingProps);
  clone.index = 0;
  clone.sibling = null;
  return clone;
}
```

这就基本完事了，在 reconcileChildFibers 中，生成了 fiber(header)。

### flags 总结

我们先暂时看下我们目前遇到了哪些 flags。

首先是在 `processUpdateQueue` 中，如果 update 对象有 callback，则会添加一个 `Callback` 的 flag。

```ts
        if (
          callback !== null &&
          update.lane !== NoLane
        ) {
          workInProgress.flags |= Callback;
          const effects = queue.effects;
          if (effects === null) {
            queue.effects = [update];
          } else {
            effects.push(update);
          }
        }
      }
```

然后是在删除 fiber 节点的时候，要在父 fiber 节点上添加 `ChildDeletion` 的 flag。

```ts
function deleteChild(returnFiber: Fiber, childToDelete: Fiber): void {
  if (!shouldTrackSideEffects) {
    return;
  }
  const deletions = returnFiber.deletions;
  if (deletions === null) {
    returnFiber.deletions = [childToDelete];
    returnFiber.flags |= ChildDeletion;
  } else {
    deletions.push(childToDelete);
  }
}
```

然后就是普通的 fiber 节点的 `Placement`，这里也很难说清楚什么时候添加这个 flag。

```ts
function placeSingleChild(newFiber: Fiber): Fiber {
  // This is simpler for the single child case. We only need to do a
  // placement for inserting new children.
  if (shouldTrackSideEffects && newFiber.alternate === null) {
    newFiber.flags |= Placement;
  }
  return newFiber;
}
```

然后就是在 Indeterminate 中的 `PerformedWork`，也不是很清楚。

然后是 HostComponent 中的文本子节点变为其他节点的 `ContentReset`。

```ts
else if (prevProps !== null && shouldSetTextContent(type, prevProps)) {
    // If we're switching from a direct text child to a normal child, or to
    // empty, we need to schedule the text content to be reset.
    workInProgress.flags |= ContentReset;
}
```

以及对 Ref 的标记：

```ts
function markRef(current: Fiber | null, workInProgress: Fiber) {
  const ref = workInProgress.ref;
  if (
    (current === null && ref !== null) ||
    (current !== null && current.ref !== ref)
  ) {
    // Schedule a Ref effect
    workInProgress.flags |= Ref;
  }
}
```

### beginWork(header)

这和 div 差不多吧，唯一不同是他的 children 是 Array 类型的，不走 `reconcileSingleElement`。

```ts
if (isArray(newChild)) {
  return reconcileChildrenArray(
    returnFiber,
    currentFirstChild,
    newChild,
    lanes
  );
}
```

#### reconcileChildrenArray

```ts
function reconcileChildrenArray(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  newChildren: Array<*>,
  lanes: Lanes
): Fiber | null {
  let resultingFirstChild: Fiber | null = null;
  let previousNewFiber: Fiber | null = null;

  let oldFiber = currentFirstChild;
  let lastPlacedIndex = 0;
  let newIdx = 0;
  let nextOldFiber = null;
  for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
    // 问题就来了，到底什么情况下，会进入这个 if 呢
    if (oldFiber.index > newIdx) {
      nextOldFiber = oldFiber;
      oldFiber = null;
    } else {
      nextOldFiber = oldFiber.sibling;
    }
    const newFiber = updateSlot(
      returnFiber,
      oldFiber,
      newChildren[newIdx],
      lanes
    );
    if (newFiber === null) {
      // 旧 fiber 无法 "复用"，特别注意这里的复用是基于 key，如果 key 相同
      // 就任务可以复用，具体如果 type 不同的其实 newFiber 是新建的
      if (oldFiber === null) {
        oldFiber = nextOldFiber;
      }
      break;
    }
    if (shouldTrackSideEffects) {
      if (oldFiber && newFiber.alternate === null) {
        // 虽然可以"复用"，但事实上两者类型不同，不是通过 useFiber 复用的
        // 而是删了旧的，新增了新的
        deleteChild(returnFiber, oldFiber);
      }
    }
    // 可以复用的情况下，看下 Placement flag 的情况
    // 这个变量的意思貌似是目前最后一个可以真正复用的 fiber 节点的 index
    lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
    if (previousNewFiber === null) {
      resultingFirstChild = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }
    previousNewFiber = newFiber;
    oldFiber = nextOldFiber;
  }

  if (newIdx === newChildren.length) {
    // element 队列遍历完成，删掉 old 队列所有 fiber
    deleteRemainingChildren(returnFiber, oldFiber);
    return resultingFirstChild;
  }

  if (oldFiber === null) {
    // 新的队列还没完，但是旧的队列，那新的要插入
    for (; newIdx < newChildren.length; newIdx++) {
      // 这个 createChild 只在这一个函数中用了
      const newFiber = createChild(returnFiber, newChildren[newIdx], lanes);
      if (newFiber === null) {
        continue;
      }
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      if (previousNewFiber === null) {
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
    }
    return resultingFirstChild;
  }

  // 两个队列都没遍历完，都有剩余
  // 对 old 队列以 key 为 key 建立 map
  const existingChildren = mapRemainingChildren(returnFiber, oldFiber);

  for (; newIdx < newChildren.length; newIdx++) {
    // 从 map 中找能复用的，找不到的新建
    const newFiber = updateFromMap(
      existingChildren,
      returnFiber,
      newIdx,
      newChildren[newIdx],
      lanes
    );
    if (newFiber !== null) {
      if (shouldTrackSideEffects) {
        if (newFiber.alternate !== null) {
          // fiber 不是新建的，旧的 fiber 从 map 删除
          existingChildren.delete(
            newFiber.key === null ? newIdx : newFiber.key
          );
        }
      }
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      if (previousNewFiber === null) {
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
    }
  }

  // 还剩下的就是待删除的
  if (shouldTrackSideEffects) {
    existingChildren.forEach((child) => deleteChild(returnFiber, child));
  }
  return resultingFirstChild;
}

function mapRemainingChildren(
  returnFiber: Fiber,
  currentFirstChild: Fiber
): Map<string | number, Fiber> {
  const existingChildren: Map<string | number, Fiber> = new Map();

  let existingChild = currentFirstChild;
  while (existingChild !== null) {
    if (existingChild.key !== null) {
      existingChildren.set(existingChild.key, existingChild);
    } else {
      existingChildren.set(existingChild.index, existingChild);
    }
    existingChild = existingChild.sibling;
  }
  return existingChildren;
}

// 从 map 中以 key 或者 index 为 map key 找能复用的
function updateFromMap(
  existingChildren: Map<string | number, Fiber>,
  returnFiber: Fiber,
  newIdx: number,
  newChild: any,
  lanes: Lanes
): Fiber | null {
  if (
    (typeof newChild === "string" && newChild !== "") ||
    typeof newChild === "number"
  ) {
    const matchedFiber = existingChildren.get(newIdx) || null;
    return updateTextNode(returnFiber, matchedFiber, "" + newChild, lanes);
  }

  if (typeof newChild === "object" && newChild !== null) {
    switch (newChild.$$typeof) {
      case REACT_ELEMENT_TYPE: {
        const matchedFiber =
          existingChildren.get(newChild.key === null ? newIdx : newChild.key) ||
          null;
        return updateElement(returnFiber, matchedFiber, newChild, lanes);
      }
      case REACT_PORTAL_TYPE: {
        const matchedFiber =
          existingChildren.get(newChild.key === null ? newIdx : newChild.key) ||
          null;
        return updatePortal(returnFiber, matchedFiber, newChild, lanes);
      }
      case REACT_LAZY_TYPE:
        if (enableLazyElements) {
          const payload = newChild._payload;
          const init = newChild._init;
          return updateFromMap(
            existingChildren,
            returnFiber,
            newIdx,
            init(payload),
            lanes
          );
        }
    }

    if (isArray(newChild) || getIteratorFn(newChild)) {
      const matchedFiber = existingChildren.get(newIdx) || null;
      return updateFragment(returnFiber, matchedFiber, newChild, lanes, null);
    }

    throwOnInvalidObjectType(returnFiber, newChild);
  }

  if (__DEV__) {
    if (typeof newChild === "function") {
      warnOnFunctionType(returnFiber);
    }
  }

  return null;
}
```

多子节点的调和算法，两次循环的过程这个网上到处都有，就不细说了。

#### updateSlot

更新多子节点的插槽，如果 fiber.key 和 element.key 一致，就认为 fiber 节点可以"复用"，如果真的 type 也一致，会调用 `useFiber` 复用 fiber 对象，否则还是会新创建 fiber 节点。

```ts
function updateSlot(
  returnFiber: Fiber,
  oldFiber: Fiber | null,
  newChild: any,
  lanes: Lanes
): Fiber | null {
  // Update the fiber if the keys match, otherwise return null.
  const key = oldFiber !== null ? oldFiber.key : null;

  if (
    (typeof newChild === "string" && newChild !== "") ||
    typeof newChild === "number"
  ) {
    // 文本节点，如果旧 fiber 有 key 就认为不能复用
    // 否则认为可以
    if (key !== null) {
      return null;
    }
    return updateTextNode(returnFiber, oldFiber, "" + newChild, lanes);
  }

  if (typeof newChild === "object" && newChild !== null) {
    switch (newChild.$$typeof) {
      case REACT_ELEMENT_TYPE: {
        if (newChild.key === key) {
          return updateElement(returnFiber, oldFiber, newChild, lanes);
        } else {
          return null;
        }
      }
      case REACT_PORTAL_TYPE: {
        if (newChild.key === key) {
          return updatePortal(returnFiber, oldFiber, newChild, lanes);
        } else {
          return null;
        }
      }
      case REACT_LAZY_TYPE: {
        if (enableLazyElements) {
          const payload = newChild._payload;
          const init = newChild._init;
          return updateSlot(returnFiber, oldFiber, init(payload), lanes);
        }
      }
    }

    if (isArray(newChild) || getIteratorFn(newChild)) {
      if (key !== null) {
        return null;
      }

      return updateFragment(returnFiber, oldFiber, newChild, lanes, null);
    }
  }

  return null;
}

function updateTextNode(
  returnFiber: Fiber,
  current: Fiber | null,
  textContent: string,
  lanes: Lanes
) {
  if (current === null || current.tag !== HostText) {
    // Insert
    const created = createFiberFromText(textContent, returnFiber.mode, lanes);
    created.return = returnFiber;
    return created;
  } else {
    // Update
    const existing = useFiber(current, textContent);
    existing.return = returnFiber;
    return existing;
  }
}

function updateElement(
  returnFiber: Fiber,
  current: Fiber | null,
  element: ReactElement,
  lanes: Lanes
): Fiber {
  const elementType = element.type;
  if (elementType === REACT_FRAGMENT_TYPE) {
    return updateFragment(
      returnFiber,
      current,
      element.props.children,
      lanes,
      element.key
    );
  }
  if (current !== null) {
    if (current.elementType === elementType) {
      // 类型相同，可以复用
      const existing = useFiber(current, element.props);
      existing.ref = coerceRef(returnFiber, current, element);
      existing.return = returnFiber;
      return existing;
    }
  }
  // Insert
  const created = createFiberFromElement(element, returnFiber.mode, lanes);
  created.ref = coerceRef(returnFiber, current, element);
  created.return = returnFiber;
  return created;
}
```

#### placeChild

看样子新增的情况下，lastPlacedIndex 不会自增，但需要注意的是，我们的 fiber.index 用的是 newIndex，所以不影响

```ts
function placeChild(
  newFiber: Fiber,
  lastPlacedIndex: number,
  newIndex: number
): number {
  newFiber.index = newIndex;
  if (!shouldTrackSideEffects) {
    newFiber.flags |= Forked;
    return lastPlacedIndex;
  }
  const current = newFiber.alternate;
  if (current !== null) {
    const oldIndex = current.index;
    if (oldIndex < lastPlacedIndex) {
      // This is a move.
      newFiber.flags |= Placement;
      return lastPlacedIndex;
    } else {
      // This item can stay in place.
      return oldIndex;
    }
  } else {
    // This is an insertion.
    newFiber.flags |= Placement;
    return lastPlacedIndex;
  }
}
```

#### createChild

这个和 `updateSlot` 貌似差不多

```ts
function createChild(
  returnFiber: Fiber,
  newChild: any,
  lanes: Lanes
): Fiber | null {
  if (
    (typeof newChild === "string" && newChild !== "") ||
    typeof newChild === "number"
  ) {
    // 文本节点
    const created = createFiberFromText("" + newChild, returnFiber.mode, lanes);
    created.return = returnFiber;
    return created;
  }

  if (typeof newChild === "object" && newChild !== null) {
    switch (newChild.$$typeof) {
      case REACT_ELEMENT_TYPE: {
        const created = createFiberFromElement(
          newChild,
          returnFiber.mode,
          lanes
        );
        created.ref = coerceRef(returnFiber, null, newChild);
        created.return = returnFiber;
        return created;
      }
      case REACT_PORTAL_TYPE: {
        const created = createFiberFromPortal(
          newChild,
          returnFiber.mode,
          lanes
        );
        created.return = returnFiber;
        return created;
      }
      case REACT_LAZY_TYPE: {
        if (enableLazyElements) {
          const payload = newChild._payload;
          const init = newChild._init;
          return createChild(returnFiber, init(payload), lanes);
        }
      }
    }

    if (isArray(newChild) || getIteratorFn(newChild)) {
      const created = createFiberFromFragment(
        newChild,
        returnFiber.mode,
        lanes,
        null
      );
      created.return = returnFiber;
      return created;
    }

    throwOnInvalidObjectType(returnFiber, newChild);
  }

  return null;
}
```

#### reconcileChildrenArray 总结

reconcileChildrenArray 是当 newChild 是数组元素时的调和参数，首先我们可以分成两种大的情况，即没有 oldFiber 和有 oldFiber。

当没有 oldFiber 的时候，又有 trackSideEffects 和不 track 两种情况。

首先假设没有 oldFiber，也不用 trackSideEffects，这种情况大概率父 fiber 也是初次挂载。

这种情况下，直接变量 `newChildren`，创建每个 child 元素即完成，最多打个 Forked flag。

另外一种情况就是需要 trackSideEffects，即之前父 fiber 可能没有子节点，这种情况下的话，和上面类似也是需要创建每个 child 元素，唯一不同的是每个 child 打了 Placement flag。

然后就是有 oldFiber 的情况，有 oldFiber 的时候，大概率是要 trackSideEffects 的。

这种情况下，首先同时遍历新旧两个列表，比较 key 相同的最长队列，通过调用 `updateSlot` 尝试复用每个 key 相同的前后节点，如果 key 不同，直接退出第一次遍历。在 updateSlot 中，大致根据 newChild 是文本还是 element 节点分成了两种情况（其他类型我们暂时忽略），分别调用 `updateTextNode` 和 `updateElement` 尝试复用 fiber 节点。如果复用不了的，会使用 `createFiberFromText` 和 `createFiberFromElement` 创建新的 fiber 节点。

不过对于新建的 fiber 节点，会将对应的旧 fiber 节点删除，同时新的节点会有 Placement flag。

然后就是遍历完成后，可能有 3 种情况，首先是 newChildren 遍历完了，那把没遍历的 oldFiber 都删除即可，再次就是 oldFiber 遍历完了，那把新的元素一一创建即可。

最后一种就是两个队列都没遍历完，这时候先把剩下的 oldFiber 遍历一次，以 fiber.key 为 map key 建立一个 map，然后就遍历 newChildren，每个 new Child 根据 key 看看能不能在 map 中找到匹配的，如果能，就尝试复用。

最后把 map 中剩下的 oldFiber 都删掉就完了。

#### demo

最后回到我们这个例子，我们这时候是 beginWork(header)，这时候是没有 current，所以不用 trackSideEffects，同时没有 oldFiber，因此直接新建各个 element fiber 即可。

即 `fiber(img), fiber(p), `fiber(a)`。

### beginWork(img)

img 的话，走 `updateHostComponent`，然后 reconcileChildFibers，没有子节点，所以直接返回 null 了，进入 completeWork 的过程了。内容在 completeWork.md 中。

之后进入 beginWork(p) 的流程。

### beginWork(p)

`updateHostComponent -> reconcileChildren -> reconcileChildFibers -> reconcileChildrenArray`，然后创建了 3 个 fiber 节点，包括两个 HostText 和一个 HostComponent。

### beginWork(HostText)

进入文本 `Edit` 的 beginWork 的过程，这是一种新的类型。

更新过程及其简单，就是什么都不做。

```ts
function updateHostText(current, workInProgress) {
  // Nothing to do here. This is terminal. We'll do the completion step
  // immediately after.
  return null;
}
```

然后就是 completeWork 过程。

### beginWork(code)

略。

### beginWork(HostText(and save to reload))

略。

### beginWork(a)

和其他的没什么两样。

这样整个 beginWork 就都完成了。

我们这里漏了很多内容的东西，比如函数组件和类组件的。下面单独讲讲。

### FunctionComponent

走的这段代码：

```ts
case FunctionComponent: {
    const Component = workInProgress.type;
    const unresolvedProps = workInProgress.pendingProps;
    const resolvedProps =
    workInProgress.elementType === Component
        ? unresolvedProps
        : resolveDefaultProps(Component, unresolvedProps);
    return updateFunctionComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
        renderLanes,
    );
}
```

#### updateFunctionComponent

其实很多内容应该在 `mountindeterminatecomponent` 中都出现过，主要就是 `renderWithHooks`。

```ts
function updateFunctionComponent(
  current,
  workInProgress,
  Component,
  nextProps: any,
  renderLanes
) {
  let context;
  if (!disableLegacyContext) {
    const unmaskedContext = getUnmaskedContext(workInProgress, Component, true);
    context = getMaskedContext(workInProgress, unmaskedContext);
  }

  let nextChildren;
  let hasId;
  prepareToReadContext(workInProgress, renderLanes);

  nextChildren = renderWithHooks(
    current,
    workInProgress,
    Component,
    nextProps,
    context,
    renderLanes
  );
  hasId = checkDidRenderIdHook();

  // 这段什么意思，老的 fiber 节点并且没有变动，尝试复用？
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

### ClassComponent

```ts
case ClassComponent: {
    const Component = workInProgress.type;
    const unresolvedProps = workInProgress.pendingProps;
    const resolvedProps =
    workInProgress.elementType === Component
        ? unresolvedProps
        : resolveDefaultProps(Component, unresolvedProps);
    return updateClassComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
        renderLanes,
    );
}
```

#### updateClassComponent

```ts
function updateClassComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: any,
  nextProps: any,
  renderLanes: Lanes
) {
  // Push context providers early to prevent context stack mismatches.
  // During mounting we don't know the child context yet as the instance doesn't exist.
  // We will invalidate the child context in finishClassComponent() right after rendering.
  let hasContext;
  if (isLegacyContextProvider(Component)) {
    hasContext = true;
    pushLegacyContextProvider(workInProgress);
  } else {
    hasContext = false;
  }
  prepareToReadContext(workInProgress, renderLanes);

  const instance = workInProgress.stateNode;
  let shouldUpdate;
  if (instance === null) {
    if (current !== null) {
      // 没有实例但是有 oldFiber，这种情况可能像下面注释所说吧
      // 一般估计用不上
      // A class component without an instance only mounts if it suspended
      // inside a non-concurrent tree, in an inconsistent state. We want to
      // treat it like a new mount, even though an empty version of it already
      // committed. Disconnect the alternate pointers.
      current.alternate = null;
      workInProgress.alternate = null;
      // Since this is conceptually a new fiber, schedule a Placement effect
      workInProgress.flags |= Placement;
    }
    // In the initial pass we might need to construct the instance.
    // 没有实例的情况下，构建实例，挂载实例
    // 话说 construct 和 mount 为什么不能写成一个呢
    constructClassInstance(workInProgress, Component, nextProps);
    mountClassInstance(workInProgress, Component, nextProps, renderLanes);
    shouldUpdate = true;
  } else if (current === null) {
    // In a resume, we'll already have an instance we can reuse.
    // 有实例，但是没有 oldFiber，这个也不能理解
    shouldUpdate = resumeMountClassInstance(
      workInProgress,
      Component,
      nextProps,
      renderLanes
    );
  } else {
    // 有实例，有 oldFiber，更新实例
    shouldUpdate = updateClassInstance(
      current,
      workInProgress,
      Component,
      nextProps,
      renderLanes
    );
  }
  const nextUnitOfWork = finishClassComponent(
    current,
    workInProgress,
    Component,
    shouldUpdate,
    hasContext,
    renderLanes
  );
  return nextUnitOfWork;
}
```

除去一些奇怪的场景，主要就两种，如果是组件的初次挂载，就构建实例，否则就更新实例。

#### constructClassInstance

所以这个函数就基本调用构造函数构造了实例，然后用 `stateNode` 绑定了

```ts
function constructClassInstance(
  workInProgress: Fiber,
  ctor: any,
  props: any
): any {
  let isLegacyContextConsumer = false;
  let unmaskedContext = emptyContextObject;
  let context = emptyContextObject;
  const contextType = ctor.contextType;

  if (typeof contextType === "object" && contextType !== null) {
    context = readContext(contextType as any);
  } else if (!disableLegacyContext) {
    unmaskedContext = getUnmaskedContext(workInProgress, ctor, true);
    const contextTypes = ctor.contextTypes;
    isLegacyContextConsumer =
      contextTypes !== null && contextTypes !== undefined;
    context = isLegacyContextConsumer
      ? getMaskedContext(workInProgress, unmaskedContext)
      : emptyContextObject;
  }

  // 调用构造函数，构建实例
  let instance = new ctor(props, context);

  const state = (workInProgress.memoizedState =
    instance.state !== null && instance.state !== undefined
      ? instance.state
      : null);

  // 建立 stateNode 绑定关系
  adoptClassInstance(workInProgress, instance);

  // Cache unmasked context so we can avoid recreating masked context unless necessary.
  // ReactFiberContext usually updates this cache but can't for newly-created instances.
  if (isLegacyContextConsumer) {
    cacheContext(workInProgress, unmaskedContext, context);
  }

  return instance;
}

function adoptClassInstance(workInProgress: Fiber, instance: any): void {
  instance.updater = classComponentUpdater;
  workInProgress.stateNode = instance;
  // The instance needs access to the fiber so that it can schedule updates
  // instance._reactInternals = fiber
  setInstance(instance, workInProgress);
}
```

#### mountClassInstance

```ts
function mountClassInstance(
  workInProgress: Fiber,
  ctor: any,
  newProps: any,
  renderLanes: Lanes
): void {
  const instance = workInProgress.stateNode;
  instance.props = newProps;
  instance.state = workInProgress.memoizedState;
  instance.refs = emptyRefsObject;

  initializeUpdateQueue(workInProgress);

  const contextType = ctor.contextType;
  if (typeof contextType === "object" && contextType !== null) {
    instance.context = readContext(contextType);
  } else if (disableLegacyContext) {
    instance.context = emptyContextObject;
  } else {
    const unmaskedContext = getUnmaskedContext(workInProgress, ctor, true);
    instance.context = getMaskedContext(workInProgress, unmaskedContext);
  }

  instance.state = workInProgress.memoizedState;

  const getDerivedStateFromProps = ctor.getDerivedStateFromProps;
  if (typeof getDerivedStateFromProps === "function") {
    // 调用getDerivedStateFromProps将结果合并到 memorizedState 中
    applyDerivedStateFromProps(
      workInProgress,
      ctor,
      getDerivedStateFromProps,
      newProps
    );
    instance.state = workInProgress.memoizedState;
  }

  if (
    typeof ctor.getDerivedStateFromProps !== "function" &&
    typeof instance.getSnapshotBeforeUpdate !== "function" &&
    (typeof instance.UNSAFE_componentWillMount === "function" ||
      typeof instance.componentWillMount === "function")
  ) {
    // 调用 componentWillMount 或者 UNSAFE_componentWillMount 方法
    callComponentWillMount(workInProgress, instance);
    // If we had additional state updates during this life-cycle, let's
    // process them now.
    // 这里相当于把 componentWillMount 中的 update 直接消化了
    processUpdateQueue(workInProgress, newProps, instance, renderLanes);
    instance.state = workInProgress.memoizedState;
  }

  if (typeof instance.componentDidMount === "function") {
    let fiberFlags: Flags = Update;
    workInProgress.flags |= fiberFlags;
  }
}
```

所以这个函数主要是执行了第一次挂载时，render 前除了构造函数要执行的函数，并尝试添加 Update flag。

#### updateClassInstance

组件更新这还是挺麻烦的。

```ts
function updateClassInstance(
  current: Fiber,
  workInProgress: Fiber,
  ctor: any,
  newProps: any,
  renderLanes: Lanes
): boolean {
  const instance = workInProgress.stateNode;

  cloneUpdateQueue(current, workInProgress);

  const unresolvedOldProps = workInProgress.memoizedProps;
  const oldProps =
    workInProgress.type === workInProgress.elementType
      ? unresolvedOldProps
      : resolveDefaultProps(workInProgress.type, unresolvedOldProps);
  instance.props = oldProps;
  const unresolvedNewProps = workInProgress.pendingProps;

  const oldContext = instance.context;
  const contextType = ctor.contextType;
  let nextContext = emptyContextObject;
  if (typeof contextType === "object" && contextType !== null) {
    nextContext = readContext(contextType);
  } else if (!disableLegacyContext) {
    const nextUnmaskedContext = getUnmaskedContext(workInProgress, ctor, true);
    nextContext = getMaskedContext(workInProgress, nextUnmaskedContext);
  }

  const getDerivedStateFromProps = ctor.getDerivedStateFromProps;
  const hasNewLifecycles =
    typeof getDerivedStateFromProps === "function" ||
    typeof instance.getSnapshotBeforeUpdate === "function";

  if (
    !hasNewLifecycles &&
    (typeof instance.UNSAFE_componentWillReceiveProps === "function" ||
      typeof instance.componentWillReceiveProps === "function")
  ) {
    if (
      unresolvedOldProps !== unresolvedNewProps ||
      oldContext !== nextContext
    ) {
      callComponentWillReceiveProps(
        workInProgress,
        instance,
        newProps,
        nextContext
      );
    }
  }

  resetHasForceUpdateBeforeProcessing();

  const oldState = workInProgress.memoizedState;
  let newState = (instance.state = oldState);
  processUpdateQueue(workInProgress, newProps, instance, renderLanes);
  newState = workInProgress.memoizedState;

  if (
    unresolvedOldProps === unresolvedNewProps &&
    oldState === newState &&
    !hasContextChanged() &&
    !checkHasForceUpdateAfterProcessing() &&
    !(
      enableLazyContextPropagation &&
      current !== null &&
      current.dependencies !== null &&
      checkIfContextChanged(current.dependencies)
    )
  ) {
    // 如果当前组件 state 和 props 和 context 都没有变动
    // If an update was already in progress, we should schedule an Update
    // effect even though we're bailing out, so that cWU/cDU are called.
    if (typeof instance.componentDidUpdate === "function") {
      if (
        unresolvedOldProps !== current.memoizedProps ||
        oldState !== current.memoizedState
      ) {
        workInProgress.flags |= Update;
      }
    }
    if (typeof instance.getSnapshotBeforeUpdate === "function") {
      if (
        unresolvedOldProps !== current.memoizedProps ||
        oldState !== current.memoizedState
      ) {
        workInProgress.flags |= Snapshot;
      }
    }
    return false;
  }

  if (typeof getDerivedStateFromProps === "function") {
    applyDerivedStateFromProps(
      workInProgress,
      ctor,
      getDerivedStateFromProps,
      newProps
    );
    newState = workInProgress.memoizedState;
  }

  const shouldUpdate =
    checkHasForceUpdateAfterProcessing() ||
    // 这个函数就是检查 scu 函数，如果有就返回函数返回值
    // 或者如果是 pureComponent，就比较 old new，state 和 props
    // 返回比较结果
    // 否则一律返回 true，需要更新
    checkShouldComponentUpdate(
      workInProgress,
      ctor,
      oldProps,
      newProps,
      oldState,
      newState,
      nextContext
    ) ||
    (enableLazyContextPropagation &&
      current !== null &&
      current.dependencies !== null &&
      checkIfContextChanged(current.dependencies));

  if (shouldUpdate) {
    if (
      !hasNewLifecycles &&
      (typeof instance.UNSAFE_componentWillUpdate === "function" ||
        typeof instance.componentWillUpdate === "function")
    ) {
      if (typeof instance.componentWillUpdate === "function") {
        instance.componentWillUpdate(newProps, newState, nextContext);
      }
      if (typeof instance.UNSAFE_componentWillUpdate === "function") {
        instance.UNSAFE_componentWillUpdate(newProps, newState, nextContext);
      }
    }
    // 绑定 flag
    if (typeof instance.componentDidUpdate === "function") {
      workInProgress.flags |= Update;
    }
    if (typeof instance.getSnapshotBeforeUpdate === "function") {
      workInProgress.flags |= Snapshot;
    }
  } else {
    if (typeof instance.componentDidUpdate === "function") {
      if (
        unresolvedOldProps !== current.memoizedProps ||
        oldState !== current.memoizedState
      ) {
        workInProgress.flags |= Update;
      }
    }
    if (typeof instance.getSnapshotBeforeUpdate === "function") {
      if (
        unresolvedOldProps !== current.memoizedProps ||
        oldState !== current.memoizedState
      ) {
        workInProgress.flags |= Snapshot;
      }
    }

    workInProgress.memoizedProps = newProps;
    workInProgress.memoizedState = newState;
  }

  instance.props = newProps;
  instance.state = newState;
  instance.context = nextContext;

  return shouldUpdate;
}
```

仔细看下的话，主要是判断组件是否需要更新，以及调用对应的生命周期方法，处理 processUpdateQueue，和绑定 Update 和 Snapshot flag。

#### finishClassComponent

基本上核心的就是调用 render 方法或者 newChildren，然后 reconcileChildren。

```ts
function finishClassComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: any,
  shouldUpdate: boolean,
  hasContext: boolean,
  renderLanes: Lanes
) {
  // Refs should update even if shouldComponentUpdate returns false
  markRef(current, workInProgress);

  const didCaptureError = (workInProgress.flags & DidCapture) !== NoFlags;

  if (!shouldUpdate && !didCaptureError) {
    // Context providers should defer to sCU for rendering
    if (hasContext) {
      invalidateContextProvider(workInProgress, Component, false);
    }
    // 组件不需要更新，提前退出不执行 render 方法
    return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
  }

  const instance = workInProgress.stateNode;

  // Rerender
  ReactCurrentOwner.current = workInProgress;
  let nextChildren;
  if (
    didCaptureError &&
    typeof Component.getDerivedStateFromError !== "function"
  ) {
    // If we captured an error, but getDerivedStateFromError is not defined,
    // unmount all the children. componentDidCatch will schedule an update to
    // re-render a fallback. This is temporary until we migrate everyone to
    // the new API.
    // TODO: Warn in a future release.
    nextChildren = null;
  } else {
    nextChildren = instance.render();
  }

  // React DevTools reads this flag.
  workInProgress.flags |= PerformedWork;
  if (current !== null && didCaptureError) {
    // If we're recovering from an error, reconcile without reusing any of
    // the existing children. Conceptually, the normal children and the children
    // that are shown on error are two different sets, so we shouldn't reuse
    // normal children even if their identities match.
    forceUnmountCurrentAndReconcile(
      current,
      workInProgress,
      nextChildren,
      renderLanes
    );
  } else {
    reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  }

  // Memoize state using the values we just used to render.
  // TODO: Restructure so we never read values from the instance.
  workInProgress.memoizedState = instance.state;

  // The context might have changed so we need to recalculate it.
  if (hasContext) {
    invalidateContextProvider(workInProgress, Component, true);
  }

  return workInProgress.child;
}
```

### 总结

总结下这一页我们主要讲了 beginWork，beginWork 的主要工作可以认为有两个，第一个是判断能否直接复用旧的 fiber 节点，比如在 fiber 节点本身没有更新，同时本次 renderLanes 也不包含本节点的 lanes 的时候，尝试直接复用，这部分的逻辑我们还没讲，等后面进行更新的时候再讲。

另一个工作就是处理更新了，根据不同的 fiber.tag 采用不同的行为，更新的主要工作其实是生成该 fiber 节点的后代 element，进而生成后代 fiber，便于构造新的 fiber 树，因此基本上所有的 beginWork 都以 `reoconcileChildren` 来作为最后的工作，即拿更新后的 element 生成 fiber 节点，而之前的工作基本上都是为了生成新的 element，HostRoot，ClassComponent 都是 processUpdateQueue，FunctionComponent 就直接执行，HostComponent 没什么好做的，以主要的几个类型来说：

- HostRoot：能更新的只有根应用内容，因此就处理下 updateQueue 中的 element 即可。
- IndeterminateComponent：判断出不同的类型，执行对应的逻辑
- HostComponent：针对单一 text 子内容做下优化，剩下啥也不做
- HostText：啥也不做
- FunctionComponent: renderWithHooks
- ClassComponent: `constructClassInstance -> mountClassInstance / updateClassInstance -> finishClassComponent`。

### 提前退出

bailOut 应该是一种提前退出的机制，在一些情况下，fiber 节点可以不加修改直接复用，这种情况下，这个 fiber 子树就不需要进行 work，节省了很多的时间。

首先在 `beginWork` 中，会判断 fiber 节点一方面是否有 props 或 context 变动，如果有就认为有收到更新，不能直接复用，否则当前 fiber 节点没有收到别的节点传递过来的更新，那就要看下当前 fiber 节点是否本身触发了更新，如果 fiber.lanes 在 renderLanes 中不存在，那就是 fiber 节点自身也没有触发更新，因此这里会先尝试能不能复用。

除了在 beginWork 中，我们目前还在 `updateHostRoot`，`updateClassComponent`，`updateFunctionCompoment` 中还看到了对 `bailoutOnAlreadyFinishedWork` 的调用。

```ts
return attemptEarlyBailoutIfNoScheduledUpdate(
  current,
  workInProgress,
  renderLanes
);
```

#### attemptEarlyBailoutIfNoSchduledUpdate

```ts
function attemptEarlyBailoutIfNoScheduledUpdate(
  current: Fiber,
  workInProgress: Fiber,
  renderLanes: Lanes
) {
  // This fiber does not have any pending work. Bailout without entering
  // the begin phase. There's still some bookkeeping we that needs to be done
  // in this optimized path, mostly pushing stuff onto the stack.
  switch (workInProgress.tag) {
    case HostRoot:
      pushHostRootContext(workInProgress);
      break;
    case HostComponent:
      pushHostContext(workInProgress);
      break;
    case ClassComponent: {
      const Component = workInProgress.type;
      if (isLegacyContextProvider(Component)) {
        pushLegacyContextProvider(workInProgress);
      }
      break;
    }
    case HostPortal:
      pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
      break;
    case ContextProvider: {
      const newValue = workInProgress.memoizedProps.value;
      const context: ReactContext<any> = workInProgress.type._context;
      pushProvider(workInProgress, context, newValue);
      break;
    }
    case Profiler:
      break;
    case SuspenseComponent: {
      break;
    }
    case SuspenseListComponent: {
      return updateOffscreenComponent(current, workInProgress, renderLanes);
    }
    case CacheComponent: {
      break;
    }
  }
  return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
}
```

可以看到大部分貌似是先对 context 处理了一下，这个我们后面再看，然后是 `bailoutOnAlreadyFinishedWork`。

#### bailoutOnAlreadyFinishedWork

```ts
function bailoutOnAlreadyFinishedWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes
): Fiber | null {
  if (current !== null) {
    workInProgress.dependencies = current.dependencies;
  }

  markSkippedUpdateLanes(workInProgress.lanes);

  // Check if the children have any pending work.
  // 如果后代节点也没有更新，那就可以直接复用，跳过这颗 fiber 树的复用了
  if (!includesSomeLane(renderLanes, workInProgress.childLanes)) {
    return null;
  }

  // This fiber doesn't have work, but its subtree does. Clone the child
  // fibers and continue.
  // 后代节点有更新的
  cloneChildFibers(current, workInProgress);
  return workInProgress.child;
}
```
