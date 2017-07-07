# NPM(5.0.3)

## Getting Started


### 更新 npm

`npm install npm@latest -g`   

### Using a package.json

一个 package.json 至少要有下面的字段：   

+ "name"
  - 全部小写
  - 一个单词，不能有空格
  - 可以有中划线和下划线
+ "version"
  - x.x.x 的形式
  - 遵守 semver 规范   

`npm init --yes` or `npm init -y`跳过提问阶段创建 package.json 文件。依赖于当前目录的信息填写一些内容。   

##### 定制 init 流程

可以通过一个 .npm-init.js 文件来定制 init 流程中的信息及问题。默认情况下，npm 会使用用户主目录中的
文件 `~/.npm-init.js`    

一个简单的 .npm-init.js 文件可能看起来像下面这样：   

```javascript
module.exports = {
  customField: 'Custom Field',
  otherCustomField: 'this field is really cool'
}
```   

使用这个文件来运行 `npm init`，会得到一个如下的package.json 文件：   

```json
{
  "customField": "Custom Field",
  "otherCustomField": "This field is really cool"
}
```    

定制问题需要使用 `prompt` 函数：   

`module.exports = prompt("what's your favorite flavor of ice cream buddy?", "I LIKE THEM ALL");`   

### 更新本地包

在 package.json 所在目录运行 `npm update`。    

### 卸载本地包

`npm uninstall <package>` 可以加 --save 或者 --save-dev 从 package.json 中移除对应的包信息。   

### 更新全局包

`npm update -g <package>`   

更新所有全局包 `npm update -g`   

### 卸载全局包

`npm uninstall -g <package>`   

### 发布 npm 包

可以发布任意包含一个 package.json文件的目录。　　　

要想发布包，必须在 npm 仓库有一个账号 user。可以使用 `npm adduser` 新建一个。如果是在网站上
创建了一个账户，使用 `npm login` 存储账户信息。    

使用 `npm publish` 发布包。除了在本地 .gitignore or .npmignore 中忽视的文件，目录中其余的
东西都会包含进去。    

当我们想更新包时，使用 `npm version <update_type>`，update_type 应该就是版本号，这个命令会
修改 package.json 文件里的版本号。之后再使用 `npm publish` 发布。   

### Working with scoped packages

Scopes 与命名空间类似。如果包的名字以 @ 开头，这就是个范围包。范围就是@与斜线/之间的东西。   

@scope/project-name   

每个npm 用户都有其自身的范围：   

@username/project-name   

直接在包名前加上范围，就可以创建一个范围包：    

```json
{
  "name": "@username/project-name"
}
```    

如果使用 `npm init`，可以添加scope 参数在命令行中：   

`npm init --scope=username`    

如果我们希望一直使用相同的范围，可以直接在 .npmrc 中配置：   

`npm config set scope username`   

范围包默认是私有的。如果想要发布私有模块，需要成为付费的私有模块用户。    

不过，发布范围模块时免费的。设置 `npm publish --access=public`，则这个范围模块就是公共的。   

使用范围包时也需要在包名前添加范围。    

安装时： `npm install @username/project-name --save`    

加载时： `var projectName = require("@username/project-name")`     

## How npm works

### packages and modules

一个包 package 是指一个由 package.json 描述的文件或目录。一个模块 module 指的是任意可以用 `require()`
加载的文件或目录。   

##### 什么是包

一个包可以是下面的形式：   

+ a) 一个包含由package.json文件描述的程序的文件夹
+ b) 一个 gzip 压缩的 tarball 包，其中包含了(a)
+ c) 一个(b) 中包的 url 地址
+ d) 使用 &lt;name&gt;@&lt;version&gt;在仓库中发布(c)
+ e) 指向(d) 的 &lt;name&gt;@&lt;tag&gt;
+ f) 一个使用了 latest 标签的 &lt;name&gt;
+ g) 一个 git url 地址，当克隆时，返回(a)   

##### 什么是模块

模块就是可以使用 `require()`加载的东西。下面是一些可能被加载为模块的东西：   

+ 一个包含 package.json 文件的文件夹，并且 package.json 文件有 main 字段
+ 一个包含 index.js 文件的文件夹
+ 一个 JS 文件

## Using npm

### npm-config

npm 从下面的来源中获取其配置值，按照优先级排序：   

+ 命令行标识：在命令行中设置 `--foo bar` 会将配置参数 foo 的值设为 "bar"，一个 `--` 参数
告诉 cli 解析器停止读取标识，一个在命令行尾部的 `--flag` 参数值为 true。
+ 环境变量： 任何以 npm_config_ 开头的环境变量都会被视为配置参数。任何没有赋值的环境配置值
被视作 true。配置是大小写不敏感的，所以 NPM_CONFIG_FOO=bar 与 npm_config_foo=bar 视作相同的。
不过注意在package.json中的 scripts 设置的环境变量尽量设为小写的。   
+ npmrc 文件：有4个相关的文件：   
  - 每个项目中的配置文件(/path/to/my/project/.npmrc)
  - 每个用户的配置文件（默认是 $HOME/.npmrc，可以通过 --userconfig 或者环境变量 $NPM_CONF_USERCONFIG 配置）
  - 全局配置文件（默认是 $PREFIX/etc/npmrc，可以通过 --globalconfig 或者环境变量 $NPM_CONFIG_GLOBALCONFIG 配置）
  - npm 内置的配置文件（/path/to/npm/npmrc）

+ 默认配置：使用 `npm config ls -l` 查看npm内部的配置参数


缩写的命令行参数：   

+ -v: --version
+ -h, -?, --help, -H: --usage
+ -s, --silent: --loglevel silent
+ -q, --quiet: --loglevel warn
+ -d: --loglevel info
+ -dd, --verbose: --loglevel verbose
+ -ddd: --loglevel silly
+ -g: --global
+ -C: --prefix
+ -l: --long
+ -m: --message
+ -p, --porcelain: --parseable
+ -reg: --registry
+ -f: --force
+ -desc: --description
+ -S: --save
+ -P: --save-prod
+ -D: --save-dev
+ -O: --save-optional
+ -B: --save-bundle
+ -E: --save-exact
+ -y: --yes
+ -n: --yes false
+ ll and la: ls --long  

### developers

使用 .npmignore 文件忽视包中的文件。如果没有 .npmignore 文件，但是有 .gitignore 文件，
npm 也会忽视 .gitignore 匹配的文件。npm 及 git 也会在包中的子目录寻找这两个文件。    

默认情况下，下面的文件和路径会被忽视：   

+ .\*.swp
+ .\_*
+ .DS_Store
+ .git
+ .hg
+ .npmrc
+ .lock-wscript
+ .svn
+ .wafpickle-*
+ config.gypi
+ CVS
+ npm-debug.log

其次， node_modules 中的东西都会被忽视。下面的文件及目录永远不会被忽视：   

+ package.json
+ README (and its variants)
+ CHANGELOG (and its variants)
+ LICENSE / LICENCE   

### run-script

```shell
npm run-script <command> [-- <args>...]

alias: npm run
```   

这会运行 "scripts" 对象中的任意命令。如果 "command" 不存在，这个命令会列出可用的脚本。
run[-script] 会被test，start，restart，stop命令使用，但是可以直接调用。   

除了 shell 中已经存在的 PATH, `npm run` 还会将 node_modules/.bin 添加到 PATH 中，任何本地安装
的依赖提供的二进制文件可以直接使用而不用添加 node_modules/.bin 前缀。例如，当前依赖包含 tap，可以
直接写 `"scripts": { "test": "tap test/\*.js" }`。而不是 `"scripts": { "test": "node_modules/.bin/tap test/\*.js"}` 来运行测试。    





## 补充

```json
{
  "name": "myproject",
  "devDependencies": {
    "jshint": "latest",
    "browserify": "latest",
    "mocha": "latest"
  },
  "scripts": {
    "lint": "jshint **.js",
    "test": "mocha test/"
  }
}
```   

如果我们运行 `npm run lint` - npm 会打开一个子shell然后执行 `jshint **.js`。如果运行 `npm run test`, npm 会打开一个子shell然后运行 `mocha test/`。

### pre 和 post 钩子

任何执行的脚本可以有一系列 `pre-` 和 `post-` 钩子。例如我们执行 `npm run lint` 时，会先执行
`npm run prelint`, 之后是 `npm run lint`，然后是 `npm run postlint`。pre 和 post 脚本也是
对于退出码敏感的，意味着，如果 pretest 脚本退出码不为0，NPM会立即停止，不会再执行 test 和 posttest。
