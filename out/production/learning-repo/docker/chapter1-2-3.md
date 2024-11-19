# 第一部分 基础入门

<!-- TOC -->

- [第一部分 基础入门](#第一部分-基础入门)
- [第 1 章 初始 Docker 与容器](#第-1-章-初始-docker-与容器)
  - [1.1 什么是 Docker](#11-什么是-docker)
  - [1.2 为什么要使用 Docker](#12-为什么要使用-docker)
- [第 2 章 核心概念与安装配置](#第-2-章-核心概念与安装配置)
  - [2.1 核心概念](#21-核心概念)
  - [2.2 安装 Docker 引擎](#22-安装-docker-引擎)
    - [2.2.4 macOS 安装](#224-macos-安装)
  - [2.3 配置 Docker 服务](#23-配置-docker-服务)
- [第 3 章 使用 Docker 镜像](#第-3-章-使用-docker-镜像)
  - [3.1 获取镜像](#31-获取镜像)
  - [3.2 查看镜像信息](#32-查看镜像信息)
    - [3.2.1 使用 images 命令列出镜像](#321-使用-images-命令列出镜像)
    - [3.2.2 使用 tag 命令添加镜像标签](#322-使用-tag-命令添加镜像标签)
    - [3.2.3 使用 inspect 命令查看详细信息](#323-使用-inspect-命令查看详细信息)
    - [3.2.4 使用 `history` 命令查看镜像历史](#324-使用-history-命令查看镜像历史)
  - [3.3 搜索镜像](#33-搜索镜像)
  - [3.4 删除和清理镜像](#34-删除和清理镜像)
    - [3.4.1 使用标签删除镜像](#341-使用标签删除镜像)
    - [3.4.2 使用镜像 ID 来删除镜像](#342-使用镜像-id-来删除镜像)
    - [3.4.3 清理镜像](#343-清理镜像)
  - [3.5 创建镜像](#35-创建镜像)
    - [3.5.1 基于已有容器创建](#351-基于已有容器创建)
    - [3.5.2 基于本地模板导入](#352-基于本地模板导入)
    - [3.5.3 基于 Dockerfile 创建](#353-基于-dockerfile-创建)
  - [3.6 存出和载入镜像](#36-存出和载入镜像)
    - [3.6.1 存出镜像](#361-存出镜像)
    - [3.6.2 载入镜像](#362-载入镜像)
  - [3.7 上传镜像](#37-上传镜像)

<!-- /TOC -->

# 第 1 章 初始 Docker 与容器

## 1.1 什么是 Docker

容器有效地将由单个操作系统管理的资源划分到孤立的组中，以更好地在孤立的组之间平衡有冲突的资源使用
需求。与虚拟化相比，这样既不需要任何专门的解释机制。此外，也避免了准虚拟化(para-virtualization)
和系统调用替换中的复杂性。   

早期的 Docker 代码实现是直接基于 LXC 的。自 0.9 版本开始，Docker 开发了 libcontainer
项目作为更广泛的容器驱动实现，从而替换掉了 LXC 的实现。    

简单地讲，可以将 Docker 容器理解为一种轻量级的沙盒。每个容器内运行着一个应用，不同的容器相互
隔离，容器之间可以通过网络互相通信。    

## 1.2 为什么要使用 Docker

举个简单的例子，假设用户试图基于最常见的 LAMP 组合来构建网站。按照传统的做法，首先需要安装
Apache, MySQL 和 PHP 以及它们各自运行所依赖的环境；之后分别对它们进行配置。    

更为可怕的是，一旦需要服务器迁移，往往需要对每个应用都进行重新部署和调试。究其根源，是这些应用
直接运行在底层操作系统上，无法保证同一份应用在不同的环境中行为一致。   

而 Docker 提供了一种更为聪明的方式，通过容器来打包应用、解耦应用和运行平台。这意味着迁移的时候，
只需要在新的服务器上启动需要的容器就可以了，无论新旧服务器是否是统一类型的平台。   

具体来说，在开发和运维过程中，Docker 具有如下几个方面的优势：   

+ **更快速的交付和部署**。使用 Docker，开发人员可以使用镜像来快速构建一套标准的开发环境；开发
完成之后，测试和运维人员可以直接使用完全相同的环境来部署代码。Docker 可以快速创建和删除容器，
实现快速迭代，节约开发、测试、部署的大量时间。
+ **更高效的资源利用**。运行 Docker 容器不需要额外的虚拟化管理程序 VMM 的支持，Docker 是内核
级的虚拟化，可以实现更高的性能，同时对资源的额外需求很低。  
+ **更轻松的迁移和扩展**。Docker 容器几乎可以在任意的平台上运行，包括物理机、虚拟机、公有云、
私有云、个人电脑、服务器等，同时支持主流的操作系统发行版本。
+ **更简单的更新管理**。使用 Dockerfile，只需要小小的配置修改，就可以替代以往大量的更新工作。
所有修改都以增量的方式被分发和更新。   

# 第 2 章 核心概念与安装配置

## 2.1 核心概念

Docker 大部分的操作都围绕着它的三大核心概念：镜像、容器和仓库。   

**Docker 镜像**   

Docker 镜像类似于虚拟机镜像，可以将它理解为一个只读的模板。   

例如，一个镜像可以包含一个基本的操作系统环境，里面仅安装了 Apache 应用程序。可以把它称为一个
Apache 镜像。   

镜像是创建 Docker 容器的基础。   

**Docker 容器**    

Docker 容器类似于一个轻量级的沙箱，Docker 利用容器来运行和隔离应用。   

容器是从镜像创建的应用运行实例。它可以启动、开始、停止、删除，而这些容器都是彼此相互隔离、互不
可见的。    

可以把容器看作一个简易版的 Linux 系统环境（包括 root 用户权限、进程空间、用户空间等）以及运行
在其中的应用程序打包而成的盒子。   

镜像自身是只读的。容器从镜像启动的时候，会在镜像的最上层创建一个可写层。   

**Docker 仓库**    

Docker 仓库类似于代码仓库，是 Docker 集中存放镜像文件的场所。   

有时候我们会将 Docker 仓库和仓库注册服务器(Registry)混为一谈，并不严格区分。实际上，仓库注册
服务器是存放仓库的地方，其上往往存放着多个仓库。每个仓库集中存放某一类镜像，往往包括多个镜像文件，
通过不同的标签来进行区分。   

根据所存储的镜像公开分享与否，Docker 仓库可以分为公开仓库和私有仓库两种形式。   

## 2.2 安装 Docker 引擎

Dokcer 引擎是使用 Docker 容器的核心组件，可以在主流的操作系统和云平台上使用。   

目前 Docker 支持 Docker 引擎、Docker Hub、Docker Cloud 等多种服务。   

+ Docker 引擎：包括支持在桌面系统或云平台安装 Docker
+ DockerHub：官方提供的云托管服务，可以提供公有或私有的镜像仓库
+ DockerCloud：官方提供的容器云服务，可以完成容器的部署与管理，可以完整地支持容器化项目。   

社区版本每个月会发布一次尝鲜（Edge）版本，每个季度会发行一次稳定版本。版本号命名格式为“年份.月份”，
如 2018年6月发布的版本号为 v18.06。       

### 2.2.4 macOS 安装

## 2.3 配置 Docker 服务

为了避免每次使用 Docker 命令时都需要切换到特权身份，可以将当前用户加入安装中自动创建的 docker
用户组：   

```zsh
$ sudo usermod -aG docker USER_NAME
```   

Docker 服务启动时实际上是调用了 `dockerd` 命令，支持多种启动参数。因此，用户可以直接通过执行
`dockerd` 命令来启动 Docker 服务，如下面开启 Debug 模式：   

```zsh
$ dockerd -D -H tcp://127.0.0.1:2376
```   

这些选项可以写入 /etc/docker/ 路径下的 daemon.json 文件中，由 dockerd 服务启动时读取：   

```json
{
  "debug": true,
  "hosts": ["tcp://127.0.0.1:2376"]
}
```    

# 第 3 章 使用 Docker 镜像

Docker 运行容器前需要本地存在对应的镜像，如果镜像不存在，Docker 会尝试先从默认镜像仓库下载（默认
使用 Docker Hub 公共注册服务器中的仓库），用户也可以通过配置，使用自定义的镜像仓库。   

## 3.1 获取镜像

镜像是运行容器的前提。   

可以使用 `docker [image] pull` 命令直接从 Docker Hub 镜像源来下载镜像。该命令的格式为：   

```zsh
$ docker [image] pull NAME[:TAG]
```   

其中，NAME 是镜像仓库名称（用来去区分镜像），TAG 是镜像的标签。    

例如，获取一个 Ubuntu 18.04 系统的基础镜像可以使用如下的命令：   

```zsh
$ docker pull ubuntu:18.04
18.04: Pulling from library/ubuntu
....
```    

对于 Docker 镜像来说，如果不显示指定 TAG，则默认会选择 latest 标签，这会下载仓库中最新版本的
镜像。   

下载过程中可以看出，镜像文件一般由若干层（layer）组成，6c953ac5d795 这样的串是层的唯一 id。
使用 `docker pull` 命令下载中会获取并输出镜像的各层信息。当不同的镜像包括相同的层时，本地仅
存储了层的一份内容，减小了存储空间。    

严格地讲，镜像的仓库名称中还应该添加仓库地址作为前缀，只是默认使用的是官方 Docker Hub 服务，
该前缀可以忽略。   

例如，`docker pull ubuntu:18.04` 命令相当于 `docker pull registry.hub.docker.com/ubuntu:18.04`
命令。    

如果从非官方的仓库下载，则需要在仓库名称前指定完整的仓库地址。   

pull 子命令支持的选项主要包括：   

+ `-a, -all-tags=true|false`: 是否获取仓库中的所有镜像，默认为否
+ `--disable-content-trust`: 取消镜像的内容校验，默认为真    

另外，有时需要使用镜像代理服务来加速 Docker 镜像获取过程，可以在 Docker 服务启动配置中增加
`--registry-mirror=proxy_URL` 来指定镜像代理服务地址。   

## 3.2 查看镜像信息

### 3.2.1 使用 images 命令列出镜像

使用 `docker images` 或 `docker image ls` 命令可以列出本地主机上已有镜像的基本信息。   

`images` 子命令主要支持如下选项，用户可以自行进行尝试：   

- `-a, --all=true|false`: 列出所有镜像文件，默认为否
- `--digests=true|false`: 列出镜像的数字摘要值，默认为否
- `-f, --filter=[]`: 过滤列出的镜像，如 `dangling=true` 只显示没有被使用的镜像
- `--format="TEMPLATE"`: 控制输出格式，如 `.ID` 代表 ID 信息，`.Repository` 代表仓库信息
- `--no-trunc=true|false`: 对输出结果中太长的部分是否进行截断，如镜像的 ID 信息
- `-q, --quiet=true|false`: 仅输出 ID 信息，默认为否

### 3.2.2 使用 tag 命令添加镜像标签

为了方便在后续工作中使用特定镜像，还可以使用 `docker tag` 命令来为本地镜像任意添加新的标签：   

```shell
$ docker tag ubuntu:latest myubuntu:latest
```   

再次使用 `docker images` 列出本地主机上的镜像信息，可以看到多了一个 myubuntu:latest 标签的
镜像。   

### 3.2.3 使用 inspect 命令查看详细信息

使用 `docker [image] inspect` 命令可以获取该镜像的详细信息，包括制作者、适应架构、各层的数字
摘要等：   

```shell
$ docker [image] inspect ubuntu:18.04
```    

上面代码返回的是一个 JSON 格式的消息，如果我们只要其中一项内容时，可以使用 `-f` 来指定，例如，
获取镜像的 Architecture:   

```shell
$ docker [image] inspect -f {{".Architecture"}} ubuntu:18.04
```   

### 3.2.4 使用 `history` 命令查看镜像历史

既然镜像文件由多个层组成，那么怎么知道各个层的具体内容是什么呢？这时候可以使用 `history` 子命令，
该命令将列出各层的创建信息。   

```shell
$ docker history ubuntu:18.04
IMAGE           CREATED         CREATED BY                             SIZE      COMMENT
1d9c17228a9e    2 weeks ago     /bin/sh -c #(nop) CMD ["/bin/bash]     0B
<missing>       2 weeks ago     /bin/sh -c mkdir -p /run/systemd && echo 'do...' 7B
<missing>       2 weeks ago     /bin/sh -c rm -rf /var/lib/apt/lists/*  0B
<missing>       2 weeks ago     /bin/sh -c set -xe && echo '#!/bin/sh' > /...  745B
<missing>       2 weeks ago     /bin/sh -c #(nop) ADD file:c0f17c7189fc11b6a...  86.7MB
```    

## 3.3 搜索镜像

使用 `docker search` 命令可以搜索 Docker Hub 官方仓库中的镜像。语法为：    

```shell
$ docker search [option] keyword
```    

支持的命令选项主要包括：    

- `-f, --filter filter`: 过滤输出内容
- `--format string`: 格式化输出内容
- `--limit int`: 限制输出结果个数，默认为 25 个
- `--no-trunc`: 不截断输出结果   

## 3.4 删除和清理镜像

### 3.4.1 使用标签删除镜像

使用 `docker rmi` 或者 `docker image rm` 命令可以删除镜像，命令格式为:   

```shell
$ docker rmi IMAGE [IMAGE...]
```   

其中 IMAGE 可以为标签或 ID。支持的选项包括：   

- `-f, -force`: 强制删除镜像，即使有容器依赖它
- `no-prune`: 不要清理未带标签的父镜像    

例如，要删掉 myubuntu:latest 镜像，可以使用如下命令：    

```shell
$ docker rmi myubuntu:latest
Untagged: myubuntu:latest
```   

当镜像标签只剩下一个标签的时候就要小心了，此时再使用 `docker rmi` 命令会彻底删除镜像。   

### 3.4.2 使用镜像 ID 来删除镜像

当使用 `docker rmi` 命令，并且后面跟上镜像的 ID（也可以是能进行区分的部分 ID 串前缀）时，会
先尝试删除所有指向该镜像的标签，然后删除该镜像文件本身。   

### 3.4.3 清理镜像

使用 Docker 一段时间后，系统中可能会遗留一些临时的镜像文件，以及一些没有被使用的镜像，可以通过
`docker image prune` 命令来进行清理。支持的选项包括：    

- `-a, -all`: 删除所有无用镜像，不光是临时镜像
- `-filter filter`: 只清理符合给定过滤器的镜像
- `-f, -force`: 强制删除镜像，而不进行提示确认

## 3.5 创建镜像

创建镜像的方法主要有三种：基于已有镜像的容器创建、基于本地模板导入、基于 Dockerfile 创建。   

### 3.5.1 基于已有容器创建

该方法主要是使用 `docker [container] commit` 命令，格式为：   

```shell
$ docker [container] commit [OPTIONS] CONTAINER [REPOSITORY[:TAG]]
```   

主要选项包括：   

- `-a, --author=""`: 作者信息；
- `-c, --change=[]`: 提交的时候执行 Dockerfile 指令，包括 CMD|ENTRYPOINT|ENV|EXPOSE|
LABEL|ONBUILD|USER|VOLUME|WORKDIR 等
- `-m, --message=""`: 提交信息
- `-p, --pause=true`: 提交时暂停容器运行   

首先启动一个镜像，并在其中进行修改操作：   

```zsh
$ docker run -it ubuntu:18.04 /bin/bash
root@e1363a425ef9:/# touch test
root@e1363a425ef9:/# exit
```   

容器的 ID 为 a925cb40b3f0。    

```bash
$  docker container commit -m "Added a test file" -a "Docker Newbee" e1363a425ef9 test:0.1
sha256:befdb2d9165977397c4e7ea6aa02c2002b5908187a18c5ae2642b908cad073c8
```   

其实仔细想一下，我们拉镜像的时候给的是仓库的地址，那其实可以这样理解，镜像都是 ID 标识的，前面
说的镜像名称更准确的来说是镜像所在仓库的名称。    

### 3.5.2 基于本地模板导入

用户也可以直接从一个操作系统模板文件导入一个镜像，主要使用 `docker [container] import` 命令。
命令格式为：   

```bash
$ docker [image] import [OPTIONS] file|URL|-[REPOSITORY[:TAG]]
```    

要直接导入一个镜像，可以使用 OpenVZ 提供的模板来创建，或者用其他已导出的镜像模板来创建。OpenVZ
模板的下载地址为 http://openvz.org/Download/templates/precreated。    

例如，下载了 ubuntu-18.04 的模板压缩包，之后使用以下命令导入即可：   

```bash
$ cat ubuntu-18.04-x86_64-minimal.tar.gz | docker import - ubuntu:18.04
```   

### 3.5.3 基于 Dockerfile 创建

基于 Dockerfiler 创建是最常见的方式。Dockerfile 是一个文本文件，利用给定的指令描述基于父镜像
创建新镜像的过程。   

下面给出 Dockerfile 的一个简单示例，基于 debian:stretch-slim 镜像安装 python3 环境，
构成一个新的 python:3 镜像：   

```
FROM debian:stretch-slim

LABEL version="1.0" maintainer="docker user <docker_user@github>"

RUN apt-get update && \
    apt-get install -y python3 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```   

创建镜像的过程可以使用 `docker [image] build` 命令，编译成功后本地将多出一个 python:3 镜像。   

```bash
$ docker [image] build -t python:3
```    

## 3.6 存出和载入镜像

用户可以使用 `docker [image] save` 和 `docker [image] load` 命令来存出和载入镜像。   

### 3.6.1 存出镜像

如果要导出镜像到本地文件，可以使用 `docker [image] save` 命令（什么叫导出，话说镜像难道本身
不在本地文件上吗）。该命令支持  `-o, --output string` 参数，导出镜像到指定的文件中。   

```bash
$ docker save -o ubuntu_18.04.tar ubuntu:18.04
```   

### 3.6.2 载入镜像

可以使用 `docker [image] load` 将导出的 tar 文件再导入到本地镜像库。支持 `-i,-input string`
选项，从指定文件中读入镜像内容。   

```bash
$ docker image load -i ubuntu_18.04.tar
```   

或者：   

```bash
$ docker load < ubuntu_18.04.tar
```    

## 3.7 上传镜像

可以使用 `docker [image] push` 命令上传镜像到仓库，默认上传到 Docker Hub 官方仓库。命令
格式为 `docker [image] push NAME[:TAG] | [REGISTRY_HOST[:REGISTRY_PORT]/]NAME[:TAG]`.   

