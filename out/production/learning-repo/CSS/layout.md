# 常见的布局解决方式

## 两栏布局，左边固定宽度，右边自适应

html:   

```html
<div class="box">
  <div class="left"></div>
  <div class="right"></div>
</div>
```    

这里给出3种解决办法：右侧BFC，flex，grid。   

1. BFC: 利用BFC不与浮动元素重叠以及块级元素的流体特性      

```css
.left {
  float: left;
  width: 200px;
  margin-right: 20px;
}

.right {
  overflow: hidden;
}
```    

2. flex   

```css
.box {
  display: flex;
}
.left {
  width: 200px;
}
.right {
  flex: 1;
}
```   

3. grid    

```css
.box {
  display: grid;
  grid-template-columns: 200px 1fr;
}
.left {
  grid-column: 1;
}
.right {
  grid-column: 2;
}
```   


## 页脚固定

```html
<main></main>
<footer></footer>   
```   

第一种布局：

```css
html,body {
  height: 100%;
}

main {
  min-height: 100%;
  margin-bottom: -100px;
  padding-bottom: 100px;
  box-sizing: border-box;
}

footer {
  height: 100px;
}
```    

这种的话由于 min-height 是 100%，所以如果不设置 margin-bottom: -100px 的话，main 就会占据整个页面的宽度，
所以用负值来将底部拉上来，注意其实这种情况 footer 和 main 底部是重叠的。    

第二种：flex。这种的话可以在 main 和 footer 外加一层 wrapper。或者也可以直接在 body 上设置 flex：   

```html
<div class="wrapper">
  <main></main>
  <footer></footer>
</div>
```   

```css  
html, body {
  height: 100%;
}
.wrapper {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

footer {
  height: 80px;
  margin-top: 10px;
}
```   

第三种的话使用 vh 及 calc():   

```css
main {
  min-height: calc(100vh - 100px);
}

footer {
  height: 90px;
}
```    

第四种就是 grid，同理，在外层加 wrapper:   

```css
.wrapper {
  min-height: 100%;
  display: grid;
  grid-template-rows: 1fr 100px;
}
main {
  grid-row: 1;
}
footer {
  grid-row: 2;
}
```   

## div 模拟 textarea  

```css
.textarea {
  width: 600px;
  height: 200px;
  border: 1px solid #A8D8B9;
  margin: 200px;
  outline: none;
  padding: 15px;
  overflow-y: auto;
}
```  

结合 contenteditable 属性。   
