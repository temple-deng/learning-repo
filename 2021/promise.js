const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
    constructor(executor) {
        this.status = PENDING;
        this.value = undefined;
        this.reason = undefined;
        this.onFulfilledCb = [];
        this.onRejectedCb = [];

        try {
            executor(this.resolve, this.reject);
        } catch (e) {
            if (this.status === PENDING) {
                this.status = REJECTED;
                this.reason = e;
                this.execRejectedCb();
            } 
        }
    }

    then(onFulfilled, onRejected) {
        let retPromise;
        // 先考虑第一种情况，resolve -> then
        // 那第二种情况，then -> resolve
        if (typeof onFulfilled === 'function') {
            if (this.status === FULFILLED) {
                // 那这里就是第一种情况，如何包装
                this.onFulfilledCb = [];
                // 这个好像是可行的;
                retPromise = new MyPromise((resolve, reject) => {
                    try {
                        const ret = onFulfilled(this.value);
                        if (ret === retPromise) {
                            throw new Error();
                        }
                        resolve(ret);
                    } catch(e) {
                        reject(e);
                    }
                });
                return retPromise;
            } else {
                // 这是第二种情况，相当于绑定 then 的时候，还没有 resolve
                // 那这种怎么办
                // 这种情况下，执行过程是在别处的，怎么包装呢。。
                // 我们现在面临的问题是什么，现在的问题是，我想要拿到 onFulfilled 的返回值
                // 然后把它 resolve 返回了
                // 但是现在 onFulfilled 是异步执行的
                // 那理论上这个返回的 promise 也是要等的

                retPromise = new MyPromise((resolve, reject) => {
                    const oldFn = onFulfilled;
                    onFulfilled = (val) => {
                        try {
                            const ret = oldFn(val);
                            resolve(ret)
                        } catch (e) {
                            reject(e);
                        }
                    }
                    this.onFulfilledCb.push(onFulfilled);
                });

                return retPromise;
            }
        }

        if (typeof onRejected === 'function') {
            if (this.status === REJECTED) {
                this.onRejectedCb = [];
                retPromise = new MyPromise((resolve, reject) => {
                    try {
                        const ret = onRejectedCb(this.reason);
                        resolve(ret);
                    } catch(e) {
                        reject(e);
                    }
                });
                return retPromise;
            } else {
                retPromise = new MyPromise((resolve, reject) => {
                    const oldFn = onRejected;
                    onRejected = (val) => {
                        try {
                            const ret = oldFn(val);
                            resolve(ret)
                        } catch (e) {
                            reject(e);
                        }
                    }
                    this.onRejectedCb.push(onRejected);
                });

                return retPromise;
            }
        }

        return retPromise;
    }

    resolve = (value) => {
        if (this.status === PENDING) {
            this.status = FULFILLED;
            this.value = value;
            this.execFulfilledCb();
        }
    }

    reject = (reason) => {
        if (this.status === PENDING) {
            this.status = REJECTED;
            this.reason = reason;
            this.execRejectedCb();
        }
    }

    execFulfilledCb() {
        this.onFulfilledCb.forEach(cb => {
            try {
                cb(this.value);
            } catch (e) {
                // 
            }
        });
    }

    execRejectedCb() {
        this.onRejectedCb.forEach(cb => {
            try {
                cb(this.reason);
            } catch (e) {

            }
        });
    }
}

const pro = new MyPromise((resolve, reject) => {
    setTimeout(() => {
        resolve(6);
    }, 1000);
});

pro.then((val) => {
    console.log('hehe', val);
    return 'a';
}).then((v) => {
    console.log('hehe', v);
})

pro.then((val) => {
    console.log('xixi', val);
    return 'b';
}).then((v) => {
    console.log('xixi', v);
})

pro.then((val) => {
    console.log('emm', val);
    // throw new Error('errrrrrr')
}).then((v) => {
    console.log('emm', v);
}, (err) => {
    console.log('emm', err);
})
