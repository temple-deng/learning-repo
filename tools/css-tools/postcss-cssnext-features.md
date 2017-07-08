# postcss-cssnext 特征(postcss-cssnext 3.0.0)

目录：   

+ [automatic vendor prefixes](#1)
+ [custom properties & `var()`](#2)
+ [custom properties set & `@apply`](#3)
+ [reduced `calc()`](#4)
+ [custom media queries](#5)
+ [media queries ranges](#6)
+ [custom selectors](#7)
+ [nesting](#8)
+ [`image-set()` function](#9)
+ [`color()` function](#10)
+ [`hwb()` function](#11)
+ [`gray()` function](#12)
+ [`#rrggbbaa` colors](#13)
+ [`rgba` function (`rgb` fallback)](#14)
+ [`rebeccapurple` color](#15)
+ [`font-variant` property](#16)
+ [`filter` property](#17)
+ [`initial` value](#18)
+ [`rem` unit (`px` fallback)](#19)
+ [`:any-link` pseudo-class](#20)
+ [`:matches` pseudo-class](#21)
+ [`:not` pseudo-class](#22)
+ [`::` pseudo syntax (`:` fallback)](#23)
+ [`overflow-wrap` property (`word-wrap` fallback)](#24)
+ [attribute case insensitive](#25)
+ [`rgb()` function (functional-notation)](#26)
+ [`hsl()` function (functional-notation)](#27)
+ [`system-ui` font-family](#28)
+ [@todo]   


### automatic vendor prefixes

<a name="1"></a>   

使用 autoprefixer 自动添加浏览器前缀。   

### custom properties & var()

<a name="2"></a>   

当前对自定义属性的转换主要是通过原生 CSS 自定义提供的使用 `:root` 选择器来实现一种面向未来的用法。       

```css
:root {
  --mainColor: red;
}

a {
  color: var(--mainColor);
}
```   

貌似意思是只能在 `:root` 选择器中定义。   

### custom properties set & @apply

<a name="3"></a>   

允许我们在一个命名的自定义属性中存放一个集合，以便之后在其他样式规则中引用。    

```css
:root {
  --danger-theme: {
    color: white;
    background-color: red;
  };
}

.danger {
  @apply --danger-theme;
}
```    

貌似意思是只能在 `:root` 选择器中定义。     

### reduced calc()

<a name="4"></a>   

通过优化之前解析过的 `var()` 的引用来让我们可以在 calc 中使用自定义属性时变得安全。   

```css
:root {
  --fontSize: 1rem;
}

h1 {
  font-size: calc(var(--fontSize) * 2);
}
```   

### custom media queries

<a name="5"></a>   

一种优雅的使用语义化的媒体查询的方式。   

```css
@custom-media --small-viewport (max-width: 30em);
/* check out media queries ranges for a better syntax !*/

@media (--small-viewport) {
  /* styles for small viewport */
}
```    

### media queries ranges

<a name="6"></a>   

允许使用 `<=` 和 `>=` 替换 `min-/max-` 前缀。   

```css
@media (width >= 500px) and (width <= 1200px) {
  /* your styles */
}

/* or coupled with custom media queries */
@custom-media --only-medium-screen (width >= 500px) and (width <= 1200px);

@media (--only-medium-screen) {
  /* your styles */
}
```   

### custom selectors

<a name="7"></a>   

可以让我们创建自己的选择器。    

```css
@custom-selector :--button button, .button;
@custom-selector :--enter :hover, :focus;

:--button {
  /* styles for your buttons */
}
:--button:--enter {
  /*
    hover/focus styles for your button

    Read more about :enter proposal
    http://discourse.specifiction.org/t/a-common-pseudo-class-for-hover-and-focus/877
   */
}
```   

### nesting

<a name="8"></a>   

嵌套选择器。   

```css-loader
a {
  /* direct nesting (& MUST be the first part of selector)*/
  & span {
    color: white;
  }

  /* @nest rule (for complex nesting) */
  @nest span & {
    color: blue;
  }

  /* media query automatic nesting */
  @media (min-width: 30em) {
    color: yellow;
  }
}
```   

### image-set() function

<a name="9"></a>   

为不同分辨率的设备提供一个图片的集合。   

```css
.foo {
    background-image: image-set(url(img/test.png) 1x,
                                url(img/test-2x.png) 2x,
                                url(my-img-print.png) 600dpi);
}
```   

### color() function

<a name="10"></a>   

用来修改颜色的颜色函数。   

```css
a {
  color: color(red alpha(-10%));
}

  a:hover {
    color: color(red blackness(80%));
  }
```   

### hwb() function

<a name="11"></a>   

类似于 `hsl()`，但是更方便人们使用。   

```css
body {
  color: hwb(90, 0%, 0%, 0.5);
}
```   

### gray() function

<a name="12"></a>   

允许您使用超过50种灰色阴影。第一个参数是一个0~255的数字，或者是1个百分数。   

```css
.foo {
  color: gray(85);
}

.bar {
  color: gray(10%, 50%);
}
```   

### #rrggbbaa colors

<a name="13"></a>   

可以使用4或8个数字的十六进制颜色表示。   

```css
body {
  background: #9d9c;
}
```   

### rgba function (rgb fallback)

<a name="14"></a>   

如果我们需要支持老的浏览器，例如IE8的话。这个可以为 rgba 颜色提供回退方案。   

```css
body {
  background: rgba(153, 221, 153, 0.8);
  /* you will have the same value without alpha as a fallback */
}
```   

### rebeccapurple color

<a name="15"></a>   

允许我们使用这个新的颜色关键字。（这个关键字好像是 Eric Meyer 女儿的名字）   

```css
body {
  color: rebeccapurple;
}
```   

### font-variant property

<a name="16"></a>   

```css
h2 {
  font-variant-caps: small-caps;
}

table {
  font-variant-numeric: lining-nums;
}
```   

`font-variant` 会转换为 `font-feature-settings`。    

### filter property

<a name="17"></a>   

```css
.blur {
    filter: blur(4px);
}
```   

### initial value  

<a name="18"></a>   
允许我们为任何属性使用 `initial` 关键字。    

### rem unit (px fallback)   

<a name="19"></a>   

### :matches pseudo-class

<a name="20"></a>   

允许我们使用 `:matches()`   

```CSS
p:matches(:first-child, .special) {
  color: red;
}
```   

### :not pseudo-class

<a name="21"></a>   

允许我们使用 `not()` level 4，这个允许多个选择器。会转换为 level 3，这个只允许一个选择器。   

```CSS
p:not(:first-child, .special) {
  color: red;
}
```   

### :: pseudo syntax (: fallback)

<a name="22"></a>   

调整 `::` 为 `:`。这是为了兼容 IE8。   

### overflow-wrap property (word-wrap fallback)

<a name="23"></a>   

将 `overflow-wrap` 转换为 `word-wrap`。    

```css
body {
  overflow-wrap: break-word;
}
```   

### attribute case insensitive

<a name="24"></a>   

允许我们使用大小写不敏感的属性。   

```css
[frame=hsides i] {
  border-style: solid none;
}
```   

### rgb() function (functional-notation)

<a name="25"></a>   

允许我们使用新的语法：空格分隔的参数，以及可选的用`/`分隔的不透明度。   

不透明可以是百分数或者是数字，注意这是可选的。    

```css
div {
  background-color: rgb(100 222.2 100.9 / 30%);
}
```   

### hsl() function (functional-notation)

<a name="26"></a>   

同上，不过现在 `hsl()` 色度值上接受角度或者数字。   

```css
div {
  color: hsl(90deg 90% 70%);
  background-color: hsl(300grad 25% 15% / 70%);
}
```    

### system-ui font-family

<a name="27"></a>   

运行我们使用 `system-ui` 通用字体。    

```css
body {
  font-family: system-ui;
}
```   
