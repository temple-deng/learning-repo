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


关于这些登录项，请注意下列各点：    

- 通常有⼀个⽤户名为root的登录项，其⽤户ID是0（超级⽤户）。
- 口令⽂件项中的某些字段可能是空。
- shell字段包含了⼀个可执⾏程序名，它被⽤作该⽤户的登录shell。若该字段为空，则取系统默认值，
通常是/bin/sh。注意，squid登录项的该字段为/dev/null。显然，这是⼀个设备，不是可执⾏⽂件，将
其⽤于此处的⽬的是，阻⽌任何⼈以⽤户squid的名义登录到该系统。
- 为了阻⽌⼀个特定⽤户登录系统，除使⽤/dev/null外，还有若⼲种替代⽅法。常见的⼀种⽅法是，
将/bin/false ⽤作登录 shell。它简单地以不成功（⾮ 0）状态终⽌，该shell将此种终⽌状态判断为假。
另⼀种常见⽅法是，⽤/bin/true禁⽌⼀个账户。它所做的⼀切是以成功（0）状态终⽌。 

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

函数setpwent反绕它所使⽤的⽂件，endpwent则关闭这些⽂件。在使⽤getpwent查看完口令⽂件后，⼀定
要调⽤endpwent关闭这些⽂件。     


## 6.3 阴影口令

现在，某些系统将加密口令存放在另⼀个通常称为阴影口令（shadow password）的⽂件中。该⽂件⾄少要
包含⽤户名和加密口令。与该口令相关的其他信息也可存放在该⽂件中 struct spwd：   

- `char *sp_namp`: 用户登录名
- `char *sp_pwdp`: 加密口令
- `int sp_lstchg`: 上次更改口令以来经过的时间
- `int sp_min`: 经多少天后允许修改
- `int sp_max`: 要求更改尚余天数
- `int sp_warn`: 超期警告天数    

在Linux 3.2.0和Solaris 10中，与访问口令⽂件的⼀组函数相类似，有另⼀组函数可⽤于访问阴影口令⽂件：   

```c
#include <shadow.h>
struct spwd *getspnam(const char *name);
struct spwd *getspent(void);
```   

若成功，返回指针；若出错，返回NULL。   

```c
void setspent(void);
void endspent(void);
```    


