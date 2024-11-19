# 第 3 章 SQL

<!-- TOC -->

- [第 3 章 SQL](#第-3-章-sql)
  - [3.1 SQL 查询语言概览](#31-sql-查询语言概览)
  - [3.2 SQL 数据定义](#32-sql-数据定义)
    - [3.2.1 基本类型](#321-基本类型)
    - [3.2.2 基本模式定义](#322-基本模式定义)
  - [3.3 SQL 查询的基本结构](#33-sql-查询的基本结构)
    - [3.3.1 单关系查询](#331-单关系查询)
    - [3.3.2 多关系查询](#332-多关系查询)
    - [3.3.3 自然连接](#333-自然连接)
  - [3.4 附加的基本运算](#34-附加的基本运算)
    - [3.4.1 更名运算](#341-更名运算)
    - [3.4.2 字符串运算](#342-字符串运算)
    - [3.4.3 select 子句中的属性说明](#343-select-子句中的属性说明)
    - [3.4.4 排列元组的显示次序](#344-排列元组的显示次序)
    - [3.4.5 where 子句谓词](#345-where-子句谓词)
  - [3.5 集合运算](#35-集合运算)
    - [3.5.1 并运算](#351-并运算)
    - [3.5.2 交运算](#352-交运算)
    - [3.5.3 差运算](#353-差运算)
  - [3.6 空值](#36-空值)
  - [3.7 聚集函数](#37-聚集函数)
    - [3.7.1 基本聚集](#371-基本聚集)
    - [3.7.2 分组聚集](#372-分组聚集)
    - [3.7.3 having 子句](#373-having-子句)
    - [3.7.4 对空值和布尔值的聚集](#374-对空值和布尔值的聚集)
  - [3.8 嵌套子查询](#38-嵌套子查询)
    - [3.8.1 集合成员资格](#381-集合成员资格)
    - [3.8.2 集合的比较](#382-集合的比较)
    - [3.8.3 空关系测试](#383-空关系测试)
    - [3.8.4 重复元组存在性测试](#384-重复元组存在性测试)
    - [3.8.5 from 子句中的子查询](#385-from-子句中的子查询)
    - [3.8.6 with 子句](#386-with-子句)
  - [3.9 数据库的修改](#39-数据库的修改)
    - [3.9.1 删除](#391-删除)
    - [3.9.2 插入](#392-插入)
    - [3.9.3 更新](#393-更新)

<!-- /TOC -->

## 3.1 SQL 查询语言概览

SQL 语言有以下几个部分：   

+ **数据定义语言**：SQL DDL 提供了定义关系模式、删除关系以及修改关系模式的命令。
+ **数据操纵语言**：SQL DML 提供从数据库中查询信息，以及在数据库中插入元组、删除元组、修改元组的能力。
+ **完整性**：SQL DDL 包括定义完整性约束的命令，保存在数据库中的数据必须满足所定义的完整性约束。
+ **视图定义**：SQL DDL 包括定义视图的命令。
+ **事务控制**：SQL 包括定义事务的开始和结束的命令。
+ **嵌入式 SQL 和动态 SQL**：嵌入式和动态SQL 定义SQL语句如何嵌入到通用变成语言中。
+ **授权**：SQL DDL 包括定义对关系和视图的访问权限的命令。    

## 3.2 SQL 数据定义

数据库中的关系集合必须由数据定义语言指定给系统。SQL 的 DDL不仅能够定义一组关系，还能够定义
每个关系的信息，包括：    

+ 每个关系的模式
+ 每个属性的取值类型
+ 完整性约束
+ 每个关系维护的索引集合
+ 每个关系的安全性和权限信息
+ 每个关系在磁盘上的物理存储结构    

### 3.2.1 基本类型

SQL 标准支持多种固有类型，包括：    

+ **char**(n)：固定长度的字符串，用户指定长度 n。也可以使用全称 character。
+ **varchar**(n)：可变长度的字符串，用户指定最大长度n。等价于全称 character varying。
+ **int**：整数类型（和机器相关的整数的有限子集），等价于全称 integet。
+ **smallint**：小整数类型（和机器相关的整数类型的子集）。
+ **numeric**(p, d)：定点数，精度由用户指定。这个数有 p 位数字（加上一个符号位），其中
d 位在小数点右边。
+ **real, double precision**：浮点数与双精度浮点数，精度与机器有关。
+ **float**(n)：精度至少为 n 位的浮点数。     

每种类型都可能包含一个被称作空值的特殊值。    

如果 char 类型的字符串位数不够，则会在字符串末尾追加空格。当比较两个 char 类型的值时，
如果它们的长度不同，在比较之前会自动在短值后面加上额外的空格以使它们的长度一致。    

### 3.2.2 基本模式定义

```sql
create table department
(
  dept_name varchar(20) not null,
  building varchar(15),
  budget numeric(12, 2),
  primary key (dept_name)
);
```

```sql
create table r
 (
   A1  D1,
   A2  D2,
   ...
   An  Dn,
   < 完整性约束1 >,
   < 完整性约束2 >
 );
```     

其中 r 是关系名，每过 Ai 是关系 r 模式中的一个属性名，Di 是属性 Ai 的域。`create table`
命令后面用分号结束，本章后面的其他 SQL 语句也是如此，在很多 SQL 实现中，分号是可选的。   

SQL 支持许多不同的完整性约束：    

+ **primary key(A1, A2, ... An)**：主码属性必须非空且唯一。这个非空是指每个属性列都不能为空。
+ **foreign key(A1, A2, ... An) references r**
+ **not null**：这个约束是跟在每个属性后面的，不是写在所有属性后的完整性约束中。     

使用 `insert` 插入数据：   

```sql
insert into instructor
  values(10211, 'Smith', 'Biology', 66000);
```   

使用 `delete` 从关系中删除元组 `delete from students` 将从关系中删除所有元组。   

`drop table r`删除表。     

使用 `alter table` 命令为已有关系增加属性。关系中的所有元组在新属性上的取值将被设为 null。
`alter table` 命令的格式为：    

`alter table r add A D`    

可以通过 `alter table r drop A` 从关系中去掉属性。很多数据库系统并不支持去掉属性。    

## 3.3 SQL 查询的基本结构

SQL 查询的基本结构由三个字句构成：**select, from 和 where**。查询的输入是在 from 子句
中列出的关系，在这些关系上进行 where 和 select 子句中指定的运算，然后产生一个关系作为
结果。       

### 3.3.1 单关系查询

```sql
select name
from instructor
```   

在关系模型的形式化数学定义中，关系是一个集合。因此，重复的元组不会出现在关系中。在实践中，
去除重复是相当费时的，所以 SQL 允许在关系以及 SQL 表达式结果中去除重复。   

在 select 后加入关键词 **distinct** 可以去除重复。也可以使用关键词 **all** 来显示指明
不去除重复：    

```sql
select distinct dept_name
from instructor;

select all dept_name
from instructor;
```   

select 子句还可带含有 +, -, *, \/ 运算符的算术表达式，运算对象可以是常数或元组的属性。    

```sql
select ID, name, dept_name, salary * 1.1
from instructor;
```   

**where** 子句允许我们只选出那些在 **from** 子句的结果关系中满足特定谓词的元组。   

```sql
select name
from instructor
where dept_name = 'Comp.Sci' and salary > 7000;
```   

SQL 允许在 where 子句中使用逻辑连词 **and, or 和 not**。逻辑连词的运算对象可以是包含比较
运算符 `<, <=, >, >=, <>` 的表达式。SQL 允许我们使用比较运算符来比较字符串、算术表达式
以及特殊类型，如日期类型。       

### 3.3.2 多关系查询

```sql
select name, instructor.dept_name, building
from instructor, department
where instructor.dept_name = department.dept_name
```   

一个 SQL 查询可以包括三种类型的子句：select 子句、from 子句和 where 子句。每种子句的作用如下：   

+ **select** 子句用于列出查询结果中所需要的属性。
+ **from** 子句是一个查询求值中需要访问的关系列表。
+ **where** 子句是一个作用在 from 子句中关系的属性上的谓词。     

```sql
select A1, A2, ....An
from r1, r2, ... rm
where P;
```     

尽管各子句必须以 **select**、**from**、**where** 的次序写出，但理解查询所代表运算的最容易的方式
是以运算的顺序来考察各子句：首先是 from,然后是 where，最后是 select。      

通过 **from** 子句定义了一个在该子句中所列出关系上的笛卡尔积。它可以用集合理论来形式化地
定义，但最好通过下面的迭代过程来理解，此过程可为 **from** 子句的结果关系产生元素。   

```
for each 元组 t1 in 关系 r1
  for each 元组 t2 in 关系 r2
    ...
      for each 元组 tm in 关系 rm
        把 t1, t2, ..., tm 连接成单个元组 t
        将 t 加入结果关系中
```   

通常来说，一个 SQL 查询的含义可以理解如下：   

1. 为 from 子句中所列出的关系产生笛卡尔积
2. 在步骤 1 的结果上应用 where 子句中指定的谓词
3. 对于步骤 2 结果中的每个元组，输出 select 子句中指定的属性（或表达式的结果）   

上述步骤的顺序有助于明白一个 SQL 查询的结果应该是什么样的，而不是这个结果是怎样被执行的。
在 SQL 的实际实现中不会执行这种形式的查询，它会通过（尽可能）只产生满足 where 子句谓词的
笛卡尔积元素来进行优化执行。   

### 3.3.3 自然连接

**自然连接**运算作用于两个关系，并产生一个关系作为结果。不同于两个关系上的笛卡尔积，它将第一个
关系的每个元组与第二个关系的所有元组都进行连接；自然连接只考虑那些在两个关系模式中都出现的属性
上取值相同的元组对。     

还要注意列出的属性的顺序：先是两个关系模式中的共同属性，然后是那些只出现在第一个关系模式中的
属性，最后是那些只出现在第二个关系模式中的属性。     

```sql
select name, course_id
from instructor natural join teaches;
```   

```sql
select A1, A2, ... An
from r1 natural join r2 natural join r3 .... natural join rm
where P;
``` 

为了发扬自然连接的优点，同时避免不必要的相等属性带来的危险，SQL 提供了一种自然连接的构造
形式，允许用户来指定需要哪些列相等。下面的查询说明了这个特征：   

```sql
select name, title
from (instructor natural join teaches) join course using (course_id)
```     

这其实已经不算自然连接了吧，这只能算普通的连接了吧。而且看起来 join 的优先级可能要高于
自然连接，不然为什么要加括号。   

## 3.4 附加的基本运算

### 3.4.1 更名运算

SQL 提供了一个重命名结果关系中属性的方法。即使用如下形式的 **as** 子句：`old-name as new-name`。    

**as** 子句即可以出现在 **select** 子句中，也可以出现在 **from** 子句中。用在 from 子句
中就是重命名关系。        

```sql
select T.name, S.course_id
from instructor as T, teaches as S
where T.ID = S.ID
```      

重命名关系的两个原因，一个是把长关系名替换为短的，另一个就是适用于需要比较同一个关系中的
元组的情况。为此我们需要把一个关系跟它自身进行笛卡尔积运算。   

### 3.4.2 字符串运算

SQL 使用一对单引号来标示字符串，例如 'compute'。如果单引号是字符串的组成部分，那就用两个单引号
字符来表示，如字符串 'it's right' 可表示为 'it''s right'。    

在 SQL 标准中，字符串上的相等运算是大小写敏感的，然而一些数据库系统，如 MySQL 和 SQL Server,
在匹配字符串时并不区分大小写，不过这种默认方式是可以在数据库级或特定属性级被修改的。     

SQL 还允许在字符串上有多种函数，例如串联(使用"||")、提取子串、计算字符串长度、大小写转换（用
**upper(s)** 或 **lower(s)**）、去掉字符串后面的空格（**trim(s)**）。不同的数据库系统
提供的字符串函数集是不同的。   

在字符串上可以使用 **like** 操作符来实现模式匹配。我们使用两个特殊的字符来描述模式：    

+ 百分号(%)：匹配任意子串
+ 下划线(_)：匹配任意一个字符     

```sql
select dept_name
from  department
where building like '%Watson%';
```

为了使模式中能够包含特殊模式的字符（即 % 和 _ ），SQL允许定义转义字符。转义字符直接放在特殊字符的前面，
表示该特殊字符被当成普通字符。我们在**like**比较运算中使用**escape**关键词来定义转义字符。   

+ `like 'ab\%cd%' escape '\'` 匹配所有以 'ab%cd'开头的字符串。     

也就是说用来表示转义字符的字符是自定义的。   

SQL 允许使用 **not like**比较运算符搜寻不匹配项。SQL:1999 还提供 **similar to** 操作，
它具备比 like 更强大的模式匹配能力，它的模式定义语法类似于 UNIX 中的正则表达式。     

### 3.4.3 select 子句中的属性说明

星号 '*' 可以用在 select 子句中表示所有的属性。    

```sql
select instructor.*
from instructor, teaches
where instructor.ID = teaches.ID
```    

表示 instructor 中的所有属性都被选中。形如 select * 的 select 子句表示from 子句结果关系中的所有属性
都被选中。    

### 3.4.4 排列元组的显示次序

**order by**子句可以让查询结果中元组按排列顺序显示。为了按字母顺序列出在 Physics 系的所有教师：    

```sql
select name
from instructor
where dept_name = 'Physics'
order by name;
```     

**order by** 子句默认使用升序，要说明排序顺序，我们可以用 **desc**表示降序，用 **asc**表示
升序。此外，排序可在多个属性上进行。假设我们希望按 salary 的降序列出整个 instructor 关系。
如果有几位教师的工资相同，将他们按名字的升序排列：    

```sql
select salary, name
from instructor
order by salary desc, name asc;
```    

### 3.4.5 where 子句谓词

SQL 提供了 **between** 比较运算符来说明一个值是小于或等于某个值，同时大于或等于另一个值的。类似地，
可以使用 **not between** 比较运算符。      

```sql
select name
from instructor
where salary between 9000 and 11000;
```

等价于：   

```sql
select name
from instructor
where salary >= 9000 and salary <= 11000;
```    

SQL 允许我们用记号 (v1, v2, ..., vn) 表示一个分量值分别为 v1, v2, ..., vn 的 n 维元组。
在元组上可以运用比较运算符，按字典顺序进行比较运算：    

```sql
select name, course_id
from instructor, teaches
where (instructor.ID, dept_name) = (teaches.ID, 'Biology');
```   

## 3.5 集合运算

SQL 作用在关系上的 **union**、**intersect** 和 **except**运算对应于数学集合论中的并，
交和差运算。

### 3.5.1 并运算

```sql
(
  select course_id
  from section
  where semester = 'Fall' and year = 2009
) union
(
  select course_id
  from section
  where semester = 'Spring' and year = 2010
)
```    

**union**运算自动去除重复。如果想保留所有重复，就必须用**union all** 代替 **union**。    

### 3.5.2 交运算

**intersect**运算也会自动去除重复。如果想要保留所有重复，就必须用 **intersect all** 代替
**intersect**。    

### 3.5.3 差运算

为了找出在 2009 年秋季学期开课但不在 2010 年春季学期开课的所有课程：   

```sql
(
  select course_id
  from section
  where semester = 'Fall' and year = 2009
)
except
(
  select course_id
  from section
  where semester = 'Spring' and year = 2010
)
```    

**except** 运算从其第一个输入中输出所有不出现在第二个输入中的元组。此运算在执行集差操作
之前自动取出输入中的重复。如果想保留重复，就使用 **except all**。   

结果中的重复元组数等于在 c1 中出现的重复元素中减去在 c2 中出现的重复元组数（前提是此差
为正）。因此，如果 ECE-101 在 2009 秋季开设 4 个课程，在 2010 年春季开设 2 个课程，那么
在结果中有 2 个 ECE-101 元组。   

## 3.6 空值

空值给关系运算带来了特殊的问题，包括算术运算、比较运算和集合运算。      

如果算术表达式的任一输入为空，则该算术表达式（涉及诸如 +,-,*,\/）结果为空。    

SQL 将涉及空值的任何比较运算的结果视为 **unknown** 。这就创建了除 true 和 false 之外
的第三个逻辑值。     

由于在 where 子句的谓词中可以对比较结果使用诸如 **and**、**or** 和 **not** 的布尔运算，所以
这些布尔运算的定义也被扩展到可以处理 **unknown** 值。    

+ **and**：true and unknown 为 unknown, false and unknown 为 false, unknown and unknown 为unknown
+ **or**：true or unknown 为 true, false or unknown 为 unknown, unknown or unknown 为 unknown
+ **not**: not unknown 为 unknown     

如果 where 子句谓词对一个元组计算出 false 或 unknown，那么该元组不能被加入到结果集中。    

SQL 在谓词中使用特殊的关键词 is null 测试空值。使用 is not null 测试非空值。     

```sql
select name
from instructor
where salary is null;
```    

某些 SQL 实现还允许我们使用子句 **is unknown** 和 **is not unknown** 来测试一个表达式
的结果是否为 unknown。   

在一个查询使用 **select distinct** 子句时，重复元组将被去除。为了达到这个目的，当比较
两个元组对应的属性值时，如果这两个值都是非空并且值相等，或者都是空，那么它们是相同的。所以
诸如 {('A', null), ('A', null)} 这样的两个元组拷贝被认为是相同的，即使在某些属性上存在
空值。使用 distinct 子句会保留这样的相同元组的一份拷贝。注意上述对待空值的方式与谓词中
对待空值的方式是不同的。   

## 3.7 聚集函数

聚集函数是以值的一个集合（集或多重集）为输入、返回单个值的函数。SQL 提供了五个固有聚集函数：   

+ 平均值：**avg**
+ 最大值：**max**
+ 最小值：**min**
+ 总和：**sum**
+ 计数：**count**     

sum 和 avg 的输入必须是数字集，但其他运算符还可用在非数字数据类型的集合上，如字符串。    

### 3.7.1 基本聚集

```sql
select avg(salary)
from instructor
where dept_name = 'Comp.Sci';
```    

该查询的结果是一个具有单属性的关系，其中只包含一个元组。      

有些情况下在计算聚集函数前需删除重复元组。如果我们确实想删除重复元组，可在聚集表达式中使用
**distinct**。   

```sql
select count (distinct ID)
from teaches
where semester = 'Spring' and year = 2010;
```    

SQL 不允许在用 **count**(*) 时使用 **distinct**。      

### 3.7.2 分组聚集

有时候我们不仅希望将聚集函数作用在单个元组集上，而且也希望将其作用到一组元组集上；在SQL 中可用
**group by** 子句实现这个愿望。**group by**子句中给出的一个或多个属性是用来构造分组的。在
**group by**子句中的所有属性上取值相同的元组将被分在一个元组中。     

```sql
select dept_name, avg (salary) as avg_salary
from instructor
group by dept_name;
```     

当 SQL 查询使用分组时，一个很重要的事情是需要保证出现在**select**语句中但没有被聚集的属性只能
是出现在**group by**子句中的那些属性。换句话说，任何没有出现在**group by**子句中的属性如果出现
在**select**子句中，则只能出现在聚集函数中，否则这样的查询就是错误的。     

比如说改一下上面的例子：   


```sql
select dept_name, name, avg (salary) as avg_salary
from instructor
group by dept_name;
```    

首先按 dept_name 分好组后计算每组的平均薪水，但是最后的结果中还有name 一列，但每组最后都
聚合成一个元组了，那这个元组的 name 一列到底要显示原先分组中哪一个元组的 name，所以是冲突的。     

看这个意思是因为，分组后最后的输出结果只输出一个元组。   

### 3.7.3 having 子句

有时候，对分组限定条件比对元组限定条件更加有用。例如，我们也许只对教师平均工资超过 42000
美元的系感兴趣。该条件并不针对单个元组，而是针对 group by 子句构成的分组。为表达这样的
查询，我们使用 SQL 的 **having**子句。**having** 子句的谓词在形成分组后才起作用，因此
可以使用聚集函数。所以其实 **having** 子句针对的是 **where** 子句上在限定条件上的不足。  

```sql
select dept_name, avg (salary) as avg_salary
from instructor
group by dept_name
having avg (salary) > 42000;
```    

与 **select**子句的情况类似，任何出现在 **having**子句中，但没有被聚集的属性必须出现在
**group by** 子句中，否则查询就被当成是错误的。    

包含聚集、**group by** 或 **having** 子句的查询的含义可通过下述操作序列来定义：    

1. 首先根据 **from** 子句来计算出一个关系
2. 如果出现了 **where** 子句，**where**子句中的谓词将应用到**from**子句的结果关系上
3. 如果出现了**group by**子句，满足**where**谓词的元组通过**group by**子句形成分组
4. 如果出现了 **having** 子句，它将应用到每个分组上，不满足 **having**谓词的分组将被抛弃
5. **select** 子句利用剩下的分组产生出查询结果中的元组，即在每个分组上应用聚集函数来得到当结果
元组。      

### 3.7.4 对空值和布尔值的聚集

聚集函数根据以下原则处理空值：除了**count**(*)以外的所有聚合函数都忽略输入集合中的空值。由于空值
被忽略，有可能造成参加函数运算的输入值集合为空集。规定空集的 **count**运算值为 0，其他所有聚合运算
在输入为空集的情况下返回一个空值。     

在 SQL:1999 中引入了布尔数据类型，它可以取**true**,**false**和**unknown**三个值。有两个聚集函数：**some**
和**every**，可以用来处理布尔值的集合。      

## 3.8 嵌套子查询

子查询是嵌套在另一个查询中的 **select-from-where** 表达式。子查询嵌套在 **where** 子句
中，通常用于对集合的成员资格、集合的比较以及集合的基数进行检查。  

想一下，首先查询的结果是一个关系，然后这个关系放在 where 子句中，那么其实就是对外部查询
的元组进行限定。  

### 3.8.1 集合成员资格

连接词 **in** 测试元组是否是集合中的成员，集合是由 **select** 子句产生的一组值构成的。连接词
**not in** 则测试元组是否不是集合中的成员。     

```sql
select distinct course_id
from section
where semester = 'Fall' and year = 2009 and course_id
  in (
    select course_id
    from section
    where semester = 'Spring' and year = 2010
  );
```     

**in** 和 **not in** 操作符也能用于枚举集合。    

```sql
select distinct name
from instructor
where name not in ('Mozart', 'Einstein')
```     

### 3.8.2 集合的比较

至少比某一个要大在 SQL 中用 **&gt; some**表示。SQL 也允许使用 **&lt; some, &lt= some**
**&gt;=some, =some, &lt;&gt;some**, =some 等价于 in。    

类似于 **some**，SQL 也允许 **&lt; all, &lt;= all, &gt; all, &gt;= all, =all** 和
**&lt;&gt; all** 的比较。   

```sql
select name
from instructor
where salary > all (
  select salary
  from instructor
  where dept_name = 'Biology'
);
```   

### 3.8.3 空关系测试

SQL 还有一个特性可测试一个子查询的结果中是否存在元组。**exists** 结构在作为参数的子查询非空
时返回**true**值。     

```sql
select course_id
from section as S
where semester = 'Fall' and year = 2009 and exists (
  select *
  from section as T
  where semester = 'Spring' and year = 2010 and T.course_id = S.course_id
);
```   

上述查询还说明了 SQL 的一个特性，来自外层查询的一个相关名称可以用在 **where** 子句的子查询中。
使用了来自外层查询相关名称的子查询被称作**相关子查询**。    

在包含了子查询的查询中，在相关名称上可以应用作用域规则。根据此规则，在一个子查询中只能使用
子查询本身定义的，或者在包含此子查询的任何查询中定义的相关名称。如果一个相关名称既在子查询
中定义，又在包含此子查询的查询中定义，则子查询的定义有效。这条规则类似于编程语言中通用的变量作用域
规则。     

**not exists**。      

### 3.8.4 重复元组存在性测试

SQL 提供一个布尔函数，用于测试在一个子查询的结果中是否存在重复元组。如果作为参数的子查询结果
中没有重复的元组，**unique** 结果将返回 true。     

```sql
select T.course_id
from course as T
where unique (
  select R.course_id
  from section as R
  where T.course_id = R.course_id and R.year = 2009
);
```    

**not unique**。     

### 3.8.5 from 子句中的子查询

SQL 允许在 **from** 子句中使用子查询表达式。在此采用的主要观点是：任何 select-from-where
表达式返回的结果都是关系，因而可以被插入到另一个 **select-from-where** 中任何关系可以
出现的位置。   

```sql
select dept_name, avg_salary
from (
  select dept_name, avg (salary) as avg_salary
  from instructor
  group by dept_name
)
where avg_salary > 42000;
```    

我们可以使用 **as** 子句给此子查询的结果关系起个名字，并对属性重命名：   

```sql
select dept_name, avg_salary
from (
  select dept_name, avg(salary)
  from instructor
  group by dept_name
) as dept_avg (dept_name, avg_salary)
where avg_salary > 42000;
```   

### 3.8.6 with 子句

**with** 子句提供定义临时关系的方法，这个定义只对包含**with**子句的查询有效。考虑下面的
查询，它找出具有最大预算值的系：    

```sql
with max_budget (value) as
  (
    select max(budget)
    from department
  )
select budget
from department, max_budget
where department.budget = max_budget.value
```      

## 3.9 数据库的修改

### 3.9.1 删除

我们只能删除整个元组，而不能只删除某些属性上的值。    

```sql
delete from r
where P
```     

注意 **delete** 命令只能作用于一个关系，在极端情况下，where 子句可以为空，则会删除所有元组。     

### 3.9.2 插入

要往关系中插入数据，我们可以指定待插入的元组，或者写一条查询语句来生成待插入的元组集合。     

```sql
insert into course
  values('CS-437', 'Database Systems', 'Comp.Sci', 4)
```     

考虑到用户可能不记得关系属性的排列属性，SQL 允许在 insert 语句中指定属性。     

```sql
insert into course (course_id, title, dept_name, credits)
  values('CS-437', 'Database Systems', 'Comp.Sci', 4)
```     

更通常的情况是，我们可能想在查询结果的基础上插入元组。    

```sql
insert into instructor
  select ID, name, dept_name, 18000
  from student
  where dept_name = 'Music' and tot_cred > 144
```     

如果待插入元组只给出模式中部分属性的值，那么其余属性将被赋空值，用 null 表示。    

### 3.9.3 更新

```sql
update  instructor
set salary = salary * 1.05
where salary < 70000
```    

SQL 提供 **case** 结构，我们可以利用它在一条 update 语句中执行前面的两种更新：   

```sql
update instructor
set salary = case
  when salary <= 100000 then salary * 1.05
  else salary * 1.03
  end
```    

case 语句的一般格式如下：   

```sql
case
  when pred1 then result1
  when pred2 then result2
  ...
  when predn then resultn
  else result0
end
```    

case 语句可以用在任何应该出现值的地方。   
