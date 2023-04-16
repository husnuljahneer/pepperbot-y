function random() {
    return parseInt(Date.now() + '' + Math.floor(Math.random() * 1000000), 16);
}
var PRIVATE_KEY = 'canvas-node-fn-key';
export var TAG_NAME = Symbol(PRIVATE_KEY);
export function tagFn(fn) {
    fn[TAG_NAME] = random();
    return fn;
}
export function inheritTag(source, target) {
    var tag = source[TAG_NAME];
    if (tag) {
        target[TAG_NAME] = tag;
    }
    return target;
}
export function isSameFn(fn1, fn2) {
    var fn1Tag = fn1[TAG_NAME];
    var fn2Tag = fn2[TAG_NAME];
    if (fn1Tag && fn2Tag) {
        return fn1Tag !== fn2Tag;
    }
    return fn1 !== fn2;
}
//# sourceMappingURL=tagFn.js.map