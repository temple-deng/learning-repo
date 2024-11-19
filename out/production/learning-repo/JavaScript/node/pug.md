# pug(2.0.0)

## API Reference

### options

所有的API 方法都接受下面的配置参数：   

**filename**: string   
需要编译的文件名。用于异常信息以及使用相对路径的包含（`include`\s）和扩展（`extend`\s）操作。默认是 'Pug'。      

**basedir**: string   
所有绝对定位包含的根目录。   

**doctype**: string   
如果模板中没有指定`doctype`，可以在这里指定它。在一些需要控制自闭合标签和布尔值属性的代码样式的时候非常有用。    

**pretty**: boolean | string   
[已废弃]在输出的 HTML 里添加 `'  '` 这样的空格缩进来获得更好的代码可读性。如果这里指定的是一个字符串（比如 `'\t'`），那么将会使用它来作为控制缩进的字符。默认为 `false`。   

**filters**: object   
存放自定义过滤器的哈希表。默认为 `undefined`。   

**self**: boolean    
将局部变量保存到 `self` 命名空间中。这会加速编译过程，但是相反的，在使用 `variable` 时必须写成
`self.variable`。默认是 `false`。    

**debug**: boolean    
如果设为`true`，编译产生的函数代码会被记录到标准输出。    

**compileDebug**: boolean   
如果设为`true`，为了提供更好的错误信息，函数代码会被添加到编译的模板中。默认启用的，在 production 下需要关闭。   

**globals**: Array&lt;string&gt;    
添加一系列全局变量名以便模板的访问。    

**cache**: boolean   
如果设为`true`，编译的函数是可以缓存的。`filename`必须设置成缓存的键。只能应用在 `render` 函数上。
默认是 `false`。    

**inlineRuntimeFunctions**: boolean    
相对于使用 `require` 来获得公用的运行时函数，是否需要直接嵌入这些运行时函数。对于 `compileClient` 函数，
默认是 `true`。对于其他的编译或者渲染类型，默认是 `false`。    

**name**: string   
模板函数的名字，只能应用在 `compileClient` 函数。默认是 `'template'`。    

### 方法

#### pug.compile(source, ?options)

将一个 Pug 模板编译成函数，以便可以在使用不同的局部变量时渲染多次。    

**source**: string   
Pug 模板源内容。    

**options**: ?options    
一个配置参数对象。    

**return**: function   
一个用来根据包含了局部变量的对象生成HTML内容的函数。    

```javascript
var pug = require('pug');

// 编译成函数
var fn = pug.compile('string of pug', options);

// 渲染函数
var html = fn(locals);
// '<string>of pug</string>'
```    

#### pug.compileFile(path, ?options)

将一个 Pug 模板文件编译成函数，以便可以在使用不同的局部变量时渲染多次。   

**path**: string   
Pug 文件的路径。    

**options**: ?options   
一个配置参数对象。    

**return**: function   
一个用来根据包含了局部变量的对象生成HTML内容的函数。       

```javascript
var pug = require('pug');

// 编译成函数
var fn = pug.compileFile('path to pug file', options);

// 渲染函数
var html = fn(locals);
// => '<string>of pug</string>'   
```    

#### pug.compileClient(source, ?options)  

将Pug模板编译成一个JS字符串，它可以直接用在浏览器上通过附带的 Pug 的运行时库。    

**path**: string   
需要编译的Pug模板。    

**options**: ?options   
一个配置参数对象。    

**return**: string   
一个代表函数的 JavaScript 字符串。    

```javascript
var pug = require('pug');

// 编译成函数
var fn - pug.compileClient('string of pug', options);    

// 渲染函数
var html = fn(locals);     
// => 'function template(locals) {return "<string>of pug</string>";}'   
```   

这是在逗我？返回字符串怎么还能调用。     

#### pug.compileClientWithDependenciesTracked(source, options)

类似于 `compileClient`，处理这个方法返回下面形式的对象：    

```json
{
  'body': 'function (locals) {...}',
  'dependencies': ['filename.pug']
}
```    

您应该在需要 `dependencies` 来实现一些诸如“监视 Pug 文件变动”的功能的时候，才使用该函数。     

#### pug.compileFileClient(path, ?options)

将Pug模板文件编译成可以与客户端一起使用的Pug运行时的JavaScript字符串。（这家伙是通过在模板中新增JS代码实现的嘛？）         

**path**: string    
Pug文件的路径。    

**options**: ?options     
配置对象。    

**options.name**: string    
如果传递一个 `name` 属性给 options，这个参数会用来做客户端模板函数的名字。     

**returns** string     

一个 JavaScript 函数主体。     

例如，模板文件内容如下：    

```
h1 This is a Pug template
h2 By #{author}   
```    

之后将模板文件编译成一个函数字符串：    

```javascript
var fs = require('fs');
var pug = require('pug');

// 将模板编译成函数字符串   
var jsFunctionString = pug.compileFileClient('/path/to/pugFile.pug', { name: "fancyTemplateFun"});

fs.writeFileSync("templates.js", jsFunctionString);
```     

现在 `template.js` 里的内容可能如下：    

```javascript
function fancyTemplateFun(locals) {
  var buf = [];
  var pug_mixins = {};
  var pug_interp;

  var locals_for_with = (locals || {});

  (function (author) {
    buf.push("<h1>This is a Pug template</h1><h2>By "
      + (pug.escape((pug_interp = author) == null ? '' : pug_interp))
      + "</h2>");
  }.call(this, "author" in locals_for_with ?
    locals_for_with.author : typeof author !== "undefined" ?
      author : undefined)
  );

  return buf.join("");
}
```   

确保将 Pug 运行时库(`node_modules/pug/runtime.js`)也发送给客户端。    

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="/runtime.js"></script>
    <script src="/templates.js"></script>
  </head>

  <body>
    <h1>This is one fancy template.</h1>

    <script type="text/javascript">
      var html = window.fancyTemplateFun({author: "enlore"});
      var div = document.createElement("div");
      div.innerHTML = html;
      document.body.appendChild(div);
    </script>
  </body>
</html>
```     

#### pug.render(source, ?options, ?callbacks)

**source**: string   
要渲染的Pug 模板源。   

**options**: ?options    
一个配置选项参数，也可以用来作局部变量对象。   

**callback**: ?function   
Node.js 风格的回调函数，接受渲染的结果做参数。这个回调时同步调用的。    

**returns**: string    
最终的HTML字符串。    

```javascript
var pug = require('pug');

var html = pug.render('string of pug', options);
// => '<string>of pug</string>'
```    

#### pug.renderFile(path, ?options, ?callback)

**path**: string   
要渲染的Pug 模板文件的路径。   

**options**: ?options    
一个配置选项参数，也可以用来作局部变量对象。   

**callback**: ?function   
Node.js 风格的回调函数，接受渲染的结果做参数。这个回调时同步调用的。    

**returns**: string    
最终的HTML字符串。  


```javascript
var pug = require('pug');

var html = pug.renderFile('path/to/file.pug', options);
// ...
```    

### 属性

#### pug.filters

属性以被废弃。   

定制 filters 的哈希表。    

这个对象使用与 `filters` 选项一样的语法。不是可以应用在全局Pug编译上。当一个filter既出现在
`pug.filters` 又出现在 `options.filters` 中， `filters` 选项优先级高。   


## Language Reference

### 属性

标签属性与HTML中的类似(可选的用逗号做分隔)，不过它们的值只是常规的 JavaScript。（下面的内容使用管道符 `|` 作为 whitespace control）。    

```javascript
a(href='google.com') Google
|
|
a(class='button' href='google.com') Google
|
|
a(class='button', href='google.com') Google
```    

编译成：     

```html
<a href="google.com">Google</a>
<a class="button" href="google.com">Google</a>
<a class="button" href="google.com">Google</a>
```    

可以使用JS表达式：   

```javascript
- var authenticated = true
body(class=authenticated ? 'authed' : 'anon')
```   

编译成：   

`<body class="authed"></body>`    

##### 多行属性

如果有多个属性，可以写到多行中：   

```pug
input(
  type='checkbox'
  name='agreement'
  checked
)
```

编译成`<input type="checkbox" name="agreement" checked="checked" />`。    


也可以使用模板字符串：    

```javascript
input(data-json=`
  {
    "very-long": "piece of ",
    "data": true
  }
`)
```   

编译成：    

```html
<input data-json="
  {
    &quot;very-long&quot;: &quot;piece of &quot;,
    &quot;data&quot;: true
  }
" />
```   

##### 引号括起来的属性

如果您的属性名称中含有某些奇怪的字符，并且可能会与 JavaScript 语法产生冲突的话，请您将它们使用 "" 或者  '' 括起来。您还可以使用逗号来分割不同的属性。   

```
div(class='div-class', (click)='play()')
div(class='div-class' '(click)'='play()')
```  

编译成：   

```html
<div class="div-class" (click)="play()"></div>
<div class="div-class" (click)="play()"></div>
```    

##### 属性插值

可以使用下面的方式将变量插入到属性中：    

+ 直接用JS写属性   

```javascript
- var url = 'pug-test.html';
a(href='/' + url) Link
|
|
- url = 'https://example.com/'
a(href=url) Another link
```    

编译成：   

```html
<a href="/pug-test.html">Link</a>
<a href="https://example.com/">Another link</a>
```   

+ 或者使用模板字符串    

```javascript
- var btnType = 'info'
- var btnSize = 'lg'
button(type='button' class='btn btn-' + btnType + ' btn-' + btnSize)
|
|
button(type='button' class=`btn btn-${btnType} btn-${btnSize}`)
```   

编译成：   

```html
<button type="button" class='btn btn-info btn-lg'></button>
<button type="button" class="btn btn-info btn-lg"></button>
```    

##### 未转义的属性

默认情况下所有属性都会转义，如果需要使用特殊的字符，使用 `!=`。   

```javascript
div(escaped="<code>")
div(unescaped!="<code>")
```   

编译成：   

```html
<div escaped="&lt;code&gt;"></div>
<div unescaped="<code>"></div>
```    

##### 布尔值属性

```
input(type='checkbox' checked)
|
|
input(type='checkbox' checked=true)
|
|
input(type='checkbox' checked=false)
|
|
input(type='checkbox' checked=true.toString())
```    

编译成：   

```html
<input type="checkbox" checked="checked" />
<input type="checkbox" checked="checked" />
<input type="checkbox" />
<input type="checkbox" checked="true" />
```    

不过如果 doctype 是 `html`，则不会创建镜像属性。除非像上面最后一个指定字符串。    

##### 样式属性

`style` 属性可以像其他属性一样是个字符串，但是也可以是一个对象。   

`a(style={color: 'red', background: 'green'})`   

`<a style="color:red;background:green;"></a>`       

##### 类属性

`class` 也可以是字符串，或者是个类名的数组。   

```
- var classes = ['foo', 'bar', 'baz']
a(class=classes)
|
|
//- the class attribute may also be repeated to merge arrays
a.bang(class=classes class=['bing'])
```   

```html   
<a class="foo bar baz"></a>
<a class="bang foo bar baz bing"></a>
```   

这里的语法挺奇怪的。    

也可以是一个对象，类名做键名，键值为 true 或 false。   

```
- var currentUrl = '/about'
a(class={active: currentUrl === '/'} href='/') Home
|
|
a(class={active: currentUrl === '/about'} href='/about') About
```   

```html  
<a href="/">Home</a>
<a class="active" href="/about">About</a>
```    

##### 类名直接量

类名也可以用 `.classname` 的语法直接定义：   

`a.button`-> `<a class="button"></a>`   

由于`div` 是一个普遍使用的标签，是默认使用的标签，可以直接使用标签名：  

`.content` -> `<div class="content"></div>`    

##### ID 直接量

`a#main-link` -> `<a id="main-link"></a>`   

`#content` -> `<div id="content"></div>`   

##### &attributes

`&attributes` 语法可以用来将一个对象导入到元素的属性中：  

`div#foo(data-bar="foo")&attributes({'data-foo': 'bar'})`   

`<div id="foo" data-bar="foo" data-foo="bar"></div>`   

注意使用这种语法添加的属性不会自动转义。    

### Case 条件控制

`case` 是JS中 `switch` 的缩写。格式如下：   

```javascript
- var friends = 10
case friends
  when 0
    p you have no friends
  when 1
    p you have a friend
  default
    p you have #{friends} friends
```      

`<p>you have 10 friends</p>`   

##### 分支传递 (Case Fall Through)

可以像 JavaScript 中的 `switch` 语句那样使用传递（fall through）。    

```javascript
- var friends = 0
case friends
  when 0
  when 1
    p you have very few friends
  default
    p you have #{friends} friends
```   

`<p>you have very few friends</p>`     

不同之处在于，在 JavaScript 中，传递会在明确地使用 `break` 语句之前一直进行。而在 Pug 中则是，传递会在遇到非空的语法块前一直进行下去。    

在某些情况下，如果您不想输出任何东西的话，您可以明确地加上一个原生的 `break` 语句：   

```JavaScript
- var friends = 0
case friends
  when 0
    - break
  when 1
    p you have very few friends
  default
    p you have #{friends} friends
```     

#####　块展开　

您也可以使用块展开的语法：   

```javascript
- var friends = 1
case friends
  when 0: p you have no friends
  when 1: p you have a friend
  default: p you have #{friends} friends
```   

`<p>you have a friend</p>`   

### 代码

可以在模板中嵌入JS代码。有下面3种方式。   

##### Unbuffered Code

Unbuffered Code 用 `-` 开头。不会直接在输出中添加任何东西。   

```javascript
- for (var x = 0; x < 3; x++)
  li item
```    

```html
<li>item</li>
<li>item</li>
<li>item</li>
```   

也支持块级 unbuffered code:   

```javascript
-
  var list = ["Uno", "Dos", "Tres",
          "Cuatro", "Cinco", "Seis"]
each item in list
  li= item
```   

```html
<li>Uno</li>
<li>Dos</li>
<li>Tres</li>
<li>Cuatro</li>
<li>Cinco</li>
<li>Seis</li>
```   

##### Buffered code

Buffered code 使用 `=` 开头。会计算JS表达式，然后输出结果。为安全起见，它将被 HTML 转义：   

```javascript
p
  = 'This code is <escaped>!'
```    

`<p>This code is &lt;escaped&gt;!</p>`   

也可以写成行内形式，同样也支持所有的 JavaScript 表达式：    

`p= 'This code is' + ' <escaped>!'`   

`<p>This code is &lt;escaped&gt;!</p>`    


##### Unescaped Buffered Code

Unescaped Buffered Code 以`!=` 开头。计算JS表达式并输出结果。但是不会执行任何的转义。   

```
p
  != 'This code is <strong>not</strong> escaped!'
```   

`<p>This code is <strong>not</strong> escaped!</p>`  

同上也支持内联格式。    


### Comments

Buffered comments 看起来和JS单行注释相同。但是会生成HTML注释到渲染的页面中。   

```javascript
// just some paragraphs
p foo
p bar
```   

```html
<!-- just some paragraphs-->
<p>foo</p>
<p>bar</p>
```   

Pug 也支持 unbuffered comments。 直接在注释开头添加 `-` 就可以。   

```
//- will not output within markup
p foo
p bar
```   

```html
<p>foo</p>
<p>bar</p>
```    


块级注释如下：   

```
body
  //-
    Comments for your template writers.
    Use as much text as you want.
  //
    Comments for your HTML readers.
    Use as much text as you want.
```   

```html
<body>
  <!--Comments for your HTML readers.
Use as much text as you want.-->
</body>
```   

##### 条件注释

由于所有以 `<` 开头的行都被认为是普通文本，普通的HTML式的条件注释可以工作。   

```pug
doctype html

<!--[if IE 8]>
<html lang="en" class="lt-ie9">
<![endif]-->
<!--[if gt IE 8]><!-->
<html lang="en">
<!--<![endif]-->

body
  p Supporting old web browsers is a pain.

</html>
```   

```html   
<!DOCTYPE html>
<!--[if IE 8]>
<html lang="en" class="lt-ie9">
<![endif]-->
<!--[if gt IE 8]><!-->
<html lang="en">
<!--<![endif]-->

<body>
  <p>Supporting old web browsers is a pain.</p>
</body>

</html>
```   

### 条件控制

```pug
- var user = { description: 'foo bar baz' }
- var authorised = false
#user
  if user.description
    h2.green Description
    p.description= user.description
  else if authorised
    h2.blue Description
    p.description.
      User has no description,
      why not add one...
  else
    h2.red Description
    p.description User has no description
```   

```html
<div id="user">
  <h2 class="green">Description</h2>
  <p class="description">foo bar baz</p>
</div>
```    

还支持一种 `unless`，类似于否定 `if` 的工作方式，下面两种是相等的：  

```pug
unless user.isAnonymous
  p You're logged in as #{user.name}
if !user.isAnonymous
  p You're logged in as #{user.name}
```   

### doctype

`doctype html`  


### includes

includes 可以让我们将Pug文件的内容插入到另一个Pug文件中。   

```
//- index.pug
doctype html
html
  include includes/head.pug
  body
    h1 My Site
    p Welcome to my super lame site.
    include includes/foot.pug
```   

```
//- includes/head.pug
head
  title My Site
  script(src='/javascripts/jquery.js')
  script(src='/javascripts/app.js')
```    

```  
//- includes/foot.pug
footer#footer
  p Copyright (c) foobar
```    

```html
<!DOCTYPE html>
<html>

<head>
  <title>My Site</title>
  <script src="/javascripts/jquery.js"></script>
  <script src="/javascripts/app.js"></script>
</head>

<body>
  <h1>My Site</h1>
  <p>Welcome to my super lame site.</p>
  <footer id="footer">
    <p>Copyright (c) foobar</p>
  </footer>
</body>

</html>
```    

如果路径时绝对路径（例如， `include /root.pug`）。会根据前缀 `options.baseDir` 寻找位置。否则，根据当前编译文件的位置解决。    

也可以将非 pug 文件的内容添加到 pug 文件中。   

```
//- index.pug
doctype html
html
  head
    style
      include style.css
  body
    h1 My Site
    p Welcome to my super lame site.
    script
      include script.js
```   

```css
/* style.css */
/* style.css */
h1 {
  color: red;
}
```   

```javascript
// script.js
console.log('You are awesome');
```   

```html
<!DOCTYPE html>
<html>

<head>
  <style>
    /* style.css */

    h1 {
      color: red;
    }
  </style>
</head>

<body>
  <h1>My Site</h1>
  <p>Welcome to my super lame site.</p>
  <script>
    // script.js
    console.log('You are awesome');
  </script>
</body>

</html>
```   

### Template Inheritance

Pug 支持使用 `block` 和 `extends` 关键字进行模板的继承。一个称之为“块”（block）的代码块，可以被子模板覆盖、替换。这个过程是递归的。    

Pug 的块可以提供一份默认内容，当然这是可选的，见下述 `block scripts`、`block content` 和 `block foot`。    

```
//- layout.pug
html
  head
    title 我的站点 - #{title}
    block scripts
      script(src='/jquery.js')
  body
    block content
    block foot
      #footer
        p 一些页脚的内容
```    

现在我们来扩展这个布局：只需要简单地创建一个新文件，并如下所示用一句 `extends` 来指出这个被继承的模板的路径。您现在可以定义若干个新的块来覆盖父模板里对应的“父块”。值得注意的是，因为这里的 foot 块 没有 被重定义，所以会依然输出"some footer content”"。   

```
//- page-a.pug
extends layout.pug

block scripts
  script(src='/jquery.js')
  script(src='/pets.js')

block content
  h1= title
  - var pets = ['cat', 'dog']
  each petName in pets
    include pet.pug
```    

```
//- pet.pug
p= petName
```   

同样，也可以覆盖一个块并在其中提供一些新的块。如下面的例子所展示的那样，`content` 块现在暴露出两个新的块 `sidebar` 和 `primary` 用来被扩展。当然，它的子模板也可以把整个 `content` 给覆盖掉。    

```
//- sub-layout.pug
extends layout.pug

block content
  .sidebar
    block sidebar
      p nothing
  .primary
    block primary
      p nothing
```         

```   
//- page-b.pug
extends sub-layout.pug

block content
  .sidebar
    block sidebar
      p nothing
  .primary
    block primary
      p nothing
```


##### 块内容的添补 append / prepend

Pug 允许您去替换（默认的行为）、`prepend`（向头部添加内容），或者 `append`（向尾部添加内容）一个块。 假设您有一份默认的脚本要放在 `head` 块中，而且希望将它应用到 每一个页面，那么您可以这样做：   

```
//- layout.pug
html
  head
    block head
      script(src='/vendor/jquery.js')
      script(src='/vendor/caustic.js')
  body
    block content
```   

现在假设您有一个页面，那是一个 JavaScript 编写的游戏。您希望把一些游戏相关的脚本也像默认的那些脚本一样放进去，那么您只要简单地 append 这个块：   

```
//- page.pug
extends layout.pug

block append head
  script(src='/vendor/three.js')
  script(src='/game.js')
```    

当使用 block append 或者 block prepend 时，block 关键字是可省略的：   

```
//- page.pug
extends layout

append head
  script(src='/vendor/three.js')
  script(src='/game.js')
```    


### 插值

##### 字符串插值，转义

考虑替换下面模板中的局部变量： `title`, `author`, `theGreat`。    

```pug
- var title = "On Dogs: Man's Best Friend";
- var author = "enlore";
- var theGreat = "<span>escape!</span>";

h1= title
p Written with love by #{author}
p This will be safe: #{theGreat}
```    

```html
<h1>On Dogs: Man's Best Friend</h1>
<p>Written with love by enlore</p>
<p>This will be safe: &lt;span&gt;escape!&lt;/span&gt;</p>
```   

使用 `#{}` 会有转义。可以是任意的JS表达式。    

##### 字符串插值，不转义

```
- var riskyBusiness = "<em>Some of the girls are wearing my mother's clothing.</em>";
.quote
  p Joel: !{riskyBusiness}
```   

```html
<div class="quote">
  <p>Joel: <em>Some of the girls are wearing my mother's clothing.</em></p>
</div>
```    

##### 标签插值

嵌入功能不仅可以嵌入 JavaScript 表达式的值，也可以嵌入用 Pug 书写的标签。它看起来应该像这样：   

```pug
p.
  This is a very long and boring paragraph that spans multiple lines.
  Suddenly there is a #[strong strongly worded phrase] that cannot be
  #[em ignored].
p.
  And here's an example of an interpolated tag with an attribute:
  #[q(lang="es") ¡Hola Mundo!]
```  

即使用 `#[]`。  

##### whitespace control

标签嵌入功能，在需要嵌入的位置上前后的空格非常关键的时候，就变得非常有用了。因为 Pug 默认会去除一个标签前后的所有空格。请观察下面一个例子：   

```pug  
p
  | If I don't write the paragraph with tag interpolation, tags like
  strong strong
  | and
  em em
  | might produce unexpected results.
p.
  If I do, whitespace is #[strong respected] and #[em everybody] is happy.
```   

```html
<p>If I don't write the paragraph with tag interpolation, tags like<strong>strong</strong>and<em>em</em>might produce unexpected results.</p>
<p>If I do, whitespace is <strong>respected</strong> and <em>everybody</em> is happy.</p>
```

### 迭代

Pug 支持两种格式的迭代：`each` 和 `while`。   

##### each

```pug
ul
  each val in [1, 2, 3, 4, 5]
    li= val
```    

```html
<ul>
<li>1</li>
<li>2</li>
<li>3</li>
<li>4</li>
<li>5</li>
</ul>
```   

可以通过下面的方式获取索引：  

```pug
ul
  each val, index in ['zero', 'one', 'two']
    li= index + ': ' + val
```   

```html
<ul>
  <li>0: zero</li>
  <li>1: one</li>
  <li>2: two</li>
</ul>
````

还可以迭代对象的键：   

```pug
ul
  each val, index in {1:'one',2:'two',3:'three'}
    li= index + ': ' + val
```   

```html
<ul>
  <li>1: one</li>
  <li>2: two</li>
  <li>3: three</li>
</ul>
```   

您还能添加一个 else 块，这个语句块将会在数组与对象没有可供迭代的值时被执行。   

```pug
- var values = [];
ul
  each val in values
    li= val
  else
    li There are no values
```   

```html
<ul>
  <li>There are no values</li>
</ul>
```    

还可以使用 `for` 作为 `each` 的别名。

##### while

```pug
- var n = 0;
ul
  while n < 4
    li= n++
```   

```html
<ul>
  <li>0</li>
  <li>1</li>
  <li>2</li>
  <li>3</li>
</ul>
```   

### Mixins

可以创建可重用的模板块：   

```pug
//- Declaration
mixin list
  ul
    li foo
    li bar
    li baz
//- Use
+list
+list
```   

```html
<ul>
  <li>foo</li>
  <li>bar</li>
  <li>baz</li>
</ul>
<ul>
  <li>foo</li>
  <li>bar</li>
  <li>baz</li>
</ul>
```   

Mixins 是被编译成函数，并且可以接收参数：   

```pug
mixin pet(name)
  li.pet= name
ul
  +pet('cat')
  +pet('dog')
  +pet('pig')
```   

```html
<ul>
  <li class="pet">cat</li>
  <li class="pet">dog</li>
  <li class="pet">pig</li>
</ul>
```    

##### Mixin Blocks

Mixin也可以接收Pug块作为内容：   

```pug
mixin article(title)
  .article
    .article-wrapper
      h1= title
      if block
        block
      else
        p No content provided

+article('Hello world')

+article('Hello world')
  p This is my
  p Amazing article
```    

```html
<div class="article">
  <div class="article-wrapper">
    <h1>Hello world</h1>
    <p>No content provided</p>
  </div>
</div>
<div class="article">
  <div class="article-wrapper">
    <h1>Hello world</h1>
    <p>This is my</p>
    <p>Amazing article</p>
  </div>
</div>
```   

##### mixix attributes

mixin 还会接受一个隐式的 `attribute` 参数。   

```pug
mixin link(href, name)
  //- attributes == {class: "btn"}
  a(class!=attributes.class href=href)= name

+link('/foo', 'foo')(class="btn")
```    

`<a class="btn" href="/foo">foo</a>`   

在 `attributes` 中的值默认是转义过的。应当使用 `!=` 来避免转义第二次。     

##### Rest Arguments

```pug
mixin list(id, ...items)
  ul(id=id)
    each item in items
      li= item

+list('my-list', 1, 2, 3, 4)
```   

```html
<ul id="my-list">
  <li>1</li>
  <li>2</li>
  <li>3</li>
  <li>4</li>
</ul>
```    

### Plain text

Pug提供了4种方式输出文本。    

普通文本也可以使用标签和字符串插值，但是每行的第一个单词不是 Pug 标签。而且，由于普通文本
不会转义，所以可以包含HTML直接量。   

##### inline in a tag

添加文本最简单的方式是 *内联*。每行第一个单词是标签本身。跟在标签一个空格之后的东西会成为
标签的文本内容。   

`p This is plain old <em>text</em> content.`    

`<p>This is plain old <em>text</em> content.</p>`   

##### literal HTML

当每行开头是 `<` 时整行会被当做普通文本，当直接使用HTML标签时会很方便。由于直接使用HTML标签
不会被处理，它们不会自闭合。   

```
<html>

body
  p Indenting the body tag here would make no difference.
  p HTML itself isn't whitespace-sensitive.

</html>
```   

```html
<html>

<body>
  <p>Indenting the body tag here would make no difference.</p>
  <p>HTML itself isn't whitespace-sensitive.</p>
</body>

</html>
```    

##### Piped Text

前缀管道符 `|` 也可以添加文本内容。    

```pug
p
  | The pipe always goes at the beginning of its own line,
  | not counting indentation.
```    

```html
<p>The pipe always goes at the beginning of its own line, not counting indentation.</p>
```    

##### 
