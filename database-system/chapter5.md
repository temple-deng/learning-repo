# 第 5 章 高级 SQL

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



