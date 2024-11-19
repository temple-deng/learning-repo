# stylelint(7.12.0)

目录：   

+ [1.特征](#features)
+ [2.用法](#usage)
+ [3.CLI用法](#cli)
+ [4.PostCSS 插件](#postcss)
+ [5.配置](#configuration)
+ [6.gulp-stylelint](#gulp)   


## 1. 特征

<a name="features"></a>      

+ 超过一百五十条的规则：包括：
  - 错误捕获：例如，无效的16进制颜色值，无法识别的颜色
  - 强制最佳的实践
  - 控制使用的语言的特征
  - 强制代码样式的规范
+ 支持最新的 CSS 语法
+ 识别类 CSS 语法：由于这个 linter 是由 PostCSS 项目开发的，所以支持所有 PostCSS 能解析
的语法，例如 SCSS, SugarSS
+ Completely unopinionated：只启用想要开启的规则
+ 支持插件：可以方便的创建我们自己的规则
+ 自动修复一些样式的警告
+ 可共享的配置：如果我们不想要自己编写配置，可以继承一个可共享的配置
+ 选项验证器：所以我们可以确保配置是有效的
+ 良好的测试

## 2. 用法

<a name="usage"></a>   

使用方式包括：   

+ 通过 stylelint 的 CLI
+ 通过构建工具（gulp, webpack 等）的插件
+ 通过文本编辑器的插件
+ 通过 stylelint 的 Node API
+ 通过 PostCSS 插件    

## 3. CLI 用法

<a name="cli"></a>   

### 安装   

`npm install -g stylelint`   

### 用法

命令行的输出是直接打印到 `process.stdout` 中的。    

#### 例子

当我们执行下面例子中的命令时，主要将文件 globs 放在引号中，这样我们就能使用 node-glob
的功能而无视 shell。   

根据 `.stylelintrc` 配置文件 lint 所有 `foo` 目录中的 `.css` 文件：   

`stylelint "foo/*.css"`   

根据 `stylelintrc` 文件 lint `stdin` 的内容：   

`echo "a { color: pink; }" | stylelint`   

使用 `bar/mySpecialConfig.json` 配置文件，lint 所有 `foo` 目录中的 `.css` 文件，并将
输出写入到 `myTestReport.txt` 文件：   

`stylelint "foo/*.css" --config bar/mySpecialConfig.json > myTestReport.txt`   

使用 `bar/mySpecialConfig.json` 配置文件，开启 quiet 模式，lint `foo` 及其子目录和 `bar` 目录
中的所有 `.css` 文件，将 JSON 格式的配置写入到 `myJsonReport.json`：   

`stylelint "foo/**/*.css bar/*.css" -q -f json --config bar/mySpecialConfig.json > myJsonReport.json`   

缓存处理过的 `.scss` 文件以便之后只处理发生变化的那个，使用 `cache` 和 `cache-location` 选项：   

`stylelint "foo/**/*.scss" --cache --cache-location "/Users/user/.stylelintcache/"`    

lint `foo` 目录中的所有 `.scss` 文件，使用 `syntax` 选项：   

`stylelint "foo/**/*.scss" --syntax scss`   

默认情况下支持 `scss, less, sugarss` 的语法。不过其实 stylelint 会自动根据 `.less` `.scss` 和
`.sss` 文件扩展名推测出使用的语法，所以这时候可以省略。    

#### 自动修复错误

使用 `--fix` 选项 stylelint 会尽可能的修复错误。这个修复是直接在源文件上操作的。    

## 4. PostCSS 插件

<a name="postcss"></a>   

### 安装

`npm install stylelint`   

### 选项

这个插件接受一个选项对象参数，包含以下的属性：

+ `config`: 一个 stylelint 配置对象，如果没有传递 `config` or `configFile` 参数，那么会寻找
一个 `.stylelintrc` 配置文件
+ `configFile`: 包含 stylelint 配置对象的 JSON, YAML or JS 文件的路径
+ `configBaseDir`: 相对于 `extends` 和 `plugins` 定义路径的一个相对的绝对路径。这只在我们
传递 `config` 属性时才有用，如果是 `configFile`，那么这个选项时没必要的。    
+ `configOverrides`: 一个部分的 stylelint 配置对象，其属性最终会覆盖已经存在的配置对象，
这个已存在的配置对象可以是 `config` 属性指定的，也可以是一个 `.stylelintrc` 文件
+ `ignoreDisables`: 如果为 `true`，那么所有禁用的注释会被忽略
+ `ignorePath`: 一个忽略文件的路径模式。可以是绝对路径或者相对于 `process.cwd()` 的相对路径。   

具体用法先略了。不一定能用到。    

## 5. 配置

<a name="configuration"></a>   

### 加载配置对象

从当前工作目录开始寻找和加载配置对象，会按序查看以下的可能的文件：   

+ `package.json` 文件中的 `stylelint` 属性
+ `.stylelintrc` 文件
+ 导出一个对象的 `stylelint.config.js` 文件    

`.stylelintrc` 文件可以是 JSON 或 YAML 格式（貌似应该也包含 JS 格式）。所以可选的，我们
可以为不同格式的配置文件添加后缀 `.stylelintrc.json`, `.stylelintrc.yaml`, `.stylelintrc.yml`,
`.stylelintrc.js`。    

一旦找到这样的一个配置对象，那么就会停止搜索并使用这个对象。    

### 配置对象

配置对象包含以下的属性：   

`rules`   

所有的 rules 默认都是关闭的。这个属性是一个对象，键名是规则名，键值是规则的配置，每个规则的
配置满足下面中的一种配置：   

+ 一个单一值（主要选项）
+ 一个含有两个值的数组（`[primary option, secondary option]`）
+ `null`（关闭规则）    

```javascript
{
  "rules": {
    "block-no-empty": null,
    "color-no-invalid-hex": true,
    "comment-empty-line-before": [ "always", {
      "ignore": ["stylelint-command", "after-comment"]
    } ],
    "declaration-colon-space-after": "always",
    "indentation": ["tab", {
      "except": ["value"]
    }],
    "max-empty-lines": 2,
    "rule-empty-line-before": [ "always", {
      "except": ["first-nested"],
      "ignore": ["after-comment"]
    } ],
    "unit-whitelist": ["em", "rem", "%", "s"]
  }
}
```    

#### 在 CSS 中关闭规则

可以在 CSS 中使用特殊的注释临时关闭规则，例如，可以关闭所有的规则：   

```css
/* stylelint-disable */
a {}
/* stylelint-enable */
```   

也可以关闭单独的规则：   

```css
/* stylelint-disable selector-no-id, declaration-no-important  */
#id {
  color: pink !important;
}
/* stylelint-enable */
```   

还可以使用 `/* stylelint-disable-line */` 关闭某一行的规则：   

```css
#id { /* stylelint-disable-line */
  color: pink !important; /* stylelint-disable-line declaration-no-important */
}
```   

还可以使用 `/* stylelint-disable-next-line */` 关闭下一行的规则：   

```css
#id {
  /* stylelint-disable-next-line declaration-no-important */
  color: pink !important;
}
```    

#### 警告等级：error & warning   

默认情况下，所有规则都是 `"error"` 等级。我们可以在配置中设置一个 `defaultSeverity` 属性
来改变这种默认行为。注意这个应该是改变所有规则的默认行为。       

为了调整任意规则的警告等级，设置第二个参数的 `severity` 选项，可选值如下:    

+ `"warning"`
+ `"error"`   

```javascript
// error-level severity examples
{ "indentation": 2 }
{ "indentation": [2] }

// warning-level severity examples
{ "indentation": [2, { "severity": "warning" } ] }
{ "indentation": [2, {
    "except": ["value"],
    "severity": "warning"
  }]
}
```   

#### 定制信息

如果我们希望在违反某个规则时提供一条定制的信息，有两种做法：为规则提供一个 `message` 选项，
或者写一个格式器。   

所有随着的第二选项都接受 `message` 属性，如果设置了这个属性就会替代标准的信息输出：   

```javascript
{
  "color-hex-case": [ "lower", {
    "message": "Lowercase letters are easier to distinguish from numbers"
  } ],
  "indentation": [ 2, {
    "except": ["block"],
    "message": "Please use 2 spaces for indentation. Tabs make The Architect grumpy.",
    "severity": "warning"
  } ]
}
```   

格式器的内容略。    

**`extends`**   

我们的配置可以从另一个配置中继承。甚至可以继承一个配置的数组，前面的配置优先级高，也就说
第一个配置会覆盖后面的配置。很明显我们自己的配置又会覆盖继承的配置。        

```javascript
{
  "extends": "stylelint-config-standard",
  "rules": {
    "indentation": "tab",
    "number-leading-zero": null
  }
}
```    

注意 `"extends"` 的值其实是一个“定位器”，这个值应该是最终被 `require()` 函数处理，也就意味着
这个属性值可以是：   

+ `node_modules` 中的一个模块的名字
+ 一个文件的绝对路径，貌似`.js` or `.json` 扩展名可以省略
+ 相对于引用配置文件位置的文件的相对路径，貌似`.js` or `.json` 扩展名可以省略   


**`plugins`**    

`"plugins"` 是一个数组，同样也是一个“定位器”。   

一旦声明了一个插件，那么`"rules"` 对象就可以增加插件提供的规则。    

```javascript
{
  "plugins": [
    "../special-rule.js"
  ],
  "rules": {
    "plugin/special-rule": "everything"
  }
}
```   

一个插件可以提供一个单一的规则也可以提供一个规则的集合。     

**`processors`**   

处理器应该是与 stylelint 管道挂钩的函数，可以用来修改传入和传出 stylelint 的代码。    

不过处理器只能通过命令行和 Node API 的方式使用。    

处理器可以用来 lint 非标准样式文件中的 CSS。例如，可以检测 HTML 文件中 `<style>` 标签中的
CSS，Markdown 文件中的代码块，或者 JS 中的字符串。   

`"processors"` 也是一个数组，同样还是“定位器”。    

如果处理器有选项的话，就需要传入一个数组，第一个元素是“定位器”，第二个是选项对象：   

```javascript
{
  "processors": [
    "stylelint-html-processor",
    [ "some-other-processor", { "optionOne": true, "optionTwo": false } ]
  ],
  "rules": {..}
}
```   

**`ignoreFiles`**   

提供一个 glob 或者 globs 的数组来指定忽略的文件。（一种可替代的方式是使用一个 `.stylelintignore` 文件）    

glob 可以是绝对路径或相对路径，如果是相对路径，则是相对于：   

+ 如果提供了 `configBaseDir`，就是这个值
+ 如果配置是一个文件的话，就是这个文件的路径
+ `process.cwd()`   

**`defaultSeverity`**   

为所有的规则设置默认的警告级别：   

+ `"warning"`
+ `"error"`    

### .stylelintignore  

这个文件使用的模式必须匹配 .gitignore 的语法。需要注意的是这个文件是相对于 `process.cwd()`。    

## 6. gulp-stylelint(3.9.0)

<a name="gulp"></a>   

### 安装

`npm install gulp-stylelint --save-dev`   

### 用法

如果我们已经有了配置文件，可以按照下面的例子使用，并且还增加了一些其他的选项：   

```javascript
const gulp = require('gulp');

gulp.task('lint-css', function lintCssTask() {
  const gulpStylelint = require('gulp-stylelint');

  return gulp
    .src('src/**/*.css')
    .pipe(gulpStylelint({
      reporters: [
        {formatter: 'string', console: true}
      ]
    }));
});
```   

### Formatters  

下面是当前可用的 stylelint formatters 列表。一些是与 stylelint 打包在一起的，通过
`gulpStylelint.formatters` 对象暴露出来。其他的则需要安装，我们甚至可以自己写一个 formatter。   

+ `"string"` (等价于 `gulpStylelint.formatters.string`) - 打包在一起的
+ `"verbose"` (等价于 `gulpStylelint.formatters.verbose`) - 打包在一起的
+ `"json"` (等价于 `gulpStylelint.formatters.json`) - 打包在一起的
+ stylelint-checkstyle-formatter - 需要安装    

### Options  

gulp-stylelint 支持除 `files` 和 `formatter` 外的所有选项（这里的选项指的是 Node API
提供的），并且还新加了如下额外的选项：   

```javascript
const gulp = require('gulp');

gulp.task('lint-css', function lintCssTask() {
  const gulpStylelint = require('gulp-stylelint');
  const myStylelintFormatter = require('my-stylelint-formatter');

  return gulp
    .src('src/**/*.css')
    .pipe(gulpStylelint({
      failAfterError: true,
      reportOutputDir: 'reports/lint',
      reporters: [
        {formatter: 'verbose', console: true},
        {formatter: 'json', save: 'report.json'},
        {formatter: myStylelintFormatter, save: 'my-custom-report.txt'}
      ],
      debug: true
    }));
});
```   

#### failAfterError    

设置为 `true` 时，如果出现了错误级别的警告则进程会推迟并设置非0的退出码。默认为 `true`。   

#### reportOutputDir

lint 结果写入位置的基本目录。默认是当前工作目录。    

#### reporters   

reporter 的列表。默认是空数组。   

```javascript
{
  // stylelint results formatter (required):
  // - pass a function for imported, custom or exposed formatters
  // - pass a string ("string", "verbose", "json") for formatters bundled with stylelint
  formatter: myFormatter,

  // save the formatted result to a file (optional):
  save: 'text-report.txt',

  // log the formatted result to console (optional):
  console: true
}
```   

#### debug

设置为 `true` 时，错误处理函数会打印错误堆栈信息。默认为 `false`。   
