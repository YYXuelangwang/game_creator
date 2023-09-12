/*
* name;
*/
import JTRunning from "../../../com/plugins/procedure/JTRunning";
import JTScroller from "../../../com/JTScroller";
import JTItemRender from "../../../com/base/JTItemRender";
import JTConfigGroup from "../../../com/JTConfigGroup";
import JTItemSkinLoader from "../../../com/base/JTItemSkinLoader";
import JTScatterTask from "../../../rules/JTScatterTask";
import JTAnomalyPipeline from "./JTAnomalyPipeline";
import { SlotOrientation } from "../../../../SlotDefinitions/SlotEnum";
import JTChangeSpeedTask from "../../../rules/JTChangeSpeedTask";
import JTScrollerGroup from "../../../com/JTScrollerGroup";
export default class JTRunAnomaly extends JTRunning
{
    private timer:cc.Scheduler = null;

    private isChangedTime:boolean = false;

    private dataListType:number = JTScrollerGroup.USE_CONVERT_TO_LIST;
    constructor()
    {
        super();
        this.timer = cc.director.getScheduler();
    }

    public running():void
    {
        this._scroller.isRunning = true;
        this._scroller.time += this.scroller.endDelay;
        this.timer.schedule(this.onEnterFrame,this,0);

        this.dataListType = this.scrollerGroup.channelPipeline.getTemplate(this._scroller.index).dataListType;
    }

    public clear():void
    {
        this.timer.unschedule(this.onEnterFrame,this);
    }

    public dataStandby():void{
        let s: JTScroller = this._scroller as JTScroller;
        super.dataStandby();
        s.runningTime = 0;
    }

    protected onEnterFrame(dt:number):void
    {

            let s:JTScroller = this._scroller as JTScroller;

            if(s==null  || s.parent==null ) 
            {
                this.clear();
                return ;
            } 
            let cs:JTChangeSpeedTask = (this._owner as JTAnomalyPipeline).changeSpeed;

            let r: JTScatterTask = (this._owner as JTAnomalyPipeline).scatterRule;
            s.runningTime += dt*1000;//s.defaultFrameRateTime;
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
            if ((this.dataListType==JTScrollerGroup.USE_CONVERT_TO_LIST&&s.changedTimes >= s.config.row)
                ||(s.changedTimes >= s.config.row+2)){
                if(this.isDataReady){
                        this.complete();
                }
            }
    }

    public scrollingDown():void
    {
            let s:JTScroller = this._scroller as JTScroller;
            let items:JTItemSkinLoader[] = s.items
            if (s.y <= -s.config.gapHeight)
            {

                    let r:JTItemRender = items.pop() as JTItemRender;
                    items.unshift(r);
                    s.refreshRenders(r,true);

                    let currentY:number = 0;
                    for (let i:number = 0; i < items.length; i++)
                    {
                            let r:JTItemRender = s.items[i] as JTItemRender;
                            if (i == 0 && r.data != 0)
                            {
                                    currentY = s.config.gapHeight / 2;
                            }
                            r.y = currentY;
                            currentY += -r.height;
                    }
                    s.y += s.config.gapHeight;
            }
    }

    public scrollingUp():void
    {
            let s:JTScroller = this._scroller as JTScroller;
            let items:JTItemSkinLoader[] = s.items;
           if (s.y >= s.config.gapHeight)
            {
 
                    let r:JTItemRender = items.shift() as JTItemRender;
                    items.push(r)
                    s.refreshRenders(r,true);
                    let currentY:number = 0;
                    let c:JTConfigGroup = s.config;
                    for (let i:number = 0; i < items.length; i++)
                    {
                            let r:JTItemRender = s.items[i] as JTItemRender;
                            if (i == 0 && r.data != 0)
                            {
                                    currentY = -s.config.gapHeight / 2;
                            }
                            r.y = currentY - c.girdHeight / 4;
                            currentY += -r.height;
                    }
                    s.y -= s.config.gapHeight;
            }
        
    }

    public scrollingLeft():void
    {
        let s:JTScroller = this._scroller as JTScroller;

        let items:JTItemSkinLoader[] = s.items;
        if (Math.abs(s.x) >= s.config.gapWidth)
        {
                let r:JTItemRender = items.shift() as JTItemRender;
                items.push(r)
                s.refreshRenders(r,true);

                let currentX:number = s.config.gapWidth;
                for (let i:number = 0; i < items.length; i++)
                {
                        let r:JTItemRender = s.items[i] as JTItemRender;
                        if (i == 0 && r.data != 0)
                        {
                                currentX = s.config.gapWidth / 2;
                        }
                        r.x = currentX - s.config.girdWidth / 4;
                        currentX += r.width;
                }
                s.x += s.config.gapWidth;
        }
      }

        public scrollingRight():void
        {
            let s:JTScroller = this._scroller as JTScroller;

            let items:JTItemSkinLoader[] = s.items;
            if (Math.abs(s.x) >= s.config.gapWidth)
            {
                    let r:JTItemRender = items.pop() as JTItemRender;
                    items.unshift(r)
                    s.refreshRenders(r,true);

                    let currentX:number = s.config.gapWidth;
                    for (let i:number = 0; i < items.length; i++)
                    {
                            let r:JTItemRender = s.items[i] as JTItemRender;
                            if (i == 0 && r.data != 0)
                            {
                                    currentX = s.config.gapWidth / 2;
                            }
                            r.x = currentX - s.config.girdWidth / 4;
                            currentX += r.width;
                    }
                    s.x -= s.config.gapWidth;
            }
       }

}