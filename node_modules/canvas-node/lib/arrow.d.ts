import { CanvasNode, CanvasNodeOption, Pos } from './node';
export interface ArrowOption extends CanvasNodeOption {
    ratio?: number;
    arrowPath?: Path2D & CanvasFillRule;
}
export interface Color {
    style: string;
    strokeStyle: string;
}
export declare class ArrowNode extends CanvasNode {
    from: CanvasNode;
    to: CanvasNode;
    endPos: Pos;
    ratio: number;
    arrowPath: Path2D & CanvasFillRule;
    constructor(option: ArrowOption);
    readonly stops: [number, number][];
    readonly colorObj: Color;
    $moveTo(end: Pos): void;
    $draw(): void;
    updateEndPos(end: Pos): void;
    connect(from: CanvasNode, to: CanvasNode): void;
    abort(): void;
}
