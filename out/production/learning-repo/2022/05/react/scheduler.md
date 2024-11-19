## Scheduler

这里把 Scheduler 包内容单独拎出来先说一下，因为内容比较独立，而且也不多，所以简单先介绍一下。    

<!-- TOC -->

- [Scheduler](#scheduler)
  - [几个优先级](#几个优先级)
  - [其他内容](#其他内容)
  - [unstable_scheduleCallback](#unstable_schedulecallback)
  - [requestHostCallback](#requesthostcallback)
  - [performWorkUntilDeadline](#performworkuntildeadline)
  - [flushWork](#flushwork)
  - [runWithPriority, wrapCallback, next](#runwithpriority-wrapcallback-next)
  - [timer, timeout](#timer-timeout)
  - [总结](#总结)

<!-- /TOC -->


![scheduler](https://cdn.jsdelivr.net/gh/temple-deng/learning-repo/imgs/react-scheduler.png)

### 几个优先级

包里定义了几个优先级：   

```ts
export type PriorityLevel = 0 | 1 | 2 | 3 | 4 | 5;

export const NoPriority = 0;
export const ImmediatePriority = 1;
export const UserBlockingPriority = 2;
export const NormalPriority = 3;
export const LowPriority = 4;
export const IdlePriority = 5;
```

### 其他内容

首先一个常见的函数 getCurrentTime:   

```ts
const getCurrentTime = window.performance.now();
```    

即一个时间戳，同时变量以 `unstable_now` 的名称向外输出。   

全局的一些变量有：   

```ts
var taskQueue = [];
var timerQueue = [];

var taskIdCounter = 1;
var currentTask = null;
var currentPriorityLevel = NormalPriority;

var isHostCallbackScheduled = false;
var isHostTimeoutScheduled = false;

let scheduledHostCallback = null;
let startTime = -1;
```    

### unstable_scheduleCallback    

```ts
function unstable_scheduleCallback(priorityLevel, callback, options) {
  var currentTime = getCurrentTime();

  var startTime;
  if (typeof options === 'object' && options !== null) {
    var delay = options.delay;
    if (typeof delay === 'number' && delay > 0) {
      startTime = currentTime + delay;
    } else {
      startTime = currentTime;
    }
  } else {
    startTime = currentTime;
  }

  var timeout;
  switch (priorityLevel) {
    case ImmediatePriority:
      timeout = IMMEDIATE_PRIORITY_TIMEOUT; // -1
      break;
    case UserBlockingPriority:
      timeout = USER_BLOCKING_PRIORITY_TIMEOUT;  // 250
      break;
    case IdlePriority:
      timeout = IDLE_PRIORITY_TIMEOUT;  // 2^30 - 1
      break;
    case LowPriority:
      timeout = LOW_PRIORITY_TIMEOUT;   // 100000
      break;
    case NormalPriority:
    default:
      timeout = NORMAL_PRIORITY_TIMEOUT;  // 5000
      break;
  }

  var expirationTime = startTime + timeout;

  var newTask = {
    id: taskIdCounter++,
    callback,
    priorityLevel,
    startTime,
    expirationTime,
    sortIndex: -1,
  };

  if (startTime > currentTime) {
    // This is a delayed task.
    newTask.sortIndex = startTime;
    push(timerQueue, newTask);
    // 猜想这里检查 taskQueue 应该是在执行 taskQueue 后会判断 timerQueue 的调度情况
    if (peek(taskQueue) === null && newTask === peek(timerQueue)) {
      // All tasks are delayed, and this is the task with the earliest delay.
      if (isHostTimeoutScheduled) {
        // Cancel an existing timeout.
        cancelHostTimeout();
      } else {
        isHostTimeoutScheduled = true;
      }
      // Schedule a timeout.
      requestHostTimeout(handleTimeout, startTime - currentTime);
    }
  } else {
    // 常规的非延时 task，以过期时间为堆键
    newTask.sortIndex = expirationTime;
    push(taskQueue, newTask);
    // Schedule a host callback, if needed. If we're already performing work,
    // wait until the next time we yield.
    if (!isHostCallbackScheduled && !isPerformingWork) {
      isHostCallbackScheduled = true;
      requestHostCallback(flushWork);
    }
  }

  return newTask;
}
```   


### requestHostCallback   

```tsx
function requestHostCallback(callback) {
  scheduledHostCallback = callback;
  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true;
    schedulePerformWorkUntilDeadline();
  }
}

function requestHostTimeout(callback, ms) {
  taskTimeoutID = localSetTimeout(() => {
    callback(getCurrentTime());
  }, ms);
}

const channel = new MessageChannel();
const port = channel.port2;
channel.port1.onmessage = performWorkUntilDeadline;
schedulePerformWorkUntilDeadline = () => {
    port.postMessage(null);
};
```   

从代码中能看到，requestHostCallback 的参数永远都是 `flushWork`，也因此在函数中可以每次直接放心的替换 scheduledHostCallback。   

### performWorkUntilDeadline

```ts
const performWorkUntilDeadline = () => {
  if (scheduledHostCallback !== null) {
    const currentTime = getCurrentTime();
    // Keep track of the start time so we can measure how long the main thread
    // has been blocked.
    startTime = currentTime;
    const hasTimeRemaining = true;

    // If a scheduler task throws, exit the current browser task so the
    // error can be observed.
    //
    // Intentionally not using a try-catch, since that makes some debugging
    // techniques harder. Instead, if `scheduledHostCallback` errors, then
    // `hasMoreWork` will remain true, and we'll continue the work loop.
    let hasMoreWork = true;
    try {
      hasMoreWork = scheduledHostCallback(hasTimeRemaining, currentTime);
    } finally {
      if (hasMoreWork) {
        // If there's more work, schedule the next message event at the end
        // of the preceding one.
        schedulePerformWorkUntilDeadline();
      } else {
        isMessageLoopRunning = false;
        scheduledHostCallback = null;
      }
    }
  } else {
    isMessageLoopRunning = false;
  }
  // Yielding to the browser will give it a chance to paint, so we can
  // reset this.
  needsPaint = false;
};
```   

所以整个大致的流程是这样的，外部调用 `unstable_scheduleCallback`，这个函数注册一个 task 推入队列中，
然后如果没有在调度过程中的，通过 `requestHostCallback` 注册一个队列消费函数 `flushWork`，而 `requestHostCallback` 会注册一个异步执行的函数即 `performWorkUntilDeadline`，这个函数一般是通过 MessageChannel 异步执行，在这个函数中，会执行队列消费函数 `flushWork`，而 `flushWork` 的工作其实也相对简单，主要是调用了 `workLoop`，而 `workLoop` 即消费的队列的核心内容。   

### flushWork

```ts
function flushWork(hasTimeRemaining, initialTime) {
  // We'll need a host callback the next time work is scheduled.
  isHostCallbackScheduled = false;
  if (isHostTimeoutScheduled) {
    // We scheduled a timeout but it's no longer needed. Cancel it.
    isHostTimeoutScheduled = false;
    cancelHostTimeout();
  }

  isPerformingWork = true;
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
  while (currentTask !== null) {
    if (
      currentTask.expirationTime > currentTime &&
      (!hasTimeRemaining || shouldYieldToHost())
    ) {
      // This currentTask hasn't expired, and we've reached the deadline.
      // 虽然任务还没过期，但是这次的时间片用完了，先退出去
      // 等下次调度，但也同时说明一个问题，如果遇到了一个过期的任务，那么即便时间片用完
      // 这个任务至少要执行一下
      break;
    }
    const callback = currentTask.callback;
    if (typeof callback === 'function') {
      currentTask.callback = null;
      currentPriorityLevel = currentTask.priorityLevel;
      // 任务是否已经过期了
      const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;

      const continuationCallback = callback(didUserCallbackTimeout);
      currentTime = getCurrentTime();

      if (typeof continuationCallback === 'function') {
        // 这个任务没执行完就退出了，task 并不会从队中删除
        currentTask.callback = continuationCallback;
      } else {
        // 话说什么情况下会出现这种情况
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
```     

注意 `workLoop` 的参数其实是 `performWorkUntilDeadline` 传进去的。workLoop 的功能也很简单，在时间片用完前，不停的执行堆中的 task，直到时间片用完挥着堆为空。    

主要的内容基本就这些，本质上就是一个调度器。注册任务 -&gt; 在队列中加入新注册的任务 -&gt; 安排队列任务的执行 -&gt; 执行一个个任务 -&gt; 循环往复。    

额外的一些内容还有 timerQueue 的内容，以及一些以特定 priorityLevel 执行 cb 的功能，我们慢慢看一下。    


### runWithPriority, wrapCallback, next

```ts
// 以给定的 priorityLevel 执行 eventHandler
// 所以含义是什么，这个 priorityLevel 在执行 eventHandler
// 过程中是如何发生作用的呢
function unstable_runWithPriority(priorityLevel, eventHandler) {
  switch (priorityLevel) {
    case ImmediatePriority:
    case UserBlockingPriority:
    case NormalPriority:
    case LowPriority:
    case IdlePriority:
      break;
    default:
      priorityLevel = NormalPriority;
  }

  var previousPriorityLevel = currentPriorityLevel;
  currentPriorityLevel = priorityLevel;

  try {
    return eventHandler();
  } finally {
    currentPriorityLevel = previousPriorityLevel;
  }
}

// 以不超过 NormalPriority 的优先级执行 eventHandler
function unstable_next(eventHandler) {
  var priorityLevel;
  switch (currentPriorityLevel) {
    case ImmediatePriority:
    case UserBlockingPriority:
    case NormalPriority:
      // Shift down to normal priority
      priorityLevel = NormalPriority;
      break;
    default:
      // Anything lower than normal priority should remain at the current level.
      priorityLevel = currentPriorityLevel;
      break;
  }

  var previousPriorityLevel = currentPriorityLevel;
  currentPriorityLevel = priorityLevel;

  try {
    return eventHandler();
  } finally {
    currentPriorityLevel = previousPriorityLevel;
  }
}

// 以调用的时的优先级包装一个 cb 函数，然后在特定时间调用
function unstable_wrapCallback(callback) {
  var parentPriorityLevel = currentPriorityLevel;
  return function() {
    // This is a fork of runWithPriority, inlined for performance.
    var previousPriorityLevel = currentPriorityLevel;
    currentPriorityLevel = parentPriorityLevel;

    try {
      return callback.apply(this, arguments);
    } finally {
      currentPriorityLevel = previousPriorityLevel;
    }
  };
}
```   

这3个函数看起来主要的目的是以一个特定的优先级执行一个回调函数，但我们目前
不清楚的一点是，scheduler 包中的 currentPriorityLevel 如何影响回调函数的执行呢。    

### timer, timeout   

基本上内容都以注释给出了。   

```ts
// 这个函数其实功能很明显，就是从 timerQueue 中，找出那些到了执行时间的 task
// 然后从 timerQueue 取出，放入 taskQueue 中
function advanceTimers(currentTime) {
  // Check for tasks that are no longer delayed and add them to the queue.
  let timer = peek(timerQueue);
  while (timer !== null) {
    if (timer.callback === null) {
      // Timer was cancelled.
      pop(timerQueue);
    } else if (timer.startTime <= currentTime) {
      // Timer fired. Transfer to the task queue.
      pop(timerQueue);
      timer.sortIndex = timer.expirationTime;
      push(taskQueue, timer);
    } else {
      // Remaining timers are pending.
      return;
    }
    timer = peek(timerQueue);
  }
}

// 这一段是在 scheduleCallback 中的处理
if (startTime > currentTime) {
    // This is a delayed task.
    newTask.sortIndex = startTime;
    push(timerQueue, newTask);

    // 首先判断 newTask === peek(timerQueue) 很好理解，如果这个 task 是最紧急的
    // 那么这个 task 是要在之前设置的 timeout 之前执行的，所以必须重设定时器
    // 才能保证 task 在规定时间执行
    // 而判断 taskQueue 是不是 null 是因为，如果有 taskQueue，那么下个 event loop
    // 一定会执行 workLoop，在 workLoop 中每执行完一个 task 都会调用 advanceTimers
    // 调整 taskQueue，同时在执行完以后，还会看一下 timerQueue 的情况
    // 所以简单来说，如果 taskQueue 不为空，那么 workLoop 会处理好 requestHostTime 的情况，不用这里操心
    // 只有 taskQueue 空了，才需要这里处理
    if (peek(taskQueue) === null && newTask === peek(timerQueue)) {
      // All tasks are delayed, and this is the task with the earliest delay.
      if (isHostTimeoutScheduled) {
        // Cancel an existing timeout.
        cancelHostTimeout();
      } else {
        isHostTimeoutScheduled = true;
      }
      // Schedule a timeout.
      requestHostTimeout(handleTimeout, startTime - currentTime);
    }
}


function requestHostTimeout(callback, ms) {
  taskTimeoutID = localSetTimeout(() => {
    callback(getCurrentTime());
  }, ms);
}

function handleTimeout(currentTime) {
  isHostTimeoutScheduled = false;
  advanceTimers(currentTime);

  if (!isHostCallbackScheduled) {
    if (peek(taskQueue) !== null) {
      isHostCallbackScheduled = true;
      requestHostCallback(flushWork);
    } else {
      // 这里相当于是递归设置 timeout，即这次到时以后，将到期的 task 放入 taskQueue 了，但是 taskQueue 为空了
      // 那么如果 timerQueue 还有 task，要再继续设置 timeout，不让就得不到执行了
      const firstTimer = peek(timerQueue);
      if (firstTimer !== null) {
        requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
      }
    }
  }
}
```    


### 总结

总结一下，整个包基本上3部分内容：   

- task, taskQueue, scheduleCallback，调度队列
- runWithPriority, next, wrapCallback，优先级相关回调
- timerQueue, timeout，延时任务    

