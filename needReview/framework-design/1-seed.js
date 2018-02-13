// 第一版，并没有考虑保留原属性就是对象或数组情况下的追加，而是直接替换
function extend() {
  var option, src, copy, clone, target,
    i = 1,
    length = arguments.length,
    target = arguments[0] || {},
    deep = false;

    // 这里其实感觉是有点问题，当显示传入 false 执行钱复制时，最终返回的对象
    // 其实不是最初的 target 对象了
    if(typeof target === 'boolean') {
      deep = target;
      target = arguments[i];
      i++;
    }

    // target 必须为对象类型
    if(!(target instanceof Object)) {
      target = {};
    }

    // 遍历每一个待拷贝进去的 source
    for(; i < length; i++) {

      // 跳过 null 和 undefined 的问题
      if(arguments[i] != null) {
        option = arguments[i];
        for(let key in option) {
          src = target[key];
          copy = option[key];

          // 循环引用的问题，这里暂时有个问题，continue 最终是跳出到哪了
          if(target === copy) {
            continue;
          }

          // 如果属性是对象
          if(deep && copy instanceof Object) {
            // 如果是特殊对象-数组
            if(Array.isArray(copy)) {
              target[key] = extend(deep, [], copy);
            } else {
              target[key] = extend(deep, target[key], copy);
            }
          } else {  // 浅复制或者属性是基本类型
            if(copy != null) {
              target[key] = copy;
            }
          }
        }
      }
    }

    return target;
}

var a = {};
var b = {
  c: 1,
  d: [1, 2, 3]
};

var c = extend(false, a, b);
console.log( c.d === b.d);
console.log(a)


// 第二版，尝试加入 jQuery 中追加属性的特性

function extend1() {
  var option, name, clone, copy, src,
    i = 1,
    deep = false,
    target = arguments[0] || {},
    length = arguments.length;

  if (typeof target === 'boolean') {
    deep = target;
    target = arguments[i];
    i++;
  }

  if (!(target instanceof Object)) {
    target = {}
  }

  for (; i < length; i++) {
    if (arguments[i] != null) {
      option = arguments[i];

      for (let key in option) {
        src = target[key];
        copy = option[key];

        if (target === copy) {
          continue;
        }

        if (deep && copy instanceof Object) {
          if (Array.isArray(copy)) {
            clone = Array.isArray(src) ? src : [];
          } else {
            clone = src instanceof Object ? src : {}
          }

          // 我觉得这里借用 clone 而不是直接 extend target[key] 是为了让属性拷贝后
          // 与源属性类型一致，而不是数组拷贝成对象等情况
          target[key] = extend1(deep, clone, copy);
        } else {
          if (copy != null) {
            target[key] = copy;
          }
        }
      }
    }
  }

  return target;
}


// 下面的是 jQuery 的实现

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[ 0 ] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// Skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction( target ) ) {
		target = {};
	}

	// Extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {

		// Only deal with non-null/undefined values
		if ( ( options = arguments[ i ] ) != null ) {

			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
					( copyIsArray = Array.isArray( copy ) ) ) ) {

					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && Array.isArray( src ) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject( src ) ? src : {};
					}

					// Never move original objects, clone them, but why ?
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};



function extend2() {
  var options, src, copy, clone,
    target = arguments[0] || {},
    i = 1,
    deep = false,
    length = arguments.length;

    if(typeof deep === 'boolean') {
      deep = target;
      target = arguments[i];
      i++;
    }

    if(!(target instanceof Object)) {
      target = {}
    }

    for(; i < length; i++) {
      if( (options = arguments[i]) != null) {
        for(let key in options) {
          src = target[key];
          copy = options[key];

          if(target === copy) {
            continue;
          }

          if(deep && copy instanceof Object) {
            if(Array.isArray(copy)){
              clone = Array.isArray(src) ? src : [];
            } else {
              clone = src instanceof Object ? src : {};
            }
            target[key] = extend(deep, clone, copy)
          } else {
            if(copy !== undefined) {
              target[key] = copy;
            }
          }
        }
      }
    }

  return target;
}