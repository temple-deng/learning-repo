# URL


+ [URL Strings and URL Objects](#part1)
+ [The WHATWG URL API](#WHATWG)
  - [Class: URL](#classURL)
    - [Constructor: new URL(input[, base])](#classConstructor)
    - [url.hash](#Whash)
    - [url.host](#Whost)
    - [url.hostname](#Whostname)
    - [url.href](#Whref)
    - [url.origin](#Worigin)
    - [url.password](#Wpassword)
    - [url.pathname](#Wpathname)
    - [url.port](#Wport)
    - [url.protocol](#Wprotocol)
    - [url.search](#Wsearch)
    - [url.searchParams](#WsearchParams)
    - [url.username](#Wusername)
    - [url.toString()](#WtoString)
    - [url.toJSON()](#WtoJSON)
  - [Class: URLSearchParams](#classURLSearchParams)
    - Constructor: new URLSearchParams()
    - Constructor: new URLSearchParams(string)
    - Constructor: new URLSearchParams(obj)
    - Constructor: new URLSearchParams(iterable)
    - [urlSearchParams.append(name, value)](#Sappend)
    - [urlSearchParams.delete(name)](#Sdelete)
    - [urlSearchParams.entries()](#Sentries)
    - [urlSearchParams.forEach(fn[, thisArg])](#SforEach)
    - [urlSearchParams.get(name)](#Sget)
    - [urlSearchParams.getAll(name)](#SgetAll)
    - [urlSearchParams.has(name)](#Shas)
    - [urlSearchParams.keys()](#Skeys)
    - [urlSearchParams.set(name, value)](#Sset)
    - [urlSearchParams.sort()](#Ssort)
    - [urlSearchParams.toString()](#StoString)
    - [urlSearchParams.values()](#Svalues)
    - [urlSearchParams[@@iterator]()](#S@@iterator)
  - [url.domainToASCII(domain)](#toascii)
  - [url.domainToUnicode(domain)](tounicode)
  - [url.format(URL[, options])](#format)
+ [Legacy URL API](#legacyapi)
  - [Legacy urlObject](#legacyurl)
    - urlObject.auth
    - urlObject.hash
    - urlObject.host
    - urlObject.hostname
    - urlObject.href
    - urlObject.path
    - urlObject.pathname
    - urlObject.port
    - urlObject.protocol
    - urlObject.query
    - urlObject.search
    - urlObject.slashes
  - url.format(urlObject)
  - [url.parse(urlString[, parseQueryString[, slashesDenoteHost]])](#parse)
  - [url.resolve(from, to)](#resolve)
+ [Percent-Encoding in URLs](#percent-encode)
  - Legacy API
  - WHATWG API

# URL

`url` 模块提供了 URL 解析的一些工具方法。    

`const url = require('url');`   

## URL Strings and URL Object  

<a name="part1"></a>

一个 URL 字符串是一个包含多个不同含义组件的结构化字符串。当被解析时，会返回一个包含这些
组件属性的 URL 对象。    

`url` 模块提供了两种与 URLs 工作的 APIs: 一种 Node.js 规定的遗留的 API,以及一种实现了与浏览器使用
的 WHATWG URL Standard 相同的新版的 API。     

*Note*: 遗留的 API 并没有被废弃，但是只是为了维持对现有应用的向后兼容性。新的应用应该使用
WHATWG API。    

旧的遗留的的API 与 WHATWG API 的比较如下。对于 URL `'http://user:pass@sub.host.com:8080/p/a/t/h?query=string#hash'`，由遗留的 `url.parse()`
返回的对象的属性是在上方，而 WHATWG `URL` 对象的属性是在下面。    

*Note*: WHATWG URL 的 `origin` 属性包括 `protocol` and `host`，但不包括 `username` or `password`。    

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                            href                                             │
├──────────┬──┬─────────────────────┬─────────────────────┬───────────────────────────┬───────┤
│ protocol │  │        auth         │        host         │           path            │ hash  │
│          │  │                     ├──────────────┬──────┼──────────┬────────────────┤       │
│          │  │                     │   hostname   │ port │ pathname │     search     │       │
│          │  │                     │              │      │          ├─┬──────────────┤       │
│          │  │                     │              │      │          │ │    query     │       │
"  https:   //    user   :   pass   @ sub.host.com : 8080   /p/a/t/h  ?  query=string   #hash "
│          │  │          │          │   hostname   │ port │          │                │       │
│          │  │          │          ├──────────────┴──────┤          │                │       │
│ protocol │  │ username │ password │        host         │          │                │       │
├──────────┴──┼──────────┴──────────┼─────────────────────┤          │                │       │
│   origin    │                     │       origin        │ pathname │     search     │ hash  │
├─────────────┴─────────────────────┴─────────────────────┴──────────┴────────────────┴───────┤
│                                            href                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
(all spaces in the "" line should be ignored -- they are purely for formatting)
```   

使用 WHATWG API 解析 URL 字符串：   

```javascript
const { URL } = require('url');
const myURL =
  new URL('https://user:pass@sub.host.com:8080/p/a/t/h?query=string#hash');
```    

使用遗留的 API 解析 URL 字符串：   

```javascript
const url = require('url');
const myURL =
  url.parse('https://user:pass@sub.host.com:8080/p/a/t/h?query=string#hash');
```    

## The WHATWG URL API  

<a name="WHATWG"></a>   

*Note*: 在 `URL` 对象上使用 `delete` 运算符删除属性会返回 `true`，但没有实际的删除效果。   

### Class: URL  

<a name="classURL"></a>   

#### Constructor: new URL(input[,base])

<a  name="classConstructor"></a>    

+ `input` &lt;string&gt; 要解析的 URL 输入
+ `base` &lt;string&gt; | &lt;URL&gt; 如果 `input` 不是绝对路径的话，这个是其解析时的基础 URL。   

通过解析一个相对于 `base` 的 `input` 创建一个新的 `URL` 对象。如果 `base` 也是一个字符串，
则会先调用 `new URL(base)` 解析。    

```javascript
const { URL } = require('url');
const myURL = new URL('/foo', 'https://example.org/');
  // https://example.org/foo
```    

如果 `input` or `base` 不是有效的 URLs 的话会抛出错误。注意通常来说会对无效的 URLs 先
进行强制类型转换，看看能否得出有效的 URL：    

```javascript
const { URL } = require('url');
const myURL = new URL({ toString: () => 'https://example.org/' });
  // https://example.org/
```    

#### url.hash

<a  name="Whash"></a>    

+ &lt;string&gt;    

获取和设置 URL 的片段部分。   

```javascript
const { URL } = require('url');
const myURL = new URL('https://example.org/foo#bar');
console.log(myURL.hash);
  // Prints #bar

myURL.hash = 'baz';
console.log(myURL.href);
  // Prints https://example.org/foo#baz
```   

`hash` 部分设置无效的 URL 字符会经过 percent-encoded 。    

#### url.host

<a name="Whost"></a>   

+ &lt;string&gt;    

获取和设置 URL 的主机部分。    

```javascript
const { URL } = require('url');
const myURL = new URL('https://example.org:81/foo');
console.log(myURL.host);
  // Prints example.org:81

myURL.host = 'example.com:82';
console.log(myURL.href);
  // Prints https://example.com:82/foo
```    

给 `host` 属性设置无效的主机值会被忽略。    

#### url.hostname  

<a name="Whostname"></a>    

+ &lt;string&gt;   

获取和设置 URL 的主机名部分。    

```javascript
const { URL } = require('url');
const myURL = new URL('https://example.org:81/foo');
console.log(myURL.hostname);
  // Prints example.org

myURL.hostname = 'example.com:82';
console.log(myURL.href);
  // Prints https://example.com:81/foo
```    

给 `hostname` 属性设置无效的主机名会被忽略。    

#### url.href   

<a name="Whref"></a>   

+ &lt;string&gt;   

获取和设置序列化的 URL。   

```javascript
const { URL } = require('url');
const myURL = new URL('https://example.org/foo');
console.log(myURL.href);
  // Prints https://example.org/foo

myURL.href = 'https://example.com/bar';
console.log(myURL.href);
  // Prints https://example.com/bar
```    

获取 `href` 的属性值等价于调用 `url.toString()`。    

设置这个属性值等价于调用 `new URL(value)` 创建一个新的对象。对象上的每个属性会被修改。    

如果给 `href` 设置无效的 URL，会抛出错误。

#### url.origin

<a name="Worigin"></a>    

+ &lt;origin&gt;    

获取只读的 URL origin 的序列化结果。主机名部分的 Unicode 字符是尚未编码的样子。    

```javascript
const { URL } = require('url');
const myURL = new URL('https://example.org/foo/bar?baz');
console.log(myURL.origin);
  // Prints https://example.org
const idnURL = new URL('https://你好你好');
console.log(idnURL.origin);
  // Prints https://你好你好

console.log(idnURL.hostname);
  // Prints xn--6qqa088eba
```    

#### url.password

<a name="Wpassword"></a>    

+ &lt;string&gt;   

获取和设置 URL 的密码部分。   

```javascript
const { URL } = require('url');
const myURL = new URL('https://abc:xyz@example.com');
console.log(myURL.password);
  // Prints xyz

myURL.password = '123';
console.log(myURL.href);
  // Prints https://abc:123@example.com
```    

给 `password` 赋值时如果包含无效的 URL 字符会被 percent-encoded。    

#### url.pathname

<a  name="Wpathname"></a>

+ &lt;string&gt;  

获取和设置 URL 的路径部分。   

```javascript
const { URL } = require('url');
const myURL = new URL('https://example.org/abc/xyz?123');
console.log(myURL.pathname);
  // Prints /abc/xyz

myURL.pathname = '/abcdef';
console.log(myURL.href);
  // Prints https://example.org/abcdef?123
```    

给 `pathname` 属性赋值时包含无效的 URL 字符时会进行 percent-encoded。    

#### url.port  

<a name="Wport"></a>

+ &lt;string&gt;   

获取和设置 URL 的端口部分。   

```javascript
const { URL } = require('url');
const myURL = new URL('https://example.org:8888');
console.log(myURL.port);
  // Prints 8888

// Default ports are automatically transformed to the empty string
// (HTTPS protocol's default port is 443)
myURL.port = '443';
console.log(myURL.port);
  // Prints the empty string
console.log(myURL.href);
  // Prints https://example.org/

myURL.port = 1234;
console.log(myURL.port);
  // Prints 1234
console.log(myURL.href);
  // Prints https://example.org:1234/

// Completely invalid port strings are ignored
myURL.port = 'abcd';
console.log(myURL.port);
  // Prints 1234

// Leading numbers are treated as a port number
myURL.port = '5678abcd';
console.log(myURL.port);
  // Prints 5678

// Non-integers are truncated
myURL.port = 1234.5678;
console.log(myURL.port);
  // Prints 1234

// Out-of-range numbers are ignored
myURL.port = 1e10;
console.log(myURL.port);
  // Prints 1234
```    

端口的值可以设置为包含数值的字符串或者数值，范围是 0~65535(包括)。给这个属性设置 `protocol`
默认的端口号时会导致 `port` 值为空字符串(`''`)。    

如果给 `port` 设置无效的字符串，但是字符串的开头是数字，那么前导的数字被设置为属性值。
否则，或者数值的范围超出，会被忽略。    

#### url.protocol  

<a name="Wprotocol"></a>

+ &lt;string&gt;

获取和设置协议部分。   

```javascript
const { URL } = require('url');
const myURL = new URL('https://example.org');
console.log(myURL.protocol);
  // Prints https:

myURL.protocol = 'ftp';
console.log(myURL.href);
  // Prints ftp://example.org/
```   

无效的赋值会被忽略。   

#### url.search

<a  name="Wsearch"></a>    

+ &lt;string&gt;    

获取和设置序列化的查询部分。    

```javascript
const { URL } = require('url');
const myURL = new URL('https://example.org/abc?123');
console.log(myURL.search);
  // Prints ?123

myURL.search = 'abc=xyz';
console.log(myURL.href);
  // Prints https://example.org/abc?abc=xyz
```    

`search` 赋值时任何无效的 URL 字符会被 percent-encoded。    

#### url.searchParams   

<a name="WsearchParams"></a>

+ &lt;URLSearchParams&gt;   

获取代表 URL 查询参数的 URLSearchParams 对象。这个属性是只读的。    

#### url.username  

<a  name="Wusername"></a>   

+ &lt;string&gt;   

获取和设置用户名部分。   

```javascript
const { URL } = require('url');
const myURL = new URL('https://abc:xyz@example.com');
console.log(myURL.username);
  // Prints abc

myURL.username = '123';
console.log(myURL.href);
  // Prints https://123:xyz@example.com/
```    

`username` 赋值时任何无效的 URL 字符都会被 percent-encoded。    

#### url.toString()

<a name="WtoString"></a>

+ Returns: &lt;string&gt;   

返回序列化的 URL。值等价于 `url.href` and `url.toJSON()`。    

#### url.toJSON()

<a name="WtoJSON"></a>    

+ Returns: &lt;string&gt;    

返回序列化的 URL。当使用 `JSON.stringify()` 序列化 URL 对象时自动调用这个函数。     

### Class: URLSearchParams   

<a name="classURLSearchParams"></a>  

`URLSearchParams` API 提供了对 URL 查询部分的读写访问。`URLSearchParams` 类可以使用下面的
四种构造函数独立使用。    

WHATWG `URLSearchParams` 接口及 `querystring` 模块有相似的用途，但是 `querystring` 的
用法更常规一点，因为它可以使用定制的分隔字符(`&`and`=`)。但是这里的 API则是完全为
URL 查询字符串设计的。    

```javascript
const { URL, URLSearchParams } = require('url');

const myURL = new URL('https://example.org/?abc=123');
console.log(myURL.searchParams.get('abc'));
  // Prints 123

myURL.searchParams.append('abc', 'xyz');
console.log(myURL.href);
  // Prints https://example.org/?abc=123&abc=xyz

myURL.searchParams.delete('abc');
myURL.searchParams.set('a', 'b');
console.log(myURL.href);
  // Prints https://example.org/?a=b

const newSearchParams = new URLSearchParams(myURL.searchParams);
// The above is equivalent to
// const newSearchParams = new URLSearchParams(myURL.search);

newSearchParams.append('a', 'c');
console.log(myURL.href);
  // Prints https://example.org/?a=b
console.log(newSearchParams.toString());
  // Prints a=b&a=c

// newSearchParams.toString() is implicitly called
myURL.search = newSearchParams;
console.log(myURL.href);
  // Prints https://example.org/?a=b&a=c
newSearchParams.delete('a');
console.log(myURL.href);
  // Prints https://example.org/?a=b&a=c
```   

#### Constructor: new URLSearchParams()   

初始化一个空的 `URLSearchParams` 对象。    

#### Constructor: new URLSearchParams(string)

将 `string` 作为查询字符串解析，并且用它初始化一个新的 `URLSearchParams` 对象。如果有
前导的 `'?'` 会被忽略。   

```javascript
const { URLSearchParams } = require('url');
let params;

params = new URLSearchParams('user=abc&query=xyz');
console.log(params.get('user'));
  // Prints 'abc'
console.log(params.toString());
  // Prints 'user=abc&query=xyz'

params = new URLSearchParams('?user=abc&query=xyz');
console.log(params.toString());
  // Prints 'user=abc&query=xyz'
```    

#### Constructor: new URLSearchParams(obj)

+ `obj` &lt;Object&gt;   

使用查询的 hash map 初始化一个新的 `URLSearchParams`。`obj` 的键名与键值都会强制转换为字符串。   

*Note*: 不同于 `querystring` 模块，不允许为一个键使用数组来复制多份。数组会使用 `array.toString()`
字符串化。    

```javascript
const { URLSearchParams } = require('url');
const params = new URLSearchParams({
  user: 'abc',
  query: ['first', 'second']
});
console.log(params.getAll('query'));
  // Prints [ 'first,second' ]
console.log(params.toString());
  // Prints 'user=abc&query=first%2Csecond'
```    

#### Constructor: new URLSearchParams(iterable)

+ `iterable` &lt;Iterable&gt; 一个可迭代的对象   

```javascript
const { URLSearchParams } = require('url');
let params;

// Using an array
params = new URLSearchParams([
  ['user', 'abc'],
  ['query', 'first'],
  ['query', 'second']
]);
console.log(params.toString());
  // Prints 'user=abc&query=first&query=second'

// Using a Map object
const map = new Map();
map.set('user', 'abc');
map.set('query', 'xyz');
params = new URLSearchParams(map);
console.log(params.toString());
  // Prints 'user=abc&query=xyz'

// Using a generator function
function* getQueryPairs() {
  yield ['user', 'abc'];
  yield ['query', 'first'];
  yield ['query', 'second'];
}
params = new URLSearchParams(getQueryPairs());
console.log(params.toString());
  // Prints 'user=abc&query=first&query=second'

// Each key-value pair must have exactly two elements
new URLSearchParams([
  ['user', 'abc', 'error']
]);
  // Throws TypeError [ERR_INVALID_TUPLE]:
  //        Each query pair must be an iterable [name, value] tuple
```    

#### urlSearchParams.append(name, value)

<a  name="Sappend"></a>   

+ `name`, `value` &lt;string&gt;    

给查询字符串追加新的名值对。   

#### urlSearchParams.delete(name)

<a  name="Sdelete"></a>  

移除名字 `name` 的所有名值对。   

#### urlSearchParams.entries()

<a  name="Sentries"></a>  

+ Returns: &lt;Iterator&gt;   

`urlSearchParams[@@iterator]` 的别名。   

#### urlSearchParams.forEach(fn[,thisArg])   

<a  name="SforEach"></a>  

```javascript
const { URL } = require('url');
const myURL = new URL('https://example.org/?a=b&c=d');
myURL.searchParams.forEach((value, name, searchParams) => {
  console.log(name, value, myURL.searchParams === searchParams);
});
  // Prints:
  // a b true
  // c d true
```   

注意函数的传参顺序。    

#### urlSearchParams.get(name)

<a  name="Sget"></a>   

返回第一个 `name` 的名值对的值。如果没有就返回 `null`。     

#### urlSearchParams.getAll(name)

<a  name="SgetAll"></a>  

+ Returns: &lt;Array&gt;   

返回所有名字为 `name` 的名值对的值。如果没有的话就返回空数组。    

#### urlSearchParams.has(name)

<a  name="Shas"></a>   

+ Returns: &lt;boolean&gt;    

#### urlSearchParams.keys()

<a  name="Skeys"></a>  

#### urlSearchParams.set(name,value)

<a  name="Sset"></a>   

在设置的时候，如果已经有名字为 `name` 的名值对，那么会将第一个名值对的值设为 `value`，然后
删除其他的名值对。     

#### urlSearchParams.sort()

<a  name="Ssort"></a>    

根据名字排序所有的名值对，in-place。   

#### urlSearchParams.toString()

<a name="StoString"></a>


返回序列化的字符串，必要时会进行 percent-encoded。   

#### urlSearchParams.values()

<a name="Svalues"></a>   
略。

#### urlSearchParams[@@iterator]()

+ Returns: &lt;Iterator&gt;    

等价于 `urlSearchParams.entries()`。    

<a name="S@@iterator"></a>   

### url.domainToASCII(domain)

<a name="toascii"></a>    

+ `domain` &lt;string&gt;
+ Returns: &lt;string&gt;   


返回 Punycode ASCII 序列化的 `domain`。如果 `domain` 是无效的域，
那么返回空字符串。    

这个函数执行 `url.domainToUnicode()` 相反的操作：   

```javascript
const url = require('url');
console.log(url.domainToASCII('español.com'));
  // Prints xn--espaol-zwa.com
console.log(url.domainToASCII('中文.com'));
  // Prints xn--fiq228c.com
console.log(url.domainToASCII('xn--iñvalid.com'));
  // Prints an empty string
```    

### url.domainToUnicode(domain)

<a name="tounicode"></a>    

返回 Unicode 序列化的 `domain`。如果 `domain` 是无效的域，
那么返回空字符串。    

```javascript
const url = require('url');
console.log(url.domainToUnicode('xn--espaol-zwa.com'));
  // Prints español.com
console.log(url.domainToUnicode('xn--fiq228c.com'));
  // Prints 中文.com
console.log(url.domainToUnicode('xn--iñvalid.com'));
  // Prints an empty string
```   


### url.format(URL[,options])

<a name="format"></a>   

+ `URL` &lt;URL&gt; 一个 WHATWG URL 对象
+ `options` &lt;Object&gt;
  - `auth` &lt;boolean&gt; 如果序列化的结果需要包含用户名与密码部分就设为 `true`。默认为 `true`
  - `fragment` &lt;boolean&gt; 如果需要包含片段部分设为 `true`。
  默认为 `true`
  - `search` &lt;boolean&gt; 如果序列化的 URL 字符串需要包含查询部分，就设为 `true`。默认为 `true`。
  - `unicode` &lt;boolean&gt; 如果主机部分的 Unicode 字符串应该直接编码而不是 Punycode 编码就设为 `true`。默认为 `false`。   

返回一个 WHATWG URL 对象定制序列化后的 URL 字符串。   

其实就是让我们将不想要的部分省略。    

```javascript
const { URL } = require('url');
const myURL = new URL('https://a:b@你好你好?abc#foo');

console.log(myURL.href);
  // Prints https://a:b@xn--6qqa088eba/?abc#foo

console.log(myURL.toString());
  // Prints https://a:b@xn--6qqa088eba/?abc#foo

console.log(url.format(myURL, { fragment: false, unicode: true, auth: false }));
  // Prints 'https://你好你好/?abc'
```   

## Legacy URL API

<a name="legacyapi"></a>   

### Legacy urlObject

<a  name="legacyurl"></a>   

遗留的 urlObject(`require('url').Url`)是使用 `url.parse` 函数创建并返回的。   

#### urlObject.auth

用户名和密码部分，也被引用做 "userinfo"。字符串格式为`{username}[:{password}]`，`[:{password}]` 是可选的。    

例如 `'user:pass'`。

#### urlObject.hash   

例子: `'#hash'`


#### urlObject.host

全小写的主机部分：`'sub.host.com:8080'`。   

#### urlObject.hostname

全小写的主机名 `'sub.host.com'`  

#### urlObject.href   

完整的 URL 字符串，不过主机与协议部分全小写 `'http://user:pass@sub.host.com:8080/p/a/t/h?query=string#hash'`.    

#### urlObject.path

包含 `pathname` 和 `search` 两部分。不会进行解码。    

`'/p/a/t/h?query=string'`。   

#### urlObject.pathname   

不会进行解码。   

`'/p/a/t/h'`。    

#### urlObject.port

`'8080'`。    

#### urlObject.protocol

`'http:'`。   

#### urlObject.query   

这个属性值是字符串还是对象取决于传递给 `url.parse()` 的 `parseQueryString ` 参数。   

例如 `'query=string'` or `{'query': 'string'}`。    

如果是字符串，不会解码，如果是对象，键名与键值都会进行解码。     

#### urlObject.search   

`'?query=string'`。不会进行解码。    

#### urlObject.slashes   

这个属性是个布尔值，如果为 `true` 的话，那么协议部分后面
就需要跟两条斜线。    

### url.format(urlObject)

略。

### url.parse(urlString[, parseQueryString[, slashesDenoteHost]])   

<a name="parse"></a>    

+ `urlString` &lt;string&gt; 要解析的 URL 字符串
+ `parseQueryString` &lt;boolean&gt; 如果为 `true`，那么
`query` 属性会设置为 `querystring` 模块 `parse()` 方法返回的对象，否则就是一个未解析未编码的字符串。默认为 `false`。
+ `slashesDenoteHost` &lt;boolean&gt; 如果为 `true`，
那么在前两条斜线 `//` 到之后另一条斜线 `/` 之前的部分解释为 `host`。默认为 `false`。   

### url.resolve(from,to)

<a  name="resolve"></a>     

+ `from` &lt;string&gt; 解析的基础 URL
+ `to` &lt;string&gt; 解析的 HREF URL   

这个方法用浏览器解析锚点的方式解析：    

```javascript
const url = require('url');
url.resolve('/one/two/three', 'four');         // '/one/two/four'
url.resolve('http://example.com/', '/one');    // 'http://example.com/one'
url.resolve('http://example.com/one', '/two'); // 'http://example.com/two'
```   

看样子类似于直接替换最后一部分。    

## Percent-Encoding in URLs  

<a name="percent-encode"></a>      

URL 只允许包含一部分范围内的字符。任何范围外的字符都需要编码。这些字符如何编码，以及哪些字符需要编码完全取决于字符所处的 URL 的位置。      


### 补充内容

百分号编码，也称为 URL 编码。

URI所允许的字符分作保留与未保留。保留字符是那些具有特殊含义的字符。未保留字符没有这些特殊含义. 百分号编码把保留字符表示为特殊字符序列。   

保留字符： `! * ' ( ) ; : @ & = + $ , / ? # [ ]`。    

未保留字符：`a-z A-Z 0-9 - _ . ~`。   

URI 中其他的字符都必须使用百分比编码。     

百分号编码一个保留字符，首先需要把该字符的ASCII的值表示为两个16进制的数字，然后在其前面放置转义字符("%")，置入URI中的相应位置。(对于非ASCII字符, 需要转换为UTF-8字节序, 然后每个字节按照上述方式表示。)

### Legacy API

在遗留的 API 中，空格 ` ` 和下面的字符会在 URL 对象的属性中自动转义：   

```
< > " ` \r \n \t { } | \ ^ '
```  

例如，ASCII 空格字符 ` ` 关于编码为 `%20`。   

### WHATWG API  

WHATWG URL Standard 使用一个更有选择性及粒度更精细的方法来选择要编码的字符。   

WHATWG 算法定义了3个 "percent-encoded sets"，用来描述必须用 percent-encoded(其实就是百分比编码方式)编码的字符的范围：    

+ *C0 control percent-encoded set* 包括码点在 U+0000 到 U+001F 范围内，及所有码点大于 U+007E 的字符
+ *path percent-encoded set* 包含 *C0 control percent-encoded set* ，以及码点
为 U+0020, U+0022, U+0023, U+003C, U+003E, U+003F, U+0060, U+007B, and U+007D 的字符。
+ *userinfo encode set* 包含 *path percent-encoded set*，以及码点为U+002F, U+003A, U+003B, U+003D, U+0040, U+005B, U+005C, U+005D, U+005E, and U+007C 的字符。    

*userinfo encode set* 是专门用来为 URL 中的用户名及密码部分编码的。*path percent-encoded set* 是用来编码 URL 中的路径部分。*C0 control percent-encoded set* 是用来为所有其他部分编码的，包括 URL 片段部分，以及在特别说明情况下的主机及路径部分。    

当非 ASCII 字符串出现在主机名部分时，主机名是使用 Punycode 算法编码的。然而，主机名
部分可能同时包含 Punycode 及 percent-encoded 编码的字符，例如：   

```javascript
const { URL } = require('url');
const myURL = new URL('https://%CF%80.com/foo');
console.log(myURL.href);
  // Prints https://xn--1xa.com/foo
console.log(myURL.origin);
  // Prints https://π.com
```     

## Punycode   

Punycode 是一种主要为了域名国际化的字符编码模式。因为 URL 中的主机名是限制为只能使用
ASCII 字符，域名中包含的非 ASCII 字符必须使用 Punycode 转换为 ASCII 。    
