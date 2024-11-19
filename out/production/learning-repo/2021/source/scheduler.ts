import {
    NoPriority,
    NormalPriority,
    ImmediatePriority,
    UserBlockingPriority,
    LowPriority,
    IdlePriority
} from './const';

export let requestHostCallback;
export let cancelHostCallback;
export let requestHostTimeout;
export let cancelHostTimeout;
export let shouldYieldToHost;
export let requestPaint;
export let getCurrentTime;
export let forceFrameRate;

const hasPerformanceNow =
    typeof performance === 'object' && typeof performance.now === 'function';

if (hasPerformanceNow) {
    const localPerformance = performance;
    getCurrentTime = () => localPerformance.now();
} else {
    const localDate = Date;
    const initialTime = localDate.now();
    getCurrentTime = () => localDate.now() - initialTime;
}

let isMessageLoopRunning = false;
let scheduledHostCallback = null;
let taskTimeoutID = -1;

let yieldInterval = 5;
let deadline = 0;

const maxYieldInterval = 300;
let needsPaint = false;

// 这要是 deadline 不变的话，那每次调用都返回 true 吧
// deadline 只在 performWorkUntilDeadline 中赋值一下
// 那大概率就是检查这次的 performWorkUntilDeadline 是否在 5ms 内
// 但是在 performWorkUntilDeadline 中并没有使用
// shouldYieldToHost，那估计是在 scheduledHostCallback 中判断了
// 如果超时了，且没完成全部，就返回 hasMoreWork，等下次调度
shouldYieldToHost = function() {
    return getCurrentTime() >= deadline;
};

const performWorkUntilDeadline = () => {
    if (scheduledHostCallback !== null) {
        const currentTime = getCurrentTime();
        // Yield after `yieldInterval` ms, regardless of where we are in the vsync
        // cycle. This means there's always time remaining at the beginning of
        // the message event.
        deadline = currentTime + yieldInterval;
        const hasTimeRemaining = true;
        try {
            const hasMoreWork = scheduledHostCallback(
                hasTimeRemaining,
                currentTime,
            );
            if (!hasMoreWork) {
                isMessageLoopRunning = false;
                scheduledHostCallback = null;
            } else {
                // If there's more work, schedule the next message event at the end
                // of the preceding one.
                port.postMessage(null);
            }
        } catch (error) {
            // If a scheduler task throws, exit the current browser task so the
            // error can be observed.
            port.postMessage(null);
            throw error;
        }
    } else {
        isMessageLoopRunning = false;
    }
    // Yielding to the browser will give it a chance to paint, so we can
    // reset this.
    needsPaint = false;
};

const channel = new MessageChannel();
const port = channel.port2;
channel.port1.onmessage = performWorkUntilDeadline;

// 想要调度器工作，就必须通过这个函数设置
requestHostCallback = function(callback) {
    // 话说这样的操作，不会导致 schedulaerHostCallback 的赋值被覆盖吗
    scheduledHostCallback = callback;
    if (!isMessageLoopRunning) {
        isMessageLoopRunning = true;
        port.postMessage(null);
    }
};

cancelHostCallback = function() {
scheduledHostCallback = null;
};

var taskQueue = [];
var timerQueue = [];
var taskIdCounter = 1;
var currentTask = null;

// 目前没发现这个变量有什么作用
var currentPriorityLevel = NormalPriority;

var isPerformingWork = false;

var isHostCallbackScheduled = false;
var isHostTimeoutScheduled = false;

var maxSigned31BitInt = 1073741823;

// Times out immediately
var IMMEDIATE_PRIORITY_TIMEOUT = -1;
// Eventually times out
var USER_BLOCKING_PRIORITY_TIMEOUT = 250;
var NORMAL_PRIORITY_TIMEOUT = 5000;
var LOW_PRIORITY_TIMEOUT = 10000;
// Never times out
var IDLE_PRIORITY_TIMEOUT = maxSigned31BitInt;


function unstable_scheduleCallback(priorityLevel, callback, options) {
    var currentTime = getCurrentTime();

    var startTime;
    // 确定 startTime 值
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
    // 根据优先级确定 timeout
    switch (priorityLevel) {
        case ImmediatePriority:
            timeout = IMMEDIATE_PRIORITY_TIMEOUT;
            break;
        case UserBlockingPriority:
            timeout = USER_BLOCKING_PRIORITY_TIMEOUT;
            break;
        case IdlePriority:
            timeout = IDLE_PRIORITY_TIMEOUT;
            break;
        case LowPriority:
            timeout = LOW_PRIORITY_TIMEOUT;
            break;
        case NormalPriority:
        default:
            timeout = NORMAL_PRIORITY_TIMEOUT;
            break;
    }

    // 确定过期时间
    // 越紧急的任务，过期时间越近，Immediate 的立刻失效过期
    var expirationTime = startTime + timeout;
    var newTask = {
        id: taskIdCounter++,
        callback,
        priorityLevel,
        startTime,
        expirationTime,
        sortIndex: -1,
    };
    newTask.sortIndex = expirationTime;
    function push(a, b) {}
    push(taskQueue, newTask);
    // Schedule a host callback, if needed. If we're already performing work,
    // wait until the next time we yield.
    // 简单来说可能是把任务推进去，然后安排执行
    // 但是如果已经安排上执行了，或者已经是在执行中了，那就等调度就行了
    // 可能是三步走, isHostCallbackScheduler -> isMessageLoopRunning -> isPerformingWork
    if (!isHostCallbackScheduled && !isPerformingWork) {
        // 从下面看，也就是 hostcallback 在执行前, 这个变量都不会被置位
        isHostCallbackScheduled = true;
        requestHostCallback(flushWork);
    }
    return newTask;
}  

// 这是一个可能的 scheduledHostCallback，那它理论上可能有返回值
function flushWork(hasTimeRemaining, initialTime) {
    // 打开安排
    isHostCallbackScheduled = false;

    if (isHostTimeoutScheduled) {
        // We scheduled a timeout but it's no longer needed. Cancel it.
        isHostTimeoutScheduled = false;
        cancelHostTimeout();
    }

    isPerformingWork = true;
    const previousPriorityLevel = currentPriorityLevel;
    try {
        // No catch in prod code path.
        return workLoop(hasTimeRemaining, initialTime);
    } finally {
        currentTask = null;
        currentPriorityLevel = previousPriorityLevel;
        isPerformingWork = false;
    }
}

// hasTimeRemaining 这个目前没有用到，一直是 true
function workLoop(hasTimeRemaining, initialTime) {
    let currentTime = initialTime;
    advanceTimers(currentTime);
    currentTask = peek(taskQueue);
    while (
        currentTask !== null
    ) {
        // 过期时间还没到 && (时间不剩余了，又或者是用了 5ms 了)
        if (
            currentTask.expirationTime > currentTime &&
            (!hasTimeRemaining || shouldYieldToHost())
        ) {
            // 等下次调度
            break;
        }
        const callback = currentTask.callback;
        if (typeof callback === 'function') {
            currentTask.callback = null;
            currentPriorityLevel = currentTask.priorityLevel;
            const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
            const continuationCallback = callback(didUserCallbackTimeout);
            currentTime = getCurrentTime();
            if (typeof continuationCallback === 'function') {
                currentTask.callback = continuationCallback;
            } else {
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

    // 提前退出，返回一个布尔值，代表还有要执行的 work
    if (currentTask !== null) {
        return true;
    } else {
        // 都执行完了
        const firstTimer = peek(timerQueue);
        if (firstTimer !== null) {
            requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
        }
        return false;
    }
}

requestHostTimeout = function(callback, ms) {
    taskTimeoutID = setTimeout(() => {
        callback(getCurrentTime());
    }, ms);
};

cancelHostTimeout = function() {
    clearTimeout(taskTimeoutID);
    taskTimeoutID = -1;
};