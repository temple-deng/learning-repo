# Flutter for web developers

本例假设 HTML 使用了 border-box 的盒模型。Flutter 中 "Lorem ipsum" 文本的默认样式由
bold24Roboto 变量定义，以保持语法简单：    

```dart
TextStyle bold24Roboto = TextStyle(
  color: Colors.white,
  fontSize: 24.0,
  fontWeight: FontWeight.w900,
);
```     

# 1. 进行基本的布局操作

## 1.1 文本样式和对齐

CSS 中的字体样式例如 font-style, font-size 等和颜色等属性在 Flutter 中都是一个 `Text`
widget 的孩子 `TextStyle` 上的各个独立的属性：    

```html
<div class="greybox">
    Lorem ipsum
</div>

.greybox {
      background-color: #e0e0e0; /* grey 300 */
      width: 320px;
      height: 240px;
      font: 900 24px Georgia;
}
```    

```dart
var container = Container(
  child: Text(
    "Lorem ipsum",
    style: TextStyle(
      fontSize: 24.0,
      fontWeight: FontWeight.w900,
      fontFamily: "Georgia",
    ),
  ),
  width: 320.0,
  height: 240.0,
  color: Colors.grey[300],
);
```    

## 1.2 设置背景色

在 Flutter 中使用 Container 的 `decoration` 属性设置背景色：    

```dart
var container = Container(
  child: Text(
    "Lorem ipsum",
    style: bold24Roboto,
  ),
  width: 320.0,
  height: 240.0,
  decoration: BoxDecoration(
    color: Colors.grey[300],
  ),
);
```

## 1.3 组件居中

`Center` widget 会将其孩子水平垂直居中。    

```dart
var container = Container(
  child: Center(
    child: Text(
      "Lorem ipsum",
      style: bold24Roboto,
    ),
  ),
  width: 320.0,
  height: 240.0,
  color: Colors.grey[300],
);
```    

