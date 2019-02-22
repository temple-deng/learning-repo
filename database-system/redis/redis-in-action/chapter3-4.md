# 第二部分 核心概念

<!-- TOC -->

- [第二部分 核心概念](#第二部分-核心概念)
- [第 3 章 Redis 命令](#第-3-章-redis-命令)
  - [3.1 字符串](#31-字符串)
  - [3.2 列表](#32-列表)
  - [3.3 集合](#33-集合)
  - [3.4 散列](#34-散列)
  - [3.5 有序集合](#35-有序集合)
  - [3.6 发布与订阅](#36-发布与订阅)
  - [3.7 其他命令](#37-其他命令)
    - [3.7.1 排序](#371-排序)
    - [3.7.2 基本的 Redis 事务](#372-基本的-redis-事务)
    - [3.7.3 键的过期时间](#373-键的过期时间)
- [第 4 章 数据安全和性能保障](#第-4-章-数据安全和性能保障)
  - [4.1 持久化选项](#41-持久化选项)
    - [4.1.1 快照持久化](#411-快照持久化)
    - [4.1.2 AOF 持久化](#412-aof-持久化)
    - [4.1.3 重写/压缩 AOF 文件](#413-重写压缩-aof-文件)
  - [4.2 复制](#42-复制)
    - [4.2.1 对 Redis 的复制相关选项进行配置](#421-对-redis-的复制相关选项进行配置)
    - [4.2.2 Redis 复制的启动过程](#422-redis-复制的启动过程)
    - [4.2.3 主从链](#423-主从链)
    - [4.2.4 检验硬盘写入](#424-检验硬盘写入)
  - [4.3 处理系统故障](#43-处理系统故障)
    - [4.3.1 验证快照文件和 AOF 文件](#431-验证快照文件和-aof-文件)
    - [4.3.2 更换故障主服务器](#432-更换故障主服务器)
  - [4.4 Redis 事务](#44-redis-事务)
    - [4.4.2 将商品放到市场上销售](#442-将商品放到市场上销售)
  - [4.5 非事务型流水线](#45-非事务型流水线)

<!-- /TOC -->

# 第 3 章 Redis 命令

## 3.1 字符串

在 Redis 里面，字符串可以存储以下 3 种类型的值：   

- 字符串
- 整数
- 浮点数    

⽤户可以通过给定⼀个任意的数值，对存储着整数或者浮点数的字符串执⾏⾃增（increment）或者⾃减
（decrement）操作，在有需要的时候，Redis还会将整数转换成浮点数。     

自增自减命令：   

- INCR: `INCR key-name` 将键存储的值加 1
- DECR: `DECR key-name`
- INCRBY: `INCRBY key-name amout` 将键存储的值加上整数 amount
- DECRBY
- INCRBYFLOAT: `INCRBYFLOAT key-name amount` 将键存储的值加上浮点数 amount    

当用户将一个值存储到 Redis 字符串里面的时候，如果这个值可以被解释为十进制整数或者浮点数，那么
Redis 会察觉到这一点，并允许用户对这个字符串执行各种 INCR* 和 DECR* 操作。如果用户对一个不存在
的键或者一个保存了空串的键执行自增或者自减操作，那么 Redis 在执行操作时会将这个键的值当作是 0
来处理。如果用户尝试对一个值无法被解释为整数或者浮点数的字符串键执行自增或者自减操作，那么 Redis
将向用户返回一个错误。   

处理子串和二进制位的命令：   

- APPEND: `APPEND key-name value` 将 value 追加到 key-name 的字符串值末尾
- GETRANGE: `GETRANGE key-name start end` 获取 start-end 范围内所有字符组成的子串，包括
start 和 end 在内
- SETRANGE: `SETRANGE key-name offset value` 从 start 开始的子串设置为给定值
- GETBIT: `GETBIT key-name offset` 将字符串看作是二进制位串，并返回位串中偏移量为 offset
的二进制位的值
- SETBIT: `SETBIT key-name offset value` 将字符串看作是二进制位串，并将位串中偏移量为
offset 的二进制位的值设置为 value
- BITCOUNT: `BITCOUNT key-name [start end]` 统计二进制位串里面 1 的个数，如果给定了可选
的 start, end，那么只对偏移量指定范围内的二进制位进行统计
- BITOP: `BITOP operation dest-key key-name [key-name ...]` 对一个或多个二进制位串
执行包括并 AND, 或 OR, 异或 XOR, 非 NOT 在内的任意一种按位运算操作，并将计算得出的结果保存在
dest-key 键里面    

在使⽤ SETRANGE 或者 SETBIT 命令对字符串进⾏写⼊的时候，如果字符串当前的长度不能满⾜写⼊的要求，
那么Redis会⾃动地使⽤空字节（null）来将字符串扩展⾄所需的长度，然后才执⾏写⼊或者更新操作。在使
⽤ GETRANGE 读取字符串的时候，超出字符串末尾的数据会被视为是空串，⽽在使⽤ GETBIT 读取⼆进制
位串的时候，超出字符串末尾的⼆进制位会被视为是 0。    

```cmd
127.0.0.1:6379> APPEND 'new-string-key' 'hello '
(integer) 6
127.0.0.1:6379> APPEND 'new-string-key' 'world!'
(integer) 12
127.0.0.1:6379> GETRANGE 'new-string-key' 3 7
"lo wo"
127.0.0.1:6379> SETRANGE 'new-string-key' 6 'W'
(integer) 12
127.0.0.1:6379> get 'new-string-key'
"hello World!"
127.0.0.1:6379> setbit 'another-key' 2 1
(integer) 0
127.0.0.1:6379> get 'another-key'
" "
127.0.0.1:6379> getbit 'another-key' 0
(integer) 0
127.0.0.1:6379> getbit 'another-key' 1
(integer) 0
127.0.0.1:6379> getbit 'another-key' 2
(integer) 1
```    

## 3.2 列表

列表是一个由多个字符串值组成的有序序列结构。    

- RPUSH: `RPUSH key-name value [value ...]` 将一个或多个值推入列表的右端
- LPUSH: `LPUSH key-name value [value ...]` 将一个或多个值推入列表的左端
- RPOP: `RPOP key-name` 移除并返回列表最右端的元素
- LPOP
- LINDEX: `LINDEX key-name offset` 返回列表中偏移量为 offset 的元素
- LRANGE: `LRANGE key-name start end` 返回 start 到 end 范围内的所有元素，包含 start,
end
- LTRIM: `LTRIM key-name start end` 对列表进行修剪，只保留从 start 到 end 范围内的元素，
包含 start, end


有⼏个列表命令可以将元素从⼀个列表移动到另⼀个列表，或者阻塞（block）执⾏命令的客户端直到有其他
客户端给列表添加元素为⽌:    

- BLPOP: `BLPOP key-name [key-name ...] timeout` 从第一个非空列表中弹出位于最左端的元素，
或者 timeout 秒之内阻塞并等待可弹出的元素出现
- BRPOP
- RPOPLPUSH: `RPOPLPUSH source-key dest-key` 从 source-key 列表中弹出位于最右端的元素，
然后将这个元素推入 dest-key 列表的最左端，并向用户返回这个元素
- BRPOPLPUSH: `BRPOPLPUSH source-key dest-key timeout` 从 source-key 列表中弹出位于
最右端的元素，然后将这个元素推入 dest-key 列表的最左端，并向用户返回这个元素；如果 source-key
为空，那么 timeout 秒之内阻塞并等待可弹出的元素出现    

## 3.3 集合

- SADD: `SADD key-name item [item ...]` 将一个或多个元素添加到集合里面，并返回被添加元素
当中原本并不存在于集合里面的元素数量
- SREM: `SREM key-name item [item ...]` 从集合里面移除一个或多个元素，并返回被移除元素的
数量
- SISMEMBER: `SISMEMBER key-name item` 检查元素 item 是否存在于集合 key-name 里
- SCARD: `SCARD key-name` 返回集合包含的元素的数量
- SMEMBERS: `SMEMBERS key-name` 返回集合包含的所有元素
- SRANDMEMBER`: `SRANDMEMBER key-name [count]` 从集合里面随机地返回一个或多个元素。当
count 为正数时，命令返回的随机元素不会重复，当 count 为负数时，命令返回的随机元素可能会出现重复，
话说那哪个参数指定返回元素的数量
- SPOP: `SPOP key-name` 随机地移除集合中的一个元素，并返回被移除的元素
- SMOVE: `SMOVE source-key dest-key item` 如果集合 source-key 包含元素 item，那么从
集合 source-key 里面移除元素 item，并将元素 item 添加到集合 dest-key 中，如果 item 被成功
移除，那么命令返回 1，否则返回 0

用于组合和处理多个集合的命令：   

- SDIFF: `SDIFF key-name [key-name ...]` 返回那些存在于第一个集合、但不存在于其他集合中
的元素
- SDIFFSTORE: `SDIFFSTORE dest-key key-name [key-name ...]` 存储到 dest-key 中
- SINTER: `SINTER key-name [key-name ...]` 返回那些同时存在于所有集合中的元素
- SINTERSTORE: `SINTERSTORE dest-key key-name [key-name ...]`
- SUNION: `SUNION key-name [key-name ...]` 返回那些至少存在于一个集合中的元素
- SUNIONSTORE

## 3.4 散列

- HMGET: `HMGET key-name key [key ...]` 从散列里面获取一个或多个键的值
- HMSET: `HMSET key-name key value [key value ...]` 为散列里面的一个或多个键设置值
- HDEL: `HDEL key-name key [key ...]` 删除散列里面的一个或多个键值对，返回成功找到并删除
的键值对数量
- HLEN: `HLEN key-name` 返回散列包含的键值对数量    

- HEXISTS: `HEXISTS key-name key` 检查给定键是否存在于散列中
- HKEYS: `HKEYS key-name` 获取散列包含的所有键
- HVALS: `HVALS key-name` 获取散列包含的所有值
- HGETALL: `HGETALL key-name` 获取散列包含的所有键值对
- HINCRBY: `HINCRBY key-name key increment` 将键 key 存储的值加上整数 increment
- HINCRBYFLOAT     

## 3.5 有序集合

和散列存储着键与值之间的映射类似，有序集合也存储着成员与分值之间的映射，并且提供了分值处理命令，
以及根据分值⼤⼩有序地获取（fetch）或扫描（scan）成员和分值的命令。    

- ZADD: `ZADD key-name score member [score member ...]` 将带有给定分值的成员添加到有序
集合里面
- ZREM: `ZREM key-name member [member ...]` 从有序集合里面移除给定的成员，并返回被移除
成员的数量
- ZINCRBY: `ZINCRBY key-name increment member` 将 member 成员的分值加上 increment
- ZCOUNT: `ZCOUNT key-name min max` 返回分值介于 min 和 max 之间的成员数量
- ZRANK: `ZRANK key-name member` 返回成员 member 在有序集合中的排名
- ZSCORE: `ZSCORE key-name member` 返回成员 member 的分值
- ZRANGE: `ZRANGE key-name start stop [WITHSCORES]` 返回有序集合中排名介于 start 和
stop 之间的成员，如果给定了可选的 WITHSCORES 选项，那么命令会将成员的分值也一并返回    

范围型数据获取命令和范围型数据删除命令，以及并集命令和交集命令：   

- ZREVRANK: `ZREVRANK key-name member` 返回有序集合里成员 member 的排名，成员按分值从大
到小排列
- ZREVRANGE: `ZREVRANGE key-name start stop [WITHSCORES]` 返回有序集合给定排名范围内的
成员，成员按照分值从大到小排列
- ZRANGEBYSCORE: `ZRANGEBYSCORE key-name min max [WITHSCORES] [LIMIT offset count]`
返回有序集合中，分值介于 min 和 max 之间的所有成员
- ZREVRANGEBYSCORE: `ZREVRANGEBYSCORE key-name max min [WITHSCORES] [LIMIT offset count]`
获取有序集合中分值介于 min 和 max 之间的所有成员，并按照分值从大到小的顺序返回
- ZREMRANGEBYRANK: `ZREMRANGEBYRANK key-name start stop` 移除有序集合中排名介于 start
和 stop 之间的所有成员
- ZREMRANGEBYSCORE: `ZREMRANGEBYSCORE key-name min max` 移除有序集合中分值介于 min
和 max 之间的所有成员
- ZINTERSTORE: `ZINTERSTORE dest-key key-count key [key ....] [WEIGHTS weight [weight ...]] [AGGREGATE SUM|MIN|MAX]` 对给定的有序集合执行类似于集合的交集运算
- ZUNIONSTORE: `ZUNIONSTORE dest-key key-count key [key ...] [WEIGHTS weight [weight ....]] [AGGREGATE SUM|MIN|MAX]`    

## 3.6 发布与订阅

- SUBSCRIBE: `SUBSCRIBE channel [channel ...]` 订阅给定的一个或多个频道
- UNSUBSCRIBE: `UNSUBSCRIBE [channel [channel ...]]` 退订给定的一个或多个频道，如果执行
时没有给定任何频道，那么退订所有频道
- PUBLISH: `PUBLISH channel message` 向给定频道发送消息
- PSUBSCRIBE: `PSUBSCRIBE pattern [pattern ...] 订阅与给定模式相匹配的所有频道
- PUNSUBSCRIBE: `PUNSUBSCRIBE [pattern [pattern ...]]` 退订给定的模式，如果执行时没有
给定任何模式，那么退订所有模式

## 3.7 其他命令

### 3.7.1 排序

Redis的排序操作和其他编程语⾔的排序操作⼀样，都可以根据某种⽐较规则对⼀系列元素进⾏有序的排列。
负责执⾏排序操作的 SORT 命令可以根据字符串、列表、集合、有序集合、散列这5种键⾥⾯存储着的数据，
对列表、集合以及有序集合进⾏排序。    

```
SORT source-key [BY pattern] [LIMIT offset count] [GET pattern [GET pattern ...]]
[ASC|DESC] [ALPHA] [STORE dest-key]
```   

使用 SORT 命令提供的选项可以实现以下功能：根据降序而不是默认的升序来排序元素；将元素看做是数字
来进行排序，或者将元素看作是二进制字符串来进行排序；使用被排序元素之外的其他值作为权重来进行排序，
甚至还可以从输入的列表、集合、有序集合以外的其他地方进行取值。   

```cmd
127.0.0.1:6379> rpush 'sort-input' 23 15 110 7
(integer) 4
127.0.0.1:6379> sort 'sort-input'
1) "7"
2) "15"
3) "23"
4) "110"
127.0.0.1:6379> hset 'd-7' 'field' 5
(integer) 1
127.0.0.1:6379> hset 'd-15' 'field' 1
(integer) 1
127.0.0.1:6379> hset 'd-23' 'field' 9
(integer) 1
127.0.0.1:6379> hset 'd-110' 'field' 3
(integer) 1
127.0.0.1:6379> sort 'sort-input' by 'd-*->field'
1) "15"
2) "110"
3) "7"
4) "23"
127.0.0.1:6379> sort 'sort-input' by 'd-*->field' get 'd-*->field'
1) "1"
2) "3"
3) "5"
4) "9"
```    

### 3.7.2 基本的 Redis 事务

Redis 的基本事务需要用到 MULTI 命令和 EXEC 命令，这种事务可以让一个客户端在不被其他客户端打断
的情况下执行多个命令。和关系数据库那种可以在执行过程中进行回滚的事务不同，在 Redis 里面，被
MULTI 和 EXEC 命令包围的所有命令会一个接一个地执行，直到所有命令都执行完毕为止。当一个事务执行
完毕之后，Redis 才会出来其他客户端的命令。    

要在 Redis 里面执行事务，我们首先需要执行 MULTI 命令，然后输入那些我们想要在事务里面执行的命令，
最后再执行 EXEC 命令。当 Redis 从一个客户端那里接收到 MULTI 命令时，Redis 会将这个客户端之后
发送的所有命令都放入一个队列里面，直到这个客户端发送 EXEC 命令为止，然后 Redis 就会在不被打断
的情况下，一个接一个地执行存储在队列里面的命令。    

### 3.7.3 键的过期时间

- PERSIST: `PSERSIST key-name` 移除键的过期时间
- TTL: `TTL key-name` 查看给定键距离过期还有多少秒
- EXPIRE: `EXPIRE key-name seconds` 让给定键在指定的秒数之后过期
- EXPIREAT: `EXPIREAT key-name timestamp` 将给定键的过去时间设置为给定的 UNIX 时间戳
- PTTL: `PTTL key-name` 查看给定键距离过期时间还有多少毫秒
- PEXPIRE: `PEXPIRE key-name milliseconds`
- PEXPIREAT: `PEXPIREAT key-name timestamp-milliseconds`    

# 第 4 章 数据安全和性能保障

## 4.1 持久化选项

Redis 提供了两种不同的持久化方法来将数据存储到硬盘里面。一种方法叫快照，它可以将存在于某一时刻的
所有数据都写入硬盘里面。另一种方法叫只追加文件（append-only file, AOF），它会在执行写命令时，
将被执行的写命令复制到硬盘里面。这两种持久化方法既可以同时使用，又可以单独使用。    

快照持久化选项：   

```
save 60 1000
stop-writes-on-bgsave-error no
rdbcompression yes
dbfilename dump.rdb
```    

如何命名硬盘上快照文件，多久执行一次自动快照操作，是否对快照文件进行压缩，在创建快照失败后是否仍然
继续执行写命令。    

AOF 持久化选项:   

```
appendonly no
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
```    

是否使用 AOF 持久化，多久才将写入的内容同步到硬盘，在对 AOF 进行压缩的时候能发进行同步操作，
多久执行一次 AOF 压缩。    

### 4.1.1 快照持久化

Redis 可以通过创建快照来获得存储在内存里面的数据在某个时间点上的副本。在创建快照之后，用户可以对
快照进行备份，可以将快照复制到其他服务器从而创建具有相同数据的服务器副本，还可以将快照留在本地以便
重启服务器时使用。    

根据配置，快照将被写入 dbfilename 选项指定的文件里面，并储存在 dir 选项指定的路径中。如果在新的
快照文件创建完毕之前，Redis、系统或者硬件这三者之中的任意一个崩溃了，那么 Redis 将丢失最近一次
创建快照之后写入的所有数据。   

创建快照的办法有以下几种：    

- 客户端可以通过向 Redis 发送 BGSAVE 命令来创建一个快照。对于支持 BGSAVE 命令的平台来说，Redis
会调用 fork 来创建一个子进程，然后子进程负责将快照写入硬盘，而父进程则继续处理命令请求
- 客户端还可以通过向 Redis 发送 SAVE 命令来创建一个快照，接到 SAVE 命令的 Redis 服务器在快照
创建完毕之前将不再响应任何其他命令。SAVE 命令并不常用，我们通常只会在没有足够内存去执行 BGSAVE
命令的情况下，又或者即使等待持久化操作执行完毕也无所谓的情况下，才会使用这个命令
- 如果用户设置了 save 配置选项，比如 save 60 10000，那么从 Redis 最近一次创建快照之后开始
算起，当 "60秒之内有 10000 次写入" 这个条件被满足时，Redis 就会自动触发 BGSAVE 命令。如果
用户设置了多个 save 配置选项，那么当任意一个 save 配置选项所设置的条件被满足时，Redis 就会触发
一次 BGSAVE 命令
- 当 Redis 通过 SHUTDOWN 命令接收到关闭服务器的请求时，或者接收到标准 TERM 信号时，会执行
一个 SAVE 命令，阻塞所有客户端，不再执行客户端发送的任何命令，并在 SAVE 命令执行完毕之后关闭
服务器。
- 当一个 Redis 服务器连接另一个 Redis 服务器，并向对方发送 SYNC 命令来开始一次复制操作的时候，
如果主服务器目前没有执行 BGSAVE 操作，或者主服务器并非刚刚执行完 BGSAVE 操作，那么主服务器就会
执行 BGSAVE 命令。   

### 4.1.2 AOF 持久化

简单来说，AOF 持久化会将被执行的写命令写到 AOF 文件的末尾，以此来记录数据发生的变化。因此，Redis
只要从头到尾重新执行一次 AOF 文件包含的所有写命令，就可以恢复 AOF 文件所记录的数据集。AOF 持久
化可以通过设置 `appendonly yes` 来打开。   

在向硬盘写入文件时，至少会发生 3 件事。当调用 `file.write()` 方法对文件进行写入时，写入的内容
首先会被存储到缓冲区，然后操作系统会在将来的某个时候讲缓冲区存储的内容写入硬盘，而数据只有在被写入
硬盘之后，才算是真正地保存到了硬盘里面。用户可以通过调用 `file.flush()` 方法来请求操作系统尽快
地将缓冲区存储的数据写入硬盘里，但具体何时执行写入操作仍然由操作系统决定。除此之外，用户还可以命令
操作系统将文件同步到硬盘，同步操作会一直阻塞直到指定的文件被写入硬盘为止。    

虽然 AOF 持久化⾮常灵活地提供了多种不同的选项来满⾜不同应⽤程序对数据安全的不同要求，但AOF持久
化也有缺陷——那就是AOF⽂件的体积⼤⼩。    

### 4.1.3 重写/压缩 AOF 文件

为了解决 AOF 文件体积不断增大的问题，用户可以向 Redis 发送 BGREWRITEAOF 命令，这个命令会通过
移除 AOF 文件中的冗余命令来重写（rewrite）AOF 文件，使 AOF 文件的体积变得尽可能地小。
BGREWRITEAOF 的工作原理和 BGSAVE 创建快照的工作原理非常相似：Redis 会创建一个子进程，然后由
子进程负责对 AOF 文件进行重写。因为 AOF 文件重写也需要用到子进程，所以快照持久化因为创建子进程
而导致的性能问题和内存占用问题，在 AOF 持久化中也同样存在。更糟糕的是，如果不加以控制的话，AOF
文件的体积可能会比快照文件的体积大好几倍，在进行 AOF 重写并删除旧 AOF 文件的时候，删除一个体积
达到数⼗ GB ⼤的旧 AOF ⽂件可能会导致操作系统挂起（hang）数秒。    

跟快照持久化可以通过设置 save 选项来⾃动执⾏ BGSAVE ⼀样，AOF持久化也可以通过设置
auto-aof-rewrite-percentage 选项和 auto-aof-rewrite-min-size 选项来自动执行
BGREWRITEAOF。   

举个例子，假设用户设置了 auto-aof-rewrite-percentage 100 和 auto-aof-rewrite-min-size 64mb，
并且启用了 AOF 持久化，那么当 AOF 文件的体积大于 64MB，并且 AOF 的体积比上一次重写之后的体积
大了至少一倍的时候，Redis 将执行 BGREWRITEAOF 命令。    

## 4.2 复制

复制可以让其他服务器拥有⼀个不断地更新的数据副本，从⽽使得拥有数据副本的服务器可以⽤于处理客户端发
送的读请求。关系数据库通常会使⽤⼀个主服务器（master）向多个从服务器（slave）发送更新，并使⽤
从服务器来处理所有读请求。Redis 也采⽤了同样的⽅法来实现⾃⼰的复制特性，并将其⽤作扩展性能的⼀种
⼿段。    

### 4.2.1 对 Redis 的复制相关选项进行配置

当从服务器连接主服务器的时候，主服务器会执⾏ BGSAVE 操作。因此为了正确地使⽤复制特性，⽤户需要
保证主服务器已经正确地设置了 dir 和 dbfilename。    

尽管有多个不同的选项可以控制从服务器⾃⾝的⾏为，但开启从服务器所必须的选项只有 slaveof ⼀个。
如果⽤户在启动 Redis 服务器的时候，指定了⼀个包含 slaveof host port 选项的配置⽂件，那么
Redis 服务器将根据该选项给定的IP地址和端口号来连接主服务器。对于⼀个正在运⾏的Redis服务器，
⽤户可以通过发送 `SLAVEOF no one` 命令来让服务器终⽌复制操作，不再接受主服务器的数据更新；
也可以通过发送 SLAVEOF host port 命令来让服务器开始复制⼀个新的主服务器。    

### 4.2.2 Redis 复制的启动过程

从服务器在连接⼀个主服务器的时候，主服务器会创建⼀个快照⽂件并将其发送⾄从服务器，但这只是主从
复制执⾏过程的其中⼀步。下完整地列出了当从服务器连接主服务器时，主从服务器执⾏的所有操作。   


步骤 | 主服务器操作 | 从服务器操作
---------|----------|---------
 1 | 等待命令进入 | 连接（或者重连）主服务器，发送 SYNC 命令
 2 | 开始执行 BGSAVE，并使用缓冲区记录 BGSAVE 之后执行的所有写命令 | 根据配置选项来决定是继续使用现有的数据（如果有的话）来处理客户端的命令请求，还是向发送请求的客户端返回错误
 3 | BGSAVE 执行完毕，向从服务器发送快照文件，并在发送期间继续使用缓冲区记录被执行的写命令 | 丢弃所有旧数据（如果有的话），开始载入主服务器发来的快照文件
 4 | 快照文件发送完毕，开始向从服务器发送存储在缓冲区里面的写命令 | 完成对快照文件的解释操作，像往常一样开始接受命令请求
 5 | 缓冲区存储的写命令发送完毕，从现在开始，每执行一个写命令，就像从服务器发送相同的写命令 | 执⾏主服务器发来的所有存储在缓冲区⾥⾯的写命令；并从现在开始，接收并执⾏主服务器传来的每个写命令

如果用户使用 SLAVEOF 选项启动了一台 Redis 从服务器，那么从服务器在启动时首先会载入当前可用的任何
快照或者 AOF 文件，然后连接主服务器并执行上表所示的复制过程。如果用户使用的是 SLAVEOF 命令，那么
Redis 会立即尝试连接主服务器，并在连接成功之后，开始上表所示的复制过程。   

从服务器在进⾏同步时，会清空⾃⼰的所有数据。    

当多个从服务器尝试连接同一个主服务器的时候，就会出现下表所示的两种情况中的其中一种。   


当有新的从服务器连接主服务器时 | 主服务器的操作
---------|----------
 上表的步骤 3 尚未执行 | 所有从服务器都会接收到相同的快照文件和相同的缓冲区写命令
 上表的步骤 3 正在执行或者已经执行完毕 | 当主服务器与较早进行连接的从服务器执行完复制所需的 5 个步骤之后，主服务器会与新连接的从服务器执行一次新的步骤 1 到步骤 5

### 4.2.3 主从链

因为Redis的主服务器和从服务器并没有特别不同的地⽅，所以从服务器也可以拥有⾃⼰的从服务器，并由此
形成主从链（master/slave chaining）。   

从服务器对从服务器进⾏复制在操作上和从服务器对主服务器进⾏复制的唯⼀区别在于，如果从服务器 X 拥有
从服务器Y，那么当从服务器 X 在执⾏第一个表中的步骤 4 时，它将断开与从服务器Y的连接，导致从服务器Y
需要重新连接并重新同步（resync）。    

通过同时使⽤复制和AOF持久化，我们可以将数据持久化到多台机器上⾯。哈？复制使用的是快照 RDB 持久化
吧。    

为了将数据保存到多台机器上⾯，⽤户⾸先需要为主服务器设置多
个从服务器，然后对每个从服务器设置 `appendonly yes` 选项和 `appendfsync everysec` 选项
（如果有需要的话，也可以对主服务器进⾏相同的设置），这样的话，⽤户就可以让多台服务器以每秒⼀次的
频率将数据同步到硬盘上了。但这还只是第⼀步：因为⽤户还必须等待主服务器发送的写命令到达从服务器，
并且在执⾏后续操作之前，检查数据是否已经被同步到了硬盘⾥⾯。    

### 4.2.4 检验硬盘写入

为了验证主服务器是否已经将写数据发送⾄从服务器，⽤户需要在向主服务器写⼊真正的数据之后，再向主服务器
写⼊⼀个唯⼀的虚构值（unique dummy value），然后通过检查虚构值是否存在于从服务器来判断写数据
是否已经到达从服务器，这个操作很容易就可以实现。另⼀⽅⾯，判断数据是否已经被保存到硬盘⾥⾯则要
困难得多。对于每秒同步⼀次AOF⽂件的Redis服务器来说，⽤户总是可以通过等待1秒来确保数据已经被
保存到硬盘⾥⾯；但更节约时间的做法是，检查 INFO 命令的输出结果中 aof_pending_bio_fsync 属性
的值是否为 0，如果是的话，那么久表示从服务器已经将已知的所有数据都保存到硬盘里面了。    

## 4.3 处理系统故障

### 4.3.1 验证快照文件和 AOF 文件

⽆论是快照持久化还是AOF持久化，都提供了在遇到系统故障时进⾏数据恢复的⼯具。Redis提供了两个命令⾏
程序 redis-check-aof 和 redis-check-dump（但是抄笔记的时候并没有这个，而是一个 redis-check-rdb，
它们可以在系统故障发⽣之后，检查AOF⽂件和快照⽂件的状态，并在有需要的情况下对⽂件进⾏修复。在不给定
任何参数的情况下运⾏这两个程序，就可以看见它们的基本使⽤⽅法：   

```
$ ./redis-check-aof
Usage: ./redis-check-aof [--fix] <file.aof>
$ ./redis-check-rdb
Usage: ./redis-check-rdb <rdb-file-name>
```   

程序修复AOF⽂件的⽅法⾮常简单：它会扫描给定的AOF⽂件，寻找不正确或者不完整的命令，当发现第⼀
个出错命令的时候，程序会删除出错的命令以及位于出错命令之后的所有命令，只保留那些位于出错命令之前
的正确命令。    

遗憾的是，⽬前并没有办法可以修复出错的快照⽂件。尽管发现快照⽂件⾸个出现错误的地⽅是有可能的，
但因为快照⽂件本⾝经过了压缩，⽽出现在快照⽂件中间的错误有可能会导致快照⽂件的剩余部分⽆法被读取。
因此，⽤户最好为重要的快照⽂件保留多个备份，并在进⾏数据恢复时，通过计算快照⽂件的SHA1散列值和
SHA256散列值来对内容进⾏验证。    

### 4.3.2 更换故障主服务器

在运⾏⼀组同时使⽤复制和持久化的Redis服务器时，⽤户迟早都会遇上某个或某些Redis服务器停⽌运⾏的
情况。造成故障的原因可能是硬盘驱动器出错、内存出错或者电量耗尽，但⽆论服务器因为何种原因出现故障，
⽤户最终都要对发⽣故障的服务器进⾏更换。现在让我们来看看，在拥有⼀个主服务器和⼀个从服务器的情况下，
更换主服务器的具体步骤。   

假设A、B两台机器都运⾏着Redis，其中机器A的Redis为主服务器，⽽机器B的Redis为从服务器。不巧的是，
机器A刚刚因为某个暂时⽆法修复的故障⽽断开了⽹络连接，因此⽤户决定将同样安装了Redis的机器C⽤作
新的主服务器。    

更换服务器的计划⾮常简单：⾸先向机器B发送⼀个 SAVE 命令，让它创建⼀个新的快照⽂件，接着将这个
快照⽂件发送给机器C，并在机器C上⾯启动Redis。最后，让机器B成为机器C的从服务器.   

另⼀种创建新的主服务器的⽅法，就是将从服务器升级（turn）为主服务器，并为升级后的主服务器创建从
服务器。  

以上列举的两种⽅法都可以让Redis回到之前的⼀个主服务器和⼀个从服务器的状态，⽽⽤户接下来要做的
就是更新客户端的配置，让它们去读写正确的服务器。除此之外，如果⽤户需要重启Redis的话，那么可能
还需要对服务器的持久化配置进⾏更新。  

## 4.4 Redis 事务

Redis的事务和传统关系数据库的事务并不相同。在关系数据库中，⽤户⾸先向数据库服务器发送 BEGIN，
然后执⾏各个相互⼀致（consistent）的写操作和读操作，最后，⽤户可以选择发送 COMMIT 来确认之前
所做的修改，或者发送 ROLLBACK 来放弃那些修改。    

Redis的事务以特殊命令 MULTI 为开始，之后跟着⽤户传⼊的多个命令，最后以 EXEC 为结束。但是由
于这种简单的事务在 EXEC 命令被调⽤之前不会执⾏任何实际操作，所以⽤户将没办法根据读取到的数据来
做决定。这个问题看上去似乎⽆⾜轻重，但实际上⽆法以⼀致的形式读取数据将导致某⼀类型的问题变得难以
解决，除此之外，因为在多个事务同时处理同⼀个对象时通常需要⽤到⼆阶提交（two-phase commit），
所以如果事务不能以⼀致的形式读取数据，那么⼆阶提交将⽆法实现，从⽽导致⼀些原本可以成功执⾏的事务
沦落⾄执⾏失败的地步。    

延迟执⾏事务有助于提升性能。因为Redis在执⾏事务的过程中，会延迟执⾏已⼊队的命令直到客户端发送
EXEC 命令为⽌。因此，包括本书使⽤的Python客户端在内的很多Redis客户端都会等到事务包含的所有
命令都出现了之后，才⼀次性地将 MULTI 命令、要在事务中执⾏的⼀系列命令，以及 EXEC 命令全部发送
给Redis，然后等待直到接收到所有命令的回复为⽌。这种“⼀次性发送多个命令，然后等待所有回复出现”
的做法通常被称为流⽔线（pipelining），它可以通过减少客户端与Redis服务器之间的⽹络通信次数来提升
Redis在执⾏多个命令时的性能。    

### 4.4.2 将商品放到市场上销售

为了将商品放到市场上进行销售，程序除了要使用 MULTI 命令和 EXEC 命令之外，还需要配合使用 WATCH
命令，有时候甚至还会用到 UNWATCH 或 DISCARD 命令。在用户使用 WATCH 命令对键进行监视之后，
直到用户执行 EXEC 命令的这段时间里面，如果有其他客户端抢先对任何被监视的键进行了替换、更新或
删除，那么当用户尝试执行 EXEC 命令的时候，事务将失败并返回一个错误。通过使用 WATCH, MULTI/EXEC,
UNWATCH/DISCARD 等命令，程序可以在执行某些重要操作的时候，通过确保资金正在使用的数据没有发生
变化来避免数据出错。    

UNWATCH 命令可以在 WATCH 命令执行之后、MULTI 命令执行之前对连接进行重置；同样地，DISCARD
命令也可以在 MULTI 命令执行之后、EXEC 命令执行之前对连接进行重置。这也就是说，⽤户在使⽤
WATCH 监视⼀个或多个键，接着使⽤ MULTI 开始⼀个新的事务，并将多个命令⼊队到事务队列之后，仍然
可以通过发送 DISCARD 命令来取消 WATCH 命令并清空所有已⼊队命令。    

## 4.5 非事务型流水线

使⽤事务的其中⼀个好处就是底层的客户端会通过使⽤流⽔线来提⾼事务执⾏时的性能。    

之前我们介绍过一些可以接受多个参数的添加命令和更新命令，如 MGET, MSET, HMGET, HMSET, RPUSH,
LPUSH, SADD, ZDD 等。这些命令简化了那些需要重复执⾏相同命令的操作，并且极⼤地提升了性能。尽管
效果可能没有以上提到的命令那么显著，但使⽤⾮事务型流⽔线（non-transactional pipeline）同样
可以获得相似的性能提升，并且可以让⽤户同时执⾏多个不同的命令。   