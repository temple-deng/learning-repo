# 第 6 章 Docker 数据管理

<!-- TOC -->

- [第 6 章 Docker 数据管理](#第-6-章-docker-数据管理)
  - [6.1 数据卷](#61-数据卷)
    - [6.1.1 创建数据卷](#611-创建数据卷)
    - [6.1.2 绑定数据卷](#612-绑定数据卷)
  - [6.2 数据卷容器](#62-数据卷容器)
  - [6.3 利用数据卷容器来迁移数据](#63-利用数据卷容器来迁移数据)
- [第 7 章 端口映射和容器互联](#第-7-章-端口映射和容器互联)
  - [7.1 端口映射实现容器访问](#71-端口映射实现容器访问)
    - [7.1.1 从外部访问容器应用](#711-从外部访问容器应用)
- [第 8 章 使用 Dockerfile 创建镜像](#第-8-章-使用-dockerfile-创建镜像)
  - [8.1 基本结构](#81-基本结构)
  - [8.2 指令说明](#82-指令说明)
    - [8.2.1 配置命令](#821-配置命令)
    - [8.2.2 操作指令](#822-操作指令)
  - [8.3 创建镜像](#83-创建镜像)
    - [8.3.1 多步骤创建](#831-多步骤创建)

<!-- /TOC -->

在生产环境中使用 Docker，往往需要对数据进行持久化，或者需要在多个容器之间进行数据共享，这必然
涉及容器的数据管理操作。容器中的管理数据主要有两种方式：   

- 数据卷：容器内数据直接映射到本地主机环境
- 数据卷容器：使用特定容器维护数据卷

## 6.1 数据卷

**数据卷**（Data Volumes）是一个可供容器使用的特殊目录，它将主机操作系统目录直接映射进容器，
类似于 Linux 中的 mount 行为。    

### 6.1.1 创建数据卷

Docker 提供了 volume 子命令来管理数据卷：   

```bash
$ docker volume create -d local test
```   
此时查看 /var/lib/docker/volums 路径下，会发现所创建的数据卷位置（然而 Mac 上没有这个目录）：   

```bash
$ ls -l /var/lib/docker/volums
drwxr - xr-x 3 root root 4096 May 22 06:02 test
```   

除了 create 子命令外，docker volume 还支持 inspect（查看详细信息）、ls（列出已有数据卷）、
prune（清理无用数据卷）、rm（删除数据卷）。     

### 6.1.2 绑定数据卷

除了使用 volume 子命令来管理数据卷外，还可以在创建容器时将主机本地的任意路径挂载到容器内作为数据
卷，这种形式创建的数据卷称为绑定数据卷。   

在用 `docker [container] run` 命令的时候，可以使用 -mount 选项来使用数据卷。   

-mount 选项支持三种类型的数据卷，包括：   

- volume: 普通数据卷，映射到主机 /var/lib/docker/volumes 路径下
- bind: 绑定数据卷，映射到主机指定路径下
- tmpfs: 临时数据卷，只存在于内存中    

下面使用 training/webapp 镜像创建一个 Web 容器，并创建一个数据卷挂载到容器的 /opt/webapp 目录：   

```bash
$ docker run -d -P --name web --mount type=bind,source=/webapp,destination=/opt/webapp \
> training/webapp python app.py
```   

上述命令等同于使用旧的 -v 标记可以在容器内创建一个数据卷：    

```bash
$ docker run -d -P --name web -v /webapp:/opt/webapp training/webapp pythod app.py
```    

另外，本地目录的路径必须是绝对路径，容器内路径可以为相对路径 。    

## 6.2 数据卷容器

如果用户需要在多个容器之间共享一些持续更新的数据，最简单的方式是使用数据卷容器。数据卷容器也是一个
容器，但是它的目的是专门提供数据卷给其他容器挂载。    

首先，创建一个数据卷容器 dbdata，并在其中创建一个数据卷挂载到 /dbdata:    

```bash
$ docker run -ti -v /dbdata --name dbdata ubuntu
```   

然后，可以在其他容器中使用 --volumes-from 来挂载 dbdata 容器中的数据卷，例
如创建 db1 和 db2 两个容器，并从 dbdata 容器挂载数据卷：   

```bash
$ docker run -it --volumes-from dbdata --name db1 ubuntu
$ docker run -it --volumes-from dbdata --name db2 ubuntu
```   

此时，容器 db1 和 db2 都挂载同一个数据卷到相同的 /dbdata 目录，三个容器任何一方在该目录下的
写入，其他容器都可以看到。   

如果删除了挂载的容器（包括 dbdata, db1 和 db2），数据卷并不会被自动删除。如果要删除一个数据卷，
必须在删除最后一个还挂载着它的容器时显示使用 `docker rm -v` 命令来指定同时删除关联的容器。   

## 6.3 利用数据卷容器来迁移数据

可以利用数据卷容器对其中的数据卷进行备份、恢复，以实现数据的迁移。    

备份：    

```bash
$ docker run --volumes-from dbdata -v $(pwd):/backup --name worker ubuntu tar \
> cvf /backup/backup.tar /dbdata
```    

首先，创建容器 worker，使用 --volumes-from dbdata 参数来让 worker 容器挂载 dbdata 容器
的数据卷，使用 -v $(pwd):/backup 参数来挂载本地的当前目录到 worker 容器的 /backup 目录。   

当 worker 容器启动后，使用 `tar cvf /backup/backup.tar /dbdata` 命令将 /dbdata 下内容
备份为容器内的 /backup/backup.tar。    

如果要恢复数据到一个容器，首先创建一个带有数据卷的容器 dbdata2:   

```bash
$ docker run -v /dbdata --name dbdata2 ubuntu /bin/bash
```   

然后创建另一个新的容器，挂载 dbdata2 的容器，并使用 untar 解压备份文件到所挂载的容器卷中：   

```bash
$ docker run --volumes-from dbdata2 -v $(pwd):/backup busybox tar xvf /backup/backup.tar
```   

# 第 7 章 端口映射和容器互联

## 7.1 端口映射实现容器访问

### 7.1.1 从外部访问容器应用

当容器中运行一些网络应用，要让外部访问这些应用时，可以通过 -P 或 -p 参数来指定端口映射。当使用
-P 时，Docker 会随机映射一个 49000~499900 的端口到内部容器开放的网络端口。   

# 第 8 章 使用 Dockerfile 创建镜像

## 8.1 基本结构

一般而言，Dockerfile 主体内容分为四部分：基础镜像信息、维护者信息、镜像操作执行和容器启动时执行
指令。   

## 8.2 指令说明

Dockerfile 中指令的一般格式为 INSTRUCTION arguments，包括“配置指令”和“操作指令”。   

配置指令：   

- ARG: 定义创建镜像过程中使用的变量
- FROM: 指定所创建镜像的基础镜像
- LABEL: 为生成的镜像添加元数据标签信息
- EXPOSE: 声明镜像内服务监听的端口
- ENV: 指令环境变量
- ENTRYPOINT: 指定镜像的默认入口命令
- VOLUME: 创建一个数据卷挂载点
- USER: 指定运行容器时的用户名或 UID
- WORKDIR: 配置工作目录
- ONBUILD: 创建子镜像时指定自动执行的操作指令
- STOPSIGNAL: 指定退出的信号值
- HEALTHCHECK: 配置所启动容器如何进行健康检查
- SHELL: 指定默认 shell 类型

操作指令：   

- RUN: 运行指定命令
- CMD: 启动容器时指定默认执行的命令
- ADD: 添加内容到镜像
- COPY: 复制内容到镜像   

### 8.2.1 配置命令

1. **ARG**    

格式为 `ARG <name>[=<default value>]`。当执行 docker build 时，可以通过 -build-arg[=]
来为变量赋值。当镜像编译成功后，ARG 指定的变量将不再存在。   

2. **LABEL**    

LABEL 指令为生成的镜像添加元数据标签信息。格式为 `LABEL <key>=<value> <key>=<value> ....`。   

3. **EXPOSE**    

格式为 `EXPOSE <port> [<port>/<protocol>...]`。    

4. **ENV**    

格式为 `ENV <key> <value>` 或 `ENV <key>=<value>`>   

5. **HEALTHCHECK**    

配置所启动容器如何进行健康检查，格式有两种：   

- `HEALTHCHECK [OPTIONS] CMD command`: 根据所执行命令返回值是否为 0 来判断
- `HEALTHCHECK NONE`: 禁止基础镜像中的健康检查   

OPTION 支持如下参数：   

- `-interval=DURATION` 默认 30s
- `-timeout=DURATION` 默认 30s
- `-retries=N` 默认 3，如果失败了，重试几次才最终确定失败   

### 8.2.2 操作指令

1. **RUN**    

格式为 `RUN <command>` 或 `RUN ["executable", "param1", "param2"]` 注意后者指令会被
解析为 JSON 数组，因此必须使用双引号。   

当命令较长时可以使用 \\ 来换行。   

2. **CMD**    

支持三种格式：   

- `CMD ["executable", "param1", "params2"]`: 相当于执行 executable param1 param2
- `CMD command param1 param2`: 在默认的 shell 中执行，提供给需要交互的应用
- `CMD ["param1", "param2"]`: 提供给 ENTRYPOINT 的默认参数   

3. **ADD**   

格式为 `ADD <src> <dest>`，该命令将复制指定的 `<src>` 路径下内容到容器中的 `<dest>` 路径下。   

其中 `<src>` 可以是 Dockerfile 所在目录的一个相对路径；也可以是一个 URL；还可以是一个 tar
文件（自动解压为目录）。路径支持正则格式：`ADD *.c /code/`。    

4. **COPY**   

与 ADD 类似，但是不支持 URL 和自动解包。   

## 8.3 创建镜像

```bash
$ docker build [OPTIONS] PATH | URL | -
```   

该命令将读取指定路径下（包括子目录）的 Dockerfile，并将该路径下的所有数据作为上下文发送给 Docker
服务端。Docker 服务端在校验 Dockerfile 格式通过后，逐条执行其中定义的指令，碰到 ADD, COPY
和 RUN 指令会生成一层新的镜像。   

如果上下文过大，会导致发送大量数据给服务端，延缓创建过程。因此除非是生成镜像所必须的文件，不然
不要放到上下文路径下。    

### 8.3.1 多步骤创建

自 17.05 版本开始，Docker 支持多步骤镜像创建特型，可以精简最终生成的镜像大小。   

对于需要编译的应用（如 C, Go 或 Java 语言等）来说，通常情况下至少需要准备两个环境的 Docker 镜像：   

- 编译环境镜像：包含完整的编译引擎、依赖库等。作用是编译应用为二进制文件。   
- 运行环境镜像：利用编译好的二进制文件，运行应用，由于不需要编译环境，体积比较小。    

创建 Dockerfile，使用 golang:1.9 镜像编译应用二进制文件为 app，使用精简的镜像 alpine:latest
作为运行环境：   

```
FROM golang:1.9 as builder # define stage name as builder
RUN mkdir -p /go/src/test
WORKDIR /go/src/test
COPY main.go .
RUN CGO_ENABLED=0 GOOS=linux go build -o app .

FROM alpine:latest
RUN apk --no-cache ca-certificates
WORKDIR /root/
COPY --from=builder /go/src/test/app . 
CMD ["./app"]
```    
