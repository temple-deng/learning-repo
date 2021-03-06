# 8086 寄存器介绍

8086 CPU 中，寄存器的个数为 14 个，所有寄存器的结构为 16 位。80386 的寄存器个数要比 8086
多，寄存器的结构也多为 32 位。这 14 个寄存器分别为：   

AX, BX, CX, DX, SP, BP, SI, DI, IP, FLAG, CS, DS, SS, ES。       

而这 14 个寄存器按照一定方式又分为了通用寄存器，控制寄存器和段寄存器。     

## 通用寄存器

AX, BX, CX, DX 称为数据寄存器，SP, BP 称为指针寄存器，SI, DI 称为变址寄存器：   

+ AX(Accumulator): 累加寄存器
+ BX(Base): 基地址寄存器
+ CX(Count): 计数器寄存器
+ DX(Data): 数据寄存器
+ SP(Stack Pointer): 堆栈指针寄存器
+ BP(Base Pointer): 基指针寄存器
+ SI(Source Index): 源变址寄存器
+ DI(Destination Index): 目的变址寄存器      

至于为什么叫通用寄存器，那是因为，这些寄存器每个都有自己专门的用途的同时，还可以用来传送
数据和暂存数据。     

### 数据寄存器

由于在 8086 之前的 CPU 为 8 位 CPU，所以为了兼容以前的 8 位程序，在 8086 CPU 中，每一个
数据寄存器都可以当做两个单独的寄存器来使用：   

+ AX = AH + AL
+ BX = BH + BL
+ CX = CH + CL
+ DX = DH + DL    

除了以上 4 个数据寄存器以外，其他寄存器均不可分为两个独立的 8 位寄存器。       

#### AX

假如有如下代码：   

```asm
MOV AX,1234H   ; 向寄存器 AX 传入数据 1234H
MOV AH,56H     ; 向寄存器 AX 的高8位寄存器 AH 中传入数据 56H
MOV AL,78H     
```    

执行每条结果后，AX 中的内容如下：    

```
AX = 1234
AX = 5634
AX = 5678
```    

而既然 AX 又被称作为累加器，自然其还有一点点特殊的地方的。AX 寄存器还具有的特殊用途是在
使用 DIV 和 MUL 指令时使用，DIV 在 8086 CPU 中是除法指令，而在使用除法的时候有两种情况，
即除数可以是 8 位或者是 16 位的。而且除数可以存放在寄存器中或者是内存单元中，而至于被除
数的话，自然，应该由 AX 来代替了。      

当除数是 8 位时，被除数一定会是 16 位的，并且默认是放在 AX 寄存器中，而当除数是 16 位时，
被除数一定是 32 位的，因为 AX 是 16 位寄存器，自然，放不下 32 位的被除数，所以，在这里
还需要使用另一个 16 位寄存器 DX。      

其中 DX 存放 32 位的被除数的高 16 位，而 AX 则存放 32 位的被除数的低 16 位，同时，AX 
的作用还不仅仅是用来保存被除数的，当除法指令执行完成以后，如果除数是 8 位的，则在 AL 中
会保存此次除法操作的商，而在 AH 中则会保存此次除法操作的余数。    

当然，如果除数是 16 位的话，则 AX 中会保存本次除法操作的商，而 DX 则保存本次除法操作的余数。    

当使用 MUL 做乘法运算时，两个相乘的数要么都是 8 位，要么都是 16 位，如果两个相乘的数
都是 8 位的话，则一个默认是放在 AL 中，而另一个 8 位的乘数则位于其他的寄存器或者说是
内存字节单元中。     

而如果两个相乘的数都是 16 位的话，则一个默认存放在 AX 中，另一个 16 位的则是位于 16位 
的寄存器中或者是某个内存字单元中，同时，当 MUL 指令执行完毕后，如果是 8 位的乘法运算，
则默认乘法运算的结果是保存在 AX 中，而如果是 16 位的乘法运算的话，则默认乘法运算的结果有 32 位，
其中，高位默认保存在 DX 中，而低位则默认保存在 AX 中。    

这个意思是因为除和乘之后的运算结果仍存放在 AX 中，所以 AX 就叫累加器？     

#### BX

BX 的特殊功能时在 **寻址** 上。BX 寄存器中存放的数据一般是用来作为偏移地址使用的，而
偏移的基地址其实就是段地址，而段地址肯定是在段寄存器中，这里就不介绍了。     

在 8086 CPU 中，CPU 是根据 &lt;段地址: 偏移地址&gt;来进行寻址操作的。      

#### CX

当在汇编指令中使用循环 LOOP 指令时，可以通过 CX 来指定需要循环的次数，而 CPU 在每一次
执行 LOOP 指令的时候，都会做两件事，一件是令 CX = CX - 1，另一件就是判断 CX 中的值，
如果 CX 中的值为 0 则会跳出循环。     

### 指针寄存器 BP, SP

这里只介绍 BP，因为 SP 实质上必须和 SS 段寄存器一起使用，以后再介绍。      

当 BP 以 [...] 的方式访问内存单元而且在 [...] 中使用了寄存器 BP 的话，那么如果在指令中
没有明确或者说是显示的给出段地址，段地址默认使用 SS 寄存器的值（BP, SI, DI 会默认使用
DS 段寄存器）。     

在 8086 CPU 中，只有 4 个寄存器可以以 [...] 的方式使用，分别是 BX, BP, SI, DI。     

### 变址寄存器 SI, DI

首先，变址寄存器和上面介绍的指针寄存器 SP, BP，功能其实都是用于存放某个存储单元地址的偏移，
或者用于某组存储单元开始地址的偏移，即作为存储器指针使用。     


## 其他寄存器 IP, FLAG, CS, DS, SS, ES

8086 CPU 的地址总线是 20 根，但是寄存器只有 16 位，因此 CPU 必须使用一些特殊的方法来
让其寻址能力达到 20 位即 1MB。     

8086 CPU 内部通过将两个 16 位的地址进行合成，从而形成一个 20 位的物理地址。当 CPU 在
访问内存时，其会使用一个 16 位的基地址，然后再使用一个 16 位的偏移地址，通过将基地址和
偏移地址传入 8086 CPU 的地址加法器中进行合成即可构造出 20 位的物理地址。    

合成的方式为：基地址其实是通过一个 16 位的段地址来形成的，将一个段地址左移 4 位形成了
基地址。     

段的概念：由于段的其实地址是一个段地址左移 4 位，所以很明显，段的起始地址肯定是 16 的
倍数，而且由于一个段内部，只能通过偏移地址来定位，而偏移地址为 16 位，所以一个段的长度
也就是 2<sup>16</sup> 也就是 64 KB 的大小。      

FLAG 寄存器好像就是我们通常说的程序状态字 PSW。     


### 控制寄存器

+ IP(Instruction Pointer): 指令指针寄存器
+ FLAG: 标志寄存器

### 段寄存器

+ CS(Code Segment)
+ DS(Data Segment)
+ SS(Stack Segment)
+ ES(Extra Segment)     

# 80386

80386 有四种运行模式：    

+ 实模式
+ 保护模式
+ SMM 模式
+ 虚拟8086模式    

实模式：16位寻址空间（严格来说应该是20位的寻址空间吧），没有保护机制。80386 加电启动后
就处于实模式运行状态，在这种状态下软件可访问的物理内存空间不超过 1MB，且无法发挥80386
以上级别的32位 CPU 的 4GB 内存管理能力。     

保护模式：32位寻址空间，有保护机制，支持内存分页机制，提供了对虚拟内存的良好支持。保护
模式下80386 支持多任务，还支持优先级机制。不同的程序可以运行在不同的优先级上。优先级
一共分为0~34个级别，操作系统运行在最高级别 0 上。      

80386 共提供了 8 组寄存器：   

+ 通用寄存器 EAX, EBX, ECX, EDX, EBP, ESP, ESI, EDI
+ 段寄存器 CS, DS, SS, ES, FS, GS
+ 指令指针寄存器 EIP
+ 标志寄存器 EFLAGS
+ 系统表寄存器 GDTR, IDTR, LDTR, TR
+ 控制寄存器 CR0, CR1, CR2, CR3, CR4
+ 调试寄存器 DR0~DR7
+ 测试寄存器 TR6, TR7

# 第三讲 启动、中断、异常和系统调用

## 3.1 BIOS

内存是分为 RAM 和 ROM 两部分的，ROM 中保存的就是系统初始化的代码，因此系统加电之后是
可以正常的从内存中读取到第一条指令的。       

![memory-bios](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/memory-bios.png)

这时候为了从磁盘读取数据，BIOS 必须能有以下的功能：   

+ 基本输入输出的程序
+ 系统设置信息
+ 开机后自检程序
+ 系统自启动程序    

执行完 BIOS 之后，我们就要开始从磁盘读取加载程序了，这时候 BIOS 将磁盘的引导扇区的内容
加载到 0x7c00处，然后系统跳转到 CS:IP = 0000:7c00.然后加载程序开始读入系统内核，操作
系统接手。       

## 3.2 系统启动流程

### CPU 初始化

注意这里介绍一下，8086 就有 20条地址线，所以一开始 CPU 的实模式有20位的地址空间是没有
问题

+ CPU 加电稳定后从 0xffff0 读第一条指令
  - CS:IP = 0xf000: fff0
  - 第一条指令式跳转指令
+ CPU 处于实模式
  - CS:IP 均为 16位寄存器
  - 指令指针 PC = 16*CS + IP
  - 最大地址空间是 1MB，ffff0

### BIOS 初始化过程

+ 硬件自检 POST
  - 检测系统中内存和显卡等关键部件的存在和工作状态
  - 查找并执行显卡等接口卡 BIOS，进行设备初始化
+ 执行系统 BIOS，进行系统检测
  - 检测和配置系统中安装的即插即用设备
+ 更新 CMOS 中的扩展系统配置数据 ESCD
+ 按指定启动顺序从软盘、硬盘或光驱启动

### MBR

+ 启动代码 446 字节
  - 检查分区表正确性
  - 加载并跳转到磁盘上的引导程序
+ 硬盘分区表 64 字节
  - 描述分组状态和位置
  - 每个分区描述信息占据 16 字节
+ 结束标志字 2 字节 55AA
  - 主引导记录的有效标志

## 3.3 中断、异常和系统调用

![kernel](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/kernel.png)

+ 系统调用
  - 应用程序主动向操作系统发出的服务请求
+ 异常
  - 非法指令或者其他原因导致当前指令执行失败
+ 中断
  - 来自硬件设备的处理请求

### 中断、异常和系统调用比较

+ 源头
  - 中断：外设
  - 异常：应用程序意想不到的行为
  - 系统调用：应用程序请求操作系统提供服务
+ 响应方式
  - 中断：异步
  - 异常：同步
  - 系统调用：同步或异步
+ 处理机制
  - 中断：持续，对用户应用程序是透明的
  - 异常：杀死或者重新执行意想不到的应用程序指令
  - 系统调用：等待和持续

# 第四讲 实验——bootloader 启动

首先，注意一点，CPU 中的寄存器加电后不是所有都是 0，不同的寄存器可能加电后默认的值是不同
的。    

## 4.1 启动顺序

### x86 启动顺序——第一条指令

+ CS = F000H, EIP = 0000FFF0H
+ 实际地址是：
  - Base + EIP = FFFF0000H + 0000FFF0H = FFFFFFF0H
  - 这个 BIOS 的 EEPROM 所在地    

貌似是因为加电后是实模式，所以很多东西都是向下兼容的。Base 是 CS 中隐藏的一个内容。而且注意实模式下应该只有20位的地址空间，所以第一条指令的实际地址应该是 ffff0H
吧（这里不太确定）。     

为什么16位的 CS 和 EIP 能形成 20 位的地址呢，如下图所示，其实上面也讲到了：    

![real-mode](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/real-mode.png)

bootloader 会切换 CPU 为保护模式，并开启段机制。怎么做的呢，就是将 CR0 的第一个 bit 置0，
这样 CPU 就进入了保护模式。       

![logical-to-linear](https://raw.githubusercontent.com/temple-deng/markdown-images/master/operating-system/logical-to-linear.png)
