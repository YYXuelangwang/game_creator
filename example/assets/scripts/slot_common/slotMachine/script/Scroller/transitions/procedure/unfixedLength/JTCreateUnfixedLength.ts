import JTCreate from "../../../com/plugins/procedure/JTCreate";
import JTScroller from "../../../com/JTScroller";
import JTConfigGroup from "../../../com/JTConfigGroup";
import JTChildFactory from "../../../com/factorys/JTChildFactory";
import JTGLoader from "../../../renders/JTGLoader";
import JTScrollerGroup from "../../../com/JTScrollerGroup";
import JTElementArrayList from "../../../com/datas/JTElementArrayList";
import { SlotOrientation } from "../../../../SlotDefinitions/SlotEnum";
import BaseSpinSlotView from "../../../../MainView/BaseSpinSlotView";
import JTUnfixedLengthPipeline from "./JTUnfixedLengthPipeline";
import JTLayoutPoint from "../../../extensions/JTLayoutPoint";
import JTLayerFactory from "../../../com/factorys/JTLayerFactory";

/*
* name;
*/
export default class JTCreateUnfixedLength extends JTCreate {
    constructor() {
        super();
    }

    public create(): void {
        let s: JTScroller = this._scroller as JTScroller;
        let o: JTScrollerGroup = s.owner as JTScrollerGroup;
        let c: JTConfigGroup = s.config;
        let p = this.owner as JTUnfixedLengthPipeline;

        let es = p.extendScrollerInfo;
        let op = (s.dataProvider.changedGrids as JTElementArrayList).occupyPosList;
        let shapes = (s.dataProvider.changedGrids as JTElementArrayList).gridShapes;
        let isEquallyDivide = false;
        if(op.length==0){
            op = [];
            let len = c.row/shapes.length;
            for(let shape of shapes){
                op.push({pos:shape,len:len});
            }
            isEquallyDivide = true;
        }
        if(es){//拓展列
            let loader: JTGLoader = s.setupSkinLoader(s.x, s.y, o.skinLoaderContainer ? o.skinLoaderContainer : o, false);
            if (loader) {
                loader.width = s.width;
                loader.height = s.height;
            }
            let dataList = this.changedDataList;
            this.setScrollerXY(es.position.x,es.position.y,es.position.x,es.position.y);
            if(es.direction==SlotOrientation.Landscape){
                let container = o.itemContainers[s.index];
                let parent = (o.factoryLayer as JTLayerFactory).produce(es.maskContainerType, this);
                if(parent){
                    container.removeFromParent();
                    parent.addChild(container);
                }
                for (let i: number = 0; i < es.row + 2; i++) {
                    let render: BaseSpinSlotView = this.getObject(JTChildFactory.ITEMRENDER_TYPE, s) as BaseSpinSlotView;
                    render.x = (es.row -i) * (c.gapWidth+es.gap) + c.girdWidth / 2 ;
                    render.y = -c.girdHeight / 2;
                    render.width = c.girdWidth;

                    let layoutPoint = new JTLayoutPoint();
                    layoutPoint.landscapeX = render.x;
                    layoutPoint.landscapeY = render.y;
                    layoutPoint.portraitX = render.x;
                    layoutPoint.portraitY = render.y;
    
                    s.addChildItem(render);
                    if (i > 0 && i < es.row + 1) {
                        render.index =s.indexs[i-1];
                        this.setupRender(render,layoutPoint);
                        let row = op[i-1].len;
                        render.height = c.girdHeight*row+c.gapY*(row-1);
                        render.mixRow = row;
                    }else {
                        render.active = false;
                        if(isEquallyDivide){
                            let len = c.row/shapes.length;
                            render.height = c.girdHeight*len+c.gapY*(len-1);
                        }else{
                            render.height = c.girdHeight;
                        }
                    }
                    render.realData = dataList[i];
                    render.data = dataList[i];
                    render.changedData = dataList[i];

                    if(es.curveDegree){
                        p.adjustExtendItemCurve(render);
                    }
                }
            }
        }else{
            let loader: JTGLoader = s.setupSkinLoader(s.x, s.y, o.skinLoaderContainer ? o.skinLoaderContainer : o, false);
            if (loader) {
                loader.width = s.width;
                loader.height = s.height;
            }
            if (c.orientation == SlotOrientation.Portrait) {
                this.setScrollerXY(s.index * (c.gapXLandscape+c.girdWidth),0,s.index * (c.gapXPortrait+c.girdWidth),0);
                let y = 0;
                for (let i: number = 0; i < c.row + 2; i++) {
                    let render: BaseSpinSlotView = this.getObject(JTChildFactory.ITEMRENDER_TYPE, s) as BaseSpinSlotView;
                    if(i==0){
                        let data = this.changedDataList[i];
                        render.realData = data;
                        render.data = data;
                        render.y = -(i - 1) * c.gapHeight - c.girdHeight / 2;
                        render.x = c.girdWidth / 2;
                    }else if(i<this.changedDataList.length-1){
                        let data = this.changedDataList[i];
                        let row = op[i-1].len;
                        let u = c.getUnfixedLengthItemConfig(data,row);
                        if(u){
                            render.mixColumn = u.column;
                            render.data = u.mapId;
                        }else{
                            render.data = data;
                        }
                        render.realData = data;
                        render.mixRow = row;
                        render.index = op[i-1].pos-1;
                        render.x =  c.girdWidth / 2;
                        let height = c.girdHeight*row+c.gapY*(row-1);
                        render.height = height;
                        render.y = y - height*0.5
                        y -= height;
                        let layoutPoint = new JTLayoutPoint();
                        layoutPoint.landscapeX = render.x;
                        layoutPoint.landscapeY = render.y;
                        layoutPoint.portraitX = render.x;
                        layoutPoint.portraitY = render.y;
                        this.setupRender(render,layoutPoint);
                    }else{
                        let rand = Math.floor(Math.random() * this.changedDataList.length);
                        render.realData = this.changedDataList[rand];
                        render.data = this.changedDataList[rand];
                        render.height = c.gapHeight;
                        render.y = y - c.gapHeight*0.5
                    }
                    render.width = c.girdWidth;
                    render.x = c.girdWidth / 2;
                    s.addChildItem(render);
                }
            } else { 
                this.setScrollerXY(0,-s.index * (c.gapYLandscape+c.girdHeight),0,s.index * (c.gapYPortrait+c.girdHeight));
            }
        }
        p.setupStaticRenderPoint();
        s.sortItemszIndex();
        s.adjustSkinRenders(false);

        (this._dataProvider.grids as JTElementArrayList).dataList = this.dataList;
        this.complete();
    }


}