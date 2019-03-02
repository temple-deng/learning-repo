# 第 1 章 UNIX 基础知识

<!-- TOC -->

- [第 1 章 UNIX 基础知识](#第-1-章-unix-基础知识)
  - [1.1 引言](#11-引言)
  - [1.2 UNIX 体系结构](#12-unix-体系结构)
  - [1.5 输入和输出](#15-输入和输出)
  - [1.6 程序和进程](#16-程序和进程)
  - [1.7 出错处理](#17-出错处理)
  - [1.8 用户标识](#18-用户标识)
  - [1.9 信号](#19-信号)
  - [1.10 时间值](#110-时间值)
  - [1.11 系统调用和库函数](#111-系统调用和库函数)
- [第 2 章 UNIX 标准及实现](#第-2-章-unix-标准及实现)
  - [2.2 UNIX 标准化](#22-unix-标准化)
    - [2.2.1 ISO C](#221-iso-c)
    - [2.2.2 IEEE POSIX](#222-ieee-posix)
  - [2.3 UNIX 系统实现](#23-unix-系统实现)

<!-- /TOC -->

## 1.1 引言

所有操作系统都为它们所运⾏的程序提供服务。典型的服务包括：执⾏新程序、打开⽂件、读⽂件、分配存储
区以及获得当前时间等，本书集中阐述不同版本的UNIX操作系统所提供的服务。    

## 1.2 UNIX 体系结构

从严格意义上说，可将操作系统定义为一种软件，它控制计算机硬件资源，提供程序运行环境。我们将这种
软件称为内核。    

注意这里描述的核心，首先是管理硬件，然后是为应用程序提供运行环境。   

内核的接口被称为系统调用，公用函数库构建在系统调用接口之上，应用程序既可以使用公用函数库，也可以
使用系统调用。     

![architecture](https://raw.githubusercontent.com/temple-deng/markdown-images/master/unix/arch.png)    

从广义上说，操作系统包括了内核和一些其他软件，这些软件使得计算机能够发挥作用，并使计算机具有自己的
特型。这里所说的其他软件包括系统实用程序（system utility）、应用程序、shell 以及公用函数库。   

## 1.5 输入和输出

1. **文件描述符**    

文件描述符通常是一个小的非负整数，内核用以标识一个特定进程正在访问的文件。当内核打开一个现有文件
或创建一个新文件时，它都返回一个文件描述符。在读、写文件时，可以使用这个文件描述符。   

2. **标准输入、标准输出和标准错误**    

按惯例，每当运行一个新程序时，所有的 shell 都为其打开 3 个文件描述符，即 stdin, stdout, stderr。   

3. **不带缓冲的 IO**    

函数open、read、write、lseek以及close提供了不带缓冲的I/O。这些函数都使⽤⽂件描述符。   

例子，从 stdin 读写到 stdout。    

```c
#include "apue.h"

#define BUFFSIZE 4096

int main(void) {
  int n;
  char buf[BUFFSIZE];

  while((n = read(STDIN_FILENO, buf, BUFFSIZE)) > 0) {
    if (write(STDOUT_FILENO, buf, n) != n) {
      err_sys("write error");
    }
  }

  if (n < 0) {
    err_sys("read error");
  }
  exit(0);
}
```    

头文件 &lt;unistd.h&gt;(apue.h 中包含了此头文件)及两个常量 STDIN_FILENO 和 STDOUT_FILENO
是 POSIX 标准的一部分。头文件 unistd.h 中包含了很多 UNIX 系统服务的函数原型，例如上面的 read
和write。    

两个常量 STDIN_FILENO 和 STDOUT_FILENO 定义在 &lt;unistd.h&gt; 头⽂件中，它们指定了标准
输⼊和标准输出的⽂件描述符。在POSIX标准中，它们的值分别是0和1。   

read 函数返回读取的字节数。当到达输入文件的尾端时，read 返回 0，程序停止执行，如果发生了一个
读错误，read 返回 -1。出错时大多数系统函数返回 -1。   

4. **标准IO**   

标准 IO 函数为那些不带缓冲的 IO 函数提供提供了一个带缓冲的接口。使用标准 IO 函数无需担心如何
选取最佳的缓冲区大小。我们最熟悉的标准 IO 函数是 printf。   

下面程序的功能类似前一个：   

```c
#include "apue.h"

int main(void) {
  int c;
  while ((c = getc(stdin)) != EOF) {
    if (putc(c, stdout) == EOF) {
      err_sys("output error");
    }
  }

  if (ferror(stdin)) {
    err_sys("input error");
  }

  exit(0);
}
```   

函数 getc 一次读取一个字符，然后函数 putc 将此字符写到标准输出。读到输入的最后一个字节时，getc
返回常量 EOF（该常量在 &lt;stdio.h&gt; 中定义）。标准 IO 常量 stdin 和 stdout 也在头文件
&lt;stdio.h&gt; 中定义，它们分别表示标准输入和标准输出。   

注意上面的 STDIN_FILENO 这种是文件描述符，因为之前的那些函数接收的参数是文件描述符。   

## 1.6 程序和进程

1. **进程控制**    

有 3 个用于进程控制的主要函数：fork, exec 和 waitpid（exec函数有7种变体，但经常把它们统称为
exec函数）。    

```c
#include "apue.h"
#include <sys/wait.h>

int main(void) {
  char buf[MAXLINE];
  pid_t pid;
  int status;

  printf("%% ");
  while(fgets(buf, MAXLINE, stdin) != NULL) {
    if (buf[strlen(buf) - 1] == '\n') {
      buf[strlen(buf) - 1] = 0; // replace newline with null
    }

    if ((pid = fork()) < 0) {
      err_sys("fork error");
    } else if (pid == 0) {
      execlp(buf, buf, (char *)0);
      err_ret("couldn't execute: %s", buf);
      exit(127);
    }

    if (pid = waitpid(pid, &status, 0) < 0) {
      err_sys("waitpid error");
    }
    printf("%% ");
  }
  exit(0);
}
```    

- 用标准 IO 函数 `fgets()` 从标准输入一次读取一行。当键入文件结束符（通常是 ctrl+D）作为行
的第一个字符时，`fgets` 返回一个 null 指针，于是循环停止，进程也就终止。
- 因为 `fgets()` 返回的每一行都以换行符终止，后随一个 null 字节，因此用标准C函数 strlen计算
此字符串的长度，然后用一个 null 字节替换换行符。这样做是因为 execlp 函数要求的参数是以 null
结束的而不是以换行符结束的。
- 调用 fork 创建一个新进程。新进程是调用进程的一个副本，fork 对父进程返回新的⼦进程的进程ID
（⼀个⾮负整数），对⼦进程则返回0。
- 在⼦进程中，调⽤ execlp 以执⾏从标准输⼊读⼊的命令。这就⽤新的程序⽂件替换了⼦进程原先执⾏的
程序⽂件。fork和跟随其后的exec两者的组合就是某些操作系统所称的产⽣（spawn）⼀个新进程。   
- ⼦进程调⽤ execlp 执⾏新程序⽂件，⽽⽗进程希望等待⼦进程终⽌，这是通过调⽤ waitpid 实现的，
其参数指定要等待的进程（即pid参数是⼦进程ID）。waitpid函数返回⼦进程的终⽌状态（status 变量）。   

## 1.7 出错处理

当 UNIX 系统函数出错时，通常会返回一个负值，而且整型变量 errno 通常被设置为具有特定信息的值。
例如 open 函数如果出错返回 -1。在 open 出错时，有大约 15 种不同的 errno 值。而有些函数对于
出错则使用另一种约定而不是返回负值。例如，大多数返回指向对象指针的函数，在出错时会返回一个 null
指针。   

文件 &lt;error.h&gt; 中定义了 errno 以及可以赋予它的各种常量。这些常量都以字符 E 开头。   

POSIX 和 ISO C 将 errno 定义为一个符号，它扩展称为一个可修改的整型左值（lvalue）。它可以是
一个包含出错编号的整数，也可以是一个返回出错编号指针的函数，以前使用的定义是：   

```c
extern int errno;
```   

但是在支持多线程的环境中，多个线程共享进程地址空间，每个线程都有属于它自己的局部 errno 以避免
一个线程干扰另一个线程。例如 Linux 将其定义为：   

```c
extern int *__errno_location(void);
#define errno(*__errno_location())
```    

对于 errno 应当注意两条规则。第⼀条规则是：如果没有出错，其值不会被例程清除。因此，仅当函数的
返回值指明出错时，才检验其值。第⼆条规则是：任何函数都不会将 errno 值设置为0，⽽且在
&lt;errno.h&gt; 中定义的所有常量都不为0。   

C标准定义了两个函数， 它们⽤于打印出错信息。   

```c
#include <string.h>
char *strerror(int errnum);
```    

该函数将 errnum（通常就是 errno）值映射为一个出错消息字符串，并且返回此字符串的指针。   

perror 函数基于 errno 的当前值，在标准错误上产生一条出错信息，然后返回。    

```c
#include <stdio.h>
void perror(const char *msg);
```   

它⾸先输出由 msg 指向的字符串，然后是⼀个冒号，⼀个空格，接着是对应于errno值的出错消息，最后是
⼀个换⾏符。   

```c
#include "apue.h"
#include <errno.h>

int main(int argc, char *argv[]) {
  fprintf(stderr, "EACCES: %s\n", stderror(EACCES));
  errno = ENOENT;
  perror(argv[0]);
  exit(0);
}
```    

**出错恢复**    

可将在 &lt;errno.h&gt; 中定义的各种出错分成两类：致命性的和⾮致命性的。对于致命性的错误，⽆法
执⾏恢复动作。最多能做的是在⽤户屏幕上打印出⼀条出错消息或者将⼀条出错消息写⼊⽇志⽂件中，然后退
出。对于⾮致命性的出错，有时可以较妥善地进⾏处理。⼤多数⾮致命性出错是暂时的（如资源短缺），当
系统中的活动较少时，这种出错很可能不会发⽣。    

## 1.8 用户标识

除了在口令⽂件中对⼀个登录名指定⼀个组ID外，⼤多数 UNIX 系统版本还允许⼀个⽤户属于另外⼀些组。
这⼀功能是从 4.2BSD 开始的，它允许⼀个⽤户属于多⾄16个其他的组。登录时，读⽂件/etc/group，寻
找列有该⽤户作为其成员的前 16 个记录项就可以得到该⽤户的附属组ID（supplementary group ID）。   

## 1.9 信号

信号（signal）⽤于通知进程发⽣了某种情况。例如，若某⼀进程执⾏除法操作，其除数为0，则将名为
SIGFPE（浮点异常）的信号发送给该进程。进程有以下3种处理信号的⽅式：    

1. 忽略信号。有些信号表示硬件异常，例如，除以 0 或访问进程地址空间以外的存储单元等，因为这些异常
产生的后果不确定，所以不推荐使用这种处理方式。   
2. 按系统默认方式处理。对于除数为0，系统默认方式是终止该进程。
3. 提供一个函数，信号发生时调用该函数，这被称为捕捉该信号。    

很多情况都会产⽣信号。终端键盘上有两种产⽣信号的⽅法，分别称为中断键（interrupt key，通常是
Delete键或Ctrl+C）和退出键（quit key，通常是Ctrl+\），它们被⽤于中断当前运⾏的进程 另⼀种
产⽣信号的⽅法是调⽤kill函数。在⼀个进程中调⽤此函数就可向另⼀个进程发送⼀个信号。当然这样做也
有些限制：当向⼀个进程发送信号时，我们必须是那个进程的所有者或者是超级⽤户。   

```c
#include "apue.h"
#include <sys/wait.h>

static void sig_int(int);

int main(void) {
  char buf[MAXLINE];
  pid_t pid;
  int status;

  if (signal(SIGINT, sig_int) == SIG_ERR) {
    err_sys("signal error");
  }

  printf("%% ");
  while(fgets(buf, MAXLINE, stdin) != NULL) {
    if (buf[strlen(buf) - 1] == '\n') {
      buf[strlen(buf) - 1] = 0;
    }

    if ((pid = fork()) < 0) {
      err_sys("fork error");
    } else if (pid == 0) {
      execlp(buf, buf, (char *)0);
      err_ret("couldn't execute: %s", buf);
      exit(127);
    }

    if ((pid = waitpid(pid, &status, 0)) < 0) {
      err_sys("waitpid error");
    }
    printf("%% ");
  }
  exit(0);
}
```    

## 1.10 时间值

历史上，UNIX系统使⽤过两种不同的时间值：   

1. ⽇历时间。该值是⾃协调世界时（Coordinated Universal Time，UTC）1970年1⽉1⽇00:00:00
这个特定时间以来所经过的秒数累计值（早期的⼿册称UTC为格林尼治标准时间）。这些时间值可⽤于记录⽂件
最近⼀次的修改时间等。   

系统基本数据类型time_t⽤于保存这种时间值。   

2. 进程时间。也被称为CPU时间，⽤以度量进程使⽤的中央处理器资源。进程时间以时钟滴答计算。每秒钟
曾经取为50、60或100个时钟滴答。    

系统基本数据类型clock_t保存这种时间值。    

当度量一个进程的执行时间时，UNIX 系统为一个进程维护了 3 个进程时间值：   

- 时钟时间；
- 用户 CPU 时间；
- 系统 CPU 时间；    

时钟时间又称为墙上时钟时间，它是进程运行的时间总量，其值与系统中同时运行的进程数有关。    

用户 CPU 时间是执行用户指令所用的时间量。系统 CPU 时间是为该进程执行内核程序所经历的时间。例如，
每当一个进程执行一个系统服务时，如 read 或 write，在内核执行该服务所花费的时间就计入该进程的系统
CPU 时间。   

## 1.11 系统调用和库函数

各种版本的 UNIX 实现都提供良好定义、数量有限、直接进⼊内核的⼊口点，这些⼊口点被称为系统调⽤。
Linux 3.2.0提供了380个系统调⽤。   

UNIX 所使⽤的技术是为每个系统调⽤在标准 C 库中设置⼀个具有同样名字的函数。⽤户进程⽤标准C调⽤
序列来调⽤这些函数，然后，函数又⽤系统所要求的技术调⽤相应的内核服务。例如，函数可将⼀个或多个C
参数送⼊通⽤寄存器，然后执⾏某个产⽣软中断进⼊内核的机器指令。从应⽤⾓度考虑，可将系统调⽤视为C函数。   

还有一些通用库函数，虽然这些函数可能会调用一个或多个内核的系统调用，但是它们并不是内核的入口点。    

从实现者的⾓度来看，系统调⽤和库函数之间有根本的区别，但从⽤户⾓度来看，其区别并不重要。在本书中，
系统调⽤和库函数都以C函数的形式出现，两者都为应⽤程序提供服务。   


# 第 2 章 UNIX 标准及实现

## 2.2 UNIX 标准化

### 2.2.1 ISO C

ANSI 是美国国家标准学会（American National Standards Institute）的缩写，它是国际标准化组
织（International Organization for Standardization， ISO）中代表美国的成员。IEC是国际
电⼦技术委员会（International Electrotechnical Commission）的缩写。   

按照 C99 标准定义的各个头文件，可将 ISO C 库分成 24 个区。POSIX.1 标准包括这些头文件以及另外
一些头文件。所有这些头文件在 4 种 UNIX 实现（FreeBSD 8.O, Linux 3.2.0, Mac OS X 10.6.8,
Solaris 10）中都支持。   

- assert.h: 验证程序断言
- complex.h: 复数算术运算支持
- ctype.h: 字符分类和映射支持
- errno.h: 出错码
- fenv.h: 浮点环境
- float.h: 浮点常量及特性
- inttypes.h: 整型格式变换
- iso646.h: 赋值、关系及一元操作符宏
- limits.h: 实现常量
- locale.h: 本地化类别及相关定义
- math.h: 数学函数、类型声明及常量
- setjmp.h: 非局部 goto
- signal.h: 信号
- stdarg.h: 可变长度参数表
- stdbool.h: 布尔类型和值
- stddef.h: 标准定义
- stdint.h: 整型
- stdio.h: 标准 IO 库
- stdlib.h: 实用函数
- string.h: 字符串操作
- tgmath.h: 通用类型数学宏
- time.h: 时间和日期
- wchar.h: 扩充的多字节和宽字符支持
- wctype.h: 宽字符分类和映射支持    

### 2.2.2 IEEE POSIX

POSIX 是一个最初由 IEEE（Institute of Electrical and Electronics
Engineers，电气和电子工程师学会）制订的标准族。POSIX 指的是可移植操作系统接口（Portable
Operating System Interface）。    

与本书相关的是1003.1操作系统接口标准，该标准的目的是提升应用程序在各种UNIX系统环境之间的可移植
性。它定义了“符合POSIX 的”(POSIX compliant)操作系统必须提供的各种服务。该标准已被很多计算机
制造商采用。虽然1003.1标准是以UNIX操作系统为基础的，但是它并不限于UNIX和UNIX类的系统。   

由于 1003.1 标准说明了一个接口(interface)而不是一种实现(implementation)，所以并不区分系统
调用和库函数。所有在标准中的例程都被称为函数。   

下面的列表总结了 POSIX.1 指定的必需的和可选的头文件。因为 POSIX.1 包含了 ISO C 标准库函数，
所以它还需要上面列表中列出的头文件。    

必需的头文件：   

- aio.h: 异步 IO
- cpio.h: cpio 归档值
- dirent.h: 目录项
- dlfcn.h: 动态链接
- fnctl.h: 文件控制
- fnmatch.h: 文件名匹配类型
- glob.h: 路径名模式匹配与生成
- grp.h: 组文件
- iconv.h: 代码集变换实用程序
- langinfo.h: 语言信息常量
- monetary.h: 货币类型与函数
- netdb.h: 网络数据库操作
- nl_typefs.h: 消息类
- poll.h: 投票函数
- ptrhead.h: 线程
- pwd.h: 口令文件
- regex.h: 正则表达式
- sched.h: 执行调度
- semaphore.h: 信号量
- strings.h: 字符串
- tar.h: tar 归档值
- termios.h: 终端 IO
- unistd.h: 符号常量
- wordexp.h: 字扩充类型
- arpa.inet.h: 因特网定义
- net/if.h: 套接字本地接口
- netinet/in.h: 因特网地址族
- netinet/tcp.h: 传输控制协议定义
- sys/mman.h: 存储管理声明
- sys/select.h: select 函数
- sys/socket.h: 套接字接口
- sys/stat.h: 文件状态
- sys/statvfs.h: 文件系统信息
- sys/times.h: 进程时间
- sys/types.h: 基本系统数据类型
- sys/un.h: UNIX 域套接字定义
- sys/utsname.h: 系统名
- sys/wait.h: 进程控制

XSI 可选头文件：   

- fmtmsg.h: 消息显示结构
- ftw.h: 文件树漫游
- libgen.h: 路径名管理函数
- ndbm.h: 数据库操作
- search.h: 搜索表
- syslog.h: 系统出错日志记录
- utmpx.h: 用户账户数据库
- sys/ipc.h: IPC
- sys/msg.h: XSI 消息队列
- sys/resource.h: 资源操作
- sys/sem.h: XSI 信号量
- sys/shm.h: XSI 共享存储
- sys/time.h: 时间类型
- sys/uio.h: 适量 IO 操作

其他可选头文件：   

- mqueue.h: 消息队列
- spawn.h: 实时 spawn 接口

## 2.3 UNIX 系统实现

上一节说明了3个由各自独立的组织所制定的标准:ISO C、IEEE POSIX 以及Single UNIX Specification。
但是，标准只是接口的规范。这些标准是如何与现实世界相关连的呢?这些标准由厂商采用，然后转变成具体实现。   

UNIX的各种版本和变体都起源于在PDP-11系统上运行的UNIX分时系统第6版（1976年）和第7版（1979年）
（通常称为V6和V7）。这两个版本是在贝尔实验室以外首先得到广泛应用的UNIX系统。从这棵树上演进出
以下3个分支。    

1. AT&T 分支，从此引出了系统 III 和系统 V
2. 加州大学伯克利分校分支，从此引出了 4.xBSD 实现
3. 由AT&T贝尔实验室的计算科学研究中心不断开发的UNIX研究版本，从此引出UNIX分时系统第8版、第9版，
终止于1990年的第10版