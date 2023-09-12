import JTParseTask from "./JTParseTask";
import RollingResult from "../../SlotData/RollingResult";
import JTChannelScrollerGroup from "../extensions/JTChannelScrollerGroup";
import { GameEventNames } from "../../SlotConfigs/GameEventNames";
import JTCombineTask from "../rules/JTCombineTask";
import JTScrollerLineParser from "../lines/JTScrollerLineParser";
import JTRuleTaskType from "../rules/JTRuleTaskType";
import JTLineType from "../lines/JTLineType";
import { Handler } from "../../SlotUtils/Handle";

/*
* name;
*/
export default class JTFullLineAniTask extends JTParseTask {

    /**
     * 列数满足的播放条件，目前只有5连及6连动画
     */
    protected fullLineCounts: number[] = [5, 6];

    /**
     * 持续时间,以毫秒为单位，默认1500
     */
    protected duration: number = 1500;

    constructor() {
        super();
    }


    /**
     * 
     * 
     */
    public runningTask(): void {
        let lines: RollingResult[] = this.getLineResults();
        let scroller: JTChannelScrollerGroup = this.lineParser.owner as JTChannelScrollerGroup;
        let combineRule = scroller.getRuleTask(JTRuleTaskType.COMBINE) as JTCombineTask;
        if (combineRule && !combineRule.checkCanPlayLine()) {
            this.complete();
            return;
        }
        let col = scroller.config.col;
        let showAllLine = false;
        for (let line of lines) {
            if (line.eleNum >= col && this.fullLineCounts.indexOf(col) > -1 && (line.lineType == JTLineType.LINE || line.lineType == JTLineType.FULL_LINE || line.lineType == JTLineType.APPOINT_LINE)) {
                showAllLine = true;
                break;
            }
        }

        if (showAllLine) {
            game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_FULL_LINE_HIT, col, Handler.create(this, this.complete));
            // setTimeout(() => {
            //     this.complete();
            // },this.duration);

        } else {
            this.complete();
        }
    }



}