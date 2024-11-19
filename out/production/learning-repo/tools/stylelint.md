# stylelint(13.5.0)

<!-- TOC -->

- [stylelint(13.5.0)](#stylelint1350)
  - [简介](#简介)
  - [rules](#rules)
  - [CLI, API](#cli-api)

<!-- /TOC -->

## 简介

安装：   

```
npm i --save-dev stylelint stylelint-config-standard
```    

添加 `.stylelintrc.json` 配置文件：    

```json
{
  "extends": "stylelint-config-standard"
}
```    

运行： `npx stylelint "**/*.css"`     

内置了 170+ 条 rules。不过默认是都不开启的。    

```json
{
  "rules": {
    "color-no-invalid-hex": true
  }
}
```     

rule 配置值：   

- `null`: 关闭 rule
- 单一值
- 两个值组成的数组 `[主选项, 次选项]`    

```json
{
  "rules": {
    "selector-pseudo-class-no-unknown": [
      true,
      {
        "ignorePseudoClasses": ["global"]
      }
    ]
  }
}
```     

可以配置一个 message 次选项，在不满足条件时定制提示语：   

```json
{
  "rules": {
    "color-hex-case": [
      "lower",
      {
        "message": "Lowercase letters are easier to distinguish from numbers"
      }
    ],
    "indentation": [
      2,
      {
        "except": ["block"],
        "message": "Please use 2 spaces for indentation.",
        "severity": "warning"
      }
    ]
  }
}
```    

`severity` 次选项：   

- `warning`
- `error` 默认值     

`defaultSeverity` 全局配置项。    

`extends` 配置项，继承其他的配置文件。    

```json
{
  "extends": "stylelint-config-standard"
}
{
  "extends": ["stylelint-config-standard", "./myExtendableConfig"]
}
```     

可以继承多个配置项，数组后面元素的优先级高。     

继承的配置定位方式符合 npm 的定位机制。    

extends 相当于继承另一个配置文件，而 plugins 则是提供了一些非标准的规则或工具。    

声明了 plugin 后，在 `rules` 中就可以使用插件设计的规则了：    

```json
{
  "plugins": ["../special-rule.js"],
  "rules": {
    "plugin-namespace/special-rule": "everything"
  }
}
```     

`processors` 是社区提供的一些函数，可以 hook 进 stylelint 的数据处理流中，对结果进行处理。    

`ignoreFiles`，glob 或 glob 数组。    

尊上所述，提供了这些配置项：   

- `rules`
  + `message`
  + `severity`
- `extends`
- `plugins`
- `defaultSeverity`
- `processors`
- `ignoreFiles`    

## rules

每个 rule 都有一个必填的主配置项，一个选填的次配置项。     

一些比较通用的次配置项有 `"ignore": []` 和 `"except": []`。     

这两个配置项都接受一组预定义关键词组成的数组：`["relative", "first-nested", "descendant"]`。   

- ignore: 跳过特定的模式
- except: 为特定的模式反转主配置项     

rule 的文字都是可以分成两部分，第一部分描述了规则的应用场景，第二部分描述了 rule 具体的限制。    

一些应用到整个样式表的 rule 可能没有第一部分。   

空白的 rule 一些由两部分关键词结合而成：   

- `before, after, inside` 说明空白在哪个位置
- `empty-line, space, newline` 是否要出现各种空白    

规则列表：    

- 可能导致出错：
  + `color-no-invalid-hex`
  + `font-family-no-duplicate-names`
  + `font-family-no-missing-generic-family-keyword`
  + `function-calc-no-invalid` **1**
  + `function-calc-no-unspaced-operator`
  + `function-linear-gradient-no-nonstandard-direction`
  + `string-no-newline`: 禁止字符串中出现未转义的新行
  + `unit-no-unknown`
  + `property-no-unknown`
  + `keyframe-declaration-no-important`: 某些浏览器里面会忽略 keyframe 里的 important
  + `declaration-block-no-duplicate-properties` **1**
  + `declaration-block-no-shorthand-property-overrides` **1**
  + `block-no-empty`
  + `selector-pseudo-class-no-unknown`
  + `selector-pseudo-element-no-unknown`
  + `selector-type-no-unknown`
  + `media-feature-name-no-unknown`
  + `at-rule-no-unknown`
  + `comment-no-empty`
  + `no-descending-specificity`: 禁止低优先级的选择器出现在高优先级的后面
  + `no-duplicate-at-import-rules`
  + `no-duplicate-selectors`
  + `no-empty-source`: 空的源代码文件
  + `no-extra-semicolons` fixable
  + `no-invalid-double-slash-comments` 禁用双斜线注释（scss 等预处理语言不受限制）
- 限制语言的功能
  + `alpha-value-notation`: alpha 值用数字或字符串 number | percentage, fixable
  + `hue-degree-notation`: hue 值用角度或数字 angle | number, fixable
  + `color-function-notation`: 使用合法的还是非法的颜色函数语法， `modern`, `legacy`,
  注意用空格分割的颜色值才是正统的 `rgb(0 0 0)`，用逗号分割的其实是非法的 `rgb(0, 0, 0)`
  + `color-named`  **1**
  + `color-no-hex`
  + `length-zero-no-unit`
  + `font-weight-notation`
  + `function-blacklist`
  + `function-url-no-scheme-relative` 禁用这样的相对 url `//baidu.com/img.png`
  + `function-url-scheme-blacklist`
  + `function-url-scheme-whitelist`
  + `function-whitelist`
  + `number-max-precision`
  + `time-min-milliseconds`: 能使用的最小时间值
  + `declaration-block-no-redundant-longhand-properties`: 能用缩写就缩写，别出现两个的长写 **1**
  + `declaration-no-important`
  + `selector-no-qualifying-type` **1**
  + `max-nesting-depth` **1**
- 风格问题
  + `color-hex-case` **1**
  + `function-comma-newline-after`: 函数逗号后加新行
  + `function-comma-newline-before`
  + `function-comma-space-after`
  + `function-comma-space-before`
  + `function-url-quotes`
  + `number-leading-zero`
  + `value-list-comma-space-after`
  + `declaration-colon-newline-after`
  + `declaration-colon-space-after`
  + `declaration-colon-space-before`
  + `declaration-block-semicolon-newline-after`

## CLI, API

CLI: `npx stylelint "**/*.css"`  加引号是为了使用 npm 的 glob 匹配而不是 shell 的匹配，
这一点别的 CLI 工具可能也会用到。    

除了标准配置项外，CLI 还有以下选项：   

- `--allow-empty-input`
- `--color, --no-color`
- `--ignore-pattern, --ip`
- `--output-file, -o`
- `--print-config`
- `--quiet, -q`
- `--stdin`
- `--version, -v`    

标准配置项：     

- `--config, configFile`
- `--config-basedir, configBasedir`: extends 和 plugins 相对路径的基础
- `--fix, fix`
- `-f, --formatter, formatter`: 格式化输出，`compact, json, string, unix, verbose`
- `--cache, cache`: 储存处理过文件的结果，一遍下次运行时只处理有变动的
- `--cache-location, cacheLocation`
- `--max-warnings, maxWarnings`
- `--syntax, syntax`    

还有几个省略了。    

vscode 集成插件： vscode-stylelint。    

建议关掉内置的 css,less,scss 代码校验器：   

```json
{
  "css.validate": false,
  "less.validate": false,
  "scss.validate": false
}
```    

