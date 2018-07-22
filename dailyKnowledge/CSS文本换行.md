# CSS文本换行


单行文本溢出省略号:    

```css
    div {
        width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-spacing: nowrap;
    }
```     

1. word-break 当行尾放不下一个单词时，决定单词内部该怎么摆放。    
break-all: 强行上，挤不下的话剩下的就换下一行显示呗。霸道型。    
keep-all: 放不下我了，那我就另起一行展示，再放不下，我也不退缩。傲骄型。    
2. word-wrap 当行尾放不下时，决定单词内是否允许换行
normal: 单词太长，换行显示，再超过一行就溢出显示。
break-word: 当单词太长时，先尝试换行，换行后还是太长，单词内还可以换行。
