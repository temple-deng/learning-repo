# Request and Response  

## Request

### 属性

##### req.app

正在使用这个中间件的Express 应用实例的引用。   

##### req.baseUrl  

路由器实例挂载的 URL 路径。如果没有挂载的话，好像就是当前使用中间件的路由路径。  

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

返回 true 表明客户端缓存的资源还是新鲜的，可以直接使用呗。     

当 `cache-control` 请求首部不包含一个 `no-cache` 指令（如果请求首部有这个首部及指令，表明客户端希望重新加载这个请求，应该
就是类似不管缓存可不可用都重新加载资源），并且下面任一情况为 `true` 时，这个属性返回 `true`：   

+ 如果指定了 `if-modified-since` 请求首部，并且 `last-modified` 请求首部等于或早于 `modified` 响应首部。这里说的不清楚，应该是资源的最后
修改日期 `last-modified` 早于IMS指定的 `modified` 的日期。说明资源还没有过期可用。
+ 如果 `if-none-match` 请求首部为 `*`，任意都能匹配了，说明资源还没有过期。
+ 如果解析 `if-none-match` 首部后不匹配 `etag` 响应首部。（感觉这里文档有问题，都不匹配肯定是过期了，怎么可能返回
true,应该是可以找到一个匹配才能返回 true。）


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

在中间件函数中，`req.originalUrl` 是 `req.baseUrl` 和 `req.path` 的组合。（不对呀，看上面的例子还有查询参数的部分呀。   

```javascript
app.use('/admin', function(req, res, next) {  // GET 'http://www.example.com/admin/new'
  console.log(req.originalUrl); // '/admin/new'
  console.log(req.baseUrl); // '/admin'
  console.log(req.path); // '/new'
  next();
});
```    

##### req.params   

举个栗子，如果当前路由路径时 `/user/:name`:  

```javascript
// GET /user/tj
req.params.name
// => "tj"
```    

如果定义路由时使用的是正则，会提供一些捕获的数组，使用 `req.param[n]` 访问这些数组，`n`就是第n个捕获数组。这个规则只在使用类似 `/file/*` 等未命名的通配符时有用：  

```javascript
// GET /file/javascripts/jquery.js
req.params[0]
// => "javascripts/jquery.js"
```    

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

当前匹配的路由字符串：   

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

##### req.accepts(types)

基于请求的 `Accept` 首部来选择一个最优的资源格式。   

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
// => undefined

// Accept: text/*;q=.5, application/json
req.accepts(['html', 'json']);
// => "json"
```    

感觉就是拿参数和首部值进行正则匹配啊。   


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

`Range` 首部解析。   

`size` 是资源最大的尺寸。这里应该是将请求主体分为多个部分，每个部分最大的尺寸。      

`options` 选项当前只有 `combine` 属性，是布尔值。	Specify if overlapping & adjacent ranges should be combined, defaults to false. When true, ranges will be combined and returned as if they were specified that way in the header.   

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

注意在 `res.append()` 之后调用 `res.set()` 会重置之前设置的响应首部值。   

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

##### res.clearCookie(name [, options])

为什么会有第二个参数，具体时怎么清除的。   

##### res.download(path [, filename] [, fn])  

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

结束响应进程。   

##### res.format(object)  

根据 `Accept` 请求首部执行内容协商。其会使用 `req.accepts()` 挑选一个处理函数。如果没有指定这个首部，就调用第一个回调，如果都不匹配，就响应 406, 或者调用 `default` 回调。  

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

##### res.get(field)

不明白这个有什么意义。  

##### res.json([body])  

使用 `JSON.stringify()` 将参数转换为 JSON 字符串。   

##### res.jsonp([body])   

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

##### res.render(view [locals] [,callback])  

+ locals: 为视图定义的局部变量对象
+ callback: 如果提供了的话，render方法可能会返回错误或者渲染的字符串，但不会自动响应。当出错的时候，方法内部会调用 `next(err)`。  

`view` 是渲染的文件的位置，可以是绝对路径，或者是相对于 `views` 设置的相对路径，如果不包含文件扩展名， `view engine` 或决定文件扩展。

##### res.send([body])  

`body` 可以是 Buffer 对象，字符串，对象或者数组。  

```javascript
res.send(new Buffer('whoop'));
res.send({ some: 'json' });
res.send('<p>some html</p>');
res.status(404).send('Sorry, we cannot find that!');
res.status(500).send({ error: 'something blew up' });
```   

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

##### res.status(code)  

```javascript
res.status(403).end();
res.status(400).send('Bad Request');
res.status(404).sendFile('/absolute/path/to/404.png');
```   

##### res.type(type)  

设置 `Content-Type` 首部。  

##### res.vary(field)

## Router

router 对象是一个独立的中间件与路由实例。   

看这个意思，路由实例是已经指定了路由路径的对象，只能后续添加对方法的路由
