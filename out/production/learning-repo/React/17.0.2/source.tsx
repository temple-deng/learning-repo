export function scheduleUpdateOnFiber(
    fiber: Fiber,
    lane: Lane,
    eventTime: number,
) {
    // 检查是不是更新出现了嵌套
    checkForNestedUpdates();
    // DEV 环境才会执行的函数，跳过
    warnAboutRenderPhaseUpdatesInDEV(fiber);

    // 标记 fiber 树相关节点的 lanes 和 childLanes
    const root = markUpdateLaneFromFiberToRoot(fiber, lane);
    if (root === null) {
        return null;
    }

    // Mark that the root has a pending update.
    // 在 fiberRoot 上注册 lane
    markRootUpdated(root, lane, eventTime);

    // 也就是在开始执行任务前，首先在 fiber 树及 fiberRoot 上注册更新

    if (root === workInProgressRoot) {
        // Received an update to a tree that's in the middle of rendering. Mark
        // that there was an interleaved update work on this root. Unless the
        // `deferRenderPhaseUpdateToNextBatch` flag is off and this is a render
        // phase update. In that case, we don't treat render phase updates as if
        // they were interleaved, for backwards compat reasons.
        if (
            deferRenderPhaseUpdateToNextBatch ||
            (executionContext & RenderContext) === NoContext
        ) {
            workInProgressRootUpdatedLanes = mergeLanes(
                workInProgressRootUpdatedLanes,
                lane,
            );
        }
        if (workInProgressRootExitStatus === RootSuspendedWithDelay) {
            // The root already suspended with a delay, which means this render
            // definitely won't finish. Since we have a new update, let's mark it as
            // suspended now, right before marking the incoming update. This has the
            // effect of interrupting the current render and switching to the update.
            // TODO: Make sure this doesn't override pings that happen while we've
            // already started rendering.
            markRootSuspended(root, workInProgressRootRenderLanes);
        }
    }

    // 获取当前的优先级水平
    const priorityLevel = getCurrentPriorityLevel();

    // 如果本次更新的 lane 是 SyncLane
    if (lane === SyncLane) {
        if (
            // Check if we're inside unbatchedUpdates
            // 当前处理 LegacyUnbatchedContext 中且不在 Render 和 CommitContext 中
            (executionContext & LegacyUnbatchedContext) !== NoContext &&
            // Check if we're not already rendering
            (executionContext & (RenderContext | CommitContext)) === NoContext
        ) {
            // 所以这个分支的情形是同步批量合并更新？
            // Register pending interactions on the root to avoid losing traced interaction data.
            // 这个先暂且不管，用不到
            schedulePendingInteractions(root, lane);

            // This is a legacy edge case. The initial mount of a ReactDOM.render-ed
            // root inside of batchedUpdates should be synchronous, but layout updates
            // should be deferred until the end of the batch.
            // 直接构建 fiber 树，不调度
            performSyncWorkOnRoot(root);
        } else {
            // 这个分支的情形是，同步优先级，但是不是合并更新，或者处于 Render 和 CommitContext 中
            ensureRootIsScheduled(root, eventTime);
            schedulePendingInteractions(root, lane);
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
    } else {
        // Schedule a discrete update but only if it's not Sync.
        // 在非同步的情况下，安排一个离散的更新
        // 这个 if 暂时看不懂
        if (
            (executionContext & DiscreteEventContext) !== NoContext &&
            // Only updates at user-blocking priority or greater are considered
            // discrete, even inside a discrete event.
            (priorityLevel === UserBlockingSchedulerPriority ||
                priorityLevel === ImmediateSchedulerPriority)
        ) {
            // This is the result of a discrete event. Track the lowest priority
            // discrete update per root so we can flush them early, if needed.
            if (rootsWithPendingDiscreteUpdates === null) {
                rootsWithPendingDiscreteUpdates = new Set([root]);
            } else {
                rootsWithPendingDiscreteUpdates.add(root);
            }
        }
        // Schedule other updates after in case the callback is sync.
        ensureRootIsScheduled(root, eventTime);
        schedulePendingInteractions(root, lane);
    }

    // We use this when assigning a lane for a transition inside
    // `requestUpdateLane`. We assume it's the same as the root being updated,
    // since in the common case of a single root app it probably is. If it's not
    // the same root, then it's not a huge deal, we just might batch more stuff
    // together more than necessary.
    mostRecentlyUpdatedRoot = root;
}


// 更新 fiber 树相关节点 lanes, childLanes
// 这样只要更新的时候只要比一比 lanes, childlanes 就知道当前节点用不用更新
function markUpdateLaneFromFiberToRoot(
    sourceFiber: Fiber,
    lane: Lane,
): FiberRoot | null {
    // Update the source fiber's lanes
    // 将 lane 合入到当前 fiber 节点的 lanes 中
    sourceFiber.lanes = mergeLanes(sourceFiber.lanes, lane);
    let alternate = sourceFiber.alternate;
    if (alternate !== null) {
        alternate.lanes = mergeLanes(alternate.lanes, lane);
    }

    // Walk the parent path to the root and update the child expiration time.
    let node = sourceFiber;
    let parent = sourceFiber.return;

    // 将 lane 一路向上合并到每个祖先节点的 childlanes 中，同时顺便获取 HostRootFiber 的索引，进而拿到 fiberRoot
    while (parent !== null) {
        parent.childLanes = mergeLanes(parent.childLanes, lane);
        alternate = parent.alternate;
        if (alternate !== null) {
            alternate.childLanes = mergeLanes(alternate.childLanes, lane);
        }
        node = parent;
        parent = parent.return;
    }
    if (node.tag === HostRoot) {
        const root: FiberRoot = node.stateNode;
        return root;
    } else {
        return null;
    }
}

// 这个实际上是在 fiberRoot 上更新一下说明 root 安排了 update 任务
export function markRootUpdated(
    root: FiberRoot,
    updateLane: Lane,
    eventTime: number,
) {
    // 将 updateLane 合到 pendingLanes
    root.pendingLanes |= updateLane;


    // Unsuspend any update at equal or lower priority.
    // 取消以同等或更低优先级进行的任何更新
    const higherPriorityLanes = updateLane - 1; // Turns 0b1000 into 0b0111

    root.suspendedLanes &= higherPriorityLanes;
    root.pingedLanes &= higherPriorityLanes;

    const eventTimes = root.eventTimes;
    const index = laneToIndex(updateLane);
    // We can always overwrite an existing timestamp because we prefer the most
    // recent event, and we assume time is monotonically increasing.
    eventTimes[index] = eventTime;
}


// Use this function to schedule a task for a root. There's only one task per
// root; if a task was already scheduled, we'll check to make sure the priority
// of the existing task is the same as the priority of the next level that the
// root has work on. This function is called on every update, and right before
// exiting a task.
// 使用该函数在 root 上调度一个 task，每个 root 只有一个 task；如果已经有一个 task 被调度了
// 我们需要确保当前已存在 task 的优先级与 root 要处理的下一级水平的优先级是一直的
// 在每次更新的时候，以及在退出一个 task 时，都会调用这个函数
function ensureRootIsScheduled(root: FiberRoot, currentTime: number) {
    // callbackNode 是 Scheduler.scheduleCallback 返回的节点
    // 代表下次 root 要处理的 task
    const existingCallbackNode = root.callbackNode;

    // Check if any lanes are being starved by other work. If so, mark them as
    // expired so we know to work on those next.
    // 这个函数还暂时没看懂
    markStarvedLanesAsExpired(root, currentTime);

    // Determine the next lanes to work on, and their priority.
    const nextLanes = getNextLanes(
        root,
        root === workInProgressRoot ? workInProgressRootRenderLanes : NoLanes,
    );
    // This returns the priority level computed during the `getNextLanes` call.
    const newCallbackPriority = returnNextLanesPriority();

    if (nextLanes === NoLanes) {
        // Special case: There's nothing to work on.
        if (existingCallbackNode !== null) {
            cancelCallback(existingCallbackNode);
            root.callbackNode = null;
            root.callbackPriority = NoLanePriority;
        }
        return;
    }

    // Check if there's an existing task. We may be able to reuse it.
    if (existingCallbackNode !== null) {
        const existingCallbackPriority = root.callbackPriority;
        if (existingCallbackPriority === newCallbackPriority) {
            // The priority hasn't changed. We can reuse the existing task. Exit.
            return;
        }
        // The priority changed. Cancel the existing callback. We'll schedule a new
        // one below.
        cancelCallback(existingCallbackNode);
    }

    // Schedule a new callback.
    let newCallbackNode;
    if (newCallbackPriority === SyncLanePriority) {
        // Special case: Sync React callbacks are scheduled on a special
        // internal queue
        newCallbackNode = scheduleSyncCallback(
            performSyncWorkOnRoot.bind(null, root),
        );
    } else if (newCallbackPriority === SyncBatchedLanePriority) {
        newCallbackNode = scheduleCallback(
            ImmediateSchedulerPriority,
            performSyncWorkOnRoot.bind(null, root),
        );
    } else {
        const schedulerPriorityLevel = lanePriorityToSchedulerPriority(
            newCallbackPriority,
        );
        newCallbackNode = scheduleCallback(
            schedulerPriorityLevel,
            performConcurrentWorkOnRoot.bind(null, root),
        );
    }

    root.callbackPriority = newCallbackPriority;
    root.callbackNode = newCallbackNode;
}

// ------------------------- 先到这，已经有很多看不懂了，先停一停
// -------------------------- 回到第一次渲染，慢慢来

export function updateContainer(
    element: ReactNodeList,
    container: OpaqueRoot,
    parentComponent: ?React$Component<any, any>,
    callback: ?Function,
): Lane {
    const current = container.current;
    const eventTime = requestEventTime();
    const lane = requestUpdateLane(current);

    if (enableSchedulingProfiler) {
        markRenderScheduled(lane);
    }

    const context = getContextForSubtree(parentComponent);
    if (container.context === null) {
        container.context = context;
    } else {
        container.pendingContext = context;
    }

    const update = createUpdate(eventTime, lane);
    // Caution: React DevTools currently depends on this property
    // being called "element".
    update.payload = { element };

    callback = callback === undefined ? null : callback;
    if (callback !== null) {
        if (__DEV__) {
            if (typeof callback !== 'function') {
                console.error(
                    'render(...): Expected the last optional `callback` argument to be a ' +
                    'function. Instead received: %s.',
                    callback,
                );
            }
        }
        update.callback = callback;
    }

    enqueueUpdate(current, update);
    scheduleUpdateOnFiber(current, lane, eventTime);

    return lane;
}


const requestHostCallback = function (callback) {
    // 这里之所以不怕被覆盖，是因为在调用 requestCallback 就会校验
    // 如果有设置的 callback 就不会进行覆盖，知道当前的 hostCallback 开始执行了以后
    // 才允许下次设置
    scheduledHostCallback = callback;
    if (!isMessageLoopRunning) {
        isMessageLoopRunning = true;
        port.postMessage(null);
    }
};

// 看到现在，貌似也只见过这一个 scheduledHostCallback
function flushWork(hasTimeRemaining, initialTime) {
    // We'll need a host callback the next time work is scheduled.
    isHostCallbackScheduled = false;
    if (isHostTimeoutScheduled) {
        // We scheduled a timeout but it's no longer needed. Cancel it.
        isHostTimeoutScheduled = false;
        cancelHostTimeout();
    }

    isPerformingWork = true;
    // 相当于当前执行的 task 的 PriorityLevel
    const previousPriorityLevel = currentPriorityLevel;
    try {
        return workLoop(hasTimeRemaining, initialTime);
    } finally {
        currentTask = null;
        currentPriorityLevel = previousPriorityLevel;
        isPerformingWork = false;
    }
}

function workLoop(hasTimeRemaining, initialTime) {
    let currentTime = initialTime;
    advanceTimers(currentTime);
    currentTask = peek(taskQueue);
    while (
        currentTask !== null
    ) {
        if (
            currentTask.expirationTime > currentTime &&
            // hasTimeRemaining 好像一直是 true，所以不用管，只用管后面的条件
            // 即任务虽然还没过期，但是本次 hostCallback 即 workLoop 执行时间超过了 5ms
            // 中断执行，等下次 messageLoop
            (!hasTimeRemaining || shouldYieldToHost())
        ) {
            // This currentTask hasn't expired, and we've reached the deadline.
            break;
        }
        const callback = currentTask.callback;
        if (typeof callback === 'function') {
            currentTask.callback = null;
            currentPriorityLevel = currentTask.priorityLevel;
            const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
            if (enableProfiling) {
                markTaskRun(currentTask, currentTime);
            }
            const continuationCallback = callback(didUserCallbackTimeout);
            currentTime = getCurrentTime();
            if (typeof continuationCallback === 'function') {
                currentTask.callback = continuationCallback;
                if (enableProfiling) {
                    markTaskYield(currentTask, currentTime);
                }
            } else {
                if (enableProfiling) {
                    markTaskCompleted(currentTask, currentTime);
                    currentTask.isQueued = false;
                }
                if (currentTask === peek(taskQueue)) {
                    pop(taskQueue);
                }
            }
            advanceTimers(currentTime);
        } else {
            pop(taskQueue);
        }
        currentTask = peek(taskQueue);
    }
    // Return whether there's additional work
    if (currentTask !== null) {
        return true;
    } else {
        const firstTimer = peek(timerQueue);
        if (firstTimer !== null) {
            requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
        }
        return false;
    }
}

export function requestUpdateLane(fiber: Fiber): Lane {
    // Special cases
    const mode = fiber.mode;
    if ((mode & BlockingMode) === NoMode) {
        // legacy 模式
        return (SyncLane: Lane);
    } else if ((mode & ConcurrentMode) === NoMode) {
        // blocking模式
        return getCurrentPriorityLevel() === ImmediateSchedulerPriority
            ? (SyncLane: Lane)
                : (SyncBatchedLane: Lane);
    }
    // concurrent模式
    if (currentEventWipLanes === NoLanes) {
        currentEventWipLanes = workInProgressRootIncludedLanes;
    }
    const isTransition = requestCurrentTransition() !== NoTransition;
    if (isTransition) {
        // 特殊情况, 处于suspense过程中
        if (currentEventPendingLanes !== NoLanes) {
            currentEventPendingLanes =
                mostRecentlyUpdatedRoot !== null
                    ? mostRecentlyUpdatedRoot.pendingLanes
                    : NoLanes;
        }
        return findTransitionLane(currentEventWipLanes, currentEventPendingLanes);
    }
    // 正常情况, 获取调度优先级
    const schedulerPriority = getCurrentPriorityLevel();
    let lane;
    if (
        (executionContext & DiscreteEventContext) !== NoContext &&
        schedulerPriority === UserBlockingSchedulerPriority
    ) {
        // executionContext 存在输入事件. 且调度优先级是用户阻塞性质
        lane = findUpdateLane(InputDiscreteLanePriority, currentEventWipLanes);
    } else {
        // 调度优先级转换为车道模型
        const schedulerLanePriority = schedulerPriorityToLanePriority(
            schedulerPriority,
        );
        lane = findUpdateLane(schedulerLanePriority, currentEventWipLanes);
    }
    return lane;
}

function prepareFreshStack(root: FiberRoot, lanes: Lanes) {
    root.finishedWork = null;
    root.finishedLanes = NoLanes;

    if (workInProgress !== null) {
        let interruptedWork = workInProgress.return;
        while (interruptedWork !== null) {
            unwindInterruptedWork(interruptedWork);
            interruptedWork = interruptedWork.return;
        }
    }
    workInProgressRoot = root;
    workInProgress = createWorkInProgress(root.current, null);
    workInProgressRootRenderLanes = subtreeRenderLanes = workInProgressRootIncludedLanes = lanes;
    workInProgressRootExitStatus = RootIncomplete;
    workInProgressRootFatalError = null;
    workInProgressRootSkippedLanes = NoLanes;
    workInProgressRootUpdatedLanes = NoLanes;
    workInProgressRootPingedLanes = NoLanes;
}

export function getNextLanes(root: FiberRoot, wipLanes: Lanes): Lanes {
    // Early bailout if there's no pending work left.
    const pendingLanes = root.pendingLanes;
    if (pendingLanes === NoLanes) {
        return_highestLanePriority = NoLanePriority;
        return NoLanes;
    }

    let nextLanes = NoLanes;
    let nextLanePriority = NoLanePriority;

    const expiredLanes = root.expiredLanes;
    const suspendedLanes = root.suspendedLanes;
    const pingedLanes = root.pingedLanes;

    // Check if any work has expired.
    if (expiredLanes !== NoLanes) {
        nextLanes = expiredLanes;
        nextLanePriority = return_highestLanePriority = SyncLanePriority;
    } else {
        // Do not work on any idle work until all the non-idle work has finished,
        // even if the work is suspended.
        const nonIdlePendingLanes = pendingLanes & NonIdleLanes;
        if (nonIdlePendingLanes !== NoLanes) {
            const nonIdleUnblockedLanes = nonIdlePendingLanes & ~suspendedLanes;
            if (nonIdleUnblockedLanes !== NoLanes) {
                nextLanes = getHighestPriorityLanes(nonIdleUnblockedLanes);
                nextLanePriority = return_highestLanePriority;
            } else {
                const nonIdlePingedLanes = nonIdlePendingLanes & pingedLanes;
                if (nonIdlePingedLanes !== NoLanes) {
                    nextLanes = getHighestPriorityLanes(nonIdlePingedLanes);
                    nextLanePriority = return_highestLanePriority;
                }
            }
        } else {
            // The only remaining work is Idle.
            const unblockedLanes = pendingLanes & ~suspendedLanes;
            if (unblockedLanes !== NoLanes) {
                nextLanes = getHighestPriorityLanes(unblockedLanes);
                nextLanePriority = return_highestLanePriority;
            } else {
                if (pingedLanes !== NoLanes) {
                    nextLanes = getHighestPriorityLanes(pingedLanes);
                    nextLanePriority = return_highestLanePriority;
                }
            }
        }
    }

    if (nextLanes === NoLanes) {
        // This should only be reachable if we're suspended
        // TODO: Consider warning in this path if a fallback timer is not scheduled.
        return NoLanes;
    }

    // If there are higher priority lanes, we'll include them even if they
    // are suspended.
    nextLanes = pendingLanes & getEqualOrHigherPriorityLanes(nextLanes);

    // If we're already in the middle of a render, switching lanes will interrupt
    // it and we'll lose our progress. We should only do this if the new lanes are
    // higher priority.
    if (
        wipLanes !== NoLanes &&
        wipLanes !== nextLanes &&
        // If we already suspended with a delay, then interrupting is fine. Don't
        // bother waiting until the root is complete.
        (wipLanes & suspendedLanes) === NoLanes
    ) {
        getHighestPriorityLanes(wipLanes);
        const wipLanePriority = return_highestLanePriority;
        if (nextLanePriority <= wipLanePriority) {
            return wipLanes;
        } else {
            return_highestLanePriority = nextLanePriority;
        }
    }

    // Check for entangled lanes and add them to the batch.
    //
    // A lane is said to be entangled with another when it's not allowed to render
    // in a batch that does not also include the other lane. Typically we do this
    // when multiple updates have the same source, and we only want to respond to
    // the most recent event from that source.
    //
    // Note that we apply entanglements *after* checking for partial work above.
    // This means that if a lane is entangled during an interleaved event while
    // it's already rendering, we won't interrupt it. This is intentional, since
    // entanglement is usually "best effort": we'll try our best to render the
    // lanes in the same batch, but it's not worth throwing out partially
    // completed work in order to do it.
    //
    // For those exceptions where entanglement is semantically important, like
    // useMutableSource, we should ensure that there is no partial work at the
    // time we apply the entanglement.
    const entangledLanes = root.entangledLanes;
    if (entangledLanes !== NoLanes) {
        const entanglements = root.entanglements;
        let lanes = nextLanes & entangledLanes;
        while (lanes > 0) {
            const index = pickArbitraryLaneIndex(lanes);
            const lane = 1 << index;

            nextLanes |= entanglements[index];

            lanes &= ~lane;
        }
    }

    return nextLanes;
}

function performSyncWorkOnRoot(root) {
    invariant(
        (executionContext & (RenderContext | CommitContext)) === NoContext,
        'Should not already be working.',
    );

    flushPassiveEffects();

    let lanes;
    let exitStatus;
    if (
        root === workInProgressRoot &&
        includesSomeLane(root.expiredLanes, workInProgressRootRenderLanes)
    ) {
        // There's a partial tree, and at least one of its lanes has expired. Finish
        // rendering it before rendering the rest of the expired work.
        lanes = workInProgressRootRenderLanes;
        exitStatus = renderRootSync(root, lanes);
        if (
            includesSomeLane(
                workInProgressRootIncludedLanes,
                workInProgressRootUpdatedLanes,
            )
        ) {
            // The render included lanes that were updated during the render phase.
            // For example, when unhiding a hidden tree, we include all the lanes
            // that were previously skipped when the tree was hidden. That set of
            // lanes is a superset of the lanes we started rendering with.
            //
            // Note that this only happens when part of the tree is rendered
            // concurrently. If the whole tree is rendered synchronously, then there
            // are no interleaved events.
            lanes = getNextLanes(root, lanes);
            exitStatus = renderRootSync(root, lanes);
        }
    } else {
        lanes = getNextLanes(root, NoLanes);
        exitStatus = renderRootSync(root, lanes);
    }

    if (root.tag !== LegacyRoot && exitStatus === RootErrored) {
        executionContext |= RetryAfterError;

        // If an error occurred during hydration,
        // discard server response and fall back to client side render.
        if (root.hydrate) {
            root.hydrate = false;
            clearContainer(root.containerInfo);
        }

        // If something threw an error, try rendering one more time. We'll render
        // synchronously to block concurrent data mutations, and we'll includes
        // all pending updates are included. If it still fails after the second
        // attempt, we'll give up and commit the resulting tree.
        lanes = getLanesToRetrySynchronouslyOnError(root);
        if (lanes !== NoLanes) {
            exitStatus = renderRootSync(root, lanes);
        }
    }

    if (exitStatus === RootFatalErrored) {
        const fatalError = workInProgressRootFatalError;
        prepareFreshStack(root, NoLanes);
        markRootSuspended(root, lanes);
        ensureRootIsScheduled(root, now());
        throw fatalError;
    }

    // We now have a consistent tree. Because this is a sync render, we
    // will commit it even if something suspended.
    const finishedWork: Fiber = (root.current.alternate: any);
    root.finishedWork = finishedWork;
    root.finishedLanes = lanes;
    commitRoot(root);

    // Before exiting, make sure there's a callback scheduled for the next
    // pending level.
    ensureRootIsScheduled(root, now());

    return null;
}

function renderRootSync(root: FiberRoot, lanes: Lanes) {
    const prevExecutionContext = executionContext;
    executionContext |= RenderContext;
    const prevDispatcher = pushDispatcher();

    // If the root or lanes have changed, throw out the existing stack
    // and prepare a fresh one. Otherwise we'll continue where we left off.
    if (workInProgressRoot !== root || workInProgressRootRenderLanes !== lanes) {
        prepareFreshStack(root, lanes);
        startWorkOnPendingInteractions(root, lanes);
    }

    const prevInteractions = pushInteractions(root);

    do {
        try {
            workLoopSync();
            break;
        } catch (thrownValue) {
            handleError(root, thrownValue);
        }
    } while (true);
    resetContextDependencies();
    if (enableSchedulerTracing) {
        popInteractions(((prevInteractions: any): Set<Interaction>));
    }

    executionContext = prevExecutionContext;
    popDispatcher(prevDispatcher);

    if (workInProgress !== null) {
        // This is a sync render, so we should have finished the whole tree.
        invariant(
            false,
            'Cannot commit an incomplete root. This error is likely caused by a ' +
            'bug in React. Please file an issue.',
        );
    }

    if (__DEV__) {
        if (enableDebugTracing) {
            logRenderStopped();
        }
    }

    if (enableSchedulingProfiler) {
        markRenderStopped();
    }

    // Set this to null to indicate there's no in-progress render.
    workInProgressRoot = null;
    workInProgressRootRenderLanes = NoLanes;

    return workInProgressRootExitStatus;
}

function performUnitOfWork(unitOfWork: Fiber): void {
    // The current, flushed, state of this fiber is the alternate. Ideally
    // nothing should rely on this, but relying on it here means that we don't
    // need an additional field on the work in progress.
    const current = unitOfWork.alternate;
    setCurrentDebugFiberInDEV(unitOfWork);

    let next;
    next = beginWork(current, unitOfWork, subtreeRenderLanes);

    resetCurrentDebugFiberInDEV();
    unitOfWork.memoizedProps = unitOfWork.pendingProps;
    if (next === null) {
        // If this doesn't spawn new work, complete the current work.
        completeUnitOfWork(unitOfWork);
    } else {
        workInProgress = next;
    }

    ReactCurrentOwner.current = null;
}

function beginWork(
    current: Fiber | null,
    workInProgress: Fiber,
    renderLanes: Lanes,
): Fiber | null {
    const updateLanes = workInProgress.lanes;

    if (current !== null) {
        const oldProps = current.memoizedProps;
        const newProps = workInProgress.pendingProps;

        if (
            oldProps !== newProps ||
            hasLegacyContextChanged() ||
            // Force a re-render if the implementation changed due to hot reload:
        ) {
            // If props or context changed, mark the fiber as having performed work.
            // This may be unset if the props are determined to be equal later (memo).
            didReceiveUpdate = true;
        } else if (!includesSomeLane(renderLanes, updateLanes)) {
            didReceiveUpdate = false;
            // This fiber does not have any pending work. Bailout without entering
            // the begin phase. There's still some bookkeeping we that needs to be done
            // in this optimized path, mostly pushing stuff onto the stack.
            switch (workInProgress.tag) {
                case HostRoot:
                    pushHostRootContext(workInProgress);
                    resetHydrationState();
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
                    pushHostContainer(
                        workInProgress,
                        workInProgress.stateNode.containerInfo,
                    );
                    break;
                case ContextProvider: {
                    const newValue = workInProgress.memoizedProps.value;
                    pushProvider(workInProgress, newValue);
                    break;
                }
                case Profiler:
                    if (enableProfilerTimer) {
                        // Profiler should only call onRender when one of its descendants actually rendered.
                        const hasChildWork = includesSomeLane(
                            renderLanes,
                            workInProgress.childLanes,
                        );
                        if (hasChildWork) {
                            workInProgress.flags |= Update;
                        }

                        // Reset effect durations for the next eventual effect phase.
                        // These are reset during render to allow the DevTools commit hook a chance to read them,
                        const stateNode = workInProgress.stateNode;
                        stateNode.effectDuration = 0;
                        stateNode.passiveEffectDuration = 0;
                    }
                    break;
                case SuspenseComponent: {
                    const state: SuspenseState | null = workInProgress.memoizedState;
                    if (state !== null) {
                        if (enableSuspenseServerRenderer) {
                            if (state.dehydrated !== null) {
                                pushSuspenseContext(
                                    workInProgress,
                                    setDefaultShallowSuspenseContext(suspenseStackCursor.current),
                                );
                                // We know that this component will suspend again because if it has
                                // been unsuspended it has committed as a resolved Suspense component.
                                // If it needs to be retried, it should have work scheduled on it.
                                workInProgress.flags |= DidCapture;
                                // We should never render the children of a dehydrated boundary until we
                                // upgrade it. We return null instead of bailoutOnAlreadyFinishedWork.
                                return null;
                            }
                        }

                        // If this boundary is currently timed out, we need to decide
                        // whether to retry the primary children, or to skip over it and
                        // go straight to the fallback. Check the priority of the primary
                        // child fragment.
                        const primaryChildFragment: Fiber = (workInProgress.child: any);
                        const primaryChildLanes = primaryChildFragment.childLanes;
                        if (includesSomeLane(renderLanes, primaryChildLanes)) {
                            // The primary children have pending work. Use the normal path
                            // to attempt to render the primary children again.
                            return updateSuspenseComponent(
                                current,
                                workInProgress,
                                renderLanes,
                            );
                        } else {
                            // The primary child fragment does not have pending work marked
                            // on it
                            pushSuspenseContext(
                                workInProgress,
                                setDefaultShallowSuspenseContext(suspenseStackCursor.current),
                            );
                            // The primary children do not have pending work with sufficient
                            // priority. Bailout.
                            const child = bailoutOnAlreadyFinishedWork(
                                current,
                                workInProgress,
                                renderLanes,
                            );
                            if (child !== null) {
                                // The fallback children have pending work. Skip over the
                                // primary children and work on the fallback.
                                return child.sibling;
                            } else {
                                return null;
                            }
                        }
                    } else {
                        pushSuspenseContext(
                            workInProgress,
                            setDefaultShallowSuspenseContext(suspenseStackCursor.current),
                        );
                    }
                    break;
                }
                case SuspenseListComponent: {
                    const didSuspendBefore = (current.flags & DidCapture) !== NoFlags;

                    const hasChildWork = includesSomeLane(
                        renderLanes,
                        workInProgress.childLanes,
                    );

                    if (didSuspendBefore) {
                        if (hasChildWork) {
                            // If something was in fallback state last time, and we have all the
                            // same children then we're still in progressive loading state.
                            // Something might get unblocked by state updates or retries in the
                            // tree which will affect the tail. So we need to use the normal
                            // path to compute the correct tail.
                            return updateSuspenseListComponent(
                                current,
                                workInProgress,
                                renderLanes,
                            );
                        }
                        // If none of the children had any work, that means that none of
                        // them got retried so they'll still be blocked in the same way
                        // as before. We can fast bail out.
                        workInProgress.flags |= DidCapture;
                    }

                    // If nothing suspended before and we're rendering the same children,
                    // then the tail doesn't matter. Anything new that suspends will work
                    // in the "together" mode, so we can continue from the state we had.
                    const renderState = workInProgress.memoizedState;
                    if (renderState !== null) {
                        // Reset to the "together" mode in case we've started a different
                        // update in the past but didn't complete it.
                        renderState.rendering = null;
                        renderState.tail = null;
                        renderState.lastEffect = null;
                    }
                    pushSuspenseContext(workInProgress, suspenseStackCursor.current);

                    if (hasChildWork) {
                        break;
                    } else {
                        // If none of the children had any work, that means that none of
                        // them got retried so they'll still be blocked in the same way
                        // as before. We can fast bail out.
                        return null;
                    }
                }
                case OffscreenComponent:
                case LegacyHiddenComponent: {
                    // Need to check if the tree still needs to be deferred. This is
                    // almost identical to the logic used in the normal update path,
                    // so we'll just enter that. The only difference is we'll bail out
                    // at the next level instead of this one, because the child props
                    // have not changed. Which is fine.
                    // TODO: Probably should refactor `beginWork` to split the bailout
                    // path from the normal path. I'm tempted to do a labeled break here
                    // but I won't :)
                    workInProgress.lanes = NoLanes;
                    return updateOffscreenComponent(current, workInProgress, renderLanes);
                }
            }
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

    // Before entering the begin phase, clear pending update priority.
    // TODO: This assumes that we're about to evaluate the component and process
    // the update queue. However, there's an exception: SimpleMemoComponent
    // sometimes bails out later in the begin phase. This indicates that we should
    // move this assignment out of the common path and into each branch.
    workInProgress.lanes = NoLanes;

    switch (workInProgress.tag) {
        case IndeterminateComponent: {
            return mountIndeterminateComponent(
                current,
                workInProgress,
                workInProgress.type,
                renderLanes,
            );
        }
        case LazyComponent: {
            const elementType = workInProgress.elementType;
            return mountLazyComponent(
                current,
                workInProgress,
                elementType,
                updateLanes,
                renderLanes,
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
                renderLanes,
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
                renderLanes,
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
                renderLanes,
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
            if (__DEV__) {
                if (workInProgress.type !== workInProgress.elementType) {
                    const outerPropTypes = type.propTypes;
                    if (outerPropTypes) {
                        checkPropTypes(
                            outerPropTypes,
                            resolvedProps, // Resolved for outer only
                            'prop',
                            getComponentName(type),
                        );
                    }
                }
            }
            resolvedProps = resolveDefaultProps(type.type, resolvedProps);
            return updateMemoComponent(
                current,
                workInProgress,
                type,
                resolvedProps,
                updateLanes,
                renderLanes,
            );
        }
        case SimpleMemoComponent: {
            return updateSimpleMemoComponent(
                current,
                workInProgress,
                workInProgress.type,
                workInProgress.pendingProps,
                updateLanes,
                renderLanes,
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
                renderLanes,
            );
        }
        case SuspenseListComponent: {
            return updateSuspenseListComponent(current, workInProgress, renderLanes);
        }
        case FundamentalComponent: {
            if (enableFundamentalAPI) {
                return updateFundamentalComponent(current, workInProgress, renderLanes);
            }
            break;
        }
        case ScopeComponent: {
            if (enableScopeAPI) {
                return updateScopeComponent(current, workInProgress, renderLanes);
            }
            break;
        }
        case Block: {
            if (enableBlocksAPI) {
                const block = workInProgress.type;
                const props = workInProgress.pendingProps;
                return updateBlock(current, workInProgress, block, props, renderLanes);
            }
            break;
        }
        case OffscreenComponent: {
            return updateOffscreenComponent(current, workInProgress, renderLanes);
        }
        case LegacyHiddenComponent: {
            return updateLegacyHiddenComponent(current, workInProgress, renderLanes);
        }
    }
    invariant(
        false,
        'Unknown unit of work tag (%s). This error is likely caused by a bug in ' +
        'React. Please file an issue.',
        workInProgress.tag,
    );
}

function updateHostRoot(current, workInProgress, renderLanes) {
    pushHostRootContext(workInProgress);
    const updateQueue = workInProgress.updateQueue;
    invariant(
        current !== null && updateQueue !== null,
        'If the root does not have an updateQueue, we should have already ' +
        'bailed out. This error is likely caused by a bug in React. Please ' +
        'file an issue.',
    );
    const nextProps = workInProgress.pendingProps;
    const prevState = workInProgress.memoizedState;
    const prevChildren = prevState !== null ? prevState.element : null;
    cloneUpdateQueue(current, workInProgress);
    // processUpdateQueue 貌似只在 hostRoot 和 class 组件中会用到
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
    if (root.hydrate && enterHydrationState(workInProgress)) {
        // If we don't have any current children this might be the first pass.
        // We always try to hydrate. If this isn't a hydration pass there won't
        // be any children to hydrate which is effectively the same thing as
        // not hydrating.

        const child = mountChildFibers(
            workInProgress,
            null,
            nextChildren,
            renderLanes,
        );
        workInProgress.child = child;

        let node = child;
        while (node) {
            // Mark each child as hydrating. This is a fast path to know whether this
            // tree is part of a hydrating tree. This is used to determine if a child
            // node has fully mounted yet, and for scheduling event replaying.
            // Conceptually this is similar to Placement in that a new subtree is
            // inserted into the React tree here. It just happens to not need DOM
            // mutations because it already exists.
            node.flags = (node.flags & ~Placement) | Hydrating;
            node = node.sibling;
        }
    } else {
        // Otherwise reset hydration state in case we aborted and resumed another
        // root.
        reconcileChildren(current, workInProgress, nextChildren, renderLanes);
        resetHydrationState();
    }
    return workInProgress.child;
}

function processUpdateQueue<State>(
    workInProgress: Fiber,
    props: any,
    instance: any,
    renderLanes: Lanes,
): void {
    // This is always non-null on a ClassComponent or HostRoot
    const queue: UpdateQueue<State> = (workInProgress.updateQueue: any);

    hasForceUpdate = false;

    // 针对第一次渲染的节点，这两个估计都为 null
    let firstBaseUpdate = queue.firstBaseUpdate;
    let lastBaseUpdate = queue.lastBaseUpdate;

    // Check if there are pending updates. If so, transfer them to the base queue.
    let pendingQueue = queue.shared.pending;
    if (pendingQueue !== null) {
        queue.shared.pending = null;

        // The pending queue is circular. Disconnect the pointer between first
        // and last so that it's non-circular.
        // 需要注意的一点是 pendingQueue 事实上指向的是队尾，按理说队首应该是最后一个
        // 但是看这里起名 next 下一个就是队首，难以理解
        const lastPendingUpdate = pendingQueue;
        const firstPendingUpdate = lastPendingUpdate.next;
        lastPendingUpdate.next = null;
        // Append pending updates to base queue
        // 就像英语注释说的，将 pending 中的 update 添加到 baseUpdate 列表的尾部
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
        // 就是更新 current 的 baseUpdate
        const current = workInProgress.alternate;
        if (current !== null) {
            // This is always non-null on a ClassComponent or HostRoot
            const currentQueue: UpdateQueue<State> = (current.updateQueue: any);
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

    // 所以上面的一串就是把 pendingUpdate 处理到了 baseUpdate 里面
    // These values may change as we process the queue.
    if (firstBaseUpdate !== null) {
        // Iterate through the list of updates to compute the result.
        // 这一串变量估计是为遍历做准备
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
                // Priority is insufficient. Skip this update. If this is the first
                // skipped update, the previous update/state is the new base
                // update/state.
                // 当前 updte 的 updateLane 优先级不够，那么这个 update 就先不处理吧
                const clone: Update<State> = {
                    eventTime: updateEventTime,
                    lane: updateLane,

                    tag: update.tag,
                    payload: update.payload,
                    callback: update.callback,

                    next: null,
                };
                // 目前来看这个 update 相当于 clone 了一下，添加到了 newBaseUpdate 中了
                // 所以这 newUpdate 队列是干什么的呢
                if (newLastBaseUpdate === null) {
                    newFirstBaseUpdate = newLastBaseUpdate = clone;
                    newBaseState = newState;
                } else {
                    newLastBaseUpdate = newLastBaseUpdate.next = clone;
                }
                // Update the remaining priority in the queue.
                // 注意这里，优先级不够的 lane 都保存了下来
                newLanes = mergeLanes(newLanes, updateLane);
            } else {
                // This update does have sufficient priority.

                // 这个没看懂，相当于至少有一个被跳过的 update 的情况下
                // 后面的 update 都要推到 base 队列里面
                // 这个 clone 的 lane 理论上每次变量都会继续走到这
                if (newLastBaseUpdate !== null) {
                    const clone: Update<State> = {
                        eventTime: updateEventTime,
                        // This update is going to be committed so we never want uncommit
                        // it. Using NoLane works because 0 is a subset of all bitmasks, so
                        // this will never be skipped by the check above.
                        lane: NoLane,

                        tag: update.tag,
                        payload: update.payload,
                        callback: update.callback,

                        next: null,
                    };
                    newLastBaseUpdate = newLastBaseUpdate.next = clone;
                }

                // Process this update.
                // 这里就是根据当前的 update 的 payload 计算新的 state
                // 如果 payload 是函数，就调用函数
                // 如果不是函数，直接把 payload 合并到 state 中
                // 简化的代码就是这样
                // const payload = update.payload;
                // let partialState;
                // if (typeof payload === 'function') {
                //     partialState = payload.call(instance, prevState, nextProps);

                // } else {
                //     // Partial state object
                //     partialState = payload;
                // }
                // return Object.assign({}, prevState, partialState);
                // 这就解释了两次连着的设置 state 可能会出问题的情况，以对象形式为例
                // 这里的 payload 拿到的都是未更新前的 state，都不是累加后的
                newState = getStateFromUpdate(
                    workInProgress,
                    queue,
                    update,
                    newState,
                    props,
                    instance,
                );
                const callback = update.callback;
                if (callback !== null) {
                    // 打 flags，推入 queue.effect
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
                    break;
                } else {
                    // 这个情况相当于在遍历 update 的过程中又添加了新的 update
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

        // 所有 update 都有足够的优先级，都执行了
        if (newLastBaseUpdate === null) {
            newBaseState = newState;
        }

        // 这里又把未处理的队列绑回去了，按理说这里的都是优先级不够的 update
        // 但是看代码的话，优先级不够的 update 后面的 update 执行了以后，也会有一个 clone
        // 在链表里面
        queue.baseState = ((newBaseState as any) as State);
        queue.firstBaseUpdate = newFirstBaseUpdate;
        queue.lastBaseUpdate = newLastBaseUpdate;

        // Set the remaining expiration time to be whatever is remaining in the queue.
        // This should be fine because the only two other things that contribute to
        // expiration time are props and context. We're already in the middle of the
        // begin phase by the time we start processing the queue, so we've already
        // dealt with the props. Context in components that specify
        // shouldComponentUpdate is tricky; but we'll have to account for
        // that regardless.
        // 这里是把 lanes 合并到 wipSkippedUpdateLanes 中
        markSkippedUpdateLanes(newLanes);
        workInProgress.lanes = newLanes;
        workInProgress.memoizedState = newState;
    }
}



function reconcileChildFibers(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    newChild: any,
    lanes: Lanes,
): Fiber | null {
    // This function is not recursive.
    // If the top level item is an array, we treat it as a set of children,
    // not as a fragment. Nested arrays on the other hand will be treated as
    // fragment nodes. Recursion happens at the normal flow.

    // Handle top level unkeyed fragments as if they were arrays.
    // This leads to an ambiguity between <>{[...]}</> and <>...</>.
    // We treat the ambiguous cases above the same.
    const isUnkeyedTopLevelFragment =
        typeof newChild === 'object' &&
        newChild !== null &&
        newChild.type === REACT_FRAGMENT_TYPE &&
        newChild.key === null;
    if (isUnkeyedTopLevelFragment) {
        newChild = newChild.props.children;
    }

    // Handle object types
    const isObject = typeof newChild === 'object' && newChild !== null;

    if (isObject) {
        switch (newChild.$$typeof) {
            case REACT_ELEMENT_TYPE:
                return placeSingleChild(
                    reconcileSingleElement(
                        returnFiber,
                        currentFirstChild,
                        newChild,
                        lanes,
                    ),
                );
            case REACT_PORTAL_TYPE:
                return placeSingleChild(
                    reconcileSinglePortal(
                        returnFiber,
                        currentFirstChild,
                        newChild,
                        lanes,
                    ),
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
                        lanes,
                    );
                }
        }
    }

    if (typeof newChild === 'string' || typeof newChild === 'number') {
        return placeSingleChild(
            reconcileSingleTextNode(
                returnFiber,
                currentFirstChild,
                '' + newChild,
                lanes,
            ),
        );
    }

    if (isArray(newChild)) {
        return reconcileChildrenArray(
            returnFiber,
            currentFirstChild,
            newChild,
            lanes,
        );
    }

    if (getIteratorFn(newChild)) {
        return reconcileChildrenIterator(
            returnFiber,
            currentFirstChild,
            newChild,
            lanes,
        );
    }

    if (isObject) {
        throwOnInvalidObjectType(returnFiber, newChild);
    }

    if (__DEV__) {
        if (typeof newChild === 'function') {
            warnOnFunctionType(returnFiber);
        }
    }
    if (typeof newChild === 'undefined' && !isUnkeyedTopLevelFragment) {
        // If the new child is undefined, and the return fiber is a composite
        // component, throw an error. If Fiber return types are disabled,
        // we already threw above.
        switch (returnFiber.tag) {
            case ClassComponent: {
                if (__DEV__) {
                    const instance = returnFiber.stateNode;
                    if (instance.render._isMockFunction) {
                        // We allow auto-mocks to proceed as if they're returning null.
                        break;
                    }
                }
            }
            // Intentionally fall through to the next case, which handles both
            // functions and classes
            // eslint-disable-next-lined no-fallthrough
            case Block:
            case FunctionComponent:
            case ForwardRef:
            case SimpleMemoComponent: {
                invariant(
                    false,
                    '%s(...): Nothing was returned from render. This usually means a ' +
                    'return statement is missing. Or, to render nothing, ' +
                    'return null.',
                    getComponentName(returnFiber.type) || 'Component',
                );
            }
        }
    }

    // Remaining cases are all treated as empty.
    return deleteRemainingChildren(returnFiber, currentFirstChild);
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
        // TODO: If key === null and child.key === null, then this only applies to
        // the first item in the list.
        if (child.key === key) {
            switch (child.tag) {
                case Fragment: {
                    if (element.type === REACT_FRAGMENT_TYPE) {
                        deleteRemainingChildren(returnFiber, child.sibling);
                        const existing = useFiber(child, element.props.children);
                        existing.return = returnFiber;
                        if (__DEV__) {
                            existing._debugSource = element._source;
                            existing._debugOwner = element._owner;
                        }
                        return existing;
                    }
                    break;
                }
                case Block:
                    if (enableBlocksAPI) {
                        let type = element.type;
                        if (type.$$typeof === REACT_LAZY_TYPE) {
                            type = resolveLazyType(type);
                        }
                        if (type.$$typeof === REACT_BLOCK_TYPE) {
                            // The new Block might not be initialized yet. We need to initialize
                            // it in case initializing it turns out it would match.
                            if (
                                ((type as any) as BlockComponent<any, any>)._render ===
                                (child.type as BlockComponent<any, any>)._render
                            ) {
                                deleteRemainingChildren(returnFiber, child.sibling);
                                const existing = useFiber(child, element.props);
                                existing.type = type;
                                existing.return = returnFiber;
                                if (__DEV__) {
                                    existing._debugSource = element._source;
                                    existing._debugOwner = element._owner;
                                }
                                return existing;
                            }
                        }
                    }
                // We intentionally fallthrough here if enableBlocksAPI is not on.
                // eslint-disable-next-lined no-fallthrough
                default: {
                    if (
                        child.elementType === element.type ||
                        // Keep this check inline so it only runs on the false path:
                        (__DEV__
                            ? isCompatibleFamilyForHotReloading(child, element)
                            : false)
                    ) {
                        deleteRemainingChildren(returnFiber, child.sibling);
                        const existing = useFiber(child, element.props);
                        existing.ref = coerceRef(returnFiber, child, element);
                        existing.return = returnFiber;
                        if (__DEV__) {
                            existing._debugSource = element._source;
                            existing._debugOwner = element._owner;
                        }
                        return existing;
                    }
                    break;
                }
            }
            // Didn't match.
            deleteRemainingChildren(returnFiber, child);
            break;
        } else {
            deleteChild(returnFiber, child);
        }
        child = child.sibling;
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

function createFiberFromTypeAndProps(
    type: any, // React$ElementType
    key: null | string,
    pendingProps: any,
    owner: null | Fiber,
    mode: TypeOfMode,
    lanes: Lanes,
): Fiber {
    let fiberTag = IndeterminateComponent;
    // The resolved type is set if we know what the final type will be. I.e. it's not lazy.
    let resolvedType = type;
    if (typeof type === 'function') {
        // 类组件，话说这种情况下，函数组件不就是 IndeterminateComponent 的 flag
        if (shouldConstruct(type)) {
            fiberTag = ClassComponent;
        }
    } else if (typeof type === 'string') {
        fiberTag = HostComponent;
    } else {
        getTag: switch (type) {
            case REACT_FRAGMENT_TYPE:
                return createFiberFromFragment(pendingProps.children, mode, lanes, key);
            case REACT_DEBUG_TRACING_MODE_TYPE:
                fiberTag = Mode;
                mode |= DebugTracingMode;
                break;
            case REACT_STRICT_MODE_TYPE:
                fiberTag = Mode;
                mode |= StrictMode;
                break;
            case REACT_PROFILER_TYPE:
                return createFiberFromProfiler(pendingProps, mode, lanes, key);
            case REACT_SUSPENSE_TYPE:
                return createFiberFromSuspense(pendingProps, mode, lanes, key);
            case REACT_SUSPENSE_LIST_TYPE:
                return createFiberFromSuspenseList(pendingProps, mode, lanes, key);
            case REACT_OFFSCREEN_TYPE:
                return createFiberFromOffscreen(pendingProps, mode, lanes, key);
            case REACT_LEGACY_HIDDEN_TYPE:
                return createFiberFromLegacyHidden(pendingProps, mode, lanes, key);
            case REACT_SCOPE_TYPE:
                if (enableScopeAPI) {
                    return createFiberFromScope(type, pendingProps, mode, lanes, key);
                }
            // eslint-disable-next-line no-fallthrough
            default: {
                if (typeof type === 'object' && type !== null) {
                    switch (type.$$typeof) {
                        case REACT_PROVIDER_TYPE:
                            fiberTag = ContextProvider;
                            break getTag;
                        case REACT_CONTEXT_TYPE:
                            // This is a consumer
                            fiberTag = ContextConsumer;
                            break getTag;
                        case REACT_FORWARD_REF_TYPE:
                            fiberTag = ForwardRef;
                            if (__DEV__) {
                                resolvedType = resolveForwardRefForHotReloading(resolvedType);
                            }
                            break getTag;
                        case REACT_MEMO_TYPE:
                            fiberTag = MemoComponent;
                            break getTag;
                        case REACT_LAZY_TYPE:
                            fiberTag = LazyComponent;
                            resolvedType = null;
                            break getTag;
                        case REACT_BLOCK_TYPE:
                            fiberTag = Block;
                            break getTag;
                        case REACT_FUNDAMENTAL_TYPE:
                            if (enableFundamentalAPI) {
                                return createFiberFromFundamental(
                                    type,
                                    pendingProps,
                                    mode,
                                    lanes,
                                    key,
                                );
                            }
                            break;
                    }
                }
                let info = '';

                invariant(
                    false,
                    'Element type is invalid: expected a string (for built-in ' +
                    'components) or a class/function (for composite components) ' +
                    'but got: %s.%s',
                    type == null ? type : typeof type,
                    info,
                );
            }
        }
    }

    const fiber = createFiber(fiberTag, pendingProps, key, mode);
    fiber.elementType = type;
    fiber.type = resolvedType;
    fiber.lanes = lanes;

    return fiber;
}


function updateClassComponent(
    current: Fiber | null,
    workInProgress: Fiber,
    Component: any,
    nextProps: any,
    renderLanes: Lanes,
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

    // 初次构建是 null，因为构建 fiber 的时候没改过 stateNode 属性
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
        // In the initial pass we might need to construct the instance.
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
    if (__DEV__) {
        const inst = workInProgress.stateNode;
        if (shouldUpdate && inst.props !== nextProps) {
            if (!didWarnAboutReassigningProps) {
                console.error(
                    'It looks like %s is reassigning its own `this.props` while rendering. ' +
                    'This is not supported and can lead to confusing bugs.',
                    getComponentName(workInProgress.type) || 'a component',
                );
            }
            didWarnAboutReassigningProps = true;
        }
    }
    return nextUnitOfWork;
}

function constructClassInstance(
    workInProgress: Fiber,
    ctor: any,
    props: any,
): any {
    let isLegacyContextConsumer = false;
    let unmaskedContext = emptyContextObject;
    let context = emptyContextObject;
    const contextType = ctor.contextType;

    if (__DEV__) {
        if ('contextType' in ctor) {
            const isValid =
                // Allow null for conditional declaration
                contextType === null ||
                (contextType !== undefined &&
                    contextType.$$typeof === REACT_CONTEXT_TYPE &&
                    contextType._context === undefined); // Not a <Context.Consumer>

            if (!isValid && !didWarnAboutInvalidateContextType.has(ctor)) {
                didWarnAboutInvalidateContextType.add(ctor);

                let addendum = '';
                if (contextType === undefined) {
                    addendum =
                        ' However, it is set to undefined. ' +
                        'This can be caused by a typo or by mixing up named and default imports. ' +
                        'This can also happen due to a circular dependency, so ' +
                        'try moving the createContext() call to a separate file.';
                } else if (typeof contextType !== 'object') {
                    addendum = ' However, it is set to a ' + typeof contextType + '.';
                } else if (contextType.$$typeof === REACT_PROVIDER_TYPE) {
                    addendum = ' Did you accidentally pass the Context.Provider instead?';
                } else if (contextType._context !== undefined) {
                    // <Context.Consumer>
                    addendum = ' Did you accidentally pass the Context.Consumer instead?';
                } else {
                    addendum =
                        ' However, it is set to an object with keys {' +
                        Object.keys(contextType).join(', ') +
                        '}.';
                }
                console.error(
                    '%s defines an invalid contextType. ' +
                    'contextType should point to the Context object returned by React.createContext().%s',
                    getComponentName(ctor) || 'Component',
                    addendum,
                );
            }
        }
    }

    if (typeof contextType === 'object' && contextType !== null) {
        context = readContext((contextType: any));
    } else if (!disableLegacyContext) {
        unmaskedContext = getUnmaskedContext(workInProgress, ctor, true);
        const contextTypes = ctor.contextTypes;
        isLegacyContextConsumer =
            contextTypes !== null && contextTypes !== undefined;
        context = isLegacyContextConsumer
            ? getMaskedContext(workInProgress, unmaskedContext)
            : emptyContextObject;
    }

    // Instantiate twice to help detect side-effects.
    if (__DEV__) {
        if (
            debugRenderPhaseSideEffectsForStrictMode &&
            workInProgress.mode & StrictMode
        ) {
            disableLogs();
            try {
                new ctor(props, context); // eslint-disable-line no-new
            } finally {
                reenableLogs();
            }
        }
    }

    const instance = new ctor(props, context);
    const state = (workInProgress.memoizedState =
        instance.state !== null && instance.state !== undefined
            ? instance.state
            : null);
    adoptClassInstance(workInProgress, instance);

    if (__DEV__) {
        if (typeof ctor.getDerivedStateFromProps === 'function' && state === null) {
            const componentName = getComponentName(ctor) || 'Component';
            if (!didWarnAboutUninitializedState.has(componentName)) {
                didWarnAboutUninitializedState.add(componentName);
                console.error(
                    '`%s` uses `getDerivedStateFromProps` but its initial state is ' +
                    '%s. This is not recommended. Instead, define the initial state by ' +
                    'assigning an object to `this.state` in the constructor of `%s`. ' +
                    'This ensures that `getDerivedStateFromProps` arguments have a consistent shape.',
                    componentName,
                    instance.state === null ? 'null' : 'undefined',
                    componentName,
                );
            }
        }

        // If new component APIs are defined, "unsafe" lifecycles won't be called.
        // Warn about these lifecycles if they are present.
        // Don't warn about react-lifecycles-compat polyfilled methods though.
        if (
            typeof ctor.getDerivedStateFromProps === 'function' ||
            typeof instance.getSnapshotBeforeUpdate === 'function'
        ) {
            let foundWillMountName = null;
            let foundWillReceivePropsName = null;
            let foundWillUpdateName = null;
            if (
                typeof instance.componentWillMount === 'function' &&
                instance.componentWillMount.__suppressDeprecationWarning !== true
            ) {
                foundWillMountName = 'componentWillMount';
            } else if (typeof instance.UNSAFE_componentWillMount === 'function') {
                foundWillMountName = 'UNSAFE_componentWillMount';
            }
            if (
                typeof instance.componentWillReceiveProps === 'function' &&
                instance.componentWillReceiveProps.__suppressDeprecationWarning !== true
            ) {
                foundWillReceivePropsName = 'componentWillReceiveProps';
            } else if (
                typeof instance.UNSAFE_componentWillReceiveProps === 'function'
            ) {
                foundWillReceivePropsName = 'UNSAFE_componentWillReceiveProps';
            }
            if (
                typeof instance.componentWillUpdate === 'function' &&
                instance.componentWillUpdate.__suppressDeprecationWarning !== true
            ) {
                foundWillUpdateName = 'componentWillUpdate';
            } else if (typeof instance.UNSAFE_componentWillUpdate === 'function') {
                foundWillUpdateName = 'UNSAFE_componentWillUpdate';
            }
            if (
                foundWillMountName !== null ||
                foundWillReceivePropsName !== null ||
                foundWillUpdateName !== null
            ) {
                const componentName = getComponentName(ctor) || 'Component';
                const newApiName =
                    typeof ctor.getDerivedStateFromProps === 'function'
                        ? 'getDerivedStateFromProps()'
                        : 'getSnapshotBeforeUpdate()';
                if (!didWarnAboutLegacyLifecyclesAndDerivedState.has(componentName)) {
                    didWarnAboutLegacyLifecyclesAndDerivedState.add(componentName);
                    console.error(
                        'Unsafe legacy lifecycles will not be called for components using new component APIs.\n\n' +
                        '%s uses %s but also contains the following legacy lifecycles:%s%s%s\n\n' +
                        'The above lifecycles should be removed. Learn more about this warning here:\n' +
                        'https://reactjs.org/link/unsafe-component-lifecycles',
                        componentName,
                        newApiName,
                        foundWillMountName !== null ? `\n  ${foundWillMountName}` : '',
                        foundWillReceivePropsName !== null
                            ? `\n  ${foundWillReceivePropsName}`
                            : '',
                        foundWillUpdateName !== null ? `\n  ${foundWillUpdateName}` : '',
                    );
                }
            }
        }
    }

    // Cache unmasked context so we can avoid recreating masked context unless necessary.
    // ReactFiberContext usually updates this cache but can't for newly-created instances.
    if (isLegacyContextConsumer) {
        cacheContext(workInProgress, unmaskedContext, context);
    }

    return instance;
}


function mountClassInstance(
    workInProgress: Fiber,
    ctor: any,
    newProps: any,
    renderLanes: Lanes,
): void {
    if (__DEV__) {
        checkClassInstance(workInProgress, ctor, newProps);
    }

    const instance = workInProgress.stateNode;
    instance.props = newProps;
    instance.state = workInProgress.memoizedState;
    instance.refs = emptyRefsObject;

    initializeUpdateQueue(workInProgress);

    const contextType = ctor.contextType;
    if (typeof contextType === 'object' && contextType !== null) {
        instance.context = readContext(contextType);
    } else if (disableLegacyContext) {
        instance.context = emptyContextObject;
    } else {
        const unmaskedContext = getUnmaskedContext(workInProgress, ctor, true);
        instance.context = getMaskedContext(workInProgress, unmaskedContext);
    }

    if (__DEV__) {
        if (instance.state === newProps) {
            const componentName = getComponentName(ctor) || 'Component';
            if (!didWarnAboutDirectlyAssigningPropsToState.has(componentName)) {
                didWarnAboutDirectlyAssigningPropsToState.add(componentName);
                console.error(
                    '%s: It is not recommended to assign props directly to state ' +
                    "because updates to props won't be reflected in state. " +
                    'In most cases, it is better to use props directly.',
                    componentName,
                );
            }
        }

        if (workInProgress.mode & StrictMode) {
            ReactStrictModeWarnings.recordLegacyContextWarning(
                workInProgress,
                instance,
            );
        }

        if (warnAboutDeprecatedLifecycles) {
            ReactStrictModeWarnings.recordUnsafeLifecycleWarnings(
                workInProgress,
                instance,
            );
        }
    }

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

    // In order to support react-lifecycles-compat polyfilled components,
    // Unsafe lifecycles should not be invoked for components using the new APIs.
    if (
        typeof ctor.getDerivedStateFromProps !== 'function' &&
        typeof instance.getSnapshotBeforeUpdate !== 'function' &&
        (typeof instance.UNSAFE_componentWillMount === 'function' ||
            typeof instance.componentWillMount === 'function')
    ) {
        callComponentWillMount(workInProgress, instance);
        // If we had additional state updates during this life-cycle, let's
        // process them now.
        processUpdateQueue(workInProgress, newProps, instance, renderLanes);
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

    const didCaptureError = (workInProgress.flags & DidCapture) !== NoFlags;

    if (!shouldUpdate && !didCaptureError) {
        // Context providers should defer to sCU for rendering
        if (hasContext) {
            invalidateContextProvider(workInProgress, Component, false);
        }

        return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
    }

    const instance = workInProgress.stateNode;

    // Rerender
    ReactCurrentOwner.current = workInProgress;
    let nextChildren;
    if (
        didCaptureError &&
        typeof Component.getDerivedStateFromError !== 'function'
    ) {
        // If we captured an error, but getDerivedStateFromError is not defined,
        // unmount all the children. componentDidCatch will schedule an update to
        // re-render a fallback. This is temporary until we migrate everyone to
        // the new API.
        // TODO: Warn in a future release.
        nextChildren = null;

        if (enableProfilerTimer) {
            stopProfilerTimerIfRunning(workInProgress);
        }
    } else {
        if (__DEV__) {
            setIsRendering(true);
            nextChildren = instance.render();
            if (
                debugRenderPhaseSideEffectsForStrictMode &&
                workInProgress.mode & StrictMode
            ) {
                disableLogs();
                try {
                    instance.render();
                } finally {
                    reenableLogs();
                }
            }
            setIsRendering(false);
        } else {
            nextChildren = instance.render();
        }
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
            renderLanes,
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


function updateHostComponent(
    current: Fiber | null,
    workInProgress: Fiber,
    renderLanes: Lanes,
) {
    pushHostContext(workInProgress);

    if (current === null) {
        tryToClaimNextHydratableInstance(workInProgress);
    }

    const type = workInProgress.type;
    const nextProps = workInProgress.pendingProps;
    const prevProps = current !== null ? current.memoizedProps : null;

    let nextChildren = nextProps.children;
    // 对于后代是字符串或数字或者一些 textarea, option 类型
    // 后代就是直接的字符串
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


function reconcileChildrenArray(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    newChildren: Array<*>,
    lanes: Lanes,
): Fiber | null {
    // This algorithm can't optimize by searching from both ends since we
    // don't have backpointers on fibers. I'm trying to see how far we can get
    // with that model. If it ends up not being worth the tradeoffs, we can
    // add it later.

    // Even with a two ended optimization, we'd want to optimize for the case
    // where there are few changes and brute force the comparison instead of
    // going for the Map. It'd like to explore hitting that path first in
    // forward-only mode and only go for the Map once we notice that we need
    // lots of look ahead. This doesn't handle reversal as well as two ended
    // search but that's unusual. Besides, for the two ended optimization to
    // work on Iterables, we'd need to copy the whole set.

    // In this first iteration, we'll just live with hitting the bad case
    // (adding everything to a Map) in for every insert/move.

    // If you change this code, also update reconcileChildrenIterator() which
    // uses the same algorithm.

    if (__DEV__) {
        // First, validate keys.
        let knownKeys = null;
        for (let i = 0; i < newChildren.length; i++) {
            const child = newChildren[i];
            knownKeys = warnOnInvalidKey(child, knownKeys, returnFiber);
        }
    }

    let resultingFirstChild: Fiber | null = null;
    let previousNewFiber: Fiber | null = null;

    let oldFiber = currentFirstChild;
    let lastPlacedIndex = 0;
    let newIdx = 0;
    let nextOldFiber = null;
    for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
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
            lanes,
        );
        if (newFiber === null) {
            // TODO: This breaks on empty slots like null children. That's
            // unfortunate because it triggers the slow path all the time. We need
            // a better way to communicate whether this was a miss or null,
            // boolean, undefined, etc.
            if (oldFiber === null) {
                oldFiber = nextOldFiber;
            }
            break;
        }
        if (shouldTrackSideEffects) {
            if (oldFiber && newFiber.alternate === null) {
                // We matched the slot, but we didn't reuse the existing fiber, so we
                // need to delete the existing child.
                deleteChild(returnFiber, oldFiber);
            }
        }
        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
        if (previousNewFiber === null) {
            // TODO: Move out of the loop. This only happens for the first run.
            resultingFirstChild = newFiber;
        } else {
            // TODO: Defer siblings if we're not at the right index for this slot.
            // I.e. if we had null values before, then we want to defer this
            // for each null value. However, we also don't want to call updateSlot
            // with the previous one.
            previousNewFiber.sibling = newFiber;
        }
        previousNewFiber = newFiber;
        oldFiber = nextOldFiber;
    }

    if (newIdx === newChildren.length) {
        // We've reached the end of the new children. We can delete the rest.
        deleteRemainingChildren(returnFiber, oldFiber);
        return resultingFirstChild;
    }

    if (oldFiber === null) {
        // If we don't have any more existing children we can choose a fast path
        // since the rest will all be insertions.
        for (; newIdx < newChildren.length; newIdx++) {
            const newFiber = createChild(returnFiber, newChildren[newIdx], lanes);
            if (newFiber === null) {
                continue;
            }
            lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
            if (previousNewFiber === null) {
                // TODO: Move out of the loop. This only happens for the first run.
                resultingFirstChild = newFiber;
            } else {
                previousNewFiber.sibling = newFiber;
            }
            previousNewFiber = newFiber;
        }
        return resultingFirstChild;
    }

    // Add all children to a key map for quick lookups.
    const existingChildren = mapRemainingChildren(returnFiber, oldFiber);

    // Keep scanning and use the map to restore deleted items as moves.
    for (; newIdx < newChildren.length; newIdx++) {
        const newFiber = updateFromMap(
            existingChildren,
            returnFiber,
            newIdx,
            newChildren[newIdx],
            lanes,
        );
        if (newFiber !== null) {
            if (shouldTrackSideEffects) {
                if (newFiber.alternate !== null) {
                    // The new fiber is a work in progress, but if there exists a
                    // current, that means that we reused the fiber. We need to delete
                    // it from the child list so that we don't add it to the deletion
                    // list.
                    existingChildren.delete(
                        newFiber.key === null ? newIdx : newFiber.key,
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

    if (shouldTrackSideEffects) {
        // Any existing children that weren't consumed above were deleted. We need
        // to add them to the deletion list.
        existingChildren.forEach(child => deleteChild(returnFiber, child));
    }

    return resultingFirstChild;
}

function reconcileSingleTextNode(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    textContent: string,
    lanes: Lanes,
): Fiber {
    // There's no need to check for keys on text nodes since we don't have a
    // way to define them.
    if (currentFirstChild !== null && currentFirstChild.tag === HostText) {
        // We already have an existing node so let's just update it and delete
        // the rest.
        deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
        const existing = useFiber(currentFirstChild, textContent);
        existing.return = returnFiber;
        return existing;
    }
    // The existing first child is not a text node so we need to create one
    // and delete the existing ones.
    deleteRemainingChildren(returnFiber, currentFirstChild);
    const created = createFiberFromText(textContent, returnFiber.mode, lanes);
    created.return = returnFiber;
    return created;
}

function completeUnitOfWork(unitOfWork: Fiber): void {
    // Attempt to complete the current unit of work, then move to the next
    // sibling. If there are no more siblings, return to the parent fiber.
    let completedWork = unitOfWork;
    do {
        // The current, flushed, state of this fiber is the alternate. Ideally
        // nothing should rely on this, but relying on it here means that we don't
        // need an additional field on the work in progress.
        const current = completedWork.alternate;
        const returnFiber = completedWork.return;

        // Check if the work completed or if something threw.
        if ((completedWork.flags & Incomplete) === NoFlags) {
            setCurrentDebugFiberInDEV(completedWork);
            let next;
            if (
                !enableProfilerTimer ||
                (completedWork.mode & ProfileMode) === NoMode
            ) {
                next = completeWork(current, completedWork, subtreeRenderLanes);
            } else {
                startProfilerTimer(completedWork);
                next = completeWork(current, completedWork, subtreeRenderLanes);
                // Update render duration assuming we didn't error.
                stopProfilerTimerIfRunningAndRecordDelta(completedWork, false);
            }
            resetCurrentDebugFiberInDEV();

            if (next !== null) {
                // Completing this fiber spawned new work. Work on that next.
                workInProgress = next;
                return;
            }

            resetChildLanes(completedWork);

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

                // If this fiber had side-effects, we append it AFTER the children's
                // side-effects. We can perform certain side-effects earlier if needed,
                // by doing multiple passes over the effect list. We don't want to
                // schedule our own side-effect on our own list because if end up
                // reusing children we'll schedule this effect onto itself since we're
                // at the end.
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
        } else {
            // This fiber did not complete because something threw. Pop values off
            // the stack without entering the complete phase. If this is a boundary,
            // capture values if possible.
            const next = unwindWork(completedWork, subtreeRenderLanes);

            // Because this fiber did not complete, don't reset its expiration time.

            if (next !== null) {
                // If completing this work spawned new work, do that next. We'll come
                // back here again.
                // Since we're restarting, remove anything that is not a host effect
                // from the effect tag.
                next.flags &= HostEffectMask;
                workInProgress = next;
                return;
            }

            if (
                enableProfilerTimer &&
                (completedWork.mode & ProfileMode) !== NoMode
            ) {
                // Record the render duration for the fiber that errored.
                stopProfilerTimerIfRunningAndRecordDelta(completedWork, false);

                // Include the time spent working on failed children before continuing.
                let actualDuration = completedWork.actualDuration;
                let child = completedWork.child;
                while (child !== null) {
                    actualDuration += child.actualDuration;
                    child = child.sibling;
                }
                completedWork.actualDuration = actualDuration;
            }

            if (returnFiber !== null) {
                // Mark the parent fiber as incomplete and clear its effect list.
                returnFiber.firstEffect = returnFiber.lastEffect = null;
                returnFiber.flags |= Incomplete;
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
    } while (completedWork !== null);

    // We've reached the root.
    if (workInProgressRootExitStatus === RootIncomplete) {
        workInProgressRootExitStatus = RootCompleted;
    }
}

function completeWork(
    current: Fiber | null,
    workInProgress: Fiber,
    renderLanes: Lanes,
): Fiber | null {
    const newProps = workInProgress.pendingProps;

    switch (workInProgress.tag) {
        case IndeterminateComponent:
        case LazyComponent:
        case SimpleMemoComponent:
        case FunctionComponent:
        case ForwardRef:
        case Fragment:
        case Mode:
        case Profiler:
        case ContextConsumer:
        case MemoComponent:
            return null;
        case ClassComponent: {
            const Component = workInProgress.type;
            if (isLegacyContextProvider(Component)) {
                popLegacyContext(workInProgress);
            }
            return null;
        }
        case HostRoot: {
            popHostContainer(workInProgress);
            popTopLevelLegacyContextObject(workInProgress);
            resetMutableSourceWorkInProgressVersions();
            const fiberRoot = (workInProgress.stateNode: FiberRoot);
            if (fiberRoot.pendingContext) {
                fiberRoot.context = fiberRoot.pendingContext;
                fiberRoot.pendingContext = null;
            }
            if (current === null || current.child === null) {
                // If we hydrated, pop so that we can delete any remaining children
                // that weren't hydrated.
                const wasHydrated = popHydrationState(workInProgress);
                if (wasHydrated) {
                    // If we hydrated, then we'll need to schedule an update for
                    // the commit side-effects on the root.
                    markUpdate(workInProgress);
                } else if (!fiberRoot.hydrate) {
                    // Schedule an effect to clear this container at the start of the next commit.
                    // This handles the case of React rendering into a container with previous children.
                    // It's also safe to do for updates too, because current.child would only be null
                    // if the previous render was null (so the the container would already be empty).
                    workInProgress.flags |= Snapshot;
                }
            }
            updateHostContainer(workInProgress);
            return null;
        }
        case HostComponent: {
            popHostContext(workInProgress);
            const rootContainerInstance = getRootHostContainer();
            const type = workInProgress.type;
            if (current !== null && workInProgress.stateNode != null) {
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
                if (!newProps) {
                    invariant(
                        workInProgress.stateNode !== null,
                        'We must have new props for new mounts. This error is likely ' +
                        'caused by a bug in React. Please file an issue.',
                    );
                    // This can happen when we abort work.
                    return null;
                }

                const currentHostContext = getHostContext();
                // TODO: Move createInstance to beginWork and keep it on a context
                // "stack" as the parent. Then append children as we go in beginWork
                // or completeWork depending on whether we want to add them top->down or
                // bottom->up. Top->down is faster in IE11.
                const wasHydrated = popHydrationState(workInProgress);
                if (wasHydrated) {
                    // TODO: Move this and createInstance step into the beginPhase
                    // to consolidate.
                    if (
                        prepareToHydrateHostInstance(
                            workInProgress,
                            rootContainerInstance,
                            currentHostContext,
                        )
                    ) {
                        // If changes to the hydrated node need to be applied at the
                        // commit-phase we mark this as such.
                        markUpdate(workInProgress);
                    }
                } else {
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
                }

                if (workInProgress.ref !== null) {
                    // If there is a ref on a host node we need to schedule a callback
                    markRef(workInProgress);
                }
            }
            return null;
        }
        case HostText: {
            const newText = newProps;
            if (current && workInProgress.stateNode != null) {
                const oldText = current.memoizedProps;
                // If we have an alternate, that means this is an update and we need
                // to schedule a side-effect to do the updates.
                updateHostText(current, workInProgress, oldText, newText);
            } else {
                if (typeof newText !== 'string') {
                    invariant(
                        workInProgress.stateNode !== null,
                        'We must have new props for new mounts. This error is likely ' +
                        'caused by a bug in React. Please file an issue.',
                    );
                    // This can happen when we abort work.
                }
                const rootContainerInstance = getRootHostContainer();
                const currentHostContext = getHostContext();
                const wasHydrated = popHydrationState(workInProgress);
                if (wasHydrated) {
                    if (prepareToHydrateHostTextInstance(workInProgress)) {
                        markUpdate(workInProgress);
                    }
                } else {
                    workInProgress.stateNode = createTextInstance(
                        newText,
                        rootContainerInstance,
                        currentHostContext,
                        workInProgress,
                    );
                }
            }
            return null;
        }
        case SuspenseComponent: {
            popSuspenseContext(workInProgress);
            const nextState: null | SuspenseState = workInProgress.memoizedState;

            if (enableSuspenseServerRenderer) {
                if (nextState !== null && nextState.dehydrated !== null) {
                    if (current === null) {
                        const wasHydrated = popHydrationState(workInProgress);
                        invariant(
                            wasHydrated,
                            'A dehydrated suspense component was completed without a hydrated node. ' +
                            'This is probably a bug in React.',
                        );
                        prepareToHydrateHostSuspenseInstance(workInProgress);
                        if (enableSchedulerTracing) {
                            markSpawnedWork(OffscreenLane);
                        }
                        return null;
                    } else {
                        // We should never have been in a hydration state if we didn't have a current.
                        // However, in some of those paths, we might have reentered a hydration state
                        // and then we might be inside a hydration state. In that case, we'll need to exit out of it.
                        resetHydrationState();
                        if ((workInProgress.flags & DidCapture) === NoFlags) {
                            // This boundary did not suspend so it's now hydrated and unsuspended.
                            workInProgress.memoizedState = null;
                        }
                        // If nothing suspended, we need to schedule an effect to mark this boundary
                        // as having hydrated so events know that they're free to be invoked.
                        // It's also a signal to replay events and the suspense callback.
                        // If something suspended, schedule an effect to attach retry listeners.
                        // So we might as well always mark this.
                        workInProgress.flags |= Update;
                        return null;
                    }
                }
            }

            if ((workInProgress.flags & DidCapture) !== NoFlags) {
                // Something suspended. Re-render with the fallback children.
                workInProgress.lanes = renderLanes;
                // Do not reset the effect list.
                if (
                    enableProfilerTimer &&
                    (workInProgress.mode & ProfileMode) !== NoMode
                ) {
                    transferActualDuration(workInProgress);
                }
                return workInProgress;
            }

            const nextDidTimeout = nextState !== null;
            let prevDidTimeout = false;
            if (current === null) {
                if (workInProgress.memoizedProps.fallback !== undefined) {
                    popHydrationState(workInProgress);
                }
            } else {
                const prevState: null | SuspenseState = current.memoizedState;
                prevDidTimeout = prevState !== null;
            }

            if (nextDidTimeout && !prevDidTimeout) {
                // If this subtreee is running in blocking mode we can suspend,
                // otherwise we won't suspend.
                // TODO: This will still suspend a synchronous tree if anything
                // in the concurrent tree already suspended during this render.
                // This is a known bug.
                if ((workInProgress.mode & BlockingMode) !== NoMode) {
                    // TODO: Move this back to throwException because this is too late
                    // if this is a large tree which is common for initial loads. We
                    // don't know if we should restart a render or not until we get
                    // this marker, and this is too late.
                    // If this render already had a ping or lower pri updates,
                    // and this is the first time we know we're going to suspend we
                    // should be able to immediately restart from within throwException.
                    const hasInvisibleChildContext =
                        current === null &&
                        workInProgress.memoizedProps.unstable_avoidThisFallback !== true;
                    if (
                        hasInvisibleChildContext ||
                        hasSuspenseContext(
                            suspenseStackCursor.current,
                            (InvisibleParentSuspenseContext: SuspenseContext),
                        )
                    ) {
                        // If this was in an invisible tree or a new render, then showing
                        // this boundary is ok.
                        renderDidSuspend();
                    } else {
                        // Otherwise, we're going to have to hide content so we should
                        // suspend for longer if possible.
                        renderDidSuspendDelayIfPossible();
                    }
                }
            }

            if (supportsPersistence) {
                // TODO: Only schedule updates if not prevDidTimeout.
                if (nextDidTimeout) {
                    // If this boundary just timed out, schedule an effect to attach a
                    // retry listener to the promise. This flag is also used to hide the
                    // primary children.
                    workInProgress.flags |= Update;
                }
            }
            if (supportsMutation) {
                // TODO: Only schedule updates if these values are non equal, i.e. it changed.
                if (nextDidTimeout || prevDidTimeout) {
                    // If this boundary just timed out, schedule an effect to attach a
                    // retry listener to the promise. This flag is also used to hide the
                    // primary children. In mutation mode, we also need the flag to
                    // *unhide* children that were previously hidden, so check if this
                    // is currently timed out, too.
                    workInProgress.flags |= Update;
                }
            }
            if (
                enableSuspenseCallback &&
                workInProgress.updateQueue !== null &&
                workInProgress.memoizedProps.suspenseCallback != null
            ) {
                // Always notify the callback
                workInProgress.flags |= Update;
            }
            return null;
        }
        case HostPortal:
            popHostContainer(workInProgress);
            updateHostContainer(workInProgress);
            if (current === null) {
                preparePortalMount(workInProgress.stateNode.containerInfo);
            }
            return null;
        case ContextProvider:
            // Pop provider fiber
            popProvider(workInProgress);
            return null;
        case IncompleteClassComponent: {
            // Same as class component case. I put it down here so that the tags are
            // sequential to ensure this switch is compiled to a jump table.
            const Component = workInProgress.type;
            if (isLegacyContextProvider(Component)) {
                popLegacyContext(workInProgress);
            }
            return null;
        }
        case SuspenseListComponent: {
            popSuspenseContext(workInProgress);

            const renderState: null | SuspenseListRenderState =
                workInProgress.memoizedState;

            if (renderState === null) {
                // We're running in the default, "independent" mode.
                // We don't do anything in this mode.
                return null;
            }

            let didSuspendAlready = (workInProgress.flags & DidCapture) !== NoFlags;

            const renderedTail = renderState.rendering;
            if (renderedTail === null) {
                // We just rendered the head.
                if (!didSuspendAlready) {
                    // This is the first pass. We need to figure out if anything is still
                    // suspended in the rendered set.

                    // If new content unsuspended, but there's still some content that
                    // didn't. Then we need to do a second pass that forces everything
                    // to keep showing their fallbacks.

                    // We might be suspended if something in this render pass suspended, or
                    // something in the previous committed pass suspended. Otherwise,
                    // there's no chance so we can skip the expensive call to
                    // findFirstSuspended.
                    const cannotBeSuspended =
                        renderHasNotSuspendedYet() &&
                        (current === null || (current.flags & DidCapture) === NoFlags);
                    if (!cannotBeSuspended) {
                        let row = workInProgress.child;
                        while (row !== null) {
                            const suspended = findFirstSuspended(row);
                            if (suspended !== null) {
                                didSuspendAlready = true;
                                workInProgress.flags |= DidCapture;
                                cutOffTailIfNeeded(renderState, false);

                                // If this is a newly suspended tree, it might not get committed as
                                // part of the second pass. In that case nothing will subscribe to
                                // its thennables. Instead, we'll transfer its thennables to the
                                // SuspenseList so that it can retry if they resolve.
                                // There might be multiple of these in the list but since we're
                                // going to wait for all of them anyway, it doesn't really matter
                                // which ones gets to ping. In theory we could get clever and keep
                                // track of how many dependencies remain but it gets tricky because
                                // in the meantime, we can add/remove/change items and dependencies.
                                // We might bail out of the loop before finding any but that
                                // doesn't matter since that means that the other boundaries that
                                // we did find already has their listeners attached.
                                const newThennables = suspended.updateQueue;
                                if (newThennables !== null) {
                                    workInProgress.updateQueue = newThennables;
                                    workInProgress.flags |= Update;
                                }

                                // Rerender the whole list, but this time, we'll force fallbacks
                                // to stay in place.
                                // Reset the effect list before doing the second pass since that's now invalid.
                                if (renderState.lastEffect === null) {
                                    workInProgress.firstEffect = null;
                                }
                                workInProgress.lastEffect = renderState.lastEffect;
                                // Reset the child fibers to their original state.
                                resetChildFibers(workInProgress, renderLanes);

                                // Set up the Suspense Context to force suspense and immediately
                                // rerender the children.
                                pushSuspenseContext(
                                    workInProgress,
                                    setShallowSuspenseContext(
                                        suspenseStackCursor.current,
                                        ForceSuspenseFallback,
                                    ),
                                );
                                return workInProgress.child;
                            }
                            row = row.sibling;
                        }
                    }

                    if (renderState.tail !== null && now() > getRenderTargetTime()) {
                        // We have already passed our CPU deadline but we still have rows
                        // left in the tail. We'll just give up further attempts to render
                        // the main content and only render fallbacks.
                        workInProgress.flags |= DidCapture;
                        didSuspendAlready = true;

                        cutOffTailIfNeeded(renderState, false);

                        // Since nothing actually suspended, there will nothing to ping this
                        // to get it started back up to attempt the next item. While in terms
                        // of priority this work has the same priority as this current render,
                        // it's not part of the same transition once the transition has
                        // committed. If it's sync, we still want to yield so that it can be
                        // painted. Conceptually, this is really the same as pinging.
                        // We can use any RetryLane even if it's the one currently rendering
                        // since we're leaving it behind on this node.
                        workInProgress.lanes = SomeRetryLane;
                        if (enableSchedulerTracing) {
                            markSpawnedWork(SomeRetryLane);
                        }
                    }
                } else {
                    cutOffTailIfNeeded(renderState, false);
                }
                // Next we're going to render the tail.
            } else {
                // Append the rendered row to the child list.
                if (!didSuspendAlready) {
                    const suspended = findFirstSuspended(renderedTail);
                    if (suspended !== null) {
                        workInProgress.flags |= DidCapture;
                        didSuspendAlready = true;

                        // Ensure we transfer the update queue to the parent so that it doesn't
                        // get lost if this row ends up dropped during a second pass.
                        const newThennables = suspended.updateQueue;
                        if (newThennables !== null) {
                            workInProgress.updateQueue = newThennables;
                            workInProgress.flags |= Update;
                        }

                        cutOffTailIfNeeded(renderState, true);
                        // This might have been modified.
                        if (
                            renderState.tail === null &&
                            renderState.tailMode === 'hidden' &&
                            !renderedTail.alternate &&
                            !getIsHydrating() // We don't cut it if we're hydrating.
                        ) {
                            // We need to delete the row we just rendered.
                            // Reset the effect list to what it was before we rendered this
                            // child. The nested children have already appended themselves.
                            const lastEffect = (workInProgress.lastEffect =
                                renderState.lastEffect);
                            // Remove any effects that were appended after this point.
                            if (lastEffect !== null) {
                                lastEffect.nextEffect = null;
                            }
                            // We're done.
                            return null;
                        }
                    } else if (
                        // The time it took to render last row is greater than the remaining
                        // time we have to render. So rendering one more row would likely
                        // exceed it.
                        now() * 2 - renderState.renderingStartTime >
                        getRenderTargetTime() &&
                        renderLanes !== OffscreenLane
                    ) {
                        // We have now passed our CPU deadline and we'll just give up further
                        // attempts to render the main content and only render fallbacks.
                        // The assumption is that this is usually faster.
                        workInProgress.flags |= DidCapture;
                        didSuspendAlready = true;

                        cutOffTailIfNeeded(renderState, false);

                        // Since nothing actually suspended, there will nothing to ping this
                        // to get it started back up to attempt the next item. While in terms
                        // of priority this work has the same priority as this current render,
                        // it's not part of the same transition once the transition has
                        // committed. If it's sync, we still want to yield so that it can be
                        // painted. Conceptually, this is really the same as pinging.
                        // We can use any RetryLane even if it's the one currently rendering
                        // since we're leaving it behind on this node.
                        workInProgress.lanes = SomeRetryLane;
                        if (enableSchedulerTracing) {
                            markSpawnedWork(SomeRetryLane);
                        }
                    }
                }
                if (renderState.isBackwards) {
                    // The effect list of the backwards tail will have been added
                    // to the end. This breaks the guarantee that life-cycles fire in
                    // sibling order but that isn't a strong guarantee promised by React.
                    // Especially since these might also just pop in during future commits.
                    // Append to the beginning of the list.
                    renderedTail.sibling = workInProgress.child;
                    workInProgress.child = renderedTail;
                } else {
                    const previousSibling = renderState.last;
                    if (previousSibling !== null) {
                        previousSibling.sibling = renderedTail;
                    } else {
                        workInProgress.child = renderedTail;
                    }
                    renderState.last = renderedTail;
                }
            }

            if (renderState.tail !== null) {
                // We still have tail rows to render.
                // Pop a row.
                const next = renderState.tail;
                renderState.rendering = next;
                renderState.tail = next.sibling;
                renderState.lastEffect = workInProgress.lastEffect;
                renderState.renderingStartTime = now();
                next.sibling = null;

                // Restore the context.
                // TODO: We can probably just avoid popping it instead and only
                // setting it the first time we go from not suspended to suspended.
                let suspenseContext = suspenseStackCursor.current;
                if (didSuspendAlready) {
                    suspenseContext = setShallowSuspenseContext(
                        suspenseContext,
                        ForceSuspenseFallback,
                    );
                } else {
                    suspenseContext = setDefaultShallowSuspenseContext(suspenseContext);
                }
                pushSuspenseContext(workInProgress, suspenseContext);
                // Do a pass over the next row.
                return next;
            }
            return null;
        }
        case FundamentalComponent: {
            if (enableFundamentalAPI) {
                const fundamentalImpl = workInProgress.type.impl;
                let fundamentalInstance: ReactFundamentalComponentInstance<
                    any,
                    any,
                    > | null = workInProgress.stateNode;

                if (fundamentalInstance === null) {
                    const getInitialState = fundamentalImpl.getInitialState;
                    let fundamentalState;
                    if (getInitialState !== undefined) {
                        fundamentalState = getInitialState(newProps);
                    }
                    fundamentalInstance = workInProgress.stateNode = createFundamentalStateInstance(
                        workInProgress,
                        newProps,
                        fundamentalImpl,
                        fundamentalState || {},
                    );
                    const instance = ((getFundamentalComponentInstance(
                        fundamentalInstance,
                    ): any): Instance);
                    fundamentalInstance.instance = instance;
                    if (fundamentalImpl.reconcileChildren === false) {
                        return null;
                    }
                    appendAllChildren(instance, workInProgress, false, false);
                    mountFundamentalComponent(fundamentalInstance);
                } else {
                    // We fire update in commit phase
                    const prevProps = fundamentalInstance.props;
                    fundamentalInstance.prevProps = prevProps;
                    fundamentalInstance.props = newProps;
                    fundamentalInstance.currentFiber = workInProgress;
                    if (supportsPersistence) {
                        const instance = cloneFundamentalInstance(fundamentalInstance);
                        fundamentalInstance.instance = instance;
                        appendAllChildren(instance, workInProgress, false, false);
                    }
                    const shouldUpdate = shouldUpdateFundamentalComponent(
                        fundamentalInstance,
                    );
                    if (shouldUpdate) {
                        markUpdate(workInProgress);
                    }
                }
                return null;
            }
            break;
        }
        case ScopeComponent: {
            if (enableScopeAPI) {
                if (current === null) {
                    const scopeInstance: ReactScopeInstance = createScopeInstance();
                    workInProgress.stateNode = scopeInstance;
                    prepareScopeUpdate(scopeInstance, workInProgress);
                    if (workInProgress.ref !== null) {
                        markRef(workInProgress);
                        markUpdate(workInProgress);
                    }
                } else {
                    if (workInProgress.ref !== null) {
                        markUpdate(workInProgress);
                    }
                    if (current.ref !== workInProgress.ref) {
                        markRef(workInProgress);
                    }
                }
                return null;
            }
            break;
        }
        case Block:
            if (enableBlocksAPI) {
                return null;
            }
            break;
        case OffscreenComponent:
        case LegacyHiddenComponent: {
            popRenderLanes(workInProgress);
            if (current !== null) {
                const nextState: OffscreenState | null = workInProgress.memoizedState;
                const prevState: OffscreenState | null = current.memoizedState;

                const prevIsHidden = prevState !== null;
                const nextIsHidden = nextState !== null;
                if (
                    prevIsHidden !== nextIsHidden &&
                    newProps.mode !== 'unstable-defer-without-hiding'
                ) {
                    workInProgress.flags |= Update;
                }
            }
            return null;
        }
    }
    invariant(
        false,
        'Unknown unit of work tag (%s). This error is likely caused by a bug in ' +
        'React. Please file an issue.',
        workInProgress.tag,
    );
}


function createInstance(
    type: string,
    props: Props,
    rootContainerInstance: Container,
    hostContext: HostContext,
    internalInstanceHandle: Object,
): Instance {
    let parentNamespace: string;
    if (__DEV__) {
        // TODO: take namespace into account when validating.
        const hostContextDev = ((hostContext: any): HostContextDev);
        validateDOMNesting(type, null, hostContextDev.ancestorInfo);
        if (
            typeof props.children === 'string' ||
            typeof props.children === 'number'
        ) {
            const string = '' + props.children;
            const ownAncestorInfo = updatedAncestorInfo(
                hostContextDev.ancestorInfo,
                type,
            );
            validateDOMNesting(null, string, ownAncestorInfo);
        }
        parentNamespace = hostContextDev.namespace;
    } else {
        parentNamespace = ((hostContext as any) as HostContextProd);
    }
    const domElement: Instance = createElement(
        type,
        props,
        rootContainerInstance,
        parentNamespace,
    );
    precacheFiberNode(internalInstanceHandle, domElement);
    updateFiberProps(domElement, props);
    return domElement;
}

function createElement(
    type: string,
    props: Object,
    rootContainerElement: Element | Document,
    parentNamespace: string,
): Element {
    let isCustomComponentTag;

    // We create tags in the namespace of their parent container, except HTML
    // tags get no namespace.
    const ownerDocument: Document = getOwnerDocumentFromRootContainer(
        rootContainerElement,
    );
    let domElement: Element;
    let namespaceURI = parentNamespace;
    if (namespaceURI === HTML_NAMESPACE) {
        namespaceURI = getIntrinsicNamespace(type);
    }
    if (namespaceURI === HTML_NAMESPACE) {
        if (__DEV__) {
            isCustomComponentTag = isCustomComponent(type, props);
            // Should this check be gated by parent namespace? Not sure we want to
            // allow <SVG> or <mATH>.
            if (!isCustomComponentTag && type !== type.toLowerCase()) {
                console.error(
                    '<%s /> is using incorrect casing. ' +
                    'Use PascalCase for React components, ' +
                    'or lowercase for HTML elements.',
                    type,
                );
            }
        }

        if (type === 'script') {
            // Create the script via .innerHTML so its "parser-inserted" flag is
            // set to true and it does not execute
            const div = ownerDocument.createElement('div');
            if (__DEV__) {
                if (enableTrustedTypesIntegration && !didWarnScriptTags) {
                    console.error(
                        'Encountered a script tag while rendering React component. ' +
                        'Scripts inside React components are never executed when rendering ' +
                        'on the client. Consider using template tag instead ' +
                        '(https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template).',
                    );
                    didWarnScriptTags = true;
                }
            }
            div.innerHTML = '<script><' + '/script>'; // eslint-disable-line
            // This is guaranteed to yield a script element.
            const firstChild = ((div.firstChild: any): HTMLScriptElement);
            domElement = div.removeChild(firstChild);
        } else if (typeof props.is === 'string') {
            // $FlowIssue `createElement` should be updated for Web Components
            domElement = ownerDocument.createElement(type, { is: props.is });
        } else {
            // Separate else branch instead of using `props.is || undefined` above because of a Firefox bug.
            // See discussion in https://github.com/facebook/react/pull/6896
            // and discussion in https://bugzilla.mozilla.org/show_bug.cgi?id=1276240
            domElement = ownerDocument.createElement(type);
            // Normally attributes are assigned in `setInitialDOMProperties`, however the `multiple` and `size`
            // attributes on `select`s needs to be added before `option`s are inserted.
            // This prevents:
            // - a bug where the `select` does not scroll to the correct option because singular
            //  `select` elements automatically pick the first item #13222
            // - a bug where the `select` set the first item as selected despite the `size` attribute #14239
            // See https://github.com/facebook/react/issues/13222
            // and https://github.com/facebook/react/issues/14239
            if (type === 'select') {
                const node = ((domElement: any): HTMLSelectElement);
                if (props.multiple) {
                    node.multiple = true;
                } else if (props.size) {
                    // Setting a size greater than 1 causes a select to behave like `multiple=true`, where
                    // it is possible that no option is selected.
                    //
                    // This is only necessary when a select in "single selection mode".
                    node.size = props.size;
                }
            }
        }
    } else {
        domElement = ownerDocument.createElementNS(namespaceURI, type);
    }

    if (__DEV__) {
        if (namespaceURI === HTML_NAMESPACE) {
            if (
                !isCustomComponentTag &&
                Object.prototype.toString.call(domElement) ===
                '[object HTMLUnknownElement]' &&
                !Object.prototype.hasOwnProperty.call(warnedUnknownTags, type)
            ) {
                warnedUnknownTags[type] = true;
                console.error(
                    'The tag <%s> is unrecognized in this browser. ' +
                    'If you meant to render a React component, start its name with ' +
                    'an uppercase letter.',
                    type,
                );
            }
        }
    }

    return domElement;
}

appendAllChildren = function (
    parent: Instance,
    workInProgress: Fiber,
    needsVisibilityToggle: boolean,
    isHidden: boolean,
) {
    // We only have the top Fiber that was created but we need recurse down its
    // children to find all the terminal nodes.
    let node = workInProgress.child;
    // 这里应该是指当前这个节点的 dom 刚创建，将其后代的 dom append 进来
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

function finalizeInitialChildren(
    domElement: Instance,
    type: string,
    props: Props,
    rootContainerInstance: Container,
    hostContext: HostContext,
): boolean {
    setInitialProperties(domElement, type, props, rootContainerInstance);
    return shouldAutoFocusHostComponent(type, props);
}


function setInitialProperties(
    domElement: Element,
    tag: string,
    rawProps: Object,
    rootContainerElement: Element | Document,
): void {
    const isCustomComponentTag = isCustomComponent(tag, rawProps);
    if (__DEV__) {
        validatePropertiesInDevelopment(tag, rawProps);
    }

    // TODO: Make sure that we check isMounted before firing any of these events.
    let props: Object;
    switch (tag) {
        case 'dialog':
            listenToNonDelegatedEvent('cancel', domElement);
            listenToNonDelegatedEvent('close', domElement);
            props = rawProps;
            break;
        case 'iframe':
        case 'object':
        case 'embed':
            // We listen to this event in case to ensure emulated bubble
            // listeners still fire for the load event.
            listenToNonDelegatedEvent('load', domElement);
            props = rawProps;
            break;
        case 'video':
        case 'audio':
            // We listen to these events in case to ensure emulated bubble
            // listeners still fire for all the media events.
            for (let i = 0; i < mediaEventTypes.length; i++) {
                listenToNonDelegatedEvent(mediaEventTypes[i], domElement);
            }
            props = rawProps;
            break;
        case 'source':
            // We listen to this event in case to ensure emulated bubble
            // listeners still fire for the error event.
            listenToNonDelegatedEvent('error', domElement);
            props = rawProps;
            break;
        case 'img':
        case 'image':
        case 'link':
            // We listen to these events in case to ensure emulated bubble
            // listeners still fire for error and load events.
            listenToNonDelegatedEvent('error', domElement);
            listenToNonDelegatedEvent('load', domElement);
            props = rawProps;
            break;
        case 'details':
            // We listen to this event in case to ensure emulated bubble
            // listeners still fire for the toggle event.
            listenToNonDelegatedEvent('toggle', domElement);
            props = rawProps;
            break;
        case 'input':
            ReactDOMInputInitWrapperState(domElement, rawProps);
            props = ReactDOMInputGetHostProps(domElement, rawProps);
            // We listen to this event in case to ensure emulated bubble
            // listeners still fire for the invalid event.
            listenToNonDelegatedEvent('invalid', domElement);
            if (!enableEagerRootListeners) {
                // For controlled components we always need to ensure we're listening
                // to onChange. Even if there is no listener.
                ensureListeningTo(rootContainerElement, 'onChange', domElement);
            }
            break;
        case 'option':
            ReactDOMOptionValidateProps(domElement, rawProps);
            props = ReactDOMOptionGetHostProps(domElement, rawProps);
            break;
        case 'select':
            ReactDOMSelectInitWrapperState(domElement, rawProps);
            props = ReactDOMSelectGetHostProps(domElement, rawProps);
            // We listen to this event in case to ensure emulated bubble
            // listeners still fire for the invalid event.
            listenToNonDelegatedEvent('invalid', domElement);
            if (!enableEagerRootListeners) {
                // For controlled components we always need to ensure we're listening
                // to onChange. Even if there is no listener.
                ensureListeningTo(rootContainerElement, 'onChange', domElement);
            }
            break;
        case 'textarea':
            ReactDOMTextareaInitWrapperState(domElement, rawProps);
            props = ReactDOMTextareaGetHostProps(domElement, rawProps);
            // We listen to this event in case to ensure emulated bubble
            // listeners still fire for the invalid event.
            listenToNonDelegatedEvent('invalid', domElement);
            if (!enableEagerRootListeners) {
                // For controlled components we always need to ensure we're listening
                // to onChange. Even if there is no listener.
                ensureListeningTo(rootContainerElement, 'onChange', domElement);
            }
            break;
        default:
            props = rawProps;
    }

    assertValidProps(tag, props);

    setInitialDOMProperties(
        tag,
        domElement,
        rootContainerElement,
        props,
        isCustomComponentTag,
    );

    switch (tag) {
        case 'input':
            // TODO: Make sure we check if this is still unmounted or do any clean
            // up necessary since we never stop tracking anymore.
            track((domElement as any));
            ReactDOMInputPostMountWrapper(domElement, rawProps, false);
            break;
        case 'textarea':
            // TODO: Make sure we check if this is still unmounted or do any clean
            // up necessary since we never stop tracking anymore.
            track((domElement as any));
            ReactDOMTextareaPostMountWrapper(domElement, rawProps);
            break;
        case 'option':
            ReactDOMOptionPostMountWrapper(domElement, rawProps);
            break;
        case 'select':
            ReactDOMSelectPostMountWrapper(domElement, rawProps);
            break;
        default:
            if (typeof props.onClick === 'function') {
                // TODO: This cast may not be sound for SVG, MathML or custom elements.
                trapClickOnNonInteractiveElement(((domElement: any): HTMLElement));
            }
            break;
    }
}

function setInitialDOMProperties(
    tag: string,
    domElement: Element,
    rootContainerElement: Element | Document,
    nextProps: Object,
    isCustomComponentTag: boolean,
): void {
    for (const propKey in nextProps) {
        if (!nextProps.hasOwnProperty(propKey)) {
            continue;
        }
        const nextProp = nextProps[propKey];
        if (propKey === STYLE) {
            if (__DEV__) {
                if (nextProp) {
                    // Freeze the next style object so that we can assume it won't be
                    // mutated. We have already warned for this in the past.
                    Object.freeze(nextProp);
                }
            }
            // Relies on `updateStylesByID` not mutating `styleUpdates`.
            setValueForStyles(domElement, nextProp);
        } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
            const nextHtml = nextProp ? nextProp[HTML] : undefined;
            if (nextHtml != null) {
                setInnerHTML(domElement, nextHtml);
            }
        } else if (propKey === CHILDREN) {
            if (typeof nextProp === 'string') {
                // Avoid setting initial textContent when the text is empty. In IE11 setting
                // textContent on a <textarea> will cause the placeholder to not
                // show within the <textarea> until it has been focused and blurred again.
                // https://github.com/facebook/react/issues/6731#issuecomment-254874553
                const canSetTextContent = tag !== 'textarea' || nextProp !== '';
                if (canSetTextContent) {
                    setTextContent(domElement, nextProp);
                }
            } else if (typeof nextProp === 'number') {
                setTextContent(domElement, '' + nextProp);
            }
        } else if (
            propKey === SUPPRESS_CONTENT_EDITABLE_WARNING ||
            propKey === SUPPRESS_HYDRATION_WARNING
        ) {
            // Noop
        } else if (propKey === AUTOFOCUS) {
            // We polyfill it separately on the client during commit.
            // We could have excluded it in the property list instead of
            // adding a special case here, but then it wouldn't be emitted
            // on server rendering (but we *do* want to emit it in SSR).
        } else if (registrationNameDependencies.hasOwnProperty(propKey)) {
            if (nextProp != null) {
                if (__DEV__ && typeof nextProp !== 'function') {
                    warnForInvalidEventListener(propKey, nextProp);
                }
                if (!enableEagerRootListeners) {
                    ensureListeningTo(rootContainerElement, propKey, domElement);
                } else if (propKey === 'onScroll') {
                    listenToNonDelegatedEvent('scroll', domElement);
                }
            }
        } else if (nextProp != null) {
            setValueForProperty(domElement, propKey, nextProp, isCustomComponentTag);
        }
    }
}

updateHostContainer = function (workInProgress: Fiber) {
    // Noop
};

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
        nextContext = readContext(contextType);
    } else if (!disableLegacyContext) {
        const nextUnmaskedContext = getUnmaskedContext(workInProgress, ctor, true);
        nextContext = getMaskedContext(workInProgress, nextUnmaskedContext);
    }

    const getDerivedStateFromProps = ctor.getDerivedStateFromProps;
    const hasNewLifecycles =
        typeof getDerivedStateFromProps === 'function' ||
        typeof instance.getSnapshotBeforeUpdate === 'function';

    // Note: During these life-cycles, instance.props/instance.state are what
    // ever the previously attempted to render - not the "current". However,
    // during componentDidUpdate we pass the "current" props.

    // In order to support react-lifecycles-compat polyfilled components,
    // Unsafe lifecycles should not be invoked for components using the new APIs.
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

    resetHasForceUpdateBeforeProcessing();

    const oldState = workInProgress.memoizedState;
    let newState = (instance.state = oldState);
    processUpdateQueue(workInProgress, newProps, instance, renderLanes);
    newState = workInProgress.memoizedState;

    if (
        unresolvedOldProps === unresolvedNewProps &&
        oldState === newState &&
        !hasContextChanged() &&
        !checkHasForceUpdateAfterProcessing()
    ) {
        // If an update was already in progress, we should schedule an Update
        // effect even though we're bailing out, so that cWU/cDU are called.
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
        // In order to support react-lifecycles-compat polyfilled components,
        // Unsafe lifecycles should not be invoked for components using the new APIs.
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
        // If an update was already in progress, we should schedule an Update
        // effect even though we're bailing out, so that cWU/cDU are called.
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

updateHostComponent = function (
    current: Fiber,
    workInProgress: Fiber,
    type: Type,
    newProps: Props,
    rootContainerInstance: Container,
) {
    // If we have an alternate, that means this is an update and we need to
    // schedule a side-effect to do the updates.
    const oldProps = current.memoizedProps;
    if (oldProps === newProps) {
        // In mutation mode, this is sufficient for a bailout because
        // we won't touch this node even if children changed.
        return;
    }

    // If we get updated because one of our children updated, we don't
    // have newProps so we'll have to reuse them.
    // TODO: Split the update API as separate for the props vs. children.
    // Even better would be if children weren't special cased at all tho.
    const instance: Instance = workInProgress.stateNode;
    const currentHostContext = getHostContext();
    // TODO: Experiencing an error where oldProps is null. Suggests a host
    // component is hitting the resume path. Figure out why. Possibly
    // related to `hidden`.
    const updatePayload = prepareUpdate(
        instance,
        type,
        oldProps,
        newProps,
        rootContainerInstance,
        currentHostContext,
    );
    // TODO: Type this specific to this type of component.
    workInProgress.updateQueue = (updatePayload: any);
    // If the update payload indicates that there is a change or if there
    // is a new ref we mark this as an update. All the work is done in commitWork.
    if (updatePayload) {
        markUpdate(workInProgress);
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

    if (enableProfilerTimer) {
        // Don't update "base" render times for bailouts.
        stopProfilerTimerIfRunning(workInProgress);
    }

    markSkippedUpdateLanes(workInProgress.lanes);

    // Check if the children have any pending work.
    if (!includesSomeLane(renderLanes, workInProgress.childLanes)) {
        // The children don't have any work either. We can skip them.
        // TODO: Once we add back resuming, we should check if the children are
        // a work-in-progress set. If so, we need to transfer their effects.
        return null;
    } else {
        // This fiber doesn't have work, but its subtree does. Clone the child
        // fibers and continue.
        cloneChildFibers(current, workInProgress);
        return workInProgress.child;
    }
}


function commitRoot(root) {
    const renderPriorityLevel = getCurrentPriorityLevel();
    runWithPriority(
        ImmediateSchedulerPriority,
        commitRootImpl.bind(null, root, renderPriorityLevel),
    );
    return null;
}

function commitRootImpl(root, renderPriorityLevel) {
    do {
        // `flushPassiveEffects` will call `flushSyncUpdateQueue` at the end, which
        // means `flushPassiveEffects` will sometimes result in additional
        // passive effects. So we need to keep flushing in a loop until there are
        // no more pending effects.
        // TODO: Might be better if `flushPassiveEffects` did not automatically
        // flush synchronous work at the end, to avoid factoring hazards like this.
        flushPassiveEffects();
    } while (rootWithPendingPassiveEffects !== null);
    flushRenderPhaseStrictModeWarningsInDEV();

    invariant(
        (executionContext & (RenderContext | CommitContext)) === NoContext,
        'Should not already be working.',
    );

    const finishedWork = root.finishedWork;
    const lanes = root.finishedLanes;

    if (__DEV__) {
        if (enableDebugTracing) {
            logCommitStarted(lanes);
        }
    }

    if (enableSchedulingProfiler) {
        markCommitStarted(lanes);
    }

    if (finishedWork === null) {
        if (__DEV__) {
            if (enableDebugTracing) {
                logCommitStopped();
            }
        }

        if (enableSchedulingProfiler) {
            markCommitStopped();
        }

        return null;
    }
    root.finishedWork = null;
    root.finishedLanes = NoLanes;

    invariant(
        finishedWork !== root.current,
        'Cannot commit the same tree as before. This error is likely caused by ' +
        'a bug in React. Please file an issue.',
    );

    // commitRoot never returns a continuation; it always finishes synchronously.
    // So we can clear these now to allow a new callback to be scheduled.
    root.callbackNode = null;

    // Update the first and last pending times on this root. The new first
    // pending time is whatever is left on the root fiber.
    let remainingLanes = mergeLanes(finishedWork.lanes, finishedWork.childLanes);
    markRootFinished(root, remainingLanes);

    // Clear already finished discrete updates in case that a later call of
    // `flushDiscreteUpdates` starts a useless render pass which may cancels
    // a scheduled timeout.
    if (rootsWithPendingDiscreteUpdates !== null) {
        if (
            !hasDiscreteLanes(remainingLanes) &&
            rootsWithPendingDiscreteUpdates.has(root)
        ) {
            rootsWithPendingDiscreteUpdates.delete(root);
        }
    }

    if (root === workInProgressRoot) {
        // We can reset these now that they are finished.
        workInProgressRoot = null;
        workInProgress = null;
        workInProgressRootRenderLanes = NoLanes;
    } else {
        // This indicates that the last root we worked on is not the same one that
        // we're committing now. This most commonly happens when a suspended root
        // times out.
    }

    // Get the list of effects.
    let firstEffect;
    if (finishedWork.flags > PerformedWork) {
        // A fiber's effect list consists only of its children, not itself. So if
        // the root has an effect, we need to add it to the end of the list. The
        // resulting list is the set that would belong to the root's parent, if it
        // had one; that is, all the effects in the tree including the root.
        if (finishedWork.lastEffect !== null) {
            finishedWork.lastEffect.nextEffect = finishedWork;
            firstEffect = finishedWork.firstEffect;
        } else {
            firstEffect = finishedWork;
        }
    } else {
        // There is no effect on the root.
        firstEffect = finishedWork.firstEffect;
    }

    if (firstEffect !== null) {
        let previousLanePriority;
        if (decoupleUpdatePriorityFromScheduler) {
            previousLanePriority = getCurrentUpdateLanePriority();
            setCurrentUpdateLanePriority(SyncLanePriority);
        }

        const prevExecutionContext = executionContext;
        executionContext |= CommitContext;
        const prevInteractions = pushInteractions(root);

        // Reset this to null before calling lifecycles
        ReactCurrentOwner.current = null;

        // The commit phase is broken into several sub-phases. We do a separate pass
        // of the effect list for each phase: all mutation effects come before all
        // layout effects, and so on.

        // The first phase a "before mutation" phase. We use this phase to read the
        // state of the host tree right before we mutate it. This is where
        // getSnapshotBeforeUpdate is called.
        focusedInstanceHandle = prepareForCommit(root.containerInfo);
        shouldFireAfterActiveInstanceBlur = false;

        nextEffect = firstEffect;
        do {
            if (__DEV__) {
                invokeGuardedCallback(null, commitBeforeMutationEffects, null);
                if (hasCaughtError()) {
                    invariant(nextEffect !== null, 'Should be working on an effect.');
                    const error = clearCaughtError();
                    captureCommitPhaseError(nextEffect, error);
                    nextEffect = nextEffect.nextEffect;
                }
            } else {
                try {
                    commitBeforeMutationEffects();
                } catch (error) {
                    invariant(nextEffect !== null, 'Should be working on an effect.');
                    captureCommitPhaseError(nextEffect, error);
                    nextEffect = nextEffect.nextEffect;
                }
            }
        } while (nextEffect !== null);

        // We no longer need to track the active instance fiber
        focusedInstanceHandle = null;

        if (enableProfilerTimer) {
            // Mark the current commit time to be shared by all Profilers in this
            // batch. This enables them to be grouped later.
            recordCommitTime();
        }

        // The next phase is the mutation phase, where we mutate the host tree.
        nextEffect = firstEffect;
        do {
            if (__DEV__) {
                invokeGuardedCallback(
                    null,
                    commitMutationEffects,
                    null,
                    root,
                    renderPriorityLevel,
                );
                if (hasCaughtError()) {
                    invariant(nextEffect !== null, 'Should be working on an effect.');
                    const error = clearCaughtError();
                    captureCommitPhaseError(nextEffect, error);
                    nextEffect = nextEffect.nextEffect;
                }
            } else {
                try {
                    commitMutationEffects(root, renderPriorityLevel);
                } catch (error) {
                    invariant(nextEffect !== null, 'Should be working on an effect.');
                    captureCommitPhaseError(nextEffect, error);
                    nextEffect = nextEffect.nextEffect;
                }
            }
        } while (nextEffect !== null);

        if (shouldFireAfterActiveInstanceBlur) {
            afterActiveInstanceBlur();
        }
        resetAfterCommit(root.containerInfo);

        // The work-in-progress tree is now the current tree. This must come after
        // the mutation phase, so that the previous tree is still current during
        // componentWillUnmount, but before the layout phase, so that the finished
        // work is current during componentDidMount/Update.
        root.current = finishedWork;

        // The next phase is the layout phase, where we call effects that read
        // the host tree after it's been mutated. The idiomatic use case for this is
        // layout, but class component lifecycles also fire here for legacy reasons.
        nextEffect = firstEffect;
        do {
            if (__DEV__) {
                invokeGuardedCallback(null, commitLayoutEffects, null, root, lanes);
                if (hasCaughtError()) {
                    invariant(nextEffect !== null, 'Should be working on an effect.');
                    const error = clearCaughtError();
                    captureCommitPhaseError(nextEffect, error);
                    nextEffect = nextEffect.nextEffect;
                }
            } else {
                try {
                    commitLayoutEffects(root, lanes);
                } catch (error) {
                    invariant(nextEffect !== null, 'Should be working on an effect.');
                    captureCommitPhaseError(nextEffect, error);
                    nextEffect = nextEffect.nextEffect;
                }
            }
        } while (nextEffect !== null);

        nextEffect = null;

        // Tell Scheduler to yield at the end of the frame, so the browser has an
        // opportunity to paint.
        requestPaint();

        if (enableSchedulerTracing) {
            popInteractions(((prevInteractions: any): Set<Interaction>));
        }
        executionContext = prevExecutionContext;

        if (decoupleUpdatePriorityFromScheduler && previousLanePriority != null) {
            // Reset the priority to the previous non-sync value.
            setCurrentUpdateLanePriority(previousLanePriority);
        }
    } else {
        // No effects.
        root.current = finishedWork;
        // Measure these anyway so the flamegraph explicitly shows that there were
        // no effects.
        // TODO: Maybe there's a better way to report this.
        if (enableProfilerTimer) {
            recordCommitTime();
        }
    }

    const rootDidHavePassiveEffects = rootDoesHavePassiveEffects;

    if (rootDoesHavePassiveEffects) {
        // This commit has passive effects. Stash a reference to them. But don't
        // schedule a callback until after flushing layout work.
        rootDoesHavePassiveEffects = false;
        rootWithPendingPassiveEffects = root;
        pendingPassiveEffectsLanes = lanes;
        pendingPassiveEffectsRenderPriority = renderPriorityLevel;
    } else {
        // We are done with the effect chain at this point so let's clear the
        // nextEffect pointers to assist with GC. If we have passive effects, we'll
        // clear this in flushPassiveEffects.
        nextEffect = firstEffect;
        while (nextEffect !== null) {
            const nextNextEffect = nextEffect.nextEffect;
            nextEffect.nextEffect = null;
            if (nextEffect.flags & Deletion) {
                detachFiberAfterEffects(nextEffect);
            }
            nextEffect = nextNextEffect;
        }
    }

    // Read this again, since an effect might have updated it
    remainingLanes = root.pendingLanes;

    // Check if there's remaining work on this root
    if (remainingLanes !== NoLanes) {
        if (enableSchedulerTracing) {
            if (spawnedWorkDuringRender !== null) {
                const expirationTimes = spawnedWorkDuringRender;
                spawnedWorkDuringRender = null;
                for (let i = 0; i < expirationTimes.length; i++) {
                    scheduleInteractions(
                        root,
                        expirationTimes[i],
                        root.memoizedInteractions,
                    );
                }
            }
            schedulePendingInteractions(root, remainingLanes);
        }
    } else {
        // If there's no remaining work, we can clear the set of already failed
        // error boundaries.
        legacyErrorBoundariesThatAlreadyFailed = null;
    }

    if (enableSchedulerTracing) {
        if (!rootDidHavePassiveEffects) {
            // If there are no passive effects, then we can complete the pending interactions.
            // Otherwise, we'll wait until after the passive effects are flushed.
            // Wait to do this until after remaining work has been scheduled,
            // so that we don't prematurely signal complete for interactions when there's e.g. hidden work.
            finishPendingInteractions(root, lanes);
        }
    }

    if (remainingLanes === SyncLane) {
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

    onCommitRootDevTools(finishedWork.stateNode, renderPriorityLevel);

    if (__DEV__) {
        onCommitRootTestSelector();
    }

    // Always call this before exiting `commitRoot`, to ensure that any
    // additional work on this root is scheduled.
    ensureRootIsScheduled(root, now());

    if (hasUncaughtError) {
        hasUncaughtError = false;
        const error = firstUncaughtError;
        firstUncaughtError = null;
        throw error;
    }

    if ((executionContext & LegacyUnbatchedContext) !== NoContext) {
        if (__DEV__) {
            if (enableDebugTracing) {
                logCommitStopped();
            }
        }

        if (enableSchedulingProfiler) {
            markCommitStopped();
        }

        // This is a legacy edge case. We just committed the initial mount of
        // a ReactDOM.render-ed root inside of batchedUpdates. The commit fired
        // synchronously, but layout updates should be deferred until the end
        // of the batch.
        return null;
    }

    // If layout work was scheduled, flush it now.
    flushSyncCallbackQueue();

    if (__DEV__) {
        if (enableDebugTracing) {
            logCommitStopped();
        }
    }

    if (enableSchedulingProfiler) {
        markCommitStopped();
    }

    return null;
}

function commitBeforeMutationEffects() {
    while (nextEffect !== null) {
        const current = nextEffect.alternate;

        if (!shouldFireAfterActiveInstanceBlur && focusedInstanceHandle !== null) {
            if ((nextEffect.flags & Deletion) !== NoFlags) {
                if (doesFiberContain(nextEffect, focusedInstanceHandle)) {
                    shouldFireAfterActiveInstanceBlur = true;
                    beforeActiveInstanceBlur();
                }
            } else {
                // TODO: Move this out of the hot path using a dedicated effect tag.
                if (
                    nextEffect.tag === SuspenseComponent &&
                    isSuspenseBoundaryBeingHidden(current, nextEffect) &&
                    doesFiberContain(nextEffect, focusedInstanceHandle)
                ) {
                    shouldFireAfterActiveInstanceBlur = true;
                    beforeActiveInstanceBlur();
                }
            }
        }

        const flags = nextEffect.flags;
        if ((flags & Snapshot) !== NoFlags) {
            setCurrentDebugFiberInDEV(nextEffect);

            commitBeforeMutationEffectOnFiber(current, nextEffect);

            resetCurrentDebugFiberInDEV();
        }
        if ((flags & Passive) !== NoFlags) {
            // If there are passive effects, schedule a callback to flush at
            // the earliest opportunity.
            if (!rootDoesHavePassiveEffects) {
                rootDoesHavePassiveEffects = true;
                scheduleCallback(NormalSchedulerPriority, () => {
                    flushPassiveEffects();
                    return null;
                });
            }
        }
        nextEffect = nextEffect.nextEffect;
    }
}

function commitMutationEffects(
    root: FiberRoot,
    renderPriorityLevel: ReactPriorityLevel,
) {
    // TODO: Should probably move the bulk of this function to commitWork.
    while (nextEffect !== null) {
        setCurrentDebugFiberInDEV(nextEffect);

        const flags = nextEffect.flags;

        if (flags & ContentReset) {
            commitResetTextContent(nextEffect);
        }

        if (flags & Ref) {
            const current = nextEffect.alternate;
            if (current !== null) {
                commitDetachRef(current);
            }
            if (enableScopeAPI) {
                // TODO: This is a temporary solution that allowed us to transition away
                // from React Flare on www.
                if (nextEffect.tag === ScopeComponent) {
                    commitAttachRef(nextEffect);
                }
            }
        }

        // The following switch statement is only concerned about placement,
        // updates, and deletions. To avoid needing to add a case for every possible
        // bitmap value, we remove the secondary effects from the effect tag and
        // switch on that value.
        const primaryFlags = flags & (Placement | Update | Deletion | Hydrating);
        switch (primaryFlags) {
            case Placement: {
                commitPlacement(nextEffect);
                // Clear the "placement" from effect tag so that we know that this is
                // inserted, before any life-cycles like componentDidMount gets called.
                // TODO: findDOMNode doesn't rely on this any more but isMounted does
                // and isMounted is deprecated anyway so we should be able to kill this.
                nextEffect.flags &= ~Placement;
                break;
            }
            case PlacementAndUpdate: {
                // Placement
                commitPlacement(nextEffect);
                // Clear the "placement" from effect tag so that we know that this is
                // inserted, before any life-cycles like componentDidMount gets called.
                nextEffect.flags &= ~Placement;

                // Update
                const current = nextEffect.alternate;
                commitWork(current, nextEffect);
                break;
            }
            case Hydrating: {
                nextEffect.flags &= ~Hydrating;
                break;
            }
            case HydratingAndUpdate: {
                nextEffect.flags &= ~Hydrating;

                // Update
                const current = nextEffect.alternate;
                commitWork(current, nextEffect);
                break;
            }
            case Update: {
                const current = nextEffect.alternate;
                commitWork(current, nextEffect);
                break;
            }
            case Deletion: {
                commitDeletion(root, nextEffect, renderPriorityLevel);
                break;
            }
        }

        resetCurrentDebugFiberInDEV();
        nextEffect = nextEffect.nextEffect;
    }
}


function commitWork(current: Fiber | null, finishedWork: Fiber): void {
    switch (finishedWork.tag) {
        case FunctionComponent:
        case ForwardRef:
        case MemoComponent:
        case SimpleMemoComponent:
        case Block: {
            // Layout effects are destroyed during the mutation phase so that all
            // destroy functions for all fibers are called before any create functions.
            // This prevents sibling component effects from interfering with each other,
            // e.g. a destroy function in one component should never override a ref set
            // by a create function in another component during the same commit.
            if (
                enableProfilerTimer &&
                enableProfilerCommitHooks &&
                finishedWork.mode & ProfileMode
            ) {
                try {
                    startLayoutEffectTimer();
                    commitHookEffectListUnmount(HookLayout | HookHasEffect, finishedWork);
                } finally {
                    recordLayoutEffectDuration(finishedWork);
                }
            } else {
                commitHookEffectListUnmount(HookLayout | HookHasEffect, finishedWork);
            }
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
                const updatePayload: null | UpdatePayload = (finishedWork.updateQueue: any);
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
            invariant(
                finishedWork.stateNode !== null,
                'This should have a text node initialized. This error is likely ' +
                'caused by a bug in React. Please file an issue.',
            );
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
                const root: FiberRoot = finishedWork.stateNode;
                if (root.hydrate) {
                    // We've just hydrated. No need to hydrate again.
                    root.hydrate = false;
                    commitHydratedContainer(root.containerInfo);
                }
            }
            return;
        }
        case Profiler: {
            return;
        }
        case SuspenseComponent: {
            commitSuspenseComponent(finishedWork);
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
        case FundamentalComponent: {
            if (enableFundamentalAPI) {
                const fundamentalInstance = finishedWork.stateNode;
                updateFundamentalComponent(fundamentalInstance);
                return;
            }
            break;
        }
        case ScopeComponent: {
            if (enableScopeAPI) {
                const scopeInstance = finishedWork.stateNode;
                prepareScopeUpdate(scopeInstance, finishedWork);
                return;
            }
            break;
        }
        case OffscreenComponent:
        case LegacyHiddenComponent: {
            const newState: OffscreenState | null = finishedWork.memoizedState;
            const isHidden = newState !== null;
            hideOrUnhideAllChildren(finishedWork, isHidden);
            return;
        }
    }
    invariant(
        false,
        'This unit of work tag should not have side-effects. This error is ' +
        'likely caused by a bug in React. Please file an issue.',
    );
}


function commitPlacement(finishedWork: Fiber): void {
    if (!supportsMutation) {
        return;
    }

    // Recursively insert all host nodes into the parent.
    // 找到其上层第一个 hostComponent/hostRoot/hostPortal
    // 看起来是在 dom 有实体代表的第一个节点的 fiber 节点
    const parentFiber = getHostParentFiber(finishedWork);

    // Note: these two variables *must* always be updated together.
    let parent;
    let isContainer;
    const parentStateNode = parentFiber.stateNode;
    switch (parentFiber.tag) {
        case HostComponent:
            parent = parentStateNode;
            isContainer = false;
            break;
        case HostRoot:
            parent = parentStateNode.containerInfo;
            isContainer = true;
            break;
        case HostPortal:
            parent = parentStateNode.containerInfo;
            isContainer = true;
            break;
        case FundamentalComponent:
            if (enableFundamentalAPI) {
                parent = parentStateNode.instance;
                isContainer = false;
            }
        // eslint-disable-next-line-no-fallthrough
        default:
            invariant(
                false,
                'Invalid host parent fiber. This error is likely caused by a bug ' +
                'in React. Please file an issue.',
            );
    }
    if (parentFiber.flags & ContentReset) {
        // Reset the text content of the parent before doing any insertions
        resetTextContent(parent);
        // Clear ContentReset from the effect tag
        parentFiber.flags &= ~ContentReset;
    }

    const before = getHostSibling(finishedWork);
    // We only have the top Fiber that was inserted but we need to recurse down its
    // children to find all the terminal nodes.
    if (isContainer) {
        insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
    } else {
        insertOrAppendPlacementNode(finishedWork, before, parent);
    }
}

function commitLayoutEffects(root: FiberRoot, committedLanes: Lanes) {
    if (__DEV__) {
        if (enableDebugTracing) {
            logLayoutEffectsStarted(committedLanes);
        }
    }

    if (enableSchedulingProfiler) {
        markLayoutEffectsStarted(committedLanes);
    }

    // TODO: Should probably move the bulk of this function to commitWork.
    while (nextEffect !== null) {
        setCurrentDebugFiberInDEV(nextEffect);

        const flags = nextEffect.flags;

        if (flags & (Update | Callback)) {
            const current = nextEffect.alternate;
            commitLayoutEffectOnFiber(root, current, nextEffect, committedLanes);
        }

        if (enableScopeAPI) {
            // TODO: This is a temporary solution that allowed us to transition away
            // from React Flare on www.
            if (flags & Ref && nextEffect.tag !== ScopeComponent) {
                commitAttachRef(nextEffect);
            }
        } else {
            if (flags & Ref) {
                commitAttachRef(nextEffect);
            }
        }

        resetCurrentDebugFiberInDEV();
        nextEffect = nextEffect.nextEffect;
    }

    if (__DEV__) {
        if (enableDebugTracing) {
            logLayoutEffectsStopped();
        }
    }

    if (enableSchedulingProfiler) {
        markLayoutEffectsStopped();
    }
}

function commitLifeCycles(
    finishedRoot: FiberRoot,
    current: Fiber | null,
    finishedWork: Fiber,
    committedLanes: Lanes,
): void {
    switch (finishedWork.tag) {
        case FunctionComponent:
        case ForwardRef:
        case SimpleMemoComponent:
        case Block: {
            // At this point layout effects have already been destroyed (during mutation phase).
            // This is done to prevent sibling component effects from interfering with each other,
            // e.g. a destroy function in one component should never override a ref set
            // by a create function in another component during the same commit.
            if (
                enableProfilerTimer &&
                enableProfilerCommitHooks &&
                finishedWork.mode & ProfileMode
            ) {
                try {
                    startLayoutEffectTimer();
                    commitHookEffectListMount(HookLayout | HookHasEffect, finishedWork);
                } finally {
                    recordLayoutEffectDuration(finishedWork);
                }
            } else {
                commitHookEffectListMount(HookLayout | HookHasEffect, finishedWork);
            }

            schedulePassiveEffects(finishedWork);
            return;
        }
        case ClassComponent: {
            const instance = finishedWork.stateNode;
            if (finishedWork.flags & Update) {
                if (current === null) {
                    // We could update instance props and state here,
                    // but instead we rely on them being set during last render.
                    // TODO: revisit this when we implement resuming.
                    if (__DEV__) {
                        if (
                            finishedWork.type === finishedWork.elementType &&
                            !didWarnAboutReassigningProps
                        ) {
                            if (instance.props !== finishedWork.memoizedProps) {
                                console.error(
                                    'Expected %s props to match memoized props before ' +
                                    'componentDidMount. ' +
                                    'This might either be because of a bug in React, or because ' +
                                    'a component reassigns its own `this.props`. ' +
                                    'Please file an issue.',
                                    getComponentName(finishedWork.type) || 'instance',
                                );
                            }
                            if (instance.state !== finishedWork.memoizedState) {
                                console.error(
                                    'Expected %s state to match memoized state before ' +
                                    'componentDidMount. ' +
                                    'This might either be because of a bug in React, or because ' +
                                    'a component reassigns its own `this.state`. ' +
                                    'Please file an issue.',
                                    getComponentName(finishedWork.type) || 'instance',
                                );
                            }
                        }
                    }
                    if (
                        enableProfilerTimer &&
                        enableProfilerCommitHooks &&
                        finishedWork.mode & ProfileMode
                    ) {
                        try {
                            startLayoutEffectTimer();
                            instance.componentDidMount();
                        } finally {
                            recordLayoutEffectDuration(finishedWork);
                        }
                    } else {
                        instance.componentDidMount();
                    }
                } else {
                    const prevProps =
                        finishedWork.elementType === finishedWork.type
                            ? current.memoizedProps
                            : resolveDefaultProps(finishedWork.type, current.memoizedProps);
                    const prevState = current.memoizedState;
                    // We could update instance props and state here,
                    // but instead we rely on them being set during last render.
                    // TODO: revisit this when we implement resuming.
                    if (__DEV__) {
                        if (
                            finishedWork.type === finishedWork.elementType &&
                            !didWarnAboutReassigningProps
                        ) {
                            if (instance.props !== finishedWork.memoizedProps) {
                                console.error(
                                    'Expected %s props to match memoized props before ' +
                                    'componentDidUpdate. ' +
                                    'This might either be because of a bug in React, or because ' +
                                    'a component reassigns its own `this.props`. ' +
                                    'Please file an issue.',
                                    getComponentName(finishedWork.type) || 'instance',
                                );
                            }
                            if (instance.state !== finishedWork.memoizedState) {
                                console.error(
                                    'Expected %s state to match memoized state before ' +
                                    'componentDidUpdate. ' +
                                    'This might either be because of a bug in React, or because ' +
                                    'a component reassigns its own `this.state`. ' +
                                    'Please file an issue.',
                                    getComponentName(finishedWork.type) || 'instance',
                                );
                            }
                        }
                    }
                    if (
                        enableProfilerTimer &&
                        enableProfilerCommitHooks &&
                        finishedWork.mode & ProfileMode
                    ) {
                        try {
                            startLayoutEffectTimer();
                            instance.componentDidUpdate(
                                prevProps,
                                prevState,
                                instance.__reactInternalSnapshotBeforeUpdate,
                            );
                        } finally {
                            recordLayoutEffectDuration(finishedWork);
                        }
                    } else {
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
                > | null = (finishedWork.updateQueue: any);
            if (updateQueue !== null) {
                if (__DEV__) {
                    if (
                        finishedWork.type === finishedWork.elementType &&
                        !didWarnAboutReassigningProps
                    ) {
                        if (instance.props !== finishedWork.memoizedProps) {
                            console.error(
                                'Expected %s props to match memoized props before ' +
                                'processing the update queue. ' +
                                'This might either be because of a bug in React, or because ' +
                                'a component reassigns its own `this.props`. ' +
                                'Please file an issue.',
                                getComponentName(finishedWork.type) || 'instance',
                            );
                        }
                        if (instance.state !== finishedWork.memoizedState) {
                            console.error(
                                'Expected %s state to match memoized state before ' +
                                'processing the update queue. ' +
                                'This might either be because of a bug in React, or because ' +
                                'a component reassigns its own `this.state`. ' +
                                'Please file an issue.',
                                getComponentName(finishedWork.type) || 'instance',
                            );
                        }
                    }
                }
                // We could update instance props and state here,
                // but instead we rely on them being set during last render.
                // TODO: revisit this when we implement resuming.
                commitUpdateQueue(finishedWork, updateQueue, instance);
            }
            return;
        }
        case HostRoot: {
            // TODO: I think this is now always non-null by the time it reaches the
            // commit phase. Consider removing the type check.
            const updateQueue: UpdateQueue<
                *,
                > | null = (finishedWork.updateQueue: any);
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
            return;
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

            return;
        }
        case HostText: {
            // We have no life-cycles associated with text.
            return;
        }
        case HostPortal: {
            // We have no life-cycles associated with portals.
            return;
        }
        case Profiler: {
            if (enableProfilerTimer) {
                const { onCommit, onRender } = finishedWork.memoizedProps;
                const { effectDuration } = finishedWork.stateNode;

                const commitTime = getCommitTime();

                if (typeof onRender === 'function') {
                    if (enableSchedulerTracing) {
                        onRender(
                            finishedWork.memoizedProps.id,
                            current === null ? 'mount' : 'update',
                            finishedWork.actualDuration,
                            finishedWork.treeBaseDuration,
                            finishedWork.actualStartTime,
                            commitTime,
                            finishedRoot.memoizedInteractions,
                        );
                    } else {
                        onRender(
                            finishedWork.memoizedProps.id,
                            current === null ? 'mount' : 'update',
                            finishedWork.actualDuration,
                            finishedWork.treeBaseDuration,
                            finishedWork.actualStartTime,
                            commitTime,
                        );
                    }
                }

                if (enableProfilerCommitHooks) {
                    if (typeof onCommit === 'function') {
                        if (enableSchedulerTracing) {
                            onCommit(
                                finishedWork.memoizedProps.id,
                                current === null ? 'mount' : 'update',
                                effectDuration,
                                commitTime,
                                finishedRoot.memoizedInteractions,
                            );
                        } else {
                            onCommit(
                                finishedWork.memoizedProps.id,
                                current === null ? 'mount' : 'update',
                                effectDuration,
                                commitTime,
                            );
                        }
                    }

                    // Schedule a passive effect for this Profiler to call onPostCommit hooks.
                    // This effect should be scheduled even if there is no onPostCommit callback for this Profiler,
                    // because the effect is also where times bubble to parent Profilers.
                    enqueuePendingPassiveProfilerEffect(finishedWork);

                    // Propagate layout effect durations to the next nearest Profiler ancestor.
                    // Do not reset these values until the next render so DevTools has a chance to read them first.
                    let parentFiber = finishedWork.return;
                    while (parentFiber !== null) {
                        if (parentFiber.tag === Profiler) {
                            const parentStateNode = parentFiber.stateNode;
                            parentStateNode.effectDuration += effectDuration;
                            break;
                        }
                        parentFiber = parentFiber.return;
                    }
                }
            }
            return;
        }
        case SuspenseComponent: {
            commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
            return;
        }
        case SuspenseListComponent:
        case IncompleteClassComponent:
        case FundamentalComponent:
        case ScopeComponent:
        case OffscreenComponent:
        case LegacyHiddenComponent:
            return;
    }
    invariant(
        false,
        'This unit of work tag should not have side-effects. This error is ' +
        'likely caused by a bug in React. Please file an issue.',
    );
}

function updateFunctionComponent(
    current,
    workInProgress,
    Component,
    nextProps: any,
    renderLanes,
) {
    if (__DEV__) {
        if (workInProgress.type !== workInProgress.elementType) {
            // Lazy component props can't be validated in createElement
            // because they're only guaranteed to be resolved here.
            const innerPropTypes = Component.propTypes;
            if (innerPropTypes) {
                checkPropTypes(
                    innerPropTypes,
                    nextProps, // Resolved props
                    'prop',
                    getComponentName(Component),
                );
            }
        }
    }

    let context;
    if (!disableLegacyContext) {
        const unmaskedContext = getUnmaskedContext(workInProgress, Component, true);
        context = getMaskedContext(workInProgress, unmaskedContext);
    }

    let nextChildren;
    prepareToReadContext(workInProgress, renderLanes);
    if (__DEV__) {
        ReactCurrentOwner.current = workInProgress;
        setIsRendering(true);
        nextChildren = renderWithHooks(
            current,
            workInProgress,
            Component,
            nextProps,
            context,
            renderLanes,
        );
        if (
            debugRenderPhaseSideEffectsForStrictMode &&
            workInProgress.mode & StrictMode
        ) {
            disableLogs();
            try {
                nextChildren = renderWithHooks(
                    current,
                    workInProgress,
                    Component,
                    nextProps,
                    context,
                    renderLanes,
                );
            } finally {
                reenableLogs();
            }
        }
        setIsRendering(false);
    } else {
        nextChildren = renderWithHooks(
            current,
            workInProgress,
            Component,
            nextProps,
            context,
            renderLanes,
        );
    }

    if (current !== null && !didReceiveUpdate) {
        bailoutHooks(current, workInProgress, renderLanes);
        return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
    }

    // React DevTools reads this flag.
    workInProgress.flags |= PerformedWork;
    reconcileChildren(current, workInProgress, nextChildren, renderLanes);
    return workInProgress.child;
}

function renderWithHooks<Props, SecondArg>(
    current: Fiber | null,
    workInProgress: Fiber,
    Component: (p: Props, arg: SecondArg) => any,
    props: Props,
    secondArg: SecondArg,
    nextRenderLanes: Lanes,
  ): any {
    renderLanes = nextRenderLanes;
    currentlyRenderingFiber = workInProgress;
  
    if (__DEV__) {
      hookTypesDev =
        current !== null
          ? ((current._debugHookTypes: any): Array<HookType>)
          : null;
      hookTypesUpdateIndexDev = -1;
      // Used for hot reloading:
      ignorePreviousDependencies =
        current !== null && current.type !== workInProgress.type;
    }
  
    workInProgress.memoizedState = null;
    workInProgress.updateQueue = null;
    workInProgress.lanes = NoLanes;
  
    // The following should have already been reset
    // currentHook = null;
    // workInProgressHook = null;
  
    // didScheduleRenderPhaseUpdate = false;
  
    // TODO Warn if no hooks are used at all during mount, then some are used during update.
    // Currently we will identify the update render as a mount because memoizedState === null.
    // This is tricky because it's valid for certain types of components (e.g. React.lazy)
  
    // Using memoizedState to differentiate between mount/update only works if at least one stateful hook is used.
    // Non-stateful hooks (e.g. context) don't get added to memoizedState,
    // so memoizedState would be null during updates and mounts.
    if (__DEV__) {
      if (current !== null && current.memoizedState !== null) {
        ReactCurrentDispatcher.current = HooksDispatcherOnUpdateInDEV;
      } else if (hookTypesDev !== null) {
        // This dispatcher handles an edge case where a component is updating,
        // but no stateful hooks have been used.
        // We want to match the production code behavior (which will use HooksDispatcherOnMount),
        // but with the extra DEV validation to ensure hooks ordering hasn't changed.
        // This dispatcher does that.
        ReactCurrentDispatcher.current = HooksDispatcherOnMountWithHookTypesInDEV;
      } else {
        ReactCurrentDispatcher.current = HooksDispatcherOnMountInDEV;
      }
    } else {
      ReactCurrentDispatcher.current =
        current === null || current.memoizedState === null
          ? HooksDispatcherOnMount
          : HooksDispatcherOnUpdate;
    }
  
    let children = Component(props, secondArg);
  
    // Check if there was a render phase update
    if (didScheduleRenderPhaseUpdateDuringThisPass) {
      // Keep rendering in a loop for as long as render phase updates continue to
      // be scheduled. Use a counter to prevent infinite loops.
      let numberOfReRenders: number = 0;
      do {
        didScheduleRenderPhaseUpdateDuringThisPass = false;
        invariant(
          numberOfReRenders < RE_RENDER_LIMIT,
          'Too many re-renders. React limits the number of renders to prevent ' +
            'an infinite loop.',
        );
  
        numberOfReRenders += 1;
        if (__DEV__) {
          // Even when hot reloading, allow dependencies to stabilize
          // after first render to prevent infinite render phase updates.
          ignorePreviousDependencies = false;
        }
  
        // Start over from the beginning of the list
        currentHook = null;
        workInProgressHook = null;
  
        workInProgress.updateQueue = null;
  
        if (__DEV__) {
          // Also validate hook order for cascading updates.
          hookTypesUpdateIndexDev = -1;
        }
  
        ReactCurrentDispatcher.current = __DEV__
          ? HooksDispatcherOnRerenderInDEV
          : HooksDispatcherOnRerender;
  
        children = Component(props, secondArg);
      } while (didScheduleRenderPhaseUpdateDuringThisPass);
    }
  
    // We can assume the previous dispatcher is always this one, since we set it
    // at the beginning of the render phase and there's no re-entrancy.
    ReactCurrentDispatcher.current = ContextOnlyDispatcher;
  
    if (__DEV__) {
      workInProgress._debugHookTypes = hookTypesDev;
    }
  
    // This check uses currentHook so that it works the same in DEV and prod bundles.
    // hookTypesDev could catch more cases (e.g. context) but only in DEV bundles.
    const didRenderTooFewHooks =
      currentHook !== null && currentHook.next !== null;
  
    renderLanes = NoLanes;
    currentlyRenderingFiber = (null: any);
  
    currentHook = null;
    workInProgressHook = null;
  
    if (__DEV__) {
      currentHookNameInDev = null;
      hookTypesDev = null;
      hookTypesUpdateIndexDev = -1;
    }
  
    didScheduleRenderPhaseUpdate = false;
  
    invariant(
      !didRenderTooFewHooks,
      'Rendered fewer hooks than expected. This may be caused by an accidental ' +
        'early return statement.',
    );
  
    return children;
  }
  

  function dispatchAction<S, A>(
    fiber: Fiber,
    queue: UpdateQueue<S, A>,
    action: A,
  ) {
    if (__DEV__) {
      if (typeof arguments[3] === 'function') {
        console.error(
          "State updates from the useState() and useReducer() Hooks don't support the " +
            'second callback argument. To execute a side effect after ' +
            'rendering, declare it in the component body with useEffect().',
        );
      }
    }
  
    const eventTime = requestEventTime();
    const lane = requestUpdateLane(fiber);
  
    const update: Update<S, A> = {
      lane,
      action,
      eagerReducer: null,
      eagerState: null,
      next: (null: any),
    };
  
    // Append the update to the end of the list.
    const pending = queue.pending;
    if (pending === null) {
      // This is the first update. Create a circular list.
      update.next = update;
    } else {
      update.next = pending.next;
      pending.next = update;
    }
    queue.pending = update;
  
    const alternate = fiber.alternate;
    if (
      fiber === currentlyRenderingFiber ||
      (alternate !== null && alternate === currentlyRenderingFiber)
    ) {
      // This is a render phase update. Stash it in a lazily-created map of
      // queue -> linked list of updates. After this render pass, we'll restart
      // and apply the stashed updates on top of the work-in-progress hook.
      didScheduleRenderPhaseUpdateDuringThisPass = didScheduleRenderPhaseUpdate = true;
    } else {
      if (
        fiber.lanes === NoLanes &&
        (alternate === null || alternate.lanes === NoLanes)
      ) {
        // The queue is currently empty, which means we can eagerly compute the
        // next state before entering the render phase. If the new state is the
        // same as the current state, we may be able to bail out entirely.
        const lastRenderedReducer = queue.lastRenderedReducer;
        if (lastRenderedReducer !== null) {
          let prevDispatcher;
          if (__DEV__) {
            prevDispatcher = ReactCurrentDispatcher.current;
            ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnUpdateInDEV;
          }
          try {
            const currentState: S = (queue.lastRenderedState: any);
            const eagerState = lastRenderedReducer(currentState, action);
            // Stash the eagerly computed state, and the reducer used to compute
            // it, on the update object. If the reducer hasn't changed by the
            // time we enter the render phase, then the eager state can be used
            // without calling the reducer again.
            update.eagerReducer = lastRenderedReducer;
            update.eagerState = eagerState;
            if (is(eagerState, currentState)) {
              // Fast path. We can bail out without scheduling React to re-render.
              // It's still possible that we'll need to rebase this update later,
              // if the component re-renders for a different reason and by that
              // time the reducer has changed.
              return;
            }
          } catch (error) {
            // Suppress the error. It will throw again in the render phase.
          } finally {
            if (__DEV__) {
              ReactCurrentDispatcher.current = prevDispatcher;
            }
          }
        }
      }
      if (__DEV__) {
        // $FlowExpectedError - jest isn't a global, and isn't recognized outside of tests
        if ('undefined' !== typeof jest) {
          warnIfNotScopedWithMatchingAct(fiber);
          warnIfNotCurrentlyActingUpdatesInDev(fiber);
        }
      }
      scheduleUpdateOnFiber(fiber, lane, eventTime);
    }
  
    if (__DEV__) {
      if (enableDebugTracing) {
        if (fiber.mode & DebugTracingMode) {
          const name = getComponentName(fiber.type) || 'Unknown';
          logStateUpdateScheduled(name, lane, action);
        }
      }
    }
  
    if (enableSchedulingProfiler) {
      markStateUpdateScheduled(fiber, lane);
    }
  }