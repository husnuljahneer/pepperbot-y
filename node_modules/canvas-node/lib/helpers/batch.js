import { isUndef, isNull } from './types';
var PRIVATE_KEY = 'canvas-node';
var KEY_NAME = Symbol(PRIVATE_KEY);
var Batch = (function () {
    function Batch() {
    }
    Batch.add = function (fn, uniqueKey) {
        if (!isUndef(uniqueKey) && !isNull(uniqueKey)) {
            fn[KEY_NAME] = uniqueKey;
        }
        this.unify(uniqueKey, fn);
        this.batch();
    };
    Batch.includes = function (key) {
        return this.list.some(function (cb) {
            return cb[KEY_NAME] === key;
        });
    };
    Batch.unify = function (key, fn) {
        if (!key || !this.includes(key)) {
            this.list.push(fn);
        }
        else {
            this.list = this.list.map(function (cb) {
                if (cb[KEY_NAME] === key) {
                    return fn;
                }
                return cb;
            });
        }
    };
    Batch.batch = function () {
        var _this = this;
        cancelAnimationFrame(this.timer);
        if (this.list.length > this.limit) {
            this.invoke();
        }
        else {
            this.timer = requestAnimationFrame(function () {
                _this.invoke();
            });
        }
    };
    Batch.invoke = function () {
        var len = this.list.length;
        if (!len)
            return;
        var cb = this.list[Math.min(len - 1, this.limit - 1)];
        cb();
        this.list = [];
    };
    Batch.timer = 0;
    Batch.list = [];
    Batch.limit = 10;
    return Batch;
}());
export { Batch };
//# sourceMappingURL=batch.js.map