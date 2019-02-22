# 第 2 章 配置指南

<!-- TOC -->

- [第 2 章 配置指南](#第-2-章-配置指南)
  - [2.1 基本的配置格式](#21-基本的配置格式)
  - [2.2 NGINX 全局配置参数](#22-nginx-全局配置参数)
  - [2.3 使用 include 文件](#23-使用-include-文件)
  - [2.4 HTTP 服务器部分](#24-http-服务器部分)
    - [2.4.1 客户端指令](#241-客户端指令)
    - [2.4.2 文件 IO 指令](#242-文件-io-指令)
    - [2.4.3 哈希指令](#243-哈希指令)
    - [2.4.4 Socket 指令](#244-socket-指令)
    - [2.4.5 配置样本](#245-配置样本)
  - [2.5 虚拟服务器部分](#25-虚拟服务器部分)
  - [2.6 位置](#26-位置)
  - [2.7 完整的配置样本](#27-完整的配置样本)

<!-- /TOC -->

NGINX 配置文件遵循非常合理的格式。构建一份配置涉及到指定全局的参数以及各独立部分的特定指令。   

## 2.1 基本的配置格式

基本的 NGINX 配置文件包括几个 sections，每个 section 都是如下划定的：   

```
<section> {
  <directive> <parameters>;
}
```    

特别注意每条指令行都是用分号结尾的，{} 大括号定义了一个新的配置上下文。    

## 2.2 NGINX 全局配置参数

global section 用来配置一些影响整个服务器的参数，它并不满足前面的配置格式。全局部分可以包括配置指令，例如
`user`, `worker_processes`，也可以包括 sections，例如 `events`。全局 section 不需要用
大括号包裹。   

下面的是全局上下文中最重要的一些配置指令：   

- **user**: 配置 worker 进程的用户和用户组，如果省略了用户组，组名等于用户名
- **worker_processes**: 启动几个 worker 进程。这些进程用来处理所有客户端的连接。
- **error_log**: 错误写入到哪里。如果在各个独立的上下文中没有其他定义的 `error_log`，那么这
就是最终会使用的写入位置，第二个参数用来指定写入该日志的日志级别
- **pid**: 主进程的进程 ID 的写入文件
- **use**: 指定使用的连接处理方法。如果使用这条指令，则必须包含在 events 上下文中
- **worker_connections**: 配置一个 worker 进程同时打开的最大的连接的数量，这条指令在反向
代理服务器上非常重要，在操作系统级别可能需要作出一些调整，以便能够达到这个数量（没弄懂）。    

```
user www;

# 负载受 CPU 限制，CPU 为 12 核
worker_processes 12;

error_log /var/log/nginx/error.log;

pid /var/run/nginx.pid;

# events 模块
events {
  use /dev/poll;
  worker_connections 2048;
}
```    

## 2.3 使用 include 文件

配置文件中各处都可以使用 include 来引入其他配置文件。从而提高配置文件的可读性并提高配置文件的可
重用性。   

```
include /opt/local/etc/nginx/mime.types;
```    

可以使用通配符：   

```
include /opt/local/etc/nginx/vhost/*.conf
```    

如果是相对路径，则根据主配置文件位置进行搜索。    

可以使用如下的方式测试配置文件有没有语法错误：   

```cmd
$ nginx -t -c <path-to-nginx.conf>
```    

## 2.4 HTTP 服务器部分

HTTP section 的配置指令都是用来处理 HTTP 连接的。   

### 2.4.1 客户端指令

这部分的指令用来处理客户端连接自身，以及不同类型的客户端：   

- `chunked_transfer_encoding`: 就是那个分块编码，启用或者禁用
- `client_body_buffer_size`: 用来为客户端大于默认的两个内存页请求主体设置缓冲区大小，以
防止临时文件写入磁盘
- `client_body_in_file_only`: 一般只在 debug 的时候或者如果我们对请求主体有后续处理的时候
才会设置为 on，强制把请求主体存到文件里
- `client_body_in_single_buffer`: 强制将整个客户端请求主体放入一个单一的 buffer 中，以减少
复制操作
- `client_body_temp_path`: 存储客户端请求主体的目录
- `client_body_timeout`: 指定客户端主体的连续读取操作之间的时间间隔
- `client_header_buffer_size`: 默认应该是 1KB 大小，感觉这个和上面那个应该只能往大设，不能
往小弄
- `client_header_timeout`: 读取整个首部的时间长度
- `client_max_body_size`: 最大的允许的请求主体大小，如果大了应该是用 413 Request Entity Too
Large 错误进行响应
- `keepalive_disable`: 对特定的浏览器禁用掉 keepalive 请求
- `keepalive_requests`: 在一条 keepalive 连接关闭前最多可以发送多少个请求
- `keepalive_timeout`: 一条 keepalive 连接会保持打开多少时间（话说这个时间是指从连接打开的
时候就开始计时，还是说从上一条双方信息发送后开始计时）。可以设置第二个参数，用来在响应中设置
keepalive 首部
- `large_client_header_buffers`: 一个请求首部的最大数量及尺寸（我觉得这里应该是指一个请求
的首部键值对吧，数量是指键值对数量，大小是一个键值对的大小）
- `msie_padding`: 没弄懂，反正是为了 IE 的配置吧
- `msie_refresh`: 允许发送一个 refresh 而不是一个 redirect 个 MSIE 客户端（why）

貌似是这样，client_body_buffer_size 用来设置一个缓冲区的大小，如果一个请求主体小于这个大小，
就可以直接放到缓冲区中，否则就可以需要把部分内容放置到磁盘上了，当然如果使用了 client_body_in_file_only
就完全禁用掉了缓冲区了。   

### 2.4.2 文件 IO 指令

文件 IO 指令控制了 NGINX 如果分发静态文件，以及如何管理文件描述符。   

- `aio`: 是否启用异步文件 IO。在 FreeBSD 上，可以用 aio 为 sendfile 来预加载数据，在
linux 上由于还必须启用 directio，自动禁用了 sendfile
- `directio`: 为大于给定参数的文件启用操作系统特定的标志或功能。如果在 Linux 上使用 aio，则必须
设置这个选项。
- `directio_alignment`: 为 directio 设置对齐。默认是 512，通常是足够的
- `open_file_cache`: 配置缓存，存储打开文件的描述符以及一些元数据，目录查询以及文件查询错误
- `open_file_cache_errors`: 启用对文件查询错误的缓存
- `open_file_cache_min_uses`: 貌似是这个意思，在 open_file_cache 中配置的 inactive 事件内，
如果达到了这个使用次数，可能就把文件描述符维持在打开状态，那就不会被定时清除掉
- `open_file_cache_valid`: 对 open_file_cache 中的缓存项目进行有效性检查的时间间隔
- `postpone_output`: 指定了发送给客户端的最小的数据量的大小，如果可能的话，在达到这个值之前不会
有东西发送给客户端，有点像网络包里面那种等一段时间看看有没有要携带的数据
- `read_ahead`: 如果可能的话，内核会提前读取文件直到到达 size 设置的大小（话说怎么直到读什么文件啊）
- `sendfile`: 启动 sendfile 功能，直接从一个文件描述符中拷贝数据到另一个
- `sendfile_max_chunk`: 一次 sendfile 调用最大拷贝数据量

下面是摘来的内容：   

正常的系统调用read/write的流程是怎样的呢？   

- 读取：硬盘->内核缓冲区->用户缓冲区;
- 写回：数据会从用户地址空间拷贝到操作系统内核地址空间的页缓存中去，这时write就会直接返回，操作
系统会在恰当的时机写入磁盘。    

这就是传说中的Buffered IO。    

然而对于自缓存应用程序来说，缓存 I/O 明显不是一个好的选择。因此出现了DIRECT IO。然而想象一下，
不经内核缓冲区，直接写磁盘，必然会引起阻塞。所以通常DIRECT IO与AIO会一起出现。   

Linux 2.6 中提供的几种文件访问方式：   

- 标准访问文件的方式：在 Linux 中，这种访问文件的方式是通过两个系统调用实现的：read() 和
write()。当应用程序调用 read() 系统调用读取一块数据的时候，如果该块数据已经在内存中了，那么就
直接从内存中读出该数据并返回给应用程序；如果该块数据不在内存中，那么数据会被从磁盘上读到页高缓存
中去，然后再从页缓存中拷贝到用户地址空间中去。如果一个进程读取某个文件，那么其他进程就都不可以
读取或者更改该文件；对于写数据操作来说，当一个进程调用了 write() 系统调用往某个文件中写数据的
时候，数据会先从用户地址空间拷贝到操作系统内核地址空间的页缓存中去，然后才被写到磁盘上。但是对于
这种标准的访问文件的方式来说，在数据被写到页缓存中的时候，write() 系统调用就算执行完成，并不会
等数据完全写入到磁盘上。Linux 在这里采用的是我们前边提到的延迟写机制（ deferred writes ）。   
- 同步访问文件的方式：同步访问文件的方式与上边这种标准的访问文件的方式比较类似，这两种方法一个
很关键的区别就是：同步访问文件的时候，写数据的操作是在数据完全被写回磁盘上才算完成的；而标准访问
文件方式的写数据操作是在数据被写到页高速缓冲存储器中的时候就算执行完成了。
- 内存映射方式：在很多操作系统包括 Linux 中，内存区域（memory region）是可以跟一个普通的文件
或者块设备文件的某一个部分关联起来的，若进程要访问内存页中某个字节的数据，操作系统就会将访问该
内存区域的操作转换为相应的访问文件的某个字节的操作。Linux 中提供了系统调用 mmap() 来实现这种
文件访问方式。与标准的访问文件的方式相比，内存映射方式可以减少标准访问文件方式中 read() 系统调用
所带来的数据拷贝操作，即减少数据在用户地址空间和操作系统内核地址空间之间的拷贝操作。映射通常适用
于较大范围，对于相同长度的数据来讲，映射所带来的开销远远低于 CPU 拷贝所带来的开销。当大量数据需
要传输的时候，采用内存映射方式去访问文件会获得比较好的效率。
- 异步访问文件的方式：异步 I/O 是 Linux 2.6 中的一个标准特性，其本质思想就是进程发出数据传输
请求之后，进程不会被阻塞，也不用等待任何操作完成，进程可以在数据传输的时候继续执行其他的操作。
相对于同步访问文件的方式来说，异步访问文件的方式可以提高应用程序的效率，并且提高系统资源利用率。
直接 I/O 经常会和异步访问文件的方式结合在一起使用。     


### 2.4.3 哈希指令

hash 指令集控制 NGINX 分配给某些变量多大范围的静态内存。NGINX 会在启动时计算需要的最小量并进行
重新配置。通常我们会在 NGINX 发出一条警报时对 *_hash_max_size 的某个参数进行调整。\*_hash_bucket_size
默认设置为处理器缓存行大小的倍数，以最小化检索条目所需的查找，通常不应更改。    

- `server_names_hash_bucket_size`: 指定用来保存 server_name 的哈希表的桶的大小
- `server_names_hash_max_size`: 指定 server_name 哈希表的最大尺寸
- `types_hash_bucket_size`: 用来保存 types 的哈希表的桶的大小
- `types_hash_max_size`: 指定 types 哈希表的最大尺寸
- `variables_hash_bucket_size`: 指定用来保存其余变量的桶的大小
- `variable_hash_max_size`: 指定保存其他变量的哈希表的最大尺寸

### 2.4.4 Socket 指令

- `lingering_close`: 指定一个客户端连接如何维持打开状态以便接收更多的数据
- `lingering_time`: 对于带有 `lingering_close` 指令的连接，该指令会指定一条客户端连接会保持
打开状态多久
- `lingering_timeout`: 同样对于带有 `lingering_close` 指令的连接，该指令指定在关闭一条
连接前会等待额外的数据多久
- `reset_timeout_connection`: 启用该指令后，超时的连接会被立即重置，释放掉所有相关的内存。
默认是将 socket 保持在 FIN_WAIT1 状态
- `send_lowat`: 如果 nonzero，NGINX 会最小化给客户端套接字的发送操作，在 Linux, Wins 上
被忽略
- `send_timeout`: 为两次连续写操作设置一个超时时间
- `tcp_nodelay`: 为 keepalive 连接启用 TCP_NODELAY 选项
- `tcp_nopush`: 命令仅在使用了 sendfile 时相关。尝试在一个包中发送响应首部，以及在所有的包
中发送一个文件

### 2.4.5 配置样本

```
http {
  include             /opt/local/etc/nginx/mime.types;
  default_type        application/octet-stream;
  sendfile            on;
  tcp_nopush          on;
  tcp_nodelay         on;
  keepalive_timeout   65;
  server_names_hash_max_size 1024;
}
```

## 2.5 虚拟服务器部分

任何以 `server` 关键字开始的上下文都被认为是一个虚拟服务器 section。其描述了将在不同 server_name
指令下分发的一组资源的逻辑分离。这些虚拟服务器会对 HTTP 请求做出响应，并且 server 是包含在
http section 中的。        

一个虚拟服务器由 listen 和 server_name 指令联合定义（其实就是服务器名及其对应的IP地址和端口
号）。listen 指令定义了 IP 地址和端口的组合，或者是一个 UNIX-domain 套接字的路径：   

```
listen address[:port];
listen port;
listen unix:path;
```   

listen 指令唯一地标识出了 NGINX 中的一个 socket 绑定。   

下面是一些 `listen` 的可选参数：   

- `default_server`: 将地址/端口定义为此处绑定的请求的默认值（其实意思这个虚拟服务器就充当这台
物理服务器上 NGINX 中的一个默认服务器吧，比如是请求中没有出现请求的主机名，可能就直接交给 listen
指令有 default_server 参数的主机）
- `setfib`: 为 socket 设置对应的 FIB，仅 FreeBSD 支持
- `backlog`: 在 `listen()` 调用中设置 `backlog` 参数，FreeBSD 默认为 -1，其他平台默认为511
- `rcvbuf`: 设置 socket 的 `SO_RCVBUF`
- `sndbuf`: 设置 socket 的 `SO_SNDBUF`
- `accept_filter`: 为 dataready 或 httpready 的 accept 过滤器设置名称（仅在 FreeBSD 可用）
- `deferred`: 使用 `accept()` 调用设置 TCP_DEFER_ACCEPT
- `bind`: 为地址/端口对进行一次分离的 `bind()` 调用
- `ipv6only`: 设置 IPV6_ONLY 参数的值，仅在新启动时支持，并且不支持 UNIX-domain sockets
- `ssl`: 指定该端口仅使用 HTTPS 连接
- `so_keepalive`: 为监听 socket 配置 TCP keepalive

server_name 默认值是 ""，意味着不包含 server_name 指令的 server section 会匹配一个没有
设置 Host 首部的请求。    

除了常规的字符串，server_name 还支持通配符：   

- 子域：`*.example.com`
- 顶级域：`www.example.*`
- 特定形式会匹配子域和域名本身 `.example.com`（匹配 `*.example.com` 和 `example.com`）    

甚至可以设置正则表达式，只要前缀一个 ~。   

```
server_name ~^www\.example\.com$;
server_name ~^www(\d+).example\.(com)$;
```    

很明显，后者使用了正则捕获，可以使用 $1, $2 等在后续的指令中进行引用。   

NGINX 会使用下面的逻辑来决定哪个虚拟服务器该为请求提供服务:   

1. 匹配 `listen` 指令的 IP 地址和端口
2. 将 `server_name` 指令值看成一个字符串与Host 首部匹配
3. 将 `server_name` 指令值在开头部分带有通配符的与 Host 首部匹配
4. 将 `server_name` 指令值在结尾部分带有通配符的与 Host 首部匹配
5. 将 `server_name` 看成一个正则后与 Host 首部进行匹配
6. 如果 Host 匹配失败，直接指向标记为 `default_server` 的 `listen` 指令
7. 如果 Host 匹配失败并且没有 `default_server`，直接指向第一步中的 listen 指令的第一台服务器   

## 2.6 位置

虚拟服务器 section 可以包含 `location` 指令，表明一个来自客户端或者来自内部重定向的 URI。
locations 可以嵌套，但有一些需要注意的地方。    

```
location [modifier] uri {...}
location @name {...}
```   

name location 仅可以从一个内部重定向到达（因为它压根没有定义进行匹配的 URI）。它保留了进入
location 块之前的 URI。并且只在 server 上下文中可以定义。   

modifier 通过以下的方式影响 location 的处理：    

- `=`: 使用精确匹配并中止搜索
- `~`: 使用大小写敏感的的正则表达式匹配
- `~*`: 使用大小写不敏感的正则表达式匹配
- `^~`: 如果这是最精确的匹配，则此修饰符会在检查正则表达式匹配此位置的字符串之前停止处理    

当接收到请求时，一个 URI 会按照如下的方式检查 location:   

+ 不包括正则的 locations 会进行精确匹配，独立于它们的定义顺序（那有点类似于默认带 = 修饰符，但是
不会在匹配后中止搜索）
+ 正则按照在配置文件中找到它们的顺序进行匹配。正则搜索会在第一次匹配后中止   

话说那找到匹配的不带正则的 locations 后，以及一个带正则的 location，然后呢，怎么选择最匹配的啊。   

这个描述的匹配是针对解码过后的 URIs：例如，URI 中的 "%20" 会和 location 中的 " "(空格)匹配。   

location 中可以包括以下的指令：   

- `alias`: 该指令为 location 定义了别名。如果 location 使用了正则，则 alias 应该引用正则
中定义的捕获。`alias` 指令会替换掉 URI 中由 location 匹配的部分，以便URI 中未匹配的部分能够
用来在搜索在文件系统中的位置。
- `internal`: 指定一个只能被内部请求使用的 location
- `limit_except`: 限制 location 的 HTTP 动词   

另外，许多 http section 的指令，也可以用在 location 中。   

这里要特别提到 `try_files` 指令，它也可以用早 server 上下文中，但是大部分出现在 location 中。
就像名字暗示的那样，其按照给定参数按序搜索文件，找到第一个匹配的即可。常用来从一个变量匹配潜在的文件，
然后将处理权转交给一个命名的 location：   

```
location / {
  try_files $uri $uri/ @mongrel;
}

location @mongrel {
  proxy_pass   http://appserver;
}
```   

除以下场景外，location 是可以嵌套的：   

- 前缀为 =
- location 是命名 location    

最佳实践是将正则 location 嵌套在基于字符串的 location 中：   

```
location / {
  location ^~ /css {
    location ~* /css/.*\css$ {

    }
  }
}
```

## 2.7 完整的配置样本

```
user www;

work_processes  12;

error_log   /var/log/nginx/error.log;

pid /var/run/nginx.pid;

events {
  use  /dev/poll;
  worker_connections  2048;
}

http {
  include   /opt/local/etc/nginx/mime.types;

  default_type    application/octet-stream;

  sendfile   on;

  tcp_nopush    on;
  
  tcp_nodelay on;

  keepalive_timeout   65;

  server_names_hash_max_size  1024;

  server {
    listen  80;
    
    return 444;
  }

  server {
    listen 80;

    server_name  www.example.com;

    location / {
      try_files $uri $uri/ @mongrel;
    }

    location @mongrel {
      proxy_pass http://127.0.0.1:8080;
    }
  }
}
```   