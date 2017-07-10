# The Service Worker LifeCycle

## The first service worker

简单的来说，最初的 service worker 包括下面的生命周期：    

1. `install` 事件是一个 service worker 触发的第一个事件，而且只触发一次。
2. 传递给 `installEvent.waitUntil()` 的 promise 表示安装过程的持续时间以及安装的成功与否。
3. 一个 service worker 只有在成功的完成安装并变为 active 时才会开始接收 `fetch` 和 `push` 事件。
4. 默认情况下，一个页面的 fetch 不会通过 service worker，除非页面自身要求去通过 service worker。
所以我们需要刷新页面来查看 service worker 是否生效。
5. `clients.claim()` 可以覆盖这种默认行为，并且会控制未控制的页面。   

### Scope and control

我们把页面，workers 和 shared workers 叫做 `clients`。我们的 service worker 只能控制
在 scope 内的 clients。一旦一个 client 是“受控制的”，其 fetch 行为就会通过 service worker。   
我们可以通过 `navigator.serviceWorker.controller` 来检测一个 client 是否是受控制的，
如果是受控制的返回 service worker 实例，否则返回 `null`。     

### Download, parse, and execute

首先我们调用 `.register()` 下载最初的 service worker。如果 service worker 下载失败，
解析失败或者是在初始的执行时出错，那么注册返回的 promise 就是 rejected， service worker 会被丢弃。   

### Install

`install` 事件是我们缓存资源的好机会。   

### Activate

一旦 service worker 准备好去控制 clients 及处理例如 `push` 和 `sync` 等事件，我们就会得到
一个 `activate` 事件。但是这不意味着调用 `.register()` 的页面是受控的。    

### clients.claim

一旦我们的 service worker 是 activated，那么我们可以在 service worker 中调用 `client.claim()`
来控制不受控的 clients。   

## Updating the service worker

简单的来说，更新 service worker 包含下面的生命周期：   

1. 触发一个更新：   
  + 导航到一个 scope 内的页面。
  + 在例如 `push` 和 `sync` 等事件中，除非在之前的 24 小时中执行过更新检查。
  + 当调用 `.register()` 的 service worker 的 URL 发生了变化。    
2. 在获取更新时 service worker 脚本的缓存首部符合要求（最多24小时）。这个行为是可以修改的，
在需要时，我们可以改为 max-age 为 0。
3. 只要新的 service worker 与浏览器已有的 service worker 脚本有1个字节的不同，那么都认为 service worker
是更新了的。
4. 更新了的 service worker 与已存在的 service worker 一起启动，并且触发自己的 `install` 事件。
5. 如果新的 worker 的状态码是不正常的（例如 404），或者解析失败，或者在执行时出错，或者在安装时
触发，那么新的 service worker 会被丢弃，当前存在的 service worker 仍然保持 active。
6. 一旦新的 service worker 成功安装，那么会一直保持等待状态，直到存在的 worker 控制的 clients 为0。
7. `self.skipWaiting()` 会禁止等待新闻，意味着新的 service worker 会在安装完成后立刻激活。    

### Install

略。   

### Waiting

在其成功安装后，更新的 service worker 会在当前 service worker 控制的 clients 变为0前推迟
自己的激活操作。    

即便我们有一个标签栏是在旧的 service worker 控制下，那么我们刷新页面是无法让新的 service worker
接手控制权的。    

### Activate

这个事件是我们清除旧的缓存的理想时间。   

### Skip the waiting phase

等待阶段意味着我们站点同一时间指定运行一个版本的 service worker，但是如果我们不需要这个特征，
我们可以调用 `self.skipWaiting()` 来让新版本的 service worker 尽快地激活。   

### Manual updates

浏览器会在导航和功能事件后自动检查 service worker 的更新，但是我们也可以手动触发更新：   

```js
navigator.serviceWorker.register('/sw.js').then(reg => {
  // sometime later…
  reg.update();
});
```

### Avoid changing the URL of your service worker script

尽量不要变更 service worker 的 URL地址，就在其当前位置更新脚本就好。因为如果变更地址可能会导致
这样的问题：   

1. `index.html` 注册 `sw-v1.js` 作为 service worker。
2. `sw-v1.js` 缓存资源并提供给 `index.html`。
3. 我们更新 `index.html`，这时页面注册新的 `sw-v2.js` 作为 service worker。    

如果我们像上面这样做，用户永远不会获取到 `sw-v2.js`，`sw-v1.js` 会一直从其缓存中提供
旧版本的 `index.html`。       
