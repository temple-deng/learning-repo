# 第 4 章 字符串和格式化输入/输出

## 4.1 前导程序

```c
#include <stdio.h>
#include <string.h>    // 提供 strlen() 函数的原型

#define DENSITY 62.4

int main(void) {
  float weight, volume;
  int size, letters;
  char name[40];    // name 是一个可容纳 40 个字符的数组
  printf("Hi!What's your first name?\n");
  scanf("%s", name);
  printf("%s, what's your weight in pounds?\n", name);
  scanf("%f", &weight);
  size = sizeof name;
  letters = strlen(name);
  volume = weight / DENSITY;
  printf("Well, %s, your volume is %2.2f cubic feet.\n", name, volume);
  printf("Also, your first name has %d letters,\n", letters);
  printf("and we have %d bytes to store it\n", size);
  return 0;
}
```    

## 4.2 字符串简介

双引号用来告知编译器它括起来的是字符串，单引号用来告知是个字符。   

### 4.2.1 char 类型数组和 null 字符

C语⾔没有专门⽤于储存字符串的变量类型，字符串都被储存在 char 类型的数组中。    

注意数组末尾的字符 \0。这是空字符 null，C语言用它标记字符串的结束。空字符不是数字0，它是非打印
字符，其 ASCII 码值是（或等价于）0。C中的字符串一定以空字符结束，这意味着数组的容量必须至少比
待存储字符串中的字符数多 1。    

### 4.2.2 使用字符串

```c
#include <stdio.h>

#define PRAISE "You are an extraordinary being"

int main(void) {
  char name[40];
  printf("What's your name?\n");
  scanf("%s", name);
  printf("Hello, %s.%s\n", name, PRAISE);
  return 0;
}
```    

%s 告诉 `printf()` 打印一个字符串。   

我们不用把空字符主动放入字符串末尾，`scanf()` 在读取输入时就已完成这项工作。也不用在字符串常量
PRAISE 末尾添加空字符。编译器会在末尾加上空字符。   

注意，`scanf()` 在遇到第 1 个空白（空格、制表符或换行符）时就不再读取输入。⼀般⽽⾔，根据 %s
转换说明，`scanf()` 只会读取字符串中的⼀个单词，⽽不是⼀整句。   

字符串常量 "x" 和字符常量 'x' 不同。区别之一在于 'x' 是基本类型 char，而 "x" 是派生类型 char
数组；区别之二是 "x" 实际上由两个字符组成：'x' 和空字符\n。    

### 4.2.3 strlen() 函数

上面的 sizeof 运算符，以字节为单位给出对象的大小。`strlen()` 函数给出字符串中的字符长度。  

```c
#include <stdio.h>
#include <string.h>

#define PRAISE "You are an extraordinary being."

int main(void) {
  char name[40];
  printf("What's your name?\n");
  scanf("%s", name);
  printf("Hello, %s.%s\n", name, PRAISE);
  printf("Your name of %zd letters occupies %zd memory cells.\n", strlen(name), sizeof name);
  printf("The phrase of praise has %zd letters", strlen(PRAISE));
  printf("and occupies %zd memory cells.\n", sizeof PRAISE);
  return 0;
}
```   

输出：   

```
What's your name?
dengbo
Hello, dengbo.You are an extraordinary being.
Your name of 6 letters occupies 40 memory cells.
The phrase of praise has 31 lettersand occupies 32 memory cells.
```    

对于 sizeof 的括号问题，如果运算对象是类型时，圆括号必不可少，但是对于特定量，可有可无。尽管如此，
还是建议所有情况下都使⽤圆括号。    

## 4.3 常量和 C 预处理器

C 预处理器除了可以使用 #include 包含其他文件的信息，还可以用来定义常量。   

```c
#define TAXRATE 0.015
```   

编译程序时，程序中所有的 TAXRATE 都会被替换成 0.015。这一过程被称为编译时替换。   

⼤写常量只是为了提⾼程序的可读性，即使全⽤⼩写来表⽰符号常量，程序也能照常运⾏。另外，还有⼀个不
常⽤的命名约定，即在名称前带 c_ 或 k_ 前缀来表⽰常量（如，c_level或k_line）。   

\#define指令还可定义字符和字符串常量。前者使⽤单引号，后者使⽤双引号。   

### 4.3.1 const 限定符

C90 新增了 const 关键字，用于限定一个变量为只读。   

```c
const int MONTHS = 12;
```    

这里仔细想一下上面的常量和这里 const 修饰后变量的区别。首先上面那种预定义的，叫符号常量，其实本质
上就是把一个字面常量起了一个名字，从而增加了语义，而且在编译预处理的时候就会把这些符号常量替换
为真正的字面常量。    

而这里其实是将一个变量声明为只读的。   

### 4.3.2 明示常量

C头⽂件 limits.h 和 float.h 分别提供了与整数类型和浮点类型⼤⼩限制相关的详细信息。每个头⽂件
都定义了⼀系列供实现使⽤的明⽰常量。下面列出了一部分：   

- CHAR_BIT: char类型的位数
- CHAR_MAX: char类型的最大值
- CHAR_MIN
- SCHAR_MAX: signed char 类型的最大值
- SCHAR_MIN: signed char 类型的最小值
- UCHAR_MAX: unsigned char 类型的最大值
- SHRT_MAX: short 类型的最大值
- SHRT_MIN
- USHRT_MAX: unsigned short 类型的最大值
- INT_MAX
- INT_MIN
- UINT_MAX
- LONG_MAX
- LONG_MIN
- ULONG_MAX
- LLONG_MAX
- LLONG_MIN
- ULLONG_MAX

类似地，float.h 头⽂件中也定义⼀些明⽰常量，如FLT_DIG和DBL_DIG，分别表⽰float类型和double
类型的有效数字位数。   

## 4.4 printf() 和 scanf()

### 4.4.1 printf() 函数

请求 `printf()` 函数打印数据的指令要与待打印数据的类型相匹配。例如，打印整数时使⽤%d，打印字符
时使⽤%c。这些符号被称为转换说明（conversion specification），它们指定了如何把数据转换成可
显⽰的形式。     

- %a: 浮点数、十六进制数和 p 计数法
- %A: 同上
- %c: 单个字符
- %d: 有符号十进制整数
- %e: 浮点数，e计数法
- %E: 同上
- %f: 浮点数，十进制计数法
- %g: 根据值的不同，自动选择 %f 或者 %e
- %G: 同上，%E
- %i: 有符号十进制整数（与 %d 相同）
- %o: 无符号八进制整数
- %p: 指针
- %s: 字符串
- %u: 无符号十进制整数
- %x
- %X
- %%: 打印一个百分号

### 4.4.2 printf() 的转换说明修饰符

在 % 和转换字符之间插入修饰符可修饰基本的转换说明，下面是合法的修饰符写法：   

- 标记：在后面会描述 5 种标记（-、+、空格、#和0），可以不使用标记或使用多个标记 "%-10d"
- 数字：最小字段宽度 "%4d"
- .数字：精度
  + 对于 %e, %E, %f 表示小数点后的位数
  + 对于 %g 和 %G，表示有效数字最大位数
  + 对于 %s，表示待打印字符的最大数量
  + 对于整型转换，表示待打印数字的最小位数
- h: 和整型转换说明一起用，表示 short int 或 unsigned short int 类型的值 %hu, %hx
- hh: 和整型转换说明一起用，表示 signed char 或 unsigned char 类型的值
- j: 和整型转换说明一起用，表示 intmax_t 或 uintmax_t 类型的值
- l: 和整型转换说明一起用，表示 long int 或 unsigned long int 类型的值
- ll: 和整型转换说明一起用，表示 long long int 或 unsigned long long int 类型的值
- L: 和浮点转换说明一起使用，使用 long double 类型的值
- t: 和整型转换说明一起用，表示 ptrdiff_t 类型的值，ptrdiff_t 是两个指针差值的类型
- z: 和整型转换说明一起用，表示 size_t 类型的值，size_t 是 sizeof 返回的类型    

标记：   

- -: 待打印项左对齐，从字段的左侧开始打印该项
- +: 有符号值若为正，则在值前面显示加号；若为负，则在值前面显示减号
- 空格: 有符号值若为正，则在值前面显示前导空格，若为负，则在值前面显示减号
- \#: 把结果转换为另一种形式，如果是 %o 格式，则以 0 开始，如果是 %x 或 %X，则以 0x 或 0X开始
- 0: 对于数值格式，用前导 0 代替空格填充字段宽度   

```c
#include <stdio.h>
#define PAGES 959

int main(void) {
  printf("*%d*\n", PAGES);
  printf("*%2d*\n", PAGES);
  printf("*%10d*\n", PAGES);
  printf("*%-10d*\n", PAGES);
  return 0;
}
```   

输出：   

```
*959*
*959*
*       959*
*959       *
```   

浮点型：   

```c
#include <stdio.h>

int main(void) {
  const double RENT = 3852.99;
  printf("*%f*\n", RENT);
  printf("*%e*\n", RENT);
  printf("*%4.2f*\n", RENT);
  printf("*%3.1f*\n", RENT);
  printf("*%10.3f*\n", RENT);
  printf("*%10.3E*\n", RENT);
  printf("*%+4.2f*\n", RENT);
  printf("*%010.2f*\n", RENT);
  return 0;
}
```

输出：   

```
*3852.990000*
*3.852990e+03*
*3852.99*
*3853.0*
*  3852.990*
* 3.853E+03*
*+3852.99*
*0003852.99*
```   

### 4.4.3 转换说明的意义

给字符串断行有 3 种方法：   

- 使用多个 printf() 语句
- 用 \\ 来进行断行
- ANSI C 引入的字符串连接。在两个用双引号括起来的字符串之间用空白隔开，C编译器会把多个字符串看做
是一个字符串    

### 4.4.4 使用 scanf()

scanf() 把输入的字符串转换成整数、浮点数、字符或字符串。   

如果用 scanf() 读取基本变量类型的值，在变量名前加上一个 &。如果用 scanf() 把字符串读入字符
数组中，不要使用 &。