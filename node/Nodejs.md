# Nodejs

> 摘自《JavaScript 标准参考教程（alpha）》，by 阮一峰

---

## 1.概述
---
全局对象：
- global：表示Node所在的全局环境，类似于浏览器的window对象。需要注意的是，如果在浏览器中声明一个全局变量，实际上是声明了一个全局对象的属性，比如var x = 1等同于设置window.x = 1，但是Node不是这样，至少在模块中不是这样（REPL环境的行为与浏览器一致）。在模块文件中，声明var x = 1，该变量不是global对象的属性，global.x等于undefined。这是因为模块的全局变量都是该模块私有的，其他模块无法取到。

- process：该对象表示Node所处的当前进程，允许开发者与该进程互动。

- console：指向Node内置的console模块，提供命令行环境中的标准输入、标准输出功能。

全局函数
setTimeout()、clearTimeout()、setInterval()、clearInterval()、require()、Buffer()

全局变量
__filename 包含绝对路径的文件名  __dirname

核心模块
- http：提供HTTP服务器功能。
- url：解析URL。
- fs：与文件系统交互。
- querystring：解析URL的查询字符串。
- child_process：新建子进程。
- util：提供一系列实用小工具。
- path：处理文件路径。
- crypto：提供加密和解密功能，基本上是对OpenSSL的包装。


##  2. CommonJS规范
---
### module对象
Node内部提供一个Module构建函数。所有模块都是Module的实例。

```javascript
function Module(id, parent) {
  this.id = id;
  this.exports = {};
  this.parent = parent;
  // ...
```

每个模块内部，都有一个module对象，代表当前模块。它有以下属性。

+ module.id 模块的识别符，通常是带有绝对路径的模块文件名。
+ module.filename 模块的文件名，带有绝对路径。
+ module.loaded 返回一个布尔值，表示模块是否已经完成加载。
+ module.parent 返回一个对象，表示调用该模块的模块。
+ module.children 返回一个数组，表示该模块要用到的其他模块。
+ module.exports 表示模块对外输出的值。

```javascript
var lodash = require('lodash');
module.exports._ = lodash;
console.log(module);
```

输出
```javascript
Module = {
  id: '.',
  exports: { _ : [Function]},
  parent: null,
  filename: "f\\github\\project-test\\react\\hehe.js",
  loaded: false,
  children: [
    Module {
      id: 'f:\\github\\project-test\\react\\node_modules\\lodash\\index.js',
      exports: [Object],
      parent: [Circular],
      filename: 'f:\\github\\project-test\\react\\node_modules\\lodash\\index.js',
      loaded: true,
      childrem: [],
      paths: [Object]
    }
  ],
  paths: [
    'f:\\github\\project-test\\react\\node_modules',
    'f:\\github\\project-test\\node_modules',
    'f:\\github\\node_modules',
    'f:\\node_modules'
  ]
}
```

require方法有一个main属性，可以用来判断模块是直接执行，还是被调用执行。
直接执行的时候（node module.js），require.main属性指向模块本身。

```
require.main === module
// true
```

调用执行的时候（通过require加载该脚本执行），上面的表达式返回false。

### require函数的加载规则
（1）如果参数字符串以“/”开头，则表示加载的是一个位于绝对路径的模块文件。比如，require('/home/marco/foo.js')将加载/home/marco/foo.js。

（2）如果参数字符串以“./”开头，则表示加载的是一个位于相对路径（跟当前执行脚本的位置相比）的模块文件。比如，require('./circle')将加载当前脚本同一目录的circle.js。

（3）如果参数字符串不以“./“或”/“开头，则表示加载的是一个默认提供的核心模块（位于Node的系统安装目录中），或者一个位于各级node_modules目录的已安装模块（全局安装或局部安装）。

（4）如果参数字符串不以“./“或”/“开头，而且是一个路径，比如require('example-module/path/to/file')，则将先找到example-module的位置，然后再以它为参数，找到后续路径。

（5）如果指定的模块文件没有发现，Node会尝试为文件名添加.js、.json、.node后，再去搜索。.js件会以文本格式的JavaScript脚本文件解析，.json文件会以JSON格式的文本文件解析，.node文件会以编译后的二进制文件解析。

（6）如果想得到require命令加载的确切文件名，使用require.resolve()方法。

（7）require发现参数字符串指向一个目录以后，会自动查看该目录的package.json文件，然后加载main字段指定的入口文件。如果package.json文件没有main字段，或者根本就没有package.json文件，则会加载该目录下的index.js文件或index.node文件。


## package.json
---
dependencies和devDependencies两项，分别指定了项目运行所依赖的模块、项目开发所需要的模块。

dependencies和devDependencies这两项，都指向一个对象。该对象的各个成员，分别由模块名和对应的版本要求组成。对应的版本可以加上各种限定，主要有以下几种：
- 指定版本：比如1.2.2，遵循“大版本.次要版本.小版本”的格式规定，安装时只安装指定版本。
- 波浪号（tilde）+指定版本：比如~1.2.2，表示安装1.2.x的最新版本（不低于1.2.2），但是不安装1.3.x，也就是说安装时不改变大版本号和次要版本号。
- 插入号（caret）+指定版本：比如ˆ1.2.2，表示安装1.x.x的最新版本（不低于1.2.2），但是不安装2.x.x，也就是说安装时不改变大版本号。需要注意的是，如果大版本号为0，则插入号的行为与波浪号相同，这是因为此时处于开发阶段，即使是次要版本号变动，也可能带来程序的不兼容。
- latest：安装最新版本。




<br>
<br>

##   2.File System
- fs.readFile(file[, options], callback)
 + options Object | String
  - encoding String | Null default = null
  - flag String default = 'r'
如果没有传递options参数，默认返回的是buffer格式的数据，如果opitons是字符串就默认为编码方式。

- fs.readFileSync(file[, options])
同步读取文件，返回一个字符串。,第二个参数是编码方式，默认是返回Buffer格式

- fs.writeFile(file, data[, options], callback)
  + data String | Buffer
  + options Object | String
    - encoding String | Null default = 'utf8'
    - mode Number default = 0o666
    - flag String default = 'w'

写入的编码方式默认为utf8, 如果传入的数据是buffer格式，那么编码方式会被忽略。默认是覆盖方式的写入

- fs.writeFileSync(file, data[, options])
同步写入文件

- fs.readdir(path, callback)
读取目录，回调函数的第二个参数是返回的文件或目录名字组成的数组。

- fs.watch(filename[, options][, listener])
监听文件，回调函数有两个参数，第一个是事件event，可能是"rename"也可能是'change',第二个是filename。
注意是rename意味着可能监听就时效了吧。 这个函数返回 fs.FSWatcher 对象，可以监听change事件和error事件。 调用这个返回对象的close()方法可以停止监听。

- fs.appendFile(file, data[, options], callback)
在文件最后追加内容吧。参数类似写入吧

- fs.createReadStream(path[, options])
创建可读流，返回一个ReadStream object。
 + options 
  ```
  {
  start:0,
  end: 10,
  flags: 'r',
  encoding: null,
  fd: null,
  mode: 0o666,
  autoClose: true
}
  ```
不设置编码方式的话，返回的是buffer格式的内容。

<br>
<br>
<br>

##  3.path module
- path.join([path1][, path2][, ...])
  path.join方法用于连接路径。该方法的主要用途在于，会正确使用当前系统的路径分隔符，Unix系统是”/“，Windows系统是”\“。

- path.resolve([from ...], to)
  path.resolve方法用于将相对路径转为绝对路径。
它可以接受多个参数，依次表示所要进入的路径，直到将最后一个参数转为绝对路径。如果根据参数无法得到绝对路径，就以当前所在路径作为基准。除了根目录，该方法的返回值都不带尾部的斜杠。
  ```
    path.resolve('foo/bar', '/tmp/file/', '..', 'a/../subfile')
    //上面代码的实例，执行效果类似下面的命令。
    
    $ cd foo/bar
    $ cd /tmp/file/
    $ cd ..
    $ cd a/../subfile
    $ pwd
  ```
  
- path.basename(p[, ext])
  返回文件名，如果加了ext扩展名参数，返回的文件名就不包括扩展名

- path.dirname(p)
 返回目录名咯

