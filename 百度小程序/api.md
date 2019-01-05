# API

# 网络

## 请求

### request

参数名 | 类型 | 必填 | 默认值 | 说明
---------|----------|---------|---------|---------
 url | String | 是 | - | -
 data | Object/String | 否 | - | 请求参数
 header | Object | 否 | - | 请求 header
 method | String | 否 | GET | OPTIONS, GET, HEAD, POST, PUT, DELETE
 dataType | String | 否 | json | 有效值 string, json
 responseType | String | 否 | text | 响应数据类型 text, arraybuffer
 success | Function | 否 | - | 成功回调
 fail | Function | 否 | - | -
 complete | - | - | - | -   

success 参数说明：   

- data: 服务器返回数据
- statusCode: http 状态码
- header: 首部   

## 上传、下载

### uploadFile

客户端发起一个 HTTPS POST 请求，其中 content-type 为 multipart/form-data
如页面通过 swan.chooseImage 等接口获取到一个本地资源的临时文件路径后，可通过此接口将
本地资源上传到指定服务器。    

参数 | 类型 | 必填 | 说明
---------|----------|---------|---------
 url | String | 是 | -
 filePath | String | 是 | 文件路径
 name | String | 是 | 文件对应的 key，开发者在服务器端通过这个 key 可以获取到文件二进制内容
 header | Object | 否 | -
 formData | Object | 请求中额外的 form data
 success | - | - | -
 fail | - | - | -
 complete | - | - | -