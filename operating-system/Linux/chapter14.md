# 第 14 章 磁盘配额

<!-- TOC -->

- [第 14 章 磁盘配额](#第-14-章-磁盘配额)
  - [14.1 磁盘配额的应用与操作](#141-磁盘配额的应用与操作)
    - [14.1.1 什么是 Quota](#1411-什么是-quota)
  - [14.2 软件磁盘阵列 (Software RAID)](#142-软件磁盘阵列-software-raid)
    - [14.2.3 软件磁盘阵列的设置](#1423-软件磁盘阵列的设置)
  - [14.3 逻辑卷轴管理员(Logical Volume Manager)](#143-逻辑卷轴管理员logical-volume-manager)
- [第 15 章 例行性工作调度(crontab)](#第-15-章-例行性工作调度crontab)
  - [15.1 什么是例行性工作调度](#151-什么是例行性工作调度)
    - [15.1.1 Linux 工作调度的种类：at, cron](#1511-linux-工作调度的种类at-cron)
    - [15.1.2 CentOS Linux 系统上常见的例行性工作](#1512-centos-linux-系统上常见的例行性工作)
  - [15.2 仅执行一次的工作调度](#152-仅执行一次的工作调度)
    - [15.2.1 atd 的启动与 at 运行的方式](#1521-atd-的启动与-at-运行的方式)
    - [15.2.2 实际运行单一工作调度](#1522-实际运行单一工作调度)
  - [15.3 循环执行的例行性工作调度](#153-循环执行的例行性工作调度)
    - [15.3.1 使用者的设置](#1531-使用者的设置)
    - [15.3.2 系统的配置文件：/etc/crontab, /etc/cron.d/*](#1532-系统的配置文件etccrontab-etccrond)
  - [15.4 可唤醒停机期间的工作任务](#154-可唤醒停机期间的工作任务)
    - [15.4.1 什么是 anacron](#1541-什么是-anacron)
    - [15.4.2 anacron 与 /etc/anacrontab](#1542-anacron-与-etcanacrontab)

<!-- /TOC -->

## 14.1 磁盘配额的应用与操作

### 14.1.1 什么是 Quota

在	Linux	系统中,由于是多用户多任务的环境,所以会有多人共同使用一个硬盘空间的情况
发生, 如果其中有少数几个使用者大量的占掉了硬盘空间的话,那势必压缩其他使用者的使
用权力!因此管理员应该适当的限制硬盘的容量给使用者,以妥善的分配系统资源。     

Quota 比较常用的几种情况是：    

+ 针对 web 服务器，例如每个人的网页空间的容量限制（什么鬼）
+ 针对邮件服务器，例如每个人的邮件空间限制
+ 针对文件服务器，例如每个人最大的可用网络硬盘空间    

上面讲的是针对网络服务的设计，如果是针对 Linux 主机上面的设置那么使用的场景有：    

+ 限制某一群组所能使用的最大磁盘配额	(使用群组限制)
+ 限制某一使用者的最大磁盘配额	(使用使用者限制)
+ 限制某一目录的最大磁盘配额   

Quota 可以通过限制 inode 数量来限制文件的数量，或者限制 block 的数量来限制容量。     

不过是 inode/block，限制值都有两个，分别是 soft 与 hard，通常 hard 限制值要比 soft 高。hard 表示用户的用量不能超过这个限制值。soft表示用户在超过soft且低于 hard 的限值之间时，每次使用者登录系统，系统会发出警告信息，且会给予一个宽限时间。    

略。待补充。    

## 14.2 软件磁盘阵列 (Software RAID)    

RAID 即 Redundant Arrays of Inexpensive Disks，RAID 可以通过软件或者硬件将多个较小的磁盘整合成一个较大的磁盘设备，常见的RAID level 如下：    

+ RAID-0（等量模式, stripe）：性能最佳    
这种模式使用相同型号与容量的磁盘来组成时，效果最佳。这种模式的RAID 会将磁盘先切出等量的区块，然后当
一个文件要写入 RAID 时，该文件会依据区块的大小切割好，之后再依序放到各个磁盘里面去。由于每个磁盘会交错的存放数据，因此当你的数据要写入 RAID 时，数据会被等量的放置到各个磁盘上面。举例来说，有两颗磁盘组成 RAID-0，当我们有100M 的数据要写入时，每个磁盘会被分配到 50M 的存储量。   

+ RAID-1（映射模式，mirror）：完整备份     
这种模式也是需要相同的磁盘容量的。这种模式主要是让同一份数据，完整的保存在两颗磁盘上面。举例来说，如果
我有100M 的文件，有两颗磁盘组成的 RAID-1，那么这两颗磁盘会同步写入100M 到磁盘中。      

+ RAID 1+0，RAID 0+1    
所谓 RAID 1+0, 就是：1.先让两颗磁盘组成 RAID1，并且这样的设置共有两种；2.将这两组 RAID1 再组成一组 RAID0。反过来说，RAID 0+1 就是先组成 RAID-0再组成 RAID-1。   

+ RAID 5:性能与数据备份的均衡考虑     
RAID-5 至少需要三颗以上的磁盘才能够组成这种类型的磁盘阵列。这种磁盘阵列的数据写入有点类似 RAID-0，不过在每个循环的写入过程中，在每颗磁盘还加入一个同位检查数据，这个数据会记录其他磁盘的备份数据。    

+ RAID 6 与 RAID 5 类似，但是需要两颗磁盘来保存校验信息，应该是一样的内容，这样的话应该最少得4颗磁盘      

### 14.2.3 软件磁盘阵列的设置

使用 `mdadm` 指令创建 RAID：     

```
#mdadm  --detail /dev/md0
#mdadm  --create /dev/md[0-9] --auto=yes --level=[015] --chunk=NK \
> --raid-devices=N --spare-ddevices=N /dev/sdx /dev/hdx

--create：  创建 RAID
--auto=yes：  决定创建后面接的软件磁盘阵列设备，即 /dev/md0, /dev/md1...
--chunk=NK：设备的 chunk 大小
--raid-devices=N：使用几个磁盘作为磁盘阵列的设备
--spare-devices=N：使用几个磁盘作为备用设备
--level=[015]：磁盘阵列的等级，话说怎么设置10或者01
--detail：后面所接的那个磁盘阵列设备的详细信息
```     

上面的语法中，最后面会接许多的设备文件名，这些设备文件名可以是整颗磁盘，例如 /dev/sdb，也可以是分区，例如 /dev/sdb1。不过这些设备文件名的总数必须要等于 --raid-devices 与 --spare-devices 的个数总和才行。    

```
#mdadm --create /dev/md0 --auto=yes --level=5 --chunk=256K \
--raid-devices=4 --spare-devices=1 /dev/vda{5,6,7,8,9}
```     

剩下的略了。    

## 14.3 逻辑卷轴管理员(Logical Volume Manager)    

LVM 的做法是将几个实体的分区或磁盘通过软件组合称为一块看起来是独立的大磁盘(VG)，然后将这块大磁盘再经过分区称为可使用分区(LV)，最终就能够挂载使用了。    

+ Physical Volume, PV 实体卷轴    
我们实际的分区或磁盘需要调整系统识别码成为 8e（LVM 的识别码），然后再经过 `pvcreate` 命令将其转成 LVM 最底层的实体卷轴，之后才能够将这些 PV 加以利用。    

+ Volume Group, VG 卷轴数组    
所谓的 LVM 大磁盘就死将许多 PV 整合成 VG。    

+ Physical Extend, PE 实体范围区块     
LVM 默认使用 4M 的 PE 区块，而 LVM 的 LV 在32 位系统最多能含有 65534 个 PE，PE 是整个LVM 最小的存储区块，也就说，其实我们的文件数据都是借由写入 PE 来处理的。     

+ Logical Volume, LV 逻辑卷轴     
最终的 VG 还会被切成 LV，这个LV就是最后可以被格式化使用的类似分区的东西。     

之前提到了 LVM 可弹性的变更文件系统的容量，即使通过交换 PE 来进行数据转换，将原本 LV 内的 PE 转移到其他设备中以降低 LV 容量，或将其他设备的 PE 加到此 LV 中以加大容量。    

当数据写入 LV 中时，有两种写入磁盘的方式：    

+ 线性模式：加入我们将 /dev/vda1，/dev/vdb1 这两个分区加入到 VG 当中，并且整个 VG 只有一个 LV 时，那么所谓的线性模式就是：当 /dev/vda1 的容量用完之后，/dev/vdb1 的磁盘才会被使用到。
+ 交错模式：将一笔数据分成来部分，分别写入 /dev/vda1 和 /dev/vdb1，类似 RAID0。     

# 第 15 章 例行性工作调度(crontab)

## 15.1 什么是例行性工作调度

### 15.1.1 Linux 工作调度的种类：at, cron   

+ at：at是个可以处理仅执行一次就结束调度的指令，不过要执行 at 时，必须要有 atd 这个服务的支持才行。
+ crontab：crontab 这个指令设置的工作将会一直循环进行下去，可循环的时间为分钟、小时、每周、每月或每年等。crontab 除了可以使用指令执行外，也可以编辑 /etc/crontab 来支持，让 crontab 生效则是 crond 这个服务。     

### 15.1.2 CentOS Linux 系统上常见的例行性工作

基本上 Linux 系统常见的例行性任务有：    

+ 进行登录文件的轮替：Linux 会主动的将系统所发生的各种信息都记录下来，这就是登录文件。由于系统会一直记录登录信息，所以登录文件将会越来越大.适时的将登录数据挪一挪，让旧的数据与新的数据分别存放，则比较可以有效的记录登录信息。这就是 log rotate 的任务，也是系统必要的例行任务
+ 登录文件分析 logwatch 的任务：如果系统发生了软件问题、硬件错误等，绝大部分的错误信息都会被记录到登录文件中，因此系统管理员的重要任务之一就是分析登录文件。我们的 CentOS 提供了一个logwatch 程序来主动分析登录信息。
+ 创建 locate 的数据库
+ man page 查询数据库的创建，如果要使用 man page 数据库，就得要执行 mandb 才能够创建好
+ RPM 软件登录文件的创建：由于系统可能会常常变更软件，包括软件的新安装、非经常性更新等，都会造成软件文件名的差异。为了方便追踪，系统也会将文件名作个排序的记录
+ 移除暂存盘：某些软件在运行中会产生一些暂存盘，但是当这个软件关闭时，这些暂存盘可能并不会主动的被移除。系统通过例行性工作调度执行 tmpwatch 的指令来删除这些暂存盘
+ 与网络服务有关的分析，如果有安装类似 Apache 等服务器，Linux 系统通常会主动分析该文件的登录文件。同时会检查某些凭证与认证的网络信息是否过期的问题。   


## 15.2 仅执行一次的工作调度

### 15.2.1 atd 的启动与 at 运行的方式

启用 atd 服务：    

```
#systemctl restart atd    # 重启 atd 服务
#systemctl enable atd     # 让这个服务开机就自启动
#systemctl status atd     # 查阅一下 atd 目前的状态
```   

_注：_ ubuntu 下貌似没安装这个服务，需要手动安装一下 `sudo apt install at`。     

使用 `at` 这个命令来产生所要运行的工作，并将这个工作以文本文件的方式写入 /var/spool/at/ 目录内，该工作便能等待 atd 这个服务的取用与执行了。     

出于安全的原因，不是所有人都可以进行 `at` 工作调度。可以利用 /etc/at.allow 与 /etc/at.deny 这两个文件来进行 at 的使用限制。加上这两个文件后，`at` 的工作情况其实是这样的：    

1. 先找寻 /etc/at.allow 这个文件，写在这个文件中的使用者才能利用 at，没有在这个文件中的使用者则不能使用 at
2. 如果 /etc/at.allow 不存在，就寻找 /etc/at.deny 这个文件，若写在这个 at.deny 的使用者则不能使用 at，而没有在这个 at.deny 文件中的使用者就可以使用 at。
3. 如果两个文件都不存在，那么只有 root 可以使用 at 这个指令。     

在一般的 Linux 发行版中，由于假设系统上的所有用户都是可信任的，因此系统通常会保留一个空的 /etc/at.deny 文件，意思是允许所有人使用 `at` 指令的意思。      

### 15.2.2 实际运行单一工作调度

```
#at [-mldv] TIME
#at -c 工作号码

-m：当at 工作完成后，即使没有输出讯息，也email 通知使用者工作已完成
-l： at -l 相当于 atq，列出目前系统上面的所有使用者的 at 调度
-d：at -d相当于 atrm，可以取消一个在 at 调度中的工作
-v：可以使用较明显的时间格式列出 at 调度中的工作列表
-c：可以列出后面接的该项工作的实际指令内容

TIME：时间格式
  HH:MM   在今天的 HH:MM 时刻进行，若该时刻已过，在明天的这个时刻进行
  HH:MM YYYY-MM-DD  
  HH:MM[am|pm] [Month] [Date]
  HH:MM[am|pm] + number [minutes|hours|days|weeks]
```   

执行 at 会进入 at shell 环境，其实是个交互式的shell环境，我们可以在这里输入要执行的任务指令。     

at 指令所有的标准输出和标准错误都会传送到执行者的邮箱中去，所有终端机上看不到任何信息。    

```
#atq
#atrm (jobnumber)    
```    

**batch：系统有空时才进行背景任务**     

`batch` 也是利用 `at` 来进行命令的下达，不过加入一些控制参数。`batch` 会在 CPU 的工作负载小于 0.8 的时候才会执行下达的任务，工作负载的意思是 CPU 在单一时间点负责的工作数量。    

## 15.3 循环执行的例行性工作调度

### 15.3.1 使用者的设置

crontab 的使用限制文件与 at 类似：    

+ /etc/cron.allow：将可以使用 crontab 的账号写入其中，若不在这个文件内的使用者则不可使用 crontab
+ /etc/cron.deny：将不可使用 crontab 的账号写入其中。     

同样的，以优先级来说 /etc/cron.allow 比 /etc/cron.deny 要高。一般，系统默认保留 /etc/cron.deny 。     

```
#crontab [-u username] [-l|-e|-r]

-u：只有 root 才能进行这个任务，意思应该是 root 帮其他用户设置工作调度
-l：查看 crontab 调度内容
-e：编辑
-r：移除所有的 crontab 调度内容
```    

默认情况下，任何使用者只要不被列入 /etc/cron.deny 当中，就可以直接下达 `crontab -e` 来编辑自己的例行性任务，输入后会进入 vim，然后一个工作一行的来编辑，每项工作的格式都是6个字段，每个字段的意义为：    


代表意义 | 分钟 | 小时 | 日期 | 月份 | 周 | 指令
---------|----------|---------|---------|---------|---------|---------
 数字范围 | 0-59 | 0-23 | 1-31 | 1-12 | 0-7 | 命令     

周的数字为0或7均代表周日。另外还有一些辅助字符：    


特殊字符 | 代表意义
----------|---------
 \* | 代表任何时刻都接受的意思
 , | 代表分隔时段的意义，例如 0 3,6 * * * command，说明3点和6点都要执行
 \- | 代表一段时间范围内
 \/n | n 代表数字，即每隔 n 单位时间     


### 15.3.2 系统的配置文件：/etc/crontab, /etc/cron.d/*    

这个 `crontab -e` 是针对用户的调度任务设计的，如果是系统的例行性任务，编辑 /etc/crontab 文件。    

这个文件与 crontab -e 编辑文件不同的地方是，但分，时，日，月，周五个字段后，接的是一个执行后面命令的用户，最后才是命令。    

一般来说，crond 默认有3个地方会有执行脚本配置文件，分别是：     

+ /etc/crontab
+ /etc/cron.d/*
+ /var/spool/cron/*     

## 15.4 可唤醒停机期间的工作任务

### 15.4.1 什么是 anacron

anacron 存在的目的在于处理非24小时一直启动的 Linux 系统的 crontab 的执行，以及因为某些原因导致的超时而没有被执行的调度工作。    

其实 anacron 也是每个小时被 crond 执行一次，然后 anacron 再去检测相关的调度任务有没有被执行，如果有超过期限的工作在，就执行该调度任务，执行完毕或无需执行任何调度时，anacron 就停止了。      

### 15.4.2 anacron 与 /etc/anacrontab

anacron 其实是一支程序并非一个服务，基本上 anacron 的语法如下：    

```
#anacron [-sfn] [job] ..
#anacron -u [job]..   

-s：开始一连续的执行各项工作，会依据时间记录文件的数据判断是否进行
-f：强制进行，而不去判断时间记录文件的时间戳
-n：立刻进行未进行的任务，而不延迟等待时间
-u：仅更新时间记录文件的时间戳，不进行任何工作
job：由 /etc/anacrontab 定义的工作名称
```    

在 CentOS 中，anacron 的进行其实是在每个小时都会被抓出来执行一次，但是为了担心 anacron 误判时间参数，因此 /etc/cron.hourly/ 里面的 anacron 才会在文件名之前加个0，让 anacron 最先执行。     

总结以下各配置文件和目录的关系：     

1. crond 会主动去读 /etc/crontab, /var/spool/cron/, /etc/cron.d/ 等配置文件，并依据分、时、日、月、周的时间去设置各项工作调度
2. 根据 /etc/cron.d/0hourly 的设置，主动区 /etc/cron.hourly/ 目录下，执行所有在该目录下的可执行文件
3. 因为 /etc/cron.hourly/0anacron 这个命令的缘故，主动的每小时执行 anacron，并调用 /etc/anacrontab 的配置文件
4. 依据 /etc/anacrontab 的设置，依据每天，每周，每月去分析 /etc/cron.daily/, /etc/cron.weekly/, /etc/cron.monthly/ 内的可执行文件，以进行固定周期需要执行的指令     




