# jQuery

标签（空格分隔）： 未分类

---



##  源码解析
```javascript
	// 45~63 行， 定义一些常用方法的简写名字

	// 71行，jQuery构造函数,这里不需要使用new操作符来生成jQuery实例，而是使用jQuery.prototype上init方法来实例对象，
	// 但是这时候在init方法中 this指向的是返回的实例对象，而这个实例对象并不是jQuery实例，这样的话实例对象就无法从jQuery的原
	// 上继承属性和方法
	jQuery = function(selector, context){
		return new jQuery.prototype.init(selector, context);
	}

	// 因此在2832和2942行有
	init = jQuery.fn.init = function(){/.../};
	init.prototype = jQuery.fn;
	// 其实效果就是 jQuery.fn.init.prototype = jQuery.fn;
	// 这样的话init方法中的this就是一个jQuery的实例了。

	// 91~173行，在jQuery.prototype定义了一些数组操作的方法，方便从jQuery对象返回DOM对象
jQuery.fn = jQuery.prototype = {

	jquery: version,

	constructor: jQuery,

	selector: "",

	length: 0,

	// 转换为DOM数组
	toArray: function() {
		return slice.call( this );
	},


	// 获取指定索引的DOM元素，或者返回整个数组
	get: function( num ) {
		return num != null ?

			( num < 0 ? this[ num + this.length ] : this[ num ] ) :

			slice.call( this );
	},

	// 将传入元素栈中，注意这个不同于add方法，这个并不是合并操作，推入后之前的实例对象保存在prevObject属性上。

	pushStack: function( elems ) {

		var ret = jQuery.merge( this.constructor(), elems );

		ret.prevObject = this;
		ret.context = this.context;

		return ret;
	},

	each: function( callback ) {
		return jQuery.each( this, callback );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map( this, function( elem, i ) {
			return callback.call( elem, i, elem );
		} ) );
	},

	// 这里slice方法用pushStack将DOM元素转换成jQuery对象
	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
	},

	// 返回之前栈中的实例对象，如果没有的话就是空jQuery对象
	end: function() {
		return this.prevObject || this.constructor();
	},

	push: push,
	sort: arr.sort,
	splice: arr.splice
};

```

# 全局Ajax事件处理器
---

### Ajax事件

Ajax事件分为两种类型：局部事件和全局事件。  

+ 局部事件可以注册在一个请求对象上。
+ 全局事件由 `document` 对象触发。全局事件可以被某个设置了 `global` 选项为 `false` 的请求拒绝触发。 全局事件也不会被跨域脚本请求或者 JSONP 请求触发。

ajaxStart 和 ajaxStop 事件是和所有 Ajax 请求相关的事件。其他事件则会在每个 Ajax 请求上触发（除非设置了 `global` 选项）。  

  + **ajaxStart**: 当有 Ajax 请求发出且没有其他在处理中的请求。
    + **beforeSend**(局部事件): 在请求发出前触发，允许你修改 XHR 对象。  
    + **ajaxSend**: 在请求发出前触发的全局事件。  
    + **success**(局部事件): 只有当请求成功时触发。  
    + **ajaxSuccess**: 请求成功时的全局事件。  
    + **error**(局部事件): 当请求出错时触发（success 和 error 只能出现一种可能）。  
    + **ajaxError**: 请求出错时的全局事件。  
    + **complete**(局部事件): 请求完成时事件，不过是成功还是出错了。
    + **ajaxComplete**: 。。。
  + **ajaxStop**: 当没有请求要被处理时触发。  



### .ajaxStart()

**.ajaxStart(handler)**  

**handler**: Function()  


### .ajaxSend()

**.ajaxSend( handler )**

**handler**: Function(Event *event*, jqXHR *jqXHR*, PlainObject *ajaxOptions*)

### .ajaxSuccess()

**.ajaxSuccess( handler )**

**handler**: Function(Event *event*, jqXHR *jqXHR*, PlainObject *ajaxOptions*, PlainObject *data*)

### .ajaxError()

**.ajaxError( handler )**

**handler**: Function(Event *event*, jqXHR *jqXHR*, PlainObject *ajaxSettings*, String *thrownError*) thrownError 就是 HTTP 请求中的原因短语，即 xhr.statusText.

### .ajaxComplete()

**.ajaxComplete( handler )**

**handler**: Function(Event *event*, jqXHR *jqXHR*, PlainObject *ajaxOptions*)

### .ajaxStop()

**.ajaxStop( handler )**

**handler**: Function()  




# 助手函数
---

### jQuery.param()

将数组，对象或者 jQuery 对象序列化成字符串，方便 URL 查询字符串或者 Ajax 请求。

**jQuery.param( obj, [traditional] )**:   Return: String  

+ **obj**: Array, PlainObject, jQuery
+ **traditional**: Boolean 表明是否执行传统的“浅”序列化。  默认为 `false`。

如果要传递一个数组，必须是一个对象数组，格式要和 `serializeArray()` 返回格式一样。

### .serialize()

将表单元素编译成用于提交的字符串。  

**.serialize()**:  Return: String.

创建一个标准的 URL-encoded 的字符串。可以直接在 `form` 元素上调用，也可以在具体的表单控件集合上调用。

表单控件必须有 `name` 属性才会被序列化， checkboxs 和 radios 必须选中才行， 文件控件不会被序列化。


### .serializeArray()

将表单元素集合编码成一个名值对的对象数组。

**.serializeArray()**:  Return: Array






# 底层接口
---

### jQuery.ajax()

**jQuery.ajax( url [,settings])** 或者  **jQuery.ajax([settings])**:  Return: jqXHR

**url**: String  

**settings**: PlainObject

  + **accept**(默认取决于 `DataType`): PlainObject.
