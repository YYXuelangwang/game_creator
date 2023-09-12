import ObjectPool from "./ObjectPool";


/**
 * 计时器
 * @author zengyong
 */
export default class Timer {
    public static dt: number;
    private static _list: Array<TimeVO> = [];
    private static _isPause: boolean = false;

    /**
     * 暂停开关
     */
    public static get isPause(): boolean {
        return Timer._isPause;
    }

    public static set isPause(value: boolean) {
        Timer._isPause = value;
    }

    private static _getVO(caller: any, callback: Function): TimeVO {
        for (var i: number = 0; i < Timer._list.length; i++) {
            if (Timer._list[i].caller == caller && Timer._list[i].callback == callback)
                return Timer._list[i];
        }
        return null;
    }

    /**
     * 计时中
     * 挂载在某个节点的update或者lateUpdate下
     * 
     * @param dt 与上一帧的时间差，单位毫秒
     */
    public static onTimer(dt: number): void {
        Timer.dt = dt;

        if (Timer._isPause)
            return;

        var list = Timer._list.concat();
        var removeList = [];
        var vo: TimeVO;
        for (var i: number = list.length - 1; i >= 0; i--) {
            vo = list[i];
            if (!vo.pause) {
                vo.time += dt;
                if (vo.time >= vo.delay) {
                    if (vo.callback) {
                        vo.callback.apply(vo.caller);
                    }

                    if (vo.count > 0) {
                        vo.count--;
                        if (vo.count <= 0) {
                            removeList.push(vo);
                            continue;
                        }
                    }

                    vo.time -= vo.delay;
                }
            }
        }

        for (var j = 0; j < removeList.length; j++) {
            vo = removeList[j];
            Timer._list.splice(Timer._list.indexOf(vo), 1);
            vo.clear();
        }
        list = undefined;
        removeList = undefined;
    }

    /**
     * 暂停
     * @param caller 对象
     * @param callback 回调
     */
    public static pause(caller: any, callback: Function): void {
        var vo: TimeVO = Timer._getVO(caller, callback);
        if (vo)
            vo.pause = true;
    }

    /**
     * 暂停全部
     */
    public static pauseAll(): void {
        for (var i: number = Timer._list.length - 1; i >= 0; i--)
            Timer._list[i].pause = true;
    }

    /**
     * 继续
     * @param caller 对象
     * @param callback 回调
     */
    public static resume(caller: any, callback: Function): void {
        var vo: TimeVO = Timer._getVO(caller, callback);
        if (vo)
            vo.pause = false;
    }

    /**
     * 继续全部
     */
    public static resumeAll(): void {
        for (var i: number = Timer._list.length - 1; i >= 0; i--)
            Timer._list[i].pause = true;
    }

    /**
     * 延时一次
     * @param caller 对象
     * @param callback 回调
     * @param delay 延时（单位秒）
     * @param args 参数
     */
    public static once(caller: any, callback: Function, delay: number): void {
        Timer.loop(caller, callback, delay, 1);
    }

    /**
     * 循环
     * @param caller 对象
     * @param callback 回调
     * @param delay 延时（单位秒）
     * @param count 次数(0表示无限次数，默认0次)
     * @param args 参数
     */
    public static loop(caller: any, callback: Function, delay: number = 0, count: number = 0): void {
        var vo: TimeVO = Timer._getVO(caller, callback);
        if (!vo) {
            vo = ObjectPool.get('TimeVO');
            if (!vo)
                vo = new TimeVO();

            Timer._list.unshift(vo);
        }

        vo.caller = caller;
        vo.callback = callback;
        vo.time = 0;
        vo.delay = delay;
        vo.pause = false;
        vo.count = count;
    }

    /**
     * 帧循环
     * @param caller 对象
     * @param callback 回调
     * @param count 次数(0表示无限次数，默认0次)
     * @param args 参数
     */
    public static frameLoop(caller: any, callback: Function, count: number = 0): void {
        Timer.loop(caller, callback, 0, count);
    }

    /**
     * 清除定时器
     * @param caller 对象
     * @param callback 回调
     */
    public static clear(caller: any, callback: Function): void {
        for (var i: number = Timer._list.length - 1; i >= 0; i--) {
            var vo = Timer._list[i];
            if (vo.caller == caller && vo.callback == callback) {
                Timer._list.splice(i, 1);
                vo.clear();
                break;
            }
        }
    }

    /**
     * 清除全部定时器
     */
    public static clearAll(): void {
        for (var i = 0; i < Timer._list.length; i++) {
            var vo = Timer._list[i];
            vo.clear();
        }
        Timer._list.length = 0;
    }
}

class TimeVO {
    public caller: any;
    public callback: Function;
    public time: number;
    public pause: boolean;
    public delay: number;
    public count: number;

    public clear() {
        this.caller = undefined;
        this.callback = undefined;
        ObjectPool.put('TimeVO', this);
    }
}