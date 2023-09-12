
import { SlotOrientation } from "../../../../SlotDefinitions/SlotEnum";
import JTScroller from "../../../com/JTScroller";
import JTBeginRunning from "../../../com/plugins/procedure/JTBeginRunning";
import JTBeginScrolling from "../scrolling/JTBeginScrolling";
import JTUnfixedLengthPipeline from "./JTUnfixedLengthPipeline";

/*
* name;
*/
export default class JTBeginUnfixedLength extends JTBeginRunning
{

    public beginRunning():void
    {
            this._scroller.isRunning = true;
            this.beginStart();
    }

    public beginStart():void
    {
            let s:JTScroller = this._scroller as JTScroller;
            let d:number = s.speed > 0 ? s.distance : -s.distance;
            let pipeline = this.owner as JTUnfixedLengthPipeline;
            let orientation = s.config.orientation;
            if(pipeline.extendScrollerInfo){
                orientation = pipeline.extendScrollerInfo.direction;
            }

            pipeline.lineTime=new cc.Tween();
            pipeline.lineTime.target(s);

            if(orientation == SlotOrientation.Portrait){
                pipeline.lineTime
                .delay(s.delay / 1000)
                .to(s.beginTime / 1000,{y:d})
                .call(()=>{
                     this.complete();
                })
                .start();
            }else{
                pipeline.lineTime
                .delay(s.delay / 1000)
                .to(s.beginTime / 1000,{x:d})
                .call(()=>{
                     this.complete();
                })
                .start();
            }


             
    }

}