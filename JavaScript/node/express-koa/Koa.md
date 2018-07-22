# Koa

## Context

Koa Context 将node 的 `request` 和 `response` 对象封装到一个单独的对象中，这个对象提供了很多
编写 web 应用及 API 时需要的助手方法。    

每个请求都会创建一个 `Context`，这个对象会作为一个中间件的参数，被中间件引用：    

```js
app.use(async (ctx, next) => {
  ctx; // Context 对象
  ctx.request;  // koa Request 对象
  ctx.response; // koa Response 对象
})
```   

context 上的许多存取器属性和方法只是简单的委托给了 `ctx.request` 或者 `ctx.response` 对象上对应的属性和方法。     

### API

#### ctx.req

Node 的 `request` 对象。        

#### ctx.res

Node 的 `response` 对象。    

不支持绕过 Koa response 处理。（不懂）避免使用下面的 node 属性：   

+ `res.statusCode`
+ `res.writeHead()`
+ `res.write()`
+ `res.end()`    

#### ctx.request

Koa `Request` 对象。   

#### ctx.response

Koa `Response` 对象。    

#### ctx.state

推荐使用的一个命名空间，我们可以通过这个命名空间来在中间件及前端视图间传递一些信息。   

`ctx.state.user = await User.find(id)`    

#### ctx.app  

应用实例的引用。    

#### ctx.cookies.get(name, [options])

使用 `options` 获取cookie `name` 的值：   

+ `signed` 这个 cookie 应该被签名过。    

koa 会将 options 简单地传递给 [cookies](https://github.com/pillarjs/cookies) 模块。   

#### ctx.cookies.set(name, value, [options]) 

设置一个名为 `name` 值为 `value` 带有 `options` 选项的 cookie：    

+ `maxAge` 从 `Date.now()` 到过期的毫秒时间的数字表示。   
+ `signed` 为 cookie 值签名。
+ `expires` 设置 cookie 过期时间的 `Date` 对象。
+ `path` cookie 的路径，默认是 `/`。    
+ `domain` cookie 的域。
+ `secure`
+ `httpOnly` 默认为 `true`。
+ `overwrite` 布尔值表明是否会覆盖之前设置了的同名的 cookies，默认为 `false`。(@TODO)

koa 会将 options 简单地传递给 [cookies](https://github.com/pillarjs/cookies) 模块。   

#### ctx.throw([status], [msg], [properties])

抛出一个错误，并使用 `status` 去合适的做出响应。`status` 默认为 `500`。    

```js
ctx.throw(400);
ctx.throw(400, 'name required');
ctx.throw(400, 'name required', { user: user });
```    

例如 `ctx.throw(400, 'name required')` 等价于：   

```js
const err = new Error('name required');
err.status = 400;
err.expose = true;
throw err;
```   

注意这些通常用户级别的错误，如果使用了 `err.expose` 标记出来，则意味着这条信息是合适作为客户端响应的，
但是这些信息通常并非是真实的错误信息，因为我们通常不想要将真实的错误的细节泄露给用户。（这里的用户级别
是不是这样理解：并不是说程序运行出现了什么错误，只是我们希望对某些请求作为请求出错的响应）    

我们可以选择性的传入一个 `properties` 对象，这个对象会与 error 合并，可能用来装饰一下机器友好的错误，报告给
上流。   

koa 使用 [http-errors](https://github.com/jshttp/http-errors) 生成错误。    

#### ctx.assert(value, [status], [msg], [properties])  

同 `.throw()` 类似也是一个抛出错误的助手方法，不过 `assert()` 只在 `!value` 时才抛出错误（也就是说 `value` 为假值呗）。    

`ctx.assert(ctx.state.user, 401, 'User not found. Please login!')`    

koa 使用 [http-assert](https://github.com/jshttp/http-assert) 来创建断言。    

#### ctx.respond

如果想要让 Koa 内置的响应处理，可以明确的设置 `ctx.respond = false`。通常是在我们希望直接对原始的 `raw` 进行操作，
而不是让 Koa 替我们处理响应时使用。    

注意其实 Koa 是支持这样使用的（什么鬼，怎么是不支持）。这样设置可能会中断 koa 中间件及 koa 自身的功能。通过认为这样
设置是一种 hack，一般是为了方便那些使用传统 `fn(req, res)` 的开发者及中间件。    

#### Request aliases

下面的存取器属性与 Request 对象上的别名等价（上面提到了委托）：   

+ `ctx.header`
+ `ctx.headers`
+ `ctx.method`
+ `ctx.method=` （这些加等号的是什么意思，可以设置？但是请求的方法可以设置又好像说不通）@TODO
+ `ctx.url`
+ `ctx.url=`
+ `ctx.originalUrl`
+ `ctx.origin`
+ `ctx.href`
+ `ctx.path`
+ `ctx.path`
+ `ctx.path=`
+ `ctx.query`
+ `ctx.query=`
+ `ctx.querystring`
+ `ctx.querystring=`
+ `ctx.host`
+ `ctx.hostname`
+ `ctx.fresh`
+ `ctx.stale`
+ `ctx.socket`
+ `ctx.protocol`
+ `ctx.secure`
+ `ctx.ip`
+ `ctx.ips`
+ `ctx.subdomains`
+ `ctx.is()`
+ `ctx.accepts()`
+ `ctx.acceptsEncodings()`
+ `ctx.acceptCharsets()`
+ `ctx.acceptLanguages()`
+ `ctx.get()`    

#### Response aliases

下面的存取器属性与 Response 对象上的别名等价：    

+ `ctx.body`
+ `ctx.body=`
+ `ctx.status`
+ `ctx.status=`
+ `ctx.message`
+ `ctx.message=`
+ `ctx.length`
+ `ctx.length=`
+ `ctx.type`
+ `ctx.type=`
+ `ctx.headerSent`
+ `ctx.redirect()`
+ `ctx.attachment()`
+ `ctx.set()`
+ `ctx.append()`
+ `ctx.remove()`
+ `ctx.lastModified=`
+ `ctx.etag=`    

## Request

`Request` 对象是对 node 请求对象之上的一种抽象，提供了一些在 HTTP 服务器开发常用的一些额外的功能。     

### API

#### request.header

请求首部对象。    

#### request.headers

请求首部对象。`request.header` 的别名。   

#### request.method

请求的方法。   

#### request.methid=

设置请求的方法，对于实现中间件比较有用。   

#### request.length

返回请求的 Content-Length 值吧，数字，如果没有这个首部就是 `undefined`。   

#### request.url

获取请求的 URL。   

#### request.url=

设置请求的 URL，主要用于 url 重写吧。   

#### request.originalUrl

或者请求原始的 URL。（@TODO 需要验证这些 URL 到底是请求起始行中的 url，还是完整的url）   

#### request.origin

获取 URL 的源部分，包含 `protocol` 和 `host`。   

#### request.href

获取完整的请求URL，包括 `protocol`, `host` 和 `url`。    

#### request.path

获取请求的 pathname。    

#### request.path=

设置请求的 pathname，并且当有查询字符串的时候也保留下来。    

#### request.querystring  

获取原始的查询字符串。不包括 `?`。      

#### request.querystring=

设置原始的查询字符串。    

#### request.search

同样是获取原始的查询字符串，不过包含了 `?`。   

#### request.search= 

设置原始的查询字符串。    

#### request.host

应该是根据对应首部获取主机部分。如果 `app.proxy` 设置为 `true` 的话支持 `X-Forwarded-Host`，否则就是 `Host` 首部。     

#### request.hostname

同上，无非是只有主机名部分。    

#### request.type

获取请求 `Content-Type` 首部值，不过例如 `charset` 这样的参数会设置为空（也就是不包括这些值呗）    

```js
const ct = ctx.request.type
// => "image/png"
```  

#### request.charset

当请求中有字符编码的话，就返回这个编码，否则就是 `undefined`。    


#### request.query

获取解析过的查询字符串吧，如果没有查询字符串返回空对象。注意这个属性不支持嵌套解析。    

#### request.query=

使用给定的对象设置查询字符串。这个设置也不支持嵌套的对象。   

#### request.fresh

检查请求缓存是否是 "fresh"，即内容没有变化。这个方法是为了 `IFM /ETag` 及 `IMS/Last-Modified` 之间的缓存协商。    

```js
// freshness check requires status 20x or 304
ctx.status = 200;
ctx.set('ETag', '123');

// cache is ok
if (ctx.fresh) {
  ctx.status = 304;
  return;
}

// cache is stale
// fetch new data
ctx.body = yield db.find('something');
```    

#### request.stale

`request.stale` 的反向操作。    

#### request.protocol

返回请求的协议，`https` 或者 `http`。当 `app.proxy` 为 `true` 的时候支持 `X-Forwarded-Proto`。    

#### request.secure

`ctx.protocol === "https"` 的缩写，检查请求是否是使用了 TLS。    

#### request.ip

请求的远程地址。当 `app.proxy == true` 的时候支持 `X-Forwarded-For`。    

#### request.ips

当有 `X-Forwarded-For` 首部，并且启用了 `app.proxy`，则返回这些 ip 的数组。
顺序是从上游 -> 下游。如果 `app.proxy` 为 false 的话就返回空数组。    

#### request.subdomains

返回子域组成的数组。    

子域是 host 中使用点分隔，在主域之前的部分。默认情况下，一个应用的域假设为 host 最后的两部分。
不过可以使用 `app.subdomainOffset` 来更改这种默认的行为。   

例如，如果域名是 `tobi.ferrets.example.com`。如果没有设置 `app.subdomainOffset`，`ctx.subdomains` 是
`["ferrets", "tobi"]`。如果 `app.subdomainOffset` 设置3，则 `ctx.subdomains` 为 `["tobi"]`。    

#### request.is(types...)   

检查请求是否包含 `Content-Type` 首部字段，以及其是否包含任意给定的 mime `type`。如果没有请求主体的话，返回 `null`。
如果没有 `Content-Type` 首部，或者匹配失败了，返回 `false`。否则匹配成功的话，返回匹配的 content-type。   

```js
// With Content-Type: text/html; charset=utf-8
ctx.is('html'); // => 'html'
ctx.is('text/html'); // => 'text/html'
ctx.is('text/*', 'text/html'); // => 'text/html'

// When Content-Type is application/json
ctx.is('json', 'urlencoded'); // => 'json'
ctx.is('application/json'); // => 'application/json'
ctx.is('html', 'application/*'); // => 'application/json'

ctx.is('html'); // => false
```    

### 内容协商

请求对象包括了由 [accepts](https://github.com/jshttp/accepts) 和 [negotiator](https://github.com/jshttp/negotiator) 提供的有用的内容协商工具。这些工具是：   

+ `request.accepts(types)`
+ `request.acceptsEncoding(types)`
+ `request.acceptsCharsets(charsets)`
+ `request.acceptsLanguages(langs)`   

如果没有提供 types，则所有接受的类型都会返回。    

如果提供了多个类型，会返回最佳匹配。如果没有找到匹配项，返回 `false`，这时我们应该发送一个 `406 "Not Acceptable"`
响应给客户端。    

在缺少任意类型的 accept 首部的情况下，会返回第一种类型。因此，我们提供的类型顺序是非常重要的。   

#### request.accepts(types)

检查是否给定的 `type(s)` 是可接受的，当为true的时候返回最佳匹配，否则就返回 `false`。`type` 的值可以是一个或多个
mime 类型字符串，例如 `"application/json"`，也可以是扩展名例如 `"json"`，或者是一个数组 `["json", "html", "text/plain"]`。    

```js
// Accept: text/html
ctx.accepts('html');
// => "html"

// Accept: text/*, application/json
ctx.accepts('html');
// => "html"
ctx.accepts('text/html');
// => "text/html"
ctx.accepts('json', 'text');
// => "json"
ctx.accepts('application/json');
// => "application/json"

// Accept: text/*, application/json
ctx.accepts('image/png');
ctx.accepts('png');
// => false

// Accept: text/*;q=.5, application/json
ctx.accepts(['html', 'json']);
ctx.accepts('html', 'json');
// => "json"

// No Accept header
ctx.accepts('html', 'json');
// => "html"
ctx.accepts('json', 'html');
// => "json"
```    

#### request.acceptEncodings(encodings)

检查是否 `encodings` 是可接受的，当为真的时候返回最佳匹配，否则就返回 `false`。     

```js
// Accept-Encoding: gzip
ctx.acceptsEncodings('gzip', 'deflate', 'identity');
// => "gzip"

ctx.acceptsEncodings(['gzip', 'deflate', 'identity']);
// => "gzip"
```   

当没有指定参数时，所有可接受的编码方式都会放在一个数组中返回。    

```js
// Accept-Encoding: gzip, deflate
ctx.acceptsEncodings();
// => ["gzip", "deflate", "identity"]
```   

#### request.acceptsCharsets(charsets)  

与上面的类似，就不细说了：    

```js
// Accept-Charset: utf-8, iso-8859-1;q=0.2, utf-7;q=0.5
ctx.acceptsCharsets('utf-8', 'utf-7');
// => "utf-8"

ctx.acceptsCharsets(['utf-7', 'utf-8']);
// => "utf-8"
```   

当没有指定参数时，会将所有可接受的字符编码放在数组中返回：    

```js
// Accept-Charset: utf-8, iso-8859-1;q=0.2, utf-7;q=0.5
ctx.acceptsCharsets();
// => ["utf-8", "utf-7", "iso-8859-1"]
```   

#### request.acceptsLanguage(langs)

同上：   

```js
// Accept-Language: en;q=0.8, es, pt
ctx.acceptsLanguages('es', 'en');
// => "es"

ctx.acceptsLanguages(['en', 'es']);
// => "es"
```   

当没有指定参数时，会将所有可接受的语言放在数组中返回。     

#### request.idempotent

检查请求是否是幂等的。     

#### request.socket

返回请求的 socket。    

#### request.get(field)   

返回请求首部。    

## Response

`Response` 是对 Node 响应对象之上的一层抽象，提供了编写 HTTP 服务器应用常用的一些功能函数。   

### API

#### response.header

响应首部对象。   

#### response.headers

`response.header` 的别名。   

#### response.socket

**请求** socket。   

#### response.status

获取响应状态码。默认是 `404`。   

#### response.status=

设置响应状态码。   

#### response.message

获取响应状态短语。默认是与 `response.status` 对应的原因短语。    

#### response.message=

设置原因短语。   

#### response.length=

设置响应的 `Content-Length` 首部。   

#### response.length

获取 `Content-Length` 首部值，如果没有的话尽可能从 `ctx.body` 推断，不行的话就返回 `undefined`。   

#### response.body

获取响应主体。   

#### response.body=

设置响应主体为下面之一：   

+ `string`
+ `Buffer`
+ `Stream`
+ json 字符串话的对象和数组
+ `null`，没有响应主体。   

如果没有设置 `response.status` 的话，Koa 自动将状态码设置为 200 或者 204。    

**String**    

`Content-Type` 默认设置为 `text/html` 或者 `text/plain`，字符编码默认为 utf-8。同时也会设置 `Content-Length`。    
**Buffer**   

`Content-Type` 默认为 `application/octet-stream`，同时设置 `Content-Length`。    

**Stream**    

`Content-Type` 默认是 `application/octet-stream`。    

无论何时将响应主体设置为了流，`.onerror` 属性都会自动添加为 `error` 事件的监听函数来捕获错误。
另外，无论何时请求关闭了（应该指的是那个 HTTP 连接关闭吧），流都会被摧毁。    

**Object**    

`Content-Type` 默认为 `application/json`。这个包括普通对象及数组。   

#### response.get(field)

或者想要首部值，大小写不敏感。   

#### response.set(field, value)

设置首部值。    

#### response.append(field, value)

追加额外的首部。   

#### response.set(fields)

传入一个对象设置多个首部。   

#### response.remove(field)

删除首部。    

#### response.type

获取 `Content-Type` 首部值，省略字符编码部分。    

#### response.type=

设置响应首部 `Content-Type` 值为一个 mime 字符串或者文件扩展名：    

```js
ctx.type = 'text/plain; charset=utf-8';
ctx.type = 'image/png';
ctx.type = '.png';
ctx.type = 'png';
```    

_Note:_  貌似是当我们使用扩展名的时候，可能会自动替我们添加合适的 `charset`，例如
`response.type = "html"` 会使用 utf-8。不过要是我们定义完整的 mime 类型的话，就不会自动添加了。    

#### response.is(types...) 

与 `ctx.request.is()` 类似。检查响应类型是否是提供的几种类型中的一种。通常主要是
用来创建操控响应的中间件。     

#### response.redirect(url, [alt])

执行 302 重定向到 `url`。    

字符串 `"back"` 是一个特殊的例子，提供了 Referrer 支持（估计是指这个首部），如果
没有这个首部，就使用 `alt` 或者 `/`。    

```js
ctx.redirect('back');
ctx.redirect('back', '/index.html');
ctx.redirect('/login');
ctx.redirect('http://google.com');
```   

#### response.attachment([filename])

设置 `Content-Disposition` 为 `attachment`，通知客户端下载。可选的提供一个下载
`filename`。     

#### response.headerSent

检查是否首部已经发送了。    

#### response.lastModified

如果有 `Last-Modified` 首部的话，返回 `Last-Modeified` 首部值，是一个 `Date` 对象。     

#### response.lastModified=   

设置首部为一个合适id UTC 字符串。可以设置一个 `Date` 对象或者是一个日期字符串。    

#### response.etag=

设置响应的 `ETag`。     

```js
ctx.response.etag = crypto.createHash('md5').update(ctx.body).digest('hex');
```    

#### response.vary(field)

Vary on field.    

#### response.flushHeaders()

刷新设置的首部。    






