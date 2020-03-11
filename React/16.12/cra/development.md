# Development

<!-- TOC -->

- [Development](#development)
  - [配置编辑器](#配置编辑器)
    - [语法高亮](#语法高亮)
  - [分享打包尺寸](#分享打包尺寸)
  - [开发模式使用 HTTPS](#开发模式使用-https)

<!-- /TOC -->

## 配置编辑器

### 语法高亮

查看 Babel 对应的编辑器文档。    

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

## 分享打包尺寸

[Source map explorer](https://www.npmjs.com/package/source-map-explorer) 使用
source maps 分析 JS 打包文件。    

在项目中添加 source map explorer:   

```
npm install --save source-map-explorer
```    

然后在 package.json 中添加如下脚本：    


```js
"scripts": {
  "analyze": "source-map-explorer 'build/static/js/*.js'"
}
```    

然后运行即可：`npm run analyze`。   

## 开发模式使用 HTTPS

设置 HTTPS 环境变量为 `true`。   

```
HTTPS=true npm start
```   

如果不想每次使用的时候都设置这个全局变量，可以在 `.env` 文件中设置这个字段。   

Last Updated: 2020-01-20
