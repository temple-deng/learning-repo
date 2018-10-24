# Web Push Notifications

<!-- TOC -->

- [Web Push Notifications](#web-push-notifications)
  - [Overview](#overview)
  - [How Push Works](#how-push-works)
    - [第一步：客户端](#第一步客户端)
    - [第二步：发送推送消息](#第二步发送推送消息)
    - [第三步：用户设备上触发推送事件](#第三步用户设备上触发推送事件)
  - [订阅用户](#订阅用户)
    - [功能检测](#功能检测)
    - [注册 sw](#注册-sw)
    - [权限请求](#权限请求)
    - [使用 `PushManager` 订阅用户](#使用-pushmanager-订阅用户)
    - [如何创建 application server keys](#如何创建-application-server-keys)
    - [将 Subscription 发送到我们的服务器](#将-subscription-发送到我们的服务器)
  - [使用 Web Push 库发送消息](#使用-web-push-库发送消息)
    - [保存 Subscriptions](#保存-subscriptions)
    - [发送推送消息](#发送推送消息)
  - [The Web Push Protocol](#the-web-push-protocol)
    - [Application server keys](#application-server-keys)
    - [负载加密](#负载加密)
      - [输入](#输入)
      - [共享密钥](#共享密钥)
      - [PRK](#prk)
      - [CEK 和 nonce](#cek-和-nonce)
      - [加密](#加密)
    - [其他的首部](#其他的首部)
  - [推送事件](#推送事件)
  - [展示通知](#展示通知)
    - [视觉层面](#视觉层面)
      - [Title, Body](#title-body)
      - [Icon](#icon)
      - [Badge](#badge)
      - [Image](#image)
      - [Actions](#actions)
      - [Directions](#directions)
      - [Vibrate](#vibrate)
      - [Sound](#sound)
      - [Timestamp](#timestamp)
    - [行为层面](#行为层面)
      - [Notificationclick 事件](#notificationclick-事件)
      - [Actions](#actions-1)
      - [Tag](#tag)
      - [Renotify](#renotify)
      - [Silent](#silent)
    - [要求交互](#要求交互)
  - [通用模式](#通用模式)
    - [打开窗口](#打开窗口)
    - [聚焦到一个存在的窗口](#聚焦到一个存在的窗口)
    - [合并通知](#合并通知)
  - [FAQ](#faq)
    - [为什么推送在浏览器关闭的时候还可以工作](#为什么推送在浏览器关闭的时候还可以工作)

<!-- /TOC -->

## Overview

```js
serviceWorkerRegistration.showNotification(title, options);
```    

`title` 参数即通知的标题，`options` 参数设置了通知的其他属性：   

```json
{
  "body": "Did you make a $1,000,000 purchase at Dr. Evil...",
  "icon": "images/ccard.png",
  "vibrate": [200, 100, 200, 100, 200, 100, 400],
  "tag": "request",
  "actions": [
    { "action": "yes", "title": "Yes", "icon": "images/yes.png" },
    { "action": "no", "title": "No", "icon": "images/no.png" }
  ]
}
```   

![cc-good](https://raw.githubusercontent.com/temple-deng/markdown-images/master/pwa/cc-good.png)    

## How Push Works

实现 web push 的三个关键步骤：   

1. 添加客户端逻辑代码订阅客户推送
2. 后端的 API 调用触发了一条推送消息到用户设备
3. 当这条推送消息到达用户设备时，sw JS 文件会收到一个 "push" 事件。这时我们就应该调用
Notification API 来展示一条通知。    

### 第一步：客户端

订阅一个用户要求两件事。首先，获取给用户发送消息的 **权限**。第二点，从浏览器获取 `PushSubscription`。
`PushSubscription` 包含我们要给用户发送信息所需的所有信息。可以将其假想成一个用户设备的 ID。     

在订阅用户之前，需要生成一个 “应用服务器密钥” 的集合。之后会谈到。    

应用服务器密钥，也叫 VAPID 密钥，对于我们服务器是唯一的。这些密钥用来确保 push 服务准确地找到
那个订阅了用户的服务器，并确保是同一个服务器发送了信息给那个用户。    

当所有东西都准备好后，就可以将 `PushSubscription` 中的内容发送给服务器。在服务器上我们会将这些
内容存储在数据库中，然后用它来发送信息给用户。   

### 第二步：发送推送消息

当我们要发送推送消息到用户时，在服务器上进行一个 API 调用到 push service。API 调用会包含我们
要发送的信息的内容。   

push service 接收网络请求，验证其内容，然后发送一条推送消息到合适的浏览器。如果浏览器处于离线
状态，消息会进入一个队列，直到浏览器上线。    

浏览器可以使用它们想要的任意的 push service，这个不是开发者可以控制的。不过每个 push service
的 API 调用都是一致的。    

为了获取触发一条推送消息的合适的 URL（push service 的 URL），我们需要获取 `PushSubscription`
的 `endpoint` 属性：   

```json
{
  "endpoint": "https://random-push-service.com/some-kind-of-unique-id-1234/v2/",
  "keys": {
    "p256dh" :
"BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM=",
    "auth"   : "tBHItJI5svbpez7KI4CCXg=="
  }
}
```    

push service 的地址即 `random-push-service.com`，而每个用户的 endpoint 都是唯一的，上面
的就是 `some-kind-of-unique-id-1234`。     

API 调用定义在标准 [Web Push Protocal](https://tools.ietf.org/html/draft-ietf-webpush-protocol-12)。    

这个 API 调用要求了一些请求首部以及数据必须是字节流的形式。     

我要发送给 API 的数据必须是加密的。我们发送给 push service 的一些指令定义了推送消息在 push
service 上是如何入队的。    

这些指令包括：   

+ 推送消息的生存时间。即消息被删除并未发送给用户前在队列中的时间。
+ 定义的消息的紧急度。有时 push service 会为了节省用户设备的电量而只发送高优先级的消息。
+ 给推送消息一个 "topic" 名称会替换在队列中的消息（但没明确说是同一 "topic" 的消息，但估计应该
是这样的）    

![server-to-push-service](https://raw.githubusercontent.com/temple-deng/markdown-images/master/pwa/server-to-push-service.svg)    

### 第三步：用户设备上触发推送事件

push service 在收到我们服务器发送的推送消息后，直到以下事件之一发生前，消息会一直保存在其服务器
上：   

1. 用户设备上线，service 发送消息到用户设备
2. 消息过期，service 从队列中移除消息   

当浏览器收到 service 发送的消息时，会解密数据然后在 sw 中触发 `push` 事件。   

sw 可以在页面未打开的时候执行，甚至可以在浏览器关闭的时候执行。    

![push-service-to-sw-event](https://raw.githubusercontent.com/temple-deng/markdown-images/master/pwa/push-service-to-sw-event.svg)    

## 订阅用户

### 功能检测

首先肯定要检测浏览器支不支持推送功能，介于 `push` 事件是在 sw 中触发，所以也要支持 sw：   

1. 检测 `navigator.serviceWorker`
2. 检测 `window.PushManager`    

```js
if (!('serviceWorker' in navigator)) {
  // Service Worker isn't supported on this browser, disable or hide UI.
  return;
}

if (!('PushManager' in window)) {
  // Push isn't supported on this browser, disable or hide UI.
  return;
}
```    

### 注册 sw

```js
function registerServiceWorker() {
  return navigator.serviceWorker.register('service-worker.js')
  .then(function(registration) {
    console.log('Service worker successfully registered.');
    return registration;
  })
  .catch(function(err) {
    console.error('Unable to register service worker.', err);
  });
}
```    

当 `register()` resolve 了，返回一个 `ServiceWorkerRegistration` 对象，这个对象提供了
对 PushManager API 的访问。     

### 权限请求

获取权限的 API 最近做过变更，因此我们必须提供两个版本的适配：   

```js
function askPermission() {
  return new Promise(function(resolve, reject) {

    // 旧版的 API 中，Notification.requestPermission 接收一个回调
    // 新版的 API 返回一个 Promise
    const permissionResult = Notification.requestPermission(function(result) {
      resolve(result);
    });

    if (permissionResult) {
      permissionResult.then(resolve, reject)
    }
  })
  .then(function(permissionResult) {
    if (permissionResult !== 'granted') {
      throw new Error('We were\'t granted permission.');
    }
  });
}
```    

`permissionResult` 的可能的值有 'granted', 'default', 'denied'。default 是什么鬼，
用户直接关闭了，但是可以再次请求权限。    

在上面的代码中，只有 `granted` 才会 resolve，其他都会 reject。那意思上面还多做了一层检测？   

如果用户一旦拒绝授予权限的话，那就比较惨了，我们就不能再次发起请求权限的申请了，用户必须手动到
配置面板里解封。    

### 使用 `PushManager` 订阅用户

```js
function subscribtUserToPush() {
  return navigator.serviceWorker.register('service-worker.js')
    .then(function(registration) {
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
        )
      };

      return registration.pushManager.subscribe(subscribeOptions);
    }).then(function(pushSubscription) {
      console.log('Received PushSubscription: ', JSON.stringify(pushSubscription));
      return pushSubscription;
    });
}
```    

**`userVisibleOnly`**     

这个东西暂时没看懂，但是反正 Chrome 只支持设置为 `true` 的情况，这时候消息每次被推送过来，都
会弹出通知给用。而且看意思 Chrome 很可能不打算实现 `false` 的情况。   

**`applicationServerKey`**     

这个东西上面提到了，是提供给 push service，用来识别订阅了用户的那个应用，以及确保是同一个应用
推送消息给用户。     

应用服务器密钥是指唯一标识我们应用的公钥和私钥对。`applicationServerKey` 是我们应用的公钥。
浏览器会在订阅用户时将其发送给 push service。    

具体的步骤就是：   

1. 页面在浏览器中调用 `subscribe()`，传入服务器公钥
2. 浏览器将公钥通过网络请求发送给 push service，push service 会生成一个 endpoing，将
endpoint 与公钥关联起来，返回将 endpoint 返回给浏览器
3. 浏览器将 endpoint 添加到 `PushSubscription`。    

当我们之后发送推送消息给 push service 时，需要添加一个 `Authorization` 首部，包含了使用
服务器私钥签名的信息（什么信息也没说啊）。当 push service 收到这个网络请求时，使用查找到的
公钥解开签名验证消息。   

![application-server-key-send](https://raw.githubusercontent.com/temple-deng/markdown-images/master/pwa/application-server-key-send.svg)    

所以这个 Web Push Protocol 信息都是在这个首部中吗？    

具体这个 application server key 是什么样的，定义在 [VAPID spec](https://tools.ietf.org/html/draft-thomson-webpush-vapid-02)。     

如果在 `PushSubscription` 对象上调用 `JSON.stringify()` 并打印输出，结果类似下面的东西：   

```json
{
  "endpoint": "https://some.pushservice.com/something-unique",
  "keys": {
    "p256dh":
"BIPUL12DLfytvTajnryr2PRdAgXS3HGKiLqndGcJGabyhHheJYlNGCeXl1dn18gSJ1WAkAPIxr4gK0_dQds4yiI=",
    "auth":"FPssNDTKnInHVndSTdbKFw=="
  }
}
```    

注意看意思这里面的 `keys` 才是用来加密数据的，那也就是说 application server keys 就只是
push service 用来识别应用的功能。    

### 如何创建 application server keys

```js
$ npm install -g web-push
$ web-push generate-vapid-keys
```    

### 将 Subscription 发送到我们的服务器

```js
const subscriptionObject = {
  endpoint: pushSubscription.endpoint,
  keys: {
    p256dh: pushSubscription.getKeys('p256dh'),
    auth: pushSubscription.getKeys('auth')
  }
};

// The above is the same output as:

const subscriptionObjectToo = JSON.stringify(pushSubscription);
```    

```js
function sendSubscriptionToBackEnd(subscription) {
  return fetch('/api/save-subscription/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(subscription)
  })
  .then(function(response) {
    if (!response.ok) {
      throw new Error('Bad status code from server.');
    }

    return response.json();
  })
  .then(function(responseData) {
    if (!(responseData.data && responseData.data.success)) {
      throw new Error('Bad response from server.');
    }
  });
}
```    

## 使用 Web Push 库发送消息

### 保存 Subscriptions

```js
function sendSubscriptionToBackEnd(subscription) {
  return fetch('/api/save-subscription/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(subscription)
  })
  .then(function(response) {
    if (!response.ok) {
      throw new Error('Bad status code from server');
    }
    return response.json();
  })
  .then(function(responseData) {
    if (!(responseData.data && responseData.data.success)) {
      throw new Error('Bad response from server.');
    }
  });
}
```    

服务器端可以用类似以下的代码将 subscription 保存到数据库中，这个示例中使用的数据库是 nedb:   

```js
function saveSubscriptionToDatabase(subscription) {
  return new Promise(function(resolve, reject) {
    db.insert(subscription, function(err, newDoc) {
      if (err) {
        reject(err);
        return;
      }

      resolve(newDoc._id);
    });
  });
};
```    

### 发送推送消息

```js
const webpush = require('web-push');

const vapidKeys = {
  publicKey:
'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U',
  privateKey: 'UUxI4O8-FbRouAevSmBQ6o18hgE4nSG3qwvJTfKc-ls'
};

webpush.setVapidDetails(
  'mailto:web-push-book@gauntface.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);
```    

```js
app.post('/api/trigger-push-msg/', function (req, res) {
  return getSubscriptionsFromDatabase()
  .then(function(subscriptions) {
    let promiseChain = Promise.resolve();

    for (let i = 0; i < subscriptions.length; i++) {
      const subscription = subscriptions[i];
      promiseChain = promiseChain.then(() => {
        return triggerPushMsg(subscription, dataToSend);
      });
    }

    return promiseChain;
  })

const triggerPushMsg = function(subscription, dataToSend) {
  return webpush.sendNotification(subscription, dataToSend)
  .catch((err) => {
    if (err.statusCode === 410) {
      return deleteSubscriptionFromDatabase(subscription._id);
    } else {
      console.log('Subscription is no longer valid: ', err);
    }
  });
};
```    

## The Web Push Protocol

### Application server keys

1. 应用服务器使用其 application 私钥将一个 JSON 消息签名
2. 被签名的信息被添加到一个 HTTP POST 请求的首部中发送给 push service
3. push service 验证
4. 如果签名消息有效，push service 将消息入队     

被签名的消息其实就是一个 JWT。    

对于 web push 来说，发送给 push service 的 JWT 的数据通常是下面这样：   

```json
{  
  "aud": "https://some-push-service.org",
  "exp": "1469618703",
  "sub": "mailto:example@web-push-book.org"  
}
```    

`aud` 通常是 push service 的源。`sub` 可以是一个 URL 或者是一个邮件地址 `mailto`。这是
为了在某些时候如果 push service 需要通知发送者时，可以从 JWT 中找到联系方式，这也是为什么我们
上节看到 web-push 库需要一个邮件地址。    

签名使用的是 ES256 算法，即 ECDSA using the P-256 curve and the SHA-256 hash algorithm。   

```js
// Utility function for UTF-8 encoding a string to an ArrayBuffer.
const utf8Encoder = new TextEncoder('utf-8');

// The unsigned token is the concatenation of the URL-safe base64 encoded
// header and body.
const unsignedToken = .....;

// Sign the |unsignedToken| using ES256 (SHA-256 over ECDSA).
const key = {
  kty: 'EC',
  crv: 'P-256',
  x: window.uint8ArrayToBase64Url(
    applicationServerKeys.publicKey.subarray(1, 33)),
  y: window.uint8ArrayToBase64Url(
    applicationServerKeys.publicKey.subarray(33, 65)),
  d: window.uint8ArrayToBase64Url(applicationServerKeys.privateKey),
};

// Sign the |unsignedToken| with the server's private key to generate
// the signature.
return crypto.subtle.importKey('jwk', key, {
  name: 'ECDSA', namedCurve: 'P-256',
}, true, ['sign'])
.then((key) => {
  return crypto.subtle.sign({
    name: 'ECDSA',
    hash: {
      name: 'SHA-256',
    },
  }, key, utf8Encoder.encode(unsignedToken));
})
.then((signature) => {
  console.log('Signature: ', signature);
});
```    

然后发送给 web push 的 POST 请求的 `Authorization` 首部类似这个样子：   

```
Authorization: 'WebPush <JWT Info>.<JWT Data>.<Signature>'
```    

Web Push Protocol 还要求我们使用 URL safe base64 将应用公钥加密，然后前缀 `p256ecdsa=`
添加到一个 `Crypto-Key` 首部中：   

```
Crypto-Key: p256ecdsa=<URL Safe Base64 Public Application Server Key>
```   

### 负载加密

消息负载的加密是在规范 [Message Encryption spec](https://tools.ietf.org/html/draft-ietf-webpush-encryption-09)    

**ECDH: Elliptic Curve Diffie-Hellman key exchange**    

假设现在通信双方 Alice, Bob，各自都有自己的公私钥，并且都有对方的公钥。    

使用 ECDH 生成密钥，一个有用的特性就是 Alice 可以使用它的私钥和 Bob 的公钥来创建一个密钥 'X'。
Bob 同理。**注意这里 Bob 生成的 'X' 和 Alice生成的 'X' 是相等的，这是算法决定的** 。
那这时双方就可以使用这个 'X' 来加密通信信息。    

```js
const keyCurve = crypto.createECDH('prime256v1');
keyCurve.generateKeys();

const publicKey = keyCurve.getPublicKey();
const privateKey = keyCurve.getPrivateKey();
```    

**HKDF: HMAC based key derivation function**    

本质上，HKDF 接收一个不是特别安全的输入，然后将其转换成更安全的。    

规范要求这个加密使用 SHA-256 哈希算法。    

```js
// Simplified HKDF, returning keys up to 32 bytes long
function hkdf(salt, ikm, info, length) {
  // Extract
  const keyHmac = crypto.createHmac('sha256', salt);
  keyHmac.update(ikm);
  const key = keyHmac.digest();

  // Expand
  const infoHmac = crypto.createHmac('sha256', key);
  infoHmac.update(info);

  // A one byte long buffer containing only 0x01
  const ONE_BUFFER = new Buffer(1).fill(1);
  infoHmac.update(ONE_BUFFER);

  return infoHmac.digest().slice(0, length);
}
```    

#### 输入

OK，加密算法都讲完了，现在进入正文，当我们想要发送一条推送消息时，输入包括三部分：   

1. 负载本身
2. `PushSubscription` 中的 `auth` 密钥
3. `PushSubscription` 中的 `p256dh`    

`auth` 通常来说应该当做一个密钥，不要和其他人共享。`p256dh` 是一个公钥，有时候也可以叫客户端
公钥。这个公钥事实上是浏览器生成的。而私钥浏览器会自己保存，以便解密消息。   

另外，加密过程还需要一个盐值 salt，这是一个 16 字节的随机数据:   

```js
const salt = crypto.randomBytes(16);
```     

使用 P-256 elliptic curve 生成公私钥：   

```js
const localKeysCurve = crypto.createECDH('prime256v1');
localKeysCurve.generateKeys();

const localPublicKey = localKeysCurve.getPublicKey();
const localPrivateKey = localKeysCurve.getPrivateKey();
```    

在负载、auth 秘钥，subscription 公钥（p256dh）这些输入都准备好，以及刚生成的 salt 和
本地密钥（上面的这两个），现在就可以开始加密了。     


#### 共享密钥

第一步就是使用 subscription 公钥和服务器刚创建的私钥创建一个共享密钥：   

```js
const sharedSecret = localKeysCurve.computeSecret(
  subscription.keys.p256dh, 'base64');
```    

#### PRK

Pseudo Random Key(PRK) 是 auth 密钥和共享密钥的组合：   

```js
const authEncBuff = new Buffer('Content-Encoding: auth\0', 'utf8');
const prk = hkdf(subscription.keys.auth, sharedSecret, authEncBuff, 32);
```    

#### CEK 和 nonce

然后还有一个 context 的东东：   

```js
const keyLabel = new Buffer('P-256\0', 'utf8');

// Convert subscription public key into a buffer.
const subscriptionPubKey = new Buffer(subscription.keys.p256dh, 'base64');

const subscriptionPubKeyLength = new Uint8Array(2);
subscriptionPubKeyLength[0] = 0;
subscriptionPubKeyLength[1] = subscriptionPubKey.length;

const localPublicKeyLength = new Uint8Array(2);
subscriptionPubKeyLength[0] = 0;
subscriptionPubKeyLength[1] = localPublicKey.length;

const contextBuffer = Buffer.concat([
  keyLabel,
  subscriptionPubKeyLength.buffer,
  subscriptionPubKey,
  localPublicKeyLength.buffer,
  localPublicKey,
]);
```    

这个 context 主要是用来创建一个 nonce 和一个 content encryption key(CEK) 的。   

nonce 可以理解为一个一次性使用的值，主要是为了防止重放攻击。    

CEK 是最终用来加密负载的密钥。    

```js
const nonceEncBuffer = new Buffer('Content-Encoding: nonce\0', 'utf8');
const nonceInfo = Buffer.concat([nonceEncBuffer, contextBuffer]);

const cekEncBuffer = new Buffer('Content-Encoding: aesgcm\0');
const cekInfo = Buffer.concat([cekEncBuffer, contextBuffer]);
```    

```js
// The nonce should be 12 bytes long
const nonce = hkdf(salt, prk, nonceInfo, 12);

// The CEK should be 16 bytes long
const contentEncryptionKey = hkdf(salt, prk, cekInfo, 16);
```    

#### 加密

```js
const cipher = crypto.createCipheriv(
  'id-aes128-GCM', contentEncryptionKey, nonce);
```    

在加密前，需要定义在负载前面要多长的填充。这个填充是为了防止窃听者根据负载长度推断出消息的类型。   

除了填充外，填充前还要加两个字节的数据包表示填充的长度。例如要加 5 个字节的填充，那前两个字节
就是 5，然后是 5 个字节的填充，再然后就是负载数据。    

```js
const padding = new Buffer(2 + paddingLength);
// The buffer must be only zeros, except the length
padding.fill(0);
padding.writeUInt16BE(paddingLength, 0);
```    

```js
const result = cipher.update(Buffer.concat(padding, payload));
cipher.final();

// Append the auth tag to the result -
// https://nodejs.org/api/crypto.html#crypto_cipher_getauthtag
const encryptedPayload = Buffer.concat([result, cipher.getAuthTag()]);
```    

这就加密完成了。    

为了发送加密数据到 push service，还要在 POST 请求中定义一些其他的首部。    

首先是 'Encryption' 首部要包含 salt 值：   

```js
Encryption: salt=<URL Safe Base64 Encoded Salt>
```    

然后上面提到的 `Crypto-Key` 也要进行修改：   

```
Crypto-Key: dh=<URL Safe Base64 Encoded Local Public Key String>; p256ecdsa=<URL Safe Base64 Encoded Public Application Server Key>
```    

`Content-Length` 首部是加密负载的字节个数，`Content-Type` 和 `Content-Encoding` 是
固定的值：   

```
Content-Length: <Number of Bytes in Encrypted Payload>
Content-Type: 'application/octet-stream'
Content-Encoding: 'aesgcm'
```    

很明显，加密负载是放在请求主体中了。    

### 其他的首部

`TTL` 即之前提到的在队列中的最大生存时间，整型秒数值，必有的首部。    

```
TTL: <Time to live in seconds>
```    

如果把 `TTL` 设置为 0，push service会尝试立刻发送消息，不过如果设备不可达，那么消息会直接
从队列中丢弃。    

`Topic` 首部是用来使用新消息替换旧消息的，只要两者有匹配的 topic。可选首部。    

`Urgency` 可选首部：   

```
Urgency: <very-low | low | normal | high>
```    

## 推送事件

```js
self.addEventListener('push', function(event) {
  if (event.data) {
    console.log('This push event has data: ', event.data.text());
  } else {
    console.log('This push event has no data.');
  }
});
```   

可用的解析推送事件数据的方法：   

```js
// Returns string
event.data.text()

// Parses data as JSON string and returns an Object
event.data.json()

// Returns blob of data
event.data.blob()

// Returns an arrayBuffer
event.data.arrayBuffer()
```    

关于 sw 有一点我们需要理解的就是，我们无法控制 sw 何时在运行。浏览器决定了何时唤醒 sw，以及何时
中止掉 sw。我们唯一能做的就是使用 `waitUntil()` 方法，来让浏览器让 sw 一直运行，直到方法返回
的 promise 状态转变了。   

```js
self.addEventListener('push', function(event) {
  const promiseChain = self.registration.showNotification('Hello, World.');

  event.waitUntil(promiseChain);
});
```    

## 展示通知

我们可以将通知的配置项分成两部分，视觉层面和行为层面。    

```json
{
  "//": "Visual Options",
  "body": "<String>",
  "icon": "<URL String>",
  "image": "<URL String>",
  "badge": "<URL String>",
  "vibrate": "<Array of Integers>",
  "sound": "<URL String>",
  "dir": "<String of 'auto' | 'ltr' | 'rtl'>",

  "//": "Behavioural Options",
  "tag": "<String>",
  "data": "<Anything>",
  "requireInteraction": "<boolean>",
  "renotify": "<Boolean>",
  "silent": "<Boolean>",

  "//": "Both Visual & Behavioural Options",
  "actions": "<Array of Strings>",

  "//": "Information Option. No visual affect.",
  "timestamp": "<Long>"
}
```    

### 视觉层面


![notification-ui](https://raw.githubusercontent.com/temple-deng/markdown-images/master/pwa/notification-ui.png)    

#### Title, Body

这个没什么好介绍的，但是注意点就是不同的浏览器展示的通知的样式是不同的，Chrome 跨平台提供了
统一的 UI 表项，而 FF 则会使用系统提供的通知功能，例如在 Linux 下是这样：   

![firefox-title-body](https://raw.githubusercontent.com/temple-deng/markdown-images/master/pwa/firefox-title-body.png)    

在 Windows 下是这样：   

![firefox-title-body-windows](https://raw.githubusercontent.com/temple-deng/markdown-images/master/pwa/firefox-title-body-windows.png)    

#### Icon

`icon` 是一个在标题和正文旁边的一幅小图片。     

大小的话并没有明确的规定，在 Android 上可能是 64dp。   

#### Badge

`badge` 是一个小的单色图标，用来向用户提示通知来源的一些信息。   

```js
const title = 'Badge Notification';
const options = {
  badge: '/images/demos/badge-128x128.png'
};
registration.showNotification(title, options);
```    

大小可能是 24dp。   

#### Image

在桌面设备类似这样:   

![chrome-image](https://raw.githubusercontent.com/temple-deng/markdown-images/master/pwa/chrome-image.png)    
在 Android 裁剪和比例是不一样的：   

![chrome-image-android](https://raw.githubusercontent.com/temple-deng/markdown-images/master/pwa/chrome-image-android.png)   

#### Actions

`actions` 是通知的按钮：   

```js
const title = 'Actions Notification';
const options = {
  actions: [
    {
      action: 'coffee-action',
      title: 'Coffee',
      icon: '/images/demos/action-1-128x128.png'
    },
    {
      action: 'doughnut-action',
      title: 'Doughnut',
      icon: '/images/demos/action-2-128x128.png'
    },
    {
      action: 'gramophone-action',
      title: 'gramophone',
      icon: '/images/demos/action-3-128x128.png'
    },
    {
      action: 'atom-action',
      title: 'Atom',
      icon: '/images/demos/action-4-128x128.png'
    }
  ]
};

const maxVisibleActions = Notification.maxActions;
if (maxVisibleActions < 4) {
  options.body = `This notification will only display ` +
    `${maxVisibleActions} actions.`;
} else {
  options.body = `This notification can display up to ` +
    `${maxVisibleActions} actions.`;
}

registration.showNotification(title, options);
```    

![chrome-actions](https://raw.githubusercontent.com/temple-deng/markdown-images/master/pwa/chrome-actions.png)   

当前只有 Android 上的 Chrome 和 Opera 支持 actions。    

#### Directions

`dir` 没错就是文字的方向。   

#### Vibrate

数字的数组，单位是号码，即 \[震动，不震动\]。    

#### Sound

目前还没有浏览器支持这一选项，哈哈哈：   

```js
const title = 'Sound Notification';
const options = {
  sound: '/demos/notification-examples/audio/notification-sound.mp3'
};
registration.showNotification(title, options);
```    

#### Timestamp

从 1970.01.01 开始的毫秒时间戳，是导致服务器发送推送消息的事件触发的时间。   

```js
const title = 'Timestamp Notification';
const options = {
  body: 'Timestamp is set to "01 Jan 2000 00:00:00".',
  timestamp: Date.parse('01 Jan 2000 00:00:00')
};
registration.showNotification(title, options);
```    

### 行为层面

默认情况下，调用 `showNotification()` 会有以下的默认行为：   

+ 点击通知什么都不会发生
+ 每个新通知都会一个接一个的展示，浏览器不会折叠
+ 平台可能会发出声音或者震动
+ 一些平台可能在一段时间后会自动关闭通知，另一些则会一直展示着，直到用户交互。   

#### Notificationclick 事件

当用户点击通知时，默认的行为是什么都不发生，甚至都不会关闭或者移除通知。   

为了修改默认行为，我们需要在 sw 上监听 `notificationclick` 事件：   

```js
self.addEventListener('notificationclick', function(e) {
  const clickedNotification = e.notification;
  clickedNotification.close();
});
```   

#### Actions

之前以及提到了 actions，当用户点击 action 按钮后，我们可以检查 notificationclick 事件的
`event.action` 属性。   

```js
self.addEventListener('notificationclick', function(event) {
  if (!event.action) {
    // Was a normal notification click
    console.log('Notification Click.');
    return;
  }

  switch (event.action) {
    case 'coffee-action':
      console.log('User ❤️️\'s coffee.');
      break;
    case 'doughnut-action':
      console.log('User ❤️️\'s doughnuts.');
      break;
    case 'gramophone-action':
      console.log('User ❤️️\'s music.');
      break;
    case 'atom-action':
      console.log('User ❤️️\'s science.');
      break;
    default:
      console.log(`Unknown action clicked: '${event.action}'`);
      break;
  }
});
```    

#### Tag

`tag` 其实是一个将通知分组的字符串 ID。不过需要注意的是同一组后面的通知不会触发声音或者震动。   

#### Renotify

介于 `tag` 中不会重复发出声音和震动的问题，就需要添加另一个配置 `renotify` 布尔值属性，不过
需要注意的是 `renoify` 必须搭配 `tag` 使用不然要报错。   

#### Silent

禁止震动、声音以及把屏幕弄亮吧。    

`silent` 优先级大于 `renotify`。   

### 要求交互

桌面上的 Chrome 一段时间后会自动隐藏。Android 上则没有这种行为，必须要交互才行。   

为了强制通知在交互前一直存在，添加 `requireInteraction` 配置项。   

## 通用模式

除了 `notificationclick` 事件还有一个 `notificationclose` 事件，在用户选择忽略通知时
触发。    

附加额外的数据：   

```js
const options = {
  body: 'This notification has data attached to it that is printed ' +
    'to the console when it\'s clicked.',
  tag: 'data-notification',
  data: {
    time: new Date(Date.now()).toString(),
    message: 'Hello, World!'
  }
};
registration.showNotification('Notification with Data', options);
```    

在 `notificationclick` 事件回调中，我们可以在 `event.notification.data` 访问到这些数据。   

### 打开窗口

```js
const examplePage = '/demos/notification-examples/example-page.html';
const promiseChain = clients.openWindow(examplePage);
event.waitUntil(promiseChain);
```    

### 聚焦到一个存在的窗口

```js
const urlToOpen = new URL(examplePage, self.location.origin).href;

const promiseChain = clients.matchAll({
  type: 'window',
  includeUncontrolled: true
})
.then((windowClients) => {
  let matchingClient = null;

  for (let i = 0; i < windowClients.length; i++) {
    const windowClient = windowClients[i];
    if (windowClient.url === urlToOpen) {
      matchingClient = windowClient;
      break;
    }
  }

  if (matchingClient) {
    return matchingClient.focus();
  } else {
    return clients.openWindow(urlToOpen);
  }
});

event.waitUntil(promiseChain);
```    

### 合并通知

针对通知的折叠方面，我们可以使用 API 实现更复杂的折叠方案，而不是像上一节那样直接替换。比如说
聊天 app，可能会显示 `You have two messages from Matt` 这样的东西。   

`registration.getNotification()`可以访问到当前 app 所有可见的通知。   

```js
    .then((currentNotification) => {
      let notificationTitle;
      const options = {
        icon: userIcon,
      }

      if (currentNotification) {
        // We have an open notification, let's do something with it.
        const messageCount = currentNotification.data.newMessageCount + 1;

        options.body = `You have ${messageCount} new messages from ${userName}.`;
        options.data = {
          userName: userName,
          newMessageCount: messageCount
        };
        notificationTitle = `New Messages from ${userName}`;

        // Remember to close the old notification.
        currentNotification.close();
      } else {
        options.body = `"${userMessage}"`;
        options.data = {
          userName: userName,
          newMessageCount: 1
        };
        notificationTitle = `New Message from ${userName}`;
      }

      return registration.showNotification(
        notificationTitle,
        options
      );
    });
```    

## FAQ

### 为什么推送在浏览器关闭的时候还可以工作

先谈 Android，Android 系统会一直监听推送消息，直到收到一条推送消息后，系统会唤醒适当的 app 会
处理这条消息，而不管 app 是否处在关闭状态。   

因此这种工作模式当然对 Android 上的浏览器也成立了，浏览器进程被唤醒后就会唤醒 sw，然后触发
推送事件。    

桌面系统这个没看懂。好像是浏览器如果没运行的话，是接收不到推送事件的。    

Last Update: 2018.10.24   
