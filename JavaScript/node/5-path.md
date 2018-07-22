# path

## 1. path.basename(path[, ext])

+ `path` : `<string>`
+ `ext` : `<string>` 可选的文件扩展名
+ Returns：`<string>`

返回 `path` 参数的最后一部分。  

```javascript
path.basename('/foo/bar/baz/asdf/quux.html')
// Returns: 'quux.html'

path.basename('/foo/bar/baz/asdf/quux.html', '.html')
// Returns: 'quux'
```


## 2. path.dirname(path)

+ `path` : `<string>`
+ Returns : `<string>`

返回 `path` 参数的目录名。  

```javascript
path.dirname('/foo/bar/baz/asdf/quux')
// Returns: '/foo/bar/baz/asdf'
```  


## 3. path.extname(path)

+ `path` : `<string>`
+ Returns : `<string>`  

返回 `path` 的扩展名部分，从最后一个 `.` 到字符串的末尾。如果 `path` 的最后一部分没有 `.` 或者 `path` 的 basename 的首字符就是 `.`,
返回空字符串。    

```javascript
path.extname('index.html')
// Returns: '.html'

path.extname('index.coffee.md')
// Returns: '.md'

path.extname('index.')
// Returns: '.'

path.extname('index')
// Returns: ''

path.extname('.index')
// Returns: ''
```  


## 4. path.isAbsolute(path)

+ `path` : `<string>`
+ Returns : `<boolean>`  

返回 `path` 是否是一个绝对路径。  


## 5. path.join([...paths])

+ `...paths` : `<string>` 路径段序列
+ Returns: `<string>`

```javascript
path.join('/foo', 'bar', 'baz/asdf', 'quux', '..')
// Returns: '/foo/bar/baz/asdf'
```  


## 6. path.resolve([...paths])

+ `...paths` : `<string>` 路径段序列
+ Returns: `<string>`

path 序列从右向左的处理，直至构建出一个绝对路径。例如 `path.resolve('/foo', '/bar', 'baz')` 返回 `/bar/baz`。  

如果处理了所有 path 后还是没能构建出绝对路径，就会使用当前目录。  

```javascript
path.resolve('/foo/bar', './baz')
// Returns: '/foo/bar/baz'

path.resolve('/foo/bar', '/tmp/file/')
// Returns: '/tmp/file'

path.resolve('wwwroot', 'static_files/png/', '../gif/image.gif')
// if the current working directory is /home/myself/node,
// this returns '/home/myself/node/wwwroot/static_files/gif/image.gif'
```

## 7. path.sep

+ `string`

基于平台的路径分隔符：  

+ `\` 对于 Windows
+ `/` 对于 POSIX  
