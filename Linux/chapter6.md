# 第六章 文件与目录

<!-- TOC -->

- [目录与路径](#目录与路径)
  - [目录相关操作](#目录相关操作)
- [文件与目录管理](#文件与目录管理)
  - [取得路径的文件名和目录名](#取得路径的文件名和目录名)
- [文件内容的查阅](#文件内容的查阅)
  - [修改文件时间或创建新文件：touch](#修改文件时间或创建新文件touch)
- [文件与目录的默认权限与隐藏权限](#文件与目录的默认权限与隐藏权限)
  - [文件隐藏属性](#文件隐藏属性)
  - [文件特殊权限：SUID，SGID，SBIT](#文件特殊权限suidsgidsbit)
  - [观察文件类型：file](#观察文件类型file)
- [文件的搜寻](#文件的搜寻)
  - [指令文件名的搜寻](#指令文件名的搜寻)
  - [文件文件名的搜寻](#文件文件名的搜寻)

<!-- /TOC -->

## 目录与路径

### 目录相关操作

+ cd: 变换目录
+ pwd: 打印当前目录
+ mkdir：创建新目录
+ rmdir：删除一个空目录     

```shell
$ pwd [-P]
-P: 显示本身路径，而不是链接路径
```    

```shell
$ mkdir [-mp] dirname

-m: 设置目录的权限
-p：帮你将所需要的目录递归创建起来

$ mkdir -m 777 db
$ mkdir -p test1/test2/test3
```    

```shell
$ rmdir [-p] dirname

-p: 连同上层空目录也删掉
```   

## 文件与目录管理

```shell
$ ls [-aAdfFhilnrRSt] filename/dirname
$ ls [--color={never, auto, always}] filename/dirname
$ ls [--full-time] filename/dirname

-a: 全部的文件，连同隐藏文件
-A：全部的文件，连同隐藏文件，但不包括 `.` 和 `..` 这两个
-d：仅列出目录本身，而不是列出目录内的文件数据
-f：直接列出结果，而不进行排序
-F：根据文件、目录等信息，给予附加数据结果
-h：将文件大小以人类易读方式列出来
-i：列出 inode 号码
-l：长数据串列出
-n：列出UID与GID而非使用名称
-r：将排序结果反向输出
-R：连同子目录内容一起列出来，等于该目录下的所有文件都会显示出来
-S：以文件大小排序而不是名字
-t：以时间排序
--time={atime,ctime}: 输出access 时间或者权限改变时间（ctime）而非修改时间
```   

```shell
$ cp [-adfilprsu] source destination
$ cp [options] source1 source2 source3 directory

-a: 相当于 -dr --preserve=all
-d: 如来源文件为链接文件，则复制链接文件属性而非文件本身
-f: 为强制的意思，若目标文件已经存在且无法打开，则移除后再尝试一次
-i: 若目标文件已经存在，在覆盖前会先询问
-l：进行硬链接的链接文件创建，而非复制文件本身
-p: 连同文件的属性（权限，目录，时间）一起复制过去
-r：递归复制
-s：复制为符号链接文件
-u: 只有目标文件比源文件旧才复制
--preserve=all:除了-p 的权限参数外，还加入了 SELinux 属性，links,xattr 也复制了
```    

具体的例子：    

```shell
$ cp -s bashrc bashrc_slink
$ cp -l bashrc bashrc_hlink
$ ls -al bashec*
-rw-r--r--.	2	root	root	176	Jun	11	19:01	bashrc									
-rw-r--r--.	2	root	root	176	Jun	11	19:01	bashrc_hlink
lrwxrwxrwx.	1	root	root			6	Jun	11	19:06	bashrc_slink	->	bashrc

$ cp bashrc_slink bashrc_slink1
$ cp -d bashrc_slink bashrc_slink2
$ ls -al bashrc*

-rw-r--r--.	2	root	root	176	Jun	11	19:01	bashrc
lrwxrwxrwx.	1	root	root			6	Jun	11	19:06	bashrc_slink	->	bashrc
-rw-r--r--.	1	root	root	176	Jun	11	19:09	bashrc_slink_1
lrwxrwxrwx.	1	root	root			6	Jun	11	19:10	bashrc_slink_2	->	bashrc
```    

也就是说默认情况如果源文件是软链接文件，则会复制原本的文件，而不是链接文件，`-d` 则就是复制链接文件本身。
还有一点，给软链接文件做一个硬链接的复制，最终是硬链接到原本的文件。    

```shell
$ rm [-fir] filename/dirname

-f: 忽略不存在的文件，不会出现警告信息
-i: 互动模式
-r: 递归删除
```     

```shell
$ mv [-fiu] source destination
$ mv [-options] source1 source2 source3 ...  directory

-f: 如果目标文件已存在，不会询问而是直接覆盖
-i: 询问是否覆盖
-u：只有在 source 比较新时才会更新
```    

### 取得路径的文件名和目录名

```shell
$ basename /etc/sysconfig/network
network     // 文件名
$ dirname /ect/sysconfig/network
/etc/sysconfig    // 目录名
```    

## 文件内容的查阅

+ cat: 从第一行开始显示文件内容
+ tac：从最后一行开始显示
+ nl：显示的时候附加行号
+ more：一页一页的显示文件内容
+ less：与more类似，但是可以往前翻页
+ head：只看头几行
+ tail: 只看尾部几行
+ od: 以二进制的方式读取文件内容      

```shell
$ cat [-AbEnTv] filename

-A: 相当于 -vET，可以列出一些特殊字符而不是空白而已
-b：列出行号，仅针对非空白行做行号显示
-E：将结尾的断行字符 $ 显示出来
-n：列出行号，空白行也有行号
-T：将 tab 键以 ^I 显示出来
-v: 列出一些看不出来的特殊字符
```    

tac 就是反向显示，但是主要选项是与 `cat` 不一样的。    

```shell
$ nl [-bnw] filename

-b: 指定行号的方式，主要有两种：
    -b a: 表示无论是否空行，也同样列出行号
    -b t：如果有空行，空的那一行不要列出行号
-n：列出行号表示的方法，主要有3种：
    -n ln：行号靠左显示
    -n rn:行号在靠右显示，且不加0
    -n rz：行号靠右显示，并前补零
-w：行号字段占用的字符数  
```    

在 `more` 运行的过程中，有以下几个按键会有作用：    

+ 空格键：向下翻一页
+ Enter：向下翻一行
+ /string：代表在内容中向下搜索 string
+ `:f`：立刻显示出文件名及目前显示的行数
+ `q`：退出
+ `b`：往回翻页

`less` 的特殊按键：    

+ 空格：下翻一页
+ pageDown, pageUp：后翻，前翻
+ /string：向下搜
+ ?string：向上搜
+ n：重复前一个搜索
+ N：反向的重复前一个搜索
+ g：前进到这个数据的第一行去
+ G：前进到这个数据的最后一行去
+ q：退出    

```shell
$ head [-n number] filename

-n：代表显示几行的意思，默认是10行
```    

number 也可以是负数，如果是负数，例如 -n -100，代表列前的所有行数，但不包括最后的100行。    

```shell
$ tail [-n number] filename
```   

与 `head` 类似，当这样使用时 `tail -n +100` 代表该文件从100行以后都列出来，前99行省略（行号以1开始）。     

### 修改文件时间或创建新文件：touch

每个文件在 Linux 下有3个主要的变动时间：    

+ modification time(mtime)：当文件的内容数据变更时，更新这个时间
+ status time(ctime)：当文件的“状态”改变时，就会更新这个时间，例如，文件的权限与属性改变，会更新这个时间
+ access time(atime)：当“该文件的内容被取用”时，就会更新这个读取时间。   

```shell
$ touch [-acdmt] filename

-a：就修正 access time
-c：修改文件的时间，若该文件不存在则不创建新文件
-d：后面可以接欲修订的日期而不用当前的日期，也可以使用 `--date="日期"` 的格式
-m：仅修改 mtime
-t：后面可以接欲修订的日期而不用当前的日期，格式为 [YYYYMMDDhhmm]
```    

## 文件与目录的默认权限与隐藏权限

除了基本的r,w,x 权限外，在Linux 传统的 Ext2/Ext3/Ext4 文件系统下，我们还可设置其他的系统隐藏属性，这部分可以使用 chattr 设置，而以 lsattr 来查看。不过在 CentOS7.x当中利用 xfs作为默认文件系统，但是 xfs 没有支持所有的 chattr 的参数，仅支持部分参数。     

```shell
$ umask
0022   -> 与一般权限有关的是后面三个数字
$ umask -S
u=rwx, g=rx, o=rx
```    

### 文件隐藏属性

```shell
$ chattr [+-=][ASacdistu] filanem/dirname

+：增加某一个特殊参数，其他原本存在参数则不动
-：移除某一个特殊参数，其他原本存在参数则不动
=：设置一定且仅有后面接的参数

A：当设置了 A 这个属性时，若你有存取此文件（或目录）时，它的存取时间 atime 将不会被修改
S：一般文件是非同步写入磁盘的，如果加上 S，当你进行任何文件的修改，该变动会同步写入磁盘中
a：当设置a之后，这个文件将只能增加数据，而不能删除也不能修改数据，只有 root 才能设置这属性
c：设置这个属性，将会自动的将文件”压缩”，在读取的时候将会自动解压缩
d：当 dump 程序被执行时，设置 d 属性将可使该文件（或目录）不被 dump备份
i：可以让一个文件“不能被删除、改名、设置链接，也无法写入或新增数据”，只有root才能设置这个属性
s：设置这个属性，如果文件被删除，会被完全的移除硬盘空间
u：与s相反，当使用u来设置文件时，如果文件删除了，数据内容还存在磁盘中
```    

xfs	文件系统仅支持	AadiS 而已。    

```shell
$ lsattr [-adR] filename/dirname

-a：将隐藏文件的属性也展示出来
-d：如果接的是目录，仅列出目录本身的属性而非目录内的文件名
-R：连同子目录的数据也一并列出来
```    

### 文件特殊权限：SUID，SGID，SBIT

**Set UID**   

当 s 这个标志出现在文件拥有者的 x 权限上时，此时就被称为 Set UID，简称为 SUID 的特殊权限，基本上 SUID 有这样的限制和功能：   

+ SUID 权限仅有二进制程序有效
+ 执行者对于该程序需要具有 x 的可执行权限
+ 本权限仅在执行程序的过程中有效
+ 执行者将具有该程序拥有者的权限   

**Set GID**    

当 s 标志在文件所属群组的 x 位置则称 Set GID 即SGID。与SUID不同的是，SGID可以针对文件或目录设置。如果是对文件来说，SGID有如下的功能：    

+ SGID 对二进制程序有用
+ 程序执行者对于该程序来说，需具备 x 的权限
+ 执行者在执行过程中将会获得该程序群组的权限    

当一个目录设置了 SGID的权限后，他将具有如下的功能：    

+ 使用者若对于此目录具有 r 与 x 的权限，该使用者能够进入此目录
+ 使用者在此目录下的有效群组将会该目录的群组
+ 用途：若使用者在此目录下具有 w 的权限，则使用者所创建的新文件的群组与此目录的群组相同。     

**Sticky Bit**    

Sticky Bit，SBIT 目前只对目录有效，SBIT对于目录的作用是：    

+ 当使用者对于此目录具有 w, x 权限
+ 当使用者在该目录下创建文件或目录时，仅有自己与 root 才有权力删除该文件    

如果在之前使用数字的方式变更权限的时候，在3个数字前再加上一个数字的话，最前面的那个数字就代表者几个权限了：    

+ 4为SUID
+ 2为SGID
+ 1为SBIT    

当然使用符号的形式也可以，其中 SUID 为 u+s，而 SGID 为 g+s，SBIT则是 o+t。      

### 观察文件类型：file

略。    

## 文件的搜寻

### 指令文件名的搜寻

应该是使用 whick 或 type 来搜寻可执行文件的位置。    

```shell
$ which [-a] command   

-a：将所有可以在 PATH 目录中可以找到的指令均列出，而不止第一个找到的指令。     
```   

`which` 是从 PATH 内的目录中寻找可执行文件的位置，不过有点命令例如 `history` 属于 bash 内置的命令就找不到。    

### 文件文件名的搜寻

通常先使用 `whereis` 或 `locate` 来检查，如果真的找不到，就使用 `find`。因为 `whereis` 只找系统中某些特定目录下的文件而已，`locate` 则是利用数据库来搜寻文件名。     

```shell
$ whereis [-bmsu] filename/dirname

-l：可以列出 whereis 会去查询的几个主要目录而已
-b：只找 binary 格式的文件
-m：只找在说明文档 manual 路径下的文件
-s：只找 source 来源文件
-u：搜寻不在上述三个项目当中的其他特殊文件
```    


```shell
$ locatee [-ir] keyword

-i：忽略大小写
-c：不输出文件名，仅计算找到的文件数量
-l：仅输出几行的意思，例如输出五行则是 -l 5
-S：输出 locate 所使用的数据库文件的相关信息，包括该数据库记录的文件/目录数量等
-r：后面可接正则表达式的显示方式
```    

locate 的数据库的创建默认是每天执行一次（每个 distribution 都不同），所以当我们新创建的文件，却在数据库更新之前搜寻该文件，就会找不到。     

更新数据库就直接输入 `updatedb` 就可以。      

```shell
$ find [PATH] [option] [action]

1. 与时间有关的选项：共有 -atime, -ctime, -mtime，以 -mtime 为例：
    -mtime n：n为数字，意义为 n 天之前的“一天之内”被更动过内容的文件
    -mtime +n：列出 n 天之前（不含n天）被更动过内容的文件
    -mtime -n：列出 n 天之内（含n天）被更动过内容的文件
    -newer file：file 为一个存在的文件，列出比 file 还要新的文件

$ find / -mtime 0    // 找出过去系统上24小时内更动过的文件
$ find /etc -newer /etc/passwd     // 找出 /etc 中比 /etc/passwd 更新的文件
```   

注意一下这里指明是一个 PATH，说明要么能查出很多文件，要么根据下面指定的选项来查找指定名字的文件。    

```shell
2. 与使用者或群组名称有关的参数
    -uid n: n 为数字，即使用者的 ID
    -gid n: 群组ID
    -user name: 使用者名称
    -group name：群组名称
    -nouser：寻找文件的拥有者不在 /etc/passwdd 中的文件
    -nogroup：略。     
    当我们自行安装软件时，很可能该软件的属性当中没有文件拥有者，这是可能的

3. 与文件权限及名称有关的参数
    -name filename：搜寻文件名称为 filename 的文件
    -size [+-]SIZE：搜寻比 SIZE 还要大(+)或小(-)的文件。这个 SIZE 的规格有：
                    c：代表 Byte，k：代表 1024 Bytes。所以要找比50KB还要大的文件，就是 "-size +50k"
    -type TYPE    ：搜寻文件类型为 TYPE，类型主要有：一般正规文件（f），设备文件                   b, c），目录（d），链接文件（l），socket（s），及FIFO（p）等                 属性
    -perm mode    ：搜寻文件权限“刚好等于” mode 的文件，这个 mode 为类似 chmod 的属性值
    -perm -mode   ：搜寻文件权限“必须要全部囊括 mode 的权限”的文件
    -perm /mode   ：搜寻文件权限“包含任一 mode 的权限”的文件

4. 额外可进行的动作：
    -exec command ：command 为其他指令，-exec 后面可再接额外的指令来处理搜寻到的结果。
    -print        ：将结果打印到屏幕上，这个动作是默认动作
```    

`find` 的特殊功能就是能够进行额外的动作，以如下的例子说明：`find /usr/bin /usr/sbin -perm /7000 -exex ls -l {} \;`    

+ `{}` 代表的是“由 find 找到的内容”，find 的结果会被放置到 `{}` 位置中；
+ `-exec` 一直到 `\;` 是关键字，代表find 额外动作的开始`-exec` 到结束 `\;`，在这中间的就是 find 指令内的额外动作，在本例中就是 `ls -l {}`
+ 因为 `;` 在 bash 环境下有特殊的意义，因此使用反斜线转义