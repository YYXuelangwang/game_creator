import JTCreate from "../../../com/plugins/procedure/JTCreate";
import JTScroller from "../../../com/JTScroller";
import JTConfigGroup from "../../../com/JTConfigGroup";
import JTItemRender from "../../../com/base/JTItemRender";
import JTChildFactory from "../../../com/factorys/JTChildFactory";
import JTGLoader from "../../../renders/JTGLoader";
import JTScrollerGroup from "../../../com/JTScrollerGroup";
import JTElementArrayList from "../../../com/datas/JTElementArrayList";
import { SlotOrientation } from "../../../../SlotDefinitions/SlotEnum";
import SlotConfigManager from "../../../../SlotManager/SlotConfigManager";
import JTLayoutPoint from "../../../extensions/JTLayoutPoint";

/*
* name;
*/
export default class JTCreateIrregular extends JTCreate {
    constructor() {
        super();
    }

    public create(): void {
        let s: JTScroller = this._scroller as JTScroller;
        let o: JTScrollerGroup = s.owner as JTScrollerGroup;
        let c: JTConfigGroup = s.config;
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
                render.data = this.changedDataList[i];
                render.changedData = this.changedDataList[i];

                render.width = c.girdWidth;
                render.height = c.girdHeight;
                s.addChildItem(render);
                let layoutPoint = new JTLayoutPoint();
                layoutPoint.landscapeX = c.girdWidth / 2;
                layoutPoint.landscapeY = -(i-1)*(c.girdHeight+c.gapYLandscape)-c.girdHeight/2;
                layoutPoint.portraitX = c.girdWidth / 2;
                layoutPoint.portraitY = -(i-1)*(c.girdHeight+c.gapYPortrait)-c.girdHeight/2;
                
                if (i > 0 && i < c.row + 1) {
                    this.setupRender(render,layoutPoint);
                    if(!this.isRender(i-1)){
                        render.active = false;
                        s.renders.splice(s.renders.length-1,1);
                    }
                }
                else {
                    render.active = false;
                }
            }
        } else {
            this.setScrollerXY(0,-s.index * (c.gapYLandscape+c.girdHeight),0,s.index * (c.gapYPortrait+c.girdHeight));
            for (let i: number = 0; i < c.row + 2; i++) {
                let render: JTItemRender = this.getObject(JTChildFactory.ITEMRENDER_TYPE, s) as JTItemRender;
                render.x = i * c.gapWidth - c.girdWidth / 2;
                render.y = -c.girdHeight / 2;
                render.data = this.changedDataList[i];
                render.changedData = this.changedDataList[i];

                render.width = c.girdWidth;
                render.height = c.girdHeight;
                s.addChildItem(render);

                let layoutPoint = new JTLayoutPoint();
                layoutPoint.landscapeX = i * (c.gapXLandscape+c.girdWidth) - c.girdWidth / 2;
                layoutPoint.landscapeY = -c.girdHeight / 2;
                layoutPoint.portraitX = i * (c.gapXPortrait+c.girdWidth) - c.girdWidth / 2;
                layoutPoint.portraitY = -c.girdHeight / 2;

                if (i > 0 && i < c.row + 1) {
                    this.setupRender(render,layoutPoint);
                    if(!this.isRender(i-1)){
                        render.active = false;
                        s.renders.splice(s.renders.length-1,1);
                    }
                }
                else {
                    render.active = false;
                }
            }
        }

        s.sortItemszIndex();

        (this._dataProvider.grids as JTElementArrayList).dataList = this.dataList;
        this.complete();
    }


    private isRender(index:number):boolean{
        let o: JTScrollerGroup = this.scroller.owner as JTScrollerGroup;
        let gridRenderConfig = o.gridRenderConfig;
        if(!gridRenderConfig){
            return true;
        }else{
            return gridRenderConfig[this.scroller.index][index]==1;
        }
    }

}