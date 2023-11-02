    /**
     * 日志
     */
    export class zLog {
        /**所有不打印 */
        static LEVEL_NONE: number = 0b0000;
        /**打印trace信息 */
        static LEVEL_TRACE: number = 0b0001;
        /**打印日志信息 */
        static LEVEL_LOG: number = 0b0010;
        /**打印调试信息 */
        static LEVEL_DEBUG: number = 0b0100;
        /**打印警告信息 */
        static LEVEL_WARN: number = 0b1000;
        /**打印错误信息 */
        static LEVEL_ERROR: number = 0b00010000;
        /**打印自定义信息 */
        static LEVEL_INFO: number = 0b00100000;
        /**打印全部信息 */
        static LEVEL_ALL: number = 0b00111111;
        private static _isInit = false;
        /**打印开关 */
        static enabled: boolean = false;
        private static _consoleTrace;
        private static _consoleLog;
        private static _consoleWarn;
        private static _consoleDebug;
        private static _consoleError;
        /**打印信息等级 */
        static level: number;
        /**替换原生方法 */
        static init(): void {
            if (this.enabled) {
                if (this.isIE) {
                    if (console.log) {
                        console.log = function (e) {
                            var tmp = [];
                            for (let i = 1; i < arguments.length; i++) {
                                tmp[i-1] = arguments[i];
                            }
                        }
                    }
                }else if (!this._isInit) {
                    this._isInit = true;
                    try {
                        this._consoleTrace = console.trace;
                        console.trace = this.trace;
                        this._consoleDebug = console.debug;
                        console.debug = this.debug;
                        this._consoleWarn = console.warn;
                        console.warn = this.warn;
                        this._consoleError = console.error;
                        console.error = this.error;
                        this._consoleLog = console.log;
                        console.log = this.log;
                    }catch (e){
                        console.log("Non support Log module!");
                    }
                }
            }
        }

        static dispose(): void {
           this._consoleTrace && (console.trace =this._consoleTrace,this._consoleTrace = null);
           this._consoleDebug && (console.debug =this._consoleDebug,this._consoleDebug = null);
           this._consoleWarn && (console.warn =this._consoleWarn,this._consoleWarn = null);
           this._consoleError && (console.error =this._consoleError,this._consoleError = null);
           this._consoleLog && (console.log =this._consoleLog,this._consoleLog = null);
        }

        private static insertHead(logLevel:number) {
            var prefix:string;
            switch (logLevel) {
                case 1:
                    prefix = "trace";
                    break;
                case 2:
                    prefix = "log";
                    break;
                case 3:
                    prefix = "debug";
                    break;
                case 4:
                    prefix = "warn";
                    break;
                case 5:
                    prefix = "error";
                    break;
                case 6:
                    prefix = "info";
                    break;
            }
            var time = new Date();
            var h = time.getHours(),
                m = time.getMinutes(),
                s = time.getSeconds(),
                ms = time.getMilliseconds();
            return "[" + (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s) + "." + (ms < 10 ? "00" + ms : ms < 100 ? "0" + ms : ms.toString()) + "][" + prefix + "]>\t"
        };

        private static execLogFun(logFun:Function, logLevel:number, message?:any, ...optionalParams:any[]) {
            var s = [];
            for (let i = 3; i < arguments.length; i++) {
                s[i-3] = arguments[i];
            }
            var isSimple = "string" == typeof message || "number" == typeof message || "boolean" == typeof message;
            logFun.apply(null, [isSimple ? "" + this.insertHead(logLevel) + message : message].concat(s));
        }

        /**
         * 打印信息
         */
        static trace(message?: any, ...optionalParams: any[]): void {
            if (!this.isIE) {
                if (this.enabled) {
                    this._isInit ||this.init();
                    if ((this.level &this.LEVEL_TRACE) == this.LEVEL_TRACE) {
                        this.execLogFun.apply(this, [this._consoleTrace ?this._consoleTrace : console.trace, 1, message].concat(optionalParams))
                    }
                } else {
                    console.trace.apply(console, [message].concat(optionalParams));
                } 
            }
        }
        /**
         * 日志信息
         */
        static log(message?: any, ...optionalParams: any[]): void {
            if (!this.isIE) {
                if (this.enabled) {
                    this._isInit ||this.init();
                    if ((this.level & this.LEVEL_LOG) == this.LEVEL_LOG) {
                        this.execLogFun.apply(this, [this._consoleLog ?this._consoleLog : console.trace, 2, message].concat(optionalParams))
                    }
                } else {
                    console.log.apply(console, [message].concat(optionalParams));
                } 
            }
        }
        /**
         * 调试信息
         */
        static debug(message?: any, ...optionalParams: any[]): void {
            if (!this.isIE) {
                if (this.enabled) {
                    this._isInit ||this.init();
                    if ((this.level &this.LEVEL_DEBUG) == this.LEVEL_DEBUG) {
                        this.execLogFun.apply(this, [this._consoleDebug ?this._consoleDebug : console.trace, 3, message].concat(optionalParams))
                    }
                } else {
                    console.debug.apply(console, [message].concat(optionalParams));
                } 
            }
        }
        /**
         * 警告信息
         */
        static warn(message?: any, ...optionalParams: any[]): void {
            if (!this.isIE) {
                if (this.enabled) {
                    this._isInit ||this.init();
                    if ((this.level &this.LEVEL_WARN) == this.LEVEL_WARN) {
                        this.execLogFun.apply(this, [this._consoleWarn ?this._consoleWarn : console.trace, 4, message].concat(optionalParams))
                    }
                } else {
                    console.warn.apply(console, [message].concat(optionalParams));
                } 
            }
        }

        /**
         * 错误信息
         */
        static error(message?: any, ...optionalParams: any[]): void {
            if (!this.isIE) {
                if (this.enabled) {
                    this._isInit ||this.init();
                    if ((this.level &this.LEVEL_ERROR) == this.LEVEL_ERROR) {
                        this.execLogFun.apply(this, [this._consoleError ?this._consoleError : console.trace, 5, message].concat(optionalParams))
                    }
                } else {
                    console.trace.apply(console, [message].concat(optionalParams));
                } 
            }
        }

        /**
         * 自定义信息
         */
        static info(message?: any, ...optionalParams: any[]): void {
            if (!this.isIE) {
                if (this.enabled) {
                    this._isInit || this.init();
                    if ((this.level & this.LEVEL_INFO) == this.LEVEL_INFO) {
                        var pre = this.level;
                        this.level = this.LEVEL_LOG;
                        this.execLogFun.apply(this, [this._consoleLog ?this._consoleLog : console.trace, 6, message].concat(optionalParams))
                        this.level = pre;
                    }
                } else {
                    console.log.apply(console, [message].concat(optionalParams));
                } 
            }
        } 

        // private static readonly isIE;
        private static get isIE() {
            //@ts-ignore
            return window.ActiveXObject || "ActiveXObject" in window
        }
    }

    