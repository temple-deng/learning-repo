# 第 5 章 高级 SQL

<!-- TOC -->

- [第 5 章 高级 SQL](#第-5-章-高级-sql)
  - [5.1 使用程序设计语言访问数据库](#51-使用程序设计语言访问数据库)
  - [5.2 函数和过程](#52-函数和过程)
    - [5.2.1 声明和调用 SQL 函数和过程](#521-声明和调用-sql-函数和过程)
    - [5.2.2 支持过程和函数的语言构造](#522-支持过程和函数的语言构造)
  - [5.3 触发器](#53-触发器)
    - [5.3.1 对触发器的需求](#531-对触发器的需求)
    - [5.3.2 SQL 中的触发器](#532-sql-中的触发器)

<!-- /TOC -->

## 5.1 使用程序设计语言访问数据库

可以通过以下两种方法从通用编程语言中访问 SQL:   

+ 动态 SQL：通用程序设计语言可以通过函数（对于过程式语言）或者方法（对于面对对象的语言）
来连接数据库服务器并与之交互。利用动态 SQL 可以在运行时以字符串形式构建 SQL 查询，提交
查询，然后把结果存入程序变量中，每次一个元祖。动态 SQL 的SQL 组件允许程序在运行时构建和
提交 SQL 查询。在这一章中，我们将介绍两种用于连接到 SQL 数据库并执行查询和更新的标准。
一种是JDBC，另一种是 ODBC。
+ 嵌入式 SQL：与动态 SQL 类似，嵌入式 SQL 提供了另外一种使程序与数据库服务器交互的手段。
然而，嵌入式 SQL 语句必须在编译时全部确定，并交给预处理器。预处理程序提交 SQL 语句到数据库
系统进行预编译和优化，然后它把应用程序中的 SQL 语句替换成相应的代码和函数，最后调用程序
语言的编译器进行编译。    

## 5.2 函数和过程

函数和过程允许“业务逻辑”作为存储过程记录在数据库中，并在数据库内执行。例如，大学里通常有
许多规章制度，规定在一个学期里每个学生能选多少课，在一年里一个全职的教师至少要上多少节课，
一个学生最多可以在多少个专业中注册，等等。尽管这样的业务逻辑能够被写成程序设计语言过程并
完全存储在数据库以外，但把它们定义成数据库中的存储过程有几个优点。例如，它允许多个应用
访问这些过程，允许当业务规则发生变化时进行单个点的改变，而不必改变应用系统的其他部分。
应用代码可以调用存储过程，而不是直接更新数据库关系。   

SQL 允许定义函数、过程和方法。定义可以通过 SQL 的有关过程的组件，也可以通过外部的程序设计
语言，例如 Java、C 或 C++。    

### 5.2.1 声明和调用 SQL 函数和过程

假定我们想要这样一个函数：给定一个系的名字，返回该系的教师数目。    

```sql
create function dept_count(dept_name varchar(20))
  return integer
  begin
  declare d_count integer;
    select count(*) into d_count
    from instructor
    where instructor.dept_name = dept_name
  return d_count;
  end
```    

这个函数可以用在返回教师数大于 12 的所有系的名称和预算的查询中：   

```sql
select dept_name, budget
from department
where dept_count(dept_name) > 12;
```    

SQL 标准支持返回关系作为结果的函数；这种函数称为 **表函数**。考虑如下的函数，该函数返回
一个包含某特定系的所有教师的表。注意，使用函数的参数时需要加上函数名作为前缀：   

```sql
create function instructor_of(dept_name varchar(20))
  return table (
    ID varchar(5),
    name varchar(20),
    dept_name varchar(20),
    salary numeric(8,2)
  )
return table
(
  select ID, name, dept_name, salary
  from instructor
  where instructor.dept_name = instructor_of.dept_name
);
```   

这个函数可以在如下一个查询中使用：   

```sql
select *
from table (instructor_of( 'Finance'))
```    

SQL 也支持过程。dept_count 函数也可以写成一个过程：   

```sql
create procedure dept_count_proc(in dept_name varchar(20), out d_count integer)
  begin
    select count(*) into d_count
    from instructor
    where instructor.dept_name = dept_count_proc.dept_name
  end
```   

关键字 `in` 和 `out` 分别表示待赋值的参数和为返回结果而在过程中设置值的参数。    

可以从一个 SQL 过程中或者嵌入式 SQL 中使用 `call` 语句调用过程：   

```sql
declare d_count integer;
call dept_count_proc ('Physics', d_count);
```     

SQL 允许多个过程同名，只要同名过程的参数个数不同。名称和参数个数用于标识一个过程。SQL 也
允许多个函数同名，只要这些同名的不同函数的参数个数不同，或者对于那些有相同参数个数的函数，
至少有一个参数的类型不同。   

### 5.2.2 支持过程和函数的语言构造

SQL 所支持的构造赋予了它与通用程序设计语言相当的几乎所有的功能。SQL 标准中处理这些构造的
部分称为 **持久存储模块** (Persistent Storage Module, PSM)。    

变量通过 `declare` 语句进行声明，可以是任意的合法 SQL 类型。使用 `set` 语句进行赋值。   

一个复合语句有 `begin...end` 的形式，在 `begin` 和 `end` 之间会包含复杂的 SQL 语句。可以在
复合语句中声明局部变量。一个形如 `begin atomic...end` 的复合语句可以确保其中包含的所有
语句作为单一的事务来执行。    

SQL:1999 支持 `while` 语句和 `repeat` 语句，语法如下：   

```sql
while 布尔表达式 do
  语句序列;
end while

repeat
  语句序列;
until 布尔表达式
end repeat
```    

还有 `for` 循环，它允许对查询的所有结果重复执行：   

```sql
declare n integer default 0;
for r as
  select budget from department
  where dept_name = 'Music'
do
  set n = n - r.budget
end for
```    

SQL 支持的条件语句包括 if-then-else 语句，语法如下：   

```sql
if 布尔表达式
  then 语句或复合语句
elseif 布尔表达式
  then 语句或复合语句
else 语句或复合语句
end if
```   

SQL 程序语言还支持发信号通知 **异常条件**，以及声明 **句柄** 来处理异常，代码如下：   

```sql
declare out_of_classroom_seats condition
declare exit handler for out_of_classroom_seats
begin
sequence of statements
end
```     

## 5.3 触发器

触发器是一条语句，当对数据库作修改时，它自动被系统执行。要设置触发器机制，必须要满足两个要求：    

+ 指明什么条件下执行触发器。它被分解为一个引起触发器被检测的事件和一个触发器执行必须满足的条件。
+ 指明触发器执行时的动作。      

### 5.3.1 对触发器的需求

触发器可以用来实现未被 SQL 约束机制指定的某些完整性约束。     

### 5.3.2 SQL 中的触发器

下面展示了如何使用触发器来确保关系 section 中属性 time_slot_id 的参照完整性。第一个触发器
的定义指明该触发器在任何一次对关系 section 的插入操作执行之后被启动，以确保所插入元祖的 time_slot_id
字段是合法的。一个 SQL 插入语句可以向关系中插入多个元祖，在触发器代码中的 **for each row**
语句可以显示地在每一个被插入的行上进行迭代。**referencing new row as** 语句建立了一个变量
nrow，用来在插入完成后存储所插入行的值。      

```sql
create trigger timeslot_check1 after insert on secion
referencing new row as nrow
for each row
when (nrow.time_slot_id not in (
  select time_slot_id
  from time_slot
))
begin
  rollback
end;

create trigger time_slot_check2 after delete on time_slot
referencing old row as orow
for each row
when (orow.time_slot_id not in (
  select time_slot_id
  from time_slot)
and orow.time_slot_id in (
  select time_slot_id
  from section)
)
begin
  rollback
end;
```     

对于更新来说，触发器可以指定哪个属性的更新使其执行；而其他属性的更新不会让它产生动作。    

`after update of takes on grade`。    

**referencing old row as**子句可以建立一个变量用来存储已经更新或删除行的旧值。**referencing new row as**
子句除了插入还可以用于更新操作。      

触发器可以在事件(insert, delete 或 update)之前触发，而不仅仅是事件之后。在事件之前被执行的触发器
可以作为避免非法更新、插入或删除的额外约束。为了避免执行非法动作而产生错误，触发器可以采取措施
来纠正问题，使更新、插入或删除操作合法化。     

我们可以对引起插入、更新或删除的 SQL 语句执行单一动作，而不是对每个被影响的行执行一个动作。
要做到这一点，我们用**for each statement**子句来替代**for each row**子句。可以用子句
**referencing old table as**或**referencing new table as**来指向包含所有的被影响的行的临时表。
临时表不能用于 before 触发器，但是可以用于 after 触发器，无论他们是语句触发器还有行触发器。     

触发器可以设为有效或者无效：默认情况下它们在创建时是有效的，但是可以通过使用
**alter trigger trigger_name disabled**(某些数据库使用另一种语法，比如**disable trigger trigger_name**)
将其设为无效。设为无效的触发器可以重新设为有效。通过使用命令 **drop trigger trigger_name**，
触发器也可以被丢弃，即将其永久移除。       



