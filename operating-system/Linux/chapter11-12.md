# 第 11 章 正则表达式

<!-- TOC -->

- [第 11 章 正则表达式](#第-11-章-正则表达式)
  - [11.1 基础正则表达式](#111-基础正则表达式)
    - [11.1.1 基础正则表达式特殊字符汇整](#1111-基础正则表达式特殊字符汇整)
    - [11.1.2 sed](#1112-sed)
  - [11.2 扩展正则表达式](#112-扩展正则表达式)
  - [11.3 文件的格式化与相关处理](#113-文件的格式化与相关处理)
    - [11.3.1 格式化打印：printf](#1131-格式化打印printf)
    - [11.2.2 数据处理工具 awk](#1122-数据处理工具-awk)
- [第 12 章 Shell Scripts](#第-12-章-shell-scripts)
  - [12.1 什么是 shell script](#121-什么是-shell-script)
  - [12.2 简单的脚本练习](#122-简单的脚本练习)
    - [12.2.1 简单范例](#1221-简单范例)
    - [12.2.2 script 的执行方式差异](#1222-script-的执行方式差异)
  - [12.3 判断式](#123-判断式)
    - [12.3.1 利用 test 指令的测试功能](#1231-利用-test-指令的测试功能)
    - [12.3.2 利用判断符号 []](#1232-利用判断符号-)
    - [12.3.3 shell 脚本的默认变量](#1233-shell-脚本的默认变量)
  - [12.4 条件判断式](#124-条件判断式)
    - [12.4.1 利用 if...then](#1241-利用-ifthen)
    - [12.4.2 利用 case...esac 判断](#1242-利用-caseesac-判断)
    - [12.4.3 利用 function 功能](#1243-利用-function-功能)
  - [12.5 循环](#125-循环)
    - [12.5.1 while do done, until do done](#1251-while-do-done-until-do-done)
    - [12.5.2 for...do...done](#1252-fordodone)
    - [12.5.3 for...do...done 的数值处理](#1253-fordodone-的数值处理)
  - [12.6 shell script 的追踪与 debug](#126-shell-script-的追踪与-debug)

<!-- /TOC -->

## 11.1 基础正则表达式

正则表达式基本上是⼀种“表达式”，只要⼯具程序⽀持这种表达式，那么该⼯具程序就可以⽤正则表达式进行
字串处理。例如 vi, grep, awk, sed 等等⼯具，因为它们有⽀持正则表达式，所以这些⼯具就可以使⽤
正则表达式的特殊字符来进⾏字串的处理。但例如 cp, ls 等指令并未⽀持正则表达式，所以就只能使⽤
bash ⾃⼰本⾝的通配符⽽已。   

然而其实之所以正则和通配符容易混，因为这两个东西有相交的地方，比如字符集，另外，在很多命令的使用
的时候，正则和通配符并没有明确的区分说我这个参数是一个正则表达式。   

但是呢两者之间也有相差的地方，例如：   

- .小数点在正则中表示一个任意字符
- *在通配符表示0到任意多个字符，而在正则中表达前一个字符重复0到多次    

不过这 TM 在既能使用通配符又能使用正则的命令中该怎么区分啊。   

特殊符号 | 含义
----------|---------
 [:alnum:] | 代表大小写字母和数字，即0-9, a-z, A-Z
 [:alpha:] | 大小写字母 a-z, A-Z
 [:blank:] | 空白键和 tab 键
 [:cntrl:] | 控制按键
 [:digit:] | 数字
 [:graph:] | 除空白字符外的其他字符
 [:lower:] | 小写字母
 [:print:] | 可打印字符
 [:punct:] | 标点字符
 [:upper:] | 大写字符
 [:space:] | 会产生空白的字符
 [:xdigit:] | 代表16进制的字符，包括 0-9, A-F, a-f     

```shell
$grep [-A] [-B] [--color=auto] '查找字符串' filename

-A：后面可加数字，为 after 的意思，除了列出该行外，后续的n行也列出来
-B：后面可加数字，为 before 的意思，除了列出该行外，前面的n行也列出来
```     

### 11.1.1 基础正则表达式特殊字符汇整


字符 | 含义
----------|---------
 `^word` | 行首
 `word$` | 行尾
 `.` | 一定有一个任意字符
 `\` | 转义符
`*` | 重复0到任意次
`[list]` | 字符集
`[n1-n2]` | 字符集
`[^list]` | 反向字符集
`{n, m}` | 略。    

但因为 { 与 } 的符号在 shell 是有特殊意义的，因此如果我们要使⽤它表示重复次数，必须转义。   

### 11.1.2 sed

sed 也是一个管道命令。可以分析 stdin，可以将数据进行替换、删除、新增、截取特定行等功能。      

```shell
$sed [-nefr] [动作]
```

- `-n`: 使用安静模式，一般用法中，所有来自标准输入的数据都会列到屏幕上，加上 -n 之后，只有经过
sed 处理的数据才会列出来
- `-e`: 直接在命令行界面上进行 sed 的动作编辑
- `-f`: 直接将 sed 动作写在一个文件内，-f filename 则可以执⾏ filename 内的 sed 动作
- `-r`: sed的动作支持的是扩展正则表达式的语法，默认是基础正则
- `-i`: 直接修改读取的文件内容，而不是由屏幕输出

动作说明：`[n1[,n2]]function`   

n1, n2：不见得会存在，一般代表“选择进行动作的行数”，举例来说，如果我的动作是需要在10到20行之间
进行的，则 `10,20[action]`

function 包含以下的内容：   

- a: 新增，a的后面可以接字符串，而这些字符串会在新的一行出现
- c: 替换，c的后面可以接字符串，这些字符串可以取代n1,n2之间的行
- d：删除
- i: 插入，后面可以接字符串，会在新的一行出现，不过是在当前的上一行
- p：打印
- s：替换，通过这个东西搭配正则


以行为单位的新增和删除：    

```shell
# 将 /etc/passwd 的内容列出并打印行号，将 2-5 行shan'c
$nl /etc/passwd | sed '2,5d'
1	  ##
6   # Open Directory.
7	  #
8	  # See the opendirectoryd(8) man page for additional information about
9	  # Open Directory.
10	##
...

# 在第 2 行后，即第三行加上 Drink tea or drink beer，然而这种写法在 OSX 上报错
$nl /etc/passwd | sed '2a Drink tea or drink beer'

# 在第 2 行后，加上两行内容
$nl /etc/passwd | sed '2a Drink tea or ... \
> drink beer ?'
     1	root:x:0:0:root:/root:/bin/bash
     2	daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
Drink test or ...
drink beer ?
....
```   

如果要删除第3到最后一行 `sed '3,$d'`，$ 代表最后一行。   

第二个例子是添加多行内容，需要使用 `\` 分隔。     

以行为单位的替换和显示功能：     

```shell
$nl /etc/passwd | sed '2,5c No 2-5 number'
$nl /etc/passwd | sed -n '10,20p'
$sed 's/old/new/g'
```    

## 11.2 扩展正则表达式

特殊符号：   

- `+`: 一个及一个以上的重复
- `?`: 零或一次重复
- `|`: 分组吧
- `()`: 也叫分组？

## 11.3 文件的格式化与相关处理

### 11.3.1 格式化打印：printf

```shell
$printf '打印格式' 实际内容

格式：
\a：警告声音输出
\b：退格键
\f：清除屏幕
\n：输出新的一行
\r：回车键
\t：水平制表符
\v：垂直制表符
\xNN：NN为数字，应该是数字编码

C中常见的变量格式：
%ns  那个 n 是数字，s 代表 string，即多少个字符
%ni  n是数字，i代表整数，即多少位整数
%N.nf  n和N都是数字，f代表floating
```    

### 11.2.2 数据处理工具 awk

sed 通常作用与一整行的处理，awk则比较倾向与一行当中分成数个字段来处理。回想一下，cut 只能做切割
处理，但是不能做任何的修改操作。       

```shell
$awk '条件类型1{动作1} 条件类型2{动作2} ....' filename
```    

awk 可以处理后面接的文件，也可以读取来自前个命令的标准输出。awk 主要是处理每一行的字段内的数据，
而默认的字段的分隔符号为空白键或者tab键。     

```shell
# 取出前 5 行，然后取出账号和登录 IP，且账号和登录 IP 之间用 tab 分隔
$last -n 5 | awk '{print $1 "\t" $3}'
```    

话说这个 "\t" 两边的空格不影响吗。。。   

$1, $3 是变量名称，$0 指一整行数据，由此可知，整个 awk 的处理流程是：    

1. 读入第一行，并将第一行的数据填入 $0, $1, $2。。。等变量中
2. 依据“条件类型”的限制，判断是否需要进行后面的动作
3. 做完所有的动作与条件类型
4. 若还有后续的行的数据，则重复1-3的步骤，知道所有数据都读完      

awk 的内置变量：    

+ NF：每一行拥有的字段总数
+ NR：目前 awk 所处理的是第几行数据
+ FS：目前的分隔字符，默认是空格键     

```shell
$last -n 5 | awk '{print $1 "\t lines: " NR "\t columns: " NF}'
```    

awk 的逻辑运算字符：>, <, >=, <=, ==, !=。      

```shell
$cat /etc/passwd | awk '{FS=":"} $3 > 10 {print $1 "\t" $3}'
$cat /etc/passwd | awk 'BEGIN {FS=":"} $3 > 10 {print $1 "\t" $3}'
```

除了 BEGIN，还有END 关键字。     

# 第 12 章 Shell Scripts

## 12.1 什么是 shell script

在shell script 的编写中需要注意以下事项：    

1. 空白行会被忽略掉，tab 键的空白同样视为空白
2. 如果读取到一个回车符，就尝试开始执行该命令
3. 如果一行内容太多，则可以使用回车符来延伸至下一行
4. # 为注释，任何 # 后面的数据都将被视为注释      

执行 shell scripts 有如下的方法：   

+ 直接运行，脚本文件必须要有可读和可执行的权限，可以通过绝对路径，相对路径和变量 PATH 来执行
+ 以bash 程序来执行，通过 `bash shell.sh` 或者 `sh shell.sh`     

```shell
#!/bin/bash
#	Program:
#							This	program	shows	"Hello	World!"	in	your	screen.
#	History:
#	2015/07/16				VBird				First	release
PATH=/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin:~/bin
export	PATH
echo	-e	"Hello	World!	\a	\n"
exit	0
```    

1. 第一行的 `#!/bin/bash` 是在告诉我们这个脚本使用的 shell 的名称，因为我们使用的是 bash，必须要以 `#!/bin/bash` 来告知这个文件的语法使用 bash 的语法。     

## 12.2 简单的脚本练习

### 12.2.1 简单范例

```shell
#!/bin/bash

read -p "Please enter your firstname: " firstname
read -p "Please enter your lastname: " lastname
echo "Your name is ${firstname} ${lastname}"
```    

由于 bash 只能计算整数数据，所有计算含有小数点的数据时，可以通过 `bc` 这个指令的协助：     

```shell
$echo "123.123*55.9" | bc
6882.575
```   

### 12.2.2 script 的执行方式差异

不同的脚本执行方式会造成不同的结果，脚本执行的方式除了前面谈到的方式，还可以利用source或者小数点来执行。     

+ 利用直接执行的方式来执行脚本，或者是利用 bash 来下达脚本时，该脚本都会使用一个新的 bash 环境来执行脚本内的指令。也就是说，使用这种方式执行时，其实脚本是在子程序的 bash 内执行的。
+ 利用 source 来执行脚本，在父程序中执行。    

## 12.3 判断式

### 12.3.1 利用 test 指令的测试功能

```shell
$test -e /dengbo && echo "exists" || echo "not exists"
```   

根据传入参数的不同，test 的行为是不同的：    

+ -e：文件名是否存在
+ -f：文件名是否存在且为文件
+ -d：文件名是否存在且为目录
+ -b：文件名是否存在且为块设备
+ -c：文件名是否存在且为字符设备
+ -S：文件名是否存在且为socket文件
+ -p：文件名是否存在且为一个FIFO管道文件
+ -L：文件名是否存在且为链接文件
+ -r：文件是否有可读权限
+ -w：文件是否有可写权限
+ -x：文件是否有可执行权限
+ -u：文件是否有 SUID 属性
+ -g：文件是否有 SGID 属性
+ -k：文件是否有粘滞位属性
+ -s：文件是否为空白文件   

剩下的还有很多可以判断两个文件时间的新旧，两个数字，两个字符串等。    

### 12.3.2 利用判断符号 []

使用中括号必须要特别注意，因为中括号用在很多地方，包括通配符和正则表达式，如果要在 bash 的语法中使用中括号作为 shell 的判断式时，必须要注意中括号的两端需要有空白字符来分隔。     

```shell
#!/bin/bash
#	Program:
#					This	program	shows	the	user's	choice
#	History:
#	2015/07/16				VBird				First	release
PATH=/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin:~/bin
export	PATH
read	-p	"Please	input	(Y/N):	"	yn
[	"${yn}"	==	"Y"	-o	"${yn}"	==	"y"	]	&&	echo	"OK,	continue"	&&	exit	0
[	"${yn}"	==	"N"	-o	"${yn}"	==	"n"	]	&&	echo	"Oh,	interrupt!"	&&	exit	0
echo	"I	don't	know	what	your	choice	is"	&&	exit	0
```     

### 12.3.3 shell 脚本的默认变量

```
/path/to/scriptname  opt1 opt2 opt3 opt4
      $0              $1   $2   $3   $4
```     

+ $#：代表后接的参数的参数，以上面为例就是4
+ $@：代表 "$1""$2""$3""$4" 之意
+ $*：略。   

`shift` 会移动变量，而且 `shift` 后面可以接数字，代表拿掉最前面的几个参数的意思。      

## 12.4 条件判断式

### 12.4.1 利用 if...then

如果只有一个判断式要进行，那么可以简单的这样看：    

```shell
if [条件判断式]; then
  当条件判断式成立时，可以进行的指令工作内容
fi  # 结束if之意
```    

当有多个条件要判别时，可以将多个条件写入一个中括号内，还可以有多个隔开的中括号，而括号和括号之间，则以 && 或 || 来隔开。      

当有多重、复杂的条件判断式时，可以使用类似下面的语法：    

```shell
if [ 条件判断式一 ]; then
  当一成立时的内容
elif [ 条件判断式二 ]; then
  二成立时的内容
else
  一二都不成立时的内容
fi
```    

### 12.4.2 利用 case...esac 判断

```shell
case $变量名称 in
  "第一个变量内容")
    程序段
    ;;
  "第二个变量内容")
    程序段
    ;;
  *)      # 最后一个变量内容会用 * 代表其他值，类似 default 的功能
    exit 1
    ;;
esac
```   

### 12.4.3 利用 function 功能

函数的语法如下：    

```shell
function fname() {
  code
}
```    

由于脚本执行的顺序是从上到下，所以函数一定要在使用前定义。函数内也是拥有内置变量的，他的内置变量与脚本的很类似，$0表示函数名称，而后面接的变量即 $1, $2。    

调用的时候貌似是这个样子 `fname argu1 argu2`。    

## 12.5 循环

### 12.5.1 while do done, until do done

```shell
while [ condition ]
do
  code
done    # done 是循环的结束
```   

另外一种形式是：    

```shell
until [ condition ]
do
  code
done 
```    

这种格式与 `while` 相反，当条件成立时就终止循环。    

```shell
#!/bin/bash

declare -i count=0

while [ "$count" -lt 10 ]
do
  count=$(( count + 1 ))
  echo $count
done
```     

### 12.5.2 for...do...done

这里提了个醒，像是 while 和 do...while 都是不定循环，在执行循环前我们不知道循环会执行几次，但是 for 循环就是固定循环，在执行循环前就基本上知道要进行多少次循环。     

```shell
for var in con1 con2 con3 ...
do
  code
done
```    

以上面的例子来说，这个 $var 的变量内容在循环工作时：    

1. 第一次循环时，$var 的内容为 con1
2. 第二次循环时，$var 的内容为 con2
3. 第三次循环时，$var 的内容为 con3

一种序列的表示方法： `{1..5}`    

### 12.5.3 for...do...done 的数值处理

除了上述的方法外，for 循环还有一种写法，语法如下：    

```shell
for (( 初始值; 限制值; 执行步阶))
do
  code
done
```     

## 12.6 shell script 的追踪与 debug

```shell
$sh [-nvx] script.sh

-n：不要执行脚本，仅检查语法问题
-v：在执行脚本前，先将脚本的内容输出到屏幕上
-x：将使用到的脚本内容显示到屏幕上