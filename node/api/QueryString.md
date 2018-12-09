# Query String

<!-- TOC -->

- [Query String](#query-string)
  - [querystring.escape(str)](#querystringescapestr)
  - [querystring.parse(str[,sep[,eq[,options]]])](#querystringparsestrsepeqoptions)
  - [querystring.stringify(obj[,sep[,eq[,options]]])](#querystringstringifyobjsepeqoptions)
  - [querystring.unescape(str)](#querystringunescapestr)

<!-- /TOC -->

```js
const querystring = require('querystring');
```    

## querystring.escape(str)

对 str 执行 URL 百分号编码。   

`querystring.stringify()` 方法使用了 escape 方法，通常我们不会直接使用 escape 方法。   

## querystring.parse(str[,sep[,eq[,options]]])

+ `str` 要解析的 URL 查询字符串
+ `sep` 用来分隔键值对的字符串，默认是 `&`
+ `eq` 用来分隔键和值的字符串，默认是 `=`
+ `options`
  - `decodeURIComponent` Function
  - `maxKeys`

`'foo=bar&abc=xyz&abc=123'`:   

```js
{
  foo: 'bar',
  abc: ['xyz', '123']
}
```   

## querystring.stringify(obj[,sep[,eq[,options]]])

+ `options`:
  - `encodeURIComponent`

## querystring.unescape(str)

略。   