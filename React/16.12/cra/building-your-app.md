# Building your App

<!-- TOC -->

- [Building your App](#building-your-app)
  - [添加自定义环境变量](#添加自定义环境变量)
    - [把变量添加到 .env 文件中](#把变量添加到-env-文件中)
    - [.env 文件族](#env-文件族)
  - [PWA](#pwa)
  - [产品构建](#产品构建)

<!-- /TOC -->

## 添加自定义环境变量

默认情况下可以使用 `NODE_DEV` 变量，以及任意使用 `REACT_APP_` 的变量。   

环境变量是在构建时嵌入的。   

自定义变量必须使用 `REACT_APP_` 前缀。    

这些环境变量会定义在 `process.env` 上。    

可以在 `public/index.html` 中访问任意 `REACT_APP_` 开头的变量：   

```html
<title>%REACT_APP_WEBSITE_NAME%</title>
```    

### 把变量添加到 .env 文件中

```
REACT_APP_NOT_SECRET_CODE=abcdef
```    

### .env 文件族

- `.env`: 默认
- `.env.local`: 本地覆盖，除了 test 以外的所有环境都会加载这个文件
- `.env.development, .env.text, .env.production`: 环境特定的配置
- `.env.development.local, .env.test.local, .env.production.local`: 环境特定的本地配置

## PWA

默认情况下，构建流程会生成一个 SW 文件，但是不会注册这个 SW。    

如果想要开启离线缓存功能的话，应该可以在 index.js 中找到这样的代码：    

```js
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
```    


`workbox-webpack-plugin` 插件是集成在产品构建中，这个插件会负责生成 SW 文件。   

## 产品构建

`npm run build` 会创建一个 build 目录，其中的 static 目录中是打包的 JS 和 CSS 文件。每个
文件名会包含一个关于文件内容的 hash。    

当执行完构建后，会在 build/static/js 中生成一系列 js 文件。    

- `main.[hash].chunk.js`: 应用代码
- `[number].[hash].chunk.js`: 可能是 vendor 代码或者代码分割块代码。Vendor 代码包括从
node_modules 中导入的模块。
- `runtime-main.[hash].js`: 这个是一小段 webpack runtime 启动代码，这段代码运行加载并执行
应用。默认情况下这段代码会嵌入 index.html 中，不过可以将 INLINE_RUNTIME_CHUNK=false 设置，
就会生成单独的文件。    

Last Updated: 2020-01-20


