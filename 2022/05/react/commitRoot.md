## commitRoot    

<!-- TOC -->

- [commitRoot](#commitroot)
  - [关键 flags](#关键-flags)
  - [commitRootImpl](#commitrootimpl)
  - [commitBeforeMutationEffects](#commitbeforemutationeffects)
    - [commitBeforeMutationEffectsOnFiber](#commitbeforemutationeffectsonfiber)
  - [commitMutationEffects](#commitmutationeffects)
    - [commitDeletion](#commitdeletion)
    - [commitMutationEffects_complete](#commitmutationeffects_complete)
    - [commitMutationEffectsOnFiber](#commitmutationeffectsonfiber)
    - [commitPlacement](#commitplacement)
    - [commitWork](#commitwork)
  - [mutationEffects 总结](#mutationeffects-总结)
  - [commitLayoutEffects](#commitlayouteffects)
    - [commitLayoutEffects_begin](#commitlayouteffects_begin)
    - [commitLayoutEffectOnFiber](#commitlayouteffectonfiber)
  - [总结](#总结)

<!-- /TOC -->

```ts
function commitRoot(root: FiberRoot, recoverableErrors: null | Array<mixed>) {
  const previousUpdateLanePriority = getCurrentUpdatePriority();
  const prevTransition = ReactCurrentBatchConfig.transition;

  try {
    ReactCurrentBatchConfig.transition = null;
    setCurrentUpdatePriority(DiscreteEventPriority);
    commitRootImpl(root, recoverableErrors, previousUpdateLanePriority);
  } finally {
    ReactCurrentBatchConfig.transition = prevTransition;
    setCurrentUpdatePriority(previousUpdateLanePriority);
  }

  return null;
}
```     

### 关键 flags

```ts
export const BeforeMutationMask =
  Update |
  Snapshot

export const MutationMask =
  Placement |
  Update |
  ChildDeletion |
  ContentReset |
  Ref |
  Hydrating |
  Visibility;
export const LayoutMask = Update | Callback | Ref | Visibility;

export const PassiveMask = Passive | ChildDeletion;
```   

### commitRootImpl   

以我们之前的例子来说，目前有 `Forked, Placement, Update, PerformedWork` 4个 flag。


```ts
function commitRootImpl(
  root: FiberRoot,
  recoverableErrors: null | Array<mixed>,
  renderPriorityLevel: EventPriority,
) {
  do {
    // `flushPassiveEffects` will call `flushSyncUpdateQueue` at the end, which
    // means `flushPassiveEffects` will sometimes result in additional
    // passive effects. So we need to keep flushing in a loop until there are
    // no more pending effects.
    // TODO: Might be better if `flushPassiveEffects` did not automatically
    // flush synchronous work at the end, to avoid factoring hazards like this.
    flushPassiveEffects();
  } while (rootWithPendingPassiveEffects !== null);

  if ((executionContext & (RenderContext | CommitContext)) !== NoContext) {
    throw new Error('Should not already be working.');
  }

  // hostRootFiber
  const finishedWork = root.finishedWork;
  const lanes = root.finishedLanes;


  if (finishedWork === null) {
    return null;
  }
  root.finishedWork = null;
  root.finishedLanes = NoLanes;

  if (finishedWork === root.current) {
    throw new Error(
      'Cannot commit the same tree as before. This error is likely caused by ' +
        'a bug in React. Please file an issue.',
    );
  }

  root.callbackNode = null;
  root.callbackPriority = NoLane;

  let remainingLanes = mergeLanes(finishedWork.lanes, finishedWork.childLanes);
  markRootFinished(root, remainingLanes);

  if (root === workInProgressRoot) {
    // We can reset these now that they are finished.
    workInProgressRoot = null;
    workInProgress = null;
    workInProgressRootRenderLanes = NoLanes;
  }

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

  // Check if there are any effects in the whole tree.
  // TODO: This is left over from the effect list implementation, where we had
  // to check for the existence of `firstEffect` to satisfy Flow. I think the
  // only other reason this optimization exists is because it affects profiling.
  // Reconsider whether this is necessary.
  // 基本上常用的 flag 都在这几个 mask 里面，所以一般 subtreeHasEffects 大概率为 true
  const subtreeHasEffects =
    (finishedWork.subtreeFlags &
      (BeforeMutationMask | MutationMask | LayoutMask | PassiveMask)) !==
    NoFlags;
  // 这个不一定为 true
  const rootHasEffect =
    (finishedWork.flags &
      (BeforeMutationMask | MutationMask | LayoutMask | PassiveMask)) !==
    NoFlags;

  if (subtreeHasEffects || rootHasEffect) {
    const prevTransition = ReactCurrentBatchConfig.transition;
    ReactCurrentBatchConfig.transition = null;
    const previousPriority = getCurrentUpdatePriority();
    setCurrentUpdatePriority(DiscreteEventPriority);

    const prevExecutionContext = executionContext;
    executionContext |= CommitContext;

    // Reset this to null before calling lifecycles
    ReactCurrentOwner.current = null;

    // The commit phase is broken into several sub-phases. We do a separate pass
    // of the effect list for each phase: all mutation effects come before all
    // layout effects, and so on.

    // The first phase a "before mutation" phase. We use this phase to read the
    // state of the host tree right before we mutate it. This is where
    // getSnapshotBeforeUpdate is called.
    // 处理 Snapshot flag 
    const shouldFireAfterActiveInstanceBlur = commitBeforeMutationEffects(
      root,
      finishedWork,
    );

    // The next phase is the mutation phase, where we mutate the host tree.
    commitMutationEffects(root, finishedWork, lanes);

    resetAfterCommit(root.containerInfo);

    // The work-in-progress tree is now the current tree. This must come after
    // the mutation phase, so that the previous tree is still current during
    // componentWillUnmount, but before the layout phase, so that the finished
    // work is current during componentDidMount/Update.
    root.current = finishedWork;

    // The next phase is the layout phase, where we call effects that read
    // the host tree after it's been mutated. The idiomatic use case for this is
    // layout, but class component lifecycles also fire here for legacy reasons.

    commitLayoutEffects(finishedWork, root, lanes);
    // Tell Scheduler to yield at the end of the frame, so the browser has an
    // opportunity to paint.
    requestPaint();

    executionContext = prevExecutionContext;

    // Reset the priority to the previous non-sync value.
    setCurrentUpdatePriority(previousPriority);
    ReactCurrentBatchConfig.transition = prevTransition;
  } else {
    // No effects.
    root.current = finishedWork;
  }

  const rootDidHavePassiveEffects = rootDoesHavePassiveEffects;

  if (rootDoesHavePassiveEffects) {
    // This commit has passive effects. Stash a reference to them. But don't
    // schedule a callback until after flushing layout work.
    rootDoesHavePassiveEffects = false;
    rootWithPendingPassiveEffects = root;
    pendingPassiveEffectsLanes = lanes;
  } else {
    // There were no passive effects, so we can immediately release the cache
    // pool for this render.
    releaseRootPooledCache(root, remainingLanes);
  }

  // Read this again, since an effect might have updated it
  remainingLanes = root.pendingLanes;

  if (remainingLanes === NoLanes) {
    // If there's no remaining work, we can clear the set of already failed
    // error boundaries.
    legacyErrorBoundariesThatAlreadyFailed = null;
  }


  onCommitRootDevTools(finishedWork.stateNode, renderPriorityLevel);

  // Always call this before exiting `commitRoot`, to ensure that any
  // additional work on this root is scheduled.
  ensureRootIsScheduled(root, now());

  if (recoverableErrors !== null) {
    // There were errors during this render, but recovered from them without
    // needing to surface it to the UI. We log them here.
    const onRecoverableError = root.onRecoverableError;
    for (let i = 0; i < recoverableErrors.length; i++) {
      const recoverableError = recoverableErrors[i];
      onRecoverableError(recoverableError);
    }
  }

  if (hasUncaughtError) {
    hasUncaughtError = false;
    const error = firstUncaughtError;
    firstUncaughtError = null;
    throw error;
  }

  if (
    includesSomeLane(pendingPassiveEffectsLanes, SyncLane) &&
    root.tag !== LegacyRoot
  ) {
    flushPassiveEffects();
  }

  // Read this again, since a passive effect might have updated it
  remainingLanes = root.pendingLanes;
  if (includesSomeLane(remainingLanes, (SyncLane as Lane))) {

    // Count the number of times the root synchronously re-renders without
    // finishing. If there are too many, it indicates an infinite update loop.
    if (root === rootWithNestedUpdates) {
      nestedUpdateCount++;
    } else {
      nestedUpdateCount = 0;
      rootWithNestedUpdates = root;
    }
  } else {
    nestedUpdateCount = 0;
  }

  // If layout work was scheduled, flush it now.
  flushSyncCallbacks();

  return null;
}
```   

整个 commitRoot 的步骤可以分成 3 个阶段：   

- before mutation: 一般 getSnapshotBeforeUpdate 在这里调用
- mutation: 这里修改 dom 树    
- layout

### commitBeforeMutationEffects   

总的来说，这个遍历过程我没看懂，直觉上来看是处理了树中的 Snapshot flag。   

仔细看看的话，类似与 beginWorl 和 completeWork 的流程，深度优先遍历。   


```ts
export function commitBeforeMutationEffects(
  root: FiberRoot,
  firstChild: Fiber,  // hostRoot
) {
  // 可能是 false
  focusedInstanceHandle = prepareForCommit(root.containerInfo);

  nextEffect = firstChild;
  commitBeforeMutationEffects_begin();

  // We no longer need to track the active instance fiber
  const shouldFire = shouldFireAfterActiveInstanceBlur;
  shouldFireAfterActiveInstanceBlur = false;
  focusedInstanceHandle = null;

  return shouldFire;
}

function prepareForCommit(containerInfo: Container): Object | null {
  eventsEnabled = ReactBrowserEventEmitterIsEnabled();
  selectionInformation = getSelectionInformation();
  let activeInstance = null;
  ReactBrowserEventEmitterSetEnabled(false);
  return activeInstance;
}

function commitBeforeMutationEffects_begin() {
  // 深度遍历
  // 遍历过程类似 beginWork 的过程，先向下找，找的一个满足要求的节点后，complete
  // 然后看兄弟，继续 begin，如果没有兄弟就向上 complete
  while (nextEffect !== null) {
    const fiber = nextEffect;
    const child = fiber.child;
    if (
      (fiber.subtreeFlags & BeforeMutationMask) !== NoFlags &&
      child !== null
    ) {
      // child.return = fiber
      // 没懂啊，怎么直接到 child 了？这个意思是找到添加 flag 的那个节点
      // 也不对，感觉是找到打了 flag 最深的那个节点
      ensureCorrectReturnPointer(child, fiber);
      nextEffect = child;
    } else {
      // 走 else 的话，一般来说就是找到了一个 BeforeMutationMask flag 的节点
      commitBeforeMutationEffects_complete();
    }
  }
}

function commitBeforeMutationEffects_complete() {
  while (nextEffect !== null) {
    const fiber = nextEffect;
    try {
      commitBeforeMutationEffectsOnFiber(fiber);
    } catch (error) {
      captureCommitPhaseError(fiber, fiber.return, error);
    }

    const sibling = fiber.sibling;
    if (sibling !== null) {
      ensureCorrectReturnPointer(sibling, fiber.return);
      nextEffect = sibling;
      return;
    }

    nextEffect = fiber.return;
  }
}
```     

#### commitBeforeMutationEffectsOnFiber   

```ts
function commitBeforeMutationEffectsOnFiber(finishedWork: Fiber) {
  const current = finishedWork.alternate;
  const flags = finishedWork.flags;

  if ((flags & Snapshot) !== NoFlags) {
    // 本身打了 Snaphost flag

    switch (finishedWork.tag) {
      // 话说这3种可能打 Snapshot?
      case FunctionComponent:
      case ForwardRef:
      case SimpleMemoComponent: {
        break;
      }
      case ClassComponent: {
        if (current !== null) {
          const prevProps = current.memoizedProps;
          const prevState = current.memoizedState;
          const instance = finishedWork.stateNode;
          // We could update instance props and state here,
          // but instead we rely on them being set during last render.
          const snapshot = instance.getSnapshotBeforeUpdate(
            finishedWork.elementType === finishedWork.type
              ? prevProps
              : resolveDefaultProps(finishedWork.type, prevProps),
            prevState,
          );
          instance.__reactInternalSnapshotBeforeUpdate = snapshot;
        }
        break;
      }
      case HostRoot: {
        const root = finishedWork.stateNode;
        clearContainer(root.containerInfo);
        break;
      }
      case HostComponent:
      case HostText:
      case HostPortal:
      case IncompleteClassComponent:
        // Nothing to do for these component types
        break;
      default: {
        throw new Error(
          'This unit of work tag should not have side-effects. This error is ' +
            'likely caused by a bug in React. Please file an issue.',
        );
      }
    }
  }
}
```     

基本上只可能 ClassComponent 有 Snapshot flag，执行了 getSnapshotBeforeUpdate。   

### commitMutationEffects

```ts
export function commitMutationEffects(
  root: FiberRoot,
  firstChild: Fiber,
  committedLanes: Lanes,
) {
  inProgressLanes = committedLanes;
  inProgressRoot = root;
  nextEffect = firstChild;

  commitMutationEffects_begin(root, committedLanes);

  inProgressLanes = null;
  inProgressRoot = null;
}

function commitMutationEffects_begin(root: FiberRoot, lanes: Lanes) {
  while (nextEffect !== null) {
    const fiber = nextEffect;

    const deletions = fiber.deletions;
    // 节点删除
    if (deletions !== null) {
      for (let i = 0; i < deletions.length; i++) {
        const childToDelete = deletions[i];
        try {
          // 卸载 fiber 节点为根的子树，同时从 dom 中移除对应的 dom 结构
          commitDeletion(root, childToDelete, fiber);
        } catch (error) {
          captureCommitPhaseError(childToDelete, fiber, error);
        }
      }
    }

    const child = fiber.child;
    if ((fiber.subtreeFlags & MutationMask) !== NoFlags && child !== null) {
      ensureCorrectReturnPointer(child, fiber);
      nextEffect = child;
    } else {
      commitMutationEffects_complete(root, lanes);
    }
  }
}
```    

其实除去具体 `commitMutationEffectsOnFiber` 以外，Mutation 和 BeforeMutation 的功能都大体差不多，首先
是 `commitXXXEffects_begin`，深度有限遍历找到第一个打了对应 flag 的节点，找到以后就针对这个节点进行
`commitXXXEffects_complete`，进行 `commitXXXEffectOnFiber` 对节点具体的 tag 进行处理，处理完以后回到
complete 中，如果有 sibling 就从 sibling 继续 begin 流程，否则就回到上层进行 complete。   

而 beforeMutation 中需要处理的 flag 其实就 Snapshot 一个，就比较简单，而 mutation 的话，flag 就比较多了，
首先在 begin 中就进入了 deletion 操作，然后在 onFiber 中又处理了其他的 flag。

#### commitDeletion   

```ts
function commitDeletion(
  finishedRoot: FiberRoot,
  current: Fiber,
  nearestMountedAncestor: Fiber,
): void {
  unmountHostComponents(finishedRoot, current, nearestMountedAncestor);
  detachFiberMutation(current);
}

function unmountHostComponents(
  finishedRoot: FiberRoot,
  current: Fiber,
  nearestMountedAncestor: Fiber,
): void {
  // We only have the top Fiber that was deleted but we need to recurse down its
  // children to find all the terminal nodes.
  let node: Fiber = current;

  // Each iteration, currentParent is populated with node's host parent if not
  // currentParentIsValid.
  let currentParentIsValid = false;

  // Note: these two variables *must* always be updated together.
  let currentParent;
  let currentParentIsContainer;

  while (true) {
    // 看样子这里是找到最近的一个 HostRoot/HostPortal 容器或者 HostComponent
    // 即，首先向上找到最近的 HostComponent/HostRoot/HostPortal 节点
    // 注意不同的节点 tab，currentParent 值的意义不同
    if (!currentParentIsValid) {
      let parent = node.return;
      findParent: while (true) {
        const parentStateNode = parent.stateNode;
        switch (parent.tag) {
          case HostComponent:
            currentParent = parentStateNode;
            currentParentIsContainer = false;
            break findParent;
          case HostRoot:
            currentParent = parentStateNode.containerInfo;
            currentParentIsContainer = true;
            break findParent;
          case HostPortal:
            currentParent = parentStateNode.containerInfo;
            currentParentIsContainer = true;
            break findParent;
        }
        parent = parent.return;
      }
      currentParentIsValid = true;
    }

    if (node.tag === HostComponent || node.tag === HostText) {
      // 如果是 dom 节点，就递归卸载整个子树
      commitNestedUnmounts(finishedRoot, node, nearestMountedAncestor);
      // After all the children have unmounted, it is now safe to remove the
      // node from the tree.
      // 如果向上找到的 dom 容器是一个 hostRoot fiber 节点，那这种相当于当前 fiber 就是最顶层的 dom 节点了
      // 直接从 react 应用挂载的 dom 元素上删除这个 dom 节点
      if (currentParentIsContainer) {
        removeChildFromContainer(
          ((currentParent as any) as Container),
          (node.stateNode as Instance | TextInstance),
        );
      } else {
        // 也是 removeChild
        // 否则从最近的 hostComponent 上删除
        removeChild(
          ((currentParent as any) as Instance),
          (node.stateNode as Instance | TextInstance),
        );
      }
      // Don't visit children because we already visited them.
    } else if (node.tag === HostPortal) {
      if (node.child !== null) {
        // When we go into a portal, it becomes the parent to remove from.
        // We will reassign it back when we pop the portal on the way up.
        currentParent = node.stateNode.containerInfo;
        currentParentIsContainer = true;
        // Visit children because portals might contain host components.
        node.child.return = node;
        node = node.child;
        continue;
      }
    } else {
      // 普通的 ClassComponent, FunctionComponent
      // 首先卸载当前节点，然后递归向下处理
      commitUnmount(finishedRoot, node, nearestMountedAncestor);
      // Visit children because we may find more host components below.
      if (node.child !== null) {
        node.child.return = node;
        node = node.child;
        continue;
      }
    }
    if (node === current) {
      return;
    }
    while (node.sibling === null) {
      if (node.return === null || node.return === current) {
        return;
      }
      node = node.return;
      if (node.tag === HostPortal) {
        // When we go out of the portal, we need to restore the parent.
        // Since we don't keep a stack of them, we will search for it.
        currentParentIsValid = false;
      }
    }
    node.sibling.return = node.return;
    node = node.sibling;
  }
}

// 如果当前要卸载的节点是 dom 节点，就从当前节点开始，和之前见过的很多遍历过程一样
// 深度优先遍历，不过是先序遍历，从上到下，一个个卸载节点，说是卸载，其实有作用的一般就是函数组件
// 和类组件，函数组件就是调用 effect.destory，类组件就是调用 componentWillUnmount
// 处理完当前节点就看 兄弟节点，否则就向上卸载父亲节点
// 这样遍历完成后，整个子树就都卸载完成了，不过 dom 结构还并未解体
function commitNestedUnmounts(
  finishedRoot: FiberRoot,
  root: Fiber,
  nearestMountedAncestor: Fiber,
): void {
  // While we're inside a removed host node we don't want to call
  // removeChild on the inner nodes because they're removed by the top
  // call anyway. We also want to call componentWillUnmount on all
  // composites before this host node is removed from the tree. Therefore
  // we do an inner loop while we're still inside the host node.
  let node: Fiber = root;
  while (true) {
    commitUnmount(finishedRoot, node, nearestMountedAncestor);
    if (
      node.child !== null 
    ) {
      node.child.return = node;
      node = node.child;
      continue;
    }
    if (node === root) {
      return;
    }
    while (node.sibling === null) {
      if (node.return === null || node.return === root) {
        return;
      }
      node = node.return;
    }
    node.sibling.return = node.return;
    node = node.sibling;
  }
}

function commitUnmount(
  finishedRoot: FiberRoot,
  current: Fiber,
  nearestMountedAncestor: Fiber,
): void {
  onCommitUnmount(current);

  switch (current.tag) {
    case FunctionComponent:
    case ForwardRef:
    case MemoComponent:
    case SimpleMemoComponent: {
      const updateQueue: FunctionComponentUpdateQueue | null = (current.updateQueue as any);
      if (updateQueue !== null) {
        const lastEffect = updateQueue.lastEffect;
        if (lastEffect !== null) {
          const firstEffect = lastEffect.next;

          let effect = firstEffect;
          do {
            const {destroy, tag} = effect;
            if (destroy !== undefined) {
              if ((tag & HookInsertion) !== NoHookEffect) {
                safelyCallDestroy(current, nearestMountedAncestor, destroy);
              } else if ((tag & HookLayout) !== NoHookEffect) {
                if (enableSchedulingProfiler) {
                  markComponentLayoutEffectUnmountStarted(current);
                }

                safelyCallDestroy(current, nearestMountedAncestor, destroy);
              }
            }
            effect = effect.next;
          } while (effect !== firstEffect);
        }
      }
      return;
    }
    case ClassComponent: {
      safelyDetachRef(current, nearestMountedAncestor);
      const instance = current.stateNode;
      if (typeof instance.componentWillUnmount === 'function') {
        safelyCallComponentWillUnmount(
          current,
          nearestMountedAncestor,
          instance,
        );
      }
      return;
    }
    case HostComponent: {
      safelyDetachRef(current, nearestMountedAncestor);
      return;
    }
    case HostPortal: {
      // TODO: this is recursive.
      // We are also not using this parent because
      // the portal will get pushed immediately.
        unmountHostComponents(finishedRoot, current, nearestMountedAncestor);

      return;
    }
  }
}
```   

#### commitMutationEffects_complete

```ts
function commitMutationEffects_complete(root: FiberRoot, lanes: Lanes) {
  while (nextEffect !== null) {
    const fiber = nextEffect;
    try {
      commitMutationEffectsOnFiber(fiber, root, lanes);
    } catch (error) {
      captureCommitPhaseError(fiber, fiber.return, error);
    }

    const sibling = fiber.sibling;
    if (sibling !== null) {
      ensureCorrectReturnPointer(sibling, fiber.return);
      nextEffect = sibling;
      return;
    }

    nextEffect = fiber.return;
  }
}
```   

#### commitMutationEffectsOnFiber    

```ts
function commitMutationEffectsOnFiber(
  finishedWork: Fiber,
  root: FiberRoot,
  lanes: Lanes,
) {
  const flags = finishedWork.flags;

  if (flags & ContentReset) {
    // 设置节点的 textContent 为空串
    commitResetTextContent(finishedWork);
  }

  if (flags & Ref) {
    const current = finishedWork.alternate;
    if (current !== null) {
      commitDetachRef(current);
    }
  }

  // The following switch statement is only concerned about placement,
  // updates, and deletions. To avoid needing to add a case for every possible
  // bitmap value, we remove the secondary effects from the effect tag and
  // switch on that value.
  const primaryFlags = flags & (Placement | Update | Hydrating);
  outer: switch (primaryFlags) {
    case Placement: {
      commitPlacement(finishedWork);
      // Clear the "placement" from effect tag so that we know that this is
      // inserted, before any life-cycles like componentDidMount gets called.
      // TODO: findDOMNode doesn't rely on this any more but isMounted does
      // and isMounted is deprecated anyway so we should be able to kill this.
      finishedWork.flags &= ~Placement;
      break;
    }
    case PlacementAndUpdate: {
      // Placement
      commitPlacement(finishedWork);
      // Clear the "placement" from effect tag so that we know that this is
      // inserted, before any life-cycles like componentDidMount gets called.
      finishedWork.flags &= ~Placement;

      // Update
      const current = finishedWork.alternate;
      commitWork(current, finishedWork);
      break;
    }
    case Hydrating: {
      finishedWork.flags &= ~Hydrating;
      break;
    }
    case HydratingAndUpdate: {
      finishedWork.flags &= ~Hydrating;

      // Update
      const current = finishedWork.alternate;
      commitWork(current, finishedWork);
      break;
    }
    case Update: {
      const current = finishedWork.alternate;
      commitWork(current, finishedWork);
      break;
    }
  }
}
```      

#### commitPlacement   

对于 Placement 来说，要更新的 dom 应该在 placement fiber 下最近的 dom fiber 上，这种 dom fiber
可能会有多个吧，比如一个数组。   

这里具体干了什么没看懂，但大致意思应该是插入 dom 节点到现在的树上。  

```ts
function commitPlacement(finishedWork: Fiber): void {
  // Recursively insert all host nodes into the parent.
  // 找到一个 HostXXX Fiber 节点
  const parentFiber = getHostParentFiber(finishedWork);

  // Note: these two variables *must* always be updated together.
  switch (parentFiber.tag) {
    case HostComponent: {
      const parent: Instance = parentFiber.stateNode;
      if (parentFiber.flags & ContentReset) {
        // Reset the text content of the parent before doing any insertions
        resetTextContent(parent);
        // Clear ContentReset from the effect tag
        parentFiber.flags &= ~ContentReset;
      }

      const before = getHostSibling(finishedWork);
      // We only have the top Fiber that was inserted but we need to recurse down its
      // children to find all the terminal nodes.
      // 貌似就是直接在父 host 中 appendChild 或者有 before 的话在他前面插入
      insertOrAppendPlacementNode(finishedWork, before, parent);
      break;
    }
    case HostRoot:
    case HostPortal: {
      const parent: Container = parentFiber.stateNode.containerInfo;
      const before = getHostSibling(finishedWork);
      insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
      break;
    }
    // eslint-disable-next-line-no-fallthrough
    default:
      throw new Error(
        'Invalid host parent fiber. This error is likely caused by a bug ' +
          'in React. Please file an issue.',
      );
  }
}

// 老实说不知道这个干了什么，看注释是找到了一个兄弟 host fiber 节点
function getHostSibling(fiber: Fiber): Instance {
  // We're going to search forward into the tree until we find a sibling host
  // node. Unfortunately, if multiple insertions are done in a row we have to
  // search past them. This leads to exponential search for the next sibling.
  // TODO: Find a more efficient way to do this.
  let node: Fiber = fiber;
  siblings: while (true) {
    // If we didn't find anything, let's try the next sibling.
    // 这是想向上搜索，找到一个有兄弟节点的祖先节点？
    while (node.sibling === null) {
      if (node.return === null || isHostParent(node.return)) {
        // If we pop out of the root or hit the parent the fiber we are the
        // last sibling.
        return null;
      }
      node = node.return;
    }
    node.sibling.return = node.return;
    node = node.sibling;
    while (
      node.tag !== HostComponent &&
      node.tag !== HostText &&
      node.tag !== DehydratedFragment
    ) {
      // If it is not host node and, we might have a host node inside it.
      // Try to search down until we find one.
      if (node.flags & Placement) {
        // If we don't have a child, try the siblings instead.
        continue siblings;
      }
      // If we don't have a child, try the siblings instead.
      // We also skip portals because they are not part of this host tree.
      if (node.child === null || node.tag === HostPortal) {
        continue siblings;
      } else {
        node.child.return = node;
        node = node.child;
      }
    }
    // Check if this host node is stable or about to be placed.
    if (!(node.flags & Placement)) {
      // Found it!
      return node.stateNode;
    }
  }
}
```    

#### commitWork   

commmtWork 的工作可以分为两类，对于函数式组件，需要处理 layoutEffect 的 destroy，对于 hostComponent 需要处理属性的更新。    

```ts
function commitWork(current: Fiber | null, finishedWork: Fiber): void {

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
    case ClassComponent: {
      return;
    }
    case HostComponent: {
      const instance: Instance = finishedWork.stateNode;
      if (instance != null) {
        // Commit the work prepared earlier.
        const newProps = finishedWork.memoizedProps;
        // For hydration we reuse the update path but we treat the oldProps
        // as the newProps. The updatePayload will contain the real change in
        // this case.
        const oldProps = current !== null ? current.memoizedProps : newProps;
        const type = finishedWork.type;
        // TODO: Type the updateQueue to be specific to host components.
        const updatePayload: null | UpdatePayload = (finishedWork.updateQueue as any);
        finishedWork.updateQueue = null;
        if (updatePayload !== null) {
          commitUpdate(
            instance,
            updatePayload,
            type,
            oldProps,
            newProps,
            finishedWork,
          );
        }
      }
      return;
    }
    case HostText: {
      if (finishedWork.stateNode === null) {
        throw new Error(
          'This should have a text node initialized. This error is likely ' +
            'caused by a bug in React. Please file an issue.',
        );
      }

      const textInstance: TextInstance = finishedWork.stateNode;
      const newText: string = finishedWork.memoizedProps;
      // For hydration we reuse the update path but we treat the oldProps
      // as the newProps. The updatePayload will contain the real change in
      // this case.
      const oldText: string =
        current !== null ? current.memoizedProps : newText;
      commitTextUpdate(textInstance, oldText, newText);
      return;
    }
    case HostRoot: {
      if (supportsHydration) {
        if (current !== null) {
          const prevRootState: RootState = current.memoizedState;
          if (prevRootState.isDehydrated) {
            const root: FiberRoot = finishedWork.stateNode;
            commitHydratedContainer(root.containerInfo);
          }
        }
      }
      return;
    }
    case Profiler: {
      return;
    }
    case SuspenseComponent: {
      commitSuspenseCallback(finishedWork);
      attachSuspenseRetryListeners(finishedWork);
      return;
    }
    case SuspenseListComponent: {
      attachSuspenseRetryListeners(finishedWork);
      return;
    }
    case IncompleteClassComponent: {
      return;
    }
    case ScopeComponent: {
      if (enableScopeAPI) {
        const scopeInstance = finishedWork.stateNode;
        prepareScopeUpdate(scopeInstance, finishedWork);
        return;
      }
      break;
    }
  }

  throw new Error(
    'This unit of work tag should not have side-effects. This error is ' +
      'likely caused by a bug in React. Please file an issue.',
  );
}
```   

### mutationEffects 总结

所以 beforeMutationEffects 基本上就是处理类组件的 snapshot flag，而 mutationEffects 的话，任务比较多了，
首先是 childDeletion，处理节点的删除，递归从上到下一个个节点进行卸载，最后把 dom 结构从页面删除，其次是 placement，这个的话主要是 dom 节点的插入，负责把新的 dom 节点插入到页面上，然后是 update，包括函数组件的 update
和 hostComponent 的 update，函数组件的 update 就是 layoutEffect 的 destroy，hostComponent 组件的 update 就是 dom 属性的更新。   

### commitLayoutEffects

```ts
function commitLayoutEffects(
  finishedWork: Fiber,
  root: FiberRoot,
  committedLanes: Lanes,
): void {
  inProgressLanes = committedLanes;
  inProgressRoot = root;
  nextEffect = finishedWork;

  commitLayoutEffects_begin(finishedWork, root, committedLanes);

  inProgressLanes = null;
  inProgressRoot = null;
}
```    

#### commitLayoutEffects_begin   

```ts
function commitLayoutEffects_begin(
  subtreeRoot: Fiber,
  root: FiberRoot,
  committedLanes: Lanes,
) {
  // Suspense layout effects semantics don't change for legacy roots.
  const isModernRoot = (subtreeRoot.mode & ConcurrentMode) !== NoMode;

  while (nextEffect !== null) {
    const fiber = nextEffect;
    const firstChild = fiber.child;

    if ((fiber.subtreeFlags & LayoutMask) !== NoFlags && firstChild !== null) {
      ensureCorrectReturnPointer(firstChild, fiber);
      nextEffect = firstChild;
    } else {
      commitLayoutMountEffects_complete(subtreeRoot, root, committedLanes);
    }
  }
}

function commitLayoutMountEffects_complete(
  subtreeRoot: Fiber,
  root: FiberRoot,
  committedLanes: Lanes,
) {
  while (nextEffect !== null) {
    const fiber = nextEffect;
    if ((fiber.flags & LayoutMask) !== NoFlags) {
      const current = fiber.alternate;
      try {
        commitLayoutEffectOnFiber(root, current, fiber, committedLanes);
      } catch (error) {
        captureCommitPhaseError(fiber, fiber.return, error);
      }
    }

    if (fiber === subtreeRoot) {
      nextEffect = null;
      return;
    }

    const sibling = fiber.sibling;
    if (sibling !== null) {
      ensureCorrectReturnPointer(sibling, fiber.return);
      nextEffect = sibling;
      return;
    }

    nextEffect = fiber.return;
  }
}
```    

#### commitLayoutEffectOnFiber

```ts
function commitLayoutEffectOnFiber(
  finishedRoot: FiberRoot,
  current: Fiber | null,
  finishedWork: Fiber,
  committedLanes: Lanes,
): void {
  if ((finishedWork.flags & LayoutMask) !== NoFlags) {
    switch (finishedWork.tag) {
      case FunctionComponent:
      case ForwardRef:
      case SimpleMemoComponent: {
        if (
          !enableSuspenseLayoutEffectSemantics ||
          !offscreenSubtreeWasHidden
        ) {
          // At this point layout effects have already been destroyed (during mutation phase).
          // This is done to prevent sibling component effects from interfering with each other,
          // e.g. a destroy function in one component should never override a ref set
          // by a create function in another component during the same commit.
        commitHookEffectListMount(HookLayout | HookHasEffect, finishedWork);

        }
        break;
      }
      case ClassComponent: {
        const instance = finishedWork.stateNode;
        if (finishedWork.flags & Update) {
          if (!offscreenSubtreeWasHidden) {
            if (current === null) {
              // We could update instance props and state here,
              // but instead we rely on them being set during last render.
              // TODO: revisit this when we implement resuming.
                instance.componentDidMount();

            } else {
              const prevProps =
                finishedWork.elementType === finishedWork.type
                  ? current.memoizedProps
                  : resolveDefaultProps(
                      finishedWork.type,
                      current.memoizedProps,
                    );
              const prevState = current.memoizedState;
              // We could update instance props and state here,
              // but instead we rely on them being set during last render.
              // TODO: revisit this when we implement resuming.

              instance.componentDidUpdate(
                  prevProps,
                  prevState,
                  instance.__reactInternalSnapshotBeforeUpdate,
                );
            }
          }
        }

        // TODO: I think this is now always non-null by the time it reaches the
        // commit phase. Consider removing the type check.
        const updateQueue: UpdateQueue<
          *,
        > | null = (finishedWork.updateQueue as any);
        if (updateQueue !== null) {
          // We could update instance props and state here,
          // but instead we rely on them being set during last render.
          // TODO: revisit this when we implement resuming.
          commitUpdateQueue(finishedWork, updateQueue, instance);
        }
        break;
      }
      case HostRoot: {
        // TODO: I think this is now always non-null by the time it reaches the
        // commit phase. Consider removing the type check.
        const updateQueue: UpdateQueue<
          *,
        > | null = (finishedWork.updateQueue as any);
        if (updateQueue !== null) {
          let instance = null;
          if (finishedWork.child !== null) {
            switch (finishedWork.child.tag) {
              case HostComponent:
                instance = getPublicInstance(finishedWork.child.stateNode);
                break;
              case ClassComponent:
                instance = finishedWork.child.stateNode;
                break;
            }
          }
          commitUpdateQueue(finishedWork, updateQueue, instance);
        }
        break;
      }
      case HostComponent: {
        const instance: Instance = finishedWork.stateNode;

        // Renderers may schedule work to be done after host components are mounted
        // (eg DOM renderer may schedule auto-focus for inputs and form controls).
        // These effects should only be committed when components are first mounted,
        // aka when there is no current/alternate.
        if (current === null && finishedWork.flags & Update) {
          const type = finishedWork.type;
          const props = finishedWork.memoizedProps;
          commitMount(instance, type, props, finishedWork);
        }

        break;
      }
      case HostText: {
        // We have no life-cycles associated with text.
        break;
      }
      case HostPortal: {
        // We have no life-cycles associated with portals.
        break;
      }
      case SuspenseComponent: {
        commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
        break;
      }
      case SuspenseListComponent:
      case IncompleteClassComponent:
      case ScopeComponent:
      case OffscreenComponent:
      case LegacyHiddenComponent: {
        break;
      }

      default:
        throw new Error(
          'This unit of work tag should not have side-effects. This error is ' +
            'likely caused by a bug in React. Please file an issue.',
        );
    }
  }

  if (!enableSuspenseLayoutEffectSemantics || !offscreenSubtreeWasHidden) {
    if (enableScopeAPI) {
      // TODO: This is a temporary solution that allowed us to transition away
      // from React Flare on www.
      if (finishedWork.flags & Ref && finishedWork.tag !== ScopeComponent) {
        commitAttachRef(finishedWork);
      }
    } else {
      if (finishedWork.flags & Ref) {
        commitAttachRef(finishedWork);
      }
    }
  }
}
```    

layoutEffects 的功能也不少，首先也是根据 tag 分情况讨论，对于函数组件，主要是 layoutEffect 的 create，
对于类组件就是 `componentDidMount` 和 `componentDidUpdate` 的调用。同时还是 updateQueue 的处理，
就 updateQueue.effects 上的回调，要调用一下啊。对于 HostComponent 的话就比较简单，对于带有 autoFocus 的输入
元素，focus 一下，对于 img 元素设置 src 属性。   

### 总结

就先这样吧，不是很想看了。    