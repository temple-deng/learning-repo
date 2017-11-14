# Sinon

## 一个简单的例子

下面的函数会接收一个函数做参数并返回一个新函数。我们可以调用最终返回的函数任意多次，但是最初传入的函数只调用一次：    

```js
function once(fn) {
  var returnValue, called = false;
  return function () {
    if (!called) {
      called = true;
      returnValue fn.apply(this, arguments);
    }
    return returnValue;
  }
}
```     

### 监视 Spies

我们现在可以使用 `spy()` 来测试一下这个传入的函数就真的只被调用一次。    

```js
it('calls the original function', function() {
  var callback = sinon.spy();
  var proxy = once(callback);

  proxy();

  assert.isTrue(callback.called);
});
```   

上面的例子只展示了函数被调用了，下面的例子展示了只调用一次的事实：    

```js
it('calls original function with right this and args', function () {
  var callback = sinon.spy();
  var proxy = once(callback);
  var obj = {};

  proxy.call(obj, 1, 2, 3);
  assert.isTrue(callback.calledOn(obj));
  assert.isTrue(callback.calledWith(1, 2, 3));
});
```   

### 存根（保存的证据） Stubs

