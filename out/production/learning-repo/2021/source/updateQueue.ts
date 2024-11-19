import {
    Lane,
    Fiber
} from './const';

export const UpdateState = 0;
export const ReplaceState = 1;
export const ForceUpdate = 2;
export const CaptureUpdate = 3;

export type Update<State> = {
    // TODO: Temporary field. Will remove this by storing a map of
    // transition -> event time on the root.
    eventTime: number,
    lane: Lane,

    tag: 0 | 1 | 2 | 3,
    payload: any,
    callback: (() => any) | null,

    next: Update<State> | null,
};

type SharedQueue<State> = {
    pending: Update<State> | null,
};

export type UpdateQueue<State> = {
    baseState: State,
    firstBaseUpdate: Update<State> | null,
    lastBaseUpdate: Update<State> | null,
    shared: SharedQueue<State>,
    effects: Array<Update<State>> | null,
};


export function createUpdate(eventTime: number, lane: Lane): Update<*> {
    const update: Update<State> = {
        eventTime,
        lane,
    
        tag: UpdateState,
        payload: null,
        callback: null,
    
        next: null,
    };
    return update;
}

export function enqueueUpdate<State>(fiber: Fiber, update: Update<State>) {
    const updateQueue = fiber.updateQueue;
    if (updateQueue === null) {
        // Only occurs if the fiber has been unmounted.
        return;
    }

    const sharedQueue: SharedQueue<State> = updateQueue.shared;
    const pending = sharedQueue.pending;
    if (pending === null) {
        // This is the first update. Create a circular list.
        update.next = update;
    } else {
        update.next = pending.next;
        pending.next = update;
    }
    sharedQueue.pending = update;
}
