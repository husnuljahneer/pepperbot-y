export function findFromRight(list, fn) {
    var len = list.length;
    var i = len - 1;
    while (i > -1) {
        var item = list[i];
        if (fn(item, i, list))
            return item;
        i--;
    }
}
//# sourceMappingURL=findFromRight.js.map