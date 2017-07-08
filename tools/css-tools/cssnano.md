# cssnano   

当前这份文档是基于4.0 的，不过貌似还没不是稳定版，所有安装时 `npm install cssnao@next`。    

## Presets

从版本 4开始，cssnao 可以针对不同的用例使用 presets 来实现不同的功能。   

貌似目前好像只有两种 preset: default, advanced。    

cssnano 会运行一系列不同的操作来检查该用哪个 preset。首先，它会检查 cssnano 初始化时
是否加载了这个 preset；如果加载了，那么就选择使用它，例如，当前 `postcss.config.js` 配置
如下：   

```js
module.exports = {
    plugins: [
        require('cssnano')({
            preset: 'default',
        }),
    ],
};
```    

这里的 preset 的名字应该是会处理为一个 node 模块，可以选择性的添加 `cssnano-preset-` 的前缀。
所以其实上面也可以写为 `cssnano-preset-default`。    

如果需要为 preset 传递任何的选项的话，必须使用数组语法指定。   

```js
module.exports = {
    plugins: [
        require('cssnano')({
            preset: ['default', {
                discardComments: {
                    removeAll: true,
                },
            }]
        }),
    ],
};
```    

对于其他的没有明确的设置 preset 的情况，cssnano 会检查 `package.json` or `cssnano.config.js`
文件，从当前工作目前知道用户主目录。下面是具体的配置的样子：   

```json
{
  "name": "awesome-application",
  "cssnano": {
    "preset": [
      "default",
      {"discardComments": {"removeAll": true}}
    ]
  }
}
```   

或者：   

```js
const defaultPreset = require('cssnano-preset-default');

module.exports = defaultPreset({
    discardComments: {
        removeAll: true,
    },
});
```    

`cssnano.config.js` 主要在使用接受函数做参数的转换时有用。    

如果配置文件也没设置 preset 的话，那么就使用默认的。    

### Options syntax

注意貌似是这样的，当前好像只有两种预设，然后每种包含了很多的转换规则，每个转换规则又其实是
一个个 postcss 包，所有可能我们可以对每种预设的某个规则进行操作，比如说设置选项。   

上面提到的选项语法是符合一种简单的模式的—— 可选的规则包的 `postcss-` 前缀是可以移除的，然后
把剩下的内容转换为驼峰的写法，比如说我们想为 `postcss-svgo` 设置选项：   

```js
module.exports = {
    plugins: [
        require('cssnano')({
            preset: ['default', {
                svgo: {
                    plugins: [{
                        removeDoctype: false,
                    }],
                },
            }],
        }),
    ],
};
```    

### Excluding transforms

有时我们可能想要在预设中关闭某项转换，有两种方式可以实现这个目的。第一种是设置选项值为 `false`：  

```js
module.exports = {
    plugins: [
        require('cssnano')({
            preset: ['default', {
                svgo: false,
            }],
        }),
    ],
};
```   

另一种是在选项中设置一个 `exclude` 选项，这应该是个布尔值:   

```js
module.exports = {
    plugins: [
        require('cssnano')({
            preset: ['default', {
                svgo: {
                    exclude: true,
                },
            }],
        }),
    ],
};
```    

## 高级转换

高级转换是会包含一些风险的。   

高级转换并没有和 cssnano 打包在一起，需要单独安装：   

`npm install cssnano-preset-advanced --save-dev`    


## 具体的转换规则

注意貌似高级预设是启用了下面所说的所有规则的，而默认预设是有几个没启用的。    

### autoprefixer

默认预设关闭。   

基于 `browsers` 选项移除不必要的前缀。但是注意默认情况下，这个转换不会添加新的前缀。   

### cssnano-util-raw-cache

当 cssnano 与其他 PostCSS 插件结合使用时，这个会常规化生成规则生成的空白。（不是很理解）   

貌似是会对生成的 AST 的节点的原始值的格式进行处理。      

### postcss-calc  

尽可能的减少 calc 表达式。    

```css
/* before */
.box {
    width: calc(2 * 100px);
}

/* after */
.box {
  width: 200px;
}
```    

### postcss-colormin

在十六进制，hsl，rgb 和 CSS 关键字之间转换，确保生成最小等价的颜色值。   

### postcss-convert-values

将长度值，时间值和角度值转换为等价的值。默认情况下，长度值不会转换。   

貌似是有如下选项：   

+ `length`：布尔值，默认 `true`，如果设为 `false`则会禁用将 `px` 转换为其他绝对单位。那就奇怪了，
说好的默认不转换长度值呢。    
+ `time`
+ `angle`   
+ `precision` boolean|number，默认 `false`，指定要对像素值近似时，小数点后的数字的尾数。默认
`false`表示不会进行近似操作。   

需要注意的是在使用时传入这些选项没用啊。长度值不会转换。不清楚哪里出了问题。   

### postcss-discard-comments

移除所有的注释。不过默认情况以 `!` 开头的注释不会移除。   

### postcss-discard-duplicates

移除重复的规则，at-rules 和声明。注意必须是完全相同的重复才行。   

### postcss-discard-empty

移除空的规则、媒体查询及没有任何选择器的规则。    

### postcss-discard-overridden  

移除有相同标识符的 at-rules，例如两个 `@keyframes one`。因为浏览器最终只会使用这个相同
规则的最后一个，所以就可以移除所有前边的。   

```css
/* before */
@keyframes one {
    0% {
        opacity: 1;
    }
    to {
        opacity: 0;
    }
}
@keyframes one {
    0% {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(359deg);
    }
}
.box {
    animation-name: one;
}

/* after */
@keyframes one {
    0% {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(359deg);
    }
}
.box {
    animation-name: one;
}
```   

### postcss-discard-unused  

默认预设关闭。   

应该是移除所有在 CSS 文件中未匹配的 at-rules。所有需要注意的是如果我们其他的样式表用了这个
规则，这个移除就是不安全的。   

```CSS
/* before */
@keyframes fadeOut {
    from {
        opacity: 1;
    }
    to {
        opacity: 0;
    }
}

/* after */
/* (removed) */
```   

### postcss-merge-idents

默认预设关闭。   

看例子是只对 `@keyframes` 有效，主要是合并关键帧内容相同但名字不同的关键帧吧。而且看例子还会
修改使用这些关键帧的名字，所有如果我们 JS 中依赖这些动画名，这就是不安全的。       

```css
/* before */
@keyframes fadeOut {
    from {
        opacity: 1;
    }
    to {
        opacity: 0;
    }
}
@keyframes dissolve {
    from {
        opacity: 1;
    }
    to {
        opacity: 0;
    }
}
.box {
    animation-name: dissolve;
}

/* after */
@keyframes fadeOut {
    from {
        opacity: 1;
    }
    to {
        opacity: 0;
    }
}
.box {
    animation-name: fadeOut;
}
```   

### postcss-merge-longhand  

将展开的长属性折叠到简写的短属性中。而且还可能会合并 `margin, padding,border` 中不同方向的值。      

```css
/* before */
.box {
    margin-top: 10px;
    margin-right: 20px;
    margin-bottom: 10px;
    margin-left: 20px;
}

/* after */
.box {
    margin: 10px 20px;
}
```   

### postcss-merge-rules

合并选择器相同的相邻的规则。    

```css
.box {
    color: blue;
}
.box {
    font-weight: 700;
}

/* after */
.box {
    color: blue;
    font-weight: 700;
}
```   

### postcss-minify-font-values

规范化 font 和 font-family 声明，并且将 font weight 关键字转换为数字。   

```css
.box {
    font-family: "Helvetica Neue", Arial, Arial, sans-serif;
    font-weight: normal;
}

/* after */
.box {
    font-family: Helvetica Neue, Arial, sans-serif;
    font-weight: 400;
}
```   

### postcss-minify-gradients

规范化线性渐变和径向渐变的参数。   

```css
.box {
    background: linear-gradient(to bottom, #ffe500 0%, #ffe500 50%, #121 50%, #121 100%);
}

/* after */
.box {
    background: linear-gradient(180deg, #ffe500, #ffe500 50%, #121 0, #121);
}
```   

### postcss-minify-params

移除 at-rules 中的没必要的空格及规范化其参数。   

```css
@media only screen   and ( min-width: 400px, min-height: 500px ) {
    .box {
        color: blue;
    }
}

/* after */
@media only screen and (min-width:400px,min-height:500px) {
    .box {
        color: blue;
    }
}
```   

### postcss-minify-selectors  

移除没必要的通用选择器，带引号属性选择符的引号，以及规范化选择器中字符。    

```css
*.box
.box::before
.box       .box
[class*="box"]
.box ~ [class] {
    color: red;
}

/* after */
.box
.box:before
.box .box
[class*=box]
.box~[class] {
    color: red;
}
```   

### postcss-normalize-charset

确保每个 CSS 文件中只有一个 `@charset` 声明，并且将其移到顶部，不过默认情况下不会添加新的 `@charset`规则。　　　


### postcss-normalize-display-values

规范化 `display` 的属性值为单一值。（话说我还不知道能加两个值？）   

```css
.box {
    display: block flow;
}

/* after */
.box {
  display: block;
}
```   

### postcss-normalize-positions  

规范化 `background, background-position, -webkit-perspective-origin, perspective-origin`
中的 `position` 值。   

```css
.box {
    background: 30% center / 50% 50%;
}

/* after */
.box {
    background: 30% / 50% 50%;
}
```   

### postcss-normalize-repeat-style  

尽可能的将两个值的 `background-repeat` 属性缩减为一个值。    

```css
.box {
    background-repeat: no-repeat repeat;
}

/* after */
.box {
    background-repeat: repeat-y;
}
```   

### postcss-normalize-string   

为了更好的 gzip 压缩，应该是统一化引号的用法，默认都为双引号。   

```css
.box {
    quotes: '«' "»";
    content: 'This is a string which is \
broken over multiple lines.';
}

/* after */
.box {
    quotes: "«" "»";
    content: "This is a string which is broken over multiple lines.";
}
```   

### postcss-normalize-timing-functions  

规范化 `animation, animation-timing-function, transition, transition-timing-function`
中的过渡函数值。   

```css
.box {
    transition: color 3s steps(30, end);
}

/* after */
.box {
    transition: color 3s steps(30);
}
```   

### postcss-normalize-unicode

先略。   

### postcss-normalize-url

规范化 URL 字符串，可能会移除默认的端口，解决没必要的目录遍历，去除引号。   

```css
.box {
    background: url("./css/../img/cat.jpg");
}

/* after */
.box {
    background: url(img/cat.jpg);
}
```   

### postcss-normalize-whitespace  

移除空格。    

```css
.box {
    text-decoration: underline;
    color: red !important;
}

/* after */
.box{text-decoration:underline;color:red!important}
```   

### postcss-ordered-values  

受这个转换影响的属性可以是任意顺序的值。这个规则会规范化成正确的顺序。   

```css
.box {
    border: solid 1px red;
    border: #fff solid 1px;
}

/* after */
.box {
    border: 1px solid red;
    border: 1px solid #fff;
}
```   

### postcss-reduce-idents  

默认预设关闭。

重命名 `@keyframes`。不过由于会修改名字，所以是不安全的。    

### postcss-reduce-initial   

当用实际的值替换了 `initial` 关键字时更短的话就替换掉。   

```css
.box {
    min-width: initial;
}

/* after */
.box {
    min-width: 0;
}
```   

### postcss-reduce-transforms

将变形函数替换为更短的版本。   

```css
.box {
    transform: translate3d(0, 0, 0);
}

/* after */
.box {
    transform: translateZ(0);
}
```   

### postcss-svgo

使用 SVGO 压缩内联的 SVG。   

### postcss-unique-selectors

为每条规则的选择器排序并移除重复的。   

```css
.box, .boxB, .boxA, .box {
    color: red;
}

/* after */
.box, .boxA, .boxB {
    color: red;
}
```   

### postcss-zindex

默认预设关闭。   

重新设置 z-index 值。  
