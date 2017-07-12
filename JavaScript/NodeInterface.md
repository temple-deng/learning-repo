# Node Interface

主要介绍一些没怎么用过的接口吧。   

Node 接口是很多 DOM API 对象用来继承的一个接口。包括 `Document`, `Element`, `CharacterData`
（`Text`, `Comment`, `CDATASection` 继承这个对象）, `ProcessingInstruction`, `DocumentFragment`,
`DocumentType`, `Notation`, `Entity`, `EntityReference` 等接口都从 `Node` 上继承了属性和方法。   

注意 `Node` 又是继承自 `EventTarget` 接口。    

注意这份文档里，写节点的时候等同于 node。    

## 属性

### Node.baseURI

`Node.baseURI` 只读属性返回一个 node 节点的绝对的基础 URL。    

在大多数情况下，基础 URL 只是简单的设为了文档的地址，但是如果在 HTML中设置了 `<base>` 元素，
那么就可能会影响这个值。   

### Node.childNodes

只读属性。返回给定元素的子节点的实时的集合，第一个子节点的索引为0。   

`var nodeList = elementNodeReference.childNodes; `    

`document` 对象通常有两个子节点：Doctype 声明及根元素，通常称为 `documentElement`（在
HTML 文档中这个就是 `html` 元素）   

`childNodes` 包含所有的子节点，包括非元素节点例如文本和注释节点。注意这个属性在非 `document`
上会受文档中空白的文本节点的影响，但是好像再 `document` 上就不受。       

### Node.firstChild

只读属性。返回树中第一个子节点，如果没有子节点就返回 `null`。    

`var childNode = node.firstChild;`   

下面的例子展示了空白节点是如何干扰这个属性的：   

```html
<p id="para-01">
  <span>First span</span>
</p>

<script type="text/javascript">
  var p01 = document.getElementById('para-01');
  console.log(p01.firstChild.nodeName);
</script>
```   

在上面的例子中，会弹出 `'#text'`，因为一个维护 p 开始标签结尾到 `<span>` 标签之间空格的
文件节点被插入了进去。任何的空白都会造成文本节点的插入。    

### Node.lastChild

只读属性。返回最后一个子节点。同理也会受空白的文本节点的影响。   

### Node.nextSibling, Node.previousSibling

只读属性。返回紧跟在后面 / 前面的那个兄弟节点。或者为 `null`。   

同理，也受空白文本节点的影响。   

### Node.nodeName

只读属性。返回当前节点的名字。字符串形式。   

不同类型节点的返回值如下：   

| 接口 | nodeName 值 |
| :------------- | :------------- |
| `Attr` | `Attr.name` 的属性值，注意这个属性好像已经被废弃 |
| `CDATASection` | "#cdata-section" |
| `Comment` | "#comment" |
| `Document` | "#document" |
| `DocumentFragment` | "#document-fragment" |
| `DocumentType` | `DocumentType.name` 的值，注意这个属性好像也已经被废弃，实验时返回的是 `"html"` |
| `Element` | `Element.tagName` 的值 |
| `Entity` | entity 已被废弃 |
| `EntityReference` | entity 已被废弃 |
| `Notation` | 也已被废弃 |
| `ProcessingInstruction` | 这个貌似是在 XML 中使用，忽略了 |
| `Text` | "#text" |

### Node.nodeType

只读属性，返回节点类型的表示。    

返回一个整数，代表了节点的类型，可能的值如下：   

| 常量 | 值 | 描述 |
| :------------- | :------------- | :------------- |
| `Node.ELEMENT_NODE` | 1 | 一个元素节点 |
| `Node.TEXT_NODE` | 3 | 元素或属性节点的实际的文本 |
| `Node.COMMENT_NODE` | 8 | 一个注释节点 |
| `Node.DOCUMENT_NODE` | 9 | 一个文档节点 |
| `Node.DOCUMENT_TYPE_NODE` | 10 | 一个文档类型节点 |
| `Node.DOCUMENT_FRAGMENT_NODE` | 11 | 一个文档片段节点 |   

其他没列举出来都是被废弃了的。   

### Node.nodeValue

返回或者设置当前节点的值。    

| Attr | 属性值 |
| :------------- | :------------- |
| CDATASection | CDATASection 的内容 |
| Comment | 注释的内容 |
| Document, DocumentFragment, DocumentType,Element | null |
| Text | 文本节点的内容 |   

### Node.ownerDocument

只读属性，返回节点的顶层文档对象。不过如果当前节点本身就是这个文档对象的话，返回 `null`。   

### Node.parentNode  

只读属性，返回节点的父节点。由于 Document 和 DocumentFragment 节点永恒不会有父节点，所有
总会返回 `null`。     

### Node.parentElement

只读属性，返回节点的父级元素节点，如果没有的话就是 `null`。   

### Node.textContent

`Node.textContent` 代表了节点及其子孙的文本内容。   

```js
var text = element.textContent;
element.textContent = "this is some sample text";
```   

+ 如果节点是 Document，或者 DocumentType 返回 `null`。如果想要抓取整个文档的文本和 CDATA 数据，
可以使用 `document.documentElement.textContent`。
+ 如果节点是一个 CDATASection, Comment, 或者一个文本节点，那么就返回节点内部的文本。
+ 对于其他类型的节点，返回每个子节点的 `textContent` 的值，除 Comment 外，然后将这些值拼接起来。
+ 设置这个属性值会移除节点所有的子节点，并用一个文本节点替换他们。     

注意这个属性值会保持源文件中的格式，然后将标签全部去掉了。    

## 方法

### Node.appendChild()   

在指定的父节点的子节点尾部添加一个节点。如果给定的子节点是文档中一个已存在节点的引用的话，
`appendChild()` 会直接将该节点移动到新的位置上。    

返回添加的节点。    

### Node.cloneNode()

返回节点的副本。   

`var dupNode = node.cloneNode(deep);`  

+ `deep` 可选参数。如果需要克隆节点的子孙节点的话设置为 `ture`。注意省略这个参数的话，具体
行为是根据浏览器而定的，旧的可能默认为 `true`，新的默认为 `false`。建议不管深浅拷贝都传入
这个参数。   

注意拷贝一个节点会拷贝节点所有的属性和属性值，包括内联的监听器（指的是直接写在 HTML 属性
中的监听函数吧）。因此也需要注意如果拷贝的原始节点有 ID 等唯一识别的属性要注意修改。   

### Node.contains()

返回一个布尔值，表明是否给定的节点是当前节点的一个子孙。    

`node.contains( otherNode ) `   

### Node.getRootNode()

返回上下文对象的根 root。   

`var root = node.getRootNode(options)`   

+ `options`: 可选参数。一个对象包含获取根节点的选项。可选值有：
  - `composed`: 布尔值。表明是否 shadow root 应该返回（ `false`，默认行为），还是一个
  超出 shadow root 的根返回（`true`）
+ 一个 `Node` 节点。   

这个可能跟 shadow dom 有关吧，正常情况下应该是返回 document 对象。   

### Node.hasChildNodes()

返回一个布尔值。表明节点是否有子节点。    

### Node.insertBefore()

`var insertedNode = parentNode.insertBefore(newNode, referenceNode);`   

如果 `referenceNode` 为 `null`，则 `newNode` 插入到子节点列表的尾部。    

注意`referenceNode` 不是一个可选的参数，必须明确的传入一个节点或者 `null`。返回值是插入的节点。   

### Node.isEqualNode()

检测两个节点是否是相等的。当两个节点类型相同，定义的数据（对于元素来说，包含ID，子节点的数量等）
，其属性是否匹配等等才可以认为是相等的。需要匹配的数据根据节点类型的不同有细微差别。   

`var isEqualNode = node.isEqualNode(otherNode);`   

### Node.isSameNode()

检测两个节点是否是相同的，也就是说两个节点是否是对同一个对象的引用。   

`var isSameNode = node.isSameNode(other);`   

### Node.normalize()

将给定节点及其子树转换为一个“规范的”形式。在一个规范的子树中，没有空的文本节点，也没有相邻的
文本节点。   

`element.normalize();`   

### Node.removeChild()

从 DOM 中移除一个子节点。返回被移除的节点。   

### Node.replaceChild()

`replacedNode = parentNode.replaceChild(newChild, oldChild);`   

注意 `appendChild, insertBefore, replaceChild` 三个方法如果要插入的节点都是一个在 DOM 已存在
的节点，则会执行类似移动的行为。     


# ParentNode

`ParentNode` 接口为所有可以有子节点的 Node 对象注入了一些通用的属性和方法。Element，
Document，和 DocumentFragment 对象都实现了这个接口。   

## 属性

### ParentNode.children (read only)

返回节点所有子元素的实时集合 HTMLCollection。   

### ParentNode.firstElementChild, ParentNode.lastElementChild (read only)

返回第一个 / 最后一个子元素。   

### ParentNode.childElementCount (read only)

返回所有子元素的数量。   

## 方法

### ParentNode.append(), ParentNode.prepend()

将一个 Node 对象的集合，或者一个字符串插入到最后一个子节点后面 / 第一个子节点前面。如果
参数是字符串，那么等价于一个 Text 节点。    

```js
void ParentNode.append((Node or DOMString)... nodes);
void ParentNode.prepend(nodesToPrepend);
```   

参数应该是一个列表，但不是说是数字，就是有几个要插入的就写几个参数，每个参数都可以是一个 Node
节点或者一个字符串。   

### ParentNode.querySelectorAll()，ParentNode.querySelector()

与 document 上的应该是相同的。   

# ChildNode

ChildNode 接口为可以有父级的 Node 节点添加了新的方法。Element，DocumentType 和 CharacterData
类型实现了这个接口。   

## 方法

### ChildNode.remove()

将自己从 DOM 树中移除。   

### ChildNode.before()，ChildNode.after()

在当前节点的父级中插入一个 Node 或 字符串的集合，就插入到当前节点之前 / 之后。     

```js
void ChildNode.before((Node or DOMString)... nodes);
void ChildNode.after((Node or DOMString)... nodes);
```    

### ChildNode.replaceWith()

`void ChildNode.replaceWith((Node or DOMString)... nodes);`   

将当前节点替换为 Node 或字符串的集合。   
