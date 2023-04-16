(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.CanvasNode = factory());
}(this, (function () { 'use strict';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = Object.setPrototypeOf ||
    ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function getVertexesForRect(raw) {
    if (raw.length > 4)
        console.error('only support rect now!');
    var x = raw[0], y = raw[1], w = raw[2], h = raw[3];
    return [x, y, x + w, y, x + w, y + h, x, y + h];
}

var pointInPolygon = function (point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    
    var x = point[0], y = point[1];
    
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
};

function findFromRight(list, fn) {
    var len = list.length;
    var i = len - 1;
    while (i > -1) {
        var item = list[i];
        if (fn(item, i, list))
            return item;
        i--;
    }
}

function simulateBezierCurve(p1, p2, p3, p4, t) {
    return (Math.pow(1 - t, 3) * p1 +
        3 * Math.pow(1 - t, 2) * t * p2 +
        3 * (1 - t) * Math.pow(t, 2) * p3 +
        Math.pow(t, 3) * p4);
}
function getDirForBezierCurve(p1, p2, p3, p4, t) {
    return (3 * Math.pow(1 - t, 2) * (p2 - p1) +
        6 * (1 - t) * t * (p3 - p2) +
        3 * Math.pow(t, 2) * (p4 - p3));
}
function join(p1, p2, ratio) {
    if (ratio === void 0) { ratio = 0.5; }
    return p1 + (p2 - p1) * ratio;
}
function getControlPoints(start, end) {
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
function isPointOnBezierCurve(start, end, point) {
    var startX = start.x, startY = start.y;
    var endX = end.x, endY = end.y;
    var controlPoints = getControlPoints(start, end);
    var _a = controlPoints[0], c1x = _a.x, c1y = _a.y;
    var _b = controlPoints[1], c2x = _b.x, c2y = _b.y;
    return isPointOnLine(point, 0, 1, 0, simulateBezierCurve, {
        x: [startX, c1x, c2x, endX],
        y: [startY, c1y, c2y, endY]
    });
}

function isPointOnCurveOld(point, points) {
    var pointsNum = points.x.length;
    var numOfTest = Math.floor(distanceBetween2Points(points.x[0], points.y[0], points.x[pointsNum - 1], points.y[pointsNum - 1]) / MARGIN_ERROR$1);
    var $numOfTest = getLimitedExamTimes(numOfTest);
    var inc = 1 / $numOfTest;
    var t = inc;
    var fn = Manager.useCubicBezier
        ? simulateBezierCurve
        : simulateCurve;
    while (t < 1) {
        var lineX = fn.apply(void 0, points.x.concat([t]));
        var lineY = fn.apply(void 0, points.y.concat([t]));
        if (distanceBetween2Points(point.x, point.y, lineX, lineY) < MARGIN_ERROR$1)
            return true;
        t += inc;
    }
    return false;
}

var MARGIN_ERROR$1 = 4;
function isPointInPolygon(vertexes, pos) {
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
function distanceBetween2Points(x1, y1, x2, y2) {
    var squareDis = Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
    return Math.pow(squareDis, 0.5);
}
function getClickedNode(pos) {
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
function getClickedBox(pos) {
    var list = Manager.list.filter(function (node) { return !(node instanceof ArrowNode) && node.display; });
    return findFromRight(list, function (node) { return isPointInPolygon(node.vertexes, pos); });
}
function getClickedLine(pos) {
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
function binarySearch(point, start, end, count, curFn, fnArgs, limit) {
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
function isPointOnLine(point, start, end, count, curFn, fnArgs, limit) {
    if (limit === void 0) { limit = 100; }
    if (Manager.safePointOnLine) {
        return isPointOnCurveOld(point, fnArgs);
    }
    else {
        return binarySearch(point, start, end, count, curFn, fnArgs, limit);
    }
}

function simulateCurve(p0, p1, p2, t) {
    return Math.pow(1 - t, 2) * p0 + 2 * (1 - t) * t * p1 + Math.pow(t, 2) * p2;
}
function getDirective(p0, p1, p2, t) {
    return 2 * (1 - t) * (p1 - p0) + 2 * t * (p2 - p1);
}
function getLimitedExamTimes(times, limit) {
    if (limit === void 0) { limit = 150; }
    return Math.min(times, limit);
}
function isPointOnCurve(poly, pos) {
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

function getAdjustedDir(fn, distance) {
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

var MARGIN_ERROR = 5;
var ARROW_H = 15;
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
function calculateStop(x1, y1, x2, y2) {
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
function drawLine(ctx, start, end, ratio, arrowPath, colorObj) {
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
function centralizePoint(node) {
    var _a = node.rawVertexes.slice(2), width = _a[0], height = _a[1];
    return {
        x: node.pos.x + width / 2,
        y: node.pos.y + height / 2
    };
}
function placePointOnEdge(start, end, node, isStart) {
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
function drawCubicBezier(ctx, start, end, ratio, arrowPath, colorObj) {
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

function random() {
    return parseInt(Date.now() + '' + Math.floor(Math.random() * 1000000), 16);
}
var PRIVATE_KEY = 'canvas-node-fn-key';
var TAG_NAME = Symbol(PRIVATE_KEY);
function tagFn(fn) {
    fn[TAG_NAME] = random();
    return fn;
}
function inheritTag(source, target) {
    var tag = source[TAG_NAME];
    if (tag) {
        target[TAG_NAME] = tag;
    }
    return target;
}
function isSameFn(fn1, fn2) {
    var fn1Tag = fn1[TAG_NAME];
    var fn2Tag = fn2[TAG_NAME];
    if (fn1Tag && fn2Tag) {
        return fn1Tag !== fn2Tag;
    }
    return fn1 !== fn2;
}

var EventManager = (function () {
    function EventManager() {
    }
    EventManager.add = function (el, type, cb) {
        var item = findEventItem(el, type);
        if (!item) {
            item = {
                el: el,
                type: type,
                cbs: []
            };
        }
        item.cbs.push(cb);
        this.list.push(item);
    };
    EventManager.remove = function (el, type, cb) {
        var item = findEventItem(el, type);
        if (!item)
            return;
        if (!cb) {
            item.cbs = [];
        }
        else {
            item.cbs = item.cbs.filter(function (oldCb) { return isSameFn(oldCb, cb); });
        }
    };
    EventManager.list = [];
    return EventManager;
}());
function findEventItem(el, type) {
    return EventManager.list.find(function (item) { return item.el === el && item.type === type; });
}
function addEvent(el, type, cb) {
    var item = findEventItem(el, type);
    if (!item) {
        el.addEventListener(type, function handler(e) {
            var cbs = findEventItem(el, type).cbs;
            cbs.forEach(function (cb) {
                cb(e);
            });
        });
    }
    EventManager.add(el, type, cb);
}
function removeEvent(el, type, cb) {
    EventManager.remove(el, type, cb);
}

function generateDefaultState() {
    return {
        stalled: false,
        args: [],
        callbacks: []
    };
}
class YEvent {
    constructor() {
        this.list = {};
    }
    getState(type) {
        return this.list[type];
    }
    setState(type, val) {
        this.list[type] = val;
    }
    $on(type, cb) {
        if (!this.getState(type)) {
            this.setState(type, generateDefaultState());
        }
        const state = this.getState(type);
        state.callbacks.push(cb);
        if (state.stalled) {
            state.stalled = false;
            return cb(...state.args);
        }
    }
    $emit(type, ...args) {
        const state = this.getState(type);
        if (!state)
            return;
        state.callbacks.forEach(cb => cb(...args));
    }
    $off(type, cb) {
        if (!cb) {
            delete this.list[type];
        }
        else {
            const cbs = this.list[type].callbacks;
            this.list[type].callbacks = cbs.filter(callback => callback !== cb);
        }
    }
    $always(type, ...args) {
        const state = this.getState(type);
        if (!state) {
            this.list[type] = generateDefaultState();
            const state = this.getState(type);
            state.stalled = true;
            state.args = args;
            return;
        }
        if (state.stalled)
            return;
        state.callbacks.forEach(cb => cb(...args));
    }
    $once(type, cb) {
        let called = false;
        let fn = function (...args) {
            !called && cb(...args);
            called = true;
        };
        this.$on(type, fn);
    }
}
const e = new YEvent();

var NORMALIZE_LIST = ['mousemove', 'mouseout'];
var queue = [null, null];
var inOutList = {
    ins: [],
    outs: []
};
e.$on('change', function (e$$1) {
    var newTarget = getNewTarget();
    var oldTarget = getOldTarget();
    if (newTarget instanceof CanvasNode) {
        inOutList.ins.forEach(function (cb) { return cb(e$$1, newTarget); });
    }
    if (oldTarget instanceof CanvasNode) {
        inOutList.outs.forEach(function (cb) { return cb(e$$1, oldTarget); });
    }
});
function updateTarget(target) {
    if (queue.length > 1) {
        queue.shift();
    }
    queue.push(target);
}
function hasChanged() {
    return queue[0] !== queue[1];
}
function getOldTarget() {
    return queue[0];
}
function getNewTarget() {
    return queue[1];
}
function shouldNormalizeEvent(type) {
    return NORMALIZE_LIST.includes(type);
}
function normalizeEvent(type, cb) {
    switch (type) {
        case 'mousemove':
            return generateMouseMoveHandler(cb);
        case 'mouseout':
            return generateMouseOutHandler(cb);
    }
}
function normalizeEventType(type) {
    if (type === 'mouseout')
        return 'mousemove';
    return type;
}
function generateMouseMoveHandler(cb) {
    inOutList.ins.push(cb);
    return function handler(e$$1) {
        var pos = {
            x: e$$1.offsetX,
            y: e$$1.offsetY
        };
        var node = getClickedNode(pos);
        updateTarget(node);
        if (hasChanged()) {
            e.$emit('change', e$$1);
        }
    };
}
function generateMouseOutHandler(cb) {
    inOutList.outs.push(cb);
    return function handler(e$$1) {
        var pos = {
            x: e$$1.offsetX,
            y: e$$1.offsetY
        };
        var node = getClickedNode(pos);
        updateTarget(node);
        if (hasChanged()) {
            e.$emit('change', e$$1);
        }
    };
}

var NodeEventManager = (function () {
    function NodeEventManager() {
    }
    NodeEventManager.add = function (type, cb) {
        var item = this.getItem(type);
        if (!item) {
            item = {
                type: type,
                cbs: [cb]
            };
            this.list.push(item);
        }
        else {
            item.cbs.push(cb);
        }
    };
    NodeEventManager.getCbs = function (type) {
        return this.getItem(type).cbs;
    };
    NodeEventManager.getItem = function (type) {
        return this.list.find(function (item) { return item.type === type; });
    };
    NodeEventManager.remove = function (type, cb) {
        if (!cb) {
            this.list = this.list.filter(function (item) { return item.type !== type; });
        }
        else {
            var item = this.getItem(type);
            if (!item)
                return;
            item.cbs = item.cbs.filter(function (oldCb) { return isSameFn(oldCb, cb); });
        }
    };
    NodeEventManager.list = [];
    return NodeEventManager;
}());
function listenToNodeEvent(type, cb) {
    var $type = normalizeEventType(type);
    var fn;
    if (shouldNormalizeEvent(type)) {
        fn = normalizeEvent(type, cb);
    }
    else {
        fn = eventHandler;
    }
    function eventHandler(e) {
        var pos = {
            x: e.offsetX,
            y: e.offsetY
        };
        var target = getClickedNode(pos);
        if (!target)
            return;
        cb(e, target);
    }
    inheritTag(cb, fn);
    addEvent(Manager.canvas, $type, fn);
    NodeEventManager.add(type, fn);
}
function removeNodeEvent(type, cb) {
    var $type = normalizeEventType(type);
    if (cb) {
        removeEvent(Manager.canvas, $type, cb);
        NodeEventManager.remove(type, cb);
    }
    else {
        NodeEventManager.getCbs(type).forEach(function (cb) {
            removeEvent(Manager.canvas, $type, cb);
        });
        NodeEventManager.remove(type);
    }
}

function isUndef(input) {
    return typeof input === 'undefined';
}
function isNull(input) {
    return input === null;
}
function isFn(input) {
    return typeof input === 'function';
}
function isBoolean(input) {
    return typeof input === 'boolean';
}
function isNum(input) {
    return typeof input === 'number' && !isNaN(input);
}

var PRIVATE_KEY$1 = 'canvas-node';
var KEY_NAME = Symbol(PRIVATE_KEY$1);
var Batch = (function () {
    function Batch() {
    }
    Batch.add = function (fn, uniqueKey) {
        if (!isUndef(uniqueKey) && !isNull(uniqueKey)) {
            fn[KEY_NAME] = uniqueKey;
        }
        this.unify(uniqueKey, fn);
        this.batch();
    };
    Batch.includes = function (key) {
        return this.list.some(function (cb) {
            return cb[KEY_NAME] === key;
        });
    };
    Batch.unify = function (key, fn) {
        if (!key || !this.includes(key)) {
            this.list.push(fn);
        }
        else {
            this.list = this.list.map(function (cb) {
                if (cb[KEY_NAME] === key) {
                    return fn;
                }
                return cb;
            });
        }
    };
    Batch.batch = function () {
        var _this = this;
        cancelAnimationFrame(this.timer);
        if (this.list.length > this.limit) {
            this.invoke();
        }
        else {
            this.timer = requestAnimationFrame(function () {
                _this.invoke();
            });
        }
    };
    Batch.invoke = function () {
        var len = this.list.length;
        if (!len)
            return;
        var cb = this.list[Math.min(len - 1, this.limit - 1)];
        cb();
        this.list = [];
    };
    Batch.timer = 0;
    Batch.list = [];
    Batch.limit = 10;
    return Batch;
}());

function defaultData() {
    return {
        font: '14px Arial',
        style: '#fff',
        strokeStyle: '#000',
        color: '#000',
        data: {},
        display: true,
        exist: true,
        lineWidth: 2
    };
}
var CanvasNode = (function () {
    function CanvasNode(option) {
        this.drawCbs = [];
        this.beforeDrawCbs = [];
        this.lines = [];
        this.autoUpdateFields = [
            'font',
            'size',
            'style',
            'strokeStyle',
            'color',
            'text',
            'pos',
            'endPos',
            'display',
            'exist',
            'lineWidth'
        ];
        this.hoverInCb = [];
        this.hoverOutCb = [];
        this.clickCb = [];
        this.watchList = {};
        this.proxy();
        Object.assign(this, defaultData(), option, {
            ctx: Manager.ctx,
            size: Manager.size
        });
        this.$moveTo(this.pos);
        Manager.add(this);
    }
    CanvasNode.prototype.proxy = function () {
        var _this = this;
        this.autoUpdateFields.forEach(function (key) {
            Object.defineProperty(_this, key, {
                get: function () {
                    return this['$' + key];
                },
                set: function (val) {
                    var _this = this;
                    var oldVal = this['$' + key];
                    this['$' + key] = val;
                    var watchList = this.watchList[key];
                    if (watchList) {
                        watchList.forEach(function (cb) { return cb(val, oldVal); });
                    }
                    if (val === oldVal)
                        return;
                    Batch.add(function () {
                        _this.draw();
                    }, this);
                }
            });
        });
    };
    Object.defineProperty(CanvasNode.prototype, "vertexes", {
        get: function () {
            var _this = this;
            if (!this.rawVertexes)
                return;
            var rawData = this.rawVertexes.map(function (vertex, i) {
                var pos = i === 0 ? 'x' : i === 1 ? 'y' : 'z';
                return i < 2 ? vertex + _this.pos[pos] : vertex;
            });
            return getVertexesForRect(rawData);
        },
        enumerable: true,
        configurable: true
    });
    CanvasNode.prototype.moveTo = function (pos) {
        Manager.moveTo(this, pos);
    };
    CanvasNode.prototype.$moveTo = function (pos) {
        this.updatePos(pos);
        this.updateLinePos();
    };
    CanvasNode.prototype.$draw = function () {
        if (!this.display)
            return;
        this.ctx.lineWidth = this.lineWidth;
        this.invokeDrawCbAbs('beforeDrawCbs');
        this.ctx.save();
        this.ctx.translate(this.pos.x, this.pos.y);
        this.drawBorder();
        this.fill();
        this.fillText();
        this.ctx.restore();
        this.invokeDrawCbAbs('drawCbs');
    };
    CanvasNode.prototype.draw = function (cleanFirst) {
        if (cleanFirst === void 0) { cleanFirst = true; }
        Manager.draw(cleanFirst);
    };
    CanvasNode.prototype.updatePos = function (pos) {
        this.pos = pos;
    };
    CanvasNode.prototype.drawBorder = function () {
        if (!this.path)
            return;
        this.ctx.strokeStyle = this.strokeStyle;
        this.ctx.stroke(this.path);
    };
    CanvasNode.prototype.fill = function () {
        if (!this.path)
            return;
        this.ctx.fillStyle = this.style;
        this.ctx.fill(this.path);
    };
    CanvasNode.prototype.fillText = function (text) {
        if (text === void 0) { text = this.text; }
        if (!this.path)
            return;
        var $text = typeof text === 'string' ? text : this.text;
        var _a = this.rawVertexes.slice(2), width = _a[0], height = _a[1];
        this.ctx.font = this.font;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.save();
        this.ctx.translate(width / 2, height / 2);
        this.ctx.fillStyle = this.color || '#000';
        this.ctx.fillText($text, 0, 0);
        this.updateText($text);
        this.ctx.restore();
    };
    CanvasNode.prototype.updateText = function (text) {
        this.text = text;
    };
    CanvasNode.prototype.invokeDrawCbAbs = function (type) {
        var _this = this;
        this[type].forEach(function (cb) {
            _this.ctx.save();
            cb(_this);
            _this.ctx.restore();
        });
    };
    CanvasNode.prototype.addLine = function (line) {
        this.lines.push(line);
    };
    CanvasNode.prototype.updateLinePos = function () {
        var _this = this;
        this.lines.forEach(function (line) {
            switch (_this) {
                case line.from:
                    line.pos = isFn(_this.updateLineCb)
                        ? _this.updateLineCb(_this, line, true)
                        : isFn(Manager.updateLineCb)
                            ? Manager.updateLineCb(_this, line, true)
                            : centralizePoint(_this);
                    break;
                case line.to:
                    line.endPos = isFn(_this.updateLineCb)
                        ? _this.updateLineCb(_this, line, false)
                        : isFn(Manager.updateLineCb)
                            ? Manager.updateLineCb(_this, line, false)
                            : centralizePoint(_this);
                    break;
            }
        });
    };
    CanvasNode.prototype.remove = function (node) {
        if (node && node instanceof CanvasNode) {
            node.destroy();
        }
        this.destroy();
    };
    CanvasNode.prototype.$remove = function () {
        Manager.deleteNode(this);
        this.exist = false;
    };
    CanvasNode.prototype.forEach = function (fn) {
        Manager.list.forEach(fn);
    };
    CanvasNode.prototype.addDrawCb = function (cb) {
        this.drawCbs.push(cb);
    };
    CanvasNode.prototype.addBeforeDrawCb = function (cb) {
        this.beforeDrawCbs.push(cb);
    };
    CanvasNode.prototype.hover = function (inCb, outCb) {
        var _this = this;
        var $inCb = function (e, node) {
            if (node !== _this)
                return;
            inCb(e, node);
        };
        tagFn($inCb);
        listenToNodeEvent('mousemove', $inCb);
        this.hoverInCb.push($inCb);
        if (!outCb)
            return;
        var $outCb = function (e, node) {
            if (node !== _this)
                return;
            outCb(e, node);
        };
        tagFn($outCb);
        listenToNodeEvent('mouseout', $outCb);
        this.hoverOutCb.push($outCb);
    };
    CanvasNode.prototype.click = function (clickCb) {
        var _this = this;
        var $clickCb = function (e, node) {
            if (node !== _this)
                return;
            clickCb(e, node);
        };
        tagFn($clickCb);
        listenToNodeEvent('click', $clickCb);
        this.clickCb.push($clickCb);
    };
    CanvasNode.prototype.hide = function () {
        this.display = false;
    };
    CanvasNode.prototype.show = function () {
        this.display = true;
    };
    CanvasNode.prototype.watch = function (key, cb) {
        if (!this.watchList[key]) {
            this.watchList[key] = [];
        }
        this.watchList[key].push(cb);
    };
    CanvasNode.prototype.destroy = function () {
        this.$remove();
        this.hoverInCb.forEach(function (cb) {
            removeNodeEvent('mousemove', cb);
        });
        this.hoverOutCb.forEach(function (cb) {
            removeNodeEvent('mouseout', cb);
        });
        this.clickCb.forEach(function (cb) {
            removeNodeEvent('click', cb);
        });
    };
    return CanvasNode;
}());

function getDefaultOption() {
    return {
        ratio: 0.5
    };
}
var ArrowNode = (function (_super) {
    __extends(ArrowNode, _super);
    function ArrowNode(option) {
        return _super.call(this, Object.assign({}, getDefaultOption(), option)) || this;
    }
    Object.defineProperty(ArrowNode.prototype, "stops", {
        get: function () {
            var stop = calculateStop(this.pos.x, this.pos.y, this.endPos.x, this.endPos.y);
            return [[this.pos.x, this.pos.y], stop, [this.endPos.x, this.endPos.y]];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ArrowNode.prototype, "colorObj", {
        get: function () {
            return {
                strokeStyle: this.strokeStyle,
                style: this.style
            };
        },
        enumerable: true,
        configurable: true
    });
    ArrowNode.prototype.$moveTo = function (end) {
        this.updateEndPos(end);
    };
    ArrowNode.prototype.$draw = function () {
        var fn = Manager.useCubicBezier ? drawCubicBezier : drawLine;
        fn(this.ctx, this.pos, this.endPos, this.ratio, Manager.arrowPath || this.arrowPath, this.colorObj);
    };
    ArrowNode.prototype.updateEndPos = function (end) {
        this.endPos = end;
    };
    ArrowNode.prototype.connect = function (from, to) {
        var _this = this;
        this.from = from;
        this.to = to;
        [from, to].forEach(function (node) {
            node.addLine(_this);
        });
    };
    ArrowNode.prototype.abort = function () {
        Manager.deleteNode(this);
        Manager.draw();
    };
    return ArrowNode;
}(CanvasNode));

var Manager = (function () {
    function Manager() {
    }
    Manager.init = function (option) {
        var canvas = option.canvas, updateLineCb = option.updateLineCb, arrowPath = option.arrowPath, useCubicBezier = option.useCubicBezier, safePointOnLine = option.safePointOnLine, arrowH = option.arrowH;
        var size = {
            x: canvas.width,
            y: canvas.height
        };
        var ctx = canvas.getContext('2d');
        this.size = size;
        this.ctx = ctx;
        this.canvas = canvas;
        this.updateLineCb = updateLineCb;
        this.arrowPath = arrowPath;
        this.useCubicBezier = isBoolean(useCubicBezier) ? useCubicBezier : false;
        this.safePointOnLine = isBoolean(safePointOnLine) ? safePointOnLine : false;
        this.arrowH = isNum(arrowH) ? arrowH : ARROW_H;
    };
    Manager.add = function (node) {
        this.list.push(node);
    };
    Manager.clean = function () {
        this.ctx.clearRect(0, 0, this.size.x, this.size.y);
    };
    Manager.draw = function (cleanFirst) {
        if (cleanFirst === void 0) { cleanFirst = true; }
        cleanFirst && this.clean();
        this.ctx.save();
        this.list.forEach(function (node) { return node.$draw(); });
        this.ctx.restore();
    };
    Manager.moveTo = function (target, pos) {
        this.ctx.clearRect(0, 0, this.size.x, this.size.y);
        this.ctx.save();
        var isArrowNode = target instanceof ArrowNode;
        var list = this.list.reduce(function (last, node) {
            if (node instanceof ArrowNode) {
                last.line.push(node);
            }
            else {
                last.box.push(node);
            }
            return last;
        }, {
            line: [],
            box: []
        });
        var updateBox = function () {
            list.box.forEach(function (node) {
                var $pos = node === target ? pos : node.pos;
                node.$moveTo($pos);
            });
        };
        var updateLine = function () {
            list.line.forEach(function (line) {
                var $pos = line === target ? pos : line.endPos;
                line.$moveTo($pos);
            });
        };
        if (isArrowNode) {
            updateLine();
            updateBox();
        }
        else {
            updateBox();
            updateLine();
        }
        this.ctx.restore();
    };
    Manager.deleteNode = function (target) {
        var _this = this;
        var index = this.list.findIndex(function (node) { return node === target; });
        this.list.splice(index, 1);
        if (target.lines.length) {
            target.lines.filter(function (line) {
                var connectedNode = line.from === target ? line.to : line.from;
                var index = connectedNode.lines.findIndex(function ($line) { return $line === line; });
                connectedNode.lines.splice(index, 1);
                _this.list = _this.list.filter(function (node) { return node !== line; });
            });
        }
        if (target instanceof ArrowNode) {
            this.deleteConnectedBox(target);
        }
    };
    Manager.deleteConnectedBox = function (line) {
        if (!line.to || !line.from)
            return;
        var fromNode = line.from;
        var toNode = line.to;
        [fromNode, toNode].forEach(function (node) {
            node.lines = node.lines.filter(function (oldLine) { return oldLine !== line; });
        });
    };
    Manager.clear = function () {
        this.list.forEach(function (node) {
            node.destroy();
        });
        this.list = [];
    };
    Manager.list = [];
    return Manager;
}());

var Menu = (function (_super) {
    __extends(Menu, _super);
    function Menu(option) {
        return _super.call(this, option) || this;
    }
    return Menu;
}(CanvasNode));

function hasArrowNode(node1, node2) {
    return [node1, node2].some(function (node) { return node instanceof ArrowNode; });
}
function isConnected(node1, node2) {
    if (hasArrowNode(node1, node2))
        return false;
    var lines = node1.lines;
    return lines.some(function (line) {
        var match = line.from === node1 ? line.to : line.from;
        return match === node2;
    });
}
function isConnectedSeq(node1, node2, isFromFirst) {
    if (isFromFirst === void 0) { isFromFirst = true; }
    if (hasArrowNode(node1, node2))
        return false;
    var lines = node1.lines;
    return lines.some(function (line) {
        var match = isFromFirst ? line.to : line.from;
        return match === node2;
    });
}

var Entry = (function () {
    function Entry() {
    }
    Entry.init = function (option) {
        Manager.init(option);
    };
    Entry.drawBox = function (option) {
        return new CanvasNode(option);
    };
    Entry.addEvent = function (type, cb) {
        listenToNodeEvent(type, cb);
    };
    Entry.removeEvent = function (type) {
        removeNodeEvent(type);
    };
    Entry.drawLine = function (from, to) {
        var line = new ArrowNode({
            name: 'line',
            pos: from
        });
        to && line.moveTo(to);
        return line;
    };
    Entry.connect = function (line, from, to) {
        line.connect(from, to);
    };
    Object.defineProperty(Entry, "all", {
        get: function () {
            return Manager.list;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entry, "lines", {
        get: function () {
            return Manager.list.filter(function (node) { return node instanceof ArrowNode; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entry, "menus", {
        get: function () {
            return Manager.list.filter(function (node) { return node instanceof Menu; });
        },
        enumerable: true,
        configurable: true
    });
    Entry.clear = function () {
        Manager.clear();
    };
    Entry.nativeAddEvent = addEvent;
    Entry.nativeRemoveEvent = removeEvent;
    Entry.getClickedNode = getClickedNode;
    Entry.getClickedLine = getClickedLine;
    Entry.getClickedBox = getClickedBox;
    Entry.centralizePoint = centralizePoint;
    Entry.placePointOnEdge = placePointOnEdge;
    Entry.isConnected = isConnected;
    Entry.isConnectedSeq = isConnectedSeq;
    Entry.ArrowNode = ArrowNode;
    Entry.Menu = Menu;
    Entry.Node = CanvasNode;
    return Entry;
}());

return Entry;

})));
