# Postman

<!-- TOC -->

- [Postman](#postman)
- [Postman 简介](#postman-简介)
  - [安装和更新](#安装和更新)
    - [Chrome app 和原生 app 之间的区别](#chrome-app-和原生-app-之间的区别)
  - [发送第一个请求](#发送第一个请求)
  - [创建第一个集合](#创建第一个集合)
  - [界面介绍](#界面介绍)
    - [Tabs 与 Windows](#tabs-与-windows)
  - [配置](#配置)
    - [通用配置](#通用配置)
  - [New button](#new-button)
    - [创建 collections](#创建-collections)
    - [创建 monitor](#创建-monitor)
    - [创建 mock server](#创建-mock-server)
- [Find 和 Replace](#find-和-replace)
- [发送 API 请求](#发送-api-请求)
  - [捕获 HTTP 请求](#捕获-http-请求)

<!-- /TOC -->

# Postman 简介

## 安装和更新

Postman 原生 app 在 macOS, Windows 和 Linux 都有不同的版本。所以这里就不介绍了。  

同时也有 postman chrome app，但是官方推荐使用原生 app。   

### Chrome app 和原生 app 之间的区别

Postman 原生 app 是基于 Electron 的，因此可以不受一些 Chrome 平台的限制。下面的功能只在
原生 app 上可用：   

- **Cookies**: 原生 app 可以让我们直接操作 cookies，在 chrome 上可能还需要另外的扩展的帮忙
- **内置代理**: 原生 app 内置代理可以让我们捕获网络请求
- **受限的首部**: 原生 app 可以发送一些例如 Origin 和 User-Agent 之类在 Chrome 中受限的
首部

等等。    

## 发送第一个请求

在地址栏中输入 `postman-echo.com/get`，点击发送按钮，完事。   

用户名 dengbo01，密码 deng755，邮箱 630。   

## 创建第一个集合

Postman 集合是一组我们可以保存在文件夹中的请求。    

我们在 Postman 中发送的每个请求都会出现在侧边栏中的 History tab 中。在一定范围内，通过 history
部分重用请求是非常方便的。但是如果我们发的请求过多，那么在 history 中寻找我们想要的请求就非常
麻烦了。    

还是发送一个请求，然后我们点击 Save 按钮，然后在弹框中可以输入请求名称和描述，然后选择一个 collection
保存请求。    

然后我们就可以在 History tab 旁的 Collections 中找到我们新创建的 collection 以及保存在
其中的请求了。    

## 界面介绍

![navigate](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/postman.jpg)    

**侧边栏**    

侧边栏用来管理请求和集合。包含两个主要的 tab：History 和 Collections。    

**顶栏**     

![headerbar](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/postman-headerbar.jpg)    

顶栏包含以下的几个部分：   

+ New: 创建请求，集合，environments, 文件，mock servers 以及 monitors
+ Import: 使用文件，链接或者原生文本向 Postman 导入 collections, environments, WADL,
Swagger, RAML, cURL。
+ Runner: 打开新的 collection runner
+ Workspaces: 可以在这里找到个人和团队的工作区，以及创建和管理工作区
+ Interceptor/Proxy: 管理代理和拦截器设置
+ IN SYNC status: 更新 postman 账号的状态
+ Settings: 管理 app 配置和其他支持的资源
+ Notification: 接收通知和广播
+ Heart: 点赞。。。
+ User: 账户信息

**Console**    

Postman 中包含两个 console 可以让我们看到幕后发生了什么：   

+ Postman console: 包含 HTTP 请求和响应的日志。我们可以从脚本中记录信息。
+ DevTools console: 包含开发过程中的诊断信息。     

**Status bar**    

状态栏在最下面，包含下面的内容：   

- 显示或隐藏侧边栏
- 在 collections, environments, globals 中搜索
- 打开 Postman console
- 选择一栏或两栏布局
- 打开键盘绑定
- 获取帮助

### Tabs 与 Windows

Postman 提供了多个tab以及多windows 的工作方式。   

新增 tab 可以通过点击 builder 中的 + 号或者 CMD/CTRL + T。    

## 配置

### 通用配置

![general-settings](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/postman-general-settings.png)    

- Trim keys and values in request body: 如果我们使用 form-data 或 url-encoded 发送
数据给服务器，如果把这个配置打开，会导致所有的参数被 trimmed
- SSL certificate verification: 当发送请求时，不要求 app 检查 SSL 证书的有效性
- Language detection: 将该项设置为 JSON 时会忽略掉响应的 Content-Type 首部，强制按照 JSON
格式渲染
- XHR Timeout in ms（没找到这个啊）: 应该愿意等待服务器的超时时候设置
- Send Postman Token header: 主要是为了绕过 Chrome 中的一个 bug。如果一个 XHR 是 pending
状态，然后使用相同的参数又发送了另一个请求，Chrome 会返回一样的响应。发送一个随机的 token 可以
解决这个问题
- Retain headers when clicking on links: 如果我们点击一个响应中的链接，Postman 会创建
一个新的 GET 请求。如果我们希望新的请求使用和之前请求一样的首部，那么就把该配置项设置为 ON   

## New button

我们可以使用 New button 初始化：   

- requests
- collections
- environments
- monitors
- doc
- mock servers

### 创建 collections

在创建 collection 时我们可以输入一个 pre-request 脚本，该脚本会在每个请求发送前执行。
同时也能增加 collection 级别的变量，这些变量可以在 collection 中的脚本中或其他 request
builder 块中使用。    

### 创建 monitor

创建一个 monitor 来周期性地运行 collection 来测试其性能和响应。    

![monitor](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/postman-monitor.png)    

### 创建 mock server

![mock_server](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/postman-mock-server.png)    


# Find 和 Replace

Postman 支持执行全部的搜索和替换操作，该操作可在各种组件，如 collections, environments,
globals 和 Open tabs 之间无缝工作。    

Find Replace 按钮在底栏上。   

# 发送 API 请求

可以使用以下方式创建并保存请求：   

- 工作区 build view
- New button
- 启动屏

## 捕获 HTTP 请求

postman 提供了查看和捕获网络流量的工具。可以使用应用中的内置的代理来完成这项工作。   

postman 代理可以捕获 HTTP 请求：   

1. postman 可以监听客户端发送的任何请求
2. postman 可以捕获请求然后转发请求给服务器
3. 服务器返回的响应通过 postman 代理返回给客户端    

同时，postman 代理还可拦截并捕获请求。在这种场景下，postman 就是代理，然后可以通过我们的手机
发送请求，然后在 History tab 中看到所有的网络请求。    

首先肯定要确保我们手机和电脑在同一网络下。   

然后第1步，设置 postman 代理：打开代理配置。    

![proxy](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/postman-proxy.png)    

将 target 设置为 History。这样的话所有的请求都会被捕获并存储到 History 面板中。   

然后第2步配置手机的代理。   

![proxy](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/postman-device.png)    

将 HTTP 代理的地址设置为电脑的 IP 地址，端口设置为我们第1步中配置的端口。   
