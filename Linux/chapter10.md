# 第十章 Bash

## 10.1

利用 `type` 指令还了解指令是来自外部指令，还是内置在 bash 中。    

```shell
$ type [-tpa] name

-t：type会将命令以下面的字眼显示其意义：
    file： 表示为外部命令
    alias：表示该指令为命令别名设置的名称
    builtin：表示内置的命令
-p：如果后面接的 name 为外部指令，才会显示完整文件名
-a：会由 PATH  变量定义的路径中，将所有含 name 的指令都列出来
```    

几个快捷键：    

+ ctrl + u/ctrl + k：分别从光标处向前删除指令串及向后删除指令串
+ ctrl + a/ctrl + e：分别让光标移动到整个指令串的最前面或最后面     

## 10.2 变量

使用 `echo` 命令来查看变量，不过查看变量时必须要前缀 `$`或者以 `${var}` 的格式。    

变量的设置规则：    

+ 变量与变量值以等号链接
+ 等号两边不能直接接空白字符
+ 变量名只能是英文字符和数字，但是开头必须是字母
+ 变量内容若有空白字符可使用双引号或但引号将变量值包裹起来，不过有以下限制：
  - 双引号内的特殊字符，可以保持其原有的特殊含义
  - 单引号内的特殊字符则为一般字符
+ 可使用反斜线对特殊字符进行转义
+ 在一串指令的执行中，还需要借由其他额外的指令提供的信息时，可以使用反单引号或者 `$(command)`将指令
包裹起来。   
+ 若该变量为扩增变量内容，则可用 `$var` 或 `${var}` 累加内容。
+ 若该变量需要在其他子程序执行，则需要以 export 来使变量变成环境变量：`export PATH`。   
+ 取消变量的方法为使用 `unset`，例如 `unset MAIL`  

用 `env` 来查看环境变量。     

不过 bash 可不只有环境变量，还有一些与 bash 操作接口有关的变量，以及使用者自己定义的变量存在的。
使用 `set` 将 bash 中所有的变量列出来。     

几个关键变量的含义：    

+ PS1：命令提示符
+ $：目前 shell 的进程号，即PID
+ ?: 上个执行指令的回传值。一般来说，指令成功执行回传0，发生错误就是非0值。      

### 变量键盘读取、数组与声明

使用 `read` 读取来自键盘的输入：    

```shell
$read [-pt] variable

-p: 后面可以接提示字符
-t：后面可以接等待的秒数

$read atest    ->将输入内容赋值给 atest
$read -p "Please keyin your name: " -t 30 named
```    

`declare` 和 `typeset` 是一样的功能，即声明变量的类型，如果不加参数执行 `declare` 就会将所有变量显示出来。     

```shell
$declare [-aixr] variable

-a：将后面名为 variable 的变量声明为数组类型
-i：将变量声明成整型
-x：用法与 export 一样，将变量声明成环境变量
-r：将变量设置成只读类型
```   

+ 在 bash 中变量默认的类型是字符串
+ bash 中的数值运算，默认最多只能到整数形态，所以 1/3 结果是0     

### 变量内容的删除和替换

+ `${var#word}` 若变量内容从头开始匹配 word，就把匹配的最短数据删除
+ `${var##word}` 把最长的删除
+ `${var%word}` 若从尾向前匹配word，把最短的删除
+ `${var%%word}` 把最长的删除
+ `${var/old/new}` 匹配 old，替换第一个
+ `${var//old/new}` 替换所有的    



设置方式 | str 不存在 | str 为空串 | str为非空串
---------|----------|---------
 `var=${str-expr}` | var=expr | var='' | var=$str
 `var=${str:-expr}` | var=expr | var=expr | var=$str
 `var=${str+expr}` | var='' | var=expr | var=expr
 `var=${str:+expr}` | var='' | var='' | var=expr
 `var=${str=expr}` | str=expr var=expr | str 不变 var='' | str 不变 var=$str
 `var=${str:=expr}` | str=expr var=expr | str=expr var=expr | str 不变 var=$str

### 别名设置

`alias newName=actual command`     

### history

```shell
$history [n]
$history [-c]
$history [-raw] histfiles

n：数字，列出最近的 n 条命令
-c：将目前 shell 中所有的 history 内容删除
-a：将目录新增的 history 命令加入到的 histfiles，如果没加 histfiles就默认写入 `~/.bash_history`
-r：将 histfiles 的内容读到这个 shell 的history记录中
-w：将目前的history 记录内容写入 histfiles 中   
```    

## shell 的操作环境

指令的运行顺序如下：   

1. 以相对/绝对路径执行指令，例如 `./ls`
2. 由 alias 找到该指令来执行
3. 由 bash 内置的指令来执行
4. 通过 $PATH 变量的顺序搜寻到的第一个指令执行

### bash的登录与欢迎信息：/etc/issue, /etc/motd

issue 内的各字符含义如下：    

+ \d：本地时间的日期
+ \l：显示第几个终端口
+ \m：显示硬件的等级
+ \n：显示主机的网络名称
+ \O：显示 domain name
+ \r：操作系统的版本
+ \t：显示本地时间的时间
+ \S：操作系统的名称
+ \v：操作系统版本     

除了 /etc/issue 还有一个 /etc/issue.net，这个是提供给 telnet 远程登录程序用的。    

/etc/motd 里的内容应该是在用户登录后显示的

### bash 的环境配置文件

+ login shell：取得 bash 时需要完整的登录流程，就称为 login shell，例如从 tty1~tty6 登录，需要
输入账号和密码，就称为 `login shell`
+ non-login shell：取得 bash 接口的方法不需要重复登录的举动，例如以 X window 登录后，以 X的图形化
接口启动终端机，终端并没有要求我们再次输入账号密码，这些 shell 就是 non-login shell。     

login shell 和 non-login shell 启动的过程中读取的配置文件数据是不一样的。login shell 会读取以下的
配置文件：    

1. /etc/profile：这是系统整体的设置，最好不要修改
2. ~/.bash\_profile 或 ~/.bash_login 或 ~/.profile：属于使用者的个人设置    

/etc/profile 还会调用的外部的设置数据，默认情况下会读取以下的数据：    

+ /etc/profile.d/*.sh
+ /etc/locale.conf
+ /usr/share/bash-completion/completions/*   

在读取完整体上设置的 /etc/profile 后就读取个人配置，个人配置有3个，依次是：   

1. ~/.bash_profile
2. ~/.bash_login
3. ~/.profile    

其实呢，bash 只会读其中的一个。     

由于 /etc/profile	与	~/.bash_profile	都是在取得	login	shell	的时候才会读取的配置文件,所
以,如果你将自己的偏好设置写入上述的文件后,通常都是得登出再登陆后,该设置才会生效。如果想要不登出就直接
读取配置文件，使用 `source` 命令。     

```shell
$source 配置文件名

$source ~/.bashrc
$. ~/.bashrc
```   

利用 `source`或小数点都可以将配置文件的内容读进当前的 shell 环境中。     

针对 non-login shell，该 bash 配置文件仅会读取 ~/.bashrc。    

### 通配符


符号 | 意义 
----------|---------
 * | 代表0到任意个字符
 ? | 代表一个任意字符
 [] | 字符集
 [-] | 还是字符集的那个
 [^] | 反向字符集

特殊符号：    


符号 | 内容
----------|---------
 \# | 注释符号，常用在 script 中，说明后面的数据均不执行
 \ | 转义符
 | | 管道符
 ; | 连续指令分隔符
 ~ | 用户主文件夹
 $ | 取用变量前置字符
 & | 工作控制，将指令设为后台运行
 ! | 逻辑非
 / | 目录分隔符
 \>, >> | 输出重定向，分别是替换和累加
 <, << | 输入重定向


## 10.5 重定向

1. 标准输入，代码为 0，使用 < 或 <<
2. 标准输出，代码为 1，使用 > 或 >>
3. 标准错误输出，代码为 2，使用 2> 或 2>>    

/dev/null 错误黑洞，2>&1 输出与错误输出分开写。    

### 命令执行的判断依据

+ cmd; cmd：分号前的指令执行完后立刻执行后面的命令。
+ cmd1 && cmd2：cmd1 成功执行，执行 cmd2，否则不执行 cmd2
+ cmd1 || cmd2：cmd1 成功执行，不执行 cmd2，否则执行 cmd2

## 10.6 管道符

在每个管道符后面接的第一个必定是指令，这个指令必须能够接受标准输入的数据才行。     

+ 管道命令仅能处理标准输出，对标准错误会忽略。
+ 管道命令必须能够接受来自前一个命令的数据成为标准输入继续处理才行。      

### 摘取命令：cut, grep

摘取命令通常是针对一行一行来分析的。     

cut 将一段信息的某一部分摘取出来，以行为单位进行分析。    

```shell
$cut -d '分隔字符' -f fields   -> 用于有特定分隔字符的情况
$cut -c 字符区间     -> 用于排列整齐的情况

-d：后面接分隔字符，与-f一起使用
-f：依据 -d 分隔字符将一行信息分成数段，用 -f 取出第几段的意思
-c：以字符为单位取出固定字符区间

$echo ${PATH} | cut -d ':' -f 5
$echo ${PATH} | cut -d ':' -f 3,5
$export | cut -c 12-               >第12字符之后的内容
```   

cut 是将一行内容中满足我们要求的那部分取出来，grep 则是分析一行内容，若其中有我们的需要的内容，将把这一行都拿出来。     

```shell
$grep [-acinv] [--color=auto] '查询字符串' filename

-a：将二进制文件以文本文件的方式搜索
-c：计算找到查找字符串的次数
-i：忽略大小写
-n：输出行号
-v：反向选择，即输出没找到查找字符串的那些行
```   

看情况这个命令可以直接从管道符接受输入，也可以直接指定一个文件。    

### 排序命令：sort, wc, uniq

```shell
$sort [-fbMnrtuk] [file or stdin]

-f：忽略大小写
-b：忽略最前面的空白字符部分
-M：以月份的名字来排序
-n：使用纯数字进行排序
-r：反向排序
-u：就是 uniq，相同的数据中，仅出现一行代表
-t：分隔符号，默认是用 tab
-k：以那个区间排序的意思

$cat /etc/passed | sort -t ':' -k 3    -> 以:分隔开的第三栏进行排序
```     

wc貌似是用来统计输入内容有多少行，多少字符的。     

```shell
$wc [-lwm]

-l：仅列出行
-w：仅列出多少字
-m：多少字符
```   

### 双向重定向：tee

`tee` 会同时将数据流分送到文件与屏幕上，输出到屏幕的，也是标准输出。      

```shell
$tee [-a] file

-a：以追加的形式将数据加入到 file 中
```    

### 字符转换命令：tr, col, join, paste, expand

`tr` 可以用来删除一段信息当中的文字，或者进行文字信息的替换。     

```shell
$tr [-ds] SET1 ...

-d：删除信息中的 SET1 这个字串
-s：取代掉重复的字符

$last | tr '[a-z]' '[A-Z]'  -> 将小写替换为大写
```    

col 通常用来将 tab 替换为空白键。     

```shell
$col [-x]

-x：将 tab 键转换为空白键
```     

`join` 可以出来两个文件之间的数据，主要是出来两个文件中，有相同数据的那一行，才将他加到一起。     

```shell
$join [-ti12] file1 file2

-t：join默认以空白字符分隔数据，并且比对“第一个字段”的数据
-i：忽略大小写的差异
-1：代表第一个文件要用那个字段来分析
-2：代表第二个文件要用那个字段来分析
```    

`paste` 直接将两行贴在一起，且中间用 tab 键隔开。    

```shell
$paste [-d] file1 file2

-d：后面可以接分隔字符。默认是 tab 分隔
-：如果file部分写成 -，表示来自标准输入的数据
```    

`expand` 就是将 tab 键转换为空白键：     

```shell
$expand [-t] file

-t：后面接数字，一般来说，一个 tab 可以用8个空白键取代，但是也可以自定义
```     

### 10.6.5 分区命令：split

`split` 可以将一个大文件，依据文件大小或行数来分区，就可以将大文件分区成小文件。        

```shell
$split [-bl] file PREFIX

-b：后面可以接欲分区成的文件大小，可加单位，例如b, k, m
-l：以行数来进行分区
PREFIX：代表前置字符的意思，可作为分区文件的前导文字
```     

### 10.6.6 参数代换：xargs

`xargs` 可以读入标准输入的数据，并且以空白字符或者断行字符作为分隔，将标准输入的数据分隔成 arguments。      

```shell
$xargs [-0epn]

-0：如果标准输入含有特殊字符，这个参数可以将他还原成一般字符
-e：EOF 的意思，后面可以接一个字符串，当xargs 分析到这个字符串时，就会停止继续工作
-p：在执行每个指令的 argument 时，都会询问使用者
-n：后面接次数，每次 command 指令执行时，要使用几个参数的意思

$cut -d ':' -f 1 /etc/passwd | head -n 3 | xargs -n 1 id
$cut -d ':' -f 1 /etc/passwd | head -n 3 | xargs -e'sync' -n 1
```     

### 10.6.7 关于减号 - 的用途

在管道命令中，常常会用到前一个指令的标准输出作为这次的标准输入，某些指令需要用到文件名称来进行处理时，该标准输入和输出可以用减号替代：    

```shell
$tar -cvf - /home | tar -xvf - -C /tmp/homeback
```


