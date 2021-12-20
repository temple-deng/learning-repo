let includesLegacySyncCallbacks: boolean = false;
let isFlushingSyncQueue: boolean = false;
let syncQueue: Array<SchedulerCallback> | null = null;

export function flushSyncCallbacksOnlyInLegacyMode() {
    // Only flushes the queue if there's a legacy sync callback scheduled.
    // TODO: There's only a single type of callback: performSyncOnWorkOnRoot. So
    // it might make more sense for the queue to be a list of roots instead of a
    // list of generic callbacks. Then we can have two: one for legacy roots, one
    // for concurrent roots. And this method would only flush the legacy ones.
    if (includesLegacySyncCallbacks) {
        flushSyncCallbacks();
    }
}

export function flushSyncCallbacks() {
    if (!isFlushingSyncQueue && syncQueue !== null) {
      // Prevent re-entrance.
            isFlushingSyncQueue = true;
            let i = 0;
            const previousUpdatePriority = getCurrentUpdatePriority();
            try {
                const isSync = true;
                const queue = syncQueue;
                // TODO: Is this necessary anymore? The only user code that runs in this
                // queue is in the render or commit phases.
                setCurrentUpdatePriority(DiscreteEventPriority);
                for (; i < queue.length; i++) {
                let callback = queue[i];
                do {
                    callback = callback(isSync);
                } while (callback !== null);
                }
                syncQueue = null;
                includesLegacySyncCallbacks = false;
            } catch (error) {
                // If something throws, leave the remaining callbacks on the queue.
                if (syncQueue !== null) {
                syncQueue = syncQueue.slice(i + 1);
            }
                // Resume flushing in the next tick
                scheduleCallback(ImmediatePriority, flushSyncCallbacks);
                throw error;
        } finally {
                setCurrentUpdatePriority(previousUpdatePriority);
                isFlushingSyncQueue = false;
        }
    }
    return null;
}
