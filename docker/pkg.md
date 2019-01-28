# Debian 包管理工具概览

<!-- TOC -->

- [Debian 包管理工具概览](#debian-包管理工具概览)
  - [Apt-get](#apt-get)
  - [Apt-cache](#apt-cache)
  - [Aptitude](#aptitude)
  - [Dpkg](#dpkg)
- [更新包缓存和系统](#更新包缓存和系统)
  - [更新本地包缓存](#更新本地包缓存)
  - [在不移除包的情况下更新包](#在不移除包的情况下更新包)
  - [更新包并在必要时移除包](#更新包并在必要时移除包)
- [下载和安装包](#下载和安装包)
  - [包的搜索](#包的搜索)
  - [从仓库中安装包](#从仓库中安装包)
  - [从仓库中安装特定的包的版本](#从仓库中安装特定的包的版本)
  - [重新配置包](#重新配置包)
  - [Perform a Dry Run of Package Actions](#perform-a-dry-run-of-package-actions)
  - [包操作不要弹出同意与否提示](#包操作不要弹出同意与否提示)
  - [修复损坏的依赖和包](#修复损坏的依赖和包)
  - [安装一个 .deb 包](#安装一个-deb-包)
- [移除包和删除文件](#移除包和删除文件)
  - [卸载包](#卸载包)
  - [卸载包并删除所有相关配置文件](#卸载包并删除所有相关配置文件)

<!-- /TOC -->

Debian/Ubuntu 生态系统采用了不同的包管理工具来管理系统中的软件。这些工具中的大部分都是相关的，
并且工作在同一个包数据库系统之上。一些工具尝试为包系统提供高层级的接口，另一些工具则集中于提供
底层功能。    

## Apt-get

`apt-get` 命令时 `apt` 包管理工具套件中最常用的命令。其主要是与由发行版包管理团队维护的
远程仓库交互，并执行一些对其中可用包的操作。      

`apt` 套件通常通过从远程仓库中拉取信息到本地系统中的缓存来工作。`apt-get` 命令常用来刷新本地
缓存。也可以用来修改包的状态，即从系统中安装或者移除一个包。   

## Apt-cache

`apt` 套件中另一个重要的成员是 `apt-cache`。这个工具使用本地缓存来查看可用包及其属性的信息。   

例如，有时候我们想要搜索一个特定的包，就可以使用 `apt-cache`。   

## Aptitude

`aptitude` 命令结合了上述两个命令的大部分功能。   

## Dpkg

上面的工具集中于管理仓库中维护的包，`dpkg` 命令可以用来操作独立的 `.deb` 包。事实上，`dpkg`
工具负责了上面工具中的大部分的幕后工作。    

不同于 `apt-*` 命令，`dpkg` 不会自动处理依赖关系。   

# 更新包缓存和系统

## 更新本地包缓存

```bash
$ sudo apt-get update
```   

这个命令会从包管理工具追踪的仓库中拉取最新的可用包的列表信息。   

## 在不移除包的情况下更新包

`apt` 命令包含两种不同的更新流程，第一种更新流程会更新所有不要求组件移除的组件。下面这条命令会忽略
要求包移除的任意更新：    

```bash
$ sudo apt-get upgrade
```   

## 更新包并在必要时移除包

第二种更新流程会更新所有的包，即使是那些会有包含包移除的包更新。    

通常来说，那些在更新过程中被移除的包会被一些功能等价的东西替代，因此一般来说是安全的。    

```bash
$ sudo apt-get dist-upgrade
```    

# 下载和安装包

## 包的搜索

`apt-cache search` 子命令用来搜索可用包。不过尽量确保我们本地的缓存是最新的。   

```bash
$ apt-cache search package
```    

## 从仓库中安装包

```bash
$ sudo apt-get install package
```   

可以一次性安装多个包：   

```bash
$ sudo apt-get install package1 package2
```   

如果要安装的包要求额外的依赖，通常会打印到标准输出中展示出来。   

## 从仓库中安装特定的包的版本

```bash
$ sudo apt-get install package=version
```   

## 重新配置包

许多包都包含一些 post-installation 配置脚本，会在安装完成后运行。   

如果我们希望在晚一点的时间再去运行这些配置脚本，可以使用 `dpkg-reconfigure` 命令（貌似并不是
说包安装完成后就不执行了，而是说我们可以在其他时间再跑一次这种脚本），这条命令会重新运行包说明
中指定的 post 配置脚本:   

```bash
$ sudo dpkg-reconfigure package
```    

## Perform a Dry Run of Package Actions

有时我们想要看一些命令的副作用，但是却不希望真正地提交执行命令，可以使用 `-s` 标记来模拟 simulate
命令流程。   

```bash
$ sudo apt-get install -s package
```   

## 包操作不要弹出同意与否提示

默认情况下，`aot` 会提示用户对许多过程进行确认，例如说包含额外依赖的包的安装，包的更新等。   

通过 `-y` 选项默认接受这些提示：   

```bash
$ sudo apt-get install -y package
```   

## 修复损坏的依赖和包

```bash
$ sudo apt-get install -f
```   

## 安装一个 .deb 包

```bash
$ sudo dpkg --install debfile.deb
```   

# 移除包和删除文件

## 卸载包

`apt-get remove` 命令会移除包在系统上安装的大部分文件，除了配置文件。   

## 卸载包并删除所有相关配置文件

```bash
$ sudo apt-get purge package
```   


