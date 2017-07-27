# Request and Response  

<!-- TOC -->

- [Request and Response](#request-and-response)
  - [Request](#request)
    - [属性](#属性)
        - [req.app](#reqapp)
        - [req.baseUrl](#reqbaseurl)
        - [req.body](#reqbody)
        - [req.cookies](#reqcookies)
        - [req.fresh](#reqfresh)
        - [req.hostname](#reqhostname)
        - [req.ip](#reqip)
        - [req.ips](#reqips)
        - [req.method](#reqmethod)
        - [req.originalUrl](#reqoriginalurl)
      - [几个路径值的比较](#几个路径值的比较)
        - [req.params](#reqparams)
        - [req.path](#reqpath)
        - [req.protocol](#reqprotocol)
      - [req.query](#reqquery)
        - [req.route](#reqroute)
        - [req.secure](#reqsecure)
        - [req.signedCookies](#reqsignedcookies)
        - [req.stale](#reqstale)
        - [req.subdomains](#reqsubdomains)
        - [req.xhr](#reqxhr)
    - [方法](#方法)
        - [req.accepts(types)](#reqacceptstypes)
        - [req.acceptsCharset(charset [, ...])](#reqacceptscharsetcharset--)
        - [req.acceptsEncodings(encoding [, ...])](#reqacceptsencodingsencoding--)
        - [req.acceptsLanguages(lang [, ...])](#reqacceptslanguageslang--)
        - [req.get(field)](#reqgetfield)
        - [req.is(type)](#reqistype)
        - [req.range(size [, options])](#reqrangesize--options)
  - [Response](#response)
    - [属性](#属性-1)
        - [res.app](#resapp)
        - [res.headerSent](#resheadersent)
        - [res.locals](#reslocals)
    - [方法](#方法-1)
          - [res.append(field [, value])](#resappendfield--value)
        - [res.attachment([filename])](#resattachmentfilename)
        - [res.cookie(name, value [,options])](#rescookiename-value-options)
        - [res.clearCookie(name [, options])](#resclearcookiename--options)
        - [res.download(path [, filename] [, fn])](#resdownloadpath--filename--fn)
        - [res.end([data] [,encoding])](#resenddata-encoding)
        - [res.format(object)](#resformatobject)
        - [res.get(field)](#resgetfield)
        - [res.json([body])](#resjsonbody)
        - [res.jsonp([body])](#resjsonpbody)
        - [res.links(links)](#reslinkslinks)
        - [res.location(path)](#reslocationpath)
        - [res.redirect([status,] path)](#resredirectstatus-path)
        - [res.render(view [locals] [,callback])](#resrenderview-locals-callback)
        - [res.send([body])](#ressendbody)
        - [res.sendFile(path [options] [, fn])](#ressendfilepath-options--fn)
        - [res.sendStatus(statusCode)](#ressendstatusstatuscode)
        - [res.set(field [,value])](#ressetfield-value)
        - [res.status(code)](#resstatuscode)
        - [res.type(type)](#restypetype)
        - [res.vary(field)](#resvaryfield)
  - [Router](#router)
    - [方法](#方法-2)
      - [router.all(path, [callback, ...] callabck)](#routerallpath-callback--callabck)
      - [router.METHOD(path, [callback, ...] callback)](#routermethodpath-callback--callback)
      - [router.param(name, callback)](#routerparamname-callback)
      - [router.route(path)](#routerroutepath)
      - [router.use([path], [function, ...] function)](#routerusepath-function--function)

<!-- /TOC -->

## Request

### 属性

##### req.app

正在使用这个中间件的Express 应用实例的引用。   

##### req.baseUrl  

路由器实例挂载的 URL 路径。如果没有挂载的话，好像就是当前使用中间件的路由路径。文档上说是与 `app.mountpath` 类似，
其实个人觉得 `baseUrl` 应该是与 `app.path()` 类似，应为如果是多层挂载，最终返回的多层挂载匹配的路径，而不像 `app.mountpath`
只是单层挂载。       

##### req.body

包含请求主体提交的数据的键值对对象。默认情况下时 `undefined`，但是当使用了解析主体的中间件
之后，这个属性就可以被其污染填充了。    

```javascript
var app = require('express')();
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.post('/profile', upload.array(), function (req, res, next) {
  console.log(req.body);
  res.json(req.body);
});
```    

##### req.cookies

当使用 cookie-parser 中间件时，这个属性就是一个对象，包含了请求发送的 cookies。如果请求没有包含 cookies，默认就是 `{}`。   

```javascript
// Cookie: name=tj
req.cookies.name
// => "tj"
```   

##### req.fresh

说明请求是否是“新鲜的”，这和 `req.stale` 是相对的。其实还是条件请求的验证，用来说明请求的资源是不是新鲜的。  

返回 true 表明客户端缓存的资源还是新鲜的，可以直接使用呗，可以直接使用 304 响应。相反返回 `false` 我们就应该返回完整的响应。         

当 `cache-control` 请求首部不包含一个 `no-cache` 指令，并且下面的情况为 `true` 时，这个属性返回 `true`：   

+ 如果指定了 `if-modified-since` 请求首部，并且 `last-modified` 请求首部等于或早于 `modified` 响应首部。这里说的不清楚，应该是响应中的
`Last-Modified` 的日期等于或者早于 `If-Modified-Since` 中指明的上次修改日期的话，这时表明缓存的还可用。    
+ 如果 `if-none-match` 请求首部为 `*`，任意都能匹配了，说明资源还没有过期。
+ 如果解析 `if-none-match` 首部后不匹配 `etag` 响应首部。（感觉这里文档有问题，都不匹配肯定是过期了，怎么可能返回
true,应该是可以找到一个匹配才能返回 true。而且看使用的库代码也是这个意思，只有所有 etag 都不匹配的时候才返回 `false`，只要
有一个匹配就返回 `true`）    


##### req.hostname

包含从 Host 首部解析出来的主机名。  

当 `trust proxy` 不为 `false` 时，这个属性就会是 `X-Forwarded-Host` 首部的值。  

##### req.ip

请求的IP地址，同上不为 `false` 时，是 `X-Forwarded-For` 中最左边的那个值。  

##### req.ips

同上不为 `false`，包含在 `X-Forwarded-For`中所有 IP 的数组，否则，就是个空数组。    


##### req.method  

没错，就是请求的方法的字符串，应该是大写形式的。  

##### req.originalUrl

原始的请求 URL。  

```javascript
// GET /search?q=something
req.originalUrl
// => "/search?q=something"
```    

在中间件函数中，`req.originalUrl` 是 `req.baseUrl` 和 `req.path` 的组合。     

```javascript
app.use('/admin', function(req, res, next) {  // GET 'http://www.example.com/admin/new'
  console.log(req.originalUrl); // '/admin/new'
  console.log(req.baseUrl); // '/admin'
  console.log(req.path); // '/new'
  next();
});
```    

#### 几个路径值的比较

`app.mountpath`, `app.path()` 都是返回 app 的挂载路径， 而且是匹配的 patterns。    

不同点是 `app.path()` 返回的是从顶层挂载点一直到目前应用的所有挂载路径的叠加值。也就说，如果只是单层的挂载的话，`app.mountpath` 与 `app.path()` 值应该是相同的。    

注意如果挂载点是数组的话，应该会字符串化，所以这两个值始终是字符串。而且默认的挂载点是 `/`，也就说如果我们使用
`app.use()` 挂载时没有提供挂载路径，那么匹配的是 `/`，但是需要注意的是和没有挂载的区别，如果当前的 app 没有使用其他的 `app.use()` 挂载，那么返回的是空串     
注意在挂载的时候应该是会重写请求的 url。     

还有一点需要注意的是，所谓的挂载其实是针对中间件来说的，仔细想一想使用 `app.use()` 挂载的时候，我们都是将传入的 app 或者 router
当做是中间件处理的。但是上面的 `app.mountpath` 和 `app.path()` 确实是针对挂载的子 app 说的。          

`req.baseUrl` 就不单是只有 `app` 对象能用了，这个属性更像是中间件的挂载路径，返回的匹配的挂载路径的路径值，如果没有挂载就返回空串，需要说明的是
这里的没有挂载，即指使用路由方法绑定的中间件，又指使用 `app.use()` 绑定的中间件但是却没有指定挂载路径的情况。而且这个值也是多层挂载的叠加值，
而且是匹配挂载路径的请求的路径实际值。    

`req.originalUrl` 则就是原始的请求地址。但是应该和 `req.url` 值类似，只是请求起始行中的那一部分，应该就只有路径部分。    

`req.path` 和 `req.baseUrl` 合起来就是 `req.originalUrl`，注意 `req.path` 和 `req.url` 是相等的。所以推测 `app.mountpath` 和 `app.path()` 都是应用
内自己记录的绑定的挂载路径，而`req.originalUrl`，`req.baseUrl` 和 `req.path` 应该都是从 `req.url` 一步步拆解而来的，因此它们
返回的都是实际请求的路径。每挂载一次，可能就会修改一次 `req.url`，重写 url 地址。          

##### req.params   

举个栗子，如果当前路由路径时 `/user/:name`:  

```javascript
// GET /user/tj
req.params.name
// => "tj"
```    

如果定义路由时使用的是正则，会提供一些捕获的数组，使用 `req.param[n]` 访问这些数组，`n`就是第n个捕获数组。这个规则在使用字符串形式类似 `/file/*` 等未命名的通配符时也会使用：  

```javascript
// GET /file/javascripts/jquery.js
req.params[0]
// => "javascripts/jquery.js"
```    

注意这个 `*` 通配符的意思现在还不是很明确。    

##### req.path  

一个请求URL地址的路径部分的字符串。  

```javascript
// example.com/users?sort=desc
req.path
// => "/users"
```   

在中间件中调用时，挂载点不包含在 `req.path` 内。  

##### req.protocol

同上，当不为 `false` 时，这个值是 `X-Forwarded-Proto` 首部的值。   


#### req.query

一个对象。   

```javascript
// GET /search?q=tobi+ferret
req.query.q
// => "tobi ferret"

// GET /shoes?order=desc&shoe[color]=blue&shoe[type]=converse
req.query.order
// => "desc"

req.query.shoe.color
// => "blue"

req.query.shoe.type
// => "converse"
```    

##### req.route

返回一个对象，包含了当前匹配的路由，注意这个属性只能在路由的处理器中使用，
普通的中间件会返回 `undefined`。      

```javascript
app.get('/user/:id?', function userIdHandler(req, res) {
  console.log(req.route);
  res.send('GET');
});
```    

会输出下面的内容：  

```javascript
{ path: '/user/:id?',
  stack:
   [ { handle: [Function: userIdHandler],
       name: 'userIdHandler',
       params: undefined,
       path: undefined,
       keys: [],
       regexp: /^\/?$/i,
       method: 'get' } ],
  methods: { get: true } }
```   

##### req.secure

是否使用 TLS 连接呗。   

##### req.signedCookies

##### req.stale

##### req.subdomains

请求的域名中的子域组成的数组。  

```javascript
// Host: "tobi.ferrets.example.com"
req.subdomains
// => ["ferrets", "tobi"]
```    

##### req.xhr

布尔值属性，如果请求 `X-Requested-With` 首部值是 "XMLHttpRequest" 就为 true。   

### 方法

注意很多方法都是内容协商相关的，这里完整的介绍一些，其实协商的内容无非这几项：MIME类型，字符编码方式，语言语种，编码方式（特指压缩编码）。   

MIME 类型的话在请求首部中是 `Accept` 来指定接受的类型，在响应中是 `Content-Type` 来声明主体的类型。字符编码的话在请求首部
是 `Accept-Charset`，在响应中还是 `Content-Type` 指定的，这个首部是可以同时指定 MIME 类型及字符编码的。语言语种的话在请求首部
是 `Accept-Language`，在响应首部是 `Content-Language`，编码方式的话在请求首部是 `Accept-Encoding`，响应是 `Content-Encoding`。   

##### req.accepts(types)

基于请求的 `Accept` 首部来选择一个最优的资源格式。如果指定的格式没有一种是可接受的，那么返回 `false`。       

`type` 参数可以是一个MIME字符串（例如"application/json"），一个扩展名如"json"，一个逗号分隔的列表，或者是一个数组。对于列表或数组，会返回最佳匹配。   

```javascript
// Accept: text/html
req.accepts('html');
// => "html"

// Accept: text/*, application/json
req.accepts('html');
// => "html"
req.accepts('text/html');
// => "text/html"
req.accepts(['json', 'text']);
// => "json"
req.accepts('application/json');
// => "application/json"

// Accept: text/*, application/json
req.accepts('image/png');
req.accepts('png');
// => undefined 这里有异议啊，上面说的是返回 false 的呀

// Accept: text/*;q=.5, application/json
req.accepts(['html', 'json']);
// => "json"
```    

注意匹配后返回的都是提供的参数中的内容，而不是首部值，所以如果提供的扩展名匹配了
就返回扩展名。    

##### req.acceptsCharset(charset [, ...])  

基于 `Accept-Charset` 首部返回第一接受的字符集。   

##### req.acceptsEncodings(encoding [, ...])

基于 `Accept-Encoding` 返回应该是第一个可接受的压缩方式吧。   

##### req.acceptsLanguages(lang [, ...])  

`Accept-Language`。 怎么后面几个都是返回第一个可接受的，而不是最佳匹配。   

##### req.get(field)   

返回请求首部（大小写不敏感）。`Referrer` 和 `Referer` 是通用的。  

```javascript
req.get('Content-Type');
// => "text/plain"

req.get('content-type');
// => "text/plain"

req.get('Something');
// => undefined
```    

别名为 `req.header(field)`。   

##### req.is(type)  

检测请求的 "Content-Type" 首部是否与 `type` 匹配。   

```javascript
// With Content-Type: text/html; charset=utf-8
req.is('html');
req.is('text/html');
req.is('text/*');
// => true

// When Content-Type is application/json
req.is('json');
req.is('application/json');
req.is('application/*');
// => true

req.is('html');
// => false
```    

##### req.range(size [, options])

`Range` 首部解析器。不是很懂这个的意思，看样子是会解析 `Range` 首部，然后将解析
的返回放在一个数组中。        

`size` 是资源最大的尺寸。          

`options` 选项当前只有 `combine` 属性，是布尔值。指定是否相邻及覆盖的范围应该合并，默认是 `false`，如果是 `true` 的话，就会合并起来。       

会返回一个范围数组，或者当解析出错时返回一个负值：  

+ -2 表示首部字符串异常
+ -1 表示一个不合适的范围

```javascript
// parse header from request
var range = req.range(1000)

// the type of the range
if (range.type === 'bytes') {
  // the ranges
  range.forEach(function (r) {
    // do something with r.start and r.end
  })
}
```   

具体使用的库是这个样子：    

```js
parseRange(100, 'bytes=50-55,0-10,5-10,56-60', { combine: true })
// => [
//      { start: 0,  end: 10 },
//      { start: 50, end: 60 }
//    ]
```    

也就说将解析的范围放在一个数组中，每个元素是一个对象，对象的 `start` 表明范围的起始位置，`end` 表示结束位置。`size` 参数应该是我们自己设置的请求的资源的最大长度，这样的
话如果请求的范围超出，那么这个函数就可以返回负数来表示有问题。    

## Response

### 属性

##### res.app  

##### res.headerSent

一个布尔值，用来表明是否响应的HTTP首部已经发送出去了。   

##### res.locals   

一个包含了响应局部变量作用域内变量的对象，只有在当次请求响应周期内供视图使用。否则的话，
和 app.locals 是一致的。   

```javascript
app.use(function(req, res, next){
  res.locals.user = req.user;
  res.locals.authenticated = ! req.user.anonymous;
  next();
});
```   

### 方法

###### res.append(field [, value])  

添加响应首部，`value` 可以是字符串或数组。多次设置一个首部的值会添加多个相同名字的首部，即使值相等也是。       

注意在 `res.append()` 之后调用 `res.set()` 会重置之前设置的响应首部值。而且恰好是重复出现次的首部的话，会设置
第一个首部的值，然后删除多余的首部。        

```javascript
res.append('Link', ['<http://localhost/>', '<http://localhost:3000/>']);
res.append('Set-Cookie', 'foo=bar; Path=/; HttpOnly');
res.append('Warning', '199 Miscellaneous warning');
```    

##### res.attachment([filename])   

设置HTTP 响应首部 `Content-Disposition` 为 "attachment"，如果给定了 `filename`，会基于扩展名通过 `res.type()` 设置 `Content-Type`，并且设置 `Content-Disposition` "filename=" 参数。    

```javascript
res.attachment();
// Content-Disposition: attachment

res.attachment('path/to/logo.png');
// Content-Disposition: attachment; filename="logo.png"
// Content-Type: image/png
```   

##### res.cookie(name, value [,options])  

设置 cookie值。`value` 属性必须是字符串或者可以转化为JSON 的对象。  

| 属性 | 类型 | 描述 |
| :------------- | :------------- | :------------- |
| domain | String  | |
| encode | Function | 用来编码cookie值的同步调用的函数，默认是 `encodeURIComponent` |
| expires | Date | 没有指定的话就是0，创建一个会话cookie |
| httpOnly | Boolean | |
| maxAge | Number | 毫秒格式|
| path | String | 默认是 "/" |
| secure | Boolean | |
| signed | Boolean | |
| sameSite | Boolean or String | |

我们可以传入一个对象作为 cookie 值，这个情况下，对象会序列化为 JSON，并且之后会被 `bodyParser()` 中间件解析（话说我们这里是设置 cookie，关解析什么时，应该是在请求的时候解析吧）：    

```js
res.cookie('cart', { items: [1,2,3] });
res.cookie('cart', { items: [1,2,3] }, { maxAge: 900000 });
```     

##### res.clearCookie(name [, options])

为什么会有第二个参数，具体时怎么清除的。   

##### res.download(path [, filename] [, fn])  

将 `path` 位置的文件作为 `attachment` 传输。默认情况下，`Content-Disposition` 首部的 `filename` 参数是 `path`（应该是 `path` 的文件名部分吧）。使用 `filename` 参数会覆盖这种默认行为。   

应该是内部使用 `res.sendFile()` 传输文件，当出错或者传输完成时调用回调。  

```javascript
res.download('/report-12345.pdf');

res.download('/report-12345.pdf', 'report.pdf');

res.download('/report-12345.pdf', 'report.pdf', function(err){
  if (err) {
    // Handle error, but keep in mind the response may be partially-sent
    // so check res.headersSent
  } else {
    // decrement a download credit, etc.
  }
});
```  

##### res.end([data] [,encoding])  

结束响应进程。这个方法的话实际上应该是原生 `Response` 对象上的 `end()` 方法，不过为什么不能有回调。。。       

##### res.format(object)  

根据 `Accept` 请求首部执行内容协商。其会使用 `req.accepts()` 挑选一个处理函数。如果没有指定这个首部，就调用第一个回调，如果都不匹配，就响应 406, 或者调用 `default` 回调。    

下面的例如会对 `Accept` 首部值为 `application/json` 或者 `*/json` 的请求响应 `{"message": "hey"}`。但是如果是 `*/*`，响应就是 `"hey"`。   

```javascript
res.format({
  'text/plain': function(){
    res.send('hey');
  },

  'text/html': function(){
    res.send('<p>hey</p>');
  },

  'application/json': function(){
    res.send({ message: 'hey' });
  },

  'default': function() {
    // log the request and respond with 406
    res.status(406).send('Not Acceptable');
  }
});
```   

除了规范的 MIME 类型，我们也可以使用扩展名：   

```js
res.format({
  text: function(){
    res.send('hey');
  },

  html: function(){
    res.send('<p>hey</p>');
  },

  json: function(){
    res.send({ message: 'hey' });
  }
});
```    

##### res.get(field)

获取响应首部，注意匹配是大小写不敏感的。

##### res.json([body])  

使用 `JSON.stringify()` 将参数转换为 JSON 字符串发送 JSON 响应。      

##### res.jsonp([body])   

发送 JSONP 响应，其实类似 `res.json`，无非就是最后拿 JSONP 回调把字符串包裹以下。     

```js
res.jsonp(null);
// => callback(null)

res.jsonp({ user: 'tobi' });
// => callback({ "user": "tobi" })

res.status(500).jsonp({ error: 'message' });
// => callback({ "error": "message" })
```    

##### res.links(links)  

添加 Link 首部吧：  

```javascript
res.links({
  next: 'http://api.example.com/users?page=2',
  last: 'http://api.example.com/users?page=5'
});
```  

```  
Link: <http://api.example.com/users?page=2>; rel="next",
      <http://api.example.com/users?page=5>; rel="last"
```   

##### res.location(path)  

设置 `Location` 首部。单单设置 `Location` 首部不会直接导致重定向。     

```javascript
res.location('/foo/bar');
res.location('http://example.com');
res.location('back');
```   

`back` 值有特殊的意义，会引用请求首部中的 `Referer` 指定的地址，如果没有这个首部，就设为 "/"。   

##### res.redirect([status,] path)  

默认 `status` 是302。这个设置应该也会设置 `Location` 首部。    

```javascript
res.redirect('/foo/bar');
res.redirect('http://example.com');
res.redirect(301, 'http://example.com');
res.redirect('../login');
```   

重定向到 `path` 指定的 URL 地址。可以是一个完整的 URL 地址直接定向到一个其他的站点，或者是一个相对地址，不过相对地址是相对于主机的根目录的。  

不过相对地址倒是也可以是相对与当前 URL，不过这时的相对地址应该不是一个 `/` 开头的绝对地址。    

同样 `back` 关键字会重定向到请求的 `referer` 首部的地址处，或者当这个首部不存在，就默认是 `/`，相当于重定向到站定根目录。    

##### res.render(view [locals] [,callback])  

+ locals: 为视图定义的局部变量对象
+ callback: 如果提供了的话，render方法可能会返回错误或者渲染的字符串，但不会自动响应。当出错的时候，方法内部会调用 `next(err)`。   

也就是说如果提供了 `callback` 参数，需要我们自己负责把渲染字符串发送给客户端。    

`view` 是渲染的文件的位置，可以是绝对路径，或者是相对于 `views` 设置的相对路径，如果不包含文件扩展名， `view engine` 或决定文件扩展。这时的话
Express 会使用 `require()` 加载指定的模板引擎模块，然后使用这个模块的
`__express` 函数渲染这个文件。    

`app.render(), res.render()` 中的第二个参数中，如果局部变量 `cache`
设为 `true` 的话，会在开发环境缓存视图。在生产环境下是默认开启的。注意这种缓存指的是对渲染文件的缓存，而不是说渲染后字符串的缓存。   

话说那模块里面使用的局部变量就包括 `app.locals`, `res.locals` 以及 `render()` 函数的局部变量，那么哪个优先级高呢？    

##### res.send([body])  

`body` 可以是 Buffer 对象，字符串，对象或者数组。  

```javascript
res.send(new Buffer('whoop'));
res.send({ some: 'json' });
res.send('<p>some html</p>');
res.status(404).send('Sorry, we cannot find that!');
res.status(500).send({ error: 'something blew up' });
```    

这个方法会对非流式响应执行多个任务：例如，会自动设置 `Content-Length` 首部值，并自动提供 `HEAD` 和 HTTP 缓存新鲜度支持。   

当参数是 `Buffer` 对象时，这个方法会将 `Content-Type` 设为 `application/octet-stream`。    

参数是字符串时，`Content-Type` 为 `text/html`。参数是对象或数组的话，
会用一个 JSON 格式响应。    


##### res.sendFile(path [options] [, fn])

基于文件扩展名设置 `Content-Type` 首部值。除非设置了 `root`，否则必须是绝对路径。  

| 属性 | 描述 | 默认值 |
| :------------- | :------------- | :------------- |
| maxAge | 设置 `Cache-Control` 首部的 max-age 属性 | 0 |
| root | 相对文件的根目录 | |
| lastModified | 设置 `Last-Modified` 首部为系统上次修改文件的日期，设为 `false` 禁用这个 | Enabled |
| headers | 包含 HTTP 首部的 对象 |  |
| dotfiles | 是否提供点文件。可选值有 "allow", "deny", "ignore" | "ignore" |
| acceptRanges | 是否启用范围请求 | true |
| cachaControl | 是否设置 `Cacha-Control` 首部 | true |

会在传输完成或出错时调用回调 `fn(err)`。如果出了错并且设置了回调，必须明确的处理接下来的响应流程，或者将控制权交给下个路由。   

##### res.sendStatus(statusCode)  

```javascript
res.sendStatus(200); // equivalent to res.status(200).send('OK')
res.sendStatus(403); // equivalent to res.status(403).send('Forbidden')
res.sendStatus(404); // equivalent to res.status(404).send('Not Found')
res.sendStatus(500); // equivalent to res.status(500).send('Internal Server Error')
```   

##### res.set(field [,value])

设置响应首部，可以传入一个对象一次性设置多个。这个是采用覆盖式的设置。   

别名函数 `res.header(field [,value])`。    

##### res.status(code)  

```javascript
res.status(403).end();
res.status(400).send('Bad Request');
res.status(404).sendFile('/absolute/path/to/404.png');
```   

##### res.type(type)  

设置 `Content-Type` 首部。  

```js
res.type('.html');              // => 'text/html'
res.type('html');               // => 'text/html'
res.type('json');               // => 'application/json'
res.type('application/json');   // => 'application/json'
res.type('png');                // => image/png:
```    

##### res.vary(field)

## Router

router 对象是一个独立的中间件与路由实例。可以把它看做是一个 mini 应用，仅能执行中间件及路由功能。     

### 方法

#### router.all(path, [callback, ...] callabck)

略。    

#### router.METHOD(path, [callback, ...] callback)

略。   

#### router.param(name, callback)

为路由参数添加回调触发器，应该是与 `app.param()` 类似的。不过不同于 `app.param()` 这个不支持数组参数。    

参数回调函数对定义其的路由器来说是局部的。他们不会从挂载的 app 或者 router 上继承。因此，定义在 `router` 上的参数回调值在定义在 `router` 路由上的路由参数才会触发。    

#### router.route(path)

略。    

#### router.use([path], [function, ...] function)
