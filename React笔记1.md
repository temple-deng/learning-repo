## 阮一峰的React实例教程笔记

-----
   1. JSX
   2. 组件
   3. Prop验证
   4. State
   
--------

###  1、JSX
JSX 把类 XML 的语法转成纯粹 JavaScript，XML 元素、属性和子节点被转换成 React.createElement 的参数。
```
    jsx
    var app = <Nav color="blue"><Profile>click</Profile></Nav>;
    js
    var app = React.createElement(Nav, {color:"blue"},
                React.createElement(Porfile, null, "click")
            );
```


###  2.组件
常用的模式是创建多个只负责渲染数据的无状态（stateless）组件，在它们的上层创建一个有状态（stateful）组件并把它的状态通过 props 传给子级。这个有状态的组件封装了所有用户的交互逻辑，而这些无状态组件则负责声明式地渲染数据。

如果子组件位置会改变（如在搜索结果中）或者有新组件添加到列表开头（如在流中）情况会变得更加复杂。如果子级要在多个渲染阶段保持自己的特征和状态，在这种情况下，你可以通过给子级设置惟一标识的 key 来区分。

当 React 校正带有 key 的子级时，它会确保它们被重新排序（而不是破坏）或者删除（而不是重用）。 务必 把 key 添加到子级数组里组件本身上，而不是每个子级内部最外层 HTML 上


### 3.Prop验证
```javascript
React.createClass({
  propTypes: {
    // 可以声明 prop 为指定的 JS 基本类型。默认
    // 情况下，这些 prop 都是可传可不传的。
    optionalArray: React.PropTypes.array,
    optionalBool: React.PropTypes.bool,
    optionalFunc: React.PropTypes.func,
    optionalNumber: React.PropTypes.number,
    optionalObject: React.PropTypes.object,
    optionalString: React.PropTypes.string,

    // 所有可以被渲染的对象：数字，
    // 字符串，DOM 元素或包含这些类型的数组。
    optionalNode: React.PropTypes.node,

    // React 元素
    optionalElement: React.PropTypes.element,

    // 用 JS 的 instanceof 操作符声明 prop 为类的实例。
    optionalMessage: React.PropTypes.instanceOf(Message),

    // 用 enum 来限制 prop 只接受指定的值。
    optionalEnum: React.PropTypes.oneOf(['News', 'Photos']),

    // 指定的多个对象类型中的一个
    optionalUnion: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number,
      React.PropTypes.instanceOf(Message)
    ]),

    // 指定类型组成的数组
    optionalArrayOf: React.PropTypes.arrayOf(React.PropTypes.number),

    // 指定类型的属性构成的对象
    optionalObjectOf: React.PropTypes.objectOf(React.PropTypes.number),

    // 特定形状参数的对象
    optionalObjectWithShape: React.PropTypes.shape({
      color: React.PropTypes.string,
      fontSize: React.PropTypes.number
    }),

    // 以后任意类型加上 `isRequired` 来使 prop 不可空。
    requiredFunc: React.PropTypes.func.isRequired,

    // 不可空的任意类型
    requiredAny: React.PropTypes.any.isRequired,

    // 自定义验证器。如果验证失败需要返回一个 Error 对象。不要直接
    // 使用 `console.warn` 或抛异常，因为这样 `oneOfType` 会失效。
    customProp: function(props, propName, componentName) {
      if (!/matchme/.test(props[propName])) {
        return new Error('Validation failed!');
      }
    }
  },
  /* ... */
});
```
<br>
<br>

###  4. State
鉴别哪些数据做state、哪些数据做prop:
+ 数据是从父级组件传递过来的吗？如果是，它可能不是state  
+ 数据是否会随着时间而变化？如果没有，它可能不是state  
+ 数据是否能根据组件中其他的state或者props计算出来，如果可以，它可能不是state  
<br>
<br>

###  5. ES6 Classes
```javascript
//ES6 Classes define method
 class HelloMessage extends React.Component {
		render(){
			return (
				<div>Hello!
				</div>
			);
		}
 }
```
这种方式定义的组件，并没有getInitialState()方法，需要在构造函数中自己设置state属性。还有就是 propTypes和 defaultProps是作为构造函数的属性定义的，而不是在类内部定义的方法。  
```javascript
	export class Counter extends React.Component {
	  constructor(props) {
	    super(props);
	    this.state = {count: props.initialCount};
	    this.tick = this.tick.bind(this);
	  }
	  tick() {
	    this.setState({count: this.state.count + 1});
	  }
	  render() {
	    return (
	      <div onClick={this.tick}>
	        Clicks: {this.state.count}
	      </div>
	    );
	  }
	}
	Counter.propTypes = { initialCount: React.PropTypes.number };
	Counter.defaultProps = { initialCount: 0 };
```
**非自动绑定**  
使用ES6 Class语法定义的组件类不会自动绑定this到组件实例上，必须明确地使用 .bind(this)或者箭头函数.
```javascript
// You can use bind() to preserve `this`
<div onClick={this.tick.bind(this)}>

// Or you can use arrow functions
<div onClick={() => this.tick()}>
```
推荐绑定事件处理函数在构造函数中，这样就可以为每个实例绑定一次  

<br>
<br>
###  6.表单
**受控组件**  
受控组件是指带有value属性的input标签