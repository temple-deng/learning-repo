# Git 版本控制管理

<!-- TOC -->

- [Git 版本控制管理](#git-版本控制管理)
- [第3章 起步](#第3章-起步)
  - [3.1 Git 命令行](#31-git-命令行)
  - [3.2 快速入门](#32-快速入门)
  - [3.3 配置文件](#33-配置文件)
- [第4章 基本的 Git 概念](#第4章-基本的-git-概念)
    - [4.1.1 版本库](#411-版本库)
    - [4.1.2 Git 对象类型](#412-git-对象类型)
    - [4.1.3 索引](#413-索引)
    - [4.1.4 可寻址内容名称](#414-可寻址内容名称)
    - [4.1.5 Git 追踪内容](#415-git-追踪内容)
    - [4.1.7 打包文件](#417-打包文件)
  - [4.2 对象库图示](#42-对象库图示)
  - [4.3 Git 在工作时的概念](#43-git-在工作时的概念)
    - [4.3.1 进入 .git 目录](#431-进入-git-目录)
    - [4.3.3 文件和树](#433-文件和树)
    - [4.3.7 标签](#437-标签)
- [第5章 文件管理与索引](#第5章-文件管理与索引)
  - [5.1 关于索引的一切](#51-关于索引的一切)
  - [5.3 使用 git add](#53-使用-git-add)
  - [5.5 使用 git rm](#55-使用-git-rm)
  - [5.8 .gitignore 文件](#58-gitignore-文件)
  - [5.9 Git 中对象模型和文件的详细视图](#59-git-中对象模型和文件的详细视图)
- [第6章 提交](#第6章-提交)
  - [6.2 识别提交](#62-识别提交)
    - [6.2.2 引用和符号引用](#622-引用和符号引用)
    - [6.2.3 相对提交名](#623-相对提交名)
  - [6.3 提交历史记录](#63-提交历史记录)
    - [6.3.1 查看旧提交](#631-查看旧提交)
    - [6.3.3 提交范围](#633-提交范围)
  - [6.4 查找提交](#64-查找提交)
    - [6.4.1 使用 git bisect](#641-使用-git-bisect)
    - [6.4.2 使用 git blame](#642-使用-git-blame)
- [第7章 分支](#第7章-分支)
  - [7.2 分支名](#72-分支名)
  - [7.3 使用分支](#73-使用分支)
  - [7.4 创建分支](#74-创建分支)
  - [7.5 列出分支名](#75-列出分支名)
  - [7.6 查看分支](#76-查看分支)
  - [7.7  检出分支](#77--检出分支)
    - [7.7.3 合并变更到不同分支](#773-合并变更到不同分支)
    - [7.7.5 分离 HEAD 分支](#775-分离-head-分支)
    - [7.7.6 删除分支](#776-删除分支)
- [第8章 diff](#第8章-diff)
  - [8.1 git diff 的命令格式](#81-git-diff-的命令格式)
  - [8.3 git diff 和提交范围](#83-git-diff-和提交范围)
  - [8.4 路径限制的 git diff](#84-路径限制的-git-diff)
- [第9章 合并](#第9章-合并)
  - [9.1 合并的例子](#91-合并的例子)
  - [9.2 处理合并冲突](#92-处理合并冲突)
    - [9.2.3 Git 是如何追踪冲突的](#923-git-是如何追踪冲突的)
    - [9.2.5 中止或重新启动合并](#925-中止或重新启动合并)
  - [9.3 合并策略](#93-合并策略)
    - [9.3.1 退化合并](#931-退化合并)
    - [9.3.2 常规合并](#932-常规合并)
    - [9.3.3 特殊提交](#933-特殊提交)
  - [9.4 压制合并](#94-压制合并)
- [第 10 章 更改提交](#第-10-章-更改提交)
  - [10.1 关于修改历史记录的注意事项](#101-关于修改历史记录的注意事项)
  - [10.2 使用 git reset](#102-使用-git-reset)
  - [10.3 使用 git cherry-pick](#103-使用-git-cherry-pick)
  - [10.4 使用 git revert](#104-使用-git-revert)
  - [10.5 reset, revert 和 checkout](#105-reset-revert-和-checkout)
  - [10.7 变基提交](#107-变基提交)
    - [10.7.1 使用 git rebase -i](#1071-使用-git-rebase--i)
- [第 11 章 储藏和引用日志](#第-11-章-储藏和引用日志)
  - [11.1 储藏](#111-储藏)
  - [11.2 引用日志](#112-引用日志)

<!-- /TOC -->

```git

git config --unset user.name
// 取消某项设置，应该是可以加 --global 或者 --system 来取消全局或者系统级别
// 的设置

git cat-file
// 这个命令可以查看仓库对象的内容或者类型和尺寸等信息
git cat-file -p <object>   // 基于对象的类型打印出对象的内容

git rev-parse <hash prefix>  // 根据对象一部分名称检索出整个对象名

git ls-files    // 展示暂存区和工作树中文件的信息

options:  

-c, --cached ： 展示缓存的文件（默认）
-d, --deleted : 展示删除了的文件
-m, --modified : 展示修改了的文件
-s, --staged : 展示暂存的内容的文件名字，模式位与暂存number

git write-tree // 从当前索引创建一个树对象
```    

# 第3章 起步

## 3.1 Git 命令行

```shell
$ git
usage: git [--version] [--help] [-C <path>] [-c name=value]
           [--exec-path[=<path>]] [--html-path] [--man-path] [--info-path]
           [-p | --paginate | --no-pager] [--no-replace-objects] [--bare]
           [--git-dir=<path>] [--work-tree=<path>] [--namespace=<name>]
           <command> [<args>]

There are common Git commands used in variour situations:

start a working area
  clone         Clone a repository into a new directory
  init          Create an empty Git repository or reinitialize an existing one

work on the current change
  add           Add file contents to the index
  mv            Move or rename a file, a directory, or a symlink
  reset         Reset current HEAD to the specified state
  rm            Remove files from the working tree and from the index

examine the history and state
  bisect        Use binary search to find commit that introduced a bug
  grep          Print lines matching a pattern
  log           Show commit logs
  show          Show various types of objects
  status        Show the working tree status

grow, mark and tweak your commit history
  branch        List, create, or delete branches
  checkout      Switch branches or restore working tree files
  commit        Record changes to repository
  diff          Show changes between commits, commit and working tree, etc
  merge         Join two or more development histories together
  rebase        Forward-port local commits to the updated upstream head
  tag           Create, list, delete or verify a tag object signed with GPG

collaborate
  fetch         Download objects and refs from another repository
  pull          Fetch from and integrate with another repository or a local branch
  push          Update remote refs along with associated objects
```    

可以通过 “裸双破折号” 的约定来分离一系列参数。例如，使用双破折号来分离命令行的控制部分和操作数
部分，如文件名 `$ git diff -w master origin -- tools/Makefile`   

## 3.2 快速入门

配置 commit 编辑器 `$ export GIT_EDITOR=vim`。   

可以用 `git config` 命令在配置文件里保存身份。   

```bash
$ git config user.name "Joh Loeliger"
$ git config user.email "jdl@example.com"
```   

也可以使用 GIT_AUTHOR_NAME 和 GIT_AUTHOR_EMAIL 环境变量来告诉 Git 你的姓名和 email 地址，
这些变量一旦设置就会覆盖所有的配置设置。   

当在命令行直接提交一个命名的文件时 `$ git commit index.html`，文件的变更会自动捕捉。而没有
使用命名文件的一般 git commit 就不会在这种情况下起作用。   

## 3.3 配置文件

Git 的配置文件全部是简单的 .ini 文件风格的文本文件。记录了很多 Git 命令使用的各种选项和设置。有的
设置表示纯个人喜好，有些则是对版本库的正常运作非常重要，再之外的一些设置会稍微改变命令的行为。   

Git 支持不同层次的配置文件，按照优先级递减排序为：   

+ .git/config: 版本库的特定配置，可用 --file 选项修改，是默认选项。
+ ~/.gitconfig: 用户特定的配置设置，可用 --global 选项修改。
+ /etc/gitconfig: 系统范围的配置设置，可用 --system 修改。    

可以用 --unset 选项来移除设置：   

`$ git config --unset --global user.email`     

配置命令别名：   

`$ git config --global alias.show-graph "log --graph --abbrev-commit --pretty=oneline"`    

从这里大致能看出命令行的一般输入方式，长选项 --option 的值通常是 `--option=xxx` 的形式，
而短选项通常是 `-o xxx` 的格式，而一些非选项的名字和值通常是空格分隔 `user.name "xxx"`.   

# 第4章 基本的 Git 概念

### 4.1.1 版本库

在版本库中，Git 维护两个主要的数据结构：对象库和索引。对象库在复制操作时能进行有效复制，索引是暂时的信息，
对版本库来说是私有的。    

### 4.1.2 Git 对象类型

对象库（注意是对象库不是版本库）是 Git 版本库实现的心脏。它包含你的原始数据文件和所有日志消息、作者信息、日期，
以及其他用来重建项目任意版本或分支的信息。   

Git 放在对象库里的对象只有4中类型：块(blob)、目录树(tree)、提交(commit)和标签(tag)。这4种原子对象
构成 Git 高层数据结构的基础。    

+ 块(blob)   

文件的每一个版本表示为一个块(blob)。一个 blob 保存一个文件的数据，但不包含任何关于这个文件的元数据，
甚至连文件名也没有（文件名应该是在树对象中）。    

+ 目录树（tree）    

一个目录树代表一层目录信息。它记录 blob 标识符、路径名和在一个目录里所有文件的一些元数据（应该
就是一串数字，包括一些权限的数据，剩下的还不知道）。它也可以递归引用其他目录树或子树对象，从而
建立一个包含文件和子目录的完整层次结构。    

+ 提交对象（commit）    

一个提交对象保存版本库中每一次变化的元数据，包括作者、提交者、提交日期和日志消息。每一个提交
对象指向一个目录树对象，这个目录树对象在一张完整的快照中捕获提交时版本库的状态，大多数提交都有
一个父提交。    

+ 标签（tag）    

一个标签对象分配一个任意的且人类可读的名字给一个特定对象，通常是一个提交对象。    

随着时间的推移，所有信息在对象库中会变化和增长，项目的编辑、添加和删除都会被跟踪和建模，为了
有效地利用磁盘空间和网络带宽，Git把对象压缩并存储在打包文件（pack file）中，这些文件也在对象库里。    

貌似这4种对象都是二进制文件，所以直接 cat 看的话是乱码，可以使用 `git cat-file -p <hash>` 来
查看文件的内容，`-p` 选项是根据文件的类型来打印文件的内容。    

blob 对象通常就是文件的内容，树对象像下面这样子：    

```
100644 blob f169027b8........  .babelrc
100644 blob 3d8b7ec..........  .eslintrc
040000 tree 28b16c56.........  admin
040000 tree aea1e5a2.........  client
100644 blob e9f31274.........  index.js
```    

提交对象的话是这个样子：   

```
tree 35dbbe69...........
parent 489696bd..........
author dengbo <dengbo@unitedstack.com> 1510303212 +0800
committer Rookie <731401082@qq.com> 1510308099 -0600

bug fix
```   

话说作者和提交者后面那两段内容我也不知道什么意思。    

### 4.1.3 索引

索引也是一个临时的、动态的二进制文件，它描述整个版本库的目录结构。更具体地说，索引捕获项目
在某个时刻的整体结构的一个版本。项目的状态可以用一个提交和一颗目录树来表示，它可以来自项目历史
中的任意时刻，或者它可以是你正在开发的未来状态。使用 `git ls-files` 命令查看。    

```
git ls-files -s 通常是如下的样子

100644 <hash> 0 filename
100644 <hash> 0 filename
```   

注意是没有树类型的，子目录也是直接记录子目录内文件的位置，而且 -s 选项是查看已暂存的文件，但是应该
是版本库所有已经暂存过的文件，应该是一个递增的文件，以前暂存的文件也会在其中而不仅仅是当前的暂存文件。     

### 4.1.4 可寻址内容名称

Git 对象库被组织及实现成一个内容寻址的存储系统。具体而言，对象库中的每个对象都有一个唯一的名称，
这个名称是向对象的内容应用 SHA1 得到的 SHA1 散列值。  

### 4.1.5 Git 追踪内容

Git 的内容追踪主要表现为两种关键的方式，首先，Git 的对象库基于对象内容的散列计算的值，而不是
基于用户原始文件布局的文件名或目录名设置。因此，当 Git 放置一个文件到对象库的时候，它基于数据
的散列值而不是文件名。事实上，Git 并不追踪那些与文件次相关的文件名或者目录名。再次强调，Git
追踪的是内容而不是文件。    

如果两个文件的内容完全一样，无论是否在相同的目录，Git 在对象库里只保存一份 blob 形式的内容副本。如果
这些文件中的一个发生了变化，Git 会为它计算一个新的 SHA1 值，识别出它现在是一个不同的 blob 对象，
然后把这个新的 blob 加到对象库里。原来的 blob 在对象库里保持不变，为没有变化的文件所使用。   

其次，当文件从一个版本变到下一个版本的时候，Git 的内部数据库有效地存储文件的每个版本，而不是它们的差异。     

### 4.1.7 打包文件

Git 使用了一种叫做打包文件（pack file）的有效的存储机制。要创建一个打包文件，Git 首先定位内容非常相似的
全部文件，然后为它们之一存储整个内容，之后计算相似文件之间的差异并只存储差异。    

## 4.2 对象库图示

blob 对象是数据结构的“底端”，它什么也不引用而且只被树对象引用。在接下来的图里，每个 blob 由
一个矩形表示。    

tree 对象指向若干 blob 对象，也可能指向其他 tree 对象。许多不同的提交对象可能指向任何的 tree
对象。每个 tree 对象由一个三角形表示。   

一个圆圈表示一个 commit 对象，一个 commit 对象指向一个特定的 tree 对象，并且这个 tree 对象
是由 commit 对象引入版本库的。   

每个标签由一个平行四边形表示。每个标签可以指向最多一个 commit 对象。    

![git-chart](https://raw.githubusercontent.com/temple-deng/markdown-images/master/other/git-chart.png)


## 4.3 Git 在工作时的概念

### 4.3.1 进入 .git 目录

一个初始的 git 仓库的内容与下面类似：    

```
.git/hooks
.git/hooks/commit-msg.sample
.git/hooks/applypatch-msg.sample
....
.git/refs
.git/refs/heads
.git/refs/remotes
.git/refs/tags
.git/refs/stash
.git/config
.git/objects
.git/objects/pack
.git/objects/info
.git/HEAD
.git/branches
.git/info
.git/info/exclude
```   

Git 提供了一个命令通过对象的唯一前缀来查找对象的散列值：`git rev-parse <hash-prefix>`    

### 4.3.3 文件和树

当使用 Git add 命令时，Git 会给添加的每个文件的内容创建一个对象（也不见得吧，万一对象库中已经有一个
相同内容的对象就应该不会生成吧），但它不会马上为树创建一个对象。记得前面说过，树对象是提交对象
引入版本库的，和这里说的一致。相反，索引更新了。索引位于 .git/index中，它跟踪文件的路径名和
相应的 blob。每次执行命令的时候，Git 会用新的路径名和 blob 信息来更新索引。   

任何时候，都可以从当前索引创建一个树对象，只要通过底层的 `git write-tree` 命令来捕获索引
当前信息的快照就可以了。   

生成树对象后，可以通过 `git commit-tree` 命令生成提交对象：   

```
$ echo -n "Commit a file that says hello\n" \
| git commit-tree 492413269....
```   

所以 `git cat-file` 是一个用来查看对象库中文件的命令，因为对象库中的文件都是二进制形式的，
所以我们无法直接查看，只能使用这个名，-t 是查看文件的类型，-p 是基于文件的类型输出文件的内容。   

`git ls-files` 是用来查看当前索引和工作区中文件及对应的 blob 对象的对应关系的，-s 是查看
staged 的对象，也就是已缓存的。   

### 4.3.7 标签

轻量级标签只是一个提交对象的引用，通常被版本库视为私有的。这些标签并不在版本库里创建永久对象。
带标注的标签则更加充实，并且会创建一个对象。它包含你提供的一条消息，并且可以根据 RFC4880 来
使用 GnuPG 密钥进行数字签名。  

`$ git tag -m "Tag Version 1.0" V1.0 3ede462`   

注意 `-m` 隐含着创建附注标签的 `-a`，貌似除非打标签的时候不加任何选项，否则都是附注标签。    

```bash
$ git rev-parse V1.0
6b608c1093943939ae78348117dd18b1ba151c6a

$ git cat-file -p 6b608c
object 3ede4622cc241bcb09683af36360e7413b9ddf6c
type commit
tag V1.0
tagger Jon	Loeliger	<jdl@example.com>	Sun	Oct	26	17:07:15	2008	-0500

Tag version 1.0
```   

# 第5章 文件管理与索引

## 5.1 关于索引的一切

Git 的索引不包含任何文件内容，它仅仅追踪你想要提交的那些内容。当执行 `git commit` 的时候，
Git 会通过检查索引而不是工作目录来找到提交的内容。   

## 5.3 使用 git add

在发出 `git add` 命令时每个文件的内容都将被复制到对象库中，并且按文件名的 SHA1 名来索引。    

## 5.5 使用 git rm

Git 可以从索引或者同时从索引和工作目录中删除一个文件。Git 不会只从工作目录中删除一个文件，那是
普通 rm 命令的工作。注意其实索引就是当前仓库的一份快照，树对象都是依照索引构建的。    

`git rm --cached <file>` 会删除索引中的文件并把它保留在工作目录中，而 `git rm <file>` 会将
文件从索引和工作目录中都删除。    

## 5.8 .gitignore 文件

.gitignore 文件的格式如下：   

+ 空行会被忽略，而已井号 # 开头的行可以用于注释。然而，如果 # 更在其他文本后面，它就不表示注释了
+ 一个简单的字面值文件名匹配任何目录中的同名文件
+ 目录名由末尾的反斜线 (/) 标记。这能匹配同名的目录和子目录，但不匹配文件。注意这里说的很清楚，
必须是个目录名才能匹配子目录。而作为文件路径一部分的目录是不行的。比如 `debug/32bit/*.o` 是
不能匹配 `abc/debug/32bit/*.o` 的
+ 包含 shell 通配符，如星号 \*，这种模式可扩展为 shell 通配模式。
+ 起始的感叹号 ! 会对该行其余部分的模式进行取反。此外，被之前模式排除但被取反规则匹配的文件
是要包含的。取反模式会覆盖低优先级的规则。   

此外，Git 允许在版本库中任何目录下有 .gitignore 文件。每个文件都只影响该目录及其所有的子目录。
.gitignore 的规则也是级联的：可以覆盖高层目录中的规则，只要在其子目录包含一个取反模式。   

Git 按照下列从高到低的优先顺序：   
 
+ 在命令行上指定的模式
+ 从相同目录的 .gitignore 文件中读取的模式
+ 上层目录中的模式，向上进行
+ 来自 .git/info/exclude 文件的模式
+ 来自配置变量 core.excludedfile 指定的文件中的模式   

如果排除模式某种程度上特定于你的版本库，并且不应该适用于其他人复制的版本库，那么这个模式应该
放到 .git/info/exclude 文件里，因为它在复制操作期间不会传播。格式与 .gitignore 一致。    

## 5.9 Git 中对象模型和文件的详细视图    

提交会启动三个步骤。首先，虚拟树对象（即索引）在转换成一个真实的树对象后，会以 SHA1 命名，然后放到对象
库中。其次，用你的日志消息创建一个新的提交对象。新的提交将会指向新创建的树对象以及前一个或父提交。最后，
master 分支的引用从最近一次提交移动到新创建的提交对象，成为新的 master HEAD。    

注意索引树的结构和树对象还是有差别的，主要是子目录在树对象中直接用一个子树对象表示了，而索引树是用
类似 `subdir/filename` 的文件名表示了。也就说索引中是不保存目录的。    

下面是自己的一些看法。假设我们`git init` 初始化一个空的仓库，然后新建两个文件 *file1*, *file2*，
此时工作树中应该理论上有两个对应的 blob 对象，而索引是空的，所以当我们使用 `git status` 时，索引和
工作树一比较，发现有两个新的文件，那么就标记为未追踪的，而当我们使用 `git add` 暂存了这两个
文件后，Git 会生成两个 blob 对象，并在索引中建立路径到 blob 的指向条目。    

之后假如我们提交了这两个文件，之后又修改了 *file1*，那么现在工作树与索引中对应文件名的 blob 对象
就是不一致的了，当我们使用 `git status` 查看时，git 会发现一个相同文件名的文件但是blob 对象的
hash不一致，就可以标记为 _modified_。    

同理当我们 `git rm` 删除一个文件后，git 会发现工作区中少了一个索引中的 blob 对象，就可以标记成
_removed_，如果是改名或者移动，索引也可以发现一个相同 blob 变成了另外的名字，也可以标记成 _renamed_。     

# 第6章 提交

当提交时，Git 会记录索引的快照并把快照放进对象库（其实应该是依据索引建立的 tree 对象放进对象
库把）。Git 会将当前索引的状态与之前的快照做一个比较（应该是不同 tree 对象之间的比较），并派生
出一个受影响的文件和目录列表。Git 会为任何有变化的文件创建新的 blob 对象（话说 blob 对象不是
在 add 操作时建立的吗），对有变化的目录创建新的树对象。   

## 6.2 识别提交   

唯一的 40 位十六进制 SHA1 提交 ID 是显式引用，而始终指向最新提交的 HEAD 则是隐式引用。   

### 6.2.2 引用和符号引用

引用（ref)是一个 SHA1 散列值，指向 Git 对象库中的对象。虽然一个引用可以指向任何 Git 对象，
但是它通常指向提交对象。符号引用或称为 symref 间接指向 Git 对象。它仍然是一个引用。   

这里应该是这个意思，SHA1 值代表一个显示的引用，直接指向了一个对象，而其他的一些引用则都是隐式
或者叫符号引用，它们应该是直接指向了一个 SHA1 值，而这个 SHA1 值才是直接指向了某个对象。      

本地特性分支名称、远程跟踪分支名称和标签名都是引用。    

每一个符号引用都有一个以 ref/ 开始的明确全称（这里感觉有错误啊，因为好像并没有见过 ref/ 这个结构，
应该是 refs/ 吧），并且都分层存储在版本库的 .git/refs/ 目录中。目录中基本上有三种不同的命名
空间代表不同的引用：refs/heads/_ref_ 代表本地的分支，refs/remotes/_ref_ 代表远程的分支
（注意其实也是目录结构的，比如origin/master），refs/tags/_ref_ 代表标签。正好和上面提到的
本地分支、远程分支和标签一一对应。   

例如，一个叫做 dev 的本地特性分支就是 refs/heads/dev 的缩写。因为远程跟踪分支在 refs/remotes/
命名空间中，所以 origin/master 实际上是 refs/remotes/origin/master。最后，标签 v2.6.23
就是 refs/tags/v2.6.23。   

注意这些符号引用文件都是普通的文本文件，直接查看的话可以看到内容其实就是一段 SHA1 码。   

Git 自动维护几个用于特定目的的特殊符号引用。（注意它们貌似大部分情况下都是符号引用，但有一些特殊的情况
会暂时变为直接的引用）。这些引用可以在使用提交的任何地方使用。    

+ HEAD: HEAD 始终指向当前分支的最近提交。当切换分支时，HEAD 会更新为指向新分支的最近提交。
+ ORIG_HEAD: 某些操作，例如合并和复位（reset），会把调整为新值之前的先前版本的HEAD 记录到 ORIG\_HEAD
中。
+ FETCH_HEAD: 当使用远程库时，git fetch 命令会将所有抓取分支的头记录到 .git/FETCH\_HEAD 中。
FETCH_HEAD 是最近抓取的分支 HEAD 的简写，并且仅在刚刚抓取操作之后才有效。
+ MERGE_HEAD: 当一个合并操作正在进行时，其他分支的头暂时记录在 MERGE\_HEAD 中。    

### 6.2.3 相对提交名

Git 还提供另一种机制来确定相对于另一个引用的提交，通常是分支的头。   

在同一代提交中，插入符号 ^ 是用来选择不同的父提交的。给定一个提交 C，C^1 是其第一个父提交，C^2 是其第
二个父提交，C^3 是其第三个父提交。   

![multi-parent-commit](https://raw.githubusercontent.com/temple-deng/markdown-images/master/other/multi-parent-commit.png)  

波浪线 ~ 用于返回父提交之前并选择上一代提交。同样，给定一个提交 C，C~1 是其第一个父提交，C~2 是
其第一个祖父提交，也就是第一个父提交的第一个父提交，C~3 是其第一个曾祖父提交。   

![multi-parent-commit](https://raw.githubusercontent.com/temple-deng/markdown-images/master/other/multi-parent-commit2.png)  

Git 也支持其他形式的简写和组合。如 C^ 和 C~ 两种简写形式分别等同与 C^1 和 C~1。另外 C^^ 和 C^1^1
相同。     

git rev-parse 命令最终决定将任何形式的提交名——**标签、相对名、简写或绝对名称**——转换成对象库中实际
的、绝对的提交散列 ID。    

## 6.3 提交历史记录

### 6.3.1 查看旧提交

默认情况下，`git log` 和 `git log HEAD` 是一致的。如果我们提供一个提交名（如 `git log commit`），
那么这个日志将从该提交开始回溯输出。    

限制历史记录的一种技术是使用 since..until 这样的形式来指定提交的范围。    

`$ git log --pretty=short --abbrev-commit master~12..master~10`   

这个可以查看主分支之前第 10 次和第 11 次提交，这样的话意思是左开右闭的区间。   

前面的例子还引入了两个格式选项 --pretty=short 和 --abbrev-commit。前者调整了每个提交的信息数量，
并且还有其他几个选项，包括 oneline, full。后者只是简单地请求缩写散列 ID。   

-n 可以来将输出限制为最多 n 和提交。--stat 选项列举了提交中所更改文件以及每个更改的文件中有多少行做了改动。   

### 6.3.3 提交范围

许多 Git 命令都允许指定提交范围。在最简单的实例中，一个提交范围就是一系列提交的简写。更复杂的
形式允许过滤提交。       

双句点(..)的形式就表示一个范围，如"开始..结束"，但是注意不包括开始的那次提交，这时一个定义问题，
提交范围 “开始。。。结束” 定义为从 “结束” 的提交可到达的和从“开始”的提交不可达的一组提交。   

使用 git log 命令并指定 Y 提交时，实际上是要求 Git 给出 Y 提交可达的所有提交日志，可以通过
表达式 ^X 排除可达提交集中特定的提交 X。   

结合这两种形式，`git log ^X Y` 就等同与 `git log X..Y`，并且可以解释为”给我从 Y 提交可达
到的所有提交，但是不要任何在 X 之前包括 X 的提交“。   

来看一组例子。以下图为例。    

![range-demo1](https://raw.githubusercontent.com/temple-deng/markdown-images/master/other/range-demo1.png)  

范围 topic..master 表示在 master 分支不在 topic 分支的提交。master 分支上提交 V 和之前
的提交都贡献到了 topic 分支中，那些提交就排除了，留下 W, X, Y, Z。    

另一种情况：    

![range-demo2](https://raw.githubusercontent.com/temple-deng/markdown-images/master/other/range-demo2.png)  

范围 topic..master 依旧代表在 master 分支但不在 topic 分支的那些提交，即在 master 分支
上 V 之前且包括 V, W, X, Y, Z 的提交集合。   

只有形如 _start..end_ 的范围才表示集合减法运算，而 A...B（三个句点）则表示 A 和 B 之前的对称差，也就是
A 或 B 可达，但又不是 A 和 B 同时可达的提交集合。    

## 6.4 查找提交  

### 6.4.1 使用 git bisect

运行 `git bisect` 命令通常为了找出某个导致版本库产生倒退或 bug 的特殊提交。这个命令在”好“提交和
”坏“提交之间选择一个新提交并确定它”是好是坏“，并据此缩小范围。直到最后，当范围内只剩下一个提交时，就
可以确定它就是那个引起错误的提交了。     

至关重要的是你要从一个干净的工作目录中启动 `git bisect`。此过程会调整你的工作目录来包含版本库
的不同版本。    

`$ git bisect start` 启动二分搜索后，Git 将进入二分模式，并为自己设置一些状态信息。Git 使用一个分离的
HEAD 来管理版本库的当前检出版本。这个分离的 HEAD 本质上是一个匿名分支。   

`git bisect bad`, `git bisect good`。   

### 6.4.2 使用 git blame

`git blame` 可以告诉我们一个文件中的每一行最后是谁修改的和哪次提交做出了变更。   

`git blame -L 35,  init/version.c`     


# 第7章 分支

## 7.2 分支名

为了支持可扩展性和分类组织，可以创建一个带层次的分支名，类似 UNIX 的路径名。例如 bug/pr-17,
bug/pr-1023。   

命名分支必须遵守一些简单的规则。    

+ 可以使用斜杠 / 创建一个分册的命名方案，但是该分支名不能以斜线结尾。
+ 分支名不能以减号 - 开头。
+ 以斜杠分割的组件不能以点 . 开头，如 featrue/.new 是无效的。
+ 分支名的任何地方都不能包含连续的两个点。
+ 此外，分支名不能包含以下内容：
  - 任何空格或其他空白字符
  - 在Git 中具有特殊含义的字符，包括波浪线，插入符^，冒号:，问号?，星号*，左方括号 [
  - ASCII 控制字符

## 7.3 使用分支

在任何给定的时间里，版本库中可能有许多不同的分支，但最多只有一个当前的或活动的分支。每个分支
在一个特定的版本库中必须有唯一的名字，这个名字始终指向该分支上最近提交的版本。一个分支的最近
提交称为该分支的头部。   

因为一个分支开始时的原始提交没有显示定义，所以这个提交可以通过从分叉出的新分支的源分支名使用
算法找到：   

`git merge-base original-branch new-branch`    

你的每一个分支名和分支上的提交的内容一样，都放在你的本地版本库中。然而，当把你的版本库提供给
他人用时，也可以发布或选择使用任意数量的分支和相关的可用提交。发布一个分支必须显示地完成。
同样，如果复制版本库，分支名和那些分支上的开发都将是新复制版本库的副本的一部分。      

## 7.4 创建分支

`git branch <branch> [starting-commiting]`    

需要注意的是，`git branch` 命令只是把分支名引进版本库。并没有改变工作目录去使用新的分支。没有
工作目录文件发生变化，没有隐式分支环境发生变化，也没有做出新的提交。这条命令只是在给定的提交上
创建一个命名的分支。可以不在这个分支上开始工作，直到 **切换** 到它。   

## 7.5 列出分支名

`git branch` 用于列出版本库中分支名。如果没有额外的参数，只列出版本库中的特性分支。可以加 -r选项
列出远程追踪分支。也可以用 -a 选项把特性分支和远程分支都列出来。   

## 7.6 查看分支

`git show-branch` 命令提供比 `git branch` 更详细的输出，按时间以递序的形式列出对一个或多个
分支有贡献的提交。与 `git branch` 一样，-r 显示远程分支，-a 显示所有分支。    

看一个例子：    

```
$ git show-branch
! [bug/pr-1] Fix Problem Report 1
 * [dev] Improve the new development
  ! [master] Added Bob's fixes
---
 * [dev] Improve the new development
 * [dev^] Start some new development
+ [bug/pr-1] Fix Problem Report 1
+*+ [master] Added Bob's fixes
``` 

`git show-branch` 的输出被一排破折号分为两部分。分隔符的上方列出分支名，并用方括号括起来，每行一个。
每个分支名跟着一行输出，前面用感叹号或星号（如果它是当前分支）标记。   

输出的下半部分是一个表示每个分支中提交的矩阵。同样每个提交后面跟着该提交日志信息的第一行。如果有
一个加号（+）、星号（*）或减号（-）在分支的列中，对应的提交就会在该分支中显示。  

算了太麻烦了，先略过。    

## 7.7  检出分支

### 7.7.3 合并变更到不同分支

在上一节中，工作目录的当前状态与我们想切换到的分支相冲突。我们需要的是一个合并：工作目录中的改变
必须和被检出的文件合并。    

如果可能（这里应该是只不发生冲突的情况下），或者如果在使用 `git checkout` 时使用 -m 选项，
Git 通过在你的本地修改和目标分子之间进行一次合并操作，尝试将你的本地修改加入到新工作目录中。   

### 7.7.5 分离 HEAD 分支

在下面的情况下，Git 会创建一个分离的 HEAD：   

+ 检出的提交不是分支的头部
+ 检出一个追踪分支。
+ 检出标签引用的提交。
+ 启动一个 bisect 操作
+ 使用 `git submodule update` 命令。    

如果你发现自己在一个分离的头部，然后你决定在该点用新的提交留住他们，那么你首先要创建一个新分支。   

### 7.7.6 删除分支

`git branch -d <branch>`    

Git 不会保持任何形式的关于分支名创建、移动、操纵、合并或删除的历史记录。一旦某个分支名删除了，
它就没了。  

# 第8章 diff

一个UNIX diff 程序的例子：   

```bash
$ cat initial
Now is the time
For all good men
To come to the aid
Of their country.

$ cat rewrite
Today is the time
For all good men
And women
To come to the aid
Of their country.

$ diff -u initial rewrite
--- initial   2000-01-02 11:22:33.000000000 -0500
+++ rewrite   2000-01-03 11:22:33.000000000 -0500
@@ -1,4 +1,5 @@
-Now is the time
+Today is the time
 For all good men
+And women
 To come to the aid
 Of their country.
```     

在开头，原始文件被"---" 符号标记起来，新文件用"+++"标记。@@ 之间是两个不同文件版本的上下文行号。
“-” 号表示第一个文件，1表示第一行，4表示连续4行，同样"+1,5"表示第二个文件从第一行开始的连续5行。
以减号开始的行表示从原始文件删除该行以得到新文件。相反，以加号开始的行表示从原始文件添加该行以产生新
文件。而以空格开始的行是两个版本都有的行。    

## 8.1 git diff 的命令格式

以下是三个可供树或类树对象使用 git diff 命令的基本来源：    

+ 整个提交图中的任意树对象
+ 工作目录
+ 索引    

通常，`git diff` 命令进行树的比较时可以通过提交名、分支名或者标签名。并且工作目录的文件和目录
结构还有索引中暂存文件的完整结构，都可以被看做树。   

`git diff` 命令可以使用上述三种来源的组合来进行如下4种基本比较。   

+ `git diff`: `git diff` 会显示工作目录和索引之间的差异。
+ `git diff commit`: 会显示工作目录和给定提交之间的差异。
+ `git diff --cached commit`: 会显示索引中的变更和给定提交中的变更之间的差异。
+ `git diff commit1 commit2`: 比较任意两个提交之间的差异。    

## 8.3 git diff 和提交范围

`git diff`命令支持两点语法来显示两个提交之间的不同。不过尴尬的是，这个两点语法和 `git log` 的不同，
这个的两点语法和分开写两个提交的意思是一样的。   

## 8.4 路径限制的 git diff

在默认情况下，`git diff` 操作会基于从给定树对象的根开始的整个目录结构。然而，可以使用和
`git log`中相同的路径限制手段来限制 `git diff` 只输出版本库的一个子集。   

`git diff --stat master~5 master Documentation`    

# 第9章 合并

## 9.1 合并的例子

为了把 other_branch 合并到 branch 中，你应该检出目标分支并把其他分支合并进去，如下所示：    

```
$ git checkout branch
$ git merge other_branch
```    

## 9.2 处理合并冲突

可以使用 `git status` 或者 `git ls-files -u` 命令来显示工作树中仍然未合并的一组文件。   

```
$ git ls-files -u
100644 ce01362.........  1 hello
100644 e63ffsa.........  2 hello
100644 ab232dc.........  3 hello
```   

### 9.2.3 Git 是如何追踪冲突的

Git 是如何追踪一个合并冲突的所有信息的呢？主要有以下几个部分：    

+ .git/MERGE_HEAD: 包含合并进来的提交的 SHA1 值。
+ .git/MERGE_MSG: 包含当解决冲突后执行 `git commit` 命令时用到的默认合并消息。
+ Git 索引包含每个冲突文件的三个副本：合并基础、“我们的”版本和“他们的”版本，给这三个副本分配了各自的
编号1、 2、 3。   
+ 冲突的版本不存储在索引中，相反，它存储在工作目录中的文件里。    

在 SHA1 和路径名中间单独的0表示无冲突文件的暂存编号是0。    

### 9.2.5 中止或重新启动合并

如果你开始合并操作，但是因为某种原因不想完成它，Git 提供了一种简单的方法来中止操作。在合并
提交执行最后的 git commit 命令前，使用如下命令。    

`$ git reset --hard HEAD`   

这条命令立即把工作目录和索引都还原到 `git merge` 命令之前。   

如果要中止或在它已经结束（也就是，引进一个新的合并提交）后放弃，请使用如下命令：   

`$ git reset --hard ORIG_HEAD`   

在开始合并操作前，Git 把原始分支的 HEAD 保存在 ORIG_HEAD，就是为了这种目的。  

## 9.3 合并策略

### 9.3.1 退化合并

有两种导致合并的常见退化情况，分别称为已经是最新的（already up-to-date）和快进的（fast-forward）。
因为这些情况下执行 `git merge` 后实际上都不引入一个合并提交，所以有些人可能认为它们不是真正的
合并策略。   

+ 已经是最新的：当其他分支的所有提交都已经存在与我们当前分支上时，我们当前分支已经是最新的，没有新的
提交可以添加到我们的分支上。
+ 快进的：当我们分支的 HEAD 已经在其他分支中完全存在或表示时（也就是说我们在检出当前分支后，没有引入新的
提交吧），就会发生快进合并。    

### 9.3.2 常规合并

这些合并策略都会产生一个最终提交，而上面的退化合并策略事实上都不会产生一个合并的提交，最终提交会添加到
当前分支中，表示合并的组合状态。   

+ _解决（Resolve）_：解决策略只操作两个分支，定位相同的祖先作为合并基础，然后执行一个直接的
三方合并，通过对当前分支施加从合并基础到其他分支 HEAD 的变化。
+ _递归（Recursive）_：递归策略和解决策略相似，它一次只能处理两个分支。然而，它能处理在两个分支之间有
多个合并基础的情况。在这种情况下，Git会生成一个临时合并来包含所有相同的合并基础，然后以此为基础，通过一个
简单的三方合并算法导出两个给定分支的最终合并。之后，扔掉临时合并基础，把最终合并状态提交到目标分支。 
+ _章鱼(Octopus)_: 章鱼策略是专门为合并两个以上分支设计的。从概念上讲，它相当简单；在内部，
它多次调用递归合并次略，要合并的每个分支调一次。     

### 9.3.3 特殊提交

有两个特殊的合并策略需要我们知道的，分别是我们的（ours）和子树（subtree）。    

这两个策略每个都产生一个最终提交，添加到当前分支中，代表合并的组合状态。    

+ _我们的_：这个策略合并任何数量的其他分支，但它实际上丢弃那些分支的修改，只使用当前分支的文件。
这个策略的合并结果和当前 HEAD 是相同的，但是任何其他分支也记为父提交。卧槽，那这个策略的意义就只是
把其他分支的提交历史添加到分支中么。
+ _子树_：子树策略合并到另一分支，但是那个分支的一切会合并到当前树的一颗特定子树。不需要指定哪颗子树，
Git 会自动决定。     

## 9.4 压制合并

在其他的VCS 中，当我们要合并的分支包含了多个新提交，在合并时会将其当成一个单独的补丁打到合并中，
然后在历史中创建一个新元素，这就是所谓的压制提交，因为它把所有的单独提交“压制”为一个大修改。
这样的话，其他分支的历史会丢失。    

不过 Git 默认情况下不会使用压制合并，其会保留两边的整个历史记录。    

根据需要，Git 也可以完成压制提交。只要在执行 `git merge` 或 `git pull` 的时候给出
`--squash`选项。      

# 第 10 章 更改提交

## 10.1 关于修改历史记录的注意事项

作为一般原则，只要没有其他开发人员已经获得了你的版本库的副本，你就可以自由地修改和完善版本库
提交历史记录。

## 10.2 使用 git reset

`git reset` 命令会把版本库和工作目录改变为已知状态。具体而言，`git reset` 调整 HEAD 引用
指向给定的提交，默认情况下还会更新索引以匹配该提交。   

`git reset` 命令有三个主要选项：--soft, --mixed, --hard。   

+ `git reset --soft <commit>` 将 HEAD 引用指向给定提交。索引和工作目录内容保持不变
+ `git reset --mixed <commit>` 将 HEAD 指向给定提交，索引内容也跟着改变以符合给定提交的
树结构，但是工作目录中的内容会保持不变。这也是默认选项。
+ `git reset --hard <commit>` 将 HEAD 引用指向给定提交，索引的内容也跟着改变以符合给定
提交的树结构。此外，工作目录的内容也随之改变以反映给定提交表示的树的状态。  

`git reset` 命令会把原始的 HEAD 值保存在 ORIG_HEAD 中。    

需要注意的是仅仅可以用一个分支名来指定提交，这跟检出分支是不一样的，`git reset` 自始至终都
停留在相同的分支上。    

## 10.3 使用 git cherry-pick

`git cherry-pick` 提交命令会在当前分支上应用给定提交引入的变更。这将引入一个新的
独特的提交。严格来说，使用 `git cherry-pick` 并不改变版本库中的现有历史记录，而是添加历史记录。    

通常应该是从某个分支上挑出某个提交，然后重新在当前分支上应用一次。    

最初的 `git cherry-pick` 命令一次只能选择应用一个提交。然而，在新版的 Git 中是支持选择应用
一个范围的提交：`git cherry-pick X..Z`。注意这个与git log 的范围不同，会包含开头的 X 提交。    

## 10.4 使用 git revert

`git revert` 提交命令跟 `git cherry-pick` 提交命令大致是相同的，但有一个重要
区别：它应用给定提交的逆过程。因此，此命令用于引入一个新提交来抵消给定提交的影响。    

和 `git cherry-pick` 命令一样，`revert` 命令不修改版本库的现存历史记录。相反它往历史记录
中添加新提交。   

`$ git revert master~3`    

简单的说就是引入一个提交的逆过程，把该次提交做的变更都恢复，不过很明显要是之后的提交对这个提交
又进行过了变更，很可能会冲突。     

## 10.5 reset, revert 和 checkout

如果你想切换到不同的分支，使用 `git checkout`。当前分支和 HEAD 引用会变为匹配给定分支的头。   

`git reset` 命令不会改变分支。不过如果你提供一个分支名，它会改变当前工作目录的状态，使其
看起来像给定分支的头。换言之，`git reset` 会重置当前分支的 HEAD 引用。   

`git revert` 命令作用于全部提交，而不是文件。    

## 10.7 变基提交

`git rebase` 命令是用来改变一串提交以什么为基础的。此命令至少需要提交将迁往的分支名。   

```
$ git checkout topic
$ git rebase master
```   

相当于 `git rebase master topic`。      

`git rebase` 命令也可以用 --onto 选项把一条分支上的开发线整个移植到完全不同的分支上。   

![rebase-1](https://raw.githubusercontent.com/temple-deng/markdown-images/master/other/rebase-1.png)  

`$ git rebase --onto master maint^ feature`   

![rebase-2](https://raw.githubusercontent.com/temple-deng/markdown-images/master/other/rebase-2.png)  

变基操作一次只迁移一个提交，从各自原始提交位置迁移到新的提交基础。因此，每个移动的提交都可能有冲突需要解决。
如果发现冲突，rebase 操作会临时挂起进程以便你可以解决冲突。     

一旦所有冲突解决了，并且索引已经更新了，就可以用 `git rebase --continue` 命令恢复变基操作。    

如果我们认为不应该进行变基操作，就可以用 `git rebase --abort` 来中止操作，并把版本库恢复到 `git rebase`
命令之前的状态。    

### 10.7.1 使用 git rebase -i

重新排序、编辑、删除，把多个提交合并成一个，把一个提交分离成多个，这都可以很轻松地使用 `git rebase`
命令的 -i 或者 --interactive 选项完成。此命令允许我们修改一个分支的大小，然后把它们放回原来
的分支或者不同的分支。    

```
[master] Use American spellings           # 4926ff2
[master^] Finish my colour haiku          # 058aa696
[master~2] Use color instead of colour    # 3371a4d
[master~3] Start my haiku             # f6ae4c2
```    

`$ git rebase -i master~3`   

进入编辑器，显示如下内容：   

![rebase-i](https://raw.githubusercontent.com/temple-deng/markdown-images/master/other/rebase-i.png)  

注意看其实是不包含 master~3 这个提交的。   

# 第 11 章 储藏和引用日志

## 11.1 储藏

`git stash` 的默认可选操作是 `save`。在保存储藏时Git 还提供了一条默认日志消息，但是你也可以提供你自己
的日志消息以便帮你更好地回忆你之前在做上面。只需要在命令 save 后加上需要记录的内容即可：   

`$ git stash save "WIP: Doing real work on my stuff"`    

WIP 是一种常见的缩写，在当前的情况下意为"work in progress"。     

`git stash save` 命令将保存当前索引和工作目录的状态，并且会将之清除以便再次匹配当前分支的头。
索引和工作目录的内容实际上另存为独立且正常的提交。它们可以通过 refs/stash 来查询。     

`git stash pop` 命令将在当前工作目录和索引中还原最近一次 save 操作的内容。只能在一个干净的
工作目录中使用`git stash pop` 命令。即便如此，这条命令也不一定能保证完全还原到之前保存时的状态。
因为保存的上下文可以应用到不同的提交上，索引可能需要合并，可能要用户来解决冲突。     

其他的命令还有 `git stash apply`, `git stash drop`, `git stash list`。    

`git stash show` 命令可以显示给定储藏条目相对于它的父提交的索引和文件变更记录。默认情况下会显示最近
的储藏条目。    

`git stash branch` 可以基于储藏条目生成时的提交，将保存的储藏内容转换到一个新分支。     

## 11.2 引用日志

引用日志记录非裸版本库中分支头的改变。每次对引用的更新，包括对 HEAD 的，引用日志都会更新以记录
这些引用发生了哪些变化。    

一些会更新引用日志的基本操作包括：   

+ 复制
+ 推送
+ 执行新提交
+ 修改或创建分支
+ 变基操作
+ 重置操作     

从根本上说，任何修改引用或更改分支头的 Git 操作都会记录。    

虽然引用日志记录所有引用的事务处理，但是 `git reflog show` 一次只显示一个引用的事务，默认
情况下是 HEAD。     

```
$ git reflog fred
a44d980 fred@{0}: reset: moving to master
79e881c fred@{1}: commit: last foo change
a44d980 fred@{2}: branch: Created from HEAD
```    

每一行都记录了引用历史记录中的单次事务，从最近的变更开始倒序显示。最左边的一列是发生变更时的提交 ID。
第二列形入 fred@{0} 为每个事务的提交提供方便的别名。每一行的冒号后面是对发生事务的描述。     

引用日志都存储在 .git/logs 目录下，.git/logs/_HEAD_ 文件包含 HEAD 值的历史记录，它的子目录 .git/logs
/refs 包含所有引用的历史记录，其中也包括储藏。      

