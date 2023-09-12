import EliminateEffectUtils from "./EliminateEffectUtils";
import JTEliminatePipeline from "./JTEliminatePipeline";
import JTRunning from "../../../com/plugins/procedure/JTRunning";
import JTScroller from "../../../com/JTScroller";
import { Handler } from "../../../../SlotUtils/Handle";
import JTScrollerGroup from "../../../com/JTScrollerGroup";
/*
* 消除类,新的格子出现过程，表现为新的格子掉落，掉落形式为一行新的格子出现在第一行位置，然后掉落完接着下一行出现再出现掉落
*/
export default class JTRunEliminateFallByRow  extends JTRunning{
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
           this.changeItem();
           this.endComplete()
       }
    }
    
      //消失
    private dropItem():void 
    {
          this.changeItem();
          EliminateEffectUtils.startEffect(this.owner.owner.owner as JTScrollerGroup,Handler.create(this,this.endComplete,[]),450 )
    }

    
    public changeItem():void
    {
            let s:JTScroller = this._scroller as JTScroller;
            if (s.dataList.length == 0) return;
            let pipeline:JTEliminatePipeline = this.owner as JTEliminatePipeline;
            pipeline.lineTimeComplete();
    }

    public endComplete():void
    {
        super.complete();
    }

}