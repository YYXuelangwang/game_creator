import JTScheduledPipeline from "../../../com/plugins/JTScheduledPipeline";
import JTScatterTask from "../../../rules/JTScatterTask";
import JTDynamicWildTask from "../../../rules/JTDynamicWildTask";
import JTOnceWildTask from "../../../rules/JTOnceWildTask";
import JTRuleTaskType from "../../../rules/JTRuleTaskType";
import JTScroller from "../../../com/JTScroller";
import JTOptionType from "../../JTOptionType";
import JTItemRender from "../../../com/base/JTItemRender";
import JTTask from "../../../com/tasks/JTTask";
import JTScrollerGroup from "../../../com/JTScrollerGroup";
import { SlotOrientation } from "../../../../SlotDefinitions/SlotEnum";
import JTCombineTask from "../../../rules/JTCombineTask";
import { JTRetainWildTask } from "../../../rules/JTRetainWildTask";
import JTDynamicCombineTask from "../../../rules/JTDynamicCombineTask";
import JTAdvanceTask from "../../../rules/JTAdvanceTask";
import JTConfigGroup from "../../../com/JTConfigGroup";
import JTChangeSpeedTask from "../../../rules/JTChangeSpeedTask";

/*
* name;
*/
export default class JTScrollingPipeline extends JTScheduledPipeline {
    public lineTime: cc.Tween = null;
    public scatterRule: JTScatterTask = null;
    public dynamicWild: JTDynamicWildTask = null;
    public onceWild: JTOnceWildTask = null;

    public combineRule:JTCombineTask = null;

    public retainWild:JTRetainWildTask = null;

    public dynamicCombine:JTDynamicCombineTask = null;

    public advanceTask:JTAdvanceTask = null;

    public changeSpeed:JTChangeSpeedTask = null;


    constructor() {
        super();
    }

    public start(): void {
        this.dynamicWild = this.getRuleTask(JTRuleTaskType.WILD_DYNAMIC_TIME_TYPE) as JTDynamicWildTask;
        this.onceWild = this.getRuleTask(JTRuleTaskType.WILD_ONCE_TIME_TYPE) as JTOnceWildTask;

        this.combineRule = this.getRuleTask(JTRuleTaskType.COMBINE) as JTCombineTask;

        this.retainWild = this.getRuleTask(JTRuleTaskType.RETAIN_WILD_TASK) as JTRetainWildTask;

        this.dynamicCombine = this.getRuleTask(JTRuleTaskType.DYNAMIC_COMBINE) as JTDynamicCombineTask;

        this.advanceTask = this.getRuleTask(JTRuleTaskType.ADVANCE_TASK) as JTAdvanceTask;

        this.changeSpeed = this.getRuleTask(JTRuleTaskType.CHANGE_SPEED_TASK) as JTChangeSpeedTask;


        if(this.retainWild){
            this.retainWild.setupWildScroller(this.scroller);
        }

        if (this.dynamicWild) this.dynamicWild.showScroller(this._scroller as JTScroller);
        if (this.onceWild) this.onceWild.showScroller(this._scroller as JTScroller);
        //this.scroller.adjustSkinRenders(true);
        if(this.combineRule){
            this.combineRule.setupCombineScroller(this._scroller);
            !this.combineRule.isInHide(this._scroller)&&super.start();
        }else if(this.dynamicCombine){
             this.dynamicCombine.setupScroller(this._scroller)&&super.start();
        }else{
            super.start();
        }
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
        let overRunning: JTTask = this.getOption(JTOptionType.OPTION_OVER_RUNNING);
        this.lineTimeComplete();
        overRunning.handler && overRunning.handler.apply(overRunning.caller, [this._scroller]);
        this.onceWild && this.onceWild.callWatchWild(this._scroller);
    }


    public getConfig():{gapHeight:number,girdHeight:number}{
        let s: JTScroller = this._scroller as JTScroller;

        let cr: JTCombineTask = this.combineRule;
        let dc: JTDynamicCombineTask = this.dynamicCombine;
        let gapHeight = s.config.gapHeight;
        let girdHeight = s.config.girdHeight;
        if(cr&&cr.isCombineIndexInRunnnig(s)){
            gapHeight = cr.gapY+cr.gridHeight;
            girdHeight = cr.gridHeight;
        }
        
        if(dc&&dc.isCombineScroller(s)){
            gapHeight = dc.gapY+dc.gridHeight;
            girdHeight = dc.gridHeight;
        }


        return {gapHeight:gapHeight,girdHeight:girdHeight};
    }

    public lineTimeComplete(useChangeData:boolean=false): void {
        let s: JTScroller = this._scroller;

        let c = this.getConfig();
        let gapHeight = c.gapHeight;
        let girdHeight = c.girdHeight;

        let o: JTScrollerGroup = s.owner as JTScrollerGroup;

        let index: number = 0;
        s.renders.length = 0;

        let cr: JTCombineTask = this.combineRule;
        let fixIndex = cr&&cr.isCombineIndexInRunnnig(s)?-1:0;

        for (let i: number = 0; i < s.items.length; i++) {
            let r: JTItemRender = s.items[i] as JTItemRender;
            
            if (i != 0 && i != s.items.length - 1){
                s.renders.push(r);
                r.index = s.indexs[index];
                index++;
            }
            r.data = useChangeData?s.changedDataList[i]:s.dataList[i];
            r.changedData = s.changedDataList[i];
            if(s.config.orientation==SlotOrientation.Portrait){
                r.x = s.config.girdWidth/2;
                r.y = -(gapHeight) * (i - 1+fixIndex)-girdHeight/2;
            }else{
                r.y = -s.config.girdHeight/2;
                r.x = (s.config.gapWidth) * i-o.config.girdWidth/2;
            }
            o.isIncline&&this.adjustItemIncline(r);
            o.isCurve&&this.adjustItemCurve(r);

        }
        this.resetRenderPoints();
        s.adjustSkinRenders(false);

        if(this.dynamicCombine){
           this.dynamicCombine.resetRenders(s);
        }
        if(this.combineRule){
            this.combineRule.resetRenders(s);
         }
    }

    public setRenderBeforeComplete(render: JTItemRender):boolean{
        let s: JTScroller = this._scroller;
        if (s.changedTimes!=0&&s.changedTimes!=s.items.length-1){
            let index = s.speed>0?s.config.row - s.changedTimes:s.changedTimes-1;
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
        let s: JTScroller = this._scroller;
        let c = this.getConfig();
        let gapHeight = c.gapHeight;
        let girdHeight = c.girdHeight;
        
        let o: JTScrollerGroup = s.owner as JTScrollerGroup;
        let cr: JTCombineTask = this.combineRule;
        let fixIndex = cr&&cr.isCombineIndexInRunnnig(s)?-1:0;
        if(this.dynamicCombine&&this.dynamicCombine.isEnabled){
            return;
        }
        for (let i: number = 0; i < s.items.length; i++) {
            let r: JTItemRender = s.items[i] as JTItemRender;
            if(o.isRenderInSortLayer(r)){
                continue;
            }
            if(s.config.orientation==SlotOrientation.Portrait){
                r.x = s.config.girdWidth/2;
                r.y = -(gapHeight) * (i - 1+fixIndex)-girdHeight/2;
                o.isIncline&&this.adjustItemIncline(r)
                o.isCurve&&this.adjustItemCurve(r);
            }else{
                r.y = -s.config.girdHeight/2;
                r.x = (s.config.gapWidth) * i-o.config.girdWidth/2;
            }
        }

    }

        /**
    * 重新设置有效渲染器，主要用于滚动介绍时零高度格子的坐标计算
    */
         public resetRenderPoints(): void {
            let s: JTScroller = this._scroller as JTScroller;
            let offset = this.scrollerGroup.itemOffsets[s.index]||cc.v2();
            let c: JTConfigGroup = s.config;

            for(let i=0;i<s.renders.length;i++){
                let r: JTItemRender = s.renders[i] as JTItemRender;

                
                let landscapeX = r.x;//c.girdWidth / 2;
                let landscapeY = -(i)*(c.girdHeight+c.gapYLandscape)-c.girdHeight/2;
                let portraitX = r.x;//c.girdWidth / 2;
                let portraitY = -(i)*(c.girdHeight+c.gapYPortrait)-c.girdHeight/2;

                let centerPointLandscape: cc.Vec2 = new cc.Vec2();
                let globalPointLandscape: cc.Vec2 = new cc.Vec2(landscapeX+s.pipeline.sourceXLandscape, landscapeY+s.pipeline.sourceYLandscape);
                let centerPointPortrait: cc.Vec2 = new cc.Vec2();
                let globalPointPortrait: cc.Vec2 = new cc.Vec2(portraitX+s.pipeline.sourceXPortrait, portraitY+s.pipeline.sourceYPortrait);
                let index = r.index;
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
    
    /**
     * 设置元素的倾斜
     * @param render 
     * @returns 
     */
    public adjustItemIncline(render:JTItemRender):number{
        let inclineDegrees = this.scrollerGroup.inclineDegrees;
        let inclineDegree = inclineDegrees[this.scroller.index];
        if(!inclineDegree){
            return;
        }
        let c = this.scrollerGroup.config;
        let g = 90 - inclineDegree;
        let y = this.scroller.y+render.y;
        let h = c.getHeight() - Math.abs(y);
        let offsetX = h*Math.atan(g/180*Math.PI);
        render.x += offsetX;
        render.skewX = g;
        //let scale = (90-Math.abs(g))/90;
        //render.scaleX = scale;
        return offsetX;
    }

    public getItemInclineProperty(y:number):{offsetX:number,skewX:number}{
        let inclineDegrees = this.scrollerGroup.inclineDegrees;
        let inclineDegree = inclineDegrees[this.scroller.index];
        if(!inclineDegree){
            return;
        }
        let c = this.scrollerGroup.config;
        let g = 90 - inclineDegree;
        y = this.scroller.y+y;
        let h = c.getHeight() - Math.abs(y);
        let offsetX = h*Math.atan(g/180*Math.PI);
        return {offsetX:offsetX,skewX:g};
    }


    public adjustItemCurve(render:JTItemRender):void{
        let s = this.scroller;
        let c = this.scrollerGroup.config;
        let curveDegrees = this.scrollerGroup.curveDegrees;
        let curveDegree = curveDegrees[s.index];
        if(!curveDegree||curveDegree==0){
            return;
        }
        let height = c.getHeight();
        let radius = 0.5*height/Math.sin(Math.abs(curveDegree)*0.5/180*Math.PI);
        let offset = this.scrollerGroup.itemOffsets[s.index]||cc.v2();
        let y = s.y+render.y+offset.y;
        let h = Math.abs(y + height*0.5);
        let d = Math.sqrt(radius*radius-h*h);
        let offsetX = curveDegree>0?radius-d:-(radius-d);
        let g = Math.asin(h/radius)/Math.PI*180;
        g *= y + height*0.5>0?1:-1;
        g *= curveDegree>0?1:-1;
        render.x += offsetX;
        render.skewX = g;
    }

}