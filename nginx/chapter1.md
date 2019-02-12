# Nginx

<!-- TOC -->

- [Nginx](#nginx)
- [第 1 章 安装 Nginx 及第三方模块](#第-1-章-安装-nginx-及第三方模块)
  - [1.1 使用包管理器安装 NGINX](#11-使用包管理器安装-nginx)
    - [1.1.1 在 CentOS 上安装 Nginx](#111-在-centos-上安装-nginx)
    - [1.1.2 在 Debian 上安装 Nginx](#112-在-debian-上安装-nginx)
  - [1.2 从源代码安装 Nginx](#12-从源代码安装-nginx)
    - [1.2.1 搭建构建环境](#121-搭建构建环境)
    - [1.2.2 源代码编译](#122-源代码编译)
    - [1.2.3 邮件代理服务器的配置选项](#123-邮件代理服务器的配置选项)
    - [1.2.4 特定路径的配置选项](#124-特定路径的配置选项)
  - [1.3 SSL 配置](#13-ssl-配置)
  - [1.4 启用各个选项](#14-启用各个选项)
    - [1.4.1 禁用掉不使用的模块](#141-禁用掉不使用的模块)
  - [1.5 安装第三方模块](#15-安装第三方模块)
  - [1.6 添加 Lua 支持](#16-添加-lua-支持)
  - [1.7 把所有东西组合到一起](#17-把所有东西组合到一起)

<!-- /TOC -->

# 第 1 章 安装 Nginx 及第三方模块

NGINX 最初是为了解决 C10K 文件而设计的一个 web 服务器，即同时处理 10000 条连接请求。Nginx
通过其基于事件的连接处理机制，使用平台相关的事件机制实现了这个目标。   

NGINX 是被设计为模块化的。   

## 1.1 使用包管理器安装 NGINX

如果我们的操作系统包管理器提供了安装包，那就可以直接使用包管理器安装：  

+ Linux(deb-based): `sudo apt-get install nginx`
+ Linux(rpm-based): `sudo yum install nginx`
+ FreeBSD: `sudo pkg_install -r nginx`    

NGINX 团队同时也提供了稳定版本的二进制文件 http://nginx.org/en/download.html。因此我们也
可以使用下面的指令安装预测试和预编译过的二进制文件。   

### 1.1.1 在 CentOS 上安装 Nginx

使用下面的方式在 `yum` 配置中添加 Nginx 仓库：   

```shell
sudo vi /etc/yum.repos.d/nginx.repo
[nginx]
name=nginx repo
baseurl=http://nginx.org/packages/centos/7/$basearch/
gpgcheck=0
enabled=1
```    

然后执行以下命令安装 nginx:   

```
sudo yum install nginx
```   

### 1.1.2 在 Debian 上安装 Nginx

1. 从 http://nginx.org/keys/nginx_signing.key 下载 Nginx 签名的密钥，将其添加到 apt
keyring 中：   

```
sudo apt-key add nginx_signing.key
```   

2. 在文件 /etc/apt/sources.list 结尾处添加 nginx.org 仓库：   

```
vi /etc/apt/sources.list
deb http://nginx.org/packages/debian/ jessie nginx
deb-src http://nginx.org/packages/debian jessie nginx
```    

3. 安装 Nginx

```
sudo apt-get update
sudo apt-get install nginx
```    

## 1.2 从源代码安装 Nginx

NGINX 源代码分为两个不同的分支 mainline 和 stable。mainline 版即开发版。   

### 1.2.1 搭建构建环境

除了编译器之外，如果我们需要开启 SSL 支持以及使用重写 rewrite 模块，还分别需要 OpenSSL 以及
Perl Compatiable Regular Expressions(PCRE) 库及开发首部。    

rewrite 模块是默认开启的，所以如果我们没安装 PCRE 库和首部，那么就需要在配置阶段禁用掉这个模块。    

如果我们在配置阶段加入了 `--with-<library>=<path>` 选项，NGINX 会尝试静态构建依赖库（这应该
是把依赖直接编译到二进制文件中吧）。如果我们希望二进制文件不依赖系统的任意部分，或者想要从二进制
文件中压榨一些性能，就可以采用这种方式。    

还有一些可选的包，想要也可以安装。包括 MD5 和 SHA-1 算法的支持、zlib 压缩、libstomic 库支持。

### 1.2.2 源代码编译

首先下载安装包并解压：    

```shell
$ mkdir $HOME/build
$ cd $HOME/build && tar xzf nginx-<version-number>.tar.gz
```    

配置：   

```shell
$ cd $HOME/build/nginx-<version-number> && ./configure
```   

编译：   

```shell
$ make && sudo make install
```   

具体在 ubuntu 上安装的时候首先要安装那个 pcre 库，搜一下就有 tar 包，下载下来，`./configure`，
不过可能需要安装 c 编译器和 c++ 编译器：   

```cmd
$ apt-get update
$ apt-get install gcc build-essential
```  

然后 `make`, `make install` 安装 pcre。   

然后貌似 ubuntu 镜像中也没装 openssl 和 zlib，所以还得下载 zlib 和 openssl 编译安装。   

安装 openssl 时候可能会用到这个 `export LD_LIBRARY_PATH=/usr/local/lib`。  

通用配置选项：   


选项 | 描述
---------|----------
 `--prefix=<path>` | 安装根路径，所有其他的安装路径都是相对于这个路径，默认是 `/usr/local/nginx`
 `--sbin-path=<path>` | Nginx 可执行文件的路径，如果未指定的话，相对于 prefix，默认 `/usr/local/nginx/sbin/nginx`
 `--conf-path=<path>` | Nginx 寻找其配置文件的路径 `/usr/local/nginx/conf/nginx.conf`
 `--error-log-path=<path>` | 在未配置错误日志文件位置情况下，错误日志文件的位置 `/usr/local/nginx/logs/error.log`
 `--pid-path=<path>` | 主进程 pid 文件的位置 `/usr/local/nginx/logs/nginx.pid`
 `--lock-path=<path>` | 共享内存 mutex 锁文件的位置
 `--user=<user>` | 可以运行进程的用户
 `--group=<group>` | 可以运行进程的用户组
 `--with-file-aio` | 启用异步 I/O
 `--with-debug` | 启用 debug 日志   

优化配置选项：   


选项 | 描述
----------|---------
 `--with-cc=<path>` | C 编译器的位置
 `--with-cpp=<path>` | C 预处理器
 `--with-cc-opt=<options>` | 一些 include 文件的搜索路径，以及优化措施和 64 位构建的配置项
 `--with-ld-opt=<options>` | 链接器的配置项，包括库的路径 -L &lt;path&gt; 以及运行路径 -R &lt;path&gt;
 `--with-cpu-opt=<cpu>` | 指定 CPU 系列相关的特定构建


### 1.2.3 邮件代理服务器的配置选项


Option | 说明
----------|---------
 `--with-mail` | 启用 `mail` 模块，默认是不激活的
 `--with-mail_ssl_module` | 如果我们希望代理使用 SSL/TLS 的邮件，就需要激活这个模块
 `--without-mail_pop3_module` | 当启用 `mail` 模块的时候，可以单独禁用掉 POP3 模块
 `--without-mail_imap_module` | 当启用 `mail` 模块的时候，可以单独禁用掉 IMAP 模块
 `--without-mail_smtp_module` | 当启用 `mail` 模块的时候，可以单独禁用掉 SMTP 模块（这个不是邮件协议的核心吗，怎么能禁用掉）
 `--without-http` | 完全禁用掉 `http` 模块

对于一个典型的邮件代理服务器，推荐这样配置：   

```cmd
$ ./configure --with-mail --with-mail_ssl_module --with-openssl=${BUILD_DIR}/openssl-1.0.1p
```    

openssl 注意修改为自己的版本。    

注意好像上面的那个 openssl 就是之前提到的静态编译模块到二进制文件中，这样就不用依赖操作系统的
openssl 库了。   

### 1.2.4 特定路径的配置选项

下面的配置项都是 http 模块可用的。    


Option | 说明
----------|---------
 `--without-http-cache` | 当使用 upstream 模块时，可以配置 NGINX 本地缓存内容。该选项禁用掉了这个功能
 `--with-http_perl_module` | 可以使用 Perl 代码来扩展 NGINX 配置。这一选项激活了这个模块（然而该模块会在阻塞IO完成了降低性能）
 `--with-perl_modules_path=<path>` | 指定使用内置 Perl 解释器需要的额外的 Perl 模块的路径
 `--with-perl=<path>` | 如果在默认路径下没找到 Perl 时的 Perl 的路径
 `--http-log-path=<path>` | 默认的 HTTP 访问日志的路径
 `--http-client-body-temp-path=<path>` | 当从客户端接收请求时，这个是请求主体的临时的目录路径。（没懂）如果启用了 WebDAV 模块，推荐将这个路径设置为与最终目的地相同的文件系统中
 `--http-proxy-temp-path=<path>` | 当作为代理时，存储临时文件的目录
 `--http-fastcgi-temp-path=<path>` | FastCGI 临时文件的位置
 `--http-uwsgi-temp-path=<path>` | uWSGI 临时文件的位置
 `--http-scgi-temp-path=<path>` | SCGI 临时文件的位置

## 1.3 SSL 配置

SSL 支持既可以从操作系统中获取也可以直接从单独的 openssl 工具副本中获取。如果我们使用了
`--with-http_ssl_module` 或者 `--with-mail_ssl_module` 但是没有配置 `--with-ssl`，
那么就是在使用系统安装的 OpenSSL 库。如果我们希望编译一个特定版本的 OpenSSL，下载源码并解压，
然后将其解压后的位置配置为 `--with-ssl` 选项。    

## 1.4 启用各个选项

除了 http 和 mail 模块外，NGINX 发行版还包括了很多其他的模块。这些模块默认没有被激活，但是可以
通过设置合适的配置项进行激活：    

```
--with-<module-name>_module
```    

HTTP 相关模块配置项：   


Option | 说明
----------|---------
 `--with-http_ssl_module` | 略
 `--with-http_realip_module` | 如果我们的 NGINX 是在一个 L7 负载均衡器，或者其他将客户端IP放置到一个 HTTP 首部中的设备后，那么我们就需要启用这个模块。用于多个客户端都是同一个 IP 地址的场景。
 `--with-http_addition_module` | This module works as an output filter, enabling you to add content of a different location before or after that of the location itself
 `--with-http_xslt_module` | 略
 `--with-http_image_filter_module` | 这个模块是一个图片的过滤器，在将图片提交给客户端前进行一些处理
 `--with-http_geoip_module` | 该模块可以让我们设置各种变量以在配置块中使用，以根据客户端的 IP 地址找到的地理位置做出决策
 `--with-http_sub_module` | 该模块实现了一个替换过滤器，可以将响应中的一个字符串用另一个替换掉（需要注意的是，使用这个模块就暗示着我们禁用掉了首部缓存）
 `--with-http_dav_module` | 启用这个模块会为了使用 WebDAV 激活配置指令
 `--with-http_flv_module` | 略
 `--with-http_mp4_module` | 略
 `--with-http_gzip_static_module` | 略，就是对静态文件启用压缩
 `--with-http_gunzip_module` | 为不支持 gzip的客户端解压预压缩过的内容
 `--with-http_random_index_module` | 如果要从目录中的文件中随机选择索引文件，需要启用此模块
 `--with-http_secure_link_module` | 该模块提供一种机制将一个连接哈希为一个 URL，以便只有那些有正确密钥的才能计算出连接
 `--with-http_stub_status_module` | 手机 NGINX 自身的数据   

通常来说在编译时启用这些模块对运行时的性能基本上没影响，但是如果后续在配置文件中启用这些模块，可能
会运行时性能产生影响。    

### 1.4.1 禁用掉不使用的模块

还有一些 http 模块可能被激活了，但是可以通过配置禁用掉 `--without-<module-name>_module`。   

- `--without-http_charset_module`: `charset` 模块负责设置 Content-Type 响应首部，以及将一个字符集转换到另一个
- `--without-http_gzip_module`: 略
- `--without-http_ssi_module`: 处理 Server Side Includes 的过滤器，如果启用了 Perl模块，
一个额外的 SSI 命令是可用的
- `--without-http_userid_module`: userid 模块允许 NGINX 设置 cookies。变量 $uid_set 和
$uid_got 可以被记录在日志以便后续的用户跟踪
- `--without-http_access_module`: access 模块可以基于 IP 地址来控制对不同路径的访问
- `--without-http_auth_basic_module`: 略
- `--without-http_autoindex_module`: autoindex 模块允许为没有 index 文件目录生成一个目录列表
- `--without-http_geo_module`: geo 模块允许我们基于客户端 IP 地址设置配置变量，然后根据变量的
值采取行动
- `--without-http_map_module`: map 模块允许把一个变量映射为另一个
- `--without-http_split_clients_module`: 创建 A/B 测试用的变量
- `--without-http_referer_module`: 允许 NGINX 基于 Referer 首部阻塞请求
- `--without-http_rewrite_module`: 允许我们基于不同的条件修改 URIs
- `--without-http_proxy_module`: 代理模块允许 NGINX 将请求传递给一个或一组服务器
- `--without-http_fastcgi_module`: 允许 NGINX 将请求传递给一个 FastCGI 服务器
- `--without-http_uwsgi_module`: 允许 NGINX 将请求传递给 uWSGI 服务器
- `--without-http_scgi_module`: 略
- `--without-http_memcached_module`: 允许 NGINX 与一个 memcached 服务器交互
- `--without-http_limit_conn_module`: 基于特定的键限制连接个数，通常是基于 IP 地址（其实就是限制某个地址的并发量把）
- `--without-http_limit_req_module`: 限制特定键的请求速率
- `--without-http_browser_module`: 允许我们添加基于 User-Agent 首部的配置
- `--without-http_upstream_ip_hash_module`: 定义了一组可以与各种代理模块结合使用的服务器

## 1.5 安装第三方模块

1. 首先下载第三方模块的代码
2. 解压缩
3. 阅读 README 文件，看看有没有什么要装的依赖
4. `./configure --add-module=<path>`    

## 1.6 添加 Lua 支持

ngx_lua 模块可以将 Lua 而不是 Perl 作为配置时的嵌入脚本语言。其优点是天然非阻塞的特性以及
和其他第三方模块的紧密集成。   

## 1.7 把所有东西组合到一起

```cmd
$ export BUILD_DIR=`pwd`
$ export NGINX_INSTALLDIR=/opt/nginx
$ export VAR_DIR=/home/www/tmp
$ export LUAJIT_LIB=/opt/luajit/lib
$ export LUAJIT_INC=/opt/luajit/include/luajit-2.0

$ ./configure \
    --prefix=${NGINX_INSTALLDIR} \
    --user=www \
    --group=www \
    --http-client-body-temp-path=${VAR_DIR}/client_body_temp  \
    --http-proxy-temp-path={VAR_DIR}/proxy_temp \
    --http-fastcgi-temp-path=${VAR_DIR}/fastcgi_temp \
    --without-http_uwsgi_module \
    --without-http_scgi_module \
    --without-http_browser_module \
    --with-openssl=${BUILD_DIR}/../openssl-1.0.1p \
    --with-pcre=${BUILD_DIR}/../pcre-8.32 \
    --with-http_ssl_module \
    --with-http_realip_module \
    --with-http_sub_module \
    --with-http_flv_module \
    --with-http_gzip_static_module \
    --with-http_gunzip_module \
    --with-http_secure_link_module \
    --with-http_stub_status_module \
    --add-module=${BUILD_DIR}/ngx_devel_kit-0.2.17 \
    --add-module=${BUILD_DIR}/ngx_lua-0.7.9
```
