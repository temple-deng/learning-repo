# fs 模块  

## 1. readFile(file[, options], callback)，readFileSync(file[, options])

+ `file` : `<string> | <Buffer> | <integer>` 文件名或文件描述符。
+ `options` : `<Object> | <string>`
  + `encoding` : `<string> | <null>` 默认为 `null`  
  + `flag` : `<string>` 默认 `r`
+ `callback` : `<Function>`  

`readFile` 方法用于异步读取数据。

```javascript
fs.readFile('./image.png', function (err, buffer) {
  if (err) throw err;
  process(buffer);
});
```  

`readFile` 方法的第一个参数是文件的路径，可以是绝对路径，也可以是相对路径。注意，如果是相对路径，是相对于当前进程所在的路径（`process.cmd()`），而不是相对于当前脚本所在的路径。  

`readFile`方法的第二个参数是读取完成后的回调函数。该函数的第一个参数是发生错误时的错误对象，第二个参数是代表文件内容的`Buffer`实例。  

还可以在回调函数前加一个参数，第二个参数可以是一个表示配置的对象，也可以是一个表示文本文件编码的字符串。默认的配置对象是`{ encoding: null, flag: 'r' }`，即文件编码默认为`null`，读取模式默认为`r`（只读）。可用的文件编码包括“ascii”, “utf8”, “base64”。如果没有指定编码，返回的是缓存的二进制数据。  

`readFileSync`方法用于同步读取文件，返回一个字符串。  

`var text = fs.readFileSync(fileName, 'utf8');`  

`readFileSync`方法的第一个参数是文件路径，如果第二个参数不指定编码（`encoding`），`readFileSync`方法返回一个`Buffer`实例，否则返回的是一个字符串。    


## 2. fs.writeFile(file, data[, options], callback)，fs.writeFileSync(file, data[, options])

+ `file` : `<string> | <Buffer> | <integer>` 文件名或文件描述符
+ `data` : `<string> | <Buffer> | <Unit8Array>`
+ `options` : `<Object> | <string>`
  + `encoding` : `<string> | <null>` 默认 `urf8`
  + `mode` : `<integer>` 默认 `0o666`  
  + `flag` : `<string>` 默认 `w`  
+ `callback` : `<Function>`

`writeFile`方法用于异步写入文件。  

```javascript
fs.writeFile('message.txt', 'Hello Node.js', (err) => {
  if (err) throw err;
  console.log('It\'s saved!');
});
```  

`writeFile`方法的第一个参数是写入的文件名，第二个参数是写入的字符串，第三个参数是回调函数。

回调函数前面，还可以再加一个参数，表示写入字符串的编码默认选项对象。  

如果 `data` 是 `buffer` 内容，`encoding` 参数会被忽视。  

`writeFileSync`方法用于同步写入文件。  

## 3. fs.mkdir(path[, mode], callback)，fs.mkdirSync(path[, mode])  

+ `path` : `<string> | <Buffer>`  
+ `mode` : `<integer>` 默认 `0o777`
+ `callback` : `<Function>`

`mkdir`方法用于新建目录。  

```javascript
var fs = require('fs');

fs.mkdir('./helloDir',0777, function (err) {
  if (err) throw err;
});
```  


## 4. fs.readdir(path[, options], callback)，fs.readdirSync(path[, options])

+ `path` : `<string> | < Buffer>`
+ `options` : `<string> | <Object>`
  + `encoding` : `<string>` 默认 `utf8`
+ `callback` : `<Function>`

`readdir`方法用于读取目录，返回一个包含目录内所有文件文件名的数组。  

`encoding` 指定的是文件名的编码方式。  

```javascript
fs.readdir(process.cwd(), function (err, files) {
  if (err) {
    console.log(err);
    return;
  }

  var count = files.length;
  var results = {};
  files.forEach(function (filename) {
    fs.readFile(filename, function (data) {
      results[filename] = data;
      count--;
      if (count <= 0) {
        // 对所有文件进行处理
      }
    });
  });
});
```  


## 5. fs.createReadStream(path[, options])  

+ `path` : `<string> | <Buffer>`
+ `options` : `<string> | <Object>`
  + `flags` : `<string>`
  + `encoding` : `<string>`
  + `fd` : `<integer>`
  + `mode` : `<integer>`
  + `autoClose` : `<boolean>`
  + `start` : `<integer>`
  + `end` : `<integer>`

返回一个 `ReadStream` 对象。  

`options` 对象的默认值如下：  

```javascript
{
  flags: 'r',
  encoding: null,
  fd: null,
  mode: 0o666,
  autoClose: true
}
```

`options` 可以包含 `start` `end` 两个值来限定读取的字节的范围而不是读取整个文件。`start, end` 也包含在内，从 start 从0开始计数。
如果指定了 `fd` 并且省略了 `start` 或者值为 `undefined`，函数从当前的文件位置开始读取。  

如果声明了 `fd`， `ReadStream` 会忽略 `path` 参数并且会使用声明的文件描述符。这意味着不会有 `open` 事件触发。  

如果 `autoClose` 设为 false，文件描述符就不会关闭，即便出现了错误。关闭文件就成了我们的责任，并且应该确保没有文件描述符泄露。如果设置为 true，在`error` 或者 `end` 时文件描述符会自动关闭。  


## 6. fs.createWriteStream(path[, options])

+ `path` : `<string> | <Buffer>`
+ `options` : `<string> | <Object>`
  + `flags` : `<string>`
  + `defaultEncoding` : `<string>`
  + `fd` : `<integer>`
  + `mode` : `<integer>`
  + `autoClose` : `<boolean>`
  + `start` : `<integer>`

返回一个 `WriteStream` 对象。  

`options` 默认值为下：  

```javascript
{
  flags: 'w',
  defaultEncoding: 'utf8',
  fd: null,
  mode: 0o666,
  autoClose: true
}
```

`start` 指明了数据在文件内写入的位置。修改文件而不是替换文件可以要求 `flags` 为 `r+` 而不是默认的 `w`。  


## 7. Class: ReadStream

事件：
