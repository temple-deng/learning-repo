# 1. 开始

## 安装

两种方式获取 TypeScript:   

+ 通过 npn
+ 安装 VS 的 TypeScript 插件    

通过 npm 安装：   

`$ npm install -g typescript`    

安装好就可以直接在命令行使用编译器编译文件：   

`tsc greeting.ts; `    

TypeScript里的类型注解是一种轻量级的为函数或变量添加约束的方式。     

## 从 JS 项目迁移

如果是从 React 项目迁移，查看 [React Conversion Guide](https://github.com/Microsoft/TypeScript-React-Conversion-Guide#typescript-react-conversion-guide)   

当我们将 JS 项目迁移时，需要去将输入文件分隔开，防止 TS 覆盖这些文件。当然我们指定了一个特定的输出目录，那么就不必要这么做了。   

然而具体的迁移其实可以说是从一个 JS 项目迁移到了另一个 JS 项目。因为最终 TS 将原 JS 文件编译成了新的 JS 文件。   

假设我们现在有如下的目录结构：   

```
projectRoot
├── src
│   ├── file1.js
│   └── file2.js
├── built
└── tsconfig.json
```    

如果我们还有一个 `tests` 目录在项目根目录下，则可能我们在 `src` 目录中需要一个 `tsconfig.json` 配置文件，`tests` 目录也需要一个。     

### 编写配置文件

TS 使用 `tsconfig.json` 文件管理项目的配置。    

```json
{
  "compilerOptions" : {
    "outDir": "./built",
    "allowJs": true,
    "target": "es5"
  },
  "include": [
    "./src/**/*"
  ]
}
```    

在上面的这个配置文件中我们将以下的内容告诉给了编译器：   

1. 从 `src` 目录中读取任意的文件及任意子目录中的文件（使用 `include` 选项）
2. 接受 JS 文件作为输入
3. 将所有输出文件放置在 `built` 目录中（会保持在 `src` 中同样的目录结构）
4. 将文件编译为符合 ES5 标准语法的结构    

### Moving to TypeScript Files

最后一步很简单，就是将所有 JS 文件名改成 `.ts`，如果文件使用了 JSX，改成 `.tsx`。做完这些改名工作，我们的迁移就算完成了。     

### 移除错误

通常在完成迁移工作后，我们可能会发现编译过程了出现了一些警告或者错误信息。重要的是我们要逐一的查看它们并决定如何处理。 通常这些都是真正的BUG，但有时必须要告诉TypeScript你要做的是什么。      

#### 从模块中导入

首先我们可能会发现很多了例如 `Cannot find name 'require'` 和 `Cannot find name 'define'` 之类的错误信息。如果有这样的情况，应该是因为我们在使用模块系统。这时我们需要告诉 TS 这些函数是存在的：   

```ts
// 对于 Node/CommonJS 模块系统来说
declare function require(path: string): any;
```   

或者：    

```ts
// 对于 RequireJS/AMD
declare function define(...args: any[]): any;
```    

也就说 `declare` 声明就是告诉 TS 我们自己知道某些对象是存在的。     

当然解决这些问题更好的方式是删除这些调用，而使用 TS 语法中的导入语法。    

首先，我们需要设置 `module` 属性来启用一些模块系统。有效的选项有 `commonjs, amd, umd, system`。     

之后呢，如果我们是 Node/CJS 代码：   

```js
var foo = require('foo');

foo.doStuff();
```   

或者是一些 AMD 代码：   

```js
define(['foo'], function(foo) {
  foo.doStuff();
});
```   

那么此时我们应该将这些代码写为如下的 TS 代码：    

```ts
import foo = require('foo');
foo.doStuff();
```    

这样的话，TS 编译器应该会帮我们将导入语句转换成对应模块语法的形式。    

#### 获取声明文件

如果你开始做转换到TypeScript导入，你可能会遇到 `Cannot find module 'foo'`.这样的错误。 问题出在没有声明文件来描述你的代码库。 幸运的是这非常简单。 如果TypeScript报怨像是没有 `lodash` 包，那你只需这样做:    

```
$ npm install -S @types/lodash
```   

如果我们 `module` 设置的是非 `commonjs` 值，那么需要将 `moduleResolution` 设置为 `node`。     

现在我们再导入这个文件时候就没问题了，而且能获取准确的补全。    

#### 从模块中导出

通常来说，从模块中导出会为一个值例如 `exports` 或者 `module.exports` 添加属性。TS 允许我们使用顶层的导出声明。例如我们想要导出一个函数：    

```js
module.exports.feetPets = function(pets) {
  // ...
}
```   

可以写成如下形式：   

```ts
export function feedPets(pets) {
  // ...
}
```    

有时你会完全重写导出对象。例如：   

```js
function foo() {
  // ...
}

module.exports = foo;
```   

那么在 TS 中我们应该写成：   

```ts
function foo() {
  // ...
}

export = foo;
```    

#### 函数重载

```ts
function myCoolFunction(f: (x: number) => void, nums: number[]): void;
function myCoolFunction(f: (x: number) => void, ...nums: number[]): void;
function myCoolFunction() {
    if (arguments.length == 2 && !Array.isArray(arguments[1])) {
        var f = arguments[0];
        var arr = arguments[1];
        // ...
    }
    // ...
}
```    

#### 连续添加属性

有些人可能会因为代码美观性而喜欢先创建一个对象然后立即添加属性：    

```js
var options = {};
options.color = "red";
options.volume = 11;
```    

TypeScript会提示你不能给 `color` 和 `volumn` 赋值，因为先前指定 `options`的类型为 `{}` 并不带有任何属性。 如果你将声明变成对象字面量的形式将不会产生错误：    

```ts
var options = {
  color: "red",
  volume: 11
}
```    

你还可以定义 `options` 的类型并且添加类型断言到对象字面量上。    

```ts
interface Options { color: string; volume: number }

let options = {} as Options;
options.color = "red";
options.volume = 11;
```    

感觉 TS 中的接口更像是一种对具体对象结构的一种声明约束，相当于对对象类型添加额外的类型验证。    

### 启用更严格的检查

#### 没有隐式的 `any`    

在某些情况下TypeScript没法确定某些值的类型。 那么TypeScript会使用 `any` 类型代替。 这对代码转换来讲是不错，但是使用 `any` 意味着失去了类型安全保障，并且你得不到工具的支持。 你可以使用 `noImplicitAny` 选项，让TypeScript标记出发生这种情况的地方，并给出一个错误。     

#### 严格 `null` 和 `undefined` 检查

默认地，TypeScript把 `null` 和 `undefined` 当做属于任何类型。 这就是说，声明为 `number` 类型的值可以为 `null` 和 `undefined`。TypeScript包含了`strictNullChecks` 选项来帮助我们减少对这种情况的担忧。    

当启用了 `strictNullChecks` ，`null` 和 `undefined` 获得了它们自己各自的类型`null` 和 `undefined` 。 当任何值 可能为 `null` ，你可以使用联合类型。 比如，某值可能为 `number` 或 `null` ，你可以声明它的类型为 `number | null`。    

####  `this` 没有隐式的 `any`   

当你在类的外部使用 `this` 关键字时，它会默认获得 `any` 类型。 比如，假设有一个 Point类，并且我们要添加一个函数做为它的方法：    

```ts
class Point {
    constuctor(public x, public y) {}
    getDistance(p: Point) {
        let dx = p.x - this.x;
        let dy = p.y - this.y;
        return Math.sqrt(dx ** 2 + dy ** 2);
    }
}
// ...

// Reopen the interface.
interface Point {
    distanceFromOrigin(point: Point): number;
}
Point.prototype.distanceFromOrigin = function(point: Point) {
    return this.getDistance({ x: 0, y: 0});
}
```    

这就产生了我们上面提到的错误 - 如果我们错误地拼写了 `getDistance` 并不会得到一个错误。 正因此，TypeScript有 `noImplicitThis` 选项。 当设置了它，TypeScript会产生一个错误当没有明确指定类型（或通过类型推断）的 this被使用时。 解决的方法是在接口或函数上使用指定了类型的 `this` 参数：       

```ts
Point.prototype.distanceFromOrigin = function(this: Point, point: Point) {
    return this.getDistance({ x: 0, y: 0});
}
```   







