# 第 3 章 SQL

## 3.1 SQL 查询语言概览

SQL 语言有以下几个部分：   

+ **数据定义语言**：SQL DDL 提供了定义关系模式、删除关系以及修改关系模式的命令。
+ **数据操纵语言**：SQL DML 提供从数据库中查询信息，以及在数据库中插入元祖、删除元祖、修改元祖的能力。
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
+ **int**：整数类型，等价于全称 integet。
+ **smallint**：小整数类型。
+ **numeric**(p, d)：定点数，精度由用户指定。这个数有 p 位数字，其中 d 位在小数点左边。
+ **real, double precision**：浮点数与双精度浮点数。
+ **float**(n)：精度至少为 n 位的浮点数。     

每种类型都可能包含一个被称作空值的特殊值。    

如果 char 类型的字符串位数不够，则会在字符串末尾追加空格。     

### 3.2.2 基本模式定义

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

SQL 支持许多不同的完整性约束：    

+ **primary key(A1, A2, ... An)**：主码属性必须非空且唯一。
+ **foreign key(A1, A2, ... An) references r**
+ **not null**：这个约束是跟在每个属性后面的，不是写在所有属性后的完整性约束中。     

`drop table r`删除表。     

使用 `alter table` 命令为已有关系增加属性。关系中的所有元祖在新属性上的取值将被设为 null。
`alter table` 命令的格式为：    

`alter table r add A D`    

可以通过 `alter table r drop A` 从关系中去掉属性。很多数据库系统并不支持去掉属性。    

## 3.3 SQL 查询的基本结构

SQL 查询的基本结构由三个字句构成：**select, from 和 where**。       

### 3.3.1 单关系查询

```sql
select name
from instructor
```   

在 select 后加入关键词 **distinct** 可以去除重复。   

select 子句还可带含有 +, -, *, \运算符的算术表达式，运算对象可以是常数或元祖的属性。    

SQL 允许在 where 子句中使用逻辑连词 **and, or 和 not**。逻辑连词的运算对象可以是包含比较
运算符 <, <=, >, >=, <>的表达式。SQL 允许我们使用比较运算符来比较字符串、算术表达式以及特殊类型，
如日期类型。       

### 3.3.2 多关系查询

一个 SQL 查询可以包括三种类型的子句：select 子句、from 子句和 where 子句。每种子句的作用如下：   

+ **select** 子句用于列出查询结果中所需要的属性。
+ **from** 子句是一个查询求值中需要访问的关系列表。
+ **where** 子句是一个作用在 from 子句中关系的属性上的谓词。     

```sql
select A1, A2, ....An
from r1, r2, ... rn
where P;
```     

尽管各子句必须以 **select**、**from**、**where** 的次序写出，但理解查询所代表运算的最容易的方式
是以运算的顺序来考察各子句：首先是 from,然后是 where，最后是 select。      

### 3.3.3 自然连接

**自然连接**运算作用于两个关系，并产生一个关系作为结果。不同于两个关系上的笛卡尔积，它将第一个
关系的每个元祖与第二个关系的所有元祖都进行连接；自然连接只考虑那些在两个关系模式中都出现的属性
上取值相同的元祖对。     

还要注意列出的属性的顺序：先是两个关系模式中的共同属性，然后是那些只出现在第一个关系模式中的
属性，最后是那些只出现在第二个关系模式中的属性。     

```sql
select A1, A2, ... An
from r1 natural join r2 natural join r3 .... natural join rm
where P;
``` 

为了发扬自然连接的优点，同时避免不必要的相等属性带来的危险，SQL 提供了一种自然连接的构造形式，允许用户
来指定需要哪些列相等。下面的查询说明了这个特征：   

```sql
select name, title
from (instructor natural join teaches) join course using (course_id)
```     

## 3.4 附加的基本运算

### 3.4.1 更名运算

SQL 提供了一个重命名结果关系中属性的方法。即使用如下形式的 **as** 子句：`old-name as new-name`。    

**as** 子句即可以出现在 **select** 子句中，也可以出现在 **from** 子句中。     

```sql
select T.name, S.course_id
from instructor as T, teaches as S
where T.ID = S.ID
```      

### 3.4.2 字符串运算

SQL 使用一对单引号来标示字符串，例如 'compute'。如果单引号是字符串的组成部分，那就用两个单引号
字符来表示，如字符串 'it's right' 可表示为 'it''s right'。    

在 SQL 标准中，字符串上的相等运算是大小写敏感的，然而一些数据库系统，如 MySQL 和 SQL Server,
在匹配字符串时并不区分大小写，不过这种默认方式是可以在数据库级或特定属性级被修改的。     

SQL 还允许在字符串上有多种函数，例如串联(使用"||")、提取子串、计算字符串长度、大小写转换（用
**upper(s)**或**lower(s)**）、去掉字符串后面的空格（**trim(s)**）。   

在字符串上可以使用**like**操作符来实现模式匹配。我们使用两个特殊的字符来描述模式：    

+ 百分号(%)：匹配任意子串
+ 下划线(_)：匹配任意一个字符     

为了使模式中能够包含特殊模式的字符（即%和_），SQL允许定义转义字符。转义字符直接放在特殊字符的前面，
表示该特殊字符被当成普通字符。我们在**like**比较运算中使用**escape**关键词来定义转义字符。   

+ `like 'ab\%cd%' escape '\'` 匹配所有以 'ab%cd'开头的字符串。     

SQL 允许使用 **not like**比较运算符搜寻不匹配项。     

### 3.4.3 select 子句中的属性说明

星号 '*' 可以用在 select 子句中表示所有的属性。    

```sql
select instructor.*
from instructor, teaches
where instructor.ID = teaches.ID
```    

表示 instructor 中的所有属性都被选中。形如 select * 的 select 子句表示from 子句结果关系中的所有属性
都被选中。    

### 3.4.4 排列元祖的显示次序

**order by**子句可以让查询结果中元祖按排列顺序显示。为了按字母顺序列出在 Physics 系的所有教师：    

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

## 3.5 集合运算

SQL 作用在关系上的 **union**、**intersect**和**except**运算对应于数学集合论中的并，交和差运算。

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

**intersect**运算也会自动去除重复。如果想要保留所有重复，就必须用 **intersect all**代替 **union**。    

### 3.5.3 差运算

此运算在执行集差操作之前自动去除输入中的重复。     

## 3.6 空值

空值给关系运算带来了特殊的问题，包括算术运算、比较运算和集合运算。      

如果算术表达式的任一输入为空，则该算术表达式（涉及诸如+,-,*,/）结果为空。    

SQL 将涉及空值的任何比较运算的结果视为**unknown** 。这就创建了除 true 和 false 之外的第三个逻辑值。     

由于在 where 子句的谓词中可以对比较结果使用诸如 **and**、**or** 和 **not** 的布尔运算，所以
这些布尔运算的定义也被扩展到可以处理 **unknown** 值。    

+ **and**：true and unknown 为 unknown, false and unknown 为 false, unknown and unknown 为unknown
+ **or**：true or unknown 为 true, false or unknown 为 unknown, unknown or unknown 为 unknown
+ **not**: not unknown 为 unknown     

如果 where 子句谓词对一个元祖计算出 false 或 unknown，那么该元祖不能被加入到结果集中。    

SQL 在谓词中使用特殊的关键词 is null 测试空值。使用 is not null 测试非空值。     

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

该查询的结果是一个具有单属性的关系，其中只包含一个元祖。      

有些情况下在计算聚集函数前需删除重复元祖。如果我们确实想删除重复元祖，可在聚集表达式中使用 **distince**。   

```sql
select count (distinct ID)
from teaches
where semester = 'Spring' and year = 2010;
```    

SQL 不允许在用 **count**(*) 时使用 **distinct**。      

### 3.7.2 分组聚集

有时候我们不仅希望将聚集函数作用在单个元祖集上，而且也希望将其作用到一组元祖集上；在SQL 中可用
**group by** 子句实现这个愿望。**group by**子句中给出的一个或多个属性是用来构造分组的。在
**group by**子句中的所有属性上取值相同的元祖将被分在一个元祖中。     

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
聚合成一个元祖了，那这个元祖的 name 一列到底要显示原先分组中哪一个元祖的 name，所以是冲突的。     

### 3.7.3 having 子句

有时候，对分组限定条件比对元祖限定条件更加有用。为表达这样的查询，我们使用 SQL 的 **having**子句。
**having** 子句的谓词在形成分组后才起作用，因此可以使用聚集函数：   

```sql
select dept_name, avg (salary) as avg_salary
from instructor
group by dept_name
having avg (salary) > 42000;
```    

与 **select**子句的情况类似，任何出现在 **having**子句中，但没有被聚集的属性必须出现在 **group by**
子句中，否则查询就被当成是错误的。（说实话，这个条件还没想到是怎么限制的）    

包含聚集、**group by**或**having**子句的查询的含义可通过下述操作序列来定义：    

1. 首先根据 **from** 子句来计算出一个关系
2. 如果出现了 **where** 子句，**where**子句中的谓词将应用到**from**子句的结果关系上
3. 如果出现了**group by**子句，满足**where**谓词的元祖通过**group by**子句形成分组
4. 如果出现了 **having** 子句，它将应用到每个分组上，不满足 **having**谓词的分组将被抛弃
5. **select** 子句利用剩下的分组产生出查询结果中的元祖，即在每个分组上应用聚集函数来得到当结果
元祖。      

### 3.7.4 对空值和布尔值的聚集

聚集函数根据以下原则处理空值：除了**count**(*)以外的所有聚合函数都忽略输入集合中的空值。由于空值
被忽略，有可能造成参加函数运算的输入值集合为空集。规定空集的 **count**运算值为 0，其他所有聚合运算
在输入为空集的情况下返回一个空值。     

在 SQL:1999 中引入了布尔数据类型，它可以取**true**,**false**和**unknown**三个值。有两个聚集函数：**some**
和**every**，可以用来处理布尔值的集合。      

## 3.8 嵌套子查询

子查询是嵌套在另一个查询中的 **select-from-where** 表达式。子查询可以嵌套在 **where** 和
**from** 子句中，嵌套在 where 子句中时，通常用于对集合的成员资格、集合的比较以及集合的基数进行检查。     

### 3.8.1 集合成员资格

连接词 **in** 测试元祖是否是集合中的成员，集合是由 **select** 子句产生的一组值构成的。连接词
**not in** 则测试元祖是否不是集合中的成员。     

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

至少比某一个要大在 SQL 中用 **> some**表示。SQL 也允许使用 **< some, <= some, >=some, =some, \<\>some**，
=some 等价于 in。    

结构 **> all** 对应于词组-比所有的都大。    

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

SQL 还有一个特性可测试一个子查询的结果中是否存在元祖。**exists** 结构在作为参数的子查询非空
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

老实说有点不理解上面这个查询啊，因为在子查询的时候 S 还没算出来吧，那到底是怎么计算的。    

上述查询还说明了 SQL 的一个特性，来自外层查询的一个相关名称可以用在 **where** 子句的子查询中。
使用了来自外层查询相关名称的子查询被称作**相关子查询**。    

在包含了子查询的查询中，在相关名称上可以应用作用域规则。根据此规则，在一个子查询中只能使用
子查询本身定义的，或者在包含此子查询的任何查询中定义的相关名称。如果一个相关名称既在子查询
中定义，又在包含此子查询的查询中定义，则子查询的定义有效。这条规则类似于编程语言中通用的变量作用域
规则。     

**not exists**。      

### 3.8.4 重复元祖存在性测试

SQL 提供一个布尔函数，用于测试在一个子查询的结果中是否存在重复元祖。如果作为参数的子查询结果
中没有重复的元祖，**unique** 结果将返回 true。     

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

略。     

### 3.8.6 with 子句

**with** 子句提供定义临时关系的方法，这个定义只对包含**with**子句的查询有效。    

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

我们只能删除整个元祖，而不能只删除某些属性上的值。    

```sql
delete from r
where P
```     

注意 **delete** 命令只能作用于一个关系，在极端情况下，where 子句可以为空，则会删除所有元祖。     

### 3.9.2 插入

要往关系中插入数据，我们可以指定待插入的元祖，或者写一条查询语句来生成待插入的元祖集合。     

```sql
insert into course
  values('CS-437', 'Database Systems', 'Comp.Sci', 4)
```     

考虑到用户可能不记得关系属性的排列属性，SQL 允许在 insert 语句中指定属性。     

```sql
insert into course (course_id, title, dept_name, credits)
  values('CS-437', 'Database Systems', 'Comp.Sci', 4)
```     

更通常的情况是，我们可能想在查询结果的基础上插入元祖。    

```sql
insert into instructor
  select ID, name, dept_name, 18000
  from student
  where dept_name = 'Music' and tot_cred > 144
```     

如果待插入元祖只给出模式中部分属性的值，那么其余属性将被赋空值，用 null 表示。    

### 3.9.3 更新

```sql
update  instructor
set salary = salary * 1.05
where salary < 70000
```    

