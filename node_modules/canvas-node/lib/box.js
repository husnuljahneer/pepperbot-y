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
var Box = (function (_super) {
    __extends(Box, _super);
    function Box(option) {
        return _super.call(this, option) || this;
    }
    return Box;
}(CanvasNode));
export { Box };
//# sourceMappingURL=box.js.map