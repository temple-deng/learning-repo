# CSS选择器
--

### 1. E:first-child
首先应该先确定的是选中的是一个E元素，其次这个E元素应该是作为父元素的第一个子元素。如果其父元素的第一个元素不是E元素，则没有元素被选中。  

```html
<div class='box'>
			<p>this is the first paragraph</p>
			<div>this is the first division</div>
</div>
```  

```css
.box p:first-child {
		  	background-color: greenyellow;
}      // p元素有背景色
.box div:first-child {
		  	background-color: greenyellow;
}     //  div元素没有背景色
```

###  2.  E:nth-child(n)  
同样首先确定选择的是E元素， 其次这个E元素应该是其父元素所以子元素中的第n个子元素。 如果其父元素的第n个子元素不是E元素，则没有元素被选中。  

```html
<div class='box'>
			<p>this is the first paragraph</p>
			<div>this is the first division</div>
			<p>this is the second paragraph</p>
			<div>this is the second division</div>
			<div>this is the third division</div>
</div>
```

```css
.box div:nth-last-child(1) {
		  	background-color: greenyellow;
}           // 没有元素被选中

.box div:nth-last-child(3) {
		  	background-color: greenyellow;
}          // 没有元素被选中

.box div:nth-last-child(4) {
		  	background-color: greenyellow;
}          // 第4个元素被选中
```


###  3. E:nth-of-type(n)
与nth-child不同的是，这个选择器是从父元素所有子元素中的E子元素来定位选中的元素。

		  
