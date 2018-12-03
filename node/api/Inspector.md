# Inpsector

`inspector` 模块为与 V8 inspector 交互提供了 API。    

```js
const inspector = require('inspector');
```    

## inspector.close()

deactivate inspector。在没有活跃的连接前会一直阻塞（嘛个意思）。    

## inspector.console

+ &lt;Object&gt; 用来给远程 inspector console 发送消息的对象

```js
require('inspector').console.log('a message');
```    

## inspector.open(\[port\[,host\[,wait\]\]\])

+ `port` number inspector 连接监听端口。可选参数，默认值可以由 CLI 指定
+ `host` string
+ `wait` boolean 在连接成功建立前一直阻塞，默认 `false`    

在给定的端口和主机上激活 inspector。等价于 `node --inspect=[[host:]port]`。    

## inspector.url()

+ Returns: stirng | undefined    

返回激活的 inspector 的 URL。   

## Class: inspector.Session

