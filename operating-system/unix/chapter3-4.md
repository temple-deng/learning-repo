# 第 3 章 文件 IO

## 3.1 引言

UNIX 系统中的大多数文件 IO 只需用到 5 个函数：open, read, write, lseek, close。    

本章描述的函数经常被称为不带缓冲的 IO。术语不带缓冲指的是每个 read 和 write 都调用内核中的一个
系统调用。这些不带缓冲的I/O函数不是ISO C的组成部分，但是，它们是POSIX.1和Single UNIX
Specification的组成部分。    

## 3.2 文件描述符

对于内核而言，所有打开的文件都通过文件描述符引用。文件描述符是一个非负整数。当打开一个现有文件或
创建一个新文件时，内核向进程返回一个文件描述符。当读、写一个文件时，使用 open 或 creat 返回的
文件描述符标识该文件，将其作为参数传送给 read 或 write。    

按照惯例，UNIX系统 shell 把文件描述符0与进程的标准输入关联，文件描述符1与标准输出关联，文件
描述符2与标准错误关联。这是各种 shell以及很多应用程序使用的惯例，与UNIX内核无关。尽管如此，如果
不遵循这种惯例，很多UNIX系统应用程序就不能正常工作。    

在符合POSIX.1的应用程序中，幻数0、1、2虽然已被标准化，但应当把它们替换成符号常量STDIN_FILENO、
STDOUT_FILENO 和 STDERR_FILENO 以提高可读性。这些常量都在头文件 &lt;unistd.h&gt; 中定义。    

文件描述符的变化范围是0~OPEN_MAX-1（进程打开的最大文件数）。早期的UNIX系统实现采用的上限值是
19（允许每个进程最多打开 20 个文件)，但现在很多系统将其上限值增加至63。   

对于FreeBSD 8.0、Linux 3.2.0、Mac OS X 10.6.8以及Solaris 10，文件描述符的变化范围几乎
是无限的，它只受到系统配置的存储器总量、整型的字长以及系统管理员所配置的软限制和硬限制的约束。    

## 3.3 函数 open 和 openat

调用 open 或 openat 函数可以打开或创建一个文件。    

```c
#include <fcntl.h>

int open(const char *path, int oflag, ... /* mode_t mode */);
int openat(int fd, const char *path, int oflag, ... /* mode_t mode */);
```     

两函数的返回值：若成功，返回文件描述符；若出错，返回 -1。    

我们将最后一个参数写为 ...，ISO C 用这种方法表明余下的参数的数量及其类型是可变的。对于 open 函数
而言，仅当创建新文件时才使用最后这个参数。在函数原型中将此参数放置在注释中。   

path 参数是要打开或创建文件的名字。oflag 参数可用来说明此函数的多个选项。用下列一个或多个常量
进行“或”运算构成 oflag 参数（这些常量在头文件 &lt;fcntl.h&gt; 中定义）：   

- O_RDONLY: 只读打开
- O_WRONLY: 只写
- O_RDWR
- O_EXEC: 只执行打开
- O_SEARCH: 只搜索打开（应用于目录）    

在上面的这 5 个常量中必须指定一个且只能指定一个，而下面的这些常量则是可选：   

- O_APPEND: 每次写时都追加到文件的尾端
- O_CLOEXEC: 把 FD_CLOEXEC 常量设置为文件描述符标志
- O_CREAT: 若此文件不存在则创建它。使用此选项时，open 函数需同时说明第3个参数 mode（openat
函数需说明第4个参数mode），用mode指定该新文件的访问权限位
- O_DIRECTORY: 如果 path 引用的不是目录，则出错
- O_EXCL: 如果同时指定了 O_CREAT，而文件已经存在，则出错。用此可以测试一个文件是否存在，如果
不存在，则创建此文件。
- O_NOCTTY: 如果 path 引用的是终端设备，则不将该设备分配作为此进程的控制终端
- O_NOFOLLOW: 如果 path 引用的是一个符号链接，则出错
- O_NONBLOCK: 如果 path 引用的是一个 FIFO、一个块特殊文件或一个字符特殊文件，则此选项为文件的
本次打开操作和后续的 IO 操作设置非阻塞方式
- O_SYNC: 使每次 write 等待物理I/O操作完成，包括由该 write 操作引起的文件属性更新所需的I/O
- O_TRUNC: 如果此文件存在，而且为只写或读-写成功打开，则将其长度截断为 0
- O_TTY_INIT: 如果打开一个还未打开的终端设备，设置非标准 termios 参数值，使其符合 Single
UNIX Specification
- O_DSYNC: 使每次 write 要等待物理 IO 操作完成，但是如果该写操作并不影响读取刚写入的数据，则
不需等待文件属性被更新    
O_DSYNC 和 O_SYNC 标志有微妙的区别。仅当文件属性需要更新以反映文件数据变化（例如，更新文件
大小以反映文件中包含了更多的数据）时，O_DSYNC 标志才影响文件属性。而设置 O_SYNC 标志后，数据
和属性总是同步更新。当文件用 O_DSYNC 标志打开，在重写其现有的部分内容时，文件时间属性不会同步
更新。与此相反，如果文件是用 O_SYNC 标志打开，那么对该文件的每一次 write 都将在 write 返回
前更新文件时间，这与是否改写现有字节或追加写文件无关。  
- O_RSYNC: 使每一个以文件描述符作为参数进行的 read 操作等待，直至所有对文件同一部分挂起的写操作
都完成。    

由 open 和 openat 函数返回的文件描述符一定是最小的未用描述符数值。这一点被某些应用程序用来在
标准输入、标准输出或标准错误上打开新的文件。例如，一个应用程序可以先关闭标准输出，然后打开另一个
文件，执行打开操作前就能了解到该文件一定会在文件描述符 1 上打开。   

fd 参数把 open 和 openat 函数区分开，共有 3 种可能性：   

1. path 参数指定的是绝对路径名，在这种情况下，fd 参数被忽略，openat 函数相当于 open
2. path 参数指定的是相对路径名，fd 参数指出了相对路径名在文件系统中的开始地址。fd 参数是通过
打开相对路径名所在的目录来获取（啥玩意啊）
3. path 参数指定了相对路径名，fd 参数具有特殊值 AT_FDCWD。在这种情况下，路径名在当前工作目录
中获取，openat函数在操作上与open函数类似         

## 3.4 函数 creat

也可调用 creat 函数创建一个新文件。    

```c
#include <fcntl.h>
int creat(const char *path, mode_t mode);
```    

返回值：若成功，返回为只写打开的文件描述符；若出错，返回 -1    

此函数等效于： `open(path, O_WRONLY | O_CREAT | O_TRUNC, mode)`    

## 3.5 函数 close

可调用 close 函数关闭一个打开文件：    

```c
#include <unistd.h>

int close(int fd);
```    

返回值：若成功，返回 0；若出错，返回-1    

关闭文件时会释放该进程加在该文件上的所有记录锁。    

当一个进程终止时，内核自动关闭它所有的打开文件。    

## 3.6 函数 lseek

每个打开文件都有一个与其相关联的“当前文件偏移量”（current file offset）。它通常是一个非负整数，
用以度量从文件开始处计算的字节数。通常，读、写操作都从当前文件偏移量处开始，并使偏移量增加所读写
的字节数。按系统默认的情况，当打开一个文件时，除非指定 O_APPEND 选项，否则该偏移量被设置为0。    

可以调用 lseek 显示地为一个打开文件设置偏移量：   

```c
#include <unistd.h>
off_t lseek(int fd, off_t offset, int whence);
```    

返回值：若成功，返回新的文件偏移量；若出错，返回为 -1。   

对参数offset的解释与参数whence的值有关：  

- 若 whence 是 SEEK_SET，则将该文件的偏移量设置为距文件开始处 offset 个字节
- 若 whence 是 SEEK_CUR，则将该文件的偏移量设置为其当前值加 offset，offset 可为正或负
- 若 whence 是 SEEK_END，则将该文件的偏移量设置为文件长度加 offset，offset 可为正为负    

如果文件描述符指向的是一个管道、FIFO 或网络套接字，则 lseek 返回 -1，并将 errno 设置为 ESPIPE。   

3个符号常量SEEK_SET、SEEK_CUR和SEEK_END是在System V中引入的。在System V之前，whence 被
指定为 0（绝对偏移量）、1（相对于当前位置的偏移量）或 2（相对文件尾端的偏移量）。很多软件仍然
把这些数字直接写在代码里。    

在 lseek 中的字符 l 表示长整型。在引入 off_t 数据类型之前，offset 参数和返回值是长整型的。
lseek是在UNIX V7中引入的，当时C语言中增加了长整型。    

下面的例子测试 stdin 能否被设置偏移量：   

```c
#include <stdio.h>
#include <unistd.h>

int main(void) {
  if (lseek(STDIN_FILENO, 0, SEEK_CUR) == -1) {
    printf("cannot seek\n");
  } else {
    printf("seek OK\n");
  }

  return 0;
}
```    

如果用交互方式调用此程序：   

```bash
$ ./3-1.lseek < ./3-1.lseek.c
seek OK
```    

通常，文件的当前偏移量应当是一个非负整数，但是，某些设备也可能允许负的偏移量。但对于普通文件，
其偏移量必须是非负值。因为偏移量可能是负值，所以在比较 lseek 的返回值时应当谨慎，不要测试它是否
小于0，而要测试它是否等于−1。    

lseek 仅将当前的文件偏移量记录在内核中，它并不引起任何I/O操作。然后，该偏移量用于下一个读或写
操作。    

文件偏移量可以大于文件的当前长度，在这种情况下，对该文件的下一次写将加长该文件，并在文件中构成
一个空洞，这一点是允许的。位于文件中但没有写过的字节都被读为0。   

文件中的空洞并不要求在磁盘上占用存储区。具体处理方式与文件系统的实现有关，当定位到超出文件尾端
之后写时，对于新写的数据需要分配磁盘块，但是对于原文件尾端和新开始写位置之间的部分则不需要分配
磁盘块。   

```c
#include <fcntl.h>
#include "apue.h"

char buf1[] = "abcdefghij";
char buf2[] = "ABCDEFGHIJ";

int main(void) {
  int fd;

  if ((fd = creat("file.hole", FILE_MODE)) < 0) {
    err_sys("creat error");
  }

  if (write(fd, buf1, 10) != 10) {
    err_sys("buf1 write error");
  }

  if (lseek(fd, 16384, SEEK_SET) == -1) {
    err_sys("lseek error");
  }

  if (write(fd, buf2, 10) != 0) {
    err_sys("buf2 write error");
  }

  exit(0);
}
```   

## 3.7 函数 read

调用 read 函数从打开文件中读数据。   

```c
#include <unistd.h>

ssize_t read(int fd, void *buf, size_t nbytes);
```    

返回值：读到的字节数，若已到文件尾，返回 0；若出错，返回 -1。    

有多种情况可使实际读到的字节数少于要求读的字节数：   

- 读普通文件时，在读到要求字节数之前已到达了文件尾端。
- 当从终端设备读时，通常一次最多读一行
- 当从网络读时，网络中的缓冲机制可能造成返回值小于所要求读的字节数
- 当从管道或 FIFO 读时，如若管道包含的字节少于所需的数量，那么 read 将只返回实际可用的字节数
- 当从某些面向记录的设备（如磁带）读时，一次最多返回一个记录
- 当一信号造成中断，而已经读了部分数据量时

## 3.8 函数 write

```c
#include <unistd.h>

ssize_t write(int fd, const void *buf, size_t nbytes);
```    

返回值：若成功，返回已写字节数；若出错，返回 -1。    

## 3.9 IO 的效率

下面的程序只使用 read 和 write 函数复制一个文件：   

```c
#include "apue.h"

#define BUFFSIZE 4096

int main(void) {
  int n;
  char buf[BUFFSIZE];

  while ((n = read(STDIN_FILENO, buf, BUFFSIZE)) > 0) {
    if (write(STDOUT_FILENO, buf, n) != n) {
      err_sys("write error");
    }
  }

  if (n < 0) {
    err_sys("read error");
  }

  return 0;
}
```    

## 3.10 文件共享

UNIX 系统支持在不同进程间共享打开文件。在介绍 dup 函数之前，先要说明这种共享。为此先介绍内核
用于所有I/O的数据结构。    

内核使用 3 种数据结构表示打开文件，它们之间的关系决定了在文件共享方面一个进程对另一个进程可能产生
的影响：    

1. 每个进程在进程表都有一个记录项，记录项中包含一张打开文件描述符表，可将其视为一个矢量（话说，
这里的矢量是值什么，难道就是一个指针外带一些表格信息的数据结构？），每个描述符占用一项。与每个
描述符相关联的是：
  - 文件描述符标志（close_on_exec）
  - 指向一个文件表项的指针
2. 内核为所有打开文件维持一张文件表。每个文件表项包含：
  - 文件状态标志（读、写、添写、同步和非阻塞等）
  - 当前文件偏移量
  - 指向该文件 v 节点表项的指针
3. 每个打开文件（或设备）都有一个 v 节点（v-node）结构。v 节点包含了文件类型和对此文件进行各种
操作函数的指针。对于大多数文件，v节点还包含了该文件的 i 节点。这些信息是在打开文件时从磁盘上读入
内存的，所以，文件的所有相关信息都是随时可用的    

Linux 没有使用 v 节点，而是使用了通用的 i 节点结构。虽然两种实现有所不同，但在概念上， v节点与
i节点是一样的。两者都指向文件系统特有的i节点结构。    

下图展示了一个进程对应的 3 张表之间的关系：   

![file-core-arch](https://raw.githubusercontent.com/temple-deng/markdown-images/master/unix/3-7.file-core-arch.png)   