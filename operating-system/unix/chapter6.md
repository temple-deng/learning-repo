# 第 6 章 系统数据文件和信息

## 6.1 引言

UNIX 系统的正常运作需要使⽤⼤量与系统有关的数据⽂件，例如，口令⽂件/etc/passwd和组⽂件/etc/group
就是经常被多个程序频繁使⽤的两个⽂件。⽤户每次登录 UNIX 系统，以及每次执⾏ `ls -l` 命令时都要
使⽤口令⽂件。    

由于历史原因，这些数据⽂件都是ASCII⽂本⽂件，并且使⽤标准I/O库读这些⽂件。但是，对于较⼤的系统，
顺序扫描口令⽂件很花费时间，我们需要能够以⾮ASCII⽂本格式存放这些⽂件，但仍向使⽤其他⽂件格式的
应⽤程序提供接口。对于这些数据⽂件的可移植接口是本章的主题。本章也包括了系统标识函数、时间和⽇期函数。    

## 6.2 口令文件

UNIX 系统口令文件包含了下面的字段，这些字段包含在 &lt;pwd.h&gt; 中定义的 passwd 结构中：   

注意，POSIX.1 只指定 passwd 结构包含的 10 个字段中的 5 个。⼤多数平台⾄少⽀持其中7个字段。
BSD派⽣的平台⽀持全部10个字段。    

- 用户名：`char *pw_name`
- 加密口令：`char *pw_passwd`
- 数值用户ID：`uid_t pw_uid`
- 数值组ID：`gid_t pw_gid`
- 注释字段：`char *pw_gecos`
- 初始工作目录：`char *pw_dir`
- 初始 shell：`char *pw_shell`
- 用户访问类：`char *pw_class`
- 下次更改口令时间：`time_t pw_change`
- 账户有效期时间：`time_t pw_expire`

POSIX.1 定义了两个获取口令⽂件项的函数。在给出⽤户登录名或数值⽤户ID后，这两个函数就能查看相关项。   

```c
#include <pwd.h>

struct passwd *getpwuid(uid_t uid);
struct passwd *getpwnam(const char *name);
```   

返回值：若成功，返回指针；若出错，返回NULL。    

下列 3 个函数可用于查看整个口令文件：   

```c
#include <pwd.h>
struct passwd *getpwent(void);
// 返回值：若成功，返回指针，若出错或到达文件尾端，返回 NULL

void setpwent(void);
void endpwent(void);
```    

基本 POSIX.1 标准没有定义这3个函数。在 SUS 中，它们被定义为XSI扩展。因此，可预期所有UNIX实现
都将提供这些函数。     

调用 getpwent 时，它返回口令文件中的下一个记录项。如同上面所述的两个 POSIX.1 函数一样，它返回
一个由它填写好的 passwd 结构的指针。每次调用此函数时都重写该结构。    

