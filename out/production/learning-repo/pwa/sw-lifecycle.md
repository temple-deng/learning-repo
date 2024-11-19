# Service Worker Lifecycle

<!-- TOC -->

- [Service Worker Lifecycle](#service-worker-lifecycle)
  - [意图](#意图)
  - [第一个 SW](#第一个-sw)
    - [范围](#范围)
    - [激活 Activate](#激活-activate)
    - [clients.claim](#clientsclaim)
  - [更新 SW](#更新-sw)
    - [更新](#更新)
    - [激活 Activate](#激活-activate-1)
    - [手动更新](#手动更新)

<!-- /TOC -->

## 意图

SW 的生命周期的意图包括：  

+ 尽可能首先提供离线服务
+ 在不影响旧 SW 的请求下准备好新的 SW
+ 确保范围内的页面在其打开期间始终受到的是同一个 SW 的控制
+ 确保同时只有一个版本的页面在运行

## 第一个 SW

简短来说：   

+ `install` 事件是 SW 接收到的第一个事件，也只触发一次
+ 传递给 `installEvent.waitUntil()` 的 promise 标志着安装的成功与失败
+ SW 只有在完成安装过程，变为 active 状态（等等，这意思是在 activate 事件前咯？）后才会开始
接收到 `fetch` 和 `push` 事件
+ 默认情况下，当前注册 SW 的页面的请求不走 SW。也就是还不受 SW 的控制。
+ `clients.claim()` 可以覆盖这种行为，强制接手非受控页面

### 范围

一个 SW 注册的默认 scope 就是相对于脚本 URL 的 `./`。    

我们将页面, dedicated workers, shared workers 称为 `clients`。SW 仅能控制 in-scope
的 clients。一旦一个 client 是受控的，它的请求会通过 in-scope 的 SW。可以在 client 中
通过 `navigator.serviceWorker.controller` 获取一个 SW 实例或者 null。    

### 激活 Activate

一旦 SW 准备好控制 clients 以及处理像 `push`, `sync` 等事件，会收到一个 `activate` 事件。   

### clients.claim

一旦 SW 被激活后，我们可以调用 `clients.claim()` 强制接手未受控 client 的控制权。   

```js
self.addEventListener('activate', event => {
  clients.claim();
  console.log('Now ready to handle fetches!');
});
```   

## 更新 SW

简短来说：  

+ 更新是由以下触发的：
  - 一个到 in-scope 页面的导航
  - 一个 `push` 和 `sync` 类似的事件，除非在之前的 24 小时内进行过更新检查
  - 使用一个不同是 URL 调用 `register()` 方法
+ 大多数浏览器默认情况下会忽略已注册 SW 的缓存首部，但是 SW 中通过 `importScripts()` 加载的
资源仍然遵循它们的缓存首部规则。
+ 只要 SW 脚本有修改，就认为是新的，这个规则被扩展到了被导入的脚本/模块
+ `self.skipWaiting()` 会跳过 `waiting` 阶段，意味着在完成安装后会尽快进入 activate 阶段。   
通常一个 sw 在首次下载后，每隔 24 个小时会再次下载一次。当然也可能由于其他的操作更新的更频繁，
但是 24 小时一更新是最低的限度。   

```js
const expectedCaches = ['static-v2'];

self.addEventListener('install', event => {
  console.log('V2 installing...');

  event.waitUntil(
    caches.open(expectedCaches)
      .then(cache => {
        cache.add('/horse.svg')
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (!expectedCaches.includes(key)) {
          return caches.delete(key);
        }
      })
    )).then(() => {
      console.log('V2 now ready handle fetches!');
    })
  );
});
```    

### 更新

只要我们还有一个 tab 中还打开着站点页面，新的 SW 就会一直处在 waiting 状态，即便我们强制刷新
页面也不成。    

### 激活 Activate

一旦旧的 SW 挂掉，新的 SW 就接收 activate 事件。如果如果传给 `event.waitUntil()` 一个
promise，那么 SW 会缓存 `fetch`, `push`, `sync` 等事件，直到 promise resolve。    

### 手动更新

之前提到了，浏览器在导航和一些特定事件发生后会自动检查 SW 的更新，不过我们也可以手动触更新：   

```js
navigator.serviceWorker.register('/sw.js').then(reg => {
  reg.update();
});
```    

Last Update: 2018-11-05