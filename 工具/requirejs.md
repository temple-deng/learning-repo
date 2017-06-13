# RequireJs

## 基础

```html
<!DOCTYPE html>
<html>
    <head>
        <title>My Sample Project</title>
        <!-- data-main 属性告诉 require.js 在 require.js 加载
             完成后加载 scripts/main.js -->
        <script data-main="scripts/main" src="scripts/require.js"></script>
    </head>
    <body>
        <h1>My Sample Project</h1>
    </body>
</html>
```   

RequireJs 相对于 `baseUrl` 加载所有的代码。通常情况下 `baseUrl` 会设置为
data-main 属性指定的脚本所在的目录。     

```html
<!--这会将 baseUrl 设置为 'scripts' 目录, 并且加载模块ID 为
     'main' 的脚本 -->
<script data-main="scripts/main.js" src="scripts/require.js"></script>
```     

如果既没有明确的配置 `baseUrl`，又没有使用 `data-main` 属性，则默认的 `baseUrl` 是
包含允许RequireJS的 HTML 页面所在的目录。   

RequireJS 假设所有依赖都是脚本，所以可以省略 'js' 后缀。通过使用 path 配置选项，可以设置一组
脚本的位置。    

当我们想直接引用一个脚本，而不使用 'baseUrl + path' 的方式寻址时。如果模块ID有下面的特征之一，
ID就不会传递个 'baseUrl + path' 配置，而是直接像普通的 URL 地址一样处理。   

+ 以 '.js' 结尾
+ 以 '/' 开头
+ 包含一个 URL 协议，例如 'http:' 或者 'https:'    


假如我们现在有如下的目录结构：    

```
www/
  index.html
  js/
    app/
      sub.js
    lib/
      jquery.js
      canvas.js
    app.js
    require.js
```   

index.html 中有如下内容：    

`<script data-main='js/app.js' src='js/require.js'>`      

app.js 有如下内容：    

```javascript
requirejs.config({
    // 默认情况下从 js/lib 下加载所有模块 IDs
    baseUrl: 'js/lib',
    // 另外，如果模块 ID 以 'app' 开头，会从 'js/app' 中加载它
    // paths 配置是相对于 baseUrl的，并且由于 paths 位置是一个目录
    // 的位置，所以不能包含 '.js' 的扩展
    paths: {
        app: '../app'
    }
});

requirejs(['jquery', 'canvas', 'app/sub'],
function   ($,        canvas,   sub) {
});
```     

## 定义模块

RequireJS 语法会尽可能快的加载依赖的模块，即使是乱序加载，不会最终会按照正确的
依赖顺序执行。    

如果模块没有任何依赖，仅仅是一些名值对的集合，可以直接传入一个对象字面量给 `define()`:   

```javascript
//Inside file my/shirt.js:
define({
    color: "black",
    size: "unisize"
});
```    

如果模块没有依赖，仅仅是一个执行一些工作的函数，直接将函数传给 `define()`:    

```javascript
//my/shirt.js now does setup work
//before returning its module definition.
define(function () {
    //Do setup work here

    return {
        color: "black",
        size: "unisize"
    }
});
```     

普通的带依赖的函数：    

```javascript
//my/shirt.js now has some dependencies, a cart and inventory
//module in the same directory as shirt.js
define(["./cart", "./inventory"], function(cart, inventory) {
        //return an object to define the "my/shirt" module.
        return {
            color: "blue",
            size: "large",
            addToCart: function() {
                inventory.decrement(this);
                cart.add(this);
            }
        }
    }
);
```     

如果我们希望重用一些使用传统 CommonJS 模块语法写的代码，使用上面的依赖数组的写法会有些
困难（但不是不可以，下面会说），我们可能更喜欢将依赖项名称直接对齐到用于该依赖关系的本地变量。可以使用简化的 CommonJS
wrapper 完成这些工作，注意这种的意思是定义的这个模块本身是CommonJS格式的，现在如果想要在
RequireJS 中使用，需要这样包装：    

```javascript
define(function(require, exports, module) {
        var a = require('a'),
            b = require('b');
         //Put traditional CommonJS module content here
        //Return the module value
        return function () {};
    }
);
```    

需要注意的是，函数的参数就是 require, exports, module，名字，位置都应该就是这样的形式，
不然的话可能会出错。如果不使用 exports, module 可以省略这两个参数，不过如果要使用，就应该
按照这样的顺序。     

导出值的话，可以使用传统的CJS的 module.exports，可以使用 return。     

我们仍然可以针对这样的CJS模块使用依赖数组的形式指定依赖，传递给函数的参数的顺序应该与依赖数组的顺序一致。    

```javascript
define(['foo'], function (foo) {
    return function () {
        foo.doSomething();
    };
});
```

### 其他需要注意的地方

对于在 `define()` 函数调用内部出现的 `require('./relative/name')` 相对路径形式调用，确保
'require' 作为一个依赖，以便可以正确处理相对路径：    

```javascript
define(["require", "./relative/name"], function(require) {
    var mod = require("./relative/name");
});
```    

或者直接使用缩写的为了CommonJS 准备的语法：    

```javascript
define(function(require) {
    var mod = require("./relative/name");
});
```    

**相对模块名是相对于其他的名字的，不是 paths**: loader 在内部是根据模块的名字而不是其路径存储模块的。
所以对于相对模块的引用，相对于使用引用的模块名称解析，之后如果需要加载的话将模块名或者ID转换成路径。    

```javascript
* lib/
    * compute/
        * main.js
        * extras.js
```    

现在 main.js 模块有下面内容：    

```javascript
define(["./extras"], function(extras) {
    //Uses extras in here.
});
```   

路径配置如下:    

```javascript
require.config({
    baseUrl: 'lib',
    paths: {
      'compute': 'compute/main'
    }
});
```     

当现在有一个 `require(['compute'])` 声明，那么 lib/compute/main.js 的模块名就是 'compute'。
当其请求 './extras' 时，会相对于 'compute' 解析，所以就是 'compute/./extras'，最终得出就是 'extras'。
由于此时针对 'extras' 没有其他的路径配置，所以最终的路径时 'lib/extras'，这是不正确的。     

对于这种情况，packages config 是更好的选择，因为其可以将 main 模块设置为 'compute'，但在内部，loader
会以 'compute/main' 的模块ID存在模块，以便正确处理 './extras'。    

或者直接不设置 paths 配置也可以。     

## 配置选项

可以通过下面方式在HTML页面中或者 data-main 指定的脚本中设置配置对象：    

```html
<script src="scripts/require.js"></script>
<script>
  require.config({
    baseUrl: "/another/path",
    paths: {
        "some": "some/v1.0"
    },
    waitSeconds: 15
  });
  require( ["some/module", "my/module", "a.js", "b.js"],
    function(someModule,    myModule) {
        //This function will be called when all the dependencies
        //listed above are loaded. Note that this function could
        //be called before the page is loaded.
        //This callback is optional.
    }
  );
</script>
```     

也可以在 require.js 加载前定义一个叫做 `require` 的全局变量：     

```html
<script>
    var require = {
        deps: ["some/module1", "my/module2", "a.js", "b.js"],
        callback: function(module1, module2) {
            //This function will be called when all the dependencies
            //listed above in deps are loaded. Note that this
            //function could be called before the page is loaded.
            //This callback is optional.
        }
    };
</script>
<script src="scripts/require.js"></script>
```    

**baseUrl**:  寻找所有模块的根路径。如果没有明确的设置 baseUrl，默认值是加载 require.js 的
HTML 页面所在的位置。如果设置了 data-main 属性，那么其路径就是 baseUrl。     

**paths**: path 映射那么直接在 baseUrl 中没有找到的模块名。path 配置是相对于 baseUrl，除非
path 配置时 '/'开头的，或者其中包含协议例如'http:'。    

**bundles**: 允许在另一个脚本中配置多个模块ID。    

```javascript
requirejs.config({
    bundles: {
        'primary': ['main', 'util', 'text', 'text!template.html'],
        'secondary': ['text!secondary.html']
    }
});

require(['util', 'text'], function(util, text) {
    //The script for module ID 'primary' was loaded,
    //and that script included the define()'d
    //modules for 'util' and 'text'
});
```    

这个好像意思是 'primary' 模块中包含 'util' 'text' 模块的 `define()` 函数。不是很确定。
意思是一个模块文件中包含了多个模块的定义么？   

**shim**: 为那些传统的使用“浏览器全局变量”来声明依赖值及导出内容的脚本文件配置依赖及导出。    

```javascript
requirejs.config({
    shim: {
        'backbone': {
            // 这些脚本依赖应该在 backbone.js 加载前加载完成
            deps: ['underscore', 'jquery'],
            // 一旦加载完成，使用全局的 'Backbone' 变量作为模块值
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        },
        'foo': {
            deps: ['bar'],
            exports: 'Foo',
            init: function (bar) {
                //Using a function allows you to call noConflict for
                //libraries that support it, and do other cleanup.
                //However, plugins for those libraries may still want
                //a global. "this" for the function will be the global
                //object. The dependencies will be passed in as
                //function arguments. If this function returns a value,
                //then that value is used as the module export value
                //instead of the object found via the 'exports' string.
                //Note: jQuery registers as an AMD module via define(),
                //so this will not work for jQuery. See notes section
                //below for an approach for jQuery.
                return this.Foo.noConflict();
            }
        }
    }
});

//Then, later in a separate file, call it 'MyModel.js', a module is
//defined, specifying 'backbone' as a dependency. RequireJS will use
//the shim config to properly load 'backbone' and give a local
//reference to this module. The global Backbone will still exist on
//the page too.
define(['backbone'], function (Backbone) {
  return Backbone.Model.extend({});
});
```   

对于那些不导出任何值的 jQuery 或 Backbone 插件，可以直接声明一个依赖数组：    

```javascript
requirejs.config({
    shim: {
        'jquery.colorize': ['jquery'],
        'jquery.scroll': ['jquery'],
        'backbone.layoutmanager': ['backbone']
    }
});
```   
