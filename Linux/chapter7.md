# 第七章 Linux 磁盘和文件系统管理

<!-- TOC -->

- [7.1 认识Linux 文件系统](#71-认识linux-文件系统)
- [Linux 的 EXT2 文件系统](#linux-的-ext2-文件系统)
  - [与目录树的关系](#与目录树的关系)
  - [Linux 文件系统的运行](#linux-文件系统的运行)
  - [XFS 文件系统](#xfs-文件系统)
- [7.2 文件系统的简单操作](#72-文件系统的简单操作)
  - [实体链接与符号链接](#实体链接与符号链接)
- [7.3 磁盘的分区、格式化、检验与挂载](#73-磁盘的分区格式化检验与挂载)
  - [观察磁盘分区状态](#观察磁盘分区状态)
  - [磁盘分区](#磁盘分区)
  - [磁盘格式化](#磁盘格式化)

<!-- /TOC -->

## 7.1 认识Linux 文件系统

在传统的磁盘与文件系统中，一个分区就是一个只能够被格式化成为一个文件系统，所以可以说一个文件系统就是一个分区。但由于新技术的利用，例如 LVM 和 RAID，这些技术可以将一个分区格式化为多个文件系统，也能将多个分区合成一个文件系统。    

操作系统中的文件数据除了文件实际内容外，通常含有非常多的属性。例如 Linux 操作系统的文件权限与文件属性。文件系统通常会将这两部分的数据分别存放在不同的区块，权限与属性放置到 **inode** 中，至于实际数据则放置到 **data block** 区块中。另外，还有一个超级区块 **superblock** 会记录整个文件系统的整体信息，包括 inode 和 block 的总量，使用量，剩余量等。    

每个 inode 与 block 都有编号，三个部分的意义如下：     

+ superblock：记录此 filesystem 的整体信息，包括 inode/block 的总量、使用量、剩余量，以及文件系统的格式与相关信息等
+ inode：记录文件的属性，一个文件占用一个 inode，同时记录此文件的数据所在的 block 编号
+ block：实际记录文件的内容，若文件太大时，会占用多个 block。     

## Linux 的 EXT2 文件系统

文件系统通常会一开始就将 inode 和 block 规划好，除非重新格式化，否则 inode 和 block 固定后就不再变动。但是如果我们的文件系统高达几百 GB，那么将所有 inode 和 block 通通放置在一起是很不明智的决定，因为 inode 和 block 的数量太庞大，不容易管理。     

因此， EXT2 文件系统在格式化的时候基本上是区分为多个区块群组(block group)的，每个区块群组都有独立的 inode/block/superblock 系统。    

![ext2 filesystem](https://github.com/temple-deng/learning-repo/blob/master/pics/ext2-filesystem.png)    

+ **data block**    

data block 是用来放置文件内容数据的地方，在 EXT2 文件系统中所支持的 block 大小有 1K，2K及4K 三种，在格式化时 block 的大小就固定了，且每个 block 都有编号。    

+ **inode table**：基本上，inode 记录的文件数据至少有下面这些：    
  - 该文件的读取模式(read/write/execute)
  - 该文件的拥有者和群组
  - 该文件的容量
  - 该文件创建或状态改变的时间 ctime
  - 最近一次读取时间 atime
  - 最近修改的时间 mtime
  - 定义文件特性的 flag，如 Set UID
  - 该文件内容的指向    

除此之外，inode 还有以下特点：     

+ 每个 inode 大小均固定为 128 Bytes，最新的 ext4 和 xfs 可设置到 256 Bytes
+ 每个文件都仅会占用一个 inode
+ 因此，文件系统能够创建的文件数量与 inode 数量有关
+ 系统读取文件时需要先找到 inode，并分享 inode 所记录的权限与使用者是否符合    

![inode](https://github.com/temple-deng/learning-repo/blob/master/pics/inode.jpg)      

上图最左边为 inode 本身，里面有12个直接指向 block 号码的位置，所谓的间接记录就是用一个 block 来当做记录 block 号码的记录区，双间接和三间接以此类推。    

+ **superblock**    

superblock 是记录整个文件系统相关信息的地方，没有 superblock，就没有文件系统了，其记录的信息主要有：    

+ block 和 inode 的总量
+ 未使用与已使用的 inode/block 数量
+ block 与 inode 的大小（block 为1, 2, 4K, inode 为 128Bytes 或 256Bytes
+ 文件系统的挂载时间、最近一次写入数据的时间、最近一次检验磁盘的时间等文件系统的相关信息
+ 一个 valid bit 数值，若此文件系统已被挂载，则 valid bit 为0，若未被挂载，则 valid bit 为1。    

事实上除了第一个	block	group	内会含有	superblock之外,后续的	block	group	不一定含有	superblock	,	而若含有	superblock	则该	superblock主要是做为第一个	block	group	内	superblock	的备份。     

+ **filesystem description**      

这个区段可以描述每个 block group 的开始与结束的 block 号码，以及说明每个区段（superblock, bitmap, inodemap, data block）分别介于哪一个 block 号码之间。     
+ **block bitmap**   

如果想要新增文件时总会用到 block。通过 bitmap 来获取空 block 的号码。     

+ **inode bitmap**   

与 block bitmap 类似的功能，只是记录使用和未使用的 inode 号码。     

### 与目录树的关系

当我们在 Linux 的文件系统创建一个目录时，文件系统会分配一个 inode 与至少一块 block 给该目录。其实，inode 记录该目录的相关权限与属性，并可记录分配到的那块 block 号码，而 block 则是记录在这个目录下的文件名与该文件名占用的 inode 号码数据。    

### Linux 文件系统的运行

Linux 异步写入：当系统载入一个文件到内存后，如果该文件没有被变动过，则在内存区段的文件数据会被设置为干净(clean)的。但如果内存中的文件数据被变动过了，此时内存中的数据会被设置为脏的(dirty)。此时所有的动作都还在内存中执行，并没有写入到磁盘总。系统会不定时的将内存中设置为“Dirty” 的数据写会磁盘。     

### XFS 文件系统

xfs 文件系统在数据的分布上，主要规划为三个部分，一个数据区（data section），一个文件系统活动登录区（log section）以及一个实时运行区（realtime section），这三个区的内容如下：    

+ data section    

基本上，数据区和我们之前谈到的 ext 文件系统一样，包括 inode/data block/superblock 等数据，都放置在这个区块。这个数据与 ext 的 block group 类似，也是分为多个存储群组来分别放置文件系统所需要的数据。每个存储群组都包含了：（1）整个文件系统的 superblock（2）剩余空间的管理机制（3）inode的分配与跟踪。此外，inode和block都是系统需要用到时，才动态配置产生，所以格式化很快。    

此外，xfs 的 block 和 inode 有多种不同的容量可供设置，block容量可由 512Bytes-64K,inode 容量则是 256Bytes-2M。    

+ 文件系统活动登录区   

在登录区这个区域主要被用来记录文件系统的变化，其实有点像是日志区。文件的变化会在这里记录下来，直到该变化完整的写入到数据区后，记录才被终结。    

+ 实时运行区     

当有文件要被创建时，xfs 会在这个区段里面找一个到数个 extent 区块，将文件放置到这个
区块内,等到分配完毕后,再写入到	data	section	的	inode	与	block	去!	这个	extent	区块的大小得要在格式化的时候就先指定,最小值是	4K	最大可到	1G。      

```shell
# xfs_info 挂载点/设备文件名
```     

## 7.2 文件系统的简单操作

+ `df`：列出文件系统的整体磁盘使用量
+ `du`：评估文件系统的磁盘使用量（常用在推估目录所占容量）    

```shell
# df [-ahikHTm] [文件名或目录名]

-a：列出所有的文件系统，包括系统特有的 /proc 等文件系统
-k：以 KBytes 的容量显示各文件系统
-m：以 MBytes 的容量显示各文件系统
-h：以人们易读的 GB，MB，KB的格式显示
-H：以 M=1000K 取代 M=1024K 的进位方式
-T：连同该分区的文件系统类型也列出
-i：不用磁盘容量，而以 inode 的数量来显示
```    

```shell
#du [-ahskm] filename/dirname

-a：列出所有的文件与目录容量，因为默认仅统计目录下面的文件量而已
-h：以人类易读的容量格式显示
-s：列出总量而已，而不列出每个目录的占用容量
-S：不包括子目录下的总计，与 -s 有点差别
-k：以 KB
-m：以 MB 格式     
```     

### 实体链接与符号链接

+ hard link，实体链接，硬链接     

由于硬链接相当于在目录的 block 中添加一笔记录，指向一个已存在的 inode 号码，因此是只能在单一文件系统中进行的，不能跨文件系统，此外也不能创建一个目录的硬链接。     

+ Symbolic Link，符号链接     

符号链接就是在创建一个独立的文件，而这个文件会让数据的读取指向它 link 的那个文件的文件名。      

```shell
# ln [-sf] 来源文件 目标文件

-s：如果不加任何参数就进行链接，那就是 hard link，至于 -s 就是符号链接
-f：如果目标文件存在，就主动将目标文件移除后再创建
```  

我们创建一个新的目录时,	“新的目录的	link	数为	2	,而上层目录的	link	数则会增加	1	”。     

## 7.3 磁盘的分区、格式化、检验与挂载

当在系统中新增一颗磁盘，需要以下的操作：    

1. 对磁盘进行分区，以创建可用的分区
2. 对分区进行格式化，以创建系统可用的文件系统
3. 若想要仔细一点，则可对刚刚创建好的文件系统进行检验
4. 在 Linux 系统上，需要创建挂载点，即目录，并将其挂载上来

### 观察磁盘分区状态

+ `lsblk` 列出系统上的所有磁盘列表    

`lsblk` 可以看成 "list block device" 的意思。    

```shell
$ lsblk [-dfimpt] [device]

-d：仅列出磁盘本身，并不会列出该磁盘的分区数据
-f：同时列出该磁盘内的文件系统名称
-i：使用 ASCII 的线段输出
-m：同时输出设备在 /dev 下面的权限数据（rwx数据）
-p：列出该设备的完整文件名
-t：列出该磁盘设备的详细数据
```    

输出的信息含义如下：   

+ NAME：设备的文件名
+ MAJ:MIN：其实核心认识的设备都是通过这两个代码来熟悉的，分别是主要：次要设备代码
+ RM：是否为可卸载设备(removable device)，如光盘等
+ SIZE：容量
+ RO：是否为只读设备
+ TYPE：是磁盘(disk)、分区(part)还是只读存储器(rom)
+ MOUNTPOINT：挂载点    

UUID是全域单一识别码（universally unique identifier），Linux会将系统内所有的设备都给予一个唯一的识别码，这个识别码可以用来挂载或者使用。可以使用 `blkid` 命令查看。    

+ `parted` 列出磁盘的分区表类型与分区信息    

```shell
# parted device_name print
```     

### 磁盘分区

```shell
# gdisk 设备名称
# fdisk 设备名称
```    

### 磁盘格式化

格式化创建文件系统的命令是 `mkfs`，如果要创建 xfs 文件系统，就使用 `mkfs.xfs`：    

```shell
# mkfs.xfs [-b bsize] [-d params] [-i params] [-l params] [-L label] [-f] \
           [-r params] 设备名称（应该是分区名称才准确）

-b：后面接的是 block 容量
-d：后面接的是终于的 data section 相关参数值，主要的值有：
    agcount=数值  ：设置几个存储群组的意思
    agsize=数值   ：每个存储群组多少容量的意思，通常 agcount/agsize 设置一个即可
    file         ：指的是格式话的设置是个文件而不是个设备的意思，例如虚拟磁盘
    size=数值    ：data section 的容量
    su=数值      ：当有 RAID 时，那个 stripe 数值的意思
    sw=数值      ：当有RAID时，用于存储数据的磁盘容量
    sunit=数值   ：与su相当，不过单位使用的是“几个	sector(512Bytes大小)”的意思
    swidth=数值  ：就是	su*sw	的数值,但是以“几个	sector(512Bytes大小)”来设置
-f：如果设备内已经有文件系统,则需要使用这个	-f	来强制格式化才行
-i：与 inode 有关的设置，主要的设置值有：
    size=数值    ：最小是256B，最大是2K
    internal=[0|1]：log 设备是否为内置。默认1内置，如果用外部设备，使用下面设置
    logdev=device ：log设备
    size=数值	:指定这块登录区的容量,通常最小得要有	512	个	block,大约	2M	以上才行
-L:后面接这个文件系统的标头名称	Label	name	的意思
-r：指定	realtime	section	的相关设置值,常见的有:
			extsize=数值		:就是那个重要的	extent	数值,一般不须设置,但有	RAID	时,
			最好设置与	swidth	的数值相同较佳!最小为	4K	最大为	1G	。
```     



