# 14. Porxy和Reflect


```
 1. Proxy
 2. Object.assign()
 3. Object.getOwnPropertyDescriptor()
 4. Object.setPrototypeOf()   Object.getPrototypeOf()
```


## 1.Proxy  

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
