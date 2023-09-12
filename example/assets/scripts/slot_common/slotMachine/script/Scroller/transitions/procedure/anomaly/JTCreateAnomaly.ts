/*
* name;
*/
import JTCreate from "../../../com/plugins/procedure/JTCreate";
import JTScroller from "../../../com/JTScroller";
import JTConfigGroup from "../../../com/JTConfigGroup";
import JTItemRender from "../../../com/base/JTItemRender";
import JTChildFactory from "../../../com/factorys/JTChildFactory";
import JTScrollerGroup from "../../../com/JTScrollerGroup";
import JTGLoader from "../../../renders/JTGLoader";
import { SlotOrientation } from "../../../../SlotDefinitions/SlotEnum";
import JTLayoutPoint from "../../../extensions/JTLayoutPoint";

export default class JTCreateAnomaly extends JTCreate {
    constructor() {
        super();
    }

    public create(): void {
        let s: JTScroller = this._scroller as JTScroller;
        let c: JTConfigGroup = s.config;
        let o: JTScrollerGroup = s.owner as JTScrollerGroup;
        // let currentY:number = this.dataList[1] != 0 ?  -s.config.gapHeight * 1.5 : -s.config.gapHeight;
        let loader:JTGLoader = s.setupSkinLoader(s.x, s.y, o.skinLoaderContainer ? o.skinLoaderContainer : o , false);
        if (loader)
        {
            loader.width = s.width;
            loader.height = s.height;
        }

        let dataListType = this.scrollerGroup.channelPipeline.getTemplate(s.index).dataListType;
        if(dataListType == JTScrollerGroup.USE_CONVERT_TO_LIST){
            if(c.orientation==SlotOrientation.Portrait){
                this.setScrollerXY(s.index * (c.gapXLandscape+c.girdWidth),0,s.index * (c.gapXPortrait+c.girdWidth),0);
    
                let currentY = 0;
                let currentYLandscape = 0;
                let currentYPortrait = 0;
    
                for (let i: number = 0; i < c.row; i++) {
                    let render: JTItemRender = o.factoryChild.produce(JTChildFactory.ITEMRENDER_TYPE, s) as JTItemRender;
                    render.bind(s, s.caller);
                    render.data = this.changedDataList[i];
                    render.changedData = this.changedDataList[i];
    
                    if (i == 0 && render.data != 0) {
                        currentY = s.config.gapHeight / 2;
                        currentYLandscape = (c.girdHeight+c.gapYLandscape)/2;
                        currentYPortrait = (c.girdHeight+c.gapYPortrait)/2;
                    }
                    render.x = c.girdWidth / 2;
                    render.y = currentY - c.girdHeight / 2;
    
                    let layoutPoint = new JTLayoutPoint();
                    layoutPoint.landscapeX = c.girdWidth / 2;
                    layoutPoint.landscapeY = currentYLandscape-c.girdHeight/2;
                    layoutPoint.portraitX = c.girdWidth / 2;
                    layoutPoint.portraitY = currentYPortrait-c.girdHeight/2;
                    
                    currentY += -render.height;
                    currentYLandscape +=-render.height;
                    currentYPortrait += -render.height;
                    render.width = c.gapWidth;
                    s.addChildItem(render, false);
                    this.setupRender(render,layoutPoint);
                }
            }else{
                this.setScrollerXY(0,-s.index * (c.gapYLandscape+c.girdHeight),0,s.index * (c.gapYPortrait+c.girdHeight));
    
                let currentX = c.gapWidth;
                let currentXLandscape = 0;
                let currentXPortrait = 0;
    
                for (let i: number = 0; i < c.row; i++) {
                    let render: JTItemRender = o.factoryChild.produce(JTChildFactory.ITEMRENDER_TYPE, s) as JTItemRender;
                    render.bind(s, s.caller);
                    render.data = this.changedDataList[i];
                    render.changedData = this.changedDataList[i];
    
                    if (i == 0 && render.data != 0) {
                        currentX = s.config.gapWidth / 2;
                        currentXLandscape = (c.girdWidth+c.gapXLandscape)/2;
                        currentXPortrait = (c.girdWidth+c.gapXPortrait)/2;
                    }
                    render.y = -c.girdHeight / 2;
                    render.x = currentX - c.girdWidth / 2;
    
                    let layoutPoint = new JTLayoutPoint();
                    layoutPoint.landscapeX = c.girdWidth / 2;
                    layoutPoint.landscapeY = currentXLandscape-c.girdHeight/2;
                    layoutPoint.portraitX = c.girdWidth / 2;
                    layoutPoint.portraitY = currentXPortrait-c.girdHeight/2;
    
                    currentX += render.width;
                    currentXLandscape +=render.width;
                    currentXPortrait +=render.width;
                    render.height = c.gapWidth;
                    s.addChildItem(render, false);
                    this.setupRender(render,layoutPoint);
                }
            }
        }else{
            if(c.orientation==SlotOrientation.Portrait){
                this.setScrollerXY(s.index * (c.gapXLandscape+c.girdWidth),0,s.index * (c.gapXPortrait+c.girdWidth),0);
    
                let currentY = c.girdHeight;
                let currentYLandscape = 0;
                let currentYPortrait = 0;
                if(this.changedDataList[1]!=0){
                    currentY = c.girdHeight * 1.5;
                    currentYLandscape = (c.girdHeight+c.gapYLandscape)/2+c.girdHeight;
                    currentYPortrait = (c.girdHeight+c.gapYPortrait)/2+c.girdHeight;
                }
    
                for (let i: number = 0; i < c.row+2; i++) {
                    let render: JTItemRender = o.factoryChild.produce(JTChildFactory.ITEMRENDER_TYPE, s) as JTItemRender;
                    render.bind(s, s.caller);
                    render.data = this.changedDataList[i];
                    render.changedData = this.changedDataList[i];

                    if((i==0||i==c.row+1)&&render.data==0){
                        render.data = 1;
                        render.changedData = 1;
                    }
        
                    render.x = c.girdWidth / 2;
                    render.y = currentY - c.girdHeight / 2;
    
                    let layoutPoint = new JTLayoutPoint();
                    layoutPoint.landscapeX = c.girdWidth / 2;
                    layoutPoint.landscapeY = currentYLandscape-c.girdHeight/2;
                    layoutPoint.portraitX = c.girdWidth / 2;
                    layoutPoint.portraitY = currentYPortrait-c.girdHeight/2;
                    
                    currentY += -render.height;
                    currentYLandscape +=-render.height;
                    currentYPortrait += -render.height;
                    render.width = c.gapWidth;
                    s.addChildItem(render, false);
                    if(i!=0&&i!=c.row+1){
                        this.setupRender(render,layoutPoint);
                    }
                }
            }else{
                this.setScrollerXY(0,-s.index * (c.gapYLandscape+c.girdHeight),0,s.index * (c.gapYPortrait+c.girdHeight));
    
                let currentX = 0;
                let currentXLandscape = 0;
                let currentXPortrait = 0;
                if(this.changedDataList[1]!=0){
                    currentX =-0.5 * c.girdHeight ;
                    currentXLandscape = -0.5*c.girdHeight;
                    currentXPortrait = -0.5*c.girdHeight;
                }
                for (let i: number = 0; i < c.row+2; i++) {
                    let render: JTItemRender = o.factoryChild.produce(JTChildFactory.ITEMRENDER_TYPE, s) as JTItemRender;
                    render.bind(s, s.caller);
                    render.data = this.changedDataList[i];
                    render.changedData = this.changedDataList[i];
    
                    if((i==0||i==c.row+1)&&render.data==0){
                        render.data = 1;
                        render.changedData = 1;
                    }

                    render.y = -c.girdHeight / 2;
                    render.x = currentX - c.girdWidth / 2;
    
                    let layoutPoint = new JTLayoutPoint();
                    layoutPoint.landscapeX = c.girdWidth / 2;
                    layoutPoint.landscapeY = currentXLandscape-c.girdHeight/2;
                    layoutPoint.portraitX = c.girdWidth / 2;
                    layoutPoint.portraitY = currentXPortrait-c.girdHeight/2;
    
                    currentX += render.width;
                    currentXLandscape +=render.width;
                    currentXPortrait +=render.width;
                    render.height = c.gapWidth;
                    s.addChildItem(render, false);
                    this.setupRender(render,layoutPoint);
                }
            }            
        }



        this.complete();
    }
}