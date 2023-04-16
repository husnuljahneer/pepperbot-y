(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function generateDefaultState() {
        return {
            stalled: false,
            args: [],
            callbacks: []
        };
    }
    var YEvent = /** @class */ (function () {
        function YEvent() {
            this.list = {};
        }
        YEvent.prototype.getState = function (type) {
            return this.list[type];
        };
        YEvent.prototype.setState = function (type, val) {
            this.list[type] = val;
        };
        YEvent.prototype.$on = function (type, cb) {
            if (!this.getState(type)) {
                this.setState(type, generateDefaultState());
            }
            var state = this.getState(type);
            state.callbacks.push(cb);
            if (state.stalled) {
                state.stalled = false;
                return cb.apply(void 0, state.args);
            }
        };
        YEvent.prototype.$emit = function (type) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var state = this.getState(type);
            if (!state)
                return;
            state.callbacks.forEach(function (cb) { return cb.apply(void 0, args); });
        };
        YEvent.prototype.$off = function (type, cb) {
            if (!cb) {
                delete this.list[type];
            }
            else {
                var cbs = this.list[type].callbacks;
                this.list[type].callbacks = cbs.filter(function (callback) { return callback !== cb; });
            }
        };
        YEvent.prototype.$always = function (type) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var state = this.getState(type);
            if (!state) {
                this.list[type] = generateDefaultState();
                var state_1 = this.getState(type);
                state_1.stalled = true;
                state_1.args = args;
                return;
            }
            if (state.stalled)
                return;
            state.callbacks.forEach(function (cb) { return cb.apply(void 0, args); });
        };
        YEvent.prototype.$once = function (type, cb) {
            var called = false;
            var fn = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                !called && cb.apply(void 0, args);
                called = true;
            };
            this.$on(type, fn);
        };
        return YEvent;
    }());
    exports.YEvent = YEvent;
    var e = new YEvent();
    exports.default = e;
});
