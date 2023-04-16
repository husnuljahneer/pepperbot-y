import { CanvasNode, Pos } from '../node';
import { ArrowNode } from '../arrow';
export declare type Poly = [number, number][];
export declare const MARGIN_ERROR = 4;
export declare function isPointInPolygon(vertexes: number[], pos: Pos): boolean;
export declare function distanceBetween2Points(x1: number, y1: number, x2: number, y2: number): number;
export declare function getClickedNode(pos: Pos): CanvasNode;
export declare function getClickedBox(pos: Pos): CanvasNode;
export declare function getClickedLine(pos: Pos): ArrowNode;
export declare function binarySearch(point: Pos, start: number, end: number, count: number, curFn: (...args: number[]) => number, fnArgs: {
    x: number[];
    y: number[];
}, limit?: number): boolean;
export declare function isPointOnLine(point: Pos, start: number, end: number, count: number, curFn: (...args: number[]) => number, fnArgs: {
    x: number[];
    y: number[];
}, limit?: number): boolean;
