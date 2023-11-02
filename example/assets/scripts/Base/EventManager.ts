export type EventManagerCallFunc = (eventName: string, eventdata?: any, ...optionalParams: any[]) => void;
export interface CallBackTarget {
    callBack: EventManagerCallFunc;
    target: any;
    order: number;
}


export class EventManager {
    private static instance;
    static getInstance(): EventManager {
        if (!this.instance) {
            this.instance = new EventManager;
        }
        return this.instance;
    }

    static destroy(): void {
        this.instance && (this.instance = null);
    }

    private constructor(){
        this._eventListeners = {};
    }
    /**
     * 消息执行顺序 排序
     * @param a
     * @param b
     */
    private sortListener(a:CallBackTarget, b:CallBackTarget) {
        if (a.order > b.order) {
            return -1
        }else if (a.order < b.order) {
            return 1
        }else{
            return 0
        }
    }

    private _eventListeners:{[x:string]:CallBackTarget[]};
    private getEventListenersIndex(eventName:string, callBack:EventManagerCallFunc, target?:any) :number {
        var index = -1;
        for (let i = 0; i < this._eventListeners[eventName].length; i++) {
            var s = this._eventListeners[eventName][i];
            if (s.callBack == callBack && (!target || s.target == target)) {
                index = i;
                break
            }
        }
        return index;
    }

    addEventListener(eventName: string, callBack: EventManagerCallFunc, target?: any, order?: number): boolean {
        if (null == order) order = 1;
        if (eventName) {
            if (null == callBack) {
                cc.log("addEventListener callBack is nil");
                return false;
            }
            var arg = {
                callBack:callBack,
                target:target,
                order:order
            };
            if (null == this._eventListeners[eventName]) {
                this._eventListeners[eventName] = [arg];
            }else if (-1 == this.getEventListenersIndex(eventName, callBack, target)){
                this._eventListeners[eventName].push(arg)
                this._eventListeners[eventName].sort(this.sortListener);                
            }
            return true;
        }
        cc.warn("eventName is empty" + eventName);
        return false;
    }

    setEventListener(eventName: string, callBack: EventManagerCallFunc, target?: any): boolean {
        if (eventName) {
            if (null == callBack) {
                cc.log("setEventListener callBack is nil");
                return false;
            }
            var arg = {
                callBack:callBack,
                target:target,
                order:1
            };
            this._eventListeners[eventName] = [arg];
            return true;
        }
        cc.warn("eventName is empty" + eventName);
        return false;
    }

    removeEventListener(eventName: string, callBack: EventManagerCallFunc, target?: any): void {
        if (null != this._eventListeners[eventName]) {
            var index = this.getEventListenersIndex(eventName, callBack, target);
            if (-1 != index) {
                this._eventListeners[eventName].splice(index, 1);
                if (0 == this._eventListeners[eventName].length) {
                    delete this._eventListeners[eventName];
                }
            }
        }
    }
    
    raiseEvent(eventName: string, ...eventdata: any[]): void {
        var args = [];
        var callFunc;
        for (let i = 1; i < arguments.length; i++) {
            args[i-1] = arguments[i];
        }
        if (null != this._eventListeners[eventName]) {
            var listeners = this._eventListeners[eventName];
            var s:CallBackTarget[] = [];
            for (let j = 0; j < listeners.length; j++) {
                var l = listeners[j];
                s.push({
                    callBack: l.callBack,
                    target: l.target,
                    order:l.order
                })
            }
            for (let i = 0; i < s.length; i++) {
                callFunc = s[i].callBack;
                callFunc.call.apply(callFunc, [s[i].target, eventName].concat(args))
            }
        }
    }
}