- 一个集群可以有一个物理数据库和多个逻辑数据库。
- 物理库，是数据库在物理存储设备上的物理表示和存储方式，包括数据文件、日志文件、索引文件等。创建 AnalyticDB for MySQL 集群时，会自动创建一个物理库。每一个物理库被切分为若干个分片（Shard）。这些分片分布到若干个节点组（Worker Group）上。每个分片都由一个独立的 Raft 组管理。
- 逻辑库（数据库）逻辑库，是数据库在逻辑上的组织结构，包括表、视图、索引等。CREATE DATABASE 创建的就是逻辑数据库。一个 AnalyticDB for MySQL 集群最多可创建 2048 个逻辑数据库。AnalyticDB for MySQL 文档中提到的数据库，都是指逻辑库。
- 分片可按分区键拆分为分区。分区键通常为日期时间列，以实现数据的生命周期管理。
- AnalyticDB for MySQL 的表分为分区表和复制表。
- 集群的每个 Shard 都会存储一份复制表的全量数据。因此，复制表中的数据量不宜过大，最好不超过 2 万行。
- AnalyticDB for MySQL 集群支持以下四个粒度的权限控制：
  - GLOBAL：集群级别。
  - DB：数据库级别。
  - TABLE：表级别。
  - COLUMN：列（字段）级别 。
- 云原生数据仓库 AnalyticDB MySQL 版数仓版的弹性模式采用了存储计算分离架构，您可以对计算资源进行弹性扩缩容。资源组功能可以对计算资源进行按需划分，不同资源组间的计算资源在物理上完全隔离。通过 AnalyticDB for MySQL 数据库账号绑定到不同的资源组，SQL 查询根据绑定关系路由至对应的资源组进行执行，从而满足集群内部多租户、混合负载的需求。

## 数据类型

- boolean
- tinyint: 1 字节
- smallint: 2 字节
- int, integer: 4 字节
- bigint: 8 字节
- float
- double
- decimal(m, d), numeric
- varchar
- binary: 二进制类型，对应 binary, varbinary, blob
- date: YYYY-MM-DD
- time: HH:MM:SS
- datetime: YYYY-MM-DD HH:MM:SS
- timestamp
- point

## 内置函数

### 控制流函数

```sql
CREATE TABLE conditiontest(a INT) DISTRIBUTED BY HASH(a);
INSERT INTO conditiontest VALUES (1),(2),(3);
```

#### CASE

```sql
CASE expression
  WHEN value THEN result
  [WHEN value THEN result]
  [ELSE result]
  END
```

CASE 表达式会依次对比 expression 和 value。如果 expression 和 value 相等，则返回 value 对应的 result；如果所有 value 都不等于 expression，则返回 ELSE 对应的 result。

```sql
SELECT a
  CASE a
    WHEN 1 THEN 'one'
    WHEN 2 THEN 'two'
    ELSE 'three'
  END as caseresult
FROM conditiontest;
```

```
+---+------------+
| a | caseresult |
+---+------------+
| 2 | two        |
| 1 | one        |
| 3 | three      |
+---+------------+
```

第二种用法：

```sql
CASE
    WHEN condition THEN result
    [WHEN condition THEN result...]
    [ELSE result]
    END
```

```sql
SELECT a,
      CASE
      WHEN a=1 THEN 'one1'
      WHEN a=2 THEN 'two2'
      ELSE 'three3'
      END as caseresult
FROM conditiontest;
```

#### IF

```sql
IF(condition, true_value)
SELECT IF((2+3) > 4, 7) as result
```

用法 2：

```sql
IF(condition, true_value, false_value)
SELECT IF((2+3) > 6, 7, 8) as result
```

#### IFNULL

如果 expr1 不为空，返回 expr1, 否则返回 expr2。

```sql
IFNULL(expr1, expr2)
```

#### NULLIF

```sql
NULLIF(expr1, expr2)
```

如果 expr1 与 expr2 值相等，结果返回 null；否则结果返回 expr1 的值。

### 算数运算符

`+, -, *, /, DIV, %或MOD, -`

### 日期和时间函数

就不展开说了，用法可以看文档

- adddate(expr, days): date `select adddate(date '2022-01-22',interval '3' day);`
- addtime
- covert_tz 转换时区
- curdate
- curtime
- date
- date_format

略。

## DDL

![create table](https://help-static-aliyun-doc.aliyuncs.com/assets/img/zh-CN/6159194271/CAEQQRiBgICUiOKH9hgiIDJlMWE1OWMzNGMyZjQ0ZDg5ZWU0N2FhZTQyZTNlODI44200870_20240207145342.700.svg)

```sql
CREATE DATABASE [IF NOT EXISTS] db_name;

USE db_name; // 使用数据库

DROP DATABASE db_name [CASCADE]

CREATE TABLE [IF NOT EXISTS] table_name
(
  { column_name column_type [column_attributes] [column constraints] [COMMENT 'column_comment']
    | table_constraints
  }
  [, ...]
)
[table_attribute]
[partition_options]
[storage_policy]
[block_size]
[engine]
[rt_engine]
[table_properties]
[AS query_expr]
[COMMENT 'table_comment']

column_attributes:
  [DEFAULT {constant | CURRENT_TIMESTAMP}]
  [AUTO_INCREMENT]

column_constraints:
  [{NOT NULL | NULL}]
  [PRIMARY KEY]

table_constraints:
  [{INDEX|KEY} [index_name] (column_name,...)]
  [{INDEX|KEY} [index_name] (column_name->'$[*]')]
  [FULLTEXT [INDEX|KEY] [index_name] (column_name) [index_option]] [,...]
  [PRIMARY KEY [index_name] (column_name,...)]
  [CLUSTERED KEY [index_name] (column_name,...)]
  [[CONSTRAINT [symbol]] FOREIGN KEY (fk_column_name) REFERENCES pk_table_name (pk_column_name)][,...]
  [ANN INDEX [index_name] (column_name,...) [index_option]] [,...]

table_attribute:
  DISTRIBUTE BY HASH(column_name,...) | DISTRIBUTE BY BROADCAST

partition_options:
  PARTITION BY
        {VALUE(column_name) | VALUE(date_format(column_name, 'format'))}
  LIFECYCLE N

storage_policy:
  STORAGE_POLICY= {'HOT'|'COLD'|'MIXED' {hot_partition_count=N}}

block_size:
  BLOCK_SIZE= VALUE

engine:
  ENGINE= 'XUANWU|XUANWU_V2'
```

AnalyticDB for MySQL 支持多种索引，包括 INDEX 索引、主键索引、聚集索引、外键索引、全文索引、向量索引等。一个表可以有一种或多种索引。

定义普通索引。INDEX 和 KEY 作用相同。

默认情况下，AnalyticDB for MySQL 自动为全表所有列创建索引。但是，如果您在建表时手动指定为某一列或某几列创建索引（例如 INDEX (id)），则 AnalyticDB for MySQL 不会再为表中其他列自动创建索引。

**主键中必须包含分布键和分区键，并且建议将分布键和分区键放在主键的前部。**

```sql
CREATE TABLE AS SELECT（CTAS）

CREATE TABLE [IF NOT EXISTS] <table_name> [table_definition]
[IGNORE|REPLACE] [AS] <query_statement>

CREATE TABLE new_customer
AS
SELECT * FROM customer;


ALTER TABLE table_name
  { ADD ANN [INDEX|KEY] [index_name] (column_name) [algorithm=HNSW_PQ ] [distancemeasure=SquaredL2]
  | ADD CLUSTERED [INDEX|KEY] [index_name] (column_name,...)
  | ADD [COLUMN] column_name column_definition
  | ADD [COLUMN] (column_name column_definition,...)
  | ADD [CONSTRAINT [symbol]] FOREIGN KEY (fk_column_name) REFERENCES pk_table_name (pk_column_name)
  | ADD FULLTEXT [INDEX|KEY] index_name (column_name) [index_option]
  | ADD {INDEX|KEY} [index_name] (column_name,...)
  | ADD {INDEX|KEY} [index_name] (column_name|column_name->'$.json_path',...)
  | ADD {INDEX|KEY} [index_name] (column_name->'$[*]')
  | COMMENT 'comment'
  | DROP CLUSTERED KEY index_name
  | DROP [COLUMN] column_name
  | DROP FOREIGN KEY symbol
  | DROP FULLTEXT INDEX index_name
  | DROP {INDEX|KEY} index_name
  | MODIFY [COLUMN] column_name column_definition
  | RENAME COLUMN column_name TO new_column_name
  | RENAME new_table_name
  | storage_policy
  | PARTITION BY VALUE(column_name|date_format(column_name,'format')) LIFECYCLE N
  }

  column_definition:
   column_type [column_attributes][column_constraints][COMMENT 'comment']

  column_attributes:
   [DEFAULT{constant|CURRENT_TIMESTAMP}|AUTO_INCREMENT]

  column_constraints:
   [NULL|NOT NULL]

  storage_policy:
   STORAGE_POLICY= {'HOT'|'COLD'|'MIXED' hot_partition_count=N}

DROP TABLE db_name.table_name;

CREATE
  [OR REPLACE]    // 如果存在重名视图，先删除重名的，再新建
  [SQL SECURITY { DEFINER | INVOKER }]    // 关于权限的问题
VIEW view_name
AS select_statement;

DROP VIEW [IF EXISTS] view_name

SHOW DATABASES;

SHOW TABLES [IN db_name];

SHOW COLUMNS IN db_name.table_name;

SHOW CREATE TABLE db_name.table_name;  // 查询建表的语句

SHOW GRANTS [FOR 'username'@'hostname'];

SHOW GRANTS; // 查看当前用户权限

SHOW INDEXES FROM db_name.;

```

## DML

```sql
INSERT [IGNORE]
  INTO table_name
  [( column_name [, ...] )]
  [VALUES]
  [(value_list [,...])]
  [query];

INSERT INTO customer
VALUES (1232455, 'dengbo4', 187, '北京', 20
	, '2024-10-23 15:22:00')
```

INSERT OVERWRITE SELECT 会先清空分区中的旧数据，再将新数据批量写入到分区。

- 如果表是分区表，INSERT OVERWRITE SELECT 只能覆盖数据涉及到的分区，数据未涉及的分区不会被清空并覆盖写入。
- 如果表是非分区表，INSERT OVERWRITE SELECT 会清空整表的旧数据，并批量写入新数据。

执行 INSERT ON DUPLICATE KEY UPDATE 语句时，AnalyticDB MySQL 版会首先尝试在表中插入新行，但如果新的数据与已有数据的主键重复，将使用 INSERT ON DUPLICATE KEY UPDATE 子句中指定的值更新现有行。AnalyticDB MySQL 版会根据待写入行是否存在选择对应的执行语句，规则如下：

- 待写入行不存在，则执行 INSERT 来插入新行，受影响的行数为 1。
- 待写入行存在，则执行 UPDATE 来更新现有行，受影响的行数也为 1。

```sql
UPDATE table_name
  SET assignment_list
  [WHERE where_condition]
  [ORDER BY ...]
  [LIMIT ...]
```

## SQL

- 表名和列名中如果含有关键字或者空格等字符，可以使用反引号（``）将其引起来。
- ALL 和 DISTINCT 关键字用于指定查询结果是否返回重复的行，默认值为 ALL，即返回所有匹配的行，DISTINCT 将从结果集中删除重复的行。
- LIMIT 子句用于限制最终结果集的行数，LIMIT 子句中通常会携带一个或两个数字参数，第一个参数指定要返回数据行的第一行的偏移量，第二个参数指定要返回的最大行数。
- UNION、INTERSECT 和 EXCEPT 用于将多个查询结果集进行组合，从而得到一个最终结果。
- 您可以使用 GROUP BY 子句根据指定的列对查询结果进行分析，也可以在 GROUP BY 子句中使用 GROUPING SETS、CUBE 或 ROLLUP，以不同的形式展示分组结果。
- 在 SQL 中，GROUP BY 子句用于将结果集按一个或多个列进行分组，以便对每个分组进行聚合操作。所以本质上，是把多行数据合并到一行进行展示，那这里其实就有几个问题，把几行合到一行是按照什么规则，合并成一行的数据怎么定，100 行的结果，怎么决定最后合并到几行内，这就解释了那几种限制怎么来的，首先，出现在 GROUP BY 中的列，我们称为分组列，或者聚合列，也就是按照这一列（几列）来决定哪些行合并成一个行，应该就是，这几列大家都一样的，就合到一行数据，那么就出现了另外一个问题，没有出现在分组列中的其他列，也就是非分组列，合到一起那用哪个值呢，无法决定，所以非分组列，理论上就都应该使用聚集函数进行聚集，最后聚到一个值。
- 所以，GROUP BY 中的列或表达式列表必须与查询列表中的非聚合表达式的列相同。
- HAVING 子句用于过滤 GROUP BY 分组聚合后的数据。HAVING 子句必须与聚合函数和 GROUP BY 子句一起使用，在分组和聚合计算完成后，再对分组进行过滤，筛选掉不满足条件的分组。本文介绍 HAVING 的用法和示例。

```sql
[ WITH with_query [, ...] ]
SELECT
[ ALL | DISTINCT ] select_expr [, ...]
[ FROM table_reference [, ...] ]
[ WHERE condition ]
[ GROUP BY [ ALL | DISTINCT ] grouping_element [, ...] ]
[ HAVING condition]
[ WINDOW window_name AS (window_spec) [, window_name AS (window_spec)] ...]
[ { UNION | INTERSECT | EXCEPT } [ ALL | DISTINCT ] select ]
[ ORDER BY {column_name | expr | position} [ASC | DESC], ... [WITH ROLLUP]]
[LIMIT {[offset,] row_count | row_count OFFSET offset}]


query
{ UNION [ ALL ] | INTERSECT | EXCEPT }
query


GROUP BY expression [, ...]
```
