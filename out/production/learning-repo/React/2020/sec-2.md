# 第二部分

<!-- TOC -->

- [第二部分](#第二部分)
- [Prettier](#prettier)
  - [简化的使用指南](#简化的使用指南)
  - [CLI](#cli)
    - [`--ignore-path`](#--ignore-path)
    - [`--require-pragma`](#--require-pragma)
    - [`--insert-pragma`](#--insert-pragma)
    - [`--list-different`, `-l`](#--list-different--l)
    - [`--no-config`](#--no-config)
    - [`--config-precedence`](#--config-precedence)
    - [`--no-editorconfig`](#--no-editorconfig)
    - [`--with-node-modules`](#--with-node-modules)
    - [`--loglevel`](#--loglevel)
    - [`--stdin-filepath`](#--stdin-filepath)
    - [`--find-config-path`, `--config`](#--find-config-path---config)
  - [和 linter 工具集成](#和-linter-工具集成)
  - [配置项](#配置项)
    - [`--print-width`](#--print-width)
    - [`--tab-width`](#--tab-width)
    - [`--use-tabs`](#--use-tabs)
    - [`--no-semi`](#--no-semi)
    - [`--single-quote`](#--single-quote)
    - [`--quote-props`](#--quote-props)
    - [`--jsx-single-quote`](#--jsx-single-quote)
    - [`--trailing-comma`](#--trailing-comma)
    - [`--no-bracket-spacing`](#--no-bracket-spacing)
    - [`--arrow-parens`](#--arrow-parens)
    - [`--require-pragma`](#--require-pragma-1)
    - [`--insert-pragma`](#--insert-pragma-1)
  - [配置文件](#配置文件)
    - [cosmiconfig](#cosmiconfig)

<!-- /TOC -->

# Prettier

## 简化的使用指南

version: statle(2.0.5)

安装：

```
npm install prettier --save-dev --save-exact
```

`--save-exact` 是指安装的时候把版本号写死，而不是用那些语义化的版本符像 `~, ^` 之类的。

应用到某个文件：

```
npx prettier --write src/index.js
```

添加 git hooks，还是利用 husky 库：

```
npm install pretty-quick husky --save-dev
```

然后改 package.json 文件：

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "pretty-quick --staged"
    }
  }
}
```

## CLI

简单的用法：

```
prettier [options] [file/dir/glob ...]
```

`--write` 选项会直接修改代码文件，`prettier --write .` 会将当前目录及子目录所有 prettier
支持的文件都格式化。

给定一个 path/pattern 列表，prettier 首先会将其视为一个普通的字面路径：

- 如果路径指向一个存在的文件，直接处理这个文件
- 如果路径指向一个存在的目录，prettier 会递归地找到这个目录中所有支持的文件
- 否则，入口会当成一个 glob 进行处理

如果想要检查文件是否是格式化的，使用 `--check, -c` 选项。

### `--ignore-path`

默认情况下根据 `./.prettierignore` 文件。

### `--require-pragma`

只有在文件顶部添加了如下特殊注释的文件才会被处理：

```js
/**
 * @prettier
 */
```

或者是 `@format`

### `--insert-pragma`

当文件中不存在上面所谓的 pragma 的时候，在文件顶部添加 pragma 并且格式化文件。貌似不能和
`--require-pragma` 同时用。

### `--list-different`, `-l`

打印出那些会被处理的文件的名字，如果一个文件已经是格式化过的，那么不会出现在结果中。

### `--no-config`

不要使用配置文件。

### `--config-precedence`

- `cli-override` 默认，命令行参数优先级最高
- `file-override` 配置文件优先级高于命令行
- `prefer-file` 如果能找到配置文件，就使用配置文件，并且忽视命令行参数

### `--no-editorconfig`

当解析配置时，不要将 `.editorconfig` 计算在内。

### `--with-node-modules`

连同 node_modules 中的文件也一并处理。

### `--loglevel`

- `error`
- `warn`
- `log` 默认
- `debug`
- `silent`

### `--stdin-filepath`

略。

### `--find-config-path`, `--config`

没看懂，占个坑先。

## 和 linter 工具集成

一般来说和其他 linter 工具集成时，需要禁用掉那些可能和 prettier 冲突的规则，以 eslint 为例，
需要安装 `eslint-config-prettier` 依赖，然后配置 `.eslintrc` 文件：

```json
{
  "extends": ["prettier"]
}
```

然后呢安装 `eslint-plugin-prettier`，这个插件呢会添加一个规则，用来使用 prettier 格式化文件。

```json
{
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "error"
  }
}
```

`eslint-plugin-prettier` 暴露了一个 recommend 配置，帮我们配置好了 eslint-plugin-prettier,
eslint-config-prettier。

```json
{
  "extends": ["plugin:prettier/recomment"]
}
```

## 配置项

### `--print-width`

- 默认: 80
- cli: `--print-width <int>`
- api: `printWidth: <int>`

行的长度。   

### `--tab-width`    

- 默认: 2
- cli: `--tab-width <int>`
- api: `tabWidth: <int>`


### `--use-tabs`

- 默认: `false`
- cli: `--use-tabs`
- api: `useTabs: <bool>`

### `--no-semi`    

- 默认: `true`
- cli: `--no-semi`
- api: `semi: <bool>`    

是否在声明语句后添加分号，true 是在每个声明语句后面添加分号，false 只能缺少分号会出错的行的开始
添加分号。    

### `--single-quote`

- 默认: `false`
- cli: `--single-quote`
- api: `singleQuote: <bool>`

使用单引号而不是双引号。   

JSX 会忽视这个选项。    

### `--quote-props`    

对象的属性加不加引号。   

- 默认: 'as-needed'
- cli: `--quote-props <as-needed|consistent|preserve>`
- api: `quoteProps: "<as-needed|consistent|preserve>"`    

- as-needed: 只在必要的时候加引号
- consistent: 只要对象的属性有一个加了引号，就都加上
- preserve: 维持不变    

### `--jsx-single-quote`   

- 默认: `false`
- api: `jsxSingleQuote`

### `--trailing-comma`

- 默认: 'es5'
- api: `trailingComma: "<es5|none|all>"`   

### `--no-bracket-spacing`

对象字面量中的空白。

- 默认: `true`
- api: `bracketSpacing: <bool>`    

- true: `{ foo: bar }`
- false: `{foo: bar}`     

### `--arrow-parens`    

箭头函数参数的括号问题。    

- 默认: `always`
- api: `arrowParens: "<always|avoid>"`     

- always: `(x) => x`
- avoid: `x => x`    

### `--require-pragma`    

- api: `requirePragma: <bool>`    

### `--insert-pragma`   

在那些被 prettier 处理过的文件开头添加一个 pragma。    

## 配置文件

prettier 使用 cosmiconfig 提供配置支持。     


### cosmiconfig

这个 cosmiconfig 搜索的顺序是：   

- `package.json` 文件中的属性
- 一个 json 或 yaml 的 rc 文件，不带扩展名
- 带有 .js, .json, .yaml, .yml 扩展名的 rc 文件
- .config.js 的 CJS 模块    

配置文件的搜索是从待处理文件的位置开始，直到找到一个配置文件。