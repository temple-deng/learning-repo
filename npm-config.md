# Configuring npm

目录：   

<!-- TOC -->

- [Configuring npm](#configuring-npm)
  - [npm folders - Folder Structures Used by npm](#npm-folders---folder-structures-used-by-npm)
    - [prefix Configuration](#prefix-configuration)
    - [Node Modules](#node-modules)
    - [Executables](#executables)
    - [Man Pages](#man-pages)
    - [Cache](#cache)
    - [Temp Files](#temp-files)
    - [More Information](#more-information)
  - [package-lock.json](#package-lockjson)
    - [Description](#description)
    - [FILE FORMAT](#file-format)
      - [name](#name)
      - [version](#version)
      - [lockfileVersion](#lockfileversion)
      - [packageIntegrity](#packageintegrity)
      - [preserveSymlinks](#preservesymlinks)
      - [dependencies](#dependencies)
  - [package-locks - An explanation of npm lockfiles](#package-locks---an-explanation-of-npm-lockfiles)
    - [Description](#description-1)
  - [package.json](#packagejson)
    - [name](#name-1)
    - [version](#version-1)
    - [description](#description)
    - [keywords](#keywords)
    - [homepage](#homepage)
    - [bugs](#bugs)
    - [license](#license)
    - [author, contributors](#author-contributors)
    - [files](#files)
    - [main](#main)
    - [bin](#bin)
    - [man](#man)
    - [directories](#directories)
      - [directories.lib](#directorieslib)
      - [directories.bin](#directoriesbin)
      - [directories.man](#directoriesman)
      - [directories.doc](#directoriesdoc)
      - [directories.example](#directoriesexample)
      - [directories.test](#directoriestest)
    - [repository](#repository)
    - [scripts](#scripts)
    - [config](#config)
    - [dependencies](#dependencies-1)

<!-- /TOC -->

## npm folders - Folder Structures Used by npm

npm 会在我们的计算上装很多的东西，这是它的工作。    

**tl;dr**   

+ 本地安装（默认）：将东西放置在当前包根目录的 `./node_modules` 目录中。
+ 全局安装（使用 `-g`）：将东西放置在 `/usr/local` 或者其他 node 安装的地方。
+ 如果我们希望 `require()` 这个包就使用本地安装。
+ 如果我们希望在命令行运行这个包就使用全局安装。
+ 如果两者都需要，那么就在两个地方都安装，或者使用 `npm link`。   

### prefix Configuration  

配置 `prefix` 默认是 node 安装的地方。在大多数系统上时 `/usr/local`。在 Windows 上是 `%AppData%\npm`。（暂时不清楚这个 `prefix` 前缀指什么）   

在使用 `global` 标志时，npm 会将东西安装到这个 `prefix` 中。如果没使用这个
标志，npm 就使用当前包的根目录，如果没在包中的话就是当前工作目录。    

### Node Modules   

包会放置到 `prefix` 下的 `node_modules` 文件夹中。   

范围包的按照与上面的类似，除了他们会安装到相关的 `node_modules` 下的子文件夹中，文件夹的文字会使用 `@` 做前缀加上范围包的名字。例如 `npm install @myorg/package` 会将包放置到 `{prefix}/node_modules/@myorg/package`。    

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

在本地安装的时候，npm 首先尝试去寻找合适的 `prefix` 文件夹。这样的话即便在包中的某一个后代目录中，安装工作还是可以安装到包的根目录中，而不用我们再将当前工作目录切换到那里。貌似这里包的根目录是指包含一个 `package.json` 文件，或者一个 `node_modules` 文件夹的目录。如果没找到这样的目录的话，就只能使用当前文件夹了。    

当我们运行 `npm install foo@1.2.3` 时，包首先加载到 cache 中，然后解压缩到 `./node_modules/foo` 中。任何的二进制文件时符号链接到 `./node_modules/.bin/` 中。   

## package-lock.json

### Description

`package-lock.json` 文件会在 npm 修改 **node_modules** 树或者 **package.json** 时自动生成。这个文件会准确的描述生成的树，以便我们之后
的安装也可以生成一个相同的树（这个文件貌似是为跨平台安装时准备的，所以
这里所指的随后的安装推测应该是我们在其他的平台上安装我们的包时，可以正确的
安装完全相同的依赖树结构吧），而不用管在两次安装过程之间发生的依赖的更新。   

这个文件会试着提交到源代码的仓库中，并为以下的目的服务：    

+ 描述一个依赖树，以便小组成员，部署和持续集成时可以保证安装完全相同的依赖。   
+ 为用户提供一种“时间旅行”的能力，以便我们可以在不需要提交 **node_modules** 目录的情况下可以恢复到之前的状态。   
+ To facilitate greater visibility of tree changes through readable source control diffs.
+ 通过允许 npm 跳过之前安装包时已经解决了的元数据解析过程，来优化安装过程。   

**package-lock.json** 的一个很重要的细节是这个文件不可以被 published，并且如果在顶层包目录之外的地方发现这个文件，这个文件会被忽略。这个文件与 `npm-shrinkwrap.json` 格式相同，其实这两个基本上是一个文件，但是
`npm-shrinkwrap.json` 允许 published。    

如果在包的根目录中同时发现了 `package-lock.json` 和 `npm-shrinkwrap.json` 文件，那么 `package-lock.json` 会被忽略。    

### FILE FORMAT

#### name

包的名字。匹配 `package.json` 中的对应字段名。   

#### version

包的版本。匹配 `package.json` 中的对应字段名。   

#### lockfileVersion

一个整数版本号，从 **1** 开始，生成 **package-lock.json** 时就使用这个版本号。    

#### packageIntegrity

这个一个从 **package.json** 创建出来的 [Subresource Integrity](https://w3c.github.io/webappsec-subresource-integrity/) 值。不允许对 **package.json** 进行
预处理。    

#### preserveSymlinks

表明在环境变量 **NODE\_PRESERVE_SYMLINKS** 启用的情况执行安装过程吧。安装程序应该坚持该属性的值与该环境
变量匹配。    

#### dependencies

包名到依赖对象的映射。依赖对象有如下的属性：   

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

### Description

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

### name

package.json 中最重要的内容就是包的名字和版本字段了。这两个字段是必需的。名字需要满足下面的条件：   

+ 名字必须小于等于 214 字符。
+ 不能以点或者下划线开始。
+ 不能有大写字母。
+ 由于这个名字会成为一个 URL 的最后一部分，会作为命令行的参数，以及一个文件夹的名字。因此，名字不能包含不安全的 URL 字符。   

### version

版本必须是可以被 [node-semver](https://github.com/npm/node-semver) 解析的。   

### description

略。  

### keywords

一个字符串的数组。   

### homepage

项目主页面的 url。   

### bugs  

项目问题追踪的 url 地址，或者 / 及是可以汇报问题的 email 地址。    

```json
{ "url" : "https://github.com/owner/project/issues"
, "email" : "project@hostname.com"
}
```    

可以同时指定两个值。如果只提供 url值，可以把 bugs 属性值设为字符串。    

### license

略。   

### author, contributors

"author" 字段是一个人，"contributors" 是一个人的数组。一个“人” 是指一个带有 name 字符及可选的 "url" 和 "email" 字段的对象：   

```json
{ "name" : "Barney Rubble"
, "email" : "b@rubble.com"
, "url" : "http://barnyrubble.tumblr.com/"
}
```   

或者可以把3部分写到一个字符串中，npm 会替我们解析：   

`"Barney Rubble <b@rubble.com> (http://barnyrubble.tumblr.com/)"`    

### files

files 字段是我们项目包含文件的数组。可以在根目录或者子目录中提供一个 ".npmignore" 文件来阻止文件被
包含进去。下面的文件是肯定被包含的，不管怎么设置：   

+ package.json
+ README
+ CHANGES / CHANGELOG / HISTORY
+ LICENSE / LICENCE
+ NOTICE
+ "main" 字段指定的文件   

下面的文件总是被忽视的：   

+ .git, CVS, .svn, .hg
+ .lock-wscript
+ .wafpickle-N
+ .*.swp
+ .DS_Store
+ ._*
+ npm-debug.log, .npmrc, node_modules, package-lock.json
+ config.gypi
+ *.orig   

### main

这个字段是我们项目的主要的入口点文件。    

### bin

需要包包含一个会多个可执行文件，通常希望把这些包安装到 PATH 中。npm 会简化这个操作。   

通常来说，"bin" 字段是一个命令名到本地文件名的映射，在安装的时候，如果是全局安装，npm 会在 `prefix/bin` 中为
这个文件创建符号链接，如果是本地安装，会在 `.node_modules/.bin/` 中创建。   

例如： `{ "bin": { "myapp" : "./cli.js" }}`   

那么在安装的时候，会创建一个符号链接 `/usr/local/bin/myapp` 链接到 `cli.js` 。   

如果我们只有一个可执行文件（这里准确说应该是执行的命令吧），且其名字就是包名，那么可以直接把这个属性设置为字符串： `"bin": "./path/to/program"`，等同于： `"bin" : { "my-program" : "./path/to/program" }`。      

### man

先略。就是帮助文件的地址吧，可以是一个或者一组文件。   

### directories    

CSJ Packages 规范说明了使用 `directories` 对象来指定包结构的一些方式。看情况这里每个属性值都应该是一个目录的路径。       

#### directories.lib

告诉人们我们的库放在哪。其实就是我们包的这个目录。      

#### directories.bin

如果在 `directories.bin` 中指定一个 `bin` 目录，则文件夹中所有的文件会被添加。   

由于 `bin` 指令的工作方式，同时指定 `bin` 和 `directories.bin` 会出错。如果我们想要指定单独的文件，使用
`bin`，如果想要添加 `bin` 目录下所有的文件，使用 `directories.bin`。（但是命令怎么指定啊）    

#### directories.man

所有帮助页面的文件夹。是生成一个 "man" 数组的与语法糖。    

#### directories.doc  

将 markdown 文件放到这里。    

#### directories.example  

将例子放置到这里。    

#### directories.test  

将测试脚本放到这里。   

看样子，directories 字段很可能在未来用来明确的组织 npm 包的结构。    

### repository

指定代码的 URL 地址吧。   

```js
"repository" :
  { "type" : "git"
  , "url" : "https://github.com/npm/npm.git"
  }

"repository" :
  { "type" : "svn"
  , "url" : "https://v8.googlecode.com/svn/trunk/"
  }
```    

### scripts

略。   

### config

略。   

### dependencies

剩下的先略了。    

