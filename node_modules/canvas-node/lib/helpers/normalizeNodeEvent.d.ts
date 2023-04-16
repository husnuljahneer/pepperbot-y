import { NodeEventCallback } from '../node';
export declare type EventHandler = (e: Event) => any;
export declare function shouldNormalizeEvent(type: string): boolean;
export declare function normalizeEvent(type: string, cb: NodeEventCallback): EventHandler;
export declare function normalizeEventType(type: string): string;
