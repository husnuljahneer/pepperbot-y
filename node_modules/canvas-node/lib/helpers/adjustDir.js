import { Manager } from '../manager';
export function getAdjustedDir(fn, distance) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    var argLen = args.length;
    var ratio = args[argLen - 1];
    if (ratio <= 0.6) {
        return fn.apply(void 0, args);
    }
    var newArgs = args.slice();
    newArgs.pop();
    var realDir = fn.apply(void 0, args);
    var pct = 2 * Manager.arrowH / distance;
    var balanceRatio = Math.max(Math.max(ratio - pct, 0), 0.5);
    newArgs.push(balanceRatio);
    var backDir = fn.apply(void 0, newArgs);
    return realDir * 0.5 + backDir * 0.5;
}
//# sourceMappingURL=adjustDir.js.map