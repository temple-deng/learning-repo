# Node 项目的部署

<!-- TOC -->

- [Node 项目的部署](#node-项目的部署)
  - [远程登录服务器](#远程登录服务器)
    - [ssh](#ssh)
  - [增强服务器安全等级](#增强服务器安全等级)
    - [修改 ssh 端口](#修改-ssh-端口)
    - [配置 iptables](#配置-iptables)
  - [搭建 Nodejs 环境](#搭建-nodejs-环境)

<!-- /TOC -->

生产环境所需要素：    

+ 购买自己的域名
+ 购买自己的服务器
+ 域名备案
+ 配置服务器应用环境
+ 安装配置数据库
+ 项目远程部署发布与更新

## 远程登录服务器

`ssh root@120.26.235.4`    

### ssh

生成 RSA 密钥：`ssh-keygen -t rsa -b 4096 -C "email"`   

开启 ssh 代理：`eval "$(ssh-agent -s)"`   

把密钥加入代理中：`ssh-add ~/.ssh/id_rsa`    

在服务器用户主目录下 .ssh 目录下生成 authorized_keys 文件： `vi authorized_keys`

然后把本地主机的公钥复制到服务器上的这个文件中。之后可能需要进行必要的授权：
`chmod 600 authorized_keys`，然后重启 ssh 服务 `sudo service ssh restart`   

## 增强服务器安全等级

### 修改 ssh 端口

`sudo vim /etc/ssh/sshd_config` 配置端口号，将 `UseDNS` 设为 `no` 将 `AllowUsers`
设置成我们的用户名。    

然后就是 `ssh -p <port> <username>@<ip>`   

### 配置 iptables

清空 iptables 规则 `sudo iptables -F`    

编辑配置 `sudo vim /etc/iptables.up.rules`    

```txt
*filter

-A INPUT -m state --state ESTABLISHED, RELATED -j ACCEPT

-A OUTPUT -j ACCEPT

-A INPUT -p tcp --dport 443 -j ACCEPT
-A INPUT -p tcp --dport 80 -j ACCEPT

-A INPUT -p tcp -m state --state NEW --dport <ssh-port> -j ACCEPT

-A INPUT -p icmp -m icmp --icmp-type 8 -j ACCEPT

-A INPUT -m limit --limit 5/min -j LOG --log-prefix "iptables denied:" --log-level 7

-A INPUT -j REJECT
-A FORWARD -j REJECT

COMMIT
```   

告诉 iptables 配置文件在哪 `sudo iptables-restore < /etc/iptables.up.rules`    

激活防火墙 `sudo ufw enable`。    

## 搭建 Nodejs 环境

修改最大监听文件数量 `echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`    

pm2 `pm2 start <node-app>`   