# 第一部分 入门

<!-- TOC -->

- [第一部分 入门](#第一部分-入门)
- [第 1 章 初识 Redis](#第-1-章-初识-redis)
  - [1.1 Redis 简介](#11-redis-简介)
  - [1.2 Redis 数据结构简介](#12-redis-数据结构简介)
    - [1.2.1 Redis 中的字符串](#121-redis-中的字符串)
    - [1.2.2 Redis 中的列表](#122-redis-中的列表)
    - [1.2.3 Redis 的集合](#123-redis-的集合)
    - [1.2.4 Redis 的散列](#124-redis-的散列)
    - [1.2.5 Redis 的有序集合](#125-redis-的有序集合)
- [第 2 章 使用 Redis 构建 Web 应用](#第-2-章-使用-redis-构建-web-应用)
  - [2.1 登录和 cookie 缓存](#21-登录和-cookie-缓存)
  - [2.2 使用 Redis 实现购物车](#22-使用-redis-实现购物车)
  - [2.3 网页缓存](#23-网页缓存)

<!-- /TOC -->

# 第 1 章 初识 Redis

## 1.1 Redis 简介

⾼性能键值缓存服务器 memcached 也经常被拿来与 Redis 进⾏⽐较：这两者都可⽤于存储键值映射，
彼此的性能也相差⽆⼏，但是 Redis 能够⾃动以两种不同的⽅式将数据写⼊硬盘，并且 Redis 除了能存储
普通的字符串键之外，还可以存储其他4种数据结构，⽽ memcached 只能存储普通的字符串键。     

Redis 拥有两种不同形式的持久化⽅法，它们都可以⽤⼩⽽紧凑的格式将存储在内存中的数据写⼊硬盘：第⼀种
持久化⽅法为时间点转储（point-in-time dump），转储操作既可以在“指定时间段内有指定数量的写操作
执⾏”这⼀条件被满⾜时执⾏，又可以通过调⽤两条转储到硬盘（dump-to disk）命令中的任何⼀条来执⾏；
第⼆种持久化⽅法将所有修改了数据库的命令都写⼊⼀个只追加（append-only）⽂件⾥⾯，⽤户可以根据数
据的重要程度，将只追加写⼊设置为从不同步（sync）、每秒同步⼀次或者每写⼊⼀个命令就同步⼀次。    

为了扩展 Redis 的读性能，并为 Redis 提供故障转移（failover）⽀持，Redis 实现了主从复制特性：
执⾏复制的从服务器会连接上主服务器，接收主服务器发送的整个数据库的初始副本（copy）；之后主服务器
执⾏的写命令，都会被发送给所有连接着的从服务器去执⾏，从⽽实时地更新从服务器的数据集。因为从服务
器包含的数据会不断地进⾏更新，所以客户端可以向任意⼀个从服务器发送读请求，以此来避免对主服务器进⾏集
中式的访问。    

## 1.2 Redis 数据结构简介

Redis 可以存储键与 5 种不同数据结构类型之间的映射，这 5 种数据结构类型分别为（字符串）、（列表）、
（集合）、（散列）和（有序集合）。有⼀部分 Redis 命令对于这5种结构都是通⽤的，如 DEL、TYPE、
RENAME 等；但也有⼀部分 Redis 命令只能对特定的⼀种或者两种结构使⽤。    


结构类型 | 结构存储的值 | 结构的读写能力
---------|----------|---------
 STRING | 可以是字符串、整数或者浮点数 | 对整个字符串或者字符串的其中⼀部分执⾏操作；对整数和浮点数执⾏⾃增（increment）或者⾃减（decrement）操作
 LIST | 一个链表，链表上的每个节点都包含了一个字符串 | 从链表的两端推⼊或者弹出元素；根据偏移量对链表进⾏修剪（trim）；读取单个或者多个元素；根据值查找或者移除元素
 SET | 包含字符串的⽆序集合，并且被包含的每个字符串都是独⼀⽆⼆、各不相同 | 添加、获取、移除单个元素；检查⼀个元素是否存在于集合中；计算交集、并集、差集；从集合⾥⾯随机获取元素
 HASH | 包含键值对的无序散列表 | 添加、获取、移除单个键值对；获取所有键值对
 ZSET | 字符串成员（member）与浮点数分值（score）之间的有序映射，元素的排列顺序由分值的⼤⼩决定 | 添加、获取、删除单个元素；根据分值范围（range）或者成员来获取元素     

### 1.2.1 Redis 中的字符串

字符串命令：   

- GET: 获取存储在给定键中的值
- SET: 设置存储在给定键中的值
- DEL: 删除存储在给定键中的值（这个命令可以⽤于所有类型）    

### 1.2.2 Redis 中的列表

Redis对链表（linked-list）结构的⽀持使得它在键值存储的世界中独树⼀帜。⼀个列表结构可以有序地
存储多个字符串。    

列表命令：   

- LPUSH, RPUSH
- LPOP, RPOP
- LINDEX
- LRANGE

### 1.2.3 Redis 的集合

Redis 的集合和列表都可以存储多个字符串，它们之间的不同在于，列表可以存储多个相同的字符串，⽽集合
则通过使⽤散列表来保证⾃⼰存储的每个字符串都是各不相同的。    

集合命令：    

- SADD
- SREM
- SMEMBERS
- SISMEMBER
- SINTER
- SUNION
- SDIFF    

### 1.2.4 Redis 的散列

Redis的散列可以存储多个键值对之间的映射。和字符串⼀样，散列存储的值既可以是字符串又可以是数字值，
并且⽤户同样可以对散列存储的数字值执⾏⾃增操作或者⾃减操作。    

怎么好像不管是什么数据结构，最终存储的元素值都是字符串。。。    

- HSET
- HGET
- HGETALL
- HDEL     

### 1.2.5 Redis 的有序集合    

有序集合和散列一样，都用于存储键值对：有序集合的键被称为成员（member），每个成员都是各不相同的；
而有序集合的值则被称为分值（score）。分值必须为浮点数。有序集合是 Redis 里面唯一一个既可以根据
成员访问元素，又可以根据分值以及分值的排列顺序来访问元素的结构。    

- ZADD
- ZRANGE
- ZRANGEBYSCORE: 获取有序集合在给定分值范围内的所有元素
- ZREM    

本书使⽤冒号 : 来分隔名字的不同部分，例如 artical:92617 使⽤了冒号来分隔单词 article 和⽂章的
ID号 92617，以此来构建命名空间（namespace）。    

# 第 2 章 使用 Redis 构建 Web 应用

## 2.1 登录和 cookie 缓存

对于用来登录的 cookie，有两种常见的方法可以将登录信息存储在 cookie 里面：一种是签名（signed）
cookie，另一种是令牌（token）cookie。    

签名 cookie 通常会存储⽤户名，可能还有⽤户ID、⽤户最后⼀次成功登录的时间，以及⽹站觉得有⽤的
其他任何信息。除了⽤户的相关信息之外，签名 cookie 还包含⼀个签名，服务器可以使⽤这个签名来验证
浏览器发送的信息是否未经改动（⽐如将 cookie 中的登录⽤户名改成另⼀个⽤户）。    

令牌 cookie 会在 cookie ⾥⾯存储⼀串随机字节作为令牌，服务器可以根据令牌在数据库中查找令牌的
拥有者。随着时间的推移，旧令牌会被新令牌取代。     

那其实签名 cookie 相当于把用户信息保存在了 cookie 中，然后保存在了浏览器中。而令牌 cookie 并
不保存用户信息，服务器拿到令牌后，去数据库中搜索用户信息。    

除了⽤户登录信息之外，Fake Web Retailer还可以将⽤户的访问时长和已浏览商品的数量等信息存储到
数据库⾥⾯，这样便于将来通过分析这些信息来学习如何更好地向⽤户推销商品。    

⾸先，我们将使⽤⼀个散列来存储登录cookie令牌与已登录⽤户之间的映射。要检查⼀个⽤户是否已经登录，
需要根据给定的令牌来查找与之对应的⽤户，并在⽤户已经登录的情况下，返回该⽤户的ID。    

```js
function check_token(client, token) {
  return client.hget('login:', token)
}
```   

⽤户每次浏览页⾯的时候，程序都会对⽤户存储在登录散列⾥⾯的信息进⾏更新，并将⽤户的令牌和当前时间
戳添加到记录最近登录⽤户的有序集合⾥⾯；如果⽤户正在浏览的是⼀个商品页⾯，那么程序还会将这个商品
添加到记录这个⽤户最近浏览过的商品的有序集合⾥⾯，并在被记录商品的数量超过25个时，对这个有序集合
进⾏修剪。    

```js
function update_token(client, token, user, item=null) {
  const timestamp = Date.now();
  client.hset('login:', token, user);
  client.zadd('recent:', token, timestamp);
  if (item) {
    client.zadd('viewed:' + token, item, timestamp);
    client.zremrangebyrank('viewed:' + token, 0, -26);
  }
}
```    

因为存储会话数据所需的内存会随着时间的推移⽽不断增加，所以我们需要定期清理旧的会话数据。为了限制
会话数据的数量，我们决定只保存最新的1000万个会话。清理旧会话的程序由⼀个循环构成，这个循环每次
执⾏的时候，都会检查存储最近登录令牌的有序集合的⼤⼩，如果有序集合的⼤⼩超过了限制，那么程序就会
从有序集合⾥⾯移除最多100个最旧的令牌，并从记录⽤户登录信息的散列⾥⾯，移除被删除令牌对应的⽤户
的信息，并对存储了这些⽤户最近浏览商品记录的有序集合进⾏清理。与此相反，如果令牌的数量未超过限制，
那么程序会先休眠1秒，之后再重新进⾏检查。代码清单2-3展⽰了清理旧会话程序的具体代码。    

```js
const QUIT = false;
const LIMIT = 10000000;

function clean_sessions(client) {
  while (!QUIT) {
    let size = client.zcard('recent:');
    if (size <= LIMIT) {
      // time.sleep(1)
      // 这里 node 好像没有提供 sleep API，因此暂时这个功能没法做
      continue;
    }
    let end_index = Math.min(size - LIMIT, 100);
    let tokens = client.zrange('recent:', 0, end_index - 1);
    let session_keys = [];

    for (let token in tokens) {
      session_keys.push('viewed:' + token);
    }

    // client.delete(*session_keys); 这个是怎么转换
    // client.hdel('login:', *tokens)
    // client.zrem('recent:', *tokens);
  }
}
```    

## 2.2 使用 Redis 实现购物车

购物车的定义⾮常简单：每个⽤户的购物车都是⼀个散列，这个散列存储了商品ID与商品订购数量之间的映射。
对商品数量进⾏验证的⼯作由Web应⽤程序负责，我们要做的则是在商品的订购数量出现变化时，对购物车
进⾏更新：如果⽤户订购某件商品的数量⼤于0，那么程序会将这件商品的ID以及⽤户订购该商品的数量添加
到散列⾥⾯，如果⽤户购买的商品已经存在于散列⾥⾯，那么新的订购数量会覆盖已有的订购数量；相反地，
如果⽤户订购某件商品的数量不⼤于0，那么程序将从散列⾥⾯移除该条⽬。    

```js
function add_to_cart(client, session, item, count) {
  if (count <= 0) {
    client.hrem('card:' + session, item);
  } else {
    client.hset('card:' + session, item, count);
  }
}
```    

接着，我们需要对之前的会话清理函数进⾏更新，让它在清理旧会话的同时，将旧会话对应⽤户的购物车也
⼀并删除。代码略。    

## 2.3 网页缓存

```js
function cache_request(client, request, callback) {
  if (!can_cache(client, request)) {
    return callback(request);
  }

  let page_key = 'cache:' + hash_request(request);
  let content = client.get(page_key);

  if (!content) {
    content = callback(request);
    client.setex(page_key, content, 300);
  }
  return content;
}
```    