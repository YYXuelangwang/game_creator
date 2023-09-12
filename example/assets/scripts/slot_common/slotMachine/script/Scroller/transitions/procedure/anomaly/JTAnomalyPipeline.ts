/*
* name;
*/
import JTItemRender from "../../../com/base/JTItemRender";
import JTScheduledPipeline from "../../../com/plugins/JTScheduledPipeline";
import JTOptionType from "../../JTOptionType";
import JTConfigGroup from "../../../com/JTConfigGroup";
import JTScroller from "../../../com/JTScroller";
import JTScrollerGroup from "../../../com/JTScrollerGroup";
import JTTask from "../../../com/tasks/JTTask";
import JTScatterTask from "../../../rules/JTScatterTask";
import JTDynamicWildTask from "../../../rules/JTDynamicWildTask";
import JTOnceWildTask from "../../../rules/JTOnceWildTask";
import JTRuleTaskType from "../../../rules/JTRuleTaskType";
import { SlotOrientation } from "../../../../SlotDefinitions/SlotEnum";
import JTChangeSpeedTask from "../../../rules/JTChangeSpeedTask";
export default class JTAnomalyPipeline extends JTScheduledPipeline {
    public lineTime: cc.Tween = null;
    public scatterRule: JTScatterTask = null;
    public dynamicWild: JTDynamicWildTask = null;
    public onceWild: JTOnceWildTask = null;

    public changeSpeed:JTChangeSpeedTask = null;

    constructor() {
        super();
    }

    public start(): void {
        this.dynamicWild = this.getRuleTask(JTRuleTaskType.WILD_DYNAMIC_TIME_TYPE) as JTDynamicWildTask;
        this.onceWild = this.getRuleTask(JTRuleTaskType.WILD_ONCE_TIME_TYPE) as JTOnceWildTask;
        if (this.dynamicWild) this.dynamicWild.showScroller(this._scroller as JTScroller);
        if (this.onceWild) this.onceWild.showScroller(this._scroller as JTScroller);
        this.changeSpeed = this.getRuleTask(JTRuleTaskType.CHANGE_SPEED_TASK) as JTChangeSpeedTask;
        super.start();
    }

    public onDataStandBy():void{
        this.scatterRule = this.getRuleTask(JTRuleTaskType.SCATTER) as JTScatterTask;
        if (this.scatterRule) this.scatterRule.setupScatterTime(this.scroller);
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
        let overRunning: JTTask = this.getOption(JTOptionType.OPTION_OVER_RUNNING) as JTTask;
        this.lineTimeComplete();
        overRunning.handler && overRunning.handler.apply(overRunning.caller, [this._scroller]);
    }

    public lineTimeComplete(useChangeData:boolean=false): void {

        let s: JTScroller = this._scroller;
        let c: JTConfigGroup = s.config;
        let o: JTScrollerGroup = s.owner as JTScrollerGroup;
        this.clear();
        s.renders.length = 0;
        let index = 0;

        let dataListType = o.channelPipeline.getTemplate(s.index).dataListType;
        if(dataListType==JTScrollerGroup.USE_CONVERT_TO_LIST){
            if(c.orientation==SlotOrientation.Portrait){
                let currentY: number = 0;
                for (let i: number = 0; i < s.items.length; i++) {
                    let r: JTItemRender = s.items[i] as JTItemRender;
                    let data: any = s.dataList[i];
                    r.data = useChangeData?s.changedDataList[i]:s.dataList[i];
                    r.changedData = s.changedDataList[i];
                    if (i == 0 && data != 0) {
                        currentY = s.config.gapHeight / 2;
                    }
                    r.x = c.girdWidth / 2;
    
                    r.y = currentY - c.girdHeight / 2;
                    r.index = s.indexs[i];
                    currentY += -r.height;
                    s.renders.push(r);
                    //this.reSetupRender(r,index);
                    index++
                }
            }else{
                let currentX: number = c.gapWidth;
                for (let i: number = 0; i < s.items.length; i++) {
                    let r: JTItemRender = s.items[i] as JTItemRender;
                    let data: any = s.dataList[i];
                    r.data = useChangeData?s.changedDataList[i]:s.dataList[i];
                    r.changedData = s.changedDataList[i];
                    if (i == 0 && data != 0) {
                        currentX = s.config.gapWidth / 2;
                    }
                    r.x = currentX - c.girdWidth / 2;
                    r.y = -c.girdHeight / 2;
    
                    r.index = s.indexs[i];
                    currentX += r.width;
                    s.renders.push(r);
                    index++
    
                }
            }
        }else{
            if(c.orientation==SlotOrientation.Portrait){
                let currentY: number = c.girdHeight;
                if(this.changedDataList[1]!=0){
                    currentY = 1.5*c.girdHeight;
                }
                for (let i: number = 0; i < s.items.length; i++) {
                    let r: JTItemRender = s.items[i] as JTItemRender;
                    r.data = useChangeData?s.changedDataList[i]:s.dataList[i];
                    r.changedData = s.changedDataList[i];
                    r.x = c.girdWidth / 2;
    
                    r.y = currentY - c.girdHeight / 2;
                    currentY += -r.height;
                    if(i>0&&i<s.items.length-1){
                        s.renders.push(r);
                        r.index = s.indexs[index];
                        index++
                    }
                }
            }else{
                let currentX: number = 0;
                if(this.changedDataList[1]!=0){
                    currentX = -0.5*c.gapWidth;
                }
                for (let i: number = 0; i < s.items.length; i++) {
                    let r: JTItemRender = s.items[i] as JTItemRender;
                    r.data = useChangeData?s.changedDataList[i]:s.dataList[i];
                    r.changedData = s.changedDataList[i];
                    r.x = currentX - c.girdWidth / 2;
                    r.y = -c.girdHeight / 2;
    
                    if(i>0&&i<s.items.length-1){
                        s.renders.push(r);
                        r.index = s.indexs[index];
                        index++
                    }
                    currentX += r.width;
    
                }
            }
        }


        this.resetRenderPoints();

    }

    /**
    * 重新设置有效渲染器，主要用于滚动介绍时零高度格子的坐标计算
    */
    public resetRenderPoints(): void {
        let s: JTScroller = this._scroller as JTScroller;
        for(let i=0;i<s.renders.length;i++){
            let r: JTItemRender = s.renders[i] as JTItemRender;
            let centerPointLandscape: cc.Vec2 = new cc.Vec2();
            let globalPointLandscape: cc.Vec2 = new cc.Vec2(r.x+s.pipeline.sourceXLandscape, r.y+s.pipeline.sourceYLandscape);
            let centerPointPortrait: cc.Vec2 = new cc.Vec2();
            let globalPointPortrait: cc.Vec2 = new cc.Vec2(r.x+s.pipeline.sourceXPortrait, r.y+s.pipeline.sourceYPortrait);

            let index = r.index;
            this._scrollerGroup.pointMapLandscape[index] = globalPointLandscape;
            centerPointLandscape.x = globalPointLandscape.x + r.width / 2;
            centerPointLandscape.y = globalPointLandscape.y + r.height / 2;
            this._scrollerGroup.centerMapLandscape[index.toString()] = centerPointLandscape;

            this._scrollerGroup.pointMapPortrait[index] = globalPointPortrait;
            centerPointPortrait.x = globalPointPortrait.x + r.width / 2;
            centerPointPortrait.y = globalPointPortrait.y + r.height / 2;
            this._scrollerGroup.centerMapPortrait[index.toString()] = centerPointPortrait;

            this._scrollerGroup.staticCenterMapLandscape[index] = centerPointLandscape.clone();
            this._scrollerGroup.staticCenterMapPortrait[index] = centerPointPortrait.clone();
        }

    }

    public setRenderBeforeComplete(render: JTItemRender):boolean{
        let s: JTScroller = this._scroller;
        let o: JTScrollerGroup = s.owner as JTScrollerGroup;
        let dataListType = o.channelPipeline.getTemplate(s.index).dataListType;
        if(dataListType==JTScrollerGroup.USE_CONVERT_TO_LIST){
            let index = s.speed>0?s.config.row - s.changedTimes-1:s.changedTimes;
            render.index = s.indexs[index];  
            return true;    
        }else{
            if (s.changedTimes!=0&&s.changedTimes!=s.items.length-1){
                let index = s.speed>0?s.config.row - s.changedTimes:s.changedTimes-1;
                render.index = s.indexs[index];
                return true;
            }else{
                return false;
            }
        }
    }

    public updateRenderPosition():void{
        let s: JTScroller = this._scroller;
        let o: JTScrollerGroup = s.owner as JTScrollerGroup;
        let c: JTConfigGroup = s.config;

        let dataListType = o.channelPipeline.getTemplate(s.index).dataListType;

        if(dataListType==JTScrollerGroup.USE_CONVERT_TO_LIST){
            if(c.orientation==SlotOrientation.Portrait){
                let currentY: number = 0;
                for (let i: number = 0; i < s.items.length; i++) {
                    let r: JTItemRender = s.items[i] as JTItemRender;
                    let data: any = s.changedDataList[i];
                    if (i == 0 && data != 0) {
                        currentY = s.config.gapHeight / 2;
                    }
                    if(!o.isRenderInSortLayer(r)){
                        r.y = currentY - c.girdHeight / 2;
                        r.x = c.girdWidth / 2;
                    }
                    currentY += -r.height;
                }
            }else{
                let currentX: number = c.gapWidth;
                for (let i: number = 0; i < s.items.length; i++) {
                    let r: JTItemRender = s.items[i] as JTItemRender;
                    let data: any = s.changedDataList[i];
                    if (i == 0 && data != 0) {
                        currentX = s.config.gapWidth / 2;
                    }
                    if(!o.isRenderInSortLayer(r)){
                        r.x = currentX - c.girdWidth / 2;
                        r.y = -c.girdHeight / 2;
                    }
                    currentX += r.width;
                }
            }
        }else{
            if(c.orientation==SlotOrientation.Portrait){
                let currentY: number = c.girdHeight;
                if(this.changedDataList[1]!=0){
                    currentY = 1.5*c.girdHeight;
                }
                for (let i: number = 0; i < s.items.length; i++) {
                    let r: JTItemRender = s.items[i] as JTItemRender;
                    if(!o.isRenderInSortLayer(r)){
                        r.y = currentY - c.girdHeight / 2;
                        r.x = c.girdWidth / 2;
                    }
                    currentY += -r.height;
                }
            }else{
                let currentX: number = 0;
                if(this.changedDataList[1]!=0){
                    currentX = -0.5*c.girdHeight;
                }
                for (let i: number = 0; i < s.items.length; i++) {
                    let r: JTItemRender = s.items[i] as JTItemRender;
                    if(!o.isRenderInSortLayer(r)){
                        r.x = currentX - c.girdWidth / 2;
                        r.y = -c.girdHeight / 2;
                    }
                    currentX += r.width;
                }
            }
        }

    }
}