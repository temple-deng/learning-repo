# Redis 4.X Cookbook（版本 5.0.3）


- [第 1 章 开始使用 Redis](./chapter1.md#第-1-章-开始使用-redis)
  - [1.2 下载和安装](./chapter1.md#12-下载和安装)
    - [1.2.1 操作步骤](./chapter1.md#121-操作步骤)
    - [1.2.2 工作原理](./chapter1.md#122-工作原理)
  - [1.3 启动和停止 Redis](./chapter1.md#13-启动和停止-redis)
    - [1.3.1 操作步骤](./chapter1.md#131-操作步骤)
    - [1.3.2 工作原理](./chapter1.md#132-工作原理)
    - [1.3.3 更多细节](./chapter1.md#133-更多细节)
  - [1.4 使用 redis-cli 连接到 Redis](./chapter1.md#14-使用-redis-cli-连接到-redis)
    - [1.4.1 操作步骤](./chapter1.md#141-操作步骤)
    - [1.4.2 工作原理](./chapter1.md#142-工作原理)
  - [1.5 获取服务器信息](./chapter1.md#15-获取服务器信息)
    - [1.5.1 操作步骤](./chapter1.md#151-操作步骤)
    - [1.5.2 工作原理](./chapter1.md#152-工作原理)
  - [1.6 理解 Redis 事件模型](./chapter1.md#16-理解-redis-事件模型)
  - [1.7 理解 Redis 通信协议](./chapter1.md#17-理解-redis-通信协议)
    - [1.7.1 操作步骤](./chapter1.md#171-操作步骤)
    - [1.7.2 工作原理](./chapter1.md#172-工作原理)
- [第 2 章 数据类型](./chapter2.md#第-2-章-数据类型)
  - [2.1 本章概要](./chapter2.md#21-本章概要)
  - [2.2 使用字符串（string）类型](./chapter2.md#22-使用字符串string类型)
  - [2.3 使用列表（list）类型](./chapter2.md#23-使用列表list类型)
  - [2.4 使用哈希（hash）类型](./chapter2.md#24-使用哈希hash类型)
  - [2.5 使用集合（set）类型](./chapter2.md#25-使用集合set类型)
  - [2.6 使用有序集合（sorted set）类型](./chapter2.md#26-使用有序集合sorted-set类型)
  - [2.7 使用 HyperLogLog 类型](./chapter2.md#27-使用-hyperloglog-类型)
  - [2.8 使用 Geo 类型](./chapter2.md#28-使用-geo-类型)
  - [2.9 键管理](./chapter2.md#29-键管理)
- [第 3 章 数据特性](./chapter3.md#第-3-章-数据特性)
  - [3.2 使用位图（bitmap）](./chapter3.md#32-使用位图bitmap)
  - [3.3 设置键的过期时间](./chapter3.md#33-设置键的过期时间)
  - [3.4 使用 SORT 命令](./chapter3.md#34-使用-sort-命令)
  - [3.5 使用管道（pipeline）](./chapter3.md#35-使用管道pipeline)
  - [3.6 理解 Redis 事务（transaction）](./chapter3.md#36-理解-redis-事务transaction)
  - [3.7 使用发布订阅（PubSub）](./chapter3.md#37-使用发布订阅pubsub)
  - [3.8 使用 Lua 脚本](./chapter3.md#38-使用-lua-脚本)
- [第 4 章 使用 Redis 进行开发](./chapter4-5-6.md#第-4-章-使用-redis-进行开发)
  - [4.2 Redis 常见应用场景](./chapter4-5-6.md#42-redis-常见应用场景)
- [第 5 章 复制](./chapter4-5-6.md#第-5-章-复制)
  - [5.1 本章概要](./chapter4-5-6.md#51-本章概要)
  - [5.2 配置 Redis 的复制机制](./chapter4-5-6.md#52-配置-redis-的复制机制)
  - [5.3 复制机制的调优](./chapter4-5-6.md#53-复制机制的调优)
- [第 6 章 持久化](./chapter4-5-6.md#第-6-章-持久化)
  - [6.2 使用 RDB](./chapter4-5-6.md#62-使用-rdb)
  - [6.4 使用 AOF](./chapter4-5-6.md#64-使用-aof)
- [第 7 章 配置高可用和集群](./chapter7-8.md#第-7-章-配置高可用和集群)
  - [7.1 本章概要](./chapter7-8.md#71-本章概要)
  - [7.2 配置 Sentinel](./chapter7-8.md#72-配置-sentinel)
  - [7.3 测试 Sentinel](./chapter7-8.md#73-测试-sentinel)
  - [7.5 配置 Redis Cluster](./chapter7-8.md#75-配置-redis-cluster)
- [第 8 章 生产环境部署](./chapter7-8.md#第-8-章-生产环境部署)
  - [8.2 在 Linux 上部署 Redis](./chapter7-8.md#82-在-linux-上部署-redis)