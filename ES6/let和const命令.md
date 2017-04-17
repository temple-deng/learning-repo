# let和const命令


```
 1. 暂时性死区
 2. 不允许重复声明
 3. const命令
 4. 全局对象的属性
```
 ---

## 1.暂时性死区

只要块级作用域内存在`let`命令，它所声明的变量就“绑定”（binding）这个区域，不再受外部的影响。  

```javascript
    var tmp = 123;

    if(true){
        tmp = 'abc';  //ReferenceError
        let tmp;
    }
```  

>上面代码中，存在全局变量tmp，但是块级作用域内let又声明了一个局部变量tmp，导致后者绑定这个块级作用域，所以在let声明变量前，对tmp赋值会报错。

>ES6明确规定，如果区块中存在let和const命令，这个区块对这些命令声明的变量，从一开始就形成了封闭作用域。凡是在声明之前就使用这些变量，就会报错。

>总之，在代码块内，使用let命令声明变量之前，该变量都是不可用的。这在语法上，称为“暂时性死区”（temporal dead zone，简称TDZ）。
暂时性死区意味着typeof 运算符不再安全.  

```javascript
	typeof x;   //ReferenceError
	let x;

	typeof undefined_variable;  //"undefined"
```

## 2.不允许重复声明

let不允许在相同作用域内，重复声明同一个变量。  

```javascript
// 报错
function () {
  let a = 10;
  var a = 1;
}

// 报错
function () {
  let a = 10;
  let a = 1;
}
```

因此，不能在函数内部重新声明参数。  

```javascript
function func(arg) {
  let arg; // 报错
}

function func(arg) {
  {
    let arg; // 不报错
  }
}

```  

同时要注意，函数其实也是变量，所以当函数声明在块级作用域中（不同于之前的函数块级作用域而是大括号包含的块级作用域），括号外部也是无法引用函数的。  

```javascript
    {
        function f(){
            console.log("haha");
        }
    }
    f();    //RederenceError : f is not defined
```

## 3.  const命令

const命令一旦声明变量，就必须立即初始化。但是在非严格模式下，无论是在定义const常量时不初始化，还是在定义后再赋值，均不会报错，只有在严格模式下才会报错。  

```
    const PI
    //SyntaxError: missing = in const declaration
```  

对于复合类型的变量，变量名不指向数据，而是指向数据所在的地址。const命令只是保证变量名指向的地址不变，并不保证该地址的数据不变，所以将一个对象声明为常量必须非常小心。  

ES5只有两种声明变量的方法：var命令和function命令。ES6除了添加let和const命令，后面章节还会提到，另外两种声明变量的方法：import命令和class命令。所以，ES6一共有6种声明变量的方法。  
　　　　
<br>
## 4. 全局对象的属性

ES6为了改变这一点，一方面规定，为了保持兼容性，var命令和function命令声明的全局变量，依旧是全局对象的属性；另一方面规定，let命令、const命令、class命令声明的全局变量，不属于全局对象的属性。也就是说，从ES6开始，全局变量将逐步与全局对象的属性脱钩。  
