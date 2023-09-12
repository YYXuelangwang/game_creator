
import { SOUND_NAME } from "../../../../../../common/enum/CommonEnum";
import { GData } from "../../../../../../common/utils/GData";
import { SoundMger } from "../../../../../../sound/script/SoundMger";
import { SlotOrientation } from "../../../../SlotDefinitions/SlotEnum";
import { Handler } from "../../../../SlotUtils/Handle";
import JTScroller from "../../../com/JTScroller";
import JTScrollerGroup from "../../../com/JTScrollerGroup";
import JTScheduledPipeline from "../../../com/plugins/JTScheduledPipeline";
import JTProcedure from "../../../com/plugins/procedure/JTProcedure";
import EliminateEffectUtils from "../eliminate/EliminateEffectUtils";
import JTOverScrolling from "../scrolling/JTOverScrolling";
import JTUnfixedLengthPipeline from "./JTUnfixedLengthPipeline";

/*
* 滚完后的结束任务
*/
export default class JTOverUnfixedLength extends JTOverScrolling {


    public overRunning(): void {
        let s: JTScroller = this._scroller as JTScroller;
        let pipeline: JTUnfixedLengthPipeline = this.owner as JTUnfixedLengthPipeline;
        let es = pipeline.extendScrollerInfo;
        SoundMger.instance.stopEffect(SOUND_NAME.Reel_Quick);
        if (s.isScatter() && GData.getParameter('sound')[SOUND_NAME.Sctter]&&(pipeline.scatterRule&&pipeline.scatterRule.isTreatScatterEvent())) {
            SoundMger.instance.playEffect(SOUND_NAME.Sctter + "_0" + (s.index + 1));
        } else {
            if (s.index == s.config.col - 1) {
                SoundMger.instance.stopEffect(SOUND_NAME.Reel_Spin);
            }
            SoundMger.instance.playEffect(SOUND_NAME.Reel_Stop);
        }

        if (s == null || s.parent == null) {
            pipeline.clear();
            return;
        }

        if (s.dataList.length == 0) return;

        pipeline.lineTimeComplete();

        let orientation = es?es.direction:s.config.orientation;
        if (orientation == SlotOrientation.Portrait) {
            let y = s.speed > 0 ? this.scroller.endDistance : -this.scroller.endDistance;
            pipeline.lineTime = new cc.Tween();
            pipeline.lineTime.target(s);
            pipeline.lineTime.by(0.5 * s.endTime / 1000, { y: y })
                .to(0.5 * s.endTime / 1000, { y: 0 }, { easing: "backOut" })
                .call(() => {
                    s.onStopRoll();
                    this.scrollComplete();
                })
                .start();
        } else {
            let x = s.speed > 0 ? this.scroller.endDistance : -this.scroller.endDistance;
            pipeline.lineTime = new cc.Tween();
            pipeline.lineTime.target(s);
            pipeline.lineTime.by(0.5 * s.endTime / 1000, { x: x })
                .to(0.5 * s.endTime / 1000, { x: es?es.position.x:0 }, { easing: "backOut" })
                .call(() => {
                    s.onStopRoll();
                    this.scrollComplete();
                })
                .start();
        }
    }
      
    public scrollComplete():void
    {  

        let s: JTScroller = this._scroller as JTScroller;
        let pipeline: JTUnfixedLengthPipeline = this._owner as JTUnfixedLengthPipeline;
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
            EliminateEffectUtils.processUnfixedLengthEliminateEffect(this.scrollerGroup,Handler.create(this,this.processEnd),false);
          }
    }


    private processEnd():void
    {
        let items =(this.scrollerGroup as JTScrollerGroup).items
        for(let i:number=0;i<items.length;i++) 
        {
            let s = items[i] as JTScroller
            let pipeline = s.pipeline as JTUnfixedLengthPipeline; 
            pipeline.updateRenderData();
        }
        this.complete()
    }

}