import { isPointOnLine } from './isClicked';
export function simulateCurve(p0, p1, p2, t) {
    return Math.pow(1 - t, 2) * p0 + 2 * (1 - t) * t * p1 + Math.pow(t, 2) * p2;
}
export function getDirective(p0, p1, p2, t) {
    return 2 * (1 - t) * (p1 - p0) + 2 * t * (p2 - p1);
}
export function getLimitedExamTimes(times, limit) {
    if (limit === void 0) { limit = 150; }
    return Math.min(times, limit);
}
export function isPointOnCurve(poly, pos) {
    if (poly.length !== 3) {
        console.error('only support Quadratic Bézier curves for now');
        return false;
    }
    var start = poly[0], control = poly[1], end = poly[2];
    var startX = start[0], startY = start[1];
    var controlX = control[0], controlY = control[1];
    var endX = end[0], endY = end[1];
    return isPointOnLine(pos, 0, 1, 0, simulateCurve, {
        x: [startX, controlX, endX],
        y: [startY, controlY, endY]
    });
}
//# sourceMappingURL=quadraticCurve.js.map