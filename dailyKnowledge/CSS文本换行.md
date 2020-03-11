# CSS文本换行


## 单行文本溢出

```css
div {
    width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-spacing: nowrap;
}
```     

## word-break, word-wrap


```css
word-break: normal | break-all | keep-all;
```    

- normal: 使用浏览器默认的换行规则
- break-all: 允许在单词内换行，允许非 CJK 文本间的单词换行（正常，CJK 你总不能显示一半吧，也就是
行尾的时候，一个单词可以截断成上下多行显示
- keep-all: 只能在半角空格或连字符处换行，不允许CJK(Chinese/Japanese/Korean)文本中的单词
换行，只能在半角空格或连字符处换行。非CJK文本的行为实际上和normal一致。    

word-break 控制的是一个单词内部是如何处理换行的，就是一个单词在溢出的时候如何处理内部的换行规则，
是单词截断换行，还是按浏览器的规则等。    

```css
word-wrap: normal | break-word;
```    
- normal: 只在允许的断字点换行（浏览器默认处理）
- break-word: 一行单词中实在没有其他靠谱的换行点的时候换行

CSS3 里面这个属性改为了 `overflow-wrap`。这个更多是控制多个单词尤其是 CJK 之间的断行。

