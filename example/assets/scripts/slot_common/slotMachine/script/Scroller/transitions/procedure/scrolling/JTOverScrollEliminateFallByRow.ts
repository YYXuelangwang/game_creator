import JTOverRunning from "../../../com/plugins/procedure/JTOverRunning";
import JTScroller from "../../../com/JTScroller";
import JTScrollingPipeline from "./JTScrollingPipeline";
import EliminateEffectUtils from "../eliminate/EliminateEffectUtils";
import JTScrollerGroup from "../../../com/JTScrollerGroup";
import { Handler } from "../../../../SlotUtils/Handle";
import JTOverScrolling from "./JTOverScrolling";
import { SOUND_NAME } from "../../../../../../common/enum/CommonEnum";
import { SoundMger } from "../../../../../../sound/script/SoundMger";
import JTScheduledPipeline from "../../../com/plugins/JTScheduledPipeline";
import JTProcedure from "../../../com/plugins/procedure/JTProcedure";

/*
* 滚动完后接着消除的任务,表现形式为格子消失后一行出现掉落完再接着新的一行出现掉落
*/
export default class JTOverScrollEliminateFallByRow extends JTOverScrolling {
    constructor() {
        super();
    }

    public scrollComplete(): void {

        let items =(this.owner.owner.owner as JTScrollerGroup).items;
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

    private eliminate(): void {
        this.scrollerGroup.updateRenders();
        EliminateEffectUtils.resetElimate();
        EliminateEffectUtils.processEliminateEffect(this.scrollerGroup as JTScrollerGroup, Handler.create(this, this.processEnd), true);
    }


    private processEnd(): void {
        this.complete();
    }

    public complete(): void {
        let s: JTScroller = this._scroller as JTScroller;
        let pipeline: JTScrollingPipeline = this._owner as JTScrollingPipeline;
        pipeline.onceWild && pipeline.onceWild.callWatchWild(s);
        if (pipeline.scatterRule) {

            pipeline.scatterRule.callScatterComplete(s);
            pipeline.scatterRule.callWatchScatter(s);
        }
        super.complete();
    }
}