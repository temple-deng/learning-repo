# Sign in and Credential Management API

## The Credential Management API

这个 API：   

+ 移除了登录流程中的冲突部分 - 用户可以自动登录到一个站点，即使会话已过期又或者是用户在别的
设备上报错了证书
+ 允许使用一个账号选择器 account chooser 一键登录 - 用户可以在原生的 account chooser 中
选择一个账号
+ 存储证书 - 应用可以存储用户名和密码的组合，也可以存储联合账号的详细信息（什么鬼）。浏览器
可以跨设备同步这些证书。   

**Note:** 这个 API 只能在 HTTPS 下工作。    

### 检查 API 是否可用

```js
if (window.PasswordCredential || window.FederatedCredential) {
  // 调用 navigator.credentials.get() 取得存储的 PasswordCredential 或
  // FederatedCredential 数据
}
```    

### 登录用户

为了登录用户，需要从浏览器的密码管理器中取得证书，然后用这些数据登录用户。   

1. 当用户加载到站点且未登录时，调用 `navigator.credentials.get()`
2. 使用取得的证书登录用户
3. 更新 UI 到用户登录状态

### 保存和更新用户证书

如果用户使用 federated 身份提供者例如像 Google Sign-In, Facebook, Github 的身份登录：   

1. 在用户成功登录以后或者创建了一个新的账号，使用用户的 email 创建 `FederatedCredential`
作为 ID，并使用 `FederatedCredentials.provider` 声明身份提供者
2. 使用 `navigator.credentials.store()` 存储证书对象     

如果用户使用用户名和密码登录：   

1. 当用户成功登录或者创建账号以后，使用用户 ID 和密码创建 `PasswordCredential`
2. 使用 `navigator.credentials.store()` 保存证书对象

### 登出

等用户登出时，调用 `navigator.credentials.preventSilentAccess()` 阻止用户自动登回。   

禁止自动登录可以让我们在切换账号时变得很容易。     

## 登录用户

### 自动登录

自动登录可能发生在站点中的任意地方，而不仅仅是主页。    

为了启用自动登录：   

1. 获取证书信息
2. 认证用户
3. 更新 UI 到登录状态   

#### 获取证书信息

通过调用 `navigator.credentials.get()` 获取证书信息，并指定证书的类型 `password` 或者
`federated`。   

自动登录尽量一直设置 `mediation: 'silent'`，以便用户在以下情况时我们可以简单地忽略这个流程：   

+ 没有任何存储的证书
+ 有多个存储的证书
+ 登出状态    

```js
if (window.PasswordCredential || window.FederatedCredential) {
 if (!user.isSignedIn()) {
   navigator.credentials.get({
     password: true,
     federated: {
       providers: [
         'https://accounts.google.com'
       ]
     },
     mediation: 'silent'
   })
   // ...
  }
}
```   

这个东西应该是返回一个 promise，当其返回时，返回 undefined 或者一个证书对象，检查这个对象
的 `type` 属性是 `password` 还是 `federated` 来判断是一个 `PasswordCredential` 或者
`FederatedCredential` 对象。    

#### 认证用户

一旦获取了证书信息，根据不同的证书类型进行不同的认证操作流：   

```js
}).then(c => {
 if (c) {
   switch (c.type) {
     case 'password':
       return sendRequest(c);
       break;
     case 'federated':
       return gSignIn(c);
       break;
   }
 } else {
   return Promise.resolve();
 }
```    

完整的例子：   

```js
if (window.PasswordCredential || window.FederatedCredential) {
 if (!user.isSignedIn()) {
   navigator.credentials.get({
     password: true,
     federated: {
       providers: [
         'https://accounts.google.com'
       ]
     },
     mediation: 'silent'
   }).then(c => {
     if (c) {
       switch (c.type) {
         case 'password':
           return sendRequest(c);
           break;
         case 'federated':
           return gSignIn(c);
           break;
       }
     } else {
       return Promise.resolve();
     }
   }).then(profile => {
     if (profile) {
       updateUI(profile);
     }
   }).catch(error => {
     showError('Sign-in Failed');
   });
 }
}
```    

### 通过 account chooser 登录

当我们想要在用户进行了某种交互，例如点击登录按钮，弹出 account chooser 时，调用
`navigator.credentials.get()`，将 `mediation` 设置为 `'required'` 或者 `'optional'`。   

### Federated 登录

为了实现 federated 登录：   

1. 使用第三方身份认证用户
2. 存储身份信息
3. 更新 UI

当用户点击 federated 登录按钮时，使用 `FederatedCredential` 运行特定的身份提供者的认证流。   

```js
navigator.credentials.get({
  password: true,
  mediation: 'optional',
  federated: {
    providers: [
      'https://account.google.com'
    ]
  }
}).then(function(cred) {
  if (cred) {

    // Instantiate an auth object
    var auth2 = gapi.auth2.getAuthInstance();

    // Is this user already signed in?
    if (auth2.isSignedIn.get()) {
      var googleUser = auth2.currentUser.get();

      // Same user as in the credential object?
      if (googleUser.getBasicProfile().getEmail() === cred.id) {
        // Continue with the signed-in user.
        return Promise.resolve(googleUser);
      }
    }

    // Otherwise, run a new authentication flow.
    return auth2.signIn({
      login_hint: id || ''
    });

  }
});
```    

通常来说，这种登录都建立在额外的标准协议上，例如 OAuth。   

话说，如果我们不进行认证会怎样？能登录成功吗？    

#### 存储身份信息

所以现在就有很多问题，是每次都要进行认证并保存嘛，还是说每次要认证，但是只有第一次要保存？？？？    

一旦完成第三方认证，就可以存储身份信息了。这个信息就是身份提供者提供的 `id` 以及代表身份提供
者的 `name`。    

为了存储账户信息，实例化一个新的 `FederatedCredential` 对象，使用用户的 id 和提供者的 id。
调用 `navigator.credentials.store()` 存储身份信息。    

```js
// Create credential object synchronously.
var cred = new FederatedCredential({
  id:       id,                           // id in IdP
  provider: 'https://account.google.com', // A string representing IdP
  name:     name,                         // name in IdP
  iconURL:  iconUrl                       // Profile image url
});
```    