# Redis 4.X Cookbook（版本 5.0.3）

<!-- TOC -->

- [Redis 4.X Cookbook（版本 5.0.3）](#redis-4x-cookbook版本-503)
- [第 1 章 开始使用 Redis](#第-1-章-开始使用-redis)
  - [1.2 下载和安装](#12-下载和安装)
    - [1.2.1 操作步骤](#121-操作步骤)
    - [1.2.2 工作原理](#122-工作原理)
  - [1.3 启动和停止 Redis](#13-启动和停止-redis)
    - [1.3.1 操作步骤](#131-操作步骤)
    - [1.3.2 工作原理](#132-工作原理)
    - [1.3.3 更多细节](#133-更多细节)
  - [1.4 使用 redis-cli 连接到 Redis](#14-使用-redis-cli-连接到-redis)
    - [1.4.1 操作步骤](#141-操作步骤)
    - [1.4.2 工作原理](#142-工作原理)
  - [1.5 获取服务器信息](#15-获取服务器信息)
    - [1.5.1 操作步骤](#151-操作步骤)
    - [1.5.2 工作原理](#152-工作原理)
  - [1.6 理解 Redis 事件模型](#16-理解-redis-事件模型)
  - [1.7 理解 Redis 通信协议](#17-理解-redis-通信协议)
    - [1.7.1 操作步骤](#171-操作步骤)
    - [1.7.2 工作原理](#172-工作原理)

<!-- /TOC -->

# 第 1 章 开始使用 Redis

## 1.2 下载和安装

### 1.2.1 操作步骤

下面演示在 Ubuntu16.04 中编译和安装 Redis:   

1. 安装编译工具：`$sudo apt-get install build-essential`
2. 为 Redis 创建目录并切换到所创建的目录中：   

```bash
$ mkdir /redis
$ cd /redis
```   

3. 下载 Redis   

```bash
$ wget http://download.redis.io/release/redis-4.0.1.tar.gz
```    

4. 解压下载到的 Redis 源码并切换到对应的目录下：   

```bash
$ tar zxvf redis-4.0.1.tar.gz
$ cd redis-4.0.1
```   

5. 为 Redis 的配置文件创建目录并把默认配置文件复制进去：   

```bash
$ mkdir /redis/conf
$ cp redis.conf /redis/conf/
```    

6. 编译依赖项：   

```bash
$ cd deps
$ make hiredis lua jemalloc linenoise
$ cd ..
```    

7. 编译 Redis    

```bash
$ make
```    

如果编译顺利，将会看到如下的提示，代表已经成功地完成了编译：    

```
It's a good idea to run 'make test' ;)
make[1]: Leaving directory '/redis/redis-4.0.1/src
```    

8. 安装 Redis    

```bash
$ make PREFIX=/redis install
```    

9. 进入 /redis 目录并验证生成了 Redis 的二进制可执行文件：   

```bash
$ ls /redis/bin
redis-benchmark redis-check-aof redis-check-rdb redis-cli redis-sentinel redis-server
```    

### 1.2.2 工作原理

偶数的主版本号代表稳定版，奇数的主版本号表示不稳定版。     

编译安装和通过软件仓库安装 Redis 的不同之处在于，前者可以在编译时添加优化或调试选项，还能够灵活
地指定安装位置。    

安装完成后，bin 目录中会有一些可执行文件：    

- redis-server: Redis 服务端
- redis-sentinel: Redis Sentinel，redis-server 的软链接
- redis-cli: Redis 命令行工具
- redis-check-rdb: Redis RDB 检查工具
- redis-check-aof: Redis Append Only Files 检查工具
- redis-benchmark: Redis 基准/性能测试工具

## 1.3 启动和停止 Redis

### 1.3.1 操作步骤

启动和停止 Redis 服务端的步骤如下：   

1. 可以使用默认配置来启动一个 Redis 实例：`$ bin/redis/server`
2. 要在启动 Redis 服务端时指定配置文件，例如欲使用我们从源码包中拷贝过来的配置文件时：    

```bash
$ bin/redis-server conf/redis.conf
```    

3. 如果是从操作系统的软件仓库中安装的 Redis，那么可以使用 init.d 脚本启动 Redis:    

```bash
$ /etc/init.d/redis-server start
```    

4. 如果要以 redis-server 守护进程的方式在后台启动 Redis，那么可以编辑配置文件并将 daemonize
参数设为 yes 并使用该配置文件启动：    

```bash
$ vim conf/redis.conf
daemonize yes
$ bin/redis-server conf/redis.conf
```    

5. 通过 redis-cli 调用 shutdown 命令来停止 Redis:    

```bash
$ cd /redis
$ bin/redis-cli shutdown
```   

6. 如果 Redis 是从软件仓库中安装的话，那么还可以通过 init.d 脚本关闭：   

```bash
$ /etc/init.d/redis-server stop
```    

### 1.3.2 工作原理

Redis 中的术语实例代表一个 redis-server 进程。同一台主机上可以运行多个 Redis 实例，只要这些
实例使用不同的配置即可，比如绑定到不同的端口、使用不同的路径保存数据持久化相关的文件，或采用不同
的日志路径等。    

启动和停⽌ Redis 实例是基本操作。对于启动 Redis ⽽⾔没有太多需要注意的；但对于⼀个数据服务来说，
停⽌Redis服务却尤为需要注意，因为作为⼀种数据存储服务，学会如何优雅地停⽌Redis服务端以保持数
据的⼀致性，是⾮常重要的。    

之所以强烈建议使用 shutdown 命令停止 Redis 服务的原因在于，如果我们关心数据一致性且配置了数据
持久化来将内存中的数据保存到磁盘中，那么 shutdown 命令发出后，除了终结进程外，还会执行一系列的
其他操作。    

⾸先，redis-server 会停⽌响应客户端的连接；然后，如果启⽤了持久化，则会执⾏数据持久化操作。
之后，如果 .pid ⽂件和 socket 套接字⽂件描述符存在的话，则对其进⾏清理，并最终退出进程。    

应该注意的是，使⽤ kill 命令或其他进程管理⼯具向 Redis 进程发送 SIGTERM（15）信号基本上等同于
使⽤ shutdown 命令优雅地停⽌ redis-server。     

### 1.3.3 更多细节

在启动 Redis 时，可以直接将配置参数添加到 redis-server 的命令行参数中，这对于在单台主机上部署
多个实例的情况非常有用。当单台主机上存在多个实例时，我们可以把通用的配置参数保存在一个配置文件中；
同时，在启动 Redis 时通过命令行参数传递每个实例所独有的配置参数。    

## 1.4 使用 redis-cli 连接到 Redis

### 1.4.1 操作步骤

使用 redis-cli 连接到 Redis 服务器的步骤如下：   

```bash
$ bin/redis-cli
127.0.0.1:6379>
```    

1. 打开一个终端，并通过 redis-cli 连接到 Redis
2. 我们可以发送一些简单的命令进行测试，其他更多的数据类型和特型将在接下来的章节中进行讨论    

设置两个字符串键值对 foo value1 和 bar value2:   

```bash
127.0.0.1:6379> set foo value1
OK
127.0.0.1:6379> set bar value2
OK
```   

获取刚刚设置的值：    

```bash
127.0.0.1:6379> get foo
"value1"
127.0.0.1:6379> get bar
"value2"
```    

### 1.4.2 工作原理

在默认情况下，redis-cli 会连接到 127.0.0.1:6379 上运行的 Redis 实例。我们也可以使用 -h
选项指定要连接到的主机名/IP 地址。     

如果 Redis 服务器没有运行在默认的 6379 端口上的话，可以使用 redis-cli -p 选项指定端口号。    

另外，如果 Redis 实例启动了连接密码，那么可以使用 -a 选项在连接到 Redis 时指定密码。    

此外，如果 Redis 实例启用了 Unix 套接字文件，那么只需使用 -s 选项来指定 Unix 套接字文件即可
直接连接到 Redis 服务器。    

## 1.5 获取服务器信息

### 1.5.1 操作步骤

1. 连接到一个 Redis 实例，然后执行 INFO 命令：   

```bash
$ bin/redis-cli
127.0.0.1:6379> INFO
```    

2. 我们可以通过增加一个可选的 section 参数来指定要获取哪一部分信息，例如 `INFO memory`

### 1.5.2 工作原理

INFO 命令会输出当前所连接到的 Redis 实例的所有指标，每个指标的格式形如 metric-name:metric-value:   

- Server: 关于 Redis 服务器的基本信息
- Clients: 客户端连接的状态和指标
- Memory: 大致的内存消耗指标
- Persistence: 数据持久化相关的状态和指标
- Stats: 总体统计数据
- Replication: 主从复制相关的状态和指标
- CPU: CPU 使用状态
- Cluster: Redis Cluster 的状态
- Keyspace: 数据库相关的统计数据

## 1.6 理解 Redis 事件模型

Redis 极⼤程度地获益于其单线程、⾮阻塞、多路复⽤的I/O模型。当然，在某些情况下，Redis也会创建
线程或⼦进程来执⾏某些任务。    

Redis 包含了一个简单但功能强大的异步事件库，称为 ae。该库中封装了不同操作系统的 polling 机制
（即非阻塞 IO 相关的机制），如 epoll, kqueue 和 select 等。   

简单起见，我们只以 Linux 中的 epoll 为例。首先，我们调用 epoll_create 通知操作系统内核我们
要使用 epoll。然后，调用 epoll_ctl 把文件描述符和所关注的事件类型传给内核。之后，调用 epoll_wait
等待通过 epoll_ctl 所设置的文件描述符上发生所关注的事件。当文件描述符被更新时，内核会向应用
程序发送通知。我们唯一需要做的就是为我们所关注的这些事件创建事件处理函数。   

## 1.7 理解 Redis 通信协议

Redis 基本上就是一个接受并处理来自客户端请求的非阻塞、IO 复用的 TCP 服务器。换句话说，虽然 Redis
服务器很复杂，但我们可以使用各种编程语言通过 TCP 协议与 Redis 进行通信。Redis 使用了 REdis
Serialization Portocol(RESP) 协议通信。    

### 1.7.1 操作步骤

按照以下的步骤来学习 Redis 通信协议：   

1. 使用 netcat 向 Redis 服务器发送 PING 命令   

```bash
$ echo -e "*1\r\n\$4\r\nPING\r\n" | nc 127.0.0.1 6379
+PONG
```    

2. 使用 SET 和 INCR 命令放置一个整型并将其加1：    

```bash
$ echo -e "*3\r\n\$3\r\nset\r\n\$5\r\nmykey\r\n\$1\r\n1\r\n" | nc 127.0.0.1 6379
+OK
$ echo -e "*2\r\n\$4\r\nINCR\r\n\$5\r\nmykey\r\n" | nc 127.0.0.1 6379
:2
```    

多个命令可以组合在一起并在一次网络传输中发送给 Redis 服务器：   

```bash
$ echo -e "*3\r\n\$3\r\nset\r\n\$3\r\nfoo\r\n\$3\r\nbar\r\n*2\r\n\$3\r\nhet\r\n\$3
\r\nfoo\r\n" | nc 1270.0.01 6379
+ OK
$3
```    

### 1.7.2 工作原理

RESP 只包括五种类型，以 `*1\r\n\$4\r\nPING\r\n` 为例，该命令开头的星号表示这是一个数据类型：   

- 1 代表这个数组的大小
- \r\n（CRLF）是 RESP 中每个部分的终结符
- $4 之前的反斜杠是 $ 符号的转义字符
- $4 表示接下来是四个字符组成的字符串
- PINT 为字符串本身
- +PONG 是 PING 命令的响应字符串。加号表示响应是一个简单字符串类型    

INCR 命令返回的结果是 :2，其中数字前的冒号就代表结果是一个整型。    

有时，如果服务器收到了不存在的命令，⽐如上⾯演⽰的 got 命令，服务器可能会返回⼀个以减号开头的
错误类型的消息。    

