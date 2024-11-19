# 那些你不清楚的 CSS

## 知识点篇

### 1. 滚动条样式

使用伪元素：    

```css
::-webkit-scrollbar { /* 1 */ }
::-webkit-scrollbar-button { /* 2 */ }
::-webkit-scrollbar-track { /* 3 */ }
::-webkit-scrollbar-track-piece { /* 4 */ }
::-webkit-scrollbar-thumb { /* 5 */ }
::-webkit-scrollbar-corner { /* 6 */ }
::-webkit-resizer { /* 7 */ }
```     

![scrollbar](https://css-tricks.com/wp-content/uploads/2011/05/scrollbarparts.png)    

还有一些伪类，用来更精确的控制选择的部分：    

```css
:horizontal
:vertical
:decrment
:incrment
:start
:end
:double-button
:single-button
:no-button
:corner-present
:window-inactive
```     

- `:horizontal`: 应用在水平方向上的滚动条
- `:vertical`: 应用在垂直方向的上的滚动条
- `:decrement`: 应用在 buttons 和 track pieces 上，应该是指会减少视口滚动位置的那块，例如
垂直滚动条的上方和水平滚动条的左边
- `:increment`: 略
- `:start`: 应用在 buttons 和 track pieces 上，对象是否在 thumb 的前面
- `:end`: 略
- button 这 3 个没理解
- `:corner-present`: 表明是否滚动条角落要出现
- `:window-inactive`: 没理解     

### 2. 使用 ::selection 伪元素自定义选区高亮样式

```css
::selection {
  background: yellow;
}

h1::selection {
  background: yellowgreen;
}
```  

### 3. 神奇的 :focus-within 伪类

它表示一个元素获得焦点，或，该元素的后代元素获得焦点。划重点，它或它的后代获得焦点。    

```html
  <style>

    .container {
      display: flex;
      justify-content: center;
    }

    .container:focus-within {
      transform: scale(1.5);
    }
  </style>
</head>
<body>
  <div class="container">
    <input type="text">
    <button>login</button>
  </div>
</body>
```    

当 input 和 button 获取焦点时，均会获取到对应的样式