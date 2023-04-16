import { CanvasNode, Pos, UpdateLineCallback } from './node';
import { ArrowNode } from './arrow';
export interface ManagerOption {
    canvas: HTMLCanvasElement;
    updateLineCb?: UpdateLineCallback;
    arrowPath?: Path2D & CanvasFillRule;
    useCubicBezier?: boolean | null;
    safePointOnLine?: boolean | null;
    arrowH?: number | null;
}
export declare class Manager {
    static size: Pos;
    static ctx: CanvasRenderingContext2D;
    static list: CanvasNode[];
    static canvas: HTMLCanvasElement;
    static updateLineCb: UpdateLineCallback;
    static arrowPath: Path2D & CanvasFillRule;
    static useCubicBezier: boolean;
    static safePointOnLine: boolean;
    static arrowH: number;
    static init(option: ManagerOption): void;
    static add(node: CanvasNode): void;
    static clean(): void;
    static draw(cleanFirst?: boolean): void;
    static moveTo(target: CanvasNode, pos: Pos): void;
    static deleteNode(target: CanvasNode): void;
    static deleteConnectedBox(line: ArrowNode): void;
    static clear(): void;
}
