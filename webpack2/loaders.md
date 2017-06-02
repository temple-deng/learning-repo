# Loaders

## 1. css-loader

`css-loader` 将 css 中的 `@import` 以及 `url()` 像 `import/require()` 一样解释并处理。  

但是主要作用还是加载 CSS 文件并返回CSS代码。     

## 2. style-loader

`style-loader` 将 css 通过 `<style>`标签注入到DOM中。   

## 3. file-loader

将文件发送到输出文件夹，并返回（相对）URL。

默认情况下，生成的文件的文件名就是文件内容的 MD5 哈希值并会保留所引用资源的原始扩展名。   

```javascript
var url = require("file-loader!./file.png");
// => 输出 file.png 文件到输出目录并返回public url
// => 即返回 "/public-path/0dcbbaa701328a3c262cfd45869e351f.png"
```

## 4. url-loader

工作方式类似于 `file-loader`，但是如果文件小于一定尺寸，可以返回一个 data URL。    

可以通过传递查询参数(query parameter)来指定限制（默认为不限制）。   

如果文件大小超过限制的大小，将转为使用 file-loader，所有的查询参数也会透传过去。    

```javascript
require("url-loader?limit=10000!./file.png");
// => 如果 "file.png" 大小低于 10kb 将返回 data URL

require("url-loader?mimetype=image/png!./file.png");
// => 指定文件的 mimetype（否则会用文件后缀推测）

require("url-loader?prefix=img/!./file.png");
// => file-loader 的参数也有效，如果被使用它们将被传递给 file-loader
```    
