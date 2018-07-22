# Path

目录：   

+ [Windows vs. POSIX](#contrast)
+ [path.basename(path[,ext])](#basename)
+ [path.delimiter](#delimiter)
+ [path.dirname(path)](#dirname)
+ [path.extname(path)](#extname)
+ [path.format(pathObject)](#format)
+ [path.isAbsolute(path)](#isabsolute)
+ [path.join([...paths])](#join)
+ [path.normalize(path)](#normalize)
+ [path.parse(path)](#parse)
+ [path.posix](#posix)
+ [path.relative(from, to)](#relative)
+ [path.resolve([...paths])](#resolve)
+ [path.sep](#sep)
+ [path.win32](#win32)


## Windows vs. POSIX

<a name="contrast"></a>   

`path` 模块默认的操作符是基于运行的操作系统的。尤其是当在 Windows 上运行时， `path` 模块会
假设使用 Windows 风格的路径。   

例如，在不同的系统中，使用Windows文件路径 `C:\temp\myfile.html` 调用 `path.basename()` 会得到不同的结果。   

在 POSIX 上：   

```javascript
path.basename('C:\\temp\\myfile.html')
// 返回 'C:\\temp\\myfile.html'
```   

在 Windows 上：   

```javascript
path.basename('C:\\temp\\myfile.html')
// 返回 'myfile.html'
```   

如果要实现对 Windows 文件路径返回一致的结果，使用 `path.win32`。   

注意上面的例子其实说明的是当我们对不同风格的路径进行操作时返回不同的结果。   

在 POSIX 及 Windows 上：   

```javascript
path.win32.basename('C:\\temp\\myfile.html')
// 返回 'myfile.html'
```   

如果想对 POSIX 文件路径得出一致的结果，使用 `path.posix`:   

```javascript
path.posix.basename('/tmp/myfile.html');
// Returns: 'myfile.html'
```   

## path.basename(path[,ext])

<a name="basename"></a>   

+ `path` &lt;string&gt;
+ `ext` &lt;string&gt; 可选的文件扩展名
+ Returns: &lt;string&gt;   

返回 `path` 的最后一部分。尾端的目录分隔符会被忽略。  


```javascript
path.basename('/foo/bar/baz/asdf/quux.html');
// Returns: 'quux.html'

path.basename('/foo/bar/baz/asdf/quux.html', '.html');
// Returns: 'quux'
```   

## path.delimiter

<a name="delimiter"></a>   

+ &lt;string&gt;   

路径分隔符是与平台相关的：   

+ `;` Windows
+ `:` POSIX   

## path.dirname(path)

<a name="dirname"></a>   

+ `path` &lt;string&gt;
+  Returns: &lt;string&gt;   

返回 `path` 的目录名。尾端的目录分隔符被忽略。   

```javascript
path.dirname('/foo/bar/baz/asdf/quux');
// Returns: '/foo/bar/baz/asdf'
```   

## path.extname(path)

<a name="extname"></a>   

返回 `path` 的扩展名，从最后一个点`.` 到 `path` 最后一部分的结尾，如果 `path` 的最后一部分
中没有 `.`，或者 `path` 的 basename 第一个字符为 `.`,就返回空字符串。   

```javascript
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

<a name="format"></a>   

+ `pathObject` &lt;Object&gt;
  - `dir` &lt;string&gt;
  - `root` &lt;string&gt;
  - `base`
  - `name`
  - `ext`
+ Returns: &lt;string&gt;    

从一个 object 上返回一个路径， `path.parse()` 的相反操作。    

当提供这些属性时需要注意的到，这些属性结合时最终可能会出现一个属性被一个优先级更高的属性覆盖：   

+ 如果提供了 `dir` 的话会忽略 `root`
+ 如果提供了 `base` 的话会忽略 `ext` 和 `name`   

```javascript
// If `dir`, `root` and `base` are provided,
// `${dir}${path.sep}${base}`
// will be returned. `root` is ignored.
path.format({
  root: '/ignored',
  dir: '/home/user/dir',
  base: 'file.txt'
});
// Returns: '/home/user/dir/file.txt'

// `root` will be used if `dir` is not specified.
// If only `root` is provided or `dir` is equal to `root` then the
// platform separator will not be included. `ext` will be ignored.
path.format({
  root: '/',
  base: 'file.txt',
  ext: 'ignored'
});
// Returns: '/file.txt'

// `name` + `ext` will be used if `base` is not specified.
path.format({
  root: '/',
  name: 'file',
  ext: '.txt'
});
// Returns: '/file.txt'
```   

## path.isAbsolute(path)

<a name="isabsolute"></a>   

+ Returns: &lt;boolean&gt;   

```javascript
path.isAbsolute('/foo/bar'); // true
path.isAbsolute('/baz/..');  // true
path.isAbsolute('qux/');     // false
path.isAbsolute('.');        // false
```   

## path.join([...paths])   

<a name="join"></a>   

使用平台特定的路径片段分隔符将所有给定的 `path`参数连接起来，之后 normalize 最终的路径。   

```javascript
path.join('/foo', 'bar', 'baz/asdf', 'quux', '..');
// Returns: '/foo/bar/baz/asdf'

path.join('foo', {}, 'bar');
// throws 'TypeError: Path must be a string. Received {}'
```   

## path.normalize(path)

<a name="normalize"></a>   

将给定的 `path` 规则化，主要是解析 `..` 和 `.`。    

```javascript
path.normalize('/foo/bar//baz/asdf/quux/..');
// Returns: '/foo/bar/baz/asdf'
```   

## path.parse(path)   

+ Returns: &lt;Object&gt;    

没啥好说的，返回的对象就是 format 中传入的对象的样子：   

```javascript
path.parse('/home/user/dir/file.txt');
// Returns:
// { root: '/',
//   dir: '/home/user/dir',
//   base: 'file.txt',
//   ext: '.txt',
//   name: 'file' }
```    

## path.posix

<a name="posix"></a>   

+ &lt;Object&gt;    

提供了所有 `path` 方法的 POSIX 实现。   

## path.relative(from, to)

<a name="relative"></a>   

+ `from` &lt;string&gt;
+ `to` &lt;string&gt;
+ Returns: &lt;string&gt;   

返回从 `from` 到 `to` 的相对路径，如果两者最终是相同的路径，就返回一个空字符串。   

```javascript
path.relative('/data/orandea/test/aaa', '/data/orandea/impl/bbb');
// Returns: '../../impl/bbb'
```   

## path.resolve([...paths])   

将一系列路径及路径片段解析成一个绝对路径。   

给定的路径序列是从右到左处理的，将每个 `path` 前缀到右边的路径上，直到最后得出一个绝对路径。   

如果在处理了所有 `path` 后还是没有得出一个绝对路径，就将当前工作目录前缀上去。   

最终的路径时规范化的并且最终的斜线会被移除。   

如果不传参数的话，就返回 cwd 的绝对路径。   

```javascript
path.resolve('/foo/bar', './baz');
// Returns: '/foo/bar/baz'

path.resolve('/foo/bar', '/tmp/file/');
// Returns: '/tmp/file'

path.resolve('wwwroot', 'static_files/png/', '../gif/image.gif');
// if the current working directory is /home/myself/node,
// this returns '/home/myself/node/wwwroot/static_files/gif/image.gif'
```   

## path.sep

<a name="sep"></a>   

提供平台特定的路径片段分隔符：   

+ Windows 上为 `\`
+ POSIX 上为 `/`

## path.win32

同 posix，不过是 Windows 的实现。   
