# 一些比较新的HTTP 首部

## Referrer-Policy

首先下面的内容只讲了策略的一部分内容，很多细节没有讲到，例如在 a，meta 等标签中的策略，已经具体页面所处的环境等等。  

响应首部。这个首部用来控制客户端发送给服务器的请求的 Referer(注意是个其实是拼写错误，但是
HTTP将这个错误保持了下来，不过 Referrer-Policy 首部没有继续使用错误的写法) 首部中应该包含哪些 referrer 信息。  

当从一个文档中发出请求时，应该就是页面中操作是触发HTTP请求，需要导航到别的文档时，通常会附带一个 Referer 首部。   

我觉得这个首部应该是防止客户端在点击这份响应中的引用外部网站的链接时，在请求外部网站时的请求中
应该怎样控制 `Referer` 首部中的信息。    

语法：   

```
Referrer-Policy: no-referrer
Referrer-Policy: no-referrer-when-downgrade
Referrer-Policy: origin
Referrer-Policy: origin-when-cross-origin
Referrer-Policy: same-origin
Referrer-Policy: strict-origin
Referrer-Policy: strict-origin-when-cross-origin
Referrer-Policy: unsafe-url
```  

指令的含义：  

注意下面所有提到的 referrer 包含的 url 地址都可能会经过再处理，例如 ASCII 序列化，删除参数部分等。  

**no-referrer**  

Referer 首部应该整体被省略。请求时不要发送 referrer 的信息。  

**no-referrer-when-downgrade**(default)   

如果没有用这个首部指定策略，这就是用户代理默认的行为。貌似意思是，当页面本身就使用 tls 协议时，
如果我们导航到一个受信任的URL时（个人理解受信任就是指也是 tls ）就将完整的 URL 作为 referrer 发送，
如果是不信任的URL，就不发送任何的 referrer 信息。但是，如果页面本身没有使用 tls，导航到任意
URL 都会发送完整URL。   

**origin**   

在任何情况下文档的源作为 referrer。例如文档 https://example.com/page.html 会将 https://example.com/ 作为
referrer 发送出去。   

**origin-when-cross-origin**   

在执行同源的请求时就发送完整的 URL，但是在其他情况下都发送文档源。       

**same-origin**   

同源请求发送完整的URL作为 referrer, 跨域请求就不发送 referrer 信息。      

**strict-origin**   

当页面本身就使用 tls 协议时，如果我们导航到一个受信任的URL时（个人理解受信任就是指也是 tls ）会将 origin
作为 referrer 发送，如果是不信任的URL，就不发送任何的 referrer 信息。但是，如果页面本身没有使用 tls，导航到任意
URL 都会发送 origin 作为 referrer。   


**strict-origin-when-cross-origin**   

这个比较复杂。首先，当从 tls 到受信的 URL 时，以及从非 tls 到任意 url 时，
如果同源请求会发送完整的 URL，如果是跨域请求就是 origin。如果是从 tls 到非受信URL 不会发送
任何 referrer 信息。  

**unsafe-url**  

当同源或者跨域请求时发送完整的URL(但是会去掉参数部分)


## X-Frame-Options

响应首部。可以用来表明是否浏览器可以运行将文档渲染到 `<frame>, <iframe>, <object>` 中。
一般用来防止点击劫持攻击，来确保文档没有被内嵌到其他站点中。   

语法：   

```
X-Frame-Options: DENY
X-Frame-Options: SAMEORIGIN
X-Frame-Options: ALLOW-FROM https://example.com/
```   

注意如果指定了是 DENY，不仅其他站点不能内嵌，同源的站点也不能内嵌。   

**DENY**: 页面不能内嵌在 frame 中，不管站点是否同源。  

**SAMEORIGIN**: 同源的站点可以将其内嵌到 frame 中。  

**ALLOW-FROM uri**: 只能在指定的源中的页面中内嵌到 frame 中。  
