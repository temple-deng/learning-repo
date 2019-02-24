# 第 6 章 C控制语句：循环

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

