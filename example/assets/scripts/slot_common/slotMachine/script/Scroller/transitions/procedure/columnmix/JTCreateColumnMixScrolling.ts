import JTCreate from "../../../com/plugins/procedure/JTCreate";
import JTScroller from "../../../com/JTScroller";
import JTConfigGroup from "../../../com/JTConfigGroup";
import JTChildFactory from "../../../com/factorys/JTChildFactory";
import JTLogger from "../../../JTLogger";
import JTGLoader from "../../../renders/JTGLoader";
import JTScrollerGroup from "../../../com/JTScrollerGroup";
import JTScheduledPipeline from "../../../com/plugins/JTScheduledPipeline";
import JTElementArrayList from "../../../com/datas/JTElementArrayList";
import { SlotOrientation } from "../../../../SlotDefinitions/SlotEnum";
import JTLayoutPoint from "../../../extensions/JTLayoutPoint";
import BaseSpinSlotView, { SpinSlotHiddenSection } from "../../../../MainView/BaseSpinSlotView";
import JTScrollingColumnMixPipeline from "./JTScrollingColumnMixPipeline";

/*
* /*
* 仅包含长条元素的滚轴创建
*/
export default class JTCreateColumnMixScrolling extends JTCreate {
    constructor() {
        super();
    }

    public create(): void {
        let s: JTScroller = this._scroller as JTScroller;
        let o: JTScrollerGroup = s.owner as JTScrollerGroup;
        let c: JTConfigGroup = s.config;
        let pipeline = this._owner as JTScrollingColumnMixPipeline;
        let loader: JTGLoader = s.setupSkinLoader(s.x, s.y, o.skinLoaderContainer ? o.skinLoaderContainer : o, false);
        if (loader) {
            loader.width = s.width;
            loader.height = s.height;
        }
        if (c.orientation == SlotOrientation.Portrait) {
            this.setScrollerXY(s.index * (c.gapXLandscape+c.girdWidth),0,s.index * (c.gapXPortrait+c.girdWidth),0);
            for (let i: number = 0; i < c.row + 2; i++) {
                let render: BaseSpinSlotView = this.getObject(JTChildFactory.ITEMRENDER_TYPE, s) as BaseSpinSlotView;
                render.width = c.girdWidth;
                render.height = c.girdHeight;
                render.x = c.girdWidth / 2;
                s.addChildItem(render);
            }
            let dataIndex = 1;
            let renderIndex = 1;
            let curLenght = 0;
            let curentY = 0;
            let isSetFirstRender = false;
            while(curLenght<c.row){
                let data = this.changedDataList[dataIndex];
                let render = s.items[renderIndex] as BaseSpinSlotView;
                let m = c.getMixElementConfig(data);
                if(m){
                    let showLength = pipeline.getMixItemFixLength(dataIndex,data,this.changedDataList);
                    showLength = Math.min(showLength,m.row);
                    let mixHeight = c.girdHeight*m.row+c.gapY*(m.row-1);
                    let mixWidth = c.girdWidth*m.column+c.gapX*(m.column-1);
                    if(!isSetFirstRender){
                        curentY = (m.row - showLength)*c.gapHeight;
                        let firstRender = s.items[0] as BaseSpinSlotView;
                        firstRender.data = pipeline.getRandomId();
                        firstRender.changedData = firstRender.data;

                        firstRender.y = curentY + c.gapHeight-c.girdHeight*0.5;
                        isSetFirstRender = true;
                        console.log(s.index,firstRender.y)
                    }
                    render.y = curentY - mixHeight*0.5;
                    render.x =  c.girdWidth / 2;
                    render.mixRow = m.row;
                    render.mixColumn = m.column;
                    render.height = mixHeight;
                    render.width = mixWidth;
                    render.data = data;
                    render.changedData = data;
                    render.index = s.indexs[curLenght];
                    render.visibleRow = showLength;
                    if(showLength<m.row){
                        render.hiddenSection = dataIndex==1?SpinSlotHiddenSection.Top:SpinSlotHiddenSection.Bottom;
                    }else{
                        render.hiddenSection = SpinSlotHiddenSection.None
                    }
                    curentY -= mixHeight + c.gapY ;
                    dataIndex += showLength;
                    curLenght += showLength;
                    render.mixIndexs = pipeline.getMixIndexs(render.index,showLength,m.column);

                    let layoutPoint = new JTLayoutPoint();
                    layoutPoint.landscapeX = render.x;
                    layoutPoint.landscapeY = render.y;
                    layoutPoint.portraitX = render.x;
                    layoutPoint.portraitY = render.y;
                    this.setupRender(render,layoutPoint);
                }else{
                    if(!isSetFirstRender){
                        let firstRender = s.items[0] as BaseSpinSlotView;
                        firstRender.data = pipeline.getRandomId();
                        firstRender.changedData = firstRender.data;
                        firstRender.y = curentY + c.gapHeight - c.girdHeight*0.5;
                        isSetFirstRender = true;
                        console.log(s.index,firstRender.y)
                    }
                    render.data = data;
                    render.changedData = data;
                    render.y = curentY - c.girdHeight*0.5;
                    render.x = c.girdWidth / 2;
                    render.hiddenSection = SpinSlotHiddenSection.None
                    let layoutPoint = new JTLayoutPoint();
                    layoutPoint.landscapeX = c.girdWidth / 2;
                    layoutPoint.landscapeY = render.y
                    layoutPoint.portraitX = c.girdWidth / 2;
                    layoutPoint.portraitY = render.y;
                    render.index = s.indexs[curLenght];
                    render.visibleRow = 1;
                    curentY -= c.gapHeight;
                    dataIndex ++;
                    curLenght ++;
                    this.setupRender(render,layoutPoint);
                }
                render.active = true;
                renderIndex ++ ;
            }
            for(let i = renderIndex;i<c.row+2;i++){
                let render = s.items[i] as BaseSpinSlotView;
                render.data = pipeline.getRandomId();
                render.y = curentY - c.girdHeight*0.5;
                console.log(s.index,render.y)

                render.x = c.girdWidth / 2;
                curentY -= c.gapHeight;

            }
        } else { 
            this.setScrollerXY(0,-s.index * (c.gapYLandscape+c.girdHeight),0,s.index * (c.gapYPortrait+c.girdHeight));
            for (let i: number = 0; i < c.row + 2; i++) {
                let render: BaseSpinSlotView = this.getObject(JTChildFactory.ITEMRENDER_TYPE, s) as BaseSpinSlotView;
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

        pipeline.setupStaticRenderPoint();

        s.sortItemszIndex();

        (this._dataProvider.grids as JTElementArrayList).dataList = this.dataList;
        this.complete();
    }


    public destroy(): boolean {
        let s: JTScroller = this._scroller;
        let totalCount: number = s.items.length;
        for (let i: number = 0; i < totalCount; i++) {
            let t: BaseSpinSlotView = s.items.shift() as BaseSpinSlotView;
            t.removeFromParent();
            JTLogger.info("remove :  " + i, "scroller index:  " + s.index);
        }
        let pipeline: JTScheduledPipeline = this._owner as JTScheduledPipeline;
        pipeline.items = [];
        pipeline.renders = [];

        return true;
    }
}