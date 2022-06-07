class MyPromise {
    static PENDING = 'pending';
    static FULFILLED = 'fulfilled';
    static REJECTED = 'rejected';

    status = MyPromise.PENDING;
    result = null;
    reason = null;

    fulfilledCbs = [];
    rejectedCbs = [];

    constructor(executor) {
        try {
            executor(this.resolve, this.reject);
        } catch (e) {
            this.reject(e);
        }
    }

    then(onFulfilled, onRejected) {
        if (!onFulfilled || typeof onFulfilled !== 'function') {
            onFulfilled = value => value;
        }
        if (!onRejected || typeof onRejected !== 'function') {
            onRejected = value => value;
        }

        const resolvePromise = (promise, x, resolve, reject) => {
            if (promise === x) {
                throw new Error();
            }

            if (x instanceof MyPromise) {
                return resolve(x);
            }

            
        }

        const {status} = this;
        const newPromise = new Promise((resolve, reject) => {
            if (status === MyPromise.FULFILLED) {
                try {
                    let x = onFulfilled(this);
                    resolvePromise(newPromise, x, resolve, reject);
                } catch (e) {
                    reject(e);
                }
            } else if (status === MyPromise.REJECTED) {
            } else {
            }
        });

        return newPromise;
    }

    resolve = (value) => {
        if (this.status === MyPromise.PENDING) {
            this.status = MyPromise.FULFILLED;
            this.result = value;
            while (this.fulfilledCbs.length) {
                const cb = this.fulfilledCbs.shift();
                cb(this.result);
            }
        }
    }

    reject = (reason) => {
        if (this.status === MyPromise.PENDING) {
            this.status = MyPromise.REJECTED;
            this.reason = reason;
            while (this.rejectedCbs.length) {
                const cb = this.rejectedCbs.shift();
                cb(this.reason);
            }
        }
    }
}

export {}