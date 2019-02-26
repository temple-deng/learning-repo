# 第 4 章 文件和目录

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

