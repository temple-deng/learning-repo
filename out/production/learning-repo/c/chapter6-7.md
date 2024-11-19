# 第 6 章 C控制语句：循环

<!-- TOC -->

- [第 6 章 C控制语句：循环](#第-6-章-c控制语句循环)
  - [6.1 while 语句](#61-while-语句)
  - [6.2 用关系运算符和表达式比较大小](#62-用关系运算符和表达式比较大小)
    - [6.2.1 什么是真](#621-什么是真)
    - [6.2.2 新的 _Bool 类型](#622-新的-_bool-类型)
    - [6.2.3 优先级和关系运算符](#623-优先级和关系运算符)
  - [6.3 不确定循环和计数循环](#63-不确定循环和计数循环)
  - [6.4 for 循环](#64-for-循环)
  - [6.5 其他赋值运算符](#65-其他赋值运算符)
  - [6.6 逗号运算符](#66-逗号运算符)
  - [6.7 出口条件循环：do while](#67-出口条件循环do-while)
  - [6.8 数组简介](#68-数组简介)
  - [6.9 使用函数返回值的循环示例](#69-使用函数返回值的循环示例)
- [第 7 章 C控制语句：分支和跳转](#第-7-章-c控制语句分支和跳转)
  - [7.1 if else 语句](#71-if-else-语句)
    - [7.1.1 另一个示例：介绍 getchar() 和 putchar()](#711-另一个示例介绍-getchar-和-putchar)
    - [7.1.2 ctype.h系列的字符函数](#712-ctypeh系列的字符函数)
  - [7.2 逻辑运算符](#72-逻辑运算符)
    - [7.2.1 优先级](#721-优先级)
    - [7.2.2 求值顺序](#722-求值顺序)
    - [7.2.3 备选拼写：ios646.h 头文件](#723-备选拼写ios646h-头文件)
  - [7.3 条件运算符：?:](#73-条件运算符)
  - [7.4 循环辅助：continue 和 break](#74-循环辅助continue-和-break)
    - [7.4.1 continue 语句](#741-continue-语句)
    - [7.4.2 break 语句](#742-break-语句)
  - [7.5 多重选择：switch 和 break](#75-多重选择switch-和-break)
    - [7.5.1 switch 语句](#751-switch-语句)
    - [7.5.3 多重标签](#753-多重标签)
  - [7.6 goto 语句](#76-goto-语句)

<!-- /TOC -->

C 语言有 3 种循环：for, while, do while。   

## 6.1 while 语句

while 循环的通用形式如下：   

```
while ( expression )
  statement
```   

## 6.2 用关系运算符和表达式比较大小

while 循环经常依赖测试表达式作比较，这样的表达式被称为关系表达式，出现在关系表达式中间的运算符
叫做关系运算符。   

- &lt;
- &lt;=
- ==
- &gt;=
- &gt;
- !=    

相对来说，C 中的关系就简单多了，哪像其他语言那么复杂。  

虽然关系运算符也可用来比较浮点数，但是要注意：比较浮点数时,尽量只使用 &lt; 和 &gt;。因为浮点数
的舍入误差会导致在逻辑上应该相等的两数却不相等。   

### 6.2.1 什么是真

一般而言，所有的非零值都视为真，只有0被视为假。   

### 6.2.2 新的 _Bool 类型

在 C 语言中，一直用 int 类型的变量表示真/假值。C99 专门针对这种类型的变量新增了 _Bool 类型。
_Bool 类型的变量只能储存 1 或 0。如果把其他非零数值赋给 _Bool 类型的变量，该变量会被设置为 1，
这反映了 C 把所有的非零值都视为真。   

```c
#include <stdio.h>

int main(void) {
  long num;
  long sum = 0L;
  _Bool input_is_good;

  printf("Please enter an integer to be summed  ");
  printf("(q to quit):  ");
  input_is_good = (scanf("%ld", &num) == 1);

  while (input_is_good) {
    sum = sum + num;
    printf("Please enter next integer (q to quit):  ");
    input_is_good = (scanf("%ld", &num) == 1);
  }

  printf("Those integers sum to %ld.\n", sum);
  return 0;
}
```   

C99提供了 stdbool.h 头文件，该头文件让 bool 成为 _Bool 的别名，而且还把 true 和 false
分别定义为 1 和 0 的符号常量。包含该头文件后，写出的代码可以与C++兼容，因为C++把bool、true和
false定义为关键字。    

### 6.2.3 优先级和关系运算符

关系运算符的优先级比算术运算符低，比赋值运算符高。关系运算符之间有两种不同的优先级：   

- 高优先级组：`<, <=, >, >=`
- 低优先级组：`==, !=`    

## 6.3 不确定循环和计数循环

一些 while 循环是不确定循环（indefinite loop）。所谓不确定循环，指在测试表达式为假之前，预先
不知道要执行多少次循环。另外,还有一类是计数循环（counting loop）。这类循环在执行循环之前就知道
要重复执行多少次。   

## 6.4 for 循环

```c
#include <stdio.h>

int main(void) {
  const int NUMBER = 22;
  int count;

  for (count = 1; count <= NUMBER; count++) {
    printf("Be my Valentine!\n");
  }
  return 0;
}
```   

可以省略一个或多个表达式(但是不能省略分号):   

```c
#include <stdio.h>

int main(void) {
  int ans, n;
  ans = 2;
  for (n = 3; ans <= 25; ) {
    ans = ans * n;
  }
  printf("n = %d; ans = %d.\n", n, ans);
  return 0;
}
```    

如果把第 2 个表达式省略了，那么默认被视为真，所以下面的循环会一直运行：   

```c
for(; ;) {
  printf("I want some action.\n");
}
```   

## 6.5 其他赋值运算符

`+=, -=, *=, /=, %=` 优先级与赋值运算符相同。    

## 6.6 逗号运算符

逗号运算符扩展了 for 循环的灵活性，以便在循环头中包含更多的表达式:   

```c
#include <stdio.h>

int main(void) {
  const int FIRST_OZ = 46;
  const int NEXT_OZ = 20;

  int ounces, cost;

  printf("  ounces cost\n");

  for (ounces = 1, cost = FIRST_OZ; ounces <= 16; ounces++, cost += NEXT_OZ) {
    printf("%5d    $%4.2f\n", ounces, cost / 100.0);
  }

  return 0;
}
```    

逗号运算符并不局限在 for 循环中使用，但是这是它最常用的地方。逗号运算符有两个其他性质。首先，它
保证了被它分隔的表达式从左向右求值；其次，整个逗号表达式的值是右侧项的值。   

```c
houseprice = 249, 500;
```    

`houseprice = 249` 是逗号左侧的子表达式，因此这与这样的代码效果相同：   

```c
houseprice = 249;
500;
```    

逗号也可用作分隔符，在下面的语句中的逗号都是 **分隔符**，不是逗号运算符：   

```c
char ch, date;
printf("%d %d\n", chimps, chumps);
```    

## 6.7 出口条件循环：do while

while 循环和 for 循环都是入口条件循环，即在循环的每次迭代之前检查测试条件，所以有可能根本不执行
循环体中的内容。C语言还有出口条件循环，即在循环的每次迭代之后检查测试条件，这保证了至少执行循环
体中的内容一次。这种循环被称为 do while 循环。   

```c
#include <stdio.h>

int main(void) {
  const int secret_code = 13;
  int code_entered;

  do {
    printf("To enter the triskaidekaphobia therapy club,\n");
    printf("please enter the secret code number:  ");
    scanf("%d", &code_entered);
  } while (code_entered != secret_code);

  printf("Congratulations!  You are cured!\n");
  return 0;
}
```   

## 6.8 数组简介

数组（array）是按顺序储存的一系列类型相同的值，如 10 个 char 类型的字符或 15 个 int 类型的值。
整个数组有一个数组名，通过整数下标访问数组中单独的项或元素。例如，如下声明：   

```c
float debts[20];
```    

数组有一个潜在的陷阱：考虑到影响执行的速度，C编译器不会检查数组的下标是否正确。下面的代码，都不
正确：   

```c
debts[20] = 88.32;    // 该数组元素不存在
debts[33] = 828.12;   // 该数组元素不存在
```   

编译器不会查找这样的错误。当运行程序时，这会导致数据被放置在已被其他数据占用的地方，可能会破坏
程序的结果甚至导致程序异常中断。    

可以把字符串储存在 char 类型的数组中，如果 char 类型的数组末尾包含一个表示字符串末尾的空字符\0，
则该数组中的内容就构成了一个字符串。   

字符数组不一定就是字符串，如果字符数组中没有空字符 \0，那就不是个字符串。   

## 6.9 使用函数返回值的循环示例

编译器在程序中首次遇到 power() 时，需要知道 power() 的返回类型。此时，编译器尚未执行到 power()
的定义，并不知道函数定义中的返回类型是 double。因此，必须通过前置声明预先说明函数的返回类型。
前置声明告诉编译器，power() 定义在别处，其返回类型为 double。如果把 power() 函数的定义置于
main() 的文件顶部，就可以省略前置声明，因为编译器在执行到 main() 之前已经知道 power() 的所有
信息。但是，这不是 C 的标准风格。因为 main() 通常只提供整个程序的框架，最好把 main() 放在所有
函数定义的前面。    

# 第 7 章 C控制语句：分支和跳转

## 7.1 if else 语句

### 7.1.1 另一个示例：介绍 getchar() 和 putchar()

getchar() 函数不带任何参数，它从输入队列中返回下一个字符。例如，下面的语句读取下一个字符输入，
并把该字符的值赋给变量 ch：     

```c
ch = getchar();
```    

该语句和下面的语句效果相同：   

```c
scanf("%c", &ch);
```    

putchar() 函数打印它的参数。例如，下面的语句把之前赋给 ch 的值作为字符打印出来：   

```c
putchar(ch);
```   

由于这些函数只处理字符，所以它们⽐更通⽤的 `scanf()` 和 `printf()` 函数更快、更简洁。⽽且，
注意 `getchar()` 和 `putchar()` 不需要转换说明，因为它们只处理字符。这两个函数通常定义在
stdio.h 头⽂件中（⽽且，它们通常是预处理宏，⽽不是真正的函数）。    

```c
#include <stdio.h>

#define SPACE ' '

int main(void) {
  char ch;
  ch = getchar();
  while (ch != '\n') {
    if (ch == SPACE) {
      putchar(ch);
    } else {
      putchar(ch + 1);
    }
    ch = getchar();
  }

  putchar(ch);
  return 0;
}
```   

### 7.1.2 ctype.h系列的字符函数

C 有⼀系列专门处理字符的函数，ctype.h 头⽂件包含了这些函数的原型。这些函数接受⼀个字符作为参数，
如果该字符属于某特殊的类别，就返回⼀个⾮零值（真）；否则，返回0（假）。例如，如果 isalpha()函数
的参数是⼀个字母，则返回⼀个⾮零值。    

```c
#include <stdio.h>
#include <ctype.h>

int main(void) {
  char ch;

  while ((ch = getchar()) != '\n') {
    if (isalpha(ch)) {
      putchar(ch + 1);
    } else {
      putchar(ch);
    }
  }
  putchar(ch);
  return 0;
}
```   

下面列出了 ctype.h 头文件中的一些函数。   

字符测试函数：   

- `isalnum()`: 字母或数字
- `isalpha()`: 字母
- `isblank()`: 标准的空白字符（空格、水平制表符或换行符）或任何其他本地化指定为空白的字符
- `iscntrl()`: 控制字符，如ctrl+B
- `isdigit()`: 数字
- `isgraph()`: 除空格之外的任意可打印字符
- `islower()`: 小写字母
- `isprint()`: 可打印字符
- `ispunct()`: 标点字符（除空格或字母数字字符以外的任何可打印字符）
- `isspace()`: 空白字符（空格、换行符、换页符、回车符、垂直制表符、水平制表符或其他本地化定义的
字符）
- `isupper()`: 大写字母
- `isxdigit()`: 十六进制数字符

ctype.h 中的字符映射函数，注意字符映射函数不会修改原始的参数：   

- `tolower()`
- `toupper()`

## 7.2 逻辑运算符

逻辑运算符的优先级比关系运算符低：   

- &&
- ||
- !

### 7.2.1 优先级

! 运算符的优先级很高，比乘法运算符还高，与递增运算符的优先级相同，只比圆括号的优先级低。&& 运算符
的优先级比 || 运算符高，但是两者的优先级都比关系运算符低，比赋值运算符高。    

所以那目前的优先级顺序是：   

```
圆括号 > !, ++, -- > 算术 > 关系 > 逻辑 > 赋值 > ,
```

### 7.2.2 求值顺序

除了两个运算符共享一个运算对象的情况外，C 通常不保证先对复杂表达式中的哪部分求值。例外，下面的语句，
可能先对表达式 5+3 求值，也可能先对表达式 9+6 求值：   

```c
apples = (5+3) * (9+6);
```  

C 把先计算哪部分的决定权留给编译器的设计者，以便针对特定系统优化设计。但是，对于逻辑运算符是个
例外，C保证逻辑表达式的求值顺序是从左往右。&&和||运算符都是序列点，所以程序在从⼀个运算对象执⾏
到下⼀个运算对象之前，所有的副作⽤都会⽣效。⽽且，C 保证⼀旦发现某个元素让整个表达式⽆效，便⽴即
停⽌求值。     

### 7.2.3 备选拼写：ios646.h 头文件

C 是在美国⽤标准美式键盘开发的语⾔。但是在世界各地，并⾮所有的键盘都有和美式键盘⼀样的符号。因此，
C99标准新增了可代替逻辑运算符的拼写，它们被定义在ios646.h头⽂件中。如果在程序中包含该头⽂件，
便可⽤ and 代替 &&、or 代替 ||、not 代替 !。例如，可以把下⾯的代码：   

```c
if (ch != '"' && ch != '\'')
  charcount++;
```   

改写为：   

```c
if (ch != '"' and ch != '\'')
  charcount;
```     

## 7.3 条件运算符：?:

没错就是常见的那个三元运算符。略。   

## 7.4 循环辅助：continue 和 break

### 7.4.1 continue 语句

3 种循环都可以使用 continue 语句。执行到该语句时，会跳过本次迭代的剩余部分，并开始下一轮迭代。
如果 continue 语句在嵌套循环内，则只会影响包含该语句的内层循环：   

```c
#include <stdio.h>

int main(void) {
  const float MIN = 0.0f;
  const float MAX = 100.0f;

  float score;
  float total = 0.0f;
  int n = 0;

  float min = MAX;
  float max = MIN;

  printf("Enter the first score(q to quit):");
  while (scanf("%f", &score) == 1) {
    if (score < MIN || score > MAX) {
      printf("%0.1f is an invalid value.Try again: ", score);
      continue; // 跳转至 while 循环的测试条件
    }
    printf("Accepting %0.1f:\n", score);
    min = (score < min) ? score : min;
    max = (score > max) ? score : max;
    total += score;
    n++;
    printf("Enter next score(q to quit):");
  }

  if (n > 0) {
    printf("Average of %d scores is %0.1f.\n", n, total / n);
    printf("Low = %0.1f, high = %0.1f\n", min, max);
  } else {
    printf("No valid scores were entered.\n");
  }
  return 0;
}
```   

continue 是让程序跳过循环体的余下部分。那么，从何处开始继续循环？对于 while和 do while 循环，
执⾏ continue 语句后的下⼀个⾏为是对循环的测试表达式求值。    

对于for循环，执⾏continue后的下⼀个⾏为是对更新表达式求值，然后是对循环测试表达式求值。   

### 7.4.2 break 语句

程序执⾏到循环中的break语句时，会终⽌包含它的循环，并继续执⾏下⼀阶段。    

## 7.5 多重选择：switch 和 break

```c
#include <stdio.h>
#include <ctype.h>

int main(void) {
  char ch;
  printf("Give me a letter of the alphabet, and I will give ");
  printf("an animal name\nbeginning with that letter.\n");
  printf("Please type in a letter; type # to end my act.\n");

  while ((ch = getchar()) != '#') {
    if (ch == '\n') {
      continue;
    }

    if (islower(ch)) {
      switch (ch) {
        case 'a':
          printf("argali, a wild sheep of Asia\n");
          break;
        case 'b':
          printf("babirusa, a wild pig of Malay\n");
          break;
        case 'c':
          printf("coati, racoonlike mammal\n");
          break;
        case 'd':
          printf("desman, aquatic, molelike critter\n");
          break;
        case 'e':
          printf("echidna, the spiny anteater\n");
          break;
        case 'f':
          printf("fisher, brownish marten\n");
          break;
        default:
          printf("That's a stumper\n");
      }
    } else {
      printf("I recognize only lowercase letter.\n");
    }

    while (getchar() != '\n') {
      continue;
    }
    printf("Please type another letter or a #.\n");
  }
  printf("Bye\n");
  return 0;
}
```    

### 7.5.1 switch 语句

break 语句可用于循环和 switch 语句中，但是 continue 只能用于循环中。    

switch 在圆括号中的测试表达式的值应该是一个整数值。case 标签必须是整数类型的常量或整型常量表达式。
不能用变量作为 case 标签。   

### 7.5.3 多重标签

switch 语句中使用多重 case 标签。    

## 7.6 goto 语句

goto 语句有两部分：goto 和标签名。标签的命名遵循变量命名规范：   

```c
goto part2;
```   

要让这条语句正常工作，函数还必须包含另一条标为 part2 的语句，该语句以标签名后跟一个冒号开始：   

```c
part:printf("Refined analysis:\n");
```   
