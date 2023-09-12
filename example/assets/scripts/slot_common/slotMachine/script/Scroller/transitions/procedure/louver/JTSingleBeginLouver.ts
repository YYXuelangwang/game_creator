/*
* name;
*/
import JTScroller from "../../../com/JTScroller";
import JTItemRender from "../../../com/base/JTItemRender";
import JTBeginRunning from "../../../com/plugins/procedure/JTBeginRunning";
import JTSingleLouverPipeline from "./JTSingleLouverPipeline";
import JTOptionTransition from "../../../com/plugins/procedure/JTOptionTransition";

export default class JTSingleBeginLouver extends JTBeginRunning
{
    constructor()
    {
        super();
    }

    public beginRunning():void
    {
                this.clear();
                let s:JTScroller = this._scroller as JTScroller;
                let pipeline:JTSingleLouverPipeline = this._owner as JTSingleLouverPipeline;
                let items:any[] = s.items;
                for (let i:number = 0; i < items.length; i++)
                {
                        let r:JTItemRender = items[i] as JTItemRender;
                        let lineTime:cc.ActionInterval = pipeline.lineTimes[i];
                        r.scaleX = r.scaleY = 1;
                        lineTime = cc.sequence(cc.delayTime((r.index * s.beginTime) / 2 / 1000),cc.spawn(cc.scaleTo(s.time / 1000,0,0).easing(cc.easeElasticInOut(3.0)),cc.fadeOut(s.time / 1000)),cc.callFunc(completeCall,this,[i,r]));
                        r.runAction(lineTime);//cocos
                        // lineTime.to(r, {scaleX:0, scaleY:0, alpha:0}, s.time, Laya.Ease.elasticInOut, Laya.Handler.create(this, completeCall, [i, lineTime]), (r.index * s.beginTime) / 2);
                }

                let option:JTOptionTransition = this;
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

    // public complete():void
    // {
           

    // }

//     public complete(index?:number, lineTween?:Laya.Tween):void
//     {
//             super.complete();
//             lineTween.clear();
//             let s:JTScroller = this._scroller as JTScroller;
//             if (index < s.config.row - 1)
//             {
//                     return;
//             }
//             if (s.index != s.config.col - 1)
//             {
//                     return;
//             }
//             let group:JTScrollerGroup = s.owner as JTScrollerGroup;
//             let scrollers:JTIItemSkinLoader[] = group.items;
//             for (let i:number = 0; i < scrollers.length; i++)
//             {
//                     let scroller:JTScroller = scrollers[i] as JTScroller;
//                     let plugin:JTLouverPipeline = scroller.pipeline as JTLouverPipeline;
//                     plugin.overRunning();
//             }
//     }
}