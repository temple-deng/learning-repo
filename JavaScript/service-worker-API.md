# Service Worker API

目录：   

+ [ServiceWorkerContainer](#container)
+ [ServiceWorkerRegistration](#registration)
+ [ServiceWorker](#serviceworker)
+ [Clients](#clients)
+ [Client](#client)
+ [ServiceWorkerGlobalScope](#serviceworkergloalscope)

## ServiceWorkerContainer

<a name="container"></a>   

`navigator.serviceWorker` 返回相关文档的 `ServiceWorkerContainer` 对象。    

### 属性

#### ServiceWorkerContainer.controller

`controller` 属性是只读属性，如果 service worker 的状态是 activated 的话就返回这个
`ServiceWorker` 对象。如果没有激活的 worker ，或者请求是强制刷新的话就返回 `null`。比如说
典型的 <kbd> Ctrl + F5</kbd> 刷新页面，那么即使有激活的 service worker 也返回 `null`。   

#### ServiceWorkerContainer.ready

`ready` 属性是只读属性，这个属性定义了是否一个 service worker 是准备好控制页面了。返回一个
永远不会 reject 的 promise，resolve 为一个 `ServiceWorkerRegistration` 对象。    

```js
function subscribe() {
  var subscribeButton = document.querySelector('.js-subscribe-button');
  subscribeButton.disabled = false;

  navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
    serviceWorkerRegistration.pushManager.subscribe()
      .then(function(subscription) {
        // The subscription was successful
        subscribeButton.disabled = true;
        return sendSubscriptionToServer(subscription);
      })
      .catch(function(error) {
        if (Notification.permission === 'denied') {
          console.log('Permission for Notifications was denied');
          subscribeButton.disabled = true;
        } else {
          console.log('Unable to subscribe to push.', error);
          subscribeButton.disabled = false;
        }
      });
  });
}
```   

#### 事件处理函数

+ `ServiceWorkerContainer.oncontrollerchange`: 当 `controllerchange` 事件触发时调用，
待完成。
+ `ServiceWorkerContainer.onerror`: 当相关的 service worker 发生错误时触发。
+ `ServiceWorkerContainer.onmessage`: 当 `message` 事件发生时触发，应该是指 service worker 向
页面发送信息。（尚不清楚这个事件，因为不知道 service worker 怎么发送信息）

### 方法

#### ServiceWorkerContainer.register()

对给定的脚本 URL 创建或者更新一个 `ServiceWorkerRegistration`。    

```js
ServiceWorkerContainer.register(scriptURL, options)
  .then(function(ServiceWorkerRegistration) { ... });
```   

+ **options**: 可选参数。注册时提供的选项对象。当前可用的选项只有 `scope`:
  - `scope`: 一个定义了 service worker 注册范围的字符串，这个范围即 service worker 控制
  的 URLs 的范围。默认值就是脚本文件所在的目录。    
+ Returns: 一个 resolve 为一个 `ServiceWorkerRegistration` 对象的 promise。    

#### ServiceWorkerContainer.getRegistration()

这个方法获取一个 scope URL 与提供的文档 URL 匹配的 `ServiceWorkerRegistration` 对象。
返回一个 promise，应该是如果匹配了 resolve 就为 `ServiceWorkerRegistration` 否则就为
`undefined`。     

`ServiceWorkerContainer.getRegistration(scope).then(function(ServiceWorkerRegistration) { ... });`    

+ `scope`: 可选参数。我们希望返回的注册的 service worker 的 scope。通常是相对 URL。
+ Returns: resolve 为 `ServiceWorkerRegistration` 对象或 `undefined` 的 promise。   

#### ServiceWorkerContainer.getRegistrations()

返回一个 promise，resolve 为包含所有与 `ServiceWorkerContainer`相关联的 `ServiceWorkerRegistration`，
或者是 `undefined`。   

`ServiceWorkerContainer.getRegistrations().then(function(ServiceWorkerRegistrations) { ... });`   

没有参数。    

## ServiceWorkerRegistration  

<a name="registration"></a>   

`ServiceWorkerRegistration` 代表了 service worker 的注册。（黑人问号？）    

### 属性

所有属性都是只读的。继承自 `EventTarget` 对象。      

#### ServiceWorkerRegistration.scope

返回 service worker 注册的唯一标识符。貌似应该是一个绝对的 URL 地址，包含了尾部的目录 `/`。    

#### ServiceWorkerRegistration.installing

返回一个 `ServiceWorker.state` 为 `installing` 的 service worker。这个属性初始值为 `null`。   

返回一个 `ServiceWorker` 对象，或者没有 `installing` 的 service worker 的话返回 `null`。   

#### ServiceWorkerRegistration.waiting

返回一个 `ServiceWorker.state` 为 `installed` 的 `ServiceWorker` 对象。或者是 `null`。    

#### ServiceWorkerRegistration.active

返回一个 `ServiceWorker.state` 为 `activating` or `activated` 的 `ServiceWorker` 对象。
或者是 `null`。   

#### ServiceWorkerRegistration.pushManager   

返回一个 `PushManager` 对象。   

#### 事件处理函数

+ `ServiceWorkerRegistration.onupdatefound`: 貌似是在 `statechange` 事件触发时调用，
这个事件应该是在 `ServiceWorkerRegistration.installing` 属性收到一个新的 service worker 时触发。我觉得
可以理解为新的 service worker 开始安装时触发。   

### 方法

#### ServiceWorkerRegistration.getNotifications()

返回一个 promise 对象，resolve 为当前 service worker 发出的 `Notification` 对象的列表。   

`​ServiceWorkerRegistration.getNotifications(options).then(function(NotificationsList) { ... });`   

+ `options`: 可选参数。一个用来过滤返回的通知列表的选项对象。包含的选项有：   
  - `tag`: 一个代表通知标签的字符串。如果设置了话，只有有这个标签的通知才会返回。   

#### ServiceWorkerRegistration.showNotification()

在一个激活的 service worker 上创建一条通知。   

```js
​ServiceWorkerRegistration.showNotification(title, [options]).then(function(NotificationEvent) { ... });
```   

+ `title`: 通知必须展示的标题。
+ `options`: 可选参数。一个用来配置通知的对象。可以有如下属性：
  - `actions`: 一个通知中展示的 actions 的数组。这个数组的成员应该是一个对象字面量。可以包含以下值：
    + `action`: 算了先略。     

返回一个 resolve 为 `NotificationEvent` 的 promise。   

#### ServiceWorkerRegistration.update()

这个方法尝试去更新 service worker。如果之前 24 小时之内都没有过获取 worker 的话，那么这个
获取会绕过浏览器的缓存。   

没有参数，没有返回值。   

#### ServiceWorkerRegistration.unregister()

移除注册的 service worker，返回 promise。如果没有找到任何的注册的话 resolve 为 `false`，
否则 resolve 为 `true`。   

## ServiceWorker

<a name="serviceworker"></a>   

这个接口提供了对 service worker 的引用。   

这个接口继承自 `Worker` 对象。    

### 属性

均为只读属性。   

#### ServiceWorker.scriptURL  

应该就是 service worker 脚本文件的 URL 字符串。   

#### ServiceWorker.state

返回一个代表当前 service worker 状态的字符串。可以是这几个值之一：`installing`, `installed`,
`activating`,`activated`,`redundant`。   

#### 事件处理函数

+ `ServiceWorker.onstatechange`: 没错就是状态改变时触发的函数。    


## Clients

<a name="clients"></a>   

`Clients` 接口代表一个 `Client` 对象列表的容器。    

### 方法

#### Clients.get()

获取一个与给定的 `id` 匹配的 service worker client，并将其返回到 promise 中。   

```js
self.clients.get(id).then(function(client) {
  // do something with your returned client
});
```   

+ `id`: client 的id。
+ Returns: resolve 为 Client 对象的 promise。   

#### Clients.matchAll()

```js
ServiceWorkerClients.matchAll(options).then(function(clients) {
  // do something with your clients list
});
```  

+ `options`: 可选参数。匹配操作的选项对象。可选选项有：  
  - `includeUncontrolled`: 布尔值。如果设为 `true`，会返回所有与当前 service worker 同源的
  clients。否则的话，就返回受当前 service worker 控制的 clients。默认是 `false`。
  - `type`: 设置响应匹配的 clients 的类型。可选值有 `window`,`worker`,`sharedworker`,`all`。
  默认为 `all`。
+ Returns: 一个 resolve 为 Clients 对象数组的 promise。   


#### Clients.openWindow()

创建一个顶层的浏览上下文，并加载给定的 URL。如果调用的脚本没有展示弹窗的权限，抛出错误。   

在 Firefox 中，只有在通知点击事件中调用这个方法才允许展示弹窗。在 Android 上的 Chrome 中，
给定的 URL 应该是会在之前添加到用户主屏的 standalone web app 提供的浏览上下文中打开。   

```js
ServiceWorkerClients.openWindow(url).then(function(WindowClient) {
  // do something with your WindowClient
});
```   

+ `url`: 一个我们想要在窗口中打开的 client的 URL。
+ Returns: promise。如果 URL 与 service worker 是同源的话 resolve 一个 `WindowClient` 对象，
否则就是 `null`。


#### Clients.claim()

返回一个 Promise。   

## Client

<a name="client"></a>   

`Client` 接口代表了 service worker 范围内的一个 client。一个 client 可以是被一个激活
的 worker 控制的浏览器上下文中的文档，或者是一个 Worker，或者是一个 SharedWorker。     

### 属性

所有属性均为只读属性。   

#### Client.frameType

表明当前 client 的浏览上下文的类型。可以是 `auxiliary`,`top-level`,`nested`,`none`。    

#### Client.id

返回 Client 对象唯一的标识符。这个很可能是由浏览器决定的，看样子像是个 hash 值。    

#### Client.type

返回 client 的类型。可选值有：`window`,`worker`,`sharedworker`,`all`。   

#### Client.url

client 的 URL 地址。   

### 方法

#### Client.postMessage()

这个方法允许 client 发送一条信息给 `ServiceWorker`。注意这里的 `ServiceWorker` 就是指脚本，
那自己给自己发消息有什么意思。。。。    

```js
Client.postMessage(message[, transfer]);
```    

## ServiceWorkerGlobalScope

<a name="serviceworkergloalscope"></a>      

ServiceWorkerGlobalScope 接口代表了 service worker 的全局执行上下文。   

这个接口继承自 WorkerGlobalScope，以及 EventTarget。    

### 属性

均为只读属性。   

#### ServiceWorkerGlobalScope.clients

返回 `Clients` 对象。   

#### ServiceWorkerGlobalScope.registration

返回对 `ServiceWorkerRegistration` 对象的引用。   

#### ServiceWorkerGlobalScope.caches

返回 CacheStorage 对象。   

#### 事件处理函数   

+ `ServiceWorkerGlobalScope.onactivate`: 当 activate 事件触发时调用。   
+ `ServiceWorkerGlobalScope.onfetch`: 当 fetch 事件发生时调用。
+ `ServiceWorkerGlobalScope.oninstall`
+ `ServiceWorkerGlobalScope.onmessage`
+ `ServiceWorkerGlobalScope.onnotificationclick`: 应该是当用户在展示的通知上点击时触发。
+ `ServiceWorkerGlobalScope.onnotificationclose`
+ `ServiceWorkerGlobalScope.onpush`
+ `ServiceWorkerGlobalScope.onpushsubscriptionchange`
+ `ServiceWorkerGlobalScope.onsync`

### 方法

#### ServiceWorkerGlobalScope.skipWaiting()

强制等待状态的 service worker 去变为激活状态。    

返回一个 promise。   

#### GlobalFetch.fetch()

应该就是普通的 fetch 方法。   
