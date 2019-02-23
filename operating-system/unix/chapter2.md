# 第 2 章 UNIX 标准及实现

## 2.2 UNIX 标准化

### 2.2.1 ISO C

ANSI 是美国国家标准学会（American National Standards Institute）的缩写，它是国际标准化组
织（International Organization for Standardization， ISO）中代表美国的成员。IEC是国际
电⼦技术委员会（International Electrotechnical Commission）的缩写。   

按照 C99 标准定义的各个头文件，可将 ISO C 库分成 24 个区。POSIX.1 标准包括这些头文件以及另外
一些头文件。所有这些头文件在 4 种 UNIX 实现（FreeBSD 8.O, Linux 3.2.0, Mac OS X 10.6.8,
Solaris 10）中都支持。   

- asserr.h: 验证程序断言
- complex.h: 复数算术运算支持
- ctype.h: 字符分类和映射支持
- errno.h: 出错码
- fenv.h: 浮点环境
- float.h: 浮点常量及特性
- inttypes.h: 整型格式变换
- iso646.h: 赋值、关系及一元操作符宏
- limits.h: 实现常量
- locale.h: 本地化类别及相关定义
- math.h: 数学函数、类型声明及常量
- setjmp.h: 非局部 goto
- signal.h: 信号
- stdarg.h: 可变长度参数表
- stdbool.h: 布尔类型和值
- stddef.h: 标准定义
- stdint.h: 整型
- stdio.h: 标准 IO 库
- stdlib.h: 实用函数
- string.h: 字符串操作
- tgmath.h: 通用类型数学宏
- time.h: 时间和日期
- wchar.h: 扩充的多字节和宽字符支持
- wctype.h: 宽字符分类和映射支持    

