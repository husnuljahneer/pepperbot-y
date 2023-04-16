import { Poly } from './isClicked';
import { Pos } from '../node';
export declare function simulateCurve(p0: number, p1: number, p2: number, t: number): number;
export declare function getDirective(p0: number, p1: number, p2: number, t: number): number;
export declare function getLimitedExamTimes(times: number, limit?: number): number;
export declare function isPointOnCurve(poly: Poly, pos: Pos): boolean;
