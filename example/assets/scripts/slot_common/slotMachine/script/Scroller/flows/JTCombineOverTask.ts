import { GameEventNames } from "../../SlotConfigs/GameEventNames";
import { Handler } from "../../SlotUtils/Handle";
import JTItemRender from "../com/base/JTItemRender";
import JTLineScrollerGroup from "../extensions/JTLineScrollerGroup";
import JTScrollerLineParser from "../lines/JTScrollerLineParser";
import JTCombineTask from "../rules/JTCombineTask";
import JTRuleTaskType from "../rules/JTRuleTaskType";

import JTPerformanceTask from "./JTPerformanceTask";

/**
 * 合并滚轴在免费游戏完结后的拆分
 */
export default class JTCombineOverTask extends JTPerformanceTask {
    
    private isTreateFreeOver:boolean = false;
    private combineRule:JTCombineTask = null;
    public addEventListenner(): void {
        game.EventManager.getInstance().addEventListener(GameEventNames.EVENT_FREE_GAME_OVER_TASK, this.treateFreeOver, this);
    }

    private getCombineRule():JTCombineTask{
        if(!this.combineRule){
            let lineParser: JTScrollerLineParser = this.getLineParser();
            let scrollerGroup: JTLineScrollerGroup = lineParser.owner as JTLineScrollerGroup;
    
            this.combineRule = scrollerGroup.getRuleTask(JTRuleTaskType.COMBINE) as JTCombineTask;
        }
        return this.combineRule;
    }

    runningTask():void{
        let combineRule = this.getCombineRule();
        if(combineRule&&this.isTreateFreeOver){
            this.combineScollerSplit();
        }else{
           this.complete();
        }

    }
    
    private treateFreeOver():void{
        this.isTreateFreeOver = true;
    }

    private combineScollerSplit():void{
        this.lineParser = this.getLineParser();
        this.lineParser.showLines(0);
        let scroller = this.lineParser.owner as JTLineScrollerGroup;
        scroller.enableds(JTItemRender.STATE_DEFAULT);
        let combineRule = this.getCombineRule();
        combineRule.combineComplete(Handler.create(this,this.complete));

    }

    complete():void{
       this.isTreateFreeOver = false;
       super.complete();
    }

}
