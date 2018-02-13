# 第十七章 认识系统服务

## 17.1 什么是 daemon 与服务

### 17.1.1 早期	System	V	的	init	管理行为中	daemon	的主要分类

在 System V 时代，启动系统服务的管理方式被称为 SysV	的 init 脚本程序的处理方式!亦即系统核
心第一支调用的程序是 init, 然后 init 去唤起所有的系统所需要的服务。      

基本上 init 的管理机制有几个特色如下:     

+ 服务的启动、关闭与观察等方式:	所有的服务启动脚本通通放置于 /etc/init.d/ 下面,基
本上都是使用 bash shell script 所写成的脚本程序,需要启动、关闭、重新启动、观察状
态时,	可以通过如下的方式来处理:
  - 启动:/etc/init.d/daemon	start
  - 关闭:/etc/init.d/daemon	stop
  - 重新启动:/etc/init.d/daemon	restart
  - 状态观察:/etc/init.d/daemon	status
+ 服务启动的分类: init 服务的分类中,依据服务是独立启动或被一只总管程序管理而分为
两大类:
  - 独立启动模式 (stand alone):服务独立启动,该服务直接常驻于内存中,提供本
机或用户的服务行为,反应速度快。
  - 总管程序 (super daemon):由特殊的 xinetd	或 inetd	这两个总管程序提供	socket
对应或	port 对应的管理。当没有用户要求某 socket 或	port 时,	所需要的服务是不
会被启动的。若有用户要求时, xinetd	总管才会去唤醒相对应的服务程序。当该要
求结束时,这个服务也会被结束掉~	因为通过 xinetd 所总管,因此这个家伙就被称
为	super	daemon。好处是可以通过 super daemon 来进行服务的时程、连线需求等
的控制,缺点是唤醒服务需要一点时间的延迟。
+ 服务的相依性问题:	服务是可能会有相依性的
+ 执行等级的分类: 上面说到 init 是开机后核心主动调用的,	然后 init 可以根据使用者自
订的执行等级 (runlevel) 来唤醒不同的服务,以进入不同的操作界面。而各个执行等级的启动脚本是通过	/etc/rc.d/rc[0-
6]/SXXdaemon 链接到 /etc/init.d/daemon	,	链接文件名	(SXXdaemon)	的功能为:	S
为启动该服务,XX是数字,为启动的顺序。由于有	SXX	的设置,因此在开机时可以“依
序执行”所有需要的服务,	同时也能解决相依服务的问题。
+ 制定执行等级默认要启动的服务:	若要创建如上提到的	SXXdaemon	的话,不需要管理员手动创建链接文件, 
通过如下的指令可以来处理默认启动、默认不启动、观察默认启动否的行为（然而 ubuntu 下没有 chkconfig 命令）:
  - 默认要启动: chkconfig daemon	on
  - 默认不启动: chkconfig daemon	off
  - 观察默认为启动否:	chkconfig	--list daemon
+ 执行等级的切换行为:	当你要从纯命令行 (runlevel 3)	切换到图形界面	(runlevel
5),	不需要手动启动、关闭该执行等级的相关服务,只要“ init 5	”即可切换


### 17.1.2 systemd 使用的 unit 分类

从	CentOS 7.x 以后,Red	Hat	系列的	distribution 放弃沿用多年的 System	V	开机启动服务的
流程,就是前一小节提到的 init	启动脚本的方法, 改用	systemd	这个启动服务管理机制。systemd 的优点
如下：    

+ 平行处理所有服务,加速开机流程: 旧的	init 启动脚本是“一项一项任让所有的服务同时启动“，systemd	可以
让所有的服务同时启动
+ 一经要求就回应的 on-demand 启动方式: systemd 全部就是仅有一只	systemd	服务搭
配	systemctl	指令来处理,无须其他额外的指令来支持。不像	systemV	还要 init,
chkconfig, service...	等等指令。	
+ 服务相依性的自我检查:	由于 systemd 可以自订服务相依性的检查,因此如果 B 服务是
架构在	A	服务上面启动的,那当你在没有启动 A 服务的情况下仅手动启动 B 服务时, systemd	会自动帮你启动	A	服务
+ 依	daemon 功能分类：旧的 init 仅分为	stand	alone	与	super	daemon ,systemd	将服务单位	(unit) 区分为 service,	socket,	target,	path,
snapshot,	timer	等多种不同的类型(type),	方便管理员的分类与记忆。
+ 将多个	daemons	集合成为一个群组:	如同 systemV 的 init	里头有个 runlevel	的特色,
systemd	亦将许多的功能集合成为一个所谓的 target	项目，集合了许多的	daemons,亦即是执行某个	target 就是执行好多个
daemon 的意思。     

systemd 的配置文件放置目录：    

+ /usr/lib/systemd/system/:每个服务最主要的启动脚本设置,有点类似以前的	/etc/init.d
下面的文件;
+ /run/systemd/system/:系统执行过程中所产生的服务脚本,这些脚本的优先序要比
/usr/lib/systemd/system/高!看不懂。
+ etc/systemd/system/:管理员依据主机系统的需求所创建的执行脚本,其实这个目录有
点像以前 /etc/rc.d/rc5.d/Sxx	之类的功能!执行优先序又比	/run/systemd/system/高喔!      

也就是说,到底系统开机会不会执行某些服务其实是看 /etc/systemd/system/	下面的设置,所
以该目录下面就是一大堆链接文件。而实际执行的 systemd	启动脚本配置文件,	其实都是放
置在 /usr/lib/systemd/system/	下面。       


## 17.2 通过 systemctl 管理服务

基本上,	systemd	这个启动服务的机制,主要是通过一只名为	systemctl	的指令来处理的。    

### 17.2.1 通过	systemctl	管理单一服务(service unit) 的启动/开机启动与观察状态

daemon 的默认状态有没有可能除了 enable/disable 之外,还有其他的情况：    

+ enabled:这个 daemon	将在开机时被执行
+ disabled:这个	daemon 在开机时不会被执行
+ static:这个	daemon 不可以自己启动 (enable 不可),不过可能会被其他的 enabled 的服务来唤醒	(相依属性的服务)
+ mask:这个	daemon 无论如何都无法被启动!因为已经被强制注销	(非删除)。可通过 systemctl	unmask 方式改回原本状态



