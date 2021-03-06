# CDN 详解

<!-- TOC -->

- [CDN 详解](#cdn-详解)
- [第 1 章 引言](#第-1-章-引言)
  - [1.2 CDN 的基本工作过程](#12-cdn-的基本工作过程)
- [第 2 章 CDN 技术概述](#第-2-章-cdn-技术概述)
  - [2.1 CDN 的系统架构](#21-cdn-的系统架构)
  - [2.2 CDN 系统分类](#22-cdn-系统分类)
    - [2.2.1 基于不同内容承载类型的分类](#221-基于不同内容承载类型的分类)
- [第 3 章 内容缓存工作原理及实现](#第-3-章-内容缓存工作原理及实现)
  - [3.2 Cache设备的工作方式和设计要求](#32-cache设备的工作方式和设计要求)
    - [3.2.1 正向代理](#321-正向代理)
    - [3.2.2 反向代理](#322-反向代理)
    - [3.2.3 透明代理](#323-透明代理)
- [第 4 章 集群服务于负载均衡技术](#第-4-章-集群服务于负载均衡技术)
  - [4.1 服务器集群技术](#41-服务器集群技术)
    - [4.1.1 集群的基本概念](#411-集群的基本概念)
    - [4.1.3 集群的系统结构](#413-集群的系统结构)
    - [4.1.4 CDN 负载均衡集群](#414-cdn-负载均衡集群)
  - [4.2 Cache 集群协同交互方法](#42-cache-集群协同交互方法)
    - [4.2.1 ICP](#421-icp)
    - [4.2.2 HTCP](#422-htcp)
  - [4.3 负载均衡技术的实现](#43-负载均衡技术的实现)
- [第 5 章 全局负载均衡工作原理及实现](#第-5-章-全局负载均衡工作原理及实现)
  - [5.1 全局负载均衡在 CDN 系统中的作用](#51-全局负载均衡在-cdn-系统中的作用)
  - [5.2 基于 DNS 解析的 GSLB 实现机制](#52-基于-dns-解析的-gslb-实现机制)
    - [5.2.3 基于 DNS 解析的 GSLB 的工作方式](#523-基于-dns-解析的-gslb-的工作方式)

<!-- /TOC -->

# 第 1 章 引言

## 1.2 CDN 的基本工作过程

最简单的 CDN 网络有一个 DNS 服务器和几台缓存服务器就可以运行了。一个典型的 CDN 用户访问
调度流程如图所示。    

![cdn](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/cdn.png)    

1. 当用户点击网站页面上的内容 URL，经过本地 DNS 系统解析，DNS系统会最终将域名的解析权交给
CNAME 指向的 CDN 专用 DNS 服务器。
2. CDN 的 DNS 服务器将 CDN 的全局负载均衡设备 IP 地址返回用户。
3. 用户向CDN的全局负载均衡设备发起内容URL访问请求。
4. CDN 全局负载均衡设备根据用户 IP 地址，以及用户请求的内容 URL，选择一台用户所属区域的
区域负载均衡设备，告诉用户向这台设备发起请求。
5. 区域负载均衡设备会为用户选择一台合适的缓存服务器提供服务，选择的依据包括：根据用户IP
地址，判断哪一台服务器距用户最近；根据用户所请求的URL中携带的内容名称，判断哪一台服务器上
有用户所需内容；查询各个服务器当前的负载情况，判断哪一台服务器尚有服务能力。基于以上这些
条件的综合分析之后，区域负载均衡设备会向全局负载均衡设备返回一台缓存服务器的IP地址。
6. 全局负载均衡设备把服务器的 IP 地址返回给用户。（怎么会出现一个 IP 地址，什么鬼）
7. 用户向缓存服务器发起请求，缓存服务器响应用户请求，将用户所需内容传送到用户终端。如果
这台缓存服务器上并没有用户想要的内容，而区域均衡设备依然将它分配给了用户，那么这台服务器就
要向它的上一级缓存服务器请求内容，直至追溯到网站的源服务器将内容拉到本地。   

# 第 2 章 CDN 技术概述

CDN公司在整个互联网上部署数以百计的CDN服务器（Cache），这些服务器通常在运营商的 IDC 中，
尽量靠近接入网络和用户。CDN在Cache中复制内容，当内容的提供者更新内容时，CDN 向 Cache
重新分发这些被刷新的内容。CDN 提供一种机制，当用户请求内容时，该内容能够由以最快速度交付
的 Cache 来向用户提供，这个挑选“最优”的过程就叫做负载均衡。被选中的最优 Cache 可能最靠近
用户，或者有一条与用户之间条件最好的路径。    

## 2.1 CDN 的系统架构

典型的 CDN 系统架构由分发服务系统、负载均衡系统和运营管理系统三大部分组成。    

一般来说，根据承载内容类型和服务种类的不同，分发服务系统会分为多个子服务系统，如网页加速
子系统、流媒体加速子系统、应用加速子系统等。每个子服务系统都是一个分布式服务集群，由一群
功能近似的、在地理位置上分布部署的 Cache 或 Cache 集群组成，彼此间相互独立。    

对于分发服务系统，在承担内容的更新、同步和响应用户需求的同时，还需要向上层的调度控制系统
提供每个 Cache 设备的健康状况信息、响应情况，有时还需要提供内容分布信息，以便调度控制系统
根据设定的策略决定由哪个Cache（组）来响应用户的请求最优。    

负载均衡系统 是一个 CDN 系统的神经中枢，主要功能是负责对所有发起服务请求的用户进行访问
调度，确定提供给用户的最终实际访问地址。大多数 CDN 系统的负载均衡系统是分级实现的，这里以
最基本的两级调度体系进行简要说明。一般而言，两级调度体系分为全局负载均衡（GSLB）和本地
负载均衡（SLB）。其中，全局负载均衡（GSLB）主要根据用户就近性原则，通过对每个服务节点进
行“最优”判断，确定向用户提供服务的Cache的物理位置。最通用的GSLB实现方法是基于 DNS 解析
的方式实现，也有一些系统采用了应用层重定向等方式来解决。本地负载均衡（SLB）主要负责节点
内部的设备负载均衡，当用户请求从 GSLB 调度到 SLB 时，SLB 会根据节点内各 Cache 设备的
实际能力或内容分布等因素对用户进行重定向，常用的本地负载均衡方法有基于4层调度、基于7层
调度、链路负载调度等。    

负责为用户提供内容服务的 Cache 设备应部署在物理上的网络边缘位置，我们称这一层为 CDN 边缘层。
CDN 系统中负责全局性管理和控制的设备组成中心层，中心层同时保存着最多的内容副本，当边缘层
设备未命中时，会向中心层请求，如果在中心层仍未命中，则需要中心层向源站回源。    

节点是 CDN 系统中最基本的部署单元，一个 CDN 系统由大量的、地理位置上分散的 POP 节点组成，
为用户提供就近的内容访问服务。CDN 节点网络主要包含 CDN 骨干点和 POP 点。CDN 骨干点和
CDN POP 点在功能上不同，中心和区域节点一般称为骨干点，主要作为内容分发和边缘未命中时的
服务点；边缘节点又被称为 POP（point-of-presence）节点，CDN POP 点主要作为直接向用户提供
服务的节点。但是，从节点构成上来说，无论是CDN骨干点还是 CDN POP 点，都由 Cache 设备和
本地负载均衡设备构成。     

## 2.2 CDN 系统分类

可以从两个角度来对 CDN 基本服务进行分类，一是基于不同内容承载类型视角，二是基于不同内容
生成机制视角。    

### 2.2.1 基于不同内容承载类型的分类

从 CDN 承载的内容类型来看，主要有静态网页内容、动态网页内容、流媒体、下载型文件和应用协议，
因而我们将 CDN 服务分为网页加速、流媒体加速、文件传输加速和应用协议加速。    

1. **网页加速**    

CDN 服务商通过将网页内容缓存到各个 CDN 节点上，并将用户请求调度到最优节点上来获得所需的
内容，从而加速页面响应速度，减轻源站点的访问负担。    

2. **流媒体加速**   

流媒体加速的实现是通过将流媒体内容推送到离用户最近的 POP 点，使得用户能够从网络边缘获取
内容，从而提高视频传输质量，缩短访问时间，节省骨干网络流量，避免单一中心的服务器瓶颈问题。
流媒体加速服务又可以分为两类：流媒体直播加速和流媒体点播加速。    

3. **文件传输加速**    

使用 CDN的分布式 POP 点提供下载服务，网站可以将大量文件下载的性能压力和带宽压力交给 CDN
来分担，提高用户的下载速度。    

4. **应用协议加速**    

应用协议加速并不针对特定的内容类型进行加速，而是通过对 TCP/IP 等传输协议的优化，改善和
加快用户在广域网上的内容传输速度，或者对一些特定协议，如 SSL 协议进行加速，解决安全传输时的
性能和响应速度问题。主要的应用协议加速服务有如下几种：   

+ 广域网应用加速。针对那些在局域网上可以正常运行，但一到广域网就受到极大影响的应用
和协议，比如CIFS协议、NFS协议。
+ SSL应用加速。CDN 提供 SSL 应用加速后，由 CDN 的专用 SSL 加速硬件来完成加密解密运算
工作，通过认证之后方可建立起数据传输通道。用户的源站点只需信任有限的 CDN cache，而无须
面对海量用户，从而减轻了繁重的运算和认证压力。
+ 网页压缩。     

# 第 3 章 内容缓存工作原理及实现

## 3.2 Cache设备的工作方式和设计要求

Web Cache作为一种网页缓存技术，可以在用户访问网站服务器的任何一个中间网元上实现。根据
HTTP 协议的定义，在一次网页访问中，用户从客户端发出请求到网站服务器响应请求内容的交互过程
中，通常会涉及4个关键的网元：用户、代理、网关和Web服务器。其中，在用户端实现缓存技术在
HTTP 协议中有明确的规定，比如用户浏览器可以缓存已经访问过的网页，用户再次访问时可以直接访问
这个网页副本。根据不同的应用场景和用户需求，Web Cache 通常作为代理或网关部署在用户的访问
路径上，部署的位置不同、工作模式不同，对 Web Cache 有不同的要求。当 Web Cache 作为代理
使用时，通常工作在正向代理或者透明代理的模式，Web Cache 可以在这两种模式下实现访问内容
副本的缓存和服务；Web Cache 应用最多的地方还是在网关上，这也是 CDN 的典型应用场景，网关
通常工作在反向代理模式。    

### 3.2.1 正向代理

![forward-proxy](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/forward-proxy.png)    
用户在上网时其主机对外网服务器的数据传输首先要传输给正向代理服务器，代理服务器检查代理
缓存中是否保存了用户请求数据，如果有则直接返回给用户，如果没有缓存请求内容，则正向代理
服务器负责发送用户主机请求数据到外网目标服务器，同时接收并缓存外网服务器响应数据，同
时将响应数据反馈给用户主机。在执行正向代理功能时也可以完成安全认证和访问控制功能，比如
可以设置某些特定用户在工作时间访问外网站点，或者禁止访问某些外部站点等。

### 3.2.2 反向代理

在反向代理（Backward Proxy）方式中，用户不需要配置代理服务器地址，Cache 设备的地址作为
被访问域的服务地址写入 DNS 记录，并利用 Cache 设备的内容路由／交换能力完成代理访问。    

反向代理多用于大型 ISP/ICP 和运营商环境，对于运营商和ISP，反向代理可以实施透明的内容缓存，
增加用户访问内容的速度和提高客户满意度。反向代理的优势在于对于用户来说，不会感觉到任何
Cache设备的存在。    

### 3.2.3 透明代理

透明代理（Transparent Proxy）方式下，用户的浏览器不需要配置代理服务器地址，但是用户的
路由设备需要支持WCCP协议（Web Cache Control Protocol）。路由器配置了WCCP功能后，会把指定的
用户流量转发给Cache，由Cache对用户提供服务。    

透明代理可以看做是通过网络设备或协议实现的正向代理工作模式，因而具备很多与正向代理相同的
特点，多用于企业网环境和运营商环境。Cache设备作为企业网的Internet网关出口提供代理服务、内
容缓存、Internet访问控制、安全认证等功能。    

![transparent-proxy](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/transparent-proxy.png)   

用户访问目标服务器时不需要配置任何代理服务，直接将服务请求的目标地址设置为应用服务器 IP
地址，用户主机请求数据在发往目标主机前被透明代理截获，透明代理检查代理缓存中是否保存了
用户请求数据，如果有则直接返回给用户，如果没有缓存请求内容，透明代理服务器则将用户主机请求
数据发送到目标服务器，同时监听外网服务器响应用户请求数据，用户主机保持相关数据在缓存中以便
后期服务网内相同的访问请求。由于透明代理可以截获用户访问数据，在提供缓存功能的同时也可以
完成与正向代理相同的安全认证和访问控制功能。    

# 第 4 章 集群服务于负载均衡技术

## 4.1 服务器集群技术

### 4.1.1 集群的基本概念

服务器集群是指将很多彼此相互独立的服务器通过高速网络连接在一起，形成一个并行或分布式系统。
这些服务器运行一系列共同的程序，向外提供单一的系统映射，提供一个服务。从外部来看，整个
集群就像是一台具有统一输入、输出的服务器一样。    

### 4.1.3 集群的系统结构

![cluster](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/cluster.png)   

1. 网络层：网络是构成集群的基础，因为构成集群的多台服务器是通过网络互联的。
2. 节点服务器操作系统层：集群中的各台服务器是集群计算能力的基本单元，它们具有一定的自治
能力，能够独立完成集群分配到本地的任务。
3. 应用层：应用层由执行负载任务的软件构成，可在集群管理层的干预下实现相应应用功能。其
关键技术包括并行程序开发环境、各类解决任务负载的串／并行应用等。
4. 集群管理系统层：集群管理系统层是服务器集群的核心组件，是协调集群资源使之能够高效协同
完成任务的关键。它的主要任务是对集群内的服务器资源及其上运行的任务进行管理和调度，以实
现集群内负载的均衡，从而避免个别节点成为瓶颈，最大程度地发挥集群的整体性能。    

### 4.1.4 CDN 负载均衡集群

CDN的缓存服务器是典型的负载均衡集群系统。    

## 4.2 Cache 集群协同交互方法

Cache 服务器集群内部协同交互的主要目标是在各个服务器节点间建立良好的通信通道，以及时沟通
服务器上的内容缓存情况。    

Cache 服务器集群之间的通信可以分为松散耦合和紧密耦合两大类。其中基于网络消息的松散耦合的
Cache 通信协议包括：ICP、HTCP、Cache Digest、Cache Pre-filling等，采用特定数据结构管理的
紧密耦合的Cache通信协议以CARP为代表。    

### 4.2.1 ICP

ICP（Internet Cache Protocol）定义了一种轻量级的消息格式，被用于在 Cache 服务器之间
互相查询 Web 资源信息，以确定当前被请求的资源是否存在于其他服务器上。当一台Cache服务器向
其邻居发出Web对象（主要是URL信息）查询请求时，接收到查询请求的服务器通过反馈包含了“命中
（hit）”或者“失效（miss）”信息的ICP应答说明被查询的对象是否保存在自己这里。    

ICP普遍是基于UDP协议实现的。    

### 4.2.2 HTCP

HTCP（Hypertext Caching Protocol）是用于发现HTTP高速缓存（Cache）服务器和缓存数据的协议。    

HTCP 的运行机制与 ICP 类似，都是通过向邻居服务器发出查询请求并获得应答来反映 Web 对象在
集群中的缓存情况。但是，与ICPv2只能包含 Web 对象的 URI 不同，HTCP 请求和应答中可以包含有完
整的HTTP头文件的信息，这使得当后续的 HTTP 请求需要访问同样的资源时，HTCP能够做出更精确
的应答。另外，HTCP采用了可变长度的消息格式，并扩展了Cache管理功能，例如能够监控远程Cache的
增删、请求立即删除、发送Web对象提示。    

剩下的都先略了。   

## 4.3 负载均衡技术的实现

根据负载均衡实施目的的不同，可以把负载均衡分为两种。一种是任务分担，大量的并发访问或数据
流量分担到多台设备上分别处理，每台设备都完成一个相对完整的请求响应过程；另一种是协同计
算，把一个重负载的计算任务分担到多台设备上做并行处理，各台设备处理结束后，将结果进行汇总计算。    

# 第 5 章 全局负载均衡工作原理及实现

## 5.1 全局负载均衡在 CDN 系统中的作用

全局负载均衡（GSLB）这一层次的负载均衡主要是在多个节点之间进行均衡，其结果可能直接终结
负载均衡过程，也可能将用户访问交付下一层次的（区域或者本地）负载均衡系统进行处理。    

GSLB在全网进行负载均衡的目标，是保持各节点、各设备负载保持在一个有利于提供优质服务的水平。
为了实现这个目的，GSLB会依靠一些灵活的均衡策略来进行负载判断，而这些策略的实现有赖于GSLB
对全局信息的收集和分析能力。在区域或本地负载均衡系统中，每个服务节点都只掌握本节点内服务
设备的信息，而在GSLB系统中，需要掌握所有节点中设备的信息。也就是说，所有节点设备的信息情况
在GSLB产生了一次汇总，也可以通过GSLB了解其他节点设备的情况。    

## 5.2 基于 DNS 解析的 GSLB 实现机制

基于 DNS 解析的 GSLB 系统，利用了 DNS 系统固有的域名解析、就近性判断、轮询算法等，可以
很大程度借助独立于 CDN 系统之外的公共 DNS 系统来完成负载均衡，降低了对 CDN 系统本身的压力，
所以是目前CDN服务商采用比较多的GSLB方案。    

### 5.2.3 基于 DNS 解析的 GSLB 的工作方式

基于 DNS 解析的 GSLB 方案实际上就是把负载均衡设备部署在 DNS 系统中。在用户发出任何应用
连接请求时，首先必须通过 DNS 系统来请求获得服务器的 IP 地址，基于 DNS 的 GSLB 正是在返回
DNS 解析结果的过程中进行智能决策，给用户返回一个最佳的服务器的 IP 地址。从用户的视角看，
整个应用流程与没有 GSLB 参与时没有发生任何变化。    

基于DNS解析来实现GSLB有几种方法:   

1. **通过 CNAME 方式实现负载均衡**    

CNAME 记录是描述一个域名或主机名的别名，域名服务器获得 CNAME 记录后，就会用记录中的别名
来替换查找的域名或主机名。后面会查询这个别名的 A 记录来获得相应的IP地址。    

通过 CNAME 方式来实现负载均衡，实际上是利用了 DNS 的两个机制：一是别名机制，二是轮询机制。
具体操作简单地说就是：先将 GSLB 的主机名定义为所查询域名的权威 DNS 服务器的别名，然后将
GSLB主机名添加多条A记录，分别对应多个服务器的IP地址。这样，本地DNS服务器会向客户端返回
多个IP地址作为域名的查询结果，并且这些IP地址的排列顺序是轮换的。客户端一般会选择首个IP
地址进行访问。    

因为实现简单，并且不需要更改公共DNS系统的配置，所以通过 CNAME 方式实现负载均衡是目前业界
使用最多的方式。    

那所以这里 GSLB 扮演的是权威 DNS 服务器的角色？那这里返回的多个 IP 地址是 GSLB 服务器的
地址啊。   

2. **负载均衡器作为权威 DNS 服务器**    

这种方式是把负载均衡器作为一个域名空间的权威 DNS 服务器，这样负载均衡器就会接收所有对这个
域的DNS请求，从而能够根据预先设置的一些策略来提供对域名的智能DNS解析。    
