# 第 7 章 Docker 编排和服务发现

<!-- TOC -->

- [第 7 章 Docker 编排和服务发现](#第-7-章-docker-编排和服务发现)
  - [7.1 Docker Compose](#71-docker-compose)
    - [7.1.1 安装 Docker Compose](#711-安装-docker-compose)
    - [7.1.2 获取示例应用](#712-获取示例应用)
    - [7.1.3 docker-compose.yml 文件](#713-docker-composeyml-文件)
    - [7.1.4 运行 Compose](#714-运行-compose)
    - [7.1.5 使用 Compose](#715-使用-compose)
  - [7.2 Consul、服务发现和 Docker](#72-consul服务发现和-docker)
    - [7.2.1 构建 Consul 镜像](#721-构建-consul-镜像)
  - [7.3 Docker Swarm](#73-docker-swarm)
    - [7.3.1 安装 Swarm](#731-安装-swarm)
    - [7.3.2 创建 Swarm 集群](#732-创建-swarm-集群)

<!-- /TOC -->

编排（orchestration）是一个没有严格定义的概念。这个概念大概描述了自动配置、协作和管理服务的过程。
在Docker的世界里，编排用来描述一组实践过程，这个过程会管理运行在多个Docker容器里的应用，而这些
Docker 容器有可能运行在多个宿主机上。Docker 对编排的原生支持非常弱，不过整个社区围绕编排开发
和集成了很多很棒的工具。    

## 7.1 Docker Compose

使用 Docker Compose，可以用一个 YAML 文件定义一组要启动的容器，以及容器运行时的属性。Docker
Compose 称这些容器为“服务”，像这样定义：容器通过某些方法并指定一些运行时的属性来和其他容器产生交互。   

### 7.1.1 安装 Docker Compose

在 Linux 上安装 Docker Compose:  

```
$ bash -c "curl -L https://github.com/docker/compose/release/download/1.5.0/docker
-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose"
$ chmod +x /usr/local/bin/docker-compose
```   

如果是在OS X上， Docker Toolbox 已经包含了Docker Compose，如果是在Windows平台上，也可以用
Docker Toolbox，里面包含了 Docker Compose。   

安装好后测试：   

```
$ docker-compose --version
docker-compose version 1.23.2, build 1110ad01
```   

### 7.1.2 获取示例应用

这里使用一个Python Flask应用作为例子，这个例子使用了以下两个容器：   

- 应用容器，运行 Python 示例程序
- Redis 程序，运行 Redis 数据库   

```
$ mkdir composeapp
$ cd composeapp
$ vim Dockerfile
```   

之后，需要添加应用程序的源代码。创建一个名叫app.py的文件:   

```python
from flask import Flask
from redis import Redis
import os
app = Flask(__name__)
redis = Redis(host="redis_1", port=6379)
@app.route('/')
def hello():
    redis.incr('hits')
    return 'Hello Docker Book reader! I have been seen {0} times'.format(redis.get('hits'))
if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
```    

现在还需要创建requirements.txt文件来保存应用程序的依赖关系。   

```
flask
redis
```  

然后来看 Dockerfile:   

```
FROM python
LABEL maintainer="dengbo01@baidu.com"
ADD . /composeapp
WORKDIR /composeapp
RUN pip install -r requirements.txt
```   

然后就是构建镜像。   

### 7.1.3 docker-compose.yml 文件

在 Compose 中，我们定义了一组要启动的服务（以 Docker 容器的形式表现），我们还定义了我们希望
这些服务要启动的运行时属性，这些属性和 docker run 命令需要的参数类似。将所有与服务有关的属性
都定义在一个 YAML 文件里。之后执行 docker-compose up 命令，Compose 会启动这些容器，使用
指定的参数来执行，并将所有的日志输出合并到一起。   

```
$ touch docker-compose.yml
```   

yaml 内容：   

```ymal
web:
  image: dbcomposeapp
  command: python app.py
  ports:
    - "5000:5000"
  volumes:
    - .:/composeapp
  links:
    - redis
redis:
  image: redis
```    

每个要启动的服务都使用一个 YAML 的散列键定义：web 和 redis。   

对于 web 服务，指定了一些运行时参数。首先，使用 image 指定了要使用的镜像：dbcomposeapp。
Compose 也可以构建 Docker 镜像。可以使用 build 指令，并提供一个到 Dockerfile 的路径，让
Compose 构建一个镜像，并使用这个镜像创建服务。   

```
web:
  build: /home/james/composeapp
  ...
```   

这个build指令会使用/home/james/composeapp目录下的 Dockerfile 来构建Docker镜像。   

我们还使用 command 指定服务启动时要执行的命令。接下来使用 ports 和 volumes 指定了我们的服务
要映射到的端口和卷，我们让服务里的 5000 端口映射到主机的 5000 端口，并创建了卷/composeapp。
最后使用 links 指定了要连接到服务的其他服务：将 redis 服务连接到 web 服务。   

### 7.1.4 运行 Compose

一旦在 docker-compose.yml 中指定了需要的服务，就可以使用 `docker-compose up` 命令来执行
这些服务。   

```
$ cd composeapp
$ docker-compose up
Creating composeapp_redis_1 ... done
Creating composeapp_web_1   ... done
Attaching to composeapp_redis_1, composeapp_web_1
redis_1  | 1:C 13 Feb 2019 11:03:52.947 # oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
redis_1  | 1:C 13 Feb 2019 11:03:52.947 # Redis version=5.0.3, bits=64, commit=00000000, modified=0, pid=1, just started
redis_1  | 1:C 13 Feb 2019 11:03:52.947 # Warning: no config file specified, using the default config. In order to specify a config file use redis-server /path/to/redis.conf
redis_1  | 1:M 13 Feb 2019 11:03:52.949 * Running mode=standalone, port=6379.
redis_1  | 1:M 13 Feb 2019 11:03:52.949 # WARNING: The TCP backlog setting of 511 cannot be enforced because /proc/sys/net/core/somaxconn is set to the lower value of 128.
redis_1  | 1:M 13 Feb 2019 11:03:52.949 # Server initialized
redis_1  | 1:M 13 Feb 2019 11:03:52.949 # WARNING you have Transparent Huge Pages (THP) support enabled in your kernel. This will create latency and memory usage issues with Redis. To fix this issue run the command 'echo never > /sys/kernel/mm/transparent_hugepage/enabled' as root, and add it to your /etc/rc.local in order to retain the setting after a reboot. Redis must be restarted after THP is disabled.
redis_1  | 1:M 13 Feb 2019 11:03:52.949 * Ready to accept connections
web_1    |  * Serving Flask app "app" (lazy loading)
web_1    |  * Environment: production
web_1    |    WARNING: Do not use the development server in a production environment.
web_1    |    Use a production WSGI server instead.
web_1    |  * Debug mode: on
web_1    |  * Running on http://0.0.0.0:5000/ (Press CTRL+C to quit)
web_1    |  * Restarting with stat
web_1    |  * Debugger is active!
web_1    |  * Debugger PIN: 323-953-220
```    

可以看到 Compose 创建了 composeapp_redis_1 和 composeapp_web_1 这两个新的服务。为了保证
服务是唯一的，Compose 将 docker-compose.yml 文件中指定的服务名字加上了目录名作为前缀，并分
别使用数字作为后缀。    

Compose之后接管了每个服务输出的日志，输出的日志每一行都使用缩短的服务名字作为前缀，并交替输出在
一起。    

服务（和Compose）交替运行。这意味着，如果使用Ctrl+C来停止 Compose 运行，也会停止运行的服务。
也可以在运行 Compose 时指定 -d 标志，以守护进程的模式来运行服务。    

这个应用绑定在宿主机所有网络接口的 5000 端口上，所以可以使用宿主机的IP或者通过localhost来浏览
该网站。    

### 7.1.5 使用 Compose

使用 `docker-compose ps` 命令（docker ps命令的近亲）可以查看这些服务的运行状态。   

`docker-compose ps` 命令列出了本地 docker-compose.yml文件里定义的正在运行的所有服务。   

可以使用 `docker-compose logs` 命令来进一步查看服务的日志事件。   

使用 `docker-compose stop` 命令可以停止正在运行的服务。   

注意这两个服务其实也是普通的容器，可以使用 docker ps 查看到。   

如果使用 `docker-compose stop` 或者 `docker-compose kill` 命令停止服务，还可以使用
`docker-compose start` 命令重新启动这些服务。    

## 7.2 Consul、服务发现和 Docker

服务发现是分布式应用程序之间管理相互关系的一种机制。一个分布式程序一般由多个组件组成。这些组件可以
都放在一台机器上，也可以分布在多个数据中心，甚至分布在不同的地理区域。这些组件通常可以为其他组件
提供服务，或者为其他组件消费服务。    

服务发现允许某个组件在想要与其他组件交互时，自动找到对方。由于这些应用本身是分布式的，服务发现
机制也需要是分布式的。而且，服务发现作为分布式应用不同组件之间的“胶水”，其本身还需要足够动态、
可靠，适应性强，而且可以快速且一致地共享关于这些服务的数据。  

另外，Docker主要关注分布式应用以及面向服务架构与微服务架构。这些关注点很适合与某个服务发现工具
集成。每个Docker容器可以将其中运行的服务注册到服务发现工具里。注册的信息可以是IP地址或者端口，
或者两者都有，以便服务之间进行交互。  

Consul是一个使用一致性算法的特殊数据存储器。Consul 使用 Raft 一致性算法来提供确定的写入机制。
Consul 暴露了键值存储系统和服务分类系统，并提供高可用性、高容错能力，并保证强一致性。服务可以将
自己注册到 Consul，并以高可用且分布式的方式共享这些信息。   

Consul还提供了一些有趣的功能：    

- 提供了根据API进行服务分类，代替了大部分传统服务发现工具的键值对存储。
- 提供两种接口来查询信息：基于内置的 DNS 服务的 DNS 查询接口和基于 HTTP 的 REST API查询接口。
选择合适的接口，尤其是基于DNS的接口，可以很方便地将Consul与现有环境集成。
- 提供了服务监控，也称作健康监控。Consul内置了强大的服务监控系统。    

本章先介绍如何在 Docker 容器里分布式运行 Consul。之后会从 Docker 容器将服务注册到Consul，
并从其他 Docker 容器访问注册的数据。为了更有挑战，会让这些容器运行在不同的 Docker 宿主机上。
为了做到这些， 需要做到以下几点：   

- 创建Consul服务的Docker镜像。
- 构建3台运行Docker的宿主机，并在每台上运行一个Consul。这3台宿主机会提供一个分布式环境，来展现
Consul如何处理弹性和失效工作的。
- 构建服务，并将其注册到Consul，然后从其他服务查询该数据。    

### 7.2.1 构建 Consul 镜像

```
$ mkdir consul
$ cd consul
$ touch Dockerfile
```   

Dockerfile:   

```
FROM ubuntu:18.04
LABEL maintainer="dengbo@xxx.com"
RUN apt-get -yqq update
RUN apt-get -yqq install curl unzip
ADD https://dl.bintray.com/mitchellh/consul/0.3.1_linux_amd64.zip /tmp/consul.zip
RUN cd /usr/sbin && unzipm /tmp/consul.zip && chmod +x /usr/sbin/consul && rm /tmp/consul.zip
ADD https://dl.bintray.com/mitchellh/consul/0.3.1_web_ui.zip /tmp/webui.zip
RUN cd /tmp/ && unzip webui.zip && mv dist/ /webui/
ADD consul.json /config/
EXPOSE 53/udp 8300 8301 8301/udp 8302 8302/udp 8400 8500
VOLUME /data
ENTRYPOINT ["/usr/sbin/consul", "agent", "-config-dir=/config"]
CMD []
```   

consul.json 内容：    

```json
{
  "data_dir": "/data",
  "ui_dir": "/webui",
  "client_addr": "0.0.0.0",
  "ports": {
    "dns": 53
  },
  "recursor": "8.8.8.8"
}
```    

使用 ports 配置 Consul 服务运行时需要的端口。这里指定 Consul 的 DNS 服务运行在 53 端口。
之后，使用 recursor 选项指定了 DNS 服务器，这个服务器会用来解析Consul无法解析的DNS请求。    

...这部分内容先跳过

## 7.3 Docker Swarm

Docker Swarm 是一个原生的 Docker 集群管理工具。Swarm 将一组 Docker 主机作为一个虚拟的
Docker 主机来管理。Swarm有一个非常简单的架构，它将多台Docker主机作为一个集群，并在集群级别上
以标准 Docker API 的形式提供服务。这非常强大，它将Docker容器抽象到集群级别，而又不需要重新学习
一套新的API。这也使得 Swarm 非常容易和那些已经集成了 Docker 的工具再次集成，包括标准的Docker
客户端。对 Docker 客户端来说，Swarm集群不过是另一台普通的Docker主机而已。    

### 7.3.1 安装 Swarm

Docker 公司为 Swarm 提供了一个实时更新的 Docker 镜像，可以轻易下载并运行这个镜像。    

运行 Swarm 的所有 Docker 节点也都必须运行着同一个版本的Docker。    

我们将在两台主机上安装Swarm，这两台主机分别为 smoker 和 joker。smoker的主机IP是10.0.0.125，
joker的主机IP是10.0.0.135。    

先拉镜像：   

```
smoker$ docker pull swarm
joker$ docker pull swarm
```    

### 7.3.2 创建 Swarm 集群

可以创建 Swarm 集群了。集群中的每台主机上都运行着一个 Swarm 节点代理。每个代理都将该主机上的
相关 Docker 守护进程注册到集群中。和节点代理相对的是 Swarm 管理者，用于对集群进行管理。    

集群注册可以通过多种可能的集群发现后端（discovery backend）来实现。默认的集群发现后端是基于
Docker Hub。它允许用户在Docker Hub中注册一个集群，然后返回一个集群ID，我们之后可以使用这个
集群ID向集群添加额外的节点。    

我们在 smoker 上创建 Swarm 集群：   

```
smoker$ docker run --rm swarm create
b811b0bc438cb9a06fb68a25f1c9d8ab
```    

返回的字符串是集群 ID（话说这一般不是容器 ID 吗，难道我记错了）。我们能利用这个ID向Swarm集群中
添加节点。话说怎么好像没有暴露接口啊。   

接着我们在每个节点上运行 Swarm 代理，从 somker 主机开始：   

```
smoker$ docker run -d swarm join --addr=10.0.0.125:2375 \
token://b811b0bc438cb9a06fb68a25f1c9d8ab
b5fb4ecab5cc0dadc0eeb8c157b537125d37e541d0d96e11956c2903ca69eff0
```   

然后在 joker 上运行 Swarm 代理：   

```
joker$ docker run -d swarm join --addr=10.0.0.135:2375 \
token://b811b0bc438cb9a06fb68a25f1c9d8ab
537bc90446f12bfa3ba41578753b63f34fd5fd36179bffa2dc152246f4b449d7
```    

这将创建两个Swarm代理，这些代理运行在运行了swarm镜像的Docker化容器中。我们通过传递给容器的
join标志，通过—-addr选项传递本机IP地址，以及代表集群ID的token，启动一个代理。每个代理都会
绑定到它们所在主机的IP地址上。每个代理都会加入Swarm集群中去。   

完全没看懂。。。。    

等等，话说现在应该是启动了3个容器吧，一个控制节点 b811，剩下两个是所谓的代理节点对吧。   

查看代理容器的日志来了解代理内部是如何工作的：   

```
smoker$ docker logs b5fb4ecab5cc
time="2015-04-12T17:54:35Z" level=info msg="Registering on the
discovery service every 25 seconds..." addr="10.0.0.125:2375"
discovery="token://b811b0bc438cb9a06fb68a25f1c9d8ab"
time="2015-04-12T17:55:00Z" level=info msg="Registering on the
discovery service every 25 seconds..." addr="10.0.0.125:2375"
discovery="token://b811b0bc438cb9a06fb68a25f1c9d8ab"
. . .
```    

代理每隔25秒就会向发现服务进行注册。这将告诉发现后端 Docker Hub 该代理可用，该Docker服务器
也可以被使用。    

算了，也懒得看了。。。

