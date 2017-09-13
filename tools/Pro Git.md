# Pro Git


```
 // 常用操作
 克隆远程库
git clone url repo-name

重新提交
git commit --amend

取消文件的暂存操作
git reset HEAD <file>

将工作区文件还原成上次提交的样子
git checkout -- <file>

添加远程仓库
git remote add <shortname> <url>

拉取远程仓库的内容
git fetch <remote-name>

查看远程仓库更多信息
git remote show <remote-name>

列出已有标签
git tag

创建附注标签
git tag -a v1.4 -m 'my version 1.4'

创建轻量标签
git tag v1.4-lw

给特定的提交创建标签
git tag -a v1.2 <commit hash>

推送标签到远程服务器上
git push <remote-name> <tagname>

一次性推送很多标签
git push <remote-name> --tags

暂存操作： 计算每个文件的校验和，将文件快照保存在git仓库中，将校验和加入到暂存区域等待提交

提交操作： 计算每个子目录的校验和， 然后在git仓库中将校验和保存为树对象， 然后创建提交对象。

创建分支
git branch <branch-name>

切换到一个已存在的分支
git checkout <branch-name>

创建新分支并直接切换到该分支
git checkout -b <branch-name>

合并分支
git merge <branch-name>

删除分支
git branch -d <branch-name>

推送本地分支到远程
git push origin serverfix 等价于 git push origin serverfix:serverfix ,即 git push origin <branch-name>:<remote-branch-name>

从远程分支检出本地的跟踪分支
git checkout -b <branch-name> <remote-name>/<branch-name>  
或者 git checkout --track <remote-name>/<branch-name> 注意这种方式好像没法重命名本次的跟踪分支吧

查看设置的所有跟踪分支
git bracnch --vv

简单的变基操作
git checkout experiment
git rebase master
git checkout master
git merge experiment

```  


## 第一章  介绍

Git 更像是把数据看作是对小型文件系统的一组快照。 每次你提交更新，或在 Git 中保存项目状态时，它主要对当时的全部文件制作一个快照并保存这个快照的索引。 为了高效，如果文件没有修改，Git 不再重新存储该文件，而是只保留一个链接指向之前存储的文件。 Git 对待数据更像是一个 快照流。  

![此处输入图片的描述][1]   


Git 自带一个 git config 的工具来帮助设置控制 Git 外观和行为的配置变量。 这些变量存储在三个不同的位置：

1. /etc/gitconfig 文件: 包含系统上每一个用户及他们仓库的通用配置。 如果使用带有 --system 选项的 git config 时，它会从此文件读写配置变量。

2. ~/.gitconfig 或 ~/.config/git/config 文件：只针对当前用户。 可以传递 --global 选项让 Git 读写此文件。

3. 当前使用仓库的 Git 目录中的 config 文件（就是 .git/config）：针对该仓库。

每一个级别覆盖上一级别的配置，所以 .git/config 的配置变量会覆盖 /etc/gitconfig 中的配置变量。

在 Windows 系统中，Git 会查找 $HOME 目录下（一般情况下是 C:\Users\$USER）的 .gitconfig 文件。 Git 同样也会寻找 /etc/gitconfig 文件，但只限于 MSys 的根目录下，即安装 Git 时所选的目标位置。


### 检查配置信息

如果想要检查你的配置，可以使用 git config --list 命令来列出所有 Git 当时能找到的配置。

你可以通过输入 git config &lt;key&gt;： 来检查 Git 的某一项配置。    

### 配置用户信息

```shell
git config --global user.name "dengbo"
git config --global user.email "630435132@qq.com"
```   

使用`--global` 选项，命令只要运行一次，Git 之后就都会使用这些信息。     

### 获取帮助

```shell
$ git help <verb>
$ git <verb> --help
$ man git <verb>
```     

## 第二章 Git基础

如果你想在克隆远程仓库的时候，自定义本地仓库的名字，你可以使用如下命令：  

`$ git clone https://github.com/libgit2/libgit2 mylibgit`  

注意这个仓库的名字的意思好像就是文件夹名， 没什么特别的。其实本地的仓库名貌似就是文件夹的名字

### 记录每次更新到仓库

#### 状态概览

`git status -s` 或者 `git status --short` 可以得到更为紧凑的输出信息：   

```shell
$ git status -s
 M README
MM Rakefile
A  lib/git.rb
M  lib/simplegit.rb
?? LICENSE.txt
```    

新添加的未跟踪文件前面有 `??` 标记，新添加到暂存区的文件前面有 `A` 标记，修改过
的文件前面有 `M` 标记，左边的 `M` 表示修改过的内容提交到暂存区了，右边的内容表示修改的内容还没有保存到暂存区中。    

#### 忽略文件 

请记住，你工作目录下的每一个文件都不外乎这两种状态：已跟踪或未跟踪。 已跟踪的文件是指那些被纳入了版本控制的文件，在上一次快照中有它们的记录，在工作一段时间后，它们的状态可能处于未修改，已修改或已放入暂存区。 工作目录中除已跟踪文件以外的所有其它文件都属于未跟踪文件，它们既不存在于上次快照的记录中，也没有放入暂存区。 初次克隆某个仓库的时候，工作目录中的所有文件都属于已跟踪文件，并处于未修改状态。  

文件 .gitignore 的格式规范如下：  

+ 所有空行或者以 ＃ 开头的行都会被 Git 忽略。

+ 可以使用标准的 glob 模式匹配。

+ 匹配模式可以以（/）开头防止递归。

+ 匹配模式可以以（/）结尾指定目录。

+ 要忽略指定模式以外的文件或目录，可以在模式前加上惊叹号（!）取反。  

所谓的 glob 模式是指 shell 所使用的简化了的正则表达式。 星号（\*）匹配零个或多个任意字符；[abc] 匹配任何一个列在方括号中的字符（这个例子要么匹配一个 a，要么匹配一个 b，要么匹配一个 c）；问号（\?）只匹配一个任意字符；如果在方括号中使用短划线分隔两个字符，表示所有在这两个字符范围内的都可以匹配（比如 [0-9] 表示匹配所有 0 到 9 的数字）。 使用两个星号（\*) 表示匹配任意中间目录，比如a/**/z 可以匹配 a/z, a/b/z 或 a/b/c/z等。  

### 比较差异 

要查看尚未暂存的文件更新了哪些部分，不加参数直接输入` git diff`.    

这个命令可以用作两个用途：当前做的哪些更新还没有暂存？有哪些更新已经暂存起来准备好下次提交。     

`git diff`比较的是工作目录中当前文件和暂存区域快照之间的差异,也就是修改之后还没有暂存起来的变化内容。   

若要查看已暂存的将要添加到下次提交里的内容，可以用 `git diff --cached` 命令。（Git 1.6.1 及更高版本还允许使用 `git diff --staged`，效果是相同的，但更好记些。）  

尽管使用暂存区域的方式可以精心准备要提交的细节，但有时候这么做略显繁琐。 Git 提供了一个跳过使用暂存区域的方式， 只要在提交的时候，给 git commit 加上 -a 选项，Git 就会自动把所有已经跟踪过的文件暂存起来一并提交，从而跳过 git add 步骤.  

### 删除和移动操作

`git rm` 用于将文件从已跟踪文件清单中移除。如果删除前做过修改并添加到暂存区中的话，添加 `-f` 选项。    

我们想把文件从 Git 仓库中删除（亦即从暂存区域移除），但仍然希望保留在当前工作目录中。 换句话说，你想让文件保留在磁盘，但是并不想让 Git 继续跟踪。 当你忘记添加 .gitignore 文件，不小心把一个很大的日志文件或一堆 .a 这样的编译生成文件添加到暂存区时，这一做法尤其有用。 为达到这一目的，使用 `--cached` 选项：  

`$ git rm --cached README`    

移动文件或者改名文件， 使用git mv 命令。  

`$ git mv file_from file_to`  

### 撤销操作

有时候我们提交完了才发现漏掉了几个文件没有添加，或者提交信息写错了。 此时，可以运行带有 --amend 选项的提交命令尝试重新提交：  

`$ git commit --amend`  

这个命令会将暂存区中的文件提交。 如果自上次提交以来你还未做任何修改（例如，在上次提交后马上执行了此命令），那么快照会保持不变，而你所修改的只是提交信息。(这句话和下面的例子有冲突，根据例子来看forgotten_file是自上次提交有过修改的文件，并不是未做任何修改)  

文本编辑器启动后，可以看到之前的提交信息。 编辑后保存会覆盖原来的提交信息。  

例如，你提交后发现忘记了暂存某些需要的修改，可以像下面这样操作：  

```shell
$ git commit -m 'initial commit'
$ git add forgotten_file
$ git commit --amend
```  

最终你只会有一个提交 - 第二次提交将代替第一次提交的结果。  

你已经修改了两个文件并且想要将它们作为两次独立的修改提交，但是却意外地输入了 git add * 暂存了它们两个。 如何只取消暂存两个中的一个呢？ git status 命令提示了你：  

```shell
$ git add *
$ git status
On branch master
Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

    renamed:    README.md -> README
    modified:   CONTRIBUTING.md
```  

在 “Changes to be committed” 文字正下方，提示使用 git reset HEAD &lt;file&gt;... 来取消暂存。 所以，我们可以这样来取消暂存 CONTRIBUTING.md 文件：  

```shell
$ git reset HEAD CONTRIBUTING.md
Unstaged changes after reset:
M	CONTRIBUTING.md
```

不加选项地调用 git reset 并不危险 — 它只会修改暂存区域。  

这样的情况会很奇怪， 这样做会将上次提交与本次撤销的暂存之间的修改完全丢弃掉。  

如果你并不想保留对 CONTRIBUTING.md 文件的修改怎么办？ 你该如何方便地撤消修改 - 将它还原成上次提交时的样子（或者刚克隆完的样子，或者刚把它放入工作目录时的样子）, 需要使用`$ git checkout -- <file>`  

你需要知道 git checkout -- [file] 是一个危险的命令，这很重要。 你对那个文件做的任何修改都会消失 - 你只是拷贝了另一个文件来覆盖它。 除非你确实清楚不想要那个文件了，否则不要使用这个命令。  

### 查看提交历史

`git log` 会按提交时间列出所以的更新。   

`-p` 用来显示每次提交的内容差异。`-2` 可以用来仅显示最近两次提交。`--stat` 查看每次提交的简略的统计信息。    

`--pretty` 可以制定使用不同于默认格式的方式展示提交历史。这个选项有一些內建的子选项可以选用。比如用 `oneline` 将每个提交放在一行显示，另外还有 `short, full, fuller` 可以用。    

`$ git log --pretty=oneline`    

最有意思的是 format，可以定制显示的记录格式。常用的占位符如下：   


选项 | 说明 |
----------|---------
 `%H` | 提供对象的完整哈希字串
 `%h` | 提交对象的简短哈希字串
 `%T` | 树对象的完整哈希字串
 `%t` | 树对象的简短哈希字串
 `%P` | 父对象的完整哈希字串
 `%p` | 父对象的简短哈希字串
 `%an` | 作者的名字
 `%ae` | 作者的电子邮件地址
 `%ad` | 作者的修订日期
 `%cn` | 提交者的名字
 `%ce` | 提交者的地址
 `%cd` | 提交日期
 `%s` | 提交说明    

当 oneline 或 format 与另一个 `log` 选项 `--graph` 结合时尤其有用。这个选项添加了一些 ASCII 字符串来形象地展示分支、合并历史。    

另外 `git log` 还有按照时间限制的选项，比如 `--since` 和 `--until`。还有给出若干搜索条件列出符合的提交。例如 `--author` 选项制定作者的提交，`--grep` 指定提交说明中的关键字。    


### 远程仓库的使用

如果想查看你已经配置的远程仓库服务器，可以运行 git remote 命令。 它会列出你指定的每一个远程服务器的简写。 如果你已经克隆了自己的仓库，那么至少应该能看到 origin - 这是 Git 给你克隆的仓库服务器的默认名字。  

你也可以指定选项 -v，会显示需要读写远程仓库使用的 Git 保存的简写与其对应的 URL。  

#### 添加远程仓库

运行 `git remote add <shortname> <url> `添加一个新的远程 Git 仓库，同时指定一个你可以轻松引用的简写：  

```shell
$ git remote
origin
$ git remote add pb https://github.com/paulboone/ticgit
$ git remote -v
origin	https://github.com/schacon/ticgit (fetch)
origin	https://github.com/schacon/ticgit (push)
pb	https://github.com/paulboone/ticgit (fetch)
pb	https://github.com/paulboone/ticgit (push)
```  

现在你可以在命令行中使用字符串 pb 来代替整个 URL。 例如，如果你想拉取 Paul 的仓库中有但你没有的信息，可以运行 git fetch pb：  

```shell
$ git fetch pb
remote: Counting objects: 43, done.
remote: Compressing objects: 100% (table36/36), done.
remote: Total 43 (delta 10), reused 31 (delta 5)
Unpacking objects: 100% (43/43), done.
From https://github.com/paulboone/ticgit
 * [new branch]      master     -&gt; pb/master
 * [new branch]      ticgit     -&gt; pb/ticgit
```

**从远程仓库中抓取与拉取**  

从远程仓库中获得数据，可以执行：  

```shell
$ git fetch <remote-name>
```

这个命令会访问远程仓库，从中拉取所有你还没有的数据。 执行完成后，你将会拥有那个远程仓库中所有分支的引用，可以随时合并或查看。  

如果你使用 clone 命令克隆了一个仓库，命令会自动将其添加为远程仓库并默认以 “origin” 为简写。 所以，`git fetch origin` 会抓取克隆（或上一次抓取）后新推送的所有工作。 必须注意 `git fetch` 命令会将数据拉取到你的本地仓库 - 它并不会自动合并或修改你当前的工作。 当准备好时你必须手动将其合并入你的工作。 (也就是说fetch把远程仓库的内容抓到本地仓库， 但是还需要手动和本地仓库的内容合并分支， 或者用下面的pull命令自动合并)  

如果你有一个分支设置为跟踪一个远程分支，可以使用 `git pull` 命令来自动的抓取然后合并远程分支到当前分支。 这对你来说可能是一个更简单或更舒服的工作流程；默认情况下，`git clone` 命令会自动设置本地 master 分支跟踪克隆的远程仓库的 master 分支（或不管是什么名字的默认分支）。 运行 `git pull` 通常会从最初克隆的服务器上抓取数据并自动尝试合并到当前所在的分支。  

#### 推送到远程仓库 

当你想分享你的项目时，必须将其推送到上游。 这个命令很简单：git push [remote-name] [branch-name]。 当你想要将 master 分支推送到 origin 服务器时（再次说明，克隆时通常会自动帮你设置好那两个名字），那么运行这个命令就可以将你所做的备份到服务器：  

`$ git push origin master`  

只有当你有所克隆服务器的写入权限，并且之前没有人推送过时，这条命令才能生效。 当你和其他人在同一时间克隆，他们先推送到上游然后你再推送到上游，你的推送就会毫无疑问地被拒绝。 你必须先将他们的工作拉取下来并将其合并进你的工作后才能推送。   

#### 查看远程仓库

如果想要查看某一个远程仓库的更多信息，可以使用 `git remote show [remote-name]` 命令。 如果想以一个特定的缩写名运行这个命令，例如 origin，会得到像下面类似的信息：  

```shell
$ git remote show origin
* remote origin
  Fetch URL: https://github.com/schacon/ticgit
  Push  URL: https://github.com/schacon/ticgit
  HEAD branch: master
  Remote branches:
    master                               tracked
    dev-branch                           tracked
  Local branch configured for 'git pull':
    master merges with remote master
  Local ref configured for 'git push':
    master pushes to master (up to date)
```  

这是一个经常遇到的简单例子。 如果你是 Git 的重度使用者，那么还可以通过 git remote show 看到更多的信息。  

**Note:** 像 `git remote add pb <url>` 中 `remote` 是命令，而 `add` 属于子命令，要注意分清命令的选项和
子命令选项的区别。     

```shell
$ git remote show origin
* remote origin
  URL: https://github.com/my-org/complex-project
  Fetch URL: https://github.com/my-org/complex-project
  Push  URL: https://github.com/my-org/complex-project
  HEAD branch: master
  Remote branches:
    master                           tracked
    dev-branch                       tracked
    markdown-strip                   tracked
    issue-43                         new (next fetch will store in remotes/origin)
    issue-45                         new (next fetch will store in remotes/origin)
    refs/remotes/origin/issue-11     stale (use 'git remote prune' to remove)
  Local branches configured for 'git pull':
    dev-branch merges with remote dev-branch
    master     merges with remote master
  Local refs configured for 'git push':
    dev-branch                     pushes to dev-branch                     (up to date)
    markdown-strip                 pushes to markdown-strip                 (up to date)
    master                         pushes to master                         (up to date)
```  

#### 远程仓库的移除与重命名

如果想要重命名引用的名字可以运行 git remote rename 去修改一个远程仓库的简写名。 例如，想要将 pb 重命名为 paul，可以用 git remote rename 这样做：  

```shell
$ git remote rename pb paul
$ git remote
origin
paul
```  

值得注意的是这同样也会修改你的远程分支名字。 那些过去引用 pb/master 的现在会引用 paul/master。  

如果因为一些原因想要移除一个远程仓库 - 你已经从服务器上搬走了或不再想使用某一个特定的镜像了，又或者某一个贡献者不再贡献了 - 可以使用 git remote rm ：

```shell
$ git remote rm paul
$ git remote
origin
```

### 打标签  

在 Git 中列出已有的标签是非常简单直观的。 只需要输入 git tag。  

你也可以使用特定的模式查找标签。 例如，Git 自身的源代码仓库包含标签的数量超过 500 个。 如果只对 1.8.5 系列感兴趣，可以运行：

```shell
$ git tag -l 'v1.8.5*'
v1.8.5
v1.8.5-rc0
v1.8.5-rc1
v1.8.5-rc2
v1.8.5-rc3
v1.8.5.1
v1.8.5.2
v1.8.5.3
```

Git 使用两种主要类型的标签：轻量标签（lightweight）与附注标签（annotated）。  

一个轻量标签很像一个不会改变的分支 - 它只是一个特定提交的引用。  

然而，附注标签是存储在 Git 数据库中的一个完整对象。 它们是可以被校验的；其中包含打标签者的名字、电子邮件地址、日期时间；还有一个标签信息；并且可以使用 GNU Privacy Guard （GPG）签名与验证。 通常建议创建附注标签，这样你可以拥有以上所有信息；但是如果你只是想用一个临时的标签，或者因为某些原因不想要保存那些信息，轻量标签也是可用的。  

**附注标签**  

在 Git 中创建一个附注标签是很简单的。 最简单的方式是当你在运行 tag 命令时指定 -a 选项：  

```shell
$ git tag -a v1.4 -m 'my version 1.4'
$ git tag
v0.1
v1.3
v1.4
```

通过使用 git show 命令可以看到标签信息与对应的提交信息：  

```shell
$ git show v1.4
tag v1.4
Tagger: Ben Straub &lt;ben@straub.cc&gt;
Date:   Sat May 3 20:19:12 2014 -0700

my version 1.4

commit ca82a6dff817ec66f44342007202690a93763949
Author: Scott Chacon &lt;schacon@gee-mail.com&gt;
Date:   Mon Mar 17 21:52:11 2008 -0700

    changed the version number
```

**轻量标签**  

另一种给提交打标签的方式是使用轻量标签。 轻量标签本质上是将提交校验和存储到一个文件中 - 没有保存任何其他信息。 创建轻量标签，不需要使用 -a、-s 或 -m 选项，只需要提供标签名字：  

`$ git tag v1.4-lw`  

**共享标签**  

默认情况下，git push 命令并不会传送标签到远程仓库服务器上。 在创建完标签后你必须显式地推送标签到共享服务器上。 这个过程就像共享远程分支一样 - 你可以运行 git push origin [tagname]。  

如果想要一次性推送很多标签，也可以使用带有 --tags 选项的 git push 命令。 这将会把所有不在远程仓库服务器上的标签全部传送到那里。  

### 命令别名

```shell
$ git config --global alias.co checkout
$ git config --global alias.br branch
```     

## Git分支

### 分支简介

在进行提交操作时，Git 会保存一个提交对象（commit object）。知道了 Git 保存数据的方式，我们可以很自然的想到——该提交对象会包含一个指向暂存内容快照的指针。 但不仅仅是这样，该提交对象还包含了作者的姓名和邮箱、提交时输入的信息以及指向它的父对象的指针。首次提交产生的提交对象没有父对象，普通提交操作产生的提交对象有一个父对象，而由多个分支合并产生的提交对象有多个父对象。

为了说得更加形象，我们假设现在有一个工作目录，里面包含了三个将要被暂存和提交的文件。 暂存操作会为每一个文件计算校验和（使用我们在 起步 中提到的 SHA-1 哈希算法），然后会把当前版本的文件快照保存到 Git 仓库中（Git 使用 blob 对象来保存它们），最终将校验和加入到暂存区域等待提交( 也就是说在add操作时已经保存好了快照)：   

```shell
$ git add README test.rb LICENSE
$ git commit -m 'The initial commit of my project'
```

当使用 git commit 进行提交操作时，Git 会先计算每一个子目录（本例中只有项目根目录）的校验和，然后在 Git 仓库中这些校验和保存为树对象。 随后，Git 便会创建一个提交对象，它除了包含上面提到的那些信息外，还包含指向这个树对象（项目根目录）的指针。如此一来，Git 就可以在需要的时候重现此次保存的快照。  

现在，Git 仓库中有五个对象：三个 blob 对象（保存着文件快照）、一个树对象（记录着目录结构和 blob 对象索引）以及一个提交对象（包含着指向前述树对象的指针和所有提交信息）。  

![首次提交对象及其树结构][2]

做些修改后再次提交，那么这次产生的提交对象会包含一个指向上次提交对象（父对象）的指针。  

![此处输入图片的描述][3]

**Git 的分支，其实本质上仅仅是指向提交对象的可变指针。** Git 的默认分支名字是 master。 在多次提交操作之后，你其实已经有一个指向最后那个提交对象的 master 分支。 它会在每次的提交操作中自动向前移动。  

### 分支创建

Git 是怎么创建新分支的呢？ 很简单，它只是为你创建了一个可以移动的新的指针。 比如，创建一个 testing 分支， 你需要使用 git branch 命令：  

`$ git branch testing`  

这会在当前所在的提交对象上创建一个指针。  

![此处输入图片的描述][4]

那么，Git 又是怎么知道当前在哪一个分支上呢？ 也很简单，它有一个名为 HEAD 的特殊指针。 请注意它和许多其它版本控制系统（如 Subversion 或 CVS）里的 HEAD 概念完全不同。 在 Git 中，它是一个指针，指向当前所在的本地分支（译注：将 HEAD 想象为当前分支的别名）。 在本例中，你仍然在 master 分支上。 因为 git branch 命令仅仅 创建 一个新分支，并不会自动切换到新分支中去。  

![此处输入图片的描述][5]


#### 分支切换 

要切换到一个已存在的分支，你需要使用 git checkout 命令。 我们现在切换到新创建的 testing 分支去：  


`$ git checkout testing`  

这样 HEAD 就指向 testing 分支了。  

![此处输入图片的描述][6]

那么，这样的实现方式会给我们带来什么好处呢？ 现在不妨再提交一次：  

```shell
$ vim test.rb
$ git commit -a -m 'made a change'
```  

![此处输入图片的描述][7]

如图所示，你的 testing 分支向前移动了，但是 master 分支却没有，它仍然指向运行 git checkout 时所指的对象。 这就有意思了，现在我们切换回 master 分支看看：  

`$ git checkout master`  

![此处输入图片的描述][8]

这条命令做了两件事。 一是使 HEAD 指回 master 分支，二是将工作目录恢复成 master 分支所指向的快照内容。 也就是说，你现在做修改的话，项目将始于一个较旧的版本。 本质上来讲，这就是忽略 testing 分支所做的修改，以便于向另一个方向进行开发。  

#### 分支的新建与合并

首先，我们假设你正在你的项目上工作，并且已经有一些提交。  

![此处输入图片的描述][9]

现在，你已经决定要解决你的公司使用的问题追踪系统中的 #53 问题。 想要新建一个分支并同时切换到那个分支上，你可以运行一个带有 -b 参数的 git checkout 命令：  

`$ git checkout -b iss53`

它是下面两条命令的简写：  

`$ git branch iss53   $ git checkout iss53`

![此处输入图片的描述][10]

你继续在 #53 问题上工作，并且做了一些提交。 在此过程中，iss53 分支在不断的向前推进，因为你已经检出到该分支（也就是说，你的 HEAD 指针指向了 iss53 分支）  

![此处输入图片的描述][11]

现在你接到那个电话，有个紧急问题等待你来解决。 有了 Git 的帮助，你不必把这个紧急问题和 iss53 的修改混在一起，你也不需要花大力气来还原关于 53# 问题的修改，然后再添加关于这个紧急问题的修改，最后将这个修改提交到线上分支。 你所要做的仅仅是切换回 master 分支。  

但是，在你这么做之前，要留意你的工作目录和暂存区里那些还没有被提交的修改，它可能会和你即将检出的分支产生冲突从而阻止 Git 切换到该分支。 最好的方法是，在你切换分支之前，保持好一个干净的状态。 有一些方法可以绕过这个问题（即，保存进度（stashing） 和 修补提交（commit amending）），我们会在 储藏与清理 中看到关于这两个命令的介绍。 现在，我们假设你已经把你的修改全部提交了，这时你可以切换回 master 分支了：  

`$ git checkout master`  

接下来，你要修复这个紧急问题。 让我们建立一个针对该紧急问题的分支（hotfix branch），在该分支上工作直到问题解决：  

```
$ git checkout -b hotfix
$ vim index.html
$ git commit -a -m 'fixed the broken email address'
```

![此处输入图片的描述][12]

你可以运行你的测试，确保你的修改是正确的，然后将其合并回你的 master 分支来部署到线上。 你可以使用 git merge 命令来达到上述目的：  

```bash
$ git checkout master
$ git merge hotfix
```

在合并的时候，你应该注意到了"快进（fast-forward）"这个词。 由于当前 master 分支所指向的提交是你当前提交（有关 hotfix 的提交）的直接上游，所以 Git 只是简单的将指针向前移动。 换句话说，当你试图合并两个分支时，如果顺着一个分支走下去能够到达另一个分支，那么 Git 在合并两者的时候，只会简单的将指针向前推进（指针右移），因为这种情况下的合并操作没有需要解决的分歧——这就叫做 “快进（fast-forward）”。  

现在，最新的修改已经在 master 分支所指向的提交快照中，你可以着手发布该修复了。  

![此处输入图片的描述][13]

关于这个紧急问题的解决方案发布之后，你准备回到被打断之前时的工作中。 然而，你应该先删除 hotfix 分支，因为你已经不再需要它了 —— master 分支已经指向了同一个位置。 你可以使用带 -d 选项的 git branch 命令来删除分支：  

`$ git branch -d hotfix`  

假设你已经修正了 #53 问题，并且打算将你的工作合并入 master 分支。 为此，你需要合并 iss53 分支到 master 分支，这和之前你合并 hotfix 分支所做的工作差不多。 你只需要检出到你想合并入的分支，然后运行 git merge 命令：  

`$ git checkout master   $ git merge iss53`  

这和你之前合并 hotfix 分支的时候看起来有一点不一样。 在这种情况下，你的开发历史从一个更早的地方开始分叉开来（diverged）。 因为，master 分支所在提交并不是 iss53 分支所在提交的直接祖先，Git 不得不做一些额外的工作。 出现这种情况的时候，Git 会使用两个分支的末端所指的快照（C4 和 C5）以及这两个分支的工作祖先（C2），做一个简单的三方合并。  

![此处输入图片的描述][14]

和之前将分支指针向前推进所不同的是，Git 将此次三方合并的结果做了一个新的快照并且自动创建一个新的提交指向它。 这个被称作一次合并提交，它的特别之处在于他有不止一个父提交。  

![此处输入图片的描述][15]

需要指出的是，Git 会自行决定选取哪一个提交作为最优的共同祖先，并以此作为合并的基础；这和更加古老的 CVS 系统或者 Subversion （1.5 版本之前）不同，在这些古老的版本管理系统中，用户需要自己选择最佳的合并基础。 Git 的这个优势使其在合并操作上比其他系统要简单很多。  

既然你的修改已经合并进来了，你已经不再需要 iss53 分支了。 现在你可以在任务追踪系统中关闭此项任务，并删除这个分支。  

有时候合并操作不会如此顺利。 如果你在两个不同的分支中，对同一个文件的同一个部分进行了不同的修改，Git 就没法干净的合并它们。 如果你对 #53 问题的修改和有关 hotfix 的修改都涉及到同一个文件的同一处，在合并它们的时候就会产生合并冲突：  

```
$ git merge iss53
Auto-merging index.html
CONFLICT (content): Merge conflict in index.html
Automatic merge failed; fix conflicts and then commit the result.
```

此时 Git 做了合并，但是没有自动地创建一个新的合并提交。 Git 会暂停下来，等待你去解决合并产生的冲突。 你可以在合并冲突后的任意时刻使用 git status 命令来查看那些因包含合并冲突而处于未合并（unmerged）状态的文件：  

如果你对结果感到满意，并且确定之前有冲突的的文件都已经暂存了，这时你可以输入 git commit 来完成合并提交。 默认情况下提交信息看起来像下面这个样子：  

### 分支管理  

git branch 命令不只是可以创建与删除分支。 如果不加任何参数运行它，会得到当前所有分支的一个列表：  

```
$ git branch
  iss53
* master
  testing
```
注意 master 分支前的 * 字符：它代表现在检出的那一个分支（也就是说，当前 HEAD 指针所指向的分支）。 这意味着如果在这时候提交，master 分支将会随着新的工作向前移动。 如果需要查看每一个分支的最后一次提交，可以运行 git branch -v 命令：  

```
$ git branch -v
  iss53   93b412c fix javascript issue
* master  7a98805 Merge branch 'iss53'
  testing 782fd34 add scott to the author list in the readmes
```

--merged 与 --no-merged 这两个有用的选项可以过滤这个列表中已经合并或尚未合并到当前分支的分支。 如果要查看哪些分支已经合并到当前分支，可以运行 git branch --merged.  


### 远程分支

![此处输入图片的描述][16]

如果你在本地的 master 分支做了一些工作，然而在同一时间，其他人推送提交到 git.ourcompany.com 并更新了它的 master 分支，那么你的提交历史将向不同的方向前进。 也许，只要你不与 origin 服务器连接，你的 origin/master 指针就不会移动。  

![此处输入图片的描述][17]

如果要同步你的工作，运行 git fetch origin 命令。 这个命令查找 “origin” 是哪一个服务器（在本例中，它是 git.ourcompany.com），从中抓取本地没有的数据，并且更新本地数据库，移动 origin/master 指针指向新的、更新后的位置。

![此处输入图片的描述][18]

为了演示有多个远程仓库与远程分支的情况，我们假定你有另一个内部 Git 服务器，仅用于你的 sprint 小组的开发工作。 这个服务器位于 git.team1.ourcompany.com。 你可以运行 git remote add 命令添加一个新的远程仓库引用到当前的项目，这个命令我们会在 Git 基础 中详细说明。 将这个远程仓库命名为 teamone，将其作为整个 URL 的缩写。  

![此处输入图片的描述][19]

现在，可以运行 git fetch teamone 来抓取远程仓库 teamone 有而本地没有的数据。 因为那台服务器上现有的数据是 origin 服务器上的一个子集，所以 Git 并不会抓取数据而是会设置远程跟踪分支 teamone/master 指向 teamone 的 master 分支。  


![此处输入图片的描述][20]

**推送**  

当你想要公开分享一个分支时，需要将其推送到有写入权限的远程仓库上。 本地的分支并不会自动与远程仓库同步 - 你必须显式地推送想要分享的分支。 这样，你就可以把不愿意分享的内容放到私人分支上，而将需要和别人协作的内容推送到公开分支。  

如果希望和别人一起在名为 serverfix 的分支上工作，你可以像推送第一个分支那样推送它。 运行 git push (remote) (branch):  

```
$ git push origin serverfix
Counting objects: 24, done.
Delta compression using up to 8 threads.
Compressing objects: 100% (15/15), done.
Writing objects: 100% (24/24), 1.91 KiB | 0 bytes/s, done.
Total 24 (delta 2), reused 0 (delta 0)
To https://github.com/schacon/simplegit
 * [new branch]      serverfix -&gt; serverfix
```  

这里有些工作被简化了。 Git 自动将 serverfix 分支名字展开为 refs/heads/serverfix:refs/heads/serverfix，那意味着，“推送本地的 serverfix 分支来更新远程仓库上的 serverfix 分支。” 我们将会详细学习 Git 内部原理 的 refs/heads/ 部分，但是现在可以先把它放在儿。 你也可以运行 git push origin serverfix:serverfix，它会做同样的事 - 相当于它说，“推送本地的 serverfix 分支，将其作为远程仓库的 serverfix 分支” 可以通过这种格式来推送本地分支到一个命名不相同的远程分支。 如果并不想让远程仓库上的分支叫做 serverfix，可以运行 git push origin serverfix:awesomebranch 来将本地的 serverfix 分支推送到远程仓库上的 awesomebranch 分支。  

下一次其他协作者从服务器上抓取数据时，他们会在本地生成一个远程分支 origin/serverfix，指向服务器的 serverfix 分支的引用：  

`$ git fetch origin`  

要特别注意的一点是当抓取到新的远程跟踪分支时，本地不会自动生成一份可编辑的副本（拷贝）。 换一句话说，这种情况下，不会有一个新的 serverfix 分支 - 只有一个不可以修改的 origin/serverfix 指针。  

可以运行 git merge origin/serverfix 将这些工作合并到当前所在的分支。 如果想要在自己的 serverfix 分支上工作，可以将其建立在远程跟踪分支之上：  

`$ git checkout -b serverfix origin/serverfix`


**跟踪分支**  

从一个远程跟踪分支检出一个本地分支会自动创建一个叫做 “跟踪分支”（有时候也叫做 “上游分支”）。 跟踪分支是与远程分支有直接关系的本地分支。 如果在一个跟踪分支上输入 git pull，Git 能自动地识别去哪个服务器上抓取、合并到哪个分支。     

当克隆一个仓库时，它通常会自动地创建一个 `origin/master` 的 `master` 分支。然而，如果你愿意的话可以设置其他跟踪分支，或者不跟踪 `master` 分支。最简单的就是之前的例子 `git checkout -b [branch] [remote]/[branch]`，这是一个1十分常用的操作所以 git 提供了 `--track` 快捷方式：   

```
$ git checkout --track origin/serverfix
Branch serverfix set up to track remote branch serverfix from origin.
Switched to a new branch 'serverfix'
```  

设置已有的本地分支跟踪一个刚刚拉取下来的远程分支，或者想要修改正在跟踪的上游分支，你可以在任意时间使用 -u 或 --set-upstream-to 选项运行 git branch 来显式地设置。  

```
$ git branch -u origin/serverfix
Branch serverfix set up to track remote branch serverfix from origin.
```  

如果想要查看设置的所有跟踪分支，可以使用 git branch 的 -vv 选项。 这会将所有的本地分支列出来并且包含更多的信息，如每一个分支正在跟踪哪个远程分支与本地分支是否是领先、落后或是都有。  

```
$ git branch -vv
  iss53     7e424c3 [origin/iss53: ahead 2] forgot the brackets
  master    1ae2a45 [origin/master] deploying index fix
* serverfix f8674d9 [teamone/server-fix-good: ahead 3, behind 1] this should do it
  testing   5ea463a trying something new
```  

这里可以看到 iss53 分支正在跟踪 origin/iss53 并且 “ahead” 是 2，意味着本地有两个提交还没有推送到服务器上。 也能看到 master 分支正在跟踪 origin/master 分支并且是最新的。 接下来可以看到 serverfix 分支正在跟踪 teamone 服务器上的 server-fix-good 分支并且领先 3 落后 1，意味着服务器上有一次提交还没有合并入同时本地有三次提交还没有推送。 最后看到 testing 分支并没有跟踪任何远程分支。  


**拉取**  

当 git fetch 命令从服务器上抓取本地没有的数据时，它并不会修改工作目录中的内容。 它只会获取数据然后让你自己合并。 然而，有一个命令叫作 git pull 在大多数情况下它的含义是一个 git fetch 紧接着一个 git merge 命令。 如果有一个像之前章节中演示的设置好的跟踪分支，不管它是显式地设置还是通过 clone 或 checkout 命令为你创建的，git pull 都会查找当前分支所跟踪的服务器与分支，从服务器上抓取数据然后尝试合并入那个远程分支。  

由于 git pull 的魔法经常令人困惑所以通常单独显式地使用 fetch 与 merge 命令会更好一些。  

### 变基

之前介绍过，整合分支最容易的方法是 merge 命令。 它会把两个分支的最新快照（C3 和 C4）以及二者最近的共同祖先（C2）进行三方合并，合并的结果是生成一个新的快照（并提交）。  


![此处输入图片的描述][21]

其实，还有一种方法：你可以提取在 C4 中引入的补丁和修改，然后在 C3 的基础上再应用一次。 在 Git 中，这种操作就叫做 变基。 你可以使用 rebase 命令将提交到某一分支上的所有修改都移至另一分支上，就好像“重新播放”一样。  

```
$ git checkout experiment
$ git rebase master
First, rewinding head to replay your work on top of it...
Applying: added staged command
```    

它的原理是首先找到这两个分支（即当前分支 `experiment`、变基操作的目标基底分支 `master`）的最近共同祖先 `C2`，然后对比当前分支相对于该祖先的历次提交，提取相应的修改并存为临时文件，然后将当前分支指向目标基底 `C3`，最后以此将之前另存为临时文件的修改依序应用。     

![此处输入图片的描述][22]

现在回到 master 分支，进行一次快进合并。  

```
$ git checkout master
$ git merge experiment
```
![此处输入图片的描述][23]

## 第四章 服务器上的 git

### 协议

一个远程仓库通常是一个裸仓库(bare repository)——即一个没有当前工作目录的仓库。因为该仓库仅作为合作媒介，不需要从磁盘检查快照；存放的只有 git 的资料。简单来说，裸仓库就是你工程目录内的 `.git` 子目录内容，不包含其他资料。    

git 可以使用四种主要的协议来传输资料：本地协议，HTTP 协议，SSH 协议和 git 协议。     

#### HTTP 协议

git 通过 HTTP 通信有两种模式。新版本的 HTTP 协议一般称为“智能” HTTP 协议，旧版本的一般称为”哑“HTTP 协议。    

**智能HTTP 协议**    

”智能“ HTTP 协议的运行方式和 SSH及Git 协议类似，只是运行在标准的HTTP/S 端口上并且可以使用各种 HTTP 验证机制，这意味着使用起来会比 SSH 协议简单的多，比如可以使用 HTTP 协议的用户名/密码的基础授权，免去设置 SSH 公钥。   

**哑 HTTP 协议**    

如果服务器没有提供智能 HTTP 协议的服务，Git 客户端会尝试使用更简单的“哑” HTTP 协议。 哑 HTTP 协议里 web 服务器仅把裸版本库当作普通文件来对待，提供文件服务。     

通常的，会在可以提供读／写的智能 HTTP 服务和简单的只读的哑 HTTP 服务之间选一个。 极少会将二者混合提供服务。     

#### SSH 协议

SSH 协议的缺点在于你不能通过他实现匿名访问。 即便只要读取数据，使用者也要有通过 SSH 访问你的主机的权限，这使得 SSH 协议不利于开源的项目。     

#### Git 协议

Git 协议。 这是包含在 Git 里的一个特殊的守护进程；它监听在一个特定的端口（9418），类似于 SSH 服务，但是访问无需任何授权。 要让版本库支持 Git 协议，需要先创建一个 git-daemon-export-ok 文件 —— 它是 Git 协议守护进程为这个版本库提供服务的必要条件 —— 但是除此之外没有任何安全措施。      

### 在服务器上搭建 Git

在开始架设 Git 服务器钱，需要把现有仓库导出为裸仓库。通过克隆我们的仓库来创建一个新的裸仓库，需要在克隆命令后加上 `--bare` 选项，裸仓库目录名以 .git 结尾，例如：    

`$ git clone --bare my_project my_project.git`     

既然你有了裸仓库的副本，剩下要做的就是把裸仓库放到服务器上并设置你的协议。 假设一个域名为 `git.example.com` 的服务器已经架设好，并可以通过 SSH 连接，你想把所有的 Git 仓库放在 `/opt/git` 目录下。 假设服务器上存在 `/opt/git/` 目录，你可以通过以下命令复制你的裸仓库来创建一个新仓库：    

`$ scp -r my_project.git user@git.example.com:/opt/git`     

此时，其他通过 SSH 连接这台服务器并对 `/opt/git` 目录拥有可读权限的使用者，通过运行以下命令就可以克隆你的仓库：    

`$ git clone user@git.example.com:/opt/git/my_project.git`   

## 分布式Git

### 分布式工作流程

#### 集中式工作流

集中式系统中通常使用的是单点协作模型——集中式工作流。 一个中心集线器，或者说仓库，可以接受代码，所有人将自己的工作与之同步。 若干个开发者则作为节点——也就是中心仓库的消费者——并且与其进行同步。  

只需要搭建好一个中心仓库，并给开发团队中的每个人推送数据的权限，就可以开展工作了。Git 不会让用户覆盖彼此的修改。 例如 John 和 Jessica 同时开始工作。 John 完成了他的修改并推送到服务器。 接着 Jessica 尝试提交她自己的修改，却遭到服务器拒绝。 她被告知她的修改正通过非快进式（non-fast-forward）的方式推送，只有将数据抓取下来并且合并后方能推送。 这种模式的工作流程的使用非常广泛，因为大多数人对其很熟悉也很习惯。  

![此处输入图片的描述][24]

#### 集成管理者工作流

Git 允许多个远程仓库存在，使得这样一种工作流成为可能：每个开发者拥有自己仓库的写权限和其他所有人仓库的读权限。 这种情形下通常会有个代表“官方”项目的权威的仓库。 要为这个项目做贡献，你需要从该项目克隆出一个自己的公开仓库，然后将自己的修改推送上去。 接着你可以请求官方仓库的维护者拉取更新合并到主项目。 维护者可以将你的仓库作为远程仓库添加进来，在本地测试你的变更，将其合并入他们的分支并推送回官方仓库。 这一流程的工作方式如下所示  

1. 项目维护者推送到主仓库。

2. 贡献者克隆此仓库，做出修改。

3. 贡献者将数据推送到自己的公开仓库。

4. 贡献者给维护者发送邮件，请求拉取自己的更新。

5. 维护者在自己本地的仓库中，将贡献者的仓库加为远程仓库并合并修改。

6. 维护者将合并后的修改推送到主仓库。

![此处输入图片的描述][25]


#### 私有小型团队工作流

这是一个最简单的工作流程。 你通常在一个特性分支工作一会儿，当它准备好整合时合并回你的 master 分支。 当想要共享工作时，将其合并回你自己的 master 分支，如果有改动的话然后抓取并合并 origin/master，最终推送到服务器上的 master 分支。 通常顺序像这样：

![此处输入图片的描述][26]

### 向一个项目贡献

#### 提交准则

首先，你不会想要把空白错误提交上去，git 提供了一个简单的方式来检查这点-在提交前，运行 `git diff --check`，它将会找到可能的空白错误并将他们列出来。     

接下来，尝试让每一个提交成为一个逻辑上的独立变更集。 如果可以，尝试让改动可以理解 - 不要在整个周末编码解决五个问题，然后在周一时将它们提交为一个巨大的提交。 即使在周末期间你无法提交，在周一时使用暂存区域将你的工作最少拆分为每个问题一个提交，并且为每一个提交附带一个有用的信息。 如果其中一些改动修改了同一个文件，尝试使用 `git add --patch` 来部分暂存文件。    

#### 派生的公开项目

在派生的公开项目中，我们通常没有权限直接更新项目的分支。我们必须用其他方法将工作给维护者，第一个例子描述在支持简单派生的 Git 托管上使用派生来做贡献。下一节会讨论偏好通过邮件接受贡献补丁的项目。    

当我们克隆下来项目并完成自己的贡献，准备将其贡献回维护者，去原始项目中点击"fork"按钮，创建一份自己的可写的项目派生仓库，然后需要添加这个新仓库 URL 为第二个远程仓库，在本例中称作 `myfork`:   

`$ git remote add myfork (url)`     

然后需要推送工作到上面。相对于合并到主分支再推送上去，推送你正在工作的特性分支到仓库上更简单。     

`$ git push -u myfork featureA`    

当工作已经被推送到我们自己的派生后，需要通知维护者。这通常被称作是一个拉取请求(pull request)，即可以通过网站生成，也可以通过 `git request-pull` 命令然后手动地将输出发送电子邮件给项目的维护者。     

`request-pull` 命令接受特性分支拉入的基础分支，以及它们拉入的 Git 仓库 URL，输出请求拉入的所有修改的总结。例如，Jessica 想要发送给 John 一个拉取请求，她已经在刚刚推送的分支上做了两次提交。她可以运行这个：      
```shell
$ git request-pull origin/master myfork
The following changes since commit 1edee6b1d61823a2de3b09c160d7080b8d1b3a40:
  John Smith (1):
        added a new function

are available in the git repository at:

  git://githost/simplegit.git featureA

Jessica Smith (2):
      add limit to log function
      change log output to 30 from 25

 lib/simplegit.rb |   10 +++++++++-
 1 files changed, 9 insertions(+), 1 deletions(-)
```    

这个输出可以被发送给维护者-它告诉他们工作是从哪个分支开始、归纳的提交与从哪里拉入这些工作。     

#### 通过邮件的公开项目

工作流程与之前的用例是类似的 - 你为工作的每一个补丁序列创建特性分支。 区别是如何提交它们到项目中。 生成每一个提交序列的电子邮件版本然后邮寄它们到开发者邮件列表，而不是派生项目然后推送到你自己的可写版本。    

使用 `git format-patch` 来生成可以邮寄到列表的 mbox 格式的文件 - 它将每一个提交转换为一封电子邮件，提交信息的第一行作为主题，剩余信息与提交引入的补丁作为正文。 它有一个好处是是使用 `format-patch` 生成的一封电子邮件应用的提交正确地保留了所有的提交信息。    

```shell
$ git format-patch -M origin/master
0001-add-limit-to-log-function.patch
0002-changed-log-output-to-30-from-25.patch
```    

format-patch 命令打印出它创建的补丁文件名字。 -M 开关告诉 Git 查找重命名。 文件最后看起来像这样：    

```shell
$ cat 0001-add-limit-to-log-function.patch
From 330090432754092d704da8e76ca5c05c198e71a8 Mon Sep 17 00:00:00 2001
From: Jessica Smith <jessica@example.com>
Date: Sun, 6 Apr 2008 10:17:23 -0700
Subject: [PATCH 1/2] add limit to log function

Limit log functionality to the first 20

---
 lib/simplegit.rb |    2 +-
 1 files changed, 1 insertions(+), 1 deletions(-)

diff --git a/lib/simplegit.rb b/lib/simplegit.rb
index 76f47bc..f9815f1 100644
--- a/lib/simplegit.rb
+++ b/lib/simplegit.rb
@@ -14,7 +14,7 @@ class SimpleGit
   end

   def log(treeish = 'master')
-    command("git log #{treeish}")
+    command("git log -n 20 #{treeish}")
   end

   def ls_tree(treeish = 'master')
--
2.1.0
```   

为了将其邮寄到邮件列表，你既可以将文件粘贴进电子邮件客户端，也可以通过命令行程序发送它。 粘贴文本经常会发生格式化问题，特别是那些不会合适地保留换行符与其他空白的 “更聪明的” 客户端。 幸运的是，Git 提供了一个工具帮助你通过 IMAP 发送正确格式化的补丁，这可能对你更容易些。 我们将会演示如何通过 Gmail 发送一个补丁，它正好是我们所知最好的邮件代理.    

首先，需要在 `~/.gitconfig` 文件中设置 imap 区块。可以通过一系列 `git config` 命令来分别设置每一个指，或者手动添加他们，不管怎样配置文件应该看起来像这样：    

算了，先略。     


## 其他

### stash

将新的储藏推送到栈上： `git stash or git stash save`。  

查看储藏栈： `git stash list`

将储藏的工作重新应用： `git stash apply`。  

可以应用更旧的储藏： `git stash apply stash@{number}`。  

文件的改动会重新应用，但之前的暂存工作没有重新暂存，想要这样的话加 `--index`选项。  

将储藏从栈上移除: `git stash drop <stash-name>`。  

也可以应用后立即丢掉：`git stash pop`。  

`git stash branch <branch-name>` 创建一个新分支，检出储藏的工作时所在的提交，重新应用工作，再扔掉储藏。  


### reset

reset 第一件事是移动 HEAD 指向的分支，这与改变 HEAD 自身不同（checkout所做的）。这意味着如果 HEAD 指向 master， `git reset 9e4e24f` 使 master 指向 9e4e24f 提交。
如果有 `--soft` 选项就在这里停止。  

接下来 reset 会用 HEAD 指向的当前快照的内容来更新索引（即暂存区），如果有 `--mixed` 选项就在这里停止。这也是默认行为。  

第三步将工作目录保持与暂存区一致，使用 `--hard` 选项会进行这一步。  

如果指定了路径就跳过第一步。  

如果 checkout 指定了路径一样也跳过第一步，但是不同的是还会覆盖工作目录中的文件。

  [1]: http://o8qr19y3a.bkt.clouddn.com/new/snapshots.png
  [2]: http://o8qr19y3a.bkt.clouddn.com/commit-and-tree.png
  [3]: http://o8qr19y3a.bkt.clouddn.com/commits-and-parents.png
  [4]: http://o8qr19y3a.bkt.clouddn.com/two-branches.png
  [5]: http://o8qr19y3a.bkt.clouddn.com/head-to-master.png
  [6]: http://o8qr19y3a.bkt.clouddn.com/head-to-testing.png
  [7]: http://o8qr19y3a.bkt.clouddn.com/advance-testing.png
  [8]: http://o8qr19y3a.bkt.clouddn.com/checkout-master.png
  [9]: http://o8qr19y3a.bkt.clouddn.com/basic-branching-1.png
  [10]: http://o8qr19y3a.bkt.clouddn.com/basic-branching-2.png
  [11]: http://o8qr19y3a.bkt.clouddn.com/basic-branching-3.png
  [12]: http://o8qr19y3a.bkt.clouddn.com/basic-branching-4.png
  [13]: http://o8qr19y3a.bkt.clouddn.com/basic-branching-5.png
  [14]: http://o8qr19y3a.bkt.clouddn.com/basic-merging-1.png
  [15]: http://o8qr19y3a.bkt.clouddn.com/basic-merging-2.png
  [16]: http://o8qr19y3a.bkt.clouddn.com/remote-branches-1.png
  [17]: http://o8qr19y3a.bkt.clouddn.com/remote-branches-2.png
  [18]: http://o8qr19y3a.bkt.clouddn.com/remote-branches-3.png
  [19]: http://o8qr19y3a.bkt.clouddn.com/remote-branches-4.png
  [20]: http://o8qr19y3a.bkt.clouddn.com/remote-branches-5.png
  [21]: http://o8qr19y3a.bkt.clouddn.com/basic-rebase-2.png
  [22]: http://o8qr19y3a.bkt.clouddn.com/basic-rebase-3.png
  [23]: http://o8qr19y3a.bkt.clouddn.com/basic-rebase-4.png
  [24]: http://o8qr19y3a.bkt.clouddn.com/workflow/jpg/centralized_workflow.png
  [25]: http://o8qr19y3a.bkt.clouddn.com/workflow/jpg/integration-manager.png
  [26]: http://o8qr19y3a.bkt.clouddn.com/small-team-flow.png
