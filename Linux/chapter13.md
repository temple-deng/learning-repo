# 第十三章 Linux 账号管理与 ACL 权限设置

## 13.1 Linux 的账号和群组

### 13.1.2 使用者账号

/etc/passwd 文件的结构。     

每一行代表一个账号，有许多账号本来就是系统正常运行所必须要的，可以简称其为系统账号。每一行使用分号分隔出7个字段，分别是：     

1. 账号名称
2. 密码
3. UID，0为系统管理员，1-999 是系统账号，1000-60000是可登录账号，就是一般人用的
4. GID
5. 使用者信息说明栏
6. 主文件夹
7. shell

/etc/shadow 的文件结构。     

共有9个字段，用途如下：      

1. 账号名称
2. 密码，经过密码过的密码
3. 最近变动密码的日期，不过这个日期是以197011开始累加的日期，一天就加1
4. 密码不可被变动的天数，这个字段记录了这个密码在最近一次被修改后需要经过几天才可以被再次变更，如果是0的话表示随时可以变动
5. 密码需要重新变更的天数
6. 密码需要变更期限前的警告天数
7. 密码过期后的账号宽限时间
8. 账号失效日期
9. 最后一个字段保留    

### 13.1.3 群组

**/etc/group** 的文件结构。     

这个文件记录了群组名与GID。每一行有4个字段。意义分别为：       

1. 群组名
2. 群组密码
3. GID
4. 此群组支持的账号名称，比如想让 dengbo 和 alex 也加入 root 群组，直接在 root 那一行后面加上 `dengbo,alex`        

在新版的 Linux中，初始群组的用户群已经不会加入在第四个字段。     

**有效群组和初始群组**     

每个使用者在其 /etc/passwd 里面第四栏有所谓的GID，那个GID 就是所谓的初始群组，也就是说，当使用者一登录系统，立刻就拥有这个群组的相关权限的意思，有效群组是指当我们创建新的文件时，这个文件所属的群组。       

**groups：有效和支持群组的观察**    

输入 `groups` 就可以知道当前用户所支持的群组。第一个输出的群组即为有效群组。     

**newgrp：有效群组的切换**      

使用 `newgrp groupname` 切换有效群组，当然，groupname 必须是用户所属的群组之一。     

不过需要注意的是，这里命令是以另一个 shell 提供这个功能的，所以，切换后用户是以另一个 shell 登录的。     

加入一个群组的方式有两种，一种是系统管理员通过 `usermod` 加入，另一组是群组管理员通过 `gpasswd` 加入。     

**/etc/gshadow**     

这个文件几乎与 `/etc/group` 完全相同，不同在第二栏密码栏部分，如果密码栏上面是 `!` 或者为空时，表示该群组不具有群组管理员。第三栏是群组管理员的账号。     


## 13.2 账号管理

### 13.2.1 新增与移除使用者：useradd, 相关配置文件，passwd，usermod, userdel    

使用 `useradd` 来新建使用者，使用 `passwd` 来设置密码。    

```
#useradd [-u UID] [-g 初始群组] [-G 次要群组] [-mM] \
> [-c 说明栏] [-d 主文件夹绝对路径] [-s shell] 使用者账号名

-M：强制，不要创建使用者主文件夹，系统账号默认值
-m：强制，要创建使用者主文件夹，一般账号默认值
-c：/etc/passwd 第五栏的说明内容，随便设置
-d：指定某个目录成为主文件夹，不要使用默认值
-r：创建一个系统的账号，这个账号的 UID 会有限制
-s：没有指定的话，默认就是 /bin/bash
-e：后面接一个日期，次项目可写入 shadow 第八字段，即账号的失效日期
-f：后面接 shadow 的第七字段，指示密码是否会失效，0为立刻失效，-1为永远不失效
```    

```
#passwd [--stdin] [账号名称]    -> 所有者均可使用来该自己的密码
#passwd [-l] [-u] [--stdin] [-S] \
> [-n 日数] [-x 日数] [-w 日数] [-i 日期] 账号   -> root 的功能

--stdin：可以通过来自前一个管道的数据，作为密码输入
-l：Lock 的意思，会将 /etc/shadow 第二栏前面加上 `!` 使密码失效
-u：与 -l 相对，unlock 的意思
-S：列出密码相关参数，即shadow文件内的大部分信息
-n：后面接天数，shadow 的第4字段
-x：shadow 的第5字段
-w：shadow 的第6字段
-i：shadow 的第7字段
```    

除了 `passwd -S` 之外，还可以使用 `chage` 来查看密码参数：    

```
chage [-ldEImMW] 账号名

-l：列出账号的详细密码参数
-d：后面接日期，修改 shadow 第3字段
-E：后面接日期，修改 shadow 第8字段
-I：后面接天数，修改第7字段
-m：接天数，修改第4字段
-M：接天数，修改第5字段
-W：接天数，修改第6字段
```    

```
#usermod [-cdegGlsuLU] username

-c：后面接账号的说明，即 /etc/passwd 第五栏的说明栏
-d：后面接账号的主文件夹，即修改 /etc/passwd 的第六栏
-e：后面接日期，格式是 YYYY-MM-DD，即 /etc/shadow 第八栏
-f：后面接天数，为 shadow 第七栏
-g：后面接初始群组，passwd 第4字段
-G：后面接次要群组，修改这个使用者能够支持的群组，修改过的是 /etc/group
-a：与-G 合用，可增加次要群组的支持，而非设置
-l：后面接账号名称，即要修改的账号
-s：后面接 shell 实际文件
-u：后面接 UID 的数字
-L：暂时将使用者密码冻结
-U：将密码解冻
```    

使用 `userdel` 删除使用者的相关数据，而相关数据有：    

+ 使用者账号/密码相关参数：/etc/passwd, /etc/shadow
+ 使用者群组相关参数：/etc/group, /etc/gshadow
+ 使用者个人文件数据：/home/username, /var/spool/mail/username....     

```
#userdel [-r] username

-r：连同用户的主文件夹一并删除
```    

### 13.2.2 使用者功能

**id**     

`id` 这个指令可以查询某人或者自己的相关 UID/GID 等等信息。    

`$id [username]`     

**chsh**    

即 change shell 的意思。     

```
$chsh [-s]

-s：设置修改自己的 shell
```     

### 13.2.3 新增与移除数组

**groupadd**     

```
$groupadd [-g gid] [-r] 群组名称

-g：设置特定的 gid
-r：创建系统群组
```      

**groupmod**   

与 `usermod` 类似，这个命令修改 group 的相关参数：     

```
#groupmod [-g gid] [-n group_name] 群组名

-g：修改既有的 gid 数字
-n：修改既有的群组名称
```    

**groupdel**    

删除群组：`groupdel group_name`      

**gpasswd**    

使用 `gpasswd` 创建一个管理员：    

```
#gpasswd group_name
#gpasswd [-A user1, ...] [-M user3,...] group_name
#gpasswd [-rR] group_name

如果没有任何参数，表示给予 group 一个密码
-A：将 group 管理员设置为后面的用户
-M：将某些账号加入到该 group 中
-r：将 group 密码删除
-R：让 group 密码失效
```    

另外一些管理员的常用操作如下：    

```
#gpasswd [-ad] user group

-a：添加用户
-d：删除用户
```    

## 13.3 主机的细部权限规划：ACL 的使用

ACL 是 Access Control List 的缩写，主要目的是提供传统的 owner, group, others 的 read, write, execute 权限之外的详细权限设置。ACL 可以针对单一使用者，单一文件或目录进行 r, w,x 的权限规范。    

如果查看是否已安装 ACL：`dmesg | grep - acl`     

### 13.3.2 ACL 的设置技巧：getfacl, setfacl

+ `setfacl` 用法及最简单的权限设置    

```
#setfacl [-bkRd] [{-m|-x} acl参数] 目标文件名

-m：设置后续的 acl 参数给文件使用，不可与 -x 合用
-x：删除后续的 acl 参数
-b：移除所有的 acl 设置参数
-k：移除默认的acl参数
-R：递归设置 acl
-d：设置默认acl参数，只对目录有效
```

针对单一用户的设置方式如下，遵从 `u:[账号列表]:[rwx] 的语法：    

```
#setfacl -m u:dengbo:rx filename
#setfacl -m u::rwx filename  // u后面无用户列表，代表设置该文件的拥有者
```   

如果一个文件设置了 ACL 参数后，他的权限部分就会多出一个 + 号，但是此时看到的权限与实际权限可能有误差，需要通过 getfacl 来进行查看。    

+ getfacl 的用法    

```
#getfacl filename
```    

+ 特定的单一群组权限设置方式：g:[groupname]:[permission]   

```
#setfacl -m g:dengbo:rx acl_test1
```     

+ 针对有效权限的设置：m:permission     

略。     

+ 使用默认权限设置目录未来文件的 ACL权限基础：d:[u|g]:[user|group]:permission     



## 13.4 使用者身份切换

将一般使用者转变为 root 的方式有两种：    

+ 以 `su -` 直接将身份变成 root即可，但是这个命令需要 root 的密码。
+ 以 `sudo command` 执行 root 命令。     

### 13.4.1 su

```
#su [-lm] [-c command] [username]

-：单纯使用 - ，代表使用 login-shell 的变量文件读取方式来登陆系统，若使用者名称没加上去，代表切换为 root 身份
-l：与 - 类似，但后面需要加欲切换的使用者账号，也是 login-shell 方式
-m：-m与-p 是一样的，表示使用目前的环境设置，而不读取新使用者的配置文件
-c：仅进行一次指令，所有 -c 后面可以加上指令
其实 - 和 -l 是相同的功能，不过 - 必须写在 username 前，而 -l 与其他的参数一样是可以写在 username 后的
```    

总的来说 su 的用法是这样的：   

+ 若要完整的切换到新使用者的环境，必须要使用 `su - username` 或者 `su -l username`
+ 如果仅想要执行一次 root 的指令，可以利用 `su - -c command` 的形式     

### 13.4.2 sudo

```
#sudo [-b] [-u 新用户] command

-b：将后续的指令放到背景中让系统自行执行
-u：如果没有则为 root
```    

sudo 的执行流程如下：   

1. 当使用者执行 sudo 时，系统于 /etc/sudoers 文件中查找用户是否有执行 sudo 的权限
2. 若使用者具有可执行 sudo 的权限后，便让使用者输入密码来确认
3. 密码输入成功，开始执行指令     

修改 sudoers 文件需要使用 `visudo`，一般来说，设置sudoers 有以下的几种场景：    

+ 单一使用者可进行 root 所有指令：想要达成这个功能有两种做法，一种是使用 `visudo` 在 /etc/sudoers 中添加这样的一行 `dengbo ALL=(ALL)    ALL`。   
大致是这个意思：   
```
使用者账号     登录者的来源主机名称=（可切换的身份）    可下达的指令
dengbo           ALL = (ALL)                         ALL
```   
第二种做法就是下面的使用群组。
+ 利用 wheel 群组以及免密码的功能处理 `visudo`：在其中加上 `%wheel  ALL=(ALL) ALL`，百分号表示后面跟的是群组的名称，注意 wheel 可以替换为任何我们想要的名称
+ 利用别名，visudo 可以添加用户，主机和命令的别名，不过注意别名需要是大写的。    
```
User_Alias ADMPW = pro1, pro2, pro3, myuser1, myuser2
ADMPW  ALL=(root) ALL
```    
+ sudo 的时间间隔问题：五分钟内再次执行 sudo 时不需要输入密码。    


## 13.5 使用者的特殊 shell 与 PAM 模块

### 13.5.1 特殊的 shell，/sbin/nologin

系统账号的 shell 是 /sbin/nologin，是不需要登录的。即便想要登录 bash 等 shell 也是不能的。   

### 13.5.2 PAM模块简介

PAM (Pluggable Authentication MOdules)。PAM 可以说是一套 API，它提供了一连串的验证机制，只要使用者将验证阶段的需求告知 PAM 后，PAM 就能够回报使用者验证的结果（成功或失败）。由于 PAM 仅是一套验证的机制，又可以提供给其他程序所调用引用，因此不论你使用上面程序，都可以使用 PAM 来进行验证。     

PAM 用来进行验证的数据称为模块，每个 PAM 模块的功能都不太相同。     

### 13.5.3 PAM 模块设置语法

PAM 借由一个与程序相同文件名的配置文件来进行一连串的认证分析需求。我们以 passwd 命令调用的 PAM 来说明，当我们执行 passwd 后，程序调用 PAM 的流程是：    

1. 使用者开始执行 /usr/bin/passwd 程序，并输入密码
2. passwd 调用 PAM 模块进行验证
3. PAM 模块会到 /etc/pam.d/ 找寻与程序(passwd) 同名的配置文件
4. 依据 /etc/pam.d/passwd 内的设置，引用相关的 PAM 模块逐步进行验证分析
5. 将验证结果回传给 passwd 程序
6. passwd 这支程序会依据 PAM 回传的结果决定下一个动作      

而 /etc/pam.d/passwd 文件的内容大致如下：    

```
[root@study	~]#	cat	/etc/pam.d/passwd
#%PAM-1.0		<==PAM版本的说明而已!
auth							include						system-auth			<==每一行都是一个验证的过程
account				include						system-auth
password			substack					system-auth
-password			optional				pam_gnome_keyring.so	use_authtok
password			substack					postlogin
验证类别			控制标准					PAM	模块与该模块的参数
```    

+ 第一个字段验证类型主要分为四种：   
  - auth，主要用来验证使用者的身份验证，这个类别通常需要密码来检验
  - account，大部分在进行授权，这个类别主要在检验使用者是否具有正确的使用权限
  - session，管理的是使用者在这次登录期间，PAM 所给予的环境设置
  - password，主要在提供验证的修订工作，例如修改密码
+ 第二个字段，验证的控制 flag，即验证通过的标准，也分四种控制方式：    
  - required 此验证若成功则带有 success 标志，失败则带有 failure 标志，但不论成功与否都会继续后续的验证流程
  - requisite，若验证失败则立刻回报原程序 failure 标志，并终止后续的验证流程
  - sufficient，若成功则立刻回传 success 标志，并终止后续的验证流程，失败则带有 failure 标志继续后续的验证流程
  - optional这个模块控制项目大多是在显示讯息而已,并不是用在验证方面的     

算了略了，太复杂。     


## 13.6 Linux 主机上的使用者讯息传递

### 13.6.1 查询使用者： w, who, last, lastlog

使用 `w` 或 `who` 来查询目前已登录在系统上面的使用者：     

```
#w      -> 结果中第一行显示目前的时间，开机多久，几个使用者在系统上
           第二行只是各个项目的说明
           第三行以后，每行代表一个使用者
#who
```    

如果想要知道每个账号的最近登录时间，可以使用 `lastlog` 命令，`lastlog` 会读取 /var/log/lastlog
文件。     


### 13.6.2 用户交流：write, mesg, wall

```
#write username [用户所在的终端接口]   -> 敲完命令以后应该是会与终端建立连接，然后手动输入内容，ctrl +d 结束输入
```     

```
mesg [n|y]    // 对，没有减号

-n：禁止展示其他人传过来的信息
-y：允许
```      

`wall` 的话应该是向系统中的使用者传递广播：`wall "message"`    


### 13.6.3 使用者邮件邮箱：mail

每个 Linux 主机上的用户都有一个 mailbox，一般来说 mailbox 都放置在 /var/spool/mail 里面，
一个。    

寄信：`mail -s "邮件标题" username@localhost` 即可，一般来说，如果寄给本机上的用户，连 `@localhost` 都可以省略