# npm

<!-- TOC -->

- [npm](#npm)
  - [指南](#指南)
  - [npm-config](#npm-config)
    - [命令行标识](#命令行标识)
    - [环境变量](#环境变量)
    - [npmrc 配置文件](#npmrc-配置文件)
    - [默认配置](#默认配置)
    - [命令行简写](#命令行简写)
    - [包配置](#包配置)
    - [部分配置项](#部分配置项)
  - [npm-developer](#npm-developer)
  - [npm-scripts](#npm-scripts)
  - [语义化版本](#语义化版本)
  - [npm-run-script](#npm-run-script)
  - [npm-link](#npm-link)
  - [npm folders - Folder Structures Used by npm](#npm-folders---folder-structures-used-by-npm)
    - [prefix Configuration](#prefix-configuration)
    - [Node Modules](#node-modules)
    - [Executables](#executables)
    - [Man Pages](#man-pages)
    - [Cache](#cache)
    - [Temp Files](#temp-files)
    - [More Information](#more-information)
  - [package-lock.json](#package-lockjson)
  - [package-locks - An explanation of npm lockfiles](#package-locks---an-explanation-of-npm-lockfiles)
  - [package.json](#packagejson)
  - [npx](#npx)

<!-- /TOC -->

## 指南

1. `npm login` 登录，`npm whoami` 查看当前登录的账号
2. `package.json` 至少要有 `name`, `version` 两个字段：
  - `name`: 全小写字母，一个单词不能有空格，可以有中划线和下划线
  - `version`: x.x.x 的形式，遵循语义化版本规范
3. `--save-prod`（默认），`--save-dev`
4. 更新本地包 `npm update`，查看当前项目过期包 `npm outdated`
5. 删除本地包 `npm uninstall <package>` 加 `--save` 或 `--save-dev` 同时从 `package.json`
中移除依赖
6. 更新全局包 `npm update -g <package>`，或者直接 `npm update -g`，查看过期的全局包
`npm outdated -g --depth=0`
7. 卸载全局包 `npm uninstall -g <package>`
8. `npm publish` 发布，不过记得要先登录才行，如何更新版本呢 `npm version <update-type>`
其实这个命令应该就只是修改 `package.json` 的 `version` 字段，不过如果我们将一个 git
仓库和 npm 账号关联起来的话，这个命令还会在 git 仓库中打上一个版本的 tag。更新完版本
后，再发布一次即可 `npm publish`
9. 一些语义化版本的建议，当只是做向后兼容的 bug fix 时，修改 patch 部分，当添加了向后
兼容的新功能后，修改 minor 部分，当进行了不兼容的大调整时，修改 major 部分。
10. 默认情况下，scoped package 是私有模块，发布要收钱，如果要改成公有的 scoped module，
要加 --access 选项 `npm publish --access=public`，注意只有在第一次发布的时候需要加
这个选项，后续的更新部分就不用再重复指定了。
11. distribution tags(dist-tags) 是对语义化版本的一种有效补充，可以为不同的版本添加一种
额外的可读的版本信息。`npm dist-tag add <pkg>@<version> [<tag>]` 为特定版本的包打 tag。
默认情况下，`npm publish` 会给包打上 `latest` tag。如果使用 `--tag` 选项，可以指定使用
其他的 tag。`npm publish --tag beta`
12. 所以一直使用的 latest 是包的 tag 啊，`npm install <pkg>@<tag>` 安装特定 tag 的包。
13. 什么是一个包 package:
  - a) 一个包含 `package.json` 文件描述的程序的文件夹
  - b) 一个包含 a) 的使用 gzip 压缩的 tarball
  - c) 一个可以定位到 b) 地址 url
  - d) 一个使用 c) 发布到一个注册中心的 `<name>@<version>`
  - e) 一个指向 d) 的 `<name>@<tag>`
  - f) 一会满足 e) 的 `<name>@latest`
  - g) 一个 git url，这个仓库包含 a) 的内容
14. 什么是一个模块 module 呢？任何可以在 Node 程序可以被 `require()` 加载的东西都能叫
模块：
  - 一个包含 `package.json` 的文件夹，`package.json` 包含 `main` 字段
  - 一个带有 `index.js` 文件的文件夹
  - 一个 js 文件
15. 安装全局包时出现 EACCES 错误，可以通过修改 npm 安装的目录来规避：
  - 使用 Node 版本管理器重新安装 npm
  - 或者手动修改 npm 默认目录（Windows 下不可用）
16. `npm audit` 会将我们项目配置的依赖信息提交给默认配置的 npm registry，并要求返回一份
已知的漏洞的报告，依赖项包括 `dependencies, devDependencies, bundledDependencies, optionalDependencies`
但不包含 `peerDependencies`。我们使用 `npm install` 安装包时会自动运行 `npm audit`。
17. 当发现了安全漏洞，并且已经有修复后的更新时，我们有两种做法：
  - 运行 `npm audit fix` 指令自动安装更新
  - 手动安装更新


## npm-config

npm 从以下四部分来源获取其配置参数，优先级从高到低：   

1. 命令行标识 flags
2. 环境变量
3. npmrc 配置文件
4. 默认配置

### 命令行标识

`--foo bar` 意味着将配置项 foo 的值设置为 bar。`--` 告诉命令行解析器停止读取 flags。
如果使用了 `--flag` 但是不指定任何值，那 flag 的值就是 `true`。    

### 环境变量

任何以 `npm_config_` 开头的环境变量都被认为是一个配置参数。例如 `npm_config_foo=bar`
会将配置 `foo` 的值设为 `bar`，同理，任何没设置值的这样的配置参数，值就被设为 true。
这样的配置值是大小写不敏感的，所以 `NPM_CONFIG_FOO=bar` 也可以正常工作。    

### npmrc 配置文件

+ 项目配置文件 (/path/to/my/project/.npmrc)
+ 用户配置文件 ( $HOME/.npmrc)
+ 全局配置文件 ($PEXFIX/etc/npmrc)
+ npm 内置的配置文件 (/path/to/npm/npmrc)    

### 默认配置

`npm config ls -l`    

### 命令行简写

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

### 包配置

当执行 npm script 的时候，`package.json` 中的 `config` 中的键会覆盖当前环境中的配置，
如果这个键及其值是这样的形式 `<name>[@<version>]: <key>`，例如：   

```json
{
  "name": "foo",
  "config": {
    "port": "8080"
  },
  "scripts": {
    "start": "node server.js"
  }
}
```   

server.js:   

`http.createServer(...).listen(process.env.npm_package_config_port)`    

### 部分配置项

+ save-bundle: 如果安装包时候使用了 `--save, --save-dev, --save-optional`，那么也会
放置到 `bundleDependencies` 列表中。那相当于我们如果启用了这个选项，那以后安装包就会
在 `package.json` 中多加 `bundleDependencies` 字段
+ save-exact: 使用 `--save, --save-dev, --save-optional` 安装包时会使用精确的版本，
而不是默认的语义化的范围操作符   

## npm-developer

1. `.npmignore`, `.gitignore`，默认情况下以下文件会被忽视，因此不用在手动在文件中添加：
  - `.*.swp, ._*, .DS_Store, .git, .hg, .npmrc, .lock-wscript, .svn, .wafpickle-*`
  - `config.gypi, CVS, npm-debug.log`

## npm-scripts

+ prepublish: 在包被打包和发布前执行，以及不使用任何参数本地安装 `npm install` 时执行（即配置了这个钩子的包，在这个包中执行 npm install 的时候，而不是说别的包依赖这个包，然后安装带有这个钩子的包时执行）
+ prepare: 同上，不过是在 prepublish 后，prepublishOnly 后执行
+ prepublishOnly: 在包被打包和 prepared 前执行，仅在 `npm publish` 时执行
+ prepack: 在打包成 tarball 前执行 `npm pack, npm publish`
+ postpack: 生成了 tarball 但在转移到目的地前执行
+ publish, postpublish: 在包发布后执行
+ preinstall: 在包被安装前执行
+ install, postinstall: 在包安装后执行
+ preuninstall, uninstall: 包卸载前执行
+ postuninstall
+ preversion: 在更新包版本前执行
+ version: 在更新包版本后，提交前执行
+ postversion: 在更新包版本后，提交后执行
+ pretest, test, posttest: 由 `npm test` 命令执行
+ prestop, stop, poststop: 由 `npm stop` 命令执行
+ prestart, start, poststart: 由 `npm start` 命令执行
+ prerestart, restart, postrestart: 由 `npm restart` 命令执行
+ preshrinkwrap, shrinkwrap, postshrinkwrap: 由 `npm shrinkwrap` 命令执行

## 语义化版本

1. 空格表示交集，|| 表示并集
2. 预发布 tab，例如 1.2.3-alpha.3，这个好像在匹配上，首先版本必须是一样的，然后要匹配的
项也要有预发布标签。
3. 中划线版本：`1.2.3 - 2.3.4` := `>= 1.2.3 <= 2.3.4` 如果第一个版本号缺少了一些部分，
那就用零填充
4. 如果是第二个版本中少了一部分东西，那就只能接受小于等于这个版本的所有：`1.2.3 - 2.3` :=
`>=1.2.3 <2.4.0`, `1.2.3 - 2` := `>=1.2.3 <3.0.0`
5. X, x 和 * 都可以用来只带一个数字
  - \* := `>=0.0.0`（任意版本皆可）
  - 1.x := `>= 1.0.0 <2.0.0`
  + 1.2.x := `>=1.2.0 <1.3.0`
6. 波浪线 ~ 范围，如果指定了 minor 的话，patch 是可以改变的，否则 minor 也是可以改变的：
  - `~1.2.3` := `>=1.2.3 <1.3.0`
  - `~1.2` := `>=1.2.0 <1.3.0`
  - `~1` := `>=1.0.0 <2.0.0`
  - `~0.2.3` := `>=0.2.3 <0.3.0`
7. 插入 ^ 范围，最左边非零数字后的所有部分都可以修改：
  - `^1.2.3` := `>=1.2.3 <2.0.0`
  - `^0.2.3` := `>=0.2.3 <0.3.0
  - `^0.0.3` := `>=0.0.3 <0.0.4`

## npm-run-script

1. npm run-script === npm run
2. `--` 后面的选项会直接传给脚本而不是 npm
3. 除了 shell 中已经存在的 PATH，`npm run` 还会将 `node_modules/.bin` 添加到 PATH
中，任何本地安装的依赖提供的二进制文件可以不加 node_modules/.bin 前缀执行。

## npm-link

```bash
$ npm link (in package dir)
$ npm link [<@scope>/]<pkg>[@<version>]
```    

首先当我们在一个包的目录中执行 `npm link` 时，会在全局的目录 `{prefix}/lib/node_modules/<package>`
创建一个符号链接，链到 `npm link` 命令执行的地方。bin 文件也是 `{prefix/bin/{name}}`。   

之后在别的地方 `npm link package-name` 会在当前的 node_modules 中创建一个符号链接，链
到全局安装的 package-name 处。   

## npm folders - Folder Structures Used by npm

npm 会在我们的计算上装很多的东西，这是它的工作。    

+ 本地安装（默认）：将东西放置在当前包根目录的 `./node_modules` 目录中。
+ 全局安装（使用 `-g`）：将东西放置在 `/usr/local` 或者其他 node 安装的地方。
+ 如果我们希望 `require()` 这个包就使用本地安装。
+ 如果我们希望在命令行运行这个包就使用全局安装。
+ 如果两者都需要，那么就在两个地方都安装，或者使用 `npm link`。   

### prefix Configuration  

配置 `prefix` 默认是 node 安装的地方。在大多数系统上时 `/usr/local`。在 Windows 上是
`%AppData%\npm`。  

在使用 `global` 标志时，npm 会将东西安装到这个 `prefix` 中。如果没使用这个
标志，npm 就使用当前包的根目录，如果没在包中的话就是当前工作目录。    

### Node Modules   

包会放置到 `prefix` 下的 `node_modules` 文件夹中。   

范围包的按照与上面的类似，除了他们会安装到相关的 `node_modules` 下的子文件夹中，文件夹
的文字会使用 `@` 做前缀加上范围包的名字。例如 `npm install @myorg/package` 会将包放置
到 `{prefix}/node_modules/@myorg/package`。    

### Executables

当处在全局模式的时候，可执行文件被链接到 `{prefix}/bin`(Unix)，或者直接在
`{prefix}`(Windows)（这个意思是在 Windows 上是直接调用吧，不是说链接了吧）。    

当处在本地模式的时候，可执行文件被链接到 `./node_modules/.bin`。    

### Man Pages

当在全局模式时，man pages 链接到 `{prefix}/share/man`。    

当在本地模式时，不会安装 man pages。    

同时，man pages 在 Windows 上也不会安装。   

### Cache

缓存的文件保存在 `~/.npm`(Posix)，`~/npm-cache`(Windows)。    

Cache 是受 `cache` 配置参数控制的。   

### Temp Files

默认情况下临时文件存储在 `tmp` 配置指定的文件夹中，这个配置默认是 `TMPDIR`
, `TMP` 或者 `TEMP` 环境变量值，或者是 Unix 中的 `/tmp`，及 Windows中 `c:\windows\temp`。    

每次运行程序的时候临时文件都是在这个根文件夹中被给予一个唯一的文件夹名，之后会
在程序成功退出时被删除。    

### More Information

在本地安装的时候，npm 首先尝试去寻找合适的 `prefix` 文件夹。这样的话即便在包中的某一个
后代目录中，安装工作还是可以安装到包的根目录中，而不用我们再将当前工作目录切换到那里
。貌似这里包的根目录是指包含一个 `package.json` 文件，或者一个 `node_modules` 文件夹
的目录。如果没找到这样的目录的话，就只能使用当前文件夹了。    

当我们运行 `npm install foo@1.2.3` 时，包首先加载到 cache 中，然后解压缩到
`./node_modules/foo` 中。任何的二进制文件时符号链接到 `./node_modules/.bin/` 中。   

## package-lock.json

`package-lock.json` 文件会在 npm 修改 **node_modules** 树或者 **package.json** 时
自动生成。这个文件会准确的描述生成的树，以便我们之后的安装也可以生成一个相同的树（这个文
件貌似是为跨平台安装时准备的，所以这里所指的随后的安装推测应该是我们在其他的平台上安装
我们的包时，可以正确的安装完全相同的依赖树结构吧），而不用管在两次安装过程之间发生的依赖的更新。   

这个文件会试着提交到源代码的仓库中，并为以下的目的服务：    

+ 描述一个依赖树，以便小组成员，部署和持续集成时可以保证安装完全相同的依赖。   
+ 为用户提供一种“时间旅行”的能力，以便我们可以在不需要提交 **node_modules** 目录的情况下可以恢复到之前的状态。   
+ To facilitate greater visibility of tree changes through readable source control diffs.
+ 通过允许 npm 跳过之前安装包时已经解决了的元数据解析过程，来优化安装过程。   

**package-lock.json** 的一个很重要的细节是这个文件不可以被 published，并且如果在顶层
包目录之外的地方发现这个文件，这个文件会被忽略。这个文件与 `npm-shrinkwrap.json` 格式相同，
其实这两个基本上是一个文件，但是 `npm-shrinkwrap.json` 允许 published。    

如果在包的根目录中同时发现了 `package-lock.json` 和 `npm-shrinkwrap.json` 文件，那么 `package-lock.json` 会被忽略。    

1. name: 包的名字。匹配 `package.json` 中的对应字段名。   
2. version: 包的版本。匹配 `package.json` 中的对应字段名。   
3. lockfileVersion: 一个整数版本号，从 **1** 开始，生成 **package-lock.json** 时就使用这个版本号。    
4. packageIntegrity: 这个一个从 **package.json** 创建出来的 [Subresource Integrity](https://w3c.github.io/webappsec-subresource-integrity/)
值。不允许对 **package.json** 进行预处理。    
5. preserveSymlinks: 表明在环境变量 **NODE\_PRESERVE_SYMLINKS** 启用的情况执行安装过程吧。
安装程序应该坚持该属性的值与该环境变量匹配。    
6. dependencies: 包名到依赖对象的映射。依赖对象有如下的属性：   

**version**   

这是一个唯一标识该包的说明符，应该可以在获取它的新副本时使用。    

+ 打包的依赖：不管源代码在哪里，这个只是一个单纯提供信息的版本号。 
+ 注册了的源代码：一个版本号。
+ 源代码的 git 地址：这是一个使用提供信息解析了的 git 说明符（例如：**`git+https://example.com/foo/bar#115311855......97e`**）
+ 源代码 tarball 的 http 位置：这个是 tarball 的 URL 地址。（例如 **`https://example.com/example-1.3.0.tgz`**。）
+ 源代码 tarball 的本地位置：这个是tarball 的 file URL 地址。（例如 **`file:///opt/storage/example-1.3.0.tgz`**）
+ 源代码的本地链接位置：这个是链接的 file URL 地址（例如 **`file:libs/our-module`**）    

**integrity**    

这个一个资源的 [Standard Subresource Integrity](https://w3c.github.io/webappsec-subresource-integrity/)。    

+ 对于打包的依赖来说是不包括这个的，不管源代码在何处。
+ 对于注册了的依赖，这个就是注册提供的 **integrity** @TODO 后面还有没翻译的。
+ 对于 git 中的源代码，这个就是我们克隆的提交的 hash。
+ 对于远程 tarball 的源代码，这个是基于文件 SHA512 的一个 integrity。
+ 对于本地 tarball，这个是基于文件 SHA512 的一个 integrity。    

**resolved**    

+ 对于打包的依赖来说，是不包含这个的。    
+ 对于注册了依赖来说，这个是 tarball 相对于注册 URL 的路径。如果 tarball URL 与注册 URL不在一个服务器的话，就是一个
完整的 URL。    

**bundled**   

如果为 `true`，这个依赖就是打包的依赖，将会通过父模块来安装。当安装时，这个模块会在导出阶段从父模块中导出，而不是
作为一个独立的依赖安装。   

**dev**   

如果为 `true` 的话，那么这个依赖只不过是顶层模块的开发依赖，或是一个顶层模块开发依赖的传递依赖。    

**optional**   

如果为 `true` 的话，那么这个依赖只不过是顶层模块的可选依赖，或是一个顶层模块可选依赖的传递依赖。    

**dependencies**   

这个依赖的依赖，与顶层模块相同。   

## package-locks - An explanation of npm lockfiles

从概念方面说，npm 安装时的“输入”是 **package.json** 文件，“输出” 是一个 **node_modules** 树。这个树是
我们声明的依赖关系的表示。在一种理想的情况下，npm 的行为与一个纯函数类似：相同 **package.json** 会产生
相同的 **node_modules** 树。在一些情况下，这种行为是可以实现的，不过在许多其他的情况下，npm 是无法做到这
一点的。主要有以下的原因：   

+ 我们在两次安装过程中可能使用不同版本的 npm，相互之间可能使用了略微不同的按照算法。
+ 可能在我们从上次安装完成后，有新的版本的包发布了，因此我们之后的按照可能会使用新版本的包。
+ 我们某个依赖的依赖包可能发布了新版本，那么即便我们使用了固定的依赖声明符还是会更新（这里的固定声明符，应该指的
是我们的依赖，而不是依赖的依赖，因为这样的话固定的声明符对依赖的依赖是不起作用的）
+ 我们安装的依赖注册地址可能不再有效，或者这个地址允许我们修改版本，注意这个注册地址应该是我们 npm 仓库的地址，不同这里明显的意思是我们安装时候可能使用的是其他的仓库，比如说淘宝的镜像，这样的话，可能这些注册地址会将不同版本的包放在之前的某个版本地址下。   

因此为了消除这种潜在的问题，npm 使用 **package-lock.json** 或者 **npm-shrinkwrap.json**。这些文件叫做 package locks, 或者 lockfiles。   

这样的话，在我们使用 `npm install` 时候，npm 会生成或者更新我们的 package lock。    

该文件描述了一个精确的，更重要的是可重现的node_modules树。一旦有这样的文件，那么未来的安装工作就会基于这个文件工作，
而不是 **package.json**。    

如果我们不希望在执行某个安装时更新这些锁文件，可以使用 `--no-save` 选项来禁止保存，或者使用 `--no-shrinkwrap` 只让
**package.json** 文件更新，而锁文件不会变化。    

## package.json

1. name
2. version
3. description
4. keywords
5. homepage: 项目主页面的 url。   
6. bugs: 项目问题追踪的 url 地址，或者 / 及是可以汇报问题的 email 地址。    

```json
{ "url" : "https://github.com/owner/project/issues"
, "email" : "project@hostname.com"
}
```    

可以同时指定两个值。如果只提供 url值，可以把 bugs 属性值设为字符串。    

7. license
8. author, contributors: "author" 字段是一个人，"contributors" 是一个人的数组。一个
“人” 是指一个带有 name 字符及可选的 "url" 和 "email" 字段的对象：   

```json
{ "name" : "Barney Rubble"
, "email" : "b@rubble.com"
, "url" : "http://barnyrubble.tumblr.com/"
}
```   

或者可以把3部分写到一个字符串中，npm 会替我们解析：   

`"Barney Rubble <b@rubble.com> (http://barnyrubble.tumblr.com/)"`    

9. files: 我们项目包含文件的数组。可以在根目录或者子目录中提供一个 ".npmignore" 文件来阻止文件被
包含进去。下面的文件是肯定被包含的，不管怎么设置：   

+ package.json
+ README
+ CHANGES / CHANGELOG / HISTORY
+ LICENSE / LICENCE
+ NOTICE
+ "main" 字段指定的文件   

10. main: 项目的主入口文件。    
11. bin: 包含一个或多个可执行文件，通常希望把这些包安装到 PATH 中。npm run-script 会
简化这个操作。   

通常来说，"bin" 字段是一个命令名到本地文件名的映射，在安装的时候，如果是全局安装，npm 
会在 `prefix/bin` 中为这个文件创建符号链接，如果是本地安装，会在 `.node_modules/.bin/`
中创建。   

例如： `{ "bin": { "myapp" : "./cli.js" }}`   

那么在安装的时候，会创建一个符号链接 `/usr/local/bin/myapp` 链接到 `cli.js` 。   

如果我们只有一个可执行文件（这里准确说应该是执行的命令吧），且其名字就是包名，那么可以
直接把这个属性设置为字符串： `"bin": "./path/to/program"`，等同于： `"bin" : { "my-program" : "./path/to/program" }`。      

12. man   
13. directories: CSJ Packages 规范说明了使用 `directories` 对象来指定包结构的一些方式。
看情况这里每个属性值都应该是一个目录的路径。       
14. directories.lib: 告诉人们我们的库放在哪。其实就是我们包的这个目录。      
15. directories.bin: 如果在 `directories.bin` 中指定一个 `bin` 目录，则文件夹中所有
的文件会被添加。由于 `bin` 指令的工作方式，同时指定 `bin` 和 `directories.bin` 会出错。
如果我们想要指定单独的文件，使用`bin`，如果想要添加 `bin` 目录下所有的文件，使用 `directories.bin`。    
16. directories.man: 所有帮助页面的文件夹。是生成一个 "man" 数组的与语法糖。    
17. directories.doc: 将 markdown 文件放到这里。    
18. directories.example: 将例子放置到这里。    
19. directories.test: 将测试脚本放到这里。   
20. repository: 指定代码的 URL 地址   

```json
{
"repository" :
  {
    "type" : "git",
    "url" : "https://github.com/npm/npm.git"
  }
}
```    

## npx

npx 好像还可以临时安装一个包，如果这个包当前不在项目的 node_modules 目录中。`npx <command>`
当 `<command>` 不在 `$PATH` 中时，npx 会自动使用这个名字在 npm 仓库中搜索包并安装然后调用。   

Last Update: 2018-11-06