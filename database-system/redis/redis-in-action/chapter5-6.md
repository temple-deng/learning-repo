# 第 5 章 使用 Redis 构建支持程序

<!-- TOC -->

- [第 5 章 使用 Redis 构建支持程序](#第-5-章-使用-redis-构建支持程序)
  - [5.1 使用 Redis 来记录日志](#51-使用-redis-来记录日志)
- [第 6 章 使用 Redis 构建应用程序组](#第-6-章-使用-redis-构建应用程序组)
  - [6.2 分布式锁](#62-分布式锁)
    - [6.2.2 简易锁](#622-简易锁)
    - [6.2.3 使用 Redis 构建锁](#623-使用-redis-构建锁)

<!-- /TOC -->

## 5.1 使用 Redis 来记录日志

在Linux和Unix的世界中，有两种常见的记录⽇志的⽅法。第⼀种是将⽇志记录到⽂件⾥⾯，然后随着时间
流逝不断地将⼀个又⼀个⽇志⾏添加到⽂件⾥⾯，并在⼀段时间之后创建新的⽇志⽂件。包括Redis在内的
很多软件都使⽤这种⽅法来记录⽇志。但这种记录⽇志的⽅式有时候可能会遇上⿇烦：因为每个不同的服务
都会创建不同的⽇志，⽽这些服务轮换（rolling）⽇志的机制也各不相同，并且也缺少⼀种能够⽅便地聚合
所有⽇志并对其进⾏处理的常⽤⽅法。    

syslog 服务是第⼆种常⽤的⽇志记录⽅法，这个服务运⾏在⼏乎所有Linux服务器和Unix服务器的514号
TCP端口和UDP端口上⾯。syslog 接受其他程序发来的⽇志消息，并将这些消息路由（route）⾄存储在硬盘
上的各个日志文件里面，除此之外，syslog还负责旧⽇志的轮换和删除⼯作。通过配置，syslog甚⾄可以将
⽇志消息转发给其他服务来做进⼀步的处理。因为对指定⽇志的轮换和删除⼯作都可以交给syslog来完成，
所以使⽤syslog服务⽐直接将⽇志写⼊⽂件要⽅便得多。   

⽆论读者使⽤上⾯列举的两种⽇志记录⽅法中的哪⼀种，都最好考虑把系统⽬前的syslog守护进程（通常是
Rsyslogd）替换成 syslog-ng。因为我经过使⽤并配置 Rsyslogd 和 syslog-ng 之后，发现 syslog-ng
⽤于管理和组织⽇志消息的配置语⾔使⽤起来更简单⼀些。另外，尽管因为时间和篇幅所限 我没办法在书中
构建⼀个处理syslog消息并将消息存储到Redis⾥⾯的服务，但对于那些需要在处理请求时⽴即执⾏的操作，
以及那些可以在请求处理完毕之后再执⾏的操作（如记录⽇志和更新计数器）来说，这种服务⾮常适合⽤作
介于这两种操作之间的间接层。    

syslog的转发功能可以将不同的⽇志分别存储到同⼀台服务器的多个⽂件⾥⾯，这对于长时间地记录⽇志
⾮常有帮助（记得备份）。    

# 第 6 章 使用 Redis 构建应用程序组

## 6.2 分布式锁

⼀般来说，在对数据进⾏“加锁”时，程序⾸先需要通过获取（acquire）锁来得到对数据进⾏排他性访问的
能⼒，然后才能对数据执⾏⼀系列操作，最后还要将锁释放（release）给其他程序。对于能够被多个线程
访问的共享内存数据结构（shared-memory data structure）来说，这种“先获取锁，然后执⾏操作，
最后释放锁”的动作⾮常常见。Redis 使⽤ WATCH 命令来代替对数据进⾏加锁，因为 WATCH 只会在数据
被其他客户端抢先修改了的情况下通知执⾏了这个命令的客户端，⽽不会阻⽌其他客户端对数据进⾏修改，
所以这个命令被称为乐观锁（optimistic locking）。    

分布式锁也有类似的“⾸先获取锁，然后执⾏操作，最后释放锁”动作，但这种锁既不是给同⼀个进程中的多个
线程使⽤，也不是给同⼀台机器上的多个进程使⽤，⽽是由不同机器上的不同Redis客户端进⾏获取和释放的。
何时使⽤以及是否使⽤ WATCH 或者锁取决于给定的应⽤程序：有的应⽤不需要使⽤锁就可以正确地运⾏，
⽽有的应⽤只需要使⽤少量的锁，还有的应⽤需要在每个步骤都使⽤锁，不⼀⽽⾜。    

我们没有直接使⽤操作系统级别的锁、编程语⾔级别的锁，或者其他各式各样的锁，⽽是选择了花费⼤量时间
去使⽤Redis构建锁，这其中⼀个原因和范围（score）有关：为了对Redis存储的数据进⾏排他性访问，
客户端需要访问⼀个锁，这个锁必须定义在⼀个可以让所有客户端都看得见的范围之内，⽽这个范围就是
Redis本⾝，因此我们需要把锁构建在Redis⾥⾯。另⼀⽅⾯，虽然Redis提供的 SETNX 命令确实具有基本
的加锁功能，但它的功能并不完整，并且也不具备分布式锁常见的⼀些⾼级特性，所以我们还是需要⾃⼰动⼿
来构建分布式锁。   

### 6.2.2 简易锁

因为客户端即使在使⽤锁的过程中也可能会因为这样或那样的原因⽽下线，所以为了防⽌客户端在取得锁之后
崩溃，并导致锁⼀直处于“已被获取”的状态，最终版的锁实现将带有超时限制特性：如果获得锁的进程未能在
指定的时限内完成操作，那么锁将⾃动被释放。    

虽然很多Redis⽤户都对锁（lock）、加锁（locking）及锁超时（lock timeouts）有所了解，但遗憾
的是，⼤部分使⽤Redis实现的锁只是基本上正确，它们发⽣故障的时间和⽅式通常难以预料。下⾯列出了
⼀些导致锁出现不正确⾏为的原因，以及锁在不正确运⾏时的症状。    

- 持有锁的进程因为操作时间过长而导致锁被自动释放，但进程本身并不知晓这一点，甚至还可能会错误地
释放掉了其他进程持有的锁。
- 一个持有锁并打算长时间操作的进程已经崩溃，但其他想要获取锁的进程不知道哪个进程持有着锁，也无法
检测出持有锁的进程已经崩溃，只能白白地浪费时间等待着锁被释放。
- 在⼀个进程持有的锁过期之后，其他多个进程同时尝试去获取锁，并且都获得了锁。
- 上面提到的第一种情况和第三种情况同时出现，导致有多个进程获得了锁，而每个进程都以为自己是唯一
一个获得锁的进程。     

### 6.2.3 使用 Redis 构建锁

本节接下来要介绍的是锁实现的第1个版本，这个版本的锁要做的事就是正确地实现基本的加锁功能，⽽之后
的⼀节将会介绍如何处理过期的锁以及因为持有者崩溃⽽⽆法释放的锁。    

为了对数据进⾏排他性访问，程序⾸先要做的就是获取锁。SETNX 命令天⽣就适合⽤来实现锁的获取功能，
这个命令只会在键不存在的情况下为键设置值，⽽锁要做的就是将⼀个随机⽣成的128位UUID设置为键的值，
并使⽤这个值来防⽌锁被其他进程取得。   

如果程序在尝试获取锁的时候失败，那么它将不断地进⾏重试，直到成功地取得锁或者超过给定的时限为⽌:   

```js
function acquire_lock(client, lockname, acquire_timeout=10) {
  const id = uuid.uuid4();    // 显然这个生成 uuid 的函数需要我们自行处理
  const end = Date.now() + acquire_timeout;
  while (Date.now() < end) {
    if (client.setnx("lock:" + lockname, id)) {
      return id;
    }
    time.sleep(.001);   // 现在这个功能 node 中也不具备
  }
  return false
}
```    

它会使⽤ SETNX 命令，尝试在代表锁的键不存在的情况下，为键设置⼀个值，以此来获取锁；在获取锁失败
的时候，函数会在给定的时限内进⾏重试，直到成功获取锁或者超过给定的时限为⽌（默认的重试时限为10秒）。    

因为在程序持有锁期间，其他客户端可能会擅⾃对锁进⾏修改，所以锁的释放操作需要和加锁操作⼀样⼩⼼
谨慎地进⾏。下面的函数展⽰了锁释放操作的实现代码：函数⾸先使⽤ WATCH 命令监视代表锁的键，接着
检查键⽬前的值是否和加锁时设置的值相同，并在确认值没有变化之后删除该键（这个检查还可以防⽌程序
错误地释放同⼀个锁多次）。    

```python
def release_lock(conn, lockname, id) :
  pipe = conn.pipeline(True)
  lockname = 'lock:' + lockname

  while True:
    try:
      pipe.watch(lockname)
      if pipe.get(lockname) == id:
        pipe.multi()
        pipe.delete(lockname)
        pipe.execute()
        return True
      pipe.unwatch()
      break
    except redis.exceptions.WatchError:
      pass
return False
```   

算了先放弃了。。。。


