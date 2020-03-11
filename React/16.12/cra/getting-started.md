# Getting Started

<!-- TOC -->

- [Getting Started](#getting-started)
  - [Getting Started](#getting-started-1)
    - [补充知识 npm init](#补充知识-npm-init)
  - [Folder Structure](#folder-structure)
  - [可用的脚本](#可用的脚本)
  - [支持的浏览器及功能](#支持的浏览器及功能)
  - [更新版本](#更新版本)

<!-- /TOC -->

首先需要注意的一点是，cra 是一个创建 SPA 的工具，所以如果创建多页应用的话可能需要调整。  

## Getting Started

```shell
npx create-react-app my-app
cd my-app
npm start
```    

如果之前全局安装过 `create-react-app` 比如说 `npm install -g create-react-app`，建议先
卸载掉 `npm uninstall -g create-react-app`，以确保 npx 使用的是最新的版本。   

打开 http://localhost:3000。    

构建 `npm run build`。    

my-app 中项目的 package.json 文件差不多类似这样：   


```json
{
  "name": "new-app",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@testing-library/jest-dom": "^4.2.4",
    "@testing-library/react": "^9.4.0",
    "@testing-library/user-event": "^7.2.1",
    "react": "^16.12.0",
    "react-dom": "^16.12.0",
    "react-scripts": "3.3.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": "react-app"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```   

还有一种创建应用的方式：    

```bash
npm init react-app my-app
```    

### 补充知识 npm init

创建一个 package.json 文件。这应该是最基本的功能。   

```shell
npm init [--force|-f|--yes|-y|--scope]

npm init <@scope> 等同于 npx <@scope>/create

npm init [<@scope>/]<name>  等同于 npx [<@scope>/]create-<name>
```     

`npm init <initializer>` 可以用来设置一个新建的或者已存在的 npm 包。这种情况下，`initializer`
是一个名为 `create-<initializer>` 的 npm 包，会使用 npx 安装，然后执行其二进制文件。然后
创建或更新 package.json 文件，并执行其他的初始化操作。   



## Folder Structure

默认的目录结构：  

```
my-app/
  README.md
  node_modules/
  package.json
  public/
    index.html
    favicon.ico
  src/
    App.css
    App.js
    App.test.js
    index.css
    index.js
    logo.svg
```    

如果要构建应用，`public/index.html` 和 `src/index.js` 这两个文件必须存在，一个是页面模板，
一个是 JS 入口点。   

只有在 `src` 目录中文件才会被 webpack 处理。因此所有的 JS 和 CSS 文件都应该放在 src 目录下。  

只有在 `public` 中的文件可以从 `publci/index.html` 访问。   

## 可用的脚本

- `npm start`: 开发模式启动应用，在 `http://localhost:3000` 访问。
- `npm test`
- `npm run build`: 构建应用到 `build` 文件夹中。
- `npm run eject`: 如果我们对默认的构建工具和配置选项不满意，可以随时取消掉。这个命令会把
单独的构建依赖移除掉。    

同时，这个命令会把所有的配置文件和转换性的依赖拷贝到项目中和 `package.json` 中。

## 支持的浏览器及功能

IE9, 10, 11 需要使用 ployfill 支持，应该是使用 react-app-ployfill 这个库。   

这个项目默认不包含任何 ployfill，所有如果我们使用了一些运行时支持的功能，需要手动引入 ployfill，
好像还是上面的那个 react-app-ployfill 库。    

默认情况下，生成的项目会在 `package.json` 文件中生成 `browserslist` 来控制支持的浏览器。  

```json
"browserslist": {
  "production": [
    ">0.2%",
    "not dead",
    "not op_mini all"
  ],
  "development": [
    "last 1 chrome version",
    "last 1 firefox version",
    "last 1 safari version"
  ]
}
```     

## 更新版本

CRA 是分成了两个包：    

- `create-react-app`: 是一个全局的命令行工具，用来创建新的项目
- `react-scripts`: 是一个生成的项目中的开发依赖

一般来说更新的时候，更新一下 `react-scripts` 包就行，不放心的话就会看一下 changelog。    


Last Updated: 2020-01-20

