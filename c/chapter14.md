# 第 14 章 结构和其他数据形式

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

## 14.4 结构数组

