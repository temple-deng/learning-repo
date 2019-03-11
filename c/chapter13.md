# 第 13 章 文件输入/输出

## 13.1 与文件进行通信

### 13.1.1 文本模式和二进制模式

C提供两种文件模式：文件模式和二进制模式。   

首先，要区分文本内容和二进制内容、文本文件格式和二进制文件格式，以及文件的文本模式和二进制模式。   

所有文件的内容都以二进制形式（0或1）储存。但是，如果文件最初使用二进制编码的字符（例如，ASCII或
Unicode）表示文本（就像C字符串那样），该文件就是文本文件，其中包含文本内容。如果文件中的二进制值
代表机器语言代码或数值数据（使用相同的内部表示，假设，用于long或double类型的值）或图片或音乐编
码，该文件就是二进制文件，其中包含二进制内容。    

UNIX 用同一种文件格式处理文本文件和二进制文件的内容。    

为了规范文本文件的处理，C提供两种访问文件的途径：二进制模式和文本模式。在二进制模式中，程序可以
访问文件的每个字节。而在文本模式中，程序所见的内容和文件的实际内容不同。程序以文本模式读取文件时，
把本地环境表示的行末尾或文件结尾映射为C模式。例如，C程序在旧式Macintosh中以文本模式读取文件时，
把文件中的\r转换成\n；以文本模式写入文件时，把\n转换成\r。或者，C文本模式程序在MS-DOS平台读取
文件时，把\r\n转换成\n；写入文件时，把\n转换成\r\n。   

除了以文本模式读写文本文件，还能以二进制模式读写文本文件。如果读写一个旧式MS-DOS文本文件，程序
会看到文件中的\r 和 \n 字符，不会发生映射。如果要编写旧式 Mac格式、MS-DOS格式或UNIX/Linux
格式的文件模式程序，应该使用二进制模式，这样程序才能确定实际的文件内容并执行相应的动作。   

虽然C提供了二进制模式和文本模式，但是这两种模式的实现可以相同。前面提到过，因为UNIX使用一种文件
格式，这两种模式对于UNIX实现而言完全相同。Linux也是如此。    

### 13.1.2 IO的级别

除了选择文件的模式，大多数情况下，还可以选择 IO 的两个级别（即处理文件访问的两个级别）。底层IO
使用操作系统提供的基本 IO 服务。标准高级 IO 使用 C 库的标准包和 stdio.h 头文件定义。因为无法
保证所有的操作系统都使用相同的底层 IO 模型，C标准只支持标准 IO 包。有些实现会提供底层库，但是C
标准建立了可移植的IO模型。    

### 13.1.3 标准文件

C程序会自动打开3个文件，它们被称为标准输入（standard input）、标准输出（standard output）和
标准错误输出（standard error output）。在默认情况下，标准输入是系统的普通输入设备，通常为
键盘；标准输出和标准错误输出是系统的普通输出设备，通常为显示屏。    

## 13.2 标准 IO

```c
#include <stdio.h>
#include <stdlib.h>

int main(int argc, char * argv[]) {
  int ch;
  FILE *fp;  // "文件指针"
  unsigned long count = 0;

  if (argc != 2) {
    printf("Usage: %s filename\n", argv[0]);
    exit(EXIT_FAILURE);
  }

  if ((fp = fopen(argv[1], "r")) == NULL) {
    printf("Can't open %s\n", argv[1]);
    exit(EXIT_FAILURE);
  }

  while ((ch = getc(fp)) != EOF) {
    putc(ch, stdout);
    count++;
  }

  fclose(fp);
  printf("File %s has %lu characters\n", argv[1], count);
  return 0;
}
```   

### 13.2.1 检查命令行参数

exit() 函数关闭所有打开的文件并结束程序。exit() 的参数被传递给一些操作系统。通常的惯例是：
正常结束的程序传递0，异常结束的程序传递非零值。    

并不是所有的操作系统都能识别相同范围内的返回值。因此，C标准规定了一个最小的限制范围。尤其是，标准
要求0或宏EXIT_SUCCESS用于表明成功结束程序，宏EXIT_FAILURE用于表明结束程序失败。这些宏和exit()
原型都位于stdlib.h头文件中。    

## 13.5 随机访问：fseek() 和 ftell()

```c
#include <stdio.h>
#include <stdlib.h>
#define CNTL_Z '\032'
#define SLEN 81

int main(void) {
  char file[SLEN];
  char ch;
  FILE *fp;

  long count, last;
  puts("Enter the name of the file to be processed:");
  scanf("%80s", file);

  if ((fp = fopen(file, "rb")) == NULL) {
    printf("reverse can't open %s\n", file);
    exit(EXIT_FAILURE);
  }

  fseek(fp, 0L, SEEK_END);

  last = ftell(fp);

  for (count = 1L; count <= last; count++) {
    fseek(fp, -count, SEEK_END);
    ch = getc(fp);
    if (ch != CNTL_Z && ch != '\r') {
      putchar(ch);
    }
  }

  putchar('\n');
  fclose(fp);
  return 0;
}
```   

该程序使用二进制模式，以便处理MS-DOS文本和UNIX文件。   

### 13.5.1 fseek() 和 ftell() 的工作原理

fseek() 的第2个参数是偏移量。该参数表示从起始点开始要移动的距离。该参数必须是一个 long 类型的
值，可以为正（前移）、负（后移）或0（保持不动）。   

fseek() 的第3个参数是模式，该参数确定起始点。根据 ANSI 标准，在 stdio.h 头文件规定了几个表示
模式的明示常量：    

- SEEK_SET: 文件开始处
- SEEK_CUR: 当前位置
- SEEK_END: 文件末尾    

如果一切正常，fseek() 的返回值为0；如果出现错误，返回 -1。    

ftell() 函数的返回类型是 long，它返回的是当前的位置。    

### 13.5.2 二进制模式和文本模式

我们设计的程序在UNIX和MS-DOS环境下都可以运行。UNIX只有一种文件格式，所以不需要进行特殊的转换。
然而MS-DOS要格外注意。许多MS-DOS编辑器都用Ctrl+Z标记文本文件的结尾。以文本模式打开这样的文件
时，C 能识别这个作为文件结尾标记的字符。但是，以二进制模式打开相同的文件时，Ctrl+Z字符被看作
是文件中的一个字符，而实际的文件结尾符在该字符的后面。文件结尾符可能紧跟在Ctrl+Z字符后面，或者
文件中可能用空字符填充，使该文件的大小是256的倍数。在DOS环境下不会打印空字符。     

### 13.5.3 fgetpos() 和 fsetpos() 函数

fseek() 和 ftell() 潜在的问题是，它们都把文件大小限制在 long 类型能表示的范围内。鉴于此，
ANCI 新增了两个处理较大文件的新定位函数：fgetpos() 和 fsetpos()。这两个函数不使用 long
类型的值表示位置，它们使用一种新类型：fpos_t（代表 file position type）。fpos_t 不是基本
类型，它根据其他类型来定义。    

```c
int fgetpos(FILE * restrict stream, fpos_t * restrict pos);
```    

调用该函数时，它把 fpos_t 类型的值放在 pos 指向的位置上，该值描述了文件中的一个位置。如果成功，
fgetpos() 函数返回0；如果失败，返回非0。    

```c
int fsetpos(FILE *stream, const fpos_t *pos);
```   

调用该函数时，使用pos指向位置上的fpos_t类型值来设置文件指针指向该值指定的位置。如果成功，
fsetpos()函数返回0；如果失败，则返回非0。fpos_t类型的值应通过之前调用fgetpos()获得。    

## 13.6 标准 IO 的机理

通常，使用标准 IO 的第1步是调用 fopen() 打开文件。fopen() 函数不仅打开一个文件，还创建了一个
缓冲区（在读写模式下会创建两个缓冲区）以及一个包含文件和缓冲区数据的结构。另外，fopen()返回一个
指向该结构的指针，以便其他函数知道如何找到该结构。假设把该指针赋给一个指针变量fp，我们说 fopen()
函数“打开一个流”。    

这个结构通常包含一个指定流中当前位置的文件位置指示器。除此之外，它还包含错误和文件结尾指示器、一个
指向缓冲区开始处的指针、一个文件标识符和一个计数。    

我们主要考虑文件输入。通常，使用标准 IO 的第2步是调用一个定义在 stdio.h 中的输入函数。