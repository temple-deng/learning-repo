# Service Worker Overview

<!-- TOC -->

- [Service Worker Overview](#service-worker-overview)
  - [生命周期](#生命周期)
  - [注册 SW](#注册-sw)
  - [安装 SW](#安装-sw)
  - [缓存及返回请求](#缓存及返回请求)
  - [更新 SW](#更新-sw)

<!-- /TOC -->

+ SW 是一个 JS worker，因此无法访问 DOM，可以通过 `postMessage` 接口与页面进行交互
+ SW 是一个可编程的网络代理
+ 在不使用的时候，SW 会终止掉，但是在下次需要的时候会重启

## 生命周期

要想安装一个 SW，首先要注册 SW。注册 SW 会让浏览器在后台开始 SW 的安装步骤。    

通常在进行安装步骤的时候，我们会想要缓存一些静态资源。如果所有的文件都被成功缓存，那么 SW 就变为
了已安装状态。如果任意的文件没有下载成功并缓存，安装步骤就失败了，SW 不会被激活 activate（也不
会变成已安装状态）。这就只能等待下次再尝试安装了。    

一旦成功安装，紧接着就是激活步骤，这是个处理陈旧缓存的好机会。      

在激活步骤之后，SW 会掌控所有在其范围 scope 内的页面，不过注册 SW 的那个页面在第一次的时候并
不受控制，后面的再次加载才开始受控。   

一旦 SW 拿到了控制权，它就处于两种状态之一：要么为了节省内存退出，要么当页面发出网络请求或者
message 的时候处理 fetch 和 message 事件。    

![sw-lifecycle](https://raw.githubusercontent.com/temple-deng/markdown-images/master/pwa/sw-lifecycle.png)  

## 注册 SW

```js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      // 注册成功
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // 注册失败
      console.log('ServiceWorker registration failed: ', err);
    });
  })
}
```   

我们可以在页面每次加载的时候都调用 `register()` 方法，浏览器会去检查是否注册了 SW，然后进行
对应的处理，我们无须考虑重复注册的问题。    

在上面的代码中，SW 位于 Web 服务的根目录下，这意味着 SW 的范围 scope 是整个源。换句话说，
域中的所有东西都会触发 SW 上的 `fetch` 事件（说实话，到现在都不清楚是对域中的东西的请求，还是说
域中所有页面的所有网络请求，而不管请求的页面是否是同一个域的）。    

如果 SW 文件位于 `/example/sw.js`，那么 SW 只会在 URL 以 `/example/` 起始的页面上接收
到 `fetch` 事件。    

## 安装 SW

`install` 事件是在 SW 脚本中处理的，大多数情况下，我们应该在这个事件的回调中决定要缓存哪些
文件：   

```js
self.addEventListener('install', function(event) {
  // 执行安装步骤
});
```    

在 `install` 事件回调中，我们需要进行以下几步操作：   

1. 打开一个缓存对象
2. 缓存文件
3. 确认是否所有被请求的资源都已经被缓存了    

```js
const CACHE_NAME = 'my-site-cache-v1';
const urlsToCache = [
  '/',
  '/styles/main.css',
  '/script/main.js'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});
```    

## 缓存及返回请求

```js
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // 缓存命中
        if (response) {
          return response;
        }

        // 为什么不命中不放到 reject 里呢？？？
        return fetch(event.request);
      })
  );
});
```    

然而上面的这个，未命中的缓存请求了没有再缓存到本地，要下面这样才行：    

```js
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }

        // 注意要克隆请求，因为请求是一个流，只能使用一次
        // 由于我们缓存需要使用一次，浏览器请求需要一次
        // 所以要保存一份副本
        // 这里浏览器请求应该就是指我们在捕获请求的时候浏览器进行的那次请求把
        // 到这里其实理论上请求已经被浏览器消费掉了吧，因此我们必须取副本进行消费
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 响应也要克隆，也是一个流
            // 同理，我们这里最后返回响应算一次消费
            // 但是缓存中还保存一次，又一次消费
            const reponseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});
```    

那话说这样做的话，其实 `urlsToCache` 其实已经无法反映我们缓存中存储的准确的文件了。    

## 更新 SW

通常有很多时间节点我们需要更新 SW，当到这些时间节点时，我们需要：   

1. 更新 SW JS 文件。当用户导航到我们网站的时候，浏览器会尝试重新下载这个文件。如果这个文件更新过，
就认为是一个新的文件。
2. 新的 SW 会开始进行安装，处理 `install` 事件
3. 在这个时间点上，旧的 SW 仍然控制着当前的页面，因此新的 SW 会进入一个 `waiting` 状态
4. 当当前打开页面都关闭的时候，旧的 SW 就被终止掉，新的 SW 接手控制权（话说两个 SW 如果 scope
不一样会怎样）
5. 一旦新的 SW 接手控制权，触发 `activate` 事件    

```js
self.addEventListener('activate', function(event) {
  const cacheWhitelist = ['pages-cache-v1', 'blog-posts-cache-v1'];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```    

Last Update: 2018-11-05