# ES6 Module

### import

由于 `import` 是静态执行，所以不能使用表达式和变量，这些只有在运行时才能的到结果的语法结构。  

`import` 语句会执行所加载的模块，因此可以有下面的写法。  

`import 'lodash'`  

上面代码仅仅执行 `lodash` 模块，但是不输入任何值。  

如果多次重复执行同一句 `import` 语句，那么会加载多次，但执行一次。  

### 整体加载

模块整体加载所在的那个对象，应该是可以静态分析的，所以不允许运行时改变。  

```javascript
import * as circle from './circle';

// 下面两行都是不允许的
circle.foo = 'hello';
circle.area = function() {};
```  

### export 和 import 的复合写法

```javascript
export { foo, bar } from 'my_module';

// 等同于
import { foo, bar } from 'my_module';
export { foo, bar };
```  

```javascript
export * from 'circle';
```  

上面的 `export *` 表示再输入 `circle` 模块的所有属性和方法。注意， `export *` 会忽略
`circle` 模块的 `default` 方法。  

### ES6 模块与 CommonJS 模块差异

两点差异：  

+ CommonJS 模块输入的是一个值的拷贝，ES6模块输入的是值的引用。  
+ CommonJS 模块是运行时加载，ES6模块是编译时输出接口。  

上面有一点要注意一下，CommonJS 所谓的输出拷贝，应该是指对原模块 `module.exports` 对象的拷贝，
而如果原来对象的属性或者方法时引用类型的话，使用时还是对引用的使用。  

```javascript
// lib.js
var counter = 3;
function incCounter() {
  counter++;
}
module.exports = {
  counter: counter,
  incCounter: incCounter,
};
```  

```javascript
// main.js
var mod = require('./lib');

console.log(mod.counter);  // 3
mod.incCounter();
console.log(mod.counter); // 3  
```  

lib.js模块加载以后，它的内部变化就影响不到输出的`mod.counter`了。这是因为`mod.counter`是一个原始类型的值，会被缓存。除非写成一个函数，才能得到内部变动后的值。  


ES6 模块的运行机制与 CommonJS 不一样。JS 引擎对脚本静态分析的时候，遇到模块加载命令import，就会生成一个只读引用。等到脚本真正执行时，再根据这个只读引用，到被加载的那个模块里面去取值。换句话说，ES6 的import有点像 Unix 系统的“符号连接”，原始值变了，import加载的值也会跟着变。因此，ES6 模块是动态引用，并且不会缓存值，模块里面的变量绑定其所在的模块。   

```javascript
// lib.js
export let counter = 3;
export function incCounter() {
  counter++;
}

// main.js
import { counter, incCounter } from './lib';
console.log(counter); // 3
incCounter();
console.log(counter); // 4
```  

由于 ES6 输入的模块变量，只是一个“符号连接”，所以这个变量是只读的，对它进行重新赋值会报错。  

```javascript
// lib.js
export let obj = {};

// main.js
import { obj } from './lib';

obj.prop = 123; // OK
obj = {}; // TypeError
```  

上面代码中，`main.js`从`lib.js`输入变量`obj`，可以对`obj`添加属性，但是重新赋值就会报错。因为变量`obj`指向的地址是只读的，不能重新赋值，这就好比`main.js`创造了一个名为`obj`的`const`变量。  

### Node 加载

#### import 加载 CommonJS 模块

Node 采用 CommonJS 模块格式，模块的输出都定义在`module.exports`这个属性上面。在 Node 环境中，使用`import`命令加载 CommonJS 模块，Node 会自动将`module.exports`属性，当作模块的默认输出，即等同于`export default`。  

```javascript
// a.js
module.exports = {
  foo: 'hello',
  bar: 'world'
};

// 等同于
export default {
  foo: 'hello',
  bar: 'world'
};
```  

也就说类似加了一句 `export default module.exports`呗。  

```javascript
// 写法一
import baz from './a';
// baz = {foo: 'hello', bar: 'world'};

// 写法二
import {default as baz} from './a';
// baz = {foo: 'hello', bar: 'world'};
```  

如果采用整体输入的写法（`import * as xxx from someModule`），`default`会取代`module.exports`，作为输入的接口。  

```javascript
import * as baz from './a';
// baz = {
//   get default() {return module.exports;},
//   get foo() {return this.default.foo}.bind(baz),
//   get bar() {return this.default.bar}.bind(baz)
// }
```  

上面代码中，`this.default`取代了`module.exports`。需要注意的是，Node 会自动为baz添加`default`属性，通过`baz.default`拿到`module.exports`。    

CommonJS 模块的输出缓存机制，在 ES6 加载方式下依然有效。   

由于 ES6 模块是编译时确定输出接口，CommonJS 模块是运行时确定输出接口，所以采用import命令加载 CommonJS 模块时，不允许采用下面的写法。  

`import {readfile} from 'fs';`  

上面的写法不正确，因为fs是 CommonJS 格式，只有在运行时才能确定readfile接口，而import命令要求编译时就确定这个接口。解决方法就是改为整体输入。     

那么其实也就是说用 `import` 加载 CommonJS 还是遵循 CommonJS 规范，而且加载接口也限制
成了只能加载 `default` 值或者整体输入。   

```javascript
import * as express from 'express';
const app = express.default();

import express from 'express';
const app = express();
```   
