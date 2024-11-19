# Smarty

## 1. 基本语法

Smarty的标签都是使用定界符括起来。 默认定界符是 { 和 }。   

### 1.1 注释

模板中的注释是星号开头，然后外面包含着定界符，就像这样：  

```php
{* 这是一个注释 *}
```    

### 1.2 变量

模板变量以美元符号$开头，由字母、数组和下划线组成，和 PHP 变量类似。    

配置变量是例外的，它不是以美元符号$开头，而是放到两个井号中间 #hashmarks#，或者通过
`$smarty.config` 来使用。   

```php
{$foo}
{$foo[4]}
{$foo->bar}
{#foo#}
{$smarty.config.foo}
{$foo[bar]}   <-- 仅在循环的语法内可用，见 {section}
{assign var=foo value='baa'}{$foo}   <-- 显示 "baa"，见 {assign}
```    

注意上面的点运算符，应该是 smarty 添加的。   

### 1.3 函数

每个Smarty的标签都可以是 **显示一个变量** 或者 **调用某种类型的函数**。调用和显示的方式是在
定界符内包含了函数和其属性，如：`{funcname attr1="val1" attr2="val2"}`。    

```php
{include file="header.tpl"}
{if $logged_in}
  Welcome, <span style="color:{#fontColor#}">{$name}!</span>
{else}
  hi, {$name}
{/if}
```   

- 包括内置函数和自定义函数都是用同样的语法调用
- 内置函数是工作在Smarty内部的函数, 类似 `{if}`, `{section}` 和 `{strip}` 等等。它们不
需要进行修改或者改变。
- 自定义函数是通过插件定义的额外的函数。你可以任意修改自定义函数，或者创建一个新的函数。    

### 1.4 属性

大多数函数都会使用属性来定义或者修改它们的行为。Smarty函数中的属性比较像HTML语法中的属性。静态
值不需要引号引起来，但必须是纯字符串。带或不带修饰器的变量都可以使用，而且也不需要引号，甚至可以
使用PHP函数的结果，插件结果和复杂的表达式。    

```php
{include file="header.tpl" nocache}
{include file=$includeFile}
```    

### 1.5 双引号中嵌入变量

Smarty可以识别出在双引号中嵌套的变量值，这些变量名称必须只包括字母、数字和下划线。    

另外，带有其他字符的，如点号（.）或者 `$object->reference` 形式的变量，必须用 \` 单引号括起来。    

Smarty3中允许在双引号中嵌入Smarty的标签并运行。如果你需要在双引号的变量上使用修饰器、插件或者
PHP函数等，这是非常有用的。    

```php
{func var="test $foo test"}
{func var="test `$foo[0]` test"}
{func var="test `$foo.bar` test"}
{func var="test {$foo|escape} test"}
```   

### 1.6 避免 Smarty 解析

有时候部分模板中的代码是不需要或者不希望被Smarty解析的，比较典型的例子是嵌入在页面HTML中的
Javascript或CSS代码。问题通常发生在这些语言会经常使用 { 和 }，但{ 和 }也恰好是Smarty的定界符。   

Smarty模板中，当{ 和 }定界符两边都是空格的时候，将会被自动忽略解析。此特性可以通过设置Smarty
的成员变量 `$auto_literal` 为false来关闭。    

```php
{literal}
  function bazzy {alert("foobar!")}
{/literal}
```    

`{literal}...{/literal}` 可以让块中间的内容忽略 Smarty 的解析。   

## 2. 变量修饰器

变量修饰器可以用于变量，自定义函数或者字符串。使用修饰器，需要在变量的后面加上 \|（竖线）并且
跟着修饰器名称。修饰器可能还会有附加的参数以便达到效果。参数会跟着修饰器名称，用:（冒号）分开。
同时，默认全部PHP函数都可以作为修饰器来使用 (不止下面的)，而且修饰器可以被联合使用。    

```php
{html_table loop=$myvar|upper}

{html_table loop=$myvar|truncate:40:"..."}

{"foobar"|upper}

{mailto|upper address="smarty@example.com"}
```   

+ capitalize: 使变量内容里的每个单词的第一个字母大写。   
+ cat: 连接多个变量。   
  - string: 需要连接的变量
+ count_characters: 计算变量内容里有多少个字符。    
  - boolean(false): 计算总数时是否包括空格字符
+ count_paragraphs: 计算变量内容有多少个段落。   
+ count_sentences: 计算变量内容有多少个句子。每个句子必须以点号、问号或者感叹号结尾。(.?!)    
+ count_words: 用于计算变量内容有多少个单词。
+ date_format: 将日期和时间格式化成 `strftime()` 的格式。时间可以是unix时间戳, DateTime
对象, mysql时间戳，或者月日年格式的字符串。
  - string(%b, %e, %Y): 输入时间的格式定义
+ default: 为变量设置默认值
+ escape: escape可用于将变量编码或转换成 html, url, 单引号, 十六进制, 十六进制实体,
javascript 和电邮地址。默认是：html。   
+ from_charset: from_charset转换变量到内置字符集。
  - string: 需要转换的字符集名称
+ indent: 缩进每一行的字符串，默认是缩进4个空格。可选的参数可以设置缩进的空格数量。可选的第二个
参数设置缩进使用的字符，如用 "\t" 来代替空格缩进。
+ lower: 将变量值转成小写字母。
+ nl2br: 将变量值中的"\n"回车全部转换成HTML的 `<br />`。 
+ regex_replace: 用正则表达式搜索和替换变量值。
  - string: 正则表达式
  - string: 替换的字符
+ replace: 对变量进行简单的搜索和替换。
  - string: 需要搜索并替换的字符
  - string: 替换用的字符
+ spacify: 在变量的字符串中插入空格。你可以设置插入的是空格或者别的字符。
  - string: 插入字符间的字符
+ string_format: 格式化字符串，如浮点数等。
  - string: 指定哪种格式
+ strip: 转换连续空格，回车和tab到单个空格或是指定字符串。
+ strip_tags: 去除标记等任何包含在 &lt; 和 &gt; 中间的字符。
+ to_charset: 将变量值由当前内置字符集转换到指定字符集。
+ truncate: 截取字符串到指定长度，默认长度是80. 第二个参数可选，指定了截取后代替显示的字符。
截取后的字符长度是截取规定的长度加上第二个参数的字符长度。默认truncate会尝试按单词进行截取。如
果你希望按字符截取（单词可能会被截断）需要设置第三个参数TRUE。    
+ unescape: unescape可以解码entity, html 和 htmlall等的编码。
+ upper: 将变量值转成大写字母。
+ wordwrap: 限制一行字符的长度（自动换行），默认是80个字符长度。可选的第二个参数，可自定义换行
字符，默认换行字符是 "\n"。默认情况下，是根据单词来换行的，也就是按英文语法的自动换行。如果你希
望按照字符来换行（边界的单词将拆开），那么可以设置可选的第三个参数为TRUE
  - integer: 一行的长度
  - string: 换行符号
  - boolean: 设置按单词换行还是字符换行


