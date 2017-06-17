# Emmet

## Abbreviations

`#page>div.logo+ul#navigation>li*5>a{Item $}`  

```html
<div id="page">
    <div class="logo"></div>
    <ul id="navigation">
        <li><a href="">Item 1</a></li>
        <li><a href="">Item 2</a></li>
        <li><a href="">Item 3</a></li>
        <li><a href="">Item 4</a></li>
        <li><a href="">Item 5</a></li>
    </ul>
</div>
```   

### 语法

Emmet 使用与 CSS相似的语法来描述内部生成元素位置即元素的属性。    

#### 嵌套操作符

嵌套操作符用于在生成的树中放置缩写元素：是应该放置在缩写元素之内或者是紧邻的兄弟节点元素。   

##### 子: >

`div>ul>li` 会生成：    

```html
<div>
    <ul>
        <li></li>
    </ul>
</div>
```   

##### 兄弟：+  

`div+p+bq` 会生成：   

```html
<div></div>
<p></p>
<blockquote></blockquote>
```   

##### Climb-up: ^  

`div+div>p>span+em^bq` 会生成：   

```html
<div></div>
<div>
    <p><span></span><em></em></p>
    <blockquote></blockquote>
</div>
```   

##### 乘法：*  

`ul>li*5` 会生成：   

```html
<ul>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
    <li></li>
</ul>
```   

##### 分组：()

`div>(header>ul>li*2>a)+footer>p` 会生成

```html
<div>
  <header>
    <ul>
      <li><a href=""></a></li>
      <li><a href=""></a></li>
    </ul>
  </header>
  <footer>
    <p></p>
  </footer>
</div>
```   

### 属性操作符

ID 和类就不说了。   

##### 定制属性

`[attr]` 的形式添加属性：`td[title="Hello World!" colspan=3]` 输出：   

`<td title="Hello world!" colspan="3"></td>`   

如果属性值没有空格的话，不需要用引号括起来。    

##### Item numbering: $

$ 可以放在元素名，属性名或者属性值中：`ul>li.item$*5`   

```html
<ul>
    <li class="item1"></li>
    <li class="item2"></li>
    <li class="item3"></li>
    <li class="item4"></li>
    <li class="item5"></li>
</ul>
```   

还可以用 $ 做0填充字符：`ul>li.item$$$*5`   

```html
<ul>
  <li class="item001"></li>
  <li class="item002"></li>
  <li class="item003"></li>
  <li class="item004"></li>
  <li class="item005"></li>
</ul>
```    

使用 @ 还可以修改数字迭代的方向和起始值：`ul>li.item$@-*5`   

```html
<ul>
    <li class="item5"></li>
    <li class="item4"></li>
    <li class="item3"></li>
    <li class="item2"></li>
    <li class="item1"></li>
</ul>
```   

`ul>li.item$@3*5`    

```html
<ul>
    <li class="item3"></li>
    <li class="item4"></li>
    <li class="item5"></li>
    <li class="item6"></li>
    <li class="item7"></li>
</ul>
```   

`ul>li.item$@-3*5`   

```html
<ul>
    <li class="item7"></li>
    <li class="item6"></li>
    <li class="item5"></li>
    <li class="item4"></li>
    <li class="item3"></li>
</ul>
```  

### 文本 {}

`a{Click me}` 生成：`<a href="">Click me</a>`。    
