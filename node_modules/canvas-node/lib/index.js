import { Manager } from './manager';
import { CanvasNode } from './node';
import { Menu } from './menu';
import { listenToNodeEvent, removeNodeEvent } from './helpers/nativeToNodeEvent';
import { ArrowNode } from './arrow';
import { addEvent, removeEvent } from './helpers/eventHelper';
import { getClickedNode, getClickedLine, getClickedBox } from './helpers/isClicked';
import { centralizePoint, placePointOnEdge } from './helpers/drawArrow';
import { isConnected, isConnectedSeq } from './helpers/isConnected';
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
export { Entry as default };
//# sourceMappingURL=index.js.map