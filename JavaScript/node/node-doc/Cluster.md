# Cluster

How It Works
Class: Worker
Event: 'disconnect'
Event: 'error'
Event: 'exit'
Event: 'listening'
Event: 'message'
Event: 'online'
worker.disconnect()
worker.exitedAfterDisconnect
worker.id
worker.isConnected()
worker.isDead()
worker.kill([signal='SIGTERM'])
worker.process
worker.send(message[, sendHandle][, callback])
worker.suicide
Event: 'disconnect'
Event: 'exit'
Event: 'fork'
Event: 'listening'
Event: 'message'
Event: 'online'
Event: 'setup'
cluster.disconnect([callback])
cluster.fork([env])
cluster.isMaster
cluster.isWorker
cluster.schedulingPolicy
cluster.settings
cluster.setupMaster([settings])
cluster.worker
cluster.workers   

# Cluster  

一个单一的 Node.js 实例时运行在单线程中的。为了能利用多核系统的优势，我们有时需要启动一组Node.js进程来处理负载。    

集群模块可以让我们能容易的创建出共享服务器端口的子进程。    
