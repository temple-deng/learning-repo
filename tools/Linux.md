# Linux part1

## 计算机概论

### 计算机硬件

CPU 为一个具有特定功能的芯片，里头含有微指令集，如果想要让主机进行什么特异的功能，就得参考
CPU是否有相关的内置的微指令集才可以。由于 CPU 的工作主要在于管理和运算，因此在 CPU 内又
可分为两个主要的单元，分别是 **算术逻辑单元** 和 **控制单元**。其中算术逻辑单元主要负责程序
运算和逻辑判断，控制单元则主要协调各组件和各单元间的工作。   

CPU 读取的数据都是从内存读取来的，内存内的数据则是从输入单元传输进来的，而 CPU 处理完的数据也
要先写会内存中，最后数据从内存传输到输出单元。   

CPU指令集分两类：精简指令集（RISC）和复杂指令集（CISC）。   

### 操作系统

操作系统也是一组程序，这组程序的重点在于管理计算机的所有活动以及驱动系统中的所有硬件。这些任务都是
由操作系统的内核完成的。由于内核主要在于管控硬件与提供相关的能力，这些管理的操作是非常重要的，如果用户
能够直接使用内核的话，万一用户不小心将内核程序停止或破坏，将导致整个系统的崩溃。因此内核程序所放置到
内存中的区块是受保护的，并且开机后就一直常驻内存当中。   

既然硬件都由内核管理，开发时就需要参考内核提供的功能。但是通常操作系统会提供一整组的开发接口
给开发者，所有就变成了针对这些接口开发，内核的系统调用会将开发语言写成的程序转换为内核功能。   

所以整个操作系统可以分为两部分：内核，系统调用。   

具体的内核功能：  

+ 系统调用
+ 程序管理
+ 内存管理
+ 文件系统管理，例如数据的I/O工作，对不同文件格式的支持
+ 设备驱动，不过驱动程序通常是由硬件厂商提供的  

## Linux

### 内核版本

Linux 的内核版本编号类似下面的形式：  

```
2.6.18-92.e15
主版本.次版本.释出版本-修改版本
```   

+ 主、次版本为奇数：开发中版本
+ 主、次版本为偶数：稳定版本   

释出版本时在主、次版本架构不变的情况下，新增功能累积到一定程序后所新释出的内核版本。如果
你有针对某个版本的内核修改过部分的程序代码，可以在这个修改的过的内核版本后加上修改版本。   

Linux 的发行版本可以分为两类：一种是使用RPM 方式安装软件的系统，包括 Red Hat, Fedora, SuSE等都是这类，
一种则是用 Debian 的 dpkg 方式安装软件的系统，包括 Debian, Ubuntu, B2D等。   

## 主机规划与磁盘分区

### 各硬件在Linux中的文件名

在Linux 中，每个设备都被当成一个文件来对待。  

| 设备 | 文件名 |
| :------------- | :------------- |
| IDE 硬盘 | /dev/hd[a-d] |
| SCSI|SATA|USB 硬盘 | /dev/sd[a-p] |
| U 盘 | /dev/sd[a-p]（与SATA 相同）|
| 当前鼠标 | /dev/mouse |

### 磁盘分区

磁盘的每个扇区大小为 512bytes。整块磁盘的第一个扇区很重要，因为其记录了整块磁盘的两个重要信息：  

+ 主引导分区(MBR): 可以安装引导加载程序的地方，446bytes。
+ 分区表：64bytes。   

在分区表的64B容量中，分成4组记录去，每组记录区记录了该区段的起始和结束的柱面号码。   

由于分区表只有64bytes，最多只能容纳4个分区，这4个分区成为主分区或扩展分区。   

+ 其实所谓的分区只是针对那个 64bytes 的分区表进行设置而已。   
+ 硬盘的默认分区表只能写入4组分区信息。
+ 分区的最小单位为柱面。   

扩展分区的目的是使用额外的扇区来记录分区信息，扩展分区本身不能格式化。   

由扩展分区继续划分出来的叫逻辑分区。   

分区号方面，前面4个号码都是保留给主分区和扩展分区的，所有逻辑分区的设备名称号码由5号开始。   

+ 扩展分区最多只能有1个

## 登录与 man page

`[dengbo@www ~]$`: 最左边的是用户的账号，@之后的是主机名，~ 指的是当前所在目录，$ 是提示符。    

~ 代表的是用户的主文件夹，默认 root 的提示符是 #，一般用户的提示符是 $。   

### 命令

`command [-options] parameter1 parameter2`   

+ 一行命令第一个输入的部分绝对是命令或可执行文件
+ parameter1, parameter2...为依附在 option 后面的参数，或者是命令的参数。
+ 命令太长的时候，可以使用反斜杠\ 换行。
+ 在 Linux 中，大小写是不一样的   

### 基础的命令

+ 显示日期和时间： date
+ 显示日历： cal

### 按键

tab 跟在第一个命令后就是命令补全，否则就是文件名补全。ctrl + c 中断当前程序。

### man page

在查询数据后面的数字是有意义的。    

| 数字 | 代表 |
| :------------- | :------------- |
| 1 | 用户在 shell 环境中可以操作的命令或可执行文件 |
| 2 | 系统内核可调用的函数与工具等 |
| 3 | 一些常用的函数与函数库 |
| 4 | 设备文件的说明，通常在 /dev 下的文件 |
| 5 | 配置文件或者是某些文件的格式 |
| 6 | 游戏 |
| 7 | 惯例与协议等，例如文件系统，网络协议等 |
| 8 | 系统管理员可用的管理命令 |
| 9 | 跟 kernel 有关的文件 |   

## 文件权限与目录配置

root 的相关信息记录在 /etc/passwd 文件内，个人的密码记录在 /etc/shadow 文件下。所有组名
记录在 /etc/group 内。   

### 文件属性

ls -al 命令结果各列的意义 [权限] [连接] [所有者] [用户组] [文件容量] [修改日期] [文件名]：   

1. 代表文件的类型及权限，第一个字符代表文件是 **目录，文件还是连接文件**：   
  - d 则是目录
  - - 是文件
  - l 表示连接文件
  - b 表示设备文件里面的可供存储的接口设备
  - c 表示设备文件里面的串行端口设备，例如键盘。
接下来的3个一组都是权限咯，- 代表没有这个权限，第一组为文件所有者权限，第二组为同用户组的权限，第三组为
其他非本用户组的权限。注意文件与目录权限的意义不一样，后面详细讲。
2. 第二列表示有多少文件名连接到此节点（i-node）：每个文件都会将其权限与属性记录到文件系统的 i-node 中，不过我们
使用的目录树却是使用文件名来记录，因此每个文件名会连接到一个 i-node。这个属性记录的就是有多少个不同的文件名连接
到相同的一个 i-node 号码。  
3. 第三列表示文件或目录的所有者
4. 代表这个文件所属的用户组
5. 文件的容量大小，默认单位为B
6. 文件的创建日期或最近修改日期
7. 文件名

### 改变权限

+ chgrp: 改变文件所属用户组
+ chown: 改变文件所有者
+ chmod: 改变文件的权限   

```
chgrp [-R] groupname dirname/filename   
// -R: 进行递归的更改，即连同子目录下的所有文件，目录都更新成这个用户组
// 例子
chgrp users install.log
```   

```
chown [-R] username dirname/filename
// -R：还是递归
// 例子
chown bin install.log
```   

chown 也可以使用 `chown user.group file` ，不过由于账号中也可能有小数点，所以一般建议
使用冒号 ":" 来隔开所有者和用户组。此外，还可以单纯的修改所属用户组，例如 `chown .sshd install.log`。    

```
chmod [-R] xyz dirname/filename

-R 递归
xyz: 就是数字类型的权限属性，为rwx数值的相加，r=4, w=2, x=1

chmod 777 .bashrc
```    

还有一个改变权限的方法，使用u,g,o来代表3种身份，a代表all。   

```
chmod u=rwx,go=rx .bashrc
chmod a+w .bashrc
chmod a-x .bashrc
```   

### 权限的意义

+ 权限对文件的意义：  
  - r：可读取文件的内容。
  - w：可以编辑、修改文件的内容，但不含删除文件
  - x：执行咯
+ 权限对目录的意义：
  - r：表示具有读取目录结构列表的权限
  - w：表示具有更改目录结构列表的权限，具体来说：新建新的文件和目录，删除已存在的目录与文件，重命名文件及目录，移动目录内文件及目录的位置
  - x：表示用户能否进入该目录成为工作目录的用途，应该是例如使用 cd 进入吧

### 目录

FHS 定义的目录架构：   

+ / 根目录：与开机系统有关
+ /usr (Unix software resource): 与软件安装/执行有关
+ /var: 与系统运作过程有关

根目录下的目录：   

| 目录 | 应放置文件内容 |
| :------------- | :------------- |
| /bin | 系统有很多放置执行文件的目录。但/bin比较特殊，其中放置的文件是在单用户维护模式下还能被操作的命令  |
| /boot | 放置开机会用到的文件，包含内核文件等 |
| /dev | 设备文件 |
| /etc | 系统主要的配置文件 |
| /home | 系统默认的用户主文件夹 |
| /lib | 开机时会用到的函数库，以及在 /bin 或 /sbin 下面的命令会调用的函数库 |
| /opt | 给第三方软件放置的目录 |
| /root | 系统管理员的主文件夹 |
| /sbin | 系统中有一些设置系统环境的命令，这些命令只有 root 能使用 |
| /srv | service，在一些网络服务启动后，这些服务所需要取用的数据目录 |
| /tmp | 临时存放呗 |

## 文件与目录操作

### 目录操作

\- 代表前一个工作目录，~代表当前用户的主文件夹，~account代表 account 这个用户的主文件夹。   

+ cd: 切换目录
+ pwd: 显示当前目录
+ mkdir: 新建目录
+ rmdir: 删除空的目录    

```shell
mkdir [-mp] dirname

-m: 直接配置目录的权限，忽视默认权限
-p: 可以递归的创建目录   

mkdir -p test1/test2/test3/test4   
# 这就是递归创建，不加 p 参数的话会创建失败

mkdir -m 777 test2
```   

```shell
rmdir [-p] dirname  

-p: 连同上层的空目录也删除
```   

### $PATH

当执行命令的时候，例如 "ls"，系统会依照 PATH 的设置去每个 PATH 定义的目录中查询文件名为 ls
的可执行文件，如果在 PATH 定义的目录中含有多个名为 ls 的可执行文件，那么先查询到的先被执行。   


可以使用 `echo $PATH` 查看当前有哪些目录定义在 PATH 中，以冒号分隔。   

不同身份用户默认的 PATH 是不同的，默认能随意执行的命令也不同。    

### 文件操作

ls  

```
ls [-aAdfFhilnrRSt] dirname
ls [--color={never, auto, always}] dirname

-a: 全部文件，连同隐藏文件
-A: 同 a，但不包含 . , .. 这两个目录
-d: 仅列出目录本身，而不是列出目录内容的文件数据
-f: 直接列出结果，而不进行排序
-F: 根据文件、目录等信息给予附加的数据结构
-h: 将文件容量以易读的方式（GB, KB等）列出来
-i: 列出 inode 号码
-l: 列出长数据串
-n: 列出UID 与GID，而不是用户及用户组名称
-r: 排序结果反向输出
-R: 连同子目录内容一起列出来，等同于该目录下所有文件都会显示出来
-S: 以文件容量大小排序
-t: 时间排序
```   

cp 除了复制文件，还可以创建连接文件，对比两文件的新旧给予更新，复制整个目录等。 mv 可以用来重命名及移动。   

```shell
cp [-adfilprsu] source destination
cp [options] source1 source2 ...  destination # 源文件有多个，最后的目的文件一定要是目录

-a: 相当于 -pdr
-d: 若源文件为连接文件，则复制连接文件属性而非文件本身
-f: 强制，若目标文件存在且无法开启，则删除后再尝试一次
-i: 若目标文件已存在，覆盖时会先询问
-l: 进行硬连接的连接文件创建，而非复制文件本身
-p: 连同文件的属性一起复制，而非使用默认属性
-r: 进行递归复制
-s: 复制成为符号连接文件，即“快捷方式”文件
-u: 若目标文件比源文件旧才更新目标文件   
```

```shell
rm [-rif] dirname/filename

-r: 递归
-f: 强制
-i: 询问  
```

```shell
mv [-fiu] source destination
mv [option] source1 source2 ... destination

-f: 强制，直接覆盖
-i: 询问
-u: 只有更旧时更新
```   

## bash

### 变量功能

##### 变量的显示与设置

可以利用 echo 命令显示变量，但是变量在被显示时，前面必须加上字符 "$" 才行，或者使用 ${变量}的形式：   

```
echo $variable
echo $PATH
echo ${PATH}
```   

设置变量的值就和平时编程时的赋值语句一样，例如：  

```shell
hehe=123
echo ${hehe}  # 123
```  

变量的设置需要符合一些规则：   

1. 变量与变量内容以一个等号 "=" 连接
2. 等号两边不能直接接空格符，例如这样是错误的 `myName=Temple deng`
3. 变量名字只能是英文字符和数字，但是开头字符不能是数字
4. 变量内容若有空格可以使用双引号或者单引号引起来，不过有下面区别：
  - 双引号内的特殊字符如 $，可以保持原本的特性，例如，若 `var="lang is $LANG"`，而变量LANG的值为"en_US",
  则 `echo $var` 结果为 `lang is en_US`
  - 单引号内的特殊字符则视作普通文本字符，不予处理
5. 可以使用转义字符 "\\" 将特殊字符转义，不过这种转义应该是在引号外有效
6. 在一串命令中，还可以通过其他的命令提供的信息，可以使用反单引号 \`命令\` 或 $(命令)，例如想要
取得内核版本的设置 `version=$(uname -r)`,则 version 的值为 2.6.18-125.el5.
7. 若该变量为了增加变量内容时，最可用 $变量名称 或 ${变量名称} 累加内容，例如 `PATH="$PATH":/home/bin`,
注意引号可加可不加
8. 若变量需要在其他子进程执行，则需要使用 export 来使变量变成环境变量 `export PATH`
9. 通常大写字符为系统默认变量
10. 取消变量的方法为使用 unset 变量名称

### 环境变量

使用 env 列出当前 shell 环境下所有的环境变量。   

bash 中除了环境变量，还有一些与 bash 操作接口有关的变量，以及用户自己定义的变量。使用 set
可以查看所有的这些变量。下面列举一些其中重要的变量：   

+ PS1
  - 这就是“命令提示符”
  - \d: 可显示出星期，月，日
  - \H: 完整的主机名
  - \h: 仅显示出主机名第一个小数点前的名字
  - \t: 显示时间，24小时制，"HH:MM:SS"
  - \T: 12小时制，"HH:MM:SS"
  - \A: 24小时制，"HH:MM"
  - \@: 12小时的 "am/pm" 格式
  - \u: 用户账户名
  - \v: bash 的版本信息
  - \w: 完整的工作目录名称，但主文件夹以 ~ 代替
  - \W: 最后一个目录名
  - \#: 执行的第几个命令
  - \$: 提示符，root 为#，否则就是$
+ $: $ 本身也是个变量。代表目前 shell 的线程代号，即 PID
+ ?: 这个变量是上一个执行命令所回传的值，当我们执行某些命令时，这些命令都会回传一个执行后的代码。一般
来说，如果成功执行该命令，会回传一个0值，如果发生错误，会回传错误代码   

环境变量与自定义变量的区别就是环境变量会被子进程继承，而自定义变量不会。   

### 变量键盘读取、数组与声明：read, array, declare

+ read:  要读取来自键盘输入的变量，就使用 read 命令。    

```shell
read [-pt] variable

-p: 后面可以接提示符
-t: 后面可以接等待的秒数

read atest   # 让用户由键盘输入内容，将该内容变成名为 atest 的变量，例如输入 haha
echo $atest  # haha

read -p "Please keyin your name: " -t 30 name
```   

+ declare: declare 或 typeset 是一样的功能，就是声明变量的类型。如果使用 declare 后面
没有接任何参数，那么bash会主动将所有的变量名称与内容全部调出来，就好像使用set一样。   

```shell
declare [-aixr] variable

-a: 将后面的变量声明成数组类型
-i: 将后面变量声明成整数类型
-x: 用法同 export, 将后面变量变成环境变量
-r: 将变量设置为只读

declare -i sum=1+2
```   

变量类型默认为字符串，所以不指定变量类型，则 1+2 为字符串。bash中的数值运算，默认最多只能
到达整数类型，所以1/3结果是0。    

在bash里，数组的设置方式是 var[index]=content。   

### 变量内容的删除、替代与替换

```shell
# 假设现在让 path 内容与 PATH 相同
path=${PATH}
# 之后假设我们想将结果中的前两个目录删除掉
echo ${path#/*kerberos/bin:}

${variable#/*kerberos/bin:}

# # 号代表从变量内容最前面开始向右删除，且仅删除最短的那个
# # 号后面的代表要删除的部分， *是通配符，代表0到任意个任意字符
```   

+ #: 其实就是匹配最短的部分吧
+ ##：这就是匹配最长的部分了   
+ %：从后面向前删除内容了
+ %%    

替换：   

```shell
echo ${path/sbin/SBIN}  # 将path 中的 sbin 替换为 SBIN  
```   

| 变量设置方式 | 说明 |
| :------------- | :------------- |
| ${变量#关键字} | 若变量内容从头开始的数据符合关键字，则将符合的最短数据删除，也就是说，如果开头部分不匹配，就没效果了 |   
| ${变量%关键字} | 同上，不过是从尾部开始 |
| ${变量/旧字符串/新字符串} | 只替换第一个匹配的字符串 |
| ${变量//旧字符串/新字符串} | 替换全部匹配的字符串 |

变量的测试与内容替换（注意下面表格中的 str 应该是变量名，而 expr 也可以加 $expr 的形式引用变量值，不过如果
没有 $ 的话就是普通字符串吧）：   

| 变量设置方式 | str 没有设置 | str 为空串 | str 为非空串的值 |
| :------------- | :------------- | :------------- | :------------- |
| var=${str-expr} | var=expr  | var= (这个其实也是等于$str吧，只不过时空串)| var=$str |
| var=${str:-expr} | var=expr | var=expr | var=$str |
| var=${str+expr} | var= | var=expr | var=expr |
| var=${str:+expr} | var= | var= | var=expr |
| var=${str=expr} | str=expr var=expr | str 不变 var= | str 不变 var=$str |
| var=${str:=expr} | str=expr var=expr | str=expr var=expr | str 不变 var=$str |
| var=${str?expr} | expr 输出至 stderr | var= | var=str |
| var=${str:?expr} | expr 输出至 stderr | expr 输出至 stderr | var=str |   

### 命令别名

`alias lm='ls -l | more'`   

取消别名： `unalias lm`   

### 通配符与特殊符号

| 符号 | 意义 |
| :------------- | :------------- |
| * | 代表0个到无穷多个任意字符 |
| ? | 代表一定有一个任意字符 |
| [] | 字符组 |
| [-] | 懒得介绍了 [a-z] 里面的那个 - |
| [^] | 同理，反向 |

特殊符号：   

| 符号 | 内容 |
| :------------- | :------------- |
| # | 注释的标识吧，后面的内容当做注释 |
| \ | 转义字符 |
| 就是管道符的那个斜杠，打不出来 | 管道符 |
| ; | 连续命令执行分隔符 |
| ~ | 用户主文件夹 |
| $ | 变量前导符 |
| & | 作业控制 |
| ! | 逻辑非 |
| / | 目录符号，路径分隔符 |
| >, >> | 数据流重定向，输出导向，分别是“替换”和“累加” |
| <, << | 数据流重定向，输入导向 |
| () | 在中间为子 shell 的起始于结束 |


### 重定向

+ 标准输入：代码为0，使用 < 或 <<
+ 标准输出：代码为1，使用 > 或 >>
+ 标准错误输出：代码为2，使用 2> 或 2>>

### 命令执行的判断依据：;, &&, ||

没错就是如你想象的那样，; 两边的两个命令互不相干， && 在前面的命令执行正确时，才执行后面的命令，
如果前面的命令出错，就不执行后面的命令， || 在前面的命令正确时就不执行后面的，错误就执行。    

### 管道命令

管道命令"|"仅能处理经由前一个命令传来的正确信息，也就是标准输出的信息，对于标准错误的信息并没有
直接处理的能力。    

在每个管道后面接的第一个数据必定是命令，而且这个命令必须能接收标准输入的数据才行。   

+ cut: 将信息的某一段“切出来”，处理的信息以“行”为单位。   

```shell
cut -d '分隔字符' -f field <== 用于分隔字符
cut -c 字符范围

-d: 后面接分隔字符，与 -f 一起使用
-f: 依据 -d 的分隔字符将一段信息切割成数段，-f 取出第几段的意思
-c: 以字符的单位取出固定字符区间

echo $PATH | cut -d ':' -f 5
# 以:分隔，取出第5段内容，索引由1开头，不包括分隔符

echo $PATH | cut -d ':' -f 3,5  

export | cut -c 12-
# 这个意思，export 的数据有多行，每行取出从第 12个字符开始到之后的字符
```   

+ grep: 分析一行信息，若当中有我们想要的信息，就将该行拿出来   

```shell
grep [-acinv] [--color=auto] '查找字符串' filename   

-a: 将二进制文件以文本文件的方式查找数据
-c: 计算找到查找字符串的次数
-i: 忽略大小写的不同，所以大小写视为相同
-n: 顺便输出行号
-v: 反向选择
```    

## 正则表达式与文件格式化处理

### sed

sed 本身也是管道命令，可以分析标准输入，而且sed 还可以将数据进行替换、删除、新增、选取特定行的功能。    

```shell
sed [-nefr] [动作]

-n: 使用安静模式，在一般 sed 用法中，所有来自 STDIN 的数据都会列出到屏幕上，但如果
    加上 -n 后，则只有经过 sed 特殊处理的那一行（或者操作）才会被列出来。
-e: 直接在命令行模式上进行 sed 的动作编辑
-f: 直接将 sed 的动作写在一个文件内，-f filename 则可以执行filename内的 sed 动作
-r: sed 的动作支持的是扩展型正则表达式的语法（默认是继承正则表达式语法）
-i: 直接修改读取的文件内容，而不是由屏幕输出

动作说明  [n1 [, n2]]function  
n1, n2: 不见得会存在，一般代表选择进行动作的行数。   

function有下面的参数：   
a: 新增，a 的后面可以接字符串，而这些字符串会在新的一行出现（目前的下一行）
c: 替换，c 的后面可以接字符串，这些字符串可以替换n1, n2 之间的行
d: 删除，d 后面通常不接任何参数
i: 插入， i 的后面可以接字符串，而这些字符串会在新的一行出现（目前的上一行）
p: 打印
s: 替换，通常这个动作可以搭配正则表达式
```    

+ 以行为单位的新增/删除

```shell
nl /etc/passwd | sed '2,5d'

# 将 /etc/passwd 的内容列出并且打印行号，同时，删除2~5行

nl /etc/passwd | sed '3,$d'

# 删除第3到最后一行，$代表最后一行

nl /etc/passwd | sed '2a drink tea'

# 在第二行后，即加在第3行，加上 "drink tea"
```   

+ 以行为单位的替换与显示功能   

```shell
nl /etc/passwd | sed '2,5c No 2-5 number'

# 将2-5行内容替换成为 No 2-5 number

nl /etc/passwd | sed -n '5,7p'

# 列出 5-7 行
```    

+ 部分数据的查找替换

```shell
sed 's/oldstr/newstr/g'
```    

### awk

`awk '添加类型1{动作1} 条件类型2{动作2} ...' filename`  

awk 可以处理后续接的文件，也可以读取来自前个命令的标准输出。awk 主要是处理每一行字段内的数据，
而默认的字段的分隔符为空格键或 tab 键。   

`last -n 5 | awk '{print $1 "\t" $3}'`   

每一行的每个字段都是有变量名称的，那就是$1, $2 等变量名称，$0代表一整行的数据。整个 awk 的处理流程：  

1. 读入第一行，并将第一行的数据填入$0, $1, $2 等变量当中
2. 依据条件类型的限制，判断是否需要进行后面的动作
3. 做完所有的动作与条件类型
4. 若还有后续的“行”的数据，则重复上面1-3的步骤，直到所有数据读完   

内置变量：   

| 变量名称 | 代表意义 |
| :------------- | :------------- |
| NF | 每一行($0)拥有的字段总数 |
| NR | 目前 awk 所处理的是第几行数据 |
| FS | 目前的分隔字符，默认是空格键 |   

`last -n 5 | awk '{print $1 "\t" lines: NR \t columns: NF}'`   

`cat /etc/passwd | awk '{FS=":"} $3 < 10 {print $1 "\t" $3}'`   

在上面的例子中，第一行没有正确的显示，因为在读入第一行的时候，那些变量$1,$2 等还是以空格键分隔的，
虽然我们定义了 FS=":"，却只能在第二行才开始生效。这里就可以利用 BEGIN,END 关键字：   

`cat /etc/passwd | awk 'BEGIN {FS=":"} $3 < 10 {print $1 "\t" $3}'`   

+ 所有 awk 的动作，如果有需要多个命令辅助时，可利用";" 间隔
+ 在 awk 当中，变量可以直接使用，不需加上 $ 符。   