# Clients, Client

<!-- TOC -->

- [Clients, Client](#clients-client)
  - [Clients](#clients)
    - [方法](#方法)
      - [Clients.get](#clientsget)
      - [Clients.matchAll](#clientsmatchall)
      - [Clients.openWindow](#clientsopenwindow)
      - [Clients.claim()](#clientsclaim)
  - [Client](#client)
    - [属性](#属性)
    - [方法](#方法-1)

<!-- /TOC -->

## Clients

Clients 接口只能在 SW 中访问。   

### 方法

#### Clients.get

```js
self.clients.get(id).then((client) => {
  // ...
});
```     

#### Clients.matchAll

```js
self.clients.matchAll(options).then((clients) => {
  // ...
})
```     

options:   

- `includeUncontrolled`: 布尔值，默认 false，只返回那些受控的 clients
- `type`: 想要匹配的 clients 类型，可选值有 `window, worker, sharedworker, all`

#### Clients.openWindow

```js
Clients.openWindow(url).then((windowClient) {
  // ...
});
```   

如果打开的 URL 是和 SW 同源的，就是一个 WindowClient 对象否则是 null。   

#### Clients.claim()

略。   


## Client

Client 包括 Worker, SharedWorker, Window。     

### 属性

id, type, url

### 方法

`Client.postMessage()`