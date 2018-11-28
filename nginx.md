# Nginx

# 第 1 章 安装 Nginx 及第三方模块

## 1.1 使用包管理器安装 Nginx

+ Linux(deb-based): `sudo apt-get install nginx`
+ Linux(rpm-based): `sudo yum install nginx`
+ FreeBSD: `sudo pkg_install -r nginx`    

### 1.1.1 在 CentOS 上安装 Nginx

使用下面的方式在 `yum` 配置中添加 Nginx 仓库：   

```shell
sudo vi /etc/yum.repos.d/nginx.repo
[nginx]
name=nginx repo
baseurl=http://nginx.org/packages/centos/7/$basearch/
gpgcheck=0
enabled=1
```    

然后执行以下命令安装 nginx:   

```
sudo yum install nginx
```   

### 1.1.2 在 Debian 上安装 Nginx

1. 从 http://nginx.org/keys/nginx_signing.key 下载 Nginx 签名的密钥，将其添加到 apt
keyring 中：   

```
sudo apt-key add nginx_signing.key
```   

2. 在文件 /etc/apt/sources.list 结尾处添加 nginx.org 仓库：   

```
vi /etc/apt/sources.list
deb http://nginx.org/packages/debian/ jessie nginx
deb-src http://nginx.org/packages/debian jessie nginx
```    

3. 安装 Nginx

```
sudo apt-get update
sudo apt-get install nginx
```    

## 1.2 从源代码安装 Nginx

### 1.2.1 搭建构建环境

除了编译器之外，还需要 OpenSSL 和 Perl Compatible Regular Expressions(PCRE) 库。

### 1.2.2 源代码编译

首先下载安装包并解压：    

```shell
$ mkdir $HOME/build
$ cd $HOME/build && tar xzf nginx-<version-number>.tar.gz
```    

配置：   

```shell
$ cd $HOME/build/nginx-<version-number> && ./configure
```   

编译：   

```shell
$ make && sudo make install
```   

通用配置选项：   


选项 | 描述
---------|----------
 `--prefix=<path>` | 安装根路径，所有其他的安装路径都是相对于这个路径，默认是 `/usr/local/nginx`
 `--sbin-path=<path>` | Nginx 可执行文件的路径，如果未指定的话，相对于 prefix，默认 `/usr/local/nginx/sbin/nginx`
 `--conf-path=<path>` | Nginx 寻找其配置文件的路径 `/usr/local/nginx/conf/nginx.conf`
 `--error-log-path=<path>` | 错误日志文件的位置 `/usr/local/nginx/logs/error.log`
 `--pid-path=<path>` | 主进程 pid 文件的位置 `/usr/local/nginx/logs/nginx.pid`
 `--lock-path=<path>` | 共享内存 mutex 锁文件的位置
 `--user=<user>` | 可以运行进程的用户
 `--group=<group>` | 可以运行进程的用户组
 `--with-file-aio` | 启用异步 I/O
 `--with-debug` | 启用 debug 日志   

优化配置选项：   


选项 | 描述
----------|---------
 `--with-cc=<path>` | C 编译器的位置
 `--with-cpp=<path>` | C 预处理器
 `--with-cc-opt=<options>` | 略
 `--with-ld-opt=<options>` | 略
 `--with-cpu-opt=<cpu>` | 略