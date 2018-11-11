# Cache, CacheStorage

## 1. Cache

`Cache` 为缓存的 `Request/Response` 对象对提供了一种存储机制。注意 `Cache` 接口在
window 作用域中也是可以访问的，不是局限于 SW。    

一个源可以有多名命名的 `Cache` 对象。使用 `CacheStorage.open()` 打开一个指定的命名
`Cache` 对象，然后调用 `Cache` 对象的任意方法。    

### 1.3 方法

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

## 2. CacheStorage



