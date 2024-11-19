# chai 断言库

## 安装

`npm install chai`      

## 断言的风格

### Assert

assert 风格是通过暴露的 `assert` 接口使用的。    

```js
var assert = require('chai').assert
  , foo = 'bar'
  , beverages = { tea: [ 'chai', 'matcha', 'oolong' ] };

assert.typeOf(foo, 'string'); // without optional message
assert.typeOf(foo, 'string', 'foo is a string'); // with optional message
assert.equal(foo, 'bar', 'foo equal `bar`');
assert.lengthOf(foo, 3, 'foo`s value has a length of 3');
assert.lengthOf(beverages.tea, 3, 'beverages has 3 types of tea');
```    

在所有的例子中，assert 风格都允许我们在 `assert` 声明的最后一个参数上传入一条可选的信息。当断言不通过的时候会显示这些信息。    

### BDD

BDD 风格有两种用法：`expect` 和 `should`。两种都使用了链式的语法来构建断言。两者在初始化构造断言时有些许不同，`should` 风格还有一些需要注意的陷阱，不过有一些工具可以帮助我们消除这些陷阱。        

#### expect

```js
var expect = require('chai').expect
  , foo = 'bar'
  , beverages = { tea: [ 'chai', 'matcha', 'oolong' ] };

expect(foo).to.be.a('string');
expect(foo).to.equal('bar');
expect(foo).to.have.lengthOf(3);
expect(beverages).to.have.property('tea').with.lengthOf(3);
```    

expect 也允许我们添加任意的失败信息：     

```js
var answer = 43;

// AssertionError: expected 43 to equal 42.
expect(answer).to.equal(42);

// AssertionError: topic [answer]: expected 43 to equal 42.
expect(answer, 'topic [answer]').to.equal(42);
```    

#### should

```js
var should = require('chai').should() //actually call the function
  , foo = 'bar'
  , beverages = { tea: [ 'chai', 'matcha', 'oolong' ] };

foo.should.be.a('string');
foo.should.equal('bar');
foo.should.have.lengthOf(3);
beverages.should.have.property('tea').with.lengthOf(3);
```   

`should` 是直接扩展了`Object.prototype` 对象。所以会有一些不适用的场景。这些陷阱就先略过了，需要时看文档。          

## 配置

+ config.includeStack:boolean, 默认 false
+ config.showDiff: bool, 默认 true
+ config.truncateThreshold: number, 默认40

## Assert 风格的 API

+ `assert(expression, message)`
  - _Mixed_ expression 检测的表达式
  - _String_ message 在错误中展示的信息
+ `.fail(actual, expected, [message], [operator])`：抛出一个错误
  - _Mixed_ actual
  - _Mixed_ expected
  - _String_ message
  - _String_ operator
+ `.isOk(object, [message])` 断言 `object` 是真值
  - _Mixed_ object
  - _String_ message
+ `.isNotOk(object, [message])` 断言为假值咯
+ `.equal(actual, expected, [message])` 使用非严格相等符(==)断言
+ `.notEqual(actual, expected, [message])` 使用非严格不等符
+ `.strictEqual(actual, expected, [message])` 使用严格相等符咯
+ `.notStrictEqual(actual, expected, [message])`
+ `.deepEqual(actual, expected, [message])` 
  - `assert.deepEqual({ tea: 'green' }, { tea: 'green' });`
+ `.notDeepEqual(actual, expected, [message])`
  - `assert.notDeepEqual({ tea: 'green' }, { tea: 'jasmine' });`
+ `.isAbove(valueTocheck, valueToBeAbove, [message])` 断言 `valueToCheck` 严格大于(>)`valueToBeAbove`
+ `isAtLeast(valueTocheck, valueToBeAbove, [message])` 断言 `valueToCheck` 大于等于(>=)`valueToBeAbove`
+ `isBelow(valueTocheck, valueToBeAbove, [message])` 断言 `valueToCheck` 严格小于(<)`valueToBeAbove`
+ `isAtMost(valueTocheck, valueToBeAbove, [message])` 断言 `valueToCheck` 小于等于(<=)`valueToBeAbove`
+ `.isTrue(value, [message])` 断言 value 为 true，应该就是严格的为布尔true
+ `.isNotTrue(value, [message])`
+ `.isFalse(value, [message])`
+ `.isNotFalse(value, [message])`
+ `.isNull(value, [message])` 必须是null，undefined 都不行
+ `.isNotNull(value, [message])`
+ `.isNaN(value, [message])`
+ `.isNotNaN(value, [message])`
+ `.exists(value, [message])` 后面的一致的参数就不写了，断言 value 不是 null 也不是 undefined
+ `.notExists()`
+ `.isUndefined`
+ `.isDefined`
+ `.isFunction`
+ `.isNotFunction`
+ `.isObject` 断言是对象类型，貌似是用 `Object.prototype.toString` 断定的，所有子类可能都不匹配
+ `.isNotObject`
+ `.isArray`
+ `.isNotArray`
+ `.isString`
+ `.isNotString`
+ `.isNumber`
+ `.isNotNumber`
+ `.isFinite` NaN 也不能通过断言
+ `.isBoolean`
+ `.isNotBoolean`
+ `.typeOf(value, name, [message])` 断言 value 是 namee 类型的，这个类型是由 `Object.prototype.toString` 决定的`
+ `.notTypeOf`
+ `.instanceOf(object, constructor, [message])`
+ `.notInstanceOf(object, constructor, [message])`
+ `.include(haystack, needle, [message])` 断言 `haystack` 包括 `needle`，可以用来检测数组原始，子串，对象属性的子集，使用严格相等符判断，不过对象的情况下貌似是判断对象子集
+ `.notInclude()`
+ `.deepInclude()`, `.notDeepInclude()`
+ `.nestedInclude()`, `notNestedInclude()`
+ `.deepNestedInclude()`, `notDeepNestedInclude()`
+ `.ownInclude()`, `notOwnInclude()`
+ `.deepOwnInclude()`, `notDeepOwnInclude()`
+ `.match(value, regexp)`, `.notMatch()`
+ `.property(object, property)`, `.notProperty()`
  - property: string
+ `propertyVal(object, property, val)`, `notPropertyVal()`
+ `deepPropertyVal(object, property, value)`, `notDeepPropertyVal()`
+ `nestedProperty(object, property)`, `notNestedProperty()`
+ `nestedPropertyVal(obj, prop, value)`, `notNestedPropertyVal()`
+ `deepNestedPropertyVal(obj, prop, val)`, `notDeepNestedPropertyVal()`    
+ `lengthOf(obj, length)`
+ `hasAnyKeys(obj, [keys])`, `doesNotHaveAnyKeys()`
+ `hasAllKeys(obj, [keys])`, `doesNotHaveAllKeys()`
+ `containsAllKeys(obj, [keys])`
+ `hasAnyDeepKeys(obj, [keys])`, `doesNotHaveAnyDeepKeys()`
+ `hasAllDeepKeys(obj, [keys])`, `doesNotHaveAllDeepKeys()`
+ `containsAllDeepKeys(object, [keys])`
+ `throw(fn, [errorLike/string/regexp], [string/regexp])`, `doesNotThrow()`
+ `operator(v1, operator, v2)`
+ `closeTo(actual, expected, delta)`
+ `approximately(actual, expected, delta)`
+ `sameMembers(set1, set2)`, `notSameMembers()`
+ `sameDeepMembers(set1, set2)`, `notSameDeepMembers(set1, set2)`
+ `sameOrderedMembers(set1, set2)`, `notSameOrderedMembers()`
+ `sameDeepOrderedMembers(set1, set2)`, `notSameDeepOrderedMembers()`
+ `includeMembers(superset, subset)`, `notIncludeMembers()`
+ `includeDeepMembers(superset, subset)`, `notIncludeDeepMembers()`
+ `includeOrderedMembers(superset, subset)`, `not`
+ `includeDeepOrderedMembers(superset, subset)`, `not`
+ `oneOf(inList, list)`
+ `changes(function, object, property)`, `doesNot`
+ `changesBy(function, object, property, delta)`, `changesButNotBy`
+ `increases(function, object, property)`, `doesNot`
+ `increasesBy(fn, obj, prop, delta)`, `increasesButNotBy`
+ `decreases(fn, obj, prop)`, `doesNot`
+ `decreasesBy(fn, obj, prop, delta)`, `doesNotDecreaseBy()`
+ `decreasesButNotBy(fn, obj, prop, delta)`
+ `ifError(object)`
+ `isExtensible(object)`, `isNot`
+ `isSealed(obj)`, `isNot`
+ `isFrozen(obj)`, `isNot`
+ `isEmpty(obj)`, `isNot`


## Expect/Should 风格 API

下面的内容是为了提高断言可读性的一些链式连接词。    

+ to
+ be
+ been
+ is
+ that
+ which
+ and
+ has
+ have
+ with
+ at
+ of
+ same
+ but
+ does
