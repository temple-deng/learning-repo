# process

## 1. 属性

### 1.1 stdout stdin stderr

stdout属性指向标准输出（文件描述符1）。它的write方法等同于console.log，可用在标准输出向用户显示内容。  

stdin代表标准输入（文件描述符0）。  

stderr属性指向标准错误（文件描述符2）。  

### 1.2 argv execPath execArgv  

argv属性返回一个数组，由命令行执行脚本时的各个参数组成。第一个成员总是 node(即 `process.execPath`)，第二个成员是脚本文件名（带有绝对路径），其余成员是脚本文件的参数。  

execPath属性返回执行当前脚本的Node二进制文件的绝对路径。  

```javascript
> process.execPath
'/usr/local/bin/node'
>
```  

execArgv属性返回一个数组，成员是命令行下执行脚本时，在Node可执行文件与脚本文件之间的命令行参数。  

`$ node --harmony script.js --version`  


### 1.3 env  

`process.env` 属性返回一个对象，包含了当前 Shell 的所有环境变量。比如， `process.env.HOME` 返回用户的主目录。  

通常的做法是，新建一个环境变量 `NODE_ENV`，用它确定当前所处的开发阶段，生产阶段设为 `production`，开发阶段设为 `develop`或`staging`，然后在脚本中读取 `process.env.NODE_ENV`即可。  



## 2. 方法

### 2.1 process.cwd(), process.chdir()

`cwd` 方法返回进程的当前目录（绝对路径），`chdir` 方法用来切换目录。  

注意，`process.cwd()`与`__dirname`的区别。前者进程发起时的位置，后者是脚本的位置，两者可能是不一致的。比如，`node ./code/program.js`，对于`process.cwd()`来说，返回的是当前目录（.）；对于`__dirname`来说，返回是脚本所在目录，即`./code/program.js`。  


### 2.2 process.nextTick()

`process.nextTick`将任务放到当前一轮事件循环(Event loop) 的尾部。  

`setTimeout(f,0)`是将任务放到下一轮事件循环的头部，因此 `nextTick`会比它先执行。  


### 2.2 process.exit()

`process.exit` 方法用来退出当前进程。它可以接收一个数值参数，如果参数大于0，表示执行失败，如果等于0表示执行成功。  

`process.exit` 执行时会触发 `exit` 事件。  

### 2.3 process.on()

`process` 对象部署了 EventEmitter 接口，可以使用 `on` 方法监听各种事件，并制定回调函数。  


## 3. 事件

### 3.1 'beforeExit'

beforeExit事件在Node清空了Event Loop以后，再没有任何待处理的任务时触发。  

回调函数接受 `process.exitCode` 作为唯一参数。  

当出现显示终止程序例如调用 `process.exit()`，或者发现未捕获的异常的情况时，该事件不会触发。  

除非用来指定异步任务，否则不应该用来代替 `exit` 事件。  


### 3.2 'exit'

当进程由于以下两种操作之一的结果将要结束时，触发 `exit` 事件：  

  + 显示调用 `process.exit()`方法。
  + 进程 Event loop 不再有需要执行的任务时。


回调函数接受一个退出码，可以是 `process.exitCode` 属性声明值，也可以是 `process.exit()` 的参数作为唯一参数。  

回调函数只能执行同步操作。

### 3.3 'rejectionHandled'

这个事件会在一轮 Event loop 后触发当有一个 `Promise` 变为 `rejected` 状态并且绑定了错误处理函数。  

回调函数接受这个 `Promise` 的引用作为唯一参数。  
