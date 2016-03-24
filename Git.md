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
