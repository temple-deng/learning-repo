# Git

标签（空格分隔）： 未分类

---

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
<br>
<br>

***git remote*
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
<br>
<br>
**git fetch**
一旦远程主机的版本库有了更新（Git术语叫做commit），需要将这些更新取回本地，这时就要用到git fetch命令。
```
    git fetch <远程主机名>    
    //git fetch命令通常用来查看其他人的进程，因为它取回的代码对你本地的开发代码没有影响。fetch应该是放到了本地repo里，不是工作区
```