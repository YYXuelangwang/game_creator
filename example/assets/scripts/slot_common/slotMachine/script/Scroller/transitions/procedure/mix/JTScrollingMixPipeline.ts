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
import JTMixItemConfig from "../../../extensions/JTMixItemConfig";
import BaseSpinSlotView, { SpinSlotHiddenSection } from "../../../../MainView/BaseSpinSlotView";
import JTArrayCollection from "../../../com/datas/JTArrayCollection";
import JTElementCollection from "../../../com/datas/JTElementCollection";
import JTScrollingMixPipelinePlugin from "./JTScrollingMixPipelinePlugin";

/*
* name;
*/
export default class JTScrollingMixPipeline extends JTScheduledPipeline {
    public lineTime: cc.Tween = null;
    public scatterRule: JTScatterTask = null;
    public dynamicWild: JTDynamicWildTask = null;
    public onceWild: JTOnceWildTask = null;
    public changeSpeed:JTChangeSpeedTask = null;

    public mixConfig:JTMixItemConfig[] = [];

    private elements:number[]= [];

    public mixElements:number[] = [];

    public plugin:JTScrollingMixPipelinePlugin = null;

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
        let d = this.scrollerGroup.dataProvider as JTArrayCollection;
        //let source = d.elements[this.scroller.index] as JTElementCollection;
        //let elements = source.refDataList;
        let c = this.scrollerGroup.config;
        let m = this.scrollerGroup.config.mixConfig;
        let elements = this.scrollerGroup.defaultImageIds;
        for(let r of m){
            this.mixElements.push(r.id);
        }
        for(let s of elements){
            if(this.mixElements.includes(s)){
                continue;
            }
            this.elements.push(s);
        }


        for(let i=0;i<c.row;i++){
            let index: number = this.getCounterIndex();
            this._indexs.push(index);
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
        this.plugin.start(this.scroller.index);
    }

    public onDataStandBy():void{
        //if (this.scatterRule) this.scatterRule.setupScatterTime(this.scroller);
        this.plugin.dataStandby(this.scroller.index);
        if(this.scatterRule){
            this.scatterRule.setupScatterTime(this.scroller);
        }
    }

    public setTaskPending():void{
        super.setTaskPending();
        this.plugin.isPending = true;
    }

    public clear(): void {
        super.clear();
        this.plugin.callClear(this.scroller.index);

        if(this.lineTime)
        {
            this.lineTime.stop();
            this.lineTime=null ;
        }

    }

    public updateRenders(): void {
        this.plugin.resetRenderParent()
        this.lineTimeComplete();
        let overRunning: JTTask = this.getOption(JTOptionType.OPTION_OVER_RUNNING);
        overRunning.handler && overRunning.handler.apply(overRunning.caller, [this._scroller]);
        this.onceWild && this.onceWild.callWatchWild(this._scroller);
    }


    public lineTimeComplete(useChangeData:boolean=false): void {
        let s: JTScroller = this._scroller;
        let c = s.config;
        s.renders.length = 0;
        let dataIndex = 1;
        let renderIndex = 1;
        let curLenght = 0;
        let curentY = 0;
        let isSetFirstRender = false;
        let extraIndex = 0;
        while(curLenght<c.row){
            let dataList = useChangeData?this.changedDataList:this.dataList;
            let data = dataList[dataIndex];
            let changedData = this.changedDataList[dataIndex];
            let render = s.items[renderIndex] as BaseSpinSlotView;
            let m = c.getMixElementConfig(data);
            if(m){
                let showLength = this.getMixItemFixLength(dataIndex,data,dataList);
                showLength = Math.min(showLength,m.row);
                let mixHeight = c.girdHeight*m.row+c.gapY*(m.row-1);
                let mixWidth = c.girdWidth*m.column+c.gapX*(m.column-1);
                if(!isSetFirstRender){
                    curentY = (m.row - showLength)*c.gapHeight;
                    let firstRender = s.items[0] as BaseSpinSlotView;
                    firstRender.data = this.plugin.getExtraElement(s.index,extraIndex++);//this.getRandomId();
                    firstRender.changedData = changedData;
                    firstRender.x = firstRender.width * 0.5;
                    firstRender.y = curentY + firstRender.height*0.5+c.gapY;
                    isSetFirstRender = true;
                }
                if(this.isMixAcrossColumnGrid(data,dataIndex,m.column,useChangeData)){
                    curentY -= mixHeight + c.gapY ;
                    dataIndex += showLength;
                    curLenght += showLength;
                    continue;
                }
                render.y = curentY - mixHeight*0.5;
                render.x = mixWidth/2;
                render.index = this.indexs[curLenght];
                render.visibleRow = showLength;
                if(showLength<m.row){
                    render.hiddenSection = dataIndex==1?SpinSlotHiddenSection.Top:SpinSlotHiddenSection.Bottom;
                }else{
                    render.hiddenSection = SpinSlotHiddenSection.None
                }
                render.mixIndexs = this.getMixIndexs(render.index,showLength,m.column);
                curentY -= mixHeight + c.gapY ;
                dataIndex += showLength;
                curLenght += showLength;
                render.data = data;
                render.changedData = changedData;
                s.renders.push(render);
            }else{
                if(!isSetFirstRender){
                    let firstRender = s.items[0] as BaseSpinSlotView;
                    firstRender.data = this.plugin.getExtraElement(s.index,extraIndex++);//this.getRandomId();
                    firstRender.changedData = firstRender.data;
                    firstRender.x = firstRender.width * 0.5;
                    firstRender.y = curentY + firstRender.height*0.5+c.gapY;
                    isSetFirstRender = true;
                }
                render.mixIndexs = [];
                render.data = data;
                render.changedData = changedData;
                render.y = curentY - c.girdHeight*0.5;
                render.x = c.girdWidth / 2;
                render.index = this.indexs[curLenght]
                curentY -= c.gapHeight;
                dataIndex ++;
                curLenght ++;
                s.renders.push(render);
            }
            render.active = true;
            renderIndex ++ ;
        }
        for(let i = renderIndex;i<c.row+2;i++){
            let render = s.items[i] as BaseSpinSlotView;
            render.data = this.plugin.getExtraElement(s.index,extraIndex++);//this.getRandomId();
            render.changedData = render.data;
            render.y = curentY - render.height*0.5;
            render.x = render.width / 2;
            curentY -= c.gapHeight;
        }

        this.resetRenderPoints();
        s.adjustSkinRenders(false);

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
        let c: JTConfigGroup = s.config;

        for(let i=0;i<s.renders.length;i++){
            let r: BaseSpinSlotView = s.renders[i] as BaseSpinSlotView;
            
            let indexs = r.mixIndexs.length>0?r.mixIndexs:[r.index];
            
            for(let index of indexs){
                let landscapeX = r.width / 2;
                let landscapeY = r.y;
                let portraitX = r.width / 2;
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
    }


    public setupRender(render: BaseSpinSlotView, p: JTLayoutPoint): void {
        let s: JTScroller = this._scroller as JTScroller;
        let r: BaseSpinSlotView = render as BaseSpinSlotView;        
        this._scroller.renders.push(r);
        r.name = "render_"+r.index
        this._renders.push(r);
        let indexs = r.mixIndexs.length>0?r.mixIndexs:[r.index];
        for(let i=0;i<indexs.length;i++){
            let index: number = indexs[i];
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

    }


    public setupStaticRenderPoint():void{
        let s: JTScroller = this._scroller as JTScroller;
        let c = s.config;
        for (let i: number = 0; i < this.indexs.length; i++) {
            let index = this.indexs[i];
            let centerPointLandscape = cc.v2(c.girdWidth+s.pipeline.sourceXLandscape,-i*(c.girdHeight+c.gapYLandscape)+s.pipeline.sourceYLandscape);
            let centerPointPortrait = cc.v2(c.girdWidth+s.pipeline.sourceXPortrait,-i*(c.girdHeight+c.gapYPortrait)+s.pipeline.sourceYPortrait);

            this._scrollerGroup.staticCenterMapLandscape[index] = centerPointLandscape;
            this._scrollerGroup.staticCenterMapPortrait[index] = centerPointPortrait;
        }
    }

    public getRandomId():number{
        let source = this.elements;
        let index:number = Math.floor(Math.random() * source.length);
        return source[index];
    }
    
    /**
     * 获取元素实际显示长度
     * @param start 
     * @param data 
     * @param list 
     * @returns 
     */
    public getMixItemFixLength(start:number,data:number,list:number[]):number{
        let length = 0;
        for(let i=start;i<list.length-1;i++){
            if(list[i]==data){
                length++;
            }else{
                break;
            }
        }
        return length;
    } 

    public isMixAcrossColumnScroller(useChangeData:boolean=false):boolean{
        let o = this.scrollerGroup;
        let col = this.scroller.index;
        let list = useChangeData?o.changedDataList:o.dataList;
        let c = o.config;
        for(let i=1;i<this.dataList.length-1;i++){
            let data = this.dataList[i];
            let m = c.getMixElementConfig(data);
            if(m&&m.column>1){
                if(col>0&&list[col-1][i]==data){
                    return true;
                }
                if(col<c.col-1&&list[col+1][i]==data){
                    return true;
                }
            }
        }

        return false

    }


    public isMixAcrossColumnGrid(data:number,row:number,colCount:number,useChangeData:boolean=false):boolean{
        let o = this.scrollerGroup;
        let col = this.scroller.index;
        if(col==0||colCount<2){
            return false;
        }

        let index = 0;
        let list = useChangeData?o.changedDataList:o.dataList;
        while(index<list.length-1){
            let dataList = list[index];
            if(dataList[row]==data){
                if(col==index){
                    return false;
                }
                if(col>index&&col<=index+colCount-1){
                    return true;
                }

                index += colCount;
             }else{
                index ++
             }
        }

        return false;
    }

    public getMixIndexs(start:number,row:number,col:number):number[]{
        let o = this.scrollerGroup;
        let c = o.config;
        let indexs = [];
        for(let i=0;i<col;i++){
            for(let j=0;j<row;j++){
                let index = start+i*c.row + j;
                indexs.push(index);
            }
        }
        return indexs;
    }

}
