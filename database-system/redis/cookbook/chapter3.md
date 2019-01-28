# 第 3 章 数据特性

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

