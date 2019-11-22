# 第 10 章 数组和指针

<!-- TOC -->

- [第 10 章 数组和指针](#第-10-章-数组和指针)
  - [10.1 数组](#101-数组)
    - [10.1.1 初始化数组](#1011-初始化数组)
    - [10.1.2 指定初始化器（C99）](#1012-指定初始化器c99)
    - [10.1.3 数组边界](#1013-数组边界)
    - [10.1.4 指定数组的大小](#1014-指定数组的大小)
  - [10.2 多维数组](#102-多维数组)
    - [10.2.1 初始化二维数组](#1021-初始化二维数组)
  - [10.3 指针和数组](#103-指针和数组)
  - [10.4 函数、数组和指针](#104-函数数组和指针)
    - [10.4.1 使用指针形参](#1041-使用指针形参)
  - [10.5 指针操作](#105-指针操作)
  - [10.6 保护数组中的数据](#106-保护数组中的数据)
    - [10.6.1 对形参使用 const](#1061-对形参使用-const)
    - [10.6.2 const 的其他内容](#1062-const-的其他内容)
  - [10.7 指针和多维数组](#107-指针和多维数组)
    - [10.7.1 指向多维数组的指针](#1071-指向多维数组的指针)
    - [10.7.2 函数和多维数组](#1072-函数和多维数组)
  - [10.8 变长数组（VLA）](#108-变长数组vla)
  - [10.9 复合字面量](#109-复合字面量)
  - [10.11 本章小结](#1011-本章小结)

<!-- /TOC -->

## 10.1 数组

### 10.1.1 初始化数组

只储存单个值的变量有时也称为标量变量。C使用新的语法来初始化数组：   

```c
int powers[8] = {1, 2, 4, 6, 8, 16, 32, 64};
```     

有时需要把数组设置为只读。这样，程序只能从数组中检索值，不能把新值写入数组。要创建只读数组，应该用
`const` 声明和初始化数组。    

数组和其他变量类似，可以把数组创建成不同的存储类别。第 12 章将介绍存储类别的相关内容，现在只需
记住：本章描述的数组属于自动存储类别，意思是这些数组在函数内部声明，且声明时未使用关键字 static。
到目前为止，本书所用的变量和数组都是自动存储类别。    

在这里提到存储类别的原因是，不同的存储类别有不同的属性，所以不能把本章的内容推广到其他存储类别。   

```c
#include <stdio.h>

#define SIZE 4

int main(void) {
  int some_data[SIZE] = {1492, 1066};

  int i;

  printf("%2s%14s\n", "i", "some_data[i]");

  for (i = 0; i < SIZE; i++) {
    printf("%2d%14d\n", i, some_data[i]);
  }

  return 0;
}
```    

当初始化列表中的值少于数组元素个数时，编译器会把剩余的元素都初始化为0。也就是说，如果不初始化数组，
数组元素和未被初始化的普通变量一样，其中储存的都是垃圾值；但是，如果部分初始化数组，剩余的元素就
会被初始化为0。    

在初始化数组时，可以省略方括号中的数字，让编译器自动匹配数组大小和初始化列表中的项数：   

```c
#include <stdio.h>

int main(void) {
  const int days[] = {31, 28,31,30,31,30,31,31,30,31};

  int index;

  for (index = 0; index < sizeof days / sizeof days[0]; index++) {
    printf("Month %2d has %d days.\n", index + 1, days[index]);
  }

  return 0;
}
```   

### 10.1.2 指定初始化器（C99）

C99 增加了一个新特性：指定初始化器。利用该特性可以初始化指定的数组元素。例如，只初始化数组中的
最后一个元素。对于传统的C初始化语法，必须初始化最后一个元素之前的所有元素，才能初始化它：   

```c
int arr[6] = {0,0,0,0,0,212};   // 传统的语法

int arr[6] = {[5] = 212};  // 把 arr[5] 初始化为 212
```    

对于一般的初始化，在初始化一个元素后，未初始化的元素都会被设置为0。下例中的初始化比较复杂：   

```c
#include <stdio.h>

#define MONTHS 12

int main(void) {
  int days[MONTHS] = {31, 28, [4] = 31, 30, 31, [1] = 29};

  int i;
  for (i = 0; i < MONTHS; i++) {
    printf("%2d  %d\n", i, days[i]);
  }

  return 0;
}
```   

打印结果如下： `31 29 0 0 31 30 31 0 0 0 0 0`。   

以上输出揭示了指定了初始化器的两个重要特性。第一，如果指定初始化器后面有更多的值，如该例中的初始
化列表中的片段：\[4\] = 31, 30, 31，那么后面这些值将被用于初始化指定元素后面的元素。第二，如果
再次初始化指定的元素，那么最后的初始化将会取代之前的初始化。    

### 10.1.3 数组边界

编译器不会检查数组下标是否使用得当。在C标准中，使用越界下标的结果是未定义的。    

### 10.1.4 指定数组的大小

在 C99 标准之前，声明数组时只能在方括号中使用整型常量表达式。所谓整型常量表达式，是由整型常量构成
的表达式。sizeof 表达式被视为整型常量。另外，表达式的值必须大于0。      

```c
int n = 5, m = 8;
float a1[n], a2[m];
```    

C99 之前的编译器不允许上面的声明方式。而C99标准允许这样声明，这创建了一种新型数组，称为变长数组
（variable-length array）或简称 VLA。    

## 10.2 多维数组   

### 10.2.1 初始化二维数组

```c
const float rain[5][5] = {
  { 4.3, 4.3, 4.3, 3.0, 2.0},
  { 8.5, 8.2, 1.2, 1.6, 2.4},
  { 9.1, 8.5, 6.7, 4.3, 2.1},
  { 7.2, 9.9, 8.4, 3.3, 1.2},
  { 7.6, 5.6, 3.8, 2.7, 3.8}
};
```    

前面讨论的数据个数和数组大小不匹配的问题同样适用于这里的每一行。也就是说，如果第1个列表中只有2
个数，则只会初始化数组第1行的前2个元素，而最后3个元素将被默认初始化为0。   

初始化时也可省略内部的花括号，只保留最外面的一对花括号。只要保证初始化的数值个数正确，初始化的
效果与上面相同。但是如果初始化的数值不够，则按照先后顺序逐行初始化，直到用完所有的值。后面没有值
初始化的元素被统一初始化为0。    

## 10.3 指针和数组

数组名是数组首元素的地址。也就是说，如果 flizny 是一个数组，下面的语句成立：   

```c
flizny == &flizny[0];
```    

flizny 和 &flizny[0] 都表示数组首元素的内存地址。两者都是常量，在程序的运行过程中，不会改变。
但是，可以把它们赋值给指针变量，然后可以修改指针变量的值。    

```c
#include <stdio.h>

#define SIZE 4

int main(void) {
  short dates[SIZE];
  short * pti;
  short index;
  double bills[SIZE];
  double *ptf;
  
  pti = dates;
  ptf = bills;

  printf("%23s  %15s\n", "short", "double");

  for (index = 0; index < SIZE; index++) {
    printf("pointers + %d:  %10p  %10p\n", index, pti + index, ptf + index);
  }
  return 0;
}
```    

在 C 中，指针加 1 指的是增加一个存储单元。对数组而言，这意味着加 1 后的地址是下一个元素的地址，
而不是下一个字节的地址。这就是为什么必须声明指针所指向对象类型的原因之一。只知道地址不够，因为
计算机要知道存储对象需要多少字节。    

指针加 1，指针的值递增它所指向类型的大小（已字节为单位）。下面的等式体现了  C 语言的灵活性：   

```c
dates + 2 == &dates[2];    // 相同的地址
*(dates + 2) == dates[2];   // 相同的值
```    

顺带一提，不要混淆 `*(dates + 2)` 和 `*dates + 2`。间接运算符 * 的优先级高于 +，所以
`*dates + 2` 相当于 `(*dates) + 2`。    

## 10.4 函数、数组和指针

假设要编写一个处理数组的函数，该函数返回数组中所有元素之和，待处理的是名为 marbles 的 int 类型
数组。应该如何调用该函数？也许是下面这样：   

```c
total = sum(marbles);
```    

那么，该函数的原型是什么？记住，数组名是该数组首元素的地址，所以实际参数 marbles 是一个储存 int
类型值的地址，应把它赋给一个指针形式参数，即该形参是一个指向 int 类型的指针：   

```c
int sum(int * ar);
```    

`sum()` 从该参数获得了什么信息？它获得了该数组首元素的地址，知道要在改位置上找出一个整数。注意，
该参数并未包含数组元素个数的信息。我们可以将数组大小作为第二个参数传入。    

关于函数的形参，有一点要注意。只有在函数原型或函数定义头中，才可以用 `int ar[]` 代替 `int * ar`。
`int * ar` 形式和 `int ar[]` 形式都表示 ar 是一个指向 int 的指针。但是，`int ar[]` 只能
用于声明形式参数。`int ar[]` 提醒读者指针 ar 指向的不仅仅是一个 int 类型值，还是一个 int 类型
数组的元素。   

由于函数原型可以省略参数名，所以下面 4 种原型都是等价的：   

```c
int sum(int *ar, int n);
int sum(int *, int);
int sum(int ar[], int n);
int sum(int [], int);
```    

### 10.4.1 使用指针形参

函数要处理数组必须知道何时开始、何时结束。sum()函数使用一个指针形参标识数组的开始，用一个整数形参
表明待处理数组的元素个数（指针形参也表明了数组中的数据类型）。但是这并不是给函数传递必备信息的
唯一方法。还有一种方法是传递两个指针，第1个指针指明数组的开始处（与前面用法相同），第2个指针指明
数组的结束处。    

```c
#include <stdio.h>

#define SIZE 10

int sump(int * start, int * end);

int main(void) {
  int marbles[SIZE] = {20, 10, 5, 39, 4, 16, 19, 26, 31, 20};
  long answer;

  answer = sump(marbles, marbles + SIZE);

  printf("The total number of marbles is %ld.\n", answer);
  return 0;
}

int sump(int *start, int *end) {
  int total = 0;

  while (start < end) {
    total += *start;
    start++;
  }
  return total;
}
```   

还可以把循环体压缩成一行代码：   

```c
total += *start++;
```    

一元运算符 * 和 ++ 的优先级相同，但结合律是从右向左，所以 start++ 先求值，然后才是 *start。
也就是说，指针 start 先递增后指向。使用后缀形式，意味着先把指针指向位置上的值加到 total 上，
然后再递增指针。如果使用 *++start，顺序则反过来，先递增指针，再使用指针指向位置上的值。如果使用
(*start)++，则先使用 start 指向的值，再递增该值，而不是递增指针。   

## 10.5 指针操作

C 提供了一些基本的指针操作，下面的程序示例中演示了 8 种不同的操作。除此之外，还可以使用关系运算
符来比较指针。   

```c
#include <stdio.h>

int main(void) {
  int urn[5] = {100, 200, 300, 400, 500};
  int *ptr1, *ptr2, *ptr3;
  ptr1 = urn;
  ptr2 = &urn[2];

  printf("pointer value,  dereferenced pointer,  pointer address:\n");
  printf("ptr = %p, *ptr1 = %d, &ptr1 = %p\n", ptr1, *ptr1, &ptr1);

  ptr3 = ptr1 + 4;  // 指针加法

  printf("\nadding an int to a pointer:\n");
  printf("ptr1 + 4 = %p, *(prt1 + 4) = %d\n", ptr1 + 4, *(ptr1 + 4));

  ptr1++;  // 递增指针
  printf("\nvalues after ptr1++:\n");
  printf("ptr1 = %p, *ptr1 = %d, &ptr1 = %p\n", ptr1, *ptr1, &ptr1);

  ptr2--;  // 递减指针
  printf("\nvalues after --ptr2:\n");
  printf("ptr2 = %p, *ptr2 = %d, &ptr2 = %p\n", ptr2, *ptr2, &ptr2);

  --ptr1;
  ++ptr2;

  printf("\nPointers reset to original values:\n");
  printf("ptr1 = %p, ptr2 = %p\n", ptr1, ptr2);

  // 一个指针减去另一个指针
  printf("\nsubtracting one pointer from anotehr:\n");
  printf("ptr2 = %p, ptr1 = %p, ptr2 - ptr1 = %td\n", ptr2, ptr1, ptr2 - ptr1);

  // 一个指针减去一个整数
  printf("\nsubtracting an int from a pointer:\n");
  printf("ptr3 = %p, ptr3 - 2 = %p\n", ptr3, ptr3 - 2);
  return 0;
}
```   

打印输出

```
pointer value,  dereferenced pointer,  pointer address:
ptr = 0x7fff86023dc0, *ptr1 = 100, &ptr1 = 0x7fff86023da8

adding an int to a pointer:
ptr1 + 4 = 0x7fff86023dd0, *(prt1 + 4) = 500

values after ptr1++:
ptr1 = 0x7fff86023dc4, *ptr1 = 200, &ptr1 = 0x7fff86023da8

values after --ptr2:
ptr2 = 0x7fff86023dc4, *ptr2 = 200, &ptr2 = 0x7fff86023db0

Pointers reset to original values:
ptr1 = 0x7fff86023dc0, ptr2 = 0x7fff86023dc8

subtracting one pointer from anotehr:
ptr2 = 0x7fff86023dc8, ptr1 = 0x7fff86023dc0, ptr2 - ptr1 = 2

subtracting an int from a pointer:
ptr3 = 0x7fff86023dd0, ptr3 - 2 = 0x7fff86023dc8
```

下面分别描述指针变量的基本操作：   

- 赋值：可以把地址赋给指针。例如，用数组名、带地址运算符（&）的变量名、另一个指针进行赋值。
- 解引用：*运算符给出指针指向地址上储存的值。
- 取址：和所有变量一样，指针变量也有自己的地址和值。对指针而言，&运算符给出指针本身的地址
- 指针与整数相加：可以使用 + 运算符把指针与整数相加，或整数与指针相加。无论哪种情况，整数都会和
指针所指向类型的大小（以字节为单位）相乘，然后把结果与初始地址相加
- 递增指针/递减指针：递增指向数组元素的指针可以让该指针移动至数组的下一个元素。递减指向数组元素
的指针可以让该指针移动至数组的上一个元素
- 指针求差：可以计算两个指针的差值。通常，求差的两个指针分别指向同一个数组的不同元素，通过计算求出
两元素之间的距离。差值的单位与数组类型的单位相同。例如，`ptr2 - ptr1` 得 2，意思是这两个指针
所指向的两个元素相隔两个 int，而不是 2 字节。只要两个指针都指向相同的数组，C 都能保证相减运算
有效。如果指向两个不同数组的指针进行求差运算可能会得出一个值，或者导致运行时错误。
- 指针减去一个整数：该整数将乘以指针指向类型的大小（以字节为单位），然后用初始地址减去乘积。
- 比较：使用关系运算符可以比较两个指针的值，前提是两个指针都指向相同类型的对象。   

## 10.6 保护数组中的数据

编写一个处理基本类型（如，int）的函数时，要选择是传递int类型的值还是传递指向int的指针。通常都是
直接传递数值，只有程序需要在函数中改变该数值时，才会传递指针。对于数组别无选择，必须传递指针，
因为这样做效率高。如果一个函数按值传递数组，则必须分配足够的空间来储存原数组的副本，然后把原数组
所有的数据拷贝至新的数组中。如果把数组的地址传递给函数，让函数直接处理原数组则效率要高。    

### 10.6.1 对形参使用 const

ANSI C 提供一种预防手段，避免我们在函数中错误地修改数组中元素的值。如果函数的意图不是修改数组中的
数据内容，那么在函数原型和函数定义中声明形参时应使用关键字 const：    

```c
int sum(const int ar[], int n);
```    

以上代码中的 const 告诉编译器，该函数不能修改 ar 指向的数组中的内容。如果在函数中不小心使用类似
`ar[i]++` 的表达式，编译器会捕获这个错误，并生成一条错误信息。   

这里一定要理解，这样使用 const 并不是要求原数组是常量，而是该函数在处理数组时将其视为常量，不可
更改。这样使用 const 可以保护数组的数据不被修改，就像按值传递可以保护基本数据类型的原始值不被改变
一样。    

### 10.6.2 const 的其他内容

虽然用 #define 指令可以创建符号常量，但是 const 的用法更加灵活。可以创建 const 数组、const
指针和指向 const 的指针。    

```c
const int days[12] = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
```   

如果程序稍后尝试改变数组元素的值，编译器将生成一个编译期错误消息。注意这里和 JS 中是不同的。   

指向 const 的指针不能用于改变值：   

```c
double rates[5] = {88.99, 100.12, 59.45, 183.11, 340.5};
const double *pd = rates;
```   

第 2 行代码把 pd 指向的 double 类型的值声明为 const，这表明不能使用 pd 来更改它所指向的值：   

```c
*pd = 29.89;  // 不允许
pd[2] = 222.22;  // 不允许
rates[0] = 99.99; // 允许，因为 rates 未被 const 限定
```   

不过可以让 pd 指向别处： `pd++`。   

注意这里这种形式叫指向 const 的指针，但是指针本身并不是 const 的。    

指向 const 的指针通常用于函数形参中，表明该函数不会使用指针改变数据。    

- const 数组：数组是 const 的，不能改数组的值
- const 指针：指针是 const 的，不能改指针，但是能改指针指向的值
- 指向 const 的指针：指针不是 const, 指针指向的东西也不一定是 const, 但是从这个指针的角度
来看，指针指向的东西是 const 的

关于指针赋值和 const 需要注意一些规则。首先，把 const 数据或非 const 数据的地址初始化为指向
const 的指针或为其赋值是合法的：   

```c
double rates[5] = {88.99, 100.12, 59.45, 183.11, 340.5};
const double locked[4] = {0.08, 0.075, 0.0725, 0.07};
const double *pc = rates; // 有效
pc = locked;              // 有效
pc = &rates[3];           // 有效
```   

意思其实就是说把一个变量的指针赋给一个指向 const 的指针，那其实变量到底是不是 const 的是无所谓的。   

其实，指向 const 的指针，最主要就是阻止我们通过指针修改指针指向的东西的值。因此，指针原本所指向
的内容到底是 const 还是非 const 其实和指针无关。    

然而，只能把非 const 数据的地址赋给普通指针。那肯定的，因为普通指针是可以修改原数据的，因此原
数据必须不能是 const。    

const 还有其他的用法。例如，可以声明并初始化一个不能指向别处的指针，关键是 const 的位置：   

```c
double rates[5] = {88.99, 100.12, 59.45, 183.11, 340.5};
double * const pc = rates;
pc = &rates[2];   // 不允许
```   

最后，在创建指针时还可以使用 const 两次，该指针既不能更改它所指向的地址，也不能修改指向地址上的值：   

```c
double rates[5] = {88.99, 100.12, 59.45, 183.11, 340.5};
const double * const pc = rates;
pc = &rates[2];    // 不允许
*pc = 92.99;       // 不允许
```     


`const double * ptr` 可以这样理解：一个指针变量，指向一个 `const double` 常量，当然这里
常量并不是指指向的变量是个常量，而是从指针的视角来看变量是个常量，`double * const ptr` 则可以
这样理解，指针是一个常量，然后指针指向一个普通的 double 变量。    

## 10.7 指针和多维数组

假设有以下的声明：   

```c
int zippo[4][2];
```   

然后数组名 zippo 是该数组首元素的地址。在本例中，zippo 的首元素是一个内含两个 int 值的数组，
所以 zippo 是这个内含两个 int 值的数组的地址。下面，我们从指针的属性进一步分析。   

因为 zippo 是数组首元素的地址，所以 zippo 的值和 `&zippo[0]` 的值相同，而 `zippo[0]` 本身是一个
内含两个整数的数组，所以 `zippo[0]` 的值和它首元素的地址，即 `&zippo[0][0]` 相同。简而言之，
`zippo[0]` 是一个占用一个 int 大小对象的地址，而 zippo 是一个占用两个 int 大小对象的地址（注意
这里是指向的对象占用了一个或两个int的空间）。由于这个整数和内含两个整数的数组都开始于同一个地址，
所以 `zippo` 和 `zippo[0]` 的值相同。   

给指针或地址加 1，其值会增加对应类型大小的数值。在这方面，`zippo` 和 `zippo[0]` 不同，因为
`zippo` 指向的对象占用了两个 int 大小，而 `zippo[0]` 指向的对象只占用一个 int 大小。因此
`zippo + 1` 和 `zippo[0] + ` 的值不同。  

解引用一个指针或在数组名后使用带下标的 `[]` 运算符，得到引用对象代表的值。因为 `zippo[0]` 是该
数组首元素的地址，所以 `*(zippo[0])` 表示储存在 `zippo[0][0]` 上的值。与此类似，`*zippo`
代表该数组首元素`zippo[0]` 的值，但是 `zippo[0]` 本身就是一个 int 类型值的地址。该值的地址是
`&zippo[0][0]`，所以 `*zippo` 就是 `&zippo[0][0]`。    

### 10.7.1 指向多维数组的指针

如何声明一个指针变量 pz 指向一个二维数组？在编写处理类似 zippo 这样的二维数组时会用到这样的指针。
把指针声明为指向 int 的类型还不够。因为指向 int 只能与  `zippo[0]` 的类型匹配，说明该指针指
向一个 int 类型的值。但是 zippo 是它首元素的地址，该元素是一个内含两个 int 类型值的一维数组。
因此，pz 必须指向一个内含两个 int 类型值的数组，而不是一个指向 int 类型值，其声明如下：   

```c
int (*pz)[2];   // pz 指向一个内含两个 int 类型值的数组
```   

因为 `[]` 的优先级高于 `*`，每个元素都指向 `int` 指针。因此 `int * pax[2]` 是一个内含两个
指针元素的数组，每个元素是指向 int 的指针。   

### 10.7.2 函数和多维数组

然而，这种方法无法记录行和列的信息。用这种方法计算总和，行和列的信息并不重要。但如果每行代表一年，
每列代表一列，就还需要一个函数计算某列的总和。该函数要知道行和列的信息，可以通过声明正确类型的形参
变量来完成，以便函数能正确地传递数组。在这种情况下，数组 junk 是一个内含 3 个数组元素的数组，
每个元素是内含 4 个 int 类型值的数：   

```c
void somefunction(int (*pt)[4]);
```    

另外，如果当且仅当 `pt` 是一个函数的形式参数时，可以这样声明：   

```c
void somefunction(int pt[][4]);
```   

## 10.8 变长数组（VLA）

C99 新增了变长数组，允许使用变量表示数组的维度：   

```c
int q = 4;
int r = 5;
double sales[r][q];
```   

前面提到过，变长数组有一些限制。变长数组必须是自动存储类别，这意味着无论在函数中声明还是作为函数
形参声明，都不能使用 static 或 extern 存储类别说明符。而且，不能在声明中初始化它们。    

变长数组中的“变”不是指可以修改已创建数组的大小。一旦创建了变长数组，它的大小则保持不便。这里的
“变”指的是：在创建数组时，可以使用变量指定数组的维度。   

C99/C11 标准规定，可以省略原型中的形参名，但是在这种情况下，必须用星号来代替省略的维度：   

```c
int sum2d(int, int, int ar[*][*])
```    

## 10.9 复合字面量

假设给带int类型形参的函数传递一个值，要传递int类型的变量，但是也可以传递int类型常量，如5。
在C99 标准以前，对于带数组形参的函数，情况不同，可以传递数组，但是没有等价的数组常量。C99新增了
复合字面量（compound literal）。字面量是除符号常量外的常量。例如，5是int类型字面量，81.3是
double类型的字面量，'Y'是char类型的字面量，"elephant"是字符串字面量。发布C99标准的委员会
认为，如果有代表数组和结构内容的复合字面量，在编程时会更方便。    

对于数组，复合字面量类似数组初始化列表，前面是用括号括起来的类型名。    

```c
(int [2]){10, 20}
```    

初始化有数组名的数组时可以省略数组大小，复合字面量也可以省略大小，编译器会自动计算数组当前的元素
个数。   

因为复合字面量是匿名的，所以不能先创建然后再使用它，必须在创建的同时使用它。使用指针记录地址就是
一种用法：   

```c
int * pt1;
pt1 = (int[2]){10, 20};
```    

## 10.11 本章小结

对于 C 语言而言，不能把整个数组作为参数传递给函数，但是可以传递数组的地址。然后函数可以使用传入的
地址操控原始数组。如果函数没有修改原始数组的意图，应在声明函数的形式参数时使用关键字 `const`。
在被调函数中可以使用数组表示法或指针表示法，无论用哪种表示法，实际上使用的都是指针变量。   

C 语言传递多维数组的传统方法是把数组名（即数组的地址）传递给类型匹配的指针形参。声明这样的指针形参
要指定所有的数组维度，除了第 1 个维度。传递第 1 个维度通常作为第 2 个参数：   

```c
void display(double ar[][12], int rows);
```     