/*
* name;
*/
import JTBeginRunning from "../../../com/plugins/procedure/JTBeginRunning";
import JTScroller from "../../../com/JTScroller";
import JTLouverPipeline from "./JTLouverPipeline";
import JTItemRender from "../../../com/base/JTItemRender";
export default class JTBeginLouver extends JTBeginRunning
{
    constructor()
    {
            super();
    }

    public beginRunning():void
    {
        this.clear();
        let s:JTScroller = this._scroller as JTScroller;
        let pipeline:JTLouverPipeline = this._owner as JTLouverPipeline;
        let items:any[] = s.items;
        for (let i:number = 0; i < items.length; i++)
        {
                let r:JTItemRender = items[i] as JTItemRender;
                let lineTime:cc.ActionInterval = pipeline.lineTimes[i];
                r.scaleX = r.scaleY = 1;
                lineTime = cc.sequence(cc.delayTime((r.index * 20) / 2 / 1000),cc.spawn(cc.scaleTo(s.time * 1.5 / 1000,0,0).easing(cc.easeElasticInOut(3.0)),cc.fadeOut(s.time * 1.5 / 1000)),cc.callFunc(completeCall,this,[i,r]));
                r.runAction(lineTime);//cocos
                // lineTime.to(r, {scaleX:0, scaleY:0, alpha:0}, s.time * 1.5, Laya.Ease.elasticInOut, Laya.Handler.create(this, completeCall, [i, lineTime]), r.index * 20);
        }

        function completeCall(index?:number, cr?:JTItemRender):void
        {
                cr.stopAllActions();//cocos
                if (index < items.length - 1)
                {
                        return;
                }
                pipeline.runningTask();
        }
    }
}