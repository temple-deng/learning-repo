通过 npm_package_ 前缀，npm 脚本可以拿到 package.json 里面的字段。   

```js
// view.js
console.log(process.env.npm_package_name); // foo
console.log(process.env.npm_package_version); // 1.2.5
```  


env命令或printenv命令，可以显示所有环境变量。   


PerformanceEntry 对象有以下的属性：   

- `name`
- `entryType`
- `startTime`: DOMHighResTimeStamp。
- `duration`: DOMHighResTimeStamp。   

目前支持的 entryType 类型及其背后接口：   

- `mark`: PerformanceMark
- `measure`: PerformanceMeasure
- `navigation`: PerformanceNavigationTiming
- `frame`: PerformanceResourceTiming
- `resource`: PerformaceResourceTiming
- `rerver`: PerformanceServerTiming    

### 图片优化   

1. 是否可以不使用图片，图片上的文字交互性很差
2. 在可能的情况下，使用 svg 图片
3. 使用普通图片的话，使用响应式图片
4. 尽量使用 webP，然后使用另一种格式作为 fallback
5. 用 video 替换 gif，gif 颜色位数有限，且文件大小要比文件大的多
6. 使用 imagemin 压缩图片
7. lazy-load 图片和视频    


高精度是指精确到千分之一毫秒。   

![resource](https://w3c.github.io/perf-timing-primer/images/resource-timing-overview-1.png) 


![navigation Timing](https://w3c.github.io/perf-timing-primer/images/navigation-timing-attributes.png)    

initiatorType
如果是 element 返回 localName
如果是 css，返回 css
如果是 xhr，返回 xmlhttprequest  
navigation 返回空串     

usage 的配置项相当于自动引入 core-js，而且是会根据每个文件使用的 api 不同，只在当前文件引入需要 polyfill 的 api 的 core-js 模块，按需加载，但是仍然是污染全局变量的用法。    

class 组件的问题

大型组件难拆分和重构，也难测试
相同的业务逻辑，分散到各个方法中，逻辑混乱
复用逻辑复杂    

有个 host 以及 remote 的概念，host 就是依赖其他应用模块的应用，remote 就是远程被依赖的那个模块。当然一个应用 可能即是 host 又是 remote。    

静态表有 61 个条目，1-61。动态表可以包含完全重复的条目    

QUIC 和核心变动：

和 TLS 深度集成
支持多个独立的字节流
使用 connection IDs
使用帧传输    

```ts
function isFoo(arg: any): arg is Foo {
    return arg.foo !=== undefined;
}
```   

```css
conic-gradient( [ from <angle> ]? [ at <position> ], <angular-color-stop-list> )

radial-gradient([ <ending-shape> || <size> ]? [ at <position> ]?, <color-stop-list>);
```   

需要注意的是，角渐变断点中设置的角度值是一个相对角度值，最终渲染的角度值是和起始角度累加的值。    

所谓遮罩，就是原始图片只显示遮罩图片非透明的部分。   

```ts
window.CSS.registerProperty({
    name: '--my-color',
    syntax: '<color>',
    inherits: false,
    initialValue: '#c0ffee',
});
```    

```css
@property --my-angle {
    syntax: '<angle>';
    inherits: false;
    initial-value: 0deg;
}
```    

`navigator.mediaDevices.getUserMedia`   

衬线，是指笔画末端的装饰线，是否有衬线是区分不同英文字体最显著的特征。有衬线的字体叫做衬线字体（Serif），而没有的则是非衬线（Sans-Serif）。（「Serif」意为「衬线」，「Sans」在法文中意为「没有」）

```
Content-Security-Policy: script-src 'self'; object-src 'none';
style-src cdn.example.org third-party.org; child-src https:

<meta http-equiv="Content-Security-Policy" content="script-src 'self'; object-src 'none'; style-src cdn.example.org third-party.org; child-src https:">

Content-Security-Policy: default-src 'self'; report-uri http://reportcollector.example.com/collector.cgi     
```    

instanceof 左边要求一个对象，原始类型会返回 false，右边也是要求一个对象，非对象会报错。

以下两种情况，JavaScript 会自动将数值转为科学计数法表示，其他情况都采用字面形式直接表示。
小数点前的数字多于21位
小于1且小数点后的零多于5个，即 0.000000xxxxx   


parseInt 如果第二个参数不是数值，会被自动转为一个整数。这个整数只有在2到36之间，才能得到有意义的结果， 超出这个范围，则返回NaN。如果第二个参数是0、undefined和null，则直接忽略。   


The Object.seal() method seals an object, preventing new properties from being added to it and marking all existing properties as non-configurable.也不能删除属性   

URL 的各个组成部分，只能使用以下这些字符:
26个英语字母（包括大写和小写）
10个阿拉伯数字
连词号（-）
句点（.）
下划线（_）


- `clientHeight, clientWidth` 包括 padding 部分，不包括滚动条部分，始终是整数，小数会被取整。
- `getBoundingClientRect()` 边框会算在内
    + x: 相对于视口的 x 坐标
    + y: 相对于视口的 y 坐标
    + height
    + width
    + left 等同于 x
    + right
    + top
    + bottom

- 目前，如果非同源，共有三种行为受到限制。
    + 无法读取非同源网页的 Cookie、LocalStorage 和 IndexedDB。
    + 无法接触非同源网页的 DOM。
    + 无法向非同源地址发送 AJAX 请求（可以发送，但浏览器会拒绝接受响应）。
- 如果两个窗口一级域名相同，只是二级域名不同，那么设置上一节介绍的document.domain属性，就可以规避同源政策，拿到 DOM。


- Symbol 值不能与其他类型的值进行运算，会报错。但是，Symbol 值可以显式转为字符串。另外，Symbol 值也可以转为布尔值，但是不能转为数值。
- `Symbol.prototype.description`
- `Symbol.for()`, `Symbol.keyFor()`
- `Symbol.for()` 为 Symbol 值登记的名字，是全局环境的，不管有没有在全局环境运行。
- `Symbol.hasInstance`: 当其他对象使用instanceof运算符，判断是否为该对象的实例时，会调用这个方法。比如，`foo instanceof Foo`
在语言内部，实际调用的是 `Foo[Symbol.hasInstance](foo)`。   

```js
var bar = {
    [Symbol.hasInstance](obj) {
        return obj.a === 2;
    }
};

var foo = {a: 1};
foo instanceof bar; // false
foo.a = 2;
foo instanceof bar; // true
```    

- `Symbol.match(string)`, `Symbol.replace(this, replaceValue)` 第二个参数是替换后的值，不是源字符串
- `Symbol.search(string)`, `Symbol.split(string)`    
- `Symbol.iterator`
- `Symbol.toPrimitive` 指向一个方法，该对象被转为原始类型的值时，会调用这个方法，有一个字符串参数
    + `number`: 该场合需要转成数值
    + `string`: 需要转成字符串
    + `default`: 可以转成数值，也可以转成字符串
- `Symbol.toStringTag` 指向一个方法，在该对象上面调用 `Object.prototype.toString` 时，它的返回值会出现在
toString 返回的字符串中，表示对象的类型，也就是说，这个属性可以用来定制 `[object Object]` 中 object 后面的字符串


- `export { foo, bar } from 'my_module'`;
- 值得注意的是像这样写成一行，`foo` 和 `bar` 实际上并没有被导入当前模块，知识相当于对外转发了


- 二进制数组由三类对象组成
    + ArrayBuffer 对象，代表内存中一段二进制数据，可以通过"视图"进行操作，"视图"部署了数组接口，这意味着，
    可以用数组的方法操作内存
    + TypedArray 视图，共包括 9 种类型的视图，比如 Uint8Array
    + DataView 视图，可以自定义复合格式的视图，比如第一个字节是 Uint8，第二个是 Int16.     
- 简单说，ArrayBuffer 代表原始的二进制数据，TypedArray 视图用来读取简单类型的二进制数据，DataView 用来读取
复杂类型的二进制数据。


- flex: 1 等同于 `flex: 1 1 0%`, `flex: 1 2` 等同于 `flex: 1 2 0%`。即 flex-basis 使用的不是默认值 auto，
而是使用的 0%。
- `flex: 100px` 等同于 `flex: 1 1 100px`，即 `flex-grow` 使用的不是默认值 0，而是使用的 1。
- `flex: 0` = `flex: 0 1 0%`
- `flex: none` = `flex: 0 0 auto`
- `flex: 1` = `flex: 1 1 0%`
- `flex: auto` = `flex: 1 1 auto`  


```html
<style>
:root {
    --color: blue;
}
div {
    --color: green;
}
#alert {
    --color: red;
}
* {
    color: var(--color);
}
</style>
<p>I inherited blue from the root element!</p>
<div>I got green set directly on me!</div>
<div id='alert'>
    While I got red set directly on me!
    <p>I'm red too, because of inheritance</p>
</div>
```    


使用 `createImageData()` 方法可以创建一个新的空白的 ImageData 对象。  

`var myImageData = ctx.createImageData(width, height); `  

默认情况下所有像素都是透明的黑色。就是全是0呗。   

也可以创建一个另外的 ImageData 对象来新建一个通用尺寸大小的 ImageData 对象。不过新对象的所有像素仍然都是透明黑色。并不会拷贝具体的数据。  

`var myImageData = ctx.createImageData(anotherImageData);`  

### 从context 中获取像素的数据

可以从 context 中获得一个拷贝了像素数据的 ImageData 对象，使用 `getImageData()`。  

`var myImageData = ctx.getImageData(left, top, width, height);`   

### 将像素数据绘制到 context 中

使用 `putImageData()` 方法将像素数据绘制到 context中：  

`ctx.putImageData(myImageData, dx, dy)`  


注意 ETAG 是一个带双引号的字符串：   

```
ETag: "xyzzy"
ETag: W/"xyzzy"
ETag: ""
```    

Set-Cookie: id=a3fWa; Expires=Wed, 21 Oct 2015 07:28:00 GMT; Secure; HttpOnly

X-Frame-Options: DENY
X-Frame-Options: SAMEORIGIN
X-Frame-Options: ALLOW-FROM https://example.com/


```css
.wrapper {
   display: grid;
   grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}
```    

如果没有设定宽度或弹性基准，弹性基准默认为 auto，即各弹性元素的基准为内容不换行的宽度。auto 是个特殊的值，默认为 content， 但是如果设定了宽度，弹性基准为宽度。    

`grid-template-columns: repeat(auto-fill, [top] 5em [bottom]);`。自动重复的局限是，只能有一个可选的
栅格线名称、一个尺寸固定的轨道和另一个可选的栅格线名称。   

在一个轨道模板中只能有一个自动重复的模式，因此，下述写法是正确的。   

`grid-template-columns: repeat(auto-fill, 4em) repeat(auto-fill, 2em)`。    

auto-fill 至少会重复一次轨道模板，即使出于什么原因在栅格容器中放不下也是如此。而且，只要空间足够，能重复多少次就重复多少次。   

如果使用 auto-fit，没有栅格元素的轨道将会被剔除。     

在这个模型中，表格边框的一半含在宽度之内，另一半边框在这个范围之外。位于外边距中。





当调用一个函数时（激活），一个新的执行上下文就会被创建。而一个执行上下文的生命周期可以分为两个阶段。    

+ 创建阶段。在这个阶段中，执行上下文会分别创建变量对象，建立作用域链，以及确定this的指向。
+ 代码执行阶段。创建完成之后，就会开始执行代码，这个时候，会完成变量赋值，函数引用，以及执行其他代码。   


一个初始的 git 仓库的内容与下面类似：    

```
.git/hooks
.git/hooks/commit-msg.sample
.git/hooks/applypatch-msg.sample
....
.git/refs
.git/refs/heads
.git/refs/remotes
.git/refs/tags
.git/refs/stash
.git/config
.git/objects
.git/objects/pack
.git/objects/info
.git/HEAD
.git/branches
.git/info
.git/info/exclude
```   


任何时候，都可以从当前索引创建一个树对象，只要通过底层的 `git write-tree` 命令来捕获索引
当前信息的快照就可以了。   

生成树对象后，可以通过 `git commit-tree` 命令生成提交对象：   


+ 一个简单的字面值文件名匹配任何目录中的同名文件，注意同时也会匹配目录，即文件名即可以匹配文件，又可以匹配目录
+ 目录名由末尾的反斜线 (/) 标记。这能匹配同名的目录和子目录，但不匹配文件。注意这里说的很清楚，
必须是个目录名才能匹配子目录。而作为文件路径一部分的目录是不行的。比如 `debug/32bit/*.o` 是
不能匹配 `abc/debug/32bit/*.o` 的


这里应该是这个意思，SHA1 值代表一个显示的引用，直接指向了一个对象，而其他的一些引用则都是隐式
或者叫符号引用，它们应该是直接指向了一个 SHA1 值，而这个 SHA1 值才是直接指向了某个对象。      

本地特性分支名称、远程跟踪分支名称和标签名都是引用。   


重新排序、编辑、删除，把多个提交合并成一个，把一个提交分离成多个，这都可以很轻松地使用 `git rebase`
命令的 -i 或者 --interactive 选项完成。此命令允许我们修改一个分支的大小，然后把它们放回原来
的分支或者不同的分支。    

```
[master] Use American spellings           # 4926ff2
[master^] Finish my colour haiku          # 058aa696
[master~2] Use color instead of colour    # 3371a4d
[master~3] Start my haiku             # f6ae4c2
```    

`$ git rebase -i master~3`   

进入编辑器，显示如下内容：   

![rebase-i](https://raw.githubusercontent.com/temple-deng/markdown-images/master/other/rebase-i.png)  

`git clone --bare` 的话会克隆一个裸的版本库，但是`git init --bare` 的话应该是创建一个
新的裸版本库。两者的区别的话 clone 下的裸版本库应该有远程版本库中的对象，但 init 的话是一个
全新的版本库。    


refspec 把远程版本库中的分支名映射到本地版本库中的分支名。    

因为 refspec 必须同时从本地版本库和远程版本库指定分支，所以完整的分支名在 refspec 中是很常见的，
通常也是必须的。在 refspec 中，你通常会看到开发分支名有 refs/heads/前缀，远程追踪分支名有
refs/remotes/ 前缀。   

refspec 语法：    

`[+]source:destination`    

如果有加号则表示不会在传输过程中进行正常的快进安全检查。星号允许用有限形式的通配符匹配分支名。     

在某些应用中，源引用是可选的；在另一些应用中，冒号和目标引用是可选的。   

refspec 在 `git fetch` `git push` `git pull` 中都使用。refspec 中的数据流如下：    


操作 | 源 | 目标
---------|----------|---------
 push | 推送的本地引用 | 更新的远程引用
 fetch | 抓取的远程引用 | 更新的本地引用
    
假如 `git fetch` 使用了如下的引用：`+refs/heads/*:refs/remotes/remote/*`。   

此处的 refspec 可以这样解释：在命名空间（这应该是指远程库的命名空间） _refs/heads/_ 中来自
远程版本库的所有源分支映射到本地版本库，使用由远程版本库名来构造名字，并放在_refs/remotes/remote_ 
的命名空间中。    

假如在 `git push` 操作时有如下引用：`+refs/heads/*:refs/heads/*`。      

此处的 refspec 可以这样解释：从本地版本库中，将源命名空间 _refs/heads/_ 下发现的所有分支名，放在
远程版本库的目标命名空间 _refs/heads/_ 的匹配分支中，使用相似的名字来命名。    

如果在执行 `git push` 时没有指定 refspec，首先，如果命令种没有明确指定的远程版本库，Git 会假设
我们使用 origin。如果没有 refspec，`git push` 会将你的提交发送到远程版本库中你与上游版本库共存
的分支。不在上游版本库中的任何本地分支都不会发送到上游：分支必须存在，并且名字匹配。因此，新分支名
必须显式地用分支名来推送。    


事件 | event handler | 描述
---------|----------|---------
 drag | `ondrag` | 当一个元素或一段被选择的文本被拖动时触发，这个事件从开始拖动到结束拖动一直在触发，而且好像即便不移动鼠标也会触发，看样子像是定时触发
 dragend | `ondragend` | 拖动操作完成时触发
 dragenter | `ondragenter` | 当一个被拖动的元素或一段被拖动的选中文本进入一个有效的 drop target 时触发
 dragexit | `ondragexit` | 当一个元素不再是拖动操作的目标时
 dragleave | `ondragleave` | 当一个被拖动的元素或选择的文本离开一个有效的 drop target 时触发
 dragstart | `ondragstart` | 当用户开始拖动一个元素或者一段选中的文本时触发
 dragover | `ondragover` | 当一个被拖动的元素或一段被拖动的选中文本进入一个有效的 drop target 时触发
 drop | `ondrop` | 当一个元素或选中的文本被放置到一个有效的 drop target 时触发


可以提供多种格式的数据。通过多次调用 setData 方法增加不同的格式。格式顺序需从 具体 到 一般。  

```javascript
var dt = event.dataTransfer;
dt.setData("application/x-bookmark", bookmarkString);
dt.setData("text/uri-list", "http://www.mozilla.org");
dt.setData("text/plain", "http://www.mozilla.org");
```  

## 1. DataTransfer

### 1.1 属性

+ `dropEffect`: 控制了拖放过程中的反馈效果。其会影响拖动过程中鼠标的外形。可能的值：copy, move, link, none。设置非法的值时没有效果，并且值不变。
+ `effectAllowed`
+ `files`: 返回文件列表。
+ `items`: 返回一个 `DataTransferItem ` 对象的列表。
+ `types`: 返回一个数据格式的数组，每种格式用字符串表示，如果有文件，其中之一是字符串 'Files'。

### 1.2 方法

+ `clearData([format])`: 移除给定类型的数据。类型参数是可选的。如果没有指定类型参数，就会移除所有类型的数据。但是这个方法不能移除文件，并且只能在 `dragstart` 中调用。
+ `getData(format)`
+ `setData(format, data)`
+ `setDragImage(img, xOffset, yOffset)`

## 2. DataTransferItem

`DataTransferItem` 对象代表了一个拖拽数据项目。

### 2.1 属性

+ `kind`: 只读。代表了项目的类型。 'string' 或者 'file'。
+ `type`: 只读。项目的MIME类型。

### 2.2 方法

+ `getAsFile()`: 返回对应的文件对象或者 null。
+ `getAsString(callback)`: 使用项目的字符串格式作参数调用回调函数。

## 3. DataTransferItemList

`DataTransferItemList` 对象就是 `DataTransferItem` 对象的列表。即 `DataTransfer`对象。

+ `length`
+ `add(data, type)` or `add(file)`
+ `remove(index)`
+ `clear()`



用 "(?:" 和 ")" 对子表达式分组，但不创建带数字的引用。


ES6 中一共有 5 种方法可以遍历对象的属性：    

1. `for...in`: 遍历对象的可枚举属性（包括继承的属性）
2. `Object.keys()`: 遍历对象自有可枚举属性
3. `Object.getOwnPropertyNames(obj)`: 遍历对象自有属性
4. `Object.getOwnPropertySymbols(obj)`: 遍历对象自有 Symbol 属性
5. `Reflect.ownKeys(obj)`: 包含对自身所有键名，包含 Symbol。     

以上的 5 种方法变量对象的键名，都遵守同样的属性遍历和次序规则：    

1. 首先遍历所有数值键，按照数值升序排列
2. 其次遍历所有字符串键，按照加入时间升序排列
3. 最后遍历所有 Symbol 键，按照加入时间升序排列


ES6 新增了一个关键字 `super`，指向当前对象的原型对象。    

```js
const proto = {
    foo: 'hello'
};

const obj = {
    foo: 'world',
    find() {
        return super.foo;
    }
};

Object.setPrototypeOf(obj, proto);
obj.find();  // "hello"
```     

## 10.2 Object.assign()方法

这个方法用于对象属性的合并，将源对象的所有自有可枚举属性，复制到目标对象。如果目标对象与源对象有
同名属性，或多个源对象有同名属性，则后面的属性会覆盖前面的属性。  









通过网络链路和交换机移动数据有两种基本方法：**电路交换**和**分组交换**。    

在电路交换网络中，在端系统间通信会话期间，预留了端系统间通信沿路径所需要的资源。在分组交换网络中，这些资源是
不预留的。    


1. 处理时延。检查分组首部和决定将该跟组导向何处所需要的时间是 **处理时延**的一部分。
2. 排队时延。
3. 传输时延。用L 比特表示一个分组的长度，用 R bps 表示从路由器 A 到路由器 B 的链路传输速率。传输
时延是 L/R。
4. 从链路的起点到路由器传播所需要的时延是传播时延。   


TCP 服务模型包括面向连接服务和可靠数据传输服务。这是 TCP 可以提供的两个服务。    

+ 面向连接的服务。在应用层数据报文开始流动之前，TCP 让客户和服务器互相交换传输层控制信息。这个所谓
的握手过程提示客户和服务器，使它们为大量分组的到来做好准备。在握手阶段后，一个 **TCP 连接** 就在两个
进程的套接字间建立了。这条连接是全双工的，即连接双方的进程可以在此连接上同时进行报文收发。当应用程序结束
报文发送时，必须拆除该连接。
+ 可靠数据传输服务。通信进程能够依靠TCP，无差错、按适当顺序交付所有发送的数据。当应用程序一端
将字节流传进套接字时，它能够依靠 TCP 将相同的字节流交付给接收方的套接字，而没有字节的丢失和冗余。    


因为 HTTP 服务器并不保存关于客户的任何信息，所以我们说 HTTP 是一个 **无状态协议**。   


当用户主机与远程主机开始一个 FTP 会话时，FTP 的客户端首先在服务器 21 号端口与服务器发起一个用于控制的 TCP 连接。
FTP 客户端也通过该控制连接发送用户的标识和口令，发送改变远程目录的命令。当 FTP 的服务器端从该连接上收到一个
文件传输的命令后，就发起一个到客户端的 TCP 数据连接。FTP 在该数据连接上准确地传送一个文件，然后关闭该连接。在
同一个会话期间，如果用户还要传输另一个文件，FTP 则打开另一个数据连接。因而对于 FTP 传输而言，控制连接贯穿了
整个用户会话期间，但是对会话中的每一次数据传输都要建立一个新的数据连接。注意上面没说数据连接是在哪个端口，
服务器的话通常是端口 20，客户端的话不定。   


大致来说，有3种类型的 DNS 服务器：根 DNS 服务器、顶级域（Top-Level Domain, TLD）DNS 服务器和权威
DNS 服务器。假定一个用户要决定 www.amazon.com 的 IP 地址。粗略来说，将发生以下事件。客户首先
与根服务器之一联系，它将返回顶级域名 com 的 TLD 服务器的 IP 地址。该客户则与这些 TLD 服务器之一联系，
它将为 amazon.com 返回权威服务器的 IP 地址。最后，客户与 amazon.com 权威服务器之一联系，它将为主机名
www.amazon.com 返回其IP 地址。    


网络层提供了主机之间的逻辑通信，而传输层为运行在不同主机上的进程之间提供了逻辑通信。    

![udp](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/udp.png)


解决流水线
差错恢复有两种基本方法：**回退 N 步**（Go Back N, GBN）和 **选择重传**（Selective Repeat, SR）。 


![tcp](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/tcp.png) 


![client-tcp-state](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/client-tcp-state.png) 

![server-tcp-state](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/server-tcp-state.png) 


当一条 TCP 连接开始时，cwnd 的值通常初始设置为一个 MSS 的最小值。在 **慢启动**状态，cwnd 的值以 1 个
MSS 开始并且每当传输的报文段首次被确认就增加一个 MSS。这一个过程每过一个 MSS，发送速率就翻倍。因此，TCP 发送速率
起始慢，但在慢启动阶段以指数增长。     

但是，何时结束这种指数增长呢？慢启动对这个问题提供了几种答案。首先，如果存在一个由超时指示的丢包事件，
TCP 发送方将 cwnd 设置为 1 并重新开始慢启动过程。它还将第二个状态变量的值 ssthresh
设置为 cwnd/2，即当检测到拥塞时将 ssthresh 置为拥塞窗口值的一半。慢启动结束的第二个
方式是直接与 ssthresh 值相关联。因为当检测到拥塞时 ssthresh 设为 cwnd 的值的一半，当到达或超过
ssthresh 的值时，继续使 cwnd 翻番可能有些鲁莽。因此，当 cwnd 的值等于 ssthresh 时，结束慢启动并且 TCP
转移到拥塞避免模式。最后一种结束慢启动的方式是，如果检测到 3 个冗余 ACK，这时 TCP 执行一种快速重传
并进入快速恢复状态。    

综上所述的意思差不多是这样，慢启动一开始 cwnd = 1，开始以翻倍的速率增长，然后如果遇到了超时引起的丢包
事件，就重新启动，继续从 1 开始，并记录 ssthresh 值，等再次增长到 ssthresh / 2 时候进入拥塞避免
模式，在这个模式中会修改 cwnd 增长的模式。如果遇到的是3个冗余 AKC 的丢包事件，进入快速恢复模式，看图的意思，
也会把 ssthresh 记录为 cwnd/2，不过这时候好像 cwnd 不是重置为1，而是改成 ssthresh + 3*MSS。
此外，在拥塞避免和快速恢复模式又遇到超时的话，重复上面的行为。    

转发是指将分组从一个输入链路接口转移到适当的输出链路接口的路由器本地动作。路由选择是指网络范围的过程，以
决定分组从源到目的地所采取的端到端路径。   


![IP-layer](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/IP-layer.png)     

![IP-datagram](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/IP-datagram.png)     

当一台目的主机从相同源收到一系列数据报时，它需要确定这些数据报中的某些是否是一些原来较大的数据报的片。
如果某些数据报是片的话，则它必须进一步确定何时收到了最后一片，并且如何将这些接收到的片拼接到一起
以形成初始的数据报。为了让目的主机执行这些重组任务，IPv4的设计者将标识、标志和片偏移字段放在 IP 数据报首部
中。当生成一个数据报时，发送主机在为该数据报设置源和目的地址的同时再贴上标识号。发送主机通常为它发送的每个数据报
的标识号加 1。当某路由器需要对一个数据报分片时，形成的每个数据报具有初始数据报的源地址、目的地址和标识号。
由于 IP 是不可靠的服务，有点片可能会丢失。因此为了让目的主机绝对地相信它已经收到了初始数据报的最后一片，最后一片
的标志比特被设为 0，而所有其他片的标志比特被设为1.另外，为了让目的主机确定是否丢了一个片，使用偏移量指定
该片应放在初始 IP 数据报的哪个位置。    

因特网控制报文协议（ICMP）被主机和路由器用来彼此沟通网络层的信息。ICMP 最典型的用途是差错报告。    

ICMP 通常被认为是 IP 的一部分，但从体系结构上讲它是位于 IP 之上的，因为 ICMP 报文是承载在 IP 分组
中的。    

ICMP 报文有一个类型字段和一个编码字段，并且包含引起该 ICMP 报文首次生成的 IP 数据报的首部和前 8 字节
内容。      


ICMP 类型 | 编码 | 描述
---------|----------|---------
 0 | 0 | 回显回答（对ping的回答）
 3 | 0 | 目的网络不可达
 3 | 1 | 目的主机不可达
 3 | 2 | 目的协议不可达
 3 | 3 | 目的端口不可达
 3 | 6 | 目的网络未知
 3 | 7 | 目的主机未知
 4 | 0 | 源抑制（拥塞控制）
 8 | 0 | 回显请求
 9 | 0 | 路由器通告
 10 | 0 | 路由器发现
 11 | 0 | TTL 过期
 12 | 0 | IP 首部损坏



光有散列函数的话挡不住中间人攻击。为了执行报文完整性，除了使用密码散列函数，通信双方还需要共享密钥 s。
它被称为 **鉴别密钥**。使用这个密钥，报文完整性能执行如下：   

1. A 生成报文 m，用 s 级联 m 生成 m + s，然后计算 H(m+s)，H(m+s) 被称为**报文鉴别码**（Message Authentication Code, MAC）
2. A 把 MAC 附到报文中发送。
3. B 收到报文，计算 H(m+s)     

最为流行的 MAC 标准是 HMAC。    


开始比较慢并逐渐加速的动画叫做 "ease in"，相反开始速度就很快，然后慢慢减速的动画叫做 "ease out"。
两者结合就是 "ease in out"。   


loader 链式反向执行，最后一个loader应该返回 js 代码。

加了这两个 loader 后如果 js 中 import './style.css'，则会在 `<head>` 里面添加一个 `<style>` 标签。


根据测试来看，css-loader 是用来解析 css 文件的，不然 webpack 不能识别 css 代码，然后应该 还有些额外的功能就是对 css 中引入的模块进行进一步解析的，而 style-loader 就是把 css 代码 生成一个 style 标签嵌入页面的，可以没有 style-loader，最多页面不加载 css，但是不能没有 css-loader，因为没有这个在引入 css 模块时 webpack 会报错。


目前有三种代码分割的方法：   

- 入口点：使用 `entry` 配置项手动分割
- Prevent Duplication: 使用 `SplitChunksPlugin` 去重 chunks
- Dynamic Imports: 模块内调用函数进行代码分割


1. `npm login` 登录，`npm whoami` 查看当前登录的账号
2. `package.json` 至少要有 `name`, `version` 两个字段：
  - `name`: 全小写字母，一个单词不能有空格，可以有中划线和下划线
  - `version`: x.x.x 的形式，遵循语义化版本规范

8. `npm publish` 发布，不过记得要先登录才行，如何更新版本呢 `npm version <update-type>`
其实这个命令应该就只是修改 `package.json` 的 `version` 字段，不过如果我们将一个 git
仓库和 npm 账号关联起来的话，这个命令还会在 git 仓库中打上一个版本的 tag。更新完版本
后，再发布一次即可 `npm publish`
9. 一些语义化版本的建议，当只是做向后兼容的 bug fix 时，修改 patch 部分，当添加了向后
兼容的新功能后，修改 minor 部分，当进行了不兼容的大调整时，修改 major 部分。


+ 项目配置文件 (/path/to/my/project/.npmrc)
+ 用户配置文件 ( $HOME/.npmrc)
+ 全局配置文件 ($PEXFIX/etc/npmrc)
+ npm 内置的配置文件 (/path/to/npm/npmrc)    


6. 波浪线 ~ 范围，如果指定了 minor 的话，patch 是可以改变的，否则 minor 也是可以改变的：
  - `~1.2.3` := `>=1.2.3 <1.3.0`
  - `~1.2` := `>=1.2.0 <1.3.0`
  - `~1` := `>=1.0.0 <2.0.0`
  - `~0.2.3` := `>=0.2.3 <0.3.0`
7. 插入 ^ 范围，最左边非零数字后的所有部分都可以修改：
  - `^1.2.3` := `>=1.2.3 <2.0.0`
  - `^0.2.3` := `>=0.2.3 <0.3.0
  - `^0.0.3` := `>=0.0.3 <0.0.4`



CTR -> getDerivedStateFromProps -> componentWillMount -> render -> componentWillReceiveProps -> getDerivedStateFromProps -> shouldComponentUpdate -> componentWillUpdate -> render

getSnapshotBeforeUpdate -> dom update -> componentDiMount / componentDidUpdate -> updateQueueEffect

bubbleProperties

commitDeletion -> unmountHostComponent -> commitNestedUnmounts -> commitUnmount



npm package 变量
hooks setState 相同值
shell 扩展
performance
babel/preset-env useBuiltIns
cache-control
AbortController
first-paint 或者 first-contentful-paint
getDerivedStateFromProps(props, state)
内置 TLS，（强制使用 TLS 1.3 以上，可以减少一次 RTT）
基于流的多路复用，（减少由 TCP 引发的 HOL Blocking）
基于 Connection ID，（较少网络切换的延迟）
其余的还有一些，比如 ACK 延迟确认等等
Scope hoisting
mainFields, 'jsnext:main'。
失效的场景：
非 ESM 模块
模块被多个 chunk 同时引用

allowSyntheticDefaultImports 相当于我们 import default 一个并没有 export default 的文件，这时候类型检查肯定会 报错，这里就是告诉不要报错了。

esModuleInterop 相当于针对这样的没有 export default 的文件，在编译过程会处理一下，从而让运行时不会报错，默认带有 allowSyntheticDefaultImports。

conic-gradient(from 45deg, white, deepskyblue 45deg, white);

radial-gradient([ <ending-shape> || <size> ]? [ at <position> ]?, <color-stop-list>);

CSS.registerProperty

支持限制的资源
script-src
style-src
img-src
media-src
font-src
object-src
child-src: iframe, frame
frame-ancestors: 嵌入的外部资源，frame, iframe, embed
connect-src: HTTP 连接，通过 XHR, WebSockets, EventSource
worker-src
manifest-src

:has() 关系选择器。@layer    

它们被应用的顺序是，首先是平移，然后是旋转，然后是缩放，而不是你定义它们的顺序。有了独立的变换属性，这也意味着我们可以对它们分别进行动画和过渡。

inputmode, enterkeyhint

:is(), :where()

他们唯一不同之处，就是选择器权重不同。:where() 的优先级总是为 0 ，但是 :is() 的优先级是由它的选择器列表中优先级最高的选择器决定的。

```js
const moduleId = './' + path.posix.relative(this.rootPath, modulePath);
const module = {
    id: moduleId,
    dependencies: new Set(),
    name: [moduleName], // 该模块所属的入口文件
};
```

因为存储浮点值使用的内存空间是存储整数值的两倍，所以ECMAScript总是想方设法把值转换为整数。在小数点后面没有数字的情况下，数值就会变成整数。类似地，如果数值本身就是整数，只是小数点后面跟着0（如1.0），那它也会被转换为整数。

```js
with(location) {
  let qs = search.substring(1);
  let hostName = hostname;
  let url = href;
}
```   


cssText: 包含style属性中的CSS代码
length: 应用给元素的 CSS 属性数量
parentRule: 表示 CSS 信息的 CSSRule 对象
getPropertyPriority(propertyName): 如果属性使用了 !important，就返回 important，否则返回空字符串
getPropertyValue(propertyName): 返回属性 propertyName 的字符串值
item(index): 返回 index 索引的属性名
removeProperty(property)
setProperty(property, value, priority): priority 是 important 或空字符串\

```js
splitChunks: {
    chunsk: 'async',
    minSize: 20000,
    minRemainingSize: 0,
    minChunks: 1,
    maxAsyncRequests: 30,
    maxInitialRequests: 30,
    enforceSizeThreshold: 50000,
    cacheGroups: {
        vendors: {
            test: /[\\/]node_modules[\\/]/,
            priorty: -10
        },
        default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
        }
    }
}
```    

```ts
// 你的答案
type MyParameters<T extends (...args: any[]) => any> = T extends (...arg: infer P) => any? P: never;

type MyReturnType<T> = T extends (...arg: any[]) => infer R ? R : never;
```    

库的使用场景主要有以下几种：

- 全局变量：通过 `<script>` 标签引入第三方库，注入全局变量
- npm 包：通过 `import foo from 'foo'` 导入，符合 ES6 模块规范
- UMD 库：既可以通过 `<script>` 标签引入，又可以通过 import 导入
- 直接扩展全局变量：通过 `<script>` 标签引入后，改变一个全局变量的结构
- 在 npm 包或 UMD 库中扩展全局变量：引用 npm 包或 UMD 库后，改变一个全局变量的结构
- 模块插件：通过 `<script>` 或 import 导入后，改变另一个模块的结构    

export as namespace

```ts
declare global {
    interface String {
        prependHello(): string;
    }
}
```    
```js
const {
  SyncHook,
  SyncBailHook,
  SyncWaterfallHook,
  SyncLoopHook,
  AsyncParallelHook,
  AsyncParallelBailHook,
  AsyncSeriesHook,
  AsyncSeriesBailHook,
  AsyncSeriesWaterfallHook
 } = require("tapable");
```    

能创建层叠上下文的方法：   

- 根元素
- z-index 不为 auto 的 relative, absolute 元素
- fixed, sticky 元素
- z-index 不为 auto 的 flex item 或者 grid item
- opacity 不为 1
- 带有以下属性
  + transform
  + filter
  + backdrop-filter
  + perspective
  + clip-path
  + mask/mask-image/mask-border
  + will-change
  + contain

```html
<blog-post v-bind="post"></blog-post>

// 等价于
<blog-post v-bind:id="post.id" v-bind:title="post.title"></blog-post>
```     

闭包就是函数f2，即能够读取其他函数内部变量的函数。由于在 JavaScript 语言中，只有函数内部的子函数才能读取内部变量， 因此可以把闭包简单理解成“定义在一个函数内部的函数”。闭包最大的特点，就是它可以“记住”诞生的环境，比如f2记住了它诞生的环境f1， 所以从f2可以得到f1的内部变量。在本质上，闭包就是将函数内部和函数外部连接起来的一座桥梁。   

```html
< img srcset="foo-160.jpg 160w,
             foo-320.jpg 320w,
             foo-640.jpg 640w,
             foo-1280.jpg 1280w"
     sizes="(max-width: 440px) 100vw,
            (max-width: 900px) 33vw,
            254px"
     src="foo-1280.jpg">
```     

- `Symbol.iterator`
- `Symbol.toPrimitive` 指向一个方法，该对象被转为原始类型的值时，会调用这个方法，有一个字符串参数
    + `number`: 该场合需要转成数值
    + `string`: 需要转成字符串
    + `default`: 可以转成数值，也可以转成字符串
- `Symbol.toStringTag` 指向一个方法，在该对象上面调用 `Object.prototype.toString` 时，它的返回值会出现在
toString 返回的字符串中，表示对象的类型，也就是说，这个属性可以用来定制 `[object Object]` 中 object 后面的字符串

- value属性是当前成员的值，done属性是一个布尔值，表示遍历是否结束。    

```css
.wrapper {
    display: grid;
    grid-template: 
        "hd hd hd hd hd hd hd hd hd" minmax(100px, auto)
        "sd sd sd main main main main main main" minmax(100px, auto)
        "ft ft ft ft ft ft ft ft ft" minmax(100px, auto)
        / 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
}
```    

elem.getContext('2d');

fillRect, clearRect, strokeRect, arc artTo, moveTo, lineTo,
beginPath, closePath, fill, stroke, fillStyle, strokeStyle,
lineJoin, round, save, restore, bezierCurveTo, path2D, rect,

lineWidth, lineCap, round, butt, square, round, bevel, miter
shadowOffsetX, shadowColor
fillTect, strokeText, font, textAlign, drawImage

translate, rotate, scale, clip, toBlob, toDataURL

origin, acrheaders, acrmethod, a-c-a-origin, credentials, methods, headers, max-age, expose-headers

range, content-range, accept-range, range: bytes 200-100, multipart/byteranges

```
GET / HTTP/1.1
Host: server.example.com
Connection: Upgrade, HTTP2-Settings
Upgrage: h2c
HTTP2-Settings: <base64url encoding of HTTP/2 SETTINGS payload>
```    

```
 +-----------------------------------------------+
 |                 Length (24)                   |
 +---------------+---------------+---------------+
 |   Type (8)    |   Flags (8)   |
 +-+-------------+---------------+-------------------------------+
 |R|                 Stream Identifier (31)                      |
 +=+=============================================================+
 |                   Frame Payload (0...)                      ...
 +---------------------------------------------------------------+
```     

data, headers, priority, rst_stream settings, push_promise, ping,
goaway, window_update, continuation

+ 首先，为每个元素上的每个属性收集应用于元素的所有声明(declared values)的值。 可能有零个或许多声明的值应用于元素。
+ 级联过程产生级联值(cascaded value)。 每个元素每个属性最多有一个级联值。
+ 默认过程产生指定值(specified value)。 每个元素每个属性只有一个指定的值。
+ 解析值依赖关系产生计算值(computed value)。 每个元素每个属性只有一个计算值。
+ 格式化文档产生使用值(used value), 每个元素的每个属性只能有一个使用值，如果该属性适用于该元素。
+ 最后，根据展示环境使用值最终转换成实际值(actual value).

only-of-type 选择子元素是父元素中唯一一个是这种类型的，父元素可以有多个子元素，但这种类型的 只能有这一个。

nth-child 中的代数式是这种形式 an + b 或 an - b，所以 b 是不能在第一位的，怪不得之前 有样式不生效。

所有的伪元素选择符只能出现在选择符的最后。

默认的块级元素的高度是从最上边那个块级子代元素的上边框外侧到最下边那个块级元素的下边框外侧 之间的距离。因此，子元素的外边距 "游离" 在所属元素的外部。

table-layout

Git 支持不同层次的配置文件，按照优先级递减排序为：   

+ .git/config: 版本库的特定配置，可用 --file 选项修改，是默认选项。
+ ~/.gitconfig: 用户特定的配置设置，可用 --global 选项修改。
+ /etc/gitconfig: 系统范围的配置设置，可用 --system 修改。    

①慢启动；②拥塞避免； ③快速恢复。

updateSlot -> updateTextNode -> useFiber/createFiberFromText
           -> updateElement -> useFiber/createFiberFromElement
updateFromMap -> updateTextNode
              -> updateElement




如何写一个声明文件，取决于我们写的库是如何被使用的。例如：   

- 模块语法的使用库，cjs/esmodule/requirejs 等等
- 全局模块语法的使用库，但是目前纯全局模块很少了，大部分都转换成了 umd 语法的
- umd 语法的使用库

如果使用不同语法的库呢。    

- 如果是依赖一个全局模块，可以通过三斜线指令 `/// <reference types="someLib" />`
- 如果依赖普通的模块，那就 import 就行
- 对于一个 umd 模块来说，取决于我们本身的模块，如果我们本身就在写一个全局模块，那就用三斜线指令，否则的话用 import 就行

### 插件式的声明文件

假设我们的库是另一个模块库的插件，那么一般是这样写：   

```ts
import { greeter } from 'super-greeter';

export module 'super-greeter' {
    export interface GreeterFunction {
        hyperGreet(): void;
    }
}
```   