# Node.js 实战

<!-- TOC -->

- [Node.js 实战](#nodejs-实战)
- [第一部分 Node 基础知识介绍](#第一部分-node-基础知识介绍)
  - [第 1 章 欢迎进入 Node.js 的世界](#第-1-章-欢迎进入-nodejs-的世界)
    - [1.1 一个典型的 Node Web 应用程序](#11-一个典型的-node-web-应用程序)
    - [1.2 ES6, Node 和 V8](#12-es6-node-和-v8)
    - [1.4 Node 自带工具](#14-node-自带工具)
    - [1.5 三种主流的 Node 程序](#15-三种主流的-node-程序)
- [第 2 章 Node 编程基础](#第-2-章-node-编程基础)
  - [2.6 使用异步编程技术](#26-使用异步编程技术)
- [第 3 章 Node Web 程序是什么](#第-3-章-node-web-程序是什么)
  - [3.1 了解 Node Web 程序的结构](#31-了解-node-web-程序的结构)
  - [3.2 搭建一个 RESTful Web 服务](#32-搭建一个-restful-web-服务)
  - [3.3 添加数据库](#33-添加数据库)
  - [3.4 添加用户界面](#34-添加用户界面)

<!-- /TOC -->

# 第一部分 Node 基础知识介绍

## 第 1 章 欢迎进入 Node.js 的世界

### 1.1 一个典型的 Node Web 应用程序

Node 中的网络访问是非阻塞的，它用了一个名为 libuv 的库来访问操作系统的非阻塞网络调用。
这个库在 Linux、MacOS 和 Windows 中的实现是不同的。    

访问硬盘也差不多，但又不完全一样。libuv 借助线程池模拟出了一种使用非阻塞调用的假象。   

### 1.2 ES6, Node 和 V8

V8 的一个特性是它可以将 JS 直接编译为机器码，另外还有一些代码优化的功能。    

![nodejs](https://raw.githubusercontent.com/temple-deng/markdown-images/master/node/nodejs.png)    

Node 中能用的 JS 特性都可以追溯到 V8 对该特性的支持。这些支持是通过特性组来管理的。   

Node 包含了 V8 提供的 ES6 特性。这些特性分为 **shipping**, **staged** 和 **in progress**
三组。shipping 组的特性是默认开启的，staged 和 in progress 组特性则需要用命令行参数开启。
如果想要 staged 特性，在运行 Node 时加上参数 `--harmony`，V8 团队将所有接近完成的特性
都放在了这一组。然而，in progress 特性稳定性较差，需要具体的特性参数来开启。Node 文档建议
通过 `grep "in progress"` 来查询当前可用的 in progress 特性：    

```shell
$ node --v8-options | grep "in progress"
```   

Node 的发行版分为长期支持版（LTS）、当前版和每日构建版三组。LTS 版有 18 个月的支持服务，
期满后还有 12 个月的维护性支持服务。每日构建版的构建是自动进行的，每隔 24 小时一次，包含
这 24 小时内的最新修改，但一般只用来测试 Node 的最新特性。   

### 1.4 Node 自带工具

Node 不仅有文件系统库（fs, path）、TCP 客户端和服务端库（net）、HTTP 库（http 和 https）
和域名解析库（dns），还有一个经常用来写测试的断言库（assert），以及一个用来查询平台信息
的操作系统库（os）。    

### 1.5 三种主流的 Node 程序

Node 程序主要可以分成三种类型：Web 应用程序、命令行工具、后台程序和桌面程序。提供单页应用
的简单程序、REST 微服务以及全栈 Web 应用都属于 Web 应用程序。Node 命令行工具，比如 npm,
grunp 和 webpack。后台程序就是后台服务，比如 PM2 进程管理器。桌面程序一般是用 Electron
框架写的软件。    

在程序开头的地方加上 #!，并赋予其可执行权限，shell 就可以在调用程序时使用 Node。也就是
说可以像运行其他 shell 脚本那样运行 Node 程序。在类 Unix 系统中用下面这样的代码：   

```js
#!/usr/bin/env node
```    

这样就可以用 Node 代替 shell 脚本。    

# 第 2 章 Node 编程基础

Node 以同步的方式寻找模块，定位到这个模块并加载文件中的内容。Node 查找文件的顺序是先找
核心模块，然后是当前目录，最后是 node_modules。    

加载模块时的定位规则：   

![load_rules](https://raw.githubusercontent.com/temple-deng/markdown-images/master/node/load_rules.png)    

Node 能把模块作为对象缓存起来。如果程序中的两个文件引入了相同的模块，第一个 require 会把
模块返回的数据存到内存中，这样第二个 require 就不用再去访问和计算模块的源文件了。   

## 2.6 使用异步编程技术

在 Node 的世界里流行两种响应逻辑管理方式：回调和事件监听。   

回调通常用来定义一次性响应的逻辑。    

事件监听本质上也是一个回调，不同的是，它跟一个概念实体（事件）相关联。   

Node 中的大多数内置模块在使用回调时都会带两个参数：第一个用来放可能会发生的错误，第二个
用来放结果。   

# 第 3 章 Node Web 程序是什么

## 3.1 了解 Node Web 程序的结构

典型的 Node Web 程序由下面几部分组成：   

+ package.json 文件
+ public/ 文件夹，静态资源文件夹
+ node_modules
+ 放程序代码的一个或多个 JS 文件

程序代码一般又会分成下面几块：   

+ app.js 或 index.js —— 设置程序的代码
+ models/ —— 数据库模型
+ views/ —— 用来渲染页面的模板
+ controllers/ 或 routes/ —— HTTP 请求处理器
+ middleware/ —— 中间件

使用 `express()` 创建一个应用实例，添加路由处理器，然后将这个应用实例绑定到一个 TCP 端口
上。    

```js
const express = require('express');
const app = express();

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(port, () => {
  console.log(`Express web app available at localhost: ${port}`);
});
```   

## 3.2 搭建一个 RESTful Web 服务

```js
const express = require('express');
const app = express();
const articles = [{ title: 'Example' }];

const port = process.env.PORT || 3000;

app.set('port', port);

app.get('/articles', (req, res, next) => {
  res.send(articles);
});

app.post('/articles', (req, res, next) => {
  res.send('OK');
});

app.get('/articles/:id', (req, res, next) => {
  const id = req.params.id;
  console.log('Fetching:', id);
  res.send(articles[id]);
});

app.delete('/articles/:id', (req, res, next) => {
  const id = req.params.id;
  console.log('Deleting:', id);
  delete articles[id];
  res.send({
    message: 'Deleted'
  });
});

app.listen(app.get('port'), () => {
  console.log(`Express web app available at localhost: ${app.get('port')}`);
});

module.exports = app;
```    

消息体解析器 `body-parser` 用来解析 MIME-encoded POST 请求消息的主体部分，并将其转换
成代码可用的数据。一般来说，它给出的是易于处理的 JSON 数据。    


```js
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.post('/articles', (req, res, next) => {
  const article = { title: req.body.title };
  articles.push(article);
  res.send(article);
});
```    

## 3.3 添加数据库

1. 决定要用的数据库系统
2. 在 npm 上看看那些实现了数据库驱动或对象——关系映射（ORM）的模块
3. 安装模块
4. 创建模型，封装数据库访问 API
5. 把这些模型添加到 Express 路由中    

```js
app.get('/articles', (req, res, next) => {
  Article.all((err, aritcles) => {
    if (err) {
      next(err);
    }
    res.send(articles);
  });
});
```    

该项目数据库选用了 SQLite，以及 sqlite3 模块，SQLite 是进程内数据库，因此不用在系统上
安装一个后台运行的数据库。添加的所有数据都会写到一个文件里。     

文章应该能被创建、被获取、被删除，所以模型类 Article 应该提供下面这些方法：   

+ Article.all(cb) —— 返回所有文章
+ Article.find(id, cb) —— 给定 ID，找到对应文章
+ Article.create({ title, content }, cb) —— 创建文章
+ Article.delete(id, cb) —— 根据 ID 删除文章

```js
const sqlite3 = require('sqlite3').verbose();
const dbName = 'later.sqlite';
const db = new sqlite3.Database(dbName);    // 连接到一个数据库文件

db.serialize(() => {
  const sql = `
  CREATE TABLE IF NOT EXISTS articles
    (id integer primary key, title, content TEXT)
  `;
  db.run(sql);
});

class Article {
  static all(ab) {
    db.all('SELECT * FROM articles', cb);
  }

  static find(id, cb) {
    db.get('SELECT * FROM articles WHERE id = ?', id, cb);
  }

  static create(data, cb) {
    const sql = 'INSERT INTO articles(title, content) VALUES (?, ?)';
    db.run(sql, data.title, data.content, cb);
  }

  static delete(id, cb) {
    if (!id) {
      return cb(new Error('Please provide an id'));
    }
    db.run('DELETE FROM articles WHERE id = ?', id, cb);
  }
}

module.exports = db;
module.exports.Article = Article;

```   


app.js:   

```js
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { Article } = require('./models/article');

const port = process.env.PORT || 3000;

app.set('port', port);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/articles', (req, res, next) => {
  Article.all((err, articles) => {
    if (err) {
      return next(err);
    }
    res.send(articles);
  })
});

app.post('/articles', (req, res, next) => {
  const article = { title: req.body.title };
  articles.push(article);
  res.send(article);
});

app.get('/articles/:id', (req, res, next) => {
  Article.find(req.params.id, (err, article) => {
    if (err) {
      return next(err);
    }
    res.send(articles);
  })
});

app.delete('/articles/:id', (req, res, next) => {
  const id = req.params.id;
  Article.delete(id, (err) => {
    if (err) {
      return next(err);
    }
    res.send({
      message: 'Deleted'
    });
  })
});

app.listen(app.get('port'), () => {
  console.log(`Express web app available at localhost: ${app.get('port')}`);
});

module.exports = app;
```    

node-readability 这个模块提供一个异步函数，可以下载指定 URL 的页面并将 HTML 转换成
简化版。    

```js
const read = require('node-readability');
app.post('/articles', (req, res, next) => {
  const url = req.body.url;
  read(url, (err, result) => {
    if (err || !result) {
      res.status(500).send('Error downloading article');
    }

    Article.create(
      {
        title: result.title,
        content: result.content
      },
      (err, article) => {
        if (err) {
          return next(err);
        }
        res.send('OK');
      }
    )
  })
});
```   

## 3.4 添加用户界面

`res.format()` 方法，它可以根据请求发送相应格式的响应：   

```js
res.format({
  html: () => {
    res.render('articles.ejs', { articles: articles });
  },
  json: () => {
    res.send(articles);
  }
});
```   

添加 EJS 模板：    

```js
$ npm install --save ejs
```   

articles.ejs:   

```template
<% include head %>
  <ul>
    <% articles.forEach((article) => { %>
      <li>
        <a href="/articles/<%= article.id %>" >
          <%= article.title %>
        </a>
      </li>
    <% }) %>
  </ul>
<% include foot %>
```   

head.ejs:   

```template
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Later</title>
</head>
<body>
  <div class="container">
```   

foot.ejs:   

```template
    </div>
  </body>

</html>
```    

Express 自带了一个名为 express.static 的中间件，可以给浏览器发送客户端 JS、图片和 CSS
文件。只要将它指向包含这些文件的目录，浏览器就能访问到这些文件了。   

```js
app.use(
  '/css/bootstrap.css',
  express.static('node_modules/bootstrap/dist/css/bootstrap.min.css')
);
```    

Last Update: 2018.11.27
