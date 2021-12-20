// shared/ReactSymbols.js
type NumOrSym = number | symbol;

export let REACT_ELEMENT_TYPE: NumOrSym = 0xeac7;
export let REACT_PORTAL_TYPE: NumOrSym = 0xeaca;
export let REACT_FRAGMENT_TYPE: NumOrSym = 0xeacb;
export let REACT_STRICT_MODE_TYPE: NumOrSym = 0xeacc;
export let REACT_PROFILER_TYPE: NumOrSym = 0xead2;
export let REACT_PROVIDER_TYPE: NumOrSym = 0xeacd;
export let REACT_CONTEXT_TYPE: NumOrSym = 0xeace;
export let REACT_FORWARD_REF_TYPE: NumOrSym = 0xead0;
export let REACT_SUSPENSE_TYPE: NumOrSym = 0xead1;
export let REACT_SUSPENSE_LIST_TYPE: NumOrSym = 0xead8;
export let REACT_MEMO_TYPE: NumOrSym = 0xead3;
export let REACT_LAZY_TYPE: NumOrSym = 0xead4;
export let REACT_SCOPE_TYPE: NumOrSym = 0xead7;
export let REACT_OPAQUE_ID_TYPE: NumOrSym = 0xeae0;
export let REACT_DEBUG_TRACING_MODE_TYPE: NumOrSym = 0xeae1;
export let REACT_OFFSCREEN_TYPE: NumOrSym = 0xeae2;
export let REACT_LEGACY_HIDDEN_TYPE: NumOrSym = 0xeae3;
export let REACT_CACHE_TYPE: NumOrSym = 0xeae4;

if (typeof Symbol === 'function' && Symbol.for) {
    const symbolFor = Symbol.for;
    REACT_ELEMENT_TYPE = symbolFor('react.element');
    REACT_PORTAL_TYPE = symbolFor('react.portal');
    REACT_FRAGMENT_TYPE = symbolFor('react.fragment');
    REACT_STRICT_MODE_TYPE = symbolFor('react.strict_mode');
    REACT_PROFILER_TYPE = symbolFor('react.profiler');
    REACT_PROVIDER_TYPE = symbolFor('react.provider');
    REACT_CONTEXT_TYPE = symbolFor('react.context');
    REACT_FORWARD_REF_TYPE = symbolFor('react.forward_ref');
    REACT_SUSPENSE_TYPE = symbolFor('react.suspense');
    REACT_SUSPENSE_LIST_TYPE = symbolFor('react.suspense_list');
    REACT_MEMO_TYPE = symbolFor('react.memo');
    REACT_LAZY_TYPE = symbolFor('react.lazy');
    REACT_SCOPE_TYPE = symbolFor('react.scope');
    REACT_OPAQUE_ID_TYPE = symbolFor('react.opaque.id');
    REACT_DEBUG_TRACING_MODE_TYPE = symbolFor('react.debug_trace_mode');
    REACT_OFFSCREEN_TYPE = symbolFor('react.offscreen');
    REACT_LEGACY_HIDDEN_TYPE = symbolFor('react.legacy_hidden');
    REACT_CACHE_TYPE = symbolFor('react.cache');
}

export type RefObject = {
    current: any;
};


// react-reconciler/ReactWorkTags.js
// WorkTag 究竟是什么意思，如何理解这个 work
export type WorkTag = 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15
    | 16
    | 17
    | 18
    | 19
    | 20
    | 21
    | 22
    | 23
    | 24;

export const HostComponent = 5;

// react-reconciler/ReactFiberFlags.js
export type Flags = number;

// react-reconciler/ReactFiberLane.js
export type Lanes = number;
export type Lane = number;
export type LaneMap<T> = Array<T>;
export const NoLanes: Lanes = /*                        */ 0b0000000000000000000000000000000;
export const NoLane: Lane = /*                          */ 0b0000000000000000000000000000000;
export const IdleLane: Lanes = /*                       */ 0b0100000000000000000000000000000;
export const SyncLane: Lane = /*                        */ 0b0000000000000000000000000000001;

// react-reconciler/ReactInternalTypes.js
export type Fiber = {
    tag: WorkTag;

    key: null | string;

    elementType: any; // 应该是等同于 ReactElement.type 的

    type: any;

    stateNode: any;

    return: Fiber | null;
    child: Fiber | null;
    sibling: Fiber | null;
    index: number;
    ref: null | ((handle: any) => void) | RefObject,

    pendingProps: any;
    memorizedProps: any;

    updateQueue: any;
    memorizedState: any;

    dependencies: null;
    mode: number;

    flags: Flags;
    subtreeFlags: Flags;
    deletions: Array<Fiber> | null;

    nextEffect: Fiber | null;

    firstEffect: Fiber | null;
    lastEffect: Fiber | null;

    lanes: Lanes;
    childLanes: Lanes;

    alternate: Fiber | null;
};

// react-reconciler/ReactRootTags.js
export type RootTag = 0 | 1;
export const LegacyRoot = 0;
export const ConcurrentRoot = 1;

export type FiberRoot = {
    // 运行的模式，注意这里不同于 Fiber.tag
    tag: RootTag;

    containerInfo: any;
    pendingChildren: any;

    current: Fiber;
    
    finishedWork: Fiber | null;
    context: Object | null;
    pendingContent: Object | null;

    // Scheduler.scheduleCallback 返回的节点，代表下次渲染时，继续开始工作的那个节点
    // 那这个是那个 taskQueue 里面的一个节点吗
    callbackNode: any;
    callbackPriority: Lane;

    eventTimes: LaneMap<number>;
    expirationTimes: LaneMap<number>;

    pendingLanes: Lanes;
    suspendedLanes: Lanes;
    pingedLanes: Lanes;
    expiredLanes: Lanes;
    mutableReadLanes: Lanes;

    finishedLanes: Lanes;

    entangledLanes: Lanes;
    entanglements: LaneMap<Lanes>;

    pooledCache:  null;
    pooledCacheLanes: Lanes;
};

export function laneToIndex(lane: Lane) {
    // 最左边的那个1的索引吧，从右开始数
    return 31 - Math.clz32(lane);
}

export const NoMode = /*                         */ 0b000000;
// TODO: Remove ConcurrentMode by reading from the root tag instead
export const ConcurrentMode = /*                 */ 0b000001;

export type ReactNode =
    // React$Element<any>
    // | ReactPortal
    | ReactText
    // | ReactFragment
    // | ReactProvider<any>
    // | ReactConsumer<any>;

export type ReactEmpty = null | void | boolean;
export type ReactText = string | number;
export type ReactNodeList = ReactEmpty | ReactNode;

export type PublicInstance = Element | Text;

export type RootType = {
    render(children: ReactNodeList): void,
    unmount(): void,
    _internalRoot: FiberRoot,
};

export type PriorityLevel = 0 | 1 | 2 | 3 | 4 | 5;

// TODO: Use symbols?
export const NoPriority = 0;
export const ImmediatePriority = 1;
export const UserBlockingPriority = 2;
export const NormalPriority = 3;
export const LowPriority = 4;
export const IdlePriority = 5;

export function mergeLanes(a: Lanes | Lane, b: Lanes | Lane): Lanes {
    return a | b;
}

export type LanePriority =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17;

const NonIdleLanes = /*                                 */ 0b0000111111111111111111111111111;

export const NoLanePriority: LanePriority = 0;

// getNextLanes会根据fiberRoot对象上的属性(expiredLanes, suspendedLanes, pingedLanes等), 确定出当前最紧急的lanes.
export function getNextLanes(root: FiberRoot, wipLanes: Lanes): Lanes {
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
        // 走这
        const nonIdlePendingLanes = pendingLanes & NonIdleLanes;

    }
}