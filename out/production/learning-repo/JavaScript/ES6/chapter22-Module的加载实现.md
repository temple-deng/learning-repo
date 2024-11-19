# 22. Module 的加载实现

## 22.1 浏览器加载

浏览器加载 ES6 模块，使用 `<script>` 标签，但是要加入 `type="module"` 属性。    

浏览器对于带有 `type="module"` 的 `<script>`，都是异步加载，不会造成浏览器阻塞，即等到整个
页面渲染完，再执行模块脚本，等同于打开了 `<script>` 标签的 `defer` 属性。   

`<script>` 标签的 `async` 属性也可以打开，这时只要加载完成，渲染引擎就会中断渲染立即执行。执行
完成后，再恢复渲染。    

```js
<script type="module" src="./foo.js" async></script>
```    

ES6 模块也允许内嵌在网页中，语法行为与加载外部脚本完全一致。    

```js
<script type="module">
  import utils from './utils.js';
  // ...
</script>
```     



