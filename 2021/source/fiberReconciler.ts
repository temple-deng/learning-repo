import {
    Container
} from './reactDom';
import {
    RootTag,
    FiberRoot,
    WorkTag
} from './const';
import {
  requestEventTime,
  requestUpdateLane,
  scheduleUpdateOnFiber
} from './FiberWorkLoop';
import {
  createUpdate,
  enqueueUpdate
} from './updateQueue';

function createContainer(
    containerInfo: Container,
    tag: RootTag,
    hydrate: boolean,
    hydrationCallbacks: null,
): FiberRoot {
    return createFiberRoot(containerInfo, tag, hydrate, hydrationCallbacks);
}

export function createFiberRoot(
    containerInfo: any,
    tag: RootTag,
    hydrate: boolean,
    hydrationCallbacks: null,
): FiberRoot {
    const root: FiberRoot = new FiberRootNode(containerInfo, tag, hydrate);

    // Cyclic construction. This cheats the type system right now because
    // stateNode is any.
    const uninitializedFiber = createHostRootFiber(tag);
    root.current = uninitializedFiber;
    uninitializedFiber.stateNode = root;

    initializeUpdateQueue(uninitializedFiber);

    return root;
}

const createFiber = function(
    tag: WorkTag,
    pendingProps: any,
    key: null | string,
    mode: number,
): Fiber {
    // $FlowFixMe: the shapes are exact here but Flow doesn't like constructors
    return new FiberNode(tag, pendingProps, key, mode);
};

function FiberNode(
    tag: WorkTag,
    pendingProps: mixed,
    key: null | string,
    mode: TypeOfMode,
  ) {
    // Instance
    this.tag = tag;
    this.key = key;
    this.elementType = null;
    this.type = null;
    this.stateNode = null;
  
    // Fiber
    this.return = null;
    this.child = null;
    this.sibling = null;
    this.index = 0;
  
    this.ref = null;
  
    this.pendingProps = pendingProps;
    this.memoizedProps = null;
    this.updateQueue = null;
    this.memoizedState = null;
    this.dependencies = null;
  
    this.mode = mode;
  
    // Effects
    this.flags = NoFlags;
    this.nextEffect = null;
  
    this.firstEffect = null;
    this.lastEffect = null;
  
    this.lanes = NoLanes;
    this.childLanes = NoLanes;
  
    this.alternate = null;
  
    if (enableProfilerTimer) {
      // Note: The following is done to avoid a v8 performance cliff.
      //
      // Initializing the fields below to smis and later updating them with
      // double values will cause Fibers to end up having separate shapes.
      // This behavior/bug has something to do with Object.preventExtension().
      // Fortunately this only impacts DEV builds.
      // Unfortunately it makes React unusably slow for some applications.
      // To work around this, initialize the fields below with doubles.
      //
      // Learn more about this here:
      // https://github.com/facebook/react/issues/14365
      // https://bugs.chromium.org/p/v8/issues/detail?id=8538
      this.actualDuration = Number.NaN;
      this.actualStartTime = Number.NaN;
      this.selfBaseDuration = Number.NaN;
      this.treeBaseDuration = Number.NaN;
  
      // It's okay to replace the initial doubles with smis after initialization.
      // This won't trigger the performance cliff mentioned above,
      // and it simplifies other profiler code (including DevTools).
      this.actualDuration = 0;
      this.actualStartTime = -1;
      this.selfBaseDuration = 0;
      this.treeBaseDuration = 0;
    }
  
    if (__DEV__) {
      // This isn't directly used but is handy for debugging internals:
      this._debugID = debugCounter++;
      this._debugSource = null;
      this._debugOwner = null;
      this._debugNeedsRemount = false;
      this._debugHookTypes = null;
      if (!hasBadMapPolyfill && typeof Object.preventExtensions === 'function') {
        Object.preventExtensions(this);
      }
    }
}

function FiberRootNode(containerInfo, tag, hydrate) {
    this.tag = tag;
    this.containerInfo = containerInfo;
    this.pendingChildren = null;
    this.current = null;
    this.pingCache = null;
    this.finishedWork = null;
    this.timeoutHandle = noTimeout;
    this.context = null;
    this.pendingContext = null;
    this.hydrate = hydrate;
    this.callbackNode = null;
    this.callbackPriority = NoLanePriority;
    this.eventTimes = createLaneMap(NoLanes);
    this.expirationTimes = createLaneMap(NoTimestamp);

    this.pendingLanes = NoLanes;
    this.suspendedLanes = NoLanes;
    this.pingedLanes = NoLanes;
    this.expiredLanes = NoLanes;
    this.mutableReadLanes = NoLanes;
    this.finishedLanes = NoLanes;

    this.entangledLanes = NoLanes;
    this.entanglements = createLaneMap(NoLanes);

}

export function createHostRootFiber(tag: RootTag): Fiber {
    let mode;
    if (tag === ConcurrentRoot) {
      mode = ConcurrentMode | BlockingMode | StrictMode;
    } else if (tag === BlockingRoot) {
      mode = BlockingMode | StrictMode;
    } else {
      mode = NoMode;
    }
  
    if (enableProfilerTimer && isDevToolsPresent) {
      // Always collect profile timings when DevTools are present.
      // This enables DevTools to start capturing timing at any point–
      // Without some nodes in the tree having empty base times.
      mode |= ProfileMode;
    }

    return createFiber(HostRoot, null, null, mode);
}

export function initializeUpdateQueue<State>(fiber: Fiber): void {
    const queue: UpdateQueue<State> = {
        baseState: fiber.memoizedState,
        firstBaseUpdate: null,
        lastBaseUpdate: null,
        shared: {
            pending: null,
        },
        effects: null,
    };
    fiber.updateQueue = queue;
}


export function updateContainer(
    element: ReactNodeList,
    container: OpaqueRoot,
    parentComponent: ?React$Component<any, any>,
    callback: ?Function,
  ): Lane {
    const current = container.current;
    const eventTime = requestEventTime();
    const lane = requestUpdateLane(current);
  
    const context = getContextForSubtree(parentComponent);
    if (container.context === null) {
        container.context = context;
    } else {
      container.pendingContext = context;
    }

    const update = createUpdate(eventTime, lane);
    // Caution: React DevTools currently depends on this property
    // being called "element".
    update.payload = {element};
  
    callback = callback === undefined ? null : callback;
    if (callback !== null) {
      update.callback = callback;
    }
  
    enqueueUpdate(current, update);
    // 第一次更新的时候相当于在这里将 update 推入到 hostRootFiber 的 updateQueue 中
    // 然后通知调度器开始调度
    scheduleUpdateOnFiber(current, lane, eventTime);
  
    return lane;
  }