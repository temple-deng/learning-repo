# 第 2 部分 Node 的 Web 开发

## 第 4 章 前端构建系统

安装 gulp, gulp-cli, gulp-babel, gulp-sourcemaps, gulp-concat:   

```shell
$ npm install --save-dev gulp gulp-cli gulp-babel glup-sourcemaps
$ npm install --save-dev @babel/core @babel/preset-env
```   

gulp-concat 好像是专门把多个 babel 编译后的文件合成一个编译输出的。   

```js
const gulp = require('gulp');
const babel = require('gulp-babel');
const sourceMaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');

gulp.task('default', () => {
  gulp.src('src/*.jsx')
    .pipe(sourceMaps.init())
    .pipe(babel())
    .pipe(concat('app.js'))
    .pipe(sourceMaps.write('.'))
    .pipe(gulp.dest('public/js'));
});
```   

# 第 5 章 服务器端框架

## 5.3 Koa

```js
const koa = require('koa');
const app = koa();

app.use(function *(next) {
  const start = new Date();
  yield next;
  const ms = new Date() - start;
  console.log('%s %s - %s', this.method, this.url, ms);
});

app.use(function *() {
  this.body = 'Hello World';
});

app.listen(3000);
```    

在 Koa 中间件中，this 就是上下文。每个请求都有对应的上下文，用来封装 Node 的 HTTP request
和 response 对象。在需要访问请求里的东西时，可以通过这个请求上下文来访问，响应也是如此。    

Koa 项目的设置工作包括安装模块和定义中间件。   

koa-router 是一个路由器中间件。    

```js
router.post('/pages', function*(next) {

})
.get('/pages/:id', function*(next) {

})
.put('pages-updage', '/pages/:id', function*(next) {

})
```    

可以提供额外的参数给路由命名。这可以用来生成 URL：   

```js
router.url('pages-update', '99')
```    

## 5.5 hapi

hapi 是个服务器框架，它的重点是 Web API 开发。hapi 有自己的插件 API，完全没有客户端支持，
也就没有数据模型层。hapi 有路由 API 和它自己的 HTTP 服务器封装。    

算了都是些框架，先略过。    


# 第 6 章 深入了解 Connect 和 Express

## 6.1 Connect

```js
const app = require('connect')();

app.use((req, res, next) => {
  res.end('Hello World!');
});
app.listen(3000);
```    

Connect 中间价就是 JS 函数，这个函数一般会有三个参数：请求对象、响应对象和名为 next 的
回调函数。一个中间件完成自己的工作，要执行后续的中间件时，可以调用这个回调函数。    

Connnect 的 use 方法就是用来组合中间件的。    


```js
const connect = require('connect');

function logger(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next();
}

function hello(req, res, next) {
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
}

const app = connect();
app.use(logger)
  .use(hello)
  .listen(3000);
```    

Connect 中有一种用来处理错误的中间件变体，跟常规的中间件相比，除了请求、响应对象外，错误
处理中间件的参数中还多了一个错误对象。   

Connect 默认的错误处理时返回状态码 500，状态文本 Internal Server Error，主体是错误信息。   

```js
function errorHandler(err, req, res, next) {
  res.statusCode = 500;
  res.end('Server error');
}
```    

## 6.2 Express

express-generator 包里有创建程序框架的命令行工具 express，可以用它生成程序模板。   

![express](https://raw.githubusercontent.com/temple-deng/markdown-images/master/node/express.png)    

```js
$ npm install -g express-generator
$ express
```    

Express 有一个极简的环境驱动配置系统，这个系统由几个方法组成，全部由环境变量 NODE_ENV
驱动：   

+ `app.set()`
+ `app.get()`
+ `app.enable()`
+ `app.disable()`
+ `app.enabled()`
+ `app.disabled()`    

`app.configure()` 方法有一个可选的字符串参数，用来指定运行环境，还有一个参数是函数。
如果有这个字符串，则在运行环境与字符串相同时才会调用那个函数；如果没有，则在所有环境中都
会调用那个函数。     

### 6.2.3 渲染视图

Express 中有两种渲染视图的办法：程序层面用 `app.render()`，在请求或响应层面用 `res.render()`
Express 内部用的是前一种。    

Express 视图系统的配置很简单，我们重点介绍三部分：   

+ 调整视图的查找
+ 配置默认的模板引擎
+ 启用视图缓存，减少文件 IO   

```js
app.set('views', __dirname + '/views');    // 查找视图的目录

app.set('view engine', 'pug');            // 根据扩展名确定模板引擎
app.get('/', function() {
  res.render('index');           // 使用配置的渲染引擎
});
app.get('/feed', function() {
  res.render('rss.ejs');          // 使用 EJS 模板引擎
});
```    

在生产环境中，view cache 是默认开启的。   

![views](https://raw.githubusercontent.com/temple-deng/markdown-images/master/node/views.png)    

在 Express 中，要给被渲染的视图传递数据有几种办法，其中最常用的是将传递的数据作为
`res.render()` 的参数。此外，还可以在路由处理器之前的中间件中设定一些变量，比如用
`app.locals` 传递程序层面的数据，用 `res.locals` 传递请求层面的变量。   

将变量直接作为 `res.render()` 的参数优先级最高。然后是 `res.locals`。   

默认情况下，Express 只会向视图中传递一个程序级变量——settings，这个对象中包含所有用 `app.set()`
设定的值。实际上，Express 是像下面这样输出这个对象的：   

```js
app.locals.settings = app.settings
```    

### 6.2.4 路由

在创建模型之前，需要先安装 Node redis 模块。    

```js
$ npm install --save redis
```    

消息条目模型：   

```js
// models/entry.js
const redis = require('redis');
const db = redis.createClient();         // 创建 Redis 客户端实例

class Entry {
  constructor(obj) {
    for (let key in obj) {
      this[key] = obj[key];
    }
  }

  save(cb) {
    const entryJSON = JSON.stringify(this);
    db.lpush(
      'entries',
      entryJSON,
      (err) => {
        if (err) {
          return cb(err);
        }
        cb();
      }
    )
  }

  static getRange(from, to, cb) {
  db.lrange('entries', from, to, (err, items) => {
    if (err) {
      return cb(err);
    }

    let entries = [];
    items.forEach((item) => {
      entries.push(JSON.parse(item));
    });
    cb(null, entries);
  })
}
}

module.exports = Entry;
```    

路由：   

```js
// routes/entries.js
const Entry = require('../models/entry');

module.exports = {
  from(req, res) {
    res.render('post', { title: 'Post' });
  },
  submit(req, res, next) {
    const data = req.body.entry;
    const user = res.locals.user;
    const username = user ? user.name : null;
    const entry = new Entry({
      username: username,
      title: data.title,
      body: data.body
    });

    entry.save((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    });
  }
};
```    

```js
// app.js
const entries = require('./routes/entries'); 

app.get('/post', entries.from);
app.post('/post', entries.submit);
```    

展示条目列表：    

```js
//app.js
app.get('/', entries.list);
```   

```js
// entries.js
module.exports = {
  // ...
    list(req, res, next) {
    Entry.getRange(0, -1, (err, entries) => {
      if (err) {
        return next(err);
      }
      res.render('entries', {
        title: 'Entries',
        entries
      });
    })
  }
};
```    

Express 路由可以有自己的中间件，其被放在路由回调函数之前，只有跟这个路由匹配时才会调用。    

```js
app.post('/post',
  requireEntryTitle,
  requireEntryTitleLengthAbove(4),
  entries.submit
);
```   

一般的路由定义只有两个参数：路径和路由处理函数，而这个路由定义中又额外地增加了两个参数。   

### 6.2.5 用户认证

Bcrypt 是一个加盐的哈希函数，可作为第三方模块专门对对密码做哈希处理。    

```js
$ npm install --save bcrypt
```   

对哈希机制来说，盐就像私钥一样。可以用 `bcrypt.getSalt()` 为哈希生成 12 个字符的盐。   

```js
const redis = require('redis');
const bcrypt = require('bcrypt');
const db = redis.createClient();     // 创建到 Redis 的长连接

class User {
  constructor(obj) {
    for (let key in obj) {
      this[key] = obj[key];
    }
  }

  save(cb) {
    if (this.id) {
      this.update(cb);
    } else {
      db.incr('user:ids', (err, id) => {
        if (err) {
          return cb(err);
        }
        this.id = id;
        this.hashPassword((err) => {
          if (err) {
            return cb(err);
          }
          this.update(cb);
        })
      });
    }
  }

  update(cb) {
    const id = this.id;
    db.set(`user:id:${this.name}`, id, (err) => {
      if (err) {
        return cb(err);
      }
      db.hmset(`user:${id}`, this, (err) => {
        cb(err);
      })
    })
  }

  hashPassword(cb) {
    bcrypt.genSalt(12, (err, salt) => {
      if (err) {
        return cb(err);
      }
      this.salt = salt;
      bcrypt.hash(this.pass, salt, (err, hash) => {
        if (err) {
          return cb(err);
        }
        this.pass = hash;
        cb();
      })
    })
  }
}

module.exports = User;
```    

