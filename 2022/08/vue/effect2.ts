export {}

const bucket = new WeakMap<object, Map<string | symbol, Set<any>>>();
let activeEffect;
const effectStack: any[] = [];

interface IEffectOptions {
    scheduler?: {
        (fn: () => any): void;
    },
    lazy?: boolean;
}

interface IEffectFn {
    (): any;
    deps: Set<() => any>[];
    options: IEffectOptions;
}

function cleanup(effectFn: IEffectFn) {
    for (let i = 0; i < effectFn.deps.length; i++) {
        const deps = effectFn.deps[i];
        deps.delete(effectFn);
    }
    effectFn.deps.length = 0;
}

function effect(fn, options: IEffectOptions = {}) {
    const effectFn: IEffectFn = () => {
        cleanup(effectFn);
        activeEffect = fn;
        effectStack.push(effectFn);
        const ret = fn();
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1];
        return ret;
    };

    effectFn.options = options;
    effectFn.deps = [];

    if (!options.lazy) {
        effectFn();
    }
    return effectFn;
}

function track(target, key) {
    if (!activeEffect) {
        return
    }

    let depsMap = bucket.get(target);
    if (!depsMap) {
        bucket.set(target, (depsMap = new Map()));
    }

    let deps = depsMap.get(key);

    if (!deps) {
        depsMap.set(key, (deps = new Set()));
    }

    activeEffect.deps.push(deps);
    deps.add(activeEffect);
}

const ITERATE_KEY = Symbol();

function trigger(target, key, type = 'SET') {
    const depsMap = bucket.get(target);

    if (!depsMap) return;

    const effectsToRun = new Set<IEffectFn>();
    const effects = depsMap.get(key);
    
    effects && effects.forEach((fn) => {
        if (fn !== activeEffect) {
            effectsToRun.add(fn);
        }
    });

    if (type === 'ADD' || type === 'DELETE') {
        const iterateEffects = depsMap.get(ITERATE_KEY);
        iterateEffects && iterateEffects.forEach(fn => {
            if (fn !== activeEffect) {
                effectsToRun.add(fn);
            }
        })
    }

    effectsToRun.forEach(fn => {
        if (fn.options.scheduler) {
            fn.options.scheduler(fn);
        } else {
            fn();
        }
    });
}


const obj = new Proxy(data, {
    get(target, key: string, receiver) {
        track(target, key);
        return Reflect.get(target, key, receiver);
    },

    set(target, key: string, value, receiver) {
        const type = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD';

        const ret = Reflect.set(target, key, value, receiver);
        trigger(target, key, type);
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
        const hadKey = Object.prototype.hasOwnProperty.call(target, key);
        const ret = Reflect.deleteProperty(target, key);

        if (ret && hadKey) {
            trigger(target, key, 'DELETE');
        }
        return ret;
    }
});

function createReactive(data: Record<string | symbol, any>, isShallow = false) {
    return new Proxy(data, {
        get(target, key: string, receiver) {
            if (key === 'raw') {
                return target;
            }

            track(target, key);
            const ret = Reflect.get(target, key, receiver);

            if (isShallow) {
                return ret;
            }

            if (typeof ret === 'object' && ret !== null) {
                return reactive(ret);
            }
            return ret;
        },
    
        set(target, key: string, value, receiver) {
            const oldValue = target[key];
            const type = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD';
    
            const ret = Reflect.set(target, key, value, receiver);

            if (target === receiver.raw) {
                if (oldValue !== value && (oldValue === oldValue || value === value)) {
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
            const hadKey = Object.prototype.hasOwnProperty.call(target, key);
            const ret = Reflect.deleteProperty(target, key);
    
            if (ret && hadKey) {
                trigger(target, key, 'DELETE');
            }
            return ret;
        }
    });
}

function reactive(data) {
    return createReactive(data);
}

function shallowReactive(data) {
    return createReactive(data, true);
}


function computed(getter) {
    let dirty = true;
    let value;
    const effectFn = effect(getter, {
        lazy: true,
        scheduler(fn) {
            dirty = true;
            trigger(obj, 'value');
        }
    });

    const obj = {
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

interface IWatchOptions {
    immediate?: boolean;
}

function watch(source, callback: (...args: any[]) => void, options: IWatchOptions = {}) {
    let getter;
    let cleanup;

    if (typeof source === 'function') {
        getter = source;
    } else {
        getter = () => traverse(source);
    }

    let oldValue, newValue;

    function onInvalidate(fn) {
        cleanup = fn;
    }

    const job = () => {
        newValue = effectFn();
        if (cleanup) {
            cleanup();
        }
        callback(newValue, oldValue, onInvalidate);
        oldValue = newValue;
    };

    const effectFn = effect(() => getter(), {
        lazy: true,
        scheduler: job,
    });

    if (options.immediate) {
        job();
    } else {
        oldValue = effectFn();
    }
}


function traverse(value, seen = new Set()) {
    if (typeof value !== 'object' || value === null || seen.has(value)) {
        return;
    }

    seen.add(value);

    for (const k in value) {
        traverse(value[k], seen);
    }

    return value;
}


function ref(value) {
    const wrapper = {
        value
    };

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
        set value(val) {
            object[key] = val;
        }
    }
    Object.defineProperty(wrapper, '__v_isRef', {
        value: true
    });

    return wrapper;
}

function toRefs(object) {
    const ret = {};

    for (const k in object) {
        ret[k] = toRef(object, k);
    }

    return ret;
}