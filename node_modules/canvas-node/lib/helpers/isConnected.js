import { ArrowNode } from '../arrow';
function hasArrowNode(node1, node2) {
    return [node1, node2].some(function (node) { return node instanceof ArrowNode; });
}
export function isConnected(node1, node2) {
    if (hasArrowNode(node1, node2))
        return false;
    var lines = node1.lines;
    return lines.some(function (line) {
        var match = line.from === node1 ? line.to : line.from;
        return match === node2;
    });
}
export function isConnectedSeq(node1, node2, isFromFirst) {
    if (isFromFirst === void 0) { isFromFirst = true; }
    if (hasArrowNode(node1, node2))
        return false;
    var lines = node1.lines;
    return lines.some(function (line) {
        var match = isFromFirst ? line.to : line.from;
        return match === node2;
    });
}
//# sourceMappingURL=isConnected.js.map