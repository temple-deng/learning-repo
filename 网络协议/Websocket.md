# Websocket

## 1. 构造函数

构造函数接受一个必选的 url 参数与一个可选的协议参数：  

`Websocket(url[, protocols])`  

**url**: DOMString  
  Websocket服务器的URL地址。  

**protocols**: DOMString | DOMString[]  
  用来指定使用的子协议。  

## 2. 属性
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

## 3. 常量

CONNECTIONG: 0.  
OPEN: 1.  
CLOSING: 2.  
CLOSED: 3.

## 4. 方法

`void close(in optional unsigned long code, in optional DOMString reason)`  

`void send(in DOMString data)`
