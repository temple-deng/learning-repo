# CSS自定义属性

## 简介

自定义属性的定义由 -- 开头，这样浏览器能够区分自定义属性和原生属性，可以用CSS自定义属性存储
任意有效的CSS属性值：  

```css
.foo {
  --theme-color: blue;
  --spacer-width: 8px;
  --favorite-number: 3;
  --greeting: "Hey ,what't up";
}
```

## 使用

使用 `var()` 方法来取得自定义的属性值。  

```CSS
.button {
  background-color: var(--theme-color);
}
```

`var()` 可以接收第二个参数作为缺省值：  

```CSS
.button {
  background-color: var(--theme-color, gray);
}
```  
