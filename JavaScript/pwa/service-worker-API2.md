# Service Worker API

目录：  

+ [CacheStorage](#cachestorage)
+ [Cache](#cache)
+ [ExtendableEvent](#extendableevent)
+ [FetchEvent](#fetchevent)


## CacheStorage

<a name="cachestorage"></a>   

**CacheStorage** 接口代表了 Cache 对象的仓库。   

### 方法

#### CacheStorage.match()

`match()` 方法会检查是否给定的 `Request` 是 CacheStorage 追踪的任一 Cache 对象的键。   

```js
cacheStorage.match(request,{options}).then(function(response) {
  //do something with the request
});
```   

+ `request`: 想要匹配的 `Request` 对象。
+ `options`: 可选参数。选项的属性控制了匹配操作的行为。可选的选项如下：
  - `ignoreSearch`: 布尔值。指定匹配过程是否应该忽视 url 中的查询字符串部分。如果为
  `true`，那么在匹配时就忽略查询部分。默认为 `false`。
  - `ignoreMethod`: 布尔值。设置为 `true` 时，阻止匹配操作去验证请求的方法。默认为 `false`。
  - `ignoreVary`: 布尔值。设为 `true` 时，匹配操作不会进行 `VARY` 首部的匹配。默认 `false`。
  - `cacheName`: 一个用来搜索的缓存的字符串。这个应该指的是我们给缓存加的那个版本号。  
+ Returns: promise。resolve 为匹配的 `Response`。如果没找到匹配的响应，就为 `undefined`。   

#### CacheStorage.has()

```js
caches.has(cacheName).then(function(true) {
  // your cache exists!
});
```   

+ `cacheName`: 代表了我们搜索的 Cache 对象的名字。    
+ Returns: 如果缓存存在就 resolve 为 `true`，否则就是 `false`。   

#### CacheStorage.open()

返回与 `cacheName` 匹配的 Cache 对象的 promise。   

*Note*: 如果指定的 Cache 对象不存在，那么将新建一个带有 `cacheName` 的 Cache 对象。并且
返回的 promise 也是 resolve 这个对象。   

```js
caches.open(cacheName).then(function(cache) {
  //do something with your cache
});
```   

#### CacheStorage.delete()

`delete()` 方法会根据 `cacheName` 查找缓存对象，如果找到，就删除这个缓存对象并返回一个
resolve 为 `true` 的promise，否则就 resolve `false`。   

```js
caches.delete(cacheName).then(function(true) {
  //your cache is now deleted
});
```  

#### CacheStorage.keys()

返回一个 promise。resolve 为 CacheStorage 追踪的所有命名的 Cache 对象名字的字符串的数组。
以 Cache 创建的属性排列。   

```js
caches.keys().then(function(keyList) {
  //do something with your keyList
});
```   


## Cache

<a name="cache"></a>   

Cache 接口为缓存的成对 Request/Response 对象提供了一种存储机制。注意貌似 CacheStorage 和
Cache 接口在其他类型的 worker 及 window 中都部署了。注意缓存 API 好像也是只支持 HTTPS。   

### 方法

#### Cache.match()

`match()` 方法返回 Cache 对象中第一个匹配的请求的 Response 的 promise。如果没找到匹配的，
resolve 为 `undefined`。   

```js
cache.match(request,{options}).then(function(response) {
  //do something with the response
});
```   

参数即返回值类似于 `CacheStorage.match()`。   

#### Cache.matchAll()

返回 Cache 对象中所有匹配的请求的 Response 组成的数组的 promise。    

```js
cache.matchAll(request,{options}).then(function(response) {
  //do something with the response array
});
```   

`match/matchAll` 方法的 `options` 中都会忽略 `cacheName` 选项。   

#### Cache.add()

`add` 对象接受一个 URL，检索这个资源并将其最终的响应对象添加到给定的缓存中。`add()` 方法
的功能类似于下面：   

```js
fetch(url).then(function (response) {
  if (!response.ok) {
    throw new TypeError('bad response status');
  }
  return cache.put(url, response);
})
```    

*Note*: `add()` 方法会覆盖之前存储在缓存中匹配的请求的键值对。    

```js
cache.add(request).then(function() {
  //request has been added to the cache
})
```   

+ `request`: 想要添加到缓存中的请求，可以是一个 Request 对象或者一个 URL。    
+ Returns: resolve 为空。   

#### Cache.addAll()

```js
cache.addAll(requests[]).then(function() {
  //requests have been added to the cache
});
```  

#### Cache.put()

这个应该是与 `add()` 类似，但不同的是 `add/addAll` 方法是传入请求，`add/addAll` 会自动根据
参数发出请求，并将请求/响应对添加到 Cache 对象中，而 `put` 则需要我们手动去请求响应，然后
将请求/响应对手动加入到 Cache 对象中。    

还有一点需要注意的是， `add/addAll` 不会缓存响应码不在200范围之内的响应，但是 `put` 可以。   

```js
cache.put(request, response).then(function() {
  // request/response pair has been added to the cache
});
```   

+ `request`: 想要缓存的 Request。感觉应该是 Request 对象或者 URL 都可以。
+ `response`: 想要与请求匹配的响应。    
+ Returns：promise resolve with void   

#### Cache.delete()

`delete()` 会在 Cache 对象中寻找键为 request 的键值对，如果找到的话就将其删除，并返回一个
resolve 为 `true` 的 promise。否则就是 `false`。   

```js
cache.delete(request,{options}).then(function(true) {
  //your cache entry has been deleted
});
```   

+ `request`: 想要删除的 Request。    

会忽略 `options` 中的 `cacheName` 选项。    

#### Cache.keys()

返回一个 promise。resolve 值为 Cache 对象键组成的数组。顺序是请求插入的顺序。   

```js
cache.keys(request,{options}).then(function(keys) {
  //do something with your array of requests
});
```   

+ `request`: 可选参数。如果指定这个参数的话应该是只返回相同请求的键。
+ `options` 忽略 `cacheName` 选项。   

## ExtendableEvent  

<a name="extendableevent"></a>   

ExtendableEvent 延伸了 service worker 周期中触发的 install 和 activate 事件的生存时间。
这样的话就可以确保一些功能性事件（例如 FetchEvent）在更新缓存及删除旧的缓存前是不会触发的。    

如果 `waitUntil()` 方法在 ExtendableEvent 事件处理函数外调用，浏览器会抛出错误。   

这个事件只在 ServiceWorkerGlobalScope 中可用。   

只对 `Event` 对象扩展了一个 `waitUntil()` 方法。     

当这个方法运行的时候，如果 promise 是 resolved，则什么事也不会发生。如果是 rejected，则
worker 的状态会从 `installing` or `active` 变为 `redundant`。      

`event.waitUntil(promise)` 返回一个 promise。    

## FetchEvent

<a name="fetchevent"></a>   

### 属性

均为只读属性。   

#### FetchEvent.isReload

如果用户触发的这个事件是由于用户重新载入页面的话，就返回 `true`。否则就是 `false`。   

#### FetchEvent.request

返回 Request 对象。   

#### FetchEvent.clientId

就是返回 client 的 id咯。   

### 方法

#### FetchEvent.respondWith()

参数可以是任意自定义的生成响应的代码。   

#### ExtendableEvent.waitUntil()
