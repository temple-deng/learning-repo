# 第三章 程序的机器级表示

<!-- TOC -->

- [第三章 程序的机器级表示](#第三章-程序的机器级表示)
  - [3.2 程序编码](#32-程序编码)
    - [3.2.1 机器级代码](#321-机器级代码)
    - [3.2.2 代码示例](#322-代码示例)
    - [3.2.3 关于格式的注解](#323-关于格式的注解)
  - [3.3 数据格式](#33-数据格式)
  - [3.4 访问信息](#34-访问信息)
    - [3.4.1 操作数指示符](#341-操作数指示符)
    - [3.4.2 数据传送指令](#342-数据传送指令)
    - [3.4.3 数据传送示例](#343-数据传送示例)
    - [3.4.4 压入和弹出栈数据](#344-压入和弹出栈数据)
  - [3.5 算术和逻辑操作](#35-算术和逻辑操作)
    - [3.5.1 加载有效地址](#351-加载有效地址)
    - [3.5.2 一元和二元操作](#352-一元和二元操作)
    - [3.5.3 移位操作](#353-移位操作)
    - [3.5.5 特殊的算术操作](#355-特殊的算术操作)
  - [3.6 控制](#36-控制)
    - [3.6.1 条件码](#361-条件码)
    - [3.6.2 访问条件码](#362-访问条件码)
    - [3.6.3 跳转指令](#363-跳转指令)
    - [3.6.4 跳转指令的编码](#364-跳转指令的编码)
    - [3.6.5 用条件控制来实现条件分支](#365-用条件控制来实现条件分支)
    - [3.6.6 用条件传送来实现条件分支](#366-用条件传送来实现条件分支)
    - [3.6.7 循环](#367-循环)
    - [3.6.8 switch 语句](#368-switch-语句)
  - [3.7 过程](#37-过程)
    - [3.7.1 运行时栈](#371-运行时栈)
    - [3.7.2 转移控制](#372-转移控制)
    - [3.7.3 数据传送](#373-数据传送)
    - [3.7.4 栈上的局部存储](#374-栈上的局部存储)
    - [3.7.5 寄存器中的局部存储空间](#375-寄存器中的局部存储空间)

<!-- /TOC -->

计算机执行 **机器代码**，用字节序列编码低级的操作，包括处理数据、管理内存、读写存储设备上的
数据，以及利用网络通信。编译器基于编程语言的规则、目标机器的指令集和操作系统遵循的惯例，经过
一系列的阶段生成机器代码。     

用高级语言编写的程序可以在很多不同的机器上编译和执行，而汇编代码则是与特定机器密切相关的。    

## 3.2 程序编码

假设一个 C 程序，有两个文件 p1.c 和 p2.c。我们用 Unix 命令行编译这些代码：   

`linux > gcc -Og -o p p1.c p2.c`    

编译选项 -Og 告诉编译器使用会生成符合原始 C 代码整体结构的机器代码的优化等级。使用较高
级别优化产生的代码会严重变形。实际中，从得到的程序的性能考虑，较高级别的优化（例如，以
选择 -O1 或 -O2 指定）被认为是较好的选择。    

实际上 gcc 命令调用了一整套的程序，将源代码转换成可执行代码。首先，C *预处理器* 扩展源代码，
插入所有用 #include 命令指定的文件，并扩展所有用 #define 声明指定的宏。其次，*编译器*
产生两个源文件的汇编代码，名字分别为 p1.s 和 p2.s。接下来，*汇编器* 会将汇编代码转化
成二进制目标代码文件 p1.o 和 p2.o。目标代码是机器代码的一种形式，它包含所有指令的二进制表示，
但是还没有填入全局值的地址。最后，*链接器* 将两个目标代码文件与实现库函数的代码合并，并产生
最终的可执行代码文件 p。可执行代码是我们要考虑的机器代码的第二种形式，也就是处理器执行的代码
格式。    

### 3.2.1 机器级代码

计算机系统使用了多种不同形式的抽象，利用更简单的抽象模型来隐藏实现的细节。对于机器级编程来说，
其中两种抽象尤为重要。第一种是由 _指令集体系结构或指令集架构_(Instruction Set Architecture, ISA)
来定义机器级程序的格式和行为，它定义了处理器状态、指令的格式，以及每条指令对状态的影响。
大多数 ISA，将程序的行为描述成好像每条指令都是按顺序执行的。处理器的硬件远比描述的精细复杂，
它们并发地执行许多指令，但是可以采取措施保证整体行为与 ISA 指定的顺序执行的行为完全一致。
第二种抽象是，机器级程序使用的内存地址是虚拟地址。    

x86-64 的机器代码和原始的 C 代码差别非常大。一些通常对 C 语言程序员隐藏的处理器状态都是可见的：   

+ _程序计数器_ (在 x86-64 中用 %rip 表示)给出将要执行的下一条指令在内存中的地址。
+ 整数 _寄存器_ 文件包含 16 个命名的位置，分别存储 64 位的值。这些寄存器可以存储地址或
整数数据。有的寄存器被用来记录某些重要的程序状态。
+ 条件码寄存器保存着最近执行的算术或逻辑指令的状态信息。它们用来实现控制或数据流中的条件
变化，比如说用来实现 if 和 while 语句。
+ 一组向量寄存器可以存放一个或多个整数或浮点数值。    

虽然 C 语言提供了一种模型，可以在内存中声明和分配各种数据类型的对象，但是机器代码只是简单地
将内存看成一个很大的、按字节寻址的数组。C 语言中的聚合数据类型，例如数组和结构体，在机器代码
中用一组连续的的字节表示。即使是对标量数据类型，汇编代码也不区分有符号或无符号整数，不区分
各种类型的指针，甚至不区分指针和整数。    

程序内存包含：程序的可执行机器代码，操作系统需要的一些信息，用来管理过程调用和返回时的运行时
栈，以及用户分配的内存块。    

### 3.2.2 代码示例

假设我们写了一个 C 语言代码文件 mstore.c，包含如下的函数定义：   

```c
long mult2(long, long);

void multstore(long x, long y, long *dest) {
  long t = mult2(x, y);
  *dest = t;
}
```   

在命令行上使用 -S 选项，就能看到 C 语言编译器产生的汇编代码：   

`linux > gcc -Og -S mstore.c`    

这会使 GCC 产生一个汇编文件 mstore.s。    

汇编代码文件包含各种声明，包括下面几行：    

```asm
multstore:
  pushq       %rbx             // 保存栈帧
  movq        %rdx, %rbx       // 将 dest 内容传送到 %rbx
  call        mult2            // 函数调用，注意这里由于参数 x, y 和 mult 的一样，那说明 %rdi 和 %rsi 里的参数就不用额外处理，可以直接让 mult2 使用
  movq        %rax, (%rbx)     // 将返回值传送到 %rbx 指向的内存中，*dest = mult2(x,y)
  popq        %rbx             // 弹出栈帧
  ret
```    

完整的本地测试时生成的文件内容在下一小节。 

如果我们使用 -c 命令行选项，GCC 会编译并汇编该代码：   

`linux > gcc -Og -c mstore.c`     

要查看机器代码文件的内容，有一类称为 _反汇编器_ 的程序非常有用。这些程序根据机器代码产生一种
类似于汇编代码的格式，在 Liunx 系统中，使用 objdump -d 充当这个角色：   

`linux > objdump -d mstore.o`    

结果如下（这里，我们在左边增加了行号，在右边增加了斜体表示的注解）：    

```
1   0000000000000000 <multstore>:
    offset    Bytes             Equivalent assembly language
2       0:    53                push    %rbx
3       1:    48 89 d3          mov     %rdx,%rbx
4       4:    e8 00 00 00 00    callq   9 <multstore+0x9>
5       9:    48 89 03          mov     %rax,(%rbx)
6       c:    5b                pop     %rbx
7       d:    c3                retq
```     

本地测试时候打印出的内容如下：    

```

mstore.o:     file format elf64-x86-64


Disassembly of section .text:

0000000000000000 <multstore>:
   0:	53                   	push   %rbx
   1:	48 89 d3             	mov    %rdx,%rbx
   4:	e8 00 00 00 00       	callq  9 <multstore+0x9>
   9:	48 89 03             	mov    %rax,(%rbx)
   c:	5b                   	pop    %rbx
   d:	c3                   	retq   
```    

其中一些关于机器代码和它的反汇编表示的特性值得注意：   

+ x86-64 的指令长度从 1 到 15 个字节不等。常用的指令以及操作数较少的指令所需的字节数少，
而那些不太常用或操作数较多的指令所需的字节数较多
+ 设计指令格式的方式是，从某个给定的位置开始，可以将字节唯一地解码成机器指令。例如，只有
指令 pushq %rbx 是以字节值 53 开头的
+ 反汇编器使用的指令命名规则与 GCC 生成的汇编代码使用的有些细微的差别。在我们的示例中，
它省略了很多指令结尾的 'q'。这些后缀是大小指示符，在大多数情况中可以省略。相反，反汇编器
给 call 和 ret 指令添加了 'q' 后缀，同样，省略这些后缀也没有问题    

### 3.2.3 关于格式的注解

继续来看我们之前使用 gcc 生成的汇编代码文件 mstore.s：    

```asm
	.file	"mstore.c"
	.text
	.globl	multstore
	.type	multstore, @function
multstore:
.LFB0:
	.cfi_startproc
	pushq	%rbx
	.cfi_def_cfa_offset 16
	.cfi_offset 3, -16
	movq	%rdx, %rbx
	call	mult2
	movq	%rax, (%rbx)
	popq	%rbx
	.cfi_def_cfa_offset 8
	ret
	.cfi_endproc
.LFE0:
	.size	multstore, .-multstore
	.ident	"GCC: (Ubuntu 5.4.0-6ubuntu1~16.04.10) 5.4.0 20160609"
	.section	.note.GNU-stack,"",@progbits
```    

注意上面是本地测试时候生成的汇编代码，书上和这个有点差别，但差别不大。    

所以以 '.' 开头的行都是指导汇编器和链接器工作的伪指令。我们通常可以忽略这些行。     

**ATT 和 Inter 汇编代码格式**    

我们的表述是 ATT 格式的汇编代码。一些编程工具，包括微软的工具以及来及 Inter 的文档，其汇编
代码都是 Inter 格式的，这两种格式在许多方面有所不同，例如，使用下述命令行，gcc 可以产生 Inter
格式的代码：   

`linux > gcc -Og -S -masm=inter mstore.c`    

得到如下代码：   

```asm
multstroe:
  push   rbx
  mov    rbx, rdx
  call   mult2
  mov    QWORD PTR [rbx], rax
  pop    rbx
  ret
```   

我们看到 Inter 和 ATT 格式在如下方面有所不同：   

+ Inter 代码省略了指示大小的后缀
+ Inter 代码省略了寄存器名字前面的 % 符号
+ Inter 代码用不同的方式来描述内存中的位置，例如是 QWORD PTR [rbx] 而不是 (%rbx)
+ 在带有多个操作数的指令情况下，列出操作数的顺序相反。    

## 3.3 数据格式

由于是从 16 位体系结构扩展成 32 位的，Inter 用术语 "字(word)" 表示 16 位数据类型。因此，
称 32 位数为 "双字(double words)"，称 64 位数为 "四字(quad words)"。    

大多数 GCC 生成的汇编代码都有一个字符的后缀，表明操作数的带下。例如，数据传送指令有四个变种：
movb（传送字节），movw（传送字），movl（传送双字）和 movq（传送四字），后缀 l 用来表示
双字，因为 32 位数被看成是 long word。    

## 3.4 访问信息

一个 64 位 CPU 包含一组 16 个存储 64 位值的 **通用目的寄存器**。这些寄存器用来存储整数
数据和指针。它们的名字都以 %r 开头，不过后面还跟着一些不同的命名规则的名字，这是由于指令
集历史演化造成的。最初的 8086 有 8 个 16 位寄存器，即图中的 %ax 到 %bp。扩展到 IA32
架构时，这些寄存器扩展到了 32 位，标号从 %eax 到 %ebp。扩展到 x86-64 后，原来的 8 个
寄存器扩展成 64 位，标号从 %rax 到 %rbp。除此之外，还增加了 8 个新的寄存器，它们的标号是
按照新的命名规则制定的：从 %r8 到 %r15。     

![universal-registers](https://raw.githubusercontent.com/temple-deng/markdown-images/master/computer-system/universal-registers.png)    

如图中嵌套的方框标明的，指令可以对这 16 个寄存器的低位字节中存放的不同大小的数据进行操作，
字节级操作可以访问最低的字节，16 位操作可以访问最低的 2 个字节，32 位操作可以访问最低的
4 个字节。    

在后面的章节中，我们会展现很多指令，复制和生成 1 字节、2字节、4字节和 8字节值。当这些指令
以寄存器作为目标时，对于生成小于 8 字节结果的指令，寄存器中剩下的字节会怎么样，对此有两条
规则：生成 1 字节和 2 字节数字的指令会保持剩下的字节不变；生成 4 字节数字的指令会把高位 4
个字节置为 0.    

### 3.4.1 操作数指示符

大多数指令有一个或多个 **操作数**(operand)，指示出执行一个操作中要使用的源数据值，以及放置
结果的目的位置。源数据值可以以常数形式给出，或是从寄存器或内存中读出。结果可以存放在寄存器或
内存中。因此，各种不同的操作数的可能性被分为三种类型。第一种类型是 **立即数**(immediate)，
用来表示常数值。在 ATT 格式的汇编代码中，立即数的书写方式是 '$' 后面跟一个用标准 C 表示法
表示的整数，比如 $-577 或 $0x1F。不同指令允许的立即数值范围不同，汇编器会自动选择最紧凑的
方式进行数值编码。第二种类型是 **寄存器**(register)，它表示某个寄存器的内容。在下图中，我们
用符号 r<sub>a</sub> 来表示任意寄存器 a，用引用 R[r<sub>a</sub>] 来表示它的值，这是将
寄存器集合看成一个数组 R，用寄存器标识符作为索引。    

第三类操作数是 **内存** 引用，它会根据计算出来的地址访问某个内存位置。我们用符号 M<sub>b</sub>[Addr] 表示对存储在内存中从地址 Addr 开始的 b 个字节值的引用。    

如图所示，有多种不同的 **寻址模式**，允许不同形式的内存引用。表中底部用语法 Imm(r<sub>b</sub>,
r<sub>i</sub>, s)表示的是最常用的形式。这样的引用有四个组成部分：一个立即数偏移 Imm，一个
基址寄存器 r<sub>b</sub>，一个变址寄存器 r<sub>i</sub> 和一个比例因子 s，这里 s 必须
是 1,2,4 或者 8。基址和变址寄存器都必须是 64 位寄存器。有效地址被计算为 Imm +
R[r<sub>b</sub>] + R[r<sub>i</sub>] * s。    

![operand-form](https://raw.githubusercontent.com/temple-deng/markdown-images/master/computer-system/operand-form.png)    

**练习题3.1** 假设下面的值存放在指明的内存地址和寄存器中：    


地址 | 值
----------|---------
 0x100 | 0xFF
 0x104 | 0xAB
 0x108 | 0x13
 0x10c | 0x11


寄存器 | 值
----------|---------
 %rax | 0x100
 %rcx | 0x1
 %rdx | 0x3

填写下表，给出所示操作数的值：    

操作数 | 值
----------|---------
 %rax | 0x100
 0x104 | 0xAB
 $0x108 | 0x108
 (%rax) | 0xFF
 4(%rax) | 0xAB
 9(%rax, %rdx) | 0x11
 260(%rcx, %rdx) | 0x13
 0xFC(, %rcx, 4) | 0xFF
 (%rax, %rdx, 4) | 0x11

### 3.4.2 数据传送指令

数据传送指令是将数据从一个位置复制到另一个位置的指令。我们会介绍多种不同的数据传送指令，它们
或者源和目的类型不同，或者执行的转换不同，或者具有的一些副作用不同。在我们的讲述中，把许多
不同指令划分成指令类，每一类中的指令执行相同的操作，只不过操作数大小不同。    

下表列出了最简单形式的数据传送指令 —— MOV 类。这些指令把数据从源位置复制到目的位置，不做
任何变化。MOV 类由四条指令组成：movb, movw, movl 和 movq。     


指令 | 效果 | 描述
---------|----------|---------
 MOV  S, D | D ← S | 传送
 movb |  | 传送字节
 movw |  | 传送字
 movl |  | 传送双字
 movq |  | 传送四字
 movabsq  I, R | R ← I | 传送绝对的四字

源操作数指定的值是一个立即数，存储在寄存器中或者内存中。目的操作数指定一个位置，要么是一个
寄存器或者是一个内存地址。x86-64 加了一条限制，传送指令的两个操作数不能都指向内存位置。将
一个值从一个内存位置复制到另一个内存位置需要两条指令——第一条指令将源值加载到寄存器中，第二条
将该寄存器值写入到目的位置。   

上表中最后一条指令是处理 64 位立即数数据的。常规的 movq 指令只能以表示为 32 位补码数字
的立即数作为源操作数，然后把这个值符号扩展到 64 位的值，放到目的位置。movabsq 指令能够
以任意 64 位立即数值作为源操作数，并且只能以寄存器作为目的。   

以下两表记录的是两类数据移动指令，在将较小的源值复制到较大的目的时使用。所有这些指令都把
数据从源（在寄存器或内存中）复制到目的寄存器。MOVZ 类中的指令把目的中剩余的字节填充为 0，
而 MOVS 类中的指令通过符号扩展来填充。可以观察到，每条指令名字的最后两个字符都是大小指示
符：第一个字符指定源的大小，而第二个指明目的地的大小。    


指令 | 效果 | 描述
---------|----------|---------
 MOVZ  S, R | R ← 零扩展(S) | 以零扩展进行传送
 movzbw |  | 字节传送到字
 movzbl |  | 字节传送到双字
 movzwl |  | 字传送到双字
 movzbq |  | 字节传送到四字
 movzwq |  | 字传送到四字    

话说为什么没有双字到四字的传送？？因为完全可以用 movl 指令实现。     

指令 | 效果 | 描述
---------|----------|---------
 MOVS  S, R | R ← 符号扩展(S) | 以符号扩展进行传送
 movsbw |  | 字节传送到字
 movsbl |  | 字节传送到双字
 movswl |  | 字传送到双字
 movsbq |  | 字节传送到四字
 movswq |  | 字传送到四字  
 movslq |  | 双字传送到四字
 cltq | %rax ← 符号扩展(%eax) | 把 %eax 符号扩展到 %rax

### 3.4.3 数据传送示例

```c
long exchange(long *xp, long y) {
  long x = *xp;
  *xp = y;
  return x;
}
```   

相应的汇编代码：   

```asm
// long exchange(long *xp, long y)
// xp in %rdi, y in %rsi
exchange:
  movq (%rdi), %rax   // Get x at xp, Set as return value.     
  movq %rsi, (%rdi)   // Store y at xp.
  ret                 // Return
```    

参考之前给出了通用寄存器的作用图，rax 就是返回值，rdi 和 rsi 分别保存前两个参数。   

### 3.4.4 压入和弹出栈数据

最后两个数据传送操作可以将数据压入程序栈中，以及从程序栈中弹出数据。栈指针 %rsp 保存着栈顶
元素的地址。    


指针 | 效果 | 描述
---------|----------|---------
 pushq S | R[%rsp] ← R[%rsp]-8; M[R[%rsp]] ← S | 将四字压入栈
 popq D | D ← M[R[%rsp]];  R[%rsp] ← R[%rsp] + 8 | 将四字弹出栈    

将一个四字值压入栈中，首先要将栈指针减 8，然后将值写到新的栈顶地址。因此，指令 pushq %rbp
的行为等价于下面两条指令：   

```asm
subq    $8, %rsp      // 递减栈指针
movq    %rbp, (%rsp)
```    

它们之间的区别是在机器代码中 pushq 指令编码为 1 个字节，而上面那两条指令要 8 个字节。    

弹出一个四字的操作包括从栈顶位置读出数据，然后将栈指针加 8，因此指令 popq %rax 等价于
下面两条指令：   

```asm
movq  (%rsp), %rax
addq $8, %rsp
```    

## 3.5 算术和逻辑操作

下表列出了 x86-64 的一些整数和逻辑操作。大多数操作都分成了指令类，这些指令类有各种带
不同大小操作数的变种。例如指令类 ADD 由四条加法指令组成：addb, addw, addl, addq。
这些操作被分为四组：加载有效地址、一元操作、二元操作和移位。    


指令 | 效果 | 描述
---------|----------|---------
 leaq  S, D | D ← &S | 加载有效地址
 INC D | D ← D + 1 | 加 1
 DEC D | D ← D - 1 | 减 1
 NEG D | D ← -D | 取负
 NOT D | D ← ~D | 取补
 ADD S, D | D ← D + S | 加
 SUB S, D | D ← D - S | 减
 IMUL S, D | D ← D * S | 乘
 XOR S, D | D ← D ^ S | 异或
 OR S, D | D ← D \| S | 或
 AND S, D | D ← D & S | 与
 SAL k, D | D ← D &lt;&lt; k | 左移
 SHL k, D | D ← D &lt;&lt; k | 左移（等同于 SAL）
 SAR k, D | D ← D &gt;&gt; k | 算术右移
 SHR k, D | D ← D &gt;&gt; k | 逻辑右移

### 3.5.1 加载有效地址

加载有效地址(load effective address)指令 leaq 实际上是 movq 指令的变形。它的指令形式
是从内存读数据到寄存器，但它实际上根本就没有引用内存。它的第一个操作数看上去是一个内存引用，
但该指令并不是从指定的位置读入数据，而是将有效地址写入到目的操作数。在上面的表中我们用 C
语言的地址操作符说明这种计算。这条指令可以为后面的内存引用产生指针。    

相当于把 S 的地址传送到了 D 中。    

另外，它还可以简洁地描述普通的算术操作，例如，如果寄存器 %rdx 的值为 x，那么指令
leaq 7(%rdx, %rdx, 4), %rax 将设置寄存器 %rax 的值为 5x+7。   

### 3.5.2 一元和二元操作

第三组是二元操作，其中，第二个操作数既是源又是目的。   

**练习题3.8** 假设下面的值存放在指定的内存地址和寄存器中：   

地址 | 值
----------|---------
 0x100 | 0xFF
 0x108 | 0xAB
 0x110 | 0x13
 0x118 | 0x11


寄存器 | 值
----------|---------
 %rax | 0x100
 %rcx | 0x1
 %rdx | 0x3

填写下表，给出下面指令的效果，说明将被更新的寄存器或内存位置，以及得到的值

指令 | 目的 | 值
----------|---------|---------
 addq %rcx, (%rax) | 0x100 | 0x100
 subq %rdx, 8(%rax) | 0x108 | 0xA8
 imulq $16, (%rax, %rdx, 8) | 0x118 | 0x110
 incq 16(%rax) | 0x110 | 0x14
 decq %rcx | %rcx | 0x0
 subq %rdx, %rax | %rax | 0xFD   

### 3.5.3 移位操作

移位量可以是一个立即数，或者放在单字节寄存器 %cl 中。原则上来说，1 个字节的移位量使得移位
量的编码范围可以达到 255，x86-64 中，移位操作对 w 位长度数据值进行操作，移位量是由 %cl
寄存器的低 m 位决定的，这里 2<sup>m</sup> = w。高位会被忽略。    

### 3.5.5 特殊的算术操作

两个 64 位有符号或无符号整数相乘得到的乘积需要 128 位来表示。x86-64 对 128 位数提供
有限的支持，Inter 把 16 字节的数称为八字(oct word)。    

![oct-word-mul](https://raw.githubusercontent.com/temple-deng/markdown-images/master/computer-system/oct-word-mul.png)    

x86-64 指令集提供了两条不同的“单操作数”乘法指令，以计算两个 64 位值的全 128 位乘积——
一个是无符号乘法 mulq，而另一个是补码乘法 imulq。这两条指令都要求一个参数必须在寄存器 %rax
中，而另一个作为指令的源操作数给出。然后乘积存放在寄存器 %rdx(高64位)和 %rax(低64位)中。    

```c
#include <inttypes.h>

typedef unsigned __int128 uint128_t;

void store_uprod(unit128_t *dest, uint64_t x, uint64_t y) {
  *dest = x * (uint128_t) y;
}
```   

GCC 生成的汇编代码如下：   

```asm
// dest in %rdi, x int %rsi, y in %rdx
store_uprod:
  movq    %rsi, %rax    // Copy x to multiplicand
  mulq    %rdx          // Multiply by y
  movq    %rax, (%rdi)  // Store lower 8 bytes at dest
  movq    %rdx, 8(%rdi) // Store upper 8 bytes at dest+8
  ret
```    

前面的算术运算表没有列出除法或取模操作。这些操作是由单操作数除法指令来提供的，类似于单操作数
乘法指令。有符号除法指令 idivq 将寄存器 %rdx（高 64 位）和 %rax（低 64 位）中的 128 位
数作为被除数，而除数作为指令的操作数给出。指令将商存储在寄存器 %rax 中，将余数存储在寄存器
%rdx 中。    

对于大多数 64 位除法来说，除数也常常是一个 64 位的值，这个值应该存放在 %rax 中，%rdx
的位应该设置为全 0（无符号运算）或者 %rax 的符号位（有符号运算）。     

## 3.6 控制

机器代码提供两种基本的低级机制来实现有条件的行为：测试数据值，然后根据测试的结果来改变控制流
或者数据流。    

与数据相关的控制流是实现有条件行为的更一般和更常见的方法，所以我们先来介绍它。通常，C 语言
中的语句和机器代码中的指令都是按照它们在程序中出现的次序，顺序执行的。用 **jump** 指令可以
改变一组机器代码执行的执行顺序，jump 指令指定控制应该被传递到程序的某个其他部分。   

### 3.6.1 条件码

除了整数寄存器，CPU 还维护着一组单个位的 **条件码**(condition code)寄存器，它们描述了
最近的算术或逻辑操作的属性。可以检测这些寄存器来执行条件分支指令。最常用的条件码有：   

+ CF：进位标志。最近的操作使最高位产生了进位。可用来检查无符号操作的溢出
+ ZF：零标志。最近的操作得出的结果为 0
+ SF：符号标志。最近的操作得到的结果为负数
+ OF：溢出标志。最近的操作导致一个补码溢出——正溢出或负溢出    

比如说，假设我们用一条 ADD 指令完成等价于 C 表达式 t=a+b 的功能，这里变量 a, b 和 t
都是整型的。然后，根据下面的 C 表达式来设置条件码：   

CF   (unsigned) t &lt; (unsigned) a    无符号溢出   
ZF   (t==0) 零    
SF   (t &lt; 0) 负数   
OF   (a &lt; 0 == b &lt; 0) && (t &lt; 0 != a &lt; 0) 有符号溢出    

leaq 指令不改变任何条件码，因为它是用来进行地址计算的。除此之外，3.5 第一小节前的那个表中
列出的所有指令都会设置条件码。对于逻辑操作，例如 XOR，进位标志和溢出标志会设置成 0。对于
移位操作，进位标志将设置为最后一个被移出的位，而溢出标志设置为 0.INC 和 DEC 指令会设置
溢出和零标志，但是不会改变进位标志。    

除此之外，还有两类指令，它们只设置条件码而不改变任何其他寄存器。如图所示，CMP 指令根据
两个操作数之差来设置条件码。除了只设置条件码而不更新目的寄存器之外，CMP 指令与 SUB 指令
的行为是一样的。TEST 指令的行为与 AND 指令一样，除了它们只设置条件码而不改变目的寄存器
的值。   

![cmp-test](https://raw.githubusercontent.com/temple-deng/markdown-images/master/computer-system/cmp-test.png)    

### 3.6.2 访问条件码

条件码通常不会直接读取，常用的使用方法有三种：1)可以根据条件码的某种组合，将一个字节设置
为 0 或者 1, 2)可以条件跳转到程序的某个其他的部分，3)可以有条件地传送数据。对于第一种
情况，图3-14描述的指令根据条件码的某种组合，将一个字节设置为 0 或者 1。我们将这一整类指令
称为 **SET** 指令；它们之间的区别在于它们考虑的条件码的组合是什么，这些指令名字的不同后缀
指明了它们所考虑的条件码的组合。例如，指令 setl 和 setb 表示“小于时设置(set less)” 和
“低于时设置(set below)”。    

很明显由于我们已经指定了要去设置一个字节的值，因此就不用考虑操作数的大小了，因为源操作数
是条件码。    

![set-instructions](https://raw.githubusercontent.com/temple-deng/markdown-images/master/computer-system/set-instructions.png)    


一条 SET 指令的目的操作数是低位单字节寄存器元素之一，或者一个字节的内存之一，指令会将这个
字节设置成 0 或者 1。为了得到一个 32 位或 64 位结果，我们必须对高位清零。    

一个计算 C 语言表达式 a &lt; b 的典型指令序列如下所示：    

```asm
// int comp(data_t a, data_t b)
// a in %rdi, b in %rsi
comp:
  cmpq  %rsi, %rdi   // Compare a:b
  setl  %al          // Set low-order byte if %eax to 0 or 1
  movzbl %al, %eax   // Clear rest of %eax (and rest of %rax)
  ret
```    

那这个表达式最后的结果应该是 0 或者 -1 两种结果吧？   

虽然所有的算术和逻辑操作都会设置条件码，但是各个 SET 命令的描述都适用的情况是：执行比较
指令，根据计算 t = a-b 设置条件码。    

### 3.6.3 跳转指令

**跳转**(jump) 指令会导致执行切换到程序中一个全新的位置。在汇编代码中，这些跳转的目的地
通常用一个 **标号**(label)指明。    

```asm
movq   $0, %rax       // Set %rax to 0
jmp    .L1            // Goto .L1
movq   (%rax), %rdx   // Null pointer dereference (skipped)
.L1:
  popq  %rdx         // jump target
```    

指令 jmp .L1 会导致程序跳过 movq 指令，而从 popq 指令开始继续执行。在产生目标代码文件时，
汇编器会确定所有带标号指令的地址，并将 **跳转目标**（目的指令的地址）编码为跳转指令的一部分。    

图 3-15 列举了不同的同转指令，jmp 是无条件跳转，它可以是直接跳转，即跳转目标是作为指令的
一部分编码的；也可以是间接跳转，即跳转目标是从寄存器或内存位置中读出的。汇编语言中，直接
跳转是给出一个标号作为跳转目标的，间接跳转的写法是 '*' 后面跟一个操作数指示符，例如
jmp *%rax, 或者 jmp *(%rax)。    

![jmp-instructions](https://raw.githubusercontent.com/temple-deng/markdown-images/master/computer-system/jmp-instructions.png)    

表中所示的其他跳转指令都是有条件的——它们根据条件码的某种组合，或者跳转，或者继续执行代码
序列中下一条指令。条件跳转只能是直接跳转。     

### 3.6.4 跳转指令的编码

跳转指令有几种不同的编码，但最常用的都是 PC 相对的（PC-relative）。也就是，它们会将目标
指令的地址与紧跟在跳转指令后面那条指令的地址之间的差作为编码。这些地址偏移量可以编码为 1,2
或 4 个字节。第二种编码方式是给出“绝对”地址，用 4 个字节直接指定目标。汇编器和链接器会选择
适当的跳转目的编码。    

```asm
movq        %rdi, %rax
jmp         .L2
.L3:
  sarq      %rax
.L2:
  testq     %rax, %rax
  jg        .L3
  req; ret
```    

汇编器产生的 .o 格式的反汇编版本如下：   

```
0:    48 89 f8            mov    %rdi, %rax
3:    eb 03               jmp    8 <loop+0x8>
5:    48 di f8            sar    %rax
8:    48 85 c0            test   %rax, %rax
b:    7f f8               jg     5 <loop+0x5>
d:    f3 c3               reqz retq
```    

右边反汇编器产生的注释中，第 2 行中跳转指令的跳转目标指明为 0x8，第 5 行中跳转指令的跳转
目标是 0x5。不过，观察指令的字节编码，会看到第一条跳转指令的目标编码为 0x03。把它加上 0x5,
也就是下一条指令的地址，就得到跳转目标地址 0x8.    

L类似，第二个跳转指令的目标用单字节、补码表示编码为0xf8。将这个数加上 0xd，就得到 0x5。    

### 3.6.5 用条件控制来实现条件分支

将条件表达式和语句从 C 语言翻译成机器代码，最常用的方式是结合有条件和无条件跳转。    

```c
long lt_cnt = 0;
long ge_cnt = 0;

long absdiff_se(long x, long y)
{
  long result;
  if ( x < y) {
    lt_cnt++;
    result = x - y;
  } else {
    ge_cnt++;
    result = x - y;
  }
  return result;
}
```    

产生的汇编代码：    

```asm
// long absdiff_se(long x, long y)
// x in %rdi, y in %rsi
absdiff_se:
  cmpq      %rsi, %rdi   // Compare x:y
  jge       .L2          
  addq      $1, lt_cnt(%rip)   // lt_cnt++
  movq      $rsi, %rax
  subq      %rdi, %rax       // result = y - x
  ret                        // return
.L2:
  addq      $1, ge_cnt(%rip)    // ge_cnt++
  movq      %rdi, %rax
  subq      %rsi, %rax          // result = x - y
  ret
```    

C 语言中的 if-else 语句的通用形式模板如下：   

```
if (test-expr)
  then-statement
else
  else-statement
```    

对于这种通用形式，汇编实现通常会使用下面这种形式，这里，我们用 C 语法来描述控制流：   

```
t = test-expr
if (!t)
  goto false;
  then statement
  goto done;
false:
  else-statement
done:
```      

### 3.6.6 用条件传送来实现条件分支

实现条件操作的传统方法是通过使用控制的条件转移。当条件满足时，程序沿着一条执行路径执行，
而当条件不满足时，就走另一条路径。这种机制简单而通用，但是在现在处理器上，它可能会非常
低效。   

一种替代的策略是使用数据的条件转移。这种方法计算一个条件操作的两种结果，然后再根据条件是否
满足从中选取一个。只有在一些受限制的情况中，这种策略才可行，但是如果可行，就可以用一条简单
的条件传送指令来实现它，条件传送指令更符合现代处理器的性能特性。    

```c
long absdiff(long x, long y) {
  long result;
  if (x < y) {
    result = y - x;
  } else {
    result = x - y;
  }
  return result;
}
```    

对应的汇编代码：    

```asm
// long absdiff(long x, long y)
// x in %rdi, y in %rsi
absdiff:
  movq      %rsi, %rax
  subq      %rdi, %rax    // rval = y - x
  movq      %rdi, %rdx
  subq      %rsi, %rdx    // eval = x - y
  cmpq      %rsi, %rdi    // Compare  x:y
  cmovge    %rdx, %rax    // If >=, rval = eval
  ret
```    

为了理解为什么基于条件数据传送的代码会比基于条件控制转移的代码性能要好，我们必须了解一些
关于现代处理器如何运行的知识。处理器通过使用 _流水线_ 来获得高性能，在流水线中，一条指令
的处理要经过一系列的阶段，每个阶段执行所需操作的一小部分（例如，从内存中取指、确定指令类型、
从内存读数据、执行算术运算、向内存写数据）。这种方法通过重叠连续指令的步骤来获得高性能，例如，
在取一条指令的同时，执行它前面一条指令的算术运算。要做到这一点，要求能够事先确定要执行的指令
序列，这样才能保持在流水线中充满了待执行的指令。当机器遇到条件跳转（也称为“分支”）时，只有
当分支条件求值完成之后，才能决定分支往哪边走。处理器采用非常精密的 _分支预测逻辑_ 来猜测
每条跳转指令是否会执行。只要它的猜测还比较可靠，指令流水线中就会充满着指令。另一方面，错误
预测一个跳转，要求处理器丢掉它为该跳转指令后所有指令已做的工作，然后再开始用从正确位置处
起始的指令去填充流水线。这样的一个错误预测会招致很严重的惩罚，浪费大约 15~30 个时钟周期。    

另一方面，无论测试的数据是什么，编译出来使用条件传送的代码所需的时间都是大约 8 个时钟周期。   

图 3-18 列举了 x86-64 上一些可用的条件传送指令，每条指令都有两个操作数：源寄存器或者内存
地址 S, 和目的寄存器 R。与不同的 SET 和跳转指令一样，这些指令的结果取决于条件码的值。源值
可以从内存或者源寄存器中读取，但是只有在指定的条件满足时，才会被复制到目的寄存器中。    

源和目的的值可以是 16 位，32位或 64 位长，不支持单字节的条件传送。汇编器可以从目的寄存器
的名字推断出条件传送指令的操作数长度，所以对所以操作数长度，都可以使用同一个指令名字。   

![cmov-instructions](https://raw.githubusercontent.com/temple-deng/markdown-images/master/computer-system/cmov-instructions.png)    

不是所有的条件表达式都可以用条件传送来编译。最重要的是，无论测试结果如何，我们给出的抽象
代码会对 then-expr 和 else-expr 都求值。如果这两个表达式中的任意一个可能产生错误条件
或者副作用，就会导致非法的行为。    

### 3.6.7 循环

C 语言提供了多种循环结构，即 do-while, while 和 for。汇编中没有相应的指令存在，可以用
条件测试和跳转组合来实现循环的效果。GCC 和其他汇编器产生的循环代码主要基于两种基本的循环模式。    

1. **do-while循环**     

```c
do
  body-statement
  while(test-expr);
```    

这种通用形式可以被翻译成如下所示的条件和 goto 语句：   

```
loop:
  body-statement
  t = test-expr;
  if (t)
    goto loop;
```    

```c
long fact_do(long n) {
  long result = 1;
  do {
    result *= n;
    n = n-1;
  } while(n > 1);
  return result;
}
```    

对应的汇编代码：    

```asm
// long fact_do(long n)
// n in %rdi
fact_do:
  movl    $1, %eax    // Set result = 1
.L2
  imulq   %rdi, %rax
  subq    $1, %rdi
  cmpq    $1, %rdi
  jg      .L2
  req; ret
```    

2. **while循环**    

while 语句的通用形式如下：   

```c
while (test-expr)
  body-statement
```    

有很多种方法将 while 循环翻译成机器代码，GCC 在代码生成中使用其中的两种方法。这两种方法
使用同样的循环结构，与 do-while 一样，不过它们实现初始测试的方法不同。    

第一种翻译方法，我们称之为跳转到中间，它执行一个无条件跳转跳到循环结尾处的测试，以此来执行
初始的测试。可以用以下模板来表达这种方法：    

```
  goto test;
loop:
  body-statement
test:
  t = test-expr
    if (t)
      goto loop;
```    

```c
long fact_while(long n) {
  long result = 1;
  while( n > 1) {
    result *= n;
    n = n - 1;
  }
  return result;
}
```    

对应的汇编代码如下：    

```
// long fact_while(long n)
// n in %rdi
fact_while:
  movl    $1, %eax      // Set result = 1
  jmp     .L5           // Goto test
.L6:
  imulq   %rdi, %rax
  subq    $1, %rdi
.L5:
  cmpq    $1, %rdi
  jg      .L6
  req; ret
```    

第二种翻译方法，我们称之为 guarded-do，首先用条件分支，如果初始条件不成立就跳过循环，把
代码转换为 do-while 循环。     

```c
t = test-expr;
if (!t)
  goto done;
do 
  body-statement
  while(test-expr);
done:
```    

相应地可以将它翻译成 goto 代码如下：   

```c
t = test-expr;
if (!t)
  goto done;
loop:
  body-statement;
  t = test-expr;
  if (t)
    goto loop;
done:
```    

```c
long fact_while(long n) {
  long result = 1;
  while( n > 1) {
    result *= n;
    n = n - 1;
  }
  return result;
}
```   

对应的汇编代码：   

```
// long fact_while(long n)
// n in %rdi
fact_while:
  cmpq      $1, %rdi
  jle       .L7             // If <=, goto done
  movl      $1, %eax
.L6:
  imulq     %rdi, %rax
  subq      $1, %rdi
  cmpq      $1, %rdi
  jne       .L6
  req; ret
.L7:
  movl      $1, %eax
  ret
```    

3. **for循环**     

fGCC 为 for 循环产生的代码是 while 循环的两种翻译之一，这取决于优化的等级。    

### 3.6.8 switch 语句

```c
void switch_eg(long x, long n, long *dest) {
  long val = x;
  switch (n) {
    case 100:
      val *= 13;
      break;

    case 102:
      val += 10;
      /* Fall through */

    case 103:
      val += 11;
      break;

    case 104:
    case 106:
      val *= val;
      break;

    default:
      val = 0;
  }
  *dest = val;
}
```    

原始的 C 代码有针对值 100，102-104 和 106 的情况，但是开关变量 n 可以是任意整数。编译器
首先将 n 减去 100，把取值范围移到 0 和 6 之间，创建一个新的程序变量。补码表示的负数会
映射无符号表示的大正数，利用这一事实，将这个程序变量看成无符号值。可以通过测试这个变量是否
大于 6 判定其是否在 0~6 的范围之外。根据这个程序变量的值，有五个不同的跳转位置：.L3, .L5,
.L6, .L7, .L8，最后一个是默认的目的地址。每个标号都标识一个实现某个情况分支的代码块。     

```
// void switch_eg(long x, long n, long *dest)
// x in %rdi, n in %rsi, dest in %rdx
switch_eg:
  subq       $100, %rsi           // Compute index = n - 100
  cmpq       $6, %rsi             // Compare index:6
  ja         .L8                  // If >, goto loc_def
  jmp        *.L4(, %rsi, 8)      // Goto *jt[index]
.L3:
  leaq       (%rdi, %rdi, 2), %rax  // 3*x
  leaq       (%rdi, %rax, 4), %rdi  // val = 13 * x
  jmp        .L2                    // Goto done
.L5:
  addq       $10, %rdi
.L6:
  addq       $11, %rdi
  jmp        .L2
.L7:
  imulq      %rdi, %rdi
  jmp        .L2
.L8
  movl       $0, %edi
.L2:
  movq       %rdi, (%rdx)
  ret
```    

在汇编代码中，跳转表用以下声明表示，我们添加了一些注释：    

```asm
    .section      .rodata
    .align 8       // Align address to multiple of 8
  .L4
    .quad     .L3    // Case 100
    .quad     .L8    // Case 101
    .quad     .L5    // Case 102
    .quad     .L6    // Case 103
    .quad     .L7    // Case 104
    .quad     .L8    // Case 105
    .quad     .L7    // Case 106
```     

## 3.7 过程

要提供对过程的机器级支持，必须要处理许多不同的属性，为了讨论方便，假设过程 P 调用过程 Q，
Q 执行后返回到 P。这些动作包括下面一个或多个机制：    

+ 传递控制。在进入过程 Q 的时候，程序计数器必须被设置为 Q 的代码的起始地址，然后在返回时，
要把程序计数器设置为 P 中调用 Q 后面那条指令的地址。
+ 传递数据。P 必须能够向 Q 提供一个或多个参数，Q 必须能够向 P 返回一个值。
+ 分配和释放内存。在开始时，Q 可能需要为局部变量分配空间，而在返回前，由必须释放这些存储空间。

### 3.7.1 运行时栈

当 x86-64 过程需要的存储空间超出寄存器能够存放的大小时，就会在栈上分配空间。这个部分称为
过程的 **栈帧**。    

![stack](https://raw.githubusercontent.com/temple-deng/markdown-images/master/computer-system/stack.png)    

当过程 P 调用过程 Q 时，会把返回地址压入栈中，指明当 Q 返回时，要从 P 程序的哪个位置继续
执行。我们把这个返回地址当做 P 的栈帧的一部分，因为它存放的是与 P 相关的状态。Q 的代码会
扩展当前栈的边界，分配它的栈帧所需的空间，在这个空间中，它可以保存寄存器的值，分配局部变量
空间，为它调用的过程设置参数。大多数过程的栈帧都是定长的，在过程的开始就分配好了，但有些
过程需要变长的帧。通过寄存器，过程 P 可以传递最多 6 个整数值（也就是指针和整数），
但是如果 Q 需要更多的参数，P 可以在调用 Q 之前在自己的栈帧中存储好这些参数。   

为了提供空间和时间效率，x86-64 过程只分配自己所需要的栈帧部分，例如，许多过程有 6 个或者更少
的参数，那么所有的参数都可以通过寄存器传递。因此，图 3-25 中画出的某些栈帧部分可以省略。实际
上，许多函数甚至不需要栈帧，。当所有的局部变量都可以保存在寄存器中，而且该函数不会调用任何其他
函数，就可以这样处理。例如，目前为止，我们仔细审视过的所有函数都不需要栈帧。    

### 3.7.2 转移控制

将控制从函数 P 转移到函数 Q 只需要简单地把程序计数器设置为 Q 的代码起始为止。不过，当稍后
从 Q 返回的时候，处理器必须记录好它需要继续 P 的执行的代码位置。在 x86-64 机器中，这个信息
是用指令 **call Q** 调用过程 Q 来记录的。该指令会把地址 A 压入栈中，并将 PC 设置为 Q 的
起始地址。对应的指令 ret 会从栈中弹出地址 A，并把 PC 设置为 A。    


指令 | 描述
----------|---------
 call Label | 过程调用
 call *Operand | 过程调用
 ret | 从过程调用中返回

下面说明了 3.2.2 节中介绍的 multstore 和 main 函数的 call 和 ret 指令的执行情况：   

```
// Beginning of function multstore
0000000000400540 <multstore>:
    400540:  53           push  %rbx
    400541:  48 89 d3     mov %rdx, %rbx
    .....

// Return from function multstore
    40054d:  c3           retq
....

// Call to multstore from main
    400563:  e8 d8 ff ff ff   callq  400540 <multstore>
    400568:  48 8b 54 24 08   mov    0x8(%rsp), %rdx
```     

在这段代码中我们可以看到，在 main 函数中，地址为 0x400563 的 call 指令调用函数 multstore。
此时的状态如图 3-26a 所示，指明了栈指针 %rsp 和程序计数器 %rip 的值。call 的效果是将
返回地址 0x400568 压入栈中，并跳转函数 multstore 的第一条指令，地址为 0x0400540。函数
multstore 继续执行，知道遇到地址 0x40054d 处的 ret 指令。这条指令从栈中弹出值 0x400568，
然后跳转到这个地址，就在 call 指令之后，继续 main 函数执行。    

![call-ret-case1](https://raw.githubusercontent.com/temple-deng/markdown-images/master/computer-system/call-ret-case1.png)   

38-40 正好 8 个字节 64 位，一个地址值。    

图 3-27a 给出了两个函数 top 和 leaf 的反汇编代码，以及 main 函数中调用 top 处的代码。   

![3-27a](https://raw.githubusercontent.com/temple-deng/markdown-images/master/computer-system/3-27a.png)   

![3-27b](https://raw.githubusercontent.com/temple-deng/markdown-images/master/computer-system/3-27b.png)   

注意第二张图里好像有问题，地址好像不对。    

### 3.7.3 数据传送

当调用一个过程时，除了要把控制传递给它并在过程返回时再传递回来之外，过程调用还可能包括把
数据作为参数传递，而从过程返回时还有可能包括一个返回值。x86-64 中，大部分过程间的数据传送
是通过寄存器实现的。当过程 P 调用过程 Q 时，P 的代码必须首先把参数复制到适当的寄存器中。
类似地，当 Q 返回到 P 时，P 的代码可以访问寄存器 %rax 中的返回值。     

x86-64 中，可以通过寄存器最多传递 6 个整型（例如整数和指针）参数，寄存器的使用是有特殊
顺序的，寄存器使用的名字取决于要传递的数据类型的大小。    

如果一个函数有大于 6 个整型参数，超过 6 个的部分就要通过栈来传递。把参数 7~n 放到栈上，
而参数 7 位于栈顶。通过栈传递参数时，所有的数据大小都向 8 的倍数对齐。    

### 3.7.4 栈上的局部存储

到目前为止我们看到的大多数过程示例都不需要超出寄存器大小的本地存储区域。不过有些时候，局部
数据必须存放在内存中，常见的情况包括：   

+ 寄存器不足够存放所有的本地数据
+ 对一个局部变量使用地址运算符 '&'，因此必须能够为它产生一个地址
+ 某些局部变量时数组或结构体，因此必须能够通过数据或结构引用被访问到。     

一般来说，过程通过减小栈指针在栈上分配空间。分配的结果作为栈帧的一部分，标号为“局部变量”。    

```c
long swap_add(long *xp, long *yp) {
  long x = *xp;
  long y = *yp;
  *xp = y;
  *yp = x;
  return x + y;
}

long caller() {
  long arg1 = 534;
  long arg2 = 1057;
  long sum = swap_add(&arg1, &arg2);
  long diff = arg1 - arg2;
  return sum * diff;
}
```    

对应的汇编代码如下：    

```asm
// long caller()
caller:
  subq      $16, %rsp       // Allocate 16 bytes for stack frame
  movq      $534, (%rsp)    // Store 534 in arg1
  movq      $1057, 8(%rsp)  // Store 1057 in arg2
  leaq      8(%rsp), %rsi   // Compute &arg2 as second argument
  movq      %rsp, %rdi      // Compute &arg1 as first argument
  call      swap_add
  movq      (%rsp), %rdx    // Get arg1
  subq      8(%rsp), %rdx   // Compute diff = arg1 - arg2
  imulq     %rdx, %rax      // Compute sum * diff
  addq      $16, %rsp       // Deallocate stack frame
  ret
```    

下面是一个更复杂的例子：    

```c
long call_proc() {
  long x1 = 1;
  int x2 = 2;
  short x3 = 3;
  char x4 = 4;
  proc(x1, &x1, x2, &x2, x3, &x3, x4, &x4);
  return (x1+x2) * (x3-x4);
}
```    

我们首先分析一下，由于四个参数都使用了取地址符，那么四个值就都必须在栈帧中分配内存空间存储
局部变量，其次，由于是 8 个参数，那么 x4, 和 &x4 的值也要分配在栈帧上。     

汇编代码如下：    

```asm
// long call_proc()
call_proc:
  subq       $32, %rsp              // Allocate 32 bytes stack frame
  movq       $1, 24(%rsp)           // Store 1 in &x1
  movl       $2, 20(%rsp)           // Store 2 in &x2
  movw       $3, 18(%rsp)           // Store 3 in &x3
  movb       $4, 17(%rsp)           // Stroe 4 in &x4
  leaq       17(%rsp), %rax         // Create &x4
  movq       %rax, 8(%rsp)          // Store &x4 as argument 8
  movl       $4, (%rsp)             // Store 4 as argument 7
  leaq       18(%rsp), %r9          // Pass &x3 as argument 6
  movl       $3, %r8d               // Pass 3 as argument 5
  leaq       20(%rsp), %rcx         // Pass &x2 as argument 4
  movl       $2, %edx               // Pass 2 as argument 3
  leaq       24(%rsp), %rsi         // Pass &x1 as argument 2
  movl       $1, %edi               // Pass 1 as argument 1
  call       proc
  // Retrieve changes to memory
  movslq     20(%rsp), %rdx         // Get x2 and convert to long
  addq       24(%rsp), %rdx         // Compute x1 + x2
  movswl     18(%rsp), %eax         // Get x3 and convert to int
  movsbl     17(%rsp), %ecx         // Get x4 and convert to int
  subl       %ecx, %eax             // Compute x3 - x4
  cltq                              // Convert to long
  imulq      %rdx, %rax             // Compute (x1 + x2) * (x3 - x4)
  addq       $32, %rsp              // Deallocate stack frame
  ret
```    

不是很理解 x4 命名只占一个字节，但是为什么在栈顶给其分配了 8 个字节的空间。    

### 3.7.5 寄存器中的局部存储空间

寄存器组是唯一被所有过程共享的资源。虽然在给定时刻只有一个过程是活动的，我们仍然必须确保
当一个过程调用另一个过程时，被调用者不会覆盖调用者稍后会使用的寄存器值。为此，x86-64 采用
了一组统一的寄存器使用惯例，所有的过程都必须遵循。    

根据惯例，寄存器 %rbx, %rbp 和 %r12~%r16 被划分为被 **调用者保存** 寄存器。当过程 P 调用
过程 Q 时，Q 必须保存这些寄存器的值，保证它们的值在 Q 返回到 P 时与 Q 被调用时是一样的。
过程 Q 保存一个寄存器的值不变，要么就是根本不去改变它，要么就是把原始值压入栈中，改变
寄存器的值，然后再返回前从栈中弹出旧值。压入寄存器的值会在栈帧中创建标号“保存的寄存器”
的一部分。    

所有其他的寄存器，除了栈指针 %rsp，都分类为 **调用者保存** 寄存器。这就意味着任何函数都
能修改它们。     

