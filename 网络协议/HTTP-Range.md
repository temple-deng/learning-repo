# Range 范围请求

## Accept-Ranges  

这是个响应首部，服务器用这个首部表明服务器支持范围请求。首部的值表明定义范围使用的单位。  

语法：   

```javascript
Accept-Ranges: bytes
Accept-Ranges: none
```   

`none` 就等价于不支持范围请求。`bytes` 表示范围请求的单位是字节。   

## Range

这是个请求首部，用来告诉服务器应该范围的文档的范围。可以在一个 Range 首部内请求多个不同
的部分，如果服务器返回范围的话，一般是使用 206 Partila Content 响应，或者范围不合法时使用
416 Range Not Satisifiable 错误。或者服务器忽视范围请求返回整个文档200 OK。  


语法 ：  

```
Range: <unit> <range-start>-
Range: <unit> <range-start>-<range-end>
Range: <unit> <range-start>-<range-end>, <range-start>-<range-end>
Range: <unit> <range-start>-<range-end>, <range-start>-<range-end>, <range-start>-<range-end>
```   

```
Range: bytes 200-1000, 2000-6576, 19000-
```   


## Content-Range

响应首部，表明主体属于资源的哪个范围。   

语法：   

```
Content-Range: <unit> <range-start>-<range-end>/<size>
Content-Range: <unit> <range-start>-<range-end>/*
Content-Range: <unit> */<size>
```   

* 表示不知道。但是用在 size 前面是什么鬼。   

## MIME multipart

### multipart/form-data

这个类型用来发送一个完整的浏览器表格给服务器。通常来说这种类型会包含不同的部分，被一个边界符 boundary(以 '--' 开始的字符串)分隔开。每个部分都是自身实体，以及其自身的 HTTP 首部，Content-Disposition， Content-Type 用于文件上传字段，以及其他的内容。貌似意思是Content-Type 用于文件上传。    

```
POST / HTTP/1.1
Host: localhost:8000
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:50.0) Gecko/20100101 Firefox/50.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Connection: keep-alive
Upgrade-Insecure-Requests: 1
Content-Type: multipart/form-data; boundary=---------------------------8721656041911415653955004498
Content-Length: 465

-----------------------------8721656041911415653955004498
Content-Disposition: form-data; name="myTextField"

Test
-----------------------------8721656041911415653955004498
Content-Disposition: form-data; name="myCheckBox"

on
-----------------------------8721656041911415653955004498
Content-Disposition: form-data; name="myFile"; filename="test.txt"
Content-Type: text/plain

Simple file.
-----------------------------8721656041911415653955004498--
```   

注意最后一个分割结束的部分后面还有 '--'。   

### multipart/byteranges  

这个用来将部分响应发送给浏览器。这个类型表示文档是有几个部分组成的，每一个代表一个请求的范围。这个类型也会使用 boundary 指定定义边界字符串。每个部分都有一个 `Content-Type` 来表明文档的类型，以及一个 `Content-Range` 表示它们代表的范围。   

```  
HTTP/1.1 206 Partial Content
Accept-Ranges: bytes
Content-Type: multipart/byteranges; boundary=3d6b6a416f9b5
Content-Length: 385

--3d6b6a416f9b5
Content-Type: text/html
Content-Range: bytes 100-200/1270

eta http-equiv="Content-type" content="text/html; charset=utf-8" />
    <meta name="vieport" content
--3d6b6a416f9b5
Content-Type: text/html
Content-Range: bytes 300-400/1270

-color: #f0f0f2;
        margin: 0;
        padding: 0;
        font-family: "Open Sans", "Helvetica
--3d6b6a416f9b5--
```   

## Content-Disposition

这个响应首部用来表明主体部分是期望 *inline* 展示在浏览器中，这种模式意味着作为一个Web页面或者作为Web页面的一部分展示，或者是期望以 *attachment*,这种模式意味着下载下来并保存在本地。    

如果用在 `multipart/form-data` 主体中，这个首部则是在各个字部分内，提供一些这个部分应用字段的信息。唯一的值是`form-data`，可以添加可选的指令 `name` and `filename`。    

语法：  

当用作响应主体的响应首部时：   

```
Content-Disposition: inline
Content-Disposition: attachment
Content-Disposition: attachment; filename="filename.jpg"
```  

可选的 filename 用来指定保存的文件名，当然用户可能自己还会修改。   

当用作 multipart 主体部分中的首部时：   

```
Content-Disposition: form-data
Content-Disposition: form-data; name="fieldName"
Content-Disposition: form-data; name="fieldName"; filename="filename.jpg"
```    
