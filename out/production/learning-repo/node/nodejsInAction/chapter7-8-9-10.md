# 第 7 章 Web 程序的模板

<!-- TOC -->

- [第 7 章 Web 程序的模板](#第-7-章-web-程序的模板)
  - [7.2 Embedded JavaScript 的模板](#72-embedded-javascript-的模板)
  - [7.3 使用 Mustache 模板语言和 Hogan](#73-使用-mustache-模板语言和-hogan)
    - [7.3.2 Mustache 标签](#732-mustache-标签)
  - [7.4 Pug](#74-pug)
    - [7.4.1 Pug 基础知识](#741-pug-基础知识)
    - [7.4.2 Pug 模板中的逻辑](#742-pug-模板中的逻辑)
    - [7.4.3 组织 Pug 模板](#743-组织-pug-模板)
- [第 8 章 存储数据](#第-8-章-存储数据)
  - [8.1  PostgreSQL](#81--postgresql)
    - [8.1.1 创建数据库](#811-创建数据库)
    - [8.1.2 从 Node 中链接 Postgre](#812-从-node-中链接-postgre)
    - [8.1.3 定义表](#813-定义表)
    - [8.1.4 插入数据](#814-插入数据)
    - [8.1.5 更新数据](#815-更新数据)
- [第 10 章 Node 程序的部署和运维](#第-10-章-node-程序的部署和运维)
  - [10.2 部署的基础知识](#102-部署的基础知识)
    - [10.2.1 从 Git 库部署](#1021-从-git-库部署)
    - [10.2.2 保证 Node 不掉线](#1022-保证-node-不掉线)

<!-- /TOC -->

## 7.2 Embedded JavaScript 的模板

在模板的世界中，发送给模板引擎做渲染的数据有时成为上下文。    

```js
const ejs = require('ejs');
const templage = '<%= message %>';
const context = { message: 'Hello templage!' };
console.log(ejs.render(template, context));
```    

默认情况下好像 `render` 的第二个参数中还混合着 EJS 的选项，那看意思可能在 `render` 函数内部
还用类似 `Object.is()` 的方法做了个数据的合并。下面这些名字不要用作数据，因为这是一些用来配置
模板引擎行为的参数，除非我们要修改这些参数的默认值，否则不要使用这些字段：   

cache, client, close, compileDebug, debug, filename, scope。    

在渲染时，EJS 会转义上下文值中的所有特殊字符，将他们替换为 HTML 实体码。防止 XSS 攻击。如果
用在模板中的是可信数据，不想做转义处理，可以用 `<%-` 代替 `<%=`。    

指明 EJS 标签的字符是可以修改的：    

```js
const ejs = require('ejs');
ejs.delimiter = '$';
const template = '<$= message $>';
```   

EJS 也可以在客户端做渲染使用。   

## 7.3 使用 Mustache 模板语言和 Hogan

Hogan.js 是 Twitter 为满足自己的需求而常见的模板引擎。Hogan 是 Mustache 模板语言标准的具体
实现。    

跟 EJS 不同，Mustache 遵循极简主义，特意去掉了条件逻辑。在内容过滤上，Mustache 只为 XSS
攻击而保留了转义处理功能。   

```shell
$ npm install --save hogan.js
```   

```js
const hogan = require('hogan.js');
const templateSource = '{{message}}';
const context = { message: 'Hello template' };
const template = hogan.compile(templateSource);
console.log(template.render(context));
```    

### 7.3.2 Mustache 标签

+ 显示简单的值：把想要显示的上下文名称放在双大括号中。大括号在 Mustache 社区里被称为胡须。比如
说，想显示变量 name 的值，`{{name}}`。如果要在 Hogan 中显示未转义的值，即可以把上下文项的
名称放在三条胡须中，也可以在前面添加一个 & 符号。`{{{name}}}` 或者 `{{&name}}`。   
+ 注释：`{{! This is a comment }}`
+ 区块，多个值的循环遍历：    

```js
const context = {
  students: [
    { name: 'Jane Narwhal', age: 21 },
    { name: 'Rich LaRue', age: 26 }
  ]
}
```   

```mustache
{{#students}}
  <p>Name: {{name}}, Age: {{age}} years old</p>
{{/students}}
```    

+ 反向区块，值不存在时的默认 HTML：如果上下文中 students 不是数组的话，如果是单个对象，那么模板
会显示这个对象，如果是 undefined 或 false 或者空数组，则什么都不显示。    

如果想输出消息指明该区块的值不存在，那么可以用 Mustache 的反向区块。    

```mustache
{{^students}}
  <p>No students found.</p>
{{/students}}
```    

如果 Mustache 现有的功能无法满足需求，可以依据 Mustache 标准组件定义区块标签，让他调用函数处理
模板内容，不用循环遍历数组。这被称为区块 **lambda**。    

```js
const hogan = require('hogan.js');
const md = require('github-flavored-markdown');
const templateSource = `
  {{#markdown}}**Name**: {{name}}{{/markdown}}
`;
const context = {
  name: 'Rich LaRue',
  markdown: () => text => md.parse(text)
};
const template = hogan.compile(templateSource);
console.log(template.render(context));
```    

子模板功能：   

```js
const hogan = require('hogan.js');
const studentTemplate = `
  <p>
    Name: {{name}},
    Age: {{age}} years old
  </p>
`;
const mainTemplate = `
  {{#students}}
    {{>student}}
  {{/students}}
`;
const context = {
  students: [{
    name: 'Jane Narwhal',
    age: 21
  }, {
    name: 'Rich LaRue',
    age: 26
  }]
};

const template = hogan.compile(mainTemplate);
const partial = hogan.compile(studentTemplate);
const html = template.render(context, { student: parital });
```    

## 7.4 Pug

Pug 是 Express 的默认模板引擎。Pug 和其他主流模板系统的区别是它对空格的使用。Pug 模板用缩进
表示 HTML 标签的嵌入关系。HTML 标签也不必明确给出关闭标签。    

```pug
html
  head
    title Welcome
  body
    div.content#main
      strong "Hello world!"
```    

Pug 像 EJS 一样，可以嵌入 JS，可以用在服务器端或客户端。但 Pug 还有其他特性，比如模板继承和
mixins。    

### 7.4.1 Pug 基础知识

Pug 的标签名和 HTML 一样，但抛弃了 `<>`。因为 HTNL 中经常使用 div，Pug 定义了他的快捷表示法：    

```pug
.content.sidebar#featured_content
```   

话说要是没类没 ID 怎么表示。    

将标签的属性放在括号中，每个属性之间用逗号分开：    

```pug
a(href='http://nodejs.org', target='_blank')
```    

因为带属性的标签可能会很长，所以 Pug 在处理这样的标签时比较灵活。    

```pug
a(href="http://nodejs.org",
  target='_blank')
```   

也可以指定不需要值的属性（那就是布尔属性咯）：    

```pug
strong Select your favorite food:
form
  select
    option(value='Cheese') Cheese
    option(value='Tofu', selected) Tofu
Specifying tag content
```    

除了直接将标签内容直接跟在标签名后之外，还可以使用 `|` 指定标签的内容：    

```pug
textarea
  | This is some default text
  | that the user should be
  | provided with.
```    

如果 HTML 标签只接受文本（即不能嵌入 HTML 元素），比如 style 和 script，则可以去掉 `|` 字符：   

```pug
style.
  h1 {
    font-size: 6em;
    color: #9dff0c;
  }
```    

Pug 一般用缩进表示嵌套，但有时缩进形成的空格太多了。这时我们可以改用 Pug 块扩展。块扩展可以在
标签后面用冒号表示嵌套：    

```pug
ul
  li: a(href='http://nodejs.org', target='_blank') Node.js homepage
  li: a(href='http://npmjs.org') NPM homepage
  li: a(href='http://nodebits.org') Nodebits blog
```    

```js
const pug = require('pug');
const template = 'strong #{message}';
const context = { message: 'Hello template' };
const fn = pug.compile(template);
console.log(fn(context));
```   

上面 `#{message}` 是要被上下文值替换掉的占位符。   

上下文值也可以作为属性的值：   

```js
const pug = require('pug');
const template = 'a(href = url)';
const context = { url: 'http://google.com' };
const fn = pug.compile(template);
console.log(fn(context));
```    

### 7.4.2 Pug 模板中的逻辑

```pug
h3.contacts-header My Contacts
if contacts.length
  each contact in contacts
    - var fullName = contact.firstName + ' ' + contact.lastName
    .contact-box
      p = fullName
      if contact.isEditable
        p: a(href='/edit' + contact.id) Edit Record
      p
        case contact.status
          when 'Active'
            strong User is active in the system
          when 'Inactive'
            em User is inactive
          when 'Pending'
            | User has a pending invitation
else
  p You currently do not have any contacts
```    

带有 `-` 前缀的 JS 代码的返回结果不会出现在渲染结果中。带有 `=` 前缀的 JS 代码的执行结果则会出现，
并且为了防止 XSS 做了转义处理。如果 JS 代码生成的内容不该转义，可以用前缀 `!=`.    

在 Pug 中，有些常用的条件判断和循环语句可以不带前缀：`if, else, case, when, default, until,
while, each, unless`。    

Pug 中还可以定义变量，下面两种赋值方式效果是一样的：   

```pug
- count = 0
count = 0
```    

还有这种循环方式：   

```pug
- messages.forEach(message => {
  p = message
- })
```   

Pug 中还有一个非 JS 形式的循环：each语句，用 each 语句很容易实现数组和对象属性的循环遍历：   

```pug
each message in messages
  p= message
```   

对象属性的遍历可以稍有不同：   

```pug
each value, key in post
  div
    strong #{key}
    p value
```   

这到底是怎么嵌值的，怎么形式多种多样。    

### 7.4.3 组织 Pug 模板

**模板继承组织多个模板文件**    

从概念上讲，模板就像编程中的类，一个模板可以扩展另一个。    

```pug
html
  head
    block title
  body
    block content
```   

上面包含两个模板块，模板块是可以由后裔模板提供内容的占位符。   

```pug
extends layout
block title
  title Messages
block content
  each message in messages
  p= message
```    

**用块前缀/块追加实现布局**     

如果被继承的模板块中内容，也可以用块前缀和块追加，在原有内容基础上构建新内容，而不是替换它。   

这个先略过。    

**模板包含**    

Pug 中 include 命令是另一个组织模板的工具。    

```pug
html
  head
    title Hello
  body
    include footer
```    

**mixin**    

mixin 模拟的是 JS 函数，他跟函数一样，可以带参数，并且这些参数可以用来生产 Pug 代码：   

```js
const students = [
  { name: 'Rich LaRue', age: 23 },
  { name: 'Sarah Cathands', age: 25 },
  { name: 'Bob Dobbs', age: 37 }
]
```   

```pug
mixin list_object_property(objects, property)
  ul
    each object in objects
      li= object[property]
```   

```pug
mixin list_object_property(students, 'name')
```    

# 第 8 章 存储数据

## 8.1  PostgreSQL

### 8.1.1 创建数据库

```
createdb articles
```   

要删掉已有数据库中的全部数据，可以用 `dropdb` 命令：   

```
dropdb articles
```    

### 8.1.2 从 Node 中链接 Postgre

```shell
$ npm install pg --save
```   

```js
const pg = require('pg');
const db = new pg.Client({ database: 'articles' });

db.connect((err, client) => {
  if (err) {
    throw err;
  }
  console.log('Connected to database', db.database);
  db.end();
});
```   

### 8.1.3 定义表

```js
db.query(`
  CREATE TABLE IF NOT EXISTS snippets (
    id SERIAL,
    PRIMARY KEY(id),
    body text
  );
`, (err, result) => {
  if (err) {
    throw err;
  }
  console.log('Create table "snippets"');
  db.end();
});
```    

### 8.1.4 插入数据

如果不指定 id，PostgreSQL 会自动生成一个。要想知道生成的 ID 是什么，需要在查询语句里加上
`RETURNING id`，然后可以在回调函数的结果集参数中得到 id 值。   

```js
const body = 'hello world';
db.query(`
  INSERT INTO snippets (body) VALUES (
    '${body}'
  )
  RETURNING id
`, (err, result) => {
  if (err) {
    throw err;
  }
  const id = result.rows[0].id;
  console.log('Inserted row with id %s', id);
});
```    

### 8.1.5 更新数据

```js
const id = 1;
const body = 'greetings world';
db.query(`
  UPDATE snippets SET (body) = (
    '${body}'
  ) WHERE id=${id};
`, (err, result) => {
  if (err) {
    throw err;
  }
  console.log('Update %s rows', result.rowCount);
});
```   

剩下的都略了。    

# 第 10 章 Node 程序的部署和运维

## 10.2 部署的基础知识

### 10.2.1 从 Git 库部署

1. 用 SSH 连接到服务器
2. 在服务器上安装 Node 和 Git
3. 从版本库中将程序文件，包括Node 脚本、图片、CSS 样式表等，下载到服务器上
4. 启动程序

### 10.2.2 保证 Node 不掉线

Nodejitsu 的 Forever 是解决这个问题的常用工具。用 Forever 启动的程序在你断开 SSH 连接后不会
退出，并且如果崩溃的话，Forever 还会重启它。    

```shell
$ npm install -g forever
$ forever start server.js
```   

停掉服务：   

```shell
$ forever stop server.js
```   

查看所有受管理的程序：   

```shell
$ forever list
```   

Forever 的另一个比较实用的功能是可以在源码发生变化时自动重启程序。    

```bash
$ forever -w start server.js
```    

Last Update: 2018.11.28
