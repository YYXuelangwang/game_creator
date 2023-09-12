import SimpleManagerTemplate from "./SimpleManagerTemplate";
import { Handler } from "../SlotUtils/Handle";
import { globalTaskFlags } from '../SlotDefinitions/globalTaskFlags';

/**
 * GlobalAnimationManager
 * 对游戏全局需要播放动画进行管理，主要管理优先级方面，如目前主要处理免费游戏触发，小游戏触发及中奖动画触发的顺序及优先级
 */
export default class GlobalQueueManager implements SimpleManagerTemplate {
    /**
     * 单例
     */
    public static get instance(): GlobalQueueManager {
        if (!this._instance) this._instance = new GlobalQueueManager();
        return this._instance;
    }
    private static _instance: GlobalQueueManager = null;

    public continueHandler: Handler = Handler.create(this, this.execute, null, false);
    private _continueInterruptHandler: Handler = Handler.create(this, this._interruptExecute, null, false);

    /**
     * 等待执行的句柄的长度
     */
    public get queueLen(): number {
        return this._queue.length;
    }

    private _taskNameKey: string = "__taskNameKey";
    private _taskCancelHandlerKey: string = "__taskCancelHandlerKey";

    /**
     * 将任务添加到队列
     * @param handler 任务 
     * @param taskName 任务名，任务的标志，可以通过其在队列中找到指定任务
     * @param cancelHandler 当任务被取消时需要执行的回调
     */
    public pushToQueue(handler: Handler, taskName?: globalTaskFlags, cancelHandler?: Handler) {
        handler[this._taskNameKey] = taskName;
        handler[this._taskCancelHandlerKey] = cancelHandler;
        this._queue.push(handler);
    }
    private _queue: Handler[] = [];

    /**
     * 通过任务名称获取任务
     */
    public getTaskByName(taskName: globalTaskFlags): Handler {
        for (var i: number = 0; i < this.queueLen; ++i) {
            if (this._queue[i][this._taskNameKey] === taskName) {
                return this._queue[i];
            }
        }
        return null;
    }

    /**
     * 移除掉指定名称的任务
     * @param taskName 任务名称
     * @param ifAll 是否移除所有名称为 taskName 的任务
     */
    public removeTaskByName(taskName: globalTaskFlags, ifAll: boolean = false) {
        let len: number = this.queueLen;
        if (len <= 0) return;

        let queue: Handler[] = this._queue;
        let newQueue: Handler[] = [];
        for (var i: number = 0; i < len; ++i) {
            if (queue[i][this._taskNameKey] !== taskName) {
                newQueue.push(queue[i]);
            }
            else {
                /**
                 * 执行取消时的回调
                 */
                let cancelHandler: Handler = queue[i][this._taskCancelHandlerKey];
                cancelHandler && cancelHandler.run();

                /**
                 * 如果不需要移除所有的，则把剩下的放入新队列
                 */
                if (!ifAll) {
                    for (i = i + 1; i < len; ++i) {
                        newQueue.push(queue[i]);
                    }
                    break;
                }
            }
        }

        this._queue = newQueue;
    }

    /**
     * 
     * @param taskName 
     */
    public removeAllTasksByName(taskName: globalTaskFlags) {
        this.removeTaskByName(taskName, true);
    }

    /**
     * 获取下一个队列任务的名称
     */
    public getNextTaskName(): globalTaskFlags {
        if (this.queueLen <= 0) return null;
        return this._queue[0][this._taskNameKey];
    }

    /**
     * 初始化接口
     */
    init() {
        // this._waittingLen = 0;
        this._queue = [];
        this.advancedQueue = false;
    }

    /**
     * 释放
     */
    dispose() {
        // this._waittingLen = 0;
        this._queue = [];
    }

    /**
     * 提前执行了队列
     */
    public advancedQueue: boolean = false;

    /**
     * 
     */
    public reset() {
        // this._waittingLen = 0;
        this._interrupted = false;
        this._queue = [];
        this.advancedQueue = false;
        // this._inExecuting = false;
    }

    // public get isFinished():boolean{
    //     return !(this._inExecuting || this.queueLen > 0);
    // }

    public execute(ifAdvance: boolean = false): boolean {
        this.advancedQueue = ifAdvance;

        if (this._queue.length <= 0) return false;
        if (this._interrupted) return false;

        let handler: Handler = this._queue.shift();
        handler.runWith(this.continueHandler);
        return true;
    }

    private _interruptExecute(): boolean {
        if (this._queue.length <= 0) {
            this._interrupted = false;
            return false;
        }

        let handler: Handler = this._queue.shift();
        handler.runWith(this._continueInterruptHandler);
        return true;
    }

    private _interrupted: boolean = false;
    public interruptAndExecut(): boolean {
        if (this.queueLen <= 0) return false;
        this._interrupted = true;
        return this._interruptExecute();
    }
}