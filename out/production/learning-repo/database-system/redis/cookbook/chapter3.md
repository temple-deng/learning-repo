# 第 3 章 数据特性

<!-- TOC -->

- [第 3 章 数据特性](#第-3-章-数据特性)
  - [3.2 使用位图（bitmap）](#32-使用位图bitmap)
  - [3.3 设置键的过期时间](#33-设置键的过期时间)
  - [3.4 使用 SORT 命令](#34-使用-sort-命令)
  - [3.5 使用管道（pipeline）](#35-使用管道pipeline)
  - [3.6 理解 Redis 事务（transaction）](#36-理解-redis-事务transaction)
  - [3.7 使用发布订阅（PubSub）](#37-使用发布订阅pubsub)
  - [3.8 使用 Lua 脚本](#38-使用-lua-脚本)

<!-- /TOC -->

## 3.2 使用位图（bitmap）

位图（也称为位数组或位向量）是由比特位组成的数组。Redis 中的位图并不是一种新的数据类型，它实际的
底层数据类型是字符串。因为字符串本质上是二进制大对象，所以可以将其视作位图。    

使用 SETBIT 命令设置位图指定偏移处比特位的值。    

```bash
...> SETBIT "users_tried_reservation" 100 1
(integer) 0
```   

话说这位图就不算数据类型了吗，数据特性叫什么鬼。    

使用 GETBIT 命令，从位图中获取位于指定偏移处比特位的值。    

可以使用 BITCOUNT 命令获取位图中被设置为 1 的比特数。    

BITOP 命令用于进行位操作，该命令支持四种位操作：AND、OR、XOR 和 NOT。为运算的结果会被存储在
一个目标键中。     

## 3.3 设置键的过期时间

除了使用 DEL 或 UNLINK 命令手动删除键外，还可以通过设置键的超时时间让 Redis 自动地删除键。    

1. 创建一个名为 closest_restaurant_ids 的餐厅 ID 的列表：    

```bash
...> LPUSH "closest_restaurant_ids" 109 200 233 543 222
(integer) 5
```     

2. 使用 EXPIRE 命令将键的超时时间设置为 300 秒：    

```bash
....> EXPIRE "closest_restaurant_ids" 300
(integer) 1
```   

3. 使用 TTL 命令，在键过期前查看剩余时间：    

```bash
...> TTL "closest_restaurant_ids"
(integer) 269
```    

当对 Redis 中的一个键设置过期时间时，键的过期时间会被存储为一个绝对的 UNIX 时间戳。这样做的目的
在于，即使 Redis 服务器宕机了一段时间，这个时间戳也会被持久化到 RDB 文件中。当 Redis 再次启动
时，这个用来判断键是否过期的时间戳并不会发生变化，一旦当前时间超过了这个时间戳，键就过期了。    

在⼀个键过期后，当客户端试图访问已过期键时，Redis会⽴即将其从内存中删除。Redis这种删除键的⽅式
被称为被动过期。对于那些已经过期且永远不会再被访问到的键，Redis 还会定期地运⾏⼀个基于概率的算法
来进⾏主动删除。更具体地说，Redis会随机选择设置了过期时间的20个键。在这20个被选中的键中，已过期的
键会被⽴即删除；如果选中的键中有超过25%的键已经过期且被删除，那么Redis会再次随机选择20个键并重
复这个过程。默认情况下，上述过程每秒运⾏10次。    

我们可以通过以下的方式清除一个键的过期时间：   

- 使用 PERSIST 命令使其成为持久的键
- 键的值被替换或删除，包括 SET, GETSET 和 *STORE 在内的命令会清除过期时间。不过，修改列表、
集合或哈希的元素却不会清除过期时间，这是因为修改元素的操作并不会替换键所关联的值对象。    
- 被另一个没有过期时间的键重命名    

EXPIREAT 与 EXPIRE 命令类似，但它可以指定一个绝对 UNIX 时间戳为参数，该参数用于直接指定键的
过期时间。    

## 3.4 使用 SORT 命令

如果所有的元素都是数值，那么我们可以简单地运⾏ SORT 命令按升序对元素排序。     

如果存在非数值的元素且想按字典顺序对它们进行排序，那么我们需要增加修饰符 ALPHA。    

```bash
...> SADD "user:123:favorite_restaurants" "Dunkin Donuts" "Subway" "KFC" "Burger King"
"Wendy's"
(integer) 5
...> SORT "user:123:favorite_restaurants" ALPHA
1) "Burger King"
2) "Dunkin Donuts"
3) "KFC"
4) "Subway"
5) "Wendy's"
```    

在使⽤ SORT 命令时添加修饰符 DESC 会按降序返回元素。默认情况下，SORT 命令会排序并返回所有元素；
但是，我们可以通过使⽤ LIMIT 修饰符来限制返回元素的数量。在使⽤ LIMIT 修饰符时，我们需要同时
指定起始偏移量（要跳过元素的数量）和数量（要返回元素的数量）。  

有时，我们不希望按值对元素进⾏排序，⽽是按在某些其他键中定义的权重来对元素进⾏排序。举例来说，我们
可能需要按照定义在形如 restaurnat_rating_200（其中的 200是餐厅的ID）的键中的评级对⽤户喜
欢的餐厅进⾏排序。    

```bash
...> SET "restaurant_rating_200" 4.3
...> SET "restaurant_rating_365" 4.0
...> SET "restaurant_rating_104" 4.8
...> SET "restaurant_rating_455" 4.7
...> SET "restaurant_rating_333" 4.6
...> SORT "user:123:favorite_restaurant_ids" BY restaurant_rating_* DESC
1) "104"
2) "455"
3) "333"
4) "200"
5) "365"
```     

没看懂。    

## 3.5 使用管道（pipeline）

客户端和服务器之间典型的通信过程可以看做：    

1. 客户端向服务器发送一个命令
2. 服务器接收该命令并将其放入执行队列（因为 Redis 是单线程的执行模型）
3. 命令被执行
4. 服务器将命令执行的结果返回给客户端     

使用 Redis 管道可以加快网络传输的过程。Redis 管道的基本思想是，客户端将多个命令打包在一起，并将
它们一次性发送，而不再等待每个单独命令的执行结果；同时，Redis 管道需要服务器在执行所有的命令后再
返回结果。即便是执行多个命令，但由于第 1 步和第 4 步只发生一次，所以总的执行时间会大大减少。    

首先装一个 dos2unix:   

```bash
$ sudo apt-get install dos2unix
```   

输入以下的命令：    

```bash
$ cat pipeline.txt
set mykey myvalue
sadd myset value1 value2
get mykey
scard myset
```    

它这个顺序有问题啊，你得先创建这个文件吧。    

这个文本文件中的每一行都必须以 \r\n，而不是 \n 结束。我们可以使用命令 unix2dos 实现：    

```bash
$ unix2dos pipeline.txt
```    

坑爹，后面的内容不知道怎么没有。    

redis-cli中的--pipe选项会⼀次性地发送所有来⾃ stdin 的命令，从⽽极⼤地减少往返时延的开销。    

## 3.6 理解 Redis 事务（transaction）    

在 Redis 中，事务的概念与关系数据库中的事务完全不同。    

为了学习 Redis 的事务，让我们为Relp中的某个餐厅组织⼀场在线快销秒杀优惠券的活动。这场秒杀活动
只提供5张优惠券，并使⽤键counts:seckilling作为计数器来保存可⽤优惠券的数量。    

下⾯是实现这个计数器的伪代码：    

```
// 初始化优惠券的数量
SET("counts:seckilling", 5)

Start decreasing the counter:
WATCH("counts:seckilling");
count = GET("counts:seckilling");
MULTI();
if count > 0 then
    DECR("counts:seckilling", 1)
    EXEC();
    if ret != null then
        print "Succeed!"
    else
        print "Failed!"
else
    DISCARD();
    print "Seckilling Over!"
```    

首先，我们对一个键使用 WATCH 命令来设置一个标志，该标志用来判断在执行 EXEC 命令 命令之前是否
修改了键，如果修改了键，那么就丢弃整个事务。然后，获取计数器的值。    

接下来，我们通过调用 MULTI 命令来启动一个事务。如果计数器的值无效，则使用 DISCARD 命令直接放弃
该事务。否则，继续减少计数器的值。    

在此之后，我们尝试执行事务。由于之前使用过 WATCH 命令，所以 Redis 会检查计数器 counts:seckilling
的值是否被修改。如果值被修改过，则中止事务。这种中止就被视作秒杀失败。   

我们需要注意关系数据库事务和 Redis 事务之间的区别。    

它们之间的关键区别在于，Redis 事务没有回滚功能。一般来说，在一个 Redis 事务中可能会出现两种类型
的错误，而针对这两种类型的错误会采取不同的处理方式：    

1. 第一种错误是命令有语法错误。在这种情况下，由于在命令入队时就能发现存在语法错误。在这种情况下，
所以整个事务会快速失败且事务中的所有命令都不会被处理。   

```bash
...> MULTI
OK
...> SET FOO BAR
QUEUED
...> GOT FOO
(error) ERR unknown command "GOT"
...> INCR MAS
QUEUED
...> EXEC
(error) EXECABORT Transaction discarded because of previous errors.
```    

2. 第二种错误是，虽然所有命令都已经成功入队，但在执行过程中发生了错误。位于发生错误命令之后的其他
命令将继续执行，而不会回滚。    

```bash
...> MULTI
OK
...> SET foo bar
QUEUED
...> INCR foo
QUEUED
...> SET foo mas
QUEUED
...> GET foo
QUEUED
...> EXEC
1) OK
2) (error) ERR value is not an integer or out of range
3) OK
4) "mas"
```    

## 3.7 使用发布订阅（PubSub）     

打开三个控制台来模拟两个订阅者和一个发布者，订阅者为 console-A(SUBer-1) 和 console-B(SUBer-2),
发布者为 console-C(PUBer)。    

首先在 SUBer1 中订阅 "restaurants:Chinese" 频道：   

```bash
...> SUBSCRIBE restaurants:Chinese
Reading messages... (press Ctrl-c to quit)
1) "subscribe"
2) "restaurants:Chinese"
3) (integer) 1
```    

在 SUBer2 中订阅 "restaurants:Chinese" 和 "restaurants:Thai" 频道：   

```bash
...> SUBSCRIBE restaurants:Chinese restaurants:Thai
Reading messages... (press Ctrl-C to quit)
1) "subscribe"
2) "restaurants:Chinese"
3) (integer) 1
  1) "subscribe"
  2) "restaurants:Thai"
  3) (integer) 2
```    

在 PUBer 中向 "restaurants:Chinese" 频道发布消息：   

```bash
...> PUBLISH restaurants:Chinese "Beijing roast duck discount tomorrow"
(integer) 2
```    

两个订阅者将收到以下的信息：   

```bash
1) "message"
2) "restaurants:Chinese"
3) "Beijing roast duck discount tomorrow"
```    

SUBSCRIBE 命令⽤来监听特定频道中的可⽤消息。⼀个客户端可以使⽤ SUBSCRIBE 命令⼀次性地订阅
多个频道，也可以使⽤ PSUBSCRIBE 命令订阅匹配指定模式的频道。要取消订阅频道，可以使⽤
UNSUBSCRIBE 命令。    

PUBLISH 命令⽤于将⼀条消息发送到指定的频道。订阅了该频道的所有订阅者将接收到这条消息。     

另⼀个重要的命令是 PUBSUB，⽤于进⾏频道管理。例如，我们可以通过 PUBSUB CHANNELS 命令获取当前
活跃的频道。    

对频道的生命周期而言，如果给定的频道之前未曾被订阅过，那么 SUBSCRIBE 命令会自动创建频道。此外，
当频道上没有活跃的订阅者时，频道将会被删除。   

## 3.8 使用 Lua 脚本

Lua是⼀种轻量级的脚本语⾔，Redis从2.6版本开始引⼊对Lua脚本的⽀持。与在理解Redis事务⼀节中提到
的Redis事务类似，Lua脚本是原⼦化执⾏的；不过，Lua语⾔作为服务器端脚本语⾔，能够实现更为强⼤的
功能和程序逻辑。      

我们将使用 Lua 脚本来更新 Redis 中的一个 JSON 字符串对象。    

```bash
$ mkdir /redis/coding/lua; cd /redis/coding/lua
$ cat updatejson.lua
local id = KEYS[1]
local data = ARGV[1]
local dataSource = cjson.decode(data)

local retJson = redis.call('get', id)
if retJson == false then
  retJson = {}
else
  retJson = cjson.decode(retJson)
end

for k, v in pairs(dataSource) do
  retJson[k] = v
end

redis.call('set', id, cjson.encode(retJson))
return redis.call('get', id)
```    

我们可以使用 redis-cli 来执行 Lua 脚本:    

```bash
$ bin/redis-cli --eval updatejson.lua users:id:992452, '{"name": "Tina", "sex": "female", "grade": "A"}'
"{"grade": "A", "name": "Tina", "sex": "female"}"
```    

如果要在后续调用该脚本，那么可以将其注册到 Redis 服务器中：    

```bash
$ bin/redis-cli SCRIPT LOAD "`cat updatejson.lua"
```     

在脚本注册之后，我们可以通过制定注册脚本时返回的唯一 SHA-1 标识符来执行这个 Lua 脚本。    

```bash
$ bin/redis-cli EVALSHA 45a40b 1 users:id:992452 '{"grade": "C"}'
"{"grade": "C", "name": "tina", "sex": "female"}"
```   

首先，我们创建了一个名为 updatejson.lua 的 Lua 脚本。在这个 Lua 脚本中，KEY 和 ARGV 是
EVAL 命令的参数。在脚本的开头，我们获取 KEY 作为要处理的键，ARGV 作为要更新的 JSON 字符串的
内容。在这之后，将传递给脚本的 JSON 内容反序列化。   

然后，我们通过使用 redis.call() 函数调用 GET 命令获取指定键的值，随后查看 GET 命令返回的值。
如果值为 false，则表示键不存在，我们将其设置为空表。     

在这个 Lua 脚本中，用户 ID 被当做 KEYS[] 的元素，用户信息被当做 ARGV[] 的元素；逗号将 KEYS[]
和 ARGV[] 分隔开。在 Lua 脚本中，KEYS[] 数组和 ARGV[] 数组的索引都是从 1 开始的。    

