# Enzyme

写文档时 enzyme 的版本为 3.1.0, react 为 16.0.0。     

## 介绍

### 安装

安装 `enzyme` 的时候还要装一个对应我们当前 react 版本的适配器 Adapter，比如说我们现在 react 为16，则：    

`npm install --save-dev enzyme enzyme-adapter-react-16`    

之后呢我们还需要配置 enzyme 使用我们安装的适配器：    

```js
import Enzyme from 'enzyme';
import Adapter from `enzyme-adapter-react-16`;

Enzyme.configure({ adapter: new Adapter() });
```    

## Using enzyme with JSDOM

JSDOM 是一个基于 JS 的无头浏览器，可用于创建一个逼真的测试环境。     

因为 enzyme 的 `mount` API 要求一个 DOM 的存在，因此当我们在非浏览器环境中跑测试的时候要先包含这个模块。   

推荐在第一次加载 React 前就在全局作用域内加载一个 document 对象，推荐在任何的 React 代码运行前先执行以下的脚本：    

```js
const { JSDOM } = require('jsdom');

const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const { window } = jsdom;

function copyProps(src, target) {
  const props = Object.getOwnPropertyNames(src)
    .filter(prop => typeof target[prop] === 'undefined')
    .map(prop => Object.getOwnPropertyDescriptor(src, prop));
  Object.defineProperties(target, props);
}

global.window = window;
global.document = window.document;
global.navigator = {
  userAgent: 'node.js',
};
copyProps(window, global);
```     

_注意以下埋的坑：_ 首先 `enzyme-adapter-react-16` 需要 `react,  react-dom, react-test-renderer` 3个包，
得自己安装，其次测试的时候需要用 `babel` 要 JSX 转换为 JS 的，推荐在使用 mocha 的时候这样调用 `mocha --require babel-register test.js` 或者 `mocha --compilers js:babel-register test.js` 同理，babel-register 也的自己装。   

## Shallow API

#### `shallow(node[, options]) => ShallowWrapper`    

**参数：**    

1. `node` (`ReactElement`)：要渲染的节点
2. `options` (`Object` 可选)
  - `context` (`Object`)：要传递给组件的上下午，可能是 React 的那个 context
  - `disableLifecycleMethods` (`bool`)：如果设为 true, `componentDidMount` 不会被调用,并且在 `setProps` 和 `setContext` 之后也不会调用 `componentDidUpdate`，默认为 `false`
  - `lifecycleExperimental` (`bool`)：如果设为 true，整个组件声明周期方法都会被调用，默认为 true。但是貌似也还是只有上面提到这两个方法。    

下面的 API 都是返回的这个 `ShallowWrapper` 实例上的方法了。    

需要注意以下 wrapper 中的节点和渲染树的区别，节点是指第一层节点，渲染树的话还包含子节点。   

#### `.find(selector) => ShallowWrapper`    

寻找渲染树中与提供的选择器匹配的每个节点。    

注意返回的对象只是一个含有 `length` 属性的普通对象，也就是说也只能测试以下匹配节点的数量。     

1. `selector` (`EnzymeSelector`)     

#### `.findWhere(fn) => ShallowWrapper`    

寻找渲染树中可以让提供的断言返回 true 的节点，类似数组的 `filter` 方法。   

估计和上面的差不多，应该也只是测试以下数量。     

1. `predicate` ( `ShallowWrapper => Boolean` )   

#### `.filter(selector) => ShallowWrapper`   

返回一个新的包装实例，这个实例只包含当前 wrapper 中与选择器匹配的实例。      

#### `.filterWhere(predicate) => ShallowWrapper`    

略。    

#### `hostNodes() => ShallowWrapper`    

看样子是从节点中过滤出非 HTML 元素的节点，也就是说组件节点都会被移除把。    

#### `.contains(nodeOrNodes) => Boolean`    

貌似是检查渲染树是否包含指定的 ReactElement 或 ReactElements。好像是通过检查是否有相同的 props 检查的。    

+ `nodeOrNodes` (`ReactElement`|`Array<ReactElement>`)    

```js
  const comp = shallow(<MyComponent />);

  test('it should contain Foo Component', function() {
    assert.isTrue(comp.contains(<Foo />));
  });
```    

#### `.containsMatchingElement(node) => Boolean`     

貌似要比 `contains` 要求更严格一点，好像所有的 `props` 必须匹配，比如说现在 wrapper 上的元素
比提供的 node 多了一个 prop 都不会匹配住。     

#### `.containsAllMatchingElements(nodes) => Boolean`

目前看是 `containsMatchingElement()` 的数组版本。     

#### `.containsAnyMatchingElements(nodes) => Boolean`    

看样子是有一个匹配的就可以了。    

#### `.equals(node) => Boolean`

这个需要注意一下，判断当前实例的渲染树是否与传入的节点一致。注意应该是完全一致，从父节点的 props 到
子节点 props。         

#### `.matchesElement(node)  => Boolean`

这个的话是看一下实例的根节点是否与提供的节点一致，测试的结果来看，不光是根节点，也包含第一层子节点，
不过需要注意的是会比较根节点上的 props 但不会比较子节点的 props。    

#### `.hasClass(class) => Boolean`   

判断当前节点是否包含类名，不过需要注意的是只能在单一节点上调用，而不是在整个渲染树中查找。    

只接受单一类名。       

#### `.is(selector) => Boolean`    

当前节点是否能与选择器匹配咯，估计也是只能在单一节点上调用。    

#### `.exists() => Boolean`

判断当前节点是否是存在的。     

#### `.isEmptyRender()  => Boolean`

判断以下是否当前组件是返回一个不渲染的假值，例如 `null` 或者 `false`。    

#### `.not(selector) => ShallowWrapper`    

这里有个问题，包含多个节点的 ShallowWrapper 到底是一个类数组对象，还是一个包含多个 ShallowWrapper 实例
的数组，个人感觉前者的可能性比较大。   

这个就是一个与 `filter` 相反的过滤器，注意和`filter` 一致的是这个筛选貌似是针对根节点的，不是针对整个渲染树。
find 和 findWhere 是针对渲染树的。      

#### `.children([ selector ]) => ShallowWrapper`   

顾名思义咯，返回所有的子节点，可以选择性的提供一个选择器。    

#### `.childAt(index) => ShallowWrapper`    

返回索引处的子节点。     

#### `.parents([ selector ]) => ShallowWrapper`

看文档的意思是能找到所有的父级和祖先接待，但是奇怪的是浅渲染不是只能渲染一层么，还有一点是只能在单一节点上调用。     

#### `.parent()  => ShallowWrapper`

略。   

#### `.closest(selector) => ShallowWrapper`   

返回与选择器匹配的祖先，注意与 `parents` 不同的是，`closest` 是从当前节点开始向上遍历的，而且只找到匹配的第一个，同样，也是只能在单一节点上调用。    

#### `.shallow([options]) => ShallowWrapper`

只能在单一节点上调用。   

+ `options.context`    

#### `.render() => CheerioWrapper`    

这应该是属性静态标记的 API 了，只能在单一节点上调用。    

#### `.unmount()  => Self`

一个用来卸载组件的方法。可以用来模拟一个组件将要从生命周期中卸载。   

#### `.text()  => String`    

返回当前渲染树的渲染文本的字符串。只能在单一节点上调用。    

#### `.html() => String`   

只能在单一节点上调用。    

#### `.get(index) => ReactElement`

获取索引处的节点的 ReactElement。    

#### `.at(index) => ShallowWrapper`    

相当于把 `get(index)` 的结果用 `shallow` 再处理一下把。     

#### `.first() => ShallowWrapper`， `.last() => ShallowWrapper`

略。    

#### `.state([key]) => Any`

这个感觉文档说的不是很清楚，这个应该是一个获取组件 state 的方法，可以选择性的传入一个state 的属性名
来获取指定属性的属性值。      

#### `.context([key]) => Any`

略。    

#### `.props()  => Object`   

只在单一节点上调用，返回 props 对象。    

#### `.prop(key) => Any`    

返回指定的 `prop` 咯。肯定也是只在一个节点上调用。   

#### `.key() => String`   

返回节点的 key 值。    

#### `.simulate(event[, ...args]) => Self`    

模拟事件。   

+ `event` (`String`) 模拟的事件名
+ `...args` (`Any`)：一个模拟的事件对象   

当前的事件模拟不支持冒泡。    

虽然我们说是模拟一个事件，但是实际上 `.simulate()` 只是简单的基于事件名去查询指定的 prop，例如 `.simulate('click')` 最终会调用 `onClick()` prop。     

#### `.setState(state[, callback]) => Self`

注意这个方法不是很推荐用。    

#### `.setProps(props) => Self`

设置根组件的 props。   

#### `.setContext(context) => Self`   

略。    

#### `.instance() => ReactComponent`    

获取组件实例。要注意函数式组件没有实例。   

#### `.update() => Self`

应该是在组件上调用 `forceUpdate()` 引起强制重渲染。    

#### `.debug() => String`   

用来调试用的方法。    

#### `.type() => String | Function | null`

返回当前节点的类型，如果是组件，返回组件构造函数，如果是原生 DOM 结点返回标签名，如果是 `null` 返回`null`。     

#### `.name() => String | null`   

返回结点的名字，如果是组件，返回组件的名字，如果是 DOM 元素，返回标签名，否则 `null`。     

#### `.forEach(fn) => Self`

应该是迭代结点。   

+ `fn(ShallowWrapper node, Number index)`   

#### `.map(fn) => Array<Any>`

略。    

####  `.reduce(fn[, initialValue]) => Any`， `.reduceRight()`    

+ `fn(value, node, index)`    

#### `slice([begin[, end]]) => ShallowWrapper`   

如果索引是负数，就加上 length 再处理。    

#### `.tap(intercepter) => Self`

还是一个主要用于 debug 的方法。    

+ `intercepter( Self )`    

#### `.some(selector) => Boolean`, `.every(selector) => Boolean`

略。同数组方法。     

#### `someWhere(predicate) => Boolean`, `everyWhere()`

略。   

#### `.dive([options]) => ShallowWrapper`

浅渲染当前结点的一个非 DOM 子节点，并返回包装实例。   

+ `options.context`    

## Full DOM 渲染 API

#### `mount(node[, options]) => ReactWrapper`

+ `node`(`ReactElement`)
+ `options`
  - `context`
  - `attachTo`(`DOMElement`)：要将组件绑定到的 DOM 结点
  - `childContextTypes`   

API 与 `shallow` 方法的基本一致。除了该返回 `ShallowWrapper` 对象的变为了 `ReactWrapper`。    

#### `.mount() => ReactWrapper`  

重新挂载组件。    

#### `.ref(refName) => ReactWrapper`

返回与 ref 匹配的结点。    

#### `.detach() => void`

将渲染树从 DOM 解绑，会执行 `ReactDOM.unmountComponentAtNode()`

## 静态渲染 API

静态渲染的和 `shallow` 与 `mount` 的API 差不多，只不过用了 Cheerio 库。

## Enzyme 选择器

enzyme 中的选择器可以分为4类：   

1. 有效的 CSS 选择器：enzyme支持一个 CSS 选择器的子集：
  - 类选择器
  - 标签语法
  - id 语法
  - 属性语法
  - 也支持以上语法的结合，支持结合起来选择一个元素的语法，例如 `input#input-name`
  - 也支持后代，相邻，兄弟，子等选择器
2. React 组件构造函数
3. 组件 displayName
4. 对象属性选择器：enzyme 可以让我们给予其属性的子集来选择组件和节点：    

```js
const wrapper = mount((
  <div>
    <span foo={3} bar={false} title="baz" />
  </div>
));

wrapper.find({ foo: 3 });
wrapper.find({ bar: false });
wrapper.find({ title: 'baz' });
```    

