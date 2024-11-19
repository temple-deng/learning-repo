# Path

<!-- TOC -->

- [Path](#path)
  - [path.bashname(path[, ext])](#pathbashnamepath-ext)
  - [path.delimiter](#pathdelimiter)
  - [path.dirname(path)](#pathdirnamepath)
  - [path.extname(path)](#pathextnamepath)
  - [path.format(pathObject)](#pathformatpathobject)
  - [path.isAbsolute(path)](#pathisabsolutepath)
  - [path.join([...paths])](#pathjoinpaths)
  - [path.normalize(path)](#pathnormalizepath)
  - [path.parse(path)](#pathparsepath)
  - [path.posix](#pathposix)
  - [path.relative(from, to)](#pathrelativefrom-to)
  - [path.resolve([...paths])](#pathresolvepaths)
  - [path.sep](#pathsep)
  - [path.win32](#pathwin32)

<!-- /TOC -->

```js
const path = require('path');
```    

## path.bashname(path[, ext])

+ `path` string
+ `ext` string
+ Returns: string

返回 `path` 的最后一部分，追尾的目录分隔符会被忽略。   

```js
path.basename('/foo/bar/baz/asdf/quux.html');
// quux.html

path.basename('/foo/bar/baz/asdf/quux.html', '.html');
// quux
```    

## path.delimiter

+ Windows 为 `;`
+ POSIX 为 `:`   

## path.dirname(path)

追尾的目录分隔符会忽略。    

```js
path.dirname('/foo/bar/baz/asdf/quux');
// /foo/bar/baz/asdf
```    

## path.extname(path)

从最后一个 `.` 到字符串的结尾。如果没点，或者 basename 的第一个字符就是点，返回空字符串。    

```js
path.extname('index.html');
// Returns: '.html'

path.extname('index.coffee.md');
// Returns: '.md'

path.extname('index.');
// Returns: '.'

path.extname('index');
// Returns: ''

path.extname('.index');
// Returns: ''
```    

## path.format(pathObject)

+ `pathObject`
  - `dir`
  - `root`
  - `base`
  - `name`
  - `ext`
+ Returns string

如果提供了 `pathObject.dir` 的话，`pathObject.root` 会被忽略。   

如果提供了 `pathObject.base` 的话，`pathObject.ext` 和 `pathObject.name` 会被忽略。   

```js
path.format({
  root: '/ignored',
  dir: '/home/user/dir',
  base: 'file.txt'
});
// /hpme/user/dir/file.txt
```    

## path.isAbsolute(path)

略。   

## path.join([...paths])

使用平台特定的路径分隔符将各个路径片段拼接起来，并且合并路径。   

## path.normalize(path)

合并路径，主要是解决 `.` 和 `..` 的问题。    

## path.parse(path)

略。   

## path.posix

+ Object

访问针对 POSIX 系统的 path 实现。   

## path.relative(from, to)

+ from: string
+ to: string
+ Returns: string    

```js
path.relative('/data/orandea/test/aaa', '/data/orandea/impl/bbb');
// Returns: '../../impl/bbb'
```   

## path.resolve([...paths])

将一系列路径或者路径片段合并成一个绝对路径。   

给定的路径是从右向左进行处理的，直到构建出了一个绝对路径。   

如果在处理完所有路径片段后仍没有构建出一个绝对路径，那就使用 CWD 构建。   

## path.sep

+ Windows `\`
+ POSIX `/`   

## path.win32

略。   
