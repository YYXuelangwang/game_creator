import { Handler } from "../../../../SlotUtils/Handle";
import JTScroller from "../../../com/JTScroller";
import JTScrollerGroup from "../../../com/JTScrollerGroup";
import EliminateEffectUtils from "./EliminateEffectUtils";
import JTEliminatePipeline from "./JTEliminatePipeline";
import JTOverRunning from "../../../com/plugins/procedure/JTOverRunning";


/*
* 消除类，新格子掉落完后的消除过程，表现形式为格子消失后每列都马上填充空白区域
*/
export default class JTOverEliminate extends JTOverRunning{
    constructor(){
        super();
    }

    public overRunning():void
    {  

       let pipeline:JTEliminatePipeline = this._owner as JTEliminatePipeline;

       this.scroller.adjustSkinRenders(false);

       if ( (pipeline.owner as JTScroller).index==this.scroller.config.col-1 )
       {
           this.eliminate(); 
       }
       else
       {
           this.complete();
       }
        
    }

    private eliminate ():void
    {
          this.scrollerGroup.updateRenders();
          EliminateEffectUtils.resetElimate();
          EliminateEffectUtils.processEliminateEffect(this.scrollerGroup as JTScrollerGroup,Handler.create(this,this.processEnd),false);
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
        this.complete();
    }

    public complete():void
    {
        let s:JTScroller = this._scroller as JTScroller;
        if (s.dataList.length == 0) return;
        let pipeline:JTEliminatePipeline = this.owner as JTEliminatePipeline;
        pipeline.onceWild && pipeline.onceWild.callWatchWild(s);
        super.complete();
    }
}