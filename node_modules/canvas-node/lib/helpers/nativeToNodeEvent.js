import { addEvent, removeEvent } from './eventHelper';
import { Manager } from '../manager';
import { getClickedNode } from './isClicked';
import { shouldNormalizeEvent, normalizeEvent, normalizeEventType } from './normalizeNodeEvent';
import { inheritTag, isSameFn } from './tagFn';
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
export function listenToNodeEvent(type, cb) {
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
export function removeNodeEvent(type, cb) {
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
//# sourceMappingURL=nativeToNodeEvent.js.map