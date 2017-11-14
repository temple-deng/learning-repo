# Notifications API
<!-- TOC -->

- [Start](#start)
  - [理念及用法](#理念及用法)
  - [接口](#接口)
- [使用 API](#使用-api)
  - [请求权限](#请求权限)
    - [获取权限](#获取权限)
  - [创建一条通知](#创建一条通知)
  - [关闭通知](#关闭通知)
  - [Notification events](#notification-events)
  - [替换已存在的通知](#替换已存在的通知)
- [API](#api)
  - [接口](#接口-1)
    - [Notification](#notification)
      - [构造函数](#构造函数)
      - [属性](#属性)
      - [方法](#方法)
    - [NotificationEvent](#notificationevent)
      - [属性](#属性-1)
      - [方法](#方法-1)
  - [相关接口](#相关接口)
    - [ServiceWorkerRegistration.getNotifications()](#serviceworkerregistrationgetnotifications)
    - [ServiceWorkerRegistration.showNotification()](#serviceworkerregistrationshownotification)
    - [ServiceWorkerGlobalScope.onnotificationclick](#serviceworkerglobalscopeonnotificationclick)

<!-- /TOC -->


# Start

Notifications API 可以让 web 页面去向终端用户展示一些系统通知的消息。这些消息是处于顶层浏览上下文视口之外的，因此即便用户切换到别的 tab 栏或者切换到别的应用中时仍然可以展示出来。     

## 理念及用法

在支持这个 API 的平台上，如果我们想要给用户展示系统消息需要做两件事情。第一件就是用户
需要授权给当前源展示系统通知的权限，通常会在应用或站点初始化时完成，使用 `Notification.requestPermission()` 方法。这个方法会派生出一个请求框，如下图所示：    

![request-dialog](https://github.com/temple-deng/learning-repo/blob/master/pics/notification-bubble.png)     

接下来我们就可以使用 `Notification()` 构造函数新建一条通知的实例。这个函数必须传递一标题参数，可选参数包括一个选项对象。    

另外，规范还指定了一系列 Service Worker API 来让 sw 发送通知。     

## 接口

+ Notiifcation: 定义一个通知对象。    

额外的 sw 中的接口：    

+ ServiceWorkerRegistration.showNotification(), ServiceWorkerRegistration.getNotifications()
+ ServiceWorkerGlobalScope.onnotificationclick 监听函数
+ NotificationEvent    

# 使用 API

## 请求权限

通过检查只读属性 `Notification.permission` 的值可以查看当前是否有发送系统通知的权限。这个属性可能为以下的3个值：    

+ **`default`**: 用户还没有请求这个权限，所有通知不会被展示。
+ **`granted`**: 用户已经授权展示通知。
+ **`denies`**: 用户已经明确拒绝授权展示通知。    

### 获取权限

如果我们当前还没有获得展示通知的许可，那么需要使用 `Notification.requestPermission()` 来请求用户的许可。    

```js
Notification.requestPermission().then(function(result) {
  console.log(result);
});
```   

上面是一个新版本 Promise 的例子，旧的浏览器可能是回调版本的，这个版本中方法接受一个回调函数做参数，这个回调会使用最终的结果做参数。    

## 创建一条通知

```js
function spawnNotification(theBody,theIcon,theTitle) {
  var options = {
      body: theBody,
      icon: theIcon
  }
  var n = new Notification(theTitle,options);
  setTimeout(n.close.bind(n), 5000); 
}

function randomNotification() {
  var randomQuote = quoteChooser();
  var options = {
      body: randomQuote,
      icon: 'img/sad_head.png',
  }

  var n = new Notification('Emogotchi says',options);
  setTimeout(n.close.bind(n), 5000); 
}
```   

## 关闭通知

FF 和 Safari 会在一段时间后自动关闭通知。Chrome 则不会。在上面的例子中我们调用了
`Notification.close()` 方法在一段时候后关闭通知。     

## Notification events

API 规范列出了通知实例上会触发的两个事件：   

+ **click**: 当用户点击通知时调用。
+ **error**: 当通知出错时调用，通常是通知由于某些原因无法展示。     

还有两种事件在最新的规范中被移除，但是可能在很多浏览器中还可以工作，但是不建议使用了：    
+ **close**: 当通知关闭时触发。
+ **show**: 当通知展示给用户时触发。     

## 替换已存在的通知

有时候可能短时间内有大量的通知发送给用户，为了避免过多的通知使用户厌烦。我们可以取修改
等待中的通知队列，用一个新的通知替换掉旧的通知。     

如果要这样做的话，需要为每一个新的通知添加一个标签。如果通知已经有了相同的标签，并且还没有展示给用户，那么新的标签就会替换掉之前的通知。如果已经展示了，那么旧的通知关闭，新的通知展示。    

假设有如下 HTML:   

`<button>Notify me!</button>`    

```js
window.addEventListener('load', function () {
  // At first, let's check if we have permission for notification
  // If not, let's ask for it
  if (window.Notification && Notification.permission !== "granted") {
    Notification.requestPermission(function (status) {
      if (Notification.permission !== status) {
        Notification.permission = status;
      }
    });
  }

  var button = document.getElementsByTagName('button')[0];

  button.addEventListener('click', function () {
    // If the user agreed to get notified
    // Let's try to send ten notifications
    if (window.Notification && Notification.permission === "granted") {
      var i = 0;
      // Using an interval cause some browsers (including Firefox) are blocking notifications if there are too much in a certain time.
      var interval = window.setInterval(function () {
        // Thanks to the tag, we should only see the "Hi! 9" notification 
        var n = new Notification("Hi! " + i, {tag: 'soManyNotification'});
        if (i++ == 9) {
          window.clearInterval(interval);
        }
      }, 200);
    }

    // If the user hasn't told if he wants to be notified or not
    // Note: because of Chrome, we are not sure the permission property
    // is set, therefore it's unsafe to check for the "default" value.
    else if (window.Notification && Notification.permission !== "denied") {
      Notification.requestPermission(function (status) {
        // If the user said okay
        if (status === "granted") {
          var i = 0;
          // Using an interval cause some browsers (including Firefox) are blocking notifications if there are too much in a certain time.
          var interval = window.setInterval(function () {
            // Thanks to the tag, we should only see the "Hi! 9" notification 
            var n = new Notification("Hi! " + i, {tag: 'soManyNotification'});
            if (i++ == 9) {
              window.clearInterval(interval);
            }
          }, 200);
        }

        // Otherwise, we can fallback to a regular modal alert
        else {
          alert("Hi!");
        }
      });
    }

    // If the user refuses to get notified
    else {
      // We can fallback to a regular modal alert
      alert("Hi!");
    }
  });
});
```


# API

## 接口

### Notification

这个接口用来配置和展示通知给用户。   

注意大部分 Notificaion API 都可以在 Workers 中使用。    

#### 构造函数

创建一个新的 Notification 对象实例。   

`var myNotification = new Notification(title, options)`    

**参数**   

+ **title**: 定义通知的标题。
+ **options**: 可选参数。可选的配置有：   
  - `dir`: 通知展示的方向。默认是 `auto`，这个值会根据浏览器的语种配置值调整，不过也可以手动设置为 `ltr` 或者 `rtl`。
  - `lang`: 语种。
  - `badge`: 一个字符串。是一个图片的 URL 地址。当没有足够的空间去显示通知本身时就会使用这个图片替代。
  - `body`: 一个字符串，表示通知的主体内容。
  - `tag`: 一个用来标记通知的字符串。
  - `icon`: 一个 icon 的 URL 地址字符串。
  - `image`: 展示在通知内的图片的 URL 地址。（话说有多个图片怎么办）
  - `data`: 任意想要与通知关联起来的数据，可以是任意类型。
  - `vibrate`: 当通知展示时的设备震动硬件的 vibration pattern。
  - `renotify`: 布尔值。来决定是否通知用户一条新的通知替换了旧的通知。默认 `false`。
  - `requestInteraction`: 布尔值。表示当通知被用户点击或者清除前，是应该一直维持住呢，还是该自动关闭。
  - `actions`: 一个 `NotificationAction` 的数组，表示当通知出现时用户可采取的行为。应该是用户点击的时候可能会触发一种行为，这个行为的名字貌似会发送给 sw 通知监听函数来让我们知道用户选择了哪种行为。      

下面的几个选项是最新规范中列出的，不过浏览器还不支持。    

+ `silent`: 布尔值。决定通知是否应该是 silent。例如，不发出声音及震动。
+ `sound`: 字符串，包含一个通知展示时的音频文件的 URL。
+ `noscreen`: 布尔值。是否通知该展示到设备屏幕上？
+ `sticky`: 布尔值。是否通知该是 sticky。例如，用户不容易去清除这个通知。   

#### 属性

**静态属性**：这些属性是在 `Notification` 对象自身上可用的：    

+ `Notification.permission`: 只读属性。不说了。    

**实例属性** 貌似都是只读属性，就是传入构造函数的选项对象的值吧：      

+ `actions`
+ `badge`
+ `body`
+ `data`: 这个应该是返回传入 data 数据结构性复制的副本
+ `dir`
+ `lang`
+ `tag`
+ `icon`
+ `image`
+ `requireInteraction`
+ `silent`
+ `timestamp` 应该是通知创建的事件，这个貌似也可以传到构造函数中，但那个页面没写到。
+ `title`
+ `vibrate`   
+ `noscreen`
+ `renotify`
+ `sound`
+ `sticky`    

**事件监听函数：**   

+ `onclick`, `onerror`    

#### 方法

**静态方法：**   

+ `Notification.requestPermission()`: `Notification.requestPermission().then(function(permission) { ... });`    

**实例方法：**   

+ `close()`    

### NotificationEvent

这个事件对象貌似只是传递给 sw 中 `onnotificationclick` 监听器的事件对象，而不是 `Notification` 对象触发事件时传入的对象。这个事件代表了一个通知点击事件被分发到 sw 中。
这个借口继承自 `ExtendableEvent` 借口。    

#### 属性

+ `NotificationEvent.notification` 返回发出事件的那个 `Notification` 对象实例。
+ `NotificationEvent.action`:返回一个 ID 字符串，表示了用户点了通知的哪个按键。或者没点按钮或者根本就没按钮的话就是 `undefined`。    

#### 方法

只有一个继承自 `ExtendableEvent` 的 `waitUntil` 方法。    

## 相关接口

### ServiceWorkerRegistration.getNotifications()

返回一个通知的列表，按照创建顺序排列。这些通知应该是通过当前 `ServiceWorkerRegistration` 创建的。    

```js
ServiceWorkerRegistration.getNotifications(options).then(function(NotificationsList) { ... });
```    

+ `options`: 可选参数，用来过滤返回的通知列表。可选项：
  - `tag`：略。   


### ServiceWorkerRegistration.showNotification()

这个接口可以在一个激活的 sw 上创建一条通知。    

```js
ServiceWorkerRegistration.showNotification(title, [options]).then(function(NotificationEvent) { ... });
```    

### ServiceWorkerGlobalScope.onnotificationclick  

这个事件应该是只有 `showNotification()` 方法创建的通知被点击时才触发。    




