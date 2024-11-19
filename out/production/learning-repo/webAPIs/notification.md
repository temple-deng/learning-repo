# Notification API

<!-- TOC -->

- [Notification API](#notification-api)
  - [1. 基本用法](#1-基本用法)
    - [1.1 授权](#11-授权)
    - [1.2 创建一条通知](#12-创建一条通知)
    - [1.3 关闭通知](#13-关闭通知)
    - [1.4 替换一条通知](#14-替换一条通知)
    - [1.5 事件](#15-事件)
  - [2. API](#2-api)
    - [2.1 构造函数](#21-构造函数)
    - [2.2 属性](#22-属性)
    - [2.3 方法](#23-方法)

<!-- /TOC -->

## 1. 基本用法

### 1.1 授权

首先在使用 Notification 功能前，必须向用户请求授权。通过检查 `Notification.permission`
属性来查看当前的授权状态（注意是类的静态方法），其可能为以下的值：   

+ `default`: 还未向用户请求过权限授予
+ `granted`: 用户已授权
+ `denied`: 用户拒绝授权    

通过 `Notification.requestPermission()` 方法来向用户请求授权：    

```js
Notification.requestPermission().then((result) => {
  console.log(result);
});
```   

### 1.2 创建一条通知

直接使用 `Notification` 构造函数就可以创建一条通知。   

### 1.3 关闭通知

```js
setTimeout(notification.close.bind(notification), 4000);
```   

### 1.4 替换一条通知

如果之前的相同 tag 的通知还没展示出来，那就直接用新的替换掉，否则已经展示出来了，那就关掉旧的，
展示新的。    

### 1.5 事件

在 `Notification` 实例上可能触发以下的事件：   

+ **click**: 用户点击通知时触发
+ **close**: 通知被关闭时触发
+ **error**
+ **show**    

## 2. API

### 2.1 构造函数

```js
var myNotification = new Notification(title[, options]);
```    

具体 options 可以参看 SWR.showNotification。    

### 2.2 属性

+ 静态属性
  - `Notification.permission`
+ 实例属性
  - `actions`
  - `badge`
  - `body`
  - `data`
  - `dir`
  - `lang`
  - `tag`
  - `icon`
  - `image`
  - `renotify`
  - `requireInteraction`
  - `silent`
  - `timestamp`
  - `title`
  - `vibrate`
  - `onclick`, `onerror`, `onshow`, `onclose`

### 2.3 方法

+ 静态方法
  - `Notification.requestPermission()`
+ 实例方法
  - `close()`

Last Update: 2018-11-07