# 第四部分 开源项目

<!-- TOC -->

- [第四部分 开源项目](#第四部分-开源项目)
- [第 22 章 Etcd-高可用的键值数据库](#第-22-章-etcd-高可用的键值数据库)
  - [22.1 Etch 简介](#221-etch-简介)
  - [22.2 安装和使用 Etcd](#222-安装和使用-etcd)
    - [22.2.1 二进制文件方式](#2221-二进制文件方式)
    - [22.2.2 Docker 镜像方式下载](#2222-docker-镜像方式下载)
    - [22.2.3 数据目录](#2223-数据目录)
    - [22.2.4 服务启动参数](#2224-服务启动参数)
  - [22.3 使用客户端命令](#223-使用客户端命令)

<!-- /TOC -->

# 第 22 章 Etcd-高可用的键值数据库

Etcd 是 CoreOS 团队发起的一个开源分布式键值仓库项目，可以用于分布式系统中的配置信息管理和服务
发现。基于 Go 语言实现。    

## 22.1 Etch 简介

Etch 专门为集群环境设计，采用了更为简洁的 Raft 共识算法，同样可以实现数据强一致性，并支持集群
节点状态管理和服务自动发现等。    

Etcd 在进行设计的时候重点考虑了下面四个要素：   

- 简单：支持 RESTful API 和 gRPC API
- 安全：基于 TLS 方式实现安全连接访问
- 快速：支持每秒一万次的并发写操作，超时控制在毫秒量级
- 可靠：支持分布式结构，基于 Raft 算法实现一致性

通常情况下，用户使用 Etcd 可以在多个节点上启动多个实例，并将它们添加为一个集群。同一个集群中的
Etcd 实例将会自动保持彼此信息的一致性，这意味着分布在各个节点上的应用也将获取到一致的信息。   

## 22.2 安装和使用 Etcd

### 22.2.1 二进制文件方式

```bash
$ curl -L https://github.com/coreos/etcd/releases/download/v3.3.1/etcd-v3.3.1-linux-amd64.tar.gz | tar xzvf
```   

解压后，可以看到文件包括若干二进制文件和文档文件：    

```bash
$ cd etcd-v3.3.1-linux-amd64
$ ls
Documentation etcd etcdctl README-etcdctl.md README.md READMEv2-etcdctl.md
```    

其中 etcd 是服务主文件，etcdctl 是提供给用户的命令客户端，其他都是文档文件。    

通过下面的命令将所需要的二进制文件都放到系统可执行路径 /usr/local/bin/ 下： 

```bash
$ sudo cp ctcd* /usr/local/bin/
```   

下面将先以单节点模式为例讲解 Etcd 支持的功能和操作。    

直接执行 etcd 命令，将启动一个服务节点，监听在本地的 2379（客户端请求端口）和 2380（其他节点
连接端口）。     

此时，可以通过 REST API 直接查看集群健康状态：   

```bash
$ curl -L http://127.0.0.1:2379/health
{"health": "true"}
```    

当然，也可以使用自带的 etcdctl 命令进行查看（实际上是封装了 REST API 调用）：    

```bash
$ etcdctl cluster-health
member ce2a822cea30bfca is healthy: got healthy result from http://localhost:2379
cluster is healthy
```    

通过 etcdctl 设置和获取键值也十分方便，例如设置键值对 testkey: "hello world":    

```bash
$ etcdctl set testkey "hello world"
hello world
$ etcdctl get testkey
hello world
```    

当然，除了 etcdctl 命令外，也可以直接通过 HTTP 访问本地 2379 端口的方式来进行操作，例如查看
testkey 的值：   

```bash
$ curl -L -X PUT http://localhost:2379/v2/keys/testkey -d value="hello world"
{"action": "set", "node": {"key": "/testkey", "value": "hello world", "modifiedIndex": 5,
"createdIndex": 5}, "prevNode": {"key": "/testkey", "value": "hello world",
"modifiedIndex", 4, "createdIndex": 4}}
$ curl -L http://localhost:2379/v2/keys/testkey
{"action": "get", "node": {"key": "/testkey", "value": "hello world", "modifiedIndex": 5,
"createdIndex": 5}}
```    

注意目前 API 版本为 v2，将来出了新版本后，API 路径中则对应为新版本号。    

### 22.2.2 Docker 镜像方式下载

以 Etcd 3.3.1 为例，镜像名称为 quay.io/coreos/etcd:v3.3.1，可以通过下面的命令启动 etcd
服务监听到本地的 2379 和 2380 端口：   

```bash
$ docker run \
  -p 2379:2379 \
  -p 2380:2380 \
  -v /etc/ssl/certs/:/etc/ssl/certs/
  quay.io/coreos/etcd:v3.3.1
```   

### 22.2.3 数据目录

作为数据库，最重要的自然是数据存放位置。Etcd 默认创建的本地数据目录为 `${name}.etcd`，其中
`${name}` 为节点别名。默认情况下本地数据路径为 default.etcd。    

用户也可以通过 --data-dir 选项来指定本地数据存放的位置，下面命令指定 Etcd 节点别名为 test，
数据存放目录为 test.etcd:    

```bash
$ etcd --name "test" --data-dir test.etcd
```    

话说并没有说这些数据在哪个目录啊。    

查看数据目录下内容：   

```bash
$ tree test.etcd
test.etcd
 |----member
    |---- snap
      |------- db
    |------wal
       |----0000000000000000-0000000000000000.wal
       |-----0.tmp
```    

其中，snap 目录下将定期记录节点的状态快照信息，wal 目录下则记录数据库的操作日志信息。    

### 22.2.4 服务启动参数

Etcd 服务启动的时候支持一些参数，用户可以通过这些参数来调整服务和集群的行为。     

另外，参数可以通过环境变量形式传入，命名全部为大写并且加 ETCD_ 前缀。主要参数包括：通用参数、节点
参数、集群参数、代理参数、安全参数。    

1. 通用参数    

这些参数主要跟节点自身配置相关：    

- `-config-file`: 服务配置文件路径
- `-name 'default'`: 设置成员节点的别名，建议为每个成员配置可识别的命名
- `-data-dir '${name}.etcd'`: 数据存储的目录
- `-wal-dir ''`: 指定 wal 目录，存有数据库操作日志
- `-snapshot-count '10000'`: 提交多少次事务就出发一次快照
- `-max-snapshot 5`: 最多保留多少个 snapshot，0 表示无限制
- `-max-wals 5`: 最多保留多少个 wal 文件，0 表示无限制

2. 节点参数    

这些参数跟节点行为有关    

- `-heartbeat-interval '100'`: 心跳时间间隔，单位为毫秒
- `-election-timeout '1000'`: 选举时间间隔，单位毫秒
- `-listen-peer-urls 'http://localhost:2380'`: Peer 消息的监听服务地址列表
- `-listen-client-urls 'http://localhost:2379'`: 客户端请求的监听地址列表
- `-cors ''`: 跨域资源访问的控制白名单
- `-quota-backend-bytes '0'`: 后端存储报警的阈值
- `-max-txn-ops '128'`: 一次事务中允许的最多操作个数，默认值为 128
- `-max-request-bytes '1572864'`: 允许接收的客户端请求的最大字节数
- `-grpc-keepalive-min-time '5s'`: 客户端向服务端检测存活的最小等待时间，默认值为 5 秒
- `-grpc-keepalive-interval '2h'`: 服务端检测客户端存活的等待时间，默认值为 2 小时，0表示禁用
- `-grpc-keepalive-timeout '20s'`: 关闭一条不响应的 gRPC 连接的额外等待时间，默认值为 20
秒，0表示禁用

3. 集群参数    

这些参数跟集群行为有关：    

- `-initial-advertise-peer-urls 'http://localhost:2380'`: 广播到集群中本成员的 peer
监听通信地址
- `-initial-cluster 'default=http://localhost:2380'`: 初始的集群启动配置
- `-initial-cluster-state 'new'`: 初始化集群状态，默认为新建，也可以指定为 existing表示
要加入一个已有集群中
- `-initial-cluster-token 'etcd-cluster'`: 启动集群的时候指定集群口令，只有相同 token 的
节点才能加入到同一集群
- `-advertise-client-urls 'http://localhost:2379'`: 广播到集群中本成员的监听客户端请求的
地址
- `-discovery ''`: 通过自动探测方式发现集群成员的地址，指定用于探测的地址
- `-discovery-proxy ''`: 使用代理用于探测服务
- `-discovery-srv ''`: 用于启动集群的 DNS 服务域
- `-strict-reconfig-check 'true'`: 默认启用严格检查，当某个重新配置请求可能导致多数失败时，
则拒绝掉
- `-auto-compaction-mode 'periodic'`: 自动进行压缩的模式，如 periodic（定期）或 revision
（版本号）
- `-auto-compaction-retention '0'`: 自动进行（键值历史）压缩的保留长度，单位为小时，0表示
不启用
- `-enable-v2 'true'`: 是否接受 V2 版本的客户端接入
- `-debug 'false'`: 是否开启调试信息
- `-log-package-levels ''`: 记录日志的级别，如 DEBUG 或 INFO
- `-log-output 'default'`: 日志输出的目标
- `-force-new-cluster 'false'`: 强制创建一个新的单节点集群    

4. 代理参数    

这些参数主要是当 Etcd 服务自身仅作为代理模式时使用，即转发来自客户端的请求到指定的 Etcd 集群。
此时，Etcd 服务本身并不参与集群中去，不保存数据和参加选举。    

- `-proxy 'off'`: 是否开启代理模式，可以为 on（开启）、off（关闭）、readonly（只读）
- `-proxy-failure-wait 5000`: 失败状态的等待时间，单位为毫秒
- `-proxy-refresh-interval 30000`: 节点刷新的时间间隔，单位为毫秒
- `-proxy-dial-timeout 1000`: 发起连接的超时时间，单位为毫秒
- `-proxy-read-timeout 0`: 读请求的超时时间，单位为毫秒
- `-proxy-writer-timeout 5000`: 写请求的超时时间，单位为毫秒

5. 安全参数    

这些参数主要用于指定通信时候的 TLS 证书、密钥配置：    

- `-cert-file ''`: 通信时候使用的 TLS 证书文件路径
- `-key-file ''`: 客户端通信时 TLS 密钥文件路径
- `-client-cert-auth 'false'`: 是否是客户端启用证书认证
- `-client-crl-file ''`: 客户端的证书撤销列表文件路径
- `-trusted-ca-file ''`: 客户端通信时信任的 CA 文件
- `-auto-tls 'false'`: 客户端使用自动生成的 TLS 证书
- `-peer-cert-file ''`: 对等成员节点的 TLS 证书文件
- `-peer-key-file ''`: 对等成员节点的 TLS 密钥文件
- `-peer-client-cert-auth 'false'`: 是否启用对等成员节点客户端认证
- `-peer-trusted-ca-file ''`: 对等成员节点的信任 CA 文件路径
- `-peer-auto-tls 'false'`: 是否使用自动生成的 TLS 证书，当 -peer-key-file 和 -peer-cert-file
未指定时
- `-peer-crl-file ''`: 对等成员之间证书撤销列表文件路径
- `-auth-token 'simple'`: 指定认证口令类型和选项，如 simple 或 jwt

## 22.3 使用客户端命令

etcdctl 是 Etcd 官方提供的命令行客户端，它支持一些基于 HTTP API 封装好的命令，供用户直接跟
Etcd 服务打交道，而无须基于 API 的方式。    

etcdctl 的命令格式为：   

```
$ etcdctl [ 全局选项 ] 命令 [ 命令选项 ] [ 命令参数 ]
```    

选项参数略。   

我想知道这个东西和 Docker 有什么关系啊，神经病啊放到这里讲。   
