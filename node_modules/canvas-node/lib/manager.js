import { ArrowNode } from './arrow';
import { ARROW_H } from './helpers/drawArrow';
import { isBoolean, isNum } from './helpers/types';
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
export { Manager };
//# sourceMappingURL=manager.js.map