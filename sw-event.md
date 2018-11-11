# ExtendableEvent

<!-- TOC -->

- [ExtendableEvent](#extendableevent)
  - [1. ExtendableEvent](#1-extendableevent)
  - [2. InstallEvent](#2-installevent)
    - [2.1 属性](#21-属性)
  - [3. FetchEvent](#3-fetchevent)
    - [3.1 属性](#31-属性)
    - [3.2 方法](#32-方法)
  - [4. NotificationEvent](#4-notificationevent)
    - [4.1 属性](#41-属性)

<!-- /TOC -->

## 1. ExtendableEvent

`ExtendableEvent` 接口延长了 SW 中触发的 `install` 和 `activate` 事件的生存时间。这个
接口可以确保一些功能性事件在更新数据库模式以及删除过期的缓存条目前不会触发。也就是说，把
一些事件的触发延后了吧。    

```js
extendableEvent.waitUntil()
```    

这个方法告诉事件派发器，有工作正在处理中。同时这个方法可以告诉浏览器在 promise resolve
或者 reject 之前不要终止掉 SW。    

## 2. InstallEvent

### 2.1 属性

```js
var myActiveWorker = event.activeWorker
```   

返回当前控制页面的那个 SW。如果没有已经激活的 SW 那就返回 null。    

## 3. FetchEvent

### 3.1 属性

均为只读属性：   

+ `clientId`: 触发 fetch 请求的 client 的 `id`
+ `preloadResponse`: 一个 `Response` 的 promise，或者是 void
+ `request`: `Request` 对象

### 3.2 方法

从 ExtendableEvent 接口继承了 `waitUntil()` 方法。   

```js
event.respondWith(
  // Promise that resovles to a Response
)
```   

这个方法阻止了浏览器默认的 fetch 操作，从而允许我们提供一个 `Response` 的 promise 作为
响应。    


## 4. NotificationEvent

`onnotificationclick` 事件的事件对象。   

### 4.1 属性

只读属性：   

+ `notification`: 点击的那个 `Notification` 对象实例
+ `action`: 用户的点击的 action id，不过如果点的不是 action 就是空字符串

Last Update: 2018-11-07
