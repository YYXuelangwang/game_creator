import JTRunning from "../../../com/plugins/procedure/JTRunning";
import JTScroller from "../../../com/JTScroller";
import JTScatterTask from "../../../rules/JTScatterTask";
import JTItemSkinLoader from "../../../com/base/JTItemSkinLoader";
import { SlotOrientation } from "../../../../SlotDefinitions/SlotEnum";
import JTChangeSpeedTask from "../../../rules/JTChangeSpeedTask";
import JTScrollingPipeline from "../scrolling/JTScrollingPipeline";
import BaseSpinSlotView from "../../../../MainView/BaseSpinSlotView";
import JTScrollingColumnMixPipeline from "./JTScrollingColumnMixPipeline";

/*
* 
* 仅包含长条元素的滚轴滚动过程
*/

export default class JTRunColumnMixScrolling extends JTRunning {
    private timer: cc.Scheduler = cc.director.getScheduler();

    private isChangedTime: boolean = false;
    constructor() {
        super();
        this.timer = cc.director.getScheduler();
    }

    public running(): void {
        this._scroller.isRunning = true;
        this.scroller.adjustSkinRenders(true);
        this._scroller.time += this.scroller.endDelay;
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
        let p = this._owner as JTScrollingPipeline;
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

        if(s.config.orientation == SlotOrientation.Portrait){
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
        if (s.changedTimes >= s.config.row + 2){
            if(this.isDataReady){
                //处理bug = 3924 【滚轴】【偶现】滚轴停止后较大概率出现图案变动( 出现的原因就是有时候 s.y的值出现了比较大的偏差，暂设置固定Y值 s.y = 0处理;)
                s.y = 0;
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
                    s.refreshRenders(r);
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

        let p = this._owner as JTScrollingColumnMixPipeline;

        let topY = items[0].y+items[0].height*0.5;
        
        if (s.y+topY<0)
        {
            let d = 0;
            for (let i = 0; i < items.length; i++) {
                let firstElement = items[0];
                let r = items.pop();
                items.unshift(r);
                s.refreshRenders(r);
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
            this.adjustBeforeOver();
        }
    }



    private scrollingLeft(): void {
        let s: JTScroller = this._scroller as JTScroller;
        let items: JTItemSkinLoader[] = s.items;
        let n = Math.floor(Math.abs(s.x) / s.config.gapWidth);

        if (n >= 1) {
            for (let i = 0; i < n; i++) {
                let r: BaseSpinSlotView = items.shift() as BaseSpinSlotView;
                items.push(r);
                s.refreshRenders(r)
            }
            for (let i: number = 0; i < items.length; i++) {
                let rd: BaseSpinSlotView = items[i] as BaseSpinSlotView;
                rd.x = (s.config.gapWidth)*i - s.config.girdWidth / 2;
            }
            s.x += s.config.gapWidth * n;
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
                s.refreshRenders(r)
            }
            for (let i: number = 0; i < items.length; i++) {
                let rd: BaseSpinSlotView = items[i] as BaseSpinSlotView;
                rd.x = (s.config.gapWidth) *i - s.config.girdWidth / 2;
            }
            s.x -= s.config.gapWidth * n;
        }
    }

    private adjustBeforeOver():void{
        let s: JTScroller = this._scroller as JTScroller;
        let c = s.config;
        if (s.runningTime < s.time) return;
        if (s.changedTimes==1 || s.changedTimes>=c.row+2) return;
        let sources = s.sources;
        let index = s.imageIndex;
        let data = sources[index];
        console.log(s.index,s.imageIndex,s.changedTimes,s.time,s.runningTime);

        if(!c.isMixElement(data)) return;
        if(s.speed>0){
              let n = 0
              for(let i=index+1;i<sources.length;i++){
                  if(sources[i]==data){
                       n++;
                  }else{
                      break;
                  }
              }
              console.log("add ",n)
              s.imageIndex +=n;
              s.changedTimes +=n;
        }else{
            let n = 0
            for(let i=index-1;i>=0;i--){
                if(sources[i]==data){
                     n++;
                }else{
                    break;
                }
            }
            s.imageIndex -=n;
            s.changedTimes +=n;
        }


    }


}