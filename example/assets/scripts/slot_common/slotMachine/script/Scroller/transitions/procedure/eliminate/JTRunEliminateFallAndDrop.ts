import EliminateEffectUtils from "./EliminateEffectUtils";
import JTEliminatePipeline from "./JTEliminatePipeline";
import JTRunning from "../../../com/plugins/procedure/JTRunning";
import JTScroller from "../../../com/JTScroller";
import { Handler } from "../../../../SlotUtils/Handle";
import JTScrollerGroup from "../../../com/JTScrollerGroup";
/*
* 消除类,旧格子掉落与新格子同时出现，JTBeginRunning只与JTEmptyBeginEliminate搭配
*/
export default class JTRunEliminateFallAndDrop  extends JTRunning{
    constructor(){
       super();
    }

    public  running():void
    {
      this._scroller.isRunning = true;

      let pipeline:JTEliminatePipeline = this._owner as JTEliminatePipeline;
       if ((pipeline.owner as JTScroller).index==this.scroller.config.col-1)
       {
            this.dropItem(); 
       }
       else    
       {
           this.endComplete()
       }
    }
    
    private dropItem():void 
    {
          EliminateEffectUtils.beginFallToBelowThenAboveFall(this.owner.owner.owner as JTScrollerGroup,Handler.create(this,this.endComplete,[]));

    }

    

    public endComplete():void
    {
        super.complete();
    }

}