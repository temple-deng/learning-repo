# 13. Porxy和Reflect

<!-- TOC -->

- [13. Porxy和Reflect](#13-porxy和reflect)
  - [13.1 Proxy](#131-proxy)
    - [1. get(target, propKey, receiver)](#1-gettarget-propkey-receiver)
    - [2. set(target, propKey, value, receiver)](#2-settarget-propkey-value-receiver)
    - [3. apply(target, object, args)](#3-applytarget-object-args)
    - [4. has(target, propKey)](#4-hastarget-propkey)
    - [5. construct(target, args)](#5-constructtarget-args)
    - [6. deleteProperty(target, propKey)](#6-deletepropertytarget-propkey)
    - [7. defineProperty(target, propKey, propDesc)](#7-definepropertytarget-propkey-propdesc)
    - [8. getOwnPropertyDescriptor(target, propKey)](#8-getownpropertydescriptortarget-propkey)
    - [9. getPrototypeOf(target)](#9-getprototypeoftarget)
    - [10. isExtensible(target)](#10-isextensibletarget)
    - [11. ownKeys(target)](#11-ownkeystarget)
    - [12. preventExtensions(target)](#12-preventextensionstarget)
    - [13. setPrototypeOf(target, proto)](#13-setprototypeoftarget-proto)
  - [13.2 Proxy.revocable()](#132-proxyrevocable)

<!-- /TOC -->

## 13.1 Proxy  

```
	var proxy = new Proxy(target, handler)

	//proxt支持的拦截操作
	get(target, propKey, receiver)
	//拦截对象属性的读取，比如proxy.foo和proxy['foo']，返回类型不限。最后一个参数receiver可选，当target对象设置了propKey属性的get函数时，receiver对象会绑定get函数的this对象。

	set(target, propKey, value, receiver)
	//拦截对象属性的设置，比如proxy.foo = v或proxy['foo'] = v，返回一个布尔值。

	has(target, propKey)
	//拦截propKey in proxy的操作，返回一个布尔值。

	deleteProperty(target, propKey)
	//拦截delete proxy[propKey]的操作，返回一个布尔值。

	enumerate(target)
	//拦截for (var x in proxy)，返回一个遍历器。

	ownKeys(target)
	//拦截Object.getOwnPropertyNames(proxy)、Object.getOwnPropertySymbols(proxy)、Object.keys(proxy)，返回一个数组。该方法返回对象所有自身的属性，而Object.keys()仅返回对象可遍历的属性。

	getOwnPropertyDescriptor(target, propKey)
	//拦截Object.getOwnPropertyDescriptor(proxy, propKey)，返回属性的描述对象。

	defineProperty(target, propKey, propDesc)
	//拦截Object.defineProperty(proxy, propKey, propDesc）、Object.defineProperties(proxy, propDescs)，返回一个布尔值。

	getPrototypeOf(target)
	//拦截Object.getPrototypeOf(proxy)，返回一个对象。

	setPrototypeOf(target, proto)
	//拦截Object.setPrototypeOf(proxy, proto)，返回一个布尔值。

	//如果目标对象是函数，那么还有两种额外操作可以拦截。
	apply(target, object, args)
	//拦截Proxy实例作为函数调用的操作，比如proxy(...args)、proxy.call(object, ...args)、proxy.apply(...)。

	construct(target, args, proxy)
	//拦截Proxy实例作为构造函数调用的操作，比如new proxy(...args)。
```  

### 1. get(target, propKey, receiver)  

`get`方法用于拦截某个属性的读取操作。下面是一个拦截读取操作的例子。  

```javascript
var person = {
  name: "张三"
};

var proxy = new Proxy(person, {
  get: function(target, property) {
    if (property in target) {
      return target[property];
    } else {
      throw new ReferenceError("Property \"" + property + "\" does not exist.");
    }
  }
});

proxy.name // "张三"
proxy.age // 抛出一个错误
```  

上面代码表示，如果访问目标对象不存在的属性，会抛出一个错误。如果没有这个拦截函数，访问不存在的属性，只会返回undefined。  

如果一个属性不可配置（configurable）和不可写（writable），则该属性不能被代理，通过 Proxy 对象访问该属性会报错。  

```javascript

const target = Object.defineProperties({}, {
  foo: {
    value: 123,
    writable: false,
    configurable: false
  },
});

const handler = {
  get(target, propKey) {
    return 'abc';
  }
};

const proxy = new Proxy(target, handler);

proxy.foo
// TypeError: Invariant check failed  
```  

### 2. set(target, propKey, value, receiver)

set方法用来拦截某个属性的赋值操作。  

```javascript
let validator = {
  set: function(obj, prop, value) {
    if (prop === 'age') {
      if (!Number.isInteger(value)) {
        throw new TypeError('The age is not an integer');
      }
      if (value > 200) {
        throw new RangeError('The age seems invalid');
      }
    }

    // 对于age以外的属性，直接保存
    obj[prop] = value;
  }
};

let person = new Proxy({}, validator);

person.age = 100;

person.age // 100
person.age = 'young' // 报错
person.age = 300 // 报错
```   

注意，如果目标对象自身的某个属性，不可写也不可配置，那么set不得改变这个属性的值，只能返回同样的值，否则报错。  

### 3. apply(target, object, args)  

apply方法拦截函数的调用、call和apply操作。   

apply方法可以接受三个参数，分别是目标对象、目标对象的上下文对象（this）和目标对象的参数数组。  

这种情况的话 target 应该必须是个函数吧。  

```javascript
var target = function () { return 'I am the target'; };
var handler = {
  apply: function () {
    return 'I am the proxy';
  }
};

var p = new Proxy(target, handler);

p()
// "I am the proxy"
```   

```javascript
var twice = {
  apply (target, ctx, args) {
    return Reflect.apply(...arguments) * 2;
  }
};
function sum (left, right) {
  return left + right;
};
var proxy = new Proxy(sum, twice);
proxy(1, 2) // 6
proxy.call(null, 5, 6) // 22
proxy.apply(null, [7, 8]) // 30
```   

上面代码中，每当执行proxy函数（直接调用或`call`和`apply`调用），就会被apply方法拦截。

另外，直接调用`Reflect.apply`方法，也会被拦截。   

`Reflect.apply(proxy, null, [9, 10]) // 38`   

### 4. has(target, propKey)  

has方法用来拦截HasProperty操作，即判断对象是否具有某个属性时，这个方法会生效。典型的操作就是`in`运算符。      

```javascript
var handler = {
  has (target, key) {
    if (key[0] === '_') {
      return false;
    }
    return key in target;
  }
};
var target = { _prop: 'foo', prop: 'foo' };
var proxy = new Proxy(target, handler);
'_prop' in proxy // false
```   

如果原对象不可配置或者禁止扩展，这时has拦截会报错。  

```javascript
var obj = { a: 10 };
Object.preventExtensions(obj);

var p = new Proxy(obj, {
  has: function(target, prop) {
    return false;
  }
});

'a' in p // TypeError is thrown
```  

上面代码中，obj对象禁止扩展，结果使用has拦截就会报错。也就是说，如果某个属性不可配置（或者目标对象不可扩展），则`has`方法就不得“隐藏”（即返回false）目标对象的该属性。   

另外，虽然`for...in`循环也用到了`in`运算符，但是`has`拦截对`for...in`循环不生效。  


### 5. construct(target, args)  

`construct`方法用于拦截`new`命令，下面是拦截对象的写法。  

```javascript
var handler = {
  construct (target, args, newTarget) {
    return new target(...args);
  }
};
```   

`construct`方法返回的必须是一个对象，否则会报错。  

### 6. deleteProperty(target, propKey)

`deleteProperty`方法用于拦截`delete`操作，如果这个方法抛出错误或者返回`false`，当前属性就无法被`delete`命令删除。   

```javascript
var handler = {
  deleteProperty (target, key) {
    invariant(key, 'delete');
    return true;
  }
};
function invariant (key, action) {
  if (key[0] === '_') {
    throw new Error(`Invalid attempt to ${action} private "${key}" property`);
  }
}

var target = { _prop: 'foo' };
var proxy = new Proxy(target, handler);
delete proxy._prop
// Error: Invalid attempt to delete private "_prop" property
```  

注意，目标对象自身的不可配置（configurable）的属性，不能被deleteProperty方法删除，否则报错。  

### 7. defineProperty(target, propKey, propDesc)

`defineProperty`方法拦截了`Object.defineProperty`操作。  

```javascript
var handler = {
  defineProperty (target, key, descriptor) {
    return false;
  }
};
var target = {};
var proxy = new Proxy(target, handler);
proxy.foo = 'bar'
// TypeError: proxy defineProperty handler returned false for property '"foo"'
```    

上面代码中，`defineProperty`方法返回`false`，导致添加新属性会抛出错误。

注意，如果目标对象不可扩展（extensible），则`defineProperty`不能增加目标对象上不存在的属性，否则会报错。另外，如果目标对象的某个属性不可写（writable）或不可配置（configurable），则defineProperty方法不得改变这两个设置。   

### 8. getOwnPropertyDescriptor(target, propKey)  

`getOwnPropertyDescriptor`方法拦截`Object.getOwnPropertyDescriptor()`，返回一个属性描述对象或者undefined。  

```javascript
var handler = {
  getOwnPropertyDescriptor (target, key) {
    if (key[0] === '_') {
      return;
    }
    return Object.getOwnPropertyDescriptor(target, key);
  }
};
var target = { _foo: 'bar', baz: 'tar' };
var proxy = new Proxy(target, handler);
Object.getOwnPropertyDescriptor(proxy, 'wat')
// undefined
Object.getOwnPropertyDescriptor(proxy, '_foo')
// undefined
Object.getOwnPropertyDescriptor(proxy, 'baz')
// { value: 'tar', writable: true, enumerable: true, configurable: true }
```    

### 9. getPrototypeOf(target)  

`getPrototypeOf`方法主要用来拦截获取对象原型。具体来说，拦截下面这些操作。  

+ `Object.prototype.__proto__`
+ `Object.prototype.isPrototypeOf()`
+ `Object.getPrototypeOf()`
+ `Reflect.getPrototypeOf()`
+ `instanceof`

注意，`getPrototypeOf`方法的返回值必须是对象或者null，否则报错。另外，如果目标对象不可扩展（extensible）， `getPrototypeOf`方法必须返回目标对象的原型对象。   

### 10. isExtensible(target)  

`isExtensible`方法拦截`Object.isExtensible`操作。  

```javascript
var p = new Proxy({}, {
  isExtensible: function(target) {
    console.log("called");
    return true;
  }
});

Object.isExtensible(p)
// "called"
// true
```  

注意，该方法只能返回布尔值，否则返回值会被自动转为布尔值。

这个方法有一个强限制，它的返回值必须与目标对象的isExtensible属性保持一致，否则就会抛出错误。  

### 11. ownKeys(target)

`ownKeys`方法用来拦截对象自身属性的读取操作。具体来说，拦截以下操作。  

+ `Object.getOwnPropertyNames()`
+ `Object.getOwnPropertySymbols()`
+ `Object.keys()`  

### 12. preventExtensions(target)  

`preventExtensions`方法拦截`Object.preventExtensions()`。该方法必须返回一个布尔值，否则会被自动转为布尔值。

这个方法有一个限制，只有目标对象不可扩展时（即`Object.isExtensible(proxy)`为false），`proxy.preventExtensions`才能返回true，否则会报错。  

### 13. setPrototypeOf(target, proto)  

setPrototypeOf方法主要用来拦截Object.setPrototypeOf方法。  

注意，该方法只能返回布尔值，否则会被自动转为布尔值。另外，如果目标对象不可扩展（extensible），setPrototypeOf方法不得改变目标对象的原型。   



## 13.2 Proxy.revocable()

`Proxy.revocable()` 方法返回一个可取消的 Proxy 实例。    

```js
let target = {};
let handler = {};

let {proxy, revoke} = Proxy.revocable(target, hanlder);

proxy.foo = 123;
proxy.foo;   // 123

revoke();
proxy.foo	// // TypeError: Revoked
```   

`Proxy.revocable` 方法返回一个对象，该对象的 `proxy` 属性是Proxy实例，`revoke` 属性是一个函数，
可以取消Proxy实例。上面代码中，当执行revoke函数之后，再访问Proxy实例，就会抛出一个错误。   
