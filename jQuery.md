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

## Ajax

### Ajax event 
Ajax event 分为两种类型： local enents, global events.  

**Local Events**: 绑定在每个 Ajax 请求上或请求对象中的事件处理回调函数。  

```javascript
 $.ajax({
   beforeSend: function(){
     // Handle the beforeSend event
   },
   complete: function(){
     // Handle the complete event
   }
   // ......
 });
```  

**Global Events**: 在 document 对象上绑定并触发的事件。每个 Ajax 请求都可能触发全局的 Ajax 事件处理函数。  

```javascript
 $(document).bind("ajaxSend", function(){
   $("#loading").show();
 }).bind("ajaxComplete", function(){
   $("#loading").hide();
 });
```  

#### 事件列表  
除了 ajaxStart 和 ajaxStop 事件，其他的事件在每个 ajax 请求上都有可能触发。  

+ **ajaxStart**(Global): 当一个 ajax 请求触发，并且没有任何其他的 ajax 请求在运行中。  
+ **beforeSend**(Local)
+ **ajaxSend**(Global)  
+ **success**(Local)  
+ **ajaxSuccess**(Global)
+ **error**(Local)
+ **ajaxError**(Global)
+ **complete**(Local)
+ **ajaxComplete**(Global)
+ **ajaxStop**(Global): 当没有任何 ajax 请求在处理中时触发。  


### Ajax全局事件

ajax全局事件会在页面中每个 ajax 请求发生时依次触发，除非在 `$.ajaxSetup` 函数中设置 `global` 属性为 `false`(默认为`true`)或者在 ajax 请求中的请求对象中设置 `global` 属性为`false`。 注意全局事件不会由跨域脚本或 JSONP 请求触发。并且所有的 ajax 全局事件都是绑定在 document 事件。  

+ **.ajaxComplete( handler )**  
  handler: Function( Event event, jqXHR jqXHR, PlainObject ajaxOptions )  

+ **.ajaxError( handler )**  
  handler: Function( Event event, jqXHR jqXHR, PlainObject ajaxSettings, String thrownError )   最后一个参数应该是 HTTP 请求中的状态短语，应该就是 xhr.statusText  

+ **.ajaxSend( handler )**  
  handler: Function( Event event, jqXHR jqXHR, PlainObject ajaxOptions )  
  这个事件应该是和 beforeSend 事件对应，也是咋请求还没有发出时触发  

+ **.ajaxStart( handler )**  
  handler: Function()  
  当一个 ajax 准备 send 时，如果没有其他的 ajax 请求在处理中触发。  

+ **.ajaxStop( handler )**  
  handler: Function()  
  无论何时有 ajax 请求结束时，都会检查是否还有 ajax 请求存在，如果没有就触发。  

+ **.ajaxSuccess( handler )**  
  handler:  Function( Event event, jqXHR jqXHR, PlainObject ajaxOptions, PlainObject data )  


### 底层接口

#### $.ajax()
`jQuery.ajax( url [, settings ] )` 或者 `jQuery.ajax( [settings ] )`  

return： jqXHR  

settings 所有选项都是可选的，默认设置是 `$.ajaxSetup` 中设置的。  

+ **accepts**(PlainObject，默认值取决于 dataType属性): 期望接受的MIME类型。  
+ **async**(Boolean, true)  
+ **beforeSend**(Function( jqXHR jqXHR, PlainObject settings)): 在请求发出前的回调函数，用来修改jqXHR对象，修改请求头等，函数返回 false 意味着取消这次请求。
+ **cache**(Boolean, true, false for dataType 'script' and 'jsonp'):只有GET和HEAD请求时，将cache设为false才有用，做法是在请求URL中添加一个时间戳的查询参数。
+ **complete**(Function( jqXHR jqXHR, String textStatus )): 第二个参数指明了请求的状态("success", "notmodified", "nocontent", "error", "timeout", "abort", or "parsererror"), 1.5以上接受一个函数数组，依次调用。  
。。。。。  

返回的 jqXHR 实现了以下的 Promise 接口：
+ jqXHR.done(function(data, textStatus, jqXHR) {}) 
+ jqXHR.fail(function(jqXHR, textStatus, errorThrown) {})
+ jqXHR.always(function( data|jqXHR, textStatus, jqXHR|errorThrown ) { }) : 参数视情况而定，如果是 `success`就和 `done` 方法一致， 否则就和 `fail`方法参数一致。
+ jqXHR.then(function( data, textStatus, jqXHR ) {}, function( jqXHR, textStatus, errorThrown ) {}): `done`方法和`fail`方法的组合咯。  

回调函数中的 this 对象均是 settings 中的 `context`，如果没设置 `context`对象那就是 settings 本身。


