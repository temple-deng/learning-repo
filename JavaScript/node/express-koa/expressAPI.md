# Express API
<!-- TOC -->

- [express()](#express)
    - [方法](#方法)
      - [express.static(root, [options])](#expressstaticroot-options)
      - [express.Router([options])](#expressrouteroptions)
- [应用](#应用)
  - [属性](#属性)
      - [app.locals](#applocals)
      - [app.mountpath](#appmountpath)
  - [事件](#事件)
      - [app.on('mount', callback(parent))](#apponmount-callbackparent)
  - [方法](#方法-1)
      - [app.all(path, callback [,callback])](#appallpath-callback-callback)
      - [app.delete(path, callback [, callback])](#appdeletepath-callback--callback)
        - [app.disable(name)](#appdisablename)
      - [app.disabled(name)](#appdisabledname)
      - [app.enable(name)](#appenablename)
      - [app.enabled(name)](#appenabledname)
      - [app.engine(ext, callback)](#appengineext-callback)
      - [app.get(name)](#appgetname)
      - [app.get(path, callback [, callback])](#appgetpath-callback--callback)
      - [app.listen(path, [callback]), app.listen(port, [hostname], [backlog], [callback])](#applistenpath-callback-applistenport-hostname-backlog-callback)
      - [app.METHOD(path, callback [,callback])](#appmethodpath-callback-callback)
      - [app.param([name], callback)](#appparamname-callback)
      - [app.path()](#apppath)
      - [app.post(path, callback [, callback])](#apppostpath-callback--callback)
      - [app.put(path, callback [, callback])](#appputpath-callback--callback)
      - [app.render(view, [locals], callback)](#apprenderview-locals-callback)
      - [app.route(path)](#approutepath)
      - [app.set(name, value)](#appsetname-value)
      - [具体的应用的配置参数](#具体的应用的配置参数)
      - [app.use([path], callback [,callback])](#appusepath-callback-callback)

<!-- /TOC -->

## express()

`express()` 函数是 `express` 模块暴露出的一个顶级函数，用来生成以Express应用。  

#### 方法

##### express.static(root, [options])  

`root` 参数指定了提供静态资源的根目录。当文件没有找到时，会调用 `next()` 将控制权交个下个中间件。下面表格描述了 `options` 对象支持的参数。  

| 属性 | 描述 | 类型 | 默认值 |
| :------------- | :------------- | :------------- | :------------- |
| `dotfiles` | 决定以点 `.`开头的文件及目录如果处理。       | String | "ignore" |
| `etag` | 是否允许生成 etag。注意 `express.static` 总是使用弱的ETag 验证 | Boolean | true |
| `extentsions` | 设置文件扩展名回退：如果文件没有找到，搜寻指定扩展名的文件。例如 `['html', 'htm']` | Mixed | false |
| `fallthrough` | 让客户端的错误直接作为一个未处理的请求跳过这个中间件，而不是转发一个客户端错误。 | Boolean | true |
| `index` | 发送指定的目录索引文件。设为 `false` 就禁用目录索引。| Mixed | "index.html" |
| `lastModified` | 发送 `Last-Modified` 首部，值为系统上文件上次修改的日期。 | Boolean | true |
| `maxAge` | 以毫秒或者一个 ms 格式的字符串的形式设置 Cache-Control 首部的 max-age 属性。 | Number | 0 |
| `redirect` | 当路径名是目录时，重定向到尾部“/”。 | Boolean | true |
| `setHeaders` | 设置HTTP 首部的函数 | Function |  | |

**dotfiles** 可能的值有:  

+ "allow" - 对点文件不特殊对待。
+ "deny" - 拒绝对点文件的请求，用403响应，并调用 `next()`
+ "ignore" - 忽视对点文件的访问，用404响应，并调用 `next()`

默认值的情况下，不会忽视对以点开头的目录中的文件。  

**fallthrough**  

当设置为 true, 坏的请求或者请求不存在的文件等客户端错误会造成这个中间件只是调用`next()`来调用下个中间件，当为 false时，这些错误会调用 `next(err)`。    

貌似如果我们想多次调用这个中间件设置多个目录的话，必须把这个选项设置为 `true`。

**setHeaders** 函数的签名如下：  

`fn(res, path, stat)` : `res` 是响应对象，`path` 是发送的文件路径，`stat` 发送文件的 stat 对象。  

##### express.Router([options])  

创建一个新的 router 对象。  

| 属性  | 描述  | 默认值 |
| :------------- | :------------- | :------------- |
| caseSensitive | 启用大小写敏感  | 默认是禁用的 |
| mergeParams | 保留父级路由器的 `req.params` 值。如果父级与子级参数名冲突了，子的值优先选用。 | false |
| strict | 启用严格的路由 | 默认禁用，"/foo"与 "/foo/" 视作相同的。|

## 应用

app 对象方法可以分为下面几类：  

+ 路由 HTTP 请求，例如 app.METHOD，app.param
+ 配置中间件，如 app.route。这里所谓的配置指的是为中间件配置好路由的路径吧。
+ 渲染 HTML 视图，app.render
+ 注册模板引擎，app.engine  

### 属性

##### app.locals

`app.locals` 对象的属性都是应用中的本地（或者叫局部？）变量。  

```javascript
app.locals.title
// => 'My App'

app.locals.email
// => 'me@myapp.com'
```   

一旦设置了这些属性值，这些值在应用的整个生命周期中都持续存在，不同于 `res.locals` 只在请求的周期中有效。   

可以在应用渲染的模板内访问这些局部变量。这些变量在中间件中可以用 `req.app.locals` 访问。这些变量可以为模板提供一些应用级别的数据以及一些助手函数（这个得模板支持函数才行吧）     

```javascript
app.locals.title = 'My App';
app.locals.strftime = require('strftime');
app.locals.email = 'me@myapp.com';
```   

##### app.mountpath  

`app.mountpath` 包含子app挂载的一个或多个路径 patterns。  

```javascript
var express = require('express');

var app = express(); // the main app
var admin = express(); // the sub app

admin.get('/', function (req, res) {
  console.log(admin.mountpath); // /admin
  res.send('Admin Homepage');
});

app.use('/admin', admin); // mount the sub app
```   

其与 `req.baseUrl` 属性相似，不过 `req.baseUrl` 返回匹配的路径，这个返回匹配的 patterns。    

如果子 app 挂载在多个路径模式上，则 `mountpath` 返回挂载的路径的列表。    

```javascript
var admin = express();

admin.get('/', function (req, res) {
  console.log(admin.mountpath); // [ '/adm*n', '/manager' ]
  res.send('Admin Homepage');
});

var secret = express();
secret.get('/', function (req, res) {
  console.log(secret.mountpath); // /secr*t
  res.send('Admin Secret');
});

admin.use('/secr*t', secret); // load the 'secret' router on '/secr*t', on the 'admin' sub app
app.use(['/adm*n', '/manager'], admin); // load the 'admin' router on '/adm*n' and '/manager', on the parent app
```   

### 事件

##### app.on('mount', callback(parent))

`mount` 事件当其挂载到一个父app 上时在子app上触发。  

注意，子 app 继承值时有下面的限制：  

+ 不会继承有默认值的setting value。在子 app 中必须自己设置这些值。
+ 继承那些没有默认值的 setting value。   

```javascript
var admin = express();

admin.on('mount', function (parent) {
  console.log('Admin Mounted');
  console.log(parent); // refers to the parent app
});

admin.get('/', function (req, res) {
  res.send('Admin Homepage');
});

app.use('/admin', admin);
```   

### 方法

##### app.all(path, callback [,callback])

参数：  

+ `path` *(Default: '/')* :  调用中间件函数的路径；可以是下面格式：
  - 一个代表路径的字符串
  - 一个路径模式 pattern
  - 一个匹配路径的正则表达式
  - 包含上面任意格式的集合的数组  

具体参见 [Path examples](#pathExamples)。  

+ `callback` *None* : 可以是下面的之一：  
  - 一个中间件函数
  - 一系列中间件函数（逗号分隔）
  - 一个中间件函数的数组
  - 上面的格式的组合  

这些中间件函数和其他中间件一样，只不过可以调用 `next('route')` 绕过剩下的路由回调。由于
router 和 app 都实现了中间件接口，所有可以像使用其他中间件一样使用它们。  

##### app.delete(path, callback [, callback])

参数同上。  

###### app.disable(name)

将布尔类型的配置 `name` 设置为 `false`， `name` 是 app settings table 中的一员。调用 `app.set('foo', false)` 与 `app.disable('foo')` 效果相同。  

```javascript
app.disable('trust proxy');
app.get('trust proxy');
// => false
```   

##### app.disabled(name)  

如果布尔型配置的 `name` 是 disabled(`false`), 返回 `true`， `name` 也是 app 配置表的一员。  

```javascript
app.disabled('trust proxy');
// => true

app.disable('trust proxy');
app.disabled('trust proxy');
// => false
```   

##### app.enable(name)  

```javascript
app.enable('trust proxy');
app.get('trust proxy');
// => true
```  

##### app.enabled(name)

跳过

##### app.engine(ext, callback)

将给定的模板引擎回调 `callback` 注册为 `ext`。然而看下面的意思 `ext` 就是文件扩展名，其实应该翻译为给指定的文件扩展名 `ext` 的文件注册 `callback` 模板引擎吧。    

默认情况下，Express 会基于文件扩展名加载 `require()` 引擎。例如当想要渲染 "foo.pug" 文件时，Express 内部会调用下面的语句，并且为了提升性能会将 `require()` 缓存起来。  

`app.engine('pug', require('pug').__express);`   

对于不提供开箱即用的 `.__express` 的引擎调用这个方法，或者想为模板引擎匹配不同的扩展名
调用这个方法。    

例如想要让 EJS 模板引擎匹配 ".html" 文件：  

`app.engine('html', require('ejs').renderFile);`   

##### app.get(name)  

```javascript
app.get('title');
// => undefined

app.set('title', 'My Site');
app.get('title');
// => "My Site"
```   

##### app.get(path, callback [, callback])  

参数上面讲过了。  

##### app.listen(path, [callback]), app.listen(port, [hostname], [backlog], [callback])   

`express()` 返回的 `app` 其实是一个 JS 函数，设计用来传递给 Node 的 HTTP 服务器作为处理请求的回调函数。  

```javascript
var express = require('express');
var https = require('https');
var http = require('http');
var app = express();

http.createServer(app).listen(80);
https.createServer(options, app).listen(443);
```    

##### app.METHOD(path, callback [,callback])  

参数讲过了。   

##### app.param([name], callback)

为路由参数添加回调触发器（貌似就是当请求匹配一些带参数的路由时，调用回调），`name` 是一个参数的名字，或者一组参数的名字。回调函数的参数分别是请求对象，响应对象，next中间件，参数值，以及参数名。   

如果 `name` 是数组，`callback`触发器会为其中声明的每个参数都注册，顺序就是他们在数组中的顺序。另外，除了数组中的最后一个参数，剩下的参数的回调中调用 `next()` 会调用下个参数的回调。对于最后一个参数，`next()` 会调用匹配的路由中的下一个中间件。根据下面第二个例子来看，如果是一个数组，相当于其实分开为每一个参数绑定一次，所以每次回调中的参数值和参数名参数还是一个单独的值。       

例如，当 `:user` 出现在一个路由路径中，我们可以为其映射一些用户加载逻辑，并在路由中 `req.user` 属性上提供这些逻辑，或者执行一些输入参数的验证操作。     

```js
app.param('user', function(req, res, next, id) {

  // try to get the user details from the User model and attach it to the request object
  User.find(id, function(err, user) {
    if (err) {
      next(err);
    } else if (user) {
      req.user = user;
      next();
    } else {
      next(new Error('failed to load user'));
    }
  });
});
```    

这些参数回调触发器对其定义到的路由器上来说是局部的，他们不会被挂载的 apps 或者 routers 继承。所以，定义在 `app` 上的参数回调只会在定义在 `app` 路由上的参数触发。  

所有的参数回调会在参数出现的任意路由的任意处理器调用之前调用，并且在每个请求响应周期中只调用一次，即使参数匹配多个路由也是一样。    

```javascript
app.param('id', function (req, res, next, id) {
  console.log('CALLED ONLY ONCE');
  next();
});

app.get('/user/:id', function (req, res, next) {
  console.log('although this matches');
  next();
});

app.get('/user/:id', function (req, res) {
  console.log('and this matches too');
  res.end();
});
```   

当 GET /user/42 时，会打印出下面的内容。   

```
CALLED ONLY ONCE
although this matches
and this matches too
```    

```javascript
app.param(['id', 'page'], function (req, res, next, value) {
  console.log('CALLED ONLY ONCE with', value);
  next();
});

app.get('/user/:id/:page', function (req, res, next) {
  console.log('although this matches');
  next();
});

app.get('/user/:id/:page', function (req, res) {
  console.log('and this matches too');
  res.end();
});
```  

当 GET /user/42/3 时，打印出下面的东西：  

```
CALLED ONLY ONCE with 42
CALLED ONLY ONCE with 3
although this matches
and this matches too
```    

注意这个回调的过程可能是这样的，首先是进行请求的路由匹配，然后找到匹配的路由后再分析有没有参数回调，有的话应该是先进行参数回调触发器的调用，执行完后进行路由中间件的处理。     

##### app.path()  

返回 app 的规范的路径的字符串：   

```javascript
var app = express()
  , blog = express()
  , blogAdmin = express();

app.use('/blog', blog);
blog.use('/admin', blogAdmin);

console.log(app.path()); // ''
console.log(blog.path()); // '/blog'
console.log(blogAdmin.path()); // '/blog/admin'
```   

看样子，貌似是返回一个完整从顶层应用到当前应用的挂载路由，当挂载 app 时这个方法会变得很复杂，最好还是用 `req.baseUrl`。   


##### app.post(path, callback [, callback])  

##### app.put(path, callback [, callback])   

##### app.render(view, [locals], callback)  

通过 `callback` 函数返回视图渲染后的 HTML，注意这里不是说用 `cb` 渲染视图，而是说把渲染后的视图的字符串传给回调当参数。可以提供一个供视图使用的包含局部的对象。这个方法
很像 `res.render()`，不过它不会自动将渲染后的视图发送给客户端。   

```javascript
app.render('email', { name: 'Tobi' }, function(err, html){
  // ...
});
```   

这个方法的话主要是一个生成渲染视图后字符串的函数，`res.render()` 内部貌似也是用这个
`app.render()` 来渲染视图。

##### app.route(path)

返回一个单一路由的实例。注意是为了减少不必要的重复写路由的路径吧。（感觉特别像一个挂载在
某个路径上的路由器或者子 app 实例）      

```javascript
var app = express();

app.route('/events')
.all(function(req, res, next) {
  // runs for all HTTP verbs first
  // think of it as route specific middleware!
})
.get(function(req, res, next) {
  res.json(...);
})
.post(function(req, res, next) {
  // maybe add a new event...
});
```   

##### app.set(name, value)

##### 具体的应用的配置参数

注意上面提到的参数子app的参数继承规则：    

+ 子 app 不会继承那些有默认值的配置的值。
+ 但是会继承那些没有默认值的配置的值。    

_Note:_ 但是这个规则有两个例外，一个是子 app 会继承 `trust proxy` 的值，即便其有默认值，以及不会在生成环境下继承 `view cache` 的值。    

| 属性 | 类型 | 描述 | 默认值 |
| :------------- | :------------- | :------------- | :------------- |
| case sensitive routing | Boolean | 子 app 会继承这个值 | N/A(undefined) |
| env | String | 环境模式，例如 "production" | `process.env.NODE_ENV`（这个值不存在时就是 "development"） |
| etag | Varied | | weak |
| jsonp callback name | String | 就是 JSONP 的回调名咯。| "callback" |
| jsonp replacer | Varied | `JSON.stringify` 的 `replacer` 参数，子 app 会继承这个值 | N/A(undefined) |
| json spaces | Varied | 子 app 会继承 | N/A(undefined) |
| query parser | Varied | 设置为 `false` 时禁用query 解析，或者设置解析器为 "simple","extended", 或者定制的解析函数。 simple 是基于Node 原生的 `querystring`。extended是基于 `qs`。定制的函数会接受完整的查询字符串作参数，必须返回一个键值对对象。| "extended" |
| strict routing | Boolean | 子 app 会继承 | N/A(undefined) |
| subdomain offset | Number | 如果要访问子域，要删除多少个以点分隔的部分。 | 2 |
| trust proxy | Varied | 表明 app 是位于代理后的，并且使用 `X-Forwarded-*` 首部来确定客户端的连接和IP地址。但是需要注意的是 `-Forwarded-*` 是可以轻易修改的，所以可能具有欺骗性，导致检测出来的信息不准确。| false |
| views | String or Array | 一个目录或一个目录的数组，存放应用的视图。 | `process.cwd() + '/views'` |
| view cache | Boolean | 是否允许视图模板编译缓存。当在 "production"模式下，子app不会继承这个值 | 在 "production" 中为`true`，其他都为 undefined |
| view engine | String | 子 app 会继承这个设置 | N/A(undefined) |
| x-powered-by | Boolean | 启用 "X-Powered-By: Express" HTTP 首部 | true |

etag 的设置选项，注意这些设置只针对动态文件：  

+ Boolean: `true` 启用弱验证，这是默认设置。然而 `false` 是禁用 etag。
+ String: "strong" 启用强验证，"weak" 是弱。
+ Function: 定制 ETag 函数。   

```javascript
app.set('etag', function (body, encoding) {
  return generateHash(body, encoding); // consider the function is defined
});
```   

##### app.use([path], callback [,callback])  

在指定的路径上挂载中间件。  

一个路由会匹配那些在其路径后紧跟"/" 的路径。例如，`app.use('/apple', ...)` 会匹配 "/apple", "/apple/images", "/apple/images/news" 等等。
然而这个效果在其他路由方法上并不合适。     

由于默认是 "/"，所有那些没有指定挂载路径的中间件会在每个请求来时都调用。    

路径的例子：  

+ 单纯的路径时： 下面的会匹配以 "/abcd" 开头的路径

```javascript
app.use('/abcd', function (req, res, next) {
  next();
});
```   

+ 路径模式：  

This will match paths starting with `/abcd` and `/abd`  

```javascript
app.use('/abc?d', function (req, res, next) {
  next();
});
```   

This will match paths starting with `/abcd`, `/abbcd`, `/abbbbbcd`, and so on:  

```javascript
app.use('/ab+cd', function (req, res, next) {
  next();
});
```   

This will match paths starting with `/abcd`, `/abxcd`, `/abFOOcd`, `/abbArcd`, and so on:   

```javascript
app.use('/ab\*cd', function (req, res, next) {
  next();
});
```   

This will match paths starting with `/ad` and `/abcd`:  

```javascript
app.use('/a(bc)?d', function (req, res, next) {
  next();
});
```   

+ 正则表达式

This will match paths starting with `/abc` and `/xyz`:  

```javascript
app.use(/\/abc|\/xyz/, function (req, res, next) {
next();
});
```    

+ 数组  

This will match paths starting with `/abcd`, `/xyza`, `/lmn`, and `/pqr`:  

```javascript
app.use(['/abcd', '/xyza', /\/lmn|\/pqr/], function (req, res, next) {
next();
});
```    

注意一下路由路径与挂载路径的区别，路由路径的话必须精确的匹配，例如 `/user/id` 就只有
`/user/id` 的路由才能匹配，但是 `/user` 就不能匹配，但是挂载路径就不一样，挂载路径
可以匹配路径前缀与挂载路径匹配的那些路径。    