# 第 5 章 内核的启动

下面是简化后的整个启动过程

1. BIOS 或启动固件加载并运行引导装载程序
2. 引导装载程序在磁盘上找到内核映像，将其载入内存并启动
3. 内核初始化设备及其驱动程序
4. 内核挂载根文件系统
5. 内核使用 PID 1 来运行 init 程序，用户进程在此时开始启动
6. init 启动其他的系统进程
7. init 还会启动一个进程，通常发生在整个过程的尾声，负责用户登录

## 5.1 引导装载程序

在启动过程的最开始，引导装载程序启动内核，然后内核和 init 启动。    

### 5.1.1 引导装载程序的任务

Linux 引导装载程序的核心功能如下：   

+ 从多个内核中选择一个使用
+ 从多个内核参数集中选择一个使用
+ 允许用户手动更改内核映像名和参数
+ 支持其他操作系统的启动

# 第 6 章 用户空间的启动

用户控件大致按下面的顺序启动：   

1. init
2. 基础的底层服务，如 udevd 和 syslogd
3. 网络配置
4. 中高层服务，如 cron 和打印服务等
5. 登录提示符、GUI 及其他应用程序

## 6.1 init 介绍

init 是 Linux 上的一个用户空间程序。和其他系统程序一样，你可以在 /sbin 目录下找到它。   

Linux 系统中，init 有以下三种主要的实现版本：   

+ System V init: 传统的顺序 init，为 Red Hat Enterprise Linux 和其他 Linux 发行版使用
+ systemd: 新出现的 init。
+ Upstart: Ubuntu 上的 init。不过目前 Ubuntu 也转向了 systemd     

因为 System V init 和其他老版本的程序依赖于一个特定的启动顺序，每次只能执行一个启动任务。
这种方式中的依赖关系很简单，然而性能却不怎么好，因为启动任务无法并行。另一个限制是你只能
执行启动顺序规定的一系列服务。如果你安装了新的硬件，或者需要启动一个新的服务，该版本的 init
并不提供一个标准的方法。systemd 和 Upstart 试图解决性能方面的问题，为了加快启动速度，它们
允许很多服务并行启动：    

+ systemd 是面向目标的。你定义一个你要实现的目标以及它的依赖条件。systemd 负责满足所有
依赖条件以及执行启动目标。
+ Upstart 则完全不同。它能够接收消息，根据接收到的消息来运行任务，并且产生更多消息，然后
运行更多任务。    

systemd 和 Upstart init 系统还为启动和跟踪服务提供了更高级的功能。在传统的 init 系统中，
服务守护进程是通过脚本文件来启动。一个脚本文件负责启动一个守护程序，守护程序脱离脚本自己运行。
新的 init 系统不是基于脚本文件，所以配置起来也相对简单。System V init 脚本包含很多相似
的命令来启动、停止和重启服务，而 systemd 和 Upstart 没有这么多冗余。    

systemd 和 Upstart 都对 System V 提供了向后兼容，如支持运行级别的概念。   

## 6.2 System V 运行级别    

可以通过 `who -r` 来查看系统的运行级别。   

## 6.3 识别你的 init

+ 如果系统中有目录 /usr/lib/systemd 和 /etc/systemd，说明有 systemd
+ 如果系统由目录 /etc/init，其中包含 .conf 文件，说明很可能是 Upstart
+ 如果以上都不是，且系统由 /etc/inittab 文件，采用的是 System V    

## 6.4 systemd

systemd 启动时的运行步骤：   

1. systemd 加载配置信息
2. systemd 判定启动目标，通常是 default.target
3. systemd 判定启动目标的所有依赖关系
4. systemd 激活依赖的组件并启动目标
5. 启动之后，systemd开始响应系统消息，并激活其他组件

systemd 最有特色的地方是它不仅仅负责处理进程和服务，还可以挂载文件系统、监控网络套接字
和运行时系统等。这些功能我们称之为 **单元**，它们的类别称为 **单元类型**，开启一个单元
称为 **激活**。    

这里我们列出 Unix 系统启动时需要使用到的单元类型：   

+ 服务单元：控制 Unix 上的传统服务守护进程
+ 挂载单元：控制文件系统的挂载
+ 目标单元：控制其余的单元，通常是通过将它们分组的方式     

默认的启动目标通常是一个目标单元，它依赖并组织了一系列的服务和挂载单元。     

### 6.4.1 systemd 中的依赖关系

Unix 的启动任务容错能力很强，一般的错误不会影响那些标准服务的启动。    

为了满足灵活和容错的要求，systemd 提供了大量的依赖类型和形式。基本类型有以下几个：   

+ Requires: 表示不可缺少的依赖关系。如果一个单元有此类型的依赖关系，systemd 会尝试激活
被依赖的单元，如果失败，systemd 会关闭被依赖的单元
+ Wants: 表示只用于激活的依赖关系。单元被激活时，它的 Wants 类型的依赖关系也会被 systemd
激活，但是 systemd 不关心激活成功与否
+ Requisite: 表示必须在激活单元前激活依赖关系。systemd 会在激活单元前检查其 Requisite
类型依赖关系的状态。如果依赖关系还没有被激活，单元的启动也会失败（这和 Requires 有什么区别）
+ Conflicts: 反向依赖关系。如果一个单元有 Conflict 类型的依赖关系，且它们已经被激活，
systemd 会自动关闭它们。同时启动两个有反向依赖关系的单元会导致失败。    

到目前为止，依赖关系没有涉及顺序。默认情况下，systemd 会在启动单元的同时启动其所有的
Requires 和 Wants 依赖组件。有时候单元必须顺序启动。可以使用下面的依赖关键字来设定顺序：   

- Before: 当前单元会在 Before 中列出的单元之前启动
- After: 当前单元在 After 中列出的单元之后启动   

### 6.4.3 systemd 配置

systemd 配置文件分散在系统的很多目录中，不止一处。但主要是分布在两个地方：系统单元目录
（全局配置，一般是 /usr/lib/systemd/system）和系统配置目录（局部配置，一般是 /etc/systemds/system）。    

以服务单元文件 sshd.service 为例：    

```
[Unit]
Description=OpenSSH server daemon
After=syslog.target network.target auditd.service

[Service]
EnvironmentFile=/etc/sysconfig/sshd
ExecStartPre=/usr/sbin/sshd-keygen
ExecStart=/usr/sbin/sshd -D $OPTIONS
ExecReload=/bin/kill -HUP $MAINPID

[Install]
WantedBy=multi-user.target
```    

这是一个服务单元，详细信息在 \[Service\]区块中，包括服务如何准备就绪、如何启动和重新启动。   

sshd.service 单元文件中的 \[Install\]区块很重要，因为它告诉我们怎样使用 systemd 的
WantedBy 和 RequiredBy 依赖关系。它能够开启单元，同时不需要任何对配置文件的更改。正常
情况下 systemd 会忽略 \[Install\]部分。然而在某种情况下，系统中的 sshd.service 被关闭，
你需要开启它。你开启一个单元的时候，systemd 读取\[Install\]区块。这时，开启 sshd.service
单元就需要去查看 multi-user.target 的 WantedBy 雨来关系。     

### 6.4.4 systemd 操作

我们主要通过 `systemctl` 命令与 systemd 进行诸如激活服务、关闭服务、显示状态、重新加载
配置等交互操作。    

最基本的命令主要用于获取单元信息。例如，使用 `list-units` 命令来显示系统中所有激活的单元
（实际上这是 systemctl 的默认命令，可以不指定）：   

`systemctl list-units`    

另一个有用的 `systemctl` 操作是获取单元的状态信息。    

`systemctl status media.mount`    

可以使用 `systectl start`, `systemctl stop` 和 `systectl restart` 命令来激活、关闭和
重启单元。但如果你更改了单元配置文件，你可以使用以下两种方法让 systemd 重新加载文件：  

+ `systemctl reload unit`：只重新加载 unit 单元的配置
+ `systemctl daemon-reload`：重新加载所有的单元配置    

### 6.4.5 在 systemd 中添加单元

在 systemd 中添加单元涉及创建和激活单元文件，有时候还要开启单元文件。将单元文件放入系统
配置目录 /etc/systemd/system。    

test1.target:   

```
[Unit]
Description=test 1
```   

test2.target, 其依赖于 test1.target:   

```
[Unit]
Description=test 2
Wants=test1.target
```    

