import { getDirective, simulateCurve } from './quadraticCurve';
import { getControlPoints, getDirForBezierCurve, simulateBezierCurve } from './cubicCurve';
import { getAdjustedDir } from './adjustDir';
import { distanceBetween2Points } from './isClicked';
var MARGIN_ERROR = 5;
export var ARROW_H = 15;
function drawTriangle() {
    var triangle = new Path2D();
    triangle.moveTo(-ARROW_H, 0);
    triangle.lineTo(-ARROW_H, 5);
    triangle.lineTo(0, 0);
    triangle.lineTo(-ARROW_H, -5);
    triangle.closePath();
    return triangle;
}
function withInMargin(diff) {
    return Math.abs(diff) < MARGIN_ERROR;
}
function getDirection(start, end) {
    var startX = start.x, startY = start.y;
    var endX = end.x, endY = end.y;
    if (withInMargin(startY - endY)) {
        return startX > endX ? 'left' : 'right';
    }
    else if (withInMargin(startX - endX)) {
        return startY > endY ? 'top' : 'bottom';
    }
    else {
        return startY > endY ? 'top' : 'bottom';
    }
}
function getDirectionForStart(start, end) {
    var dir = getDirection(start, end);
    var startX = start.x, startY = start.y;
    var endX = end.x, endY = end.y;
    switch (dir) {
        case 'top':
        case 'bottom':
            if (withInMargin(startX - endX)) {
                return endY > startY ? 'top' : 'bottom';
            }
            return endX > startX ? 'left' : 'right';
        case 'left':
        case 'right':
            if (withInMargin(startY - endY)) {
                return endX > startX ? 'left' : 'right';
            }
            return endY > startY ? 'top' : 'bottom';
    }
}
export function calculateStop(x1, y1, x2, y2) {
    var dir = getDirection({
        x: x1,
        y: y1
    }, {
        x: x2,
        y: y2
    });
    switch (dir) {
        case 'top':
        case 'bottom':
            return [x2, y1];
        case 'left':
        case 'right':
            return [x1, y2];
        default:
            return [x1, y2];
    }
}
function fixRatio(ratio) {
    return Math.min(Math.max(0.001, ratio), 0.999);
}
export function drawLine(ctx, start, end, ratio, arrowPath, colorObj) {
    var style = colorObj.style, strokeStyle = colorObj.strokeStyle;
    var startX = start.x, startY = start.y;
    var endX = end.x, endY = end.y;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    var stop = calculateStop(startX, startY, endX, endY);
    ctx.quadraticCurveTo(stop[0], stop[1], endX, endY);
    var arrowX = simulateCurve(startX, stop[0], endX, fixRatio(ratio));
    var arrowY = simulateCurve(startY, stop[1], endY, fixRatio(ratio));
    var distance = distanceBetween2Points(startX, startY, endX, endY);
    var arrowDirX = getAdjustedDir(getDirective, distance, startX, stop[0], endX, fixRatio(ratio));
    var arrowDirY = getAdjustedDir(getDirective, distance, startY, stop[1], endY, fixRatio(ratio));
    var tan = arrowDirY / arrowDirX;
    var angle = Math.atan(tan);
    var goLeft = endX < startX;
    var rotateAngle = goLeft ? angle - Math.PI : angle;
    ctx.lineWidth = 2;
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
    ctx.save();
    ctx.translate(arrowX, arrowY);
    ctx.rotate(rotateAngle);
    var triangle = drawTriangle();
    ctx.fillStyle = style;
    ctx.fill(arrowPath || triangle);
    ctx.restore();
}
export function centralizePoint(node) {
    var _a = node.rawVertexes.slice(2), width = _a[0], height = _a[1];
    return {
        x: node.pos.x + width / 2,
        y: node.pos.y + height / 2
    };
}
export function placePointOnEdge(start, end, node, isStart) {
    if (isStart === void 0) { isStart = true; }
    var dir = isStart
        ? getDirectionForStart(start, end)
        : getDirection(start, end);
    return calculatePos(dir, node);
}
function calculatePos(dir, node) {
    var _a = node.rawVertexes.slice(2), width = _a[0], height = _a[1];
    var x;
    var y;
    switch (dir) {
        case 'bottom':
            x = node.pos.x + width / 2;
            y = node.pos.y;
            break;
        case 'top':
            x = node.pos.x + width / 2;
            y = node.pos.y + height;
            break;
        case 'right':
            x = node.pos.x;
            y = node.pos.y + height / 2;
            break;
        case 'left':
            x = node.pos.x + width;
            y = node.pos.y + height / 2;
            break;
    }
    return {
        x: x,
        y: y
    };
}
export function drawCubicBezier(ctx, start, end, ratio, arrowPath, colorObj) {
    var style = colorObj.style, strokeStyle = colorObj.strokeStyle;
    var startX = start.x, startY = start.y;
    var endX = end.x, endY = end.y;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    var controlPoints = getControlPoints(start, end);
    var _a = controlPoints[0], c1x = _a.x, c1y = _a.y;
    var _b = controlPoints[1], c2x = _b.x, c2y = _b.y;
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, endX, endY);
    var distance = distanceBetween2Points(startX, startY, endX, endY);
    var arrowX = simulateBezierCurve(startX, c1x, c2x, endX, fixRatio(ratio));
    var arrowY = simulateBezierCurve(startY, c1y, c2y, endY, fixRatio(ratio));
    var arrowDirX = getAdjustedDir(getDirForBezierCurve, distance, startX, c1x, c2x, endX, fixRatio(ratio));
    var arrowDirY = getAdjustedDir(getDirForBezierCurve, distance, startY, c1y, c2y, endY, fixRatio(ratio));
    var tan = arrowDirY / arrowDirX;
    var angle = Math.atan(tan);
    var goLeft = endX < startX;
    var rotateAngle = goLeft ? angle - Math.PI : angle;
    ctx.lineWidth = 2;
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
    ctx.save();
    ctx.translate(arrowX, arrowY);
    ctx.rotate(rotateAngle);
    var triangle = drawTriangle();
    ctx.fillStyle = style;
    ctx.fill(arrowPath || triangle);
    ctx.restore();
}
//# sourceMappingURL=drawArrow.js.map