# MutationObserver

<!-- TOC -->

- [MutationObserver](#mutationobserver)
    - [构造函数](#构造函数)
    - [实例方法](#实例方法)
      - [observe()](#observe)
      - [disconnect()](#disconnect)
      - [takeRecords()](#takerecords)
    - [MutationObserverInit](#mutationobserverinit)
    - [MutationRecord](#mutationrecord)

<!-- /TOC -->

`MutationObserver` 提供给开发者一种对 DOM 变动做出响应的能力。这个接口是
设计用来替换掉 DOM3 中 Mutation Events 的一个功能。    

### 构造函数

```js
new MutationObserver(
  function callback
)
```   

**callback**: 这个函数会在每次 DOM 变动后调用。观察者会传入两个参数来调用这个函数。第一个参数是一个对象的数组，每个对象都是 `MutationRecord` 类型的。第二个是 `MutationObserver` 实例。    

### 实例方法

#### observe()

在一个指定的节点上注册 `MutationObserver` 实例以便实例可以收到 DOM 变动的通知。    

```js
void observe(
  Node target,
  MutationObserverInit options
);
```  

**target**: 观察 DOM 变动的节点。    

**options**: 一个 `MutationObserverInit` 对象，声明了要报告的 DOM 变动的类型。    

*Note:* 为一个元素添加一个 observer 与使用 `addEventListener` 添加事件监听器类似，如果我们观察一个元素多次与观察一次没有什么区别。这意味着如果我们 observe 一个元素两次，observe 回调不会触发两次，并且我们也没必要调用 `disconnect()` 两次。     

#### disconnect()

停止 `MutationObserver` 实例接受 DOM 变动的通知。除非 `observe()` 方法再一次被调用，否则 observer 回调不会被触发。   

`void disconnect()`    

#### takeRecords()

清空 `MutationObserver` 实例的记录队列，并返回之前记录的内容。   

`Array takeRecords()`   

返回一个 `MutationRecords` 的数组。    

### MutationObserverInit

`MutationObserverInit` 对象可以声明以下的属性：   


属性 | 描述 
---------|----------
childList | 设置为 `true` 的话，目标节点的子元素（包含文本节点）的添加与移除也会被 observe
attributes | 设置为 `true` 的话，目标的属性的变动也会被 observe
characterData | 设置为 `true`，目标的数据（应该指 `dataset` 吧）的变动也会被 `observe`
subtree | 设为 `true`, 目标及目标的后代的变动都会被 observe
attributeOldValue | 设为 `true`，则当 `attributes` 也为 `true` 则会在属性变动前记录属性的值
characterDataOldValue | 与上面相同的原理
attributeFilter | 可以设置一个属性名字的数组，来过滤一些不需要 observe 的属性   

*Note:* 至少要把 `childList, attributes, characterData` 设置为 `true`。不然的话貌似会抛出错误。    


```js
// select the target node
var target = document.getElementById('some-id');
 
// create an observer instance
var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    console.log(mutation.type);
  });    
});
 
// configuration of the observer:
var config = { attributes: true, childList: true, characterData: true };
 
// pass in the target node, as well as the observer options
observer.observe(target, config);
 
// later, you can stop observing
observer.disconnect();
```   

### MutationRecord

`MutationRecord` 对象代表一个独立的 DOM 变动。有以下的属性：   



属性 | 类型 | 描述
---------|----------|---------
type | string | 如果是属性变动返回 `attributes`，如果是 `CharacterData` 节点变动返回 `characterData`，如果是节点树发生变动返回 `childList`
target | Node | 返回变动影响的节点，取决于 `type`，如果是属性，那么就是属性变动的那个节点，如果是 characterData，返回这个 CharacterData 节点，如果是 childList,就是子节点变动的那个节点，注意这个指定的不是变动的那个子节点，而是那个子节点发生了变动的那个上层节点
addedNodes | NodeList | 返回新加的节点，如果没有就是一个空的 NodeList
removedNodes | NodeList | 移除的节点
previousSibling | Node | 返回新增或者删除节点的前一个兄弟节点，或者是 null
nextSibling | Node | 同上
attributeName | string | 变动的属性名
attributeNameSpace | string | 命名空间
oldValue | string | 对于 `attributes`，是变动前的属性值，`characterData`是变动前节点的数据，`childList` 是 null

 
