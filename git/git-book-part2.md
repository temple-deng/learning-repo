# 第 12 章 远程版本库

<!-- TOC -->

- [第 12 章 远程版本库](#第-12-章-远程版本库)
  - [12.1 版本库概念](#121-版本库概念)
    - [12.1.1 裸版本库和开发版本库](#1211-裸版本库和开发版本库)
    - [12.1.2 版本库克隆](#1212-版本库克隆)
    - [12.1.3 远程版本库](#1213-远程版本库)
    - [12.1.4 追踪分支](#1214-追踪分支)
  - [12.2 引用其他版本库](#122-引用其他版本库)
    - [12.2.1 引用远程版本库](#1221-引用远程版本库)
    - [12.2.2 refspec](#1222-refspec)
  - [12.3 使用远程版本库的示例](#123-使用远程版本库的示例)
    - [12.3.1 创建权威版本库](#1231-创建权威版本库)
    - [12.3.2 制作你自己的 origin 远程版本库](#1232-制作你自己的-origin-远程版本库)
    - [12.3.6 获取版本库更新](#1236-获取版本库更新)
  - [12.5 远程版本库配置](#125-远程版本库配置)
    - [12.5.1 使用 git remote](#1251-使用-git-remote)
  - [12.7 添加和删除远程分支](#127-添加和删除远程分支)
- [第 13 章 版本库管理](#第-13-章-版本库管理)
  - [13.2 发布版本库](#132-发布版本库)
    - [13.2.2 允许匿名读取访问的版本库](#1322-允许匿名读取访问的版本库)
- [第 15 章 钩子](#第-15-章-钩子)
  - [15.1 钩子](#151-钩子)
  - [15.2 可用的钩子](#152-可用的钩子)
    - [15.2.1 与提交相关的钩子](#1521-与提交相关的钩子)
    - [15.2.3 与推送相关的钩子](#1523-与推送相关的钩子)
- [第 17 章 子模块的最佳实践](#第-17-章-子模块的最佳实践)
  - [17.1 子模块命令](#171-子模块命令)

<!-- /TOC -->

远程版本库是一个引用或句柄，通过文件系统或网络指向另一个版本库。要跟踪其他版本库中的数据，Git
使用远程追踪分支。版本库中的每个远程追踪分支都作为远程版本库中特定分支的一个代理。要集成
本地修改与远程追踪分支对应的远程修改，可以建立一个本地追踪分支来建立继承的基础。   

## 12.1 版本库概念

### 12.1.1 裸版本库和开发版本库

一个版本库要么是一个裸版本库，要么是一个开发版本库。    

一个裸版本库没用工作目录，并且不应该用于正常开发。裸版本库也没有检出分支的概念。裸版本库可以简单
地看做 .git 目录的内容。   

裸版本库的角色是关键的：作为协作开发的权威焦点。其他开发人员从裸版本库中克隆和抓取，并推送更新。   

`git clone --bare` 的话会克隆一个裸的版本库，但是`git init --bare` 的话应该是创建一个
新的裸版本库。两者的区别的话 clone 下的裸版本库应该有远程版本库中的对象，但 init 的话是一个
全新的版本库。    

如果你要创建一个版本库供开发人员推送修改，那么它应该是裸版本库。实际上，这是一个更通用的最佳
实践的特殊情况，即发布的版本库应该是一个裸版本库。    

### 12.1.2 版本库克隆

在正常使用 `git clone` 命令时，原始版本库中存储在 _refs/heads/_ 下的本地开发分支，会成为
新的克隆版本库中 _refs/remotes/_ 下的远程追踪分支，原始版本库中的标签被复制到克隆版本库中，然而，
版本库特定的信息，如原始版本库中的钩子、配置文件、引用日志和储藏都不在克隆中重现。    

Git 还用默认的 fetch refspec 配置默认的 origin 版本库：   

`fetch = +refs/heads/*:refs/remotes/origin/*`   

建立 refspec 预示你要通过从原始版本库中抓取变更来持续更新本地版本库。在这种情况下，远程版本库的分支
在克隆版本库中是可用的，只要在分支名前面加上 origin/ 前缀。    

### 12.1.3 远程版本库

使用 `git remote` 命令创建、删除、操作和查看远程版本库。你引入的所有远程版本库都记录在 .git/config
中，可以用 git confit 来操作。   

除了 `git clone` 之外，跟远程版本库有关的其他常见的 Git 命令有：    

+ `git fetch`: 从远程版本库抓取对象及其相关的元数据。
+ `git pull`: 跟`git fetch` 类似，但合并修改到相应的本地分支。
+ `git push`: 转移对象及其相关的元数据到远程版本库。   
+ `git ls-remote`: 显示一个给定的远程版本库的引用列表。    

### 12.1.4 追踪分支

+ 远程追踪分支与远程版本库相关联，专门用来追踪远程版本库中每个分支的变化。
+ 本地追踪分支与远程追踪分支相配对。它是一种集成分支，用于收集本地开发和远程追踪分支中的变更。
+ 任何本地的非追踪分支通常称为特性或开发分支。
+ 最终，为了完成命名空间，远程分支是一个设在非本地的远程版本库的分支。很可能是远程追踪分支的上游源。   

因为远程追踪分支专门用于追踪另一个版本库的变化，所有你应该把它们当做是只读的。不应合并或提交到
一个远程追踪分支。这样做会导致远程追踪分支变得和远程版本库不同步。     

## 12.2 引用其他版本库

为了协调你的版本库和其他版本库，可以定义一个远程版本库，这里是指存在版本库配置文件中的一个实体名。
它是由两个不同的部分组成的。第一部分以 URL 的形式指出其他版本库的名称，第二部分称为 refspec,
指定一个引用（通常表示一个分支）如何从一个版本库的命名空间映射到其他版本库的命名空间。   

### 12.2.1 引用远程版本库

从技术上讲，Git 的 URL 形式既不是真正的 URL，也不是 URI，但是由于命名 Git 版本库位置的通用
性，Git 的这个变体通常简称为 Git URL。   

### 12.2.2 refspec

refspec 把远程版本库中的分支名映射到本地版本库中的分支名。    

因为 refspec 必须同时从本地版本库和远程版本库指定分支，所以完整的分支名在 refspec 中是很常见的，
通常也是必须的。在 refspec 中，你通常会看到开发分支名有 refs/heads/前缀，远程追踪分支名有
refs/remotes/ 前缀。   

refspec 语法：    

`[+]source:destination`    

如果有加号则表示不会在传输过程中进行正常的快进安全检查。星号允许用有限形式的通配符匹配分支名。     

在某些应用中，源引用是可选的；在另一些应用中，冒号和目标引用是可选的。   

refspec 在 `git fetch` `git push` `git pull` 中都使用。refspec 中的数据流如下：    


操作 | 源 | 目标
---------|----------|---------
 push | 推送的本地引用 | 更新的远程引用
 fetch | 抓取的远程引用 | 更新的本地引用
    
假如 `git fetch` 使用了如下的引用：`+refs/heads/*:refs/remotes/remote/*`。   

此处的 refspec 可以这样解释：在命名空间（这应该是指远程库的命名空间） _refs/heads/_ 中来自
远程版本库的所有源分支映射到本地版本库，使用由远程版本库名来构造名字，并放在_refs/remotes/remote_ 
的命名空间中。    

假如在 `git push` 操作时有如下引用：`+refs/heads/*:refs/heads/*`。      

此处的 refspec 可以这样解释：从本地版本库中，将源命名空间 _refs/heads/_ 下发现的所有分支名，放在
远程版本库的目标命名空间 _refs/heads/_ 的匹配分支中，使用相似的名字来命名。    

如果在执行 `git push` 时没有指定 refspec，首先，如果命令种没有明确指定的远程版本库，Git 会假设
我们使用 origin。如果没有 refspec，`git push` 会将你的提交发送到远程版本库中你与上游版本库共存
的分支。不在上游版本库中的任何本地分支都不会发送到上游：分支必须存在，并且名字匹配。因此，新分支名
必须显式地用分支名来推送。    

## 12.3 使用远程版本库的示例

### 12.3.1 创建权威版本库

假设你要在 ~/pubilc_html 下已经是 Git 版本库的网站内容上工作，那么复制 ~/public_html 版本库，
并把它放在 /tmp/Depot/public_html.git 下。   

```bash
$ cd /tmp/Depot/
$ git clone --bare ~/public_html public_html.git
```   

### 12.3.2 制作你自己的 origin 远程版本库

`$ git remote add origin /tmp/Depot/pubilc_html` 为了方便起见，.git 后缀不是必需的，
加或不加都是有效的。   

### 12.3.6 获取版本库更新

完整的 `git pull` 命令允许指定版本库和多个 refspec: `git pull <remote> refspecs`。   

如果不在命令行上指定版本库，则使用默认的 origin 远程版本库。如果你没有在命令行上指定 refspec，
则使用远程版本库的抓取（fetch）refspec。如果指定版本库，但没有指定 refspec，Git 会抓取
远程版本库的 HEAD 引用。   

`git pull` 操作有两个根本步骤，每个步骤都由独立的 Git 命令实现。也就是说，`git pull` 意味
着先执行 `git fetch`，然后执行 `git merge` 或 `git rebase`。默认情况下，第二个步骤是
`git merge`。   

在最开始的抓取步骤中，Git 先定位远程版本库。因为在命令行中没有直接指定一个版本库的 URL 或远程
版本库名，所以就假定默认的远程版本库名为 origin。该远程版本库的信息在配置文件中：   

```
[remote "origin"]
        url = /tmp/Depot/public_html.git
        fetch = +refs/heads/*:refs/remotes/origin/*
```   

由于没有在命令行中指定 refspec，Git 会使用 remote 条目中所有 “fetch=” 的行。因此，将抓取
远程版本库中的每个 refs/heads/* 分支。   

在拉取操作的第二步，Git 会执行 merge 或 rebase。Git 是如何知道合并哪些特定的分支呢？也是根据
配置文件：   

```
[branch "master"]
        remote = origin
        merge = refs/heads/master
```    

这给了 Git 两条关键信息：当 master 分支是当前检出分支时，使用 origin 作为 fetch(或pull)
操作过程中获取更新的默认远程版本库。此外，在 git pull 的 merge 步骤中，用远程版本库中的
refs/heads/master 作为默认分支合并到 master 分支。   

## 12.5 远程版本库配置

Git 为建立和维护远程版本库信息提供了三种机制：`git remote` 命令、`git config` 命令和直接
编辑 .git/config` 文件。所有这三种机制的最终结果都体现在 .git/config 文件记录的配置信息上。   

### 12.5.1 使用 git remote

除了操作远程版本库名及其引用之处，也可以更新或更改远程版本库的 URL：   

`$ git remote set-url origin git://repos.example.com/stuff.git`   

## 12.7 添加和删除远程分支

由于一系列的默认行为，下面的命令有相同的效果：   

```bash
$ git push upstream new_dev
$ git push upstream new_dev:new_dev
$ git push upstream new_dev:refs/heads/new_dev
```   

推送使用只有目标引用的 refspec 导致目标引用从远程版本库中删除。为了指明该引用是目标，冒号
分隔符必须显示指定：   `$ git push origin :foo`   

如果不喜欢 :branch 的形式，可以使用语法上等价的形式：`$ git push origin --delete foo`   

# 第 13 章 版本库管理

## 13.2 发布版本库

Git 并没有尝试区管理访问权限，而是把这个问题留给了其他工具，比如，SSH 可能更适合这个任务。只要
有版本库的 UNIX 访问权限，要么通过 SSH 并执行 cd 命令切换到该版本库，要么切换你拥有直接 rwx
访问权限的版本库，就可以提交到该版本库。   

### 13.2.2 允许匿名读取访问的版本库

如果你想共享代码，那么你可能要建立一个宿主服务器来发布版本库并允许别人克隆。所有开发人员往往
只需要匿名的只读访问权限来从这些版本库中克隆或抓取。一个常见的简单解决方案是使用 git-deamon
或 HTTP 守护进程来将它们导出。    

建立 git-daemon 允许我们使用 Git 原生协议导出版本库。   

必须通过某种方式把版本库标记为“可以导出”。通常情况下，可以通过在裸版本库的顶级目录创建
git-deamon-export-ok 文件来实现。这种机制可以让我们对通过守护进程导出的版本库有更细粒度
的控制。   

为了避免单独标记每个版本库，也可以在运行 git-daemon 命令时加上 --export-all 选项来发布
所有在它的目录列表中可识别的（拥有 objects 和 refs　子目录）的版本库。　　　

在服务器建立 git-daemon　的一种常见方式是将它作为一个 inetd　服务启用。这需要在我们的
/etc/services 目录中确保有 Git 的条目。它的默认端口是 9418，一条典型的条目大概如下所示：   

`git   9418/tcp  # Git Version Control System`   

一旦将这一行添加至 /etc/services 中，就必须要在 /etc/inted.conf 中建立条目来指定
git-daemon 应该怎样调用。   

```
# 把这些放到 /etc/inetd.conf 中的一行里

git stream tcp nowait nobody /usr/bin/git-daemon
        git-daemon --inted --verbose --export-all
        --base-path=/pub/git
```   

如果使用 xinetd 而不是 inetd，那么需要在 /etc/xinetd.d/git-daemon 文件中加入相似的
配置信息。    

```
# description: The git server offsers access to git repositories
service git
{
  disable               = no
  type                  = UNLISTED
  port                  = 9418
  socket_type           = stream
  wait                  = no
  user                  = nobody
  server                = /usr/bin/git-daemon
  server_args           = --inetd --export-all --base-path=/pub/git
  log_on_failure        += USERID
}
```    

# 第 15 章 钩子

Git 钩子(hook)，任何时候当版本库中出现如提交或补丁这样的特殊事件时，都会触发执行一个或多个任意
的脚本。通常情况下，一个事件会分解成多个规定好的步骤，可以为每个步骤绑定自定义脚本。当 Git 事件
发生时，每一步开始都会调用相应的脚本。   

钩子只属于并作用于一个特定的版本库，在克隆操作时不会复制。如果由于某些原因，你的开发进程要在每个
人的个人开发版本库中设置钩子，就要使用一些其他方法来复制 .git/hooks 目录。   

大多数钩子属于两类：   

+ 前置(pre)钩子会在动作完成前调用。要在变更应用前进行批准、拒绝或者调整操作，可以使用这种钩子
+ 后置(post)钩子会在动作完成之后调用，它常用来触发通知或者进行额外处理，如执行构建或关闭 bug。   

通常情况下，如果前置钩子以非零状态退出，那么 Git 的动作会中止。相比之下，后置钩子的结束状态总是
被忽略。    

## 15.1 钩子

每个钩子都是一个脚本，作用于一个特定版本库的钩子集合都能在 .git/hooks 目录下面找到。每个钩子
都是以它相关联的事件来命名的。一个钩子脚本必须遵循 UNIX 脚本的基本规范：它必须是可执行的，同时
必须在首行指明该脚本使用的语言。   

## 15.2 可用的钩子

### 15.2.1 与提交相关的钩子

所以提交钩子都是为 `git commit` 服务的。例如，`git rebase`, `git merge` 都默认不执行提交
钩子。   

![commit-hooks](https://raw.githubusercontent.com/temple-deng/markdown-images/master/other/commit-hooks.png)   

+ pre-commit-msg 钩子能让我们在 Git 的默认消息展示给用户前做出修改。例如，可以用来修改默认
的提交消息模板。
+ commit-msg 钩子能能够在用户编辑后验证或修改提交消息。
+ post-commit 钩子在提交操作完成之后执行。    

### 15.2.3 与推送相关的钩子

当执行 `git push` 时，Git 的接收端会执行如下的过程。   

![push-hooks](https://raw.githubusercontent.com/temple-deng/markdown-images/master/other/push-hooks.png)   

# 第 17 章 子模块的最佳实践

## 17.1 子模块命令

+ `git submodule add address localdirectoryname` 为这个上层项目注册一个新的子模块，并
可选地将其在特定的文件夹名中表示出来。
+ `git submodule status` 总结这个项目的所有子模块的提交引用和脏状态
+ `git submodule init` 使用子模块信息长期存储的 .gitmodules 来更新开发人员版本库的
.git/config 文件
+ `git submodule update` 使用 .git/module 中的地址抓取子模块的内容，并在分离的 HEAD
指针状态下检查上层项目的子模块记录引用。
+ `git submodule summary` 展示每个子模块当前状态相对于提交状态间变化的补丁
+ `git submodule foreach command` 对每一个子模块执行一条 shell 命令    

