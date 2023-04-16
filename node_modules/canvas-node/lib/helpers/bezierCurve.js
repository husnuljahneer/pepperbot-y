import { distanceBetween2Points, MARGIN_ERROR } from './isClicked';
export function simulateBezierCurve(p1, p2, p3, p4, t) {
    return (Math.pow(1 - t, 3) * p1 +
        3 * Math.pow(1 - t, 2) * t * p2 +
        3 * (1 - t) * Math.pow(t, 2) * p3 +
        Math.pow(t, 3) * p4);
}
export function getDirForBezierCurve(p1, p2, p3, p4, t) {
    return (3 * Math.pow(1 - t, 2) * (p2 - p1) +
        6 * (1 - t) * t * (p3 - p2) +
        3 * Math.pow(t, 2) * (p4 - p3));
}
function join(p1, p2, ratio) {
    if (ratio === void 0) { ratio = 0.5; }
    return (p1 + p2) * ratio;
}
export function getControlPoints(start, end) {
    var startX = start.x, startY = start.y;
    var endX = end.x, endY = end.y;
    var c1x = startX;
    var c1y = join(startY, endY, 0.33);
    var c2x = endX;
    var c2y = join(startY, endY, 0.66);
    return [
        {
            x: c1x,
            y: c1y
        },
        {
            x: c2x,
            y: c2y
        }
    ];
}
export function isPointOnBezierCurve(start, end, point) {
    var x = point.x, y = point.y;
    var startX = start.x, startY = start.y;
    var endX = end.x, endY = end.y;
    var controlPoints = getControlPoints(start, end);
    var _a = controlPoints[0], c1x = _a.x, c1y = _a.y;
    var _b = controlPoints[1], c2x = _b.x, c2y = _b.y;
    var numOfTest = Math.floor(distanceBetween2Points(startX, startY, endX, endY)) / 2;
    var inc = 1 / numOfTest;
    var t = inc;
    while (t < 1) {
        var lineX = simulateBezierCurve(startX, c1x, c2x, endX, t);
        var lineY = simulateBezierCurve(startY, c1y, c2y, endY, t);
        if (distanceBetween2Points(x, y, lineX, lineY) < MARGIN_ERROR)
            return true;
        t += inc;
    }
    return false;
}
//# sourceMappingURL=bezierCurve.js.map