# 第 5 章 Nginx 服务器的 Gzip 压缩

<!-- TOC -->

- [第 5 章 Nginx 服务器的 Gzip 压缩](#第-5-章-nginx-服务器的-gzip-压缩)
  - [5.1 由 ngx_http_gzip_module 模块处理的 9 个指令](#51-由-ngx_http_gzip_module-模块处理的-9-个指令)
  - [5.2 由 ngx_http_gzip_static_module 模块处理的指令](#52-由-ngx_http_gzip_static_module-模块处理的指令)
  - [5.3 由 ngx_http_gunzip_module 处理的 2 个指令](#53-由-ngx_http_gunzip_module-处理的-2-个指令)
  - [5.4 Gzip 压缩功能的使用](#54-gzip-压缩功能的使用)
- [第 6 章 Nginx 服务器的 Rewrite 功能](#第-6-章-nginx-服务器的-rewrite-功能)
  - [6.1 Nginx 后端服务器组的配置的 5 个指令](#61-nginx-后端服务器组的配置的-5-个指令)
    - [6.1.1 upstream](#611-upstream)
    - [6.1.2 server](#612-server)
    - [6.1.3 ip_hash](#613-ip_hash)
    - [6.1.4 keepalive](#614-keepalive)
    - [6.1.5 least_conn](#615-least_conn)
  - [6.2 Rewrite 功能的配置](#62-rewrite-功能的配置)
    - [6.2.3 if](#623-if)
    - [6.2.4 break 指令](#624-break-指令)
    - [6.2.5 rewrite](#625-rewrite)
    - [6.2.6 rewrite_log](#626-rewrite_log)
    - [6.2.7 set](#627-set)
    - [6.2.9 Rewrite 常用全局变量](#629-rewrite-常用全局变量)
  - [6.3 Rewrite 的使用](#63-rewrite-的使用)
    - [6.3.1 域名跳转](#631-域名跳转)
- [第 7 章 Nginx 的代理服务](#第-7-章-nginx-的代理服务)
  - [7.2 Nginx 的正向代理服务](#72-nginx-的正向代理服务)
    - [7.2.1 Nginx 服务器正向代理服务的配置的 3 个指令](#721-nginx-服务器正向代理服务的配置的-3-个指令)
  - [7.3 Nginx 服务器的反向代理服务](#73-nginx-服务器的反向代理服务)

<!-- /TOC -->

在 Nginx 配置文件可以配置 Gzip 的使用，相关指令可以在配置文件的 http, server, location 块
中设置，Nginx 服务器通过 ngx_http_gzip_module 模块、ngx_http_gzip_static_module 模块
和 ngx_http_gunzip_module 模块对这些指令进行解析和处理。   

## 5.1 由 ngx_http_gzip_module 模块处理的 9 个指令

ngx_http_gzip_module 主要负责 Gzip 功能的开启和设置，对响应数据进行在线实时压缩。   

1. gzip: `gzip on|off` 开启或者关闭 Gzip 功能
2. gzip_buffers: `gzip_buffers number size` 设置 Gzip 压缩文件使用缓存空间的大小，number
指定 Nginx 向系统申请缓存空间的个数，size 指定每个缓存空间的大小。这也不说超过了这个大小会怎么办
3. gzip_comp_level: `gzip_comp_level level;` 设定压缩程度，1~9，1表示压缩程度最低，压缩
效率最高
4. gzip_disable: `gzip_disable regex ...;` 针对不同种类客户端发起的请求，可以选择性地开启
和关闭 Gzip 功能，其中 regex 根据客户端的 UA 进行设置。
5. gzip_http_version: `gzip_http_version 1.0|1.1;` 用于设置开启 Gzip 功能的最低 HTTP
协议版本
6. gzip_min_length: `gzip_min_length length;` 设置页面的字节数，当响应页面的大小大于该值
时才启用 Gzip 功能
7. gzip_proxied: `gzip_proxied off | expired | no-cache | no-store | private ...`
在使用 Nginx 的反向代理功能时有效，前提是在后端服务器返回的响应头部中，包含用于通知代理服务器的
Via 头部，主要用于设置服务器是否对后端服务器返回的结果进行 Gzip 压缩
8. gzip_types: `gzip_types mime-type ...;` 根据 MIME 类型选择性开启 Gzip 功能
9. gzip_vary: `gzip_vary on | off;` 用于设置在使用 Gzip 时是否发送带有 "Vary: Accept-Encoding"
的响应首部，开启后的效果是在响应头部添加了 Accept-Encoding: gzip   

## 5.2 由 ngx_http_gzip_static_module 模块处理的指令

该模块主要负责搜索和发送经过 Gzip 功能预压缩的数据。这些数据以 .gz 作为后缀名存储在服务器上。
如果客户端请求的数据在之前被压缩过，并且客户端浏览器支持 Gzip 压缩，就直接返回压缩后的数据。   

该模块与 ngx_http_gzip_module 模块的不同之处主要在于，该模块使用的是静态压缩，在 HTTP 响应
头部包含 Content-Length 头域来指明报文体的长度，用于服务器可确定响应数据长度的情况；而后者默认
使用 Chunked 编码的动态压缩，其主要适用于服务器无法确定响应数据长度的情况。   

gzip_static 指令，用于开启和关闭该模块的功能：   

```
gzip_static on | off | always;
```   

always 一直发送 Gzip 预压缩文件，而不检查客户端浏览器是否支持 Gzip。   

## 5.3 由 ngx_http_gunzip_module 处理的 2 个指令

为不支持 Gzip 的客户端提供解压功能。   

gunzip 指令控制开启或者关闭：   

```
gunzip on | off;
```   

gunzip_buffers 与 gzip_buffers 类似。   

## 5.4 Gzip 压缩功能的使用

```
user nobody nobody;
worker_processes 4;
error_log logs/error.log;
pid nginx.pid;

events {
  use epoll;
  worker_connections 1024;
}

http {
  include mime.types;
  default_type application/octet-stream;
  sendfile on;
  keepalive_timeout 65;
  log_format access.log '$remote_addr-[$time_local]-"$request"-"http_user_agent"'

  gzip on;
  gzip_min_length 1024;
  gzip_buffers 4 16k;
  gzip_comp_level 2;
  gzip_types text/plain application/x-javascript text/css application/xml;
  gzip_vary on;     # 启用压缩标识
  gunzip_static on;

  server {
    listen 8081;
    server_name myServer1;
    access_log /myweb/server1/log/access.log;
    error_page 404 /404.html;
    
    location /server1/location1 {
      root /myweb;
      index index.svr1-loc1.html;
    }

    location /server1/location2 {
      root /myweb;
      index index.svr1-loc2.html;
    }
  }

  server {
    listen 8082;
    server_name 192.168.1.3;
    access_log /myweb/server2/log/access.log;
    error_page 404 /404.html;
    
    location /server2/location1 {
      root /myweb;
      index index.svr2-loc1.html;
    }
  }
}
```    

# 第 6 章 Nginx 服务器的 Rewrite 功能

## 6.1 Nginx 后端服务器组的配置的 5 个指令

Nginx 服务器支持一组服务器作为后端服务器，服务器组的设置由 ngx_http_upstream_module 进行
处理的。   

### 6.1.1 upstream

该指令是设置后端服务器组的主要指令，其他的指令都在该指令中进行配置。    

```
upstream name {
  ...
}
```   

其中，name 是给后端服务器组起的组名。花括号中列出后端服务器组包含的服务器。   

默认情况下，某个服务器组接收到请求以后，按照轮叫调度（Round-Robin, RR）策略顺序选择组内服务器
处理请求。如果一个服务器在处理请求的过程中出现错误，请求会被顺次交给组内的下一个服务器进行处理，
以此类推，直到返回正常响应。但如果所有的组内服务器都出错，则返回最后一个服务器的处理结果。当然
我们可以根据各个服务器处理能力的或者资源配置情况的不同，给各个服务器配置不同的权重，让能力强的
服务器多处理请求。   

### 6.1.2 server

用于设置组内的服务器：   

```
server address [parameters];
```   

- address: 服务器的地址，可以是包含端口号的 IP 地址、域名或者以 "unix:" 为前缀的 Unix Domain
Socket
- parameters: 为当前服务器配置更多属性，这些属性变量包括以下内容：
  + weight=number, 为组内服务器设置权重，权重值高的服务器被优先用于处理请求，组内所有服务器的
  权重默认为 1
  + max_fails=number, 设置一个请求失败的次数。在一定时间范围内，当对组内某台服务器请求失败的
  次数超过该值时，认为该服务器无效。默认为 1
  + fail_timeout=time, 有两个作用，一是设置 max_fails 指令尝试请求某台组内服务器的时间，
  即上面提到的一定时间范围内；另一个作用是在检查服务器是否有效时，如果一台服务器被认为是无效的，
  该变量设置的时间为认为服务器无效的持续时间。在这个时间内不再检查该服务器的状态，并一直认为它是
  无效的，默认 10s
  + backup, 将某台组内服务器标记为备用服务器，只有当正常的服务器处于无效或者繁忙状态时，该服务
  器才被用来处理客户端请求
  + down，将某台组内服务器标记为永久的无效状态

### 6.1.3 ip_hash

该指令用户实现会话保持功能，将某个客户端的多次请求定向到组内同一台服务器上，保证客户端与服务器之间
建立稳定的会话。只有当该服务器处于无效状态时，客户端请求才会被下一个服务器接收和处理。   

```
ip_hash;
```   

### 6.1.4 keepalive

用于控制网络连接保持功能。通过该指令，能够保证 Nginx 服务器的工作进程为服务器组打开一部分网络
连接，并且将数量控制在一定的范围之内：    

```
keepalive connections;
```   

其中，connections 为 Nginx 的每一个工作进程允许该服务器组保持的空闲网络连接数的上限值。   

### 6.1.5 least_conn

用于配置 Nginx 使用负载均衡策略为网络连接分配服务器组内的服务器。该指令在功能上实现了最少连接
负载均衡算法，在选择组内的服务器时，考虑各服务器权重的同时，每次选择的都是当前网络连接最少的那台
服务器。    

## 6.2 Rewrite 功能的配置

### 6.2.3 if

用来支持条件判断，并根据条件判断结果选择不同的 Nginx 配置，可以在 server, location 中配置：   

```
if ( condition ) {
  ...
}
```   

condition 为判断条件，它可以支持以下几种设置方法：   

- 变量名。如果变量的值为空字符串或者以 “0” 开头的任意字符串，就认为是 false
- 使用 = 和 != 比较变量和字符串是否相等，字符串不需要加引号
- 使用正则表达式对变量进行匹配。变量与正则表达式之间用 ~, ~*, !~, !~\* 连接，~ 表示匹配过程对大小写
敏感，~* 表示不敏感，使用 !~ 和 !~* 就是否定匹配。一般正则表达式不用加引号，但如果有 } 或 ;时，
必须给整个正则表达式加引号       

```
if ($http_user_agent ~ MSIE) {
  ...
}
```   

- 判断请求的文件是否存在使用 -f 和 !-f：   

```
if (-f $request_filename) {
  ...
}
```   

- 判断请求的目录是否存在使用 -d, !-d
- 判断请求的目录或者文件是否存在使用 -e, !-e
- 判断请求的文件是否可执行 -x, !-x   

### 6.2.4 break 指令

该指令用于中断当前相同作用域中的其他 Nginx 配置。位于后面的指令配置无效。可以在 server, location
和 if 中使用：    

```
location / {
  if ($slow) {
    set $id $1
    break;
    limit_rate 10;
  }
}
```   

return 指令用于完成对请求的处理，直接向客户端返回响应状态代码。可以在 server,location,if 使用：   

```
return [ text ]
return code URL;
return URL;
```   

- code，为返回给客户端的 HTTP 状态代码
- text，为返回给客户端的响应体内容，支持变量的使用
- URL，为返回给客户端的 URL 地址

### 6.2.5 rewrite

该指令通过正则表达式的使用来改变 URI。可以同时存在一个或多个指令，按照顺序依次对 URL 进行匹配
和处理。   

可以在 server, location 中配置：   

```
rewrite regex replacment [falg]
```   

rewrite 接收到的 URI 不包含 host 地址。也不包含 query 内容。      

```
rewrite myweb.com http://newweb.com/permanent;
```    

flag 用来设置 rewrite 对 URI 的处理行为，可以为以下之一：   

- last, 终止继续在本 location 块中处理接收到的 URI，并将此处重写的 URI 作为一个新的 URI，
使用各 location 块进行处理
- break, 将此处重写的 URI 作为一个新的 URI，在本块中继续进行处理。
- redirect, 将重写后的 URI 返回给客户端，302，主要用于 replacement 变量不是以 http:// 或者
https:// 开头的情况
- permanent, 将重写后的 URI 返回给客户端，301   

### 6.2.6 rewrite_log

是否开启 URL 重写日志的输出功能：   

```
rewrite_log on | off
```   

如果配置为开启，URL 重写的相关日志将以 notice 级别输出到 error_log 指令配置的日志文件中。   

### 6.2.7 set

设置一个新变量：   

```
set variable value
```   

- variable, 为变量的名称，注意要用 $ 作为第一个字符，且变量不能与 Nginx 服务器预设的全局变量
同名。    

### 6.2.9 Rewrite 常用全局变量    

- $args: 存放请求 URL 中的 query，arg1=value1&arg2=value2
- $content_length: Content-Length 字段
- $content_type
- $document_root: 存放针对当前请求的根路径
- $document_uri: 存放请求中的当前 URI，不包含 query, /server/source
- $host: 存放 URL 中的主机部分字段 www.example.com
- $http_user_agent
- $http_cookie
- $limit_rate
- $remote_addr: 客户端地址
- $remote_port
- $remote_user
- $request_body_file
- $request_method
- $request_filename: 当前请求的资源文件的路径名
- $request_uri: 带 query 的 URI
- $query_string: 同 $args
- $scheme
- $server_protocol
- $server_addr
- $server_name
- $server_port

## 6.3 Rewrite 的使用

### 6.3.1 域名跳转

通过 Rewrite 功能可以实现一级域名跳转，也可以实现多级域名跳转：   

```
server {
  listen 80;
  server_name jump.myweb.name;
  rewrite ^/ http://www.myweb.info/;
}

# 例2
server {
  listen 80;
  server_name jump.myweb.name jump.myweb.info;
  if ($host ~ myweb\.info) {
    rewrite ^(.*) http://jump.myweb.name$1 permanent
  }
}

# 例 3
server {
  listen 80;
  server_name jump1.myweb.name jump2.myweb.name;
  if ($http_host ~* ^(.*)\.myweb\.name$) {
    rewrite ^(.*) http://jump.myweb.name$1;
    break;
  }
}
```   

在例 1 中，客户端访问 http://jump.myweb.name 时，URL 将被 Nginx 服务器重写为 http://jump.myweb.info，
客户得到的数据其实是由 http://jump.myweb.info 响应的。在例 2 中，客户端访问 http://jump.myweb.info/reqsource 时，
URL 将被重写为 http://jump.myweb.name/reqsource。客户端得到的数据实际上是由 http://jump.myweb.name
响应的。在例3中，客户端访问 http://jump1.myweb.name/reqsource 或者 http://jump2.myweb.name/reqsource，
URL 重写为 http://jump.myweb.name/reqsource。   

# 第 7 章 Nginx 的代理服务

## 7.2 Nginx 的正向代理服务

### 7.2.1 Nginx 服务器正向代理服务的配置的 3 个指令

resolver 指令用于指定 DNS 服务器的 IP 地址：   

```
resolver address ... [value=time]
```   

resolver_timeout 用于设置 DNS 服务器域名解析超时时间。   

proxy_pass 用于设置代理服务器的协议和地址：   

```
proxy_pass URL;
```   

## 7.3 Nginx 服务器的反向代理服务

1. proxy_pass 指令    

```
proxy_pass URL;
```   

URL 为要设置的被代理服务器的地址，包括传输协议、主机名称或IP地址加端口号、URI 等。如果被代理的
是一组服务器的话，可以使用 upstream 指令搭配使用：   

```
upstream proxy_svrs {
  server http://192.168.1.1:8001/uri/;
  server http://192.168.1.2:8001/uri/;
  server http://192.168.1.3:8001/uri/;
}

server {
  listen 80;
  server_name www.myweb.name;
  location / {
    proxy_pass proxy_svrs;
  }
}
```   

