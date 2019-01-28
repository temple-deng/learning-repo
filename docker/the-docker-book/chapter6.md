# 第 6 章 使用 Docker 构建服务

本章介绍如何利用 Docker 来运行生产环境的服务。    

## 6.1 构建第一个应用

构建的第一个应用是使用 Jekyll 框架的自定义网站，会构建以下两个镜像：   

- 一个镜像安装了 Jekyll 及其他用于构建 Jekyll 网站的必要的软件包
- 一个镜像通过 Apache 来让 Jekyll 网站工作起来    

我们打算在启动容器时，通过创建一个新的 Jekyll 网站来实现自服务。工作流程如下：   

- 创建 Jekyll 基础镜像和 Apache 镜像（只需要构建一次）
- 从 Jekyll 镜像创建一个容器，这个容器存放通过卷挂载的网站源代码
- 从 Apache 镜像创建一个容器，这个容器利用包含编译后的网站的卷，并为其服务
- 在网站需要更新时，清理并重复上面的步骤

### 6.1.1 Jekyll 基础镜像

```bash
$ mkdir jekyll
$ cd jekyll
$ vim Dockerfile
```   

Dockerfile:   

```
FROM ubuntu:18.04
MAINTAINER dengbo <d18710360845@gmail.com>
ENV REFRESHED_AT 2019-01-21
RUN apt-get -yqq update
RUN apt-get -yqq install gcc ruby ruby-dev make nodejs
RUN gem install --no-rdoc --no-ri jekyll -v 2.5.3
VOLUME /data
VOLUME /var/www/html
WORKDIR /data
ENTRYPOINT ["jekyll", "build", "--destination=/var/www/html"]
```   

上面是旧的 Dockerfile，下面是作者后续更新了:   

```
FROM ubuntu:18.04
LABEL maintainer="d18710360845@gmail.com"
ENV REFRESHED_AT 2019-01-21

RUN apt-get -qq update
RUN apt-get -qq install ruby ruby-dev libffi-dev build-essential nodejs
RUN gem install --no-rdoc --no-ri jekyll -v 2.5.3

VOLUME /data
VOLUME /var/www/html
WORKDIR /data

ENTRYPOINT ["jekyll", "build", "--destination=/var/www/html"]
```   

我们使用 VOLUME 指令创建了以下两个卷：   

- /data/, 用来存放网站的源代码
- /var/www/html，用来存放编译后的 Jekyll 网站代码

然后我们需要将工作目录设置到 /data/，并通过 ENTRYPOINT 指令指定自动构建的命令，这个命令会将
工作目录 /data/ 中的所有 Jekyll 网站代码构建到 /var/www/html/ 目录中。    

### 6.1.2 构建 Jekyll 基础镜像

构建镜像：    

```bash
$ docker build -t dengbo/jekyll .
```    

### 6.1.3 Apache 镜像

```bash
$ mkdir apache
$ cd apache
$ vim Dockerfile
```    

Dockerfile:   

```
FROM ubuntu:18.04
LABEL maintainer="james@example.com"

RUN apt-get -qq update
RUN apt-get -qq install apache2

VOLUME [ "/var/www/html" ]
WORKDIR /var/www/html

ENV APACHE_RUN_USER www-data
ENV APACHE_RUN_GROUP www-data
ENV APACHE_LOG_DIR /var/log/apache2
ENV APACHE_PID_FILE /var/run/apache2.pid
ENV APACHE_RUN_DIR /var/run/apache2
ENV APACHE_LOCK_DIR /var/lock/apache2

RUN mkdir -p $APACHE_RUN_DIR $APACHE_LOCK_DIR $APACHE_LOG_DIR

EXPOSE 80

ENTRYPOINT [ "/usr/sbin/apachectl" ]
CMD ["-D", "FOREGROUND"]
```    

### 6.1.4 构建 Jekyll Apache 镜像

```bash
$ docker build -t dengbo/apache .
```   

### 6.1.5 启动 Jekyll 网站

现在有了以下两个镜像：   

- Jekyll: 安装了 Ruby 及其他必备软件包的 Jekyll 镜像
- Apache: 通过 Apache Web 服务器来让 Jekyll 网站工作起来的镜像

先把示例 Jekyll 博客复制到 $HOME 目录（这里我们改一改）：   

```bash
$ cd $HOME/owner/docker_test/blog
$ git clone https://github.com/jamtur01/james_blog.git
```    

现在在 Jekyll 容器里使用这个示例数据：   

```bash
$ docker run -v $HOME/owner/docker_test/blog/james_blog:/data/ --name dengbo_blog dengbo/jekyll
```    

卷是在一个或多个容器中特殊指定的目录，卷会绕过联合文件系统，为持久化数据和共享数据提供几个有用的
特性：   

- 卷可以在容器间共享和重用
- 共享卷时不一定要运行相应的容器
- 对卷的修改会直接在卷上反映出来
- 更新镜像时不会包含对卷的修改
- 卷会一直存在，直到没有容器使用它们