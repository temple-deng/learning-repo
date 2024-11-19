# 第 6 章 NGINX HTTP 服务器

## 6.1 NGINX 架构

NGINX 包括一个主进程和多个 worker 进程。每个进程都是单线程的，可以用来同时处理很多的连接。   

主进程负责读取配置，处理 sockets，衍生 worker 进程，打开日志文件，编译内嵌的 Perl 脚本。   

worker 进程使用 event loop 来处理新到的连接。   

除此之外，主进程还会衍生很多的 helper 进程来处理其他专门的任务。例如 cache loader 和 cache
manager 进程。cache loader 负责为缓存预处理元数据。cache manager 负责检查缓存的有效性，并
删除无效的 item。     

NGINX 中的模块都是链成一条管道来处理连接和请求，在处理完请求后，就会将其传递给一系列的过滤器，在
这里会进行响应的处理。其中有一个过滤器负责处理 **子请求**。    

## 6.2 HTTP 核心模块

### 6.2.1 server 指令

default server 是一组具有相同监听 IP 地址和端口中的在配置中第一个出现的服务器，当然也可以使用
listen default_server 显示指定一个 default server。   

default server 可以用来定义一些通用的指令，这些指令可以在后续被相同地址和端口的服务器重用。   

```
server {
  listen 127.0.0.1:80;
  server_name default.example.com;
  server_name_in_redirect on;
}
server {
  listen 127.0.0.1:80;
  server_name www.example.com;
}
```    

在上面的例子中，www.example.com 服务器相当于也设置了 server_name_in_redirect on。不过
其实只有一部分的指令有这种继承的效果。   

- `port_in_redirect`: NGINX 在进行一个重定向时是否要在其中包含端口
- `server`: 创建新的配置上下文，定义一个虚拟主机
- `server_name`: 虚拟主机的名称
- `server_name_in_redirect`: 使用 server_name 的第一个值用作重定向
- `server_tokens`: 禁止在错误消息以及 Server 响应首部中发送 NGINX 版本号

### 6.2.2 记录日志

NGINX 的日志模型非常灵活，每个级别的配置都可以有一个访问日志，另外，每个级别可以指定多于一个的
访问日志，每个可以有不同的 log_format 指令。    

```
http {
  log_format vhost '$host $remote_addr - $remote_user [$time_local] '
    '"$request" $status $body_bytes_send '
    '"$http_referer "$http_user_agent"';

  log_format downloads '$time_iso8601 $host $remote_addr '
    '"$request" $status $body_bytes_sent $request_time';

  open_log_file_cache max=1000 inactive=60s;
  access_log logs/access.log;

  server {
    server_name ~^(www\.)?(.+)$;
    access_log logs/combined.log vhost;
    access_log logs/$2/access.log;

    location /downloads {
      access_log logs/downloads.log downloads;
    }
  }
}
```    

- `access_log`: 指定了日志写入的位置和方式，第一个参数是日志文件的路径，后面的参数都是可选的，
第二个是指定该日志使用的 log_format，第三个指定如果使用缓冲区来写入日志，缓冲区的大小，如果是
gzip，那么还会进行 gzip 压缩，最后一个 flush 参数指定缓冲数据在刷新到磁盘前可以在内存中停留
的最大时间
- `log_format`
- `log_not_found`: 禁止在error log中记录 404 错误
- `log_subrequest`: 允许在 access log 中记录子请求
- `open_log_file_cache`: 用来设置 access_log 路径中包含变量情况下打开文件的文件描述符的缓存，
支持的参数有：
  + max: 指定缓存中描述符的最大数量
  + inactive: 就是标记为不活跃的时间吧，如果在这个时间段内没有写入操作，就标记为 inactive
  + min_uses: 在 inactive 时间内最少的写入次数吧
  + valid: 如果设置了这个值，NGINX会经常去检查描述符是否还与同一个名称的文件匹配
  + off

```
access_log /var/log/nginx/access.log_gz combined gzip=4 flush=1m;
```    

log_format 中可以使用的变量：   

- $body_bytes_sent: 发送给客户端的字节量，不包含首部
- $bytes_sent: 发送给客户端的字节量
- $connection: 指定一个序列号，用来唯一识别连接，这是三次握手中的那个吧
- $connection_requests: 一个连接上可以发送的请求的数量
- $msec: 没看懂
- $pipe(log专用): 是否请求是管道
- $request_length(log): 请求的长度，貌似来看是整个报文的长度
- $request_time: 请求的处理时间，毫秒，从接收客户端发送的第一个字节开始，到最后一个字节发送
给客户端
- $status: 响应状态
- $time_iso8601(log)
- $time_local(log)

### 6.2.3 搜索文件

为了对请求做出响应，NGINX 会将请求传递给 content handler，这个 content handler 是由
location 指令定义的。首先会尝试无条件的 content handler，包括 perl, proxy_pass, flv,
mp4 等等。如果这些 handler 都不匹配，那么请求传递按序传递给: random index, index, autoindex,
gzip_static, static。    

如果请求的结尾是 /，那么就由 index handlers 处理。如果没用 gzip，那么 static 会处理。    

```
server {
  root /home/customer/html;
  location / {
    index index.html index.htm;
  }
  location /downloads {
    autoindex on;
  }
}
```    

在上面的例子中，所有服务的文件都是在 root 指令下搜索的，如果客户端仅输入了一个域名，NGINX 会尝试
提供 index.html。如果这个文件不存在，尝试提供 index.htm。当客户请求 /donwloads 时，它们将
以 HTML 格式显示目录列表。

### 6.2.4 名称解析

```
server {
  resolver 192.168.100.2 valid=300s;
}
```   

就是做代理时，用来解析上游域名的 DNS。   


### 6.2.5 与客户端交互

略。   

## 6.3 使用 limits 阻止滥用

就是防止 DNS。   

略。   

## 6.4 限制访问

## 6.5 流媒体文件

## 6.6 预定于变量

## 6.7 SPDY 和 HTTP/2

## 6.8 使用 PHP-FPM

