# Document Interface

Document 接口代表了浏览器中加载的页面。Document 继承自 Node。    

这里我们说的 Document 专指 HTMLDocument。    

## 属性

### Document.characterSet (read only)

返回当前文档的字符编码方式。   

*Note*: `document.charset` 和 `document.inputEncoding` 是 `document.characterSet`
遗留下来的别名，尽量不要使用它们。    

### Document.compatMode (read only)

表明当前文档是在怪异模式还是在标准模式渲染的。   

+ `"BackCompat"` 或者 `"undefined"`，则文档在怪异模式
+ `"CSS1Compate"` 文档在标准模式。   

### Document.doctype (Read only)

返回文档类型声明 Document Type Declaration(DTD)。返回的对象实现了 `DocumentType` 接口。   

### Document.documentElement (Read only)

返回文档的根元素。通常来说就是 &lt;html&gt; 元素。   

### Document.documentURI (Read only)   

返回文档的位置的字符串。应该是包含search部分的。   

### Document.lastStyleSheetSet (Read only)

返回上个启用的样式表集合的名字。这个值会在 `document.selectedStyleSheetSet` 变化时变化。   

### Document.preferredStyleSheetSet (read only)

返回开发者设置的更喜欢的样式表集合。   

### Document.scrollingElement (read only)   

返回滚动文档的元素的引用。在标准渲染模式下，就是文档根元素，document.documentElement。
在怪异模式下返回 body 元素。   

### Document.selectedStyleSheetSet

设置或者返回当前使用的样式表集合的名字。也就是我，这几个相关的 API 是通过为样式表结合设置
名字操作的吧。   

### Document.styleSheets (Read only)    

返回一个 `CSSStyleSheet` 组成的 `StyleSheetList` 对象。表明文档明确内嵌或者外链的样式表。   

`StyleSheetList` 是一个有序的 `CSSStyleSheet` 对象集合。可以使用 `styleSheetList.item(index)`
或者直接 `styleSheetList[index]` 来访问单一的样式表对象。   

### Document.styleSheetSets (read only)

返回一个实时的当前可用的样式表集合的列表。   

### Document.timeline (read only)

这个属性代表了当前文档的默认时间线。这个时间线是一个特殊的 `DocumentTimeline` 实例，在页面加载
时自动创建的。   

每个文档这个时间线是独一无二的，并且在文档的生命周期内一直维持。   

### 下面的是 HTML document 的扩展

### Document.activeElement (read only)

返回当前获取焦点的元素，换句话说，当用户输入任何内容时这个元素会获取键盘事件。   

### Document.body

返回文档的 &lt;body&gt; 节点。    

```js
var objRef = document.body;
document.body = objRef;
```   

### Document.cookie

获取或者设置当前文档相关联的 cookies。    

### Document.defaultView (read only)

返回与文档相关联的 `window` 对象。    

### Document.designMode

这个属性控制整个文档是否是可编辑的。值应该是枚举值 `"on"` or `"off"`。

### Document.dir

一个字符串。代表了文档文本的方向，可选值有 `ltr`, `rtl`。这个的话好像相当于把文档翻个面，
不管是文本，整个布局都跟着旋转。   

### Document.domain

略。   

### Document.embeds, Document.plugins (read only)

略。   

### Document.forms (read only)

略。  

### Document.head (read only)

略。   

### Document.images (read only)

略。
### Document.lastModified (read only)

当前文档上次修改时间的字符串表示。   

### Document.links (read only)

返回带有 `href` 属性的所有 &lt;area&gt; 和 &lt;a&gt; 元素的集合。   

### Document.location (read only)

返回 Location 对象。虽然这个属性是只读的 Location 对象。但是还是可以赋值一个字符串给它。
等同于将字符串赋值给 `location.href`。   

### Document.readyState (read only)

描述了文档的加载状态。可选值有：   

+ loading: 文档仍在加载中。
+ interactive: 文档已经加载并解析完成，不过子资源例如图片，样式表等还在加载中。
+ complete：文档及所有子资源都加载完成。这个状态表明 `load` 事件将要触发。   

### Document.referrer (read only)

如果页面是直接导航到的，返回一个空字符串。否则是一个 URI。    

### Document.scripts (read only)

返回页面中所有的 &lt;script&gt; 元素。   

### Document.title

获取或者设置文档的标题。就是 &lt;title&gt;标签内的字符串。   

### Document.URL (read only)

返回当前文档位置的字符串。   

## 事件监听器

### Document.onfullscreenchange

`fullscreenchange` 事件的监听器属性，这个事件会在文档进入或者退出全屏模式时触发。   

### Document.onfullscreenerror

同样也是 `fullscreenchange` 事件的监听器，不过是在文档要求进入全屏模式却不成功的时候调用。    

### Document.onselectionchange

当 `selectionchange` 事件在这个对象上触发时调用。   

### Document 接口还实现了 GlobalEventHandlers 接口，所以其他的事件监听器在对应文档找吧。    

## 方法

### Document.createAttribute()

创建新的属性节点并返回。   

`attribute = document.createAttribute(name) `   

+ `name` 是属性的名字
+ Returns：一个 Attr 节点。  

### Document.createComment()

创建新的注释节点并返回。   

`CommentNode = document.createComment(data) `    

### Document.createDocumentFragment()

`var fragment = document.createDocumentFragment();`

DocumentFragment 也是 DOM 节点，然后却并不是 DOM 树的一部分。通常的使用方式是，创建
document fragment，然后为其添加子元素，然后将 document fragment 添加 DOM 树中。
在DOM 树中，document fragment 会被其所有子节点替换掉。    

### Document.createElement()

根据 `tagName` 创建元素，如果 `tagName` 是无法识别的话，会创建一个 HTMLUnknownElement。   

`var element = document.createElement(tagName[, options]);`   

+ `tagName` 一个用来指定元素类型的字符串。在创建时会将 `tagName` 转换为小写。
+ `options` 可选参数。包含一个 `is` 属性，值的话是之前使用 `customElements.define()`
自定义的元素的标签名。    

### Document.createTextNode()

创建一个新的文本节点。   

`var text = document.createTextNode(data);`    

### Document.elementFromPoint()

返回在指定坐标处最上方的元素。    

`var element = document.elementFromPoint(x, y);`   

### Document.elementsFromPoint()

返回在指定坐标出的所有元素组成的数组。   

`var elements = document.elementsFromPoint(x, y);`   

### Document.getAnimations()

`getAnimations()` 方法返回所有的当前效果目标元素是文档子孙的 `Animation` 对象组成的数组。
这个数组包括 CSS Animations, CSS Transitions, Web Animations。    

`var allAnimations = Document.getAnimations();`   

### getElementsByClassName(), Document.getElementsByTagName(),  

根据类名获取元素的方法中，一个字符串可以包含多个类名，用空格分割。`getElementsByTagName()`
如果参数是 `"*"` 的话返回所有元素。     

### Document.importNode()

为一个插入到当前文档的外部文档中的一个节点创建一个副本。   

`var node = document.importNode(externalNode, deep);`   

同理，`deep` 参数推荐一直加上，还有因为是拷贝方法，所有不会从源文档中删除原始节点。   

### document.getElementById()

略。   

### Document.querySelector(), Document.querySelectorAll()

`element = document.querySelector(selectors);`    

注意 `selectors` 是一个字符串，可以包含多组选择器，用逗号分隔。   

CSS 伪元素不会返回任何的元素。    

### 下面的方法是继承自 HTMLDocument

### Document.close()

结束在使用 `document.open()` 打开的文档中写入。   

### Document.getElementsByName()

略。    

### Document.getSelection()

这个方法等同于 `Window.getSelection()`，返回代表文档中当前选中的文本的 Selection。   

### Document.hasFocus()

返回一个布尔值。表明是否当前文档或者文档中的子元素是获取了焦点。   

### Document.open()

为了写入打开文档。   

```js
// In this example, the document contents are
// overwritten as the document
// is reinitialized on open().
document.write("<html><p>remove me</p></html>");
document.open();
// document is empty.
```   

在已加载的页面上调用 `document.write()` 会自动调用 `document.open()`，注意这个方法相当于
我们直接在文档上覆盖内容。   

### Document.write()

在使用 `document.open()` 打开的文档流中写入一个文本字符串。   

`document.write(markup);`   

不过貌似如果 `document.write()` 是在内联到 HTML 中的 &lt;script&gt; 调用的，那么就不会自动
调用 `document.open()`。   
