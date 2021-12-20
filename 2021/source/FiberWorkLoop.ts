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

import {flushSyncCallbacksOnlyInLegacyMode} from './reactFiberSyncTaskQueue';

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

// 标记当前节点到 hostRoot 的lane
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

const RENDER_TIMEOUT_MS = 500;
let workInProgressRootRenderTargetTime: number = Infinity;

function resetRenderTimer() {
    workInProgressRootRenderTargetTime = now() + RENDER_TIMEOUT_MS;
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

function prepareFreshStack(root: FiberRoot, lanes: Lanes) {
    root.finishedWork = null;
    root.finishedLanes = NoLanes;

    const timeoutHandle = root.timeoutHandle;
    if (timeoutHandle !== noTimeout) {
      // The root previous suspended and scheduled a timeout to commit a fallback
      // state. Now that we have additional work, cancel the timeout.
      root.timeoutHandle = noTimeout;
      // $FlowFixMe Complains noTimeout is not a TimeoutID, despite the check above
      cancelTimeout(timeoutHandle);
    }
  
    if (workInProgress !== null) {
      let interruptedWork = workInProgress.return;
      while (interruptedWork !== null) {
        unwindInterruptedWork(interruptedWork);
        interruptedWork = interruptedWork.return;
      }
    }
    workInProgressRoot = root;
    // 就是根据当前 HostRootFiber 建一个复制的 Fiber 节点对象
    workInProgress = createWorkInProgress(root.current, null);
    workInProgressRootRenderLanes = subtreeRenderLanes = workInProgressRootIncludedLanes = lanes;
    workInProgressRootExitStatus = RootIncomplete;
    workInProgressRootFatalError = null;
    workInProgressRootSkippedLanes = NoLanes;
    workInProgressRootUpdatedLanes = NoLanes;
    workInProgressRootPingedLanes = NoLanes;
  
    if (enableSchedulerTracing) {
      spawnedWorkDuringRender = null;
    }
  
    if (__DEV__) {
        ReactStrictModeWarnings.discardPendingWarnings();
    }
}


// Use this function to schedule a task for a root. There's only one task per
// root; if a task was already scheduled, we'll check to make sure the priority
// of the existing task is the same as the priority of the next level that the
// root has work on. This function is called on every update, and right before
// exiting a task.
function ensureRootIsScheduled(root: FiberRoot, currentTime: number) {
    const existingCallbackNode = root.callbackNode;

    // Check if any lanes are being starved by other work. If so, mark them as
    // expired so we know to work on those next.
    markStarvedLanesAsExpired(root, currentTime);
}

export function unbatchedUpdates<A, R>(fn: (a: A) => R, a: A): R {
    const prevExecutionContext = executionContext;
    executionContext &= ~BatchedContext;
    executionContext |= LegacyUnbatchedContext;
    try {
        return fn(a);
    } finally {
        executionContext = prevExecutionContext;
        if (executionContext === NoContext) {
            // Flush the immediate callbacks that were scheduled during this batch
            resetRenderTimer();
            flushSyncCallbackQueue();
        }
    }
}

let currentEventTime: number = NoTimestamp;
let currentEventWipLanes: Lanes = NoLanes;
let currentEventPendingLanes: Lanes = NoLanes;

export function requestEventTime() {
    if ((executionContext & (RenderContext | CommitContext)) !== NoContext) {
      // We're inside React, so it's fine to read the actual time.
        return now();
    }
    // We're not inside React, so we may be in the middle of a browser event.
    if (currentEventTime !== NoTimestamp) {
      // Use the same start time for all updates until we enter React again.
        return currentEventTime;
    }
    // This is the first update since React yielded. Compute a new start time.
    currentEventTime = now();
    return currentEventTime;
}

// 在 NoMode 模式下 updateLane 都是 SyncLane
export function requestUpdateLane(fiber: Fiber): Lane {
    const mode = fiber.mode;
    if ((mode & BlockingMode) === NoMode) {
        return (SyncLane: Lane);
    }
}


function beginWork(
    current: Fiber | null,
    workInProgress: Fiber,
    renderLanes: Lanes,
): Fiber | null {
    const updateLanes = workInProgress.lanes;

    if (currnt !== null) {
        const oldProps = current.memoizedProps;
        const newProps = workInProgress.pendingProps;
        if (
            oldProps !== newProps ||
            hasLegacyContextChanged()
        ) {
            didReceiveUpdate = true;
        } else if (!includesSomeLane(renderLanes, updateLanes)) {

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
    }
}

function updateHostRoot(current, workInProgress, renderLanes) {
    pushHostRootContext(workInProgress);
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
}

export function processUpdateQueue<State>(){}