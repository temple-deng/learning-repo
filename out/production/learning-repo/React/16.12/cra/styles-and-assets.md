# Styles and Assets

<!-- TOC -->

- [Styles and Assets](#styles-and-assets)
  - [添加样式表](#添加样式表)
  - [Sass 支持](#sass-支持)
  - [添加 CSS Reset](#添加-css-reset)
  - [添加图片、字体和文件](#添加图片字体和文件)
  - [Public 文件夹](#public-文件夹)
  - [Code Splitting](#code-splitting)

<!-- /TOC -->

## 添加样式表

```js
import React, {Component} from 'react';
import './Button.css';
```    

在开发模式，这样写的话，每次修改 CSS 后会重新加载 CSS，在产品模式下，所有的 CSS 文件会拼接到
一起，生成一个单一的 CSS 文件。   

## Sass 支持

需要安装 node-sass。   

如果想在 Sass 文件间共享变量，可以使用 sass imports：   

```css
@import 'styles/_colors.scss';   // 假设 src 下有一个 styles 目录
@import '~nprogress/nprogress';   // 从 nprogress node 模块中导入 css 文件
```    

node-sass 支持 `SASS_PATH` 变量。   

如果想要从我们指定的路径导入，或者在不加 `~` 前缀的情况下从 `node_modules` 中导入，可以在
`.env` 文件中添加 `SASS_PATH=node_modules:src`。    


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

Last Updated: 2020-01-20   
