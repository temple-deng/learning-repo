# User Input

## 添加触摸功能

### 禁止浏览器的默认样式

大部分浏览器在一个元素获得焦点时添加一个 `outline` 来显示元素周围的一圈轮廓。我们理应禁止
掉这个样式：   

```css
.btn:focus {
  outline: 0;
}
```  

Safari 和 Chrome 添加了一个 tap 高亮样式，也该被禁止掉：   

```css
.btn {
  -webkit-tap-highlight-color: transparent;
}
```    

WP 上的 IE 有同样的行为，不过要使用 meta 标签来禁止：   

```html
<meta name="msapplication-tap-highlight" content="no">
```    

FF 要处理两种副作用效果，`-moz-focus-inner` 伪类，在可触摸的元素上添加了一个 outline，可以
通过设置 `border: 0` 移除。    

如果在 FF 上使用 `<button>` 元素，会得到一个渐变，通过设置 `background-image: none`
移除这种效果：   

```css
.btn {
  background-image: none;
}

.btn::-moz-focus-inner {
  border: 0
}
```    

### 禁用 user-select

如果不想让用户长按屏幕的默认选择文本行为生效的话，禁用掉 user-select CSS 属性：   

```css
user-select: none;
```    

### 实现定制的手势

在 Chrome, IE, Edge 中，推荐使用 `PointerEvents` 来实现定制手势。在其他浏览器中，则
推荐使用 `TouchEvents` 和 `MouseEvents`。    

不过 `PointerEvents` 有一点好处就是它合并了多种输入类型，包括鼠标、触摸和触摸笔事件。
需要监听的事件包括 `pointerdown`, `pointermove`, `pointerup`, `pointercancel`。   

等价到 `TouchEvents` 和 `MouseEvents` 上就分别是 `touchstart`, `touchmove`,
`touchend`, `touchcancel`, `mousedown`, `mousemove`, `mouseup`。    

```js
// Check if pointer events are supported.
if (window.PointerEvent) {
  // Add Pointer Event Listener
  swipeFrontElement.addEventListener('pointerdown', this.handleGestureStart, true);
  swipeFrontElement.addEventListener('pointermove', this.handleGestureMove, true);
  swipeFrontElement.addEventListener('pointerup', this.handleGestureEnd, true);
  swipeFrontElement.addEventListener('pointercancel', this.handleGestureEnd, true);
} else {
  // Add Touch Listener
  swipeFrontElement.addEventListener('touchstart', this.handleGestureStart, true);
  swipeFrontElement.addEventListener('touchmove', this.handleGestureMove, true);
  swipeFrontElement.addEventListener('touchend', this.handleGestureEnd, true);
  swipeFrontElement.addEventListener('touchcancel', this.handleGestureEnd, true);

  // Add Mouse Listener
  swipeFrontElement.addEventListener('mousedown', this.handleGestureStart, true);
}
```    