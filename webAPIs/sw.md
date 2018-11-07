# Service Worker API Part1

<!-- TOC -->

- [Service Worker API Part1](#service-worker-api-part1)
  - [1. ServiceWorkerContainer](#1-serviceworkercontainer)
    - [1.1 属性](#11-属性)
      - [`ServiceWorkerContainer.controller`](#serviceworkercontainercontroller)
      - [`ServiceWorkerContainer.ready`](#serviceworkercontainerready)
      - [`ServiceWorkerContainer.oncontrollerchange`](#serviceworkercontaineroncontrollerchange)
      - [`ServiceWorkerContainer.onerror`](#serviceworkercontaineronerror)
      - [`ServiceWorkerContainer.onmessage`](#serviceworkercontaineronmessage)
    - [1.2 方法](#12-方法)
      - [`ServiceWorkerContainer.register()`](#serviceworkercontainerregister)
      - [`ServiceWorkerContainer.getRegistration()`](#serviceworkercontainergetregistration)
      - [`ServiceWorkerContainer.getRegistrations()`](#serviceworkercontainergetregistrations)
  - [2. ServiceWorkerRegistration](#2-serviceworkerregistration)
    - [2.1 属性](#21-属性)
      - [scope](#scope)
      - [installing](#installing)
      - [waiting](#waiting)
      - [active](#active)
      - [navigationPreload](#navigationpreload)
      - [pushManager](#pushmanager)
      - [sync](#sync)
      - [onupdatefound](#onupdatefound)
    - [2.2 方法](#22-方法)
      - [getNotifications()](#getnotifications)
      - [showNotification()](#shownotification)
      - [update()](#update)
      - [unregister()](#unregister)
  - [3. ServiceWorker](#3-serviceworker)
    - [3.1 属性](#31-属性)
      - [scriptURL](#scripturl)
      - [state](#state)
      - [onstatechange](#onstatechange)

<!-- /TOC -->

## 1. ServiceWorkerContainer

`navigator.serviceWorker` 属性就是一个 `ServiceWorkerContainer`，这个对象提供了一个
SW 整体的抽象，方便我们区注册，卸载和更新 SW，以及访问 SW 的状态及注册情况。   

### 1.1 属性

#### `ServiceWorkerContainer.controller`

只读属性，如果有一个 `activated` 状态的 SW 的话，就返回这个 `ServiceWorker` 对象，否则
返回 `null`，如果页面是强制刷新的也返回 `null`，没弄懂这个是什么意思。   

#### `ServiceWorkerContainer.ready`

只读属性，提供了一种方式延迟代码的执行，直到有一个 SW 是激活状态。返回一个永远不会 reject 的
Promise，直到有一个激活的 SW，这是 resolve with `ServiceWorkerRegistration`。    

```js
navigator.serviceWorker.ready.then((reg) => {
  // ...
});
```

#### `ServiceWorkerContainer.oncontrollerchange`

当 `ServiceWorkerRegistration` 获取到一个新的激活的 SW 触发事件。   

#### `ServiceWorkerContainer.onerror`    

当相关联的 SW 出错时事件触发。   

#### `ServiceWorkerContainer.onmessage`    

略。    

### 1.2 方法

#### `ServiceWorkerContainer.register()`

创建或更新 `ServiceWorkerRegistration`，也就是说注册一个新的 SW 或者将已注册的 SW 更新为
别的 SW 咯。    

```js
ServiceWorkerContainer.register(scriptURL, options)
  .then((ServiceWorkerRegistration) => {
    // ...
  });
```    

+ `options` 可选参数
  - `scope`: 通常是相对 URL，且是相对于应用的 base URL 的。    

#### `ServiceWorkerContainer.getRegistration()`

返回一个 Promise，resolve 为一个 `ServiceWorkerRegistration` 或者 `undefined`。   

```js
ServiceWorkerContainer.getRegistration(scope).then((reg) => {
  // ...
});
```    

+ `scope` 可选参数
+ Return A Promise. Resolve 为 `ServiceWorkerRegistration` 或者 `undefined`。   

#### `ServiceWorkerContainer.getRegistrations()`

返回所有关联的 ServiceWorkerRegistrations。不过也是通过 Promise 形式返回的，resolve 为
一个数组。     

```js
ServiceWorkerContainer.getRegistrations()
  .then(function(ServiceWorkerRegistrations) { 
    // ... 
  });
```    

## 2. ServiceWorkerRegistration

### 2.1 属性

所有属性均为只读属性。   

#### scope

略。   

#### installing

返回一个 SW 对象，其 `ServiceWorker.state` 是 `installing`。    

#### waiting

返回一个 SW 对象，其 `ServiceWorker.state` 是 `installed`。    

#### active

返回一个 SW 对象，其 `ServiceWorker.state` 是 `activating` 或者 `activated`。    

#### navigationPreload

返回一个与当前 SWR 关联的 `NavigationPreloadManager` 对象实例。   

#### pushManager

返回 `PushManager` 对象，来关联推送消息的订阅。    

#### sync

返回一个 `SyncManager` 对象。    

#### onupdatefound

在 `statechange` 事件发生时调用，这个事件是在任何 `ServiceWorkerRegistration.installing`
属性接收到一个新的 SW 时触发。    

### 2.2 方法

#### getNotifications()

返回当前 SWR 对象创建的通知列表，注意一个源中可能有多个激活的但是不同 scope 的 SWR，这个方法
只返回当前 SWR 中的通知，其他的 SWR 的通知不包括在内。    

```js
ServiceWorkerRegistration.getNotifications(options)
  .then((NotificationsList) => {
    // ...
  });
```    

+ `options`: 可选参数
  - `tag`: 一个表示通知 tag 的字符串，如果提供了这个配置项，就只返回带有这个 tag 的通知。
+ Return a Promise that resolves to a list of `Notifcation` objects.

#### showNotification()

展示一条通知咯。    

```js
ServiceWorkerRegistration.showNotification(title[, options])
  .then((NotificationEvent) => {
    // ...
  });
```    

+ `title`: 通知的标题
+ `options`: 可选参数
  - `actions`: 动作数组，成员应该均为对象字面量，可以包含以下属性
    + `action`： 一个用来标识用户动作的字符串，有点相当于 ID 吧
    + `title`: 展示给用户的动作的文本
    + `icon`: 一个 icon URL 的字符串
  - `badge`: 图片 URL
  - `body`: 字符串
  - `dir`: 通知方向 `auto, ltr, rtl`
  - `icon`: URL
  - `image`: URL
  - `lang`
  - `renotify`: 布尔值，默认 `false`，也就是带有相同 tag 的后续通知不再震动和发铃音
  - `requireInteraction`: 指示在大屏情况下，通知是否在用户点击或者请求前一直保持显示状态
  - `tag`
  - `vibrate`: 单位是毫秒
  - `data`: 与通知关联的任意数据
+ Return a Promise that resolve to a NotificationEvent

#### update()

更新 SW，会去再次获取 URL 位置的脚本，如果脚本更新过，就安装新的 SW。   

#### unregister()

取消对 SW 的注册，返回 Promise，如果本身就没有注册的 SW，resolve 为 `false` 否则就是 `true`。    

```js
ServiceWorkerRegistration.unregister().then((bool) => {
  // ...
});
```    

## 3. ServiceWorker

`ServiceWorker` 对象可以通过 `SWR.active` 或者 `SWC.controller` 属性访问到，不过这里
是特指已经处于激活状态并且已经接手了页面控制权的 SW。    

### 3.1 属性

所有属性均为只读。    

#### scriptURL

略。   

#### state

可能的值有：`installing`, `installed`, `activating`, `activated`, `redundant`。   

#### onstatechange

在 state 变化时触发。    

Last Update: 2018-11-07
