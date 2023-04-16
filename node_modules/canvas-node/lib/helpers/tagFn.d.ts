export declare const TAG_NAME: symbol;
export declare function tagFn<T extends (...args: any[]) => any>(fn: T): T;
export declare function inheritTag<T extends (...args: any[]) => any>(source: T, target: T): T;
export declare function isSameFn<T extends (...args: any[]) => any>(fn1: T, fn2: T): boolean;
