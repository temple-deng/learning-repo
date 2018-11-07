# Client, Clients, WindowClient API

<!-- TOC -->

- [Client, Clients, WindowClient API](#client-clients-windowclient-api)
  - [1. Client](#1-client)
    - [1.1 属性](#11-属性)
    - [1.2 方法](#12-方法)
  - [2. Clients](#2-clients)
    - [2.1 方法](#21-方法)
      - [get()](#get)
      - [matchAll()](#matchall)
      - [openWindow()](#openwindow)
      - [claim()](#claim)
  - [3. WindowClient](#3-windowclient)
    - [3.1 属性](#31-属性)
    - [3.2 方法](#32-方法)
      - [focus()](#focus)
      - [navigate()](#navigate)

<!-- /TOC -->

## 1. Client

`Client` 接口表示一个可执行的上下文，例如 `Window, Worker, SharedWorker`。`Window`
比较特殊，使用了更精确的 `WindowClient` 表示。   

我们可以通过 `Clients.matchAll()` 和 `Clients.get()` 方法获取 `Client/WindowClient`
对象。     

### 1.1 属性

均为只读属性。   

+ `id`: 一个字符串
+ `type`: 字符串，代表 client 的类型，可选值有 `window, worker, sharedworker, all`。
+ `url`: client 的 URL 字符串

### 1.2 方法

+ `postMessage(message[, transfer])`: 允许 SW 给一个 client 发送消息。消息会在 client
中的 `navigator.serviceWorker` 对象上收到 `message` 事件。    

## 2. Clients

`Clients` 接口提供了对 `Client` 对象实例的访问。在 SW 中通过 `self.client` 访问这个接口。   

### 2.1 方法

#### get()

获取与给定 `id` 匹配的 client，返回 Promise。   

```js
self.clients.get(id).then((client) => {
  // ...
});
```    

#### matchAll()

```js
ServiceWorkerClients.matchAll(options).then((clients) => {
  // ...
});
```   

+ `options`: 可选参数
  - `includeUncontrolled`: 布尔值，如果设置为 `true`，会返回所有与当前 SW 同源的 clients，
  否则只返回受控的 clients, 默认是 `false`
  - `type`: `window`, `worker`, `sharedworker`, `all` 默认 `all`。

#### openWindow()

创建一个新的顶级浏览上下文，并加载给定的 URL，如果脚本没有打开的权限，则抛出异常。    

在 FF 中，只允许在 notificationclick 事件中进行这个操作。    

```js
ServiceWorkerClients.openWindow(url).then((windowClient) => {
  // ...
});
```    

#### claim()

`claim()` 方法可以让一个激活状态的 SW 接手所有 scope 内的 clients 的控制权。   

## 3. WindowClient

父类是 `Client`，继承了属性和方法。   

### 3.1 属性

+ `focused`
+ `visibilityState`: 可能的值有 `hidden`, `visible`, `prerender`, `unloaded`。   

### 3.2 方法

#### focus()

```js
Client.focus().then((windowClient) => {
  // ...
});
```   

#### navigate()

在一个受控的 client 页面加载给定的 URL。   

```js
Client.navigate(url).then((windowClient) => {
  // ...
});
```   

Last Update: 2018-11-07
