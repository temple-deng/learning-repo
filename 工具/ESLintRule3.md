# ESLint Rule  

## strict  

要求或者禁止严格模式命令。    

注意 `"use strict"` 是可以出现在函数体中，只应用于函数及所有包含的函数的。   

如果配置中使用了下面之一的解析器选项，那么不管配置的 option 是什么，都禁止使用严格模式指令：   

+ `"sourceType": "module"` 这意味着，文件是 ECMAScript 模块
+ `"impliedStrict": true`     

同样的，如果一个函数的参数是非简单的参数列表（例如使用了默认参数），那么这个函数也禁止使用严格
模式指令，因为这在 ES5 中是语法错误。     

### Options

字符串选项：    

算了先略。   

## Variables   

下面的规则是与变量声明相关的。   

## init-declartions   

强制或者禁止在变量声明时初始化。   

### Options

两个选项：  

1. 一个字符串的，可以是 `"always"`(default) 强制在声明时初始化，或者是 `"never"` 禁止在
声明时初始化。这个规则适用于 `var`, `let`, `const` 声明，不过 `"never"` 是被 `const` 忽略的，
因为这样的变量必须初始化呗
2. 一个对象选项用来控制规则的行为。当前可用的属性只有 `ignoreForLoopInit`,表明在设置 `never`时，允许
在 `for` 循环中初始化。

## no-catch-shadow  

这个略，主要是为 IE8 准备的。主要是禁止catch字句的参数与外部作用域的变量同名。   

## no-delete-var  

禁止对变量进行 `delete` 操作咯。   

## no-label-var

禁止与变量同名的 label。   

## no-restricted-globals

这个规则可以让我们指定一个全局变量的列表，这些全局变量不可以出现在代码中，注意这里不能出现，
指的应该是不能定义同名的变量，不是说不能用。   

注意这个列表是直接作为 options 的，不是放在一个数组中。   

## no-shadow  

貌似是这样，禁止定义与外部作用域中存在的同名变量，避免局部变量覆盖全局变量吧。   

选项略。

## no-shadow-restricted-names   

禁止对一些全局变量重新赋值。    

## no-undef

禁止对未声明变量的引用。   

### Options

对象选项有一个布尔值的 `typeof` 属性，默认是 `false`。   

## no-undef-init  

禁止在声明变量时赋值为 `undefined`。   

## no-undefined  

禁止使用 `undefined`。

## no-unused-vars

略，太长。   

## 
