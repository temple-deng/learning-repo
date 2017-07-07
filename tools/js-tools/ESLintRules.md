# ESLint Rules

看样子，rules 的 options 可以分为两类，一种通常是字符串，用来限制的 rule 的行为，另一类
则是对象，其中的属性可以包含一个数组，用来为规则添加例外。    

## Possible Errors  

这些规则与JavaScript代码中可能的语法或逻辑错误有关：   

### for-direction   

强制 'for' 循环的计数器是按照正确的顺序更新的。    

有的 `for` 循环的停止条件可能由于计数器向错误的方向移动，条件永远无法满足，从而
成为无限循环。这样的无限循环应该使用 `while` 循环，如果使用 `for` 循环，理论上是 bug。   

错误的做法：   

```JavaScript
/*eslint for-direction: "error"*/
for (var i = 0; i < 10; i--) {
}

for (var i = 10; i >= 0; i++) {
}
```    

### no-await-in-loop   

禁止循环中存在 `await` 语句。    

原因是，如果我们在循环迭代元素中使用 `await` 意味着我们没能好好利用 `async/await` 并行化
的优势。    

因此，这样的代码应该重构为一次性创建所有的 promises，然后使用 `Promise.all()` 获取结果。   

### no-compare-neg-zero (√)

不允许与-0比较。如果确实要和 -0 比较，使用 `Object.is(x, -0)`。    

### no-cond-assign (√)

不允许在条件声明中使用赋值操作符。    

这条规则禁止在 `if`, `for`, `while`, `do...while` 的测试条件中使用含糊的赋值操作符（注意是测试条件中）。    

#### Options

规则包含一个下面的字符串选项：   

+ `"except-parens"`(default) 仅允许在测试条件中用括号封闭起来的赋值操作
+ `"always"` 禁止所有测试条件中的赋值   

当使用默认的 `"except-parens"` 时代码不正确的例子：    

```JavaScript
/*eslint no-cond-assign: "error"*/

// Unintentional assignment
var x;
if (x = 0) {
    var b = 1;
}

// Practical example that is similar to an error
function setHeight(someNode) {
    "use strict";
    do {
        someNode.height = "100px";
    } while (someNode = someNode.parentNode);
}
```   

当使用默认的 `"except-parens"` 时代码正确的例子：   

```javascript  
/*eslint no-cond-assign: "error"*/

// Assignment replaced by comparison
var x;
if (x === 0) {
    var b = 1;
}

// Practical example that wraps the assignment in parentheses
function setHeight(someNode) {
    "use strict";
    do {
        someNode.height = "100px";
    } while ((someNode = someNode.parentNode));
}

// Practical example that wraps the assignment and tests for 'null'
function setHeight(someNode) {
    "use strict";
    do {
        someNode.height = "100px";
    } while ((someNode = someNode.parentNode) !== null);
}
```    

貌似就是在赋值表达式的外面加了层括号。。。    

### no-console (√)   

禁止调用 `console` 对象上的所有方法。     

不过其实这个是针对浏览器端的。   

#### Options

这个规则有一个对象 option:   

+ `"allow"` 一个字符串数组，可以包含 `console` 对象上运行使用的方法。   

例如，下面的代码是正确的：   

```javascript
/*eslint no-console: ["error", { allow: ["warn", "error"] }] */

console.warn("Log a warn level message.");
console.error("Log an error level message.");
```    

### no-constant-condition (√)

禁止使用常量表达式作为测试条件。   

这个规则禁止常量表达式作为下面场景里的测试条件：   

+ `if`, `for`, `while` or `do...while` 声明
+ `? :` 三元表达式   

下面的例子都是错误的：   

```javascript
/*eslint no-constant-condition: "error"*/

if (false) {
    doSomethingUnfinished();
}

if (void x) {
    doSomethingUnfinished();
}

for (;-2;) {
    doSomethingForever();
}

while (typeof x) {
    doSomethingForever();
}

do {
    doSomethingForever();
} while (x = -1);

var result = 0 ? a : b;
```   

#### Options

应该也是一个对象 option，包含一个 `checkLoops` 属性。默认为 `true`，设为 `false` 则可以
运行循环中的常量表达式。   

### no-control-regex (√)

禁止正则中出现控制字符。  

控制字符是指 ASCII 码范围为 0-31 之间的字符，这些字符通常是特殊的，不可见的字符。很少在
js 字符串中使用，所以如果一个正则表达式中有控制字符，很可能是错误。    

### no-debugger (√)

禁止使用 `debugger` 声明。   

### no-dupe-args (√)

禁止 `function` 定义（包括声明及表达式）中出现重复的参数。   

不过这个规则不适用箭头函数及 class 方法，解析器会报错。   

### no-dupe-keys (√)

禁止在对象字面量中出现重复的键名。   

```javascript
var foo = {
    bar: "baz",
    bar: "qux"
};
```   

### no-duplicate-case (√)

禁止出现重复的 case 标记。   

```javascript
/*eslint no-duplicate-case: "error"*/

var a = 1,
    one = 1;

switch (a) {
    case 1:
        break;
    case 2:
        break;
    case 1:         // duplicate test expression
        break;
    default:
        break;
}
```   

### no-empty (√)

禁止空的块级声明。不过包含注释的不算。        

```javascript
/*eslint no-empty: "error"*/

if (foo) {
}

while (foo) {
}

switch(foo) {
}

try {
    doSomething();
} catch(ex) {

} finally {

}
```   

#### Options

有一个对象 option 用来添加例外：   

+ `"allowEmptyCatch": true` 运行空的 `catch` 语句块。   

### no-empty-character-class (√)

禁止正则表达式中的空的字符类。因为空的子分类不匹配任何东西，总会导致匹配失败吧。    

```javascript
/*eslint no-empty-character-class: "error"*/

/^abc[]/.test("abcdefg"); // false
"abcdefg".match(/^abc[]/); // null
```    

这个规则有个限制，就是当使用包含空的字符类的字符串作为参数调用 RegExp 构造函数时不会报错。   

### no-ex-assign (√)

禁止在 `catch` 自己中对异常对象重新赋值。   

```javascript
/*eslint no-ex-assign: "error"*/

try {
    // code
} catch (e) {
    e = 10;
}
```    

### no-extra-boolean-cast (√)

禁止无意义的布尔值计算。   

在 `if` 声明的条件的上下文中，表达式的结果会自动转换为布尔值，所以手动通过 `!!` 或者 `Boolean()`
来计算布尔结果是没有意义的。   

```javascript
if (!!foo) {
    // ...
}

if (Boolean(foo)) {
    // ...
}

while (!!foo) {
    // ...
}

do {
    // ...
} while (Boolean(foo));

for (; !!foo; ) {
    // ...
}
```    

### no-extra-parens  

禁止无意义的括号。   

#### Options

一个字符串 option:   

+ `"all"`(default) 禁止任何表达式外部的无意义的括号
+ `"functions"` 禁止函数表达式周围的括号   

不过还有一个对象 option 为 `"all"` 选项添加例外情况：   

+ `"conditionalAssign": false` 允许在条件测试表达式中赋值表达式周围的括号
+ `"returnAssign": false` 允许在 `return` 声明中赋值周围的括号
+ `"nestedBinaryExpressions": false` 在嵌套的二进制表达式周围的括号
+ `"ignoreJSX": "none|all|mulit-line|single-line"`    

使用例外情况后正确的例子：   

**conditionalAssign**   

```javascript
/* eslint no-extra-parens: ["error", "all", { "conditionalAssign": false }] */

while ((foo = bar())) {}

if ((foo = bar())) {}

do; while ((foo = bar()))

for (;(a = b););
```   

**returnAssign**    

```javascript
/* eslint no-extra-parens: ["error", "all", { "returnAssign": false }] */

function a(b) {
  return (b = 1);
}

function a(b) {
  return b ? (c = d) : (c = e);
}

b => (b = 1);

b => b ? (c = d) : (c = e);
```    

**nestedBinaryExpressions**   

```javascript
/* eslint no-extra-parens: ["error", "all", { "nestedBinaryExpressions": false }] */

x = a || (b && c);
x = a + (b * c);
x = (a * b) / c;
```    

**ignoreJSX**   

```javascript
/* eslint no-extra-parens: ["error", "all", { ignoreJSX: "all" }] */
const Component = (<div />)
const Component = (
    <div
        prop={true}
    />
)
```   

### no-extra-semi (√)

禁止没意义的分号咯。   

### no-func-assign (√)

禁止对使用函数声明定义的函数重新赋值(但是使用函数表达式的可以)：   

```javascript
/*eslint no-func-assign: "error"*/

function foo() {}
foo = bar;

function foo() {
    foo = bar;
}
```   

### no-inner-declarations (√)

貌似是禁止在嵌套的语句块中使用函数及变量声明。（例如 `if`, `while` 等）    

#### Options

一个字符串 option:   

+ `"functions"`(default) 只禁止函数
+ `"both"` 函数和变量都禁止   

### no-invalid-regexp (√)

禁止 `RegExp` 构造函数中无效的正则表达式字符串。    

```javascript
/*eslint no-invalid-regexp: "error"*/

RegExp('[')

RegExp('.', 'z')

new RegExp('\\')
```    

#### Options

一个用来添加例外的对象 option:  

+ `"allowConstructorFlags"` 一组 flags 的数组。   

### no-irregular-whitespace (√)

这个规则旨在发现除正规的 tab 及 space 以外的无效的空格。    

#### Options

一个指定例外的对象 option:  

+ `"skipStrings": true`(default) 在字符串字面量中允许任何的空格
+ `"skipComments": true` 允许注释中的空格咯
+ `"skipRegExps": true` 正则表达式字面量中的空格
+ `"skipTemplates": true` 模板字面量中的空格   

### no-obj-calls (√)

禁止直接将 `Math`, `JSON`, `Reflect` 对象直接像函数一样调用：   

```javascript
/*eslint no-obj-calls: "error"*/

var math = Math();
var json = JSON();
var reflect = Reflect();
```    

### no-prototype-builtins

这个规则禁止直接在对象实例上调用一些 `Object.prototype` 方法。   

```javascript
/*eslint no-prototype-builtins: "error"*/

var hasBarProperty = foo.hasOwnProperty("bar");

var isPrototypeOfBar = foo.isPrototypeOf(bar);

var barIsEnumerable = foo.propertyIsEnumerable("bar");
```   

### no-regex-spaces (√)

禁止在正则表达式字面量中出现多个连着的空格（可以出现单个的空格）。   

```javascript
/*eslint no-regex-spaces: "error"*/

var re = /foo   bar/;
var re = new RegExp("foo   bar");
```    

### no-sparse-arrays (√)

禁止使用稀疏数组字面量。   

```javascript
/*eslint no-sparse-arrays: "error"*/

var items = [,];
var colors = [ "red",, "blue" ];
```   

### no-template-curly-in-string

禁止在常规的字符串中使用模板字面量占位符语法。    

```javascript
/*eslint no-template-curly-in-string: "error"*/
"Hello ${name}!";
'Hello ${name}!';
"Time: ${12 * 60 * 60 * 1000}";
```   

### no-unexpected-multiline (√)

禁止那些令人疑惑的多行表达式。   

```javascript
/*eslint no-unexpected-multiline: "error"*/

var foo = bar
(1 || 2).baz();

var hello = 'world'
[1, 2, 3].forEach(addNumber);

let x = function() {}
`hello`

let x = function() {}
x
`hello`

let x = foo
/regex/g.test(bar)
```   


### no-unreachable (√)

禁止那些在 `return`, `throw`, `continue`, `break` 声明后不可达到的代码。   

```javascript
/*eslint no-unreachable: "error"*/

function foo() {
    return true;
    console.log("done");
}

function bar() {
    throw new Error("Oops!");
    console.log("done");
}

while(value) {
    break;
    console.log("done");
}

throw new Error("Oops!");
console.log("done");

function baz() {
    if (Math.random() < 0.5) {
        return;
    } else {
        throw new Error();
    }
    console.log("done");
}

for (;;) {}
console.log("done");
```   

### no-unsafe-finally (√)

禁止在 `finally` 代码块中出现流程控制的声明，例如 `return`, `throw`, `break`, `continue`。   

### no-unsafe-negation   (√)

禁止在关系运算符的左操作数前出现否定运算符吧，这里的关系运算符特指 `in`, `instanceof`。主要
是因为否定运算符的优先级高吧。   

```javascript
/*eslint no-unsafe-negation: "error"*/

if (!key in object) {
    // operator precedence makes it equivalent to (!key) in object
    // and type conversion makes it equivalent to (key ? "false" : "true") in object
}

if (!obj instanceof Ctor) {
    // operator precedence makes it equivalent to (!obj) instanceof Ctor
    // and it equivalent to always false since boolean values are not objects.
}
```    

### use-isnan (√)   

应该是拒绝使用相等及不等运算符直接与 NaN 比较，而是使用 `Number.isNaN()` 或者 `isNaN()`。    

```javascript
/*eslint use-isnan: "error"*/

if (foo == NaN) {
    // ...
}

if (foo != NaN) {
    // ...
}
```  

### valid-jsdoc

JSDoc 对一个函数的注释如下：   

```javascript
/**
 * Add two numbers.
 * @param {number} num1 The first number.
 * @param {number} num2 The second number.
 * @returns {number} The sum of the two numbers.
 */
function add(num1, num2) {
    return num1 + num2;
}
```   

这个规则强制有效且一致的 JSDoc 注释。它会汇报出下面出现的任意问题：   

+ 遗漏参数标签：`@arg`, `@argument` or `@param`
+ 与函数不一致的注释中参数的顺序
+ 遗漏返回标签：`@return` or `@returns`
+ 遗漏参数或返回值的类型
+ 遗漏参数或返回值的描述
+ 语法错误   

#### Options

有一个对象 option:  

+ `"prefer"` 声明一个对象，用来强制在文档中使用一致的标签。对象属性值意味着最终使用的标签（
例如，`"return": "returns"` 意味着使用 `@returns` 而不是 `@return`）其实就是保持注释标签的
一致性，不要说一个地方用 `@arg` 一个地方用 `@param`
+ `"preferType"` 强制一致的类型的字符串（例如： `"object": "Object"` 意味着使用 `Object` 而不是 `object`）
+ `"requireReturn"` 要求使用一个返回值标签
  - `true`(default) 即使函数没有 `return` 语句
  - `false` 只有当函数包含 `return` 语句时才要求
+ `"requireReturnType": false` 运行返回标签遗漏类型
+ `"matchDescription"`
+ `"requireParamDescription": false`
+ `"requireRturnDescription": false`

### valie-typeof (√)

强制 `typeof` 表达式和有效的字符串字面量做比较（`undefined`, `object`, `function`,
`symbol`, `number`, `string`, `boolean`）。   

#### Options

对象 option:  

+ `"requireStringLiterals": true` `typeof` 表达式只能和字符串字面量及其他 `typeof` 表达式做比较。   
