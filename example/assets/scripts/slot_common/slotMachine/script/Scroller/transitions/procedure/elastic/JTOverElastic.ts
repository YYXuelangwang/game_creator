/*
* name;
*/
import JTOverRunning from "../../../com/plugins/procedure/JTOverRunning";
import JTScroller from "../../../com/JTScroller";
import JTConfigGroup from "../../../com/JTConfigGroup";
import JTItemRender from "../../../com/base/JTItemRender";
import JTElasticPipeline from "./JTElasticPipeline";
import JTOptionTransition from "../../../com/plugins/procedure/JTOptionTransition";
export default class JTOverElastic extends JTOverRunning
{
        constructor()
        {
                super();
        }

        public overRunning():void
        {
                let pipeline:JTElasticPipeline = this._owner as JTElasticPipeline;
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
                        let z:number = 0;
                        if (v == 0)
                        {
                                z = (c.col - v) + 1;
                        }
                        else
                        {
                                z = (c.col - v) + count - i;
                        }
                        r.x = x;
                        r.y = -r.height;
                        r.scaleX = r.scaleY = 1;
                        r.opacity = r.scaleX * 255;

                        //cocos
                        lineTime = cc.moveTo(s.time,new cc.Vec2(x,y));
                        r.runAction(cc.sequence(cc.delayTime((z * s.beginTime) / 2), lineTime.easing(cc.easeElasticInOut(3.0)),cc.callFunc(completeCall,this,r)));
                        //     lineTime.to(r, {y:y, x:x}, s.time, Laya.Ease.elasticInOut, Handler.create(this, completeCall, [i, lineTime]), (z * s.beginTime) / 2);
                }

                let option:JTOptionTransition = this;
                let counter:number = 0;
                function completeCall(cr?:JTItemRender):void
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