# CORS

CORS 是用来为下面的内容启用跨域 HTTP 请求的：    

+ 为 XMLHTTPRequest 和 Fetch API 添加跨域的能力
+ Web Fonts
+ WebGL textures
+ 使用 `drawImage` 在 canvas 上绘制图片及视频帧
+ 样式表（为 CSSOM 访问）
+ 脚本（for unmuted exceptions）    

## 简介

CORS 是通过添加新的 HTTP 首部来工作的，这些首部允许服务器描述可以用浏览器访问这份资源的
origins 的集合。此外，对于那些可能对服务器数据造成副作用的 HTTP 请求方法（特别是那些非 GET
方法，以及使用特定的 MIME 类型的 POST 请求），CORS 规范规定浏览器为请求“预检”("preflight")，
使用 HTTP OPTIONS 请求方法向服务器询问支持的方法，然后根据服务器的“批准”，使用实际上的请求方法
发送请求。服务器还可以通知浏览器请求是否应该添加“证书”（包括 cookie 和 HTTP 认证数据）等内容。    

## 一个访问控制的例子

下面我们举了3个例子来描述 CORS 是怎样工作的。   

### 简单请求

一些请求不会触发 CORS 预检。这些请求被叫做“简单请求”。满足下面所有条件的请求就可以叫做“简单请求”：

+ 唯一允许的方法是：   
  - GET
  - POST
  - HEAD
+ 除了用户代理自动设置的首部，允许手动设置的首部如下：    
  - Accept
  - Accept-Language
  - Content-Language
  - Content-Type(但要注意下面提到的额外的要求)
  - DPR
  - Downlink
  - Save-Data
  - Viewport-Width
  - Width   
+ 允许的 Content-Type 首部值为：
  - appalication/x-www-form-urlencoded
  - multipart/form-data
  - text/plain   


例如，在域 <samp>http://foo.example.com</samp> 中的 web内容希望调用域 <samp>http://bar.other.com</samp> 中的内容，假设现在在 foo.example 上部署下的 JavaScript 代码：   

```JavaScript
var invocation = new XMLHttpRequest();
var url = 'http://bar.other/resources/public-data/';

function callOtherDomain() {
  if(invocation) {    
    invocation.open('GET', url, true);
    invocation.onreadystatechange = handler;
    invocation.send();
  }
}
```    

这将导致客户端和服务器之间的简单交换，使用 CORS 首部来处理这些权限：   

![](https://mdn.mozillademos.org/files/14293/simple_req.png)   

下面是浏览器发送给服务器的内容，及服务器的响应：   

```
GET /resources/public-data/ HTTP/1.1
Host: bar.other
User-Agent: Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.5; en-US; rv:1.9.1b3pre) Gecko/20081130 Minefield/3.1b3pre
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-us,en;q=0.5
Accept-Encoding: gzip,deflate
Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.7
Connection: keep-alive
Referer: http://foo.example/examples/access-control/simpleXSInvocation.html
Origin: http://foo.example


HTTP/1.1 200 OK
Date: Mon, 01 Dec 2008 00:23:53 GMT
Server: Apache/2.0.61
Access-Control-Allow-Origin: *
Keep-Alive: timeout=2, max=100
Connection: Keep-Alive
Transfer-Encoding: chunked
Content-Type: application/xml

[XML Data]
```     

### 预检的请求

不同于“简单请求”，需要预检的请求首先会通过 OPTIONS 方法对其他域的资源发送一个 HTTP 请求，这是
为了确定是否真实的请求是安全可发送的。之所以这样是因为跨域需要预检的请求可能对用户数据有影响。    


一个请求如果满足下面任意的条件就认为是需要预检的：    

+ 如果请求使用下面的方法：   
  - PUT
  - DELETE
  - CONNECT
  - OPTIONS
  - TRACE
  - PATCH
+ 或者，除了用户代理自动设置的首部之外，请求包含除下面的首部之外的首部：   
  - Accept
  - Accept-Language
  - Content-Language
  - Content-Type(但要注意下面提到的额外的要求)
  - DPR
  - Downlink
  - Save-Data
  - Viewport-Width
  - Width  
+ 或者，Content-Type 的值是下面值之外的值：   
  - application/x-www-form-urlencoded
  - multipart/form-data
  - text/plain   

例如下面的例子中的请求就需要预检：    

```JavaScript
var invocation = new XMLHttpRequest();
var url = 'http://bar.other/resources/post-here/';
var body = '<?xml version="1.0"?><person><name>Arun</name></person>';

function callOtherDomain(){
  if(invocation)
    {
      invocation.open('POST', url, true);
      invocation.setRequestHeader('X-PINGOTHER', 'pingpong');
      invocation.setRequestHeader('Content-Type', 'application/xml');
      invocation.onreadystatechange = handler;
      invocation.send(body);
    }
}

......
```    

![](https://mdn.mozillademos.org/files/14289/prelight.png)    

下面是服务器与客户端完整的数据交换，首先是预检请求及响应：    

```
OPTIONS /resources/post-here/ HTTP/1.1
Host: bar.other
User-Agent: Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.5; en-US; rv:1.9.1b3pre) Gecko/20081130 Minefield/3.1b3pre
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-us,en;q=0.5
Accept-Encoding: gzip,deflate
Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.7
Connection: keep-alive
Origin: http://foo.example
Access-Control-Request-Method: POST
Access-Control-Request-Headers: X-PINGOTHER, Content-Type


HTTP/1.1 200 OK
Date: Mon, 01 Dec 2008 01:15:39 GMT
Server: Apache/2.0.61 (Unix)
Access-Control-Allow-Origin: http://foo.example
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: X-PINGOTHER, Content-Type
Access-Control-Max-Age: 86400
Vary: Accept-Encoding, Origin
Content-Encoding: gzip
Content-Length: 0
Keep-Alive: timeout=2, max=100
Connection: Keep-Alive
Content-Type: text/plain
```   

一旦预检请求完成，就发送真实的请求：   

```
POST /resources/post-here/ HTTP/1.1
Host: bar.other
User-Agent: Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.5; en-US; rv:1.9.1b3pre) Gecko/20081130 Minefield/3.1b3pre
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-us,en;q=0.5
Accept-Encoding: gzip,deflate
Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.7
Connection: keep-alive
X-PINGOTHER: pingpong
Content-Type: text/xml; charset=UTF-8
Referer: http://foo.example/examples/preflightInvocation.html
Content-Length: 55
Origin: http://foo.example
Pragma: no-cache
Cache-Control: no-cache

<?xml version="1.0"?><person><name>Arun</name></person>


HTTP/1.1 200 OK
Date: Mon, 01 Dec 2008 01:15:40 GMT
Server: Apache/2.0.61 (Unix)
Access-Control-Allow-Origin: http://foo.example
Vary: Accept-Encoding, Origin
Content-Encoding: gzip
Content-Length: 235
Keep-Alive: timeout=2, max=99
Connection: Keep-Alive
Content-Type: text/plain

[Some GZIP'd payload]
```    

### 带有证书的请求

默认情况下，跨域的 XMLHttpRequest 和 Fetch，浏览器是不会发送证书内容的。如果想要附带证书内容的
话必须要声明。   

在下面的例子中，<samp>http://foo.example</samp> 上的内容对 <samp>http://bar.other</samp> 上的
资源发送一个简单的 GET 请求，这个网站会设置 Cookies。   

```JavaScript
var invocation = new XMLHttpRequest();
var url = 'http://bar.other/resources/credentialed-content/';

function callOtherDomain(){
  if(invocation) {
    invocation.open('GET', url, true);
    invocation.withCredentials = true;
    invocation.onreadystatechange = handler;
    invocation.send();
  }
}
```    

```
GET /resources/access-control-with-credentials/ HTTP/1.1
Host: bar.other
User-Agent: Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.5; en-US; rv:1.9.1b3pre) Gecko/20081130 Minefield/3.1b3pre
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-us,en;q=0.5
Accept-Encoding: gzip,deflate
Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.7
Connection: keep-alive
Referer: http://foo.example/examples/credential.html
Origin: http://foo.example
Cookie: pageAccess=2


HTTP/1.1 200 OK
Date: Mon, 01 Dec 2008 01:34:52 GMT
Server: Apache/2.0.61 (Unix) PHP/4.4.7 mod_ssl/2.0.61 OpenSSL/0.9.7e mod_fastcgi/2.4.2 DAV/2 SVN/1.4.2
X-Powered-By: PHP/5.2.6
Access-Control-Allow-Origin: http://foo.example
Access-Control-Allow-Credentials: true
Cache-Control: no-cache
Pragma: no-cache
Set-Cookie: pageAccess=3; expires=Wed, 31-Dec-2008 01:34:53 GMT
Vary: Accept-Encoding, Origin
Content-Encoding: gzip
Content-Length: 106
Keep-Alive: timeout=2, max=100
Connection: Keep-Alive
Content-Type: text/plain


[text/plain payload]
```   

在响应带有证书的请求时，服务器必须在 `Access-Control-Allow-Origin` 中指定一个源，而不是使用
通配符 "\*"。    

## HTTP 响应首部

### Access-Control-Allow-Origin  

`Access-Control-Allow-Origin: <origin> | *`    

origin 参数指定可以访问这份资源的 URI。     

### Access-Control-Expose-Headers

这个首部可以让服务器提供一个浏览器可以访问的首部的白名单。注意这个是 `Expose-Headers`，
与下面的 `Allow-Headers`，这个应该是告诉浏览器哪些首部可以暴露给浏览器。        

`Access-Control-Expose-Headers: X-My-Custom-Header, X-Another-Custom-Header`   

### Access-Control-Max-Age

这个首部指定预检请求的结果可以缓存多长时间，以秒为单位。    

`Access-Control-Max-Age: <delta-seconds>`    

### Access-Control-Allow-Credentials   

`Access-Control-Allow-Credentials: true`    

### Access-Control-Allow-Methods

这个是用来响应预检请求的。    

`Access-Control-Allow-Methods: <method>[, <method>]*`    

### Access-Control-Allow-Headers

这个也是用来响应预检请求的。     

`Access-Control-Allow-Headers: <field-name>[, <field-name>]*`    
