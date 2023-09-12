import JTCreate from "../../../com/plugins/procedure/JTCreate";
import JTScroller from "../../../com/JTScroller";
import JTConfigGroup from "../../../com/JTConfigGroup";
import JTItemRender from "../../../com/base/JTItemRender";
import JTChildFactory from "../../../com/factorys/JTChildFactory";
import JTLogger from "../../../JTLogger";
import JTGLoader from "../../../renders/JTGLoader";
import JTScrollerGroup from "../../../com/JTScrollerGroup";
import JTScheduledPipeline from "../../../com/plugins/JTScheduledPipeline";
import JTElementArrayList from "../../../com/datas/JTElementArrayList";
import { SlotOrientation } from "../../../../SlotDefinitions/SlotEnum";
import JTLayoutPoint from "../../../extensions/JTLayoutPoint";
import JTScrollingPipeline from "./JTScrollingPipeline";

/*
* name;
*/
export default class JTCreateScrolling extends JTCreate {
    constructor() {
        super();
    }

    public create(): void {
        let s: JTScroller = this._scroller as JTScroller;
        let o: JTScrollerGroup = s.owner as JTScrollerGroup;
        let c: JTConfigGroup = s.config;
        let pipeline: JTScrollingPipeline = this._owner as JTScrollingPipeline;
        let loader: JTGLoader = s.setupSkinLoader(s.x, s.y, o.skinLoaderContainer ? o.skinLoaderContainer : o, false);
        if (loader) {
            loader.width = s.width;
            loader.height = s.height;
        }
        if (c.orientation == SlotOrientation.Portrait) {
            this.setScrollerXY(s.index * (c.gapXLandscape+c.girdWidth),0,s.index * (c.gapXPortrait+c.girdWidth),0);
            for (let i: number = 0; i < c.row + 2; i++) {
                let render: JTItemRender = this.getObject(JTChildFactory.ITEMRENDER_TYPE, s) as JTItemRender;
                render.y = -(i - 1) * c.gapHeight - c.girdHeight / 2;
                render.x = c.girdWidth / 2;
                o.isIncline&&pipeline.adjustItemIncline(render);
                o.isCurve&&pipeline.adjustItemCurve(render);

                let layoutPoint = new JTLayoutPoint();
                layoutPoint.landscapeX = render.x;//c.girdWidth / 2;
                layoutPoint.landscapeY = -(i-1)*(c.girdHeight+c.gapYLandscape)-c.girdHeight/2;
                layoutPoint.portraitX = render.x;//c.girdWidth / 2;
                layoutPoint.portraitY = -(i-1)*(c.girdHeight+c.gapYPortrait)-c.girdHeight/2;

                render.data = this.changedDataList[i];
                render.width = c.girdWidth;
                render.height = c.girdHeight;
                s.addChildItem(render);
                if (i > 0 && i < c.row + 1) {
                    this.setupRender(render,layoutPoint);
                }
                else {
                    render.active = false;
                }
                render.changedData = this.changedDataList[i];
            }
        } else {
            this.setScrollerXY(0,-s.index * (c.gapYLandscape+c.girdHeight),0,s.index * (c.gapYPortrait+c.girdHeight));
            for (let i: number = 0; i < c.row + 2; i++) {
                let render: JTItemRender = this.getObject(JTChildFactory.ITEMRENDER_TYPE, s) as JTItemRender;
                render.x = i * c.gapWidth - c.girdWidth / 2;
                render.y = -c.girdHeight / 2;
                render.width = c.girdWidth;
                render.height = c.girdHeight;

                let layoutPoint = new JTLayoutPoint();
                layoutPoint.landscapeX = i * (c.gapXLandscape+c.girdWidth) - c.girdWidth / 2;
                layoutPoint.landscapeY = -c.girdHeight / 2;
                layoutPoint.portraitX = i * (c.gapXPortrait+c.girdWidth) - c.girdWidth / 2;
                layoutPoint.portraitY = -c.girdHeight / 2;

                s.addChildItem(render);
                if (i > 0 && i < c.row + 1) {
                    this.setupRender(render,layoutPoint);
                }
                else {
                    render.active = false;
                }
                render.data = this.changedDataList[i];
                render.changedData = this.changedDataList[i];
            }
        }

        s.sortItemszIndex();

        (this._dataProvider.grids as JTElementArrayList).dataList = this.dataList;
        this.complete();
    }

    public destroy(): boolean {
        let s: JTScroller = this._scroller;
        let totalCount: number = s.items.length;
        for (let i: number = 0; i < totalCount; i++) {
            let t: JTItemRender = s.items.shift() as JTItemRender;
            t.removeFromParent();
            JTLogger.info("remove :  " + i, "scroller index:  " + s.index);
        }
        let pipeline: JTScheduledPipeline = this._owner as JTScheduledPipeline;
        pipeline.items = [];
        pipeline.renders = [];

        return true;
    }
}