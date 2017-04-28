# CSP

## 1.简介

CSP 即 Cotent-Security-Policy，两种方法可以启用CSP。一种是通过 HTTP 头信息的 Content-Security-Policy
字段。  

另一种是通过 `<meta>` 标签。  

`<meta http-equiv="Content-Security-Policy" content="script-src 'self'; object-src 'none'; style-src cdn.example.org third-party.org; child-src https:">`  

## 2. 限制选项

### 2.1 资源限制加载

以下选项限制各类资源的加载。  
  + script-src: 外部脚本
  + style-src: 样式表
  + img-src: 图像
  + media-src: 媒体文件
  + font-src: 字体文件
  + object-src: 插件
  + child-src: 框架
  + frame-ancestors: 嵌入的外部资源（比如`<frams>, <iframe>, <embed>, <applet>`
  + connect-src: HTTP连接（通过XHR、WebSockets、EventSource等）
  + worker-src: worker脚本
  + manifest-src: manifest文件

### 2.2 default-src

`default-src` 用来设置上面各个选项的默认值。

`Content-Security-Policy: default-src 'self'`  

上面代码限制所有的外部资源，都只能从当前域名加载。  

如果通知设置某个单项限制，会覆盖 `default-src`。  

### 2.3 URL 限制

有时网页会跟其他 URL 发生联系，这时也可以加以限制。  
  + frame-ancestors: 限制嵌入框架的网页
  + base-uri: 限制 &lt;base#href&gt;
  + form-action: 限制 &lt;form#action&gt;


### 2.4 其他限制

+ block-all-mixed-content: HTTPS网页不得加载HTTP资源
+ upgrade-insecure-requests: 自动将网页上所有加载外部资源的HTTP链接换成HTTPS协议
+ plugin-types: 限制可以使用的插件格式
+ sandbox: 浏览器行为的限制，比如不能有弹出窗口等。  

## 3. 选项值

每个限制选项可以设置一下几种值，这些值就构成了白名单。  

  + 主机名：example.org, https://example:443
  + 路径名：example.org/resource/js/
  + 通配符：\*.example.org, \*://\*.example.org:\*
  + 协议名：https:、data:
  + 关键字'self'：当前域名，需要加引号
  + 关键字'none'：禁止加载任何外部资源，需要加引号

多个值可以并列，用空格分割。  

如果同一个限制选项使用多次，只有第一次会生效。  

## 4. srcipt-src 的特殊值

除了常规值，`srcipt-src`还可以设置一些特殊值。注意，下面这些值必须放在单引号里面。

  + 'unsafe-inline': 允许执行页面内嵌的 &lt;script&gt;标签和事件监听函数
  + 'unsafe-eval': 允许将字符串当做代码执行，比如使用eval, setTimeout, setInterval和Function等函数
  + nonce值：每次HTTP回应给出一个授权token，页面内嵌脚本必须有这个token，才会执行。  
  + hash值: 列出允许执行的脚本代码的Hash值，页面内嵌脚本的哈希值只有吻合的情况下才能执行。  

计算hash值的时候，`<script>`标签不算在内。  

除了 `script-src` 选项，nonce和hash值还可以用在 `style-src` 选项。  
