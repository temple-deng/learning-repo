# 第 2 章 数据类型

<!-- TOC -->

- [第 2 章 数据类型](#第-2-章-数据类型)
  - [2.1 本章概要](#21-本章概要)
  - [2.2 使用字符串（string）类型](#22-使用字符串string类型)
  - [2.3 使用列表（list）类型](#23-使用列表list类型)
  - [2.4 使用哈希（hash）类型](#24-使用哈希hash类型)
  - [2.5 使用集合（set）类型](#25-使用集合set类型)
  - [2.6 使用有序集合（sorted set）类型](#26-使用有序集合sorted-set类型)
  - [2.7 使用 HyperLogLog 类型](#27-使用-hyperloglog-类型)
  - [2.8 使用 Geo 类型](#28-使用-geo-类型)
  - [2.9 键管理](#29-键管理)

<!-- /TOC -->

## 2.1 本章概要

在Redis中不存在需要我们担⼼的表或模式。在使⽤Redis进⾏应⽤设计和开发时，我们⾸先应该考虑的是，
Redis原⽣⽀持的哪种数据类型最适合我们的场景。    

## 2.2 使用字符串（string）类型

Redis 中所有的键都必须是字符串。    

```bash
127.0.0.1:6379> SET "Extreme Pizza" "300 Broadway, New York, NY"
OK
```    

使用 GET 命令可以轻松地取回字符串的值：   

```bash
...> GET "Extreme Pizza"
"300 Broadway, New York, NY"
```    

当 GET 一个不存在的键时会返回 (nil):   

```bash
...> GET "Yummy Pizza"
(nil)
```    

`STRLEN` 命令返回字符串的长度：    

```bash
...> STRLEN "Extreme Pizza"
(integer) 26
```     

对不存在的键执行 `STRLEN` 命令会返回 0。    

Redis 还提供了一些命令来直接操作字符串。使用这些命令的好处是，不需要通过 GET 命令来读取一个字符串
的值，再用 SET 命令将字符串写回去。     

- 使用 APPEND 命令可以向一个键的字符串值末尾追加字符串
- 使用 SETRANGE 命令可以覆盖字符串值的一部分：    

```bash
...> SETRANGE "Extreme Pizza" 14 "Washington, DC 20009"
(integer) 34
...> get "Extreme Pizza"
"300 Broadway, Washington, DC 20009"
```     

set 命令的用法非常简单：    

```bash
SET <key> <value>
```    

如果 SET 命令执行下成功，Redis 会返回 OK。APPEND 命令会返回新字符串的长度。如果键不存在，那么
Redis 将首先创建一个空字符串并与键相关联，然后再执行 APPEND 命令。SETRANGE 命令会覆盖字符串的
一部分（从指定的偏移开始，知道整个字符串的末尾）。在覆盖完成后返回新字符串的长度。    

如果某个键已经存在，那么 SET 命令会覆盖该键此前对应的值。有时，我们不希望在键存在的时候盲目地
覆盖键；这时，我们可以使用 EXIST 命令来测试键的存在性。事实上，Redis 提供了 SETNX 命令，
用于原子性地、仅在键不存在时设置键的值。如果键的值设置成功，则 SETNX 返回 1；如果键已经存在，
则返回 0 且不覆盖原来的值。    

我们可以通过使用 MSET 和 MGET 命令来一次性地设置和获取多个键的值。使用 MSET 的优点在于整个
操作是原子性的，意味着所有的键都是在客户机和服务器之间的一次通信中设置的。    

```bash
MSET key value [key value...]
MGET key value [key value...]
```     

在这里有必要提一下字符串在 Redis 内部是如何进行编码的。Redis 使用了三种不同的编码方式来存储字符串
对象，并会根据每个字符串值自动决定所使用的编码方式：   

- int：用于能够使用 64 位有符号整数表示的字符串
- embstr: 用于长度小于或等于 44 字节的字符串，这种类型的编码在内存使用和性能方面更有效率
- raw: 用于长度大于 44 字节的字符串

我们可以使用 OBJECT 命令来查看与键相关联的 Redis 值对象的内部编码方式：   

```bash
...> SET myKey 12345
OK
..> OBJECT ENCODING myKey
"int"
..> SET myKey "a string"
OK
..> OBJECT ENCODING myKey
"embstr"
..> SET myKey "a long string whose length is more than 44 bytes"
OK
..> OBJECT ENCODING myKey
"raw"
```    

## 2.3 使用列表（list）类型

```bash
...> LPUSH favorite_restaurants "PF Change's" "Olive Garden"
(integer) 2
```   

使用 LRANGE 获取列表中的数据：   

```bash
...> LRANGE favorite_restaurants 0 -1
1) "Olive Garden"
2) "PF Change's"
```    

话说这个顺序是怎么样的。    

如果要在列表的右端插入，可以使用 RPUSH:    

```BASH
...> RPUSH favorite_restaurants "Outback Steakhouse" "Red Lobster"
(integer) 4
```    

如果要在 "PF Chang's" 之后插入一个原生，可以使用 LINSERT:    

```bash
...> LINSERT favorite_restaurants AFTER "PF Chang's" "Indian Tandoor"
```    

如果要获取列表中位于索引位置 3 处餐厅的名称，可以使用 LINDEX:    

```bash
...> LRANGE favorite_restaurants 0 -1
1) "Olive Garden"
2) "PF Chang's"
3) "Indian Tandoor"
4) "Outback Steakhouse"
5) "Red Lobster"
...> LINDEX favorite_restaurants 0
"Olive Garden"
```   

所以 LPUSH 和 RPUSH 其实是一次一个的往进推数据。   

LPUSH、RPUSH和 LINSERT 会返回插⼊后列表的长度。在向列表中插⼊元素前，⽆需为⼀个键初始化⼀个
空列表。如果我们向⼀个不存在的键中插⼊元素，Redis将⾸先创建⼀个空列表并将其与键关联。同样，我们
也不需要删除值为空列表的键，因为Redis会为我们回收这种键。     

如果我们仅想在列表存在时才将元素插入到列表中，那么可以使用 LPUSHX 和 RPUSHX 命令。   

我们可以使用 LPOP 或 RPOP 从列表中删除一个元素。这两个命令会从列表的左端或右端移除第一个元素，
并返回其值。当对不存在的键执行 LPOP 或 RPOP 时，将返回(nil)。    

LTRIM 命令可用于在删除列表中的多个元素的同时，只保留由 start 和 end 索引所指定范围内的元素：    

```bash
...> LRANGE favorite_restaurants 0 -1
1) "PF Chang's"
2) "Indian Tandoor"
3) "Outback Steakhouse"
...> LTRIM favorite_restaurants 1 -1
OK
...> LRANGE favorite_restaurants 0 -1
1) "Indian Tandoor"
2) "Outback Steakhouse"
```    

我们可以使用 LSET 命令设置列表中指定索引位置处元素的值：    

```bash
..> LSET favorite_restaurants 1 "Longhorn Steakhouse"
OK
```    

LPOP 和 RPOP 命令由对应的阻塞版本：BLPOP 和 BRPOP。与非阻塞版本类似，阻塞版本的命令也从列表
的左端或右端弹出元素；但是，当列表为空时，阻塞版本会将客户端阻塞。我们必须在这些阻塞版本的命令中
指定一个以秒为单位的超时时间，表示最长等待几秒。当超时时间为零时，表示永久等待。这个特性在任务
调度场景中非常有用；在这种场景下，多个任务执行程序（Redis客户端）会等待任务调度程序分配新的任务。
任务执行程序只需要对 Redis 中的列表使用 BLPOP 或 BRPOP，之后每当有新任务时，调度程序把任务插入
到列表中，而任务执行程序之一便会获取到该任务。    

Redis 在内部使用 quicklist 存储列表对象。有两个配置选项可以调整列表对象的存储逻辑：    

- list-max-ziplist-size: 一个列表条目中一个内部节点的最大大小（quicklist 的每个节点都是
一个 ziplist）。在大多数情况下，使用默认值即可
- list-compress-depth: 列表压缩策略。如果我们会用到 Redis 中列表首尾的元素，那么可以利用这个
选项来获得更好的压缩比（该参数表示 quicklist 两端不被压缩的节点的个数）     

## 2.4 使用哈希（hash）类型

哈希的字段和值必须是字符串类型。    

```bash
$ ...> HMSET "Kyoto Ramen" "address" "801 Mission St, San Jose, CA" "phone"
  "555-123-6543" "rating" "5.0"
OK
```    

使用 HMGET 命令从一个哈希中获取多个字段对应的值：    

```bash
...> HMGET "Kyoto Ramen" "address" "phone" "rating"
1) "801 Mission St, San Jose, CA"
2) "555-123-6543"
3) "5.0"
```     

使用 HGET 命令从一个哈希中获取某个字段对应的值。    

使用 HEXISTS 命令测试一个哈希中是否存在某个字段：    

```bash
...> HEXISTS "Kyoto Ramen" "phone"
(integer) 1
...> HEXISTS "Kyoto Ramen" "hours"
(integer) 0
```    

使用 HGETALL 命令获取一个哈希中的所有字段和值：    

```bash
...> HGETALL "Kyoto Ramen"
1) "address"
2) "801 Mission St, San Jose, CA"
3) "phone"
4) "555-123-6543"
5) "rating"
6) "5.0"
```    

可以使用 HSET 命令设置单个字段的值，此命令可以用于修改现有字段的值或添加新字段。    

使用 HDEL 命令从哈希中删除字段。    

与我们在使⽤列表（list）类型⼀节中所提到的类似，我们不需要在添加字段前先初始化⼀个空的哈希。
Redis会⾃动使⽤ HSET和 HMSET 来实现这⼀点。类似地，当哈希变成空的时，Redis会负责将其删除。    

默认情况下，HSET 和 HMSET 会覆盖现有的字段。HSETNX 命令则仅在字段不存在的情况下才设置字段的值，
可用于防止 HSET 的默认覆盖行为。    

对于不存在的键或字段，HMGET 和 HGET 将返回 (nil)。    

如果一个哈希的字段非常多，那么执行 HGETALL 命令时可能会阻塞 Redis 服务器。在这种情况下，我们
可以使用 HSCAN 命令来增量地获取所有字段和值。    

HSCAN 是 Redis 中 SCAN 命令的一种（SCAN, HSCAN, SSCAN, ZSCAN），该命令会增量地迭代遍历
元素，从而不会造成服务器阻塞。HSCAN 命令是一种基于指针的迭代器，因此我们需要在每次调用命令时指定
一个游标。当一次 HSCAN 运行结束后，Redis 将返回一个元素列表以及一个新的游标，这个游标可以用于
下一次迭代。     

HSCAN 的使用方法如下:    

- HSCAN key cursor\[MATCH pattern\][COUNT number]
- 选项 MATCH 可以用来匹配满足指定 Glob 表达式的字段
- 选项 COUNT 用来说明在每次迭代中应该返回多少个元素，但是，这个选项仅仅是一个参考，Redis 并不
保证返回的元素数量就是 COUNT 个。COUNT 的默认值是 10    

```bash
...> HSCAN restautrant_ratings 0 MATCH *garden*
1) "309"
2) 1) "panda garden"
   2) "3.9"
   3) "chang's garden"
   4) "4.5"
   5) "rice garden"
   6) "4.8"
```    

我们可以使用由服务器返回的新游标 309 来进行一次新的迭代：   

```bash
...> HSCAN restaurant_ratings 309 MATCH "garden"
1) "0"
2) 1) "szechuwan garden"
   2) "4.9"
   3) "garden wok restaurant"
   4) "4.7"
   5) "win garden"
   6) "4.0"
   7) "east garden restaurant"
   8) "4.6"
```    

当服务器返回的新游标为 0 时，意味着整个遍历完成。    

Redis 在内部使用两种编码来存储哈希对象：   

- ziplist: 对于那些长度小于配置中 hash-max-ziplist-entries 选项配置的值（默认为 512），
且所有元素的大小都小于配置中 hash-max-ziplist-value 选项配置的值（默认为 64 字节）的哈希，
采用此编码。
- hashtable: 当 ziplist 不适用时使用的默认编码    

## 2.5 使用集合（set）类型

集合类型是由唯一、无序对象组成的集合。它经常用于测试某个成员是否在集合中、重复项删除和集合运算。
Redis 的值对象可以是字符串集合。    

```bash
...> SADD "Original Buffalo Wings" "affordable" "spicy" "busy" "great taste"
(integer) 4
```    

使用 SISMEMBER 测试一个元素是否位于集合中：    

```bash
...> SISMEMBER "Original Buffalo Wings" "busy"
(integer) 1
...> SISMEMBER "Original Buffalo Wings" "costly"
(integer) 0
```    

使用 SREM 命令从集合中删除元素：    

```bash
...> SREM "Original Buffalo Wings" "busy" "spicy"
(integer) 2
```    

使用 SCARD 命令获取集合中成员的数量。    

我们可以受用 SMEMBERS 命令列出集合中的所有元素。与 HGETALL 类似，在一个大的集合中使用 SMEMBERS
命令可能会阻塞服务器。因此，我们并不推荐使用 SMEMBERS 命令，而是应该使用 SSCAN 命令。   

Redis 提供了一组集合运算相关的命令，SUNION 和 SUNIONSTORE 用于计算并集，SINSERT 和 SINSERTSTOTE
用于计算交集，SDIFF 和 SDIFFSTORE 用于计算差集。不带 STORE 后缀的命令只返回相应操作的结果集合，
而带 STORE 后缀的命令则会将结果存储到一个指定的键中。    

Redis 在内部使用两种编码方式来存储集合对象：   

- intset: 对于那些元素都是整数，且元素个数小于配置中 set-max-intset-entries 选项设置的值
（默认 512）的集合，采用此编码
- hashtable: intset 不适用时的默认编码    

## 2.6 使用有序集合（sorted set）类型

```bash
...> ZADD ranking:restaurants 100 "Olive Garden" 23 "PF Chang's" 34 "Outback Steakhouse"
45 "Red Lobster" 88 "Longhorn Steakhouse"
(integer) 5
```    

使用 ZREVRANGE 命令来获取这个排名：    

```bash
...> ZREVRANGE ranking:restaurants 0 -1 WITHSCORES
1) "Olive Garden"
2) "100"
3) "Longhorn Steakhouse"
4) "88"
5) "Red Lobster"
6) "45"
7) "Outback Steakhouse"
8) "34"
9) "PF Chang's"
10) "23"
```    

可以使用命令 ZINCRBY 增加元素权重值：    

```bash
...> ZINCRBY ranking:restaurants 1 "Red Lobster"
"46"
```     

使用 ZREVRANK 和 ZSCORE 命令分别查询元素的排名以及元素的权重值：    

```bash
...> ZREVRANK ranking:restaurants "Olive Garden"
(integer) 0
...> ZSCORE ranking:restaurants "Olive Garden"
"100"
```    

使用 ZUNIONSTORE 合并两个有序集合：    

```bash
...> ZADD ranking2:restaurants 50 "Olive Garden" 33 "PF Chang's" 55 "Outback Steakhouse"
190 "Kung Pao House"
(integer) 4
...> ZUNIONSTORE totalranking 2 ranking:restaurants ranking2:restaurants WEIGHTS 1 2
(interger) 6
```    

在 ZADD 命令中使用 NX 选项，能够实现在不更新已存在成员的情况下只添加新的成员：    

```bash
...> ZADD ranking:restaurants NX 50 "Olive Garden"
(integer) 0
```    

类似地，选项 XX 允许我们在不向集合中增加新元素的情况下更新集合。    

ZUNIONSTORE 命令用于将两个有序集合的并集保存在指定的键中，且可以指定各个有序集合的不同权重。
ZUNIONSTORE 命令的用法如下：    

```bash
ZUNIONSTORE destination numkeys key [key...] [WEIGHT weight [weight...]] [AGGREGATE SUM|MIN|MAX]
```    

Redis 在内部使用两种编码方式存储有序集合对象：    

- ziplist: 对于那些长度小于配置中 zset-max-ziplist-entries 选项配置的值（默认为 128），
且所有元素的大小都小于配置中 zset-max-ziplist-value 选项配置的值（默认为 64 字节）的有序
集合，采用此编码
- skiplist: 当 ziplist 不适用时使用的默认编码    

## 2.7 使用 HyperLogLog 类型

在⽇常的各种数据处理场景中，“唯⼀计数”是⼀项常见的任务。在 Redis 中，虽然我们可以使⽤集合来进⾏
唯⼀计数；但是，当数据量增⼤到上千万时，就需要考虑内存消耗和性能下降问题了。如果我们不需要获取数
据集的内容，⽽只是想得到不同值的个数，那么就可以使⽤ HyperLogLog（HLL）数据类型来优化使⽤集合
类型时存在的内存和性能问题。      

```bash
...> PFADD "Counting:Olive Garden" "0000123"
(integer) 1
...> PFADD "Counting:Olive Garden" "0023992"
(integer) 1
```    

然后使用 PFCOUNT 命令获取计数的个数：    

```bash
...> PFCONUT "Counting:Olive Garden"
(integer) 2
```    

PFMERGE 数据合并。    

HLL 类型相关的所有命令都是以 PF 开头的，⽤来向 HLL 数据结构的发明者Philippe Flajolet致敬。
我们不会在本书中深⼊探讨 HLL 算法的细节。Reids中 HLL 的优势在于能够使⽤固定数量的内存（每个
HyperLogLog 类型的键只需要占⽤ 12KB 内存，却可以计算最多 2ˆ64 个不同元素的基数）和常数时间
复杂度（每个键O(1)）进⾏唯⼀计数。    

HLL 实际上是被当做字符串存储的。因此，作为⼀个键值对，它可以很容易地被持久化⾄外部或从外部持久
化中恢复。    

在 Redis 内部，使用了两种方式来存储 HLL 对象：   

- 稀疏：对于那些长度小于配置中 hll-sparse-max-bytes 选项设置的值（默认为 3000）的 HLL 对象，
采用此编码。稀疏表示方式的存储效率更高，但可能会消耗更多的 CPU 资源。
- 稠密：当稀疏方式不能适用时的默认编码    

## 2.8 使用 Geo 类型

Redis从3.2版本开始正式引⼊了Geo（地理位置）相关的API，⽤于⽀持存储和查询这些地理位置相关场景中的坐标。    

```bash
...> GEOADD restaurants:CA -121.896321 37.916750 "Olive Garden" -117.910937 33.804047
"P.F. Chang's" -118.508020 34.453276 "Outback Steakhouse" -119.152439 34.264558
"Red Lobster" -122.276909 39.458300 "Longhorn Charcoal Pit"
(integer) 5
```     

使用 GEOPOS 命令从 Geo 集合中获取指定成员的坐标：    

```bash
...> GEOPOS restaurants:CA "Red Lobster"
1) 1) "-119.1524389386177063"
   2) "34.26455707283378871"
```    

假设读者位于在 MountDiablo State Park，其经/纬度是 -121.923170/37.878506，如果读者想知道
距当前位置 5km 以内的餐厅，那么可以使⽤：   

```bash
...> GEORADIUS restaurants:CA -121.923170 37.878506 5 km
1) "Olive Garden"
```    

有时我们可能需要比较两家餐厅之间的距离；此时，可以使用 `GEODIST` 命令：    

```bash
...> GEODIST restaurants:CA "P.F. Chang's" "Outback Steakhouse" km
"90.7557"
```    

GEORADIUSBYMEMBER 命令与 GEORADIUS 命令非常相似，都可以用来找出位于指定范围内的成员；但是
GEORADIUSBYMEMBER 命令的中心点是由 Geo 集合中的成员决定的，而不是像 GEORADIUS 那样输入的
经纬度来决定的。例如，使用 GEORADIUSBYMEMBER 命令，我们可以搜索 Geo 集合中距离 "Outback Steakhouse"
距离小于 100 km 的餐厅，而 "Outback Steakhouse" 本身就是 Geo 集合的成员之一：    

```bash
...> GEORADIUSBYMEMBER restaurants:CA "Outback Steakhouse" 100 km
1) "Reb Lobster"
2) "Outback Steakhouse"
3) "P.F. Chang's"
```    

当通过 GEOADD 设置坐标时，这些坐标会被内部转换成⼀个52位的 GEOHASH。GEOHASH是⼀个被⼴泛接受
的地理坐标编码系统（Geo-encoding system）。我们需要注意的是，存储在Geo中的坐标和 GEOPOS 命令
返回的坐标之间可能存在细微的差别。因此，我们不应该期望这两者完全相同。    

在 GEORADIUS 和 GEORADIUSBYMEMBER 命令中，我们可以使⽤ WITHDIST 选项来得到距离，使⽤
ASC/DESC 选项来控制返回结果的升序或降序。此外，通过 STORE/STOREDIST 选项还可以将 GEORADIUS
和 GEORADIUSBYMEMBER返回的结果存储到Redis中的另⼀个Geo集合中。     

Geo 集合实际上被存储为⼀个有序集合（Redis中的 zset），因此有序集合⽀持的所有命令都可以⽤于Geo
数据类型。例如，我们可以使⽤ ZREM 从 Geo 集合中移除成员，也可以使⽤ ZRANGE 来获取 Geo 集合的
所有成员。    

GEOHASH 的实现是基于⼀种 52 位整数的表⽰（实现了低于1⽶的精度）。当需要⼀个标准的GEOHASH字符串时，
我们可以使⽤ GEOHASH 命令来获取⼀个长度为 11 的字符串。    

## 2.9 键管理

如果我们想要获取 Redis 服务器中所有的键，可以使用两种 API。其一是 KEYS:   

```bash
...> KEYS *
```   

另一个是 SCAN。    

在某些情况下，我们可能需要删除 Redis 的键，可以使用 DEL 或 UNLINK 命令。    

要判断一个键是否存在，可以使用 EXISTS 命令。   

可以使用 TYPE 命令获取键的数据类型。    

使用 RENAME 命令来重命名一个键。   