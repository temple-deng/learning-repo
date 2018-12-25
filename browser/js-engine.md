## JS 引擎管道

一切的起点就是我们的 JS 代码。JS 引擎将源代码解析成 AST。基于 AST，解释器 interpreter 将
AST 转换为字节码。所以 AST 是解释器的输入，输出是字节码。    

![js-engine-pipeline](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/js-engine-pipeline.png)  

为了提高运行速度，字节码携带一些分析数据 profiling data 可以被发送给优化编译器。优化编译器基于
分析数据做出合理的推断，然后生成经过优化的机器代码。    

这个模型和 V8 是高度类似的：   

![interpreter-optimizing-compiler-v8](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/interpreter-optimizing-compiler-v8.png)    

V8 中的解释器叫做 ignition，负责生成和执行字节码。当执行字节码时，会收集分析数据。这些
分析数据会用来加速后续的代码执行。   

SpiderMonkey 是有些不同的，它有两个优化编译器，Baseline 编译器运行字节码然后产出某种程度上经过
优化的代码。然后分析数据和这些经过优化的代码再传递给 IonMonkey 编译器，产生高度优化的代码。   

![interpreter-optimizing-compiler-spidermonkey](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/interpreter-optimizing-compiler-spidermonkey.png)    

Edge 的 Chakra 和 FF 的类似，Safari 和 RN 的 JSC 则有 3 个优化编译器。   

为什么 JS 引擎要有这么多优化编译器。解释器可以很快地产生字节码，但是字节码不是非常高效的。优化
编译器呢花的时间长一点，但是最终会产生高效的机器代码。    

## JS 对象模型

接下来我们更深一步探索 JS 引擎的内部实现，例如，如果实现的 JS 对象模型，以及用了什么方法
来加速对对象属性的访问。   

ECMA 规范本质上将所有对象定义为字典。即将一个字符串的键名映射到一个 property attributes。
所以其实这个哈希表就是字符串到一个称为 property attributes 的映射咯。     

![object-model](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/object-model.png)    

除了 `[[Value]]` 本身，规范还定义了这些属性：   

+ `[[Writable]]`，决定属性是否可以重新被赋值
+ `[[Enumerable]]` 决定属性是否可以用 `for-in` 循环遍历到
+ `[[Configurable]]` 决定属性是否可以被删除

数组方面其实与对象是高度类似的。一个不同点在于数组的索引需要特殊的处理。另一个不同点就是
属性 `length` 属性有魔幻的效果。          

在定义上，数组与对象是类似的。例如，所有的数组索引都是用一个字符串表示的。   

![array-1](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/array-1.png)    

每当有一个元素添加到数组中，JS 自动更新 `length` 的 property attribute 的 `[[Value]]`。   

## 优化属性访问

如果我们查看一些 JS 代码的话，会发现访问对象的属性是一个非常常见的操作。因此对于 JS 引擎
来说，实现快速地访问属性是非常重要的。   

```js
const object = {
	foo: 'bar',
	baz: 'qux',
};

// Here, we’re accessing the property `foo` on `object`:
doSomething(object.foo);
//          ^^^^^^^^^^
```    

### Shapes

在 JS 程序中，通常会有多个对象含有相同的键名集合，我们可以把这样的一些对象看做是有相同
**shape**。   

```js
const object1 = { x: 1, y: 2 };
const object2 = { x: 3, y: 4 };
// `object1` and `object2` have the same shape.
```    

同样，我们的代码中可能也经常会出现访问有相同 shape 对象的同一键名的现象：  

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

基于这一点，JS 引擎会基于对象的 shape 来优化对象属性的访问。  

![object-model](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/object-model.png)    

如果我们访问 `object.y`，JS 引擎搜索 `JSObject` 的键 `y`，然后加载对应的属性描述符，最后返回
`[[Value]]`。    

但是这些 property attributes 是在内存中的哪一部分存储的呢？作为 `JSObject` 的一部分存储？
如果是这样，在后面我们会看到许多有相同 shape 的对象，如果在 `JSObject` 中存储这个包含属性名
和属性 attributes 的完整的哈希表的话，就有点浪费了，因为这些属性名在每个有相同 shape 的
对象中都会存储一次。这导致了重复以及不必要的内存使用。作为一个优化措施，引擎将对象 `Shape`
与对象分开存储。   

![shape-1](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/shape-1.png)    

`Shape` 包含了所有的属性名和 attributes，除了 `[[Value]]`。不过，`Shape` 包含了值在
`JSObject` 中的偏移，因此 JS 引擎知道去哪找这些值。每个有相同 shape 的 `JSObject` 都指向
了同一个 `Shape` 实例。目前为止，每个 `JSObject` 都只存储了其自己的所有值。   

![shape-2](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/shape-2.png)    

所有的 JS 引擎都使用 shape 作为优化，但是它们的叫法都不同：   

+ 学术论文中一般称其为 **Hidden Classes**
+ V8 称其为 **Maps**
+ Charkra 称其为 **Types**
+ JavaScriptCore 称其为 **Structures**
+ SpiderMonkey 称其为 **Shapes**    

### Transition chains and tress

当我们现在有一个有了明确 shape 的对象，但之后我们又在其上添加了一个属性，会发生什么？   

```js
const object = {};
object.x = 5;
object.y = 6;
```   

这种形成 shape 的方式在 JS 引擎中称为 **transition chains**：   


![shape-3](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/shape-3.png)    

对象在一开始不包含任何属性，因此指向一个空的 shape。之后的声明添加了一个属性 'x'，因此
JS 引擎将 shape 过渡到包含属性 'x' 的 shape，并将 5 添加到 `JSObject` 中，然后将其
偏移量 0 添加到 shape 中。之后的声明类似。   

**注意**：不同的属性顺序会影响 shape。例如 `{x: 4, y: 5}` 和 `{y: 5, x: 4}` 的 shape
是不一样的。    

我们甚至没必要为每个 `Shape` 存储完整的属性表。相反，每个 `Shape` 只需要知道每次操作
引入的新的属性。例如，我们在最后的 shape 中没有存储有关 `'x'` 的信息，因为其可以在链的
前部找到 x。为了使这种机制工作，每个 `Shape` 会链回前面的 shape:   

![shape-4](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/shape-4.png)    

如果我们在代码中写下 `o.x`，JS 引擎会从链的尾部向上搜索 `'x'` 直到其找到 `'x'`。   

但是如果我们没有办法创建一个 transition chain 怎么办？例如，如果我们有两个空对象，
然后为它们分别添加了不同的属性：   

```js
const object1 = {};
object1.x = 5;
const object2 = {};
object2.y = 6;
```    

这种情况下，我们不得不拆出分支，而不是使用一条链，这种结构称为 **transition tree**。    

![shape-5](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/shape-5.png)    

可以看到链的末尾是我们最终的 `JSObject`，所以其实属性访问就如图所示的这样咯？    

但是这种链表的遍历方法显然效率不够吧，时间复杂度接近于 `o(n)`。为了提高属性搜索的性能，
JS 引擎添加了 `ShapeTable` 数据结构。`ShapeTable` 是一个字典，将属性键名映射到引入
这个属性的 `Shape` 上。       

![shape-6](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/shape-6.png)    

现在，我们又回到了字典查询，这是我们一开始引入 `Shape` 概念的地方，那为什么还要费心去引入
`Shape` 呢。    

原因是 shape 开启了另一项优化措施，叫做 `Inline Caches`。   

### Inline Caches(ICs)

shape 背后的主要的动机就是 Inline Caches 的理念。ICs 是让 JS 快速运行的一个关键部分。
JS 引擎使用 ICs 来记忆对象上属性所处的位置，减少搜索的时间复杂度。   

```js
function getX(x) {
	return o.x;
}
```    

如果我们在 JSC 中运行这个代码，会生成如下的字节码：   

![ics-1](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/ics-1.png)    

第一条指令 `get_by_id` 加载第一个参数 `arg1` 的属性 `'x'`，并将结果存储到 `loc0` 中。
第二条指令返回我们在 `loc0` 存储的结果。    

JSC 同样会内嵌一个 Inline Cache 到 `get_by_id` 指令中，包含了两个未初始化的插槽 slots。   

![ics-2](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/ics-2.png)    

现在假设我们使用对象 `{x: 'a'}` 调用 `getX`。正如我们之前学到的，对象会有一个包含 `'x'`
属性的 shape。当我们第一次执行这个函数时，`get_by_id` 指令搜索属性 `'x'` 然后找到
其在编译为 0 的位置上的值。   

![ics-3](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/ics-3.png)    

IC 会在 `get_by_id` 指令中内嵌入我们记忆下来的 shape 以及我们找到的属性的偏移。   

对于后续的执行，IC 仅仅需要比较 shape，如果与之前的 shape 相同，就直接从记忆下来的偏移处
加载值。    

### 高效存储数组

数组就没必要为每个数组索引属性都存储 attributes，因为这会造成对内存的大量浪费。相反，JS
引擎默认情况下认为数组索引元素都是可写，可枚举，可配置的。然后将索引元素和其他命名属性分开
存储。   

```js
const array = [
	'#jsconfeu'
]
```    

![array-2](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/array-2.png)    

然后，元素是这样存储的：   

![array-3](https://raw.githubusercontent.com/temple-deng/markdown-images/master/browser/array-3.png)    