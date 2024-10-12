# 第 1 章 JVM

<!-- TOC -->
* [第 1 章 JVM](#第-1-章-jvm)
  * [1.1 JVM 的运行机制](#11-jvm-的运行机制)
  * [1.2 多线程](#12-多线程)
  * [1.3 JVM 的内存区域](#13-jvm-的内存区域)
    * [1.3.4 堆](#134-堆)
    * [1.3.5 方法区：现成共享](#135-方法区现成共享)
  * [1.4 JVM 的运行时内存](#14-jvm-的运行时内存)
    * [1.4.1 新生代：Eden 区、ServivorTo 区和 ServivorFrom 区](#141-新生代eden-区servivorto-区和-servivorfrom-区)
    * [1.4.2 老年代](#142-老年代)
    * [1.4.3 永久代](#143-永久代)
  * [1.5 垃圾回收算法](#15-垃圾回收算法)
    * [1.5.1 如何确定垃圾](#151-如何确定垃圾)
    * [1.5.2 Java 中常用的垃圾回收算法](#152-java-中常用的垃圾回收算法)
  * [1.6 Java 中的4种引用类型](#16-java-中的4种引用类型)
  * [1.8 垃圾收集器](#18-垃圾收集器)
    * [1.8.1 G1 垃圾收集器](#181-g1-垃圾收集器)
  * [1.9 Java网络编程模型](#19-java网络编程模型)
    * [1.9.3 多路复用I/O模型](#193-多路复用io模型)
    * [1.9.7 Java NIO](#197-java-nio)
  * [1.10 JVM 的类加载机制](#110-jvm-的类加载机制)
* [第 2 章 Java 基础](#第-2-章-java-基础)
  * [2.1 集合](#21-集合)
    * [2.1.1 List](#211-list)
    * [2.1.2 Queue](#212-queue)
    * [2.1.3 Set](#213-set)
    * [2.1.4 Map](#214-map)
  * [2.3 反射机制](#23-反射机制)
    * [2.3.5 反射的步骤](#235-反射的步骤)
    * [2.3.6 创建对象的两种方式](#236-创建对象的两种方式)
    * [2.3.7 Method 的 invoke 方法](#237-method-的-invoke-方法)
  * [2.4 注解](#24-注解)
    * [2.4.2 元注解](#242-元注解)
    * [2.4.3 注解处理器](#243-注解处理器)
  * [2.5 内部类](#25-内部类)
    * [2.5.1 静态内部类](#251-静态内部类)
    * [2.5.2 成员内部类](#252-成员内部类)
    * [2.5.3 局部内部类](#253-局部内部类)
    * [2.5.4 匿名内部类](#254-匿名内部类)
  * [2.7 序列化](#27-序列化)
* [第 3 章 Java 并发编程](#第-3-章-java-并发编程)
  * [3.1 线程的创建方式](#31-线程的创建方式)
    * [3.1.3 通过ExecutorService和`Callable<Class>`实现有返回值的线程](#313-通过executorservice和callableclass实现有返回值的线程)
    * [3.1.4 基于线程池](#314-基于线程池)
  * [3.2 线程池的工作原理](#32-线程池的工作原理)
    * [3.2.2 线程池的核心组件和核心类](#322-线程池的核心组件和核心类)
    * [3.2.3 线程池的工作流程](#323-线程池的工作流程)
  * [3.3 5种常用的线程池](#33-5种常用的线程池)
  * [3.4 线程的生命周期](#34-线程的生命周期)
  * [3.5 线程的基本方法](#35-线程的基本方法)
  * [3.6 Java 中的锁](#36-java-中的锁)
* [第7章 数据库](#第7章-数据库)
  * [7.3 数据库分布式事务](#73-数据库分布式事务)
    * [7.3.1 CAP](#731-cap)
<!-- TOC -->

## 1.1 JVM 的运行机制

JVM（Java Virtual Machine）是用于运行 Java 字节码的虚拟机，
包括一套字节码指令集、一组程序寄存器、一个虚拟机栈、一个虚拟
机堆、一个方法区和一个垃圾回收器。JVM 运行在操作系统之上，不与
硬件设备直接交互。

Java 源文件在通过编译器之后被编译成相应的.Class 文件（字节
码文件），.Class 文件又被 JVM 中的解释器编译成机器码在不同的操作
系统（Windows、Linux、Mac）上运行。每种操作系统的解释器都是不
同的，但基于解释器实现的虚拟机是相同的，这也是 Java 能够跨平台
的原因。在一个 Java 进程开始运行后，虚拟机就开始实例化了，有多
个进程启动就会实例化多个虚拟机实例。进程退出或者关闭，则虚拟
机实例消亡，在多个虚拟机实例之间不能共享数据。

Java 程序的具体运行过程如下。

1. Java 源文件被编译器编译成字节码文件。
2. JVM 将字节码文件编译成相应操作系统的机器码。
3. 机器码调用相应操作系统的本地方法库执行相应的方法。

Java 虚 拟 机 包 括 一 个 类 加 载 器 子 系 统 （ Class Loader
SubSystem）、运行时数据区（Runtime Data Area）、执行引擎和本
地接口库（Native Interface Library）。本地接口库通过调用本地
方法库（Native Method Library）与操作系统交互

![jvm1](https://cdn.nlark.com/yuque/0/2024/png/45828409/1719316072272-6d12b77b-cc3d-4d99-8755-a912d95dfe83.png?x-oss-process=image%2Fformat%2Cwebp%2Fresize%2Cw_1244%2Climit_0)

## 1.2 多线程

在 JVM 后台运行的线程主要有以下几个。

- 虚拟机线程（JVMThread）：虚拟机线程在 JVM 到达安全点（SafePoint）时出现。
- 周期性任务线程：通过定时器调度线程来实现周期性操作的执行。
- GC 线程：GC 线程支持 JVM 中不同的垃圾回收活动。
- 编译器线程：编译器线程在运行时将字节码动态编译成本地平台机器码，是 JVM 跨平台的具体实现。
- 信号分发线程：接收发送到 JVM 的信号并调用 JVM 方法。

## 1.3 JVM 的内存区域

JVM 的内存区域分为线程私有区域（程序计数器、虚拟机栈、本地方法区）、线程共享区域（堆、方法区）和直接内存

![MEM](https://cdn.nlark.com/yuque/0/2024/png/45828409/1719491112676-e80661be-a5f6-46f1-a4e1-c524f4e98c36.png?x-oss-process=image%2Fformat%2Cwebp%2Fresize%2Cw_750%2Climit_0)

线程私有区域的生命周期与线程相同，随线程的启动而创建，随
线程的结束而销毁。在 JVM 内，每个线程都与操作系统的本地线程直接
映射，因此这部分内存区域的存在与否和本地线程的启动和销毁对应。

线程共享区域随虚拟机的启动而创建，随虚拟机的关闭而销毁。

直接内存也叫作堆外内存，它并不是 JVM 运行时数据区的一部分，
但在并发编程中被频繁使用。JDK 的 NIO 模块提供的基于 Channel 与
Buffer 的 I/O 操作方式就是基于堆外内存实现的，NIO 模块通过调用
Native 函 数 库 直 接 在 操 作 系 统 上 分 配 堆 外 内 存 ， 然 后 使 用
DirectByteBuffer 对象作为这块内存的引用对内存进行操作，Java 进
程可以通过堆外内存技术避免在 Java 堆和 Native 堆中来回复制数据带
来的资源占用和性能消耗，因此堆外内存在高并发应用场景下被广泛使用

### 1.3.4 堆

在JVM运行过程中创建的对象和产生的数据都被存储在堆中，堆是
被线程共享的内存区域，也是垃圾收集器进行垃圾回收的最主要的内
存区域。由于现代JVM采用分代收集算法，因此Java堆从GC（Garbage
Collection，垃圾回收）的角度还可以细分为：新生代、老年代和永
久代。

### 1.3.5 方法区：现成共享

方法区也被称为永久代，用于存储常量、静态变量、类信息、即时编译器编译后的机器码、运行时常量池等数据。

![method](https://cdn.nlark.com/yuque/0/2024/png/45828409/1719491461009-b821507f-b806-43d5-ab60-1b68a25706d5.png?x-oss-process=image%2Fformat%2Cwebp%2Fresize%2Cw_750%2Climit_0)

JVM 把 GC 分代收集扩展至方法区，即使用 Java 堆的永久代来实现方
法区，这样 JVM 的垃圾收集器就可以像管理 Java 堆一样管理这部分内
存。永久代的内存回收主要针对常量池的回收和类的卸载，因此可回收的对象很少。

常量被存储在运行时常量池（Runtime Constant Pool）中，是方
法区的一部分。静态变量也属于方法区的一部分。在类信息（Class 文
件）中不但保存了类的版本、字段、方法、接口等描述信息，还保存了常量信息。

## 1.4 JVM 的运行时内存

JVM 的运行时内存也叫作 JVM 堆，从 GC 的角度可以将 JVM 堆分为新生
代、老年代和永久代。其中新生代默认占 1/3 堆空间，老年代默认占
2/3 堆空间，永久代占非常少的堆空间。新生代又分为 Eden 区、
ServivorFrom 区和 ServivorTo 区，Eden 区默认占 8/10 新生代空间，
ServivorFrom 区和 ServivorTo 区默认分别占 1/10 新生代空间

![heap](https://cdn.nlark.com/yuque/0/2024/png/45828409/1719491714580-5dc549f7-2cd3-40f3-8696-b30dbc28c347.png?x-oss-process=image%2Fformat%2Cwebp%2Fresize%2Cw_750%2Climit_0)

### 1.4.1 新生代：Eden 区、ServivorTo 区和 ServivorFrom 区

JVM 新创建的对象（除了大对象外）会被存放在新生代，默认占
1/3 堆内存空间。由于 JVM 会频繁创建对象，所以新生代会频繁触发
MinorGC 进 行 垃 圾 回 收 。 新生代又分为 Eden 区 、 ServivorTo 区 和 ServivorFrom 区，如下所述。

1. Eden 区：Java 新创建的对象首先会被存放在 Eden 区，如果新创建的对象属于大对象，则直接将其分配到老年代。大对象的定义和
   具体的 JVM 版本、堆大小和垃圾回收策略有关，一般为 2KB ～ 128KB，可通过 XX:PretenureSizeThreshold 设置其大小。在 Eden 区的内存空间不足时会触发 MinorGC，对新生代进行一次垃圾回收。
2. ServivorTo 区：保留上一次 MinorGC 时的幸存者
3. ServivorFrom 区：将上一次 MinorGC 时的幸存者作为这一次 MinorGC 的被扫描者（啥意思）

新生代的 GC 过程叫作 MinorGC，采用复制算法实现，具体过程如下：

1. 把 在 Eden 区 和 ServivorFrom 区 中 存 活 的 对 象 复 制 到
   ServivorTo 区。如果某对象的年龄达到老年代的标准（对象晋升老年
   代的标准由 XX:MaxTenuringThreshold 设置，默认为 15），则将其复
   制到老年代，同时把这些对象的年龄加 1；如果 ServivorTo 区的内存
   空间不够，则也直接将其复制到老年代；如果对象属于大对象（大小
   为 2KB ～ 128KB 的 对 象 属 于 大 对 象 ， 例 如 通 过
   XX:PretenureSizeThreshold=2097152 设 置 大 对 象 为 2MB ，
   1024×1024×2Byte=2097152Byte=2MB），则也直接将其复制到老年代
2. 清空 Eden 区和 ServivorFrom 区中的对象
3. 将 ServivorTo 区和 ServivorFrom 区互换，原来的 ServivorTo
   区成为下一次 GC 时的 ServivorFrom 区

### 1.4.2 老年代

老年代主要存放有长生命周期的对象和大对象。老年代的 GC 过程
叫作 MajorGC。在老年代，对象比较稳定，MajorGC 不会被频繁触发。
在进行 MajorGC 前，JVM 会进行一次 MinorGC，在 MinorGC 过后仍然出现
老年代空间不足或无法找到足够大的连续空间分配给新创建的大对象
时，会触发 MajorGC 进行垃圾回收，释放 JVM 的内存空间。

MajorGC 采用标记清除算法，该算法首先会扫描所有对象并标记存
活的对象，然后回收未被标记的对象，并释放内存空间。

因为要先扫描老年代的所有对象再回收，所以 MajorGC 的耗时较
长。MajorGC 的标记清除算法容易产生内存碎片。在老年代没有内存空
间可分配时，会抛出 Out Of Memory 异常。

### 1.4.3 永久代

永久代指内存的永久保存区域，主要存放Class和Meta（元数据）
的信息。Class在类加载时被放入永久代。永久代和老年代、新生代不
同，GC不会在程序运行期间对永久代的内存进行清理，这也导致了永
久代的内存会随着加载的Class文件的增加而增加，在加载的Class文
件过多时会抛出Out Of Memory异常，比如Tomcat引用Jar文件过多导
致JVM内存不足而无法启动。   

需要注意的是，在Java 8中永久代已经被元数据区（也叫作元空
间）取代。元数据区的作用和永久代类似，二者最大的区别在于：元
数据区并没有使用虚拟机的内存，而是直接使用操作系统的本地内
存。因此，元空间的大小不受JVM内存的限制，只和操作系统的内存有
关。   

在Java 8中，JVM将类的元数据放入本地内存（Native Memory）
中，将常量池和类的静态变量放入Java堆中，这样JVM能够加载多少元
数据信息就不再由JVM的最大可用内存（MaxPermSize）空间决定，而
由操作系统的实际可用内存空间决定。

## 1.5 垃圾回收算法

### 1.5.1 如何确定垃圾

Java采用引用计数法和可达性分析来确定对象是否应该被回收，
其中，引用计数法容易产生循环引用的问题，可达性分析通过根搜索
算法（GC Roots Tracing）来实现。根搜索算法以一系列GC Roots的
点作为起点向下搜索，在一个对象到任何GC Roots都没有引用链相连
时，说明其已经死亡。根搜索算法主要针对栈中的引用、方法区中的
静态引用和JNI中的引用展开分析。

### 1.5.2 Java 中常用的垃圾回收算法

Java中常用的垃圾回收算法有标记清除（Mark-Sweep）、复制
（Copying）、标记整理（Mark-Compact）和分代收集（Generational
Collecting）这 4种垃圾回收算法。

- 标记清除：由于标记清除算法在清理对象所占用的内存空间后并没有重新整
  理可用的内存空间，因此如果内存中可被回收的小对象居多，则会引
  起内存碎片化的问题，继而引起大对象无法获得连续可用空间的问
  题。
- 复制算法：复制算法是为了解决标记清除算法内存碎片化的问题而设计的。
  复制算法首先将内存划分为两块大小相等的内存区域，即区域 1和区
  域 2，新生成的对象都被存放在区域 1中，在区域 1内的对象存储满
  后会对区域 1进行一次标记，并将标记后仍然存活的对象全部复制到
  区域 2中，这时区域 1将不存在任何存活的对象，直接清理整个区域
  1的内存即可
- 标记整理算法：标记整理算法结合了标记清除算法和复制算法的优点，其标记阶
  段和标记清除算法的标记阶段相同，在标记完成后将存活的对象移到
  内存的另一端，然后清除该端的对象并释放内存
- 分代收集：无论是标记清除算法、复制算法还是标记整理算法，都无法对所
  有类型（长生命周期、短生命周期、大对象、小对象）的对象都进行
  垃圾回收。因此，针对不同的对象类型，JVM采用了不同的垃圾回收算
  法，该算法被称为分代收集算法。

目前，大部分JVM在新生代都采用了复制算法.老年代主要存放生命周期较长的对象和大对象，因而每次只有少
量非存活的对象被回收，因而在老年代采用标记清除算法。

## 1.6 Java 中的4种引用类型

- 强引用：在Java中最常见的就是强引用。在把一个对象赋给
一个引用变量时，这个引用变量就是一个强引用。有强引用的对象一
定为可达性状态，所以不会被垃圾回收机制回收。因此，强引用是造
成Java内存泄漏（Memory Link）的主要原因。
- 软引用：软引用通过SoftReference类实现。如果一个对象
只有软引用，则在系统内存空间不足时该对象将被回收。
- 弱引用：弱引用通过WeakReference类实现，如果一个对象
只有弱引用，则在垃圾回收过程中一定会被回收。
- 虚引用：虚引用通过PhantomReference类实现，虚引用和引
用队列联合使用，主要用于跟踪对象的垃圾回收状态。

## 1.8 垃圾收集器

JVM针对新生代
和老年代分别提供了多种不同的垃圾收集器，针对新生代提供的垃圾
收集器有Serial、ParNew、Parallel Scavenge，针对老年代提供的垃
圾收集器有Serial Old、Parallel Old、CMS，还有针对不同区域的G1
分区收集算法。

- Serial垃圾收集器：单线程，复制算法。在它正在进行垃圾收集时，必须暂停其他所有工作线程，直到垃圾收
  集结束。
- ParNew垃圾收集器：多线程，复制算法。ParNew垃圾收集器是Serial垃圾收集器的多线程实现，同样采用
  了复制算法，它采用多线程模式工作，除此之外和Serial收集器几乎
  一样。ParNew垃圾收集器在垃圾收集过程中会暂停所有其他工作线程。
- Parallel Scavenge垃圾收集器：多线程，复制算法。Parallel Scavenge收集器是为提高新生代垃圾收集效率而设计的
  垃圾收集器，基于多线程复制算法实现，在系统吞吐量上有很大的优
  化，可以更高效地利用CPU尽快完成垃圾回收任务。
- Serial Old垃圾收集器：单线程，标记整理算法。

### 1.8.1 G1 垃圾收集器

G1（Garbage First）垃圾收集器为了避免全区域垃圾收集引起的
系统停顿，将堆内存划分为大小固定的几个独立区域，独立使用这些
区域的内存资源并且跟踪这些区域的垃圾收集进度，同时在后台维护
一个优先级列表，在垃圾回收过程中根据系统允许的最长垃圾收集时
间，优先回收垃圾最多的区域。G1垃圾收集器通过内存区域独立划分
使用和根据不同优先级回收各区域垃圾的机制，确保了G1垃圾收集器
在有限时间内获得最高的垃圾收集效率。相对于CMS收集器，G1垃圾收
集器两个突出的改进。

- 基于标记整理算法，不产生内存碎片。
- 可以精确地控制停顿时间，在不牺牲吞吐量的前提下实现短停顿垃圾回收。

## 1.9 Java网络编程模型

### 1.9.3 多路复用I/O模型

在多路复用I/O模型中会有一个被称 为Selector的线程不断轮询多个Socket的状态，只有在Socket有读写
事件时，才会通知用户线程进行I/O读写操作。

因为在多路复用I/O模型中只需一个线程就可以管理多个
Socket（阻塞I/O模型和非阻塞 1/O模型需要为每个Socket都建立一个
单独的线程处理该Socket上的数据），并且在真正有Socket读写事件 时才会使用操作系统的I/O资源，大大节约了系统资源。

Java NIO在用户的每个线程中都通过selector.select()查询当前
通道是否有事件到达，如果没有，则用户线程会一直阻塞。而多路复
用I/O模型通过一个线程管理多个Socket通道，在Socket有读写事件触
发时才会通知用户线程进行I/O读写操作。

### 1.9.7 Java NIO

Java NIO的实现主要涉及三大核心内容：Selector（选择器）、
Channel（通道）和 Buffer（缓冲区） 。Selector 用于监听多个
Channel的事件，比如连接打开或数据到达，因此，一个线程可以实现
对多个数据Channel的管理。传统I/O基于数据流进行I/O读写操作；而
Java NIO基于Channel和Buffer进行I/O读写操作，并且数据总是被从
Channel读取到Buffer中，或者从Buffer写入Channel中。

Java NIO和传统I/O的最大区别如下。

1. I/O是面向流的，NIO是面向缓冲区的：在面向流的操作中，
   数据只能在一个流中连续进行读写，数据没有缓冲，因此字节流无法
   前后移动。而在NIO中每次都是将数据从一个Channel读取到一个
   Buffer中，再从Buffer写入Channel中，因此可以方便地在缓冲区中进
   行数据的前后移动等操作。


1. Channel

Channel和I/O中的Stream（流）类似，只不过Stream是单向的
（例如InputStream、OutputStream），而Channel是双向的，既可以
用来进行读操作，也可以用来进行写操作。

NIO中Channel的主要实现有：FileChannel、DatagramChannel、
SocketChannel、ServerSocketChannel，分别对应文件的I/O、UDP、
TCP I/O、Socket Client和Socket Server操作。

2. Buffer

Buffer实际上是一个容器，其内部通过一个连续的字节数组存储
I/O上的数据。在NIO中，Channel在文件、网络上对数据的读取或写入
都必须经过Buffer。

在NIO中，Buffer是一个抽象类，对不同的数据类型实现不同的
Buffer操作。常用的Buffer实现类有：ByteBuffer、IntBuffer、
CharBuffer、LongBuffer、DoubleBuffer、FloatBuffer、ShortBuffer。

3. Selector

Selector用于检测在多个注册的Channel上是否有I/O事件发生，
并对检测到的I/O事件进行相应的响应和处理。因此通过一个Selector
线程就可以实现对多个Channel的管理，不必为每个连接都创建一个线
程，避免线程资源的浪费和多线程之间的上下文切换导致的开销。同
时，Selector只有在Channel上有读写事件发生时，才会调用I/O函数
进行读写操作，可极大减少系统开销，提高系统的并发量。

```java
// server
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.util.Iterator;

public class Main {
    private int size = 1024;
    private ServerSocketChannel serverSocketChannel;
    private ByteBuffer byteBuffer;
    private Selector selector;
    private int remoteClientNum = 0;

    public static void main(String[] args) throws Exception {
        Main server = new Main(8989);
        server.listener();
    }

    public Main(int port) {
        try {
            initChannel(port);
        } catch (IOException e) {
            e.printStackTrace();
            System.exit(-1);
        }
    }

    public void initChannel(int port) throws IOException {
        // 打开 channel
        serverSocketChannel = ServerSocketChannel.open();
        // 设置为非阻塞模式
        serverSocketChannel.configureBlocking(false);
        serverSocketChannel.bind(new InetSocketAddress(port));
        System.out.println("listener on port: " + port);

        // 选择器的创建
        selector = Selector.open();
        // 向选择器注册通道
        serverSocketChannel.register(selector, SelectionKey.OP_ACCEPT);
        // 分配缓冲区大小
        byteBuffer = ByteBuffer.allocate(size);
    }

    private void listener() throws Exception {
        while (true) {
            // 返回值表示有多少个 channel 处于就绪状态
            int n = selector.select();
            if (n == 0) {
                continue;
            }

            // 每个 selector 对应多个 SelectionKey，每个 SelectionKey 对应一个 channel
            Iterator<SelectionKey> iterator = selector.selectedKeys().iterator();

            while (iterator.hasNext()) {
                SelectionKey key = iterator.next();

                // 如果 SelectionKey 处于连接就绪状态，则开始接收客户端的连接
                if (key.isAcceptable()) {
                    // 获取 channel
                    ServerSocketChannel server = (ServerSocketChannel) key.channel();

                    // channel 接收连接
                    SocketChannel channel = server.accept();

                    // channel 注册
                    registerChannel(selector, channel, SelectionKey.OP_READ);

                    // 远程客户端的连接数
                    remoteClientNum++;
                    System.out.println("online client num=" + remoteClientNum);
                    write(channel, "hello client".getBytes());
                }

                // 如果通道已经处于读就绪状态
                if (key.isReadable()) {
                    read(key);
                }
                iterator.remove();
            }
        }
    }

    private void registerChannel(Selector selector, SocketChannel channel, int opRead) throws IOException {
        if (channel == null) {
            return;
        }

        channel.configureBlocking(false);
        channel.register(selector, opRead);
    }

    private void read(SelectionKey key) throws IOException {
        SocketChannel socketChannel = (SocketChannel) key.channel();
        int count;
        byteBuffer.clear();

        // 这里看不太懂，是已经直接读了，再去转变模式？
        while ((count = socketChannel.read(byteBuffer)) > 0) {
            // byteBuffer 写模式变为读模式
            byteBuffer.flip();

            while (byteBuffer.hasRemaining()) {
                System.out.println((char) byteBuffer.get());
            }
            byteBuffer.clear();
        }

        if (count < 0) {
            socketChannel.close();
        }
    }

    private void write(SocketChannel channel, byte[] writeData) throws IOException {
        byteBuffer.clear();
        byteBuffer.put(writeData);

        // byteBuffer 从写模式变成读模式
        byteBuffer.flip();

        // 将缓冲区的数据写入通道中
        channel.write(byteBuffer);
    }
}
```

client:

```java
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SocketChannel;

public class Client {
  private int size = 1024;
  private ByteBuffer byteBuffer;
  private SocketChannel socketChannel;

  public void connectServer() throws IOException {
    socketChannel = SocketChannel.open();
    socketChannel.connect(new InetSocketAddress("127.0.0.1", 8989));
    socketChannel.configureBlocking(false);

    byteBuffer = ByteBuffer.allocate(size);
    receive();
  }

  private void receive() throws IOException {
    while (true) {
      byteBuffer.clear();

      int count;

      while ((count = socketChannel.read(byteBuffer)) > 0) {
        byteBuffer.flip();

        while (byteBuffer.hasRemaining()) {
          System.out.print((char) byteBuffer.get());
        }

        send2Server("say hi".getBytes());
        byteBuffer.clear();
      }
    }
  }

  private void send2Server(byte[] bytes) throws IOException {
    byteBuffer.clear();
    byteBuffer.put(bytes);
    byteBuffer.flip();
    socketChannel.write(byteBuffer);
  }

  public static void main(String[] args) throws IOException {
    new Client().connectServer();
  }
}
```

## 1.10 JVM 的类加载机制

JVM的类加载分为 5个阶段：加载、验证、准备、解析、初始化。
在类初始化完成后就可以使用该类的信息，在一个类不再被需要时可 以从JVM中卸载。


# 第 2 章 Java 基础

## 2.1 集合

主要有4种，List、Queue、Set、Map。

### 2.1.1 List

- ArrayList：线程不安全
- Vector：线程安全，通过加锁保证
- LinkedList：线程不安全

### 2.1.2 Queue

略。

### 2.1.3 Set

- HashSet：HashTable 实现，无序 HashSet 首先判 断两个元素的散列值是否相等，如果散列值相等，则接着通过 equals 方法比较，
如果 equls 方法返回的结果也为 true，HashSet 就将其视为 同一个元素；如果 equals 方法返回的结果为 false，HashSet 就不将其 视为同一个元素。
- TreeSet：二叉树实现，那肯定是平衡二叉树，进而元素应该可以排序，比企鹅是有序的。
- LinkedHashSet

### 2.1.4 Map

- HashMap：线程不安全。内部是一个数组，数组中的
  每个元素都是一个单向链表，链表中的每个元素都是嵌套类Entry的实
  例，Entry实例包含4个属性：key、value、hash值和用于指向单向链
  表下一个元素的next。在链表中的元素超过 8个以后，
  HashMap会将链表结构转换为红黑树结构以提高查询效率
- ConcurrentHashMap：分段锁实现，线程安全。与HashMap不同，ConcurrentHashMap采用分段锁的思想实现并发
  操作，因此是线程安全的。ConcurrentHashMap由多个Segment组成（Segment 的数量也是锁的并发度），每个Segment均继承自
  ReentrantLock并单独加锁，所以每次进行加锁操作时锁住的都是一个Segment，这样只要保证每个Segment都是线程安全的，也就实现了全
  局的线程安全。
- TreeMap：线程不安全
- HashTable：线程安全
- LinkedHashMap

## 2.3 反射机制

Java 中的对象有两种类型：编译时类型和运行时类型。编译时类型指在声明对象时所采用的类型，运行时类型指为对象赋值时所采用的类型。

Java 的反射 API 主要用于在运行过程中动态生成类、接口或对象等信息，其常用 API 如下。

- Class 类：用于获取类的属性、方法等信息。
- Field 类：表示类的成员变量，用于获取和设置类中的属性值。
- Method 类：表示类的方法，用于获取方法的描述信息或者执行某个方法。
- Constructor 类：表示类的构造方法。

### 2.3.5 反射的步骤

反射的步骤如下。

1. 获取想要操作的类的 Class 对象，该 Class 对象是反射的核
   心，通过它可以调用类的任意方法。
2. 调用 Class 对象所对应的类中定义的方法，这是反射的使用阶段。
3. 使用反射 API 来获取并调用类的属性和方法等信息。

获取 Class 对象的 3 种方法

1. 调用对象的 getClass 方法 `Class clazz = p.getClass()`
2. 调用类的 class 属性 `Class clazz = Person.class`
3. 调用 Class 类中的 forName 静态方法以获取该类对应的 Class 对象，这是最安全、性能也最好的方法：`Class clazz = Class.forName("fullClassPath")`

```java
// 1. 获取 Person 类的 Class 对象
Class clazz = Class.forName("hello.java.reflect.Person");
// 2. 获取 Person 类的所有方法
Method[] methods = clazz.getDeclaredMethods();

for (Method m:methods) {
  System.out.println(m.toString());
}

// 3. 获取成员信息
Field[] fields = clazz.getDeclaredFields();
for (Field f:fields) {
    System.out.println(f.toString());
}

// 4. 获取构造函数
Constructor[] constructors = class.getDeclaredConstructors();
```

### 2.3.6 创建对象的两种方式

- 使用 Class 对象的 newInstance 方法创建该 Class 对象对应类的实例，这种方法要求该 Class 对象对应的类有默认的空构造器。
- 先使用 Class 对象获取指定的 Constructor 对象 ，再调用 Constructor 对象的 newInstance 方法创建 Class 对象对应类的实例，通过这种方法可以选定构造方法创建实例。

```java
Class clazz = Class.forName("hello.java.reflect.Person");

Person p = (Person) clazz.newInstance();

Constructor c = clazz.getDeclaredConstructor(String.class, String.class, int.class);

Person p1 = (Person) c.newInstance("xx", "xx", 20);
```

### 2.3.7 Method 的 invoke 方法

1. 获取 Method 对象：通过调用 Class 对象的 `getMethod(String name, Class<?>... parameterTypes)` 返回一个 Method 对象，它描述了
   此 Class 对象所表示的类或接口指定的公共成员方法。name 参数是
   String 类型，用于指定所需方法的名称。parameterTypes 参数是按声
   明 顺 序 标 识 该 方 法 的 形 参 类 型 的 Class 对 象 的 一 个 数 组 ， 如 果
   parameterTypes 为 null，则按空数组处理。
2. 调用 invoke 方法：指通过调用 Method 对象的 invoke 方法来动
   态执行函数。invoke 方法的具体使用代码如下：

```java
Class clz = Class.forName("hello.java.reflect.Person");

Method method = clz.getMethod("SetName", String.class);

// 3 获取 constructor
Constructor c = clz.getConstructor();

// 4 创建对象
Object obj = c.newInstance();

// 5 调用 invoke
method.invoke(obj, "alex");
```

## 2.4 注解

程序可以通过反射获取指定程序中元素的注解对象，然后通过该注解对象获取注解中的元数据信息。

### 2.4.2 元注解

- @Target：@Target 说明了注解所修饰的对象范围。注解可被
  用于 packages、types（类、接口、枚举、注解类型）、类型成员（方
  法、构造方法、成员变量、枚举值）、方法参数和本地变量（循环变
  量、catch 参数等）。在注解类型的声明中使用了 target，可更加明确
  其修饰的目标。
- @Retention：@Retention 定义了该注解被保留的级别，即被
  描述的注解在什么级别有效，有以下 3 种类型。
  - SOURCE：在源文件中有效，即在源文件中被保留。
  - CLASS：在 Class 文件中有效，即在 Class 文件中被保留。
  - RUNTIME：在运行时有效，即在运行时被保留。
- @Documented：@Documented 表明这个注解应该被 javadoc 工具记录，因此可以被 javadoc 类的工具文档化。
- @Inherited：@Inherited 是一个标记注解，表明某个被标注的类型是被继承的。如果有一个使用了@Inherited 修饰的 Annotation
  被用于一个 Class，则这个注解将被用于该 Class 的子类

### 2.4.3 注解处理器

定义注解接口：

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface FruitProvider {
  public int id() default -1;

  public String name() default "";

  public String address() default "";
}
```

使用注解

```java
class Apple {
  @FruitProvider(id = 1, name = "海底捞集团", address = "香港")
  private String appleProvider;
  
  public void setAppleProvider(String appleProvider) {
    this.appleProvider = appleProvider;
  }

  public String getAppleProvider() {
    return appleProvider;
  }
}
```

定义注解处理器：

```java
class FruitInfoUtil {
  public static void getFruitInfo(Class<?> clazz) {
    String strFruitProvider = "供应商信息：";

    Field[] fields = clazz.getDeclaredFields();

    for (Field field : fields) {
      if (field.isAnnotationPresent(FruitProvider.class)) {
        FruitProvider fruitProvider = (FruitProvider) field.getAnnotation(FruitProvider.class);

        strFruitProvider = "供应商编号" + fruitProvider.id() + "供应商名称：" + fruitProvider.name() + "供应商地址：" + fruitProvider.address();
      }
    }
  }
}

class FruitRunner {
  public static void main(String[] args) {
    FruitInfoUtil.getFruitInfo(Apple.class);
  }
}
```

## 2.5 内部类

定义在类内部的类被称为内部类。内部类根据不同的定义方式，可分为静态内部类、成员内部类、局部内部类和匿名内部类这 4 种。

### 2.5.1 静态内部类

定义在类内部的静态类被称为静态内部类。静态内部类可以访问
外部类的静态变量和方法；在静态内部类中可以定义静态变量、方
法、构造函数等；静态内部类通过“外部类.静态内部类”的方式来调用：

```java
public class OuterClass {
  private static String className = "StaticOuterClass";

  // 定义一个静态内部类
  public static class StaticInnerClass {
    public void getClassName() {
      System.out.println("classname: " + className);
    }
  }

  public static void main(String[] args) {
    // 调用静态内部类
    OuterClass.StaticInnerClass inner = new OuterClass.StaticInnerClass();
    inner.getClassName();
  }
}
```

但是把我看不加外部类也可以使用：

```java
public class OuterClass {
  private static String className = "StaticOuterClass";

  // 定义一个静态内部类
  public static class StaticInnerClass {
    public void getClassName() {
      System.out.println("classname: " + className);
    }
  }

  public static void main(String[] args) {
    // 调用静态内部类
    StaticInnerClass inner = new StaticInnerClass();
    inner.getClassName();
  }
}
```

有点像一种特殊的静态属性，只不过不是用 = 赋值的。

### 2.5.2 成员内部类

定义在类内部的非静态类叫作成员内部类，成员内部类不能定义
静态方法和变量（final修饰的除外），因为成员内部类是非静态的，
而在Java的非静态代码块中不能定义静态方法和变量。

```java
public class OutClass2 {
  private static int a = 123;
  private int b = 456;

  // 定义一个成员内部类
  public class MemberInnerClass2 {
    public void print() {
      System.out.println(a);
      System.out.println(b);
    }
  }

  public static void main(String[] args) {
    OutClass2 out = new OutClass2();
    // 这个用法还是头一次见
    MemberInnerClass2 inner = out.new MemberInnerClass2();
    inner.print();
  }
}
```

### 2.5.3 局部内部类

定义在方法中的类叫作局部内部类。当一个类只需要在某个方法中使用某个特定的类时，可以通过局部类来优雅地实现：

```java
public class OutClass3 {
  private static int a = 123;
  private int b = 456;

  public void partClassTest(final int c) {
    final int d = 1;

    class PartClass {
      public void print() {
        System.out.println(c);
        System.out.println(a);
        System.out.println(b);
      }
    }

    PartClass part = new PartClass();
    part.print();
  }

  public static void main(String[] args) {
    OutClass3 outClass3 = new OutClass3();
    outClass3.partClassTest(111);
  }
}
```

### 2.5.4 匿名内部类

匿名内部类指通过继承一个父类或者实现一个接口的方式直接定义并使用的类。匿名内部类没有 class 关键字，这是因为匿名内部类直
接使用 new 生成一个对象的引用。

看不太懂。。。

## 2.7 序列化

- 类要实现序列化功能，只需实现 java.io.Serializable 接口即可。
- 序列化和反序列化必须保持序列化的 ID 一致，一般使用 private static final long serialVersionUID 定义序列化 ID
- 序列化并不保存静态变量
- 在需要序列化父类变量时，父类也需要实现 Serializable 接口。
- 使用 Transient 关键字可以阻止该变量被序列化，在被反序列
  化后，transient 变量的值被设为对应类型的初始值，例如，int 类型变量的值是 0，对象类型变量的值是 null

# 第 3 章 Java 并发编程

## 3.1 线程的创建方式

- 继承 Thread 类
- 实现 Runnable 接口
- 通过 ExecutorService
- 基于线程池

```java
// Thread

public  class NewThread extends Thread {
    public void run() {
        System.out.println("create a thread by extends Thread");
    }
}

NewThread newThread = new NewThread();
newThread.start();

// Runnable 接口
public class ChildrenThread implements Runnable {
    public void run() {
        // ...
    }
}

ChildrenThread childrenThread = new ChildrenThread();
new Thread(childrenThread).start();
```

### 3.1.3 通过ExecutorService和`Callable<Class>`实现有返回值的线程

有时，我们需要在主线程中开启多个线程并发执行一个任务，然
后收集各个线程执行返回的结果并将最终结果汇总起来，这时就要用
到Callable接口。具体的实现方法为：创建一个类并实现Callable接
口，在call方法中实现具体的运算逻辑并返回计算结果。具体的调用
过程为：创建一个线程池、一个用于接收返回结果的Future List及
Callable线程实例，使用线程池提交任务并将线程执行之后的结果保
存在Future中，在线程执行结束后遍历Future List中的Future对象，
在该对象上调用get方法就可以获取Callable线程任务返回的数据并汇
总结果

### 3.1.4 基于线程池

```java
import java.util.concurrent.Executors;

ExecutorService threadPool = Executors.newFixedThreadPool(10);

for (int i = 0; i < 10; i++) {
    threadPool.execute(new Runnable() {
        @Override
        public void run() {
            System.out.println(Thread.currentThread().getName() + " is running");
        }
    })
}
```

## 3.2 线程池的工作原理

Java线程池主要用于管理线程组及其运行状态，以便Java虚拟机
更好地利用CPU资源。Java线程池的工作原理为：JVM先根据用户的参
数创建一定数量的可运行的线程任务，并将其放入队列中，在线程创
建后启动这些任务，如果线程数量超过了最大线程数量（用户设置的
线程池大小），则超出数量的线程排队等候，在有任务执行完毕后，
线程池调度器会发现有可用的线程，进而再次从队列中取出任务并执
行。

### 3.2.2 线程池的核心组件和核心类

Java线程池主要由以下4个核心组件组成。

- 线程池管理器：用于创建并管理线程池。
- 工作线程：线程池中执行具体任务的线程。
- 任务接口：用于定义工作线程的调度和执行策略，只有线程实现了该接口，线程中的任务才能够被线程池调度。
- 任务队列：存放待处理的任务，新的任务将会不断被加入队列中，执行完成的任务将被从队列中移除。

### 3.2.3 线程池的工作流程

Java线程池的工作流程为：线程池刚被创建时，只是向系统申请 一个用于执行线程队列和管理线程池的线程资源。在调用execute()添
加一个任务时，线程池会按照以下流程执行任务。

- 如果正在运行的线程数量少于corePoolSize（用户定义的核心线程数），线程池就会立刻创建线程并执行该线程任务。
- 如果正在运行的线程数量大于等于corePoolSize，该任务就将 被放入阻塞队列中。
- 在阻塞队列已满且正在运行的线程数量少于maximumPoolSize时，线程池会创建非核心线程立刻执行该线程任务。
- 在阻塞队列已满且正在运行的线程数量大于等于
  maximumPoolSize 时 ，线程池将拒绝执行该线程任务并抛出
  RejectExecutionException异常。
- 在线程任务执行完毕后，该任务将被从线程池队列中移除，线程池将从队列中取下一个线程任务继续执行
- 在线程处于空闲状态的时间超过keepAliveTime时间时，正在运行的线程数量超过corePoolSize，该线程将会被认定为空闲线程并停止。因此在线程池中所有线程任务都执行完毕后，线程池会收缩到
  corePoolSize大小。

## 3.3 5种常用的线程池

- newCachedThreadPool：创建一个可缓存线程池
- newFixedThreadPool：创建一个固定长度的线程池，如果线程池长度超过处理需要，则由队列来保存等待任务。
- newScheduledThreadPool：创建一个定时线程池，支持定时及周期性任务执行。
- newSingleThreadExecutor：创建一个单线程化的线程池，它只会用唯一的工作线程来执行任务，保证所有任务按照指定顺序执行。
- newWorkStealingPool：创建一个使用所有可用 processors 的线程池。

newCachedThreadPool用于创建一个缓存线程池。之所以叫缓存线
程池，是因为它在创建新线程时如果有可重用的线程，则重用它们，
否则重新创建一个新的线程并将其添加到线程池中。对于执行时间很
短的任务而言，newCachedThreadPool线程池能很大程度地重用线程进
而提高系统的性能。

在线程池的keepAliveTime时间超过默认的 60秒后，该线程会被终止并从缓存中移除，因此在没有线程任务运行时，newCachedThreadPool将不会占用系统的线程资源。

newFixedThreadPool用于创建一个固定线程数量的线程池，并将
线程资源存放在队列中循环使用。在newFixedThreadPool线程池中，若处于活动状态的线程数量大于等于核心线程池的数量，则新提交的任务将在阻塞队列中排队，直到有可用的线程资源

## 3.4 线程的生命周期

1. 调用new方法新建一个线程，这时线程处于新建状态。
2. 调用start方法启动一个线程，这时线程处于就绪状态。
3. 处于就绪状态的线程等待线程获取CPU资源，在等待其获取CPU资源后线程会执行run方法进入运行状态。
4. 正在运行的线程在调用了yield方法或失去处理器资源时，会再次进入就绪状态。
5. 正在执行的线程在执行了sleep方法、I/O阻塞、等待同步锁、等待通知、调用suspend方法等操作后，会挂起并进入阻塞状态，进入Blocked池。
6. 阻塞状态的线程由于出现sleep时间已到、I/O方法返回、获得同步锁、收到通知、调用resume方法等情况，会再次进入就绪状态，等待CPU时间片的轮询。该线程在获取CPU资源后，会再次进入运
   行状态。
7. 处于运行状态的线程，在调用run方法或call方法正常执行完成、调用stop方法停止线程或者程序执行错误导致异常退出时，会进入死亡状态。

## 3.5 线程的基本方法

线程相关的基本方法有wait、notify、notifyAll、sleep、join、yield等，这些方法控制线程的运行，并影响线程的状态变化。

- wait：调用wait方法的线程会进入WAITING状态，只有等到其他线程的通知或被中断后才会返回。需要注意的是，在调用wait方法后会释放对
  象的锁，因此wait方法一般被用于同步方法或同步代码块中。
- sleep：调用sleep方法会导致当前线程休眠。与wait方法不同的是，
  sleep方法不会释放当前占有的锁，会导致线程进入TIMED-WAITING状态，而wait方法会导致当前线程进入WATING状态。
- yield：调用yield方法会使当前线程让出（释放）CPU执行时间片，与其他线程一起重新竞争CPU时间片。
- interrupt: interrupt方法用于向线程发行一个终止通知信号，会影响该线程内部的一个中断标识位，这个线程本身并不会因为调用了interrupt方
  法而改变状态（阻塞、终止等）。状态的具体变化需要等待接收到中断标识的程序的最终处理结果来判定。
- join：join方法用于等待其他线程终止，如果在当前线程中调用一个线
  程的join方法，则当前线程转为阻塞状态，等到另一个线程结束，当前线程再由阻塞状态转为就绪状态，等待获取CPU的使用权。
- notify：Object类有个notify方法，用于唤醒在此对象监视器上等待的一个线程，如果所有线程都在此对象上等待，则会选择唤醒其中一个线程，选择是任意的。

## 3.6 Java 中的锁

- 乐观锁：在每次读取数据时都认为别人不会修改该数据，所以不会上锁，但在更新时会判断在此期间别人有
  没有更新该数据，通常采用在写时先读出当前版本号然后加锁的方法。具体过程为：比较当前版本号与上一次的版本号，如果版本号一致，则更新，如果版本号不一致，则重复进行读、比较、写操作。

# 第7章 数据库

## 7.3 数据库分布式事务

### 7.3.1 CAP

- 一致性：在分布式系统的所有数据备份中，在同一时刻是否有同样的值（等同于所有节点都访问同一份最新的数据副本）。
- 可用性：在集群中一部分节点发生故障后，集群整体能否响应客户端的读写请求（对数据更新具备高可用性）。
- 分区容错性：系统如果不能在时限内达成数据的一致性，就意味着发生了分区，必须就当前操作在C和A 之间做出选择。以实际效果而言，分区相当于对通信的时限要求。