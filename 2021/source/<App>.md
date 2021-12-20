<App>
    <div>
        <header>blablabla</header>
        <Content>
            <p></p>
            <p></p>
        </Content>
    </div>
</App>


首先 performSyncWorkOnRoot -> renderRootSync(prepareFreshStack)，这一步 prepareFreshStack 会设置 workInProgressRoot 和
workInProgress（直接拷贝一个副本），然后 workLoopSync，然后 performUnitOfWork(workInProgress)。    

第一次 performUnitOfWork:   

```js
function performUnitOfWork(unitOfWork: Fiber): void {
    const current = unitOfWork.alternate;
    let next = beginWork(current, unitOfWork, subtreeRenderLanes);
    unitOfWork.memoizedProps = unitOfWork.pendingProps;

    if (next === null) {
        // If this doesn't spawn new work, complete the current work.
        completeUnitOfWork(unitOfWork);
    } else {
        workInProgress = next;
    }
}
```    

开始 beginWork，直接:   

```js
return updateHostRoot(current, workInProgress, renderLanes);
```   

然后里面 `processUpdateQueue` 一通处理，最后拿到了我们在 `updateContainer` 里面创建的 `update` 中 payload 的那个 element，就是 App ReactElement，然后 reconcilerChildren -&gt; reconcilerChildFiber -&gt; reconcilerSingleElement -&gt; createFiberFromElement -&gt; 返回一个 Fiber 节点。   

这时候相当于 workInProgress 的 hostRootFiber 有了一个 child 节点，就是新建的 App 的 Fiber 节点。所以对 hostRootFiber 的 beginWork，就是创建了一个子 App Fiber 节点，打上了 Placement flag。然后返回这个 child。    

开始第二次 performUnitOfWork，beginWork，走 updateClassComponent，
这里面的话先 constructInstance，然后在 mountInstance，最后 finisheInstance，最后这里会调用类的 render 方法，获取返回的 ReactElement，然后和之前一样，reconcilerChildren，create div fiber，但是这里需要注意的是这里不打 Placement 的 flag。   

最后返回 div 的 fiber 节点。   

开始这个节点的 performUnitOfWork，还是走进了 reconcilerChildren 的流程，但是这里 nextChildren 是个数组吧，然后又是一通处理，然后就走到了 header fiber。   

所以 hostRoot 的beginWork，就基本是在 updateHostRoot 拿到子元素，然后在 reconcilerChildren 中建立子元素的 fiber，而 classComponent 的 beginWork，会在 updataClassComponent 中构建类的实例对象，绑定 state 到 fiber 中，绑定 updater，然后调用 render 方法，获取子节点，构建子节点的 fiber 然后返回。   

而 hostComponent 的 beginWork 则是在 updateHostComponent 会检查下后代是不是文本节点，如果是的话就直接将后代设置为 null 了，然后返回 null，就可以开始 completeWork 了。   

header fiber 处理过程中由于 props.children 是字符串，所以 child 就是字符串，到这里，next 就是 null，进入 completeUnitOfWork 阶段，进入 completeWork，hostComponent 的 completeWork 会创建 dom 元素，绑定到 stateNode 上，还应该是会处理一些事件和属性的东西，然后返回 null 到 completeUnitOfWork，然后当前 header 有 sibling，把 sibling 赋给 workInProgress，继续下次 performUnitOfWork。    

在 beginWork 中，会将 child 返回，然后赋值给 workInProgress，从而推动 performUnitOfWork 继续执行，而当
遇到 child === null 的时候，会进入当前 workInProgress 的 completeUnitOfWork 中，会先进行当前节点的
completeWork，然后如果有兄弟节点就把 workInProgress 赋给 sibling，这样开始 sibling 的 performUnitWork。    

这里还要注意一下，beginWork 只是创建了 fiber 节点，而实际 DOM 节点是在 completeWork 中创建的。

继续流程，走到了当前 Content 的 fiber，这里我们再看一下，因为 Content 的render 返回了 Fragment。那要看下 reconcilerChildren 这里，所以 React.Fragment 的 ReactElement，对应的 $$typeof 和 type 是什么？就是 REACT_FRAGMENT_TYPE 吧，那根据代码会把 newChild = newChild.props.children。和之前 div 的情况一样吧，走数组的 reconcilerChildrenArray。然后 blabla，构建完两个 p。注意这里好像是因为子元素
是 array，所以没打 Placement flag。    

那我们看下 Content 的 completeUnitOfWork。看起来 completeWork 是啥也没干，看看后面的。Content 有 PerformedWork 的 flags，会把上层 fiber 即 div 的 fiber.firstEffect = fiber.lastEffect = fiber(Content)。然后将 wip 赋值 fiber(div)。继续 completeWork。    

这里 fiber(div) 的 completeWork 估计也只是建立 dom 元素，这里 fiber(div) 有 effect 队列，要处理一下。    

```js
import React from 'react';

class App extends React.Component {
  state = {
    list: ['A', 'B', 'C'],
  };
  onChange = () => {
    this.setState({ list: ['C', 'A', 'X'] });
  };
  componentDidMount() {
    console.log(`App Mount`);
  }
  render() {
    return (
      <>
        <Header />
        <button onClick={this.onChange}>change</button>
        <div className="content">
          {this.state.list.map(item => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </>
    );
  }
}

class Header extends React.PureComponent {
  render() {
    return (
      <>
        <h1>title</h1>
        <h2>title2</h2>
      </>
    );
  }
}
export default App;
```    

看这个列子的 update 阶段，应该是点击，触发 setState -&gt; updater.enqueueSetState -&gt; enqueueUpdate &gt; scheduleUpdateOnFiber -&gt; ensureRootIsScheduled -&gt; scheduleCallback -&gt; push -&gt; requestHostCallback -&gt; flushWrok -&gt;。    


需要注意的一点是，beginWork 中当当前节点的 lanes 不包含在 renderLanes 中时，代表当前节点不需要
更新，可以跳过当前节点的更新过程，但是子节点是可能需要更新的，这里会进入 bailOutOnAlreadyFinishedWork(current, wip, renderLanes)。    

那什么时候不从 bailOut 返回呢，看起来是所有其他情况。也就是当前节点需要更新的，那这个就是触发 scheduleUpdateOnFiber 的那个节点，那这里可能会设置后代的吧。   

首先是 hostRootFiber 的 beginWork，进入 bailOut 流程，然后进入 clnetChildFiber 流程，创建一个复制的 fiber(App) 节点，如果当前 current.child 和 wip.child 是指向同一个的。    

然后进入 fiber(app) 的 beginWork，看看干嘛了，还是进入了 updataClassComponent 流程，这次我们有 instance，有 current，进入 updateClassInstance 流程，看起来是生成了最新的 props 和 state，然后可能有对应生命周期的话，还打上了对应的 flag。然后进入 finisheClassComponent，还是调用 render 方法，然后 reconcilerChildren。   

这中情况下我们得看下 reconcilerChildren 过程了，因为现在 current 是有值的。     

淦，这里又是个 ReactFrgment 类型，可能还是走 reconcileChildrenArray 了。



