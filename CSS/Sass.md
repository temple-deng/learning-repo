# Sass

## 1. 变量

#### 默认变量

默认变量仅需要在值后面加上 `!default` 即可。  

`$baseLineHeight: 1.5 !default;`  

#### 全局变量

定义变量的时候可以后面带上`!global`标志，在这种情况下，变量在任何地方可见:     

```sass
#main {
  $width: 5em !global;
      width: $width;
}

#sidebar {
  width: $width;
}
```     

#### 特殊变量

一般我们定义的变量都为属性值，可直接使用，但是如果变量作为属性名或者选择器，要以#{$variables}形式使用。  

```sass
$borderDirection:       top !default;
$baseFontSize:          12px !default;
$baseLineHeight:        1.5 !default;

//应用于class和属性
.border-#{$borderDirection}{
  border-#{$borderDirection}:1px solid #ccc;
}
//应用于复杂的属性值
body{
    font:#{$baseFontSize}/#{$baseLineHeight};
}
```


## 2. 嵌套

####　\@at-root

`@at-root`用来跳出选择器嵌套的。默认所有的嵌套，继承所有上级选择器，但有了这个就可以跳出所有上级选择器。  

#### &

`&` 应该最终会被替换为父选择器的字符，必须出现在的选择器的开头位置，但可以跟随后缀，将被添加到父选择的后面。 例如：   

```Sass
#main {
  color: black;
  &-sidebar { border: 1px solid; }
}
```      

编译为：   

```css
#main {
  color: black; }
  #main-sidebar {
    border: 1px solid; }
```     


## 3. 混合 mixin

#### 多个参数mixin

调用时可直接传入值，如 `@include`传入参数的个数小于 `@mixin`定义参数的个数，则按照顺序表示，后面不足的使用默认值，如不足的没有默认值则报错。除此之外还可以选择性的传入参数，使用参数名与值同时传入。  

```Sass
@mixin horizontal-line($border:1px dashed #ccc, $padding:10px){
    border-bottom:$border;
    padding-top:$padding;
    padding-bottom:$padding;  
}
.imgtext-h li{
    @include horizontal-line(1px solid #ccc);
}
.imgtext-h--product li{
    @include horizontal-line($padding:15px);
}
```  

#### 多组值参数mixin

如果一个参数可以有多组值，如box-shadow、transition等，那么参数则需要在变量后加三个点表示，如$variables...。  

```Sass
@mixin box-shadow($shadow...) {
  -webkit-box-shadow:$shadow;
  box-shadow:$shadow;
}
.box{
  border:1px solid #ccc;
  @include box-shadow(0 2px 2px rgba(0,0,0,.3),0 3px 3px rgba(0,0,0,.3),0 4px 4px rgba(0,0,0,.3));
}
```  

## 4. 继承

#### 占位选择器 `%`  

## 5. 条件判断及循环

#### @if

`@if` 可一个条件单独使用，也可以和`@else`结合多条件使用。  

```Sass
$lte7: true;
$type: monster;
.ib{
    display:inline-block;
    @if $lte7 {
        *display:inline;
        *zoom:1;
    }
}
p {
  @if $type == ocean {
    color: blue;
  } @else if $type == matador {
    color: red;
  } @else if $type == monster {
    color: green;
  } @else {
    color: black;
  }
}
```  

#### for循环

for循环有两种形式，分别为：`@for $var from <start> through <end>`和`@for $var from <start> to <end>`。`$i`表示变量，`start`表示起始值，`end`表示结束值，这两个的区别是关键字`through`表示包括`end`这个数，而`to`则不包括`end`这个数。  


## 6. 数据类型

Sass 支持7中主要的数据类型：    

+ 数字（例如：`1.2, 13, 10px`）
+ 文本字符串，带引号字符串和不带引号字符串（例如：`"foo", 'bar', baz`）
+ 布尔值（例如：`true, false`）
+ 颜色（例如: `blue, #04a3f9, rgba(255, 0, 0, 0.5)`
+ 空值（例如：`null`）
+ 值列表(list)，用空格或逗号分隔（例如：`1.5em 1em 0 2em, Helvetica, Arial, sans-serif`）
+ maps，从一个值映射到另一个（例如：`(key1: value1, key2: value2)`   


#### 列表

列表(lists) 是指 Sass 如何表示在CSS声明的，类似margin: 10px 15px 0 0 或 font-face: Helvetica, Arial, sans-serif这样的值，列表只是一串其他值，无论是用空格还是用逗号隔开。事实上，独立的值也被视为列表：只包含一个值的列表。    

列表本身没有太多的功能，但 Sass list functions 赋予了数组更多新功能：nth 函数可以直接访问数组中的某一项；join 函数可以将多个数组连接在一起；append 函数可以在数组中添加新值；而 \@each 指令能够遍历数组中的每一项。
