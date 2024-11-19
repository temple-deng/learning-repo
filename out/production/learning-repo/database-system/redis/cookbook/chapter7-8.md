# 第 7 章 配置高可用和集群

<!-- TOC -->

- [第 7 章 配置高可用和集群](#第-7-章-配置高可用和集群)
  - [7.1 本章概要](#71-本章概要)
  - [7.2 配置 Sentinel](#72-配置-sentinel)
  - [7.3 测试 Sentinel](#73-测试-sentinel)
  - [7.5 配置 Redis Cluster](#75-配置-redis-cluster)
- [第 8 章 生产环境部署](#第-8-章-生产环境部署)
  - [8.2 在 Linux 上部署 Redis](#82-在-linux-上部署-redis)

<!-- /TOC -->

## 7.1 本章概要

2.6 版本以后 Redis 原⽣⽀持的 Sentinel 是使⽤最⼴泛的⾼可⽤架构。利⽤ Sentinel，我们可以轻
松地构建具备容错能⼒的 Redis 服务。     

## 7.2 配置 Sentinel

顾名思义，Sentinel（哨兵）充当了 Redis 主实例和从实例的守卫者。因为单个哨兵本身也可以失效，所以
一个哨兵显然不足以保证高可用。对主实例进行故障迁移的决策时基于仲裁系统的，所以至少需要三个哨兵进程
才能构成一个健壮的分布式系统来持续地监控 Redis 主实例的状态。如果有多个哨兵进程检测到主实例下线，
其中的一个哨兵进程会被选举出来负责推选一个从实例替代原有的主实例。如果配置恰当，上述的整个过程将
是自动化的，无需人工干预。     

我们将配置一主二从以及三个Sentinel 实例：   

- Master: 192.168.0.31:6379
- Slave-1: 192.168.0.32:6379
- Slave-2: 192.168.0.33:6379
- Sentinel-1: 192.168.0.31:26379
- Sentinel-2: 192.168.0.32:26379
- Sentinel-3: 192.168.0.33:26379

默认 Redis 配置文件中绑定的 IP 地址是 127.0.0.1，只允许从本地访问。我们可以将要绑定的 IP 地址
追加到后面：   

```
bind 127.0.0.1 192.168.0.31
```    

在每台主机上准备一个配置文件 sentinel.conf：    

```
port 26379
dir /tmp
sentinel monitor mymaster 192.168.0.31 6379 2
sentinel down-after-milliseconds mymaster 30000
sentinel parallel-syncs mymaster 1
sentinel failover-timeout mymaster 180000
```    

在三台主机上启动 Sentinel 进程。    

```cmd
user@192.168.0.31: ~$bin/redis-server conf/sentinel.conf --sentinel
user@192.168.0.32: ~$bin/redis-server conf/sentinel.conf --sentinel
user@192.168.0.33: ~$bin/redis-server conf/sentinel.conf --sentinel
```   

查看 Sentinel-1 的日志：    

```
21758: X 29 Oct 22:31:51.001 # Sentinel ID is 3
  ef95........
21758: X 29 Oct 22:31:51.001 # +monitor master mymaster 192.168.0.31 6379 quorum 2
21758: X 29 Oct 22:31:51.001 * +slave slave 192.168.0.32:6379 192.168.0.32:6379
      @ mymaster 192.168.0.31:6379
21758: X 29 Oct 22:31:51.003 * +slave slave 192.168.0.33:6379 192.168.0.33:6379
      @ mymaster 192.168.0.31:6379
21758: X 29 Oct 22:31:51.021 * +sentinel sentinel
      d2397......  192.168.0.32:26379 @ mymaster 192.168.0.31:6379
21758: X 29 Oct 22:31:51.241 * +sentinel sentinel
      a276b......  192.168.0.33:26379 @ mymaster 192.168.0.31:6379
```     

如果要将一个新的主实例添加到 Sentinel 中进行监控，那么我们可以按如下格式在配置文件中增加一行：   

```
sentinel monitor <master-name><ip><port><quorum>
```    

quorum 指在采取故障迁移操作前，发现并同意主实例不可达的最少哨兵数（那这个包括自己吗？）。
down-after-milliseconds 选项指在标记实例下线前不可达的最长毫秒数。Sentinel 每秒钟都向实例
发送 PING 命令来检查其是否可达。    

在本例中，如果某个实例超过 30 秒仍未响应 ping 命令，那么它将被视作下线。当主实例发生故障迁移时，
其中的一个从实例将被选为新的主实例，而其他的从实例则需要从新的主实例那里进行主从复制。parallel-syncs
参数表示有几个从实例可以同时从新的主实例那里进行数据同步。    

为了探测其他哨兵及与其他哨兵进行通信，每个 Sentinel 进程每两秒钟会向一个名为 \_\_sentinel\_\_:hello
的频道发布一条消息，报告其自身及所监控主实例的状态。   

## 7.3 测试 Sentinel

**手动触发主实例故障迁移**     

在该实验中，我们⼿动地强制哨兵进⾏了主实例的故障迁移并重新选出了⼀个从实例。这是通过在Sentinel-2
上执⾏ `sentinel failover <master-name>` 命令完成的。我们可以看到，192.168.0.33被选举
为新的主实例，⽽原来的主实例变成了从实例。    

1. 由于故障迁移是手动触发的，所以在执行故障迁移操作之前，Sentinel 不需要寻求其他哨兵的同意。
Sentinel-2 无需任何共识就直接被选举为 leader。
2. 接下来，Sentinel 挑选了一个从实例将其提成主实例，也就是本实验中的 192.168.0.33
3. Sentinel 向 192.168.0.33 发送 slaveof no one 命令使之变成主实例。
4. Sentinel 重新配置老的主实例 192.168.0.31 和另一个从实例 192.168.0.32，让他们从新的主实例
那里进行主从复制
5. 在最后一步中，Sentinel 更新新主实例的信息，并通过频道 \_\_sentinel\_\_:hello 向其他哨兵
广播这些信息，从而让所有客户端获得新主实例的信息。    

配置⽂件 redis.conf 和 sentinel.conf 也相应地进⾏了更新，以匹配新主实例的⾓⾊。     

**模拟主实例下线**     

在该实验中，我们通过⼿动关闭的⽅式模拟了主实例 192.168.0.33 的下线。哨兵将 192.168.0.31
提升为新的主实例并完成了故障迁移。    

1. Sentinel-1 与 17:05:02.446 发现主实例不可达。不过这仅仅是单个哨兵的主观看法，即主观下线，
+sdown 事件。
2. 为了防止虚假警报，标记主实例 +sdown 的哨兵会向其他哨兵发送请求，要求他们检查主实例的状态。
只有当多以 quorum 个哨兵认为主实例下线时，才会发生故障迁移，这被称为客观下线，+odown。
3. 接下来，Sentinel-1 尝试执行故障迁移，但没有被选为 leader
4. 几乎在同一时间，Sentinel-2 也将主实例标记为 +sdwon 和 +odown，且被选为执行故障迁移的 leader。
故障转移的后续过程与手动触发主实例故障迁移中的步骤相同。    

## 7.5 配置 Redis Cluster

@TODO:    

1. 每个 Redis 实例都有自己的配置文件。启用集群功能需要给每个 Redis 实例准备一个配置文件，然后
相应地更改 IP，监听端口和 log 文件路径。    

```cmd
redis@192.168.1.57: ~> cat conf/redis-6379.conf
daemonize yes
pidfile "/redis/run/redis-6379.pid"
port 6379
bind 192.168.1.57
logfile "/redis/log/redis-6379.log"
dbfilename "dump-6379.rdb"
dir "/redis/data"
...
cluster-enabled yes
cluster-config-file nodes-6379.conf
cluster-node-timeout 10000
```    

当 Redis 集群运行时，每个节点会打开两个 TCP 套接字。第一个套接字是用于客户端连接的标准 Redis
通信协议；第二个套接字的端口号是第一个端口号加上 10000，被用作实例间信息交换的通信总线。    

Redis 实例启动后，将会在 data 目录下生成节点的配置文件：   

```cmd
redis@192.168.1.57:~> cat data/nodes-6379.conf
58285....... :0@0 myselfe,master - 0 0 0 connected
vars currentEpoch 0 lastVoteEpoch 0
```    

使⽤ redis-cli 执⾏ CLUSTER MEET 命令让每个Redis实例发现彼此。我们可以只在⼀台主机上进⾏此操作:    

```cmd
redis@192.168.1.58:~> bin/redis-cli -h 192.168.1.57 -p 6379 CLUSTER MEET 192.168.1.57 6379
OK
redis@192.168.1.58:~> bin/redis-cli -h 192.168.1.57 -p 6379 CLUSTER MEET 192.168.1.59 6380
OK
redis@192.168.1.58:~> bin/redis-cli -h 192.168.1.57 -p 6379 CLUSTER MEET 192.168.1.58 6381
OK
```    

接下来，进行数据槽（slot）的分配：    

```cmd
redis@192.168.1.57:~> for i in {0..5400}; do redis-cli -h 192.168.1.57 -p 6379
  CLUSTER ADDSLOTS $i; done
OK
...
OK
redis@192.168.1.57:~> for i in {5401..11000}; do redis-cli -h 192.168.1.59 -p 6380
  CLUSTER ADDSLOTS $i; done
OK
...
OK
redis@192.168.1.57:~> for i in {11001..16383}; do redis-cli -h 192.168.1.58 -p 6381
  CLUSTER ADDSLOTS $i; done
OK
..
OK
```    

要实现数据复制，需要将一个节点设置成另一个主节点的从节点。因为我们希望在这个集群中有三个主节点，
所以选择三个节点作为从节点。    

```cmd
redis@192.168.1.57:~> bin/redis-cli -h 192.168.1.59 -p 6379 CLUSTER REPLICATE
  58285....
OK
redis@192.168.1.57:~> bin/redis-cli -h 192.168.1.58 -p 6380 CLUSTER REPLICATE
  2ff47....
OK
redis@192.168.1.57:~> bin/redis-cli -h 192.168.1.57 -p 6381 CLUSTER REPLICATE
  eeeab....
OK
```     

在前⾯的⽰例中，我们⼀步⼀步地引导读者学习了配置 Redis 集群的过程。第⼀步是为每个Redis实例准备
配置⽂件：    

```
cluster-enabled yes
cluster-config-file nodes-6381.conf
cluster-node-timeout 10000
```    

在分别为每个实例指定了不同的监听端口和数据目录之后，我们通过将 cluster-enabled 选项设置为 yes
来启用集群功能。此外，对于每个 Redis 实例，在 Redis 集群的配置期间都会生成一个集群节点配置文件，
并且每当某些集群信息应该被持久化的时候就会被修改。cluster-config-file 选项用于设置此配置文件的
名字。     

简单地说，节点超时的含义是：如果经过了指定的超时时间节点无响应，Redis 集群将会触发故障迁移将一个
从实例提升为主实例。      

为了检查某个节点是否正运行在集群模式下，我们可以使用 redis-cli 执行 CLUSTER INFO 命令。    

在配置并启动了所有的集群节点后，我们接着开始创建⼀个 Redis 集群。Redis 集群中的节点使⽤ Redis
集群协议以⽹状⽹络拓扑的形式相互通信。因此，我们做的第⼀步是让每个节点发现彼此，以让它们能在⼀
个集群中正确地⼯作。为了达到这个⽬的，我们使⽤了 CLUSTER MEET 命令。   

尽管 Redis 集群中的所有节点都需要知道对方的存在，但我们并不需要将 CLUSTER MEET 命令发送给每个
节点。这是因为，一个在发现另一个节点时会向其传播它已知的所有节点的信息。为了避免混淆，我们可以让
⼀个节点发现所有其他的节点。这样，集群中的所有节点就可以相互通信了。     

在 Redis 集群中，数据按照以下的算法分布到 16384 个哈希槽中：   

HASH_SLOT = CRC16(key) mod 16384    

每个主实例都分配了哈希槽的一段范围以存储整个数据集的一部分。因此，我们做的第二步是使用 CLUSTER
ADDSLOTS 命令在主实例之间分配槽。在完成槽的分配后，我们通过 CLUSTER NODES 命令检查集群的状态。
该命令的输出如下所示：    


```cmd
eeeabcab810.....  192.168.1.58:6381@16381 master - 0 1510536168000 0
  connected 11001-16383
```    

每行的格式为：    

```cmd
[Node-ID] [Instance-IP:Client-Port@Cluster-Bus-Port] [Master\Slave\Myself]
  [-\master's Node-ID if it's a slave] [Ping-Sent timestamp] [Pong-Recv timestamp]
  [Config-epoch] [Connection status] [Slots allocated]
```     

为了提供数据的冗余，我们通过向欲设为从实例的节点发送 CLUSTER REPLICATE node-id 命令来为每个
主实例分别分配一个从实例。    

# 第 8 章 生产环境部署

## 8.2 在 Linux 上部署 Redis

设置下列与内存相关的内核参数：    

```cmd
~$ sudo sysctl -w vm.overcommit_memory=1
~$ sudo sysctl -w vm.swappiness=0
```    

使用如下的命令来持久化地保存这些参数：   

```cmd
$ echo vm.overcommit_memory=1 >> /etc/sysctl.conf
$ echo "vm.swappiness=0" >> /etc/sysctl.conf
```    

此外，禁用透明大页（transparenthuge page）功能：   

```cmd
~$ sudo su -
~# echo never > /sys/kernel/mm/transparent_hugepage/enabled
~$ echo never > /sys/kernel/mm/transparent_hugepage/defrag
```    

使用如下的命令来持久化地保存这些设置：   

```cmd
~# cat >> /etc/rc.local << EOF
echo never > /sys/kernel/mm/transparent_hugepage/enabled
echo never > /sys/kernel/mm/transparent_hugepage/defrag
EOF
```    

对于网络的优化，我们设置下列与网络相关的内核参数：    

```cmd
~$ sudo sysctl -w net.core.somaxconn=65535
~$ sudo sysctl -w net.ipv4.tcp_max_syn_backlog=65535
```     

使用如下的命令来持久化地保存这些参数：    

```cmd
$ echo "net.core.somaxconn=65535" >> /etc/sysctl.conf
$ echo "net.ipv4.tcp_max_syn_backlog=65535" >> /etc/sysctl.conf
```      

要将进程能够打开的文件数设为更高的值，我们需要先切换到启动 Redis 进程的用户，然后执行 ulimit:   

```cmd
~$ su - redis
~$ ulimit -n 2880000
```     

我们必须将 nofile 设为一个小于 /proc/sys/fs/file-max 的值。因此，在设置之前，我们需要使用
cat 命令检查 /proc/sys/fs/file-max 的值。    

要持久化地保存这个参数，可以将如下两行添加到 /etc/security/limits.conf:    

```cmd
redis soft nofile 288000
redis hard nofile 288000
```     

我们调整的第一个设置是 overcommit_memory。Redis 在后台持久化时利用了写时复制的优点。这意味
着在 Redis 中不需要使用与数据集大小相同的空闲内存。但是，Linux 在默认情况下可能会检查是否有足够
的空闲内存来复制父进程的所有内存页；而这可能会导致进程由于 OOM(OutofMemory) 而崩溃。    

要解决这个问题，我们需要将 overcommit_memory 设为 1，表示当一个程序调用诸如 `malloc()` 等
函数分配内存时，即使系统知道没有足够的内存空间函数也会执行成功。    

第二个内存相关的配置是 vm.swappiness，该参数定义了 Linux 内核将内存中的内容拷贝到交换分区的
大小（及频率）。    

对于网络而言，我们将 net.core.somaxconn 和 net.ipv4.tcp_max_syn_backlog 设为了比默认值
128 大很多的 65535。前一个内核参数设置了传递给 listen 函数的 backlog 参数的上限，后一个参数
设置了挂起连接的最大队列长队。    

这本书先到此为止。   