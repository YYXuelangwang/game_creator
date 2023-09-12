import JTBeginRunning from "../../../com/plugins/procedure/JTBeginRunning";
import JTScrollingPipeline from "./JTScrollingPipeline";
import JTScroller from "../../../com/JTScroller";
import JTCombineTask from "../../../rules/JTCombineTask";
import { Handler } from "../../../../SlotUtils/Handle";
import JTScrollerGroup from "../../../com/JTScrollerGroup";
import JTScheduledPipeline from "../../../com/plugins/JTScheduledPipeline";
import JTProcedure from "../../../com/plugins/procedure/JTProcedure";
import { JTRetainWildTask } from "../../../rules/JTRetainWildTask";
import JTDynamicCombineTask from "../../../rules/JTDynamicCombineTask";

/*
* 滚动前有动作的开始
*/
export default class JTAdvanceBeginScrolling extends JTBeginRunning
{
    constructor()
    {
            super();
    }

    public beginRunning():void
    {
        this.scroller.isRunning = true;
        let combine: JTCombineTask = (this._owner as JTScrollingPipeline).combineRule;
        let retainWild: JTRetainWildTask = (this._owner as JTScrollingPipeline).retainWild;
        let dynamicCombine: JTDynamicCombineTask = (this._owner as JTScrollingPipeline).dynamicCombine;
        let advanceTask = (this._owner as JTScrollingPipeline).advanceTask;


        if(combine&&combine.checkStart()){
            if (this.scroller.index==this.scroller.config.col-1 )
            {
                 combine.runStartCombine(Handler.create(this,this.advanceRuleComplete));
            }
        }else if(retainWild&&retainWild.checkStart()){
            if (this.scroller.index==this.scroller.config.col-1 )
            {
                retainWild.retainWildStart(Handler.create(this,this.advanceRuleComplete));
            }
        }else if(dynamicCombine&&dynamicCombine.isNeedStart()){
            if (dynamicCombine.isCombineScroller(this._scroller))
            {
                dynamicCombine.beforeStartRun(Handler.create(this,this.advanceRuleComplete));
            }
        }else if(advanceTask&&advanceTask.checkStart()){
            if (this.scroller.index==this.scroller.config.col-1 )
            {
                advanceTask.start(Handler.create(this,this.advanceRuleComplete));
            }
        }
        else{
            this.complete();
        }
    }

    public advanceRuleComplete():void{
          let items =(this.scrollerGroup as JTScrollerGroup).items
          for(let i:number=0;i<items.length;i++) 
          {
              let s = items[i] as JTScroller
              let pipeline:JTScheduledPipeline = s.pipeline as JTScheduledPipeline; 
              let task = pipeline.getCurrentTask() as JTProcedure;
              s.isRunning&&task.complete();
          }
           
    }

}