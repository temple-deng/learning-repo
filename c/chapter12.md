# 第 12 章 存储类别、链接和内存管理

<!-- TOC -->

- [第 12 章 存储类别、链接和内存管理](#第-12-章-存储类别链接和内存管理)
  - [12.1 存储类别](#121-存储类别)
    - [12.1.1 作用域](#1211-作用域)
    - [12.1.2 链接](#1212-链接)
    - [12.1.3 存储期](#1213-存储期)
    - [12.1.4 自动变量](#1214-自动变量)
    - [12.1.5 寄存器变量](#1215-寄存器变量)
    - [12.1.6 块作用域的静态变量](#1216-块作用域的静态变量)
    - [12.1.7 外部链接的静态变量](#1217-外部链接的静态变量)
    - [12.1.8 内部链接的静态变量](#1218-内部链接的静态变量)
    - [12.1.9 多文件](#1219-多文件)
    - [12.1.10 存储类别说明符](#12110-存储类别说明符)
    - [12.1.11 存储类别和函数](#12111-存储类别和函数)
  - [12.2 随机数函数和静态变量](#122-随机数函数和静态变量)
  - [12.3 分配内存：malloc()和free()](#123-分配内存malloc和free)
    - [12.3.1 free() 的重要性](#1231-free-的重要性)
    - [12.3.2 calloc() 函数](#1232-calloc-函数)
    - [12.3.3 动态内存分配和变长数组](#1233-动态内存分配和变长数组)
  - [12.4 ANSI C类型限定符](#124-ansi-c类型限定符)
    - [12.4.1 const类型限定符](#1241-const类型限定符)
    - [12.4.2 volatile 类型限定符](#1242-volatile-类型限定符)
    - [12.4.3 restrict 类型限定符](#1243-restrict-类型限定符)
    - [12.4.4 _Atomic 类型限定符](#1244-_atomic-类型限定符)

<!-- /TOC -->

## 12.1 存储类别

C提供了多种不同的模型或存储类别在内存中储存数据。   

本书目前所有编程示例中使用的数据都储存在内存中。从硬件方面来看，被储存的每个值都占用一定的物理
内存，C 语言把这样的一块内存称为对象（object）。可以用存储期来描述对象，所谓存储期是指对象在
内存中保留了多长时间。标识符用于访问对象，可以用作用域和链接描述标识符，标识符的作用域和链接表明
了程序的哪些部分可以使用它。不同的存储类别具有不同的存储期、作用域和链接。标识符可以在源代码的
多文件中共享、可用于特定文件的任意函数中、可仅限于特定函数中使用，甚至只在函数中的某部分使用。
对象可存在与程序的执行器，也可以仅存在于它所在函数的执行期。   

### 12.1.1 作用域

作用域描述程序中可访问标识符的区域。一个C变量的作用域可以是块作用域、函数作用域、函数原型作用域
或文件作用域。到目前为止，本书程序示例中使用的变量几乎都具有块作用域。块是用一对花括号括起来的
代码区域。定义在块中的变量具有块作用域（block scope），块作用域变量的可见范围是从定义处到包含
该定义的块的末尾。另外，虽然函数的形式参数声明在函数的左花括号之前，但是它们也具有块作用域，属于
函数体这个块。   

以前，具有块作用域的变量都必须声明在块的开头。C99 标准放宽了这一限制，允许在块中的任意位置声明
变量。为适应这个新特性，C99把块的概念扩展到包括for循环、while循环、do while循环和if语句所控制
的代码，即使这些代码没有用花括号括起来，也算是块的一部分。    

函数作用域仅用于 goto 语句的标签。这意味着即使一个标签首次出现在函数的内层块中，它的作用域也延伸
至整个函数。    

函数原型作用域的范围是从形参定义处到原型声明结束。这意味着，编译器在处理函数原型中的形参时只关心
它的类型，而形参名通过无关紧要。    

变量的定义在函数的外面，具有文件作用域。具有文件作用域的变量，从它的定义处到所在文件的末尾均可见。
由于这样的变量可用于多个函数，所以文件作用域变量也称为全局变量    。。

你认为的多个文件在编译器中可能以一个文件出现。例如，通常在源代码（.c扩展名）中包含一个或多个头
文件（.h扩展名）。头文件会依次包含其他头文件，所以会包含多个单独的物理文件。但是，C预处理器实际
上是用包含的头文件内容替换 \#include 指令。所以，编译器源代码文件和所有的头文件都看成是一个包含信息的单独文件。这个文件被称为翻译单元。描述一个具有文件作用域的变量时，它的实际可见范围是整个翻译
单元。如果程序由多个源代码文件组成，那么该程序也将由多个翻译单元组成。每个翻译单元均对应一个源代码
文件和它所包含的文件。   

### 12.1.2 链接

C变量有3种链接属性：外部链接、内部链接或无链接。具有块作用域、函数作用域或者函数原型作用域的变量
都是无链接变量。这意味着这些变量属于定义它们的块、函数或原型私有。具有文件作用域的变量可以是
**外部链接** 或 **内部链接**。外部链接可以在多文件程序中使用，内部链接变量只能在一个翻译单元中
使用。   

如何知道文件作用域变量是内部链接还是外部链接？可以查看外部定义中是否使用了存储类别说明符 static：   
```c
int giants = 5;   // 文件作用域，外部链接
static int dodgers = 3;  // 文件作用域，内部链接
```   

该文件和同一程序的其他文件都可以使用变量giants。而变量dodgers属文件私有，该文件中的任意函数都可
使用它。    

### 12.1.3 存储期

作用域和链接描述了标识符的可见性。存储期描述了通过这些标识符访问的对象的生存期。C对象有4种存储期：
静态存储期、线程存储期、自动存储期、动态分配存储期。    

如果对象具有静态存储期，那么它在程序的执行期间一直存在。文件作用域变量具有静态存储期。    

线程存储期用于并发程序设计，程序执行可被分为多个线程。具有线程存储期的对象，从被声明时到线程结束
一直存在。以关键字 `_Thread_local` 声明一个对象时，每个线程都获得该变量的私有备份。   

块作用域的变量通常都具有自动存储期。当程序进入定义这些变量的块时，为这些变量分配内存；当退出这个
块时，释放刚才为变量分配的内存。这种做饭相当于把自动变量占用的内存视为一个可重复使用的工作区。   

变长数组稍有不同，它们的存储期从声明处到块的末尾，而不是从块的开始处到块的末尾。   

我们到目前为止使用的局部变量都是自动类别。    

然而，块作用域变量也能具有静态存储期。为了创建这样的变量，要把变量声明在块中，且在声明前面加上关键
字 static：   

```c
void more(int number) {
  int index;
  static int ct = 0;
  ...
  return 0;
}
```    

这里，变量ct储存在静态内存中，它从程序被载入到程序结束期间都存在。但是，它的作用域定义在 more()
函数块中。只要在执行该函数时，程序才能使用 ct 访问它所指定的对象（但是，该函数可以给其他函数提供
该存储区的地址以便间接访问该对象，例如通过指针形参或返回值。   

C使用作用域、链接和存储期为变量定义了多种存储方案。本书不涉及并发程序设计，所以不再赘述这方面的
内容。已分配存储期在本章后面介绍。因此，剩下 5 种存储类别（啥玩意，咋算出的5种啊）：自动、寄存
器、静态块作用域、静态外部链接、静态内部链接。    


存储类别 | 存储期 | 作用域 | 链接 | 声明方式
---------|----------|---------|---------|---------
 自动 | 自动 | 块 | 无 | 块内
 寄存器 | 自动 | 块 | 无 | 块内，使用关键字 register
 静态外部链接 | 静态 | 文件 | 外部 | 所有函数外
 静态内部链接 | 静态 | 文件 | 内部 | 所有函数外，使用关键字 static
 静态无链接 | 静态 | 块 | 无 | 块内，使用关键字 static

所以其实这里是根据作用域、链接和存储期将变量分成了一些存储的类别。   

### 12.1.4 自动变量

属于自动存储类别的变量具有自动存储期、块作用域且无链接。默认情况下，声明在块或函数头中的任何变量都
属于自动存储类别。为了更清楚地表达你的意图（例如，为了表明有意覆盖一个外部变量定义，或者强调不要
把该变量改为其他存储类别），可以显式使用关键字auto，如下所示：    

```c
int main(void) {
  auto int plox;
  return 0;
}
```    

关键字是存储类别说明符。块作用域和无链接意味着只有在变量定义所在的块中才能通过变量名访问该变量。   

变量具有自动存储期意味着，程序在进入该变量声明所在的块时变量存在，程序在退出该块时变量消失。原来
该变量占用的内存位置现在可做他用。    

自动变量不会初始化，除非显示初始化它。   

### 12.1.5 寄存器变量

由于寄存器变量储存在寄存器而非内存中，所以无法获取寄存器变量的地址。绝大多数方面，寄存器变量和
自动变量都一样。也就是说，它们都是块作用域、无链接和自动存储期。使用存储类别说明符 register
便可声明寄存器变量：  

```c
int main(void) {
  register int quick;
```    

声明变量为 register 类别与直接命令相比更像是一种请求。编译器必须根据寄存器或最快可用内存的数量
衡量你的请求，或者直接忽略你的请求，所以可能不会如你所愿。在这种情况下，寄存器变量就变成普通的
自动变量。即使是这样，仍然不能对该变量使用地址运算符。    

在函数头中使用关键字register，便可请求形参是寄存器变量：   

```c
void macho(register int n)
```    

### 12.1.6 块作用域的静态变量

静态变量的静态的意思是该变量在内存中原地不动，并不是说它的值不对。具有文件作用域的变量自动具有
静态存储期。前面提到过，可以创建具有静态存储期、块作用域的局部变量。这些变量和自动变量一样，具有
相同的作用域，但是程序离开它们所在的函数后，这些变量不会消失。也就是说，这些变量具有块作用域、无
链接，但是具有静态存储期。在块中以存储类别说明符 static 声明这种变量。   

```C
#include <stdio.h>

void trystat(void);

int main(void) {
  int count;
  for (count = 1; count <= 3; count++) {
    printf("Here comes iteration %d\n", count);
    trystat();
  }
  return 0;
}

void trystat(void) {
  int fade = 1;
  static int stay = 1;
  printf("fade = %d and stay = %d\n", fade++, stay++);
}
```    

静态变量stay保存了它被递增1后的值，但是fade变量每次都是
1。这表明了初始化的不同：每次调用trystat()都会初始化fade，但是stay只在编译strstat()时被初始化
一次。如果未显式初始化静态变量，它们会被初始化为0。    

`static int stay = 1` 实际上并不是 trystat() 函数的一部分。这是因为静态变量和外部变量在程序
被载入内存时已执行完毕。把这条声明放在 trystat() 函数中是为了告诉编译器只有 trystat() 函数
才能看到该变量。   

### 12.1.7 外部链接的静态变量

外部链接的静态变量具有文件作用域、外部链接和静态存储期。该类别有时被称为外部存储类别，属于该类别的
变量称为外部变量。把变量的定义性声明放在所有函数的外面便创建了外部变量。当然，为了指出该函数使用
了外部变量，可以在函数中用关键字 extern 再次声明。如果一个源代码文件使用的外部变量定义在另一个
源代码文件中，则必须用 extern 在该文件中声明该变量。    

```c
int Errupt;   // 外部定义的变量
double Up[100];   // 外部定义的数组
extern char Coal;     // 如果 Coal 被定义在另一个文件，则必须这样声明
void next(void);

int main(void) {
  extern int Errupt;      // 可选的声明
  extern double Up[];     // 可选的声明
}
```    

注意，在 main() 中声明 Up 数组时不用指明数组大小，因为第1次声明已经提供了数组大小信息。   

外部变量和自动变量类似，也可以被显示初始化。与自动变量不同的是，如果未初始化外部变量，它们会被自动
初始化为0。这一原则也适用与外部定义的数组元素。与自动变量的情况不同，只能使用常量表达式初始化文件
作用域变量：   

```c
int x2 = 2 * x;    // 错误，x是变量
```    

### 12.1.8 内部链接的静态变量

该存储类别的变量具有静态存储期、文件作用域和内部链接。在所有函数外部，用存储类别说明符 static
定义的变量具有这种存储类别：   

```c
static int svil = 1;
```    

### 12.1.9 多文件

复杂的C程序通常由多个单独的源代码文件组成。有时，这些文件可能要共享一个外部变量。C通过在一个文件
中进行定义式声明，然后在其他文件中进行引用式使用来实现共享。也就是说，除了一个定义式声明外，其他
声明都要使用 extern 关键字。而且只有定义式声明才能初始化变量。   

### 12.1.10 存储类别说明符

C语言有6个关键字作为存储类别说明符：auto, register, static, extern, \_Thread\_local 和
typedef。typedef 关键字和任何内存存储无关，把它归于此类有一些语法上的原因。     

auto 说明符表明变量是自动存储期，只能用于块作用域的变量声明中。由于在块中声明的变量本身就具有
自动存储期，所以使用 auto 主要是为了明确表达要使用与外部变量同名的局部变量的意图。    

register 说明符也只用于块作用域的变量，它把变量归为寄存器存储类别，请求最快速度访问该变量。同
时，还保护了该变量的地址不被获取。   

用 static 说明符创建的对象具有静态存储期，载入程序时创建对象,当程序结束时对象消失。如果static
用于文件作用域声明，作用域受限于该文件。如果 static 用于块作用域声明，作用域则受限于该块。因此，
只要程序在运行对象就存在并保留其值，但是只有在执行块内的代码时，才能通过标识符访问。块作用域的
静态变量无链接。文件作用域的静态变量具有内部链接。    

extern 说明符表明声明的变量定义在别处。如果包含 extern 的声明具有文件作用域，则引用的变量必须
具有外部链接。如果包含 extern 的声明具有块作用域，则引用的变量可能具有外部链接或内部链接，这取决
于该变量的定义式声明。    

### 12.1.11 存储类别和函数

函数也有存储类别，可以是外部函数（默认）或静态函数。C99新增了第3种类别——内联函数。外部函数可以被
其他文件的函数访问，但是静态函数只能用于其定义所在的文件。    

```c
double gamma(double);   // 该函数默认为外部函数
static double beta(int, int);
extern double delta(double, int);
```   

在同一个程序中，其他文件中的函数可以调用 gamma() 和 delta()，但是不能调用 beta()。   

## 12.2 随机数函数和静态变量

ANSI C库提供了 rand() 函数生成随机数。生成随机数有多种算法，ANSI C 允许C实现针对特定机器使用
最佳算法。然而，ANSI C标准还提供了一个可移植的标准算法，在不同系统中生成相同的随机数。实际上，
rand() 是“伪随机数生成器”，意思是可预测生成数字的实际序列。   

可移植版本的方案开始于一个“种子”数字。该函数会用该种子生成新的数，这个新数又成为新的种子。然后，
新种子可用于生成更新的种子，以此类推。该方案要行之有效，随机数函数必须记录它上一次被调用时所使用
的种子。这里需要一个静态变量。    

## 12.3 分配内存：malloc()和free()

C可以在程序运行是分配更多的内存。主要的工具是 malloc() 函数，该函数接受一个参数：所需的内存
字节数。malloc() 函数会找到合适的空闲内存块，这样的内存是匿名的。也就是说，malloc() 分配内存，
但是不会为其赋名。然而，它确实返回动态分配内存块的首字节地址。因此，可以把该地址赋给一个指针变量，
并使用指针访问这块内存。因为 char 表示1字节，malloc() 的返回类型通常被定义为指向char的指针。
然而，从 ANSI C标准开始，C使用一个新的类型：指向 void 的指针。该类型相当于一个“通用指针”。
malloc() 函数可用于返回指向数组的指针、指向结构的指针等，所以通常该函数的返回值会被强制转换为
匹配的类型。在 ANSI C 中，应该坚持使用强制类型转换，提高代码的可读性。然而，把指向 void 的指针
赋给任意类型的指针完全不用考虑类型匹配的问题。如果malloc()分配内存失败，将返回空指针。    

```c
double *ptd;
ptd = (double *)malloc(30 * sizeof(double));
```   

注意，指针 ptd 被声明为指向一个 double 类型，而不是指向内含 30 个 double 类型值的块。   

通常，malloc() 要与 free() 配套使用。free() 函数的参数是之前 malloc() 返回的地址，该函数
释放之前 malloc() 分配的内存。因此，动态分配内存的存储期从调用 malloc() 分配内存到 free()
释放内存为止。malloc() 和 free() 的原型都在 stdlib.h 头文件中。   

```c
#include <stdio.h>
#include <stdlib.h>

int main(void) {
  double *ptd;
  int max;
  int number;
  int i = 0;

  puts("What is the maximum number of type double entries?");
  if (scanf("%d", &max) != 1) {
    puts("Number not correctly entered -- bye.");
    exit(EXIT_FAILURE);
  }

  ptd = (double *) malloc(max * sizeof(double));

  if (ptd == NULL) {
    puts("Memory allocation failed. Goodbye.");
    exit(EXIT_FAILURE);
  }

  puts("Enter the values (q to quit):");
  while (i < max && scanf("%lf", &ptd[i]) == 1) {
    ++i;
  }
  printf("Here are your %d entries:\n", number = i);

  for (i = 0; i < number; i++) {
    printf("%7.2f  ", ptd[i]);
    if (i % 7 == 6) {
      putchar('\n');
    }
  }

  if (i % 7 != 0) {
    putchar('\n');
  }
  puts("Done");
  free(ptd);
  return 0;
}
```    

### 12.3.1 free() 的重要性

静态内存的数量在编译时是固定的，在程序运行期间也不会改变。自动变量使用的内存数量在程序执行期间自动
增加或减少。但是动态分配的内存数量只会增加，除非用 free() 进行释放。    

### 12.3.2 calloc() 函数

分配内存还可以使用 calloc()，典型的用法如下：   

```c
long * newmem;
newmem = (long *) calloc(100, sizeof(long));
```   

和 malloc() 类似，在 ANSI 之前，calloc() 也返回指向 char 的指针；在 ANSI 之后，返回指向
void 的指针。如果要储存不同的类型，应使用强制类型转换运算符。calloc() 函数接受两个无符号整数
作为参数。第 1 个参数是所需的存储单元数量，第2个是存储单元的大小（以字节为单位）。    


calloc() 函数有一个特性：它把块中的所有位都设置为0。   

free() 函数也可用于释放 calloc() 分配的内存。   

### 12.3.3 动态内存分配和变长数组

变长数组（VLA）和调用 malloc() 在功能上有些重合。例如，两者都可用于创建在运行时确定大小的数组：  
```c
int vlamal() {
  int n;
  int * pi;
  scanf("%d", &n);
  pi = (int *) malloc (n * sizeof(int));
  int ar[n];
  pi[2] = ar[2] = 5;
  ...
}
```  

不同的是，变长数组是自动存储类型。因此，程序在离开变长数组定义所在的块时，变长数组占用的内存空间会
会被自动释放，不必使用 free()。    

## 12.4 ANSI C类型限定符

我们通常用类型和存储类别来描述一个变量。C90还新增了两个属性：恒常性（constancy）和易变性（volatility）。
这两个属性可以分别用关键字 const 和 volatile 来声明，以这两个关键字创建的类型是限定类型。C99
标准新增了第3个限定符：restrict，用于提高编译器优化。C11标准新增了第4个限定符：_Atomic。

C99 为类型限定符增加了一个新属性：它们现在是幂等的。意思是可以在一条声明中多次使用同一个限定符，
多余的限定符将被忽略：   

```c
const const const int n = 6;   // 与 const int n = 6; 相同
```    

### 12.4.1 const类型限定符

声明普通变量和数组时使用 const 关键字很简单。指针则复杂一些，因为要区分限定指针本身为 const
还是限定指针指向的值为 const，下面的声明：   

```c
const float * pf; // pf 指向一个 float 类型的 const 值
```    

创建了 pf 指向的值不能被改变，而 pf 本身的值可以改变。   

下面的声明：   

```c
float * const pt;   // pt 是一个 const 指针
```   

创建的指针 pt 本身的值不能更改。pt 必须指向同一个地址，但是它所指向的值可以改变。    

还可以把 const 放在第 3 个位置：   

```c
float const * pfc;
```   

简而言之，const 放在 * 左侧任意位置，限定了指针指向的数据不能改变；const 放在 * 的右侧，限定
了指针本身不能改变。   

### 12.4.2 volatile 类型限定符

volatile 限定符告知计算机，代理（而不是变量所在的程序）可以改变该变量的值。通常，它被用于硬件
地址以及在其他程序或同时运行的线程中共享数据。例如，一个地址上可能储存着当前的时钟时间，无论程序
做什么，地址上的值都随时间的变化而改变。或者一个地址用于接受另一台计算机传入的信息。    

```c
volatile int loc1;  // loc1 是一个易变的位置
volatile int * ploc;  // ploc 是一个指向易变的位置的指针
```   

以上代码把 loc1 声明为 volatile 变量，把 ploc 声明为指向 volatile 变量的指针。   

volatile 设计编译器的优化，假设有以下的代码：   

```c
val1 = x;
val2 = x;
```   

智能的（进行优化的）编译器会注意到以上代码使用了两次 x，但并未改变它的值。于是编译器把 x 的值
临时储存在寄存器中，然后在 val2 需要使用 x 时，才从寄存器中读取 x 的值，以节约时间。这个过程
被称为高速缓存。但是如果一些其他代理在以上两条语句之间改变了x的值，就不能这样优化了。如果没有
volatile 关键字，编译器就不知道这种事情是否会发生。因此，为安全起见，编译器不会进行高速缓存。
这是在 ANSI 之前的情况。现在，如果声明中没有volatile关键字，编译器会假定变量的值在使用过程中
不变，然后再尝试优化代码。     

可以同时用 const 和 volatile 限定一个值。例如，通常用const把硬件时钟设置为程序不能更改的变量，
但是可以通过代理改变，这时用volatile。只能在声明中同时使用这两个限定符，它们的顺序不重要。   

### 12.4.3 restrict 类型限定符

restrict 关键字允许编译器优化某部分代码以更好地支持计算。它只能用于指针，表明该指针是访问数据
对象的唯一且初始的方式。考虑下面的代码：   

```c
int ar[10];
int * restrict restar = (int *) malloc(10 * sizeof(int));
int * par = ar;
```   

这里，指针 restar 是访问由 malloc() 所分配内存的唯一且初始的方式。因此，可以用 restrict
关键字限定它。而指针 par 既不是访问 ar 数组中数据的初始方式，也不是唯一方式。所以不用把它设置为
restrict。   

考虑下面的例子：   

```c
for (n = 0; n < 10; n++) {
  par[n] += 5;
  restar[n] += 5;
  ar[n] *= 2;
  par[n] += 3;
  restar[n] += 3;
}
```   

由于之前声明了 restar 是访问它所指向的数据块的唯一且初始的方式，编译器可以把涉及 restar 的
两条语句替换成下面这条语句，效果相同：   

```c
restar[n] += 8;
```   

restrict 限定符还可用于函数形参中的指针。这意味着编译器可以假定在函数体内其他标识符不会修改该
指针指向的数据，而且编译器可以尝试对其进行优化，使其不做别的用途。   

### 12.4.4 _Atomic 类型限定符

发程序设计把程序执行分成可以同时执行的多个线程。这给程序设计带来了新的挑战，包括如何管理访问相同
数据的不同线程。C11通过包含可选的头文件stdatomic.h和threads.h，提供了一些可选的（不是必须实现
的）管理方法。值得注意的是，要通过各种宏函数来访问原子类型。当一个线程对一个原子类型的对象执行
原子操作时，其他线程不能访问该对象。   

例如，下面的代码：   

```c
int hogs;
hogs = 12;
```   

可以替换成：   

```c
_Atomic int hogs;    // hogs 是一个原子类型的变量
atomic_store(&hogs. 12);   // stdatomic.h 中的宏
```   

这里，在hogs中储存12是一个原子过程，其他线程不能访问hogs。    

