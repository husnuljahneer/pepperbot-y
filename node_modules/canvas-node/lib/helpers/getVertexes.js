export function getVertexesForRect(raw) {
    if (raw.length > 4)
        console.error('only support rect now!');
    var x = raw[0], y = raw[1], w = raw[2], h = raw[3];
    return [x, y, x + w, y, x + w, y + h, x, y + h];
}
//# sourceMappingURL=getVertexes.js.map