import { isSameFn } from './tagFn';
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
export function addEvent(el, type, cb) {
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
export function removeEvent(el, type, cb) {
    EventManager.remove(el, type, cb);
}
//# sourceMappingURL=eventHelper.js.map