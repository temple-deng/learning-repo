## completeWork

<!-- TOC -->

- [completeWork](#completework)
  - [completeUnitOfWork(img)](#completeunitofworkimg)
    - [completeWork(img)](#completeworkimg)
    - [createInstance](#createinstance)
    - [updateHostComponent](#updatehostcomponent)
    - [diffProperties](#diffproperties)
    - [appendAllChildren](#appendallchildren)
    - [finalizeInitialChildren](#finalizeinitialchildren)
    - [completeWork(img) 总结](#completeworkimg-总结)
    - [bubbleProperties](#bubbleproperties)
  - [completeWork(Edit)](#completeworkedit)
    - [updateHostText](#updatehosttext)
    - [createTextInstance](#createtextinstance)
  - [completeWork(code)](#completeworkcode)
  - [completeWork(and save to reload)](#completeworkand-save-to-reload)
  - [completeWork(p)](#completeworkp)
  - [completeWork(a)](#completeworka)
  - [completeWork(header)](#completeworkheader)
  - [completeWork(div)](#completeworkdiv)
  - [completeWork(App)](#completeworkapp)
  - [complete(HostRoot)](#completehostroot)
  - [总结](#总结)

<!-- /TOC -->

例子用的和 beginWork 中的是同一个。

首先先看 performUnitOfWork：

```ts
function performUnitOfWork(unitOfWork: Fiber): void {
  const current = unitOfWork.alternate;

  let next = beginWork(current, unitOfWork, subtreeRenderLanes);
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  if (next === null) {
    completeUnitOfWork(unitOfWork);
  } else {
    workInProgress = next;
  }

  ReactCurrentOwner.current = null;
}
```

当 beginWork(img) 后，由于 img 元素没有后代元素了，进入 `completeUnitOfWork` 流程。

### completeUnitOfWork(img)

```ts
function completeUnitOfWork(unitOfWork: Fiber): void {
  let completedWork = unitOfWork;
  // while (completedWork !== null)
  do {
    const current = completedWork.alternate;
    const returnFiber = completedWork.return;

    // Check if the work completed or if something threw.
    // 这种情况
    if ((completedWork.flags & Incomplete) === NoFlags) {
      // 从下面函数定义能看出，绝大部分情况都返回 null，只有 suspend 可能会有例外
      let next = completeWork(current, completedWork, subtreeRenderLanes);

      if (next !== null) {
        workInProgress = next;
        return;
      }
    } else {
      // else 分支的内容应该都是出错的内容吧
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
  if (workInProgressRootExitStatus === RootInProgress) {
    workInProgressRootExitStatus = RootCompleted;
  }
}
```

#### completeWork(img)

这个函数非常长，有 800 多行。。。

```ts
function completeWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
): Fiber | null {
  const newProps = workInProgress.pendingProps;
  popTreeContext(workInProgress);
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
      bubbleProperties(workInProgress);
      return null;
    case ClassComponent: {
      const Component = workInProgress.type;
      if (isLegacyContextProvider(Component)) {
        popLegacyContext(workInProgress);
      }
      bubbleProperties(workInProgress);
      return null;
    }
    case HostRoot: {
      const fiberRoot = (workInProgress.stateNode as FiberRoot);

      popHostContainer(workInProgress);
      popTopLevelLegacyContextObject(workInProgress);
      resetMutableSourceWorkInProgressVersions();
      if (fiberRoot.pendingContext) {
        fiberRoot.context = fiberRoot.pendingContext;
        fiberRoot.pendingContext = null;
      }

      updateHostContainer(current, workInProgress);
      bubbleProperties(workInProgress);
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

          // This can happen when we abort work.
          bubbleProperties(workInProgress);
          return null;
        }

        const currentHostContext = getHostContext();
        const instance = createInstance(
            type,
            newProps,
            rootContainerInstance,
            currentHostContext,
            workInProgress,
          );

          appendAllChildren(instance, workInProgress, false, false);

          workInProgress.stateNode = instance;

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

        if (workInProgress.ref !== null) {
          // If there is a ref on a host node we need to schedule a callback
          markRef(workInProgress);
        }
      }
      bubbleProperties(workInProgress);
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
          if (workInProgress.stateNode === null) {
            throw new Error(
              'We must have new props for new mounts. This error is likely ' +
                'caused by a bug in React. Please file an issue.',
            );
          }
          // This can happen when we abort work.
        }
        const rootContainerInstance = getRootHostContainer();
        const currentHostContext = getHostContext();
        const wasHydrated = popHydrationState(workInProgress);
        workInProgress.stateNode = createTextInstance(
            newText,
            rootContainerInstance,
            currentHostContext,
            workInProgress,
          );
      }
      bubbleProperties(workInProgress);
      return null;
    }
    case SuspenseComponent: {
      // 太长了，删了
      popSuspenseContext(workInProgress);
      const nextState: null | SuspenseState = workInProgress.memoizedState;
      return null;
    }
    case HostPortal:
      popHostContainer(workInProgress);
      updateHostContainer(current, workInProgress);
      if (current === null) {
        preparePortalMount(workInProgress.stateNode.containerInfo);
      }
      bubbleProperties(workInProgress);
      return null;
    case ContextProvider:
      // Pop provider fiber
      const context: ReactContext<any> = workInProgress.type._context;
      popProvider(context, workInProgress);
      bubbleProperties(workInProgress);
      return null;
    case IncompleteClassComponent: {
      // Same as class component case. I put it down here so that the tags are
      // sequential to ensure this switch is compiled to a jump table.
      const Component = workInProgress.type;
      if (isLegacyContextProvider(Component)) {
        popLegacyContext(workInProgress);
      }
      bubbleProperties(workInProgress);
      return null;
    }
    case SuspenseListComponent: {
    // 太长了，删了
      popSuspenseContext(workInProgress)；
      bubbleProperties(workInProgress);
      return null;
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
        bubbleProperties(workInProgress);
        return null;
      }
      break;
    }
    case OffscreenComponent:
    case LegacyHiddenComponent: {
      popRenderLanes(workInProgress);
      return null;
    }
  }

  throw new Error(
    `Unknown unit of work tag (${workInProgress.tag}). This error is likely caused by a bug in ` +
      'React. Please file an issue.',
  );
}
```

核心内容就是根据不同 tag 的 fiber，采用不同的行为，主要我们用到的代码其实就这些：

```ts
const newProps = workInProgress.pendingProps;
popTreeContext(workInProgress);
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
    bubbleProperties(workInProgress);
    return null;
  case ClassComponent: {
    const Component = workInProgress.type;
    if (isLegacyContextProvider(Component)) {
      popLegacyContext(workInProgress);
    }
    bubbleProperties(workInProgress);
    return null;
  }
  case HostRoot: {
    const fiberRoot = workInProgress.stateNode as FiberRoot;

    popHostContainer(workInProgress);
    popTopLevelLegacyContextObject(workInProgress);
    resetMutableSourceWorkInProgressVersions();
    if (fiberRoot.pendingContext) {
      fiberRoot.context = fiberRoot.pendingContext;
      fiberRoot.pendingContext = null;
    }

    updateHostContainer(current, workInProgress);
    bubbleProperties(workInProgress);
    return null;
  }
  case HostComponent:
  //...
  case HostText:
  //...
}
```

可以看到出现频率很高的一个函数是 `bubbleProperties`，这个后面我们看一下干了什么，这里先具体看下 HostComponent 的分支。

```ts
{
  popHostContext(workInProgress);
  // 这个我们后面再看干了什么，这里知道最后返回 react 应用挂载的那个 dom 元素即可
  // 从名字也能猜出个大概
  const rootContainerInstance = getRootHostContainer();
  const type = workInProgress.type;

  // 有旧的 fiber 节点也有对应的 dom 节点，那就之前已经存在页面中咯？
  if (current !== null && workInProgress.stateNode != null) {
    // 这种情况下尝试更新？
    updateHostComponent(
      current,
      workInProgress,
      type,
      newProps,
      rootContainerInstance
    );

    // 添加 ref 标记
    if (current.ref !== workInProgress.ref) {
      markRef(workInProgress);
    }
  } else {
    // 没有旧的 fiber 节点或者没有对应的 dom 节点
    if (!newProps) {
      // This can happen when we abort work.
      bubbleProperties(workInProgress);
      return null;
    }

    const currentHostContext = getHostContext();
    // currentHostContext 返回了一个挺奇怪的对象

    // 这种情况下要新建 dom 元素吧
    // 新建 dom 元素
    const instance = createInstance(
      type,
      newProps,
      rootContainerInstance,
      currentHostContext,
      workInProgress
    );

    appendAllChildren(instance, workInProgress, false, false);

    workInProgress.stateNode = instance;

    if (
      finalizeInitialChildren(
        instance,
        type,
        newProps,
        rootContainerInstance,
        currentHostContext
      )
    ) {
      markUpdate(workInProgress);
    }

    if (workInProgress.ref !== null) {
      // If there is a ref on a host node we need to schedule a callback
      markRef(workInProgress);
    }
  }
  bubbleProperties(workInProgress);
  return null;
}
```

所以针对 HostComponent 类型来说，如果是新的 dom fiber 节点，那么就需要调用 `createInstance` 创建对应的 dom 元素，然后将下级 dom append 上来，设置 dom 属性，打 flag，否则就调用 `updateHostComponent` 更新对应的 dom 元素，然后两种情况最后都要 `bubbleProperties`。

#### createInstance

```ts
// 所以这个就是创建了 dom 元素
export function createInstance(
  type: string,
  props: Props,
  rootContainerInstance: Container,
  hostContext: HostContext,
  internalInstanceHandle: Object // 这是 wip？
): Instance {
  let parentNamespace: string = hostContext as any as HostContextProd;
  const domElement: Instance = createElement(
    type,
    props,
    rootContainerInstance,
    parentNamespace
  );
  // 在 dom 节点上保留一个对 fiber 节点的引用
  precacheFiberNode(internalInstanceHandle, domElement);
  // 在 dom 节点上保留一个对 props 对象的引用
  updateFiberProps(domElement, props);
  return domElement;
}

// 所以这个函数其实就是调用 createElement 创建了一个 dom 元素
export function createElement(
  type: string,
  props: Object,
  rootContainerElement: Element | Document | DocumentFragment,
  parentNamespace: string
): Element {
  let isCustomComponentTag;

  const ownerDocument: Document =
    getOwnerDocumentFromRootContainer(rootContainerElement);
  let domElement: Element;
  let namespaceURI = parentNamespace;
  if (namespaceURI === HTML_NAMESPACE) {
    namespaceURI = getIntrinsicNamespace(type);
  }
  // 上面这一串暂时不用管，反正是进了这个 if
  if (namespaceURI === HTML_NAMESPACE) {
    if (type === "script") {
      const div = ownerDocument.createElement("div");
      div.innerHTML = "<script><" + "/script>";
      const firstChild = div.firstChild as any as HTMLScriptElement;
      // 这一通操作没看到几个意思
      domElement = div.removeChild(firstChild);
    } else if (typeof props.is === "string") {
      // 这里之所以和下面 else 分了两个分支，貌似是 ff 中 createElement 中有bug，所以不必特别在意
      domElement = ownerDocument.createElement(type, { is: props.is });
    } else {
      domElement = ownerDocument.createElement(type);

      if (type === "select") {
        const node = domElement as any as HTMLSelectElement;
        if (props.multiple) {
          node.multiple = true;
        } else if (props.size) {
          node.size = props.size;
        }
      }
    }
  } else {
    domElement = ownerDocument.createElementNS(namespaceURI, type);
  }

  return domElement;
}

function getOwnerDocumentFromRootContainer(
  rootContainerElement: Element | Document | DocumentFragment
): Document {
  return rootContainerElement.nodeType === DOCUMENT_NODE
    ? (rootContainerElement as any)
    : rootContainerElement.ownerDocument;
}

export function precacheFiberNode(
  hostInst: Fiber,
  node: Instance | TextInstance | SuspenseInstance | ReactScopeInstance
): void {
  (node as any)[internalInstanceKey] = hostInst;
}

export function updateFiberProps(
  node: Instance | TextInstance | SuspenseInstance,
  props: Props
): void {
  (node as any)[internalPropsKey] = props;
}
```

#### updateHostComponent

```ts
function updateHostComponent(
  current: Fiber,
  workInProgress: Fiber,
  type: Type,
  newProps: Props,
  rootContainerInstance: Container
) {
  // If we have an alternate, that means this is an update and we need to
  // schedule a side-effect to do the updates.
  const oldProps = current.memoizedProps;
  if (oldProps === newProps) {
    // 属性没有变动直接提前退出？
    return;
  }

  const instance: Instance = workInProgress.stateNode;
  const currentHostContext = getHostContext();
  const updatePayload = prepareUpdate(
    instance,
    type,
    oldProps,
    newProps,
    rootContainerInstance,
    currentHostContext
  );
  workInProgress.updateQueue = updatePayload as any;
  // If the update payload indicates that there is a change or if there
  // is a new ref we mark this as an update. All the work is done in commitWork.
  // 添加 Update flag
  if (updatePayload) {
    markUpdate(workInProgress);
  }
}

function prepareUpdate(
  domElement: Instance,
  type: string,
  oldProps: Props,
  newProps: Props,
  rootContainerInstance: Container,
  hostContext: HostContext
): null | Array<mixed> {
  return diffProperties(
    domElement,
    type,
    oldProps,
    newProps,
    rootContainerInstance
  );
}
```

所以 `updateHostComponent` 主要的任务就是比较 dom 元素属性的变动列表，并保存到 fiber.updateQueue 中，那这样就知道了 hostComponent 中的 updateQueue 和普通 fiber 的 queue 是不同，如果有属性的变动就打上 Update flag。

#### diffProperties

从注释及名称就能大致猜出，应该是比较 oldProps 和 newProps 两个对象中变动的属性。

```ts
// Calculate the diff between the two objects.
export function diffProperties(
  domElement: Element,
  tag: string,
  lastRawProps: Object,
  nextRawProps: Object,
  rootContainerElement: Element | Document | DocumentFragment
): null | Array<mixed> {
  let updatePayload: null | Array<any> = null;

  let lastProps: Object;
  let nextProps: Object;
  switch (tag) {
    case "input":
      lastProps = ReactDOMInputGetHostProps(domElement, lastRawProps);
      nextProps = ReactDOMInputGetHostProps(domElement, nextRawProps);
      updatePayload = [];
      break;
    case "select":
      lastProps = ReactDOMSelectGetHostProps(domElement, lastRawProps);
      nextProps = ReactDOMSelectGetHostProps(domElement, nextRawProps);
      updatePayload = [];
      break;
    case "textarea":
      lastProps = ReactDOMTextareaGetHostProps(domElement, lastRawProps);
      nextProps = ReactDOMTextareaGetHostProps(domElement, nextRawProps);
      updatePayload = [];
      break;
    default:
      // 正常元素都走这了
      lastProps = lastRawProps;
      nextProps = nextRawProps;
      if (
        typeof lastProps.onClick !== "function" &&
        typeof nextProps.onClick === "function"
      ) {
        trapClickOnNonInteractiveElement(domElement as any as HTMLElement);
      }
      break;
  }

  let propKey;
  let styleName;
  let styleUpdates = null;

  // 遍历 oldProps 对象
  for (propKey in lastProps) {
    if (
      nextProps.hasOwnProperty(propKey) ||
      !lastProps.hasOwnProperty(propKey) ||
      lastProps[propKey] == null
    ) {
      // 如果 newProps 有这个属性， 或者 oldProps 这个是继承的，或者是 null/undefined 就跳过？
      // 这意味着这是个新增的属性吧，为什么不处理呢，是放在遍历 newProps 的时候处理？
      continue;
    }
    // STYPE = "style"
    if (propKey === STYLE) {
      const lastStyle = lastProps[propKey];
      for (styleName in lastStyle) {
        if (lastStyle.hasOwnProperty(styleName)) {
          if (!styleUpdates) {
            styleUpdates = {};
          }
          // 所有旧的 style 属性都置为空串
          styleUpdates[styleName] = "";
        }
      }
    } else if (propKey === DANGEROUSLY_SET_INNER_HTML || propKey === CHILDREN) {
      // Noop. This is handled by the clear text mechanism.
    } else if (
      propKey === SUPPRESS_CONTENT_EDITABLE_WARNING ||
      propKey === SUPPRESS_HYDRATION_WARNING
    ) {
      // Noop
    } else if (propKey === AUTOFOCUS) {
      // Noop. It doesn't work on updates anyway.
      // 上面这几个即一些特殊的属性，不处理
    } else if (registrationNameDependencies.hasOwnProperty(propKey)) {
      // 应该是指事件监听属性
      // This is a special case. If any listener updates we need to ensure
      // that the "current" fiber pointer gets updated so we need a commit
      // to update this element.
      if (!updatePayload) {
        updatePayload = [];
      }
    } else {
      // For all other deleted properties we add it to the queue. We use
      // the allowed property list in the commit phase instead.
      (updatePayload = updatePayload || []).push(propKey, null);
    }
  }
  // 所以上面这一段就是对 oldProps 的处理，对 style，将所有样式提出，将属性值置空串
  // 对其他普通属性，推入数组中，但要注意的是 index 为偶数的位置是属性名，奇数的位置都 null
  // 不考虑特殊属性的情况下，相当于把newProps 上不存在的非 null/undefined 属性推入
  // 数组，这样，当属性值是 null 的时候即暗示这个属性是应该被删除

  // 遍历 newProps
  for (propKey in nextProps) {
    const nextProp = nextProps[propKey];
    const lastProp = lastProps != null ? lastProps[propKey] : undefined;
    if (
      !nextProps.hasOwnProperty(propKey) ||
      nextProp === lastProp ||
      (nextProp == null && lastProp == null)
    ) {
      // 对继承属性，未变动属性，及 null/undefined 属性不处理
      continue;
    }
    if (propKey === STYLE) {
      if (lastProp) {
        // Unset styles on `lastProp` but not on `nextProp`.
        for (styleName in lastProp) {
          // 这里为什么不直接遍历 styleUpdates 呢
          if (
            lastProp.hasOwnProperty(styleName) &&
            (!nextProp || !nextProp.hasOwnProperty(styleName))
          ) {
            if (!styleUpdates) {
              styleUpdates = {};
            }
            styleUpdates[styleName] = "";
          }
        }
        // Update styles that changed since `lastProp`.
        for (styleName in nextProp) {
          if (
            nextProp.hasOwnProperty(styleName) &&
            lastProp[styleName] !== nextProp[styleName]
          ) {
            if (!styleUpdates) {
              styleUpdates = {};
            }
            styleUpdates[styleName] = nextProp[styleName];
          }
        }
      } else {
        if (!styleUpdates) {
          if (!updatePayload) {
            updatePayload = [];
          }
          updatePayload.push(propKey, styleUpdates);
        }
        styleUpdates = nextProp;
      }
    } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
      const nextHtml = nextProp ? nextProp[HTML] : undefined;
      const lastHtml = lastProp ? lastProp[HTML] : undefined;
      if (nextHtml != null) {
        if (lastHtml !== nextHtml) {
          (updatePayload = updatePayload || []).push(propKey, nextHtml);
        }
      } else {
        // TODO: It might be too late to clear this if we have children
        // inserted already.
      }
    } else if (propKey === CHILDREN) {
      if (typeof nextProp === "string" || typeof nextProp === "number") {
        (updatePayload = updatePayload || []).push(propKey, "" + nextProp);
      }
    } else if (
      propKey === SUPPRESS_CONTENT_EDITABLE_WARNING ||
      propKey === SUPPRESS_HYDRATION_WARNING
    ) {
      // Noop
    } else if (registrationNameDependencies.hasOwnProperty(propKey)) {
      if (nextProp != null) {
        // We eagerly listen to this even though we haven't committed yet.
        if (propKey === "onScroll") {
          listenToNonDelegatedEvent("scroll", domElement);
        }
      }
      if (!updatePayload && lastProp !== nextProp) {
        // This is a special case. If any listener updates we need to ensure
        // that the "current" props pointer gets updated so we need a commit
        // to update this element.
        updatePayload = [];
      }
    } else {
      // For any other property we always add it to the queue and then we
      // filter it out using the allowed property list during the commit.
      (updatePayload = updatePayload || []).push(propKey, nextProp);
    }
  }
  if (styleUpdates) {
    (updatePayload = updatePayload || []).push(STYLE, styleUpdates);
  }
  return updatePayload;
}
```

所以这个函数，就是比较了 oldProps 和 newProps，将要删除了的属性，有变动的属性，新增的属性放入了一个数组中，其中索引为偶数的是属性名，索引为奇数是属性值，null 表示属性被删除。

#### appendAllChildren

```ts
function appendAllChildren (
    parent: Instance,
    workInProgress: Fiber,
    needsVisibilityToggle: boolean,
    isHidden: boolean
) {
    // We only have the top Fiber that was created but we need recurse down its
    // children to find all the terminal nodes.
    let node = workInProgress.child;
    while (node !== null) {
      if (node.tag === HostComponent || node.tag === HostText) {
        appendInitialChild(parent, node.stateNode);
      } else if (node.tag === HostPortal) {
        // If we have a portal child, then we don't want to traverse
        // down its children. Instead, we'll get insertions from each child in
        // the portal directly.
      } else if (node.child !== null) {
        // 这个关系不是一直都有的吗
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

function appendInitialChild(
  parentInstance: Instance,
  child: Instance | TextInstance,
): void {
  parentInstance.appendChild(child);
}
```    

这个还暂时看不太懂，在 completeWork(img) 的时候，这里相当于直接退出了。  

根据后面的情况看，就是把当前节点下所有的 dom 串起来，比如这个样子：   

```html
<div>
    <App>
</div>
```   

现在在遍历 div 节点，他会将 App 中渲染的 dom，append 到它的子节点中。相当于组件从当前节点向下的 dom 树。      

#### finalizeInitialChildren    

```ts
export function finalizeInitialChildren(
  domElement: Instance,
  type: string,
  props: Props,
  rootContainerInstance: Container,
  hostContext: HostContext,
): boolean {
  // 这个就是设置 dom 元素上的各项属性
  setInitialProperties(domElement, type, props, rootContainerInstance);

  // 但是返回值不太看懂是什么意思
  switch (type) {
    case 'button':
    case 'input':
    case 'select':
    case 'textarea':
      return !!props.autoFocus;
    case 'img':
      return true;
    default:
      return false;
  }
}
```   

#### completeWork(img) 总结

这里总结一下，首先 `completeWork` 根据不同 tag 的 fiber，采用了不同的工作内容，与 `beginWork` 类似，`beginWork` 的话主要就是根据当前的 fiber 节点，生成新的后代 fiber 节点。而 `completeWork` 这里我们目前只看了 hostComponent 类型。   

针对这种类型，分成了两种情况，已经有对应的 dom 节点，与还没有对应的 dom 节点，对于有 dom 节点的，主要就是调用 `updateHostComponent` 得出属性变动队列，绑定到 fiber.updateQueue 中，并打上 flag。    

而对于没有变动的 dom 节点，就调用 `createInstance` 创建对应的 dom 元素，然后将其后代的 dom 元素 append 上来（这里还存疑，我们需要后续再看），然后在 fiber.stateNode 上绑上 dom 元素。最后再
调用 `finalizeInitialChildren` 在 dom 元素上绑定属性。   

最后均是 `bubbleProperties`。    

#### bubbleProperties    

没弄懂干嘛了，看样子是把 childLanes 和 flags 向上冒泡？   

```ts
function bubbleProperties(completedWork: Fiber) {
  // 这个什么意思呢，有 current fiber 且 child fiber 是同一个 fiber ？
  const didBailout =
    completedWork.alternate !== null &&
    completedWork.alternate.child === completedWork.child;

  let newChildLanes = NoLanes;
  let subtreeFlags = NoFlags;

  if (!didBailout) {
      // 这样的话，总是 child fiber 肯定不是同一个
      let child = completedWork.child;
      while (child !== null) {
        newChildLanes = mergeLanes(
          newChildLanes,
          mergeLanes(child.lanes, child.childLanes),
        );

        subtreeFlags |= child.subtreeFlags;
        subtreeFlags |= child.flags;

        child.return = completedWork;
        child = child.sibling;
      }

    completedWork.subtreeFlags |= subtreeFlags;
  } else {
    let child = completedWork.child;
      while (child !== null) {
        newChildLanes = mergeLanes(
          newChildLanes,
          mergeLanes(child.lanes, child.childLanes),
        );

        subtreeFlags |= child.subtreeFlags & StaticMask;
        subtreeFlags |= child.flags & StaticMask;
        child.return = completedWork;

        child = child.sibling;
      }

    completedWork.subtreeFlags |= subtreeFlags;
  }

  completedWork.childLanes = newChildLanes;

  return didBailout;
}
```     

所以，总是一串操作完，completeWork(img) 生成了 img dom 元素，绑定在对应的 fiber 节点上。    

目前 fiber(img) 上有 `Update` 的 flags。   

### completeWork(Edit)    

```ts
const newText = newProps;
if (current && workInProgress.stateNode != null) {
    const oldText = current.memoizedProps;
    updateHostText(current, workInProgress, oldText, newText);
} else {
    const rootContainerInstance = getRootHostContainer();
    const currentHostContext = getHostContext();
    const wasHydrated = popHydrationState(workInProgress);
    workInProgress.stateNode = createTextInstance(
        newText,
        rootContainerInstance,
        currentHostContext,
        workInProgress,
    );
}
bubbleProperties(workInProgress);
return null;
```   

#### updateHostText   

```ts
function updateHostText(
    current: Fiber,
    workInProgress: Fiber,
    oldText: string,
    newText: string 
) {
    // If the text differs, mark it as an update. All the work in done in commitWork.
    if (oldText !== newText) {
      markUpdate(workInProgress);
    }
};
```   

#### createTextInstance    

```ts
export function createTextInstance(
  text: string,
  rootContainerInstance: Container,
  hostContext: HostContext,
  internalInstanceHandle: Object,
): TextInstance {
  const textNode: TextInstance = createTextNode(text, rootContainerInstance);
  precacheFiberNode(internalInstanceHandle, textNode);
  return textNode;
}
```    

所以就是创建了个文本节点。     

### completeWork(code)

没啥。    

### completeWork(and save to reload)   

同 Edit。    

### completeWork(p)    

这个是重点，我们展开一下，这里主要是 `appendAllChildren`。这里 p 有 child。    

首先是 Edit 文本节点，直接 append，然后是 code 节点也是直接 append，最后一段文本也直接 append。然后返回。    

最后是不需要标记 Update 的，后代好像也没 flag。   

这样就直接 completeWork 完了，然后是 beginWork(a).    

### completeWork(a)    

略。    

### completeWork(header)     

类似于 p，直接看 `appendAllChildren`，也是把3个子元素直接 append。    

### completeWork(div)

略。    

### completeWork(App)    

就更没啥了。    

### complete(HostRoot)

```ts
const fiberRoot = (workInProgress.stateNode as FiberRoot);

popHostContainer(workInProgress);
popTopLevelLegacyContextObject(workInProgress);
resetMutableSourceWorkInProgressVersions();
if (fiberRoot.pendingContext) {
    fiberRoot.context = fiberRoot.pendingContext;
    fiberRoot.pendingContext = null;
}

// 空函数
updateHostContainer(current, workInProgress);
bubbleProperties(workInProgress);
```    

那就没啥，但是需要注意的是 flag 应该是浮上来了。   

我们分析一下，p 的三个元素都没 flag，img 有，a 没有，然后 header 没有，div 没有，App 有。    

那目前是有一个 img 的 Update，然后 App 应该是 Placement。然后 HostRoot 在我们删除的部分有一个 Snapshot 的 flag，还有忘了哪个地方添加了 PerformedWork flag，应该是 beginWork(App) 时候加的。   

### 总结

completeWork 和 beginWork 类似，也是根据不同的 tag，采取不同的行为，我们常见的几种类型，Function, Class, HostRoot 基本上都什么也没做，仅仅将 lanes 和 flags 进行了上浮，而 hostText 和 hostComponent 都有对应的工作。如果不存在旧 dom 节点，要进行新建，否则要比对是否有变动（对 text 来说就是文本的变动，对 hostComponent 来说就是属性的变动），如果有要打 Update 标记，如果是新建 dom 元素要 append后代元素，等等啊，那上层如何绑定了新建的 dom 元素呢。   

绑定到 updateQueue 中等待 commit 时候处理？貌似是合理的，就目前的行为来看，所有 dom 真实的变动都是离屏 dom 上产生的，而对现在已显示的 dom 的变动，都还在 updateQueue 中。   

所以 completeWork 的工作就这两个：   

- 向上浮动 lanes 和 flags
- 创建新 dom，记录变动 dom 的内容
