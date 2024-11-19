# OS

<!-- TOC -->

- [OS](#os)
  - [os.EOL](#oseol)
  - [os.arch()](#osarch)
  - [os.constants](#osconstants)
  - [os.cpus()](#oscpus)
  - [os.endianness()](#osendianness)
  - [os.freemem()](#osfreemem)
  - [os.getPriority([pid])](#osgetprioritypid)
  - [os.homedir()](#oshomedir)
  - [os.hostname()](#oshostname)
  - [os.loadavg()](#osloadavg)
  - [os.networkInterfaces()](#osnetworkinterfaces)
  - [os.platform()](#osplatform)
  - [os.release()](#osrelease)
  - [os.setPriority([pid,]priority)](#ossetprioritypidpriority)
  - [os.tmpdir()](#ostmpdir)
  - [os.totalmem()](#ostotalmem)
  - [os.type()](#ostype)
  - [os.uptime()](#osuptime)
  - [os.userInfo([options])](#osuserinfooptions)

<!-- /TOC -->

`os` 模块提供了一系列操作系统相关的实用方法：   

```js
const os = require('os');
```    

## os.EOL

+ POSIX 为 `\n`
+ Windows 为 `\r\n`    

## os.arch()

Node.js 可执行程序编译的 CPU 架构。    

可能的值有：`arm, arm64, ia32, mips, mipsel, ppc, ppc64, s390, s390x, x32, x64`   

等价于 `process.arch`

## os.constants

+ Object

返回一个对象，包含操作系统特定的一些常量，包括错误码，系统信号等等。    

## os.cpus()

+ Object\[\]

返回一个对象的数组，包含关于每个逻辑 CPU 内核的信息。这个对象的属性包括：   

+ `model` string
+ `speed` number in MHz
+ `times` Object
  - `user` number 毫秒为单位的 CPU 在用户模式下运行的时间
  - `nice` number nice 模式的时间
  - `sys` sys 模式的时间
  - `idle` idle 模式的时间
  - `irq` irq 模式的时间    

## os.endianness()

编译的 CPU 的大小端。   

+ `BE` 大端
+ `LE` 小端    

## os.freemem()

+ integer

字节为单位的空闲的系统内存。   

## os.getPriority([pid])

+ `pid` integer 默认 `0`
+ Returns: integer

如果没有提供 `pid` 参数，或者是 0，则返回当前进程的优先级。   

## os.homedir()

略。   

## os.hostname()

当前系统的主机名。   

## os.loadavg()

+ Returns: number\[\]

返回一个数组，包含 1,5,15 分钟的系统平均负载。   

## os.networkInterfaces()

+ Returns: Object

返回一个对象，仅包含那些被赋予了网络地址的网卡。   

每个键标志了一个网卡，值是一个对象数组，表示一个被赋予的网络地址。    

网络地址对象包括以下属性：   

+ `address` string, IPv4 或 IPv6 地址
+ `netmask` string, 网络掩码
+ `family` string, `IPv4` 或 `IPv6`
+ `mac` string, 网卡的 mac 地址
+ `internal` boolean, 如果网卡是一个回环网卡，或者是一个类似的无法运城访问的网卡就为 `true`
+ `scopied` number IPv6 scope ID
+ `cidr` string    

```js
{
  lo: [
    {
      address: '127.0.0.1',
      netmask: '255.0.0.0',
      family: 'IPv4',
      mac: '00:00:00:00:00:00',
      internal: true,
      cidr: '127.0.0.1/8'
    },
    {
      address: '::1',
      netmask: 'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
      family: 'IPv6',
      mac: '00:00:00:00:00:00',
      internal: true,
      cidr: '::1/128'
    }
  ],
  eth0: [
    {
      address: '192.168.1.108',
      netmask: '255.255.255.0',
      family: 'IPv4',
      mac: '01:02:03:0a:0b:0c',
      internal: false,
      cidr: '192.168.1.108/24'
    },
    {
      address: 'fe80::a00:27ff:fe4e:66a1',
      netmask: 'ffff:ffff:ffff:ffff::',
      family: 'IPv6',
      mac: '01:02:03:0a:0b:0c',
      internal: false,
      cidr: 'fe80::a00:27ff:fe4e:66a1/64'
    }
  ]
}
```   

## os.platform()

编译时设置的目标平台：   

+ `aix`
+ `darwin`
+ `freebsd`
+ `linux`
+ `openbsd`
+ `sunos`
+ `win32`   

等价于 `process.platform`    

## os.release()

看样子好像是返回系统的内核释出版本。   

## os.setPriority([pid,]priority)

`priority` 必须是一个 -20 到 19的整数，-20 是最高的优先级。   

## os.tmpdir()

系统默认的临时文件夹。   

## os.totalmem()

字节为单位的系统内存总量。   

## os.type()

返回由 `uname(3)` 返回的系统名称，例如 Linux 上为 `Linux`，macOS 上为 `Darwin`，
Windows 上为 `Windows_NT`    

## os.uptime()

+ integer

以秒为单位的系统运行时间。   

## os.userInfo([options])

+ `options`
  - `encoding` 用来解释返回结果字符串的字符编码，如果设置为 `buffer`，则 `username`,
  `shell`, `homedir` 值都为 `buffer` 实例，默认 `utf8`
+ Returns: Object

返回关于当前有效用户的信息。返回的对象包含 `username`, `uid`, `gid`, `shell`, `homedir`
等信息。    

