## JS 引擎管道

一切的起点就是我们的 JS 代码。JS 引擎将源代码解析成 AST。基于 AST，解释器 interpreter 将
AST 转换为字节码。然后在 JS 引擎上运行的就是这些字节码咯？    

![js-engine-pipeline](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/js-engine-pipeline.png)  

为了提高运行速度，字节码携带一些分析数据 profiling data 可以被发送给优化编译器。优化编译器基于
分析数据做出合理的推断，然后生成经过优化的机器代码。    

这个模型和 V8 是高度类似的：   

![interpreter-optimizing-compiler-v8](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/interpreter-optimizing-compiler-v8.png)    

V8 中的解释器叫做 ignition，负责生成和执行字节码。当执行字节码时，会收集分析数据。   

SpiderMonkey 是有些不同的，它有两个优化编译器，Baseline 编译器运行字节码然后产出某种程度上经过
优化的代码。然后分析数据和这些经过优化的代码再传递给 IonMonkey 编译器，产生高度优化的代码。   

![interpreter-optimizing-compiler-spidermonkey](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/interpreter-optimizing-compiler-spidermonkey.png)    

Edge 的 Chakra 和 FF 的类似，Safari 和 RN 的 JSC 则有 3 个优化编译器。   

为什么 JS 引擎要有这么多优化编译器。解释器可以很快地产生字节码，但是字节码不是非常高效的。优化
编译器呢花的时间长一点，但是最终会产生高效的机器代码。    

## JS 对象模型

ECMA 规范本质上将所有对象定义为字典。即将一个字符串映射到一个 property attributes。   

![object-model](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/object-model.png)    

数组方面其实与对象是高度类似的。    

![array-1](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/array-1.png)    

每当有新元素添加到数组中时，JS 会自动更新 length 到 `[[Value]]` 属性。    

## 优化属性访问

```js
const object = {
	foo: 'bar',
	baz: 'qux',
};

// Here, we’re accessing the property `foo` on `object`:
doSomething(object.foo);
//          ^^^^^^^^^^
```    

在 JS 程序中，通常会有多个对象含有相同的键名，这样的对象有相同 **shape**。   

```js
const object1 = { x: 1, y: 2 };
const object2 = { x: 3, y: 4 };
// `object1` and `object2` have the same shape.
```    

同时，代码中也经常会访问相同 shape 的同一属性：   

```js
function logX(object) {
	console.log(object.x);
	//          ^^^^^^^^
}

const object1 = { x: 1, y: 2 };
const object2 = { x: 3, y: 4 };

logX(object1);
logX(object2);
```  

![object-model](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/object-model.png)    

如果我们访问 `object.y`，JS 引擎搜索 `JSObject` 的键 `y`，然后加载对应的属性描述符，最后返回
`[[Value]]`。    


