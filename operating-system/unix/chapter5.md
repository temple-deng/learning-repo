# 第 5 章 标准 IO 库

<!-- TOC -->

- [第 5 章 标准 IO 库](#第-5-章-标准-io-库)
  - [5.1 引言](#51-引言)
  - [5.2 流和 FILE 对象](#52-流和-file-对象)
  - [5.3 标准输入、标准输出和标准错误](#53-标准输入标准输出和标准错误)
  - [5.4 缓冲](#54-缓冲)
  - [5.5 打开流](#55-打开流)
  - [5.6 读和写流](#56-读和写流)
  - [5.7 每行一次 IO](#57-每行一次-io)
  - [5.9 二进制 IO](#59-二进制-io)
  - [5.10 定位流](#510-定位流)
  - [5.11 格式化 IO](#511-格式化-io)
  - [5.12 实现细节](#512-实现细节)
  - [5.13 临时文件](#513-临时文件)
  - [5.14 内存流](#514-内存流)

<!-- /TOC -->

## 5.1 引言

不仅是 UNIX，很多其他操作系统都实现了标准 IO 库，所以这个库由 ISO C 标准说明。    

标准 IO 库处理很多细节，如缓冲区分配、以优化的块长度执行 IO 等。这些处理使用户不必担心如何选择
正确的块长度。    

## 5.2 流和 FILE 对象

在第 3 章中，所有 IO 函数都是围绕文件描述符的。当打开一个文件时，即返回一个文件描述符，然后该
文件描述符就用于后续的 IO 操作。而对于标准 IO 库，它们的操作是围绕流进行的。当用标准 IO 库打开
或创建一个文件时，我们已使一个流与一个文件相关联。    

对于 ASCII 字符集，一个字符用一个字节表示。对于国际字符集，一个字符可用多个字节表示。标准 IO
文件流可用于单字节或多字节字符集。流的定向决定了所读、写的字符是单字节还是多字节的。当一个流最初
被创建时，它并没有定向。如若在未定向的流上使用一个多字节的 IO 函数，则将该流的定向设置为宽定向的。
若在未定向的流上使用一个单字节 IO 函数，则将该流的定向设为字节定向的。只有两个函数可改变流的定向。
freopen 函数清楚一个流的定向；fwide 函数可用于设置流的定向。   

```c
#include <stdio.h>
#include <wchar.h>
int fwide(FILE *fp, int mode);
```   

返回值：若流是宽定向的，返回正值；若流是字节定向的，返回负值；若流是未定向的，返回0。    

根据 mode 参数的不同值，fwide 函数执行不同的工作。   

- 如若 mode 参数值为负，fwide 将试图使指定的流是字节定向的
- 如若 mode 参数值为正，fwide 将试图使指定的流是宽定向的
- 如若 mode 参数值为 0，fwide 将不试图设置流的定向，但返回标识该流定向的值    

注意，fwide 并不改变已定向流的定向。还应注意的是，fwide ⽆出错返回。试想，如若流是⽆效的，那么
将发⽣什么呢？我们唯⼀可依靠的是，在调⽤ fwide 前先清除 errno，从fwide返回时检查errno的值。   

当打开一个流时，标准 IO 函数 fopen 返回一个指向 FILE 对象的指针。该对象通常是一个结构，它包含
了标准 IO 库为管理该流需要的所有信息，包括用于实际 IO 的文件描述符、指向用于该流缓冲区的指针、
缓冲区的长度、当前在缓冲区中的字符数以及出错标志等。   

在本书中，我们称指向FILE 对象的指针为文件指针。   

## 5.3 标准输入、标准输出和标准错误

对一个进程预定义了 3 个流，并且这 3 个流可以自动地被进程使用，它们是：标准输入、标准输出和标准
错误。这些流引用的文件与在 3.2 节中提到文件描述符 STDIN_FILENO、STDOUT_FILENO 和
STDERR_FILENO 所引用的相同。    

这 3 个标准 IO 流通过预定义文件指针 stdin、stdout 和 stderr 加以引用。这 3 个文件指针定义
在头文件 &lt;stdio.h&gt; 中。   

## 5.4 缓冲

标准 IO 库提供缓冲的目的是尽可能减少使用 read 和 write 调用的次数。它也对每个 IO 流自动地进行
缓冲管理，从而避免了应用程序需要考虑这一点所带来的麻烦。   

标准 IO 提供了以下 3 种类型的缓冲：   

1. 全缓冲。在这种情况下，在填满标准 IO 缓冲区后才进行实际的 IO 操作。对于驻留在磁盘上的文件通常
是由标准 IO 库实施全缓冲的。在一个流上执行第一次 IO 操作时，相关标准 IO 函数通常调用 malloc
获得需使用的缓冲区。    
术语冲洗（flush）说明标准 IO 缓冲区的写操作。缓冲区可由标准 IO 例程自动地冲洗（例如填满一个
缓冲区时），或者可以调用函数 fflush 冲洗一个流。值得注意的是，在 UNIX 环境中，flush 有两种
意思。在标准 IO 库方面，flush 意味着将缓冲区的内容写到磁盘上。在终端驱动程序方面，flush 表示
丢弃已存储在缓冲区中的数据。
2. 行缓冲。在这种情况下，当在输入和输出中遇到换行符时，标准 IO 库执行 IO 操作。这允许我们一次
输出一个字符，但只有在写了一行之后才进行实际 IO 操作。当流涉及一个终端时，通常使用行缓冲。   
对于行缓冲有两个限制。第一，因为标准 IO 库用来收集每一行的缓冲区的长度是固定的，所以只要填满了
缓冲区，那么即使还没有写一个换行符，也进行 IO 操作。第二，任何时候只要通过标准 IO 库要求从
a) 一个不带缓冲的流，或者 b) 一个行缓冲的流得到输入数据，那么就会冲洗所有行缓冲的输出流。
3. 不带缓冲。标准 IO 库不对字符进行缓冲存储。例如，若用标准 IO 函数 fputs 写 15 个字符到不带
缓冲的流中，我们就期望这 15 个字符能立即输出。    

很多系统默认使用下列类型的缓冲：   

- 标准错误是不带缓冲的
- 若是指向终端设备的流，则是行缓冲的；否则是全缓冲的    

对任何一个给定的流，如果我们并不喜欢这些系统默认，则可调用下列两个函数中的一个更改缓冲类型：   

```c
#include <stdio.h>

void setbuf(FILE *restrict fp, char *restrict buf);
int setvbuf(FILE *restrict fp, char *restrict buf, int mode, size_t size);
```    

返回值：若成功，返回0；若出错，返回非0。    

这些函数一定要在流已被打开后调用，而且也应在对流执行任何一个其他操作之前调用。   

可以使用 setbuf 函数打开或关闭缓冲机制。为了带缓冲进行 IO，参数 buf 必须指向一个长度为 BUFSIZ
的缓冲区（该常量定义在 &lt;stdio.h&gt; 中）。通常在此之后该流就是全缓冲的，但是如果该流与一个
终端设备相关，那么某些系统也可将其设置为行缓冲的。为了关闭缓冲，将 buf 设置为 NULL。    

使用 setvbuf，我们可以精确地说明所需的缓冲类型。这是用 mode 参数实现的：    

- _IOFBF：全缓冲
- _IOLBF：行缓冲
- _IONBF：不带缓冲    

如果指定⼀个不带缓冲的流，则忽略 buf 和 size 参数。如果指定全缓冲或⾏缓冲，则 buf 和 size 可
选择地指定⼀个缓冲区及其长度。如果该流是带缓冲的，⽽ buf 是NULL，则标准I/O库将⾃动地为该流分配
适当长度的缓冲区。适当长度指的是由常量BUFSIZ所指定的值。     

任何时候，我们都可强制冲洗一个流。   

```c
#include <stdio.h>
int fflush(FILE *fp);
```     

返回值：若成功，返回 0；若出错，返回 EOF。    

此函数使该流所有未写的数据都被传送至内核。作为一种特殊情况，如若 fp 是 NULL，则此函数将导致所有
输出流被冲洗。    

## 5.5 打开流

下列3个函数打开一个标准 IO 流。   

```c
#include <stdio.h>

FILE * fopen(const char *restrict pathname, const char *restrict type);
FILE * freopen(const char *restrict pathname, const char *restrict type, FILE *restrict fp);
FILE * fdopen(int fd, const char *type);
```   

3个函数的返回值：若成功，返回文件指针；若出错，返回 NULL。   

这 3 个函数的区别如下：   

1. fopen 函数打开路径名为 pathname 的一个指定的文件
2. freopen 函数在一个指定的流上打开一个指定的文件，如若该流已经打开，则先关闭该流，则先关闭该流。
若该流已经定向，则使用 freopen 清除该定向。此函数一般用于将一个指定的文件打开为一个预定义的流：
标准输入、标准输出或标准错误。
3. fdopen 函数取一个已有的文件描述符，并使一个标准的 IO 流与该描述符相结合。此函数常用于由创建
管道和网络通信通道函数返回的描述符。因为这些特殊类型的文件不能用标准 IO 函数 fopen 打开，所以
我们必须先调用设备专用函数以获得一个文件描述符，然后用 fdopen 使一个标准 IO 流与该描述符相结合。   

type 参数指定对 IO 流的读写方式，ISO C 规定 type 参数可以有 15 种不同的值：   

- r, rb: 为读而打开
- w, wb: 把文件截断至 0 长，或为写而创建
- a, ab: 追加；为在文件尾而打开，或为写而创建
- r+, r+b, rb+: 为读和写而打开
- w+, w+b, wb+: 把文件截断至0长，或为读和写而打开
- a+, a+b, ab+: 为在文件尾读和写而打开或创建    

使用字符 b 作为 type 的一部分，这使得标准 IO 系统可以区分文本文件和二进制文件。因为UNIX内核并
不对这两种⽂件进⾏区分，所以在UNIX系统环境下指定字符b作为type的⼀部分实际上并⽆作⽤。    

对于 fdopen，type 参数的意义稍有区别。因为该描述符已被打开，所以 fdopen 为写而打开并不截断
文件。另外，标准 IO 追加写方式也不能用于创建该文件。    

当以读和写类型打开一个文件时（type 中 + 号），具有下列限制：   

- 如果中间没有 fflush、fseek、fsetpos 或 rewind，则在输出的后面不能直接跟随输入。
- 如果中间没有 fseek、fsetpos 或 rewind，或者一个输入操作没有到达文件尾端，则在输入操作之后
不能直接跟随输出。    

调用 fclose 关闭一个打开的流。   

```c
#include <stdio.h>
int fclose(FILE *fp);
```    

返回值：若成功，返回0；若出错，返回 EOF。    

在该⽂件被关闭之前，冲洗缓冲中的输出数据。缓冲区中的任何输⼊数据被丢弃。如果标准I/O库已经为该流
⾃动分配了⼀个缓冲区，则释放此缓冲区。    

当⼀个进程正常终⽌时（直接调⽤exit函数，或从main函数返回），则所有带未写缓冲数据的标准I/O流都
被冲洗，所有打开的标准I/O流都被关闭。    

## 5.6 读和写流

一旦打开了流，则可在 3 种不同类型的非格式化 IO 中进行选择，对其进行读、写操作：   

1. 每次一个字符的 IO。一次读或写一个字符，如果流是带缓冲的，则标准 IO 函数处理所有缓冲
2. 每次一行的 IO，如果想要一次读或写一行，则使用 fgets 和 fputs。每行都以一个换行符终止。当
调用 fgets 时，应说明能处理的最大行长。
3. 直接 IO。fread 和 fwrite 函数支持这种类型的 IO。每次 IO 操作读或写某种数量的对象，而每个
对象具有指定的长度。这两个函数常用于从二进制文件中每次读或写一个结构。    

以下 3 个函数可用于一次读一个字符：   

```c
#include <stdio.h>
int getc(FILE *fp);
int fgetc(FILE *fp);
int getchar(void);
```    

返回值：若成功，返回下一个字符；若已到达文件尾端或出错，返回 EOF    

函数 getchar 等同于 getc(stdin)。前两个函数的区别是，getc 可被实现为宏，而 fgetc 不能实现
为宏。这意味着以下几点：    

1. getc 的参数不应当是具有副作用的表达式，因为它可能会被计算多次
2. 因为 fgetc 一定是个函数，所以可以得到其地址。这就允许将 fgetc 的地址作为一个参数传送给另一
个函数
3. 调用 fgetc 所需时间很可能比调用 getc 要长，因为调用函数所需的时间通常长于调用宏    

注意，不管是出错还是到达文件尾端，这 3 个函数都返回同样的值。为了区分这两种不同的情况，必须调用
ferror 或 feof。    

```c
#include <stdio.h>
int ferror(FILE *fp);
int feof(FILE *fp);
```    

返回值：若条件为真，返回非0；否则，返回 0    

在大多数的实现中，为每个流在 FILE 对象中维护了两个标志：    

- 出错标志
- 文件结束标志    

调用 clearerr 可以清楚这两个标志：   

```c
void clearerr(FILE *fp);
```    

从流中读取数据以后，可以调用 ungetc 将字符再压送回流中。   

```c
#include <stdio.h>
int ungetc(int c, FILE *fp);
```    

返回值：若成功，返回 c；若出错，返回 EOF。    

⽤ungetc压送回字符时，并没有将它们写到底层⽂件中或设备上，只是将它们写回标准I/O库的流缓冲区中。    

对应于上面所述的每个输入函数都有一个输出函数：   

```c
#include <stdio.h>

int putc(int c, FILE *fp);
int fputc(int c, FILE *fp);
int putchar(int c);
```     

返回值：若成功，返回 c；若出错，返回 EOF   

与输入函数一样，putchar(c)等同于putc(c, stdout)，putc可被实现为宏，⽽fputc不能实现为宏。    

## 5.7 每行一次 IO

下面两个函数提供每次输入一行的功能。    

```c
#include <stdio.h>
char *fgets(char *restrict buf, int n, FILE *restrict fp);
char *gets(char *buf);
```    

返回值：若成功，返回 buf；若已达到文件尾端或出错，返回 NULL。    

这两个函数都指定了缓冲区的地址，读入的行将送入其中，gets 从标准输入读。    

对于 fgets，必须指定缓冲的长度 n。此函数一直读到下一个换行符为止，但是不超过 n-1 个字符，读入
的字符被送入缓冲区。该缓冲区以 null 字节结尾。如若该行包括最后一个换行符的字符数超过 n-1，则
fgets 只返回一个不完整的行，但是，缓冲区总是以 null 字节结尾。对 fgets 的下一次调用会继续读
该行。    

gets 是⼀个不推荐使⽤的函数。其问题是调⽤者在使⽤ gets 时不能指定缓冲区的长度。这样就可能造成
缓冲区溢出，写到缓冲区之后的存储空间中，从⽽产⽣不可预料的后果。gets与fgets的另⼀个区别是，gets
并不将换⾏符存⼊缓冲区中。    

fputs 和 puts 提供每次输出一行的功能：   

```c
#include <stdio.h>

int fputs(const char *restrict str, FILE *restrict fp);
int puts(const char *str);
```   

返回值：若成功，返回⾮负值；若出错，返回EOF。     

函数 fputs 将一个以 null 字节终止的字符串写到指定的流，尾端的终止符 null 不写出。    

puts 将⼀个以 null 字节终⽌的字符串写到标准输出，终⽌符不写出。但是，puts随后又将⼀个换⾏符
写到标准输出。    

## 5.9 二进制 IO

如果进行二进制 IO 操作，那么我们更愿意一次读或写一个完整的结构。如果使用 getc 或 putc 读、写
一个结构，那么必须循环通过整个结构，每次循环处理一个字节，一次读或写一个字节，这会非常麻烦而且费时。
如果使用 fputs 和 fgets，那么因为 fputs 在遇到 null 字节时就停⽌，⽽在结构中可能含有 null
字节，所以不能使⽤它实现读结构的要求。相类似，如果输⼊数据中包含有 null 字节或换⾏符，则 fgets
也不能正确⼯作。因此，提供了下列两个函数以执⾏⼆进制I/O操作。     

```c
#include <stdio.h>
size_t fread(void *restrict ptr, size_t size, size_t nobj, FILE *restrict fp);
size_t fwrite(const void *restrict ptr, size_t size, size_t nobj, FILE *restrict fp);
```    

返回值：读或写的对象数。    

这些函数有以下两种常见的用法：   

1. 读或写一个二进制数组。例如，为了将一个浮点数组的第 2-5 个元素写至一个文件上，可以编写如下程序：   

```c
float data[10];
if (fwrite(&data[2], sizeof(float), 4, fp) != 4)
  err_sys("fwrite error");
```    

其中，size 为每个数组元素的长度，nobj 为欲写的元素个数。    

2. 读或写一个结构。例如，可以编写如下程序：    

```c
struct {
  short count;
  long total;
  char name[NAMESIZE];
} item;
if (fwrite(&item, sizeof(item), 1, fp) != 1)
  err_sys("fwrite error");
```    

fread 和 fwrite 返回读或写的对象数。对于读，如果出错或到达⽂件尾端，则此数字可以少于 nobj。
在这种情况，应调⽤ ferror 或 feof 以判断究竟是那⼀种情况。对于写，如果返回值少于所要求的nobj，
则出错。    

## 5.10 定位流

有 3 种方法定位标准 IO 流。   

1. ftell 和 fseek 函数。这两个函数⾃ V7 以来就存在了，但是它们都假定⽂件的位置可以存放在⼀个
长整型中。
2. ftello 和 fseeko 函数。⽂件偏移量可以不必⼀定使⽤长整型。它们使⽤off_t数据类型代替了长整型。
3. fgetpos 和 fsetpos 函数。这两个函数由 ISO C 引入的。它们使⽤⼀个抽象数据类型 fpos_t
记录⽂件的位置。这种数据类型可以根据需要定义为⼀个⾜够⼤的数，⽤以记录⽂件位置    

```c
#include <stdio.h>
long ftell(FILE *fp);
```  

返回值：若成功，返回当前文件位置指示；若出错，返回-1L。    

```c
int fseek(FILE *fp, long offset, int whence);
```   

返回值：若成功，返回当前文件位置指示；若出错，返回-1。   

```c
void rewind(FILE *fp);
```    

对于一个二进制文件，其文件位置指示器是从文件起始位置开始度量，并以字节为度量单位的。ftell 用于
二进制文件时，其返回值就是这种字节位置。为了用 feek 定位一个二进制文件，必须指定一个字节 offset，
以及解释这种偏移量的方式。whence 的值和 3.6 节中 lseek 函数相同：SEEK_SET表⽰从⽂件的起始
位置开始，SEEK_CUR表⽰从当前⽂件位置开始，SEEK_END表⽰从⽂件的尾端开始。    

除了偏移量的类型是 off_t 而非 long 以外，ftello 函数与 ftell 相同，fseeko 函数与 fseek
相同。    

```c
#include <stdio.h>
off_t ftello(FILE *fp);
```   

返回值：若成功，返回当前⽂件位置；若出错，返回(off_t)-1。    

```c
int fseeko(FILE *fp, off_t offset, int whence);
```    

返回值：若成功，返回0；若出错，返回−1。     

```c
#include <stdio.h>

int fgetpos(FILE *restrict fp, fpos_t *restrict pos);
int fsetpos(FILE *fp, const fpos_t *pos);
```    

返回值：若成功，返回0；若出错，返回⾮0。    

fgetpos 将⽂件位置指⽰器的当前值存⼊由pos指向的对象中。在以后调⽤ fsetpos 时，可以使⽤此值将
流重新定位⾄该位置。     

## 5.11 格式化 IO

格式化输出由 5 个 printf 函数来处理的。    

```c
#include <stdio.h>

int printf(const char *restrict format, ...);
int fprintf(FILE *restrict fp, const char *restrict format, ...);
int dprintf(int fd, const char *restrict format, ...);
```    

返回值：若成功，返回输出字符数；若输出出错，返回负值。    

```c
int sprintf(char *restrict buf, const char *restrict format, ...);
```    

返回值：若成功，返回存入数组的字符数；若编码出错，返回负值。    

```c
int snprintf(char *restrict buf, size_t n, const char *restrict format, ...);
```    

返回值：若缓冲区足够大，返回将要存入数组的字符数；若编码出错，返回负值。    

printf 将格式化数据写到标准输出，fprintf 写至指定的流，dprintf 写至指定的文件描述符，sprintf
将格式化的字符送入数组 buf 中。sprintf 在该数组的尾端自动加一个 null 字节，但该字符不包括在
返回值中。    

注意，sprintf 函数可能会造成由buf指向的缓冲区的溢出。调⽤者有责任确保该缓冲区⾜够⼤。因为缓冲
区溢出会造成程序不稳定甚⾄安全隐患，为了解决这种缓冲区溢出问题，引⼊了snprintf函数。在该函数中，
缓冲区长度是⼀个显式参数，超过缓冲区尾端写的所有字符都被丢弃。如果缓冲区⾜够⼤，snprintf函数
就会返回写⼊缓冲区的字符数。与sprintf相同，该返回值不包括结尾的null字节。若snprintf函数返回
⼩于缓冲区长度n的正值，那么没有截断输出。若发⽣了⼀个编码的错误，snprintf返回负值。    

格式说明控制其余参数如何编写，以后又如何显示。每个参数按照转换说明编写，转换说明以百分号开始，除
转换说明外，格式字符串中的其他字符将按原样，不经任何修改被复制输出。一个转换说明说明有 4 个可选择
的部分：    

```
%[flags][fldwidth][precision][lenmodifier]convtype
```    

标志flags:   

- `'`: 将整数按千位分组字符
- `-`: 在字段内左对齐输出
- `+`: 总是显示带符号转换的正负号
- 空格: 如果第一个字符不是正负号，则在其前面加上一个空格
- `#`: 指定另一种转换形式（例如，对于十六进制格式，加 0x 前缀）
- 0: 添加前导 0 进行填充    

fldwidth 说明最⼩字段宽度。转换后参数字符数若⼩于宽度，则多余字符位置⽤空格填充。字段宽度是⼀个
⾮负⼗进制数，或是⼀个星号（*）。    

precision 说明整型转换后最少输出数字位数、浮点数转换后⼩数点后的最少位数、字符串转换后最⼤字节
数。精度是⼀个点（.），其后跟随⼀个可选的⾮负⼗进制数或⼀个星号（*）。    

宽度和精度字段两者皆可为*。此时，⼀个整型参数指定宽度或精度的值。该整型参数正好位于被转换的参数之前。    

与 printf 族相同，scanf 族也使用由 `<stdarg.h>` 说明的可变长度参数表。   

```c
#include <stdarg.h>
#include <stdio.h>

int vscanf(const char *restrict format, va_list arg);
int vfscanf(FILE *restrict fp, const char *restrict format, va_list arg);
int vsscanf(const char *restrict buf, const char *restrict format, va_list arg);
```    

返回值：指定的输⼊项⽬数；若输⼊出错或在任⼀转换前⽂件结束，返回EOF。    

## 5.12 实现细节

在 UNIX 中，标准 IO 库最终都要调用第 3 章中说明的 IO 例程。每个标准 IO 流都有一个与其相关联的
文件描述符，可以对一个流调用 fileno 函数以获得其描述符。    

```c
#include <stdio.h>

int fileno(FILE *fp);
```    

返回值：与该流相关联的文件描述符。    

## 5.13 临时文件

ISO C 标准 I/O 库提供了两个函数以帮助创建临时⽂件：   

```c
#include <stdio.h>

char *tmpnam(char *ptr);
// 返回指向唯一路径名的指针
FILE *tmpfile(void);
// 返回值：若成功，返回文件指针；若出错，返回 NULL
```    

tmpnam 函数产⽣⼀个与现有⽂件名不同的⼀个有效路径名字符串。每次调⽤它时，都产⽣⼀个不同的路径名，
最多调⽤次数是 TMP_MAX。TMP_MAX 定义在 &lt;stdio.h&gt; 中。    

若 ptr 是 NULL，则所产⽣的路径名存放在⼀个静态区中，指向该静态区的指针作为函数值返回。后续调⽤
tmpnam 时，会重写该静态区（这意味着，如果我们调⽤此函数多次，⽽且想保存路径名，则我们应当保存
该路径名的副本，⽽不是指针的副本）。如若ptr不是NULL，则认为它应该是指向长度⾄少是L_tmpnam 个
字符的数组（常量L_tmpnam定义在头⽂件&lt;stdio.h&gt;中）。所产⽣的路径名存放在该数组中，ptr
也作为函数值返回。   

tmpfile 创建⼀个临时⼆进制⽂件（类型wb+），在关闭该⽂件或程序结束时将⾃动删除这种⽂件。注意，
UNIX对⼆进制⽂件不进⾏特殊区分。    

```c
#include "apue.h"

int main(void) {
  char name[L_tmpnam], line[MAXLINE];
  FILE *fp;
  
  printf("%s\n", tmpnam(NULL));

  tmpnam(name);
  printf("%s\n", name);

  if ((fp = tmpfile()) == NULL) {
    err_sys("tmpfile error");
  }

  fputs("one line of output\n", fp);
  rewind(fp);

  if (fgets(line, sizeof(line), fp) == NULL) {
    err_sys("fgets error");
  }
  fputs(line, stdout);
  return 0;
}
```   

SUS 为处理临时文件定义了另外两个函数：mkdtemp, mkstemp，它们是 XSI 的扩展部分：   

```c
#include <stdlib.h>

char *mkdtemp(char *template);
// 返回值：若成功，返回指向目录名的指针；若出错，返回 NULL

int mkstemp(char *template);
// 返回值：若成功，返回文件描述符；若出错，返回 -1
```     

mkdtemp 函数创建了一个目录，该目录有一个唯一的名字；mkstemp 函数创建了一个文件，该文件有一个
唯一的名字。名字是通过 template 字符串进行选择的。这个字符串是后 6 位设置为 XXXXXX 的路径名。
话说这个感觉好像在哪里见过。函数将这些占位符替换成不同的字符来构建一个唯一的路径名。如果成功的话，
这两个函数将修改 template 字符串反映临时文件的名字。    

由 mkdtemp 函数创建的⽬录使⽤下列访问权限位集：S_IRUSR | S_IWUSR | S_IXUSR。注意，调⽤
进程的⽂件模式创建屏蔽字可以进⼀步限制这些权限。如果⽬录创建成功，mkdtemp返回新⽬录的名字。   

mkstemp 函数以唯⼀的名字创建⼀个普通⽂件并且打开该⽂件，该函数返回的⽂件描述符以读写⽅式打开。
由mkstemp创建的⽂件使⽤访问权限位 S_IRUSR | S_IWUSR。     

与 tempfile 不同，mkstemp 创建的临时⽂件并不会⾃动删除。如果希望从⽂件系统命名空间中删除该⽂件，
必须⾃⼰对它解除链接。     

使⽤ tmpnam 和 tempnam ⾄少有⼀个缺点：在返回唯⼀的路径名和⽤该名字创建⽂件之间存在⼀个时间窗口，
在这个时间窗口中，另⼀进程可以⽤相同的名字创建⽂件。因此应该使⽤tmpfile和mkstemp函数，因为它们
不存在这个问题。    

## 5.14 内存流

我们已经看到，标准I/O库把数据缓存在内存中，因此每次⼀字符和每次⼀⾏的I/O更有效。我们也可以通过
调⽤setbuf或setvbuf函数让I/O库使⽤我们⾃⼰的缓冲区。在SUSv4中⽀持了内存流。这就是标准I/O流，
虽然仍使⽤ FILE 指针进⾏访问，但其实并没有底层⽂件。所有的I/O都是通过在缓冲区与主存之间来回传送
字节来完成的。我们将看到，即便这些流看起来像⽂件流，它们的某些特征使其更适⽤于字符串操作。    

有 3 个函数可用于内存流的创建：    

```c
#include <stdio.h>

FILE *fmemopen(void *restrict buf, size_t size, const char *restrict type);
```    

返回值：若成功，返回流指针；若错误，返回 NULL。    

fmemopen 函数允许调用者提供缓冲区用于内存流：buf 参数指向缓冲区的开始位置，size 参数指定了
缓冲区大小的字节数。如果 buf 参数为空，fmemopen 函数分配 size 字节数的缓冲区。   

type 参数控制如何使用流：   

- r, rb: 为读而打开
- w, wb: 为写而打开
- a, ab: 追加，为在第一个 null 字节处写而打开
- r+, r+b, rb+: 为读和写而打开
- w+, w+b, wb+: 把文件截断至 0 长，为读和写而打开
- a+, a+b, ab+: 追加：为在第一个 null 字节处读和写而打开     

⽤于创建内存流的其他两个函数分别是 open_memstream 和 open_wmemstream。    

```c
#include <stdio.h>

FILE *open_memstream(char **bufp, size_t *sizep);

#include <wchar.h>
FILE *open_wmemstream(wchar_t **bufp, size_t *sizep);
```   

返回值：若成功，返回流指针；若出错，返回NULL。    

open_memstream 函数创建的流是⾯向字节的，open_wmemstream 函数创建的流是⾯向宽字节的。这两
个函数与 fmemopen 函数的不同在于：    

- 创建的流只能写打开；
- 不能指定⾃⼰的缓冲区，但可以分别通过bufp和sizep参数访问缓冲区地址和⼤⼩；
- 关闭流后需要⾃⾏释放缓冲区；
- 对流添加字节会增加缓冲区⼤⼩    

但是在缓冲区地址和⼤⼩的使⽤上必须遵循⼀些原则。第⼀，缓冲区地址和长度只有在调⽤fclose或fflush
后才有效；第⼆，这些值只有在下⼀次流写⼊或调⽤fclose前才有效。因为缓冲区可以增长，可能需要重新
分配。如果出现这种情况，我们会发现缓冲区的内存地址值在下⼀次调⽤fclose或fflush时会改变。    

