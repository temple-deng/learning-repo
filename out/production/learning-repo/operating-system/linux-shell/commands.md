## 命令

文件相关     

- `cd`
- `pwd`
- `ls`
- `touch`
- `cp`
- `ln` 默认硬链接 `-s` 软链接。只能对处于同一存储媒体的文件创建硬链接。要想在不同存储媒体的文件之间创建链接，只能使用符号链接。
- `mv`
- `rm`

目录相关：   

- `mkdir`
- `rmdir`


文件内容：   

- `file` 查看文件类型
- `cat`
- `more`
- `less`
- `tail`
- `head`


监测程序：   

- `ps`
- `top`    

结束进程：   

- `kill`
- `killall`

监测磁盘空间：    

- `mount`
- `umount`
- `df`
- `du`    

处理数据文件：    

- `sort`: `sort -t ':' -k 3 -n /etc/passwd`
- `grep`: `grep [options] pattern [file]`     
- `gzip`
- `tar`    

shell 初探：   

- `sleep`
- `jobs`
- `coproc`
- `which`
- `type`
- `history`
- `alias`    

环境变量：    

- `env`
- `printenv`
- `set`
- `export`
- `unset`


用户相关：   

- `useradd`
- `userdel`
- `usermod`
- `passwd`
- `groupadd`   

权限系统：   

- `umask`
- `chmod`
- `chown`
- `chgrp`


包管理：   

- `aptitude`: `aptitude search package`, `aptitude install package`, `aptitude purge` `aptitude remove`
- `dpkg`
- `yum list installed`, `yum install package_name`, `yum update package`, `yum remove`, `yum erase`