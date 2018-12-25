# 柯里化

```js
function add() {
  var args = [].slice.call(arguments);
  
  function adder() {
    args = args.concat([].slice.call(arguments));
    return adder;
  }

  adder.valueOf = function() {
    return args.reduce((a, b) => a+b);
  }

  adder.toString = adder.valueOf;

  return adder;
}
```    

