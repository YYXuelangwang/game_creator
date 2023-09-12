

import JTRunning from "../../../com/plugins/procedure/JTRunning";
import JTScroller from "../../../com/JTScroller";
import JTScatterTask from "../../../rules/JTScatterTask";
import JTItemSkinLoader from "../../../com/base/JTItemSkinLoader";
import { SlotOrientation } from "../../../../SlotDefinitions/SlotEnum";
import JTChangeSpeedTask from "../../../rules/JTChangeSpeedTask";
import JTScrollingPipeline from "../scrolling/JTScrollingPipeline";
import BaseSpinSlotView from "../../../../MainView/BaseSpinSlotView";
import JTUnfixedLengthPipeline from "./JTUnfixedLengthPipeline";
import JTElementArrayList from "../../../com/datas/JTElementArrayList";
import JTConfigGroup from "../../../com/JTConfigGroup";

/*
* 
* 仅包含长条元素的滚轴滚动过程
*/

export default class JTRunUnfixedLength extends JTRunning {
    private timer: cc.Scheduler = cc.director.getScheduler();

    private isChangedTime: boolean = false;
    constructor() {
        super();
        this.timer = cc.director.getScheduler();
    }

    public running(): void {
        this._scroller.isRunning = true;
        this.scroller.adjustSkinRenders(true);
        let p = this._owner as JTUnfixedLengthPipeline;
        if(!p.extendScrollerInfo){
            this._scroller.time += this.scroller.endDelay;
        }
        this.timer.schedule(this.onEnterFrame, this, 0);

    }

    public continue():void{
        let s: JTScroller = this._scroller as JTScroller;

        s.runningTime = 0;
        s.changedTimes = 0;
    }

    public dataStandby():void{
        let s: JTScroller = this._scroller as JTScroller;

        s.runningTime = 0;
        s.changedTimes = 0;
        super.dataStandby();
    }

    public clear(): void {
        this.timer.unschedule(this.onEnterFrame, this);
    }

    private onEnterFrame(dt:number): void {
        let s: JTScroller = this._scroller as JTScroller;
        if (s == null || s.parent == null) {
            this.clear();
            return;
        }
        let p = this._owner as JTUnfixedLengthPipeline;
        let r: JTScatterTask = (this._owner as JTScrollingPipeline).scatterRule;
        let cs:JTChangeSpeedTask = (this._owner as JTScrollingPipeline).changeSpeed;
        if(!p.isPending&&this.isDataReady){
            s.runningTime += dt*1000;
        }
        if (r && r.onRunningSpeedUp(s)) return; //更新加速效果
        if (cs && cs.onRunningSpeedUp(s)) return; //更新加速效果
        this.isChangedTime = true;

        if(r&&!r.updateScatterTime(s)){
            this.isChangedTime = false;
        }

        if(cs&&!cs.updateTime(s)){
            this.isChangedTime = false;
        }

        let orientation = s.config.orientation;
        if(p.extendScrollerInfo){
            orientation = p.extendScrollerInfo.direction;
        }

        if(orientation == SlotOrientation.Portrait){
            s.y -= s.speed;
            this._scroller.speed > 0 ? this.scrollingDown() : this.scrollingUp();
        }else{
            s.x -= s.speed;
            this._scroller.speed > 0 ? this.scrollingLeft() : this.scrollingRight();
        }
        if (!this.isChangedTime) return;
        if (r && r.onRunningSlowdown(s)) return;//更新减速效果
        if (cs && cs.onRunningSlowdown(s)) return;//更新减速效果
        if (s.runningTime < s.time) return;
        if (s.changedTimes >= s.dataList.length){
            if(this.isDataReady){
                this.complete();
            }
        }
    }
    
    private scrollingUp(): void {
        let c = this.scrollerGroup.config;
        let s: JTScroller = this._scroller as JTScroller;
        let items: JTItemSkinLoader[] = s.items;

        let bottomY = items[items.length-1].y-items[items.length-1].height*0.5;
            if (s.y+bottomY>-c.getHeight())
            {
                let d = 0;
                for (let i = 0; i < items.length; i++) {
                    let lastElement = items[items.length-1] as BaseSpinSlotView;
                    let r: BaseSpinSlotView = items.shift() as BaseSpinSlotView;
                    items.push(r);
                    this.refreshRenders(r);
                    d += r.height+c.gapY;
                    r.y = lastElement.y - lastElement.height*0.5 - c.gapY - r.height*0.5;
                    r.x = r.width/2;
                    bottomY = r.y - r.height*0.5;
                    if(s.y+bottomY<=-c.getHeight()){
                        break;
                    }
                }
                for (let i: number = 0; i < items.length; i++) {
                    let rd: BaseSpinSlotView = items[i] as BaseSpinSlotView;
                    rd.y =  rd.y + d;
                }
                s.y -= d;
            }

    }

    private scrollingDown(): void {
        let c = this.scrollerGroup.config;
        let s: JTScroller = this._scroller as JTScroller;
        let items = s.items as BaseSpinSlotView[];

        let topY = items[0].y+items[0].height*0.5;
        
        if (s.y+topY<0)
        {
            let d = 0;
            for (let i = 0; i < items.length; i++) {
                let firstElement = items[0];
                let r = items.pop();
                items.unshift(r);
                this.refreshRenders(r);
                d += r.height+c.gapY;
                r.y = firstElement.y + firstElement.height*0.5 + c.gapY + r.height*0.5;
                topY = r.y + r.height*0.5;
                if(s.y+topY>=0){
                    break;
                }
            }
            for (let i: number = 0; i < items.length; i++) {
                let r = items[i] ;
                r.y =  r.y - d;
            }
            s.y += d;
        }
    }



    private scrollingLeft(): void {
        let s: JTScroller = this._scroller as JTScroller;
        let items: JTItemSkinLoader[] = s.items;

        let n = Math.floor(Math.abs(s.x-s.pipeline.sourceX) / s.config.gapWidth);
        let p = this.owner as JTUnfixedLengthPipeline;
        let es = p.extendScrollerInfo;
        let gap = es?es.gap:0;
        if (n >= 1) {
            for (let i = 0; i < n; i++) {
                let r: BaseSpinSlotView = items.shift() as BaseSpinSlotView;
                items.push(r);
                this.refreshRenders(r)
            }
            for (let i: number = 0; i < items.length; i++) {
                let rd: BaseSpinSlotView = items[i] as BaseSpinSlotView;
                rd.x = (s.config.gapWidth+gap)*i - s.config.girdWidth / 2;
            }
            s.x += s.config.gapWidth * n;
        }

        if(es.curveDegree){
            for (let i: number = 0; i < items.length; i++) {
                let rd: BaseSpinSlotView = items[i] as BaseSpinSlotView;
                rd.y = -s.config.girdHeight / 2;
                p.adjustExtendItemCurve(rd);
            }
        }
    }

    private scrollingRight(): void {

        let s: JTScroller = this._scroller as JTScroller;
        let items: JTItemSkinLoader[] = s.items;
        let n = Math.floor(Math.abs(s.x) / s.config.gapWidth);
        if (n >= 1) {
            for (let i = 0; i < n; i++) {
                let r: BaseSpinSlotView = items.pop() as BaseSpinSlotView;
                items.unshift(r);
                this.refreshRenders(r)
            }
            for (let i: number = 0; i < items.length; i++) {
                let rd: BaseSpinSlotView = items[i] as BaseSpinSlotView;
                rd.x = (s.config.gapWidth) *i - s.config.girdWidth / 2;
            }
            s.x -= s.config.gapWidth * n;
        }
    }

    private refreshRenders(r:BaseSpinSlotView):void{
        let s: JTScroller = this._scroller as JTScroller;
        let c: JTConfigGroup = s.config;

        if(s.runningTime < s.time){
            s.refreshRenders(r);
        }else{
            if (s.speed >= 0) {
                s.imageIndex += 1;
                if (s.imageIndex > s.sources.length - 1) {
                        s.imageIndex = 0;
                }
                if (s.changedTimes == 0) {
                        s.imageIndex = s.sources.length - (s.dataList.length);
                }
            }else {
                s.imageIndex -= 1;
                if (s.imageIndex < 0) {
                        s.imageIndex = s.sources.length - 1;
                }
                if (s.changedTimes == 0) {
                        s.imageIndex = s.sources.length - 1;
                }
            }
            let data = s.sources[s.imageIndex];
            let op = (s.dataProvider.grids as JTElementArrayList).occupyPosList;
            let shapes = (s.dataProvider.grids as JTElementArrayList).gridShapes;
        
            if(op.length==0){
                op = [];
                let len = c.row/shapes.length;
                for(let shape of shapes){
                    op.push({pos:shape,len:len});
                }
            }

            let isRender = (s.pipeline as JTUnfixedLengthPipeline).setRenderBeforeComplete(r);
            if(isRender){
                let index = s.speed>0?s.dataList.length-2-s.changedTimes:s.changedTimes-1;
                let row = op[index].len;
                let u = c.getUnfixedLengthItemConfig(data,row);
                r.realData = data;
                r.mixRow = row;
                if(u){
                    r.data = u.mapId;
                }else{
                    r.data = data;
                }
                r.height = c.girdHeight*row+c.gapY*(row-1);
                r.beforeRollComplete();
            }else{
                r.realData = s.sources[s.imageIndex];
                r.mixRow = 1;
                r.data = s.sources[s.imageIndex];

            }
            if (s.imageIndex > s.sources.length - 1) {
                    s.imageIndex = 0;
            }
            s.changedTimes += 1;
        }
    }



}