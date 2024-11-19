# Back-End Integration

<!-- TOC -->

- [Back-End Integration](#back-end-integration)
  - [开发模式下代理请求](#开发模式下代理请求)

<!-- /TOC -->

## 开发模式下代理请求

如果想要告诉开发模式的服务器将任何无法识别的请求代理到后端服务器，在 package.json 中添加
proxy 字段：    

```json
"proxy": "http://localhost.4000"
```     

Last Updated: 2020-01-20

