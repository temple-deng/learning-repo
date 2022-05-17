## ref

<!-- TOC -->

- [ref](#ref)
  - [coerceRef](#coerceref)
  - [commitMutationEffectsOnFiber](#commitmutationeffectsonfiber)
  - [commitAttachRef](#commitattachref)
  - [commitDetachRef](#commitdetachref)

<!-- /TOC -->

第一节我们专门讲讲 ref，把前面的例子改动一下。    

```tsx
class App extends PureComponent {
  constructor(props) {
    super(props);
    this.ref = createRef();
  }

  handleClick = () => {
    console.log('clicked');
    console.log(this.ref);
  }

  render() {
    return (
      <div className="App">
        <header className="App-header" ref={this.ref}>
          <img src={logo} className="App-logo" alt="logo" />
          <p onClick={this.handleClick}>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }
}
```  

首先我们从 `createRef` 开始。   

```ts
function createRef(): RefObject {
  const refObject = {
    current: null,
  };
  return refObject;
}
```   

就是返回了个对象。    

然后我们我们进入 work 流程，首先看看 beginWork(App) 的上层，即 HostRoot 的 reconcileChildren。最后进入了 `reconcileSingleElement`。      

```ts
const created = createFiberFromElement(element, returnFiber.mode, lanes);
// 这个貌似是对 ref 属性进行检查，避免一些错误的用法，然后返回处理后的 ref
created.ref = coerceRef(returnFiber, currentFirstChild, element);
created.return = returnFiber;
return created;
```   

当进行 beginWork(div) 的时候，要构建 header 的 fiber 节点，不过 ref 是对象，所以在 `coerceRef` 中直接返回了。后面看了一下在 `updateHostComponent` 的时候就有 `markRef` 的操作。       

然后就是 completeWork 了，在 HostComponent 结尾的时候有:   

```ts
if (workInProgress.ref !== null) {
  // If there is a ref on a host node we need to schedule a callback
  markRef(workInProgress);
}
```    

就是打上了 Ref 标签。   

重新整理一下，上面说的不太对。首先在 beginWork `updateHostComponent` 的时候就有打 Ref 的功能，只不过这里打 ref 是有条件的：   

```ts
function updateHostComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
) {
  pushHostContext(workInProgress);
  const type = workInProgress.type;
  const nextProps = workInProgress.pendingProps;
  const prevProps = current !== null ? current.memoizedProps : null;

  let nextChildren = nextProps.children;
  const isDirectTextChild = shouldSetTextContent(type, nextProps);

  if (isDirectTextChild) {
    nextChildren = null;
  } else if (prevProps !== null && shouldSetTextContent(type, prevProps)) {
    workInProgress.flags |= ContentReset;
  }

  markRef(current, workInProgress);
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}

function markRef(current: Fiber | null, workInProgress: Fiber) {
  const ref = workInProgress.ref;
  if (
    (current === null && ref !== null) ||
    (current !== null && current.ref !== ref)
  ) {
    // Schedule a Ref effect
    workInProgress.flags |= Ref;
  }
}
```   

在没有 oldFiber 或者 ref 引用有变动的时候就打上 Ref 标记。   

而在 completeWork 中也是分情况的，如果已经有 dom 节点了，在 ref 变动的时候才打 flag，而没有 dom 节点的时候则一直打。   

那就看 commitRoot 里了。    

Ref 的 flag 在 `MutationMask` 和 `LayoutMask` 中，看下有做什么功能没有。   

### coerceRef   

```ts
function coerceRef(
  returnFiber: Fiber,
  current: Fiber | null,
  element: ReactElement,
) {
  const mixedRef = element.ref;
  if (
    mixedRef !== null &&
    typeof mixedRef !== 'function' &&
    typeof mixedRef !== 'object'
  ) {
    // header 的 _owner 好像是 fiber(App)
    if (element._owner) {
      const owner: Fiber = (element._owner as any);
      let inst;
      if (owner) {
        const ownerFiber = ((owner as any) as Fiber);

        if (ownerFiber.tag !== ClassComponent) {
          throw new Error(
            'Function components cannot have string refs. ' +
              'We recommend using useRef() instead. ' +
              'Learn more about using refs safely here: ' +
              'https://reactjs.org/link/strict-mode-string-ref',
          );
        }

        inst = ownerFiber.stateNode;
      }

      if (!inst) {
        throw new Error(
          `Missing owner for string ref ${mixedRef}. This error is likely caused by a ` +
            'bug in React. Please file an issue.',
        );
      }
      // Assigning this to a const so Flow knows it won't change in the closure
      const resolvedInst = inst;

      if (__DEV__) {
        checkPropStringCoercion(mixedRef, 'ref');
      }
      const stringRef = '' + mixedRef;
      // Check if previous string ref matches new string ref
      if (
        current !== null &&
        current.ref !== null &&
        typeof current.ref === 'function' &&
        current.ref._stringRef === stringRef
      ) {
        return current.ref;
      }
      const ref = function(value) {
        let refs = resolvedInst.refs;
        if (refs === emptyRefsObject) {
          // This is a lazy pooled frozen object, so we need to initialize.
          refs = resolvedInst.refs = {};
        }
        if (value === null) {
          delete refs[stringRef];
        } else {
          refs[stringRef] = value;
        }
      };
      ref._stringRef = stringRef;
      return ref;
    } else {
      if (typeof mixedRef !== 'string') {
        throw new Error(
          'Expected ref to be a function, a string, an object returned by React.createRef(), or null.',
        );
      }

      if (!element._owner) {
        throw new Error(
          `Element ref was specified as a string (${mixedRef}) but no owner was set. This could happen for one of` +
            ' the following reasons:\n' +
            '1. You may be adding a ref to a function component\n' +
            "2. You may be adding a ref to a component that was not created inside a component's render method\n" +
            '3. You have multiple copies of React loaded\n' +
            'See https://reactjs.org/link/refs-must-have-owner for more information.',
        );
      }
    }
  }
  return mixedRef;
}
```   

### commitMutationEffectsOnFiber   

在 mutationEffects 中有：   

```ts
  if (flags & Ref) {
    var current = finishedWork.alternate;

    if (current !== null) {
      commitDetachRef(current);
    }
  }
```   

初次创建相当于什么都没做，那就看 commitLayoutEffects。   

在 commitLayoutEffectsOnFiber 结尾有对 `commitAttachRef` 的调用。   


### commitAttachRef   

```ts
function commitAttachRef(finishedWork: Fiber) {
  const ref = finishedWork.ref;
  if (ref !== null) {
    const instance = finishedWork.stateNode;
    let instanceToUse;
    switch (finishedWork.tag) {
      case HostComponent:
        // 直接返回 instance
        instanceToUse = getPublicInstance(instance);
        break;
      default:
        instanceToUse = instance;
    }

    if (typeof ref === 'function') {
      let retVal;
      if (
        enableProfilerTimer &&
        enableProfilerCommitHooks &&
        finishedWork.mode & ProfileMode
      ) {
        try {
          startLayoutEffectTimer();
          retVal = ref(instanceToUse);
        } finally {
          recordLayoutEffectDuration(finishedWork);
        }
      } else {
        retVal = ref(instanceToUse);
      }
    } else {
      // 走了这，就酱
      ref.current = instanceToUse;
    }
  }
}
```   

嗯基本上就这些，这样就绑定上了。    

我们看下如果更新是怎么处理的。假设现在 App 触发了更新。  

首先是 beginWork(hostRoot)，应该是直接进入 bailOut 了，但是子节点有更新，进入 cloneChildFibers 了。返回复制的 fibers，然后呢，beginWork(App)。然后继续下面的，到了 header 的beginWork，需要注意的是这里在 beginWork(App) 的时候就可以重用后面的节点了。那就是在 beginWork 中还是没干什么。还是在 commitRoot 中起作用的。    

需要注意的一点是，这里好像没打 Ref flag 啊。那就直接不动了吧。通过调试确实没调用 `commitAttachRef`，那我们这里思考一下。   

以 HostComponent 为例，什么时候会需要更新 ref 呢，貌似大部分情况下都不用改，那就先这样吧。   

### commitDetachRef

```ts
function commitDetachRef(current: Fiber) {
  const currentRef = current.ref;
  if (currentRef !== null) {
    if (typeof currentRef === 'function') {
      if (
        enableProfilerTimer &&
        enableProfilerCommitHooks &&
        current.mode & ProfileMode
      ) {
        try {
          startLayoutEffectTimer();
          currentRef(null);
        } finally {
          recordLayoutEffectDuration(current);
        }
      } else {
        currentRef(null);
      }
    } else {
      currentRef.current = null;
    }
  }
}
```    