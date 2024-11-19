# 第 23 章 Docker 三剑客之 Machine

<!-- TOC -->

- [第 23 章 Docker 三剑客之 Machine](#第-23-章-docker-三剑客之-machine)
  - [23.1 Machine 简介](#231-machine-简介)
  - [23.3 安装 Machine](#233-安装-machine)
  - [23.3 使用 Machine](#233-使用-machine)
    - [23.3.1 虚拟机](#2331-虚拟机)
    - [23.3.2 本地主机](#2332-本地主机)
  - [23.4 Machine 命令](#234-machine-命令)

<!-- /TOC -->

Docker Machine 是 Docker 官方三剑客项目之一，负责使用 Docker 容器的第一步：在多种平台上
快速安装和维护 Docker 运行环境。它支持多种平台，让用户可以在很短时间内在本地或云环境中搭建一套
Docker 主机集群。   

## 23.1 Machine 简介

Machine 项目是 Docker 官方的开源项目，负责实现对 Docker 运行环境进行安装和管理，特别在管理
多个 Docker 环境时，使用 Machine 要比手动管理高效得多。   

Machine 项目主要由 Go 语言编写，用户可以在本地任意指定由 Machine 管理的 Docker 主机，并对
其进行操作。   

其基本功能包括：   

- 在指定节点或平台上安装 Docker 引擎，配置其为可使用的 Docker 环境
- 集中管理（包括启动、查看等）所安装的 Docker 环境    

Machine 连接不同类型的操作平台是通过对应驱动来实现的，目前已经集成了包括AWS、IBM、Google，
以及 OpenStack、VirtualBox、vSphere 等多种云平台的支持。   

## 23.3 安装 Machine

Linux 或 Mac:   

推荐从官方 Release 库（https://github.corn/docker/machine/releases）直接下载编译好的
二进制文件即可。   

```
$ curl -L https://github.com/docker/machine/releases/download/v0.13.0/docker-machine
-'uname -s'-'uname -m' > docker-machine
$ mv docker-machine /usr/local/bin/docker-machine
$ chmod +x /usr/local/bin/docker-machine
$ docker-machine -v
docker-machine version 0.13.0, build 9ba6da9
```   

windows 自己搜安装包了。    

## 23.3 使用 Machine

Docker Machine 通过多种后端驱动来管理不同的资源，包括虚拟机、本地主机和云平台等。通过 -d 选项
可以选择支持的驱动类型。    

### 23.3.1 虚拟机

可以通过 virtualbox 驱动支持本地（需要已安装 virtualbox）启动一个虚拟机环境，并配置为 Docker
主机：   

```
$ docker-machine create --driver=virtualbox test
```   

将启动一个全新的虚拟机，并安装 Docker 引擎。安装成功后，可以通过 `docker-machine env` 命令
查看访问所创建 Docker 环境所需要的配置信息。    

使用完毕后，可以使用如下命令来停止 Docker 主机：   

```
$ docker-machine stop test
```   

### 23.3.2 本地主机

这种驱动适合主机操作系统和 SSH 服务都已经安装好，需要对其安装 Docker 引擎。    

首先确保本地主机可以通过 user 账号的 key 直接 ssh 到目标主机。使用 generic 类型的驱动，注册
一台 Docker 主机，命名为 test:    

```
$ docker-machine create -d generic --generic-ip-address=10.0.100.102 \
  --generic-ssh-user=user test
```   

## 23.4 Machine 命令

- active: 查看当前激活状态的 Docker 主机
- config: 查看到激活 Docker 主机的连接信息
- create: 创建一个 Docker 主机
- env: 显示连接到某个主机需要的环境变量
- inspect: 以 json 格式输出指定 Docker 主机的详细信息
- ip: 获取指定的 Docker 主机地址
- kill: 直接杀死指定的 Docker 主机
- ls: 列出所有管理的主机
- regenerate-certs: 为某个主机重新生成 TLS 认证信息
- restart: 重启指定 Docker 主机
- rm: 删除某台 Docker 主机
- scp: 在 Docker 主机之间以及 Docker 主机和本地之间通过 scp 命令来远程复制文件
- ssh: 通过 SSH 连到主机上，执行命令
- status: 获取指定 Docker 主机的状态
- stop: 停止一个 Docker 主机
- upgrade: 将指定主机的 Docker 版本更新为最新
- url: 获取指定主机的监听 url

