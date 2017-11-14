# 网络的一些知识

## L2 

### FLAT

L2 数据链路层通过交换机设备进行帧转发。交换机在接收到帧之后(L2 层叫帧，L3 层叫包)先解析出帧头中的 MAC 地址，再在转发表中查找是否有对应 MAC 地址的端口，有的话就从相应端口转发出去。没有，就洪泛（专业术语，即将帧转发到交换机的所有端口），每个端口上的计算机都检查帧头中的 MAC 地址是否与本机网卡的 MAC 地址一致，一致的话就接收数据帧，不一致就直接丢弃。而转发表是通过自学习自动建立的。     

这里引出一个重要概念，混杂模式。默认情况下计算机只接收和本机 MAC 地址一致的数据帧，不一致就丢弃，如果要求计算机接受所有帧的话，就要设置网卡为混杂模式（ifconfig eth0 0.0.0.0 promisc up)。所以在虚拟网桥中，如果希望虚机和外部通讯，必须打开桥接到虚拟网桥中物理网卡的混杂模式特性。    

### VLAN

FLAT 中的洪泛，经常会在一个局域网内产生大量的广播，这也就是所谓的“广播风暴”。为了隔离广播风暴，引入了 VLAN 的概念。即为交换机的每一个端口设置一个 1-4094 的数字，交换机根据 MAC 地址进行转发的同时也要结合 VLAN 号这个数字，不同的话也要丢弃。这样就实现了 L2 层数据帧的物理隔离，避免了广播风暴。    

在 Neutron 中，我们知道，截止到笔者写这篇文章之时已经实现了 FLAT、VLAN、GRE、VXLAN 四种网络拓扑。那么如何区分 FLAT 和 VLAN 呢？很简单，结合 VLAN 号和 MAC 地址进行转发的是 VLAN 模式，只根据 MAC 地址进行转发的是 FLAT 模式。    

## L3

###  GRE

VLAN 技术能有效隔离广播域，但同时有很多缺点：   

+ 要求穿越的所有物理交换机都配置允许带有某个 VLAN 号的数据帧通过，因为物理交换机通常只提供 CLI 命令，不提供远程接口可编程调用，所以都需要手工配置它，容易出错且工作量巨大，纯粹的体力劳动，影响了大规模部署。
+ VLAN 号只能是 1－4094 中的一个数字，对于小规模的私有云可能不是个问题，但对于租户众多的公有云，可选择的 VLAN 号的范围是不是少了点呢？    

为了克服上面的缺点，Neutron 开发了对 GRE 模式的支持。GRE 是 L3 层的遂道技术，本质是在遂道的两端的 L4 层建立 UDP 连接传输重新包装的 L3 层包头，在目的地再取出包装后的包头进行解析。因为直接在遂道两端建立 UDP 连接，所以不需要在遂道两端路径的物理交换机上配置 TRUNK 的操作。    

### 利用 L3 层扩展 L2 层的遂道技术 VXLAN 与 SDN 的本质

VXLAN 是 VMware 的技术，可以克服 VLAN 号不足的问题；同时也可以克服 GRE 实质上作为点对点遂道扩展性太差的问题。    

如果说 GRE 的本质是将 L3 层的数据包头重新定义后再通过 L4 层的 UDP 进行传输，那么 VXLAN 的本质就是对 L2 层的数据帧头重新定义再通过 L4 层的 UDP 进行传输。也就是笔者说的所谓的利用 L3 层扩展 L2 层.    

+ VXLAN 是一种 L2 层帧头的重新封装的数据格式。
+ VXLAN 仍然使用 GRE 遂道通过 UDP 传输重新封装帧头后的数据帧。

# Neutron

## 网络基础

### 以太网

以太网工作在第二层数据链路层，或者也可以说局域网，第二层，L2，链路层。在以太网中，主机之间通过交换帧来进行网络通信。以太网中的每个主机都有一个唯一的标识符叫做 MAC 地址。在 OpenStack 环境中的每个虚拟机实例也都有一个唯一的 MAC 地址，这个地址应该是与宿主机不同的。MAC 地址是48位的，通常用16机制数表示。     

以太网是支持广播的，一个主机可以发送一个帧给一个特殊的MAC 地址 `ff:ff:ff:ff:ff:ff:ff:ff` 就可以将帧发送给网络中的每个主机。ARP和DHCP 就是两个值得注意的使用广播的协议。     

通过一块网卡收到一个以太帧的时候，默认情况下会检查目的MAC地址与网卡地址是否匹配，不匹配就直接丢弃这个帧。不过在宿主机上，这种默认行为是不提倡的，因为这个帧可能是发送给一个实例的。可以将网卡配置成混乱模式，这时网卡会将所有的帧传递给操作系统，即便MAC地址不匹配。   

现在的以太网都使用交换机来连接网络中的主机。当主机第一次通过交换机发送帧的时候，交换机并不知道这个MAC地址应该发送到哪个端口（这个MAC地址应该是目的地址），此时如果这个帧是发送给一个不识别的地址，交换机就会使用广播将帧发送给所有端口。交换机会学习哪个MAC 地址在哪个端口上。一旦它知道了地址到端口的映射后，就可以直接发送给特定端口而不是广播了。这种映射关系在交换机中称作转发表。   

### VLANs

VLAN 是一种可以让一个交换机表现的像多个独立的交换机的网络技术。特别地，两个相邻到同一交换机但不同 VLANs 中的两个主机是无法看到另一个主机的（这里应该指的是无法通过交换机直接进行网络交流）。OpenStack 可以利用 VLANs 的优点来孤立不同项目的网络交流，即便项目都有实例运行在一个宿主机上。每个VLAN都有一个数字ID，在1~4095之间。   

举个传统的例子来理解VLAN，例如我们现在只有一台交换机，但是想要3个独立的网络。网络管理员会选择3个VLAN ID，10,11,12。并且将交换机的端口与相关的 VLAN ID 关联起来。    
### 子网和 ARP

ARP(Address Resolution Protocol)弥补了以太网MAC地址与TCP/IP的IP地址之间的鸿沟。     

IP 地址是被分为2个部分：网络号码和主机标识符。两个主机如果有同样的网络号则是在同一子网中。之前提到过只有两台主机在同一局域网中时两者才可以通过以太网之间交流。ARP 假设所有在同一子网中的机器都在同一局域网中。    

如果想要计算IP地址的网络部分，必须知道地址的掩码。掩码表明IP地址中有多少位是网络部分。    

有两种表示掩码的语法：   

+ dotted quad
+ classless inter-domain routing (CIDR)     

假设一个地址 192.0.2.5，掩码为24位，如果用第一种，掩码就是 255.255.255.0。CIDR的方法包括了IP地址和掩码，这个例子就是 192.0.2.5/24。     

为了理解 ARP 是如何将IP地址转换为MAC地址，看下面的例子。假设主机A地址为 192.0.2.5/24，MAC地址为 `fc:99:47:49:d4:a0`。想要发送一个分组给主机B，地址为
192.0.2.7.     

首先在第一次A尝试和B通信的时候，目的地MAC地址是不知道的。主机A会给局域网中发送一个ARP请求。请求是类似这样的一条广播消息：    

_To: everybody (`ff:ff:ff:ff:ff:ff`). I am looking for the computer who has IP address `192.0.2.7`. Signed: MAC address `fc:99:47:49:d4:a0`._    

主机B会这样回应：_To: `fc:99:47:49:d4:a0`. I have IP address `192.0.2.7`. Signed: MAC address `54:78:1a:86:00:a5`._。     

### DHCP

DHCP(Dynamic Host Configuration Protocol)。DHCP客户端会从端口68发送一个UDP分组到 `255.255.255.255` 的67端口。`255.255.255.255` 是一个局域网广播地址。局域网中所有的主机都可以看到这个UDP分组发送到了这个地址。然而，这样的包是不会发送给其他网络的。因此，DHCP服务器必须与客户端在同一网络中。DHCP服务器呢会从端口67发送一个UDP分组给客户端的68口。像下面这样：    

1. 客户端发送一个广播 _I’m a client at MAC address `08:00:27:b9:88:74`, I need an IP address_
2. 服务器发送一个响应 _OK `08:00:27:b9:88:74`, I’m offering IP address `192.0.2.112`_
3. 客户端发送请求 _Server 192.0.2.131, I would like to have IP 192.0.2.112_   
4. 服务器确认 _OK `08:00:27:b9:88:74`, IP `192.0.2.112` is yours_     

### IP

IP 协议指明了两个不同局域网间的主机如何路由分组。IP 依赖特定的网络主机：路由器和网关。一个路由器是至少连接了两个局域网的主机，它可以转发IP分组从一个网络到另一个网络。路由器通常有多个IP地址。