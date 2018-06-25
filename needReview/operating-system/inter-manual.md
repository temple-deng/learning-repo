# Chapter 3. Basic Execution Enviroment

本章介绍汇编语言程序员看到的Intel 64或IA-32处理器的基本执行环境。 它描述了处理器如何执行
指令以及它如何存储和操纵数据。这里描述的执行环境包括存储器（地址空间），通用数据存储器，
段寄存器，标志寄存器和指令指针寄存器。   

## 3.1 Modes of Operation

IA-32 架构支持3种操作模式：保护模式、实模式、系统管理模式。每种模式决定了其可以使用的指令
及功能：     

+ **Protected mode** - 保护模式的特殊功能之一是能够在受保护的多任务环境中直接执行 "实模式"
的 8086 软件，这一功能也叫做虚拟 8086 模式。
+ **Real-address mode** - 当处理器加电或重置的时候就处于这一模式。
+ **System management mode(SMM)**     

64 位架构增加了 IA-32e 模式，IA-32e 模式有两个子模式。    

+ 兼容模式(IA-32e 子模式)——兼容模式允许大多数传统的 16 位和 32位应用程序在 64 位系统
下无需重新编译而运行。为简洁起见，兼容子模式在 IA-32 架构中称为兼容模式，兼容模式的执行环境与
3.2 节描述的相同。兼容模式也支持 64 位和保护模式下的所有特权级别。以虚拟8086模式运行或使用硬件
任务管理的传统应用程序在此模式下不起作用。  

操作系统在代码段的基础上启用兼容模式。这意味着一个 64 位系统可以支持以 64 位模式运行的 64 位
运行程序，并支持在兼容模式下运行的旧版 32 位应用程序。  

兼容模式类似于 32 位中的保护模式。应用最多只能访问线性地址空间的头 4GB 地址。不过在使用 PAE 功能
的情况下，应用还是可以访问大于 4GB 的物理内存的。  

+ 64位模式(IA-32e 子模式)——就是普通的 64 位模式而已，应用程序可以访问 64 位总线的地址空间。
64 位模式将通用寄存器和 SIMD 扩展寄存器的数量从 8 扩展到 16.通用寄存器为 64 位宽。这一模式
还引入了一个新的操作码 opcode prefix(REX)来访问寄存器扩展。  

64 位模式也是操作系统在代码段的基础上启用的。默认的地址总线为 64 位，默认的操作数大小为 32位。
使用REX操作码前缀与操作数大小覆盖前缀一起，可以逐条指令地覆盖默认操作数大小。也就意思是使用 REX
这个技术是可以把默认的 32 位操作数扩展到 64 位，是这个意思吧？      

在使用 REX 前缀后，许多现存的指令能够使用 64 位的寄存器以及 64 位的地址总线空间。    

## 3.2 Overview of the Basic Execution Environment

运行在 IA-32 处理器上的任何程序和任务，都被给予了一个资源集，用来执行指令，存储代码、数据和状态
信息。这些资源集构成了 IA-32 处理器的基本执行环境。64 位架构也类似，只不过提供了运行 64 位程序的能力。   

基本执行环境由应用程序和运行在处理器上的操作系统共同使用。   

+ 地址空间 —— IA-32 架构上的程序可定位的线性地址最大是 4GB，但是物理地址最大是 64 GB。应该是
使用 PAE 扩展。
+ 基础程序执行寄存器 —— 8个通用寄存器，6个段寄存器，EFLAGS、EIP 寄存器。
+ x87 FPU 寄存器 —— 略。
+ MMX，XMM，YMM，边界寄存器 —— 略。
+ BNDCFGU and BNDSTATUS —— 略。
+ 堆 —— 为了支持过程或子程序调用以及在过程或子程序之间传递参数，执行环境中包含堆栈和堆栈管理资源。

除了基本执行环境提供的资源外， IA-32 架构还提供了一些系统级别架构的资源集。主要是提供给操作系统
和系统级别的软件。     

+ I/O 端口 —— 支持从 I/O 端口传输数据
+ 控制 Control 寄存器 —— 5个控制寄存器 CR0-CR4.决定了处理器的操作模式和当前运行任务的特征。
+ 内存管理寄存器 —— GDTR，IDTR，任务寄存器以及 LDTR 指定了保护模式下内存管理中使用的数据结构
的存放位置。
+ Debug 寄存器 —— DR0-DR7
+ Memory type range 寄存器 MTRRs    
+ 其他的暂略。      

下面总结一下 64 位与 32位架构基本执行环境的不同点:    

+ 地址空间 —— 线性地址空间是 2<sup>64</sup> 字节。不过物理地址空间最大是 2<sup>46</sup> 字节。
+ 基本寄存器 —— 通用寄存器数量加到 16 个，且都是 64 位宽，支持对字节、单字、双字、4字整数的操作。
EIP 和 EFLAGS 也都是 64 位宽。
+ Descriptor table registers —— GDTR、IDTR 都扩展为 10 个字节（80位？）以便来支持完整
的 64 位基址。 LDTR 和任务寄存器 TR 也一样。     

## 3.3 Memory organization

内存管理分别在本章和 Volume3A 中的 "Protected-Mode Memory Management" 介绍。  

### 3.3.1 IA-32 Memory Models

当使用 CPU 的内存管理功能时，程序并不会直接定位物理内存。相反，它们会使用下面三种内存模型之一
来访问内存：flat, segmented, real address mode:   

+ **Flat memory model** - 内存在程序中看起来是一个单一的、连续的地址空间。这一地址空间叫做
**线性地址空间**。代码、数据和堆栈都包含在这一线性空间中。线性地址是可字节寻址的，整个地址是
连续的从 0 到 2<sup>32</sup>-1。线性地址空间中每个字节的地址都可以叫做一个线性地址。
+ **Segmented memory mode** - 内存在程序看起来是一组独立的地址空间的集合，每个独立的地址
空间叫做段。通常，代码、数据和堆栈都是在各自独立的段中。如果想要定位段中的某个字节的地址，程序
需要使用逻辑地址。逻辑地址包含一个段选择子 segment selector 和一个段内偏移量 offset。段
选择子标识出要访问的段，偏移量标识出字节在段内地址空间的位置。32 位处理器最多支持 16383 个不同
尺寸和类型的段，每个段最大都是 4GB。
在内部，系统定义的所有段都必须映射到处理器的线性地址空间。为了访问一个内存的位置，处理器必须把
每个逻辑地址转换为线性地址。  
分段的主要目的是提供程序的可靠性。比如不分段如果堆栈一直增长，最后覆盖了数据段和代码段的内容就不好了。  
+ **Real-address mode memory model** - 8086 的内存模型，主要是为了给 8086 的程序提供兼容。
实地址模式的分段内存是一种特殊的实现，可能和其他的不同。     

![three-memory-management-models](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/memory-models.png)

### 3.3.2  Paging and Virtual Memory

在有了 flat 和分段内存模型后，线性地址空间在映射物理地址时，可以选择直接映射，也可以使用分页。
当使用直接映射的时候，每个线性地址都有一个一一对应的物理内存地址。线性地址直接发送给总线，而不进行
其他的变换。    

当使用分页机制后，线性地址分页来映射到虚拟内存。虚拟内存页面之后再映射到物理内存。不管是分段
还是分页对应用程序来说都是透明的，应用程序只能看到一个线性的地址空间。     

IA-32 架构的分页机制可以支持两种扩展：    

+ Physical Address Extensions(PAE) 支持大于 4GB 的物理地址空间
+ Page Size Extensions(PSE) 支持 4MB 的页大小      

### 3.3.4 Modes of Operation vs. Memory Model

+ **保护模式** —— 可以使用本节所描述的所有内存模型。
+ **实模式** —— 只能使用实地址内存模型。
+ **SMM 模式** —— 略。
+ **兼容模式** —— 类似于 32 位的保护模式
+ **64 位模式** —— 通常来说会禁用分段，而直接创建一个 flat 64 位线性空间。特别地，处理器会
将 CS、DS、ES 和 SS 的段基址看做 0 。分段和实地址模型在 64 位下不可用。     

## 3.4  Basic Program Execution Registers

IA-32 架构为系统和应用程序提供了 16 个基本的寄存器，这些寄存器可以这样分类：    

+ **General-purpose registers**.这 8 个寄存器用来存储操作数和指针
+ **Segment registers**. 这些寄存器保存了 6 个段选择子
+ **EFLAGS(PSW) register**. 进程的执行状态和 CPU 的权限限制
+ **EIP register**. 保存了指向下条指令的 32 位指针     

### 3.4.1 通用寄存器

8 个通用寄存器用来保存如下内容：    

+ 逻辑和算术操作的操作数
+ 地址计算的操作数
+ 内存指针      

唯一需要特殊注意的是 ESP，ESP 保存了堆栈指针，而且不应该做其他的用处。    

![system-registers](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/general-and-programming-registers.png)


注意根据图中的意思，段寄存器都是 16 位的。      

下面总结了一下每个通用寄存器自身的一个特殊作用：    

+ EAX - 操作数和结果数据的累加器
+ EBX - 指向 DS 段中数据的指针
+ ECX - 字符串和循环操作的计数器
+ EDX - I/O 指针
+ ESI - 指向 DS 寄存器中所指向的段中的数据的指针；字符串操作的源指针
+ EDI - 指向 ES 寄存器所指向的段中的数据的指针；字符串操作的目的指针
+ ESP - 堆栈指针（SS 段）
+ EBP - 指向堆栈中的数据的指针（SS 段）      

### 3.4.2 Segment Registers

段寄存器中保存着 16 位的段选择子。如果使用这些寄存器取决于系统当前使用的内存的管理模型。在 flat
模型中，段寄存器中的段选择子指向的段是可能会出现重叠的，这些段都从线性地址空间地址 0开始。这些
重叠的段构成了程序的线性地址空间。     

![flat-model-segment-registers](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/flat-model-segment-selector.png)

当使用分段内存模型后，每个段寄存器中都会加载一个不同的段选择子，以便每个段寄存器可以指向线性地址
空间内的不同段。因此，无论何时，程序最多可以访问线性地址空间上的 6 个段。    

![segmented-model-segment-selector](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/segmented-model-segment-selector.png)

每个段寄存器都和一种存储类型相关：代码、数据或者堆栈。例如，CS 寄存器包含了代码段的段选择子，代码
段存储了要被执行的指令。处理器使用 CS 寄存器中的段选择子和 EIP 寄存器中的内容来确定一个逻辑地址，
之后处理器就可以去这个地址取回指令。CS 寄存器不能被应用程序显示地设置，相反，之后被指令或处理
器内部的操作来隐式地设置。     

DS、ES、FS 和 GS 寄存器指向了 4 个数据段。      

SS 寄存器包含了堆栈段的段选择子。所有的堆栈操作都是 SS 寄存器来寻找堆栈段的位置。与 CS 不同，
应用程序可以显示设置 SS 寄存器，以便可以建立多个堆栈并在其中来回切换。      

### 3.4.3 EFLAGS 寄存器

32 位的 EFLAGS 寄存器包含一组状态标记，一个控制标记和一组系统标记。    

![eflags-register](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/eflags-register.png)

在处理器完成初始化后，EFLAGS 寄存器被设置为 00000002H。1,3,5,15,22-31 这几个 bit 是保留的。     

一些标志位是可以使用特殊的指令直接修改的。但是没有指令可以一次性整个修改整个寄存器的内容。     

当暂停一个任务时（进程切换），处理器会自动地将 EFLAGS 寄存器的状态保存在 task state segment(TSS)。
然后当新进程加载时，处理器又会从取出新任务的 TSS 中的数据来加载 EFLAGS。     

当调用中断或者异常处理程序时，处理器会自动在程序堆栈中保存 EFLAGS 寄存器的状态。当使用任务切换
来处理一个中断或异常时，会将当前暂停的程序 EFLAGS 的状态保存在 TSS 中。    

等一下，上面的内容有点不懂，这个主动调用中断和后面的任务切换中断不是一个概念吗？？？？      

至于各个标识具体的作用，这里就不详细介绍了。     

## 3.5 Instruction Pointer

EIP 中包含了下条要执行指令在当前代码段中的偏移量。它是从一条代码的边界直线前进到下一条代码，或者
在执行 `JMP, Jcc, CALL, RET, IRET` 指令时前进或后退多条指令。    

EIP 寄存器不能被软件直接访问，它是一些控制流指令例如 `JMP, Jcc, CALL, RET, IRET`，中断
和异常隐式地控制的。唯一读取 EIP 寄存器的方式是执行一个 CALL 指令，然后从堆栈中读取这个指令
返回的指针指向的值。     


# Chapter 6 Procedure Calls, Interrupts, and Exceptions

## 6.1 Procedure Call Types

处理器支持按照以下的两种方法进行过程调用：   

+ CALL 和 RET 指令
+ ENTER 和 LEAVE 指令，连同 CALL 和 RET 指令     

这两种调用机制都使用了过程的堆栈（严格来说是栈吧 stack）来保存调用过程的状态、传递参数给被调用
的过程，并且为当前执行过程保存本地变量。     

处理器处理中断和异常的方式和这些使用 CALL 和 RET 指令的调用是类似的。     

## 6.2 Stacks

栈是内存中一段连续的数组，其位于一个段中，这个段被 SS 寄存器中的段选择子标记。    

使用 `PUSH` 指令将一个元素入栈，使用 `POP` 指令将一个元素出栈。入栈时，处理器会递减 ESP 寄存器
的值，然后在栈顶写入元素。出栈时，处理器从栈顶读取元素，然后递增 ESP 的值。      

![stack](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/stack.png)

当系统设置了许多的栈时，只要一个栈——当前栈——是这一刻可用的。     

### 6.2.1 Setting Up a Stack

如果要新建一个栈，并把它设置为当前栈，程序或者操作系统必须这样做：   

1. 建立一个栈段
2. 使用 MOV，POP 或者 LSS 指令把栈的段选择子加载到 SS 寄存器中
3. 使用 MOV，POP 或者 LSS 指令将栈指针加载到 ESP 寄存器中     

### 6.2.4 Procedure Linking Information

处理器提供了两种指针用来连接过程：栈帧 stack-frame 基址指针和返回指令指针。当和标准的软件过程
调用技术结合起来时，这些指针允许程序的可靠和一致的链接。    

#### 6.2.4.1 Stack-Fram Base Pointer

栈通常被划分为一帧一帧的。每个栈帧都可以包含本地变量，传递给另一个过程的参数以及过程链接的信息。
栈帧基址指针（包含在 EBP 寄存器中）标识出被调用过程的栈帧内一个固定的参考点。为了使用栈帧基指针，
通常被调用的过程会在将任意的本地变量推入栈之前先把 ESP 的内容拷贝到 EBP 中。这样的话，我们后续
就可以通过这个指针来便捷地访问栈中的数据结构、返回的指令的指针、被调用过程入栈的本地变量。    

#### 6.2.4.2 Return Instruction Pointer

在切换到被调用过程的第一条指令之前，CALL 指令会将当前 EIP 寄存器中的地址推入堆栈中。这个地址被
称为返回指令指针，其指向了当被调用过程返回后，调用过程应该继续执行的指令。在被调用过程返回后，
RET 指令从堆栈中弹出返回指令指针，并用其值设置 EIP 寄存器。    

这里详细的总结一下，首先，根据所查的资料的话，EBP 并不像上图中指向返回指令的地址，而是
指向了返回指令的下一地址（低位）。其次，参数其实是在调用过程的栈帧中，而不是被调用过程的
栈帧中。    

![stack](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/stack-frame.png)    

其次，整个过程调用的过程其实是类似这样的：    

+ 首先，将函数参数压入栈中
+ 之后，执行 CALL 命令，注意这个命令首先会将 EIP 的地址压入栈中。
+ 之后，进入被调用过程，在被调用过程的一开始，将 EBP 的值压入占中（其实是保持当前的栈帧值）
+ 然后将 ESP 的值更新到 EBP 中，因此其实之后的 EBP 中保存的就是被调用过程的栈帧指针
+ 之后就是调用过程了
+ 调用的最后，释放堆栈，直接将 ESP 的值用 EBP 更新就好
+ 然后跳出当前过程，过程返回       

```asm
pushl %ebp
movl %ebp, %esp
....
movl %esp, %ebp
popl %ebp
```    

## 6.3 Calling Procedures Using CALL and RET

CALL 指令允许控制转换到当前代码段（near call）或者另一个不同的代码段（far call）中的过程
上。同理 RET 也是。     

### 6.3.1 Near CALL and RET Operation

执行 near call 的流程如下：   

1. 将 EIP 的值推入堆栈
2. 将被调用过程的偏移量加载到 EIP 中
3. 开始执行被调用过程

返回时是这个流程：   

1. 将栈顶值（返回指令指针）弹出到 EIP 中
2. 如果 RET 指令有一个可选的参数 n，递增 n 字节栈指针来释放栈中的参数
3. 恢复调用过程的执行

### 6.3.2 Far CALL and RET Operaion

far call 的流程如下：   

1. 将 CS 的值压入栈中
2. 将 EIP 的值压入栈中
3. 在 CS 中加载被调用过程的段的段选择子
4. 在 EIP 中加载被调用过程的偏移量
5. 执行被调用过程

返回流程如下：    

1. 将栈顶的返回指令指针弹出到 EIP 中
2. 将栈顶的段选择子弹到 CS 中
3. 同 near call 的第二步，第三步

![stack-on-calls](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/stack-on-calls.png)   

### 6.3.5 Calls to Other Privilege Levels

IA-32 架构的保护机制分了 4 个特权级，0-3, 0为最高。      

![privilege-levels](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/privilege-levels.png)    

首先注意一下，这里的特权级好像是针对段来说的，而不是针对进程整个的内存来说的。     

较低权限段中的代码模块只能通过称为门 gate 的严格控制和保护接口访问在较高权限段运行的模块。
尝试访问较高权限段而不通过保护门并且没哟足够的访问权限会导致生成一个 general-protection
exception(#GP)。     

如果一个操作系统执行了对更高特权级的一个过程调用，其处理流程类似于 far call，除了以下的
不同：   

+ 提供给 CALL 指令的段选择子引用了一个叫做 **call gate descriptor** 的特殊数据结构。
这个描述符提供以下的信息：
  - 访问权力信息
  - 被调用过程的代码段段选择子
  - 代码段的段内偏移
+ 处理器切换到新的栈上来执行被调用过程。每个特权级都有其自己的栈。特权级 3 的段选择子和
堆栈指针存储在 SS 和 ESP 中，当调用其他特权级的过程时会自动装载。其他特权级的选择子和指针
存放在一个叫做 taks state segment(TSS) 的系统段中。    

### 6.3.6 CALL and RET Operation Between Privilege Levels

上面应该介绍了系统内部进行特权级切换的调用时的处理。这一节应该介绍的是普通的程序的特权级
切换的调用。   

当进行一个对更高特权级的过程的调用，处理器会这样处理：    

1. 执行一次访问权限检查
2. 临时存储当前 SS, ESP, CS 和 EIP 寄存器中的内容
3. 从 TSS 中加载新栈的段选择子和堆栈指针到 SS 和 ESP 寄存器中
4. 在新的堆栈中推入临时保存的 SS 和 ESP 的值
5. 从调用过程的堆栈中复制参数到新栈中。调用门描述符中的某个值决定了要复制多少个参数。
6. 在新的堆栈中推入临时保存的 CS 和 EIP 值
7. 将新的代码段的段选择子和指令指针加载到 CS 和 EIP 中
8. 开始被调用过程的执行

返回时：    

1. 执行特权检查
2. 恢复先前调用的 CS 和 EIP 的寄存器的值
3. RET 参数的问题
4. 恢复 SS 和 ESP 的值
5. 仍然是 RET 参数问题（因为参数在两个堆栈上都存在）
6. 恢复调用过程的执行

## 6.4 Interrupts And Exception

处理器提供了两种机制来中断程序的执行，中断和异常：    

+ 中断通常是 I/O 设备触发的一个异步的事件
+ 异常是当处理器在执行指令时检测到一个或多个预定义条件时生成的同步事件。IA-32 架构指定
了 3 类异常：faults, traps 和 aborts     

处理器以基本相同的方式来响应中断和异常。当中断或异常发生时，处理器会挂起当前进程然后切换到
用来处理中断和异常的过程上来。处理器通过一个位于 interrupt descriptor table(IDT) 中的
一个入口还访问处理过程。当处理过程完成了中断或异常的处理，处理器将控制权返回给被打断的进程。     

IA-32 架构定义了 18 个预定义的中断和异常以及 224 个用户定义的中断，这些中断都与 IDT 表
项相关联。IDT 中的每个中断和异常都用一个数字来标识，这个数字叫做 **向量** vector。     

### 6.4.1 Call and Return Operation for Interrupt or Exception Handling Procedures

对中断或者异常处理例程的调用与一个对另一个特权级的过程进行调用类似。只不过，中断向量
引用了 IDT 中两种门之一：**interrupt gate** 或者 **trap gate**。这两个类似，提供以下的
信息：    

+ 访问权力信息
+ 处理例程的代码段段选择子
+ 处理例程第一条指令的代码段偏移量      

两者之间的不同点是。如果是通过中断门调用的处理例程，处理器会清空 EFLAGS 中的 IF(interrupt enable) 标志位，
来阻止后续的中断干扰处理例程的执行。当使用陷阱门的时候，IF 标志不会变动。    

如果处理例程的代码段和当前执行进程有相同的特权级，处理例程就使用当前的堆栈；如果是处于更高
特权级，要切换堆栈、      



