import { ArrowNode } from '../arrow';
import pointInPolygon from 'point-in-polygon';
import { Manager } from '../manager';
import { findFromRight } from './findFromRight';
import { isPointOnBezierCurve } from './cubicCurve';
import { isPointOnCurve } from './quadraticCurve';
import { isPointOnCurveOld } from './oldFashionedPointOnCurve';
export var MARGIN_ERROR = 4;
export function isPointInPolygon(vertexes, pos) {
    var poly = convertToPoly(vertexes);
    return isPointInPath(pos.x, pos.y, poly);
}
function isPointInPath(x, y, poly) {
    return pointInPolygon([x, y], poly);
}
function convertToPoly(vertexes) {
    return vertexes.reduce(function (last, vertex, i) {
        var pos = Math.floor(i / 2);
        if (!last[pos]) {
            last[pos] = [];
        }
        last[pos].push(vertex);
        return last;
    }, []);
}
export function distanceBetween2Points(x1, y1, x2, y2) {
    var squareDis = Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
    return Math.pow(squareDis, 0.5);
}
export function getClickedNode(pos) {
    var list = Manager.list;
    return findFromRight(list, function (node) {
        if (!node.display)
            return false;
        if (node instanceof ArrowNode) {
            if (Manager.useCubicBezier) {
                return isPointOnBezierCurve(node.pos, node.endPos, pos);
            }
            else {
                return isPointOnCurve(node.stops, pos);
            }
        }
        if (!node.vertexes)
            return false;
        return isPointInPolygon(node.vertexes, pos);
    });
}
export function getClickedBox(pos) {
    var list = Manager.list.filter(function (node) { return !(node instanceof ArrowNode) && node.display; });
    return findFromRight(list, function (node) { return isPointInPolygon(node.vertexes, pos); });
}
export function getClickedLine(pos) {
    var list = Manager.list.filter(function (node) { return node instanceof ArrowNode && node.display; });
    return findFromRight(list, function (node) {
        if (!preExamForLine(node, pos))
            return false;
        if (Manager.useCubicBezier) {
            return isPointOnBezierCurve(node.pos, node.endPos, pos);
        }
        else {
            return isPointOnCurve(node.stops, pos);
        }
    });
}
function formLineRect(line) {
    var _a = line.pos, startX = _a.x, startY = _a.y;
    var _b = line.endPos, endX = _b.x, endY = _b.y;
    var $startX = Math.min(startX, endX);
    var $startY = Math.min(startY, endY);
    var width = Math.abs(startX - endX);
    var height = Math.abs(startY - endY);
    return [$startX, $startY, width, height];
}
function preExamForLine(line, pos) {
    return isPointInPolygon(formLineRect(line), pos);
}
function avg(x, y, fix) {
    if (fix === void 0) { fix = 2; }
    return +((x + y) / 2).toFixed(fix);
}
var DIFF_MARGIN = 2;
export function binarySearch(point, start, end, count, curFn, fnArgs, limit) {
    if (limit === void 0) { limit = 100; }
    if (count > limit)
        return false;
    var pointsNum = fnArgs.x.length;
    var goRight = fnArgs.x[pointsNum - 1] > fnArgs.x[0];
    var mid = avg(start, end, 4);
    var xPointOnCurve = curFn.apply(void 0, fnArgs.x.concat([mid]));
    var diff = point.x - xPointOnCurve;
    var absDiff = Math.abs(diff);
    var newBoundary;
    var firstHalf = [start, mid];
    var secondHalf = [mid, end];
    if (absDiff < DIFF_MARGIN) {
        var yPointOnCurve = curFn.apply(void 0, fnArgs.y.concat([mid]));
        var diffY = point.y - yPointOnCurve;
        var absDiffY = Math.abs(diffY);
        if (absDiffY < DIFF_MARGIN) {
            return true;
        }
        else {
            var goUp = fnArgs.y[pointsNum - 1] < fnArgs.y[0];
            newBoundary =
                diffY > 0
                    ? goUp ? firstHalf : secondHalf
                    : goUp ? secondHalf : firstHalf;
        }
    }
    else {
        newBoundary =
            diff > 0
                ? goRight ? secondHalf : firstHalf
                : goRight ? firstHalf : secondHalf;
    }
    return binarySearch(point, newBoundary[0], newBoundary[1], count + 1, curFn, fnArgs, limit);
}
export function isPointOnLine(point, start, end, count, curFn, fnArgs, limit) {
    if (limit === void 0) { limit = 100; }
    if (Manager.safePointOnLine) {
        return isPointOnCurveOld(point, fnArgs);
    }
    else {
        return binarySearch(point, start, end, count, curFn, fnArgs, limit);
    }
}
//# sourceMappingURL=isClicked.js.map