# 第 8 章 字符输入/输出和输入验证

<!-- TOC -->

- [第 8 章 字符输入/输出和输入验证](#第-8-章-字符输入输出和输入验证)
  - [8.1 单字符IO：getchar() 和 putchar()](#81-单字符iogetchar-和-putchar)
  - [8.2 缓冲区](#82-缓冲区)
  - [8.3 结束键盘输入](#83-结束键盘输入)
    - [8.3.1 文件、流和键盘输入](#831-文件流和键盘输入)
    - [8.3.2 文件结尾](#832-文件结尾)
  - [8.4 重定向和文件](#84-重定向和文件)
    - [8.4.1 UNIX、Linux 和 DOS 重定向](#841-unixlinux-和-dos-重定向)
- [第 9 章 函数](#第-9-章-函数)
  - [9.1 复习函数](#91-复习函数)
    - [9.1.1 创建并使用简单函数](#911-创建并使用简单函数)
    - [9.1.2 分析程序](#912-分析程序)
    - [9.1.3 定义带形式参数的函数](#913-定义带形式参数的函数)
    - [9.1.4 函数类型](#914-函数类型)
  - [9.2 编译多源代码文件的程序](#92-编译多源代码文件的程序)
    - [9.2.1 UNIX 和 Linux](#921-unix-和-linux)
    - [9.2.2 使用头文件](#922-使用头文件)
  - [9.3 查找地址：&运算符](#93-查找地址运算符)
  - [9.4 指针简介](#94-指针简介)
    - [9.4.1 间接运算符：*](#941-间接运算符)
    - [9.7.2 声明指针](#972-声明指针)
    - [9.7.3 使用指针在函数间通信](#973-使用指针在函数间通信)

<!-- /TOC -->

## 8.1 单字符IO：getchar() 和 putchar()

getchar() 和 putchar() 都不是真正的函数，它们被定义为供预处理器使用的宏。   

```c
#include <stdio.h>

int main(void) {
  char ch;
  while ((ch = getchar()) != '#') {
    putchar(ch);
  }
  return 0;
}
```   

运行该程序后，与用户的交互如下：   

```
Hello, there. I would[enter]
Hello, there. I would
like a #3 bag of potatoes.[enter]
like a %
```    

## 8.2 缓冲区

如果在⽼式系统运⾏程序清单8.1，你输⼊⽂本时可能显⽰如下:   

```
HHeelllloo,, tthheerree..II wwoouulldd[enter]
lliikkee aa #
```   

以上⾏为是个例外。像这样回显⽤户输⼊的字符后⽴即重复打印该字符是属于⽆缓冲（或直接）输⼊，即正在
等待的程序可⽴即使⽤输⼊的字符。对于该例，⼤部分系统在⽤户按下Enter键之前不会重复打印刚输⼊的字
符，这种输⼊形式属于缓冲输⼊。⽤户输⼊的字符被收集并储存在⼀个被称为缓冲区（buffer）的临时存储区，
按下Enter键后，程序才可使⽤⽤户输⼊的字符。    

为什么要有缓冲区？首先，把若干字符作为一个块进行传输比逐个发送这些字符节约时间。其次，如果用户
打错字符，可以直接通过键盘修正错误。当最后按下 Enter 键时，传输的是正确的输入。   

虽然缓冲输⼊好处很多，但是某些交互式程序也需要⽆缓冲输⼊。例如，在游戏中，你希望按下⼀个键就执⾏
相应的指令。因此，缓冲输⼊和⽆缓冲输⼊都有⽤武之地。    

缓冲分为两类：完全缓冲IO和行缓冲IO。完全缓冲输入指的是当缓冲区被填满时才刷新缓冲区（内容被发送
至目的地），通常出现在文件输入中。缓冲区的大小取决于系统，常见的大小是 512 字节和 4096 字节。
行缓冲 IO 指的是在出现换行符时刷新缓冲区。键盘输入通常是行缓冲输入，所以在按下 Enter 键后才刷新
缓冲区。    

本书假设所有的输⼊都是缓冲输⼊。    

## 8.3 结束键盘输入

在之前的程序中，遇到 # 字符就会结束，那如果我们希望打印一个 # 字符就会有问题。   

### 8.3.1 文件、流和键盘输入

C 有很多用于打开、读取、写入和关闭文件的库函数。从较低层面上，C可以使用主机操作系统的基本文件工具
直接处理文件，这些直接调用操作系统的函数被称为底层 IO。由于计算机系统各不相同，所以不可能为普通的
底层 IO 函数创建标准库，ANSI C 也不打算这样做。然而从较高层面上，C还可以通过标准 IO 包来处理
文件。在这⼀层⾯上，具体的C实现负责处理不同系统的差异，以便⽤户使⽤统⼀的界⾯。也就是说标准 C
库提供上层的调用接口，以及对下层的调用接口的定义，但是具体下层调用的实现的由各个系统的 C 实现
决定。       

从概念上看，C程序处理的是流而不是直接处理文件。流是一个实际输入或输出映射的理想化数据流。这意味
着不同属性和不同种类的输入，由属性更统一的流来表示。于是，打开文件的过程就是 **把流与文件相关联**，
而且读写都通过流来完成。    

C 把输入和输出设备视为存储设备上的普通文件，尤其是把键盘和显示设备视为每个 C 程序自动打开的文件。
stdin 流表示键盘输入，stdout 流表示屏幕输出。getchar(), putchar(), printf() 和 scanf()
函数都是标准 IO 包的成员，处理这两个流。    

以上讨论的内容说明，可以⽤处理⽂件的⽅式来处理键盘输⼊。例如，程序读⽂件时要能检测⽂件的末尾才
知道应在何处停⽌。因此，C的输⼊函数内置了⽂件结尾检测器。既然可以把键盘输⼊视为⽂件，那么也应该
能使⽤⽂件结尾检测器结束键盘输⼊。下⾯我们从⽂件开始，学习如何结束⽂件。    

### 8.3.2 文件结尾

计算机操作系统要以某种方式判断文件的开始和结束。检测文件结尾的一种方法是，在文件末尾放一个特殊的
字符标记文件结尾。CP/M、IBM-DOS 和 MS-DOS 都的文本文件都曾经使用过这种方法。如今，这些操作系统
可以使用内嵌的 Ctrl + Z 字符来标记文件结尾。这曾经是操作系统使用的唯一标记，不过现在有一些其他
的选择，例如记录文件的大小。所以现代的文本文件不一定有嵌入的 Ctrl+Z，但是如果有，该操作系统会将其
视为一个文件结尾标记。    

```
散文原文：

Ishphat the robot
slid open the hatch
and shouted his challenge.
```   

文件中的散文：   

```c
Ishphat the robot\n slid open the hatch\n and shouted his challenge.\n^Z
```    

操作系统使⽤的另⼀种⽅法是储存⽂件⼤⼩的信息。如果⽂件有3000字节，程序在读到3000字节时便达到
⽂件的末尾。 MS-DOS 及其相关系统使⽤这种⽅法处理⼆进制⽂件，因为⽤这种⽅法可以在⽂件中储存所有
的字符，包括Ctrl+Z。新版的DOS也使⽤这种⽅法处理⽂本⽂件。UNIX使⽤这种⽅法处理所有的⽂件。    

无论操作系统实际使用何种方法检测文件结尾，在 C 语言中，用 getchar() 读取文件检测到文件结尾时
将返回一个特殊的值，即 EOF。scanf 函数检测到文件结尾时也返回 EOF。通常，EOF 定义在 stdio.h
文件中。   

```c
#define EOF(-1)
```    

为什么是-1？因为 `getchar()` 函数的返回值通常都介于 0~127、这些值对应标准字符集。但是，如果
系统能识别扩展字符集，该函数的返回值可能在0~255之间。无论哪种情况，-1 都不对应任何字符，所以，
该值可用于标记文件结尾。  

```c
int ch;
while ((ch = getchar()) != EOF)
  putchar(ch);
```    

如果系统上的 char 是无符号类型的，则我们需要把 ch 的类型声明为 int 类型。   

由于 getchar() 函数的返回类型是int，如果把getchar()的返回值赋给char类型的变量，⼀些编译器
会警告可能丢失数据。    

使用该程序进行键盘输入，要设法输入 EOF 字符。不能只输入字符 EOF，也不能只输入 -1。正确的方法是，
必须找出当前系统的要求。例如，在大多数 UNIX 和 Linux 系统中，在一行开始处按下 Ctrl+D 会传输
文件结尾信号。许多微型计算机系统都把⼀⾏开始处的Ctrl+Z识别为⽂件结尾信号，⼀些系统把任意位置的
Ctrl+Z解释成⽂件结尾信号。    

## 8.4 重定向和文件

在默认情况下，C程序使用标准IO包查找标准输入作为输入源。   

程序可以使用两种方式使用文件。第 1 种方法是，显示使用特定的函数打开文件、关闭文件、读取文件、
写入文件，诸如此类。第 2 种方法是，设计能与键盘和屏幕互动的程序，通过不同的渠道重定向输入至文件
和从文件输出。换言之，把 stdin 流重新赋给文件。继续使用 getchar() 函数从输入流中获取数据。   

### 8.4.1 UNIX、Linux 和 DOS 重定向

UNIX、Linux 和 Windows 命令行提示都能重定向输入、输出。   


# 第 9 章 函数

## 9.1 复习函数

### 9.1.1 创建并使用简单函数

```c
#include <stdio.h>

#define NAME "GIGATHINK, INC."
#define ADDRESS "101 Megabuck Plaza"
#define PLACE "Megapolis, CA 94904"
#define WIDTH 40

void starbar(void);

int main(void) {
  starbar();

  printf("%s\n", NAME);
  printf("%s\n", ADDRESS);
  printf("%s\n", PLACE);
  starbar();
  return 0;
}

void starbar(void) {
  int count;
  for (count = 1; count <= WIDTH; count++) {
    putchar('*');
  }
  putchar('\n');
}
```    

### 9.1.2 分析程序

程序在 3 处使⽤了 starbar 标识符：函数原型（function prototype）告诉编译器函数 starbar()
的类型；函数调⽤（function call）表明在此处执⾏函数；函数定义（function definition）明确地
指定了函数要做什么。  

函数和变量⼀样，有多种类型。任何程序在使⽤函数之前都要声明该函数的类型。因此，在main()函数定义
的前⾯出现了下⾯的ANSI C风格的函数原型：    

```c
void starbar(void);
```    

圆括号表明 starbar 是⼀个函数名。第1个void是函数类型，void类型表明函数没有返回值。第2个void
（在圆括号中）表明该函数不带参数。    

一般而言，函数原型指明了函数的返回值类型和函数接受的参数类型。这些信息称为该函数的签名。对于
starbar() 函数而言，其签名是该函数没有返回值，没有参数。   

### 9.1.3 定义带形式参数的函数

函数定义从下面的 ANSI C 风格的函数头开始：   

```c
void show_n_char(char ch, int num);
```    

该⾏告知编译器 show_n_char() 使⽤两个参数 ch 和 num，ch是 char 类型，num 是 int 类型。
这两个变量被称为形式参数（formal argument，但是最近的标准推荐使⽤formal parameter），简称
形参。和定义在函数中变量⼀样，形式参数也是局部变量，属该函数私有。    

### 9.1.4 函数类型

当函数接受参数时，函数原型用逗号分隔的列表指明参数的数量和类型。根据个人喜好，你也可以省略变量名：    

```c
void show_n_char(char, int);
```   

声明函数时必须声明函数的类型。带返回值的函数类型应该与其返回值类型相同，⽽没有返回值的函数应声明
为void类型。     

类型声明是函数定义的⼀部分。要记住，函数类型指的是返回值的类型，不是函数参数的类型。    

ANSI C 标准库中，函数被分成多个系列，每一系列都有各自的头文件。这些头文件中除了包含其他内容，还
包含了本系列所有函数的声明。   

## 9.2 编译多源代码文件的程序

### 9.2.1 UNIX 和 Linux

假设 file1.c 和 file2.c 是两个内含 C 函数的文件，下面的命令将编译两个文件并生成一个名为 a.out
的可执行文件：    

```
$ gcc file1.c file2.c
```   

另外，还生成两个名为 file1.o 和 file2.o 的目标文件。如果后来改动了 file1.c，而 file2.c 不
变，可以使用以下命令编译第 1 个文件，并与第 2 个文件的目标代码合并：   

```
$ gcc file1.c file2.o
```    

剩下的系统先略了。   

### 9.2.2 使用头文件

如果把 main() 放在第 1 个文件中，把函数定义放在第 2 个文件中，那么第 1 个文件仍然要使用函数
原型。把函数原型放在头文件中，就不用在每次使用函数文件时都写出函数的原型。C 标准库就是这样做的，
例如，把 IO 函数原型放在 stdio.h 中，把数学函数原型放在 math.h 中。    

另外，程序中经常用 C 预处理器定义符号常量。这种定义只储存了那些包含 #define 指令的文件。如果
把程序的一个函数放进一个独立的文件中，你也可以使用 #define 指令访问每个文件。最直接的方法是在
每个文件中再次输入指令，但是这个方法既耗时又容易出错。另外，还会有维护的问题：如果修改了 #define
定义的值，就必须在每个文件中修改。更好的做法是，把 #define 指令放进头文件，然后在每个源文件中使用
\#include 指令包含该文件即可。    

在 UNIX 和 DOS 环境中，\#include "hotels.h" 指令中的双引号表明被包含的文件位于当前目录中。   

```c
// usehotel.c
#include <stdio.h>
#include "9-11.hotel.h"

int main(void) {
  int nights;
  double hotel_rate;
  int code;

  while ((code = menu()) != QUIT) {
    switch (code) {
      case 1:
        hotel_rate = HOTEL1;
        break;
      case 2:
        hotel_rate = HOTEL2;
        break;
      case 3:
        hotel_rate = HOTEL3;
        break;
      case 4:
        hotel_rate = HOTEL4;
        break;
      default:
        hotel_rate = 0.0;
        printf("Oops!\n");
        break;
    }

    nights = getnights();
    showprice(hotel_rate, nights);
  }

  printf("Thank you and goodbye.\n");
  return 0;
}
```    

```c
// hotel.c
#include <stdio.h>
#include "9-11.hotel.h"

int menu(void) {
  int code, status;

  printf("\n%s%s\n", STARS, STARS);
  printf("Enter the number of the desired hotel:\n");
  printf("1) Fairfield Arms   2) Hotel Olympics\n");
  printf("3) Chertworthy Plaza   4) The Stockton\n");
  printf("5) quit\n");
  printf("%s%s\n", STARS, STARS);

  while ((status = scanf("%d", &code)) != 1 || (code < 1 || code > 5)) {
    if (status != 1) {
      scanf("%*s");
    }
    printf("Enter an integer from 1 to 5, please.\n");
  }

  return code;
}

int getnights(void) {
  int nights;
  printf("How many nights are needed?  ");
  while (scanf("%d", &nights) != 1) {
    scanf("%*s");
    printf("Please enter an integer, such as 2.\n");
  }
  return nights;
}

void showprice(double rate, int nights) {
  int n;
  double total = 0.0;
  double factor = 1.0;

  for (n = 1; n <= nights; n++, factor *= DISCOUNT) {
    total += rate * factor;
  }
  printf("The total cost will be $%0.2f.\n", total);
}
```    

```c
// hotel.h
#define QUIT      5
#define HOTEL1    180.00
#define HOTEL2    225.00
#define HOTEL3    255.00
#define HOTEL4    355.00
#define DISCOUNT  0.95
#define STARS "****************************"

int menu(void);

int getnights(void);

void showprice(double rate, int nights);
```    

貌似编译的时候就指定两个 c 文件即可。    

## 9.3 查找地址：&运算符

一元 & 运算符给出变量的存储地址。如果 pooh 是变量名，那么 &pooh 是变量的地址。   

假设 pooh 的存储地址是 0B76。那么这样的语句 `printf("%d %p\n", pooh, &pooh)` 将输出如下
内容 `24 0b76`。    

## 9.4 指针简介

从根本上看，指针是一个值为内存地址的变量（或数据对象）。正如 char 类型变量的值是字符，int 类型
变量的值是整数，指针变量的值时地址。   

假设一个指针变量名是 ptr，可以编写如下语句：   

```c
ptr = &pooh;
```    

对于这条语句，我们说 ptr 指向 pooh。ptr 和 &pooh 的区别是 ptr 是变量，而 &pooh 是常量。   

要创建指针变量，先要声明指针变量的类型。    

### 9.4.1 间接运算符：*

假设已知 ptr 指向 bah，如下所示：   

```c
ptr = &bah;
```    

然后使用间接运算符 \* 找出储存在 bah 中的值，该运算符有时也称解引用运算符。    

```c
val = *ptr;
```    

### 9.7.2 声明指针

```c
int * pi
char * pc;
float * pf, *pg;
```    

类型说明符表明了指针所指向对象的类型，星号表明声明的变量是一个指针。    

\* 和指针名之间的空格可有可无。通常，程序员在声明时使用空格，在解引用变量时省略空格。    

通常一个指针的值在系统内部由一个无符号整数来表示。    

### 9.7.3 使用指针在函数间通信

```c
#include <stdio.h>

void interchange(int * u, int * v);

int main(void) {
  int x = 5, y = 10;

  printf("Originally x = %d and y = %d.\n", x, y);

  interchange(&x, &y);

  printf("Now x = %d and y = %d.\n", x, y);
  return 0;
}

void interchange(int * u, int * v) {
  int temp = *u;
  *u = *v;
  *v = temp;
}
```    
