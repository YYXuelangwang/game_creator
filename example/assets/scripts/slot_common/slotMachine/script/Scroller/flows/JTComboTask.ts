import JTParseTask from "./JTParseTask";
import RollingResult from "../../SlotData/RollingResult";
import JTContainer from '../com/base/JTContainer';
import JTLineScrollerGroup from "../extensions/JTLineScrollerGroup";
import JTBaseLogicFactroy from "../com/factorys/JTBaseLogicFactroy";

/*
* name;
*/
export default class JTComboTask extends JTParseTask {
    /**
     * 需要观察的连续ID的列表
     */
    protected ids: any[] = null;
    /**
     * 连续ID的个数
     */
    protected count: number = 0;
    /**
     * 任务线（当前中奖满足几种情况）
     */
    protected taskLines: any[] = null;
    constructor() {
        super();
    }

    /**
     * 运行检查是否满足任务条件
     * 
     */
    public runningTask(): void {
        let lines: any[] = this.getLineResults();
        this.taskLines = [];

        if(!lines){
           this.complete();
           return;
        }
        for (let i: number = 0; i < lines.length; i++) {
            let line: RollingResult = lines[i];
            if (this.ids.indexOf(line.eleId) == -1) {
                continue;
            }
            if (line.eleNum < this.count) {
                continue;
            }
            if (line.winCoin == 0) {
                continue;
            }
            this.taskLines.push(line);
        }
        this.executeTask();
    }

    /**
     * 开始执行任务
     */
    public executeTask(): void {
        if (this.taskLines.length == 0) {
            console.log("流程：JTComboTask完成");
            this.complete();
            return;
        }
        this.taskLines.sort(this.sortOn)
        let t: RollingResult = this.taskLines.shift();
        this.taskLines.length = 0;
        let scroller: JTLineScrollerGroup = this._owner.owner as JTLineScrollerGroup;
        // if (scroller.skinLoaderContainer) {
        //     scroller.skinLoaderContainer.removeFromParent();
        //     (scroller as any).addChild(scroller.skinLoaderContainer);
        // }
        // if (scroller.gridContainer) {
        //     (scroller.gridContainer as JTContainer).removeFromParent();
        //     (scroller as any).addChild(scroller.gridContainer);
        // }
        // scroller.gridContainer && (scroller as any).addChild(scroller.gridContainer);

        let logic: JTBaseLogicFactroy = scroller.factoryLogic as JTBaseLogicFactroy;
        this.lineParser.showLines(0);
        this.lineParser.showMaskWithGridLine(t);
        this._handler && this._handler.apply(logic, [this, t]);
    }

    protected sortOn(a: RollingResult, b: RollingResult): number {
        if (a.winCoin > a.winCoin) {
            return 1;
        }
        else if (a.winCoin > a.winCoin) {
            return 0;
        }
        return -1;
    }

    /**
     * 注册观察任务
     * @param id 连续的ID列表，可以是单个数字ID或才数组的形式 
     * @param count 连续ID的个数
     */
    public registerWatchTask(id: any, count: number): void {
        this.count = count;
        this.ids = typeof id == "number" ? [id] : id;
    }
}