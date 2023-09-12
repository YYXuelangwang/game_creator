import { ComUtils } from "./utils/ComUtils";

const { ccclass, property } = cc._decorator;
export type FilterCallback = (urlOruuid: string) => boolean;

@ccclass
export default class ResLeakChecker  {
    private static _instance;
    private resFilter:FilterCallback;
    private _checking;
    private _log:Map<string, Map<string, string>>;
    private constructor() {
        this.resFilter = null;
        this._checking = false;
        this._log = new Map;
    }
    static getInstance(): ResLeakChecker {
        if (!ResLeakChecker._instance) {
            ResLeakChecker._instance = new ResLeakChecker();
        }
        return ResLeakChecker._instance;
    }

    setFilterCallback(cb: FilterCallback): void {
        this.resFilter = cb;
    }

    checkFilter(urlOruuid: string): boolean {
        if (this._checking && (!this.resFilter || this.resFilter(urlOruuid))) {
            return true;
        }
        return false;
    }

    logLoad(uuid: string, use: string, stack?: string): void {
        if (this.checkFilter(uuid)) {
            if (!this._log.has(uuid)) this._log.set(uuid, new Map);
            var m = this._log.get(uuid);
            if (m.has(use)) {
                console.warn("ResLeakChecker doubel same use " + uuid + " : " + use + ", stack " + m[use])
            }
            m.set(use, stack || ComUtils.getCallStack(2))
        }
    }
    
    logRelease(uuid: string, use: string): void {
        if (this.checkFilter(uuid)) {
            if (this._log.has(uuid)) {
                var m = this._log.get(uuid);
                if (m.has(use)) {
                    m.delete(use);
                }else{
                    console.warn("ResLeakChecker use nofound " + uuid + " : " + use)
                }
                if (m.size <= 0) this._log.delete(uuid);
            }else{
                console.warn("ResLeakChecker uuid nofound " + uuid);
            }
        }
    }

    startCheck(): void {
        this._checking = true;
    }

    stopCheck(): void {
        this._checking = false;
    }

    getLog(): Map<string, Map<string, string>> {
        return this._log;
    }

    resetLog(): void {
        this._log = new Map;
    }

    dump(showStack?: boolean): void {
        this._log.forEach((v, k) => {
            var m = cc.assetManager.assets.get(k);
            console.log(m);
            if (showStack) {
                v.forEach((v2,k2) => {
                    console.log(v2 + " : " + k2);
                })
            }else{
                v.forEach((v2, k2) => {
                    console.log("" + v2);
                })
            }
        })
    }

}

export let resLeakChecker = ResLeakChecker.getInstance();