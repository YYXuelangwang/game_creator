import JTItemRender from "../../../com/base/JTItemRender";
import JTElementArrayList from "../../../com/datas/JTElementArrayList";
import JTChildFactory from "../../../com/factorys/JTChildFactory";
import JTConfigGroup from "../../../com/JTConfigGroup";
import JTScroller from "../../../com/JTScroller";
import JTScrollerGroup from "../../../com/JTScrollerGroup";
import JTScheduledPipeline from "../../../com/plugins/JTScheduledPipeline";
import JTCreate from "../../../com/plugins/procedure/JTCreate";
import JTLayoutPoint from "../../../extensions/JTLayoutPoint";
import JTGLoader from "../../../renders/JTGLoader";

/*
* name;
*/
export default class JTCreateEliminate extends JTCreate{
    constructor(){
      super();
    }


    public create():void
    {
            let s:JTScroller = this._scroller as JTScroller;
            let o:JTScrollerGroup = s.owner as JTScrollerGroup;
            let c:JTConfigGroup = s.config;
            this.setScrollerXY(s.index * (c.gapXLandscape+c.girdWidth),0,s.index * (c.gapXPortrait+c.girdWidth),0);

            let loader:JTGLoader = s.setupSkinLoader(s.x, s.y, o.skinLoaderContainer ? o.skinLoaderContainer : o , false);
            if (loader)
            {
                loader.width = s.width;
                loader.height = s.height;
            }
            for (let i:number = 0; i < c.row + 2; i++)
            {
                    let render:JTItemRender = this.getObject(JTChildFactory.ITEMRENDER_TYPE, s) as JTItemRender;
                    render.y = -(i - 1) * c.gapHeight-c.girdHeight/2;
                    render.x=c.girdWidth/2;
                    render.data = this.changedDataList[i];
                    render.changedData = this.changedDataList[i];
                    render.width = c.girdWidth;
                    render.height = c.girdHeight;
                    render.active=false ;

                    let layoutPoint = new JTLayoutPoint();
                    layoutPoint.landscapeX = c.girdWidth / 2;
                    layoutPoint.landscapeY = -(i-1)*(c.girdHeight+c.gapYLandscape)-c.girdHeight/2;
                    layoutPoint.portraitX = c.girdWidth / 2;
                    layoutPoint.portraitY = -(i-1)*(c.girdHeight+c.gapYPortrait)-c.girdHeight/2;

                    s.addChildItem(render);
                    if (i > 0 && i < c.row + 1)
                    {
                            this.setupRender(render,layoutPoint);
                    }
            }
            (this._dataProvider.grids as JTElementArrayList).dataList = this.dataList;
            this.complete();
    }

    public destroy():boolean
    {

        let s:JTScroller = this._scroller;
        let totalCount:number = s.items.length;
        for (let i:number = 0; i < totalCount; i++)
        {
               let t:JTItemRender = s.items.shift() as JTItemRender;
               t.removeFromParent();
        }
        let pipeline:JTScheduledPipeline = this._owner as JTScheduledPipeline;
        pipeline.items = [];
        pipeline.renders = [];

        return true;
    }


}