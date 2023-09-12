/*
* name;
*/
import JTItemRender from "../../../com/base/JTItemRender";
import JTSingleScheduledPipeline from "../../../com/plugins/procedure/JTSingleScheduledPipeline";
import JTConfigGroup from "../../../com/JTConfigGroup";
import JTScroller from "../../../com/JTScroller";
export default class JTElasticPipeline extends JTSingleScheduledPipeline
{
    public lineTimes:cc.ActionInterval[] = []
    constructor()
    {
        super();
        this.lineTimes = [];
    }

    public clear():void
    {
        for (let i:number = 0; i < this.lineTimes.length; i++)
        {
                let lineTime:cc.ActionInterval = this.lineTimes[i];
                // lineTime =
        }
    }

    public updateRenders():void
    {
        let s:JTScroller = this._scroller;
        let c:JTConfigGroup = s.config;
        s.renders.length = 0;
        for (let i:number = 0; i < s.items.length; i++)
        {
            let r:JTItemRender = s.items[i] as JTItemRender;
            r.gotoAndStop(JTItemRender.STATE_DEFAULT);
            r.scaleX = r.scaleY = 1;
            r.opacity = r.scaleX * 255;
            r.data = s.dataList[i];
            r.index = s.indexs[i];
            r.x = Math.floor(i / c.col) * c.gapWidth;
            r.y = (i % c.row) * c.gapHeight;
            s.renders.push(r);
        }
    }

    public lineTimeComplete():void
    {
        let s:JTScroller = this._scroller;
        s.renders.length = 0;
        for (let i:number = 0; i < s.items.length; i++)
        {
            let r:JTItemRender = s.items[i] as JTItemRender;
            r.gotoAndStop(JTItemRender.STATE_DEFAULT);
            r.data = s.dataList[i];
            r.index = s.indexs[i];
            s.renders.push(r);
            r.scaleX = r.scaleY = 1;
            r.opacity = r.scaleX * 255;
        }
    }
}