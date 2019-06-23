# execCommand (2019-03-22) 非官方草稿

## 1. 命令

## 1.1 命令的属性

该规范定义许多的命令，这些命令使用大小写不敏感的字符串用来标识。每条命令都有一些数据与其关联：   

- **Action**: 当调用 `execCommand()` 时命令具体会做什么，本规范定义的每条命令都有一个相关的
action，该 action 在对应的小节中会有具体的定义。例如，`bold` 命令的 action 通常是使当前
选区变为粗体，或者如果当前选区已经是粗体的话就移除其粗体。action 可能会返回 true 或 false，
这个返回值会影响 `execCommand()` 的返回值。   
- **Indeterminate**: `queryCommandIndeterm()` 的返回值，一个布尔值，取决于当前的状态。通常
来说，如果一条命令是包含 state 定义的，如果这个 state 仅对部分选区而不是全部选区是 true
的话，那么该命令就是 `indeterminate`。如果一条命令是包含一个 `value` 定义的，如果选区的不同
部分包含有不同的 values，你们这个命令就是 `indeterminate`。目前来看好像浏览器不支持。
- **State**: 由 `queryCommandState()` 返回的一个布尔值，取决于当前温度的状态。如果命令的
状态在某种意义上特定于命令，则该命令的状态为真。大部分包含有 state 定义的命令会根据 state 为
true 或者 false 采取相反的 action。例如，bold 命令如果 state 为 false 就加粗，否则就取消
加粗。另外一些命令在 state 为 true 的时候可能不会有任何效果，例如 `justifyCenter` 命令。
- **Value**: `queryCommandValue()` 返回的字符串。如果一个命令可以修改的属性的属性值可以为
两个及以上的值，那么通常这个命令会有一个 value 属性而不是 state 属性。如果命令是 indeterminate，
你们 value 通常是选区开始的值。否则，在大部分情况下，整个选区的 value 为 true。
- **Relevant CSS property**: 对于特定的行内格式化命令定义的。     

## 2. 查询和执行命令的方法

当调用 `document.execCommand(command, show UI, value)` 方法时，用户代理必须运行以下的步骤：   

1. 如果只提供了一个参数，`show UI` 参数为 false。
2. 如果提供了一个或两个参数，`value` 为空字符串。
3. 如果命令不支持或不被 enabled，返回 false
4. 如果命令不属于 Miscellaneous commands 一节中的命令：
  - 令 affected editing host 为 range 的 startContainer 和 endContainer 最近的共同
  的 editing host 元素，有两个注意点，一个是 editing host 元素，另一个点就是 editing host
  都是元素节点，而不是所有的节点类型均可。
  - 使用 `EditingBeforeInputEvent` 接口在 affected editing host 上分派一个事件。事件
  的 type 属性为 "beforeinput", command 属性就是命令名，value 属性是 value 值。
  - 如果上一步操作返回 false，那么返回 false，话说上一步不是分派事件吗，哪来的返回值，意思是
  分派事件可能会失败？但是根据下面的描述，看起来更可能是监听函数返回 false
  - 如果 command 不是 enabled，返回 false（这里之所以再次进行检查，因为 beforeinput 监听
  函数可能会进行一些操作导致命令不可用，例如 `removeAllRanges()`
  - 和第一步一样，重新计算 affected editing host，这个 affected editing host 是用来触发
  input 事件的，之所以重新计算一次，理由和上面的差不多。
5. 执行命令的 action，将 `value` 作为参数传递
6. 如果上一步返回 false, 返回 false
7. 如果命令不属于 Miscellaneous commands 一节中的命令，使用 `EditingInputEvent` 接口
在 affected editing host 上分派一个事件，事件的 type 为 "input"，command 为命令名，
value 为 `value` 参数。
8. 返回 true

## 3. 通用的定义

prohibited paragraph child name 是指 "address", "article", "aside", "blockquote",
"caption", "center", "col", "colgroup", "dd", "details", "dir", "div", "dl", "dt",
"fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5",
"h6", "header", "hgroup", "hr", "li", "listing", "menu", "nav", "ol", "p", "plaintext",
"pre", "section", "summary", "table", "tbody", "td", "tfoot", "th", "thead", "tr",
"ul", or "xmp".     

上面的这些元素其实都是不能为 p 元素后代的元素，如果出现在 p 的后代中，则会自动闭合 p 标签。   

而一个 prohibited paragraph child 则是一个元素名为上面 prohibitd paragraph child name
的元素。    

一个 block node 指一个 display 属性不为 inline, inline-block, inline-table, none 的
HTML 元素，或者是 document 元素或 documentFragment 元素。    

一个 inline node 元素是非 block node 元素。   

editing host 就是一个 contentediable 不是 false 的HTML元素节点。   

还有一些节点被称为 editable，但是并不属于 editing host，貌似这样的节点和 editing host 的
区别就是它不是一个HTML元素节点，我觉得可能就像 text 节点这样的东西。    

collapsed line break 即一个 br 元素，生成一个零高的空行。那么我觉得可以理解的简单一点，如果
br元素没能单独占据一个带有高度的行，即定义所说的生成的行是零高的，那就是一个 collapsed line break。
典型的例如一段文本追尾的一个br元素。      

extraneous line break 是一个没有任何视觉效果的 br 元素，将其从 DOM 中删除时不会修改布局。
直译的话叫做无关的换行符。   

所以，感觉根据定义来看，两者可能是交叉的，而并非互斥的，就比如说 `<p>foo<br></p>` 这个 br
应该是属于两者都是的。但是 `<p><br></p>` 又属于两者都不是的。    

然后，visible 可见的定义：一个 block node，或者是非 collapsed whitespace node 的文本节点，
或者 img 节点，或者一个非 extraneous line break 的 br，以及所有包含有 visible 后代的节点。   

collapsed block prop 是一个 collapsed line break，且非 extraneous line break，或者
是一个inline 元素节点，其子孙均是不可见的，或者其子孙均是 collapsed block prop，不过其
必须有一个孩子节点是一个 collapsed block prop。    

collapsed block prop 类似 `<p><br></p>` 中的 `<br>` 或者是 `<p><span><br></span></p>`
中的 `<br>` 和 `<span>`。这些元素在 p 标签中没有任何内容时，可以阻止块高度为0。   

所以也就是说 collapsed block prop 可能是一个 br 元素，也可能是一个 inline 元素。   

active range 是指通过调用 `getSelection()` 获取到的 selection 上的一个 range 对象。   

每个 HTMLDocument 对象都有一个相关联的 CSS styling flag 布尔属性，初始化为 `false`。可以
使用 `execCommand('styleWithCSS')` 和 `queryCommandValue('styleWithCSS')` 用来修改
或者查询这个属性。    

同时每个 HTMLDocument 对象还有另外一个相关联的 defalut single-line container name 字符串
属性，初始化为 `"div"`。可以使用 `execCommand('defaultParagraphSeparator')` 和
`queryCommandValue('defaultParagraphSeparator')` 用来修改或者查询这个属性。     

对于一些指令来说，每个 HTMLDocument 对象还有一个布尔的 state override 和/或一个字符串的
value override 属性，这些属性不会修改命令的 `state` 或 `value`，但是会修改某些算法的行为。
初始时，每条命令的两者都为未设置状态，当 range 对象的数量，以及range 对象的边界发生变动时，
这两个属性会被重置为未设置状态。

这两个属性的主要目的是在，当用户在一个折叠的选区执行一条命令，例如 `bold` 命令，然后在不移动
插入符的情况下输入一些内容，期望新输入的内容会有给定的命令的效果。因此，`bold` 命令设置 state
override 和 value override，`insertText` 就会检查这两个属性，然后将他们应用到新插入的文本。    

## 4. 通用算法

## 4.1 各种通用算法

将一个节点移动到新的位置，而 range 不变，将其从其父节点中移除然后插入到新的位置。当进行这样的
操作时，使用下面的算法而不是 insert 和 remove 算法中定义的步骤：    

1. 令 `node` 等于被移动的 node，`old parent` 和 `old index` 为老的父节点及索引，`new parent`
和 `new index` 为新的父节点和索引。
2. 如果一个边界点所处的节点是 `node` 或者是 `node` 的后代，就保持不变，以便将其移动到新的位置
3. 如果一个边界点所处的节点是 `new parent` 并且其 offset 大于 `new index`，则其 offset
加1
4. 如果一个边界点所处的节点是 `old parent` 并且其 offset 是 `old index` 或 `old index + 1`，
令这个节点为 `new parent` 并且将 offset 加上 `new index - old index`。
5. 如果一个边界点所处的节点是 `old parent` 并且其 offset 是大于 `old index + 1`，则其
offset 减1。     

如果要给一个元素设置一个新的标签名：    

1. 如果元素是一个HTML元素，且其名称就是 `new name` 要设置的新标签名，则直接返回元素
2. 如果元素的父节点为 null，返回元素
3. 令 `replacement element` 为调用 `createElement(new name)` 的结果
4. 在元素前插入 `replacement element`。
5. 将元素的所有属性按序复制给 `replacement element`
6. 当元素有子节点时，令元素的第一个子节点 append 到 `replacement element` 中，保持 range
不变
7. 从元素父元素中移除元素
8. 返回 `replacement element`

如果想要移除一个节点 `node` 前的 extraneous line break：    

例如 `foo<br><p><bar></p>` 中的 `<br>`，我们可能希望移除 br 元素以使内容简介。    

1. 令 `ref` 为 `node` 的前兄弟节点
2. 如果 `ref` 为 null，放弃下面的步骤
3. 当 `ref` 有子孙时，令 `ref` 为其最后一个孩子
4. 当 `ref` 不可见且不是一个 extraneous line break，并且 `ref` 不等于 `node` 的父节点
时，令 `ref` 为 DOM 树中 `ref` 前的节点
5. 如果 `ref` 是 editable extraneous line break，将其从其元素中删除      

如果想要移除一个节点 `node` 前的 extraneous line break：   

暂时先略。    

## 4.2 包裹一个节点列表

如果要将一些连续的节点列表 `node list` 包裹一下，执行下面的算法。除了 `node list` 外，算法
还接受两个输入：一个 sibling criteria 算法接受一个节点作为输入，输出一个布尔值，另一个 new
parent instructions 输出一个节点或者 null。如果不提供的话，sibling criteria 返回 false，
new parent instructions 返回 null。    

这个算法基本上做两件事。首先，搜索 `node list` 中的节点的前后兄弟。如果这两个兄弟中的一个或者
两个运行 sibling criteria 算法后返回 `true`，那么将 `node` 添加到 sibling 中。否则，运行
new parent instructions，然后返回的结果用来包裹 `node list`.    

1. 如果 `node list` 中的每个成员都是不可见的，并且也没有 br 元素，返回 null 并放弃后面的步骤。
2. 如果 `node list` 的第一个成员的父节点是 null，返回 null 并放弃后面的步骤。
3. （追尾的 br 应该和他们所在的那行一起，否则如果将其包裹在一个块元素中会创造一个空白行）如果
`node list` 最后一个成员是一个非 br 的内联 node，`node list` 最后一个成员的后兄弟是一个 br，
将这个 br append 到 `node list` 中
4. 如果 `node list` 的第一个成员的前兄弟是不可见的，将其 prepend 到 `node list` 中。
5. 如果 `node list` 的最后一个成员的后兄弟是不可见的，将其 append 到 `node list` 中。
6. 如果 `node list` 的第一个成员的前兄弟是 editable 并且运行 sibling criteria 返回 true，
令这个兄弟为 `new parent`
7. 否则，如果 `node list` 的最后一个成员的后兄弟是 editable 并且运行 sibling creiteria
返回 true，令 `new parent` 为这个兄弟。
8. 否则，运行 new parent instructions，令 `new parent` 为算法的结果
9. 如果 `new parent` 为 null，放弃这些步骤并返回 null
10. 如果 `new parent` 的父节点为 null：
  - 将 `new parent` 插入到 `node list` 中的第一个成员的所处 DOM 位置的前面
  - 如果任何 range 的边界点所处的节点等于 `new parent` 的父节点，并且 offset 等于 `new parent`
  的 index，则 offset 加 1
11. 令 `node list` 第一个成员的父节点为 `original parent`。
12. 如果 `new parent` 在 DOM 树中的顺序在 `node list` 第一个成员的前面：
  - 如果 `new parent` 不是一个内联节点，但是 `new parent` 的最后一个可见孩子和 `node list`
  中第一个可见成员都是内联节点，并且 `new parent` 的最后一个孩子不是 br，则调用 `createElement("br")`
  并将其 append 到 `new parent` 中
  - 对于 `node list` 中的每一个 `node`，将 `node` append 到 `new parent` 中，维持选区
  不变
13. 否则：
  - 如果 `new parent` 不是一个内联节点，但是 `new parent` 的第一个可见孩子和 `node list`
  最后一个可见成员都是内联节点，并且 `node list` 的最后一个成员不是 br，则调用 `createElement("br")`
  并将其 prepend 到 `new parent` 中
  - 对于 `node list` 中的每一个 `node`，逆序 prepend 到 `new parent` 中，维持选区不变
14. 如果 `original parent` 是 editable，并且没有子孙，将其从其父元素中移除
15. 如果 `new parent` 的后兄弟是 editable，并且运行 sibling critedit 返回 true:
  - 如果 `new parent` 不是一个内联节点，但是 `new parent` 的最后一个孩子和 `new parent`
  的后兄弟的第一个孩子都是内联节点，并且 `new parent` 的最后一个孩子不是 br，调用 `createElememt("br")`
  并将其 append 到 `new parent` 中
  - 当 `new parent` 的后兄弟有孩子，将其第一个孩子 append 到 `new parent` 中，维持选区不变
  - 将 `new parent` 的后兄弟将其从其父元素中移除
16. 从 `new parent` 中移除 extraneous line breaks。
17. 返回 `new parent`     

## 4.3 Allowed children

name of an element with inline contents 是 "a", "abbr", "b", "bdi", "bdo", "cite",
"code", "dfn", "em", "h1", "h2", "h3", "h4", "h5", "h6", "i", "kbd", "mark", "p",
"pre", "q", "rp", "rt", "ruby", "s", "samp", "small", "span", "strong", "sub",
"sup", "u", "var", "acronym", "listing", "strike", "xmp", "big", "blink", "font",
"marquee", "nobr", or "tt"。    

element with inline contents 是一个标签名为上面中一个的 HTML 元素。     

一个节点或者一个字符串 `child` 如果在运行了下列的算法返回true，则称他们为一个节点或者字符串 `parent`
的allowed child:    

1. 如果 `parent` 是 "colgroup", "table", "tbody", "thead", "tr"，并且 `child` 是一个
Text 节点且其不仅仅包含空白字符串，返回 false。
2. 如果 `parent` 是 "script", "style", "plaintext", "xmp"，且 `child` 是非 Text 节点，
返回 false
3. 如果 `child` 是 document, documentFragment, documentType 返回 false
4. If child is an HTML element, set child to the local name of child.
5. 如果 `child` 不是一个字符串，返回 true
6. 如果 `parent` 是一个元素：
  - 如果 `child` 是 a，并且 `parent` 或者 `parent` 的某些祖先是 a，返回 false
  - 如果 `child` 是一个 prohbited paragraph child name 并且 `parent` 或者 `parent`
  的一些祖先是一个 element with inline contents，返回 false
  - 如果 `child` 是 h1-h6，并且 `parent` 或者 `parent` 的某些祖先是 h1-h6 返回false
  - 令 `parent` 为 `parent` 的标签名
7. 如果 `parent` 是一个元素或者 documentFragment 返回 true
8. 如果 `parent` 不是一个字符串，返回 false
9. 如果 `parent` 在下列列表中的左手边，且 `child` 是在右手边，则返回 true 否则返回 false
  - colgroup: col
  - table: caption, col, colgroup, tbody, td, tfoot, th, thead, tr
  - tbody, tfoot, thead: td, th, tr
  - tr: td, th
  - dl: dt, dd
  - dir, ol, ul: dir, li, ol, ul
  - hgroup: h1, h2, h3, h4, h5, h6
10. 如果 `child` 是 body, caption, col, colgroup, frame, frameset, head, html,
tbody, td, tfoot, th, thead, tr 返回 false
11. 如果 `child` 是 dd 或者 dt 并且 `parent` 不是 dl，返回 false
12. 如果 `child` 是 li, 且 `parent` 不是 ol, ul，返回 false
13. 如果 `parent` 在下列列表中的左手边，且 `child` 是在右手边，返回 false:
  - a: a
  - dd, dt: dd, dt
  - h1-h6 : h1-h6
  - li: li
  - nobr: nobr
  - 所有的 names of an element with inline contents: 所有的 prohibited paragraph child
  names
  - td, th: caption, col, colgroup, tbody, td, tfoot, th, thead, tr
14. 返回 true

## 5. 行内格式化命令

### 5.1 行内格式化命令定义

一个节点 `node` 是 effectively contained 在一个范围 `range` 中，如果 `range` 不是折叠
的，且至少下面之一的条件满足：   

- `node` 包含在 `range` 中
- `node` 是 `range` 的起始点，且其是一个 Text 节点，且其长度与 `range` 的 start offset
不同
- `node` 是 `range` 的终止点，且是一个 Text 节点，其 `range` 的 end offset 为0
- `node` 至少有一个孩子，并且其所有孩子都是 effectively contained 在 `range` 中，并且
`range` 的起始点不是 `node` 的后代，或者不是一个文本节点，或者 `range` 的 start offset 为0，
并且 `range` 的终止点不是 `node` 的后代，或者不是文本节点或者 `range` 的 end offset 是
其终止节点的长度

一个 modifiable element 是一个除了 style 属性没有其他属性的 b, em, i, s, span, strike,
strong, sub, sup, u 元素，或者是一个除了 style, face, color, size 没有其他属性的 font
元素，或者是除了 style 和 href 以外没有其他属性的 a 元素。     

simple modifiable element 满足至少下面的条件之一：    

- 没有任何属性的 a, b, em, font, i, s, span, strike, strong, sub, sup, u 元素
- 只有一个没有设置任何 CSS 属性的 style 属性的 a, b, em, font, i, s, span, strike, strong, sub, sup, u 元素
- 只有一个 href 属性的 a 元素
- 只有一个 color/face/size 属性的的 font 元素
- 只有一个仅设置了 font-weight CSS 属性的 style 属性的 b, strong
- 只设置了 font-style 的 i, em
- 只设置了 text-decoration 的 a, font, span
- 只将 text-decoration 设置为 line-through, underline, overline, none 的 a, font, s,
span, strike, u

从概念上来说，simple modifiable element 即一个命令最多指定一个值的 modifiable 元素，就像
名称暗示的那样，行内格式化命令不会修改 modifiable 元素之外的任何东西。例如，`<dfn>` 元素通常
是斜体字，但不是 modifiable，因此运行 `italic` 命令不会删除掉它，而是在其中嵌入一个
`<span style="font-style: normal;">` 元素。   

formattable node 是一个可见的 editable 的文本，img 或 br 节点。注意 editing 意味着不能
是元素节点，除了这里指明的 img 和 br 元素。    

对于一条命令来说，如果两个值都为 null，或者 command 并无定义 equivalent values，且两个值
为相等的字符串，或者命令定义了 equivalent values 且两个值与这个相等，则这两个值对于这个命令
可以认为是 equivalent values。    

对于一条命令来说，如果两个值是该条命令的 equivalent values，或者如果命令是 `fontSize`：其中
一个值时 x-small, small, medium, large, x-large, xx-large, xxx-large，另一个值是 font
元素上 size 属性设置为对应的值（分别对应1-7），则这两个值对于命令来说是 loosely equivalent
values。     

如果一个命令定义了 inline command activated values，但是没有定义 indeterminate 状态的值，
则如果当前范围中有 formattable nodes effectively contained，且至少有一个 node 的 effective
command value 是给定的值，而另一个是一个不同的给定值，则该命令是处于 indeterminate。     

如果一个命令定义了 inline command activated values，如果其在当前范围内没有 formattable
node 是 effectively container，并且范围的开始节点的 effective command value 是给定值；
或者当前范围内至少有一个 formattable node effectively contained，并且这些节点的 effective
command value 都等于同一个给定值。   

### 5.2 各种行内格式化命令算法

一个节点 `node` 对于一条给定的命令 `command` 的 effective command value 可以通过以下算法
得到，其值可能是字符串或者 null：    

1. 如果 `node` 和其父节点都不是 Element，返回 null
2. 如果 `node` 不是元素，返回其父节点对于命令的 effective command value
3. 如果命令是 createLink 或 unlink：
  - 如果 `node` 非 null，但不是一个带有 href 属性的 a 元素，令 `node` 为其父节点
  - 如果 `node` 是 null，返回 null
  - 返回 `node` 的 href 的值
4. 如果命令是 backColor 或 hiliteColor:
  - 当 `node` 的 background-color 是一个完全透明的值，且 `node` 父节点是元素，令 `node`
  为其父节点
  - 返回 `node` 的 background-color
5. 如果命令是 subscript 或 superscript:
  - 令 affected by subcript 和 affected by superscript 为两个初始值为 false 的布尔值
  - 当 `node` 是一个行内节点时：
    1. 如果 `node` 是 sub，令 affected by subscript 为 true
    2. 否则，如果 `node` 是 sup，令 affected by superscript 为 true
    3. 设 `node` 为其父节点
  - 如果 affected by subscript 和 affected by superscript 都为 true 时，返回字符串
  mixed，话说怎么可能出现都是 true 的情况
  - 如果 affected by subscript 是 true， 返回 subscript
  - 如果 affected by superscript 是 true，返回 superscript
  - 返回 null
6. 如果命令是 strikethrough，且 `node` 或其任意的祖先的 text-decoration 的值包含 line-through，
返回 line-through，否则返回 nul
7. 如果命令是 underline `node` 或其任意的祖先的 text-decoration 的值包含 underline，
返回 underline，否则返回 nul
8. 返回 `node` 的相关 CSS 属性值     

其实 effective command value 有点类似 CSS 的计算值。    

一个元素 `element` 对于一条命令 `command` 的 specified command value 可以通过以下算法得到，
可能是一个字符串或者 null：     

1. 命令为 backColor 或 hiliteColor，且元素的 display 属性不为 inline，返回 null
2. 命令为 createLink 或 unlink：
  - 如果元素是一个带有 href 属性的 a 元素，返回 href 属性值
  - 返回 null
3. 命令为 subscript 或 superscript
  - 如果元素是 sub，返回 subscript
  - 如果元素是 sup, 返回 superscript
  - 返回 null
4. 命令为 strikethrough，且元素设置 text-decoration 的 style 属性：
  - 如果值为 line-through，返回 line-through
  - 返回 null
5. 命令为 strikethrough，元素为 s, strike 元素，返回 line-through
6. 命令为 underline，类似上面，除了是 u 元素
7. 令 `property` 为命令的相关的CSS属性
8. 如果属性是 null，返回 null
9. 如果元素设置了 style 属性，且其中设置了和 `property` 相关的属性，返回这个属性的值
10. font 什么的略过
11. 如果元素在下列列表中，且 `property` 等于列表中的 CSS 属性，返回列表的字符串：
  - b, strong: font-weight: "bold"
  - i, em: font-style: "italic"
12. 返回 null


当我们移动 nodes 时，我们经常改动他们的父节点。如果其父节点有设置 style 样式，则可能会同时修改
了 nodes 的样式，这通常不是我们想要的。例如，一些节点包裹在 `<blockquote style="color: red;">`，
且一个脚本运行了 outdent 命令，blockquote 将会被移除且 style 也会一并移除。如果我们希望 nodes
不发生变动，则首先应该记录子节点值，然后在恢复这些值。    

记录节点列表值的算法：    

1. 令 `values` 为三元组(node, command, specified command value)的列表，初始为空
2. 对于 `node list` 中的每个 `node`，对 subscript, bold, fontName, fontSize, foreColor,
hiliteColor, italic, strikethrough, underline 命令，按下列顺序：
  - 令 `ancestor` 等于 `node`
  - 如果 `ancestor` 不是元素节点，令其为其父节点
  - 如果 `ancestor` 是一个元素节点，且其 specified command value 是 null，令其为其父节点
  - 如果 `ancestor` 为元素节点，将 `(node, command, ancestor's specified command value)`
  添加到 `values` 中，否则添加 `(node, command, null)` 到 `values` 中
3. 返回 `values`




## 6. 块级格式化命令

### 6.1 块级格式化命令定义

indentation element 值一个 blockquote 元素，或者一个设置了 margin 属性的 div 元素。    

simple indentation element