# Glob

使用 shell 使用的模式来进行文件匹配。     

## 用法

```js
var glob = require('glob');

// options 可选
glob('**/*.js', options, function (err, files) {
  // files 是文件名数组
  // 如果设置了 `nonull` 选项，而且也没有找到任何的匹配
  // 那么 files 就是 ["**/*.js"]
})
```    

## Glob Primer

`{}` 中的内容会被扩展到一个集合中，其中的内容都是用逗号分隔的。如果其中包含斜线的话 \/，
也是正常的扩展，例如 `a{/b/c,bcd}` 扩展为 `a/b/c` 和 `abcd`。   

路径中的以下字符都有特殊的含义：    

+ `*` 匹配单一路径部分中的 0 或多个字符
+ `?` 匹配一个字符
+ `[...]` 匹配字符类，类似 RegExp 字符类。如果括号中的第一个字符是 `!` 或 `^`，匹配
不在字符类中的任意字符。
+ `!(pattern|pattern|pattern)` Matches anything that does not match any of the
patterns provided.
+ `?(pattern|pattern|pattern)` Matches zero or one occurrence of the patterns
provided
+ `+(pattern|pattern|pattern)` Matches one or more occurrences of the patterns
provided
+ `*(a|b|c)` Matches zero or more occurrences of the patterns provided
+ `@(pattern|pat*|pat?erN)` Matches exactly one of the patterns provided
+ `**` If a "globstar" is alone in a path portion, then it matches zero or more
directories and subdirectories searching for matches. It does not crawl symlinked
directories     

### Dots

如果一个文件或者目录路径部分使用了 `.` 作为第一个字符，那么它不会匹配任意的模式，除非
对应的模式路径的部分也是使用 `.` 作为第一个字符。    

例如，模式 `a/.*/c` 可以匹配文件 `a/.b/c`。但是，模式 `a/*/c` 不会匹配。   

可以通过设置 `dot:true` 选项，让 glob 将点当成普通字符来对待。    

### Basename Matching

如果设置了 `matchBase: true` 选项，模式中也不包含任何的斜线 \/，那么 glob 会在树中搜索
所有的和 basename 匹配的文件。例如，`*.js` 会匹配 `test/simple/basic.js`。    

### glob.hasMagic(pattern,[options])

如果模式中包含任意的特殊字符，就返回 `true`。    

注意 options 会影响结果。    

### glob(pattern,[options], cb)

+ `pattern` `{String}`
+ `options` `{Object}`
+ `cb` `{Function}`
  - `err` `{Error | null}`
  - `matches` `{Array{String}}` 匹配的文件名

执行异步 glob 搜索。   

### glob.sync(pattern,[options])

+ return: `{Array{String}}`   

### Options

除了下面标注出的选项，其他选项默认都是 `false`。    

+ `cwd` 用来搜索的 cwd。默认 `process.cwd()`
+ `root` 以 `/` 起始的模式要挂载到的位置。默认 `path.resolve(options.cwd, '/')`
+ `dot`
+ `nomount`，默认情况下，以 `/` 起始的模式会挂载到 root 配置的路径上，以便可以返回一个
有效的文件系统路径。配置这个选项来禁止这种行为
+ `mark` 在匹配的目录中添加一个 `/` 字符
+ `nosort` 不要排序结果
+ `stat`
+ `silent` 当尝试读取目录然后遇到错误时，会在 stderr 中打印一条警告。设置为 `true` 取消
掉警告信息
+ `strict` 当尝试读取目录然后遇到错误时，进程会继续其他的搜索，设置为 `true` 抛出一个错误
+ `cache`
+ `statCache`
+ `nounique` 在一些情况下，括号扩展模式会导致一些相同的文件在结果集合中出现多次，默认情况下，
glob 不会允许重复的出现，设置这个选项禁止这种行为
+ `nonull` 设置这个选项就可以永远也不会返回一个空集
+ `nobrace` 不扩展 `{a,b}` 和 `{1..3}` 括号集
+ `noext`  Do not match `+(a|b)` "extglob" patterns.
+ `nocase` 执行大小写不敏感匹配。
+ `matchBase` 如果模式中不包含斜线，那就仅执行文件名的匹配。即 `*.js` 等价于 `**/*.js`
+ `nodir` 不匹配目录，只匹配文件
+ `ignore`