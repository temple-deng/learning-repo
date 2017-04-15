## 阮一峰的React实例教程笔记

-----
   1. JSX
   2. 组件
   3. Prop验证
   4. State

--------

###  1、JSX  
JSX 把类 XML 的语法转成纯粹 JavaScript，XML 元素、属性和子节点被转换成 React.createElement 的参数。  

```javascript
    // jsx
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


**非自动绑定**  
使用ES6 Class语法定义的组件类不会自动绑定this到组件实例上，必须明确地使用 .bind(this)或者箭头函数.
```javascript
// You can use bind() to preserve `this`
<div onClick={this.tick.bind(this)}>

// Or you can use arrow functions
<div onClick={() => this.tick()}>
```
推荐绑定事件处理函数在构造函数中，这样就可以为每个实例绑定一次  





###  6.表单
**受控组件**   

受控组件是指带有value属性的input标签  

受控组件的问题(不涉及React)：

对于定义了value属性的input的元素， 当输入内容时， input.value值时随着输入而变化的，但input.attributes.value.value仍然是定义在input上的value属性的值，input.getAttribute('value')返回的值也是这样。
