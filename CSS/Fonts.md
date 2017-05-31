# CSS Fonts Module Level 3   

> https://www.w3.org/TR/css-fonts-3/


## 基础字体属性

### font-family

`font-family: [ <family-name> | <generic-family> ] #`  

指定了使用的字体的优先级列表。左边的优先级最高。逗号分隔。  

**&lt;family-name&gt;**: 选择的字体的名字。    

**&lt;generic-family&gt;**: 目前定义了通用的字体关键字有：'serif', 'sans-serif', 'cursive', 'fantasy', 'monospace'。
这些关键字用来做备用的。而且作为关键字，不能用引号引起来。    

除了通用的字体名以外（也就是除了上面的几个关键字吧）的字体名字，要么用引号引起来当做一个字符串，要不使用一个或多个标记的序列而不用引号引起来。这意味着每个标记开始处的大多数标点符号和数字必须以无引号的字体系列名转义。（说实话，不懂这句话的意思）   


### font-weight

`font-weight: normal | bold | bolder | lighter | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900`    

normal 相当于400，bold相当于700，bolder以及lighter都是相当于其父元素的，根据继承下来的 weight 再算，具体计算表格不说了。   

### font-stretch  

`font-stretch: normal | ultra-condensed | extra-condensed | condensed | semi-condensed | semi-expanded | expanded | extra-expanded | ultra-expanded`   

字体的宽度。    

### font-style  

`font-style: normal | italic | oblique`   


### font-size

`font-size: <absolute-size> | <relative-size> | <length> | <percentage>`  

百分比是参考父元素的font size。   

### font-size-adjust

`font-size-adjust: none | <number>`   

### font

`font: 	[ [ <'font-style'> || <font-variant-css21> || <'font-weight'> || <'font-stretch' ]? <'font-size'> [ / <'line-height'> ]? <'font-family'> ] | caption | icon | menu | message-box | small-caption | status-bar`   

## @font-face

每个`@font-face` 规则为每个字体描述符都定义了一个值，可能是显式定义的，也可能隐式定义的。没有明确的设置值的属性就会
采用初始值。这些描述符仅适用于定义它们的`@font-face`规则的上下文，不适用于文档语言元素。   

```css
@font-face {
  font-family: Gentium;
  src: url(http://example.com/fonts/Gentium.woff);
}
```    

貌似这个规则中属性都可以视作是字体描述符。   

`@font-face` 规则必须包含 `font-family` 及 `src` 描述符。如果缺少其中之一，这个规则就是无效的。   

### 字体描述符

```css
font-family: <family-name>

src: 	[ <url> [format(<string> #)]? | <font-face-name> ] #;
/* 这个属性值是有优先级的，第一个可用的优先级最好，逗号分隔的列表，可以是外部字体或本地安装的字体 */
/* 具体格式字符串见下面的表格 */
font-style: normal | italic | oblique;
font-weight: normal | bold | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
font-stretch: normal | ultra-condensed | extra-condensed | condensed | semi-condensed | semi-expanded | expanded | extra-expanded | ultra-expanded;
```   

| String | Font Format | Common extentsions |
| :------------- | :------------- | :------------- |
| "woff"  | WOFF | .woff |
| "truetype" | TrueType | .ttf |
| "opentype" | OpenType | .ttf, .otf |
| "embedded-opentype" | Embedded OpenType | .eot |
| "svg" | SVG Font | .svg, .svgz |
