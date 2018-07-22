# Websocket

## 简单的例子

```javascript
	var ws = new WebSocket("wss://example.com/socket");         (1)

	ws.onerror = function(error){...}                           (2)

	ws.onclose = function(){...}                                (3)

	ws.onopen = function(){                                     (4)
		ws.send("Connection established. Hello Server");        (5)
	}

	ws.onmessage = function(msg){                               (6)
		if(msg.data instanceof Blob){                           (7)
			processBlob(msg.data);
		} else {
			processText(msg.text);
		}
	}
```  

1. 打开新的安全WebSocket连接(wss)
2. 可选的回调，在连接出错调用
3. 可选回调，连接终止调用
4. 可选回调，在连接时调用
5. 客户端先向服务器发送一条消息
6. 回调函数，服务器每发回一条消息就调用一次
7. 根据消息类型处理   

## 构造函数

构造函数接受一个必选的 url 参数与一个可选的协议参数：  

`Websocket(url[, protocols])`  

**url**: DOMString  
  Websocket服务器的URL地址。  

**protocols**: DOMString | DOMString[]  
  用来指定使用的子协议。  

## 属性

<table>
  <thead>
    <tr>
      <td>属性</td>
      <td>类型</td>
      <td>描述</td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>binaryType</td>
      <td>DOMString</td>
      <td>设置传输的二进制数据的类型。可以是 'blob' 或者 'arraybuffer'</td>
    </tr>
    <tr>
      <td>bufferedAmount</td>
      <td>unsigned long</td>
      <td>使用 send() 方法后排在队列中还没有发送出去的数据的字节大小。</td>
    </tr>
    <tr>
      <td>extensions</td>
      <td>DOMString</td>
      <td>服务器挑选的扩展。当前只能是一个空字符串或者是一个协商后的扩展列表。</td>
    </tr>
    <tr>
      <td>onclose</td>
      <td>EventListener</td>
      <td>当 readyState 为 CLOSED 时的事件监听器</td>
    </tr>
    <tr>
      <td>onerror</td>
      <td>EventListener</td>
      <td></td>
    </tr>
    <tr>
      <td>onmessage</td>
      <td>EventListener</td>
      <td></td>
    </tr>
    <tr>
      <td>onopen</td>
      <td>EventListener</td>
      <td></td>
    </tr>
    <tr>
      <td>protocol</td>
      <td>DOMString</td>
      <td></td>
    </tr>
    <tr>
      <td>readyState</td>
      <td>unsigned short</td>
      <td>只读</td>
    </tr>
    <tr>
      <td>url</td>
      <td>DOMString</td>
      <td>只读</td>
    </tr>
  </tbody>
</table>

## 常量

CONNECTIONG: 0.  
OPEN: 1.  
CLOSING: 2.  
CLOSED: 3.

## 方法

`void close(in optional unsigned long code, in optional DOMString reason)`  

`void send(in DOMString data)`    

## 其他

WebSocket 协议不做格式假设，对应用的净荷叶没有限制：文本或者二进制数据都没问题。从内部看，协议只关注消息的两个信息：净荷长度和类型（前者是一个可变长度字段），据以区别UTF-8数据和二进制数据。  

浏览器接收到新消息后，如果是文本数据，会自动将其转换成 DOMString 对象，如果是二进制数据或 Blob 对象，会直接将其交给应用。  

WebSocket API 可以接收 UTF-8 编码的DOMString对象，也可以接收 ArrayBuffer、ArrayBufferView 或 Blob 等二进制数据。

子协议协商：

```javascript
var ws = new WebSocket("wss://example.com/socket", ['appProtocol', 'appProtocol-v2']);

ws.onopen = function() {
	if(ws.protocol == 'appProtocol-v2') {
		...
	} else {
		...
	}
}
```  
