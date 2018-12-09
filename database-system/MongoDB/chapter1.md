# 第一部分 MongoDB 介绍

<!-- TOC -->

- [第一部分 MongoDB 介绍](#第一部分-mongodb-介绍)
- [第 1 章 MongoDB 简介](#第-1-章-mongodb-简介)
  - [1.1 易于使用](#11-易于使用)
  - [1.2 易于扩展](#12-易于扩展)
  - [1.3 丰富的功能](#13-丰富的功能)
  - [1.4 卓越的性能](#14-卓越的性能)
- [第 2 章 MongoDB 基础知识](#第-2-章-mongodb-基础知识)
  - [2.1 文档](#21-文档)
  - [2.2 集合](#22-集合)
    - [2.2.1 动态模式](#221-动态模式)
    - [2.2.2 命名](#222-命名)
  - [2.3 数据库](#23-数据库)
  - [2.5 MongoDB shell 简介](#25-mongodb-shell-简介)
    - [2.5.1 运行 shell](#251-运行-shell)
    - [2.5.2 MongoDB 客户端](#252-mongodb-客户端)
    - [2.5.3 shell 中的基本操作](#253-shell-中的基本操作)
  - [2.6 数据类型](#26-数据类型)
    - [2.6.1 基本数据类型](#261-基本数据类型)
    - [2.6.5 _id 和 ObjectId](#265-_id-和-objectid)
  - [2.7 使用 MongoDB shell](#27-使用-mongodb-shell)
    - [2.7.1 shell 小贴士](#271-shell-小贴士)
    - [2.7.2 使用 shell 执行脚本](#272-使用-shell-执行脚本)
    - [2.7.3 创建 mongorc.js 文件](#273-创建-mongorcjs-文件)
    - [2.7.4 定制 shell 提示](#274-定制-shell-提示)
    - [2.7.5 编辑复合变量](#275-编辑复合变量)
    - [2.7.6 集合命名注意事项](#276-集合命名注意事项)

<!-- /TOC -->

# 第 1 章 MongoDB 简介

## 1.1 易于使用

MongoDB 是一个面向文档（document-oriented）的数据库，而不是关系型数据库。不采用关系
模型主要是为了获得更好的扩展性。当然, 还有其他一些好处。    

与关系型数据库相比，面向文档的数据库不再有“行”（row）的概念，取而代之的是更为灵活的
“文档”（document）模型。通过在文档中嵌入文档和数组，面向文档的方法能够仅使用一条记录来
表现复杂的层次关系。    

另外，不再有预定义模式（predefined schema）：文档的键（key）和值（value）不再是固定的
类型和大小。由于没有固定的模式，根据需要添加或删除字段变得更容易了。    

## 1.2 易于扩展

纵向扩展（scale up）和横向扩展（scale out）之间的选择。纵向扩展就是使用计算能力更强的
机器，而横向扩展就是通过分区将数据分散到更多机器上。通常，纵向扩展是最省力的做法，其缺点
是大型机一般都非常昂贵。而且，当数据量达到机器的物理极限时，无论花多少钱也买不到更强的机器了。
另一个选择是横向扩展：要增加存储空间或提高性能，只需购买一台普通的服务器并把它添加到集群
中就可以了。横向扩展既便宜又易于扩展；不过，管理1000台机器比管理一台机器显然要困难得多。    

MongoDB的设计采用横向扩展。面向文档的数据模型使它能很容易地在多台服务器之间进行数据分割。
MongoDB能自动处理跨集群的数据和负载，自动重新分配文档，以及将用户请求路由到正确的机器上。
这样，开发者能够集中精力编写应用程序，而不需要考虑如何扩展的问题。如果一个集群需要更大的
容量，只需要向集群添加新服务器，MongoDB就会自动将现有数据向新服务器传送。    

## 1.3 丰富的功能

MongoDB作为一款通用型数据库，除了能够创建、读取、更新和删除数据之外，还提供一系列不断
扩展的独特功能。   

+ **索引**(indexing)：MongoDB支持通用二级索引，允许多种快速查询，且提供唯一索引、复合
索引、地理空间索引，以及全文索引。 ￼
+ **聚合**(aggregation)：MongoDB支持“聚合管道”（aggregation pipeline）。用户能通过
简单的片段创建复杂的聚合，并通过数据库自动优化。
+ **特殊的集合类型**：MongoDB支持存在时间有限的集合，适用于那些将在某个时刻过期的数据，
如会话（session）。类似地，MongoDB也支持固定大小的集合，用于保存近期数据，如日志。
+ **文件存储**：MongoDB支持一种非常易用的协议，用于存储大文件和文件元数据。    

MongoDB并不具备一些在关系型数据库中很普遍的功能，如连接（join）和复杂的多行事务
（multirow transaction）。    

## 1.4 卓越的性能

MongoDB能对文档进行动态填充（dynamic padding），也能预分配数据文件以利用额外的空间来
换取稳定的性能。MongoDB把尽可能多的内存用作缓存（cache），试图为每次查询自动选择正确的
索引。总之，MongoDB在各方面的设计都旨在保持它的高性能。    

# 第 2 章 MongoDB 基础知识

本章会介绍一些MongoDB的基本概念。   

+ **文档** 是MongoDB中数据的基本单元，非常类似于关系型数据库管理系统中的行，但更具表现力。
+ 类似地，**集合** 可以看作是一个拥有动态模式（dynamic schema）的表。
+ MongoDB的一个实例可以拥有多个相互独立的 **数据库**（database），每一个数据库都拥有自己的集合。
+ 每一个文档都有一个特殊的键"_id"， 这个键在文档所属的集合中是唯一的。
+ MongoDB自带了一个简单但功能强大的JavaScript shell，可用于管理MongoDB的实例或数据操作。    

## 2.1 文档

**文档** 是MongoDB的核心概念。文档就是键值对的一个有序集。每种编程语言表示文档的方法不太一样，
但大多数编程语言都有一些相通的数据结构，比如映射（map）、散列（hash）或字典（dictionary）。   

文档的键是字符串。除了少数例外情况，键可以使用任意UTF-8字符：   

+ 键不能含有\0（空字符）。这个字符用于表示键的结尾。
+ . 和 $ 具有特殊意义，只能在特定环境下使用（后面的章节会详细说明）。通常，这两个字符是
被保留的；如果使用不当的话，驱动程序会有提示。    

文档中的键/值对是有序的：｛"x" : 1, "y"：2｝与｛"y": 2, "x": 1｝是不同的。   

## 2.2 集合

集合就是一组文档。如果将MongoDB中的一个文档比喻为关系型数据库中的一行，那么一个集合就相当于一张表。   

### 2.2.1 动态模式

集合是 **动态模式** 的。这意味着一个集合里面的文档可以是各式各样的。例如，下面两个文档
可以存储在同一个集合里面：    

```js
{ "greeting": "Hello, world!" }
{ "foo": 5 }
```   

### 2.2.2 命名

集合使用名称进行标识。集合名可以是满足下列条件的任意UTF-8字符串：   

+ 集合名不能是空字符串（""）。
+ 集合名不能包含\0字符（空字符），这个字符表示集合名的结束。
+ 集合名不能以“system.”开头，这是为系统集合保留的前缀。例如，system.users这个集合保存
着数据库的用户信息，而system.namespaces集合保存着所有数据库集合的信息。
+ 用户创建的集合不能在集合名中包含保留字符 '$'。因为某些系统生成的集合中包含 $，很多驱动
程序确实支持在集合名里包含该字符。除非你要访问这种系统创建的集合，否则不应该在集合名中包含$    

组织集合的一种惯例是使用“.”分隔不同命名空间的子集合。例如，一个具有博客功能的应用可能
包含两个集合，分别是 blog.posts 和 blog.authors。这是为了使组织结构更清晰，这里的
blog 集合（这个集合甚至不需要存在）跟它的子集合没有任何关系。    

## 2.3 数据库

在 MongoDB 中，多个文档组成集合，而多个集合可以组成数据库。一个 MongoDB 实例可以承载
多个数据库，每个数据库拥有0个或者多个集合。每个数据库都有独立的权限，即便是在磁盘上，
不同的数据库也放置在不同的文件中。     

数据库通过名称来标识，这点与集合类似。数据库名可以是满足以下条件的任意UTF-8字符串。   

+ 不能是空字符串（""）
+ 不得含有 `/ \ . " * < > : | ?` 以及空格符合 \0 空字符。基本上，只能使用ASCII中的
字母和数字。
+ 数据库名区分大小写，即便是在不区分大小写的文件系统中也是如此。简单起见，数据库名应全部小写。
+ 数据库名最多为64字节。   

要记住一点，数据库最终会变成文件系统里的文件，而数据库名就是相应的文件名，这是数据库名有
如此多限制的原因。    

另外，有一些数据库名是保留的，可以直接访问这些有特殊语义的数据库。这些数据库如下所示：   

+ admin：从身份验证的角度来讲，这是“root”数据库。如果将一个用户添加到 admin 数据库，
这个用户将自动获得所有数据库的权限。再者，一些特定的服务器端命令也只能从admin数据库运行，
如列出所有数据库或关闭服务器。
+ local：这个数据库永远都不可以复制，且一台服务器上的所有本地集合都可以存储在这个数据库中。
+ config：MongoDB用于分片设置时，分片信息会存储在config数据库中。     

## 2.5 MongoDB shell 简介

MongoDB自带JavaScript shell，可在 shell 中使用命令行与 MongoDB 实例交互。   

### 2.5.1 运行 shell

```bash
$ mongo
MongoDB shell version v4.0.4
connecting to: mongodb://127.0.0.1:27017
Implicit session: session { "id" : UUID("f87e28c5-2acd-41c2-8ed2-e82ab2e17467") }
MongoDB server version: 4.0.4
Welcome to the MongoDB shell.
```   

shell是一个功能完备的JavaScript解释器，可运行任意JavaScript程序，那就是 node repl 了吧。   

### 2.5.2 MongoDB 客户端

shell的真正强大之处在于，它是一个独立的 MongoDB 客户端。启动时，shell 会连到 MongoDB
服务器的 test 数据库，并将数据库连接赋值给全局变量 db。这个变量是通过 shell 访问MongoDB
的主要入口点。

如果想要查看 db 当前指向哪个数据库，可以使用 db 命令：    

```repl
> db
test
```    

为了方便习惯使用 SQL shell 的用户，shell 还包含一些非 JavaScript 语法的扩展。这些扩展
并不提供额外的功能，而是一些非常棒的语法糖。例如，最重要的操作之一为选择数据库：    

```repl
> user foobar
switched to db foobar
```    

通过db变量，可访问其中的集合。例如，通过 db.baz 可返回当前数据库的 baz 集合。因为通过
shell 可访问集合，这意味着，几乎所有数据库操作都可以通过 shell 完成。    

### 2.5.3 shell 中的基本操作

在shell中查看或操作数据会用到4个基本操作：创建、读取、更新和删除（即通常所说的CRUD操作）   

1. **创建**    

**insert** 函数可将一个文档添加到集合中。举一个存储博客文章的例子。首先，创建一个名为
post 的局部变量，这是一个 JavaScript 对象，用于表示我们的文档。它会有几个键：
"title"、"content"和"date"（发布日期）。    

```
> post = { title: "My Blog Post", content: "Here is my blog post", date: new Date() }
{
	"title" : "My Blog Post",
	"content" : "Here is my blog post",
	"date" : ISODate("2018-12-08T11:42:37.973Z")
}
```   

这个对象是个有效的 MongoDB 文档，所以可以用 **insert** 方法将其保存到 blog 集合中：   

```
> db.blog.insert(post)
WriteResult({ "nInserted" : 1 })
```    

注意我们这里并没有先创建一个集合，不像关系数据库中你要往表中插入数据总得先建表。   

这篇文章已被存到数据库中。要查看它可用调用集合的 **find** 方法：   

```
db.blog.find()
{ "_id" : ObjectId("5c0bae4a62d5da76cf67beb3"), "title" : "My Blog Post", "content" : "Here is my blog post", "date" : ISODate("2018-12-08T11:42:37.973Z") }
```    

2. **读取**    

**find** 和 **findOne** 方法可以用于查询集合里的文档。若只想查看一个文档，可用 **findOne**：   

```
> db.blog.findOne()
{
	"_id" : ObjectId("5c0bae4a62d5da76cf67beb3"),
	"title" : "My Blog Post",
	"content" : "Here is my blog post",
	"date" : ISODate("2018-12-08T11:42:37.973Z")
}
```    

**find** 和 **findOne** 可以接受一个查询文档作为限定条件。这样就可以查询符合一定条件的
文档。使用 **find** 时，shell 会自动显示最多 20 个匹配的文档，也可获取更多文档。    

3. **更新**    

使用 **update** 修改博客文章。**update** 接受（至少）两个参数：第一个是限定条件（用于匹配
待更新的文档），第二个是新的文档。假设我们要为先前写的文章增加评论功能，就需要增加一个新
的键，用于保存评论数组。    

```
> post.comments = []
```    

然后执行 **update** 操作，用新版本的文档替换标题为“My Blog Post”的文章：   

```
> db.blog.update({ title: "My Blog Post"}, post)
WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
```    

现在，文档已经有了"comments"键。再用find查看一下，可以看到新的键：   

```
> db.blog.find()
{
	"_id" : ObjectId("5c0bae4a62d5da76cf67beb3"),
	"title" : "My Blog Post",
	"content" : "Here is my blog post",
	"date" : ISODate("2018-12-08T11:42:37.973Z"),
	"comments" : [ ]
}
```    

4. **删除**    

使用 **remove** 方法可将文档从数据库中永久删除。如果没有使用任何参数，它会将集合内的所有
文档全部删除。它可以接受一个作为限定条件的文档作为参数。例如，下面的命令会删除刚刚创建的文章：    

```
> db.blog.remove({title: "My Blog Post"})
WriteResult({ "nRemoved" : 1 })
```   

## 2.6 数据类型

### 2.6.1 基本数据类型

在概念上，MongoDB的文档与JavaScript中的对象相近，因而可认为它类似于JSON。JSON 仅包含
null、布尔、数字、字符串、数组和对象这 6 种数据类型，表达能力有限。   

MongoDB在保留JSON基本键/值对特性的基础上，添加了其他一些数据类型。 在不同的编程语言下，
这些类型的确切表示有些许差异。下面说明MongoDB支持的其他通用类型，以及如何在文档中使用它们。    

+ **null**: 用于表示空值或者不存在的字段    
+ **布尔型**: 布尔型有两个值
+ **数值**: shell 默认使用64位浮点型数值，对于整型值，可使用 **NumberInt**（表示 4 字节
带符号整数）或 **NumberLong**（表示 8 字节带符号整数）    
```
{ "x": NumberInt("3") }
{ "x": NumberLong("3") }
```   
+ **日期**: 日期被存储为自新纪元以来经过的毫秒数，不存储时区
+ **正则表达式**: 查询时，使用正则表达式作为限定条件，语法也与JavaScript的正则表达式语法相同
+ **数组**
+ **内嵌文档**: 文档可嵌套其他文档，被嵌套的文档作为父文档的值
+ **对象id**: 对象 id 是一个 12 字节的 ID，是文档的唯一标识。   
```
{ "x": ObjectId() }
```   
+ **二进制数据**: 二进制数据是一个任意字节的字符串。它不能直接在shell中使用。如果要将非
UTF-8字符保存到数据库中，二进制数据是唯一的方式。
+ **代码**: 查询和文档中可以包括任意 JS 代码    
```
{"x" : function() { /* ... */ }}
```    

另外，有几种大多数情况下仅在内部使用（或被其他类型取代）的类型。在本书中，出现这种情况时
会特别说明。    

### 2.6.5 _id 和 ObjectId

MongoDB中存储的文档必须有一个"_id" 键。这个键的值可以是任何类型的，默认是个 ObjectId 对象。
在一个集合里面，每个文档都有唯一的 "_id"，确保集合里面每个文档都能被唯一标识。如果有两个
集合的话，两个集合可以都有一个"_id"的值为123，但是每个集合里面只能有一个文档的"_id"值为123。    

ObjectId是 "_id" 的默认类型。它设计成轻量型的，不同的机器都能用全局唯一的同种方法方便地
生成它。这是 MongoDB 采用 ObjectId，而不是其他比较常规的做法（比如自动增加的主键）的主要
原因，因为在多个服务器上同步自动增加主键值既费力又费时。因为设计 MongoDB 的初衷就是用作
分布式数据库，所以能够在分片环境中生成唯一的标示符非常重要。    

ObjectId 的前 4 个字节是从标准纪元开始的时间戳，单位为秒。这会带来一些有用的属性：   

+ 时间戳，与随后的 5 字节组合起来，提供了秒级别的唯一性
+ 由于时间戳在前，这意味着 ObjectId 大致会按照插入的顺序排列，这对于某些方面很有用，比如
可以将其作为索引提高效率，但是这个是没有保证的，仅仅是大致
+ 这 4 字节也隐含了文档创建的时间，绝大多数驱动程序都会提供一个方法，用于从 ObjectId 获取
这些信息    

接下来的3字节是所在主机的唯一标识符。通常是机器主机名的散列值（hash）。这样就可以确保
不同主机生成不同的 ObjectId，不产生冲突。     

为了确保在同一台机器上并发的多个进程产生的 ObjectId 是唯一的，接下来的两字节来自产生 ObjectId
的进程的进程标识符 PID。   

前 9 字节保证了同一秒钟不同机器不同进程产生的 ObjectId 是唯一的。最后 3 字节是一个自动
增加的计数器，确保相同进程同一秒产生的 ObjectId 也是不一样的。    

如果插入文档时没有"_id"键，系统会自动帮你创建一个。可以由MongoDB服务器来做这件事，但通常
会在客户端由驱动程序完成。这一做法非常好地体现了 MongoDB 的哲学：能交给客户端驱动程序来
做的事情就不要交给服务器来做。这种理念背后的原因是，即便是像 MongoDB 这样扩展性非常好的
数据库，扩展应用层也要比扩展数据库层容易得多。将工作交由客户端来处理，就减轻了数据库扩展
的负担。     

## 2.7 使用 MongoDB shell

事实上，可以将 shell 连接到任何 MongoDB 实例（只要你的计算机与MongoDB实例所在的计算机
能够连通）。在启动 shell 时指定机器名和端口，就可以连接到一台不同的机器（或者端口）：    

```
$ mongo some-host:30000/myDB
```    

启动mongo shell时不连接到任何mongod有时很方便。通过--nodb参数启动shell，启动时就不会
连接任何数据库。启动之后，在需要时运行 `new Mongo(hostname)`命令就可以连接到想要的
mongod了：    

```
> conn = new Mongo("some-host:30000")
connection to some-host:30000
> db = conn.getDB("myDB")
```   

### 2.7.1 shell 小贴士

如果想知道一个函数是做什么用的，可以直接在shell输入函数名（函数名后不要输入小括号），这样
就可以看到相应函数的JavaScript实现代码。   

```
> db.blog.update
function (query, obj, upsert, multi) {
    var parsed = this._parseUpdate(query, obj, upsert, multi);
    var query = parsed.query;
    var obj = parsed.obj;
    var upsert = parsed.upsert;
    var multi = parsed.multi;
    ...
}
```   

### 2.7.2 使用 shell 执行脚本

本书其他章都是以交互方式使用 shell，但是也可以将希望执行的 JavaScript 文件传给shell。直接
在命令行中传递脚本就可以了：   

```
$ mongo script1.js script2.js script3.js
MongoDB shell version: 4.0.4
connecting to: test
I am script1.js
I am script2.js
I am script3.js
```    

mongo shell会依次执行传入的脚本，然后退出。    

如果希望使用指定的主机/端口上的 mongod 运行脚本，需要先指定地址，然后再跟上脚本文件的名称：   

```
$ mongo --quiet server-1:30000/foo script1.js script2.js script3.js
```   

也可以使用 `load()` 函数，从交互式shell中运行脚本：   

```
> load("script1.js")
I am script1.js
```   

在脚本中可以访问 db 变量，以及其他全局变量。    

可以使用脚本将变量注入到shell。例如，可以在脚本中简单地初始化一些常用的辅助函数。     

```js
// defineConnectTo.js 

/**
 * 连接到指定的数据库，并且将db指向这个连接
 */
var connectTo = function(port, dbname) {
    if (!port) {
        port = 27017;
    }

    if (!dbname) {
        dbname = "test";
    }

    db = connect("localhost:"+ port + "/" + dbname);
    return db;
};
```     

除了添加辅助函数，还可以使用脚本将通用的任务和管理活动自动化。   

默认情况下，shell 会在运行 shell 时所处的目录中查找脚本。如果脚本不在当前目录中，可以为
shell 指定一个绝对路径。例如 `load("/home/myUser/myScripts/defineConnectTo.js")`。    

### 2.7.3 创建 mongorc.js 文件

如果某些脚本会被频繁加载，可以将它们添加到 mongorc.js 文件中。这个文件会在启动shell时自动运行。

```js
// mongorc.js

var compliment = ["attractive", "intelligent", "like Batman"];
var index = Math.floor(Math.random()*3);

print("Hello, you're looking particularly "+compliment[index]+" today!");
```   

如果在启动shell时指定 `--norc` 参数，就可以禁止加载 mongorc.js。   

### 2.7.4 定制 shell 提示

将 `prompt` 变量设为一个字符串或者函数，就可以重写默认的 `shell` 提示。例如，如果正在
运行一个需要耗时几分钟的查询，你可能希望完成时在shell提示中输出当前时间，这样就可以知道
最后一个操作的完成时间了。    

```js
prompt = function() {
  return (new Date()) + "> ";
}
```   

提示函数应该返回字符串。    

### 2.7.5 编辑复合变量

shell 的多行支持是非常有限的：不可以编辑之前的行。如果编辑到第15行时发现第1行有个错误，
那会让人非常懊恼。因此，对于大块的代码或者是对象，你可能更愿意在编辑器中编辑。为了方便地
调用编辑器，可以在 shell 中设置 EDITOR 变量（也可以在环境变量中设置）：   

```js
EDITOR = "/usr/bin/emacs"
```    

现在，如果想要编辑一个变量，可以使用 "edit 变量名" 这个命令，比如：   

```
> var wap = db.books.findOne({title: "War and Peace"})
> edit wap
```   

修改完成之后，保存并退出编辑器。变量就会被重新解析然后加载回shell。   

### 2.7.6 集合命名注意事项

可以使用 db.*collectionName* 获取一个集合的内容，但是，如果集合名称中包含保留字或者
无效的JavaScript属性名称，db.*collectionName* 就不能正常工作了。    

假设要访问 version 集合，不能直接使用 db.version，因为 db.version 是 db 的一个方法。   

为了访问 version 集合，必须使用 getCollection 函数：   

```
> db.getCollections("version")
test.version
```   

如果集合名称中包含无效的JavaScript属性名称（比如foo-bar-baz和123abc），也可以使用这个
函数来访问相应的集合。    

还有一种方法可以访问以无效属性名称命名的集合，那就是使用数组访问语法。    

