# transform  

## transform

`transform: none | <transform-function> [<transform-function>]* `   

表示一个或多个变换函数，以空格分开。注意坐标系统会随着变换而变换，不是说每个变换函数都是相对
于最初的变换系统变换。   

支持的变换函数分别有：`rotate(), scale(), skew(), translate(), matrix(), perspective()`。   

## transform-origin
