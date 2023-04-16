import { distanceBetween2Points, MARGIN_ERROR } from './isClicked';
import { getLimitedExamTimes } from './quadraticCurve';
import { simulateBezierCurve } from './cubicCurve';
import { simulateCurve } from './quadraticCurve';
import { Manager } from '../manager';
export function isPointOnCurveOld(point, points) {
    var pointsNum = points.x.length;
    var numOfTest = Math.floor(distanceBetween2Points(points.x[0], points.y[0], points.x[pointsNum - 1], points.y[pointsNum - 1]) / MARGIN_ERROR);
    var $numOfTest = getLimitedExamTimes(numOfTest);
    var inc = 1 / $numOfTest;
    var t = inc;
    var fn = Manager.useCubicBezier
        ? simulateBezierCurve
        : simulateCurve;
    while (t < 1) {
        var lineX = fn.apply(void 0, points.x.concat([t]));
        var lineY = fn.apply(void 0, points.y.concat([t]));
        if (distanceBetween2Points(point.x, point.y, lineX, lineY) < MARGIN_ERROR)
            return true;
        t += inc;
    }
    return false;
}
//# sourceMappingURL=oldFashionedPointOnCurve.js.map