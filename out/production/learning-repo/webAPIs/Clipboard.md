# Clipboard API and events(2019.05.13)

## 概览

这份文档描述了用于访问系统剪切板数据的 API。提供了一些操作用来覆盖默认的剪切板操作（剪切、复制
和粘贴），并且可以直接访问剪切板数据。   

## 1. 介绍

这份规范介绍了系统剪切板是如何暴露给 web 应用的。   

这份规范主要包含两部分的 API：    

- Clipboard Event API - 为通用的剪切板操作，包括剪切、复制和粘贴提供了钩子，以便 web 应用
能够按需调整剪切板的数据
- Async Clipboard API - 提供了对剪切板数据的直接的读写访问。由于这个功能被认为是太过强大的，
因此访问这个 API 需要收到权限的控制。   

## 2. Use Cases

### 2.1 修改默认的剪切板操作

在许多场景下，我们可能都希望去修改默认的剪切板操作（剪切/复制/粘贴），这里有一些例子：   

- **Metadata**。当从一份文档中复制文本时，我们可能也想要获取到文本文档的一些元数据。
- **Rich content editing**。当复制一段包含超链接或者其他结构的文本时，我们可能想要回重新组织
内容的结构，以保留那些重要的信息。
- **Graphics with built-in semantics**（具有内置语义的图片）。为了去制作一些支持富文本操作，
或者 SVG 图形内容操作的 web 应用，有必要提供一种方式允许我们从这些内容中拷贝东西。
- **Mathematical information**。对于数学之类的内容，简单地将渲染的内容复制粘贴到另一个应用
中，通常会导致大部分的语义丢失。MathML 通常在拷贝时需要进行一些转换。    

### 2.2 Remote Clipboard Synchronization

没看懂，先略。   

### 2.3 Trigger Clipboard Actions

同上。   

## 3. 术语

术语 **可编辑内容**（editable context）指那些 `contenteditable` 属性不为 false 的 HTML
元素（即 editing host），或者是 textarea 元素，或者是一个 type 属性为 "text", "search",
"tel", "url", "email", "password", "number" 的 input 元素。    

## 4. Model

系统都提供了一个系统剪切板。    

系统剪切板包括了一系列的 clipboard items，这些 items 叫做系统剪切板数据。   

- 对于 Clipboard Event API 来说，剪切板数据是通过一个 `DataTransfer` 对象暴露出来的，这个
对象是剪切板内容的一个副本
- 对于 Asynchronous Clipboard API 来说，剪切板是通过一个 `ClipboardItem` 对象的序列暴露
出来的，同样也是剪切板内容的一个副本     

## 5. 剪切板事件

### 5.1 剪切板事件接口

ClipboardEvent 接口继承了 Event 接口。    

```
dictionary ClipboardEventInit: EventInit {
  DataTransfer? clipboardData = null;
}
```    

**clipboardData**: 一个 DataTransfer 对象保存了和事件相关的数据和元数据。   

```js
var pasteEvent = new ClipboardEvent('paste');
pasteEvent.clipboardData.items.add('My string', 'text/plain');
document.dispatchEvent(pasteEvent);
```   

合成事件事实上不会真的去修改剪切板或者文档。换句话说，上面的脚本虽然触发一个 paste 事件，但是数据
不会被粘贴到文档中。    

### 5.2 剪切板事件

#### 5.2.1 clipboardchange 事件

无论何时剪切板的内容发生变化时，都会触发 clipboardchange 事件。这些改变可能由下面的原因引起的：    

- 用户的剪切或者粘贴操作
- 使用了第 7 节中异步剪切板 API 写入数据到剪切板
- 用户代理之外的更新剪切板的操作    

如果是在用户代理之外发生了剪切板内容变化，那么 clipboard 事件必须在用户代理重新获取焦点后触发。    

因为合成的 cut 和 copy 事件不会更新系统剪切板，因此不会触发 clipboard 事件。   

#### 5.2.2 copy 事件

当用户进行一个复制操作时，用户代理触发一个 copy 事件。   

如果这个事件没有被取消，当前选中的数据会被复制到剪切板中。    

copy 事件可以冒泡，可以被取消，并且可以被合成。   

可以动手构建并分发一个 copy 事件，不过其并不会影响到系统剪切板的内容。   

#### 5.2.3 cut 事件

当用户进行一次剪切操作时，用户代理会触发 cut 事件。    

在一个 editing context 中，如果这个事件没有被取消，这个操作会将当前选中的数据放置到剪切板中，并且
从文档中移除选中的部分。cut 事件在被选中内容移除前触发。当 cut 操作完成，选择会被折叠。  

在一个非 editing context 中，clipboardData 是一个空列表。注意这种情况下，cut 事件仍然会触发。   

同 copy 事件，cut 事件也会冒泡，也可以被取消，也能被合成。    

可以动手构建并分发一个 cut 事件，不过其并不会影响到文档及系统剪切板的内容。   

#### 5.2.4 paste 事件

当用户进行一个粘贴操作时，用户代理触发 paste 事件。事件会在剪切板数据插入到文档中前被触发。    

如果光标位于可编辑内容中，粘贴操作会以给定上下文最合适的格式将剪切板数据插入其中。    

粘贴操作同样对非可编辑内容没效果，但是事件仍会触发。    

可冒泡，可取消，可合成。    

### 5.3 和其他脚本及事件集成

#### 5.3.1 Event handlers that are allowed to modify the clipboard

在下面条件之一为 true 时，事件处理函数可以向剪切板中写入数据：    

- 引发此次剪切板事件的行为由用户代理自己的用户接口调用的，例如，从 "Copy" 菜单项或者快捷键（那
其实就代表这是一个用户触发的操作）
- The action which trigger the event is invoked from a scripting thread which is
allowed to show a popup。    

然后我查了一下什么叫 allowed to show a popup。好像只要下列条件之一为 true 即可：   

- 运行当前算法的 task 是正在处理一个受信任的 click 交互行为
- 运行当前算法的 task 是一个受信任的事件处理函数，事件类型包括：
  + change
  + click
  + dblclick
  + mouseup
  + reset
  + submit
- The task in which the algorithm is running was queued by an algorithm that was
allowed to show a popup, and the chain of such algorithms started within a
user-agent defined timeframe.    

有点复杂并没有看懂。   

#### 5.3.2 Event handlers that are allowed to read from clipboard

当下面条件之一为 true 时，事件处理函数可以从剪切板中读取数据：    

- 引发此次剪切板事件的行为由用户代理自己的用户接口调用的，例如，"Paste" 菜单项，或者快捷键。
- 触发了这次行为的脚本运行在一个有独立实现的机制赋予了从剪切板上读取数据的站点上。
- 触发了这次事件的行为是在一个包含读取剪切板数据权限的应用中触发的。     

#### 5.3.3 和其他富文本编辑 API 集成

如果一个实现（这里应该指的是浏览器对这份规范的实现）支持通过脚本执行剪切板命令，例如通过调用
`document.execCommand()` 方法执行 cut, copy, paste 命令，实现就必须触发对应的行为，即
会触发对应的剪切板事件。    

这个还有点内容，先暂时跳过。   

#### 5.3.4 和其他事件集成

如果剪切板操作是由键盘输入触发的，那么实现必须触发对应的事件，这个事件虽然是异步的，但是必须在
keyup 事件前触发。    

cut 和 paste 操作可能会造成实现会分发其他支持的事件，例如 textInput, change, input, validation
事件。    

## 6. Cilpboard Event API

这份 API 让我们可以覆盖用户代理默认的 cut, copy 和 paste 行为。    

### 6.1 覆盖 copy 事件

为了覆盖默认的 copy 事件的行为，必须为 copy 添加事件处理函数，并且事件处理函数必须调用
`preventDefault()` 来取消这个事件。    

必须取消了这个事件，我们才能使用 clipboardData 来更新剪切板中的数据。如果这个事件没有被取消，
就会使用当前文档中选中的内容来拷贝。    

```js
document.addEventListener('copy', function(e) {
  // e.clipboardData 一开始为空
  e.clipboardData.setData('text/plain', 'Hello, world!');
  e.clipboardData.setData('text/html', '<b>Hello, world!</b>');

  e.preventDefault();
});
```    

### 6.2 覆盖 cut 事件

同 copy，要覆盖，也必须调用 `preventDefault()` 来取消事件。而且要使用 clipboardData 更新
剪切板数据，也必须取消这个事件。    

注意取消 cut 事件同时也会阻止文档被更新（因为需要将一些内容剪切嘛）。因此，我们的处理函数可能
需要手动更新文档来创造 cut 的效果。     

### 6.3 覆盖 paste 事件

基本同上，必须取消了事件，用户代理才不会使用剪切板中的数据来更新文档。   

取消了 paste 事件会阻止文档的更新。    

```js
document.addEventListener('paste', function(e) {
  // e.clipboardData 包含了要被粘贴的数据
  if (e.clipboardData.types.indexOf('text/html') > -1) {
    var oldData = e.clipboardData.getData('text/html');
    var newData = '<b>Ha Ha!</b> ' + oldData;

    pasteClipboardData(newData);

    e.preventDefault();
  }
});
```    

### 6.4 Mandatory data types

实现必须能够识别一下数据类型在本地系统剪切板中的格式描述信息，以便能够在 paste 事件中使用正确
的描述来填充 DataTransferItemList，并且在 copy 和 cut 事件发生时能够正确地设置系统剪切板
中的数据格式。    

#### 6.4.1 从剪切板读取数据

实现必须能够暴露以下的数据类型给 paste 事件，如果系统剪切板支持对应的原生类型：    

- text/plain
- text/uri-list
- text/csv
- text/css
- text/html
- application/xhtml+xml
- image/png
- image/jpg, image/jpeg
- image/gif
- image/svg+xml
- application/xml, text/xml
- application/javascript
- application/json
- application/octet-stream

#### 6.4.2 向剪切板写入数据

当我们在 copy 和 cut 事件中将数据添加到 DataTransfer 对象中，实现必须能够正确地设置下面的对应的
类型描述，并将数据写入到剪切板中：    

- text/plain
- text/uri-list
- text/csv
- text/html
- image/svg+xml
- application/xml, text/xml
- application/json

## 7. 异步 Clipboard API

### 7.1 Navigator Interface

```
partial interface Navigator {
  [SecureContext, SameObject] readonly attribute Clipboard clipboard;
}
```    

### 7.2 Clipboard Interface

```
[SecureContext, Exposed=Window] interface Clipboard: EventTarget {
  Promise<DataTransfer> read();
  Promise<DOMString> readText();
  Promise<void> write(DataTransfer data);
  Promise<void> writeText(DOMString data);
}
```    

#### 7.2.1 read()

`read()` 方法的运行过程如下：    

1. 令 p 为一个 Promise
2. 并行的执行下面的步骤：
  1. 并且的运行检查剪切板读取数据的权限，并令 r 为结果
  2. 如果 r 非 "granted"，使用 "NotAllowedError" reject p
  3. 令 data 为剪切板数据的一份拷贝
  4. 使用 data resolve p
3. 返回 p

```js
navigator.clipboard.read().then(function(data) {
  for (var i = 0; i < data.items.length; i++) {
    if (data.items[i].type === 'text/plain') {
      console.log('Your string: '， data.items[i].getAs('text/plain'));
    } else {
      console.error('No text/plain data on clipboard');
    }
  }
});
```     

#### 7.2.2 readText()

`readText()` 的运行步骤如下：   

1. 令 p 为 Promise
2. 并行执行下面的步骤：
  1. 并行检查读取剪切板数据的权限，令 r 为结果
  2. 如果 r 非 "granted"，reject p
  3. 令 data 为剪切板数据的副本
  4. 令 textData 为空字符串
  5. 如果 data 的 items 包含一个 'text/plain' 的 item，那么久令 textData 为这个 item 的一份
  拷贝
  6. 使用 textData resolve p
3. 返回 p    

```js
navigator.clipboard.readText().then(function(data) {
  console.log("Your string: ", data);
});
```   

#### 7.2.3 write(data)

`write(data)` 的运行步骤如下：    

1. 令 p 为 Promise
2. 并行执行下面的步骤
  1. 并行检查剪切板的写入权限，并令 r 为结果
  2. 如果 r 非 "granted"，reject p
  3. 令 cleanItemList 为一个空的 DataTransferItemList
  4. 对于每个 data items 中的每个 DataTransferItem item：
    - 令 cleanItem 为 item 的副本
    - 如果无法创建副本，reject p
    - 将 cleanItem 添加到 cleanItemList 中
  5. 使用 cleanItemList 置换掉剪切板数据的 items 列表
  6. resolve p
3. 返回 p

```js
var data = new DataTransfer();
data.items.add('text/plain', 'Howdy, partner!');
navigator.clipboard.write(data).then(function() {
  console.log('Copied to clipboard successfully!');
}, function() {
  console.error('Unable to write to clipboard');
});
```    

#### 7.2.4 writeText(data)

`writeText(data)` 的运行步骤如下：   

1. 令 p 为 Promise
2. 并行执行下面的步骤：
  1. 并行检查剪切板写入权限，并令 r 为结果
  2. 如果 r 非 "granted"，reject p
  3. 令 newItemList 为一个空的 DataTransferItemList
  4. 令 newItem 为一个 text/plain 的 DataTransferItem
  5. 将 newItem 的 data 设置为 data
  6. 将 newItem 添加到 newItemList中
  7. 使用 newItemList 替换掉剪切板 items
  8. resolve p
3. 返回 p    

```js
navigator.clipboard.writeText('Howdy, partner!').then(function() {
  console.log('Copied to clipboard successfully!');
}, function() {
  console.error('Unable to write to clipboard');
});
```    

## 8. Clipboard Actions

每个剪切板动作都有两个 flags，分别是 `script-triggered` 和 `script-may-access-clipboard`。   

如果这次动作是由于脚本导致的，那么 `script-triggered` 就会被设置，例如一次 `document.execCommand()`
调用。     

如果满足下面的条件的话，`script-may-access-clipboard` 会被设置：   

1. 如果是 copy 或 cut 动作，并且脚本线程是 allowed to modify the clipboard
2. 如果是 paste 动作，并且脚本线程 allowed to read from clipboard

### 8.1 copy 动作

copy 动作包括以下的步骤：    

1. 如果设置了 script-triggered 标志，并且 script-may-access-clipboard 没有被设置，那么
就返回 false，终止掉这个算法
2. 触发一次名称为 copy 的剪切板事件
3. 如果事件没有被取消，复制选中的内容到剪切板中，触发一个名称为 clipboardchange 的剪切板事件
4. 否则，调用 write content to the clipboard 算法，传递给它一个 DataTransferItemList,
一个 clear-was-called 标志和一个 typed-to-clear 列表
5. 返回 true

### 8.2 cut 动作

cut 动作包含下面的步骤：    

1. 如果 script-triggered 标志被设置了，并且没有设置 script-may-access-clipboard，那么
就返回 false，并终止算法