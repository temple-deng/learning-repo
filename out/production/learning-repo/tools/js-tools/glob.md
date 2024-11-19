# glob 模块

glob 是指使用 shell 使用的匹配文件的模式。   

## 用法

```javascript
var glob = require('glob');

// options is optional
glob("**/*.js", options, function (er, files) {
  // files is an array of filenames.
  // If the `nonull` option is set, and nothing
  // was found, then files is ["**/*.js"]
  // er is an error object or null.
})
```   

## Glob Primer   

在解析路径部分模式之前，大括号括起来的部分会扩展到一个 set里。大括号部分以 `{` 开头，
`}` 结尾，里面有任意数量的逗号分隔的部分。大括号部分可以包含斜杠 `/` 字符，所以 `a{/b/c,bcd}`
会扩展成 `a/b/c` 和 `abcd`。    

下面的字符当用在路径部分时有特殊的意义：  

+ `*` 匹配在单一路径部分的0或多个字符（这里的单一路径部分个人理解为只能在一层的目录中寻找）
+ `?` 匹配一个字符
+ `[...]` 匹配一个范围内的字符，类似于正则中的。如果第一个字符是 `!` 或者 `^` 就匹配任意不在
范围内的字符。注意这里如果按照正则中的理解，匹配不在范围内的字符，仍然意味着需要匹配一个字符。  
+ `!(pattern|pattern|pattern)` 匹配任何与提供的 pattern 都不匹配的任何东西（这里任何东西能不能是空字符还不确定）
+ `?(pattern|pattern|pattern)` 匹配提供的 pattern 的零或一次出现（待测试）
+ `+(pattern|pattern|pattern)` 匹配提供的 pattern 的一次或多次出现
+ `*(a|b|c)` 匹配提供的 pattern 的零或多次出现
+ `@(pattern|pat*|pat?erN)` 与其中一个 pattern 匹配
+ `**` 貌似是如果在一段路径中只有这个东西，就可以匹配零或多个目录子目录（`/**/`）    

### Dots 点

如果一个文件或者目录的路径部分的第一个字符是 `.`，那么它不会和任意路径模式匹配，除非模式的
对应部分也是以 `.` 作为第一个字符。   

例如，`a/.*/c` 可以与文件 `a/.b/c`匹配，但是 `a/*/c` 就不行，因为 `*` 不能以点字符开头。   

### Basename Matching

如果将选项 `matchBase: true` 设置了，并且 pattern 中没有任何的斜杠，那么就会在目录树中
寻找 basename 名的文件。例如，`*.js` 会匹配 `test/simple/basic.js`。但是不清楚这个目录树
是整个目录树，还是从当前目录开始的目录树啊。    

### Empty Set  

如果没有找到匹配的任何文件，就返回空数组，这点和 shell 不同。   

## glob.hasMagic(pattern, [options])

如果在 pattern 中有任意的特殊字符返回 true, 否则返回 false。   

注意选项会影响结果。例如设置了 `noext:true`，那么 `+(a|b)` 不被任务时 magic pattern。
如果 pattern 有大括号扩展，例如 `a/{b/c,x/y}` 也被认为是 magical，除非 `nobrace:true`

## glob(pattern, [options], cb)

+ `pattern` `{String}` 匹配的模式
+ `options` `Object`
+ `cb` `{Function}`  
  - `err` `{Error | null}`
  - `matches` `{Array<String>}` 匹配的文件名   

执行异步 glob 查找

## glob.sync(pattern, [options])

执行同步查找

## Class: glob.Glob  

```javascript
var Glob = require("glob").Glob
var mg = new Glob(pattern, options, cb)
```   

这是个 EventEmitter,会立即开始查找。    

### new glob.Glob(pattern, [options], [cb])

如果设置了 `sync` 标记，匹配结果会立即在 `g.found` 上可用。   

### 属性

+ `minimatch` glob 使用的 minimatch 对象
+ `options` 传入的 options 对象
+ `aborted` 布尔值，会在调用 `abort()` 时设为 true。
+ `cache` Convenience object. Each field has the following possible values:
  - `false` - 路径不存在
  - `true` - 路径存在
  - `FILE` - 路径存在，且不是目录
  - `DIR` - 路径存在，且是目录
  - `[file, entries, ...]` 路径存在，是目录，这个数组是 `fs.readdir` 的结果
+ `statCache` 缓存 `fs.stat` 的结果，阻止 statting 同样的路径多次（这个stat貌似指文件的信息，比如说修改时间啊，创建者啊）
+ `symlinks` 记录哪个路径时符号链接，与解析 `**` 有关
+ `realpathCache` 一个可选的对象传递给 `fs.realpath` 来最小化不必要的系统调用。    

### 事件

+ `end` 当匹配结束，即所有匹配找到时触发。如果设置了 `nonull`，且没找到任何匹配，`matchs` 会包含原始的 `pattern`。
+ `match` 每次找到一个匹配
+ `error`
+  `abort`

### 方法

+ `pause`
+ `resume`
+ `abort`

### options

+ `cwd`- 用来查找的当前工作目录，默认是 `process.cwd()`
+ `root` - 当 pattern 以 `/` 开头时挂载的位置，默认是 `path.resolve(options.cwd, "/")`
+ `dot` - 在常规匹配时正常对待点文件
+ `nomount` - 禁止上面的挂载行为
+ `mark` - 为目录匹配添加一个 `/` 字符
+ `nosort` - 不要排序结果
+ `stat`- 设置为 true 就 stat 所有结果。
+ `silent` - 当尝试读取目录遇到非常规错误时，或输出一条警告。设置为 true 就忽视这种警告
+ `strict` - 同上，进程会继续查找其他匹配，设置这个属性会在这种情况下报错
+ `cache`
+ `statCache`
+ `symlinks`
+ `nounique` - 在一些情况下，大括号扩展会导致一些文件在结果集中出现多次
+ `nonull` - 永远不要返回一个空数组
+ `debug`
+ `nobrace`
+ `noglobstar` - 将 `**` 看做是一个普通的 `*`
+ `noext` - 不要匹配 `+(a|b)` 的 "extglob" 模式
+ `nocase` - 执行大小写不敏感的匹配
+ `matchBase`
+ `nodir` - 不匹配目录
+ `ignore` - 添加一个路径或者一个 pattern 的数组来从匹配集中排除东西
+ `follow` - follow 符号链接当 `**`
+ `realpath`
+ `absolute`
