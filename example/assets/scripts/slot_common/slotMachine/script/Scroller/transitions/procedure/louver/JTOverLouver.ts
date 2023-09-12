/*
* name;
*/
import JTOverRunning from "../../../com/plugins/procedure/JTOverRunning";
import JTScroller from "../../../com/JTScroller";
import JTLouverPipeline from "./JTLouverPipeline";
import JTConfigGroup from "../../../com/JTConfigGroup";
import JTItemRender from "../../../com/base/JTItemRender";
import JTOptionTask from "../../../com/tasks/JTOptionTask";
export default class JTOverLouver extends JTOverRunning
{
    constructor()
    {
        super();
    }

    public overRunning():void
    {
        let pipeline:JTLouverPipeline = this._owner as JTLouverPipeline;
        pipeline.lineTimeComplete();
        let s:JTScroller = this._scroller as JTScroller;
        let c:JTConfigGroup = s.config;
        let items:any[] = s.items;
        for (let i:number = 0; i < items.length; i++)
        {
                let r:JTItemRender = items[i] as JTItemRender;
                let lineTime:cc.ActionInterval = pipeline.lineTimes[i];
                let x:number = Math.floor(i / c.row) * c.gapWidth;
                let y:number = (i % c.row) * c.gapHeight;
                r.x = x;
                r.y = y;
                r.scaleX = r.scaleY = 0;
                r.opacity = r.scaleX * 255;
                lineTime = cc.sequence(cc.delayTime((r.index * 20) / 2 / 1000),cc.spawn(cc.scaleTo(s.time * 1.5 / 1000,1,1).easing(cc.easeElasticInOut(3.0)),cc.fadeIn(s.time * 1.5 / 1000)),cc.callFunc(completeCall,this,[i,r]));
                r.runAction(lineTime);//cocos
                // lineTime.to(r, {scaleX:1, scaleY:1, alpha:1}, s.time * 1.5, Laya.Ease.elasticInOut, Laya.Handler.create(this, completeCall, [i, lineTime]), r.index * 20);
        }

        let option:JTOptionTask = this;
        function completeCall(index?:number, cr?:JTItemRender):void
        {
                cr.stopAllActions();//cocos
                if (index < items.length - 1)
                {
                        return;
                }
                option.complete();
        }
    }
}