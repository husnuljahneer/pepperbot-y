export function isUndef(input) {
    return typeof input === 'undefined';
}
export function isNull(input) {
    return input === null;
}
export function isFn(input) {
    return typeof input === 'function';
}
export function isBoolean(input) {
    return typeof input === 'boolean';
}
export function isNum(input) {
    return typeof input === 'number' && !isNaN(input);
}
//# sourceMappingURL=types.js.map