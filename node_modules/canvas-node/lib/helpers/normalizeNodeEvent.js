import { CanvasNode } from '../node';
import { getClickedNode } from './isClicked';
import event from 'y-event';
var NORMALIZE_LIST = ['mousemove', 'mouseout'];
var queue = [null, null];
var inOutList = {
    ins: [],
    outs: []
};
event.$on('change', function (e) {
    var newTarget = getNewTarget();
    var oldTarget = getOldTarget();
    if (newTarget instanceof CanvasNode) {
        inOutList.ins.forEach(function (cb) { return cb(e, newTarget); });
    }
    if (oldTarget instanceof CanvasNode) {
        inOutList.outs.forEach(function (cb) { return cb(e, oldTarget); });
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
export function shouldNormalizeEvent(type) {
    return NORMALIZE_LIST.includes(type);
}
export function normalizeEvent(type, cb) {
    switch (type) {
        case 'mousemove':
            return generateMouseMoveHandler(cb);
        case 'mouseout':
            return generateMouseOutHandler(cb);
    }
}
export function normalizeEventType(type) {
    if (type === 'mouseout')
        return 'mousemove';
    return type;
}
function generateMouseMoveHandler(cb) {
    inOutList.ins.push(cb);
    return function handler(e) {
        var pos = {
            x: e.offsetX,
            y: e.offsetY
        };
        var node = getClickedNode(pos);
        updateTarget(node);
        if (hasChanged()) {
            event.$emit('change', e);
        }
    };
}
function generateMouseOutHandler(cb) {
    inOutList.outs.push(cb);
    return function handler(e) {
        var pos = {
            x: e.offsetX,
            y: e.offsetY
        };
        var node = getClickedNode(pos);
        updateTarget(node);
        if (hasChanged()) {
            event.$emit('change', e);
        }
    };
}
//# sourceMappingURL=normalizeNodeEvent.js.map