import JTBeginRunning from "../../../com/plugins/procedure/JTBeginRunning";
import JTScrollingPipeline from "./JTScrollingPipeline";
import JTScroller from "../../../com/JTScroller";

/*
* name;
*/
export default class JTBeginScrolling extends JTBeginRunning
{
    constructor()
    {
            super();
    }

    public beginRunning():void
    {
            this._scroller.isRunning = true;
            //this._scroller.delay > 0 ? this.beginStart() : this.complete();
            this.beginStart();
    }

    public beginStart():void
    {
            let s:JTScroller = this._scroller as JTScroller;
            let d:number = s.speed > 0 ? s.distance : -s.distance;
            let pipeline:JTScrollingPipeline = this.owner as JTScrollingPipeline;
            pipeline.lineTime=new cc.Tween();
            pipeline.lineTime.target(s); 
            let y = s.y;
            pipeline.lineTime
             .delay(s.delay / 1000)
             .to(s.beginTime / 1000,{y:d})
             .call(()=>{
                  this.complete();
             })
             .start();
             
    }
}