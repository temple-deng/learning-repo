# React Clone

## Element

Element 是对真实 DOM 的一种轻量级对象表示。Element 中保存了所有关键的信息——例如节点
类型，节点 attributes 和其孩子 —— 以便其能在将来迅速地完成到真实 DOM 的转换。将
Elements 使用类似树的结构组合起来，就成为了 VDOM:   

```json
{
  "type": "ul",
  "props": {
    "className": "some-list"
  },
  "children": [
    {
      "type": "li",
      "props": {
        "className": "some-list__item"
      },
      "children": [
        "One"
      ]
    },
    {
      "type": "li",
      "props": {
        "className": "some-list__item"
      },
      "children": [
        "Two"
      ]
    }
  ]
}
```    

```js
const createElement = (type, props, ...children) => {
  if (props == null) props = {};
  return {
    type,
    props,
    children
  }
}
```   

## Rendering

Rendering 是一个将 VDOM 转换成真实 DOM 结构的过程。    

```js
const render = (vdom, parent=null) => {
  const mount = parent ? (el => parent.appendChild(el)) : (el => el);
  if (typeof vdom === 'string' || typeof vdom === 'number') {
    return mount(document.createTextNode(vdom), parent);
  } else if (typeof vdom === 'boolean' || vdom === null) {
    return mount(document.createTextNode(''), parent);
  } else if (typeof vdom === 'object' && typeof vdom.type === 'function') {
    return Component.render(vdom, parent);
  } else if (typeof vdom === 'object' && typeof vdom.type === 'string') {
    const dom = mount(document.createElement(vdom.type));
    for (const child of [/* flatten */].concat(...vdom.children)) {
      render(child, dom);
    }
    for (const prop in vdom.props) {
      setAttribute(dom, prop, vdom.props[prop]);
    }
    return dom;
  } else {
    throw new Error(`Invalid VDOM: ${vdom}`);
  }
}

const setAttribute = (dom, key, value) => {
  if (typeof value === 'function' && key.startsWith('on')) {
    const eventType = key.slice(2).toLowerCase();
    dom.__gooactHandlers = dom.__gooactHandlers || {};
    dom.removeEventListener(eventType, dom.__gooactHandlers[eventType]);
    dom.__gooactHandlers[eventType] = value;
    dom.addEventListener(eventType, dom.__gooactHandlers[eventType]);
  } else if (key === 'checked' || key === 'value' || key === 'className') {
    dom[key] = value;
  } else if (key === 'style' && typeof key === 'object') {
    Object.assign(dom.style, value);
  } else if (key === 'ref' && typeof value === 'function') {
    value(dom);
  } else if (key === 'key') {
    dom.__gooactKey = value;
  } else if (type value !== 'object' && typeof value != 'function') {
    dom.setAttribute(key, value);
  }
}
```    

## Patching

Patching 是一个将现存的 dom 与新建立的 VDOM tree 进行重新协调的过程。    

+ 构建一个新的 VDOM
+ 与现存的 DOM 进行递归地比较
+ 定位那些添加的、移除的以及进行了其他修改的节点
+ 添加补丁    

```js
const patch = (dom, vdom, parent = dom.parentNode) => {
  const replace = parent ? el => (parent.replaceChild(el, dom) && el) : (el => el);

  if (typeof vdom === 'object' && typeof vdom.type === 'function') {
    return Component.patch(dom, vdom, parent);
  } else if (typeof vdom !== 'object' && dom instanceof Text) {
    return dom.textContent != vdom ? replace(render(vdom, parent)) : dom;
  } else if (typeof vdom === 'object' && dom instanceof Text) {
    return replace(render(vdom, parent));
  } else if (typeof vdom === 'object' && dom.nodeName !== vdom.type.toUpperCase()) {
    return replace(render(vdom, parent));
  } else if (typeof vdom === 'object' && dom.nodeName === vdom.type.toUpperCase()) {
    const pool = {};
    const active = document.activeElement;
    [].concat(...dom.childNodes).map((child, index) => {
      const key = child.__gooactKey || `__index_${index}`;
      pool[key] = child;
    });
    
    [].concat(...vdom.children).map((child, index) => {
      const key = child.props && child.props.key || `__index_${index}`;
      dom.appendChild(pool[key] ? patch(pool[key], child) : render(child, dom));
      delete pool[key];
    });

    for (const key in pool) {
      const instance = pool[key].__gooactInstance;
      if (instance) instance.componentWillUnmount();
      pool[key].remove();
    }

    for (const attr of dom.attributes) dom.removeAttribute(attr.name);
    for (const prop in vdom.props) setAttribute(dom, prop, vdom.props[prop]);
    active.focus();
    return dom;
  }
}
```    

所有可能的组合（VDOM 有原始值，组件和 DOM 元素三种形式，而 DOM 有文本和 DOM 元素两种
形式）：   

+ 原始值 VDOM + Text DOM: 比较 VDOM 的值和 DOM 的文本内容，如果不一致的话执行完整的渲染
+ 原始值 VDOM + Element DOM: 完整的渲染
+ 复杂的 VDOM + Text DOM: 完整的渲染
+ 复杂的 VDOM + 不同类型的 Element DOM: 完整的渲染
+ 复杂的 VDOM + 同一类型的 Element DOM: 执行属性的修改，以及孩子的重新协调
+ 组件 VDOM + 任意类型的 DOM: 与上面的类型类似，不过使用的另外的方法

## Components

组件从概念上讲与 JS 中的函数类似 —— 接收任意的称为 "props" 的输出，返回一系列应该显示
在屏幕上的元素。    

```js
class Component {
  constructor(props) {
    this.props = props || {};
    this.state = null;
  }

  static render(vdom, parent) {
    // 相当于把 children 注入到 props 中吧
    const props = Object.assign({}, vdom.props, {children: vdom.children});

    // 区分函数式组件与 class 式组件
    if (Component.isPrototypeOf(vdom.type)) {
      const instance = new (vdom.type)(props);
      instance.componentWillMount();
      // base 应该是底层支撑的 DOM 元素
      instance.base = render(instance.render(), parent);
      instance.base.__gooactInstance = instance;
      instance.base.__gooactKey = vdom.props.key;
      instance.componentDidMount();
      return instance.base;
    } else {
      return render(vdom.type(props), parent);
    }
  }

  static patch(dom, vdom, parent=dom.parent) {
    const props = Object.assign({}, vdom.props, { children: vdom.children });

    // 组件类型一致
    if (dom.__gooactInstance && dom.__gooactInstance.constructor === vdom.type) {
      dom.__gooactInstance.componentWillReceiveProps(props);
      dom.__gooactInstance.props = props;
      return patch(dom, dom.__gooactInstance.render(), parent);
    } else if (Component.isPrototypeOf(vdom.type)) {
      // 组件类型一致
      const ndom = Component.render(vdom, parent);
      return parent ? (parent.replaceChild(ndom, dom) && ndom) : (ndom);
    } else if (!Component.isPrototypeOf(vdom.type)) {
      return patch(dom, vdom.type(props), parent);
    }
  }

  setState(nextState) {
    if (this.base && this.shouldComponentUpdate(this.props, nextState)) {
      const preveState = this.state;
      this.componentWillUpdate(this.props, nextState);
      this.state = nextState;
      patch(this.base, this.render());
      this.componentDidUpdate(this.props, prevState);
    } else {
      this.state = nextState;
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps != this.props || nextState != this.state;
  }
  componentWillReceiveProps(nextProps) {
    return undefined;
  }

  componentWillUpdate(nextProps, nextState) {
    return undefined;
  }

  componentDidUpdate(prevProps, prevState) {
    return undefined;
  }

  componentWillMount() {
    return undefined;
  }

  componentDidMount() {
    return undefined;
  }

  componentWillUnmount() {
    return undefined;
  }
}
```   

