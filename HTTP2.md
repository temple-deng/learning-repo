# chapter 3. How and Why We Hack the Web

## 3.1 Performance Challenges Today

下图展示了当我们在浏览器地址栏中输入一个 URL 地址后，浏览器对资源的获取流程：    

![object-request](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/object-request.png)   

下图展示了当浏览器收到对资源的响应后如何渲染页面：   

![page-rendering](https://raw.githubusercontent.com/temple-deng/markdown-images/master/network/page-rendering.png)

### 3.1.1 The Problems with HTTP/1.1

+ **队首阻塞**    

很多情况下，我们会对一台主机在一条 TCP 连接上请求多个资源，但是 HTTP 的设计上我们每次只能发送一个请求，并且只有在这个请求的响应返回后，才能在同一条连接上发送第二个请求。    

如果在某一时刻这些请求或者响应出现了一些问题，那么之后的请求和响应就不得不被阻塞在这里。
这种情况就叫做队首阻塞。它可能会造成页面的传输和渲染的挂起。为了解决这个问题，现在的浏览器通常会对一台主机同时打开最多 6 条连接。这是并行机制的一种实现，但是每条连接仍然会遇到
队首阻塞的问题，另外，它也没能好好利用有限的硬件资源。    

+ **TCP 的低效使用**    

注意 TCP 连接有一个慢启动的阶段，由于 HTTP1.1 不支持复用，那么如果浏览器打开了 6 条TCP
连接，则慢启动过程会出现 6 次。    

+ **过于臃肿的报文首部**     

HTTP1.1 只提供了压缩报文的机制，却没有提供压缩首部的机制。在使用 cookies 的网站中，每个
请求首部占据几千字节也不足为奇。     

根据调查，在 2016 年，报文首部的平均长度是 460 字节。对于一个有 140 个对象的页面来说，
这将占据大约 63KB 左右的请求大小。也就说，大约有 3 到 4 轮的 TCP 传送只是为了传输这些
首部。    

+ **缺乏资源的优先级机制**     

略。    

+ **第三方的对象**     

