# 第二部分 实战案例

<!-- TOC -->

- [第二部分 实战案例](#第二部分-实战案例)
- [第 9 章 操作系统](#第-9-章-操作系统)
  - [9.1 BusyBox](#91-busybox)
  - [9.2 Alpine](#92-alpine)
- [第 10 章 为镜像添加 SSH 服务](#第-10-章-为镜像添加-ssh-服务)
  - [10.1 基于 commit 命令创建](#101-基于-commit-命令创建)
  - [10.2 使用 Dockerfile 创建](#102-使用-dockerfile-创建)
- [第 11 章 Web 服务与应用](#第-11-章-web-服务与应用)
  - [11.1 Apache](#111-apache)
    - [11.1.1 使用自定义镜像](#1111-使用自定义镜像)
  - [11.2 Nginx](#112-nginx)
  - [11.5 LAMP](#115-lamp)
  - [11.6 持续开发与管理](#116-持续开发与管理)
    - [11.6.1 Jenkins](#1161-jenkins)
    - [11.6.2 GitLab](#1162-gitlab)
- [第 12 章 数据库应用](#第-12-章-数据库应用)
  - [12.1 MySQL](#121-mysql)
  - [12.3 MongoDB](#123-mongodb)
  - [12.4 Redis](#124-redis)

<!-- /TOC -->

# 第 9 章 操作系统

## 9.1 BusyBox

BusyBox 是一个集成了一百多个最常用 Linux 命令（如 cat、echo、grep、mount、telnet等）的
精简工具箱，它只有不到 2MB 大小。可运行于多款 POSIX 环境的操作系统中（那这就不是一个操作系统啊，
只是一个工具，那干嘛放到这一章）。    

剩下的略。   

## 9.2 Alpine

Alpine 操作系统是一个面向安全的轻型 Linux 发行版，关注安全，性能和资源效能。在保持瘦身的同时，
Alpine 还提供了包管理工具 apk 查询和安装软件包。   

剩下的都略了。    

# 第 10 章 为镜像添加 SSH 服务

## 10.1 基于 commit 命令创建

Docker 提供了 docker commit 命令，支持用户提交自己对指定容器的修改，并生成新的镜像。   

首先获取 ubuntu:18.04 镜像，并创建一个容器，然后更新软件源：   

```bash
docker run -it ubuntu:18.04 /bin/bash
root@5d427f686385:/# apt-get update
```   

然后就可以安装 SSH 服务了，选择主流的 openssh-server 作为服务端：   

```bash
root@5d427f686385:/# apt-get install openssh-server
```   

如果需要正常启动 SSH 服务，则目录 /var/run/sshd 必须存在。手动创建，并启动 SSH 服务：   

```bash
root@5d427f686385:/# mkdir -p /var/run/sshd
root@5d427f686385:/# /usr/sbin/sshd -D &
```   

修改 SSH 服务的安全登录配置，取消 pam 登录限制：   

```bash
root@5d427f686385:/# sed -ri 's/session required pam_loginuid.so/#session required
pam_loginuid.so/g' /etc/pam.d/sshd
```    

在 root 用户目录下创建 .ssh 目录，并复制需要登录的公钥信息（一般为本地主机用户目录下的 .ssh/id_rsa.pub
文件，可由 ssh-keygen -t rsa 命令生成）到 authorized_keys 文件中。    

```bash
root@5d427f686385:/# mkdir root/.ssh
root@5d427f686385:/# vim /root/.ssh/authorized_keys
```    

创建自动启动 SSH 服务的可执行文件 run.sh，并添加可执行权限：   

```bash
root@5d427f686385:/# vim /run.sh
root@5d427f686385:/# chmod +x run.sh
```   

run.sh 脚本内容如下：   

```bash
#!/bin/bash
/usr/sbin/sshd -D
```   

最后退出容器。   

将所退出的容器用 `docker commit` 命令保存为一个新的 sshd:ubuntu 镜像。然后启动容器就行了。   

## 10.2 使用 Dockerfile 创建

首先编写 run.sh 文件，内容与上一节的一致。   

在宿主机上生成 SSH 密钥对，并创建 authorized_keys 文件：   

```bash
$ ssh-keygen -t rsa
$ cat ~/.ssh/id_rsa.pub > authorized_keys
```   

编写 Dockerfile 文件：   

```
FROM ubuntu:18.04
MAINTAINER docker_user (user@docker.com)
RUN apt-get update

# 安装 ssh 服务
RUN apt-get install -y openssh-server
RUN mkdir -p /var/run/sshd
RUN mkdir -p /root/.ssh

# 取消 pam 限制
RUN sed -ri 's/session    required    pam_loginuid.so/#session    required    pam_loginuid.so/g' /etc/pam.d/sshd

ADD authorized_keys /root/.ssh/authorized_keys
ADD run.sh /run.sh
RUN chmod 755 /run.sh

EXPOSE 22

CMD ["/run.sh"]
```   

# 第 11 章 Web 服务与应用

## 11.1 Apache

如果读者需要 PHP 环境支持，可以选择 PHP 镜像，并使用含 `-apache` 标签的镜像。   

Dockerfile:   

```
FROM httpd:2.4
COPY ./pubilc-html /usr/local/apache2/htdocs/
```   

也可以不创建自定义镜像，直接通过映射目录方式运行 Apache 容器：   

```cmd
$ docker run -it --rm --name my-apache-app -p 80:80 -v $PWD:/usr/local/apache2/htdocs/ httpd:2.4
```    

不知道为什么，运行出错了。    

### 11.1.1 使用自定义镜像

Dockerfile:   

```
FROM ubuntu:18.04
LABEL docker_user=user@docker.com

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get -y update
RUN apt-get -yq install apache2 && rm -rf /var/lob/apt/lists/*

ADD run.sh /run.sh
RUN chmod 755 /*.sh

RUN mkdir -p /var/lock/apache2 && mkdir -p /app && rm -rf /var/www/html && ln -s /app /var/www/html

COPY sample/ /app

ENV APACHE_RUN_USER www-data
ENV APACHE_RUN_GROUP www-data
ENV APACHE_LOG_DIR /var/log/apache2
ENV APACHE_PID_FILE /var/run/apache2.pid
ENV APACHE_RUN_DIR /var/run/apache2
ENV APACHE_LOCK_DIR /var/lock/apache2
ENV APACHE_SERVERADMIN admin@localhost
ENV APACHE_SERVERNAME localhost
ENV APACHE_SERVERALIAS docker.localhost
ENV APACHE_DOCUMENTROOT /var/www

EXPOSE 80
WORKDIR /app
CMD ["/run.sh"]
```    

run.sh:    

```bash
$!/bin/bash
exec apache2 -D FOREGROUND
```   

坑爹，这个 Dockerfile 也有问题，容器跑不起来。    

## 11.2 Nginx

使用官方的镜像：   

```bash
$ docker run -d -p 8080:80 --name webserver nginx
```   

挂载页面：    

```bash
$ docker run --name nginx-container -p 8081:80 -v index.html:/usr/share/nginx/html:ro -d nginx
```   

## 11.5 LAMP

社区提供了十分成熟的 linode/lamp 和 tutum/lame 镜像：   

```bash
$ docker run -p 8081:80 -t -i linode/lamp /bin/bash
```   

在容器内部启动 Apache 及 MySQL 服务：   

```bash
root@8d02c052d0ad:/# service apache2 start
 * Starting web server apache2           *
root@8d02c052d0ad:/# service mysql start
 * Starting MySQL database server mysqld                                                                                [ OK ]
 * Checking for tables which need an upgrade, are corrupt or were
not closed cleanly.
```   

就这样，没了。    

## 11.6 持续开发与管理

### 11.6.1 Jenkins

```bash
$ docker run -p 8080:8080 -p 50000:50000 jenkins
```    

目前运行的容器中，数据会存储在工作目录 /var/jenkins_home 中，这包括 Jenkins 中所有的数据，
如插件和配置信息等。如果需要数据持久化，可以使用数据卷机制：   

```bash
$ docker run -p 8080:8080 -p 50000:50000 -v /your/home:/var/jenkins_home jenkins
```   

### 11.6.2 GitLab

```bash
$ docker run --detach \
  --hostname gitlab.example.com \
  --publish 443:443 --publish 80:80 --publish 23:23 \
  --name gitlab \
  --restart always
  --volume /srv/gitlab/config:/etc/gitlab \
  --volume /srv/gitlab/logs:/var/log/gitlab \
  --volume /srv/gitlab/data:/var/opt/gitlab \
  gitlab/gitlab-ce:latest
```   

# 第 12 章 数据库应用

## 12.1 MySQL

**使用官方镜像**    

```bash
$ docker run --name hi-mysql -e MYSQL_ROOT_PASSWORD=123456 -d mysql:latest
```   

以上指令中的 hi-mysql 是容器名称，123456 为数据库的 root 用户密码。   

MySQL 服务的标准端口是 3306。    

官方 MySQL 镜像还可以作为客户端，连接非 Docker 或者远程 MySQL 实例：   

```bash
$ docker run -it --rm mysql mysql -hsome.mysql.host -usome-mysql-user -p
```    

## 12.3 MongoDB

使用官方镜像：   

```bash
$ docker run --name mongo-containter -d mongo
```   

## 12.4 Redis

使用官方镜像：   

```bash
$ docker run --name redis-container -d redis
```   
