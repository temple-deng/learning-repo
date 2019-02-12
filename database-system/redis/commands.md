# Commands

暂时先列举一些常用的吧。    

## APPEND

**APPEND key value**    

时间复杂度：O(1)。有点像我们的动态数组，均摊复杂度是 O(1)，每次动态分配空间时，都加倍的分配。   

在字符串的末尾追加值。   

返回值：Integer reply。操作完成后字符串的长度。    

# 功能性的指令

## AUTH

**AUTH password**    

通过在配置文件中配置 `requirepass` 指令可以让服务器要求密码验证。不过密码怎么配置啊。    

如果 `password` 和配置文件中的密码相匹配，服务器会用 OK 响应并开始接受命令。否则会返回一个错误
给客户端。    

## ECHO

**ECHO message**    

返回 message。   

## PING

**PING [message]**    

如果没有提供任何的参数的话，返回 `PONG`，否则就返回提供的参数的副本。貌似仅限一个参数。   

如果客户端订阅了 channel 或 pattern，会在第一个位置返回 "pong"，第二个位置为空。除非提供了
参数，就返回参数的副本。    

## QUIT

要求服务器关闭连接。连接会在所有运行中的命令都将回复写入客户端后关闭。   

返回值：Simple string reply：OK.    

## SELECT

**SELECT index**    

选择给定索引的 Redis 逻辑数据库。通常新建立的连接都是使用数据库 0。   

不同的数据库只是一种命名空间的形式。所有的数据库最终都会持久化存储到同一个 RDB/AOF 文件中。然而
不同的数据库可以有同名的键。并且在数据库层面有一些特定的指令，例如 FLUSHDB, SWAPDB, RANDOMKEY。    

一般来说，使用不同的数据库只是为了分离相同的键名。当使用 Redis 集群时，不能使用 SELECT 命令，
因为 Redis 集群只支持使用数据库 0。    

选择数据库是针对连接而言的，因此当客户端重连的时候应该重新选择数据库。    

返回值：Simple string reply。    

## SWAPDB

**SWAPDB index index**    

交换两个数据库，因此所有连接到给定数据的客户端现在都会看到另一个数据库的数据了。    

返回值：Simple string reply。    

