# 第 17 章 创建函数     

## 17.7.1 基本的脚本函数     

有两种格式可以用来在 bash shell 脚本中创建函数。第一种格式采用关键字 function, 后跟分配给该代码块的函数名。   

```bash
function name {
    commands
}
```      

第二种形式：    

```bash
name() {
    commands
}
```    

### 17.1.2 使用函数     

只要指定函数名就行了。    

```bash
#!/bin/zsh    

function func1 {
    echo "This is an example of a function"
}

count=1

while [ $count -le 5 ]
do
    func1
    sleep 1
    count=$[ $count + 1 ]
done

echo "This is the end of the loop"
func1
```    

## 17.2 返回值     


bash shell 会把函数当作一个小型脚本，运行结束时会返回一个退出状态码，有3种不同的方法来为函数生成退出状态码。   

### 17.2.1 默认退出状态码    

默认情况下，函数的退出状态码是函数中最后一条命令返回的退出状态码。在函数执行结束后，可以用标准变量$?来确定函数的退出状态码。     

```bash
func1() {
    echo "trying to display a non-existent file"
    ls -l badfile
}
echo "testing the function: "
func1
echo "The exit status is: $?"
```     

但是这种情况你不知道其他命令是否有问题。   

### 17.2.2 使用 return 命令    

bash shell使用return命令来退出函数并返回特定的退出状态码。 return命令允许指定一个
整数值来定义函数的退出状态码。   

退出状态码必须是 0-255。    

如果在用$?变量提取函数返回值之前执行了其他命令，函数的返回值就会丢失。记住， $?
变量会返回执行的最后一条命令的退出状态码。    

### 17.2.3 使用函数输出    

```bash
#!/bin/zsh

echo -n "Enter a value: "
function db1 {
    read value
    echo $[ $value * 2 ]
}

result=$(db1)
echo "The new value is $result"
```    

## 17.3 在函数中使用变量     

### 17.3.1 向函数传递参数    

函数可以使用标准的参数环境变量来表示命令行上传给函数的参数。例如，函数名会在 $0 变量中定义，函数命令行上的任何参数
都会通过 $1, $2 等定义。也可以用特殊变量 $# 来判断传给函数的参数数目。    

在脚本中指定函数时，必须将参数和函数放在同一行，像这样：    

```bash
func1 $value1 10
```     

```bash
function addem {
    if [ $# -eq 0 ] || [ $# -gt 2 ]
    then
        echo -1
    elif [ $# -eq 1 ]
    then
        echo $[ $1 + $1 ]
    else
        echo $[ $1 + $2 ]
    fi
}

echo -n "adding 10 and 15: "
value=$(addem 10 15)
echo $value
echo -n "let's try adding just one number: "
value=$(addem 10)
echo $value
```    

由于函数使用特殊参数环境变量作为自己的参数值，因此它无法直接获取脚本在命令行中的参数值。    

### 17.3.2 在函数中处理变量     

给shell脚本程序员带来麻烦的原因之一就是变量的作用域。作用域是变量可见的区域。函数
中定义的变量与普通变量的作用域不同。也就是说，对脚本的其他部分而言，它们是隐藏的。    

函数使用两种类型的变量：   

- 全局变量
- 局部变量

局部变量，在变量声明前加上 local 关键字即可。   

```bash
local temp=$[ $value + 5 ]
```    

# 第 18 章 图形化桌面环境中的脚本编程     

## 18.1 创建文本菜单

### 18.1.1 创建菜单布局     

默认情况下，echo命令只显示可打印文本字符。在创建菜单项时，非可打印字符通常也很有用，比如制表符和换行符。要在echo命令中包含这些字符，必须用-e选项。    

```bash
echo -e "1.\tDisplay disk space"
```    

限制只读取一个字符：    

```bash
read -n 1 option
```    

### 18.1.5 使用 select 命令

select命令只需要一条命令就可以创建出菜单，然后获取输入的答案并自动处理。 select命令的格式如下。     

```bash
select variable in list
do
    commands
done
```     

```bash
#!/bin/zsh

function diskspace {
    clear
    df -k
}

function whoseon {
    clear
    who
}

function memusage {
    clear
    cat /Users/dengbo01/owner/tmp/shelltest/t11.sh
}

PS3="Enter option: "
select option in "Display disk space" "Display logged on users" "Display memory usage" "Exit program"
do
    case $option in
    "Exit program")
        break ;;
    "Display disk space")
        diskspace ;;
    "Display logged on users")
        whoseon ;;
    "Display memory usage")
        memusage ;;
    *)
        clear
        echo "Sorry, wrong selection" ;;
    esac
done
clear
```    

# 第 19 章 初识 sed 和 gawk

## 19.1 文本处理    

### 19.1.1 sed 编辑器

sed编辑器被称作流编辑器（ stream editor）。    

sed编辑器可以根据命令来处理数据流中的数据，这些命令要么从命令行中输入，要么存储在一个命令文本文件中。sed编辑器会执行下列操作。    

1. 一次从输入中读取一行数据
2. 根据所提供的编辑器命令匹配数据
3. 按照命令修改流中的数据
4. 将新的数据输出的 STDOUT


```bash
sed options script file
```    

选项：    

- `-e script`: 在处理输入时，将 script 中指定的命令添加到已有的命令中
- `-f file`: 在处理输入时，将 file 中指定的命令添加到已有的命令中
- `-n`: 不产生命令输出，使用 print 命令来完成输出

那这 script 和 file 有什么区别呢。注意这里和上面命令格式的 script 和 file 不一样，这里的 script 和 file 指的是选项的值了，和上面的就是命令参数的一部分。       

script参数指定了应用于流数据上的单个命令。如果需要用多个命令，要么使用-e选项在命令行中指定，要么使用-f选项在单独的文件中指定。     

默认情况下，会直接将命令应用的 STDIN 上。    

```bash
echo "This is a test" | sed 's/test/big test/'
```    

这个例子在sed编辑器中使用了s命令。s命令会用斜线间指定的第二个文本字符串来替换第一个文本字符串模式。    

重要的是，要记住，sed编辑器并不会修改文本文件的数据。它只会将修改后的数据发送到 STDOUT。     

要在 sed 命令行上执行多个命令时，使用 -e 选项。   

```bash
sed -e 's/brown/green/; s/dog/cat/' data1.txt
```    

命令之间必须用分号隔开，并且在命令末尾和分号之间不能有空格。    

最后，如果有大量要处理的 sed 命令，那么将它们放进一个单独的文件中通常会更方便一些。可以在 sed 命令中用 -f 选项来指定文件。   

```sed
# script1.sed

s/brown/green/
s/fox/elephant/
s/dog/cat/
```    

```bash
sed -f script1.sed data1.txt
```     

### 19.1.2 gawk 程序

在 gawk 编程语言中，你可以做下面的事情：    

- 定义变量来保存数据
- 使用算术和字符串操作符来处理数据
- 使用结构化编程概念来为数据处理增加处理逻辑
- 通过提取数据文件中数据元素，将其重新排列或格式化，生成格式化报告    

```bash
gawk options program file
```    

- `-F fs` 指定行中划分数据字段的字段分隔符
- `-f file` 从指定的文件中读取程序
- `-v var=value` 定义 gawk 程序中的一个变量及其默认值
- `-mf N` 指定要处理的数据文件中的最大字段数
- `-mr N` 指定数据文件中的最大数据行数
- `-W keyword` 指定 gawk 的兼容模式或警告等级    

gawk程序脚本用一对花括号来定义。你必须将脚本命令放到两个花括号（{}）中。     

```bash
gawk '{print "Hello World!"}'
```    

gawk 会给一行中的每个数据元素分配一个变量。默认情况下，gawk 会将如下变量分配给它在文本行中发现的数据字段：    

- $0 代表整个文本行
- $1 代表文本行中第1个数据字段
- $n 代表文本行中的第n个数据字段     

在文本行中，每个数据字段都是通过字段分隔符划分的。 gawk在读取一行文本时，会用预定
义的字段分隔符划分每个数据字段。 gawk中默认的字段分隔符是任意的空白字符（例如空格或制
表符）。       

```bash
gawk '{print $1}' data2.txt

gawk -F: '{print $1}' /etc/passwd
```      

多个命令用分号分割。    

```bash
echo "My name is Rich" | gawk '{$4="Christine"; print $0}'
```    

在处理数据前运行脚本。    

```bash
gawk 'BEGIN {print "The data3 File Contents:"} {print $0}' data3.txt
```    

后运行脚本。    

```bash
gawk 'BEGIN {print "The data3 File Contents:"} {print $0} END {print "End of File"}' data3.txt
```     

## 19.2 sed 编辑器基础

### 19.2.1 更多的替换选项    

s(substitute) 替换文本。    

默认只替换一行的第一个。如果想替换更多就得使用 flag。   

- 数字，表明文本将替换第几处模式匹配的地方
- g，表明新文本将会替换所有匹配的文本
- p，表明原先行的内容要打印出来
- w file，将替换的结果写到文件中    

选择其他字符作为替换命令中的字符串分割符。    

```bash
sed 's!/bin/bash!/bin/csh!' /etc/passwd
```    

### 19.2.2 使用地址   

默认情况下，在sed编辑器中使用的命令会作用于文本数据的所有行。如果只想将命令作用于特定行或某些行，则必须用行寻址（line addressing）。     

在sed编辑器中有两种形式的行寻址：    

- 以数字形式表示行区间
- 用文本模式来过滤出行     

当使用数字方式的行寻址时，可以用行在文本流中的行位置来引用。sed编辑器会将文本流中的第一行编号为1，然后继续按顺序为接下来的行分配行号。     

```bash
sed '2s/dog/cat/' data1.txt

sed '2,3s/dog/cat' data1.txt
```     

如果想将命令作用到文本中从某行开始的所有行，可以用特殊地址——美元符。   

```bash
sed '2,$/dog/cat/' data1.txt
```     

使用文本模式来过滤出命令要作用的行。    

```bash
sed '/Samantha/s/bash/csh/' /etc/passwd
```    

### 19.2.3 删除行     

