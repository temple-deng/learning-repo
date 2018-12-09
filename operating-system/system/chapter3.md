# 第 3 章 完善 MBR

<!-- TOC -->

- [第 3 章 完善 MBR](#第-3-章-完善-mbr)
  - [3.1 地址、section、vstart](#31-地址sectionvstart)
    - [3.1.1 什么是地址](#311-什么是地址)
    - [3.1.2 什么是 section](#312-什么是-section)
  - [3.2 CPU 的实模式](#32-cpu-的实模式)
    - [3.2.1 CPU 的工作原理](#321-cpu-的工作原理)
    - [3.2.2 实模式下的寄存器](#322-实模式下的寄存器)
    - [3.2.3 实模式下内存分段由来](#323-实模式下内存分段由来)
    - [3.2.4 实模式下 CPU 内存寻址方式](#324-实模式下-cpu-内存寻址方式)
    - [3.2.5 栈](#325-栈)
    - [3.2.6 实模式下的 ret](#326-实模式下的-ret)
    - [3.2.7 实模式下的 call](#327-实模式下的-call)
    - [3.2.8 实模式下的 jmp](#328-实模式下的-jmp)
    - [3.2.9 标志寄存器 flags](#329-标志寄存器-flags)
    - [3.2.11 实模式小结](#3211-实模式小结)
  - [3.3 外设简介](#33-外设简介)
    - [3.3.1 CPU 如何与外设通信——IO接口](#331-cpu-如何与外设通信io接口)
    - [3.3.2 显卡概述](#332-显卡概述)

<!-- /TOC -->

## 3.1 地址、section、vstart

### 3.1.1 什么是地址

编译器给程序中各符号（变量名或函数名等）分配的地址，就是各符号相对于文件开头的偏移量。   

### 3.1.2 什么是 section


行号 | 源码 | 地址 | 地址处的内容：机器码或数据 | 反汇编代码
---------|----------|---------|---------|---------
 1 | section code | | | 
 2 | mov ax, $$ | 00000000 | B80000 | mov ax, 0x0
 3 | mov ax, section.data.start | 00000003 | B81000 | mov ax, 0x10
 4 | mov ax, \[var1\] | 00000006 | A11000 | mov ax, \[0x10\]
 5 | mov ax, \[var2\] | 00000009 | A11400 | mov ax, \[0x14\]
 6 | label: jmp label | 0000000C | EBFE | jmp short 0xc
 7 | | 0000000E | 0000 |
 8 | section data | | | 
 9 | var1 dd 0x4 | 00000010 | 0400 |
 10 | | 00000012 | 0000 |
 11 | var2 dw 0x99 | 00000014 | 99 |
 12 | | 00000015 | 00 |


第 3 行中用到了 section.data.start，其用法是 section.节名.start，这里是获得名为 data
的 section 在本文件中的真实偏移，即起始地址，是 NASM 提供的伪指令。    

## 3.2 CPU 的实模式

实模式是指 8086 CPU 的寻址方式、寄存器大小、指令用法等。   

### 3.2.1 CPU 的工作原理

CPU 大体上可以划分为 3 个部分，分别是控制单元、运算单元、存储单元。    

控制单元是 CPU 的控制中心，CPU 需要经过它的帮忙才知道自己下一步要做什么。而控制单元大致
又指令寄存器 IR(Instruction Register)、指令译码器 ID(Instruction Decoder)、操作控制
器 OC(Operation Controller) 组成。程序被加载到内存后，也就是指令这时都在内存中了，指令
指针寄存器 IP 指向内存中下一条待执行指令的地址，控制单元根据 IP 寄存器的指向，将位于内存
中的指令逐个装载到指令寄存器，但它还是不知道这些指令是什么，在它眼里 0101 串此时还没有
实际意义。然后指令译码器将位于指令寄存器中的指令按照指令格式来解码，分析出操作码是什么，
操作数在哪里之类的。下面是指令的一般格式。    

前缀——操作码——寻址方式、操作数类型——立即数——偏移量。    

存储单元是指 CPU 内部的 L1、L2 缓存及寄存器，待处理的数据就存放在这些存储单元中，这里的
数据是说指令中的操作数。    

操作码有了，操作数有了，就差执行指令了，随后 “操作控制器” 给相关部件发信号。   

运算单元负责算术运算和逻辑运算，它从控制单元那里接受命令（信号）并执行。    

### 3.2.2 实模式下的寄存器

CPU 中的寄存器大致上分为两大类。   

+ 一类是其内部使用的，对程序员不可见。比如全局描述符表寄存器 GDTR、中断描述符表寄存器 IDTR、
局部描述符表寄存器 LDTR、任务寄存器 TR、控制寄存器 CR0-3、指令指针寄存器 IP、标志寄存器
flags、调试寄存器 DR0-7.
+ 另一类是对程序员可见的寄存器。我们进行汇编语言程序设计时，能够直接操作的就是这些寄存器，
如段寄存器、通用寄存器。   

虽说第一类寄存器是不可见的，但是其中一部分寄存器的初始化依赖于我们完成。比如 GDTR 需要
通用使用 `lgdt` 指令为其指令全局描述符表的地址及偏移量。IDTR 需要通过 `lidt` 指令为其
指定中断描述符表的地址。而局部描述符表寄存器 LDTR，可以用 `lgdt` 指针为其指定局部描述符
表 ldt。对于 TR，需要用 `ltr` 指令为其指定一个任务状态段 tss。    

在实模式下，默认用到的寄存器都是 16 位宽的。    

### 3.2.3 实模式下内存分段由来

实模式的 “实” 体现在：程序中用到的地址都是真实的物理地址，“段基址：段内偏移” 产生的逻辑
地址就是物理地址，也就是程序员看到的完全是真实的内存。    

8086 的地址总线是 20 位宽，也就是其寻址范围是 1MB，但其内部寄存器都是 16 位的，若用单一
寄存器来寻址的话，只能访问到 2 的 16 次方等于 64KB 的空间。    

### 3.2.4 实模式下 CPU 内存寻址方式

寻址方式，从大方向来看可以分为三大类：   

1. 寄存器寻址
2. 立即数寻址
3. 内存寻址   

在第 3 种内存寻址中又分为：   

1. 直接寻址
2. 基址寻址
3. 变址寻址
4. 基址变址寻址    


+ 寄存器寻址   

最直接的寻址方式就是寄存器寻址，它是指操作数在寄存器中，直接从寄存器中取数据即可。   

```asm
mov ax, 0x10
mov dx, 0x9
mul dx
```   

只要牵扯到寄存器的操作，无论其是源操作数，还是目的操作数，都是寄存器寻址。上面的前两条
指令，它们的源操作数都是立即数，所以也属于立即数寻址。   

+ 立即数寻址    

略。   

+ 内存寻址

操作数在内存中的寻址方式成为内存寻址。    

+ 直接寻址    

直接寻址，就是直接将在操作数中给出的数字作为内存地址，通过中括号的形式告诉 CPU，取此地址
中的值作为操作数，如：   

```asm
mov ax, [0x1234]
mov ax, [fs:0x5678]
```    

0x1234 是段内偏移地址，默认的段地址是 DS。第二条指令中，由于使用了段跨越前缀 fs，0x5678
的段基址则变成了 gs 寄存器（what，这里是不是写错了，到底哪个是 fs 哪个是 gs）。    

+ 基址寻址    

基址寻址就是在操作数中用 bx 寄存器或 bp 寄存器作为地址的起始，地址的变化以它为基础。在
实模式下只能使用 bx, bp，在保护模式下就没这个限制了。   

bx 寄存器的默认段寄存器是 DS，而 bp 寄存器的默认段寄存器是 SS。    

+ 变址寻址    

变址寻址和基址寻址类似，只是寄存器由 bx, bp 换成了额 si 和 di。两个寄存器的默认段寄存器
也是 ds。   

```asm
mov [di], ax
mov [si+0x1234], ax
```    

+ 基址变址寻址    

从名字上看，这是基址寻址和变址寻址的结合，即基址寄存器 bx 或 bp 加一个变址寄存器 si 或 di:   

```asm
mov [bx+di], ax
add [bx+si], ax
```    

### 3.2.5 栈

栈顶（SP指针）是栈的出口和入口，它指向的内存中存储的始终是最新的数据。push 和 pop 就是
操作这个指针所指向的内存。push 压入数据的过程是：先将 SP 减去字长，所得的差再存入 SP，
栈顶在此被更新，这样栈顶就指向了栈中下一个存储单元的位置。再将数据压入 SP 指向的新的内存
地址。pop 指令相反。    

### 3.2.6 实模式下的 ret

调用 call 指令，CPU 要在栈中保存程序计数器 PC 的值，在 x86 中就是 cs:ip，具体是保存
ip 部分还是 cs, ip 都保存，要看目标函数的段基址是否和当前段基址一致，也就是说，是否
跨段访问了。    

ret 指令的功能是在栈顶弹出 2 字节的内容来替换 IP 寄存器。ret 只置换了 IP 寄存器，也就是
说，不用换段基址，属于近返回。既然我们称之为弹出栈，也就是说 ret 指令也要负责维护栈顶
指针，故 ret 指令会使 SP 指针 +2.    

retf(return far) 是从栈顶取得 4 字节，栈顶处的 2 字节用来替换 IP 寄存器，另外 2 字节
用来替换 CS 寄存器。retf 会使 SP 指针 +4。    

### 3.2.7 实模式下的 call

在 8086 处理器中，有两个指针用于改变程序流程，一个是 jmp，另一个是 call。    

在实模式下，call 指令调用函数有 4 种方式，两种近调用，两种远调用：    

+ 相对近调用    

不用改变段基址的调用就是近调用，即在同一个段内，不用切换段，相对的意思是，由于在一个代码
段中，所以只要给出目标函数的相对地址即可。    

`call near 立即数地址`，指令中的立即数地址可以是被调用的函数名、标号、立即数，函数名同
标号一样。    

首先用目标函数的地址减去当前 call 指令的地址，所得的差再减去 call 指令机器码的大小，
最终的结果便是 call 指令中的操作数，即与目标地址的相对地址增量。   

例如 call 在 52，函数在 100，那计算结果就是 45，而 call 下条指令是 55，即下条指令到
函数之间的距离。   

+ 间接绝对近调用

间接是指目标函数的地址并没有直接给出，地址要么在寄存器中，要么在内存中。绝对是指目标函数的
地址是绝对地址。    

`call 寄存器寻址/内存寻址`。    

+ 直接绝对远调用

`call far 段基址(立即数): 段内偏移地址(立即数)`。    

+ 间接绝对远调用    

段基址和段内偏移地址在内存中。在该内存中的内容大小是 4 字节，此内容便是地址，前（低）2 字节
是段内偏移地址，后（高）2字节是段基址。    

### 3.2.8 实模式下的 jmp

和 call 一样，按是否跨段来划分，大致分为两类，近转移、远转移，不过在转移方式中，还有个
更近的，叫短转移。    

一共有 5 类转移方式：   

+ 相对短转移。`jmp short 立即数地址`。相对短转移机器码大小为 2 字节，操作码占 1 字节，
所以操作数就 1 字节，因此短体现在跳转的范围只能是 1 字节带符号数所能表示的范围。
+ 相对近转移。操作数范围变大，变为 16 位即 2 字节。`jmp near 立即数地址`。
+ 间接绝对近转移。`jmp near 寄存器寻址/内存寻址`，注意一下call 和 jmp 中近间接寻址中内存
都是以 DS 为段基址的
+ 直接绝对远转移。`jmp 立即数形式的段基址：立即数形式的段内偏移地址`
+ 间接绝对远转移。`jmp far 内存寻址`

### 3.2.9 标志寄存器 flags

![flags](https://raw.githubusercontent.com/temple-deng/markdown-images/master/system/flags.png)    

+ 第 0 位 CF 位，即 Carry Flag，进位标志，运算中，数值的最高位有可能是进位，也有可能是
借位，所以 carry 表示这两种状态，不管进位还是借位，CF 都是置 1。可用于检测无符号数加减法
有否有溢出，因为 CF 为 1 时，也就是最高位有进位或借位，肯定是溢出
+ 第 2 位是 PF 位，即 Parity Flag，奇偶位。用于标记结果低 8 位中 1 的个数，如果为偶数，
PF 位为 1，否则为 0。用于数据传输开始时和结束后的对比，判断传输过程中是否出现了错误
+ 第 4 位 AF 位，即 Auxiliary carry Flag，辅助进位标志。用来记录运算结果低 4 位的进、近
位情况，即若低半字节有进、借位，AF 为 1
+ 第 6 位 ZF 位，即 Zero Flag。计算结果为 0，标志为 1.
+ 第 7 位 SF 位，即 Sign Flag。运算结果为负，SF 为 1.
+ 第 8 位 TF 位，即 Trap Flag，陷阱标志位。若置位，用于让 CPU 进入单步运行方式，否则
就是连续工作的方式。平时使用的 debug 程序，在单步调试时，原理上就是让 TF 位为 1.
+ 第 9 位 IF 位，即 Interrupt Flag，中断标志位。IF 位置位，表示中断开启，CPU 可以响应
外部可屏蔽中断。若为 0，表示中断关闭，不再响应外部可屏蔽中断。
+ 第 10 位 DF 位，即 Direction Flag，方向标志位。用于字符串操作指令中，当 DF 为 1时，
指令中的操作数地址会自动减少一个单位，DF 为 0时，操作数地址会自动增加一个单位
+ 第 11 位 OF 位，即 Overflow Flag，溢出标志位。用来标识计算的结果是否超过了数据类型
可表示的范围，若 OF 为 1，表示有溢出，用于检测有符号数运算结果是否有溢出    

以下标志位仅在 80286 以上 CPU 中有效，相对于 8088，它支持特权级和多任务。    

+ 第 12-13 位 IOPL，即 Input Ouput Privilege Level
+ 第 14 位 NT，即 Nest Task，任务嵌套标志位。当一个任务中又嵌套调用了另一个任务（进程）
时，此 NT 位为 1


以下标志位仅用于 80386 以上的 CPU。    

+ 第 16 位 RF 位，Resume Flag，恢复标志位。用于程序调试，指示是否接受调试故障，它需要
和调试寄存器一起使用，当 RF 为 1 时忽略调试故障
+ 第 17 位 VM 位，即 Virtual 8086 Model，即虚拟 8086 模式。这是实模式向保护模式过渡时
的产物，现在已经没有了。为了兼容实模式下的用户程序，允许将此位置为 1，这样便可以在保护
模式下运行实模式的程序，实模式下程序不支持多任务，地址就是真实的物理地址，所以在保护
模式下每运行一个实模式下的程序，就要为其虚拟一个实模式环境，故称虚拟模式    

以下标志位仅用于 80486 以上的 CPU。   

+ 第 18 位 AC 位，即 Alignment Check，对齐检查。置位时进行地址对齐检查

以下标志位仅用于 80586 以上 CPU   

+ 第 19 位为 VIF，即 Virtual Interrupt Flag，虚拟模式下的中断标志
+ 第 20 位 VIP，即 Virtual Interrupt Pending，虚拟中断挂起标志位。在多任务的情况下，为
操作系统提供的虚拟中断挂起信息，需要与 VIF 位配合
+ 第 21 位 ID，即 Identitification，识别标志位，系统经常要判断 CPU 型号，若 ID 为 1，
表示当前 CPU 支持 CPU id 指令，这样便能获取 CPU 的型号、厂商等信息。      

### 3.2.11 实模式小结

实模式被保护模式淘汰的原因，主要是安全隐患。   

在实模式下，没有特权级，用户程序和操作系统一个级别。那用户程序就可以随意执行指令。   

程序可以随意修改自己的段基址，可以访问任意物理内存，包括操作系统的内存。   

## 3.3 外设简介

### 3.3.1 CPU 如何与外设通信——IO接口

在 CPU 和外设之间的这一层就是 IO 接口，IO 接口的形式不限，它可以是个电路板，也可是块芯片，
甚至可以是个插槽，它的作用就是在 CPU 和外设之间相互做协调转换。   

IO 接口是连接 CPU 与外部设备的逻辑控制部件，既然称为逻辑，就说明可分为硬件和软件两部分。
硬件部分所做的都是一些实质具体的工作，其功能是协调 CPU 和外设之间的种种不匹配，如双方速度
不匹配、格式不匹配。IO 接口内部实际上也是由软件来控制运作的，这就是所谓的 “逻辑” 部分，
所以软件是用来控制接口电路工作的驱动程序以及完成内部数据传输所需要的程序。    

IO 接口芯片又可按照是否可编程来分类，可分为可编程接口芯片和不可编程接口芯片。    

IO 接口中的寄存器就称为端口。端口是 IO 接口开放给 CPU 的接口，一般的 IO 接口都有一组
端口，每个端口都有自己的用途。    

in 指令用于从端口中读取数据，其一般形式是：   

1. `in al, dx`
2. `in ax, dx`    

其中 al 和 ax 用来存储从端口获取的数据，dx 是指端口号。    

out 指令用于往端口中写数据，其一般形式是：   

1. `out dx, al`
2. `out dx, ax`
3. `out 立即数, al`
4. `out 立即数, ax`    

### 3.3.2 显卡概述

某些 IO 接口也叫适配器，适配器是驱动某一外部设备的功能模块。显卡也称为显示适配器，不过
归根结底它就是 IO 接口，专门用来连接 CPU 和显示器。    

显卡是 PCI 设备，所以是安装在主板上 PCI 插槽上的，PCI 总线是共享并行架构，并行数据就要
保证数据发送后必须同时到达目的地，因为这关系到数据的顺序。虽然貌似并行传输是高效的，但对于
要保证同时接收 n 位数据，这是由困难的。于是串行传输很好地解决了这一问题，于是就有了 PCI Express
总线，这就是串行设备，简称 PCIE。现在的显卡都是串口的了。    

Last Update: 2018.11.24