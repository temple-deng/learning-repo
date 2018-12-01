# 第 16 章 进程管理与 SELinux 初探

<!-- TOC -->

- [第 16 章 进程管理与 SELinux 初探](#第-16-章-进程管理与-selinux-初探)
  - [16.1 什么是进程](#161-什么是进程)
    - [16.1.1 进程与程序](#1611-进程与程序)
  - [16.2 工作管理](#162-工作管理)
    - [16.2.1 什么是工作管理](#1621-什么是工作管理)
    - [16.2.2 工作管理](#1622-工作管理)
    - [16.2.3 离线管理问题](#1623-离线管理问题)
  - [16.3 程序管理](#163-程序管理)
    - [16.3.1 程序的观察](#1631-程序的观察)
- [第 17 章 认识系统服务](#第-17-章-认识系统服务)
  - [17.1 什么是 daemon 与服务](#171-什么是-daemon-与服务)
    - [17.1.1 早期 System V 的 init 管理行为中 daemon 的主要分类](#1711-早期-system-v-的-init-管理行为中-daemon-的主要分类)
    - [17.1.2 systemd 使用的 unit 分类](#1712-systemd-使用的-unit-分类)
  - [17.2 通过 systemctl 管理服务](#172-通过-systemctl-管理服务)
    - [17.2.1 通过 systemctl 管理单一服务(service unit) 的启动/开机启动与观察状态](#1721-通过-systemctl-管理单一服务service-unit-的启动开机启动与观察状态)
    - [17.2.2 通过 systemctl 管理不同的目标单元](#1722-通过-systemctl-管理不同的目标单元)
  - [17.3 systemctl 针对 service 类型的配置文件](#173-systemctl-针对-service-类型的配置文件)
    - [17.3.1 systemctl 配置文件相关目录简介](#1731-systemctl-配置文件相关目录简介)
    - [17.3.2 systemctl 配置文件的设置项目简介](#1732-systemctl-配置文件的设置项目简介)

<!-- /TOC -->

## 16.1 什么是进程

在Linux 系统当中，触发任何一个事件时，系统都会将他定义成为一个进程，并且给予这个进程一个 ID，称为 PID，同时依据启动这个进程的使用者与相关属性关系，给予这个 ID 一组有效的权限设置。从此以后，这个 PID 能够在系统上面进行的动作，就与这个 PID 的权限有关了。     

### 16.1.1 进程与程序

系统仅认识二进制文件，因此我们想让系统执行某些工作的时候，就需要启动一个二进制文件，这个二进制文件就叫做程序。     

常驻在内存当中的进程通常都是负责一些系统所提供的功能以服务使用者各项任务，因此这些常驻进程就会被称为：服务(daemon)。系统的服务非常多，不过主要可以分成系统本身所需要的服务，例如 crond 和 atd，还有 rsyslogd 等。还有一些则是负责网络连接的服务，例如 Apache 等。一般 daemon 类型的进程都会加入 d 在文件名后头。     

在 Linux 下面执行一个命令时，系统会将相关的权限、属性、程序码与数据等载入内存，并给予这个单元一个进程码 PID。     

## 16.2 工作管理

### 16.2.1 什么是工作管理

要进行 bash 的工作管理必须要注意到的限制是：    

+ 这些工作所触发的进程必须来自于你 shell 的子程序
+ 前台：可以控制与下达指令的这个环境称为前台的工作
+ 后台：可以自行运行的工作，无法使用 ctrl + c 终止
+ 后台中的进程不能等待终端的输入     

### 16.2.2 工作管理

在后台中的进程的状态又可以分为暂停与运行中。    

+ 直接将指令丢到后台中执行的 &
+ 将目前的工作丢到后台中暂停 ctrl + z
+ 观察目前的背景工作状态：jobs     
```
#jobs [-lrs]

-l：除了列出 job number 与指令串之外，还列出 PID
-r：仅列出在后台运行中的工作
-s：仅列出在后台中暂停的工作     
```     
+ 将后台工作拿到前台来处理：fg      
```
#fg %jobNumber

%jobNumbwe：%是可有可无的
```    
+ 让工作在后台中的进程运行：bg `bg %jobNumber`。相当于把一个在后台暂停了的工作变为后台运行中状态。
+ 管理后台中的工作：kill     

```
#kill -signal %jobNumber
#kill -l

-l：列出目前 kill 能够使用的 signal 有哪些
signal：代表给予后面接的那个工作什么样的指示
  -1：重新读取一次参数的配置文件
  -2：代表与由键盘输入 ctrl + c 同样的动作
  -9：立刻强制删除一个工作
  -15:以正常的方式终止一项工作
```    

注意 kill 后面接的数字默认会是 PID，如果想要管理 bash 的工作控制，就得要加上 %。    

### 16.2.3 离线管理问题

我们之前在工作管理中提到的后台，是指在 bash 的后台，而不是系统的后台，因此工作管理的后台依然与终端机有关，因此当我们退出终端时，任务是会被中断的，如果我们希望将一些任务放到系统的后台，而与终端无关。一种方法是使用上一章提到的 `at`，而一种就是 `nohup` 命令。     

```
#nohup  [指令与参数]   -> 在终端前台工作
#nphup  [命令与参数] &   -> 在终端后台工作
```    

需要注意的一点是 `nohup` 并不支持 bash 内置的命令，因此命令必须是外部命令才可以。     

## 16.3 程序管理

### 16.3.1 程序的观察

利用静态的 `ps` 或者是动态的 `top` 查看系统上面正在运行的程序，还可以用 `pstree` 来查阅程序树之间的关系。   

+ `ps`：将某个时间点的程序运行情况摘取下来     

```
#ps aux   -> 观察系统所有的程序数据
#ps -lA    -> 也是能够观察所有系统的数据
#ps axjf   -> 连同部分程序树的状态

-A：所有的进程均显示出来，与 -e 具有同样的效用
-a：不与终端有关的所有进程
-u：有效使用者相关的进程
x：通常与 a 一起使用，可列出完整的信息    

输出格式规划：   
l：较长、较详细的将该 PID 的信息列出
j：工作的格式
-f：做一个更为完整的输出
```   

说实话，乱七八糟看不懂。    

一般只背两个写法，查阅自己 bash 程序的 `ps -l`，还有一个查阅所有系统运行进程的 `ps aux`。     

先看下 `ps -l` 输出信息的含义：     

+ F (process flags)，常见号码有：
  - 4：表示此程序的权限为 root
  - 1：表示此子程序仅进行 fork 而没有实际执行
+ S (STAT)，表示进程的状态，主要的状态有：
  - R：表示进程正在运行中
  - S：表示进程目前正在睡眠状态，但可以被唤醒
  - D：不可被唤醒的睡眠状态，通常这支程序可能正在等待 I/O 的情况
  - T：停止状态，可能是在工作控制（后台暂停）或除错状态
  - Z：僵尸状态，进程已经终止但却无法被移除至内存外    
+ UID/PID/PPID
+ C：代表 CPU 使用率，单位为百分比
+ PRI/NI：priority/nice 的缩写，代表此程序被 CPU 所执行的优先顺序，数值越小代表程序越快被CPU执行
+ ADDR/SZ/WCHAN：都与内存有关，ADDR 是内核函数，指出此进程在内存的哪个部分，如果是个 runnig 的进行，一般会显示 `-`， SZ 代表此程序用掉多少内存，WCHAN 表示进程是否在运行中，同样的，若为 `-` 表示正在运行中。
+ TTY：登录者的终端机位置，若为远程登录则使用动态终端接口 pts/n
+ TIME：使用掉的 CPU 时间，注意，是此程序实际花费的 CPU 运行时间，而不是系统时间
+ CMD：就是命令的缩写     

之后是 `ps aux` 的内容含义：    

+ USER：该进程属于哪个使用者账号
+ PID
+ %CPU：使用的 CPU 占比
+ %MEM：进程所占用的内存占比
+ VSZ：使用的虚拟内存量 KB
+ RSS：占用的固定内存量 KB
+ TTY：该进程是在哪个终端机上面运行，若与终端机无关则显示 `?`
+ STAT：进程状态，与 `ps -l` 的 S 相同
+ TIME：占用 CPU 时间
+ COMMAND      

**`top`：动态观察程序的变化**    

```
#top [-d 数字] | top [-bnp]

-d：后面可以接秒数，就是整个程序画面更新的秒数，默认是5秒
-b：以批次的方式执行top
-n：与-b搭配，意义是，需要进行几次 top 的输出结果
-p：指定某些个 PID 来进行观察检测而已
```    

# 第 17 章 认识系统服务

## 17.1 什么是 daemon 与服务

### 17.1.1 早期 System V 的 init 管理行为中 daemon 的主要分类

在 System V 时代，启动系统服务的管理方式被称为 SysV 的 init 脚本程序的处理方式!亦即系统核
心第一支调用的程序是 init, 然后 init 去唤起所有的系统所需要的服务。      

基本上 init 的管理机制有几个特色如下:     

+ 服务的启动、关闭与观察等方式: 所有的服务启动脚本通通放置于 /etc/init.d/ 下面,基
本上都是使用 bash shell script 所写成的脚本程序,需要启动、关闭、重新启动、观察状
态时, 可以通过如下的方式来处理:
  - 启动:/etc/init.d/daemon start
  - 关闭:/etc/init.d/daemon stop
  - 重新启动:/etc/init.d/daemon restart
  - 状态观察:/etc/init.d/daemon status
+ 服务启动的分类: init 服务的分类中,依据服务是独立启动或被一只总管程序管理而分为
两大类:
  - 独立启动模式 (stand alone):服务独立启动,该服务直接常驻于内存中,提供本
机或用户的服务行为,反应速度快。
  - 总管程序 (super daemon):由特殊的 xinetd 或 inetd 这两个总管程序提供 socket
对应或 port 对应的管理。当没有用户要求某 socket 或 port 时, 所需要的服务是不
会被启动的。若有用户要求时, xinetd 总管才会去唤醒相对应的服务程序。当该要
求结束时,这个服务也会被结束掉~ 因为通过 xinetd 所总管,因此这个家伙就被称
为 super daemon。好处是可以通过 super daemon 来进行服务的时程、连线需求等
的控制,缺点是唤醒服务需要一点时间的延迟。
+ 服务的相依性问题: 服务是可能会有相依性的
+ 执行等级的分类: 上面说到 init 是开机后核心主动调用的, 然后 init 可以根据使用者自
订的执行等级 (runlevel) 来唤醒不同的服务,以进入不同的操作界面。而各个执行等级的启动脚本是通过 /etc/rc.d/rc[0-
6]/SXXdaemon 链接到 /etc/init.d/daemon , 链接文件名 (SXXdaemon) 的功能为: S
为启动该服务,XX是数字,为启动的顺序。由于有 SXX 的设置,因此在开机时可以“依
序执行”所有需要的服务, 同时也能解决相依服务的问题。
+ 制定执行等级默认要启动的服务: 若要创建如上提到的 SXXdaemon 的话,不需要管理员手动创建链接文件, 
通过如下的指令可以来处理默认启动、默认不启动、观察默认启动否的行为（然而 ubuntu 下没有 chkconfig 命令）:
  - 默认要启动: chkconfig daemon on
  - 默认不启动: chkconfig daemon off
  - 观察默认为启动否: chkconfig --list daemon
+ 执行等级的切换行为: 当你要从纯命令行 (runlevel 3) 切换到图形界面 (runlevel
5), 不需要手动启动、关闭该执行等级的相关服务,只要“ init 5 ”即可切换

也就是系统处于不同的级别，是会启动不同级别该运行的程序的。    

### 17.1.2 systemd 使用的 unit 分类

从 CentOS 7.x 以后,Red Hat 系列的 distribution 放弃沿用多年的 System V 开机启动服务的
流程,就是前一小节提到的 init 启动脚本的方法, 改用 systemd 这个启动服务管理机制。systemd 的优点
如下：    

+ 平行处理所有服务,加速开机流程: 旧的 init 启动脚本是“一项一项任让所有的服务同时启动“，systemd 可以
让所有的服务同时启动
+ 一经要求就回应的 on-demand 启动方式: systemd 全部就是仅有一只 systemd 服务搭
配 systemctl 指令来处理,无须其他额外的指令来支持。不像 systemV 还要 init,
chkconfig, service... 等等指令。 
+ 服务相依性的自我检查: 由于 systemd 可以自订服务相依性的检查,因此如果 B 服务是
架构在 A 服务上面启动的,那当你在没有启动 A 服务的情况下仅手动启动 B 服务时, systemd 会自动帮你启动 A 服务
+ 依 daemon 功能分类：旧的 init 仅分为 stand alone 与 super daemon ,systemd 将服务单位 (unit) 区分为 service, socket, target, path,
snapshot, timer 等多种不同的类型(type), 方便管理员的分类与记忆。
+ 将多个 daemons 集合成为一个群组: 如同 systemV 的 init 里头有个 runlevel 的特色,
systemd 亦将许多的功能集合成为一个所谓的 target 项目，集合了许多的 daemons,亦即是执行某个
target 就是执行好多个 daemon 的意思。     

systemd 的配置文件放置目录：    

+ /usr/lib/systemd/system/:每个服务最主要的启动脚本设置,有点类似以前的 /etc/init.d
下面的文件;
+ /run/systemd/system/:系统执行过程中所产生的服务脚本,这些脚本的优先序要比
/usr/lib/systemd/system/高!看不懂。
+ etc/systemd/system/:管理员依据主机系统的需求所创建的执行脚本,其实这个目录有
点像以前 /etc/rc.d/rc5.d/Sxx 之类的功能!执行优先序又比 /run/systemd/system/高      

也就是说,到底系统开机会不会执行某些服务其实是看 /etc/systemd/system/ 下面的设置,所
以该目录下面就是一大堆链接文件。而实际执行的 systemd 启动脚本配置文件, 其实都是放
置在 /usr/lib/systemd/system/ 下面。       


## 17.2 通过 systemctl 管理服务

基本上, systemd 这个启动服务的机制,主要是通过一只名为 systemctl 的指令来处理的。    

### 17.2.1 通过 systemctl 管理单一服务(service unit) 的启动/开机启动与观察状态

服务的启动有两个阶段，一个是“设置开机的时候要不要启动这个服务”，以及“当前要不要启动这个服务”。    

```bash
$ systemctl [command] [unit]
command 主要有：
start:     立刻启动后面接的 unit
stop:      立刻关闭后面接的 unit
restart:   立刻关闭后启动后面接的 unit，即 stop 再 start
reload:    不关闭 unit 的情况下，重新载入配置文件
enable:    设置下次开机时启动 unit
disable:   设置下次开机时不启动 unit
status:    unit 的状态
is-active: unit 是否在运行中
isable:    unit 是否是开机自启动
```    

daemon 的默认状态有没有可能除了 enable/disable 之外,还有其他的情况：    

+ enabled:这个 daemon 将在开机时被执行
+ disabled:这个 daemon 在开机时不会被执行
+ static:这个 daemon 不可以自己启动 (enable 不可),不过可能会被其他的 enabled 的服务
来唤醒 (相依属性的服务)
+ mask:这个 daemon 无论如何都无法被启动!因为已经被强制注销 (非删除)。可通过
systemctl unmask 方式改回原本状态

### 17.2.2 通过 systemctl 管理不同的目标单元

在 CentOS 7.1 默认情况下，有 26 个 target unit。跟操作界面相关性比较高的 target：   

+ graphical.target: 就是文字加图形界面，这个 unit 已包含 multi-user.target
+ multi-user.target: 纯文本模式
+ shutdown.target: 关机流程     

如何知道目前的模式是哪一种：    

```bash
$ sudo systemctl [command] [unit.target]
command:
  get-default:  取得目前的 target
  set-default:  设置默认的 target
  isolate:      切换到 target
```    

## 17.3 systemctl 针对 service 类型的配置文件

以前，我们如果想要创建系统服务，就得要到 /etc/init.d/ 下面去创建相对应的 bash shell
script 来处理。

### 17.3.1 systemctl 配置文件相关目录简介

如果想要修改 vsftpd.service，要修改哪里的配置呢：   

+ /usr/lib/systemd/system/vsftpd.service: 官方释出的默认配置文件
+ /etc/systemd/system/vsftpd.service.d/custom.conf: 在 /etc/systemd/system 下面
创建与配置文件相同文件名的目录，但是要加上 .d 的扩展名。然后在该目录下创建配置文件即可。
另外，配置文件最好附文件取名为 .conf 较佳。
+ /etc/systemd/system/vsftpd.service.wants/*: 此目录内的文件为链接文件，设置相依服务
的连接。意思是启动了 vsftpd.service 之后，最好再加上这目录下面建议的服务
+ /etc/systemd/system/vsftpd.service.requires/*: 此目录内的文件为链接文件，设置相依
服务的链接。意思是在启动 vsftpd.service 之前，需要事先启动哪些服务的意思。     

在配置文件里面你都可以自由设置相依服务的检查，并且设置加入到哪些 target 里头去。但是
如果是已经存在的配置文件，或者是官方提供的配置文件， Red Hat 是建议你不要修改原设
置，而是到上面提到的几个目录去进行额外的客制化设置比较好。     

### 17.3.2 systemctl 配置文件的设置项目简介

大概能够将整个设置分为三个部分：    

+ \[Unit\]: unit 本身的说明，以及与其他相依 daemon 的设置，包括在什么服务之后才启动此
unit 之类的设置值；
+ \[Service\], \[Socket\], \[Timer\], \[Mount\], \[Path\]: 不同的 unit type 就要
使用相对应的设置项目。这个项目内主要在规范服务启动的脚本、环境配置文件文件名、重新启动的
方式等；
+ \[Install\]: 这个项目就是将此 unit 安装到哪个 target 里面去的意思

Unit 部分的参数意义：   


参数 | 描述
----------|---------
 Description | 服务说明
 Doucmentation | 文档的位置
 After | 此 unit 在哪个 unit 启动之后才启动，但并没有强制要求里面的服务一定要启动后此 unit 才能启动
 Before | 与 After 意义相反
 Requires | 明确定义此 unit 需要在哪个 daemon 启动后才能够启动。就是设置相依服务。如果在此项目设置的前导服务没有启动，那么此 unit 就不会被启动
 Wants | 与 Requires 刚好相反。这个unit 之后最好还要启动什么服务比较好
 Conflicts | 冲突的服务

Service 参数的意义：    

+ Type: 说明这个 daemon 启动的方式，会影响 ExecStart。一般来说，有下面几种类型：
  - simple: 默认值，这个 daemon 主要由 ExecStart 的指令串来启动，启动后常驻内存
  - forking: 由 ExecStart 启动的程序通过 spawns 延伸出其他子程序来作为此 daemon 的主要服务，
  原生的父程序在启动结束后就会终止运行。传统的服务大多属于这个类型
  - oneshot: 与 simple 类似，不过这个程序在工作完毕后就结束了，不会常驻内存中
+ EnvironmentFile: 指定启动脚本的环境配置文件
+ ExecStart: 就是实际执行此 daemon 的指令或脚本程序。你也可以使用 ExecStartPre（之前）
以及ExecStartPost（之后）两个设置项目来在实际启动服务前，进行额外的指令行为。
+ ExecStop: 与 systemctl stop 的执行有关，关闭此服务时所进行的指令。
+ ExecReload: 与 systemctl reload 有关的指令行为
+ Restart: 当设置 Restart=1 时，则当此 daemon 服务终止后，会再次的启动此服务。
