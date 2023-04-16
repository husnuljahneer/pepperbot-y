export declare type BatchCallback = (...args: any[]) => any;
export declare class Batch {
    static timer: number;
    static list: BatchCallback[];
    static limit: number;
    static add(fn: BatchCallback, uniqueKey?: any): void;
    static includes(key: any): boolean;
    static unify(key: any, fn: BatchCallback): void;
    static batch(): void;
    static invoke(): void;
}
