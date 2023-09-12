/*
* name;
*/
import JTScroller from "../../../com/JTScroller";
import JTBeginRunning from "../../../com/plugins/procedure/JTBeginRunning";
import JTAnomalyPipeline from "./JTAnomalyPipeline";

export default class JTBeginAnomaly extends JTBeginRunning {
    constructor() {
        super();
    }

    public beginRunning(): void {
        // let pipeline: JTAnomalyPipeline = this.owner as JTAnomalyPipeline;
        // pipeline.reSetCounterIndex();
        // this.complete();
        
        let s:JTScroller = this._scroller as JTScroller;
        let d:number = s.speed > 0 ? s.distance : -s.distance;
        let pipeline:JTAnomalyPipeline = this.owner as JTAnomalyPipeline;
        pipeline.lineTime=new cc.Tween();
        pipeline.lineTime.target(s); 
        pipeline.lineTime
         .delay(s.delay / 1000)
         .to(s.beginTime / 1000,{y:d})
         .call(()=>{
              this.complete();
         })
         .start();
    }


}