# MDN 上的 Selection 及 Range 相关内容

## Selection 概述

下面的文档中，一般选区代表一个 Range，选择代表 Selection。   

应该可以这样理解，Range 是 Selection 的一种类型，另一种是 Caret。   

一个 Selection 对象表示被用户或者当前插入符号选中的一个文本的范围。通过 `Window.getSelection()`
获取一个 Selection 对象。     

anchor 是用户开始进行选择的地方，而 focus 是用户结束选择的地方。    

## Selection 属性

均为只读属性。    

### Selection.anchorNode

返回选择开始的节点 Node。    

用户可能会从从左向右进行选择，也可能从邮箱中。anchor 是用户开始选择的那一点。    

### Selection.anchorOffset

返回选择 anchor 在 `Selection.anchorNode` 内偏移的字符数量。其实就是开始点在开始节点内的
偏移量。起始位置是0。     

如果 anchorNode 是一个文本节点，那么这个属性就是 anchor 前面的字符的数量。如果 anchorNode
是一个元素节点，那么就是 anchorNode 中位于 anchor 之前的子节点的数量。   

### Selection.focusNode

返回选择结束的节点Node。    

### Selection.focusOffset

略。   

### Selection.isCollapsed

返回一个布尔值，表明当前是否有任何的文本被选中。当选择的起始点和结束点是一个点时，就不会有任何的
文本被选中。    

### Selection.rangeCount

返回选区的数量。    

在用户点击一个新加载的页面之前，`rangeCount` 为 0。当用户点击页面后，`rangeCount` 为 1，
即便没有选中任何东西。    

用户通常在同一时刻只能有一个选区，因此一般 `rangeCount` 都为 1，不过可以通过脚本增加额外的选区。   

### Selection.type

返回一个描述当前选择类型的字符串。    

可选值有：   

- `None`: 当前没做任何选择
- `Caret`: 选择是被折叠的，其实就是通过插入符号进行的选择，一般我们点页面都是这种
- `Range`: 包含选区的选择    

一般来说，只有进行新刷新的页面，这个值才是 `None`，一旦我们点击了页面，这个值就变了，如果我们
只是随便点了一下，那这个值大概率是 Caret，除非我们进行非折叠选区的选择，才会是 Range。   

不过也有一些情况下，这个值会变为 `None`，比如说用下面的 `empty()` 或 `removeAllRanges()`
方法等。   

## Selection 方法

### Selection.addRange(range)

```js
selection.addRange(range)
```    

将一个 `Range` 对象添加到选择中。    

Note: 目前仅 FF 支持多个选区，其他浏览器当当前有一个选区的时候的不支持添加额外的新选区。   

### Selection.collapse(node, offset)

将当前的选择折叠到一点，并不会修改文档。如果当前正文获取了焦点并且可编辑，你们插入符号会在该位置
闪烁。    

```js
sel.collapse(node, offset)
```     

- `node`: 插入符号将会放置到的节点。可以将该值设为 null，如果是 null，该方法类似 `Selection.removeAllRanges()`
例如，所有的选区会从选择中移除。   
- `offset`: 可选参数，折叠点在 node 中的偏移，默认是 0     

### Selection.collapseToStart()

该方法将选择折叠到选择中的第一个 `Range` 的起始点。如果当前正文是获取了焦点并且可以编辑的，那么
插入符号会在该处闪烁。     

### Selection.collapseToEnd()

将选择折叠到选择中最后一个 `Range` 的结束处。如果当前正文是获取了焦点并且可以编辑的，那么
插入符号会在该处闪烁。     

### Selection.containsNode(node, partialContainment)

该方法检测指定的节点是否是当前选择的一部分。    

```js
sel.containsNode(node, partialContainment)
```    

- `node`: 要在选择中进行搜索的节点
- `partialContainment`: 可选参数，当为 `true` 时，`containsNode()` 在节点部分属于选择
时就返回 `true`; 当为 `false` 时，仅在整个节点都是选择的一部分时才返回 `true`。默认是 `false`   

### Selection.deleteFromDocument()

将选中的文本从 DOM 中删除。    

### Selection.empty()

`Selection.removeAllRanges()` 的别名。   

### Selection.extend(node, offset)

`extend()` 方法将选中的 `focus` 移动到指定的点，`anchor` 不动。   

```js
sel.extend(node, offset)
```    

- `node`: `focus` 将要移动到的节点
- `offset`: 可选参数，`focus` 在节点内的偏移    

需要注意的是，这里的 `offset` 以及上面的一些 `offset` 在文本节点和元素节点代表的意义是不同的，
具体的意义上面有讲过。    

### Selection.getRangeAt(index)

返回当前选择指定索引的 `Range` 对象。    

```js
range = sel.getRangeAt(index);
```    

- `range`: 返回的 `Range` 对象
- `index`: range 的索引。    

### Selection.removeRange(range)

从选择中移除一个 `Range` 对象。    

返回 `undefined`。并不是被删除的 `Range` 对象。   

### Selection.removeAllRanges()

从选择中移除所有的 `Ranges`，`anchorNode` 和 `focusNode` 变为 `null`，选择内容为空。    

### Selection.selectAllChildren(parentNode)

`selectAllChildren()` 方法将指定节点的所有子孙添加到选择中。之前的选择丢失。   

### Selection.setBaseAndExtent()

```js
sel.setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset);
```    

- `anchorNode`: 选择的起始节点
- `anchorOffset`: anchorNode 中选择起始点前的子节点的数量，这些子节点被选择排除在外。
- `focusNode`: 选择的终止节点
- `focusOffset`: focusNode 中从节点起始处开始应该包含在选择中的子节点的数量。    

这个方法相当于设置一个选区，包含两个节点中间的节点及文本。    


### Selection.setPosition()

`collapse()` 方法的别名。   

### Selection.toString()

一般来说就是选择的文本。   

相对来说，我们可以把方法分成这么几类：   

- `Range` 相关的：`addRange(), removeRange(), removeAllRanges(), empty(), getRangeAt()`
- `Collapse` 相关的：`collapse(), collapseToStart(), collapseToEnd(), setPosition()`
- 直接设置选择的：`extend(), selectAllChildren(), setBaseAndExtent()`
- 未分类的：`containsNode(), deleteFromDocument()`     

## Range 概述

`Range` 接口代表了文档上的一个片段，这个片段可以包含节点以及文本节点的一部分。   

可以通过调用 `document.createRange()` 方法创建一个 `Range` 对象，也可以通过调用 `Selection`
对象的 `getRangeAt()` 方法或者 `Document` 对象的 `caretRangeFromPoint()` 方法获取到。   

当然也可以调用 `Range` 构造函数。    

## Range 属性

均为只读属性。   

### Range.collapsed

布尔值，表明 `Range` 对象的起始点和终止点是否在同一点。   

### Range.commonAncestorContainer

返回包含了 range 对象两个边界点的最近的祖先节点。    

### Range.endContainer

返回 range 对象终止点所在的节点。    

### Range.endOffset

如果 `endContainer` 是一个 Text，Comment 节点，那么 offset 就是从 `endContainer` 起始点
开始到 range 对象边界点的字符数。对于其他的节点类型，offset 是这两者之间的子节点的数量。   

### Range.startContainer

略。注意这里和 selection 中的 anchorNode 不同，anchorNode 是选择的起始点，如果用户从右向
左进行选择的话，anchorNode 是在后面，但是这个 `startContainer` 其实还是两个端点在文档中的
顺序，文档顺序在前的是 `startContainer`   

### Range.startOffset

略。   

## Range 方法

### 构造函数 Range()

返回一个 range 对象，起始和终止是整个 Document 对象。   

### setStart(startNode, startOffset)

```js
range.setStart(startNode, startOffset);
```    

设置 range 对象的起始位置，同样，对于不同的节点类型，offset 代表的含义不同。    

### setEnd(endNode, endOffset)

设置 range 对象的终止位置。    

### setStartBefore(referenceNode)

相对于另一个节点的位置设置 range 对象的起始点。最终，range 对象起始点和 referenceNode 的父节点
是相同的。   

### setStartAfter(referenceNode)

略。    

### setEndBefore(referenceNode)

略。   

### setEndAfter(referenceNode)

略。   

### selectNode(referenceNode)

大意和名字一样，就是将 range 对象设置为包含 reference 节点及其内容。最终的效果就是 range 对象
的起始点和终止点的父节点和 referenceNode 的父节点是相同的。  

```js
range.selectNode(referenceNode);
```    

### selectNodeContents(referenceNode)

将 range 对象设置为包含 Node 内容的 range。    

range 对象的起始点和终止点的父节点都是 referenceNode。   

```js
range.selectNodeContents(referenceNode);
```    

### collapse(toStart)

该方法将 range 对象折叠到端点中的一个。   

```js
range.collapse(toStart);
```    

- `toStart`: 可选参数，`true` 表示折叠到起始点。    

### cloneContents()

返回一个 `DocumentFragment`，包含了 `Range` 中的内容的副本。   

使用 DOM 事件绑定的事件监听器不会被复制，HTML 事件属性会被复制。HTML id 属性也会被复制，这
可能会导致一个无效的文档。    

### deleteContents()

从文档中移除 range 的内容。   

### extractContents()

类似 `deleteContents`，但是会将移除的内容作为一个 `DocumentFragment` 返回。    

使用 DOM 事件绑定的监听器在导出期间不会被保留，html 属性的事件会被保留，id 也一样。    

如果包含一个节点的部分，那么会将节点的父标签复制下来，这样最终的 fragment 才是有效的。    

```js
documentFragment = range.extractContents();
```     

### insertNode(newNode)

在 range 的起始点插入一个节点。   

### surroundContents(newParent)

将 range 的内容移动到一个新节点中，然后将新节点放置到指定的range起始处。其实就是包一层呗。   

这个方法基本上等同于 `newNode.appendChild(range.extractContents()); range.insertNode(newNode)`   

### compareBoundaryPoints(how, sourceRange)

将 range 于另一个 range 的两个边界点进行比较。   

```js
compare = range.compareBoundaryPoints(how, sourceRange);
```   

- 返回值 `compare`: 一个数字，-1, 0 或 1。即 range 的边界点是否分别在 `sourceRange` 边界
点的之前、等于或者之后。
- `how`: 一个表示比较方法的常量：
  + `Range.END_TO_END`: 比较两个 range 对象的终止边界点
  + `Range.END_TO_START`: 将 range 对象的起始点和 `sourceRange` 对象的终止点进行比较
  + `Range.START_TO_END`: 将 range 对象的终止点和 `sourceRange` 对象的起始点进行比较
  + `Range.START_TO_START`: 比较两个 range 对照的起始边界点
- `sourceRange`: 和 range 对象进行比较的对象

### cloneRange()

返回一个新的 range 对象，其边界点与原 range 对象相同。    

```js
clone = range.cloneRange();
```   

### detach()

这个方法仅为兼容性所做。该方法禁用掉 range 对象，从而让浏览器可以释放相关的资源。   

### comparePoint(referenceNode, offset)

判断 range 对象与 `referenceNode` 的位置关系，返回 -1, 0 或 1。   

如果 `referenceNode` 是一个 Text 或 Comment 节点类型，`offset` 就是从 `referenceNode`
开始的字符的数量，如果是其他节点类型，就是子节点的数量。   

```js
returnValue = range.comparePoint(referenceNode, offset);
```    

### createContextualFragment()

老是说并没有看懂，貌似和 `createDocumentFragment` 差不多用来创建一个 `documentFragment`
的，其他的作用还没看懂。    

```js
documentFragment = range.createContextualFragment(tagString);
```   

- 要被转换成 document fragment 的包含html标签和文本的文本内容    

### getBoundingClientRect()

```js
boundingRect = range.getBoundingClientRect();
```    

### getClientRects()

```js
rectList = range.getClientRects();
```    

### intersectsNode(referenceNode)

返回一个布尔值，表明 range 是否与 referenceNode 相交。   

```js
bool = range.intersectsNode(referenceNode);
```     

### isPointInRange(referenceNode, offset)

返回一个布尔值，表明指定点是否在 range 内。    

```js
bool = range.isPointInRange(referenceNode, offset);
```    