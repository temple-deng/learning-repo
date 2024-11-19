# 第 4 章 反向代理

<!-- TOC -->

- [第 4 章 反向代理](#第-4-章-反向代理)
  - [4.1 介绍反向代理](#41-介绍反向代理)
  - [4.2 proxy 模块](#42-proxy-模块)
  - [4.3 带有 cookies 的废弃服务器](#43-带有-cookies-的废弃服务器)
  - [4.4 upstream 模块](#44-upstream-模块)
  - [4.5 keepalive 连接](#45-keepalive-连接)
  - [4.7 单个上游服务器](#47-单个上游服务器)
  - [4.8 多个上游服务器](#48-多个上游服务器)
  - [4.9 非 HTTP 上游服务器](#49-非-http-上游服务器)
    - [4.9.1 memcached 上游服务器](#491-memcached-上游服务器)
    - [4.9.2 FastCGI 上游服务器](#492-fastcgi-上游服务器)
    - [4.9.3 SCGI 上游服务器](#493-scgi-上游服务器)
    - [4.9.4 uWSGI 上游服务器](#494-uwsgi-上游服务器)
  - [4.10 负载均衡](#410-负载均衡)
  - [4.11 将一个 if-fy 配置转换为一个更现代的解释](#411-将一个-if-fy-配置转换为一个更现代的解释)
  - [4.12 使用错误文档来处理上游错误](#412-使用错误文档来处理上游错误)
- [第 5 章 反向代理高级技巧](#第-5-章-反向代理高级技巧)
  - [5.1 通过分离来保证安全](#51-通过分离来保证安全)
    - [5.1.1 使用 SSL 加密通信](#511-使用-ssl-加密通信)
    - [5.1.2 使用 SSL 认证客户端](#512-使用-ssl-认证客户端)
    - [5.1.3 基于原始 IP 阻塞通信](#513-基于原始-ip-阻塞通信)
  - [5.2 隔离应用程序组件提高可扩展性](#52-隔离应用程序组件提高可扩展性)
  - [5.3 反向代理性能调整](#53-反向代理性能调整)
    - [5.3.1 缓冲数据](#531-缓冲数据)
    - [5.3.2 缓存数据](#532-缓存数据)
    - [5.3.4 压缩数据](#534-压缩数据)

<!-- /TOC -->

由于反向代理的特性，上游服务器不会直接从客户端获取到信息，例如客户端的真实 IP。这些信息可以通过
附带首部的形式传递给上游服务器。   

## 4.1 介绍反向代理

当代理一个上游服务器的时候，最重要的指令就是 `proxy_pass`。该指令接收请求应该被转发到的 URL
作为参数。使用一个带有 URI 部分的 proxy_pass 会使用 URI 替换掉变量 request_uri。例如，下例
中的 /uri 在到达上游服务器时会被转换成 /newuri。    

```
location /uri {
  proxy_pass http://localhost:8080/newuri;
}
```    

话说这个变量和 request_uri 有什么关系啊，并没有用到这玩意吧。   

这条规则有两处例外的地方。第一处，如果 location 是一个正则表达式，那么就不会有任何的 URI 转换
发生，例如，下例中的 /local 会直接传递给上游：   

```
location ~ ^/local {
  proxy_pass http://localhost:8080/foreign;
}
```    

另一处是当 location 中的 rewrite 规则改变了 URI，那么 NGINX 会使用这个 URI 里处理请求，也
不会再发生转换。下例中发送给上游的 URL 是 `/index.php?page=<match>`：   

```
location / {
  rewrite /(.*)$ /index.php?page=$1 break;
  proxy_pass http://localhost:8080/index;
}
```    

## 4.2 proxy 模块

下面总结了 proxy 模块中使用的一些常用的指令：   

- `proxy_connect_timeout`: NGINX 等待到上游的连接被接受的超时时间
- `proxy_cookie_domain`: 替换掉上游返回中 Set-Cookie 中的 domain 属性
- `proxy_cookie_path`: 同上，替换掉 path 属性
- `proxy_headers_hash_bucket_size`: 指定首部名称的最大尺寸
- `proxy_headers_hash_max_size`: 指定从上游收到的首部的总大小
- `proxy_hide_header`: 指定一个首部列表，列表中的首部不会传递给客户端
- `proxy_http_version`: 指定和上游通信的 HTTP 协议版本
- `proxy_ignore_client_abort`: 如果设置为 on，如果客户端放弃了连接，那么 NGINX 不会放弃到
上游的连接
- `proxy_intercept_headers`: 设置处理来自上游的响应时忽略的首部
- `proxy_intercept_errors`: 如果启用了这个指令，NGINX 会使用配置 error_page 响应，而不是
使用上游的响应
- `proxy_max_temp_file_size`: 当响应放不进内存缓存区中时，指定写入文件的文件最大尺寸
- `proxy_pass`: 指定请求应该传递给的上游，URL 形式
- `proxy_pass_header`: 覆盖 proxy_hide_header 中禁用的首部，允许他们发送给客户端（这有什么意义？）
- `proxy_pass_request_body`: 设置为 off 时，不会给请求首部发送给上游
- `proxy_pass_request_headers`: 设置为 off 时，不会将请求首部发送给上游
- `proxy_read_timeout`: 到上游的连接，两次成功的读操作的间隔时间，超过这个时间会关闭连接。
- `proxy_redirect`: 重写从上游收到的响应的 Location 和 Refresh 首部
- `proxy_send_timeout`: 到上游的连接，两次成功的写操作的间隔时间，超过这个时间会关闭连接
- `proxy_set_body`: 如果设置了这个指令，发送给上游的请求主体可以被修改
- `proxy_set_header`: 重写发送给上游的首部
- `proxy_temp_file_write_size`: 限制了每一时刻缓存到一个临时文件中的数据量，以便 NGINX 在
一个请求上不会阻塞太长
- `proxy_temp_path`: 临时文件的路径    

```
proxy_redirect off;
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
client_max_body_size 10m;
client_body_buffer_size 128k;
proxy_connect_timeout 30;
proxy_send_timeout 15;
proxy_read_timeout 15;
proxy_send_lowat 12000;
proxy_buffer_size 4k;
proxy_buffers 32 4k;
proxy_busy_buffers_size 64k;
proxy_temp_file_write_size 64k;
```    

- 我们将 `proxy_redirect` 设置为 off，因为我在大多数情况下都被必要重写 Location 首部
- 设置了 Host 首部以便上游可以根据请求匹配到对应的虚拟服务器
- X-Real-IP, X-Forwarded-For 目的类似，都是中转关于客户端 IP 地址到上游
- $proxy_add_x_forwarded_for 变量包含了客户端请求中的 X-Forwarded-For 首部字段
- client_max_body_size 严格来说不是一个 proxy 模块的指令，如果这个值设得太低，那么到上游的
文件上传可能会失败
- proxy_connect_timeout 指令指明了 NGINGX 在建立到上游的初始化连接时会等待多久
- proxy_read_timeout 和 proxy_send_timeout 定义了与上游两次成功的操作之间 NGINX 会等待多久
- proxy_send_lowat 仅在 FreeBSD 上有用

## 4.3 带有 cookies 的废弃服务器

有时候，我们可能有一些废弃的应用在一个共用的代理后面，这些废弃的应用通常只有在与客户端直接通信的
请求下才会正常工作。    

```
server {
  server_name app.example.com;

  location /legacy1 {
    proxy_cookie_domain legacy1.example.com app.example.com;
    proxy_cookie_path $uri /legacy1$uri;
    proxy_redirect default;
    proxy_pass http://legacy1.example.com/;
  }
}
```

## 4.4 upstream 模块

和 proxy 模块紧密相关的是 upstream 模块。upstream 指令定义了新的上下文包含了一组定义的上游
服务器。这些服务器可能有不同的权重，可能是不同的类型，甚至可能由于维护的原因被标记为下线 down 状态。   

下面总结了 upstream 上下文中有效的指令：   

- ip_hash: 通过将 IP 地址进行哈希来决定客户端要分发到哪台服务器
- keepalive: 指定了每个 worker process 缓存的到上游的连接的数量
- least_conn: 激活负载均衡算法，以便在新连接到来时选择一个具有最少连接的服务器
- server: 该指令定义了一个地址，以及上游的一些可选参数，这些可选参数包括：
  + weight: 权重
  + max_fails: 在 fail_timeout 内进行了多少次不成功的通信后就将服务器标记为下线
  + fail_timeout
  + backup: 该服务器仅在其他服务器都下线的请求下才会接收请求
  + down: 下线状态

## 4.5 keepalive 连接

keepalive 指令定义了每个 worker process 与一个上游的同时打开的连接的数量。

## 4.7 单个上游服务器

略。   

## 4.8 多个上游服务器

我们可以通过配置使 NGINX 将请求分发给多个上游（其实这里的意思不是说把一个请求同时发给多个服务器，
只是像负载均衡那样循环的发）。配置方式就是在一个 upstream 上下文中定义多个
服务器，然后在 proxy_pass 指令中引用这个上游：   

```
upstream app {
  server 127.0.0.1:9000;
  server 127.0.0.1:9001;
  server 127.0.0.1:9002;
}
server {
  location / {
    proxy_pass http://app;
  }
}
```

## 4.9 非 HTTP 上游服务器

NGINX 可以代理到许多不同类型的上游的请求。每个类型都有对应的 *_pass 指令。   

### 4.9.1 memcached 上游服务器

memcached 模块负责和一个 memcached 守护程序通信，该模块可以让 NGINX 可以使用 memcached
协议，从而能够在请求发送给应用服务器之前先去 memcache 服务器上进行键的查找。   

```
upstream memcaches {
  server 10.0.100.10:11211;
  server 10.0.100.20:11211;
}

server {
  location / {
    set $memcached_key "$uri?$args";
    memcached_pass memcaches;
    error_page 404 = @appserver;
  }
  location @appserver {
    proxy_pass http://127.0.0.1:8080;
  }
}
```   

memcached_pass 指令使用 $memcached_key 变量来进行键的搜索。如果没有对应的值，会将请求发送给
本机上的服务器，该服务器会处理该请求，然后在 memcached 实例中插入键值对。   

### 4.9.2 FastCGI 上游服务器

使用 fastcgi_pass 指令激活 fastcgi 模块。    

```
upstream fastcgis {
  server 10.0.200.10:9000;
  server 10.0.200.20:9000;
  server 10.0.200.30:9000;
}

location / {
  fastcgi_pass fastcgis;
}
```   

### 4.9.3 SCGI 上游服务器

类似上面，scgi_pass。   

### 4.9.4 uWSGI 上游服务器

类似上面，uwsgi_pass。   

## 4.10 负载均衡

upstream 模块会从三种负载均衡算法中选择一种来选择一个上游。分别是 round-robin, IP hash,
lease connections。默认是 round-robin 算法，基本上就是轮询，可能加了一些权重的东西。   

使用 ip_hash 指令激活 IP hash 算法，即同一个 IP 的请求应该总是交给同一个上游来处理。NGINX
使用 IPv4 地址的前 24 位或者整个 IPv6 地址用来计算 hash。   

lease connections 算法由 lease_conn 指令激活。   

## 4.11 将一个 if-fy 配置转换为一个更现代的解释

if 指令在某些场景下很有效，但是如果滥用的话会产生一些意料之外的结果：   

```
location /  {
  try_files /img /static @imageserver;
  if ($request_uri ~ "/blog") {
    proxy_pass http://127.0.0.1:9000;
    break;
  }

  if ($request_uri ~ "/tickets") {
    proxy_pass http://tickets.example.com;
    break;
  }
}

location @imageserver {
  proxy_pass http://127.0.0.1:8080;
}
```    

上例中，无论是 /img, /static 还是 @imageserver 都不会提供图片的服务。try_files 指令在于 if
指令处于同一个 location 块中时并不会生效。if 指令创建了一个使用其自己 content handler 的
隐式 location 块，在上面的例子中就是 proxy 模块。因此外部的 content handler，就不会被调用。   

事实上，我们可以将上面 if 转换为不同 uri 的 location 块：   

```
location /blog {
  proxy_pass http://127.0.0.1:9000;
}

location /tickets {
  proxy_pass http://tickets.example.com;
}

location /img {
  try_files /static @imageserver;
}

location / {
  root /static;
}

location @imageserver {
  proxy_pass http://127.0.0.1:8080;
}
```

## 4.12 使用错误文档来处理上游错误

一些情况下，上游无法对请求做出响应，这时候可以配置 NGINX 使用本次磁盘上的文档进行响应：   

```
server {
  error_page 500 502 503 504 /50x.html;
  location = 50x.html {
    root share/example/nginx/html;
  }
}
```

# 第 5 章 反向代理高级技巧

## 5.1 通过分离来保证安全

### 5.1.1 使用 SSL 加密通信

NGINX 通常用来终止掉一个 SSL 连接，因为上游服务器可能没有 SSL 能力或者不想处理 SSL 连接。   

```
server {
  listen 443 default ssl;
  server_name www.example.com;

  ssl_prefer_server_ciphers on;
  ssl_protocols TLSv1 SSLv3;
  ssl_ciphers RC4:HIGH:!aNULL:!MD5:@STRENGTH;
  ssl_session_cache shared:WEB:10M;
  ssl_certificate /usr/local/etc/nginx/www.example.com.crt;
  ssl_certificate_key /usr/local/etc/nginx/www.example.com.key;

  location / {
    proxy_set_header X-FORWARDED_PROTO https;
    proxy_pass http://upstream;
  }
}
```    

我们将 ssl_session_cache 设置为了 shared，那么所有的 worker process 都可以对同一个客户端
共享已经协商好的各个 SSL 参数。这个指令的第二部分和第三部分分别是缓存的名字和大小。   

### 5.1.2 使用 SSL 认证客户端

就是服务器要求对客户端也进行认证，但是这种认证代理服务器是无法完成的。因此我们必须按照如下方式将
客户端提供的证书传递给上游：   

```
location /ssl {
  proxy_set_header ssl_client_cert $ssl_client_cert;
  proxy_pass http://upstream;
}
```    

除了直接将证书传给上游完，NGINX 还有一些其他的功能，例如验证证书的有效性：   

```
server {
  ssl_client_certificate /usr/local/etc/nginx/ClientCertCAs.pem;
  ssl_crl /usr/local/etc/nginx/ClientCertCRLs.crl;
  ssl_verify_client on;
  ssl_verify_depth 3;
  error_page 495 = @noverify;
  error_page 496 = @nocert;
  location @noverify {
    proxy_pass http://insecure?status=notverified;
  }

  location @nocert {
    proxy_pass http://insecure?status=nocert;
  }
  location / {
    if ($ssl_client_verify = FAILED) {
      return 495;
    }

    proxy_pass http://secured;
  }
}
```    

- ssl_client_certificate 指令指定了使用 PEM 加密的根 CA 证书的列表，可以用来验证客户端证书
的签名者
- ssl_crl 指定了回收证书的列表
— ssl_verify_client 表明了我们希望 NGINX 会验证客户端证书的有效性
- ssl_verify_depth 在认为一个证书是无效的前，我们请求检查多少个签名者

### 5.1.3 基于原始 IP 阻塞通信

本章内容需要我们编译 NGINX 时启用了 GeoIP 模块，--with-http_geoip_module，并且本地安装了
MaxMind GeoIP 库。在 http 块中使用 geoip_country 指令指明预编译过的数据库文件的位置。这
种方式通过国家代理来阻塞/允许该地区的 IP 访问：   

```
geoip_country /usr/local/etc/geo/GeoIP.dat;
```   

如果客户端的 IP 在数据库列出的列表中，那么 $geoip_country_code 变量会设置为该地址国家的 ISO
两个字符的代码。   

geo 模块会建立一个命名上下文，其中的第一个参数是用来匹配的 IP 地址，第二个参数是匹配要获取的值。   

我们的例子是这样的，假设我们希望服务器可以被 Google 索引，但是目前仅限 Swiss IP 进行访问。
同时我们希望一个本地的监控服务能够访问这个站点，来确保网站在正常工作。定义一个变量 $exclusions，
默认值是0，如果成功匹配了，值就为 1：    

```
http {
  geoip_country /usr/local/etc/geo/GeoIP.dat;

  # 我们定义的变量 $exclusions 并且列出了会将这个值设为 1 的 IP 地址从而允许这些地址访问
  geo $exclusions {
    default 0;
    127.0.0.1 1;
    216.239.32.0/19 1;
    64.233.160.0/19 1;
    66.249.80.0/20 1;
    72.14.192.0/18 1;
    209.85.128.0/17 1;
    66.102.0.0/20 1;
    # ...
  }

  server {
    if ($geoip_country_code = "CH") {
      set $exclusions 1;
    }

    location / {
      # 任何不在 Swiss 的地址，或者不是我们上面列出的 IP，变量值就是 0，就无法访问

      if ($exclusions = "0") {
        return 403;
      }

      proxy_pass http://upstream;
    }
  }
}
```   

## 5.2 隔离应用程序组件提高可扩展性

略。   

## 5.3 反向代理性能调整

### 5.3.1 缓冲数据

NGINX 会尝试在将响应返回给客户端前尽快地从上游读取更多的数据，缓冲在本地，以便能够一次性将响应
发送给客户端。然而，一旦请求或者响应中的任何一部分要写入磁盘中，那么性能就会有下降。因此，下面的
指令在将 NGINX 作为反向代理使用时格外重要：    

- `proxy_buffer_size`: 用来缓冲上游响应第一部分的缓冲区的大小
- `proxy_buffering`: 激活对代理正文的缓冲机制，当关闭这个机制时，只有将 proxy_max_temp_file_size
设为 0，NGINX 会在收到响应后尽快地同步发回给客户端
- `proxy_buffers`: 缓冲区大小
- `proxy_busy_buffers_size`: 也是缓冲区的大小，不是很清楚和上面的区别    

其实貌似缓冲一直都是由两种方案，一种就是在内存中缓冲，另一种是在磁盘上缓冲，一般来说都是现在内存
中缓冲，但是超过配置大小后才会放到磁盘上。   

除了这些命令外，上游服务器可能会通过设置一个 X-Accel-Buffer 首部来影响缓冲策略。默认是 yes，
意味着所有响应会被缓冲。通常 Comet 和 HTTP 流应用会设置为 no，禁止缓冲。    

proxy_buffers 默认值时 8 4k 或者 8 8k（依系统而定）。按 8 4k 算，那就是每个连接时 32k 的
大小。如果可用内存是 768MB，那么当前系统可同时承载的连接数量是 768*1024/42 = 24576。   

### 5.3.2 缓存数据

- `proxy_cache` 为缓存定义一片共享的内存区域
- `proxy_cache_bypass`: 指定一或多个字符串变量，当这些变量非空时，就不会从缓存返回
- `proxy_cache_key`: 指定一个字符串，用来存储和检索缓存值
- `proxy_cache_lock`: 没懂
- `proxy_cache_lock_timeout`: 略
- `proxy_cache_path`: 指定缓存响应存放的目录，以及内存区。可选的参数有：
  + levels: 此参数指定每个级别（1或2）的子目录名称的冒号分隔长度，最多三个深度级别
  + inactive: 缓存删除前的失效时间？
  + max_size: 缓存的大小
  + loader_files: 指定每次加载的缓存文件的数量
  + loader_sleep: cache loader 进程两次遍历时间的间隔
  + loader_threshold: cache loader 每次遍历的时间
- `proxy_cache_use_stale`
- `proxy_cache_valid`

除了 proxy_cache_valid 指令外，还有一系列首部控制了 NGINX 如何缓存响应，这些首部的优先级高于
指令：   

- X-Accel-Expires: 如果是 0，就不能缓存，如果是其他整数值，就是可以缓存的秒数
- Expires 和 Cache-Control 的级别一致
- 如果首部包括了 Set-Cookie，那么响应不会被缓存

### 5.3.4 压缩数据

```
http {
  gzip on;
  gzip_http_version 1.0;
  gzip_comp_level 2;
  gzip_types text/plain text/css application/x-javascript
    text/xml application/xml application/xml+rss text/javascript
    application/javascript application/json;
  gzip_disable msie6;
}
```   