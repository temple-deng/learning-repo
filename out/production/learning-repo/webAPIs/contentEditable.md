# ContentEditable(2019.03.22)

## 1. 术语

- *editing host*: editing host 是一个 contenteditable 属性设置为非 `false` 值的一个 HTML 元素节点
- *Legal Caret Positions*: 插入符号可以编程放置到的位置。放置被限制到以下的位置中。实现必须
将插入符号放置得到以下的任意位置中：    
  1. 文本节点中任意字符的前后
  2. 一个后面的兄弟节点是一个非文本节点的内联元素之后。
  3. 一个没有前兄弟节点的内联元素之前。
  4. 在空的内联元素或者块级元素之中。
  5. 空的文本节点之中
  6. comment 节点前后
  7. 如果 editing host 为空的话，在其自身中。   
下面是这些规则的一些例外情况：
  + 在表格中，插入符号仅能放置到 TH, TD 和 CAPTION 元素中
  + 插入符号不能放置到不可见元素中（display:none）
  + 插入符号不能放置到 contentEditable 为 false 的元素中     

## 2. contenteditable

contenteditable 是一个枚举属性，可选值有空字符串 "", "events", "caret", "typing",
"plaintext-only", "true", "false"。除此之外，还有一个额外的状态，`inherit` 状态，默认没
设置这个值或者设置了一个错的值时就处于这个状态。    

空串和 "true" 都会映射到 `true` 状态，其他关键字映射到他们对应的状态。    

`false` 状态表示元素是不可编辑的。`inherit` 状态表明元素和其父元素状态相同。    

设置这个属性的时候，貌似是大小写不敏感的。然后貌似还有一个 `isContentEditable` 属性。   

## 3. 状态的含义

状态 "events", "caret", "typing", "plaintext-only", "true" 是层级排序的，因此，"caret"
状态包含 "events" 状态的功能，"typings" 状态包含 "caret" 状态的功能，依次类推。   

"events" 状态表示当用户请求一次编辑操作时会触发 `beforeinput` 事件，"caret" 添加了默认受浏览器
控制移动的插入符号，也就是说这个状态的话加了个插入符，然后可能这个插入符可以用键盘控制，
"typings" 状态没看懂，貌似是可以对键盘输入法响应的文本输入支持。"plaintext-only"
状态添加对文本节点中文本删除的支持。"true" 状态添加了通过 execCommand 命令来进行的非文本内容的
删除和编辑指令。     

现在貌似只有 true 支持的比较好，其他的貌似都不怎么支持。    

## 4. contentEditable 状态

### 4.1 contentEditable=events 状态

在我们聚焦在一个 events 状态的元素上时，如果当前选区是折叠的，则必须绘制一个插入符号，并且这个
插入符号可以通过编程放置到任何 legal caret positions。    

同时，当任何用户编辑操作进行前都会触发一个 `beforeinput` 事件。   

### 4.2 contentEditable=caret 状态

看不懂，反正应该是这种状态会出现插入符。    

### 4.3 contentEditable=typing 状态

这种状态，元素会在插入符号处对键盘文本操作进行响应，同时也应该能够对输入法的插入和删除进行响应。   

### 4.4 contentEditable=plaintext-only 状态

可以对文本删除做出响应。    

## 5. 剪切和粘贴

对于 "events", "caret", "typing" 状态来说，剪切和复制是禁止的。对于 "plaintext-only" 来说，
粘贴默认只粘贴文本。    

## 6. 插入符绘制及移动

## 6.1 插入符的绘制

插入符会在一个 editing host 聚焦且没有进行任何选择时绘制，这种情况下，插入符代表一个折叠的选区。   

## 6.2 插入符的位置

理论上插入符应该可以通过编程放置到任何 legal caret position。    

## 6.3 替换文本/内容

当用户准备使用浏览器内置的拼写检查程序或者类似的东西，希望替换某些内容时，会触发一个 `beforeinput`
事件，该事件的 `inputType` 被设置为 `replaceText` 或者 `replaceContent`。默认情况下，对
于 events, caret, typing 状态来说，不会修改DOM的任何部分。   

## 6.4 删除内容

对于 events, caret 状态来说，用户的输入不会自动删除内容。相反，如果按下了 `Del/Backspace`键，
会触发一个 `beforeinput` 事件，事件的 `inputType` 设置为 `deleteContentForward` 或者
`deleteContentBackward` 事件。这种情况对于 typing 状态来说也成立，唯一的例外情况是在进行
输入法输入时，这种情况下，如果当前要删除的字符是输入法中的一部分时，会将字符从DOM中删除。    

