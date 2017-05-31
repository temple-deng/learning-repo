# HTTP cookies

## 新建 Cookies

Set-Cookie 响应首部会用来设置发送给客户端的 cookies:  

`Set-Cookie: <cookie-name>=<cookie-value>`  

一个例子：  

```
HTTP/1.0 200 OK
Content-type: text/html
Set-Cookie: yummy_cookie=choco
Set-Cookie: tasty_cookie=strawberry

[page content]
```  

之后客户端发送给服务器的每个请求都会附带一个 Cookie 首部：  

```
GET /sample_page.html HTTP/1.1
Host: www.example.org
Cookie: yummy_cookie=choco; tasty_cookie=strawberry
```    

### Session cookies

上面的例子创建了一个 session cookie: 这个cookie会才客户端关闭时被删除，仅仅在当次会话过程中可用。它们没有指定任何的 `Expires` or `Max-Age` 指令。不过需要注意的是当前的浏览器都会会话恢复的功能，所有如果浏览器不关闭的话，这些session cookie 其实可以看做是持久的。  

### Permanent cookies

permanent cookies 会在一个指定的日期(Expires) 或者在经过一段时间后(Max-Age)过期。  

`Set-Cookie: id=a3fWa; Expires=Wed, 21 Oct 2015 07:28:00 GMT;`  

### Secure and HttpOnly cookies

一个安全的 cookie 只会在使用了 SSL 的 HTTPS 请求时发送给服务器。  

为了防止 XSS 攻击， HttpOnly cookis 不能被 javascript 通过 `document.cookie` 来操作。这种类型的 cookies 只有在常规的请求，XHR中才会发送给服务器。  


`Set-Cookie: id=a3fWa; Expires=Wed, 21 Oct 2015 07:28:00 GMT; Secure; HttpOnly`  

### Scope of cookies  

默认情况下 Domain 是当前的文档的主机部分，但不包括子域。如果指定了 domain，则总会包含子域。  

例如如果设置了 Domain = mozilla.org, 则访问子域 developer.mozilla.org 也会发送 cookies。  
