# Redux
---

## 1.Redux的三个基本原则
1. 单一数据源：整个应用的state被存储在一棵 object tree 中，并且这个 object tree只存在于唯一一个store中。  
2. State是只读的：唯一改变 state 的方法就是触发action，action是一个用于描述已发生事件的普通对象。这样确保了视图和网络请求都不能直接修改state，相反它们只能表达想要修改的意图。  
3. 使用纯函数来执行修改：为了描述 action 如何改变 state tree， 需要编写 reducers. Reducer只是一些纯函数，它接收先前的state和action, 并返回新的state。  

## 2.Reducer
永远不要在reducer里做以下操作：  
+ 修改传入参数  
+ 执行有副作用的操作，如API请求和路由跳转  
+ 调用非纯函数，如Date.now() 或 Math.random()

只要传入参数一样，返回必须一样。  

## 3.Store
Store的职责：
+ 维持应用的state
+ 提供 getState() 方法获取state;
+ 提供 dispatch(action) 方法更新state;
+ 通过 subscribe(listener) 注册监听器；