# Cache, CacheStorage

<!-- TOC -->

- [Cache, CacheStorage](#cache-cachestorage)
  - [1. CacheStorage](#1-cachestorage)
    - [1.1 方法](#11-方法)
      - [CacheStorage.match()](#cachestoragematch)
      - [CacheStorage.has()](#cachestoragehas)
      - [CacheStorage.open()](#cachestorageopen)
      - [CachaStorage.delete](#cachastoragedelete)
      - [CacheStorage.keys](#cachestoragekeys)
  - [2. Cache](#2-cache)
    - [2.1 方法](#21-方法)
      - [Cache.match()](#cachematch)
      - [Cache.matchAll()](#cachematchall)
      - [Cache.add()](#cacheadd)
      - [Cache.addAll()](#cacheaddall)
      - [Cache.put()](#cacheput)
      - [Cache.delete()](#cachedelete)
      - [Cache.keys()](#cachekeys)

<!-- /TOC -->

## 1. CacheStorage

代表对 Cache 对象的存储区域。    

这个接口不止在 sw 中可以使用，在其他类型的 worker 和 window 中也可以使用，可以理解为所有命名的
缓存建立了一个目录。   

通过 `CacheStorage.open()` 获取一个 `Cache` 实例。    

使用 `CacheStorage.match()` 检查给定的 `Request` 是否是其存储的任意 Cache 对象的中的一个
键，可以理解为查看是否缓存了给定的 `Request`。    

也是只在 HTTPS 下才能访问。    

### 1.1 方法

#### CacheStorage.match()

检查给定的 `Request` 或者 url 字符串存储了对应的 Response。Cache 搜索顺序是按照 Cache 的
创建顺序。   

语法：   

```js
caches.match(request, options).then((response) => {
  // ...
});
```    

- `request`: 一个 `Request` 对象或者一个 URL 字符串
- `options` 控制匹配操作的细节
  + `ignoreSearch`: 布尔值，是否匹配流程忽略查询部分，默认 `false`
  + `ignoreMethod`: 布尔值，是否匹配时检查请求的 http 方法，默认 `false`
  + `ignoreVary`: 默认 `false`
  + `cacheName`: 指定搜索的 Cache 对象
- 返回值：一个 `Promise` resolve 为一个 `Response` 对象或 `undefined`   

#### CacheStorage.has()

检查指定的 `Cache` 对象是否存在，如果存在，返回一个 resolve 为 `true` 的 `Promise`。   

```js
caches.has(cacheName).then(function (bool) {
  // ...
});
```    

#### CacheStorage.open()

返回一个 resolve 为与 `cacheName` 匹配的 Cache 对象的 Promise。如果指定的 Cache 对象不存在，
那么会使用 `cacheName` 创建一个 Cache 对象并返回。   

```js
caches.open(cacheName).then((cache) => {
  // ...
});
```    

#### CachaStorage.delete

删除指定的 Cache 对象，如果删除了指定的对象，就返回一个 resolve `true` 的 Promise，如果没
找到指定的对象，resolve `false`。    

```js
caches.delete(cacheName).then((bool) => {
  // ...
});
```    

#### CacheStorage.keys

以创建的顺序返回所有的 Cache 对象的名称：    

```js
caches.keys().then((keyList) => {
  // ...
});
```   

## 2. Cache

`Cache` 为缓存的 `Request/Response` 对象对提供了一种存储机制。注意 `Cache` 接口在
window 作用域中也是可以访问的，不是局限于 SW。    

一个源可以有多名命名的 `Cache` 对象。使用 `CacheStorage.open()` 打开一个指定的命名
`Cache` 对象，然后调用 `Cache` 对象的任意方法。    

caching API 不遵从 HTTP 首部的缓存策略限制。   

### 2.1 方法

#### Cache.match()

返回一个 resolve 为 `Response` 的 Promise，这个 `Response` 是与 `Cache` 对象中第一个
匹配的请求相关联的。如果找不到匹配的，resolve `undefined`。    

```js
cache.match(request[, options]).then(response => {
  // ....
});
```    

+ `request`: 在 `Cache` 中搜索的 `Request` 对象，可以是一个 `Request` 对象或者是一个 URL。
+ `options`: 可选参数，默认均为 `false`
  - `ignoreSearch`: 布尔值，是否忽略 URL 中的查询字符串部分。
  - `ignoreMethod`: 布尔值
  - `ignoreVary`: 布尔值
  - `cacheName`: 这个选项会被忽略

#### Cache.matchAll()

类似于 `match`，但是这个是返回所有匹配的 `Response`。   

#### Cache.add()

接收一个 `Request` 或者 URL 做参数，获取资源，并将响应添加到缓存中，注意这个方法会覆盖
之前 cache 中存储的所有匹配的请求响应对。    

```js
cache.add(request).then(() => {
  // 
});
```   

+ `request`: `Request` 对象或 URL。   

等同于以下的效果：    

```js
fetch(url).then(function(response) {
  if (!response.ok) {
    throw new TypeError('bad response status');
  }
  return cache.put(url, response);
})
```

#### Cache.addAll()

类似 `add`，只不多参数是数组了。   

#### Cache.put()

将键值对添加到 Cache 对象中。   

同理也会覆盖先前匹配的键值对。    

`add`, `addAll` 不会缓存 `Response.status` 在 200 范围之外的响应，但是 `put` 可以。    

```js
cache.put(request, response).then(() => {
  // ...
});
```   

+ `request`: `Request` 对象
+ `response`: `Response` 对象

#### Cache.delete()

如果能找到匹配的条目，resolve `true` 否则是 `false`。   

```js
cache.delete(request[, options]).then((true) => {
  // ....
});
```    

+ `request`: `Request` 对象
+ options 同 `add()`

#### Cache.keys()

```js
cache.keys(request[, options]).then((keys) => {
  // ...
});
```   

+ `request`: 可选参数，`Request` 对象
+ `options` 同 `add()`
