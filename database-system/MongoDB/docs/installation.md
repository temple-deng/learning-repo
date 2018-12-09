# Installation

## 在 Ubuntu 上安装

MongoDB 在其仓库上提供了对安装包的官方支持。这个仓库包含下列的包：   

+ mongodb-org: 一个 metapackage，会自动安装下面的四个组件包
+ mongodb-org-server: 包含 mongod 守护程序，相关联的初始脚本，还有配置文件 `/etc/mongod.conf`，
可以通过初始化脚本使用配置文件启动 mongod。
+ mongodb-org-mongos: 包含 mongos 守护程序
+ mongodb-org-shell: 包含 mongo shell
+ mongodb-org-tools: 包含这些工具 mongoimport bsondump, mongodump, mongoexport,
mongofiles, mongorestore, mongostat, and mongotop.    

具体的安装步骤：   

1. 导入包管理系统会使用的公钥   

```shell
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4
```   

2. 为 MongoDB 创建一份 list 文件   

创建 `/etc/apt/sources.list.d/mongodb-org-4.0.list` 文件。   

```
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/4.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.0.list
```    

3. 重启本地包数据库

```
sudo apt-get update
```   

4. 安装包

```
sudo apt-get install -y mongodb-org
```    

## 运行 MongoDB 社区版

1. 启动 MongoDB   

```
sudo service mongod start
```   

2. 验证 MongoDB 成功启动

检查日志文件 `/var/log/mongodb/mongod.log` 找到如下的一行：   

```
[initandlisten] waiting for connections on port 27017
```    

3. 终止 MongoDB

```
sudo service mongod stop
```   

4. 重启

```
sudo service mongod restart
```   

5. 使用 MongoDB   

使用 mongo shell 来使用 MongoDB, mongo shell 会连接到本地监听在 27017 端口上的 mongod。   

```
mongo
```   