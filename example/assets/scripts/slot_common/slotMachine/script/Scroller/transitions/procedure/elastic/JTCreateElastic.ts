/*
* name;
*/
import JTCreate from "../../../com/plugins/procedure/JTCreate";
import JTScroller from "../../../com/JTScroller";
import JTConfigGroup from "../../../com/JTConfigGroup";
import JTItemRender from "../../../com/base/JTItemRender";
import JTChildFactory from "../../../com/factorys/JTChildFactory";
import JTElasticPipeline from "./JTElasticPipeline";
import JTLayoutPoint from "../../../extensions/JTLayoutPoint";
export default class JTCreateElastic extends JTCreate
{
    constructor()
    {
        super();
    }

    public create():void
    {
        let s:JTScroller = this._scroller as JTScroller;
        let c:JTConfigGroup = s.config;
        let pipeline:JTElasticPipeline = this.owner as JTElasticPipeline;
        this.setScrollerXY(s.index * (c.gapXLandscape+c.girdWidth),0,s.index * (c.gapXPortrait+c.girdWidth),0);

        let isCreate:boolean = false;
        if (pipeline.lineTimes.length > 0)
        {
                isCreate = true;
        }
        for (let i:number = 0; i < c.row; i++)
        {
                let render:JTItemRender = this.getObject(JTChildFactory.ITEMRENDER_TYPE, s) as JTItemRender;
                render.y = i * c.gapHeight;
                render.width = c.girdWidth;
                render.height = c.girdHeight;
                s.addChildItem(render);
                render.setAnchorPoint(0.5, 0.5);
                let layoutPoint = new JTLayoutPoint();
                layoutPoint.landscapeX = c.girdWidth / 2;
                layoutPoint.landscapeY = -(i-1)*(c.girdHeight+c.gapYLandscape)-c.girdHeight/2;
                layoutPoint.portraitX = c.girdWidth / 2;
                layoutPoint.portraitY = -(i-1)*(c.girdHeight+c.gapYPortrait)-c.girdHeight/2;
                this.setupRender(render,layoutPoint);
                render.data = this.dataList[i];
                if (!isCreate)pipeline.lineTimes.push(new cc.ActionInterval());
        }
        this.complete();
    }
}