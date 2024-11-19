# 第 6 章 使用 Docker 构建服务

<!-- TOC -->

- [第 6 章 使用 Docker 构建服务](#第-6-章-使用-docker-构建服务)
  - [6.1 构建第一个应用](#61-构建第一个应用)
    - [6.1.1 Jekyll 基础镜像](#611-jekyll-基础镜像)
    - [6.1.2 构建 Jekyll 基础镜像](#612-构建-jekyll-基础镜像)
    - [6.1.3 Apache 镜像](#613-apache-镜像)
    - [6.1.4 构建 Jekyll Apache 镜像](#614-构建-jekyll-apache-镜像)
    - [6.1.5 启动 Jekyll 网站](#615-启动-jekyll-网站)
    - [6.1.6 更新 Jekyll 网站](#616-更新-jekyll-网站)
    - [6.1.7 备份 Jekyll 卷](#617-备份-jekyll-卷)
  - [6.3 多容器的应用栈](#63-多容器的应用栈)
    - [6.3.1 Node.js 镜像](#631-nodejs-镜像)
    - [6.3.2 Redis 基础镜像](#632-redis-基础镜像)
    - [6.3.3 Redis 主镜像](#633-redis-主镜像)
    - [6.3.4 Redis 副本镜像](#634-redis-副本镜像)
    - [6.3.5 创建 Redis 后端集群](#635-创建-redis-后端集群)
    - [6.3.6 创建 Node 容器](#636-创建-node-容器)
    - [6.3.7 捕获应用日志](#637-捕获应用日志)

<!-- /TOC -->

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
LABEL author="dengbo"
LABEL email="630435132@qq.com"
ENV REFRESHED_AD 2019-02-13
RUN apt-get -yqq update
RUN apt-get -yqq install ruby ruby-dev make nodejs gcc
RUN gem install --no-rdoc --no-ri jekyll -v 2.5.3
VOLUME /data
VOLUME /var/www/html
WORKDIR /data
ENTRYPOINT [ "jekyll", "build", "--destination=/var/www/html" ]
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
LABEL author="dengbo"
RUN apt-get -yqq update
RUN apt-get -yqq install apache2
VOLUME /var/www/html
WORKDIR /var/www/html
ENV APACHE_RUN_USER www-data
ENV APACHE_RUN_GROUP www-data
ENV APACHE_LOG_DIR /var/log/apache2
ENV APACHE_PID_FILE /var/run/apache2.pid
ENV APACHE_RUN_DIR /var/run/apache2
ENV APACHE_LOCK_DIR /var/lock/apache2
RUN mkdir -p $APACHE_RUN_DIR $APACHE_LOCK_DIR $APACHE_LOG_DIR
EXPOSE 80
ENTRYPOINT [ "/usr/sbin/apache2" ]
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

我们将本地下载的 james_blog 目录作为 /data/ 卷挂载到容器里。容器已经拿到网站的源代码，并将
其构建到已编译的网站，存放到 /var/www/html 目录。

卷是在一个或多个容器中特殊指定的目录，卷会绕过联合文件系统，为持久化数据和共享数据提供几个有用的
特性：   

- 卷可以在容器间共享和重用
- 共享卷时不一定要运行相应的容器
- 对卷的修改会直接在卷上反映出来
- 更新镜像时不会包含对卷的修改
- 卷会一直存在，直到没有容器使用它们    

卷在 Docker 宿主机的 /var/lib/docker/volumes 目录中。   

所以如果想在另一个容器里使用 /var/www/html/ 卷里编译好的网站，可以创建一个新的链接到这个卷的
容器：   

```
$ docker run -d -P --volumes-from james_blog jamtur01/apache
```   

--volumes-from 把指定容器里的所有卷都加入新创建的容器里。这意味着，Apache 容器可以访问之前创建
的 james_blog 容器里 /var/www/html 卷中存放的编译后的 Jekyll 网站。即使 james_blog 容器
没有运行，Apache 容器也可以访问这个卷。    

现在直接查看端口预览即可。   

### 6.1.6 更新 Jekyll 网站

编辑 james_blog/_config.yml 文件来修改博客的名字，修改其中的 title 域。  

然后重新运行容器即可：   

```
docker start james_blog
```   

真的可以唉，神奇。    

### 6.1.7 备份 Jekyll 卷

由于卷的优点之一就是可以挂载到任意容器，因此可以轻松备份它们。现在创建一个新容器，用来备份
/var/www/html 卷：   

```
$ docker run --rm --volumes-from dengbo_blog \
  -v $(pwd):/backup ubuntu \
  tar cvf /backup/james_blog_backup.tar /var/www/html
```    

这其实有点像反向挂载，我们把卷打包到容器中，再把打包后的位置反向挂载到宿主机中。    

## 6.3 多容器的应用栈

在最后一个服务应用的示例中我们把一个使用Express框架的、带有 Redis 后端的 Node.js 应用完全
Docker化了。    

在这个例子中，我们会构建一系列的镜像来支持部署多容器的应用：   

- 一个 Node 容器，用来服务器于 Node 应用，这个容器会链接到
- 一个 Redis 主容器，用于保存和集群化应用状态，这个容器会链接到
- 两个 Redis 副本容器，用于集群化应用状态
- 一个日志容器，用于捕获应用日志

### 6.3.1 Node.js 镜像

```
$ mkdir nodejs && cd nodejs
$ mkdir -p nodeapp && cd nodeapp
$ wget https://raw.githubusercontent.com/jamtur01/dockerbook-code/master/code/6/node/nodejs/nodeapp/package.json
$ wget https://raw.githubusercontent.com/jamtur01/dockerbook-code/master/code/6/node/nodejs/nodeapp/server.js
$ cd ..
$ vim Dockerfile
```   

Dockerfile:   

```
FROM ubuntu:18.04
LABEL author="dengbo"
LABEL email="630435133@qq.com"
ENV REFRESHED_AD 2019-02-13
RUN apt-get -yqq update
RUN apt-get -yqq install nodejs npm
RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN mkdir -p /var/log/nodeapp
ADD nodeapp /opt/nodeapp/
WORKDIR /opt/nodeapp
RUN npm install
VOLUME ["/var/log/nodeapp"]
EXPOSE 3000
ENTRYPOINT [ "nodejs", "server.js" ]
```   

server.js 内容如下：   

```js
var fs = require('fs');
var express = require('express'),
    session = require('express-session')
    cookieParser = require('cookie-parser')
    morgan = require('morgan')
    app = express(),
    redis = require('redis'),
    RedisStore = require('connect-redis')(session),
    server = require('http').createServer(app);

var logFile = fs.createWriteStream('/var/log/nodeapp/nodeapp.log', {flags: 'a'});

app.use(morgan('combined', {stream: logFile}));
app.use(cookieParser('keyboard-cat'));
app.use(session({
        resave: false,
        saveUninitialized: false,
        store: new RedisStore({
            host: process.env.REDIS_HOST || 'redis_primary',
            port: process.env.REDIS_PORT || 6379,
            db: process.env.REDIS_DB || 0
        }),
        secret: 'keyboard cat',
        cookie: {
            expires: false,
            maxAge: 30 * 24 * 60 * 60 * 1000
        }
}));

app.get('/', function(req, res) {
  res.json({
    status: "ok"
  });
});

app.get('/hello/:name', function(req, res) {
  res.json({
    hello: req.params.name
  });
});

var port = process.env.HTTP_PORT || 3000;
server.listen(port);
console.log('Listening on port ' + port);
```   

然后构建镜像。   

### 6.3.2 Redis 基础镜像

```
$ mkdir redis_base
$ cd redis_base
$ vim Dockerfile
```   

Dockerfile:   

```
FROM ubuntu:18.04
LABEL author="dengbo"
LABEL email="630435133@qq.com"
ENV REFRESHED_AD 2019-02-13
RUN apt-get -yqq update
RUN apt-get install -yqq software-properties-common python-software-properties
RUN add-apt-repository ppa:chris-lea/redis-server
RUN apt-get -yqq update
RUN apt-get -yqq install redis-server redis-tools
VOLUME [ "/var/lib/redis", "/var/log/redis/" ]
EXPOSE 6379
CMD []
```    

尴尬安装的时候 pythod-software-properties 报错。。。 那我们自己写一个 Dockerfile:   

```
FROM ubuntu:18.04
LABEL author="dengbo"
LABEL email="630435133@qq.com"
ENV REFRESHED_AD 2019-02-13
RUN apt-get -yqq update
RUN apt-get install -yqq wget
RUN mkdir /redis
WORKDIR /redis
RUN wget http://download.redis.io/redis-stable.tar.gz
RUN tar zxvf redis-stable.tar.gz
WORKDIR /redis/redis-stable/deps
RUN apt-get -yqq install gcc make
RUN make hiredis lua jemalloc linenoise
WORKDIR /redis/redis-stable
RUN make && make PREFIX=/redis install
VOLUME [ "/var/lib/redis", "/var/log/redis/" ]
EXPOSE 6379
```    
### 6.3.3 Redis 主镜像

我们继续构建第一个 Redis 镜像，即 Redis 主服务器:   

```
$ mkdir redis_primary
$ cd redis_primary
$ vim Dockerfile
```    

Dockerfile:   

```
FROM dbredis
LABEL maintainer="630435133@qq.com"
ENTRYPOINT ["/redis/bin/redis-server", "--logfile /var/log/redis/redis-server.log"]
```   

构建主镜像 `docker build -t dbredispri .`。    

### 6.3.4 Redis 副本镜像

```
$ mkdir redis_replica
$ cd redis_replica
$ touch Dockerfile
```   

Dockerfile:   

```
FROM dbredis
LABEL maintainer="630435133@qq.com"
ENTRYPOINT ["/redis/bin/redis-server",  "--logfile /var/log/redis/redis-replica.log", "--slaveof redis_primary 6379"]
```   

然后构建副本镜像 `docker build -t dbredisrep`    

### 6.3.5 创建 Redis 后端集群

首先创建一个用来运行 Express 应用程序的网络，称其为express。    

```
$ docker network create express
```   

然后在这个网络中运行 Redis 主容器：   

```
docker run -d -h redis_primary \
  --net express --name redis_primary dbredispri
```   

-h 标志用来设置容器的主机名。这会覆盖默认的行为（默认将容器的主机名设置为容器ID）并允许我们指定
自己的主机名。使用这个标志可以确保容器使用 redis_primary 作为主机名，并被本地的DNS服务正确解析。   

下一步创建一个 Redis 副本容器：   

```
$ docker run -d -h redis_replica1 --name redis_replica1 \
--net express dbredisrep
```   

但是查看日志发现从 Redis 并未连接上，一开始是说保护模式，所以需要修改一下 primary 的 Dockerfile:   

```
FROM dbredis
LABEL maintainer="630435133@qq.com"
WORKDIR /redis
RUN mkdir conf
RUN cp /redis/redis-stable/redis.conf /redis/conf/redis.conf
ENTRYPOINT ["/redis/bin/redis-server", "/redis/conf/redis.conf", "--logfile /var/log/redis/redis-server.log"]
```   

然后进入 primary 容器把 protected-mode 修改为 no，然后还有就是把 bind 修改为 0.0.0.0，不然
好像还是只能本地访问，这些操作懒得写在 Dockerfile 里了，用 docker exec 手动修改吧。   

修改完以后重启 redis，就可以了。   

现在启动另一个副本容器 redis_replica2:   

```
$ docker run -d -h redis_replica2 \
  --name redis_replica2 --net express dbredisrep
```   

### 6.3.6 创建 Node 容器

启动 Nodejs 应用容器：   

```
$ docker run -d --name nodeapp -p 3000:3000 --net express dbnode
```   

现在访问 3000 端口就已经有内容了。   

### 6.3.7 捕获应用日志

现在应用已经可以运行了，需要把这个应用放到生产环境中。在生产环境里需要确保可以捕获日志并将日志
保存到日志服务器。我们将使用Logstash来完成这件事。我们先来创建一个Logstash镜像：   

```
$ mkdir logstash
$ cd logstash
$ vim Dockerfile
```   

算了有点麻烦，后面先暂时略了。   