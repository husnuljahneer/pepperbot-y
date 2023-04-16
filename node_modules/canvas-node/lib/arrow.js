var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { CanvasNode } from './node';
import { drawLine, drawCubicBezier } from './helpers/drawArrow';
import { Manager } from './manager';
import { calculateStop } from './helpers/drawArrow';
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
export { ArrowNode };
//# sourceMappingURL=arrow.js.map