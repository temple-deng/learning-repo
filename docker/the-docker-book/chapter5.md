# 第 5 章 在测试中使用 Docker

<!-- TOC -->

- [第 5 章 在测试中使用 Docker](#第-5-章-在测试中使用-docker)
  - [5.1 使用 Docker 测试静态网站](#51-使用-docker-测试静态网站)
    - [5.1.1 Sample 网站的初始 Dockerfile](#511-sample-网站的初始-dockerfile)
    - [5.1.2 构建 Sample 网站和 Nginx 镜像](#512-构建-sample-网站和-nginx-镜像)
    - [5.1.3 从 Sample 网站和 Nginx 镜像构建容器](#513-从-sample-网站和-nginx-镜像构建容器)
  - [5.2 使用 Docker 构建并测试 Web 应用程序](#52-使用-docker-构建并测试-web-应用程序)
    - [5.2.1 构建 Sinatra 应用程序](#521-构建-sinatra-应用程序)
    - [5.2.2 创建 Sinatra 容器](#522-创建-sinatra-容器)
    - [5.2.3 扩展 Sinatra 应用程序来使用 Redis](#523-扩展-sinatra-应用程序来使用-redis)
    - [5.2.4 将 Sinatra 应用程序连接到 Redis 容器](#524-将-sinatra-应用程序连接到-redis-容器)
    - [5.2.5 Docker 内部连网](#525-docker-内部连网)
    - [5.2.6 Docker Networking](#526-docker-networking)
  - [5.3 Docker 用于持续集成](#53-docker-用于持续集成)
    - [5.3.1 构建 Jenkins 和 Docker 服务器](#531-构建-jenkins-和-docker-服务器)

<!-- /TOC -->

为了演示，我们将会看到下面 3 个使用场景：  

- 使用 Docker 测试一个静态网站
- 使用 Docker 创建并测试一个 Web 应用
- 将 Docker 用于持续集成

## 5.1 使用 Docker 测试静态网站

### 5.1.1 Sample 网站的初始 Dockerfile

```bash
$ mkdir sample
$ cd sample
$ touch Dockerfile
```    

现在还需要一些 Nginx 配置文件，才能运行这个网站。首先在这个示例所在的目录里创建一个名为 nginx
的目录，用来存放这些配置文件。我们可以从 Github 上下载作者准备好的示例文件：   

```bash
$ mkdir nginx && cd nginx
$ wget https://raw.githubusercontent.com/jamtur01/dockerbook-cde/
master/code/5/sample/nginx/global.conf
$ wget https://raw.githubusercontent.com/jamtur01/dockerbook-cde/
master/code/5/sample/nginx/nginx.conf
$ cd ..
```   

现在创建 Dockerfile:   

```
FROM ubuntu:16.04
MAINTAINER dengbo "d18710360845@gmail.com"
ENV REFRESHED_AT 2019-01-18
RUN apt-get -yqq update && apt-get -yqq install nginx
RUN mkdir -p /var/www/html/website
ADD nginx/global.conf /etc/nginx/conf.d/
ADD nginx/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```    

这个 Nginx 配置文件是为了运行 Sample 网站而配置的。配置文件 global.conf 的内容如下：   

```
server {
  listen        0.0.0.0:80;
  server_name   _;
  root          /var/www/html/website;
  index         index.html index.htm;
  access_log    /var/log/nginx/default_access.log;
  error_log     /var/log/nginx/default_error.log;
}
```    

我们还需要将 Nginx 配置为非守护进程的模式，这样可以让 Nginx 在 Docker 容器里工作（why?）。
nginx.conf 的内容如下：   

```
user www-data;
worker_processes 4;
pid /run/nginx.pid;
daemon off;
events { }
http {
  sendfile on;
  tcp_nopush on;
  tcp_nodelay on;
  keepalive_timeout 65;
  types_hash_max_size 2048;
  include /etc/nginx/mime.types;
  default_type application/octet-stream;
  access_log /var/log/nginx/access.log;
  error_log /var/log/nginx/error.log;
  gzip on;
  gzip_disable "msie6";
  include /etc/nginx/conf.d/*.conf;
}
```   

在这个配置文件里，daemon off; 选项阻止 Nginx 进入后台，强制其在前台运行。这是因为要想保持 Docker
容器的活跃状态，需要其中运行的进程不能中断。默认情况下，Nginx 会以守护进程的方式启动，这会导致容器
只是短暂运行，在守护进程被 fork 启动后，发起守护进程的原始进程就会退出，这时容器就停止运行了。   

### 5.1.2 构建 Sample 网站和 Nginx 镜像

```bash
$ docker build -t dengbo/nginx
```   

### 5.1.3 从 Sample 网站和 Nginx 镜像构建容器

现在可以从构建的镜像启动用来测试 Sample 网站的容器了，为此，需要添加 Sample 网站的代码，现在
下载这段代码到 sample 目录：   

```bash
$ mkdir website && cd website
$ wget https://raw.githubusercontent.com/jamtur01/dockerbook-code/master/code/5/sample/website/index.html
$ cd ..
```   

然后运行我们的容器：   

```bash
$ docker run -d -p 80 --name website \
-v $PWD/website:/var/www/html/website \
dengbo/nginx nginx
```   

-v 选项允许我们将宿主机的目录作为卷，挂载到容器里。   

卷在 Docker 里非常重要，也很有用。卷是在一个或者多个容器内被选定的目录，可以绕过分层的联合文件
系统，为 Docker 提供持久数据或者共享数据。这意味着对卷的修改会直接生效，并绕过镜像。当提交或者
创建镜像时，卷不会被包含镜像里。    

当我们因为某些原因不想把应用或者代码构建到镜像中时，就体现出卷的价值了。例如：   

- 希望同时对代码做开发和测试
- 代码改动很频繁，不想在开发过程中重构镜像
- 希望在多个容器间共享代码

可以通过在目录后面加上 rw 或者 ro 来指定容器内目录的读写状态：   

```bash
$ docker run -d -p 80 --name website \
-v $PWD/website:/var/www/html/website:ro \
dengbo/nginx nginx
```    

这将使目的目录 /var/www/html/website 变成只读状态。    

## 5.2 使用 Docker 构建并测试 Web 应用程序

我们将要测试一个基于Sinatra的Web应用程序，而不是静态网站，然后我们将基于 Docker 来对这个应用
进行测试。Sinatra 是一个基于 Ruby 的 Web 应用框架，它包含一个Web应用库，以及简单的领域专用语言
（即DSL）来构建Web应用程序。与其他复杂的Web应用框架（如Ruby on Rails）不同，Sinatra并不遵循
MVC模式，而关注于让开发者创建快速、简单的Web应用。    

### 5.2.1 构建 Sinatra 应用程序

```bash
$ mkdir -p sinatra
$ cd sinatra
```    

Dokcerfile:   

```
FROM ubuntu:14.04
MAINTAINER James Turnbull "james@example.com"
ENV REFRESHED_AT 2014-06-01
RUN apt-get update -yqq && apt-get -yqq install ruby ruby-dev build-essential redis-tools
RUN gem install --no-rdoc --no-ri sinatra json redis
RUN mkdir -p /opt/webapp
EXPOSE 4567
CMD [ "/opt/webapp/bin/webapp" ]
```    

我们安装了 Ruby, RubyGem, 使用 gem 安装了 sinatra, json 和 redis gem。    

现在使用 docker build 构建新镜像：   

```bash
$ docker build -t dengbo/sinatra .
```   

### 5.2.2 创建 Sinatra 容器

下载程序源代码，在 webapp 目录下，由 bin 和 lib 两个目录组成：    

```bash
$ cd sinatra
$ wget --cut-dirs=3 -nH -r --reject Dockerfile,index.html --no-parent \
http://dockerbook.com/code/5/sinatra/webapp/
```    

尴尬，这个地址返回 404，我从 github 上下的代码。   

webapp 源代码的核心在 lib/app.rb 文件中：   

```ruby
require "rubygems"
require "sinatra"
require "json"

class App < Sinatra:Application
  set :bind '0.0.0.0'

  get '/' do
    "<h1>DockerBook Test Sinatra app</h1>"
  end

  post '/json/?' do
    params.to_json
  end

end
```    

这个程序很简单，所有访问 /json 端点的 POST 请求参数都会被转换为 JSON 的格式后输出。   

这里还要使用 `chmod` 命令保证 webapp/bin/webapp 这个文件可以执行：   

```bash
$ chmod +x webapp/bin/webapp
```    

现在我们就可以基于我们的镜像，通过 `docker run` 命令启动一个新容器：    

```bash
$ docker run -d -p 4567 --name webapp -v $PWD/webapp:/opt/webapp dengbo/sinatra
```    

使用 curl 命令来测试这个应用程序：   

```bash
$ curl -i -H 'Accept: application/json' \
-d 'name=Foo&status=Bar' http://localhost:32772/json
HTTP/1.1 200 OK
Content-Type: text/html;charset=utf-8
Content-Length: 29
X-Xss-Protection: 1; mode=block
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Server: WEBrick/1.3.1 (Ruby/2.3.1/2016-04-26)
Date: Fri, 18 Jan 2019 04:45:14 GMT
Connection: Keep-Alive

{"name":"Foo","status":"Bar"}
```   

### 5.2.3 扩展 Sinatra 应用程序来使用 Redis

现在我们将要扩展 Sinatra 应用程序，加入 Redis 后端数据库，并在 Redis 数据库中存储输入的 URL
参数。我们打到这个目的，我们要下载一个新版本的 Sinatra 应用程序。我们还将创建一个运行 Redis 数据
库的镜像和容器。    

```bash
$ cd sinatra
$ wget --cut-dirs=3 -nH -r --reject Dockerfile,index.html --no-parent http://dockerbook.com/code/5/sinatra/webapp_redis/
```      

现在看一下 lib/app.rb 中的代码：   

```ruby
require "rubygems"
require "sinatra"
require "json"
require "redis"

class App < Sinatra::Application

  redis = Redis.new(:host => 'db', :port => '6379')

  set :bind, '0.0.0.0'

  get '/' do
    "<h1>DockerBook Test Redis-enabled Sinatra app</h1>"
  end

  get '/json' do
    params = redis.get "params"
    params.to_json
  end

  post '/json/?' do
    redis.set "params", [params].to_json
    params.to_json
  end
end
```    

我们创建了一个到 Redis 的连接，用来连接名为 db 的宿主机上的 Redis 数据库，端口为 6379。我们在
POST 请求处理中，将 URL 参数保存到了 Redis 数据库，并在需要的时候通过 GET 请求从中取回这个值。   

我们同样需要确保webapp_redis/bin/webapp文件在使用之前具备可执行权限：   

```bash
$ chmod +x webapp_redis/bin/webapp
```   

为了构建 Redis 数据库，要创建一个新的镜像，我们需要在 sinatra 目录下创建一个 redis 目录，用来
保存构建 Redis 容器所需的所有相关文件：   

```bash
$ mkdir -p sinatra/redis
$ cd sinatra/redis
```    

编写 Dockerfile

```
FROM ubuntu:18.04
MAINTAINER dengbo "d18710360845@gmail.com"
ENV REFRESHED_AD 2019-01-18
RUN apt-get -yyq && apt-get -yqq install redis-server redis-tools
EXPOSE 6379
ENTRYPOINT ["/usr/bin/redis-server"]
CMD []
```   

现在来构建镜像：   

```bash
$ docker build -t dengbo/redis .
```   

然后启动容器：   

```bash
$ docker run -d -p 6379 --name redis dengbo/redis
```    

试着连接 Redis 实例，我们需要在本地安装 Redis 客户端做测试。这个先略。   

### 5.2.4 将 Sinatra 应用程序连接到 Redis 容器

我们来更新 Sinatra 应用程序，让其连接到 Redis 并存储传入的参数。为此，需要能够与 Redis 服务器
对话。要做到这一点，可以用以下几种方式：   

- Docker 的内部网络
- 从 Docker 1.9 起，可以使用 Docker Networking 以及 docker network 命令
- Docker 链接，一个可以将具体容器链接到一起来进行通信的抽象层    

第一种方法，Docker 的内部网络这种解决方案并不是灵活、强大。我们针对这种方式的到来，也只是为了介绍
Docker 网络是如何工作的。我们不推荐采用这种方式来连接 Docker 容器。   

两种比较现实的连接 Docker 容器的方式是 Docker Networking 和 Docker 链接（Docker link）。

- Docker Networking 可以将容器连接到不同宿主机上的容器
- 通过 Docker Networking 连接的容器可以在无需更新连接的情况下，停止、启动或者重启容器。而使用
Docker 链接，则可能需要更新一些配置，或者重启相应的容器来维护 Docker 容器之间的链接
- 使用 Docker Networking，不必事先创建容器再去连接它。同样，也不必关系容器的运行顺序，读者可以
在网络内部获得容器名解析和发现。      

### 5.2.5 Docker 内部连网

在安装 Docker 时，会创建一个新的网络接口，名字是 docker0。每个 Docker 容器都会在这个接口上
分配一个 IP 地址。    

```bash
$ ip a show docker0
4: docker0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP
  link/ether 06:41:69:71:00:ba brd ff:ff:ff:ff:ff:ff
  inet 172.17.42.1/16 scope global docker0
  inet6 fe80::1cb3:6eff:fee2:2df1/64 scope link
  valid_lft forever preferred_lft forever
. . .
```   

可以看到，docker0 接口有符合 RFC1918 的私有 IP 地址，范围是 172.16~172.30。接口本身的地址
172.17.42.1 是这个 Docker 网络的网关地址，也是所有 Docker 容器的网关地址。    

接口 docker0 是一个虚拟的以太网桥，用户连接容器和本地宿主网络。Docker 每创建一个容器就会创建
一组互联的网络接口。这组接口就像管道的两端。这组接口其中一端作为容器里的 eth0 接口，而另一端统一
命名为类似 vethec6a 这种名字，作为宿主机的一个端口。可以把 veth 接口认为是虚拟网线的一端。这个
虚拟网线一端插在名为 docker0 的网桥上，另一端插到容器里。通过把每个 veth* 接口绑定到 docker0
网桥，Docker 创建了一个虚拟子网，这个子网由宿主机和所有的 Docker 容器共享。   

剩下的有点乱，先跳过。   

使用 `docker inspect` 命令来查看新的 Redis 容器的网络配置：   

```bash
$ docker inspect redis
....
  "NetworkingSettings": {
    "Bridge": "",
    "SandboxID": "2a59caab9d1085783ac3c4df935d64227872486c7b03593182867220194d0767",
    "HairpinMode": false,
    "LinkLocalIPv6Address": "",
    "LinkLocalIPv6PrefixLen": 0,
    "Ports": {
      "6379/tcp": [
        {
          "HostIp": "0.0.0.0",
          "HostPort": "32773"
        }
      ]
    }
    "Gateway": "172.17.0.1",
    "GlobalIPv6Address": "",
    "GlobalIPv6PrefixLen": 0,
    "IPAddress": "172.17.0.4",
  }
```    

容器的 IP 地址为 172.17.0.18。    

虽然第一眼看上去这是让容器互联的一个好方案，但可惜的是，这种方法有两个大问题：第一，要在应用程序
里对 Redis 容器的 IP 地址做硬编码；第二，如果重启容器，Docker 会改变容器的 IP 地址。   

### 5.2.6 Docker Networking

容器之间的连接用网络创建，这被称为 Docker Networking。Docker Networking 允许用户创建自己的
网络，容器可以通过这个网上互相通信。更重要的是，现在容器可以跨越不同的宿主机来通信。    

要想使用 Docker 网络，需要先创建一个网络，然后在这个网络下启动容器：   

```bash
docker network create app
```    

这里用 `docker network` 命令创建了一个桥接网络。   

然后可以用 `docker network inspect` 命令查看新创建的网络：   

```bash
$ docker network inspect app
```    

我们可以看到这个新网络是一个本地的桥接网络。除了运行于单个主机之上的桥接网络， 我们也可以创建一个
overlay网络，overlay网络允许我们跨多台宿主机进行通信。     

可以使用 `docker network ls` 命令列出当前系统中的所有网络，也可以使用 `docker network rm`
删除一个网络。   

启动容器并将容器添加到网络中：    

```bash
$ docker run -d --net=app --name db dengbo/redis
```    

接着，我们再在我们创建的网络下增加了一个运行启用了 Redis 的 Sinatra 应用程序的容器：   

```bash
$ cd sinatra/webapp
$ docker run -p 4567 --net=app --name webapp -ti -v $PWD/webapp:/opt/webapp dengbo/sinatra \
/bin/bash
```   

这里应该是先删了之前的那个 webapp 容器吧，不然肯定冲突了。而且注意这里的 /bin/bash 覆盖了
Dockerfile 里的 CMD，因此web程序并未启动。   

需要我们在容器内启动应用程序：   

```bash
$ root@305c5f27dbd1:/# _nohup /opt/webapp/bin/webapp &_
```   

这条命令反正我执行的时候是出错了。   

如果任何一个容器重启了，那么它们的 IP 地址则会自动在 /etc/hosts 文件中更新。   

尴尬测试的时候，redis 报错了，说是什么保护模式。    

**将已有容器连接到 Docker 网络**    

也可以将正在运行的容器通过 `docker network connect` 命令添加到已有的网络中，假设现在有 1 个
名为 db2 的容器：   

```bash
$ docker network connect app db2
```    

当然也可以通过 `docker newwork disconnect app db2`。    

## 5.3 Docker 用于持续集成

在持续集成环境里，每天要执行好几次安装并分发到宿主机的过程。这为测试生命周期增加了构建和配置开销。
打包和安装也消耗了很多时间，而且这个过程很恼人，尤其是需求变化频繁或者需要复杂、耗时的处理步骤
进行清理的情况下。    

### 5.3.1 构建 Jenkins 和 Docker 服务器

```bash
$ mkdir jenkins
$ cd jenkins
```   

Dockerfile:   

```
FROM ubuntu:18.04
MAINTAINER dengbo "d18710360845@gmail.com"
ENV REFRESHED_AT 2019-01-18
RUN apt-get update -qq && apt-get install -qqy curl apt-transport-https
RUN apt-key adv --keyserver hkp://p80.pool.sks.keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D
RUN echo deb https://apt.dockerproject.org/repo ubuntu-trusty main > /etc/apt/sources.list.d/docker.list
RUN apt-get update -qq && apt-get install -qqy iptables cacertificates openjdk-7-jdk git-core docker-engine
ENV JENKINS_HOME /opt/jenkins/data
ENV JENKINS_MIRROR http://mirrors.jenkins-ci.org
RUN mkdir -p $JENKINS_HOME/plugins
RUN curl -sf -o /opt/jenkins/jenkins.war -L $JENKINS_MIRROR/warstable/latest/jenkins.war
RUN for plugin in chucknorris greenballs scm-api git-client git ws-cleanup; do curl -sf -o $JENKINS_HOME/plugins/${plguin}.hpi -L $JENKINS_MIRROR/plugins/${plugin}/latest/${plugin}.hpi; done
ADD ./dockerjenkins.sh /usr/local/bin/dockerjenkins.sh
RUN chmod +x /usr/local/bin/dockerjenkins.sh
VOLUME /var/lib/docker
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/dockerjenkins.sh"]
```    

首先设置了 Ubuntu 环境，加入了需要的 Docker APT 仓库，并加入了对应的 GPG key。之后更新了包
列表，并安装执行 Docker 和 Jenkins 所需要的包。然后创建了 /opt/jenkins 目录，并把最新稳定
版本的 Jenkins 下载到这个目录。还需要一些 Jenkins 插件。   

VOLUME 指令从容器运行的宿主机上挂载了一个卷。在这里我们指定了 /var/lib/docker 作为卷。
/var/lib/docker 目录是 Docker 用来存储器容器的目录。这个位置必须是真实的文件系统，不能是像
Docker 镜像层那种挂载点。    

我们使用 VOLUME 指定告诉 Docker 进程，在容器运行内部使用宿主机的文件系统作为容器的存储。这样
容器内嵌 Docker 的 /var/lib/docker 目录将保存在宿主机系统的 /var/lib/docker/volumes 目录
下的某个位置。    

最后我们指定了一个要运行的 shell 脚本作为容器的启动命令，这个 shell 脚本帮助在宿主机上配置
Docker，允许在 Docker 里运行 Docker，开启 Docker 守护进程，并且启动 Jenkins。   

```bash
$ chmod 0755 dockerjenkins.sh
```   

然后开始构建新的镜像：   

```bash
$ docker build -t dengbo/dockerjenkins .
```    

很尴尬，构建镜像失败了，所以后面的就暂时跳过了。。。。。
