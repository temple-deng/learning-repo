# 第 1 章 初识 C 语言

<!-- TOC -->

- [第 1 章 初识 C 语言](#第-1-章-初识-c-语言)
  - [1.1 语言标准](#11-语言标准)
    - [1.1.1 第 1 个 ANSI/ISO C 标准](#111-第-1-个-ansiiso-c-标准)
    - [1.1.2 C99 标准](#112-c99-标准)
    - [1.1.3 C11 标准](#113-c11-标准)
  - [1.2 编程机制](#12-编程机制)
    - [1.2.1 目标代码文件、可执行文件和库](#121-目标代码文件可执行文件和库)
    - [1.2.2 GNU 编译器集合和 LLVM 项目](#122-gnu-编译器集合和-llvm-项目)
- [第 2 章 C 语言概述](#第-2-章-c-语言概述)
  - [2.1 简单的 C 程序示例](#21-简单的-c-程序示例)
  - [2.2 示例解释](#22-示例解释)
    - [2.2.1 快速概要](#221-快速概要)
    - [2.2.2 程序细节](#222-程序细节)
  - [2.3 多个函数](#23-多个函数)
  - [2.4 关键字和保留标识符](#24-关键字和保留标识符)
- [第 3 章 数据与 C](#第-3-章-数据与-c)
  - [3.1 示例程序](#31-示例程序)
  - [3.2 数据：数据类型关键字](#32-数据数据类型关键字)
    - [3.2.1 浮点数](#321-浮点数)
  - [3.3 C 语言基本数据类型](#33-c-语言基本数据类型)
    - [3.3.1 int 类型](#331-int-类型)
    - [3.3.2 其他整数类型](#332-其他整数类型)
    - [3.3.3 使用字符：char 类型](#333-使用字符char-类型)
    - [3.3.4 _Bool 类型](#334-_bool-类型)
    - [3.3.5 可移植类型：stdint.h 和 inttypes.h](#335-可移植类型stdinth-和-inttypesh)
    - [3.3.6 float、double和long double](#336-floatdouble和long-double)
    - [3.3.7 复数和虚数类型](#337-复数和虚数类型)
    - [3.3.8 类型大小](#338-类型大小)
  - [3.4 刷新输出](#34-刷新输出)

<!-- /TOC -->

## 1.1 语言标准

C 语⾔发展之初，并没有所谓的 C 标准。《C语⾔程序设计》第1版是公认的 C 标准。这本书并没有定义
标准库。C 语⾔⽐其他语⾔更依赖库，因此需要⼀个标准库。实际上，由于缺乏官⽅标准，UNIX 实现提供的
库已成为了标准库。    

### 1.1.1 第 1 个 ANSI/ISO C 标准

随着 C 的不断发展，越来越⼴泛地应⽤于更多系统中，C 社区意识到需要⼀个更全⾯、更新颖、更严格的
标准。鉴于此，美国国家标准协会（ANSI）于 1983 年组建了⼀个委员会，开发了⼀套新标准，并于1989年
正式公布。该标准（ANSI C）定义了 C 语⾔和 C 标准库。国际标准化组织于1990年采⽤了这套 C 标准（ISO C）。
ISO C 和 ANSI C 是完全相同的标准。ANSI/ISO 标准的最终版本通常叫作C89（因为ANSI于1989年批准
该标准）或C90（因为ISO于1990年批准该标准）。另外，由于 ANSI 先公布C标准，因此业界⼈⼠通常使⽤
ANSI C。   

### 1.1.2 C99 标准

1994年，ANSI/ISO联合委员会开始修订 C 标准，最终发布了C99标准。   

### 1.1.3 C11 标准

维护标准任重道远。标准委员会在2007年承诺 C 标准的下⼀个版本是C1X，2011 年终于发布了 C11 标准。
此次，委员会提出了⼀些新的指导原则。   

## 1.2 编程机制

### 1.2.1 目标代码文件、可执行文件和库

C 编程的基本策略是，用程序把源代码文件转换为可执行文件（其中包含可直接运行的机器语言代码）。
典型的 C 实现通过编译和链接两个步骤来完成这一过程。编译器把源代码转换成中间代码，链接器
把中间代码和其他代码合并，生成可执行文件。C 使用这种分而治之的方法方便对程序进行模块化，
可以独立编译单独的模块，稍后再用链接器合并已编译的模块。通过这种方式，如果只更改某个模
块，不必因此重新编译其他模块。另外，链接器还将你编写的程序和预编译的库代码合并。   

中间文件有多种形式。我们在这里描述的是最普遍的一种形式，即把源代码转换为机器语言代码，
并把结果放在目标代码文件（或简称目标文件）中（这里假设源代码只有一个文件）。虽然目标文件中
包含机器语言代码，但是并不能直接运行该文件。因为目标文件中储存的是编译器翻译的源代码，这
还不是一个完整的程序。目标代码文件缺失启动代码（startup code）。启动代码充当着程序和
操作系统之间的接口。例如，可以在MS Windows或Linux系统下运行IBM PC兼容机。这两种情况所
使用的硬件相同，所以目标代码相同，但是Windows和Linux所需的启动代码不同，因为这些系统处
理程序的方式不同。     

目标代码还缺少库函数。几乎所有的 C 程序都要使用 C 标准库中的函数。例如，concrete.c
中就使用了 `printf()` 函数。目标代码文件并不包含该函数的代码，它只包含了使用 `printf()`
函数的指令。`printf()` 函数真正的代码储存在另一个被称为库的文件中。库文件中有许多函数
的目标代码。    

链接器的作用是，把你编写的目标代码、系统的标准启动代码和库代码这 3 部分合并成一个文件，
即可执行文件。对于库代码，链接器只会把程序中要用到的库函数代码提取出来。   

### 1.2.2 GNU 编译器集合和 LLVM 项目

LLVM 项目成为 cc 的另一个替代品。该项目是与编译器相关的开源软件集合，始于伊利诺伊大学的
2000份研究项目。它的 Clang 编译器处理 C 代码，可以通过 clang 调用。有多种版本供不同的
平台使用，包括Linux。2012年，Clang 成为 FreeBSD 的默认 C 编译器。Clang也对最新的 C
标准支持得很好。    

gcc 和 clang 命令都可以根据不同的版本选择运行时选项来调用不同 C 标准。   

```shell
$gcc -std=c99 inform.c
$gcc -std=c1x inform.c
$gcc -std=c11 inform.c
```   

第 1 行调用 C99 标准，第 2 行调用 GCC 接受 C11 之前的草案标准，第 3 行调用 GCC 接受的
C11 标准版本。Clang 编译器在这一点上用法与 GCC 相同。   

# 第 2 章 C 语言概述

本章介绍以下内容：   

- 运算符： =
- 函数： `main()`, `printf()`
- 什么是关键字

## 2.1 简单的 C 程序示例

```c
// 2-1.first.c
#include <stdio.h>

int main(void) {
  int num;
  num = 1;
  printf("I am a simple ");
  printf("computer.\n");
  printf("My favorite number is %d because it is first.\n", num);
  return 0;
}
```   

## 2.2 示例解释

图 2-1 总结了组成 C 程序的几个部分，图中包含的元素比第 1 个程序多。   

![2-1](https://raw.githubusercontent.com/temple-deng/markdown-images/master/clang/2-1.png)

### 2.2.1 快速概要

```c
#include <stdio.h>             // 包含另一个文件
```   

该行告诉编译器把 stdio.h 中的内容包含在当前程序中。stdio.h 是 C 编译器软件包的标准部分，
它提供键盘输入和屏幕输出的支持。    

```c
int main(void)
```    

int 表明 `main()` 函数返回一个整数，void 表明 `main()` 不带任何参数。只需记住，int 和
void 是标准 ANSI C 定义 `main()` 的一部分。    

### 2.2.2 程序细节

1. **#include 指令和头文件**    

`#include <stdio.h>` 的作用相当于把 stdio.h 文件中的所有内容都输入到该行所在的位置。
实际上，这是一种“拷贝-粘贴”的操作。include 文件提供了一种方便的途径共享许多程序共有的信息。    

这行代码是一条 C 预处理器指令（preprocessor directive）。通常，C 编译器在编译前会对
源代码做一些准备工作，即预处理（preprocessing）。   

所有的 C 编译器软件包都提供 stdio.h 文件。该文件中包含了供编译器使用的输入和输出函数信息。
通常，在C程序顶部的信息集合被称为头文件（header）。   

在大多数情况下，头文件包含了编译器创建最终可执行程序要用到的信息。例如，头文件中可以定义
一些常量，或者指明函数名以及如何使用它们。但是，函数的实际代码在一个预编译代码的库文件
中。简而言之，头文件帮助编译器把你的程序正确地组合在一起。   

ANSI/ISO C 规定了 C 编译器必须提供哪些头文件。有些程序要包含 stdio.h，而有些不用。特定
C 实现的文档中应该包含对C库函数的说明。这些说明确定了使用哪些函数需要包含哪些头文件。   

2. **main 函数**   

int 是 `main()` 函数的返回类型。这表明 `main()` 函数返回的值是整数。返回到哪里？返回给
操作系统。我们将在第6章中再来探讨这个问题。   

通常，函数名后面的圆括号中包含一些传入函数的信息。该例中没有传递任何信息。因此，圆括号内
是单词void，如果浏览旧式的C代码，会发现程序以如下形式开始：`main()`。   

C90 标准勉强接受这种形式，但是 C99 和 C11 标准不允许这样写。因此，即使你使用的编译器允许，
也不要这样写。   

3. **注释**    

`//` 这种单行注释方式是 C99 新增的。    

4. **花括号、函数体和块**    

一般而言，所有的 C 函数都使用花括号标记函数体的开始和结束。这是规定，不能省略。   

5. **声明**   

int 是 C语言的一个关键字（keyword），表示一种基本的C语言数据类型。关键字是语言定义的单词，
不能做其他用途。   

在C语言中，所有变量都必须先声明才能使用。这意味着必须列出程序中用到的所有变量名及其类型。   

以前的C语言，还要求把变量声明在块的顶部，其他语句不能在任何声明的前面。C99 和 C11遵循C++
的惯例，可以把声明放在块中的任何位置。   

可以用小写字母、大写字母、数字和下划线（_）来命名。而且，名称的第 1 个字符必须是字母或
下划线，不能是数字。   

操作系统和 C 库经常使用以一个或两个下划线字符开始的标识符（如，_kcab），因此最好避免在
自己的程序中使用这种名称。   

## 2.3 多个函数

```c
// two_func.c 一个文件中包含两个函数
#include <stdio.h>

void butler(void);   /* ANSI/ISO C 函数原型*/

int main(void) {
  printf("I will summon the butler function.\n");
  butler();
  printf("Yes, Bring me some tea and writable DVDs.\n");
  return 0;
}

void butler(void) {
  printf("You rang, sir?\n");
}
```   

`butler()` 函数在程序中出现了 3 次。第1次是函数原型（prototype），告知编译器在程序中要使用
该函数了；第2次以函数调用的形式出现在 `main()` 中；最后一次出现在函数定义中。   

C90 标准新增了函数原型，旧式的编译器可能无法识别。函数原型是一种声明形式，告知编译器正在使用某
函数，因此函数原型也被称为函数声明（function declaration）。函数原型还指明了函数的属性。例如，
`butler()` 函数原型中的第1个void表明，`butler()` 函数没有返回值。   

那这里的意思是，函数声明和函数定义是不同的。   

C标准建议，要为程序中用到的所有函数提供函数原型。标准include文件(包含文件)为标准库函数提供了
函数原型。例如，在C标准中，stdio.h 文件包含了 `printf()` 的函数原型。   

## 2.4 关键字和保留标识符

许多关键字⽤于指定不同的类型，如 int。还有⼀些关键字（如 if）⽤于控制程序中语句的执⾏顺序。   

标准关键字：   

- auto, register,
- extern, sizeof, static, typedef, restrict,
- short, float, char, struct, int, long, union, double, unsigned, void,
- while, break, case, for, goto, if, continue, switch, default, do, else, return

C90 新增关键字：   

- signed, const, enum, volatile

C99 新增关键字：   

- inline   

C11 新增关键字：   

- _Alignas, _Alignof, _Atomic, _Bool, _Complex, _Generic, _Imaginary, _Noreturn,
_Static_assert, _Thread_local

# 第 3 章 数据与 C

## 3.1 示例程序

```c
#include <stdio.h>

int main(void) {
  float weight;
  float value;

  printf("Are you worth weight in platinum?\n");
  printf("Let's check it out.\n");
  printf("Please enter your weight in pounds: ");
  scanf("%f", &weight);

  value = 1700.0 * weight * 14.5833;
  printf("Your weight in platinum is worth $%.2f.\n", value);
  return 0;
}
```   

&weight 告诉 `scanf()` 把输入的值赋给名为 weight 的变量。   

## 3.2 数据：数据类型关键字

如果数据是常量，则编译器一般通过用户书写的形式来识别类型，但是对变量而言，要在声明时指定其类型。   

基本类型关键字：   

int, long, short, unsigned, char, float, double, signed, void, _Bool, _Complex,
_Imaginary。    

在 C 语言中，用 int 关键字表示基本的整数类型。long, short, unsigned, signed 用于提供基本
整数类型的变式，例如 unsigned short int。char 关键字用于指定字母和其他字符。另外，char 类型
也可以表示较小的整数。float, double 和 long double 表示带小数点的数。_Bool 类型表示布尔值，
_Complex 和 _Imaginary 分别表示复数和虚数。   

通过这些关键字创建的类型，按计算机的储存⽅式可分为两⼤基本类型：整数类型和浮点数类型。    

### 3.2.1 浮点数

在一个值后面加上一个小数点，该值就成为一个浮点数。浮点数和整数的存储方案不同。计算机把浮点数分成
小数部分和指数部分来表示，而且分开存储这两部分。因此，7.00 和 7 在数值上相同，但是它们的存储
方式不同。

## 3.3 C 语言基本数据类型

int 类型是有符号整型，即int类型的值必须是整数，可以是正整数、负整数或零。其取值范围依计算机系统
⽽异。⼀般⽽⾔，储存⼀个int要占⽤⼀个机器字长。ISO C规定int的取值范围最⼩为-32768～32767。   


### 3.3.1 int 类型

在C语⾔中，⽤特定的前缀表⽰使⽤哪种进制。0x或0X前缀表⽰⼗六进制值。与此类似，0前缀表⽰⼋进制。   

要以八进制显示数字，使用 %o，以十六进制显示数字，使用 %x。另外，要显示各进制数的前缀0, 0x 和0X，
必须分别使用 %#o、%#x、%#X。   

### 3.3.2 其他整数类型

C语⾔提供3个附属关键字修饰基本整数类型：short、long 和 unsigned（看不起我 signed）。   

short int 类型（或者简写为 short）占用的存储空间可能比 int 类型少。注意这里用的是可能。   

long int 或 long 占用的存储空间可能比 int 多。   

long long int 或 long long 占用的存储空间可能比 long 多，该类型至少占 64 位。   

unsigned int 或 unsigned 只用于非负值的场合。在C90标准中，添加了 unsigned long int或
unsigned long 和 unsigned short类型。C99标准又添加了unsigned long long int或unsigned
long long。    

为什么说short类型“可能”⽐int类型占⽤的空间少，long类型“可能”⽐int类型占⽤的空间多？因为C语⾔
只规定了short占⽤的存储空间不能多于int，long占⽤的存储空间不能少于int。这样规定是为了适应不同
的机器。    

通常，程序代码中使⽤的数字（如，2345）都被储存为int类型。要把⼀个较⼩的常量作为long类型对待，
可以在值的末尾加上l（⼩写的L）或L后缀。类似地，在⽀持long long类型的系统中，也可以使⽤ll或LL
后缀来表⽰long long类型的值，如3LL。另外，u或U后缀表⽰unsigned long long，如5ull、10LLU、
6LLU或9Ull。    

打印 unsigned int 类型的值，使⽤ %u 转换说明；打印 long 类型的值，使⽤ %ld 转换说明。在 x
和 o 前⾯可以使⽤ l 前缀， %lx 表⽰以⼗六进制格式打印 long 类型整数，%lo 表⽰以⼋进制格式打印
long类型整数。对于 short 类型，可以使⽤h前缀。h和l前缀都可以和u⼀起使⽤。    

### 3.3.3 使用字符：char 类型

char 类型用于存储字符，但是从技术层面来看，char 是整数类型。因为 char 类型实际上储存的是整数
而不是字符。计算机使用数字编码来处理字符，即用特定的整数表示特定的字符。    

标准 ASCII 码的范围是0-127，只需7位二进制数即可表示。通常，char 类型被定义为 8 位的存储单元，
因此容纳标准 ASCII 码绰绰有余。许多系统提供扩展 ASCII 码，也在 8 位的表示范围之内。   

C语⾔把1字节定义为char类型占⽤的位（bit）数，因此⽆论是16位还是32位系统，都可以使⽤char类型。
说实话，这句没看懂。   

```c
char grade = 'A';
```   

在C中，用单引号括起来的单个字符被称为字符常量。注意这里必须是单引号，双引号是字符串。   

```c
char grade = 65;
```   

奇怪的是，C语⾔将字符常量视为int类型⽽⾮char类型。注意这里是字符常量，即 'A', 'B' 什么的，
char 类型的变量还是自己的类型。   

特殊字符也需要被转义，把转义序列赋给字符变量时，必须⽤单引号把转义序列括起来。    

有两个特殊的转义序列，\\0oo, \\xhh，如果要用八进制 ASCII 码表示一个字符，可以在编码值前面加一个
反斜杠并用单引号扩起来 `beep = '\007'`。   

如果要使⽤ASCII码，为何要写成'\\032'⽽不是032？⾸先，'\\032'能更清晰地表达程序员使⽤字符编码
的意图。其次，类似\\032这样的转义序列可以嵌⼊C的字符串中，如`printf("Hello!\007\n");`中就
嵌⼊了\\007。   

根据C90标准，C语⾔允许在关键字char前⾯使⽤signed或unsigned。这样，⽆论编译器默认char是什么
类型，signed char表⽰有符号类型，⽽unsigned char表⽰⽆符号类型。   

### 3.3.4 _Bool 类型

因为C语⾔⽤值1表⽰true，值0表⽰false，所以_Bool类型实际上也是⼀种整数类型。但原则上它仅占⽤
1位存储空间。    

### 3.3.5 可移植类型：stdint.h 和 inttypes.h

C 语⾔提供了许多有⽤的整数类型。但是，某些类型名在不同系统中的功能不⼀样。C99 新增了两个头⽂件
stdint.h 和 inttypes.h，以确保C语⾔的类型在各系统中的功能相同。   

C语⾔为现有类型创建了更多类型名。这些新的类型名定义在 stdint.h 头⽂件中。例如，int32_t 表⽰
32位的有符号整数类型。在使⽤32位int的系统中，头⽂件会把 int32_t 作为 int 的别名。不同的系统
也可以定义相同的类型名。例如，int为16位、long为32位的系统会把int32_t作为
long的别名。然后，使⽤int32_t类型编写程序，并包含stdint.h头⽂件时，编译器会把int或long替换
成与当前系统匹配的类型。   

剩下的略。   

### 3.3.6 float、double和long double

C标准规定，float 类型必须⾄少能表⽰ 6 位有效数字，且取值范围⾄少是10<sup>-37</sup>～10<sup>+37</sup>。
前⼀项规定指 float 类型必须⾄少精确表⽰⼩数点后的 6 位有效数字，如33.333333。    

double 类型和 float 类型的最⼩取值范围相同，但⾄少必须能表⽰ 10 位有效数字。⼀般情况下，double
占⽤ 64 位⽽不是 32 位。⼀些系统将多出的 32 位全部⽤来表⽰⾮指数部分，这不仅增加了有效数字的
位数（即提⾼了精度），⽽且还减少了舍⼊误差。    

C只保证long double类型⾄少与double类型的精度相同。    

默认情况下，编译器假定浮点型常量是 double 类型的精度。例如，假设 some 是 float 类型的变量：    

```c
float some = 4.0 * 2.0;
```   

通常，4.0 和 2.0 被储存为 64 位的 double 类型，使⽤双精度进⾏乘法运算，然后将乘积截断成
float 类型的宽度。这样做虽然计算精度更⾼，但是会减慢程序的运⾏速度。   

在浮点数后⾯加上f或F后缀可覆盖默认设置，编译器会将浮点型常量看作 float 类型，如2.3f 和9.11E9F。   

C99 标准添加了⼀种新的浮点型常量格式——⽤⼗六进制表⽰浮点型常量，即在⼗六进制数前加上⼗六进制前缀
（0x或0X），⽤p和P分别代替e和E，⽤2的幂代替10的幂（即p计数法）。如下所⽰：   

```
0xa.1fp10
```   

`printf()` 函数使⽤ %f 转换说明打印⼗进制记数法的float和double类型浮点数，⽤ %e 打印指数
记数法的浮点数。如果系统⽀持⼗六进制格式的浮点数，可⽤a和A分别代替e和E。打印long double类型要
使⽤ %Lf、%Le 或 %La 转换说明。    

### 3.3.7 复数和虚数类型

C语言有 3 种复数类型：float _Complex, double _Complex, long double _Complex。例如，
float _Complex 类型的变量应包含两个 float 类型的值，分别表示复数的实部和虚部。类似地，C语言的
3 种虚数类型是 float _Imaginary, double _Imaginary 和 long doubl e_Imaginary。   

如果包含 complex.h 头文件，便可用 complex 代表 _Complex，用 imaginary 代替 _Imaginary，
还可以用 I 代替 -1 的平方根。   

### 3.3.8 类型大小

```c
#include <stdio.h>

int main(void) {
  printf("Type int has a size of %zd bytes.\n", sizeof(int));
  printf("Type char has a size of %zd bytes.\n", sizeof(char));
  printf("Type long has a size of %zd bytes.\n", sizeof(long));
  printf("Type long long has a size of %zd bytes\n", sizeof(long long));
  printf("Type long double has a size of %zd bytes.\n", sizeof(long double));
  return 0;
}
```   

`sizeof` 是C语⾔的内置运算符，以字节为单位给出指定类型的⼤⼩。C99和C11提供 %zd 转换说明匹配
`sizeof` 的返回类型。⼀些不⽀持C99和C11的编译器可⽤ %u 或 %lu 代替 %zd。   

## 3.4 刷新输出

`printf()` 何时把输出发送到屏幕上？最初，`printf()` 语句把输出发送到⼀个叫作缓冲区（buffer）
的中间存储区域，然后缓冲区中的内容再不断被发送到屏幕上。C 标准明确规定了何时把缓冲区中的内容发送到屏
幕：当缓冲区满、遇到换⾏字符或需要输⼊的时候。    

