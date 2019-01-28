# 第 1 章 简介

<!-- TOC -->

- [第 1 章 简介](#第-1-章-简介)
  - [1.2 Docker 组件](#12-docker-组件)
    - [1.2.1 Docker 客户端和服务器](#121-docker-客户端和服务器)
    - [1.2.2 Docker 镜像](#122-docker-镜像)
    - [1.2.3 Registry](#123-registry)
    - [1.2.4 容器](#124-容器)
  - [1.5 Docker 的技术组件](#15-docker-的技术组件)
- [第 2 章 安装 Docker](#第-2-章-安装-docker)
  - [2.1 安装 Docker 的先决条件](#21-安装-docker-的先决条件)
  - [2.2 在 Ubuntu 和 Debian 中安装 Docker](#22-在-ubuntu-和-debian-中安装-docker)
  - [2.9 Docker 守护进程](#29-docker-守护进程)
    - [2.9.1 配置 Docker 守护进程](#291-配置-docker-守护进程)
- [第 3 章 Docker 入门](#第-3-章-docker-入门)
  - [3.2 运行我们的第一个容器](#32-运行我们的第一个容器)
  - [3.4 容器命名](#34-容器命名)
  - [3.5 重新启动已经停止的容器](#35-重新启动已经停止的容器)
  - [3.6 附着到容器上](#36-附着到容器上)
  - [3.7 创建守护式容器](#37-创建守护式容器)
  - [3.9 Docker 日志驱动](#39-docker-日志驱动)
  - [3.10 查看容器内的进程](#310-查看容器内的进程)
  - [3.11 Docker 统计信息](#311-docker-统计信息)
  - [3.12 在容器内部运行进程](#312-在容器内部运行进程)
  - [3.13 停止守护容器](#313-停止守护容器)
  - [3.16 删除容器](#316-删除容器)

<!-- /TOC -->

Docker 是轻量级容器管理引擎，其实从这句话就可以理解出 Docker 是什么，一个用来启动以及管理容器
的引擎。    

容器与管理程序虚拟化（hypervisor virtualization, HV）有所不同，管理程序虚拟化通过中间层将
一台或多台独立的机器虚拟运行于物理硬件之上，而容器则是直接运行在操作系统内核之上的用户空间。因此，
容器虚拟化也被称为“操作系统级虚拟化”，容器技术可以让多个独立的用户空间运行在同一台宿主机上。   

容器经常被认为是精益技术，因为容器需要的开销有限。 和传统的虚拟化以及半虚拟化（paravirtualization）
相比，容器运行不需要模拟层（emulation layer）和管理层（hypervisor layer），而是使用操作系统的
系统调用接口。这降低了运行单个容器所需的开销，也使得宿主机中可以运行更多的容器。   

## 1.2 Docker 组件

Docker 的核心组件：   

- Docker 客户端和服务器，也称为 Docker 引擎
- Docker 镜像
- Registry
- Docker 容器

### 1.2.1 Docker 客户端和服务器

Docker是一个客户端/服务器（C/S）架构的程序。Docker客户端只需向 Docker服务器或守护进程发出请求，
服务器或守护进程将完成所有工作并返回结果。Docker 守护进程有时也称为Docker引擎。Docker提供了一
个命令行工具 docker 以及一整套RESTful API 来与守护进程交互。用户可以在同一台宿主机上运行
Docker 守护进程和客户端，也可以从本地的 Docker 客户端连接到运行在另一台宿主机上的远程Docker守护进程。    

### 1.2.2 Docker 镜像

用户基于镜像来运行自己的容器。镜像也是 Docker 生命周期中的“构建”部分。镜像是基于联合（Union）
文件系统的一种层式的结构，由一系列指令一步一步构建出来。例如：   

- 添加一个文件
- 执行一个命令
- 打开一个端口    

也可以把镜像当做容器的“源代码”。镜像体积很小，非常“便携”，易于分享、存储和更新。    

### 1.2.3 Registry

Docker 用 Registry 来保存用户构建的镜像。   

### 1.2.4 容器

Docker 可以帮用户构建和部署容器，用户只需要把自己的应用程序或服务打包放进容器即可。容器是基于镜像
启动起来的，容器中可以运行一个或多个进程。我们可以认为，镜像是 Docker 生命周期中的构建或打包
阶段，而容器则是启动或执行阶段。   

总结起来，Docker 容器就是：   

- 一个镜像格式
- 一系列标准的操作
- 一个执行环境

## 1.5 Docker 的技术组件

Docker 包括以下几个部分：   

- 一个原生的 Linux 容器格式，Docker 中称为 libcontainer
- Linux 内核的命名空间，用于隔离文件系统、进程和网络
- 文件系统隔离：每个容器都有自己的 root 文件系统
- 进程隔离：每个容器都运行在组件的进程环境中
- 网络隔离：容器间的虚拟网络接口和 IP 地址都是分开的
- 资源隔离个分组：使用 cgroups（即 control group，Linux 的内核特性之一）将 CPU 和内存之类
的资源独立分配给每个 Docker 容器
- 写时复制：文件系统都是通过写时复制创建的，这就意味着文件系统是分层的、快速的，而且占用的磁盘
空间更小
- 日志：容器产生的 STDOUT, STDERR 和 STDID 这些 IO 流都会被收集并记入日志，用来进行日志分析
和故障排错
- 交互式 shell：用户可以创建一个伪 tty 终端，将其连接到 STDIN，为容器提供一个交互式的 shell   

# 第 2 章 安装 Docker

Docker Toolbox——一个安装了运行 Docker 所需一切的组件的集合。它包含 VirtualBox 和一个极小
的虚拟机，同时提供了一个包装脚本对该虚拟机进行管理。该虚拟机运行一个守护进程，并在 OS X 或
Windows 中提供一个本地的 Docker 守护进程。Docker 的客户端工具 docker 作为这些平台的原生程序
被安装，并连接到在 Docker Toolbox 虚拟机中运行的 Docker 守护进程。   

## 2.1 安装 Docker 的先决条件

- 运行 64 位 CPU 架构的计算机
- 运行 Linux 3.8 或更高版本内核
- 内核必须支持一种适合的存储驱动，例如：
  + Device Manager
  + AUFS
  + vfs
  + btrfs
  + ZFS
- 内核必须支持并开启 cgroup 和命名空间功能   

## 2.2 在 Ubuntu 和 Debian 中安装 Docker

首先，要添加 Docker 的 APT 仓库：   

```bash
$ sudo sh -c "echo deb https://apt.dockerproject.org/repo ubuntu-trusty main > 
/etc/apt/sources.list.d/docker.list"
```    

应该讲 trusty 替换为主机的 Ubuntu 发行版本。     

接下来，要添加 Docker 仓库的 GPG 密钥：   

```bash
$ sudo apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D
```   

之后，需要更新 APT 源：   

```bash
$ sudo apt-get update
```   

现在，就可以安装 docker 软件包了：   

```bash
$ sudo apt-get install docker-engine
```   

## 2.9 Docker 守护进程

安装完 Docker 后，需要确认 Docker 的守护进程是否运行。Docker 以 root 权限运行它的守护进程，
来处理普通用户无法完成的操作（如挂载文件系统）。docker 程序是 Docker 守护进程的客户端程序，
同样也需要以 root 身份运行。用户可以使用docker daemon命令控制Docker守护进程。    

当 Docker 软件包安装完毕后，默认会立即启动 Docker 守护进程。守护进程监听 /var/run/docker.sock
这个 Unix 套接字文件，来获取来自客户端的 Docker 请求。如果系统中存在名为 docker 的用户组的话，
Docker 会将该套接字文件的所有者设置为该用户组。这样，docker 用户组的所有用户都可以直接运行
docker，而无需再使用 sudo 命令。   

### 2.9.1 配置 Docker 守护进程

运行 Docker 守护进程时，可以用 -H 标志调整守护进程绑定监听接口的方式。    

```bash
$ docker daemon -H tcp://0.0.0.0:2375
```   

Docker 客户端不会自动监测到网络的变化，需要通过 -H 选项来指定服务器的地址。例如，如果把守护
进程端口改成 4200，那么运行客户端时就必须指定 `docker -H :4200`。如果不想每次运行客户端时都
加上 -H 标志，可以通过设置 DOCKER_HOST 环境变量来省略此步骤：   

```bash
$ export DOCKER_HOST="tcp://0.0.0.0:2375"
```   

# 第 3 章 Docker 入门

## 3.2 运行我们的第一个容器

```bash
$ sudo docker run -i -t ubuntu /bin/bash
```   

-i 标志保证容器中的 STDIN 是开启的，尽管我们并没有附着到容器中。持久的标志输入是交互式 shell
的”半边天“，-t 标志则是另外”半边天“，它告诉 Docker 为要创建的容器分配一个伪 tty 终端。这样，
新创建的容器才能提供一个交互式 shell。   

貌似好像是这样，光 -i 的话，我们的界面上可以输入东西，但是没有命令行提示符，相当于没有提供给我们
前台交互的终端，但是输入命令是可以被容器接收到的。   

接下来，我们告诉 Docker 基于什么镜像来创建容器，示例中使用的是 ubuntu 镜像。ubuntu 镜像是一个
常备镜像，也可以称为”基础“镜像。    

随后，Docker 在文件系统内部用这个镜像创建了一个新容器。该容器拥有自己的网络、IP 地址，以及一个
用来和宿主机进行通信的桥接网络接口。最后，我们告诉 Docker 在新容器中要运行什么命令，在本例中我们
在容器中运行 /bin/bash 命令启动了一个Bash shell.       

## 3.4 容器命名

Docker 会为我们创建的每一个容器自动生成一个随机的名称。如果想为容器指定一个名称，而不是使用自动
生成的名称，则可以用 --name 标志来实现。    

容器的命名必须是唯一的。如果试图创建两个名称相同的容器，则命令将会失败。   

## 3.5 重新启动已经停止的容器

```bash
$ docker start CONTAINER
```   

## 3.6 附着到容器上

Docker 容器重新启动的时候，会沿用 `docker run` 命令时指定的参数来运行，因此我们的容器重新
启动后会运行一个交互式会话 shell。此外，也可以用 `docker attach` 命令，重新附着到该容器的
会话上。   

```bash
$ docker attach CONTAINER
```   

注意附着的容器必须是一个运行着的容器。   

## 3.7 创建守护式容器

除了这些交互式运行的容器，也可以创建长期运行的容器。守护式容器没有交互式会话，非常适合运行应用
程序和服务。    

```bash
$ docker run --name daemon_dave -d ubuntu /bin/sh -c "while true; do echo hello world; sleep 1; done"
```   

## 3.9 Docker 日志驱动

自 Docker 1.6 开始，也可以控制 Docker 守护进程和容器所用的日志驱动，这可以通过 --log-driver
选项来实现。可以在启动 Docker 守护进程或者执行 docker run 命令时使用这个选项。   

有好几个选项，包括默认的 json-file，json-file 也为我们前面看到的 docker logs 命令提供了基础。   

## 3.10 查看容器内的进程

除了容器的日志，也可以查看容器内部运行的进程。要做到这一点，要使用 `docker top` 命令：   

```bash
$ docker top daemon_dave
```    

## 3.11 Docker 统计信息

`docker stats` 命令，用来显示一个或多个容器的统计信息。  

```bash
$ docker stats daemon_dave daemon_kate daemon_clare daemon_sarah
CONTAINER CPU % MEM USAGE/LIMIT MEM % NET I/O BLOCK I/O
daemon_clare 0.10% 220 KiB/994 MiB 0.02% 1.898 KiB/648 B 12.75 MB / 0 B
daemon_dave 0.14% 212 KiB/994 MiB 0.02% 5.062 KiB/648 B 1.69 MB / 0 B
daemon_kate 0.11% 216 KiB/994 MiB 0.02% 1.402 KiB/648 B 24.43 MB / 0 B
daemon_sarah 0.12% 208 KiB/994 MiB 0.02% 718 B/648 B 11.12 MB / 0B
```    

## 3.12 在容器内部运行进程

在 Docker 1.3 之后，也可以通过 `docker exec` 命令在容器内部额外启动新进程。可以在容器内运行的
进程有两种类型：后台任务和交互式任务。后台任务在容器内运行且没有交互需求，而交互式任务则保持在前台
运行。    

```bash
$ docker exec -d daemon_dave touch /etc/new_config_file
```    

这里的 -d 标志表明需要运行一个后台进程，-d 标志之后，指定的是要在内部执行这个命令的容器的名字
以及要执行的命令。   

我们也可以在 daemon_dave 容器中启动一个诸如打开 shell 的交互式任务：   

```bash
$ docker exec -t -i daemon_dave /bin/bash
```   

## 3.13 停止守护容器

要停止守护式容器，只需要执行 `docker stop` 命令：   

```bash
$ docker stop daemon_dave
```   

## 3.16 删除容器

如果容器已经不再使用，可以使用 `docker rm` 命令来删除它们：   

```bash
$ docker rm CONTAINER
```   