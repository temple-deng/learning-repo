# Push API

# 介绍

Push API 给予了 web 应用接收从服务器推送的消息的能力，不管应用是否在前台，是否当前被加载。     

## Push 理念和用户

如果想要应用可以接收推送的消息的话，应用必须有一个激活的 sw。当sw 激活时，它可以使用 `PushManager.subscribe()` 方法订阅推送的通知。    

最终的 `PushSubscription` 包含了应用发送一条 push message 所必须的信息：一个终端及发送数据所需的加密秘钥。   

sw 应该是通过 `ServiceWorkerGlobalScope.onpush` 事件监听函数处理分发的推送通知。    

应该整个过程是这样的，我们在 `Registration` 对象上的 `pushManager` 上订阅服务器发送的消息，然后在收到以后再发送给 sw，sw 的 `onpush` 事件再做出响应。    

## 接口

+ `PushEvent`: 表示一个发送给 sw 的 push 动作。它包含了应用发送给 `PushSubscription` 的信息。（好乱，不懂）
+ `PushManager`: 提供从第三方服务器接收通知的方式。
+ `PushMessageData`: 提供对服务器发送数据的访问方式，并包含一些操作收到数据的方法。
+ `PushScription`: 提供一个订阅的 URL 终端，并允许取消订阅服务。    

## sw 额外的接口

+ `ServiceWorkerRegistration.pushManager`: 返回对 `PushManager` 对象的引用。
+ `ServiceWorkerGlobalScope.onpush`: 当 `push` 事件触发时调用。
+ `ServiceWorkerGlobalScope.onpushsubscriptionchange`: 这个事件会在 push 订阅无效时触发。    

# API

## PushManager

### 方法

#### PushManager.permissionState()

这个方法返回一个 Promise，resolve 一个字符串，这个字符串表明 push manager 当前的权限。
可选值有 `prompt, denied, granted`。     

```js
PushManager.permissionState(options).then(function(PushMessagingState) { ... });
```    

+ `options`: 可选参数，包含以下选项：
  - `userVisibleOnly`: 布尔值。表明返回的 push subscription 只有在那些会展示给用户的消息上可用。
  - `applicationServerKey`: push server 的公钥。    

#### PushManager.subscribe()

这个方法订阅推送服务。    

返回 Promise，resolve 为一个 `PushSubscription` 对象，这个对象包含了推送订阅的细节。如果当前 sw 没有已存在的订阅则新建一个，那么这个意思就是如果有存在的话会重用呗。    

`PushManager.subscribe(options).then(function(pushSubscription) { ... } );`    

+ `options`: 可选参数，有以下选项：
  - `userVisibleOnly`: 略。
  - `applicationServerKey`: 公钥。     

#### PushManager.getSubscription()

就是返回订阅对象，一个 Promise，如果没有已存的订阅就 resolve 为 `null`。    

`​PushManager.getSubscription().then(function(pushSubscription) { ... } );`     

## PushSubscription  

### 实例属性

