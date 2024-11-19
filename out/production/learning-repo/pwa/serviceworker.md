# Service Worker

<!-- TOC -->

- [Service Worker](#service-worker)
  - [navigator.serviceWorker](#navigatorserviceworker)
  - [ServiceWorkerContainer](#serviceworkercontainer)
  - [Service Worker](#service-worker-1)
  - [ServiceWorkerRegistration](#serviceworkerregistration)
  - [ServiceWorkerGlobalScope](#serviceworkerglobalscope)

<!-- /TOC -->

## navigator.serviceWorker

返回 `ServiceWorkerContainer` 对象，提供了对 service worker 的注册、移除、更新和通信
的访问接口。     

## ServiceWorkerContainer

属性（只读）：    

- `ServiceWorkerContainer.controller`: 如果有处于 `activated` 状态的 sw 就返回这个
`ServiceWorker` 对象，如果没有就返回 `null`
- `ServiceWorkerContainer.ready`: 提供一种可以让代码延迟到有 sw 激活后执行的方式。返回
一个永远不会 reject 的 Promise，它会无限期等到当期页面有一个激活的 sw 后才 resolve，并
使用 `ServiceWorkerRegistration` 对象 resolve。一个新打开的 app，然后注册一个 sw，那么
这个app 的页面即便不刷新也能获得通知

事件：   

- `controllerchange`: 当文档的 sw 获得更新时触发
- `error`: 当 sw 中出错时触发
- `message`: 收到 sw 发送的消息时

方法：   

- `register()`: 创建或更新一个 `ServiceWorkerContainer`
- `getRegistration([scope])`: resolve 匹配的 `ServiceWorkerRegistration` 对象或 undefined
- `getRegistrations()`
- `startMessages()`: 默认情况下，sw 发送给其控制页面的消息，都会先进入队列中，然后在页面加载
完后发送给页面（`DOMContentLoaded` 事件后），调用这个方法的话，就可以不用等待页面加载就发送
消息


## Service Worker

引用一个 sw，可以通过 `ServiceWorkerContainer.controller` 和 `ServiceWorkerRegistration.active`
访问到。前提是页面必须受控了。    

属性（只读）：   

- `scriptURL`
- `state`: 值为以下之一：`installing, installed, activating, activated, redundant`
- `onstatechange`

## ServiceWorkerRegistration

属性（只读）：    

- `scope`: `http://localhost:3000/`
- `installing`
- `waiting`
- `active`: `activating` 和 `activated` 都行
- `navigationPreload`
- `pushManager`    
- `onupdatefound`    


方法：   

- `getNotification()`
- `showNotification()`
- `update()`
- `unregister()`

## ServiceWorkerGlobalScope

属性（只读）：   

- `clients`: 返回 `Clients` 对象
- `registration`
- `caches`   

事件：   

- `activate`
- `fetch`
- `install`
- `message`
- `notificationclick`
- `notificationclose`
- `push`
- `pushsubscriptchange`
- `sync`


方法：   

- `skipWaiting()`
- `fetch()`    

