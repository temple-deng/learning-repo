# Using Service Workers

MDN 上关于使用 SW 一点介绍。    

<!-- TOC -->

- [Using Service Workers](#using-service-workers)
  - [基础架构](#基础架构)
  - [代码示例](#代码示例)
    - [首先注册](#首先注册)
    - [安装](#安装)
    - [自定义响应](#自定义响应)
  - [相关接口](#相关接口)

<!-- /TOC -->

## 基础架构

1. 首先通过 `serviceWorkerContainer.register()` 注册一个 SW
2. 如果成功注册了 SW 的话，SW 会在 `ServiceWorkerGlobalScope` 作用域中执行。
3. 这时 SW 已经准备好处理事件
4. 开始安装 SW，SW 收到 `install` 事件，当 `oninstall` 处理完成后，SW 就是处于已安装状态了
5. 之后进入激活步骤，一旦安装完成后，SW 收到一个 `activate` 事件。
6. 这时 SW 已经可以接手新打开页面的控制权了。     

## 代码示例

### 首先注册

```js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw-test/sw.js', { scope: '/sw-test/' })
    .then((registration) => {
      console.log('Registration succeed. Scope is ' + registration.scope);
    }).catch((error) => {
      console.log('Registration failed with ' + error);
    });
}
```    

### 安装

```js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/sw-test/',
        '/sw-test/index.html',
        '/sw-test/style.css',
        '/sw-test/app.js',
        '/sw-test/image-list.js',
        '/sw-test/star-wars-logo.jpg',
        '/sw-test/gallery/',
        '/sw-test/gallery/bountyHunters.jpg',
        '/sw-test/gallery/myLitterVader.jpg',
        '/sw-test/gallery/snowTroopers.jpg'
      ]);
    })
  );
});
```    

### 自定义响应

![sw-fetch](https://raw.githubusercontent.com/temple-deng/markdown-images/master/pwa/sw-fetch.png)  

`fetch` 事件会在受控范围内的文档对任意的资源进行请求时触发。    

```js
self.addEventListener('fetch', (evt) => {
  evt.respondWith(
    caches.match(evt.request).then((response) => {
      return response || fetch(evt.request).then((res) => {
        return caches.open('v1').then((cache) => {
          cache.put(evt.request, res.clone());
          return res;
        });
      });
    }).catch(() => {
      return caches.match('/sw-test/gallery/myLitterVader.jpg');
    })
  );
});
```    

## 相关接口

+ **Cache**: 代表 SW 生命周期中缓存的 **Request/Response** 对象对的存储
+ **CacheStorage**: 代表 **Cache** 对象的存储。
+ **Client**: 代表一个浏览器中的文档或者一个 SharedWorker，这个文档或 Worker 被一个激活的
SW 控制着
+ **Clients**: 代表一个存放 **Client** 对象列表的容器。
+ **ExtendableEvent**: 延长了 `install` 和 `activate` 事件的生存时间。
+ **ExtendableMessageEvent**
+ **FetchEvent**: 传递给 fetch handler 的参数。
+ **InstallEvent**
+ **Navigator.serviceWorker**: 返回一个 `ServiceWorkerContainer` 对象
+ **NotificationEvent**
+ **ServiceWorker**
+ **ServiceWorkerContainer**
+ **ServiceWorkerGlobalScope**
+ **ServiceWorkerRegistration**
+ **ServiceWorkerState**
+ **SyncEvent**

Last Update: 2018-11-06
