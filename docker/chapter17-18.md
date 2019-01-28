# 第三部分 进阶技能

<!-- TOC -->

- [第三部分 进阶技能](#第三部分-进阶技能)
- [第 17 章 核心实现技术](#第-17-章-核心实现技术)
  - [17.1 基本架构](#171-基本架构)
    - [17.1.1 服务端](#1711-服务端)
    - [17.1.2 客户端](#1712-客户端)
  - [17.2 命名空间](#172-命名空间)
    - [17.2.1 进程命名空间](#1721-进程命名空间)
    - [17.2.2 IPC 命名空间](#1722-ipc-命名空间)
    - [17.2.3 网络命名空间](#1723-网络命名空间)
    - [17.2.4 挂载命名空间](#1724-挂载命名空间)
    - [17.2.5 UTS 命名空间](#1725-uts-命名空间)
    - [17.2.6 用户命名空间](#1726-用户命名空间)
  - [17.3 控制组](#173-控制组)
  - [17.4 联合文件系统](#174-联合文件系统)
    - [17.4.1 Docker 存储原理](#1741-docker-存储原理)
    - [17.4.2 Docker 存储结构](#1742-docker-存储结构)
  - [17.5 Linux 网络虚拟化](#175-linux-网络虚拟化)
    - [17.5.1 基本原理](#1751-基本原理)
    - [17.4.2 网络创建过程](#1742-网络创建过程)
    - [17.4.3 手动配置网络](#1743-手动配置网络)
- [第 18 章 配置私有仓库](#第-18-章-配置私有仓库)
  - [18.1 安装 Docker Registry](#181-安装-docker-registry)
    - [18.1.1 基于容器安装运行](#1811-基于容器安装运行)
    - [18.1.2 本地安装运行](#1812-本地安装运行)
  - [18.2 配置 TLS 证书](#182-配置-tls-证书)
  - [18.3 管理访问权限](#183-管理访问权限)
    - [18.3.1 Docker Registry v2 的认证模式](#1831-docker-registry-v2-的认证模式)

<!-- /TOC -->

# 第 17 章 核心实现技术

Docker 容器运行在操作系统上，需要来自操作系统的支持。本章将以容器领域最流行的 Linux 宿主系统为例，
介绍 Docker 底层依赖的核心技术：包括 Docker 基本架构、Linux 操作系统的命名空间（namespace）、
控制组（control group）、联合文件系统（union file system）和网络虚拟化支持等。   

## 17.1 基本架构

Docker 目前采用了标准的 C/S 架构，包括客户端、服务端两大核心组件，同时通过镜像仓库来存储镜像。
客户端和服务端可以运行在一个机器上，也可以通过 socket 或者 RESTful API 来进行通信。    

![@TODO:]

### 17.1.1 服务端

Docker 服务端一般在宿主主机后台运行，dockerd 作为服务端接受来自客户的请求，并通过 containerd
具体处理与容器相关的请求，包括创建、运行、删除容器等。服务端主要包括四个组件：   

- dockerd: 为客户端提供 RESTful API，响应来自客户端的请求，采用模块化的架构，通过专门的 Engine
模块来分发管理各个来自客户端的任务，可以单独升级；
- docker-proxy: 是 dockerd 的子进程，当需要进行容器端口映射时，docker-proxy 完成网络映射
配置；
- containerd: 是 dockerd 的子进程，提供 gRPC 接口响应来自 dockerd 的请求，对下管理 runC
镜像和容器环境。可以单独升级；
- containerd-shim: 是 containerd 的子进程，为 runC 容器提供支持，同时作为容器内进程的根进程。      

看图的话，docker-proxy 和 containerd-shim 都是可以有多个的。    

runC 是从 Docker 公司开源的 libcontainer 项目演化而来的，目前作为一种具体的开放容器标准实现
加入 Open Containers Initiative(OCI)。runC 已经支持了 Linux 系统中容器相关的技术栈。   

dockerd 默认监听本地的 unix:///var/run/docker.sock 套接字，只允许本地的 root 用户或 docker
用户组成员访问。可以通过 -H 选项来修改监听的方式。例如，让 docker 监听本地的 TCP 连接 1234
端口，代码如下：   

```bash
$ sudo dockerd -H 127.0.0.1:1234
```   

docker-proxy 只有当启动容器并且使用端口映射时候才会执行，负责配置容器的端口映射规则。   

### 17.1.2 客户端

Docker 客户端为用户提供一系列可执行命令，使用这些命令可实现与 Docker 服务端交互。    

用户使用的 Docker 可执行命令即为客户端程序。与 Docker 服务端保持运行方式不同，客户端发送命令
后，等待服务端返回；一旦收到返回后，客户端立刻执行结束并退出。     

客户端默认通过本地的 unix:///var/run/docker.sock 套接字向服务端发送命令。如果服务端没有监听
在默认的地址，则需要客户端在执行命令的时候显式地指定服务端地址：    

```bash
$ docker -H tcp://127.0.0.1:1234 info
```    

## 17.2 命名空间

利用命名空间这一特性，每个容器都可以拥有自己单独的命名空间，运行在其中的应用都像是在独立的操作系统
环境中一样。命名空间机制保证了容器之间彼此互不影响。    

在操作系统中，包括内核、文件系统、网络、进程号、用户号、进程间通信等资源，所有的资源都是应用进程
直接共享的。要想实现虚拟化，除了要实现对内存、CPU、网络 IO、硬盘 IO、存储空间的限制外，还要实现
文件系统、网络、PID、UID、IPC 等的相互隔离。前者相对容器实现一些，后者则需要宿主主机系统的深入
支持。   

让进程在彼此隔离的命名空间中运行。虽然这些进程仍在共用同一个内核和某些运行时环境（runtime），但是
彼此是不可见的，并且认为自己是独占系统。    

Docker 容器每次启动时候，通过调用 `func setNamespaces(daemon *Daemon, s *specs.Spec, c *container.Container) error` 方法来完成对各个命名空间的配置。   

### 17.2.1 进程命名空间

Linux 通过进程命名空间管理进程号，对于同一进程（同一个 task_struct），在不同的命名空间中，看到
的进程号不相同。每个进程命名空间有一套自己的进程号管理方法。进程命名空间是一个父子关系的结构，子
空间中的进程对于父空间是可见的。新 fork 出的一个进程，在父命名空间和子命名空间分别对应不同的
进程号。例如，查看 Docker 服务主进程（dockerd）的进程号是 3393，它作为父进程启动了 docker-containerd
进程，进程号为 3398：   

```bash
$ ps -ef | grep docker
root 3393 1 0 Jan18 ? 00:43:02 /usr/bin/dockerd -H fd:// -H tcp://127.0.0.1:2375
  -H unix:///var/run/docker.sock
root 3398 3393 0 Jan18 ? 00:34:31 docker-containerd --config /var/run/docker/containerd/containerd.toml
```    

新建一个 Ubuntu 容器，执行 sleep 命令。此时，docker-containerd 进程作为父进程，会为每个容器
启动一个 docker-containerd-shim 进程，作为该容器内所有进程的根进程：    

```bash
$ docker run --name test -d ubuntu:16.04 sleep 9999
3a4a3769a68cb157b5741c3ab2e0ba5ddc6a009e4690df4038512d95a40c5ea6

$ ps -ef | grep docker
root 21535 3398 0 06:57 ? 00:00:00 docker-containerd-shim --namespace moby --workdir
  /var/lib/docker/containerd/daemon/io.containerd.runtime.v1.linux/moby/3a4a3769a68cb157b5741c3ab2e0ba5ddc6a009e4690df4038512d95a40c5ea6
  --address /var/run/docker/containerd/docker-containerd.sock
  --runtime-root /var/run/docker/runtime-runc
```   

在宿主机上查看新建容器的进程的父进程，正是 docker-containerd-shim 进程：   

```bash
$ ps -ef | grep sleep
root  21569 21535  0 06:57 ?  00:00:00 sleep 9999
```   

而在容器内的进程空间中，则把 docker-contained-shim 进程作为 0 号根进程（类似宿主机系统中 0
号根进程 idle），while 进程的进程号则变为 1.   

### 17.2.2 IPC 命名空间

容器中的进程交互还是采用了 Linux 常见的进程间交互方法，包括信号量、消息队列和共享内存等方式。
PID 命名空间和 IPC 命名空间可以组合起来一起使用，同一个 IPC 命名空间内的进程可以彼此可见，允许
进行交互；不同空间的进程则无法交互。   

### 17.2.3 网络命名空间

有了进程命名空间后，不同命名空间中的进程号可以相互隔离，但是网络端口还是共享本地系统的端口。   

通过网络命名空间，可以实现网络隔离。一个网络命名空间为进程为进程提供了一个完全独立的网络协议栈的
视图。包括网络设备接口、IPv4 和 IPv6 协议栈、IP 路由表、防火墙规则、sockets 等，这样每个容器
的网络就能隔离开来。   

Docker 采用虚拟网络设备（Virtual Network Device，VND）的方式，将不同命名空间的网络设备
连接到一起。默认情况下，Docker 在宿主机上创建多个虚拟网桥，容器中的虚拟网卡通过网桥进行连接。    

@TODO:    

### 17.2.4 挂载命名空间

类似于 chroot，挂载命名空间可以将一个进程的根文件系统限制到一个特定的目录下。挂载命名空间允许
不同命名空间中的进程所看到的文件目录彼此是隔离的。例如，不同命名空间中的进程，都认为增加独占了
一个完整的根文件系统，但实际上，不同命名空间中的文件彼此隔离，不会造成相互影响，同时也无法影响
宿主机文件系统中的其他路径。   

### 17.2.5 UTS 命名空间

UTS(UNIX Time-sharing System)命名空间允许每个容器拥有独立的主机名和域名，从而可以虚拟出一个
有独立主机名和网络空间的环境，就跟网络上一台独立的主机一样。    

### 17.2.6 用户命名空间

每个容器可以有不同的用户和组 id，也就是说，可以在容器内使用特定的内部用户执行程序，而非本地系统
上存在的用户。    

每个容器内部都可以有最高权限的 root 账号，但跟宿主主机不在一个命名空间。通过使用隔离的用户命名
空间，可以提高安全性，避免容器内的进程获取到额外的权限；同时通过使用不同用户也可以进一步在容器
内控制权限。    

## 17.3 控制组

控制组是 Linux 内核的一个特性，主要用来对共享资源进行隔离、限制、审计等。只有将分配到容器的资源
进行控制，才能避免多个容器同时运行时对宿主机系统的资源竞争。    

具体来看，控制组提供如下功能：   

- **资源限制：**可将组设置一定的内存限制。
- **优先级：**通过优先级让一些组优先得到更多的 CPU 等资源
- **资源审计：**用来统计系统实际上把多少资源用到适合的目的上，可以使用 cpuacct 子系统记录某个
进程组使用的 CPU 时间
- **隔离：**为组隔离命名空间，这样使得一个组不会看到另一个组的进程、网络连接和文件系统
- **控制：**执行挂起、恢复和重启动等操作     

## 17.4 联合文件系统

联合文件系统（UnionFS）是一种轻量级的高性能分层文件系统，它支持将文件系统中的修改信息作为一次提交，
并层层叠加，同时可以将不同目录挂载到同一个虚拟文件系统下，应用看到的是挂载的最终结果。联合文件系统
是实现 Docker 镜像的技术基础。    

Docker 镜像可以通过分层来进行继承。例如，用户基于基础镜像来制作各种不同的应用镜像。这些镜像共享
同一个基础镜像层，提高了存储效率。此外，当用户改变了一个 Docker 镜像，则会创建一个新的层。因此，
用户不用替换整个原镜像或者重新建立，只需要添加新层即可。用户分发镜像的时候，页只需要分发被改动
的新层内容。    

### 17.4.1 Docker 存储原理

Docker 目前通过插件化方式支持多种文件系统后端。AUFS 支持为每一个成员目录（类似 Git 的分支）设定
只读（readonly）、读写（readwrite）或写出（writeout-able）权限，同时 AUFS 里有一个类似分层
的概念，对只读权限的分支可以逻辑上进行增量地修改。   

Docker 镜像自身就是由多个文件层组成，每一层有基于内容的唯一的编号（层ID）。可以通过 `docker history`
查看一个镜像由哪些层组成。     

对于 Docker 镜像来说，这些层的内容都是不可修改的、只读的。而当 Docker 利用镜像启动一个容器时，
将在镜像文件系统的最顶端再挂载一个新的可读写的层给容器。容器中的内容更新将会发生在可读写层。当所
操作对象位于较深的某层时，需要先复制到最上层的可读写层。当数据对象较大时，往往意味着较差的 IO 性能。
因此，对于 IO 敏感型应用，一般推荐将容器修改的数据通过 volume 方式挂载，而不是直接修改镜像内数据。   

### 17.4.2 Docker 存储结构

所有的镜像和容器都将存储在 Docker 指定的存储目录下，以 Ubuntu 宿主系统为例，默认路径是 /var/lib/docker。
在这个目录下，存储由 Docker 镜像和容器运行相关的文件和目录。   

## 17.5 Linux 网络虚拟化

### 17.5.1 基本原理

直观上看，要实现网络通信，机器需要至少一个网络接口（物理接口或虚拟接口）与外界相通，并可以收发数据
包，此外，如果不同子网之间要进行通信，还需要额外的路由机制。   

Docker 中的网络接口默认都是虚拟接口。虚拟接口的最大优势就是转发效率极高。这是因为 Linux 通过在
内核中进行数据复制来实现虚拟接口之间的数据转发，即发送接口的发送缓存中的数据包将被直接复制到接收
接口的接收缓存中，而无须通过外部物理网络设备进行交换。    

Docker 容器网络就很好地利用了 Linux 虚拟网络技术，它在本地主机和容器内分别创建一个虚拟接口
veth，并连通（这样的一对虚拟接口叫做 veth pair）。     

@TODO:    

### 17.4.2 网络创建过程

一般情况下，Docker 创建一个容器的时候，会具体执行如下操作：    

1. 创建一对虚拟接口，分别放到本地主机和新容器的命名空间中；
2. 本地主机一端的虚拟接口连接到默认的 docker0 网桥或指定网桥上，并具有一个以 veth 开头的唯一
名字，如 veth1234；
3. 容器一端的虚拟接口将放到新创建的容器中，并修改名字作为 eth0；
4. 从网桥可用地址段中获取一个空闲地址分配给容器的 eth0（例如 172.17.0.2/16），并配置默认路由
网关为 docker0 网卡的内部接口 docker0 的 IP 地址（例如 172.17.42.1/16）    

在使用 `docker container run` 命令启动容器的时候，可用通过 --net 参数来指定容器的网络配置。
有 5 个可选值 bridge、none、container、host 和用户定义的网络：    

- bridge：默认值，在 Docker 网桥 docker0 上为容器创建新的网络栈；
- none：让 Docker 将新容器放到隔离的网络栈，但是不进行网络配置。之后，用户可以自行配置；
- container:NAME_or_ID：让 Docker 将新建容器的进程放到一个已存在容器的网络栈中，新容器进程
有自己的文件系统、进程列表和资源限制，但会和已存在的容器共享 IP 地址和端口等网络资源，两者进程可以
直接通过 lo 环回接口通信；
- host：告诉 Docker 不要将容器网络放到隔离的命名空间中，即不要容器化容器内的网络。此时容器使用
本地主机的网络，它拥有完全的本地主机接口访问权限。容器进程跟主机其他 root 进程一样可以打开低范围
的端口，可以访问本地网络服务，还可以让容器做一些影响整个主机系统的事情
- user_defined_network：用户自行用 network 相关命令创建一个网络，之后将容器连接到指定的已创建
网络上去。    

### 17.4.3 手动配置网络

用户使用 --net=none 后，Docker 将不对容器网络进行配置，下面介绍手动完成配置网络的整个过程：   

```bash
$ docker run -it --rm --net=none ubuntu:16.04 /bin/bash
root@63f36fc01b5f:/#
```    

在本地主机查看容器的进程 id，并为它创建网络命名空间：   

```bash
$ docker container inspect -f '{{.State.Pid}}' 63f36
2778
$ pid=2778
$ sudo mkdir -p /var/run/netns
$ sudo ln -s /proc/$pid/ns/net /var/run/netns/$pid
```   

检查桥接网卡的 IP 和子网掩码信息：   

```bash
$ ip addr show docker0
21: docker0:...
inet 172.17.42.1/16 scope global docker0
```   

创建一对 "veth pair" 接口 A 和 B，绑定 A 接口到网桥 docker0，并启用它：    

```bash
$ sudo ip link add A type veth peer name B
$ sudo brctl addif docker0 A
$ sudo ip link set A up
```    

将 B 接口放到容器的网络命名空间，命名为 eht0，启动它并配置一个可用 IP（桥接网段）和默认网关：   

```bash
$ sudo ip link set B netns $pid
$ sudo ip netns exec $pid ip link set dev B name ethO
$ sudo ip netns exec $pid ip link set ethO up
$ sudo ip netns exec $pid ip addr add 172.17.42.99/16 dev ethO
$ sudo ip netns exec $pid ip route add default via 172.17.42.1
```   

# 第 18 章 配置私有仓库

## 18.1 安装 Docker Registry

Docker Registry 工具目前最新为 2.0 系统版本，这一版本和一些类库和工具一起被打包为负责容器内容
分发的工具集：Docker Distribution。目前其核心的功能组件仍为负责镜像仓库的管理。    

官方仓库提供了 Registry 的镜像，因此用户可以通过容器运行和源码安装两种方式来使用 Registry。    

### 18.1.1 基于容器安装运行

```bash
$ docker run -d -p 5000:5000 --restart=always --name registry registry:2
```    

Registry 比较关键的参数是配置文件和仓库存储路径。默认的配置文件为 /etc/docker/registry/config.yml，
因此，通过如下命令，可以指定使用本地主机上的配置文件：   

```bash
$ docker run -d -p 5000:5000 \
  --restart=always \
  --name registry \
  -v /home/user/registry-conf/config.yml:/etc/docker/registry/config.yml \
  registry:2
```    

默认的存储位置为 /var/lib/registry，可以通过 -v 参数来映射本地的路径到容器内。    

### 18.1.2 本地安装运行

首先安装 Golang 环境支持，然后配置环境：   

```bash
$ mkdir -p $GOPATH/src/github.com/docker/
$ cd $GOPATH/src/github.com/docker/
$ git clone https://github.com/docker/distribution.git
$ cd distribution
```    

将自带的模板配置文件复制到 /etc/docker/registry/ 路径下，创建存储目录 /var/lib/registry:   

```bash
$ cp cmd/registry/config-dev.yml /etc/docker/registry/config.yml
$ mkdir -p /var/lib/registry
```   

然后执行安装操作：   

```bash
$ make PREFIX=/go clean binaries
```   

编译成功后，可以通过下面的命令来启动：   

```bash
$ registry serve /etc/docker/registry/config.yml
```   

## 18.2 配置 TLS 证书

当本地主机运行 Registry 服务后，所有能访问到该主机的 Docker Host 都可以把它作为私有仓库使用，
只需要在镜像名称前面添加上具体的服务器地址即可。    

私有仓库需要启用 TLS 认证，否则会报错。    

使用 openssl 工具首先生成私人证书：   

```bash
$ mkdir -p certs
$ openssl req -newkey rsa:4096 -nodes -sha256 -keyout certs/myrepo.key -x509 -days 365 \
-out certs/myrepo.crt
```     

生成结果为私钥文件 myrepo.key，以及证书文件 myrepo.crt。其中证书文件需要发送给用户，并且配置
到用户 Docker Host 上 `/etc/docker/certs.d/myrepo.com.5000/ca.crt`    

当拥有了私钥文件和证书文件后，可以配置 Registry 启用证书支持，主要通过使用
REGISTRY_HTTP_TLS_CERTIFICATE 和 REGISTRY_HTTP_TLS_KEY 参数：   

```bash
$ docker run -d \
  --restart=always \
  --name registry \
  -v 'pwd'/certs:/certs \
  -e REGISTRY_HTTP_ADDR=0.0.0.0:443 \
  -e REGISTRY_HTTP_TLS_CERTIFICATE=/certs/myrepo.crt \
  -e REGISTRY_HTTP_TLS_KEY=/certs/myrepo.key \
  -p 443:443
  registry:2
```    

## 18.3 管理访问权限

通常在生成场景中，对私有仓库还需要进行访问代理并提供认证和用户管理。    

### 18.3.1 Docker Registry v2 的认证模式

@TODO:    

具体交互过程包括如下步骤：    

1. Docker Daemon 或者其他客户端尝试访问 Registry 服务器，比如 pull, push 或者访问 manifest 文件
2. 在 Registry 服务器开启了认证服务模式时，就会直接返回 401 Unauthorized 错误，并通知调用
方如何获得授权
3. 调用方按照要求，向 Authorization Service 发送请求，并携带 Authorization Service 需要的
信息，比如用户名、密码
4. 如果授权成功，则可以拿到合法的 Bearer token，来标识该请求方可以获得的权限
5. 请求方将拿到 Bearer token 加到请求的 Authorization header 中，再次尝试步骤 1 中的请求
6. Registry 服务通过验证 Bearer token 以及 JWT 格式的授权数据，来决定用户是否有权限进行请求
的操作     

当启用认证服务时，需要注意以下两个地方：   

- 对于 Authentication Service，Docker 官方目前并没有放出对应的实现方案，需要自行实现对应的
服务接口；
- Registry 服务和 Authentication 服务之间通过证书进行 Bearer token 的生成和认证，所以要
保证两个服务之间证书的匹配。

