/*
* name;
*/
import JTOverRunning from "../../../com/plugins/procedure/JTOverRunning";
import JTScroller from "../../../com/JTScroller";
import JTConfigGroup from "../../../com/JTConfigGroup";
import JTItemRender from "../../../com/base/JTItemRender";
import JTSingleElasticPipeline from "./JTSingleElasticPipeline";
import JTOptionTransition from "../../../com/plugins/procedure/JTOptionTransition";
export default class JTSingleOverElastic extends JTOverRunning
{
    constructor()
    {
        super();
    }

    public overRunning():void
    {
            let pipeline:JTSingleElasticPipeline = this._owner as JTSingleElasticPipeline;
            pipeline.lineTimeComplete();
            let s:JTScroller = this._scroller as JTScroller;
            let c:JTConfigGroup = s.config;
            let count:number = s.items.length;
            for (let i:number = count - 1; i >= 0; i --)
            {
                    let r:JTItemRender = s.items[i] as JTItemRender;
                    let lineTime:cc.ActionInterval = pipeline.lineTimes[i];
                    let x:number = Math.floor(i / c.row) * c.gapWidth;
                    let y:number = (i % c.row) * c.gapHeight;
                    let v:number = (i + 1) % c.row;
                    let tc:number = 0;
                    if (v == 0)
                    {
                          tc = (c.col - v) + 1;
                    }
                    else
                    {
                            tc = (c.col - v) + count - i;
                    }
                    r.x = x;
                    r.y = -r.height;
                    lineTime = cc.sequence(cc.delayTime((tc * s.beginTime) / 2 / 1000),cc.moveTo(s.time / 1000,x,y).easing(cc.easeElasticInOut(3.0)),cc.callFunc(completeCall,this,[i,r]));
                    r.runAction(lineTime);//cocos
                //     lineTime.to(r, {y:y, x:x}, s.time, Laya.Ease.elasticInOut, Laya.Handler.create(this, completeCall, [i, lineTime]), (tc * s.beginTime) / 2);
            }

            
                let option:JTOptionTransition = this;
                let counter:number = 0;
                function completeCall(index?:number, cr?:JTItemRender):void
                {
                        cr.stopAllActions();//cocos
                        counter ++;
                        if (counter != option.dataList.length)
                        {
                                        return;
                        }
                        option.complete();
                }
    }
   
}