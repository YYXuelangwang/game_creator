/*
* name;
*/
import JTCreate from "../../../com/plugins/procedure/JTCreate";
import JTScroller from "../../../com/JTScroller";
import JTConfigGroup from "../../../com/JTConfigGroup";
import JTItemRender from "../../../com/base/JTItemRender";
import JTChildFactory from "../../../com/factorys/JTChildFactory";
import JTSingleLouverPipeline from "./JTSingleLouverPipeline";
import JTLayoutPoint from "../../../extensions/JTLayoutPoint";

export default class JTSingleCreateLouver extends JTCreate
{
    constructor()
    {
        super();
    }

    public create():void
    {
        let s:JTScroller = this._scroller as JTScroller;
        let c:JTConfigGroup = s.config;
        let pipeline:JTSingleLouverPipeline = this.owner as JTSingleLouverPipeline;
        this.setScrollerXY(s.index * (c.gapXLandscape+c.girdWidth),0,s.index * (c.gapXPortrait+c.girdWidth),0);


        for (let i:number = 0; i < c.col; i++)
        {
                for (let k:number = 0; k < c.row; k++)
                {
                        let render:JTItemRender = this.getObject(JTChildFactory.ITEMRENDER_TYPE, s) as JTItemRender;
                        render.x = i * c.gapWidth;
                        render.y = k * c.gapHeight;
                        render.width = c.girdWidth;
                        render.height = c.girdHeight;
                        s.addChildItem(render);
                        render.setAnchorPoint(0.5, 0.5);

                        let layoutPoint = new JTLayoutPoint();
                        layoutPoint.landscapeX = i * (c.gapXLandscape+c.girdWidth) - c.girdWidth / 2;
                        layoutPoint.landscapeY = -c.girdHeight / 2;
                        layoutPoint.portraitX = i * (c.gapXPortrait+c.girdWidth) - c.girdWidth / 2;
                        layoutPoint.portraitY = -c.girdHeight / 2;

                        
                        this.setupRender(render,layoutPoint);
                        let index:number = render.index;
                        render.data = this.dataList[index];
                        pipeline.lineTimes[index] = new cc.ActionInterval();
                }
        }
        this.complete();
    }
}