# HTTP Caching

## 1. 缓存概览

每个缓存条目包含一个缓存键 key，以及先前请求中使用相同键的对应的一个或多个 HTTP 响应。缓存
条目最常见的形式就是使用 GET 请求，并返回一个 200 的成功响应。但是，一些永久的重定向，一些
消极的结果，例如 404，不完整的结果，例如 206，以及一些可以缓存的非 GET 方法的响应也是可以进行
缓存的。     

主要的缓存键包括请求的方法以及目标的 URI。然而，由于目前大多数的缓存都是限制于对 GET 请求的响应
的缓存，因此许多缓存实现都只是简单地拒绝掉其他方法的缓存，并只使用 URI 作为缓存主键。    

如果一个请求的目标是内容协商的结果，那么缓存条目可能包含多个存储的响应，每个使用一个二级键区分
开来，这个二级键对应着原始请求中使用的协商首部。    

## 2. 在缓存中存储响应

一个缓存在除了以下的各种情况下，不能存储任意请求的响应：   

+ 缓存能够识别请求的方法，并且缓存任务该请求方法是可以缓存的，并且
+ 缓存能够识别响应状态码，并且
+ 'no-store' 缓存指令在请求首部和响应首部中都没有出现，并且
+ 如果缓存是共享的，响应中没有出现 'private' 首部指令，并且
+ 如果缓存是共享的，请求中没有 Authorization 首部，除非响应明确要求允许使用这个首部，并且
+ 响应可能：
  - 包含一个 Expires 首部，或者
  - 包含一个 max-age 响应指令，或者
  - 共享缓存包含一个 s-maxage 响应指令，或者
  - 包含一个 Cache Control 扩展，或者
  - 包含一个默认情况下可缓存的状态码，或者
  - 包含一个 public 响应指令     

注意的一点是，上面列出的所有要求，都可能被一个 cache-control 扩展覆盖。   

### 2.1 存储不完整的响应

一个被看做是完整的响应报文是指，报文帧中指出的所有八进制流都以及在连接中被接收到。如果请求方法
是 GET，响应状态码是 200，并且整个响应首部都已经被接收，那么一个缓存可以缓存部分的报文主体，并
将缓存条目记录为不完整的。同理，206 响应在存在一个不完整的 200 缓存条目情况下可以被存储。   

说实话，没看懂。    

缓存可能会通过发后续的 range 请求来完成对一个不完整响应的完整存储，并将各部分组合成一个完整
的存储条目。    

### 2.2 存储授权请求的响应

一个共享的缓存，不能使用一个对带有 Authorization 请求的缓存响应去满足后续的请求，除非响应
中存在一个缓存指令允许这样的响应被存储。    

在规范中，下面的 Cache-Control 响应指令有这样的效果：must-revalidate, public, s-maxage。    

## 3. 从缓存中构建响应

当出现一个请求时，缓存在除了下面的情况下，不能使用存储的响应：    

+ 请求的 URI 与存储的响应匹配，并且
+ 缓存的响应相关联的请求方法运行当前请求的使用缓存，并且
+ 存储的响应选出的一些首部字段与请求的相匹配，并且
+ 请求不包含 no-cache pragma，也不包含 no-cache 缓存指令，除非存储的响应成功进行了验证，并且
+ 存储的响应：
  - 是新鲜的，或者
  - 允许提供一份旧的副本，或者
  - 成功进行了验证

注意的一点是，上面列出的所有要求，都可能被一个 cache-control 扩展覆盖。   

当在未进行验证的请求使用存储的响应去满足请求的响应时，缓存必须生成一个 Age 首部，取代响应中的
Age 字段。    
