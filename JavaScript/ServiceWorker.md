# Service Worker   

## 介绍

Service Worker 其实基本上是类似于 Web 应用与浏览器和网络（网络可用时）之前的代理服务器的角色。
它们旨在提供高效的离线体验，拦截网络请求，并根据网络是否可用采取合适的措施，并从服务器更新缓存
的资源。    

一个 service worker 是一个注册在一个源和路径上的事件驱动的 worker。它是一个 JS 文件，用来
控制与其相关联的 web 页面及站点的行为，拦截及修改导航和资源的请求，并且以非常细致的形式缓存资源，
以便让我们能在一些情况下完全控制应用的行为（最常见的就是网络不可用的场景）     

service worker 是运行在一个 worker 上下文中的：因此其不能访问 DOM，并且是运行在与应用主要的
JS 线程不同的线程上，所有其实非阻塞的。它被设计成完全异步的，结果就是，同步版本的 XHR 和 localStorage
API 是无法使用的。   

service worker 出于安全原因，只能通过 HTTPS 运行。    

### 关于 Service Worker 需要知道的事

+ Service Worker 是一个 JS Worker，所以可以通过 `postMessage` 接口向其控制的页面发送信息，
完成交互。
+ Service Workers 是一个可编程的网络代理，允许我们控制我们受控的页面中网络请求应该怎么处理。
+ 当不在使用它的时候它是关闭的（terminated），当下一次需要它的时候又会重启，所以我们不能依赖
Service Workers 中 `onfetch` 和 `onmessage` 处理函数中设置的全局的状态。如果我们需要一些在
多个重启之间持久的信息，Service Workers 可以访问 IndexedDB API。  

### Service Workers 的生命周期

Service Workers 有一个与 web 页面完全分离的生命周期。   

为了在我们的站点上安装一个 Service Worker，首先需要注册它，这一步是在页面中的 JS 中完成的。
注册一个 Service Worker 会使浏览器在后台开始 Service Workers 的安装步骤。    

通常在安装步骤中，我们会想要去缓存一些静态资源。如果所有的文件都被成功地缓存，那么 Service Workers
就变为已安装的（installed）。如果任一文件下载或者缓存失败，那么安装步骤就会失败，并且
Service Workers 也不会激活。    

当安装过后，紧接着就是激活步骤，这是一个处理旧的缓存内容的好机会。    

在激活步骤结束后，Service Workers 会控制在其范围中的所有页面，不过第一次注册了这个 service worker
的页面在重新加载前是不受控制的。一旦 service worker 处于控制状态，它会是两种状态之一：
要么 service worker 为了节省内存是被关闭了，要么就会对当页面中发出的网络请求触发的 fetch
事件，及发送信息触发的 message 事件进行处理。    

下图是 service worker 在第一次安装时生命周期的简化版本：   

![lifecycle](https://developers.google.com/web/fundamentals/getting-started/primers/imgs/sw-lifecycle.png)

### 更新 service worker

在一个时间点上我们需要更新 service worker。当到达这个时间点时，我们需要做下面的几步操作：   

1. 更新我们的 service worker JS 文件。当用户导航到我们的站点时，浏览器会试着重新下载 service worker
的脚本文件。即便这两个文件有一个字节的不同，那么新下载的就被认为是新的。
2. 我们新的 service worker 会启动并触发 `install` 事件。
3. 这时旧的 service worker 仍然控制着当前的页面，所以新的 service worker 会进入 `waiting` 状态。
4. 当当前打开的网页关闭后，旧的 service worker 会被杀死，新的 service worker 开始控制。
5. 一旦新的 service worker 接手控制权，`activate` 事件触发。    



### 基础的架构

在使用 service worker 时，通常包含下面基本的步骤：   

1. 获取 service worker URL 并通过 `ServiceWorkerContainer.register()` 注册。   
2. 如果成功的话，worker 会在 `ServiceWorkerGlobalScope` 作用域内执行。
3. 此时的 service worker 已经准备好处理事件了。
4. 当随后访问 service worker 控制的页面时尝试安装 worker。
5. 当 `oninstall` 事件处理函数完成，service worker 就被认为是安装了。
6. 之后就是激活操作。当 service worker 安装完成后，就会收到一个 activate 事件。`onactivate`
事件处理函数主要的工作清理之前版本 worker 使用的资源。
7. 此时的 worker 就可以控制页面了，但仅限那些在 `register()` 成功调用之后打开的页面。     


### 其他的想法

service worker 同时还可以用在这些事情上：    

+ 同步后台数据
+ 为对其他源的资源请求做出响应
+ 接收到诸如地理定位或陀螺仪等昂贵的计算数据的集中更新，因此多个页面可以利用一组数据
+ 出于开发的需要，为 CofferScript,less,CJS/AMD 模块等执行客户端编译和依赖管理
+ 后台服务的钩子
+ 基于 URL 模式定制模板
+ 性能优化，例如，预获取用户将来可能用到的资源    


## 一个简单的例子

在线预览效果：[demo](https://mdn.github.io/sw-test/)。    

### 注册 worker

```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw-test/sw.js', {scope: '/sw-test/'})
  .then(function(reg) {
    // registration worked
    console.log('Registration succeeded. Scope is ' + reg.scope);
  }).catch(function(error) {
    // registration failed
    console.log('Registration failed with ' + error);
  });
}
```   

上面的代码中首先检测了浏览器是否支持 service worker。之后使用 `ServiceWorkerContainer.register()`
为这个站点注册了 service worker。注意worker 文件的位置是相对于源的，而不是引用它的文件。    

`register()` 中第二个参数 `scope` 是可选的，这个参数是用来指定我们希望 worker 控制的内容的子集。
在上面的例子中，我们声明为 `'/sw-test/'`，这意味着所有应用中的内容。如果省略了这个参数，
那么其默认也是这个值。（这个主要是因为应用就是在 `'/sw-test/'` 目录中吧）    

一个单一的 service worker 可以控制许多页面。每次加载一个处于我们 scope 内的页面时，worker
就会安装到页面上并在其上操作。因此我们需要注意在 worker 脚本中的全局变量：每个页面并没有其
单独的 worker。    

### 关于注册需要注意的事情   

1. service worker 只捕获处于 worker 范围内的客户端请求。
2. worker 最大的范围是 worker 所处的位置。
3. 如果客户端激活的 worker 包含一个 `Service-Worker-Allowed` 首部，那么可以指定一个 worker
最大范围的列表。
4. 在 FireFox 中，如果用户使用的是私人浏览模式，那么 service worker 是不可用的。    

### 按照及激活：污染我们的缓存

在注册完 worker 后，浏览器就尝试为我们的页面/站点按照并激活 service worker。    

当安装成功完成后触发 `install` 事件。这个事件通常用我们应用在离线状态下需要的资源来污染
我们的浏览器离线缓存。为了完成这项工作，我们使用 Service Worker 提供的新的存储 API - cache -
一个在 worker 中的全局变量，通过这个变量我们可以存储响应分发的资源。这个 API 的工作方式类似于浏览器的
标准缓存，但却是只对我们的域特定的。     

下面的代码是 worker 中的代码：   

```js
this.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('v1').then(function(cache) {
      return cache.addAll([
        '/sw-test/',
        '/sw-test/index.html',
        '/sw-test/style.css',
        '/sw-test/app.js',
        '/sw-test/image-list.js',
        '/sw-test/star-wars-logo.jpg',
        '/sw-test/gallery/',
        '/sw-test/gallery/bountyHunters.jpg',
        '/sw-test/gallery/myLittleVader.jpg',
        '/sw-test/gallery/snowTroopers.jpg'
      ]);
    })
  );
});
```   

1. 这里我们首先为 worker 的 `install` 事件绑定监听函数，然后将一个 `ExtendableEvent.waitUntil()`
方法链接到事件上 —— 这会确保直到 `waitUntil()` 中的代码执行完成 service worker 才会安装。    
2. 在 `waitUntil()` 内部我们使用 `caches.open()` 方法创建一个名叫 `v1` 的新的缓存，这就是
我们站点资源缓存的版本1.这个方法以创建好的 cache 返回一个 promise；一旦变为 resolved 状态，
回调中我们在已创建的 cache 上调用 `addAll()` 方法，这个方法的参数接受一个数组，每个元素
就是我们希望缓存的资源的相对于源的 URL。  
3. 如果 promise 变为了 rejected,那么安装会失败，worker 不会做任何的事情。这也是正常的，
我们可以修复代码然后在下次注册发生时再试一遍。   
4. 在成功安装后，worker 要开始激活。    

### 为请求定制响应

现在我们已经得到了缓存的资源，我们需要告诉 workers 对已缓存的内容做一些事情。通过 `fetch`
事件很容易完成这件任务。    

![](https://mdn.mozillademos.org/files/12634/sw-fetch.png)    


每次获取任意受 sw 控制的资源时都会触发一个 `fetch` 事件，这些资源包括在指定范围内的文档，及
这些文档引用的任意资源（例如，如果 `index.html` 对一个内嵌的图片发出一个跨域请求，那么仍会通过其
sw）。     

我们可以给 sw 绑定一个 `fetch` 事件处理函数，然后调用事件上的 `respondWith()` 方法来劫持
我们的 HTTP 响应并使用我们自己的逻辑来更新它们。   

```js
this.addEventListener('fetch', function(event) {
  event.respondWith(
    // magic goes here
  );
});
```   

 我们先通过简单地响应 url 与网络请求相匹配的资源的例子开始：    

```js
this.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
  );
});
```    

`caches.match(event.request)` 允许我们用缓存中可用的与从网络请求的资源等价的资源匹配，
前提是有可用的匹配的资源。这里的匹配需要验证 url 及首部，与正常的 HTTP 请求相同。    

下面我们再介绍可选择的另一种逻辑：   

1. `Response()` 构造函数让我们可以创建自定义的响应。在这个例子中，我们只简单的返回一个文本字符串：
`new Response('Hello from your friendly neighbourhood service worker!');`
2. 下面的是更复杂的 `Response` 例子，我们可以选择性的传入一系列响应的首部来模拟标准的响应首部。   
```js
new Response('<p>Hello from your friendly neighbourhood service worker!</p>', {
  headers: { 'Content-Type': 'text/html' }
});
```   
3. 如果在缓存中并没有找到一份匹配，我们可以告诉浏览器去直接 `fetch` 资源的网络请求，从
可用的网络中获取新的资源。   
`fetch(event.request);`
4. 如果在缓存中没有找到匹配，其当前网络也不可用，我们可以使用 `match()` 提供一些默认的回退的页面
来对请求做出匹配：    
`caches.match('/fallback.html');`   
5. 我们可以通过 `FetchEvent` 返回的 `Request` 对象获取许多关于请求的信息：   
```
event.request.url
event.request.method
event.request.headers
event.request.body
```   


下面是 worker 中完整的代码：   

```js
this.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('v1').then(function(cache) {
      return cache.addAll([
        '/sw-test/',
        '/sw-test/index.html',
        '/sw-test/style.css',
        '/sw-test/app.js',
        '/sw-test/image-list.js',
        '/sw-test/star-wars-logo.jpg',
        '/sw-test/gallery/bountyHunters.jpg',
        '/sw-test/gallery/myLittleVader.jpg',
        '/sw-test/gallery/snowTroopers.jpg'
      ]);
    })
  );
});

this.addEventListener('fetch', function(event) {
  event.respondWith(caches.match(event.request).catch(function() {
    return fetch(event.request);
  }).then(function(response) {
    caches.open('v1').then(function(cache) {
      cache.put(event.request, response);
    });
    return response.clone();
  }).catch(function() {
    return caches.match('/sw-test/gallery/myLittleVader.jpg');
  }));
});
```    

注意上面我们对缓存中未匹配时的处理，首先先尝试通过网络获取资源，然后将这个请求及响应的副本
推送到了缓存中，最后在网络也不可用时提供回调的内容。    

注意，保存响应的副本是非常有必要的，因为请求与响应流只能读取移除。     

### 更新我们的 sw

如果我们之前已经安装了 sw，那么当重新刷新或者加载的页面上有新版本的 worker 时，新版本的 worker
会在后台安装，但不会激活。只有在所有使用旧的 worker 的页面都不存在了时才会激活。    

我们可能会想要在新版本的 sw 中更新我们的 `install` 事件监听函数：    

```js
this.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('v2').then(function(cache) {
      return cache.addAll([
        '/sw-test/',
        '/sw-test/index.html',
        '/sw-test/style.css',
        '/sw-test/app.js',
        '/sw-test/image-list.js',

        …

        // include other new resources for the new version...
      ]);
    })
  );
});
```   

我们当然还会收到 `activate` 事件。我们通常会在这个事件处理函数中处理一些例如旧的 sw 仍在
运行时中断了的任务，例如清除旧的缓存。移除不再需要的数据有助于我们避免占据太多的硬盘空间——
每个浏览器都会对 sw 可以使用的缓存数据的数量进行限制。      

传入 `waitUntil()` 的 promise 会在完成前一直阻塞其他的事件，所有我们可以确定请求工作会
在对新缓存的第一次请求事件发生前完成了。   

```js
this.addEventListener('activate', function(event) {
  var cacheWhitelist = ['v2'];

  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (cacheWhitelist.indexOf(key) === -1) {
          return caches.delete(key);
        }
      }));
    })
  );
});
```    
