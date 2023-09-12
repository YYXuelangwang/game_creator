export default class SlotTimeManager {
    /**
        * 单例
        */
    public autoEnterBonusGame: boolean = true;
    public static get instance(): SlotTimeManager {
        if (!this._instance) this._instance = new SlotTimeManager();
        return this._instance;
    }
    private static _instance: SlotTimeManager = null;

    private _interval: number;
    private _listionMap: {} = null;
    // private _data = null;
    private _startTime: number = 0;

    private _fameNum;


    init() {
        this._listionMap = {};
        // this._data = new Date()
        this._startTime = Date.now();
        this._interval = setInterval(this.runInterval.bind(this), 8) as any;

        this._fameNum = 0;
    }

    runInterval() {
        var now = Date.now();
        var dealyTime = now - this._startTime;
        if (dealyTime < this._fameNum * 16.7)
            return;
        this._fameNum = Math.floor(dealyTime * 0.06);

        this.fameLoop();
    }

    fameLoop() {
        var now = Date.now();
        for (var key in this._listionMap) {
            var handlerList: TimeHander[] = this._listionMap[key];
            for (var i = 0; i < handlerList.length; i++) {
                var timeHander: TimeHander = handlerList[i];

                if (timeHander.once == true) {
                    if (timeHander.delay < now - timeHander.startTime) {
                        timeHander.method.apply(timeHander.caller, timeHander.args);
                        this.clear(timeHander.caller, timeHander.method);
                    }
                } else {
                    if (timeHander.delay == 0) {
                        timeHander.method.apply(timeHander.caller, timeHander.args);
                    } else {
                        if (now - timeHander.startTime > timeHander.delay) {
                            timeHander.startTime = now;
                            timeHander.method.apply(timeHander.caller, timeHander.args);
                        }
                    }
                }
            }
        }
    }

    once(delay: number, caller: any, method: Function, args?: any[]) {
        this._listionMap[caller] = this._listionMap[caller] || [];
        var timeHander: TimeHander = new TimeHander();
        timeHander.delay = delay;
        timeHander.caller = caller;
        timeHander.method = method;
        timeHander.args = args;
        timeHander.once = true;
        timeHander.startTime = Date.now();
        this._listionMap[caller].push(timeHander);
    }

    loop(delay: number, caller: any, method: Function, args?: any[]) {
        this._listionMap[caller] = this._listionMap[caller] || [];
        var timeHander: TimeHander = new TimeHander();
        timeHander.delay = delay;
        timeHander.caller = caller;
        timeHander.method = method;
        timeHander.args = args;
        timeHander.startTime = Date.now();
        this._listionMap[caller].push(timeHander);
    }

    frameLoop(caller: any, method: Function, args?: any[]) {
        this._listionMap[caller] = this._listionMap[caller] || [];
        var timeHander: TimeHander = new TimeHander();
        timeHander.delay = 0;
        timeHander.caller = caller;
        timeHander.method = method;
        timeHander.args = args;
        timeHander.startTime = Date.now();
        this._listionMap[caller].push(timeHander);
    }

    clear(caller, method) {
        if (this._listionMap == null)
            return;
        var handlerList: TimeHander[] = this._listionMap[caller] || [];
        var index = 0;
        while (index < handlerList.length) {
            var timeHander: TimeHander = handlerList[index];
            if (timeHander.method == method) {
                handlerList.splice(index, 1);
                index--;
            }
            index++;
        }
    }

    clearAll(caller) {
        var handlerList: TimeHander[] = this._listionMap[caller] || [];
        handlerList.length = 0;
        this._listionMap[caller] = null;
        delete this._listionMap[caller];
    }

    dispose() {
        clearInterval(this._interval);
        this._interval = 0;
        for (var key in this._listionMap) {
            var handlerList: TimeHander[] = this._listionMap[key];
            handlerList.length = 0;
        }
        this._listionMap = null;
    }
}

export class TimeHander {
    constructor() { }
    caller: any;
    method: Function;
    once: boolean;
    args: any[];
    delay: number;
    startTime: number;
}