# HTTP 状态码

| 状态码 | 原因短语 | 含义 |
| :------------- | :------------- | :------------- |
| 100      | Continue       | 说明收到了请求的初始部分，请客户端继续。 Expect |
| 101    |  Switching Protocols | 说明服务器正在根据客户端的指定，将协议切换成 Upgrade 或者 Update 首部所列的协议 |
| 200 | OK | 请求成功，实体的主体部分包含了所请求的资源。不过通常 PUT 和 DELETE 方法成功的结果不是200 OK而是204 No Content 或者 201 Created。  |
| 201 | Ceated | 用于创建服务器对象的请求（比如 PUT）。响应的主体部分应该包含了引用了已创建资源想URL。|
| 202 | Accepted | 请求已被接受，但服务器还未对其执行任何动作。不能保证服务器会完成这个请求。 |
| 203 | Non-Authoritative Information | 实体首部包含的信息不是来自源端服务器，而是来自资源的一份副本。 |
| 204 | No Content | 响应报文中包含如果首部和一个状态行，但没有主体部分。可以用来更新缓存的头部。 |
| 205 | Reset Content | 主要用于浏览器的代码，负责告知浏览器清除当前页面中的所有 HTML 表单元素，或重置 UI等。 |
| 206 | Partial Content | 成功执行了一个部分或 Range 请求。|
| 300 | Multiple Choice | 客户端请求一个实际指向多个资源的URL时会返回这个状态码，比如服务器上有某个资源的英语和法语版本。返回这个代码时会带有一个选项列表。  |
| 301 | Move Permanently(永久) | 在请求的 URL 已被移除时使用，响应的 Location 首部中应该包含资源现在所处的 URL。注意可能在重定向时将原来的请求方法改为GET，推荐使用 308 不改。|
| 302 | Found | 资源临时移动到别的地方，客户端应该使用 Location 首部给出的 URL 来临时定位资源，但是将来的请求仍应使用老的 URL。 |
| 303 | See Other | 告知客户端应该去另一个 URL 上获取资源。新的 URL 位于响应报文的 Location 首部。其目的主要是允许 POST 请求的响应定向到某个资源上去。通常会向重定向的 URL 发送 GET 请求。 302,303,307 功能类似，不过 302 是 HTTP1.0 的东西。这个是1.1的版本。反正意思就是1.0中的302,1.1中的303，重定向时都会将post改为get|
| 304 | Not Modified | 通常用于条件请求的缓存验证，表示资源为被修改，通常这个响应不该包含主体。|
| 307 | Temporary Redirect |  与302,303类似，都是资源临时移动，先用 Location 首部的地址去访问资源，以后还是老的URL。不同的是 307 重定向时会使用原先的请求方法及主体，而302,303会将原来的 POST 改为 GET请求。  
| 308 | Permanent Redirect | 与301类似，资源永久地移动到 Location 指定的 URL 上了。但不会修改请求方法。 |
| 400 | Bad Request | 客户端使用错误的语法发送了请求，服务器无法理解这个请求。|
| 401 | Unauthorized | 通常会与一个 WWW-Authenticate 首部一起返回要求验证。|
| 402 | Payment Required | 暂时未使用 |
| 403 | Forbidden | 服务器拒绝了请求。 |
| 404 | Not Found | 用于说明服务器无法找到请求的 URL。通常包含一个实体，以便展示给客户端看。|
| 405 | Method Not Allowed | 请求的方法被服务器禁用了。|
| 406 | Not Acceptable | 客户端请求指定参数指定的资源在服务器上没有匹配的资源。通常是内容协商的内容无法满足。|
| 407 | Proxy Authentication Required | 用于要求对资源进行认证的代理服务器。|
| 408 | Request Timeout | 如果客户端完成请求的时间太长，服务器返回这个状态码，并关闭连接。一般是由于为了性能而发出的预请求。|
| 409 | Conflcit | 用于说明请求可能在资源上引发一些冲突。|
| 410 | Gone | 与404类似，只是服务器曾经拥有过此资源。|
| 411 | Length Required | 服务器要求请求报文中包含 Content-Length 首部。|
| 412 | Precondition Failed | 客户端发起了条件请求，且其中一个条件失败了的时候使用。客户端包含了Expect首部时发起的就是条件请求。|
| 413 | Request Entity Too Large | 请求实体比服务器设置的限制大。服务器可能会关闭这个连接。|
| 414 | URL Too Long | URI 太长了呗。|
| 415 | Unsupported Media Type | 服务器不支持实体的类型呗。|
| 416 | Requested Range Not Satisfiable | 范围无法满足或者无效呗。|
| 417 | Expectation Failed |  Expect 的期望无法满足。|
| 429 | Too Many Requests | 客户端在一定时间内发送了太多请求。 |
| 431 | Request Header Fields Too Large | |
| 500 | Internal Server Error | 服务器遇到错误，无法满足请求。|
| 501 | Not Implemented | 服务器无法支持或处理请求的方法。|
| 502 | Bad Gateway |  作为代理或者网关使用的服务器遇到了来自响应链中上流的无效响应。|
| 503 | Service Unavailable | 服务器目前无法提供服务。但过一段时间就可以恢复服务。|
| 504 | Gateway Timeout | 与408类似，但是响应来自网关或代理。|
| 505 | HTTP Version Not Supported | |
