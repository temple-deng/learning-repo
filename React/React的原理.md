## React的原理

### 摘自infoq深入浅出React系列
--------

###  1、Virtual Dom
虚拟DOM（Virtual DOM）的机制：在浏览器端用Javascript实现了一套DOM API。基于React进行开发时所有的DOM构造都是通过虚拟DOM进行，每当数据变化时，React都会重新构建整个DOM树，然后React将当前整个DOM树和上一次的DOM树进行对比，得到DOM结构的区别，然后仅仅将需要变化的部分进行实际的浏览器DOM更新。而且React能够批处理虚拟DOM的刷新，在一个事件循环（Event Loop）内的两次数据变化会被合并，例如你连续的先将节点内容从A变成B，然后又从B变成A，React会认为UI不发生任何变化，而如果通过手动控制，这种逻辑通常是极其复杂的。尽管每一次都需要构造完整的虚拟DOM树，但是因为虚拟DOM是内存数据，性能是极高的，而对实际DOM进行操作的仅仅是Diff部分，因而能达到提高性能的目的。


### 2.webpack
配置文件通常放在项目根目录之下，其本身也是一个标准的CommonJS模块。  

一个最简单的Webpack配置文件webpack.config.js如下所示：
```javascript
    module.exports = {
      entry:[
        './app/main.js'
      ],
      output: {
        path: __dirname + '/assets/',
        publicPath: "/assets/",
        filename: 'bundle.js'
      }
    };
```
其中entry参数定义了打包后的入口文件，数组中的所有文件会按顺序打包。每个文件进行依赖的递归查找，直到所有相关模块都被打包。output参数定义了输出文件的位置，其中常用的参数包括：

    path: 打包文件存放的绝对路径
    publicPath: 网站运行时的访问路径
    filename: 打包后的文件名


###  3.JSX
JSX本身就和XML语法类似，可以定义属性以及子元素。唯一特殊的是可以用大括号来加入JavaScript表达式，例如：
```
var person = <Person name={window.isLoggedIn ? window.name : ''} />;
```
一般每个组件都定义了一组属性（props，properties的简写）接收输入参数，这些属性通过XML标记的属性来指定。大括号中的语法就是纯JavaScript表达式，返回值会赋予组件的对应属性，因此可以使用任何JavaScript变量或者函数调用。上述代码经过JSX编译后会得到：
```
var person = React.createElement(
  Person,
  {name: window.isLoggedIn ? window.name : ''}
);
```
React并不会真正的绑定事件到每一个具体的元素上，而是采用事件代理的模式：在根节点document上为每种事件添加唯一的Listener，然后通过事件的target找到真实的触发元素。这样从触发元素到顶层节点之间的所有节点如果有绑定这个事件，React都会触发对应的事件处理函数。这就是所谓的React模拟事件系统。


**在JSX中使用样式**
在JSX中使用样式和真实的样式也很类似，通过style属性来定义，但和真实DOM不同的是，属性值不能是字符串而必须为对象，例如：
```
<div style={{color: '#ff0000', fontSize: '14px'}}>Hello World.</div>
```
乍一看，这段JSX中的大括号是双的，有点奇怪，但实际上里面的大括号只是标准的JavaScript对象表达式，外面的大括号是JSX的语法。
<br />
<br />
### 4.组件
组件自身定义了一组props作为对外接口，展示一个组件时只需要指定props作为XML节点的属性。组件很少需要对外公开方法，唯一的交互途径就是props。这使得使用组件就像使用函数一样简单，给定一个输入，组件给定一个界面输出。当给予的参数一定时，那么输出也是一定的。

除了props之外，组件还有一个很重要的概念：state。组件规范中定义了setState方法，每次调用时都会更新组件的状态，触发render方法。需要注意，render方法是被异步调用的，这可以保证同步的多个setState方法只会触发一次render，有利于提高性能。和props不同，state是组件的内部状态，除了初始化时可能由props来决定，之后就完全由组件自身去维护。在组件的整个生命周期中，React强烈不推荐去修改自身的props，因为这会破坏UI和Model的一致性，props只能够由使用者来决定。
![组件生命周期][1]
componentDidMount: 在组件第一次render之后调用，这时组件对应的DOM节点已被加入到浏览器。在这个方法里可以去实现一些初始化逻辑。

componentWillUnmount: 在DOM节点移除之后被调用，这里可以做一些相关的清理工作。

shouldComponentUpdate: 这是一个和性能非常相关的方法，在每一次render方法之前被调用。它提供了一个机会让你决定是否要对组件进行实际的render。



  [1]: http://cdn3.infoqstatic.com/statics_s2_20160322-0135u2/resource/articles/react-jsx-and-component/zh/resources/0702001.png
