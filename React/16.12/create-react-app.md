# Create React App

<!-- TOC -->

- [Create React App](#create-react-app)
  - [Getting Started](#getting-started)
  - [Folder Structure](#folder-structure)
  - [支持的浏览器及功能](#支持的浏览器及功能)
  - [配置编辑器](#配置编辑器)
  - [添加 CSS Reset](#添加-css-reset)
  - [添加图片、字体和文件](#添加图片字体和文件)
  - [Public 文件夹](#public-文件夹)
  - [Code Splitting](#code-splitting)

<!-- /TOC -->

## Getting Started

```shell
npx create-react-app my-app
cd my-app
npm start
```    

打开 http://localhost:3000。    

构建 `npm run build`。    

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

只有在 `src` 目录中文件才会被 webpack 处理。   

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

## 配置编辑器

VSCode 支持开箱即用的 debug 功能，需要安装 VS Code Chrome Debugger Extension。    

然后将下面内容写在项目根目录下 `.vscode` 目录中的 `launch.json` 文件中：   

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Chrome",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src",
      "sourceMapPathOverrides": {
        "webpack:///src/*": "${webRoot}/*"
      }
    }
  ]
}
```    

然后运行 `npm start`，之后再编辑器里面按 `F5` 就行了。    

## 添加 CSS Reset

该项目使用 PostCSS Normalize 来添加 CSS Reset。   

只要在 CSS 文件添加这样一行代码即可：   

```css
@import-normalize;
```    

重复引入会被自动删除。   

## 添加图片、字体和文件

可以直接在 JS 模块中 `import` 文件。不同于 import css，`import` 一个文件会返回一个字符串。
这个字符串就是最终文件的位置，例如说图片的 `src` 属性或者 pdf 文件 `href` 链接。    

为了减少对服务器的请求，导入小于 10000 字节的图片会返回一个 data URI 而不是图片的路径。不过对
SVG 图片不生效。    

css 文件则可以这样写：   

```css
.logo {
  background-image: url(./logo.png);
}
```    

webpack 会搜索 CSS 文件中的所有相对路径引用的模块，并用其最终的路径进行替换。    


## Public 文件夹

`public` 文件夹包含我们的 html 文件。    

通常来说 `public` 文件夹的文件不会被 webpack 处理，而是原封不动的复制到 build 文件夹中。如果
要引用 `public` 文件夹中的东西，需要使用 `PUBLIC_URL` 环境变量。    

例如：    

```html
<link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
```    

当运行 `npm run build`，Create React App 会自动用正确的绝对路径替换掉 `%PUBLIC_URL%`。   

在 JS 代码中，也可以这样使用：    

```js
render() {
  // Note: this is an escape hatch and should be used sparingly!
  // Normally we recommend using `import` for getting asset URLs
  // as described in “Adding Images and Fonts” above this section.
  return <img src={process.env.PUBLIC_URL + '/img/logo.png'} />;
}
```    

## Code Splitting

通过 `import()` 支持代码分割。   