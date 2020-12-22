## render阶段
render阶段开始于performSyncWorkOnRoot或performConcurrentWorkOnRoot方法的调用。这取决于本次更新是同步更新还是
异步更新。我们现在还不需要学习这两个方法，只需要知道在这两个方法中会调用如下两个方法：
``` js
// performSyncWorkOnRoot会调用该方法
function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}
// performConcurrentWorkOnRoot会调用该方法
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}
```
可以看到，他们唯一的区别是是否调用shouldYield。如果当前浏览器帧没有剩余时间，shouldYield会中止循环，直到浏览器有空闲
时间后再继续遍历；workInProgress代表当前已创建的workInProgress fiber；performUnitOfWork方法会创建下一个Fiber节
点并赋值给workInProgress，并将workInProgress与已创建的Fiber节点连接起来构成Fiber树

我们知道Fiber Reconciler是从Stack Reconciler重构而来，通过遍历的方式实现可中断的递归，所以performUnitOfWork的工
作可以分为两部分：“递”和“归”

### 递阶段
首先从rootFiber开始向下深度优先遍历。为遍历到的每个Fiber节点调用beginWork方法 (opens new window)。该方法会根据
传入的Fiber节点创建子Fiber节点，并将这两个Fiber节点连接起来。当遍历到叶子节点（即没有子组件的组件）时就会进入“归”阶段

### 归阶段
在“归”阶段会调用completeWork (opens new window)处理Fiber节点。当某个Fiber节点执行完completeWork，如果其存在兄
弟Fiber节点（即fiber.sibling !== null），会进入其兄弟Fiber的“递”阶段。如果不存在兄弟Fiber，会进入父级Fiber的“归”阶段。
“递”和“归”阶段会交错执行直到“归”到rootFiber。至此，render阶段的工作就结束了

``` js
function App() {
  return (
    <div>
      i am
      <span>KaSong</span>
    </div>
  )
}
ReactDOM.render(<App />, document.getElementById("root"));

//render阶段会依次执行：
1. rootFiber beginWork
2. App Fiber beginWork
3. div Fiber beginWork
4. "i am" Fiber beginWork
5. "i am" Fiber completeWork
6. span Fiber beginWork
7. span Fiber completeWork
8. div Fiber completeWork
9. App Fiber completeWork
10. rootFiber completeWork
```
> 之所以没有 “KaSong” Fiber 的 beginWork/completeWork，是因为作为一种性能优化手段，针对只有单一文本子节点的Fiber，React会特殊处理
beginWork的工作是传入当前Fiber节点，创建子Fiber节点，我们从传参来看看具体是如何做的


## commit阶段
commitRoot方法是commit阶段工作的起点。fiberRootNode会作为传参`commitRoot(root)`

在rootFiber.firstEffect上保存了一条需要执行副作用的Fiber节点的单向链表effectList，这些Fiber节点的updateQueue中
保存了变化的props

这些副作用对应的DOM操作在commit阶段执行，除此之外，一些生命周期钩子（比如componentDidXXX）、hook（比如useEffect）
需要在commit阶段执行，commit阶段的主要工作（即Renderer的工作流程）分为三部分
- before mutation阶段（执行DOM操作
- mutation阶段（执行DOM操作）
- layout阶段（执行DOM操作后）

在before mutation阶段之前和layout阶段之后还有一些额外工作，涉及到比如useEffect的触发、优先级相关的重置、ref的绑定/解绑


## react的diff
由于Diff操作本身也会带来性能损耗，React文档中提到，即使在最前沿的算法中，将前后两棵树完全比对的算法的复杂程度为O(n 3 )，
其中n是树中元素的数量。如果在React中使用了该算法，那么展示1000个元素所需要执行的计算量将在十亿的量级范围。这个开销实在
是太过高昂，为了降低算法复杂度，React的diff会预设三个限制：
1. 只对同级元素进行Diff。如果一个DOM节点在前后两次更新中跨越了层级，那么React不会尝试复用他
2. 两个不同类型的元素会产生出不同的树。如果元素由div变为p，React会销毁div及其子孙节点，并新建p及其子孙节点
3. 开发者可以通过 key prop来暗示哪些子元素在不同的渲染下能保持稳定。考虑如下例子：
``` js
// 更新前
<div>
  <p key="ka">ka</p>
  <h3 key="song">song</h3>
</div>

// 更新后
<div>
  <h3 key="song">song</h3>
  <p key="ka">ka</p>
</div>
```
如果没有key，React会认为div的第一个子节点由p变为h3，第二个子节点由h3变为p。这符合限制2的设定，会销毁并新建。

但是当我们用key指明了节点前后对应关系后，React知道key === "ka"的p在更新后还存在，所以DOM节点可以复用，只是需要交换下顺序

### diff的实现
我们从Diff的入口函数reconcileChildFibers出发，该函数会根据newChild（即JSX对象）类型调用不同的处理函数
``` js
// 根据newChild类型选择不同diff函数处理
function reconcileChildFibers(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  newChild: any,
): Fiber | null {

  const isObject = typeof newChild === 'object' && newChild !== null;

  if (isObject) {
    // object类型，可能是 REACT_ELEMENT_TYPE 或 REACT_PORTAL_TYPE
    switch (newChild.$$typeof) {
      case REACT_ELEMENT_TYPE:
        // 调用 reconcileSingleElement 处理
      // // ...省略其他case
    }
  }

  if (typeof newChild === 'string' || typeof newChild === 'number') {
    // 调用 reconcileSingleTextNode 处理
    // ...省略
  }

  if (isArray(newChild)) {
    // 调用 reconcileChildrenArray 处理
    // ...省略
  }

  // 一些其他情况调用处理函数
  // ...省略

  // 以上都没有命中，删除节点
  return deleteRemainingChildren(returnFiber, currentFirstChild);
}
```
我们可以从同级的节点数量将Diff分为两类：
1. 当newChild类型为object、number、string，代表同级只有一个节点
2. 当newChild类型为Array，同级有多个节点

未完成待续............

[参考链接](https://react.iamkasong.com/)

