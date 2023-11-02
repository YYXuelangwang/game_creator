import { zLog } from "./zLog";


export class LogManager {
    private static instance;
    private _log;
    _display: boolean;
    static getInstance(): LogManager{
        if (!this.instance) {
            this.instance = new LogManager;
        }
        return this.instance;
    }

    private constructor() {
        this._log = [];
        this._display = true;
    }
    /**
     * 是否开启console.log
     */
    set enableConsoleLog(v:boolean) {
        zLog.level = v ? zLog.LEVEL_ALL : zLog.LEVEL_NONE;
    }

    /**
     * 这个在build之后依然可以在 控制台中打印日志
     * @param arg 需要打印的内容
     */
    console(message?: any, ...optionalParams: any[]): void {
        zLog.log(message, optionalParams);
    }

    /**
     * 这个只在Debug在控制台中打印日
     * @param arg 需要打印的内容
     */
    log(message?: any, ...optionalParams: any[]): void {
        zLog.log(message, optionalParams);
    }
    /**
     * 这个只在Debug在控制台中打印错误日志
     * @param arg 需要打印的内容
     */
    error(message?: any, ...optionalParams: any[]): void {
        zLog.error(message, optionalParams);
    }
    /**
     * 这个只在Debug在控制台中打印警告日志
     * @param arg 需要打印的内容
     */
    warn(message?: any, ...optionalParams: any[]): void {
        zLog.warn(message, optionalParams);
    }

    private recoder;

    displayAll(): void {}

    getlog(): string[] {
        return this._log;
    }

    sendserver(): void {}

    savelocal(): void {}

    clearlog(): void {
        this._log = [];
    }
}
export let logMgr: LogManager = LogManager.getInstance();