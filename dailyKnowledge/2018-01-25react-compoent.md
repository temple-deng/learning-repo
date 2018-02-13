# 良好设计的 React 组件应该遵循的几个原则

## 1. 单一职责原则

单一职责的组件只能有一个修改组件的原因（这里的修改指的是业务逻辑发生变动时，需要对代码
做出的修改，而不是说组件状态的变化）。      

例子1：一个组件需要取远程的数据，那么其对应的修改原因就只能是获取逻辑发生变动时，可能的原因有：    

+ 服务器的 URL 发生了变动
+ 响应的格式发生了变化
+ 当我们想要换一个 HTTP 请求库时
+ 或者其他获取逻辑需要修改时      

例子2：一个表格组件要展示一系列数据，那么其修改的原因就只能是当展示逻辑发生变动时，可能的原因有：    

+ 我们需要限制渲染数据的数量
+ 当列表为空时，我们需要展示一条提示信息
+ 或者其他的展示逻辑发生变化时      

### 1.2 案例学习1

假设当前有一个组件从服务器获取当前天气的数据，当数据返回时，相同的组件要使用这些数据来展示天气：    


```jsx
import axios from 'axios';

class Weather extends Component {
  constructor(props) {
    super(props);
    this.state = { temperature: 'N/A', windSpeed: 'N/A' };
  }

  render() {
    const { temperature, windSpeed } = this.state;
    return (
      <div className="weather">
        <div>Temperature: {temperature}°C</div>
        <div>Wind: {windSpeed}km/h</div>
      </div>
    );
  }

  componentDidMount() {
    axios.get('http://weather.com/api').then(function(response) {
      const { current } = response.data;
      this.setState({
        temperature: current.temperature,
        windSpeed: current.windSpeed
      });
    })
  }
}
```     

上述组件其实是有两个可能会引起变动的原因的：    

1. 在 `componentDidMount()` 方法中的获取逻辑：服务器 URL 或者响应格式可能后期会修改
2. 在 `render()` 方法中对天气的展示：天气展示格式可能后期会修改多次     

其实这些原因都是为了让我们后期在需要修改组件时，尽量只变动组件的自身，而不用变动不相关逻辑的部分。     

上述组件的解决方式就是划分成两个组件，各司其职，例如分别命名为 `<WeatherFetch>` 和 `<WeatherInfo>`。      

第一个组件负责获取数据，并保存在 state 中：     

```jsx
import axios from 'axios';

class WeatherFetch extends Component {
  constructor(props) {
    super(props);
    this.state = { temperature: 'N/A', windSpeed: 'N/A' };
  }

  render() {
    const { temperature, windSpeed } = this.state;
    return (
      <WeatherInfo temperature={temperature} windSpeed={windSpeed} />
    );
  }

  componentDidMount() {
    axios.get('http://weather.com/api').then(function(response) {
      const { current } = response.data;
      this.setState({
        temperature: current.temperature,
        windSpeed: current.windSpeed
      });
    })
  }
}
```    

### 1.3 案例学习2：高阶组件

用责任来组合不同的组件不总是有助于符合单一职责原则。我们可以尝试从高阶组件中来获取一些好处。     

一个对 HOC 常用的用法是为被包裹的组件提供额外的 props 或者修改已存的 props 值，这种技术一般称为
**属性代理**：      

```jsx
function withNewFunctionality(WrappedComponent) {
  return class NewFunctionality extends Component {
    render() {
      const newProp = 'value';
      const propsProxy = {
        ...this.props,
        ownProp: this.props.ownProp + ' was modified',
        newProp
      };

      return <WrappedComponent {...propsProxy} />;
    }
  }
}

const MyNewComponent = withNewFunctionality(MyComponent);
```     

我们也可以在 render 方法中添加钩子，来修改被包裹元素的渲染内容，这种技术叫做**渲染劫持**：     

```jsx
function withModifiedChildren(WrappedComponent) {
  return class ModifiedChildren extends WrappedComponent {
    render() {
      // 相当于覆盖父类的 render 方法
      const rootElement = super.render();
      const newChildren = [
        ...rootElement.props.children,
        <div>New child</div>
      ];

      return cloneElement(
        rootElement,
        rootElement.props,
        newChildren
      )
    }
  }
}

const MyNewComponent = withModifiedChildren(MyComponent)
```    

## 2. 封装

一个封装良好的组件会在不暴露其内部结构的情况下，提供一系列 `props` 来让我们控制其行为。     



