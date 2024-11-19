# Inter 开发手册

<!-- TOC -->

- [Inter 开发手册](#inter-开发手册)
- [Chapter 3. Basic Execution Enviroment](#chapter-3-basic-execution-enviroment)
  - [3.1 Modes of Operation](#31-modes-of-operation)
  - [3.2 Overview of the Basic Execution Environment](#32-overview-of-the-basic-execution-environment)
  - [3.3 Memory organization](#33-memory-organization)
    - [3.3.1 IA-32 Memory Models](#331-ia-32-memory-models)
    - [3.3.2  Paging and Virtual Memory](#332--paging-and-virtual-memory)
    - [3.3.4 Modes of Operation vs. Memory Model](#334-modes-of-operation-vs-memory-model)
  - [3.4  Basic Program Execution Registers](#34--basic-program-execution-registers)
    - [3.4.1 通用寄存器](#341-通用寄存器)
    - [3.4.2 Segment Registers](#342-segment-registers)
      - [3.4.2.1 Segment Registers in 64-Bit Mode](#3421-segment-registers-in-64-bit-mode)
    - [3.4.3 EFLAGS 寄存器](#343-eflags-寄存器)
  - [3.5 Instruction Pointer](#35-instruction-pointer)
- [Chapter 6 Procedure Calls, Interrupts, and Exceptions](#chapter-6-procedure-calls-interrupts-and-exceptions)
  - [6.1 Procedure Call Types](#61-procedure-call-types)
  - [6.2 Stacks](#62-stacks)
    - [6.2.1 Setting Up a Stack](#621-setting-up-a-stack)
    - [6.2.4 Procedure Linking Information](#624-procedure-linking-information)
      - [6.2.4.1 Stack-Fram Base Pointer](#6241-stack-fram-base-pointer)
      - [6.2.4.2 Return Instruction Pointer](#6242-return-instruction-pointer)
  - [6.3 Calling Procedures Using CALL and RET](#63-calling-procedures-using-call-and-ret)
    - [6.3.1 Near CALL and RET Operation](#631-near-call-and-ret-operation)
    - [6.3.2 Far CALL and RET Operaion](#632-far-call-and-ret-operaion)
    - [6.3.5 Calls to Other Privilege Levels](#635-calls-to-other-privilege-levels)
    - [6.3.6 CALL and RET Operation Between Privilege Levels](#636-call-and-ret-operation-between-privilege-levels)
  - [6.4 Interrupts And Exception](#64-interrupts-and-exception)
    - [6.4.1 Call and Return Operation for Interrupt or Exception Handling Procedures](#641-call-and-return-operation-for-interrupt-or-exception-handling-procedures)
  - [Summary](#summary)
- [Chapter 7 Programming With General-Purpose Instructions](#chapter-7-programming-with-general-purpose-instructions)
  - [7.3.8 Control Transfer Instructions](#738-control-transfer-instructions)
    - [7.3.8.1 Unconditional Transfer Instructions](#7381-unconditional-transfer-instructions)
    - [7.3.8.4 Software Interrupt Instructions](#7384-software-interrupt-instructions)
- [Chapter 2 System Architecture Overview](#chapter-2-system-architecture-overview)
  - [2.1 Overview of the System-Level Architecture](#21-overview-of-the-system-level-architecture)
    - [2.1.1 Global and Local Descriptor Tables](#211-global-and-local-descriptor-tables)
    - [2.1.2 System Segments, Segment Descriptor, and Gates](#212-system-segments-segment-descriptor-and-gates)
    - [2.1.3 Task-State Segments and Task Gates](#213-task-state-segments-and-task-gates)
    - [2.1.4 Interrupt and Exception Handling](#214-interrupt-and-exception-handling)
  - [2.3 System Flags and Fields in the EFLAGS Register](#23-system-flags-and-fields-in-the-eflags-register)
  - [2.4 Memory-Management Registers](#24-memory-management-registers)
    - [2.4.1 Global Descriptor Table Register(GDTR)](#241-global-descriptor-table-registergdtr)
    - [2.4.2 Local Descriptor Table Register(LDTR)](#242-local-descriptor-table-registerldtr)
    - [2.4.3 IDTR Interrupt Descriptor Table Register](#243-idtr-interrupt-descriptor-table-register)
    - [2.4.4 Task Register(TR)](#244-task-registertr)
- [Chapter 3 Protected-Mode Memory Management](#chapter-3-protected-mode-memory-management)
  - [3.1 Memory Management Overview](#31-memory-management-overview)
  - [3.2 Using Segments](#32-using-segments)
    - [3.2.1 Basic Flat Model](#321-basic-flat-model)
  - [3.4 Logical and Linear Addresses](#34-logical-and-linear-addresses)
    - [3.4.2 Segment Selectors](#342-segment-selectors)
    - [3.4.3 Segment Registers](#343-segment-registers)
    - [3.4.5 Segment Descriptors](#345-segment-descriptors)
      - [3.4.5.1 Code- and Data-Segment Descriptor Types](#3451-code--and-data-segment-descriptor-types)
  - [3.5 System Descriptor Types](#35-system-descriptor-types)
    - [3.5.1 Segment Descriptor Tables](#351-segment-descriptor-tables)
- [Chapter 4 Paging](#chapter-4-paging)
  - [4.1 Pagin Modes and Control Bits](#41-pagin-modes-and-control-bits)
  - [4.2 Hierarchical Paging Structures: an Overview](#42-hierarchical-paging-structures-an-overview)
  - [4.3 32-Bit Paging](#43-32-bit-paging)
  - [4.6 Access Rights](#46-access-rights)
    - [4.6.1 Determination of Access Rights](#461-determination-of-access-rights)
- [Chapter 5 Protection](#chapter-5-protection)
  - [5.2 Fields and Flags Used For Segment-Level and Page-Level Protection](#52-fields-and-flags-used-for-segment-level-and-page-level-protection)
  - [5.4 Type Checking](#54-type-checking)
  - [5.5 Privilege Levels](#55-privilege-levels)
- [Chapter 6 Interrupt and Exception Handling](#chapter-6-interrupt-and-exception-handling)
  - [6.2 Exception and Interrupt Vectors](#62-exception-and-interrupt-vectors)
  - [6.3 Sources of Interrupts](#63-sources-of-interrupts)
  - [6.4 Sources of Exception](#64-sources-of-exception)
    - [6.4.1 Program-Error Exception](#641-program-error-exception)
    - [6.4.2 Software-Generated Exception](#642-software-generated-exception)
  - [6.5 Exception Classifications](#65-exception-classifications)
  - [6.6 Program or Task Restart](#66-program-or-task-restart)
- [Chapter 7 Task Management](#chapter-7-task-management)
  - [7.1 Task Management Overview](#71-task-management-overview)
    - [7.1.1 Task Structure](#711-task-structure)
    - [7.1.2 Task State](#712-task-state)
- [Chapter 9 Processor Management and Initialization](#chapter-9-processor-management-and-initialization)
    - [9.1.4 First Instruction Executed](#914-first-instruction-executed)

<!-- /TOC -->

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
+ **Segmented memory model** - 内存在程序看起来是一组独立的地址空间的集合，每个独立的地址
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
+ EBP - 指向堆栈中的数据的指针（SS 段）（指向栈帧吧）      

### 3.4.2 Segment Registers

段寄存器中保存着 16 位的段选择子。如果使用这些寄存器取决于系统当前使用的内存的管理模型。在 flat
模型中，段寄存器中的段选择子指向的段是可能会出现重叠的，这些段都从线性地址空间地址 0开始。这些
重叠的段构成了程序的线性地址空间。那这种情况下，其实所有段寄存器的值岂不都是相同的。     

![flat-model-segment-registers](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/flat-model-segment-selector.png)

当使用分段内存模型后，每个段寄存器中都会加载一个不同的段选择子，以便每个段寄存器可以指向线性地址
空间内的不同段。因此，无论何时，程序最多可以访问线性地址空间上的 6 个段。    

![segmented-model-segment-selector](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/segmented-model-segment-selector.png)

每个段寄存器都和一种存储类型相关：代码、数据或者堆栈。例如，CS 寄存器包含了代码段的段选择子，代码
段存储了要被执行的指令。处理器使用 CS 寄存器中的段选择子和 EIP 寄存器中的内容来确定一个逻辑地址，
之后处理器就可以去这个地址取回指令。CS 寄存器不能被应用程序显示地设置，相反，只能被指令或处理
器内部的操作来隐式地设置。     

DS、ES、FS 和 GS 寄存器指向了 4 个数据段。      

SS 寄存器包含了堆栈段的段选择子。所有的堆栈操作都是 SS 寄存器来寻找堆栈段的位置。与 CS 不同，
应用程序可以显示设置 SS 寄存器，以便可以建立多个堆栈并在其中来回切换。      

#### 3.4.2.1 Segment Registers in 64-Bit Mode

在 64 位模式下，CS, DS, ES, SS 都被认为每个段的基址是 0，而不管对应的段 descriptor 中
的段基址是多少。这为代码、数据和堆栈创建一个了平面的地址空间。除了 FS 和 GS，这两个寄存器
在本地数据和某些操作系统数据结构的寻址中可用做线性地址计算中的附加基址寄存器。   

### 3.4.3 EFLAGS 寄存器

32 位的 EFLAGS 寄存器包含一组状态标记，一个控制标记和一组系统标记。    

![eflags-register](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/eflags-register.png)

在处理器完成初始化后，EFLAGS 寄存器被设置为 00000002H。1,3,5,15,22-31 这几个 bit 是保留的。     

一些标志位是可以使用特殊的指令直接修改的。但是没有指令可以一次性整个修改整个寄存器的内容。     

当暂停一个任务时（进程切换），处理器会自动地将 EFLAGS 寄存器的状态保存在 task state segment(TSS)。
然后当新进程加载时，处理器又会取出新任务在 TSS 中的数据加载到 EFLAGS 中。     

当调用中断或者异常处理程序时，处理器会自动在程序堆栈中保存 EFLAGS 寄存器的状态。当使用任务切换
来处理一个中断或异常时，会将当前暂停的程序 EFLAGS 的状态保存在 TSS 中。    

那可能是这个意思，当我们的程序主动进行中断或者异常调用时，这些中断和异常调用的处理程序在
处理完成后，还会返回当前程序运行，因此寄存器的状态可以直接放到程序自己的堆栈中。而后者，
应该是指程序在运行过程中，出现了其他程序引发的中断或者异常，并且此时处理器决定去处理这个
中断和异常，而这个中断和异常处理程序结束后可能并不会返回到当前程序继续运行，因此就需要将
寄存器的状态保存到 TSS 中了。   

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


看这里的意思是普通的不涉及特权级切换的 far call，不切换堆栈段，只切换代码段。这里代码段的 CS 和 EIP 的值应该是从 TSS 中取的吧。   

### 6.3.5 Calls to Other Privilege Levels

IA-32 架构的保护机制分了 4 个特权级，0-3, 0为最高。      

![privilege-levels](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/privilege-levels.png)    

首先注意一下，这里的特权级好像是针对段来说的，而不是针对进程整个的内存来说的。     

较低权限段中的代码模块只能通过称为门 gate 的严格控制和保护接口访问在较高权限段运行的模块。
尝试访问较高权限段而不通过保护门并且没有足够的访问权限会导致生成一个 general-protection
exception(#GP)。     

如果一个操作系统执行了对更高特权级的一个过程调用，其处理流程类似于 far call，除了以下的
不同：   

+ 提供给 CALL 指令的段选择子引用了一个叫做 **call gate descriptor** 的特殊数据结构。
这个描述符提供以下的信息：
  - 访问权利信息
  - 被调用过程的代码段段选择子
  - 代码段的段内偏移
+ 处理器切换到新的栈上来执行被调用过程。每个特权级都有其自己的栈。特权级 3 的段选择子和
堆栈指针存储在 SS 和 ESP 中，当调用其他特权级的过程时会自动进行保存。其他特权级的选择子和指针
存放在一个叫做 taks state segment(TSS) 的系统段中。    

也就是说特权切换的 segment selector 首先指向一个 call gate descriptor，然后这个 
descriptor 中才放置了真正的代码段的 selector。     

### 6.3.6 CALL and RET Operation Between Privilege Levels

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
一个入口访问处理过程。当处理过程完成了中断或异常的处理，处理器将控制权返回给被打断的进程。     

IA-32 架构定义了 18 个预定义的中断和异常以及 224 个用户定义的中断，这些中断都与 IDT 表
项相关联。IDT 中的每个中断和异常都用一个数字来标识，这个数字叫做 **向量** vector。     

### 6.4.1 Call and Return Operation for Interrupt or Exception Handling Procedures

对中断或者异常处理例程的调用与一个对另一个特权级的过程进行调用类似。只不过，中断向量
引用了 IDT 中两种门之一：**interrupt gate** 或者 **trap gate**。这两个类似，提供以下的
信息：    

+ 访问权限信息
+ 处理例程的代码段段选择子
+ 处理例程第一条指令的代码段偏移量      

两者之间的不同点是。如果是通过中断门调用的处理例程，处理器会清空 EFLAGS 中的 IF
(interrupt enable) 标志位，来阻止后续的中断干扰处理例程的执行。当使用陷阱门的时候，
IF 标志不会变动。    

如果处理例程的代码段和当前执行进程有相同的特权级，处理例程就使用当前的堆栈；如果是处于更高
特权级，要切换堆栈。      


如果不发生堆栈切换，处理器会这样处理异常和中断：   

1. 将当前 EFLAGS、CS 和 EIP 推入堆栈
2. 将错误码(if appropriate)推入堆栈
3. 将新的代码段的 selector 和指令的指针加载到 CS 和 EIP 中
4. 如果是中断门，清空 EFLAGS 里的 IF 位
4. 开始例程的执行

![stack-usage-on-interrupt-routine](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/stack-usage-on-interrupt-routine.png)

如果发生了堆栈切换，流程就是这样的：

1. 临时存储 SS、ESP、EFLAGS、CS 和 EIP
2. 从 TSS 中加载新的堆栈的 selector 和堆栈指针到 SS 和 ESP 中
3. 将临时保存的 SS、ESP、EFLASG、CS 和 EIP 推入新栈中
4. 将错误码推入栈
5. 加载新的代码段 selector 和指令指针到 CS 和 EIP 中
6. 如果是中断门，处理 IF 标记
7. 开始例程的执行      

从中断或异常的处理例程返回的方式是 IRET 值。类似与 far RET 指令，除了 IRET 还存储了 EFLAGS
寄存器的值。     

退出流程其实和上面所讲过的类似，相同特权级是这样：    

1. 恢复 CS 和 EIP 寄存器值
2. 恢复 EFLAGS
3. 合适地递增堆栈指针
4. 恢复被中断过程的执行      

不同特权级的话就是这样：     

1. 执行权限检查
2. 恢复 CS 和 EIP
3. 恢复 EFLAGS
4. 恢复 SS 和 ESP
5. 恢复被中断过程的执行

## Summary

等等，首先我们先总结一下目前的所知，首先，一个不带特权级转换的 far call，看样子是不会
切换堆栈的，仅切换代码段，那么因此与 near call 不同的点就是需要在调用 CALL 的时候需要
往堆栈中多存放一个 CS 的值，而且还要从 TSS 中加载新的 CS 和 EIP 值。    

带有特权级切换的调用与 far call 类似，但是提供给 CALL 指令段选择子指向了 call gate descriptor，
并且要切换堆栈段。    

而中断和异常又和带有特权级切换的 far call 类似，但是可能不同的是这时提供了中断向量，这个
中断向量充当了 selector 的角色。    

那么现在我们说一下存在的问题。首先 CALL 指令的参数是什么样的，在 near call 时，理论上应该
提供一个被调用过程在代码段中的 offset，在 far call 时，它是提供一个指向 TSS 的 selector
呢还是直接提供一个被调用过程的 CS 和 EIP 的值。同时带有特权级切换的 far call 是提供了
指向 call gate descriptor 的 selector 吗？    

中断和异常是使用 CALL 指令吗，好像至少软中断不是（INT），这时候的中断向量怎么提供。    

# Chapter 7 Programming With General-Purpose Instructions

## 7.3.8 Control Transfer Instructions

处理器提供了带条件的和不带条件的控制传输指令来指导程序执行的流程。只有 EFLAGS 寄存器中
指定的状态标志被设置的情况下会使用带条件的转换。剩下情况均是不带条件的控制流转换。     

为了方便下面的讨论，这些指令进一步被分组：    

+ 不带条件的转换
+ 带条件的转换
+ 软件中断

### 7.3.8.1 Unconditional Transfer Instructions

`JMP, CALL, RET, INT, IRET` 指令会将程序控制权转给指令流中的另一个地址。目的地可以是
当前的代码段（near transfer）或者是不同的代码段（far transfer）。    

**Jump instruction** —— JMP 指令无条件的将程序控制权转给目的地。转换是单向的，也就是说
并未保存返回的地址。一个目的地操作数指定了目的指令的地址（指令指针）。地址可以是一个 **相对地址**
或者一个 **绝对地址**。    

一个相对地址是一个相对于 EIP 寄存器值的偏移量。目的地地址（一个 near pointer）是通过将
地址的偏移量与 EIP 寄存器相加形成的。偏移量是一个带符号的整数，允许我们在指令流中向前或
向后跳转。     

一个绝对地址是一个相对于某个段的 0 地址的偏移量。可以用以下的方式声明一个绝对地址：    

+ **一个存在通用寄存器中的地址** —— 这个地址被采用和 near pointer 一样的处理方法，地址
被拷贝到 EIP 中。程序之后继续在当前代码段的新地址上执行。
+ **一个使用处理器标准地址模式声明的地址** —— 这种情况下，地址可以是一个 near pointer
也可以是一个 far pointer。如果是 near pointer，地址会被转换为一个偏移量然后拷贝到 EIP
中。如果是一个 far pointer，地址被转换为一个 selector 和一个 offset，selector 拷贝到
CS 中，offset 拷贝到 EIP 中。     

在保护模式下，JMP 指令同时也允许跳到 call gate，task gate 和 TSS 上。    

**CALL and return instructions** —— CALL 和 RET 指令允许从一个过程跳转到另一个过程，
已经后续的从调回到调用过程（RET）。    

CALL 指令将程序控制权将当前过程（调用过程）转给另一个过程（被调用过程）。为了允许之后
能返回到调用过程，CALL 指令在跳转到被调用过程之前会把当前 EIP 中的内容保存到堆栈中。
EIP 寄存器保存着 CALL 指令之后指令的地址。当把它推入堆栈后，它就被称为返回指令指针或者
返回地址。    

CALL 指令中被调用过程的地址是以与 JMP 指令相同的方式提供的。      

RET 指令将控制权从当前执行过程返回给调用它的过程。这个过程的实现就是把返回指令指针拷贝到
EIP 中。     

### 7.3.8.4 Software Interrupt Instructions

`INT n`（软中断）,`INTO`（溢出中断）和 `BOUND`（检测到值超过范围）指令允许程序显示地引发
指定的中断和异常，这会导致中断或异常处理程序被调用。    

`INT n` 指令可以通过将中断和异常的中断向量编码到指令中，来引发任意的处理器中断和异常。
这条指令可以用来支持软件生成的中断或者测试中断或异常处理程序的操作。    

IRET 指令把控制权从中断处理例程返回给被中断的过程。    

# Chapter 2 System Architecture Overview

## 2.1 Overview of the System-Level Architecture

![system-architecture](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/system-architecture.png)


从图中的意思来看，TSS 其实也都是一个个普通的段嘛，那么也要从 GDT 中来访问其位置。   

而且看图的意思，IDT 中的 descriptor 中保存的 selector 最后又指向了 GDT 中的段，这倒
也是符合下面说的所有内存访问都基于 GDT 或 LDT。    

### 2.1.1 Global and Local Descriptor Tables  

在保护模式下，所有的内存访问都是通过 GDT 或 LDT 进行的。这些表格包含叫做段描述符 descriptor
的表项。descriptor 提供了段的基址，访问权限，段的类型和使用信息。     

每个 descriptor 都有一个相关联的段 selector。软件使用 selector 中提供的索引来访问 GDT 或者
LDT，一个 global/local 标志（决定 selector 指向 GDT 还是 LDT），以及访问权限信息。    

从 descriptor 中我们可以获取到段在线性地址空间中的基地址。以及要访问的字节相对于基地址的偏移量。
该机制可用于访问任何有效的代码，数据或堆栈段，前提是该段在处理器操作时的 current privilege level(CPL) 
表明段是可访问的。CPL 被定义为当前正在执行代码段的保护级。    

### 2.1.2 System Segments, Segment Descriptor, and Gates

除了程序执行环境中包含的代码、数据和堆栈段，还有两种系统的段：task-state segment(TSS) 和 LDT。
GDT 在这里并不认为是一个段，因为其不能通过通常意义上的 selector 和 descriptor 访问到。    

也就是说 GDT 中可以暂时认为有 3 种类型的段，普通的程序代码、数据和堆栈段，程序的 TSS 段
以及 LDT。    

系统同时也定义了一系列特殊的 descriptors，即 gates(call gates, interrupt gates, 
trap gates,task gates).这些 gates 为系统过程和除了程序提供了受保护的网关，这些系统过程
通常在一个与应用程序不同的特权级上。      

例如，通过 CALL 一个 call gate 可以让我们访问一个处于更高特权级的过程。为了通过 call gate
调用这样一个过程，调用过程需要提供 call gate 的 selector。之后处理器进行权限检查，用
CPL 和 call gate 的特权级以及 call gate 指向的代码段的特权级进行比较。（这是要进行一个
三方比较吗？）     

**问题**：这个的比较究竟是怎么比的？   

如果允许访问目标代码段，处理器会从 call gate 中获取到目标代码段的 selector 和段内偏移量。
如果调用要求切换特权级（也可能是同级的 CALL 调用，所以这里用的是如果），处理器
也要切换堆栈段。堆栈段的 selector 是从当前运行任务的 TSS 中获取的。     

**问题**：这个堆栈段究竟是调用过程的堆栈，还是属于被调用过程的堆栈，感觉像是调用过程的
堆栈。而且这里注意一下，call gate 好像并不是直接保存代码段的基址。而是保存其他段的 selector。    

### 2.1.3 Task-State Segments and Task Gates

TSS 为一个任务定义了其执行环境的状态。包括通用寄存器的状态，段寄存器的状态，EFLAGS,EIP
寄存器的状态，指向三个堆栈段（每个特权级一个堆栈）的 selector，分页结构的基地址。    

那看样子是这里，每个 task 除了 4 个数据段，还有 4 个堆栈段，正常情况下 SS 中的 selector
是特权级为 3 的堆栈，而其他的 3 个特权级也分别有一个堆栈段，selector 保存在 TSS 中。  

根据文档的意思来看，每个task 都有一个单独的 TSS，保护模式下所有的程序都是在一个 task 的
上下文中执行的。当前 task 的 TSS 的 selector 存放在 TR 寄存器中。切换 task 最简单
的方式就是执行一个到新 task 的 call 或 jump。当切换 task 时，处理器会执行以下操作：    

1. 在当前 TSS 中存储当前 task 的状态
2. 加载新 task 的段 selector 到寄存器中
3. 通过 GDT 中保存的 TSS 的 descriptor 访问新的 TSS
4. 从新的 TSS 中加载新 task 的状态到各种寄存器中
5. 开始新 task 的执行

### 2.1.4 Interrupt and Exception Handling

外部中断、软件中断和异常都是通过 IDT 处理的。IDT 提供了访问中断和异常处理例程的 gate descriptor。
与 GDT 一样，IDT 不是一个段。IDT 的基址在 IDTR 寄存器中。    

IDT 中的 gate 可能是一个 interrupt gate, trap gate 或者 task gate。要访问一个中断或异常
例程，处理器首先从内部的硬件，或者外部的中断控制器，或者从 INT 等软件指令中获取到中断向量。中断
向量提供了 IDT 的索引。如果是一个中断或陷阱门，那就像一个 call gate 过程调用类似处理，如果是
一个任务门，处理例程通过任务切换来访问。    

## 2.3 System Flags and Fields in the EFLAGS Register

EFLAGS 寄存器中的系统标志和 IOPL 字段，控制着 I/O，可屏蔽硬件中断，debugging，任务切换
以及虚拟 8086 模式。只有特权代码才可以修改这些位。    

+ **Trap(bit 8)**- TF - 1 开启单步 debugger 模式；0 禁用。在单步模式中，处理器每执行
一条指令，产生一个 debug 异常。这样我们就可以查看每条指令后的程序的状态。   

![system-flags](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/system-flags.png)   

+ **Interrupt enable(bit 9)** - IF - 控制处理器对可屏蔽硬件中断的响应。置位对可屏蔽
硬件中断做出响应，清零禁止可屏蔽中断。IF 标志不会影响异常或者不可屏蔽中断的产生。
+ **I/O privilege level field(bit 12 and 13)** - IOPL - 指定当前运行程序的 I/O 特权级。
当前要访问 I/O 地址空间的程序的 CPL 必须要小于或等于 IOPL 才行。
+ **Nested task(bit 14)** - NT - 控制中断和调用任务的链接。处理器在调用由 CALL 指令、
中断或异常启动的任务时设置此标志。
+ **Resume(bit 16)** - RF -控制处理器对指令端点条件的响应
+ **Virtual-8086 mode(bit 17)** - VM     

## 2.4 Memory-Management Registers

处理器提供了4个内存管理寄存器 GDTR, LDTR, IDTR, TR 来指定控制段内存管理的数据结构的位置。

![memory-management-registers](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/memory-management-registers.png)    

### 2.4.1 Global Descriptor Table Register(GDTR)

GDTR 中存放 GDT 的基地址以及 16 位的表格长度。     

### 2.4.2 Local Descriptor Table Register(LDTR)

LDTR 中存放着 LDT 16 位的 selector，基地址，段长度以及 descriptor 的属性。     

当进行任务切换时，LDTR 会自动用新任务的 LDT 的 selector 和 descriptor 装载。    

### 2.4.3 IDTR Interrupt Descriptor Table Register

IDTR 保存着 IDT 16 位的表长和基地址。      

### 2.4.4 Task Register(TR)

当前任务 TSS 的16 位的 selector，基址，段长，descriptor 属性。     

当切换任务时，TR 自动用新任务的 TSS 的 selector 和 descriptor 加载。     

# Chapter 3 Protected-Mode Memory Management


## 3.1 Memory Management Overview

IA-32 架构的内存管理可以分为两部分：分段和分页。分段提供了一种隔离各个代码、数据和堆栈
模块的机制，以便多程序可以在同一处理器上运行而不会互相干扰。分页提供了一种实现传统的按需
分页虚拟内存系统的机制，其中程序执行环境的各个部分根据需要映射到物理内存中。在保护模式下，
分段是必须使用的，而分页则是可选的。    

分段将处理器可寻址的内存空间（线性地址空间）分成了一片片小的受保护的地址空间，即 **段**。
段既可以用来存放程序的数据、代码和堆栈，也可以用来存放系统数据结构（LDT 或者 TSS）。
段可以用来保存程序的代码，数据和堆栈，又或者是保存一些系统数据结构（例如 TSS 和 LDT）。

系统中的所有段都被限制到处理器的线性地址空间中。为了去定位一个段中的某个字节，必须提供一个
**逻辑地址**（也叫 far pointer）。逻辑地址包含一个段的 selector 和一个 offset。selector
是一个段的标识符，用来在 GDT 或 LDT 中定位该段的 descriptor，从 descriptor 中我们可以
拿到段在线性地址空间中第一个字节的位置（也就是段的基址），段基址加上偏移量就形成了一个
线性地址。   

![segmentation-and-paging](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/segmentation-and-paging.png)    

如果没使用分页，线性地址空间就直接映射到物理地址空间上。物理地址空间就是处理器可以通过其
总线生成的一个地址的范围。     

分页，操作系统维护着一个页面目录以及一组页表来跟踪页面。当程序想要访问线性地址空间中的
某个地址，处理使用页面目录和页表来将线性地址转换为物理地址。    

## 3.2 Using Segments

### 3.2.1 Basic Flat Model

至少分两个段，代码和数据。不过两个段都映射到了相同的整个线性地址空间，即段描述符的段基址
都是 0，段长都是 4GB。ROM(EPROM) 通常位于物理地址空间的顶部，因为处理器从 FFFF_FFF0H
开始执行。RAM 通常位于地址空间的底部，因为DS 数据段的初始基地址是 0.     

剩下的懒的讲了，不难。    

## 3.4 Logical and Linear Addresses

为了将一个逻辑地址转换为一个线性地址，处理器需要如下步骤：   

1. 使用 selector 指令的偏移量来在 GDT 或 LDT 中定位段的 descriptor。
2. 测试 descriptor 来查看是否满足权限，已经段的范围，确保段是可访问的并且偏移量没有超出
段的长度
3. 将 descriptor 中的段基址与 offset 相加形成线性地址

![logical address to linear address](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/logical-address-to-linear-address.png)    

### 3.4.2 Segment Selectors

段 selector 是一个段的 16 位的标识符。其并不直接指向段，而是指向定义这个段的段 descriptor。
一个 selector 包含以下内容：    

+ Index(3-15 bit) —— 选择 GDT 或 IDT 8192 个 descriptors 中的一个。处理器将索引值
乘以 8 （descriptor 中的字节数），并将结果与 GDT 与 LDT 的基址相加。
+ TI(table indicator) flag(bit 2) —— 指定使用的是哪个表，0就是 GDT，1 就是 LDT。
+ Requested Privilege Level(RPL)(bit 0, 1) —— 指定 selector 的特权级。     

![segment-selector](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/segment-selector.png)    

### 3.4.3 Segment Registers

每个段寄存器都有一个“可见”部分和一个“隐藏”部分（隐藏部分有时也叫 descriptor cache 或者
shadow register）。当处理器将一个 selector 装入寄存器的可见部分时，同时也会从 descriptor
中加载基址、段长、权限信息到隐藏部分中。这些缓存的信息就可以让处理器在进行地址转换时无需
额外的总线访问去从 descriptor 中读取基址和段长。     

在多核的系统中，如果描述符表被修改了，那么软件必须负责重新加载段寄存器的内容。否则，可能
内存上的段分布也就变了但是我们仍然使用了寄存器中缓存的旧的 descriptor。    

有两种指令可以用来装载这些段寄存器：   

1. 直接加载指令，例如 `MOV, POP, LDS, LES, LSS, LGS, LFS` 指令。
2. 隐式加载指令，例如 `CALL, JMP, RET` 指令涉及 far pointer 时, `SYSENTER, SYSEXIT`
指令，`IRET, INT n, INTO, INT3` 指令。     

### 3.4.5 Segment Descriptors

段描述符通常是被编译器、链接器、加载器或者操作系统创建的，但是不包括应用程序。    

![segment-descriptor](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/segment-descriptor.png)    

+ **Segment limit field** —— 指定段的大小。处理器会将两个段长字段合在一起形成一个 20 位
的值。处理器呢依据粒度标记 G 来决定如何解释这个长度值：
  - 如果粒度位是 0，那么段的大小是 1B - 1MB，增量为 1B
  - 如果粒度位是 1，那么段大小是 4KB - 4GB，增量为 4KB   
但是处理器又是如何使用这两个长度，有两种方式，取决于段是一个 expand-up 还是一个 expand-down
的段。对于 expand-up 的段，逻辑地址的偏移量是从 0 到段长。大于段长的偏移量会生成一个通用
包含异常或者一个堆栈错误异常。对于 expand-down 段，段长是有反转功能，偏移量是从段长加 1
到 FFFFFFFFH 或者 FFFFH，取决于 B 标志。同理小于等于段长生成异常。
+ **Base address fields** —— 定义段的第一个字节在 4GB 线性空间中的位置。处理器会把 3 个
基址字段合在一起形成一个 32 位值。
+ **Type field** —— 表明段或门的类型，以及可以对段进行访问的类型（读写执行？）和段增长
的方向。这个字段如何解释取决于描述符类型标志，这个标志位表明了段是一个应用程序的描述符
还是一个系统段的描述符。注意区别这里的段的类型和描述符的类型。
+ **S(descriptor type) flag** —— 0 表示这个描述符是系统段的描述符，1 表示是代码或数据段
的描述符。
+ **DPL(descriptor privilege level) field** —— 指定段的特权级。DPL 用来控制对段的访问。
+ **P(segment-present) flag** —— 0 表示段在内存中，1表示不在。
+ **D/B(default operation size/default stack pointer size and/or upper bound) flag** —— 
根据段描述符是一个可执行代码段、一个 expand-down 数据段或者是一个堆栈段执行不同功能。
32 位的代码或者数据段总是 1, 16 位的代码或者数据段总是 0 。
  - 可执行代码段。这个标志称为 D 标志位，表明了段中指令有效地址和操作数的默认长度。
  - 堆栈段。这个标志称为 B 标志，表明了堆栈指针的长度。如果堆栈段被设置为一个 expand-down
  数据段，B 标志表明了堆栈的上边界。
  - expand-down 数据段。B 标志，表示了段的上边界。
+ **G(granularity) flag**     

#### 3.4.5.1 Code- and Data-Segment Descriptor Types

当把 S 设为 1 的时候，表明段描述符是一个代码或数据段的描述符。type 字段的最高位决定了
到底是代码段，还是数据段，0 表示数据段，1表示代码段。也就是说在描述符中其实是不区分数据
段和堆栈段的。    

对于数据段，低三位被解释为可访问(8A)，可写(9W)和展开方向(10E).    

![segment-types](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/segment-types.png)    

堆栈也是数据段，但是必须是可读写的。    

可访问位表明了堆栈自从上次操作系统清空了这一位后是否被访问过。      

看表的意思是，数据段隐含着可读的默认权限，而代码段隐含着可执行的默认权限。    

对于代码段来说，低 3 位被解释为可访问(8A)，可读(9R)，和 conforming(C).    

代码段可以是 conforming 的或者是 nonconforming。如果我们进行了对更高特权级 conforming
段的控制切换（过程调用等），那么可以维持 CPL 不进行修改。如果是对不同特权级的 nonconforming
段进行控制切换会生成 #GP 异常，除非使用了 call gate 或者 task gate。   

还有一点要主要，系统是不允许我们使用 call 或者 jump 跳转到特权级更低的代码段上的，这样
会生成 #GP 异常。   

所有的数据段都是 nonconforming，也就意味着低特权级的程序是无法访问它们的（话说，看意思，
只有代码段的访问可能会用到各种 gate，数据段不会出现这种情况）。不过，不同于代码段的是，
数据段可以被更高特权级的程序访问，而且不用通过门。    

## 3.5 System Descriptor Types

处理器可以识别出一下类型的系统描述符：    

+ Local descriptor-table(LDT) 段描述符
+ Task-state segment(TSS) 描述符
+ Call-gate 描述符
+ Interrupt-gate 描述符
+ Trap-gate 描述符
+ Task-gate 描述符     

这些描述符类型可以分为两类：系统段描述符和门描述符。系统段描述符指向了系统段（LDT,TSS）。
门描述符，保存了指向代码段（call, interrupt, trap gates）中的过程入口点的指针，或者保存
了 TSS(task gate) 的段选择器。    

### 3.5.1 Segment Descriptor Tables

每个系统必须定义一个 GDT，这个 GDT 可以被系统上的所有程序和任务使用。然后，可选地，可以
定义一到多个 LDT。     

# Chapter 4 Paging

## 4.1 Pagin Modes and Control Bits

有 3 种分页模式：   

+ **32-bit 分页**
+ **PAE 分页**
+ **IA-32e 分页**    

这 3 种分页方式主要在如下方面不同：   

+ 线性地址的宽度。可以用来作分页输入的线性地址的大小。
+ 物理地址的宽度。可以用来作分页输出
+ 页面大小。即线性地址转换时的粒度。
+ 支持禁止执行的访问权限。在一些分页模式中，软件可能会被禁止从可读的页面上取指。    

## 4.2 Hierarchical Paging Structures: an Overview

所有的 3 种分页模式都使用分层的分页结构来转换线性地址。其实这里是想说多级页表吧。     

每个分页结构都是 4KB 的大小，包含了很多独立的条目。在 32-bit 分页模式下，每个条目
都是 32 位宽(4B)；所有每个结构里有 1024 个条目(10位)；PAE 和 IA-32e 分页模式中，每个
条目是 64 位(8B)；因此是 512 个条目。     

处理器使用线性地址的前面的部分来标志出所属的分页条目。这些结构中最后找到的那个条目中存放了线性
地址转换后的物理地址所属的区域（即页帧）。而线性地址后面的部分（页面偏移）标志了我们要访问
的地址是在这块区域的哪一部分。    

每种分页结构的条目都包含一个物理地址，这个地址或者是另一个分页结构的地址，或者是一个页帧的
地址。在第一种情况中，条目被认为指向了其他页面结构；第二种情况中，条目被认为映射了一个页面。    

任何分页地址转换中第一个分页位于 CR3 中的物理地址上。一个线性地址会使用如下的迭代过程
进行转换。线性地址的一部分（最初是最高的几位）选择一个分页结构中的一个条目（这个分页结构
就是使用 CR3 定位的结构）。如果那个条目引用了另一个分页结构，处理器接着处理这个分页结构，
处理器使用线性地址中刚刚使用过部分的后面一部分来索引。但是如果这个条目映射了一个页面，则处理完成：
条目中的物理地址就是页帧的地址，而线性地址中的剩下部分就是页面偏移。   

+ 32 位页面模式模式下，每个页面结构包含 2<sup>10</sup> 个条目。那么这种情况下的转换过程
每次使用 32 位线性地址中的 10 位来定位一个分页结构的条目。31:22 指定第一个页面结构中的
条目，21:12 指定第二个分页结构中的条目，这个条目中包含有页帧的地址，11:0 指定了在 4KB
页面中的偏移。
+ PAE 分页模式下，第一个分页结构包含 2<sup>2</sup> = 4 个条目。所以使用线性地址的
头两位用来定位条目。其他的分页结构都包含 2<sup>9</sup 个条目，所以使用后 9 位定位第二个
分页结构中的条目，再之后的 9 位定位第三个分页结构条目，这个条目会指出页帧。所以这其实是
3 级页表。   

## 4.3 32-Bit Paging

32 位分页模式会将 32 位的线性地址转换为 40 位的物理地址。虽然 40 位地址对应着 1T 的空间，
不过由于线性地址被限制在 32 位上，所以任何时候可访问的线性地址最多也就 4 GB。    

32位分页模式使用分层的分页结构来进行线性地址的转换。CR3 定位了第一个分页结构的位置，即页目录。    

32位分页模式可以将线性地址映射到 4KB 或 4MB 的页面上。下面的解释了如何确定页面大小的细节：   
+ 一个 4KB 自然对齐的页目录位于 CR3 中 bits 31:12 指定的物理地址。一个页面目录包括 1024 个 32位条目(PDEs Page Directory entries?)。
每个 PDE 是使用如下定义的物理地址来选择的：   
  - bits 39:32 都是 0
  - bits 31:12 是从 CR3 中获取
  - bits 11:2 是线性地址的 31:22 位
  - bits 1:0 是0 (最小是 4B，32 位，没什么问题)    
因为一个 PDE 是用线性地址的 31:22 位确定的，所以它控制了线性地址空间中 4M 区域的大小
（后 22 位不变，所以是 4M）。PDE 的使用取决于 CR4.PSE 和 PDE 的 PS 标志：  
+ 如果 PSE =1 PS=1，那么 PDE 映射一个 4MB 的页面，最终的物理地址是这样计算的：
  - bits 39:32 是 PDE 的 20:13
  - bits 31:22 是 PDE 的 31:22
  - bits 21:0 是从原始线性地址获取的，这时候其实是单级页表
+ 如果 PSE=0，PS=0，一个 4K 对齐的页表使用 PDE 的 31:12 指定的物理地址来定位。一个
页表包含 1024 个条目(PTEs)。一个 PTE 是使用如下的物理地址来选择的：
  - bits 39:32 都是 0
  - bits 31:12 从 PDE
  - bits 11:2 是线性地址的 21:12
  - bit 1:0 是 0
+ 因为一个 PTE 是使用线性地址的 31:12 标志的，每个 PTE 映射 4KB 的页面，最终的物理地址
是这样计算的：
  - bit 39:32 是0
  - bit 31:12 是 PTE
  - bit 11:0 是从原始线性地址    

![32bit-paging-address-translation.png](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/32bit-paging-address-translation.png)    

![32bit-CR3-format.png](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/32bit-CR3-format.png)    

![32bit-page-table-entry.png](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/32bit-page-table-entry.png)    

## 4.6 Access Rights

一个地址转换是否允许被访问取决于页面结构条目中定义的访问权限，CR0, CR4, IA32_EFER MSR,
EFLAGS.AC 中的分页模式 modifier，以及访问模式。    

### 4.6.1 Determination of Access Rights

每次对线性地址的访问都是管理员模式访问或者用户模式访问。对于所有的取指和大部分的数据访问来说，
这种划分是由 current privilege Level(CPL) 决定的：CPL&lt;3 的访问都是管理员模式访问，
CPL=3 是用户模式访问。    

一些操作隐式地访问线性地址中的系统数据结构；无论 CPL 如何，这种访问都是以管理员模式访问的。
这些访问的例子包括：对 GDT 或 LDT 的访问，对 IDT 的访问，或者当切换任务或更改 CPL 时对 TSS
的访问。CPL &lt; 3 时进行的其他访问称为显示管理员模式访问。     

访问权限也由控制线性地址的转换的分页结构条目所指定的线性地址的模式控制。如果在至少一个
分页结构条目中U/S标志(bit 2))为0，则该访问是管理员模式访问。否则，是用户模式访问。   

# Chapter 5 Protection

在保护模式下，不管是 32 还是 64 位架构，都在分段和分页级别上提供了保护机制。这种保护机制
基于特权级（分段是 4 个特权级，分页是 2 个特权级）提供了对某些段或者页的访问控制能力。    

当使用了保护模式后，每次的内存引用都会验证其是否满足了多种保护检查项目。所有的检查都是在内存
访问前进行的；任何非法的结果都会导致异常。保护检查包括以下的检查内容：   

+ 长度检查
+ 类型检查
+ 特权级检查
+ 可寻址域的限制
+ 过程入口点的限制
+ 指令集的限制

## 5.2 Fields and Flags Used For Segment-Level and Page-Level Protection

+ **Descriptor type(S) flag** —— 位于段描述符中。决定了描述符是一个系统段还是代码或者数据
段的描述符
+ **Type field** —— 还是位于段描述符中。决定代码、数据或者系统段的类型。
+ **Limit field** —— 位于段描述符中，与 G 和 E 标志一起决定了段的大小，
+ **G flag**
+ **E flag**
+ **Descriptor privilege level(DPL) field** —— 决定了段的特权级
+ **Requested privilege level(RPL) field** —— 段 selector 中。表明了段 selector 的
请求特权级
+ **Current privilege level(CPL) field** —— CS 段寄存器中的 0,1 两位。表明了当前执行程序
的特权级。
+ **User/supervisor(U/S) flag** —— 分页条目的 bit 2。决定了页的类型。
+ **Read/write(R/W) flag** —— 分页条目的 bit 1。决定了允许的访问类型
+ **Execute-disable(XD) flag** —— 特定分页结构条目的 bit 63。决定了允许的访问类型    

## 5.4 Type Checking

段描述符中在两个位置包含了类型的信息：  

+ S flag
+ type field

当处理器在段 selector 和 descriptor 上操作时，会在不同的时间检查类型信息。下面的列表
给了执行类型检查时的一个例子：   

+ 当一个段 selector 被装载到一个段寄存器中时 —— 特定的段寄存器只能包含特定的类型，
例如：
  - CS 寄存器只能用代码段的 selector 装载
  - 那些不可读的代码段的 selector （话说代码段为什么不用 CS）或者系统段的 selector 不能被数据段寄存器 DS、ES、FS 和 GS 装载
  - 只有可写的数据段 selector 才能装载到 SS 寄存器中
+ 当一个 selector 被装载到 LDTR 或 TR 寄存器时，例如：
  - LDTR 只能用 LDT 的selector 装载
  - TR 只能用 TSS 的 selector 装载
+ 当指令访问一个描述符已经被装载的段寄存器中的段时 —— 一些段只能被指令以一些预定义好的方式使用，例如：
  - 指令不可以在可执行段上写入
  - 执行不可以在一个不可写的数据段上写入
  - 除了段是可读的，否则指令不能读取一个可执行的段
+ 当一个指令操作数包含一个 selector 时 —— 一些指令只能以特定的方式访问段
+ 在一些内部操作时

## 5.5 Privilege Levels

要在代码段和数据段之间执行权限级别检查，处理器会识别以下三种类型的权限级别：   

+ **CPL** —— CPL 是当前执行程序的特权级。它存储在 CS 和 SS 段寄存器的 bit 0 和 1.通常来说，
CPL 与当前要取的指令所处的代码段的特权级相等。当程序控制权被传递给一个不同特权级的代码段时，处理器
需要修改 CPL。不过当访问 conforming 代码段时，CPL 的处理方式略有不同。conforming 代码段可以
允许任何特权级等于或者低于 conforming 代码段 DPL 的访问。同时，当处理访问一个不同于 CPL 特权级的 conforming 代码段时，不会修改 CPL。
+ **DPL** —— DPL 是段或门的特权级。当当前执行代码段尝试访问一个段或门，段或门的 DPL 会与段
或门的 CPL 及 RPL 做比较。不同的段或门的类型会导致对 DPL 不同的解释：   
  - **Data Segment** —— DPL 指定了允许程序或者任务访问该段的最低特权级。例如，如果数据段的
  DPL 为 1，则只有 CPL 为 0 或 1 的程序才能访问该段
  - **Nonconforming code segment(without using a call gate)** —— 话说，不使用 call 
  gate 访问 n 代码段不是会生成异常嘛，难道是同级检查。DPL 指定了要访问这个段的程序的特权级。
  例如如果 DPL 是 0，则只有 CPL 是 0 的程序才能访问。果然是同级检查。
  - **Call gate** - DPL 指定了最低的 CPL。同上面的数据段规则
  - **Conforming code segment and nonconforming code segment accessed through a call gate** -
  DPL 指定了最高的 CPL。例如，DPL 是 2，CPL 在 0 或 1 的程序不能访问。这其实就是限制了不能从
  特权级高的代码往特权级低的转换吧。但是数据段是支持的。    
  - **TSS** - 同数据段规则
+ **Requested privilege level(RPL)** - RPL 是分配给 selector 的覆盖特权级别。CPL 会和
RPL 进行比较，来决定是否允许访问一个段。有时即便程序有足够的特权级去访问一个段，但是如果
RPL 特权级不够的话还是会被拒绝。如果 RPL 特权级低于 CPL，RPL 会覆盖 CPL，反之也是如此。
RPL可用于确保特权代码不代表应用程序访问段，除非程序本身具有该段的访问权限。   

算了算了，太复杂了，先略了。   


# Chapter 6 Interrupt and Exception Handling

## 6.2 Exception and Interrupt Vectors

为了帮助处理中断和异常，每种架构为每个需要处理器进行处理的中断与异常定义了一个唯一的数字
标识符，叫做中断向量。处理器使用这个中断向量来在 IDT 中索引。这张表提供了一个中断与异常
处理程序的入口点。    

中断向量号从 0 到 255. 0-31 是为系统架构定义的中断和异常保留的。32-255 是用户定义的中断
和异常。    

## 6.3 Sources of Interrupts

处理器以下两个来源处接收中断：   

+ 外部硬件生成的中断
+ 软件生成的中断   

## 6.4 Sources of Exception

+ 处理器检测到的程序错误异常
+ 软件生成的异常
+ 机器检查异常    

### 6.4.1 Program-Error Exception

处理器会在检测到应用程序或者操作系统在执行过程中发生程序错误时生成一个异常。异常可以被分为
3 类：**faults**, **traps** 和 **aborts**.     

### 6.4.2 Software-Generated Exception

`INTO, INT3, BOUND` 指令可以让软件生成异常。这些指令允许在指令流的这个时间点执行异常条件的
检查。比如说生成一个断点。     

## 6.5 Exception Classifications

根据异常被报告的方式以及在不丢失程序连续性的情况下是否可以重新执行造成异常的指令，将异常
分成了以下 3 类：    

- **Faults** - fault 是可以被矫正的异常，允许程序在不丢失连续性的情况下重新执行异常指令。
当发现了 fault 后，处理器将会机器的状态恢复到执行异常指令之前的样子。fault 处理例程的
返回地址指向了异常指令，而不是异常指令之后的指令
- **Traps** - trap 是在陷入指令执行后立刻被报告的。trap 也允许程序不丢失连续性继续执行。
trap 例程的返回地址指向了陷入指令之后的指令
- **Aborts** - abort 无法报告造成异常指令的准确位置，并且也无法恢复程序的执行。    

## 6.6 Program or Task Restart

# Chapter 7 Task Management

## 7.1 Task Management Overview

### 7.1.1 Task Structure

一个 task 由两部分组成：一个 task 执行空间已经一个 task-state segment(TSS)。执行空间
包括一个代码段，一个堆栈段，以及数个数据段。如果操作系统使用了特权级保护机制，那么执行空间
还为每个特权级提供了一个分离的堆栈。     

TSS 保存了组成执行空间的段以及 task 的状态信息。    

![structure-of-task.png](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/structure-of-task.png)    

### 7.1.2 Task State

+ task 当前的执行空间，即段寄存器中的段 selector
+ 通用寄存器的状态
+ EFLAGS 和 EIP
+ CR3, LDTR
+ IO 映射基址和 IO 映射
+ 特权级 0,1,2栈的堆栈指针

# Chapter 9 Processor Management and Initialization

### 9.1.4 First Instruction Executed

第一条指令的地址是 FFFFFFF0H。这个地址是物理内存顶部的 16 字节。包含软件初始化代码的 EPROM
必须装载到这个地址。    