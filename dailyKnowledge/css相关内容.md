# CSS 相关内容  

## html与body

当html标签无背景样式时，body的背景色其实不是body标签的背景色，而是浏览器的。一旦html标
签含有背景色，则body的背景色变成了正常的body标签（一个实实在在，普普通通标签）的背景色，
而此时的html标签最顶级，背景色被浏览器获取，成为浏览器的背景色。  

html和body均支持margin值。  

单独给body设置`height：100%`并不起作用，必须同时设置html的height。默认情况下100%就是
浏览器可视区域的高度。这就意味着如果html同时还设置`margin, border, padding`中的任意部分，就会出现滚动条。  

## 三栏自适应的两种方法


1. margin负值  

```css
		html,body {
			margin: 0;
			height: 100%;
		}

		#main {
			width: 100%;
			height: 100%;
			float: left;
			background: #ff9;
		}

		#box {
			margin: 0 210px;
			background: #6f9;
			height: 100%
		}

		#left,#right {
			width: 200px;
			height: 100%;
			float: left;
			background: #3ff;
		}
		#left {
			margin-left: -100%
		}
		#right {
			margin-left: -200px;
		}
```    

```html
	<div id="main">
		<div id="box">

		</div>
	</div>
	<div id="left"></div>
	<div id="right"></div>
```    


2. 自身浮动     

```css
	html,body {
			margin: 0;
			height: 100%;
		}

		#main {
			height: 100%;
			margin: 0 210px;
			background: #ff9;
		}

		#left,#right {
			width: 200px;
			height: 100%;
			background: #3ff;
		}
		#left {
			float: left;
		}
		#right {
			float: right;
		}
```    

```html
	<div id="left"></div>
	<div id="right"></div>
	<div id="main"></div>
```  
 

## 流、元素和基本尺寸

每个元素都两个盒子,外在盒子和内在盒子。外在盒子负责元素是可以一行显示,还是只能换行显示;
内在盒子负责宽高、内容呈现什么的。内在盒子又叫容器盒子。    

于是,按照display的属性值不同,值为block的元素的盒子实际由外在的“块级盒子”和内在的“块级容
器盒子”组成,值为inline-block的元素则由外在的“内联盒子”和内在的“块级容器盒子”组成,值
为inline的元素则内外均是“内联盒子”。     

## width: auto

width的默认值是auto。它至少包含了以下4种不同的宽度表现。    

1. 充分利用可用空间，例如 &lt;div&gt; 和 &lt;p&gt; 这些元素的宽度默认是 100% 于父级
容器的。
2. 收缩与包裹。典型代表就是浮动、绝对定位、inline-block 或者 table 元素，英文称为
shrink-to-fit,直译为“收缩到合适”, CSS3 中的 fit-content 指的就是这种宽度表现。   
3. 收缩到最小。这个最容易出现在table-layout为auto的表格中。
4. 超出容器限制。除非有明确的width相关设置,否则上面3种情况尺寸都不会主动超过父级容器宽度的,
但是存在一些特殊情况。例如,内容很长的连续的英文和数字,或者内联元素被设置了white-space:nowrap。   

## 关于 height: 100%    

对于height属性,如果父元素 height 为 auto, 只要子元素在文档流中,其百分比值完全就被
忽略了。例如,某小白想要在页面插入一个&lt;div&gt;,然后满屏显示背景图,就写了如下CSS:    

```css
div {
  width: 100%;   /* 多余*/
  height: 100%;  /* 无效 */ 
  background: url(bg.jpg);
}
```    

然后他发现这个 &lt;div&gt; 高度永远是0,哪怕其父级 &lt;body&gt; 塞满了内容也是如此。
事实上,他需要如下设置才行:    

```css
html, body {
  height: 100%;
}
```   

并且仅仅设置 &lt;body&gt; 也是不行的,因为此时的&lt;body&gt;也没有具体的高度值。   

原因看样子可以简单的理解为 auto * 100% = NaN。   