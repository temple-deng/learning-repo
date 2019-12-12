# 第 14 章 结构和其他数据形式

<!-- TOC -->

- [第 14 章 结构和其他数据形式](#第-14-章-结构和其他数据形式)
  - [14.2 建立结构声明](#142-建立结构声明)
  - [14.3 定义结构变量](#143-定义结构变量)
    - [14.3.1 初始化结构](#1431-初始化结构)
    - [14.3.2 访问结构成员](#1432-访问结构成员)
    - [14.3.3 结构的初始化器](#1433-结构的初始化器)
  - [14.5 嵌套结构](#145-嵌套结构)
  - [14.6 指向结构的指针](#146-指向结构的指针)
  - [14.7 向函数传递结构的信息](#147-向函数传递结构的信息)
    - [14.7.1 复合字面量和结构（C99）](#1471-复合字面量和结构c99)
    - [14.7.2 伸缩性数组成员（C99）](#1472-伸缩性数组成员c99)
    - [14.7.3 匿名结构（C11）](#1473-匿名结构c11)
  - [14.10 联合简介](#1410-联合简介)
    - [14.10.1 匿名联合（C11）](#14101-匿名联合c11)
  - [14.11 枚举类型](#1411-枚举类型)
    - [14.11.1 共享名称空间](#14111-共享名称空间)
  - [14.12 typedef 简介](#1412-typedef-简介)
  - [14.14 函数和指针](#1414-函数和指针)

<!-- /TOC -->

## 14.2 建立结构声明

结构声明描述了一个结构的组织布局。声明类似下面这样：    

```c
struct book {
  char title[MAXTITL];
  char author[MAXAUTL];
  float value;
}
```    

关键字 struct 表明跟在其后的是一个结构，后面是一个可选的标记，稍后程序中可以使用该标记引用该结构。
所以，我们在后面的程序中可以这样声明：   

```c
struct book library;
```   

结构体声明右花括号后面的分号是声明所必需的，表示结构布局定义结束。可以把声明放在所有函数的外部，
也可以放在一个函数定义的内部。如果把结构声明置于一个函数的内部，它的标记就只限于该函数内部使用。
如果把声明置于函数的外部，那么该声明之后的所有函数都能使用它的标记。    

结构的标记名是可选的。但是以程序示例中的方式建立结构时（在一处定义结构布局，在另一处定义实际的结构
变量），必须使用标记。    

## 14.3 定义结构变量

就计算机而言，下面的声明：   

```c
struct book library;
```    

是以下声明的简化：    

```c
struct book {
  char title[MAXTITL];
  char author[MAXAUTL];
  float value;
} library;
```    

换⾔之，声明结构的过程和定义结构变量的过程可以组合成⼀个步骤。如下所⽰，组合后的结构声明和结构
变量定义不需要使⽤结构标记:    

```c
struct {
  char title[MAXTITL];
  char author[MAXAUTL];
  float value;
} library;
```    

然而，如果打算多次使用结构模板，就要使用带标记的形式；或者使用本章后面介绍的 typedef。    

### 14.3.1 初始化结构

```c
struct book library = {
  "The Pious Pirate and the Devious Damsel",
  "Renee Vicotte",
  1.95
};
```   

各初始化项用逗号分隔。    

### 14.3.2 访问结构成员

结构类似于一个“超级数组”，这个超级数组中，可以是一个元素为 char 类型，下一个元素为 float 类型，
下一个元素为 int 数组。使用结构成员运算符——点（.）访问结构中的成员。    

### 14.3.3 结构的初始化器

C99 和 C11 为结构提供了指定初始化器，其语法与数组的指定初始化器类似。但是，结构的指定初始化器
使用点运算符和成员名标识特定的元素。例如，只初始化 book 结构的 value 成员，可以这样做：   

```c
struct book surprise = {.value = 10.99};
```    

可以按照任意顺序使用指定初始化器：   

```c
struct book gift = {
  .value = 25.99,
  .author = "James Broadfool",
  .title = "Rue for the Toad"
};
```   

与数组类似，在指定初始化器后⾯的普通初始化器，为指定成员后⾯的成员提供初始值。另外，对特定成员的
最后⼀次赋值才是它实际获得的值。例如，考虑下⾯的代码：    

```c
struct book gift = {
  .value = 18.90,
  .author = "Philionna Pestle",
  0.25
};
```    

赋给 value 的值是 0.25，因为它在结构声明中紧跟在 author 成员之后。    

## 14.5 嵌套结构

```c
#define LEN 20
struct names {
  char first[LEN];
  char last[LEN];
};

struct guy {
  struct names handle;
  char favfood[LEN];
  char job[LEN];
  float income;
};
```    


## 14.6 指向结构的指针

和数组不同的是，结构名并不是结构的地址。   

```js
him = &fellow[0];

him->income;  // fellow[0].income
(*him).income;   // fellow[0].income
```    

. 运算符的优先级比 `*` 优先级高。    

插播一点优先级：    

- 1.
  + `--, ++`: 后缀自增与自减
  + `()`: 函数调用
  + `[]`: 数组下标
  + `.`: 结构与联合成员访问
  + `->`: 结构与联合体指针成员访问
  + `(type)(list)`: C99 复合字面量
- 2.
  + `--, ++`: 前缀自增/减
  + `-, +`: 一元加减
  + `!, ~`: 逻辑非与逐位非
  + `(type)`: 强制类型转换
  + `*`: 解引用
  + `&`: 取址
  + `sizeof`:
  + `_Alignof`
- 3. `*, /, %`
- 4. `+, -`
- 5. `<<, >>`
- 6. `<, <=, >, >=, ==, !=`
- 7. `&, ^, |`
- 8. `&&, ||`
- 9. `? :`
- 10. 各种赋值
- 11. 逗号

## 14.7 向函数传递结构的信息

ANSI C 允许把结构作为参数使用，所以程序员可以选择是传递结构本身，还是传递指向结构的指针。    

现在的 C 允许把一个结构赋值给另一个结构，但是数组不能这样做。也就是说，如果 n_data 和 o_data
都是相同类型的结构，可以这样做：   

```c
o_data = n_data;
```    

这条语句把n_data的每个成员的值都赋给o_data的相应成员。即使成员是数组，也能完成赋值。    

### 14.7.1 复合字面量和结构（C99）

C99 的复合字⾯量特性可⽤于结构和数组。如果只需要⼀个临时结构值，复合字⾯量很好⽤。例如，可以使⽤
复合字⾯量创建⼀个数组作为函数的参数或赋给另⼀个结构。语法是把类型名放在圆括号中，后⾯紧跟⼀个⽤
花括号括起来的初始化列表。    

```c
(struct book){"The idiot", "Fyodor", 6.99};
```    

复合字⾯量在所有函数的外部，具有静态存储期；如果复合字⾯量在块中，则具有⾃动存储期。    

### 14.7.2 伸缩性数组成员（C99）

C99新增了⼀个特性：伸缩型数组成员（flexible array member），利⽤这项特性声明的结构，其最后
⼀个数组成员具有⼀些特性。第1个特性是，该数组不会⽴即存在。第2个特性是，使⽤这个伸缩型数组成员
可以编写合适的代码，就好像它确实存在并具有所需数⽬的元素⼀样。     

⾸先，声明⼀个伸缩型数组成员有如下规则：  

- 伸缩型数组成员必须是结构的最后⼀个成员；  
- 结构中必须⾄少有⼀个成员；  
- 伸缩数组的声明类似于普通数组，只是它的⽅括号中是空的。    

实际上，C99的意图并不是让你声明 `struct flex` 类型的变量，⽽是希望你声明⼀个指向`struct flex`
类型的指针，然后⽤ `malloc()` 来分配⾜够的空间，以储存 `struct flex` 类型结构的常规内容和
伸缩型数组成员所需的额外空间。    

```c
struct flex {
  int count;
  double average;
  double scores[];
}

struct flex * pf;
pf = malloc(sizeof(struct flex) + 5 * sizeof(double));

pf->count = 5;
pf->scores[2] = 18.5;
```

带伸缩型数组成员的结构确实有⼀些特殊的处理要求。第⼀，不能⽤结构进⾏赋值或拷贝：   

```c
struct flex * pf1, * pf2;

*pf2 = *pf1;   // 不要这样做
```    

这样做只能拷贝除伸缩型数组成员以外的其他成员。    

第⼆，不要以按值⽅式把这种结构传递给结构。原因相同，按值传递⼀个参数与赋值类似。要把结构的地址
传递给函数。    

第三，不要使⽤带伸缩型数组成员的结构作为数组成员或另⼀个结构的成员。    

### 14.7.3 匿名结构（C11）

```c
struct person {
  int it;
  struct {
    char first[20];
    char last[20];
  };
};

struct person ted = {8483, {"Ted", "Grass"}};

puts(ted.first);
```     


## 14.10 联合简介

联合（union）是⼀种数据类型，它能在同⼀个内存空间中储存不同的数据类型（不是同时储存）。     

创建联合和创建结构的⽅式相同，需要⼀个联合模板和联合变量。可以⽤⼀个步骤定义联合，也可以⽤联合
标记分两步定义。    

```c
union hold {
  int digit;
  double bigfl;
  char letter;
};

union hold valA;
valA.letter = 'R';
union hold valB = valA;
union hold valC = {88};
union hold valD = {.bigfl = 15.82};
```   

和⽤指针访问结构使⽤ `->` 运算符⼀样，⽤指针访问联合时也要使⽤ `->` 运算符。   

### 14.10.1 匿名联合（C11）

```c
struct owner {
  char socsecuruty[12];
  ...
};

struct leasecompany {
  char name[40];
  char headquarters[40];
  ...
};

struct car_data {
  char make[15];
  int status;
  union {
    struct owner owncar;
    struct leasecompany leasecar;
  };
};

flits.owncar.socsecurity = "honda";
```    

## 14.11 枚举类型

可以⽤枚举类型（enumerated type）声明符号名称来表⽰整型常量。使⽤enum关键字，可以创建⼀个
新“类型”并指定它可具有的值（实际上，enum常量是int类型，因此，只要能使⽤int类型的地⽅就可以使⽤
枚举类型）。枚举类型的⽬的是提⾼程序的可读性。它的语法与结构的语法相同。     

```c
enum spectrum {red, orange, yellow, green, blue, violet};
enum spectrum color;
```   

虽然枚举符（如red和blue）是int类型，但是枚举变量可以是任意整数类型，前提是该整数类型可以储存枚举常量。   

在枚举声明中，可以为枚举常量指定整数值：    

```c
enum levels {low = 100, medium = 500, high = 2000};
```     

### 14.11.1 共享名称空间

名称空间是分类别的。在特定作⽤域中的结构标记、联合标记和枚举标记都共享相同的名称空间，该名称空间
与普通变量使⽤的空间不同。这意味着在相同作⽤域中变量和标记的名称可以相同，不会引起冲突，但是不能
在相同作⽤域中声明两个同名标签或同名变量。     

```c
struct rect { double x; double y;};
int rect;    // 不会产生冲突
```     

## 14.12 typedef 简介

```c
typedef unsigned char BYTE;
BYTE x, y[10], *z;
```    

该定义的作⽤域取决于 `typedef` 定义所在的位置。如果定义在函数中，就具有局部作⽤域，受限于定义
所在的函数。如果定义在函数外⾯，就具有⽂件作⽤域。    

`typedef` 的⼀些特性与 `#define` 的功能重合（这个还真没见过）：   

```c
#define BYTE unsigned char;
```     


还可以把 `typedef` ⽤于结构：    

```c
typedef struct complex {
  float real;
  float imag;
} COMPLEX;
```    

用 `typedef` 来命名一个结构类型时，可以省略改结构的标签：   

```c
typedef struct {double x; double y;} rect;
```    

## 14.14 函数和指针

函数指针常⽤作另⼀个函数的参数，告诉该函数要使⽤哪⼀个函数。函数也有地址，因为函数的机器语⾔实现
由载⼊内存的代码组成。指向函数的指针中储存着函数代码的起始处的地址。   

声明⼀个函数指针时，必须声明指针指向的函数类型。为了指明函数类型，要指明函数签名，即函数的返回
类型和形参类型。     

```c
void toUpper(char *);
void (*pf)(char *);
```    

声明了函数指针后，可以把类型匹配的函数地址赋给它。在这种上下⽂中，函数名可以⽤于表⽰函数的地址：   

```c
void toUpper(char *);
void toLower(char *);
int round(double);

void (*pf)(char *);
pf = toUpper;
pf = toLower;
pf = round;   // 无效，round 与指针类型不匹配
pf = toLower();    // 无效，toLower()不是地址
```     

既然可以⽤数据指针访问数据，也可以⽤函数指针访问函数。奇怪的是，有两种逻辑上不⼀致的语法可以这样做：   

```c
void toUpper(char *);
void toLower(char *);
void (*pf)(char *);

char mis[] = "Nina Metier";

pf = toUpper;
(*pf)(mis);

pf = toLower;
pf(mis);
```   

