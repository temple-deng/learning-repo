# 第 3 章 使用邮件模块

<!-- TOC -->

- [第 3 章 使用邮件模块](#第-3-章-使用邮件模块)
  - [3.1 基础的代理服务](#31-基础的代理服务)
    - [3.1.1 邮件服务器配置](#311-邮件服务器配置)
    - [3.1.2 POP3 服务](#312-pop3-服务)
    - [3.1.3 IMAP 服务](#313-imap-服务)
    - [3.1.4 SMTP 服务](#314-smtp-服务)
    - [3.1.5 使用 SSL/TLS](#315-使用-ssltls)
    - [3.1.6 完整的邮件例子](#316-完整的邮件例子)
  - [3.2 认证服务](#32-认证服务)
  - [3.3 与 memcached 组合](#33-与-memcached-组合)
  - [3.4 解释日志文件](#34-解释日志文件)
  - [3.5 操作系统限制](#35-操作系统限制)

<!-- /TOC -->

通常，如果我们的后端可能会接收大量的连接但是服务器性能不足以支撑，或者不可以直接进行访问，那这
时候就可以使用 NGINX 的 mail 模块来搭建一个邮件代理服务器。这一章还包括认证服务、缓存、日志
文件的解释等话题。   

由于实际工作中估计用不掉搭建邮件代理，因此本章关于邮件代理的部分可能会写的比较简单。   

## 3.1 基础的代理服务

NGINX mail 代理模块最初是为 FastMail 开发的。它们需要为所有的用户提供一个单一的 IMAP 终端，
但是与此同时真正的邮箱账号是存放在众多的上游邮件服务器中的。当时典型的代理服务使用了经典的 UNIX
fork 模型，即每个新连接都会 fork 一个新的进程来处理。IMAP 连接通常又比较长，所以嘛。。。因此，
NGINX 事件驱动模型就比较适合这种场景了。    

每个新来的请求都会根据其使用的协议进行不同的处理，mail 模块可以配置 POP3, IMAP, SMTP 服务。
对于每种协议，NGINX 会使用用户名和密码先向一个认证服务发起查询请求。如果认证成功，认证服务会
返回到邮件服务器的代理连接。认证服务决定了客户端使用的服务类型，以及使用哪台邮件服务器。

### 3.1.1 邮件服务器配置

mail 模块可以配置影响代理邮件连接的各个侧面的指令。服务器上下文也接收 listen 和 server_name
指令。mail 模块可以在全局方面配置所有 e-mail 代理链接的参数，也可以为每个服务器进行单独的配置。   

NGINX 可以代理 IMAP，POP3 和 SMTP 协议。下面是这个模块可用的指令：   

- `auth_http`: 指定用来认证 POP3/IMAP 用户的服务器
- `imap_capabilities`: 后端服务器支持 IMAP4
- `pop3_capabilities`: 后端支持 POP3
- `protocol`: 虚拟服务器支持的协议
- `proxy`: 启用或禁用邮件代理
- `proxy_buffer`: 用来设置超过默认一页的代理连接的 buffer 大小
- `proxy_pass_error_message`: 当后端认证进程发送一条错误信息给客户端的配置
- `proxy_timeout`: 如果超过默认 24 小时的超时，可以设置该指令
- `xclient`: SMTP 协议允许基于 IP/HELO/LOGIN 参数进行检查，这些参数是通过 XCLIENT 命令
传送的     

如果还配置了 SSL 支持，还可以使用下面的指令：   

- `ssl`: 是否支持 SSL
- `ssl_certificate`: 服务器证书的路径
- `ssl_cerificate_key`: 服务器 SSL 密钥
- `ssl_ciphers`: 指定服务器支持的加密方法
- `ssl_prefer_server_ciphers`: 服务器更喜欢的加密方法
- `ssl_protocols`: SSL 协议版本
- `ssl_session_cache`: 指定 SSL 缓存，以及这个缓存是否应该在所有 worker 进程间共享
- `ssl_session_timeout`: 客户端可以使用同样的 SSL 参数的超时时间

### 3.1.2 POP3 服务

为了让 NGINX 成为一个 POP3 代理，首先需要配置以下的基础配置：   

```
mail {
  auth_http localhost:9000/auth;

  server {
    listen 110;
    protocol pop3;
    proxy on;
  }
}
```   

### 3.1.3 IMAP 服务

```
mail {
  auth_http localhost:9000/auth;

  imap_capabilities   IMAP4rev1 UIDPLUS QUOTA;
  imap_auth  login cram-md5;

  server {
    listen  143;
    protocol  imap;
    proxy  on;
  }
}
```    

### 3.1.4 SMTP 服务

```
mail {
  auth_http localhost:9000/auth;

  smtp_capabilities PIPELINING 8BITMIME DSN;
  smtp_auth login cram-md5;

  server {
    listen 25;
    protocol smtp;
    proxy on;
  }
}
```   

### 3.1.5 使用 SSL/TLS

```
mail {
  starttls on;

  ssl_prefer_server_cipher on;

  ssl_protocols TLSv1 SSLv3;

  ssl_ciphers HIGH:!ADH:!MD5:@STRENGTH;

  ssl_session_cache shared:MAIL:10m;

  ssl_certificate  /usr/local/etc/nginx/mail.example.com.crt;
  ssl_certificate_key /usr/local/etc/nginx/mail.example.com.key;
}
```  

### 3.1.6 完整的邮件例子

```
events {
  worker_connections 1024;
}

mail {
  server_name mail.example.com;
  auth_http localhost:9000/auth;

  proxy  on;

  ssl_prefer_server_ciphers  on;
  ssl_protocols TLSv1 SSLv3;
  ssl_ciphers  HIGH:!ADH:!MD5:@STRENGTH;
  ssl_session_cache shared:MAIL:10m;
  ssl_certificate /usr/local/etc/nginx/mail.example.com.crt;
  ssl_certificate_key /usr/local/etc/nginx/mail.example.com.key;

  pop3_capabilities TOP USER;
  imap_capabilities IMAP4rev1  UIDPLUS QUOTA;
  smtp_capabilities PIPELINING 8BITMIME DSN;
  
  pop3_auth apop cram-md5;
  imap_auth login cram-md5;
  smtp_auth login cram-md5;

  server {
    listen 25;
    protocol smtp;
    timeout 1200000;
  }
  server {
    listen 465;
    protocol smtp;
    ssl on;
  }
  server {
    listen 587;
    protocol smtp;
    starttls on;
  }
  server {
    listen 110;
    protocol pop3;
    starttls on;
  }
  server {
    listen 995;
    protocol pop3;
    ssl on;
  }
  server {
    listen 993;
    protocol imap;
    ssl on;
  }
}
```

## 3.2 认证服务

当用户发起一个到 NGINX 的 POP3, IMAP 或 SMTP 请求，第一步就是认证这条连接。NGINX 自己不会
执行认证操作，而是通常发起一个到认证服务的请求。然后 NGINX 会根据认证服务返回的响应来发起到上游
邮件服务器的连接。   

认证服务对编写服务的语言没有要求。只要符号 NGINX 对认证协议的要求即可。这个认证协议类似 HTTP。   

NGINX 会在其发送给认证服务的请求中添加下面的首部：   

- Host
- Auth-Method
- Auth-User
- Auth-Pass
- Auth-Salt
- Auth-Portocol
- Auth-Login-Attempt
- Client-IP
- Client-Host
- Auth-SMTP-Helo
- Auth-SMTP-From
- Auth-SMTP-To

并不是说每个请求都会包含上面的每个首部。

## 3.3 与 memcached 组合

略。   

## 3.4 解释日志文件

根据我们配置的日志级别，以及 NGINX 编译时是否启用了 debug 支持 --enable-debug，日志文件会
记录我们每个会话中究竟发生了什么。  

error log 中的每一行都对应于使用 error_log 指令配置的某个特定的日志级别。级别分别是 debug,
info, notice, warn, error, crit, alert, emerg，按照严重性递增排序。配置特定级别的日志
都会包括比其更严重级别的日志。默认是 error。   

下面的例子展示了一个 POP3 会话的连接日志。   

首先，客户端建立起到代理的连接：    

```
<timestamp> [info] <worker pid>#0: *<connection id> client <ip address> connected to 0.0.0.0:110
```   

一旦客户端完成了登录，会记录一条列出所有相关连接信息的日志：   

```
<timestamp> [info] <worker pid>#0: *<connection id> client logged in, client: <ip address>,
server: 0.0.0.0:110, login: "<username>", upstream: <upstream ip>:<upstream port>,
[<client ip>:<client port>-<local ip>:110] <=> [<local ip>:<high port>-<upstream ip>:<upstream port>]
```   

## 3.5 操作系统限制

有时候可能 NGINX 没有像我们预想的那样运行，比如说每个连接都被丢掉了，或者每个连接都在日志中打印
了 warning 警告。通常这是受到了操作系统的限制。   

邮件代理服务最常遇见的问题可能是连接的限制。对于每条被代理的连接，NGINX 会打开一个到邮件服务器的
新连接。这些连接中的每一个都会占用一个文件描述符。    

根据我们的操作系统，可以通过设置资源文件中的配置项或者向资源管理服务发送信号来调整可打开文件描述符
的最大数量。可以通过以下命令查看当前值：   

```bash
ulimit -n
```    

如果我们这个配置过低的话，那么我们会在错误日志中看到 worker_connections exceed open file
resource limit 的信息。这时候，我们首先需要在系统层面调整这个值，之后在 nginx.conf 中设置
worker_rlimit_nofile 指令值为新设置的值。然后重启 NGINX。   