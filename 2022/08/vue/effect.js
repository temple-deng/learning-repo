let activeEffect;
let effectStack = [];
let bucket = new WeakMap();
let jobQueue = new Set();
let flushing = false;

function effect(fn, options = {}) {
    const effectFn = () => {
        cleanup(effectFn);
        activeEffect = effectFn;
        effectStack.push(effectFn);
        const ret = fn();
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1];
        return ret;
    }

    effectFn.deps = [];
    effectFn.options = options;

    if (!options.lazy) {
        effectFn();
    }
    return effectFn;
}

function cleanup(effectFn) {
    for (let i = 0; i < effectFn.deps.length; i++) {
        const effect = effectFn.deps[i];
        effect.delele(effectFn);
    }
    effectFn.deps.length = 0;
}

let ITERATE_KEY = Symbol();

function reactive(obj) {
    return new Proxy(obj, {
        get(target, key, receiver) {
            if (key === 'raw') {
                return target;
            }
            track(target, key);
            const res = Reflect.get(target, key, receiver);
            if (typeof res === 'object' && res !== null) {
                return reactive(res);
            }
            return res;
        },
        set(target, key, value, receiver) {
            let oldValue = target[key]; // 话说这里为什么不用 Reflect
            const type = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD';
            const ret = Reflect.set(target, key, value, receiver);

            if (target === receiver.raw) {
                if (oldValue !== value && (oldValue === oldValue || newValue === newValue)) {
                    trigger(target, key, type);
                }
            }
            return ret;
        },
        has(target, key) {
            track(target, key);
            return Reflect.has(target, key);
        },
        ownKeys(target) {
            track(target, ITERATE_KEY);
            return Reflect.ownKeys(target);
        },
        deleteProperty(target, key) {
            const has = Object.prototype.hasOwnProperty.call(target, key);
            const res = Reflect.deleteProperty(target, key);

            if (has && res) {
                trigger(target, key, 'DELETE');
            }
            return res;
        }
    })
}

function track(target, key) {
    if (!activeEffect || !shouldTrack) return;
    let depsMap = bucket.get(target);
    if (!depsMap) {
        bucket.set(target, (depsMap = new Map()));
    }

    let deps = depsMap.get(key);
    if (!deps) {
        depsMap.set(key, (deps = new Set()));
    }
    deps.add(activeEffect);
}

function trigger(target, key, type, newValue) {
    let depsMaps = bucket.get(target);

    if (!depsMaps) return;

    let effects = depsMaps.get(key);
    let effectsToRun = new Set();

    effects && effects.forEach((effectFn) => {
        if (effectFn !== activeEffect) {
            effectsToRun.add(effectFn);
        }
    })

    if (type === 'ADD' || type === 'DELETE') {
        const iterateEffects = depsMaps.get(ITERATE_KEY);
        iterateEffects && iterateEffects.forEach(effectFn => {
            if (effectFn !== activeEffect) {
                effectsToRun.add(effectFn);
            }
        })
    }

    if (type === 'ADD' && Array.isArray(target)) {
        const lengthEffects = depsMaps.get('length');
        lengthEffects && lengthEffects.forEach(effectFn => {
            if (effectFn !== activeEffect) {
                effectsToRun.add(effectFn);
            }
        })
    }

    if (Array.isArray(target) && key === 'length') {
        depsMaps.forEach((effects, key) => {
            if (key >= newValue) {
                effects.forEach(effectFn => {
                    if (effectFn !== activeEffect) {
                        effectsToRun.add(effectFn);
                    }
                })
            }
        })
    }

    effectsToRun.forEach(effectFn => {
        if (effectFn.options.scheduler) {
            effectFn.options.scheduler(effectFn);
        } else {
            effectFn();
        }
    });
}

function computed(getter) {
    let value;
    let dirty = true;

    const effectFn = effect(getter, {
        lazy: true,
        scheduler() {
            if (!dirty) {
                dirty = true;
                trigger(obj, 'value')
            }
        }
    });

    let obj = {
        get value() {
            if (dirty) {
                value = effectFn();
                dirty = false;
            }
            track(obj, 'value');
            return value;
        }
    }
    return obj;
}

function watch(source, cb, options = {}) {
    let getter;
    if (typeof source === 'function') {
        getter = source;
    } else {
        getter = () => traverse(source);
    }

    let newValue, oldValue;
    let cleanup;

    function onInvalidate(fn) {
        cleanup = fn;
    }

    let job = () => {
        newValue = effectFn();
        if (cleanup) {
            cleanup();
        }
        cb(newValue, oldValue, onInvalidate);
        oldValue = newValue;
    }

    const effectFn = effect(() => getter(), {
        lazy: true,
        scheduler: job
    });
    if (options.immediate) {
        job()
    } else {
        oldValue = effectFn();
    }
}

function traverse(value, seen = new Set()) {
    // 如果要读取的数据是原始值，或者已经读取过了，那么什么也不做
    if (typeof value !== 'object' || value === null || seen.has(value)) return
    seen.add(value);

    for (const k in value) {
        traverse(value[k], seen);
    }
    return value;
}

const originMethod = Array.prototype.includes;

const arrayInstrumentation = {
    includes: function (...args) {
        let res = originMethod.apply(this, args);

        if (res === false) {
            // 说明在代理对象中没找到，通过 this.raw 拿到原始数组，再去其中查找并更新 res 值
            res = originMethod.apply(this.raw, args);
        }
        return res;
    }
}

let shouldTrack = true;

['push'].forEach(method => {
    const originMethod = Array.prototype[method];

    arrayInstrumentation[method] = function (...args) {
        shouldTrack = false;
        let res = originMethod.apply(this, args);
        shouldTrack = true;
        return res;
    }
})

function createReactive(obj, isShallow = false, isReadonly = false) {
    return new Proxy(obj, {
        get(target, key, receiver) {
            if (key === 'raw') {
                return target;
            }

            if (Array.isArray(target) && arrayInstrumentation.hasOwnProperty(key)) {
                return Reflect.get(arrayInstrumentation, key, receiver);
            }

            const res = Reflect.get(target, key, receiver);
            if (!isReadonly && typeof key !== 'symbol') {
                track(target, key);
            }
            if (isShallow) {
                return res;
            }

            if (typeof res === 'object' && res !== null) {
                return isReadonly ? readonly(res) : reactive(res);
            }
            return reactive(res);
        },
        set(target, key, newValue, receiver) {
            let oldValue;

            if (isReadonly) {
                console.warn('只读');
                return true;
            }

            oldValue = target[key];

            const type = Array.isArray(target)
                ? Number(key) < target.length ? 'SET' : 'ADD'
                : Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD';

            const res = Reflect.set(target, key, newValue, receiver);

            if (target === receiver.raw) {
                if (oldValue !== newValue && (oldValue === oldValue || newValue === newValue)) {
                    trigger(target, key, type, newValue);
                }
            }
            return res;
        },
        has(target, key) {
            track(target, key);
            return Reflect.has(target, key);
        },
        ownKeys(target) {
            track(target, Array.isArray(target) ? 'length' : ITERATE_KEY);
            return Reflect.ownKeys(target);
        },
        deleteProperty(target, key) {
            if (isReadonly) {
                console.warn('readonly');
                return true;
            }
            const has = Object.prototype.hasOwnProperty.call(target, key);
            const res = Reflect.deleteProperty(target, key);

            if (has && res) {
                trigger(target, key, 'DELETE');
            }
            return res;
        }
    })
}

function readonly(obj) {
    return createReactive(obj, false, true);
}

// 定义一个 map 实例，存储原始对象到代理对象的映射
const reactiveMap = new Map();

function reactive2(obj) {
    // 优先通过原始对象 obj 寻找之前创建的代理对象
    const existionProxy = reactiveMap.get(obj);
    if (existionProxy) return existionProxy;

    const proxy = createReactive(obj);
    reactiveMap.set(obj, proxy);
    return proxy;
}



function ref(val) {
    const wrapper = {
        value: val
    }

    Object.defineProperty(wrapper, '__v_isRef', {
        value: true
    })

    return reactive(wrapper);
}

function toRef(object, key) {
    const wrapper = {
        get value() {
            return object[key];
        },

        set value(newVal) {
            object[key] = newVal;
        }
    }
    return wrapper;
}

function toRefs(object) {
    const ret = {};

    for (const key in object) {
        ret[key] = toRef(object, key);
    }
    return ret;
}

function proxyRefs(target) {
    return new Proxy(target, {
        get(target, key, receiver) {
            const value = Reflect.get(target, key, receiver);
            return value.__v_isRef ? value.value : value;
        },

        set(target, key, val, receiver) {
            const value = target[key];

            if (value.__v_isRef) {
                value.value = val;
                return true;
            }

            return Reflect.set(target, key, val, receiver);
        }
    })
}



// function renderer(domString, container) {
//     container.innerHTML = domString;
// }

// const count = ref(0);

// effect(() => {
//     renderer(`<h1>${count.value}</h1>`, document.getElementById('app'));
// });

count.value++;

function createRenderer(options) {
    const {
        createElement,
        setElementText,
        insert
    } = options;

    function render(vnode, container) {
        if (vnode) {
            // 新 vnode 存在，将其与旧 vnode 一起传递给 patch 函数，进行打补丁
            patch(container._vnode, vnode, container);
        } else {
            if (container._vnode) {
                // 旧 vnode 存在且新 vnode 不存在，说明是卸载操作
                // container.innerHTML = ''
                unmount(container._vnode)
            }
            container._vnode = vnode;
        }
    }

    function patch(n1, n2, container) {
        if (n1 && n1.type !== n2.type) {
            unmount(n1);
            n1 = null;
        }

        const {type} = n2;
        if (typeof type === 'string') {
            if (!n1) {
                mountElement(n2, container);
            } else {
                patchElement(n1, n2);
            }
        } else if (typeof type === 'object') {
            if (!n1) {
                mountComponent(n2, container, anchor);
            } else {
                patchComponent(n1, n2, anchor);
            }
        } else if (type === 'xxx') {

        }
    }

    function unmount(vnode) {
        const parent = vnode.el.parentNode;
        if (parent) {
            parent.removeChild(vnode.el);
        }
    }

    function shouldSetAsProps(el, key, value) {
        if (key === 'form' && el.tagName === 'INPUT') return false;

        return key in el
    }

    function patchProps(el, key, prevValue, nextValue) {
        // 用 in 操作符判断 key 是否存在对应的 DOM Properties
        if (/^on/.test(key)) {
            let invokers = el._vei || (el._vei = {});
            let invoker = invokers[key];

            const name = key.slice().toLowerCase();
            if (nextValue) {
                if (!invoker) {
                    // 如果没有 invoker，则将一个伪造的 invoker 缓存到 el._vei 中
                    // vei 是 vue event invoker
                    invoker = el._vei[key] = (e) => {
                        if (e.timeStamp < invoker.attached) return
                        if (Array.isArray(invoker.value)) {
                            invoker.value.forEach(fn => fn(e));
                        } else {
                            invoker.value(e);
                        }
                    }

                    invoker.attached = performance.now()
                    invoker.value = nextValue;
                    el.addEventListener(name, invoker);
                } else {
                    // 如果 invoker 存在，意味着更新，并且只需要更新 invoker.value 的值即可
                    invoker.value = nextValue;
                }
            } else if (invoker) {
                // 新的事件绑定函数不存在，且之前绑定的 invoker 存在，则移除绑定
                el.removeEventListener(name, invoker);
            }
        } else if (key === 'class') {
            el.className = nextValue;
        } else if (shouldSetAsProps(el, key, nextValue)) {
            const type = typeof el[key];

            if (type === 'boolean' && nextValue === '') {
                el[key] = true
            } else {
                el[key] = nextValue;
            }
        } else {
            // 如果要设置的属性没有对应的 DOM Properties，则使用 setAttribute 函数设置属性
            el.setAttribute(key, nextValue);
        }
    }

    function mountElement(vnode, container) {
        const el = vnode.el = createElement(vnode.type);

        if (typeof vnode.children === 'string') {
            setElementText(el, vnode.children);
        } else if (Array.isArray(vnode.children)) {
            vnode.children.forEach(child => {
                patch(null, child, el)
            })
        }

        if (vnode.props) {
            for (const key in vnode.props) {
                patchProps(el, key, null, vnode.props[key]);
            }
        }

        insert(el, container);
    }

    function patchElement(n1, n2) {
        const el = n2.el = n1.el;
        const oldProps = n1.props;
        const newProps = n2.props;

        // 第一步：更新 props
        for (const key in newProps) {
            if (newProps[key] !== oldProps[key]) {
                patchProps(el, key, oldProps[key], newProps[key])
            }
        }

        for (const key in oldProps) {
            if (!(key in newProps)) {
                patchProps(el, key, oldProps[key], null);
            }
        }

        // 第二步：更新 children
        patchChildren(n1, n2, el);
    }

    function patchChildren(n1, n2, container) {
        if (typeof n2.children === 'string') {
            // 旧子节点有3种可能：没有子节点，文本子节点和一组子节点

            if (Array.isArray(n1.children)) {
                n1.children.forEach(c => unmount(c));
            }

            setElementText(container, n2.children);
        } else if (Array.isArray(n2.children)) {
            if (Array.isArray(n1.children)) {
                // 代码运行到这里，则说明新旧子节点都是一组子节点，这里涉及核心的 diff 算法
                patchKeyedChildren(n1, n2, container);
            } else {
                setElementText(container, '');
                n2.children.forEach(c => patch(null, c, container));
            }
        } else {
            // 新节点不存在，卸了旧的即可

            if (Array.isArray(n1.children)) {
                n1.children.forEach(c => unmount(c));
            } else {
                setElementText(container, '');
            }
        }
    }

    function patchKeyedChildren(n1, n2, container) {
        const oldChildren = n1.children;
        const newChildren = n2.children;

        let oldStartIdx = 0;
        let oldEndIdx = oldChildren.length - 1;
        let newStartIdx = 0;
        let newEndIdx = newChildren.length - 1;

        let oldStartNode = oldChildren[oldStartIdx];
        let oldEndNode = oldChildren[oldEndIdx];
        let newStartNode = newChildren[newStartIdx];
        let newEndNode = newChildren[newEndIdx];

        while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
            if (!oldStartNode) {
                oldStartNode = oldChildren[++oldStartIdx]
            } else if (!oldEndNode) {
                oldEndNode = oldChildren[--oldEndIdx];
            } else if (oldStartNode.key === newStartNode.key) {
                patch(oldEndNode, newEndNode, container)
                oldStartNode = oldChildren[++oldStartIdx];
                newStartNode = newChildren[++newStartIdx];
            } else if (oldEndNode.key === newEndNode.key) {
                patch(oldEndNode, newEndNode, container)
                oldEndNode = oldChildren[--oldEndIdx];
                newEndNode = newChildren[--newEndIdx];
            } else if (oldStartNode.key === newEndNode.key) {
                patch(oldEndNode, newEndNode, container);
                insert(oldStartNode.el, container, oldEndNode.el.nextSibling);

                oldStartNode = oldChildren[++oldStartIdx];
                newEndNode = newChildren[--newEndIdx];
            } else if (oldEndNode.key === newStartNode.key) {
                patch(oldEndNode, newStartNode, container);
    
                // 移动 DOM 操作
                // oldEndNode.el 移动到 oldStartNode.el 前面
                insert(oldEndNode.el, container, oldStartNode.el);
    
                oldEndNode = oldChildren[--oldEndIdx];
                newStartNode = newChildren[++newStartIdx]
            } else {
                // 遍历旧的一组子节点，试图寻找与 newStartNode 拥有相同 key 值的节点
                // idxInOld 就是新的一组子节点的头部节点在旧的一组子节点中的索引
                const idxInOld = oldChildren.findIndex(
                    node => node.key === newStartNode.key
                );

                if (idxInOld > 0) {
                    const vnodeToMove = oldChildren[idxInOld];
                    patch(vnodeToMove, newStartNode, container);

                    insert(vnodeToMove.el, container, oldStartNode.el);

                    // 这里直接赋值 undefined 感觉不妥啊，这会导致上面的条件访问 key 的时候报错
                    oldChildren[idxInOld] = undefined;

                    newStartNode = newChildren[++newStartIdx]
                } else {
                    patch(null, newStartNode, container, oldStartNode.el);
                }

                newStartNode = newChildren[++newStartIdx]
            }
        }

        // 循环结束检查索引值的情况
        if (oldEndIdx < oldStartIdx && newStartIdx <= newEndIdx) {
            // 如果满足条件，说明有新的节点遗留，需要挂载它们
            for (let i = newStartIdx; i <= newEndIdx; i++) {
                const anchor = newChildren[newEndIdx + 1] ? newChildren[newEndIdx + 1].el : null;
                patch(null, newChildren[i], container, anchor);
            }
        } else if (newEndIdx < newStartIdx && oldStartIdx <= oldEndIdx) {
            for (let i = oldStartIdx; i <= oldEndIdx; i++) {
                unmount(oldChildren[i])
            }
        }
    }

    return {
        render
    }
}

const renderer = createRenderer({
    // 用于创建元素
    createElement(tag) {
        return document.createElement(tag);
    },
    setElementText(el, text) {
        el.textContent = text;
    },
    insert(el, parent, anchor = null) {
        parent.insertBefore(el, anchor);
    }
})

function patchKeyedChildren(n1, n2, container) {
    const newChildren = n2.children;
    const oldChildren = n1.children;

    let j = 0;
    let oldNode = oldChildren[j];
    let newNode = newChildren[j];

    while (oldNode.key === newNode.key) {
        patch(oldNode, newNode, container);
        j++;
        oldNode = oldChildren[j];
        newNode = newChildren[j];
    }

    let oldEnd = oldChildren.length - 1;
    let newEnd = newChildren.length - 1;

    oldNode = oldChildren[oldEnd];
    newNode = newChildren[newEnd];
    
    while (oldNode.key === newNode.key) {
        patch(oldNode, newNode, container);
        oldEnd--;
        newEnd--;
        oldNode = oldChildren[oldEnd];
        newNode = newChildren[newEnd];
    }

    if (j > oldEnd && j >= newEnd) {
        // 如果满足这个条件，则说明从 j-> newEnd 之间的节点应作为新节点插入
        // 即相当于旧节点都处理完了，
        const anchorIndex = newEnd + 1;
        const anchor = anchorIndex < newChildren.length ? newChildren[anchorIndex].el : null;

        while (j <= newEnd) {
            patch(null, newChildren[j++], container, anchor);
        }
    } else if (j > newEnd && j <= oldEnd) {
        // j -> oldEnd 之间的节点应该卸载
        while (j <= oldEnd) {
            unmount(oldChildren[j]);
        }
    } else {
        const count = newEnd - j + 1;
        const source = new Array(count);
        source.fill(-1);

        const oldStart = j;
        const newStart = j;

        // 新增两个变量 moved, pos
        let moved = false;
        let pos = 0;

        const keyIndex = {};

        for (let i = newStart; i <= newEnd; i++) {
            keyIndex[newChildren[i].key] = i;
        }

        // 新增 patched 变量，代表更新过的节点数量
        let patched = 0;
        for (let i = oldStart; i <= oldEnd; i++) {
            const oldNode = oldChildren[i];

            // 如果更新过的节点数量小雨等于需要更新的节点数量，则执行更新
            if (patched <= count) {
                const k = keyIndex[oldNode.key];

                if (typeof k !== 'undefined') {
                    newNode = newChildren[k];
                    patch(oldNode, newNode, container);
    
                    source[k - newStart] = i;
                    patched++;
    
                    // 判断节点是否需要移动
                    if (k < pos) {
                        moved = true;
                    } else {
                        pos = k;
                    }
                } else {
                    unmount(oldNode);
                }
            } else {
                unmount(oldNode);
            }
        }
    }
}

const queue = new Set();
let isFlushing = false;
const p = Promise.resolve();

function queueJob(job) {
    queue.add(job);

    if (!isFlushing) {
        isFlushing = true;
        p.then(() => {
            try {
                queue.forEach(job => job());
            } finally {
                isFlushing = false;
                queue.clear = 0
            }
        })
    }
}

let currentInstance;
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function mountComponent(vnode, container, anchor) {
    const componentOptions = vnode.type;
    let {
        render,
        data,
        beforeCreate,
        created,
        beforeMount,
        mounted,
        beforeUpdate,
        updated,
        props: propsOption,
        setup,
    } = componentOptions;

    // beforeCreate
    beforeCreate && beforeCreate();

    const state = reactive(data());
    const [props, attrs] = resolveProps(propsOption, vnode.props);

    const instance = {
        state,
        props: shallowReactive(props),
        isMounted: false,
        subTree: null,
        slots,
        mounted: [],
    };

    function emit(event, ...payload) {
        const eventName = `on${event[0].toUpperCase() + event.slice(1)}`;
        const handler = instance.props[eventName];
        if (handler) {
            handler(...payload);
        } else {
            console.error('')
        }
    }

    const setupContext = {attrs, emit, slots};

    setCurrentInstance(instance);

    const setupResult = setup(shallowReadonly(instance.props), setupContext);
    let setupState = null;

    if (typeof setupResult === 'function') {
        if (render) {
            console.error('setup 函数返回渲染函数，render 选项将忽略');
        }

        render = setupResult;
    } else {
        setupState = setupResult;
    }

    vnode.component = instance;

    const renderContext = new Proxy(instance, {
        get(t, k, r) {
            const {state, props} = t;
            if (state && k in state) {
                return state[k];
            } else if (k in props) {
                return props[k];
            } else if (setupState && k in setupState) {
                return setupState[k];
            } else if (key === '$slots') {
                return slots;
            } else {
                console.error('error')
            }
        },
        set(t, k, v, r) {
            const {state, props} = t;
            if (state && k in state) {
                state[k] = v;
            } else if (k in props) {
                console.warn('props readonly');
            } else if (setupState && k in setupState) {
                setupState[k] = v;
            } else {
                console.log('error')
            }
        }
    })

    created && created.call(renderContext);

    effect(() => {
        const subtree = render.call(state, state);

        if (!instance.isMounted) {
            // 初次挂载，第一个参数为 null

            beforeMount && beforeMount.call(state);
            patch(null, subtree, container, anchor);
            instance.isMounted = true;

            mounted && mounted.call(state);
        } else {

            beforeUpdate && beforeUpdate.call(state);
            patch(instance.subTree, subtree, container, anchor);

            updated && updated.call(state)
        }
        instance.subTree = subtree;
    }, {
        scheduler: queueJob
    });
}

function resolveProps(options, propsData) {
    const props = {};
    const attrs = {};

    for (const key in propsData) {
        if (key in options || key.startsWith('on')) {
            props[key] = propsData[key];
        } else {
            attrs[key] = propsData[key];
        }
    }

    return [props, attrs];
}

function patchComponent(n1, n2, anchor) {
    // 话说这里，不会导致 n2 当前的 component 丢失了吗，
    // 不过走到这里的都是 type 一致的，那应该就是同一个组件实例了吧
    const instance = (n2.component = n1.component);

    const {props} = instance;
    if (hasPropsChanged(n1.props, n2.props)) {
        const [nextProps] = resolveProps(n2.type.props, n2.props);

        for (const k in nextProps) {
            props[k] = nextProps[k];
        }

        for (const k in props) {
            if (!(k in nextProps)) {
                delete props[k];
            }
        }
    }
}

function hasPropsChanged(prevProps, nextProps) {
    const nextKeys = Object.keys(nextProps);

    if (nextKeys.length !== Object.keys(prevProps).length) {
        return true;
    }

    for (let i = 0; i < nextKeys.length; i++) {
        const key = nextKeys[i];
        if (nextProps[key] !== prevProps[key]) return true;
    }
    return false
}

function onMounted(fn) {
    if (currentInstance) {
        currentInstance.mounted.push(fn);
    } else {
        console.error()
    }
}

function defineAsyncComponent(options) {
    if (typeof options === 'function') {
        options = {
            loader: options
        }
    }

    const {loader} = options;
    let InnerComp = null;

    return {
        name: 'AsyncComponentWrapper',
        setup() {
            const loaded = ref(false);
            const error = shallowRef(null);

            loader().then(c => {
                InnerComp = c;
                loaded.value = true;
            }).catch(err => error.value = err);

            let timer = null;
            if (options.timeout) {
                timer = setTimeout(() => {
                    error.value = new Error('timeout');
                }, options.timeout);
            }

            onUnmounted(() => clearTimeout(timer));

            const placeholder = {
                type: Text,
                children: ''
            };

            return () => {
                if (loader.value) {
                    return {
                        type: InnerComp
                    }
                } else if (error.value && options.errorComponent) {
                    return {
                        type: options.errorComponent,
                        props: {
                            error: error.value
                        }
                    }
                }
                return placeholder
            }
        }
    }
}

const KeepAlive = {
    // KeepAlive 组件独有的属性，用作标识
    __isKeepAlive: true,
    setup(props, { slots }) {
        // 创建一个缓存对象
        // key: vnode.type，话说如果是普通 dom 节点怎么办，那不会覆盖吗
        // value: vnode
        const cache = new Map();

        // 当前 KeepAlive 组件的实例，为什么可以这样获取？
        const instance = currentInstance;

        // 对于 KeepAlive 组件来说，它的实例上存在特殊的 KeepAliveCtx 对象，该对象由渲染器注入
        // 该对象会暴露渲染器一些内部方法，其中 move 函数用来将一段 dom 移动到另一个容器中
        const { move, createElement } = instance.keepAliveCtx

        const storageContainer = createElement('div');

        instance._deActivate = (vnode) => {
            move(vnode, storageContainer);
        };

        instance._activate = (vnode, container, anchor) => {
            move(vnode, container, anchor);
        }

        return () => {
            let rawVnode = slots.default();
            // 如果不是组件，直接渲染即可，因为非组件的虚拟节点无法被 keepAlive
            if (typeof rawVnode.type !== 'object') {
                return rawVnode;
            }

            // 在挂载时先获取缓存的组件 vnode
            // 还有个问题啊，如果有两个类型相同的组件来回切换怎么办
            // 不对，每个组件的 vnode 节点应该都是不同的
            const cachedVNode = cache.get(rawVnode.type);
            if (cachedVNode) {
                // 如果有缓存的内容，则说明不应该执行挂载，而应该执行激活
                rawVnode.component = cachedVNode.component;
                // 在 vnode 上添加 keptAlive 属性，标记为 true, 避免渲染器重新挂载它
                rawVnode.keptAlive = true;
            } else {
                // 如果没有缓存，则将其添加到缓存中，
                cache.set(rawVnode.type, rawVnode);
            }

            // 在组件 vnode 上添加 shouldKeepAlive 属性，标记为 true, 避免渲染器真的将其卸载
            rawVnode.shouldKeepAlive = true;
            rawVnode.leepAliveInstance = instance;
            return rawVnode

        }
    }
}