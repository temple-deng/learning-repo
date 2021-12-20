import {
    Fiber,
    FiberRoot,
    Lane,
    Lanes,
    NoLanes,
    SyncLane,
    laneToIndex,
    IdleLane,
    NoMode,
    ConcurrentMode,
    LegacyRoot,
    mergeLanes
} from './const';

// react-reconciler/ReactFiberWorkLoop.old.js
// 变更输入接口，话说这里为什么要返回 FiberRoot 呢
// 看别人解释 EC 代表渲染阶段的执行栈，也就是 performUnitOfWork 估计可能用到
type ExecutionContext = number;
const NoContext =        /*             */ 0b0000;
const BatchedContext = /*               */ 0b0001;
const RenderContext = /*                */ 0b0010;
const CommitContext = /*                */ 0b0100;
const LegacyUnbatchedContext = /*       */ 0b0001000;
let executionContext: ExecutionContext = NoContext;
let workInProgressRoot: FiberRoot | null = null;
let workInProgress: Fiber | null = null;
let workInProgressRootRenderLanes: Lanes = NoLanes;
function checkForNestedUpdates() {}

function markUpdateLaneFromFiberToRoot(
    sourceFiber: Fiber,
    lane: Lane,
): FiberRoot | null {
    // Update the source fiber's lanes
    // 相当于把本次更新的 lane 合到当前 fiber 的lanes 中
    sourceFiber.lanes = mergeLanes(sourceFiber.lanes, lane);
    let alternate = sourceFiber.alternate;
    if (alternate !== null) {
        alternate.lanes = mergeLanes(alternate.lanes, lane);
    }
    let node = sourceFiber;
    let parent = sourceFiber.return;
    // 从当前节点开始，把 updateLane 再同步到各个祖先节点的 childLanes
    while (parent !== null) {
        parent.childLanes = mergeLanes(parent.childLanes, lane);
        alternate = parent.alternate;
        if (alternate !== null) {
            alternate.childLanes = mergeLanes(alternate.childLanes, lane);
        }
        node = parent;
        parent = parent.return;
    }
    // 到了 hostRootFiber
    if (node.tag === HostRoot) {
        const root: FiberRoot = node.stateNode;
        return root;
    } else {
        return null;
    }
}

function markRootUpdated(
    root: FiberRoot,
    updateLane: Lane,
    eventTime: number,
) {
    root.pendingLanes |= updateLane;

    if (updateLane !== IdleLane) {
        root.suspendedLanes = NoLanes;
        root.pingedLanes = NoLanes;
    }
    const eventTimes = root.eventTimes;
    const index = laneToIndex(updateLane);
    eventTimes[index] = eventTime;
}

export function scheduleUpdateOnFiber(
    fiber: Fiber,
    lane: Lane,
    eventTime: number,
): FiberRoot | null {
    // 和名字差不多，应该是检查是不是有循环的地方，提示一下
    checkForNestedUpdates();

    // 标记 fiber 树的 lane
    const root = markUpdateLaneFromFiberToRoot(fiber, lane);
    if (root === null) {
        return null;
    }

    // 标记 fiberRoot 的pendingLane
    markRootUpdated(root, lane, eventTime);
    const priorityLevel = getCurrentPriorityLevel();

    // 在渲染过程中收到了更新请求 blabla
    if (root === workInProgressRoot) {
        // ...
    }
    // legacy 模式都走这
    if (lane === SyncLane) {
        if (
            // 不是太理解这的判断，当前 EC 是 LagacyUnbatchedContext &&
            // 不是 RenderContext 和 CommitContext，当时这个 EC 不是一个时候本身就一个可能吗
            // LegacyUnbatchedContext 这是个首次 render 的时候 renderSubtreeIntoContainer 里面设置的
            // Check if we're inside unbatchedUpdates
            (executionContext & LegacyUnbatchedContext) !== NoContext &&
            // Check if we're not already rendering
            (executionContext & (RenderContext | CommitContext)) === NoContext
        ) {
            performSyncWorkOnRoot(root);
        } else {
            ensureRootIsScheduled(root, eventTime);

            // 下面这个用法出现了很多次，
            if (executionContext === NoContext) {
                // Flush the synchronous work now, unless we're already working or inside
                // a batch. This is intentionally inside scheduleUpdateOnFiber instead of
                // scheduleCallbackForFiber to preserve the ability to schedule a callback
                // without immediately flushing it. We only do this for user-initiated
                // updates, to preserve historical behavior of legacy mode.
                resetRenderTimer();
                flushSyncCallbackQueue();
            }
        }
    }
}

function performSyncWorkOnRoot(root) {
    flushPassiveEffects();

    let lanes;
    let exitStatus;
    if (
        root === workInProgressRoot &&
        includesSomeLane(root.expiredLanes, workInProgressRootRenderLanes)
    )  {
        
    } else {
        lanes = getNextLanes(root, NoLanes);
        exitStatus = renderRootSync(root, lanes);
    }

    const finishedWork: Fiber = (root.current.alternate: any);
    root.finishedWork = finishedWork;
    root.finishedLanes = lanes;
    commitRoot(root);

    // Before exiting, make sure there's a callback scheduled for the next
    // pending level.
    ensureRootIsScheduled(root, now());
}

function renderRootSync(root: FiberRoot, lanes: Lanes) {
    const prevExecutionContext = executionContext;
    // 注意这里修改了 EC
    // 那首次渲染，一开始 No，然后 unbatchedUpdate 里面
    // 设置 LegacyUnbatchedContext, 然后进入 scheduleUpdateOnFiber
    // 然后 performSyncWorkOnRoot，然后 renderRootSync
    // 这里再设置个 RenderContext
    executionContext |= RenderContext;
    const prevDispatcher = pushDispatcher();

    // 第一次渲染应该是可以进这的
    if (workInProgressRoot !== root || workInProgressRootRenderLanes !== lanes) {
        prepareFreshStack(root, lanes);
    }

    do {
        try {
            workLoopSync();
            break;
        } catch (thrownValue) {
            handleError(root, thrownValue);
        }
    } while (true);
    resetContextDependencies();


    executionContext = prevExecutionContext;
    popDispatcher(prevDispatcher);
    workInProgressRoot = null;
    workInProgressRootRenderLanes = NoLanes;

    return workInProgressRootExitStatus;
}

function workLoopSync() {
    // Already timed out, so perform work without checking if we need to yield.
    while (workInProgress !== null) {
        performUnitOfWork(workInProgress);
    }
}

function performUnitOfWork(unitOfWork: Fiber): void {
    const current = unitOfWork.alternate;
    let next = beginWork(current, unitOfWork, subtreeRenderLanes);
    unitOfWork.memoizedProps = unitOfWork.pendingProps;

    if (next === null) {
        // If this doesn't spawn new work, complete the current work.
        completeUnitOfWork(unitOfWork);
    } else {
        workInProgress = next;
    }
}


function beginWork(
    current: Fiber | null,
    workInProgress: Fiber,
    renderLanes: Lanes,
): Fiber | null {
    const updateLanes = workInProgress.lanes;

    if (current !== null) {
        // 第一次构建是走这里的
        const oldProps = current.memoizedProps;
        const newProps = workInProgress.pendingProps;
        if (
            oldProps !== newProps ||
            hasLegacyContextChanged()
        ) {
            didReceiveUpdate = true;
        } else if (!includesSomeLane(renderLanes, updateLanes)) {
            return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
        } else {
            if ((current.flags & ForceUpdateForLegacySuspense) !== NoFlags) {
                // This is a special case that only exists for legacy mode.
                // See https://github.com/facebook/react/pull/19216.
                didReceiveUpdate = true;
            } else {
                // An update was scheduled on this fiber, but there are no new props
                // nor legacy context. Set this to false. If an update queue or context
                // consumer produces a changed value, it will set this to true. Otherwise,
                // the component will assume the children have not changed and bail out.
                didReceiveUpdate = false;
            }
        }
    } else {
        didReceiveUpdate = false;
    }

    workInProgress.lanes = NoLanes;

    switch (workInProgress.tag) {
        case HostRoot:
            return updateHostRoot(current, workInProgress, renderLanes);
        case ClassComponent: {
            const Component = workInProgress.type;
            const unresolvedProps = workInProgress.pendingProps;
            const resolvedProps =
                // 这个意思是啥，如果前后两次类型相同，直接拿 props 就行，不然要
                // 处理下新的 defaultProps ？
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
        case HostComponent:
            return updateHostComponent(current, workInProgress, renderLanes);
    }
}

function updateHostRoot(current, workInProgress, renderLanes) {
    // pushHostRootContext(workInProgress);
    const updateQueue = workInProgress.updateQueue;

    const nextProps = workInProgress.pendingProps;
    const prevState = workInProgress.memoizedState;
    const prevChildren = prevState !== null ? prevState.element : null;
    cloneUpdateQueue(current, workInProgress);

    processUpdateQueue(workInProgress, nextProps, null, renderLanes);
    const nextState = workInProgress.memoizedState;
    // Caution: React DevTools currently depends on this property
    // being called "element".
    const nextChildren = nextState.element;
    if (nextChildren === prevChildren) {
        resetHydrationState();
        return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
    }
    const root: FiberRoot = workInProgress.stateNode;
    reconcileChildren(current, workInProgress, nextChildren, renderLanes);
    return workInProgress.child;
}

function updateClassComponent(
    current: Fiber | null,
    workInProgress: Fiber,
    Component: any,
    nextProps: any,
    renderLanes: Lanes,
) {
    const instance = workInProgress.stateNode;
    let shouldUpdate;
    if (instance === null) {
        if (current !== null) {
            // A class component without an instance only mounts if it suspended
            // inside a non-concurrent tree, in an inconsistent state. We want to
            // treat it like a new mount, even though an empty version of it already
            // committed. Disconnect the alternate pointers.
            current.alternate = null;
            workInProgress.alternate = null;
            // Since this is conceptually a new fiber, schedule a Placement effect
            workInProgress.flags |= Placement;
        }
        constructClassInstance(workInProgress, Component, nextProps);
        mountClassInstance(workInProgress, Component, nextProps, renderLanes);
        shouldUpdate = true;
    } else if (current === null) {
        // In a resume, we'll already have an instance we can reuse.
        shouldUpdate = resumeMountClassInstance(
            workInProgress,
            Component,
            nextProps,
            renderLanes,
        );
    } else {
        // 原来有，现在也有，更新，但是不能确保是同一个类吧
        shouldUpdate = updateClassInstance(
            current,
            workInProgress,
            Component,
            nextProps,
            renderLanes,
        );
    }
    const nextUnitOfWork = finishClassComponent(
        current,
        workInProgress,
        Component,
        shouldUpdate,
        hasContext,
        renderLanes,
    );
    return nextUnitOfWork;
}

function updateHostComponent(
    current: Fiber | null,
    workInProgress: Fiber,
    renderLanes: Lanes,
) {
    const type = workInProgress.type;
    const nextProps = workInProgress.pendingProps;
    const prevProps = current !== null ? current.memoizedProps : null;
    let nextChildren = nextProps.children;
    // 这里应该对 div 来说是否
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

// 调用类构造函数创建实例，绑在 stateNode 上
function constructClassInstance(
    workInProgress: Fiber,
    ctor: any,
    props: any,
): any {
    const instance = new ctor(props, context);
    const state = (workInProgress.memoizedState =
        instance.state !== null && instance.state !== undefined
        ? instance.state
        : null);
    adoptClassInstance(workInProgress, instance);
    return instance;
}

const classComponentUpdater = {
    isMounted,
    enqueueSetState(inst, payload, callback) {
        const fiber = getInstance(inst);
        const eventTime = requestEventTime();
        const lane = requestUpdateLane(fiber);
    
        const update = createUpdate(eventTime, lane);
        update.payload = payload;
        if (callback !== undefined && callback !== null) {
            update.callback = callback;
        }

        enqueueUpdate(fiber, update);
        scheduleUpdateOnFiber(fiber, lane, eventTime);
    },
}

function adoptClassInstance(workInProgress: Fiber, instance: any): void {
    instance.updater = classComponentUpdater;
    workInProgress.stateNode = instance;
    // The instance needs access to the fiber so that it can schedule updates
    setInstance(instance, workInProgress);
}

// 处理类实例的 state 和 props, context 等乱七八糟的属性，如果绑了 cdm 方法的话
// 打上 Update flag
function mountClassInstance(
    workInProgress: Fiber,
    ctor: any,
    newProps: any,
    renderLanes: Lanes,
): void {
    const instance = workInProgress.stateNode;
    instance.props = newProps;
    instance.state = workInProgress.memoizedState;
    instance.refs = emptyRefsObject;
    initializeUpdateQueue(workInProgress);

    processUpdateQueue(workInProgress, newProps, instance, renderLanes);
    instance.state = workInProgress.memoizedState;
    const getDerivedStateFromProps = ctor.getDerivedStateFromProps;
    if (typeof getDerivedStateFromProps === 'function') {
        applyDerivedStateFromProps(
            workInProgress,
            ctor,
            getDerivedStateFromProps,
            newProps,
        );
        instance.state = workInProgress.memoizedState;
    }

    if (typeof instance.componentDidMount === 'function') {
        workInProgress.flags |= Update;
    }
}

function finishClassComponent(
    current: Fiber | null,
    workInProgress: Fiber,
    Component: any,
    shouldUpdate: boolean,
    hasContext: boolean,
    renderLanes: Lanes,
) {
    // Refs should update even if shouldComponentUpdate returns false
    markRef(current, workInProgress);

    if (!shouldUpdate && !didCaptureError) {
        // Context providers should defer to sCU for rendering
        if (hasContext) {
            invalidateContextProvider(workInProgress, Component, false);
        }
    
        return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
    }
    const instance = workInProgress.stateNode;
    // 这里 render调用了
    let nextChildren = instance.render();
    reconcileChildren(current, workInProgress, nextChildren, renderLanes);
    workInProgress.memoizedState = instance.state;
    return workInProgress.child;
}

export function reconcileChildren(
    current: Fiber | null,
    workInProgress: Fiber,
    nextChildren: any,
    renderLanes: Lanes,
) {
    if (current === null) {
        // app 组件 performUnitOfWork 走这里
        // If this is a fresh new component that hasn't been rendered yet, we
        // won't update its child set by applying minimal side-effects. Instead,
        // we will add them all to the child before it gets rendered. That means
        // we can optimize this reconciliation pass by not tracking side-effects.
        workInProgress.child = mountChildFibers(
            workInProgress,
            null,
            nextChildren,
            renderLanes,
        );
    } else {
        // If the current child is the same as the work in progress, it means that
        // we haven't yet started any work on these children. Therefore, we use
        // the clone algorithm to create a copy of all the current children.

        // If we had any progressed work already, that is invalid at this point so
        // let's throw it out.
        // 有 current 树了，在 children 上开始工作
        workInProgress.child = reconcileChildFibers(
            workInProgress,
            current.child,
            nextChildren,
            renderLanes,
        );
    }
}

// mountChildFibers 和 reconcileChildFibers 基本是一个函数
function reconcileChildFibers(
    returnFiber: Fiber,  // wip
    currentFirstChild: Fiber | null, // cur.child
    newChild: any, // 一般是个 ReactElement
    lanes: Lanes,
): Fiber | null {
    const isUnkeyedTopLevelFragment =
    typeof newChild === 'object' &&
    newChild !== null &&
    newChild.type === REACT_FRAGMENT_TYPE &&
    newChild.key === null;
    if (isUnkeyedTopLevelFragment) {
        newChild = newChild.props.children;
    }

    const isObject = typeof newChild === 'object' && newChild !== null;

    if (isObject) {
        // 这里为什么叫 newChild
        switch (newChild.$$typeof) {
            case REACT_ELEMENT_TYPE:
                // 创建新节点，添加 Placement flag
                return placeSingleChild(
                    reconcileSingleElement(
                    returnFiber,
                    currentFirstChild,
                    newChild,
                    lanes,
                ),
            );
        }
    }

    // children 是 array 的情况在这
    if (isArray(newChild)) {
        return reconcileChildrenArray(
            returnFiber,
            currentFirstChild,
            newChild,
            lanes,
        );
    }
}

function reconcileSingleElement(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    element: ReactElement,
    lanes: Lanes,
): Fiber {
    const key = element.key;
    let child = currentFirstChild;

    while (child !== null) {
        // .....
    }

    if (element.type === REACT_FRAGMENT_TYPE) {
        const created = createFiberFromFragment(
            element.props.children,
            returnFiber.mode,
            lanes,
            element.key,
        );
        created.return = returnFiber;
        return created;
    } else {
        // 都是直接创建一个 fiber
        const created = createFiberFromElement(element, returnFiber.mode, lanes);
        created.ref = coerceRef(returnFiber, currentFirstChild, element);
        created.return = returnFiber;
        return created;
    }
}

export function createFiberFromElement(
    element: ReactElement,
    mode: TypeOfMode,
    lanes: Lanes,
): Fiber {
    let owner = null;
    const type = element.type;
    const key = element.key;
    const pendingProps = element.props;
    const fiber = createFiberFromTypeAndProps(
        type,
        key,
        pendingProps,
        owner,
        mode,
        lanes,
    );
    return fiber;
}


export function createFiberFromTypeAndProps(
    type: any, // React$ElementType
    key: null | string,
    pendingProps: any,
    owner: null | Fiber,
    mode: TypeOfMode,
    lanes: Lanes,
): Fiber {
    let fiberTag = IndeterminateComponent;
    let resolvedType = type;
    if (typeof type === 'function') {
        if (shouldConstruct(type)) {
            fiberTag = ClassComponent;
        }
        // 话说 FunctionComponent 不管了吗
    } else if  (typeof type === 'string') {
        fiberTag = HostComponent;
    }

    const fiber = createFiber(fiberTag, pendingProps, key, mode);
    fiber.elementType = type;
    fiber.type = resolvedType;

    // 注意这里，相当于给 fiber 设置了 renderLanes
    fiber.lanes = lanes;

    return fiber;
}

function reconcileChildrenArray(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    newChildren: Array<*>,
    lanes: Lanes,
): Fiber | null {
    let resultingFirstChild: Fiber | null = null;
    let previousNewFiber: Fiber | null = null;
    // 太长了，不想看，估计就是创建了很多 fiber 对象
}

function completeUnitOfWork(unitOfWork: Fiber): void {

    let completedWork = unitOfWork;

    do {
        const current = completedWork.alternate;
        const returnFiber = completedWork.return;

        // 应该会走这吧
        if ((completedWork.flags & Incomplete) === NoFlags) {
            let next = completeWork(current, completedWork, subtreeRenderLanes);

            // 话说什么时候会走这呢，奇怪
            if (next !== null) {
                // Completing this fiber spawned new work. Work on that next.
                workInProgress = next;
                return;
            }

            if (
                returnFiber !== null &&
                // Do not append effects to parents if a sibling failed to complete
                (returnFiber.flags & Incomplete) === NoFlags
            ) {
                // Append all the effects of the subtree and this fiber onto the effect
                // list of the parent. The completion order of the children affects the
                // side-effect order.
                if (returnFiber.firstEffect === null) {
                    returnFiber.firstEffect = completedWork.firstEffect;
                }
                if (completedWork.lastEffect !== null) {
                    if (returnFiber.lastEffect !== null) {
                        returnFiber.lastEffect.nextEffect = completedWork.firstEffect;
                    }
                    returnFiber.lastEffect = completedWork.lastEffect;
                }

                const flags = completedWork.flags;

                // Skip both NoWork and PerformedWork tags when creating the effect
                // list. PerformedWork effect is read by React DevTools but shouldn't be
                // committed.
                if (flags > PerformedWork) {
                    if (returnFiber.lastEffect !== null) {
                        returnFiber.lastEffect.nextEffect = completedWork;
                    } else {
                        returnFiber.firstEffect = completedWork;
                    }
                    returnFiber.lastEffect = completedWork;
                }
            }
        }

        const siblingFiber = completedWork.sibling;
        if (siblingFiber !== null) {
            // If there is more work to do in this returnFiber, do that next.
            workInProgress = siblingFiber;
            return;
        }
        // Otherwise, return to the parent
        completedWork = returnFiber;
        // Update the next thing we're working on in case something throws.
        workInProgress = completedWork;
    } while (true);
}

function completeWork(
    current: Fiber | null,
    workInProgress: Fiber,
    renderLanes: Lanes,
): Fiber | null {
    const newProps = workInProgress.pendingProps;

    switch (workInProgress.tag) {
        case HostComponent: {
            // 这个不知道是什么东西
            const rootContainerInstance = getRootHostContainer();
            const type = workInProgress.type;
            if (current !== null && workInProgress.stateNode != null) {
                // 这个下面的 updateHostComponent
                // completeWork 里面的和 beginWork 不是一个
                updateHostComponent(
                    current,
                    workInProgress,
                    type,
                    newProps,
                    rootContainerInstance,
                );

                if (current.ref !== workInProgress.ref) {
                    markRef(workInProgress);
                }
            } else {
                const currentHostContext = getHostContext();
                // TODO: Move createInstance to beginWork and keep it on a context
                // "stack" as the parent. Then append children as we go in beginWork
                // or completeWork depending on whether we want to add them top->down or
                // bottom->up. Top->down is faster in IE11.
                // 基本上应该就是创建了 dom 元素并返回
                const instance = createInstance(
                    type,
                    newProps,
                    rootContainerInstance,
                    currentHostContext,
                    workInProgress,
                );

                appendAllChildren(instance, workInProgress, false, false);

                workInProgress.stateNode = instance;

                // Certain renderers require commit-time effects for initial mount.
                // (eg DOM renderer supports auto-focus for certain elements).
                // Make sure such renderers get scheduled for later work.
                if (
                    finalizeInitialChildren(
                        instance,
                        type,
                        newProps,
                        rootContainerInstance,
                        currentHostContext,
                    )
                ) {
                    markUpdate(workInProgress);
                }
                

                if (workInProgress.ref !== null) {
                    // If there is a ref on a host node we need to schedule a callback
                    markRef(workInProgress);
                }
            }
            return null;
        }
        case ClassComponent: {
            const Component = workInProgress.type;
            // 这看起来没干啥
            if (isLegacyContextProvider(Component)) {
                popLegacyContext(workInProgress);
            }
            return null;
        }
    }
}

appendAllChildren = function(
    parent: Instance,
    workInProgress: Fiber,
    needsVisibilityToggle: boolean,
    isHidden: boolean,
  ) {
    // We only have the top Fiber that was created but we need recurse down its
    // children to find all the terminal nodes.
    let node = workInProgress.child;
    while (node !== null) {
      if (node.tag === HostComponent || node.tag === HostText) {
        appendInitialChild(parent, node.stateNode);
      } else if (enableFundamentalAPI && node.tag === FundamentalComponent) {
        appendInitialChild(parent, node.stateNode.instance);
      } else if (node.tag === HostPortal) {
        // If we have a portal child, then we don't want to traverse
        // down its children. Instead, we'll get insertions from each child in
        // the portal directly.
      } else if (node.child !== null) {
        node.child.return = node;
        node = node.child;
        continue;
      }
      if (node === workInProgress) {
        return;
      }
      while (node.sibling === null) {
        if (node.return === null || node.return === workInProgress) {
          return;
        }
        node = node.return;
      }
      node.sibling.return = node.return;
      node = node.sibling;
    }
};


function bailoutOnAlreadyFinishedWork(
    current: Fiber | null,
    workInProgress: Fiber,
    renderLanes: Lanes,
): Fiber | null {
    if (current !== null) {
        // Reuse previous dependencies
        workInProgress.dependencies = current.dependencies;
    }

    markSkippedUpdateLanes(workInProgress.lanes);

    if (!includesSomeLane(renderLanes, workInProgress.childLanes)) {
        // 渲染优先级不包括 workInProgress.childLanes, 表明子节点也无需更新. 返回null, 直接进入回溯阶段.
        // The children don't have any work either. We can skip them.
        // TODO: Once we add back resuming, we should check if the children are
        // a work-in-progress set. If so, we need to transfer their effects.
        return null;
    } else {
        // This fiber doesn't have work, but its subtree does. Clone the child
        // fibers and continue.
         // 本fiber虽然不用更新, 但是子节点需要更新. clone并返回子节点
        cloneChildFibers(current, workInProgress);
        return workInProgress.child;
    }
}

function updateClassInstance(
    current: Fiber,
    workInProgress: Fiber,
    ctor: any,
    newProps: any,
    renderLanes: Lanes,
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

    if (typeof contextType === 'object' && contextType !== null) {
        // 这是 context 的处理吧
        nextContext = readContext(contextType);
    } else if (!disableLegacyContext) {
        const nextUnmaskedContext = getUnmaskedContext(workInProgress, ctor, true);
        nextContext = getMaskedContext(workInProgress, nextUnmaskedContext);
    }

    const hasNewLifecycles =
        typeof getDerivedStateFromProps === 'function' ||
        typeof instance.getSnapshotBeforeUpdate === 'function';

        if (
            !hasNewLifecycles &&
            (typeof instance.UNSAFE_componentWillReceiveProps === 'function' ||
            typeof instance.componentWillReceiveProps === 'function')
        ) {
        if (
            unresolvedOldProps !== unresolvedNewProps ||
            oldContext !== nextContext
        ) {
            callComponentWillReceiveProps(
                workInProgress,
                instance,
                newProps,
                nextContext,
                );
            }
        }
    const oldState = workInProgress.memoizedState;
    let newState = (instance.state = oldState);
    // 这里好像就会把 staste 处理一下
    processUpdateQueue(workInProgress, newProps, instance, renderLanes);
    newState = workInProgress.memoizedState;

    // 什么意思，属性相同，状态相同，context 也没变？
    if (
        unresolvedOldProps === unresolvedNewProps &&
        oldState === newState &&
        !hasContextChanged() &&
        !checkHasForceUpdateAfterProcessing()
    ) {
        // If an update was already in progress, we should schedule an Update
        // effect even though we're bailing out, so that cWU/cDU are called.
        // 这挺乱的，没看懂了
        if (typeof instance.componentDidUpdate === 'function') {
            if (
                unresolvedOldProps !== current.memoizedProps ||
                oldState !== current.memoizedState
            ) {
                workInProgress.flags |= Update;
            }
        }
        if (typeof instance.getSnapshotBeforeUpdate === 'function') {
            if (
                unresolvedOldProps !== current.memoizedProps ||
                oldState !== current.memoizedState
            ) {
                workInProgress.flags |= Snapshot;
            }
        }
        return false;
    }

    if (typeof getDerivedStateFromProps === 'function') {
        applyDerivedStateFromProps(
            workInProgress,
            ctor,
            getDerivedStateFromProps,
            newProps,
        );
        newState = workInProgress.memoizedState;
    }

    const shouldUpdate =
        checkHasForceUpdateAfterProcessing() ||
        checkShouldComponentUpdate(
        workInProgress,
        ctor,
        oldProps,
        newProps,
        oldState,
        newState,
        nextContext,
    );
    if (shouldUpdate) {
        if (
            !hasNewLifecycles &&
            (typeof instance.UNSAFE_componentWillUpdate === 'function' ||
                typeof instance.componentWillUpdate === 'function')
          ) {
            if (typeof instance.componentWillUpdate === 'function') {
                instance.componentWillUpdate(newProps, newState, nextContext);
            }
            if (typeof instance.UNSAFE_componentWillUpdate === 'function') {
                instance.UNSAFE_componentWillUpdate(newProps, newState, nextContext);
            }
        }
        if (typeof instance.componentDidUpdate === 'function') {
            workInProgress.flags |= Update;
        }
        if (typeof instance.getSnapshotBeforeUpdate === 'function') {
            workInProgress.flags |= Snapshot;
        }
    } else {
        // ...
        // If shouldComponentUpdate returned false, we should still update the
        // memoized props/state to indicate that this work can be reused.
        workInProgress.memoizedProps = newProps;
        workInProgress.memoizedState = newState;
    }

    // Update the existing instance's state, props, and context pointers even
    // if shouldComponentUpdate returns false.
    instance.props = newProps;
    instance.state = newState;
    instance.context = nextContext;

    return shouldUpdate;
}