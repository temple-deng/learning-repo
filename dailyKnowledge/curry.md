# 柯里化

```js
function add () {
  var args = [].slice.call(arguments);

  var adder = function() {
    args = args.concat([].slice.call(arguments));
    return sumer;
  }

  adder.valueOf = function() {
    return args.reduce((a, b) => {
      return a+b;
    }, 0);
  }

  adder.toString = adder.valueOf;

  return adder;
}
```    

