# redis

<!-- TOC -->

- [redis](#redis)
  - [Usage Example](#usage-example)
    - [Sending Commands](#sending-commands)
  - [API](#api)
    - [连接和其他的事件](#连接和其他的事件)
    - [redis.createClient()](#rediscreateclient)
    - [client_auth(password[, callback])](#client_authpassword-callback)
    - [backpressure](#backpressure)
    - [client.quit()](#clientquit)
    - [client.end(flush)](#clientendflush)
    - [client.unref()](#clientunref)
    - [友好的 hash 命令](#友好的-hash-命令)
    - [发布订阅](#发布订阅)
    - [订阅事件](#订阅事件)
    - [client.multi([commands])](#clientmulticommands)
    - [client.batch([commands])](#clientbatchcommands)
  - [监控模式](#监控模式)
  - [Extras](#extras)
    - [client.server_info](#clientserver_info)
    - [redis.print()](#redisprint)
    - [多单词的命令](#多单词的命令)
    - [client.duplicate([options][, callback])](#clientduplicateoptions-callback)
    - [client.send_command(command_name[, [args][, callback]])](#clientsend_commandcommand_name-args-callback)
    - [client.add_command(command_name)](#clientadd_commandcommand_name)
    - [client.connected](#clientconnected)
    - [client.command_queue_length](#clientcommand_queue_length)
    - [client.offline_queue_length](#clientoffline_queue_length)

<!-- /TOC -->

npm 上的 redis 库。    

安装： `npm install redis`。     

## Usage Example

```js
const redis = require('redis');
const client = redis.createClient();

client.on('error', (e) => {
  console.log(`Error: ${e}`);
});

client.set('string key', 'string val', redis.print);
client.hset('hash key', 'hashtest 1', 'some value', redis.print);
client.hset(['hash key', 'hashtest 2', 'some other value'], redis.print);
client.hkeys('hash key', (err, replies) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(replies.length + " replies:");
  replies.forEach((reply, i) => {
    console.log(" " + i + ": " + reply);
  });
  client.quit();
});
```    

最终输出：   

```
Reply: OK
Reply: 1
Reply: 1
2 replies:
 0: hashtest 1
 1: hashtest 2
```    

### Sending Commands

每个 Redis 命令都在 `client` 对象通过一个函数暴露出来。所有的函数都接受一个数组参数和一个可选的
回调函数参数，或者是将数组参数分拆开来，最后外加回调函数。    

```js
client.hmset(["key", "test keys 1", "test val 1", "test keys 2", "test val 2"], function (err, res) {});
// Works the same as
client.hmset("key", ["test keys 1", "test val 1", "test keys 2", "test val 2"], function (err, res) {});
// Or
client.hmset("key", "test keys 1", "test val 1", "test keys 2", "test val 2", function (err, res) {});
```    

对服务器的恢复只做了最小化的解析。例如，服务器响应为整数时就返回 JS 数值，响应数组就返回 JS 数组。
`HGETALL` 返回一个对象。所有的字符串可能以字符串或者 buffer 的形式返回，取决于我们的设置。注意，
如果发送 null, undefined, bool 值会导致值被编码为一个字符串。    

## API

### 连接和其他的事件

`client` 会触发一系列关于与服务器连接状态信息的事件。   

- ready: 连接建立后触发。ready 事件前调用的命令会进入队列，最终会在这个事件触发前重播。
- connect: 与服务器的流建立后触发。
- reconnecting: 连接断开后尝试重连时触发。监听函数有一个对象参数，包含 `delay`(ms) 和
`attempt` 属性
- error: 任何连接错误以及其他的错误都会触发。
- end: 连接关闭时触发
- warning: 如果不要求密码但是我们设置了密码，或者如果我们使用了废弃的 option, function。    

### redis.createClient()

- `redis.createClient([options])`
- `redis.createClient(unix_socker[, options])`
- `redis.createClient(redis_url[, options])`
- `redis.createClient(port[, host][, options])`    

options 配置项：   

- host(127.0.0.1)
- port(6379)
- path(null): UNIX 套接字
- url(null): 服务器的 URL，格式 `[redis:]//[[user][:password@]][host][:port][/db-number][?db=db-number[&password=bar[&option=value]]]`
- string_numbers(null): 设置为 true 时，redis 会将 Redis 的数值作为字符串返回。如果我们要
处理大整数时可能有用。
- return_buffers(false)
- detect_buffers(false): 类似 return_buffers，但是是对每条命令进行控制，return_buffers
是对所有的命令生效。
- socket_keepalive(true): 如果设为 true，就启用 keep-alive 功能
- no_ready_check(false): 当建立了到服务器的连接时，服务器可能仍在从磁盘上加载数据库。当加载时，
服务器不会对任意的命令做出响应。为了在这种情况下工作，node_redis 通常有一个 ready check 流程，
这个流程是通过发送 INFO 命令来完成的。INFO 命令的响应表明了服务器是否已经准备好接收命令了。当
准备好时，node_redis 会触发一个 ready 事件
- enable_offline_queue(true): 默认情况下，如果当前没有到服务器的活跃着的连接，命令会被加入
到队列中，并在连接建立后立刻得到执行。如果把这个选项设为 true，那么就不会再添加到队列中，回调会
立刻执行，带有一个 error 参数。
- retry_unfulfilled_commands(false): 如果设为 true，所有在连接中断期间没完成的命令都会
重试。话说这个和前面的进入是怎样的一种关系呢。
- password(null)
- db(null)
- family(IPv4)
- disable_resubscribing(false): 如果设为 true，客户端不会在丢失连接后重新订阅
- rename_commands(null): 就是重命名命令的意思吧
- tls(null): 一个包含传递给 `tls.connect` 的 option 对象，以便建立到 Redis 的 tls 连接
- prefix(null): 一个用来在所有使用的键前前缀的字符串。不过需要注意的是 `keys` 命令不会被前缀。
- retry_strategy(function): 一个接收 option 对象做参数的函数，参数对象包括重试的 `attempt`,
`total_retry_time` 表明自从上次连接后经过了多少时间，`error` 表明连接断开的原因，`times_connected`
总共丢失了多少。如果这个函数返回了一个数值，那么会在这个数值指定的毫秒后进行重连，如果是非数值，
则不会再进行重连，队列中的所有命令会使用错误返回。    

### client_auth(password[, callback])

当我们连接到一台要求认证的服务器时，在建立连接后，发送的第一条指令必须是 `AUTH`。这种情况在
重连，ready 检查等场景下会变得很棘手。为了简化这个过程，`client.auth()` 会存储 `password`，
并在每次连接建立后发送，包括重连。不过 `callback` 仅在第一次发送 `AUTH` 命令时调用一次。   

### backpressure

客户端通过 `client.stream` 暴露出来了使用的流，`client.should_buffer` 表明了流或者客户端
是否必须缓存命令。把这两者结合起来，在发送命令前通过检查缓存状态并监听流的 drain 事件可以实现
backpressure。    

### client.quit()    

发送 quit 命令到服务器，并在处理完所有运行中的命令后立刻结束。    

### client.end(flush)

强制关闭与服务器的连接。注意关闭连接并保护等到所有的回复都被解析后，如果想要优雅地结束，使用
`client.quit()`。    

如果 flush 为 false，则所有的运行中的命令都会 silently fail。    

### client.unref()

如果调用了这个函数，那么程序会在没有命令在运行中后立刻关闭。    

### 友好的 hash 命令

大部分的 Redis 命令都接受一个字符串或者一个字符串数组做参数，并且使用一个字符串或者一个字符串
数组作为回复。当处理哈希表时的话，提供了一些额外的情况。   

**client.hgetall(hash, callback)**    

结果是被转换为一个对象。    

**client.hmset(hash, obj[, callback])**    

```js
client.HMSET(key2, {
  "0123456789": "abcdefghij",
  "some manner of key": "a type of value"
});
```    

### 发布订阅

```js
const redis = require('redis');
const sub = redis.createClient();
const pub = redis.createClient();
let msg_count = 0;

sub.on('subscribe', function(channel, count) {
  pub.publish('a nice channel', 'I am sending a message');
  pub.publish('a nice channel', 'I am sending a second message');
  pub.publish('a nice channel', 'I am sending my last message');
});

sub.on('message', function(channel, message) {
  console.log('sub channel ' + channel + ": " + message);
  msg_count += 1;
  if (msg_count === 3) {
    sub.unsubscribe();
    sub.quit();
    pub.quit();
  }
});

sub.subscribe('a nice channel');
```   

当一个客户端进行 SUBSCRIBE 或者 PSUBSCRIBE 操作后，连接就进入了 "subscriber" 模式。这个时间
点起，只有对订阅的修改和退出命令才是有效的。当订阅被设置为空时，连接又回到了常规模式。   

### 订阅事件

如果客户端包含一个活跃状态的订阅，它可能触发以下事件：   

- "message"(channel, message): 在指定订阅上每次收到信息时触发。
- "pmessage"(pattern, channel, message): 每个与给定 pattern 的订阅每次收到消息时触发。
- "message_buffer"(channel, message): 类似于 message 事件，只不过每次提供的是 buffer。
如果我们同时监听了 message 和 message_buffer 事件，则它仍然会提供一个字符串
- "pmesssage"(pattern, channel, message)
- "subscribe"(channel, count): 客户端会触发 `subscribe` 事件作为对 SUBSCRIBE 命令的响应。
这个 count 不是很理解，应该是目前的订阅总数
- "psubscribe"(pattern, count): PSUBSCRIBE 命令的响应
- "unsubscribe"(channel, count): UNSUBSCRIBE 命令的响应，当 count 为 0 时，客户端会离开
订阅者模式并不再触发新的订阅者事件
- "psubscribe"(pattern, count)

### client.multi([commands])    

在发出 `EXEC` 命令前，`MULTI` 命令会先入队等待，直到发出 `EXEC` 命令后，Redis 会原子运行所有的
MULTI 命令。调用 `client.multi()` 返回一个独立的 `Multi` 对象。如果队列中任意的队列出了错，
所有的命令会回滚，并且所有命令不再会被执行（话说这和我了解的不一样啊）。     

```js
const redis = require('redis');
const client = redis.createClient();
let set_size = 20;

client.sadd("bigset", "a member");
client.sadd("bigset", "another member");

while (set_size > 0) {
  client.sadd("bigset", "member " + set_size);
  set_size--;
}

client.multi()
  .scard("bigset")
  .smembers("bigset")
  .keys("*", function(err, replies) {
    // 这的先打印
    console.log('lllll')
    client.mget(replies, redis.print);
  })
  .dbsize()
  .exec((err, replies) => {
    console.log("MULTI got " + replies.length + " replies");
    replies.forEach(function (reply, index) {
      console.log('Reply ' + index + ": " + reply.toString());
    });
  });
```   

**Multi.exec([callback])**    

`client.multi()` 是一个返回 `Multi` 对象的构造函数。`Multi` 共享了 `client` 对象上的所有
命令方法。`Multi` 上的方法会入队，直到 `Multi.exec()` 执行。    

如果我们的代码包含有语法错误，会抛出一个 EXECABORT 的错误，所有的命令会被中止掉。错误对象上的
`.errors` 属性包含有准确的错误信息。如果所有的命令都成功入队然后在 Redis 处理命令过程中抛出了
错误，那这个错误会包含在返回的结果数组中。这种情况下，除了失败的那条命令外其他的命令都会正常的执行。   

**Multi.exec_atomic([callback])**    

等同于 Multi.exec，唯一的不同点是一条单一的命令不会使用事务。    

### client.batch([commands])

类似于 .multi，但是不使用事务的形式。如果我们想要一次性执行多个命令，就可以使用这个接口。   

直到 `EXEC` 命令发出前，`BATCH` 命令会先入队，所有的命令会被 Redis 原子运行。接口返回一个
`Batch` 对象。`batch` 和 `multi` 唯一的不同点就是不使用事务。需要注意错误也是在结果中。    

## 监控模式

Redis 提供了 `MONITOR` 命令，可以看到服务器在所有连接上收到的所有命令。    

任意的客户端发送的每条命令都会触发一个 `monitor` 事件，即便是监控客户端自身也是一样。monitor
事件的回调会收到一个来自服务器的时间戳，一个命令的数组，还有原生的监控字符串。   

## Extras

### client.server_info

在 ready check 完成后，INFO 命令的结果会存储在 `client.server_info` 对象中。    

`version` 是包含在一个数组中：   

```
> client.server_info.redis_version
'2.3.0'
> client.server_info.versions
[ 2, 3, 0 ]
```    

### redis.print()    

一个在测试时用来展示返回值的便捷方法。    

### 多单词的命令

如果要执行一些多个单词组成的命令，例如 `SCRIPT LOAD` 或者 `CLIENT LIST`，将第二个单词传递
为第一个参数：   

```js
client.script('load', 'return 1');
client.multi().script('load', 'return 1').exec(...);
client.multi([['script', 'load', 'return 1']]).exec(...);
```    

### client.duplicate([options][, callback])

复制目前的所有选项，然后返回一个新的 redisClient 实例。传递给 `duplicate` 的选项会替换掉原来
的选项。回调会在新的连接进行完 ready check 后执行。   

### client.send_command(command_name[, [args][, callback]])

目前来说，所有的 Redis 命令在 client 上都有对应的方法。不过如果后续 Redis 引入了新的命令，
或者我们想添加独立的命令，可以使用这个方法来直接给 Redis 发送命令。    

### client.add_command(command_name)

给原型上添加新的命令。    

### client.connected

连接状态，布尔值。   

### client.command_queue_length

发送给了服务器但还没有得到回复的命令的个数。可以用来限制队列的长度。   

### client.offline_queue_length

一个将来的连接已入队的命令的个数。    

Last Update: 2019-02-01