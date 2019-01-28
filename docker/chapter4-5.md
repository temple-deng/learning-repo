# 第 4 章 操作 Docker 容器

<!-- TOC -->

- [第 4 章 操作 Docker 容器](#第-4-章-操作-docker-容器)
  - [4.1 创建容器](#41-创建容器)
    - [4.1.1 新建容器](#411-新建容器)
    - [4.1.2 启动容器](#412-启动容器)
    - [4.1.3 新建并启动容器](#413-新建并启动容器)
    - [4.1.4 守护态运行](#414-守护态运行)
    - [4.1.5 查看容器输出](#415-查看容器输出)
  - [4.2 停止容器](#42-停止容器)
    - [4.2.1 暂停容器](#421-暂停容器)
    - [4.2.2 终止容器](#422-终止容器)
  - [4.3 进入容器](#43-进入容器)
    - [4.3.1 attach 命令](#431-attach-命令)
    - [4.3.2 exec 命令](#432-exec-命令)
  - [4.4 删除容器](#44-删除容器)
  - [4.5 导入和导出容器](#45-导入和导出容器)
    - [4.5.1 导出容器](#451-导出容器)
    - [4.5.2 导入容器](#452-导入容器)
  - [4.6 查看容器](#46-查看容器)
  - [4.7 其他容器命令](#47-其他容器命令)
    - [4.7.1 复制文件](#471-复制文件)
    - [4.7.2 查看变更](#472-查看变更)
    - [4.7.3 查看端口映射](#473-查看端口映射)
    - [4.7.4 更新配置](#474-更新配置)
- [第 5 章 访问 Docker 仓库](#第-5-章-访问-docker-仓库)
  - [5.3 搭建本地私有仓库](#53-搭建本地私有仓库)
    - [5.3.1 使用 registry 镜像创建私有仓库](#531-使用-registry-镜像创建私有仓库)

<!-- /TOC -->

容器是 Docker 的另一个核心概念。简单来说，容器是镜像的一个运行实例。所不同的是，镜像是静态的
只读文件，而容器带有运行时需要的可写文件层，同时，容器中的应用进程处于运行状态。   

## 4.1 创建容器

### 4.1.1 新建容器

使用 `docker [container] create` 命令新建一个容器，例如：   

```bash
$ docker create -it ubuntu:latest
```   

使用 `docker [container] create` 命令新建的容器处于停止状态，可以使用 `docker [container] start`
命令来启动它。    

选项主要包括如下几大类：与容器运行模式相关、与容器环境配置相关、与容器资源限制和安全保护相关。   

**create 命令与容器运行模式相关的选项**    


选项 | 说明
---------|----------
 `-a, --attach=[]` | 是否绑定到标准输入、输出和错误
 `-d, --detach=true|false` | 是否在后台容器，默认为否
 `--detach-keys=""` | 从 `attach` 模式退出的快捷键
 `--entrypoint=""` | 镜像存在入口命令时，覆盖为新的命令
 `--expose=[]` | 指定容器会暴露出来的端口或端口范围
 `--group-add=[]` | 运行容器的用户组
 `-i, --interactive=true|false` | 保持标准输入打开，默认为 false
 `--ipc=""` | 容器 IPC 命名空间，可以为其他容器或主机
 `--isolation="default"` | 容器使用的隔离机制
 `--log-driver="json-file"` | 指定容器的日志驱动类型，可以为 json-file, syslog, journald, gelf, fluentd, awslogs, splunk, etwlogs, gcplogs 或 none
 `--log-opt=[]` | 传递给日志驱动的选项
 `--net="bridge"` | 指定容器网络模式，包括 bridge, none, 其他容器内网络, host 的网络或某个现有网络等
 `--net-alias=[]` | 容器在网络中的别名
 `-P, --publish-all=true|false` | 通过 NAT 机制将容器标记暴露的端口自动映射到本地主机的临时端口
 `-p, --publish=[]` | 指定如何映射到本地主机端口，例如 -p 11234-12234:1234-2234
 `--pid=host` | 容器的 PID 命名空间
 `--userns=""` | 启用 userns-remap 时配置用户命名空间的模式
 `--uts=host` | 容器的 UTS 命名空间
 `--restart="no"` | 容器的重启策略，包括 no, on-failure\[:max-retry\], always, unless-stopped 等
 `--rm=true|false` | 容器退出后是否自动删除，不能跟 -d 同时使用
 `-t, --tty=true|false` | 是否分配一个伪终端，默认为 false
 `--tmpfs=[]` | 挂载临时文件系统到容器
 `-v | --volume=[=[[HOST-DIR:]CONTAINER-DIR[:OPTIONS]]]` | 挂载主机上的文件卷到容器内
 `--volume-driver=""` | 挂载文件卷的驱动类型
 `--volumes-from=[]` | 从其他容器挂载卷
 `-w, --workdir=""` | 容器内的默认工作目录

**create 命令与容器环境和配置相关的选项**    


选项 | 说明
---------|----------
 `--add-host=[]` | 在容器内添加一个主机名到 IP 地址的映射关系（通过 /etc/hosts 文件）
 `--device=[]` | 映射物理机上的设备到容器内
 `--dns-search=[]` | DNS 搜索域
 `--dns-opt=[]` | 自定义的 DNS 选项
 `--dns=[]` | 自定义的 DNS 服务器
 `-e, --env=[]` | 指定容器内环境变量
 `--env-file=[]` | 从文件中读取环境变量到容器内
 `-h, --hostname=""` | 指定容器内的主机名
 `--ip=""` | 指定容器的 IPv4 地址
 `--ip6=""` | 指定容器的 IPv6 地址
 `--link=[<name or id>:alias]` | 链接到其他容器
 `--link-local-ip=[]` | 容器的本地链接地址列表
 `--mac-address=""` | 指定容器的 Mac 地址
 `--name=""` | 指定容器的别名

**create 命令与容器资源限制和安全保护相关的选项**    

选项 | 说明
----------|---------
 `--blkio-weight=10~1000` | 容器读写块设备的 IO 性能权重，默认为 0
 `--blkio-weight-device=[DEVICE_NAME:WEIGHT]` | 指定各个块设备的 IO 性能权重
 `--cpu-shares=0` | 允许容器使用 CPU 资源的相对权重，默认一个容器能用满一个核的 CPU
 `--cap-add=[]` | 增加容器的 Linux 指定安全能力
 `--cap-drop=[]` | 移除容器的 Linux 指定安全能力
 `-cgroup-parent=""` | 容器cgroups 限制的创建路径
 `--cidfile=""` | 指定容器的进程 ID 号写到文件
 `--cpu-period=0` | 限制容器在 CFS 调度器下的 CPU 占用时间片
 `--cpuset-cpus=""` | 限制容器能使用哪些 CPU 核心
 `--cpuset-mems=""` | NUMA 架构下使用哪些核心的内存
 `--cpu-quota=0` | 限制容器在 CFS 调度器下的 CPU 配额
 `--device-read-bps=[]` | 挂载设备的读吞吐率（以 bps 为单位）限制
 `--device-write-bps=[]` | 挂载设备的写吞吐率（以 bps 为单位）限制
 `--device-read-iops=[]` | 挂载设备的读速率（以每秒 i/o 次数为单位）限制
 `--device-write-iops=[]` | 挂载设备的写速率（以每秒 i/o 次数为单位）限制
 `--health-cmd=""` | 指定检查容器健康状态的命令
 `--health-interval=0s` | 执行健康检查的间隔时间，单位可以为 ms、s、m 或 h
 `--health-retries=int` | 健康检查失败重试次数，超过则认为不健康
 `--health-start-period=0s` | 容器启动后进行健康检查的等待时间，单位可以为 ms、s、m 或 h
 `--health-timeout=0s` | 健康检查的执行超时，单位可以为 ms、s、m 或 h
 `--no-healthcheck=true|false` | 是否禁用健康检查
 `--init` | 在容器中执行一个 init 进程，来负责响应信号和处理僵尸状态子进程
 `--kernal-memory=""` | 限制容器使用内核的内存大小，单位可以是 b、k、m 或 g
 `-m, --memory=""` | 限制容器内应用使用的内存，单位可以是 b、k、m 或 g
 `--memory-reservation=""` | 当系统中内存过低时， 容器会被强制限制内存到给定值，默认情况下等于内存限制值
 `--memory-swap="LIMIT"` | 限制容器使用内存和交换区的总大小
 `--oom-kill-disable=true|false`| 内存耗尽时是否杀死容器
 `--oom-score-adj=""` | 调整容器的内存耗尽参数
 `--pids-limit=""` | 限制容器的 pid 个数
 `--privileged=true|false` | 是否给容器高权限，这意味着容器内应用将不受权限的限制，一般不推荐
 `--read-only=true|false` | 是否让容器内的文件系统只读
 `--security-opt=[]` | 指定一些安全参数，包括权限、安全能力、apparmor 等
 `--stop-signal=SIGTERM` | 指定停止容器的系统信号
 `--shm-size=""` | /dev/shm 的大小
 `--sig-proxy=true|false` | 是否代理收到的信号给应用，默认为 true，不能代理 SIGCHLD, SIGSTOP, SIGKILL
 `--memory-swappiness="0~100"` | 调整容器的内存交换区参数
 `-u, --user=""` | 指定在容器内执行命令的用户信息
 `--userns=""` | 指定用户命名空间
 `--ulimit=[]` | 通过 ulimit 来指定最大文件数，最大进程数等

### 4.1.2 启动容器

使用 `docker [container] start` 命令来启动一个已经创建的容器。例如，启动刚创建的 ubuntu 容器。    

```bash
$ docker container start 46
46
```    

46 是容器 ID。   

### 4.1.3 新建并启动容器

除了创建容器后通过 start 命令来启动，也可以直接新建并启动容器。所需要的命令主要为 `docker [container] run`
等价于执行 `docker [container] create` 命令，再执行 `docker [container] start` 命令。   

例如，下面的命令输出一个 "Hello World"，之后容器自动停止：   

```bash
$ docker run ubuntu /bin/echo 'Hello World'
Hello World
```   

当利用 `docker [container] run` 来创建并启动容器时，Docker 在后台运行的标准操作包括：   

+ 检查本地是否存在指定的镜像，不存在就从公有仓库下载
+ 利用镜像创建一个容器，并启动该容器
+ 分配一个文件系统给容器，并在只读的镜像层外面挂载一层可读写层
+ 从宿主主机配置的网桥接口中桥接一个虚拟接口到容器中去
+ 从网桥的地址池配置一个 IP 地址给容器
+ 执行用户指定的应用程序
+ 执行完毕后容器被自动终止    

下面的命令启动一个 bash 终端，允许用户进行交互:    

```bash
$ docker run -it ubuntu:18.04 /bin/bash
root@afBbae53bdd3 /#
```   

其中 `-t` 选项让 Docker 分配一个伪终端并绑定到容器的标准输入上，`-i` 则让容器的标准输入保持
打开。   

某些时候，执行 `docker [container] run` 时候因为命令无法正常执行容器会出错直接退出，此时可以
查看退出的错误代码。   

默认情况下，常见错误代码包括：   

+ 125：Docker daemon 执行出错，例如指定了不支持的 Docker 命令参数
+ 126：所指定命令无法执行，例如权限出错
+ 127：容器内命令无法找到    

### 4.1.4 守护态运行

更多的时候，需要让 Docker 容器在后台以守护态形式运行，测试可以通过添加 -d 参数来实现。  

### 4.1.5 查看容器输出

要获取容器的输出信息，可以通过 `docker [container] logs` 命令。   

该命令支持的选项包括：   

- `details`: 打印详细信息
- `-f, -follow`: 持续保持输出
- `-since string`: 输出从某个时间开始的日志
- `-tail string`: 输出最近的若干日志
- `-t, -timestamps`: 显示时间戳信息
- `-until string`: 输出某个时间之前的日志

## 4.2 停止容器

### 4.2.1 暂停容器

使用 `docker [container] pause CONTAINER [CONTAINER...]` 命令来暂停一个运行中的容器。  

```bash
$ docker run --name test --rm -it ubuntu bash
$ docker pause test
```    

处于 paused 状态的容器，可以使用 `docker [container] unpause CONTAINER [CONTAINER...]`
命令来恢复到运行状态。   

### 4.2.2 终止容器

使用 `docker [container] stop` 来终止一个运行中的容器。命令格式为：   

```bash
$ docker [container] stop [-t|--time[=10]] [CONTAINER...]
```    

该命令会首先向容器发送 SIGTERM 信号，等待一段超时时间后（默认为 10 秒），再发送 SIGKILL 信号
来终止容器：   

```bash
$ docker stop ce5
ce5
```    

此时，执行 `docker container prune` 命令，会自动清除掉所有处于停止状态的容器。   

此外，还可以通过 `docker [container] kill` 直接发送 SIGKILL 信号来强行终止容器。    

当 Docker 容器中指定的应用终结时，容器也会自动终止。例如，对于上一章节中只启动了一个终端的容器，
用户通过 `exit` 命令或 Ctrl + d 来退出终端时，所创建的容器立刻终止，处于 stopped 状态。   

处于终止状态的容器，可以通过 `docker [container] start` 命令来重新启动。  

`docker [container] restart` 命令会将一个运行态的容器先终止，然后再重新启动。   

## 4.3 进入容器

在使用 -d 参数时，容器启动后会自动进入后台，用户无法看到容器中的信息，也无法进行操作。   

这个时候如果需要进入容器进行操作，推荐使用官方的 `attach` 或 `exec` 命令。   

### 4.3.1 attach 命令

```bash
$ docker [container] attach [--detach-keys[=[]]] [--no-stdin] [--sig-proxy=[true]] \
CONTAINER
```   

- `--detach-keys[=[]]`: 指定退出 attach 模式的快捷键序列，默认是 CTRL-p CTRL-q
- `--no-stdin=true|false`: 是否关闭标准输入，默认是保持打开
- `--sig-proxy=true|fasle`: 是否代理收到的系统信号给应用进程，默认为 true    

然而使用 attach 命令有时候并不方便。当多个窗口同时 attach 到同一个容器的时候，所有窗口都会
同步显示；当某个窗口因命令阻塞时，其他窗口也无法执行操作了。    

### 4.3.2 exec 命令

从 Docker 的 1.3.0 版本起，Docker 提供了一个更加方便的工具 exec 命令，可以在运行中容器内
直接执行任意命令。     

```bash
$ docker [container] exec [-d|--detach] [--detach-keys[=[]]] [-i|--interactive] \
[--privileged] [-t|--tty] [-u|--user[=USER]] CONTAINER COMMAND [ARG...]
```    

- `-d, --detach`: 在容器中后台执行命令
- `--detach-keys=""`: 指定将容器切回后台的按键
- `-e, --env=[]`: 指定环境变量列表
- `-i, --interactive=true|false`: 打开标准输入接受用户输入命令，默认为 false
- `--privileged=true|false`: 是否给执行命令以高权限，默认为 false
- `-t, --tty=true|false`: 分配伪终端，默认值为 false
- `-u, --user=""`: 执行命令的用户名或 ID

## 4.4 删除容器

使用 `docker [container] rm` 命令来删除处于终止或退出状态的容器，命令格式为:   

```bash
$ docker [container] rm [-f|--force] [-l|--link] [-v|--volumes] CONTAINER [CONTAINER...]
```   

主要支持的选项包括：   

- -f,--force=false: 是否强行终止并删除一个运行中的容器；
- -l, --link=false: 删除容器的连接，但保留容器；
- -v, --volumes=false: 删除容器挂载的数据卷；

## 4.5 导入和导出容器

某些时候，需要将容器从一个系统迁移到另外一个系统，此时可以使用 Docker 的导入和导出功能。    

### 4.5.1 导出容器

导出容器是指，导出一个已经创建的容器到一个文件，不管此时容器是否处于运行状态：   

```bash
$ docker [container] export [-o|--ouput[=""]] CONTAINER
```   

可以通过 -o 选项来指定导出的 tar 文件名，也可以通过重定向来实现。   

### 4.5.2 导入容器

导出的文件又可以通过使用 `docker [container] import` 命令导入变成镜像：   

```bash
$ docker import [-c|--change[=[]]] [-m|--message[=MESSAGE]] file|URL|- [REPOSITORY[:TAG]]
```  

例如：   

```bash
$ docker import test_for_run.tar - test/ubuntu:v1.0
```   

## 4.6 查看容器

1. 查看容器详情：`docker container inspect [OPTIONS] CONTAINER [CONTAINER...]`
2. 查看容器内进程：`docker [container] top [OPTIONS] CONTAINER [CONTAINER...]`
3. 查看统计信息：`docker [container] stats [OPTIONS] [CONTAINER...]`   

## 4.7 其他容器命令

### 4.7.1 复制文件

container cp 命令支持在容器和主机之间复制文件。命令格式为:   

```bash
$ docker [container] cp [OPTIONS] CONTAINER:SRC_PATH DEST_PATH|-
```   

支持的选项包括：   

- `-a, -archive`：打包模式，复制文件会带有原始的 uid/gid 信息
- `-L, -follow-link`：跟随软连接。当原路径为软连接时，默认只复制链接信息，使用该选项会复制
链接的目标内容

### 4.7.2 查看变更

container diff 查看容器内文件系统的变更：   

```bash
$ docker [containter] diff CONTAINER
```   

### 4.7.3 查看端口映射

container port 命令可以查看容器的端口映射情况。命令格式为:   

```bash
$ docker container port test
```    

### 4.7.4 更新配置

container update 命令可以更新容器的一些运行时配置，主要是一些资源限制份额。   

```bash
$ docker [container] update [OPTIONS] CONTAINER [CONTAINER...]
```   

支持的选项包括：   

- `-blkio-weight uint16`: 更新块 IO 限制，10~1000，默认值为 0，代表无限制
- `-cpu-period int`: 限制 CPU 调度器 CFS 使用时间，单位为微妙，最小为 1000
- `-cpu-quota int`: 限制 CPU 调度器 CFS 的配额，单位为微妙，最小 1000
- `-cpu-rt-period int`: 限制 CPU 调度器的实时周期，单位为微妙
- `-cpu-rt-runtime int`: 限制 CPU 调度器的实时运行时，单位为微妙
- `-c, -cpu-shares int`: 限制 CPU 的使用份额
- `-cpus decimal`: 限制 CPU 个数
- `-cpuset-cpus string`: 允许使用的 CPU 核
- `-cpuset-mems string`: 允许使用的内存块
- `-kernal-memory bytes`: 限制使用的内核内存
- `-m, -memory bytes`: 限制使用的内存
- `-memory-reservation bytes`: 内存软限制
- `-memory-swap bytes`: 内存加上缓存区的限制，-1 表示对缓冲区无限制；
- `-restart string`: 容器退出后的重启策略

# 第 5 章 访问 Docker 仓库

## 5.3 搭建本地私有仓库

### 5.3.1 使用 registry 镜像创建私有仓库

安装 Docker 后，可以通过官方提供的 registry 镜像来简单搭建一套本地私有仓库环境：   

```bash
$ docker run -d -p 5000:5000 registry:2
```    

这将会自动下载并启动一个 registry 容器，创建本地的私有仓库服务。   

默认情况下，仓库会被创建在容器的 /var/lib/registry 目录下。可以通过 -v 参数来将镜像文件存放
在本地的指定路径，例如下面的例子将上传的镜像放到 /opt/data/registry 目录：   

```bash
$ docker run -d -p 5000:5000 -v /opt/data/registry:/var/lib/registry registry:2
```    