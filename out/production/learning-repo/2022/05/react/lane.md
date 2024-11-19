## 关于 Lane, 关于 priority

<!-- TOC -->

- [关于 Lane, 关于 priority](#关于-lane-关于-priority)
  - [与 lane 相关的字段](#与-lane-相关的字段)
  - [首先看最早接触的 lane,update.lane](#首先看最早接触的-laneupdatelane)
  - [getNextLanes](#getnextlanes)
  - [scheduler priority](#scheduler-priority)
  - [lane](#lane)
  - [eventPriorities](#eventpriorities)
  - [暂时总结](#暂时总结)
- [pickArbitraryLaneIndex](#pickarbitrarylaneindex)

<!-- /TOC -->

这里从网上看到一段话：   

> 摘自 https://juejin.cn/post/6916790300853665800
> UI产生交互的根本原因是各种事件，这也就意味着事件与更新有着直接关系。不同事件产生的更新，它们的优先级是有差异的，所以更新优先级的根源在于事件的优先级。 一个更新的产生可直接导致React生成一个更新任务，最终这个任务被Scheduler调度。
> - 事件优先级：按照用户事件的交互紧急程度，划分的优先级
> - 更新优先级：事件导致React产生的更新对象（update）的优先级（update.lane）
> - 任务优先级：产生更新对象之后，React去执行一个更新任务，这个任务所持有的优先级
> - 调度优先级：Scheduler依据React更新任务生成一个调度任务，这个调度任务所持有的优先级
> React按照事件的紧急程度，把它们划分成三个等级：
> - 离散事件（DiscreteEvent）：click、keydown、focusin等，这些事件的触发不是连续的，优先级为0。
> - 用户阻塞事件（UserBlockingEvent）：drag、scroll、mouseover等，特点是连续触发，阻塞渲染，优先级为1。
> - 连续事件（ContinuousEvent）：canplay、error、audio标签的timeupdate和canplay，优先级最高，为2。
> 事件优先级、更新优先级、任务优先级、调度优先级，它们之间是递进的关系。事件优先级由事件本身决定，更新优先级由事件计算得出，然后放到root.pendingLanes，
任务优先级来自root.pendingLanes中最紧急的那些lanes对应的优先级，调度优先级根据任务优先级获取。几种优先级环环相扣，保证了高优任务的优先执行。   

### 与 lane 相关的字段

首先在 fiber 上有：   

- lanes
- childLanes

然后 fiber 的updateQueue 上有：  

- update.lane

然后还有 fiberRoot 上有很多：  

- pendingLanes
- suspendedLanes
- pingedLanes
- expiredLanes
- finishedLanes
- ...    

然后在 ReactFiberWorkLoop 文件中的类全局的几个相关变量：   

- `workInProgressRootRenderLanes`: 渲染 lanes
- `subtreeRenderLanes`: React 调用栈允许修改子树的 render lanes，大部分情况下与上面的相等，唯一例外的情况是将某个 hidden 的子树显示出来，即 Suspense 和 Offscreen 组件，大部分在 work loop 中需要处理的都是 `workInProgressRenderLanes`，但是大部分在 begin/complete 阶段的应该处理 `subtreeRenderLanes`
- `workInProgressRootIncludedLanes`
- `workInProgressRootSkippedLanes`: 本次渲染跳过的工作的 lanes
- `workInProgressRootRenderPhaseUpdatedLanes`: render 阶段更新了的 lanes
- `workInProgressRootPingedLanes`    


### 首先看最早接触的 lane,update.lane   

与 lane 相关的基本都在 ReactFiberLane 中。    

这里其实我们常见的 Lane 基本上就是 `SyncLane`, `DefaultLane`, `IdleLane`。   

话说怎么会就见过这几个。    

首先看 lane 的起源，应该都是从 update.lane 带出来的，而 update.lane 目前我看有两个地方，首先是对于 `RenderDOM.render` 调用时生成的 root 的更新，
最后是到了 `updateContainer` 函数：   

```tsx
const eventTime = requestEventTime();
const lane = requestUpdateLane(current);
const update = createUpdate(eventTime, lane);
```    

首先看下 requestEventTime 吧：   

```tsx
// If two updates are scheduled within the same event, we should treat their
// event times as simultaneous, even if the actual clock time has advanced
// between the first and second call.
let currentEventTime: number = NoTimestamp;

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
```    

从注释的意思能看出，根据所处 ctx 的不同，会返回不同的值：   

- 如果已经在 React 处理流程中了，返回实际时间
- 否则呢当前第一次进入 React 处理流程中的时间   

这样的话，就可以把一批待处理的更新，看成是同一个时刻触发的。    

然后是 requestUpdateLane:   

```tsx
export function requestUpdateLane(fiber: Fiber): Lane {
  // Special cases
  const mode = fiber.mode;
  if ((mode & ConcurrentMode) === NoMode) {
    // legacy 情况下，统一返回 SyncLane
    return (SyncLane as Lane);
  } else if (
    !deferRenderPhaseUpdateToNextBatch &&
    (executionContext & RenderContext) !== NoContext &&
    workInProgressRootRenderLanes !== NoLanes
  ) {
    // This is a render phase update. These are not officially supported. The
    // old behavior is to give this the same "thread" (lanes) as
    // whatever is currently rendering. So if you call `setState` on a component
    // that happens later in the same render, it will flush. Ideally, we want to
    // remove the special case and treat them as if they came from an
    // interleaved event. Regardless, this pattern is not officially supported.
    // This behavior is only a fallback. The flag only exists until we can roll
    // out the setState warning, since existing code might accidentally rely on
    // the current behavior.
    return pickArbitraryLane(workInProgressRootRenderLanes);
  }

  const isTransition = requestCurrentTransition() !== NoTransition;
  if (isTransition) {
    // The algorithm for assigning an update to a lane should be stable for all
    // updates at the same priority within the same event. To do this, the
    // inputs to the algorithm must be the same.
    //
    // The trick we use is to cache the first of each of these inputs within an
    // event. Then reset the cached values once we can be sure the event is
    // over. Our heuristic for that is whenever we enter a concurrent work loop.
    if (currentEventTransitionLane === NoLane) {
      // All transitions within the same event are assigned the same lane.
      currentEventTransitionLane = claimNextTransitionLane();
    }
    return currentEventTransitionLane;
  }

  // Updates originating inside certain React methods, like flushSync, have
  // their priority set by tracking it with a context variable.
  //
  // The opaque type returned by the host config is internally a lane, so we can
  // use that directly.
  // TODO: Move this type conversion to the event priority module.
  // 一般来说，大概率是走这，updatePriority 是 eventPriority 中的变量
  // 即 updateLane 是根据 eventPriority 取的，也就证明了更新优先级来源于事件优先级
  const updateLane: Lane = (getCurrentUpdatePriority(): any);
  if (updateLane !== NoLane) {
    return updateLane;
  }

  // This update originated outside React. Ask the host environment for an
  // appropriate priority, based on the type of event.
  //
  // The opaque type returned by the host config is internally a lane, so we can
  // use that directly.
  // TODO: Move this type conversion to the event priority module.
  const eventLane: Lane = (getCurrentEventPriority(): any);
  return eventLane;
}
```    

那所以我们 legacy 模式下，产生的 update.lane，都是 SyncLane，那感觉根本就不存在什么高低优先级什么的，
毕竟大家都是同一起跑线哦。   

产生了 update.lane 之后呢，就看这个 lane 如何传导给其他的地方，目前来看，唯一的路径还是传统的更新途径。    

还是以我们的初次更新为例。    

目前版本的初次更新变成了：   

```tsx
// Initial mount should not be batched.
flushSync(() => {
    updateContainer(initialChildren, root, parentComponent, callback);
});
```   

```tsx
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
    if ((executionContext & (RenderContext | CommitContext)) === NoContext) {
      flushSyncCallbacks();
    }
  }
}
```     

这里引入了一个新词 priority。然后 currentUpdatePriority 也可以理解为一个全局变量。以初次调用为例，就是 NoLane。   

`DiscreteEventPriority` 等于 `SyncLane`，所以这里设置了 currentUpdatePriority。   

最后这里进入了 `scheduleUpdateOnFiber`。     

然后首先在 `markUpdateLaneFromFiberToRoot` 中，更新了当前节点 lanes，和所有组件节点的 `childLanes`。    

之后紧接着的 `markRootUpdated`，将update.lane 又合入了 fiberRoot.pendingLanes，同时将 eventTime 赋值到了 fiberRoot.eventTimes 上对应的索引位置，但是这里将 fiberRoot.pingedLanes 和 suspendedLanes 重置了，没弄懂什么意思。   

### getNextLanes   

```tsx
// 应该是获取下次 work 的 renderLanes
// 相当于根据 fiberRoot 上的各种lane，以及目前渲染流程的 wipLanes
// 计算下次渲染的 lanes
export function getNextLanes(root: FiberRoot, wipLanes: Lanes): Lanes {
  // Early bailout if there's no pending work left.
  // 当前 root 上没有 lanes，那也就是目前没有要执行的更新吧，那就直接返回，可以直接取消这次调度了
  const pendingLanes = root.pendingLanes;
  if (pendingLanes === NoLanes) {
    return NoLanes;
  }

  let nextLanes = NoLanes;

  const suspendedLanes = root.suspendedLanes;
  const pingedLanes = root.pingedLanes;

  // Do not work on any idle work until all the non-idle work has finished,
  // even if the work is suspended.
  const nonIdlePendingLanes = pendingLanes & NonIdleLanes;

  // getHighestPriorityLanes 获取最右边的 1，即最高的优先级
  // 所以这里就是从 pendingLanes 中获取到最紧急的优先级

  // 如果有非 idle 的 pendingLane 优先级
  if (nonIdlePendingLanes !== NoLanes) {
    // 有非 idle 的 work
    // 准确来说是找到非 idle 非 suspend 的最高优先级
    const nonIdleUnblockedLanes = nonIdlePendingLanes & ~suspendedLanes;
    if (nonIdleUnblockedLanes !== NoLanes) {
      // 非 idle 的再刨除 suspend
      nextLanes = getHighestPriorityLanes(nonIdleUnblockedLanes);
    } else {
      // 只剩 suspend
      const nonIdlePingedLanes = nonIdlePendingLanes & pingedLanes;
      if (nonIdlePingedLanes !== NoLanes) {
        // 有 pingedLane
        nextLanes = getHighestPriorityLanes(nonIdlePingedLanes);
      }
    }
  } else {
    // The only remaining work is Idle.
    // 类似上面
    const unblockedLanes = pendingLanes & ~suspendedLanes;
    if (unblockedLanes !== NoLanes) {
      nextLanes = getHighestPriorityLanes(unblockedLanes);
    } else {
      if (pingedLanes !== NoLanes) {
        nextLanes = getHighestPriorityLanes(pingedLanes);
      }
    }
  }

  // 除了 idle 和 suspend 之外没有 lanes 了，也直接跳出
  if (nextLanes === NoLanes) {
    // This should only be reachable if we're suspended
    // TODO: Consider warning in this path if a fallback timer is not scheduled.
    return NoLanes;
  }

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
    const nextLane = getHighestPriorityLane(nextLanes);
    const wipLane = getHighestPriorityLane(wipLanes);
    if (
      // Tests whether the next lane is equal or lower priority than the wip
      // one. This works because the bits decrease in priority as you go left.
      // 下个 work 的优先级低于当前 work 的优先级
      nextLane >= wipLane ||
      // Default priority updates should not interrupt transition updates. The
      // only difference between default updates and transition updates is that
      // default updates do not support refresh transitions.
      // 这个条件看不懂
      (nextLane === DefaultLane && (wipLane & TransitionLanes) !== NoLanes)
    ) {
      // Keep working on the existing in-progress tree. Do not interrupt.
      return wipLanes;
    }
  }

  if (
    allowConcurrentByDefault &&
    (root.current.mode & ConcurrentUpdatesByDefaultMode) !== NoMode
  ) {
    // Do nothing, use the lanes as they were assigned.
  } else if ((nextLanes & InputContinuousLane) !== NoLanes) {
    // When updates are sync by default, we entangle continuous priority updates
    // and default updates, so they render in the same batch. The only reason
    // they use separate lanes is because continuous updates should interrupt
    // transitions, but default updates should not.
    nextLanes |= pendingLanes & DefaultLane;
  }

  return nextLanes;
}
```    

这个函数就像名字那样，是用来得出下次 work 的优先级，首先找出下次 work 最紧急的 work，然后和
当前 work 的优先级比较，返回两个 works 中较紧急的 works 优先级。

### scheduler priority

scheduler 包定义了以下的的 priority:   

```tsx
export type PriorityLevel = 0 | 1 | 2 | 3 | 4 | 5;

// TODO: Use symbols?
export const NoPriority = 0;
export const ImmediatePriority = 1;
export const UserBlockingPriority = 2;
export const NormalPriority = 3;
export const LowPriority = 4;
export const IdlePriority = 5;
```     

在调用 `scheduleCallback` 就需要传入一个这样的 priorityLevel，这个值就是创建的 task 的 priorityLevel，决定了 task 的过期时间的长短，
同时在 scheduler 包中还有一个局部变量 `currentPriorityLevel`，
在执行 task 的时候，会将 `currentPriorityLevel` 赋值为 task.priorityLevel，也就说这是一个 task 的优先级，也是一个调度的优先级吧。   

同时 scheduler 包中还有一个 `runWithPriority` 函数，会将 `currentPriorityLevel` 设置为传入的 `priorityLevel`，然后执行传入的回调，相当于以特定的调度/task优先级执行回调，但是具体优先级是如何作用的，其实都是在 task/回调执行的过程中。这个具体还不清楚有什么作用。    

### lane   

在 ReactFiberLane 中定义了这些 Lane。   

```tsx
export const NoLanes: Lanes = /*                        */ 0b0000000000000000000000000000000;
export const NoLane: Lane = /*                          */ 0b0000000000000000000000000000000;

export const SyncLane: Lane = /*                        */ 0b0000000000000000000000000000001;

export const InputContinuousHydrationLane: Lane = /*    */ 0b0000000000000000000000000000010;
export const InputContinuousLane: Lanes = /*            */ 0b0000000000000000000000000000100;

export const DefaultHydrationLane: Lane = /*            */ 0b0000000000000000000000000001000;
export const DefaultLane: Lanes = /*                    */ 0b0000000000000000000000000010000;

const TransitionHydrationLane: Lane = /*                */ 0b0000000000000000000000000100000;
const TransitionLanes: Lanes = /*                       */ 0b0000000001111111111111111000000;
const TransitionLane1: Lane = /*                        */ 0b0000000000000000000000001000000;
const TransitionLane2: Lane = /*                        */ 0b0000000000000000000000010000000;
const TransitionLane3: Lane = /*                        */ 0b0000000000000000000000100000000;
const TransitionLane4: Lane = /*                        */ 0b0000000000000000000001000000000;
const TransitionLane5: Lane = /*                        */ 0b0000000000000000000010000000000;
const TransitionLane6: Lane = /*                        */ 0b0000000000000000000100000000000;
const TransitionLane7: Lane = /*                        */ 0b0000000000000000001000000000000;
const TransitionLane8: Lane = /*                        */ 0b0000000000000000010000000000000;
const TransitionLane9: Lane = /*                        */ 0b0000000000000000100000000000000;
const TransitionLane10: Lane = /*                       */ 0b0000000000000001000000000000000;
const TransitionLane11: Lane = /*                       */ 0b0000000000000010000000000000000;
const TransitionLane12: Lane = /*                       */ 0b0000000000000100000000000000000;
const TransitionLane13: Lane = /*                       */ 0b0000000000001000000000000000000;
const TransitionLane14: Lane = /*                       */ 0b0000000000010000000000000000000;
const TransitionLane15: Lane = /*                       */ 0b0000000000100000000000000000000;
const TransitionLane16: Lane = /*                       */ 0b0000000001000000000000000000000;

const RetryLanes: Lanes = /*                            */ 0b0000111110000000000000000000000;
const RetryLane1: Lane = /*                             */ 0b0000000010000000000000000000000;
const RetryLane2: Lane = /*                             */ 0b0000000100000000000000000000000;
const RetryLane3: Lane = /*                             */ 0b0000001000000000000000000000000;
const RetryLane4: Lane = /*                             */ 0b0000010000000000000000000000000;
const RetryLane5: Lane = /*                             */ 0b0000100000000000000000000000000;

export const SomeRetryLane: Lane = RetryLane1;

export const SelectiveHydrationLane: Lane = /*          */ 0b0001000000000000000000000000000;

const NonIdleLanes = /*                                 */ 0b0001111111111111111111111111111;

export const IdleHydrationLane: Lane = /*               */ 0b0010000000000000000000000000000;
export const IdleLane: Lanes = /*                       */ 0b0100000000000000000000000000000;

export const OffscreenLane: Lane = /*                   */ 0b1000000000000000000000000000000;
```     

这些 lane 一般都在 update.lane，wip 上出现。    

仔细看其实也没出现几种 Lane:   

```tsx
export const SyncLane: Lane = /*                        */ 0b0000000000000000000000000000001;
export const InputContinuousLane: Lanes = /*            */ 0b0000000000000000000000000000100;
export const DefaultLane: Lanes = /*                    */ 0b0000000000000000000000000010000;
export const IdleLane: Lanes = /*                       */ 0b0100000000000000000000000000000;
export const OffscreenLane: Lane = /*                   */ 0b1000000000000000000000000000000;

const NonIdleLanes = /*                                 */ 0b0001111111111111111111111111111;
```    

和 scheduler 的 priorityLevel 差不多，主要的也就5种。


### eventPriorities    

除此之外，在 reconciler 中还有 eventPriority 定义在 ReactEventPriorities 文件中，不过 eventPriority 是和 lane 挂钩的：   

```tsx
export type EventPriority = Lane;
export const DiscreteEventPriority: EventPriority = SyncLane;
export const ContinuousEventPriority: EventPriority = InputContinuousLane;
export const DefaultEventPriority: EventPriority = DefaultLane;
export const IdleEventPriority: EventPriority = IdleLane;

let currentUpdatePriority: EventPriority = NoLane;
```   

### 暂时总结

所以我们这里先暂时总结一下：   

在 scheduler 中有调度优先级：    

```ts
export type PriorityLevel = 0 | 1 | 2 | 3 | 4 | 5;

export const NoPriority = 0;
export const ImmediatePriority = 1;
export const UserBlockingPriority = 2;
export const NormalPriority = 3;
export const LowPriority = 4;
export const IdlePriority = 5;

// 用变量 currentPriorityLevel 表示当前调度任务的优先级
```   

然后在 FiberLane 中有更新的优先级：    

```ts
export const NoLanes: Lanes = /*                        */ 0b0000000000000000000000000000000;
export const NoLane: Lane = /*                          */ 0b0000000000000000000000000000000;

export const SyncLane: Lane = /*                        */ 0b0000000000000000000000000000001;

export const InputContinuousLane: Lanes = /*            */ 0b0000000000000000000000000000100;

export const DefaultLane: Lanes = /*                    */ 0b0000000000000000000000000010000;

export const IdleLane: Lanes = /*                       */ 0b0100000000000000000000000000000;
```    

然后在 eventPriorities 中有 event priority:   

```ts
export const DiscreteEventPriority: EventPriority = SyncLane;
export const ContinuousEventPriority: EventPriority = InputContinuousLane;
export const DefaultEventPriority: EventPriority = DefaultLane;
export const IdleEventPriority: EventPriority = IdleLane;

let currentUpdatePriority: EventPriority = NoLane;
```    

## pickArbitraryLaneIndex

```ts
function pickArbitraryLaneIndex(lanes: Lanes) {
  return 31 - Math.clz32(lanes);
}
```    

`Math.clz32` 是找出一个32位的二进制表示数的前导0的数量。    

而如果是 `32 - Math.clz32(lanes)` 相当于从第一个 1 开始到末尾一共几个数字，而再减1，相当于第一个 1 右面有多少位，同时也可以认为，假设最右边的位索引是 0，这个函数就可以
求出第一个 1 的索引。   