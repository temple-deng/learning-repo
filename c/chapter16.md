# 第 16 章 C 预处理器和 C 库

<!-- TOC -->

- [第 16 章 C 预处理器和 C 库](#第-16-章-c-预处理器和-c-库)
  - [16.1 翻译程序的第一步](#161-翻译程序的第一步)
  - [16.2 明示常量：#define](#162-明示常量define)
    - [16.2.1 记号](#1621-记号)
    - [16.2.2 重定义常量](#1622-重定义常量)
  - [16.3 在#define中使用参数](#163-在define中使用参数)
    - [16.3.1 用宏参数创建字符串：#运算符](#1631-用宏参数创建字符串运算符)
    - [16.3.2 预处理器黏合剂：##运算符](#1632-预处理器黏合剂运算符)
    - [16.3.3 变参宏：...和 __VA_ARGS__](#1633-变参宏和-__va_args__)
  - [16.5 文件包含：#include](#165-文件包含include)
  - [16.6 其他指令](#166-其他指令)
    - [16.6.1 条件编译](#1661-条件编译)
    - [16.6.2 预定义宏](#1662-预定义宏)
    - [16.6.3 #line 和 #error](#1663-line-和-error)
    - [16.6.4 #pragma](#1664-pragma)
    - [16.6.7 泛型编程（C11）](#1667-泛型编程c11)
  - [16.7 内联函数(C99)](#167-内联函数c99)
  - [16.7 `_Noreturn` 函数（C11）](#167-_noreturn-函数c11)
  - [16.11 通用工具库](#1611-通用工具库)
    - [16.11.1 exit() 和 atexit()](#16111-exit-和-atexit)
    - [16.11.2 qsort() 函数](#16112-qsort-函数)
  - [16.12 断言库](#1612-断言库)
  - [16.13 string.h 中的 memcpy() 和 memmove()](#1613-stringh-中的-memcpy-和-memmove)
  - [16.14 可变参数：stdarg.h](#1614-可变参数stdargh)

<!-- /TOC -->

C预处理器在程序执⾏之前查看程序（故称之为预处理器）。根据程序中的预处理器指令，预处理器把符号缩写
替换成其表⽰的内容。预处理器可以包含程序所需的其他⽂件，可以选择让编译器查看哪些代码。预处理器并
不知道 C。基本上它的⼯作是把⼀些⽂本转换成另外⼀些⽂本。     

## 16.1 翻译程序的第一步

在预处理之前，编译器必须对该程序进⾏⼀些翻译处理。⾸先，编译器把源代码中出现的字符映射到源字符集。   

第⼆，编译器定位每个反斜杠后⾯跟着换⾏符的实例，并删除它们。    

第三，编译器把⽂本划分成预处理记号序列、空⽩序列和注释序列（记号是由空格、 制表符或换⾏符分隔的项）
这⾥要注意的是，编译器将⽤⼀个空格字符替换每⼀条注释。     

⽽且，实现可以⽤⼀个空格替换所有的空⽩字符序列（不包括换⾏符）。最后，程序已经准备好进⼊预处理
阶段，预处理器查找⼀⾏中以#号开始的预处理指令。    

## 16.2 明示常量：#define

指令可以出现在源⽂件的任何地⽅，其定义从指令出现的地⽅到该⽂件末尾有效。我们⼤量使⽤
`#define` 指令来定义明⽰常量（manifest constant）（也叫做符号常量），但是该指令还有许多其他⽤途。    

预处理器指令从#开始运⾏，到后⾯的第1个换⾏符为⽌。也就是说，指令的长度仅限于⼀⾏。    

```c
#include <stdio.h>
#define TWO 2  /* 可以使用注释 */
#define OW "Consistency is the last refuge of the unimagina\
time. -Oscar Wlide"
#define FOUR TWO*TWO
#define PX printf("X is %d.\n", x)
#define FMT "X is %d.\n"

int main(void) {
  int x = TWO;
  PX;
  x = FOUR;
  printf(FMT, x);
  printf("%s\n", OW);
  printf("TWO: OW\n");
  return 0;
}
```     

每⾏ `#define`（逻辑⾏）都由3部分组成。第1部分是 `#define` 指令本⾝。第2部分是选定的缩写，
也称为宏。有些宏代表值，这些宏被称为类对象宏。C 语言还有类函数宏。宏的名称中不允许有空格，而且
必须遵循变量的命名规则。第3部分称为替换列表或替换体。一旦预处理器在程序中找到宏的⽰实例后，就会
⽤替换体代替该宏。从宏变成最终替换⽂本的过程称为宏展开。唯⼀例外的是双引号中的宏。    

```c
printf("TWO: OW");
```   

打印的是TWO: OW。   

### 16.2.1 记号

从技术⾓度来看，可以把宏的替换体看作是记号（token）型字符串，⽽不是字符型字符串。C预处理器记号
是宏定义的替换体中单独的“词”。⽤空⽩把这些词分开。   

```c
#define FOUR 2*2
```     

该宏定义有一个记号：2*2序列。    

```c
#define SIX 2 * 3
```   

有 3 个记号。   

在实际应⽤中，⼀些C编译器把宏替换体视为字符串⽽不是记号。    

### 16.2.2 重定义常量

假设先把LIMIT定义为20，稍后在该⽂件中又把它定义为25。这个过程称为重定义常量。不同的实现采⽤
不同的重定义⽅案。除⾮新定义与旧定义相同，否则有些实现会将其视为错误。另外⼀些实现允许重定义，但
会给出警告。ANSI标准采⽤第1种⽅案，只有新定义和旧定义完全相同才允许重定义。    

具有相同的定义意味着替换体中的记号必须相同，且顺序也相同。   

```c
#define SIX 2 * 3
#define SIX 2*3
```   

这两条定义不同。如果需要重定义宏，使用 `#undef` 指令。   

## 16.3 在#define中使用参数

在#define中使⽤参数可以创建外形和作⽤与函数类似的类函数宏。类函数宏定义的圆括号中可以有⼀个或
多个参数，随后这些参数出现在替换体中。    

```c
#define SQUARE(X) X*X
z = SQUARE(2);
```    

这看上去像函数调⽤，但是它的⾏为和函数调⽤完全不同。    

```c
#include <stdio.h>
#define SQUARE(X) X*X
#define PR(X) printf("The result is %d.\n", X)

int main(void) {
  int x = 5;
  int z;
  printf("x = %d\n", x);      // 5

  z = SQUARE(x);    // x*x
  printf("Evaluating SQUARE(x):");
  PR(z);            // 25
  z = SQUARE(2);    // 2*2
  printf("Evaluating SQUARE(2):");
  PR(z);            // 4

  printf("Evaluating SQUARE(x+2):");
  PR(SQUARE(x + 2));    // x+2*x+2   17

  printf("Evaluating 100/SQUARE(2):");
  PR(100 / SQUARE(2));  // 100 / 2 * 2    100
  
  printf("x is %d\n", x);    // 5
  printf("Evaluating SQUARE(++x):");
  //PR(SQUARE(++x));   // ++x*++x 这个编译器运行不了
  printf("After incrementing, x is %x.\n", x);
  return 0;
}
```    

只替换。   

### 16.3.1 用宏参数创建字符串：#运算符

C允许在字符串中包含宏参数。在类函数宏的替换体中，#号作为⼀个预处理运算符，可以把记号转换成字符串。
例如，如果x是⼀个宏形参，那么#x就是转换为字符串"x"的形参名。这个过程称为字符串化（stringizing）。    

```c
#include <stdio.h>
#define PSQR(x) printf("The square of " #x " is %d.\n", ((x)*(x)));

int main(void) {
  int y = 5;
  PSQR(y);
  PSQR(2 + 4);
  return 0;
}

/**
 * The square of #x is 25.
   The square of #x is 36.
 * 
 */
```    

### 16.3.2 预处理器黏合剂：##运算符

与 `#` 运算符类似，`##` 运算符可⽤于类函数宏的替换部分。⽽且，`##`还可⽤于对象宏的替换部分。
`##` 运算符把两个记号组合成⼀个记号。例如，可以这样做：   

```c
#define XNAME(n) x ## n
```    

然后，宏XNAME(4)将展开为x4。   

### 16.3.3 变参宏：...和 __VA_ARGS__

⼀些函数（如 `printf()`）接受数量可变的参数。stdvar.h 头⽂件提供了⼯具，让⽤户⾃定义带可变
参数的函数。C99/C11也对宏提供了这样的⼯具。     

通过把宏参数列表中最后的参数写成省略号（即，3个点...）来实现这⼀功能。这样，预定义宏`__VA_ARGS__`
可⽤在替换部分中，表明省略号代表什么。    

```c
#define PR(...) printf(__VA_ARGS__);
PR("Howdy");
PR("weight = %d, shipping = $%.2f\n", wt, sp);
```    

对于第1次调用，`__VA_ARGS__` 展开为 1 个参数："Howdy"。   

对于第2次调用，`__VA_ARGS__` 展开为 3 个参数：`"weight = %d, shipping = $%.2f\n"、wt、 sp`。   

## 16.5 文件包含：#include

当预处理器发现 `#include` 指令时，会查看后⾯的⽂件名并把⽂件的内容包含到当前⽂件中，这相当于把
被包含⽂件的全部内容输⼊到源⽂件 `#include` 指令所在的位置。`#include`指令有两种形式：   

```c
#include <stdio.h>
#include "mystuff.h"
```     

在 UNIX 系统中，尖括号告诉预处理器在标准系统⽬录中查找该⽂件。双引号告诉预处理器⾸先在当前⽬录
中（或⽂件名中指定的其他⽬录）查找该⽂件，如果未找到再查找标准系统⽬录。   

## 16.6 其他指令

`#undef` 指令⽤于“取消”已定义的 `#define`指令。也就是说，假设有如下定义：   

```c
#define LIMIT 400
```    

然后，下面的指令：   

```c
#undef LIMIT
```    

将移除上⾯的定义。现在就可以把LIMIT重新定义为⼀个新值。即使原来没有定义LIMIT，取消LIMIT的定义
仍然有效。    

### 16.6.1 条件编译

可以使⽤其他指令创建条件编译（conditinal compilation）。也就是说，可以使⽤这些指令告诉编译器
根据编译时的条件执⾏或忽略信息（或代码）块。     

`#ifdef`   

```c
#ifdef MAVIS
#include "horse.h"
#define STABLES 5
#else
#include "cow.h"
#endif
```   

`#ifndef`    

```c
#ifndef SIZE
#define SIZE 100
#endif
```    

`#if` 和 `#elif`，#if后⾯跟整型常量表达式，如果表达式为⾮零，则表达式为真。      

### 16.6.2 预定义宏

- `__DATE__`: 预处理的日期 `Mmm dd yyyy` 形式的字符串字面量
- `__FILE__`: 表示当前源代码文件名的字符串字面量
- `__LINE__`: 表示当前源代码文件中行号的整型常量
- `__STDC__`: 设置为 1 时，表明实现遵循 C 标准
- `__STDC_HOSTED__`: 本机环境设置为 1，否则设置为 0
- `__STDC_VERSION__`: 支持 C99 标准，设置为 199901L，支持 C11 标准，设置为 201112L
- `__TIME__`: 翻译代码的时间，格式为 `hh:mm:ss`    

### 16.6.3 #line 和 #error

`#line` 指令重置 `__LINE__` 和 `__FILE__` 宏报告的行号和文件名：    

```c
#line 1000
#line 10 "cool.c"
```     

`#error` 指令让预处理器发出一条错误消息，该消息包含指令中的文本。如果可能的话，编译过程应该中断。   

```c
#if __STDC_VERSION__ != 201112L
#error NOT C11
#endif
```    
### 16.6.4 #pragma

略。    

### 16.6.7 泛型编程（C11）    

C11新增了⼀种表达式，叫作泛型选择表达式（generic selection expression），可根据表达式的
类型（即表达式的类型是 int、double 还是其他类型）选择⼀个值。泛型选择表达式不是预处理器指令，
但是在⼀些泛型编程中它常⽤作#define宏定义的⼀部分。    

```c
_Generic(x, int: 0, float: 1, double: 2, default: 3)
```    

`_Generic` 是 C11 的关键字，第1个项是表达式，后面的每个项都由一个类型、一个冒号和一个值组成。
第1个项的类型匹配哪个标签，整个表达式的值是该标签后面的值。泛型选择语句与switch 语句类似，只是
前者⽤表达式的类型匹配标签，⽽后者⽤表达式的值匹配标签。   

## 16.7 内联函数(C99)

创建内联函数的定义有多种⽅法。标准规定具有内部链接的函数可以成为内联函数，还规定了内联函数的定义
与调⽤该函数的代码必须在同⼀个⽂件中。因此，最简单的⽅法是使⽤函数说明符 `inline` 和存储类别
说明符static。通常，内联函数应定义在⾸次使⽤它的⽂件中，所以内联函数也相当于函数原型。    

```c
#include <stdio.h>
inline static void eatline()    // 内链函数定义/原型
{
  while (getchar() != '\n')
    continue;
}

int main() {
  ...
  eatline();
  ...
}
```    

编
译器查看内联函数的定义（也是原型），可能会⽤函数体中的代码替换 eatline()函数调⽤。   

## 16.7 `_Noreturn` 函数（C11）

C99新增 `inline` 关键字时，它是唯⼀的函数说明符（关键字 `extern` 和 `static` 是存储类别
说明符，可应⽤于数据对象和函数）。C11新增了第2个函数说明符 `_Noreturn`，表明调⽤完成后函数不
返回主调函数。`exit()` 函数是 `_Noreturn` 函数的⼀个⽰例，⼀旦调⽤ `exit()`，它不会再返回
主调函数。    

`_Noreturn` 的⽬的是告诉⽤户和编译器，这个特殊的函数不会把控制返回主调程序。    


## 16.11 通用工具库

### 16.11.1 exit() 和 atexit()

```c
#include <stdio.h>
#include <stdlib.h>

void sign_off(void);
void too_bad(void);

int main(void) {
  int n;
  atexit(sign_off);   // 注册 sign_off 函数
  puts("Enter an integer:");
  if (scanf("%d", &n) != 1) {
    puts("That's no integer!");
    atexit(too_bad);
    exit(EXIT_FAILURE);
  }

  printf("%d is %s.\n", n, (n % 2 == 0) ? "even" : "odd");
  return 0;
}

void sign_off(void) {
  puts("Thus terminates another magnificent program from");
  puts("SeeSaw Software!");
}
void too_bad(void) {
puts("SeeSaw Software extends its heartfelt condolences");
puts("to you upon the failure of your program.");
}
```   

`atexit()` 函数使用函数指针，要使⽤ `atexit()` 函数，只需把退出时要调⽤的函数地址传递给
`atexit()` 即可。函数名作为函数参数时相当于该函数的地址，所以该程序中把sign_off或too_bad
作为参数。然后，`atexit()` 注册函数列表中的函数，当调⽤ `exit()` 时就会执⾏这些函数。ANSI保证，
在这个列表中⾄少可以放 32 个函数。最后调⽤ `exit()` 函数时，`exit()` 会执⾏这些函数（执⾏顺序
与列表中的函数顺序相反，即最后添加的函数最先执⾏）。   

注意，输⼊失败时，会调⽤sign_off()和too_bad()函数；但是输⼊成功时只会调⽤sign_off()。     

`atexit()` 注册的函数（如sign_off()和too_bad()）应该不带任何参数且返回类型为void。    

exit()执⾏完atexit()指定的函数后，会完成⼀些清理⼯作：刷新所有输出流、关闭所有打开的流和关闭
由标准I/O函数tmpfile()创建的临时⽂件。然后exit()把控制权返回主机环境，如果可能的话，向主机环境
报告终⽌状态。通常，UNIX程序使⽤0表⽰成功终⽌，⽤⾮零值表⽰终⽌失败。    

### 16.11.2 qsort() 函数

```c
void qsort(void *base, size_t nmemb, size_t size, int (*compar)(const void *, const void *));
```     

第1个参数是指针，指向待排序数组的⾸元素。ANSI C允许把指向任何数据类型的指针强制转换成指向void
的指针，因此，qsort()的第1个实际参数可以引⽤任何类型的数组。    

第2个参数是待排序项的数量。   

函数原型⽤第 3 个参数显式指明待排序数组中每个元素的⼤⼩。例如，如果排序 double类型的数组，那么
第3个参数应该是sizeof(double)。    

最后，qsort()还需要⼀个指向函数的指针，这个被指针指向的⽐较函数⽤于确定排序的顺序。该函数应接受
两个参数：分别指向待⽐较两项的指针。如果第1项的值⼤于第2项，⽐较函数则返回正数；如果两项相同，
则返回0；如果第1项的值⼩于第2项，则返回负数。qsort()根据给定的其他信息计算出两个指针的值，然后
把它们传递给⽐较函数。   

## 16.12 断言库

assert.h 头⽂件⽀持的断⾔库是⼀个⽤于辅助调试程序的⼩型库。它由 assert()宏组成，接受⼀个整型
表达式作为参数。如果表达式求值为假（⾮零），assert()宏就在标准错误流（stderr）中写⼊⼀条错误
信息，并调⽤abort()函数终⽌程序（abort()函数的原型在stdlib.h头⽂件中）。   

```c
#include <stdio.h>
#include <math.h>
#include <assert.h>

int main() {
  double x, y, z;
  puts("Enter a pair of numbers (0 0 to quit): ");
  while (scanf("%lf%lf", &x, &y) == 2 && (x != 0 || y != 0)) {
    z = x * x - y * y;
    assert(z >= 0);
    printf("answer is %f\n", sqrt(z));
    puts("Next pair of numbers:");
  }

  puts("Done");
  return 0;
}
```    

还有⼀种⽆需更改代码就能开启或关闭 assert()的机制。如果认为已经排除了程序的 bug，就可以把下⾯
的宏定义写在包含assert.h的位置前⾯:    

```c
#define NDEBUG
```    

并重新编译程序，这样编译器就会禁⽤⽂件中的所有 assert()语句。   

## 16.13 string.h 中的 memcpy() 和 memmove()

不能把⼀个数组赋给另⼀个数组，所以要通过循环把数组中的每个元素赋给另⼀个数组相应的元素。有⼀个
例外的情况是：使⽤ `strcpy()` 和 `strncpy()` 函数来处理字符数组。`memcpy()` 和 `memmove()`
函数提供类似的⽅法处理任意类型的数组。    

```c
void *memcpy(void * restrict s1, const void * restrict, size_t n);
void *memmove(void *s1, const void * s2, size_t n);
```     

这两个函数都从 s2 指向的位置拷贝 n 字节到 s1 指向的位置，⽽且都返回 s1 的值。所不同的是，
memcpy()的参数带关键字restrict，即memcpy()假设两个内存区域之间没有重叠；⽽memmove()不作
这样的假设，所以拷贝过程类似于先把所有字节拷贝到⼀个临时缓冲区，然后再拷贝到最终⽬的地。如果使⽤
memcpy()时，两区域出现重叠会怎样？其⾏为是未定义的，这意味着该函数可能正常⼯作，也可能失败。     

## 16.14 可变参数：stdarg.h

可变参数必须按如下步骤进⾏：   

1. 提供⼀个使⽤省略号的函数原型
2. 在函数定义中创建⼀个va_list类型的变量
3. ⽤宏把该变量初始化为⼀个参数列表
4. ⽤宏访问参数列表
5. ⽤宏完成清理⼯作

这种函数的原型应该有⼀个形参列表，其中⾄少有⼀个形参和⼀个省略号：   

```c
void f1(int n, ...)   // 有效
int f2(const char *s, int k, ...) // 有效
char f3(char c1, ..., char c2);  // 无效，省略号不在最后
double f3(...)  // 无效，没有形参
```    

最右边的形参（即省略号的前⼀个形参）起着特殊的作⽤，标准中⽤parmN这个术语来描述该形参。在上⾯的
例⼦中，第1⾏f1()中parmN为n，第2⾏f2()中parmN为k。传递给该形参的实际参数是省略号部分代表的
参数数量。例如，可以这样使⽤前⾯声明的f1()函数：  

```c
f1(2, 200, 400); // 2个额外的参数
f1(4, 13, 117, 18, 23); // 4个额外的参数
```    

接下来，声明在stdarg.h中的va_list类型代表⼀种⽤于储存形参对应的形参列表中省略号部分的数据对象。
变参函数的定义起始部分类似下⾯这样：   

```c
double sum(int lim,...)
{
va_list ap;
```    

然后，该函数将使⽤定义在stdarg.h中的 `va_start()` 宏，把参数列表拷贝到va_list类型的变量中。
该宏有两个参数：va_list类型的变量和parmN形参。接着上⾯的例⼦讨论，va_list类型的变量是ap，
parmN形参是lim。所以，应这样调⽤它：   

```c
va_start(ap, lim); // 把ap初始化为参数列表
```    

下⼀步是访问参数列表的内容，这涉及使⽤另⼀个宏 `va_arg()`。该宏接受两个参数：⼀个`va_list`
类型的变量和⼀个类型名。第1次调⽤ `va_arg()` 时，它返回参数列表的第1项；第2次调⽤时返回第2项，
以此类推。表⽰类型的参数指定了返回值的类型。     

注意，传⼊的参数类型必须与宏参数的类型相匹配。    

最后，要使⽤ `va_end()` 宏完成清理⼯作。例如，释放动态分配⽤于储存参数的内存。该宏接受⼀个
va_list类型的变量：   

```c
va_end(ap);
```   

调⽤va_end(ap)后，只有⽤va_start重新初始化ap后，才能使⽤变量ap。  