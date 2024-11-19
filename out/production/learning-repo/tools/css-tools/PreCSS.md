# PreCSS

PreCSS 是一个可以让我们在 CSS 文件中使用类 Sass 标记的工具，例如变量，mixins，条件语句等等。   

## 用法

### 安装  

先要装 PreCSS: `npm install precss --save-dev`   

然后还要装 postcss-scss: `npm install postcss-scss --save-dev`   

### gulp  

```javascript
var postcss = require('gulp-postcss');

gulp.task('css', function () {
    return gulp.src('./css/src/*.css').pipe(
        postcss([
            require('precss')({ /* options */ })
        ])
    ).pipe(
        gulp.dest('./css')
    );
});
```    

## 功能

### 差别

注意上面提到了是类 Sass 的标记，所有和 Sass 语法其实还是有很多区别的：    

+ 变量方面，在非属性值的地方使用变量时需要注意，貌似是在例如选择器的部分使用变量时也可以直接 `$var`,
还可以 `$(var)`，不过在属性值中如果是进行类似字符串拼接时好像必须是 `$(var)` 参考下面循环中的例子。  
+ 嵌套方面，貌似简写属性是不能用嵌套的语法了，但是选择器还可以，也支持 `&` 和 `@at-root` 规则
+ mixin 方面，定义 mixin 由 `@mixin name($argu)` 改为了 `@define-mixin name $argu` 注意参数
部分是不加括号了，使用 mixin 部分由 `@include name argu` 改为 `@mixin name argu`，注意多个参数
的时候使用逗号 `,` 分隔的。   
+ extend 方面，貌似是不支持对已有规则的继承了，只能类似于 `%` 的继承，使用 `@define-extend` 定义
一个被继承的规则，注意这个规则不会被编译出来，继承时使用 `@extend`。       

### 变量  

```scss
/* before */

$blue: #056ef0;
$column: 200px;

.menu {
	width: calc(4 * $column);
}

.menu_link {
	background: $blue;
	width: $column;
}

/* after */

.menu {
	width: calc(4 * 200px);
}

.menu_link {
	background: #056ef0;
	width: 200px;
}
```    

### 条件

```scss
/* before */

.notice--clear {
	@if 3 < 5 {
		background: green;
	}
	@else {
		background: blue;
	}
}

/* after */

.notice--clear {
	background: green;
}
```   

### 循环  

```scss
/* before */

@for $i from 1 to 3 {
	.b-$i { width: $(i)px; }
}

/* after */

.b-1 {
	width: 1px
}
.b-2 {
	width: 2px
}
.b-3 {
	width: 3px
}
```   

注意这里的循环 `to` 是包含尾端值的。   

```scss
/* before */

@each $icon in (foo, bar, baz) {
	.icon-$(icon) {
		background: url('icons/$(icon).png');
	}
}

/* after */

.icon-foo {
	background: url('icons/foo.png');
}

.icon-bar {
	background: url('icons/bar.png');
}

.icon-baz {
	background: url('icons/baz.png');
}
```   

### Mixins

```scss
/* before */

@define-mixin icon $name {
	padding-left: 16px;

	&::after {
		content: "";
		background-image: url(/icons/$(name).png);
	}
}

.search {
	@mixin icon search;
}

/* after */

.search {
	padding-left: 16px;
}

.search::after {
	content: "";
	background-image: url(/icons/search.png);
}
```   

的确是类 Scss 的语法，仔细看这里的 mixins 和 Scss 中是不一样的。    

### Extends   

```Scss
/* before */

@define-extend bg-green {
	background: green;
}

.notice--clear {
	@extend bg-green;
}

/* after */

.notice--clear {
	background: green;
}
```   

### Imports

```Sass
/* Before */

@import "partials/base"; /* Contents of partials/_base.css: `body { background: black; }` */
/* 这里加不加 css 后缀好像都一样 */


/* After */

body { background: black; }
```    

### Property Lookup

```scss
/* Before */

.heading {
	margin: 20px;
	padding: @margin;
}

/* After */

.heading {
	margin: 20px;
	padding: 20px;
}
```   

### Root   

```scss
/* Before */

.parent {
	background: white;

	@at-root{
		.child {
			background: black;
		}
	}
}

/* After */

.child {
	background: black;
}

.parent {
	background: white;
}
```   

由这个能看出也是支持嵌套选择器的及 `&` 选择符的。    

```scss
/* before */

$left: left;
div {
  &::hover {
      border-$(left): 1px solid 'red';
  }
}   

/* after */  
div::hover {
  border-left: 1px solid 'red';
}
```   
