import { Pos } from '../node';
export declare function simulateBezierCurve(p1: number, p2: number, p3: number, p4: number, t: number): number;
export declare function getDirForBezierCurve(p1: number, p2: number, p3: number, p4: number, t: number): number;
export declare function getControlPoints(start: Pos, end: Pos): [Pos, Pos];
export declare function isPointOnBezierCurve(start: Pos, end: Pos, point: Pos): boolean;
