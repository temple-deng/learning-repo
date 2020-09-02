# npx

<!-- TOC -->

- [npx](#npx)
  - [概要](#概要)
  - [描述](#描述)

<!-- /TOC -->

执行 npm 包的二进制文件。   

## 概要

```shell
npx [options] <command>[@version] [command-arg]...

npx [options] [-p|--package <pkg>]... <command> [command-arg]...

npx [options] -c '<command-string>'

npx --shell-auto-fallback [shell]
```     

## 描述

从本地的 `node_modules/.bin` 目录或一个中央缓存中执行 `<command>` 命令，话说这里的中央缓存
是指什么，为了能成功执行 `<command>` 命令会安装所有所必需的包。    

默认情况下，`npx` 会从 `$PATH`，或本地项目的二进制文件中搜索 `<command>` 命令并执行。如果
没找到命令，会先进行安装再执行。    

除非执行了 `--package`，否则 `npx` 会从名字上猜二进制可执行文件的名称，`npm` 可以理解的包的
说明符 `npx` 都可以识别，包括  git 地址，tarball 地址，本地目录等。    

如果提供了完整的说明符，或者使用 `--package` 选项，则 npx 会使用临时安装的包的最新版本来执行，
也可以通过 `--ignore-existing` 强制使用这样的行为。   

- `-p, --package <pkg>`: 定义要安装的包，默认等于 `<command>`。一般来说，只有包包含有多个
可执行文件，或者可执行文件的名称好包名不同时会用到这个选项。
- `--no-install`：带有这个选项的话，npx 只会从当前路径或 `$prefix/node_modules/.bin` 中
搜索 `<command>`，而不会去尝试安装不存在的命令
- `--cache <path>`：设置 npm 的缓存，默认是 npm 的缓存配置
- `-c <string>`：没看懂
- `--shell <string>`: 执行命令所使用的 shell
- `--shell-auto-fallback [<shell>]`：没懂


从 github 仓库执行命令：   

```
$ npx github:piuccio/cowsay
...or...
$ npx git+ssh://my.hosted.git:cowsay.git#semver:^1
...etc...
```    