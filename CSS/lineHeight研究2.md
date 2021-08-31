# Line Height

```html
<style>
    .ver {
        line-height: 200px;
    }
    .ver span {
        font-family: Catamaran;
        font-size: 100px;
    }
</style>

<div class="ver">
    <span>哈哈哈哈哈哈</span>
</div>
```    

这时候 div 是 230px 高，不是 200px。

```html
<style>
    .ver {
        line-height: 200px;
    }
    .ver span {
        font-family: Catamaran;
        font-size: 100px;
    }
</style>

<div class="ver">
    <span></span>
</div>
```    

这时候 div 是 0 高的。    

然而。   

```html
<style>
    .ver {
        line-height: 200px;
    }
    .ver span {
        font-family: Catamaran;
        font-size: 100px;
    }
</style>

<div class="ver">
    <span></span>a
</div>
```    

div 又是 230 的高了。