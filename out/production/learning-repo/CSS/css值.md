# CSS 值类型

> 摘自张鑫旭的博客 https://www.zhangxinxu.com/wordpress/2019/11/css-value-type/

## 1. 值类型介绍

### 1.1 &lt;angle&gt;

角度值，支持负值。格式是数值+角度单位。    

角度单位包括4个，兼容性都是 IE9+。    

- `deg`
- `grad`: 百分度，常用于建筑或土木工程的角度测量，一个完整的圆是 `400grad`。   
- `rad`: 弧度。弧度是一种用弧长与半径之比度量对应圆心角角度的方式。一个完整的圆的弧度是2π，因此，
一个完整的圆的弧度大约是6.2832rad。
- `turn`: 圈数，一个完整的圆是1圈，也就是 `1turn`。    

### 1.2 &lt;angle-percentage&gt;

表示 CSS 值的数据类型可以是 `<angle>` 类型，也可以是 `<percentage>` 类型。    

如果是 `<percentage>` 类型，实际上会解析为 `<angle>` 类型。   

### 1.3 &lt;attr-fallback&gt;

`<attr-fallback>` 是针对 `attr()` 表达式而言的，是 `attr()` 表达式经过扩展后的全新的语法：   

```idl
attr( <attr-name> <type-or-unit>? [, <attr-fallback> ]?)
```     

多了 `<type-or-unit>` 和 `<attr-fallback>` 两个可选类型。     

```html
<style>
button[size] {
    width: attr(size px, auto);
}
</style>
<button size="80">宽度80px</button>
<button size="120">宽度120px</button>
<button size="160">宽度160px</button>
```

这里做些扩展，`attr()` 属性应该只可以用在伪元素上，过去只能用做 `content` 的属性值，但是现在
扩展到了所有的 CSS 属性，但是是实验性质的，所以浏览器可能不支持。    

`<type-or-unit>` 的值有以下的类型，默认是 `string`:   

- `string`
- `color`: 可以是颜色关键字或者 #aaa 这种的表示法
- `url`: 属性被当做成一个 url 对待，地址是相对于文档的，而不是样式文件
- `integer`
- `number`
- `length`: css 长度值，一般是包含单位的，例如 `12.5em`
- `angle`: 属性被看做是角度值，带单位，例如
- `time`: 被解释为一个时间值，带单位 `30.5ms`
- `frequency`: 频率值，带单位，例如 `30.5kHz`
- `em, ex, px, rem, vw, vh, vmin, vmax, mm, cm, in, pt, pc`: 属性被解释为 number
类型值。
- `deg, grad, rad`: 属性被解释为 number类型值
- `s, ms`: 属性被解释为 number类型值
- `Hz, kHz`: 属性被解释为 number类型值
- `%`: 属性被解释为 number类型值

### 1.4 &lt;attr-name&gt;

就是上面的 `attr()` 里面的 `<attr-name>`。    

### 1.5 &lt;basic-shape&gt;

`<basic-shape>` 类型用在 `clip-path`, `shape-outside`, `offset-path`，表示基础形状：   

```css
clip-path: inset(22% 12% 15px 35px);
clip-path: circle(6rem at 12rem 8rem);
clip-path: ellipse(115px 55px at 50% 40%);
clip-path: polygon(50% 20%, 90% 80%, 10% 80%);
clip-path: path(evenodd, "M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z");
```    

- `inset(<shape-arg>{1,4} [round <border-radius>]?)`
- `circle( [<shape-radius>]? [at <position>]? )`
- `ellipse( [<shape-radius>{2}]? [at <position>]? )`
- `polygon( [<fill-rule>,]? [<shape-arg> <shape-arg>]# )`
- `path( [<fill-rule>,]? <string> )`

### 1.6 &lt;blend-mode&gt;

`<blend-mode>` 是混合模式类型，用在 `background-blend-mode/mix-blend-mode` 这两个混合
模式属性上。   

包含下面的具体值：    

- `normal`: 正常呈现
- `multiply`: 正片叠底。模拟颜料的颜色混合。颜色会变得更暗
- `screen`: 滤色。模拟自然光颜色混合。颜色会变得更亮一些
- `overlay`: 叠加。底下颜色更深则走 multiply 模式，底下颜色更浅则走 screen 模式
- `darken`: 深色：哪个颜色深显示哪个。
- `lighten`: 浅色，哪个颜色浅显示哪个
- `color-dodge`: 颜色减淡，最终颜色是以底色除以定色的倒数的结果
- `color-burn`: 颜色加深。最终颜色是反转底部颜色、将值除以顶部颜色并反转该值的结果。
- `hard-light`: 强光。上面的颜色更深的时候表现为multiply，上面颜色更淡的时候表现为screen。这个值和overlay值类似，只是上下层作用条件对换了。
- `soft-light`: 柔光。最终的颜色类似于hard-light强光，但更柔和。此混合模式的行为类似于强光。
- `difference`: 差值，最后的颜色是从较浅的颜色中减去两种颜色中较深的颜色的结果。黑色层无效，而白色层反转另一层的颜色。
- `exclusion`: 排除。类似difference，但比difference对比度较低。与difference一样，黑色层没有效果，而白色层反转另一层的颜色。
- `hue`: 色调。最终颜色具有顶部颜色的色调，而使用底部颜色的饱和度和亮度。
- `saturation`: 饱和度。最终颜色具有顶部颜色的饱和度，同时使用底部颜色的色调和亮度。纯灰色的背景，没有饱和度，就没有效果。
- `color`: 颜色。最终颜色具有顶部颜色的色调和饱和度，而使用底部颜色的亮度。该效果保留了灰度，并可用于给前景着色。
- `luminosity`: 亮度。最终颜色具有顶部颜色的亮度，而使用底部颜色的色调和饱和度。这种混合模式相当于color，但层是交换的。

### 1.7 &lt;calc-product&gt;

`calc()` 方法中的一种类型，例如：   

```css
.some-zxx-class {
  width: calc( 100px / 3 + 30px * 2);
}
```    

其中：   

- `100px / 3 + 30px * 2` 是 `<calc-sum>`
- `100px / 3` 和 `30px * 2` 是 `<calc-product>`
- `100px`, `3`, `30px`, `2` 是 `<calc-value>`     

完整语法如下：    

```idl
<calc()> = calc( <calc-sum> )
<min()> = min( <calc-sum># )
<max()> = max( <calc-sum># )
<clamp()> = clamp( <calc-sum>#{3} )
<calc-sum> = <calc-product> [ [ '+' | '-' ] <calc-product> ]*
<calc-product> = <calc-value> [ [ '*' | '/' ] <calc-value> ]*
<calc-value> = <number> | <dimension> | <percentage> | (<calc-sum>)
```    

### 1.8 &lt;calc-sum&gt;

`calc()` 方法中的一种类型，表示 CSS 数学计算函数内的整个计算表达式。    

### 1.9 &lt;calc-value&gt;

`calc()` 方法中的一种类型，表示计算表达式中各个具体的计算项。    

### 1.10 &lt;color&gt;

表示色值类型：    

- 颜色关键字
- `transparent`
- `currentColor`
- RGB, RGBA 颜色
- HSL, HSLA 颜色


### 1.11 &lt;color-stop&gt;

`<color-stop>` 属于 CSS Images Module Level 中的类型值，表示颜色断点。    

多出现在渐变中：   

```css
.zxx-gradient {
  background-image: linear-gradient(red 20%, blue 80%);
}
```     

### 1.12 &lt;color-stop-list&gt;

`red 20%, blue 80%` 就属于 `<color-stop-list>`。    

### 1.13 &lt;custom-ident&gt;

`<custom-ident>` 数据类型表示用户定义的用作标识符的任意字符串。它是区分大小写的，并且在不同的
上下文中禁止某些值以防止歧义。    

```css
.zxx-animation {
  animation: fadeIn .2s;
}
```    

上面的 `fadeIn` 就是这种类型。    

### 1.14 &lt;dimension&gt;

`<dimension>` 表示尺寸类型，由数字和单位构成。    

### 1.15 &lt;filter-function&gt;

滤镜函数，被用在 `filter` 和 `backdrop-filter`（本身不应用滤镜，后面元素应用）属性中。   

- `blur()`：模糊
- `brightness()`：亮度变化
- `contrast()`：对比度变化
- `drop-shadow()`: 投影
- `grayscale()`: 灰度
- `hue-rotate()`: 色调旋转
- `invert()`: 反相
- `opacity()`: 透明度变化
- `saturate()`: 饱和度变化
- `sepia()`: 褐色

### 1.16 &lt;flex&gt;

`<flex>` 数据类型表示 grid 容器可伸缩的长度，被用在 `grid-template-columns`, `grid-template-rows`
以及其他相关属性中。    

该类型值格式固定，数字后面跟着单位 `fr`，`fr` 单位表示网格容器中剩余空间的份数。    

### 1.17 &lt;frequency&gt;

表示频率，跟着下面两种单位：   

- `Hz`
- `kHz`     

目前还没有属性支持这个类型。    

### 1.18 &lt;frequency-percentage&gt;

表示值既可以是 `<frequency>` 又可以是 `<percentage>` 类型。    

### 1.19 &lt;gradient&gt;

渐变类型，目前有4种：    

- 线性渐变
- 径向渐变
- 重复渐变
- 锥形渐变    

```css
.conic-gradient {
  background: conic-gradient(#f69d3c, #3f87a6);
}
```     

### 1.20 &lt;image&gt;



