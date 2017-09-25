# 第七章 Linux 磁盘和文件系统管理

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

![ext2 filesystem](https://github.com/temple-deng/learning-repo/pics/ext2-filesystem.png)    

