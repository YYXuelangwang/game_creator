
import { SDictionary } from "../../SlotData/SDictionary";
import JTScroller from "../com/JTScroller";
import JTRuleTask from "./JTRuleTask";

/*
* 
*/
export default class JTChangeSpeedTask extends JTRuleTask {


    private rangeMin: number = 0;
    private rangeMax: number = 0;
    private rangeValue: number = 0;

    static SLOW_VELOCITY: number = 2;
    static FAST_VELOCITY: number = 1;
    static DEFAULT_VELOCITY: number = 0;

    private _runnnigInfotMap:SDictionary = null;

    constructor() {
        super();
        this._runnnigInfotMap = new SDictionary();
    }

    
    /**
     * 
     * @param rangeMin 最小速度
     * @param rangeMax 最大速度
     * @param rangeValue 加速度
     * @param time 运行时间
     */
    public config(rangeMin:number,rangeMax:number,rangeValue:number,time:number): void {
        this.rangeMax = rangeMax;
        this.rangeMin = rangeMin;
        this.rangeValue = rangeValue;

        this.time = time;
    }

    /**
     * 开始改变速度任务
     * @param index 列的索引
     */
    public startChangeSpeed(index:number):void{
        let s = this.scrollerGroup.items[index] as JTScroller;
        let runningInfo = new JTChangeSpeedRunningInfo();
        runningInfo.velocity = {};
        runningInfo.step = Math.ceil((this.rangeMax - this.rangeMin) / this.rangeValue);
        runningInfo.step = runningInfo.step == 0 ? 1 : runningInfo.step;
        runningInfo.currentStep = 0;
        runningInfo.velocity["cadence"] = JTChangeSpeedTask.SLOW_VELOCITY;
        runningInfo.time = this.time+s.time;

        this._runnnigInfotMap.set(index,runningInfo);
    }

    public updateTime(s: JTScroller): boolean {

        let runningInfo: JTChangeSpeedRunningInfo = this._runnnigInfotMap.get(s.index);
        if (runningInfo) {
                if (runningInfo.velocity["cadence"] == JTChangeSpeedTask.FAST_VELOCITY) {
                    runningInfo.runningTime += s.defaultFrameRateTime;
                        if (runningInfo.runningTime < runningInfo.time){
                            return false;
                        }
                }
                else if (runningInfo.runningTime == 0) {
                        return false;
                }
        }

        return true;
    }

    public onRunningSpeedUp(s: JTScroller): boolean {

        let runningInfo: JTChangeSpeedRunningInfo = this._runnnigInfotMap.get(s.index);
        if (runningInfo && runningInfo.velocity["cadence"] == JTChangeSpeedTask.SLOW_VELOCITY) {
                if (!runningInfo.velocity["init"]) {
                        s.speed = this.rangeMin;
                        runningInfo.velocity["init"] = true;
                }
                if (runningInfo.currentStep == runningInfo.step) {
                    runningInfo.velocity["cadence"] = JTChangeSpeedTask.FAST_VELOCITY;
                    runningInfo.currentStep = 0;
                    return true;
                }
                s.speed += s.speed > this.rangeMax ? -Math.abs(this.rangeValue) : this.rangeValue;
                runningInfo.currentStep += 1;

        }
        return false;
    }

    public onRunningSlowdown(s: JTScroller): boolean {

        let runningInfo: JTChangeSpeedRunningInfo = this._runnnigInfotMap.get(s.index);
        if (runningInfo && runningInfo.velocity["cadence"] == JTChangeSpeedTask.FAST_VELOCITY) {
                if (runningInfo.currentStep == runningInfo.step) {
                    s.changedTimes = 0;
                    runningInfo.velocity["cadence"] = JTChangeSpeedTask.DEFAULT_VELOCITY;
                    runningInfo.currentStep = 0;
                    return true;
                }
                s.speed += s.speed > this.rangeMin ? -Math.abs(this.rangeValue) : this.rangeValue;
                runningInfo.currentStep += 1;

                return true;
        }
        return false;
    }


    public clear(): void {
        super.clear();
        this._runnnigInfotMap.clear();
        this._isRunning = false;
    }

}

class JTChangeSpeedRunningInfo {
    public velocity: Object = {};
    public runningTime: number = 0;
    public time:number = 0;
    public step: number = 0;
    public currentStep: number = 0;
}




