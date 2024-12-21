- [第三章 Java 的基本程序设计结构](#第三章-java-的基本程序设计结构)
  - [3.5.4 强制类型转换](#354-强制类型转换)
  - [3.5.9 括号与运算符级别](#359-括号与运算符级别)
  - [3.6 字符串](#36-字符串)
    - [3.6.1 子串](#361-子串)
    - [3.6.2 拼接](#362-拼接)
    - [3.6.5 空串与 Null 串](#365-空串与-null-串)
    - [3.6.9 构建字符串](#369-构建字符串)
  - [3.7 输入与输出](#37-输入与输出)
    - [3.7.1 读取输入](#371-读取输入)
  - [3.8 结构](#38-结构)
    - [3.8.5 switch](#385-switch)
  - [3.9 大数](#39-大数)
  - [3.10 数组](#310-数组)
    - [3.10.3 循环](#3103-循环)
    - [3.10.6 数组排序](#3106-数组排序)
- [第 4 章 对象与类](#第-4-章-对象与类)
  - [4.2 使用预定义类](#42-使用预定义类)
  - [4.3 用户定义类](#43-用户定义类)
  - [4.6 对象构造](#46-对象构造)
    - [4.6.2 默认字段初始化](#462-默认字段初始化)
    - [4.6.7 初始化块](#467-初始化块)
  - [4.7 包 package](#47-包-package)
    - [4.7.1 包名](#471-包名)
    - [4.7.2 类的导入](#472-类的导入)
    - [4.7.3 静态导入](#473-静态导入)
    - [4.7.4 在包中增加类](#474-在包中增加类)
    - [4.7.6 类路径](#476-类路径)
    - [4.7.7 设置类路径](#477-设置类路径)
  - [4.8 JAR 文件](#48-jar-文件)
    - [4.8.2 清单文件](#482-清单文件)
  - [4.9 文档注释](#49-文档注释)

# 第三章 Java 的基本程序设计结构

一共有 8 种基本类型，其中 4 种整型，2 种浮点型，char，boolean。

long 有后缀 L 或 l。float 有后缀 F 或 f。没有后缀的浮点默认是 double。double 的也可以添加后缀 D 或 d。

从 Java7 开始，可以给数字字面量加下划线，1_000_000 就是 1000000。

没有无符号数。

- 无穷大。Double.POSITIVE_INFINITY
- 负无穷大。Double.NEGATIVE_INFINITY。
- NaN。Double.NaN

判断 NaN 和 js 一样，不能用等号。用 Double.isNaN()。

char 类型的字面量值要用单引号括起来。例如：'A' 是编码值为 65 的字符常量。它与"A"不同， "A" 是包含一个字符 A 的字符串。char 类型的值可以表示为十六进制值， 其范围从\u0000 到 \uffff。

char 是 16 位，那对于 32 位编码的字符，就是两个 char 才能表示？？？书上建议平时不要用 char。

从 Java 10 开始，对于局部变量，如果可以从变量的初始值推断出他的类型，就不再需要声明类型。但是需要使用 var 关键字。

```java
var vacation = 12;  // int
var greeting = "Hello" // String
```

这多此一举，var 是必须的，那我不如写类型。

枚举类型。

```java
enum Size {
  SMALL,
  MEDIUM,
  LARGE,
  EXTRA_LARGE
}

Size s = Size.LARGE;
```

int 到 float，long 到 float，long 到 double 都会有精度的丢失。

当用一个二元运算符连接两个值时（例如 n + f，n 是整数，f 是浮点数），先要将两个操作数转换为同一种类型，然后再进行计算（所以不同类型是可以进行运算的）。

- 如果两个数有一个是 double，另一个就转换为 double
- 否则，如果一个是 float，另一个也转换为 float
- 否则，如果一个是 long，另一个也转换为 long
- 否则，都转换为 int

用双括号括起来的都是 String 类的实例。

允许使用 + 连接两个字符串。

当将一个字符串和一个非字符串值进行拼接时，后者会转换成字符串。

使用 equals 方法检测两个字符串是否相等。

String 变量可以存放 null。这是什么奇怪的行为。是所有类型都可以赋值 null 吗。

### 3.5.4 强制类型转换

强制类型转换的语法格式是在圆括号中给出想要转换的目标类型，后面紧跟待转换的变量名。

```java
double x = 9.997;
int nx = (int) x;
```

现在变量 nx 的值为 9.强制类型转换会截断小数部分将浮点值转换为整型。

赋值计算运算符会自动进行类型转换。 `x += 4`。

### 3.5.9 括号与运算符级别

- `[], ., ()`: 即数组元素访问，属性访问，方法调用
- `!, ~, ++, --, +, -, (强制类型转换), new`
- `*, /, %`
- `+, -`
- `<<, >>, >>>`
- `<, <=, >, >=, instanceof`
- `==, !=`
- `&`
- `^`
- `|`
- `&&`
- `||`
- `?:`
- `=, +=, -=, *=, /=, %=, &=, |=, ^=, <<=, >>=, >>>=`

## 3.6 字符串

Java 没有内置的字符串类型，而是在标准 Java 类库中提供了一个预定义类。每个用双括号括起来的字符串都是 String 类的实例。

### 3.6.1 子串

substring 方法提取子串。类似于 JS。

### 3.6.2 拼接

允许使用加号 + 拼接两个字符串。

还可以用 `String.join(" / ", "S", "M", "L", "XL")`

### 3.6.5 空串与 Null 串

String 变量可以存放一个特殊的值，null。表示目前没有任何对象与该变量管理。要检查一个字符串是不是 null `if (str == null)`。

检查一个字符串不是空串和 null。`if (str != null && str.length() !== 0)` 需要先判断不为 null，因为在 null 上调用方法，会报错。

### 3.6.9 构建字符串

如果需要将小段字符串拼接起来，使用 StringBuilder 类。

```java
StringBuilder builder = new StringBuilder();

builder.append(ch);  // appends a single character
builder.append(str); // appends a string
```

在字符串构建完成时就调用 `toString` 方法，将可以得到一个 String 对象，其中包含了构建器中的字符序列。

```java
String completedString = builder.toString();
```

```java
class Builder {
  public static void main(String[] args) {
    StringBuilder builder = new StringBuilder();

    builder.append("123");
    builder.append("456𠮷");

    String str = builder.toString();
    System.out.println(str);
    System.out.println(str.length());  // 8
    System.out.println(str.codePointCount(0, str.length()));  // 7
  }
}
```

- `StringBuilder()`: 构建一个空的字符串构建器
- `int length()`: 返回构建器中的代码单元数量
- `StringBuilder append(String str)`
- `StringBuilder append(char c)`
- `StringBuilder appendCodePoint(int cp)`: 追加一个码点，并将其转换为一个或两个代码单元
- `void setCharAt(int i, char c)`
- `StringBuilder insert(int offset, String str)`
- `StringBuilder insert(int offset, char c)`
- `StringBuilder delete(int startIndex, int endIndex)`
- `String toString()`

## 3.7 输入与输出

### 3.7.1 读取输入

要想通过控制台进行输入，首先需要构造一个与"标准输入流" System.in 关联的 Scanner 对象。

```java
Scanner in = new Scanner(System.in);
```

现在，就可以使用 Scanner 类的各种方法读取输入，例如，nextLine 方法将读取一行输入。

```java
System.out.print("What is your name?");
String name = in.nextLine();
```

在这里，使用 nextLine 方法是因为在输入行中有可能包含空格。要想读取一个单词，可以调用 next 方法。

要想读取一个整数，可以调用 `nextInt` 方法。

```java
import java.util.Scanner;

public class Io {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);

    System.out.println("What is your name?");
    String name = sc.nextLine();
    System.out.println(name);

    System.out.println("What is your first name");
    String firstName = sc.next();
    System.out.println(firstName);

    System.out.println("What is your age?");
    int age = sc.nextInt();
    System.out.println(age);
  }
}
```

看样子呢是回车是结束输入的字符。而且这里有个问题就是，next 这里输入一个单词后，后面的字符就不计入了。但是还有个问题就是，它这个行为有点像好像之前 C 里面那种，就是空格后面再录入的字符，好像放入个缓存区中了，如果后面有读取输入的，会直接从这里取。就比如这里的例子，在 next 部分输入 `dengbo   89` 这样的字符串加整型的组合，不会报错，而且会直接用 89 当成之后的输入，nextInt 那里就直接不用输入了。但是如果后面不是整型，那会直接报错。

## 3.8 结构

### 3.8.5 switch

case 标签可以是：

- char, byte, short, int
- 枚举常量
- 从 Java7 起，可以是字符串

## 3.9 大数

如果基本的整数和浮点数精度不能够满足需求，那么可以使用 java.math 包中两个很有用
的类：BigInteger 和 BigDecimal。这两个类可以处理包含任意长度数宇序列的数值。BigInteger
类实现任意精度的整数运算，BigDecimal 实现任意精度的浮点数运算。

使用静态的 valueOf 方法可以将普通的数值转换为大数。

```java
BigInteger a = BigInteger.valueOf(100);
```

对于更大的数，可以使用一个带字符串参数的构造器：

```java
BigInteger reallyBig = new BigInteger("2223234546576573445345346563");
```

不能使用常见的算数运算符处理，使用大数类中的 add 和 multiply 方法。

```java
BigInteger a = BigInteger.valueOf(100);
BigInteger b = new BigInteger("24323");

BigInteger c = a.add(b);
BigInteger d = c.multiply(b.add(BigInteger.valueOf(2)));
```

## 3.10 数组

```java
int[] a;
int[] abc = new int[100];
int[] smallPrimes = { 2, 3, 5, 7, 11, 13 };
smallPrimes = new int[] { 11, 13, 15, 17, };
```

数组长度不要求是常量，`new int[n]` 会创建一个长度为 n 的数组。

一旦创建了数组，就不能再改变它的长度。

创建一个数字数组时，所有元素都初始化为 0。boolean 数组的元素会初始化为 false。对象数组元素则是 null。

### 3.10.3 循环

还有一种循环结构，可以用来依次处理数组（或者其他元素集合）中的每个元素，而不必考虑指定下标值：

```java
for (variable : collection) statement
```

迭代器呗。collection 笔试是一个实现了 Iterable 接口的的类对象或数组。

### 3.10.6 数组排序

```java
Arrays.sort(a);
```

Arrays 上的常用方法：

- sort
- binarySearch
- fill
- equals
- copyOf
- copyOfRange
- asList
- hashCode
- toString
- setAll
- stream

# 第 4 章 对象与类

## 4.2 使用预定义类

所有的 Java 对象都存储在堆中。

## 4.3 用户定义类

请注意，不要在构造器中定义与实例字段同名的局部变量。因为变量声明会覆盖掉同名的实例字段。导致赋值没有在实例字段上生效。

## 4.6 对象构造

### 4.6.2 默认字段初始化

如果在构造函数中没有显式地为字段设置初值，那么就会被自动地赋为默认值：数值为 0、布尔值为 false，对象为 null。

局部变量必须明确地初始化，但是在类中，如果没有初始化类中的字段，将会自动初始化为默认值。

在构造函数中，使用 `this()` 相当于又一次调用了一个构造函数。不过感觉需要注意的是，这肯定需要加附加条件，不然就陷入循环了。

### 4.6.7 初始化块

前面已经讲过两种初始化数据字段的方法：

- 在构造函数中设置值
- 在声明中赋值

实际上还有第三种机制，初始化块，在一个类的声明中，可以包含任意多个初始化块。只要构造这个类的对象，这些块就会被执行。

```java
public class Employee {
  private static int nextId;
  private String name;
  private double salary;
  private int id;
  private LocalDate hireDay;

  {
    id = nextId;
    nextId++;
  }
}
```

话说，那就是在初始化块中，静态和实例变量都可以直接访问，试了一下，好像不允许有重名的静态和实例变量。

## 4.7 包 package

### 4.7.1 包名

使用包的主要原因是确保类名的唯一性。事实上，为了保证包名的绝对唯一性，要用一个因特网域名以逆序的形式作为包名，然后对于不同的工程使用不同的子包（子包又是啥）。例如，考虑域名 horstmann.com。如果逆序来写，就得到了包名 com.horstmann。然后可以追加一个工程名，如 com.horstmann.corejava。如果再把 Employee 类放在这个包里，那么这个类的 ”完全限定“ 名就是 com.horstmann.corejava.Employee。

### 4.7.2 类的导入

一个类可以使用所属包中的所有类，以及其他包中的公共类。

我们可以采用两种方式访问另一个包中的公共类。第一种方式就是使用完全限定名称。

```java
java.time.LocalDate today = java.time.LocalDate.now();
```

更简单常用的方式是 import。可以使用 import 语句导入一个特定的类或者整个包。

```java
import java.time.*;
```

话说这种情况下，出现同名的类怎么办。可以吗，感觉可以，但是覆盖的规则怎么定不是很确定。

发生命名冲突的场景，java.util 和 java.sql 都有 Date 类，如果在程序中导入了这两个包：

```java
import java.util.*;
import java.sql.*;
```

这时候使用 Date 类的时候会报错。

需要加一个特定的 import 来表示使用的是哪一个。

```java
import java.util.*;
import java.sql.*;
import java.util.Date;
```

### 4.7.3 静态导入

import 支持导入静态方法和静态字段，而不只是类。

```java
import static java.lang.System.*;
```

就可以使用 System 类的静态方法和静态字段，而不用加类名前缀。

### 4.7.4 在包中增加类

要想将类放入包中，就必须将包的名字放在源文件的开头（哈？为什么不是默认就在报中，这是相当于 export？也不太一样，export 只是声明这个文件的导出，这里 package 相当于在整个包中导出）。

```java
package com.horstmann.corejave; // corejava 不是说是个工程名吗

public class Employee {

}
```

如果没有在源文件中放置 package 语句，这个源文件中的类就属于无名包。

### 4.7.6 类路径

类文件可以存储在 JAR 文件中，在一个 JAR 文件中，可以包含多个压缩形式的类文件和子目录，这样既可以节省空间又可以改善性能。

### 4.7.7 设置类路径

使用 `-classpath, -cp` 选项指定类路径。也可以设置 CLASSPATH 环境变量。

说实话，这块乱七八糟还是没看到，类，包，工程，目录，类路径都是什么关系。

## 4.8 JAR 文件

jar 命令制作 JAR 文件。

```bash
jar cvf jarFileName file1 file2 ...

jar cvf CalculatorClasses.jar *.class icon.gif
```

### 4.8.2 清单文件

每个 JAR 文件包含一个清单文件 manifest。命名为 MANIFEST.MF，位于 JAR 文件的 META-INF 子目录中。

## 4.9 文档注释

- `@param variable description`
- `@return description`
- `@throw class description`
- `@author name`
- `@version text`
