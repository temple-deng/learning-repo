# Event Interface

## 属性

### Event.bubbles (read only)

表明是否给定的事件会在 DOM 中冒泡。布尔值。   

### Event.cancelBubble

`Event.stopPropagation()` 的别名，设置这个属性值为 `true` 就停止冒泡。    

### Event.cancelable  (read only)

布尔值。表明事件是否是可取消的。    

### Event.composed  (read only)

布尔值。表明是否事件会冒泡经过标准 DOM 中的 shadow DOM 的边界。   

如果为 `true`，貌似会在冒泡到 shadow root 后再到 shadow DOM 中冒泡。如果为 `false`，
则shadow root 就是冒泡的最后一个节点。   

### Event.currentTarget  (read only)

就是绑定事件监听器的这个元素吧。

### Event.defaultPrevented  (read only)

布尔值。表明是否 `event.preventDefault()` 在事件上已经调用过了。    

### Event.eventPhase  (read only)

表明事件流当前处在哪个阶段。返回一个整数值。0表明当前没有事件在处理中。1表示在捕获阶段，
2表示事件在事件目标上触发。3表示再冒泡阶段。    

### Event.target  (read only)

对当前触发元素的对象的引用。

### Event.timeStamp  (read only)

貌似是指事件创建到现在经过了多次时间。毫秒。    

### Event.type  (read only)

返回表示事件类型的字符串。    

### Event.isTrusted  (read only)

布尔值。当事件是由用户的行为生成的时返回 `true`，当事件是由脚本触发的话就是 `false`。   

## 方法

### Event.preventDefault()

略。   

### Event.stopImmediatePropagation()

阻止相同事件的其他的事件器调用。   

### Event.stopPropagation()

阻止在捕获及冒泡阶段的继续传播。    
