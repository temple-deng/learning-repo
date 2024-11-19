# Nginx 高性能 Web 服务器详解

<!-- TOC -->

- [Nginx 高性能 Web 服务器详解](#nginx-高性能-web-服务器详解)
- [第 1 章 Nginx 初探](#第-1-章-nginx-初探)
  - [1.2 常见服务器产品介绍](#12-常见服务器产品介绍)
  - [1.3 Nginx 的功能特性](#13-nginx-的功能特性)
    - [1.3.1 基本 HTTP 服务](#131-基本-http-服务)
    - [1.3.2 高级 HTTP 服务](#132-高级-http-服务)
    - [1.3.3 邮件代理服务](#133-邮件代理服务)
  - [1.4 常用功能介绍](#14-常用功能介绍)
    - [1.4.2 负载均衡](#142-负载均衡)
    - [1.4.3 Web 缓存](#143-web-缓存)
- [第 2 章 Nginx 服务器的安装部署](#第-2-章-nginx-服务器的安装部署)
  - [2.2 安装 Nginx 服务器和基本配置](#22-安装-nginx-服务器和基本配置)
    - [2.2.3 Linux 版本的编译和安装：Nginx 软件的自动脚本](#223-linux-版本的编译和安装nginx-软件的自动脚本)
    - [2.2.4 Linux 版本的编译和安装：Nginx 源代码的编译和安装](#224-linux-版本的编译和安装nginx-源代码的编译和安装)
  - [2.3 Nginx 服务的启停控制](#23-nginx-服务的启停控制)
    - [2.3.1 Nginx 服务的信号控制](#231-nginx-服务的信号控制)
    - [2.3.2 Nginx 服务的启动](#232-nginx-服务的启动)
    - [2.3.3 Nginx 服务的停止](#233-nginx-服务的停止)
    - [2.3.4 Nginx 服务的重启](#234-nginx-服务的重启)
    - [2.3.5 Nginx 服务器的升级](#235-nginx-服务器的升级)
  - [2.4 Nginx 服务器基础配置指令](#24-nginx-服务器基础配置指令)
    - [2.4.1 nginx.conf 文件的结构](#241-nginxconf-文件的结构)
    - [2.4.2 配合运行 Nginx 服务器的用户（组）](#242-配合运行-nginx-服务器的用户组)
    - [2.4.3 配置允许生成的 worker process 数](#243-配置允许生成的-worker-process-数)
    - [2.4.4 配置 Nginx 进程 PID 存放路径](#244-配置-nginx-进程-pid-存放路径)
    - [2.4.5 错误日志的存放路径](#245-错误日志的存放路径)
    - [2.4.6 配置文件的引入](#246-配置文件的引入)
    - [2.4.7 设置网络连接的序列化](#247-设置网络连接的序列化)
    - [2.4.8 设置是否允许同时接收多个网络连接](#248-设置是否允许同时接收多个网络连接)
    - [2.4.9 事件驱动模型的选择](#249-事件驱动模型的选择)
    - [2.4.10 配置最大连接数](#2410-配置最大连接数)
    - [2.4.11 定义 MIME-Type](#2411-定义-mime-type)
    - [2.4.12 自定义服务日志](#2412-自定义服务日志)
    - [2.4.13 配置允许 sendfile 方式传输文件](#2413-配置允许-sendfile-方式传输文件)
    - [2.4.14 配置连接超时时间](#2414-配置连接超时时间)
    - [2.4.16 配置网络监听](#2416-配置网络监听)
    - [2.4.17 基于名称的虚拟主机配置](#2417-基于名称的虚拟主机配置)
    - [2.4.18 基于 IP 的虚拟主机配置](#2418-基于-ip-的虚拟主机配置)
    - [2.4.19 配置 location 块](#2419-配置-location-块)
    - [2.4.20 配置请求的根目录](#2420-配置请求的根目录)
    - [2.4.21 更改 location 的 URI](#2421-更改-location-的-uri)
    - [2.4.22 设置网站的默认首页](#2422-设置网站的默认首页)
    - [2.4.23 设置网站的错误页面](#2423-设置网站的错误页面)
    - [2.4.24 基于 IP 配置 Nginx 的访问权限](#2424-基于-ip-配置-nginx-的访问权限)
    - [2.4.25 基于密码配置 Nginx 的访问权限](#2425-基于密码配置-nginx-的访问权限)

<!-- /TOC -->

# 第 1 章 Nginx 初探

## 1.2 常见服务器产品介绍

Apache 在设计时使用了以“进程”为基础的结构。进程要比线程消耗更多的系统开支，这导致 Apache 在多
处理器环境中性能有所下降。因此，在对一个 Apache 站点进行扩容时，通过是增加服务器或扩充集群节点
而不是增加处理器。   

Tomcat 是 Sun 公司官方推荐的 Servlet 和 JSP 容器，在中小型系统和并发访问用户不是很多的场合
下，其作为轻量级应用服务器，被广泛地使用。   

在一般的应用中，Tomcat 常作为 Apache 的扩展部分，为运行 JSP 页面和 Servlet 提供服务，独立的
Servlet 容器是 Tomcat 的默认模式。   

写书的时候 NGINX 稳定版 1.2.3。但是摘抄时已经是 1.15.8。   

## 1.3 Nginx 的功能特性

Nginx 可以作为 HTTP 服务器，也可以作为反向代理服务器或者邮件服务器；能够快速响应静态页面的请求；
支持 FastCGI、SSL、Virtual Host、URL Rewrite、HTTP Basic Auth、Gzip 等大量实用功能，
并且支持更多的第三方功能模块的扩展。    

我们将 Nginx 提供的基本功能服务从大体上归纳为基本 HTTP 服务、高级 HTTP 服务和邮件服务等三大类。   

- Nginx 提供基本 HTTP 服务，可以作为 HTTP 代理服务器和反向代理服务器，支持通过缓存加速访问，
可以完成简单的负载均衡和容器，支持包过滤功能，支持 SSL 等。
- Nginx 提供高级 HTTP 服务，可以进行自定义配置，支持虚拟主机，支持 URL 重定向，支持网络监控，
支持流媒体传输等
- Nginx 作为邮件代理服务器时最早开发这个产品的目的之一，它支持 IMAP/POP3 代理服务功能，支持
内部 SMTP 代理服务功能。    

### 1.3.1 基本 HTTP 服务

在 Nginx 提供的基本 HTTP 服务中，主要包含以下功能特性：   

- 处理静态文件；处理索引文件以及支持自动索引
- 打开并自行管理文件描述符缓存
- 提供反向代理服务，并且可以使用缓存加速反向代理，同时完成简单负载均衡以及容错
- 提供远程 FastCGI 服务的缓存机制，加速访问，同时完成简单负载均衡以及容错
- 使用 Nginx 模块化特性提供过滤器功能。Nginx 基本过滤器包括 gzip 压缩、ranges 支持、chunked
响应、XSLT、SSI 以及图像缩放等。其中，针对包含多个 SSI 的页面，经由 FastCGI 或反向代理，SSI
过滤器可以并行处理
- 支持 SSL    

### 1.3.2 高级 HTTP 服务

- 支持基于名字和 IP 的虚拟主机设置
- 支持 HTTP1.0 的 Keep-Alive 和 Pipeline 模式
- 支持重新加载配置以及在线升级时，无须中断正在处理的请求
- 自定义访问日志格式、带缓存的日志写操作以及快速日志轮转
- 提供 3xx-5xx 错误代码重定向功能
- 支持重写（Rewrite）模块扩展
- 支持 HTTP DAV 模块，从而为 HTTP WebDAV 提供 PUT、DELETE、MKCOL、COPY 以及 MOVE 方法
- 支持 FLV 流和 MP4 流传输
- 支持网络监控，包括基于客户端 IP 地址和 HTTP 基本认证机制的访问控制、速度限制、来自同一地址的
同时连接数或请求数限制等
- 支持嵌入 Perl 语言

### 1.3.3 邮件代理服务

- 支持使用外部 HTTP 认证服务器重定向用户到 IMAP/POP3 后端，并支持 IMAP 认证方式和 POP3 认证
方式
- 支持使用外部 HTTP 认证服务器认证用户后重定向连接到内部 SMTP 后端，并支持 SMTP 认证方式
- 支持邮件代理服务器下的 SSL
- 支持纯文本通信协议的扩展协议 STARTTLS    

## 1.4 常用功能介绍

### 1.4.2 负载均衡

负载均衡，一般包含两方面的含义。一方面是，将单一的重负载分担到多个网络节点上做并行处理，每个节点
处理结束后将结果汇总返回给用户，这样可以大幅提供网络系统的处理能力；第二个方面的含义是，将大量的
前端并发访问或数据流量分担到多个后端网络节点上分别处理，这样可以有效减少前端用户等待响应时间。Web
服务器、FTP 服务器的负载均衡问题，基本隶属于后一方面的含义。因此，Nginx 服务器的负载均衡主要是
对大量前端访问和流量进行分流，以保证前端用户访问效率。    

Nginx 服务器的负载均衡策略可以划分为两大类：即内置策略和扩展策略。内置策略主要包括轮询、加权轮询
和 IP hash 三种；扩展策略主要通过第三方模块实现，常见的有 url hash、fair 等。    

在默认情况下，内置策略会被编译进 Nginx 内核，使用时只需要在 Nginx 服务器配置中设置相关参数即可，
扩展策略不会编译进内核，需要手动将第三方模块编译进内核。   

轮询策略比较简单，就是将每个前端请求按顺序（时间顺序或者排列次序）逐一分配到不同的后端节点上，对于
出现问题的后端节点自动排除。加权轮询策略，在基本的轮询策略上考虑各后端节点接受请求的权重，指定各
后端节点被轮询到的几率。    

IP hash 策略，是将前端的访问 IP 进行 hash 操作，然后根据 hash 结果将请求分配给不同的后端节点。
事实上，这种策略可以看做是一种特殊的轮询策略。通过 Nginx 的实现，每个前端访问 IP 会固定访问一个
后端节点。这样做的好处是避免考虑前端用户的 session 在后端多个节点上共享的问题。   

扩展策略中的 url hash 在形式上与 IP hash 相近，不同之处在于，IP hash 策略是对前端访问 IP 进行
了 hash 操作，而 url hash 策略是对前端请求的 url 进行了 hash 操作。url hash 策略的优点在于，
如果后端有缓存服务器，它能够提高缓存效率。    

扩展的第三方模块 fair 则是从另一个角度来实现 Nginx 负载均衡策略的。该模块将前端请求转发到一个
最近负载最小的后台节点。那么负载最小怎么判断呢？Nginx 通过对后端节点请请求的响应时间来判断负载
情况。响应时间短的节点负载相对就轻。    

### 1.4.3 Web 缓存

Nginx 服务器的缓存服务器主要由 Proxy_Cache 相关指令集合 FastCGI_Cache 相关指令集构成。其中，
Proxy_Cache 主要用于在 Nginx 服务器提供反向代理服务时，对后端源服务器的返回内容进行 URL 缓存；
FastCGI_Cache 主要对 FastCGI 的动态程序进行缓存。另外还有一款常用的第三方模块 ngx_cache_purge
也是常用的，用于清除 Nginx 服务器上指定的 URL 缓存。    

# 第 2 章 Nginx 服务器的安装部署

## 2.2 安装 Nginx 服务器和基本配置

### 2.2.3 Linux 版本的编译和安装：Nginx 软件的自动脚本

解压 Nginx tar 包，得到以下内容：   

```
-rw-r--r-- 1 1001 1001 294414 Dec 25 14:53 CHANGES
-rw-r--r-- 1 1001 1001 449169 Dec 25 14:53 CHANGES.ru
-rw-r--r-- 1 1001 1001   1397 Dec 25 14:53 LICENSE
-rw-r--r-- 1 root root    376 Feb  2 07:55 Makefile
-rw-r--r-- 1 1001 1001     49 Dec 25 14:53 README
drwxr-xr-x 6 1001 1001   4096 Feb  2 05:16 auto/
drwxr-xr-x 2 1001 1001   4096 Feb  2 05:16 conf/
-rwxr-xr-x 1 1001 1001   2502 Dec 25 14:53 configure*
drwxr-xr-x 4 1001 1001   4096 Feb  2 05:16 contrib/
drwxr-xr-x 2 1001 1001   4096 Feb  2 05:16 html/
drwxr-xr-x 2 1001 1001   4096 Feb  2 05:16 man/
drwxr-xr-x 3 root root   4096 Feb  2 07:56 objs/
drwxr-xr-x 9 1001 1001   4096 Feb  2 05:16 src/
```   

- src 目录存放了 Nginx 的源码
- man 目录存放了帮助文档
- html 目录存放了两个 html 文件
- conf 目录存放了配置文件，包含 Nginx 服务器的基本配置文件和对部分特性的配置文件。
- auto 目录存放了大量脚本文件，和 configure 脚本程序有关
- 运行 configure 自动脚本一般会完成两项工作：一是检查环境，根据环境检查结果生成 C 代码；二是
生成编译代码需要的 Makefile 文件

### 2.2.4 Linux 版本的编译和安装：Nginx 源代码的编译和安装

查看 Nginx 的安装目录：   

```
root@ef843db3fbcd:/usr/local/nginx# ll -h *
conf:
total 76K
drwxr-xr-x 2 root root 4.0K Feb  2 07:56 ./
drwxr-xr-x 6 root root 4.0K Feb  2 07:56 ../
-rw-r--r-- 1 root root 1.1K Feb  2 07:56 fastcgi.conf
-rw-r--r-- 1 root root 1.1K Feb  2 07:56 fastcgi.conf.default
-rw-r--r-- 1 root root 1007 Feb  2 07:56 fastcgi_params
-rw-r--r-- 1 root root 1007 Feb  2 07:56 fastcgi_params.default
-rw-r--r-- 1 root root 2.8K Feb  2 07:56 koi-utf
-rw-r--r-- 1 root root 2.2K Feb  2 07:56 koi-win
-rw-r--r-- 1 root root 5.2K Feb  2 07:56 mime.types
-rw-r--r-- 1 root root 5.2K Feb  2 07:56 mime.types.default
-rw-r--r-- 1 root root 2.6K Feb  2 07:56 nginx.conf
-rw-r--r-- 1 root root 2.6K Feb  2 07:56 nginx.conf.default
-rw-r--r-- 1 root root  636 Feb  2 07:56 scgi_params
-rw-r--r-- 1 root root  636 Feb  2 07:56 scgi_params.default
-rw-r--r-- 1 root root  664 Feb  2 07:56 uwsgi_params
-rw-r--r-- 1 root root  664 Feb  2 07:56 uwsgi_params.default
-rw-r--r-- 1 root root 3.6K Feb  2 07:56 win-utf

html:
total 16K
drwxr-xr-x 2 root root 4.0K Feb  2 07:56 ./
drwxr-xr-x 6 root root 4.0K Feb  2 07:56 ../
-rw-r--r-- 1 root root  494 Feb  2 07:56 50x.html
-rw-r--r-- 1 root root  612 Feb  2 07:56 index.html

logs:
total 8.0K
drwxr-xr-x 2 root root 4.0K Feb  2 07:56 ./
drwxr-xr-x 6 root root 4.0K Feb  2 07:56 ../

sbin:
total 5.1M
drwxr-xr-x 2 root root 4.0K Feb  2 07:56 ./
drwxr-xr-x 6 root root 4.0K Feb  2 07:56 ../
-rwxr-xr-x 1 root root 5.0M Feb  2 07:56 nginx*
```   

Nginx 服务器的安装目录中主要包括了 conf, html, logs, sbin 等 4 个目录。    

其中，conf 目录存放了 Nginx 的所有配置文件。其中，nginx.conf 文件是 Nginx 服务器的主配置文件，
其他配置文件是用来配置 Nginx 的相关功能的，比如，配置 fastcgi 使用的 fastcgi.conf 和 fastcgi_params
两个文件。在此目录下，所有的配置文件都提供了以 .default 结尾的默认配置文件，方便我们将配置过的
.conf 文件恢复到初始状态。   

## 2.3 Nginx 服务的启停控制

### 2.3.1 Nginx 服务的信号控制

在 Nginx 服务的启停办法中，有一类是通过信号机制来实现的。Nginx 服务在运行时，会保持一个主进程和
一个或多个 worker process。我们通过给 Nginx 服务的主进程发送信号就可以控制服务的启停了。   

获取主进程 PID 有两个途径。一个是，在 Nginx 服务启动后，默认在 Nginx 服务器安装目录下的 logs
目录中会产生文件名为 nginx.pid 的文件，此文件中保存的就是主进程的 PID。另一种就是使用了 ps 了。   

Nginx 服务主进程能够接收的信号如下：   

- TERM 或 INT: 快速停止 Nginx 服务
- QUIT: 平缓停止 Nginx 服务
- HUP: 使用新的配置文件启动进程，之后平缓停止原有进程，也就是所谓的“平滑重启”
- USR1: 重新打开日志文件，常用于日志切割
- USR2: 使用新版本的 Nginx 文件启动服务，之后平缓停止原有 Nginx 进程
- WINCH: 平缓停止 worker process，用于 Nginx 服务器平滑升级   

向 Nginx 主进程发送信号也有两种方法，一种是使用 nginx 二进制文件，另一种是使用 kill 命令。   

### 2.3.2 Nginx 服务的启动

在 Linux 平台下，启动 Nginx 服务器直接运行安装目录下 sbin 目录下的二进制文件即可：   

```cmd
root@ef843db3fbcd:/usr/local/nginx/sbin# ./nginx -h
nginx version: nginx/1.15.8
Usage: nginx [-?hvVtTq] [-s signal] [-c filename] [-p prefix] [-g directives]

Options:
  -?,-h         : this help
  -v            : show version and exit
  -V            : show version and configure options then exit
  -t            : test configuration and exit
  -T            : test configuration, dump it and exit
  -q            : suppress non-error messages during configuration testing
  -s signal     : send signal to a master process: stop, quit, reopen, reload
  -p prefix     : set prefix path (default: /usr/local/nginx/)
  -c filename   : set configuration file (default: conf/nginx.conf)
  -g directives : set global directives out of configuration file
```    

启动的时候可能会遇到 `getpwnam("www") failed` 错误，原因是没有 www 这个用户和用户组：    

```cmd
$ sudo groupadd www
$ sudo useradd -g www www
```   

### 2.3.3 Nginx 服务的停止

停止 Nginx 服务有两种方法：一种是快速停止；一种是平缓停止。快速停止是指立即停止当前 Nginx 服务
正在处理的所有网络请求，马上丢弃连接，停止工作；平缓停止时指允许 Nginx 服务将当前正在处理的网络
请求完成，但不再接收新的请求，之后关闭连接，停止工作。   

```
./nginx -g TERM | INT | QUIT
```    

或者：   

```
kill TERM | INT | QUIT `{nginx_path}/logs/nginx.pid`
```    

### 2.3.4 Nginx 服务的重启

更改 Nginx 服务器的配置和加入新模块后，如果希望当前的 Nginx 服务应用新的配置或使新模块生效，就
需要重启 Nginx 服务。    

平滑重启是这样的一个过程：Nginx 服务进程接收到信号后，首先读取新的 Nginx 配置文件，如果配置语法
正确，则启动新的 Nginx 服务，然后平缓关闭旧的服务进程；如果新的 Nginx 配置有问题，将显示错误，
仍然使用旧的 Nginx 进程提供服务。   

```
./nginx -g HUP [-c newConfFile]
```   

或者使用的配置文件代替了旧的配置文件：   

```
kill HUP `{nginx_path}/logs/nginx.pid`
```   

### 2.3.5 Nginx 服务器的升级

平滑升级的过程如下：Nginx 服务接收到 USR2 信号后，首先将旧的 nginx.pid 文件添加后缀 .oldbin，
然后执行新版本 Nginx 服务器的二进制文件启动服务。如果新的服务启动成功，系统中将有新旧两个 Nginx
服务共同提供 Web 服务。之后，需要向旧的 Nginx 服务进程发送 WINCH 信号，使旧的 Nginx 服务平滑
停止，并删除 nginx.pid.oldbin 文件。   

## 2.4 Nginx 服务器基础配置指令

### 2.4.1 nginx.conf 文件的结构

1. 全局块    

全局块是默认配置文件从开始到 events 块之间的一部分内容。通常包括配置运行 Nginx 服务器的用户（组）、
允许生成的 worker process 数、Nginx 进程 PID 存放路径、日志的存放路径和类型以及配置文件引入等。   

2. events 块   

events 块涉及的指令主要影响 Nginx 服务器与用户的网络连接。常用到的设置包括是否开启对多 worker
process 下的网络连接进行序列化，是否允许同时接收多个网络连接，选取哪种事件驱动模型处理连接请求，
每个 worker process 可以同时支持的最大连接数。   

3. http 块   

http 块可以包含自己的全局块，也可以包含 server 块，server 块中也可以进一步包含 location 块。
可以在 http 全局块中配置的指令包括文件引入、MIME-Type 定义、日志自定义、是否使用 sendfile
传输文件、连接超时时间、单连接请求数上限等。   

4. server 块   

server 块和虚拟主机有密切关系。    

虚拟主机技术是为了节省互联网硬件成本出现的。这里的“主机”是由实体的服务器延伸而来，硬件系统可以基于
服务器群或者单个服务器等。虚拟主机技术主要应用于 HTTP、FTP 及 EMAIL 等多项服务，将一台服务器的
某项或者全部服务内容逻辑划分为多个服务单位，对外表现为多个服务器，从而充分利用服务器硬件资源。从
用户角度来看，一台虚拟主机和一台独立的硬件主机是完全一样的。   

在使用 Nginx 服务器提供 Web 服务时，利用虚拟主机的技术就可以避免为每一个要运行的网站提供单独的
Nginx 服务器，也无需为每个网站对应一组 Nginx 进程。虚拟主机使得 Nginx 服务器可以在同一台服务器
上只运行一组 Nginx 进程，就可以运行多个网站。   

每个 server 块就相当于一台虚拟主机，它内部可有多台主机联合提供服务，一起对外提供在逻辑上关系密切
的一组服务。   

5. location 块    

这些 location 块的主要作用是，基于 Nginx 服务器接收到的请求字符串，对除虚拟主机名称（也可以是
IP 别名）之外的字符串进行匹配，对特定的请求进行处理。   

### 2.4.2 配合运行 Nginx 服务器的用户（组）

```
user userName [group];
```    

只有被设置的用户或者用户组成员才有权限启动 Nginx 进程。   

如果希望所有用户都可以启动 Nginx 进程，有两种办法，一种是将 user 指令注释掉，另一种是将用户
设置为 nobody:   

```
user nobody nobody
```   

### 2.4.3 配置允许生成的 worker process 数

```
worker_processes number | auto;
```   

auto 值 Nginx 将自动检测。   

### 2.4.4 配置 Nginx 进程 PID 存放路径

```
pid file;
```   

可以是绝对路径，以可以是以 Nginx 安装目录为根目录的相对路径。   

### 2.4.5 错误日志的存放路径

```
error_log file | stderr [debug | info | notice | warn | error | crit | alert | emerg];
```   

日志的级别是可选项。   

### 2.4.6 配置文件的引入

```
include file;
``` 

此指令可以放在配置文件的任意地方。   

### 2.4.7 设置网络连接的序列化

Nginx 配置中包含了这样一条指令 accept_mutex，当其设置为开启的时候，将会对多个 Nginx 进程接收
连接进行序列化，防止多个进程对连接的争抢：   

```
accept_mutex on | off;
```   

默认是开启状态，只能在 events 块中进行配置。   

### 2.4.8 设置是否允许同时接收多个网络连接

每个 Nginx 服务器的 worker process 都有能力同时接收多个新到达的网络连接：   

```
multi_accpet on | off;
```   

默认为 off 状态，即每个 worker process 一次只能接收一个新到达的网络连接。指令只能在 events
块中进行配置。   

### 2.4.9 事件驱动模型的选择

Nginx 服务器提供了多种事件驱动模型来处理网络消息：   

```
use method;
```  

method 可选的值有：select, poll, kqueue, epoll, rtsig, /dev/poll 以及 eventport。    

### 2.4.10 配置最大连接数

指令 worker_connections 主要用来设置允许每一个 worker process 同时开启的最大连接数：  

```
worker_connections number;
```   

只能在 events 中配置。   

### 2.4.11 定义 MIME-Type

在默认的 Nginx 配置文件中，可以看到 http 全局块有以下两行配置：   

```
include mime.types;
default_type application/octet-stream;
```   

第一行引入了 mime.types 配置文件：   

```
cat mime.types
types {
  text/html       html htm shtml;
  ...
  image/gif       gif;
  ...
  application/javascript  js;
  ...
  audio/midi    mid midi kar;
  ...
  video/3gpp    3gpp 3gp;
  ...
}
```    

types 结构中包含了浏览器能够识别的 MIME 类型以及对应于相关类型的文件后缀名。    

### 2.4.12 自定义服务日志

Nginx 服务器支持对服务日志的格式、大小、输出等进行配置，需要使用两个指令，分别是 access_log 和
log_format 指令。   

```
access_log path[format[buffer=size]];
```    

- path: 配置服务日志的文件存放的路径和名称
- format: 可选项自定义格式字符串，也可以通过“格式串的名称”使用 log_format 指令定义好的格式。
- size: 配置临时存放日志的内存缓存区大小    

access_log 可在 http, server 或者 location 中进行设置，默认是 `access_log logs/access.log combined;`。   

log_format 专门用于定义服务日志的格式，并且可以为格式字符串定义一个名字，以便 access_log 指令
直接调用：   

```
log_format name string ...;
```   

- name: 格式字符串的名字，默认的名字是 combined
- string: 在定义的过程中，可以使用 Nginx 配置预设的一些变量获取相关内容，变量的名称使用双引号
括起来，string 整体使用单引号括起来。   

### 2.4.13 配置允许 sendfile 方式传输文件

```
sendfile on | off;
```   

可以在 http 块、server 块或者 location 块中进行配置。    

```
sendfile_max_chunk size;
```  

其中，size 如果大于 0，Nginx 进程的每个 worker process 每次调用 sendfile() 传输的数据量
最大不能超过这个值，如果为 0，则无限制，可以在 http, server, location 中配置。   

### 2.4.14 配置连接超时时间

```
keepalive_timeout timeout[header_timeout];
```   

- timeout: 服务器端对连接的保持时间，默认 75s
- header_timeout: 可选项，在应答报文头部的 Keep-Alive 域设置超时时间 'Keep-Alive: timeout=header_timeout'   

指令可以在 http, server, location 块中配置。   

### 2.4.16 配置网络监听

listen 配置方法主要有三种，第一种配置监听的 IP 地址：   

```
listen address[:port] [default_server] [setfib=number] [backlog=number] [rcvbuf=size]
  [sndbuf=size] [deferred]
  [accept_filter=filter] [bind] [ssl];
```   

第二种配置监听端口：   

```
listen port [default_server] [setfib=number] [backlog=number] [rcvbuf=size]
  [sndbuf=size] [accept_filter=filter]
  [deferred] [bind] [ipv6only=on|off] [ssl];
```   

第三种配置 UNIX Domain Socket：   

```
listen unix:path [default_server] [backlog=number] [rcvbuf=size]
  [sndbuf=size] [accept_filter=filter]
  [deferred] [bind] [ssl];
```    

- address: IP 地址，如果是 IPV6 的地址，使用中括号 \[\] 括起来
- port: 端口号，如果只定义了 IP 地址，默认使用 80 
- path: socker 文件路径
- default_server: 标识符，将此虚拟主机设置为 address:port 的默认主机
- setfib=number: 使用这个变量为监听 socket 关联路由表，只对 FreeBSD 有用
- backlog=number: 设置监听函数 listen() 最多允许多少网络连接同时处于挂起状态，在FreeBSD中
默认为 -1，其他平台默认为 511.
- deferred: 标识符，将 accept() 设置为 Deferred 模式
- accept_filter=filter: 设置监听端口对请求的过滤，被过滤的内容不能被接收和处理
- bind: 标识符，使用独立的 bind() 处理此 address:port，一般情况下，对于端口相同而 IP 地址
不同的多个连接，Nginx 服务器将只用一个监听命令，并使用 bind() 处理端口相同的所有连接。   
- ssl: 标识符，设置会话连接使用 SSL 模式进行    

### 2.4.17 基于名称的虚拟主机配置

配置主机名称的指令为 server_name:   

```
server_name name ...;
```   

对于 name 来说，可以只有一个名称，也可以由多个名称并列，之间用空格隔开。每个名字就是一个域名，
由两段或者三段组成，之间由点号 . 隔开：   

```
server_name myserver.com www.myserver.com;
```  

在 name 中可以使用通配符 *，但通配符只能用在三段字符串组成的名称的首段或尾段，或者由两段字符串
组成的名称的尾段，如：   

```
server_name *.myserver.com www.myserver.*;
```   

在 name 中可以使用正则表达式，并使用波浪号 ~ 作为正则表达式字符串的开始标记：   

```
server_name ~^www\d+\.myserver\.com$;
```    

由于 server_name 指令支持使用通配符和正则表达式两种配置名称的方式，因此在包含有多个虚拟主机的
配置文件中，可能会出现一个名称被多个虚拟主机的 server_name 匹配成功，具体请求交给那个主机的规定
如下：   

- 对于匹配方式不同的，按照以下的优先级选择虚拟主机，排在前面的优先处理请求
  1. 准备匹配 server_name
  2. 通配符在开始时匹配 server_name 成功
  3. 通配符在结尾时匹配 server_name 成功
  4. 正则表达式匹配 server_name 成功
- 在以上四种匹配方式中，如果 server_name 被处于同一优先级的匹配方式多次匹配成功，则首次匹配成功
的虚拟主机处理请求    

### 2.4.18 基于 IP 的虚拟主机配置

Linux 系统支持 IP 别名的添加。配置基于 IP 的虚拟主机，即为 Nginx 服务器提供的每台虚拟主机配置
一个不同的 IP，因此要将网卡设置为同时能够监听多个 IP 地址。在 Linux 平台中可以使用 ifconfig
工具为同一块网卡添加多个 IP 别名。   

eth1 为使用中的网卡，其 IP 值为 192.168.1.3，现在为其添加两个 IP 别名 192.168.1.31 和
192.168.1.32，分别用于 Nginx 服务器提供的两个虚拟主机，需要执行以下操作：   

```
# ifconfig eth1:0 192.168.1.31 netmask 255.255.255.0 up
# ifconfig eth1:1 192.168.1.32 netmask 255.255.255.0 up
```   

命令中的 up 表示立即启用此别名。   

为网卡设置好别名以后，就可以为 Nginx 服务器配置基于 IP 的虚拟主机了。使用的指令和配置基于名称的
虚拟主机的指令是相同的，即 server_name，语法结构也相同。   

### 2.4.19 配置 location 块

Nginx 官方文档定义 location 的语法结构为：   

```
location [ = | ~ | ~* | ^~ ] uri { ... }
```   

为了下文叙述方便，我们约定，不含正则表达式的 uri 称为 “标准 uri”，使用正则表达式的 uri 称为
“正则 uri”。    

在不添加括号中的选项时，Nginx 服务器首先在 server 块的多个 location 块中搜索是否具有标准 uri
和请求字符串匹配，如果有多个可以匹配，就记录匹配度最高的一个。然后，服务器再用 location 块中
的正则 uri 和请求字符串匹配，当第一个正则 uri 匹配成功，结束搜索，并使用这个 location 块处理
此请求，如果正则匹配全部失败，就使用刚才记录的匹配度最高的 location 块处理此请求。   

而括号中的各个选项含义如下：   

- `=`: 用于标准 uri 前，要求请求字符串与 uri 严格匹配。如果已经匹配成功，就停止继续向下搜索并
立即处理此请求
- `~`: 用于表示 uri 包含正则表达式，并且区分大小写
- `~*`: 用于表示 uri 包含正则表达式，并且不区分大小写
- `^~`: 用于标准 uri 前，要求 Nginx 服务器找到标识 uri 和请求字符串匹配度最高的 location 后，
立即使用此 location 处理请求，而不再使用 location 块中的正则 uri 和请求字符串做匹配    

### 2.4.20 配置请求的根目录

```
root path;
```    

### 2.4.21 更改 location 的 URI

在 location 块中，除了使用 root 指令指明请求处理根目录，还可以使用 alias 指令改变 location
接收到的 URI 的请求路径，其语法结构为：   

```
alias path;
```   

其中，path 即为修改后的根路径。   

```
location ~^/data/(.+\.(html|htm))$ {
  alias /locationtest1/other/$1;
}
```   

当此 location 块接收到 /data/index.html 的请求时，匹配成功，之后根据 alias 指令的配置，
Nginx 服务器将到 /locationtest1/other 目录下找到 index.html 并相应请求。可以看到，通过
alias 指令的配置，根路径已经从 /data 更改为 /locationtest1/other 了。   

### 2.4.22 设置网站的默认首页

index 用于设置网站的默认首页，一般有两个作用：一是，用户在发出请求时，请求地址可以不写首页名称；
二是，可以对一个请求，根据其请求内容而设置不同的首页：   

```
index file ...;
```   

file 可以包括多个文件名，其间使用空格分隔，也可以包含其他变量。    

### 2.4.23 设置网站的错误页面

```
error_page code ... [=[response]] uri
```   

- code: http 错误码
- response: 可选项，将 code 指定的错误代码转化为新的错误的代码 response
- uri: 错误页面的路径或者网站地址，如果设置为路径，则是以 Nginx 服务器安装路径下的 html 目录
为根路径的相对路径；如果设置为网址，则 Nginx 服务器会直接访问该网址获取错误页面，并返回给用户端    

### 2.4.24 基于 IP 配置 Nginx 的访问权限

Nginx 配置通过两种途径支持基本访问权限的控制，其中一种是由 HTTP 标准模块 ngx_http_access_module
支持的，其通过 IP 来判断客户端是否拥有对 Nginx 的访问权限。   

allow 指令，用于设置允许访问 Nginx 的客户端 IP：   

```
allow address | CIDR | all;
```   

另一个指令是 deny，作用刚好和 allow 指令相反，用于设置禁止访问 Nginx 的客户端 IP:   

```
deny addres | CIDR | all;
```   

### 2.4.25 基于密码配置 Nginx 的访问权限

Nginx 还支持基于 HTTP Basic Authentication 协议的认证。由 ngx_http_auth_basic_module
支持。   

auth_basic 指令用于开启或关闭该认证功能：   

```
auth_basic string | off;
```    

string 为配置验证时的指示信息。   

auth_basic_user_file 指令，用于设置包含用户名和密码信息的文件路径：   

```
auth_basic_user_file  file;
```   

密码文件支持明文或者密码加密后的文件：   

```
name1:password1
name2:password2:comment
name3:password3
```   

加密密码可以使用 crypt 函数进行密码加密的格式。   

