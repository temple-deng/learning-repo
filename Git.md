# Git


### 1.分支管理策略

创建develop分支  

```shell
    git checkout -b develop master
```  

将develop合并到主分支  

```shell
    git checkout master //切换到master分支
    git merge --no-ff develop  //合并。--no-ff参数是什么意思。默认情况下，Git执行"快进式合并"（fast-farward merge），会直接将Master分支指向Develop分支。
```  

除了开发分支，可能还会有其他临时性分支： 功能(feature)分支、预发布(release)分支、修补bug(fixbug)分支

功能分支貌似更像开发人员在本地的版本库  

```shell
    git checkout -b feature-x develop //创建
    git checkout develop  //切换
    git merge --no-ff feature-x   //合并
    git branch -d feature-x //删除
```

预发布分支是指发布正式版本之前（即合并到Master分支之前），我们可能需要有一个预发布的版本进行测试。


预发布分支是从Develop分支上面分出来的，预发布结束以后，必须合并进Develop和Master分支。它的命名，可以采用release-*的形式。


**git clone**
```
    git clone <版本库的网址> <本地目录名>
    //支持多种协议
    $ git clone http[s]://example.com/path/to/repo.git/
    $ git clone ssh://example.com/path/to/repo.git/  
    //ssh的第二种写法
    $ git clone [user@]example.com:path/to/repo.git/
    $ git clone git://example.com/path/to/repo.git/
    $ git clone /opt/git/project.git
    $ git clone file:///opt/git/project.git
    $ git clone ftp[s]://example.com/path/to/repo.git/
    $ git clone rsync://example.com/path/to/repo.git/
```  


**git remote**  

```
    git remote    //列出所有远程主机
    git remote -v    //可以查看网址
    克隆版本库的时候，所使用的远程主机自动被Git命名为origin。如果想用其他的主机名，需要用git clone命令的-o选项指定。
    git clone -o jQuery https://github.com/jquery/jquery.git
    git remote  //jQuery

    git remote show <主机名>   //查看主机详细信息

    git remote add <主机名> <网址>  //添加远程主机

    git remote rm <主机名> //删除远程主机，应该和git remote remove一个意思（推断）

    git remote rename  <原主机名>  <新主机名>
```  

**git fetch**   

一旦远程主机的版本库有了更新（Git术语叫做commit），需要将这些更新取回本地，这时就要用到git fetch命令。  

```
    git fetch <远程主机名>    
    //git fetch命令通常用来查看其他人的进程，因为它取回的代码对你本地的开发代码没有影响。fetch应该是放到了本地repo里，不是工作区
    //默认情况下，git fetch取回所有分支（branch）的更新。如果只想取回特定分支的更新，可以指定分支名。
    git fetch <远程主机名> <分支名>

    git branch命令的-r选项，可以用来查看远程分支，-a选项查看所有分支

    可以使用git merge命令或者git rebase命令，在本地分支上合并远程分支。
```  


**git pull**  

```
git pull命令的作用是，取回远程主机某个分支的更新，再与本地的指定分支合并。
git pull <远程主机名> <远程分支名>:<本地分支名>
```  

**git push**  

```
git push命令用于将本地分支的更新，推送到远程主机。它的格式与git pull命令相仿。
 git push <远程主机名> <本地分支名>:<远程分支名>

 如果省略本地分支名，则表示删除指定的远程分支，因为这等同于推送一个空的本地分支到远程分支。
 git push origin :master
// 等同于
 git push origin --delete master
```  

### 2.分支  

```shell
    git branch   //列出所有本地分支
    git branch -r   // 列出所有远程分支
    git branch -a   //列出所有本地分支和远程分支
    git branch [branch-name] //新建一个分支，但依然停留在当前分支
    git checkout -b [branch]  //新建一个分支，并切换到该分支
    git branch [branch] [commit]  // 新建一个分支，指向指定commit
    git branch --track [branch]   [remote-branch]   //新建一个分支，与指定的远程分支建立追踪关系
    git checkout [branch-name]  //切换到指定分支，并更新工作区
    git checkout -   //切换到上一个分支
    git branch --set-upstream [branch] [remote-branch]    //建立追踪关系，在现有分支与指定的远程分支之间
    git merge [branch]   //合并指定分支到当前分支
    git cherry-pick [commit]      //选择一个commit，合并进当前分支
    git branch -d [branch-name]    //删除分支
    git push origin --delete [branch-name]   //删除远程分支
    git branch -dr [remote/branch]
```  


### 3.撤销

```
    git checkout [file]  //恢复暂存区的指定文件到工作区
    git checkout [commit] [file]   //恢复某个commit的指定文件到暂存区和工作区
    git checkout .   //恢复暂存区的所有文件到工作区
    git reset [file]   //重置暂存区的指定文件，与上一次commit保持一致，但工作区不变
    git reset --hard  //重置暂存区与工作区，与上一次commit保持一致
    git reset [commit]   //重置当前分支的指针为指定commit，同时重置暂存区，但工作区不变
    git reset --hard [commit]  //重置当前分支的HEAD为指定commit，同时重置暂存区和工作区，与指定commit一致
    git reset --keep [commit]  //重置当前HEAD为指定commit，但保持暂存区和工作区不变

```  



### 4.community book  

下面的内容是从书上摘录的，暂时还不懂。  
每个对象包括3个部分：类型，大小和内容。大小就是指内容的大小，内容取决于对象的类型，有4种类型的对象: "blob", "tree", "commit"和"tag"  

"blob"用来存储文件数据，通常是一个文件。  

"tree"有点像一个目录，它管理一些"tree"或是"blob"  

一个"commit"只指向一个"tree"，它用来标记项目某一个特定时间点的状态。它包括一些关于时间点的元数据，如时间戳、最近一次提交的作者、指向上次提交的指针等。  

一个"tag"是来标记某一个提交的方法。  

一个tree对象有一串指向blob对象或是其它tree对象的指针，它一般用来表示内容之间的目录层次关系。  


git diff 会显示当前所有已做的但没有加入到索引里的修改。 可以加上 `--cached`参数 ，查看索引部分修改了的但没有提交的内容。  
