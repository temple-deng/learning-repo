# 第 4 章 文件和目录

<!-- TOC -->

- [第 4 章 文件和目录](#第-4-章-文件和目录)
  - [4.1 引言](#41-引言)
  - [4.2 函数 stat, fstat, fstatat 和 lstat](#42-函数-stat-fstat-fstatat-和-lstat)
  - [4.3 文件类型](#43-文件类型)
  - [4.4 设置用户 ID 和设置组 ID](#44-设置用户-id-和设置组-id)
  - [4.5 文件访问权限](#45-文件访问权限)
  - [4.6 新文件和目录的所有权](#46-新文件和目录的所有权)
  - [4.7 函数 access 和 faccessat](#47-函数-access-和-faccessat)
  - [4.8 函数 umask](#48-函数-umask)
  - [4.9 函数 chmod、fchmod 和 fchmodat](#49-函数-chmodfchmod-和-fchmodat)
  - [4.10 粘着位](#410-粘着位)
  - [4.11 函数 chown, fchown, fchownat 和 lchown](#411-函数-chown-fchown-fchownat-和-lchown)
  - [4.12 文件长度](#412-文件长度)
  - [4.13 文件截断](#413-文件截断)
  - [4.14 文件系统](#414-文件系统)
  - [4.15 函数link,linkat,unlink,unlinkat和remove](#415-函数linklinkatunlinkunlinkat和remove)
  - [4.16 函数 rename 和 renameat](#416-函数-rename-和-renameat)
  - [4.17 符号链接](#417-符号链接)
  - [4.18 创建和读取符号链接](#418-创建和读取符号链接)
  - [4.19 文件的时间](#419-文件的时间)
  - [4.20 函数 funtimens, utimensat 和 utimes](#420-函数-funtimens-utimensat-和-utimes)
  - [4.21 函数 mkdir, mkdirat 和 rmdir](#421-函数-mkdir-mkdirat-和-rmdir)
  - [4.22 读目录](#422-读目录)
  - [4.23 函数 chdir, fchdir 和 getcwd](#423-函数-chdir-fchdir-和-getcwd)
  - [4.24 设备特殊文件](#424-设备特殊文件)

<!-- /TOC -->

## 4.1 引言

上⼀章我们说明了执⾏I/O操作的基本函数，其中的讨论是围绕普通⽂件I/O进⾏的——打开⽂件、读⽂件或
写⽂件。本章将描述⽂件系统的其他特征和⽂件的性质。我们将从 stat 函数开始，逐个说明stat结构的每⼀
个成员以了解⽂件的所有属性。在此过程中，我们将说明修改这些属性的各个函数（更改所有者、更改权限等），
还将更详细地说明UNIX⽂件系统的结构以及符号链接。本章最后介绍对⽬录进⾏操作的各个函数，并且开发了
⼀个以降序遍历⽬录层次结构的函数。    

## 4.2 函数 stat, fstat, fstatat 和 lstat

本章主要讨论 4 个 stat 函数以及它们的返回信息：   

```c
#include <sys/stat.h>

int stat(const char *restrict pathname, struct stat *restrict buf);
int fstat(int fd, struct stat *buf);
int lstat(const char *restrict pathname, struct stat *restrict buf);
int fstatat(int fd, const char *restrict pathname, struct stat *restrict buf, int flag);
```    

所有 4 个函数的返回值：若成功，返回0；若出错，返回 -1。    

一旦给出 pathname，stat 函数将返回与此命名文件有关的信息结构。fstat 函数获得已在描述符 fd 上
打开文件的有关信息。lstat 函数类似于 stat，但是当命名的文件是一个符号链接时，lstat 返回该符号
链接的有关信息，而不是由该符号链接引用的文件的信息。    

fstatat 函数为⼀个相对于当前打开⽬录（由fd参数指向）的路径名返回⽂件统计信息。flag 参数控制着
是否跟随着⼀个符号链接。当AT_SYMLINK_NOFOLLOW标志被设置时，fstatat 不会跟随符号链接，⽽是
返回符号链接本⾝的信息。否则，在默认情况下，返回的是符号链接所指向的实际⽂件的信息。如果fd参数的
值是AT_FDCWD，并且pathname参数是⼀个相对路径名，fstatat会计算相对于当前⽬录的pathname参数。
如果pathname是⼀个绝对路径，fd参数就会被忽略。这两种情况下，根据 flag 的取值，fstatat 的作⽤
就跟stat或lstat⼀样。    

第 2 个参数 buf 是一个指针，它指向一个我们必须提供的结构。函数来填充由 buf 指向的结构。结构的
实际定义可能随具体实现有所不同，但其基本形式是：   

```c
struct stat {
  mode_t    st_mode;   /* file type & mode(permissions) */
  ino_t     st_ino;    /* i-node number */
  dev_t     st_dev;    /* device number */
  dev_t     st_rdev;   /* device number for special files */
  nlink_t   st_nlink;  /* number of links */
  uid_t     st_uid;    /* user ID of owner */
  gid_t     st_gid;    /* group ID of owner */
  off_t     st_size;   /* size in bytes, for regular files */
  struct timespec st_atime;  /* time of lase access */
  struct timespec st_mtime;  /* time of last modification */
  struct timespec st_ctime;  /* time of last file status change */
  blksize_t st_blksize;      /* best IO block size */
  blkcnt_t  st_blocks ;      /* number of disk blocks allocated */
}
```    

## 4.3 文件类型

UNIX 系统的大多数文件是普通文件或目录，但是也有另外一些文件类型。文件类型包括如下几种：   

1. 普通文件。这是最常用的文件类型，这种文件包含了某种形式的数据。至于这种数据是文本还是二进制数据，
对于 UNIX 内核而言并无区别。一个值得注意的例外是二进制可执行文件。为了执行程序，内核必须理解其格式。
所有二进制可执行文件都遵循一种标准化的格式，这种格式使内核能够确定程序文本和数据的加载位置。
2. 目录文件。这种文件包含了其他文件的名字以及指向与这些文件有关信息的指针。对一个目录文件具有读
权限的任一进程都可以读该目录的内容，但只有内核可以直接写目录文件。进程必须使用本章介绍的函数才能
更改目录。
3. 块特殊文件。这种类型的文件提供对设备（如磁盘）带缓冲的访问，每次访问以固定长度为单位进行。
4. 字符特殊文件。这种类型的文件提供对设备不带缓冲的访问，每次访问长度可变。系统中的所有设备要么是
字符特殊文件，要么是块特殊文件。
5. FIFO。这种类型的文件用于进程间通信，有时也称为命名管道
6. 套接字。这种类型的文件用于进程间的网络通信。套接字也可用于一台宿主机进程之间的非网络通信。
7. 符号链接。这种类型的文件指向另一个文件。    

⽂件类型信息包含在 stat 结构的 st_mode 成员中。可以⽤下表中的宏确定⽂件类型。这些宏的参数都是
stat 结构中的 st_mode 成员：   

- S_ISREG(): 普通文件
- S_ISDIR(): 目录文件
- S_ISCHR(): 字符特殊文件
- S_ISBLK(): 块特殊文件
- S_ISFIFO(): 管道或 FIFO
- S_ISLINK(): 符号链接
- S_ISSOCK(): 套接字    

POSIX.1 允许实现将进程间通信（IPC）对象（如消息队列和信号量等）说明为⽂件。下表中的宏可⽤来从
stat 结构中确定 IPC 对象的类型。这些宏与上面的不同，它们的参数并⾮st_mode，⽽是指向stat结构
的指针。   

话说那这种文件是什么类型呢，应该是 7 种文件类型之一吧。   

- S_TYPEISMQ(): 消息队列
- S_TYPEISSEM(): 信号量
- S_TYPEISSHM(): 共享存储对象

本书讨论的 4 种 UNIX系统都不将这些对象表⽰为⽂件。    

下面的程序取其命令⾏参数，然后针对每⼀个命令⾏参数打印其⽂件类型。   

```c
#include <sys/types.h>
#include <sys/stat.h>
#include <stdio.h>

int main(int argc, char *argv[]) {
  int i;
  struct stat buf;
  char *ptr;

  for (i = 1; i < argc; i++) {
    printf("%s: ", argv[i]);

    if (lstat(argv[i], &buf) < 0) {
      printf("lstat error");
      continue;
    }

    if (S_ISREG(buf.st_mode)) {
      ptr = "regular";
    } else if (S_ISDIR(buf.st_mode)) {
      ptr = "directory";
    } else if (S_ISCHR(buf.st_mode)) {
      ptr = "character speclal";
    } else if (S_ISFIFO(buf.st_mode)) {
      ptr = "fifo";
    } else if (S_ISLINK(buf.st_mode)) {
      ptr = "symbolic link";
    } else if (S_ISSOCK(buf.st_mode)) {
      ptr = "socket";
    } else {
      ptr = "** unknown mode **";
    }

    printf("%s\n", ptr);
  }
  return 0;
}
```    

## 4.4 设置用户 ID 和设置组 ID

与一个进程相关联的 ID 有 6 个或更多：   

- 实际用户 ID
- 实际组 ID
- 有效用户 ID
- 有效组 ID
- 附属组 ID
- 保存的设置用户 ID
- 保存的设置组 ID    

具体的含义如下：   

- 实际用户 ID 和实际组 ID：标识我们究竟是谁。这两个字段在登录时取自口令文件中的登录项。通常，在
一个登录会话期间这些值并不改变，但是超级用户进程有方法改变它们。
- 有效用户 ID、有效组 ID 以及附属组 ID 决定了我们的文件访问权限
- 保存的设置用户 ID 和保存的设置组 ID 在执行一个程序时包含了有效用户 ID 和有效组 ID 的副本    

通常，有效用户 ID 等于实际用户 ID，有效组 ID 等于实际组 ID。   

每个文件有一个所有者和组所有者，所有者由 stat 结构中的 st_uid 指定，组所有者由 st_gid 指定。   

当执行一个程序文件时，进程的有效用户 ID 通常就是实际用户 ID，有效组 ID 通常就是实际组 ID。但是
可以在文件模式字（st_mode）中设置一个特殊标志，其含义是“当执行此文件时，将进程的有效用户 ID 设置
为文件所有者的用户 ID”。于此类似，在⽂件模式字中可以设置另⼀位，它将执⾏此⽂件的进程的有效组ID
设置为⽂件的组所有者ID（st_gid）。在⽂件模式字中的这两位被称为设置⽤户ID（set-user-ID）位和
设置组ID（set-group-ID）位。   

例如，若⽂件所有者是超级⽤户，⽽且设置了该⽂件的设置⽤户ID位，那么当该程序⽂件由⼀个进程执⾏时，
该进程具有超级⽤户权限。不管执⾏此⽂件的进程的实际⽤户 ID 是什么，都会是这样。例如，UNIX系统程序
passwd(1)允许任⼀⽤户改变其口令，该程序是⼀个设置⽤户 ID 程序。因为该程序应能将⽤户的新口令
写⼊口令⽂件中（⼀般是/etc/passwd 或/etc/shadow），⽽只有超级⽤户才具有对该⽂件的写权限，
所以需要使⽤设置⽤户 ID 功能。    

再回到stat函数，设置⽤户ID位及设置组ID位都包含在⽂件的st_mode值中。这两位可分别⽤常量S_ISUID
和S_ISGID测试。    

## 4.5 文件访问权限

st_mode 值也包含了对⽂件的访问权限位。当提及⽂件时，指的是前⾯所提到的任何类型的⽂件。所有⽂件
类型（⽬录、字符特别⽂件等）都有访问权限（access permission）。     

每个文件有 9 个访问权限未，可将它们分成 3 类：    

- S_IRUSR, S_IWUSR, S_IXUSR: 用户读、写、执行
- S_IRGRP, S_IWGRP, S_IXGRP: 组读、写、执行
- S_IROTH, S_IWOTH, S_IXOTH: 其他读、写、执行   

话说这个 I 到底代表什么意思。    

上面的 3 类访问权限以各种方式由不同的函数使用，我们将这些不同的使用方式汇总在下面：   

- 第⼀个规则是，我们⽤名字打开任⼀类型的⽂件时，对该名字中包含的每⼀个⽬录，包括它可能隐含的当前
⼯作⽬录都应具有执⾏权限。这就是为什么对于⽬录其执⾏权限位常被称为搜索位的原因。  
例如，为了打开⽂件/usr/include/stdio.h，需要对⽬录 /、/usr 和 /usr/include 具有执⾏权限。
然后，需要具有对⽂件本⾝的适当权限，这取决于以何种模式打开它（只读、读-写等）。
- 对于⼀个⽂件的读权限决定了我们是否能够打开现有⽂件进⾏读操作。这与open函数的O_RDONLY和O_RDWR
标志相关。
- 对于⼀个⽂件的写权限决定了我们是否能够打开现有⽂件进⾏写操作。这与open函数的O_WRONLY和O_RDWR
标志相关。
- 为了在open函数中对⼀个⽂件指定O_TRUNC标志，必须对该⽂件具有写权限
- 为了在⼀个⽬录中创建⼀个新⽂件，必须对该⽬录具有写权限和执⾏权限。
- 为了删除⼀个现有⽂件，必须对包含该⽂件的⽬录具有写权限和执⾏权限。对该⽂件本⾝则不需要有读、写权限。    

进程每次打开、创建或删除⼀个⽂件时，内核就进⾏⽂件访问权限测试，⽽这种测试可能涉及⽂件的所有者
（st_uid和st_gid）、进程的有效ID（有效⽤户ID和有效组ID）以及进程的附属组ID（若⽀持的话）。
两个所有者ID是⽂件的性质，⽽两个有效ID和附属组ID则是进程的性质。内核进⾏的测试具体如下。   

1. 若进程的有效⽤户ID是0（超级⽤户），则允许访问。这给予了超级⽤户对整个⽂件系统进⾏处理的最充分
的⾃由
2. 若进程的有效⽤户ID等于⽂件的所有者ID（也就是进程拥有此⽂件），那么如果所有者适当的访问权限位
被设置，则允许访问；否则拒绝访问。适当的访问权限位指的是，若进程为读⽽打开该⽂件，则⽤户读位应为1；
若进程为写⽽打开该⽂件，则⽤户写位应为1；若进程将执⾏该⽂件，则⽤户执⾏位应为1。
3. 若进程的有效组ID或进程的附属组ID之⼀等于⽂件的组ID，那么如果组适当的访问权限位被设置，则允许
访问；否则拒绝访问
4. 若其他⽤户适当的访问权限位被设置，则允许访问；否则拒绝访问    

## 4.6 新文件和目录的所有权

新⽂件的⽤户ID 设置为进程的有效⽤户ID。关于组ID，POSIX.1允许实现选择下列之⼀作为新⽂件的组ID。   

1. 新文件的组 ID 可以是进程的有效组 ID
2. 新文件的组 ID 可以是它所在目录的组 ID    

FreeBSD 8.0 和 Mac OS X 10.6.8总是使⽤⽬录的组ID作为新⽂件的组ID。有些Linux⽂件系统使⽤
mount(1)命令选项允许在 POSIX.1 提出的两种选项中进⾏选择。对于 Linux 3.2.0 和Solaris 10，
默认情况下，新⽂件的组ID取决于它所在的⽬录的设置组ID位是否被设置。如果该⽬录的这⼀位已经被设置，
则新⽂件的组ID设置为⽬录的组ID；否则新⽂件的组ID设置为进程的有效组ID。    

## 4.7 函数 access 和 faccessat

正如前⾯所说，当⽤ open 函数打开⼀个⽂件时，内核以进程的有效⽤户 ID 和有效组 ID为基础执⾏其
访问权限测试。有时，进程也希望按其实际⽤户ID和实际组ID来测试其访问能⼒。例如，当⼀个进程使⽤
设置⽤户ID或设置组ID功能作为另⼀个⽤户（或组）运⾏时，就可能会有这种需要。即使⼀个进程可能已经
通过设置⽤户ID以超级⽤户权限运⾏，它仍可能想验证其实际⽤户能否访问⼀个给定的⽂件。access和
faccessat函数是按实际⽤户ID和实际组ID进⾏访问权限测试的。（该测试也分成4步，这与4.5节中所述的
⼀样，但将有效改为实际）    

```c
#include <unistd.h>

int access(const char *pathname, int mode);
int faccessat(int fd, const char *pathname, int mode, int flag);
```    

两个函数的返回值：若成功，返回0；若出错，返回-1    

faccessat 函数与 access 函数在下⾯两种情况下是相同的：⼀种是 pathname 参数为绝对路径，另⼀
种是 fd 参数取值为 AT_FDCWD ⽽ pathname 参数为相对路径。否则，faccessat 计算相对于打开⽬录
（由fd参数指向）的 pathname。   

flag 参数可以⽤于改变 faccessat 的⾏为，如果 flag 设置为 AT_EACCESS，访问检查⽤的是调⽤
进程的有效⽤户ID和有效组ID，⽽不是实际⽤户ID和实际组ID。    

## 4.8 函数 umask

umask 函数为进程设置文件模式创建屏蔽字，并返回之前的值。    

```c
#include <sys/stat.h>

mode_t umask(mode_t cmask);
```    

其实参数 cmask 是由之前列出的9个常量（S_IRUSR, S_IWUSR）中的若干个按位“或”构成的。    

在进程创建一个新文件或新目录时，就一定会使用文件模式创建屏蔽字。在文件模式创建屏蔽字中为 1 的位，
在文件 mode 中的相应位一定被关闭。    

下例创建了两个⽂件，创建第⼀个时，umask值为0，创建第⼆个时，umask值禁⽌所有组和其他⽤户的访问权限。   

```c
#include <sys/stat.h>
#include <fcntl.h>
#include <stdio.h>

#define RWRWRW (S_IRUSR | S_IWUSR | S_IRGRP | S_IWGRP | S_IROTH | S_IWOTH)

int main(void) {
  umask(0);

  if (creat("foo", RWRWRW) < 0) {
    printf("creat error for foo");
  }

  umask(S_IRGRP | S_IWGRP | S_IROTH | S_IWOTH);

  if (creat("bar", RWRWRW) < 0) {
    printf("creat error for bar");
  }
  return 0;
}
```    

在前⾯的⽰例中，我们⽤shell的 umask 命令在运⾏程序的前、后打印⽂件模式创建屏蔽字。从中可见，
更改进程的⽂件模式创建屏蔽字并不影响其⽗进程（常常是shell）的屏蔽字。    

## 4.9 函数 chmod、fchmod 和 fchmodat

chmod、fchmod 和 fchmodat 这3个函数使我们可以更改现有⽂件的访问权限。   

```c
#include <sys/stat.h>

int chmod(const char *pathname, mode_t mode);
int fchmod(int fd, mode_t mode);
int fchmodat(int fd, const char *pathname, mode_t mode, int flag);
```    

返回值：若成功，返回0；若出错，返回-1。    

fchmodat 函数与 chmod 函数在下⾯两种情况下是相同的：⼀种是pathname参数为绝对路径，另⼀种是
fd 参数取值为 AT_FDCWD ⽽ pathname 参数为相对路径。否则，fchmodat计算相对于打开⽬录（由fd
参数指向）的pathname。flag 参数可以⽤于改变 fchmodat 的⾏为，当设置了AT_SYMLINK_NOFOLLOW
标志时，fchmodat并不会跟随符号链接。   

为了改变⼀个⽂件的权限位，进程的有效⽤户ID必须等于⽂件的所有者ID，或者该进程必须具有超级⽤户权限。   

参数 mode 是下列所示常量的按位或：    

- S_ISUID: 执行时设置用户 ID
- S_ISGID: 执行时设置组 ID
- S_ISVTX: 保存正文（粘着位）
- S_IRWXU: 用户（所有者）读、写和执行
- S_IRUSR: 用户（所有者）读
- S_IWUSR: 用户（所有者）写
- S_IXUSR: 用户（所有者）执行
- S_IRWXG: 组读、写和执行
- S_IRGRP: 组读
- S_IWGRP: 组写
- S_IXGRP: 组执行
- S_IRWXO: 其他读、写和执行
- S_IROTH: 其他读
- S_IWOTH: 其他写
- S_IXOTH: 其他执行

## 4.10 粘着位

S_ISVTX 位被称为粘着位（sticky bit）。如果⼀个可执⾏程序⽂件的这⼀位被设置了，那么当该程序第
⼀次被执⾏，在其终⽌时，程序正⽂部分的⼀个副本仍被保存在交换区（程序的正⽂部分是机器指令）。这
使得下次执⾏该程序时能较快地将其装载⼊内存。其原因是：通常的UNIX⽂件系统中，⽂件的各数据块很可能
是随机存放的，相⽐较⽽⾔，交换区是被作为⼀个连续⽂件来处理的。对于通⽤的应⽤程序，如⽂本编辑程序
和C语⾔编译器，我们常常设置它们所在⽂件的粘着位。⾃然地，对于在交换区中可以同时存放的设置了粘着位
的⽂件数是有限制的，以免过多占⽤交换区空间，但⽆论如何这是⼀个有⽤的技术。因为在系统再次⾃举前，
⽂件的正⽂部分总是在交换区中，这正是名字中“粘着”的由来。后来的UNIX版本称它为保存正⽂位（saved-text
bit），因此也就有了常量 S_ISVTX。现今较新的UNIX系统⼤多数都配置了虚拟存储系统以及快速⽂件系统，
所以不再需要使⽤这种技术。   

## 4.11 函数 chown, fchown, fchownat 和 lchown

下⾯⼏个 chown 函数可⽤于更改⽂件的⽤户ID和组ID。如果两个参数 owner 或 group 中的任意⼀个是
-1，则对应的ID不变。   

```c
#include <unistd.h>

int chown(const char *pathname, uid_t owner, gid_t group);
int fchown(int fd, uid_t owner, gid_t group);
int fchownat(int fd, const char *pathname, uid_t owner, gid_t group);
int lchown(const char *pathname, uid_t owner, gid_t group);
```    

返回值：若成功，返回0；若出错，返回-1。    

除了所引⽤的⽂件是符号链接以外，这 4 个函数的操作类似。在符号链接情况下，lchown 和 fchownat
（设置了AT_SYMLINK_NOFOLLOW标志）更改符号链接本⾝的所有者，⽽不是该符号链接所指向的⽂件的所有者。   

fchownat 函数与 chown 或者 lchown 函数在下⾯两种情况下是相同的：⼀种是 pathname 参数为绝对
路径，另⼀种是 fd 参数取值为 AT_FDCWD ⽽ pathname 参数为相对路径。在这两种情况下，如果flag
参数中设置了 AT_SYMLINK_NOFOLLOW 标志，fchownat 与 lchown ⾏为相同，如果 flag 参数中清除了AT_SYMLINK_NOFOLLOW标志，则 fchownat 与 chown ⾏为相同。如果 fd 参数设置为打开⽬录的⽂件
描述符，并且pathname参数是⼀个相对路径名，fchownat函数计算相对于打开⽬录的pathname。   

## 4.12 文件长度

stat 结构成员 st_size 表示以字节为单位的文件的长度。此字段只对普通文件、目录文件和符号链接有
意义。   

对于普通⽂件，其⽂件长度可以是0，在开始读这种⽂件时，将得到⽂件结束（end-of-file）指⽰。对于
⽬录，⽂件长度通常是⼀个数（如16或512）的整倍数。    

对于符号链接，文件长度是在文件名中的实际字节数。   

现今，⼤多数现代的UNIX系统提供字段 st_blksize 和 st_blocks。其中，第⼀个是对⽂件I/O较合适
的块长度，第⼆个是所分配的实际512字节块块数。回忆3.9节，其中提到了当我们将st_blksize⽤于读操作
时，读⼀个⽂件所需的时间量最少。为了提⾼效率，标准I/O库也试图⼀次读、写st_blksize个字节。   

应当了解的是，不同的UNIX版本其 st_blocks 所⽤的单位可能不是512字节的块。使⽤此值并不是可移植的。   

**文件中的空洞**    

空洞是由所设置的偏移量超过⽂件尾端，并写⼊了某些数据后造成的。作为⼀个例⼦，考虑下列情况：   

```c
$ ls -l core
-rw-r--r-- 1 sar 8483248 Nov 18 12:18 core
$ du -s core
272    core
```    

⽂件 core 的长度稍稍超过8 MB，可是du命令报告该⽂件所使⽤的磁盘空间总量是272个512字节块（即13
9264字节）。很明显，此⽂件中有很多空洞。   

对于没有写过的字节位置，read函数读到的字节是0。如果执⾏下⾯的命令，可以看出正常的I/O操作读整个
⽂件长度：   

```c
$ wc -c core
8483248 core
```    

带-c选项的wc(1)命令计算⽂件中的字符数（字节）。   

如果使⽤实⽤程序（如cat(1)）复制这个⽂件，那么所有这些空洞都会被填满，其中所有实际数据字节皆填
写为0。    

## 4.13 文件截断

有时我们需要在⽂件尾端处截去⼀些数据以缩短⽂件。将⼀个⽂件的长度截断为0是⼀个特例，在打开⽂件时
使⽤O_TRUNC 标志可以做到这⼀点。为了截断⽂件可以调⽤函数 truncate 和 ftruncate：   

```c
#include <unistd.h>

int truncate(const char *pathname, off_t length);
int ftruncate(int fd, off_t length);
```   

返回值：若成功，返回0；若出错，返回-1。    

这两个函数将⼀个现有⽂件长度截断为 length。如果该⽂件以前的长度⼤于 length，则超过length 以外
的数据就不再能访问。如果以前的长度⼩于 length，⽂件长度将增加，在以前的⽂件尾端和新的⽂件尾端
之间的数据将读作0（也就是可能在⽂件中创建了⼀个空洞）。    

## 4.14 文件系统

每⼀种⽂件系统类型都有它各⾃的特征，有些特征可能是混淆不清的。例如，⼤部分UNIX⽂件系统⽀持⼤⼩写
敏感的⽂件名。因此，如果创建了⼀个名为 file.txt 的⽂件以及另外⼀个名为 file.TXT 的⽂件，就是
创建了两个不同的⽂件。在 Mac OS X上，HFS⽂件系统是⼤⼩写保留的，并且是⼤⼩写不敏感⽐较的。因此，
如果创建了⼀个名为file.txt的⽂件，当你再创建名为 file.TXT 的⽂件时，就会覆盖原来的file.txt
⽂件。但是，保存在⽂件系统中的是⽂件创建时的⽂件名（即file.txt，因为是⼤⼩写保留的）。事实上，
在“f, i, l, e, ., t, x, t”这个序列中的⼤写或⼩写字母的排列都会在搜索这个⽂件时得到匹配（⼤⼩
写不敏感⽐较）。因此，除了file.txt和file.TXT，我们还可以⽤File.txt、fILE.tXt以及FiLe.TxT
等名字来访问该⽂件。    

我们可以把⼀个磁盘分成⼀个或多个分区。每个分区可以包含⼀个⽂件系统（见图 4-13）。i节点是固定
长度的记录项，它包含有关⽂件的⼤部分信息。    

![disk](https://raw.githubusercontent.com/temple-deng/markdown-images/master/unix/4-13.png)   

如果更仔细地观察⼀个柱⾯组的i节点和数据块部分，则可以看到图4-14中所⽰的情况。注意图4-14中的下列
各点：   

![柱面](https://raw.githubusercontent.com/temple-deng/markdown-images/master/unix/4-14.png)   

- 在图中有两个目录项指向同一个 i 节点。每个 i 节点中都有一个链接计数，其值是指向该 i 节点的目录
项数。只有当链接计数减少至 0 时，才可删除该文件。在 stat 结构中，链接计数包含在 st_nlink 成员
中，其基本系统数据类型是 nlink_t。这种链接类型称为硬链接。    
- 另外一种链接类型称为符号链接。符号链接文件的实际内容包含了该符号链接所指向文件的名字。
- i 节点包含了文件有关的所有信息：文件类型、文件访问权限位、文件长度和指向文件数据块的指针等。
stat 结构中的大多数信息都取自 i 节点。只有两项重要数据存放在目录项中：文件名和 i 节点编号。


## 4.15 函数link,linkat,unlink,unlinkat和remove

创建⼀个指向现有⽂件的链接的⽅法是使⽤link函数或linkat函数：   

```c
#include <unistd.h>

int link(const char *existingpath, const char *newpath);
int linkat(inf efd, const char *existingpath, int nfd, const char *newpath, int flag);
```    

返回值：若成功，返回0；若出错，返回-1。    

当现有⽂件是符号链接时，由flag参数来控制linkat函数是创建指向现有符号链接的链接还是创建指向现有
符号链接所指向的⽂件的链接。如果在 flag 参数中设置了AT_SYMLINK_FOLLOW标志，就创建指向符号
链接⽬标的链接。如果这个标志被清除了，则创建⼀个指向符号链接本⾝的链接。   

为了删除⼀个现有的⽬录项，可以调⽤unlink函数：    

```c
#include <unistd.h>
int unlink(const char *pathname);
int unlinkat(int fd, const char *pathname, int flag);
```   

返回值：若成功，返回0；若出错，返回-1    

flag 参数给出了⼀种⽅法，使调⽤进程可以改变 unlinkat 函数的默认⾏为。当AT_REMOVEDIR标志被
设置时，unlinkat 函数可以类似于 rmdir ⼀样删除⽬录。如果这个标志被清除，unlinkat与unlink
执⾏同样的操作。   

我们也可以⽤ remove 函数解除对⼀个⽂件或⽬录的链接。对于⽂件，remove 的功能与unlink相同。对于
⽬录，remove 的功能与 rmdir 相同。    

```c
#include <stdio.h>
int remove(const char *pathname);
```   

## 4.16 函数 rename 和 renameat

⽂件或⽬录可以⽤rename函数或者renameat函数进⾏重命名:    

```c
#include <stdio.h>

int rename(const char *oldname, const char *newname);
int renameat(int oldfd, const char *oldname, int newfd, const char *newname);
```   

返回值：若成功，返回0；若出错，返回-1。    

ISO C 对⽂件定义了rename函数（C标准不处理⽬录）。POSIX.1扩展此定义，使其包含了⽬录和符号链接。    

根据oldname是指⽂件、⽬录还是符号链接，有⼏种情况需要加以说明。我们也必须说明如果newname已经
存在时将会发⽣什么：    

1. 如果 oldname 指的是一个文件而不是目录，那么为该文件或符号链接重命名。在这种情况下，如果 newname
已存在，则它不能引用一个目录。如果 newname 已存在，而且不是一个目录，则先将该目录项删除然后将
oldname 重命名为 newname。
2. 如若 oldname 指的是一个目录，那么为该目录重命名。如果 newname 已存在，则它必须引用一个目录，
而且该目录应当是空目录。如果 newname 存在且是一个空目录，则先将其删除，然后将 oldname 重命名
为 newname。
3. 如若 oldname 或 newname 引用符号链接，则处理的是符号链接本身，而不是它所引用的文件
4. 不能对 . 和 .. 重命名
5. 作为一个特例，如果oldname和newname引⽤同⼀⽂件，则函数不做任何更改⽽成功返回。

## 4.17 符号链接

符号链接是对⼀个⽂件的间接指针。   

## 4.18 创建和读取符号链接

可以⽤symlink或symlinkat函数创建⼀个符号链接：   

```c
#include <unistd.h>

int symlink(const char *actualpath, const char *sympath);
int symlinkat(const char *actualpath, int fd, const char *sympath);
```    

返回值：若成功，返回0；若出错，返回-1。    

函数创建了一个指向 actualpath 的新目录项 sympath。在创建此符号链接时，并不要求 actualpath
已经存在。    

因为 open 函数跟随符号链接，所以需要有⼀种⽅法打开该链接本⾝，并读该链接中的名字。readlink和
readlinkat 函数提供了这种功能。    

```c
#include <unistd.h>

ssize_t readlink(const char *restrict pathname, char *restrict buf, size_t bufsize);
ssize_t readlinkat(int fd, const char* restrict pathname, char *restrict buf, size_t bufsize);
```    

返回值：若成功，返回读取的字节数；若出错，返回-1。    

两个函数组合了 open、read 和 close 的所有操作。如果函数成功执⾏，则返回读⼊buf的字节数。在buf
中返回的符号链接的内容不以null字节终⽌。    

## 4.19 文件的时间

对于每个文件维护 3 个时间字段：   

- st_atim: 文件数据的最后访问时间
- st_mtim: 文件数据的最后修改时间
- st_ctim: i 节点状态的最后修改时间

注意，修改时间（st_mtim）和状态修改时间（st_ctim）之间的区别。修改时间是文件内容最后一次被修改
的时间。状态更改时间是该文件的 i 节点最后一次被修改的时间。    

## 4.20 函数 funtimens, utimensat 和 utimes

⼀个⽂件的访问和修改时间可以⽤以下⼏个函数更改。futimens和utimensat函数可以指定纳秒级精度的
时间戳。⽤到的数据结构是与stat函数族相同的timespec结构:   

```c
#include <sys/stat.h>

int futimens(int fd, const struct timespec times[2]);
int utimensat(int fd, const char *path, const struct timespec times[2], int flag);
```    

返回值：若成功，返回0；若出错，返回-1。    

这两个函数的times数组参数的第⼀个元素包含访问时间，第⼆元素包含修改时间。   

时间戳可以按下列4种⽅式之⼀进⾏指定：   

1. 如果 times 参数是⼀个空指针，则访问时间和修改时间两者都设置为当前时间。
2. 如果 times 参数指向两个 timespec 结构的数组，任⼀数组元素的 tv_nsec 字段的值为 UTIME_NOW，
相应的时间戳就设置为当前时间，忽略相应的 tv_sec 字段。
3. 如果 times 参数指向两个 timespec 结构的数组，任⼀数组元素的 tv_nsec 字段的值为 UTIME_OMIT，
相应的时间戳保持不变，忽略相应的 tv_sec 字段。
4. 如果 times 参数指向两个 timespec 结构的数组，且 tv_nsec 字段的值为既不是 UTIME_NOW 也
不是 UTIME_OMIT，在这种情况下，相应的时间戳设置为相应的 tv_sec 和tv_nsec字段的值。    

执⾏这些函数所要求的优先权取决于times参数的值：    

- 如果 times 是一个空指针，或者任一 tv_nsec 字段设为 UTIME_NOW，则进程的有效用户 ID 必须
等于该文件的所有者 ID；进程对该文件必须具有写权限，或者进程是一个超级用户进程
- 如果 times 是⾮空指针，并且任⼀ tv_nsec 字段的值既不是 UTIME_NOW 也不是UTIME_OMIT，
则进程的有效⽤户ID必须等于该⽂件的所有者ID，或者进程必须是⼀个超级⽤户进程。对⽂件只具有写
权限是不够的。
- 如果 times 是⾮空指针，并且两个 tv_nsec 字段的值都为 UTIME_OMIT，就不执⾏任何的权限检查。    

futimens 和 utimensat 函数都包含在POSIX.1 中，第 3 个函数 utimes包含在Single UNIX
Specification 的XSI扩展选项中。   

```c
#include <sys/time.h>

int utimes(const char *pathname, const struct timeval times[2]);
```   

返回值：若成功，返回0；若出错，返回-1。    

utimes 函数对路径名进⾏操作。times 参数是指向包含两个时间戳（访问时间和修改时间）元素的数组的
指针，两个时间戳是⽤秒和微妙表⽰的。    

注意，我们不能对状态更改时间 st_ctim（i节点最近被修改的时间）指定⼀个值，因为调⽤utimes函数时，
此字段会被⾃动更新。    

## 4.21 函数 mkdir, mkdirat 和 rmdir

⽤ mkdir 和 mkdirat 函数创建⽬录，⽤ rmdir 函数删除⽬录。    

```c
#include <sys/stat.h>

int mkdir(const char *pathname, mode_t mode);
int mkdirat(int fd, const char *pathname, mode_t mode);
```   

返回值：若成功，返回0；若出错，返回-1。   

这两个函数创建⼀个新的空⽬录。其中，.和..⽬录项是⾃动创建的。所指定的⽂件访问权限mode由进程的
⽂件模式创建屏蔽字修改。    

mkdirat 函数与 mkdir 函数类似。当 fd 参数具有特殊值 AT_FDCWD 或者 pathname 参数指定了绝对
路径名时，mkdirat 与 mkdir 完全⼀样。否则，fd 参数是⼀个打开⽬录，相对路径名根据此打开⽬录
进⾏计算。    

⽤ rmdir 函数可以删除⼀个空⽬录。空⽬录是只包含 . 和 .. 这两项的⽬录。   

```c
#include <unistd.h>
int rmdir(const char *pathname);
```    

返回值：若成功，返回0；若出错，返回-1。   

## 4.22 读目录

对某个⽬录具有访问权限的任⼀⽤户都可以读该⽬录，但是，为了防⽌⽂件系统产⽣混乱，只有内核才能写
⽬录。回忆 4.5 节，⼀个⽬录的写权限位和执⾏权限位决定了在该⽬录中能否创建新⽂件以及删除⽂件，
它们并不表⽰能否写⽬录本⾝。    

⽬录的实际格式依赖于 UNIX 系统实现和⽂件系统的设计。早期的系统（如 V7）有⼀个⽐较简单的结构：
每个⽬录项是16个字节，其中 14 个字节是⽂件名，2个字节是i节点编号。⽽对于4.2BSD，由于它允许
更长的⽂件名，所以每个⽬录项的长度是可变的。这就意味着读⽬录的程序与系统相关。为了简化读⽬录的过程，
UNIX 现在包含了⼀套与⽬录有关的例程，它们是POSIX.1的⼀部分。很多实现阻⽌应⽤程序使⽤ read 函数
读取⽬录的内容，由此进⼀步将应⽤程序与⽬录格式中与实现相关的细节隔离。    

```c
#include <dirent.h>

DIR *opendir(const char *pathname);
DIR *fdopendir(int fd);
```     

返回值：若成功，返回指针；若出错，返回NULL。    

```c
struct dirent *readdir(DIR *dp);
```   

返回值：若成功，返回指针；若在⽬录尾或出错，返回NULL。    

```c
void rewinddir(DIR *dp);
int closeDIR(DIR *dp);
```    

返回值：若成功，返回0；若出错，返回-1。   

```c
long telldir(DIR *dp);
```   

返回值：与dp关联的⽬录中的当前位置。    

```c
void seekdir(DIR *dp, long loc);
```    

fdopendir函数最早出现在SUSv4中，它提供了⼀种⽅法，可以把打开⽂件描述符转换成⽬录处理函数需要的
DIR结构。    

telldir 和 seekdir 函数不是基本 POSIX.1 标准的组成部分。它们是SUS中的XSI扩展，所以可以期望
所有符合UNIX系统的实现都会提供这两个函数。    

定义在头⽂件 &lt;dirent.h&gt; 中的 dirent 结构与实现有关。实现对此结构所做的定义⾄少包含
下列两个成员：    

```c
ino_t d_ino;   /* i-node number */
char d_name[];   /* null-terminated filename */
```   

DIR 结构是⼀个内部结构，上述 7 个函数⽤这个内部结构保存当前正在被读的⽬录的有关信息。其作⽤类似
于FILE结构。FILE结构由标准I/O库维护，我们将在第5章中对它进⾏说明。    

由 opendir 和 fdopendir 返回的指向 DIR 结构的指针由另外5个函数使⽤。opendir 执⾏初始化操作，
使第⼀个 readdir 返回⽬录中的第⼀个⽬录项。DIR 结构由fdopendir创建时，readdir返回的第⼀项
取决于传给 fdopendir 函数的⽂件描述符相关联的⽂件偏移量。注意，⽬录中各⽬录项的顺序与实现有关。
它们通常并不按字母顺序排列。    

## 4.23 函数 chdir, fchdir 和 getcwd

每个进程都有⼀个当前⼯作⽬录，此⽬录是搜索所有相对路径名的起点。当前⼯作⽬录是进程的⼀个属性，
起始⽬录则是登录名的⼀个属性。    

进程调用 chdir 和 fchdir 函数可以更改当前工作目录：   

```c
#include <unistd.h>

int chdir(const char *pathname);
int fchdir(int fd);
```    

返回值：若成功，返回0；若出错，返回-1。    

函数 getcwd 可以获取当前工作目录完整的绝对路径名。   

```c
#include <unistd.h>
char *getcwd(char *buf, size_t size);
```   

返回值：若成功，返回buf；若出错，返回NULL   

## 4.24 设备特殊文件

st_dev 和 st_rdev 这两个字段经常引起混淆：    

- 每个文件系统所在的存储设备都由其主、次设备号表示。设备号所用的数据类型是基本系统数据类型 dev_t。
主设备号标识设备驱动程序，有时编码为与其通信的外设版；次设备号标识特定的子设备。一个磁盘驱动器
经常包含若干个文件系统。在同一磁盘驱动器上的各文件系统通常具有相同的主设备号，但是次设备号确不同。
- 我们通常使用两个宏：major 和 minor 来访问主、次设备号，大多数实现都定义这两个宏。    
早期的系统⽤16位整型存放设备号：8位⽤于主设备号，8位⽤于次设备号。FreeBSD 8.0和Mac OS X 10.6.8
使⽤32位整型，其中8位表⽰主设备号，24位表⽰次设备号。在Linux 3.2.0上，虽然dev_t是64位整型，
但其中只有12位⽤于主设备号，20位⽤于次设备号。    
POSIX.1 说明 dev_t 类型是存在的，但没有定义它包含什么，或如何取得其内容。大多数实现定义了宏
major 和 minor，但在哪一个头文件中定义它们则与实现有关。基于 BSD 的UNIX 系统将它们定义在
&lt;sys/types&gt; 中。Linux 将它们定义在 &lt;sys/sysmacros.h&gt; 中，而该头文件又包含
在 &lt;sys/type.h&gt; 中。     
- 系统中与每个文件名关联的 st_dev 值时文件系统的设备号，该文件系统包含了这一文件名以及与其对应
的 i 节点。
- 只有字符特殊文件和块特殊文件才有 st_rdev 值。此值包含实际设备的设备号。