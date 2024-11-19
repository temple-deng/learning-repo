# Loaders

<!-- TOC -->

- [Loaders](#loaders)
  - [1. css-loader](#1-css-loader)
    - [1.1 配置项](#11-配置项)
  - [2. style-loader](#2-style-loader)
    - [2.1 Url](#21-url)
    - [2.2 配置项](#22-配置项)
    - [2.3 transform 和 condition](#23-transform-和-condition)
    - [2.4 insertAt, insertInto](#24-insertat-insertinto)
  - [3. file-loader](#3-file-loader)
    - [3.1 配置项](#31-配置项)

<!-- /TOC -->

## 1. css-loader

css-loader 主要是提供了对 css 文件中的 `@import` 和 `url()` 的解释功能，使其可以向常规
的 js 的 `import/require()` 被 webpack 解析，并提供了对模块的定位。    

除了使用 `style-loader` 或者输出 css 文件外，还可以将 css-loader 的结果当成是一个字符串。   

### 1.1 配置项


名称 | 类型 | 默认值 | 描述
---------|----------|---------|---------
 `url` | Bool | `true` | 启用/禁用 `url()` 的处理
 `import` | Bool | `true` | 启用/禁用对 `@import` 的处理
 `modules` | Bool | `true` | 启用/禁用 CSS Modules
 `localIdentName` | String | `[hash:base64]` | 配置生成的 ident
 `sourceMap` | Bool | `false` | 
 `camelCase` | Bool or String | `false` | 导出类名为驼峰写法
 `importLoaders` | Number | `0` | 在 CSS loader 之前使用的 loaders 的数量

## 2. style-loader

将 CSS 通过注入 `<style>` 标签添加到 DOM 中。   

### 2.1 Url

我们可以通过添加一个 `<link href="path/to/file.css" rel="stylesheet">` 而不是内联
将 CSS 字符串内联到 `<style>` 标签中然后注入到 DOM 中。   

```js
import url from 'file.css';
```    

**webpack.config.js**    

```js
{
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: "style-loader/url" },
          { loader: "file-loader" }
        ]
      }
    ]
  }
}
```   

这个好像是要搭配导出 css 文件使用的，但是还没弄懂怎么用，而且注意 `url` 不是配置项，必须写成
`style-loader/url` 的形式。   


### 2.2 配置项

名称 | 类型 | 默认值 | 描述
---------|----------|---------|---------
 `hmr` | Bool | `true` | 启用 / 禁用 HMR
 `base` | Num | `true` | 设置模块 ID base(DllPlugin)
 `attrs` | Obj | `{}` | 给 `<style>` 添加自定义属性
 `transform` | Func | `false` | 通过一个函数来转换或者条件加载 CSS
 `insertAt` | String or Obj | `bottom` | `<style>` 的插入位置
 `insertInto` | Str or Func | `<head>` | 插入到给定位置
 `singleton` | Bool | `undefined` | 就插入一个 `<style>` 而不是每个模块生成一个
 `sourceMap` | Bool | `false` | 
 `convertToAbsoluteUrls` | Bool | `false` | 当启用 sourceMap 时，将相对地址转换为绝对地址

### 2.3 transform 和 condition

`transform` 会将加载的 css 作为参数传入，然后其返回值会加载到页面中而不是原始的 css。    

**webpack.config.js**    

```js
{
  loader: 'style-loader',
  options: {
    transform: 'path/to/transform.js'
  }
}
```    

**transform.js**    

```js
module.exports = function(css) {
  const transfromed = css.replace('.clasNameA', '.classNameB');

  return transformed;
}
```    

**conditional**    

```js
module.exports = function(css) {
  // 如果条件匹配就会加载 css
  if (css.includes('someing I want to check')) {
    return css;
  }

  // 如果返回假值，就什么都不加载
  return false
}
```    

### 2.4 insertAt, insertInto

`insertAt` 可以是 `bottom`，`top`。如果是一个对象的话，会插入到指定的元素之前：   

```js
{
  loader: 'style-loader',
  options: {
    insertAt: {
      before: '#id',
    }
  }
}
```   

不对，那应该也可以使用 after。    

`insertInto` 如果是字符串，就是一个 CSS 选择器，函数的话就返回一个 DOM 元素。    

## 3. file-loader

### 3.1 配置项

名称 | 类型 | 默认值 | 描述
---------|----------|---------|---------
 `context` | str | `context` | 自定义文件上下文，这个应该是那个搜索文件的相对路径的目录吧
 `emitFile` | bool | `true` | 如果是 `true` 就生成文件，否则 loader 返回一个 public URL，但是不生成文件
 `name` | str or func | `[hash].[ext]` | 
 `outputPath` | str or func | `undefined` | 指定输出文件的放置位置咯，注意以 `/` 结尾
 `publicPath` | str or func | `__webpack_public_path__` | 
 `regExp` | regExp | `undefined` | 用来捕获文件路径，然后在 `name` 中使用
 `useRelativePath` | bool | `false` | 是否生成的是相对 URI
 
Last Update: 2018-11-08
