# 第 4 章 网络层

<!-- TOC -->

- [4.1 概述](#41-概述)
  - [4.1.1 转发和路由选择](#411-转发和路由选择)
  - [4.1.2 网络服务模型](#412-网络服务模型)
- [4.2 虚电路和数据报网络](#42-虚电路和数据报网络)
  - [4.2.1 虚电路网络](#421-虚电路网络)
  - [4.2.2 数据报网络](#422-数据报网络)
- [4.3 路由器工作原理](#43-路由器工作原理)
  - [4.3.1 输入端口](#431-输入端口)
  - [4.3.2 交换结构](#432-交换结构)
  - [4.3.4 何处出现排队](#434-何处出现排队)
- [4.4 网际协议：因特网中的转发和编址](#44-网际协议因特网中的转发和编址)
  - [4.4.1 数据报格式](#441-数据报格式)
  - [4.4.2 IPv4 编址](#442-ipv4-编址)
  - [4.4.3 因特网控制报文协议](#443-因特网控制报文协议)
  - [4.4.4 IPv6](#444-ipv6)
- [4.5 路由选择算法](#45-路由选择算法)
  - [4.5.1 链路状态路由选择算法](#451-链路状态路由选择算法)
  - [4.5.2 距离向量路由选择算法](#452-距离向量路由选择算法)
  - [4.5.3 层次路由选择](#453-层次路由选择)
- [4.6 因特网中的路由选择](#46-因特网中的路由选择)
  - [4.6.1 因特网中自治系统内部的路由选择：RIP](#461-因特网中自治系统内部的路由选择rip)
  - [4.6.2 因特网中自治系统内部的路由选择：OSPF](#462-因特网中自治系统内部的路由选择ospf)
  - [4.6.3 自治系统间的路由选择：BGP](#463-自治系统间的路由选择bgp)
- [4.7 广播和多播路由选择](#47-广播和多播路由选择)
  - [4.7.1 广播路由选择算法](#471-广播路由选择算法)
  - [4.7.2 多播](#472-多播)

<!-- /TOC -->

网络层是协议栈中最复杂的层次之一。我们学习从网络层的概述和它能够提供的服务开始。将仔细考察两种用于
构造网络层分组交付的方法，即数据报模式和虚电路模式。    

在本章中，我们将对网络层的**转发**和**路由选择**做重要区分。转发涉及分组在单一的路由器中从一条入链路到一条
出链路的传送，路由选项涉及一个网络的所有路由器，它们经路由选择协议共同交互，以决定分组从源到目的地结点
所采用的路径。    

为了加深对分组转发的理解，将探讨路由器内部的硬件体系结构和组织，以及因特网中的网际协议（IP）。    

之后是路由选择功能。也就是说整章差不多3个部分，第一部分对网络层进行整体介绍，然后两部分详解分组转发和
路由选择。     

## 4.1 概述

### 4.1.1 转发和路由选择

网络层的作用从表明上看极为简单，即将分组从一台发送主机移动到一台接收主机。为此，需要两种重要的网络层功能：    

+ 转发。当一个分组到达路由器的一条输入链路时，路由器必须将该分组移动到适当的输出链路。
+ 路由选择。当分组从发送方流向接收方时，网络层必须决定这些分组所采用的路由或路径。计算这些路径的算法
被称为**路由选择算法**。    

转发是指将分组从一个输入链路接口转移到适当的输出链路接口的路由器本地动作。路由选择是指网络范围的过程，以
决定分组从源到目的地所采取的端到端路径。   

每台路由器具有一张**转发表**。路由器通过检查到达分组首部字段的值来转发分组，然后使用该值在该路由器的转发表
中索引查询。存储在转发表项中的该首部的值指出了该分组将被转发的路由器的输出链路接口。分组首部中的该值可能是该分组
的目的地址或该分组所属连接的指示，这取决于网络层协议。    

路由选择算法决定了插入路由器的转发表中的值。路由选择算法可能是集中式的（例如，算法在某个中心场点执行，并向
每台路由器下载路由选择信息），或是分布式的（即，使用运行在每台路由器上的分布式路由选择算法的一部分）。在任何
一种情况下，都是路由器接收路由选择协议报文，该信息用于配置其转发表。    

在某些计算机网络中，网络层还有第三种重要的功能，即**连接建立**。某些网络体系结构如 ATM、帧中继、MPLS，
要求从源到目的地沿着所选择的路径彼此握手，以便在给定源到目的地连接中的网络层数据分组能够开始流动之前
建立起状态。在网络层，该过程被称为**连接建立**。    

### 4.1.2 网络服务模型

因特网的服务模型基本上没提供什么有用的服务。不过其他类型的网络层结构提供了很多服务。ATM（异步传递模式）网络体系
结构提供了多重服务模型，意味着可以在相同的网络中为不同的连接提供不同类别的服务（牛逼啊）。两个最重要
的 ATM 服务模型是恒定比特率和可用比特率服务：   

+ **恒定比特率**（Constant Bit Rate, CBR）**ATM 网络服务**。CBR 服务的目标从概念上讲是简单的，就是
使网络连接看起来就像在发送和接收主机之间存在一条专用的、固定带宽的传输链路，以使用性质相同的虚拟管道来提供分组
（ATM 术语称为信元流）。但是只说了可以保证一定的时延和比特率，并没有说速率是恒定的啊。
+ **可用比特率**（Available Bit Rate, ABR）**ATM 网络服务**。与因特网服务模型一样，ABR 服务下的
信元也许会丢失。然而与因特网不同的是，信元不能被重排序（什么意思），对于使用 ABR 服务的连接来说，最小
信元传输速率是可以得到保证的。     


## 4.2 虚电路和数据报网络

与传输层类似，网络层也能够在两台主机之间提供无连接服务或连接服务。网络层的连接和无连接服务在许多方面与传输层
类似，但是两者之间也有明显的区别：    

+ 在网络层，这些服务是网络层向传输层提供的主机到主机的服务，传输层的服务则是传输层像应用层提供的进程到进程的服务。   
+ 在至今为止的所有主要的计算机网络体系结构中（因特网、帧中继、ATM 等），网络层或者提供了主机到主机
的无连接服务，或者提供了主机到主机的连接服务，而不同时提供这两种服务。仅在网络层提供连接服务的计算机网络
称为**虚电路**（Virtual-Circuit, VC）**网络**；仅在网络层提供无连接服务的计算机网络称为**数据报网络**。     

### 4.2.1 虚电路网络

虽然因特网是一个数据报网络，但许多其他网络体系结构（包括 ATM、帧中继的体系结构）却是虚电路网络，因此在
网络层使用连接。这些网络层连接称为**虚电路**。    

一条虚电路的组成如下：①源和目的主机之间的路径（即一系列链路和路由器）；②VC 号，沿着该路径的每段链路的一个号码；
③沿着该路径的每台路由器中的转发表表项。属于一条虚电路的分组将在它的首部携带一个 VC 号。因为一条虚电路
在每条链路上可能具有不同的VC 号，每台中间路由器必须用一个新的 VC 号替代每个传输分组的 VC 号。该
新的 VC 号从转发表获得。     

无论何时跨域一台路由器创建一条新的虚电路，转发表就增加了一个新表项。类似地，无论何时终止一条虚电路，沿着
该路径每个表中的相应项将被删除。    

在虚电路网络中，该网络的路由器必须为进行中的连接维持**连接状态信息**。特别是，每当跨越一台路由器创建一个新
连接，必须在该路由器的转发表中增加一个新的连接项；每当释放一个连接，必须从该表中删除该项。     

在虚电路中有 3 个明显不同的阶段：   

+ 虚电路建立。在建立阶段，发送传输层与网络层联系，指定接收方地址，等待网络建立虚电路。网络层决定发送方和接收方
之间的路径，即该虚电路的所有分组要通过的一系列链路与路由器。网络层也为沿着该路径的每条链路决定一个 VC 号。最后，
网络层在沿着路径每台路由器的转发表中增加一个表项。   
+ 数据传送。一旦创建了虚电路，分组就可以开始沿该电路流动了。
+ 虚电路拆除。当发送方（或接收方）通知网络层它希望终止该虚电路时，就启动这个阶段。然后网络层通常将通知
网络另一侧的端系统结束呼叫，并更新路径上每台分组路由器中的转发表以表明该虚电路已经不存在了。    

端系统向网络发送指示虚电路启动与终止的报文，以及路由器之间传递的用于建立虚电路的报文，称为**信令报文**，
用来交换这些报文的协议通常称为**信令协议**。     


### 4.2.2 数据报网络

在数据报网络中，每当一个端系统要发送分组，它就为该分组加上目的端系统的地址，然后将分组推进网络。    

当分组从源到目的地传输，它通过一系列路由器传递。这些路由器中的每台都使用的目的地址来转发该分组。特别是，
每台路由器有一个将目的地址映射到链路接口的转发表；当分组到达路由器时，路由器使用该分组的目的地址在转发
表中查找适当的输出链路接口。然后路由器有意将分组向该输出链路转发。    

虽然在数据报网络中路由器不维持连接状态信息，但它们无论如何在其转发表中维持了转发状态信息。转发表
是通过路由选择算法进行修改的，这通常每 1~5分钟更新一次转发表。    

## 4.3 路由器工作原理

路由器有 4 个组成部分：   

+ 输入端口。输入端口执行几个关键功能，一个就是从输入物理链路上获取分组咯，另一个就是与位于入链路远端的数据链路层
交互的数据链路层功能。最重要的就是查找功能，通过查询转发表决定路由器的的输出端口，到达的分组通过
路由器的交换结构将转发到输出端口。控制分组（如携带路由选择协议信息的分组）从输入端口转发到路由选择处理器。    
+ 交换结构。交换结构将路由器的输入端口和输出端口相连接。
+ 输出端口。输出端口存储从交换结构接收的分组，并通过执行必要的链路层和物理层功能在输入链路上传输这些分组。
+ 路由选择处理器。路由选择处理器执行路由选择协议，维护路由选择表以及连接的链路状态信息，并为路由器计算转发表。
它还执行网络管理功能。    

我们对路由器的转发功能和路由选择功能加以区分。一台路由器的输入端口、输出端口和交换结构共同实现了这种
转发功能，并且总是用硬件实现，这些转发功能有时总称为**路由器转发平面**。**路由器控制平面**通常用
软件实现并在路由选择处理器上执行。    

### 4.3.1 输入端口

在输入端口中，路由器使用转发表来查找输出端口，使得到达的分组能经过交换结构转发到该输出端口。转发表是由
路由选择处理器计算和更新的，但转发表的一份影子副本通常会被存放在每个输入端口。转发表从路由选择处理器经过独立
总线复制到线路卡。有了影子副本，转发决策能在每个输入端口本地做出，无须调用中央路由选择处理器，因此避免了集中式处理的瓶颈。    

假定转发表已经存在，从概念上讲表查找是简单的，即我们只是搜索转发表查找最长前缀匹配，但在吉比特速率下，
这种查找必须在纳秒级执行。因此，不仅必须要用硬件执行查找，而且需要对大型转发表使用超出简单线性搜索的技术。     

一旦通过查找确定了某分组的输出端口，则该分组就能够发送进入交换结构。在某些设计中，如果来自其他输入端口的
分组当前正在使用该交换结构，一个分组可能会在进入交换结构时被暂时阻塞。因此，一个被阻塞的分组必须要在
输入端口处排队，并等待稍后被及时调度以通过交换结构。经过“查找”是最为重要的动作，还是输入端口还有其他的
工作：①必须出现物理层和链路层处理；②必须检查分组的版本号、校验和和寿命字段，并且重写后两个字段；
③必须更新用于网络管理的计数器。    

### 4.3.2 交换结构

交换结构有 3 种可用的结构：    

+ 经内存交换。最简单、最早的路由器是传统的计算机，在输入端口和输出端口之间的交换是在 CPU 的直接控制下完成的。
输入和输出端口的功能就像传统的 I/O。使用中断处理。许多现代路由器同内存进行交换，其目的地址的查找和将分组
存储（交换）进适当的内存存储位置是由输入线路卡来处理。
+ 经总线交换。在这种方法中，输入端口经一根共享总线将分组直接传送到输出端口，不需要路由选择处理器的干预。通常按以下
方式完成该任务：让输入端口为分组预先计划以交换机内部标签（首部），指示本地输出端口，使分组在总线上
传送和传输到输出端口。该分组能由所有输出端口收到，但只有与该标签匹配的端口才能保存该分组。然后标签在
输出端口被去除。如果多个分组同时到达路由器，每个位于不同的输出端口，除了一个分组外所有其他分组必须等待，
因为一次只有一个分组能够跨越总线。
+ 经互联网络交换。纵横式网络能够并行转发多个分组，然而，如果来自两个不同输入端口的两个分组其目的地为相同的输出端口，则一个
分组必须在输入端等待，因为在某个时刻经给定总线仅有一个分组能够发送。    


### 4.3.4 何处出现排队

输出端口排队的后果就是，在输出端口上的一个**分组调度程序**必须在这些排队的分组中选出一个来发送。这种选择
可能是根据简单的原则来顶，如先来先服务调度，或者更复杂的调度规则，如加权公平排队。    

类似地，如果没有足够的内存来缓存一个入分组，那么必须做出决定：要么丢弃到达的分组（一种称为**弃尾**的策略），
要么删除一个或多个已排队的分组来为新到的分组腾出空间。在某些情况下，在缓存填满前便丢弃（或在首部加标记）一个
分组，以便向发送方提供一个拥塞信号的做法是有利的。已经提出和分析了许多分组丢弃与标记策略，这些策略统称为
**主动队列管理**（Active Queue Managemnt, AQM）算法。**随机早期检测**（Random Early Detection, RED）算法是一种得到最广泛研究和实现的 AQM 算法。在 RED 算法中，为输出队列长度维护着一个加权平均值。如果平均队列长度小于最小阈值 min<sub>th</sub>，则
当一个分组到达时，该分组被接纳进队列。相反，如果队列满或平均队列长度大于最大阈值max<sub>th</sub>，
则当一个分组到达时，该分组被标记或丢弃。最后，如果一个分组到达，发现平均队列长度在 [min<sub>th</sub>, max<sub>th</sub>] 之间，则该分组以某种概率被标记或丢弃。     

## 4.4 网际协议：因特网中的转发和编址

因特网的网络层有三个主要组件。第一个组件是 IP 协议，第二个组件是路由选择部分，它决定了数据报从源到
目的地所流经的路径，最后一个组件是报告数据报中的差错和对某些网络层信息请求进行响应的设施。    

### 4.4.1 数据报格式

@TODO 此处该有图。    

IPv4 数据报中的关键字段如下：    

+ 版本 4bit。规定了 IP 协议版本。路由器能根据版本号确定如何解释 IP 数据报的剩余部分。
+ 首部长度 4bit。
+ 服务类型 8bit。TOS 使不同类型的 IP 数据报能相互区别开来。例如，将实时数据报（如用于 IP 电话应用）与
非实时浏览（如 FTP）区别开来也许是有用的。  
+ 数据报长度。这是 IP 数据报的总长度（首部加上数据），以字节计。因为该字段长为 16 比特，所以 IP 数据报的理论最大长度
为 65535 字节，然而，数据报很少有超过 1500 字节的。
+ 标识、标志、片偏移。这三个字段与所谓的 IP 分片有关。新版本的 IPv6 不允许在路由器上对分组分片。
+ 寿命 8bit。Time-To-Live, TTL 字段用来确保数据报不会永远（如由于长时间的路由选择环路）在网络中循环。
没当数据报由一台路由器处理时，该字段的值减 1.若 TTL 字段减为 0，则该数据报必须丢弃。
+ 上层协议 8bit。该字段仅在一个 IP 数据报到达其最终目的地才会有用。该字段值指示了 IP 数据报的数据部分
应交给哪个特定的运输层协议。例如，值为 6 表明数据部分要交给 TCP，而值为 17 表明数据要交给 UDP。
+ 首部校验和。首部校验和用于帮助路由器检测收到的 IP 数据报中的比特错误。求和方法和 UDP/TCP 里面的一样。
路由器一般会丢弃检测出错误的数据报。注意到在每台路由器上必须重新计算校验和并再次存放到原处，因为 TTL 字段以及可能
的选项字段会改变。一个经常问到的问题是：为什么 TCP/IP 在传输层和网络层都进行差错检测？首先，IP 层
仅对 IP 首部计算了校验和。其次，TCP/UDP 与 IP 不一定都必须属于同一协议栈。原则上TCP 能运行在一个不同
的协议（如 ATM）上，而 IP 能够携带不一定要传递给 TCP/UDP 的数据。    
+ 源和目的 IP 地址。
+ 选项。
+ 数据。     

在后面我们会看到，并不是所有链路层协议都能承载相同长度的网络层分组。有的协议能承载大数据包，有点协议只能
承载小分组。例如，以太网帧能承载不超过1500字节的数据，而某些广域网帧可承载不超过576字节的数据。因为每个
IP 数据报封装在链路层帧从一台路由器传输到下一台路由器，故链路层协议的 MTU 严格地限制着 IP 数据报的长度。
对 IP 数据报长度具有严格限制不是主要问题，主要问题是在发送方和目的地路径上的每段链路可能使用不同的链路层协议，且每种协议可能具有
不同的 MTU。     

为坚持网络内核保持简单的原则，IPv4 的设计者决定将数据报的重新组装工作放到端系统中，而不是放到网络路由器中。
但是分片的话，路由器必须得会。    

当一台目的主机从相同源收到一系列数据报时，它需要确定这些数据报中的某些是否是一些原来较大的数据报的片。
如果某些数据报是片的话，则它必须进一步确定何时收到了最后一片，并且如何将这些接收到的片拼接到一起
以形成初始的数据报。为了让目的主机执行这些重组任务，IPv4的设计者将标识、标志和片偏移字段放在 IP 数据报首部
中。当生成一个数据报时，发送主机在为该数据报设置源和目的地址的同时再贴上标识号。发送主机通常为它发送的每个数据报
的标识号加 1。当某路由器需要对一个数据报分片时，形成的每个数据报具有初始数据报的源地址、目的地址和标识号。
由于 IP 是不可靠的服务，有点片可能会丢失。因此为了让目的主机绝对地相信它已经收到了初始数据报的最后一片，最后一片
的标志比特被设为 0，而所有其他片的标志比特被设为1.另外，为了让目的主机确定是否丢了一个片，使用偏移量指定
该片应放在初始 IP 数据报的哪个位置。    

假如一个 4000字节（20字节的 IP 首部和 3980的数据）的数据报经过路由器要放入到一条 MTU 为 1500字节的链路中，
必须要把数据报拆为 3片，注意拆分的时候除了最后一片，其他的所有片的数据量应当是 8字节的倍数，并且偏移值应当
被规定以8字节块为单位，在这里，第一个块 1480字节，偏移量为0，第二个块1480字节，偏移量为185，第三个块
1020字节，偏移量370.    

### 4.4.2 IPv4 编址

这一部分看书吧。     

一个 IP 地址技术上是与一个接口相关联的，而不是与包括该接口的主机或路由器相关联的。    

每个 IP 地址长 32比特，因此总共有 2<sup>32</sup>个可能的地址。这些地址一般按所谓的**点分十进制记法**书写，
即地址中的每个字节用它的十进制形式书写，各字节间以句号隔开。    

在全球因特网中的每台主机和路由器上的每个接口，必须有一个全球唯一的 IP 地址。然而，这些地址不能随意地
自由选择，一个接口的 IP 地址的一部分需要与其连接的子网来决定。   

因特网的地址分配策略被称为**无类别域间路由选择**（Classless Interdomain Router, CIDR）。在 CIDR
被采用之前，IP 地址的网络部分被限制为长度为 8，16 或24比特，这是一种称为**分类编址**的编址方案，这是
因为具有8,16和24比特子网地址的子网分别被称为A、B和 C 类网络。     

当一台主机发出一个目的地址为 255.255.255.255 的数据包时，该报文会交付给同一网络中的所有主机。    

下面是一个设备如何从某组织的地址块中分配到一个地址的。    

+ **1. 获取一块地址**    

从 ISP 处获取，另外还有全球的权威机构负责给 ISP分配地址，即 ICANN。    

+ **2. 获取主机地址：动态主机配置协议**     

某组织一旦获得了一块地址，它就可为本组织内的主机与路由器接口逐个分配 IP 的地址。系统管理员通常手工配置
路由器中的 IP 地址。主机地址也能手动配置，但是这项任务目前通常更多的是使用**动态主机分配协议**（Dynamic Host
Configuration Protocol, DHCP）来完成。DHCP 允许主机自动获取一个 IP 地址。网络管理员能够配置
DHCP，以使某给定主机每次与网络连接时能够得到一个相同的 IP 地址，或者某主机将被分配一个**临时的 IP 地址**，
该地址在每次与网络连接时也许是不同的。除了主机 IP 地址分配外，DHCP 还允许一台主机得知其他信息，例如它的
子网掩码、它的第一跳路由器地址与它本地 DNS 服务器的地址。     

如果在某子网中没有 DHCP 服务器，则需要一个 DHCP 中间代理，这个代理知道用于该网络的 DHCP 服务器的地址。     

对于一台新到达的主机而言，DHCP是一个 4个步骤的过程：    

+ DHCP 服务器发现。一台新到的主机的首要任务是发现一个要与其交互的DHCP 服务器。这可通过使用一个 **DHCP 发现报文**
来完成，客户在 UDP 分组中向端口 67 发送该发现报文。使用广播目的地址 255.255.255.255 并且使用“本主机” 源地址
0.0.0.0。
+ DHCP 服务器提供。DHCP 服务器收到一个 DHCP 发现报文时，用一个 **DHCP 提供报文**向客户作出响应。仍然
使用广播地址 255.255.255.255。因为在子网中可能有几个 DHCP 服务器，该客户也许会发现它处于能在几个提供者之间
进行选择的优越位置。每台服务器提供的报文包含有收到的发现的事务 ID、向客户推荐的 IP 地址、网络掩码以及
IP 地址租用期。
+ DHCP 请求。新到达的客户从一个或多个服务器提供中选择一个，并向选中的服务器提供用一个**DHCP 请求报文**进行响应，
回显配置参数。
+ DHCP ACK。服务器用 **DHCP ACK报文**对请求报文进行响应，证实所要求的参数。     

+ **3. 网络地址转换**     

地址空间 10.0.0.0/8 实在 RFC 中保留的 3 部分 IP 地址空间之一，这些地址用于家庭网络等专用网络或具有专用地址
的**地域**。具有专用地址的地域是指其地址仅对该网络中的设备有意义的网络。      

NAT 路由器上有一张**NAT 转换表**，并且在其表项中包含了端口号及其 IP 地址。    

当生成一个新的源端口号，NAT 路由器可选择任意一个当前未在 NAT 转换表的源端口号。路由器中的 NAT
也在它的 NAT 转换表中增加一表项。     

### 4.4.3 因特网控制报文协议

因特网控制报文协议（ICMP）被主机和路由器用来彼此沟通网络层的信息。ICMP 最典型的用途是差错报告。    

ICMP 通常被认为是 IP 的一部分，但从体系结构上讲它是位于 IP 之上的，因为 ICMP 报文是承载在 IP 分组
中的。    

ICMP 报文有一个类型字段和一个编码字段，并且包含引起该 ICMP 报文首次生成的 IP 数据报的首部和前 8 字节
内容。      


ICMP 类型 | 编码 | 描述
---------|----------|---------
 0 | 0 | 回显回答（对ping的回答）
 3 | 0 | 目的网络不可达
 3 | 1 | 目的主机不可达
 3 | 2 | 目的协议不可达
 3 | 3 | 目的端口不可达
 3 | 6 | 目的网络未知
 3 | 7 | 目的主机未知
 4 | 0 | 源抑制（拥塞控制）
 8 | 0 | 回显请求
 9 | 0 | 路由器通告
 10 | 0 | 路由器发现
 11 | 0 | TTL 过期
 12 | 0 | IP 首部损坏

众所周知的 ping 程序发送一个 ICMP 类型 8 编码 0 的报文到指定主机。看到该回显请求，目的主机发挥一个类型
0 编码 0 的 ICMP 回显回答。      

Traceroute 程序也是用 ICMP 报文实现的。为了判断源和目的地之间所有路由器的名字和地址，源主机中的
Traceroute 向目的主机发送一系列普通的 IP 数据报。这些数据报的每个携带了一个不可达 UDP 端口号的
UDP 报文段。第一个数据报的 TTL 为1，第二个的 TTL 为 2，第三个的 TTL 为 3，依次类推。该源主机也为每个数据报
启动定时器。当第 n 个数据报达到第 n 台路由器时，第 n 台路由器观察到这个数据报的 TTL 正好过期。根据
IP 协议规则，路由器丢弃该数据报并发送一个 ICMP 告警报文给源主机（类型 11 编码 0）。该告警
报文包含了路由器的名字和它的 IP 地址。当该 ICMP 报文返回源主机时，源主机从定时器得到往返时延，从 ICMP 
报文中得到第 n 台路由器的名字与 IP 地址。当源主机收到一个数据报时候，就向目的主机发送一个端口不可达的
ICMP 报文。      

### 4.4.4 IPv6

+ **1. IPv6 数据报格式**     

@TODO 此处该有图。     

其字段如下：    

+ 版本 4bit。IPv6 将该字段设为 6。
+ 流量类型 8bit。该 8 比特字段与我们在 IPv4 中看到的 TOS 字段的含义类似。
+ 流标签 20bit。用于标识一条数据报的流。
+ 有效载荷长度。IPv6 数据报中跟在定长的 40 字节数据报首部后面的字节数量。
+ 下一个首部。该字段标识数据报中的内容（数据字段）需要交付给哪个协议。使用与 IPv4 首部中协议字段相同的
值。
+ 跳限制。转发数据报的每台路由器将对该字段的内容减 1。如果跳限制计数到达 0时，则该数据报将被丢弃。
+ 源地址和目的地址。各128 bit。
+ 数据。      

在 IPv4 中出现的以下字段在 v6 数据报中不再存在：    

+ 分片/重新组装。IPv6 不允许在中间路由器上进行分片与重新组装。这种操作只能在源和目的地上执行。如果路由器
收到的 IPv6 数据报因太大而不能转发到出链路上的话，则路由器只需丢掉该数据报，并向发送方发挥一个“分组太大”的 ICMP
差错报文即可。
+ 首部校验和。因为因特网层中的传输层和数据链路层（如以太网）协议执行了检验操作，IP 设计者大概觉得在
网络层中具有该项功能实属多余，可以将其去除。
+ 选项。选项字段不再是标准 IP 首部的一部分了。但它并没有消失，而是可能出现在 IPv6 首部中由“下一跳首部”
指出的位置上。这就说，就像 TCP 或的 UDP 协议首部能够是 IP 分组中的“下一个首部”，选项字段也能是：下一个首部“。     

RFC 定义了一种用于 IPv6 的新版 ICMP，增加了新的类型和编码。其中包括”分组太大“类型与”未识别的 IPv6 选项“‘错误编码。
另外，ICMPv6 还包含了因特网组管理协议（IGMP），它在 IPv4 中曾是一个与 ICMP 分开的独立协议。     

+ **2. 从 IPv4 到 IPv6 迁移**     

引入 IPv6 使能结点的最直接方式可能是一种**双栈**方法，即使用该方法的IPv6 结点还具有完整的 IPv4 实现。
这样的结点在 RFC 中被称为 IPv6/IPv4 结点，它有发送和接收 IPv4 和 IPv6 两种数据报的能力。IPv6 与 IPv4
结点必须有IPv6 与 IPv4 两种地址。此外，它们还必须能确定另一个结点是否是 IPv6 使能的或仅 IPv4 使能的。
这个问题可使用 DNS 来解决。     

不过这种方法在执行 IPv6 到 IPv4 的转换时，IPv6 数据报中一些 IPv6 特定的字段在 IPv4 数据报中无对应
部分，这些字段的信息将会丢失。     

RFC 还讨论了另一种双栈方法，叫做**建隧道**，该方法能解决上述问题，我们将两台 IPv6 路由器之间
的IPv4 路由器的集合称为一个**隧道**，借助于隧道，在隧道发送端的 IPv6 结点可将整个 IPv6 数据报放到一个
IPv4 数据报的数据部分。     

## 4.5 路由选择算法

主机通常直接与一台路由器连接，该路由器即为该主机的**默认路由器**，又称为该主机的**第一跳路由器**。每当
主机发送一个分组时，该分组被传送给它的默认路由器。我们将源主机的默认路由器称为**源路由器**，把目的主机
的默认路由器称作**目的路由器**。      

对路由选择算法的一种广义分类方式是根据该算法是全局式的还是分散式的来加以区分。     

+ **全局式路由选择算法**用完整的、全局性的网络知识计算出从源到目的地之间的最低费用路由。也就是说，
该算法以所有节点之间的连通性及所有链路的费用为输入。这就要求该算法在真正开始计算之前，要以某种方式获得
这些信息。实践中，具有全局状态信息的算法常被称作**链路状态**（Link State, LS）**算法**，因为该算法必须
知道网络中每条链路的费用。
+ **分散式路由选择算法**以迭代、分布式的方式计算出最低费用路径。没有结点拥有关于所有网络链路费用的
完整信息，而每个结点仅有与其直接相连链路的费用知识即可开始工作。然后，通过迭代计算过程并与相邻结点
交换信息，一个结点逐渐计算出到达某目的结点或一组目的结点的最低费用路径。**距离向量**（Distance-Vector, DV）
**算法**是一种分布式路由选择算法。      

### 4.5.1 链路状态路由选择算法

在链路状态算法中，网络拓扑和所有的链路费用是已知的，实践中这是通过让每个结点向网络中所有其他结点
广播链路状态分组来完成的，其中每个链路状态分组包含它所连接的链路的特征和费用（那么问题来了，一条链路
两端上的两个路由器对这条链路的费用计算是否是相同的）。结点广播的结果是所有结点具有了该网络的等同的、
完整的视图。于是每个结点都能够像其他结点一样，运行 LS 算法并计算出相同的最低费用路径。     

链路状态路由算法有 Dijkstra 和 Prim 两种。Dj 算法计算从某结点到网络中所有其他结点的最低费用路径。
Dj 算法是迭代算法，其性质是经算法的第 k 次迭代后，可知道到 k 个目的结点的最低费用路径。      

### 4.5.2 距离向量路由选择算法

略。看书把。    

### 4.5.3 层次路由选择

在上面 LS 和 DV 算法的研究中，我们把网络看做一个互联路由器的集合，这个模型对实践中的网络来说有两个
问题：    

+ 规模。随着路由器数目变动很大，涉及路由选择信息的计算、存储和通信的开销将高得不可实现。
+ 管理自治。在理想情况下，一个组织应当能够按自己的愿望运行和管理其网络，还要能将其网络与其他外部网络
相连接。     

这两个问题都可以通过将路由器组织进**自治系统**（Autonomous System, AS）来解决，
每个 AS 由一组通常处在相同管理控制下的路由器组成。在相同的 AS 中的路由器都全部运行同样的路由选择算法，
且拥有彼此的信息，在一个自治系统内运行的路由选择算法叫做**自治系统内部路由选择协议**。当然，将 AS 彼此互联
是必需的，因此在一个 AS 内的一台或多台路由器将有另外的任务，即负责向在本 AS 之外的目的地转发分组。
这些路由器被称为**网关路由器**。     

从相邻 AS 获取可达性信息和向该 AS 中的所有路由器传播可达性信息是两项由**自治系统间路由选择协议**处理
的任务。因为自治系统间路由选择协议涉及两个 AS 之间的通信，这两个通信的 AS 必须相同的自治系统间路由选择协议。事实上，
因特网中的所有 AS 中都运行相同的 AS 间路由选择协议，该协议称为 BGP4。每个路由器接收来自一个 AS 内部路由
选择协议和一个 AS 间路由选择协议的信息，并使用来自这两个协议的信息配置它的转发表。     

再假如现在一台路由器想要发送一个分组到一个 AS 外部的网络中，但是现在其转发表中关于到这个网络的网关路由器
有多个，路由器必须选择一个网关路由器来发送分组。在实践中经常使用的一种方法是**热土豆路由选择**，在热土豆
路由选择中，AS 尽可能快地扔掉分组。这通过让路由器向某网关路由器发送分组来完成，同时该网关路由器
在到目的地路径上的所有网关路由器中有最低的路由器到网关的费用。      

## 4.6 因特网中的路由选择

### 4.6.1 因特网中自治系统内部的路由选择：RIP

AS 内部路由选择协议又称为**内部网关协议**。历史上有两个路由选择协议曾被广泛用于因特网上自治系统内的
路由选择：**路由选择信息协议**（Routing Information Protocal, RIP）和**开放最短路优先**（Open Shortest Path First, OSPF）。      

RIP 是一种距离向量协议，使用跳数作为其费用测度，即每条链路的费用为 1 。     

一条路径的最大费用被限制为 15，因此 RIP 的使用限制在网络直径不超过 15 跳的自治系统内。在 RIP 中，路由选择
更新信息在邻居之间通过使用一种 **RIP 响应报文**来交换，大约 30 秒一次。响应报文又被称作是 **RIP 通告**。     

如果一台路由器一旦超过 180 秒没有从邻居听到报文，则该邻居不再认为是可达的；即要么其邻居死机了，要么连接的链路中断了。
当这种情况发生时，RIP 修改本地路由选择表，然后向相邻路由器发送通告来传播该信息。路由器也可通告使用
RIP 请求报文，请求其邻居到指定目的地的费用。路由器在 UDP 上使用端口 520 相互发送 RIP 请求与响应报文。     

### 4.6.2 因特网中自治系统内部的路由选择：OSPF

OSPF 和它的关系密切的表兄弟 IS-IS 通常设置在上层 ISP 中，而 RIP 却被设置在下层 ISP 和企业网中。     

OSPF 的核心是一个使用洪泛链路状态信息的链路状态协议和一个 Dj 最低费用路径算法。各条链路费用是由网络管理员
配置的。     

使用 OSPF，每当一条链路状态发生变化时，路由器就会广播链路状态信息。即使链路状态未变化，它也要周期性地（至少每隔30分钟
一次）广播链路状态。      

一个 OSPF 自治系统可以配置成多个区域。每个区域都运行自己的 OSPF 链路状态路由选择算法，一个区域内的每台路由器
都该向该区域内的所有其他路由器广播其链路状态。在一个区域内，一台或多台**区域边界路由器**负责为流向
该区域以外的分组提供路由选择。最后，在 AS 内只有一个 OSPF 区域配置成**主干**区域。主干区域的主要作用是
为 AS 内其他区域之间的流量提供路由选择。该主干总是包含了 AS 内的所有区域边界路由器。在 AS 内的区域间的路由选择要求
分组首先路由到一个边界路由器，再通过主干路由到位于目的区域的边界路由器，然后再路由到最终目的地。     

### 4.6.3 自治系统间的路由选择：BGP

**边界网关协议**（Broder Gateway Protocol, BGP）版本4是当今因特网中域间路由选择协议事实上的标准，BGP
为每个 AS 提供了进行以下工作的手段：    

+ 从相邻 AS 处获得子网可达性信息
+ 向本 AS 内部的所有路由器传播这些可达性信息
+ 基于可达性信息和 AS 策略，决定到达子网的“好“路由。     

在 BGP 中，路由器对通过使用 179 端口的半永久 TCP 连接来交换路由选择信息。对每条直接连接位于
两个不同的 AS 中的路由器的链路而言，通常有一条这样的 BGP TCP 连接。对于每条 TCP 连接，位于该连接
端点的两台路由器称为**BGP 对等方**，沿着该连接发送所有 BGP 报文的 TCP 连接称为**BGP 会话**。此外，
跨越两个 AS 的BGP 会话称为**外部BGP**(eBGP)会话，在同一个AS 中的两台路由器间的BGP 会话称为**内部BGP**（iBGP）
会话。     

## 4.7 广播和多播路由选择

在**广播路由选择**中，网络层提供了从一种源结点到网络中的所有其他结点交付分组的服务；**多播路由选择**使
单个源结点能够向其他网络结点的一个子集发送分组的副本。     

### 4.7.1 广播路由选择算法

+ **1. 无控制洪泛**    

实现广播的最显而易见的技术是**洪泛**方法，该方法要求源结点向它的所有邻居发送分组的副本。这种方案有两个缺点：
第一个就是如果路由图有圈，则每个广播分组的一个或多个分组副本将无休无止地循环。另一个就是当一个结点与两个
以上其他结点连接时，它将生成并转发广播分组的多个副本，这些副本中的每个又产生多个它们自身的副本。      

+ **2. 受控洪泛**    

避免广播风暴的关键是每个结点明智地选择何时洪泛分组，何时不洪泛分组。在实践中，这能够通过几种方式来实现。     

在**序号控制洪泛**中，源结点将其地址（或其他唯一的标识符）以及**广播序号**放入广播分组中，再向它的所有
邻居发送该分组。每个结点维护它已经收到的、复制的和转发的源地址和每个广播分组的序号列表。当结点收到一个广播
分组时，它首先检查该分组是否在列表中。如果在，丢弃该分组；如果不在，复制该分组并向该结点的所有邻居转发。    

受控洪泛的第二种方法被称为**反向路径转发**（Reverse Path Forwarding, RPF），有时也称为反向路径广播（RPB）。
RPF 的思想是，当一台路由器接收到具有给定源地址的广播分组时，仅当该分组到达的链路正好是位于它自己的返回其源
的最短单播路径上，它才向其所有出链路传输报文；否则，路由器只是丢弃入分组而不向任何它的出链路转发分组。因为路由器知道
它在这样的一条链路上将接收或者已经接收了该分组的一个副本，故这样的一个分组可以被丢弃。     

+ **3. 生成树广播**    

虽然序号控制洪泛和 RPF 避免了广播风暴，但它们不能完全避免冗余广播分组的传输。因此，提供广播的另一种
方法是首先对网络节点构造出一颗生成树。当一个源节点要发送一个广播分组时，它向所有属于该生成树的特定链路发送
分组。接收广播分组的结点则向在生成树中的所有邻居转发该分组。     


### 4.7.2 多播

在多播通信中，我们立即面临两个问题，即怎样标识多播分组的接收方，以及怎样为发送到这些接收方的分组编址。     

多播数据报使用**间接地址**来编址。这就是说，用一个标识来表示一组接收方。在因特网中，这种表示一组接收方的单一标识就是
一个 D 类多播地址。与一个 D 类地址相关联的接收方小组被称为一个**多播组**。    

+ **1. 因特网组管理协议**

IGMP 版本3运行在一台主机与其直接相连的路由器之间。IGMP 为一台主机提供了手段，让它通知与其相连的路由器：
在本主机上运行的一个应用程序想加入一个特定的多播组。由于 IGMP 的交互范围被局限在主机与其相连的路由器之间，显然需要
另一种协议来协调遍及因特网内的多播路由器，以便多播数据报能路由到其最终目的地。后一个功能是由网络层多播
路由选择算法完成的。    
