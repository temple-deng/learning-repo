export type SchedulerCallback = (isSync: boolean) => SchedulerCallback | null;
let immediateQueueCallbackNode:  any = null;
let isFlushingSyncQueue: boolean = false;
let syncQueue: Array<SchedulerCallback> | null = null;

export function flushSyncCallbackQueue() {
    if (immediateQueueCallbackNode !== null) {
        const node = immediateQueueCallbackNode;
        immediateQueueCallbackNode = null;
        Scheduler_cancelCallback(node);
    }
    flushSyncCallbackQueueImpl();
}

function flushSyncCallbackQueueImpl() {
    // 注意到这我们还没设置过 syncQueue
    if (!isFlushingSyncQueue && syncQueue !== null) {
        // Prevent re-entrancy.
        isFlushingSyncQueue = true;
    }
}