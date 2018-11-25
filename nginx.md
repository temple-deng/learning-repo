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

