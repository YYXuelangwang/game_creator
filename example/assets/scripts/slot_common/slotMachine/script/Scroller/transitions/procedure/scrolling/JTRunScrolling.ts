import JTRunning from "../../../com/plugins/procedure/JTRunning";
import JTScroller from "../../../com/JTScroller";
import JTScatterTask from "../../../rules/JTScatterTask";
import JTItemRender from "../../../com/base/JTItemRender";
import JTScrollingPipeline from "./JTScrollingPipeline";
import JTItemSkinLoader from "../../../com/base/JTItemSkinLoader";
import { SlotOrientation } from "../../../../SlotDefinitions/SlotEnum";
import JTCombineTask, { JTCombineState } from "../../../rules/JTCombineTask";
import JTChangeSpeedTask from "../../../rules/JTChangeSpeedTask";
import JTScrollerGroup from "../../../com/JTScrollerGroup";
import BaseSpinSlotView from "../../../../MainView/BaseSpinSlotView";

/*
* name;
*/
export default class JTRunScrolling extends JTRunning {
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

    public continue(): void {
        let s: JTScroller = this._scroller as JTScroller;

        s.runningTime = 0;
        s.changedTimes = 0;
    }

    public dataStandby(): void {
        let s: JTScroller = this._scroller as JTScroller;

        s.runningTime = 0;
        s.changedTimes = 0;
        super.dataStandby();
    }

    public clear(): void {
        this.timer.unschedule(this.onEnterFrame, this);
    }

    private onEnterFrame(dt: number): void {
        let s: JTScroller = this._scroller as JTScroller;
        if (s == null || s.parent == null) {
            this.clear();
            return;
        }
        let p = this._owner as JTScrollingPipeline;
        let r: JTScatterTask = (this._owner as JTScrollingPipeline).scatterRule;
        let c: JTCombineTask = (this._owner as JTScrollingPipeline).combineRule;
        let cs: JTChangeSpeedTask = (this._owner as JTScrollingPipeline).changeSpeed;
        if (c && c.combineState == JTCombineState.Stay) {
            r = null;
        }
        if (!p.isPending && this.isDataReady) {
            s.runningTime += dt * 1000;
        }
        //!p.isPending&&(s.runningTime += dt*1000);

        if (r && r.onRunningSpeedUp(s)) return; //更新加速效果
        if (cs && cs.onRunningSpeedUp(s)) return; //更新加速效果
        this.isChangedTime = true;
        //if (r) this.isChangedTime = r.updateScatterTime(s);

        if (r && !r.updateScatterTime(s)) {
            this.isChangedTime = false;
        }

        if (cs && !cs.updateTime(s)) {
            this.isChangedTime = false;
        }

        if (s.config.orientation == SlotOrientation.Portrait) {
            s.y -= s.speed;
            this._scroller.speed > 0 ? this.scrollingDown() : this.scrollingUp();
        } else {
            s.x -= s.speed;
            this._scroller.speed > 0 ? this.scrollingLeft() : this.scrollingRight();
        }
        if (!this.isChangedTime) return;
        if (r && r.onRunningSlowdown(s)) return;//更新减速效果
        if (cs && cs.onRunningSlowdown(s)) return;//更新减速效果
        if (s.runningTime < s.time) return;
        if (s.changedTimes >= s.config.row + 2) {
            if (this.isDataReady) {
                this.complete();
            }
        }
    }


    private scrollingUp(): void {
        let c = (this._owner as JTScrollingPipeline).getConfig();
        let s: JTScroller = this._scroller as JTScroller;
        let items: JTItemSkinLoader[] = s.items;
        let o: JTScrollerGroup = s.owner as JTScrollerGroup;

        let gapHeight = c.gapHeight;
        let girdHeight = c.girdHeight;


        let n = Math.floor(Math.abs(s.y) / gapHeight);
        if (n >= 1) {
            for (let i = 0; i < n; i++) {
                let r: JTItemRender = items.shift() as JTItemRender;
                items.push(r);
                s.refreshRenders(r)
            }
            for (let i: number = 0; i < items.length; i++) {
                let rd: JTItemRender = items[i] as JTItemRender;
                rd.y = -(gapHeight) * (i - 1) - girdHeight / 2;
            }
            s.y -= gapHeight * n;
        }

        if (o.isIncline) {
            let pipeline = this._owner as JTScrollingPipeline;
            for (let i: number = 0; i < items.length; i++) {
                let rd: JTItemRender = items[i] as JTItemRender;
                rd.x = s.config.girdWidth / 2;
                pipeline.adjustItemIncline(rd);
            }
        }

        if (o.isCurve) {
            let pipeline = this._owner as JTScrollingPipeline;
            for (let i: number = 0; i < items.length; i++) {
                let rd: JTItemRender = items[i] as JTItemRender;
                rd.x = s.config.girdWidth / 2;
                pipeline.adjustItemCurve(rd);
            }
        }

    }

    private scrollingDown(): void {
        let c = (this._owner as JTScrollingPipeline).getConfig();
        let s: JTScroller = this._scroller as JTScroller;
        let items: JTItemSkinLoader[] = s.items;
        let o: JTScrollerGroup = s.owner as JTScrollerGroup;

        let gapHeight = c.gapHeight;
        let girdHeight = c.girdHeight;

        let n = Math.floor(Math.abs(s.y) / gapHeight);
        if (n >= 1) {
            for (let i = 0; i < n; i++) {
                let r: JTItemRender = items.pop() as JTItemRender;
                items.unshift(r);
                s.refreshRenders(r);
            }
            for (let i: number = 0; i < items.length; i++) {
                let rd: JTItemRender = items[i] as JTItemRender;
                rd.y = -(gapHeight) * (i - 1) - girdHeight / 2;
            }
            s.y += gapHeight * n;
        }
        if (o.isIncline) {
            let pipeline = this._owner as JTScrollingPipeline;
            for (let i: number = 0; i < items.length; i++) {
                let rd: JTItemRender = items[i] as JTItemRender;
                rd.x = s.config.girdWidth / 2;
                pipeline.adjustItemIncline(rd);
            }
        }

        if (o.isCurve) {
            let pipeline = this._owner as JTScrollingPipeline;
            for (let i: number = 0; i < items.length; i++) {
                let rd: JTItemRender = items[i] as JTItemRender;
                rd.x = s.config.girdWidth / 2;
                pipeline.adjustItemCurve(rd);
            }
        }

    }

    private scrollingLeft(): void {
        let s: JTScroller = this._scroller as JTScroller;
        let items: JTItemSkinLoader[] = s.items;
        let n = Math.floor(Math.abs(s.x) / s.config.gapWidth);

        if (n >= 1) {
            for (let i = 0; i < n; i++) {
                let r: JTItemRender = items.shift() as JTItemRender;
                items.push(r);
                s.refreshRenders(r)
            }
            for (let i: number = 0; i < items.length; i++) {
                let rd: JTItemRender = items[i] as JTItemRender;
                rd.x = (s.config.gapWidth) * i - s.config.girdWidth / 2;
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
                let r: JTItemRender = items.pop() as JTItemRender;
                items.unshift(r);
                s.refreshRenders(r)
            }
            for (let i: number = 0; i < items.length; i++) {
                let rd: JTItemRender = items[i] as JTItemRender;
                rd.x = (s.config.gapWidth) * i - s.config.girdWidth / 2;
            }
            s.x -= s.config.gapWidth * n;
        }
    }
}