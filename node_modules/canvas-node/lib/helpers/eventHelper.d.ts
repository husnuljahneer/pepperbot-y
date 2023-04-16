export declare type El = Element | Document;
export declare function addEvent(el: El, type: string, cb: (e: Event) => any): void;
export declare function removeEvent(el: El, type: string, cb?: (e: Event) => any): void;
