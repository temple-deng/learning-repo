# Fetch API
<!-- TOC -->

- [Fetch API](#fetch-api)
  - [1. 简介](#1-简介)
    - [1.1 Guard](#11-guard)
  - [2. 基本用法](#2-基本用法)
    - [2.1 发送简单的请求](#21-发送简单的请求)
      - [2.1.1 传递请求选项参数](#211-传递请求选项参数)
      - [2.1.2 发送请求时附带证书等内容](#212-发送请求时附带证书等内容)
      - [2.1.3 检查请求是否成功](#213-检查请求是否成功)
      - [2.1.4 提供你自己的请求对象](#214-提供你自己的请求对象)
    - [2.2 Headers](#22-headers)
    - [2.3 响应对象](#23-响应对象)
      - [2.3.1 报文主体](#231-报文主体)
  - [3. fetch](#3-fetch)
  - [4. Headers 接口](#4-headers-接口)
    - [4.1 构造函数](#41-构造函数)
    - [4.2 方法](#42-方法)
  - [5. Body 接口](#5-body-接口)
    - [5.1 属性](#51-属性)
    - [5.2 方法](#52-方法)
  - [6. Request 接口](#6-request-接口)
    - [6.1 构造函数](#61-构造函数)
    - [6.2 属性](#62-属性)
    - [6.3 方法](#63-方法)
  - [7. Response 接口](#7-response-接口)
    - [7.1 构造函数](#71-构造函数)
    - [7.2 属性](#72-属性)
    - [7.3 方法](#73-方法)

<!-- /TOC -->

## 1. 简介

Fetch API 的核心是提供了对 HTTP Request, Response, Header, Body 的抽象接口，通过将这些
HTTP 组件抽象成 JS 对象，其他的 API 就可以很方便地使用这些组件。    

### 1.1 Guard

Guard 是 `Headers` 对象的一个功能，根据使用 header 的地方，可能的值包括 `immutable, request`
`request-no-cors, response, none`。    

当使用 `Headers()` 构造函数创建一个新的 `Headers` 对象时，guard 设为 `none`。当创建一个
`Request` 或 `Response` 对象时，其相关的 `Headers` 对象的 guard 设置如下：    


对象类型 | 调用的构造函数 | 关联 `Headers` 的 guard
---------|----------|---------
 `Request` | `Request()` | `request`
 `Request` | `Request()` `mode` 配置项为 `no-cors` | `request-no-cors`
 `Response` | `Response()` | `response`
 `Response` | `error()` 或者 `redirect()` 方法 | `immutable`

guard 会影响 `set(), delete(), append()` 方法：    

+ 如果是 `immutable`，那么对象 Headers 的修改会抛出异常
+ 如果是 `request`，那么只要不是一些不允许编程修改的首部，那么操作就可以成功
+ 如果是 `request-no-cors`，那么首部必须是简单首部
+ 如果是 `reponse`，首部也不能是不允许修改的首部    

## 2. 基本用法

fetch 规范与 `jQuery.ajax()`有两点主要的不同之处:  

+ `fetch()` 返回的 Promise对象不会由于 HTTP 错误状态(如HTTP404, 500)而变成 reject 状态。
相反，其会正常地 resolve(不过 ok status 设为了 false)，其只会由于网络错误或者有什么东西阻止请求完成
时才会 reject。  

+ 默认情况下，`fetch` 不会发送或者接收任何的 cookies 内容，如果站点依赖于维护用户会话，则导致未经身份验证的请求。  

### 2.1 发送简单的请求

基础的 fetch 请求样式如下面的代码所示：  

```javascript
var myImage = document.querySelector('img');

fetch('flowers.jpg').then(function(response) {
  return response.blob();
}).then(function(myBlob) {
  var objectURL = URL.createObjectURL(myBlob);
  myImage.src = objectURL;
});
```  

#### 2.1.1 传递请求选项参数

`fetch()` 方法可以接受一个可选的第二个参数， 一个 `init` 对象用来控制请求的配置：    

```javascript
var myHeaders = new Headers();

var myInit = { method: 'GET',
               headers: myHeaders,
               mode: 'cors',
               cache: 'default' };

fetch('flowers.jpg', myInit).then(function(response) {
  return response.blob();
}).then(function(myBlob) {
  var objectURL = URL.createObjectURL(myBlob);
  myImage.src = objectURL;
});
```  

#### 2.1.2 发送请求时附带证书等内容

如果要想在发送请求时附带证书等内容，需要在第二个参数对象中添加 `credentials: 'include'` 参数，
相反如果不想让浏览器发送证书内容，设置 `credentials: 'omit'`。  

#### 2.1.3 检查请求是否成功

`fetch()` 返回的 Promise 会在遇到网络错误时 reject，抛出 `TypeError` 错误。如果想要精确的
检查 `fetch()` 是否成功，首先检查 promise 是否 resolved，之后检查 `Response.ok` 属性是否为
`true`。  


#### 2.1.4 提供你自己的请求对象

在 `fetch()` 调用中我们可以传入一个使用 `Request()` 构造函数新建的请求对象，而不是传入资源的路径：  

```javascript
var myHeaders = new Headers();

var myInit = { method: 'GET',
               headers: myHeaders,
               mode: 'cors',
               cache: 'default' };

var myRequest = new Request('flowers.jpg', myInit);

fetch(myRequest).then(function(response) {
  return response.blob();
}).then(function(myBlob) {
  var objectURL = URL.createObjectURL(myBlob);
  myImage.src = objectURL;
});
```

`Request()` 函数的参数与 `fetch()` 相同，甚至可以传入一个已存在的请求对象来创建一份副本：  

`var anotherRequest = new Request(myRequest, myInit)`  

### 2.2 Headers

`Headers` 接口可以让我们通过 `Headers()` 构造函数创建首部对象。  

```javascript
var content = "Hello World";
var myHeaders = new Headers();
myHeaders.append("Content-Type", "text/plain");
myHeaders.append("Content-Length", content.length.toString());
myHeaders.append("X-Custom-Header", "ProcessThisImmediately");
```  

也可以传入一个二维数组或者对象直接量给构造函数：  

```javascript
myHeaders = new Headers({
  "Content-Type": "text/plain",
  "Content-Length": content.length.toString(),
  "X-Custom-Header": "ProcessThisImmediately",
});
```  

### 2.3 响应对象

当 `fetch()` 返回的Promise是 resolved 状态时会返回一个 `Response` 实例。  

也可以通过JS创建这些对象，但这只在 ServiceWorkers 有用。  

Response() 构造函数接受两个可选的参数——响应的主体，以及一个初始化对象。  

常用的属性如下：  

+ `Response.status` -- 一个包含响应状态码的整数，默认是 200。  

+ `Response.statusText` -- 原因短语，默认是 'OK'。  

+ `Response.ok` -- 这是用来检查状态码在 200-299 之内的缩写形式，布尔值。  

#### 2.3.1 报文主体

请求与响应都可以包含主体数据。报文主体可以是下列类型的实例：

+ ArrayBuffer
+ ArrayBufferView
+ Blob/File
+ string
+ URLSearchParams
+ FormData

报文主体定义下面的方法来导出主体（Request 和 Response 都实现了）。这些都会返回一个promise对象。  

+ arrayBuffer()
+ blob()
+ json()
+ text()
+ formData()


## 3. fetch

```js
WindowOrWorkerGlobalScope.fetch()
Promise<Response> fetch(input [, init])
```    

注意这个方法的参数是和 `Request()` 构造函数一致的。   

+ **`input`**: 这个参数定义了我们想要获取的资源。可以是下面是两种形式之一：
  - 一个包含资源 URL 地址的字符串。
  - 一个 Request 对象。
+ **`init`**: 可选参数。设置请求的选项。可选的选项如下：
  - `method`: 请求的方法。例如 `GET, POST`。
  - `headers`: 想要为请求添加的首部，可以是一个普通的对象或者是一个 `Headers` 对象。
  - `body`: 请求的主体，可以是 Blob，ArrayBuffer，ArrayBufferView，FormData，URLSearchParams，或者是一个字符串。注意`GET, HEAD` 方法不能包含主体。
  - `mode`: 请求使用的模式，例如 `cors, no-cors, same-origin`。
  - `credentials`: 是否要包含证书等内容，例如 `omit, same-origin, include`。
  - `cache`: 请求使用的缓存模式：`default, no-store, reload, no-cache, force-cache, only-if-cached`。这个应该是设置请求的首部吧。
  - `redirect`: 使用的重定向模式：`follow`（自动跟着重定向），`error`（如果发生了重定向抛出错误），`manual`（手动处理重定向问题）
  - `referrer`: 一个字符串：`no-referrer, client` 或者是一个 URL。
  - `referrerPolicy`: 指定 referer 首部的值：`no-referrer, no-referrer-when-downgrade, origin, origin-when-cross-origin, unsafe-url`。
  - `integrity`: 略。
  - `signal`: 略。
  - `observe`: 略。    

## 4. Headers 接口

Headers 接口允许我们对 HTTP 请求和响应首部执行多种操作。这些操作包括获取，设置，添加和移除。
一个Headers对象有一个相关联的首部列表，初始时为空，可以包含零或多个名值对。接口的所有方法，
首部名匹配都是大小写不敏感的。   

处于安全的原因，一些首部是接口不能控制的，其实 XHR 中也有这样的限制。   

可以通过 `Request.headers` 和 `Response.headers` 获取 `Headers` 对象，或者通过
`Headers.Headers()` 构造函数新建一个对象。  

构造函数：`new Headers(init)`。`init` 可选参数，可以是一个普通的对象，或者是一个 `Headers` 对象。   

### 4.1 构造函数

+ `Headers.Headers(init)`: 创建一个新的 `Headers` 对象
  - `init`: 可选参数，一个包含 HTTP 首部的对象，可以是一个普通的对象，或者是另一个 `Headers`
  对象

### 4.2 方法

+ `Headers.append(name, value)`   
  为已存在的首部追加新值，或者添加一个不存在的首部。注意这里追加不是说再添加一个新的首部啊，就是在一个
  已存在的首部的值集合中添加新值。也就是说不会出现重复的首部。  

+ `Headers.delete(name)`  
  删除一个首部。  

+ `Headers.set(name, value)`  
  为已存在的首部设置新值，或者添加一个不存在的首部。  

+ `Headers.get(name)`  
  返回一个给定首部名的所有值字节字符串序列（ByteString sequence）。  

+ Headers.has(name)  
  返回一个布尔值表明对象是否包含指定的首部。  

+ `Headers.forEach()`   
  貌似还没实现   

+ `Headers.keys()`  
  返回迭代器

+ `Headers.values()`  
+ `Headers.entries()`

## 5. Body 接口

`Request` 和 `Response` 都实现了 `Body` 接口。这个接口为这两个对象提供了一个关联的报文
主体（一个流），一个使用标识（初始时未设置），和一个 MIME 类型（初始是空的字符串）。    

### 5.1 属性

+ `Body.body`: 只读，返回一个 `ReadableStream`
+ `Body.bodyUsed`: 只读，包含一个表示主体是否已经读取的布尔值。这个应该是只用在响应的主体中吧。      

### 5.2 方法

+ `Body.arrayBuffer()`  
+ `Body.blob()`  
+ `Body.formData()`  
+ `Body.json()`    
+ `Body.text()`   


## 6. Request 接口

### 6.1 构造函数  

通常来说这个对象不用我们自己构造，一般是 service worker 中 `fetch` 事件的 `event.request`
对象会返回一个这样的对象。   

+ `var myRequest = new Request(input, init)`  

**参数**

+ `input`  
  定义了想要获取的资源，可以是：  
  + 一个包含资源URL地址的字符串。  
  + 一个 Request 对象，可以高效的创建副本。  
+ `init` 可选参数  
可能的选项有：  
  + `method`: 请求的方法，如 GET, POST。
  + `headers`: 请求附加的首部，可以是 Headers 对象或者是对象直接量。  
  + `body`
  + `mode`: 请求使用的模式，如 cors, no-cors, same-origin, 或者 navigate。默认是 cors。  
  + `credentials`: omit, same-origin, include。  
  + `cache`: 请求采取的缓存模式。
  + `redirect`: 使用的重定向模式： follow, error, manual。  
  + `referrer`: no-referrer, client, 或者是一个 URL, 默认是 client。
  + `integrity`


### 6.2 属性

所有属性都是只读的。

+ Request.cache: 缓存模式，控制了请求如何与浏览器的缓存交互，可选的值有：
  - `default` - 浏览器在 HTTP 缓存中搜索匹配的请求
    + 如果找到一个匹配的，并且是新鲜的，那就直接从缓存中返回
    + 如果找到一个过期的，发送条件请求，必要时更新缓存
    + 如果不匹配，发送正常请求并更新缓存
  - `no-store` - 浏览器直接从服务器获取资源，也不会使用下载的资源更新缓存
  - `reload` - 浏览器从服务器获取资源，但是会使用下载的资源更新缓存
  - `no-cache` - 浏览器从 HTTP 缓存中搜索匹配的请求
    + 如果找到一个匹配的，不管过期与否，都发条件请求，并更新缓存
    + 找不到匹配的，发普通请求并更新缓存
  - `force-cache` - 浏览器从 HTTP 缓存中搜索匹配的请求
    + 找到匹配的，不管过不过期，都从缓存返回
    + 找不到匹配的，发送普通请求并更新缓存
  - `only-if-cached` - 浏览器从 HTTP 缓存中搜索匹配的请求
    + 找到匹配的，不管过不过期，从缓存返回
    + 找不到报 504
+ `Request.credentials`
+ `Request.destination`: 一个字符串，描述了请求的内容的类型，包括以下内容
  - `""`
  - `'audio'`
  - `'audioworklet'`
  - `'document'`
  - `'embed'`
  - `'font'`
  - `'image'`
  - `'manifest'`
  - `'object'`
  - `'paintworklet'`
  - `'report'`
  - `'script'`
  - `'serviceworker'`
  - `'sharedworker'`
  - `'style'`
  - `'track'`
  - `'video'`
  - `'worker'`
  - `'xslt'`
+ `Request.headers`
+ `Request.method`
+ `Request.mode`:
  - `same-origin` - 如果是跨域请求，直接返回错误
  - `no-cors` - 只允许简单跨域请求
  - `cors` - 允许跨域请求
  - `navigate` - 看不明白
+ `Request.url`
+ `Request.referrer`
+ `Request.referrerPolicy`
+ `Request.redirect`
+ `Request.integrity`
+ `bodyUsed`
+ `body`

### 6.3 方法

+ `Request.clone()`  

以及Body的方法。  


## 7. Response 接口

### 7.1 构造函数

`var myResponse = new Response(body, init);`   

+ **`body`**: 可选参数，可以是这些形式的对象：`Blob, ArrayBuffer, ArrayBufferView, FormData, ReadableStream, URLSearchParams, String`。
+ **`init`**: 可选参数。可选值有：
  - `status`
  - `statusText`
  - `headers`

### 7.2 属性

所有属性都是只读的。  

+ `Response.headers`
+ `Response.ok`
+ `Response.redirected`
+ `Response.status`
+ `Response.statusText`
+ `Response.type`
+ `Response.url`
+ `Response.useFinalURL`
+ `bodyUsed`
+ `body`   

`Response.type` 指的是响应的类型，包括以下的类型：   

+ `basic`: 常规的同源请求
+ `cors`
+ `error`: 网络错误。
+ `opaque`: 对 `no-cors` 获取跨域资源请求的响应。

### 7.3 方法

+ Response.clone()
+ Response.error()
+ Response.redirect(url,status)  

同样还包含 `Body` 接口的几个方法。   

Last Update: 2018-11-06



