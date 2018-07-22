# fs

目录：    

+ [WHATWG URL object support](#part1)
+ [Buffer API](#bufferAPI)
+ [Class: fs.FSWatcher](#classWatcher)
  - [Event: 'change'](#watcherEChange)
  - [Event: 'error'](#watcherEError)
  - [watcher.close()](#watcherClose)
+ [Class: fs.ReadStream](#fsReadStream)
  - [Event: 'close'](#readStreamEClose)
  - [Event: 'open'](#readStreamEOpen)
  - [readStream.bytesRead](#bytesRead)
  - [readStream.path](#readStreamPath)
+ [Class: fs.Stats](#classStats)
    - [Stat Time Values](#statTime)
+ [Class: fs.WriteStream](#classWriteStream)
  - [Event: 'close'](#writeStreamEClose)
  - [Event: 'open'](#writeStreamEOpen)
  - [writeStream.bytesWritten](#bytesWritten)
  - [writeStream.path](#writeStreamPath)
+ [fs.access(path[, mode], callback)]
+ [fs.accessSync(path[, mode])]
+ [fs.appendFile(file, data[, options], callback)]
+ [fs.appendFileSync(file, data[, options])]
+ [fs.chmod(path, mode, callback)]
+ [fs.chmodSync(path, mode)]
+ [fs.chown(path, uid, gid, callback)]
+ [fs.chownSync(path, uid, gid)]
+ [fs.close(fd, callback)]
+ [fs.closeSync(fd)]
+ [fs.constants]
+ [fs.createReadStream(path[, options])]
+ [fs.createWriteStream(path[, options])]
+ [fs.exists(path, callback)]
+ [fs.existsSync(path)]
+ [fs.fchmod(fd, mode, callback)]
+ [fs.fchmodSync(fd, mode)]
+ [fs.fchown(fd, uid, gid, callback)]
+ [fs.fchownSync(fd, uid, gid)]
+ [fs.fdatasync(fd, callback)]
+ [fs.fdatasyncSync(fd)]
+ [fs.fstat(fd, callback)]
+ [fs.fstatSync(fd)]
+ [fs.fsync(fd, callback)]
+ [fs.fsyncSync(fd)]
+ [fs.ftruncate(fd, len, callback)]
+ [fs.ftruncateSync(fd, len)]
+ [fs.futimes(fd, atime, mtime, callback)]
+ [fs.futimesSync(fd, atime, mtime)]
+ [fs.lchmod(path, mode, callback)]
+ [fs.lchmodSync(path, mode)]
+ [fs.lchown(path, uid, gid, callback)]
+ [fs.lchownSync(path, uid, gid)]
+ [fs.link(existingPath, newPath, callback)]
+ [fs.linkSync(existingPath, newPath)]
+ [fs.lstat(path, callback)]
+ [fs.lstatSync(path)]
+ [fs.mkdir(path[, mode], callback)]
+ [fs.mkdirSync(path[, mode])]
+ [fs.mkdtemp(prefix[, options], callback)]
+ [fs.mkdtempSync(prefix[, options])]
+ [fs.open(path, flags[, mode], callback)]
+ [fs.openSync(path, flags[, mode])]
+ [fs.read(fd, buffer, offset, length, position, callback)]
+ [fs.readdir(path[, options], callback)]
+ [fs.readdirSync(path[, options])]
+ [fs.readFile(path[, options], callback)]
+ [fs.readFileSync(path[, options])]
+ [fs.readlink(path[, options], callback)]
+ [fs.readlinkSync(path[, options])]
+ [fs.readSync(fd, buffer, offset, length, position)]
+ [fs.realpath(path[, options], callback)]
+ [fs.realpathSync(path[, options])]
+ [fs.rename(oldPath, newPath, callback)]
+ [fs.renameSync(oldPath, newPath)]
+ [fs.rmdir(path, callback)]
+ [fs.rmdirSync(path)]
+ [fs.stat(path, callback)]
+ [fs.statSync(path)]
+ [fs.symlink(target, path[, type], callback)]
+ [fs.symlinkSync(target, path[, type])]
+ [fs.truncate(path, len, callback)]
+ [fs.truncateSync(path, len)]
+ [fs.unlink(path, callback)]
+ [fs.unlinkSync(path)]
+ [fs.unwatchFile(filename[, listener])]
+ [fs.utimes(path, atime, mtime, callback)]
+ [fs.utimesSync(path, atime, mtime)]
+ [fs.watch(filename[, options][, listener])]
+ [Caveats]
+ [Availability]
+ [Inodes]
+ [Filename Argument]
+ [fs.watchFile(filename[, options], listener)]
+ [fs.write(fd, buffer[, offset[, length[, position]]], callback)]
+ [fs.write(fd, string[, position[, encoding]], callback)]
+ [fs.writeFile(file, data[, options], callback)]
+ [fs.writeFileSync(file, data[, options])]
+ [fs.writeSync(fd, buffer[, offset[, length[, position]]])]
+ [fs.writeSync(fd, string[, position[, encoding]])]
+ [FS Constants]
+ [File Access Constants]
- [File Open Constants]
- [File Type Constants]
- File Mode Constants

# File System  

文件 I/O 操作只是对标准 POSIX 功能的封装。`fs` 模块中所有的方法都有同步与异步两个版本。    

异步形式版本总是接收一个完成回调作为最后一个参数，具体传递给回调的参数取决于方法，不过第一个
参数总是 `error` 参数。如果操作没有出现问题，第一个参数就是 `null` or `undefined`。    

**文件系统可以使用相对路径，但是需要注意的是，这个路径是相对于 `process.cwd()`解析的。**    

## WHATWG URL object support

*这个部分时实验性的，用时要注意。*     

<a name="part1"></a>    

对于 `fs` 中的大部分函数来说，传递的 `path` or `filename` 参数可以是一个 WHATWG URL 对象。
不过只支持使用 `file:` 协议的 URL 对象。    

```javascript
const fs = require('fs');
const { URL } = require('url');
const fileUrl = new URL('file:///tmp/hello');

fs.readFileSync(fileUrl);
```    

*注意*：`file:` URL 总是绝对路径。     

剩下的先略了。    

## Buffer API   

<a name="bufferAPI"></a>   

`fs` 函数支持传递和接受字符串与 Buffers 类型的路径。对于大部分使用来说，没必要去使用 Buffers
的路径，字符串可以来回在 utf8 之间自动转换。     

## 补充知识

硬链接指的是两个文件其实是一个文件，文件的 inode 号码是一致的，软链接就像快捷方式，
只是简单的指向源文件，因此软链接的大小通常就是其路径的字节数。    

这些文件系统函数中，通常如果开头是 `f` 的话通常功能与不加 `f` 的函数功能一致，但是
是通过打开的文件描述符访问文件的，开头是 `l` 的话也是一样，`l` 开头的函数的 `path`
时一个符号链接的话，它会返回链接本身的信息，而不是引用文件的信息。这样推测的话，
常规的函数可能对符号链接的话会返回引用文件的内容。     

## Class:fs.FSWatcher

<a name="classWatcher"></a>   

`fs.watch()` 返回这种类型的对象。    

提供给 `fs.watch()` 的 `listener` 回调是作为 FSWatcher 的 `change` 事件监听函数的。    

这个对象可以触发如下的事件：    

### Event: 'change'

<a name="watcherEChange"></a>    

+ `eventType` &lt;string&gt; fs 变动的类型
+ `filename` &lt;string&gt; |  &lt;Buffer&gt; 变动的文件名（如果可用或者相关的话）       

当监视的目录或者文件发生变动时触发。   

取决于操作系统的支持，可能不会提供 `filename` 参数。不过如果提供了这个参数，如果调用
`fs.watch()` 时 `encoding` 参数为 `'buffer'` 则这个参数就是 `Buffer` 对象，否则
这个参数是字符串。    

```javascript
// Example when handled through fs.watch listener
fs.watch('./tmp', { encoding: 'buffer' }, (eventType, filename) => {
  if (filename)
    console.log(filename);
    // Prints: <Buffer ...>
});
```    

### Event:'error'

<a name="watcherEError"></a>

+ `error`   

发生错误时触发。    

### watcher.close()

<a name="watcherClose"></a>   

停止在 `fs.FSWatcher` 上监视变动的行为。    

## Class:fsReadStream   

<a name="fsReadStream"></a>   

`ReadStream` 是一个可读流。    

### Event:'close'  

<a name="readStreamEClose"></a>    

使用 `fs.close()` 关闭了 `ReadStream` 底层的文件描述符后触发。   

### Event:'open'

<a name="readStreamEOpen"></a>   

+ `fd` &lt;integer&gt;  ReadStream 使用的整数的文件描述符。    

当 ReadStream 文件打开时触发。（好像没有 `error` 参数）     

### readStream.bytesRead  

<a name="bytesRead"></a>

目前为止读取的字节数。   

### readStream.path   

<a  name="readStreamPath"></a>

流读取的文件的路径是在 `fs.createReadStream()` 第一个参数传入的。如果 `path` 为字符串，那么`readStream.path` 也是字符串。如果 `path` 是 `Buffer`，`readStream.path` 也是 `Buffer`。    

*注意这个属性值就真的只是传入的 `path` 的值，不会转换成绝对路径什么的。*     

## Class: fs.Stats  

`fs.stat()`,`fs.lstat()`,`fs.fstat()` 以及这些方法的同步版本返回这个类型的对象。      

+ `stats.isFile()`
+ `stats.isDirectory()`
+ `stats.isBlockDevice()`
+ `stats.isCharacterDevice()`
+ `stats.isSymbolicLink()` 只在 `fs.lstat()` 返回的对象上有效
+ `stats.isFIFO()`
+ `stats.isSocket()`    

对于常规文件来说，`util.inspect(stats)` 返回类似下面的字符串：   

```javascript
Stats {
  dev: 2114,
  ino: 48064969,
  mode: 33188,
  nlink: 1,
  uid: 85,
  gid: 100,
  rdev: 0,
  size: 527,
  blksize: 4096,
  blocks: 8,
  atimeMs: 1318289051000.1,
  mtimeMs: 1318289051000.1,
  ctimeMs: 1318289051000.1,
  birthtimeMs: 1318289051000.1,
  atime: Mon, 10 Oct 2011 23:24:11 GMT,
  mtime: Mon, 10 Oct 2011 23:24:11 GMT,
  ctime: Mon, 10 Oct 2011 23:24:11 GMT,
  birthtime: Mon, 10 Oct 2011 23:24:11 GMT }
```    

### Stat Time Values   

<a name="statTime"></a>    

stat 对象中的时间有如下的语义：   

+ `atime` "Access Time" - 文件数据上次访问时间
+ `mtime` "Modified Time" - 文件上次的修改时间
+ `ctime` "Change Time" - 文件状态上次变动的时间（inode 数据的修改）
+ `birthtime` "Birth Time" - 文件创建时间    

## 关于 stat 的题外话

`stat, fstat, lstat, fstatat` 这4个 Linux 命令都是获取文件的状态。

通常返回一个如下结构内容：   

```c
 struct stat {
          st_dev;         /* ID of device containing file */
          st_ino;         /* Inode number */
          st_mode;        /* File type and mode */
          st_nlink;       /* Number of hard links */
          st_uid;         /* User ID of owner */
          st_gid;         /* Group ID of owner */
          st_rdev;        /* Device ID (if special file) */
          st_size;        /* Total size, in bytes */
          st_blksize;     /* Block size for filesystem I/O */
          st_blocks;      /* Number of 512B blocks allocated */

          st_atim;  /* Time of last access */
          st_mtim;  /* Time of last modification */
          st_ctim;  /* Time of last status change */
        };
```

## Class:fs.WriteStream   

<a name="classWriteStream"></a>

`WriteStream` 是一个可写流。    

### Event: 'close'

<a name="writeStreamEClose"></a>    

当调用 `fs.close()` 关闭 `WriteStream` 底层的文件描述符后调用。    

### Event: 'open'

<a name="writeStreamEOpen"></a>   

+ `fd`    

当 WriteStream 的文件打开时触发。     

### writeStream.bytesWritten

<a name="bytesWritten"></a>   

目前为止写入的字节数。不包括仍在队列中等待的数据。    

### writeStream.path    

<a  name="writeStreamPath"></a>   

和 `readStream.path` 类似，参照上面的内容吧。    

## fs.access(path[,mode],callback)   

+ `path` &lt;string&gt; | &lt;Buffer&gt; | &lt;URL&gt;
+ `mode` &lt;integer&gt;
+ `callback` &lt;Function&gt;   

**后面的方法中如果 path，callback 的类型不变的话就不再举出。**    

测试用户对 `path` 位置的文件或目录的权限。`mode` 参数用来指定执行的访问性检查的行为。
下面的常量定义了可能的 `mode` 值，可以创建由两个或多个值的按位OR组成的掩码。    

+ `fs.constants.F_OK` - `path` 对于调用的进程是可见的。在不检查 `rwx` 权限查看文件是否存在时有用。如果没指定 `mode` 的话默认就是这个操作。
+ `fs.constants.R_OK` - `path` 可以被调用进程读取
+ `fs.constants.W_OK` - `path` 可以被调用进程写入
+ `fs.constants.X_OK` - `path` 可以被调用进程执行。这个在 Windows 上没效果    

`callback` 回调接受错误参数，如果任一的访问性检查失败，error 参数就会被污染。    

```javascript
fs.access('/etc/passwd', fs.constants.R_OK | fs.constants.W_OK, (err) => {
  console.log(err ? 'no access!' : 'can read/write');
});
```    

在调用 `fs.open()`,`fs.readFile()`,`fs.writeFile()` 前调用 `fs.access()` 是不推荐的。因为其他的进程可能在两次调用直接修改文件的状态，所以会引起条件竞争（但是这好像不符合条件竞争的定义呀）。相反，用户应当直接对文件进行读写打开等操作，然后处理访问过程
中出现的错误。    

## fs.accessSync(path[,mode])

如果检查失败就抛出错误，如果正常就什么也不做。   

## fs.appendFile(file,data[,options],callback)   

+ `file` &lt;string&gt; | &lt;Buffer&gt; | &lt;number&gt; 文件名或文件描述符
+ `data` &lt;string&gt; | &lt;Buffer&gt;
+ `options` &lt;Object&gt; | &lt;string&gt;
  - `encoding` &lt;string&gt; | &lt;null&gt; 默认`'utf8'`
  - `mode` &lt;integer&gt; 默认 `0o666` 尚不清楚这些函数指定权限是干嘛
  - `flag` &lt;string&gt; 默认 `'a'`
+ `callback` &lt;Function&gt;     

对文件异步追加数据，如果文件不存在就创建文件。    

如果是文件描述符的话必须是一个打开的才能进行操作。   

*Note*: 如果 `file` 声明为文件描述符，那么它不会自动关闭。   

## fs.appednFileSync(file,data[,options])

返回 `undefined`。（那出错怎么办，在哪绑定处理事件）    

## fs.chmod(path,mode,callback)   

+ `mode` &lt;integer&gt;

回调中除了错误参数没有其他参数。    

## fs.chmodSync(path,mode)

返回 `undefined`。    

## fs.chown(path,uid,gid,callback)

+ `uid`, `gid` &lt;integer&gt;    

回调中除了错误参数没有其他参数。    

## fs.chownSync(path,uid,gid)

返回 `undefined`。    

## fs.close(fd,callback)

+ `fd` &lt;integer&gt;  

回调中除了错误参数没有其他参数。    

## fs.closeSync(fd)

返回 `undefined`。   

## fs.constants   

返回包含文件系统操作常用的一些常量的对象。      

## fs.createReadStream(path[,options])    

+ `options` &lt;string&gt; | &lt;Object&gt;
  - `flags` &lt;string&gt;
  - `encoding` &lt;string&gt;
  - `fd` &lt;integer&gt;
  - `mode` &lt;integer&gt;
  - `autoClose` &lt;boolean&gt;
  - `start` &lt;integer&gt;
  - `end` &lt;integer&gt;    

返回一个新的 ReadStream 对象。    

与可读流默认的 `highWaterMark` 不同的是，返回的流默认为 64kb。   

`options` 的默认值如下：    

```javascript
const defaults = {
  flags: 'r',
  encoding: null,
  fd: null,
  mode: 0o666,
  autoClose: true
};
```    

`start` and `end` 可以设置读取的字节的范围而不是整个文件。`start` and `end` 都是包含在内的，`start` 的起始值为0。如果指定`fd` 且 `start` 被省略或为 `undefined`，
`fs.createReadStream()`从当前文件位置顺序读取（可能是这样理解，`fd`代表已经打开的
文件，那么可能这个文件直接就已经用别的方法读到一半了，那么现在就直接一半的地方继续读）。　　　　

如果指定了 `fd`，那么 `ReadStream` 就使用这个文件描述符而忽略 `path`。这意味着不会有
`'open'` 事件的触发了。     

如果 `autoClose` 为 `false`，那么文件描述符不会自动关闭，即便发生了错误。如果为 `true` 的话，`error` or `end` 事件都会让文件描述符自动关闭。    

只有当文件是创建时，`mode` 才能设置文件的 mode。    

## fs.classWriteStream(path[,options])

+ `options` &lt;string&gt; | &lt;Object&gt;
  - `flags` &lt;string&gt;
  - `defaultEncoding` &lt;string&gt;
  - `fd`
  - `mode`
  - `autoClose`
  - `start`    

返回一个 WriteStream 对象。    

`options` 的默认选项如下：   

```javascript
const defaults = {
  flags: 'w',
  defaultEncoding: 'utf8',
  fd: null,
  mode: 0o666,
  autoClose: true
};
```    

修改一个文件而不是替换它可能需要的 `flags` 是 `r+` 而不是默认的 `w`。    

同上，`autoClose` 为 `true` 时，`error` or `end` 事件都会自动关闭描述符，为 `false` 的话，就得我们手动关闭。    

如果指定了 `fd`，那么 `WriteStream` 就使用这个文件描述符而忽略 `path`。这意味着不会有 `'open'` 事件的触发了。   

## fs.existsSync(path)

给定的路径是否在当前文件系统中，在就返回 `true`，否则就是 `false`。    

注意这个函数的异步版本已被废弃。    

## fs.fchmod(fd,mode,callback)

这个函数作用其实和 `fs.chmod()` 相同，区别就是 `fs.chmod()` 是根据路径修改的，这个是
根据已打开的文件描述符。     

回调函数只有可能出现的错误参数。

## fs.fchmodSync(fd,mode)

返回 `undefined`。   

## fs.fchown(fd,uid,gid,callback)

类似 `fs.chown()` 不过使用的是 `fd`。回调函数只有可能出现的错误参数。     

## fs.fchownSync(fd,uid,gid)

返回 `undefined`。   

## fs.fdatasync(fd,callback)

这个及后面的 `fs.fsync()` 都是确保将文件的内容写到了设备了（典型的就是硬盘）。     

一般情况下，对硬盘（或者其他持久存储设备）文件的write操作，更新的只是内存中的页缓存（page cache），而脏页面不会立即更新到硬盘中，而是由操作系统统一调度，如由专门的flusher内核线程在满足一定条件时（如一定时间间隔、内存中的脏页达到一定比例）内将脏页面同步到硬盘上（放入设备的IO请求队列）。因为write调用不会等到硬盘IO完成之后才返回，因此如果OS在write调用之后、硬盘同步之前崩溃，则数据可能丢失。    

所有这两个函数都是确保文件写到了设备中，不同的是 `fs.fdatasync()` 不一定确保会将文件的元信息（应该是指 inode 中的信息）也写入到设备中了，可能会写，可能不会写。而 `fs.fsync()` 是确保文件内容及文件元信息都写到设备中了。    

回调函数只有可能出现的错误参数。    

## fs.fdatasyncSync(fd)

返回 `undefined`。   

## fs.fstat(fd, callback)

回调接受两个参数 `(err, stats)`。    

## fs.fstatSync(fd)

返回一个 `fs.Stats` 实例。   

## fs.fsync(fd,callback)

回调函数只有可能出现的错误参数。   

## fs.fsyncSync(fd)

返回 `undefined`。   

## fs.ftruncate(fd,len,callback)

+ `len` &lt;integer&gt; 默认为0   

就是名字的意思，截短文件到指定的长度。必须对文件有写入的权限。回调函数只有可能出现的错误参数。  

```javascript
console.log(fs.readFileSync('temp.txt', 'utf8'));
// Prints: Node.js

// get the file descriptor of the file to be truncated
const fd = fs.openSync('temp.txt', 'r+');

// truncate the file to first four bytes
fs.ftruncate(fd, 4, (err) => {
  assert.ifError(err);
  console.log(fs.readFileSync('temp.txt', 'utf8'));
});
// Prints: Node
```   

如果文件之前就短于 `len` 长度，它会被扩展，扩展的部分使用 `\0`填充，如下：   

```javascript
console.log(fs.readFileSync('temp.txt', 'utf-8'));
// Prints: Node.js

// get the file descriptor of the file to be truncated
const fd = fs.openSync('temp.txt', 'r+');

// truncate the file to 10 bytes, whereas the actual size is 7 bytes
fs.ftruncate(fd, 10, (err) => {
assert.ifError(err);
console.log(fs.readFileSync('temp.txt'));
});
// Prints: <Buffer 4e 6f 64 65 2e 6a 73 00 00 00>
// ('Node.js\0\0\0' in UTF8)
```    

## fs.ftruncateSync(fd,len)

返回 `undefined`。    

## fs.futimes(fd,atime,mtime,callback)

+ `atime` &lt;integer&gt;
+ `mtime` &lt;integer&gt;   

改变文件的时间戳。（可能是 update times 的意思）    

## fs.futimesSync(fd, atime, mtime)

返回 `undefined`。    

## fs.lchmod(path,mode,callback)

修改权限咯，不过针对符号链接，修改链接本身，而不是引用的源文件。    

回调函数只有错误参数一个参数。    

只在 macOS 上有用。   

## fs.lchmodSync(path,mode)

返回 `undefined`。    

## fs.lchown(path,uid,gid,callback)

回调函数只有错误参数一个参数。   

## fs.lchownSync(path,uid,gid)

返回 `undefined`。   

## fs.link(existingPath,newPath,callback)

+ `existingPath` &lt;stirng&gt; | &lt;Buffer&gt; | &lt;URL&gt;
+ `newPath` &lt;stirng&gt; | &lt;Buffer&gt; | &lt;URL&gt;   

回调函数只有错误参数一个参数。   

为文件创建一个硬链接，是哒，你没有看错，是硬的。    

不过要注意的是，如果 `newPath` 已经存在，不会进行覆盖操作，会抛出错误。    

## fs.linkSync(existingPath,newPath)

返回 `undefined`。   

## fs.lstat(path,callback)

回调有两个参数 `(err, stats)`。   

## fs.lstatSync(path)

返回 `fs.Stats` 实例。   

## fs.mkdir(path[,mode],callback)

没错，就是建个文件夹。回调也是只有一个错误参数。   

## fs.mkdirSync(path[,mode])    

返回 `undefined`。   

## fs.mkdtemp(prefix[,options],callback)

+ `prefix` &lt;string&gt;
+ `options` &lt;string&gt; | &lt;Object&gt;
  - `encoding` 默认 `utf8`   

创建一个唯一的临时目录。    

会生成6个随机字符添加在 `prefix` 后面。     

创建的文件夹的路径的字符串时作为第二个参数传入回调。     

注意这个路径也只是简单的将 `prefix` 和6个随机字符连起来，不是绝对路径。

## fs.mkdtempSync(prefix[,options])

返回创建的文件夹的路径。   

## fs.open(path,flags[,mode],callback)

+ `flags` &lt;string&gt; | &lt;number&gt;

异步打开文件。`flags` 可以是：    

+ `'r'` - 为了读取打开文件。如果文件不存在抛出错误
+ `'r+'` - 为了读与写打开文件。如果文件不存在抛出错误
+ `'rs+'` - 为了读写以同步模式打开文件。命令操作系统绕过本地文件系统缓存   

这主要是用来打开在 NFS 挂载的文件，从而可以跳过潜在的过时的本地缓存。它对I / O性能有非常真实的影响，因此不推荐使用此标志，除非需要。    

注意这个同步模式不是指 `open` 操作的同步，这个函数还是异步的。  

+ `'w'` - 为了写打开文件。如果文件不存在就创建一个，如果存在的话就截断（截断的意思相当于覆盖写入）
+ `'wx'` - 与 `'w'` 类似，但是文件存在的话就抛出错误
+ `'w+'` - 为了读写打开文件。如果文件不存在就创建一个，如果存在的话就截断
+ `'wx+'` - 与 `'w+'` 类似，但是文件存在的话抛出错误
+ `'a'` - 为了追加内容打开文件。文件不存在的话就新建一个
+ `'ax'` - 类似 `'a'`，但是文件存在的话抛出错误
+ `'a+'` - 为了读取和追加内容打开文件，文件不存在的话就新建一个
+ `'aw+'` - 类似 `'a+'`，但是文件存在的话抛出错误    

`mode` 设置了文件的 mode（权限与粘滞位），但只有在文件是新建时才有效，默认为 `0666`。    

回调函数有两个参数 `(err, fd)`。    

`'x'` 标志确保了 `path` 肯定是新建的。   

`flags` 可以是 `open()` 文件中列举的数字；通常使用 `fs.constants` 上的常量。在
Windows 上，标志在适用的情况下转换为等价的标志。    

在 Linux 上，当文件以追加模式打开时（`'a'`相关的打开），位置写入没有作用。内核会忽略位置参数
并且将数据添加到文件的尾部。    

## fs.openSync(path,flags[,mode])

返回一个整数，代表文件描述符。   

## fs.read(fd,buffer,offset,length,position,callback)

+ `buffer` &lt;Buffer&gt; | &lt;Uint8Array&gt;
+ `offset` &lt;integer&gt;
+ `length` &lt;integer&gt;
+ `position` &lt;integer&gt;   

从给定的 `fd` 中读取数据。     

`buffer` 是数据将要写入的缓冲区（是不是叫 `Buffer` 对象比较好）。    

`offset` 是在 `Buffer` 对象开始写入时的位移。   

`length` 指定了要读取的字节数。   

`position` 指定了从文件的哪里开始读。如果为 `null`，数据会从当前的文件位置开始读。    

回调函数有3个参数，`(err, bytesRead, buffer)`。    

## fs.readdir(path[,options],callback)

+ `options` &lt;string&gt; | &lt;Object&gt;
  - `encoding` 默认 `utf8`

读取目录的内容。回调函数有两个参数 `(err, files)`，`files` 是当前目录中的文件名的数组，不过
不包括 `'.'` and `'..'`。    

## fs.readdirSync(path[,options])

返回除 `'.'` and `'..'` 以外的文件名的数组。     

## fs.readFile(path[,options],callback)

+ `path` &lt;string&gt;| &lt;Buffer&gt; | &lt;URL&gt; | &lt;interger&gt;
+ `options` &lt;Objecct&gt; |  &lt;string&gt;
  - `encoding` &lt;string&gt; | &lt;null&gt; 默认 `null`
  - `flag` &lt;string&gt; 默认 `'r'`


异步读取整个文件的内容：    

```javascript
fs.readFile('/etc/passwd', (err, data) => {
  if (err) throw err;
  console.log(data);
});
```    

回调函数有两个参数 `(err, data)`，`data` 是文件的内容。    

如果没有设置编码方式，则返回原始的 buffer。    

*Note*: 当路径是一个目录时, `fs.readFile()` and `fs.readFileSync()` 的行为是与平台相关的。
在 macOS, Linux, Windows 上，会返回错误，在 FreeBSD 上，会返回目录的内容。    

*Note*: 如果路径是一个文件描述符的话，不会自动关闭。    

## fs.readFileSync(path[,options])

返回 `path` 的内容。如果 `encoding` 设置了则返回字符串，否则就是一个 buffer。    

针对路径是目录的情况与异步函数一样。    

## fs.readlink(path[,options],callback)

+ `path` &lt;string&gt; | &lt;Buffer&gt; | &lt;URL&gt;
+ `options` &lt;string&gt; | &lt;Object&gt;
  - `encoding` 默认 `utf8`

貌似是获取符号连接内容的路径。回调由两个参数 `(err, linkString)`。    

## fs.readlinkSync(path[,options])

返回符号连接的字符串。    

## fs.readSync(fd,buffer,offset,length,position)    

返回 `bytesRead` 的数量。   

## fs.realpath(path[,options],callback)

+ `path` &lt;string&gt; | &lt;Buffer&gt; | &lt;URL&gt;
+ `options` &lt;string&gt; | &lt;Object&gt;
  - `encoding` 默认 `utf8`

`realpath` 命令：返回一个规范化的绝对路径。符号连接的话也是引用文件的路径。   

回调函数有两个参数 `(err, resolvePath)`。可以使用 `process.cwd` 来解析相对路径。    

## fs.realpathSync(path[,options])

返回解析后代路径。    

## fs.rename(oldPath,newPath,callback)

+ `oldPath` &lt;string&gt; | &lt;Buffer&gt; | &lt;URL&gt;
+ `newPath` &lt;string&gt; | &lt;Buffer&gt; | &lt;URL&gt;

`rename`: 文件改名，有必要的话还会移动文件。如果 `newPath` 已经存在，会自动替换。如果
`oldPath` 是一个目录，`newPath` 要么不存在要么是一个空目录。     

回调参数只有一个错误参数。   

## fs.renameSync(oldPath,newPath)

返回 `undefined`。   

## fs.rmdir(path,callback)

删除一个空目录。回调只有一个错误参数。   

## fs.rmdirSync(path)

返回 `undefined`。   

## fs.stat(path, callback)

回调有两个参数 `(err, stats)`。    

## fs.stat(path)

返回 `fs.Stats` 实例。   

## fs.symlink(target,path[,type],callback)

+ `target` &lt;string&gt; | &lt;Buffer&gt; | &lt;URL&gt;
+ `type` &lt;string&gt;

`symlink` 命令，为文件创建一个新名字，其实也就是符号连接。    

回调函数只有一个错误参数。`type` 可以是 `'dir'`,`'file'` or `'junction'` 默认 `'file'`，并且
只有在 Windows 上可用。（这里有点混乱，没说清楚到底是这个参数只能在 Windows 上用，还是说
`junction` 只在 Windows 上生效） 由于 Windows junction 要求目的地是绝对路径，所以
使用 `junction` 时，`target` 会自动规范化为绝对路径。    

不过 Windows 上还有其他的问题，反正使用的时候要注意。    

## fs.symlink(target,path[,type])

返回 `undefined`。   

## fs.truncate(path,len,callback)

+ `path` &lt;string&gt; | &lt;Buffer&gt;
+ `len` &lt;integer&gt; 默认0

这个的话应该只能对文件操作。回调函数只有一个错误参数。     

## fs.truncateSync(path,len)

返回 `undefined`。    

## fs.unlink(path,callback)

+ `path`&lt;string&gt; | &lt;Buffer&gt;|&lt;URL&gt;

回调函数只有一个错误参数。    

如果 `path` 是符号连接的话就移除这个符号链接文件，如果文件其实是最后一个链接，就删除文件。
其实意思就是如果这不是个符号链接文件本身的话，删除文件本身。    

## fs.unlink(path)

返回 `undefined`。   

## fs.unwahchFile(filename[,listener])

+ `filename` &lt;string&gt; | &lt;Buffer&gt;   

停止对 `filename` 的变动监视。如果指定了 `listener` 的话，只有这个特定的监听函数会移除。否则，
所有的监听函数都移除。    

## fs.utimes(path,atime,mtime,callback)

+ `path` &lt;string&gt; | &lt;Buffer&gt;| &lt;URL&gt;

*Note*: `atime` and `mtime` 应该遵守下面规则：   

+ 值应该是以秒为单位的 Unix 时间戳。例如，`Date.now()` 返回毫秒，应该在使用时除以1000
+ 如果只是字符串 `'123456789'`，应该转换为对应的数字
+ 如果值是 `NaN`, `Infinity`, `-Infinity`，抛出错误。    

## fs.utimesSync(path,atime,mtime)

返回 `undefined`。    

## fs.watch(filename[,options][,listener])

+ `filename` &lt;string&gt;|&lt;Buffer&gt;| &lt;URL&gt;
+ `options` &lt;string&gt;| &lt;Object&gt;
  - `encoding` 默认 `utf8`
  - `persistent` &lt;boolean&gt;意思是这样，当进程操作都完成后是否不退出继续监视，如果设为
  为`false`，那么进程执行完可能就退出了。  默认 `true`
  - `recursive` &lt;boolean&gt; 这个只能应用在指定的路径是目录时。默认为 `false`

返回一个 `fs.FSWatcher` 对象。    

回调函数有两个参数 `(eventType,filename)`,`eventType` 可能为 `rename`,`change`。    

注意在大部分平台上，文件在目录中出现或者消失都会触发 `'rename'`。    

需要注意的是监听回调会绑定在返回的 `fs.FSWatcher` 的 `'change'` 事件队列中，但是这不意味着
它只在 `eventType` 为 `change` 的事件上触发。   

`recursive` 选项只在 macOS 和 Windows 上支持。    

## fs.watchFile(filename[,options],listener)   

+ `filename` &lt;string&gt;|&lt;Buffer&gt;| &lt;URL&gt;
+ `options` &lt;Object&gt;
  - `persistent` &lt;boolean&gt; 默认 `true`
  - `interval` &lt;integer&gt; 默认 `5007`


每次文件被访问时触发回调。   

回调由两个参数，当前的 stat 对象和之前的 stat 对象：   

```javascript
fs.watchFile('message.text', (curr, prev) => {
  console.log(`the current mtime is: ${curr.mtime}`);
  console.log(`the previous mtime was: ${prev.mtime}`);
});
```   

## fs.write(fd,buffer[,offset[,length[,position]]],callback)

+ `fd` &lt;integer&gt;
+ `buffer` &lt;Buffer&gt; | &lt;Uint8Array&gt;   

`offset` 决定了 buffer 写入的部分，`length` 指定了写入的字节数。    

`position` 是写入数据的起点。如果 `typeof position !== number`，那么数据会在当前位置写入。    

回调有3个参数，`(err,bytesWritten,buffer)`。     

在 Linux 上，当文件是追加模式打开时，不支持位置写入。内核会将数据追加到文件尾部。    

## fs.write(fd,string[,position[,encoding]],callback)

+ `fd` &lt;integer&gt;

如果 `string` 不是字符串的话，会强制类型转换。    

回调函数还是3个参数，`(err,written,string)`，`written` 应该是写入了多个字节的数据。     

不同于写入 `buffer`，整个字符串都会被写入。    

在 Linux 上，当文件是追加模式打开时，不支持位置写入。内核会将数据追加到文件尾部。    

## fs.writeFile(file,data[,options],callback)

+ `file` &lt;string&gt; | &lt;Buffer&gt; | &lt;integer&gt;
+ `data` &lt;string&gt; | &lt;Buffer&gt; | &lt;Uint8Array&gt;
+ `options` &lt;string&gt;| &lt;Object&gt;
  - `encoding` &lt;string&gt;| &lt;null&gt; 默认 `utf8`
  - `mode` &lt;integer&gt; 默认 `0o666`
  - `flag` 默认 `'w'`


如果文件存在的话替换文件。     

如果 `data` 是 buffer的话忽略 `encoding` 参数。    

*Note*: 文件描述符不会自动关闭。   

## fs.writeFileSync(file,data[,options])

返回 `undefined`。    

## fs.writeSync(fd,buffer[,offset[,length[,position]]])

## fs.writeSync(fd,string[,position[,encoding]])    

返回写入的字节数。上面那个应该也是。    

## FS Constants

下面的常量是暴露在 `fs.constants` 上。    

### File Access Constants  

下面的常量是为了 `fs.access()` 方法使用：   

| 常量 | 描述 |
| :------------- | :------------- |
| `F_OK` | 文件对调用进程可见 |      
| `R_OK` | 文件对调用进程可读 |
| `W_OK` | 文件对调用进程可写 |
| `X_OK` | 文件对调用进程可执行 |   

后面的先略了。   
