const createElement = (type, props, ...children) => {
  if (props == null) {
    props = {};
  }
  return {
    type,
    props,
    children
  };
};

// 给 DOM 元素添加属性，那这里的 dom 就必须是一个 DOM 元素
const setAttribute = (dom, key, val) => {
  if (typeof val === 'function' && key.startsWith('on')) {
    // event handler attribute
    const eventType = key.slice(2).toLowerCase();
    dom.__gooactHandlers = dom.__gooactHandlers || {};
    // 疑问点 1
    dom.removeEventListener(eventType, dom.__gooactHandlers[eventType]);
    dom.__gooactHandlers[eventType] = val;
    dom.addEventListener(eventType, dom.__gooactHandlers[eventType])
  } else if (key === 'checked' || key === 'value' || key === 'className') {
    // special attribute
    dom[key] = value;
  } else if (key === 'style' && typeof val === 'object') {
    // style attribute
    Object.assign(dom.style, val);
  } else if (key === 'ref' && typeof val === 'function') {
    // ref attribute
    val(dom);
  } else if (key === 'key') {
    dom.__gooactKey = val;
  } else if (typeof val !== 'object' && typeof val !== 'function') {
    dom.setAttribute(key, val);
  }
};

/**
 * 首先，vdom 是一个对象树，parent 是其父节点
 * 那这就有个疑问，parent 是只可能是 DOM 元素呢，还是可以是组件呢
 * 看情况是只能是 DOM 元素，不然如何 appendChild
 * 那么整个 render 方法中 vdom 的类型其实也就 4 种
 * 简化一下就是文本节点，组件和 DOM 元素 3 种
 * @param {any} vdom 
 * @param {HTMLElement} parent
 * @param {HTMLElement | Text} render 的结果
 */
const render = (vdom, parent = null) => {
  const mount = parent ? (el => parent.appendChild(el)) : (el => el);

  if (typeof vdom === 'string' || typeof vdom === 'number') {
    // 如果是字符串或者数字字面值
    // 创建文本节点，并将其添加到父元素的最后（如果其有父元素）
    // 并将其返回，那么这里返回的就是一个 Text 类型的对象
    return mount(document.createTextNode(vdom));
  } else if (typeof vdom === 'boolean' || vdom == null) {
    // 如果是布尔值或者 null，类似字符串与数字，创建一个空的文本节点，并返回
    return mount(document.createTextNode(''));
  } else if (typeof vdom === 'object' && typeof vdom.type === 'function') {
    // 如果是组件，调用 Component 类的静态 render 方法
    // 但是这里返回值是什么待定
    // @TODO
    return Component.render(vdom, parent);
  } else if (typeof vdom === 'object' && typeof vdom.type === 'string') {
    // 如果是普通的 DOM 元素类型
    // 构建 DOM 元素，并添加到 DOM 中
    // 然后完成后续的 props 的绑定以及对 children 的递归
    // render 方法中其实只有两种情况下需要向下递归，就是组件和普通的 dom 元素
    const dom = mount(document.createElement(vdom.type));

    for (const child of [].concat(...vdom.children)) {
      // 这里递归渲染子节点，但是并没有保存返回值
      // 而且目前只有这里递归调用了 render 方法，第二个参数也是一个 dom 元素
      // 上面的 Component.render 中也可能会调用，但暂时还不知道
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

/**
 * 但是其实目前来看，不管是 patch 还是 render 方法
 * 其返回值好像只是在 replace 方法中使用到了
 * @param {*} dom 
 * @param {*} vdom 
 * @param {*} parent 
 */
const patch = (dom, vdom, parent = dom.parentNode) => {
  const replace = parent ? (el => (parent.replaceChild(el, dom) && el)) : (el => el);

  if (typeof vdom === 'object' && typeof vdom.type === 'function') {
    // 新的 vdom 是组件类型，由组件去处理
    return Component.patch(dom, vdom, parent);
  } else if (typeof vdom !== 'object' && dom instanceof Text) {
    // 新的 vdom 和旧的 dom 都只是 Text，那就在内容不一致的时候替换一下
    // 具体流程是先在父元素后面添加新的，然后把当前的替换掉
    return dom.textContent !== vdom ? replace(render(vdom, parent)) : dom;
  } else if (typeof vdom === 'object' && dom instanceof Text) {
    // 新的 vdom 是 DOM 元素，旧的 DOM 是 Text
    // 那直接替换就好了
    return replace(render(vdom, parent))
  } else if (typeof vdom === 'object' && vdom.type !== dom.nodeName.toLowerCase()) {
    // 新的 vdom 和旧的 DOM 是不同的 DOM 类型元素
    // 直接替换
    return replace(render(vdom, parent));
  } else if (typeof vdom === 'object' && vdom.type === dom.nodeName.toLowerCase()) {
    const pool = {};
    const active = document.activeElement;

    [].concat(...dom.childNodes).map((child, index) => {
      const key = child.__gooactKey || `index_${index}`;
      pool[key] = child;
    });

    [].concat(...vdom.children).map((child, index) => {
      const key = child.props && child.props.key || `index_${index}`;
      dom.appendChild(
        pool[key] ? patch(pool[key], child) : render(child, dom)
      );
      delete pool[key];
    });

    for (key in pool) {
      const instance = pool[key].__gooactInstance;
      if (instance) instance.componentWillUnmount();
      pool[key].remove();
    }


    for (const attr of dom.attributes) {
      dom.removeAttribute(attr.name);
    }
    for (const prop in vdom.props) {
      setAttribute(dom, prop, vdom.props[prop]);
    }
    active.focus();
    return dom;
  }
}

class Component {
  constructor(props) {
    this.props = props || {};
    this.state = {};
  }

  static render(vdom, parent=null) {
    const props = Object.assign({}, vdom.props, {children: vdom.children});
    if (Component.isPrototypeOf(vdom.type)) {
      const instance = new (vdom.type)(props);
      instance.componentWillMount();
      // 这里 base 应该是底层的 dom 结构
      instance.base = render(instance.render(), parent);
      instance.base.__gooactInstance = instance;
      instance.base.__gooactKey = vdom.props.key;
      instance.componentDidMount();
      // 返回底层 dom
      return instance.base;
    } else {
      return render(vdom.type(props), parent);
    }
  }

  static patch(dom, vdom, parent = dom.parentNode) {
    const props = Object.assign({}, vdom.props, {children: vdom.children});
    
    if (dom.__gooactInstance && dom.__gooactInstance.constructor === vdom.type) {
      dom.__gooactInstance.componentWillReceiveProps(props);
      dom.__gooactInstance.props = props;
      return patch(dom, dom.__gooactInstance.render(), parent);
    } else if (Component.isPrototypeOf(vdom.type)) {
      const ndom =  render(vdom, parent);
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