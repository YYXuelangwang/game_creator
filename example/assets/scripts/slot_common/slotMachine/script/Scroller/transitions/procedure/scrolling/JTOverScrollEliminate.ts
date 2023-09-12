import JTScroller from "../../../com/JTScroller";
import EliminateEffectUtils from "../eliminate/EliminateEffectUtils";
import JTScrollerGroup from "../../../com/JTScrollerGroup";
import { Handler } from "../../../../SlotUtils/Handle";
import JTOverScrolling from "./JTOverScrolling";
import JTEliminatePipeline from "../eliminate/JTEliminatePipeline";
import { SOUND_NAME } from "../../../../../../common/enum/CommonEnum";
import { SoundMger } from "../../../../../../sound/script/SoundMger";
import JTScheduledPipeline from "../../../com/plugins/JTScheduledPipeline";
import JTProcedure from "../../../com/plugins/procedure/JTProcedure";

/*
* 滚动完后接着消除的任务,表现形式为格子消失后每列马上填充空白区域
*/
export default class JTOverScrollEliminate extends JTOverScrolling {
    constructor() {
        super();
    }

    public scrollComplete():void
    {  

        let s: JTScroller = this._scroller as JTScroller;
        let pipeline: JTEliminatePipeline = this._owner as JTEliminatePipeline;
        pipeline.onceWild && pipeline.onceWild.callWatchWild(s);
        if (pipeline.scatterRule) {
            pipeline.scatterRule.callScatterComplete(s);
            pipeline.scatterRule.callWatchScatter(s);
        }


        let items =this.scrollerGroup.items;
        let runningTaskCount = 0;
        for(let i:number=0;i<items.length;i++) 
        {
            let pipeline:JTScheduledPipeline = (items[i] as JTScroller).pipeline as JTScheduledPipeline; 
            let task = pipeline.getCurrentTask() as JTProcedure;
            if(task){
                runningTaskCount++;
            }
        }

       if ( runningTaskCount==1)
       {
           this.eliminate(); 
           SoundMger.instance.stopEffect(SOUND_NAME.Reel_Spin);
       }
       else
       {
           this.complete();
       }
        
    }

    private eliminate ():void
    {
          if(this.scrollerGroup.isSkipChangeTask){
            this.complete();
          }else{
            this.scrollerGroup.updateRenders();
            EliminateEffectUtils.resetElimate();
            EliminateEffectUtils.processEliminateEffect(this.scrollerGroup,Handler.create(this,this.processEnd),false);
          }
    }


    private processEnd():void
    {
        let items =(this.scrollerGroup as JTScrollerGroup).items
        for(let i:number=0;i<items.length;i++) 
        {
            let s = items[i] as JTScroller
            let pipeline:JTEliminatePipeline = s.pipeline as JTEliminatePipeline; 
            pipeline.updateRenderData();
        }
        this.complete()
    }

    public complete(): void {
        super.complete();
    }
}