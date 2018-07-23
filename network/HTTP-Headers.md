# HTTP Headers

HTTP 首部字段根据实际用途被分为以下 4 种类型：   

+ 通用首部：请求报文和响应报文都会使用的首部
+ 请求首部
+ 响应首部
+ 实体首部    

HTTP 1.1 规范定义了如下 47 种首部字段。   

**通用首部字段**    


首部字段名 | 说明
---------|----------
 Cache-Control | 控制缓存的行为
 Connection | 逐跳首部、连接的管理
 Date | 创建报文的日期时间
 Pragma | 报文指令
 Trailer | 报文末端的首部一览
 Transfer-Encoding | 指定报文主体的传输编码方式
 Upgrade | 升级为其他协议
 Via | 代理服务器的相关信息
 Warning | 错误通知   

**请求首部**    


首部字段名 | 说明
---------|----------
 Accept | 用户代理可处理的媒体类型
 Accept-Charset | 优先的字符集
 Accpet-Encoding | 优先的内容编码
 Accept-Language | 优先的语言
 Authorization | Web 认证信息
 Expect | 期待服务器的特定行为
 From | 用户的电子邮箱地址
 Host | 请求资源所在服务器
 If-Match | 比较实体标记
 If-Modified-Since | 比较资源的更新时间
 If-None-Match | 比较实体标记（与 If-Match 相反）
 If-Unmodified-Since | 比较资源的更新时间（与 If-Modified-Since 相反）
 Max-Forwards | 最大传输逐跳数
 Proxy-Authorization | 代理服务器要求客户端的认证信息
 Range | 实体的字节范围请求
 Referer | 对请求中 URI 的原始获取方
 TE | 传输编码的优先级
 User-Agent | HTTP 客户端程序的信息


**响应首部字段**    


首部字段名 | 说明
----------|---------
 Accpet-Range | 是否接受字节范围请求
 Age | 推算资源创建经过时间
 ETag | 资源的匹配信息
 Location | 令客户端重定向至指定 URI
 Proxy-Authenticate | 代理服务器对客户端的认证信息
 Retry-After | 对再次发起请求的时机要求
 Server | HTTP 服务器的安装信息
 Vary | 代理服务器缓存的管理信息
 WWW-Authenticate | 服务器对客户端的认证信息   

**实体首部字段**    


首部字段名 | 说明
----------|---------
 Allow | 资源可支持的 HTTP 方法
 Content-Encoding | 实体主体适用的编码方式
 Content-Language | 实体主体的自然语言
 Content-Length | 实体主体的大小，字节
 Content-Location | 替代对应资源的 URI
 Content-MD5 | 实体主体的报文摘要
 Content-Range | 实体主体的位置范围
 Content-Type | 实体主体的媒体类型
 Expires | 实体主体过期的日期时间
 Last-Modified | 资源的最后修改日期时间   

## Cache-Control

缓存请求指令    


指令 | 参数 | 说明
---------|----------|---------
 no-cache | 无 | 强制向源服务器再次验证
 no-store | 无 | 不缓存请求或响应的任何内容
 max-age=[秒] | 必需 | 响应的最大 Age 值
 max-stale(=[秒]) | 可省略 | 接收已过期的响应
 min-fresh=[秒] | 必需 | 期望在指定时间内的响应仍有效
 no-transform | 无 | 代理不可更改媒体类型
 only-if-cached | 无 | 从缓存获取资源
 cache-extension | - | 新指令标记    

缓存响应指令

指令 | 参数 | 说明
---------|----------|---------
 public | 无 | 可向任意方提供响应的缓存
 private | 可省略 | 仅向特定用户返回响应
 no-cache | 可省略 | 缓存前必需先确认其有效性
 no-store | 无 | 不缓存请求或响应的任何内容
 max-age=[秒] | 必需 | 响应的最大 Age 值
 s-maxage=[秒] | 必需 | 公共缓存服务器响应的最大Age值
 no-transform | 无 | 代理不可更改媒体类型
 must-revalidate | 无 | 可缓存但必须再向源服务器进行确认
 proxy-revalidate | 无 | 要求中间缓存服务器对缓存的响应有效性再进行确认
 cache-extension | - | 新指令标记   

客户端发送的请求中如果包含 no-cache 指令,则表示客户端将不会接收缓存过的响应。于是,“中间”的
缓存服务器必须把客户端请求转发给源服务器。     

如果服务器返回的响应中包含 no-cache 指令,那么缓存服务器不能对资源进行缓存。源服务器以后也将不
再对缓存服务器请求中提出的资源有效性进行确认,且禁止其对响应资源进行缓存操作。     

s-maxage 指令的功能和 max-age 指令的相同,它们的不同点是 s-maxage 指令只适用于供多位用户
使用的公共缓存服务器 2 。也就是说,对于向同一用户重复返回响应的服务器来说,这个指令没有任何
作用。     

另外,当使用 s-maxage 指令后,则直接忽略对 Expires 首部字段及 max-age 指令的处理。    

Pragma 是 HTTP/1.1 之前版本的历史遗留字段,仅作为与 HTTP/1.0的向后兼容而定义。规范定义的形式唯一,如下所示。    

`Progma: no-cache`      

通常发送的请求可能会同时含有以下两个首部字段：   

```
Cache-Control: no-cache
Progma: no-cache
```     