# Express 4.15.3

<!-- TOC -->

- [Express 4.15.3](#express-4153)
  - [提供静态文件](#提供静态文件)
  - [路由 Routing](#路由-routing)
    - [路由方法](#路由方法)
    - [路由路径](#路由路径)
    - [路由参数](#路由参数)
    - [路由处理器](#路由处理器)
    - [响应方法](#响应方法)
    - [app.route()](#approute)
    - [express.Router](#expressrouter)
  - [使用中间件](#使用中间件)
      - [应用级别的中间件](#应用级别的中间件)
      - [路由级别的中间件](#路由级别的中间件)
      - [错误处理中间件](#错误处理中间件)
      - [内置中间件](#内置中间件)
  - [代理后的 Express](#代理后的-express)
  - [X-Forwarded](#x-forwarded)
  - [IP 地址](#ip-地址)
  - [使用模板引擎](#使用模板引擎)

<!-- /TOC -->

## 提供静态文件

将静态资源的目录的名字传递给 `express.static` 中间件函数提供这些静态资源。  

`app.use(express.static('public'))`  

现在可以访问 `public` 文件夹中的文件了：  

```
http://localhost:3000/images/kitten.jpg
http://localhost:3000/css/style.css
http://localhost:3000/js/app.js
http://localhost:3000/images/bg.png
http://localhost:3000/hello.html
```  

Express 寻找资源的路径时是相对于静态资源目录的，所有静态资源目录的名字并不是 URL 地址的一部分。  

如果想要提供多个静态资源目录，只要调用多次 `express.static` 中间件就可以：  

```javascript
app.use(express.static('public'))
app.use(express.static('files'))
```  

如果想要创建一个虚拟的路径前缀，可以为静态资源目录指定一个挂载路径：  

`app.use('/static', express.static('public'))`  

传递给 `express.static` 函数的路径是相对于启动 `node` 进程的目录的。  

## 路由 Routing

路由是由应用的终端和如何响应客户端请求定义的，也就是说路由的定义包含两个部分，
一个就是应用的终端，一个就是响应方式。而路由的终端又是由请求的方法及请求的路由两个部分组成的。   

### 路由方法

路由方法是由 HTTP 方法派生出来的并且绑定在一个 `express` 类的实例上。  

### 路由路径

路由路径与请求方法相结合，用于定义应用请求的端点。路由路径可以是字符串、字符串模式或正则表达式。    

`?, +, *, ()` 都是正则表达式的子集， `-, .` 在基于字符串的路径中解释为字面量。而且在正则表示式中，`*` 的解释方式是不同于
传统意思的，这貌似是 Express 4 的 bug，貌似会在5中修复，使用 `{0,}`。   

如果想要在路径字符串里使用美元符 `$` 的话，需要将其转义并用 `([])` 包起来。例如请求的路径是`/data/$book`，那么想要匹配的话应该用 `/data/([\$])book`。    

查询字符串不属于路由路径的一部分。    

```
Route path: /flights/:from-:to
Request URL: http://localhost:3000/flights/LAX-SFO
req.params: { "from": "LAX", "to": "SFO" }

Route path: /plantae/:genus.:species
Request URL: http://localhost:3000/plantae/Prunus.persica
req.params: { "genus": "Prunus", "species": "persica" }
```  

### 路由参数

路由参数是一些命名的 URL 片段，用来捕获在 URL 的对应位置的值。这个被捕获的值会在 `req.params` 
对象中被污染，路由参数的名字会成为其对应的键名。   

### 路由处理器

路由处理器的行为与中间件类似，不过有一点不同的是，调用 `next('route')` 会跳过剩余的路由回调。您可以使用此机制在路由上强加前提条件，如果没有理由继续执行当前路由，则将控制权传递给后续路由。  

路由处理器可以是一系列函数，一个函数数组，或者两者的结合。    

### 响应方法

下面的响应方法会发送响应给客户端，并且结束请求——响应的周期。如果在路由处理器中没有调用其中
之一的方法，客户端请求会挂起。  

| Method | Description |
| :------------- | :------------- |
| `res.download()` | 提供一个文件去下载 |
| `res.end()` | 结束响应进程 |
| `res.json()` | 发送一个 JSON 响应 |
| `res.jsonp()` | 发送一个JSONP响应 |
| `res.redirect()` | 重定向请求 |
| `res.render()` | 渲染一个视图模板 |
| `res.send()` | 发送各种类型的响应。 |
| `res.sendFile()` | 以八位字节流的形式发送文件。|
| `res.sendStatus()` | 发送响应状态码以及对应的原因短语作为响应主体 |

### app.route()

可以通过使用 `app.route()` 为一个路由路径创建一个链式的路由处理器。由于这个方法直接指定了一个
路由路径，所以可以减少打印的字符。（也就是我们可以对路由处理器只提供路由方法就行，路由路径的话
`route()` 方法中已经指定了）       

```javascript
app.route('/book')
  .get(function (req, res) {
    res.send('Get a random book')
  })
  .post(function (req, res) {
    res.send('Add a book')
  })
  .put(function (req, res) {
    res.send('Update the book')
  })
```   

### express.Router

也可以使用 `express.Router` 类来创建模块化的，可挂载的路由处理器（我觉得这里的模块化，可挂载的意思是
我们使用这个类创建的路由系统可以挂载到一个路径前缀上，这样的话，可以很方便的修改挂载的前缀路径，而且也便于模块化）。一个 `Router` 实例是一个完整的中间件及路由系统，也被成为"迷你应用"。（也就是说路由器其实就是一个小型的应用，只不过可能不同点是路由器是挂载某一个路径上的，以及可能阉割了一些应用的功能）      

```javascript
var express = require('express')
var router = express.Router()

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
})
// define the home page route
router.get('/', function (req, res) {
  res.send('Birds home page')
})
// define the about route
router.get('/about', function (req, res) {
  res.send('About birds')
})

module.exports = router
```  

```javascript
var birds = require('./birds')

// ...

app.use('/birds', birds)
```   

## 使用中间件

一个 Express 应用可以使用下面类型的中间件：  

+ Application-level middleware 应用级别的中间件
+ Router-level middleware 路由级别的中间件
+ Error-hanling middleware 错误处理中间件
+ Built-in middleware 内置中间件
+ Third-party middleware 第三方中间件

可以在加载应用级别和路由级别的中间件时提供可选的挂载路径。也可以一次性加载多个中间件函数
，这样会在挂载点上创建一个中间件系统的子栈。  

#### 应用级别的中间件

使用 `app.use(), app.METHOD()` 方法将应用级别的中间件绑定到 app 对象。    

可以在中间件中调用 `next(route)` 方法来跳过路由中间件栈中剩下的中间件，直接将控制权交给下个路由，注意一个路径可以定义多个路由，且 `next(route)` 只在使用 `app.METHOD()` or `router.METHOD` 的加载的中间件中才可用。  

```javascript
app.get('/user/:id', function (req, res, next) {
  // if the user ID is 0, skip to the next route
  if (req.params.id === '0') next('route')
  // otherwise pass the control to the next middleware function in this stack
  else next()
}, function (req, res, next) {
  // render a regular page
  res.render('regular')
})

// handler for the /user/:id path, which renders a special page
app.get('/user/:id', function (req, res, next) {
  res.render('special')
})
```   

#### 路由级别的中间件

路由级别的中间件工作方式与应用级别是相同的，只不过是绑定在 `express.Router` 实例上。  

使用 `router.METHOD(), router.use()` 加载路由级别的中间件。  

同样的，也可以调用 `next('route')` 跳过剩下的路由器的中间件函数，将控制权交回给 router实例。

#### 错误处理中间件

错误处理中间件接受4个参数，只有提供了4个参数的中间件才可以被识别为错误处理中间件。  

```javascript
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})
```   

当我们调用 `next()` 方法时传入 `'route'` 以外的值时，Express 就会认为当前请求出现问题吗，就会跳过剩下的非错误处理路由及中间件函数。   

Express 内置了一个默认的错误处理函数。当我们已经在响应中写入东西后再抛出错误的话，Express默认的错误处理函数会关闭连接，并使请求失败。  

如果我们多次在代码中使用 `next()` 抛出错误，即使我们定制了错误处理函数，默认的错误处理函数还是会触发。  

#### 内置中间件

唯一的内置中间件是 `express.static`。  

`express.static(root, [options])`   


## 代理后的 Express

使用 `app.set()` 将应用变量 `trust proxy` 设置为下面表格中的一个值话，那么 Express 应用就是位于一个代理后的。     

+ Boolean : 如果为 true，则 `X-Forwarded-*` 首部最左边的信息会被当前是客户端的IP地址。如果为 false，应用就会认为是直接面向网络的，客户端的IP地址就是 `req.connection.remoteAddress`。这也是默认值。

+ IP addresses : 要信任的一个IP地址，子网，或者一个IP地址与子网的数组。下面的列表是预设置子网名：
  - loopback- `127.0.0.1/8`, `::1/128`
  - linklocal - `169.254.0.0/16`, `fe80::/10`  
  - uniquelocal- `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `fc00::/7`.   

可以用下面任意的形式设置 IP 地址：  

```javascript
app.set('trust proxy', 'loopback') // specify a single subnet
app.set('trust proxy', 'loopback, 123.123.123.123') // specify a subnet and an address
app.set('trust proxy', 'loopback, linklocal, uniquelocal') // specify multiple subnets as CSV
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']) // specify multiple subnets as an array
```

当指定地址时，IP 地址或子网从地址确定过程中被除去，离应用服务器最近的非受信 IP 地址被当作客户端 IP 地址。  

+ Number : 将代理服务器前第 n 跳当作客户端。

+ Function: 定制实现，只有在您知道自己在干什么时才能这样做。  

```javascript
app.set('trust proxy', function (ip) {
  if (ip === '127.0.0.1' || ip === '123.123.123.123') return true; // 受信的 IP 地址
  else return false;
})
```   

将 `trust proxy` 设置为非 `false` 值会导致下面几点不同：  

+ `req.hostname` 的值是从设置的 `X-Forwarded-Host` 中派生出来的，客户端或者代理都可以进行这项设置。
+ `X-Forwarded-Proto` 可以被反向代理设置，来告诉应用是否是 `https` or `http` or无效的值。这个值可以查询 `req.protocol`。  
+ `req.ip`, `req.ips` 被 `X-Forwarded-For` 中的地址污染了。  


## X-Forwarded

介绍一下 X-Forwarded-* 首部。  

X-Forwarded-For 首部是用来识别通过了 HTTP 代理或者一个负载均衡服务器连接Web服务器的原始的客户端的IP地址。当客户端与服务器之间的流量被拦截时，服务器的访问日志上直邮代理或者负载均衡服务器的IP地址。如果想要看到原始客户端的IP地址，就要使用这个首部。  

`X-Forwarded-For: <client>, <proxy1>, <proxy2>`  

```
X-Forwarded-For: 2001:db8:85a3:8d3:1319:8a2e:370:7348

X-Forwarded-For: 203.0.113.195

X-Forwarded-For: 203.0.113.195, 70.41.3.18, 150.172.238.178
```

X-Forwarded-Host 是用来识别原始客户端请求中Host请求的原始的主机。  

`X-Forwarded-Host: <host>`: host 是转发服务器的域名。  

`X-Forwarded-Host: id42.example-cdn.com`    

X-Forwarded-Proto 是客户端与代理或者负载均衡服务器连接时使用的协议。  

`X-Forwarded-Proto: <protocol>`  : 转发协议  

`X-Forwarded-Proto: https`  

## IP 地址

IPv6地址是128位，通常用`:`分成8段，每段由4个十六进制数表示。  

为了简化其表示法，rfc2373提出每段中前面的0可以省略，连续的0可省略为"::"，但只能出现一次。例如：  

```
1080:0:0:0:8:800:200C:417A
FF01:0:0:0:0:0:0:101
0:0:0:0:0:0:0:1
0:0:0:0:0:0:0:0
```  

上述地址可简写为：
```
1080::8:800:200C:417A
FF01::101
::1
::
```  

::1/128     即0:0:0:0:0:0:0:1，回环地址，相当于ipv4中的localhost（127.0.0.1），ping locahost可得到此地址。  

fe80::/10     本地链路地址，用于单一链路，适用于自动配置、邻机发现等，路由器不转发。     

## 使用模板引擎

模板引擎可以让我们在应用中使用静态模板文件。在运行时，模板引擎会使用实际值替换模板文件中的变量，并将模板
转换为 HTML 文件，发送给客户端。    

为了渲染模板文件，需要在 app 对象上进行如下设置：   

+ `views`，模板文件所在的目录。`app.set('views', './views')`   
+ `view engine`，使用的模板引擎。例如使用 Pug 模板引擎: `app.set('view engine', 'pug')`    


