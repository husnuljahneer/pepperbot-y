import { Manager } from './manager';
import { getVertexesForRect } from './helpers/getVertexes';
import { centralizePoint } from './helpers/drawArrow';
import { listenToNodeEvent, removeNodeEvent } from './helpers/nativeToNodeEvent';
import { Batch } from './helpers/batch';
import { tagFn } from './helpers/tagFn';
import { isFn } from './helpers/types';
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
export { CanvasNode };
//# sourceMappingURL=node.js.map