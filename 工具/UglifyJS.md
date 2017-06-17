# UglifyJS3

## 命令行用法

`uglifyjs [input files] [options]`  

UglifyJS 可以接收多个输出文件。推荐先写输入文件，再传参数。会按序解析并压缩。文件是在同一
全局作用域中解析的。    

命令行参数：   

```
-h, --help                 打印用法信息，--help options 打印详细的信息
-V, --version
-p, --parse <options>      指定解析器选项：
                           acorn - 使用 Acorn 解析
                           bare_returns - 运行函数外返回。
                           expression - 解析单一表达式，而不是一个程序
                           spidermonkey - 假设输入文件时 SpiderMonkey AST 格式
-c, --compress [options]   启用压缩器 / 指定压缩器选项：
                           pure_funcs - 不使用返回值时可以安全删除的函数列表（不懂）
-m, --mangle [options]     混淆名字 / 指定混淆选项：
                           reserved - 名字不应该被混淆的列表
--mangle-props [options]   混淆属性 / 指定混淆选项：  
                           builtins - 混淆那些属性名覆盖标准 JS 全局变量的属性
                           debug - 添加 debug 前缀和后缀
                           domprops 混淆那些覆盖DOM属性的属性名
                           keep_quoted 只混淆不带引号的属性
                           regex 只混淆匹配的属性名
                           reserved 不该混淆的名字列表
-b, --beautify [options]   美化输出 / 指定输出选项：
                           beautify - 默认启用
                           preamble - Preamble to prepend to the output。可以使用这个插入
                           注释，这个不会被解析
                           quote_style - 0 - auto, 1 - single 2 -doubel 3 -original
                           wrap_iife 用 IIFE 包裹起来
-o, --output <file>        输出文件路径
--comments [filter]        阻止版权的注释在输出中
--config-file <file>      从 JSON 文件读取 `minify()` 的选项
-d, --define <expr>[=value]  全局定义
--ie8                     支持非标准的ie8
--keep-fnames             不要混淆函数的名字
--name-cache              File to hold mangled name mappings.
--self                    使用 UglifyJS 作为一个库
--source-map [options]
--timing                  在 STDERR 中输出操作的运行时间
--toplevel                压缩 and/or 混淆在顶级作用域的变量
--verbose
--warn
--wrap <name>             将所有东西放在一个大的函数中，让 exports 和 global 变量可用，
                          需要传递一个参数名来指定模块的名字。   
```   


### CLI 压缩选项

传递 `--compress` 来启用压缩器。可以传递一个逗号分隔的压缩选项的列表。   

选项时 `foo=bar` 的形式，或者仅仅`foo`。   

`uglifyjs file.js -c toplevel,sequences=false`  

### CLI 混淆选项

要启用混淆器传递 `--mangle` 参数，也是逗号分隔的选项列表：   

+ `toplevel` - 混淆在顶级作用域中的变量名（默认是禁止的）
+ `eval` - 混淆使用 `eval` or `with` 可见的作用域内变量（默认禁止）  

当启用混淆器，但是想要让一些特定的名字不要被混淆，可以将逗号分隔的名字列表传递给 reserved 选项值：  

`uglifyjs ... -m reserved=[$, require, exports]`   

### CLI 混淆属性名

注意：这个操作可能会打断你的代码。混淆属性名与混淆变量名不同，它是分离的另外一步。它会混淆输入
代码中的所有属性名，除了内置的 DOM 属性名及 js 核心的属性名：   

```javascript
// example.js
var x = {
    baz_: 0,
    foo_: 1,
    calc: function() {
        return this.foo_ + this.baz_;
    }
};
x.bar_ = 2;
x["baz_"] = 3;
console.log(x.calc());
```   

在混淆所有属性后 `uglifyjs example.js -c -m --mangle-props` 输出：   

`var x={o:0,_:1,l:function(){return this._+this.o}};x.t=2,x.o=3,console.log(x.l());`   

除了 `reserved` 指定的属性外混淆所有属性：  

`uglifyjs example.js -c -m --mangle-props reserved=[foo_,bar_]`  

输出:   

`var x={o:0,foo_:1,_:function(){return this.foo_+this.o}};x.bar_=2,x.o=3,console.log(x._());`    

混淆所有匹配 `regex` 的属性 `uglifyjs example.js -c -m --mangle-props regex=/_$/` 输出：   

`var x={o:0,_:1,calc:function(){return this._+this.o}};x.l=2,x.o=3,console.log(x.calc());`  

### 混淆未加引号的名字(`--mangle-props keep_quoted`)

```javascript
// stuff.js
var o = {
    "foo": 1,
    bar: 3
};
o.foo += o.bar;
console.log(o.foo);
```    

`uglifyjs stuff.js --mangle-props keep_quoted -c -m` 输出：   

`var o={foo:1,o:3};o.foo+=o.o,console.log(o.foo);`    

## API  

这个模块只包含一个单一的顶级函数，`minify(code, options)`，这个函数执行所有的最小化操作，
且是可配置的，默认情况下 `minify()` 会启用 `compress` 和 `mangle` 选项：   

```javascript
var code = "function add(first, second) { return first + second; }";
var result = UglifyJS.minify(code);
console.log(result.error); // runtime error, or `undefined` if no error
console.log(result.code);  // minified output: function add(n,d){return n+d}
```   

可以通过传递一个对象来最小化一个以上的 js 文件，这个对象作为第一个参数，键名是文件名，键值是源代码：   

```javascript
var code = {
    "file1.js": "function add(first, second) { return first + second; }",
    "file2.js": "console.log(add(1 + 2, 3 + 4));"
};
var result = UglifyJS.minify(code);
console.log(result.code);
// function add(d,n){return d+n}console.log(add(3,7));
```   

一个综合的例子：  


```javascript
var code = {
    "file1.js": "function add(first, second) { return first + second; }",
    "file2.js": "console.log(add(1 + 2, 3 + 4));"
};
var options = {
    toplevel: true,
    compress: {
        global_defs: {
            "@console.log": "alert"
        },
        passes: 2
    },
    output: {
        beautify: false,
        preamble: "/* uglified */"
    }
};
var result = UglifyJS.minify(code, options);
console.log(result.code);
// /* uglified */
// alert(10);"
```   


### Minify options  

+ `warning`(`false`) - 设为 `true` 会在 `result.warning` 中返回警告
+ `parse`(`{}`) - 设置额外的解析选项
+ `compress`(`{}`)
+ `mangle`(`{}`)
+ `ouput`(`null`)
+ `sourceMap`(`false`)
+ `toplevel`(`false`)
+ `ie8`

大致结果如下：   

```javascript
{
    warnings: false,
    parse: {
        // parse options
    },
    compress: {
        // compress options
    },
    mangle: {
        // mangle options

        properties: {
            // mangle property options
        }
    },
    output: {
        // output options
    },
    sourceMap: {
        // source map options
    },
    toplevel: false,
    ie8: false,
}
```    

### Parse options  

+ `bare_returns`(`false`) - 支持顶级的 `return` 声明
+ `html5_comments`(`true`)
+ `shebang`(`true`) - 支持 `#! command` 作为第一行   

### Compress options

注意这里的选项应该是全被 CLI 支持的，但其他的选项就不一定了。   

+ `sequences`(`true`) - 使用逗号运算符连接简单语句。可以指定一个正整数来规定最大数量
的逗号序列。如果设为 `true` 的话，默认限制是200。貌似是这个样子，例如一些分号分隔的简单
语句会改用逗号连接起来。数字的话，好像是最多连接起来的字句，最小的话就是2了，如果设为1等价于设为 true。但是不知道什么情况，怎么改都是一样的结果。      
+ `properties`  - 使用点运算符访问属性， `foo["bar"] -> foo.bar`
+ `dead_code` - 移除不可达的代码
+ `drop_debugger` - 移除 `debugger` 声明
+ `unsafe`(`false`) -
+ `unsafe_comps`(`false`)
+ `unsafe_Func`(`false`)
+ `unsafe_math`(`false`)
+ `unsafe_proto`(`false`)
+ `unsafe_regexp`(`false`)
+ `conditionals` - 对 `if` 和条件表达式进行优化
+ `comparisons`
+ `evaluate` - 尝试计算常量表达式
+ `booleans` - 对布尔上下文进行优化，例如 `!!a ? b :c -> a ? b : c`   
+ `loops` - 当可以静态决定条件的时候优化 `do, while, for` 循环
+ `unused` - 丢弃未引用的函数和变量。（简单的变量赋值不计入引用,也就是说这样的变量会直接移除）但是测试的时候这个选项没用啊。  
+ `toplevel` - 丢弃顶层作用域中未应用的函数和变量（默认是 `false`），可以是 `funcs` or `vars` 来只
丢弃函数或变量
+ `top_retain` - 应该是指定顶层作用域一些函数和变量，避免其被 `unused` 移除（可以是数组，comma-separated, RegExp or function）使用这个的话好像默认也有 toplevel 的效果。  
+ `hoist_funs` -- 提升函数声明
+ `hoist_vars`(`false`)
+ `if_return`-- 优化 if/return 和 if/continue
+ `inline` - 内嵌简单的函数
+ `join_vars` - 连接连续的 `var` 声明
+ `cascade` - 对序列进行小优化，例如`x, x -> x` `x=something(), x -> x=something()`（这种序列也几乎不用吧。。。）
+ `collapse_vars` - Collapse single-use non-constant variables - side effects permitting.
+ `reduce_vars` - 优化变量赋值，直接使用常量值
+ `warning`
+ `negate_iife`
+ `pure_getters`(`false`)

未完待续。
