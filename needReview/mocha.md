# mocha

用 `describe` 包起来的可以叫测试套件，用 `it()` 包起来的叫测试用例。   

## 异步代码

一种方式是 `it()` 函数参数接受一个回调函数做参数，另一种是返回 promise。或者直接用 async/await 。     

## 箭头函数

不推荐在 Mocha 中使用箭头函数，主要是在 `it('my test', () => { ... })` 使用箭头函数，会导致访问不到 Mocha 上下文。    

当然，如果我们不适用 Mocha 上下文的话就可以使用箭头函数。    

## 钩子

如果是默认的 BDD 风格的接口，Mocha 提供了 `before(), after(), beforeEach(), afterEach()` 钩子。这些钩子可以用来设置一些前置条件和处理一些清扫工作。    

```js
describe('hooks', function() {

  before(function() {
    // runs before all tests in this block
  });

  after(function() {
    // runs after all tests in this block
  });

  beforeEach(function() {
    // runs before each test in this block
  });

  afterEach(function() {
    // runs after each test in this block
  });

  // test cases
});
```    

### 带描述信息的钩子

所有的钩子都可以使用一个可选的描述来进行调用。如果传递是一个命名函数，那么在没有描述的情况下，函数名就是描述。    

```js
beforeEach('some description', function() {
  // beforeEach:some description
});
```    

### 异步钩子

所有的钩子即可以是同步的也可以是异步的。与测试用例类似。       

### 根级钩子

可以在所有 `describe` 外加根级的钩子。   

### 延迟测试的执行

如果我们希望在任何测试运行前执行一些异步操作，可以延迟测试的执行，在运行 `mocha` 时添加 `--delay` 选项。这个选项可以为测试在全局范围附加一个 `run()` 回调函数：    

```js
setTimeout(function() {
  // do some setup

  describe('my suite', function() {
    // ...
  });

  run();
}, 5000);
```    

貌似不用 `run()` 的话测试不会运行。    

## 待完成测试

待完成的测试意味着我们之后会补全测试的代码，这种情况下测试用例不带有回调函数：    

```js
describe('Array', function() {
  describe('#indexOf()', function() {
    // pending test below
    it('should return -1 when the value is not present');
  });
});
```    

## 独立的测试

这个功能可以让我们在测试时只运行指定的套件或用例，只要在函数后缀一个 `.only()` 即可。    

```js
describe('Array', function() {
  describe.only('#indexOf()', function() {
    // ...
  });
});


describe('Array', function() {
  describe('#indexOf()', function() {
    it.only('should return -1 unless present', function() {
      // ...
    });

    it('should return the index when present', function() {
      // ...
    });
  });
});
```  

这个应该是在某些时候我们只想运行一个测试的子集的时候使用。    

## INCLUSIVE TESTS

这个功能是与 `.only()` 相反的。通过后缀一个 `.skip()`，可以告诉 Mocha 去忽略掉一些测试套件和测试用例。    

```js
describe('Array', function() {
  describe.skip('#indexOf()', function() {
    // ...
  });
});
```   

甚至可以在运行时代码中使用 `this.skip()` 跳过，比如说测试需要一些特定的环境但是目前不符合，就可以跳过这个测试。    

```js
it('should only test in the correct environment', function() {
  if (/* check test environment */) {
    // make assertions
  } else {
    this.skip();
  }
});
```   

还可以在 `before` 钩子中使用 `this.skip()` 来跳过多个测试。   

```js
before(function() {
  if (/* check test environment */) {
    // setup code
  } else {
    this.skip();
  }
});
```    

## RETRY TESTS

好像是可以选择去将失败的用例测试多次。不推荐在单元测试中使用这个功能。    

这个功能会重新执行 `beforeEach/afterEach` 钩子，但不会执行 `before/after` 钩子。    

## DYNAMICALLY GENERATING TESTS（动态生成测试？）

说实话没看懂。    

## 测试持续时间

```js
describe('something slow', function() {
  this.slow(10000);

  it('should take long enough for me to go make a sandwich', function() {
    // ...
  });
});
```   

别问我，我也不是特别清楚什么意思，感觉像是阻塞10s。    

## 超时

### 套件级别

应该是指定一个时间把，在一定时间段内测试没完成就触发超时行为。    

套件级别的超时可以应用在整个测试套件上，或者使用`this.timeout(0)` 禁止超时行为。这些值会被那些没有覆盖这个值的嵌套的测试套件和用例所继承。    

```js
describe('a suite of tests', function() {
  this.timeout(500);

  it('should take less than 500ms', function(done){
    setTimeout(done, 300);
  });

  it('should take less than 500ms as well', function(done){
    setTimeout(done, 250);
  });
})
```   

奇怪的是上面这个例子没报超时啊，难道套件级别的超时只是为用例继承的么。（不对，应该是指每个测试用例都不得超过500ms）     

### 用例级别

略。    

### 钩子级别

```js
describe('a suite of tests', function() {
  beforeEach(function(done) {
    this.timeout(3000); // A very long environment setup.
    setTimeout(done, 2500);
  });
});
```     

## Diffs

Mocha 支持任意断言库抛出的 `err.expected` 和 `err.actual` 属性。Mocha 会尝试着展示出两者的不同。     

## 接口

Mocha 接口系统可以让我们选择 DSL。Mocha 有 BDD，TDD，Exports，QUnit和 Require风格的接口。       

### BDD

BDD 接口提供了 `describe(), context(), it(), specify(), before(), after(), beforeEach(), afterEach()`。     

`context()` 就是 `describe()` 的别名。`specify()` 是 `it()` 的别名。    

### TDD

TDD 接口提供了 `suite(), test(), suiteSetup(), suiteTeardown(), setup(), teardown()`。    

```js
suite('Array', function() {
  setup(function() {
    // ...
  });

  suite('#indexOf()', function() {
    test('should return -1 when not present', function() {
      assert.equal(-1, [1,2,3].indexOf(4));
    });
  });
});
```    
其他的3种就不说了。    

## 报告器

报告器有 spec, dot, nyan, test, landing, list, progress, json, min, doc, markdown, html。     

## CLI

用法：`mocha [debug] [options] [files]`    

子命令：`init <path> 在path 位置初始化一个 mocha` 。     

几个有用的选项：   

+ -R, --reporter &lt;name&gt;     指定使用的 reporter
+ -O, --reporter-options &lt;k=v, k2=v2,...&gt; 特定的 reporter 的选项
+ -b, --bail                      bail after first test failure
+ -g, --grep &lt;pattern&gt;     只运行匹配的测试
+ -f, --fgrep &lt;string&gt;     只运行包含字符串的测试
+ -s, --slow &lt;ms&gt;          减慢测试的阈值
+ -t, --timeout &lt;ms&gt;       设置超时值
+ -u, --ui &lt;name&gt;       指定用户接口(bdd|tdd|qunit|exports)
+ -w, --watch                 监听文件
+ --exit / --no-exit        