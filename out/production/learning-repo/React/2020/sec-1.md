# 2020-05-27

version: 16.13.1    

cra version: 3.4.1

<!-- TOC -->

- [2020-05-27](#2020-05-27)
- [cra 的内容](#cra-的内容)
  - [Getting Started](#getting-started)
    - [文件结构：](#文件结构)
    - [支持度](#支持度)
  - [Development](#development)
    - [编辑器设置](#编辑器设置)
    - [分析打包文件](#分析打包文件)
  - [样式和静态资源](#样式和静态资源)
    - [使用 reset](#使用-reset)
    - [引入图片，字体和文件](#引入图片字体和文件)
    - [使用 public 目录](#使用-public-目录)
    - [代码分割](#代码分割)
  - [构建 App](#构建-app)
    - [import](#import)
    - [添加环境变量](#添加环境变量)
    - [production 构建](#production-构建)
  - [测试](#测试)
    - [执行测试](#执行测试)
  - [后端集成](#后端集成)
    - [代理](#代理)

<!-- /TOC -->


# cra 的内容

## Getting Started

### 文件结构：   

- `public/index.html` 是页面模板
- `src/index.js` 是入口点    

只有 src 目录下的文件会被 webpack 编译。只有 `public` 目录中的文件可以被 index.html 直接使用。   

差不多 eject 就做了这些事：    

```
Copying files into /Users/dengbo01/owner/github/cra-app
  Adding /config/env.js to the project
  Adding /config/getHttpsConfig.js to the project
  Adding /config/modules.js to the project
  Adding /config/paths.js to the project
  Adding /config/pnpTs.js to the project
  Adding /config/webpack.config.js to the project
  Adding /config/webpackDevServer.config.js to the project
  Adding /config/jest/cssTransform.js to the project
  Adding /config/jest/fileTransform.js to the project
  Adding /scripts/build.js to the project
  Adding /scripts/start.js to the project
  Adding /scripts/test.js to the project

Updating the dependencies
  Removing react-scripts from dependencies
  Adding @babel/core to dependencies
  Adding @svgr/webpack to dependencies
  Adding @typescript-eslint/eslint-plugin to dependencies
  Adding @typescript-eslint/parser to dependencies
  Adding babel-eslint to dependencies
  Adding babel-jest to dependencies
  Adding babel-loader to dependencies
  Adding babel-plugin-named-asset-import to dependencies
  Adding babel-preset-react-app to dependencies
  Adding camelcase to dependencies
  Adding case-sensitive-paths-webpack-plugin to dependencies
  Adding css-loader to dependencies
  Adding dotenv to dependencies
  Adding dotenv-expand to dependencies
  Adding eslint to dependencies
  Adding eslint-config-react-app to dependencies
  Adding eslint-loader to dependencies
  Adding eslint-plugin-flowtype to dependencies
  Adding eslint-plugin-import to dependencies
  Adding eslint-plugin-jsx-a11y to dependencies
  Adding eslint-plugin-react to dependencies
  Adding eslint-plugin-react-hooks to dependencies
  Adding file-loader to dependencies
  Adding fs-extra to dependencies
  Adding html-webpack-plugin to dependencies
  Adding identity-obj-proxy to dependencies
  Adding jest to dependencies
  Adding jest-environment-jsdom-fourteen to dependencies
  Adding jest-resolve to dependencies
  Adding jest-watch-typeahead to dependencies
  Adding mini-css-extract-plugin to dependencies
  Adding optimize-css-assets-webpack-plugin to dependencies
  Adding pnp-webpack-plugin to dependencies
  Adding postcss-flexbugs-fixes to dependencies
  Adding postcss-loader to dependencies
  Adding postcss-normalize to dependencies
  Adding postcss-preset-env to dependencies
  Adding postcss-safe-parser to dependencies
  Adding react-app-polyfill to dependencies
  Adding react-dev-utils to dependencies
  Adding resolve to dependencies
  Adding resolve-url-loader to dependencies
  Adding sass-loader to dependencies
  Adding semver to dependencies
  Adding style-loader to dependencies
  Adding terser-webpack-plugin to dependencies
  Adding ts-pnp to dependencies
  Adding url-loader to dependencies
  Adding webpack to dependencies
  Adding webpack-dev-server to dependencies
  Adding webpack-manifest-plugin to dependencies
  Adding workbox-webpack-plugin to dependencies

Updating the scripts
  Replacing "react-scripts start" with "node scripts/start.js"
  Replacing "react-scripts build" with "node scripts/build.js"
  Replacing "react-scripts test" with "node scripts/test.js"

Configuring package.json
  Adding Jest configuration
  Adding Babel preset

Running npm install...
audited 1663 packages in 16.031s
found 1 low severity vulnerability
  run `npm audit fix` to fix them, or `npm audit` for details
Ejected successfully!
```    

eject 意即弹出，将内部隐藏的各种构建工具和配置项变得透明可见，相当于把 react-scripts 内置的
功能暴露出来。    

### 支持度

对 IE9, 10, 11 的支持需要添加 ployfill，cra 不包含任何 ployfill，由 react-app-ployfill 提供，
安装 `npm i react-app-ployfill`，然后在入口点文件起始处引入：   


```js
import 'react-app-ployfill/ie9';
```    

其他的 ployfill 需要引入这个文件，cra 会根据 browserslist 配置自动判断要引入哪些所需的 ployfill
功能：    

```js
import 'react-app-ployfill/stable';
```     

## Development

### 编辑器设置

```
$ npm install --save husky line-staged prettier
```   

- `husky` 可以让 githooks 像 npm scripts 一样使用
- `lint-staged` 对已暂存文件运行脚本    

在 package.json 中添加如下字段：    

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "src/**/*.{js,jsx,ts,tsx,json,css,scss,md}": [
      "prettier --write"
    ]
  }
}
```    

怎么办到的？为什么 git commit 的钩子会涉及到 package.json 中的配置呢，是怎么知道呢？   

[git hook 的知识](https://github.com/temple-deng/learning-repo/blob/c06521076c81b0c68cf403e6e02b6c71ec51e308/git/git-book-part2.md#%E7%AC%AC-15-%E7%AB%A0-%E9%92%A9%E5%AD%90)    

推断应该是安装 husky 的时候有脚本对 git hook 做了手脚，添加了所有 hook，然后每次 git 操作的
时候都运行执行 husky 检查各个阶段的 hook，但是在 husky 的代码库里没找到对应的 npm 安装后的脚本。   

### 分析打包文件

source-map-explorer 使用 source map 分析 JS 包。    

```
$ npm install --save source-map-explorer
```    

然后添加脚本：   

```json
{
  "scripts": {
    "analyze": "source-map-explorer 'build/static/js/*.js'"
  }
}
```     

## 样式和静态资源

声明样式依赖：   

```js
import './Button.css';
```   

最终所有的 css 都被拼接成一个单一的压缩过的 css 文件中。   

安装了 node-sass 后就可以支持 sass 文件。   

### 使用 reset

在 css 中添加如下代码：    

```css
@import-normalize
```    

可以随意添加多次，但最终变异后只保留移除，使用的是 PostCSS Normalize。   

工具内置了 autoprefixer，貌似也支持 css next。    

### 引入图片，字体和文件

可以像 CSS 一样在 JS 声明对文件的依赖，不同于 CSS import，文件最终 import 的值是一个字符串，
即文件最终的路径。    

webpack 会对 CSS 中所有的相对模块引用（以 `./` 起始）进行处理，用最终的路径替换掉这些引用。   

还有一种引入 SVG 的方式：   

```jsx
import {ReactComponent as Logo} from './logo.svg';

function App() {
  return (
    <div>
      <Logo />
    </div>
  );
}
```   

### 使用 public 目录

可以直接在模块系统外的 public 目录中添加文件，这个地方的文件不会被 webpack 处理，会原封不动的
移动到构建后的目录中。引用 public 目录中的文件时，需要使用 `PUBLIC_URL` 变量：   

```html
<link rel="icon" href="%PUBLIC_URL/favicon.ico%" />
```    

在 JS 代码中，同样可以使用类似的写法引用 public 中的文件：    

```js
render() {
  return <img src="{process.env.PUBLIC_URL + '/img/logo.png'}" />
}
```    

### 代码分割

使用 `import()` 函数进行代码分割：   

```js
import React, {Component} from 'react';

class App extends Component {
  handleClick = () => {
    import('./moduleA')
      .then(({moduleA}) => {

      })
      .catch(err => {

      })
  }

  render() {
    return (
      <div>
        <button onClick="{this.handleClick}">Load</button>
      </div>
    )
  }
}
```   

moduleA.js   

```js
const moduleA = 'hello';

export {moduleA};
```

moduleA.js 及其独立的依赖（注意是独立）将会打包到一个 chunk 中。     

## 构建 App

### import    

通过配置可以支持 import 一个绝对路径。配置文件是项目根目录的 jsconfig.json 或 tsconfig.json。    

```json
{
  "compilerOptions": {
    "baseUrl": "src"
  },
  "include": ["src"]
}
```    

当配置了绝对路径后，假如想引用 `src/components/Button.js`，可以这样写：   

```js
import Button from 'components/Button';
```    

他们管这叫绝对路径引用？？？？     

### 添加环境变量

项目中可以像使用本地变量一样使用环境变量，默认定义了 `NODE_ENV`，剩下其他的环境变量都
必须以 `REACT_APP_` 开头。    

所有定制的环境变量都挂载在 `process.env` 命名空间上。    

`NODE_ENV` 变量是由工具设置的，会在每次运行构建指令时设置，用户无法手动覆盖。    

除了在 JS 中，在 public/index.html 中也可以使用这些变量：   

```html
<title>%REACT_APP_WEBSITE_NAME%</title>
```     

定义变量的方式之一 —— `.env` 文件    

```
REACT_APP_NOT_SECRET_CODE=abcdef
```     

`.env` 文件有好几种：   

- `.env`: 默认的
- `.env.local`: 本地用来覆盖的，除了 test 以外的指令都会加载这个文件
- `.env.development`, `.env.test`, `.env.production`: 构建目标特定的设置
- `.env.development.local`, `.env.test.local`, `.env.production.local`: 本地构建
目标特定的设置     

优先级从左到右降低：    

- `npm start`: `.env.development.local`, `.env.development`, `.env.local`, `.env`
- `npm run build`: `.env.production.local`, `.env.production`, `.env.local`, `.env`
- `npm test`: `.env.test.local`, `.env.test`, `.env`      

### production 构建

执行完构建后，会在 `build/static/js` 目录中生成几个 js 文件：    

- `main.[hash].chunk.js` - 这是应用代码 chunk
- `[number].[hash].chunk.js` - 这些文件可能是 vendor 代码，也可能是代码分割出来的 chunk。
vendor 代码包括从 `node_modules` 中导入的模块
- `runtime-main.[hash].js` - 这是 webpack runtime 代码的一个 chunk。默认情况下这个文件内容
会内嵌到 build/index.html 文件中以节省网络请求。可以设置 `INLINE_RUNTIME_CHUNK=false`变量
将这个文件提取出来。     

## 测试

### 执行测试

cra 使用 Jest 作为单元测试的框架。有以下文件名特征的文件会被视为测试文件：   

- `__tests__` 目录中的 `.js` 文件
- `.test.js` 文件
- `.spec.js` 文件    

当执行 `npm test` 后，Jest 处于 watch 模式。    

默认情况下，Jest 只会运行上提交后有变动代码文件相关联的测试。按 a 键强制运行所有测试。    

## 后端集成

### 代理

开发服务器代理未知的请求，在 `package.json` 文件添加 `proxy` 字段：    

```json
"proxy": "http://localhost:4000"
```     

配置完成了，当我们使用 `fetch('/api/todos')` 请求数据时，开发服务器会识别出这个非静态资源请求
将其代理到 `http://localhost:4000/api/todos`。    

如果这种配置满足不了，还可以直接访问 Express 应用添加代理中间件。具体做法是新建一个 `src/setupProxy.js`
文件，安装 `http-proxy-middleware`。     

```js
const {createProxyMiddleware} = require('http-proxy-middleward');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      chageOrigin: true
    })
  );
};
```     

