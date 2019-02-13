# 第 7 章 Docker 编排和服务发现

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

