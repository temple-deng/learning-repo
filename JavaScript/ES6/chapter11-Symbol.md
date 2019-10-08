# 11. Symbol

<!-- TOC -->

- [11. Symbol](#11-symbol)
  - [11.1 概述](#111-概述)
  - [11.2 Symbol.prototype.description](#112-symbolprototypedescription)
  - [11.3 作为属性名的 Symbol](#113-作为属性名的-symbol)
  - [11.6 Symbol.for()和Symbol.keyFor()](#116-symbolfor和symbolkeyfor)
  - [11.7 内置的 Symbol 值](#117-内置的-symbol-值)
    - [Symbol.hasInstance](#symbolhasinstance)
    - [Symbol.isConcatSpreadable](#symbolisconcatspreadable)
    - [Symbol.species](#symbolspecies)
    - [Symbol.match](#symbolmatch)
    - [Symbol.replace](#symbolreplace)
    - [Symbol.search](#symbolsearch)
    - [Symbol.split](#symbolsplit)
    - [Symbol.iterator](#symboliterator)
    - [Symbol.toPrimitive](#symboltoprimitive)
    - [Symbol.toStringTag](#symboltostringtag)
    - [Symbol.unscopables](#symbolunscopables)

<!-- /TOC -->

## 11.1 概述

Symbol 值通过 `Symbol` 函数生成。这就是说，对象的属性名现在可以有两种类型，一种是原来就有的
字符串，另一种就是新增的 `Symbol` 类型。凡是属性名属于 `Symbol 类型`，就都是独一无二的，可以
保证不会与其他属性名产生冲突。    

Symbol函数前不能加 `new` ，否则会报错，因为生成的Symbol是一种原始类型，而不是对象。但是类似
于字符串，可以添加属性，但只是通过包装对象实现，无法具体使用属性。  

接受一个字符串参数，仅作描述作用。相同参数的Symbol的返回值也不等。  

```javascript
var s1 = Symbol();
var s2 = Symbol();
s1 === s2;
//false
var s3 = Symbol('hehe');
var s4 = Symbol('hehe');
s3 === s4;
//false
```   

Symbol值不能与其他类型的值进行运算，会报错。但是可以显示转化为字符串。也可以转化为布尔值，但是
不能转化为数值。   

```
var s = Symbol();
s.toString(); //"Symbol()"
String(s);       //"Symbol()"
```   

也就是说可以转为字符串和布尔值，但是转为字符串的话必须显示转换。    

## 11.2 Symbol.prototype.description

```js
const sym = Symbol('foo');

String(sym)   // "Symbol(foo)"
sym.toString()   // "Symbol(foo)"
```     

上面这种用户获取描述的话很不方便，ES2019 提供了一个实例属性 `description`，直接返回 Symbol
的描述：   

```js
const sym = Symbol("foo");
sym.description;   // "foo"
```    

## 11.3 作为属性名的 Symbol

Symbol用作对象属性名时，不能用点运算符。因为点运算符后面总是字符串。因此会将Symbol的变量名
转换为字符串。所以应该用以下的方式定义。  

```javascript
var mySymbol = Symbol();

// 第一种写法
var a = {};
a[mySymbol] = 'Hello!';

// 第二种写法
var a = {
  [mySymbol]: 'Hello!'
};

// 第三种写法
var a = {};
Object.defineProperty(a, mySymbol, { value: 'Hello!' });

// 以上写法都得到同样结果
a[mySymbol] // "Hello!"
```   

同理，在对象的内部，使用Symbol值定义属性时，Symbol值必须放在方括号之中。   

Symbol作为属性名，该属性不会出现在for...in、for...of循环中，也不会被 `Object.keys()`、
`Object.getOwnPropertyNames()` 返回。但是，它也不是私有属性，有一个
`Object.getOwnPropertySymbols()` 方法，可以获取指定对象的所有Symbol属性名。

`Object.getOwnPropertySymbols` 方法返回一个数组，成员是当前对象的所有用作属性名的Symbol值。   

## 11.6 Symbol.for()和Symbol.keyFor()

`Symbol.for()` 接受一个字符串作为参数，然后搜索有没有以该参数作为名称的Symbol值。如果有，
就返回这个Symbol值，否则就新建并返回一个以该字符串为名称的Symbol值。  

`Symbol.keyFor()` 方法返回一个已登记的Symbol类型值的key。登记操作即调用 `Symbol.for()` 方法。  

```js
let s1 = Symbol.for("foo");
Symbol.keyFor(s1);   // "foo"

let s2 = Symbol("foo")
Symbol.keyFor(s2)  // undefined
```     

也就是说使用 `Symbol.for()` 创建的 symbol 值相当于用 description 在全局环境注册了一个 key，
而 `keyFor` 方法就是搜索参数 symbol 是否有注册过。    

## 11.7 内置的 Symbol 值

ES6 提供了 11 个内置的 Symbol 值，指向语音内部使用的方法。   

### Symbol.hasInstance

对象的 `Symbol.hasInstance` 属性，指向一个内部方法。当其他对象使用 `instanceof` 运算符，
判断是否为该对象的实例时，会调用这个 **方法**。比如 `foo instanceof Foo` 在语言内部，实际调用
的是 `Foo[Symbol.hasIntance](foo)`。     

```js
class MyClass {
  [Symbol.hasInstance](foo) {
    return foo instanceof Array;
  }
}

[1, 2, 3] instanceof new MyClass()    // true
```     

###  Symbol.isConcatSpreadable

对象的 `Symbol.isConcatSpreadable` 属性等于一个布尔值，表示该对象用于 `Array.prototype.concat()`
时，是否可以展开。

```js
let arr1 = ['c', 'd'];
['a', 'b'].concat(arr1, 'e');     // ['a', 'b', 'c', 'd', 'e']
arr1[Symbol.isConcatSpreadable]   // undefined

let arr2 = ['c', 'd'];
arr2[Symbol.isConcatSpreadable] = false;
['a', 'b'].concat(arr2, 'e');    // ['a', 'b', ['c', 'd'], 'e']
```     

数组的默认行为是可以展开，`Symbol.isConcatSpreadable` 默认等于 `undefined`。该属性等于
`true` 时，也有展开的效果。     

### Symbol.species

对象的 `Symbol.species` 属性，指向一个构造函数。创建衍生对象时，会使用该属性：    

```js
class MyArray extends Array {

}

const a = new MyArray(1, 2, 3);
const b = a.map(x => x);
const c = a.filter(x => x > 1);

b instanceof MyArray   // true
c instanceof MyArray   // true
```     

上面代码中，子类 `MyArray` 继承了父类 `Array`，`a` 是 `MyArray` 实例，`b` 和 `c` 是
`a` 的衍生对象（话说什么是衍生对象），你可能会认为，`b` 和 `c` 都是调用数组方法生成的，所以应该
是数组的实例，但实际上他们也是 `MyArray` 的实例。   


`Symbol.species` 属性就是为了解决这个问题而提供的（话说这是哪门子的问题）。现在，我们可以为
`MyArray` 设置 `Symbol.species` 属性：    

```js
class MyArray extends Array {
  static get [Symbol.species]() { return Array; }
}
```    

上面的代码中，由于定义了 `Symbol.species` 属性，创建衍生对象时就会使用这个属性返回的函数，作为
构造函数。这个例子也说明，定义 `Symbol.species` 属性要采用 `get` 取值器。默认的 `Symbol.species`
属性等同于下面的写法：    

```js
static get [Symbol.species]() {
  return this;
}
```    

```js
class MyArray extends Array {
  static get [Symbol.species]() { return Array; }
}

const a = new MyArray();
const b = a.map(x => x);

b instanceof MyArray // false
b instanceof Array // true
```     

总之，Symbol.species的作用在于，实例对象在运行过程中，需要再次调用自身的构造函数时，会调用
该属性指定的构造函数。它主要的用途是，有些类库是在基类的基础上修改的，那么子类使用继承的方法时，
作者可能希望返回基类的实例，而不是子类的实例。    

### Symbol.match

对象的 `Symbol.match` 属性，指向一个函数。当执行 `str.match(myObject)` 时，如果该属性存在，
会调用它，返回该方法的返回值。     

```js
String.prototype.match(regexp);
// 等同于
regexp[Symbol.match](this);

class MyMatched {
  [Symbol.match](string) {
    return 'hello, world'.indexOf(string);
  }
}

'e'.match(new MyMatched);   // 1
```     

### Symbol.replace

对象的 `Symbol.replace` 属性，指向一个方法，当该对象被 `String.prototype.replace` 方法
调用时，会返回该方法的返回值：    

```js
String.prototype.replace(searchValue, replaceValue);
// 等同于
searchValue[Symbol.replace](this, replaceValue);

const x = {};
x[Symbol.replace] = (...s) => console.log(s);

'Hello'.replace(x, 'World')   // ['Hello', 'World']
```     

`Symbol.replace` 方法会收到两个参数，第一个参数是 `replace` 方法正在作用的对象，上面例子是
`Hello`，第二个参数是替换后的值，上面例子是 `World`。     

### Symbol.search

对象的 `Symbol.search` 属性，指向一个方法，当该对象被 `String.prototype.search` 方法调用
时，会返回该方法的返回值。   

```js
String.prototype.search(regexp);
// 等同于
regexp[Symbol.search](this);

class MySearch {
  constructor(value) {
    this.value = value;
  }


  [Symbol.search](string) {
    return string.indexOf(this.value);
  }
}

'foobar'.search(new MySearch('foo')) // 0
```      

### Symbol.split

对象的 `Symbol.split` 属性，指向一个方法，当该对象被 `String.prototype.split` 方法调用时，
会返回该方法的返回值：     


```js
String.prototype.split(separator, limit);
// 等同于
separator[Symbol.split](this, limit);

class MySplitter {
  constructor(value) {
    this.value = value;
  }

  [Symbol.split](string) {
    let index = string.indexOf(this.value);
    if (index === -1) {
      return string;
    }
    return [
      string.substr(0, index),
      string.substr(index + this.value.length);
    ];
  }
}

'foobar'.split(new MySplitter('foo'));
// ['', 'bar']

'foobar'.split(new MySplitter('bar'));

// ['foo', ''];
```     

然而这个东西不接受 `limit` 参数了吗？    


### Symbol.iterator

对象的 `Symbol.iterator` 属性，指向该对象的默认遍历器方法：    

```js
const myIterable = {};
myIterable[Symbol.iterator]= function * () {
  yield 1;
  yield 2;
  yield 3;
}

[...myIterable]  // [1, 2, 3]
```      

### Symbol.toPrimitive

对象的 `Symbol.toPrimitive` 属性，指向一个方法。该对象被转为原始类型的值时，会调用这个方法，
返回该对象对象的原始类型值。     

`Symbol.toPrimitive` 被调用时，会接受一个字符串参数，表示当前运算的模式，一共有三种模式：    

- Number: 该场合需要转成数值
- String: 该场合需要转成字符串
- Default: 该场合可以转成数值，也可以转成字符串      

```js
let obj = {
  [Symbol.toPrimitive](hint) {
    switch (hint) {
      case 'number':
        return 123;
      case 'string':
        return 'str';
      case 'default':
        return 'default';
      default:
        throw new Error();
    }
  }
}

2 * obj  // 246
3 + obj  // '3default'   中性场合
obj === 'default'    // true
String(obj)      // 'str'
```     

### Symbol.toStringTag

对象的 `Symbol.toStringTag` 属性，指向一个方法。在改对象上面调用 `Object.prototype.toString`
方法时，如果这个属性存在，它的返回值会出现在 `toString` 方法返回的字符串之中，表示对象的类型。
也就是说，这个属性可以用来定制 `[object Object]` 或 `[object Array]` 中 `object` 后面的
那个字符串。     

```js
// 例一
({[Symbol.toStringTag]: 'Foo'}.toString());
// "[object Foo]"

class Collection {
  get [Symbol.toStringTag]() {
    return 'xxx'
  }
}

let x = new Collection();
Object.prototype.toString.call(x)    // [object xxx]
```     

ES6 新增内置对象的 `Symbol.toStringTag` 属性值如下：     

- `JSON[Symbol.toStringTag]`: 'JSON'
- `Math[Symbol.toStringTag]`: 'Math'
- Module 对象 `M[Symbol.toStringTag]`: 'Module'
- `ArrayBuffer.prototype[Symbol.toStringTag]`: 'ArrayBuffer'
- `DataView.prototype[Symbol.toStringTag]`: 'DataView'
- `Map.prototype[Symbol.toStringTag]`：'Map'
- `Promise.prototype[Symbol.toStringTag]`：'Promise'
- `Set.prototype[Symbol.toStringTag]`：'Set'
- `%TypedArray%.prototype[Symbol.toStringTag]`：'Uint8Array'等
- `WeakMap.prototype[Symbol.toStringTag]`：'WeakMap'
- `WeakSet.prototype[Symbol.toStringTag]`：'WeakSet'
- `%MapIteratorPrototype%[Symbol.toStringTag]`：'Map Iterator'
- `%SetIteratorPrototype%[Symbol.toStringTag]`：'Set Iterator'
- `%StringIteratorPrototype%[Symbol.toStringTag]`：'String Iterator'
- `Symbol.prototype[Symbol.toStringTag]`：'Symbol'
- `Generator.prototype[Symbol.toStringTag]`：'Generator'
- `GeneratorFunction.prototype[Symbol.toStringTag]`：'GeneratorFunction'

### Symbol.unscopables

略。    
