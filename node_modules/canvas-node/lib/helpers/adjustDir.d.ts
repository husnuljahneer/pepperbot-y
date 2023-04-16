export declare type CalculateDirFn = (...args: number[]) => number;
export declare function getAdjustedDir(fn: CalculateDirFn, distance: number, ...args: number[]): number;
