import { GameEventNames } from "../../SlotConfigs/GameEventNames";
import { Handler } from "../../SlotUtils/Handle";
import JTItemRender from "../com/base/JTItemRender";
import JTLineScrollerGroup from "../extensions/JTLineScrollerGroup";
import JTScrollerLineParser, { JTLineInfo } from "../lines/JTScrollerLineParser";
import JTCombineTask from "../rules/JTCombineTask";
import JTDynamicCombineTask from "../rules/JTDynamicCombineTask";
import JTRuleTaskType from "../rules/JTRuleTaskType";

import JTPerformanceTask from "./JTPerformanceTask";

/**
 * 
 */
export default class JTDynamicCombineSplit extends JTPerformanceTask {
    
    private dynamicCombine:JTDynamicCombineTask = null;
    public addEventListenner(): void {

    }

    private getCombineRule():JTDynamicCombineTask{
        if(!this.dynamicCombine){
            let lineParser: JTScrollerLineParser = this.getLineParser();
            let scrollerGroup: JTLineScrollerGroup = lineParser.owner as JTLineScrollerGroup;
    
            this.dynamicCombine = scrollerGroup.getRuleTask(JTRuleTaskType.DYNAMIC_COMBINE) as JTDynamicCombineTask;
        }
        return this.dynamicCombine;
    }

    runningTask():void{
        let dynamicCombine = this.getCombineRule();
        let lines = this.lineParser.playLineMap.values as JTLineInfo[];
        let renders = [];
        for(let i=0;i<lines.length;i++){
            renders = renders.concat(lines[i].renders);
        }
        if(dynamicCombine&&dynamicCombine.isNeedUpdateRenders(renders)){
            dynamicCombine.updateRendersBeforeLoopLine(renders,Handler.create(this,this.complete));
        }else{
           this.complete();
        }

    }


}
