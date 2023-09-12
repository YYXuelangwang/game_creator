import { Handler } from "../../../../SlotUtils/Handle";
import JTItemSkinLoader from "../../../com/base/JTItemSkinLoader";
import JTScroller from "../../../com/JTScroller";
import JTScrollerGroup from "../../../com/JTScrollerGroup";
import JTFuturePipeline from "../../../com/plugins/JTFuturePipeline";
import EliminateDisappearUtils from "./EliminateDisappearUtils";
import JTEliminatePipeline from "./JTEliminatePipeline";
import JTBeginRunning from "../../../com/plugins/procedure/JTBeginRunning";
import JTScheduledPipeline from "../../../com/plugins/JTScheduledPipeline";
import JTProcedure from "../../../com/plugins/procedure/JTProcedure";


/**
 * 消除类开始，表现为旧的格子全部消失
 */
export default class JTBeginEliminateDisppear extends JTBeginRunning{
    constructor(){
        super();
    }

    public dataStandby():void{
        super.dataStandby();
        this.beginRunning();
    }

    public beginRunning():void
    {
        if(!this.isDataReady){
            return;
        }
        this.clear();
        let pipeline:JTEliminatePipeline = this._owner as JTEliminatePipeline;
        if ( (pipeline.owner as JTScroller).index==this.scroller.config.col-1 )
        {
            EliminateDisappearUtils.processDissppear(this.owner.owner.owner as JTScrollerGroup ,Handler.create(this,this.disappearComplete) );
        }

    }



    private disappearComplete():void 
    {
        var items:JTItemSkinLoader[]=(this.owner.owner.owner as JTScrollerGroup).items
        for(let i:number=0;i<items.length;i++) 
        {
            let pipeline:JTScheduledPipeline = (items[i] as JTScroller).pipeline as JTScheduledPipeline; 
            let task = pipeline.getCurrentTask() as JTProcedure;
            task.complete();
        }
         
    }

}