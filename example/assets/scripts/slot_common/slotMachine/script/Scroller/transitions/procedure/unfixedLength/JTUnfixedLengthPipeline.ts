import JTScheduledPipeline from "../../../com/plugins/JTScheduledPipeline";
import JTScatterTask from "../../../rules/JTScatterTask";
import JTDynamicWildTask from "../../../rules/JTDynamicWildTask";
import JTOnceWildTask from "../../../rules/JTOnceWildTask";
import JTRuleTaskType from "../../../rules/JTRuleTaskType";
import JTScroller from "../../../com/JTScroller";
import JTOptionType from "../../JTOptionType";
import JTItemRender from "../../../com/base/JTItemRender";
import JTTask from "../../../com/tasks/JTTask";
import JTConfigGroup from "../../../com/JTConfigGroup";
import JTChangeSpeedTask from "../../../rules/JTChangeSpeedTask";
import JTLayoutPoint from "../../../extensions/JTLayoutPoint";
import BaseSpinSlotView from "../../../../MainView/BaseSpinSlotView";

import { SlotOrientation } from "../../../../SlotDefinitions/SlotEnum";
import { JTExpandScrollerInfo } from "../../../extensions/JTUnfixedLengthItemConfig";
import JTElementArrayList from "../../../com/datas/JTElementArrayList";

/*
* name;
*/
export default class JTUnfixedLengthPipeline extends JTScheduledPipeline {
    public lineTime: cc.Tween = null;
    public scatterRule: JTScatterTask = null;
    public dynamicWild: JTDynamicWildTask = null;
    public onceWild: JTOnceWildTask = null;
    public changeSpeed:JTChangeSpeedTask = null;
    
    /**
     * 本列的扩展列信息
     */
    public extendScrollerInfo:JTExpandScrollerInfo = null;

    constructor() {
        super();
    }

    public create(): void {
        this.init();
        super.create();
    }

    public beforeStart(): void {
        
    }

    private init():void{
        let o = this.scrollerGroup;
        let c = this.scrollerGroup.config;

        for(let i=0;i<c.row;i++){
            let index: number = this.getCounterIndex();
            this._indexs.push(index);
        }

        for(let i=0;i<o.expandScrollerInfo.length;i++){
            if(o.expandScrollerInfo[i].index==this.scroller.index){
                this.extendScrollerInfo = o.expandScrollerInfo[i];
            }
        }

    }

    public start(): void {
        this.dynamicWild = this.getRuleTask(JTRuleTaskType.WILD_DYNAMIC_TIME_TYPE) as JTDynamicWildTask;
        this.onceWild = this.getRuleTask(JTRuleTaskType.WILD_ONCE_TIME_TYPE) as JTOnceWildTask;
        this.scatterRule = this.getRuleTask(JTRuleTaskType.SCATTER) as JTScatterTask;

        this.changeSpeed = this.getRuleTask(JTRuleTaskType.CHANGE_SPEED_TASK) as JTChangeSpeedTask;
        if (this.dynamicWild) this.dynamicWild.showScroller(this._scroller as JTScroller);
        if (this.onceWild) this.onceWild.showScroller(this._scroller as JTScroller);
        super.start();
    }

    public onDataStandBy():void{
        if (this.scatterRule) this.scatterRule.setupScatterTime(this.scroller);
        if(this.extendScrollerInfo){
            this.scatterRule.removeIndexs([this.scroller.index]);
            this.scroller.time = this.scrollerGroup.time;
        }

    }

    public clear(): void {
        super.clear();

        if(this.lineTime)
        {
            this.lineTime.stop();
            this.lineTime=null ;
        }

    }

    public updateRenders(): void {
        this.scroller.y = this.sourceY;
        this.scroller.x = this.sourceX;
        this.lineTimeComplete();
        let overRunning: JTTask = this.getOption(JTOptionType.OPTION_OVER_RUNNING);
        overRunning.handler && overRunning.handler.apply(overRunning.caller, [this._scroller]);
        this.onceWild && this.onceWild.callWatchWild(this._scroller);
    }


    public lineTimeComplete(useChangeData:boolean=false): void {
        let s: JTScroller = this._scroller;
        let c = s.config;
        s.renders.length = 0;
        let es = this.extendScrollerInfo;
        let op = useChangeData?(s.dataProvider.changedGrids as JTElementArrayList).occupyPosList:(s.dataProvider.grids as JTElementArrayList).occupyPosList;
        let dataList = useChangeData?this.changedDataList:this.dataList;
        let shapes = useChangeData?(s.dataProvider.changedGrids as JTElementArrayList).gridShapes:(s.dataProvider.grids as JTElementArrayList).gridShapes;
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
            if(es.direction==SlotOrientation.Landscape){
                for (let i: number = 0; i < dataList.length; i++) {
                    let render = this.items[i] as BaseSpinSlotView;
                    render.x = (es.row -i) * (c.gapWidth+es.gap) + c.girdWidth / 2 ;
                    render.y = -c.girdHeight / 2;
                    render.width = c.girdWidth;
                    render.realData = dataList[i];
                    render.changedData = this.changedDataList[i];

                    if(i>0&&i<this.dataList.length-1){
                        let row = op[i-1].len;
                        render.index = op[i-1].pos-1;
                        render.height = c.girdHeight*row+c.gapY*(row-1);
                        render.mixRow = row;
                        s.renders.push(render);
                    }else{
                        if(isEquallyDivide){
                            let len = c.row/shapes.length;
                            render.mixRow = len;
                            render.height = c.girdHeight*len+c.gapY*(len-1);
                        }else{
                            render.mixRow = 1;
                            render.height = c.girdHeight;
                        }
                    }
                    render.data = dataList[i];
                    if(es.curveDegree){
                        this.adjustExtendItemCurve(render);
                    }
                }
            }
        }else{
            if (c.orientation == SlotOrientation.Portrait) {
                this.setScrollerXY(s.index * (c.gapXLandscape+c.girdWidth),0,s.index * (c.gapXPortrait+c.girdWidth),0);
                let y = 0;
                for (let i: number = 0; i < dataList.length; i++) {
                    let render  = this.items[i] as BaseSpinSlotView;
                    if(i==0){
                        let data = dataList[i];
                        render.realData = data;
                        render.mixRow = 1;
                        render.data = data;
                        render.y = -(i - 1) * c.gapHeight - c.girdHeight / 2;
                        render.x = c.girdWidth / 2;
                    }else if(i<this.dataList.length-1){
                        let data = this.dataList[i];
                        let row = op[i-1].len;
                        let u = c.getUnfixedLengthItemConfig(data,row);
                        render.realData = data;
                        render.mixRow = row;
                        if(u){
                            render.data = u.mapId;
                        }else{
                            render.data = data;
                        }
                        render.index = op[i-1].pos-1;
                        render.x =  c.girdWidth / 2;
                        let height = c.girdHeight*row+c.gapY*(row-1);
                        render.height = height;
                        render.y = y - height*0.5
                        y -= height;
                        s.renders.push(render);
                    }else{
                        let rand = Math.floor(Math.random() * dataList.length);
                        render.mixRow = 1;
                        render.realData = dataList[rand];
                        render.data = dataList[rand];
                        render.height = c.gapHeight;
                        render.y = y - c.gapHeight*0.5
                    }
                    render.width = c.girdWidth;
                    render.x = c.girdWidth / 2;
                }
            } else { 
            }

        }

        this.resetRenderPoints();
        s.adjustSkinRenders(false);

    }

    public setRenderBeforeComplete(render: JTItemRender):boolean{
        let s: JTScroller = this._scroller;
        if (s.changedTimes>0&&s.changedTimes<s.dataList.length-1){
            let index = s.speed>0?s.dataList.length-2-s.changedTimes:s.changedTimes-1;
            render.index = s.indexs[index];
            return true;
        }else{
            return false;
        }
    }

    /**
     * 
     * @returns 横竖切换及层级还原时调用
     */
    public updateRenderPosition():void{
        // let s: JTScroller = this._scroller;
        // let c = this.getConfig();
        // let gapHeight = c.gapHeight;
        // let girdHeight = c.girdHeight;
        
        // let o: JTScrollerGroup = s.owner as JTScrollerGroup;


        // for (let i: number = 0; i < s.items.length; i++) {
        //     let r: JTItemRender = s.items[i] as JTItemRender;
        //     if(o.isRenderInSortLayer(r)){
        //         continue;
        //     }
        //     if(s.config.orientation==SlotOrientation.Portrait){
        //         r.x = s.config.girdWidth/2;
        //         r.y = -(gapHeight) * (i - 1)-girdHeight/2;
        //     }else{
        //         r.y = -s.config.girdHeight/2;
        //         r.x = (s.config.gapWidth) * i-o.config.girdWidth/2;
        //     }
        // }

    }

    /**
    * 重新设置有效渲染器，主要用于滚动介绍时零高度格子的坐标计算
    */
    public resetRenderPoints(): void {
        let s: JTScroller = this._scroller as JTScroller;
        let offset = this.scrollerGroup.itemOffsets[s.index]||cc.v2();
        for(let i=0;i<s.renders.length;i++){
            let r: BaseSpinSlotView = s.renders[i] as BaseSpinSlotView;
            
            let index = r.index;
            
            let landscapeX = r.x;
            let landscapeY = r.y;
            let portraitX = r.x;
            let portraitY = r.y;
    
            let centerPointLandscape: cc.Vec2 = new cc.Vec2();
            let globalPointLandscape: cc.Vec2 = new cc.Vec2(landscapeX+s.pipeline.sourceXLandscape, landscapeY+s.pipeline.sourceYLandscape);
            let centerPointPortrait: cc.Vec2 = new cc.Vec2();
            let globalPointPortrait: cc.Vec2 = new cc.Vec2(portraitX+s.pipeline.sourceXPortrait, portraitY+s.pipeline.sourceYPortrait);
            globalPointLandscape.x += offset.x;
            globalPointLandscape.y += offset.y;

            this._scrollerGroup.pointMapLandscape[index] = globalPointLandscape;
            centerPointLandscape.x = globalPointLandscape.x + r.width / 2;
            centerPointLandscape.y = globalPointLandscape.y + r.height / 2;
            this._scrollerGroup.centerMapLandscape[index.toString()] = centerPointLandscape;

            globalPointPortrait.x += offset.x;
            globalPointPortrait.y += offset.y;

            this._scrollerGroup.pointMapPortrait[index] = globalPointPortrait;
            centerPointPortrait.x = globalPointPortrait.x + r.width / 2;
            centerPointPortrait.y = globalPointPortrait.y + r.height / 2;
            this._scrollerGroup.centerMapPortrait[index.toString()] = centerPointPortrait;

        }
    }


    public setupRender(render: BaseSpinSlotView, p: JTLayoutPoint): void {
        let s: JTScroller = this._scroller as JTScroller;
        let r: BaseSpinSlotView = render as BaseSpinSlotView;        
        this._scroller.renders.push(r);
        this._renders.push(r);
        r.name = "render_"+r.index

        let index: number = r.index;
        let centerPointLandscape: cc.Vec2 = new cc.Vec2();
        let globalPointLandscape: cc.Vec2 = new cc.Vec2(p.landscapeX+s.pipeline.sourceXLandscape, p.landscapeY+s.pipeline.sourceYLandscape);
        let centerPointPortrait: cc.Vec2 = new cc.Vec2();
        let globalPointPortrait: cc.Vec2 = new cc.Vec2(p.portraitX+s.pipeline.sourceXPortrait, p.portraitY+s.pipeline.sourceYPortrait);

        this._scrollerGroup.pointMapLandscape[index] = globalPointLandscape;
        centerPointLandscape.x = globalPointLandscape.x + r.width / 2;
        centerPointLandscape.y = globalPointLandscape.y + r.height / 2;
        this._scrollerGroup.centerMapLandscape[index.toString()] = centerPointLandscape;

        this._scrollerGroup.pointMapPortrait[index] = globalPointPortrait;
        centerPointPortrait.x = globalPointPortrait.x + r.width / 2;
        centerPointPortrait.y = globalPointPortrait.y + r.height / 2;
        this._scrollerGroup.centerMapPortrait[index.toString()] = centerPointPortrait;

    }

    public setupStaticRenderPoint():void{
        let s: JTScroller = this._scroller as JTScroller;
        let c = s.config;
        for (let i: number = 0; i < this.indexs.length; i++) {
            let index = this.indexs[i];
            let centerPointLandscape:cc.Vec2;
            let centerPointPortrait:cc.Vec2;
            let es = this.extendScrollerInfo;
            if(es){
                centerPointLandscape = cc.v2((es.row -i) * (c.gapWidth+es.gap) + c.girdWidth / 2+s.pipeline.sourceXLandscape,c.girdHeight*0.5+s.pipeline.sourceYLandscape);
                centerPointPortrait = cc.v2((es.row -i) * (c.gapWidth+es.gap) + c.girdWidth / 2+s.pipeline.sourceXPortrait,c.girdHeight*0.5+s.pipeline.sourceYPortrait);
            }else{
                centerPointLandscape = cc.v2(c.girdWidth+s.pipeline.sourceXLandscape,-i*(c.girdHeight+c.gapYLandscape)+s.pipeline.sourceYLandscape);
                centerPointPortrait = cc.v2(c.girdWidth+s.pipeline.sourceXPortrait,-i*(c.girdHeight+c.gapYPortrait)+s.pipeline.sourceYPortrait);
            }

            this._scrollerGroup.staticCenterMapLandscape[index] = centerPointLandscape;
            this._scrollerGroup.staticCenterMapPortrait[index] = centerPointPortrait;
        }
    }

    /**
     * 
     * @param render 
     * @returns 
     */
    public adjustExtendItemCurve(render:JTItemRender):void{
        if(!this.extendScrollerInfo){
            return;
        }
        let s = this.scroller;
        let c = this.scrollerGroup.config;
        let es = this.extendScrollerInfo;
        let curveDegree = es.curveDegree;
        if(!curveDegree||curveDegree==0){
            return;
        }
        if(es.direction==SlotOrientation.Landscape){
            let width = es.row*c.girdWidth;
            let radius = 0.5*width/Math.sin(Math.abs(curveDegree)*0.5/180*Math.PI);
            let offset = this.scrollerGroup.itemOffsets[s.index]||cc.v2();
            let x = s.x+render.x+offset.x;
            let centerX = this.sourceX+width*0.5+offset.x;
            let w = Math.abs(x - centerX);
            let d = Math.sqrt(radius*radius-w*w);
            let offsetY = curveDegree>0?-(radius-d):(radius-d);
            let g = Math.asin(w/radius)/Math.PI*180;
            g *= centerX-x>0?1:-1;
            g *= curveDegree>0?1:-1;
            render.y += offsetY;
            render.angle = g;
        }else{

        }

    }

    public updateRenderData(): void {
        let s: JTScroller = this._scroller;
        
        for (let i: number = 0; i < s.changedDataList.length; i++) {
           let r: JTItemRender = s.items[i] as JTItemRender;
           r.changedData = s.changedDataList[i];
        }
      }

      public getItemInclineProperty(x:number):{offsetY:number,angle:number}{

        if(!this.extendScrollerInfo){
            return;
        }
        let s = this.scroller;
        let c = this.scrollerGroup.config;
        let es = this.extendScrollerInfo;
        let curveDegree = es.curveDegree;
        x += s.x;
        if(es.direction==SlotOrientation.Landscape){
            let width = es.row*c.girdWidth;
            let radius = 0.5*width/Math.sin(Math.abs(curveDegree)*0.5/180*Math.PI);
            let offset = this.scrollerGroup.itemOffsets[s.index]||cc.v2();
            let centerX = this.sourceX+width*0.5+offset.x;
            let w = Math.abs(x - centerX);
            let d = Math.sqrt(radius*radius-w*w);
            let offsetY = curveDegree>0?-(radius-d):(radius-d);
            let g = Math.asin(w/radius)/Math.PI*180;
            g *= centerX-x>0?1:-1;
            g *= curveDegree>0?1:-1;

            return {offsetY:offsetY,angle:g};
        }else{

        }
    }

}

