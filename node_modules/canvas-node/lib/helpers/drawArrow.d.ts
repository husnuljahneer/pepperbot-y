import { CanvasNode, Pos } from '../node';
import { Color } from '../arrow';
export declare const ARROW_H: number;
export declare function calculateStop(x1: number, y1: number, x2: number, y2: number): [number, number];
export declare function drawLine(ctx: CanvasRenderingContext2D, start: Pos, end: Pos, ratio: number, arrowPath: Path2D & CanvasFillRule, colorObj: Color): void;
export declare function centralizePoint(node: CanvasNode): Pos;
export declare function placePointOnEdge(start: Pos, end: Pos, node: CanvasNode, isStart?: boolean): Pos;
export declare function drawCubicBezier(ctx: CanvasRenderingContext2D, start: Pos, end: Pos, ratio: number, arrowPath: Path2D & CanvasFillRule, colorObj: Color): void;
