/*
* name;
*/
import JTItemRender from "../../../com/base/JTItemRender";
import JTSingleScheduledPipeline from "../../../com/plugins/procedure/JTSingleScheduledPipeline";
import JTConfigGroup from "../../../com/JTConfigGroup";
import JTScroller from "../../../com/JTScroller";
export default class JTSingleElasticPipeline extends JTSingleScheduledPipeline
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
                // let lineTime:cc.ActionInterval = this.lineTimes[i];
                // lineTime.clear();
                this.lineTimes[i] = null;
        }
    }

    public updateRenders():void
    {
        let s:JTScroller = this._scroller;
        let index:number = 0;
        let c:JTConfigGroup = s.config;
        s.renders.length = 0;
        for (let i:number = 0; i < s.items.length; i++)
        {
            let r:JTItemRender = s.items[i] as JTItemRender;
            r.gotoAndStop(JTItemRender.STATE_DEFAULT);
            r.scaleX = r.scaleY = 1;
            r.opacity = r.scaleX * 255;
            r.data = s.dataList[i];
            r.index = s.indexs[index];
            r.x = i / c.col * c.gapWidth;
            r.y = (i % c.row) * c.gapHeight;
            s.renders.push(r);
            index ++;
        }
    }

    public lineTimeComplete():void
    {
        let s:JTScroller = this._scroller;
        let index:number = 0;
        s.renders.length = 0;
        for (let i:number = 0; i < s.items.length; i++)
        {
            let r:JTItemRender = s.items[i] as JTItemRender;
            r.gotoAndStop(JTItemRender.STATE_DEFAULT);
            r.data = s.dataList[i];
            r.index = s.indexs[index];
            s.renders.push(r);
            index ++;
        }
    }
}