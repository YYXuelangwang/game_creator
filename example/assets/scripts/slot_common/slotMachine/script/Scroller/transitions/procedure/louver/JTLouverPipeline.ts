/*
* name;
*/
import JTScheduledPipeline from "../../../com/plugins/JTScheduledPipeline";
import JTItemRender from "../../../com/base/JTItemRender";
import JTScroller from "../../../com/JTScroller";
export default class JTLouverPipeline extends JTScheduledPipeline
{
    public lineTimes:cc.ActionInterval[] = null;
    constructor()
    {
        super();
        this.lineTimes = [];
    }

    public clear():void
    {
        for (let i:number = 0; i < this.lineTimes.length; i++)
        {
                // let lineTime:Laya.Tween = this.lineTimes[i];
                // lineTime.clear();
                this.lineTimes[i] = null;
        }
    }

    public updateRenders():void
    {
        let s:JTScroller = this._scroller;
        s.renders.length = 0;
        for (let i:number = 0; i < s.items.length; i++)
        {
            let r:JTItemRender = s.items[i] as JTItemRender;
            r.gotoAndStop(JTItemRender.STATE_DEFAULT);
            r.scaleX = r.scaleY = 1;
            r.opacity = r.scaleX * 255;
            r.data = s.dataList[i];
            r.index = s.indexs[i];
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
            r.changedData = s.changedDataList[i];
            r.index = s.indexs[i];
            s.renders.push(r);
        }
    }

    public resetRenderPoints():void{
        
    }
}