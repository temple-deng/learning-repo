# ESLint Rules   

# Best Practices  

这些规则涉及了更好的编码方式来帮助我们避免问题：   

## accessor-pairs   

强制访问器函数 getter/setter 在对象中成对出现。    

### Options

一个对象 option:   

+ `setWithoutGet` (default: `true`)
+ `getWithoutSet` (default: `false`)

## array-callback-return   

`Array` 有一些用来过滤，映射，折叠的方法。这些方法通常需要有 `return` 声明，如果忘了
这个声明，通常是个错误。   

这个规则会检查下面的数组方法中是否有 `return` 声明：   

+ `Array.from`
+ `Array.prototype.every`
+ `Array.ptototype.filter`
+ `Array.prototype.find`
+ `Array.prototype.findIndex`
+ `Array.prototype.map`
+ `Array.prototype.reduce`
+ `Array.prototype.reduceRight`
+ `Array.prototype.some`
+ `Array.prototype.sort`   
+ 以及类型化数组上的所有这些方法    

## block-scoped-var   

这个规则在当我们在一些变量的定义的语句块之外使用变量时发出警告，不过再计算作用域时好像
使用的是 C 风格的作用域。    

## class-methods-use-this

如果一些类的方法中没有使用 `this`的话，其实它适合定义为类的静态方法。    

这个规则应该就是提示我们有类的方法没有使用 `this`。    

### Options

添加例外的对象：   

+ `exceptMethods` 提供一个方法名的数组

## complexity  

这个有点难理解。看文档的意思是这个规则会限制循环复杂度来减少代码的复杂性。
这里的循环复杂度又好像专指条件语句中条件分支的数量。默认的复杂度是20。   

```javascript
/*eslint complexity: ["error", 2]*/

function a(x) {
    if (true) {
        return x;
    } else if (false) {
        return x+1;
    } else {
        return 4; // 3rd path
    }
}
```    

### Options

一个对象option的 `max` 属性可以指定对象属性的最大数量（这个按理说不该限制）:   

+ `"max": 2`  



## consistent-return   

貌似是这样的。这个规则强制同一个函数中的 `return` 声明要么都提供值，要么就都不用提供值。    

```javascript
function doSomething(condition) {
    if (condition) {
        return true;
    } else {
        return;
    }
}
```   

上面的例子中一个 `return` 语句有值，另一个没有。    

### Options

对象 option:   

+ `"treatUndefinedAsUnspecified": false` (default) 要么都返回值，要么就隐性的返回 `undefined`，如果是 `true`，那么要么都有返回值，要么显示或者隐式返回 `undefined`


## curly   

这个规则的话就是强制要求我们在一些只有单个语句的块级代码块时也使用括号括起来。不要省略
括号。一般这些代码块指的是 `if`, `else`, `for`, `while`, `do` 的代码块。        

### Options

貌似是一个枚举的字符串参数，有下面的可选值，注意这里单行语句与单个声明的区别，单个声明可以写在多行内的：   

+ `"all"`(default)
+ `"multi"` 只有在代码块有多个声明时才要求括号，只有一个声明的话反而不要加括号
+ `"multi-line"` 这个类似上面的，但是单个语句的话貌似是强制写在与条件的同一行，则不加
括号，错误的例子：  

```javascript
/*eslint curly: ["error", "multi-line"]*/

if (foo)
  doSomething();
else
  doSomethingElse();

if (foo) foo(
  bar,
  baz);
```   

正确的例子：   

```javascript
/*eslint curly: ["error", "multi-line"]*/

if (foo) foo++; else doSomething();

if (foo) foo++;
else if (bar) baz()
else doSomething();

do something();
while (foo);

while (foo
  && bar) baz();

if (foo) {
    foo++;
}

if (foo) { foo++; }

while (true) {
    doSomething();
    doSomethingElse();
}
```   

+ `"mulit-or-nest"` 如果是单行语句的话必须省略括号，其他情况必须加括号   
+ `"consistent"` 无论使用哪个 `mulit*` 都可以再加一个字符串参数，貌似
是强制同一个 `if` `else` 语句中的括号行为必须一致。    

## default-case   

这个规则强制 `switch` 语句必须提供 `default` 分支，但是可选的可以在最后一个 `case` 后
添加一个 `// no default` 的注释来跳过这条限制。    

正确的例子：   

```javascript
/*eslint default-case: "error"*/

switch (a) {
    case 1:
        /* code */
        break;

    default:
        /* code */
        break;
}


switch (a) {
    case 1:
        /* code */
        break;

    // no default
}

switch (a) {
    case 1:
        /* code */
        break;

    // No Default
}
```   

### Options   

对象参数：   

+ `commentPattern` 设置为正则表达式字符串来匹配注释的样式，例如下面正确的例子，默认的话是 `/^no default$/i`   

```javascript
/*eslint default-case: ["error", { "commentPattern": "^skip\\sdefault" }]*/

switch(a) {
    case 1:
        /* code */
        break;

    // skip default
}

switch(a) {
    case 1:
        /* code */
        break;

    // skip default case
}
```   

## dot-location   

由于当我们跨行使用点运算符访问属性或方法时，可以将点行的末尾，也可以写在新行的开头。这个规则就是统一一下这个行为。   

### Options

一个字符串参数：   

+ `"object"`(default) 点运算符应该与对象在同一行，也就是行的末尾
+ `"property"` 点运算符应该在新行的开头

## dot-notation   

鼓励在访问属性及方法时使用点运算符，而不是括号，不过这只是在括号是无意义的情况下，
不是说强制所有访问都使用点。点运算符只适合后面的属性名是字符串的情况。        

### Options   

貌似是对象参数：   

+ `allowKeywords`(default: `true`) 设为 false 的话就兼容 ES3 的风格，对于保留字
属性避免使用点
+ `allowPattern` 正在表达式字符串，对于匹配的属性名可以用括号

## eqeqeq

强制使用严格相等比较`===`和严格不相等`!==`。    

### Options

貌似是字符串参数及一个可选的对象参数：   

+ `"always"`(default)
+ `"smart"` 除了下面的情况：   
  - 比较两个字面量值
  - 与 `typeof`的值比较
  - 与 `null` 比较     

可选的对象参数：   

+ `null` 定制规则如何对待字面量 `null`，可选的值有：   
  - `always`(default) 仍然使用 `===` 和 `!==`
  - `never` 永远不用 `===`和 `!==`
  - `ignore` 不对 `null` 使用规则    

## guard-for-in  

这个规则意在帮我们避免使用 `for in` 循环未过滤的结果时出现无法预料的错误，简单来说，就是当我们在 `for in` 循环中没有使用 `if` 来对结果进行过滤时发出警告。   

## no-alert  

禁止调用 `alert`, `confirm`, `prompt` 函数。   

## no-caller   

禁止使用 `arguments.callee`, `arguments.caller`。   

## no-case-declarations (√)

禁止在 `case` `default` 字句中使用 `let`, `const`, `function`, `class` 声明。
因为这些声明事实上在整个 `switch` 语句块中都是可见的，但只有在其赋值的地方才会初始化。   

## no-div-regex

这用于消除分割运算符的歧义，不要混淆用户。   

错误例子：   

```javascript
/*eslint no-div-regex: "error"*/

function bar() { return /=foo/; }
```   

正确例子：   

```javascript
/*eslint no-div-regex: "error"*/

function bar() { return /\=foo/; }
```   

## no-else-return

略

## no-empty-function  

禁止空函数，不过有注释的不算。    

### Options

一个对象 option 用来添加例外：   

+ `allow`(`string[]`) - 允许出现空函数的类型的列表。下面是可选值，默认是空数组：   
  - `"functions"` - 常规函数
  - `"arrowFunctions"`
  - `"generatorFunctions"`
  + `"methods"`
  + `"generatorMethods"`
  + `"getters"`
  + `"setters"`
  + `"constructor"`    

## no-empty-pattern   (√)

空 pattern 是指下面的东西，就是对象结构时使用的 pattern:   

`var {a: {}} = foo;`    

## no-eq-null   

禁止使用 `==` 及 `!=` 与 `null` 比较。   

## no-eval   

略

## no-extend-native   

禁止直接修改内置对象的原型。    

```javascript
/*eslint no-extend-native: "error"*/

Object.prototype.a = "a";
Object.defineProperty(Array.prototype, "times", { value: 999 });
```   

### Options  

一个对象, 包括 `exceptions` 选项，用来指定一些允许修改的内置的对象。    

## no-extra-bind   

禁止一些内部没有使用 `this` 的 IIFE 进行 `bind()` 绑定。   

## no-extra-label   

```javascript
/*eslint no-extra-label: "error"*/

A: while (a) {
    break A;
}

B: for (let i = 0; i < 10; ++i) {
    break B;
}

C: switch (a) {
    case 0:
        break C;
}
```    

## no-fallthrough   

标记处那些没有用注释标记的 fall through 场景。    

```javascript
/*eslint no-fallthrough: "error"*/

switch(foo) {
    case 1:
        doSomething();

    case 2:
        doSomething();
}
```   

正确的例子：   

```javascript
/*eslint no-fallthrough: "error"*/

switch(foo) {
    case 1:
        doSomething();
        break;

    case 2:
        doSomething();
}

function bar(foo) {
    switch(foo) {
        case 1:
            doSomething();
            return;

        case 2:
            doSomething();
    }
}

switch(foo) {
    case 1:
        doSomething();
        throw new Error("Boo!");

    case 2:
        doSomething();
}

switch(foo) {
    case 1:
    case 2:
        doSomething();
}

switch(foo) {
    case 1:
        doSomething();
        // falls through

    case 2:
        doSomething();
}
```   

### Options  

对象，包含 `"commentPattern"`　选项，声明一个正则表达式字符串。　　　

## no-floating-decimals

这个规则会禁止在小数点的前或后缺少数字。     

下面的是错误的示范：    

```javascript
/*eslint no-floating-decimal: "error"*/

var num = .5;
var num = 2.;
var num = -.7;
```     

## no-global-assign   

JavaScript 环境中通常都包含一系列的内置的全局变量，例如浏览器中的 `window` 对象及 Node.js
中的 `process` 对象。通常情况下我们不会想对这些全局变量赋值，否则会导致内置变量可能无法使用。    

所有这个规则禁止修改只读的全局变量。   

### Options

对象 options，有一个 `exceptions` 选项，可以用来指定一个可以赋值的内置变量的列表：   

```javascript
{
    "rules": {
        "no-global-assign": ["error", {"exceptions": ["Object"]}]
    }
}
```    

## no-implicit-coercion   

在 JavaScript 中，有许多不同的方式来转换值的类型，有一些是难以阅读和理解的：   

```JavaScript
var b = !!foo;
var b = ~foo.indexOf(".");
var n = +foo;
var n = 1 * foo;
var s = "" + foo;
foo += ``;
```   

他们可以用下面的方式替换：   

```javascript
var b = Boolean(foo);
var b = foo.indexOf(".") !== -1;
var n = Number(foo);
var n = Number(foo);
var s = String(foo);
foo = String(foo);
```   

所以这个规则就是禁止那些简写的类型转换。   

### Options

一个对象 options，有4个选项：    

+ `"boolean"` (default: `true`) 当为 `true` 的时候只警告布尔类型的缩写类型转换
+ `"number"` (default: `true`) 当为 `true` 的时候只警告数值类型的缩写类型转换
+ `"string"` (default: `true`) 当为 `true` 的时候只警告字符串类型的缩写类型转换
+ `"allow"` (default: `empty`) 这个数组中出现的 `~`,`!!`,`+`,`*` 类型转换是允许的

## no-implied-eval   

理论上是不推荐使用 `eval()` 语句的。然而，有一些地方传入字符串时会被解释为 JavaScript 代码
，与使用 `eval()` 是类似的效果。   

第一处就是在使用 `setTimeout()` 和 `setInterval()` 时使用一个字符串作为第一个参数传入：   

`setTimeout("alert('Hi!');", 100);`   

这种方式被认为是隐式使用 `eval()`，因为传入的字符串会作为代码解释。    

所以这个规则就是禁止在这两个函数中传入一个字符串作为第一个参数。    

## no-invalid-this  

这个规则主要就是禁止在类的外部使用 `this` 关键字。这个规则基本上是检查包含 `this` 关键字的
函数是否是构造函数或者方法。   

这个规则根据下面的规则判断是否是一个构造函数：   

+ 函数名是大写字母开头的
+ 函数赋值给一个变量，这个变量是以大写字母开头的
+ 函数是 ES6 类中的构造函数   

根据下面的条件判断函数是否是一个方法：    

+ 函数是在一个对象字面量上
+ 函数赋值给一个属性
+ 函数是 ES6 中的方法   

这个规则也允许 `this` 关键字在下面函数中出现：   

+ 函数是直接通过 `call/apply/bind` 方法调用的
+ 函数是作为数组方法的回调提供的
+ 函数有 `@this` 便签在其 JSDoc 注释中   

这个规则只在严格模式下有效。   

## no-iterator   

`__iterator` 是 SpiderMonkey 对 JS 的扩展，现在被废弃了，所有规则禁止使用。   

## no-labels  

禁止使用 label 声明。   

## no-lone-blocks  

其实就是禁止在代码顶层禁止使用无意义的大括号。因为 ES6 中有了块级作用域的概念。    

## no-loop-func

在循环中写函数很可用会引发错误，因为函数会创建闭包。例如：   

```javascript
for (var i = 0; i < 10; i++) {
    funcs[i] = function() {
        return i;
    };
}
```   

但是不是说禁止在循环中使用函数，下面是一些正确的例子：   

```javascript
/*eslint no-loop-func: "error"*/
/*eslint-env es6*/

var a = function() {};

for (var i=10; i; i--) {
    a();
}

for (var i=10; i; i--) {
    var a = function() {}; // OK, no references to variables in the outer scopes.
    a();
}

for (let i=10; i; i--) {
    var a = function() { return i; }; // OK, all references are referring to block scoped variables in the loop.
    a();
}

var foo = 100;
for (let i=10; i; i--) {
    var a = function() { return foo; }; // OK, all references are referring to never modified variables.
    a();
}
//... no modifications of foo after this loop ...
```   

## no-magic-numbers

这个略了。不推荐启用。   

## no-multi-spaces

这个规则禁止在逻辑表达式，条件表达式，声明，数组元素，对象属性，序列及函数参数中出现多个连着的空格。   

### Options

一个对象 options 有下面的属性：   

+ `"ignoreEOLComments": true` (default: false) 忽视在行尾的注释前面的多个空格
+ `"exceptions": { "Property": true}` 略。   

## no-multi-str

禁止使用多行字符串，例如：   

```javascript
/*eslint no-multi-str: "error"*/
var x = "Line 1 \
         Line 2";
```    

## no-new   

禁止使用 `new` 操作生成对象但却没有赋值给变量来保存生成的对象，例如：   

`new Thing();`   

## no-new-func

禁止使用`Function` 构造函数来生成函数实例。例如：   

```javascript
var x = new Function("a", "b", "return a + b");
var x = Function("a", "b", "return a + b");
```   

## no-new-wrappers

禁止使用 `new` 操作符生成数值，字符串及布尔类型的包装对象。例如：   

```javascript
/*eslint no-new-wrappers: "error"*/

var stringObject = new String("Hello world");
var numberObject = new Number(33);
var booleanObject = new Boolean(false);

var stringObject = new String;
var numberObject = new Number;
var booleanObject = new Boolean;
```    

## no-octal

禁止使用八进制的字面量。   

## no-octal-escape

禁止在字符串字面量里使用八进制转义序列。   

## no-param-reassign   

禁止对函数的参数重新赋值。    

### Options

一个对象 option，有一个布尔值属性 `"props"` 及一个数组属性 `"ignorePorpertyModificationsFor"`。
`"props"` 默认 `false` 如果设置 `true` 的话，那么对参数属性的修改也会发出警告，除非这个参数（注意是
参数，而不是参数的属性）包含在 `"ignorePorpertyModificationsFor"` 的数组中。   

## no-proto   

禁止使用 `__proto__` 属性。

## no-redeclare

我们可以使用 `var` 对同一个变量重新声明，但是这样有时可能会让人误解变量真正声明的位置。   

这个规则就是禁止在相同的作用域中重复声明。   

### Options

一个对象选项，有一个布尔值属性 `"builtinGlobals"`。默认为 `false`。如果设为 `true`，这个规则
也会检查对内置全局变量的赋值。   

## no-restricted-properties

略。不推荐使用。   

## no-return-assign  

禁止在 `return` 声明中使用赋值操作。

### Options

一个字符串选项，可以是下面的值之一：    

+ `except-parens`(default): 在使用括号括起来的时候可以赋值
+ `always` 禁止所有赋值    

## no-return-await

禁止在 `async` 函数中使用 `return await`，因为本身函数返回的值都会会 `Primise.resolve` 包装
一下，所以 `return await` 是没有意义的。    

## no-script-url   

使用 `javascript:` URL 被认为与 `eval` 类似。传入 `javascript:` URL 中的代码由浏览器解析并计算。      

## no-self-assign

禁止自己给自己赋值。例如：   

```javascript
/*eslint no-self-assign: "error"*/

foo = foo;

[a, b] = [a, b];

[a, ...b] = [x, ...b];

({a, b} = {a, x});
```   


### Options

一个对象选项，有一个布尔值属性 `"props"`，默认 `false`，如果为 `true`，会警告属性自己给自己赋值。      

## no-self-compare

禁止自己和自己比较。   

##  no-sequences

这个规则禁止使用逗号运算符，但有以下例外：    

+ 在 `for` 中的初始化及更新部分
+ 如果表达式序列是明确的用括号抱起来。

## no-throw-literal  

通常认为最好 `throw` 一个 `Error` 对象。这个规则禁止抛出字面量或者非 `Error` 对象的表达式。    

## no-unmodified-loop-condition  

这个规则主要是检查循环内部对循环条件的引用，如果在循环中对引用是没有修改的。就抛出错误。    

## no-unused-expressions   

禁止出现未使用的表达式。   

### Options

略。    

## no-unused-labels

禁止出现未使用的 labels。    

## no-useless-call   

禁止没有意义的对 `call()` 和 `apply()` 的使用。因为这种做法通常比普通的函数调用更慢，所以
如果能普通调用解决的话，不要用这两个方法，例如下面无意义的例子：   

```javascript
/*eslint no-useless-call: "error"*/

// These are same as `foo(1, 2, 3);`
foo.call(undefined, 1, 2, 3);
foo.apply(undefined, [1, 2, 3]);
foo.call(null, 1, 2, 3);
foo.apply(null, [1, 2, 3]);

// These are same as `obj.foo(1, 2, 3);`
obj.foo.call(obj, 1, 2, 3);
obj.foo.apply(obj, [1, 2, 3]);
```    

## no-useless-escape

在字符串及正则表达式中对非特殊的字符转义是没有意义的。    

## no-useless-return

如果 `return;` 声明后面说明都没跟着的话，说明它是多余的（也不见得，有时候只是简单的跳出函数）。

## no-void

`void: expression` 表达式会计算后面表达式的值，然后返回 `undefined`。这个表达式通常
有两个用处，一个是 `void 0` 返回 `undefined`，但是写的代码更少。另一个在 IIFE 中，可以强制
将后面的 function 关键字看做是表达式而不是声明，这样就能省去再包个括号。   

不过这个规则就是禁用 `void` 运算符。  

## no-warning-comments

开发者经常会在代码中添加一些注释来标记待完成或者需要 review 的代码。例如：   

```javascript
// TODO: do something
// FIXME: this is not a good idea
```    

这个规则的话会禁止任何包含了配置中预定义了的术语的注释。术语的配置在下面的 options 中。    

### Options

一个对象选项，然后应该是包含两个属性`"terms"`,`"location"`   

+ `"terms"`：就是可选的用来匹配术语的数组。默认是 `["todo","fixme","xxx"]`。术语匹配是
大小写不敏感的，并且是作为整个单词进行匹配的。
+ `"location"`: 可选的字符串，应该是用来指定术语在注释中的匹配位置的。默认是 `"start"`，应该
就是意思是这个术语应该是出现在注释的开头，如果是后边的话就不算匹配了，还有一个值是 `"anywhere"`

## no-with   

禁止 `with` 声明。   

## prefer-promise-reject-errors

通常认为在 `reject()` 函数中传递一个 `Error` 实例是较好的实践。所以这个规则就是禁止 promise
reject 非 `Error` 值。    

### options  

对象选项，有一个布尔值属性 `allowEmptyReject: true`(default: false) 允许不加参数调用 `reject()`。    

## radix

关于 `parseInt()` 的第二个参数基数的。该规则的目的是防止字符串意外转换为与预期不同的基数，或者防止仅针对现代环境的冗余10基数。    

### Options

应该是一个字符串选项，可以是下面的值：   

+ `"always"` 强制必须提供基数（默认行为）
+ `"as-needed"` 禁止所有提供基数 `10`。也就是说如果我们本身想让字符串作为十进制就不要添加基数参数。

## require-await  

禁止那些内部没有 `await` 的 `async` 函数。   

## vars-on-top

主要是为了让变量声明写在其作用域的顶部。

## wrap-iife   

这个规则要求所有的 IIFE 都包裹在括号中。    

### Options

两个选项，一个字符串的，一个对象的，字符串选项可选值如下：   

+ `"outside"` 强制括号括在调用表达式的外部。默认值
+ `"inside"` 强制括号括在 function 表达式的外边
+ `"any"` 两种都行   

对象选项有一个属性：   

+ `"functionPrototypeMethods": true` 在 IIFE 使用 `call` or `apply` 调用时也要
用括号括起来，默认 `false`

## yoda

要求或者禁止 Yoda 条件。yoda 条件是这个意思，就是条件表达式左边是字面量值，右边是变量，例如：   

```javascript
if ("red" === color) {
    // ...
}
```   

`red` 字面量在左， `color` 变量在右。这个规则主要是在进行变量和字面量的比较时保持写法的一致性。    

### Options

一个字符串选项，可选值：   

+ 如果默认是 `"never"`，那么比较表达式就不能是 Yoda 条件
+ 如果是 `"always"` 那么就要求用 yoda 的写法    

在使用 `"never"` 选项时，还可以添加一个对象选项来添加例外情况：   

+ 如果 `"exceptRange"` 属性为 `true`，那么就允许在括号包裹的范围比较中使用 yoda 写法，包括
`if` and `while` 的括号。默认是 `false`。范围表达式指的是变量是否在两个字面量范围之内
+ 如果 `"onlyEquality"` 为 `true`，规则只会在相等操作符`==, ===`使用 yoda 写法时报告，默认是
`false`。    

下面是使用 ` "never", { "exceptRange": true }` 正确的例子：   

```javascript
/*eslint yoda: ["error", "never", { "exceptRange": true }]*/

function isReddish(color) {
    return (color.hue < 60 || 300 < color.hue);
}

if (x < -1 || 1 < x) {
    // ...
}

if (count < 10 && (0 <= rand && rand < 1)) {
    // ...
}

function howLong(arr) {
    return (0 <= arr.length && arr.length < 10) ? "short" : "long";
}
```     
