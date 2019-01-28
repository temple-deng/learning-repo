# 第 4 章 使用 Docker 镜像和仓库

<!-- TOC -->

- [第 4 章 使用 Docker 镜像和仓库](#第-4-章-使用-docker-镜像和仓库)
  - [4.1 什么是 Docker 镜像](#41-什么是-docker-镜像)
  - [4.2 列出镜像](#42-列出镜像)
  - [4.5 构建镜像](#45-构建镜像)
    - [4.5.1 用 Docker 的 commit 命令创建镜像](#451-用-docker-的-commit-命令创建镜像)
    - [4.5.2 用 Dockerfile 构建镜像](#452-用-dockerfile-构建镜像)
    - [4.5.3 基于 Dockerfile 构建新镜像](#453-基于-dockerfile-构建新镜像)
    - [4.5.4 Dockerfile 和构建缓存](#454-dockerfile-和构建缓存)
    - [4.5.5 从新镜像启动容器](#455-从新镜像启动容器)
    - [4.5.6 Dockerfile 指令](#456-dockerfile-指令)
  - [4.6 将镜像推送到 Docker Hub](#46-将镜像推送到-docker-hub)
  - [4.8 运行自己的 Docker Registry](#48-运行自己的-docker-registry)
    - [4.8.1 从容器运行 Registry](#481-从容器运行-registry)
    - [4.8.2 测试新 Registry](#482-测试新-registry)

<!-- /TOC -->


## 4.1 什么是 Docker 镜像

Docker 镜像由文件系统叠加而成。最底端是一个引导文件系统，即 bootfs。这很像典型的Linux/Unix
的引导文件系统。Docker 用户几乎永远不会和引导文件系统有什么交互。实际上，当一个容器启动后，它将
会被移到内存中，而引导文件系统则会被卸载（unmount），以留出更多的内存供initrd磁盘镜像使用。   

到目前为止，Docker 看起来还很像一个典型的 Linux 虚拟化栈。实际上，Docker 镜像的第二层是 root
文件系统 rootfs，它位于引导文件系统之上。rootfs 可以是一种或多种操作系统。   

在传统的 Linux 引导过程中，root 文件系统会最先以只读的方式加载，当引导结束并完成了完整性检查
之后，它才会被切换为读写模式。但是在 Docker 里，root 文件系统永远只能是只读状态，并且 Docker
利用联合加载（union mount）技术又会在 root 文件系统层上加载更多的只读文件系统。联合加载指的是
一次同时加载多个文件系统，但是在外面看起来只能看到一个文件系统。联合加载会将各层文件系统叠加到一起，
这样最终的文件系统会包含所有底层的文件和目录。   

Docker 将这样的文件系统称为镜像。一个镜像可以放到另一个镜像的顶部。位于下面的镜像称为父镜像，可以
依次类推，直到镜像栈的最底部，最底部的镜像称为基础镜像（base image）。最后，当从一个镜像启动
容器时，Docker 会在该镜像的最顶层加载一个读写文件系统。我们想在 Docker 中运行的程序就是在
这个读写层中执行的。   

@TODO:    

当 Docker 第一次启动一个容器时，初始的读写层是空的。当文件系统发生变化时，这些变化都会应用到
这一层上。比如，如果想修改一个文件，这个文件首先会从该读写层下面的只读层复制到该读写层。该文件的
只读版本依然存在，但是已经在被读写层中的该文件副本所隐藏。    

通常这种机制被称为写时复制，这也是使 Docker 如此强大的技术之一。每个只读镜像层都是只读的，并且
以后永远不会变化。当创建一个新容器时，Docker 会构建出一个镜像栈，并在栈的最顶端添加一个读写层。
这个读写层再加上其下面的镜像层以及一些配置数据，就构成了一个容器。     

## 4.2 列出镜像

本地镜像都保存在 Docker 宿主机的 /var/lib/docker 目录下。每个镜像都保存在 Docker 所采用
存储驱动目录下面。也可以在 /var/lib/docker/containers 目录下面看到所有的容器。   

镜像是保存在仓库中的，可以将镜像仓库想象为类似 Git 仓库的东西。每个镜像仓库都可以存放很多镜像。   

为了区分同一个仓库中的不同镜像，Docker 提供了一种称为标签的功能。每个镜像在列出来时都带有一个
标签。一个镜像可以有多个标签。    

Docker Hub 有两种类型的仓库：用户仓库和顶层仓库。用户仓库的镜像是由 Docker 用户创建的，而顶层
仓库则是由 Docker 内部的人来管理的。   

用户仓库的命名由用户名和仓库名两部分组成，如 jamtur01/puppet。   

与之相对，顶层仓库只包含仓库名部分。    

## 4.5 构建镜像

构建 Docker 镜像有以下两种方法：   

- 使用 `docker commit` 命令
- 使用 `docker build` 命令和 Dockerfile 文件

### 4.5.1 用 Docker 的 commit 命令创建镜像

可以将此想象为我们是在往版本控制系统里提交变更。我们先创建一个容器，并在容器里做出修改，就像
修改代码一样，最后再将修改提交为一个新镜像。    

### 4.5.2 用 Dockerfile 构建镜像

Dockerfile 使用基本的基于 DSL（Domain Specific Language）语法的指令来构建一个 Docker 镜像。
一旦有了 Dockerfile，我们就可以使用 `docker build` 命令基于该 Dockerfile 中的指令构建
一个新的镜像。   

```bash
$ mkdir static_web
$ cd static_web
$ touch Dockerfile
```    

我们创建了一个名为 static_web 的目录用来保存 Dockerfile，这个目录就是我们的构建环境（bulid
environment），Docker 则称此环境为上下文（context）或者构建上下文（build context）。Docker
会在构建镜像时将构建上下文和该上下文中的文件和目录上传到 Docker 守护进程。    

```dsl
# Version: 0.0.1
FROM ubuntu:14.04
MAINTAINER James Turnbull "james@example.com"
RUN apt-get update && apt-get install -y nginx
RUN echo 'Hi, I am in your container' \
    >/usr/share/nginx/html/index.html
EXPOSE 80
```   

该 Dockerfile 由一系列指令和参数组成。每条指令，如 FROM，都必须为大写字母，且后面要跟随一个
参数。Dockerfile 中的指令会按顺序从上到下执行。   

每条指令都会创建一个新的镜像层并对镜像进行提交。Docker 大体上按照如下流程执行 Dockerfile 中的
指令：   

- Docker 从基础镜像运行一个容器
- 执行一条指令，对容器做出修改
- 执行类似 docker commit 的操作，提交一个新的镜像层
- Docker 再基于刚提交的镜像运行一个新容器
- 执行 Dockerfile 中的下一条指令，知道所有指令都执行完毕     

每个 Dockerfile 的第一条指令必须是 FROM。FROM 指令指定一个已经存在的镜像，后续指令都将基于
该镜像进行，这个镜像被称为基础镜像。   

接着指定了MAINTAINER指令，这条指令会告诉Docker该镜像的作者是谁，以及作者的电子邮件地址。这有
助于标识镜像的所有者和联系方式。    

RUN 执行会在当前镜像中运行指定的命令。在这个例子里，我们通过 RUN 指令更新了已经安装的 APT 仓库，
安装了 nginx 包，之后创建了 /usr/share/nginx/html/index.html。    

默认情况下，RUN 指令会在 shell 里使用命令包装器 /bin/sh -c 来执行。如果是在一个不支持 shell
的平台上运行或者不希望在 shell 中运行，也可以使用 exec 格式的 RUN 指令：   

```bash
RUN [ "apt-get", " install", "-y", "nginx" ]
```   

接着设置了 EXPOSE 指令，这条指令告诉 Docker 该容器内的应用程序将会使用容器的指定端口。这并不
意味着可以自动访问任意容器运行中服务的端口。处于安全的原因，Docker 并不会自动打开该端口，而是
需要用户在使用 docker run 运行容器时来指定需要打开哪些端口。    

可以指定多个 EXPOSE 指令来向外部公开多个端口。   

### 4.5.3 基于 Dockerfile 构建新镜像

执行 `docker build` 命令时，Dockerfile 中的所有指令都会被执行并且提交，并且在该命令成功结束后
返回一个新镜像。    

```bash
$ cd static_web
$ docker build -t="dengbo/static_web" .
Sending build context to Docker daemon  2.048kB
Step 1/5 : FROM ubuntu:18.04
 ---> 1d9c17228a9e
Step 2/5 : MAINTAINER dengbo "d18710360845@gmail.com"
 ---> Running in 494001e4b83a
Removing intermediate container 494001e4b83a
 ---> ff833505ed31
Step 3/5 : RUN apt-get update && apt-get install -y nginx
 ---> Running in 7cd7c3da5ace
...
...
Removing intermediate container 7cd7c3da5ace
 ---> 0cc11686298b
Step 4/5 : RUN echo 'Hi, I am in your container' > /usr/share/nginx/html/index.html
 ---> Running in 4e350b194c4e
Removing intermediate container 4e350b194c4e
 ---> 242515a65c91
Step 5/5 : EXPOSE 80
 ---> Running in de82d956ea6d
Removing intermediate container de82d956ea6d
 ---> c5a9249618e1
Successfully built c5a9249618e1
Successfully tagged dengbo/static_web:latest
```  

最开始的 1d9c 是 ubuntu:18.04 的镜像 ID。最后的 c5 是新创建的镜像的 ID。   

我们通过指定 -t 选项为新镜像设置了仓库和名称。也可以在构建镜像的过程中为镜像设置一个标签。   

如果在构建上下文的根目录下存在以 .dockerignore 命名的文件的话， 那么该文件内容会被按行进行分割，
每一行都是一条文件过滤匹配模式。这非常像 .gitignore 文件，该文件用来设置哪些文件不会被当作构建
上下文的一部分，因此可以防止它们被上传到Docker守护进程中去。该文件中模式的匹配规则采用了Go语言
中的filepath。    

### 4.5.4 Dockerfile 和构建缓存

由于每一步的构建过程都会将结果提交为镜像，所以 Docker 的构建镜像过程就显得非常聪明。它会将之前
的镜像层看作缓存。比如，在我们的调试例子里，我们不需要在第1步到第3步之间进行任何修改，因此
Docker 会将之前构建时创建的镜像当做缓存并作为新的开始点。实际上，当再次进行构建时，Docker会
直接从第4步开始。当之前的构建步骤没有变化时，这会节省大量的时间。如果真的在第1步到第3步之间做
了什么修改，Docker则会从第一条发生了变化的指令开始。    

话说再次构建又是该如何理解。   

然而，有些时候需要确保构建过程不会使用缓存。比如，如果已经缓存了前面的第3步，即apt-get update，
那么Docker将不会再次刷新APT包的缓存。这时用户可能需要取得每个包的最新版本。要想略过缓存功能，
可以使用docker build的--no-cache标志。    

### 4.5.5 从新镜像启动容器

```bash
$ docker run -d -p 80 --name static_web dengbo/static_web \
nginx -g "daemon off;"
```    

这里我们使用了 -p 标志，该标志用来控制 Docker 在运行时应该公开哪些网络端口给外部（宿主机）。
运行一个容器时，Docker 可以通过两种方法来在宿主机上分配端口：   

+ Docker 可以在宿主机上随机选择一个位于 32768~61000 的一个比较大的端口号来映射到容器中的 80
端口上。
+ 可以在 Docker 宿主机中指定一个具体的端口号来映射到容器中的 80 端口上   

可以通过 `docker port` 来查看容器的端口映射情况。   

```bash
$ docker port static_web 80
```    

-p 选项为我们在将容器端口向宿主机公开时提供了一定的灵活性。比如，可以指定将容器中的端口映射到
Docker 宿主机的某一特定端口上：   

```bash
docker run -d -p 80:80 --name static_web jamtur01/static_web \
nginx -g "daemon off;"
```   

前面的 80 是宿主机的端口。   

Docker 还提供了一个更简单的方式，即 -P 参数，该参数可以用来对外公开在 Dockerfile 中通过 EXPOSE
指令公开的所有端口。该命令会将容器内的端口对本地宿主机公开，并且绑定到宿主机的一个随机端口上。   

### 4.5.6 Dockerfile 指令

Dockerfile 中还有很多其他指令，这些指令包括 CMD, ENTRYPOINT, ADD, COPY, VOLUME, WORKDIR,
USER, ONBUILD 和 ENV 等。   

1. **CMD**   

CMD 指令用于指定一个容器启动时要运行的命令。这有点类似于 RUN 指令，只是 RUN 指令是指定镜像被
构建时要运行的命令，而 CMD 是指定容器被启动时要运行的命令。这和使用 `docker run` 命令启动容器
时指定要运行的命令非常类似：   

```bash
$ docker run -ti dengbo/static_web /bin/true
```   

可以认为上面的命令和在 Dockerfile 中使用如下指令是等效的：   

```
CMD ["/bin/true"]
```   

最后，还需牢记，使用 `docker run` 命令可以覆盖 CMD 指令。    

在 Dockerfile 中只能指定一条 CMD 指令。如果指定了多条 CMD 指令，也只有最后一条 CMD 指令
会被使用。   

2. **ENTRYPOINT**   

ENTRYPOINT 和 CMD 非常类似。与 CMD 不同的是，ENTRYPOINT 指令提供的命令不容易在启动容器时被
覆盖。实际上，`docker run` 命令行中指定的任何参数都会被当做参数再次传递给 ENTRYPOINT 指令
中指定的命令。   

```
ENTRYPOINT ["/usr/sbin/nginx"]
```   

```bash
$ docker run -it dengbo/static_web -g "daemon off;"
```   

如果确实需要，用户也可以在运行时通过 `docker run` 的 --entrypoint 标志覆盖 ENTRYPOINT 指令。   

3. **WORKDIR**    

WORKDIR 指令用来在从镜像创建一个新容器时，在容器内部设置一个工作目录，ENTRYPOINT 和 CMD 指定
的程序会在这个目录下执行。   

我们可以使用该指令为Dockerfile中后续的一系列指令设置工作目录，也可以为最终的容器设置工作目录。    

```
WORKDIR /opt/webapp/db
RUN bundle install
WORKDIR /opt/webapp
ENTRYPOINT ["rackup"]
```   

4. **ENV**   

ENV 指令用来在镜像构建过程中设置环境变量：   

```
ENV RVM_PATH /home/rvm
```  

这个新的环境变量可以在后续的任何 RUN 指令中使用。   

可以同时指定多个环境变量：   

```
ENV RVM_PATH=/home/rvm RVM_ARCHFLAGS="-arch i386"
```    

这些环境变量也会被持久保存到从我们的镜像创建的任何容器中。也可以使用 `docker run` 命令行的
-e 标志来传递环境变量，这些变量将只会在运行时有效。   

5. **USER**    

USER 指令用来指定该镜像会以什么样的用户去运行：   

```
USER nginx
```     

基于该镜像启动的容器会以 nginx 用户的身份来运行。我们可以指定用户名或UID以及组或GID，甚至是
两者的组合：   

```
USER user
USER user:group
USER uid
USER uid:gid
USER user:gid
USER uid:group
```   

也可以在 `docker run` 命令中通过 -u 标志来覆盖该指令指定的值。    

如果不通过 USER 指令指定用户，默认用户为 root。   

6. **VOLUME**   

VOLUME 指令用来向基于镜像创建的容器添加卷。一个卷是可以存在于一个或多个容器内的特定目录。这个目录
可以绕过联合文件系统，并提供如下共享数据或者对数据进行持久化的功能:   

+ 卷可以在容器间共享和重用
+ 一个容器可以不是必须的和其他容器共享卷
+ 对卷的修改是立时生效的
+ 对卷的修改不会对更新镜像产生影响
+ 卷会一直存在直到没有任何容器再使用它    

```
VOLUME ["/opt/project"]
```   

这条指令将会为基于此镜像创建的任何容器创建一个名为 /opt/project 的挂载点。    

也可以通过指定数据的方式指定多个卷。   

7. **ADD**    

ADD 指令用来将构建环境下的文件和目录复制到镜像中。比如，在安装一个应用程序时。ADD 指令需要源文件
位置和目的文件位置两个参数：    

```
ADD software.lic /opt/application/software.lic
```   

这里的 ADD 指令将构建目录下的 software.lic 文件复制到镜像中的 /opt/application/software.lic。
指向源文件的位置参数可以是一个 URL，或者构建上下文或环境中文件名或目录。不能对构建目录或者上下文
之外的文件进行 ADD 操作。   

在 ADD 文件时，Docker 通过目的地址参数末尾的字符来判断文件源是目录还是文件。如果目标地址以 /
结尾，那么 Docker 就认为源位置指向的是一个目录。如果目标地址不是以 / 结尾，那么 Docker 就认为
源位置指向的是文件。   

如果将一个归档文件（合法的归档文件包括gzip、bzip2、xz）指定为源文件，Docker会自动将归档文件解开。    

ADD指令会使得构建缓存变得无效，这一点也非常重要。如果通过ADD指令向镜像添加一个文件或者目录，那么
这将使Dockerfile中的后续指令都不能继续使用之前的构建缓存。    

8. **COPY**    

COPY 指令非常类似于 ADD，它们根本的不同是 COPY 只关心在构建上下文中复制本地文件，而不会去做文件
提取和解压。   

文件源路径必须是一个与当前构建环境相对的文件或者目录，本地文件都放到和Dockerfile同一个目录下。
不能复制该目录之外的任何文件，因为构建环境将会上传到Docker守护进程，而复制是在 Docker 守护进程
中进行的。任何位于构建环境之外的东西都是不可用的。COPY指令的目的位置则必须是容器内部的一个绝对路径。   

9. **LABEL**    

LABEL 指令用于为 Docker 镜像添加元数据。元数据以键值对的形式展现。    

```
LABEL version="1.0"
LABEL location="New York" type="Data Center" role="Web Server"
```    

10. **STOPSIGNAL**    

STOPSIGNAL 指令用来设置停止容器时发送什么系统调用信号给容器。这个信号必须是内核系统调用表中合法
的数，或者 SIGNAME 格式中的信号名称。   


11. **ARG**    

ARG 指令用来定义可以在 docker build 命令运行时传递给构建运行时的变量，我们只需要在构建时使用
--build-arg 标志即可。用户只能在构建时指定在 Dockerfile 文件中定义过的参数。   

```
ARG build
ARG webapp_user=user
```   

上面例子中第二条 ARG 指令设置了一个默认值，如果构建时没有为该参数指定值，就会使用这个默认值。   

Docker 预定义了一组 ARG 变量，可以在构建时直接使用，而不必再到 Dockerfile 中自行定义。   

```
HTTP_PROXY
http_proxy
HTTPS_PROXY
https_proxy
FTP_PROXY
ftp_proxy
NO_PROXY
no_proxy
```   

12. **ONBUILD**

ONBUILD 指令能为镜像添加触发器。当一个镜像被用作其他镜像的基础镜像时，该镜像中的触发器将会被执行。   

触发器会在构建过程中插入新指令，我们可以认为这些指令是紧跟在 FROM 之后指定的。触发器可以是任何
构建指令：   

```
ONBUILD ADD . /app/src
ONBUILD RUN cd /app/src && make
```    

ONBUILD 触发器会按照在父镜像中指定的顺序执行，并且只能被继承一次（也就是说只能在子镜像中执行，
而不会再孙子镜像中执行）。    

## 4.6 将镜像推送到 Docker Hub

除了从命令行构建和推送镜像，Docker Hub 还允许我们定义自动构建。为了使用自动构建，我们只需要将
GitHub 或 BitBucket 中含有 Dockerfile 文件中的仓库连接到 Docker Hub 即可。向这个代码
仓库推送代码时，将会触发一次镜像构建活动并创建一个新镜像。   

在 Docker Hub 中添加自动构建任务的第一步是将 GitHub 或者 Bitbucket 账号连接到 Docker Hub。
具体操作是，打开Docker Hub，登录后单击个人信息链接，之后单击Add Repository->Automated
Build按钮。    

## 4.8 运行自己的 Docker Registry

### 4.8.1 从容器运行 Registry

从 Docker 容器安装一个 Registry 非常简单：   

```bash
$ docker run -p 5000:5000 registry:2
```    

从 Docker1.3.1 开始，需要在启动 Docker 守护进程的命令中添加 `-insecure-registry localhost:5000`
标志，并重启守护进程，才能使用本地 Registry。   

该命令将会启动一个运行 Registry 应用 2.0 版本的容器，并将 5000 端口绑定到本地宿主机。   

### 4.8.2 测试新 Registry

我们找到镜像ID，即22d47c8cb6e5，并使用新的Registry给该镜像打上标签。为了指定新的Registry
目的地址，需要在镜像名前加上主机名和端口前缀。在这个例子里，我们的Registry主机名为docker.example.com.    

```bash
$ docker tag 22d47c8cb6e5 docker.example.com:5000/dengbo/static_web
```    

为镜像打完标签之后，就能通过 `docker push` 命令将它推送到新的 Registry 中去了。   

```bash
$ docker push docker.example.com:5000/dengbo/static_web
```   
