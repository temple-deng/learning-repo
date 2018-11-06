# 第 3 章 内存管理

<!-- TOC -->

- [第 3 章 内存管理](#第-3-章-内存管理)
  - [3.2 一种存储器抽象：地址空间](#32-一种存储器抽象地址空间)
    - [3.2.1 地址空间的概念](#321-地址空间的概念)
    - [3.2.2 交换技术](#322-交换技术)
    - [3.2.3 空闲内存管理](#323-空闲内存管理)
  - [3.3 虚拟内存](#33-虚拟内存)
    - [3.3.1 分页](#331-分页)
    - [3.3.2 页表](#332-页表)
    - [3.3.3 加速分页过程](#333-加速分页过程)
    - [3.3.4 针对大内存的页表](#334-针对大内存的页表)
    - [3.3.5 分段与分页](#335-分段与分页)
  - [3.4 页面置换算法](#34-页面置换算法)
    - [3.4.1 最优页面置换算法](#341-最优页面置换算法)
    - [3.4.2 最近未使用页面置换算法](#342-最近未使用页面置换算法)
    - [3.4.3 先进先出页面置换算法](#343-先进先出页面置换算法)
    - [3.4.4 第二次机会页面置换算法](#344-第二次机会页面置换算法)
    - [3.4.5 时钟页面置换算法](#345-时钟页面置换算法)
    - [3.4.6 最近最少使用页面置换算法](#346-最近最少使用页面置换算法)
    - [3.4.7 用软件模拟 LRU](#347-用软件模拟-lru)
    - [3.4.8 工作集页面置换算法](#348-工作集页面置换算法)
    - [3.4.9 工作集时钟页面置换算法](#349-工作集时钟页面置换算法)
  - [3.5 分页系统的设计问题](#35-分页系统的设计问题)
    - [3.5.1 局部分配策略和全局分配策略](#351-局部分配策略和全局分配策略)
    - [3.5.5 共享页面](#355-共享页面)
    - [3.5.6 共享库](#356-共享库)
  - [3.6 有关实现的问题](#36-有关实现的问题)
    - [3.6.1 与分页有关的工作](#361-与分页有关的工作)
    - [3.6.2 缺页中断处理](#362-缺页中断处理)
  - [3.7 分段](#37-分段)
  - [内存管理 总结](#内存管理-总结)
    - [3.2 地址空间](#32-地址空间)
    - [3.3 虚拟内存](#33-虚拟内存-1)
    - [3.4 页面置换算法](#34-页面置换算法-1)

<!-- /TOC -->

操作系统对存储器创建抽象模型的解决方案是分层存储器体系，在这个体系中，计算机有若干兆（MB）快速、
昂贵且易失性的高速缓存（cache），数千兆（GB）速度与价格适中但同样易失性的内存，以及容量更大的、低速、
廉价、非易失性的磁盘存储。     

操作系统中管理分层存储器体系的那部分称为**存储管理器**。它的任务是有效地管理内存，即记录哪些内存是正在
使用的，哪些内存是空闲的；在进程需要时未其分配内存，在进程使用完后释放内存。     

## 3.2 一种存储器抽象：地址空间

将物理地址暴露给进程会带来几个严重的问题，第一，如果用户程序可以寻址内存的每个字节，就可以很容易地
破坏操作系统。第二，使用这种模型同时运行多个程序是困难的，应该是因为静态重定位速度慢且不灵活。    

### 3.2.1 地址空间的概念

要使多个应用程序同时处于内存中的且不互相影响，需要解决两个问题：**保护**和 **重定位**。
一个原始的对前者的解决办法是：给内存块标记上一个保护键，并且比较执行进程的键和其访问的
每个内存字的保护键。然而，这种方法本身没有解决后一个问题，虽然这个问题可以通过在程序被
装载时重定位程序来解决，但这是一个缓慢且复杂的解决办法。      

一个更好的办法是创造一个新的存储器抽象：地址空间。地址空间为程序创造了一种抽象的内存。
地址空间是一个进程可用于寻址内存的一套地址集合。每个进程都有一个自己的地址空间，并且这个
空间独立于其他进程的地址空间。其实应该是地址空间给了进程一种自己独用一大段内存的假象。    

下面的方法在以前很常见，但是在有能力把更复杂（而且更好）的机制运用在现代 CPU 芯片上之后，这个方法就
不再使用了。          

**动态重定位**可以用来解决之前提到的重定位的问题，动态重定位简单的把每个进程的地址空间映射到物理内存的不同
部分。计算机会给每个 CPU 配置两个特殊的硬件寄存器，通常叫做**基址寄存器**和**界限寄存器**。当使用
基址寄存器和界限寄存器时，程序装载到内存中连续的空闲位置且装载期间无须重定位（注意这里提到了装载到
连续的位置，那说明就无法使用后面提到的将正文段和数据段分开的方法把），当一个进程运行时，程序的起始
物理地址装载到基址寄存器中，程序的长度放到界限寄存器中。    

每次进程访问内存，取一条指令，读或写一个数据字，CPU 硬件会在把地址发送到内存总线前，自动把基址值加到进程
发出的地址值上。同时，它检查程序提供的地址是否等于或大于界限寄存器的值。如果访问地址超过了界限，会产生
错误并终止访问（也就可以解决保护的问题）。    

使用这两个寄存器进行重定位的缺点是每次访问内存都要进行加法和比较运算，浪费了时间。    

### 3.2.2 交换技术

有两种处理内存超载的通用方法。最简单的策略是 **交换** 技术，即把一个进程完整调入内存，使该进程运行一段时间
，然后把它放回磁盘。空闲进程主要存储在磁盘上，所以当它们不运行的时候就不会占用内存。另一种策略是
**虚拟内存**，该策略甚至能使程序在只有一部分被调入内存的情况下运行。其实虚拟内存相当于使用了部分交换技术。    

交换会在内存中产生很多的空闲区，通过把所有进程尽可能的向下移动，有可能将这些空闲区合成一大块。该技术
称为**内存紧缩**。通常不进行这个操作，因为要耗费大量的 CPU 时间（因为要在内存中来回复制数据移动嘛）     

注意交换技术理论上是将整个进程的地址空间分配到内存中的一个连续位置上的。也就说之前的基址寄存器和界限寄存器
在这里是可用的。       

### 3.2.3 空闲内存管理

在动态分配内存时，操作系统必须对其进行管理。一般而言，有两种方法跟踪内存使用情况：位图和空闲区链表。    

+ **使用位图的存储管理**     

使用位图方法时，内存可能被划分成小到几个字或大到几千字节的分配单元。每个分配单元对应于位图中的一位，0
表示空闲，1表示占用（或者相反）。     

分配单元的大小是一个重要的设计因素。分配单元越小，位图越大。但是位图占据的内存空间较大。分配单元大
的话，位图则会很小，那么进程分配内存中未使用的内存就会比较多，也会浪费内存。    

位图主要的问题是，在决定把一个占 k 个分配单元的进程调用内存时，存储管理器必须搜索位图，
在位图中找出有 k 个 0 的连续的串。查找位图中指定长度的连续0串是耗时的操作。    

+ **使用链表的存储管理**     

使用链表的方法时，会维护一个记录已分配内存段和空闲内存段的链表。其中链表中的一个结点或者包含一个进程，或者是
两个进程间的一块空闲区。链表中的每一个结点都包含以下域：空闲区（H）或进程（P）的指示标志、起始地址、长度
和指向下一结点的指针。其实使用双向链表的结构也不错，在移除进程时相邻的空闲区结点合并时会比较方便。    

当按照地址顺序在链表中存放进程和空闲区时，有几种算法可以用来为创建的进程分配内存。这里，假设存储
管理器知道要为进程分配多少内存。最简单的算法是 **首次适配** 算法。存储管理器沿着段链表进行搜索，直到
找到一个足够大的空闲区，除非空闲区的大小和分配的空间大小刚好一样，否则将该空闲区分为两部分，一部分供进程
使用，另一部分形成新的空闲区。    

对首次适配算法进行很小的修改就可以得到 **下次适配** 算法。与首次适配类似，不同的是每次找到合适的
空闲区时都记录当时的位置，以便在下次寻找空闲区时从上次结束的地方开始搜索，而不是每次从头开始（这样有个
问题啊，那在合适的空闲区之前的空闲区岂不是永远得不得使用，应该会隔一段时间从头搜索一次吧）。    

另一个算法是最佳适配，最佳适配会搜索整个链表，找出能够容纳进程的最小的空闲区。      

需要注意的是最佳适配不仅速度要比首次适配和下次适配慢，而且由于最佳适配会尽量找到最合适的空闲区，反而也会
产生很多非常小的空闲区，这些空闲区很难再次应用，因此很可能在浪费的内存空间上也要比前两个多。    

考虑到上面的问题，就出现了 **最差适配**，即总是分配最大的可用空闲区。    

综上考虑，好像并没有一种特别出彩的算法，前两种速度不错，但是浪费空间，后两种速度较差，不过可能会浪费
较少的空间。     

如果进程和空闲区使用不同的链表，则可以按照大小对空闲区链表排序，可以提高最佳适配算法的速度。   

还有一种算法是 **快速适配**，它为那些常用大小的空闲区维护单独的链表。     

## 3.3 虚拟内存

尽管基址寄存器和界限寄存器可以用于创建地址空间的抽象，还有另一个问题需要解决：管理软件的
膨胀。    

使用交换技术处理内存超载的问题在于磁盘的速度较慢，如果要整体交换一个占用内存较多的进程，可能会耗费很多的
时间，因此工程师们就想到将进程分成很多段，在需要时才把对应的段装载到内存中，不需要的段可以暂时交换回
磁盘，总体来看可以说是使用了局部交换。    

这种方法就是 **虚拟内存**。其基本思想是：每个程序拥有自己的地址空间，这个空间被分割成被分割成多个块，
每一块称作一**页**或**页面**。每一页有连续的地址范围。这些页被映射到物理内存，但并不是所有的页都
必须在内存中才能运行程序。当程序引用到一部分在物理内存中的地址空间时，由硬件执行必要的映射。当程序引用
待一部分不在物理内存中的地址空间时，由操作系统负责将缺失的部分装入物理内存并重新执行失败的命令。  

所以有了虚拟内存的分页机制之后，空闲内存的分配单元大小就变成了一页的大小。应该是这样，嗯嗯。            

### 3.3.1 分页

大部分虚拟内存系统都使用一种叫做**分页**的技术，例如，在计算机上某个程序中会有这样一条指令：    

MOV REG, 1000    

它把地址为1000的内存单元的内容复制到REG中（或者相反，这取决于计算机的型号）。    

由程序产生的这些地址称为 **虚拟地址**，它们构成了一个 **虚拟地址空间**。在没有虚拟内存的计算机上，
系统直接将虚拟地址送到内存总线上，读写操作使用具有同样地址的物理内存字；而在使用虚拟内存的情况下，
虚拟地址不是被直接送到内存总线上，而是被送到 **内存管理单元**（Memory Management Unit, MMU），
MMU 把虚拟地址映射为物理内存地址（然而并没有说清楚是如何对进程的内存进行重定位的呀）。     

![mmu](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/mmu.png)

所以这里有个问题没有说明，页表应该是在内存中的，那MMU 要转换地址需要到内存中去查页表吧，还是说
MMU 也有存储器，可以直接存储少量的页表项。（应该是两者皆有，TLB）    

虚拟地址空间按照固定大小划分成被称为页面的若干单元（其实分页是即对进程所用内存分页，也对虚拟内存
进行了分页）。在物理内存中对应的单元叫做 **页框**。页面和页框的大小通常是一样的，在实际系统中通常为512B 到1GB。
很多处理器根据操作系统认为合适的方式，支持对不同大小页面的混合使用和匹配。   

![page.png](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/page.png)

当程序试图访问地址 0 时，例如执行下面的指令：    

`MOV REG, 0`     

将虚拟地址 0 送到 MMU。MMU 看到虚拟地址落到页面 0，其映射的页框是 2，因此地址变换为 8192.     

通过恰当地设置 MMU，可以把 16 个虚拟页面映射到 8 个页框中的任何一个。但是这并没有解决
虚拟地址空间比物理内存大的问题。在实际的硬件中，用一个 "在/不在" 位记录页面在内存中的
实际存在情况。     

当程序访问一个未映射的页面，例如：    

`MOV REG, 32780`    

MMU 注意到该页面没有被映射，于是使 CPU 陷入到操作系统，这个陷阱称为 **缺页中断**或
**缺页错误**。操作系统找到一个很少使用的页框且把它的内容写入磁盘，随后把需要访问的页面读到
刚才回收的页框中，修改映射关系，然后重新启动引起陷阱的指令。这里真实的顺序是操作系统先将要换出去的
页框的修改为未映射，之后把数据写入，然后修改页面映射。其实这里事实上应该是发生了异常。        

例如，如果操作系统决定放弃页框 1，那么它将把虚拟页面 8 装入物理地址 4096，并对 MMU 的映射
做两处修改。首先，它要将虚拟页面 1 的表项标记为未映射，使以后任何对虚拟地址 4096~8191 的
访问都将导致陷阱。随后把虚拟页面 8 的表项标记修改为 1，因此在引起陷阱的指令重新启动时，
它将把虚拟地址映射为物理地址 4108.     

![page-table](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/page-table.png)

在图中我们可以看到一个虚拟地址的例子，虚拟地址8196被分为 4 位的页号和 12 位的偏移量。
4 位的页号可以表示 16 个页面，12位的偏移量可以为一页内的全部4096 个字节编址。     

可用页号做 **页表**的索引，以得出对应于该虚拟页面的页框号，如果 "在/不在" 位为0，则将引起
一个操作系统陷阱。如果该位为1，则将在页表中查到的页框号复制到输出寄存器的高 3 位中，再
加上虚拟地址中的低 12 位偏移量，如此就构成了 15 位的物理地址。    

### 3.3.2 页表

作为一种最简单的实现，虚拟地址到物理地址的映射可以概括如下：虚拟地址被分成虚拟页号（高位
部分）和偏移量（低位部分）两部分。虚拟页号可用作页表的索引，以找到该虚拟页面对应的页表项。
由页表项可以找到页框号。然后把页框号拼接到偏移量的高位端，以替换掉虚拟页号，形成送往
内存的物理地址。      

![item](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/page-table-item.png)

页表项的结构是与机器密切相关的，但不同机器的页表项存储的信息都大致相同。通常的页表项大小为32位，其中
最重要的是**页框号**。其次是“在/不在”位。这一位是1时表示该表项是有效的，可以使用；如果是0，则会引起
一个缺页中断。    

**保护**位指出一个页允许什么类型的访问。最简单的形式是这个域只有一位，0表示读/写，1表示只读。一个
更先进的方法是使用三位，分别对应是否启用读、写、执行该页面。    

为了记录页面的使用状况，引入了 **修改**位和 **访问**位。在写入一个页面时由硬件设置修改位。如果一个页面
已经被修改过，则必须写回磁盘。如果一个页面没修改过，则置换时直接丢弃就行，因为它在磁盘上
的副本仍然是有效的。    

不管是读还是写，系统都会在该页面被访问时设置 **访问**位，它的值用来帮助操作系统在发生缺页
中断时选择要被淘汰的页面。不再使用的页面比正在使用的页面更适合淘汰。    

最后一位用于禁止该页面被高速缓存。对那些映射到设备寄存器而不是常规内存的页面而言，这个
特性是非常重要的。假如操作系统正在紧张地循环等待 I/O设备对它刚发出的命令做出响应，保证
硬件不断地从设备中读取数据而不是访问一个旧的被高速缓存的副本是非常重要的。通过这一位可以
禁止高速缓存。具有独立 I/O 空间而不使用内存映射 I/O 机器不需要这一位。        

### 3.3.3 加速分页过程

任何分页系统都必须考虑两个问题：    

1. 虚拟地址到物理地址的映射必须非常快
2. 如果虚拟地址空间很大，则页表会很大     

第一个问题是由于每次访问内存都需要进行虚拟地址到物理地址的映射，所有的指令最终都必须来自
内存。因此，每条指令进行一两次或更多的页表访问是必要的。      

第二个问题来自现代计算机至少使用32位的虚拟地址，假设页面大小为 4KB，32位地址空间有 100万
页，64位则更多。     

这一节介绍如何加速分页的过程：    

+ **转换检测缓冲区**    

多年以来设计者观察到这样一个问题：大多数程序总是对少量的页面进行多次的访问，而不是相反。
因此，只有少量的页表项会被反复读取，而其他的页表项很少被访问。   

为计算机设置一个小型的硬件设备，将虚拟地址直接映射到物理地址，而不必再访问内存中的页表。这种设备叫做
**转换检测缓冲区**（Translation Lookaside Buffer, TLB），有时又称为**相联存储器**或者**快表**，
它通常在 MMU 中，包含少量的表现，在实际中很少超过256个。       

![tlb](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/TLB.png)

现在看一下 TLB 是如何工作的。将一个虚拟地址放到 MMU 中进行转换时，硬件首先通过将该虚拟页号与 TLB 中所有
页表项同时进行匹配，判断虚拟页面是否在其中。如果发现了一个有效的匹配并且要进行的访问操作不违反保护位，
则将页框号直接从 TLB 中取出而不必再访问页表。如果虚拟页号确实是在 TLB 中，但指令试图在
一个只读页面上进行写操作，则会产生一个包含错误，就像对页表进行非法访问一样。    

如果 MMU 在 TLB 中没有检测到有效的匹配项，就会进行正常的页表查询，接着从 TLB 中淘汰一个
表项，然后用新找到的页表项代替它。当一个表项被清除出 TLB 时，将修改位复制到内存中的页表项，
而除了访问位，其他的值不变。      

+ **软件 TLB 管理**    

在上面我们介绍了由 MMU 硬件完全管理 TLB 和处理 TLB 失效问题的情形，不过在许多现代 RISC 机器上，
几乎所有的页面管理都是在软件中实现的，在这些机器上，TLB 表项被操作系统显式地装载。当发生 TLB 访问失效时，
不再是由 MMU 到页表中查找1并取出需要的页表项，而是生成一个 TLB 失效并将问题交给操作系统解决。系统先是
找到该页面，然后从 TLB 中删除一个项，接着装载一个新的项，最后再执行先前出错的指令。     

个人感觉软件管理 TLB，比硬件来说提供了更大的灵活性，就像在用户态实现内核一样，软件可以
更加自由的控制整个 TLB 页面切换的算法。    

当使用软件管理 TLB时，一个基本的要求是要理解两种不同 TLB 失效的区别在哪里。当一个页面访问在内存中
而不在 TLB 中时，将产生 **软失效**。那么此时所要做的就是更新一个 TLB，不需要产生磁盘 I/O。典型的处理
需要10~20个机器指令并花费几纳秒完成操作。相反，页面本身不在内存中时，将产生 **硬失效**。此刻需要一次磁盘存取
以装入该页面，这个过程大概需要几毫秒。     

### 3.3.4 针对大内存的页表

上一节介绍的是如何加速分页的过程，这一节介绍一下针对大内存产生的大量页表项该怎么优化。    

+ **多级页表**      

第一种方法时采用 **多级页表**。一种方案可以是，32位的虚拟地址被划分为 10 位的 PT1 域、
10 位的 PT2 域和 12 位的 Offset 域。因为偏移量是 12 位，所以页面大小是 4KB。共有
2<sup>20</sup> 个页面。    

引入多级页表的原因是避免把全部页表一直保存在内存中。特别是那些从不需要的页表就不应该保留。    

下面看一个示例，考虑 32 位虚拟地址 0x00403004 位于数据部分 12292 字节处。它的虚拟地址
PT1=1, PT2=3, Offset=4。MMU 首先用 PT1 作为索引访问顶级页表得到表项1，它对应的虚拟地址范围
4M~8M-1。然后，它用 PT2 作为索引访问刚刚找到的二级页表并得到表项3，它对应的虚拟地址范围是
在他的 4M 块内的12288~16383.这个表项含有虚拟地址所在页面的页框号。如果该页面不再内存中，
将引发一次缺页中断。如果该页面在内存中，从二级页表得到的页框号将与偏移量结合形成物理地址。      

注意其实如果进程所用的内存比较多的话，多级页表的页表项可能相对于单层页表来说数目相差不大。   

+ **倒排页表**     

在这种设计中，实际内存中的每个页框对应一个表项，而不是每个虚拟页面对应一个表项。例如，
对于 64位虚拟地址， 4KB的页，4GB 的RAM，一个倒排页表仅需要 1048576 个表项。表项记录了
哪一个（进程，虚拟页面）对定位于该页框。（这不是还是百万级的嘛，感觉也不少啊）     

虽然倒排页表节省了大量的空间，但是不足的在于从虚拟地址到物理地址的转换会很慢。当进程n访问虚拟页面 p
时，硬件不再能通过把 p 当成指向页表的一个索引来查找物理框。取而代之的是必须搜索整个倒排页表来查找
表项（n, p）。此外，该搜索必须对每一个内存访问操作都要执行一次，而不仅仅是发生缺页中断时
执行。

解决上述问题的办法是使用 TLB，如果 TLB 能记录所有频繁使用的页面，地址转换就可能像通常的
页表一样快。但是发生 TLB 失效时，需要搜索整个倒排页表。实现快速搜索的解法是建立
散列表，用虚拟地址来散列。    

### 3.3.5 分段与分页

这里有必要暂时提一下分段与分页，后面好像还会讲到分段的问题。    

首先，分段其实就是我们说的一个进程，它的内存可能会分成多个段，例如常用的代码段、数据段、
堆栈段。这样不同的段可以说其实自己就已经都是一个独立的地址空间了，而不是说整个进程是一个
独立的地址空间。     

在启用了分段后，我们所有的地址都是相对于段的基址进行偏移的了。例如最常见的指令的位置：
CS:EIP。CS 指定代码段的位置，EIP 指定指令的偏移量。    

## 3.4 页面置换算法

当发生缺页中断时，操作系统必须在内存中选择一个页面将其换出内存，以便为即将调入的页面腾出空间。如果要
换出的页面在内存驻留期间已经被修改过，就必须把它写回磁盘以更新该页面在磁盘上的副本，如果没修改过的，直接
用新页面覆盖旧页面就行。     

注意这一节所有的算法都没有说明，在使用算法处理页表时，算法使用的数据结构究竟包含了什么
内容。    

### 3.4.1 最优页面置换算法

算法是这样工作的：在缺页中断发生时，有些页面在内存中，其中有一个页面将很快被访问，其他页面则可能到
10、 100或1000条指令后才会被访问，每个页面都可以用在该页面首次被访问前索要执行的指令数作标记。    

最优页面置换算法规定应该置换标记最大的页面。这个算法的问题是算法是无法实现的，因为我们根本不知道哪个页面在
多少条指令后会被访问。    

### 3.4.2 最近未使用页面置换算法

为了使操作系统能够收集有用的统计信息，在大部分具有虚拟内存的计算机中，系统为每一页面设置了两个状态位。
当该页面被访问（读或写）时设置 R 位；当该页面被写入时设置 M 位。这些位包含在每个页表中。通常是由硬件来
设置它们的。    

可以用 R位和 M位来构造一个简单的页面置换算法：当启动一个进程时，它的所有页面的两个位都由操作系统设置成 0，
R位被定期地（比如说在每次时钟中断时）清零，以区别最近没有被访问的页面和被访问的页面。    

当发生缺页中断时，操作系统检查所有的页面并根据它们当前的 R位和 M位的值，把它们分为4类：    

+ 第0类：没有被访问，没有被修改
+ 第1类：没有被访问，已被修改
+ 第2类：已被访问，没有被修改
+ 第3类：已被访问，已被修改    

**NRU**（Not Recently Used, 最近未使用）算法随机地从类编号最小的非空类中挑选一个页面淘汰。
那每次淘汰页面时，都要遍历一下整个页表或者部分页表还寻找最小的类编号的页面咯？     

等等，下面的算法中有一个问题没有讲清楚，就是算法中使用的数据结构中保存的 RM 位和页表中的
页表项的 RM 位是否是一致的。理论上应该是一致的。      

### 3.4.3 先进先出页面置换算法

另一种开销较小的页面置换算法是 FIFO 算法。这个看名字也能理解，问题的话应该是可能有一些最先进入的页面
被频繁的使用但是还是被淘汰。    

### 3.4.4 第二次机会页面置换算法

对FIFO 算法做一点改进可以避免将频繁使用的页面淘汰：检查最老页面的 R 位，如果 R 位是0，那么这个页面即
老又没有被使用，可以立刻置换掉；如果是1，就将 R 位清0，并把该页放到链表的末尾。然后继续搜索。     

首先，FIFO 和这种算法是都需要一个链表结构的，那么链表节点的都要保存什么内容？页面号，RM
位以及页框号？      

其次，根据情况来看，这种算法也是会用时钟中断定期清 R 位的。     

### 3.4.5 时钟页面置换算法

根据书上的意思来说，second chance 算法要经常在链表中移动页面，既降低了效率又不是很有必要，
但是个人感觉在链表中只是做一些移动节点的操作吧，不算多么耗性能的工作吧。     

把所有页面保存在一个类似钟面的环形链表，一个指针指向最老的页面。当发生缺页中断时，算法首先检查表针指向
的页面，如果它的 R 位是0就淘汰该页面，并把新的页面插入到这个位置，然后把表针前移一个位置；如果 R 位
是1就清除R 位并把表针前移一个位置。重复这个过程直到找到一个 R 位为 0 的页面。     

### 3.4.6 最近最少使用页面置换算法

在缺页中断时，置换未使用时间最长的页面，这个策略称为 **LRU**（Least Recently Used, 最近最少使用）。     

为了实现LRU，需要在内存中维护一个所有页面的的链表，最近最多使用的页面在表头，最近最少使用的页面在表尾。
困难的是每次访问都要更新整个链表。在链表中找到一个页面，删除它，然后把它移动到表头是一个非常费时的操作。

LRU 的问题在于需要在内存中维护一个所有页面的链表，每次访问内存都必须要更新整个链表。这里
所指的更新的意思是每次都访问内存，都要更新整个链表中每个节点保存最近访问时间和访问次数的
字段的意思吧。    


### 3.4.7 用软件模拟 LRU

一种能用软件实现的解决方案是 NFU（Not Frequently Used, 最不常用）算法，该算法将每个页面与一个
软件计数器相关联，计数器的初值为0。每次时钟中断时，由操作系统扫描内存中所有的页面，将每个页面的 R 位
加到它计数器上。这个计数器大致上跟踪了页面被访问的频繁程度。发生缺页中断时，则置换计数器值最小的页面。
但是其实NFU 也挺耗费空间的吧，然后替换时候还要搜出整个计数器表找出最小的计数器。     

这个算法的问题是如果不定时清除一下计数器，那么可能有一些很久之前频繁访问但最近不使用的页面要比最近
才开始频繁访问的页面的计数器值高，导致可能淘汰常用的页面。    

因此需要对 NFU 最如下修改：在 R 位被加进先将计数器右移一位，其次，将 R 位加到计数器最左端的位
而不是最右端的位。修改后的算法称为**老化**算法。      

### 3.4.8 工作集页面置换算法

一个进程当前正在使用的页面集合称为它的**工作集**，如果整个工作集都被装入到了内存中，那么进程在运行到
下一运行阶段之前，不会产生很多缺页中断，因此很多分页系统都会设法跟踪进程的工作集，以确保在进程运行之前（肯定最少
也是在第二次运行之前了，第一次运行前肯定是会产生大量缺页中断，无法避免），它的工作集就已在内存中了。
该方法称为**工作集模型**，在进程运行前预先装入其工作集页面也称为**预先调页**。    

这个算法的难点是如何确定工具集，可以根据最近 k 次的内存访问来确定，但是这种方式开销很大，可行的
替代方法是用时间来替代，比如说将工作集定义为过去10ms 中的内存访问所用到的页面的集合。   

太麻烦了，自己看书把。     

### 3.4.9 工作集时钟页面置换算法

当缺页中断发生后，需要扫描整个页表才能确定被淘汰的页面，因此基本工作集算法是比较费时的。有一种改进
的算法，基于时钟算法，并且使用了工作集信息，称为**WSClock**（工作集时钟）算法。    

与时钟算法一样，所需的数据结构是一个以页框为元素的循环表。   

略。    

## 3.5 分页系统的设计问题

### 3.5.1 局部分配策略和全局分配策略     

在使用页面置换算法决定要淘汰的页面时，如果是从整个内存中选取要淘汰的页面，则称为全局页面置换算法，
而如果只是从分配给当前进程的页面中进行淘汰时，则称为局部页面置换算法。     

全局算法在通常情况下工作得比局部算法好。    

有的页面置换算法在两种策略下都能工作，有的则可能只能在一种策略下工作。     

### 3.5.5 共享页面

由于避免了在内存中有一个页面的两份副本，共享页面效率更高，不过需要注意的是，只有只读的页面可以共享，
数据页面则不能共享。    

如果系统支持分离的 I 空间和 D 空间，那么让两个或多个进程来共享程序就变得非常简单了，这些进程使用相同
的 I 空间页表和不同的 D 空间页表。    

共享数据也是有可能实现的，在 UNIX 中，在进行 fork 系统调用后，父进程和子进程要共享程序文本和数据。
在分页系统中，通常是让这些进程分别拥有它们自己的页表，但都指向同一个页面集合。这样 fork 调用时
就需要进行页面复制。然而，所有映射到两个进程的数据页面都是只读的。    

只有这两个进程都仅仅是读数据，而不做更改，这种情况就可以保持下去。但只要有一个进程更新了一点数据，就会
触发只读保护，并引发操作系统陷阱。然后会生成一个该页的副本。这种方法称为**写时复制**，它通过减少
复制而提高了性能。    

### 3.5.6 共享库

现代操作系统中，有很多大型库被众多进程使用，例如，处理浏览文件以便打开文件的对话框的库和多个图形库。
把所有这些库静态地与磁盘上每一个可执行程序绑定在一起，将会使它们变得更加庞大。静态链接上百个包含这些库
的程序会浪费大量的磁盘空间，在装载这些程序时也会浪费大量的内存空间。        

一个更加通用的技术是使用 **共享库**（在 Windows 中称作 DLL 或动态链接库）。当一个程序和共享库链接时，
链接器没有加载被调用的函数，而是加载了一小段能够运行时绑定被调用函数的存根例程（stub routine）。
依赖于系统和配置信息，共享库或者和程序一起被装载，或者在其所包含函数第一次被调用时被装载。当然，如果
其他程序已经装载了某个共享库，就没有必要再次装载它了。当一个共享库被装载和使用时，整个库不是被一次性
地读入内存。而是根据需要，以页面为单位装载的，因此没有被调用到的函数是不会被装载到内存的。    

除了可以使可执行文件更小，节省内存空间之外，共享库还有一个优点：如果共享库中的一个函数因为修正了一个
bug 被更新了，那么并不需要重新编译调用了这个函数的程序。     

## 3.6 有关实现的问题

### 3.6.1 与分页有关的工作

操作系统要在下面四段时间里做与分页相关的工作：进程创建时，进程执行时，缺页中断时和进程终止时。    

当在分页系统中创建一个新进程时，操作系统要确定程序和数据在初始时有多大，并为它们创建一个页表。操作系统还要
在内存中为页表分配空间并对其进行初始化。当进程被换出时，页表不需要驻留在内存中，但当进程运行时，它必须在
内存中。另外，操作系统要在磁盘交换区中分配空间，以便在一个进程换出时在磁盘上有放置此进程的空间。操作系统还要
用程序正文和数据对交换区进行初始化，这样当新进程发生缺页中断时，可以调入需要的页面。最后，操作系统必须
把有关页表和磁盘交换区的信息存储在进程表中。     

当调度一个进程执行时，必须为新进程重置 MMU，刷新 TLB，以清除以前的进程遗留的痕迹。新进程的页表必须成为
当前页表（这里需要注意一下，其实理论上应该是存在两个页表的，一个是整个内存虚拟地址空间的页表，另一个就是
每一个进程自身拥有的页表），通常可以通过复制该页表或者把一个指向它的指针放进某个硬件寄存器来完成。    

当缺页中断时，操作系统必须通过读硬件寄存器来确定哪个虚拟地址造成了缺页中断。通过该信息，它要计算需要哪个页面，
并在磁盘上对该页面进行定位。它必须找到合适的页框来存放新页面，必要时还要置换老的页面，然后把所需的页面
读入页框。最后，还要回退程序计数器，使程序计数器指向引起缺页中断的指令，并重新执行该指令。   

当进程退出的时候，操作系统必须释放进程的页表、页面和页面在硬盘上所占用的空间。   


### 3.6.2 缺页中断处理

缺页中断发生时的事件顺序如下：    

1. 硬件陷入内核，在堆栈中保存程序计数器。大多数机器将当前指令的各种状态信息保存在特殊的 CPU 寄存器中。
2. 启动一个汇编代码例程保存通用寄存器和其他易失的信息，以免被操作系统破坏。
3. 当操作系统发现一个缺页中断时，尝试发现需要哪个虚拟页面。通常一个硬件寄存器包含了这一信息，如果没有
的话，操作系统必须检查程序计数器，取出这条指令，用软件分析这条指令，看看它在缺页中断时发生了什么。
4. 一旦知道了发生缺页中断的虚拟地址，操作系统检查这个地址是否有效，并检查存取与保护是否一致。如果不一致，向进程
发出一个信号或杀掉该进程。如果地址有效且没有保护错误发生，系统则检查是否有空闲页框。如果没有空闲页框，
执行页面置换算法寻找一个页面淘汰。
5. 如果选择的页框“脏”了，安排该页写回磁盘，并发生一次上下午切换，挂起产生缺页中断的进程，让其他进程
运行直至磁盘传输结束。无论如何，该页框被标记为忙，以免因为其他原因而被其他进程占用。
6. 一旦页框“干净”后，操作系统查找所需页面在磁盘上的地址，通过磁盘操作将其装入。该页面正在被装入时，产生缺页
中断的进程仍然被挂起，并且如果有其他可运行的用户进程，则选择另一个用户进程运行。
7. 当磁盘中断发生时，表明该页已经被装入，页表已经更新可以反映它的位置，页框也被标记为正常状态。
8. 恢复发生缺页中断指令以前的状态，程序计数器重新指向这条指令。
9. 调度引发缺页中断的进程，操作系统返回调用它的汇编语言例程。
10. 该例程恢复寄存器和其他状态信息，返回到用户空间继续执行，就好像缺页中断没发生过一样。   

## 3.7 分段

在一维地址空间中，当有多个动态增加的表时，一个表可能会与另一个表发生碰撞。因此需要一种能令程序员不用管理表扩展和收缩的方法。    

一个通用的方法是在机器上提供多个互相读了的称为 **段**的地址空间。每个段由一个从0到最大的线性地址序列构成。各个段的长度可以是0到某个允许的最大值之间的任何一个值。不同的段长度可以不同。段的长度可以动态改变。   

注意在 Inter 的架构上说了，每个运行程序都有一个由 1024 个 32 位表项组成的 页目录。它通过一个
全局的寄存器来定位，这个目录中的每个目录项指向一个也包含 1024 个 32 位表项的页表，页表项指向
页框。不过这里其实说的不全，如果是 4MB 的页面大小，那么页目录就指向页框了。   

## 内存管理 总结

整章可以分为5个部分，第一部分介绍了对存储器的一种抽象方式，即地址空间。第二部分介绍了虚拟内存的相关
内容，第三部分介绍了一些页面的置换算法，后两部分分别介绍了内存管理的设计问题和实现问题。    

### 3.2 地址空间  

第一部分是对地址空间的介绍。首先介绍了地址空间的概念，为了实现多进程对内存的复用，需要解决两个问题，保护和重定位。保护是指
进程不能对自身所属内存之外的地址进行读写。重定位是指进程中的内存地址需要针对当前进程所处的内存地址进行
重定位校正。为了解决这两个问题提出了地址空间的概念。    

地址空间是对进程所使用内存的一种抽象，给了进程一种自己独占一份内存的错觉。实现地址空间的经典方法是基址寄存器
和界限寄存器，基址寄存器保存进程的起始物理地址，界限寄存器保存进程的长度，这样在进程使用内存时，首先会加上
基址寄存器的值来解决重定位的问题，其次通过检查内存地址是否超出了进程的长度可以实现对其他进程内存的保护。    

之后介绍了交换技术，针对内存超载的问题（即当前所有运行进程所使用的内存超过了当前内存的大小）有两种解决办法，
交换技术和虚拟内存。交换技术的话使用了之前介绍的两种寄存器，同样会为进程分配一段连续的内存，进程不运行的时候
可以换回磁盘来释放内存空间。    

最后介绍了空闲内存的管理，无非两种方法，位图和链表。位图的就是将整个内存分成一小段一小段，然后在一张
图上记录下哪一小段使用了，哪一小段没有。这个方法的问题在于小段分的太小的话图就会很大，占内存，小段分的
太大的话，还是会浪费内存。    

链表的话很好理解，就是用一个链表来保存各个空闲块的信息，至少每个链表节点都应该包含当前空闲块的地址、长度以及
指向下一节点的指针。当使用链表方法管理空闲内存时，有几种方法可以为新创建的进程寻找合适的内存位置，分别是
首次适配、下次适配、最优适配和最差适配。    

### 3.3 虚拟内存

介绍完地址空间等相关概念后，就该将重点虚拟内存了。虽然交换技术可以解决一部分内存超载的问题，但是它解决不了
一个进程所使用内存就超过内存大小的情况。而且交换技术的话整体交换效率也比较低。   

虚拟内存的概念也好理解，无非是在地址空间的基础上，把整个地址空间再分页，这样就可以使用局部加载和交换。   

这一部分共介绍了4个内容，一个是分页的概念，之后是页面的构成，最后两部分解决了分页系统中关键的两个问题：加速分页
过程和处理大内存的页表。    

需要注意的一点是，当发生缺页中断时，我们应该淘汰的是一个不常使用的页框，即一块实际的内存内容，而不是什么
页表。     

与其说加速分页过程，不如说加速页面到页框的映射速度。    

### 3.4 页面置换算法

分别有最优算法，最近未使用算法，先进先出算法，第二次机会算法，时钟算法，最近最少使用算法，最不经常使用
算法，老化算法，工作集算法和工作集时钟算法。    

