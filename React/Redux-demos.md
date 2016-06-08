# 在此处输入标题

标签（空格分隔）： 未分类

---

### 环境搭建
`npm init` 初始化node项目。

安装babel语法预设  
> npm i -D babel-preset-es2015      
> npm i -D babel-preset-react    

新建.babelrc文件
```javascript
 // .babelrc
 {
	"presets": ["es2015","react"],
	"plugins":[]
}
```

安装react， react-dom
> npm i --save react react-dom

安装webpack webpack-dev-server
> npm i -D webpack webpack-dev-server

安装ESlint和Airbnb语法规则和eslint-loader
> npm i -D eslint  
> npm i -D eslint-config-airbnb  
> npn i -D eslint-loader

默认情况下airbnb语法检测ES6和react的语法，并且要求安装eslint-plugin-import eslint-plugin-react eslint-plugin-jsx-a11y(数字11)等插件，
> npm i -D eslint-plugin-import eslint-plugin-react eslint-plugin-jsx-a11y

.eslintrc,（这里没有添加对react的检测，所以使用airbnb/base， 这种写法已被废弃， 如果只想检测ES6， 安装eslint-config-airbnb-base， 并添加"extends": "airbnb-base" 到配置文件中。

```javascript
 // .eslintrc
{
	"extends": "airbnb"
}
```

安装react HMRE
> npm i -D babel-preset-react-hmre

配置HMRE
```javascript
// .babelrc
{
  "presets" : ["es2015", "react"],
  "env": {
      "development": {
        "presets": ["react-hmre"]
      }
    }
}
```

安装各种依赖， loader， 略....

### server.js配置详解
如果不是用命令行启动webpack-dev-server， 而是使用脚本启动， 那就运行server.js， 传入环境变量值--env=dev 或者 --env = dist
```javascript
'use strict';
require('core-js/fn/object/assign');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('./webpack.config');
const open = require('open');

// 新建一个服务器， 底层应该用的是express， 第一个参数是compiler， 这里看来webpack模块， 第二个是options， 应该是针对server的配置
new WebpackDevServer(webpack(config), config.devServer)
.listen(config.port, 'localhost', (err) => {
  if (err) {
    console.log(err);
  }
  console.log('Listening at localhost:' + config.port);
  console.log('Opening your system browser...');
  open('http://localhost:' + config.port);   
});
```

### 开始内容
安装 redux
> npm i --save redux

