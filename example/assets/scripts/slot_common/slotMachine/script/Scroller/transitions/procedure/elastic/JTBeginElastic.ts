/*
* name;
*/
import JTBeginRunning from "../../../com/plugins/procedure/JTBeginRunning";
import JTScroller from "../../../com/JTScroller";
import JTItemRender from "../../../com/base/JTItemRender";
import JTConfigGroup from "../../../com/JTConfigGroup";
import JTSingleElasticPipeline from "./JTSingleElasticPipeline";
import JTOptionTask from "../../../com/tasks/JTOptionTask";
export default class JTBeginElastic extends JTBeginRunning
{
    constructor()
    {
        super();
    }

    public beginRunning():void
    {
        this.clear();
        let s:JTScroller = this._scroller as JTScroller;
        let c:JTConfigGroup = s.config;
        let pipeline:JTSingleElasticPipeline = this.owner as JTSingleElasticPipeline;
        let count:number = s.items.length;
        for (let i:number = 0; i < count; i++)
        {
                let r:JTItemRender = s.items[i] as JTItemRender;
                let lineTime:cc.ActionInterval = pipeline.lineTimes[i];
                let rondom:number = Math.random() * count + 1;
                let x:number = Math.floor(i / c.row) * c.gapWidth;
                let y:number = (i % c.row) * c.gapHeight;
                r.x = x;
                r.y = y;
                lineTime = cc.sequence(cc.delayTime(s.beginTime * rondom / 1000),cc.moveTo(s.time / 1000,new cc.Vec2(x ,s.config.getHeight())).easing(cc.easeElasticInOut(3.0)),cc.callFunc(completeCall,this,[i,r]));
                r.runAction(lineTime);//cocos
                // lineTime.to(r, {y:s.config.getHeight(), x:x}, s.time, Laya.Ease.elasticInOut, Handler.create(this, completeCall, [i, lineTime]), s.beginTime * rondom);
        }

        let option:JTOptionTask = this;
        function completeCall(index?:number, cr?:JTItemRender):void
        {
                cr.stopAllActions();
                let s:JTScroller = this._scroller as JTScroller;
                if (index < s.items.length - 1)
                {
                    return;
                }
                option.complete();
        }
    }
}