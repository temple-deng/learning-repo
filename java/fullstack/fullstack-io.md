# Java IO

<!-- TOC -->
* [Java IO](#java-io)
* [Java IO - 分类（传输、操作）](#java-io---分类传输操作)
  * [IO 理解分类 - 从传输方式上](#io-理解分类---从传输方式上)
    * [字节流和字符流的区别](#字节流和字符流的区别)
  * [IO 理解分类 - 从数据操作上](#io-理解分类---从数据操作上)
* [InputStream 源码](#inputstream-源码)
  * [Input 抽象类](#input-抽象类)
* [OutputStream 源码](#outputstream-源码)
* [常见类使用](#常见类使用)
  * [IO 常见类的使用](#io-常见类的使用)
* [Unix IO 模型](#unix-io-模型)
  * [Unix IO 模型简介](#unix-io-模型简介)
  * [IO 模型比较](#io-模型比较)
  * [IO 多路复用](#io-多路复用)
* [NIO](#nio)
  * [通道与缓冲区](#通道与缓冲区)
    * [通道](#通道)
    * [缓冲区](#缓冲区)
  * [缓冲区状态变量](#缓冲区状态变量)
  * [文件 NIO 实例](#文件-nio-实例)
  * [选择器](#选择器)
<!-- TOC -->

> 摘自 https://pdai.tech/

![io](https://pdai.tech/images/io/java-io-overview2.png)

# Java IO - 分类（传输、操作）

## IO 理解分类 - 从传输方式上

从数据传输方式或者说是运输方式角度看，可以将 IO 类分为:

- 字节流
- 字符流

字节是个计算机看的，字符才是给人看的

### 字节流和字符流的区别

- 字节流读取单个字节，字符流读取单个字符(一个字符根据编码的不同，对应的字节也不同，如 UTF-8 编码中文汉字是 3 个字节，GBK 编码中文汉字是 2 个字节。)
- 字节流用来处理二进制文件(图片、MP3、视频文件)，字符流用来处理文本文件(可以看做是特殊的二进制文件，使用了某种编码，人可以阅读)。

## IO 理解分类 - 从数据操作上

- 文件
  - FileInputStream、FileOutputStream、FileReader、FileWriter
- 数组
  - ByteArrayInputStream, ByteArrayOutputStream
  - CharArrayReader、CharArrayWriter
- 管道操作
  - PipedInputStream、PipedOutputStream、PipedReader、PipedWriter
- 基本数据类型
  - DataInputStream、DataOutputStream
- 缓冲操作
  - BufferedInputStream、BufferedOutputStream、BufferedReader、BufferedWriter
- 打印
  - PrintStream、PrintWriter
- 对象序列化反序列化
  - ObjectInputStream、ObjectOutputStream
- 转换
  - InputStreamReader、OutputStreamWriter

# InputStream 源码

![inputStream](https://pdai.tech/images/io/io-inputstream-1.png)

## Input 抽象类

```java
// 读取下一个字节，如果没有则返回-1
public abstract int read()

// 将读取到的数据放在 byte 数组中，该方法实际上调用read(byte b[], int off, int len)方法
public int read(byte b[])

// 从第 off 位置读取<b>最多(实际可能小于)</b> len 长度字节的数据放到 byte 数组中，流是以 -1 来判断是否读取结束的; 此方法会一直阻止，直到输入数据可用、检测到stream结尾或引发异常为止。
public int read(byte b[], int off, int len)

// JDK9新增：读取 InputStream 中的所有剩余字节，调用readNBytes(Integer.MAX_VALUE)方法
public byte[] readAllBytes()

// JDK11更新：读取 InputStream 中的剩余字节的指定上限大小的字节内容；此方法会一直阻塞，直到读取了请求的字节数、检测到流结束或引发异常为止。此方法不会关闭输入流。
public byte[] readNBytes(int len)

// JDK9新增：从输入流读取请求的字节数并保存在byte数组中； 此方法会一直阻塞，直到读取了请求的字节数、检测到流结束或引发异常为止。此方法不会关闭输入流。
public int readNBytes(byte[] b, int off, int len)

// 跳过指定个数的字节不读取
public long skip(long n)

// 返回可读的字节数量
public int available()

// 读取完，关闭流，释放资源
public void close()

// 标记读取位置，下次还可以从这里开始读取，使用前要看当前流是否支持，可以使用 markSupport() 方法判断
public synchronized void mark(int readlimit)

// 重置读取位置为上次 mark 标记的位置
public synchronized void reset()

// 判断当前流是否支持标记流，和上面两个方法配套使用
public boolean markSupported()

// JDK9新增：读取 InputStream 中的全部字节并写入到指定的 OutputStream 中
public long transferTo(OutputStream out)
```

# OutputStream 源码

![output](https://pdai.tech/images/io/io-outputstream-1.png)

```java
// 写入一个字节，可以看到这里的参数是一个 int 类型，对应上面的读方法，int 类型的 32 位，只有低 8 位才写入，高 24 位将舍弃。
public abstract void write(int b)

// 将数组中的所有字节写入，实际调用的是write(byte b[], int off, int len)方法。
public void write(byte b[])

// 将 byte 数组从 off 位置开始，len 长度的字节写入
public void write(byte b[], int off, int len)

// 强制刷新，将缓冲中的数据写入; 默认是空实现，供子类覆盖
public void flush()

// 关闭输出流，流被关闭后就不能再输出数据了; 默认是空实现，供子类覆盖
public void close()
```

# 常见类使用

## IO 常见类的使用

Java 的 I/O 大概可以分成以下几类:

- 磁盘操作: File
- 字节操作: InputStream 和 OutputStream
- 字符操作: Reader 和 Writer
- 对象操作: Serializable
- 网络操作: Socket

File 类可以用于表示文件和目录的信息，但是它不表示文件的内容。

# Unix IO 模型

## Unix IO 模型简介

一个输入操作通常包括两个阶段:

- 等待数据准备好
- 从内核向进程复制数据

对于一个套接字上的输入操作，第一步通常涉及等待数据从网络中到达。当所等待分组到达时，它被复制到内核中的某个缓冲区。第二步就是把数据从内核缓冲区复制到应用进程缓冲区。

Unix 下有五种 I/O 模型:

- 阻塞式 I/O：应用进程被阻塞，直到数据复制到应用进程缓冲区中才返回。
- 非阻塞式 I/O：应用进程执行系统调用之后，内核返回一个错误码。应用进程可以继续执行，但是需要不断的执行系统调用来获知 I/O 是否完成，这种方式称为轮询(polling)。
- I/O 复用(select 和 poll)：使用 select 或者 poll 等待数据，并且可以等待多个套接字中的任何一个变为可读，这一过程会被阻塞，当某一个套接字可读时返回。 
之后再使用 recvfrom 把数据从内核复制到进程中。它可以让单个进程具有处理多个 I/O 事件的能力。又被称为 Event Driven I/O，即事件驱动 I/O。
如果一个 Web 服务器没有 I/O 复用，那么每一个 Socket 连接都需要创建一个线程去处理。如果同时有几万个连接，那么就需要创建相同数量的线程。并且相比于多进程和多线程技术，I/O 复用不需要进程线程创建和切换的开销，系统开销更小。
- 信号驱动式 I/O(SIGIO)：应用进程使用 sigaction 系统调用，内核立即返回，应用进程可以继续执行，也就是说等待数据阶段应用进程是非阻塞的。
内核在数据到达时向应用进程发送 SIGIO 信号，应用进程收到之后在信号处理程序中调用 recvfrom 将数据从内核复制到应用进程中。
- 异步 I/O(AIO)：进行 aio_read 系统调用会立即返回，应用进程继续执行，不会被阻塞，内核会在所有操作完成之后向应用进程发送信号。

![io](https://pdai.tech/images/io/java-io-model-2.png)

异步 I/O 与信号驱动 I/O 的区别在于，异步 I/O 的信号是通知应用进程 I/O 完成，而信号驱动 I/O 的信号是通知应用进程可以开始 I/O。

## IO 模型比较

- 同步 I/O: 应用进程在调用 recvfrom 操作时会阻塞。
- 异步 I/O: 不会阻塞

阻塞式 I/O、非阻塞式 I/O、I/O 复用和信号驱动 I/O 都是同步 I/O，虽然非阻塞式 I/O 和信号驱动 I/O 在等待数据阶段不会阻塞，但是在之后的将数据从内核复制到应用进程这个操作会阻塞。

## IO 多路复用

epoll 的描述符事件有两种触发模式: LT(level trigger)和 ET(edge trigger)。

- LT:当 epoll_wait() 检测到描述符事件到达时，将此事件通知进程，进程可以不立即处理该事件，下次调用 epoll_wait() 会再次通知进程。是默认的一种模式，并且同时支持 Blocking 和 No-Blocking。
- ET: 和 LT 模式不同的是，通知之后进程必须立即处理事件，下次再调用 epoll_wait() 时不会再得到事件到达的通知。很大程度上减少了 epoll 事件被重复触发的次数，因此效率要比 LT 模式高。只支持 No-Blocking，以避免由于一个文件句柄的阻塞读/阻塞写操作把处理多个文件描述符的任务饿死。

调用 blocking IO 会一直 block 住对应的进程直到操作完成，而 non-blocking IO 在 kernel 还准备数据的情况下会立刻返回。

所以阻塞还是非阻塞是说数据未准备好的时候进程阻不阻塞，而同步还是异步是说拷贝数据的时候的阻不阻塞。

# NIO

I/O 与 NIO 最重要的区别是数据打包和传输的方式，I/O 以流的方式处理数据，而 NIO 以块的方式处理数据。

面向流的 I/O 一次处理一个字节数据: 一个输入流产生一个字节数据，一个输出流消费一个字节数据。为流式数据创建过滤器非常容易，链接几个过滤器，以便每个过滤器只负责复杂处理机制的一部分。不利的一面是，面向流的 I/O 通常相当慢。

面向块的 I/O 一次处理一个数据块，按块处理数据比按流处理数据要快得多。但是面向块的 I/O 缺少一些面向流的 I/O 所具有的优雅性和简单性。

## 通道与缓冲区

### 通道

通道 Channel 是对原 I/O 包中的流的模拟，可以通过它读取和写入数据。

通道与流的不同之处在于，流只能在一个方向上移动(一个流必须是 InputStream 或者 OutputStream 的子类)，而通道是双向的，可以用于读、写或者同时用于读写。

通道包括以下类型:

- FileChannel: 从文件中读写数据；
- DatagramChannel: 通过 UDP 读写网络中数据；
- SocketChannel: 通过 TCP 读写网络中数据；
- ServerSocketChannel: 可以监听新进来的 TCP 连接，对每一个新进来的连接都会创建一个 SocketChannel。

### 缓冲区

发送给一个通道的所有数据都必须首先放到缓冲区中，同样地，从通道中读取的任何数据都要先读到缓冲区中。也就是说，不会直接对通道进行读写数据，而是要先经过缓冲区。

缓冲区实质上是一个数组，但它不仅仅是一个数组。缓冲区提供了对数据的结构化访问，而且还可以跟踪系统的读/写进程。

缓冲区包括以下类型:

- ByteBuffer
- CharBuffer
- ShortBuffer
- IntBuffer
- LongBuffer
- FloatBuffer
- DoubleBuffer

## 缓冲区状态变量

- capacity: 最大容量；
- position: 当前已经读写的字节数；
- limit: 还可以读写的字节数。

## 文件 NIO 实例

```java
public static void fastCopy(String src, String dist) throws IOException {

    /* 获得源文件的输入字节流 */
    FileInputStream fin = new FileInputStream(src);

    /* 获取输入字节流的文件通道 */
    FileChannel fcin = fin.getChannel();

    /* 获取目标文件的输出字节流 */
    FileOutputStream fout = new FileOutputStream(dist);

    /* 获取输出字节流的通道 */
    FileChannel fcout = fout.getChannel();

    /* 为缓冲区分配 1024 个字节 */
    ByteBuffer buffer = ByteBuffer.allocateDirect(1024);

    while (true) {

        /* 从输入通道中读取数据到缓冲区中 */
        int r = fcin.read(buffer);

        /* read() 返回 -1 表示 EOF */
        if (r == -1) {
            break;
        }

        /* 切换读写 */
        buffer.flip();

        /* 把缓冲区的内容写入输出文件中 */
        fcout.write(buffer);

        /* 清空缓冲区 */
        buffer.clear();
    }

  fin.close();
  fout.close();
}
```

## 选择器

NIO 实现了 IO 多路复用中的 Reactor 模型，一个线程 Thread 使用一个选择器 Selector 通过轮询的方式去监听多个通道 Channel 上的事件，从而让一个线程就可以处理多个事件。

通过配置监听的通道 Channel 为非阻塞，那么当 Channel 上的 IO 事件还未到达时，就不会进入阻塞状态一直等待，而是继续轮询其它 Channel，找到 IO 事件已经到达的 Channel 执行。

因为创建和切换线程的开销很大，因此使用一个线程来处理多个事件而不是一个线程处理一个事件具有更好的性能。

只有套接字 Channel 才能配置为非阻塞，而 FileChannel 不能，为 FileChannel 配置非阻塞也没有意义。

```java
public class Nio {
  public static void main(String[] args) throws IOException {
    // 1. 创建选择器
    Selector selector = Selector.open();

    // 2. 将通道注册到选择器上
    ServerSocketChannel ssChannel = ServerSocketChannel.open();
    ssChannel.configureBlocking(false);
    ssChannel.register(selector, SelectionKey.OP_ACCEPT);

    ServerSocket serverSocket = ssChannel.socket();
    InetSocketAddress address = new InetSocketAddress("127.0.0.1", 8888);
    serverSocket.bind(address);

    while (true) {
      // 3. 监听事件
      selector.select();

      // 4. 获取到达的事件
      Set<SelectionKey> keys = selector.selectedKeys();
      Iterator<SelectionKey> keyIterator = keys.iterator();

      while (keyIterator.hasNext()) {
        SelectionKey key = keyIterator.next();

        if (key.isAcceptable()) {
          ServerSocketChannel ssChannel1 = (ServerSocketChannel) key.channel();

          // 服务器会为每个新连接创建一个 SocketChannel
          SocketChannel sChannel = ssChannel1.accept();
          sChannel.configureBlocking(false);

          sChannel.register(selector, SelectionKey.OP_READ);
        } else if (key.isReadable()) {
          SocketChannel sChannel = (SocketChannel) key.channel();
          System.out.println(readDataFromSocketChannel(sChannel));

          sChannel.close();
        }

        keyIterator.remove();
      }
    }
  }

  private static String readDataFromSocketChannel(SocketChannel sChannel) throws IOException {
    ByteBuffer buffer = ByteBuffer.allocate(1024);
    StringBuilder data = new StringBuilder();

    while (true) {
      buffer.clear();

      int n = sChannel.read(buffer);

      if (n == -1) {
        break;
      }

      buffer.flip();
      int limit = buffer.limit();

      char[] dst = new char[limit];
      for (int i = 0; i < limit; i++) {
        dst[i] = (char) buffer.get(i);
      }

      data.append(dst);
      buffer.clear();
    }

    return data.toString();
  }
}
```
