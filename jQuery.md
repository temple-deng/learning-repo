# jQuery

标签（空格分隔）： 未分类

---

1. $();
```javascript
    可以传递一个jQuery对象进去，这个对象的一个克隆对象将被创建。这个新的jQuery对象引用同一DOM元素。所以意味着两者指向同一个对象。
```

2. .each( function(index, Element) )
这个方法和forEach()显著的区别是如果回调函数在任一元素上返回false，遍历将在该元素后终止。  



##  源码解析
---

### 实例继承的方法
93~178行
```javascript
    jQuery.fn = jQuery.prototype = {

        jquery: version,

        constructor: jQuery,

        selector: "",

        length: 0,

        toArray: function() {
            return slice.call( this );             //等价于 [].slice.call(this), 将jQuery实例类数组对象转换为数组呗
        },

        //jQuery对象实例的get方法，获取到DOM元素
        get: function( num ) {
                    //注意这里用的并不是严格不等符， 所以这里不传参数默认是undefined，undefind == null，所以这里如果不传参，走的是slice.call(this)
            return num != null ?

                //根据 this[ num ]来看，jQuery函数返回的jQuery对象中的可以用数字索引， 而且还接受负数
                ( num < 0 ? this[ num + this.length ] : this[ num ] ) :

                slice.call( this );
        },

        // Take an array of elements and push it onto the stack
        // (returning the new matched element set)
        pushStack: function( elems ) {

            // Build a new jQuery matched element set
            var ret = jQuery.merge( this.constructor(), elems );

            // Add the old object onto the stack (as a reference)
            ret.prevObject = this;
            ret.context = this.context;

            // Return the newly-formed element set
            return ret;
        },

        // Execute a callback for every element in the matched set.
        each: function( callback ) {
            return jQuery.each( this, callback );
        },

        map: function( callback ) {
            return this.pushStack( jQuery.map( this, function( elem, i ) {
                return callback.call( elem, i, elem );
            } ) );
        },

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

        end: function() {
            return this.prevObject || this.constructor();
        },

        // For internal use only.
        // Behaves like an Array's method, not like a jQuery method.
        push: push,
        sort: arr.sort,
        splice: arr.splice
    };
```
类数组对象转为数组  [].slice.call(this);  
如何使数组的方法接受负数索引 this[ num + this.length]



