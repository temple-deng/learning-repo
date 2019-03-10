# 第 11 章 字符串和字符串函数

<!-- TOC -->

- [第 11 章 字符串和字符串函数](#第-11-章-字符串和字符串函数)
  - [11.1 表示字符串和字符串 IO](#111-表示字符串和字符串-io)
    - [11.1.1 在程序中定义字符串](#1111-在程序中定义字符串)
  - [11.2 字符串输入](#112-字符串输入)
    - [11.2.1 分配空间](#1121-分配空间)
    - [11.2.2 gets](#1122-gets)
    - [11.2.3 gets()的替代品](#1123-gets的替代品)
    - [11.2.4 scanf() 函数](#1124-scanf-函数)
  - [11.3 字符串输出](#113-字符串输出)
    - [11.3.1 puts 函数](#1131-puts-函数)
    - [11.3.2 fputs 函数](#1132-fputs-函数)
    - [11.3.3 printf 函数](#1133-printf-函数)
  - [11.4 字符串函数](#114-字符串函数)
    - [11.4.1 strlen() 函数](#1141-strlen-函数)
    - [11.4.2 strcat() 函数](#1142-strcat-函数)
    - [11.4.3 strncat() 函数](#1143-strncat-函数)
    - [11.4.4 strcmp() 函数](#1144-strcmp-函数)
    - [11.4.5 strcpy() 和 strcncpy() 函数](#1145-strcpy-和-strcncpy-函数)
    - [11.4.6 sprintf() 函数](#1146-sprintf-函数)
  - [11.5 命令行参数](#115-命令行参数)
  - [11.6 把字符串转换为数字](#116-把字符串转换为数字)

<!-- /TOC -->

## 11.1 表示字符串和字符串 IO

```c
#include <stdio.h>

#define MSG "I am a symbolic string constant"
#define MAXLENGTH 81

int main(void) {
  char words[MAXLENGTH] = "I am a string in an array.";
  const char * pt1 = "Something is pointing at me.";
  puts("Here are some strings:");
  puts(MSG);
  puts(words);
  puts(pt1);
  words[8] = 'p';
  puts(words);
  return 0;
}
```    

puts() 函数只显示字符串，而且自动在显示的字符串末尾加上换行符。   

### 11.1.1 在程序中定义字符串

1. **字符串字面量（字符串常量）**    

用双引号括起来的内容称为字符串字面（string literal），也叫作字符串常量（string constant）。
双引号中的字符和编译器自动加入末尾的\0字符，都作为字符串储存在内存中。    

从 ANSI C 标准起，如果字符串字面量之间没有间隔，或者用空白字符分隔，C 会将其视为串联起来的字符串
字面量。    

字符串常量属于 **静态存储类别**（static storage class），这说明如果在函数中使用字符串常量，
该字符串只会被储存一次，即使函数被调用多次。用双引号括起来的内容被视为指向该字符串储存位置的指针。
这类似于把数组名作为指向该数组位置的指针。    

```c
#include <stdio.h>

int main(void) {
  printf("%s, %p, %c\n", "We", "are", *"space farers");
  return 0;
}
```    

输出： `We, 0x4005e4, s`    

2. **字符串数组和初始化**    

定义字符串数组时，必须让编译器知道需要多少空间。一种方法是用足够空间的数组储存字符串。    

在指定数组大小时，要确保数组的元素个数至少比字符串长度多1。所有未被使用的元素都被自动初始化为0
（这里的0指的是char形式的空字符串，而不是数字字符0）    

还可以使用指针表示法创建字符串：   

```c
const char * pt1 = "Something is pointing at me.";
```    

该声明和下面的声明几乎相同：   

```c
const char ar1[] = "Something is pointing at me.";
```    

在这两种情况下，带双引号的字符串本身决定了预留给字符串的存储空间。尽管如此，这两种形式并不完全相同。    

3. **数组和指针**     

数组形式指针形式有何不同？以上面的声明为例，数组形式`ar1[]`在计算机的内存中分配一个内含29个元素
的数组（每个元素对应一个字符，还加上一个末尾的空字符\0），每个元素被初始化为字符串字面量对应的
字符。通常，字符串都作为可执行文件的一部分储存在数据段中。当把程序载入内存时，也载入了程序中的
字符串。字符串储存在静态存储区（static memory）中。但是，程序在开始运行时才会为该数组分配内存。
此时，才将字符串拷贝到数组中。注意，此时字符串有两个副本。一个是在静态内存中的字符串字面量，另一
个是储存在 ar1 数组中的字符串。    

此后，编译器便把数组名ar1识别为该数组首元素地址`&ar1[0]`的别名。这里关键要理解，在数组形式中，
ar1是地址常量。不能更改ar1，如果改变了ar1，则意味着改变了数组的存储位置（即地址）。可以进行类似
ar1+1这样的操作，标识数组的下一个元素。但是不允许进行++ar1这样的操作。递增运算符只能用于变量名
前（或概括地说，只能用于可修改的左值），不能用于常量。     

指针形式也使得编译器为字符串在静态存储区预留29个元素的空间。另外，一旦开始执行程序，它会为指针
变量pt1留出一个储存位置，并把字符串的地址储存在指针变量中。该变量最初指向该字符串的首字符，但是
它的值可以改变。    

总之，初始化数组把静态存储区的字符串拷贝到数组中，而初始化指针只把字符串的地址拷贝给指针。    

## 11.2 字符串输入

如果想把一个字符串读入程序，首先必须预留储存该字符串的空间，然后用输入函数获取该字符串。    

### 11.2.1 分配空间

假设编写了如下代码：   

```c
char *name;
scanf("%s", name);
```    

虽然可能会通过编译，但是在读入 name 时，name 可能会擦写掉程序中的数据或代码，从而导致程序异常
中止。因为 scanf() 要把信息拷贝至参数指定的地址上，而此时该参数是个未初始化的指针，name 可能
指向任何地方。    

为字符串分配内存后，便可读入字符串。C 库提供了许多读取字符串的函数：scanf()、gets()和fgets()。     

### 11.2.2 gets

在读取字符串时，scanf() 和转换说明 %s 只能读取一个单词。可是程序经常要读取一整行。许多年前，
gets() 函数就用于处理这种情况。gets() 读取整行输入，直至遇到换行符，然后丢弃换行符，储存其余
字符，并在这些字符的末尾添加一个空字符使其成为一个字符串。    

```c
#include <stdio.h>

#define STLEN 81

int main(void) {
  char words[STLEN];
  puts("Enter a string, please");
  gets(words);
  printf("Your string twice:\n");
  printf("%s\n", words);
  puts(words);
  puts("Done.");
  return 0;
}
```   

gets() 唯一的参数是 words，它无法检查数组是否装得下输入行。如果输入的字符串过长，会导致缓冲区
溢出。     

### 11.2.3 gets()的替代品

过去通常用 fgets() 来代替 gets()。C11 标准新增的 gets_s() 函数也可代替gets()。    

1. **fgets()**    

fgets() 函数通过第 2 个参数限制读入的字符数来解决溢出的问题。该函数专门设计用于处理文件输入。
fgets() 和 gets() 的区别如下。    

fget() 函数的第 2 个参数指明了读入字符的最大数量。如果该参数的值是 n，那么 fgets() 将读入
n-1 个字符，或者读到遇到第一个换行符为止。    

如果 fgets() 读到一个换行符，会把它储存在字符串中。这点与 gets() 不同，gets() 会丢弃换行符。
这也好理解，上面说了 fgets 是为文件设计得，那文件中的换行符当然要进行记录。    

fgets() 函数的第 3 个参数指明要读入的文件。如果读入从键盘输入的数据，则以 stdin 为参数。    

```c
#include <stdio.h>
#define STLEN 14

int main(void) {
  char words[STLEN];

  puts("Enter a string, please.");
  fgets(words, STLEN, stdin);
  printf("Your stirng twice (puts(), then fputs()):\n");
  puts(words);
  fputs(words, stdout);
  puts("Enter another string, please.");
  fgets(words, STLEN, stdin);
  printf("Your stirng twice (puts(), then fputs()):\n");
  puts(words);
  fputs(words, stdout);
  puts("Done");
  return 0;
}
```   

输出：   

```
Enter a string, please.
hello, world
Your stirng twice (puts(), then fputs()):
hello, world

hello, world
Enter another string, please.
what the hell,hhhhhhhhh
Your stirng twice (puts(), then fputs()):
what the hell
what the hellDone
```    

注意第一次输入中，由于使用的是 fgets，然后字符个数又不够，那么换行符就也输入了进去。
所以 puts 输出的时候有两个换行符。而 fputs 不在字符串末尾添加换行符，所以并未打印出空行。   

2. **gets_s()函数**    

gets_s() 和 fgets() 类似，用一个参数限制读入的字符数。   

gets_s() 与 fgets() 的区别如下。   

gets_s() 只从标准输入中读取数据，所以不需要第 3 个参数。如果 gets_s() 读到换行符，会丢弃它
而不是储存它。   

如果 gets_s() 读到最大字符数都没有读到换行符，会执行以下几步。首先把目标数组中的首字符设置为
空字符，读取并丢弃随后的输入直至读到换行符或文件结尾，然后返回空指针。接着，调用依赖的“处理函数”，
可能会中止会退出程序。    

如果输入行太长会怎样？使用 gets() 不安全，它会擦写现有数据，存在安全隐患。gets_s() 函数很安全，
但是，如果并不希望程序中止或退出，就要知道如何编写特殊的“处理函数”。另外，如果打算让程序继续运行，
gets_s() 会丢弃该输入行的其余字符，无论你是否需要。由此可见，当输入太长，超过数组可容纳的字符数
时，fgets()函数最容易使用，而且可以选择不同的处理方式。   

### 11.2.4 scanf() 函数

scanf() 和 gets() 或 fgets() 的区别在于它们如何确定字符串的末尾：scanf() 更像是“获取单词”
函数，而不是“获取字符串”函数；如果预留的存储区装得下输入行，gets()和fgets()会读取第1个换行符
之前所有的字符。scanf() 函数有两种方法确定输入结束。无论哪种方法，都从第 1 个非空白字符作为
字符串的开始。如果使用 %s 转换说明，以下一个空白字符作为字符串的结束（字符串不包括空白字符）。
如果指定了字段宽度，如 %10s，那么 scanf() 将读取 10 个字符或读到第 1 个空白字符停止。   

scanf() 和 gets() 类似，也存在一些潜在的缺点。如果输入行的内容过长，scanf()也会导致数据溢出。
不过,在 %s 转换说明中使用字段宽度可防止溢出。    

## 11.3 字符串输出

C 有3个标准库函数用于打印字符串：puts, fputs, printf。   

### 11.3.1 puts 函数

puts()函数很容易使用，只需把字符串的地址作为参数传递给它即可。    

puts 在遇到空字符时就停止输出，所以必须确保有空字符。   

### 11.3.2 fputs 函数

fputs() 函数是 puts() 针对文件定制的版本。它们的区别如下。    

fputs 函数的第 2 个参数指明要写入数据的文件。与puts 不同，fputs 不会在输出的末尾添加换行符。   
### 11.3.3 printf 函数

和puts()一样，printf()也把字符串的地址作为参数。与puts()不同的是，printf()不会自动在每个字符
串末尾加上一个换行符。    

## 11.4 字符串函数

C库提供了多个处理字符串的函数，ANSI C把这些函数的原型放在string.h头文件中。其中最常用的函数有
strlen()、strcat()、strcmp()、strncmp()、strcpy() 和 strncpy()。另外,还有sprintf()
函数，其原型在stdio.h头文件中。    

### 11.4.1 strlen() 函数

strlen()函数用于统计字符串的长度。   

### 11.4.2 strcat() 函数

strcat()（用于拼接字符串）函数接受两个字符串作为参数。该函数把第2个字符串的备份附加在第1个字符串
末尾，并把拼接后形成的新字符串作为第1个字符串，第2个字符串不变。strcat()函数的类型是char *（即，
指向char的指针)。strcat()函数返回第1个参数，即拼接第2个字符串后的第1个字符串的地址。    

```c
#include <stdio.h>
#include <string.h>

#define SIZE 80

char *s_gets(char *st, int n);

int main(void) {
  char flower[SIZE];
  char addon[] = "s smell like old shoes.";
  puts("What is ypur favorite flower?");
  if (s_gets(flower, SIZE)) {
    strcat(flower, addon);
    puts(flower);
    puts(addon);
  } else {
    puts("End of file encountered!");
  }

  puts("Bye");
  return 0;
}

char *s_gets(char *st, int n) {
  char *ret_val;
  int i = 0;
  ret_val = fgets(st, n, stdin);

  if (ret_val) {
    while (st[i] != '\n' && st[i] != '\0') {
      i++;
    }
    if (st[i] == '\n') {
      st[i] = '\0';
    } else {
      while (getchar() != '\n') {
        continue;
      }
    }
  }
  return ret_val;
}
```    

输出：   

```
What is ypur favorite flower?
rose
roses smell like old shoes.
s smell like old shoes.
Bye
```    

### 11.4.3 strncat() 函数

strcat() 函数无法检查第1个数组是否能容纳第2个字符串，如果分配给第1个数组的空间不够大，多出来
的字符溢出到相邻存储单元时就会出问题。strncat()，该函数的第3个参数指定了最大添加字符数。例如，
`strncat(bugs, addon, 13)` 将把 addon 字符串的内容附加给 bugs，在加到第 13 个字符或遇到
空字符时停止。    

### 11.4.4 strcmp() 函数

假设要把用户的响应与已储存的字符串作比较：   

```c
#include <stdio.h>

#define ANSWER "Grant"
#define SIZE 40

char *s_gets(char *st, int n);

int main(void) {
  char try[SIZE];
  puts("Who is buried in Grant's tomb?");
  s_gets(try, SIZE);

  while (try != ANSWER) {
    puts("No, that's wrong.Try again.");
    s_gets(try, SIZE);
  }
  puts("That's right!");
  return 0;
}
```    

这个程序看上去没问题，但是运行后却不对劲。ANSWER 和 try 都是指针，所以 try != ANSWER 检查的
不是两个字符串是否相等，而是这两个字符串的地址是否相同。因为 ANSWER 和 try 储存在不同的位置，
所以这两个地址不可能相同。    

strcpm() 函数通过比较运算符来比较字符串，如果两个字符串参数相同，该函数就返回0，否则返回非零值。   

```c
#include <stdio.h>
#include <string.h>

#define ANSWER "Grant"
#define SIZE 40

char *s_gets(char *st, int n);

int main(void) {
  char try[SIZE];
  puts("Who is buried in Grant's tomb?");
  s_gets(try, SIZE);

  while (strcmp(try, ANSWER) != 0) {
    puts("No, that's wrong.Try again.");
    s_gets(try, SIZE);
  }
  puts("That's right!");
  return 0;
}
```    

如果在字母表中第1个字符串位于第2个字符串前面，strcmp()就返回负数；反之，strcmp则返回正数。   

strcmp()函数比较字符串中的字符，直到发现不同的字符为止，这一过程可能会持续到字符串的末尾。而strncmp()函数在比较两个字符串时，可以比较到字符不同的地方，也可以只比较第3个参数指定的字符数。   

### 11.4.5 strcpy() 和 strcncpy() 函数

如果 pts1 和 pts2 都是指向字符串的指针，那么下面语句拷贝的是字符串的地址而不是字符串本身：   

```c
pts2 = pts1;
```   

如果希望拷贝整个字符串，要使用strcpy()函数。   

```c
#include <stdio.h>
#include <string.h>
#define SIZE 40
#define LIM 5

char *s_gets(char *st, int n);

int main(void) {
  char qwords[LIM][SIZE];
  char temp[SIZE];

  int i = 0;
  printf("Enter %d words beginning with q:\n", LIM);

  while (i < LIM && s_gets(temp, SIZE)) {
    if (temp[0] != 'q') {
      printf("%s doesn't begin with q!\n", temp);
    } else {
      strcpy(qwords[i], temp);
      i++;
    }
  }

  puts("Here are the words accepted:");
  for (i = 0; i < LIM; i++) {
    puts(qwords);
  }
  return 0;
}
```   

strcpy()函数还有两个有用的属性。第一，strcpy()的返回类型是char *，该函数返回的是第1个参数的
值，即一个字符的地址。第二，第 1 个参数不必指向数组的开始。这个属性可用于拷贝数组的一部分。   

strcpy()和strcat()都有同样的问题，它们都不能检查目标空间是否能容纳源字符串的副本。拷贝字符串
用 strncpy()更安全，该函数的第 3 个参数指明可拷贝的最大字符数。    

strncpy(target, source, n)把source中的n个字符或空字符之前的字符（先满足哪个条件就拷贝到何
处）拷贝至target中。因此，如果source中的字符数小于n，则拷贝整个字符串，包括空字符。但是，
strncpy()拷贝字符串的长度不会超过n，如果拷贝到第n个字符时还未拷贝完整个源字符串，就不会拷贝空字
符。所以，拷贝的副本中不一定有空字符。    

### 11.4.6 sprintf() 函数

sprintf() 函数声明在 stdio.h 中。该函数和 printf() 类似，但是它是把数据写入字符串，而不是
打印在显示器上。因此，该函数可以把多个元素组合成一个字符串。sprintf 的第1个参数是目标字符串的
地址。    

## 11.5 命令行参数

```c
#include <stdio.h>

int main(int argc, char *argv[]) {
  int count;
  printf("The command line has %d arguments:\n", argc - 1);

  for (count = 1; count < argc; count++) {
    printf("%d:  %s\n", count, argv[count]);
  }
  printf("\n");
  return 0;
}
```    

执行结果：   

```
$ repeat Resistance is futile
The command line has 3 arguments:
1:  Resistance
2:  is
3:  futile
```    

C编译器允许 main() 没有参数或者有两个参数。main() 有两个参数时，第 1 个参数是命令行中字符串
数量。过去，这个 int 类型的参数被称为 argc。    

## 11.6 把字符串转换为数字

atoi() 函数用于把字母数字转换成整数，该函数接受一个字符串作为参数，返回相应的整数值。   

如果字符串仅以整数开头，atio()函数也能处理，它只把开头的整数转换为字符。例如，atoi("42regular")
将返回整数42。     

头文件 stdlib.h 头文件包含了 atoi() 函数的原型。除此之外，还包含了 atof() 和 atol() 函数
的原型。atof() 函数把字符串转换成 double 类型的值，atol() 函数把字符串转换成 long 类型的值。
atof()和atol()的工作原理和atoi()类似，因此它们分别返回double类型和long类型。   

ANSI C还提供一套更智能的函数：strtol()把字符串转换成long类型的值，strtoul()把字符串转换成
unsigned long类型的值，strtod()把字符串转换成double类型的值。这些函数的智能之处在于识别和
报告字符串中的首字符是否是数字。而且，strtol()和strtoul()还可以指定数字的进制。    

