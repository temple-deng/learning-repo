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




