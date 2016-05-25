# CSS揭秘

***

###  1. 背景与边框
#### 1.1  半透明边框
---
CSS原生的边框属性的颜色值支持透明度，因此边框其实本来就可以设置为半透明色。但是由于CSS中 `background-clip` 剪切属性的默认值是 `border-box`, 因此此时半透明边框下面的底色是自身的背景色。如果想让边框下面的底色是包含块的背景色或者内容，就需要设置 `background-clip` 值为 `padding-box`。
```css
	border: 10px solid hsla(0, 0%, 100%, .5);
	background : white;
	background-clip : padding-box;
```