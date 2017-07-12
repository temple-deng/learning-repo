# 拖放操作 drag and drop

## 1. 基础

### 1.1 拖放步骤

处理拖放通常有以下几个步骤：

+ 定义可拖动目标。将我们希望拖动的元素的`draggable`属性设为true。
+ 定义被拖动的数据，可能为多种不同格式。例如，文本型数据会包含被拖动文本的字符串。
+ （可选）自定义拖动过程中鼠标指针旁边会出现的拖动反馈图片。如果未设定，默认图片会基于鼠标按钮按下的元素（正在被拖动的元素）来自动生成。
+ 允许设置拖拽效果。有三种效果可以选择：copy 用来指明拖拽的数据将从当前位置复制到释放的位置；move 用来指明被拖拽的数据将被移动；link 用来指明将在源位置与投放位置之间建立某些形式的关联或连接。在拖拽的过程中，可以修改拖拽效果来指明在某些位置允许某些效果。如果允许，你将可以把数据释放到那个位置。
+ 定义放置区域。默认情况下，浏览器阻止任何东西向HTML元素放置拖拽的发生。要使一个元素称为可放置区域，需要阻止浏览器的默认行为，也就是要监听`dragenter` 和 `dragover` 事件。更多信息参阅指定放置目标。
+ 在drop发生时做一些事情。你可能想要获取拖拽目标携带的数据并做某些相应的事情。

### 1.2 拖放事件介绍

在进行拖放操作的不同阶段会触发数种事件。注意，在拖拽的时候只会触发拖拽的相关事件，鼠标事件，例如`mousemove`，是不会触发的。也要注意，当从操作系统拖拽文件到浏览器的时候，`dragstart`和`dragend`事件不会触发。  

拖拽事件的`dataTransfer`属性存放了拖放操作中的相关数据。  

<dl>
	<dt>dragstart</dt>
	<dd style="text-indent: 3em">
	  当一个元素开始被拖拽的时候触发。用户拖拽的元素需要附加dragstart事件。在这个事件中，监听器将设置与这次拖拽相关的信息，例如拖动的数据和图像。
	</dd>
	<dt>dragenter</dt>
	<dd style="text-indent: 3em">
	  当拖拽中的鼠标第一次进入一个元素的时候触发。这个事件的监听器需要指明是否允许在这个区域释放鼠标。如果没有设置监听器，或者监听器没有进行操作，则默认不允许释放。当你想要通过类似高亮或插入标记等方式来告知用户此处可以释放，你将需要监听这个事件。
	</dd>
	<dt>dragover</dt>
	<dd style="text-indent: 3em">
	  当拖拽中的鼠标移动经过一个元素的时候触发。大多数时候，监听过程发生的操作与dragenter事件是一样的。
	</dd>
	<dt>dragleave</dt>
	<dd style="text-indent: 3em">
	  当拖拽中的鼠标离开元素时触发。监听器需要将作为可释放反馈的高亮或插入标记去除。
	</dd>
	<dt>drag</dt>
	<dd style="text-indent: 3em">
	  这个事件在拖拽源触发。即在拖拽操作中触发dragstart事件的元素。
	</dd>
	<dt>drop</dt>
	<dd style="text-indent: 3em">
	  这个事件在拖拽操作结束释放时于释放元素上触发。一个监听器用来响应接收被拖拽的数据并插入到释放之地。这个事件只有在需要时才触发。当用户取消了拖拽操作时将不触发，例如按下了Escape（ESC）按键，或鼠标在非可释放目标上释放了按键。
	</dd>
	<dt>dragend</dt>
	<dd style="text-indent: 3em">
	  拖拽源在拖拽操作结束将得到dragend事件对象，不管操作成功与否。
	</dd>
</dl>


## 2. 拖拽操作

### 2.1 draggable 属性

在一个web页面中，有一些默认就可以被拖动的元素。它们包括选中的文本，图片和链接。当一个图片或者链接被拖动时，这个被拖动的图片或者链接的URL就会先被设置为“拖动数据”（drag data），然后一次拖动过程就正式开始了。对于其他元素，它们必须是选中区域的一部分才能触发默认的拖拽效果。查看默认的拖动效果：在一个web页面上选择一个区域，然后点击并按住鼠标，然后拖动选中区域。当拖动时，一个系统特殊渲染过的选择区将会显示，并且会跟随鼠标指针移动。当然，如果你没有设置监听事件调整被拖动的数据，上面这种拖动的行为只是普通的默认的拖动行为。  

在HTML中，除了图片、超链接以及被选中区域（应该是text），其它元素默认是不可拖拽的。为了让别的HTML元素也能被拖拽，必须进行以下三步：  

+ 为所需拖拽的元素设置draggable属性为true。
+ 为 dragstart 事件添加侦听。
+ 在上面的监听器中设置要拖拽的数据(drag data)。  

```html
<div draggable="true" ondragstart="event.dataTransfer.setData('text/plain', 'This text may be dragged')">
  This text <strong>may</strong> be dragged.
</div>
```  

属性 `draggable` 被设置为 true，则元素变为可拖拽。如果该属性被忽略或者设置为 false，则元素不能被拖拽，文本可以被选中。该属性可被用于所有元素，包括图片和链接。然而，对于图片和链接，是默认可以拖拽的。故只需对默认属性值为false的元素设置该值。  

一旦元素为可拖拽，元素中的文本或其他元素就无法通过鼠标点击或拖拽来实现选中了。但，可通过Alt+鼠标选中文本（测试时在 chorme 仍不能选中文本，在 firefox下可以）。  

### 2.2 开始拖动操作

在上面例子中，通过使用 `ondragstart` 属性来添加一个 `dragstart` 事件监听器。  

拖拽操作一开始，`dragstart`事件就会被触发。在这个例子中，`dragstart`事件监听器被添加到可拖拽元素本身之中，但你也可以在其祖先元素中进行监听，因为正如其它大部分事件一样，拖拽事件是会冒泡的。在该事件中，你可以指定拖拽数据，反馈图片，以及拖拽效果。一般，只有拖拽数据是必须的，其他都可以根据场景设置。  

### 2.3 拖拽数据

所有的 drag events 都有一个 `dataTransfer` 属性，保存着拖拽的数据 drag data。  

拖拽发生时，数据需与拖拽关联，以标识谁在被拖拽。如，当拖拽文本框中的选中文本时，关联到拖拽的数据即是文本本身。类似，拖拽网页上的链接时，拖拽数据即是链接的URL。  

拖拽数据包含两类信息，类型(type)或者格式(format)或者数据(data)，和数据的值(data value)。  

格式即是一个表示类型的字符串（如，对于文本数据来说，格式为 "text/plain"），数据值为文本字串。当拖拽开始时，你需要通过提供一个类型以及数据来为拖拽添加数据。拖拽过程中，在`dragenter `和 `dragover` 事件侦听中，可以根据数据类型检测是否支持 `drop`。如，接收超链接的 drop 目标会检测是否支持链接类型 text/uri-list。在drop事件中， 监听器会获取拖拽中的数据并将其插入到 drop 位置。  

类型指的是 MIME-type ，与 string 类似，如 text/plain 或者 image/jpeg。也可以自定义类型。  

可以提供多种格式的数据。通过多次调用 setData 方法增加不同的格式。格式顺序需从 具体 到 一般。  

```javascript
var dt = event.dataTransfer;
dt.setData("application/x-bookmark", bookmarkString);
dt.setData("text/uri-list", "http://www.mozilla.org");
dt.setData("text/plain", "http://www.mozilla.org");
```  

若你试图两次以同一格式设定数据，新数据会替代旧数据，数据的位置还是和旧的一样。  

你可以使用 `clearData` 方法来移除一个数据。需要传入一个参数：待移除的数据的类型。  

`event.dataTransfer.clearData("text/uri-list");`  

`clearData` 方法的参数是可选的。如果没有传入参数，绑定其上的所有数据都会被移除。若没有设定数据，或者数据全被移除了，那么拖拽不会发生。  

### 2.4 设置拖拽反馈图片

当一次拖拽发生时，会从被拖拽的目标处产生一个半透明的图片（反馈图片），该图片在拖拽过程中会跟随鼠标指针移动。这个图片是自动生成的，因此你无需亲自设定它。但你可以使用 `setDragImage` 来自定义一个反馈图片。  

`event.dataTransfer.setDragImage(image, xOffset, yOffset);`  

3个参数都是必需的。第一个参数引用了一张图片，通常是一个图片元素，但也可能是 canvas 或其他元素。反馈图片会和其在屏幕上显示的样子一致（浏览器之间不同，chorme是图片显示时设置的尺寸，firefox是图片自身的尺寸）。后两个参数是相对于鼠标指针的位移。  

### 2.5 拖动效果

拖动时，有几个可以执行的操作。复制操作（copy ）用于指示将正在拖动的数据从其目前的位置复制到要放置位置。移动（move ）操作用以指示被拖动的数据将被移动。链接（link ）操作用来指明将在源位置与投放位置之间建立某些形式的关联或连接。  

通过在`dragstart`事件监听器中设置 `effectAllowed`属性，你可以为拖动源指定这三种操作中的某一种。  

`event.dataTransfer.effectAllowed = "copy";`  

可以选择下面的几种值：  

+ none: 不允许任何操作
+ copy
+ move
+ link
+ copyMove: 复制或者移动
+ copyLink
+ linkMove
+ all

默认情况和 'all' 的效果是一样的。  

在拖拽过程中， `dragenter` or `dragover` 的监听器可以检查 `effectAllowed` 属性
看看允许哪些效果。一个相关的属性 `dropEffect`,应该设置为最终到底要执行哪种效果。该属性只能设置为单一的效果（none, copy, move, link）。
也就是`effectAllowed` 显示允许哪些效果，`dropEffect` 决定最终采取的效果。     

简单的来说，在 `dragstart` 中设置我们允许的拖拽的操作，在想要放置 drop 的元素的 `dragover` 中
设置 `dropEffect` 来表示这次拖拽执行的是哪种操作。并且设置这个属性会影响拖动过程中鼠标的形状。
不过需要注意的是，如果 `dropEffect` 的效果不在 `effectAllowed` 中，那么其实这次拖拽是没有
效果的，不管我们怎么处理。而且鼠标的形状也会设置为禁止的样子。    

### 2.6 指定可放置(drop)的对象

`dragenter` 和 `dragover` 监听器通常用来表明哪些元素是可放置的对象。也就是拖放源最终放置的地方。这些事件的默认处理效果是不允许放置的。所以我们需要阻止事件的默认处理方式。chrome下狠心必须在`dragover`取消才行，firefox随便一个都可以取消。  

通常情况下是根据拖拽数据的类型来决定是否允许 drop。即检查 `dataTransfer` 的 `types` 属性，这个属性返回一个字符串数组，包含在拖拽开始时添加的所有的数据类型。  

推荐使用数组的 `includes` 方法检测是否包含某个类型。

### 2.7 执行放置操作

在 drop 事件中，我们可以通过 `getData()` 方法获取到我们保存的数据。  

```javascript
function onDrop(event) {
  var data = event.dataTransfer.getData("text/plain");
  event.target.textContent = data;
  event.preventDefault();
}
```  

默认情况下需要调用 `preventDefault()` 方法来阻止浏览器的默认操作。  

一旦 drag 操作完成，拖放源上会触发 `dragend` 事件，不论drag是成功还是被取消了。


## 3. 文件拖放

### 3.1 处理放置 drop

`drop` 事件会在用户放置文件时触发。如果浏览器支持 `DataTransferItemList` 接口， 就可以使用 `getAsFile()` 方法访问文件，否则就是用 `DataTransfer` 的
`files` 属性访问文件。  

```javascript
function drop_handler(ev) {
  console.log("Drop");
  ev.preventDefault();
  // If dropped items aren't files, reject them
  var dt = ev.dataTransfer;
  if (dt.items) {
    // Use DataTransferItemList interface to access the file(s)
    for (var i=0; i < dt.items.length; i++) {
      if (dt.items[i].kind == "file") {
        var f = dt.items[i].getAsFile();
        console.log("... file[" + i + "].name = " + f.name);
      }
    }
  } else {
    // Use DataTransfer interface to access the file(s)
    for (var i=0; i < dt.files.length; i++) {
      console.log("... file[" + i + "].name = " + dt.files[i].name);
    }  
  }
}
```  


### 3.2 清理工作

当 drag 操作结束时会触发 `dragend` 事件。在支持 `DataTransferItemList` 的浏览器中可以通过 `remove` 方法清理 drag 数据，否则就使用 `DataTransfer` 对象的 `clearData()` 来清理数据。  


## 4. 数据类型

### 文本

当拖拽文本数据时使用 `text/plain` 类型，不过文本默认是可拖动的。  

在旧的代码中，你可能会遇到`text/unicode`或`Text`类型。这些与`text/plain`类型是等效的，存储、获取到的都是纯文本数据。  


### 链接

链接需要包含两种类型的数据；第一种是text/uri-list类型的URL，第二种是text/plain类型的URL。两种类型要使用相同的数据，即链接的URL。  

### HTML 和 XML

HTML内容可以使用text/html类型。这种类型的数据需要是序列化的HTML。例如，使用元素的innerHTML属性值来设置这个类型的值是合适的。  



# 接口

## 1. DataTransfer

### 1.1 属性

+ `dropEffect`: 控制了拖放过程中的反馈效果。其会影响拖动过程中鼠标的外形。可能的值：copy, move, link, none。设置非法的值时没有效果，并且值不变。
+ `effectAllowed`
+ `files`: 返回文件列表。
+ `items`: 返回一个 `DataTransferItem ` 对象的列表。
+ `types`: 返回一个数据格式的数组，每种格式用字符串表示，如果有文件，其中之一是字符串 'Files'。

### 1.2 方法

+ `clearData([format])`: 移除给定类型的数据。类型参数是可选的。如果没有指定类型参数，就会移除所有类型的数据。但是这个方法不能移除文件，并且只能在 `dragstart` 中调用。
+ `getData(format)`
+ `setData(format, data)`
+ `setDragImage(img, xOffset, yOffset)`

## 2. DataTransferItem

`DataTransferItem` 对象代表了一个拖拽数据项目。

### 2.1 属性

+ `kind`: 只读。代表了项目的类型。 'string' 或者 'file'。
+ `type`: 只读。项目的MIME类型。

### 2.2 方法

+ `getAsFile()`: 返回对应的文件对象或者 null。
+ `getAsString(callback)`: 使用项目的字符串格式作参数调用回调函数。

## 3. DataTransferItemList

`DataTransferItemList` 对象就是 `DataTransferItem` 对象的列表。即 `DataTransfer`对象。

+ `length`
+ `add(data, type)` or `add(file)`
+ `remove(index)`
+ `clear()`
